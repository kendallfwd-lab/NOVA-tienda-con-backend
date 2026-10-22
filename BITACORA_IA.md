# Bitácora de IA — Laboratorio #2

**Proyecto:** NOVA / SUPPLY — Caso 5, tienda online.

**Estudiante:** completa tu nombre antes de entregar.

**Asistencia:** ChatGPT/Codex en el diseño, implementación y revisión. El profesor permite IA, pero exige comprender y defender todo el código.

> Transparencia: los prompts de diseño indicados abajo son **instrucciones reproducibles de trabajo** que explican el proceso, no citas literales de mensajes del estudiante. La petición literal aparece primero. Añade tus propios prompts reales, respuestas y pruebas cuando trabajes con otra IA.

## 1. Solicitud real

**Prompt literal:** «Vamos a desarrollar el caso 5 (Tienda online) del Laboratorio #2. Comienza por la fase 1 y construye el proyecto funcional por fases, con backend, base de datos, frontend React, agente n8n, pruebas y documentación. Al finalizar entrégame un ZIP completo. Respeta todos los requisitos del PDF».

**Resultado:** proyecto completo con API, React, SQL, workflow, tests y documentación.

**Revisión:** se contrastaron los requisitos del documento y se distinguió claramente AI Agent real de demostración local determinista.

## 2. Modelo de datos

**Prompt de diseño reproducible:** «Diseña un modelo relacional para productos, clientes, órdenes, ítems y cupones; agrega ciudades de envío y seguimiento de uso de cupones. Incluye claves, FKs, UNIQUE, CHECK y datos de prueba».

**Resultado:** schema.sql y seed.sql, con siete tablas relacionadas.

**Corrección:** órdenes históricas guardan precio unitario; se protege la eliminación de productos o clientes referenciados.

## 3. Transacciones

**Prompt de diseño reproducible:** «En Express, implementa creación y confirmación de órdenes, calcula precios y envíos en el servidor, usa BEGIN/COMMIT/ROLLBACK y responde 409 ante stock insuficiente o cupones inválidos».

**Resultado:** backend/src/services/orders.js.

**Corrección:** el servidor revalida stock al confirmar y revierte la transacción completa si falla el segundo producto.

## 4. API REST

**Prompt de diseño reproducible:** «Organiza routes/controllers/services, CRUD de dos o más recursos, detalle con relaciones y códigos 200/201/400/404/409. Usa SQL parametrizado».

**Resultado:** CRUD de productos, clientes y cupones; órdenes y detalle con ítems.

**Corrección:** errores JSON homogéneos; middleware para JSON inválido y restricciones SQL.

## 5. React Router y experiencia de compra

**Prompt de diseño reproducible:** «Construye una interfaz clara y responsiva: catálogo, detalle, carrito, órdenes, gestión, dashboard y asistente; servicios/api.js, un hook useFetch y formularios controlados».

**Resultado:** siete vistas, componentes reutilizables, búsqueda, filtros y orden.

**Corrección:** el checkout muestra un estimado; todos los totales definitivos se calculan en el backend.

## 6. Integración del agente IA

**Prompt de diseño reproducible:** «Diseña un workflow importable Webhook → consulta HTTP del catálogo → AI Agent conectado a modelo de chat y herramienta → Respond to Webhook, con contrato ok/data/error, sin credenciales».

**Resultado:** n8n/NOVA_AI_AGENT_WORKFLOW.json.

**Limitación:** es imprescindible configurar el modelo con una credencial real en n8n y ejecutar el webhook. El fallback de React está explícitamente marcado como demo por reglas.

## 7. Verificación

**Prompt de diseño reproducible:** «Prueba escenarios positivos y negativos: CRUD, doble uso de cupón, vencimiento, inventario, estado inválido, rollback y métricas SQL».

**Resultado:** backend/tests/api.test.js y colección Postman.

**Corrección registrada:** en el seed inicial se detectó que una orden de ejemplo no enlazaba el cupón usado; el dato se corrigió y las pruebas deben volver a ejecutarse.

## Conceptos que debo defender

1. Relación uno a muchos, PK y FK.
2. Por qué nunca confiar en el precio que envía el navegador.
3. Funcionamiento de BEGIN, COMMIT y ROLLBACK.
4. Diferencias HTTP 400, 404 y 409.
5. Cómo funciona useFetch, React Router y formularios controlados.
6. AI Agent, modelo de chat, herramienta, Webhook y JSON de respuesta.
7. Diferencia entre respuestas de IA y reglas deterministas.

