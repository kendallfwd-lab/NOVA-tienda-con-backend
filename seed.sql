INSERT INTO ciudades_envio (ciudad, costo) VALUES
('San José', 3500), ('Puntarenas', 4000), ('Alajuela', 4000),
('Heredia', 3500), ('Cartago', 4200), ('Limón', 6000), ('Liberia', 5500);

INSERT INTO productos (nombre, descripcion, precio, stock, categoria, destacado) VALUES
('Auriculares AURA One', 'Audio inalámbrico, cancelación pasiva y estuche de carga con diseño ligero.', 32500, 28, 'Audio', 1),
('Auriculares STUDIO Max', 'Sonido envolvente y almohadillas cómodas para sesiones largas.', 78500, 13, 'Audio', 1),
('Parlante PORT Mini', 'Parlante portátil compacto con conexión Bluetooth y autonomía extendida.', 24900, 19, 'Audio', 0),
('Teclado LINE 75', 'Teclado mecánico compacto de 75 teclas con iluminación regulable.', 42900, 16, 'Computación', 1),
('Mouse FLOW Pro', 'Mouse ergonómico de precisión con conectividad dual.', 19500, 38, 'Computación', 0),
('Base ORBIT USB-C', 'Hub de aluminio con puertos USB-C, USB-A y salida HDMI.', 28900, 22, 'Accesorios', 0),
('Cargador VOLT 65W', 'Cargador rápido USB-C con protección térmica y dos puertos.', 16900, 47, 'Accesorios', 1),
('Powerbank LOOP 10K', 'Batería portátil de 10 000 mAh con carga por USB-C.', 21900, 34, 'Accesorios', 0),
('Lámpara HALO Desk', 'Lámpara LED de escritorio con temperatura de color ajustable.', 25900, 12, 'Hogar inteligente', 0),
('Reloj PULSE Fit', 'Monitor de actividad con pantalla táctil y múltiples deportes.', 54900, 18, 'Hogar inteligente', 1),
('Soporte ARC Laptop', 'Soporte plegable de aluminio para portátiles de hasta 16 pulgadas.', 18500, 31, 'Computación', 0),
('Cámara VISTA Home', 'Cámara Wi-Fi doméstica con visión nocturna y detección de movimiento.', 38900, 8, 'Hogar inteligente', 0);

INSERT INTO clientes (nombre, email, ciudad) VALUES
('Sofía Mora', 'sofia@example.com', 'San José'),
('Daniel Vargas', 'daniel@example.com', 'Puntarenas'),
('Valeria Solís', 'valeria@example.com', 'Heredia'),
('Andrés Rojas', 'andres@example.com', 'Alajuela'),
('Camila Jiménez', 'camila@example.com', 'Cartago');

INSERT INTO cupones (codigo, porcentaje, vigente_hasta, usos_maximos, activo) VALUES
('BIENVENIDA10', 10, '2099-12-31', 30, 1),
('TECH15', 15, '2099-12-31', 10, 1),
('EXPIRADO20', 20, '2020-01-01', 5, 1),
('SINUSOS', 25, '2099-12-31', 1, 0);

-- Historial realista para demostrar las métricas desde el primer inicio.
INSERT INTO ordenes (cliente_id, cupon_id, estado, fecha, fecha_pago, subtotal, descuento, envio, total, ciudad_envio)
VALUES
(1, NULL, 'entregada', datetime('now','-6 days'), datetime('now','-6 days'), 78500, 0, 0, 78500, 'San José'),
(2, NULL, 'enviada', datetime('now','-3 days'), datetime('now','-3 days'), 39000, 0, 4000, 43000, 'Puntarenas'),
(3, 1, 'pagada', datetime('now','-1 days'), datetime('now','-1 days'), 75400, 7540, 0, 67860, 'Heredia');

INSERT INTO orden_items (orden_id, producto_id, cantidad, precio_unitario) VALUES
(1, 2, 1, 78500), (2, 5, 2, 19500),
(3, 1, 1, 32500), (3, 4, 1, 42900);

INSERT INTO cupon_usos (cupon_id, cliente_id, orden_id) VALUES (1, 3, 3);

