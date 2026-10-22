export function getSummary(db) {
  const sales = db.prepare(`SELECT COUNT(*) AS ordenes_completadas,
    COALESCE(SUM(total),0) AS ingresos,
    COALESCE(ROUND(AVG(total)),0) AS ticket_promedio
    FROM ordenes WHERE estado IN ('pagada','enviada','entregada')`).get();
  const count = db.prepare('SELECT COUNT(*) AS total FROM productos').get().total;
  const clients = db.prepare('SELECT COUNT(*) AS total FROM clientes').get().total;
  const byCategory = db.prepare(`SELECT p.categoria,SUM(oi.cantidad) AS unidades,
    SUM(oi.cantidad*oi.precio_unitario) AS ingresos_brutos
    FROM orden_items oi JOIN productos p ON p.id=oi.producto_id
    JOIN ordenes o ON o.id=oi.orden_id
    WHERE o.estado IN ('pagada','enviada','entregada')
    GROUP BY p.categoria ORDER BY ingresos_brutos DESC`).all();
  const top = db.prepare(`SELECT p.id,p.nombre,SUM(oi.cantidad) AS vendidos
    FROM orden_items oi JOIN productos p ON p.id=oi.producto_id
    JOIN ordenes o ON o.id=oi.orden_id
    WHERE o.estado IN ('pagada','enviada','entregada')
    GROUP BY p.id,p.nombre ORDER BY vendidos DESC,p.nombre ASC LIMIT 3`).all();
  const states = db.prepare('SELECT estado,COUNT(*) AS cantidad FROM ordenes GROUP BY estado').all();
  const lowStock = db.prepare('SELECT id,nombre,stock FROM productos WHERE stock<=10 ORDER BY stock ASC').all();
  return {
    ...sales,
    productos: count,
    clientes: clients,
    ventas_categoria: byCategory,
    top_productos: top,
    ordenes_estado: states,
    alertas_stock: lowStock,
    envio_gratis_desde: 60000
  };
}

