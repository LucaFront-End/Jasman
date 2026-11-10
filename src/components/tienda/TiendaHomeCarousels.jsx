import { useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { C, F } from '../../hooks/useAnimations';
import { useWixCatalogProducts } from '../../data/productosMasterData';
import TiendaProductCard from './TiendaProductCard';
import {
  Zap,
  Truck,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';

function ProductCarouselRow({
  id,
  eyebrow,
  title,
  accentWord,
  subtitle,
  iconElement,
  accentColor,
  badgeConfig,
  msiMonths = null,
  products,
  ctaLabel,
  ctaHref,
  bg,
}) {
  const trackRef = useRef(null);

  const handleScroll = (dir) => {
    if (!trackRef.current) return;
    const step = Math.max(trackRef.current.clientWidth * 0.78, 300);
    trackRef.current.scrollBy({
      left: dir * step,
      behavior: 'smooth',
    });
  };

  return (
    <section
      id={id}
      style={{
        padding: '68px 24px',
        background: bg || '#FFFFFF',
        borderTop: '1px solid rgba(26, 31, 54, 0.06)',
        position: 'relative',
      }}
    >
      <div style={{ maxWidth: 1320, margin: '0 auto' }}>
        {/* Row Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 18,
            marginBottom: 28,
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
                background: badgeConfig.bg,
                border: `1px solid ${badgeConfig.border}`,
                marginBottom: 10,
              }}
            >
              {iconElement}
              <span
                style={{
                  fontFamily: F.heading,
                  fontSize: 10,
                  fontWeight: 800,
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  color: accentColor,
                }}
              >
                {eyebrow}
              </span>
            </div>

            <h2
              style={{
                fontFamily: F.heading,
                fontSize: 'clamp(1.85rem, 3.4vw, 2.75rem)',
                fontWeight: 900,
                color: C.navy,
                letterSpacing: '-0.038em',
                lineHeight: 1.06,
                margin: '0 0 6px',
              }}
            >
              {title}{' '}
              {accentWord && <span style={{ color: accentColor }}>{accentWord}</span>}
            </h2>

            <p
              style={{
                fontSize: 13.5,
                color: '#64748B',
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              {subtitle}
            </p>
          </div>

          {/* Right Controls: Prev / Next + Ver Todo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              type="button"
              onClick={() => handleScroll(-1)}
              aria-label={`Anterior en ${title}`}
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
                boxShadow: '0 6px 18px rgba(26, 31, 54, 0.05)',
              }}
            >
              <ChevronLeft size={18} />
            </button>

            <button
              type="button"
              onClick={() => handleScroll(1)}
              aria-label={`Siguiente en ${title}`}
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
                boxShadow: '0 6px 18px rgba(26, 31, 54, 0.05)',
              }}
            >
              <ChevronRight size={18} />
            </button>

            <Link
              to={ctaHref}
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
                marginLeft: 4,
              }}
            >
              {ctaLabel} <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        {/* Horizontal Snap Carousel Track */}
        <div
          ref={trackRef}
          className="jasman-home-carousel-track"
          style={{
            display: 'flex',
            gap: 18,
            overflowX: 'auto',
            padding: '10px 4px 22px',
            scrollSnapType: 'x mandatory',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {products.map((product) => (
            <div
              key={product.id}
              style={{
                flex: '0 0 clamp(266px, 23.2vw, 300px)',
                scrollSnapAlign: 'start',
                display: 'flex',
              }}
            >
              <div style={{ width: '100%', display: 'flex' }}>
                <TiendaProductCard
                  product={product}
                  compact
                  promoBadge={badgeConfig}
                  msiMonths={msiMonths}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function TiendaHomeCarousels() {
  const { products: catalogProducts } = useWixCatalogProducts();

  const { expressDeals, freeShippingItems, msiItems } = useMemo(() => {
    const inStock = catalogProducts.filter(
      (p) => p.inStock && p.finalPriceTaxExcluded > 0
    );

    const usedIds = new Set();
    const takeUnique = (candidates, limit = 12) => {
      const result = [];
      for (const item of candidates) {
        if (!usedIds.has(item.id)) {
          usedIds.add(item.id);
          result.push(item);
          if (result.length >= limit) break;
        }
      }
      // If catalog still only has 45 static items before Wix resolves, top up without crashing
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

    // 1. Ofertas Express: items with discount or sharpest entry prices
    const discountedFirst = [...inStock].sort((a, b) => {
      const aHasDisc =
        (a.regularPrice || 0) > (a.finalPriceTaxExcluded || 0) ? 1 : 0;
      const bHasDisc =
        (b.regularPrice || 0) > (b.finalPriceTaxExcluded || 0) ? 1 : 0;
      if (aHasDisc !== bHasDisc) return bHasDisc - aHasDisc;
      return a.finalPriceTaxExcluded - b.finalPriceTaxExcluded;
    });
    const express = takeUnique(discountedFirst, 12);

    // 2. Envío Gratis: highest-demand R15–R17 everyday Auto & SUV tires with deep stock
    const shippingCandidates = [...inStock].sort((a, b) => {
      const aPop = /R15|R16|R17/i.test(a.rim || '') ? 1 : 0;
      const bPop = /R15|R16|R17/i.test(b.rim || '') ? 1 : 0;
      if (aPop !== bPop) return bPop - aPop;
      return (b.quantity || 0) - (a.quantity || 0);
    });
    const shipping = takeUnique(shippingCandidates, 12);

    // 3. Meses sin Intereses: higher-ticket SUV, 4x4, Performance & Truck tires (ideal for 12 MSI)
    const msiCandidates = [...inStock].sort(
      (a, b) => b.finalPriceTaxExcluded - a.finalPriceTaxExcluded
    );
    const msi = takeUnique(msiCandidates, 12);

    return {
      expressDeals: express,
      freeShippingItems: shipping,
      msiItems: msi,
    };
  }, [catalogProducts]);

  return (
    <div id="carruseles-tienda">
      {/* 1. OFERTAS EXPRESS */}
      <ProductCarouselRow
        id="carrusel-ofertas-express"
        eyebrow="Oportunidades del Día · Stock Limitado"
        title="Ofertas"
        accentWord="Express."
        subtitle="Precios preferenciales directos Con IVA y hasta −10% adicional en juego de 4 llantas."
        iconElement={<Zap size={12.5} color={C.red} />}
        accentColor={C.red}
        badgeConfig={{
          label: 'Oferta Express',
          bg: 'rgba(196, 30, 36, 0.09)',
          color: C.red,
          border: 'rgba(196, 30, 36, 0.20)',
        }}
        products={expressDeals}
        ctaLabel="Ver Ofertas"
        ctaHref="/landing-tienda-preview/catalogo"
        bg="#F8F9FA"
      />

      {/* 2. ENVÍO GRATIS */}
      <ProductCarouselRow
        id="carrusel-envio-gratis"
        eyebrow="Cobertura Nacional Sin Costo"
        title="Envío"
        accentWord="Gratis."
        subtitle="Recibe tus llantas sin costo de envío en cualquier ciudad de la República Mexicana."
        iconElement={<Truck size={12.5} color="#15803D" />}
        accentColor="#15803D"
        badgeConfig={{
          label: 'Envío Gratis',
          bg: 'rgba(22, 163, 74, 0.10)',
          color: '#15803D',
          border: 'rgba(22, 163, 74, 0.22)',
        }}
        products={freeShippingItems}
        ctaLabel="Catálogo Completo"
        ctaHref="/landing-tienda-preview/catalogo"
        bg="#FFFFFF"
      />

      {/* 3. MESES SIN INTERESES */}
      <ProductCarouselRow
        id="carrusel-meses-sin-intereses"
        eyebrow="Facilidades de Pago Oficiales"
        title="Meses sin"
        accentWord="Intereses."
        subtitle="Estrena hoy llantas SUV, 4×4 y Alto Desempeño diferidas hasta en 12 mensualidades fijas Con IVA."
        iconElement={<CreditCard size={12.5} color={C.navy} />}
        accentColor={C.navy}
        badgeConfig={{
          label: 'Hasta 12 MSI',
          bg: 'rgba(26, 31, 54, 0.08)',
          color: C.navy,
          border: 'rgba(26, 31, 54, 0.16)',
        }}
        msiMonths={12}
        products={msiItems}
        ctaLabel="Explorar Todo"
        ctaHref="/landing-tienda-preview/catalogo"
        bg="#F8F9FA"
      />

      <style>{`
        .jasman-home-carousel-track {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .jasman-home-carousel-track::-webkit-scrollbar {
          display: none;
        }
        .jasman-home-carousel-track > div > div > a {
          width: 100%;
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
      `}</style>
    </div>
  );
}
