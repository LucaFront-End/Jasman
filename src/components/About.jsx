import { useState, useEffect } from 'react';
import { aboutContent } from '../data/content';
import { C, F, useReveal, useCountUp } from '../hooks/useAnimations';
import Icon from './Icon';
import { MapPin, Trophy, Settings, Flag, ShieldCheck, Star } from 'lucide-react';

function AnimatedStat({ number, suffix, label, icon }) {
  const { ref, count } = useCountUp(number, 2000);
  return (
    <div ref={ref} style={{
      textAlign: 'center', padding: 'clamp(16px, 3vw, 24px)', borderRadius: 20,
      background: C.white, border: `1px solid ${C.border}`,
      boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
      transition: 'all 0.4s cubic-bezier(0.16,1,0.3,1)',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 16px 40px rgba(196,30,36,0.1)'; e.currentTarget.style.borderColor = 'rgba(196,30,36,0.2)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.03)'; e.currentTarget.style.borderColor = C.border; }}
    >
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6 }}>{icon}</div>
      <div style={{ fontFamily: F.heading, fontWeight: 900, fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', color: C.red, lineHeight: 1.1 }}>{count}{suffix}</div>
      <div style={{ fontSize: 'clamp(11px, 1.2vw, 13px)', color: C.gray, marginTop: 4, fontWeight: 600 }}>{label}</div>
    </div>
  );
}

export default function About() {
  const [activeFeature, setActiveFeature] = useState(0);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 900 : false);
  const left = useReveal('left');
  const right = useReveal('right');

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <section id="about" style={{ padding: 'clamp(3.5rem, 6vw, 6rem) clamp(1rem, 3vw, 1.5rem)', background: C.white, overflow: 'hidden' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Top: Responsive grid */}
        <div className="about-grid">
          {/* Left: Text + Interactive Features */}
          <div ref={left.ref} style={{ ...left.style }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 18px', borderRadius: 9999,
              background: 'rgba(196,30,36,0.08)', color: C.red,
              fontFamily: F.heading, fontWeight: 600, fontSize: 13, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 16,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.red }} />
              {aboutContent.tag}
            </span>
            <h2 style={{ fontFamily: F.heading, fontWeight: 700, fontSize: 'clamp(1.8rem, 4.5vw, 3rem)', color: C.navy, lineHeight: 1.15 }}>
              {aboutContent.title}{' '}
              <span className="animated-gradient" style={{ background: `linear-gradient(135deg, ${C.red}, ${C.redLight}, ${C.red})`, backgroundSize: '200% 200%', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {aboutContent.titleHighlight}
              </span>
            </h2>
            <p style={{ color: C.gray, fontSize: 'clamp(14px, 1.6vw, 17px)', lineHeight: 1.7, marginTop: 18 }}>{aboutContent.description}</p>

            {/* Interactive Feature Tabs */}
            <div style={{ display: 'flex', gap: 8, marginTop: 24, flexWrap: 'wrap' }}>
              {aboutContent.features.map((f, i) => (
                <button key={i} onClick={() => setActiveFeature(i)} style={{
                  padding: '9px 16px', borderRadius: 14, border: `1.5px solid ${activeFeature === i ? C.red : C.border}`,
                  background: activeFeature === i ? C.red : C.white, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 8,
                  transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
                  boxShadow: activeFeature === i ? '0 6px 20px rgba(196,30,36,0.2)' : 'none',
                  transform: activeFeature === i ? 'scale(1.02)' : 'scale(1)',
                }}
                  onMouseEnter={e => { if (activeFeature !== i) { e.currentTarget.style.borderColor = 'rgba(196,30,36,0.3)'; } }}
                  onMouseLeave={e => { if (activeFeature !== i) { e.currentTarget.style.borderColor = C.border; } }}
                >
                  <span style={{ display: 'flex', alignItems: 'center' }}><Icon name={f.icon} size={15} color={activeFeature === i ? C.white : C.red} /></span>
                  <span style={{ fontFamily: F.heading, fontWeight: 600, fontSize: 12.5, color: activeFeature === i ? C.white : C.navy }}>{f.title}</span>
                </button>
              ))}
            </div>

            {/* Feature detail card */}
            <div style={{
              marginTop: 18, padding: 'clamp(16px, 3vw, 24px)', borderRadius: 18,
              background: C.light, border: `1px solid ${C.border}`,
              minHeight: 80, position: 'relative', overflow: 'hidden',
            }}>
              <div key={activeFeature} style={{ animation: 'slideUp 0.4s cubic-bezier(0.16,1,0.3,1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 38, height: 38, borderRadius: 12, background: 'rgba(196,30,36,0.08)' }}><Icon name={aboutContent.features[activeFeature].icon} size={20} color={C.red} /></div>
                  <h4 style={{ fontFamily: F.heading, fontWeight: 700, fontSize: 17, color: C.navy }}>{aboutContent.features[activeFeature].title}</h4>
                </div>
                <p style={{ fontSize: 14, color: C.gray, lineHeight: 1.65 }}>{aboutContent.features[activeFeature].text}</p>
                <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
                  {['Certificado', 'Profesional', 'Confiable'].map((tag, j) => (
                    <span key={j} style={{ padding: '3px 10px', borderRadius: 9999, background: 'rgba(196,30,36,0.06)', color: C.red, fontSize: 11, fontWeight: 600 }}>{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Image + Floating elements */}
          <div ref={right.ref} style={{ position: 'relative', width: '100%', ...right.style }}>
            <div style={{
              borderRadius: 24, overflow: 'hidden',
              boxShadow: '0 20px 50px rgba(26,31,54,0.12)',
              position: 'relative',
              width: '100%',
            }}>
              <img src={aboutContent.image} alt="Jasman Automotriz" loading="lazy"
                style={{
                  width: '100%',
                  height: isMobile ? 320 : 540,
                  objectFit: 'cover',
                  display: 'block',
                  transition: 'transform 0.7s cubic-bezier(0.16,1,0.3,1)',
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              />
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(180deg, transparent 60%, rgba(26,31,54,0.4) 100%)',
                pointerEvents: 'none',
              }} />
            </div>

            {/* Floating badge 1: Garantía */}
            <div style={{
              position: 'absolute',
              top: isMobile ? 12 : -16,
              left: isMobile ? 12 : -16,
              background: 'rgba(255,255,255,0.96)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              borderRadius: 16,
              padding: isMobile ? '10px 14px' : '16px 20px',
              boxShadow: '0 12px 35px rgba(0,0,0,0.12)',
              zIndex: 5,
              animation: 'float 6s ease-in-out infinite',
              maxWidth: 'calc(100% - 24px)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: isMobile ? 34 : 42,
                  height: isMobile ? 34 : 42,
                  borderRadius: '50%',
                  background: 'rgba(34,197,94,0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <ShieldCheck size={isMobile ? 18 : 22} color="#16a34a" />
                </div>
                <div>
                  <div style={{ fontFamily: F.heading, fontWeight: 700, fontSize: isMobile ? 12 : 14, color: C.navy }}>Garantía Total</div>
                  <div style={{ fontSize: isMobile ? 10.5 : 12, color: C.gray }}>En todos nuestros servicios</div>
                </div>
              </div>
            </div>

            {/* Floating badge 2: Calificación */}
            <div style={{
              position: 'absolute',
              bottom: isMobile ? 12 : -16,
              right: isMobile ? 12 : -16,
              background: 'rgba(255,255,255,0.96)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              borderRadius: 16,
              padding: isMobile ? '10px 14px' : '16px 20px',
              boxShadow: '0 12px 35px rgba(0,0,0,0.12)',
              zIndex: 5,
              animation: 'float2 7s ease-in-out infinite',
              maxWidth: 'calc(100% - 24px)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: isMobile ? 34 : 42,
                  height: isMobile ? 34 : 42,
                  borderRadius: '50%',
                  background: 'rgba(196,30,36,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Star size={isMobile ? 18 : 22} color={C.red} fill={C.red} />
                </div>
                <div>
                  <div style={{ fontFamily: F.heading, fontWeight: 700, fontSize: isMobile ? 12 : 14, color: C.navy }}>4.8 / 5.0</div>
                  <div style={{ fontSize: isMobile ? 10.5 : 12, color: C.gray }}>+50k Clientes Satisfechos</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="about-stats-grid">
          <AnimatedStat number={80} suffix="+" label="Sucursales en México" icon={<MapPin size={24} color={C.red} />} />
          <AnimatedStat number={60} suffix="+" label="Años de Experiencia" icon={<Trophy size={24} color={C.red} />} />
          <AnimatedStat number={1} suffix="M+" label="Servicios Realizados" icon={<Settings size={24} color={C.red} />} />
          <AnimatedStat number={100} suffix="%" label="Calidad Garantizada" icon={<Flag size={24} color={C.red} />} />
        </div>
      </div>
    </section>
  );
}
