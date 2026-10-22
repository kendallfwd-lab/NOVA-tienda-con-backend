# NOVA / SUPPLY — Laboratorio #2

**Caso 5: Tienda online con inventario, cupones y envíos.**

Aplicación educativa **individual** que integra base de datos relacional SQLite, API REST Express por capas, React con Router y un workflow n8n con **AI Agent**. Precios expresados en **colones costarricenses (CRC)**, enteros sin decimales.

> Este proyecto demuestra operaciones comerciales: **no implementa pasarela de pago, autenticación de usuarios ni envíos reales**. No lo publiques como tienda productiva sin controles de autenticación/autorización, HTTPS y protección de webhooks.

## 1. Requisitos previos

- Node.js **22.13 o superior** (usa la API nativa node:sqlite).
- npm.
- Postman para importar la colección incluida.
- n8n local, Docker o Cloud para probar el AI Agent. El modelo de chat necesita **tu propia credencial**, que no está en los archivos entregados.

## 2. Iniciar desde cero

Ubícate en la carpeta raíz del ZIP descomprimido y ejecuta:

~~~bash
npm run setup
~~~

Opcional: copia backend/.env.example a backend/.env y frontend/.env.example a frontend/.env. Si no creas los archivos, los valores locales por defecto funcionan para API, web y modo de sugerencias por reglas.

En **dos terminales distintas**, dentro de la raíz:

~~~bash
# Terminal 1
npm run dev:api
~~~

~~~bash
# Terminal 2
npm run dev:web
~~~

- **Tienda:** http://localhost:5173
- **API:** http://localhost:3001/api/health
- **Métricas:** http://localhost:3001/api/resumen

El puerto de la API lo determina `PORT` en `backend/.env` (si no está definido, usa 3001). La web usa el proxy de Vite: deja `VITE_API_URL=/api` y configura `API_PROXY_TARGET` con la dirección del backend. En esta configuración local, `API_PROXY_TARGET=http://localhost:3002`; abre `http://localhost:3002/api/health` para comprobar la API y configura la variable `baseUrl` de Postman como `http://localhost:3002/api`. Si cambias el puerto, actualiza `PORT` y `API_PROXY_TARGET`, y reinicia los servidores. El proxy evita errores CORS aunque Vite use otro puerto disponible.

La base de datos backend/data/tienda.sqlite se crea automáticamente al primer inicio usando schema.sql y seed.sql. Al reiniciar conserva modificaciones. Para reiniciar datos, **detén el servidor y mueve el archivo SQLite a un nombre de respaldo**; en el próximo inicio se recrearán los datos originales.

Para ejecutar pruebas:

~~~bash
npm test
npm run build
~~~

## 3. Organización y arquitectura

~~~text
backend/src/
  routes/api.js                  Rutas REST
  controllers/                  Solicitudes y respuestas
  services/catalog.js           CRUD y validaciones
  services/orders.js            Pedidos, cupones, transacciones
  services/metrics.js           Agregaciones SQL
  services/ai-demo.js           Reglas locales (NO un LLM)
  db.js                         Conexión SQLite y seed
  app.js                        Express, CORS, errores HTTP
frontend/src/
  pages/                        7 vistas React Router
  components/                   Tarjetas y estados reutilizables
  hooks/useFetch.js             Hook datos/cargando/error
  services/api.js               Capa única de peticiones
  context/CartContext.jsx       Carrito local
n8n/NOVA_AI_AGENT_WORKFLOW.json
postman/NOVA_Lab2.postman_collection.json
schema.sql, seed.sql, BITACORA_IA.md
~~~

~~~mermaid
erDiagram
  ciudades_envio ||--o{ clientes : aplica_tarifa
  clientes ||--o{ ordenes : realiza
  cupones o|--o{ ordenes : descuento
  ordenes ||--|{ orden_items : contiene
  productos ||--o{ orden_items : vendido
  cupones ||--o{ cupon_usos : registra
  clientes ||--o{ cupon_usos : consume
  ordenes ||--o| cupon_usos : confirma
~~~

Las **7 tablas** usan claves primarias/foráneas, NOT NULL, CHECK, unicidad e índices. Los productos tienen stock no negativo y precios positivos, los ítems cantidades positivas y los cupones porcentaje entre 1 y 90.

## 4. Reglas de negocio del caso 5

1. **Stock.** Al crear una orden se verifican las unidades y al confirmar pago se comprueba nuevamente. La confirmación descuenta el stock en la misma transacción que actualiza la orden.
2. **Envío.** Ciudad del cliente con tarifas en ciudades_envio. Gratis cuando el subtotal después de descuento es **mayor o igual a ₡60.000**. El servidor calcula todo: nunca acepta un total del frontend.
3. **Cupones.** No aplican si el código no existe, venció, está desactivado, se agotó o el cliente ya lo usó. Se validan de nuevo al confirmar el pago.
4. **Estados.** nueva → pagada → enviada → entregada. Solo nueva o pagada pueden cambiar a cancelada. Cancelar una pagada repone stock.
5. **Histórico.** Cada ítem guarda el precio unitario de compra. Productos/clientes usados en órdenes no se pueden eliminar.
6. **Cupón tras cancelación.** Un cupón consumido al pagar permanece consumido aunque se cancele, regla deliberada para prevenir reutilización.
7. **Cálculos.** Descuentos redondeados al colón con Math.round; precios y costos de envío guardados como snapshots.
8. **Resumen SQL.** Solo las órdenes pagada/enviada/entregada cuentan como ventas. El dashboard calcula ingresos, ticket promedio, ventas por categoría, top 3 y estados.

### Transacción de pago

~~~mermaid
flowchart TD
  A[Orden nueva] --> B[BEGIN IMMEDIATE]
  B --> C{Stock y cupón válidos?}
  C -- Sí --> D[Descontar stock y registrar cupón]
  D --> E[Marcar pagada]
  E --> F[COMMIT]
  C -- No --> G[ROLLBACK y HTTP 409]
~~~

## 5. Endpoints de la API

| Recurso | Rutas |
|---|---|
| Productos | GET /api/productos, GET /api/productos/:id, POST /api/productos, PUT/PATCH /api/productos/:id, DELETE /api/productos/:id |
| Clientes | GET /api/clientes, GET /api/clientes/:id, POST /api/clientes, PUT/PATCH /api/clientes/:id, DELETE /api/clientes/:id |
| Cupones | GET /api/cupones, GET /api/cupones/:id, POST /api/cupones, PUT/PATCH /api/cupones/:id, DELETE /api/cupones/:id |
| Órdenes | GET /api/ordenes, GET /api/ordenes/:id, POST /api/ordenes, PATCH /api/ordenes/:id/estado |
| Auxiliares | GET /api/ciudades, GET /api/categorias, GET /api/resumen, GET /api/health |
| Demostración local | POST /api/ia/demo (reglas deterministas, **NO LLM**) |

**Búsqueda, filtros y orden:** GET /api/productos?q=mouse&categoria=Computación&orden=precio_asc&disponible=1.

**Crear orden:**

~~~http
POST http://localhost:3001/api/ordenes
Content-Type: application/json
~~~

~~~json
{
  "cliente_id": 2,
  "cupon": "TECH15",
  "items": [{"producto_id": 1, "cantidad": 1}]
}
~~~

**Confirmar pago simulado:**

~~~http
PATCH http://localhost:3001/api/ordenes/4/estado
Content-Type: application/json
~~~

~~~json
{"estado": "pagada"}
~~~

Usa el **ID real devuelto por POST**, que puede ser distinto de 4. Los errores tienen formato {"error":"mensaje"} y códigos 400 (datos inválidos), 404 (no encontrado), 409 (conflicto). Éxitos GET/PUT/PATCH/DELETE con 200 y POST con 201.

## 6. Interfaz React

| Vista | Dirección | Función |
|---|---|---|
| Colección | / | Catálogo, búsqueda, filtro por categoría, disponibilidad y orden |
| Producto | /producto/:id | Detalle con datos de ventas relacionados |
| Carrito | /carrito | Cantidades, cliente, cupón y creación de pedido |
| Pedidos | /pedidos | Detalle relacionado, pago simulado, estados y cancelación |
| Dashboard | /metricas | Gráficos y cifras SQL reales de GET /api/resumen |
| Gestión | /gestion | CRUD de productos, clientes y cupones |
| Asistente | /asistente | Descripción de producto y recomendaciones con n8n |

El custom hook src/hooks/useFetch.js controla data/loading/error; src/services/api.js maneja todas las peticiones de React y transforma errores en mensajes visibles. Los formularios son controlados y muestran errores 400/409.

## 7. Configurar AI Agent en n8n

**Este paso necesita intervención en TU n8n.** El ZIP no incluye credencial ni afirma haber ejecutado un LLM.

1. Abre n8n (habitualmente http://localhost:5678).
2. En Workflows, usa **Import from File** e importa n8n/NOVA_AI_AGENT_WORKFLOW.json.
3. Abre **OpenAI Chat Model (AGREGAR CREDENCIAL)**, elige un modelo compatible (el export usa gpt-4o-mini inicialmente) y configura tu credencial **en n8n**, nunca en el JSON.
4. En **API - Leer catalogo (CONFIGURAR URL)** ajusta:
   - n8n npm en el mismo equipo: `http://localhost:<PORT>/api/productos`.
   - n8n Docker, API ejecutada en el host: `http://host.docker.internal:<PORT>/api/productos`.
   - n8n Cloud: publicar una URL HTTPS de la API accesible desde la nube. localhost no funciona en n8n Cloud.

   Sustituye `<PORT>` por el valor de `PORT` en `backend/.env`; en esta configuración local es `3002`.
5. Enciende la API y verifica que HTTP Request devuelve productos.
6. En Webhook elige **Listen for test event** y manda POST con Postman a su Test URL:

   ~~~json
   {"tipo":"descripcion","producto_id":1}
   ~~~

   O para recomendaciones:

   ~~~json
   {"tipo":"recomendaciones","carrito":[1,5]}
   ~~~

7. Confirma que AI Agent se ejecuta y Respond to Webhook devuelve:

   ~~~json
   {
     "ok":true,
     "data":{"modo":"n8n-ai-agent","tipo":"descripcion","respuesta":"Texto real del agente..."},
     "error":null
   }
   ~~~

8. Activa/publica el workflow y copia su **Production URL** (no la Test URL).
9. En frontend/.env configura VITE_N8N_WEBHOOK_URL.

   Para desarrollo local con n8n en el puerto 5678, usa el proxy Vite del proyecto para evitar CORS:

   ~~~dotenv
   VITE_N8N_WEBHOOK_URL=/n8n/webhook/nova-asistente
   ~~~

   Reinicia Vite tras cambiar el archivo. vite.config.js pasa /n8n a http://localhost:5678. Para frontend público necesitas URL HTTPS pública y configuración de CORS/proxy seguros.

10. En /asistente, **URL CONFIGURADA** indica que hay una URL escrita; tras una respuesta válida aparecerá **N8N CONECTADO** y, si la petición falla, **N8N CON ERROR**. Genera una descripción y unas recomendaciones para comprobar el workflow real.

**Modo local:** si no hay VITE_N8N_WEBHOOK_URL, la UI utiliza POST /api/ia/demo, que responde mediante reglas locales, **no con IA**. El requisito docente de AI Agent se valida al ejecutar el workflow real con credencial y capturar la evidencia.

Documentación oficial: [AI Agent](https://docs.n8n.io/integrations/builtin/cluster-nodes/root-nodes/n8n-nodes-langchain.agent) y [Respond to Webhook](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.respondtowebhook).

## 8. Postman y pruebas

Importa postman/NOVA_Lab2.postman_collection.json. La colección prueba 200, 201, 400, 404, 409; CRUD, transiciones y conflictos. La variable `baseUrl` viene configurada como `http://localhost:3002/api` para esta configuración local; cámbiala si el `PORT` de tu backend es diferente.

Ejecuta **npm test** para pruebas automatizadas, que usan SQLite **en memoria** de forma independiente y no contaminan datos reales.

### Pruebas que debes mostrar al profesor

1. GET /api/productos trae datos SQL.
2. Crear (201), editar (200) y eliminar (200) un producto.
3. Enviar datos inválidos: 400.
4. Consultar un ID inexistente: 404.
5. Pedir cantidad superior al stock: 409.
6. Crear orden, confirmar pago y comprobar reducción del stock.
7. Cancelar orden pagada y comprobar reposición del stock.
8. Intentar cancelar una orden enviada: 409.
9. Aplicar un cupón y demostrar que el mismo cliente no puede reutilizarlo.
10. Abrir dashboard con métricas SQL actualizadas.
11. Ejecutar n8n con AI Agent y mostrar el resultado en React.

## 9. Guion para defensa individual

1. **30 s:** caso y tecnologías.
2. **45 s:** diagrama E/R, foráneas y restricciones.
3. **90 s:** CRUD completo de productos o clientes.
4. **90 s:** crear orden, confirmar, comprobar stock, cancelar y comprobar reposición.
5. **45 s:** forzar 409 por stock o estado incompatible.
6. **30 s:** dashboard y SUM, COUNT, GROUP BY.
7. **60 s:** ejecutar workflow n8n y mostrar JSON.

Explica por qué el frontend no puede fijar precios ni descuentos; el backend consulta SQLite y valida en transacciones.

## 10. Entrega / checkpoint

- [x] Backend Express + SQLite por capas.
- [x] Frontend React Router, formularios controlados, hook y servicios.
- [x] schema.sql y seed.sql con datos relacionados.
- [x] Workflow AI Agent exportado sin credenciales.
- [x] Colección Postman.
- [x] README.md y BITACORA_IA.md.
- [x] Pruebas automáticas de API y estructura n8n.
- [ ] Capturas de Postman del checkpoint (se toman en el PC del estudiante).
- [ ] Credencial propia y ejecución del AI Agent en n8n real.
- [ ] Demo y defensa individual en clase.

**No hay node_modules, credenciales, .env o base personal dentro del ZIP.** Tras descomprimir, ejecuta npm run setup.
