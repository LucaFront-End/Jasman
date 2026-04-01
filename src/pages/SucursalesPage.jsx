import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import PageHero from '../components/PageHero';
import { C, F, useCountUp } from '../hooks/useAnimations';
import { sucursales, regions, states } from '../data/sucursalesData';
import { MapPin, Phone, MessageCircle, Navigation, Search, ChevronRight, Building2, Users, Wrench, Shield } from 'lucide-react';

delete L.Icon.Default.prototype._getIconUrl;

const createIcon = (isActive) => new L.DivIcon({
  className: 'map-pin-icon',
  html: `<div style="
    width:${isActive ? 32 : 20}px;height:${isActive ? 32 : 20}px;
    background:#C41E24;border-radius:50%;
    box-shadow:0 0 0 ${isActive ? 7 : 3}px rgba(196,30,36,${isActive ? 0.3 : 0.15}), 0 4px 14px rgba(196,30,36,0.5);
    border:3px solid white;cursor:pointer;transition:all 0.3s;
    ${isActive ? 'animation:pulseGlow 2s infinite;' : ''}
  "></div>`,
  iconSize: [isActive ? 32 : 20, isActive ? 32 : 20],
  iconAnchor: [isActive ? 16 : 10, isActive ? 16 : 10],
  popupAnchor: [0, isActive ? -20 : -14],
});

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
  'Tepic': [21.5049, -104.8946], 'Huixquilucan': [19.3591, -99.3485],
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
  'Bajio': [20.90, -101.45, 8], 'Guadalajara': [20.67, -103.35, 10],
  'Monterrey': [25.70, -100.30, 10], 'Queretaro': [20.55, -100.25, 9],
  'Michoacan': [19.75, -101.80, 8],
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
  const [activeRegion, setActiveRegion] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLoc, setSelectedLoc] = useState(null);

  const filtered = useMemo(() => {
    let list = sucursales;
    if (activeRegion) list = list.filter(s => s.region === activeRegion);
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      list = list.filter(s =>
        s.name.toLowerCase().includes(term) || s.city.toLowerCase().includes(term) ||
        s.state.toLowerCase().includes(term) || s.address.toLowerCase().includes(term)
      );
    }
    return list;
  }, [activeRegion, searchTerm]);

  const grouped = useMemo(() => {
    const map = {};
    filtered.forEach(s => { if (!map[s.state]) map[s.state] = []; map[s.state].push(s); });
    return Object.entries(map).sort((a, b) => b[1].length - a[1].length);
  }, [filtered]);

  const getCoords = (b) => {
    const geo = cityGeo[b.city];
    if (geo) return [geo[0] + (Math.random() - 0.5) * 0.008, geo[1] + (Math.random() - 0.5) * 0.008];
    return [19.43, -99.13];
  };

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
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          <StatBadge number={sucursales.length} suffix="" label="Sucursales en México" icon={<Building2 size={20} color={C.redLight} />} />
          <StatBadge number={regions.length} suffix="" label="Regiones Cubiertas" icon={<MapPin size={20} color={C.redLight} />} />
          <StatBadge number={30} suffix="+" label="Servicios Disponibles" icon={<Wrench size={20} color={C.redLight} />} />
          <StatBadge number={states.length} suffix="" label="Estados" icon={<Shield size={20} color={C.redLight} />} />
        </div>
      </section>

      {/* Interactive map section */}
      <section style={{ padding: 'clamp(2rem, 4vw, 3rem) 1.5rem', background: C.navy }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          {/* Search + Region filters */}
          <div style={{
            display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap', alignItems: 'center',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px',
              borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              minWidth: 260,
            }}>
              <Search size={16} color="rgba(255,255,255,0.3)" />
              <input type="text" placeholder="Buscar sucursal, ciudad o estado..."
                value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                style={{ border: 'none', background: 'none', outline: 'none', flex: 1, fontSize: 14, color: C.white }}
              />
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <button onClick={() => { setActiveRegion(null); setSelectedLoc(null); }} style={{
                padding: '9px 18px', borderRadius: 12,
                border: `1px solid ${!activeRegion ? 'rgba(196,30,36,0.5)' : 'rgba(255,255,255,0.08)'}`,
                background: !activeRegion ? 'rgba(196,30,36,0.12)' : 'rgba(255,255,255,0.03)',
                color: !activeRegion ? C.white : 'rgba(255,255,255,0.5)',
                fontFamily: F.heading, fontWeight: 600, fontSize: 12, cursor: 'pointer',
              }}>Todas</button>
              {regions.map(r => (
                <button key={r} onClick={() => { setActiveRegion(prev => prev === r ? null : r); setSelectedLoc(null); }} style={{
                  padding: '9px 18px', borderRadius: 12,
                  border: `1px solid ${activeRegion === r ? 'rgba(196,30,36,0.5)' : 'rgba(255,255,255,0.08)'}`,
                  background: activeRegion === r ? 'rgba(196,30,36,0.12)' : 'rgba(255,255,255,0.03)',
                  color: activeRegion === r ? C.white : 'rgba(255,255,255,0.5)',
                  fontFamily: F.heading, fontWeight: 600, fontSize: 12, cursor: 'pointer',
                }}>{r}</button>
              ))}
            </div>
          </div>

          {/* Full-width map + sidebar */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: 24, alignItems: 'start' }}>
            {/* Map */}
            <div style={{
              borderRadius: 28, overflow: 'hidden', height: 640,
              border: '1px solid rgba(255,255,255,0.06)',
              boxShadow: '0 24px 64px rgba(0,0,0,0.3)', position: 'relative',
            }}>
              <MapContainer
                center={[23.5, -102.5]} zoom={5}
                style={{ width: '100%', height: '100%' }}
                zoomControl={true} dragging={true} touchZoom={true}
                doubleClickZoom={true} scrollWheelZoom={true}
                attributionControl={false}
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
                        <div style={{ fontFamily: F.heading, padding: '4px 2px', minWidth: 200 }}>
                          <div style={{ fontWeight: 700, fontSize: 15, color: C.navy, marginBottom: 6 }}>
                            Suc. {loc.name}
                          </div>
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
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <div>
                  <div style={{ fontFamily: F.heading, fontWeight: 700, fontSize: 14, color: C.white }}>
                    {activeRegion ? `Región ${activeRegion}` : 'Todo México'}
                  </div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
                    {filtered.length} sucursales • Mapa interactivo
                  </div>
                </div>
                <div style={{
                  padding: '6px 14px', borderRadius: 10,
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
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                position: 'sticky', top: 0, zIndex: 10,
                backdropFilter: 'blur(12px)',
              }}>
                <span>{filtered.length} sucursales</span>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>
                  Click para detalles
                </span>
              </div>
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
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{b.city}, {b.state}</div>
                      </div>
                      <span style={{
                        padding: '3px 8px', borderRadius: 6,
                        background: 'rgba(255,255,255,0.04)', fontSize: 9, fontWeight: 600,
                        color: 'rgba(255,255,255,0.3)', fontFamily: F.heading,
                      }}>{b.region}</span>
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
                        {b.phone && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 10 }}>
                            <Phone size={11} /> {b.phone}
                          </div>
                        )}
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
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 12 }}>
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
                        width: 36, height: 36, borderRadius: 10,
                        background: 'rgba(196,30,36,0.06)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}><MapPin size={16} color={C.red} /></div>
                      <div>
                        <div style={{ fontFamily: F.heading, fontWeight: 700, fontSize: 14, color: C.navy }}>Suc. {b.name}</div>
                        <div style={{ fontSize: 11, color: C.gray }}>{b.city}</div>
                      </div>
                    </div>
                    <p style={{ fontSize: 12, color: C.gray, lineHeight: 1.5, marginBottom: 12 }}>{b.address}</p>
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
