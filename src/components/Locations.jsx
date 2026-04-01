import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { locationsContent } from '../data/content';
import { sucursales, regions } from '../data/sucursalesData';
import { C, F, useReveal } from '../hooks/useAnimations';
import { Phone, MapPin, Clock, Navigation, MessageCircle, ArrowRight } from 'lucide-react';

delete L.Icon.Default.prototype._getIconUrl;

const createIcon = (isActive) => new L.DivIcon({
  className: 'map-pin-icon',
  html: `<div class="map-pin" style="
    width:${isActive ? 30 : 22}px;height:${isActive ? 30 : 22}px;
    background:#C41E24;border-radius:50%;
    box-shadow:0 0 0 ${isActive ? 6 : 3}px rgba(196,30,36,${isActive ? 0.25 : 0.15}), 0 4px 12px rgba(196,30,36,0.5);
    border:3px solid white;
    transition:all 0.3s;
    cursor:pointer;
    ${isActive ? 'animation:pulseGlow 2s infinite;' : ''}
  "></div>`,
  iconSize: [isActive ? 30 : 22, isActive ? 30 : 22],
  iconAnchor: [isActive ? 15 : 11, isActive ? 15 : 11],
  popupAnchor: [0, isActive ? -18 : -14],
});

/* Approximate geocoords by city for pins (subset for home page) */
const cityGeo = {
  'Atizapán de Zaragoza': [19.5567, -99.2456], 'Azcapotzalco': [19.4913, -99.1823],
  'Cuautitlán Izcalli': [19.6486, -99.2104], 'Naucalpan de Juárez': [19.4784, -99.2400],
  'Pachuca de Soto': [20.0911, -98.7624], 'Tlalnepantla De Baz': [19.5381, -99.1996],
  'Gustavo A. Madero': [19.4917, -99.1168], 'Álvaro Obregón': [19.3588, -99.2122],
  'Miguel Hidalgo': [19.4326, -99.1920], 'Cuauhtémoc': [19.4285, -99.1550],
  'Tlalpan': [19.2843, -99.1682], 'Benito Juárez': [19.3718, -99.1571],
  'Coyoacán': [19.3437, -99.1562], 'Venustiano Carranza': [19.4395, -99.1068],
  'Iztapalapa': [19.3548, -99.0728], 'Iztacalco': [19.3961, -99.1004],
  'Nezahualcóyotl': [19.4006, -98.9884], 'Los Reyes La Paz': [19.3629, -98.9671],
  'Chalco': [19.2649, -98.8968], 'Texcoco': [19.5117, -98.8817],
  'Cuautla': [18.8107, -98.9543], 'Toluca': [19.2826, -99.6557],
  'Salamanca': [20.5740, -101.1950], 'Guanajuato': [21.0190, -101.2574],
  'León de los Aldama': [21.1221, -101.6837], 'Irapuato': [20.6736, -101.3497],
  'Guadalajara': [20.6720, -103.3525], 'Zapopan': [20.7214, -103.3919],
  'Tepic': [21.5049, -104.8946],
  'San Pedro Garza García': [25.6577, -100.4031], 'Guadalupe': [25.6768, -100.2560],
  'Monterrey': [25.6866, -100.3161], 'San Nicolás de los Garza': [25.7456, -100.2833],
  'Nuevo Laredo': [27.4763, -99.5066],
  'Santiago de Querétaro': [20.5888, -100.3899], 'San Juan del Río': [20.3893, -99.9961],
  'Celaya': [20.5233, -100.8157],
  'Morelia': [19.7060, -101.1950], 'Los Reyes': [19.5849, -102.4762], 'Zamora': [19.9862, -102.2833],
};

const regionCoords = {
  'Norte': [19.52, -99.20, 11], 'Sur': [19.35, -99.15, 11],
  'Oriente': [19.40, -98.99, 10], 'Poniente': [19.41, -99.25, 11],
  'Bajio': [20.90, -101.45, 9], 'Guadalajara': [20.67, -103.35, 11],
  'Monterrey': [25.70, -100.30, 11], 'Queretaro': [20.55, -100.25, 10],
  'Michoacan': [19.75, -101.80, 9],
};

function MapController({ activeRegion }) {
  const map = useMap();
  useEffect(() => {
    if (activeRegion && regionCoords[activeRegion]) {
      const [lat, lng, zoom] = regionCoords[activeRegion];
      map.flyTo([lat, lng], zoom, { duration: 1.2 });
    } else {
      map.flyTo([23.5, -102.5], 5, { duration: 1.2 });
    }
  }, [activeRegion, map]);
  return null;
}

/* Show only a subset of branches on home (one per region, staggered) */
const homeSubset = (() => {
  const seen = {};
  return sucursales.filter(s => {
    if (!seen[s.region]) { seen[s.region] = 0; }
    if (seen[s.region] < 3) { seen[s.region]++; return true; }
    return false;
  }).slice(0, 15);
})();

export default function Locations() {
  const [activeRegion, setActiveRegion] = useState(null);
  const [selectedLoc, setSelectedLoc] = useState(null);
  const header = useReveal();

  const filtered = useMemo(() => {
    if (!activeRegion) return homeSubset;
    return sucursales.filter(s => s.region === activeRegion).slice(0, 12);
  }, [activeRegion]);

  const regionCounts = {};
  regions.forEach(r => { regionCounts[r] = sucursales.filter(s => s.region === r).length; });

  const getCoords = (b) => {
    const geo = cityGeo[b.city];
    if (geo) return [geo[0] + (Math.random() - 0.5) * 0.01, geo[1] + (Math.random() - 0.5) * 0.01];
    return [19.43, -99.13];
  };

  return (
    <section id="locations" style={{
      padding: 'clamp(4rem, 8vw, 7rem) 0',
      background: C.navy, position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: -200, right: -200, width: 500, height: 500,
        borderRadius: '50%', border: '1px solid rgba(196,30,36,0.06)', pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: 1300, margin: '0 auto', padding: '0 1.5rem' }}>
        <div ref={header.ref} style={{ textAlign: 'center', maxWidth: 600, margin: '0 auto 48px', ...header.style }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 18px', borderRadius: 9999,
            background: 'rgba(196,30,36,0.12)', color: C.redLight,
            fontFamily: F.heading, fontWeight: 600, fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase',
            marginBottom: 20,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.red, animation: 'pulseGlow 2s infinite' }} />
            {locationsContent.tag}
          </span>
          <h2 style={{
            fontFamily: F.heading, fontWeight: 800, fontSize: 'clamp(2rem, 5vw, 3rem)',
            color: C.white, lineHeight: 1.12, letterSpacing: '-0.02em',
          }}>
            {locationsContent.title}{' '}
            <span className="animated-gradient" style={{
              background: `linear-gradient(135deg, ${C.redLight}, ${C.amber}, ${C.redLight})`,
              backgroundSize: '200% 200%', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>{locationsContent.titleHighlight}</span>
          </h2>
        </div>

        {/* Region filter */}
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 40 }}>
          <button onClick={() => { setActiveRegion(null); setSelectedLoc(null); }} style={{
            padding: '10px 20px', borderRadius: 12,
            border: `1px solid ${!activeRegion ? 'rgba(196,30,36,0.5)' : 'rgba(255,255,255,0.08)'}`,
            background: !activeRegion ? 'rgba(196,30,36,0.12)' : 'rgba(255,255,255,0.03)',
            color: !activeRegion ? C.white : 'rgba(255,255,255,0.5)',
            fontFamily: F.heading, fontWeight: 600, fontSize: 13, cursor: 'pointer',
            transition: 'all 0.3s',
          }}
            onMouseEnter={e => { if (activeRegion) { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = C.white; }}}
            onMouseLeave={e => { if (activeRegion) { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}}
          >Todas ({sucursales.length})</button>
          {regions.map(r => (
            <button key={r} onClick={() => { setActiveRegion(prev => prev === r ? null : r); setSelectedLoc(null); }} style={{
              padding: '10px 20px', borderRadius: 12,
              border: `1px solid ${activeRegion === r ? 'rgba(196,30,36,0.5)' : 'rgba(255,255,255,0.08)'}`,
              background: activeRegion === r ? 'rgba(196,30,36,0.12)' : 'rgba(255,255,255,0.03)',
              color: activeRegion === r ? C.white : 'rgba(255,255,255,0.5)',
              fontFamily: F.heading, fontWeight: 600, fontSize: 13, cursor: 'pointer',
              transition: 'all 0.3s',
            }}
              onMouseEnter={e => { if (activeRegion !== r) { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = C.white; }}}
              onMouseLeave={e => { if (activeRegion !== r) { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}}
            >{r} ({regionCounts[r]})</button>
          ))}
        </div>

        {/* Map + Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 32, alignItems: 'start' }}>
          <div style={{
            borderRadius: 28, overflow: 'hidden', height: 560,
            border: '1px solid rgba(255,255,255,0.06)',
            boxShadow: '0 24px 64px rgba(0,0,0,0.3)', position: 'relative',
          }}>
            <MapContainer
              center={[23.5, -102.5]} zoom={5}
              style={{ width: '100%', height: '100%' }}
              zoomControl={false} dragging={false} touchZoom={false}
              doubleClickZoom={false} scrollWheelZoom={false} boxZoom={false}
              keyboard={false} attributionControl={false}
            >
              <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
              <MapController activeRegion={activeRegion} />
              {filtered.map((loc) => {
                const coords = getCoords(loc);
                return (
                  <Marker key={loc.id} position={coords}
                    icon={createIcon(selectedLoc === loc.id)}
                    eventHandlers={{ click: () => setSelectedLoc(prev => prev === loc.id ? null : loc.id) }}
                  >
                    <Popup>
                      <div style={{ fontFamily: F.heading, padding: '4px 2px', minWidth: 180 }}>
                        <div style={{ fontWeight: 700, fontSize: 14, color: C.navy, marginBottom: 6 }}>
                          Suc. {loc.name}
                        </div>
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
              position: 'absolute', bottom: 20, left: 20, right: 20, zIndex: 1000,
              padding: '14px 20px', borderRadius: 16,
              background: 'rgba(26,31,54,0.85)', backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.08)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div>
                <div style={{ fontFamily: F.heading, fontWeight: 700, fontSize: 14, color: C.white }}>
                  {activeRegion || 'Todo México'}
                </div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
                  {filtered.length} sucursales mostrando • Click en un pin
                </div>
              </div>
              <div style={{
                padding: '7px 14px', borderRadius: 10,
                background: 'rgba(196,30,36,0.12)', border: '1px solid rgba(196,30,36,0.25)',
                display: 'flex', alignItems: 'center', gap: 5,
              }}>
                <MapPin size={13} color={C.redLight} />
                <span style={{ fontFamily: F.heading, fontWeight: 700, fontSize: 12, color: C.redLight }}>
                  {sucursales.length}+ sucursales
                </span>
              </div>
            </div>
          </div>

          {/* Cards */}
          <div style={{
            display: 'flex', flexDirection: 'column', gap: 10,
            maxHeight: 560, overflowY: 'auto', paddingRight: 4,
          }} className="timeline-scroll">
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
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{loc.city}, {loc.state}</div>
                    </div>
                    <span style={{
                      padding: '4px 10px', borderRadius: 8,
                      background: 'rgba(196,30,36,0.08)', color: C.redLight,
                      fontSize: 10, fontWeight: 600, fontFamily: F.heading,
                    }}>{loc.region}</span>
                  </div>

                  {isSelected && (
                    <div style={{
                      marginTop: 14, paddingTop: 14, marginLeft: 50,
                      borderTop: '1px solid rgba(255,255,255,0.06)',
                      animation: 'heroFadeUp 0.3s cubic-bezier(0.16,1,0.3,1)',
                    }}>
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 12, lineHeight: 1.5 }}>
                        {loc.address}
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
