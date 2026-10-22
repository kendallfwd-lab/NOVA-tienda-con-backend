import { CartProvider } from './context/CartContext.jsx';
import { MainLayout } from './components/layout/MainLayout.jsx';

export default function App() {
  return <CartProvider><MainLayout /></CartProvider>;
}
