import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollProgress from './components/ScrollProgress';
import FloatingWhatsAppButton from './components/FloatingWhatsAppButton';
import TiendaLiveChatWidget from './components/tienda/TiendaLiveChatWidget';
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
import LandingTiendaPreviewPage from './pages/LandingTiendaPreviewPage';
import LandingTiendaPreviewCopyPage from './pages/LandingTiendaPreviewCopyPage';
import CatalogoPreviewPage from './pages/CatalogoPreviewPage';
import ProductoPreviewPage from './pages/ProductoPreviewPage';
import HomeTiendaPreviewPage from './pages/HomeTiendaPreviewPage';
import CuentaPreviewPage from './pages/CuentaPreviewPage';
import ThankYouPage from './pages/ThankYouPage';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  const { pathname } = useLocation();

  // Subdomain detection
  const hostname =
    typeof window !== 'undefined' ? window.location.hostname.toLowerCase() : '';
  const isLlantasSubdomain = hostname.startsWith('llantas.');
  const isPromoSubdomain =
    hostname.startsWith('promociones.') ||
    hostname.startsWith('promocion.') ||
    hostname.startsWith('alineacion.') ||
    hostname.startsWith('landing.');

  const isLlantasStoreRoute =
    isLlantasSubdomain ||
    pathname === '/llantas' ||
    pathname.startsWith('/llantas/catalogo') ||
    pathname.startsWith('/llantas/producto') ||
    pathname.startsWith('/llantas/cuenta') ||
    pathname.startsWith('/llantas/thank-you') ||
    pathname.startsWith('/thank-you') ||
    pathname.startsWith('/gracias');

  const isDedicatedStoreLanding =
    isLlantasStoreRoute ||
    pathname.startsWith('/landing-tienda-preview') ||
    pathname.startsWith('/landing-tienda-copia') ||
    pathname.startsWith('/landing-tienda-wix');

  const isPromoSlugUnderLlantas =
    pathname.startsWith('/llantas/') && !isLlantasStoreRoute;

  return (
    <>
      <ScrollToTop />
      {!isDedicatedStoreLanding && <Navbar />}
      <ScrollProgress />
      <main>
        <Routes>
          <Route
            path="/"
            element={
              isLlantasSubdomain ? (
                <LandingTiendaPreviewPage />
              ) : isPromoSubdomain ? (
                <LandingAlineacionPage />
              ) : (
                <HomePage />
              )
            }
          />
          {/* Official Online Tire Store routes under /llantas */}
          <Route path="/llantas" element={<LandingTiendaPreviewPage />} />
          <Route path="/llantas/catalogo" element={<CatalogoPreviewPage />} />
          <Route path="/llantas/producto/:id" element={<ProductoPreviewPage />} />
          <Route path="/llantas/cuenta" element={<CuentaPreviewPage />} />
          <Route path="/llantas/thank-you" element={<ThankYouPage />} />
          <Route path="/thank-you" element={<ThankYouPage />} />
          <Route path="/gracias" element={<ThankYouPage />} />
          <Route path="/llantas/:slug" element={<LandingAlineacionPage />} />

          {/* Promotional campaign routes */}
          <Route path="/alineacion-y-balanceo" element={<LandingAlineacionPage key="all" />} />
          <Route path="/alineación-y-balanceo" element={<LandingAlineacionPage key="all" />} />
          <Route
            path="/alineacion-y-balanceo-promo"
            element={<LandingAlineacionPage key="ads" promoVariant="ads" />}
          />
          <Route
            path="/alineacion-y-balanceo-ads"
            element={<LandingAlineacionPage key="ads" promoVariant="ads" />}
          />
          <Route
            path="/promocion-alineacion-y-balanceo"
            element={<LandingAlineacionPage key="ads" promoVariant="ads" />}
          />
          <Route
            path="/alineacion-y-balanceo-promocion-cdmx-octubre"
            element={<LandingAlineacionPage />}
          />
          <Route path="/promociones/:slug" element={<LandingAlineacionPage />} />
          <Route path="/promocion/:slug" element={<LandingAlineacionPage />} />
          <Route path="/promociones" element={<LandingAlineacionPage />} />
          <Route
            path="/promociones/alineacion-y-balanceo"
            element={<LandingAlineacionPage />}
          />

          {/* Main corporate site routes */}
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

          {/* Store preview & OAuth callback aliases (kept active for backwards compatibility) */}
          <Route path="/landing-tienda-preview" element={<LandingTiendaPreviewPage />} />
          <Route path="/landing-tienda-wix" element={<LandingTiendaPreviewPage />} />
          <Route
            path="/landing-tienda-preview-copia"
            element={<LandingTiendaPreviewCopyPage />}
          />
          <Route
            path="/landing-tienda-preview/copia"
            element={<LandingTiendaPreviewCopyPage />}
          />
          <Route
            path="/landing-tienda-copia"
            element={<LandingTiendaPreviewCopyPage />}
          />
          <Route
            path="/landing-tienda-preview/catalogo"
            element={<CatalogoPreviewPage />}
          />
          <Route
            path="/landing-tienda-preview/producto/:id"
            element={<ProductoPreviewPage />}
          />
          <Route path="/landing-tienda-preview/cuenta" element={<CuentaPreviewPage />} />
          <Route path="/home-tienda-preview" element={<HomeTiendaPreviewPage />} />
        </Routes>
      </main>
      <Footer />
      {/* Main corporate site floating controls: Coupon on bottom-left, Live Chat stacked above WhatsApp on bottom-right */}
      {!isPromoSubdomain &&
        !isDedicatedStoreLanding &&
        !isPromoSlugUnderLlantas &&
        !pathname.includes('alineacion') &&
        !pathname.includes('alineación') && (
          <>
            <TiendaLiveChatWidget
              stackedAboveWhatsApp
              buttonLabel="Chat en Vivo"
              headerTitle="Chat en Vivo · Jasman"
            />
            <FloatingWhatsAppButton />
          </>
        )}
    </>
  );
}
