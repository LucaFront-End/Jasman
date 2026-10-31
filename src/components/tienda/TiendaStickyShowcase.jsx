import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { C, F } from '../../hooks/useAnimations';
import { PRODUCTOS_MASTER, formatMXN } from '../../data/productosMasterData';
import { useTiendaState } from '../../hooks/useTiendaState';
import { useStickyScrollProgress, useAppleTilt, clamp } from '../../hooks/useAppleScrollPhysics';
import Tire3DStudioStage from './Tire3DStudioStage';
import { ShoppingBag, ArrowUpRight, Check } from 'lucide-react';

const CHAPTERS = [
  {
    step: '01',
    tag: 'Sedán & Ciudad',
    watermark: 'ULTRACONTACT',
    headline: 'Silencio. Precisión.',
    sub: '205/55R16 Continental UltraContact FR 91 V',
    glow: 'rgba(196, 30, 36, 0.10)',
    productId: 572,
  },
  {
    step: '02',
    tag: 'Confort & Autopista',
    watermark: 'PREMIUM 6',
    headline: 'Control total.',
    sub: '195/65R15 Continental Premium Contact 6 91 H',
    glow: 'rgba(26, 31, 54, 0.08)',
    productId: 539,
  },
  {
    step: '03',
    tag: 'SUV & Todo Terreno',
    watermark: 'GRABBER',
    headline: 'Dominio absoluto.',
    sub: '245/75R17 General Tire Grabber HTS60 OWL 121/118 S',
    glow: 'rgba(196, 30, 36, 0.11)',
    productId: 568,
  },
  {
    step: '04',
    tag: 'Transporte & Flotilla',
    watermark: 'SMART FLEX',
    headline: 'Carga sin límites.',
    sub: '225/70R19.5 Hankook SMaRT FLeX DH35 128/126 N',
    glow: 'rgba(26, 31, 54, 0.09)',
    productId: 558,
  },
];

export default function TiendaStickyShowcase() {
  const containerRef = useRef(null);
  const progress = useStickyScrollProgress(containerRef, 0.12);
  const { tilt, onMouseMove, onMouseLeave } = useAppleTilt(6.5);
  const [manualOverride, setManualOverride] = useState(null);
  const [addedId, setAddedId] = useState(null);
  const { addToCart, coupon } = useTiendaState();

  const items = CHAPTERS.map((ch) => ({
    ...ch,
    product: PRODUCTOS_MASTER.find((p) => p.id === ch.productId) || PRODUCTOS_MASTER[0],
  }));

  const scrollIndex = clamp(Math.floor(progress * items.length), 0, items.length - 1);
  const activeIndex = manualOverride !== null ? manualOverride : scrollIndex;

  const segmentSize = 1 / items.length;
  const localProgress = clamp(
    (progress - scrollIndex * segmentSize) / segmentSize,
    0,
    1
  );

  const current = items[activeIndex] || items[0];
  const prod = current.product;
  const basePrice = prod.finalPriceTaxExcluded || 0;
  const displayPrice = coupon ? basePrice * 0.9 : basePrice;

  const jumpToChapter = (idx) => {
    setManualOverride(idx);
    const el = containerRef.current;
    if (el) {
      const rect = el.getBoundingClientRect();
      const absTop = window.scrollY + rect.top;
      const scrollable = Math.max(1, el.offsetHeight - window.innerHeight);
      const targetY = absTop + (idx + 0.25) * (scrollable / items.length);
      window.scrollTo({ top: targetY, behavior: 'smooth' });
      setTimeout(() => setManualOverride(null), 900);
    }
  };

  const handleBuy = (id) => {
    addToCart(id, 1, true);
    setAddedId(id);
    setTimeout(() => setAddedId(null), 1500);
  };

  return (
    <section
      ref={containerRef}
      style={{
        position: 'relative',
        height: '350vh',
        background: 'linear-gradient(180deg, #FFFFFF 0%, #F8F9FA 50%, #FFFFFF 100%)',
        borderTop: '1px solid rgba(26, 31, 54, 0.06)',
        borderBottom: '1px solid rgba(26, 31, 54, 0.06)',
      }}
    >
      {/* Pinned 100vh Apple Light Studio Viewport */}
      <div
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          width: '100%',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '92px 24px 36px',
          color: C.navy,
        }}
      >
        {/* Dynamic Soft Brand Aura */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '48%',
            transform: `translate(-50%, -50%) scale(${1 + Math.sin(progress * Math.PI) * 0.16})`,
            width: '66vw',
            height: '66vw',
            maxWidth: 760,
            maxHeight: 760,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${current.glow} 0%, rgba(255,255,255,0) 70%)`,
            filter: 'blur(36px)',
            transition: 'background 0.8s ease',
            pointerEvents: 'none',
          }}
        />

        {/* Giant Kinetic Watermark Typography gliding horizontally */}
        <div
          style={{
            position: 'absolute',
            top: '44%',
            left: '50%',
            transform: `translate3d(${-50 + (0.5 - localProgress) * 18}%, -50%, 0)`,
            fontFamily: F.heading,
            fontSize: 'clamp(4.5rem, 15vw, 14.5rem)',
            fontWeight: 900,
            letterSpacing: '-0.05em',
            whiteSpace: 'nowrap',
            color: 'rgba(26, 31, 54, 0.04)',
            pointerEvents: 'none',
            userSelect: 'none',
            zIndex: 1,
          }}
        >
          {current.watermark}
        </div>

        {/* Top Bar: Progress Rail + Chapter Title */}
        <div
          style={{
            maxWidth: 1240,
            width: '100%',
            margin: '0 auto',
            position: 'relative',
            zIndex: 5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                marginBottom: 6,
              }}
            >
              <span
                style={{
                  fontFamily: F.heading,
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: '0.28em',
                  textTransform: 'uppercase',
                  color: C.red,
                }}
              >
                {current.step} / 04 — {current.tag}
              </span>
            </div>
            <h2
              key={current.headline}
              style={{
                fontFamily: F.heading,
                fontSize: 'clamp(1.85rem, 4vw, 3.4rem)',
                fontWeight: 900,
                letterSpacing: '-0.04em',
                lineHeight: 1.02,
                margin: 0,
                color: C.navy,
                animation: 'heroFadeIn 0.45s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              {current.headline}
            </h2>
          </div>

          {/* Chapter Pills + Continuous Scroll Progress Bar */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
            <div
              style={{
                display: 'flex',
                gap: 6,
                padding: 4,
                borderRadius: 9999,
                background: 'rgba(26, 31, 54, 0.05)',
                border: '1px solid rgba(26, 31, 54, 0.08)',
              }}
            >
              {items.map((item, idx) => {
                const isAct = idx === activeIndex;
                return (
                  <button
                    key={item.step}
                    type="button"
                    onClick={() => jumpToChapter(idx)}
                    style={{
                      padding: '7px 14px',
                      borderRadius: 9999,
                      border: 'none',
                      background: isAct ? C.red : 'transparent',
                      color: isAct ? C.white : C.navy,
                      fontFamily: F.heading,
                      fontSize: 11,
                      fontWeight: 800,
                      letterSpacing: '0.08em',
                      cursor: 'pointer',
                      boxShadow: isAct ? '0 4px 14px rgba(196,30,36,0.3)' : 'none',
                      transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
                    }}
                  >
                    {item.step}
                  </button>
                );
              })}
            </div>

            {/* Smooth Scroll Progress Line */}
            <div
              style={{
                width: 180,
                height: 3,
                borderRadius: 999,
                background: 'rgba(26, 31, 54, 0.1)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${Math.round(progress * 100)}%`,
                  height: '100%',
                  background: C.red,
                  borderRadius: 999,
                }}
              />
            </div>
          </div>
        </div>

        {/* Center: Pure Floating PNG Tire + Orbital Rings + Frosted White Glass Nodes */}
        <div
          style={{
            position: 'relative',
            zIndex: 4,
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            maxWidth: 1200,
            width: '100%',
            margin: '0 auto',
          }}
        >
          {/* Outer Rotating Brand Technical Ring */}
          <div
            style={{
              position: 'absolute',
              width: 'clamp(280px, 42vw, 480px)',
              height: 'clamp(280px, 42vw, 480px)',
              borderRadius: '50%',
              border: '1px dashed rgba(196, 30, 36, 0.22)',
              transform: `rotate(${progress * 180}deg)`,
              pointerEvents: 'none',
            }}
          />

          {/* Inner Counter-Rotating Ring */}
          <div
            style={{
              position: 'absolute',
              width: 'clamp(240px, 34vw, 380px)',
              height: 'clamp(240px, 34vw, 380px)',
              borderRadius: '50%',
              border: '1px solid rgba(26, 31, 54, 0.08)',
              transform: `rotate(${-progress * 120}deg)`,
              pointerEvents: 'none',
            }}
          />

          {/* 3D Interactive Tire Stage (3/4 View) */}
          <Tire3DStudioStage
            product={prod}
            rx={tilt.rx}
            ry={tilt.ry}
            spotX={tilt.spotX}
            spotY={tilt.spotY}
            scrollScale={0.96 + Math.sin(localProgress * Math.PI) * 0.08}
            scrollFloatY={Math.sin(localProgress * Math.PI) * -10}
            ringRotation={progress * 220}
            size="clamp(235px, 29vw, 355px)"
          />

          {/* 4 Orbiting Frosted White Glass Spec Nodes */}
          <div
            className="apple-orbit-nodes"
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
            }}
          >
            {/* Top-Left Node: Medida */}
            <div
              style={{
                position: 'absolute',
                left: '8%',
                top: '16%',
                padding: '16px 22px',
                borderRadius: 22,
                background: 'rgba(255, 255, 255, 0.88)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(26, 31, 54, 0.08)',
                boxShadow: '0 20px 45px rgba(26, 31, 54, 0.07)',
                transform: `translateY(${(0.5 - localProgress) * 24}px)`,
              }}
            >
              <div style={{ fontSize: 9.5, fontFamily: F.heading, fontWeight: 800, letterSpacing: '0.2em', color: C.red, textTransform: 'uppercase' }}>
                Medida Oficial
              </div>
              <div style={{ fontSize: 22, fontFamily: F.heading, fontWeight: 900, color: C.navy, letterSpacing: '-0.02em', marginTop: 2 }}>
                {prod.measure || 'Estándar'}
              </div>
            </div>

            {/* Bottom-Left Node: Marca & Rin */}
            <div
              style={{
                position: 'absolute',
                left: '10%',
                bottom: '16%',
                padding: '16px 22px',
                borderRadius: 22,
                background: 'rgba(255, 255, 255, 0.88)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(26, 31, 54, 0.08)',
                boxShadow: '0 20px 45px rgba(26, 31, 54, 0.07)',
                transform: `translateY(${(localProgress - 0.5) * 24}px)`,
              }}
            >
              <div style={{ fontSize: 9.5, fontFamily: F.heading, fontWeight: 800, letterSpacing: '0.2em', color: C.red, textTransform: 'uppercase' }}>
                Fabricante · Rin
              </div>
              <div style={{ fontSize: 18, fontFamily: F.heading, fontWeight: 800, color: C.navy, marginTop: 2 }}>
                {prod.brand} · {prod.rim || '—'}
              </div>
            </div>

            {/* Top-Right Node: Índice Carga/Velocidad */}
            <div
              style={{
                position: 'absolute',
                right: '8%',
                top: '18%',
                padding: '16px 22px',
                borderRadius: 22,
                background: 'rgba(255, 255, 255, 0.88)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(26, 31, 54, 0.08)',
                boxShadow: '0 20px 45px rgba(26, 31, 54, 0.07)',
                transform: `translateY(${(localProgress - 0.5) * 28}px)`,
              }}
            >
              <div style={{ fontSize: 9.5, fontFamily: F.heading, fontWeight: 800, letterSpacing: '0.2em', color: C.red, textTransform: 'uppercase' }}>
                Índice Carga / Vel.
              </div>
              <div style={{ fontSize: 20, fontFamily: F.heading, fontWeight: 900, color: C.navy, marginTop: 2 }}>
                {prod.loadSpeed || 'Oficial'}
              </div>
            </div>

            {/* Bottom-Right Node: Existencia Real */}
            <div
              style={{
                position: 'absolute',
                right: '10%',
                bottom: '16%',
                padding: '16px 22px',
                borderRadius: 22,
                background: 'rgba(255, 255, 255, 0.88)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(26, 31, 54, 0.08)',
                boxShadow: '0 20px 45px rgba(26, 31, 54, 0.07)',
                transform: `translateY(${(0.5 - localProgress) * 24}px)`,
              }}
            >
              <div style={{ fontSize: 9.5, fontFamily: F.heading, fontWeight: 800, letterSpacing: '0.2em', color: C.red, textTransform: 'uppercase' }}>
                Disponibilidad
              </div>
              <div style={{ fontSize: 18, fontFamily: F.heading, fontWeight: 800, color: '#15803D', marginTop: 2 }}>
                ● {prod.quantity} en stock
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Floating Frosted White Glass Dock */}
        <div
          style={{
            maxWidth: 940,
            width: '100%',
            margin: '0 auto',
            position: 'relative',
            zIndex: 5,
            padding: '16px 24px',
            borderRadius: 24,
            background: 'rgba(255, 255, 255, 0.90)',
            backdropFilter: 'saturate(180%) blur(24px)',
            WebkitBackdropFilter: 'saturate(180%) blur(24px)',
            border: '1px solid rgba(26, 31, 54, 0.08)',
            boxShadow: '0 24px 60px rgba(26, 31, 54, 0.09)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 11, color: C.gray, fontFamily: F.body }}>
              SKU {prod.reference} · {prod.category}
            </div>
            <div
              style={{
                fontFamily: F.heading,
                fontSize: 'clamp(0.95rem, 1.6vw, 1.2rem)',
                fontWeight: 800,
                color: C.navy,
                marginTop: 2,
              }}
            >
              {prod.cleanTitle}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ textAlign: 'right' }}>
              <div
                style={{
                  fontFamily: F.heading,
                  fontSize: 22,
                  fontWeight: 900,
                  color: C.navy,
                  letterSpacing: '-0.03em',
                }}
              >
                {formatMXN(displayPrice)}
              </div>
              <div style={{ fontSize: 10, color: C.gray }}>
                {coupon ? 'Con −10% 1ª compra · Sin IVA' : 'MXN · Sin IVA'}
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleBuy(prod.id)}
              style={{
                padding: '13px 22px',
                borderRadius: 9999,
                border: 'none',
                background: addedId === prod.id ? '#16A34A' : C.red,
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
                boxShadow: '0 10px 28px rgba(196,30,36,0.32)',
                transition: 'all 0.25s ease',
              }}
            >
              {addedId === prod.id ? (
                <>
                  <Check size={14} /> Agregado
                </>
              ) : (
                <>
                  <ShoppingBag size={14} /> Comprar
                </>
              )}
            </button>

            <Link
              to={`/landing-tienda-preview/producto/${prod.id}`}
              style={{
                width: 42,
                height: 42,
                borderRadius: '50%',
                border: '1px solid rgba(26,31,54,0.12)',
                background: '#F8F9FA',
                color: C.navy,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                textDecoration: 'none',
              }}
              aria-label="Ver ficha de producto"
            >
              <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .apple-orbit-nodes {
            display: none !important;
          }
        }
      `}</style>
    </section>
  );
}
