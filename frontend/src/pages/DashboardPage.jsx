import { Activity,ArrowRight,BarChart3,Box,DollarSign,ShoppingCart,TrendingUp,TriangleAlert,Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { EmptyState as Empty } from '../components/ui/EmptyState.jsx';
import { ErrorMessage } from '../components/ui/ErrorMessage.jsx';
import { Loader as Loading } from '../components/ui/Loader.jsx';
import { useFetch } from '../hooks/useFetch.js';
import { statusLabels } from '../utils/constants.js';
import { money } from '../utils/formatCurrency.js';

export function DashboardPage() {
  const {data,loading,error}=useFetch('/resumen');
  if(loading)return <div className="container page-pad"><Loading/></div>;
  if(error)return <div className="container page-pad"><ErrorMessage message={error}/></div>;
  if(!data)return null;
  const stats=[
    {label:'VENTAS CONFIRMADAS',value:money(data.ingresos),note:`${data.ordenes_completadas} órdenes válidas`,icon:DollarSign},
    {label:'VALOR PROMEDIO',value:money(data.ticket_promedio),note:'Por orden confirmada',icon:TrendingUp},
    {label:'PRODUCTOS ACTIVOS',value:data.productos,note:'En nuestro catálogo',icon:Box},
    {label:'CLIENTES REGISTRADOS',value:data.clientes,note:'En base de datos',icon:Users}
  ];
  const maxCategory=Math.max(...data.ventas_categoria.map(c=>c.ingresos_brutos),1);
  return <div className="container page-pad dashboard-page"><div className="page-title-row"><div><span className="eyebrow">04 — INTELIGENCIA DE NEGOCIO</span><h1>Lo que dicen <em>los números.</em></h1><p>Indicadores calculados con SQL en tiempo real. Sin cifras inventadas.</p></div><span className="dashboard-live"><span className="live-dot"/> DATOS EN VIVO</span></div>
    <div className="stats-grid">{stats.map((s,i)=><div className={`stat-card stat-${i}`} key={s.label}><div className="stat-top"><span>{s.label}</span><s.icon size={19}/></div><strong>{s.value}</strong><span className="stat-note">{s.note}</span></div>)}</div>
    <div className="dashboard-grid"><section className="surface-card chart-card"><div className="panel-head"><div><span className="eyebrow">RENDIMIENTO</span><h2>Ventas por categoría</h2></div><BarChart3 size={21}/></div>
      {!data.ventas_categoria.length?<Empty/>:<div className="category-chart">{data.ventas_categoria.map((r,i)=><div className="chart-row" key={r.categoria}><div className="chart-label"><strong>{r.categoria}</strong><span>{money(r.ingresos_brutos)}</span></div><div className="bar-track"><div className={`bar-fill bar-fill-${i}`} style={{width:`${r.ingresos_brutos/maxCategory*100}%`}}/></div><span className="chart-units">{r.unidades} uds.</span></div>)}</div>}
    </section>
    <section className="surface-card tops-card"><div className="panel-head"><div><span className="eyebrow">TOP 03</span><h2>Los más elegidos</h2></div><Activity size={21}/></div>
      <div className="top-list">{data.top_productos.map((p,i)=><div className="top-item" key={p.id}><span className="top-number">0{i+1}</span><div><strong>{p.nombre}</strong><span>{p.vendidos} unidades vendidas</span></div><span className="top-symbol">↗</span></div>)}</div>
    </section></div>
    <div className="dashboard-grid bottom-grid"><section className="surface-card"><div className="panel-head"><div><span className="eyebrow">FULFILLMENT</span><h2>Estado de órdenes</h2></div><ShoppingCart size={21}/></div>
      <div className="status-overview">{Object.keys(statusLabels).map(status=><div key={status}><span className={`status-dot dot-${status}`}/><strong>{data.ordenes_estado.find(o=>o.estado===status)?.cantidad||0}</strong><span>{statusLabels[status]}</span></div>)}</div>
      <Link className="inline-link" to="/pedidos">Ver todas las órdenes <ArrowRight size={16}/></Link>
    </section>
    <section className="surface-card stock-card"><div className="panel-head"><div><span className="eyebrow">ALERTAS DE INVENTARIO</span><h2>Stock bajo</h2></div><TriangleAlert size={21}/></div>
      {data.alertas_stock.length?data.alertas_stock.map(p=><div className="stock-row" key={p.id}><span>{p.nombre}</span><span className="stock-level">{p.stock} restantes</span></div>):<p>Inventario saludable: no hay productos con 10 unidades o menos.</p>}
      <Link className="inline-link" to="/gestion">Gestionar catálogo <ArrowRight size={16}/></Link>
    </section></div>
  </div>;
}
