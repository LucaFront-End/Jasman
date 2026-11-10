import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { C, F } from '../hooks/useAnimations';
import {
  BRAND_META,
  formatMXN,
  useWixCatalogProducts,
} from '../data/productosMasterData';
import { useTiendaState, triggerTiendaUI } from '../hooks/useTiendaState';
import { useAppleTilt } from '../hooks/useAppleScrollPhysics';
import TiendaNavbar from '../components/tienda/TiendaNavbar';
import Tire3DStudioStage from '../components/tienda/Tire3DStudioStage';
import TiendaCategoriesAccordion from '../components/tienda/TiendaCategoriesAccordion';
import TiendaCatalogSection from '../components/tienda/TiendaCatalogSection';
import TiendaCartDrawer from '../components/tienda/TiendaCartDrawer';
import TiendaAuthModal from '../components/tienda/TiendaAuthModal';
import FirstPurchasePopup from '../components/tienda/FirstPurchasePopup';
import TiendaLiveChatWidget from '../components/tienda/TiendaLiveChatWidget';
import {
  ArrowRight,
  ArrowUpRight,
  ShoppingBag,
  Sparkles,
  MapPin,
  Check,
  Star,
  ShieldCheck,
} from 'lucide-react';

const HERO_SPOTLIGHTS = [
  {
    id: 572,
    label: 'Continental 205/55R16',
    promoTag: 'Promo: −10% en Juego de 4 + Envío Gratis',
  },
  {
    id: 561,
    label: 'Hankook SUV 285/45R21',
    promoTag: 'Promo SUV · −10% en tu 1ª Compra',
  },
  {
    id: 568,
    label: 'General Tire 245/75R17',
    promoTag: 'Todo Terreno · Entrega Gratis Nacional',
  },
  {
    id: 543,
    label: 'Euzkadi 27X8.50R14',
    promoTag: 'Promoción Especial · Stock Inmediato',
  },
];

export default function LandingTiendaPreviewPage() {
  const { addToCart, coupon } = useTiendaState();
  const { products: catalogProducts } = useWixCatalogProducts();
  const { tilt: heroTilt, onMouseMove: onHeroMove, onMouseLeave: onHeroLeave } = useAppleTilt(7);

  const [selectedHeroId, setSelectedHeroId] = useState(HERO_SPOTLIGHTS[0].id);
  const [heroPaused, setHeroPaused] = useState(false);
  const [heroAdded, setHeroAdded] = useState(false);

  // Auto-rotate hero spotlight tires & promotions every 4.2s
  useEffect(() => {
    if (heroPaused) return undefined;
    const timer = setInterval(() => {
      setSelectedHeroId((prevId) => {
        const idx = HERO_SPOTLIGHTS.findIndex((s) => s.id === prevId);
        const nextIdx = (idx + 1) % HERO_SPOTLIGHTS.length;
        return HERO_SPOTLIGHTS[nextIdx].id;
      });
    }, 4200);
    return () => clearInterval(timer);
  }, [heroPaused]);

  const activeSpotlight =
    HERO_SPOTLIGHTS.find((s) => s.id === selectedHeroId) || HERO_SPOTLIGHTS[0];
  const heroProduct =
    catalogProducts.find((p) => p.id === selectedHeroId) || catalogProducts[0];

  const handleHeroBuy = () => {
    addToCart(heroProduct.id, 1, true);
    setHeroAdded(true);
    setTimeout(() => setHeroAdded(false), 1500);
  };

  const heroPrice = coupon
    ? heroProduct.finalPriceTaxExcluded * 0.9
    : heroProduct.finalPriceTaxExcluded;

  return (
    <div style={{ background: '#FFFFFF', minHeight: '100vh' }}>
      {/* Floating Apple Frosted Glass Navbar, Cart Drawer, Auth Popup & Store Chat */}
      <TiendaNavbar />
      <TiendaCartDrawer />
      <TiendaAuthModal />
      <TiendaLiveChatWidget />

      {/* Exclusive 10% First Purchase Popup (ONLY on /landing-tienda-preview) */}
      <FirstPurchasePopup />

      {/* 1. DIRECT-SCROLL LIGHT STUDIO HERO */}
      <section
        id="hero-stage"
        onMouseMove={onHeroMove}
        onMouseLeave={onHeroLeave}
        style={{
          position: 'relative',
          minHeight: '100vh',
          width: '100%',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: 24,
          padding: '124px 24px 36px',
          color: C.navy,
          background: 'linear-gradient(180deg, #FFFFFF 0%, #F8F9FA 65%, #FFFFFF 100%)',
        }}
      >
        {/* Soft Brand Aura that follows cursor on light background */}
        <div
          style={{
            position: 'absolute',
            left: `${heroTilt.spotX}%`,
            top: `${heroTilt.spotY}%`,
            transform: 'translate(-50%, -50%)',
            width: '55vw',
            height: '55vw',
            maxWidth: 720,
            maxHeight: 720,
            borderRadius: '50%',
            background:
              'radial-gradient(circle, rgba(196, 30, 36, 0.09) 0%, rgba(26, 31, 54, 0.04) 45%, rgba(255, 255, 255, 0) 72%)',
            filter: 'blur(35px)',
            transition: 'left 0.4s ease-out, top 0.4s ease-out',
            pointerEvents: 'none',
          }}
        />

        {/* Top Editorial Headline (Minimalist Apple Light Keynote Style) */}
        <div
          style={{
            position: 'relative',
            zIndex: 4,
            textAlign: 'center',
            maxWidth: 820,
            margin: '0 auto',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '5px 14px',
              borderRadius: 9999,
              background: 'rgba(196, 30, 36, 0.07)',
              border: '1px solid rgba(196, 30, 36, 0.16)',
              marginBottom: 14,
            }}
          >
            <Sparkles size={12} color={C.red} />
            <span
              style={{
                fontFamily: F.heading,
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: C.red,
              }}
            >
              JASMAN STORE · Productos Recomendados
            </span>
          </div>

          <h1
            style={{
              fontFamily: F.heading,
              fontSize: 'clamp(2.4rem, 5.6vw, 4.75rem)',
              fontWeight: 900,
              letterSpacing: '-0.045em',
              lineHeight: 0.98,
              margin: 0,
              color: C.navy,
            }}
          >
            Ingeniería que toca el{' '}
            <span style={{ color: C.red }}>asfalto.</span>
          </h1>
        </div>

        {/* Center Stage: Kinetic Watermark + Floating Transparent PNG Tire + Telemetry Callouts */}
        <div
          style={{
            position: 'relative',
            zIndex: 3,
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            maxWidth: 1260,
            margin: '0 auto',
            padding: '12px 0',
          }}
        >
          {/* Giant Architectural Watermark */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4vw',
              pointerEvents: 'none',
              userSelect: 'none',
            }}
          >
            <span
              style={{
                fontFamily: F.heading,
                fontSize: 'clamp(4rem, 13vw, 12.5rem)',
                fontWeight: 900,
                letterSpacing: '-0.06em',
                color: 'rgba(26, 31, 54, 0.045)',
              }}
            >
              PRECISIÓN
            </span>
            <span
              style={{
                fontFamily: F.heading,
                fontSize: 'clamp(4rem, 13vw, 12.5rem)',
                fontWeight: 900,
                letterSpacing: '-0.06em',
                color: 'rgba(196, 30, 36, 0.05)',
              }}
            >
              ABSOLUTA
            </span>
          </div>

          {/* 3D Interactive Tire Stage (3/4 View) */}
          <Tire3DStudioStage
            product={heroProduct}
            rx={heroTilt.rx}
            ry={heroTilt.ry}
            spotX={heroTilt.spotX}
            spotY={heroTilt.spotY}
            scrollScale={1}
            scrollFloatY={0}
            ringRotation={0}
            size="clamp(240px, 28vw, 355px)"
          />

          {/* Frosted White Glass Telemetry Callouts (Visible Immediately) */}
          <div
            className="hero-xray-callouts"
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
            }}
          >
            {/* Left Telemetry Pill */}
            <div
              style={{
                position: 'absolute',
                left: '8%',
                top: '28%',
                padding: '16px 22px',
                borderRadius: 22,
                background: 'rgba(255, 255, 255, 0.90)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(26, 31, 54, 0.08)',
                boxShadow: '0 20px 45px rgba(26, 31, 54, 0.07)',
              }}
            >
              <div style={{ fontSize: 9.5, fontFamily: F.heading, fontWeight: 800, letterSpacing: '0.2em', color: C.red, textTransform: 'uppercase' }}>
                Medida · Rin
              </div>
              <div style={{ fontSize: 22, fontFamily: F.heading, fontWeight: 900, color: C.navy, marginTop: 2 }}>
                {heroProduct.measure}
              </div>
              <div
                style={{
                  marginTop: 6,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '3px 8px',
                  borderRadius: 9999,
                  background: 'rgba(196, 30, 36, 0.08)',
                  color: C.red,
                  fontFamily: F.heading,
                  fontSize: 9,
                  fontWeight: 800,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                }}
              >
                <Sparkles size={10} /> {activeSpotlight.promoTag}
              </div>
            </div>

            {/* Right Telemetry Pill */}
            <div
              style={{
                position: 'absolute',
                right: '8%',
                top: '28%',
                padding: '16px 22px',
                borderRadius: 22,
                background: 'rgba(255, 255, 255, 0.90)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(26, 31, 54, 0.08)',
                boxShadow: '0 20px 45px rgba(26, 31, 54, 0.07)',
              }}
            >
              <div style={{ fontSize: 9.5, fontFamily: F.heading, fontWeight: 800, letterSpacing: '0.2em', color: C.red, textTransform: 'uppercase' }}>
                Precio Oficial (Sin IVA)
              </div>
              <div style={{ fontSize: 22, fontFamily: F.heading, fontWeight: 900, color: C.navy, marginTop: 2 }}>
                {formatMXN(heroPrice)}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Floating Frosted White Glass Command Bar */}
        <div
          style={{
            position: 'relative',
            zIndex: 5,
            maxWidth: 1140,
            width: '100%',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          {/* Model Switcher + Quick Buy Dock + Catálogo Completo Route */}
          <div
            onMouseEnter={() => setHeroPaused(true)}
            onMouseLeave={() => setHeroPaused(false)}
            style={{
              padding: '12px 18px',
              borderRadius: 9999,
              background: 'rgba(255, 255, 255, 0.92)',
              backdropFilter: 'saturate(180%) blur(24px)',
              WebkitBackdropFilter: 'saturate(180%) blur(24px)',
              border: '1px solid rgba(26, 31, 54, 0.08)',
              boxShadow: '0 20px 50px rgba(26, 31, 54, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 10,
            }}
          >
            {/* Live Hero Model Selector Pills (Auto-Rotating) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              {HERO_SPOTLIGHTS.map((spot) => {
                const active = spot.id === selectedHeroId;
                return (
                  <button
                    key={spot.id}
                    type="button"
                    onClick={() => setSelectedHeroId(spot.id)}
                    style={{
                      position: 'relative',
                      overflow: 'hidden',
                      padding: '8px 14px',
                      borderRadius: 9999,
                      border: 'none',
                      background: active ? C.navy : 'transparent',
                      color: active ? C.white : C.gray,
                      fontFamily: F.heading,
                      fontSize: 11,
                      fontWeight: 800,
                      cursor: 'pointer',
                      transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                    }}
                  >
                    <span style={{ position: 'relative', zIndex: 2 }}>{spot.label}</span>
                    {active && !heroPaused && (
                      <span
                        key={`progress-${spot.id}`}
                        style={{
                          position: 'absolute',
                          left: 0,
                          bottom: 0,
                          height: 2.5,
                          background: C.red,
                          animation: 'jasmanHeroSlideProgress 4.2s linear forwards',
                        }}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Action Buttons: Comprar + Ficha + Catálogo Completo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={handleHeroBuy}
                style={{
                  padding: '11px 20px',
                  borderRadius: 9999,
                  border: 'none',
                  background: heroAdded ? '#16A34A' : C.red,
                  color: C.white,
                  fontFamily: F.heading,
                  fontSize: 11.5,
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  boxShadow: '0 8px 24px rgba(196, 30, 36, 0.32)',
                }}
              >
                {heroAdded ? (
                  <>
                    <Check size={14} /> Agregado
                  </>
                ) : (
                  <>
                    <ShoppingBag size={14} /> Comprar · {formatMXN(heroPrice)}
                  </>
                )}
              </button>

              <Link
                to={`/landing-tienda-preview/producto/${heroProduct.id}`}
                style={{
                  padding: '11px 15px',
                  borderRadius: 9999,
                  border: '1px solid rgba(26, 31, 54, 0.10)',
                  background: '#F8F9FA',
                  color: C.navy,
                  fontFamily: F.heading,
                  fontSize: 11,
                  fontWeight: 700,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                }}
              >
                Ficha <ArrowUpRight size={14} />
              </Link>

              <Link
                to="/landing-tienda-preview/catalogo"
                className="jasman-hero-catalog-cta"
                style={{
                  padding: '11px 16px',
                  borderRadius: 9999,
                  border: '1px solid rgba(26, 31, 54, 0.16)',
                  background: C.navy,
                  color: C.white,
                  fontFamily: F.heading,
                  fontSize: 10.5,
                  fontWeight: 800,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                Catálogo Completo <ArrowRight size={13} />
              </Link>
            </div>
          </div>

          {/* Product Excerpt right below the Ficha / Command Bar */}
          {heroProduct?.excerpt && (
            <div
              style={{
                padding: '8px 18px',
                borderRadius: 16,
                background: 'rgba(255, 255, 255, 0.86)',
                border: '1px solid rgba(26, 31, 54, 0.06)',
                fontSize: 12,
                color: '#475569',
                lineHeight: 1.45,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
              }}
            >
              <span
                style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                <strong style={{ color: C.navy, fontFamily: F.heading }}>
                  Resumen técnico:
                </strong>{' '}
                {heroProduct.excerpt}
              </span>
              <Link
                to={`/landing-tienda-preview/producto/${heroProduct.id}`}
                style={{
                  fontFamily: F.heading,
                  fontSize: 10.5,
                  fontWeight: 800,
                  color: C.red,
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                Ver ficha completa →
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* 2. SUTRA-STYLE EXPANDING CATEGORIES ACCORDION */}
      <TiendaCategoriesAccordion />

      {/* 4. UNIFIED CATALOG, MEDIDAS MÁS PEDIDAS & MARCAS MÁS PEDIDAS */}
      <TiendaCatalogSection id="catalogo-tienda" />

      {/* 5. RESEÑAS DE CONDUCTORES VERIFICADOS — SINGLE INFINITE MARQUEE WITH LATERAL BLUR */}
      <section
        id="resenas-tienda"
        style={{
          padding: '104px 0 88px',
          background: '#FFFFFF',
          borderTop: '1px solid rgba(26, 31, 54, 0.06)',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div style={{ maxWidth: 1260, margin: '0 auto', padding: '0 24px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 20,
              marginBottom: 48,
            }}
          >
            <div>
              <span
                style={{
                  fontFamily: F.heading,
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: '0.24em',
                  textTransform: 'uppercase',
                  color: C.red,
                  display: 'block',
                  marginBottom: 8,
                }}
              >
                Experiencias Reales · +80 Sucursales
              </span>
              <h2
                style={{
                  fontFamily: F.heading,
                  fontSize: 'clamp(2rem, 3.8vw, 3.1rem)',
                  fontWeight: 900,
                  color: C.navy,
                  letterSpacing: '-0.04em',
                  lineHeight: 1.05,
                  margin: 0,
                }}
              >
                Lo que opinan nuestros conductores.
              </h2>
            </div>

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 18px',
                borderRadius: 9999,
                background: '#F8F9FA',
                border: '1px solid rgba(26, 31, 54, 0.08)',
              }}
            >
              <div style={{ display: 'flex', gap: 3 }}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} fill="#F59E0B" color="#F59E0B" />
                ))}
              </div>
              <span
                style={{
                  fontFamily: F.heading,
                  fontSize: 13,
                  fontWeight: 900,
                  color: C.navy,
                }}
              >
                4.9 / 5.0
              </span>
              <span style={{ fontSize: 12, color: C.gray }}>
                · +12,400 clientes verificados
              </span>
            </div>
          </div>
        </div>

        {/* Single Infinite Marquee Viewport with Edge Blur & Fade Masks */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            overflow: 'hidden',
            padding: '12px 0 20px',
            WebkitMaskImage:
              'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.25) 4%, #000000 13%, #000000 87%, rgba(0,0,0,0.25) 96%, transparent 100%)',
            maskImage:
              'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.25) 4%, #000000 13%, #000000 87%, rgba(0,0,0,0.25) 96%, transparent 100%)',
          }}
        >
          {/* Left Optical Blur Shield */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: 0,
              width: 'clamp(72px, 12vw, 190px)',
              zIndex: 3,
              pointerEvents: 'none',
              backdropFilter: 'blur(7px)',
              WebkitBackdropFilter: 'blur(7px)',
              background:
                'linear-gradient(90deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.55) 55%, rgba(255,255,255,0) 100%)',
              WebkitMaskImage:
                'linear-gradient(to right, #000000 0%, #000000 55%, transparent 100%)',
              maskImage:
                'linear-gradient(to right, #000000 0%, #000000 55%, transparent 100%)',
            }}
          />

          {/* Right Optical Blur Shield */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              right: 0,
              width: 'clamp(72px, 12vw, 190px)',
              zIndex: 3,
              pointerEvents: 'none',
              backdropFilter: 'blur(7px)',
              WebkitBackdropFilter: 'blur(7px)',
              background:
                'linear-gradient(270deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.55) 55%, rgba(255,255,255,0) 100%)',
              WebkitMaskImage:
                'linear-gradient(to left, #000000 0%, #000000 55%, transparent 100%)',
              maskImage:
                'linear-gradient(to left, #000000 0%, #000000 55%, transparent 100%)',
            }}
          />

          {/* Infinite Marquee Track */}
          <div className="jasman-reviews-marquee-track">
            {(() => {
              const REVIEWS_DATA = [
                {
                  name: 'Alejandro M.',
                  city: 'Sucursal Jasman Satélite',
                  tire: 'Continental 205/55R16',
                  quote:
                    'Compré el juego de 4 llantas en línea con el descuento por volumen y agregué la instalación con un clic. En 40 minutos quedaron montadas y balanceadas.',
                },
                {
                  name: 'Valeria R.',
                  city: 'Entrega a Domicilio CDMX',
                  tire: 'Hankook Kinergy ST 185/65R15',
                  quote:
                    'El envío a domicilio gratis llegó rapidísimo y con DOT reciente. El agarre en pavimento mojado y el silencio en cabina mejoraron desde el primer kilómetro.',
                },
                {
                  name: 'Carlos G.',
                  city: 'Sucursal Jasman Monterrey',
                  tire: 'General Tire Grabber 245/75R17',
                  quote:
                    'Excelente atención y precios directos. Poder filtrar mi medida exacta en segundos y elegir mi sucursal desde la ficha del producto hace toda la diferencia.',
                },
                {
                  name: 'Fernanda L.',
                  city: 'Sucursal Jasman Polanco',
                  tire: 'Hankook Ventus V2 205/55R16',
                  quote:
                    'Me encantó que no tuve que hacer filas: compré desde el celular, apliqué el cupón de primera compra y al llegar a sucursal ya tenían mis llantas listas.',
                },
                {
                  name: 'Roberto D.',
                  city: 'Sucursal Jasman Guadalajara',
                  tire: 'Continental PremiumContact 6',
                  quote:
                    'La estabilidad en carretera a alta velocidad es impresionante. El equipo técnico de Jasman cuidó los rines al máximo durante el montaje y balanceo.',
                },
                {
                  name: 'Mariana S.',
                  city: 'Entrega a Domicilio Querétaro',
                  tire: 'Laufenn S FIT AS 215/55R17',
                  quote:
                    'Me asesoraron por el chat en vivo para confirmar el índice de carga de mi SUV. Llegaron perfecto a la puerta de mi casa sin costo de envío.',
                },
                {
                  name: 'Diego P.',
                  city: 'Sucursal Jasman Valle Dorado',
                  tire: 'Hankook SUV 285/45R21',
                  quote:
                    'Difícil encontrar esta medida en stock inmediato y aquí la tenían disponible con garantía oficial. Servicio impecable de principio a fin.',
                },
              ];
              return [...REVIEWS_DATA, ...REVIEWS_DATA].map((rev, idx) => (
                <div
                  key={`${rev.name}-${idx}`}
                  style={{
                    width: 390,
                    flexShrink: 0,
                    padding: '28px 28px',
                    borderRadius: 28,
                    background: '#F8F9FA',
                    border: '1px solid rgba(26, 31, 54, 0.07)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: 20,
                    boxShadow: '0 14px 36px rgba(26, 31, 54, 0.035)',
                  }}
                >
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: 14,
                      }}
                    >
                      <div style={{ display: 'flex', gap: 3 }}>
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={13} fill="#F59E0B" color="#F59E0B" />
                        ))}
                      </div>
                      <span
                        style={{
                          padding: '4px 10px',
                          borderRadius: 9999,
                          background: 'rgba(196, 30, 36, 0.08)',
                          color: C.red,
                          fontFamily: F.heading,
                          fontSize: 10,
                          fontWeight: 800,
                        }}
                      >
                        {rev.tire}
                      </span>
                    </div>
                    <p
                      style={{
                        fontSize: 13.8,
                        color: C.navy,
                        lineHeight: 1.65,
                        margin: 0,
                        fontWeight: 500,
                      }}
                    >
                      “{rev.quote}”
                    </p>
                  </div>

                  <div
                    style={{
                      paddingTop: 14,
                      borderTop: '1px solid rgba(26, 31, 54, 0.07)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontFamily: F.heading,
                          fontSize: 13,
                          fontWeight: 800,
                          color: C.navy,
                        }}
                      >
                        {rev.name}
                      </div>
                      <div style={{ fontSize: 11.5, color: C.gray }}>{rev.city}</div>
                    </div>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        fontSize: 10.5,
                        fontWeight: 700,
                        color: '#15803D',
                      }}
                    >
                      <ShieldCheck size={13} /> Compra Verificada
                    </span>
                  </div>
                </div>
              ));
            })()}
          </div>
        </div>
      </section>

      {/* 6. FORMULA E & EVENTOS — ULTRA-CLEAN MINIMALIST STUDIO EXHIBITION (Entre Reseñas y CTA Final) */}
      <section
        id="patrocinador-formula-e"
        style={{
          padding: '44px 24px 36px',
          background: '#FFFFFF',
        }}
      >
        <div
          style={{
            maxWidth: 1240,
            margin: '0 auto',
            borderRadius: 40,
            background: 'linear-gradient(180deg, #F8F9FB 0%, #FFFFFF 55%, #F9FAFB 100%)',
            border: '1px solid rgba(26, 31, 54, 0.08)',
            boxShadow: '0 32px 80px rgba(26, 31, 54, 0.05)',
            position: 'relative',
            overflow: 'hidden',
            padding: 'clamp(36px, 5vw, 64px)',
          }}
        >
          {/* Soft Ambient Studio Aura */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              left: '50%',
              top: '44%',
              transform: 'translate(-50%, -50%)',
              width: 680,
              height: 420,
              borderRadius: '50%',
              background:
                'radial-gradient(circle, rgba(196, 30, 36, 0.065) 0%, rgba(26, 31, 54, 0.025) 48%, transparent 72%)',
              filter: 'blur(36px)',
              pointerEvents: 'none',
            }}
          />

          {/* Top Minimalist Exhibition Bar */}
          <div
            style={{
              position: 'relative',
              zIndex: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 16,
              paddingBottom: 24,
              borderBottom: '1px solid rgba(26, 31, 54, 0.07)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              {BRAND_META.Hankook?.logo && (
                <img
                  src={BRAND_META.Hankook.logo}
                  alt="Hankook"
                  style={{
                    height: 22,
                    width: 'auto',
                    objectFit: 'contain',
                  }}
                />
              )}
              <span
                style={{
                  width: 1,
                  height: 18,
                  background: 'rgba(26, 31, 54, 0.14)',
                }}
              />
              <span
                style={{
                  fontFamily: F.heading,
                  fontSize: 10.5,
                  fontWeight: 800,
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                  color: C.navy,
                }}
              >
                ABB FIA Formula E · Patrocinador Oficial & Eventos
              </span>
            </div>

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 14px',
                borderRadius: 9999,
                background: '#FFFFFF',
                border: '1px solid rgba(26, 31, 54, 0.08)',
                boxShadow: '0 4px 14px rgba(26, 31, 54, 0.03)',
              }}
            >
              <span
                className="fe-minimal-pulse-dot"
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: C.red,
                }}
              />
              <span
                style={{
                  fontFamily: F.heading,
                  fontSize: 10,
                  fontWeight: 800,
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  color: C.navy,
                }}
              >
                Hankook Mexico City E-Prix · Edición Oficial
              </span>
            </div>
          </div>

          {/* Center Minimalist Sculpture Stage: Watermark + Horizon Line + Floating Tire + Frosted Glass Callouts */}
          <div
            style={{
              position: 'relative',
              zIndex: 2,
              height: 'clamp(290px, 34vw, 370px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '12px 0 8px',
            }}
          >
            {/* Whisper-Quiet Monumental Editorial Watermark */}
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none',
                userSelect: 'none',
              }}
            >
              <span
                style={{
                  fontFamily: F.heading,
                  fontSize: 'clamp(4.2rem, 12vw, 10.5rem)',
                  fontWeight: 900,
                  letterSpacing: '-0.06em',
                  color: 'rgba(26, 31, 54, 0.032)',
                  whiteSpace: 'nowrap',
                }}
              >
                FORMULA E
              </span>
            </div>

            {/* Minimalist Architectural Horizon Curve & Precision Calibration Dial SVG */}
            <svg
              aria-hidden="true"
              viewBox="0 0 1200 320"
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                overflow: 'visible',
                pointerEvents: 'none',
              }}
            >
              <defs>
                <linearGradient id="feMinimalCurveBase" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#1A1F36" stopOpacity="0" />
                  <stop offset="20%" stopColor="#1A1F36" stopOpacity="0.12" />
                  <stop offset="50%" stopColor="#C41E24" stopOpacity="0.28" />
                  <stop offset="80%" stopColor="#1A1F36" stopOpacity="0.12" />
                  <stop offset="100%" stopColor="#1A1F36" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="feMinimalPulseStream" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#C41E24" stopOpacity="0" />
                  <stop offset="50%" stopColor="#C41E24" stopOpacity="0.95" />
                  <stop offset="100%" stopColor="#1A1F36" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Delicate Sweeping Aerodynamic Arc */}
              <path
                d="M 20 220 Q 600 70 1180 220"
                fill="none"
                stroke="url(#feMinimalCurveBase)"
                strokeWidth="1.2"
              />
              {/* Gliding Minimalist Crimson Pulse along the Arc */}
              <path
                d="M 20 220 Q 600 70 1180 220"
                fill="none"
                stroke="url(#feMinimalPulseStream)"
                strokeWidth="2"
                strokeDasharray="160 1100"
                className="fe-minimal-arc-glide"
              />

              {/* Secondary Whisper-Fine Horizon Hairline */}
              <line
                x1="80"
                y1="242"
                x2="1120"
                y2="242"
                stroke="rgba(26, 31, 54, 0.06)"
                strokeWidth="1"
              />

              {/* Precision Watchmaker / Tachometer Calibration Ticks */}
              {[...Array(33)].map((_, idx) => {
                const x = 120 + idx * 30;
                const isMajor = idx % 4 === 0;
                return (
                  <line
                    key={idx}
                    x1={x}
                    y1={isMajor ? 235 : 239}
                    x2={x}
                    y2={isMajor ? 249 : 245}
                    stroke={
                      idx === 16
                        ? C.red
                        : isMajor
                          ? 'rgba(26, 31, 54, 0.22)'
                          : 'rgba(26, 31, 54, 0.09)'
                    }
                    strokeWidth={isMajor ? '1.2' : '1'}
                  />
                );
              })}

              {/* Center Concentric Minimalist Studio Bezel */}
              <circle
                cx="600"
                cy="160"
                r="134"
                fill="none"
                stroke="rgba(26, 31, 54, 0.07)"
                strokeWidth="1"
              />
              <circle
                cx="600"
                cy="160"
                r="148"
                fill="none"
                stroke="rgba(196, 30, 36, 0.16)"
                strokeWidth="1"
                strokeDasharray="4 8"
                className="fe-minimal-ring-spin"
              />
            </svg>

            {/* Left Frosted White Glass Callout Pill */}
            <div
              className="fe-minimal-callout fe-minimal-float-a"
              style={{
                position: 'absolute',
                left: '4%',
                top: '18%',
                padding: '18px 22px',
                borderRadius: 24,
                background: 'rgba(255, 255, 255, 0.88)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(26, 31, 54, 0.08)',
                boxShadow: '0 20px 45px rgba(26, 31, 54, 0.06)',
                maxWidth: 255,
              }}
            >
              <div
                style={{
                  fontFamily: F.heading,
                  fontSize: 9.5,
                  fontWeight: 800,
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  color: C.red,
                }}
              >
                Tecnología iON Race
              </div>
              <div
                style={{
                  fontFamily: F.heading,
                  fontSize: 24,
                  fontWeight: 900,
                  color: C.navy,
                  letterSpacing: '-0.035em',
                  marginTop: 3,
                  lineHeight: 1.05,
                }}
              >
                322 km/h
              </div>
              <div
                style={{
                  fontSize: 11.5,
                  color: C.gray,
                  marginTop: 5,
                  lineHeight: 1.45,
                }}
              >
                Compuesto de competición transferido a tus llantas de calle.
              </div>
            </div>

            {/* Center Levitating Studio Tire Sculpture */}
            <div
              className="fe-minimal-tire-float"
              style={{
                position: 'relative',
                zIndex: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <img
                src="/images/tires/tire-561.png"
                alt="Hankook Formula E Technology"
                onError={(e) => {
                  e.currentTarget.src = '/images/service-tires.png';
                }}
                style={{
                  width: 'clamp(195px, 22vw, 255px)',
                  height: 'clamp(195px, 22vw, 255px)',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 24px 38px rgba(26, 31, 54, 0.18))',
                }}
              />
              <div
                style={{
                  width: 140,
                  height: 14,
                  borderRadius: '50%',
                  background:
                    'radial-gradient(ellipse at center, rgba(26, 31, 54, 0.20) 0%, rgba(26, 31, 54, 0) 72%)',
                  marginTop: -6,
                }}
              />
            </div>

            {/* Right Frosted White Glass Callout Pill */}
            <div
              className="fe-minimal-callout fe-minimal-float-b"
              style={{
                position: 'absolute',
                right: '4%',
                bottom: '16%',
                padding: '18px 22px',
                borderRadius: 24,
                background: 'rgba(255, 255, 255, 0.88)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(26, 31, 54, 0.08)',
                boxShadow: '0 20px 45px rgba(26, 31, 54, 0.06)',
                maxWidth: 265,
              }}
            >
              <div
                style={{
                  fontFamily: F.heading,
                  fontSize: 9.5,
                  fontWeight: 800,
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  color: C.red,
                }}
              >
                Presencia en Pista · CDMX
              </div>
              <div
                style={{
                  fontFamily: F.heading,
                  fontSize: 20,
                  fontWeight: 900,
                  color: C.navy,
                  letterSpacing: '-0.03em',
                  marginTop: 4,
                  lineHeight: 1.1,
                }}
              >
                Autódromo Hnos. Rodríguez
              </div>
              <div
                style={{
                  fontSize: 11.5,
                  color: C.gray,
                  marginTop: 5,
                  lineHeight: 1.45,
                }}
              >
                Patrocinador oficial junto a Hankook en los eventos más importantes.
              </div>
            </div>
          </div>

          {/* Center Editorial Statement */}
          <div
            style={{
              position: 'relative',
              zIndex: 3,
              textAlign: 'center',
              maxWidth: 720,
              margin: '6px auto 36px',
            }}
          >
            <h3
              style={{
                fontFamily: F.heading,
                fontSize: 'clamp(1.85rem, 3.4vw, 2.75rem)',
                fontWeight: 900,
                color: C.navy,
                letterSpacing: '-0.04em',
                lineHeight: 1.06,
                margin: '0 0 12px',
              }}
            >
              Del circuito de la Fórmula E,{' '}
              <span style={{ color: C.red }}>directo a tu vehículo.</span>
            </h3>
            <p
              style={{
                fontSize: 14.5,
                color: '#64748B',
                lineHeight: 1.65,
                margin: '0 0 22px',
              }}
            >
              Junto a <strong style={{ color: C.navy }}>Hankook Tire</strong> —Socio Técnico
              y Proveedor Oficial del <strong style={{ color: C.navy }}>ABB FIA Formula E World Championship</strong>—,
              llevamos la ingeniería probada en pista y eventos internacionales a cada una de nuestras +80 sucursales.
            </p>

            <Link
              to="/landing-tienda-preview/catalogo?brand=Hankook"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                padding: '13px 26px',
                borderRadius: 9999,
                background: C.navy,
                color: '#FFFFFF',
                fontFamily: F.heading,
                fontSize: 11.5,
                fontWeight: 800,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                textDecoration: 'none',
                boxShadow: '0 14px 32px rgba(26, 31, 54, 0.16)',
              }}
            >
              Explorar Colección Hankook <ArrowUpRight size={15} />
            </Link>
          </div>

          {/* Bottom 3-Column Minimalist Architectural Hairline Strip */}
          <div
            className="fe-minimal-pillars-grid"
            style={{
              position: 'relative',
              zIndex: 3,
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 24,
              paddingTop: 26,
              borderTop: '1px solid rgba(26, 31, 54, 0.08)',
            }}
          >
            {[
              {
                num: '01',
                title: 'Socio Oficial Formula E',
                desc: 'Ingeniería desarrollada en la máxima categoría eléctrica mundial con neumáticos Hankook iON.',
              },
              {
                num: '02',
                title: 'Mexico City E-Prix & Eventos',
                desc: 'Presencia oficial Jasman en los eventos automovilísticos y track days más importantes del país.',
              },
              {
                num: '03',
                title: 'De la Pista a la Calle',
                desc: 'Mayor agarre en mojado, menor resistencia al rodamiento y silencio superior para tu auto diario.',
              },
            ].map((item) => (
              <div
                key={item.num}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 14,
                }}
              >
                <span
                  style={{
                    fontFamily: F.heading,
                    fontSize: 11,
                    fontWeight: 900,
                    color: C.red,
                    letterSpacing: '0.1em',
                    paddingTop: 2,
                  }}
                >
                  {item.num}
                </span>
                <div>
                  <div
                    style={{
                      fontFamily: F.heading,
                      fontSize: 13.5,
                      fontWeight: 800,
                      color: C.navy,
                      letterSpacing: '-0.01em',
                      marginBottom: 4,
                    }}
                  >
                    {item.title}
                  </div>
                  <div
                    style={{
                      fontSize: 12.5,
                      color: '#64748B',
                      lineHeight: 1.55,
                    }}
                  >
                    {item.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. MINIMALIST INSTALLATION CONCIERGE BANNER (CTA FINAL) */}
      <section
        style={{
          background: '#FFFFFF',
          color: C.navy,
          padding: '88px 24px',
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            padding: '48px 44px',
            borderRadius: 36,
            background: 'linear-gradient(135deg, #F8F9FA 0%, #FFF5F5 100%)',
            border: '1px solid rgba(196, 30, 36, 0.14)',
            boxShadow: '0 24px 60px rgba(26, 31, 54, 0.05)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 28,
          }}
        >
          <div style={{ maxWidth: 620 }}>
            <span
              style={{
                fontFamily: F.heading,
                fontSize: 10.5,
                fontWeight: 800,
                letterSpacing: '0.24em',
                textTransform: 'uppercase',
                color: C.red,
                display: 'block',
                marginBottom: 10,
              }}
            >
              Instalación Certificada · +80 Sucursales
            </span>
            <h3
              style={{
                fontFamily: F.heading,
                fontSize: 'clamp(1.75rem, 3.2vw, 2.6rem)',
                fontWeight: 900,
                color: C.navy,
                margin: 0,
                letterSpacing: '-0.035em',
                lineHeight: 1.08,
              }}
            >
              Compra hoy. Instala en tu sucursal Jasman.
            </h3>
          </div>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link
              to="/sucursales"
              style={{
                padding: '15px 26px',
                borderRadius: 9999,
                background: C.white,
                border: '1px solid rgba(26,31,54,0.12)',
                color: C.navy,
                fontFamily: F.heading,
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <MapPin size={15} color={C.red} /> Sucursales
            </Link>
            <button
              type="button"
              onClick={() => triggerTiendaUI({ type: 'OPEN_CART' })}
              style={{
                padding: '15px 26px',
                borderRadius: 9999,
                border: 'none',
                background: C.red,
                color: C.white,
                fontFamily: F.heading,
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 10px 26px rgba(196,30,36,0.28)',
              }}
            >
              <ShoppingBag size={15} /> Ver Carrito
            </button>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes jasmanHeroSlideProgress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        @keyframes jasmanReviewsMarquee {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-50%, 0, 0); }
        }
        .jasman-reviews-marquee-track {
          display: flex;
          gap: 22px;
          width: max-content;
          padding-left: 22px;
          animation: jasmanReviewsMarquee 48s linear infinite;
          will-change: transform;
        }
        .jasman-reviews-marquee-track:hover {
          animation-play-state: paused;
        }
        @keyframes feMinimalTireFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes feMinimalFloatA {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-7px); }
        }
        @keyframes feMinimalFloatB {
          0%, 100% { transform: translateY(-6px); }
          50% { transform: translateY(4px); }
        }
        @keyframes feMinimalArcGlide {
          0% { stroke-dashoffset: 1260; }
          100% { stroke-dashoffset: -1260; }
        }
        @keyframes feMinimalRingSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes feMinimalPulseDot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.45; transform: scale(1.3); }
        }
        .fe-minimal-tire-float {
          animation: feMinimalTireFloat 4.8s ease-in-out infinite;
        }
        .fe-minimal-float-a {
          animation: feMinimalFloatA 4.2s ease-in-out infinite;
        }
        .fe-minimal-float-b {
          animation: feMinimalFloatB 4.6s ease-in-out infinite;
        }
        .fe-minimal-arc-glide {
          animation: feMinimalArcGlide 6.5s ease-in-out infinite;
        }
        .fe-minimal-ring-spin {
          transform-origin: 600px 160px;
          animation: feMinimalRingSpin 38s linear infinite;
        }
        .fe-minimal-pulse-dot {
          animation: feMinimalPulseDot 2.2s ease-in-out infinite;
        }
        .jasman-hero-catalog-cta {
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .jasman-hero-catalog-cta:hover {
          background: #C41E24 !important;
          border-color: #C41E24 !important;
          transform: translateY(-1.5px);
          box-shadow: 0 8px 20px rgba(196, 30, 36, 0.24);
        }
        @media (max-width: 960px) {
          .hero-xray-callouts {
            display: none !important;
          }
          .fe-minimal-callout {
            display: none !important;
          }
          .fe-minimal-pillars-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
