import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import PageHero from '../components/PageHero';
import { C, F } from '../hooks/useAnimations';
import { vacantes } from '../data/vacantesData';
import { MapPin, Clock, Check, ArrowLeft, User, Mail, Phone, FileText, Send, CheckCircle2 } from 'lucide-react';

export default function VacanteDetailPage() {
  const { id } = useParams();
  const vacancy = vacantes.find(v => v.id === id);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', city: '', experience: '' });
  const [submitted, setSubmitted] = useState(false);

  if (!vacancy) {
    return (
      <>
        <PageHero tag="VACANTE" title="Vacante" highlight="no encontrada" breadcrumbs={[{ label: 'Bolsa de Trabajo', href: '/bolsa-de-trabajo' }, { label: '404' }]} />
        <div style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
          <Link to="/bolsa-de-trabajo" style={{ color: C.red, fontWeight: 600 }}>← Volver a Vacantes</Link>
        </div>
      </>
    );
  }

  const handleSubmit = (e) => { e.preventDefault(); setSubmitted(true); };

  return (
    <>
      <PageHero
        tag={vacancy.category}
        title={vacancy.title}
        subtitle={`${vacancy.city} • ${vacancy.type}`}
        breadcrumbs={[{ label: 'Bolsa de Trabajo', href: '/bolsa-de-trabajo' }, { label: vacancy.title }]}
      />

      <section style={{ padding: 'clamp(3rem, 6vw, 5rem) 1.5rem', background: C.light }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 40, alignItems: 'start' }}>
          {/* Left: Details */}
          <div>
            <div style={{
              background: C.white, borderRadius: 24, padding: 36,
              border: `1px solid ${C.border}`, marginBottom: 24,
            }}>
              <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: C.gray, padding: '6px 14px', borderRadius: 9999, background: C.light }}>
                  <MapPin size={14} /> {vacancy.city}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: C.gray, padding: '6px 14px', borderRadius: 9999, background: C.light }}>
                  <Clock size={14} /> {vacancy.type}
                </span>
              </div>

              <h2 style={{ fontFamily: F.heading, fontWeight: 800, fontSize: 20, color: C.navy, marginBottom: 12 }}>Descripción</h2>
              <p style={{ fontSize: 15, color: C.gray, lineHeight: 1.8, marginBottom: 32 }}>{vacancy.description}</p>

              <h2 style={{ fontFamily: F.heading, fontWeight: 800, fontSize: 20, color: C.navy, marginBottom: 16 }}>Requisitos</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 32 }}>
                {vacancy.requirements.map((r, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 14, background: C.light, border: `1px solid ${C.border}` }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(196,30,36,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Check size={14} color={C.red} strokeWidth={3} />
                    </div>
                    <span style={{ fontSize: 14, color: C.charcoal }}>{r}</span>
                  </div>
                ))}
              </div>

              <h2 style={{ fontFamily: F.heading, fontWeight: 800, fontSize: 20, color: C.navy, marginBottom: 16 }}>Beneficios</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {vacancy.benefits.map((b, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 14, background: 'rgba(34,197,94,0.04)', border: '1px solid rgba(34,197,94,0.1)' }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(34,197,94,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Check size={14} color="#22c55e" strokeWidth={3} />
                    </div>
                    <span style={{ fontSize: 14, color: C.charcoal }}>{b}</span>
                  </div>
                ))}
              </div>
            </div>
            <Link to="/bolsa-de-trabajo" style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: F.heading, fontWeight: 600, fontSize: 14, color: C.red }}>
              <ArrowLeft size={14} /> Todas las Vacantes
            </Link>
          </div>

          {/* Right: Application form */}
          <div style={{
            background: C.navy, borderRadius: 24, padding: 36, position: 'sticky', top: 100,
          }}>
            <h3 style={{ fontFamily: F.heading, fontWeight: 800, fontSize: 20, color: C.white, marginBottom: 8 }}>
              Postúlate Ahora
            </h3>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginBottom: 24 }}>
              Completa el formulario y nos pondremos en contacto contigo.
            </p>
            {submitted ? (
              <div style={{ textAlign: 'center', padding: '32px 0' }}>
                <CheckCircle2 size={48} color="#22c55e" style={{ marginBottom: 16 }} />
                <h4 style={{ fontFamily: F.heading, fontWeight: 700, fontSize: 18, color: C.white, marginBottom: 8 }}>¡Postulación Enviada!</h4>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>Revisaremos tu información y te contactaremos pronto.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { key: 'name', label: 'Nombre completo', icon: User, type: 'text' },
                  { key: 'email', label: 'Email', icon: Mail, type: 'email' },
                  { key: 'phone', label: 'Teléfono', icon: Phone, type: 'tel' },
                  { key: 'city', label: 'Ciudad', icon: MapPin, type: 'text' },
                ].map(f => (
                  <div key={f.key} style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '13px 16px',
                    borderRadius: 14, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                  }}>
                    <f.icon size={15} color="rgba(255,255,255,0.3)" />
                    <input type={f.type} placeholder={f.label} required
                      value={formData[f.key]} onChange={e => setFormData({ ...formData, [f.key]: e.target.value })}
                      style={{ border: 'none', background: 'none', outline: 'none', flex: 1, fontSize: 13, color: C.white }}
                    />
                  </div>
                ))}
                <textarea placeholder="Experiencia relevante" rows={3} required
                  value={formData.experience} onChange={e => setFormData({ ...formData, experience: e.target.value })}
                  style={{
                    padding: '13px 16px', borderRadius: 14,
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                    fontSize: 13, color: C.white, resize: 'vertical', outline: 'none', fontFamily: F.body,
                  }}
                />
                {/* CV upload visual */}
                <div style={{
                  padding: '18px 16px', borderRadius: 14, textAlign: 'center',
                  border: '2px dashed rgba(255,255,255,0.1)', cursor: 'pointer',
                }}>
                  <FileText size={24} color="rgba(255,255,255,0.3)" style={{ marginBottom: 8 }} />
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>Adjuntar CV (PDF)</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginTop: 4 }}>Máx. 5MB</div>
                </div>
                <button type="submit" className="glow-btn" style={{
                  padding: '16px 24px', borderRadius: 14, border: 'none',
                  background: `linear-gradient(135deg, ${C.red}, ${C.redLight})`,
                  color: C.white, fontFamily: F.heading, fontWeight: 700, fontSize: 15,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  boxShadow: '0 8px 32px rgba(196,30,36,0.35)',
                }}>
                  <Send size={16} /> Enviar Postulación
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
