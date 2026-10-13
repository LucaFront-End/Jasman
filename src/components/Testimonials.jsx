import { useState, useEffect, useRef } from 'react';
import { testimonialsContent } from '../data/content';
import { C, F, useReveal } from '../hooks/useAnimations';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Testimonials() {
  const reviews = testimonialsContent.reviews;
  const [active, setActive] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);
  const [dragDelta, setDragDelta] = useState(0);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
  const containerRef = useRef(null);
  const header = useReveal();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-advance every 6 seconds
  useEffect(() => {
    if (dragging) return;
    const t = setInterval(() => setActive(p => (p + 1) % reviews.length), 6000);
    return () => clearInterval(t);
  }, [reviews.length, dragging]);

  // Drag / touch handlers
  const onPointerDown = (e) => {
    setDragging(true);
    setDragStart(e.clientX || (e.touches && e.touches[0].clientX) || 0);
    setDragDelta(0);
  };
  const onPointerMove = (e) => {
    if (!dragging) return;
    const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    setDragDelta(clientX - dragStart);
  };
  const onPointerUp = () => {
    if (Math.abs(dragDelta) > 50) {
      setActive(p => dragDelta > 0 ? (p - 1 + reviews.length) % reviews.length : (p + 1) % reviews.length);
    }
    setDragging(false);
    setDragDelta(0);
  };

  return (
    <section style={{
      padding: isMobile ? '4rem 1rem 3.5rem' : '6rem 1.5rem',
      background: C.white,
      overflow: 'hidden',
      position: 'relative',
    }}>
      <div style={{
        position: 'absolute', top: -60, right: -60, width: 250, height: 250,
        borderRadius: '50%', background: 'rgba(196,30,36,0.03)', pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div ref={header.ref} style={{ textAlign: 'center', maxWidth: 600, margin: isMobile ? '0 auto 32px' : '0 auto 56px', ...header.style }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 18px', borderRadius: 9999,
            background: 'rgba(196,30,36,0.08)', color: C.red,
            fontFamily: F.heading, fontWeight: 600, fontSize: 13, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 14,
          }}>{testimonialsContent.tag}</span>
          <h2 style={{ fontFamily: F.heading, fontWeight: 700, fontSize: 'clamp(1.8rem, 4.5vw, 3rem)', color: C.navy, lineHeight: 1.15 }}>
            {testimonialsContent.title}{' '}
            <span className="animated-gradient" style={{ background: `linear-gradient(135deg, ${C.red}, ${C.redLight}, ${C.red})`, backgroundSize: '200% 200%', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {testimonialsContent.titleHighlight}
            </span>
          </h2>
        </div>

        {/* Draggable carousel container */}
        <div
          ref={containerRef}
          style={{
            maxWidth: 860, margin: '0 auto', position: 'relative',
            cursor: dragging ? 'grabbing' : 'grab', userSelect: 'none',
          }}
          onMouseDown={onPointerDown} onMouseMove={onPointerMove} onMouseUp={onPointerUp} onMouseLeave={onPointerUp}
          onTouchStart={onPointerDown} onTouchMove={onPointerMove} onTouchEnd={onPointerUp}
        >
          <div style={{
            display: 'flex', transition: dragging ? 'none' : 'transform 0.5s cubic-bezier(0.16,1,0.3,1)',
            transform: `translateX(calc(-${active * 100}% + ${dragDelta}px))`,
          }}>
            {reviews.map((r, i) => (
              <div key={i} style={{ minWidth: '100%', padding: isMobile ? '0 4px' : '0 16px', boxSizing: 'border-box' }}>
                <div style={{
                  background: C.light, borderRadius: 24,
                  padding: isMobile ? '24px 20px' : 'clamp(32px, 5vw, 56px)',
                  position: 'relative', overflow: 'hidden',
                  boxShadow: '0 8px 30px rgba(26,31,54,0.06)', border: `1px solid ${C.border}`,
                }}>
                  <div style={{
                    position: 'absolute', top: 12, right: 18,
                    fontSize: isMobile ? 80 : 120, fontFamily: F.heading,
                    fontWeight: 900, color: 'rgba(196,30,36,0.04)',
                    lineHeight: 1, userSelect: 'none',
                  }}>"</div>
                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', gap: 3, marginBottom: 16 }}>
                      {Array.from({ length: r.rating }).map((_, j) => (
                        <Star key={j} size={18} color={C.amber} fill={C.amber} />
                      ))}
                    </div>
                    <p style={{
                      fontFamily: F.heading,
                      fontSize: 'clamp(1rem, 2.2vw, 1.4rem)',
                      fontWeight: 500, lineHeight: 1.6, color: C.navy, margin: 0,
                    }}>
                      "{r.text}"
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 22 }}>
                      <img src={r.avatar} alt={r.name} style={{
                        width: isMobile ? 48 : 56, height: isMobile ? 48 : 56,
                        borderRadius: '50%', objectFit: 'cover',
                        border: `3px solid rgba(196,30,36,0.15)`,
                      }} />
                      <div>
                        <div style={{ fontFamily: F.heading, fontWeight: 700, fontSize: isMobile ? 14 : 16, color: C.navy }}>{r.name}</div>
                        <div style={{ fontSize: isMobile ? 12 : 14, color: C.gray }}>{r.location}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Navigation arrows */}
          {!isMobile && (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setActive(p => (p - 1 + reviews.length) % reviews.length); }}
                aria-label="Testimonio anterior"
                style={{
                  position: 'absolute', top: '50%', left: -22, transform: 'translateY(-50%)',
                  width: 44, height: 44, borderRadius: '50%', border: `1px solid ${C.border}`,
                  background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, color: C.navy, cursor: 'pointer', boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                  transition: 'all 0.3s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = C.red; e.currentTarget.style.color = C.white; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.95)'; e.currentTarget.style.color = C.navy; }}
              >
                <ChevronLeft size={20} />
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setActive(p => (p + 1) % reviews.length); }}
                aria-label="Siguiente testimonio"
                style={{
                  position: 'absolute', top: '50%', right: -22, transform: 'translateY(-50%)',
                  width: 44, height: 44, borderRadius: '50%', border: `1px solid ${C.border}`,
                  background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, color: C.navy, cursor: 'pointer', boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                  transition: 'all 0.3s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = C.red; e.currentTarget.style.color = C.white; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.95)'; e.currentTarget.style.color = C.navy; }}
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}
        </div>

        {/* Dots pagination */}
        <div style={{
          display: 'flex', justifyContent: 'center', gap: 6,
          marginTop: isMobile ? 20 : 28,
        }}>
          {reviews.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Ver reseña ${i + 1}`}
              style={{
                width: i === active ? (isMobile ? 24 : 36) : 8,
                height: 8, borderRadius: 4, border: 'none',
                background: i === active ? C.red : 'rgba(26,31,54,0.15)',
                transition: 'all 0.4s ease',
                cursor: 'pointer', padding: 0,
              }}
            />
          ))}
        </div>

        {/* Avatars: on mobile, scrollable track with fade; on desktop centered row */}
        <div style={{
          display: 'flex',
          justifyContent: isMobile ? 'flex-start' : 'center',
          gap: isMobile ? 10 : 14,
          marginTop: isMobile ? 16 : 22,
          overflowX: isMobile ? 'auto' : 'visible',
          padding: isMobile ? '4px 6px 12px' : '0',
          scrollbarWidth: 'none',
          WebkitOverflowScrolling: 'touch',
        }}>
          {reviews.map((r, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Ver reseña de ${r.name}`}
              style={{
                width: isMobile ? 40 : 44,
                height: isMobile ? 40 : 44,
                borderRadius: '50%',
                overflow: 'hidden',
                border: 'none',
                padding: 0,
                flexShrink: 0,
                outline: i === active ? `3px solid ${C.red}` : '3px solid transparent',
                outlineOffset: 2,
                opacity: i === active ? 1 : 0.4,
                transform: i === active ? 'scale(1.1)' : 'scale(1)',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
              }}
            >
              <img src={r.avatar} alt={r.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
