import { ArrowLeft,ArrowRight,Check,ShoppingBag,Truck,ShieldCheck } from 'lucide-react';
import { Link,useParams } from 'react-router-dom';
import { useState } from 'react';
import { ProductVisual } from '../components/products/ProductVisual.jsx';
import { ErrorMessage } from '../components/ui/ErrorMessage.jsx';
import { Loader as Loading } from '../components/ui/Loader.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useFetch } from '../hooks/useFetch.js';
import { money } from '../utils/formatCurrency.js';

export function ProductPage() {
  const {id}=useParams();
  const {data:product,loading,error}=useFetch(`/productos/${id}`);
  const {add}=useCart();
  const [added,setAdded]=useState(false);
  if(loading)return <div className="container page-pad"><Loading/></div>;
  if(error)return <div className="container page-pad"><ErrorMessage message={error}/><Link to="/">Volver</Link></div>;
  if(!product)return null;
  return <div className="container page-pad">
    <Link className="back-link" to="/"><ArrowLeft size={16}/> Volver a la colección</Link>
    <div className="detail-grid"><ProductVisual key={product.id} product={product} large/>
      <div className="detail-content"><span className="eyebrow">NOVA / {product.categoria.toUpperCase()}</span><h1>{product.nombre}</h1><p className="detail-description">{product.descripcion}</p>
        <span className="detail-price">{money(product.precio)}</span>
        <div className="detail-meta"><span><Check size={16}/> {product.stock} unidades disponibles</span><span><Truck size={16}/> Envíos a toda Costa Rica</span><span><ShieldCheck size={16}/> Compra segura de demostración</span></div>
        <button className="button button-dark detail-add" disabled={product.stock===0} onClick={()=>{add(product);setAdded(true);}}>
          {added?<><Check size={18}/> Agregado al carrito</>:<><ShoppingBag size={18}/> Agregar al carrito <ArrowRight size={18}/></>}
        </button>
        <div className="detail-specs"><div><span>CATEGORÍA</span><strong>{product.categoria}</strong></div><div><span>UNIDADES VENDIDAS</span><strong>{product.ventas}</strong></div><div><span>REFERENCIA</span><strong>NV-{String(product.id).padStart(4,'0')}</strong></div></div>
      </div></div>
  </div>;
}
