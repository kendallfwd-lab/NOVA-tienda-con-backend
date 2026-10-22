import { createContext,useCallback,useContext,useMemo,useState } from 'react';

const CartContext=createContext(null);

function readCart() {
  try {
    const stored=JSON.parse(localStorage.getItem('nova-cart')||'[]');
    return Array.isArray(stored)?stored.filter(i=>Number.isInteger(i.id)&&Number.isInteger(i.cantidad)&&i.cantidad>0):[];
  } catch{return [];}
}

export function CartProvider({children}) {
  const [items,setItems]=useState(readCart);
  const update=useCallback(updater=>setItems(previous=>{
    const next=updater(previous);
    try {localStorage.setItem('nova-cart',JSON.stringify(next));} catch {/* sin almacenamiento privado */}
    return next;
  }),[]);
  const add=useCallback(product=>update(previous=>{
    const found=previous.find(i=>i.id===product.id);
    if(found) return previous.map(i=>i.id===product.id?{...i,cantidad:Math.min(i.cantidad+1,product.stock)}:i);
    return [...previous,{id:product.id,nombre:product.nombre,precio:product.precio,stock:product.stock,categoria:product.categoria,cantidad:1}];
  }),[update]);
  const setQty=useCallback((id,cantidad)=>update(previous=>previous.map(i=>i.id===id?{...i,cantidad:Math.min(Math.max(cantidad,0),i.stock)}:i).filter(i=>i.cantidad>0)),[update]);
  const remove=useCallback(id=>update(previous=>previous.filter(i=>i.id!==id)),[update]);
  const clear=useCallback(()=>update(()=>[]),[update]);
  const total=items.reduce((sum,i)=>sum+i.precio*i.cantidad,0);
  const count=items.reduce((sum,i)=>sum+i.cantidad,0);
  const value=useMemo(()=>({items,add,setQty,remove,clear,total,count}),[items,add,setQty,remove,clear,total,count]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart=()=>useContext(CartContext);

