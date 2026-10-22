import { useState } from 'react';
import { ArrowDown,ArrowRight,ArrowUpRight,Check,Headphones,PackageCheck,Search,ShieldCheck,SlidersHorizontal,Truck,X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ProductVisual } from '../components/products/ProductVisual.jsx';
import { EmptyState as Empty } from '../components/ui/EmptyState.jsx';
import { ErrorMessage } from '../components/ui/ErrorMessage.jsx';
import { Loader as Loading } from '../components/ui/Loader.jsx';
import { SectionHeading } from '../components/ui/SectionHeading.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useFetch } from '../hooks/useFetch.js';
import { money } from '../utils/formatCurrency.js';

function ProductCard({product}) {
  const {add}=useCart();
  const [added,setAdded]=useState(false);
  const addNow=()=>{
    add(product);setAdded(true);window.setTimeout(()=>setAdded(false),1100);
  };
  return <article className="product-card">
    <Link className="product-card-image" to={`/producto/${product.id}`}><ProductVisual product={product}/>{product.destacado===1&&<span className="featured-pill">SELECTED</span>}</Link>
    <div className="product-card-info"><span className="product-category">{product.categoria}</span>
      <Link to={`/producto/${product.id}`} className="product-name">{product.nombre}</Link>
      <div className="product-card-row"><span className="product-price">{money(product.precio)}</span>
        <button className={`add-button ${added?'added':''}`} onClick={addNow} disabled={product.stock===0} aria-label={`Agregar ${product.nombre} al carrito`} title="Agregar al carrito">
          {added?<Check size={18}/>:<ArrowUpRight size={19}/>}</button>
      </div><span className={`stock-note ${product.stock===0?'out':''}`}>{product.stock>0?`${product.stock} unidades disponibles`:'Agotado'}</span>
    </div>
  </article>;
}

export function StorePage() {
  const [q,setQ]=useState('');
  const [category,setCategory]=useState('Todas');
  const [order,setOrder]=useState('recientes');
  const [available,setAvailable]=useState(false);
  const {data:categories}=useFetch('/categorias');
  const params=new URLSearchParams({orden:order});
  if(q)params.set('q',q);
  if(category!=='Todas')params.set('categoria',category);
  if(available)params.set('disponible','1');
  const {data:products,loading,error}=useFetch(`/productos?${params.toString()}`);
  return <>
    <section className="hero"><div className="container hero-inner">
      <div className="hero-copy"><div className="hero-index"><span className="live-dot"/> COLECCIÓN 2026 <span className="hero-index-line"/> OBJETOS DE TODOS LOS DÍAS</div>
        <h1>Tecnología<br/>que se <em>siente.</em></h1>
        <p>Diseño inteligente. Experiencias sencillas. Una selección de objetos para trabajar, crear y disfrutar cada momento.</p>
        <a className="button button-dark" href="#coleccion">Explorar colección <ArrowUpRight size={18}/></a>
        <div className="hero-footnote"><span>01 / 03</span><div className="hero-progress"><b/></div><span>DISEÑADO PARA TU RITMO</span></div>
      </div>
      <div className="hero-art" aria-label="Ilustración decorativa de auriculares"><div className="hero-art-grid"/><span className="hero-ring hero-ring-a"/><span className="hero-ring hero-ring-b"/>
        <div className="hero-device"><Headphones strokeWidth={1.35}/></div>
        <div className="hero-sticker"><span>NOVA SELECT</span><strong>01</strong><ArrowUpRight size={18}/></div>
        <span className="hero-art-label">SOUND / FREEDOM / FORM</span>
      </div>
    </div></section>

    <section className="benefits-strip"><div className="container benefits-inner">
      <span><Truck size={20}/> Envíos a Costa Rica</span><span><ShieldCheck size={20}/> Compra con claridad</span><span><PackageCheck size={20}/> Inventario en tiempo real</span>
      <span className="benefit-right">ENVÍO GRATIS DESDE ₡60.000 <ArrowRight size={16}/></span>
    </div></section>

    <section className="container catalog-section" id="coleccion">
      <SectionHeading eyebrow="01 — LA COLECCIÓN" title="Seleccionados para ti." description="Tecnología funcional, buenos detalles y precios sin complicaciones." action={<span className="collection-count">{products?.length??'—'} OBJETOS</span>}/>
      <div className="catalog-toolbar"><div className="category-tabs">
        {['Todas',...(categories||[])].map(c=><button key={c} className={`category-tab ${category===c?'selected':''}`} onClick={()=>setCategory(c)}>{c}</button>)}
      </div><div className="toolbar-controls"><label className="search-box"><Search size={18}/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Buscar objetos..." aria-label="Buscar productos"/>{q&&<button aria-label="Limpiar búsqueda" onClick={()=>setQ('')}><X size={15}/></button>}</label>
        <label className="select-wrap"><SlidersHorizontal size={17}/><select value={order} onChange={e=>setOrder(e.target.value)} aria-label="Ordenar productos"><option value="recientes">Recientes</option><option value="precio_asc">Menor precio</option><option value="precio_desc">Mayor precio</option><option value="nombre">Nombre A–Z</option></select></label>
      </div></div>
      <label className="stock-filter"><input type="checkbox" checked={available} onChange={e=>setAvailable(e.target.checked)}/> Mostrar solo disponibles</label>
      {error&&<ErrorMessage message={error}/>}
      {loading?<Loading/>:products?.length?<div className="product-grid">{products.map(p=><ProductCard key={p.id} product={p}/>)}</div>:<Empty title="No encontramos productos" subtitle="Prueba otra categoría o modifica la búsqueda."/>}
    </section>

    <section className="container editorial-block"><div className="editorial-icon"><span>✳</span></div><div><span className="eyebrow">NOVA / UNA IDEA SIMPLE</span><h2>Menos ruido.<br/><em>Más de lo que importa.</em></h2><p>Cada producto fue elegido para resolver algo real de tu día. Sin excesos ni complicaciones: objetos bien pensados.</p></div><a href="#coleccion" aria-label="Volver a la colección"><ArrowUpRight size={26}/></a></section>
  </>;
}
