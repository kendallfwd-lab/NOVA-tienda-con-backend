import { fail, positiveId, requireObject } from '../errors.js';

// Modo local determinista para demostrar la UI cuando aún no se configuró n8n.
// NO sustituye el workflow AI Agent obligatorio.
export function localDemo(db, body) {
  requireObject(body);
  if (body.tipo === 'descripcion') {
    const product = db.prepare('SELECT * FROM productos WHERE id=?').get(positiveId(body.producto_id,'Producto'));
    if (!product) fail(404,'Producto no encontrado.');
    return {
      modo: 'demo-reglas',
      titulo: `Conoce ${product.nombre}`,
      descripcion: `${product.nombre} combina una propuesta práctica de ${product.categoria.toLowerCase()} con una experiencia de uso sencilla. ${product.descripcion} Disponible por ₡${product.precio.toLocaleString('es-CR')}.`
    };
  }
  if (body.tipo === 'recomendaciones') {
    const ids = Array.isArray(body.carrito) ? body.carrito.map(Number).filter(Number.isSafeInteger) : [];
    const first = ids.length ? db.prepare('SELECT categoria FROM productos WHERE id=?').get(ids[0]) : null;
    const similar = first
      ? db.prepare('SELECT id,nombre,precio FROM productos WHERE categoria=? AND stock>0 ORDER BY destacado DESC,id ASC').all(first.categoria)
      : db.prepare('SELECT id,nombre,precio FROM productos WHERE stock>0 ORDER BY destacado DESC,id ASC').all();
    return { modo: 'demo-reglas', recomendaciones: similar.filter(p=>!ids.includes(p.id)).slice(0,3), motivo: 'Productos disponibles relacionados con tu selección.' };
  }
  fail(400,'Tipo de sugerencia desconocido.');
}

