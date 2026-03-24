import { ctaContent } from '../data/content';
import { C, F, useReveal } from '../hooks/useAnimations';
import { ArrowRight, Phone, CalendarCheck, Clock, Shield, Star, Zap } from 'lucide-react';

const perks = [
  { icon: CalendarCheck, text: 'Agenda en 2 minutos' },
  { icon: Clock, text: 'Sin tiempos de espera' },
  { icon: Shield, text: 'Garantía por escrito' },
  { icon: Star, text: '4.5★ calificación' },
];

export default function CTA() {
  const content = useReveal();

  return (
    <section id="cta" style={{
      position: 'relative', overflow: 'hidden',
      background: '#FAFBFC',
    }}>
      <div ref={content.ref} style={{
        maxWidth: 1300, margin: '0 auto',
        padding: 'clamp(4rem, 8vw, 6rem) 1.5rem',
        ...content.style,
      }}>
        <div style={{
          borderRadius: 36, overflow: 'hidden', position: 'relative',
          background: `linear-gradient(135deg, ${C.red} 0%, ${C.redDark} 40%, ${C.navy} 100%)`,
          padding: 'clamp(48px, 6vw, 80px) clamp(32px, 5vw, 72px)',
          display: 'grid', gridTemplateColumns: '1fr auto',
          gap: 48, alignItems: 'center',
        }}>
          {/* Decorative elements */}
          <div style={{
            position: 'absolute', top: -80, right: -80, width: 350, height: 350,
            borderRadius: '50%', border: '1px solid rgba(255,255,255,0.06)',
            pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', bottom: -120, left: -120, width: 400, height: 400,
            borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.04), transparent 70%)',
            pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', top: '50%', right: '30%', width: 6, height: 6,
            borderRadius: '50%', background: 'rgba(245,166,35,0.3)',
            animation: 'float 4s ease-in-out infinite', pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', top: '20%', right: '15%', width: 4, height: 4,
            borderRadius: '50%', background: 'rgba(255,255,255,0.15)',
            animation: 'float 5s 1s ease-in-out infinite', pointerEvents: 'none',
          }} />

          {/* Left: Content */}
          <div style={{ position: 'relative', zIndex: 1 }}>
            {/* Flash badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '8px 18px', borderRadius: 12,
              background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.12)',
              backdropFilter: 'blur(8px)', marginBottom: 28,
            }}>
              <Zap size={14} color={C.amber} fill={C.amber} />
              <span style={{
                fontFamily: F.heading, fontWeight: 700, fontSize: 12, color: C.white,
                letterSpacing: '0.05em', textTransform: 'uppercase',
              }}>Agenda rápida disponible</span>
            </div>

            <h2 style={{
              fontFamily: F.heading, fontWeight: 900, fontSize: 'clamp(2rem, 4.5vw, 3.2rem)',
              color: C.white, lineHeight: 1.1, letterSpacing: '-0.02em',
              marginBottom: 16,
            }}>
              {ctaContent.title}<br />
              <span style={{ color: 'rgba(255,255,255,0.55)' }}>{ctaContent.titleHighlight}</span>
            </h2>

            <p style={{
              fontSize: 16, color: 'rgba(255,255,255,0.5)', lineHeight: 1.75,
              maxWidth: 500, marginBottom: 32,
            }}>{ctaContent.subtitle}</p>

            {/* CTAs */}
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 36 }}>
              <a href="#" className="glow-btn" style={{
                padding: '18px 36px', borderRadius: 16, color: C.red,
                fontFamily: F.heading, fontWeight: 800, fontSize: 16,
                background: C.white,
                boxShadow: '0 12px 40px rgba(0,0,0,0.2)',
                transition: 'all 0.3s', display: 'inline-flex', alignItems: 'center', gap: 10,
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.04) translateY(-3px)'; e.currentTarget.style.boxShadow = '0 20px 50px rgba(0,0,0,0.25)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.2)'; }}
              >
                {ctaContent.ctaPrimary}
                <ArrowRight size={18} />
              </a>
              <a href={`tel:${ctaContent.phone}`} style={{
                padding: '18px 36px', borderRadius: 16, color: C.white,
                fontFamily: F.heading, fontWeight: 600, fontSize: 16,
                background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
                backdropFilter: 'blur(8px)', transition: 'all 0.3s',
                display: 'inline-flex', alignItems: 'center', gap: 10,
              }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}
              >
                <Phone size={16} />
                {ctaContent.ctaSecondary}
              </a>
            </div>

            {/* Perks row */}
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
              {perks.map((p, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: 'rgba(255,255,255,0.08)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <p.icon size={14} color="rgba(255,255,255,0.6)" />
                  </div>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>{p.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Visual element */}
          <div style={{
            position: 'relative', zIndex: 1,
            width: 280, height: 320, flexShrink: 0,
          }}>
            {/* Stacked cards visual */}
            <div style={{
              position: 'absolute', bottom: 0, right: 0, width: 260, height: 160,
              borderRadius: 20, background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.08)',
              backdropFilter: 'blur(16px)',
              transform: 'rotate(-3deg)',
            }} />
            <div style={{
              position: 'absolute', bottom: 20, right: 10, width: 260, height: 160,
              borderRadius: 20, background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.1)',
              backdropFilter: 'blur(16px)',
              transform: 'rotate(2deg)',
            }} />
            <div style={{
              position: 'absolute', bottom: 40, right: 20, width: 260, height: 160,
              borderRadius: 20, background: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.15)',
              backdropFilter: 'blur(16px)', padding: 24,
              transform: 'rotate(-1deg)',
              boxShadow: '0 16px 50px rgba(0,0,0,0.2)',
            }}>
              <div style={{ fontFamily: F.heading, fontWeight: 700, fontSize: 14, color: C.white, marginBottom: 8 }}>
                Tu próxima cita
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 16 }}>
                Selecciona servicio, sucursal y horario
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {['Llantas', 'Frenos', 'Aceite'].map(s => (
                  <span key={s} style={{
                    padding: '5px 12px', borderRadius: 8,
                    background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)',
                    fontSize: 11, fontWeight: 600, color: C.white, fontFamily: F.heading,
                  }}>{s}</span>
                ))}
              </div>
            </div>
            {/* Large number */}
            <div style={{
              position: 'absolute', top: 0, right: 0,
              fontFamily: F.heading, fontWeight: 900, fontSize: 80,
              color: 'rgba(255,255,255,0.04)', lineHeight: 1, userSelect: 'none',
            }}>80+</div>
          </div>
        </div>
      </div>
    </section>
  );
}
