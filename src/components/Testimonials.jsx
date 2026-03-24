import { useState, useEffect, useRef } from 'react';
import { testimonialsContent } from '../data/content';
import { C, F, useReveal } from '../hooks/useAnimations';
import { Star } from 'lucide-react';

export default function Testimonials() {
  const reviews = testimonialsContent.reviews;
  const [active, setActive] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);
  const [dragDelta, setDragDelta] = useState(0);
  const containerRef = useRef(null);
  const header = useReveal();

  // Auto-advance
  useEffect(() => {
    if (dragging) return;
    const t = setInterval(() => setActive(p => (p + 1) % reviews.length), 5000);
    return () => clearInterval(t);
  }, [reviews.length, dragging]);

  // Drag handlers
  const onPointerDown = (e) => { setDragging(true); setDragStart(e.clientX); setDragDelta(0); };
  const onPointerMove = (e) => { if (dragging) setDragDelta(e.clientX - dragStart); };
  const onPointerUp = () => {
    if (Math.abs(dragDelta) > 60) {
      setActive(p => dragDelta > 0 ? (p - 1 + reviews.length) % reviews.length : (p + 1) % reviews.length);
    }
    setDragging(false); setDragDelta(0);
  };

  return (
    <section style={{ padding: '6rem 1.5rem', background: C.white, overflow: 'hidden', position: 'relative' }}>
      <div style={{ position: 'absolute', top: -60, right: -60, width: 250, height: 250, borderRadius: '50%', background: 'rgba(196,30,36,0.03)', pointerEvents: 'none' }} />

      <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div ref={header.ref} style={{ textAlign: 'center', maxWidth: 600, margin: '0 auto 56px', ...header.style }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 18px', borderRadius: 9999,
            background: 'rgba(196,30,36,0.08)', color: C.red,
            fontFamily: F.heading, fontWeight: 600, fontSize: 13, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 16,
          }}>{testimonialsContent.tag}</span>
          <h2 style={{ fontFamily: F.heading, fontWeight: 700, fontSize: 'clamp(2rem, 5vw, 3rem)', color: C.navy }}>
            {testimonialsContent.title}{' '}
            <span className="animated-gradient" style={{ background: `linear-gradient(135deg, ${C.red}, ${C.redLight}, ${C.red})`, backgroundSize: '200% 200%', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {testimonialsContent.titleHighlight}
            </span>
          </h2>
        </div>

        {/* Draggable carousel */}
        <div ref={containerRef} style={{ maxWidth: 900, margin: '0 auto', position: 'relative', cursor: dragging ? 'grabbing' : 'grab', userSelect: 'none' }}
          onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerLeave={onPointerUp}
        >
          <div style={{
            display: 'flex', transition: dragging ? 'none' : 'transform 0.6s cubic-bezier(0.16,1,0.3,1)',
            transform: `translateX(calc(-${active * 100}% + ${dragDelta}px))`,
          }}>
            {reviews.map((r, i) => (
              <div key={i} style={{ minWidth: '100%', padding: '0 20px', boxSizing: 'border-box' }}>
                <div style={{
                  background: C.light, borderRadius: 28, padding: 'clamp(32px, 5vw, 56px)',
                  position: 'relative', overflow: 'hidden',
                  boxShadow: '0 8px 40px rgba(26,31,54,0.06)', border: `1px solid ${C.border}`,
                }}>
                  <div style={{ position: 'absolute', top: 16, right: 24, fontSize: 120, fontFamily: F.heading, fontWeight: 900, color: 'rgba(196,30,36,0.04)', lineHeight: 1, userSelect: 'none' }}>"</div>
                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', gap: 3, marginBottom: 24 }}>
                      {Array.from({ length: r.rating }).map((_, j) => (
                        <Star key={j} size={20} color={C.amber} fill={C.amber} />
                      ))}
                    </div>
                    <p style={{ fontFamily: F.heading, fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)', fontWeight: 500, lineHeight: 1.65, color: C.navy }}>
                      "{r.text}"
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 32 }}>
                      <img src={r.avatar} alt={r.name} style={{
                        width: 56, height: 56, borderRadius: '50%', objectFit: 'cover',
                        border: `3px solid rgba(196,30,36,0.15)`,
                      }} />
                      <div>
                        <div style={{ fontFamily: F.heading, fontWeight: 700, color: C.navy }}>{r.name}</div>
                        <div style={{ fontSize: 14, color: C.gray }}>{r.location}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation arrows */}
          <button onClick={(e) => { e.stopPropagation(); setActive(p => (p - 1 + reviews.length) % reviews.length); }} style={{
            position: 'absolute', top: '50%', left: -20, transform: 'translateY(-50%)',
            width: 48, height: 48, borderRadius: '50%', border: `1px solid ${C.border}`,
            background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, color: C.navy, cursor: 'pointer', boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
            transition: 'all 0.3s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = C.red; e.currentTarget.style.color = C.white; e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.95)'; e.currentTarget.style.color = C.navy; e.currentTarget.style.transform = 'translateY(-50%) scale(1)'; }}
          >←</button>
          <button onClick={(e) => { e.stopPropagation(); setActive(p => (p + 1) % reviews.length); }} style={{
            position: 'absolute', top: '50%', right: -20, transform: 'translateY(-50%)',
            width: 48, height: 48, borderRadius: '50%', border: `1px solid ${C.border}`,
            background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, color: C.navy, cursor: 'pointer', boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
            transition: 'all 0.3s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = C.red; e.currentTarget.style.color = C.white; e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.95)'; e.currentTarget.style.color = C.navy; e.currentTarget.style.transform = 'translateY(-50%) scale(1)'; }}
          >→</button>
        </div>

        {/* Dots + avatars */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 32 }}>
          {reviews.map((_, i) => (
            <button key={i} onClick={() => setActive(i)} style={{
              width: i === active ? 40 : 12, height: 12, borderRadius: 9999, border: 'none',
              background: i === active ? C.red : 'rgba(26,31,54,0.12)',
              transition: 'all 0.5s cubic-bezier(0.16,1,0.3,1)',
              boxShadow: i === active ? '0 4px 12px rgba(196,30,36,0.3)' : 'none',
              cursor: 'pointer',
            }} />
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 24 }}>
          {reviews.map((r, i) => (
            <button key={i} onClick={() => setActive(i)} style={{
              width: 48, height: 48, borderRadius: '50%', overflow: 'hidden', border: 'none', padding: 0,
              outline: i === active ? `3px solid ${C.red}` : '3px solid transparent', outlineOffset: 3,
              opacity: i === active ? 1 : 0.4, transform: i === active ? 'scale(1.15)' : 'scale(1)',
              transition: 'all 0.4s cubic-bezier(0.16,1,0.3,1)', cursor: 'pointer',
            }}>
              <img src={r.avatar} alt={r.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
