import { Footer } from './Footer.jsx';
import { Navbar } from './Navbar.jsx';
import { AppRoutes } from '../../routes/AppRoutes.jsx';

export function MainLayout() {
  return <>
    <Navbar />
    <main id="main"><AppRoutes /></main>
    <Footer />
  </>;
}
