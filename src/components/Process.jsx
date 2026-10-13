import { useState, useEffect } from 'react';
import { C, F, useReveal, useStaggerReveal } from '../hooks/useAnimations';
import { CalendarCheck, ScanSearch, Wrench, Rocket, ArrowRight, Clock, Shield, Star } from 'lucide-react';

const steps = [
  {
    number: '01',
    title: 'Agenda tu Cita',
    description: 'Reserva en línea o por WhatsApp en menos de 2 minutos. Elige sucursal, servicio y horario.',
    icon: CalendarCheck,
    color: '#C41E24',
    detail: 'Sin filas ni esperas',
    time: '2 min',
  },
  {
    number: '02',
    title: 'Diagnóstico Profesional',
    description: 'Técnicos certificados realizan una inspección completa con equipos 3D y te entregan reporte.',
    icon: ScanSearch,
    color: '#E8363D',
    detail: 'Revisión 21 puntos',
    time: '15 min',
  },
  {
    number: '03',
    title: 'Servicio Especializado',
    description: 'Ejecutamos el trabajo con refacciones de calidad y herramientas de precisión certificadas.',
    icon: Wrench,
    color: '#C41E24',
    detail: 'Garantía por escrito',
    time: 'Mismo día',
  },
  {
    number: '04',
    title: 'Listo para Rodar',
    description: 'Verificación final de seguridad, prueba en pista y entrega con explicación detallada.',
    icon: Rocket,
    color: '#E8363D',
    detail: '100% Garantizado',
    time: 'Puntual',
  },
];

export default function Process() {
  const [activeStep, setActiveStep] = useState(null);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
  const header = useReveal();
  const cards = useStaggerReveal(steps.length);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <section id="proceso" style={{
      padding: isMobile ? '4.5rem 1rem 3.5rem' : 'clamp(4rem, 8vw, 7rem) 1.5rem',
      background: '#FAFBFC',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Decorative background elements */}
      <div style={{
        position: 'absolute', top: -200, right: -200, width: 500, height: 500,
        borderRadius: '50%', border: `1px solid ${C.red}08`,
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: -100, left: -100, width: 350, height: 350,
        borderRadius: '50%', background: `radial-gradient(circle, ${C.red}04 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div ref={header.ref} style={{ textAlign: 'center', maxWidth: 600, margin: isMobile ? '0 auto 36px' : '0 auto 64px', ...header.style }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 18px', borderRadius: 9999,
            background: 'rgba(196,30,36,0.06)', color: C.red,
            fontFamily: F.heading, fontWeight: 600, fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase',
            marginBottom: 16,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.red }} />
            NUESTRO PROCESO
          </span>
          <h2 style={{
            fontFamily: F.heading, fontWeight: 800,
            fontSize: 'clamp(1.8rem, 4.5vw, 3rem)', color: C.navy,
            lineHeight: 1.15, letterSpacing: '-0.02em',
          }}>
            De la cita al camino,{' '}
            <span className="animated-gradient" style={{
              background: `linear-gradient(135deg, ${C.red}, ${C.redLight}, ${C.red})`,
              backgroundSize: '200% 200%', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>en 4 simples pasos</span>
          </h2>
          <p style={{
            fontSize: 'clamp(14px, 1.6vw, 16px)', color: C.gray, lineHeight: 1.7, marginTop: 14,
          }}>Una experiencia diseñada para tu comodidad. Transparencia, profesionalismo y calidad en cada etapa.</p>
        </div>

        {/* Steps Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)',
          gap: isMobile ? 24 : 0,
          position: 'relative',
        }}>
          {/* Desktop Connecting horizontal line */}
          {!isMobile && (
            <div style={{
              position: 'absolute', top: 52, left: 'calc(12.5% + 20px)', right: 'calc(12.5% + 20px)',
              height: 2, zIndex: 0,
              background: `linear-gradient(90deg, ${C.red}20, ${C.red}40, ${C.red}20)`,
            }}>
              <div style={{
                position: 'absolute', inset: 0,
                background: `linear-gradient(90deg, transparent, ${C.red}, transparent)`,
                backgroundSize: '200% 100%',
                animation: 'lineFlow 3s linear infinite',
                opacity: 0.5,
              }} />
            </div>
          )}

          {steps.map((step, i) => {
            const IconComp = step.icon;
            const isActive = activeStep === i;
            return (
              <div
                key={i}
                ref={cards.setRef(i)}
                style={{ ...cards.getStyle(i), position: 'relative', zIndex: 1 }}
                onMouseEnter={() => setActiveStep(i)}
                onMouseLeave={() => setActiveStep(null)}
              >
                <div style={{
                  display: 'flex',
                  flexDirection: isMobile ? 'row' : 'column',
                  alignItems: isMobile ? 'flex-start' : 'center',
                  textAlign: isMobile ? 'left' : 'center',
                  padding: isMobile ? '16px' : '0 16px',
                  background: isMobile ? C.white : 'transparent',
                  borderRadius: isMobile ? 20 : 0,
                  border: isMobile ? `1px solid ${C.border}` : 'none',
                  boxShadow: isMobile ? '0 4px 16px rgba(0,0,0,0.03)' : 'none',
                  gap: isMobile ? 18 : 0,
                }}>
                  {/* Step icon box */}
                  <div style={{
                    width: isMobile ? 68 : 100,
                    height: isMobile ? 68 : 100,
                    borderRadius: isMobile ? 20 : 28,
                    background: (isActive || isMobile)
                      ? `linear-gradient(135deg, ${C.red}, ${C.redLight})`
                      : C.white,
                    border: (isActive || isMobile) ? 'none' : `2px solid ${C.red}15`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: (isActive || isMobile)
                      ? `0 10px 30px ${C.red}25`
                      : '0 8px 24px rgba(26,31,54,0.06)',
                    transition: 'all 0.4s ease',
                    position: 'relative',
                    flexShrink: 0,
                  }}>
                    <IconComp
                      size={isMobile ? 28 : 34}
                      color={C.white}
                      strokeWidth={1.8}
                    />
                    {/* Step number badge */}
                    <div style={{
                      position: 'absolute', top: -6, right: -6,
                      width: 26, height: 26, borderRadius: 8,
                      background: C.navy,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: F.heading, fontWeight: 800, fontSize: 11, color: C.white,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                    }}>{step.number}</div>
                  </div>

                  {/* Step text info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{
                      fontFamily: F.heading, fontWeight: 800,
                      fontSize: isMobile ? 17 : 18,
                      color: C.navy,
                      marginTop: isMobile ? 2 : 20,
                      marginBottom: 6,
                    }}>{step.title}</h4>

                    <p style={{
                      fontSize: isMobile ? 13 : 14,
                      color: C.gray,
                      lineHeight: 1.6,
                      maxWidth: isMobile ? '100%' : 240,
                      margin: isMobile ? '0 0 10px' : '0 auto',
                    }}>{step.description}</p>

                    {/* Detail chips (Always visible on mobile, hover on desktop) */}
                    <div style={{
                      display: 'flex', gap: 6,
                      justifyContent: isMobile ? 'flex-start' : 'center',
                      marginTop: isMobile ? 4 : 14,
                      flexWrap: 'wrap',
                      opacity: isMobile || isActive ? 1 : 0,
                      transition: 'all 0.3s ease',
                    }}>
                      <span style={{
                        padding: '4px 10px', borderRadius: 9999,
                        background: `${C.red}08`, border: `1px solid ${C.red}15`,
                        fontSize: 11, fontWeight: 700, color: C.red,
                        fontFamily: F.heading, display: 'inline-flex', alignItems: 'center', gap: 4,
                      }}>
                        <Clock size={11} /> {step.time}
                      </span>
                      <span style={{
                        padding: '4px 10px', borderRadius: 9999,
                        background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.12)',
                        fontSize: 11, fontWeight: 700, color: '#16a34a',
                        fontFamily: F.heading, display: 'inline-flex', alignItems: 'center', gap: 4,
                      }}>
                        <Shield size={11} /> {step.detail}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div style={{
          textAlign: 'center', marginTop: isMobile ? 36 : 56,
        }}>
          <a href="#cta" className="glow-btn" style={{
            width: isMobile ? '100%' : 'auto',
            padding: '16px 36px', borderRadius: 16, color: C.white,
            fontFamily: F.heading, fontWeight: 700, fontSize: 15,
            background: `linear-gradient(135deg, ${C.red}, ${C.redLight})`,
            boxShadow: `0 8px 30px ${C.red}35`,
            transition: 'all 0.3s', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            textDecoration: 'none', boxSizing: 'border-box',
          }}>
            Agenda tu Cita Ahora
            <ArrowRight size={17} />
          </a>
          <p style={{ fontSize: 12.5, color: C.gray, marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <Star size={13} color={C.amber} fill={C.amber} />
            4.8/5.0 calificación promedio en Google y talleres
          </p>
        </div>
      </div>
    </section>
  );
}
