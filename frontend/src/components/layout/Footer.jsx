import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  return <footer className="footer"><div className="container">
    <div className="footer-top">
      <div><div className="footer-wordmark">NOVA<span>✳</span></div><p>Objetos que hacen más fácil<br />tu día a día.</p></div>
      <div className="footer-nav"><Link to="/">Colección</Link><Link to="/pedidos">Pedidos</Link><Link to="/metricas">Estadísticas</Link><Link to="/gestion">Administración</Link></div>
      <div className="footer-nav"><Link to="/asistente">Asistente</Link><a href="https://n8n.io" target="_blank" rel="noreferrer">Conoce n8n <ArrowUpRight size={13} /></a><span>Proyecto académico · Costa Rica</span></div>
    </div>
    <div className="footer-bottom"><span>© 2026 NOVA / SUPPLY. Laboratorio #2.</span><span>Hecho con React, Express, SQLite y n8n <span className="footer-spark">✳</span></span></div>
  </div></footer>;
}
