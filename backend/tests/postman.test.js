import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

test('Colección Postman importable con pruebas 200, 201, 400, 404 y 409',()=>{
  const collection=JSON.parse(readFileSync(resolve(process.cwd(),'../postman/NOVA_Lab2.postman_collection.json'),'utf8'));
  assert.match(collection.info.schema,/collection\/v2\.1\.0/);
  assert.ok(collection.item.length>=20);
  const statusText=collection.item.flatMap(i=>i.event||[]).flatMap(e=>e.script?.exec||[]).join('\n');
  for(const code of [200,201,400,404,409]) assert.match(statusText,new RegExp(String(code)));
  for(const item of collection.item) {
    assert.ok(item.request.method);
    assert.ok(item.request.url);
    assert.ok(item.event?.some(e=>e.listen==='test'));
  }
});

