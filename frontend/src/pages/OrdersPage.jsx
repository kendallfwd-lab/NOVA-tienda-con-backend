import { useEffect,useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowRight,Box,CheckCircle2,Clock3,Eye,PackageCheck,RefreshCw,Truck,XCircle } from 'lucide-react';
import { EmptyState as Empty } from '../components/ui/EmptyState.jsx';
import { ErrorMessage } from '../components/ui/ErrorMessage.jsx';
import { Loader as Loading } from '../components/ui/Loader.jsx';
import { useFetch } from '../hooks/useFetch.js';
import { api } from '../services/api.js';
import { statusLabels } from '../utils/constants.js';
import { dateTime } from '../utils/formatDate.js';
import { money } from '../utils/formatCurrency.js';

const actions={
  nueva:[{next:'pagada',label:'Confirmar pago',icon:CheckCircle2},{next:'cancelada',label:'Cancelar',icon:XCircle}],
  pagada:[{next:'enviada',label:'Marcar enviada',icon:Truck},{next:'cancelada',label:'Cancelar y reponer stock',icon:XCircle}],
  enviada:[{next:'entregada',label:'Marcar entregada',icon:PackageCheck}],
  entregada:[],cancelada:[]
};

export function OrdersPage() {
  const [params]=useSearchParams();
  const created=params.get('creada');
  const [estado,setEstado]=useState('');
  const [selected,setSelected]=useState(created||null);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const {data:orders,loading,error:loadingError,refresh}=useFetch(`/ordenes${estado?`?estado=${estado}`:''}`);
  const {data:detail,loading:detailLoading,refresh:refreshDetail}=useFetch(selected?`/ordenes/${selected}`:null);
  useEffect(()=>{if(created)setSelected(created);},[created]);

  async function updateStatus(next) {
    if(next==='cancelada' && !window.confirm('¿Cancelar la orden? Si ya fue pagada se repondrá el inventario.'))return;
    setBusy(true);setError('');
    try {
      await api(`/ordenes/${selected}/estado`,{method:'PATCH',body:{estado:next}});
      refresh();refreshDetail();
    }catch(err){setError(err.message);}finally{setBusy(false);}
  }

  return <div className="container page-pad">
    <div className="page-title-row"><div><span className="eyebrow">03 — OPERACIONES</span><h1>Órdenes <em>& envíos.</em></h1><p>Gestiona cada etapa, del pedido a la entrega.</p></div><button className="button button-outline" onClick={()=>{refresh();refreshDetail();}}><RefreshCw size={16}/> Actualizar</button></div>
    {created&&<div className="success-banner"><CheckCircle2 size={20}/> Orden #{created} creada correctamente. Ahora puedes confirmar su pago simulado.</div>}
    <div className="order-filters"><button onClick={()=>setEstado('')} className={!estado?'selected':''}>Todas</button>{Object.keys(statusLabels).map(s=><button key={s} className={estado===s?'selected':''} onClick={()=>setEstado(s)}>{statusLabels[s]}</button>)}</div>
    <div className="orders-layout"><section className="orders-list"><div className="list-header"><span>ÓRDENES REGISTRADAS</span><span>{orders?.length??0} RESULTADOS</span></div>
      <ErrorMessage message={loadingError}/>{loading?<Loading/>:!orders?.length?<Empty title="No hay órdenes" subtitle="Prueba otro filtro o crea un pedido desde el catálogo."/>:
      orders.map(o=><button className={`order-row ${String(selected)===String(o.id)?'order-row--selected':''}`} key={o.id} onClick={()=>setSelected(o.id)}>
        <div className="order-icon"><Box size={21}/></div><div className="order-row-main"><strong>Orden #{String(o.id).padStart(4,'0')}</strong><span>{o.cliente_nombre} · {dateTime(o.fecha)}</span></div>
        <div className="order-row-meta"><strong>{money(o.total)}</strong><span className={`status-badge status-${o.estado}`}>{statusLabels[o.estado]}</span></div><Eye size={17} className="order-eye"/>
      </button>)}
    </section>
    <aside className="order-detail-panel">{!selected?<div className="state-box"><Eye size={25}/><span>Selecciona una orden para ver sus detalles.</span></div>:detailLoading?<Loading/>:!detail?<Empty/>:<>
      <div className="detail-panel-title"><div><span className="eyebrow">DETALLE DE LA ORDEN</span><h2>#{String(detail.id).padStart(4,'0')}</h2></div><span className={`status-badge status-${detail.estado}`}>{statusLabels[detail.estado]}</span></div>
      <div className="order-info-lines"><div><span>Cliente</span><strong>{detail.cliente_nombre}</strong></div><div><span>Ciudad de envío</span><strong>{detail.ciudad_envio}</strong></div><div><span>Fecha</span><strong>{dateTime(detail.fecha)}</strong></div><div><span>Cupón</span><strong>{detail.cupon_codigo||'—'}</strong></div></div>
      <h3 className="subheading">Artículos</h3>{detail.items.map(item=><div className="mini-line" key={item.id}><span>{item.cantidad}× {item.producto_nombre}</span><strong>{money(item.cantidad*item.precio_unitario)}</strong></div>)}
      <div className="mini-divider"/><div className="mini-line"><span>Subtotal</span><strong>{money(detail.subtotal)}</strong></div><div className="mini-line"><span>Descuento</span><strong>−{money(detail.descuento)}</strong></div><div className="mini-line"><span>Envío</span><strong>{detail.envio?money(detail.envio):'Gratis'}</strong></div><div className="mini-total"><span>TOTAL</span><strong>{money(detail.total)}</strong></div>
      <ErrorMessage message={error}/><div className="order-actions">{actions[detail.estado].map(a=><button key={a.next} className={`button ${a.next==='cancelada'?'button-danger':'button-dark'}`} disabled={busy} onClick={()=>updateStatus(a.next)}><a.icon size={17}/>{a.label}</button>)}</div>
      {!actions[detail.estado].length&&<div className="completed-note"><CheckCircle2 size={17}/> Esta orden ya no admite cambios de estado.</div>}
    </>}</aside></div>
    <div className="academic-note"><Clock3 size={17}/><span>Los pagos son simulados. El historial permanece para conservar el registro de ventas. No hay cobros ni logística real.</span></div>
  </div>;
}
