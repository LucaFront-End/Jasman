import { C, F } from '../hooks/useAnimations';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PageHero({ tag, title, highlight, subtitle, breadcrumbs = [], image }) {
  return (
    <section style={{
      position: 'relative', minHeight: 420, display: 'flex', alignItems: 'center',
      overflow: 'hidden', background: C.navy,
    }}>
      {image && (
        <img src={image} alt="" style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          objectFit: 'cover', opacity: 0.18, filter: 'blur(2px)',
        }} />
      )}
      <div style={{
        position: 'absolute', inset: 0,
        background: `linear-gradient(135deg, rgba(26,31,54,0.96) 0%, rgba(26,31,54,0.85) 50%, rgba(196,30,36,0.15) 100%)`,
      }} />
      <div style={{
        position: 'absolute', top: -200, right: -200, width: 500, height: 500,
        borderRadius: '50%', border: '1px solid rgba(196,30,36,0.08)', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'relative', zIndex: 2, maxWidth: 1200, margin: '0 auto',
        padding: '120px 24px 64px', width: '100%',
      }}>
        {breadcrumbs.length > 0 && (
          <nav style={{
            display: 'flex', alignItems: 'center', gap: 6, marginBottom: 24,
            fontSize: 13, color: 'rgba(255,255,255,0.4)',
          }}>
            <Link to="/" style={{ color: 'rgba(255,255,255,0.5)', transition: 'color 0.3s' }}
              onMouseEnter={e => e.currentTarget.style.color = C.white}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
            >Inicio</Link>
            {breadcrumbs.map((b, i) => (
              <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <ChevronRight size={12} />
                {b.href ? (
                  <Link to={b.href} style={{ color: 'rgba(255,255,255,0.5)', transition: 'color 0.3s' }}
                    onMouseEnter={e => e.currentTarget.style.color = C.white}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
                  >{b.label}</Link>
                ) : (
                  <span style={{ color: C.redLight }}>{b.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 20px', borderRadius: 9999,
          background: 'rgba(196,30,36,0.12)', color: C.redLight,
          fontFamily: F.heading, fontWeight: 600, fontSize: 12, letterSpacing: '0.08em',
          textTransform: 'uppercase', marginBottom: 20,
          opacity: 0, animation: 'heroFadeUp 0.6s 0.2s cubic-bezier(0.16,1,0.3,1) forwards',
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.red, animation: 'pulseGlow 2s infinite' }} />
          {tag}
        </span>
        <h1 style={{
          fontFamily: F.heading, fontWeight: 900, fontSize: 'clamp(2.2rem, 5vw, 3.6rem)',
          color: C.white, lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: 16,
          opacity: 0, animation: 'heroFadeUp 0.7s 0.35s cubic-bezier(0.16,1,0.3,1) forwards',
        }}>
          {title}{' '}
          {highlight && (
            <span className="animated-gradient" style={{
              background: `linear-gradient(135deg, ${C.redLight}, ${C.amber}, ${C.redLight})`,
              backgroundSize: '200% 200%', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>{highlight}</span>
          )}
        </h1>
        {subtitle && (
          <p style={{
            fontSize: 18, color: 'rgba(255,255,255,0.55)', lineHeight: 1.75,
            maxWidth: 600, opacity: 0,
            animation: 'heroFadeUp 0.7s 0.5s cubic-bezier(0.16,1,0.3,1) forwards',
          }}>{subtitle}</p>
        )}
      </div>
    </section>
  );
}
