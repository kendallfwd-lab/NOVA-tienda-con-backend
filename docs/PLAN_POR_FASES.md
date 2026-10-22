# Plan ejecutado por fases — NOVA / SUPPLY

## Fase 1 — Día 1: diseño y base de datos

**Objetivo:** definir el dominio y persistir datos en relaciones reales.

- [x] Elegir caso 5.
- [x] Modelar productos, clientes, órdenes, ítems, cupones, uso de cupones y ciudades de envío.
- [x] Definir PK/FK, UNIQUE, CHECK y NOT NULL.
- [x] Crear schema.sql con las tablas.
- [x] Crear seed.sql con productos, clientes, cupones, ciudades y ventas de ejemplo.
- [x] Diagrama entidad-relación en README.

**Comprobación:** el servidor crea la base local y GET /api/productos devuelve registros.

## Fase 2 — Día 1: API REST y lógica comercial

- [x] Express con carpetas routes/controllers/services.
- [x] CRUD completo de productos, clientes y cupones.
- [x] Detalle relacionado de órdenes.
- [x] HTTP 200, 201, 400, 404 y 409 con errores JSON.
- [x] Validaciones del backend.
- [x] Envío según ciudad y envío gratis desde ₡60.000 postdescuento.
- [x] Stock comprobado al crear y al confirmar.
- [x] Cupón vigente, no agotado y sin doble uso por cliente.
- [x] Máquina de estados, cancelación y reposición de inventario.
- [x] Transacciones SQL y rollback completo.
- [x] Endpoint /api/resumen con COUNT, SUM, AVG y GROUP BY.

**Comprobación:** npm test y colección Postman. Para el checkpoint debes guardar capturas tuyas de Postman (incluye 400, 404, 409) y un commit.

## Fase 3 — Día 2: frontend React

- [x] React y Vite con Router.
- [x] Siete vistas de navegación.
- [x] Catalogo con búsqueda, filtro, orden y disponibilidad.
- [x] services/api.js y useFetch con loading/error/data.
- [x] Formularios controlados, edición, creación y eliminación con confirmación.
- [x] Errores de negocio visibles en la interfaz.
- [x] Carrito y flujo de pedido.
- [x] Dashboard con datos SQL del backend.
- [x] Componentes reutilizables y diseño responsivo.

**Comprobación:** npm run build, navegación y creación de una orden desde el navegador.

## Fase 4 — Día 2: AI Agent n8n

- [x] Export JSON sin credenciales.
- [x] Webhook POST.
- [x] Lectura HTTP de productos desde la API real.
- [x] AI Agent conectado a modelo de chat y Calculator.
- [x] Salida con contrato ok/data/error.
- [x] Integración de la pantalla React a webhook configurable.
- [x] Modo local de demostración por reglas diferenciado de IA.
- [ ] **Pendiente del estudiante:** importar el workflow y seleccionar credencial real.
- [ ] **Pendiente del estudiante:** configurar URL API según n8n npm, Docker o Cloud.
- [ ] **Pendiente del estudiante:** ejecutar workflow con un modelo real y comprobar respuesta de React.

## Fase 5 — Entrega y defensa

- [x] README con instalación, endpoints, reglas, E/R, pruebas y guion.
- [x] Bitácora de IA con siete registros de diseño y correcciones.
- [x] Colección Postman exportable.
- [x] Código fuente y scripts SQL.
- [x] Tests automáticos de backend y workflow.
- [ ] Personalizar el nombre del estudiante en la bitácora.
- [ ] Capturas de pruebas y del workflow en ejecución.
- [ ] Presentación individual en clase.

**Nota:** los checks de código indican trabajo implementado. Los checks docentes pendientes requieren evidencias tomadas en tu entorno de trabajo.

