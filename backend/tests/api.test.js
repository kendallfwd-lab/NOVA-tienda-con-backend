import test from 'node:test';
import assert from 'node:assert/strict';
import { createDatabase } from '../src/db.js';
import { createApp } from '../src/app.js';

async function fixture(t) {
  const db = createDatabase(':memory:');
  const server = createApp(db).listen(0);
  await new Promise(resolve=>server.once('listening',resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  t.after(async()=>{
    await new Promise((resolve,reject)=>server.close(err=>err?reject(err):resolve()));
    db.close();
  });
  async function request(path, method='GET', body) {
    const response = await fetch(base+path,{
      method,
      headers: { 'Content-Type':'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body)
    });
    return {status:response.status,body:await response.json()};
  }
  return {db,request};
}

test('GET catálogo, detalle con relaciones y resumen SQL',async t=>{
  const {request}=await fixture(t);
  const listing=await request('/api/productos?categoria=Audio&orden=precio_asc');
  assert.equal(listing.status,200);
  assert.equal(listing.body.length,3);
  assert.ok(listing.body[0].precio<=listing.body[1].precio);
  const detail=await request('/api/ordenes/3');
  assert.equal(detail.status,200);
  assert.equal(detail.body.items.length,2);
  assert.equal(detail.body.cupon_codigo,'BIENVENIDA10');
  const summary=await request('/api/resumen');
  assert.equal(summary.status,200);
  assert.equal(summary.body.ordenes_completadas,3);
  assert.equal(summary.body.top_productos.length,3);
  assert.ok(summary.body.ventas_categoria.length>0);
});

test('CRUD de productos + 400,404 y 409',async t=>{
  const {request}=await fixture(t);
  const invalid=await request('/api/productos','POST',{nombre:'X',precio:-4,stock:-1,categoria:'Audio'});
  assert.equal(invalid.status,400);
  const create=await request('/api/productos','POST',{nombre:'Monitor NOVA',precio:90000,stock:10,categoria:'Computación'});
  assert.equal(create.status,201);
  const id=create.body.id;
  const update=await request(`/api/productos/${id}`,'PUT',{precio:88000,stock:8});
  assert.equal(update.status,200);
  assert.equal(update.body.precio,88000);
  const remove=await request(`/api/productos/${id}`,'DELETE');
  assert.equal(remove.status,200);
  assert.equal((await request(`/api/productos/${id}`)).status,404);
  const historical=await request('/api/productos/2','DELETE');
  assert.equal(historical.status,409);
});

test('CRUD de clientes + email duplicado 409',async t=>{
  const {request}=await fixture(t);
  const body={nombre:'Prueba Cliente',email:'prueba@ejemplo.com',ciudad:'Puntarenas'};
  const created=await request('/api/clientes','POST',body);
  assert.equal(created.status,201);
  assert.equal((await request('/api/clientes','POST',body)).status,409);
  const update=await request(`/api/clientes/${created.body.id}`,'PATCH',{ciudad:'Limón'});
  assert.equal(update.body.ciudad,'Limón');
  assert.equal((await request(`/api/clientes/${created.body.id}`,'DELETE')).status,200);
  assert.equal((await request('/api/clientes/9999')).status,404);
  assert.equal((await request('/api/clientes/1','DELETE')).status,409);
});

test('El pedido valida stock, calcula envío por ciudad y cupón',async t=>{
  const {request}=await fixture(t);
  assert.equal((await request('/api/ordenes','POST',{
    cliente_id:2,items:[{producto_id:1,cantidad:999}]
  })).status,409);
  const order=await request('/api/ordenes','POST',{
    cliente_id:2,cupon:'TECH15',items:[{producto_id:1,cantidad:1}]
  });
  assert.equal(order.status,201);
  assert.equal(order.body.subtotal,32500);
  assert.equal(order.body.descuento,4875);
  assert.equal(order.body.envio,4000);
  assert.equal(order.body.total,31625);
  assert.equal(order.body.estado,'nueva');
  const free=await request('/api/ordenes','POST',{
    cliente_id:4,items:[{producto_id:2,cantidad:1}]
  });
  assert.equal(free.body.envio,0);
});

test('Confirmar descuenta stock; cancelar pagada lo repone',async t=>{
  const {request}=await fixture(t);
  const before=(await request('/api/productos/7')).body.stock;
  const order=await request('/api/ordenes','POST',{cliente_id:1,items:[{producto_id:7,cantidad:2}]});
  const id=order.body.id;
  assert.equal((await request(`/api/ordenes/${id}/estado`,'PATCH',{estado:'pagada'})).status,200);
  assert.equal((await request('/api/productos/7')).body.stock,before-2);
  assert.equal((await request(`/api/ordenes/${id}/estado`,'PATCH',{estado:'cancelada'})).status,200);
  assert.equal((await request('/api/productos/7')).body.stock,before);
  assert.equal((await request(`/api/ordenes/${id}/estado`,'PATCH',{estado:'pagada'})).status,409);
});

test('Transacción ROLLBACK ante stock agotado antes del pago',async t=>{
  const {request}=await fixture(t);
  const order=await request('/api/ordenes','POST',{cliente_id:1,items:[
    {producto_id:7,cantidad:2},{producto_id:12,cantidad:2}
  ]});
  await request('/api/productos/12','PATCH',{stock:0});
  const before=(await request('/api/productos/7')).body.stock;
  const payment=await request(`/api/ordenes/${order.body.id}/estado`,'PATCH',{estado:'pagada'});
  assert.equal(payment.status,409);
  assert.equal((await request('/api/productos/7')).body.stock,before);
  assert.equal((await request(`/api/ordenes/${order.body.id}`)).body.estado,'nueva');
});

test('Cupón no se puede usar dos veces por cliente, ni después de vencido',async t=>{
  const {request}=await fixture(t);
  const expired=await request('/api/ordenes','POST',{
    cliente_id:1,cupon:'EXPIRADO20',items:[{producto_id:7,cantidad:1}]
  });
  assert.equal(expired.status,409);
  const payload={cliente_id:1,cupon:'TECH15',items:[{producto_id:7,cantidad:1}]};
  const order=await request('/api/ordenes','POST',payload);
  assert.equal((await request(`/api/ordenes/${order.body.id}/estado`,'PATCH',{estado:'pagada'})).status,200);
  assert.equal((await request('/api/ordenes','POST',payload)).status,409);
  const noReuse=await request('/api/ordenes','POST',{cliente_id:3,cupon:'BIENVENIDA10',items:[{producto_id:7,cantidad:1}]});
  assert.equal(noReuse.status,409);
});

test('La transición enviada → cancelada se rechaza; se entrega en orden',async t=>{
  const {request}=await fixture(t);
  const order=await request('/api/ordenes','POST',{cliente_id:1,items:[{producto_id:6,cantidad:1}]});
  const path=`/api/ordenes/${order.body.id}/estado`;
  assert.equal((await request(path,'PATCH',{estado:'entregada'})).status,409);
  assert.equal((await request(path,'PATCH',{estado:'pagada'})).status,200);
  assert.equal((await request(path,'PATCH',{estado:'enviada'})).status,200);
  assert.equal((await request(path,'PATCH',{estado:'cancelada'})).status,409);
  assert.equal((await request(path,'PATCH',{estado:'entregada'})).status,200);
});

test('CRUD de cupones y demo local claramente diferenciada de IA',async t=>{
  const {request}=await fixture(t);
  const c=await request('/api/cupones','POST',{codigo:'NUEVO5',porcentaje:5,vigente_hasta:'2099-01-01',usos_maximos:3});
  assert.equal(c.status,201);
  assert.equal((await request(`/api/cupones/${c.body.id}`,'PATCH',{porcentaje:9})).body.porcentaje,9);
  assert.equal((await request(`/api/cupones/${c.body.id}`,'DELETE')).status,200);
  const suggestion=await request('/api/ia/demo','POST',{tipo:'recomendaciones',carrito:[1]});
  assert.equal(suggestion.status,200);
  assert.equal(suggestion.body.data.modo,'demo-reglas');
});

