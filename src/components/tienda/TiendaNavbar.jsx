import { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { C, F } from '../../hooks/useAnimations';
import { useTiendaState, triggerTiendaUI } from '../../hooks/useTiendaState';
import {
  MOST_REQUESTED_MEASURES,
  ALL_OFFICIAL_MENU_BRANDS,
  VEHICLE_TYPE_OPTIONS,
  POPULAR_CAR_MODELS,
  BRAND_META,
  useWixCatalogProducts,
  formatMXN,
} from '../../data/productosMasterData';
import TiendaMostRequestedSection from './TiendaMostRequestedSection';
import TiendaVehicleSvg from './TiendaVehicleTypeIcons';
import {
  ShoppingBag,
  User,
  Sparkles,
  Menu,
  X,
  ChevronDown,
  Truck,
  Search,
  ArrowRight,
  ArrowUpRight,
} from 'lucide-react';

const SHIPPING_TICKER_ITEMS = [
  'ENVÍO GRATIS EN TODA LA REPÚBLICA MEXICANA',
  'AGREGA MÁS Y OBTÉN DESCUENTO: −5% EN PAR · −10% EN JUEGO DE 4 LLANTAS',
  'INSTALACIÓN CERTIFICADA EN +80 SUCURSALES JASMAN',
  '−10% ADICIONAL EN TU PRIMERA COMPRA (CÓDIGO: JASMAN10)',
  'GARANTÍA OFICIAL DIRECTA DE FÁBRICA',
];

function normalizeMeasureToken(raw) {
  const compact = String(raw || '')
    .toUpperCase()
    .trim();
  const match = compact.match(/(\d{3})[\s/-]*(\d{2})[\s/-]*R?(\d{2})/i);
  if (match) {
    return `${match[1]}/${match[2]}R${match[3]}`;
  }
  return compact;
}

export default function TiendaNavbar({ legacyMode = false }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [mobileAccordion, setMobileAccordion] = useState(null); // 'brands' | 'measures' | null
  const [megaOpen, setMegaOpen] = useState(false);
  const [megaMode, setMegaMode] = useState('all');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const closeMegaTimerRef = useRef(null);
  const searchInputRef = useRef(null);

  const { cartCount, user, coupon } = useTiendaState();
  const { products: catalogProducts } = useWixCatalogProducts();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const openMegaMenu = (nextMode) => {
    if (closeMegaTimerRef.current) {
      clearTimeout(closeMegaTimerRef.current);
      closeMegaTimerRef.current = null;
    }
    if (typeof nextMode === 'string') {
      setMegaMode(nextMode);
    }
    setSearchOpen(false);
    setMegaOpen(true);
  };

  const scheduleCloseMegaMenu = () => {
    if (closeMegaTimerRef.current) {
      clearTimeout(closeMegaTimerRef.current);
    }
    closeMegaTimerRef.current = setTimeout(() => {
      setMegaOpen(false);
    }, 320);
  };

  useEffect(() => {
    return () => {
      if (closeMegaTimerRef.current) clearTimeout(closeMegaTimerRef.current);
    };
  }, []);

  // Auto-focus search input when opened
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      const t = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 60);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [searchOpen]);

  // Keyboard shortcuts: Cmd/Ctrl + K to toggle search, Escape to dismiss overlays
  useEffect(() => {
    if (legacyMode) return undefined;
    const onKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setMegaOpen(false);
        setMobileMenu(false);
        setSearchOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setSearchOpen(false);
        setMegaOpen(false);
        setMobileMenu(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [legacyMode]);

  const isProductPage = pathname.includes('/producto/');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 36);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navItems = legacyMode
    ? [
        { label: 'Experiencia', href: '/landing-tienda-preview-copia#hero-stage' },
        {
          label: 'Medidas más pedidas',
          href: '/landing-tienda-preview/catalogo',
          hasMega: true,
          megaMode: 'all',
        },
        {
          label: 'Marcas',
          href: '/landing-tienda-preview/catalogo',
          hasMega: true,
          megaMode: 'all',
        },
        { label: 'Catálogo', href: '/landing-tienda-preview/catalogo' },
        { label: 'Cuenta', href: '/landing-tienda-preview/cuenta', isAccount: true },
      ]
    : [
        { label: 'Inicio', href: '/landing-tienda-preview#hero-stage' },
        { label: 'Catálogo', href: '/landing-tienda-preview/catalogo' },
        {
          label: 'Marcas',
          href: '/landing-tienda-preview/catalogo',
          hasMega: true,
          megaMode: 'brands',
        },
        {
          label: 'Top Medidas',
          href: '/landing-tienda-preview/catalogo',
          hasMega: true,
          megaMode: 'measures',
        },
        { label: 'Cuenta', href: '/landing-tienda-preview/cuenta', isAccount: true },
      ];

  // Live instant search matches (measures, brands, vehicle types, and compatible car models)
  const searchMatches = useMemo(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed) return [];
    const lower = trimmed.toLowerCase();
    const normalizedMeasure = normalizeMeasureToken(trimmed).toLowerCase();
    const tokens = lower.split(/\s+/).filter(Boolean);

    return catalogProducts.filter((p) => {
      const haystack = [
        p.cleanTitle,
        p.title,
        p.brand,
        p.model,
        p.measure,
        p.rim,
        p.reference,
        ...(Array.isArray(p.vehicleTypes) ? p.vehicleTypes : [p.vehicleType]),
        ...(Array.isArray(p.compatibleModels) ? p.compatibleModels : []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      if (normalizedMeasure && haystack.includes(normalizedMeasure)) {
        return true;
      }
      return tokens.every((tok) => haystack.includes(tok));
    });
  }, [catalogProducts, searchQuery]);

  const handleQuickVehicle = (vehicleId) => {
    setSearchOpen(false);
    setMobileMenu(false);
    setSearchQuery('');
    navigate(
      `/landing-tienda-preview/catalogo?vehicle=${encodeURIComponent(vehicleId)}`
    );
    setTimeout(() => {
      triggerTiendaUI({ type: 'FILTER_CATALOG', vehicle: vehicleId });
    }, 80);
  };

  const handleQuickCarModel = (carModelObj) => {
    setSearchOpen(false);
    setMobileMenu(false);
    setSearchQuery('');
    navigate(
      `/landing-tienda-preview/catalogo?vehicle=${encodeURIComponent(
        carModelObj.vehicle
      )}&carModel=${encodeURIComponent(carModelObj.id)}`
    );
    setTimeout(() => {
      triggerTiendaUI({
        type: 'FILTER_CATALOG',
        vehicle: carModelObj.vehicle,
        carModel: carModelObj.id,
      });
    }, 80);
  };

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      setSearchOpen(false);
      navigate('/landing-tienda-preview/catalogo');
      return;
    }
    const queryValue = normalizeMeasureToken(trimmed).includes('/')
      ? normalizeMeasureToken(trimmed)
      : trimmed;
    setSearchOpen(false);
    setMobileMenu(false);
    navigate(`/landing-tienda-preview/catalogo?q=${encodeURIComponent(queryValue)}`);
    setTimeout(() => {
      triggerTiendaUI({ type: 'FILTER_CATALOG', measure: queryValue });
    }, 80);
  };

  const handleQuickMeasure = (rawMeasure) => {
    setSearchOpen(false);
    setMobileMenu(false);
    setSearchQuery('');
    navigate(
      `/landing-tienda-preview/catalogo?measure=${encodeURIComponent(rawMeasure)}`
    );
    setTimeout(() => {
      triggerTiendaUI({ type: 'FILTER_CATALOG', measure: rawMeasure });
    }, 80);
  };

  const handleQuickBrand = (brandName) => {
    setSearchOpen(false);
    setMobileMenu(false);
    setSearchQuery('');
    navigate(
      `/landing-tienda-preview/catalogo?brand=${encodeURIComponent(brandName)}`
    );
    setTimeout(() => {
      triggerTiendaUI({ type: 'FILTER_CATALOG', brand: brandName });
    }, 80);
  };

  const handleAccountAction = (e) => {
    setMegaOpen(false);
    setMobileMenu(false);
    setSearchOpen(false);
    if (!user) {
      e.preventDefault();
      triggerTiendaUI({ type: 'OPEN_AUTH', redirectToAccount: true });
    }
  };

  return (
    <header
      onMouseEnter={() => {
        if (closeMegaTimerRef.current) {
          clearTimeout(closeMegaTimerRef.current);
          closeMegaTimerRef.current = null;
        }
      }}
      onMouseLeave={scheduleCloseMegaMenu}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        pointerEvents: 'none',
      }}
    >
      {/* Subtle Click-Away Backdrop when Search or Mobile Menu is Open */}
      {(searchOpen || mobileMenu) && (
        <div
          aria-hidden="true"
          onClick={() => {
            setSearchOpen(false);
            setMobileMenu(false);
          }}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 20, 36, 0.22)',
            backdropFilter: 'blur(3px)',
            WebkitBackdropFilter: 'blur(3px)',
            zIndex: 1,
            pointerEvents: 'auto',
          }}
        />
      )}

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
          zIndex: 3,
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
        className="tienda-apple-pill-outer"
        style={{
          position: 'relative',
          zIndex: 3,
          padding: '10px 20px 0',
          transition: 'padding 0.45s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <div
          className="tienda-apple-pill-inner"
          style={{
            maxWidth: scrolled ? 1160 : 1260,
            margin: '0 auto',
            padding: scrolled ? '9px 16px 9px 20px' : '10px 18px 10px 22px',
            borderRadius: 9999,
            background: 'rgba(255, 255, 255, 0.94)',
            backdropFilter: 'saturate(180%) blur(24px)',
            WebkitBackdropFilter: 'saturate(180%) blur(24px)',
            border: '1px solid rgba(26, 31, 54, 0.08)',
            boxShadow: scrolled
              ? '0 18px 44px rgba(26, 31, 54, 0.09)'
              : '0 10px 28px rgba(26, 31, 54, 0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            pointerEvents: 'auto',
            transition: 'all 0.55s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {/* Left: Official Jasman Logo */}
          <Link
            to={legacyMode ? '/landing-tienda-preview-copia' : '/landing-tienda-preview'}
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
              className="tienda-apple-logo-img"
              style={{
                height: 30,
                width: 'auto',
                objectFit: 'contain',
                flexShrink: 0,
              }}
            />
            <span
              className="tienda-apple-logo-badge"
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
              const isMegaActive =
                megaOpen && item.hasMega && !legacyMode && megaMode === item.megaMode;
              const linkStyle = {
                padding: '7px 13px',
                borderRadius: 9999,
                fontFamily: F.heading,
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: '-0.01em',
                background: isMegaActive ? C.red : 'transparent',
                color: isMegaActive ? C.white : C.navy,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                whiteSpace: 'nowrap',
                flexShrink: 0,
                transition: 'all 0.25s ease',
              };

              const handleEnter = (e) => {
                if (!isMegaActive) {
                  e.currentTarget.style.background = 'rgba(196, 30, 36, 0.07)';
                  e.currentTarget.style.color = C.red;
                }
                if (item.hasMega) {
                  openMegaMenu(item.megaMode || 'all');
                } else {
                  scheduleCloseMegaMenu();
                }
              };

              const handleLeave = (e) => {
                if (!isMegaActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = C.navy;
                }
                if (item.hasMega) {
                  scheduleCloseMegaMenu();
                }
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
                  onClick={
                    item.isAccount ? handleAccountAction : () => setMegaOpen(false)
                  }
                >
                  <span>{item.label}</span>
                  {item.hasMega && <ChevronDown size={12} />}
                </Link>
              );
            })}
          </nav>

          {/* Right: Minimalist Search + Account + Cart + Mobile Burger */}
          <div
            className="tienda-apple-actions"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              flexShrink: 0,
            }}
          >
            {/* Minimalist Header Search Trigger (New Store Experience) */}
            {!legacyMode && (
              <button
                type="button"
                onClick={() => {
                  setMegaOpen(false);
                  setMobileMenu(false);
                  setSearchOpen((v) => !v);
                }}
                aria-label="Buscar llantas por medida, marca o modelo"
                aria-expanded={searchOpen}
                className="tienda-apple-search-btn"
                style={{
                  padding: '7px 13px',
                  borderRadius: 9999,
                  border: searchOpen
                    ? `1px solid ${C.navy}`
                    : '1px solid rgba(26, 31, 54, 0.10)',
                  background: searchOpen ? C.navy : '#F8F9FA',
                  color: searchOpen ? '#FFFFFF' : C.navy,
                  fontFamily: F.heading,
                  fontSize: 11.5,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  transition: 'all 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              >
                <Search size={13.5} color={searchOpen ? '#FFFFFF' : C.red} />
                <span className="tienda-apple-search-txt">Buscar</span>
                <span
                  className="tienda-apple-search-kbd"
                  style={{
                    padding: '1px 5px',
                    borderRadius: 5,
                    background: searchOpen
                      ? 'rgba(255,255,255,0.16)'
                      : 'rgba(26,31,54,0.06)',
                    color: searchOpen ? 'rgba(255,255,255,0.85)' : '#64748B',
                    fontSize: 9,
                    fontWeight: 800,
                    letterSpacing: '0.04em',
                  }}
                >
                  ⌘K
                </span>
              </button>
            )}

            {legacyMode && !isProductPage && (
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

            <Link
              to="/landing-tienda-preview/cuenta"
              onClick={handleAccountAction}
              aria-label="Mi Cuenta"
              className="tienda-apple-account-btn"
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
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
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
            </Link>

            <button
              type="button"
              onClick={() => {
                setSearchOpen(false);
                setMobileMenu(false);
                triggerTiendaUI({ type: 'OPEN_CART' });
              }}
              aria-label="Abrir carrito"
              className="tienda-apple-cart-btn"
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
              onClick={() => {
                setSearchOpen(false);
                setMegaOpen(false);
                setMobileMenu((v) => !v);
              }}
              aria-label={mobileMenu ? 'Cerrar menú' : 'Abrir menú'}
              className="tienda-apple-burger"
              style={{
                display: 'none',
                width: 34,
                height: 34,
                borderRadius: '50%',
                border: '1px solid rgba(26,31,54,0.08)',
                background: mobileMenu ? C.navy : '#F8F9FA',
                color: mobileMenu ? '#FFFFFF' : C.navy,
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

      {/* Minimalist Frosted-Glass Spotlight Search Panel */}
      {!legacyMode && searchOpen && (
        <div
          style={{
            position: 'relative',
            zIndex: 3,
            maxWidth: 780,
            margin: '10px auto 0',
            padding: '0 14px',
            pointerEvents: 'auto',
          }}
        >
          <div
            style={{
              borderRadius: 26,
              background: 'rgba(255, 255, 255, 0.98)',
              backdropFilter: 'saturate(180%) blur(28px)',
              WebkitBackdropFilter: 'saturate(180%) blur(28px)',
              border: '1px solid rgba(26, 31, 54, 0.10)',
              boxShadow: '0 32px 72px rgba(15, 20, 36, 0.20)',
              overflow: 'hidden',
              animation: 'heroFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {/* Search Input Bar */}
            <form
              onSubmit={handleSearchSubmit}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '14px 16px',
                borderBottom: '1px solid rgba(26, 31, 54, 0.08)',
                background: '#FFFFFF',
              }}
            >
              <Search size={18} color={C.red} style={{ flexShrink: 0 }} />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Medida (ej. 205/55R16), marca, modelo o SKU..."
                style={{
                  flex: 1,
                  minWidth: 0,
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  fontFamily: F.body,
                  fontSize: 14,
                  fontWeight: 500,
                  color: C.navy,
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    searchInputRef.current?.focus();
                  }}
                  aria-label="Limpiar búsqueda"
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    border: 'none',
                    background: '#F1F5F9',
                    color: '#64748B',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                >
                  <X size={13} />
                </button>
              )}
              <button
                type="submit"
                style={{
                  padding: '9px 16px',
                  borderRadius: 9999,
                  border: 'none',
                  background: C.red,
                  color: '#FFFFFF',
                  fontFamily: F.heading,
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: '0.07em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  flexShrink: 0,
                }}
              >
                Buscar <ArrowRight size={13} />
              </button>
            </form>

            {/* Search Body: Live Results or Quick Shortcuts */}
            <div
              style={{
                padding: '16px 18px 18px',
                maxHeight: 'min(64vh, 460px)',
                overflowY: 'auto',
              }}
            >
              {searchQuery.trim() ? (
                searchMatches.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: 10.5,
                        fontFamily: F.heading,
                        fontWeight: 800,
                        letterSpacing: '0.14em',
                        textTransform: 'uppercase',
                        color: '#64748B',
                      }}
                    >
                      <span>Resultados instantáneos ({searchMatches.length})</span>
                      <span style={{ color: C.red }}>Precios Con IVA</span>
                    </div>

                    <div
                      className="tienda-spotlight-results-grid"
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                        gap: 10,
                      }}
                    >
                      {searchMatches.slice(0, 6).map((tire) => (
                        <Link
                          key={tire.id}
                          to={`/landing-tienda-preview/producto/${tire.id}`}
                          onClick={() => {
                            setSearchOpen(false);
                            setSearchQuery('');
                          }}
                          className="tienda-spotlight-result-card"
                          style={{
                            padding: '10px 12px',
                            borderRadius: 16,
                            background: '#F8FAFC',
                            border: '1px solid rgba(26, 31, 54, 0.08)',
                            textDecoration: 'none',
                            color: C.navy,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            transition: 'all 0.2s ease',
                          }}
                        >
                          <img
                            src={tire.cutoutImage || tire.primaryImage}
                            alt={tire.cleanTitle}
                            onError={(e) => {
                              e.currentTarget.src = '/images/service-tires.png';
                            }}
                            style={{
                              width: 48,
                              height: 48,
                              objectFit: 'contain',
                              flexShrink: 0,
                            }}
                          />
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                                flexWrap: 'wrap',
                              }}
                            >
                              {tire.measure && (
                                <span
                                  style={{
                                    padding: '2px 7px',
                                    borderRadius: 9999,
                                    background: 'rgba(196, 30, 36, 0.10)',
                                    color: C.red,
                                    fontFamily: F.heading,
                                    fontSize: 9.5,
                                    fontWeight: 900,
                                  }}
                                >
                                  {tire.measure}
                                </span>
                              )}
                              <span
                                style={{
                                  fontFamily: F.heading,
                                  fontSize: 9.5,
                                  fontWeight: 700,
                                  color: '#64748B',
                                }}
                              >
                                {tire.brand}
                              </span>
                            </div>
                            <div
                              style={{
                                fontFamily: F.heading,
                                fontSize: 11.5,
                                fontWeight: 800,
                                color: C.navy,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                marginTop: 3,
                              }}
                            >
                              {tire.cleanTitle}
                            </div>
                            <div
                              style={{
                                fontFamily: F.heading,
                                fontSize: 12,
                                fontWeight: 900,
                                color: C.navy,
                                marginTop: 2,
                              }}
                            >
                              {formatMXN(tire.finalPriceTaxExcluded)}{' '}
                              <span
                                style={{
                                  fontSize: 9.5,
                                  fontWeight: 700,
                                  color: '#94A3B8',
                                }}
                              >
                                Con IVA
                              </span>
                            </div>
                          </div>
                          <ArrowUpRight size={14} color={C.red} style={{ flexShrink: 0 }} />
                        </Link>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={handleSearchSubmit}
                      style={{
                        marginTop: 4,
                        width: '100%',
                        padding: '11px 16px',
                        borderRadius: 14,
                        border: '1px solid rgba(26, 31, 54, 0.10)',
                        background: C.navy,
                        color: '#FFFFFF',
                        fontFamily: F.heading,
                        fontSize: 11,
                        fontWeight: 800,
                        letterSpacing: '0.07em',
                        textTransform: 'uppercase',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                      }}
                    >
                      Ver los {searchMatches.length} resultados en el Catálogo{' '}
                      <ArrowRight size={14} />
                    </button>
                  </div>
                ) : (
                  <div
                    style={{
                      padding: '18px 12px',
                      textAlign: 'center',
                    }}
                  >
                    <div
                      style={{
                        fontFamily: F.heading,
                        fontSize: 13.5,
                        fontWeight: 800,
                        color: C.navy,
                        marginBottom: 6,
                      }}
                    >
                      No encontramos coincidencias exactas para “{searchQuery}”
                    </div>
                    <div style={{ fontSize: 12, color: '#64748B', marginBottom: 14 }}>
                      Prueba escribiendo la medida como <strong>205/55R16</strong> o explora
                      el catálogo completo.
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSearchOpen(false);
                        setSearchQuery('');
                        navigate('/landing-tienda-preview/catalogo');
                      }}
                      style={{
                        padding: '9px 18px',
                        borderRadius: 9999,
                        border: 'none',
                        background: C.navy,
                        color: '#FFFFFF',
                        fontFamily: F.heading,
                        fontSize: 11,
                        fontWeight: 800,
                        cursor: 'pointer',
                      }}
                    >
                      Ir al Catálogo Completo →
                    </button>
                  </div>
                )
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {/* Quick Popular Measures */}
                  <div>
                    <div
                      style={{
                        fontFamily: F.heading,
                        fontSize: 10,
                        fontWeight: 800,
                        letterSpacing: '0.18em',
                        textTransform: 'uppercase',
                        color: '#64748B',
                        marginBottom: 9,
                      }}
                    >
                      Medidas más buscadas
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                      {MOST_REQUESTED_MEASURES.slice(0, 8).map((m) => (
                        <button
                          key={m.raw}
                          type="button"
                          onClick={() => handleQuickMeasure(m.raw)}
                          className="tienda-search-quick-pill"
                          style={{
                            padding: '6px 12px',
                            borderRadius: 9999,
                            border: '1px solid rgba(26, 31, 54, 0.14)',
                            background: '#FFFFFF',
                            cursor: 'pointer',
                            fontFamily: F.heading,
                            fontSize: 11.5,
                            fontWeight: 800,
                            color: C.navy,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          <span>{m.prefix}</span>
                          <span style={{ color: C.red }}>{m.rim}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quick 13 Official Brands */}
                  <div>
                    <div
                      style={{
                        fontFamily: F.heading,
                        fontSize: 10,
                        fontWeight: 800,
                        letterSpacing: '0.18em',
                        textTransform: 'uppercase',
                        color: '#64748B',
                        marginBottom: 9,
                      }}
                    >
                      Marcas Oficiales (13)
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {ALL_OFFICIAL_MENU_BRANDS.map((brandName) => (
                        <button
                          key={brandName}
                          type="button"
                          onClick={() => handleQuickBrand(brandName)}
                          className="tienda-search-quick-pill"
                          style={{
                            padding: '5px 11px',
                            borderRadius: 9999,
                            border: '1px solid rgba(26, 31, 54, 0.10)',
                            background: '#F8FAFC',
                            cursor: 'pointer',
                            fontFamily: F.heading,
                            fontSize: 10.5,
                            fontWeight: 800,
                            letterSpacing: '0.04em',
                            textTransform: 'uppercase',
                            color: C.navy,
                          }}
                        >
                          {brandName}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quick 8 Vehicle Types */}
                  <div>
                    <div
                      style={{
                        fontFamily: F.heading,
                        fontSize: 10,
                        fontWeight: 800,
                        letterSpacing: '0.18em',
                        textTransform: 'uppercase',
                        color: '#64748B',
                        marginBottom: 9,
                      }}
                    >
                      Tipo de Vehículo (8)
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {VEHICLE_TYPE_OPTIONS.map((vt) => (
                        <button
                          key={vt.id}
                          type="button"
                          onClick={() => handleQuickVehicle(vt.id)}
                          className="tienda-search-quick-pill"
                          style={{
                            padding: '5px 11px',
                            borderRadius: 9999,
                            border: '1px solid rgba(26, 31, 54, 0.10)',
                            background: '#FFFFFF',
                            cursor: 'pointer',
                            fontFamily: F.heading,
                            fontSize: 10.5,
                            fontWeight: 800,
                            color: C.navy,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                          }}
                        >
                          <TiendaVehicleSvg type={vt.id} width={38} height={15} />
                          <span>{vt.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Frosted Glass Mega-Menu Dropdown with Invisible Hover Bridge */}
      {megaOpen && (
        <div
          onMouseEnter={() => openMegaMenu()}
          onMouseLeave={scheduleCloseMegaMenu}
          style={{
            position: 'relative',
            zIndex: 3,
            maxWidth: 1120,
            margin: '0 auto',
            padding: '10px 12px 0',
            pointerEvents: 'auto',
          }}
        >
          <div
            style={{
              padding: '22px 28px',
              maxHeight: 'calc(100vh - 102px)',
              overflowY: 'auto',
              borderRadius: 28,
              background: 'rgba(255, 255, 255, 0.97)',
              backdropFilter: 'saturate(180%) blur(28px)',
              WebkitBackdropFilter: 'saturate(180%) blur(28px)',
              border: '1px solid rgba(26, 31, 54, 0.08)',
              boxShadow: '0 32px 70px rgba(26, 31, 54, 0.14)',
              animation: 'heroFadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <TiendaMostRequestedSection
              isCompactDropdown
              mode={megaMode}
              onAfterSelect={() => setMegaOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Mobile Glass Dropdown */}
      {mobileMenu && (
        <div
          style={{
            position: 'relative',
            zIndex: 3,
            maxWidth: 460,
            width: 'calc(100vw - 24px)',
            maxHeight: 'calc(100vh - 96px)',
            overflowY: 'auto',
            margin: '10px auto 0',
            padding: '16px 18px 20px',
            borderRadius: 24,
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(26, 31, 54, 0.09)',
            boxShadow: '0 24px 56px rgba(15, 20, 36, 0.18)',
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            pointerEvents: 'auto',
          }}
        >
          {legacyMode ? (
            navItems.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                onClick={item.isAccount ? handleAccountAction : () => setMobileMenu(false)}
                style={{
                  fontFamily: F.heading,
                  fontSize: 13,
                  fontWeight: 700,
                  color: C.navy,
                  textDecoration: 'none',
                  padding: '8px 4px',
                }}
              >
                {item.label}
              </Link>
            ))
          ) : (
            <>
              {/* Quick Search Button inside Mobile Menu */}
              <button
                type="button"
                onClick={() => {
                  setMobileMenu(false);
                  setSearchOpen(true);
                }}
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  marginBottom: 6,
                  borderRadius: 14,
                  border: '1px solid rgba(26, 31, 54, 0.10)',
                  background: '#F8FAFC',
                  color: '#64748B',
                  fontFamily: F.body,
                  fontSize: 13,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 9,
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <Search size={15} color={C.red} />
                <span>Buscar medida (ej. 205/55R16) o marca...</span>
              </button>

              <Link
                to="/landing-tienda-preview"
                onClick={() => setMobileMenu(false)}
                style={{
                  fontFamily: F.heading,
                  fontSize: 13.5,
                  fontWeight: 800,
                  color: C.navy,
                  textDecoration: 'none',
                  padding: '10px 6px',
                  borderBottom: '1px solid rgba(26, 31, 54, 0.06)',
                }}
              >
                Inicio
              </Link>

              <Link
                to="/landing-tienda-preview/catalogo"
                onClick={() => setMobileMenu(false)}
                style={{
                  fontFamily: F.heading,
                  fontSize: 13.5,
                  fontWeight: 800,
                  color: C.navy,
                  textDecoration: 'none',
                  padding: '10px 6px',
                  borderBottom: '1px solid rgba(26, 31, 54, 0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span>Catálogo Completo</span>
                <ArrowRight size={14} color={C.red} />
              </Link>

              {/* Expandable Mobile Accordion: All 13 Brands */}
              <div style={{ borderBottom: '1px solid rgba(26, 31, 54, 0.06)' }}>
                <button
                  type="button"
                  onClick={() =>
                    setMobileAccordion((prev) => (prev === 'brands' ? null : 'brands'))
                  }
                  style={{
                    width: '100%',
                    padding: '10px 6px',
                    border: 'none',
                    background: 'transparent',
                    fontFamily: F.heading,
                    fontSize: 13.5,
                    fontWeight: 800,
                    color: mobileAccordion === 'brands' ? C.red : C.navy,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                  }}
                >
                  <span>Marcas Oficiales (13)</span>
                  <ChevronDown
                    size={16}
                    style={{
                      transform:
                        mobileAccordion === 'brands' ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.25s ease',
                    }}
                  />
                </button>
                {mobileAccordion === 'brands' && (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                      gap: 8,
                      padding: '4px 4px 12px',
                    }}
                  >
                    {ALL_OFFICIAL_MENU_BRANDS.map((brandName) => {
                      const meta = BRAND_META[brandName];
                      return (
                        <button
                          key={brandName}
                          type="button"
                          onClick={() => handleQuickBrand(brandName)}
                          style={{
                            height: 44,
                            padding: '6px 10px',
                            borderRadius: 12,
                            border: '1px solid rgba(26, 31, 54, 0.10)',
                            background: '#F8FAFC',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {meta?.logo ? (
                            <img
                              src={meta.logo}
                              alt={brandName}
                              style={{
                                height: 17,
                                maxWidth: '88%',
                                width: 'auto',
                                objectFit: 'contain',
                              }}
                            />
                          ) : (
                            <span
                              style={{
                                fontFamily: F.heading,
                                fontSize: 11,
                                fontWeight: 800,
                                color: C.navy,
                                textTransform: 'uppercase',
                              }}
                            >
                              {brandName}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Expandable Mobile Accordion: Tipo de Vehículo & Modelos */}
              <div style={{ borderBottom: '1px solid rgba(26, 31, 54, 0.06)' }}>
                <button
                  type="button"
                  onClick={() =>
                    setMobileAccordion((prev) =>
                      prev === 'vehicles' ? null : 'vehicles'
                    )
                  }
                  style={{
                    width: '100%',
                    padding: '10px 6px',
                    border: 'none',
                    background: 'transparent',
                    fontFamily: F.heading,
                    fontSize: 13.5,
                    fontWeight: 800,
                    color: mobileAccordion === 'vehicles' ? C.red : C.navy,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                  }}
                >
                  <span>Tipo de Vehículo & Modelos (8)</span>
                  <ChevronDown
                    size={16}
                    style={{
                      transform:
                        mobileAccordion === 'vehicles'
                          ? 'rotate(180deg)'
                          : 'rotate(0deg)',
                      transition: 'transform 0.25s ease',
                    }}
                  />
                </button>
                {mobileAccordion === 'vehicles' && (
                  <div style={{ padding: '4px 4px 12px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                        gap: 8,
                      }}
                    >
                      {VEHICLE_TYPE_OPTIONS.map((vt) => (
                        <button
                          key={vt.id}
                          type="button"
                          onClick={() => handleQuickVehicle(vt.id)}
                          style={{
                            padding: '8px 10px',
                            borderRadius: 12,
                            border: '1px solid rgba(26, 31, 54, 0.10)',
                            background: '#F8FAFC',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-start',
                            gap: 4,
                            textAlign: 'left',
                          }}
                        >
                          <TiendaVehicleSvg type={vt.id} width={68} height={25} />
                          <span
                            style={{
                              fontFamily: F.heading,
                              fontSize: 11.5,
                              fontWeight: 900,
                              color: C.navy,
                            }}
                          >
                            {vt.label}
                          </span>
                          <span
                            style={{
                              fontFamily: F.body,
                              fontSize: 9.5,
                              color: '#64748B',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              width: '100%',
                            }}
                          >
                            {vt.modelsText}
                          </span>
                        </button>
                      ))}
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {POPULAR_CAR_MODELS.slice(0, 10).map((cm) => (
                        <button
                          key={cm.id}
                          type="button"
                          onClick={() => handleQuickCarModel(cm)}
                          style={{
                            padding: '5px 10px',
                            borderRadius: 9999,
                            border: '1px solid rgba(26, 31, 54, 0.12)',
                            background: '#FFFFFF',
                            cursor: 'pointer',
                            fontFamily: F.heading,
                            fontSize: 10.5,
                            fontWeight: 700,
                            color: C.navy,
                          }}
                        >
                          {cm.id}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Expandable Mobile Accordion: Top Medidas */}
              <div style={{ borderBottom: '1px solid rgba(26, 31, 54, 0.06)' }}>
                <button
                  type="button"
                  onClick={() =>
                    setMobileAccordion((prev) =>
                      prev === 'measures' ? null : 'measures'
                    )
                  }
                  style={{
                    width: '100%',
                    padding: '10px 6px',
                    border: 'none',
                    background: 'transparent',
                    fontFamily: F.heading,
                    fontSize: 13.5,
                    fontWeight: 800,
                    color: mobileAccordion === 'measures' ? C.red : C.navy,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                  }}
                >
                  <span>Top Medidas</span>
                  <ChevronDown
                    size={16}
                    style={{
                      transform:
                        mobileAccordion === 'measures'
                          ? 'rotate(180deg)'
                          : 'rotate(0deg)',
                      transition: 'transform 0.25s ease',
                    }}
                  />
                </button>
                {mobileAccordion === 'measures' && (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                      gap: 8,
                      padding: '4px 4px 12px',
                    }}
                  >
                    {MOST_REQUESTED_MEASURES.map((m) => (
                      <button
                        key={m.raw}
                        type="button"
                        onClick={() => handleQuickMeasure(m.raw)}
                        style={{
                          padding: '9px 10px',
                          borderRadius: 9999,
                          border: '1px solid rgba(26, 31, 54, 0.14)',
                          background: '#FFFFFF',
                          cursor: 'pointer',
                          fontFamily: F.heading,
                          fontSize: 12,
                          fontWeight: 800,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 4,
                        }}
                      >
                        <span style={{ color: C.navy }}>{m.prefix}</span>
                        <span style={{ color: C.red }}>{m.rim}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <Link
                to="/landing-tienda-preview/cuenta"
                onClick={handleAccountAction}
                style={{
                  fontFamily: F.heading,
                  fontSize: 13.5,
                  fontWeight: 800,
                  color: C.navy,
                  textDecoration: 'none',
                  padding: '10px 6px 4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <User size={15} color={user ? '#16A34A' : C.red} />
                <span>{user ? `Mi Cuenta (${user.nombre.split(' ')[0]})` : 'Cuenta / Iniciar sesión'}</span>
              </Link>
            </>
          )}
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
        .tienda-apple-search-btn:hover {
          border-color: rgba(196, 30, 36, 0.35) !important;
          transform: translateY(-1px);
        }
        .tienda-search-quick-pill {
          transition: all 0.2s ease;
        }
        .tienda-search-quick-pill:hover {
          border-color: #C41E24 !important;
          background: #FFF5F5 !important;
          color: #C41E24 !important;
          transform: translateY(-1px);
        }
        .tienda-spotlight-result-card:hover {
          border-color: rgba(196, 30, 36, 0.32) !important;
          background: #FFFFFF !important;
          box-shadow: 0 10px 24px rgba(26, 31, 54, 0.06);
        }
        @media (max-width: 1080px) {
          .tienda-apple-search-kbd { display: none !important; }
        }
        @media (max-width: 960px) {
          .tienda-apple-nav { display: none !important; }
          .tienda-apple-burger { display: inline-flex !important; }
          .tienda-apple-pill-outer { padding: 8px 12px 0 !important; }
          .tienda-apple-pill-inner { padding: 8px 12px 8px 16px !important; gap: 8px !important; }
        }
        @media (max-width: 640px) {
          .tienda-apple-coupon,
          .tienda-apple-user-txt,
          .tienda-apple-search-txt { display: none !important; }
          .tienda-apple-search-btn,
          .tienda-apple-account-btn {
            width: 34px !important;
            height: 34px !important;
            padding: 0 !important;
          }
          .tienda-apple-cart-btn {
            height: 34px !important;
            padding: 0 11px !important;
          }
          .tienda-apple-logo-img { height: 24px !important; }
          .tienda-apple-logo-badge { padding-left: 7px !important; font-size: 8.5px !important; letter-spacing: 0.16em !important; }
          .tienda-apple-actions { gap: 5px !important; }
          .tienda-spotlight-results-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 390px) {
          .tienda-apple-logo-badge { display: none !important; }
        }
      `}</style>
    </header>
  );
}
