import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { C, F } from '../../hooks/useAnimations';
import {
  BRAND_META,
  formatMXN,
  useWixCatalogProducts,
} from '../../data/productosMasterData';
import { useTiendaState } from '../../hooks/useTiendaState';
import {
  Zap,
  Truck,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Plus,
  Check,
  ShieldCheck,
  MoveHorizontal,
} from 'lucide-react';

/**
 * Smooth autonomous + mouse-reactive infinite carousel physics hook.
 * - Glides gently on its own (`baseSpeed` px per 60fps frame).
 * - Moving cursor near left/right 24% edges steers smoothly in that direction.
 * - Hovering center cards gently decelerates to 0 so clicking `+ Agregar` is effortless.
 * - Supports manual Prev/Next smooth impulses and pauses during mobile touch swipes.
 */
function useInteractiveGlideCarousel({ itemCount, baseSpeed = 0.48 }) {
  const trackRef = useRef(null);
  const targetVelRef = useRef(baseSpeed);
  const currentVelRef = useRef(baseSpeed);
  const impulseRef = useRef(0);
  const subPixelRef = useRef(0);
  const touchPauseUntilRef = useRef(0);
  const initializedRef = useRef(false);

  useEffect(() => {
    targetVelRef.current = baseSpeed;
  }, [baseSpeed]);

  useEffect(() => {
    const el = trackRef.current;
    if (!el || itemCount === 0) return undefined;

    let rafId = null;
    let lastTime = performance.now();

    const getLoopPeriod = () => {
      const children = el.children;
      if (children.length > itemCount) {
        const span = children[itemCount].offsetLeft - children[0].offsetLeft;
        if (span > 0) return span;
      }
      return el.scrollWidth / 2;
    };

    // Start reverse-gliding carousels cleanly at the midpoint so leftward wrap is seamless from frame 1
    if (!initializedRef.current && baseSpeed < 0) {
      const initialSpan = getLoopPeriod();
      if (initialSpan > 0) {
        el.scrollLeft = initialSpan;
        initializedRef.current = true;
      }
    }

    const tick = (now) => {
      const dt = Math.min((now - lastTime) / 16.6667, 2.5);
      lastTime = now;

      if (now >= touchPauseUntilRef.current) {
        currentVelRef.current +=
          (targetVelRef.current - currentVelRef.current) * Math.min(0.09 * dt, 0.35);

        let step = currentVelRef.current * dt;

        if (Math.abs(impulseRef.current) > 0.4) {
          const burst = impulseRef.current * Math.min(0.14 * dt, 0.4);
          step += burst;
          impulseRef.current -= burst;
        } else {
          impulseRef.current = 0;
        }

        subPixelRef.current += step;
        if (Math.abs(subPixelRef.current) >= 0.5) {
          const applyPx = subPixelRef.current;
          subPixelRef.current = 0;
          el.scrollLeft += applyPx;
        }

        const period = getLoopPeriod();
        if (period > 40) {
          if (el.scrollLeft >= period) {
            el.scrollLeft -= period;
          } else if (el.scrollLeft <= 1) {
            el.scrollLeft += period;
          }
        }
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [itemCount, baseSpeed]);

  const onMouseMove = useCallback((e) => {
    const el = trackRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0) return;
    const ratio = (e.clientX - rect.left) / rect.width;

    if (ratio < 0.24) {
      const intensity = (0.24 - ratio) / 0.24;
      targetVelRef.current = -(0.55 + intensity * 2.15);
    } else if (ratio > 0.76) {
      const intensity = (ratio - 0.76) / 0.24;
      targetVelRef.current = 0.55 + intensity * 2.15;
    } else {
      // Gentle pause while inspecting a card or hovering `+ Agregar`
      targetVelRef.current = 0;
    }
  }, []);

  const onMouseLeave = useCallback(() => {
    targetVelRef.current = baseSpeed;
  }, [baseSpeed]);

  const onTouchStart = useCallback(() => {
    touchPauseUntilRef.current = performance.now() + 3000;
  }, []);

  const onTouchEnd = useCallback(() => {
    touchPauseUntilRef.current = performance.now() + 1800;
  }, []);

  const stepBy = useCallback((dir) => {
    const el = trackRef.current;
    const stepSize = el ? Math.max(el.clientWidth * 0.68, 300) : 340;
    impulseRef.current += dir * stepSize;
  }, []);

  return {
    trackRef,
    onMouseMove,
    onMouseLeave,
    onTouchStart,
    onTouchEnd,
    stepBy,
  };
}

/* ============================================================================
   CARD STYLE 1: FLASH DEAL VERTICAL CARD (Ofertas Express)
   ============================================================================ */
function ExpressDealCard({ product }) {
  const [hovered, setHovered] = useState(false);
  const [added, setAdded] = useState(false);
  const [imgErr, setImgErr] = useState(false);
  const { addToCart, coupon } = useTiendaState();

  const basePrice = product.finalPriceTaxExcluded || 0;
  const effectivePrice = coupon ? basePrice * 0.9 : basePrice;
  const referenceStrike =
    product.regularPrice && product.regularPrice > effectivePrice
      ? product.regularPrice
      : basePrice * 1.11;
  const savingsPct = Math.max(
    9,
    Math.min(
      25,
      Math.round(((referenceStrike - effectivePrice) / referenceStrike) * 100)
    )
  );

  const brandMeta = BRAND_META[product.brand];
  const imgSrc = imgErr
    ? '/images/service-tires.png'
    : product.hasPngCutout
      ? product.cutoutImage
      : product.primaryImage;

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product.id, 1, true);
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  };

  return (
    <Link
      to={`/landing-tienda-preview/producto/${product.id}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        borderRadius: 26,
        padding: '18px 18px 20px',
        background: '#FFFFFF',
        border: hovered
          ? '1px solid rgba(196, 30, 36, 0.34)'
          : '1px solid rgba(26, 31, 54, 0.07)',
        boxShadow: hovered
          ? '0 24px 48px rgba(196, 30, 36, 0.12)'
          : '0 8px 24px rgba(26, 31, 54, 0.04)',
        transform: hovered ? 'translateY(-5px)' : 'translateY(0)',
        textDecoration: 'none',
        color: C.navy,
        transition: 'all 0.32s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {/* Top Promo Row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
        }}
      >
        <span
          style={{
            padding: '4px 9px',
            borderRadius: 9999,
            background: C.red,
            color: '#FFFFFF',
            fontFamily: F.heading,
            fontSize: 9.5,
            fontWeight: 900,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <Zap size={10} fill="#FFFFFF" /> −{savingsPct}% HOY
        </span>

        {product.measure && (
          <span
            style={{
              padding: '4px 9px',
              borderRadius: 9999,
              background: hovered ? C.navy : '#F1F5F9',
              color: hovered ? '#FFFFFF' : C.navy,
              fontFamily: F.heading,
              fontSize: 10,
              fontWeight: 800,
              transition: 'all 0.25s ease',
            }}
          >
            {product.measure}
          </span>
        )}
      </div>

      {/* Studio Tire Pod */}
      <div
        style={{
          position: 'relative',
          height: 174,
          margin: '12px 0',
          borderRadius: 20,
          background:
            'radial-gradient(circle at 50% 45%, #FFF8F8 0%, #F8FAFC 100%)',
          border: '1px solid rgba(196, 30, 36, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            bottom: 12,
            width: '72%',
            height: 30,
            borderRadius: '50%',
            border: '1px dashed rgba(196, 30, 36, 0.28)',
            background:
              'radial-gradient(ellipse at center, rgba(26,31,54,0.14) 0%, transparent 72%)',
            pointerEvents: 'none',
          }}
        />
        <img
          src={imgSrc}
          alt={product.cleanTitle}
          loading="lazy"
          onError={() => setImgErr(true)}
          style={{
            width: '86%',
            height: '86%',
            objectFit: 'contain',
            filter: 'drop-shadow(0 16px 22px rgba(26, 31, 54, 0.20))',
            transform: hovered ? 'scale(1.08) translateY(-4px)' : 'scale(1)',
            transition: 'transform 0.42s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        />
      </div>

      {/* Brand + Title + Price */}
      <div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 6,
          }}
        >
          {brandMeta?.logo ? (
            <img
              src={brandMeta.logo}
              alt={product.brand}
              style={{
                height: 16,
                maxWidth: 92,
                width: 'auto',
                objectFit: 'contain',
                borderRadius: 2.5,
              }}
            />
          ) : (
            <span
              style={{
                fontFamily: F.heading,
                fontSize: 10,
                fontWeight: 800,
                color: C.red,
                textTransform: 'uppercase',
              }}
            >
              {product.brand}
            </span>
          )}
          <span style={{ fontSize: 10, color: '#94A3B8', fontWeight: 700 }}>
            Rin {product.rim || '—'}
          </span>
        </div>

        <h3
          style={{
            fontFamily: F.heading,
            fontSize: 13.5,
            fontWeight: 800,
            lineHeight: 1.3,
            color: C.navy,
            margin: '0 0 12px',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            minHeight: '2.6em',
          }}
        >
          {product.cleanTitle}
        </h3>

        <div
          style={{
            paddingTop: 11,
            borderTop: '1px solid rgba(26, 31, 54, 0.07)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
          }}
        >
          <div>
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
                {formatMXN(effectivePrice)}
              </span>
              <span
                style={{
                  fontSize: 10.5,
                  color: '#94A3B8',
                  textDecoration: 'line-through',
                }}
              >
                {formatMXN(referenceStrike)}
              </span>
            </div>
            <span style={{ fontSize: 10, color: '#64748B', fontWeight: 600 }}>
              Stock: {product.quantity} · Con IVA
            </span>
          </div>

          <button
            type="button"
            onClick={handleAdd}
            className="jasman-carousel-card-add"
            style={{
              height: 36,
              padding: hovered || added ? '0 14px' : '0 11px',
              borderRadius: 9999,
              border: 'none',
              background: added ? '#16A34A' : hovered ? C.red : '#F1F5F9',
              color: added || hovered ? '#FFFFFF' : C.navy,
              fontFamily: F.heading,
              fontSize: 10.5,
              fontWeight: 800,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              flexShrink: 0,
              transition: 'all 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {added ? (
              <>
                <Check size={13} /> Listo
              </>
            ) : (
              <>
                <Plus size={14} />
                <span
                  className="jasman-hover-add-txt"
                  style={{ display: hovered ? 'inline' : 'none' }}
                >
                  Agregar
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </Link>
  );
}

/* ============================================================================
   CARD STYLE 2: WIDE HORIZONTAL LANDSCAPE CARD (Envío Gratis)
   ============================================================================ */
function FreeShippingLandscapeCard({ product }) {
  const [hovered, setHovered] = useState(false);
  const [added, setAdded] = useState(false);
  const [imgErr, setImgErr] = useState(false);
  const { addToCart, coupon } = useTiendaState();

  const basePrice = product.finalPriceTaxExcluded || 0;
  const effectivePrice = coupon ? basePrice * 0.9 : basePrice;
  const brandMeta = BRAND_META[product.brand];
  const imgSrc = imgErr
    ? '/images/service-tires.png'
    : product.hasPngCutout
      ? product.cutoutImage
      : product.primaryImage;

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product.id, 1, true);
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  };

  return (
    <Link
      to={`/landing-tienda-preview/producto/${product.id}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="jasman-shipping-landscape-card"
      style={{
        width: '100%',
        display: 'grid',
        gridTemplateColumns: '138px minmax(0, 1fr)',
        gap: 16,
        alignItems: 'center',
        padding: 16,
        borderRadius: 26,
        background: hovered ? '#FFFFFF' : '#F8FAFC',
        border: hovered
          ? '1px solid rgba(21, 128, 61, 0.35)'
          : '1px solid rgba(26, 31, 54, 0.08)',
        boxShadow: hovered
          ? '0 24px 48px rgba(21, 128, 61, 0.10)'
          : '0 6px 20px rgba(26, 31, 54, 0.03)',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        textDecoration: 'none',
        color: C.navy,
        transition: 'all 0.32s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {/* Left Tire Pod */}
      <div
        className="jasman-shipping-tire-pod"
        style={{
          position: 'relative',
          height: 158,
          borderRadius: 20,
          background:
            'radial-gradient(circle at 50% 45%, #FFFFFF 0%, #EFFDF4 100%)',
          border: '1px solid rgba(21, 128, 61, 0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 12,
          overflow: 'hidden',
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: 8,
            left: 8,
            padding: '3px 7px',
            borderRadius: 9999,
            background: '#15803D',
            color: '#FFFFFF',
            fontFamily: F.heading,
            fontSize: 8.5,
            fontWeight: 900,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            zIndex: 2,
          }}
        >
          ENVÍO $0
        </span>

        <img
          src={imgSrc}
          alt={product.cleanTitle}
          loading="lazy"
          onError={() => setImgErr(true)}
          style={{
            width: '88%',
            height: '88%',
            objectFit: 'contain',
            filter: 'drop-shadow(0 14px 20px rgba(26, 31, 54, 0.18))',
            transform: hovered ? 'scale(1.08) rotate(-2deg)' : 'scale(1)',
            transition: 'transform 0.42s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        />
      </div>

      {/* Right Product Details */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          height: '100%',
          minWidth: 0,
          gap: 8,
        }}
      >
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 6,
              marginBottom: 6,
            }}
          >
            {brandMeta?.logo ? (
              <img
                src={brandMeta.logo}
                alt={product.brand}
                style={{
                  height: 16,
                  maxWidth: 90,
                  width: 'auto',
                  objectFit: 'contain',
                  borderRadius: 2.5,
                }}
              />
            ) : (
              <span
                style={{
                  fontFamily: F.heading,
                  fontSize: 10,
                  fontWeight: 800,
                  color: C.navy,
                  textTransform: 'uppercase',
                }}
              >
                {product.brand}
              </span>
            )}

            {product.measure && (
              <span
                style={{
                  padding: '3px 8px',
                  borderRadius: 9999,
                  background: C.navy,
                  color: '#FFFFFF',
                  fontFamily: F.heading,
                  fontSize: 9.5,
                  fontWeight: 800,
                }}
              >
                {product.measure}
              </span>
            )}
          </div>

          <h3
            style={{
              fontFamily: F.heading,
              fontSize: 13.5,
              fontWeight: 800,
              lineHeight: 1.28,
              color: C.navy,
              margin: '0 0 8px',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {product.cleanTitle}
          </h3>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              padding: '3px 9px',
              borderRadius: 9999,
              background: 'rgba(22, 163, 74, 0.10)',
              color: '#15803D',
              fontFamily: F.heading,
              fontSize: 9.5,
              fontWeight: 800,
            }}
          >
            <Truck size={11} /> Entrega gratis a tu puerta
          </div>
        </div>

        <div
          style={{
            paddingTop: 8,
            borderTop: '1px solid rgba(26, 31, 54, 0.07)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
          }}
        >
          <div>
            <div
              style={{
                fontFamily: F.heading,
                fontSize: 17.5,
                fontWeight: 900,
                color: C.navy,
                letterSpacing: '-0.03em',
                lineHeight: 1.05,
              }}
            >
              {formatMXN(effectivePrice)}
            </div>
            <span style={{ fontSize: 9.5, color: '#64748B', fontWeight: 700 }}>
              Con IVA · Stock {product.quantity}
            </span>
          </div>

          <button
            type="button"
            onClick={handleAdd}
            className="jasman-carousel-card-add"
            style={{
              height: 35,
              padding: hovered || added ? '0 13px' : '0 10px',
              borderRadius: 9999,
              border: 'none',
              background: added ? '#16A34A' : hovered ? C.red : '#FFFFFF',
              color: added || hovered ? '#FFFFFF' : C.navy,
              boxShadow: hovered ? 'none' : '0 2px 8px rgba(26,31,54,0.08)',
              fontFamily: F.heading,
              fontSize: 10.5,
              fontWeight: 800,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              flexShrink: 0,
              transition: 'all 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {added ? (
              <>
                <Check size={13} /> Listo
              </>
            ) : (
              <>
                <Plus size={14} />
                <span
                  className="jasman-hover-add-txt"
                  style={{ display: hovered ? 'inline' : 'none' }}
                >
                  Agregar
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </Link>
  );
}

/* ============================================================================
   CARD STYLE 3: FINTECH 12-MSI SPOTLIGHT CARD (Meses sin Intereses)
   ============================================================================ */
function MsiInstallmentCard({ product }) {
  const [hovered, setHovered] = useState(false);
  const [added, setAdded] = useState(false);
  const [imgErr, setImgErr] = useState(false);
  const { addToCart, coupon } = useTiendaState();

  const basePrice = product.finalPriceTaxExcluded || 0;
  const effectivePrice = coupon ? basePrice * 0.9 : basePrice;
  const monthlyPayment = effectivePrice / 12;
  const brandMeta = BRAND_META[product.brand];
  const imgSrc = imgErr
    ? '/images/service-tires.png'
    : product.hasPngCutout
      ? product.cutoutImage
      : product.primaryImage;

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product.id, 1, true);
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  };

  return (
    <Link
      to={`/landing-tienda-preview/producto/${product.id}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        borderRadius: 28,
        padding: 18,
        background: '#FFFFFF',
        border: hovered
          ? '1px solid rgba(255, 90, 95, 0.65)'
          : '1px solid rgba(255, 255, 255, 0.14)',
        boxShadow: hovered
          ? '0 26px 54px rgba(0, 0, 0, 0.38)'
          : '0 14px 34px rgba(0, 0, 0, 0.22)',
        transform: hovered ? 'translateY(-6px)' : 'translateY(0)',
        textDecoration: 'none',
        color: C.navy,
        transition: 'all 0.32s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {/* Top Row: Brand Logo + 12 MSI Pill */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
        }}
      >
        {brandMeta?.logo ? (
          <img
            src={brandMeta.logo}
            alt={product.brand}
            style={{
              height: 17,
              maxWidth: 96,
              width: 'auto',
              objectFit: 'contain',
              borderRadius: 2.5,
            }}
          />
        ) : (
          <span
            style={{
              fontFamily: F.heading,
              fontSize: 10.5,
              fontWeight: 900,
              color: C.navy,
              textTransform: 'uppercase',
            }}
          >
            {product.brand}
          </span>
        )}

        <span
          style={{
            padding: '4px 10px',
            borderRadius: 9999,
            background: C.navy,
            color: '#FFFFFF',
            fontFamily: F.heading,
            fontSize: 9.5,
            fontWeight: 800,
            letterSpacing: '0.06em',
          }}
        >
          {product.measure || '12 MSI'}
        </span>
      </div>

      {/* Center Studio Tire */}
      <div
        style={{
          position: 'relative',
          height: 156,
          margin: '12px 0',
          borderRadius: 20,
          background:
            'radial-gradient(circle at 50% 45%, #FFFFFF 0%, #F1F5F9 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 14,
          overflow: 'hidden',
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: 8,
            left: 8,
            padding: '3px 8px',
            borderRadius: 9999,
            background: 'rgba(196, 30, 36, 0.10)',
            color: C.red,
            fontFamily: F.heading,
            fontSize: 9,
            fontWeight: 900,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
          }}
        >
          Hasta 12 MSI
        </span>

        <img
          src={imgSrc}
          alt={product.cleanTitle}
          loading="lazy"
          onError={() => setImgErr(true)}
          style={{
            width: '86%',
            height: '86%',
            objectFit: 'contain',
            filter: 'drop-shadow(0 16px 22px rgba(26, 31, 54, 0.22))',
            transform: hovered ? 'scale(1.08) translateY(-4px)' : 'scale(1)',
            transition: 'transform 0.42s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        />
      </div>

      {/* Title */}
      <h3
        style={{
          fontFamily: F.heading,
          fontSize: 13.5,
          fontWeight: 800,
          lineHeight: 1.3,
          color: C.navy,
          margin: '0 0 10px',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          minHeight: '2.6em',
        }}
      >
        {product.cleanTitle}
      </h3>

      {/* Highlighted FinTech Monthly Installment Pod */}
      <div
        style={{
          padding: '12px 13px',
          borderRadius: 18,
          background: '#F8FAFC',
          border: '1px solid rgba(26, 31, 54, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
        }}
      >
        <div>
          <div
            style={{
              fontFamily: F.heading,
              fontSize: 9,
              fontWeight: 800,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: C.red,
            }}
          >
            12 pagos sin intereses
          </div>
          <div
            style={{
              fontFamily: F.heading,
              fontSize: 18.5,
              fontWeight: 900,
              color: C.navy,
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
              marginTop: 2,
            }}
          >
            {formatMXN(monthlyPayment)}
            <span style={{ fontSize: 10.5, fontWeight: 700, color: '#64748B' }}>
              /mes
            </span>
          </div>
          <div style={{ fontSize: 10, color: '#64748B', marginTop: 2 }}>
            Total {formatMXN(effectivePrice)} · Con IVA
          </div>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          className="jasman-carousel-card-add"
          style={{
            height: 36,
            padding: hovered || added ? '0 13px' : '0 10px',
            borderRadius: 9999,
            border: 'none',
            background: added ? '#16A34A' : hovered ? C.red : C.navy,
            color: '#FFFFFF',
            fontFamily: F.heading,
            fontSize: 10.5,
            fontWeight: 800,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            flexShrink: 0,
            transition: 'all 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {added ? (
            <>
              <Check size={13} /> Listo
            </>
          ) : (
            <>
              <Plus size={14} />
              <span
                className="jasman-hover-add-txt"
                style={{ display: hovered ? 'inline' : 'none' }}
              >
                Agregar
              </span>
            </>
          )}
        </button>
      </div>
    </Link>
  );
}

/* ============================================================================
   MAIN COMPONENT: 3 DISTINCT INTERACTIVE AUTO-MOVING CAROUSELS
   ============================================================================ */
export default function TiendaHomeCarousels() {
  const { products: catalogProducts } = useWixCatalogProducts();

  const { expressDeals, freeShippingItems, msiItems } = useMemo(() => {
    const inStock = catalogProducts.filter(
      (p) => p.inStock && p.finalPriceTaxExcluded > 0
    );

    const usedIds = new Set();
    const takeUnique = (candidates, limit = 10) => {
      const result = [];
      for (const item of candidates) {
        if (!usedIds.has(item.id)) {
          usedIds.add(item.id);
          result.push(item);
          if (result.length >= limit) break;
        }
      }
      if (result.length < Math.min(limit, inStock.length)) {
        for (const item of inStock) {
          if (!result.some((r) => r.id === item.id)) {
            result.push(item);
            if (result.length >= limit) break;
          }
        }
      }
      return result;
    };

    // 1. Ofertas Express
    const discountedFirst = [...inStock].sort((a, b) => {
      const aHasDisc =
        (a.regularPrice || 0) > (a.finalPriceTaxExcluded || 0) ? 1 : 0;
      const bHasDisc =
        (b.regularPrice || 0) > (b.finalPriceTaxExcluded || 0) ? 1 : 0;
      if (aHasDisc !== bHasDisc) return bHasDisc - aHasDisc;
      return a.finalPriceTaxExcluded - b.finalPriceTaxExcluded;
    });
    const express = takeUnique(discountedFirst, 10);

    // 2. Envío Gratis
    const shippingCandidates = [...inStock].sort((a, b) => {
      const aPop = /R15|R16|R17/i.test(a.rim || '') ? 1 : 0;
      const bPop = /R15|R16|R17/i.test(b.rim || '') ? 1 : 0;
      if (aPop !== bPop) return bPop - aPop;
      return (b.quantity || 0) - (a.quantity || 0);
    });
    const shipping = takeUnique(shippingCandidates, 10);

    // 3. Meses sin Intereses
    const msiCandidates = [...inStock].sort(
      (a, b) => b.finalPriceTaxExcluded - a.finalPriceTaxExcluded
    );
    const msi = takeUnique(msiCandidates, 10);

    return {
      expressDeals: express,
      freeShippingItems: shipping,
      msiItems: msi,
    };
  }, [catalogProducts]);

  const {
    trackRef: expressTrackRef,
    onMouseMove: onExpressMove,
    onMouseLeave: onExpressLeave,
    onTouchStart: onExpressTouchStart,
    onTouchEnd: onExpressTouchEnd,
    stepBy: stepExpress,
  } = useInteractiveGlideCarousel({
    itemCount: expressDeals.length,
    baseSpeed: 0.48,
  });

  const {
    trackRef: shippingTrackRef,
    onMouseMove: onShippingMove,
    onMouseLeave: onShippingLeave,
    onTouchStart: onShippingTouchStart,
    onTouchEnd: onShippingTouchEnd,
    stepBy: stepShipping,
  } = useInteractiveGlideCarousel({
    itemCount: freeShippingItems.length,
    baseSpeed: -0.46,
  });

  const {
    trackRef: msiTrackRef,
    onMouseMove: onMsiMove,
    onMouseLeave: onMsiLeave,
    onTouchStart: onMsiTouchStart,
    onTouchEnd: onMsiTouchEnd,
    stepBy: stepMsi,
  } = useInteractiveGlideCarousel({
    itemCount: msiItems.length,
    baseSpeed: 0.5,
  });

  return (
    <div id="carruseles-tienda">
      {/* =====================================================================
          1. OFERTAS EXPRESS — EDITORIAL SPLIT SHOWCASE + FLASH DEAL CARDS
          ===================================================================== */}
      <section
        id="carrusel-ofertas-express"
        className="jasman-carousel-sec"
        style={{
          padding: '76px 24px',
          background: 'linear-gradient(180deg, #F6F7F9 0%, #FFFFFF 100%)',
          borderTop: '1px solid rgba(26, 31, 54, 0.06)',
          overflow: 'hidden',
        }}
      >
        <div
          className="jasman-express-split-grid"
          style={{
            maxWidth: 1360,
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: '305px minmax(0, 1fr)',
            gap: 24,
            alignItems: 'stretch',
          }}
        >
          {/* Left Editorial Flash-Promo Feature Card */}
          <div
            style={{
              borderRadius: 30,
              padding: '30px 26px',
              background:
                'linear-gradient(155deg, #C41E24 0%, #8F1217 54%, #1A1F36 100%)',
              color: '#FFFFFF',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: 22,
              boxShadow: '0 24px 56px rgba(196, 30, 36, 0.22)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                right: -50,
                top: -50,
                width: 180,
                height: 180,
                borderRadius: '50%',
                border: '1px dashed rgba(255, 255, 255, 0.22)',
                pointerEvents: 'none',
              }}
            />

            <div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '5px 12px',
                  borderRadius: 9999,
                  background: 'rgba(255, 255, 255, 0.16)',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  fontFamily: F.heading,
                  fontSize: 9.5,
                  fontWeight: 900,
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  marginBottom: 16,
                }}
              >
                <Zap size={12} fill="#FFFFFF" /> Oportunidades Hoy
              </div>

              <h2
                style={{
                  fontFamily: F.heading,
                  fontSize: 'clamp(1.85rem, 2.8vw, 2.35rem)',
                  fontWeight: 900,
                  letterSpacing: '-0.038em',
                  lineHeight: 1.03,
                  margin: '0 0 12px',
                  color: '#FFFFFF',
                }}
              >
                Ofertas Express.
              </h2>

              <p
                style={{
                  fontSize: 13,
                  lineHeight: 1.55,
                  color: 'rgba(255, 255, 255, 0.84)',
                  margin: '0 0 18px',
                }}
              >
                Precios directos Con IVA + ahorro adicional automático por volumen:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  '−5% extra llevando 2 o 3 llantas',
                  '−10% extra en juego de 4 llantas',
                  'Garantía directa de fábrica',
                ].map((perk) => (
                  <div
                    key={perk}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      fontSize: 11.5,
                      fontWeight: 700,
                      color: '#FFFFFF',
                    }}
                  >
                    <ShieldCheck size={14} color="#FCA5A5" style={{ flexShrink: 0 }} />
                    <span>{perk}</span>
                  </div>
                ))}
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 10,
                paddingTop: 16,
                borderTop: '1px solid rgba(255, 255, 255, 0.16)',
              }}
            >
              <Link
                to="/landing-tienda-preview/catalogo"
                style={{
                  padding: '11px 16px',
                  borderRadius: 9999,
                  background: '#FFFFFF',
                  color: C.navy,
                  fontFamily: F.heading,
                  fontSize: 10.5,
                  fontWeight: 900,
                  letterSpacing: '0.07em',
                  textTransform: 'uppercase',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                Ver Ofertas <ArrowRight size={13} color={C.red} />
              </Link>

              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  type="button"
                  onClick={() => stepExpress(-1)}
                  aria-label="Anterior en Ofertas Express"
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    border: '1px solid rgba(255,255,255,0.28)',
                    background: 'rgba(255,255,255,0.12)',
                    color: '#FFFFFF',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => stepExpress(1)}
                  aria-label="Siguiente en Ofertas Express"
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    border: '1px solid rgba(255,255,255,0.28)',
                    background: 'rgba(255,255,255,0.12)',
                    color: '#FFFFFF',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Right Interactive Auto-Gliding Track */}
          <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 10,
                padding: '0 6px',
              }}
            >
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  fontFamily: F.heading,
                  fontSize: 10,
                  fontWeight: 800,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: '#64748B',
                }}
              >
                <MoveHorizontal size={13} color={C.red} />{' '}
                <span className="jasman-carousel-mouse-hint">
                  Carrusel interactivo · Pasa el mouse en los extremos para navegar
                </span>
                <span className="jasman-carousel-touch-hint" style={{ display: 'none' }}>
                  Carrusel continuo · Desliza para explorar
                </span>
              </span>
            </div>

            <div
              ref={expressTrackRef}
              onMouseMove={onExpressMove}
              onMouseLeave={onExpressLeave}
              onTouchStart={onExpressTouchStart}
              onTouchEnd={onExpressTouchEnd}
              className="jasman-home-carousel-track"
              style={{
                display: 'flex',
                gap: 16,
                overflowX: 'auto',
                padding: '8px 4px 18px',
                WebkitOverflowScrolling: 'touch',
              }}
            >
              {[...expressDeals, ...expressDeals].map((product, idx) => (
                <div
                  key={`exp-${product.id}-${idx}`}
                  style={{
                    flex: '0 0 268px',
                    display: 'flex',
                  }}
                >
                  <ExpressDealCard product={product} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          2. ENVÍO GRATIS — CLEAN WHITE STUDIO + WIDE LANDSCAPE CARDS (REVERSE)
          ===================================================================== */}
      <section
        id="carrusel-envio-gratis"
        className="jasman-carousel-sec"
        style={{
          padding: '76px 0',
          background: '#FFFFFF',
          borderTop: '1px solid rgba(26, 31, 54, 0.06)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            maxWidth: 1360,
            margin: '0 auto',
            padding: '0 24px',
            marginBottom: 26,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 18,
          }}
        >
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                padding: '5px 13px',
                borderRadius: 9999,
                background: 'rgba(22, 163, 74, 0.10)',
                border: '1px solid rgba(22, 163, 74, 0.22)',
                marginBottom: 10,
              }}
            >
              <Truck size={13} color="#15803D" />
              <span
                style={{
                  fontFamily: F.heading,
                  fontSize: 10,
                  fontWeight: 800,
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  color: '#15803D',
                }}
              >
                Cobertura Nacional Sin Costo
              </span>
            </div>

            <h2
              style={{
                fontFamily: F.heading,
                fontSize: 'clamp(1.9rem, 3.4vw, 2.8rem)',
                fontWeight: 900,
                color: C.navy,
                letterSpacing: '-0.038em',
                lineHeight: 1.05,
                margin: '0 0 6px',
              }}
            >
              Envío Gratis <span style={{ color: '#15803D' }}>a tu puerta.</span>
            </h2>

            <p style={{ fontSize: 13.5, color: '#64748B', margin: 0 }}>
              Recibe tus llantas sin costo de envío en cualquier ciudad de la República
              Mexicana · Precios Con IVA.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => stepShipping(-1)}
              aria-label="Anterior en Envío Gratis"
              className="jasman-carousel-arrow"
              style={{
                width: 42,
                height: 42,
                borderRadius: '50%',
                border: '1px solid rgba(26, 31, 54, 0.12)',
                background: '#FFFFFF',
                color: C.navy,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={() => stepShipping(1)}
              aria-label="Siguiente en Envío Gratis"
              className="jasman-carousel-arrow"
              style={{
                width: 42,
                height: 42,
                borderRadius: '50%',
                border: '1px solid rgba(26, 31, 54, 0.12)',
                background: '#FFFFFF',
                color: C.navy,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <ChevronRight size={18} />
            </button>
            <Link
              to="/landing-tienda-preview/catalogo"
              className="jasman-carousel-cta"
              style={{
                padding: '11px 18px',
                borderRadius: 9999,
                border: '1px solid rgba(26, 31, 54, 0.12)',
                background: '#FFFFFF',
                color: C.navy,
                fontFamily: F.heading,
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: '0.07em',
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

        {/* Full-Bleed Reverse-Gliding Horizontal Landscape Cards */}
        <div
          ref={shippingTrackRef}
          onMouseMove={onShippingMove}
          onMouseLeave={onShippingLeave}
          onTouchStart={onShippingTouchStart}
          onTouchEnd={onShippingTouchEnd}
          className="jasman-home-carousel-track"
          style={{
            display: 'flex',
            gap: 18,
            overflowX: 'auto',
            padding: '10px 24px 20px',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {[...freeShippingItems, ...freeShippingItems].map((product, idx) => (
            <div
              key={`ship-${product.id}-${idx}`}
              className="jasman-shipping-slide-wrap"
              style={{
                flex: '0 0 390px',
                display: 'flex',
              }}
            >
              <FreeShippingLandscapeCard product={product} />
            </div>
          ))}
        </div>
      </section>

      {/* =====================================================================
          3. MESES SIN INTERESES — DARK ARCHITECTURAL NAVY FINTECH SHOWCASE
          ===================================================================== */}
      <section
        id="carrusel-meses-sin-intereses"
        className="jasman-carousel-sec"
        style={{
          padding: '84px 0',
          background: 'linear-gradient(180deg, #101528 0%, #1A1F36 100%)',
          color: '#FFFFFF',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle Crimson Ambient Glow */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: '50%',
            top: '15%',
            transform: 'translateX(-50%)',
            width: 680,
            height: 260,
            borderRadius: '50%',
            background:
              'radial-gradient(circle, rgba(196, 30, 36, 0.16) 0%, transparent 72%)',
            filter: 'blur(40px)',
            pointerEvents: 'none',
          }}
        />

        <div
          style={{
            position: 'relative',
            zIndex: 2,
            maxWidth: 1360,
            margin: '0 auto',
            padding: '0 24px',
            marginBottom: 28,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 20,
          }}
        >
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                padding: '5px 13px',
                borderRadius: 9999,
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.16)',
                marginBottom: 12,
              }}
            >
              <CreditCard size={13} color="#FF6B70" />
              <span
                style={{
                  fontFamily: F.heading,
                  fontSize: 10,
                  fontWeight: 800,
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  color: '#FCA5A5',
                }}
              >
                Facilidades de Pago Oficiales
              </span>
            </div>

            <h2
              style={{
                fontFamily: F.heading,
                fontSize: 'clamp(1.9rem, 3.4vw, 2.85rem)',
                fontWeight: 900,
                color: '#FFFFFF',
                letterSpacing: '-0.038em',
                lineHeight: 1.05,
                margin: '0 0 8px',
              }}
            >
              Meses sin <span style={{ color: '#FF5A5F' }}>Intereses.</span>
            </h2>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                flexWrap: 'wrap',
              }}
            >
              <span style={{ fontSize: 13.5, color: 'rgba(255, 255, 255, 0.75)' }}>
                Estrena hoy llantas SUV, 4×4 y Alto Desempeño diferidas Con IVA:
              </span>
              {['3 MSI', '6 MSI', '9 MSI', '12 MSI'].map((tier) => (
                <span
                  key={tier}
                  style={{
                    padding: '3px 9px',
                    borderRadius: 9999,
                    background:
                      tier === '12 MSI' ? C.red : 'rgba(255, 255, 255, 0.10)',
                    color: '#FFFFFF',
                    fontFamily: F.heading,
                    fontSize: 10,
                    fontWeight: 800,
                  }}
                >
                  {tier}
                </span>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => stepMsi(-1)}
              aria-label="Anterior en Meses sin Intereses"
              style={{
                width: 42,
                height: 42,
                borderRadius: '50%',
                border: '1px solid rgba(255, 255, 255, 0.22)',
                background: 'rgba(255, 255, 255, 0.08)',
                color: '#FFFFFF',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={() => stepMsi(1)}
              aria-label="Siguiente en Meses sin Intereses"
              style={{
                width: 42,
                height: 42,
                borderRadius: '50%',
                border: '1px solid rgba(255, 255, 255, 0.22)',
                background: 'rgba(255, 255, 255, 0.08)',
                color: '#FFFFFF',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <ChevronRight size={18} />
            </button>
            <Link
              to="/landing-tienda-preview/catalogo"
              style={{
                padding: '11px 18px',
                borderRadius: 9999,
                background: C.red,
                color: '#FFFFFF',
                fontFamily: F.heading,
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: '0.07em',
                textTransform: 'uppercase',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: '0 10px 24px rgba(196, 30, 36, 0.35)',
              }}
            >
              Explorar Todo <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        {/* Full-Bleed FinTech Installment Carousel Track */}
        <div
          ref={msiTrackRef}
          onMouseMove={onMsiMove}
          onMouseLeave={onMsiLeave}
          onTouchStart={onMsiTouchStart}
          onTouchEnd={onMsiTouchEnd}
          className="jasman-home-carousel-track"
          style={{
            position: 'relative',
            zIndex: 2,
            display: 'flex',
            gap: 18,
            overflowX: 'auto',
            padding: '10px 24px 22px',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {[...msiItems, ...msiItems].map((product, idx) => (
            <div
              key={`msi-${product.id}-${idx}`}
              style={{
                flex: '0 0 296px',
                display: 'flex',
              }}
            >
              <MsiInstallmentCard product={product} />
            </div>
          ))}
        </div>
      </section>

      <style>{`
        .jasman-home-carousel-track {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .jasman-home-carousel-track::-webkit-scrollbar {
          display: none;
        }
        .jasman-carousel-arrow {
          transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .jasman-carousel-arrow:hover {
          background: #1A1F36 !important;
          border-color: #1A1F36 !important;
          color: #FFFFFF !important;
          transform: translateY(-2px);
        }
        .jasman-carousel-cta {
          transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .jasman-carousel-cta:hover {
          background: #C41E24 !important;
          border-color: #C41E24 !important;
          color: #FFFFFF !important;
          transform: translateY(-2px);
          box-shadow: 0 10px 22px rgba(196, 30, 36, 0.22);
        }
        @media (max-width: 980px) {
          .jasman-express-split-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @media (hover: none), (max-width: 768px) {
          .jasman-hover-add-txt {
            display: inline !important;
          }
          .jasman-carousel-card-add {
            padding: 0 12px !important;
          }
          .jasman-carousel-mouse-hint {
            display: none !important;
          }
          .jasman-carousel-touch-hint {
            display: inline !important;
          }
        }
        @media (max-width: 640px) {
          .jasman-carousel-sec {
            padding-top: 52px !important;
            padding-bottom: 52px !important;
          }
          .jasman-shipping-slide-wrap {
            flex: 0 0 338px !important;
          }
          .jasman-shipping-landscape-card {
            grid-template-columns: 94px minmax(0, 1fr) !important;
            gap: 11px !important;
            padding: 13px !important;
          }
          .jasman-shipping-landscape-card .jasman-carousel-card-add {
            height: 32px !important;
            padding: 0 10px !important;
            font-size: 9.5px !important;
          }
          .jasman-shipping-tire-pod {
            height: 128px !important;
          }
        }
      `}</style>
    </div>
  );
}
