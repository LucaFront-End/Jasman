import { useState } from 'react';
import { Link } from 'react-router-dom';
import { C, F } from '../../hooks/useAnimations';
import { formatMXN, BRAND_META } from '../../data/productosMasterData';
import { useTiendaState } from '../../hooks/useTiendaState';
import { useAppleTilt } from '../../hooks/useAppleScrollPhysics';
import { Plus, Check, ArrowUpRight } from 'lucide-react';

export default function TiendaProductCard({
  product,
  compact = false,
  featured = false,
  promoBadge = null,
  msiMonths = null,
}) {
  const [addedFeedback, setAddedFeedback] = useState(false);
  const [imgError, setImgError] = useState(false);
  const { addToCart, coupon } = useTiendaState();
  const { tilt, onMouseMove, onMouseLeave } = useAppleTilt(featured ? 3.5 : 4.5);

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product.inStock) return;
    addToCart(product.id, 1, true);
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 1400);
  };

  const basePrice = product.finalPriceTaxExcluded || 0;
  const discountedPrice = coupon && basePrice > 0 ? basePrice * 0.9 : null;
  const brandMeta = BRAND_META[product.brand];

  // Always show the 3/4 view
  const isCutoutActive = product.hasPngCutout && !imgError;
  const displayImg = imgError
    ? '/images/service-tires.png'
    : isCutoutActive
    ? product.cutoutImage
    : product.primaryImage;

  // 2-COLUMN EDITORIAL SPOTLIGHT CARD (breaks grid monotony)
  if (featured && !compact) {
    return (
      <Link
        to={`/llantas/producto/${product.id}`}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        className="tienda-spotlight-card"
        style={{
          gridColumn: 'span 2',
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.08fr) minmax(0, 0.92fr)',
          gap: 28,
          alignItems: 'center',
          background:
            'linear-gradient(135deg, #FFFFFF 0%, #FFF8F8 58%, #F8F9FA 100%)',
          borderRadius: 32,
          border: `1px solid ${
            tilt.active
              ? 'rgba(196, 30, 36, 0.30)'
              : 'rgba(196, 30, 36, 0.14)'
          }`,
          padding: '32px 34px',
          textDecoration: 'none',
          color: C.navy,
          position: 'relative',
          overflow: 'hidden',
          transform: tilt.active
            ? `perspective(1100px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) translateY(-5px)`
            : 'perspective(1100px) rotateX(0deg) rotateY(0deg) translateY(0)',
          boxShadow: tilt.active
            ? '0 34px 68px rgba(26, 31, 54, 0.11), 0 4px 20px rgba(196, 30, 36, 0.06)'
            : '0 10px 34px rgba(26, 31, 54, 0.05)',
          transition: tilt.active
            ? 'transform 0.12s ease-out, box-shadow 0.35s ease'
            : 'all 0.55s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Subtle dot pattern */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'radial-gradient(rgba(26, 31, 54, 0.04) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
            pointerEvents: 'none',
          }}
        />

        {/* Left Editorial Info Column */}
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: '100%',
            gap: 18,
          }}
        >
          <div>
            {/* Brand Logo + Badges */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 10,
                marginBottom: 16,
              }}
            >
              {brandMeta?.logo ? (
                <img
                  src={brandMeta.logo}
                  alt={product.brand}
                  style={{
                    height: 24,
                    maxWidth: 118,
                    width: 'auto',
                    objectFit: 'contain',
                    borderRadius: 3,
                  }}
                />
              ) : (
                <span
                  style={{
                    fontFamily: F.heading,
                    fontSize: 12,
                    fontWeight: 900,
                    color: C.red,
                    textTransform: 'uppercase',
                  }}
                >
                  {product.brand}
                </span>
              )}

              <div style={{ display: 'flex', gap: 6 }}>
                <span
                  style={{
                    padding: '4px 10px',
                    borderRadius: 9999,
                    background: C.red,
                    color: C.white,
                    fontFamily: F.heading,
                    fontSize: 9.5,
                    fontWeight: 800,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                  }}
                >
                  Destacado
                </span>
                {product.measure && (
                  <span
                    style={{
                      padding: '4px 10px',
                      borderRadius: 9999,
                      background: C.navy,
                      color: C.white,
                      fontFamily: F.heading,
                      fontSize: 10,
                      fontWeight: 800,
                    }}
                  >
                    {product.measure}
                  </span>
                )}
              </div>
            </div>

            <h3
              style={{
                fontFamily: F.heading,
                fontSize: 'clamp(1.25rem, 2vw, 1.55rem)',
                fontWeight: 900,
                lineHeight: 1.2,
                letterSpacing: '-0.025em',
                color: C.navy,
                margin: '0 0 14px',
              }}
            >
              {product.cleanTitle}
            </h3>

            {/* 4-Pill Real Telemetry Strip */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 8,
              }}
            >
              {[
                { k: 'Ancho', v: product.width || '—' },
                { k: 'Perfil', v: product.profile || '—' },
                { k: 'Rin', v: product.rim || '—' },
                { k: 'Índice', v: product.loadSpeed || 'Oficial' },
              ].map((cell) => (
                <div
                  key={cell.k}
                  style={{
                    padding: '8px 10px',
                    borderRadius: 12,
                    background: 'rgba(255,255,255,0.85)',
                    border: '1px solid rgba(26,31,54,0.07)',
                  }}
                >
                  <div
                    style={{
                      fontSize: 8.5,
                      fontFamily: F.heading,
                      fontWeight: 700,
                      color: C.gray,
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                    }}
                  >
                    {cell.k}
                  </div>
                  <div
                    style={{
                      fontSize: 12.5,
                      fontFamily: F.heading,
                      fontWeight: 900,
                      color: C.navy,
                      marginTop: 2,
                    }}
                  >
                    {cell.v}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Price + Action Row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              paddingTop: 14,
              borderTop: '1px solid rgba(26, 31, 54, 0.08)',
            }}
          >
            <div>
              {discountedPrice ? (
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <span
                    style={{
                      fontFamily: F.heading,
                      fontSize: 22,
                      fontWeight: 900,
                      color: C.red,
                      letterSpacing: '-0.03em',
                    }}
                  >
                    {formatMXN(discountedPrice)}
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      color: '#94A3B8',
                      textDecoration: 'line-through',
                    }}
                  >
                    {formatMXN(basePrice)}
                  </span>
                </div>
              ) : (
                <div
                  style={{
                    fontFamily: F.heading,
                    fontSize: 22,
                    fontWeight: 900,
                    color: C.navy,
                    letterSpacing: '-0.03em',
                  }}
                >
                  {formatMXN(basePrice)}
                </div>
              )}
              <span style={{ fontSize: 10.5, color: '#15803D', fontWeight: 700 }}>
                ● {product.quantity} en inventario · Con IVA
              </span>
            </div>

            {product.inStock && (
              <button
                type="button"
                onClick={handleQuickAdd}
                style={{
                  padding: '12px 22px',
                  borderRadius: 9999,
                  border: 'none',
                  background: addedFeedback ? '#16A34A' : C.red,
                  color: C.white,
                  fontFamily: F.heading,
                  fontSize: 11.5,
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 7,
                  boxShadow: '0 10px 24px rgba(196, 30, 36, 0.28)',
                }}
              >
                {addedFeedback ? (
                  <>
                    <Check size={14} /> Agregado
                  </>
                ) : (
                  <>
                    <Plus size={15} /> Agregar
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Right 3/4 Tire Canvas */}
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            height: 245,
            borderRadius: 24,
            background: 'rgba(255, 255, 255, 0.75)',
            border: '1px solid rgba(26, 31, 54, 0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
            overflow: 'hidden',
          }}
        >
          {/* Perspective Platform Ring under tire */}
          <div
            style={{
              position: 'absolute',
              bottom: 14,
              width: '78%',
              height: 46,
              borderRadius: '50%',
              border: '1.5px dashed rgba(196, 30, 36, 0.28)',
              background:
                'radial-gradient(ellipse at center, rgba(26,31,54,0.16) 0%, rgba(26,31,54,0) 70%)',
              pointerEvents: 'none',
            }}
          />

          <img
            src={displayImg}
            alt={product.cleanTitle}
            loading="lazy"
            onError={() => setImgError(true)}
            style={{
              width: '86%',
              height: '86%',
              objectFit: 'contain',
              mixBlendMode: isCutoutActive ? 'normal' : 'multiply',
              filter: isCutoutActive
                ? 'drop-shadow(0 22px 28px rgba(26, 31, 54, 0.22)) contrast(1.04)'
                : 'brightness(1.03) contrast(1.08)',
              transform: tilt.active
                ? 'scale(1.08) translateY(-6px)'
                : 'scale(1) translateY(0)',
              transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          />
        </div>
        <style>{`
          @media (max-width: 768px) {
            .tienda-spotlight-card {
              grid-column: span 1 !important;
              grid-template-columns: 1fr !important;
              padding: 22px 20px !important;
              gap: 18px !important;
            }
          }
        `}</style>
      </Link>
    );
  }

  // STANDARD 3/4 PRODUCT CARD
  return (
    <Link
      to={`/llantas/producto/${product.id}`}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: product.isPackage
          ? 'linear-gradient(180deg, #FFFFFF 0%, #FFFBFB 100%)'
          : '#FFFFFF',
        borderRadius: 28,
        border: `1px solid ${
          tilt.active
            ? 'rgba(196, 30, 36, 0.25)'
            : product.isPackage
            ? 'rgba(196, 30, 36, 0.12)'
            : 'rgba(15, 23, 42, 0.06)'
        }`,
        padding: compact ? 22 : 24,
        textDecoration: 'none',
        color: C.navy,
        position: 'relative',
        overflow: 'hidden',
        transform: tilt.active
          ? `perspective(1000px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) translateY(-6px)`
          : 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)',
        boxShadow: tilt.active
          ? '0 32px 64px rgba(15, 23, 42, 0.10), 0 4px 16px rgba(196, 30, 36, 0.04)'
          : '0 4px 20px rgba(15, 23, 42, 0.03)',
        transition: tilt.active
          ? 'box-shadow 0.35s ease, border-color 0.35s ease, transform 0.12s ease-out'
          : 'all 0.55s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {/* Interactive Cursor Spotlight */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(420px circle at ${tilt.spotX}% ${tilt.spotY}%, rgba(196, 30, 36, 0.055), transparent 65%)`,
          opacity: tilt.active ? 1 : 0,
          transition: 'opacity 0.35s ease',
          pointerEvents: 'none',
        }}
      />

      {/* Top Header: Official Vector Brand Logo + Measure Pill */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {brandMeta?.logo ? (
            <img
              src={brandMeta.logo}
              alt={product.brand}
              style={{
                height: 18,
                maxWidth: 102,
                width: 'auto',
                objectFit: 'contain',
                borderRadius: 3,
              }}
            />
          ) : (
            <span
              style={{
                fontFamily: F.heading,
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: C.red,
              }}
            >
              {product.brand}
            </span>
          )}
        </div>

        {product.measure && (
          <span
            style={{
              padding: '4px 10px',
              borderRadius: 9999,
              background: tilt.active ? C.navy : '#F5F5F7',
              color: tilt.active ? C.white : C.navy,
              fontFamily: F.heading,
              fontSize: 10.5,
              fontWeight: 800,
              letterSpacing: '0.04em',
              transition: 'all 0.25s ease',
            }}
          >
            {product.measure}
          </span>
        )}
      </div>

      {/* Center 3/4 Tire Canvas */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          height: compact ? 195 : 225,
          margin: '14px 0',
          borderRadius: 22,
          background:
            'radial-gradient(circle at 50% 42%, #FFFFFF 0%, #F5F5F7 100%)',
          border: '1px solid rgba(26, 31, 54, 0.04)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 22,
          overflow: 'hidden',
        }}
      >
        {promoBadge && (
          <span
            style={{
              position: 'absolute',
              top: 10,
              left: 10,
              zIndex: 3,
              padding: '4px 10px',
              borderRadius: 9999,
              background: promoBadge.bg || 'rgba(196, 30, 36, 0.10)',
              color: promoBadge.color || C.red,
              border: `1px solid ${promoBadge.border || 'rgba(196, 30, 36, 0.18)'}`,
              fontFamily: F.heading,
              fontSize: 9,
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              pointerEvents: 'none',
            }}
          >
            {promoBadge.label}
          </span>
        )}

        {/* Perspective Platform Ring under tire */}
        <div
          style={{
            position: 'absolute',
            bottom: 14,
            width: '74%',
            height: 36,
            borderRadius: '50%',
            border: `1px dashed ${
              tilt.active ? 'rgba(196, 30, 36, 0.35)' : 'rgba(26, 31, 54, 0.12)'
            }`,
            background:
              'radial-gradient(ellipse at center, rgba(26,31,54,0.16) 0%, rgba(26,31,54,0) 72%)',
            transition: 'border-color 0.3s ease',
            pointerEvents: 'none',
          }}
        />

        <img
          src={displayImg}
          alt={product.cleanTitle}
          loading="lazy"
          onError={() => setImgError(true)}
          style={{
            width: '86%',
            height: '86%',
            objectFit: 'contain',
            mixBlendMode: isCutoutActive ? 'normal' : 'multiply',
            filter: isCutoutActive
              ? 'drop-shadow(0 20px 26px rgba(26, 31, 54, 0.22)) contrast(1.04)'
              : 'brightness(1.03) contrast(1.08)',
            transform: tilt.active
              ? 'scale(1.09) translateY(-5px)'
              : 'scale(1) translateY(0)',
            transition: 'transform 0.55s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        />
      </div>

      {/* Bottom Info + Technical Micro-Specs + Magnetic Buy Pill */}
      <div style={{ position: 'relative', zIndex: 2 }}>
        {/* Micro technical strip */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            marginBottom: 6,
            fontSize: 10.5,
            fontFamily: F.heading,
            fontWeight: 700,
            color: C.gray,
          }}
        >
          <span>Rin {product.rim || '—'}</span>
          <span>·</span>
          <span>Índice {product.loadSpeed || 'Estándar'}</span>
          <span>·</span>
          <span>SKU {product.reference}</span>
        </div>

        <h3
          style={{
            fontFamily: F.heading,
            fontSize: compact ? 14 : 14.5,
            fontWeight: 800,
            lineHeight: 1.32,
            letterSpacing: '-0.015em',
            color: C.navy,
            margin: '0 0 14px',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            minHeight: '2.64em',
          }}
        >
          {product.cleanTitle}
        </h3>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10,
            paddingTop: 12,
            borderTop: '1px solid rgba(15, 23, 42, 0.06)',
          }}
        >
          <div>
            {discountedPrice ? (
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span
                  style={{
                    fontFamily: F.heading,
                    fontSize: 18,
                    fontWeight: 900,
                    color: C.red,
                    letterSpacing: '-0.03em',
                  }}
                >
                  {formatMXN(discountedPrice)}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    color: '#94A3B8',
                    textDecoration: 'line-through',
                  }}
                >
                  {formatMXN(basePrice)}
                </span>
              </div>
            ) : (
              <div
                style={{
                  fontFamily: F.heading,
                  fontSize: basePrice > 0 ? 18 : 13,
                  fontWeight: 800,
                  color: basePrice > 0 ? C.navy : C.gray,
                  letterSpacing: '-0.03em',
                }}
              >
                {formatMXN(basePrice)}
              </div>
            )}
            <span style={{ fontSize: 10, color: '#94A3B8', display: 'block', marginTop: 1 }}>
              {product.inStock
                ? msiMonths && basePrice > 0
                  ? `Hasta ${msiMonths}x ${formatMXN(
                      (discountedPrice || basePrice) / msiMonths
                    )} · Con IVA`
                  : `Stock: ${product.quantity} · Con IVA`
                : 'Agotado'}
            </span>
          </div>

          {product.inStock ? (
            <button
              type="button"
              onClick={handleQuickAdd}
              className="tienda-card-quick-add-btn"
              style={{
                height: 38,
                padding: tilt.active || addedFeedback ? '0 16px' : '0 12px',
                borderRadius: 9999,
                border: 'none',
                background: addedFeedback
                  ? '#16A34A'
                  : tilt.active
                  ? C.red
                  : '#F5F5F7',
                color: addedFeedback || tilt.active ? C.white : C.navy,
                fontFamily: F.heading,
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              {addedFeedback ? (
                <>
                  <Check size={14} /> Listo
                </>
              ) : (
                <>
                  <Plus size={15} />
                  <span
                    className="tienda-card-quick-add-txt"
                    style={{ display: tilt.active ? 'inline' : 'none' }}
                  >
                    Agregar
                  </span>
                </>
              )}
            </button>
          ) : (
            <span
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: '#F5F5F7',
                color: C.navy,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ArrowUpRight size={15} />
            </span>
          )}
        </div>
      </div>
      <style>{`
        @media (hover: none), (max-width: 768px) {
          .tienda-card-quick-add-txt {
            display: inline !important;
          }
          .tienda-card-quick-add-btn {
            padding: 0 14px !important;
          }
        }
      `}</style>
    </Link>
  );
}
