import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { C, F } from '../../hooks/useAnimations';
import {
  BRAND_META,
  VEHICLE_TYPE_OPTIONS,
  POPULAR_CAR_MODELS,
  useWixCatalogProducts,
  formatMXN,
} from '../../data/productosMasterData';
import TiendaVehicleSvg from './TiendaVehicleTypeIcons';
import { ArrowRight, ArrowUpRight, Plus, Minus } from 'lucide-react';

const SUTRA_BRAND_PANELS = [
  {
    id: 'michelin',
    index: '01',
    label: 'MICHELIN',
    brandKey: 'Michelin',
    origin: 'Ingeniería Francesa · Larga Duración',
    description:
      'Compuesto EverGrip™ que mantiene distancias cortas de frenado en piso seco y mojado desde el primer hasta el último kilómetro.',
    photo:
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1000&q=80',
    fallbackTire: '/images/tires/tire-539.png',
    fallbackMeasures: ['205/55R16', '225/45R17', '215/55R17'],
  },
  {
    id: 'bfgoodrich',
    index: '02',
    label: 'BFGOODRICH',
    brandKey: 'BFGoodrich',
    origin: 'Tracción Off-Road & All-Terrain',
    description:
      'Costados CoreGard™ probados en competencia todoterreno con bloques agresivos para dominar asfalto, grava, lodo y roca.',
    photo:
      'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1000&q=80',
    fallbackTire: '/images/tires/tire-568.png',
    fallbackMeasures: ['265/70R17', '245/75R17', '31X10.50R15'],
  },
  {
    id: 'goodyear',
    index: '03',
    label: 'GOODYEAR',
    brandKey: 'Goodyear',
    origin: 'Tecnología Estadounidense · ActiveBraking',
    description:
      'Mayor superficie de contacto bajo frenado exigente, carcasa reforzada contra baches y confort silencioso en carretera.',
    photo:
      'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1000&q=80',
    fallbackTire: '/images/tires/tire-572.png',
    fallbackMeasures: ['195/65R15', '205/55R16', '215/60R16'],
  },
  {
    id: 'kelly',
    index: '04',
    label: 'KELLY',
    brandKey: 'Kelly',
    origin: 'Respaldo Goodyear · Ciudad & Diario',
    description:
      'Banda de rodamiento optimizada para alto rendimiento kilométrico, desgaste uniforme y máxima confiabilidad en uso urbano.',
    photo:
      'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=1000&q=80',
    fallbackTire: '/images/tires/tire-590.png',
    fallbackMeasures: ['175/70R14', '185/65R15', '195/65R15'],
  },
  {
    id: 'hankook',
    index: '05',
    label: 'HANKOOK',
    brandKey: 'Hankook',
    origin: 'Socio Técnico Oficial · FIA Formula E',
    description:
      'Compuestos de sílice de alta dispersión desarrollados para máxima adherencia, eficiencia energética y control deportivo.',
    photo:
      'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?auto=format&fit=crop&w=1000&q=80',
    fallbackTire: '/images/tires/tire-561.png',
    fallbackMeasures: ['205/55R16', '185/65R15', '285/45R21'],
  },
  {
    id: 'laufenn',
    index: '06',
    label: 'LAUFENN',
    brandKey: 'Laufenn',
    origin: 'By Hankook · Desempeño Inteligente',
    description:
      'Diseño asimétrico de 4 canales longitudinales para evacuación rápida de agua, estabilidad en curvas y manejo dinámico.',
    photo:
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1000&q=80',
    fallbackTire: '/images/tires/tire-555.png',
    fallbackMeasures: ['215/45R17', '215/55R17', '205/55R16'],
  },
  {
    id: 'pirelli',
    index: '07',
    label: 'PIRELLI',
    brandKey: 'Pirelli',
    origin: 'Herencia Italiana · Ultra High Performance',
    description:
      'Equipo original de las firmas deportivas más prestigiosas del mundo con precisión milimétrica en dirección y curvas.',
    photo:
      'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=1000&q=80',
    fallbackTire: '/images/tires/tire-589.png',
    fallbackMeasures: ['225/45R17', '235/55R18', '205/55R16'],
  },
  {
    id: 'firestone',
    index: '08',
    label: 'FIRESTONE',
    brandKey: 'Firestone',
    origin: 'Tradición & Resistencia Comprobada',
    description:
      'Canales hidrodinámicos y estructura robusta diseñada para brindar tracción constante y larga vida útil en ciudad y autopista.',
    photo:
      'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1000&q=80',
    fallbackTire: '/images/tires/tire-542.png',
    fallbackMeasures: ['185/65R15', '195/65R15', '235/75R15'],
  },
  {
    id: 'bridgestone',
    index: '09',
    label: 'BRIDGESTONE',
    brandKey: 'Bridgestone',
    origin: 'Ingeniería Japonesa · NanoPro-Tech™',
    description:
      'Compuestos avanzados de equipo original que reducen la fricción térmica, mejoran el frenado en mojado y maximizan confort.',
    photo:
      'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1000&q=80',
    fallbackTire: '/images/tires/tire-546.png',
    fallbackMeasures: ['205/55R16', '195/65R15', '215/65R16'],
  },
  {
    id: 'euzkadi',
    index: '10',
    label: 'EUZKADI',
    brandKey: 'Euzkadi',
    origin: 'Hecha para los Caminos de México',
    description:
      'Hombros reforzados de alta resistencia contra impactos y excelente tracción para autos, camionetas y carga ligera.',
    photo:
      'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1000&q=80',
    fallbackTire: '/images/tires/tire-569.png',
    fallbackMeasures: ['185/65R14', '235/75R15', '27X8.50R14'],
  },
  {
    id: 'continental',
    index: '11',
    label: 'CONTINENTAL',
    brandKey: 'Continental',
    origin: 'Ingeniería Alemana · SafetySilica',
    description:
      'Diseño macro-bloque de precisión alemana que acorta la distancia de frenado y eleva el kilometraje en todo clima.',
    photo:
      'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=1000&q=80',
    fallbackTire: '/images/tires/tire-572.png',
    fallbackMeasures: ['205/55R16', '195/65R15', '225/70R19.5'],
  },
  {
    id: 'general',
    index: '12',
    label: 'GENERAL',
    brandKey: 'General Tire',
    origin: 'Tecnología Duragen™ · SUV & 4×4',
    description:
      'Carcasa de ultra resistencia ideal para SUVs y Pick-Ups que demandan estabilidad en carretera y capacidad todoterreno.',
    photo:
      'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1000&q=80',
    fallbackTire: '/images/tires/tire-568.png',
    fallbackMeasures: ['245/75R17', '235/75R15', '27X8.50R14'],
  },
  {
    id: 'barum',
    index: '13',
    label: 'BARUM',
    brandKey: 'Barum',
    origin: 'Grupo Continental · Europa',
    description:
      'Respaldada por la ingeniería europea de Grupo Continental, ofrece desgaste uniforme, bajo ruido y gran costo-kilómetro.',
    photo:
      'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=1000&q=80',
    fallbackTire: '/images/tires/tire-538.png',
    fallbackMeasures: ['185/60R15', '195/65R15', '205/55R16'],
  },
];

export default function TiendaCategoriesAccordion() {
  const [activeId, setActiveId] = useState(SUTRA_BRAND_PANELS[0].id);
  const { products: catalogProducts } = useWixCatalogProducts();

  const enrichedPanels = useMemo(() => {
    return SUTRA_BRAND_PANELS.map((panel) => {
      const matched = catalogProducts.filter(
        (p) => p.brand === panel.brandKey && p.inStock && p.finalPriceTaxExcluded > 0
      );
      const allForBrand = catalogProducts.filter((p) => p.brand === panel.brandKey);
      const minPrice =
        matched.length > 0
          ? Math.min(...matched.map((p) => p.finalPriceTaxExcluded))
          : null;

      const dynamicMeasures = Array.from(
        new Set(matched.map((p) => p.measure).filter(Boolean))
      ).slice(0, 3);

      const sampleTire = matched[0] || allForBrand[0] || null;
      const meta = BRAND_META[panel.brandKey];

      return {
        ...panel,
        logo: meta?.logo || null,
        count: allForBrand.length,
        minPrice,
        measures: dynamicMeasures.length > 0 ? dynamicMeasures : panel.fallbackMeasures,
        tireCutout:
          sampleTire?.cutoutImage || sampleTire?.primaryImage || panel.fallbackTire,
        href: `/landing-tienda-preview/catalogo?brand=${encodeURIComponent(panel.brandKey)}`,
      };
    });
  }, [catalogProducts]);

  return (
    <section
      id="marcas-acordeon"
      style={{
        padding: '96px 24px 88px',
        background: '#FFFFFF',
        borderTop: '1px solid rgba(26, 31, 54, 0.06)',
      }}
    >
      <div style={{ maxWidth: 1360, margin: '0 auto' }}>
        {/* Section Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 20,
            marginBottom: 38,
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
              13 Firmas Oficiales · Garantía Directa
            </span>
            <h2
              style={{
                fontFamily: F.heading,
                fontSize: 'clamp(2.1rem, 4vw, 3.35rem)',
                fontWeight: 900,
                color: C.navy,
                letterSpacing: '-0.04em',
                lineHeight: 1.04,
                margin: 0,
              }}
            >
              Explora por <span style={{ color: C.red }}>marca.</span>
            </h2>
          </div>

          <Link
            to="/landing-tienda-preview/catalogo"
            className="sutra-brands-all-btn"
            style={{
              padding: '12px 22px',
              borderRadius: 9999,
              background: '#F8F9FA',
              border: '1px solid rgba(26, 31, 54, 0.10)',
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

        {/* DESKTOP SUTRA HORIZONTAL EXPANDING 13-BRAND PHOTO ACCORDION */}
        <div
          className="sutra-brands-desktop"
          style={{
            display: 'flex',
            gap: 8,
            height: 510,
            width: '100%',
          }}
        >
          {enrichedPanels.map((panel) => {
            const isActive = panel.id === activeId;
            return (
              <div
                key={panel.id}
                role="button"
                tabIndex={0}
                onMouseEnter={() => setActiveId(panel.id)}
                onClick={() => setActiveId(panel.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setActiveId(panel.id);
                  }
                }}
                style={{
                  flex: isActive ? '6.4 1 0%' : '1 1 0%',
                  minWidth: 0,
                  position: 'relative',
                  borderRadius: isActive ? 28 : 20,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  background: '#0F1424',
                  border: isActive
                    ? '1px solid rgba(196, 30, 36, 0.45)'
                    : '1px solid rgba(26, 31, 54, 0.12)',
                  boxShadow: isActive
                    ? '0 28px 64px rgba(15, 20, 36, 0.24)'
                    : '0 8px 24px rgba(15, 20, 36, 0.08)',
                  transition:
                    'flex 0.56s cubic-bezier(0.16, 1, 0.3, 1), border-radius 0.4s ease, box-shadow 0.4s ease, border-color 0.35s ease',
                }}
              >
                {/* Full-bleed Automotive Background Photo */}
                <img
                  src={panel.photo}
                  alt={panel.label}
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.src = '/images/promo-landing-banner.jpg';
                  }}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'center',
                    transform: isActive ? 'scale(1.04)' : 'scale(1.12)',
                    filter: isActive
                      ? 'brightness(0.85) contrast(1.06)'
                      : 'brightness(0.45) grayscale(25%)',
                    transition:
                      'transform 0.75s cubic-bezier(0.16, 1, 0.3, 1), filter 0.45s ease',
                    pointerEvents: 'none',
                  }}
                />

                {/* Cinematic Gradient Scrim for Crisp Typography */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: isActive
                      ? 'linear-gradient(180deg, rgba(12, 16, 30, 0.38) 0%, rgba(12, 16, 30, 0.56) 46%, rgba(12, 16, 30, 0.95) 100%)'
                      : 'linear-gradient(180deg, rgba(12, 16, 30, 0.52) 0%, rgba(12, 16, 30, 0.82) 100%)',
                    pointerEvents: 'none',
                  }}
                />

                {/* COLLAPSED VERTICAL STRIP VIEW */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    padding: '18px 0',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    opacity: isActive ? 0 : 1,
                    pointerEvents: isActive ? 'none' : 'auto',
                    transition: 'opacity 0.22s ease',
                  }}
                >
                  <span
                    style={{
                      fontFamily: F.heading,
                      fontSize: 10,
                      fontWeight: 800,
                      letterSpacing: '0.08em',
                      color: 'rgba(255, 255, 255, 0.68)',
                    }}
                  >
                    {panel.index}
                  </span>

                  <span
                    style={{
                      writingMode: 'vertical-rl',
                      transform: 'rotate(180deg)',
                      fontFamily: F.heading,
                      fontSize: 12.5,
                      fontWeight: 900,
                      letterSpacing: '0.16em',
                      color: '#FFFFFF',
                      whiteSpace: 'nowrap',
                      textShadow: '0 2px 10px rgba(0,0,0,0.45)',
                    }}
                  >
                    {panel.label}
                  </span>

                  <span
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: '50%',
                      background: 'rgba(255, 255, 255, 0.14)',
                      border: '1px solid rgba(255, 255, 255, 0.24)',
                      color: '#FFFFFF',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Plus size={13} />
                  </span>
                </div>

                {/* EXPANDED ACTIVE PANEL VIEW */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    padding: '26px 28px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    opacity: isActive ? 1 : 0,
                    pointerEvents: isActive ? 'auto' : 'none',
                    transition: isActive ? 'opacity 0.38s ease 0.14s' : 'opacity 0.12s ease',
                  }}
                >
                  {/* Top Row: Official Brand Vector Logo Pill + Live Model Count */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 10,
                      position: 'relative',
                      zIndex: 3,
                    }}
                  >
                    <div
                      style={{
                        height: 38,
                        padding: '6px 16px',
                        borderRadius: 9999,
                        background: 'rgba(255, 255, 255, 0.96)',
                        boxShadow: '0 10px 26px rgba(0, 0, 0, 0.22)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {panel.logo ? (
                        <img
                          src={panel.logo}
                          alt={panel.label}
                          style={{
                            height: 20,
                            maxWidth: 120,
                            width: 'auto',
                            objectFit: 'contain',
                          }}
                        />
                      ) : (
                        <span
                          style={{
                            fontFamily: F.heading,
                            fontSize: 12,
                            fontWeight: 900,
                            color: C.navy,
                          }}
                        >
                          {panel.label}
                        </span>
                      )}
                    </div>

                    <span
                      style={{
                        padding: '6px 12px',
                        borderRadius: 9999,
                        background: 'rgba(196, 30, 36, 0.92)',
                        color: '#FFFFFF',
                        fontFamily: F.heading,
                        fontSize: 10,
                        fontWeight: 800,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {panel.count > 0 ? `${panel.count} modelos` : 'Marca Oficial'}
                    </span>
                  </div>

                  {/* Floating 3/4 Studio Tire Cutout on Right */}
                  <img
                    src={panel.tireCutout}
                    alt={`Llanta ${panel.label}`}
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src = panel.fallbackTire;
                    }}
                    style={{
                      position: 'absolute',
                      right: 16,
                      top: '22%',
                      width: 158,
                      height: 158,
                      objectFit: 'contain',
                      filter: 'drop-shadow(0 22px 30px rgba(0, 0, 0, 0.65))',
                      pointerEvents: 'none',
                      zIndex: 2,
                    }}
                  />

                  {/* Bottom Editorial Content */}
                  <div style={{ position: 'relative', zIndex: 3, maxWidth: 360 }}>
                    <span
                      style={{
                        fontFamily: F.heading,
                        fontSize: 10,
                        fontWeight: 800,
                        letterSpacing: '0.18em',
                        textTransform: 'uppercase',
                        color: '#FCA5A5',
                        display: 'block',
                        marginBottom: 6,
                      }}
                    >
                      {panel.index} · {panel.origin}
                    </span>

                    <h3
                      style={{
                        fontFamily: F.heading,
                        fontSize: 'clamp(1.6rem, 2.3vw, 2.2rem)',
                        fontWeight: 900,
                        letterSpacing: '-0.03em',
                        lineHeight: 1.05,
                        color: '#FFFFFF',
                        margin: '0 0 10px',
                      }}
                    >
                      {panel.label}
                    </h3>

                    <p
                      style={{
                        fontSize: 12.5,
                        lineHeight: 1.5,
                        color: 'rgba(255, 255, 255, 0.82)',
                        margin: '0 0 14px',
                        maxWidth: 290,
                      }}
                    >
                      {panel.description}
                    </p>

                    {/* Quick Measure Chips */}
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 6,
                        marginBottom: 16,
                      }}
                    >
                      {panel.measures.map((m) => (
                        <Link
                          key={m}
                          to={`/landing-tienda-preview/catalogo?brand=${encodeURIComponent(
                            panel.brandKey
                          )}&measure=${encodeURIComponent(m)}`}
                          onClick={(e) => e.stopPropagation()}
                          className="sutra-measure-chip"
                          style={{
                            padding: '4px 10px',
                            borderRadius: 9999,
                            background: 'rgba(255, 255, 255, 0.14)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255, 255, 255, 0.22)',
                            color: '#FFFFFF',
                            fontFamily: F.heading,
                            fontSize: 10,
                            fontWeight: 800,
                            textDecoration: 'none',
                          }}
                        >
                          {m}
                        </Link>
                      ))}
                    </div>

                    {/* Price Con IVA + CTA */}
                    <div
                      style={{
                        paddingTop: 14,
                        borderTop: '1px solid rgba(255, 255, 255, 0.16)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 12,
                        flexWrap: 'wrap',
                      }}
                    >
                      <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.78)' }}>
                        {panel.minPrice ? (
                          <>
                            Desde{' '}
                            <strong
                              style={{
                                fontFamily: F.heading,
                                fontSize: 15,
                                fontWeight: 900,
                                color: '#FFFFFF',
                              }}
                            >
                              {formatMXN(panel.minPrice)}
                            </strong>{' '}
                            · Con IVA
                          </>
                        ) : (
                          <strong style={{ fontFamily: F.heading, color: '#FFFFFF' }}>
                            Precios Oficiales · Con IVA
                          </strong>
                        )}
                      </div>

                      <Link
                        to={panel.href}
                        onClick={(e) => e.stopPropagation()}
                        className="sutra-brand-cta"
                        style={{
                          padding: '9px 16px',
                          borderRadius: 9999,
                          background: C.red,
                          color: '#FFFFFF',
                          fontFamily: F.heading,
                          fontSize: 10.5,
                          fontWeight: 800,
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase',
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 5,
                          boxShadow: '0 8px 22px rgba(196, 30, 36, 0.38)',
                        }}
                      >
                        Ver {panel.label} <ArrowUpRight size={13} />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* MOBILE / TABLET VERTICAL PHOTO ACCORDION */}
        <div
          className="sutra-brands-mobile"
          style={{
            display: 'none',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          {enrichedPanels.map((panel) => {
            const isOpen = panel.id === activeId;
            return (
              <div
                key={panel.id}
                style={{
                  position: 'relative',
                  borderRadius: 22,
                  overflow: 'hidden',
                  background: '#0F1424',
                  border: isOpen
                    ? '1px solid rgba(196, 30, 36, 0.45)'
                    : '1px solid rgba(26, 31, 54, 0.12)',
                  transition: 'all 0.35s ease',
                }}
              >
                <img
                  src={panel.photo}
                  alt={panel.label}
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.src = '/images/promo-landing-banner.jpg';
                  }}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    filter: isOpen ? 'brightness(0.55)' : 'brightness(0.36)',
                    pointerEvents: 'none',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background:
                      'linear-gradient(180deg, rgba(12,16,30,0.45) 0%, rgba(12,16,30,0.92) 100%)',
                    pointerEvents: 'none',
                  }}
                />

                <button
                  type="button"
                  onClick={() => setActiveId(isOpen ? '' : panel.id)}
                  style={{
                    position: 'relative',
                    zIndex: 2,
                    width: '100%',
                    padding: '16px 18px',
                    background: 'transparent',
                    border: 'none',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span
                      style={{
                        fontFamily: F.heading,
                        fontSize: 10.5,
                        fontWeight: 800,
                        color: '#FCA5A5',
                      }}
                    >
                      {panel.index}
                    </span>
                    <span
                      style={{
                        fontFamily: F.heading,
                        fontSize: 15,
                        fontWeight: 900,
                        letterSpacing: '0.08em',
                        color: '#FFFFFF',
                      }}
                    >
                      {panel.label}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {panel.count > 0 && (
                      <span
                        style={{
                          fontFamily: F.heading,
                          fontSize: 10,
                          fontWeight: 700,
                          color: 'rgba(255,255,255,0.75)',
                        }}
                      >
                        {panel.count} uds.
                      </span>
                    )}
                    <span
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        background: isOpen ? C.red : 'rgba(255,255,255,0.16)',
                        color: '#FFFFFF',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {isOpen ? <Minus size={14} /> : <Plus size={14} />}
                    </span>
                  </div>
                </button>

                {isOpen && (
                  <div
                    style={{
                      position: 'relative',
                      zIndex: 2,
                      padding: '4px 18px 20px',
                      color: '#FFFFFF',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 12,
                        marginBottom: 12,
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        {panel.logo && (
                          <div
                            style={{
                              height: 30,
                              padding: '4px 12px',
                              borderRadius: 9999,
                              background: 'rgba(255, 255, 255, 0.96)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              marginBottom: 10,
                            }}
                          >
                            <img
                              src={panel.logo}
                              alt={panel.label}
                              style={{
                                height: 15,
                                maxWidth: 96,
                                width: 'auto',
                                objectFit: 'contain',
                              }}
                            />
                          </div>
                        )}
                        <p
                          style={{
                            fontSize: 12.5,
                            lineHeight: 1.5,
                            color: 'rgba(255,255,255,0.86)',
                            margin: 0,
                          }}
                        >
                          {panel.description}
                        </p>
                      </div>

                      <img
                        src={panel.tireCutout}
                        alt={`Llanta ${panel.label}`}
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.src = panel.fallbackTire;
                        }}
                        style={{
                          width: 84,
                          height: 84,
                          objectFit: 'contain',
                          flexShrink: 0,
                          filter: 'drop-shadow(0 12px 18px rgba(0,0,0,0.55))',
                        }}
                      />
                    </div>

                    {/* Quick Measure Chips on Mobile */}
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 6,
                        marginBottom: 14,
                      }}
                    >
                      {panel.measures.map((m) => (
                        <Link
                          key={m}
                          to={`/landing-tienda-preview/catalogo?brand=${encodeURIComponent(
                            panel.brandKey
                          )}&measure=${encodeURIComponent(m)}`}
                          style={{
                            padding: '4px 10px',
                            borderRadius: 9999,
                            background: 'rgba(255, 255, 255, 0.15)',
                            border: '1px solid rgba(255, 255, 255, 0.24)',
                            color: '#FFFFFF',
                            fontFamily: F.heading,
                            fontSize: 10,
                            fontWeight: 800,
                            textDecoration: 'none',
                          }}
                        >
                          {m}
                        </Link>
                      ))}
                    </div>

                    <div
                      style={{
                        paddingTop: 12,
                        borderTop: '1px solid rgba(255, 255, 255, 0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: 10,
                      }}
                    >
                      <span style={{ fontSize: 12, fontWeight: 700 }}>
                        {panel.minPrice
                          ? `Desde ${formatMXN(panel.minPrice)} · Con IVA`
                          : 'Precios Oficiales · Con IVA'}
                      </span>
                      <Link
                        to={panel.href}
                        style={{
                          padding: '9px 16px',
                          borderRadius: 9999,
                          background: C.red,
                          color: '#FFFFFF',
                          fontFamily: F.heading,
                          fontSize: 10.5,
                          fontWeight: 800,
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase',
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 5,
                        }}
                      >
                        Ver {panel.label} <ArrowUpRight size={13} />
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* VEHICLE TYPE & CAR MODELS MINIMALIST SVG SHOWCASE BELOW BRANDS */}
        <div
          style={{
            marginTop: 52,
            paddingTop: 42,
            borderTop: '1px solid rgba(26, 31, 54, 0.08)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 16,
              marginBottom: 24,
            }}
          >
            <div>
              <span
                style={{
                  fontFamily: F.heading,
                  fontSize: 10.5,
                  fontWeight: 800,
                  letterSpacing: '0.24em',
                  textTransform: 'uppercase',
                  color: C.red,
                  display: 'block',
                  marginBottom: 6,
                }}
              >
                8 Segmentos Homologados · Modelos de Autos
              </span>
              <h3
                style={{
                  fontFamily: F.heading,
                  fontSize: 'clamp(1.45rem, 2.6vw, 2.1rem)',
                  fontWeight: 900,
                  color: C.navy,
                  letterSpacing: '-0.03em',
                  margin: 0,
                }}
              >
                Elige por <span style={{ color: C.red }}>tipo de vehículo.</span>
              </h3>
            </div>

            <span
              style={{
                fontFamily: F.body,
                fontSize: 13,
                color: '#64748B',
              }}
            >
              Selecciona segmento o modelo compatible para filtrar medidas exactas
            </span>
          </div>

          <div
            className="sutra-vehicle-types-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
              gap: 14,
            }}
          >
            {VEHICLE_TYPE_OPTIONS.map((vt) => {
              const count = catalogProducts.filter((p) =>
                Array.isArray(p.vehicleTypes)
                  ? p.vehicleTypes.includes(vt.id)
                  : p.vehicleType === vt.id
              ).length;

              return (
                <Link
                  key={vt.id}
                  to={`/landing-tienda-preview/catalogo?vehicle=${encodeURIComponent(vt.id)}`}
                  className="sutra-vehicle-card"
                  style={{
                    padding: '18px 18px 16px',
                    borderRadius: 22,
                    background: '#F8FAFC',
                    border: '1px solid rgba(26, 31, 54, 0.08)',
                    textDecoration: 'none',
                    color: C.navy,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: 12,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 10,
                    }}
                  >
                    <TiendaVehicleSvg type={vt.id} width={96} height={36} />
                    <span
                      className="sutra-vehicle-badge"
                      style={{
                        padding: '4px 9px',
                        borderRadius: 9999,
                        background: '#FFFFFF',
                        border: '1px solid rgba(26, 31, 54, 0.08)',
                        fontFamily: F.heading,
                        fontSize: 10,
                        fontWeight: 800,
                        color: C.navy,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {count} llantas
                    </span>
                  </div>

                  <div>
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
                          fontFamily: F.heading,
                          fontSize: 15,
                          fontWeight: 900,
                          color: C.navy,
                          letterSpacing: '-0.02em',
                        }}
                      >
                        {vt.label}
                      </span>
                      <ArrowUpRight size={15} color={C.red} />
                    </div>
                    <div
                      style={{
                        fontFamily: F.body,
                        fontSize: 11.5,
                        color: '#64748B',
                        marginTop: 3,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {vt.modelsText}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Clickable Car Models Strip ("Modelos de Autos") */}
          <div
            style={{
              marginTop: 16,
              padding: '14px 18px',
              borderRadius: 20,
              background: '#F8FAFC',
              border: '1px solid rgba(26, 31, 54, 0.07)',
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 8,
            }}
          >
            <span
              style={{
                fontFamily: F.heading,
                fontSize: 10.5,
                fontWeight: 800,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: C.red,
                marginRight: 6,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9" />
                <circle cx="12" cy="12" r="2.5" />
                <path d="M12 3v6.5M4.2 16.5l5.6-3.2M19.8 16.5l-5.6-3.2" />
              </svg>
              Modelos de Autos:
            </span>

            {POPULAR_CAR_MODELS.map((cm) => (
              <Link
                key={cm.id}
                to={`/landing-tienda-preview/catalogo?vehicle=${encodeURIComponent(
                  cm.vehicle
                )}&carModel=${encodeURIComponent(cm.id)}`}
                className="sutra-car-model-pill"
                style={{
                  padding: '6px 12px',
                  borderRadius: 9999,
                  background: '#FFFFFF',
                  border: '1px solid rgba(26, 31, 54, 0.10)',
                  color: C.navy,
                  fontFamily: F.heading,
                  fontSize: 11,
                  fontWeight: 800,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                }}
              >
                <span>{cm.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .sutra-brands-all-btn {
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .sutra-brands-all-btn:hover {
          background: #1A1F36 !important;
          color: #FFFFFF !important;
          border-color: #1A1F36 !important;
          transform: translateY(-2px);
        }
        .sutra-measure-chip {
          transition: all 0.22s ease;
        }
        .sutra-measure-chip:hover {
          background: #C41E24 !important;
          border-color: #C41E24 !important;
          transform: translateY(-1px);
        }
        .sutra-brand-cta {
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .sutra-brand-cta:hover {
          background: #FFFFFF !important;
          color: #1A1F36 !important;
          transform: translateY(-2px);
        }
        .sutra-vehicle-card {
          transition: all 0.28s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .sutra-vehicle-card:hover {
          background: #FFF7F7 !important;
          border-color: #C41E24 !important;
          transform: translateY(-3px);
          box-shadow: 0 16px 34px rgba(196, 30, 36, 0.10);
        }
        .sutra-car-model-pill {
          transition: all 0.2s ease;
        }
        .sutra-car-model-pill:hover {
          background: #C41E24 !important;
          border-color: #C41E24 !important;
          color: #FFFFFF !important;
          transform: translateY(-1px);
        }
        @media (max-width: 1080px) {
          .sutra-brands-desktop {
            display: none !important;
          }
          .sutra-brands-mobile {
            display: flex !important;
          }
          .sutra-vehicle-types-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
        }
        @media (max-width: 640px) {
          #marcas-acordeon {
            padding: 58px 16px 52px !important;
          }
          .sutra-vehicle-types-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
