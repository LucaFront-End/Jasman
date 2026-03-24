import { useRef, useState, useEffect } from 'react';
import { C, F } from '../hooks/useAnimations';
import Icon from './Icon';

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

const SECTION_HEIGHT_PER_ITEM = 80; // vh per timeline item

export default function Timeline() {
  const containerRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const totalScroll = el.offsetHeight - window.innerHeight;
      const scrolled = -rect.top;
      const p = Math.max(0, Math.min(1, scrolled / totalScroll));
      setProgress(p);
      const idx = Math.min(timeline.length - 1, Math.floor(p * timeline.length));
      setActiveIndex(idx);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const trackTranslate = progress * (timeline.length - 1) * -460;

  return (
    <section id="historia" ref={containerRef} style={{
      position: 'relative',
      height: `${timeline.length * SECTION_HEIGHT_PER_ITEM}vh`,
    }}>
      {/* Sticky viewport */}
      <div style={{
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        background: C.white,
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', padding: '0 1.5rem', marginBottom: 32, flexShrink: 0 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 18px', borderRadius: 9999,
            background: 'rgba(196,30,36,0.08)', color: C.red,
            fontFamily: F.heading, fontWeight: 600, fontSize: 13, letterSpacing: '0.05em', textTransform: 'uppercase',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.red }} />
            NUESTRA HISTORIA
          </span>
          <h3 style={{
            fontFamily: F.heading, fontWeight: 700, fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', color: C.navy,
            marginTop: 16, lineHeight: 1.2,
          }}>
            Más de 60 años{' '}
            <span className="animated-gradient" style={{
              background: `linear-gradient(135deg, ${C.red}, ${C.redLight}, ${C.red})`,
              backgroundSize: '200% 200%', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>escribiendo historia</span>
          </h3>
        </div>

        {/* Year indicator */}
        <div style={{
          textAlign: 'center', marginBottom: 20, flexShrink: 0,
        }}>
          <div key={activeIndex} style={{
            fontFamily: F.heading, fontWeight: 900,
            fontSize: 'clamp(3rem, 8vw, 5rem)',
            color: 'transparent',
            WebkitTextStroke: `2px ${C.red}20`,
            position: 'relative', display: 'inline-block',
          }}>
            {timeline[activeIndex].year}
            <span style={{
              position: 'absolute', inset: 0,
              color: C.red,
              clipPath: `inset(0 ${100 - ((progress * timeline.length - activeIndex) * 100)}% 0 0)`,
              WebkitTextStroke: '0px',
              transition: 'clip-path 0.15s ease-out',
            }}>{timeline[activeIndex].year}</span>
          </div>
        </div>

        {/* Horizontal progress line with dots */}
        <div style={{
          position: 'relative', maxWidth: 800, width: '90%', margin: '0 auto 32px', flexShrink: 0,
        }}>
          <div style={{ height: 3, borderRadius: 3, background: C.light }}>
            <div style={{
              height: '100%', borderRadius: 3,
              background: `linear-gradient(90deg, ${C.red}, ${C.redLight})`,
              width: `${Math.max(2, progress * 100)}%`,
              transition: 'width 0.15s ease-out',
            }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', marginTop: -9 }}>
            {timeline.map((t, i) => {
              const isActive = i === activeIndex;
              const isPast = i <= activeIndex;
              return (
                <div key={i} style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                }}>
                  <div style={{
                    width: isActive ? 18 : 12, height: isActive ? 18 : 12,
                    borderRadius: '50%',
                    background: isPast ? C.red : C.light,
                    border: `2px solid ${isPast ? C.red : C.border}`,
                    transition: 'all 0.4s cubic-bezier(0.16,1,0.3,1)',
                    boxShadow: isActive ? `0 0 0 4px ${C.red}25, 0 2px 8px rgba(196,30,36,0.3)` : 'none',
                  }} />
                  <span style={{
                    marginTop: 8, fontFamily: F.heading, fontWeight: isActive ? 700 : 500,
                    fontSize: isActive ? 13 : 11, color: isActive ? C.red : C.gray,
                    transition: 'all 0.3s',
                    opacity: isActive || i === 0 || i === timeline.length - 1 ? 1 : 0.5,
                  }}>{t.year}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sliding cards track */}
        <div style={{
          position: 'relative', overflow: 'hidden', flex: '1 1 auto',
          display: 'flex', alignItems: 'center',
          minHeight: 0,
        }}>
          <div style={{
            display: 'flex', gap: 32,
            transform: `translateX(calc(50vw - 230px + ${trackTranslate}px))`,
            transition: 'transform 0.4s cubic-bezier(0.16,1,0.3,1)',
            padding: '20px 0',
          }}>
            {timeline.map((t, i) => {
              const isActive = i === activeIndex;
              return (
                <div key={i} style={{
                  flex: '0 0 460px',
                  transform: isActive ? 'scale(1)' : 'scale(0.88)',
                  opacity: isActive ? 1 : 0.35,
                  filter: isActive ? 'none' : 'grayscale(0.6)',
                  transition: 'all 0.5s cubic-bezier(0.16,1,0.3,1)',
                  pointerEvents: isActive ? 'auto' : 'none',
                }}>
                  <div style={{
                    background: C.white, borderRadius: 24,
                    border: `1px solid ${isActive ? C.red + '30' : C.border}`,
                    overflow: 'hidden',
                    boxShadow: isActive
                      ? '0 20px 60px rgba(196,30,36,0.12), 0 8px 24px rgba(0,0,0,0.06)'
                      : '0 4px 12px rgba(0,0,0,0.04)',
                    transition: 'all 0.5s cubic-bezier(0.16,1,0.3,1)',
                  }}>
                    {/* Image */}
                    <div style={{ height: 220, overflow: 'hidden', position: 'relative' }}>
                      <img src={t.image} alt={t.title} loading="lazy" style={{
                        width: '100%', height: '100%', objectFit: 'cover',
                        transform: isActive ? 'scale(1.05)' : 'scale(1)',
                        transition: 'transform 0.7s cubic-bezier(0.16,1,0.3,1)',
                      }} />
                      <div style={{
                        position: 'absolute', inset: 0,
                        background: 'linear-gradient(180deg, transparent 30%, rgba(26,31,54,0.75) 100%)',
                      }} />
                      <div style={{
                        position: 'absolute', bottom: 14, left: 18, right: 18,
                        display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
                      }}>
                        <div>
                          <div style={{
                            fontFamily: F.heading, fontWeight: 900, fontSize: 28, color: C.white,
                            lineHeight: 1, textShadow: '0 2px 8px rgba(0,0,0,0.3)',
                          }}>{t.year}</div>
                        </div>
                        <div style={{
                          width: 40, height: 40, borderRadius: 12,
                          background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 20,
                        }}><Icon name={t.icon} size={18} color={C.white} /></div>
                      </div>
                    </div>

                    {/* Text */}
                    <div style={{ padding: '20px 22px 26px' }}>
                      <h4 style={{
                        fontFamily: F.heading, fontWeight: 700, fontSize: 18, color: C.navy,
                        marginBottom: 10,
                      }}>{t.title}</h4>
                      <p style={{
                        fontSize: 14, color: C.gray, lineHeight: 1.75,
                      }}>{t.text}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Scroll hint */}
        <div style={{
          textAlign: 'center', paddingBottom: 24, flexShrink: 0,
          fontFamily: F.heading, fontSize: 12, color: C.gray, opacity: 0.5,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          <div style={{
            width: 20, height: 32, borderRadius: 10, border: `2px solid ${C.gray}50`,
            display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: 4,
          }}>
            <div style={{
              width: 3, height: 8, borderRadius: 3, background: C.red,
              animation: 'scrollIndicator 1.5s ease-in-out infinite',
            }} />
          </div>
          Sigue haciendo scroll para explorar
        </div>
      </div>
    </section>
  );
}
