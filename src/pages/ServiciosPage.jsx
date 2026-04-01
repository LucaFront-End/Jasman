import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import PageHero from '../components/PageHero';
import { C, F } from '../hooks/useAnimations';
import { servicios, paquetes, serviceCategories } from '../data/serviciosData';
import Icon from '../components/Icon';
import { Check, ArrowRight, Clock, Sparkles, Star, Search } from 'lucide-react';

const badgeColors = { 'PREMIUM': { bg: C.red, c: '#fff' }, 'POPULAR': { bg: C.amber, c: C.navy }, 'ESENCIAL': { bg: '#22c55e', c: '#fff' } };

export default function ServiciosPage() {
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredServices = useMemo(() => {
    let list = servicios;
    if (activeCategory !== 'Todos' && activeCategory !== 'Paquetes') {
      list = list.filter(s => s.category === activeCategory);
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      list = list.filter(s => s.title.toLowerCase().includes(term) || s.description.toLowerCase().includes(term));
    }
    return list;
  }, [activeCategory, searchTerm]);

  const showPackages = activeCategory === 'Todos' || activeCategory === 'Paquetes';

  return (
    <>
      <PageHero
        tag="NUESTROS SERVICIOS"
        title="Soluciones integrales"
        highlight="para tu vehículo"
        subtitle="Más de 30 servicios especializados con técnicos certificados, equipos de última generación y garantía por escrito."
        breadcrumbs={[{ label: 'Servicios' }]}
        image="https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=1920&q=80"
      />

      <section style={{ padding: 'clamp(3rem, 6vw, 5rem) 1.5rem', background: C.light }}>
        <div style={{ maxWidth: 1300, margin: '0 auto' }}>
          {/* Search + Category tabs on top */}
          <div style={{
            display: 'flex', gap: 16, marginBottom: 40, flexWrap: 'wrap',
            alignItems: 'center', justifyContent: 'space-between',
            padding: '20px 24px', borderRadius: 20,
            background: C.white, border: `1px solid ${C.border}`,
            boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
          }}>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', flex: 1 }}>
              {serviceCategories.map(cat => (
                <button key={cat} onClick={() => setActiveCategory(cat)} style={{
                  padding: '9px 20px', borderRadius: 12, border: `1px solid ${activeCategory === cat ? C.red : C.border}`,
                  background: activeCategory === cat ? C.red : C.white,
                  color: activeCategory === cat ? C.white : C.navy,
                  fontFamily: F.heading, fontWeight: 600, fontSize: 13, cursor: 'pointer',
                  transition: 'all 0.3s',
                  boxShadow: activeCategory === cat ? '0 4px 16px rgba(196,30,36,0.2)' : 'none',
                }}>
                  {cat}
                </button>
              ))}
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px',
              borderRadius: 12, background: C.light, border: `1px solid ${C.border}`,
              minWidth: 240,
            }}>
              <Search size={16} color={C.gray} />
              <input
                type="text" placeholder="Buscar servicio..."
                value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                style={{
                  border: 'none', background: 'none', outline: 'none', flex: 1,
                  fontSize: 14, color: C.navy, fontFamily: F.body,
                }}
              />
            </div>
          </div>

          {/* Paquetes destacados */}
          {showPackages && (
            <div style={{ marginBottom: 56 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
                <Sparkles size={24} color={C.red} />
                <h2 style={{ fontFamily: F.heading, fontWeight: 800, fontSize: 'clamp(1.4rem, 3vw, 2rem)', color: C.navy }}>
                  Paquetes de Servicio
                </h2>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 24 }}>
                {paquetes.map((pkg) => {
                  const bc = badgeColors[pkg.badge] || badgeColors['ESENCIAL'];
                  return (
                    <Link to={`/servicios/${pkg.slug}`} key={pkg.slug} style={{
                      background: C.white, borderRadius: 24, overflow: 'hidden',
                      border: `1px solid ${C.border}`, transition: 'all 0.5s cubic-bezier(0.16,1,0.3,1)',
                      display: 'block',
                    }}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 20px 50px rgba(196,30,36,0.12)'; e.currentTarget.style.borderColor = 'rgba(196,30,36,0.2)'; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = C.border; }}
                    >
                      <div style={{
                        padding: '24px 28px',
                        background: `linear-gradient(135deg, ${C.navy} 0%, rgba(26,31,54,0.95) 100%)`,
                        position: 'relative',
                      }}>
                        <span style={{
                          position: 'absolute', top: 16, right: 16,
                          padding: '5px 14px', borderRadius: 9999, fontSize: 11, fontFamily: F.heading, fontWeight: 700,
                          background: bc.bg, color: bc.c, boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                        }}>{pkg.badge}</span>
                        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>{pkg.subtitle}</div>
                        <h3 style={{ fontFamily: F.heading, fontWeight: 800, fontSize: 22, color: C.white, marginTop: 4 }}>{pkg.title}</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 12 }}>
                          <span style={{ fontFamily: F.heading, fontWeight: 900, fontSize: 26, color: C.redLight }}>{pkg.price}</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
                            <Clock size={12} /> {pkg.time}
                          </span>
                        </div>
                      </div>
                      <div style={{ padding: '20px 28px 28px' }}>
                        <div style={{ fontSize: 14, color: C.gray, lineHeight: 1.7, marginBottom: 16 }}>{pkg.description}</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                          {pkg.includes.slice(0, 8).map((item, j) => (
                            <div key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '4px 0', fontSize: 12, color: C.gray }}>
                              <Check size={12} color={C.red} strokeWidth={3} style={{ marginTop: 2, flexShrink: 0 }} /> {item}
                            </div>
                          ))}
                        </div>
                        {pkg.includes.length > 8 && (
                          <div style={{ fontSize: 12, color: C.red, fontWeight: 600, marginTop: 8, fontFamily: F.heading }}>
                            +{pkg.includes.length - 8} servicios más incluidos
                          </div>
                        )}
                        <div style={{
                          marginTop: 16, padding: '12px 0', borderTop: `1px solid ${C.border}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: C.red, fontFamily: F.heading }}>Ver detalles</span>
                          <ArrowRight size={16} color={C.red} />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Servicios grid */}
          {activeCategory !== 'Paquetes' && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
                <h2 style={{ fontFamily: F.heading, fontWeight: 800, fontSize: 'clamp(1.4rem, 3vw, 2rem)', color: C.navy }}>
                  {activeCategory === 'Todos' ? 'Todos los Servicios' : activeCategory}
                </h2>
                <span style={{
                  padding: '4px 14px', borderRadius: 9999, background: 'rgba(196,30,36,0.08)',
                  color: C.red, fontSize: 12, fontWeight: 700, fontFamily: F.heading,
                }}>{filteredServices.length}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
                {filteredServices.map((s) => (
                  <Link to={`/servicios/${s.slug}`} key={s.slug} style={{
                    display: 'flex', alignItems: 'center', gap: 16,
                    padding: '20px 22px', borderRadius: 18,
                    background: C.white, border: `1px solid ${C.border}`,
                    transition: 'all 0.4s cubic-bezier(0.16,1,0.3,1)',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(196,30,36,0.08)'; e.currentTarget.style.borderColor = 'rgba(196,30,36,0.15)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = C.border; }}
                  >
                    <div style={{
                      width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                      background: 'rgba(196,30,36,0.06)', border: '1px solid rgba(196,30,36,0.1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Icon name={s.icon} size={22} color={C.red} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: F.heading, fontWeight: 700, fontSize: 15, color: C.navy }}>{s.title}</div>
                      <div style={{ fontSize: 12, color: C.gray, marginTop: 2 }}>{s.category} • {s.time}</div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontFamily: F.heading, fontWeight: 800, fontSize: 14, color: C.red }}>{s.price}</div>
                      <ArrowRight size={14} color={C.gray} style={{ marginTop: 4 }} />
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}

          {filteredServices.length === 0 && activeCategory !== 'Paquetes' && (
            <div style={{ textAlign: 'center', padding: '48px 0', color: C.gray }}>
              No se encontraron servicios. Intenta con otro término de búsqueda.
            </div>
          )}
        </div>
      </section>
    </>
  );
}
