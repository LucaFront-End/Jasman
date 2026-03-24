import { useState } from 'react';
import { aboutContent } from '../data/content';
import { C, F, useReveal, useCountUp } from '../hooks/useAnimations';
import Icon from './Icon';
import { MapPin, Trophy, Settings, Flag, ShieldCheck, Star } from 'lucide-react';

function AnimatedStat({ number, suffix, label, icon }) {
  const { ref, count } = useCountUp(number, 2000);
  return (
    <div ref={ref} style={{
      textAlign: 'center', padding: 24, borderRadius: 20,
      background: C.white, border: `1px solid ${C.border}`,
      transition: 'all 0.4s cubic-bezier(0.16,1,0.3,1)',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 16px 40px rgba(196,30,36,0.1)'; e.currentTarget.style.borderColor = 'rgba(196,30,36,0.2)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = C.border; }}
    >
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>{icon}</div>
      <div style={{ fontFamily: F.heading, fontWeight: 900, fontSize: 'clamp(2rem, 4vw, 2.8rem)', color: C.red }}>{count}{suffix}</div>
      <div style={{ fontSize: 13, color: C.gray, marginTop: 4, fontWeight: 500 }}>{label}</div>
    </div>
  );
}

export default function About() {
  const [activeFeature, setActiveFeature] = useState(0);
  const left = useReveal('left');
  const right = useReveal('right');

  return (
    <section id="about" style={{ padding: '6rem 1.5rem', background: C.white, overflow: 'hidden' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Top: Two columns */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
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
            <h2 style={{ fontFamily: F.heading, fontWeight: 700, fontSize: 'clamp(2rem, 5vw, 3rem)', color: C.navy, lineHeight: 1.15 }}>
              {aboutContent.title}{' '}
              <span className="animated-gradient" style={{ background: `linear-gradient(135deg, ${C.red}, ${C.redLight}, ${C.red})`, backgroundSize: '200% 200%', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {aboutContent.titleHighlight}
              </span>
            </h2>
            <p style={{ color: C.gray, fontSize: 17, lineHeight: 1.72, marginTop: 24 }}>{aboutContent.description}</p>

            {/* Interactive Feature Tabs */}
            <div style={{ display: 'flex', gap: 8, marginTop: 32, flexWrap: 'wrap' }}>
              {aboutContent.features.map((f, i) => (
                <button key={i} onClick={() => setActiveFeature(i)} style={{
                  padding: '10px 18px', borderRadius: 14, border: `1px solid ${activeFeature === i ? C.red : C.border}`,
                  background: activeFeature === i ? C.red : C.white, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 8,
                  transition: 'all 0.4s cubic-bezier(0.16,1,0.3,1)',
                  boxShadow: activeFeature === i ? '0 6px 20px rgba(196,30,36,0.2)' : 'none',
                  transform: activeFeature === i ? 'scale(1.03)' : 'scale(1)',
                }}
                  onMouseEnter={e => { if (activeFeature !== i) { e.currentTarget.style.borderColor = 'rgba(196,30,36,0.3)'; e.currentTarget.style.transform = 'scale(1.02)'; } }}
                  onMouseLeave={e => { if (activeFeature !== i) { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.transform = 'scale(1)'; } }}
                >
                  <span style={{ display: 'flex', alignItems: 'center' }}><Icon name={f.icon} size={16} color={activeFeature === i ? C.white : C.red} /></span>
                  <span style={{ fontFamily: F.heading, fontWeight: 600, fontSize: 13, color: activeFeature === i ? C.white : C.navy }}>{f.title}</span>
                </button>
              ))}
            </div>
            {/* Feature detail */}
            <div style={{
              marginTop: 20, padding: 24, borderRadius: 18,
              background: C.light, border: `1px solid ${C.border}`,
              minHeight: 80, position: 'relative', overflow: 'hidden',
            }}>
              <div key={activeFeature} style={{ animation: 'slideUp 0.4s cubic-bezier(0.16,1,0.3,1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40, borderRadius: 12, background: 'rgba(196,30,36,0.08)' }}><Icon name={aboutContent.features[activeFeature].icon} size={22} color={C.red} /></div>
                  <h4 style={{ fontFamily: F.heading, fontWeight: 700, fontSize: 18, color: C.navy }}>{aboutContent.features[activeFeature].title}</h4>
                </div>
                <p style={{ fontSize: 15, color: C.gray, lineHeight: 1.7 }}>{aboutContent.features[activeFeature].text}</p>
                <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                  {['Certificado', 'Profesional', 'Confiable'].map((tag, j) => (
                    <span key={j} style={{ padding: '3px 12px', borderRadius: 9999, background: 'rgba(196,30,36,0.06)', color: C.red, fontSize: 11, fontWeight: 600 }}>{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Image + Floating elements */}
          <div ref={right.ref} style={{ position: 'relative', ...right.style }}>
            <div style={{ borderRadius: 24, overflow: 'hidden', boxShadow: '0 25px 60px rgba(26,31,54,0.14)' }}>
              <img src={aboutContent.image} alt="Jasman" loading="lazy"
                style={{ width: '100%', height: 550, objectFit: 'cover', transition: 'transform 0.7s cubic-bezier(0.16,1,0.3,1)' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              />
            </div>
            <div style={{
              position: 'absolute', top: -20, left: -20, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(16px)',
              borderRadius: 18, padding: '18px 22px', boxShadow: '0 12px 40px rgba(0,0,0,0.1)', zIndex: 10,
              animation: 'float 6s ease-in-out infinite',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(34,197,94,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ShieldCheck size={22} color="#22c55e" /></div>
                <div>
                  <div style={{ fontFamily: F.heading, fontWeight: 700, fontSize: 14, color: C.navy }}>Garantía Total</div>
                  <div style={{ fontSize: 12, color: C.gray }}>En todos nuestros servicios</div>
                </div>
              </div>
            </div>
            <div style={{
              position: 'absolute', bottom: -20, right: -20, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(16px)',
              borderRadius: 18, padding: '18px 22px', boxShadow: '0 12px 40px rgba(0,0,0,0.1)', zIndex: 10,
              animation: 'float2 7s ease-in-out infinite',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(196,30,36,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Star size={22} color={C.red} fill={C.red} /></div>
                <div>
                  <div style={{ fontFamily: F.heading, fontWeight: 700, fontSize: 14, color: C.navy }}>4.3 / 5.0</div>
                  <div style={{ fontSize: 12, color: C.gray }}>Calificación promedio</div>
                </div>
              </div>
            </div>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '120%', height: '120%', borderRadius: '50%', border: '1px dashed rgba(196,30,36,0.1)', animation: 'rotate 60s linear infinite', pointerEvents: 'none' }} />
          </div>
        </div>

        {/* Stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginTop: 56 }}>
          <AnimatedStat number={80} suffix="+" label="Sucursales en México" icon={<MapPin size={28} color={C.red} />} />
          <AnimatedStat number={60} suffix="+" label="Años de Experiencia" icon={<Trophy size={28} color={C.red} />} />
          <AnimatedStat number={1} suffix="M+" label="Servicios Realizados" icon={<Settings size={28} color={C.red} />} />
          <AnimatedStat number={100} suffix="%" label="Mexicanos" icon={<Flag size={28} color={C.red} />} />
        </div>
      </div>
    </section>
  );
}
