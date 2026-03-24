import { useState, useEffect, useCallback } from 'react';
import { servicesContent } from '../data/content';
import { C, F } from '../hooks/useAnimations';
import Icon from './Icon';
import { Star, Clock, ShieldCheck, Check, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

const serviceDetails = {
  'Llantas': { time: '45 min', price: 'Desde $899', includes: ['Instalación profesional', 'Balanceo dinámico', 'Válvulas nuevas', 'Revisión de presión'], warranty: '1 año', rating: 4.8 },
  'Alineación y Balanceo': { time: '30 min', price: 'Desde $599', includes: ['Alineación computarizada 3D', 'Balanceo 4 ruedas', 'Check-up de suspensión', 'Reporte digital'], warranty: '6 meses', rating: 4.7 },
  'Frenos': { time: '1-2 hrs', price: 'Desde $1,200', includes: ['Diagnóstico completo', 'Cambio de balatas/pastillas', 'Rectificado de discos', 'Prueba de frenado'], warranty: '1 año', rating: 4.9 },
  'Suspensión': { time: '2-3 hrs', price: 'Desde $1,500', includes: ['Inspección completa', 'Cambio de amortiguadores', 'Reemplazo de bujes', 'Alineación posterior'], warranty: '1 año', rating: 4.6 },
  'Cambio de Aceite': { time: '20 min', price: 'Desde $499', includes: ['Aceite sintético premium', 'Filtro nuevo', 'Revisión 21 puntos', 'Lubricación integral'], warranty: '6 meses o 10,000km', rating: 4.8 },
  'Acumuladores': { time: '15 min', price: 'Desde $1,800', includes: ['Diagnóstico eléctrico', 'Batería con garantía', 'Revisión de alternador', 'Limpieza de terminales'], warranty: '2 años', rating: 4.5 },
};

export default function Services() {
  const [active, setActive] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const services = servicesContent.services;
  const s = services[active];
  const detail = serviceDetails[s.title];

  const goTo = useCallback((idx) => {
    if (idx === active || transitioning) return;
    setTransitioning(true);
    setTimeout(() => {
      setActive(idx);
      setTimeout(() => setTransitioning(false), 50);
    }, 300);
  }, [active, transitioning]);

  const next = () => goTo((active + 1) % services.length);
  const prev = () => goTo((active - 1 + services.length) % services.length);

  // Auto-advance
  useEffect(() => {
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [active, transitioning]);

  return (
    <section id="services" style={{
      position: 'relative', minHeight: '100vh',
      overflow: 'hidden', background: C.navy,
    }}>
      {/* Background images with crossfade */}
      {services.map((srv, i) => (
        <div key={i} style={{
          position: 'absolute', inset: 0,
          opacity: i === active && !transitioning ? 1 : 0,
          transition: 'opacity 1s ease-in-out',
          zIndex: 0,
        }}>
          <img src={srv.image} alt="" style={{
            width: '100%', height: '100%', objectFit: 'cover',
            transform: i === active ? 'scale(1.02)' : 'scale(1.1)',
            transition: 'transform 12s ease-out',
            filter: 'blur(1px)',
          }} />
        </div>
      ))}

      {/* Overlay gradient */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1,
        background: `linear-gradient(
          135deg,
          rgba(26,31,54,0.95) 0%,
          rgba(26,31,54,0.82) 40%,
          rgba(26,31,54,0.88) 100%
        )`,
      }} />

      {/* Decorative elements */}
      <div style={{
        position: 'absolute', top: -200, right: -200, width: 500, height: 500,
        borderRadius: '50%', border: '1px solid rgba(196,30,36,0.06)',
        zIndex: 1,
      }} />
      <div style={{
        position: 'absolute', bottom: -150, left: -150, width: 400, height: 400,
        borderRadius: '50%', border: '1px solid rgba(255,255,255,0.03)',
        zIndex: 1,
      }} />

      {/* Content */}
      <div style={{
        position: 'relative', zIndex: 2,
        maxWidth: 1300, margin: '0 auto', padding: '6rem 3rem',
        minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center',
      }}>
        {/* Tag */}
        <div style={{ marginBottom: 40 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 20px', borderRadius: 9999,
            background: 'rgba(196,30,36,0.12)', color: C.redLight,
            fontFamily: F.heading, fontWeight: 600, fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.red, animation: 'pulseGlow 2s infinite' }} />
            {servicesContent.tag}
          </span>
        </div>

        {/* Main spotlight layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 80, alignItems: 'start' }}>
          {/* Left: Service info */}
          <div key={active} style={{
            animation: transitioning ? 'none' : 'spotlightIn 0.65s cubic-bezier(0.16,1,0.3,1)',
          }}>
            {/* Service number + icon */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 28 }}>
              <div style={{
                width: 72, height: 72, borderRadius: 20,
                background: `linear-gradient(135deg, ${C.red}, ${C.redLight})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 12px 40px rgba(196,30,36,0.3)',
              }}>
                <Icon name={s.icon} size={32} color={C.white} strokeWidth={1.8} />
              </div>
              <div style={{
                fontFamily: F.heading, fontWeight: 200, fontSize: 72,
                color: 'rgba(255,255,255,0.06)', lineHeight: 1, letterSpacing: '-0.02em',
              }}>0{active + 1}</div>
            </div>

            {/* Title */}
            <h2 style={{
              fontFamily: F.heading, fontWeight: 800,
              fontSize: 'clamp(2.4rem, 5vw, 3.8rem)',
              color: C.white, lineHeight: 1.08, marginBottom: 20,
              letterSpacing: '-0.02em',
            }}>{s.title}</h2>

            {/* Description */}
            <p style={{
              fontSize: 18, color: 'rgba(255,255,255,0.6)', lineHeight: 1.85,
              maxWidth: 520, marginBottom: 40,
            }}>{s.description}</p>

            {/* Stats cards */}
            <div style={{ display: 'flex', gap: 16, marginBottom: 48 }}>
              {[
                { label: 'Precio', value: detail.price, color: C.redLight, icon: null },
                { label: 'Tiempo', value: detail.time, color: C.white, icon: <Clock size={14} color="rgba(255,255,255,0.4)" /> },
                { label: 'Rating', value: detail.rating, color: C.amber, icon: <Star size={14} color={C.amber} fill={C.amber} /> },
              ].map((stat, j) => (
                <div key={j} style={{
                  padding: '18px 24px', borderRadius: 18,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  backdropFilter: 'blur(16px)',
                  flex: 1, transition: 'all 0.3s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; }}
                >
                  <div style={{
                    fontSize: 11, color: 'rgba(255,255,255,0.35)', fontWeight: 600,
                    textTransform: 'uppercase', letterSpacing: '0.08em',
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                    {stat.icon}
                    {stat.label}
                  </div>
                  <div style={{
                    fontFamily: F.heading, fontWeight: 800, fontSize: 22,
                    color: stat.color, marginTop: 6,
                  }}>{stat.value}</div>
                </div>
              ))}
            </div>

            {/* CTA button */}
            <button className="glow-btn" style={{
              padding: '18px 40px', borderRadius: 16, border: 'none',
              background: `linear-gradient(135deg, ${C.red}, ${C.redLight})`,
              color: C.white, fontFamily: F.heading, fontWeight: 700, fontSize: 16,
              cursor: 'pointer', boxShadow: '0 8px 32px rgba(196,30,36,0.35)',
              transition: 'all 0.3s', display: 'inline-flex', alignItems: 'center', gap: 10,
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 16px 48px rgba(196,30,36,0.45)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(196,30,36,0.35)'; }}
            >
              Cotizar Ahora
              <ArrowRight size={18} />
            </button>
          </div>

          {/* Right: Includes card */}
          <div key={`detail-${active}`} style={{
            animation: transitioning ? 'none' : 'spotlightIn 0.65s cubic-bezier(0.16,1,0.3,1) 0.12s both',
          }}>
            <div style={{
              background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(24px)',
              borderRadius: 28, border: '1px solid rgba(255,255,255,0.07)',
              padding: '36px 32px', boxShadow: '0 24px 64px rgba(0,0,0,0.2)',
            }}>
              <h4 style={{
                fontFamily: F.heading, fontWeight: 700, fontSize: 14,
                color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em', textTransform: 'uppercase',
                marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <div style={{
                  width: 4, height: 16, borderRadius: 2,
                  background: `linear-gradient(180deg, ${C.red}, ${C.redLight})`,
                }} />
                ¿Qué incluye?
              </h4>

              {detail.includes.map((item, j) => (
                <div key={j} style={{
                  display: 'flex', alignItems: 'center', gap: 16, padding: '16px 0',
                  borderBottom: j < detail.includes.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 12,
                    background: `linear-gradient(135deg, rgba(196,30,36,0.15), rgba(196,30,36,0.05))`,
                    border: '1px solid rgba(196,30,36,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <Check size={16} color={C.redLight} strokeWidth={2.5} />
                  </div>
                  <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15, lineHeight: 1.5, fontWeight: 400 }}>{item}</span>
                </div>
              ))}

              {/* Warranty */}
              <div style={{
                marginTop: 28, padding: '18px 20px', borderRadius: 18,
                background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.12)',
                display: 'flex', alignItems: 'center', gap: 14,
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 12,
                  background: 'rgba(34,197,94,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <ShieldCheck size={20} color="#22c55e" />
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Garantía</div>
                  <div style={{ fontSize: 16, color: '#22c55e', fontWeight: 700, fontFamily: F.heading, marginTop: 2 }}>{detail.warranty}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Service tabs */}
        <div style={{
          display: 'flex', gap: 6, marginTop: 64, justifyContent: 'center', flexWrap: 'wrap',
        }}>
          {services.map((srv, i) => (
            <button key={i} onClick={() => goTo(i)} style={{
              padding: '14px 22px', borderRadius: 14,
              border: `1px solid ${active === i ? `${C.red}60` : 'rgba(255,255,255,0.08)'}`,
              background: active === i ? `${C.red}18` : 'rgba(255,255,255,0.02)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
              transition: 'all 0.4s cubic-bezier(0.16,1,0.3,1)',
              transform: active === i ? 'scale(1.04)' : 'scale(1)',
              backdropFilter: 'blur(8px)',
            }}
              onMouseEnter={e => { if (active !== i) { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; } }}
              onMouseLeave={e => { if (active !== i) { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; } }}
            >
              <Icon name={srv.icon} size={18} color={active === i ? C.redLight : 'rgba(255,255,255,0.4)'} />
              <span style={{
                fontFamily: F.heading, fontWeight: 600, fontSize: 13,
                color: active === i ? C.white : 'rgba(255,255,255,0.45)',
                transition: 'color 0.3s',
              }}>{srv.title}</span>
            </button>
          ))}
        </div>

        {/* Progress bar */}
        <div style={{ maxWidth: 300, margin: '20px auto 0', height: 3, borderRadius: 3, background: 'rgba(255,255,255,0.06)' }}>
          <div style={{
            height: '100%', borderRadius: 3,
            background: `linear-gradient(90deg, ${C.red}, ${C.redLight})`,
            width: `${((active + 1) / services.length) * 100}%`,
            transition: 'width 0.5s cubic-bezier(0.16,1,0.3,1)',
          }} />
        </div>

        {/* Nav arrows */}
        <button onClick={prev} aria-label="Anterior" style={{
          position: 'absolute', left: 'clamp(8px, 2vw, 32px)', top: '50%', transform: 'translateY(-50%)',
          width: 52, height: 52, borderRadius: 16,
          background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'rgba(255,255,255,0.5)', transition: 'all 0.3s',
        }}
          onMouseEnter={e => { e.currentTarget.style.background = C.red; e.currentTarget.style.color = C.white; e.currentTarget.style.borderColor = C.red; e.currentTarget.style.transform = 'translateY(-50%) scale(1.08)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'translateY(-50%) scale(1)'; }}
        ><ChevronLeft size={22} /></button>
        <button onClick={next} aria-label="Siguiente" style={{
          position: 'absolute', right: 'clamp(8px, 2vw, 32px)', top: '50%', transform: 'translateY(-50%)',
          width: 52, height: 52, borderRadius: 16,
          background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'rgba(255,255,255,0.5)', transition: 'all 0.3s',
        }}
          onMouseEnter={e => { e.currentTarget.style.background = C.red; e.currentTarget.style.color = C.white; e.currentTarget.style.borderColor = C.red; e.currentTarget.style.transform = 'translateY(-50%) scale(1.08)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'translateY(-50%) scale(1)'; }}
        ><ChevronRight size={22} /></button>
      </div>
    </section>
  );
}
