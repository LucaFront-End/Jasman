import { useState, useEffect } from 'react';
import { C, F } from '../hooks/useAnimations';
import { promosContent } from '../data/content';
import { X, ChevronUp, Tag, Check } from 'lucide-react';

export default function PromotionsPopup() {
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [activePromo, setActivePromo] = useState(0);

  // Show after 3 seconds if not dismissed this session
  useEffect(() => {
    const wasDismissed = sessionStorage.getItem('jasman-promo-dismissed');
    if (wasDismissed) { setDismissed(true); return; }
    const timer = setTimeout(() => setOpen(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setOpen(false);
    setDismissed(true);
    sessionStorage.setItem('jasman-promo-dismissed', '1');
  };

  const p = promosContent.promos[activePromo];

  // Minimized tab
  if (!open) {
    return (
      <button onClick={() => { setOpen(true); setDismissed(false); }} style={{
        position: 'fixed', bottom: 0, right: 24, zIndex: 900,
        padding: '10px 20px', borderRadius: '14px 14px 0 0',
        background: `linear-gradient(135deg, ${C.red}, ${C.redLight})`,
        color: C.white, border: 'none', cursor: 'pointer',
        fontFamily: F.heading, fontWeight: 700, fontSize: 13,
        display: 'flex', alignItems: 'center', gap: 8,
        boxShadow: '0 -4px 20px rgba(196,30,36,0.3)',
        transition: 'all 0.3s',
        transform: 'translateY(0)',
        animation: 'heroFadeUp 0.5s ease',
      }}
        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
      >
        <Tag size={14} />
        Promociones
        <ChevronUp size={14} />
      </button>
    );
  }

  return (
    <div style={{
      position: 'fixed', bottom: 20, right: 20, zIndex: 900,
      width: 380, maxWidth: 'calc(100vw - 40px)',
      borderRadius: 24, overflow: 'hidden',
      background: 'rgba(26,31,54,0.95)', backdropFilter: 'blur(24px)',
      border: '1px solid rgba(255,255,255,0.08)',
      boxShadow: '0 24px 64px rgba(0,0,0,0.4), 0 0 0 1px rgba(196,30,36,0.1)',
      animation: 'promoSlideUp 0.5s cubic-bezier(0.16,1,0.3,1)',
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: `linear-gradient(135deg, rgba(196,30,36,0.15), transparent)`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 10,
            background: `linear-gradient(135deg, ${C.red}, ${C.redLight})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Tag size={14} color={C.white} />
          </div>
          <span style={{ fontFamily: F.heading, fontWeight: 700, fontSize: 14, color: C.white }}>
            Promociones Activas
          </span>
        </div>
        <button onClick={handleClose} style={{
          background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 8, width: 30, height: 30, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'rgba(255,255,255,0.4)', transition: 'all 0.3s',
        }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = C.white; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; }}
        >
          <X size={14} />
        </button>
      </div>

      {/* Promo content */}
      <div style={{ padding: 20 }}>
        <div key={activePromo} style={{ animation: 'heroFadeUp 0.4s ease' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
            <img src={p.image} alt="" style={{
              width: 64, height: 64, borderRadius: 14, objectFit: 'cover',
              border: '1px solid rgba(255,255,255,0.06)',
            }} />
            <div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>{p.subtitle}</div>
              <div style={{ fontFamily: F.heading, fontWeight: 700, fontSize: 16, color: C.white }}>{p.title}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
                <span style={{ fontFamily: F.heading, fontWeight: 900, fontSize: 22, color: C.redLight }}>{p.price}</span>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', textDecoration: 'line-through' }}>{p.originalPrice}</span>
              </div>
            </div>
          </div>
          <ul style={{ marginBottom: 16 }}>
            {p.features.slice(0, 3).map((f, j) => (
              <li key={j} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>
                <Check size={12} color={C.redLight} strokeWidth={3} /> {f}
              </li>
            ))}
          </ul>
        </div>

        {/* Dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 14 }}>
          {promosContent.promos.map((_, i) => (
            <button key={i} onClick={() => setActivePromo(i)} style={{
              width: activePromo === i ? 20 : 8, height: 8, borderRadius: 4, border: 'none',
              background: activePromo === i ? C.red : 'rgba(255,255,255,0.1)',
              cursor: 'pointer', transition: 'all 0.3s',
            }} />
          ))}
        </div>

        {/* CTA */}
        <button className="glow-btn" style={{
          width: '100%', padding: '13px 20px', borderRadius: 14, border: 'none',
          background: `linear-gradient(135deg, ${C.red}, ${C.redLight})`,
          color: C.white, fontFamily: F.heading, fontWeight: 700, fontSize: 14,
          cursor: 'pointer', boxShadow: '0 8px 24px rgba(196,30,36,0.3)',
          transition: 'all 0.3s',
        }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
          Cotizar Ahora
        </button>
      </div>
    </div>
  );
}
