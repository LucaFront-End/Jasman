import { Link } from 'react-router-dom';
import Hero from '../components/Hero';
import BrandsMarquee from '../components/BrandsMarquee';
import Services from '../components/Services';
import About from '../components/About';
import Timeline from '../components/Timeline';
import Process from '../components/Process';
import Locations from '../components/Locations';
import Testimonials from '../components/Testimonials';
import Promotions from '../components/Promotions';
import CTA from '../components/CTA';
import TiendaCatalogSection from '../components/tienda/TiendaCatalogSection';
import TiendaCartDrawer from '../components/tienda/TiendaCartDrawer';
import FirstPurchasePopup from '../components/tienda/FirstPurchasePopup';
import { C, F } from '../hooks/useAnimations';
import { useTiendaState, triggerTiendaUI } from '../hooks/useTiendaState';
import { ShoppingBag, User, Store, Sparkles } from 'lucide-react';

export default function HomeTiendaPreviewPage() {
  const { cartCount, user, coupon } = useTiendaState();

  return (
    <>
      {/* Store Drawers & First-Purchase Popup available directly on this Home copy */}
      <FirstPurchasePopup />
      <TiendaCartDrawer />

      {/* Floating Store Quick-Access Pill for the Home Preview */}
      <div
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 990,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: 6,
          borderRadius: 9999,
          background: 'rgba(26, 31, 54, 0.94)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.14)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.32)',
        }}
      >
        <a
          href="#tienda-home-section"
          style={{
            padding: '9px 14px',
            borderRadius: 9999,
            background: 'rgba(255,255,255,0.08)',
            color: C.white,
            fontFamily: F.heading,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <Store size={13} color={C.redLight} /> Catálogo
        </a>

        <Link
          to="/landing-tienda-preview"
          style={{
            padding: '9px 13px',
            borderRadius: 9999,
            background: 'rgba(196, 30, 36, 0.22)',
            border: '1px solid rgba(196, 30, 36, 0.45)',
            color: C.white,
            fontFamily: F.heading,
            fontSize: 10.5,
            fontWeight: 800,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
          }}
        >
          <Sparkles size={12} color="#FCA5A5" /> Landing Tienda
        </Link>

        <button
          type="button"
          onClick={() => triggerTiendaUI({ type: 'OPEN_COUPON' })}
          style={{
            padding: '9px 12px',
            borderRadius: 9999,
            border: 'none',
            background: coupon ? 'rgba(22, 163, 74, 0.25)' : 'transparent',
            color: coupon ? '#86EFAC' : C.white,
            fontFamily: F.heading,
            fontSize: 10.5,
            fontWeight: 800,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
          }}
        >
          {coupon ? '10% Activo' : '−10%'}
        </button>

        <Link
          to="/landing-tienda-preview/cuenta"
          style={{
            padding: '9px 13px',
            borderRadius: 9999,
            border: 'none',
            background: 'transparent',
            color: C.white,
            fontFamily: F.heading,
            fontSize: 11,
            fontWeight: 700,
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <User size={13} /> {user ? user.nombre.split(' ')[0] : 'Cuenta'}
        </Link>

        <button
          type="button"
          onClick={() => triggerTiendaUI({ type: 'OPEN_CART' })}
          style={{
            padding: '9px 15px',
            borderRadius: 9999,
            border: 'none',
            background: C.red,
            color: C.white,
            fontFamily: F.heading,
            fontSize: 11,
            fontWeight: 800,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <ShoppingBag size={13} /> {cartCount}
        </button>
      </div>

      {/* 1. Original Production Hero */}
      <Hero />

      {/* 2. Original Production Brands Marquee */}
      <BrandsMarquee />

      {/* 3. Original Production Home Sections Up To Nuestros Clientes */}
      <About />
      <Timeline />
      <Services />
      <Process />
      <Locations />
      <Testimonials />

      {/* 4. INTEGRATED STORE & PRODUCTS SECTION (Placed right after Nuestros Clientes) */}
      <div id="tienda-home-section">
        <TiendaCatalogSection id="catalogo-home-preview" isHomePreview />
      </div>

      {/* 5. Remaining Original Production Home Sections */}
      <Promotions />
      <CTA />
    </>
  );
}
