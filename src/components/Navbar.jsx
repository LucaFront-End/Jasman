import { useState, useEffect } from 'react';
import { navLinks } from '../data/content';
import { C, F } from '../hooks/useAnimations';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [hovered, setHovered] = useState(null);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <nav className={scrolled ? 'nav-scrolled' : ''} style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
      padding: '20px 24px', background: 'transparent',
      transition: 'all 0.5s cubic-bezier(0.16,1,0.3,1)',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <a href="#" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 12,
            background: scrolled ? C.red : 'rgba(255,255,255,0.12)',
            color: C.white, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: F.heading, fontWeight: 900, fontSize: 18,
            transition: 'all 0.5s cubic-bezier(0.16,1,0.3,1)',
            boxShadow: scrolled ? '0 4px 16px rgba(196,30,36,0.3)' : 'none',
          }}>J</div>
          <span style={{
            fontFamily: F.heading, fontWeight: 800, fontSize: 22, letterSpacing: '0.02em',
            color: scrolled ? C.navy : C.white, transition: 'color 0.5s',
          }}>JASMAN</span>
        </a>
        <div className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {navLinks.map((l, i) => (
            <a key={l.label} href={l.href}
              onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}
              style={{
                padding: '8px 18px', borderRadius: 9999, fontSize: 14, fontWeight: 500,
                color: scrolled
                  ? (hovered === i ? C.red : 'rgba(45,45,45,0.7)')
                  : (hovered === i ? C.white : 'rgba(255,255,255,0.7)'),
                background: hovered === i ? (scrolled ? 'rgba(196,30,36,0.06)' : 'rgba(255,255,255,0.08)') : 'transparent',
                transition: 'all 0.3s ease',
              }}>{l.label}</a>
          ))}
          <a href="#cta" className="glow-btn" style={{
            marginLeft: 16, padding: '11px 24px', borderRadius: 9999,
            background: scrolled ? C.red : 'rgba(255,255,255,0.12)',
            border: scrolled ? '1px solid transparent' : '1px solid rgba(255,255,255,0.2)',
            color: C.white, fontFamily: F.heading, fontWeight: 600, fontSize: 14,
            transition: 'all 0.4s cubic-bezier(0.16,1,0.3,1)',
            boxShadow: scrolled ? '0 4px 20px rgba(196,30,36,0.3)' : 'none',
          }}>Agenda tu Cita →</a>
        </div>
      </div>
    </nav>
  );
}
