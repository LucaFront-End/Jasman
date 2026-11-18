import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import PageHero from '../components/PageHero';
import { C, F, useCountUp } from '../hooks/useAnimations';
import { sucursales as staticSucursales, regions, states } from '../data/sucursalesData';
import { useWixSucursales } from '../hooks/useWixSucursales';
import { getBranchCoords, useSmartBranchSearch } from '../utils/branchSearch';
import { MapPin, Phone, Clock, MessageCircle, Navigation, Search, ChevronRight, Building2, Users, Wrench, Shield, X } from 'lucide-react';

delete L.Icon.Default.prototype._getIconUrl;

const createIcon = (isActive) => new L.DivIcon({
  className: 'map-pin-icon',
  html: `<div class="map-pin" style="
    width:${isActive ? 32 : 22}px;height:${isActive ? 32 : 22}px;
    background:#C41E24;border-radius:50%;
    box-shadow:0 0 0 ${isActive ? 6 : 3}px rgba(196,30,36,${isActive ? 0.35 : 0.18}), 0 4px 12px rgba(196,30,36,0.5);
    border:2.5px solid white;
    transition:all 0.3s;
    cursor:pointer;
    display:flex;align-items:center;justify-content:center;color:white;font-family:'Montserrat',sans-serif;font-weight:900;font-size:${isActive ? 13 : 10}px;
    ${isActive ? 'animation:pulseGlow 2s infinite;' : ''}
  ">J</div>`,
  iconSize: [isActive ? 32 : 22, isActive ? 32 : 22],
  iconAnchor: [isActive ? 16 : 11, isActive ? 16 : 11],
  popupAnchor: [0, isActive ? -18 : -14],
});

const regionCoords = {
  'Norte': [19.52, -99.20, 11], 'Sur': [19.35, -99.15, 11],
  'Oriente': [19.40, -98.99, 10], 'Poniente': [19.41, -99.25, 11],
  'Bajio': [20.90, -101.45, 8], 'Guadalajara': [20.67, -103.35, 10],
  'Monterrey': [25.70, -100.30, 10], 'Queretaro': [20.55, -100.25, 9],
  'Michoacan': [19.75, -101.80, 8],
};

function MapController({ activeRegion, selectedLoc, sucursalesList, centerCoords, searchZoom }) {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
    const t1 = setTimeout(() => map.invalidateSize(), 150);
    const t2 = setTimeout(() => map.invalidateSize(), 500);

    if (selectedLoc) {
      const branch = sucursalesList.find(s => s.id === selectedLoc);
      if (branch) {
        const coords = getBranchCoords(branch);
        map.flyTo(coords, 14, { duration: 1.0 });
      }
    } else if (centerCoords && Number.isFinite(centerCoords[0]) && Number.isFinite(centerCoords[1])) {
      map.flyTo(centerCoords, searchZoom || 12, { duration: 1.0 });
    } else if (activeRegion && regionCoords[activeRegion]) {
      const [lat, lng, zoom] = regionCoords[activeRegion];
      map.flyTo([lat, lng], zoom, { duration: 1.2 });
    } else {
      map.flyTo([23.5, -102.5], 5, { duration: 1.2 });
    }

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [activeRegion, selectedLoc, sucursalesList, centerCoords, searchZoom, map]);
  return null;
}

function StatBadge({ number, suffix, label, icon }) {
  const { ref, count } = useCountUp(number, 2000);
  return (
    <div ref={ref} style={{
      padding: '20px 24px', borderRadius: 18,
      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
      display: 'flex', alignItems: 'center', gap: 14,
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 12,
        background: 'rgba(196,30,36,0.08)', border: '1px solid rgba(196,30,36,0.12)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>{icon}</div>
      <div>
        <div style={{ fontFamily: F.heading, fontWeight: 900, fontSize: 22, color: C.redLight }}>{count}{suffix}</div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{label}</div>
      </div>
    </div>
  );
}

export default function SucursalesPage() {
  const sucursales = useWixSucursales(staticSucursales);
  const [activeRegion, setActiveRegion] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLoc, setSelectedLoc] = useState(null);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 900 : false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const {
    filtered,
    mode: searchMode,
    centerCoords,
    zoom: searchZoom,
    contextLabel,
    isResolving,
    gpsLocation,
    gpsLoading,
    gpsError,
    locateByGps,
    clearGps,
  } = useSmartBranchSearch(sucursales, searchTerm, activeRegion);

  const grouped = useMemo(() => {
    const map = {};
    filtered.forEach(s => { if (!map[s.state]) map[s.state] = []; map[s.state].push(s); });
    return Object.entries(map).sort((a, b) => b[1].length - a[1].length);
  }, [filtered]);

  return (
    <>
      <PageHero
        tag="SUCURSALES"
        title="Encuentra tu sucursal"
        highlight="más cercana"
        subtitle={`Con ${sucursales.length} sucursales en las principales ciudades de México, siempre hay un Jasman cerca de ti.`}
        breadcrumbs={[{ label: 'Sucursales' }]}
        image="https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=1920&q=80"
      />

      {/* Stats strip */}
      <section style={{ padding: '28px 1.5rem', background: C.navy, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: 16 }}>
          <StatBadge number={sucursales.length} suffix="" label="Sucursales en México" icon={<Building2 size={20} color={C.redLight} />} />
          <StatBadge number={regions.length} suffix="" label="Regiones Cubiertas" icon={<MapPin size={20} color={C.redLight} />} />
          <StatBadge number={30} suffix="+" label="Servicios Disponibles" icon={<Wrench size={20} color={C.redLight} />} />
          <StatBadge number={states.length} suffix="" label="Estados" icon={<Shield size={20} color={C.redLight} />} />
        </div>
      </section>

      {/* Interactive map section */}
      <section style={{ padding: isMobile ? '2rem 1rem 3rem' : 'clamp(2rem, 4vw, 3rem) 1.5rem', background: C.navy }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          {/* Search + Region filters */}
          <div style={{
            display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px',
              borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
              width: isMobile ? '100%' : 'auto',
              flex: isMobile ? '1 1 100%' : '1 1 340px',
              maxWidth: isMobile ? '100%' : 480,
              boxSizing: 'border-box',
            }}>
              <Search size={16} color="rgba(255,255,255,0.45)" style={{ flexShrink: 0 }} />
              <input
                type="text"
                aria-label="Buscar sucursal por código postal, nombre, dirección, ciudad o estado"
                placeholder="Buscar por C.P. (ej. 11320), sucursal, dirección, ciudad o estado..."
                value={searchTerm}
                onChange={e => {
                  setSearchTerm(e.target.value);
                  setSelectedLoc(null);
                  if (gpsLocation) clearGps();
                }}
                style={{ border: 'none', background: 'none', outline: 'none', flex: 1, minWidth: 0, fontSize: 14, color: C.white }}
              />
              {(searchTerm || gpsLocation) && (
                <button
                  type="button"
                  aria-label="Limpiar búsqueda"
                  onClick={() => {
                    setSearchTerm('');
                    clearGps();
                    setSelectedLoc(null);
                  }}
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    border: 'none',
                    borderRadius: 9999,
                    width: 24,
                    height: 24,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: 'rgba(255,255,255,0.75)',
                    flexShrink: 0,
                  }}
                >
                  <X size={13} />
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setActiveRegion(null);
                setSelectedLoc(null);
                locateByGps();
              }}
              disabled={gpsLoading}
              style={{
                padding: '10px 16px',
                borderRadius: 12,
                border: `1px solid ${gpsLocation ? 'rgba(59,130,246,0.55)' : 'rgba(255,255,255,0.12)'}`,
                background: gpsLocation ? 'rgba(37,99,235,0.22)' : 'rgba(255,255,255,0.04)',
                color: gpsLocation ? '#93C5FD' : C.white,
                fontFamily: F.heading,
                fontWeight: 600,
                fontSize: 12,
                cursor: gpsLoading ? 'wait' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                flexShrink: 0,
                whiteSpace: 'nowrap',
              }}
            >
              <Navigation size={13} />
              {gpsLoading ? 'Ubicando...' : 'Cerca de mí'}
            </button>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', width: isMobile ? '100%' : 'auto', justifyContent: isMobile ? 'center' : 'flex-start' }}>
              <button onClick={() => { setActiveRegion(null); setSelectedLoc(null); clearGps(); }} style={{
                padding: '9px 18px', borderRadius: 12,
                border: `1px solid ${!activeRegion ? 'rgba(196,30,36,0.5)' : 'rgba(255,255,255,0.08)'}`,
                background: !activeRegion ? 'rgba(196,30,36,0.12)' : 'rgba(255,255,255,0.03)',
                color: !activeRegion ? C.white : 'rgba(255,255,255,0.5)',
                fontFamily: F.heading, fontWeight: 600, fontSize: 12, cursor: 'pointer',
              }}>Todas</button>
              {regions.map(r => (
                <button key={r} onClick={() => { setActiveRegion(prev => prev === r ? null : r); setSelectedLoc(null); clearGps(); }} style={{
                  padding: '9px 18px', borderRadius: 12,
                  border: `1px solid ${activeRegion === r ? 'rgba(196,30,36,0.5)' : 'rgba(255,255,255,0.08)'}`,
                  background: activeRegion === r ? 'rgba(196,30,36,0.12)' : 'rgba(255,255,255,0.03)',
                  color: activeRegion === r ? C.white : 'rgba(255,255,255,0.5)',
                  fontFamily: F.heading, fontWeight: 600, fontSize: 12, cursor: 'pointer',
                }}>{r}</button>
              ))}
            </div>
          </div>

          {gpsError && (
            <div style={{
              marginBottom: 16,
              padding: '10px 14px',
              borderRadius: 12,
              background: 'rgba(196,30,36,0.12)',
              border: '1px solid rgba(196,30,36,0.3)',
              color: '#FCA5A5',
              fontSize: 12,
            }}>
              {gpsError}
            </div>
          )}

          {/* Full-width map + sidebar */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 420px',
            gap: 24,
            alignItems: 'start',
          }}>
            {/* Map */}
            <div style={{
              borderRadius: isMobile ? 20 : 28,
              overflow: 'hidden',
              height: isMobile ? 380 : 640,
              width: '100%',
              border: '1px solid rgba(255,255,255,0.06)',
              boxShadow: '0 24px 64px rgba(0,0,0,0.3)',
              position: 'relative',
            }}>
              <MapContainer
                center={[23.5, -102.5]} zoom={5}
                style={{ width: '100%', height: '100%', minHeight: isMobile ? 380 : 640 }}
                zoomControl={true} dragging={true} touchZoom={true}
                doubleClickZoom={true} scrollWheelZoom={false}
                attributionControl={false}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapController
                  activeRegion={activeRegion}
                  selectedLoc={selectedLoc}
                  sucursalesList={filtered}
                  centerCoords={centerCoords}
                  searchZoom={searchZoom}
                />
                {filtered.map((loc) => {
                  const coords = getBranchCoords(loc);
                  return (
                    <Marker key={loc.id} position={coords}
                      icon={createIcon(selectedLoc === loc.id)}
                      eventHandlers={{ click: () => setSelectedLoc(prev => prev === loc.id ? null : loc.id) }}
                    >
                      <Popup>
                        <div style={{ fontFamily: F.heading, padding: '4px 2px', minWidth: 200 }}>
                          <div style={{ fontWeight: 700, fontSize: 15, color: C.navy, marginBottom: 4 }}>
                            Suc. {loc.name}
                          </div>
                          {loc.distanceFormatted && (
                            <div style={{ fontSize: 11, fontWeight: 700, color: '#15803D', marginBottom: 4 }}>
                              📏 a {loc.distanceFormatted}
                            </div>
                          )}
                          <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>📍 {loc.address.slice(0, 80)}...</div>
                          <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>📞 {loc.phone || 'No disponible'}</div>
                          <div style={{ fontSize: 12, color: '#999', marginBottom: 8 }}>🏷️ Región: {loc.region}</div>
                          <div style={{ display: 'flex', gap: 6 }}>
                            {loc.whatsappUrl && (
                              <a href={loc.whatsappUrl} target="_blank" rel="noreferrer" style={{
                                flex: 1, padding: '8px 0', borderRadius: 8,
                                background: '#25d366', color: 'white', fontWeight: 600, fontSize: 11,
                                textAlign: 'center',
                              }}>WhatsApp</a>
                            )}
                            <a href={loc.mapsUrl} target="_blank" rel="noreferrer" style={{
                              flex: 1, padding: '8px 0', borderRadius: 8,
                              background: C.navy, color: 'white', fontWeight: 600, fontSize: 11,
                              textAlign: 'center',
                            }}>Cómo Llegar</a>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
              </MapContainer>

              {/* Bottom badge */}
              <div style={{
                position: 'absolute', bottom: 16, left: 16, right: 16, zIndex: 1000,
                padding: '12px 18px', borderRadius: 14,
                background: 'rgba(26,31,54,0.9)', backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.08)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10,
              }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontFamily: F.heading, fontWeight: 700, fontSize: 13.5, color: C.white, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {contextLabel || (searchTerm.trim() ? `Búsqueda: "${searchTerm.trim()}"` : activeRegion ? `Región ${activeRegion}` : 'Todo México')}
                  </div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>
                    {filtered.length} sucursales • Mapa interactivo
                  </div>
                </div>
                <div style={{
                  padding: '6px 14px', borderRadius: 10, flexShrink: 0,
                  background: 'rgba(196,30,36,0.12)', border: '1px solid rgba(196,30,36,0.2)',
                  fontFamily: F.heading, fontWeight: 700, fontSize: 12, color: C.redLight,
                  display: 'flex', alignItems: 'center', gap: 5,
                }}>
                  <MapPin size={12} /> {filtered.length} pins
                </div>
              </div>
            </div>

            {/* Sidebar - scrollable branch list */}
            <div style={{
              display: 'flex', flexDirection: 'column', gap: 8,
              maxHeight: 640, overflowY: 'auto', paddingRight: 4,
            }} className="timeline-scroll">
              <div style={{
                padding: '14px 18px', borderRadius: 14,
                background: 'rgba(196,30,36,0.06)', border: '1px solid rgba(196,30,36,0.12)',
                fontFamily: F.heading, fontWeight: 700, fontSize: 14, color: C.white,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
                position: 'sticky', top: 0, zIndex: 10,
                backdropFilter: 'blur(12px)',
              }}>
                <span>{filtered.length} sucursales</span>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', fontWeight: 500, textAlign: 'right' }}>
                  {searchMode === 'cp-proximity' || searchMode === 'place-proximity' || searchMode === 'gps'
                    ? 'Ordenadas por cercanía'
                    : 'Click para detalles'}
                </span>
              </div>
              {contextLabel && (
                <div style={{
                  padding: '10px 14px',
                  borderRadius: 12,
                  background: 'rgba(34,197,94,0.1)',
                  border: '1px solid rgba(34,197,94,0.24)',
                  color: '#86EFAC',
                  fontSize: 12,
                  fontWeight: 600,
                }}>
                  📍 {contextLabel}
                </div>
              )}
              {isResolving && filtered.length === 0 && (
                <div style={{
                  padding: '18px',
                  borderRadius: 14,
                  background: 'rgba(255,255,255,0.03)',
                  color: 'rgba(255,255,255,0.7)',
                  fontSize: 13,
                  textAlign: 'center',
                }}>
                  Buscando sucursales cercanas...
                </div>
              )}
              {filtered.map(b => {
                const isSelected = selectedLoc === b.id;
                return (
                  <div key={b.id}
                    onClick={() => setSelectedLoc(isSelected ? null : b.id)}
                    style={{
                      padding: '16px 18px', borderRadius: 16, cursor: 'pointer',
                      background: isSelected ? 'rgba(196,30,36,0.08)' : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${isSelected ? 'rgba(196,30,36,0.3)' : 'rgba(255,255,255,0.05)'}`,
                      transition: 'all 0.3s',
                    }}
                    onMouseEnter={e => { if (!isSelected) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}}
                    onMouseLeave={e => { if (!isSelected) { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                        background: isSelected ? `linear-gradient(135deg, ${C.red}, ${C.redLight})` : 'rgba(196,30,36,0.06)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <MapPin size={15} color={isSelected ? C.white : C.redLight} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: F.heading, fontWeight: 700, fontSize: 13, color: C.white }}>Suc. {b.name}</div>
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>{b.city}, {b.state} {b.cp ? `· C.P. ${b.cp}` : ''}</div>
                      </div>
                      {b.distanceFormatted ? (
                        <span style={{
                          padding: '4px 8px', borderRadius: 6, flexShrink: 0,
                          background: 'rgba(34,197,94,0.14)', border: '1px solid rgba(34,197,94,0.28)',
                          fontSize: 10, fontWeight: 700, color: '#4ADE80', fontFamily: F.heading,
                          whiteSpace: 'nowrap',
                        }}>a {b.distanceFormatted}</span>
                      ) : (
                        <span style={{
                          padding: '3px 8px', borderRadius: 6, flexShrink: 0,
                          background: 'rgba(255,255,255,0.04)', fontSize: 9, fontWeight: 600,
                          color: 'rgba(255,255,255,0.3)', fontFamily: F.heading,
                        }}>{b.region}</span>
                      )}
                    </div>

                    {isSelected && (
                      <div style={{
                        marginTop: 12, paddingTop: 12, marginLeft: 46,
                        borderTop: '1px solid rgba(255,255,255,0.05)',
                        animation: 'heroFadeUp 0.3s ease',
                      }}>
                        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', lineHeight: 1.5, marginBottom: 10 }}>
                          {b.address}
                        </p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, fontSize: 11.5, color: 'rgba(255,255,255,0.5)', marginBottom: 10 }}>
                          {b.phone && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                              <Phone size={11} /> {b.phone}
                            </span>
                          )}
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                            <Clock size={11} /> {b.schedule || 'Lun - Sáb: 8:00 - 18:00'}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {b.whatsappUrl && (
                            <a href={b.whatsappUrl} target="_blank" rel="noreferrer"
                              onClick={e => e.stopPropagation()} style={{
                                flex: 1, padding: '9px 0', borderRadius: 10,
                                background: '#25d366', color: C.white,
                                fontFamily: F.heading, fontWeight: 700, fontSize: 11,
                                textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                              }}><MessageCircle size={12} /> WhatsApp</a>
                          )}
                          <a href={b.mapsUrl} target="_blank" rel="noreferrer"
                            onClick={e => e.stopPropagation()} style={{
                              flex: 1, padding: '9px 0', borderRadius: 10,
                              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                              color: C.white, fontFamily: F.heading, fontWeight: 600, fontSize: 11,
                              textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                            }}><Navigation size={12} /> Llegar</a>
                          <Link to={`/sucursales/${b.id}`}
                            onClick={e => e.stopPropagation()} style={{
                              flex: 1, padding: '9px 0', borderRadius: 10,
                              background: 'rgba(196,30,36,0.08)', border: '1px solid rgba(196,30,36,0.15)',
                              color: C.redLight, fontFamily: F.heading, fontWeight: 600, fontSize: 11,
                              textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                            }}>Detalle <ChevronRight size={12} /></Link>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Branch cards by state */}
      <section style={{ padding: 'clamp(3rem, 6vw, 5rem) 1.5rem', background: C.light }}>
        <div style={{ maxWidth: 1300, margin: '0 auto' }}>
          <h2 style={{ fontFamily: F.heading, fontWeight: 800, fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', color: C.navy, marginBottom: 32 }}>
            Directorio de Sucursales
          </h2>
          {grouped.map(([state, branches]) => (
            <div key={state} style={{ marginBottom: 32 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14,
                padding: '10px 18px', borderRadius: 12,
                background: C.navy, color: C.white,
              }}>
                <MapPin size={15} color={C.redLight} />
                <span style={{ fontFamily: F.heading, fontWeight: 700, fontSize: 14 }}>{state}</span>
                <span style={{
                  padding: '2px 10px', borderRadius: 9999,
                  background: 'rgba(196,30,36,0.15)', color: C.redLight,
                  fontSize: 11, fontWeight: 700,
                }}>{branches.length}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 330px), 1fr))', gap: 12 }}>
                {branches.map(b => (
                  <div key={b.id} style={{
                    padding: '18px 20px', borderRadius: 16,
                    background: C.white, border: `1px solid ${C.border}`,
                    transition: 'all 0.3s',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.05)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                        background: 'rgba(196,30,36,0.06)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}><MapPin size={16} color={C.red} /></div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                          <span style={{ fontFamily: F.heading, fontWeight: 700, fontSize: 14, color: C.navy }}>Suc. {b.name}</span>
                          {b.cp && (
                            <span style={{
                              fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 6,
                              background: 'rgba(196,30,36,0.08)', color: C.red, fontFamily: F.heading,
                            }}>
                              C.P. {b.cp}
                            </span>
                          )}
                          {b.distanceFormatted && (
                            <span style={{
                              fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 6,
                              background: 'rgba(22,163,74,0.1)', color: '#15803D', fontFamily: F.heading,
                            }}>
                              a {b.distanceFormatted}
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: 11, color: C.gray, marginTop: 2 }}>{b.city}</div>
                      </div>
                    </div>
                    <p style={{ fontSize: 12, color: C.gray, lineHeight: 1.5, marginBottom: 8 }}>{b.address}</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, fontSize: 11.5, color: C.gray, marginBottom: 12 }}>
                      {b.phone && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                          <Phone size={12} color={C.red} /> {b.phone}
                        </span>
                      )}
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                        <Clock size={12} color={C.red} /> {b.schedule || 'Lun - Sáb: 8:00 - 18:00'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {b.whatsappUrl && (
                        <a href={b.whatsappUrl} target="_blank" rel="noopener noreferrer" style={{
                          flex: 1, padding: '8px 0', borderRadius: 10,
                          background: '#25d366', color: C.white,
                          fontFamily: F.heading, fontWeight: 700, fontSize: 11,
                          textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                        }}><MessageCircle size={11} /> WhatsApp</a>
                      )}
                      <a href={b.mapsUrl} target="_blank" rel="noopener noreferrer" style={{
                        flex: 1, padding: '8px 0', borderRadius: 10,
                        background: C.navy, color: C.white,
                        fontFamily: F.heading, fontWeight: 600, fontSize: 11,
                        textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                      }}><Navigation size={11} /> Llegar</a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
