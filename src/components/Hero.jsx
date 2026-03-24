import { useEffect, useRef, useState } from 'react';
import { heroContent } from '../data/content';
import { C, F, useCountUp } from '../hooks/useAnimations';
import { MapPin, ArrowRight, ChevronDown } from 'lucide-react';

function HeroStat({ number, suffix, label, delay }) {
  const { ref, count } = useCountUp(number, 2200);
  return (
    <div ref={ref} style={{ textAlign: 'center', opacity: 0, animation: `heroFadeUp 0.7s ${delay}s cubic-bezier(0.16,1,0.3,1) forwards` }}>
      <div style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.6rem)', fontFamily: F.heading, fontWeight: 800, color: C.white, letterSpacing: '-0.02em' }}>{count}{suffix}</div>
      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 6, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
    </div>
  );
}

export default function Hero() {
  const [loaded, setLoaded] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => { setTimeout(() => setLoaded(true), 300); }, []);

  // Scroll parallax for video
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const fn = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const parallaxOffset = Math.min(scrollY * 0.25, 180);

  return (
    <section style={{
      position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden', background: '#0a0c14',
    }}>
      {/* Poster image (fallback while YouTube loads) */}
      <img
        src={heroContent.videoPoster}
        alt=""
        style={{
          position: 'absolute', inset: '-8%', width: '116%', height: '116%',
          objectFit: 'cover', zIndex: 0,
          opacity: videoReady ? 0 : 1,
          transition: 'opacity 1.5s ease-out',
          transform: `translateY(${parallaxOffset}px)`,
        }}
      />

      {/* YouTube video background */}
      <div style={{
        position: 'absolute', inset: '-20%', zIndex: 0,
        overflow: 'hidden',
        opacity: videoReady ? 1 : 0,
        transition: 'opacity 1.5s ease-out',
        transform: `translateY(${parallaxOffset * 0.6}px)`,
        pointerEvents: 'none',
      }}>
        <iframe
          ref={videoRef}
          src="https://www.youtube.com/embed/PUkAIAIzA0I?autoplay=1&mute=1&loop=1&playlist=PUkAIAIzA0I&controls=0&showinfo=0&modestbranding=1&disablekb=1&fs=0&iv_load_policy=3&rel=0&start=2&playsinline=1&enablejsapi=1"
          title=""
          allow="autoplay; encrypted-media"
          style={{
            position: 'absolute',
            top: '50%', left: '50%',
            width: '140vw', height: '140vh',
            minWidth: '177.78vh', minHeight: '56.25vw',
            transform: 'translate(-50%, -50%)',
            border: 'none',
          }}
          onLoad={() => setTimeout(() => setVideoReady(true), 1500)}
        />
      </div>

      {/* Heavy overlay for legibility — layered gradients */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1,
        background: `
          radial-gradient(ellipse 80% 60% at 50% 40%, rgba(10,12,20,0.45) 0%, rgba(10,12,20,0.8) 100%),
          linear-gradient(180deg, rgba(10,12,20,0.35) 0%, rgba(10,12,20,0.65) 55%, rgba(10,12,20,0.92) 100%)
        `,
      }} />

      {/* Subtle noise texture */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1,
        opacity: 0.025,
        backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
        backgroundSize: '128px 128px',
        pointerEvents: 'none',
      }} />

      {/* Decorative vertical lines */}
      <div style={{
        position: 'absolute', top: 0, left: '20%', width: 1, height: '100%',
        background: 'linear-gradient(180deg, transparent, rgba(255,255,255,0.04) 30%, rgba(255,255,255,0.04) 70%, transparent)',
        zIndex: 1, pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', top: 0, right: '20%', width: 1, height: '100%',
        background: 'linear-gradient(180deg, transparent, rgba(255,255,255,0.04) 30%, rgba(255,255,255,0.04) 70%, transparent)',
        zIndex: 1, pointerEvents: 'none',
      }} />

      {/* Glassmorphism card */}
      <div style={{
        position: 'relative', zIndex: 10, width: '100%',
        maxWidth: 780, margin: '0 auto', padding: '0 24px',
      }}>
        <div className="hero-glass" style={{
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(40px) saturate(1.5)',
          WebkitBackdropFilter: 'blur(40px) saturate(1.5)',
          borderRadius: 32, padding: 'clamp(32px, 5vw, 56px)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
          textAlign: 'center',
          transform: loaded ? 'translateY(0)' : 'translateY(30px)',
          opacity: loaded ? 1 : 0,
          transition: 'transform 1s 0.3s cubic-bezier(0.16,1,0.3,1), opacity 1s 0.3s',
        }}>
          {/* Tag */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '7px 18px', borderRadius: 9999,
            background: 'rgba(196,30,36,0.12)', border: '1px solid rgba(196,30,36,0.2)',
            marginBottom: 28,
            opacity: 0, animation: loaded ? 'heroFadeUp 0.6s 0.6s cubic-bezier(0.16,1,0.3,1) forwards' : 'none',
          }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: C.red, animation: 'pulseGlow 2s infinite' }} />
            <span style={{
              fontFamily: F.heading, fontWeight: 600, fontSize: 11, letterSpacing: '0.1em',
              textTransform: 'uppercase', color: C.redLight,
            }}>{heroContent.tag}</span>
          </div>

          {/* Title */}
          <h1 style={{
            fontFamily: F.heading, fontWeight: 900, color: C.white,
            fontSize: 'clamp(2rem, 6vw, 3.8rem)', lineHeight: 1.08,
            letterSpacing: '-0.025em', marginBottom: 20,
            opacity: 0, animation: loaded ? 'heroFadeUp 0.7s 0.75s cubic-bezier(0.16,1,0.3,1) forwards' : 'none',
          }}>
            {heroContent.title}<br />
            <span style={{
              background: `linear-gradient(135deg, ${C.redLight}, ${C.amber}, ${C.redLight})`,
              backgroundSize: '200% 200%',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              animation: 'gradientShift 4s ease infinite',
            }}>{heroContent.titleHighlight}</span>
          </h1>

          {/* Subtitle */}
          <p style={{
            fontSize: 'clamp(0.95rem, 1.8vw, 1.1rem)',
            color: 'rgba(255,255,255,0.55)', lineHeight: 1.8,
            maxWidth: 520, margin: '0 auto 36px', fontWeight: 300,
            opacity: 0, animation: loaded ? 'heroFadeUp 0.7s 0.9s cubic-bezier(0.16,1,0.3,1) forwards' : 'none',
          }}>{heroContent.subtitle}</p>

          {/* CTAs */}
          <div style={{
            display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap',
            marginBottom: 40,
            opacity: 0, animation: loaded ? 'heroFadeUp 0.7s 1.05s cubic-bezier(0.16,1,0.3,1) forwards' : 'none',
          }}>
            <a href="#cta" className="glow-btn" style={{
              padding: '16px 32px', borderRadius: 16, color: C.white,
              fontFamily: F.heading, fontWeight: 700, fontSize: 15,
              background: `linear-gradient(135deg, ${C.red}, ${C.redLight})`,
              boxShadow: '0 8px 32px rgba(196,30,36,0.4)',
              transition: 'all 0.3s', display: 'inline-flex', alignItems: 'center', gap: 8,
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 14px 44px rgba(196,30,36,0.5)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(196,30,36,0.4)'; }}
            >
              {heroContent.ctaPrimary}
              <ArrowRight size={16} />
            </a>
            <a href="#locations" style={{
              padding: '16px 32px', borderRadius: 16, color: C.white,
              fontFamily: F.heading, fontWeight: 600, fontSize: 15,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.15)',
              backdropFilter: 'blur(8px)', transition: 'all 0.3s',
              display: 'inline-flex', alignItems: 'center', gap: 8,
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}
            >
              <MapPin size={16} />
              {heroContent.ctaSecondary}
            </a>
          </div>

          {/* Stats */}
          <div style={{
            borderTop: '1px solid rgba(255,255,255,0.08)',
            paddingTop: 28,
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12,
          }}>
            {heroContent.stats.map((s, i) => (
              <HeroStat key={i} number={s.number} suffix={s.suffix} label={s.label} delay={1.2 + i * 0.15} />
            ))}
          </div>
        </div>
      </div>

      {/* Scroll hint */}
      <div style={{
        position: 'absolute', bottom: 36, left: '50%', transform: 'translateX(-50%)',
        zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
        opacity: loaded ? 0.4 : 0, transition: 'opacity 1s 2s',
      }}>
        <span style={{ fontFamily: F.heading, fontSize: 10, color: C.white, textTransform: 'uppercase', letterSpacing: '0.15em' }}>Scroll</span>
        <ChevronDown size={16} color={C.white} style={{ animation: 'scrollIndicator 1.5s ease-in-out infinite' }} />
      </div>
    </section>
  );
}
