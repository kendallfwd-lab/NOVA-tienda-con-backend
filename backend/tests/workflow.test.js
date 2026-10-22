import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

test('Workflow exportado usa Webhook + AI Agent + herramienta + Respond y no contiene credenciales',()=>{
  const workflow=JSON.parse(readFileSync(resolve(process.cwd(),'../n8n/NOVA_AI_AGENT_WORKFLOW.json'),'utf8'));
  const types=workflow.nodes.map(n=>n.type);
  assert.ok(types.includes('n8n-nodes-base.webhook'));
  assert.ok(types.includes('n8n-nodes-base.respondToWebhook'));
  assert.ok(types.includes('@n8n/n8n-nodes-langchain.agent'));
  assert.ok(types.includes('@n8n/n8n-nodes-langchain.lmChatOpenAi'));
  assert.ok(types.includes('@n8n/n8n-nodes-langchain.toolCalculator'));
  assert.ok(workflow.connections['Calculator - Comprobar cifras'].ai_tool);
  assert.ok(workflow.connections['OpenAI Chat Model (AGREGAR CREDENCIAL)'].ai_languageModel);
  assert.equal(workflow.active,false);
  for(const node of workflow.nodes) assert.equal(node.credentials,undefined);
});
