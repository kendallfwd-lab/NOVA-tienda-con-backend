import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return <div className="container missing-page">
    <h1>Esta página tomó otro camino.</h1>
    <Link className="button button-dark" to="/">Volver a la tienda</Link>
  </div>;
}
