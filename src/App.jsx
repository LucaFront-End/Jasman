import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollProgress from './components/ScrollProgress';
import PromotionsPopup from './components/PromotionsPopup';
import HomePage from './pages/HomePage';
import NosotrosPage from './pages/NosotrosPage';
import ServiciosPage from './pages/ServiciosPage';
import ServicioDetailPage from './pages/ServicioDetailPage';
import SucursalesPage from './pages/SucursalesPage';
import SucursalDetailPage from './pages/SucursalDetailPage';
import FlotillasPage from './pages/FlotillasPage';
import BolsaTrabajoPage from './pages/BolsaTrabajoPage';
import VacanteDetailPage from './pages/VacanteDetailPage';
import ProveedoresPage from './pages/ProveedoresPage';
import ContactoPage from './pages/ContactoPage';
import LandingAlineacionPage from './pages/LandingAlineacionPage';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

export default function App() {
  const { pathname } = useLocation();

  // Subdomain detection: if visiting via a landing/promo subdomain, render landing page at root
  const hostname = typeof window !== 'undefined' ? window.location.hostname.toLowerCase() : '';
  const isLandingSubdomain =
    hostname.startsWith('promociones.') ||
    hostname.startsWith('promocion.') ||
    hostname.startsWith('alineacion.') ||
    hostname.startsWith('landing.');

  return (
    <>
      <ScrollToTop />
      <Navbar />
      <ScrollProgress />
      <main>
        <Routes>
          <Route path="/" element={isLandingSubdomain ? <LandingAlineacionPage /> : <HomePage />} />
          <Route path="/alineacion-y-balanceo" element={<LandingAlineacionPage />} />
          <Route path="/alineación-y-balanceo" element={<LandingAlineacionPage />} />
          <Route path="/alineacion-y-balanceo-promocion-cdmx-octubre" element={<LandingAlineacionPage />} />
          <Route path="/promociones/:slug" element={<LandingAlineacionPage />} />
          <Route path="/promocion/:slug" element={<LandingAlineacionPage />} />
          <Route path="/promociones" element={<LandingAlineacionPage />} />
          <Route path="/promociones/alineacion-y-balanceo" element={<LandingAlineacionPage />} />
          <Route path="/nosotros" element={<NosotrosPage />} />
          <Route path="/servicios" element={<ServiciosPage />} />
          <Route path="/servicios/:slug" element={<ServicioDetailPage />} />
          <Route path="/sucursales" element={<SucursalesPage />} />
          <Route path="/sucursales/:slug" element={<SucursalDetailPage />} />
          <Route path="/flotillas" element={<FlotillasPage />} />
          <Route path="/bolsa-de-trabajo" element={<BolsaTrabajoPage />} />
          <Route path="/bolsa-de-trabajo/:id" element={<VacanteDetailPage />} />
          <Route path="/proveedores" element={<ProveedoresPage />} />
          <Route path="/contacto" element={<ContactoPage />} />
        </Routes>
      </main>
      <Footer />
      {/* Hide general promotion popup when already on a dedicated landing page */}
      {!isLandingSubdomain && !pathname.includes('alineacion') && !pathname.includes('alineación') && (
        <PromotionsPopup />
      )}
    </>
  );
}
