import { useState } from 'react';
import { Link } from 'react-router-dom';
import { C, F, useReveal } from '../hooks/useAnimations';
import { ArrowRight, Maximize2, Tag, X } from 'lucide-react';

const TIRE_PROMOTIONS = [
  {
    id: 'bridgestone-msi',
    brand: 'Bridgestone & Firestone',
    badge: 'HASTA 25% + MSI',
    title: 'Bridgestone: Hasta 25% de descuento + 6 MSI',
    vigencia: 'Vigencia del 19 de Octubre al 30 de Noviembre del 2026',
    summary:
      '25% al comprar 4 llantas, 20% en 2 llantas o 10% en 1 llanta participantes (Rin 14 a 23), además hasta 6 meses sin intereses con tarjetas participantes.',
    image: '/images/promos/promo-bridgestone.jpg',
    ctaLabel: 'Ver Llantas Bridgestone',
    to: '/llantas/catalogo?brand=Bridgestone',
  },
  {
    id: 'hankook-30',
    brand: 'Hankook & Laufenn',
    badge: 'HASTA 30% DCTO.',
    title: 'Hankook: Compra tus llantas y llévate hasta 30%',
    vigencia: 'Válida del 12 al 18 de Noviembre del 2026',
    summary:
      'Aplica en llantas de auto y camioneta Hankook y Laufenn a partir de 1 llanta en rin 16" a 20" (consulta medidas y modelos participantes).',
    image: '/images/promos/promo-hankook.jpg',
    ctaLabel: 'Ver Llantas Hankook',
    to: '/llantas/catalogo?brand=Hankook',
  },
];

export default function Promotions() {
  const { ref: headerRef, style: headerStyle } = useReveal('up');
  const { ref: gridRef, style: gridStyle } = useReveal('up');
  const [lightboxPromo, setLightboxPromo] = useState(null);

  return (
    <section
      id="promos"
      style={{
        padding: 'clamp(72px, 9vw, 128px) clamp(16px, 5vw, 40px)',
        background: 'linear-gradient(180deg, #131729 0%, #1A1F36 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: -120,
          right: -120,
          width: 480,
          height: 480,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(227,25,55,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div
          ref={headerRef}
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: 20,
            marginBottom: 'clamp(32px, 5vw, 52px)',
            ...headerStyle,
          }}
        >
          <div style={{ maxWidth: 680 }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 14px',
                borderRadius: 9999,
                background: 'rgba(227,25,55,0.14)',
                border: '1px solid rgba(227,25,55,0.28)',
                color: '#FF5C72',
                fontSize: 11,
                fontWeight: 700,
                fontFamily: F.heading,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginBottom: 16,
              }}
            >
              <Tag size={12} />
              Promociones en Llantas
            </div>
            <h2
              style={{
                fontFamily: F.heading,
                fontSize: 'clamp(1.85rem, 4vw, 3rem)',
                fontWeight: 800,
                color: C.white,
                lineHeight: 1.12,
                letterSpacing: '-0.025em',
                marginBottom: 12,
              }}
            >
              Promociones vigentes en{' '}
              <span style={{ color: '#FF5C72' }}>nuestra Tienda</span>
            </h2>
            <p
              style={{
                fontSize: 'clamp(0.95rem, 1.4vw, 1.05rem)',
                color: 'rgba(255,255,255,0.65)',
                lineHeight: 1.6,
              }}
            >
              Aprovecha descuentos especiales de temporada en marcas participantes y cotiza tus llantas en línea o en cualquiera de nuestras sucursales.
            </p>
          </div>

          <Link
            to="/llantas/catalogo"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '13px 24px',
              borderRadius: 9999,
              background: C.red,
              color: C.white,
              fontFamily: F.heading,
              fontSize: 13,
              fontWeight: 700,
              textDecoration: 'none',
              boxShadow: '0 10px 28px rgba(227,25,55,0.32)',
              whiteSpace: 'nowrap',
            }}
          >
            Explorar Tienda de Llantas
            <ArrowRight size={15} />
          </Link>
        </div>

        <div
          ref={gridRef}
          className="jasman-tire-promos-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: 'clamp(18px, 3vw, 28px)',
            ...gridStyle,
          }}
        >
          {TIRE_PROMOTIONS.map((promo) => (
            <article
              key={promo.id}
              className="jasman-tire-promo-card"
              style={{
                borderRadius: 24,
                overflow: 'hidden',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 24px 60px rgba(0,0,0,0.28)',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div
                role="button"
                tabIndex={0}
                onClick={() => setLightboxPromo(promo)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setLightboxPromo(promo);
                  }
                }}
                aria-label={`Ampliar promoción ${promo.title}`}
                style={{
                  position: 'relative',
                  background: '#FFFFFF',
                  cursor: 'zoom-in',
                  overflow: 'hidden',
                }}
              >
                <img
                  src={promo.image}
                  alt={promo.title}
                  loading="lazy"
                  style={{
                    width: '100%',
                    height: 'auto',
                    display: 'block',
                  }}
                />
                <span
                  style={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    padding: '6px 11px',
                    borderRadius: 9999,
                    background: 'rgba(26,31,54,0.82)',
                    backdropFilter: 'blur(8px)',
                    color: '#FFFFFF',
                    fontSize: 11,
                    fontFamily: F.heading,
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                  }}
                >
                  <Maximize2 size={11} />
                  Ampliar
                </span>
              </div>

              <div
                style={{
                  padding: 'clamp(18px, 2.5vw, 24px)',
                  display: 'flex',
                  flexDirection: 'column',
                  flexGrow: 1,
                  justifyContent: 'space-between',
                  gap: 16,
                }}
              >
                <div>
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 8,
                      marginBottom: 8,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: F.heading,
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        color: '#FF5C72',
                      }}
                    >
                      {promo.brand}
                    </span>
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: 9999,
                        background: 'rgba(227,25,55,0.16)',
                        border: '1px solid rgba(227,25,55,0.32)',
                        color: '#FF7D8F',
                        fontSize: 11,
                        fontWeight: 700,
                        fontFamily: F.heading,
                      }}
                    >
                      {promo.badge}
                    </span>
                  </div>

                  <h3
                    style={{
                      fontFamily: F.heading,
                      fontSize: 'clamp(1.08rem, 1.8vw, 1.3rem)',
                      fontWeight: 800,
                      color: C.white,
                      marginBottom: 6,
                      lineHeight: 1.25,
                    }}
                  >
                    {promo.title}
                  </h3>
                  <p
                    style={{
                      fontSize: 12.5,
                      color: 'rgba(255,255,255,0.58)',
                      lineHeight: 1.55,
                      marginBottom: 6,
                    }}
                  >
                    {promo.summary}
                  </p>
                  <div
                    style={{
                      fontSize: 11.5,
                      fontWeight: 600,
                      color: 'rgba(255,255,255,0.45)',
                    }}
                  >
                    {promo.vigencia}
                  </div>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                  <Link
                    to={promo.to}
                    style={{
                      flex: '1 1 200px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      padding: '12px 18px',
                      borderRadius: 12,
                      background: C.red,
                      color: C.white,
                      fontFamily: F.heading,
                      fontSize: 13,
                      fontWeight: 700,
                      textDecoration: 'none',
                    }}
                  >
                    {promo.ctaLabel}
                    <ArrowRight size={14} />
                  </Link>
                  <button
                    type="button"
                    onClick={() => setLightboxPromo(promo)}
                    style={{
                      padding: '12px 16px',
                      borderRadius: 12,
                      background: 'rgba(255,255,255,0.07)',
                      border: '1px solid rgba(255,255,255,0.14)',
                      color: 'rgba(255,255,255,0.85)',
                      fontFamily: F.heading,
                      fontSize: 12.5,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Ver bases
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {lightboxPromo && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={lightboxPromo.title}
          onClick={() => setLightboxPromo(null)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1200,
            background: 'rgba(10, 13, 24, 0.86)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              maxWidth: 960,
              width: '100%',
              background: '#131729',
              borderRadius: 20,
              overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.16)',
              boxShadow: '0 32px 90px rgba(0,0,0,0.55)',
            }}
          >
            <button
              type="button"
              onClick={() => setLightboxPromo(null)}
              aria-label="Cerrar imagen de promoción"
              style={{
                position: 'absolute',
                top: 12,
                right: 12,
                zIndex: 2,
                width: 38,
                height: 38,
                borderRadius: '50%',
                border: 'none',
                background: 'rgba(26,31,54,0.88)',
                color: '#FFFFFF',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <X size={18} />
            </button>
            <img
              src={lightboxPromo.image}
              alt={lightboxPromo.title}
              style={{
                width: '100%',
                maxHeight: '78vh',
                objectFit: 'contain',
                background: '#FFFFFF',
                display: 'block',
              }}
            />
            <div
              style={{
                padding: '14px 20px',
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
              }}
            >
              <span style={{ color: 'rgba(255,255,255,0.78)', fontSize: 13 }}>
                {lightboxPromo.vigencia}
              </span>
              <Link
                to={lightboxPromo.to}
                onClick={() => setLightboxPromo(null)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '9px 18px',
                  borderRadius: 9999,
                  background: C.red,
                  color: C.white,
                  fontFamily: F.heading,
                  fontSize: 12.5,
                  fontWeight: 700,
                  textDecoration: 'none',
                }}
              >
                {lightboxPromo.ctaLabel}
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 820px) {
          .jasman-tire-promos-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
