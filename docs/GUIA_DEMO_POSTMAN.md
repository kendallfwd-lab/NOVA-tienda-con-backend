# Prueba en vivo — Guía corta para Postman

1. Abre una terminal en la carpeta del proyecto.
2. Ejecuta npm run dev:api.
3. Comprueba en navegador http://localhost:3001/api/health.
4. Abre Postman y usa File / Import; selecciona postman/NOVA_Lab2.postman_collection.json.
5. En Variables de la colección, confirma baseUrl = http://localhost:3001/api.
6. Ejecuta las solicitudes en orden (o usa Run collection).
7. Comprueba las respuestas y guarda capturas de al menos un 201, un 400, un 404 y un 409.

## Ejemplo de 409 por stock

- Método: POST
- URL: http://localhost:3001/api/ordenes
- Header: Content-Type = application/json
- Body → raw → JSON:

~~~json
{
  "cliente_id": 1,
  "items": [
    {"producto_id": 1, "cantidad": 99999}
  ]
}
~~~

**Esperado:** HTTP 409 y error que menciona falta de stock.

## Ejemplo de pago y reposición de inventario

1. Consulta GET http://localhost:3001/api/productos/7. Anota stock.
2. Envía POST http://localhost:3001/api/ordenes:

~~~json
{
  "cliente_id": 1,
  "items": [{"producto_id": 7, "cantidad": 2}]
}
~~~

3. Copia el valor id devuelto.
4. Envía PATCH http://localhost:3001/api/ordenes/ID/estado con:

~~~json
{"estado":"pagada"}
~~~

5. Consulta el stock del producto 7: ahora hay **2 unidades menos**.
6. Envía PATCH a la misma ruta con:

~~~json
{"estado":"cancelada"}
~~~

7. Consulta stock nuevamente: recuperó las 2 unidades.

## Ejemplo de prohibición

Si una orden ya está enviada, intentar cambiarla a cancelada devuelve HTTP 409. No es un error del programa: es una regla de negocio que evita anular entregas en proceso.

## Diferencia entre las pruebas

- **Postman** confirma que la API responde por HTTP y demuestra los códigos solicitados.
- **npm test** comprueba automáticamente la lógica y el rollback con una base aislada.
- **n8n** requiere la credencial propia para ejecutar la inteligencia artificial; el modo local de React no la sustituye.

