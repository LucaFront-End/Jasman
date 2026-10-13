import { useState, useEffect, useCallback } from 'react';
import { servicesContent } from '../data/content';
import { C, F } from '../hooks/useAnimations';
import Icon from './Icon';
import { Star, Clock, ShieldCheck, Check, ChevronLeft, ChevronRight, ChevronDown, ArrowRight } from 'lucide-react';

const serviceDetails = {
  'Llantas': { time: '45 min', price: 'Desde $899', includes: ['Instalación profesional', 'Balanceo dinámico', 'Válvulas nuevas', 'Revisión de presión'], warranty: '1 año', rating: 4.8 },
  'Alineación y Balanceo': { time: '30 min', price: 'Desde $599', includes: ['Alineación computarizada 3D', 'Balanceo 4 ruedas', 'Check-up de suspensión', 'Reporte digital'], warranty: '6 meses', rating: 4.7 },
  'Frenos': { time: '1-2 hrs', price: 'Desde $1,200', includes: ['Diagnóstico completo', 'Cambio de balatas/pastillas', 'Rectificado de discos', 'Prueba de frenado'], warranty: '1 año', rating: 4.9 },
  'Suspensión': { time: '2-3 hrs', price: 'Desde $1,500', includes: ['Inspección completa', 'Cambio de amortiguadores', 'Reemplazo de bujes', 'Alineación posterior'], warranty: '1 año', rating: 4.6 },
  'Cambio de Aceite': { time: '20 min', price: 'Desde $499', includes: ['Aceite sintético premium', 'Filtro nuevo', 'Revisión 21 puntos', 'Lubricación integral'], warranty: '6 meses o 10k km', rating: 4.8 },
  'Acumuladores': { time: '15 min', price: 'Desde $1,800', includes: ['Diagnóstico eléctrico', 'Batería con garantía', 'Revisión de alternador', 'Limpieza de terminales'], warranty: '2 años', rating: 4.5 },
};

export default function Services() {
  const [active, setActive] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 900 : false);
  const services = servicesContent.services;
  const s = services[active];
  const detail = serviceDetails[s.title];

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const goTo = useCallback((idx) => {
    if (idx === active || transitioning) return;
    setTransitioning(true);
    setTimeout(() => {
      setActive(idx);
      setTimeout(() => setTransitioning(false), 50);
    }, 280);
  }, [active, transitioning]);

  const next = () => goTo((active + 1) % services.length);
  const prev = () => goTo((active - 1 + services.length) % services.length);

  // Auto-advance every 7 seconds
  useEffect(() => {
    const timer = setInterval(next, 7000);
    return () => clearInterval(timer);
  }, [active, transitioning]);

  return (
    <section id="services" style={{
      position: 'relative',
      minHeight: isMobile ? 'auto' : '100vh',
      overflow: 'hidden',
      background: C.navy,
      padding: isMobile ? '4.5rem 1rem 3.5rem' : '6rem 2rem',
    }}>
      {/* Background images with crossfade */}
      {services.map((srv, i) => (
        <div key={i} style={{
          position: 'absolute', inset: 0,
          opacity: i === active && !transitioning ? 0.35 : 0,
          transition: 'opacity 1s ease-in-out',
          zIndex: 0,
        }}>
          <img src={srv.image} alt="" style={{
            width: '100%', height: '100%', objectFit: 'cover',
            transform: i === active ? 'scale(1.02)' : 'scale(1.08)',
            transition: 'transform 10s ease-out',
            filter: 'blur(2px)',
          }} />
        </div>
      ))}

      {/* Overlay gradient */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1,
        background: `linear-gradient(
          135deg,
          rgba(26,31,54,0.96) 0%,
          rgba(26,31,54,0.88) 50%,
          rgba(26,31,54,0.94) 100%
        )`,
      }} />

      {/* Content wrapper */}
      <div style={{
        position: 'relative', zIndex: 2,
        maxWidth: 1200, margin: '0 auto', width: '100%',
      }}>
        {/* Top Tag & Header */}
        <div style={{ marginBottom: isMobile ? 24 : 36, textAlign: isMobile ? 'center' : 'left' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 18px', borderRadius: 9999,
            background: 'rgba(196,30,36,0.14)', color: C.redLight,
            fontFamily: F.heading, fontWeight: 600, fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.red, animation: 'pulseGlow 2s infinite' }} />
            {servicesContent.tag}
          </span>
        </div>

        {/* Top Mobile Service Selector - Eliminates awkward cut-off tabs */}
        {isMobile && (
          <div style={{ marginBottom: 20 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 8,
            }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Explora nuestros servicios ({active + 1}/{services.length})
              </span>
              {/* Quick Prev / Next Arrows */}
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  type="button"
                  onClick={prev}
                  aria-label="Servicio anterior"
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 10,
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.14)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  type="button"
                  onClick={next}
                  aria-label="Siguiente servicio"
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 10,
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.14)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* Native styled dropdown picker */}
            <div style={{ position: 'relative' }}>
              <select
                value={active}
                onChange={e => goTo(Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '13px 44px 13px 16px',
                  borderRadius: 14,
                  background: 'rgba(26,31,54,0.95)',
                  border: '1.5px solid rgba(196,30,36,0.6)',
                  color: '#fff',
                  fontFamily: F.heading,
                  fontWeight: 700,
                  fontSize: 14.5,
                  appearance: 'none',
                  WebkitAppearance: 'none',
                  outline: 'none',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
                  cursor: 'pointer',
                }}
              >
                {services.map((srv, i) => (
                  <option key={i} value={i} style={{ background: C.navy, color: '#fff', padding: '10px' }}>
                    0{i + 1}. {srv.title}
                  </option>
                ))}
              </select>
              <ChevronDown size={18} color={C.redLight} style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            </div>
          </div>
        )}

        {/* Main responsive grid: 2 columns on desktop, 1 column on mobile */}
        <div className="services-grid">
          {/* Left: Service info */}
          <div key={active} style={{
            animation: transitioning ? 'none' : 'spotlightIn 0.5s cubic-bezier(0.16,1,0.3,1)',
          }}>
            {/* Service icon + number badge */}
            <div style={{
              display: 'flex', alignItems: 'center',
              justifyContent: isMobile ? 'center' : 'flex-start',
              gap: 16, marginBottom: isMobile ? 16 : 24,
            }}>
              <div style={{
                width: isMobile ? 54 : 68,
                height: isMobile ? 54 : 68,
                borderRadius: 18,
                background: `linear-gradient(135deg, ${C.red}, ${C.redLight})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 10px 30px rgba(196,30,36,0.35)',
              }}>
                <Icon name={s.icon} size={isMobile ? 26 : 32} color={C.white} strokeWidth={1.8} />
              </div>
              <div style={{
                fontFamily: F.heading, fontWeight: 800,
                fontSize: isMobile ? 36 : 56,
                color: 'rgba(255,255,255,0.12)', lineHeight: 1,
              }}>0{active + 1}</div>
            </div>

            {/* Title */}
            <h2 style={{
              fontFamily: F.heading, fontWeight: 800,
              fontSize: 'clamp(1.8rem, 4.5vw, 3.4rem)',
              color: C.white, lineHeight: 1.12,
              marginBottom: 14,
              textAlign: isMobile ? 'center' : 'left',
              letterSpacing: '-0.02em',
            }}>{s.title}</h2>

            {/* Description */}
            <p style={{
              fontSize: 'clamp(14px, 1.6vw, 17px)',
              color: 'rgba(255,255,255,0.7)',
              lineHeight: 1.7,
              maxWidth: 520,
              margin: isMobile ? '0 auto 24px' : '0 0 32px',
              textAlign: isMobile ? 'center' : 'left',
            }}>{s.description}</p>

            {/* 3 Stats cards: Responsive 3-columns */}
            <div className="services-stats-row">
              {[
                { label: 'Precio', value: detail.price, color: C.redLight, icon: null },
                { label: 'Tiempo', value: detail.time, color: C.white, icon: <Clock size={13} color="rgba(255,255,255,0.5)" /> },
                { label: 'Rating', value: `${detail.rating} ★`, color: C.amber, icon: <Star size={13} color={C.amber} fill={C.amber} /> },
              ].map((stat, j) => (
                <div key={j} style={{
                  padding: isMobile ? '12px 10px' : '16px 20px',
                  borderRadius: 16,
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  backdropFilter: 'blur(16px)',
                  textAlign: 'center',
                  boxSizing: 'border-box',
                }}>
                  <div style={{
                    fontSize: 10.5, color: 'rgba(255,255,255,0.5)', fontWeight: 700,
                    textTransform: 'uppercase', letterSpacing: '0.06em',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                  }}>
                    {stat.icon}
                    {stat.label}
                  </div>
                  <div style={{
                    fontFamily: F.heading, fontWeight: 900,
                    fontSize: isMobile ? 15 : 20,
                    color: stat.color, marginTop: 4,
                    whiteSpace: 'nowrap',
                  }}>{stat.value}</div>
                </div>
              ))}
            </div>

            {/* CTA button */}
            <div style={{ textAlign: isMobile ? 'center' : 'left', marginBottom: isMobile ? 28 : 0 }}>
              {s.title === 'Llantas' ? (
                <a
                  href="https://llantas.jasman.com.mx/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glow-btn"
                  style={{
                    width: isMobile ? '100%' : 'auto',
                    padding: '16px 36px', borderRadius: 16, border: 'none',
                    background: `linear-gradient(135deg, ${C.red}, ${C.redLight})`,
                    color: C.white, fontFamily: F.heading, fontWeight: 800, fontSize: 15,
                    cursor: 'pointer', boxShadow: '0 8px 30px rgba(196,30,36,0.4)',
                    transition: 'all 0.3s', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                    textDecoration: 'none', boxSizing: 'border-box',
                  }}
                >
                  Comprar Llantas en Línea
                  <ArrowRight size={17} />
                </a>
              ) : (
                <a
                  href={`https://api.whatsapp.com/send/?phone=5215579337994&text=${encodeURIComponent(`SW- Hola, quisiera cotizar el servicio de ${s.title}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glow-btn"
                  style={{
                    width: isMobile ? '100%' : 'auto',
                    padding: '16px 36px', borderRadius: 16, border: 'none',
                    background: `linear-gradient(135deg, ${C.red}, ${C.redLight})`,
                    color: C.white, fontFamily: F.heading, fontWeight: 800, fontSize: 15,
                    cursor: 'pointer', boxShadow: '0 8px 30px rgba(196,30,36,0.4)',
                    transition: 'all 0.3s', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                    textDecoration: 'none', boxSizing: 'border-box',
                  }}
                >
                  Cotizar Servicio por WhatsApp
                  <ArrowRight size={17} />
                </a>
              )}
            </div>
          </div>

          {/* Right: What's included card */}
          <div key={`detail-${active}`} style={{
            animation: transitioning ? 'none' : 'spotlightIn 0.5s cubic-bezier(0.16,1,0.3,1) 0.1s both',
          }}>
            <div style={{
              background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderRadius: 24, border: '1px solid rgba(255,255,255,0.08)',
              padding: isMobile ? '24px 20px' : '32px 30px',
              boxShadow: '0 20px 50px rgba(0,0,0,0.25)',
            }}>
              <h4 style={{
                fontFamily: F.heading, fontWeight: 800, fontSize: 13,
                color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em', textTransform: 'uppercase',
                marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <div style={{
                  width: 4, height: 14, borderRadius: 2,
                  background: `linear-gradient(180deg, ${C.red}, ${C.redLight})`,
                }} />
                ¿Qué incluye este servicio?
              </h4>

              {detail.includes.map((item, j) => (
                <div key={j} style={{
                  display: 'flex', alignItems: 'center', gap: 14, padding: isMobile ? '11px 0' : '14px 0',
                  borderBottom: j < detail.includes.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                }}>
                  <div style={{
                    width: 30, height: 30, borderRadius: 10,
                    background: `linear-gradient(135deg, rgba(196,30,36,0.2), rgba(196,30,36,0.05))`,
                    border: '1px solid rgba(196,30,36,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <Check size={14} color={C.redLight} strokeWidth={2.8} />
                  </div>
                  <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: isMobile ? 13.5 : 15, lineHeight: 1.45, fontWeight: 500 }}>{item}</span>
                </div>
              ))}

              {/* Warranty Guarantee box */}
              <div style={{
                marginTop: 20, padding: isMobile ? '14px 16px' : '16px 20px', borderRadius: 16,
                background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.16)',
                display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: 'rgba(34,197,94,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <ShieldCheck size={18} color="#22c55e" />
                </div>
                <div>
                  <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.4)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Garantía Jasman</div>
                  <div style={{ fontSize: 15, color: '#22c55e', fontWeight: 800, fontFamily: F.heading, marginTop: 1 }}>{detail.warranty}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Controls: Desktop pills vs Mobile indicators */}
        {isMobile ? (
          <div style={{
            marginTop: 24,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 14,
          }}>
            {/* Dots Indicator */}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {services.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`Ir al servicio ${i + 1}`}
                  style={{
                    width: active === i ? 26 : 8,
                    height: 8,
                    borderRadius: 4,
                    background: active === i ? C.redLight : 'rgba(255,255,255,0.2)',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                  }}
                />
              ))}
            </div>

            {/* Mobile Nav buttons */}
            <div style={{ display: 'flex', gap: 12, width: '100%', maxWidth: 340 }}>
              <button
                type="button"
                onClick={prev}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  borderRadius: 14,
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: C.white,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  fontSize: 13,
                  fontWeight: 700,
                  fontFamily: F.heading,
                  cursor: 'pointer',
                }}
              >
                <ChevronLeft size={16} /> Anterior
              </button>
              <button
                type="button"
                onClick={next}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  borderRadius: 14,
                  background: `linear-gradient(135deg, ${C.red}, ${C.redLight})`,
                  border: 'none',
                  color: C.white,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  fontSize: 13,
                  fontWeight: 700,
                  fontFamily: F.heading,
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(196,30,36,0.3)',
                }}
              >
                Siguiente <ChevronRight size={16} />
              </button>
            </div>
          </div>
        ) : (
          /* Desktop pills unchanged */
          <div style={{
            display: 'flex',
            gap: 8,
            marginTop: 48,
            justifyContent: 'center',
            padding: '6px 2px 14px',
          }}>
            {services.map((srv, i) => (
              <button key={i} onClick={() => goTo(i)} style={{
                padding: '12px 20px',
                borderRadius: 14,
                border: `1.5px solid ${active === i ? C.red : 'rgba(255,255,255,0.08)'}`,
                background: active === i ? `${C.red}25` : 'rgba(255,255,255,0.04)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                flexShrink: 0,
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(8px)',
              }}>
                <Icon name={srv.icon} size={16} color={active === i ? C.redLight : 'rgba(255,255,255,0.45)'} />
                <span style={{
                  fontFamily: F.heading, fontWeight: 700, fontSize: 13,
                  color: active === i ? C.white : 'rgba(255,255,255,0.5)',
                  whiteSpace: 'nowrap',
                }}>{srv.title}</span>
              </button>
            ))}
          </div>
        )}

        {/* Progress bar */}
        <div style={{ maxWidth: 260, margin: '14px auto 0', height: 3, borderRadius: 3, background: 'rgba(255,255,255,0.08)' }}>
          <div style={{
            height: '100%', borderRadius: 3,
            background: `linear-gradient(90deg, ${C.red}, ${C.redLight})`,
            width: `${((active + 1) / services.length) * 100}%`,
            transition: 'width 0.4s ease',
          }} />
        </div>

        {/* Desktop nav arrows */}
        {!isMobile && (
          <>
            <button onClick={prev} aria-label="Anterior" style={{
              position: 'absolute', left: -40, top: '50%', transform: 'translateY(-50%)',
              width: 48, height: 48, borderRadius: 14,
              background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'rgba(255,255,255,0.6)', transition: 'all 0.3s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = C.red; e.currentTarget.style.color = C.white; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
            ><ChevronLeft size={20} /></button>
            <button onClick={next} aria-label="Siguiente" style={{
              position: 'absolute', right: -40, top: '50%', transform: 'translateY(-50%)',
              width: 48, height: 48, borderRadius: 14,
              background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'rgba(255,255,255,0.6)', transition: 'all 0.3s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = C.red; e.currentTarget.style.color = C.white; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
            ><ChevronRight size={20} /></button>
          </>
        )}
      </div>
    </section>
  );
}
