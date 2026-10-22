import { fail, integer, nonEmpty, positiveId, presentOr, requireObject } from '../errors.js';

function productInput(body, previous = {}) {
  requireObject(body);
  const nombre = nonEmpty(presentOr(body.nombre, previous.nombre), 'Nombre del producto', 3);
  const descripcion = presentOr(body.descripcion, previous.descripcion ?? '');
  if (typeof descripcion !== 'string') fail(400, 'La descripción debe ser texto.');
  const precio = integer(presentOr(body.precio, previous.precio), 'Precio', 1);
  const stock = integer(presentOr(body.stock, previous.stock ?? 0), 'Stock');
  const categoria = nonEmpty(presentOr(body.categoria, previous.categoria), 'Categoría');
  const destacado = presentOr(body.destacado, previous.destacado ?? 0);
  if (![true, false, 0, 1].includes(destacado)) fail(400, 'Destacado debe ser verdadero o falso.');
  return { nombre, descripcion: descripcion.trim(), precio, stock, categoria, destacado: Number(Boolean(destacado)) };
}

function clientInput(db, body, previous = {}) {
  requireObject(body);
  const nombre = nonEmpty(presentOr(body.nombre, previous.nombre), 'Nombre', 2);
  const email = nonEmpty(presentOr(body.email, previous.email), 'Correo').toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fail(400, 'Correo electrónico inválido.');
  const ciudad = nonEmpty(presentOr(body.ciudad, previous.ciudad), 'Ciudad');
  if (!db.prepare('SELECT ciudad FROM ciudades_envio WHERE ciudad = ?').get(ciudad)) fail(400, 'La ciudad no tiene una tarifa de envío configurada.');
  return { nombre, email, ciudad };
}

function couponInput(body, previous = {}) {
  requireObject(body);
  const codigo = nonEmpty(presentOr(body.codigo, previous.codigo), 'Código del cupón', 3).toUpperCase();
  const porcentaje = integer(presentOr(body.porcentaje, previous.porcentaje), 'Porcentaje', 1);
  if (porcentaje > 90) fail(400, 'Porcentaje máximo permitido: 90.');
  const vigente_hasta = nonEmpty(presentOr(body.vigente_hasta, previous.vigente_hasta), 'Fecha de vigencia');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(vigente_hasta) || Number.isNaN(Date.parse(vigente_hasta + 'T00:00:00Z')) || new Date(vigente_hasta + 'T00:00:00Z').toISOString().slice(0,10) !== vigente_hasta) fail(400, 'La vigencia debe tener formato AAAA-MM-DD y ser una fecha real.');
  const usos_maximos = integer(presentOr(body.usos_maximos, previous.usos_maximos), 'Usos máximos', 1);
  const activo = presentOr(body.activo, previous.activo ?? 1);
  if (![true, false, 0, 1].includes(activo)) fail(400, 'Activo debe ser verdadero o falso.');
  return { codigo, porcentaje, vigente_hasta, usos_maximos, activo: Number(Boolean(activo)) };
}

export function listProducts(db, query = {}) {
  const clauses = [];
  const args = [];
  if (query.q) { clauses.push('(nombre LIKE ? OR descripcion LIKE ?)'); args.push(`%${query.q}%`, `%${query.q}%`); }
  if (query.categoria) { clauses.push('categoria = ?'); args.push(query.categoria); }
  if (query.disponible === '1') clauses.push('stock > 0');
  const order = {
    'precio_asc': 'precio ASC', 'precio_desc': 'precio DESC',
    'nombre': 'nombre COLLATE NOCASE ASC', 'recientes': 'id DESC'
  }[query.orden || 'recientes'];
  if (!order) fail(400, 'Criterio de ordenamiento desconocido.');
  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  return db.prepare(`SELECT * FROM productos ${where} ORDER BY ${order}`).all(...args);
}

export function getProduct(db, value) {
  const id = positiveId(value);
  const product = db.prepare('SELECT * FROM productos WHERE id = ?').get(id);
  if (!product) fail(404, 'Producto no encontrado.');
  return {
    ...product,
    ventas: db.prepare(`SELECT COALESCE(SUM(oi.cantidad),0) AS cantidad FROM orden_items oi
      JOIN ordenes o ON o.id = oi.orden_id WHERE oi.producto_id = ? AND o.estado IN ('pagada','enviada','entregada')`).get(id).cantidad
  };
}

export function createProduct(db, body) {
  const p = productInput(body);
  const result = db.prepare(`INSERT INTO productos (nombre, descripcion, precio, stock, categoria, destacado)
    VALUES (?, ?, ?, ?, ?, ?)`).run(p.nombre, p.descripcion, p.precio, p.stock, p.categoria, p.destacado);
  return getProduct(db, Number(result.lastInsertRowid));
}

export function updateProduct(db, idValue, body) {
  const old = getProduct(db, idValue);
  const p = productInput(body, old);
  db.prepare(`UPDATE productos SET nombre=?, descripcion=?, precio=?, stock=?, categoria=?, destacado=? WHERE id=?`)
    .run(p.nombre, p.descripcion, p.precio, p.stock, p.categoria, p.destacado, old.id);
  return getProduct(db, old.id);
}

export function deleteProduct(db, value) {
  const old = getProduct(db, value);
  const used = db.prepare('SELECT id FROM orden_items WHERE producto_id=? LIMIT 1').get(old.id);
  if (used) fail(409, 'No se puede eliminar un producto incluido en órdenes históricas.');
  db.prepare('DELETE FROM productos WHERE id=?').run(old.id);
  return { eliminado: true, id: old.id };
}

export function listClients(db) {
  return db.prepare(`SELECT c.*, COUNT(o.id) AS ordenes FROM clientes c
    LEFT JOIN ordenes o ON o.cliente_id=c.id GROUP BY c.id ORDER BY c.id DESC`).all();
}

export function getClient(db, value) {
  const client = db.prepare('SELECT * FROM clientes WHERE id=?').get(positiveId(value));
  if (!client) fail(404, 'Cliente no encontrado.');
  return client;
}

export function createClient(db, body) {
  const c = clientInput(db, body);
  if (db.prepare('SELECT id FROM clientes WHERE email=?').get(c.email)) fail(409, 'Este correo ya está registrado.');
  const result = db.prepare('INSERT INTO clientes (nombre,email,ciudad) VALUES (?,?,?)').run(c.nombre,c.email,c.ciudad);
  return getClient(db, Number(result.lastInsertRowid));
}

export function updateClient(db, value, body) {
  const previous = getClient(db,value);
  const c = clientInput(db, body, previous);
  if (db.prepare('SELECT id FROM clientes WHERE email=? AND id<>?').get(c.email,previous.id)) fail(409, 'Este correo ya pertenece a otro cliente.');
  db.prepare('UPDATE clientes SET nombre=?,email=?,ciudad=? WHERE id=?').run(c.nombre,c.email,c.ciudad,previous.id);
  return getClient(db, previous.id);
}

export function deleteClient(db, value) {
  const previous = getClient(db,value);
  if (db.prepare('SELECT id FROM ordenes WHERE cliente_id=? LIMIT 1').get(previous.id)) fail(409,'No se puede eliminar un cliente con historial de órdenes.');
  db.prepare('DELETE FROM clientes WHERE id=?').run(previous.id);
  return { eliminado: true, id: previous.id };
}

export function listCoupons(db) {
  return db.prepare(`SELECT c.*, COUNT(u.id) AS usos_actuales FROM cupones c
    LEFT JOIN cupon_usos u ON u.cupon_id=c.id GROUP BY c.id ORDER BY c.id DESC`).all();
}

export function getCoupon(db, value) {
  const coupon = listCoupons(db).find(c => c.id === positiveId(value));
  if (!coupon) fail(404, 'Cupón no encontrado.');
  return coupon;
}

export function createCoupon(db, body) {
  const c = couponInput(body);
  if (db.prepare('SELECT id FROM cupones WHERE codigo=?').get(c.codigo)) fail(409, 'El código ya existe.');
  const result = db.prepare('INSERT INTO cupones (codigo,porcentaje,vigente_hasta,usos_maximos,activo) VALUES (?,?,?,?,?)')
    .run(c.codigo,c.porcentaje,c.vigente_hasta,c.usos_maximos,c.activo);
  return getCoupon(db, Number(result.lastInsertRowid));
}

export function updateCoupon(db, value, body) {
  const prev = getCoupon(db,value);
  const c = couponInput(body,prev);
  if (c.usos_maximos < prev.usos_actuales) fail(409, 'El límite no puede ser menor que los usos registrados.');
  if (db.prepare('SELECT id FROM cupones WHERE codigo=? AND id<>?').get(c.codigo,prev.id)) fail(409,'El código ya existe.');
  db.prepare('UPDATE cupones SET codigo=?, porcentaje=?, vigente_hasta=?, usos_maximos=?, activo=? WHERE id=?')
    .run(c.codigo,c.porcentaje,c.vigente_hasta,c.usos_maximos,c.activo,prev.id);
  return getCoupon(db,prev.id);
}

export function deleteCoupon(db, value) {
  const c = getCoupon(db,value);
  if (db.prepare('SELECT id FROM ordenes WHERE cupon_id=? LIMIT 1').get(c.id)) fail(409, 'No se puede eliminar un cupón usado en órdenes.');
  db.prepare('DELETE FROM cupones WHERE id=?').run(c.id);
  return { eliminado: true,id:c.id };
}

