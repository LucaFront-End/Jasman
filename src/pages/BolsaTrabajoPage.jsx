import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageHero from '../components/PageHero';
import { C, F } from '../hooks/useAnimations';
import { vacantes as localVacantes, jobCategories as defaultCategories, jobCities as defaultCities } from '../data/vacantesData';
import { getWixVacantes, saveBolsaTrabajo } from '../services/wixService';
import { Search, MapPin, Briefcase, Clock, ChevronRight, GraduationCap, Heart, TrendingUp, Users, CheckCircle2 } from 'lucide-react';

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
  const [wixVacantes, setWixVacantes] = useState([]);
  const [loadingWix, setLoadingWix] = useState(true);

  // Spontaneous application form state
  const [spontaneousForm, setSpontaneousForm] = useState({ name: '', email: '', phone: '', city: '', position: '', experience: '' });
  const [spontaneousSubmitted, setSpontaneousSubmitted] = useState(false);

  useEffect(() => {
    getWixVacantes().then(list => {
      if (list && list.length > 0) {
        setWixVacantes(list);
      }
      setLoadingWix(false);
    }).catch(() => setLoadingWix(false));
  }, []);

  const activeVacantes = useMemo(() => {
    if (wixVacantes.length > 0) return wixVacantes;
    return localVacantes;
  }, [wixVacantes]);

  const jobCategories = useMemo(() => {
    const cats = new Set(activeVacantes.map(v => v.category).filter(Boolean));
    return ['Todos', ...Array.from(cats)];
  }, [activeVacantes]);

  const jobCities = useMemo(() => {
    const cts = new Set(activeVacantes.map(v => v.city).filter(Boolean));
    return ['Todas', ...Array.from(cts)];
  }, [activeVacantes]);

  const filtered = useMemo(() => {
    let list = activeVacantes;
    if (activeCategory !== 'Todos') list = list.filter(v => v.category === activeCategory);
    if (activeCity !== 'Todas') list = list.filter(v => v.city === activeCity);
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      list = list.filter(v => v.title.toLowerCase().includes(term) || v.city.toLowerCase().includes(term) || v.description.toLowerCase().includes(term));
    }
    return list;
  }, [searchTerm, activeCategory, activeCity, activeVacantes]);

  const handleSpontaneousSubmit = (e) => {
    e.preventDefault();
    saveBolsaTrabajo({
      nombre: spontaneousForm.name,
      email: spontaneousForm.email,
      telefono: spontaneousForm.phone,
      ciudad: spontaneousForm.city,
      puesto: spontaneousForm.position,
      experiencia: spontaneousForm.experience,
      origen: 'Bolsa de Trabajo (Espontánea)',
    }).catch(err => console.warn('Wix save error in spontaneous application:', err));
    setSpontaneousSubmitted(true);
  };

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

      {/* ═══ Spontaneous application for Bolsadetrabajo ═══ */}
      <section style={{ padding: 'clamp(3rem, 6vw, 5rem) 1.5rem', background: C.white, borderTop: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 18px', borderRadius: 9999,
            background: 'rgba(196,30,36,0.08)', color: C.red,
            fontFamily: F.heading, fontWeight: 600, fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.red }} />
            POSTULACIÓN GENERAL
          </span>
          <h2 style={{ fontFamily: F.heading, fontWeight: 800, fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)', color: C.navy, marginBottom: 12 }}>
            ¿No encuentras tu vacante ideal?
          </h2>
          <p style={{ fontSize: 15, color: C.gray, maxWidth: 580, margin: '0 auto 28px', lineHeight: 1.7 }}>
            Envíanos tus datos y experiencia. Te integraremos a nuestra base de talento para futuras contrataciones en cualquiera de nuestras sucursales.
          </p>

          {spontaneousSubmitted ? (
            <div style={{
              padding: 36, borderRadius: 20, background: 'rgba(34, 197, 94, 0.08)',
              border: '1px solid rgba(34, 197, 94, 0.2)', textAlign: 'center',
            }}>
              <CheckCircle2 size={44} color="#22c55e" style={{ marginBottom: 12 }} />
              <h3 style={{ fontFamily: F.heading, fontWeight: 700, fontSize: 18, color: C.navy, marginBottom: 6 }}>
                ¡Postulación Registrada!
              </h3>
              <p style={{ fontSize: 14, color: C.gray }}>
                Tus datos han sido agregados a nuestra Bolsa de Trabajo. Te contactaremos cuando se abra una vacante afín a tu perfil.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSpontaneousSubmit} style={{
              background: C.light, padding: '32px 28px', borderRadius: 24, border: `1px solid ${C.border}`,
              display: 'flex', flexDirection: 'column', gap: 14, textAlign: 'left',
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: C.navy, marginBottom: 6 }}>Nombre completo *</label>
                  <input
                    type="text" placeholder="Ej. Carlos Mendoza" required
                    value={spontaneousForm.name} onChange={e => setSpontaneousForm(p => ({ ...p, name: e.target.value }))}
                    style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: `1px solid ${C.border}`, background: C.white, fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: C.navy, marginBottom: 6 }}>Correo electrónico *</label>
                  <input
                    type="email" placeholder="carlos@email.com" required
                    value={spontaneousForm.email} onChange={e => setSpontaneousForm(p => ({ ...p, email: e.target.value }))}
                    style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: `1px solid ${C.border}`, background: C.white, fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: C.navy, marginBottom: 6 }}>Teléfono / WhatsApp *</label>
                  <input
                    type="tel" placeholder="55 1234 5678" required
                    value={spontaneousForm.phone} onChange={e => setSpontaneousForm(p => ({ ...p, phone: e.target.value }))}
                    style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: `1px solid ${C.border}`, background: C.white, fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: C.navy, marginBottom: 6 }}>Ciudad o Estado *</label>
                  <input
                    type="text" placeholder="Ej. Guadalajara, Jal." required
                    value={spontaneousForm.city} onChange={e => setSpontaneousForm(p => ({ ...p, city: e.target.value }))}
                    style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: `1px solid ${C.border}`, background: C.white, fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: C.navy, marginBottom: 6 }}>Puesto o área de interés *</label>
                <input
                  type="text" placeholder="Ej. Técnico Mecánico, Alineador, Asesor de Servicio, Ventas..." required
                  value={spontaneousForm.position} onChange={e => setSpontaneousForm(p => ({ ...p, position: e.target.value }))}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: `1px solid ${C.border}`, background: C.white, fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: C.navy, marginBottom: 6 }}>Experiencia relevante *</label>
                <textarea
                  placeholder="Cuéntanos brevemente sobre tus trabajos anteriores y habilidades técnicas..." rows={3} required
                  value={spontaneousForm.experience} onChange={e => setSpontaneousForm(p => ({ ...p, experience: e.target.value }))}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: `1px solid ${C.border}`, background: C.white, fontSize: 14, outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
                />
              </div>
              <button
                type="submit" className="glow-btn"
                style={{
                  padding: '14px 32px', borderRadius: 12, border: 'none',
                  background: `linear-gradient(135deg, ${C.red}, ${C.redLight})`,
                  color: C.white, fontFamily: F.heading, fontWeight: 700, fontSize: 14,
                  cursor: 'pointer', alignSelf: 'center', marginTop: 8,
                }}
              >
                Enviar a Bolsa de Trabajo
              </button>
            </form>
          )}
        </div>
      </section>
    </>
  );
}
