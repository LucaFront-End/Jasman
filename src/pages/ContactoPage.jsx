import { useState, useRef, useEffect } from 'react';
import PageHero from '../components/PageHero';
import { C, F, useCountUp } from '../hooks/useAnimations';
import { Link } from 'react-router-dom';
import {
  Phone, Mail, MessageCircle, MapPin, Clock, Send, ArrowRight,
  Building2, User, FileText, ChevronDown, CheckCircle2,
  Headphones, Shield, Zap, Globe,
} from 'lucide-react';

/* ═══ DATA ═══ */
const contactMethods = [
  {
    icon: Phone, title: 'Teléfono', subtitle: 'Lunes a Sábado 8am – 7pm',
    value: '800 8010 290', action: 'tel:8008010290',
    color: '#3b82f6', gradient: 'linear-gradient(135deg, #3b82f6, #60a5fa)',
  },
  {
    icon: MessageCircle, title: 'WhatsApp', subtitle: 'Respuesta en minutos',
    value: '55 7933 7994',
    action: 'https://api.whatsapp.com/send/?phone=5215579337994&text=' + encodeURIComponent('SW -Hola quisiera más información sobre sus servicios automotrices'),
    color: '#22c55e', gradient: 'linear-gradient(135deg, #22c55e, #4ade80)',
  },
  {
    icon: Mail, title: 'Email', subtitle: 'Te respondemos en 24h',
    value: 'jasmanteescucha @jasman.com.mx', action: 'mailto:jasmanteescucha@jasman.com.mx', smallText: true,
    color: '#f59e0b', gradient: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
  },
  {
    icon: MapPin, title: 'Sucursales', subtitle: '80+ a nivel nacional',
    value: 'Encuentra la más cercana', action: '/sucursales', isLink: true,
    color: '#C41E24', gradient: `linear-gradient(135deg, #C41E24, #E8353B)`,
  },
];

const reasons = [
  { icon: Headphones, title: 'Atención Personalizada', text: 'Un equipo dedicado a resolver tus dudas y brindarte la mejor experiencia desde el primer contacto.' },
  { icon: Shield, title: 'Garantía en Todo', text: 'Cada servicio cuenta con garantía por escrito. Tu tranquilidad es nuestra prioridad absoluta.' },
  { icon: Zap, title: 'Respuesta Rápida', text: 'Nos comprometemos a responder tu mensaje en menos de 24 horas por cualquier canal.' },
  { icon: Globe, title: 'Cobertura Nacional', text: 'Con 80+ sucursales, siempre hay un Jasman cerca de ti para atenderte de manera presencial.' },
];

const subjects = [
  'Información general',
  'Agendar una cita',
  'Cotización de servicios',
  'Servicio a flotillas',
  'Facturación',
  'Quejas o sugerencias',
  'Bolsa de trabajo',
  'Ser proveedor',
  'Otro',
];

/* ═══ COMPONENTS ═══ */

function ContactCard({ method, index }) {
  const [hovered, setHovered] = useState(false);
  const IconComp = method.icon;

  const inner = (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: 28, borderRadius: 22, background: C.white,
        border: `1px solid ${hovered ? `${method.color}35` : C.border}`,
        transition: 'all 0.5s cubic-bezier(0.16,1,0.3,1)',
        transform: hovered ? 'translateY(-8px)' : 'translateY(0)',
        boxShadow: hovered ? `0 20px 48px ${method.color}15, 0 4px 12px rgba(0,0,0,0.04)` : '0 2px 8px rgba(0,0,0,0.02)',
        cursor: 'pointer', position: 'relative', overflow: 'hidden',
        opacity: 0, animation: `slideUp 0.6s ${0.1 * index}s cubic-bezier(0.16,1,0.3,1) forwards`,
      }}
    >
      {/* Top colored bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 3,
        background: hovered ? method.gradient : 'transparent',
        transition: 'background 0.4s',
      }} />

      <div style={{
        width: 54, height: 54, borderRadius: 16,
        background: method.gradient,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 18, boxShadow: `0 6px 20px ${method.color}25`,
        transition: 'all 0.5s cubic-bezier(0.16,1,0.3,1)',
        transform: hovered ? 'scale(1.1) rotate(-5deg)' : 'scale(1)',
      }}>
        <IconComp size={24} color={C.white} />
      </div>

      <h3 style={{
        fontFamily: F.heading, fontWeight: 700, fontSize: 17, color: C.navy, marginBottom: 4,
      }}>{method.title}</h3>
      <p style={{ fontSize: 12, color: C.gray, marginBottom: 12 }}>{method.subtitle}</p>
      <p style={{
        fontFamily: F.heading, fontWeight: 600, fontSize: method.smallText ? 12 : 14, color: method.color,
        display: 'flex', alignItems: 'center', gap: 6,
        wordBreak: 'break-word', lineHeight: 1.4,
      }}>
        {method.value}
        <ArrowRight size={14} style={{
          transition: 'transform 0.3s',
          transform: hovered ? 'translateX(4px)' : 'translateX(0)',
        }} />
      </p>
    </div>
  );

  if (method.isLink) {
    return <Link to={method.action} style={{ textDecoration: 'none' }}>{inner}</Link>;
  }
  return <a href={method.action} target={method.action.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" style={{ textDecoration: 'none' }}>{inner}</a>;
}

function ReasonCard({ reason, index }) {
  const [hovered, setHovered] = useState(false);
  const IconComp = reason.icon;
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', gap: 18, padding: 24, borderRadius: 20,
        background: hovered ? 'rgba(255,255,255,0.06)' : 'transparent',
        border: `1px solid ${hovered ? 'rgba(255,255,255,0.1)' : 'transparent'}`,
        transition: 'all 0.4s cubic-bezier(0.16,1,0.3,1)',
        transform: hovered ? 'translateX(6px)' : 'translateX(0)',
        opacity: 0, animation: `slideUp 0.6s ${0.12 * index}s cubic-bezier(0.16,1,0.3,1) forwards`,
      }}
    >
      <div style={{
        width: 48, height: 48, borderRadius: 14, flexShrink: 0,
        background: 'rgba(196,30,36,0.1)', border: '1px solid rgba(196,30,36,0.15)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.4s',
        transform: hovered ? 'scale(1.1) rotate(-5deg)' : 'scale(1)',
      }}>
        <IconComp size={22} color={C.redLight} />
      </div>
      <div>
        <h4 style={{
          fontFamily: F.heading, fontWeight: 700, fontSize: 15, color: C.white, marginBottom: 6,
        }}>{reason.title}</h4>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.7 }}>{reason.text}</p>
      </div>
    </div>
  );
}

/* ═══ MAIN PAGE ═══ */
export default function ContactoPage() {
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', subject: '', sucursal: '', message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouse = (e) => {
      setMousePos({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    };
    window.addEventListener('mousemove', handleMouse, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);

  const handleChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Build WhatsApp message from form data
    const lines = [
      `SW -Contacto desde sitio web`,
      `*Nombre:* ${formData.name}`,
      `*Email:* ${formData.email}`,
      formData.phone && `*Teléfono:* ${formData.phone}`,
      `*Asunto:* ${formData.subject}`,
      formData.sucursal && `*Sucursal:* ${formData.sucursal}`,
      `*Mensaje:* ${formData.message}`,
    ].filter(Boolean).join('\n');
    const url = `https://api.whatsapp.com/send/?phone=5215579337994&text=${encodeURIComponent(lines)}`;
    window.open(url, '_blank');
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
  };

  const inputStyle = (field) => ({
    width: '100%', padding: '14px 18px', borderRadius: 14,
    border: `1.5px solid ${focusedField === field ? C.red : C.border}`,
    background: focusedField === field ? 'rgba(196,30,36,0.02)' : C.white,
    fontFamily: F.body, fontSize: 14, color: C.navy,
    transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
    outline: 'none',
    boxShadow: focusedField === field ? `0 0 0 3px rgba(196,30,36,0.08)` : 'none',
  });

  const labelStyle = {
    display: 'block', fontFamily: F.heading, fontWeight: 600,
    fontSize: 13, color: C.navy, marginBottom: 8, letterSpacing: '0.01em',
  };

  return (
    <>
      <PageHero
        tag="CONTÁCTANOS"
        title="Estamos aquí"
        highlight="para ayudarte"
        subtitle="Comunícate con nosotros por el canal que prefieras. Nuestro equipo está listo para atenderte."
        breadcrumbs={[{ label: 'Contacto' }]}
        image="/images/contacto-hero.png"
      />

      {/* ═══ Contact Methods ═══ */}
      <section style={{ padding: 'clamp(4rem, 8vw, 6rem) 1.5rem', background: C.light }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 18px', borderRadius: 9999,
              background: 'rgba(196,30,36,0.08)', color: C.red,
              fontFamily: F.heading, fontWeight: 600, fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase',
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.red, animation: 'pulseGlow 2s infinite' }} />
              CANALES DE CONTACTO
            </span>
            <h2 style={{
              fontFamily: F.heading, fontWeight: 800, fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
              color: C.navy, lineHeight: 1.15, marginTop: 14,
            }}>
              Elige cómo{' '}
              <span className="animated-gradient" style={{
                background: `linear-gradient(135deg, ${C.red}, ${C.redLight}, ${C.red})`,
                backgroundSize: '200% 200%', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>comunicarte</span>
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
            {contactMethods.map((m, i) => (
              <ContactCard key={i} method={m} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Contact Form + Map ═══ */}
      <section style={{ padding: 'clamp(4rem, 8vw, 7rem) 1.5rem', background: C.white, position: 'relative' }}>
        {/* Decorative */}
        <div style={{
          position: 'absolute', top: -100, right: -100, width: 300, height: 300,
          borderRadius: '50%', border: '1px solid rgba(196,30,36,0.04)', pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 0.7fr', gap: 48, alignItems: 'start' }}>
            {/* Form */}
            <div style={{
              opacity: 0, animation: 'slideUp 0.7s 0.1s cubic-bezier(0.16,1,0.3,1) forwards',
            }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 18px', borderRadius: 9999,
                background: 'rgba(196,30,36,0.08)', color: C.red,
                fontFamily: F.heading, fontWeight: 600, fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 20,
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.red }} />
                FORMULARIO DE CONTACTO
              </span>
              <h2 style={{
                fontFamily: F.heading, fontWeight: 800, fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)',
                color: C.navy, lineHeight: 1.2, marginBottom: 8,
              }}>
                Envíanos un{' '}
                <span style={{ color: C.red }}>mensaje</span>
              </h2>
              <p style={{
                fontSize: 15, color: C.gray, lineHeight: 1.75, marginBottom: 32,
              }}>
                Completa el formulario y te responderemos a la brevedad por WhatsApp o correo electrónico.
              </p>

              {submitted ? (
                <div style={{
                  padding: 48, borderRadius: 24, textAlign: 'center',
                  background: 'rgba(34, 197, 94, 0.06)', border: '1px solid rgba(34, 197, 94, 0.2)',
                  animation: 'slideUp 0.5s cubic-bezier(0.16,1,0.3,1)',
                }}>
                  <CheckCircle2 size={48} color="#22c55e" style={{ marginBottom: 16 }} />
                  <h3 style={{ fontFamily: F.heading, fontWeight: 700, fontSize: 20, color: C.navy, marginBottom: 8 }}>
                    ¡Mensaje enviado!
                  </h3>
                  <p style={{ fontSize: 14, color: C.gray }}>
                    Tu mensaje ha sido enviado por WhatsApp. Nuestro equipo te contactará pronto.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                    <div>
                      <label style={labelStyle}>
                        <User size={12} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                        Nombre completo *
                      </label>
                      <input
                        type="text" required placeholder="Tu nombre"
                        value={formData.name} onChange={handleChange('name')}
                        onFocus={() => setFocusedField('name')} onBlur={() => setFocusedField(null)}
                        style={inputStyle('name')}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>
                        <Mail size={12} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                        Email *
                      </label>
                      <input
                        type="email" required placeholder="tu@email.com"
                        value={formData.email} onChange={handleChange('email')}
                        onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField(null)}
                        style={inputStyle('email')}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                    <div>
                      <label style={labelStyle}>
                        <Phone size={12} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                        Teléfono
                      </label>
                      <input
                        type="tel" placeholder="55 1234 5678"
                        value={formData.phone} onChange={handleChange('phone')}
                        onFocus={() => setFocusedField('phone')} onBlur={() => setFocusedField(null)}
                        style={inputStyle('phone')}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>
                        <FileText size={12} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                        Asunto *
                      </label>
                      <div style={{ position: 'relative' }}>
                        <select
                          required value={formData.subject} onChange={handleChange('subject')}
                          onFocus={() => setFocusedField('subject')} onBlur={() => setFocusedField(null)}
                          style={{
                            ...inputStyle('subject'),
                            cursor: 'pointer', paddingRight: 40,
                          }}
                        >
                          <option value="">Selecciona un asunto</option>
                          {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <ChevronDown size={16} color={C.gray} style={{
                          position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)',
                          pointerEvents: 'none',
                        }} />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label style={labelStyle}>
                      <Building2 size={12} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                      Sucursal de interés (opcional)
                    </label>
                    <input
                      type="text" placeholder="Ej: Polanco, Santa Fe, Monterrey..."
                      value={formData.sucursal} onChange={handleChange('sucursal')}
                      onFocus={() => setFocusedField('sucursal')} onBlur={() => setFocusedField(null)}
                      style={inputStyle('sucursal')}
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>
                      <MessageCircle size={12} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                      Mensaje *
                    </label>
                    <textarea
                      required rows={5} placeholder="Cuéntanos en qué podemos ayudarte..."
                      value={formData.message} onChange={handleChange('message')}
                      onFocus={() => setFocusedField('message')} onBlur={() => setFocusedField(null)}
                      style={{
                        ...inputStyle('message'),
                        resize: 'vertical', minHeight: 120, fontFamily: F.body,
                      }}
                    />
                  </div>

                  <button type="submit" className="glow-btn" style={{
                    padding: '16px 36px', borderRadius: 16, border: 'none',
                    background: `linear-gradient(135deg, ${C.red}, ${C.redLight})`,
                    color: C.white, fontFamily: F.heading, fontWeight: 700, fontSize: 15,
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                    boxShadow: '0 8px 32px rgba(196,30,36,0.3)',
                    transition: 'all 0.3s', cursor: 'pointer',
                    alignSelf: 'flex-start',
                  }}>
                    <Send size={16} />
                    Enviar por WhatsApp
                  </button>

                  <p style={{ fontSize: 12, color: C.gray, opacity: 0.6, marginTop: -8 }}>
                    Al enviar, se abrirá WhatsApp con tu mensaje preformado para que lo envíes directamente.
                  </p>
                </form>
              )}
            </div>

            {/* Right sidebar */}
            <div style={{
              position: 'sticky', top: 120,
              opacity: 0, animation: 'slideUp 0.7s 0.3s cubic-bezier(0.16,1,0.3,1) forwards',
            }}>
              {/* Info card */}
              <div style={{
                padding: 32, borderRadius: 24, background: C.navy,
                marginBottom: 20, position: 'relative', overflow: 'hidden',
              }}>
                {/* Glow */}
                <div style={{
                  position: 'absolute', top: -80, right: -80, width: 200, height: 200,
                  borderRadius: '50%', background: 'radial-gradient(circle, rgba(196,30,36,0.15), transparent)',
                  pointerEvents: 'none',
                }} />

                <h3 style={{
                  fontFamily: F.heading, fontWeight: 700, fontSize: 18, color: C.white, marginBottom: 24,
                }}>Información de contacto</h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                      background: 'rgba(196,30,36,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Phone size={18} color={C.redLight} />
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 2 }}>Teléfono</div>
                      <a href="tel:8008010290" style={{ fontFamily: F.heading, fontWeight: 600, fontSize: 15, color: C.white }}>800 8010 290</a>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                      background: 'rgba(34,197,94,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <MessageCircle size={18} color="#4ade80" />
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 2 }}>WhatsApp</div>
                      <a href="https://api.whatsapp.com/send/?phone=5215579337994" target="_blank" rel="noopener noreferrer" style={{ fontFamily: F.heading, fontWeight: 600, fontSize: 15, color: C.white }}>55 7933 7994</a>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                      background: 'rgba(245,158,11,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Mail size={18} color="#fbbf24" />
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 2 }}>Email</div>
                      <a href="mailto:jasmanteescucha@jasman.com.mx" style={{ fontFamily: F.heading, fontWeight: 600, fontSize: 14, color: C.white, wordBreak: 'break-all' }}>jasmanteescucha@jasman.com.mx</a>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                      background: 'rgba(139,92,246,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Clock size={18} color="#a78bfa" />
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 2 }}>Horario</div>
                      <div style={{ fontFamily: F.heading, fontWeight: 600, fontSize: 14, color: C.white }}>Lun – Sáb: 8:00 – 19:00</div>
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>Domingos: según sucursal</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Jasman Te Escucha card */}
              <div className="card-hover" style={{
                padding: 28, borderRadius: 22, background: C.white,
                border: `1px solid ${C.border}`, textAlign: 'center',
                marginBottom: 20,
              }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 16, margin: '0 auto 16px',
                  background: 'rgba(196,30,36,0.06)', border: '1px solid rgba(196,30,36,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Headphones size={24} color={C.red} />
                </div>
                <h4 style={{
                  fontFamily: F.heading, fontWeight: 700, fontSize: 16, color: C.navy, marginBottom: 8,
                }}>Jasman Te Escucha</h4>
                <p style={{ fontSize: 13, color: C.gray, lineHeight: 1.7, marginBottom: 16 }}>
                  ¿Tienes una queja, sugerencia o felicitación? Tu opinión es muy importante para nosotros.
                </p>
                <a href="https://www.jasman.com.mx/jasman-te-escucha" target="_blank" rel="noopener noreferrer"
                  className="glow-btn" style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '12px 24px', borderRadius: 12,
                    background: `linear-gradient(135deg, ${C.red}, ${C.redLight})`,
                    color: C.white, fontFamily: F.heading, fontWeight: 600, fontSize: 13,
                    boxShadow: '0 4px 16px rgba(196,30,36,0.25)',
                  }}>
                  Ir a Jasman Te Escucha <ArrowRight size={14} />
                </a>
              </div>

              {/* Quick links */}
              <div style={{
                padding: 24, borderRadius: 20,
                background: C.light, border: `1px solid ${C.border}`,
              }}>
                <h4 style={{
                  fontFamily: F.heading, fontWeight: 700, fontSize: 14, color: C.navy, marginBottom: 16,
                }}>Enlaces rápidos</h4>
                {[
                  { label: 'Facturación en línea', href: 'https://www.jasman.com.mx/facturación', external: true },
                  { label: 'Aviso de Privacidad', href: 'https://www.jasman.com.mx/avisodeprivacidad', external: true },
                  { label: 'Nuestros Servicios', href: '/servicios' },
                  { label: 'Bolsa de Trabajo', href: '/bolsa-de-trabajo' },
                  { label: 'Programa Flotillas', href: '/flotillas' },
                ].map((link, i) => (
                  link.external ? (
                    <a key={i} href={link.href} target="_blank" rel="noopener noreferrer" style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '10px 0', fontSize: 13, color: C.gray,
                      borderBottom: i < 4 ? `1px solid ${C.border}` : 'none',
                      transition: 'color 0.3s',
                    }}
                      onMouseEnter={e => e.currentTarget.style.color = C.red}
                      onMouseLeave={e => e.currentTarget.style.color = C.gray}
                    >
                      <ArrowRight size={12} /> {link.label}
                    </a>
                  ) : (
                    <Link key={i} to={link.href} style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '10px 0', fontSize: 13, color: C.gray,
                      borderBottom: i < 4 ? `1px solid ${C.border}` : 'none',
                      transition: 'color 0.3s',
                    }}
                      onMouseEnter={e => e.currentTarget.style.color = C.red}
                      onMouseLeave={e => e.currentTarget.style.color = C.gray}
                    >
                      <ArrowRight size={12} /> {link.label}
                    </Link>
                  )
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Why Contact Us ═══ */}
      <section style={{
        padding: 'clamp(4rem, 8vw, 6rem) 1.5rem',
        background: C.navy, position: 'relative', overflow: 'hidden',
      }}>
        {/* Decorative */}
        <div style={{
          position: 'absolute', top: -150, right: -150, width: 400, height: 400,
          borderRadius: '50%', border: '1px solid rgba(196,30,36,0.06)', pointerEvents: 'none',
          transform: `translate(${mousePos.x * -20}px, ${mousePos.y * -20}px)`,
          transition: 'transform 1s ease-out',
        }} />

        <div style={{ maxWidth: 900, margin: '0 auto', position: 'relative' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 18px', borderRadius: 9999,
              background: 'rgba(196,30,36,0.12)', color: C.redLight,
              fontFamily: F.heading, fontWeight: 600, fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase',
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.red, animation: 'pulseGlow 2s infinite' }} />
              NUESTRA PROMESA
            </span>
            <h2 style={{
              fontFamily: F.heading, fontWeight: 800, fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
              color: C.white, lineHeight: 1.15, marginTop: 14,
            }}>
              Siempre a tu{' '}
              <span className="animated-gradient" style={{
                background: `linear-gradient(135deg, ${C.redLight}, ${C.amber}, ${C.redLight})`,
                backgroundSize: '200% 200%', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>servicio</span>
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 8 }}>
            {reasons.map((r, i) => (
              <ReasonCard key={i} reason={r} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Map CTA ═══ */}
      <section style={{
        padding: 'clamp(3rem, 6vw, 5rem) 1.5rem',
        background: `linear-gradient(135deg, ${C.light} 0%, rgba(196,30,36,0.04) 100%)`,
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <MapPin size={40} color={C.red} style={{ marginBottom: 16 }} />
          <h2 style={{
            fontFamily: F.heading, fontWeight: 800, fontSize: 'clamp(1.6rem, 4vw, 2.4rem)',
            color: C.navy, marginBottom: 12,
          }}>
            ¿Prefieres visitarnos?
          </h2>
          <p style={{
            fontSize: 16, color: C.gray, lineHeight: 1.75, marginBottom: 28,
          }}>
            Encuentra la sucursal Jasman más cercana a ti entre nuestras 80+ ubicaciones a nivel nacional.
          </p>
          <Link to="/sucursales" className="glow-btn" style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            padding: '16px 36px', borderRadius: 16,
            background: `linear-gradient(135deg, ${C.red}, ${C.redLight})`,
            color: C.white, fontFamily: F.heading, fontWeight: 700, fontSize: 15,
            boxShadow: '0 8px 32px rgba(196,30,36,0.3)',
          }}>
            <MapPin size={18} />
            Explorar Sucursales
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </>
  );
}
