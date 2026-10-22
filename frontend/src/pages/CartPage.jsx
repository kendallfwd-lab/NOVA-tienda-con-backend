import { useState } from 'react';
import { ArrowLeft,ArrowRight,Minus,Plus,ShoppingBag,Tag,Trash2,Truck,LockKeyhole } from 'lucide-react';
import { Link,useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { ProductVisual } from '../components/products/ProductVisual.jsx';
import { ErrorMessage } from '../components/ui/ErrorMessage.jsx';
import { Loader as Loading } from '../components/ui/Loader.jsx';
import { useFetch } from '../hooks/useFetch.js';
import { api } from '../services/api.js';
import { money } from '../utils/formatCurrency.js';

export function CartPage() {
  const {items,count,total,setQty,remove,clear}=useCart();
  const {data:clients,loading:clientsLoading,error:clientsError}=useFetch('/clientes');
  const {data:cities}=useFetch('/ciudades');
  const [clientId,setClientId]=useState('');
  const [coupon,setCoupon]=useState('');
  const [pending,setPending]=useState(false);
  const [error,setError]=useState('');
  const navigate=useNavigate();
  const client=clients?.find(c=>c.id===Number(clientId));
  const baseShipping=cities?.find(c=>c.ciudad===client?.ciudad)?.costo??null;
  const shipping=total>=60000?0:baseShipping;

  async function checkout(e) {
    e.preventDefault();
    if(!clientId) {setError('Selecciona un cliente antes de crear la orden.');return;}
    setPending(true);setError('');
    try {
      const order=await api('/ordenes',{method:'POST',body:{
        cliente_id:Number(clientId),
        cupon:coupon.trim()||null,
        items:items.map(i=>({producto_id:i.id,cantidad:i.cantidad}))
      }});
      clear();
      navigate(`/pedidos?creada=${order.id}`);
    }catch(err){setError(err.message);}finally{setPending(false);}
  }

  return <div className="container page-pad">
    <Link className="back-link" to="/"><ArrowLeft size={16}/> Continuar comprando</Link>
    <div className="page-title-row"><div><span className="eyebrow">02 — TU SELECCIÓN</span><h1>Tu carrito<span className="tiny-count">{count}</span></h1></div></div>
    {!items.length?<div className="empty-cart"><ShoppingBag size={39}/><h2>Aquí hay espacio para algo bueno.</h2><p>Tu carrito todavía está vacío. Explora la colección y encuentra tus favoritos.</p><Link to="/" className="button button-dark">Explorar productos <ArrowRight size={18}/></Link></div>:
    <div className="checkout-grid"><section className="cart-items"><div className="cart-table-head"><span>PRODUCTO</span><span>CANTIDAD</span><span>TOTAL</span></div>
      {items.map(item=><div className="cart-item" key={item.id}><ProductVisual product={item}/><div className="cart-item-copy"><span className="eyebrow">{item.categoria}</span><Link to={`/producto/${item.id}`}>{item.nombre}</Link><span className="muted">{money(item.precio)} / unidad</span><button className="text-danger" onClick={()=>remove(item.id)}><Trash2 size={14}/> Eliminar</button></div>
        <div className="qty-stepper"><button onClick={()=>setQty(item.id,item.cantidad-1)} aria-label="Restar cantidad"><Minus size={14}/></button><span>{item.cantidad}</span><button onClick={()=>setQty(item.id,item.cantidad+1)} disabled={item.cantidad>=item.stock} aria-label="Sumar cantidad"><Plus size={14}/></button></div>
        <strong className="cart-line-total">{money(item.precio*item.cantidad)}</strong>
      </div>)}
      <div className="cart-info-note"><Truck size={18}/> Envío gratis en compras desde ₡60.000 después de descuentos.</div>
    </section>
    <form className="checkout-panel" onSubmit={checkout}><span className="eyebrow">RESUMEN DE COMPRA</span><h2>Un paso más.</h2>
      <label className="field"><span>Cliente <em>*</em></span><select required value={clientId} onChange={e=>setClientId(e.target.value)}><option value="">Seleccionar cliente</option>{clients?.map(c=><option key={c.id} value={c.id}>{c.nombre} · {c.ciudad}</option>)}</select></label>
      <p className="field-help">Puedes crear un cliente nuevo en la sección Gestión.</p>
      <label className="field"><span><Tag size={15}/> Código de descuento (opcional)</span><input value={coupon} onChange={e=>setCoupon(e.target.value.toUpperCase())} placeholder="Ej. TECH15"/></label>
      <div className="checkout-totals"><div><span>Subtotal</span><strong>{money(total)}</strong></div><div><span>Envío estimado</span><strong>{shipping===null?'Elige cliente':shipping===0?'GRATIS':money(shipping)}</strong></div><div className="total-line"><span>Total antes del cupón</span><strong>{money(total+(shipping||0))}</strong></div></div>
      <p className="field-help">El descuento, el envío y el total definitivos se calculan en el servidor al crear la orden.</p>
      {clientsLoading&&<Loading text="Cargando clientes"/>}<ErrorMessage message={clientsError||error}/>
      <button className="button button-dark checkout-button" disabled={pending||!items.length}>{pending?'Creando orden...':'Crear orden'} <ArrowRight size={18}/></button>
      <div className="checkout-security"><LockKeyhole size={15}/> Sin cobro real: pago simulado para prácticas académicas.</div>
    </form></div>}
  </div>;
}
