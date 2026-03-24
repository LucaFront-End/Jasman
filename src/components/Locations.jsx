import { useState, useMemo, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { locationsContent } from '../data/content';
import { C, F, useReveal } from '../hooks/useAnimations';
import { Phone, MapPin, Clock, Star, Navigation } from 'lucide-react';

/* Leaflet icon fix */
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

const locations = [
  { id: 'cdmx-1', city: 'CDMX', name: 'Polanco', address: 'Av. Ejército Nacional 843-B', lat: 19.4326, lng: -99.1869, phone: '55 5282 1234', rating: 4.5, hours: 'Lun-Sáb 8:00–19:00', services: ['Llantas', 'Alineación', 'Frenos', 'Aceite'] },
  { id: 'cdmx-2', city: 'CDMX', name: 'Insurgentes', address: 'Av. Insurgentes Sur 1602', lat: 19.3906, lng: -99.1671, phone: '55 5524 5678', rating: 4.3, hours: 'Lun-Sáb 8:00–19:00', services: ['Llantas', 'Suspensión', 'Frenos'] },
  { id: 'cdmx-3', city: 'CDMX', name: 'Santa Fe', address: 'Av. Santa Fe 94', lat: 19.3591, lng: -99.2785, phone: '55 5292 9012', rating: 4.2, hours: 'Lun-Sáb 8:30–18:30', services: ['Llantas', 'Alineación', 'Aceite'] },
  { id: 'mty-1', city: 'Monterrey', name: 'San Pedro', address: 'Av. Vasconcelos 300', lat: 25.6514, lng: -100.2895, phone: '81 8363 4567', rating: 4.4, hours: 'Lun-Sáb 8:00–18:00', services: ['Llantas', 'Frenos', 'Suspensión', 'Aceite'] },
  { id: 'mty-2', city: 'Monterrey', name: 'Valle', address: 'Av. Lázaro Cárdenas 2321', lat: 25.6701, lng: -100.3100, phone: '81 8335 8901', rating: 4.3, hours: 'Lun-Sáb 8:00–18:00', services: ['Llantas', 'Alineación'] },
  { id: 'gdl-1', city: 'Guadalajara', name: 'Chapultepec', address: 'Av. Chapultepec Sur 540', lat: 20.6720, lng: -103.3525, phone: '33 3616 2345', rating: 4.5, hours: 'Lun-Sáb 8:00–19:00', services: ['Llantas', 'Alineación', 'Frenos'] },
  { id: 'gdl-2', city: 'Guadalajara', name: 'Tlaquepaque', address: 'Av. Niños Héroes 1555', lat: 20.6395, lng: -103.3120, phone: '33 3657 6789', rating: 4.4, hours: 'Lun-Sáb 8:30–18:30', services: ['Llantas', 'Aceite'] },
  { id: 'pue-1', city: 'Puebla', name: 'Centro', address: 'Blvd. Hermanos Serdán 610', lat: 19.0412, lng: -98.2062, phone: '222 248 0123', rating: 4.2, hours: 'Lun-Sáb 8:00–18:00', services: ['Llantas', 'Frenos', 'Aceite'] },
  { id: 'qro-1', city: 'Querétaro', name: 'Juriquilla', address: 'Anillo Vial Junípero Serra 2040', lat: 20.7097, lng: -100.4437, phone: '442 241 4567', rating: 4.6, hours: 'Lun-Sáb 8:00–19:00', services: ['Llantas', 'Alineación', 'Suspensión'] },
  { id: 'leo-1', city: 'León', name: 'Centro', address: 'Blvd. Adolfo López Mateos 1702', lat: 21.1221, lng: -101.6837, phone: '477 717 8901', rating: 4.3, hours: 'Lun-Sáb 8:30–18:00', services: ['Llantas', 'Frenos'] },
  { id: 'tol-1', city: 'Toluca', name: 'Metepec', address: 'Paseo San Isidro 400', lat: 19.2536, lng: -99.5998, phone: '722 232 2345', rating: 4.1, hours: 'Lun-Sáb 8:00–18:00', services: ['Llantas', 'Aceite'] },
  { id: 'mer-1', city: 'Mérida', name: 'Norte', address: 'Calle 60 x 47, Centro', lat: 20.9674, lng: -89.5926, phone: '999 928 6789', rating: 4.5, hours: 'Lun-Sáb 8:00–18:00', services: ['Llantas', 'Alineación'] },
];

const cities = ['CDMX', 'Monterrey', 'Guadalajara', 'Puebla', 'Querétaro', 'León', 'Toluca', 'Mérida'];

const cityCoords = {
  'CDMX': [19.42, -99.13, 11], 'Monterrey': [25.66, -100.30, 12],
  'Guadalajara': [20.66, -103.35, 12], 'Puebla': [19.04, -98.21, 13],
  'Querétaro': [20.71, -100.44, 12], 'León': [21.12, -101.68, 13],
  'Toluca': [19.29, -99.66, 13], 'Mérida': [20.97, -89.59, 13],
};

function MapController({ activeCity }) {
  const map = useMap();
  useEffect(() => {
    if (activeCity && cityCoords[activeCity]) {
      const [lat, lng, zoom] = cityCoords[activeCity];
      map.flyTo([lat, lng], zoom, { duration: 1.2 });
    } else {
      map.flyTo([23.5, -102.5], 5, { duration: 1.2 });
    }
  }, [activeCity, map]);
  return null;
}

export default function Locations() {
  const [activeCity, setActiveCity] = useState(null);
  const [selectedLoc, setSelectedLoc] = useState(null);
  const header = useReveal();

  const filteredLocations = useMemo(() => {
    if (!activeCity) return locations;
    return locations.filter(l => l.city === activeCity);
  }, [activeCity]);

  const cityBranches = {};
  cities.forEach(c => { cityBranches[c] = locations.filter(l => l.city === c).length; });

  return (
    <section id="locations" style={{
      padding: 'clamp(4rem, 8vw, 7rem) 0',
      background: C.navy, position: 'relative', overflow: 'hidden',
    }}>
      {/* Decorative */}
      <div style={{
        position: 'absolute', top: -200, right: -200, width: 500, height: 500,
        borderRadius: '50%', border: '1px solid rgba(196,30,36,0.06)', pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: 1300, margin: '0 auto', padding: '0 1.5rem' }}>
        {/* Header */}
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

        {/* City filter tabs */}
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 40 }}>
          <button onClick={() => { setActiveCity(null); setSelectedLoc(null); }} style={{
            padding: '10px 20px', borderRadius: 12,
            border: `1px solid ${!activeCity ? 'rgba(196,30,36,0.5)' : 'rgba(255,255,255,0.08)'}`,
            background: !activeCity ? 'rgba(196,30,36,0.12)' : 'rgba(255,255,255,0.03)',
            color: !activeCity ? C.white : 'rgba(255,255,255,0.5)',
            fontFamily: F.heading, fontWeight: 600, fontSize: 13, cursor: 'pointer',
            transition: 'all 0.3s', backdropFilter: 'blur(8px)',
          }}
            onMouseEnter={e => { if (activeCity) { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = C.white; }}}
            onMouseLeave={e => { if (activeCity) { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}}
          >Todas ({locations.length})</button>
          {cities.map(c => (
            <button key={c} onClick={() => { setActiveCity(prev => prev === c ? null : c); setSelectedLoc(null); }} style={{
              padding: '10px 20px', borderRadius: 12,
              border: `1px solid ${activeCity === c ? 'rgba(196,30,36,0.5)' : 'rgba(255,255,255,0.08)'}`,
              background: activeCity === c ? 'rgba(196,30,36,0.12)' : 'rgba(255,255,255,0.03)',
              color: activeCity === c ? C.white : 'rgba(255,255,255,0.5)',
              fontFamily: F.heading, fontWeight: 600, fontSize: 13, cursor: 'pointer',
              transition: 'all 0.3s', backdropFilter: 'blur(8px)',
            }}
              onMouseEnter={e => { if (activeCity !== c) { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = C.white; }}}
              onMouseLeave={e => { if (activeCity !== c) { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}}
            >{c} ({cityBranches[c]})</button>
          ))}
        </div>

        {/* Main layout: Map + Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 32, alignItems: 'start' }}>
          {/* Left: Map */}
          <div style={{
            borderRadius: 28, overflow: 'hidden', height: 560,
            border: '1px solid rgba(255,255,255,0.06)',
            boxShadow: '0 24px 64px rgba(0,0,0,0.3)',
            position: 'relative',
          }}>
            <MapContainer
              center={[23.5, -102.5]}
              zoom={5}
              style={{ width: '100%', height: '100%' }}
              zoomControl={false}
              dragging={false}
              touchZoom={false}
              doubleClickZoom={false}
              scrollWheelZoom={false}
              boxZoom={false}
              keyboard={false}
              attributionControl={false}
            >
              <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
              <MapController activeCity={activeCity} />
              {filteredLocations.map((loc) => (
                <Marker
                  key={loc.id}
                  position={[loc.lat, loc.lng]}
                  icon={createIcon(selectedLoc === loc.id)}
                  eventHandlers={{
                    click: () => setSelectedLoc(prev => prev === loc.id ? null : loc.id),
                  }}
                >
                  <Popup>
                    <div style={{ fontFamily: F.heading, padding: '4px 2px', minWidth: 180 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: C.navy, marginBottom: 6 }}>
                        {loc.city} — {loc.name}
                      </div>
                      <div style={{ fontSize: 12, color: '#666', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ color: C.red }}>📍</span> {loc.address}
                      </div>
                      <div style={{ fontSize: 12, color: '#666', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ color: C.red }}>🕐</span> {loc.hours}
                      </div>
                      <div style={{ fontSize: 12, color: '#666', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ color: C.red }}>⭐</span> {loc.rating}/5.0
                      </div>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 10 }}>
                        {loc.services.map(s => (
                          <span key={s} style={{
                            padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 600,
                            background: 'rgba(196,30,36,0.08)', color: C.red,
                          }}>{s}</span>
                        ))}
                      </div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <a href={`tel:${loc.phone}`} style={{
                          flex: 1, padding: '7px 0', borderRadius: 8,
                          background: C.red, color: 'white', fontWeight: 600, fontSize: 11,
                          textAlign: 'center', display: 'block', textDecoration: 'none',
                        }}>Llamar</a>
                        <a href={`https://maps.google.com/?q=${loc.lat},${loc.lng}`} target="_blank" rel="noreferrer" style={{
                          flex: 1, padding: '7px 0', borderRadius: 8,
                          background: C.navy, color: 'white', fontWeight: 600, fontSize: 11,
                          textAlign: 'center', display: 'block', textDecoration: 'none',
                        }}>Llegar</a>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>

            {/* Map overlay badge */}
            <div style={{
              position: 'absolute', bottom: 20, left: 20, right: 20, zIndex: 1000,
              padding: '14px 20px', borderRadius: 16,
              background: 'rgba(26,31,54,0.85)', backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.08)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div>
                <div style={{ fontFamily: F.heading, fontWeight: 700, fontSize: 14, color: C.white }}>
                  {activeCity || 'Todo México'}
                </div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
                  {filteredLocations.length} {filteredLocations.length === 1 ? 'sucursal' : 'sucursales'} • Haz click en un pin
                </div>
              </div>
              <div style={{
                padding: '7px 14px', borderRadius: 10,
                background: 'rgba(196,30,36,0.12)', border: '1px solid rgba(196,30,36,0.25)',
                display: 'flex', alignItems: 'center', gap: 5,
              }}>
                <MapPin size={13} color={C.redLight} />
                <span style={{ fontFamily: F.heading, fontWeight: 700, fontSize: 12, color: C.redLight }}>
                  80+ sucursales
                </span>
              </div>
            </div>
          </div>

          {/* Right: Location cards */}
          <div style={{
            display: 'flex', flexDirection: 'column', gap: 10,
            maxHeight: 560, overflowY: 'auto',
            paddingRight: 4,
          }} className="timeline-scroll">
            {filteredLocations.map((loc) => {
              const isSelected = selectedLoc === loc.id;
              return (
                <div key={loc.id}
                  onClick={() => setSelectedLoc(isSelected ? null : loc.id)}
                  style={{
                    padding: '18px 20px', borderRadius: 20, cursor: 'pointer',
                    background: isSelected ? 'rgba(196,30,36,0.08)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${isSelected ? 'rgba(196,30,36,0.35)' : 'rgba(255,255,255,0.06)'}`,
                    transition: 'all 0.4s cubic-bezier(0.16,1,0.3,1)',
                    backdropFilter: 'blur(8px)',
                  }}
                  onMouseEnter={e => { if (!isSelected) { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}}
                  onMouseLeave={e => { if (!isSelected) { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; }}}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                      <div style={{
                        width: 38, height: 38, borderRadius: 11, flexShrink: 0,
                        background: isSelected ? `linear-gradient(135deg, ${C.red}, ${C.redLight})` : 'rgba(196,30,36,0.08)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.3s',
                      }}>
                        <MapPin size={16} color={isSelected ? C.white : C.redLight} />
                      </div>
                      <div>
                        <div style={{ fontFamily: F.heading, fontWeight: 700, fontSize: 14, color: C.white }}>{loc.city} — {loc.name}</div>
                        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{loc.address}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0, marginLeft: 8 }}>
                      <Star size={11} color={C.amber} fill={C.amber} />
                      <span style={{ fontSize: 12, fontWeight: 700, color: C.white, fontFamily: F.heading }}>{loc.rating}</span>
                    </div>
                  </div>

                  {/* Services chips */}
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 10, marginLeft: 50 }}>
                    {loc.services.map(s => (
                      <span key={s} style={{
                        padding: '3px 9px', borderRadius: 7,
                        background: 'rgba(196,30,36,0.06)', border: '1px solid rgba(196,30,36,0.1)',
                        color: C.redLight, fontSize: 10, fontWeight: 600, fontFamily: F.heading,
                      }}>{s}</span>
                    ))}
                  </div>

                  {/* Expanded details */}
                  {isSelected && (
                    <div style={{
                      marginTop: 14, paddingTop: 14, marginLeft: 50,
                      borderTop: '1px solid rgba(255,255,255,0.06)',
                      animation: 'heroFadeUp 0.3s cubic-bezier(0.16,1,0.3,1)',
                    }}>
                      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                        <div style={{
                          flex: 1, padding: '9px 12px', borderRadius: 10,
                          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)',
                          display: 'flex', alignItems: 'center', gap: 7,
                        }}>
                          <Clock size={12} color="rgba(255,255,255,0.35)" />
                          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)' }}>{loc.hours}</span>
                        </div>
                        <div style={{
                          flex: 1, padding: '9px 12px', borderRadius: 10,
                          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)',
                          display: 'flex', alignItems: 'center', gap: 7,
                        }}>
                          <Phone size={12} color="rgba(255,255,255,0.35)" />
                          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)' }}>{loc.phone}</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <a href={`tel:${loc.phone}`} style={{
                          flex: 1, padding: '11px 0', borderRadius: 12,
                          background: `linear-gradient(135deg, ${C.red}, ${C.redLight})`,
                          color: C.white, fontFamily: F.heading, fontWeight: 700, fontSize: 12,
                          textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                          boxShadow: '0 6px 20px rgba(196,30,36,0.25)',
                          transition: 'all 0.3s',
                        }}
                          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                          onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                        ><Phone size={13} /> Llamar</a>
                        <a href={`https://maps.google.com/?q=${loc.lat},${loc.lng}`} target="_blank" rel="noreferrer" style={{
                          flex: 1, padding: '11px 0', borderRadius: 12,
                          background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                          color: C.white, fontFamily: F.heading, fontWeight: 600, fontSize: 12,
                          textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                          transition: 'all 0.3s',
                        }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                        ><Navigation size={13} /> Cómo Llegar</a>
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
  );
}
