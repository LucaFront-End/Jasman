import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { C, F } from '../../hooks/useAnimations';
import {
  MOST_REQUESTED_MEASURES,
  BRAND_META,
  FEATURED_BRAND_KEYS,
  ALL_OFFICIAL_MENU_BRANDS,
  VEHICLE_TYPE_OPTIONS,
  POPULAR_CAR_MODELS,
  useWixCatalogProducts,
  formatMXN,
} from '../../data/productosMasterData';
import { triggerTiendaUI } from '../../hooks/useTiendaState';
import TiendaVehicleSvg from './TiendaVehicleTypeIcons';
import { ArrowUpRight } from 'lucide-react';

const TOP_REQUESTED_TIRE_IDS = [572, 590, 568, 539];

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
  const [hoveredVehicleId, setHoveredVehicleId] = useState(null);

  const showMeasures = mode === 'all' || mode === 'measures';
  const showBrands = mode === 'all' || mode === 'brands';
  const showVehicleTypes = mode === 'brands';
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

  const handleSelectVehicle = (vehicleId) => {
    if (onAfterSelect) onAfterSelect();
    const targetUrl = `/landing-tienda-preview/catalogo?vehicle=${encodeURIComponent(vehicleId)}`;
    navigate(targetUrl);
    setTimeout(() => {
      triggerTiendaUI({ type: 'FILTER_CATALOG', vehicle: vehicleId });
    }, 80);
  };

  const handleSelectCarModel = (carModelObj) => {
    if (onAfterSelect) onAfterSelect();
    const targetUrl = `/landing-tienda-preview/catalogo?vehicle=${encodeURIComponent(
      carModelObj.vehicle
    )}&carModel=${encodeURIComponent(carModelObj.id)}`;
    navigate(targetUrl);
    setTimeout(() => {
      triggerTiendaUI({
        type: 'FILTER_CATALOG',
        vehicle: carModelObj.vehicle,
        carModel: carModelObj.id,
      });
    }, 80);
  };

  return (
    <div
      style={{
        width: '100%',
        maxWidth: isCompactDropdown ? 1040 : 1180,
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: isCompactDropdown ? 20 : 48,
      }}
    >
      {/* 1. MEDIDAS MÁS PEDIDAS */}
      {showMeasures && (
        <div>
          <div
            style={{
              position: 'relative',
              textAlign: 'center',
              marginBottom: isCompactDropdown ? 16 : 28,
              paddingBottom: 11,
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
              marginBottom: isCompactDropdown ? 14 : 26,
              paddingBottom: 10,
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
            className={
              mode === 'brands' && isCompactDropdown
                ? 'most-requested-brands-grid-compact13'
                : 'most-requested-brands-grid'
            }
            style={{
              display: 'grid',
              gridTemplateColumns:
                mode === 'brands' && isCompactDropdown
                  ? 'repeat(7, minmax(0, 1fr))'
                  : 'repeat(5, minmax(0, 1fr))',
              gap: isCompactDropdown ? 9 : 16,
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
                    height: isCompactDropdown ? 54 : 74,
                    padding: isCompactDropdown ? '8px 10px' : '10px 16px',
                    borderRadius: 14,
                    border: '1px solid rgba(26, 31, 54, 0.10)',
                    background: '#FFFFFF',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 4,
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
                      height: 2.5,
                      background: tile.accent,
                    }}
                  />
                  {meta?.logo ? (
                    <img
                      src={meta.logo}
                      alt={brandName}
                      style={{
                        height: isCompactDropdown ? 18 : 25,
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
                        fontWeight: 900,
                        color: C.navy,
                        textTransform: 'uppercase',
                      }}
                    >
                      {brandName}
                    </span>
                  )}
                  {count > 0 && (
                    <span
                      style={{
                        fontFamily: F.heading,
                        fontSize: 8,
                        fontWeight: 700,
                        letterSpacing: '0.07em',
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

      {/* 2B. TIPO DE VEHÍCULO & MODELOS DE AUTOS (Below Marcas in Marcas Dropdown) */}
      {showVehicleTypes && (
        <div>
          <div
            style={{
              position: 'relative',
              textAlign: 'center',
              marginBottom: isCompactDropdown ? 14 : 22,
              paddingBottom: 10,
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
              TIPO DE VEHÍCULO · <strong style={{ color: C.red }}>MODELOS DE AUTOS</strong>
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

          {/* 8 Custom Minimalist Vehicle Type SVG Cards */}
          <div
            className="most-requested-vehicles-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
              gap: isCompactDropdown ? 10 : 14,
            }}
          >
            {VEHICLE_TYPE_OPTIONS.map((vt) => {
              const isHovered = hoveredVehicleId === vt.id;
              const count = catalogProducts.filter((p) =>
                Array.isArray(p.vehicleTypes)
                  ? p.vehicleTypes.includes(vt.id)
                  : p.vehicleType === vt.id
              ).length;

              return (
                <button
                  key={vt.id}
                  type="button"
                  onClick={() => handleSelectVehicle(vt.id)}
                  onMouseEnter={() => setHoveredVehicleId(vt.id)}
                  onMouseLeave={() => setHoveredVehicleId(null)}
                  className="jasman-vehicle-type-card"
                  style={{
                    padding: isCompactDropdown ? '10px 12px' : '14px 16px',
                    borderRadius: 16,
                    border: isHovered
                      ? `1.5px solid ${C.red}`
                      : '1px solid rgba(26, 31, 54, 0.09)',
                    background: isHovered ? '#FFF7F7' : '#FFFFFF',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    textAlign: 'left',
                    boxShadow: isHovered
                      ? '0 14px 28px rgba(196, 30, 36, 0.11)'
                      : '0 4px 14px rgba(26, 31, 54, 0.035)',
                    transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
                    transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                    position: 'relative',
                  }}
                >
                  <div
                    style={{
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                      transition: 'transform 0.25s ease',
                    }}
                  >
                    <TiendaVehicleSvg
                      type={vt.id}
                      active={isHovered}
                      width={isCompactDropdown ? 72 : 84}
                      height={isCompactDropdown ? 28 : 32}
                    />
                  </div>

                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 6,
                      }}
                    >
                      <span
                        style={{
                          fontFamily: F.heading,
                          fontSize: isCompactDropdown ? 12 : 13,
                          fontWeight: 900,
                          color: isHovered ? C.red : C.navy,
                          letterSpacing: '-0.01em',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {vt.label}
                      </span>
                      <span
                        style={{
                          padding: '1.5px 6px',
                          borderRadius: 9999,
                          background: isHovered ? C.red : '#F1F5F9',
                          color: isHovered ? '#FFFFFF' : '#64748B',
                          fontFamily: F.heading,
                          fontSize: 8.5,
                          fontWeight: 800,
                          flexShrink: 0,
                        }}
                      >
                        {count}
                      </span>
                    </div>
                    <div
                      style={{
                        fontFamily: F.body,
                        fontSize: 10,
                        color: '#64748B',
                        marginTop: 2,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {vt.modelsText}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Popular Car Models Quick Strip ("Modelos de Autos") */}
          <div
            style={{
              marginTop: 12,
              padding: '10px 14px',
              borderRadius: 16,
              background: '#F8FAFC',
              border: '1px solid rgba(26, 31, 54, 0.06)',
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 6,
            }}
          >
            <span
              style={{
                fontFamily: F.heading,
                fontSize: 9.5,
                fontWeight: 800,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: C.red,
                marginRight: 4,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9" />
                <circle cx="12" cy="12" r="2.5" />
                <path d="M12 3v6.5M4.2 16.5l5.6-3.2M19.8 16.5l-5.6-3.2" />
              </svg>
              Modelos frecuentes:
            </span>

            {POPULAR_CAR_MODELS.slice(0, 14).map((cm) => (
              <button
                key={cm.id}
                type="button"
                onClick={() => handleSelectCarModel(cm)}
                className="jasman-car-model-chip"
                style={{
                  padding: '4px 10px',
                  borderRadius: 9999,
                  border: '1px solid rgba(26, 31, 54, 0.11)',
                  background: '#FFFFFF',
                  cursor: 'pointer',
                  fontFamily: F.heading,
                  fontSize: 10.5,
                  fontWeight: 700,
                  color: C.navy,
                  transition: 'all 0.2s ease',
                }}
              >
                {cm.id}
              </button>
            ))}
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
                    {formatMXN(tire.finalPriceTaxExcluded)}{' '}
                    <span style={{ fontSize: 9.5, fontWeight: 700, color: '#94A3B8' }}>
                      Con IVA
                    </span>
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
        .jasman-car-model-chip:hover {
          border-color: #C41E24 !important;
          background: #FFF5F5 !important;
          color: #C41E24 !important;
          transform: translateY(-1px);
        }
        @media (max-width: 1020px) {
          .most-requested-brands-grid-compact13 {
            grid-template-columns: repeat(4, 1fr) !important;
          }
          .most-requested-vehicles-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
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
          .most-requested-tires-grid,
          .most-requested-vehicles-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
