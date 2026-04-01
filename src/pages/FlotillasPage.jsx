import { useState } from 'react';
import PageHero from '../components/PageHero';
import { C, F, useReveal, useCountUp } from '../hooks/useAnimations';
import Icon from '../components/Icon';
import { Phone, MessageCircle, Send, CheckCircle2, ArrowRight, Building2, User, Mail, Users, Truck, BarChart3 } from 'lucide-react';
import { flotillasContent } from '../data/flotillasData';

function StatCard2({ number, suffix, label }) {
  const { ref, count } = useCountUp(number, 2000);
  return (
    <div ref={ref} style={{ textAlign: 'center' }}>
      <div style={{ fontFamily: F.heading, fontWeight: 900, fontSize: 'clamp(2rem, 4vw, 2.8rem)', color: C.redLight }}>{count}{suffix}</div>
      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginTop: 4 }}>{label}</div>
    </div>
  );
}

export default function FlotillasPage() {
  const [formData, setFormData] = useState({ name: '', company: '', fleetSize: '', phone: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const header = useReveal();

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <>
      <PageHero
        tag={flotillasContent.hero.tag}
        title={flotillasContent.hero.title}
        highlight={flotillasContent.hero.titleHighlight}
        subtitle={flotillasContent.hero.subtitle}
        breadcrumbs={[{ label: 'Flotillas' }]}
        image="https://images.unsplash.com/photo-1601929862217-f1b6d2cf5d7c?w=1920&q=80"
      />

      {/* Stats bar */}
      <section style={{ padding: '36px 1.5rem', background: C.navy, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
          {flotillasContent.stats.map((s, i) => (
            <StatCard2 key={i} number={s.number} suffix={s.suffix} label={s.label} />
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section style={{ padding: 'clamp(4rem, 8vw, 7rem) 1.5rem', background: C.white }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div ref={header.ref} style={{ textAlign: 'center', maxWidth: 600, margin: '0 auto 56px', ...header.style }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 18px', borderRadius: 9999,
              background: 'rgba(196,30,36,0.08)', color: C.red,
              fontFamily: F.heading, fontWeight: 600, fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 20,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.red }} />
              BENEFICIOS CORPORATIVOS
            </span>
            <h2 style={{ fontFamily: F.heading, fontWeight: 800, fontSize: 'clamp(2rem, 5vw, 3rem)', color: C.navy, lineHeight: 1.12 }}>
              Pensamos en cada una de{' '}
              <span style={{ color: C.red }}>tus necesidades</span>
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
            {flotillasContent.benefits.map((b, i) => (
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
                  <Icon name={b.icon} size={24} color={C.red} />
                </div>
                <h3 style={{ fontFamily: F.heading, fontWeight: 700, fontSize: 18, color: C.navy, marginBottom: 10 }}>{b.title}</h3>
                <p style={{ fontSize: 14, color: C.gray, lineHeight: 1.75 }}>{b.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: 'clamp(4rem, 8vw, 6rem) 1.5rem', background: C.navy, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -200, right: -200, width: 500, height: 500, borderRadius: '50%', border: '1px solid rgba(196,30,36,0.06)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <h2 style={{ fontFamily: F.heading, fontWeight: 800, fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', color: C.white, textAlign: 'center', marginBottom: 48 }}>
            Creamos un plan{' '}
            <span className="animated-gradient" style={{
              background: `linear-gradient(135deg, ${C.redLight}, ${C.amber}, ${C.redLight})`,
              backgroundSize: '200% 200%', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>a la medida</span>
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0, position: 'relative' }}>
            <div style={{
              position: 'absolute', top: 30, left: 'calc(12.5% + 20px)', right: 'calc(12.5% + 20px)',
              height: 2, background: `linear-gradient(90deg, ${C.red}30, ${C.red}60, ${C.red}30)`,
            }} />
            {flotillasContent.process.map((p, i) => (
              <div key={i} style={{ textAlign: 'center', position: 'relative', zIndex: 1, padding: '0 12px' }}>
                <div style={{
                  width: 60, height: 60, borderRadius: 18, margin: '0 auto 18px',
                  background: `linear-gradient(135deg, ${C.red}, ${C.redLight})`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: F.heading, fontWeight: 900, fontSize: 20, color: C.white,
                  boxShadow: '0 8px 24px rgba(196,30,36,0.3)',
                }}>{p.step}</div>
                <h4 style={{ fontFamily: F.heading, fontWeight: 700, fontSize: 16, color: C.white, marginBottom: 8 }}>{p.title}</h4>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact form + direct contact */}
      <section style={{ padding: 'clamp(4rem, 8vw, 6rem) 1.5rem', background: C.light }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40 }}>
          {/* Form */}
          <div style={{
            background: C.white, borderRadius: 24, padding: 36,
            border: `1px solid ${C.border}`,
          }}>
            <h2 style={{ fontFamily: F.heading, fontWeight: 800, fontSize: 22, color: C.navy, marginBottom: 8 }}>Contáctanos</h2>
            <p style={{ fontSize: 14, color: C.gray, marginBottom: 28 }}>Déjanos tus datos y un ejecutivo se pondrá en contacto contigo.</p>
            {submitted ? (
              <div style={{ textAlign: 'center', padding: '48px 0' }}>
                <CheckCircle2 size={48} color="#22c55e" style={{ marginBottom: 16 }} />
                <h3 style={{ fontFamily: F.heading, fontWeight: 700, fontSize: 20, color: C.navy, marginBottom: 8 }}>¡Mensaje Enviado!</h3>
                <p style={{ fontSize: 14, color: C.gray }}>Un ejecutivo se pondrá en contacto contigo pronto.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  { key: 'name', label: 'Nombre completo', icon: User, type: 'text' },
                  { key: 'company', label: 'Empresa', icon: Building2, type: 'text' },
                  { key: 'fleetSize', label: 'Tamaño de flotilla (unidades)', icon: Truck, type: 'number' },
                  { key: 'phone', label: 'Teléfono', icon: Phone, type: 'tel' },
                  { key: 'email', label: 'Email', icon: Mail, type: 'email' },
                ].map(f => (
                  <div key={f.key} style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
                    borderRadius: 14, background: C.light, border: `1px solid ${C.border}`,
                  }}>
                    <f.icon size={16} color={C.gray} />
                    <input type={f.type} placeholder={f.label} required
                      value={formData[f.key]} onChange={e => setFormData({ ...formData, [f.key]: e.target.value })}
                      style={{ border: 'none', background: 'none', outline: 'none', flex: 1, fontSize: 14, color: C.navy }}
                    />
                  </div>
                ))}
                <textarea placeholder="Mensaje (opcional)" rows={3}
                  value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })}
                  style={{
                    padding: '14px 16px', borderRadius: 14, background: C.light,
                    border: `1px solid ${C.border}`, fontSize: 14, color: C.navy,
                    resize: 'vertical', outline: 'none', fontFamily: F.body,
                  }}
                />
                <button type="submit" className="glow-btn" style={{
                  padding: '16px 24px', borderRadius: 14, border: 'none',
                  background: `linear-gradient(135deg, ${C.red}, ${C.redLight})`,
                  color: C.white, fontFamily: F.heading, fontWeight: 700, fontSize: 15,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  boxShadow: '0 8px 32px rgba(196,30,36,0.3)',
                }}>
                  <Send size={16} /> Enviar Solicitud
                </button>
              </form>
            )}
          </div>

          {/* Direct contact */}
          <div>
            <div style={{
              background: C.navy, borderRadius: 24, padding: 36, marginBottom: 20,
            }}>
              <h3 style={{ fontFamily: F.heading, fontWeight: 700, fontSize: 20, color: C.white, marginBottom: 8 }}>
                ¡Estamos listos para asesorarte!
              </h3>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginBottom: 28 }}>
                Contacta directamente a nuestro equipo de flotillas.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <a href={`tel:${flotillasContent.hero.phone.replace(/\s/g, '')}`} style={{
                  padding: '18px 24px', borderRadius: 16,
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                  display: 'flex', alignItems: 'center', gap: 14, color: C.white,
                  transition: 'all 0.3s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
                >
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: `linear-gradient(135deg, ${C.red}, ${C.redLight})`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}><Phone size={20} color={C.white} /></div>
                  <div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Llámanos</div>
                    <div style={{ fontFamily: F.heading, fontWeight: 700, fontSize: 18 }}>{flotillasContent.hero.phone}</div>
                  </div>
                </a>
                <a href={`https://api.whatsapp.com/send/?phone=52${flotillasContent.hero.phone.replace(/\s/g, '')}&text=${encodeURIComponent('SW -Hola, me interesa el servicio de flotillas de Jasman')}`}
                  target="_blank" rel="noopener noreferrer" style={{
                    padding: '18px 24px', borderRadius: 16,
                    background: 'rgba(37,211,102,0.08)', border: '1px solid rgba(37,211,102,0.15)',
                    display: 'flex', alignItems: 'center', gap: 14, color: C.white,
                    transition: 'all 0.3s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(37,211,102,0.12)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(37,211,102,0.08)'; }}
                >
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: '#25d366',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}><MessageCircle size={20} color={C.white} /></div>
                  <div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>WhatsApp</div>
                    <div style={{ fontFamily: F.heading, fontWeight: 700, fontSize: 18 }}>Escríbenos</div>
                  </div>
                </a>
              </div>
            </div>

            {/* Edenred testimonial */}
            <div style={{
              background: C.white, borderRadius: 24, padding: 28,
              border: `1px solid ${C.border}`,
            }}>
              <div style={{ fontSize: 12, color: C.gray, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
                TESTIMONIO CLIENTE
              </div>
              <blockquote style={{
                fontSize: 15, color: C.navy, lineHeight: 1.75, fontStyle: 'italic',
                borderLeft: `3px solid ${C.red}`, paddingLeft: 16,
              }}>
                "Jasman nos ha dado un servicio excepcional para nuestra flotilla. Su programa personalizado nos ha permitido reducir costos y mantener nuestras unidades en óptimas condiciones."
              </blockquote>
              <div style={{ fontFamily: F.heading, fontWeight: 600, fontSize: 14, color: C.navy, marginTop: 12 }}>
                — Cliente Edenred
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
