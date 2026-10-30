import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { C, F } from '../../hooks/useAnimations';
import { useTiendaState, triggerTiendaUI } from '../../hooks/useTiendaState';
import TiendaMostRequestedSection from './TiendaMostRequestedSection';
import { ShoppingBag, User, Sparkles, Menu, X, ChevronDown, Truck } from 'lucide-react';

const SHIPPING_TICKER_ITEMS = [
  'ENVÍO GRATIS EN TODA LA REPÚBLICA MEXICANA',
  'AGREGA MÁS Y OBTÉN DESCUENTO: −5% EN PAR · −10% EN JUEGO DE 4 LLANTAS',
  'INSTALACIÓN CERTIFICADA EN +80 SUCURSALES JASMAN',
  '−10% ADICIONAL EN TU PRIMERA COMPRA (CÓDIGO: JASMAN10)',
  'GARANTÍA OFICIAL DIRECTA DE FÁBRICA',
];

export default function TiendaNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const { cartCount, user, coupon } = useTiendaState();
  const { pathname } = useLocation();

  const isProductPage = pathname.includes('/producto/');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 36);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navItems = [
    { label: 'Experiencia', href: '/landing-tienda-preview#hero-stage' },
    { label: 'Medidas más pedidas', href: '/landing-tienda-preview#catalogo-tienda', hasMega: true },
    { label: 'Marcas', href: '/landing-tienda-preview#marcas-tienda', hasMega: true },
    { label: 'Catálogo', href: '/landing-tienda-preview#catalogo-tienda' },
    { label: 'Cuenta', href: '/landing-tienda-preview#seccion-usuario' },
  ];

  return (
    <header
      onMouseLeave={() => setMegaOpen(false)}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        pointerEvents: 'none',
      }}
    >
      {/* Top Circulating "Envío Gratis" Legend Bar */}
      <div
        style={{
          width: '100%',
          height: scrolled ? 0 : 28,
          opacity: scrolled ? 0 : 1,
          background: C.navy,
          color: '#FFFFFF',
          borderBottom: scrolled ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          pointerEvents: scrolled ? 'none' : 'auto',
          position: 'relative',
          transition: 'height 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: 48,
            background: 'linear-gradient(90deg, #1A1F36 0%, rgba(26,31,54,0) 100%)',
            zIndex: 2,
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: 0,
            bottom: 0,
            width: 48,
            background: 'linear-gradient(270deg, #1A1F36 0%, rgba(26,31,54,0) 100%)',
            zIndex: 2,
            pointerEvents: 'none',
          }}
        />

        <div className="tienda-shipping-marquee-track">
          {[...Array(3)].map((_, loopIdx) => (
            <div
              key={loopIdx}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 28,
                paddingRight: 28,
                whiteSpace: 'nowrap',
              }}
            >
              {SHIPPING_TICKER_ITEMS.map((text, idx) => (
                <span
                  key={`${loopIdx}-${idx}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    fontFamily: F.heading,
                    fontSize: 9.5,
                    fontWeight: 800,
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    color: idx === 0 ? '#FFFFFF' : 'rgba(255, 255, 255, 0.85)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {idx === 0 ? (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '2px 7px',
                        borderRadius: 9999,
                        background: C.red,
                        color: '#FFFFFF',
                        fontSize: 8.5,
                        fontWeight: 900,
                        letterSpacing: '0.12em',
                        gap: 4,
                      }}
                    >
                      <Truck size={10} /> ENVÍO GRATIS
                    </span>
                  ) : (
                    <span
                      style={{
                        width: 4,
                        height: 4,
                        borderRadius: '50%',
                        background: C.red,
                        display: 'inline-block',
                      }}
                    />
                  )}
                  <span>{text}</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Main Floating Apple-Style Glass Pill Navbar */}
      <div
        style={{
          padding: scrolled ? '10px 20px 0' : '10px 20px 0',
          transition: 'padding 0.45s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <div
          style={{
            maxWidth: scrolled ? 1140 : 1240,
            margin: '0 auto',
            padding: scrolled ? '9px 16px 9px 20px' : '10px 18px 10px 22px',
            borderRadius: 9999,
            background: 'rgba(255, 255, 255, 0.92)',
            backdropFilter: 'saturate(180%) blur(24px)',
            WebkitBackdropFilter: 'saturate(180%) blur(24px)',
            border: '1px solid rgba(26, 31, 54, 0.08)',
            boxShadow: scrolled
              ? '0 18px 44px rgba(26, 31, 54, 0.09)'
              : '0 10px 28px rgba(26, 31, 54, 0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 14,
            pointerEvents: 'auto',
            transition: 'all 0.55s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {/* Left: Official Jasman Logo */}
          <Link
            to="/landing-tienda-preview"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              textDecoration: 'none',
              flexShrink: 0,
              whiteSpace: 'nowrap',
            }}
          >
            <img
              src="/images/logo/logo-01.png"
              alt="Jasman Automotriz"
              style={{
                height: 30,
                width: 'auto',
                objectFit: 'contain',
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontFamily: F.heading,
                fontSize: 9.5,
                fontWeight: 800,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: C.red,
                borderLeft: '1px solid rgba(26, 31, 54, 0.12)',
                paddingLeft: 10,
                whiteSpace: 'nowrap',
              }}
            >
              Tienda
            </span>
          </Link>

          {/* Center: Minimalist Apple-style navigation (strictly single-line nowrap) */}
          <nav
            className="tienda-apple-nav"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              flex: 1,
              minWidth: 0,
            }}
          >
            {navItems.map((item) => {
              const isLocalAnchor =
                item.href.startsWith('/landing-tienda-preview#') &&
                pathname === '/landing-tienda-preview';
              const linkStyle = {
                padding: '7px 13px',
                borderRadius: 9999,
                fontFamily: F.heading,
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: '-0.01em',
                color: C.navy,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                whiteSpace: 'nowrap',
                flexShrink: 0,
                transition: 'all 0.25s ease',
              };

              const handleEnter = (e) => {
                e.currentTarget.style.background = 'rgba(196, 30, 36, 0.07)';
                e.currentTarget.style.color = C.red;
                if (item.hasMega) setMegaOpen(true);
              };

              const handleLeave = (e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = C.navy;
              };

              return isLocalAnchor ? (
                <a
                  key={item.label}
                  href={item.href.replace('/landing-tienda-preview', '')}
                  style={linkStyle}
                  onMouseEnter={handleEnter}
                  onMouseLeave={handleLeave}
                  onClick={() => setMegaOpen(false)}
                >
                  <span>{item.label}</span>
                  {item.hasMega && <ChevronDown size={12} />}
                </a>
              ) : (
                <Link
                  key={item.label}
                  to={item.href}
                  style={linkStyle}
                  onMouseEnter={handleEnter}
                  onMouseLeave={handleLeave}
                  onClick={() => setMegaOpen(false)}
                >
                  <span>{item.label}</span>
                  {item.hasMega && <ChevronDown size={12} />}
                </Link>
              );
            })}
          </nav>

          {/* Right: Minimalist Action Pills (strictly single-line nowrap) */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              flexShrink: 0,
            }}
          >
            {!isProductPage && (
              <button
                type="button"
                onClick={() => triggerTiendaUI({ type: 'OPEN_COUPON' })}
                className="tienda-apple-coupon"
                style={{
                  padding: '7px 13px',
                  borderRadius: 9999,
                  border: coupon
                    ? '1px solid rgba(22, 163, 74, 0.25)'
                    : '1px solid rgba(196, 30, 36, 0.22)',
                  background: coupon
                    ? 'rgba(22, 163, 74, 0.1)'
                    : 'rgba(196, 30, 36, 0.08)',
                  color: coupon ? '#15803D' : C.red,
                  fontFamily: F.heading,
                  fontSize: 10.5,
                  fontWeight: 800,
                  letterSpacing: '0.04em',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  transition: 'all 0.25s ease',
                }}
              >
                <Sparkles size={12} />
                <span>{coupon ? '10% Activo' : '−10% 1ª Compra'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => triggerTiendaUI({ type: 'OPEN_USER' })}
              aria-label="Mi Cuenta"
              style={{
                padding: '7px 13px',
                borderRadius: 9999,
                border: user
                  ? '1px solid rgba(22, 163, 74, 0.24)'
                  : '1px solid rgba(26, 31, 54, 0.08)',
                background: user ? 'rgba(22, 163, 74, 0.07)' : '#F8F9FA',
                color: C.navy,
                fontFamily: F.heading,
                fontSize: 11.5,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                whiteSpace: 'nowrap',
                flexShrink: 0,
                transition: 'all 0.25s ease',
              }}
            >
              <User size={14} color={user ? '#16A34A' : C.red} />
              <span className="tienda-apple-user-txt">
                {user ? user.nombre.split(' ')[0] : 'Cuenta'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => triggerTiendaUI({ type: 'OPEN_CART' })}
              aria-label="Abrir carrito"
              style={{
                padding: '7px 14px',
                borderRadius: 9999,
                border: 'none',
                background: C.red,
                color: C.white,
                fontFamily: F.heading,
                fontSize: 11.5,
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                whiteSpace: 'nowrap',
                flexShrink: 0,
                boxShadow: '0 6px 20px rgba(196, 30, 36, 0.3)',
                transition: 'transform 0.25s ease',
              }}
            >
              <ShoppingBag size={13} />
              <span>{cartCount}</span>
            </button>

            <button
              type="button"
              onClick={() => setMobileMenu((v) => !v)}
              className="tienda-apple-burger"
              style={{
                display: 'none',
                width: 34,
                height: 34,
                borderRadius: '50%',
                border: '1px solid rgba(26,31,54,0.08)',
                background: '#F8F9FA',
                color: C.navy,
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              {mobileMenu ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>
        </div>
      </div>

      {/* Frosted Glass Mega-Menu Dropdown for Medidas más pedidas, Marcas más pedidas & Llantas más pedidas */}
      {megaOpen && (
        <div
          onMouseEnter={() => setMegaOpen(true)}
          onMouseLeave={() => setMegaOpen(false)}
          style={{
            maxWidth: 1060,
            margin: '10px auto 0',
            padding: '28px 32px',
            borderRadius: 28,
            background: 'rgba(255, 255, 255, 0.96)',
            backdropFilter: 'saturate(180%) blur(28px)',
            WebkitBackdropFilter: 'saturate(180%) blur(28px)',
            border: '1px solid rgba(26, 31, 54, 0.08)',
            boxShadow: '0 32px 70px rgba(26, 31, 54, 0.14)',
            pointerEvents: 'auto',
            animation: 'heroFadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <TiendaMostRequestedSection
            isCompactDropdown
            onAfterSelect={() => setMegaOpen(false)}
          />
        </div>
      )}

      {/* Mobile Glass Dropdown */}
      {mobileMenu && (
        <div
          style={{
            maxWidth: 420,
            margin: '10px auto 0',
            padding: '16px 22px',
            borderRadius: 24,
            background: 'rgba(255, 255, 255, 0.96)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(26, 31, 54, 0.08)',
            boxShadow: '0 20px 50px rgba(26, 31, 54, 0.12)',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            pointerEvents: 'auto',
          }}
        >
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={() => setMobileMenu(false)}
              style={{
                fontFamily: F.heading,
                fontSize: 13,
                fontWeight: 700,
                color: C.navy,
                textDecoration: 'none',
                padding: '6px 0',
              }}
            >
              {item.label}
            </a>
          ))}
        </div>
      )}

      <style>{`
        @keyframes tiendaFreeShippingScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.3333%); }
        }
        .tienda-shipping-marquee-track {
          display: flex;
          width: max-content;
          animation: tiendaFreeShippingScroll 34s linear infinite;
        }
        .tienda-shipping-marquee-track:hover {
          animation-play-state: paused;
        }
        @media (max-width: 960px) {
          .tienda-apple-nav { display: none !important; }
          .tienda-apple-burger { display: inline-flex !important; }
        }
        @media (max-width: 560px) {
          .tienda-apple-coupon, .tienda-apple-user-txt { display: none !important; }
        }
      `}</style>
    </header>
  );
}
