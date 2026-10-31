import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { C, F } from '../hooks/useAnimations';
import {
  PRODUCTOS_MASTER,
  BRAND_META,
  formatMXN,
} from '../data/productosMasterData';
import { useTiendaState, triggerTiendaUI } from '../hooks/useTiendaState';
import {
  useStickyScrollProgress,
  useAppleTilt,
  rangeProgress,
} from '../hooks/useAppleScrollPhysics';
import TiendaNavbar from '../components/tienda/TiendaNavbar';
import Tire3DStudioStage from '../components/tienda/Tire3DStudioStage';
import TiendaStickyShowcase from '../components/tienda/TiendaStickyShowcase';
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
  ChevronDown,
  Star,
  Zap,
  Award,
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

const HERO_QUICK_MEASURES = [
  '205/55R16',
  '185/65R15',
  '195/65R15',
  '175/70R14',
  '215/55R17',
  '235/75R15',
];

const BRAND_BENTO_SPECS = {
  Hankook: {
    origin: 'Corea del Sur · Socio Principal',
    families: ['Kinergy ST', 'Ventus S1 evo3', 'Dynapro AT2 / MT2', 'SMaRT FLeX'],
    rims: [
      { label: 'R13', h: 34 },
      { label: 'R14', h: 58 },
      { label: 'R15', h: 86 },
      { label: 'R16', h: 74 },
      { label: 'R17', h: 82 },
      { label: 'R17.5', h: 48 },
      { label: 'R18', h: 64 },
      { label: 'R19.5', h: 52 },
      { label: 'R21', h: 94 },
    ],
  },
  Continental: {
    origin: 'Ingeniería Alemana',
    families: ['UltraContact FR', 'Premium Contact 6', 'PowerContact 2', 'VanContact 100'],
    indices: ['91 V', '91 H', '87 T', '131 R'],
  },
  Euzkadi: {
    origin: 'Tradición & Todo Terreno',
    families: ['Overlander AT2', 'Eurodrive 3', 'All Terrain OWL'],
    badges: ['6PR LT', 'LRC / FR', 'R14 · R15', 'OWL'],
  },
  'General Tire': {
    origin: 'SUV & Pick-Up 4×4',
    families: ['Grabber HTS60 OWL', 'Grabber A/TX'],
    measures: ['245/75R17', '235/75R15', '27X8.50R14'],
  },
  Laufenn: {
    origin: 'Performance R17 · By Hankook',
    families: ['S FIT AS 91W', 'S FIT AS 94W'],
    measures: ['215/45R17', '215/55R17'],
  },
};

function BentoBrandCard({ brand, count, totalStock, meta, sample, isFeatured }) {
  const { tilt, onMouseMove, onMouseLeave } = useAppleTilt(4.5);
  const spec = BRAND_BENTO_SPECS[brand] || {};

  return (
    <Link
      to={`/landing-tienda-preview/catalogo?brand=${encodeURIComponent(brand)}`}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{
        gridColumn: isFeatured ? 'span 2' : 'span 1',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 32,
        padding: isFeatured ? '36px 40px' : '30px 28px',
        background: isFeatured
          ? 'linear-gradient(135deg, #FFFFFF 0%, #FFF7F7 55%, #F8F9FA 100%)'
          : '#FFFFFF',
        color: C.navy,
        border: tilt.active
          ? '1px solid rgba(196, 30, 36, 0.28)'
          : isFeatured
          ? '1px solid rgba(196, 30, 36, 0.14)'
          : '1px solid rgba(26, 31, 54, 0.08)',
        textDecoration: 'none',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: isFeatured ? 340 : 310,
        transform: tilt.active
          ? `perspective(1000px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) translateY(-5px)`
          : 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)',
        boxShadow: tilt.active
          ? '0 32px 64px rgba(26, 31, 54, 0.10), 0 4px 16px rgba(196, 30, 36, 0.05)'
          : '0 8px 30px rgba(26, 31, 54, 0.04)',
        transition: tilt.active
          ? 'transform 0.12s ease-out, box-shadow 0.35s ease, border-color 0.3s ease'
          : 'all 0.55s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {/* Subtle architectural dot pattern in background */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'radial-gradient(rgba(26, 31, 54, 0.045) 1px, transparent 1px)',
          backgroundSize: '22px 22px',
          opacity: tilt.active ? 0.9 : 0.4,
          transition: 'opacity 0.4s ease',
          pointerEvents: 'none',
        }}
      />

      {/* Interactive Cursor Glow */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(480px circle at ${tilt.spotX}% ${tilt.spotY}%, rgba(196, 30, 36, 0.08), transparent 65%)`,
          opacity: tilt.active ? 1 : 0,
          transition: 'opacity 0.35s ease',
          pointerEvents: 'none',
        }}
      />

      {/* Top Bar: Origin Overline + Reference Pill + Arrow */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span
            style={{
              padding: '5px 12px',
              borderRadius: 9999,
              background: isFeatured ? C.red : '#F8F9FA',
              color: isFeatured ? C.white : C.navy,
              border: isFeatured ? 'none' : '1px solid rgba(26,31,54,0.08)',
              fontFamily: F.heading,
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
            }}
          >
            {count} {count === 1 ? 'modelo' : 'modelos'}
          </span>
          <span
            style={{
              fontFamily: F.heading,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: C.gray,
            }}
          >
            {spec.origin}
          </span>
        </div>

        <span
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: tilt.active ? C.red : '#F8F9FA',
            border: `1px solid ${tilt.active ? C.red : 'rgba(26,31,54,0.08)'}`,
            color: tilt.active ? C.white : C.navy,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease',
            flexShrink: 0,
          }}
        >
          <ArrowUpRight size={15} />
        </span>
      </div>

      {/* Centerpiece: Official Vector Brand Logo + Unique Architectural Telemetry Widget */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          my: 18,
          display: 'flex',
          flexDirection: isFeatured ? 'row' : 'column',
          alignItems: isFeatured ? 'center' : 'flex-start',
          justifyContent: 'space-between',
          gap: 24,
          padding: '18px 0',
        }}
      >
        {/* Official Vector Logo Display */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            transform: tilt.active ? 'translateX(4px)' : 'translateX(0)',
            transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {meta?.logo ? (
            <img
              src={meta.logo}
              alt={brand}
              style={{
                height: isFeatured ? 42 : 34,
                maxWidth: isFeatured ? 240 : 190,
                width: 'auto',
                objectFit: 'contain',
                objectPosition: 'left center',
              }}
            />
          ) : (
            <div
              style={{
                fontFamily: F.heading,
                fontSize: isFeatured ? 34 : 26,
                fontWeight: 900,
                letterSpacing: '-0.03em',
                color: C.navy,
              }}
            >
              {brand}
            </div>
          )}
        </div>

        {/* Brand-Specific Architectural Data Visualization (No repeated tire photos!) */}
        {brand === 'Hankook' && spec.rims && (
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              gap: 8,
              height: 86,
              padding: '12px 16px',
              borderRadius: 20,
              background: 'rgba(255, 255, 255, 0.9)',
              border: '1px solid rgba(26, 31, 54, 0.07)',
              boxShadow: '0 10px 30px rgba(26, 31, 54, 0.04)',
            }}
          >
            {spec.rims.map((r, i) => (
              <div
                key={r.label}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 5,
                }}
              >
                <div
                  style={{
                    width: 14,
                    height: 46,
                    borderRadius: 999,
                    background: '#F1F5F9',
                    display: 'flex',
                    alignItems: 'flex-end',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: '100%',
                      height: `${tilt.active ? Math.min(100, r.h + 12) : r.h}%`,
                      borderRadius: 999,
                      background: i % 2 === 0 ? C.red : C.navy,
                      transition: `height ${0.35 + i * 0.04}s cubic-bezier(0.16, 1, 0.3, 1)`,
                    }}
                  />
                </div>
                <span
                  style={{
                    fontFamily: F.heading,
                    fontSize: 8.5,
                    fontWeight: 800,
                    color: C.navy,
                  }}
                >
                  {r.label}
                </span>
              </div>
            ))}
          </div>
        )}

        {brand === 'Continental' && (
          <div
            style={{
              width: '100%',
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 6,
            }}
          >
            {spec.indices.map((idx) => (
              <div
                key={idx}
                style={{
                  padding: '8px 6px',
                  borderRadius: 12,
                  background: '#F8F9FA',
                  border: '1px solid rgba(26,31,54,0.06)',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: 8.5, fontFamily: F.heading, fontWeight: 700, color: C.gray, textTransform: 'uppercase' }}>
                  Índice
                </div>
                <div style={{ fontSize: 12, fontFamily: F.heading, fontWeight: 900, color: C.navy, marginTop: 2 }}>
                  {idx}
                </div>
              </div>
            ))}
          </div>
        )}

        {brand === 'Euzkadi' && (
          <div
            style={{
              width: '100%',
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 6,
            }}
          >
            {spec.badges.map((b) => (
              <div
                key={b}
                style={{
                  padding: '7px 10px',
                  borderRadius: 10,
                  background: '#F8F9FA',
                  border: '1px solid rgba(26,31,54,0.06)',
                  fontFamily: F.heading,
                  fontSize: 10.5,
                  fontWeight: 800,
                  color: C.navy,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span>{b}</span>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: C.red }} />
              </div>
            ))}
          </div>
        )}

        {brand === 'General Tire' && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, width: '100%' }}>
            {spec.measures.map((m) => (
              <span
                key={m}
                style={{
                  padding: '6px 11px',
                  borderRadius: 10,
                  background: '#F8F9FA',
                  border: '1px solid rgba(26,31,54,0.07)',
                  fontFamily: F.heading,
                  fontSize: 11,
                  fontWeight: 800,
                  color: C.navy,
                }}
              >
                {m}
              </span>
            ))}
          </div>
        )}

        {brand === 'Laufenn' && (
          <div
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: 14,
              background: '#F8F9FA',
              border: '1px solid rgba(26,31,54,0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontSize: 9, fontFamily: F.heading, fontWeight: 700, color: C.red, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                Rango Velocidad W
              </div>
              <div style={{ fontSize: 12.5, fontFamily: F.heading, fontWeight: 800, color: C.navy, marginTop: 2 }}>
                215/45R17 · 215/55R17
              </div>
            </div>
            <span
              style={{
                padding: '4px 9px',
                borderRadius: 8,
                background: C.navy,
                color: C.white,
                fontFamily: F.heading,
                fontSize: 10.5,
                fontWeight: 800,
              }}
            >
              R17
            </span>
          </div>
        )}
      </div>

      {/* Bottom Footer: Model Lines Pills + Price & Stock Summary */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          paddingTop: 14,
          borderTop: '1px solid rgba(26, 31, 54, 0.06)',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        {/* Model families */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {spec.families?.map((fam) => (
            <span
              key={fam}
              style={{
                padding: '3px 9px',
                borderRadius: 6,
                background: 'rgba(196, 30, 36, 0.06)',
                color: C.red,
                fontFamily: F.heading,
                fontSize: 10,
                fontWeight: 700,
              }}
            >
              {fam}
            </span>
          ))}
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
            fontSize: 12,
            color: C.gray,
            fontFamily: F.body,
          }}
        >
          {sample ? (
            <span>
              Desde <strong style={{ color: C.navy, fontFamily: F.heading }}>{formatMXN(sample.finalPriceTaxExcluded)}</strong> · Sin IVA
            </span>
          ) : <span />}
          <span style={{ fontSize: 11, fontWeight: 700, color: '#15803D', fontFamily: F.heading }}>
            ● {totalStock} uds.
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function LandingTiendaPreviewPage() {
  const { addToCart, coupon } = useTiendaState();
  const heroTrackRef = useRef(null);
  const heroProgress = useStickyScrollProgress(heroTrackRef, 0.14);
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
    PRODUCTOS_MASTER.find((p) => p.id === selectedHeroId) || PRODUCTOS_MASTER[0];

  const brandSelectedSample = {
    Hankook: PRODUCTOS_MASTER.find((p) => p.id === 590),
    Continental: PRODUCTOS_MASTER.find((p) => p.id === 572),
    Euzkadi: PRODUCTOS_MASTER.find((p) => p.id === 569),
    'General Tire': PRODUCTOS_MASTER.find((p) => p.id === 568),
    Laufenn: PRODUCTOS_MASTER.find((p) => p.id === 555),
  };

  const brandCounts = ['Hankook', 'Continental', 'Euzkadi', 'General Tire', 'Laufenn'].map(
    (b) => {
      const brandItems = PRODUCTOS_MASTER.filter((p) => p.brand === b);
      const totalStock = brandItems.reduce((acc, item) => acc + (item.quantity || 0), 0);
      return {
        brand: b,
        count: brandItems.length,
        totalStock,
        meta: BRAND_META[b],
        sample: brandSelectedSample[b] || brandItems.find((p) => p.inStock),
      };
    }
  );

  const handleHeroBuy = () => {
    addToCart(heroProduct.id, 1, true);
    setHeroAdded(true);
    setTimeout(() => setHeroAdded(false), 1500);
  };

  // Scroll-driven choreography values for the Pinned Apple Light Hero
  const splitOffset = rangeProgress(heroProgress, 0, 0.65) * 180;
  const tireScale = 1 + rangeProgress(heroProgress, 0, 0.7) * 0.22;
  const xrayOpacity = rangeProgress(heroProgress, 0.12, 0.42);

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

      {/* 1. APPLE-STYLE PINNED 235VH LIGHT STUDIO SCROLL-ZOOM HERO */}
      <section
        id="hero-stage"
        ref={heroTrackRef}
        style={{
          position: 'relative',
          height: '235vh',
          background: 'linear-gradient(180deg, #FFFFFF 0%, #F8F9FA 65%, #FFFFFF 100%)',
        }}
      >
        <div
          onMouseMove={onHeroMove}
          onMouseLeave={onHeroLeave}
          style={{
            position: 'sticky',
            top: 0,
            height: '100vh',
            width: '100%',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '124px 24px 28px',
            color: C.navy,
          }}
        >
          {/* Soft Brand Aura that follows cursor & scroll on light background */}
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
              transform: `translateY(${-heroProgress * 36}px)`,
              opacity: 1 - rangeProgress(heroProgress, 0.65, 0.98) * 0.45,
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
                  letterSpacing: '0.24em',
                  textTransform: 'uppercase',
                  color: C.red,
                }}
              >
                Jasman Store · {PRODUCTOS_MASTER.length} Referencias Oficiales
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

          {/* Center Stage: Kinetic Split Watermark + Floating Transparent PNG Tire + X-Ray Callouts */}
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
            }}
          >
            {/* Giant Split Kinetic Words that part as you scroll */}
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
                  transform: `translate3d(${-splitOffset}px, 0, 0)`,
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
                  transform: `translate3d(${splitOffset}px, 0, 0)`,
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
              scrollScale={tireScale}
              scrollFloatY={-heroProgress * 18}
              ringRotation={heroProgress * 180}
              size="clamp(240px, 28vw, 355px)"
            />

            {/* Scroll-Revealed Frosted White Glass X-Ray Telemetry Callouts */}
            <div
              className="hero-xray-callouts"
              style={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
              }}
            >
              {/* Left X-Ray Pill */}
              <div
                style={{
                  position: 'absolute',
                  left: '8%',
                  top: '28%',
                  padding: '16px 22px',
                  borderRadius: 22,
                  background: 'rgba(255, 255, 255, 0.88)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid rgba(26, 31, 54, 0.08)',
                  boxShadow: '0 20px 45px rgba(26, 31, 54, 0.07)',
                  opacity: 0.4 + xrayOpacity * 0.6,
                  transform: `translate3d(${(1 - xrayOpacity) * -28}px, 0, 0)`,
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

              {/* Right X-Ray Pill */}
              <div
                style={{
                  position: 'absolute',
                  right: '8%',
                  top: '28%',
                  padding: '16px 22px',
                  borderRadius: 22,
                  background: 'rgba(255, 255, 255, 0.88)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid rgba(26, 31, 54, 0.08)',
                  boxShadow: '0 20px 45px rgba(26, 31, 54, 0.07)',
                  opacity: 0.4 + xrayOpacity * 0.6,
                  transform: `translate3d(${(1 - xrayOpacity) * 28}px, 0, 0)`,
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
              maxWidth: 1020,
              width: '100%',
              margin: '0 auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
            }}
          >
            {/* Model Switcher + Quick Buy Dock */}
            <div
              onMouseEnter={() => setHeroPaused(true)}
              onMouseLeave={() => setHeroPaused(false)}
              style={{
                padding: '12px 18px',
                borderRadius: 9999,
                background: 'rgba(255, 255, 255, 0.90)',
                backdropFilter: 'saturate(180%) blur(24px)',
                WebkitBackdropFilter: 'saturate(180%) blur(24px)',
                border: '1px solid rgba(26, 31, 54, 0.08)',
                boxShadow: '0 20px 50px rgba(26, 31, 54, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 12,
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
                        padding: '8px 15px',
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

              {/* Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button
                  type="button"
                  onClick={handleHeroBuy}
                  style={{
                    padding: '11px 22px',
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
                    padding: '11px 16px',
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
              </div>
            </div>

            {/* Product Excerpt right below the Ficha / Command Bar */}
            {heroProduct?.excerpt && (
              <div
                style={{
                  padding: '8px 18px',
                  borderRadius: 16,
                  background: 'rgba(255, 255, 255, 0.82)',
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

            {/* Quick Measure Shortcuts + Scroll Hint */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 10,
                padding: '0 12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <span
                  style={{
                    fontFamily: F.heading,
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: C.gray,
                    marginRight: 4,
                  }}
                >
                  Medidas rápidas:
                </span>
                {HERO_QUICK_MEASURES.map((m) => (
                  <Link
                    key={m}
                    to={`/landing-tienda-preview/catalogo?measure=${encodeURIComponent(m)}`}
                    style={{
                      padding: '4px 11px',
                      borderRadius: 9999,
                      background: '#FFFFFF',
                      border: '1px solid rgba(26, 31, 54, 0.1)',
                      color: C.navy,
                      fontFamily: F.heading,
                      fontSize: 10.5,
                      fontWeight: 700,
                      textDecoration: 'none',
                      transition: 'all 0.25s ease',
                    }}
                  >
                    {m}
                  </Link>
                ))}
              </div>

              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 11,
                  color: C.gray,
                  fontFamily: F.heading,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                }}
              >
                <span>Desliza para explorar</span>
                <ChevronDown size={14} color={C.red} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. APPLE LIGHT STUDIO 350VH PINNED 4-STAGE SHOWCASE */}
      <div id="seleccion-sticky">
        <TiendaStickyShowcase />
      </div>

      {/* 3. INTERACTIVE 3D BENTO GRID FOR OFFICIAL BRANDS */}
      <section
        id="marcas-tienda"
        style={{
          padding: '112px 24px',
          background: '#FFFFFF',
        }}
      >
        <div style={{ maxWidth: 1260, margin: '0 auto' }}>
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
                  letterSpacing: '0.26em',
                  textTransform: 'uppercase',
                  color: C.red,
                  display: 'block',
                  marginBottom: 10,
                }}
              >
                Ecosistema Oficial
              </span>
              <h2
                style={{
                  fontFamily: F.heading,
                  fontSize: 'clamp(2.1rem, 4.2vw, 3.4rem)',
                  fontWeight: 900,
                  color: C.navy,
                  letterSpacing: '-0.04em',
                  lineHeight: 1.04,
                  margin: 0,
                }}
              >
                Cinco firmas globales.
              </h2>
            </div>

            <Link
              to="/landing-tienda-preview/catalogo"
              style={{
                padding: '12px 22px',
                borderRadius: 9999,
                background: '#F8F9FA',
                border: '1px solid rgba(26,31,54,0.08)',
                color: C.navy,
                fontFamily: F.heading,
                fontSize: 11.5,
                fontWeight: 800,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              Explorar las {PRODUCTOS_MASTER.length} referencias <ArrowRight size={14} />
            </Link>
          </div>

          <div
            className="apple-bento-brands"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 20,
            }}
          >
            {brandCounts.map((item, idx) => (
              <BentoBrandCard
                key={item.brand}
                {...item}
                isFeatured={idx === 0}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 4. UNIFIED CATALOG, MEDIDAS MÁS PEDIDAS & MARCAS MÁS PEDIDAS */}
      <TiendaCatalogSection id="catalogo-tienda" />

      {/* 5. RESEÑAS DE CONDUCTORES VERIFICADOS EN LA LANDING */}
      <section
        id="resenas-tienda"
        style={{
          padding: '104px 24px 88px',
          background: '#FFFFFF',
          borderTop: '1px solid rgba(26, 31, 54, 0.06)',
        }}
      >
        <div style={{ maxWidth: 1260, margin: '0 auto' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 20,
              marginBottom: 44,
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
                · Clientes verificados
              </span>
            </div>
          </div>

          <div
            className="landing-reviews-bento-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 22,
            }}
          >
            {[
              {
                name: 'Alejandro M.',
                city: 'Sucursal Jasman Satélite',
                tire: 'Continental 205/55R16',
                quote:
                  'Compré el juego de 4 llantas en línea con el descuento por volumen y elegí instalación en sucursal. En menos de 45 minutos quedaron montadas, balanceadas y alineadas.',
              },
              {
                name: 'Valeria R.',
                city: 'Entrega a Domicilio CDMX',
                tire: 'Hankook Kinergy ST 185/65R15',
                quote:
                  'El envío a domicilio gratis llegó súper rápido y con fecha de fabricación reciente (DOT nuevo). El agarre en lluvia mejoró muchísimo desde el primer día.',
              },
              {
                name: 'Carlos G.',
                city: 'Sucursal Jasman Monterrey',
                tire: 'General Tire Grabber 245/75R17',
                quote:
                  'Excelente atención y precios directos. Poder comparar medidas en el catálogo y elegir entre entrega gratis o montaje en sucursal hace toda la diferencia.',
              },
            ].map((rev) => (
              <div
                key={rev.name}
                style={{
                  padding: '30px 28px',
                  borderRadius: 28,
                  background: '#F8F9FA',
                  border: '1px solid rgba(26, 31, 54, 0.07)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: 20,
                  boxShadow: '0 12px 34px rgba(26, 31, 54, 0.03)',
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
                      fontSize: 14,
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
            ))}
          </div>
        </div>
      </section>

      {/* 6. FRANJA OFICIAL DE PATROCINIO: FÓRMULA E & EVENTOS AUTOMOVILÍSTICOS (Entre Reseñas y CTA Final) */}
      <section
        id="patrocinador-formula-e"
        style={{
          padding: '24px 24px 16px',
          background: '#FFFFFF',
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            borderRadius: 32,
            padding: '38px 42px',
            background:
              'linear-gradient(125deg, #101528 0%, #1A1F36 55%, #2D1622 100%)',
            color: '#FFFFFF',
            border: '1px solid rgba(255, 255, 255, 0.10)',
            boxShadow: '0 26px 64px rgba(16, 21, 40, 0.18)',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 28,
          }}
        >
          {/* Subtle Motorsport Telemetry Grid Accent */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage:
                'radial-gradient(rgba(255, 255, 255, 0.06) 1px, transparent 1px)',
              backgroundSize: '20px 20px',
              pointerEvents: 'none',
            }}
          />

          <div style={{ position: 'relative', zIndex: 2, maxWidth: 660 }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '5px 13px',
                borderRadius: 9999,
                background: 'rgba(196, 30, 36, 0.25)',
                border: '1px solid rgba(248, 113, 113, 0.35)',
                color: '#FCA5A5',
                fontFamily: F.heading,
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                marginBottom: 12,
              }}
            >
              <Zap size={12} /> Patrocinador Oficial & Presencia en Pista · ABB FIA Formula E
            </div>

            <h3
              style={{
                fontFamily: F.heading,
                fontSize: 'clamp(1.6rem, 2.9vw, 2.35rem)',
                fontWeight: 900,
                color: '#FFFFFF',
                letterSpacing: '-0.03em',
                lineHeight: 1.1,
                margin: '0 0 10px',
              }}
            >
              Del circuito de la Fórmula E directo a tu vehículo.
            </h3>

            <p
              style={{
                fontSize: 13.5,
                color: '#CBD5E1',
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              Junto a <strong style={{ color: '#FFFFFF' }}>Hankook Tire</strong> —Socio Técnico y Proveedor Oficial del{' '}
              <strong style={{ color: '#FFFFFF' }}>ABB FIA Formula E World Championship</strong> y el{' '}
              <strong style={{ color: '#FFFFFF' }}>Hankook Mexico City E-Prix</strong>— llevamos la tecnología de competición y eventos internacionales a cada sucursal Jasman.
            </p>
          </div>

          {/* Right Motorsport Badges */}
          <div
            style={{
              position: 'relative',
              zIndex: 2,
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: 12,
            }}
          >
            {[
              {
                title: 'ABB FIA Formula E',
                sub: 'Hankook iON Race · Partner Oficial',
              },
              {
                title: 'Mexico City E-Prix',
                sub: 'Autódromo Hnos. Rodríguez',
              },
              {
                title: 'Eventos & Track Days',
                sub: 'Patrocinador Oficial Jasman',
              },
            ].map((badge) => (
              <div
                key={badge.title}
                style={{
                  padding: '14px 18px',
                  borderRadius: 18,
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  backdropFilter: 'blur(12px)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontFamily: F.heading,
                    fontSize: 12,
                    fontWeight: 900,
                    color: '#FFFFFF',
                  }}
                >
                  <Award size={14} color="#F87171" />
                  <span>{badge.title}</span>
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: '#94A3B8',
                    marginTop: 3,
                    fontWeight: 600,
                  }}
                >
                  {badge.sub}
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
        @media (max-width: 920px) {
          .hero-xray-callouts {
            display: none !important;
          }
          .apple-bento-brands {
            grid-template-columns: 1fr !important;
          }
          .apple-bento-brands > a {
            grid-column: span 1 !important;
          }
          .landing-reviews-bento-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
