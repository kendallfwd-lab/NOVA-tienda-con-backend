import { useState } from 'react';
import { ArrowRight,BrainCircuit,CheckCircle2,Lightbulb,MessageSquareText,PackageSearch,Sparkles,WandSparkles } from 'lucide-react';
import { ErrorMessage } from '../components/ui/ErrorMessage.jsx';
import { Loader as Loading } from '../components/ui/Loader.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useFetch } from '../hooks/useFetch.js';
import { askAssistant,N8N_WEBHOOK_URL } from '../services/api.js';
import { money } from '../utils/formatCurrency.js';

export function AssistantPage() {
  const [mode,setMode]=useState('descripcion');
  const [id,setId]=useState('1');
  const [result,setResult]=useState(null);
  const [error,setError]=useState('');
  const [busy,setBusy]=useState(false);
  const [connectionStatus,setConnectionStatus]=useState(N8N_WEBHOOK_URL?'URL CONFIGURADA':'MODO DEMO');
  const {items}=useCart();
  const {data:products,loading}=useFetch('/productos');
  async function execute() {
    setBusy(true);setError('');setResult(null);
    try{
      const payload=mode==='descripcion'?{tipo:mode,producto_id:Number(id)}:{tipo:mode,carrito:items.map(i=>i.id)};
      const answer=await askAssistant(payload);
      setResult(answer.data);
      if(N8N_WEBHOOK_URL)setConnectionStatus('N8N CONECTADO');
    }catch(err){
      setError(err.message);
      if(N8N_WEBHOOK_URL)setConnectionStatus('N8N CON ERROR');
    }finally{setBusy(false);}
  }
  return <div className="container page-pad assistant-page"><div className="page-title-row"><div><span className="eyebrow">06 — LABORATORIO DE IDEAS</span><h1>Un poco de <em>inteligencia.</em></h1><p>Descripciones comerciales y recomendaciones personalizadas basadas en el catálogo.</p></div><div className="assistant-star"><Sparkles size={28}/></div></div>
    <div className="assistant-layout"><section className="assistant-builder"><div className="assistant-header"><span className="assistant-orb"><BrainCircuit size={23}/></span><div><h2>Asistente NOVA</h2><p>Tu copiloto comercial</p></div><span className="status-chip">{connectionStatus}</span></div>
      <div className="assistant-config"><span className="eyebrow">¿QUÉ QUIERES GENERAR?</span><div className="mode-cards"><button className={mode==='descripcion'?'selected':''} onClick={()=>{setMode('descripcion');setResult(null);}}><MessageSquareText size={23}/><strong>Descripción comercial</strong><span>Texto atractivo para destacar un producto.</span></button><button className={mode==='recomendaciones'?'selected':''} onClick={()=>{setMode('recomendaciones');setResult(null);}}><PackageSearch size={23}/><strong>Recomendaciones</strong><span>Sugerencias relacionadas con tu carrito.</span></button></div>
        {mode==='descripcion'?<label className="field"><span>Producto del catálogo</span><select value={id} onChange={e=>setId(e.target.value)}>{products?.map(p=><option key={p.id} value={p.id}>{p.nombre}</option>)}</select></label>:<div className="cart-context-box"><strong>Tu contexto de compra</strong>{items.length?<p>{items.map(i=>i.nombre).join(' · ')}</p>:<p>Tu carrito está vacío. Se sugerirán productos destacados del catálogo.</p>}</div>}
        {!N8N_WEBHOOK_URL&&<div className="demo-callout"><Lightbulb size={18}/><span>Se mostrarán respuestas generadas por reglas locales. Para activar el agente real, configura <code>VITE_N8N_WEBHOOK_URL</code> y las credenciales del workflow.</span></div>}
        <button className="button button-dark assistant-run" onClick={execute} disabled={busy||loading}>{busy?'Preparando resultado...':'Generar resultado'} <WandSparkles size={18}/></button>
      </div></section>
      <section className="assistant-output"><div className="result-top"><span className="eyebrow">RESULTADO / OUTPUT</span><span className="result-decoration">✳</span></div>
        <ErrorMessage message={error}/>
        {busy?<Loading text="Consultando el asistente..."/>:!result?<div className="assistant-empty"><div className="assistant-empty-icon"><Sparkles size={31}/></div><h3>Las buenas ideas empiezan aquí.</h3><p>Elige una función y presiona generar. Tu respuesta aparecerá en este espacio.</p></div>:
        <div className="ai-answer"><div className="ai-answer-label"><CheckCircle2 size={17}/> RESPUESTA GENERADA {result.modo==='demo-reglas'?'· DEMO LOCAL':''}</div>
          {result.titulo&&<h2>{result.titulo}</h2>}
          {(result.descripcion||result.respuesta||result.output)&&<p className="ai-answer-text">{result.descripcion||result.respuesta||result.output}</p>}
          {result.motivo&&<p>{result.motivo}</p>}
          {result.recomendaciones?.length>0&&<div className="ai-recommendations">{result.recomendaciones.map((p,i)=><div key={p.id||i}><span>{p.nombre||p}</span>{p.precio!==undefined&&<strong>{money(p.precio)}</strong>}</div>)}</div>}
          {!result.titulo&&!result.descripcion&&!result.respuesta&&!result.output&&!result.recomendaciones&&<pre className="json-preview">{JSON.stringify(result,null,2)}</pre>}
        </div>}
      </section></div>
    <div className="assistant-disclaimer"><BrainCircuit size={17}/><span>Las respuestas del agente son sugerencias comerciales. Nunca modifican precios, stock ni órdenes automáticamente.</span></div>
  </div>;
}
