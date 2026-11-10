import { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { C, F } from '../../hooks/useAnimations';
import {
  MOST_REQUESTED_MEASURES,
  BRAND_META,
  FEATURED_BRAND_KEYS,
  useWixCatalogProducts,
} from '../../data/productosMasterData';
import TiendaProductCard from './TiendaProductCard';
import {
  Search,
  RotateCcw,
  ArrowRight,
  ChevronUp,
  ChevronDown,
  SlidersHorizontal,
} from 'lucide-react';

function RealisticVehicleSvg({ type, active }) {
  const strokeColor = active ? C.red : C.navy;
  const bodyFill = active ? 'rgba(196, 30, 36, 0.09)' : 'rgba(26, 31, 54, 0.05)';
  const glassFill = active ? 'rgba(196, 30, 36, 0.16)' : 'rgba(26, 31, 54, 0.10)';
  const rimAccent = active ? C.red : '#64748B';

  if (type === 'Auto') {
    return (
      <svg width="118" height="42" viewBox="0 0 148 54" fill="none">
        <ellipse cx="74" cy="48" rx="60" ry="3" fill="rgba(26,31,54,0.10)" />
        <path
          d="M14 36C14 32 18 28 28 26L46 15C52 12 62 11 78 11C93 11 103 13 112 22L131 25C136 26 138 30 138 35V38C138 40 136 41 133 41H121C121 33 115 28 108 28C101 28 95 33 95 41H55C55 33 49 28 42 28C35 28 29 33 29 41H18C15 41 14 39 14 36Z"
          fill={bodyFill}
          stroke={strokeColor}
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        <path
          d="M49 24L60 15H76V24H49ZM80 24V15H95L106 24H80Z"
          fill={glassFill}
          stroke={strokeColor}
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        <path d="M132 29L137 31" stroke={C.red} strokeWidth="2.2" strokeLinecap="round" />
        <path d="M15 30L20 30" stroke={C.red} strokeWidth="2.2" strokeLinecap="round" />
        <circle cx="42" cy="40" r="9.5" fill="#FFFFFF" stroke={strokeColor} strokeWidth="2.4" />
        <circle cx="42" cy="40" r="4.5" fill={rimAccent} />
        <circle cx="108" cy="40" r="9.5" fill="#FFFFFF" stroke={strokeColor} strokeWidth="2.4" />
        <circle cx="108" cy="40" r="4.5" fill={rimAccent} />
      </svg>
    );
  }

  if (type === 'Camioneta') {
    return (
      <svg width="118" height="42" viewBox="0 0 148 54" fill="none">
        <ellipse cx="74" cy="48" rx="62" ry="3.2" fill="rgba(26,31,54,0.10)" />
        <path d="M32 9H96" stroke={strokeColor} strokeWidth="1.6" strokeLinecap="round" />
        <path
          d="M14 37V22C14 19 16 17 19 16L27 11C30 10 36 10 44 10H94C100 10 104 12 109 20L130 23C135 24 137 28 137 33V38C137 40 135 41 132 41H122C122 32 115 26 107 26C99 26 92 32 92 41H56C56 32 49 26 41 26C33 26 26 32 26 41H18C15 41 14 39 14 37Z"
          fill={bodyFill}
          stroke={strokeColor}
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        <path
          d="M28 21L33 13H56V21H28ZM60 21V13H81V21H60ZM85 21V13H96L103 21H85Z"
          fill={glassFill}
          stroke={strokeColor}
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        <path d="M131 27L136 29" stroke={C.red} strokeWidth="2.2" strokeLinecap="round" />
        <circle cx="41" cy="40" r="10.5" fill="#FFFFFF" stroke={strokeColor} strokeWidth="2.6" />
        <circle cx="41" cy="40" r="5" fill={rimAccent} />
        <circle cx="107" cy="40" r="10.5" fill="#FFFFFF" stroke={strokeColor} strokeWidth="2.6" />
        <circle cx="107" cy="40" r="5" fill={rimAccent} />
      </svg>
    );
  }

  return (
    <svg width="118" height="42" viewBox="0 0 148 54" fill="none">
      <ellipse cx="74" cy="48" rx="64" ry="3.2" fill="rgba(26,31,54,0.10)" />
      <rect
        x="12"
        y="8"
        width="78"
        height="29"
        rx="4"
        fill={bodyFill}
        stroke={strokeColor}
        strokeWidth="2.2"
      />
      <line x1="38" y1="12" x2="38" y2="33" stroke={strokeColor} strokeWidth="1.2" strokeOpacity="0.35" />
      <line x1="64" y1="12" x2="64" y2="33" stroke={strokeColor} strokeWidth="1.2" strokeOpacity="0.35" />
      <path
        d="M90 14H112C117 14 121 16 124 22L134 26C136 27 137 30 137 33V39H90V14Z"
        fill={bodyFill}
        stroke={strokeColor}
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <path
        d="M96 18H113L120 25H96V18Z"
        fill={glassFill}
        stroke={strokeColor}
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M14 39H135" stroke={strokeColor} strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="34" cy="41" r="9.5" fill="#FFFFFF" stroke={strokeColor} strokeWidth="2.6" />
      <circle cx="34" cy="41" r="4.5" fill={rimAccent} />
      <circle cx="56" cy="41" r="9.5" fill="#FFFFFF" stroke={strokeColor} strokeWidth="2.6" />
      <circle cx="56" cy="41" r="4.5" fill={rimAccent} />
      <circle cx="114" cy="41" r="9.5" fill="#FFFFFF" stroke={strokeColor} strokeWidth="2.6" />
      <circle cx="114" cy="41" r="4.5" fill={rimAccent} />
    </svg>
  );
}

const VEHICLE_TYPES = ['Auto', 'Camioneta', 'Camión'];

export default function TiendaCatalogSection({
  id = 'catalogo-tienda',
  isHomePreview = false,
  isFullCatalogPage = false,
  forceStaticCatalog = false,
  initialCategory = 'Todos',
  initialBrand = 'Todas',
  initialRim = 'Todos',
  externalMeasure = '',
  externalBrand = '',
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    products: catalogProducts,
    brands: availableBrands,
    rims: availableRims,
    widths: availableWidths,
    profiles: availableProfiles,
  } = useWixCatalogProducts({ forceStatic: forceStaticCatalog });

  // Read initial filters from URL query parameters (?brand=..., ?measure=..., etc.)
  const initialUrlParams = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return {
      brand: params.get('brand') || initialBrand,
      measure: params.get('measure') || params.get('q') || externalMeasure || '',
      vehicle: params.get('vehicle') || 'Todos',
      rim: params.get('rim') || initialRim,
      width: params.get('width') || 'Todos',
      profile: params.get('profile') || 'Todos',
    };
  }, [location.search, initialBrand, initialRim, externalMeasure]);

  const [category, setCategory] = useState(initialCategory);
  const [vehicleType, setVehicleType] = useState(initialUrlParams.vehicle);
  const [brand, setBrand] = useState(initialUrlParams.brand);
  const [rim, setRim] = useState(initialUrlParams.rim);
  const [width, setWidth] = useState(initialUrlParams.width);
  const [profile, setProfile] = useState(initialUrlParams.profile);
  const [searchQuery, setSearchQuery] = useState(initialUrlParams.measure);
  const [sortBy, setSortBy] = useState('featured');
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [visibleCount, setVisibleCount] = useState(
    isFullCatalogPage ? 48 : isHomePreview ? 7 : 12
  );
  const [filtersExpanded, setFiltersExpanded] = useState(true);

  // Sync when URL query params change (e.g. navigating from Home or Navbar Mega-Menu)
  const [prevSearchStr, setPrevSearchStr] = useState(location.search);
  if (location.search !== prevSearchStr) {
    setPrevSearchStr(location.search);
    const params = new URLSearchParams(location.search);
    const qBrand = params.get('brand');
    const qMeasure = params.get('measure') || params.get('q');
    const qVehicle = params.get('vehicle');
    const qRim = params.get('rim');
    const qWidth = params.get('width');
    const qProfile = params.get('profile');

    if (qBrand) setBrand(qBrand);
    if (qMeasure !== null && qMeasure !== undefined) setSearchQuery(qMeasure);
    if (qVehicle) setVehicleType(qVehicle);
    if (qRim) setRim(qRim);
    if (qWidth) setWidth(qWidth);
    if (qProfile) setProfile(qProfile);
  }

  // Sync if parent passes a quick measure or brand selection
  const [prevExtMeasure, setPrevExtMeasure] = useState(externalMeasure);
  if (externalMeasure !== prevExtMeasure) {
    setPrevExtMeasure(externalMeasure);
    if (externalMeasure) setSearchQuery(externalMeasure);
  }

  const [prevExtBrand, setPrevExtBrand] = useState(externalBrand);
  if (externalBrand !== prevExtBrand) {
    setPrevExtBrand(externalBrand);
    if (externalBrand) setBrand(externalBrand);
  }

  // Scroll smoothly to catalog when arriving at /landing-tienda-preview with filter query params or hash
  useEffect(() => {
    if (isHomePreview) return;
    const hasFilterQuery =
      location.search.includes('brand=') ||
      location.search.includes('measure=') ||
      location.search.includes('vehicle=') ||
      location.search.includes('rim=') ||
      location.search.includes('width=') ||
      location.search.includes('profile=') ||
      location.hash === `#${id}`;

    if (hasFilterQuery) {
      const timer = setTimeout(() => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 120);
      return () => clearTimeout(timer);
    }
  }, [isHomePreview, location.search, location.hash, id]);

  // Helper to navigate to the dedicated Catalog page (/landing-tienda-preview/catalogo) with active filters
  const navigateToStoreCatalog = useCallback(
    (overrides = {}) => {
      const nextBrand = overrides.brand !== undefined ? overrides.brand : brand;
      const nextMeasure = overrides.measure !== undefined ? overrides.measure : searchQuery;
      const nextVehicle = overrides.vehicle !== undefined ? overrides.vehicle : vehicleType;
      const nextRim = overrides.rim !== undefined ? overrides.rim : rim;
      const nextWidth = overrides.width !== undefined ? overrides.width : width;
      const nextProfile = overrides.profile !== undefined ? overrides.profile : profile;

      const params = new URLSearchParams();
      if (nextBrand && nextBrand !== 'Todas') params.set('brand', nextBrand);
      if (nextMeasure && nextMeasure.trim()) params.set('measure', nextMeasure.trim());
      if (nextVehicle && nextVehicle !== 'Todos') params.set('vehicle', nextVehicle);
      if (nextRim && nextRim !== 'Todos') params.set('rim', nextRim);
      if (nextWidth && nextWidth !== 'Todos') params.set('width', nextWidth);
      if (nextProfile && nextProfile !== 'Todos') params.set('profile', nextProfile);

      const queryString = params.toString();
      const targetUrl = `/landing-tienda-preview/catalogo${queryString ? `?${queryString}` : ''}`;
      navigate(targetUrl);
    },
    [brand, searchQuery, vehicleType, rim, width, profile, navigate]
  );

  useEffect(() => {
    const onUiEvent = (e) => {
      const detail = e?.detail;
      if (!detail || detail.type !== 'FILTER_CATALOG') return;
      if (typeof detail.measure === 'string') {
        setSearchQuery(detail.measure);
        setBrand('Todas');
        setVehicleType('Todos');
      }
      if (typeof detail.brand === 'string') {
        setBrand(detail.brand);
        setSearchQuery('');
      }
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };
    window.addEventListener('jasman-tienda-ui', onUiEvent);
    return () => window.removeEventListener('jasman-tienda-ui', onUiEvent);
  }, [id]);

  const effectiveSearch = searchQuery;

  const filteredProducts = useMemo(() => {
    return catalogProducts.filter((p) => {
      if (onlyInStock && !p.inStock) return false;
      if (vehicleType !== 'Todos' && p.vehicleType !== vehicleType) return false;
      if (category !== 'Todos' && p.category !== category) return false;
      if (brand !== 'Todas' && p.brand !== brand) return false;
      if (rim !== 'Todos' && p.rim !== rim) return false;
      if (width !== 'Todos' && p.width !== width) return false;
      if (profile !== 'Todos' && p.profile !== profile) return false;

      if (effectiveSearch.trim()) {
        const q = effectiveSearch.trim().toLowerCase().replace(/\s+/g, '');
        const searchable = `${p.cleanTitle} ${p.brand} ${p.reference} ${p.measure || ''} ${p.category} ${p.vehicleType}`
          .toLowerCase()
          .replace(/\s+/g, '');
        if (!searchable.includes(q)) return false;
      }

      return true;
    }).sort((a, b) => {
      if (a.inStock !== b.inStock) return a.inStock ? -1 : 1;
      if (sortBy === 'price-asc') {
        return (a.finalPriceTaxExcluded || 999999) - (b.finalPriceTaxExcluded || 999999);
      }
      if (sortBy === 'price-desc') {
        return (b.finalPriceTaxExcluded || 0) - (a.finalPriceTaxExcluded || 0);
      }
      if (sortBy === 'stock-desc') {
        return (b.quantity || 0) - (a.quantity || 0);
      }
      return 0;
    });
  }, [catalogProducts, vehicleType, category, brand, rim, width, profile, effectiveSearch, sortBy, onlyInStock]);

  const activeFilterCount =
    (vehicleType !== 'Todos' ? 1 : 0) +
    (category !== 'Todos' ? 1 : 0) +
    (brand !== 'Todas' ? 1 : 0) +
    (rim !== 'Todos' ? 1 : 0) +
    (width !== 'Todos' ? 1 : 0) +
    (profile !== 'Todos' ? 1 : 0) +
    (onlyInStock ? 1 : 0) +
    (effectiveSearch.trim() ? 1 : 0);

  const resetFilters = () => {
    setVehicleType('Todos');
    setCategory('Todos');
    setBrand('Todas');
    setRim('Todos');
    setWidth('Todos');
    setProfile('Todos');
    setSearchQuery('');
    setOnlyInStock(false);
    setSortBy('featured');
  };

  const displayedProducts = filteredProducts.slice(0, visibleCount);
  const topMeasures = MOST_REQUESTED_MEASURES.slice(0, 8);

  return (
    <section
      id={id}
      style={{
        background: '#F5F5F7',
        padding: isHomePreview ? '88px 24px' : '104px 24px 128px',
        position: 'relative',
      }}
    >
      <div style={{ maxWidth: 1260, margin: '0 auto' }}>
        {/* 1. HEADER + REALISTIC VEHICLE SVG SELECTORS IN ONE CLEAN ROW */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: 24,
            marginBottom: 28,
          }}
        >
          <div>
            <span
              style={{
                fontFamily: F.heading,
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: '0.26em',
                textTransform: 'uppercase',
                color: C.red,
                display: 'block',
                marginBottom: 8,
              }}
            >
              Catálogo Oficial · {catalogProducts.length} Referencias
            </span>
            <h2
              style={{
                fontFamily: F.heading,
                fontSize: 'clamp(2.1rem, 4.2vw, 3.4rem)',
                fontWeight: 900,
                color: C.navy,
                letterSpacing: '-0.04em',
                lineHeight: 1.02,
                margin: 0,
              }}
            >
              Tu medida exacta.
            </h2>
          </div>

          {/* 3 Realistic Vehicle Silhouette SVG Selectors (No text clutter) */}
          <div
            className="catalog-vehicle-svg-row"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              flexWrap: 'wrap',
            }}
          >
            {VEHICLE_TYPES.map((vtId) => {
              const isSelected = vehicleType === vtId;
              const count = catalogProducts.filter((p) => p.vehicleType === vtId).length;
              return (
                <button
                  key={vtId}
                  type="button"
                  onClick={() => setVehicleType(isSelected ? 'Todos' : vtId)}
                  aria-label={vtId}
                  title={`${vtId} (${count} modelos)`}
                  style={{
                    position: 'relative',
                    padding: '12px 18px 10px',
                    borderRadius: 20,
                    background: isSelected ? '#FFF5F5' : '#FFFFFF',
                    border: isSelected
                      ? `2px solid ${C.red}`
                      : '1px solid rgba(26, 31, 54, 0.08)',
                    boxShadow: isSelected
                      ? '0 14px 32px rgba(196, 30, 36, 0.12)'
                      : '0 6px 18px rgba(26, 31, 54, 0.03)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transform: isSelected ? 'translateY(-2px)' : 'translateY(0)',
                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                >
                  <RealisticVehicleSvg type={vtId} active={isSelected} />
                  <span
                    style={{
                      position: 'absolute',
                      top: 6,
                      right: 8,
                      padding: '2px 7px',
                      borderRadius: 9999,
                      background: isSelected ? C.red : '#F1F5F9',
                      color: isSelected ? '#FFFFFF' : C.navy,
                      fontFamily: F.heading,
                      fontSize: 9.5,
                      fontWeight: 800,
                    }}
                  >
                    {count}
                  </span>
                </button>
              );
            })}

            {!isFullCatalogPage && (
              <button
                type="button"
                onClick={() => navigateToStoreCatalog()}
                style={{
                  padding: '14px 22px',
                  borderRadius: 9999,
                  border: 'none',
                  background: C.navy,
                  color: C.white,
                  fontFamily: F.heading,
                  fontSize: 11.5,
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                Catálogo Completo <ArrowRight size={14} />
              </button>
            )}
          </div>
        </div>

        {/* 2. UNIFIED MINIMALIST CONSOLE: MEDIDAS MÁS PEDIDAS + MARCAS MÁS PEDIDAS + BUSCADOR (Collapsible / Expandable) */}
        <div
          id="medidas-pedidas"
          style={{
            position: !filtersExpanded ? 'sticky' : 'relative',
            top: !filtersExpanded ? 82 : 'auto',
            zIndex: 35,
            background: 'rgba(255, 255, 255, 0.96)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderRadius: 32,
            border: '1px solid rgba(26, 31, 54, 0.07)',
            padding: filtersExpanded ? '26px 28px' : '16px 24px',
            marginBottom: 32,
            boxShadow: '0 20px 54px rgba(15, 23, 42, 0.05)',
            display: 'flex',
            flexDirection: 'column',
            gap: filtersExpanded ? 24 : 0,
            transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {/* Top Split Bento: Medidas más pedidas (Left) + Marcas más pedidas (Right) */}
          <div
            className="catalog-unified-discovery-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1.15fr) minmax(0, 0.85fr)',
              gap: 28,
              alignItems: 'stretch',
              maxHeight: filtersExpanded ? 480 : 0,
              opacity: filtersExpanded ? 1 : 0,
              overflow: 'hidden',
              pointerEvents: filtersExpanded ? 'auto' : 'none',
              transition: 'max-height 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease',
            }}
          >
            {/* LEFT: Medidas más pedidas */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 14,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <span
                    style={{
                      width: 18,
                      height: 2.5,
                      borderRadius: 999,
                      background: C.red,
                    }}
                  />
                  <span
                    style={{
                      fontFamily: F.heading,
                      fontSize: 10.5,
                      fontWeight: 800,
                      letterSpacing: '0.18em',
                      textTransform: 'uppercase',
                      color: C.navy,
                    }}
                  >
                    Medidas más <strong style={{ color: C.red }}>pedidas</strong>
                  </span>
                </div>
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      fontFamily: F.heading,
                      fontSize: 10,
                      fontWeight: 700,
                      color: C.red,
                      cursor: 'pointer',
                    }}
                  >
                    Ver todas
                  </button>
                )}
              </div>

              <div
                className="catalog-measures-pill-grid"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: 8,
                }}
              >
                {topMeasures.map((m) => {
                  const isSelected =
                    searchQuery.replace(/\s+/g, '').toUpperCase() === m.raw.toUpperCase();
                  return (
                    <button
                      key={m.raw}
                      type="button"
                      onClick={() => {
                        if (!isFullCatalogPage) {
                          navigateToStoreCatalog({ measure: m.raw });
                          return;
                        }
                        setSearchQuery(isSelected ? '' : m.raw);
                      }}
                      style={{
                        padding: '10px 8px',
                        borderRadius: 9999,
                        border: isSelected
                          ? `1.5px solid ${C.red}`
                          : '1px solid rgba(26, 31, 54, 0.14)',
                        background: isSelected ? '#FFF5F5' : '#FAFAFC',
                        cursor: 'pointer',
                        fontFamily: F.heading,
                        fontSize: 12,
                        fontWeight: 800,
                        letterSpacing: '0.01em',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 4,
                        boxShadow: isSelected
                          ? '0 8px 20px rgba(196, 30, 36, 0.10)'
                          : 'none',
                        transition: 'all 0.22s ease',
                      }}
                    >
                      <span style={{ color: C.navy }}>{m.prefix}</span>
                      <span style={{ color: C.red, fontWeight: 900 }}>{m.rim}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* RIGHT: Marcas más pedidas */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 14,
                paddingLeft: 24,
                borderLeft: '1px solid rgba(26, 31, 54, 0.06)',
              }}
              className="catalog-brands-column"
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <span
                    style={{
                      width: 18,
                      height: 2.5,
                      borderRadius: 999,
                      background: C.red,
                    }}
                  />
                  <span
                    style={{
                      fontFamily: F.heading,
                      fontSize: 10.5,
                      fontWeight: 800,
                      letterSpacing: '0.18em',
                      textTransform: 'uppercase',
                      color: C.navy,
                    }}
                  >
                    Marcas más <strong style={{ color: C.red }}>pedidas</strong>
                  </span>
                </div>
                {brand !== 'Todas' && (
                  <button
                    type="button"
                    onClick={() => setBrand('Todas')}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      fontFamily: F.heading,
                      fontSize: 10,
                      fontWeight: 700,
                      color: C.red,
                      cursor: 'pointer',
                    }}
                  >
                    Todas
                  </button>
                )}
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(5, 1fr)',
                  gap: 8,
                  height: '100%',
                }}
                className="catalog-brands-tile-grid"
              >
                {FEATURED_BRAND_KEYS.map((brandName) => {
                  const meta = BRAND_META[brandName];
                  const active = brand === brandName;
                  return (
                    <button
                      key={brandName}
                      type="button"
                      onClick={() => {
                        if (!isFullCatalogPage) {
                          navigateToStoreCatalog({ brand: brandName });
                          return;
                        }
                        setBrand(active ? 'Todas' : brandName);
                      }}
                      title={brandName}
                      style={{
                        minHeight: 68,
                        padding: '10px 8px',
                        borderRadius: 16,
                        border: active
                          ? `1.5px solid ${C.red}`
                          : '1px solid rgba(26, 31, 54, 0.10)',
                        background: active ? '#FFF5F5' : '#FAFAFC',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: active
                          ? '0 10px 22px rgba(196, 30, 36, 0.10)'
                          : 'none',
                        transition: 'all 0.22s ease',
                      }}
                    >
                      <img
                        src={meta.logo}
                        alt={brandName}
                        style={{
                          height: 17,
                          maxWidth: '90%',
                          width: 'auto',
                          objectFit: 'contain',
                          opacity: active ? 1 : 0.78,
                        }}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bottom Slim Precision Search, Parameter Bar & Subir/Bajar Filtros Toggle */}
          <div
            style={{
              paddingTop: filtersExpanded ? 18 : 0,
              borderTop: filtersExpanded ? '1px solid rgba(26, 31, 54, 0.06)' : 'none',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 10,
            }}
          >
            {/* Search + Ancho / Perfil / Rin */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: 8,
                flex: 1,
              }}
            >
              <div style={{ position: 'relative', flex: '1 1 220px', maxWidth: 320 }}>
                <Search
                  size={15}
                  style={{
                    position: 'absolute',
                    left: 14,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#94A3B8',
                  }}
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar medida, modelo o SKU..."
                  style={{
                    width: '100%',
                    padding: '10px 14px 10px 38px',
                    borderRadius: 9999,
                    border: 'none',
                    background: '#F5F5F7',
                    fontFamily: F.body,
                    fontSize: 12.5,
                    color: C.navy,
                    outline: 'none',
                  }}
                />
              </div>

              {/* Marca (Todas las marcas del catálogo) */}
              <select
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                style={{
                  padding: '10px 14px',
                  borderRadius: 9999,
                  border: 'none',
                  background: brand !== 'Todas' ? C.navy : '#F5F5F7',
                  color: brand !== 'Todas' ? C.white : C.navy,
                  fontFamily: F.heading,
                  fontSize: 11,
                  fontWeight: 700,
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                {availableBrands.map((b) => (
                  <option key={b} value={b} style={{ background: C.white, color: C.navy }}>
                    {b === 'Todas' ? 'Marca (Todas)' : b}
                  </option>
                ))}
              </select>

              {/* Ancho */}
              <select
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                style={{
                  padding: '10px 14px',
                  borderRadius: 9999,
                  border: 'none',
                  background: width !== 'Todos' ? C.navy : '#F5F5F7',
                  color: width !== 'Todos' ? C.white : C.navy,
                  fontFamily: F.heading,
                  fontSize: 11,
                  fontWeight: 700,
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                {availableWidths.map((w) => (
                  <option key={w} value={w} style={{ background: C.white, color: C.navy }}>
                    {w === 'Todos' ? 'Ancho' : `Ancho ${w}`}
                  </option>
                ))}
              </select>

              {/* Perfil */}
              <select
                value={profile}
                onChange={(e) => setProfile(e.target.value)}
                style={{
                  padding: '10px 14px',
                  borderRadius: 9999,
                  border: 'none',
                  background: profile !== 'Todos' ? C.navy : '#F5F5F7',
                  color: profile !== 'Todos' ? C.white : C.navy,
                  fontFamily: F.heading,
                  fontSize: 11,
                  fontWeight: 700,
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                {availableProfiles.map((pr) => (
                  <option key={pr} value={pr} style={{ background: C.white, color: C.navy }}>
                    {pr === 'Todos' ? 'Perfil' : `Perfil ${pr}`}
                  </option>
                ))}
              </select>

              {/* Rin */}
              <select
                value={rim}
                onChange={(e) => setRim(e.target.value)}
                style={{
                  padding: '10px 14px',
                  borderRadius: 9999,
                  border: 'none',
                  background: rim !== 'Todos' ? C.navy : '#F5F5F7',
                  color: rim !== 'Todos' ? C.white : C.navy,
                  fontFamily: F.heading,
                  fontSize: 11,
                  fontWeight: 700,
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                {availableRims.map((r) => (
                  <option key={r} value={r} style={{ background: C.white, color: C.navy }}>
                    {r === 'Todos' ? 'Rin' : `Rin ${r}`}
                  </option>
                ))}
              </select>
            </div>

            {/* Right: Count + Sort + Reset + Subir/Bajar Filtros */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={resetFilters}
                  style={{
                    padding: '8px 13px',
                    borderRadius: 9999,
                    border: 'none',
                    background: 'rgba(196,30,36,0.08)',
                    color: C.red,
                    fontFamily: F.heading,
                    fontSize: 11,
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                  }}
                >
                  <RotateCcw size={12} /> Limpiar ({activeFilterCount})
                </button>
              )}

              <span style={{ fontSize: 12, color: '#64748B', fontFamily: F.body }}>
                <strong style={{ color: C.navy }}>{filteredProducts.length}</strong> modelos
              </span>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  padding: '9px 14px',
                  borderRadius: 9999,
                  border: '1px solid rgba(15, 23, 42, 0.08)',
                  background: '#FFFFFF',
                  fontFamily: F.heading,
                  fontSize: 11,
                  fontWeight: 700,
                  color: C.navy,
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value="featured">Destacados</option>
                <option value="price-asc">Menor precio</option>
                <option value="price-desc">Mayor precio</option>
                <option value="stock-desc">Mayor stock</option>
              </select>

              <button
                type="button"
                onClick={() => setFiltersExpanded((prev) => !prev)}
                style={{
                  padding: '9px 14px',
                  borderRadius: 9999,
                  border: '1px solid rgba(26, 31, 54, 0.10)',
                  background: filtersExpanded ? '#F5F5F7' : C.navy,
                  color: filtersExpanded ? C.navy : C.white,
                  fontFamily: F.heading,
                  fontSize: 11,
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  transition: 'all 0.22s ease',
                }}
              >
                <SlidersHorizontal size={12} />
                {filtersExpanded ? (
                  <>
                    Subir filtros <ChevronUp size={13} />
                  </>
                ) : (
                  <>
                    Bajar filtros <ChevronDown size={13} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* 3. ASYMMETRIC BENTO PRODUCT SHELF GRID */}
        {displayedProducts.length > 0 ? (
          <>
            <div
              className="tienda-bento-product-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(275px, 1fr))',
                gap: 24,
                gridAutoFlow: 'dense',
              }}
            >
              {displayedProducts.map((product, idx) => {
                const isSpotlight =
                  idx === 0 || (!isHomePreview && (idx === 5 || idx === 10));
                return (
                  <TiendaProductCard
                    key={product.id}
                    product={product}
                    featured={isSpotlight}
                  />
                );
              })}
            </div>

            {filteredProducts.length > visibleCount && (
              <div
                style={{
                  marginTop: 52,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 14,
                  flexWrap: 'wrap',
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    if (!isFullCatalogPage) {
                      navigateToStoreCatalog();
                      return;
                    }
                    setVisibleCount((prev) => prev + 12);
                  }}
                  style={{
                    padding: '15px 32px',
                    borderRadius: 9999,
                    border: 'none',
                    background: '#FFFFFF',
                    color: C.navy,
                    fontFamily: F.heading,
                    fontSize: 12,
                    fontWeight: 800,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    boxShadow: '0 10px 30px rgba(15, 23, 42, 0.06)',
                  }}
                >
                  Mostrar más ({filteredProducts.length - visibleCount})
                </button>

                {filteredProducts.length - visibleCount > 12 && (
                  <button
                    type="button"
                    onClick={() => {
                      if (!isFullCatalogPage) {
                        navigateToStoreCatalog();
                        return;
                      }
                      setVisibleCount(filteredProducts.length);
                    }}
                    style={{
                      padding: '15px 28px',
                      borderRadius: 9999,
                      border: 'none',
                      background: C.navy,
                      color: C.white,
                      fontFamily: F.heading,
                      fontSize: 12,
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                    }}
                  >
                    Ver todos ({filteredProducts.length})
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setFiltersExpanded(true);
                    const el = document.getElementById('medidas-pedidas');
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                  }}
                  style={{
                    padding: '15px 22px',
                    borderRadius: 9999,
                    border: '1px solid rgba(26, 31, 54, 0.12)',
                    background: 'rgba(255, 255, 255, 0.85)',
                    color: C.navy,
                    fontFamily: F.heading,
                    fontSize: 11.5,
                    fontWeight: 800,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <ChevronUp size={14} color={C.red} /> Subir a filtros
                </button>
              </div>
            )}
          </>
        ) : (
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 28,
              padding: '64px 24px',
              textAlign: 'center',
            }}
          >
            <h3
              style={{
                fontFamily: F.heading,
                fontSize: 22,
                fontWeight: 800,
                color: C.navy,
                margin: '0 0 8px',
              }}
            >
              Sin resultados para esta combinación
            </h3>
            <p style={{ fontSize: 14, color: C.gray, margin: '0 0 22px' }}>
              Restablece los filtros para explorar las {catalogProducts.length} referencias disponibles.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              style={{
                padding: '13px 26px',
                borderRadius: 9999,
                border: 'none',
                background: C.red,
                color: C.white,
                fontFamily: F.heading,
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                cursor: 'pointer',
              }}
            >
              Ver catálogo completo
            </button>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 960px) {
          .catalog-unified-discovery-grid {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
          }
          .catalog-brands-column {
            padding-left: 0 !important;
            border-left: none !important;
            padding-top: 16px !important;
            border-top: 1px solid rgba(26, 31, 54, 0.06) !important;
          }
        }
        @media (max-width: 780px) {
          .tienda-spotlight-card {
            grid-column: span 1 !important;
            grid-template-columns: 1fr !important;
          }
          .catalog-measures-pill-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .catalog-brands-tile-grid {
            grid-template-columns: repeat(3, 1fr) !important;
          }
        }
      `}</style>
    </section>
  );
}
