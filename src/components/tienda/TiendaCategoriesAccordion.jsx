import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { C, F } from '../../hooks/useAnimations';
import { useWixCatalogProducts, formatMXN } from '../../data/productosMasterData';
import { ArrowRight, ArrowUpRight, Plus, Minus } from 'lucide-react';

const CATEGORY_PANELS = [
  {
    id: 'auto-sedan',
    index: '01',
    title: 'Auto & Sedán',
    shortTitle: 'Auto & Sedán',
    tag: 'Confort Urbano & Autopista',
    description:
      'Frenado preciso en piso seco y mojado, silencio superior en cabina y baja resistencia al rodamiento para conducción diaria.',
    tireImage: '/images/tires/tire-539.png',
    measures: ['205/55R16', '195/65R15', '185/65R15', '175/70R14'],
    href: '/landing-tienda-preview/catalogo?vehicle=Auto',
    matcher: (p) => p.vehicleType === 'Auto',
  },
  {
    id: 'suv-camioneta',
    index: '02',
    title: 'SUV & Crossover',
    shortTitle: 'SUV & Crossover',
    tag: 'Estabilidad & Viajes Familiares',
    description:
      'Hombros reforzados y huella optimizada para camionetas y SUVs que exigen control total en curvas y alto kilometraje.',
    tireImage: '/images/tires/tire-561.png',
    measures: ['215/65R17', '235/65R16', '265/60R18', '285/45R21'],
    href: '/landing-tienda-preview/catalogo?vehicle=Camioneta',
    matcher: (p) => p.vehicleType === 'Camioneta',
  },
  {
    id: 'todo-terreno',
    index: '03',
    title: 'Todo Terreno 4×4',
    shortTitle: 'Todo Terreno 4×4',
    tag: 'Pick-Up, Grava & Off-Road',
    description:
      'Carcasa de ultra resistencia contra impactos y diseño de bloques profundos para tracción confiable en asfalto y terracería.',
    tireImage: '/images/tires/tire-543.png',
    measures: ['245/75R17', '235/75R15', '31X10.50R15', '27X8.50R14'],
    href: '/landing-tienda-preview/catalogo?vehicle=Camioneta&measure=75',
    matcher: (p) =>
      /AT2|MT2|Grabber|Overlander|All Terrain|Destination|Terrain|X10|X12|X8|75R/i.test(
        p.cleanTitle || ''
      ),
  },
  {
    id: 'carga-camion',
    index: '04',
    title: 'Carga & Flotilla',
    shortTitle: 'Carga & Flotilla',
    tag: 'Vans Comerciales & Camión',
    description:
      'Estructura multicapa para trabajo pesado y desgaste uniforme que maximiza la rentabilidad operativa de tu negocio.',
    tireImage: '/images/tires/tire-564.png',
    measures: ['225/70R19.5', '215/75R17.5', '285/65R16C', '10R15'],
    href: '/landing-tienda-preview/catalogo?vehicle=Camión',
    matcher: (p) => p.vehicleType === 'Camión',
  },
  {
    id: 'performance',
    index: '05',
    title: 'Alto Desempeño',
    shortTitle: 'Performance',
    tag: 'Sport & Rines 17" a 21"',
    description:
      'Compuestos inspirados en motorsport y Formula E para máxima adherencia a alta velocidad y respuesta inmediata de dirección.',
    tireImage: '/images/tires/tire-540.png',
    measures: ['225/45R17', '215/45R18', '205/45R17', '285/45R21'],
    href: '/landing-tienda-preview/catalogo?rim=R18',
    matcher: (p) =>
      /Ventus|Sport|Pilot|P Zero|Potenza|PremiumContact|Premium Contact|R18|R19|R20|R21|\/45R|\/40R/i.test(
        p.cleanTitle || ''
      ),
  },
];

export default function TiendaCategoriesAccordion() {
  const [activeIndex, setActiveIndex] = useState(0);
  const { products: catalogProducts } = useWixCatalogProducts();

  const enrichedCategories = useMemo(() => {
    return CATEGORY_PANELS.map((cat) => {
      const matched = catalogProducts.filter(cat.matcher);
      const inStockPrices = matched
        .filter((p) => p.inStock && p.finalPriceTaxExcluded > 0)
        .map((p) => p.finalPriceTaxExcluded);
      const minPrice =
        inStockPrices.length > 0 ? Math.min(...inStockPrices) : null;

      return {
        ...cat,
        count: matched.length,
        minPrice,
      };
    });
  }, [catalogProducts]);

  return (
    <section
      id="marcas-tienda"
      style={{
        padding: '96px 24px 104px',
        background: '#FFFFFF',
        borderTop: '1px solid rgba(26, 31, 54, 0.05)',
      }}
    >
      <div style={{ maxWidth: 1260, margin: '0 auto' }}>
        {/* Editorial Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 20,
            marginBottom: 40,
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
              Categorías Oficiales · Selección Jasman
            </span>
            <h2
              style={{
                fontFamily: F.heading,
                fontSize: 'clamp(2.1rem, 4vw, 3.3rem)',
                fontWeight: 900,
                color: C.navy,
                letterSpacing: '-0.04em',
                lineHeight: 1.04,
                margin: 0,
              }}
            >
              Encuentra tu categoría ideal.
            </h2>
          </div>

          <Link
            to="/landing-tienda-preview/catalogo"
            style={{
              padding: '12px 22px',
              borderRadius: 9999,
              background: '#F8F9FA',
              border: '1px solid rgba(26, 31, 54, 0.09)',
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
            Ver las {catalogProducts.length} referencias <ArrowRight size={14} />
          </Link>
        </div>

        {/* DESKTOP: SUTRA-STYLE HORIZONTAL EXPANDING ACCORDION */}
        <div className="jasman-sutra-accordion-desktop">
          {enrichedCategories.map((cat, idx) => {
            const isActive = idx === activeIndex;
            return (
              <div
                key={cat.id}
                onMouseEnter={() => setActiveIndex(idx)}
                onClick={() => setActiveIndex(idx)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setActiveIndex(idx);
                  }
                }}
                style={{
                  flex: isActive ? '3.6 1 0%' : '0.82 1 0%',
                  position: 'relative',
                  height: 490,
                  borderRadius: 30,
                  overflow: 'hidden',
                  cursor: isActive ? 'default' : 'pointer',
                  background: isActive
                    ? 'linear-gradient(135deg, #15192B 0%, #1A1F36 58%, #2B1722 100%)'
                    : '#F6F7F9',
                  border: isActive
                    ? '1px solid rgba(196, 30, 36, 0.32)'
                    : '1px solid rgba(26, 31, 54, 0.08)',
                  boxShadow: isActive
                    ? '0 28px 64px rgba(26, 31, 54, 0.18)'
                    : '0 6px 20px rgba(26, 31, 54, 0.03)',
                  transition:
                    'flex 0.65s cubic-bezier(0.16, 1, 0.3, 1), background 0.45s ease, box-shadow 0.45s ease, border-color 0.35s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: isActive ? '34px 36px' : '26px 20px',
                }}
              >
                {/* Ambient Crimson Studio Glow inside Active Panel */}
                <div
                  style={{
                    position: 'absolute',
                    right: -60,
                    bottom: -60,
                    width: 360,
                    height: 360,
                    borderRadius: '50%',
                    background:
                      'radial-gradient(circle, rgba(196, 30, 36, 0.28) 0%, rgba(196, 30, 36, 0) 70%)',
                    opacity: isActive ? 1 : 0,
                    transition: 'opacity 0.5s ease',
                    pointerEvents: 'none',
                  }}
                />

                {/* Top Bar: Index + Count / Toggle Icon */}
                <div
                  style={{
                    position: 'relative',
                    zIndex: 3,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 10,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span
                      style={{
                        fontFamily: F.heading,
                        fontSize: 12,
                        fontWeight: 900,
                        letterSpacing: '0.14em',
                        color: isActive ? '#FCA5A5' : C.red,
                      }}
                    >
                      {cat.index}
                    </span>
                    {isActive && (
                      <span
                        style={{
                          padding: '5px 12px',
                          borderRadius: 9999,
                          background: 'rgba(255, 255, 255, 0.10)',
                          border: '1px solid rgba(255, 255, 255, 0.14)',
                          color: '#FFFFFF',
                          fontFamily: F.heading,
                          fontSize: 10,
                          fontWeight: 800,
                          letterSpacing: '0.14em',
                          textTransform: 'uppercase',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {cat.count} modelos disponibles
                      </span>
                    )}
                  </div>

                  <span
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: '50%',
                      background: isActive ? C.red : '#FFFFFF',
                      border: isActive
                        ? 'none'
                        : '1px solid rgba(26, 31, 54, 0.10)',
                      color: isActive ? '#FFFFFF' : C.navy,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {isActive ? <ArrowUpRight size={15} /> : <Plus size={15} />}
                  </span>
                </div>

                {/* COLLAPSED STATE: Vertical Architectural Title + Count */}
                {!isActive && (
                  <div
                    style={{
                      position: 'relative',
                      zIndex: 2,
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingTop: 24,
                    }}
                  >
                    <div
                      style={{
                        writingMode: 'vertical-rl',
                        transform: 'rotate(180deg)',
                        fontFamily: F.heading,
                        fontSize: 19,
                        fontWeight: 900,
                        letterSpacing: '-0.02em',
                        color: C.navy,
                        whiteSpace: 'nowrap',
                        margin: 'auto 0',
                      }}
                    >
                      {cat.shortTitle}
                    </div>

                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: 9999,
                        background: 'rgba(26, 31, 54, 0.06)',
                        color: '#475569',
                        fontFamily: F.heading,
                        fontSize: 10,
                        fontWeight: 800,
                      }}
                    >
                      {cat.count}
                    </span>
                  </div>
                )}

                {/* EXPANDED STATE: Full Editorial Content + 3/4 Studio Cutout Tire */}
                {isActive && (
                  <div
                    style={{
                      position: 'relative',
                      zIndex: 3,
                      flex: 1,
                      display: 'grid',
                      gridTemplateColumns: 'minmax(0, 1.25fr) minmax(0, 0.75fr)',
                      alignItems: 'center',
                      gap: 20,
                      marginTop: 18,
                    }}
                  >
                    {/* Left Copy + Quick Measures + CTA */}
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        height: '100%',
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontFamily: F.heading,
                            fontSize: 10.5,
                            fontWeight: 800,
                            letterSpacing: '0.2em',
                            textTransform: 'uppercase',
                            color: '#FCA5A5',
                            marginBottom: 8,
                          }}
                        >
                          {cat.tag}
                        </div>

                        <h3
                          style={{
                            fontFamily: F.heading,
                            fontSize: 'clamp(1.85rem, 2.8vw, 2.5rem)',
                            fontWeight: 900,
                            color: '#FFFFFF',
                            letterSpacing: '-0.035em',
                            lineHeight: 1.05,
                            margin: '0 0 14px',
                          }}
                        >
                          {cat.title}
                        </h3>

                        <p
                          style={{
                            fontFamily: F.body,
                            fontSize: 13.5,
                            lineHeight: 1.6,
                            color: 'rgba(255, 255, 255, 0.76)',
                            margin: '0 0 20px',
                            maxWidth: 420,
                          }}
                        >
                          {cat.description}
                        </p>

                        {/* Quick Measure Chips */}
                        <div
                          style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 7,
                          }}
                        >
                          {cat.measures.map((m) => (
                            <Link
                              key={m}
                              to={`/landing-tienda-preview/catalogo?measure=${encodeURIComponent(m)}`}
                              onClick={(e) => e.stopPropagation()}
                              style={{
                                padding: '5px 11px',
                                borderRadius: 9999,
                                background: 'rgba(255, 255, 255, 0.08)',
                                border: '1px solid rgba(255, 255, 255, 0.15)',
                                color: '#FFFFFF',
                                fontFamily: F.heading,
                                fontSize: 10.5,
                                fontWeight: 700,
                                textDecoration: 'none',
                              }}
                            >
                              {m}
                            </Link>
                          ))}
                        </div>
                      </div>

                      {/* Bottom Price + Direct Category Route */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: 14,
                          paddingTop: 18,
                          borderTop: '1px solid rgba(255, 255, 255, 0.10)',
                        }}
                      >
                        {cat.minPrice ? (
                          <div>
                            <div
                              style={{
                                fontFamily: F.heading,
                                fontSize: 9.5,
                                fontWeight: 700,
                                letterSpacing: '0.16em',
                                textTransform: 'uppercase',
                                color: 'rgba(255, 255, 255, 0.56)',
                              }}
                            >
                              Desde
                            </div>
                            <div
                              style={{
                                fontFamily: F.heading,
                                fontSize: 18,
                                fontWeight: 900,
                                color: '#FFFFFF',
                              }}
                            >
                              {formatMXN(cat.minPrice)}
                            </div>
                          </div>
                        ) : (
                          <span />
                        )}

                        <Link
                          to={cat.href}
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            padding: '12px 22px',
                            borderRadius: 9999,
                            background: C.red,
                            color: '#FFFFFF',
                            fontFamily: F.heading,
                            fontSize: 11,
                            fontWeight: 800,
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 8,
                            boxShadow: '0 10px 26px rgba(196, 30, 36, 0.38)',
                          }}
                        >
                          Explorar Categoría <ArrowUpRight size={14} />
                        </Link>
                      </div>
                    </div>

                    {/* Right Studio Floating Cutout Tire */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                      }}
                    >
                      <img
                        src={cat.tireImage}
                        alt={cat.title}
                        style={{
                          width: '100%',
                          maxWidth: 235,
                          height: 'auto',
                          objectFit: 'contain',
                          filter: 'drop-shadow(0 24px 36px rgba(0, 0, 0, 0.5))',
                          animation: 'jasmanAccordionTireIn 0.55s cubic-bezier(0.16, 1, 0.3, 1)',
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* MOBILE: SUTRA-STYLE VERTICAL COLLAPSIBLE ACCORDION */}
        <div className="jasman-sutra-accordion-mobile">
          {enrichedCategories.map((cat, idx) => {
            const isActive = idx === activeIndex;
            return (
              <div
                key={cat.id}
                style={{
                  borderRadius: 22,
                  overflow: 'hidden',
                  background: isActive ? '#1A1F36' : '#F8F9FA',
                  border: isActive
                    ? '1px solid rgba(196, 30, 36, 0.32)'
                    : '1px solid rgba(26, 31, 54, 0.08)',
                  transition: 'all 0.35s ease',
                }}
              >
                <button
                  type="button"
                  onClick={() => setActiveIndex(isActive ? -1 : idx)}
                  style={{
                    width: '100%',
                    padding: '20px 22px',
                    background: 'transparent',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span
                      style={{
                        fontFamily: F.heading,
                        fontSize: 12,
                        fontWeight: 900,
                        color: isActive ? '#FCA5A5' : C.red,
                      }}
                    >
                      {cat.index}
                    </span>
                    <div>
                      <div
                        style={{
                          fontFamily: F.heading,
                          fontSize: 17,
                          fontWeight: 900,
                          color: isActive ? '#FFFFFF' : C.navy,
                        }}
                      >
                        {cat.title}
                      </div>
                      <div
                        style={{
                          fontFamily: F.body,
                          fontSize: 12,
                          color: isActive ? 'rgba(255,255,255,0.65)' : '#64748B',
                        }}
                      >
                        {cat.count} modelos disponibles
                      </div>
                    </div>
                  </div>

                  <span
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: isActive ? C.red : '#FFFFFF',
                      color: isActive ? '#FFFFFF' : C.navy,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {isActive ? <Minus size={15} /> : <Plus size={15} />}
                  </span>
                </button>

                {isActive && (
                  <div style={{ padding: '0 22px 24px', color: '#FFFFFF' }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 16,
                        marginBottom: 16,
                      }}
                    >
                      <img
                        src={cat.tireImage}
                        alt={cat.title}
                        style={{
                          width: 96,
                          height: 96,
                          objectFit: 'contain',
                          flexShrink: 0,
                        }}
                      />
                      <p
                        style={{
                          fontSize: 13,
                          lineHeight: 1.55,
                          color: 'rgba(255,255,255,0.78)',
                          margin: 0,
                        }}
                      >
                        {cat.description}
                      </p>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 18 }}>
                      {cat.measures.map((m) => (
                        <Link
                          key={m}
                          to={`/landing-tienda-preview/catalogo?measure=${encodeURIComponent(m)}`}
                          style={{
                            padding: '5px 10px',
                            borderRadius: 9999,
                            background: 'rgba(255,255,255,0.10)',
                            color: '#FFFFFF',
                            fontFamily: F.heading,
                            fontSize: 10.5,
                            fontWeight: 700,
                            textDecoration: 'none',
                          }}
                        >
                          {m}
                        </Link>
                      ))}
                    </div>

                    <Link
                      to={cat.href}
                      style={{
                        width: '100%',
                        padding: '13px 20px',
                        borderRadius: 9999,
                        background: C.red,
                        color: '#FFFFFF',
                        fontFamily: F.heading,
                        fontSize: 11.5,
                        fontWeight: 800,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                      }}
                    >
                      Explorar Categoría <ArrowUpRight size={14} />
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        .jasman-sutra-accordion-desktop {
          display: flex;
          align-items: stretch;
          gap: 14px;
          width: 100%;
        }
        .jasman-sutra-accordion-mobile {
          display: none;
          flex-direction: column;
          gap: 12px;
        }
        @keyframes jasmanAccordionTireIn {
          0% {
            opacity: 0;
            transform: scale(0.88) translateX(18px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateX(0);
          }
        }
        @media (max-width: 960px) {
          .jasman-sutra-accordion-desktop {
            display: none !important;
          }
          .jasman-sutra-accordion-mobile {
            display: flex !important;
          }
        }
      `}</style>
    </section>
  );
}

