import { promosContent } from '../data/content';
import { C, F, useReveal, useStaggerReveal } from '../hooks/useAnimations';
import { Check } from 'lucide-react';

export default function Promotions() {
  const header = useReveal();
  const cards = useStaggerReveal(promosContent.promos.length);
  const badges = { '-30%': { bg: C.red, c: '#fff' }, 'POPULAR': { bg: C.amber, c: C.navy }, 'NUEVO': { bg: '#22c55e', c: '#fff' } };

  return (
    <section id="promos" style={{ padding: '6rem 1.5rem', background: C.navy, position: 'relative', overflow: 'hidden' }}>
      {/* Decorative glow */}
      <div style={{ position: 'absolute', top: '30%', left: '-10%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(196,30,36,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '10%', right: '-5%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(196,30,36,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div ref={header.ref} style={{ textAlign: 'center', maxWidth: 600, margin: '0 auto 56px', ...header.style }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 18px', borderRadius: 9999,
            background: 'rgba(196,30,36,0.15)', color: C.redLight,
            fontFamily: F.heading, fontWeight: 600, fontSize: 13, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 16,
          }}>{promosContent.tag}</span>
          <h2 style={{ fontFamily: F.heading, fontWeight: 700, fontSize: 'clamp(2rem, 5vw, 3rem)', color: C.white, lineHeight: 1.15 }}>
            {promosContent.title}{' '}
            <span className="animated-gradient" style={{ background: `linear-gradient(135deg, ${C.redLight}, ${C.amber}, ${C.redLight})`, backgroundSize: '200% 200%', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {promosContent.titleHighlight}
            </span>
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 32 }}>
          {promosContent.promos.map((p, i) => {
            const bc = badges[p.badge] || badges['-30%'];
            return (
              <div key={i} ref={cards.setRef(i)} className="promo-card" style={{
                ...cards.getStyle(i),
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 24, overflow: 'hidden', position: 'relative',
              }}>
                <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 20 }}>
                  <span style={{
                    padding: '5px 14px', borderRadius: 9999, fontSize: 12, fontFamily: F.heading, fontWeight: 700,
                    background: bc.bg, color: bc.c, boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                    animation: 'bounceIn 0.6s cubic-bezier(0.16,1,0.3,1)',
                  }}>{p.badge}</span>
                </div>
                <div style={{ position: 'relative', height: 180, overflow: 'hidden' }}>
                  <img src={p.image} alt={p.title} loading="lazy" className="img-zoom" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to top, ${C.navy}, transparent 60%)` }} />
                </div>
                <div style={{ padding: 24 }}>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', fontWeight: 500 }}>{p.subtitle}</div>
                  <h3 style={{ fontFamily: F.heading, fontWeight: 700, fontSize: 22, color: C.white, marginTop: 4 }}>{p.title}</h3>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginTop: 16 }}>
                    <span style={{ fontFamily: F.heading, fontWeight: 900, fontSize: 30, color: C.redLight }}>{p.price}</span>
                    <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.35)', textDecoration: 'line-through' }}>{p.originalPrice}</span>
                  </div>
                  <ul style={{ marginTop: 20 }}>
                    {p.features.map((f, j) => (
                      <li key={j} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'rgba(255,255,255,0.65)', padding: '6px 0' }}>
                        <span style={{ color: C.redLight, display: 'flex', alignItems: 'center' }}><Check size={14} strokeWidth={3} /></span> {f}
                      </li>
                    ))}
                  </ul>
                  <button className="glow-btn" style={{
                    width: '100%', marginTop: 24, padding: 14, borderRadius: 14,
                    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                    color: C.white, fontFamily: F.heading, fontWeight: 600, fontSize: 14,
                    transition: 'all 0.4s cubic-bezier(0.16,1,0.3,1)',
                  }}
                    onMouseEnter={e => { e.target.style.background = C.red; e.target.style.borderColor = C.red; e.target.style.boxShadow = '0 8px 24px rgba(196,30,36,0.35)'; }}
                    onMouseLeave={e => { e.target.style.background = 'rgba(255,255,255,0.06)'; e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}
                  >Cotizar Ahora</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
