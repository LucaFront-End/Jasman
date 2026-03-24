import { useState } from 'react';
import { C, F, useReveal, useStaggerReveal } from '../hooks/useAnimations';
import { CalendarCheck, ScanSearch, Wrench, Rocket, ArrowRight, Clock, Shield, Star } from 'lucide-react';

const steps = [
  {
    number: '01',
    title: 'Agenda tu Cita',
    description: 'Reserva en línea o por teléfono en menos de 2 minutos. Elige sucursal, servicio y horario que más te convenga.',
    icon: CalendarCheck,
    color: '#C41E24',
    detail: 'Sin filas, sin esperas',
    time: '2 min',
  },
  {
    number: '02',
    title: 'Diagnóstico Profesional',
    description: 'Nuestros técnicos certificados realizan una inspección completa con equipos de última generación y te entregan un reporte detallado.',
    icon: ScanSearch,
    color: '#E8363D',
    detail: 'Revisión de 21 puntos',
    time: '15 min',
  },
  {
    number: '03',
    title: 'Servicio Especializado',
    description: 'Ejecutamos el servicio con refacciones originales y herramientas de precisión. Te mantenemos informado en cada paso del proceso.',
    icon: Wrench,
    color: '#C41E24',
    detail: 'Garantía por escrito',
    time: 'Según servicio',
  },
  {
    number: '04',
    title: 'Listo para Rodar',
    description: 'Verificación final de calidad, limpieza de cortesía y entrega con explicación detallada del trabajo realizado.',
    icon: Rocket,
    color: '#E8363D',
    detail: 'Satisfacción garantizada',
    time: 'En el día',
  },
];

export default function Process() {
  const [activeStep, setActiveStep] = useState(null);
  const header = useReveal();
  const cards = useStaggerReveal(steps.length);

  return (
    <section id="proceso" style={{
      padding: 'clamp(4rem, 8vw, 7rem) 1.5rem',
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
      <div style={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        width: '80%', height: '80%', borderRadius: '50%',
        border: '1px dashed rgba(196,30,36,0.04)',
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div ref={header.ref} style={{ textAlign: 'center', maxWidth: 600, margin: '0 auto 64px', ...header.style }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 18px', borderRadius: 9999,
            background: 'rgba(196,30,36,0.06)', color: C.red,
            fontFamily: F.heading, fontWeight: 600, fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase',
            marginBottom: 20,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.red }} />
            NUESTRO PROCESO
          </span>
          <h2 style={{
            fontFamily: F.heading, fontWeight: 800,
            fontSize: 'clamp(2rem, 5vw, 3rem)', color: C.navy,
            lineHeight: 1.12, letterSpacing: '-0.02em',
          }}>
            De la cita al camino,{' '}
            <span className="animated-gradient" style={{
              background: `linear-gradient(135deg, ${C.red}, ${C.redLight}, ${C.red})`,
              backgroundSize: '200% 200%', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>en 4 simples pasos</span>
          </h2>
          <p style={{
            fontSize: 16, color: C.gray, lineHeight: 1.75, marginTop: 16,
          }}>Una experiencia diseñada para tu comodidad. Transparencia, profesionalismo y calidad en cada etapa.</p>
        </div>

        {/* Steps */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0, position: 'relative' }}>
          {/* Connecting line */}
          <div style={{
            position: 'absolute', top: 52, left: 'calc(12.5% + 20px)', right: 'calc(12.5% + 20px)',
            height: 2, zIndex: 0,
            background: `linear-gradient(90deg, ${C.red}20, ${C.red}40, ${C.red}20)`,
          }}>
            {/* Animated pulse line */}
            <div style={{
              position: 'absolute', inset: 0,
              background: `linear-gradient(90deg, transparent, ${C.red}, transparent)`,
              backgroundSize: '200% 100%',
              animation: 'lineFlow 3s linear infinite',
              opacity: 0.5,
            }} />
          </div>

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
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  textAlign: 'center', padding: '0 16px', cursor: 'default',
                }}>
                  {/* Step circle */}
                  <div style={{
                    width: 104, height: 104, borderRadius: 28,
                    background: isActive
                      ? `linear-gradient(135deg, ${C.red}, ${C.redLight})`
                      : C.white,
                    border: isActive ? 'none' : `2px solid ${C.red}15`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: isActive
                      ? `0 20px 50px ${C.red}30, 0 8px 20px rgba(0,0,0,0.08)`
                      : '0 8px 32px rgba(26,31,54,0.06)',
                    transition: 'all 0.5s cubic-bezier(0.16,1,0.3,1)',
                    position: 'relative',
                    transform: isActive ? 'translateY(-8px) scale(1.05)' : 'translateY(0) scale(1)',
                  }}>
                    <IconComp
                      size={36}
                      color={isActive ? C.white : C.red}
                      strokeWidth={1.6}
                      style={{ transition: 'color 0.3s' }}
                    />
                    {/* Step number badge */}
                    <div style={{
                      position: 'absolute', top: -8, right: -8,
                      width: 32, height: 32, borderRadius: 10,
                      background: isActive ? C.navy : `linear-gradient(135deg, ${C.red}, ${C.redLight})`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: F.heading, fontWeight: 800, fontSize: 12, color: C.white,
                      boxShadow: `0 4px 12px ${isActive ? 'rgba(26,31,54,0.3)' : 'rgba(196,30,36,0.3)'}`,
                      transition: 'all 0.4s cubic-bezier(0.16,1,0.3,1)',
                    }}>{step.number}</div>
                  </div>

                  {/* Title */}
                  <h4 style={{
                    fontFamily: F.heading, fontWeight: 700, fontSize: 18,
                    color: C.navy, marginTop: 24, marginBottom: 10,
                    transition: 'color 0.3s',
                  }}>{step.title}</h4>

                  {/* Description */}
                  <p style={{
                    fontSize: 14, color: C.gray, lineHeight: 1.7,
                    maxWidth: 240, margin: '0 auto',
                  }}>{step.description}</p>

                  {/* Detail chips */}
                  <div style={{
                    display: 'flex', gap: 6, justifyContent: 'center', marginTop: 16,
                    flexWrap: 'wrap',
                    opacity: isActive ? 1 : 0,
                    transform: isActive ? 'translateY(0)' : 'translateY(8px)',
                    transition: 'all 0.4s cubic-bezier(0.16,1,0.3,1)',
                    maxHeight: isActive ? 60 : 0,
                    overflow: 'hidden',
                  }}>
                    <span style={{
                      padding: '5px 12px', borderRadius: 9999,
                      background: `${C.red}08`, border: `1px solid ${C.red}15`,
                      fontSize: 11, fontWeight: 600, color: C.red,
                      fontFamily: F.heading, display: 'flex', alignItems: 'center', gap: 4,
                    }}>
                      <Clock size={10} /> {step.time}
                    </span>
                    <span style={{
                      padding: '5px 12px', borderRadius: 9999,
                      background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.12)',
                      fontSize: 11, fontWeight: 600, color: '#16a34a',
                      fontFamily: F.heading, display: 'flex', alignItems: 'center', gap: 4,
                    }}>
                      <Shield size={10} /> {step.detail}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div style={{
          textAlign: 'center', marginTop: 64,
          opacity: 0, animation: 'heroFadeUp 0.7s 0.8s cubic-bezier(0.16,1,0.3,1) forwards',
        }}>
          <a href="#cta" className="glow-btn" style={{
            padding: '18px 40px', borderRadius: 16, color: C.white,
            fontFamily: F.heading, fontWeight: 700, fontSize: 16,
            background: `linear-gradient(135deg, ${C.red}, ${C.redLight})`,
            boxShadow: `0 8px 32px ${C.red}35`,
            transition: 'all 0.3s', display: 'inline-flex', alignItems: 'center', gap: 10,
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 16px 48px ${C.red}45`; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 8px 32px ${C.red}35`; }}
          >
            Agenda tu Cita Ahora
            <ArrowRight size={18} />
          </a>
          <p style={{ fontSize: 13, color: C.gray, marginTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <Star size={12} color={C.amber} fill={C.amber} />
            4.5/5.0 calificación promedio de nuestros clientes
          </p>
        </div>
      </div>
    </section>
  );
}
