import { Link, useNavigate } from 'react-router-dom';
import { C, F } from '../../hooks/useAnimations';
import {
  MOST_REQUESTED_MEASURES,
  BRAND_META,
  FEATURED_BRAND_KEYS,
  useWixCatalogProducts,
  formatMXN,
} from '../../data/productosMasterData';
import { triggerTiendaUI } from '../../hooks/useTiendaState';
import { ArrowUpRight } from 'lucide-react';

const TOP_REQUESTED_TIRE_IDS = [572, 590, 568, 539];

const ALL_OFFICIAL_MENU_BRANDS = [
  'Michelin',
  'BFGoodrich',
  'Goodyear',
  'Kelly',
  'Hankook',
  'Laufenn',
  'Pirelli',
  'Firestone',
  'Bridgestone',
  'Euzkadi',
  'Continental',
  'General Tire',
  'Barum',
];

const BRAND_TILE_STYLES = {
  Michelin: { accent: '#004990' },
  BFGoodrich: { accent: '#1A1F36' },
  Goodyear: { accent: '#003399' },
  Kelly: { accent: '#15803D' },
  Hankook: { accent: '#111827' },
  Laufenn: { accent: '#E8353B' },
  Pirelli: { accent: '#D50000' },
  Firestone: { accent: '#C41E24' },
  Bridgestone: { accent: '#1A1F36' },
  Euzkadi: { accent: '#C41E24' },
  Continental: { accent: '#F59E0B' },
  'General Tire': { accent: '#C41E24' },
  Barum: { accent: '#004990' },
};

export default function TiendaMostRequestedSection({
  isCompactDropdown = false,
  mode = 'all', // 'all' | 'measures' | 'brands'
  onAfterSelect,
}) {
  const navigate = useNavigate();
  const { products: catalogProducts } = useWixCatalogProducts();

  const showMeasures = mode === 'all' || mode === 'measures';
  const showBrands = mode === 'all' || mode === 'brands';
  const showTires = mode === 'all' || mode === 'measures';
  const brandsList =
    mode === 'brands' ? ALL_OFFICIAL_MENU_BRANDS : FEATURED_BRAND_KEYS;

  const topTires = TOP_REQUESTED_TIRE_IDS.map((id) =>
    catalogProducts.find((p) => p.id === id)
  ).filter(Boolean);

  const handleSelectMeasure = (rawMeasure) => {
    if (onAfterSelect) onAfterSelect();
    const targetUrl = `/landing-tienda-preview/catalogo?measure=${encodeURIComponent(rawMeasure)}`;
    navigate(targetUrl);
    setTimeout(() => {
      triggerTiendaUI({ type: 'FILTER_CATALOG', measure: rawMeasure });
    }, 80);
  };

  const handleSelectBrand = (brandName) => {
    if (onAfterSelect) onAfterSelect();
    const targetUrl = `/landing-tienda-preview/catalogo?brand=${encodeURIComponent(brandName)}`;
    navigate(targetUrl);
    setTimeout(() => {
      triggerTiendaUI({ type: 'FILTER_CATALOG', brand: brandName });
    }, 80);
  };

  return (
    <div
      style={{
        width: '100%',
        maxWidth: isCompactDropdown ? 980 : 1180,
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: isCompactDropdown ? 26 : 52,
      }}
    >
      {/* 1. MEDIDAS MÁS PEDIDAS */}
      {showMeasures && (
        <div>
          <div
            style={{
              position: 'relative',
              textAlign: 'center',
              marginBottom: isCompactDropdown ? 18 : 28,
              paddingBottom: 12,
              borderBottom: '1px solid rgba(26, 31, 54, 0.08)',
            }}
          >
            <span
              style={{
                fontFamily: F.heading,
                fontSize: isCompactDropdown ? 11 : 12,
                fontWeight: 800,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: C.navy,
              }}
            >
              MEDIDAS MÁS <strong style={{ color: C.red }}>PEDIDAS</strong>
            </span>
            <span
              style={{
                position: 'absolute',
                bottom: -1.5,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 68,
                height: 3,
                borderRadius: 999,
                background: C.red,
              }}
            />
          </div>

          <div
            className="most-requested-measures-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: isCompactDropdown ? '10px 16px' : '16px 28px',
            }}
          >
            {MOST_REQUESTED_MEASURES.map((m) => (
              <button
                key={m.raw}
                type="button"
                onClick={() => handleSelectMeasure(m.raw)}
                className="jasman-measure-pill"
                style={{
                  padding: isCompactDropdown ? '9px 14px' : '12px 20px',
                  borderRadius: 9999,
                  border: '1px solid rgba(26, 31, 54, 0.22)',
                  background: '#FFFFFF',
                  cursor: 'pointer',
                  fontFamily: F.heading,
                  fontSize: isCompactDropdown ? 13 : 15,
                  fontWeight: 800,
                  letterSpacing: '0.02em',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  boxShadow: '0 4px 14px rgba(26, 31, 54, 0.03)',
                  transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              >
                <span style={{ color: C.navy }}>{m.prefix}</span>
                <span style={{ color: C.red, fontWeight: 900 }}>{m.rim}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 2. MARCAS (All 13 Official Brands when mode === 'brands', 5 Featured when legacy 'all') */}
      {showBrands && (
        <div>
          <div
            style={{
              position: 'relative',
              textAlign: 'center',
              marginBottom: isCompactDropdown ? 18 : 28,
              paddingBottom: 12,
              borderBottom: '1px solid rgba(26, 31, 54, 0.08)',
            }}
          >
            <span
              style={{
                fontFamily: F.heading,
                fontSize: isCompactDropdown ? 11 : 12,
                fontWeight: 800,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: C.navy,
              }}
            >
              {mode === 'brands' ? (
                <>
                  TODAS LAS <strong style={{ color: C.red }}>MARCAS OFICIALES</strong>
                </>
              ) : (
                <>
                  MARCAS MÁS <strong style={{ color: C.red }}>PEDIDAS</strong>
                </>
              )}
            </span>
            <span
              style={{
                position: 'absolute',
                bottom: -1.5,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 68,
                height: 3,
                borderRadius: 999,
                background: C.red,
              }}
            />
          </div>

          <div
            className="most-requested-brands-grid"
            style={{
              display: 'grid',
              gridTemplateColumns:
                mode === 'brands' ? 'repeat(5, 1fr)' : 'repeat(5, 1fr)',
              gap: isCompactDropdown ? 11 : 16,
            }}
          >
            {brandsList.map((brandName) => {
              const meta = BRAND_META[brandName];
              const tile = BRAND_TILE_STYLES[brandName] || { accent: C.red };
              const count = catalogProducts.filter(
                (p) => p.brand === brandName
              ).length;
              return (
                <button
                  key={brandName}
                  type="button"
                  onClick={() => handleSelectBrand(brandName)}
                  className="jasman-brand-tile"
                  style={{
                    height: isCompactDropdown ? 62 : 74,
                    padding: '10px 16px',
                    borderRadius: 14,
                    border: '1px solid rgba(26, 31, 54, 0.10)',
                    background: '#FFFFFF',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 5,
                    boxShadow: '0 6px 20px rgba(26, 31, 54, 0.04)',
                    transition: 'all 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <span
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 3,
                      background: tile.accent,
                    }}
                  />
                  {meta?.logo ? (
                    <img
                      src={meta.logo}
                      alt={brandName}
                      style={{
                        height: isCompactDropdown ? 21 : 25,
                        maxWidth: '86%',
                        width: 'auto',
                        objectFit: 'contain',
                      }}
                    />
                  ) : (
                    <span
                      style={{
                        fontFamily: F.heading,
                        fontSize: 12,
                        fontWeight: 900,
                        color: C.navy,
                        textTransform: 'uppercase',
                      }}
                    >
                      {brandName}
                    </span>
                  )}
                  {(!isCompactDropdown || mode === 'brands') && count > 0 && (
                    <span
                      style={{
                        fontFamily: F.heading,
                        fontSize: 8.5,
                        fontWeight: 700,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        color: '#94A3B8',
                      }}
                    >
                      {count} {count === 1 ? 'modelo' : 'modelos'}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. LLANTAS MÁS PEDIDAS (Top 4 Direct Product Shortcuts) */}
      {showTires && (
        <div>
          <div
            style={{
              position: 'relative',
              textAlign: 'center',
              marginBottom: isCompactDropdown ? 16 : 26,
              paddingBottom: 12,
              borderBottom: '1px solid rgba(26, 31, 54, 0.08)',
            }}
          >
            <span
              style={{
                fontFamily: F.heading,
                fontSize: isCompactDropdown ? 11 : 12,
                fontWeight: 800,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: C.navy,
              }}
            >
              LLANTAS MÁS <strong style={{ color: C.red }}>PEDIDAS</strong>
            </span>
            <span
              style={{
                position: 'absolute',
                bottom: -1.5,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 68,
                height: 3,
                borderRadius: 999,
                background: C.red,
              }}
            />
          </div>

          <div
            className="most-requested-tires-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: isCompactDropdown ? 10 : 16,
            }}
          >
            {topTires.map((tire) => (
              <Link
                key={tire.id}
                to={`/landing-tienda-preview/producto/${tire.id}`}
                onClick={() => {
                  if (onAfterSelect) onAfterSelect();
                }}
                style={{
                  padding: isCompactDropdown ? '10px 12px' : '14px 16px',
                  borderRadius: 18,
                  background: '#FFFFFF',
                  border: '1px solid rgba(26, 31, 54, 0.08)',
                  textDecoration: 'none',
                  color: C.navy,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  boxShadow: '0 8px 24px rgba(26, 31, 54, 0.04)',
                  transition: 'all 0.25s ease',
                }}
              >
                <img
                  src={tire.cutoutImage || tire.primaryImage}
                  alt={tire.cleanTitle}
                  style={{
                    width: isCompactDropdown ? 44 : 56,
                    height: isCompactDropdown ? 44 : 56,
                    objectFit: 'contain',
                    flexShrink: 0,
                  }}
                />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span
                      style={{
                        fontFamily: F.heading,
                        fontSize: 10,
                        fontWeight: 900,
                        color: C.red,
                      }}
                    >
                      {tire.measure}
                    </span>
                    <span style={{ fontSize: 10, color: '#94A3B8' }}>·</span>
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
                      fontSize: isCompactDropdown ? 11.5 : 12.5,
                      fontWeight: 800,
                      color: C.navy,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      marginTop: 2,
                    }}
                  >
                    {tire.model}
                  </div>
                  <div
                    style={{
                      fontFamily: F.heading,
                      fontSize: isCompactDropdown ? 11.5 : 13,
                      fontWeight: 900,
                      color: C.navy,
                      marginTop: 2,
                    }}
                  >
                    {formatMXN(tire.finalPriceTaxExcluded)}
                  </div>
                </div>
                <ArrowUpRight size={14} color={C.red} style={{ flexShrink: 0 }} />
              </Link>
            ))}
          </div>
        </div>
      )}

      <style>{`
        .jasman-measure-pill:hover {
          border-color: #C41E24 !important;
          background: #FFF5F5 !important;
          transform: translateY(-2px);
          box-shadow: 0 10px 24px rgba(196, 30, 36, 0.12) !important;
        }
        .jasman-brand-tile:hover {
          border-color: #C41E24 !important;
          transform: translateY(-3px);
          box-shadow: 0 14px 32px rgba(26, 31, 54, 0.09) !important;
        }
        @media (max-width: 900px) {
          .most-requested-measures-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .most-requested-brands-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .most-requested-tires-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 520px) {
          .most-requested-tires-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
