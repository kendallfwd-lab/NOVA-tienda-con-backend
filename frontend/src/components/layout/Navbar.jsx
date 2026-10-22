import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { BrainCircuit, Menu, ShoppingBag, X } from 'lucide-react';
import { useCart } from '../../context/CartContext.jsx';

const primaryLinks = [
  { to: '/', label: 'Colección' },
  { to: '/pedidos', label: 'Pedidos' },
  { to: '/metricas', label: 'Dashboard' },
  { to: '/gestion', label: 'Gestión' }
];

export function Navbar() {
  const { count } = useCart();
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => setOpen(false), [pathname]);

  return <header className="topbar">
    <div className="container topbar-inner">
      <Link to="/" className="brand" aria-label="NOVA Supply, inicio">
        <span className="brand-mark">N<span>✳</span></span>
        <span className="brand-copy">NOVA <em>/</em> SUPPLY<span className="brand-tagline">CURATED TECH GOODS</span></span>
      </Link>
      <nav className={`nav-links ${open ? 'nav-links--open' : ''}`} aria-label="Navegación principal">
        {primaryLinks.map(link => <NavLink key={link.to} to={link.to} end={link.to === '/'} className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>{link.label}</NavLink>)}
      </nav>
      <div className="header-actions">
        <Link to="/asistente" className="ai-link"><BrainCircuit size={16} /> Asistente IA</Link>
        <Link to="/carrito" className="cart-link" aria-label={`Carrito con ${count} productos`}><ShoppingBag size={19} /><span>{count}</span></Link>
        <button className="icon-button mobile-menu" aria-label="Menú" aria-expanded={open} onClick={() => setOpen(!open)}>{open ? <X size={21} /> : <Menu size={21} />}</button>
      </div>
    </div>
  </header>;
}
