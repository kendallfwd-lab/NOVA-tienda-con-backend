import { fail, integer, positiveId, requireObject, transaction } from '../errors.js';

export const ENVIO_GRATIS_DESDE = 60000;
const estados = ['nueva', 'pagada', 'enviada', 'entregada', 'cancelada'];

function couponFor(db, codigo, clienteId) {
  if (!codigo) return null;
  if (typeof codigo !== 'string') fail(400, 'El cupón debe ser texto.');
  const c = db.prepare('SELECT * FROM cupones WHERE codigo=?').get(codigo.trim().toUpperCase());
  if (!c) fail(409, 'El cupón indicado no existe.');
  if (!c.activo) fail(409, 'Este cupón está desactivado.');
  if (c.vigente_hasta < new Date().toISOString().slice(0, 10)) fail(409, 'El cupón está vencido.');
  const usos = db.prepare('SELECT COUNT(*) AS total FROM cupon_usos WHERE cupon_id=?').get(c.id).total;
  if (usos >= c.usos_maximos) fail(409, 'El cupón agotó su número de usos.');
  if (db.prepare('SELECT id FROM cupon_usos WHERE cupon_id=? AND cliente_id=?').get(c.id, clienteId)) {
    fail(409, 'Este cliente ya usó el cupón.');
  }
  return c;
}

export function listOrders(db, { estado } = {}) {
  if (estado && !estados.includes(estado)) fail(400,'Estado de orden desconocido.');
  return db.prepare(`SELECT o.*,c.nombre AS cliente_nombre,c.email AS cliente_email,
    (SELECT COUNT(*) FROM orden_items oi WHERE oi.orden_id=o.id) AS productos,
    cp.codigo AS cupon_codigo
    FROM ordenes o JOIN clientes c ON c.id=o.cliente_id
    LEFT JOIN cupones cp ON cp.id=o.cupon_id
    WHERE (? IS NULL OR o.estado=?) ORDER BY o.id DESC`).all(estado || null,estado || null);
}

export function getOrder(db, value) {
  const id = positiveId(value,'ID de orden');
  const order = db.prepare(`SELECT o.*,c.nombre AS cliente_nombre,c.email AS cliente_email,
    cp.codigo AS cupon_codigo,cp.porcentaje AS cupon_porcentaje
    FROM ordenes o JOIN clientes c ON c.id=o.cliente_id
    LEFT JOIN cupones cp ON cp.id=o.cupon_id WHERE o.id=?`).get(id);
  if (!order) fail(404,'Orden no encontrada.');
  order.items = db.prepare(`SELECT oi.*,p.nombre AS producto_nombre,p.categoria FROM orden_items oi
    JOIN productos p ON p.id=oi.producto_id WHERE oi.orden_id=?`).all(id);
  return order;
}

export function createOrder(db, body) {
  requireObject(body);
  const clienteId = positiveId(body.cliente_id,'Cliente');
  if (!Array.isArray(body.items) || body.items.length === 0) fail(400, 'Agrega al menos un producto.');
  const ids = new Set();
  const requestItems = body.items.map(i => {
    requireObject(i);
    const producto_id = positiveId(i.producto_id,'Producto');
    const cantidad = integer(i.cantidad,'Cantidad',1);
    if (ids.has(producto_id)) fail(400,'Un producto no puede repetirse en la orden.');
    ids.add(producto_id);
    return { producto_id, cantidad };
  });
  return transaction(db, () => {
    const client = db.prepare('SELECT * FROM clientes WHERE id=?').get(clienteId);
    if (!client) fail(404,'Cliente no encontrado.');
    const shipping = db.prepare('SELECT costo FROM ciudades_envio WHERE ciudad=?').get(client.ciudad);
    if (!shipping) fail(400,'No hay tarifa de envío para este cliente.');
    const items = requestItems.map(item => {
      const product = db.prepare('SELECT * FROM productos WHERE id=?').get(item.producto_id);
      if (!product) fail(404,`Producto ${item.producto_id} no encontrado.`);
      if (product.stock < item.cantidad) fail(409,`Stock insuficiente para ${product.nombre}; disponibles: ${product.stock}.`);
      return { ...item, precio_unitario: product.precio };
    });
    const coupon = couponFor(db,body.cupon ?? null,clienteId);
    const subtotal = items.reduce((sum,i)=>sum+i.cantidad*i.precio_unitario,0);
    const descuento = coupon ? Math.round(subtotal*coupon.porcentaje/100) : 0;
    const envio = subtotal - descuento >= ENVIO_GRATIS_DESDE ? 0 : shipping.costo;
    const total = subtotal - descuento + envio;
    const result = db.prepare(`INSERT INTO ordenes
      (cliente_id,cupon_id,subtotal,descuento,envio,total,ciudad_envio)
      VALUES (?,?,?,?,?,?,?)`).run(clienteId,coupon?.id ?? null,subtotal,descuento,envio,total,client.ciudad);
    const orderId = Number(result.lastInsertRowid);
    for (const item of items) db.prepare(`INSERT INTO orden_items
      (orden_id,producto_id,cantidad,precio_unitario) VALUES (?,?,?,?)`)
      .run(orderId,item.producto_id,item.cantidad,item.precio_unitario);
    return getOrder(db,orderId);
  });
}

export function setOrderStatus(db, value, body) {
  requireObject(body);
  const id = positiveId(value,'ID de orden');
  const next = body.estado;
  if (!estados.includes(next)) fail(400,`Estado inválido. Usa: ${estados.join(', ')}.`);
  return transaction(db, () => {
    const order = getOrder(db,id);
    const allowed = {
      nueva: ['pagada','cancelada'],
      pagada: ['enviada','cancelada'],
      enviada: ['entregada'],
      entregada: [],
      cancelada: []
    };
    if (!allowed[order.estado].includes(next)) fail(409,`No se permite cambiar de ${order.estado} a ${next}.`);
    if (next === 'pagada') {
      // La confirmación (simulada, no pasarela de pago) es la única transición que resta inventario.
      for (const item of order.items) {
        const result = db.prepare('UPDATE productos SET stock=stock-? WHERE id=? AND stock>=?')
          .run(item.cantidad,item.producto_id,item.cantidad);
        if (!result.changes) fail(409,`Stock insuficiente para ${item.producto_nombre}. Operación revertida.`);
      }
      if (order.cupon_id) {
        const coupon = db.prepare('SELECT * FROM cupones WHERE id=?').get(order.cupon_id);
        const valid = couponFor(db,coupon.codigo,order.cliente_id);
        if (valid.id !== coupon.id) fail(409,'Cupón inválido.');
        db.prepare('INSERT INTO cupon_usos (cupon_id,cliente_id,orden_id) VALUES (?,?,?)')
          .run(coupon.id,order.cliente_id,id);
      }
      db.prepare('UPDATE ordenes SET estado=?,fecha_pago=datetime(\'now\') WHERE id=?').run(next,id);
    } else {
      if (next === 'cancelada' && order.estado === 'pagada') {
        for (const item of order.items) db.prepare('UPDATE productos SET stock=stock+? WHERE id=?')
          .run(item.cantidad,item.producto_id);
      }
      db.prepare('UPDATE ordenes SET estado=? WHERE id=?').run(next,id);
    }
    return getOrder(db,id);
  });
}

