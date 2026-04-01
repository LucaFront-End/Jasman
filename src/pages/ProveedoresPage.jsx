import { useState } from 'react';
import PageHero from '../components/PageHero';
import { C, F } from '../hooks/useAnimations';
import Icon from '../components/Icon';
import { Factory, Briefcase, Truck, User2, Wrench, FileCheck2, Check, ChevronDown, ChevronUp, Send, CheckCircle2, Building2, Mail, Phone, FileText, Shield, Eye } from 'lucide-react';

const whoCanRegister = [
  { icon: Factory, title: 'Fabricantes', text: 'Empresas que fabrican productos automotrices, llantas, refacciones o insumos.' },
  { icon: Briefcase, title: 'Empresas de Servicios', text: 'Proveedores de servicios complementarios al sector automotriz.' },
  { icon: Truck, title: 'Distribuidores', text: 'Distribuidores autorizados de marcas reconocidas en el mercado.' },
  { icon: User2, title: 'Personas Físicas', text: 'Profesionales independientes con actividad empresarial registrada.' },
  { icon: Wrench, title: 'Talleres', text: 'Talleres especializados que ofrecen servicios subcontratados.' },
  { icon: FileCheck2, title: 'REPSE', text: 'Empresas registradas en el REPSE para servicios especializados.' },
];

const requirements = [
  {
    title: 'Documentación Legal',
    items: ['Acta constitutiva', 'Poder del representante legal', 'Constancia de situación fiscal', 'Comprobante de domicilio', 'Identificación oficial del representante'],
  },
  {
    title: 'Documentación Comercial',
    items: ['Catálogo de productos o servicios', 'Lista de precios actualizada', 'Carta de presentación', 'Referencias comerciales (mínimo 3)'],
  },
  {
    title: 'Documentación Financiera',
    items: ['Estado de cuenta bancario (últimos 3 meses)', 'Carátula bancaria para transferencias', 'Opinión de cumplimiento SAT positiva'],
  },
  {
    title: 'Servicios Especializados',
    items: ['Registro REPSE (si aplica)', 'Póliza de responsabilidad civil', 'Certificaciones aplicables', 'Contratos de confidencialidad firmados'],
  },
];

const evaluationSteps = [
  { step: '01', title: 'Registro', text: 'Completa el formulario con tu información.' },
  { step: '02', title: 'Revisión', text: 'Nuestro equipo evalúa tu documentación.' },
  { step: '03', title: 'Evaluación', text: 'Análisis comercial y financiero.' },
  { step: '04', title: 'Aprobación', text: 'Resultado del proceso de evaluación.' },
  { step: '05', title: 'Alta', text: 'Integración como proveedor activo.' },
];

export default function ProveedoresPage() {
  const [openReq, setOpenReq] = useState(0);
  const [formData, setFormData] = useState({ name: '', company: '', rfc: '', email: '', phone: '', type: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => { e.preventDefault(); setSubmitted(true); };

  return (
    <>
      <PageHero
        tag="PROVEEDORES"
        title="Sé parte de nuestra"
        highlight="cadena de valor"
        subtitle="Regístrate como proveedor de Jasman Automotriz y forma parte de la red de centros de soluciones automotrices más grande de México."
        breadcrumbs={[{ label: 'Proveedores' }]}
        image="https://images.unsplash.com/photo-1560472355-536de3962603?w=1920&q=80"
      />

      {/* Who can register */}
      <section style={{ padding: 'clamp(4rem, 8vw, 7rem) 1.5rem', background: C.white }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 18px', borderRadius: 9999,
              background: 'rgba(196,30,36,0.08)', color: C.red,
              fontFamily: F.heading, fontWeight: 600, fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 20,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.red }} />
              ¿QUIÉN PUEDE REGISTRARSE?
            </span>
            <h2 style={{ fontFamily: F.heading, fontWeight: 800, fontSize: 'clamp(2rem, 5vw, 3rem)', color: C.navy, lineHeight: 1.12 }}>
              Tipos de{' '}<span style={{ color: C.red }}>proveedores</span>
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
            {whoCanRegister.map((w, i) => {
              const IconComp = w.icon;
              return (
                <div key={i} style={{
                  padding: 28, borderRadius: 22,
                  background: C.light, border: `1px solid ${C.border}`,
                  transition: 'all 0.5s cubic-bezier(0.16,1,0.3,1)',
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 16px 40px rgba(196,30,36,0.08)'; e.currentTarget.style.borderColor = 'rgba(196,30,36,0.15)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = C.border; }}
                >
                  <div style={{
                    width: 52, height: 52, borderRadius: 16,
                    background: 'rgba(196,30,36,0.06)', border: '1px solid rgba(196,30,36,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18,
                  }}>
                    <IconComp size={24} color={C.red} />
                  </div>
                  <h3 style={{ fontFamily: F.heading, fontWeight: 700, fontSize: 18, color: C.navy, marginBottom: 8 }}>{w.title}</h3>
                  <p style={{ fontSize: 14, color: C.gray, lineHeight: 1.7 }}>{w.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Requirements accordion */}
      <section style={{ padding: 'clamp(4rem, 8vw, 6rem) 1.5rem', background: C.navy, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -200, right: -200, width: 500, height: 500, borderRadius: '50%', border: '1px solid rgba(196,30,36,0.06)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 800, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontFamily: F.heading, fontWeight: 800, fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', color: C.white, textAlign: 'center', marginBottom: 40 }}>
            Requisitos de{' '}
            <span className="animated-gradient" style={{
              background: `linear-gradient(135deg, ${C.redLight}, ${C.amber}, ${C.redLight})`,
              backgroundSize: '200% 200%', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>Registro</span>
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {requirements.map((r, i) => (
              <div key={i} style={{
                borderRadius: 18, overflow: 'hidden',
                background: 'rgba(255,255,255,0.03)', border: `1px solid ${openReq === i ? 'rgba(196,30,36,0.2)' : 'rgba(255,255,255,0.06)'}`,
                transition: 'all 0.4s',
              }}>
                <button onClick={() => setOpenReq(openReq === i ? -1 : i)} style={{
                  width: '100%', padding: '20px 24px', border: 'none', cursor: 'pointer',
                  background: openReq === i ? 'rgba(196,30,36,0.06)' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  fontFamily: F.heading, fontWeight: 700, fontSize: 16, color: C.white, textAlign: 'left',
                }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{
                      width: 32, height: 32, borderRadius: 10,
                      background: `linear-gradient(135deg, ${C.red}, ${C.redLight})`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: F.heading, fontWeight: 900, fontSize: 13, color: C.white,
                    }}>0{i + 1}</span>
                    {r.title}
                  </span>
                  {openReq === i ? <ChevronUp size={18} color="rgba(255,255,255,0.4)" /> : <ChevronDown size={18} color="rgba(255,255,255,0.4)" />}
                </button>
                {openReq === i && (
                  <div style={{ padding: '0 24px 20px', animation: 'heroFadeUp 0.3s ease' }}>
                    {r.items.map((item, j) => (
                      <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>
                        <Check size={14} color={C.redLight} strokeWidth={3} /> {item}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Evaluation process */}
      <section style={{ padding: 'clamp(3rem, 6vw, 5rem) 1.5rem', background: C.white }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <h2 style={{ fontFamily: F.heading, fontWeight: 800, fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', color: C.navy, textAlign: 'center', marginBottom: 48 }}>
            Proceso de Evaluación
          </h2>
          <div style={{ display: 'flex', gap: 0, position: 'relative' }}>
            <div style={{
              position: 'absolute', top: 30, left: 'calc(10% + 20px)', right: 'calc(10% + 20px)',
              height: 2, background: `linear-gradient(90deg, ${C.red}20, ${C.red}50, ${C.red}20)`,
            }} />
            {evaluationSteps.map((s, i) => (
              <div key={i} style={{ flex: 1, textAlign: 'center', position: 'relative', zIndex: 1 }}>
                <div style={{
                  width: 60, height: 60, borderRadius: 18, margin: '0 auto 16px',
                  background: `linear-gradient(135deg, ${C.red}, ${C.redLight})`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: F.heading, fontWeight: 900, fontSize: 18, color: C.white,
                  boxShadow: '0 8px 24px rgba(196,30,36,0.25)',
                }}>{s.step}</div>
                <h4 style={{ fontFamily: F.heading, fontWeight: 700, fontSize: 15, color: C.navy, marginBottom: 6 }}>{s.title}</h4>
                <p style={{ fontSize: 12, color: C.gray, lineHeight: 1.6, padding: '0 8px' }}>{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Compliance + Form */}
      <section style={{ padding: 'clamp(3rem, 6vw, 5rem) 1.5rem', background: C.light }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40 }}>
          {/* Compliance */}
          <div>
            <h3 style={{ fontFamily: F.heading, fontWeight: 800, fontSize: 22, color: C.navy, marginBottom: 24 }}>
              Compromiso y Cumplimiento
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { icon: Shield, title: 'Código de Ética', text: 'Adherencia a nuestro código de ética empresarial y buenas prácticas comerciales.' },
                { icon: Eye, title: 'Confidencialidad', text: 'Protección de información comercial y datos sensibles de ambas partes.' },
                { icon: FileCheck2, title: 'Protección de Datos', text: 'Cumplimiento con la Ley Federal de Protección de Datos Personales.' },
                { icon: FileText, title: 'Anticorrupción', text: 'Compromiso con prácticas transparentes y libres de conflicto de interés.' },
              ].map((c, i) => {
                const IconComp = c.icon;
                return (
                  <div key={i} style={{
                    padding: '20px 22px', borderRadius: 18,
                    background: C.white, border: `1px solid ${C.border}`,
                    display: 'flex', gap: 14, alignItems: 'flex-start',
                  }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                      background: 'rgba(196,30,36,0.06)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}><IconComp size={18} color={C.red} /></div>
                    <div>
                      <h4 style={{ fontFamily: F.heading, fontWeight: 700, fontSize: 15, color: C.navy, marginBottom: 4 }}>{c.title}</h4>
                      <p style={{ fontSize: 13, color: C.gray, lineHeight: 1.6 }}>{c.text}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Registration form */}
          <div style={{
            background: C.navy, borderRadius: 24, padding: 36,
          }}>
            <h3 style={{ fontFamily: F.heading, fontWeight: 800, fontSize: 22, color: C.white, marginBottom: 8 }}>Registro de Proveedor</h3>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginBottom: 24 }}>Completa el formulario para iniciar el proceso de registro.</p>
            {submitted ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <CheckCircle2 size={48} color="#22c55e" style={{ marginBottom: 16 }} />
                <h4 style={{ fontFamily: F.heading, fontWeight: 700, fontSize: 18, color: C.white, marginBottom: 8 }}>¡Registro Recibido!</h4>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>Nuestro equipo revisará tu información y te contactará pronto.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { key: 'name', label: 'Nombre del contacto', icon: User2, type: 'text' },
                  { key: 'company', label: 'Razón social', icon: Building2, type: 'text' },
                  { key: 'rfc', label: 'RFC', icon: FileText, type: 'text' },
                  { key: 'email', label: 'Email corporativo', icon: Mail, type: 'email' },
                  { key: 'phone', label: 'Teléfono', icon: Phone, type: 'tel' },
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
                <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}
                  required
                  style={{
                    padding: '13px 16px', borderRadius: 14,
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                    fontSize: 13, color: formData.type ? C.white : 'rgba(255,255,255,0.3)',
                    outline: 'none', cursor: 'pointer',
                  }}
                >
                  <option value="" disabled>Tipo de proveedor</option>
                  {whoCanRegister.map(w => <option key={w.title} value={w.title} style={{ color: '#000' }}>{w.title}</option>)}
                </select>
                <textarea placeholder="Descripción de productos o servicios" rows={3}
                  value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })}
                  style={{
                    padding: '13px 16px', borderRadius: 14,
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                    fontSize: 13, color: C.white, resize: 'vertical', outline: 'none', fontFamily: F.body,
                  }}
                />
                <button type="submit" className="glow-btn" style={{
                  padding: '16px 24px', borderRadius: 14, border: 'none',
                  background: `linear-gradient(135deg, ${C.red}, ${C.redLight})`,
                  color: C.white, fontFamily: F.heading, fontWeight: 700, fontSize: 15,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  boxShadow: '0 8px 32px rgba(196,30,36,0.35)',
                }}>
                  <Send size={16} /> Enviar Registro
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
