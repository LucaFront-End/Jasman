import { useState, useMemo, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { locationsContent } from '../data/content';
import { sucursales as staticSucursales, regions } from '../data/sucursalesData';
import { useWixSucursales } from '../hooks/useWixSucursales';
import { getBranchCoords, useSmartBranchSearch } from '../utils/branchSearch';
import { C, F } from '../hooks/useAnimations';
import { Phone, MapPin, Clock, Navigation, MessageCircle, ArrowRight, Search, X } from 'lucide-react';

delete L.Icon.Default.prototype._getIconUrl;

const createIcon = (isActive) => new L.DivIcon({
  className: 'map-pin-icon',
  html: `<div class="map-pin" style="
    width:${isActive ? 32 : 22}px;height:${isActive ? 32 : 22}px;
    background:#C41E24;border-radius:50%;
    box-shadow:0 0 0 ${isActive ? 6 : 3}px rgba(196,30,36,${isActive ? 0.3 : 0.18}), 0 4px 12px rgba(196,30,36,0.5);
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
  'Bajio': [20.90, -101.45, 9], 'Guadalajara': [20.67, -103.35, 11],
  'Monterrey': [25.70, -100.30, 11], 'Queretaro': [20.55, -100.25, 10],
  'Michoacan': [19.75, -101.80, 9],
};

function MapController({ activeRegion, selectedLoc, sucursalesList, centerCoords, searchZoom }) {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
    const t1 = setTimeout(() => map.invalidateSize(), 150);
    const t2 = setTimeout(() => map.invalidateSize(), 500);

    if (selectedLoc) {
      const branch = sucursalesList?.find(s => s.id === selectedLoc);
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

/* Show only a subset of branches on home (one per region, staggered) */
function buildHomeSubset(branchesList) {
  const seen = {};
  return branchesList.filter(s => {
    if (!seen[s.region]) { seen[s.region] = 0; }
    if (seen[s.region] < 3) { seen[s.region]++; return true; }
    return false;
  }).slice(0, 15);
}

export default function Locations() {
  const sucursales = useWixSucursales(staticSucursales);
  const [activeRegion, setActiveRegion] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLoc, setSelectedLoc] = useState(null);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 900 : false);
  const headerRef = useRef(null);
  const [headerVisible, setHeaderVisible] = useState(false);

  useEffect(() => {
    const el = headerRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      const timer = setTimeout(() => setHeaderVisible(true), 0);
      return () => clearTimeout(timer);
    }
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHeaderVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const {
    filtered: smartFiltered,
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

  const isSearching = searchMode !== 'all';
  const homeSubset = useMemo(() => buildHomeSubset(sucursales), [sucursales]);

  const mapLocations = useMemo(() => {
    if (isSearching) return smartFiltered;
    if (!activeRegion) return sucursales;
    return sucursales.filter(s => s.region === activeRegion);
  }, [isSearching, smartFiltered, sucursales, activeRegion]);

  const filtered = useMemo(() => {
    if (isSearching) return smartFiltered.slice(0, 15);
    if (!activeRegion) return homeSubset;
    return sucursales.filter(s => s.region === activeRegion).slice(0, 12);
  }, [isSearching, smartFiltered, sucursales, activeRegion, homeSubset]);

  return (
    <section id="locations" style={{
      padding: isMobile ? '4.5rem 1rem 3.5rem' : 'clamp(4rem, 8vw, 7rem) 0',
      background: C.navy, position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: -200, right: -200, width: 500, height: 500,
        borderRadius: '50%', border: '1px solid rgba(196,30,36,0.06)', pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: 1300, margin: '0 auto', padding: isMobile ? '0' : '0 1.5rem' }}>
        <div
          ref={headerRef}
          style={{
            textAlign: 'center',
            maxWidth: 600,
            margin: isMobile ? '0 auto 24px' : '0 auto 36px',
            opacity: headerVisible ? 1 : 0,
            transform: headerVisible ? 'translateY(0)' : 'translateY(32px)',
            transition: 'all 0.8s cubic-bezier(0.16,1,0.3,1)',
          }}
        >
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 18px', borderRadius: 9999,
            background: 'rgba(196,30,36,0.12)', color: C.redLight,
            fontFamily: F.heading, fontWeight: 600, fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase',
            marginBottom: 16,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.red, animation: 'pulseGlow 2s infinite' }} />
            {locationsContent.tag}
          </span>
          <h2 style={{
            fontFamily: F.heading, fontWeight: 800, fontSize: 'clamp(1.8rem, 4.5vw, 3rem)',
            color: C.white, lineHeight: 1.15, letterSpacing: '-0.02em',
          }}>
            {locationsContent.title}{' '}
            <span className="animated-gradient" style={{
              background: `linear-gradient(135deg, ${C.redLight}, ${C.amber}, ${C.redLight})`,
              backgroundSize: '200% 200%', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>{locationsContent.titleHighlight}</span>
          </h2>
        </div>

        {/* Smart Branch Search (C.P., name, address, city, state + GPS) */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSelectedLoc(filtered[0]?.id || null);
          }}
          style={{
            maxWidth: 740,
            margin: '0 auto 18px',
            display: 'flex',
            gap: 10,
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 14px',
            borderRadius: 14,
            background: '#FFFFFF',
            border: '2px solid rgba(196,30,36,0.35)',
            boxShadow: '0 10px 28px rgba(0,0,0,0.25)',
            flex: '1 1 280px',
            minWidth: 0,
            boxSizing: 'border-box',
          }}>
            <Search size={18} color={C.red} style={{ flexShrink: 0 }} />
            <input
              type="text"
              aria-label="Buscar sucursal por C.P., nombre, dirección, ciudad o estado"
              placeholder="Buscar sucursal por C.P. (ej. 11320), dirección, ciudad o estado..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setSelectedLoc(null);
                if (gpsLocation) clearGps();
              }}
              style={{
                border: 'none',
                background: 'none',
                outline: 'none',
                flex: 1,
                minWidth: 0,
                fontSize: 14,
                fontWeight: 600,
                color: C.navy,
              }}
            />
            {(searchTerm || gpsLocation) && (
              <button
                type="button"
                aria-label="Limpiar búsqueda de sucursal"
                onClick={() => {
                  setSearchTerm('');
                  clearGps();
                  setSelectedLoc(null);
                }}
                style={{
                  background: 'rgba(26,31,54,0.08)',
                  border: 'none',
                  borderRadius: 9999,
                  width: 24,
                  height: 24,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: C.navy,
                  flexShrink: 0,
                }}
              >
                <X size={13} />
              </button>
            )}
          </div>
          <button
            type="submit"
            style={{
              padding: isMobile ? '11px 16px' : '12px 18px',
              borderRadius: 14,
              border: 'none',
              background: C.red,
              color: C.white,
              fontFamily: F.heading,
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              flexShrink: 0,
              whiteSpace: 'nowrap',
            }}
          >
            <Search size={14} /> Buscar
          </button>
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
              padding: isMobile ? '11px 14px' : '12px 16px',
              borderRadius: 14,
              border: `1px solid ${gpsLocation ? '#60A5FA' : 'rgba(255,255,255,0.22)'}`,
              background: gpsLocation ? '#2563EB' : 'rgba(255,255,255,0.1)',
              color: C.white,
              fontFamily: F.heading,
              fontWeight: 700,
              fontSize: 12.5,
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
        </form>

        {gpsError && (
          <div style={{
            maxWidth: 680,
            margin: '0 auto 14px',
            padding: '8px 14px',
            borderRadius: 10,
            background: 'rgba(196,30,36,0.14)',
            border: '1px solid rgba(196,30,36,0.3)',
            color: '#FCA5A5',
            fontSize: 12,
            textAlign: 'center',
          }}>
            {gpsError}
          </div>
        )}

        {/* Region filter: clean wrap without horizontal scroll on all screens */}
        <div className="locations-regions-bar" style={{
          display: 'flex', gap: 6,
          justifyContent: 'center',
          overflowX: 'visible',
          flexWrap: 'wrap',
          marginBottom: isMobile ? 20 : 40,
          padding: 0,
        }}>
          <button onClick={() => { setActiveRegion(null); setSelectedLoc(null); clearGps(); }} style={{
            padding: isMobile ? '8px 16px' : '10px 20px', borderRadius: 12,
            border: `1px solid ${!activeRegion ? 'rgba(196,30,36,0.5)' : 'rgba(255,255,255,0.08)'}`,
            background: !activeRegion ? 'rgba(196,30,36,0.12)' : 'rgba(255,255,255,0.03)',
            color: !activeRegion ? C.white : 'rgba(255,255,255,0.5)',
            fontFamily: F.heading, fontWeight: 600, fontSize: isMobile ? 12 : 13, cursor: 'pointer',
            transition: 'all 0.3s', flexShrink: 0, whiteSpace: 'nowrap',
          }}
            onMouseEnter={e => { if (activeRegion) { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = C.white; }}}
            onMouseLeave={e => { if (activeRegion) { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}}
          >Todas</button>
          {regions.map(r => (
            <button key={r} onClick={() => { setActiveRegion(prev => prev === r ? null : r); setSelectedLoc(null); clearGps(); }} style={{
              padding: isMobile ? '8px 16px' : '10px 20px', borderRadius: 12,
              border: `1px solid ${activeRegion === r ? 'rgba(196,30,36,0.5)' : 'rgba(255,255,255,0.08)'}`,
              background: activeRegion === r ? 'rgba(196,30,36,0.12)' : 'rgba(255,255,255,0.03)',
              color: activeRegion === r ? C.white : 'rgba(255,255,255,0.5)',
              fontFamily: F.heading, fontWeight: 600, fontSize: isMobile ? 12 : 13, cursor: 'pointer',
              transition: 'all 0.3s', flexShrink: 0, whiteSpace: 'nowrap',
            }}
              onMouseEnter={e => { if (activeRegion !== r) { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = C.white; }}}
              onMouseLeave={e => { if (activeRegion !== r) { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}}
            >{r}</button>
          ))}
        </div>

        {/* Map + Cards Responsive Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1.1fr 0.9fr',
          gap: isMobile ? 24 : 32,
          alignItems: 'start',
        }}>
          <div style={{
            borderRadius: isMobile ? 20 : 28, overflow: 'hidden',
            height: isMobile ? 380 : 560,
            width: '100%',
            border: '1px solid rgba(255,255,255,0.06)',
            boxShadow: '0 24px 64px rgba(0,0,0,0.3)', position: 'relative',
            isolation: 'isolate',
            zIndex: 1,
          }}>
            <MapContainer
              center={[23.5, -102.5]} zoom={5}
              style={{ width: '100%', height: '100%', minHeight: isMobile ? 380 : 560 }}
              zoomControl={true} dragging={true} touchZoom={true}
              doubleClickZoom={true} scrollWheelZoom={false}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapController
                activeRegion={activeRegion}
                selectedLoc={selectedLoc}
                sucursalesList={mapLocations}
                centerCoords={centerCoords}
                searchZoom={searchZoom}
              />
              {mapLocations.map((loc) => {
                const coords = getBranchCoords(loc);
                return (
                  <Marker key={loc.id} position={coords}
                    icon={createIcon(selectedLoc === loc.id)}
                    eventHandlers={{ click: () => setSelectedLoc(prev => prev === loc.id ? null : loc.id) }}
                  >
                    <Popup>
                      <div style={{ fontFamily: F.heading, padding: '4px 2px', minWidth: 180 }}>
                        <div style={{ fontWeight: 700, fontSize: 14, color: C.navy, marginBottom: 4 }}>
                          Suc. {loc.name}
                        </div>
                        {loc.distanceFormatted && (
                          <div style={{ fontSize: 11, fontWeight: 700, color: '#15803D', marginBottom: 4 }}>
                            📏 a {loc.distanceFormatted}
                          </div>
                        )}
                        <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>📍 {loc.address.slice(0, 60)}...</div>
                        <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>📞 {loc.phone || 'No disponible'}</div>
                        <div style={{ display: 'flex', gap: 6 }}>
                          {loc.whatsappUrl && (
                            <a href={loc.whatsappUrl} target="_blank" rel="noreferrer" style={{
                              flex: 1, padding: '7px 0', borderRadius: 8,
                              background: '#25d366', color: 'white', fontWeight: 600, fontSize: 11,
                              textAlign: 'center', display: 'block',
                            }}>WhatsApp</a>
                          )}
                          <a href={loc.mapsUrl} target="_blank" rel="noreferrer" style={{
                            flex: 1, padding: '7px 0', borderRadius: 8,
                            background: C.navy, color: 'white', fontWeight: 600, fontSize: 11,
                            textAlign: 'center', display: 'block',
                          }}>Llegar</a>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
            <div style={{
              position: 'absolute', bottom: 20, left: 20, right: 20, zIndex: 800,
              padding: '14px 20px', borderRadius: 16,
              background: 'rgba(26,31,54,0.85)', backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.08)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10,
            }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontFamily: F.heading, fontWeight: 700, fontSize: 13.5, color: C.white, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {contextLabel || (searchTerm.trim() ? `Búsqueda: "${searchTerm.trim()}"` : activeRegion ? `Región ${activeRegion}` : 'Todo México')}
                </div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
                  {mapLocations.length} sucursales en el mapa • Click en un pin para ver detalles
                </div>
              </div>
              <div style={{
                padding: '7px 14px', borderRadius: 10, flexShrink: 0,
                background: 'rgba(196,30,36,0.12)', border: '1px solid rgba(196,30,36,0.25)',
                display: 'flex', alignItems: 'center', gap: 5,
              }}>
                <MapPin size={13} color={C.redLight} />
                <span style={{ fontFamily: F.heading, fontWeight: 700, fontSize: 12, color: C.redLight }}>
                  {mapLocations.length} pines activos
                </span>
              </div>
            </div>
          </div>

          {/* Cards */}
          <div style={{
            display: 'flex', flexDirection: 'column', gap: 10,
            maxHeight: 560, overflowY: 'auto', paddingRight: 4,
          }} className="timeline-scroll">
            {contextLabel && (
              <div style={{
                padding: '10px 14px',
                borderRadius: 12,
                background: 'rgba(34,197,94,0.1)',
                border: '1px solid rgba(34,197,94,0.25)',
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
                borderRadius: 16,
                background: 'rgba(255,255,255,0.03)',
                color: 'rgba(255,255,255,0.7)',
                fontSize: 13,
                textAlign: 'center',
              }}>
                Buscando sucursales cercanas...
              </div>
            )}
            {filtered.map((loc) => {
              const isSelected = selectedLoc === loc.id;
              return (
                <div key={loc.id}
                  onClick={() => setSelectedLoc(isSelected ? null : loc.id)}
                  style={{
                    padding: '18px 20px', borderRadius: 20, cursor: 'pointer',
                    background: isSelected ? 'rgba(196,30,36,0.08)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${isSelected ? 'rgba(196,30,36,0.35)' : 'rgba(255,255,255,0.06)'}`,
                    transition: 'all 0.4s cubic-bezier(0.16,1,0.3,1)',
                  }}
                  onMouseEnter={e => { if (!isSelected) { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}}
                  onMouseLeave={e => { if (!isSelected) { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; }}}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 38, height: 38, borderRadius: 11, flexShrink: 0,
                      background: isSelected ? `linear-gradient(135deg, ${C.red}, ${C.redLight})` : 'rgba(196,30,36,0.08)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <MapPin size={16} color={isSelected ? C.white : C.redLight} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: F.heading, fontWeight: 700, fontSize: 14, color: C.white }}>Suc. {loc.name}</div>
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{loc.city}, {loc.state} {loc.cp ? `· C.P. ${loc.cp}` : ''}</div>
                    </div>
                    {loc.distanceFormatted ? (
                      <span style={{
                        padding: '4px 10px', borderRadius: 8, flexShrink: 0,
                        background: 'rgba(34,197,94,0.14)', border: '1px solid rgba(34,197,94,0.28)',
                        color: '#4ADE80', fontSize: 10.5, fontWeight: 700, fontFamily: F.heading,
                        whiteSpace: 'nowrap',
                      }}>a {loc.distanceFormatted}</span>
                    ) : (
                      <span style={{
                        padding: '4px 10px', borderRadius: 8, flexShrink: 0,
                        background: 'rgba(196,30,36,0.08)', color: C.redLight,
                        fontSize: 10, fontWeight: 600, fontFamily: F.heading,
                      }}>{loc.region}</span>
                    )}
                  </div>

                  {isSelected && (
                    <div style={{
                      marginTop: 14, paddingTop: 14, marginLeft: 50,
                      borderTop: '1px solid rgba(255,255,255,0.06)',
                      animation: 'heroFadeUp 0.3s cubic-bezier(0.16,1,0.3,1)',
                    }}>
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 10, lineHeight: 1.5 }}>
                        {loc.address}
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 12, fontSize: 11.5, color: 'rgba(255,255,255,0.55)' }}>
                        {loc.phone && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                            <Phone size={12} color={C.redLight} /> {loc.phone}
                          </span>
                        )}
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                          <Clock size={12} color={C.redLight} /> {loc.schedule || 'Lun - Sáb: 8:00 - 18:00'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {loc.whatsappUrl && (
                          <a href={loc.whatsappUrl} target="_blank" rel="noreferrer"
                            onClick={e => e.stopPropagation()} style={{
                              flex: 1, padding: '11px 0', borderRadius: 12,
                              background: '#25d366', color: C.white,
                              fontFamily: F.heading, fontWeight: 700, fontSize: 12,
                              textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                            }}><MessageCircle size={13} /> WhatsApp</a>
                        )}
                        <a href={loc.mapsUrl} target="_blank" rel="noreferrer"
                          onClick={e => e.stopPropagation()} style={{
                            flex: 1, padding: '11px 0', borderRadius: 12,
                            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                            color: C.white, fontFamily: F.heading, fontWeight: 600, fontSize: 12,
                            textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                          }}><Navigation size={13} /> Cómo Llegar</a>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            {/* See all CTA */}
            <Link to="/sucursales" style={{
              padding: '16px 20px', borderRadius: 20, textAlign: 'center',
              background: `linear-gradient(135deg, ${C.red}15, ${C.red}08)`,
              border: '1px solid rgba(196,30,36,0.2)',
              color: C.redLight, fontFamily: F.heading, fontWeight: 700, fontSize: 14,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'all 0.3s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(196,30,36,0.12)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(196,30,36,0.06)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              Ver las {sucursales.length} sucursales <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
