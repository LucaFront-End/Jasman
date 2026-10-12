import { useRef, useState, useEffect, useCallback } from 'react';
import { C, F } from '../hooks/useAnimations';
import Icon from './Icon';
import { ChevronLeft, ChevronRight, MousePointer } from 'lucide-react';

const timeline = [
  {
    year: '1960',
    title: 'Los Primeros Pasos',
    text: 'Don José Manuel Aburto funda una pequeña refaccionaria en el corazón de la Ciudad de México. Lo que empezó como un modesto negocio familiar se convertiría en el inicio de una gran historia automotriz mexicana.',
    icon: 'store',
    image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=600&q=80',
  },
  {
    year: '1975',
    title: 'Primeras Sucursales',
    text: 'Se inaugura la segunda sucursal en la delegación Coyoacán. La filosofía de trato cercano y precios justos comienza a ganar reputación entre los automovilistas capitalinos.',
    icon: 'wrench',
    image: 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=600&q=80',
  },
  {
    year: '1985',
    title: 'Expansión Regional',
    text: 'Con una década de crecimiento constante, Jasman abre su sucursal número 10 y comienza a ofrecer servicios integrales de alineación, balanceo y frenos, convirtiéndose en un centro de soluciones automotrices.',
    icon: 'trending-up',
    image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=600&q=80',
  },
  {
    year: '1995',
    title: 'Marcas de Confianza',
    text: 'Se formalizan alianzas estratégicas con las principales marcas de llantas del mundo: Michelin, Bridgestone, Goodyear y Continental eligen a Jasman como distribuidor autorizado.',
    icon: 'handshake',
    image: '/images/brands-trust.png',
  },
  {
    year: '2000',
    title: 'Era Digital',
    text: 'Incorporamos equipos de diagnóstico computarizado de última generación. La alineación láser y el balanceo electrónico nos posicionan como referentes tecnológicos del sector automotriz.',
    icon: 'monitor',
    image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=600&q=80',
  },
  {
    year: '2010',
    title: 'Capacitación Continua',
    text: 'Se establece el Centro de Capacitación Jasman, donde se forman técnicos certificados en las últimas tecnologías automotrices. Más de 500 profesionales capacitados cada año.',
    icon: 'graduation-cap',
    image: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=600&q=80',
  },
  {
    year: '2015',
    title: 'Presencia Nacional',
    text: 'Jasman alcanza presencia en más de 20 ciudades del país, incluyendo Monterrey, Guadalajara, Puebla y Querétaro. La red de sucursales llega a 50 puntos de servicio.',
    icon: 'map',
    image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600&q=80',
  },
  {
    year: '2024',
    title: 'Líder Nacional',
    text: 'Con más de 80 sucursales a lo largo de todo México, más de 1 millón de servicios realizados y la confianza de millones de familias mexicanas, Jasman es hoy sinónimo de calidad automotriz.',
    icon: 'trophy',
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&q=80',
  },
];

// 45vh per timeline item = ~360vh total scroll distance
const HEIGHT_PER_ITEM_VH = 45;

export default function Timeline() {
  const containerRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  // Track window resize for card stride measurement
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Compute scroll progress strictly relative to the container
  useEffect(() => {
    const handleScroll = () => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const totalScroll = el.offsetHeight - window.innerHeight;
      if (totalScroll <= 0) return;

      const scrolled = -rect.top;
      const rawProgress = scrolled / totalScroll;
      const clamped = Math.max(0, Math.min(1, rawProgress));
      setProgress(clamped);

      const idx = Math.min(timeline.length - 1, Math.round(clamped * (timeline.length - 1)));
      setActiveIndex(idx);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Smooth scroll to a specific milestone
  const scrollToMilestone = useCallback((index) => {
    const el = containerRef.current;
    if (!el) return;
    const totalScroll = el.offsetHeight - window.innerHeight;
    const targetTop = el.offsetTop + (index / (timeline.length - 1)) * totalScroll;
    window.scrollTo({ top: targetTop, behavior: 'smooth' });
  }, []);

  const goToPrev = () => scrollToMilestone(Math.max(0, activeIndex - 1));
  const goToNext = () => scrollToMilestone(Math.min(timeline.length - 1, activeIndex + 1));

  // Dynamic card width and step calculation
  const cardWidth = windowWidth < 640 ? Math.min(340, windowWidth * 0.85) : 440;
  const cardGap = windowWidth < 640 ? 18 : 28;
  const cardStep = cardWidth + cardGap;
  const trackTranslate = progress * (timeline.length - 1) * -cardStep;

  return (
    <section
      id="historia"
      ref={containerRef}
      style={{
        position: 'relative',
        height: `${timeline.length * HEIGHT_PER_ITEM_VH}vh`,
        background: '#FAFAFC',
      }}
    >
      {/* Sticky Fullscreen Stage */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          width: '100%',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 'clamp(20px, 4vh, 36px) 0 clamp(16px, 3vh, 24px)',
          boxSizing: 'border-box',
          background: 'linear-gradient(180deg, #FAFAFC 0%, #FFFFFF 100%)',
        }}
      >
        {/* Background Watermark Year */}
        <div
          style={{
            position: 'absolute',
            top: '32%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: 'clamp(7rem, 20vw, 15rem)',
            fontFamily: F.heading,
            fontWeight: 900,
            color: 'rgba(196,30,36,0.038)',
            letterSpacing: '-0.04em',
            pointerEvents: 'none',
            userSelect: 'none',
            zIndex: 0,
            lineHeight: 1,
            transition: 'all 0.5s ease-out',
          }}
        >
          {timeline[activeIndex].year}
        </div>

        {/* 1. Header (Fixed top area) */}
        <div style={{ textAlign: 'center', padding: '0 1.5rem', position: 'relative', zIndex: 1, flexShrink: 0 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 16px', borderRadius: 9999,
            background: 'rgba(196,30,36,0.08)', color: C.red,
            fontFamily: F.heading, fontWeight: 700, fontSize: 12, letterSpacing: '0.06em', textTransform: 'uppercase',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.red, animation: 'pulseGlow 2s infinite' }} />
            NUESTRA HISTORIA
          </span>
          <h2 style={{
            fontFamily: F.heading, fontWeight: 800, fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)', color: C.navy,
            marginTop: 10, lineHeight: 1.15,
          }}>
            Más de 60 años{' '}
            <span className="animated-gradient" style={{
              background: `linear-gradient(135deg, ${C.red}, ${C.redLight}, ${C.red})`,
              backgroundSize: '200% 200%', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>escribiendo historia</span>
          </h2>
          <p style={{
            fontSize: 'clamp(13px, 1.5vw, 14px)', color: C.gray, maxWidth: 620, margin: '6px auto 0', lineHeight: 1.5,
          }}>
            Conoce los hitos que transformaron una modesta refaccionaria familiar en la red automotriz de mayor confianza en México.
          </p>

          {/* Milestone Buttons / Year Pills Bar */}
          <div style={{
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            gap: 'clamp(4px, 1vw, 8px)', flexWrap: 'wrap',
            marginTop: 14,
          }}>
            {timeline.map((t, idx) => {
              const isActive = idx === activeIndex;
              return (
                <button
                  key={t.year}
                  type="button"
                  onClick={() => scrollToMilestone(idx)}
                  style={{
                    padding: '5px 13px',
                    borderRadius: 9999,
                    border: `1.5px solid ${isActive ? C.red : C.border}`,
                    background: isActive ? C.red : C.white,
                    color: isActive ? C.white : C.navy,
                    fontFamily: F.heading,
                    fontWeight: isActive ? 800 : 600,
                    fontSize: 12,
                    cursor: 'pointer',
                    transition: 'all 0.25s ease',
                    boxShadow: isActive ? '0 4px 14px rgba(196,30,36,0.28)' : '0 2px 4px rgba(0,0,0,0.02)',
                    transform: isActive ? 'scale(1.05)' : 'scale(1)',
                  }}
                >
                  {t.year}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Sliding Track Area (Middle - Scroll Driven) */}
        <div style={{
          position: 'relative',
          width: '100%',
          overflow: 'hidden',
          flex: '1 1 auto',
          display: 'flex',
          alignItems: 'center',
          minHeight: 0,
          zIndex: 2,
        }}>
          {/* Lateral moving track */}
          <div style={{
            display: 'flex',
            gap: cardGap,
            transform: `translateX(calc(50vw - ${cardWidth / 2}px + ${trackTranslate}px))`,
            transition: 'transform 0.12s ease-out',
            willChange: 'transform',
            padding: '10px 0',
          }}>
            {timeline.map((item, i) => {
              const isActive = i === activeIndex;
              return (
                <div
                  key={item.year}
                  onClick={() => scrollToMilestone(i)}
                  style={{
                    flex: `0 0 ${cardWidth}px`,
                    width: cardWidth,
                    background: C.white,
                    borderRadius: 22,
                    overflow: 'hidden',
                    border: `1px solid ${isActive ? 'rgba(196,30,36,0.4)' : C.border}`,
                    boxShadow: isActive
                      ? '0 20px 50px rgba(196,30,36,0.13), 0 8px 24px rgba(0,0,0,0.06)'
                      : '0 4px 14px rgba(0,0,0,0.03)',
                    transform: isActive ? 'scale(1.02)' : 'scale(0.92)',
                    opacity: isActive ? 1 : 0.42,
                    filter: isActive ? 'none' : 'grayscale(0.6)',
                    transition: 'transform 0.4s cubic-bezier(0.16,1,0.3,1), opacity 0.4s ease, filter 0.4s ease, border-color 0.4s ease',
                    cursor: 'pointer',
                    userSelect: 'none',
                  }}
                >
                  {/* Card Image */}
                  <div style={{ height: windowWidth < 640 ? 150 : 190, overflow: 'hidden', position: 'relative' }}>
                    <img
                      src={item.image}
                      alt={item.title}
                      loading="lazy"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transform: isActive ? 'scale(1.04)' : 'scale(1)',
                        transition: 'transform 0.6s ease',
                      }}
                    />
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(180deg, transparent 35%, rgba(26,31,54,0.85) 100%)',
                    }} />
                    <div style={{
                      position: 'absolute',
                      bottom: 12,
                      left: 16,
                      right: 16,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}>
                      <span style={{
                        fontFamily: F.heading,
                        fontWeight: 900,
                        fontSize: 24,
                        color: C.white,
                        letterSpacing: '0.04em',
                        textShadow: '0 2px 6px rgba(0,0,0,0.4)',
                      }}>
                        {item.year}
                      </span>
                      <div style={{
                        width: 34,
                        height: 34,
                        borderRadius: 10,
                        background: 'rgba(255,255,255,0.25)',
                        backdropFilter: 'blur(8px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <Icon name={item.icon} size={17} color={C.white} />
                      </div>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div style={{ padding: windowWidth < 640 ? '16px 18px 20px' : '20px 22px 24px' }}>
                    <h3 style={{
                      fontFamily: F.heading,
                      fontWeight: 800,
                      fontSize: windowWidth < 640 ? 17 : 19,
                      color: C.navy,
                      marginBottom: 8,
                    }}>
                      {item.title}
                    </h3>
                    <p style={{
                      fontSize: windowWidth < 640 ? 13 : 14,
                      color: C.charcoal,
                      lineHeight: 1.6,
                      margin: 0,
                    }}>
                      {item.text}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Nav Floating Arrows (Left / Right) */}
          {activeIndex > 0 && (
            <button
              type="button"
              onClick={goToPrev}
              aria-label="Hito anterior"
              style={{
                position: 'absolute',
                left: 16,
                top: '50%',
                transform: 'translateY(-50%)',
                width: 42,
                height: 42,
                borderRadius: '50%',
                background: C.white,
                border: `1px solid ${C.border}`,
                color: C.navy,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                zIndex: 10,
                transition: 'all 0.25s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = C.red; e.currentTarget.style.color = C.white; }}
              onMouseLeave={e => { e.currentTarget.style.background = C.white; e.currentTarget.style.color = C.navy; }}
            >
              <ChevronLeft size={22} />
            </button>
          )}

          {activeIndex < timeline.length - 1 && (
            <button
              type="button"
              onClick={goToNext}
              aria-label="Siguiente hito"
              style={{
                position: 'absolute',
                right: 16,
                top: '50%',
                transform: 'translateY(-50%)',
                width: 42,
                height: 42,
                borderRadius: '50%',
                background: C.white,
                border: `1px solid ${C.border}`,
                color: C.navy,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                zIndex: 10,
                transition: 'all 0.25s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = C.red; e.currentTarget.style.color = C.white; }}
              onMouseLeave={e => { e.currentTarget.style.background = C.white; e.currentTarget.style.color = C.navy; }}
            >
              <ChevronRight size={22} />
            </button>
          )}
        </div>

        {/* 3. Bottom Progress Bar & Scroll Indicator */}
        <div style={{
          textAlign: 'center',
          padding: '0 1.5rem',
          flexShrink: 0,
          position: 'relative',
          zIndex: 2,
        }}>
          {/* Visual Progress Bar */}
          <div style={{
            maxWidth: 640,
            width: '100%',
            height: 4,
            borderRadius: 2,
            background: 'rgba(0,0,0,0.06)',
            margin: '0 auto 10px',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              width: `${Math.max(4, progress * 100)}%`,
              background: `linear-gradient(90deg, ${C.red}, ${C.redLight})`,
              borderRadius: 2,
              transition: 'width 0.15s ease-out',
            }} />
          </div>

          {/* Indicator text */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 12,
            color: C.gray,
            fontFamily: F.heading,
            fontWeight: 600,
          }}>
            <div style={{
              width: 14,
              height: 22,
              borderRadius: 7,
              border: `1.5px solid ${C.gray}70`,
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'center',
              padding: '2px 0',
            }}>
              <div style={{
                width: 2.5,
                height: 5,
                borderRadius: 2,
                background: C.red,
                animation: 'scrollIndicator 1.5s ease-in-out infinite',
              }} />
            </div>
            <span>Haz scroll hacia abajo para viajar por la historia ({activeIndex + 1} de {timeline.length})</span>
          </div>
        </div>
      </div>
    </section>
  );
}
