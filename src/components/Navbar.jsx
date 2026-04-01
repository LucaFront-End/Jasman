import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { navLinks } from '../data/content';
import { C, F } from '../hooks/useAnimations';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [hovered, setHovered] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [location]);

  const isHome = location.pathname === '/';

  const renderLink = (l, i, mobile = false) => {
    const isHash = l.href.startsWith('#');
    const isExternal = l.external;
    const baseStyle = mobile ? {
      padding: '14px 24px', fontSize: 16, fontWeight: 600, fontFamily: F.heading,
      color: C.navy, display: 'block', borderBottom: `1px solid ${C.border}`,
    } : {
      padding: '8px 18px', borderRadius: 9999, fontSize: 14, fontWeight: 500,
      color: scrolled
        ? (hovered === i ? C.red : 'rgba(45,45,45,0.7)')
        : (hovered === i ? C.white : 'rgba(255,255,255,0.7)'),
      background: hovered === i ? (scrolled ? 'rgba(196,30,36,0.06)' : 'rgba(255,255,255,0.08)') : 'transparent',
      transition: 'all 0.3s ease',
    };

    if (isExternal) {
      return <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer"
        onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}
        style={baseStyle}>{l.label}</a>;
    }
    if (isHash) {
      if (!isHome) {
        return <Link key={l.label} to={`/${l.href}`}
          onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}
          style={baseStyle}>{l.label}</Link>;
      }
      return <a key={l.label} href={l.href}
        onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}
        style={baseStyle}>{l.label}</a>;
    }
    return <Link key={l.label} to={l.href}
      onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}
      style={baseStyle}>{l.label}</Link>;
  };

  return (
    <>
      <nav className={scrolled ? 'nav-scrolled' : ''} style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        padding: '20px 24px', background: 'transparent',
        transition: 'all 0.5s cubic-bezier(0.16,1,0.3,1)',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
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
          </Link>
          {/* Desktop nav */}
          <div className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {navLinks.map((l, i) => renderLink(l, i))}
            <Link to="/servicios" className="glow-btn" style={{
              marginLeft: 16, padding: '11px 24px', borderRadius: 9999,
              background: scrolled ? C.red : 'rgba(255,255,255,0.12)',
              border: scrolled ? '1px solid transparent' : '1px solid rgba(255,255,255,0.2)',
              color: C.white, fontFamily: F.heading, fontWeight: 600, fontSize: 14,
              transition: 'all 0.4s cubic-bezier(0.16,1,0.3,1)',
              boxShadow: scrolled ? '0 4px 20px rgba(196,30,36,0.3)' : 'none',
            }}>Agenda tu Cita →</Link>
          </div>
          {/* Mobile hamburger */}
          <button className="mobile-menu-btn" onClick={() => setMobileOpen(!mobileOpen)} style={{
            display: 'none', background: 'none', border: 'none',
            color: scrolled ? C.navy : C.white, padding: 8, cursor: 'pointer',
          }}>
            {mobileOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999,
          background: 'rgba(255,255,255,0.98)', backdropFilter: 'blur(20px)',
          paddingTop: 80, animation: 'heroFadeUp 0.3s ease',
        }}>
          <div style={{ padding: '0 24px' }}>
            {navLinks.map((l, i) => renderLink(l, i, true))}
            <Link to="/servicios" style={{
              display: 'block', marginTop: 24, padding: '16px 24px', borderRadius: 16,
              background: C.red, color: C.white, fontFamily: F.heading, fontWeight: 700,
              fontSize: 16, textAlign: 'center',
            }}>Agenda tu Cita →</Link>
          </div>
        </div>
      )}
    </>
  );
}
