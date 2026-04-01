import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import PageHero from '../components/PageHero';
import { C, F } from '../hooks/useAnimations';
import { vacantes, jobCategories, jobCities } from '../data/vacantesData';
import { Search, MapPin, Briefcase, Clock, ChevronRight, GraduationCap, Heart, TrendingUp, Users } from 'lucide-react';

const perks = [
  { icon: GraduationCap, title: 'Capacitación Continua', text: 'Formación técnica y profesional constante.' },
  { icon: TrendingUp, title: 'Crecimiento Profesional', text: 'Plan de carrera con oportunidades reales.' },
  { icon: Heart, title: 'Prestaciones', text: 'Prestaciones desde el primer día.' },
  { icon: Users, title: 'Gran Equipo', text: 'Ambiente familiar y colaborativo.' },
];

export default function BolsaTrabajoPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [activeCity, setActiveCity] = useState('Todas');

  const filtered = useMemo(() => {
    let list = vacantes;
    if (activeCategory !== 'Todos') list = list.filter(v => v.category === activeCategory);
    if (activeCity !== 'Todas') list = list.filter(v => v.city === activeCity);
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      list = list.filter(v => v.title.toLowerCase().includes(term) || v.city.toLowerCase().includes(term) || v.description.toLowerCase().includes(term));
    }
    return list;
  }, [searchTerm, activeCategory, activeCity]);

  return (
    <>
      <PageHero
        tag="TRABAJA CON NOSOTROS"
        title="Únete al equipo"
        highlight="Jasman"
        subtitle="Forma parte de la red de centros de soluciones automotrices más grande de México. ¡Tu talento nos interesa!"
        breadcrumbs={[{ label: 'Bolsa de Trabajo' }]}
        image="https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1920&q=80"
      />

      {/* Why work at Jasman */}
      <section style={{ padding: 'clamp(3rem, 6vw, 5rem) 1.5rem', background: C.navy }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
          {perks.map((p, i) => {
            const IconComp = p.icon;
            return (
              <div key={i} style={{
                textAlign: 'center', padding: 24, borderRadius: 20,
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                transition: 'all 0.4s',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(196,30,36,0.08)'; e.currentTarget.style.borderColor = 'rgba(196,30,36,0.2)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <IconComp size={28} color={C.redLight} style={{ marginBottom: 12 }} />
                <h4 style={{ fontFamily: F.heading, fontWeight: 700, fontSize: 15, color: C.white, marginBottom: 6 }}>{p.title}</h4>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>{p.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Job listings */}
      <section style={{ padding: 'clamp(3rem, 6vw, 5rem) 1.5rem', background: C.light }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {/* Search + filters */}
          <div style={{
            display: 'flex', gap: 16, marginBottom: 32, flexWrap: 'wrap',
            padding: '20px 24px', borderRadius: 20,
            background: C.white, border: `1px solid ${C.border}`,
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px',
              borderRadius: 12, background: C.light, border: `1px solid ${C.border}`, flex: 1, minWidth: 200,
            }}>
              <Search size={16} color={C.gray} />
              <input type="text" placeholder="Buscar vacante..." value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ border: 'none', background: 'none', outline: 'none', flex: 1, fontSize: 14, color: C.navy }}
              />
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {jobCategories.map(cat => (
                <button key={cat} onClick={() => setActiveCategory(cat)} style={{
                  padding: '9px 18px', borderRadius: 12,
                  border: `1px solid ${activeCategory === cat ? C.red : C.border}`,
                  background: activeCategory === cat ? C.red : C.white,
                  color: activeCategory === cat ? C.white : C.navy,
                  fontFamily: F.heading, fontWeight: 600, fontSize: 12, cursor: 'pointer',
                }}>{cat}</button>
              ))}
            </div>
            <select value={activeCity} onChange={e => setActiveCity(e.target.value)} style={{
              padding: '10px 16px', borderRadius: 12, border: `1px solid ${C.border}`,
              background: C.white, fontSize: 14, color: C.navy, cursor: 'pointer', outline: 'none',
            }}>
              {jobCities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div style={{ marginBottom: 20, fontFamily: F.heading, fontWeight: 700, fontSize: 16, color: C.navy }}>
            {filtered.length} vacantes encontradas
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 16 }}>
            {filtered.map(v => (
              <Link to={`/bolsa-de-trabajo/${v.id}`} key={v.id} style={{
                display: 'block', padding: '24px 26px', borderRadius: 20,
                background: C.white, border: `1px solid ${C.border}`,
                transition: 'all 0.4s cubic-bezier(0.16,1,0.3,1)',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 16px 40px rgba(196,30,36,0.08)'; e.currentTarget.style.borderColor = 'rgba(196,30,36,0.15)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = C.border; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{
                    width: 46, height: 46, borderRadius: 14,
                    background: 'rgba(196,30,36,0.06)', border: '1px solid rgba(196,30,36,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}><Briefcase size={22} color={C.red} /></div>
                  <span style={{
                    padding: '5px 14px', borderRadius: 9999,
                    background: 'rgba(196,30,36,0.06)', color: C.red,
                    fontSize: 11, fontWeight: 600, fontFamily: F.heading,
                  }}>{v.category}</span>
                </div>
                <h3 style={{ fontFamily: F.heading, fontWeight: 700, fontSize: 18, color: C.navy, marginBottom: 8 }}>{v.title}</h3>
                <p style={{ fontSize: 13, color: C.gray, lineHeight: 1.6, marginBottom: 14 }}>
                  {v.description.slice(0, 120)}...
                </p>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: C.gray }}>
                    <MapPin size={12} /> {v.city}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: C.gray }}>
                    <Clock size={12} /> {v.type}
                  </span>
                </div>
                <div style={{
                  marginTop: 16, paddingTop: 12, borderTop: `1px solid ${C.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: C.red, fontFamily: F.heading }}>Ver detalles</span>
                  <ChevronRight size={14} color={C.red} />
                </div>
              </Link>
            ))}
          </div>

          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '48px 0', color: C.gray }}>
              No se encontraron vacantes con esos filtros. Intenta con otra búsqueda.
            </div>
          )}
        </div>
      </section>
    </>
  );
}
