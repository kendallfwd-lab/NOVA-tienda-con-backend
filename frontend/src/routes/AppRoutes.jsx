import { Route, Routes } from 'react-router-dom';
import { AssistantPage } from '../pages/AssistantPage.jsx';
import { CartPage } from '../pages/CartPage.jsx';
import { DashboardPage } from '../pages/DashboardPage.jsx';
import { ManagementPage } from '../pages/ManagementPage.jsx';
import { NotFoundPage } from '../pages/NotFoundPage.jsx';
import { OrdersPage } from '../pages/OrdersPage.jsx';
import { ProductPage } from '../pages/ProductPage.jsx';
import { StorePage } from '../pages/StorePage.jsx';

export function AppRoutes() {
  return <Routes>
    <Route path="/" element={<StorePage />} />
    <Route path="/producto/:id" element={<ProductPage />} />
    <Route path="/carrito" element={<CartPage />} />
    <Route path="/pedidos" element={<OrdersPage />} />
    <Route path="/metricas" element={<DashboardPage />} />
    <Route path="/gestion" element={<ManagementPage />} />
    <Route path="/asistente" element={<AssistantPage />} />
    <Route path="*" element={<NotFoundPage />} />
  </Routes>;
}
