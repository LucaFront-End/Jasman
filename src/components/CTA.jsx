import { useState, useEffect } from 'react';
import { ctaContent } from '../data/content';
import { C, F, useReveal } from '../hooks/useAnimations';
import { ArrowRight, Phone, CalendarCheck, Clock, Shield, Star, Zap } from 'lucide-react';

const perks = [
  { icon: CalendarCheck, text: 'Agenda en 2 minutos' },
  { icon: Clock, text: 'Sin tiempos de espera' },
  { icon: Shield, text: 'Garantía por escrito' },
  { icon: Star, text: '4.8★ calificación' },
];

export default function CTA() {
  const content = useReveal();
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 900 : false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <section id="cta" style={{
      position: 'relative', overflow: 'hidden',
      background: '#FAFBFC',
    }}>
      <div ref={content.ref} style={{
        maxWidth: 1300, margin: '0 auto',
        padding: isMobile ? '3.5rem 1rem' : 'clamp(4rem, 8vw, 6rem) 1.5rem',
        ...content.style,
      }}>
        <div style={{
          borderRadius: isMobile ? 26 : 36,
          overflow: 'hidden',
          position: 'relative',
          background: `linear-gradient(135deg, ${C.red} 0%, ${C.redDark} 45%, ${C.navy} 100%)`,
          padding: isMobile ? '36px 20px' : 'clamp(48px, 6vw, 80px) clamp(32px, 5vw, 72px)',
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr auto',
          gap: isMobile ? 32 : 48,
          alignItems: 'center',
          boxShadow: '0 20px 60px rgba(196,30,36,0.18)',
        }}>
          {/* Decorative background circles */}
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

          {/* Left: Content */}
          <div style={{ position: 'relative', zIndex: 1, textAlign: isMobile ? 'center' : 'left' }}>
            {/* Flash badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '6px 16px', borderRadius: 12,
              background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.16)',
              backdropFilter: 'blur(8px)', marginBottom: 20,
            }}>
              <Zap size={14} color={C.amber} fill={C.amber} />
              <span style={{
                fontFamily: F.heading, fontWeight: 800, fontSize: 11.5, color: C.white,
                letterSpacing: '0.05em', textTransform: 'uppercase',
              }}>Agenda rápida disponible</span>
            </div>

            <h2 style={{
              fontFamily: F.heading, fontWeight: 900,
              fontSize: 'clamp(1.8rem, 4.5vw, 3.2rem)',
              color: C.white, lineHeight: 1.15, letterSpacing: '-0.02em',
              marginBottom: 14,
            }}>
              {ctaContent.title}<br />
              <span style={{ color: 'rgba(255,255,255,0.65)' }}>{ctaContent.titleHighlight}</span>
            </h2>

            <p style={{
              fontSize: 'clamp(14px, 1.6vw, 16px)', color: 'rgba(255,255,255,0.75)', lineHeight: 1.65,
              maxWidth: 500, margin: isMobile ? '0 auto 28px' : '0 0 32px',
            }}>{ctaContent.subtitle}</p>

            {/* CTAs Action Buttons */}
            <div style={{
              display: 'flex', gap: 12,
              flexDirection: isMobile ? 'column' : 'row',
              marginBottom: 28,
            }}>
              <a
                href={`https://api.whatsapp.com/send/?phone=5215579337994&text=${encodeURIComponent('SW- Hola Jasman, me gustaría agendar una cita para mi auto.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="glow-btn"
                style={{
                  width: isMobile ? '100%' : 'auto',
                  padding: '16px 32px', borderRadius: 16, color: C.red,
                  fontFamily: F.heading, fontWeight: 800, fontSize: 15,
                  background: C.white,
                  boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                  transition: 'all 0.3s', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  textDecoration: 'none', boxSizing: 'border-box',
                }}
              >
                {ctaContent.ctaPrimary}
                <ArrowRight size={17} />
              </a>
              <a
                href={`tel:${ctaContent.phone}`}
                style={{
                  width: isMobile ? '100%' : 'auto',
                  padding: '16px 32px', borderRadius: 16, color: C.white,
                  fontFamily: F.heading, fontWeight: 700, fontSize: 15,
                  background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(8px)', transition: 'all 0.3s',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  textDecoration: 'none', boxSizing: 'border-box',
                }}
              >
                <Phone size={16} />
                {ctaContent.ctaSecondary}
              </a>
            </div>

            {/* Perks row */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, auto)',
              gap: isMobile ? 12 : 24,
              justifyContent: isMobile ? 'center' : 'flex-start',
            }}>
              {perks.map((p, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  justifyContent: isMobile ? 'center' : 'flex-start',
                }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 8,
                    background: 'rgba(255,255,255,0.12)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <p.icon size={13} color="rgba(255,255,255,0.85)" />
                  </div>
                  <span style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>{p.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Desktop Visual element only */}
          {!isMobile && (
            <div style={{
              position: 'relative', zIndex: 1,
              width: 280, height: 280, flexShrink: 0,
            }}>
              <div style={{
                position: 'absolute', bottom: 10, right: 10, width: 250, height: 160,
                borderRadius: 20, background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                backdropFilter: 'blur(16px)',
                transform: 'rotate(-2deg)',
              }} />
              <div style={{
                position: 'absolute', bottom: 25, right: 20, width: 250, height: 160,
                borderRadius: 20, background: 'rgba(255,255,255,0.12)',
                border: '1px solid rgba(255,255,255,0.18)',
                backdropFilter: 'blur(16px)', padding: 22,
                transform: 'rotate(1deg)',
                boxShadow: '0 16px 50px rgba(0,0,0,0.2)',
              }}>
                <div style={{ fontFamily: F.heading, fontWeight: 800, fontSize: 14, color: C.white, marginBottom: 6 }}>
                  Tu próxima visita
                </div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', marginBottom: 14 }}>
                  Servicio garantizado en más de 80 sucursales
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {['Llantas', 'Frenos', 'Alineación'].map(s => (
                    <span key={s} style={{
                      padding: '4px 10px', borderRadius: 8,
                      background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)',
                      fontSize: 11, fontWeight: 700, color: C.white, fontFamily: F.heading,
                    }}>{s}</span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
