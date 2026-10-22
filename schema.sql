PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS productos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL CHECK(length(trim(nombre)) >= 3),
  descripcion TEXT NOT NULL DEFAULT '',
  precio INTEGER NOT NULL CHECK(precio > 0),
  stock INTEGER NOT NULL DEFAULT 0 CHECK(stock >= 0),
  categoria TEXT NOT NULL CHECK(length(trim(categoria)) > 0),
  destacado INTEGER NOT NULL DEFAULT 0 CHECK(destacado IN (0,1)),
  creado_en TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS ciudades_envio (
  ciudad TEXT PRIMARY KEY,
  costo INTEGER NOT NULL CHECK(costo >= 0)
);

CREATE TABLE IF NOT EXISTS clientes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL CHECK(length(trim(nombre)) >= 2),
  email TEXT NOT NULL UNIQUE CHECK(instr(email, '@') > 1),
  ciudad TEXT NOT NULL REFERENCES ciudades_envio(ciudad),
  creado_en TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS cupones (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  codigo TEXT NOT NULL UNIQUE CHECK(length(trim(codigo)) >= 3),
  porcentaje INTEGER NOT NULL CHECK(porcentaje BETWEEN 1 AND 90),
  vigente_hasta TEXT NOT NULL,
  usos_maximos INTEGER NOT NULL CHECK(usos_maximos > 0),
  activo INTEGER NOT NULL DEFAULT 1 CHECK(activo IN (0,1))
);

CREATE TABLE IF NOT EXISTS ordenes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cliente_id INTEGER NOT NULL REFERENCES clientes(id) ON DELETE RESTRICT,
  cupon_id INTEGER REFERENCES cupones(id) ON DELETE RESTRICT,
  estado TEXT NOT NULL DEFAULT 'nueva'
    CHECK(estado IN ('nueva','pagada','enviada','entregada','cancelada')),
  fecha TEXT NOT NULL DEFAULT (datetime('now')),
  fecha_pago TEXT,
  subtotal INTEGER NOT NULL CHECK(subtotal >= 0),
  descuento INTEGER NOT NULL DEFAULT 0 CHECK(descuento >= 0),
  envio INTEGER NOT NULL CHECK(envio >= 0),
  total INTEGER NOT NULL CHECK(total >= 0),
  ciudad_envio TEXT NOT NULL,
  CHECK(total = subtotal - descuento + envio)
);

CREATE TABLE IF NOT EXISTS orden_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  orden_id INTEGER NOT NULL REFERENCES ordenes(id) ON DELETE CASCADE,
  producto_id INTEGER NOT NULL REFERENCES productos(id) ON DELETE RESTRICT,
  cantidad INTEGER NOT NULL CHECK(cantidad > 0),
  precio_unitario INTEGER NOT NULL CHECK(precio_unitario > 0),
  UNIQUE(orden_id, producto_id)
);

CREATE TABLE IF NOT EXISTS cupon_usos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cupon_id INTEGER NOT NULL REFERENCES cupones(id) ON DELETE RESTRICT,
  cliente_id INTEGER NOT NULL REFERENCES clientes(id) ON DELETE RESTRICT,
  orden_id INTEGER NOT NULL UNIQUE REFERENCES ordenes(id) ON DELETE RESTRICT,
  utilizado_en TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(cupon_id, cliente_id)
);

CREATE INDEX IF NOT EXISTS idx_ordenes_cliente_estado ON ordenes(cliente_id, estado);
CREATE INDEX IF NOT EXISTS idx_orden_items_producto ON orden_items(producto_id);
CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos(categoria);

