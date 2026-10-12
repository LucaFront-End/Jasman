import { useRef, useState, useEffect, useCallback } from 'react';
import { C, F } from '../hooks/useAnimations';
import Icon from './Icon';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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

export default function Timeline() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const trackRef = useRef(null);

  const prev = useCallback(() => {
    setActiveIndex(curr => (curr > 0 ? curr - 1 : timeline.length - 1));
  }, []);

  const next = useCallback(() => {
    setActiveIndex(curr => (curr < timeline.length - 1 ? curr + 1 : 0));
  }, []);

  // Pointer drag events for horizontal swipe
  const handlePointerDown = (e) => {
    setIsDragging(true);
    setDragStartX(e.clientX || (e.touches && e.touches[0].clientX) || 0);
    setDragOffset(0);
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    const currentX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    setDragOffset(currentX - dragStartX);
  };

  const handlePointerUp = () => {
    if (!isDragging) return;
    if (dragOffset > 50) {
      prev();
    } else if (dragOffset < -50) {
      next();
    }
    setIsDragging(false);
    setDragOffset(0);
  };

  return (
    <section id="historia" style={{
      position: 'relative',
      padding: 'clamp(4rem, 7vw, 6rem) 1.5rem',
      background: '#FAFAFC',
      overflow: 'hidden',
    }}>
      {/* Decorative background watermark year */}
      <div style={{
        position: 'absolute',
        top: '12%',
        left: '50%',
        transform: 'translateX(-50%)',
        fontSize: 'clamp(6rem, 16vw, 13rem)',
        fontFamily: F.heading,
        fontWeight: 900,
        color: 'rgba(196,30,36,0.035)',
        letterSpacing: '-0.04em',
        pointerEvents: 'none',
        userSelect: 'none',
        zIndex: 0,
        lineHeight: 1,
      }}>
        {timeline[activeIndex].year}
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 18px', borderRadius: 9999,
            background: 'rgba(196,30,36,0.08)', color: C.red,
            fontFamily: F.heading, fontWeight: 600, fontSize: 13, letterSpacing: '0.05em', textTransform: 'uppercase',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.red }} />
            NUESTRA HISTORIA
          </span>
          <h2 style={{
            fontFamily: F.heading, fontWeight: 800, fontSize: 'clamp(1.8rem, 4vw, 2.7rem)', color: C.navy,
            marginTop: 14, lineHeight: 1.2,
          }}>
            Más de 60 años{' '}
            <span className="animated-gradient" style={{
              background: `linear-gradient(135deg, ${C.red}, ${C.redLight}, ${C.red})`,
              backgroundSize: '200% 200%', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>escribiendo historia</span>
          </h2>
          <p style={{
            fontSize: 15, color: C.gray, maxWidth: 620, margin: '12px auto 0', lineHeight: 1.6,
          }}>
            Conoce los hitos que transformaron una modesta refaccionaria familiar en la red automotriz de mayor confianza en México.
          </p>
        </div>

        {/* Milestone Buttons Bar */}
        <div style={{
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          gap: 'clamp(6px, 1.2vw, 12px)', flexWrap: 'wrap',
          marginBottom: 36,
        }}>
          {timeline.map((t, idx) => {
            const isActive = idx === activeIndex;
            return (
              <button
                key={t.year}
                type="button"
                onClick={() => setActiveIndex(idx)}
                style={{
                  padding: '7px 15px',
                  borderRadius: 9999,
                  border: `1.5px solid ${isActive ? C.red : C.border}`,
                  background: isActive ? C.red : C.white,
                  color: isActive ? C.white : C.navy,
                  fontFamily: F.heading,
                  fontWeight: isActive ? 800 : 600,
                  fontSize: 13,
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  boxShadow: isActive ? '0 4px 14px rgba(196,30,36,0.3)' : '0 2px 6px rgba(0,0,0,0.03)',
                  transform: isActive ? 'scale(1.05)' : 'scale(1)',
                }}
              >
                {t.year}
              </button>
            );
          })}
        </div>

        {/* Lateral Carousel Track Area */}
        <div
          ref={trackRef}
          style={{
            position: 'relative',
            overflow: 'hidden',
            padding: '16px 0 24px',
            cursor: isDragging ? 'grabbing' : 'grab',
            userSelect: 'none',
          }}
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={handlePointerUp}
          onMouseLeave={handlePointerUp}
          onTouchStart={handlePointerDown}
          onTouchMove={handlePointerMove}
          onTouchEnd={handlePointerUp}
        >
          {/* Card slider track */}
          <div style={{
            display: 'flex',
            gap: 24,
            transition: isDragging ? 'none' : 'transform 0.5s cubic-bezier(0.16,1,0.3,1)',
            transform: `translateX(calc(50% - 210px - ${activeIndex * 444}px + ${dragOffset}px))`,
          }}>
            {timeline.map((item, i) => {
              const isActive = i === activeIndex;
              return (
                <div
                  key={item.year}
                  onClick={() => setActiveIndex(i)}
                  style={{
                    flex: '0 0 420px',
                    maxWidth: '85vw',
                    background: C.white,
                    borderRadius: 24,
                    overflow: 'hidden',
                    border: `1px solid ${isActive ? 'rgba(196,30,36,0.35)' : C.border}`,
                    boxShadow: isActive
                      ? '0 20px 50px rgba(196,30,36,0.12), 0 6px 20px rgba(0,0,0,0.06)'
                      : '0 4px 16px rgba(0,0,0,0.04)',
                    transform: isActive ? 'scale(1.02)' : 'scale(0.93)',
                    opacity: isActive ? 1 : 0.55,
                    filter: isActive ? 'none' : 'grayscale(0.4)',
                    transition: 'all 0.4s cubic-bezier(0.16,1,0.3,1)',
                    cursor: 'pointer',
                  }}
                >
                  {/* Card Image */}
                  <div style={{ height: 210, overflow: 'hidden', position: 'relative' }}>
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
                      background: 'linear-gradient(180deg, transparent 40%, rgba(26,31,54,0.85) 100%)',
                    }} />
                    <div style={{
                      position: 'absolute',
                      bottom: 14,
                      left: 18,
                      right: 18,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}>
                      <span style={{
                        fontFamily: F.heading,
                        fontWeight: 900,
                        fontSize: 26,
                        color: C.white,
                        letterSpacing: '0.04em',
                        textShadow: '0 2px 6px rgba(0,0,0,0.4)',
                      }}>
                        {item.year}
                      </span>
                      <div style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        background: 'rgba(255,255,255,0.25)',
                        backdropFilter: 'blur(8px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <Icon name={item.icon} size={18} color={C.white} />
                      </div>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div style={{ padding: '22px 24px 26px' }}>
                    <h3 style={{
                      fontFamily: F.heading,
                      fontWeight: 800,
                      fontSize: 19,
                      color: C.navy,
                      marginBottom: 8,
                    }}>
                      {item.title}
                    </h3>
                    <p style={{
                      fontSize: 14,
                      color: C.charcoal,
                      lineHeight: 1.7,
                      margin: 0,
                    }}>
                      {item.text}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Left / Right Nav Arrows */}
          <button
            type="button"
            onClick={prev}
            aria-label="Hito anterior"
            style={{
              position: 'absolute',
              left: 8,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 44,
              height: 44,
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

          <button
            type="button"
            onClick={next}
            aria-label="Siguiente hito"
            style={{
              position: 'absolute',
              right: 8,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 44,
              height: 44,
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
        </div>

        {/* Carousel Dots & Hint */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, marginTop: 12 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            {timeline.map((_, dotIdx) => (
              <button
                key={dotIdx}
                type="button"
                aria-label={`Ver hito ${dotIdx + 1}`}
                onClick={() => setActiveIndex(dotIdx)}
                style={{
                  width: dotIdx === activeIndex ? 26 : 8,
                  height: 8,
                  borderRadius: 4,
                  background: dotIdx === activeIndex ? C.red : C.border,
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  transition: 'all 0.3s ease',
                }}
              />
            ))}
          </div>
          <span style={{ fontSize: 12, color: C.gray, fontFamily: F.heading }}>
            Desliza o usa las flechas para explorar cada época
          </span>
        </div>
      </div>
    </section>
  );
}
