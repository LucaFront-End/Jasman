import { useState } from 'react';
import { Link } from 'react-router-dom';
import { C, F, useCountUp } from '../hooks/useAnimations';
import Icon from '../components/Icon';
import Locations from '../components/Locations';
import IsometricWorkshopScene from '../components/IsometricWorkshopScene';
import { flotillasContent } from '../data/flotillasData';
import { saveFlotillasContacto } from '../services/wixService';
import { useFlotillasDispatch } from '../hooks/useFlotillasDispatch';
import {
  Phone,
  MessageCircle,
  Send,
  CheckCircle2,
  ArrowRight,
  Building2,
  User,
  Mail,
  Truck,
  MapPin,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';

const {
  contact: FLOTILLAS_CONTACT,
  hero: HERO_DATA,
  stats: STATS_DATA,
  benefits: BENEFITS_DATA,
  processSection: PROCESS_SECTION,
  process: PROCESS_STEPS,
  clients: CLIENT_LOGOS,
} = flotillasContent;

function buildFlotillasWaUrl(data, folio) {
  const lines = [
    'SW - Hola equipo de Flotillas Jasman, envié una solicitud desde el sitio web:',
    folio ? `• Folio: ${folio}` : null,
    data.name ? `• Nombre: ${data.name}` : null,
    data.company ? `• Empresa: ${data.company}` : null,
    data.city ? `• Ciudad: ${data.city}` : null,
    data.fleetSize ? `• Tamaño de flotilla: ${data.fleetSize} unidades` : null,
    data.phone ? `• Teléfono: ${data.phone}` : null,
    data.email ? `• Email: ${data.email}` : null,
    data.message ? `• Mensaje: ${data.message}` : null,
  ]
    .filter(Boolean)
    .join('\n');
  return `https://api.whatsapp.com/send/?phone=${FLOTILLAS_CONTACT.whatsappPhone}&text=${encodeURIComponent(lines)}`;
}

function HeroStatCard({ prefix = '+', number, suffix = '', label, formatThousands = false }) {
  const { ref, count } = useCountUp(number, 1800);
  const formattedCount = formatThousands ? count.toLocaleString('es-MX') : count;
  return (
    <div
      ref={ref}
      className="flotillas-stat-card"
      style={{
        padding: '14px 16px',
        borderRadius: 16,
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <div
        className="flotillas-stat-num"
        style={{
          fontFamily: F.heading,
          fontWeight: 900,
          fontSize: 'clamp(1.45rem, 2.4vw, 2rem)',
          color: C.redLight,
          lineHeight: 1.1,
        }}
      >
        {prefix}
        {formattedCount}
        {suffix}
      </div>
      <div
        className="flotillas-stat-label"
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: 'rgba(255,255,255,0.72)',
          marginTop: 5,
          lineHeight: 1.35,
        }}
      >
        {label}
      </div>
    </div>
  );
}

const repeatCount = Math.max(1, Math.ceil(8 / Math.max(1, CLIENT_LOGOS.length)));
const MARQUEE_CLIENT_LOGOS = Array.from({ length: repeatCount }, () => CLIENT_LOGOS).flat();
const MARQUEE_TRACK_LOGOS = [...MARQUEE_CLIENT_LOGOS, ...MARQUEE_CLIENT_LOGOS];

export default function FlotillasPage() {
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    city: '',
    fleetSize: '',
    phone: '',
    email: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [submittedWaUrl, setSubmittedWaUrl] = useState('');

  const {
    bayPhase,
    showCheck,
    dispatchedCount,
    lastDispatch,
    activeVehicle,
    dispatchVehicle,
  } = useFlotillasDispatch({ autoLoop: true });

  // Title and meta description managed centrally by SeoManager

  const handleSubmit = (e) => {
    e.preventDefault();
    const folio = 'FL-' + Math.floor(100000 + Math.random() * 900000);
    const waUrl = buildFlotillasWaUrl(formData, folio);
    setSubmittedWaUrl(waUrl);

    dispatchVehicle({
      source: 'flotillas',
      folio,
      unitsCount: formData.fleetSize,
      label: formData.company
        ? `Solicitud Flotilla · ${formData.company}`
        : 'Solicitud de Flotilla Registrada',
      bay: 'Coordinación Flotillas Jasman',
    });

    saveFlotillasContacto({
      folio,
      nombre: formData.name,
      empresa: formData.company,
      ciudad: formData.city,
      telefono: formData.phone,
      email: formData.email,
      unidades: formData.fleetSize,
      mensaje: formData.message,
    }).catch((err) => console.warn('Wix save error in flotillas:', err));

    window.open(waUrl, '_blank', 'noopener,noreferrer');
    setSubmitted(true);
  };

  return (
    <>
      {/* ═══════ 1. FIRST-SCREEN HERO + LIVE ISOMETRIC WORKSHOP ═══════ */}
      <section
        className="flotillas-hero-sec"
        style={{
          padding: 'clamp(104px, 10vw, 128px) 1.5rem clamp(42px, 5vw, 60px)',
          background: 'linear-gradient(155deg, #0B1120 0%, #131B33 55%, #0F152A 100%)',
          position: 'relative',
          overflow: 'hidden',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: -160,
            right: -120,
            width: 520,
            height: 520,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(196,30,36,0.16) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
        <div style={{ maxWidth: 1260, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          {/* Breadcrumbs */}
          <nav
            aria-label="Breadcrumb"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 12.5,
              color: 'rgba(255,255,255,0.5)',
              marginBottom: 18,
            }}
          >
            <Link to="/" style={{ color: 'rgba(255,255,255,0.65)', textDecoration: 'none', fontWeight: 500 }}>
              Inicio
            </Link>
            <ChevronRight size={13} color="rgba(255,255,255,0.35)" />
            <span style={{ color: C.white, fontWeight: 700 }}>Flotillas</span>
          </nav>

          <div className="flotillas-hero-split">
            {/* Left column: Value prop + Badge + CTAs + 3 KPIs */}
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '6px 14px',
                    borderRadius: 9999,
                    background: 'rgba(196,30,36,0.16)',
                    border: '1px solid rgba(229,57,53,0.35)',
                    color: '#FCA5A5',
                    fontFamily: F.heading,
                    fontWeight: 800,
                    fontSize: 11,
                    letterSpacing: '0.07em',
                    textTransform: 'uppercase',
                  }}
                >
                  <ShieldCheck size={14} color="#F87171" />
                  {HERO_DATA.badge}
                </span>
                <span
                  style={{
                    fontFamily: F.heading,
                    fontWeight: 700,
                    fontSize: 11,
                    letterSpacing: '0.08em',
                    color: 'rgba(255,255,255,0.55)',
                    textTransform: 'uppercase',
                  }}
                >
                  {HERO_DATA.tag}
                </span>
              </div>

              <h1
                style={{
                  fontFamily: F.heading,
                  fontWeight: 900,
                  fontSize: 'clamp(2rem, 4.2vw, 3.15rem)',
                  color: C.white,
                  lineHeight: 1.08,
                  letterSpacing: '-0.025em',
                  marginBottom: 16,
                }}
              >
                {HERO_DATA.title}{' '}
                <span
                  className="animated-gradient"
                  style={{
                    background: `linear-gradient(135deg, ${C.redLight}, ${C.amber}, ${C.redLight})`,
                    backgroundSize: '200% 200%',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {HERO_DATA.titleHighlight}
                </span>
              </h1>

              <p
                style={{
                  fontSize: 'clamp(14px, 1.3vw, 15.5px)',
                  color: 'rgba(255,255,255,0.74)',
                  lineHeight: 1.65,
                  marginBottom: 24,
                  maxWidth: 560,
                }}
              >
                {HERO_DATA.subtitle}
              </p>

              {/* Hero CTAs */}
              <div className="flotillas-hero-ctas" style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 26 }}>
                <a
                  href="#contacto-flotillas"
                  className="glow-btn"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '13px 22px',
                    borderRadius: 13,
                    background: `linear-gradient(135deg, ${C.red}, ${C.redLight})`,
                    color: C.white,
                    fontFamily: F.heading,
                    fontWeight: 800,
                    fontSize: 14,
                    textDecoration: 'none',
                    boxShadow: '0 8px 28px rgba(196,30,36,0.34)',
                  }}
                >
                  Solicitar Plan a la Medida <ArrowRight size={16} />
                </a>

                <a
                  href={`https://api.whatsapp.com/send/?phone=${FLOTILLAS_CONTACT.whatsappPhone}&text=${encodeURIComponent('SW - Hola, me interesa cotizar un plan para nuestra flotilla')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '13px 20px',
                    borderRadius: 13,
                    background: 'rgba(37,211,102,0.14)',
                    border: '1px solid rgba(37,211,102,0.34)',
                    color: '#86EFAC',
                    fontFamily: F.heading,
                    fontWeight: 700,
                    fontSize: 13.5,
                    textDecoration: 'none',
                  }}
                >
                  <MessageCircle size={16} color="#25D366" />
                  WhatsApp Directo
                </a>

                <a
                  href={FLOTILLAS_CONTACT.landlineHref}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '13px 18px',
                    borderRadius: 13,
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.14)',
                    color: C.white,
                    fontFamily: F.heading,
                    fontWeight: 700,
                    fontSize: 13.5,
                    textDecoration: 'none',
                  }}
                >
                  <Phone size={15} color={C.redLight} />
                  {FLOTILLAS_CONTACT.landlineDisplay}
                </a>
              </div>

              {/* 3 KPIs Grid */}
              <div className="flotillas-stats-grid">
                {STATS_DATA.map((s) => (
                  <HeroStatCard
                    key={s.label}
                    prefix={s.prefix}
                    number={s.number}
                    suffix={s.suffix}
                    label={s.label}
                    formatThousands={s.formatThousands}
                  />
                ))}
              </div>
            </div>

            {/* Right column: Isometric Live Fleet Workshop immediately visible above the fold */}
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 8,
                  marginBottom: 12,
                  padding: '0 4px',
                }}
              >
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '5px 13px',
                    borderRadius: 9999,
                    background: 'rgba(34,197,94,0.12)',
                    border: '1px solid rgba(34,197,94,0.28)',
                    color: '#86EFAC',
                    fontFamily: F.heading,
                    fontWeight: 700,
                    fontSize: 10.5,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                  }}
                >
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E' }} />
                  OPERACIÓN EN TIEMPO REAL
                </span>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.62)', fontWeight: 500 }}>
                  Unidades listas y saliendo a ruta
                </span>
              </div>

              <IsometricWorkshopScene
                variant="full"
                bayPhase={bayPhase}
                showCheck={showCheck}
                dispatchedCount={dispatchedCount}
                lastDispatch={lastDispatch}
                activeVehicle={activeVehicle}
                onTriggerDispatch={() =>
                  dispatchVehicle({
                    source: 'manual',
                    label: `${activeVehicle?.label || 'Unidad Flotilla'} · Checklist 72 pts OK`,
                  })
                }
              />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ 2. BENEFITS & SINGLE ADMINISTRATION ═══════ */}
      <section className="flotillas-benefits-sec" style={{ padding: 'clamp(4rem, 7vw, 6rem) 1.5rem', background: C.white }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: 680, margin: '0 auto 48px' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 18px',
                borderRadius: 9999,
                background: 'rgba(196,30,36,0.08)',
                color: C.red,
                fontFamily: F.heading,
                fontWeight: 700,
                fontSize: 11.5,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: 16,
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.red }} />
              BAJO UNA ÚNICA ADMINISTRACIÓN
            </span>
            <h2
              style={{
                fontFamily: F.heading,
                fontWeight: 800,
                fontSize: 'clamp(1.9rem, 4.5vw, 2.85rem)',
                color: C.navy,
                lineHeight: 1.12,
                marginBottom: 12,
              }}
            >
              Pensamos en cada una de{' '}
              <span style={{ color: C.red }}>tus necesidades</span>
            </h2>
            <p style={{ fontSize: 15, color: C.gray, lineHeight: 1.65 }}>
              Centraliza el control operativo, financiero y preventivo de toda tu flota en una sola red nacional de talleres certificados.
            </p>
          </div>

          <div className="flotillas-benefits-grid">
            {BENEFITS_DATA.map((b) => (
              <div
                key={b.title}
                className="flotillas-benefit-card"
                style={{
                  padding: 28,
                  borderRadius: 22,
                  background: b.featured ? 'rgba(196,30,36,0.035)' : C.light,
                  border: b.featured ? '1.5px solid rgba(196,30,36,0.24)' : `1px solid ${C.border}`,
                  transition: 'all 0.35s cubic-bezier(0.16,1,0.3,1)',
                }}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 16,
                    background: b.featured ? C.red : 'rgba(196,30,36,0.08)',
                    border: b.featured ? 'none' : '1px solid rgba(196,30,36,0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 18,
                  }}
                >
                  <Icon name={b.icon} size={24} color={b.featured ? C.white : C.red} />
                </div>
                <h3 style={{ fontFamily: F.heading, fontWeight: 800, fontSize: 18, color: C.navy, marginBottom: 10 }}>
                  {b.title}
                </h3>
                <p style={{ fontSize: 14, color: C.gray, lineHeight: 1.7 }}>{b.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ 3. HOMOLOGATED PROCESS & CREDIT LINE ("CREAMOS PLAN A LA MEDIDA") ═══════ */}
      <section className="flotillas-process-sec" style={{ padding: 'clamp(4rem, 7vw, 6rem) 1.5rem', background: C.navy, position: 'relative', overflow: 'hidden' }}>
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: -200,
            right: -200,
            width: 500,
            height: 500,
            borderRadius: '50%',
            border: '1px solid rgba(196,30,36,0.08)',
            pointerEvents: 'none',
          }}
        />
        <div style={{ maxWidth: 1080, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', maxWidth: 700, margin: '0 auto 52px' }}>
            <h2
              style={{
                fontFamily: F.heading,
                fontWeight: 800,
                fontSize: 'clamp(1.9rem, 4vw, 2.7rem)',
                color: C.white,
                marginBottom: 14,
              }}
            >
              {PROCESS_SECTION.title}{' '}
              <span
                className="animated-gradient"
                style={{
                  background: `linear-gradient(135deg, ${C.redLight}, ${C.amber}, ${C.redLight})`,
                  backgroundSize: '200% 200%',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {PROCESS_SECTION.titleHighlight}
              </span>
            </h2>
            <p style={{ fontSize: 15.5, color: 'rgba(255,255,255,0.72)', lineHeight: 1.6 }}>
              {PROCESS_SECTION.subtitle}
            </p>
          </div>

          <div className="flotillas-process-grid">
            <div
              className="flotillas-process-line"
              style={{
                position: 'absolute',
                top: 30,
                left: 'calc(12.5% + 20px)',
                right: 'calc(12.5% + 20px)',
                height: 2,
                background: `linear-gradient(90deg, ${C.red}30, ${C.red}70, ${C.red}30)`,
              }}
            />
            {PROCESS_STEPS.map((p) => (
              <div
                key={p.step}
                className="flotillas-process-step"
                style={{ textAlign: 'center', position: 'relative', zIndex: 1, padding: '0 8px' }}
              >
                <div
                  className="flotillas-process-badge"
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 18,
                    margin: '0 auto 18px',
                    background: `linear-gradient(135deg, ${C.red}, ${C.redLight})`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: F.heading,
                    fontWeight: 900,
                    fontSize: 20,
                    color: C.white,
                    boxShadow: '0 8px 24px rgba(196,30,36,0.32)',
                  }}
                >
                  {p.step}
                </div>
                <div className="flotillas-process-copy">
                  <h3 style={{ fontFamily: F.heading, fontWeight: 700, fontSize: 16, color: C.white, marginBottom: 8 }}>
                    {p.title}
                  </h3>
                  <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.62)', lineHeight: 1.65, margin: 0 }}>{p.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ 4. CORPORATE CLIENT LOGOS CAROUSEL (NO TESTIMONIALS) ═══════ */}
      <section className="flotillas-clients-sec" style={{ padding: 'clamp(3.5rem, 6vw, 5rem) 1.5rem', background: '#F8FAFC', borderBottom: `1px solid ${C.border}`, overflow: 'hidden' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 36px' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 16px',
                borderRadius: 9999,
                background: 'rgba(26,31,54,0.06)',
                color: C.navy,
                fontFamily: F.heading,
                fontWeight: 700,
                fontSize: 11,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: 14,
              }}
            >
              CLIENTES CORPORATIVOS
            </span>
            <h2 style={{ fontFamily: F.heading, fontWeight: 800, fontSize: 'clamp(1.65rem, 3.6vw, 2.35rem)', color: C.navy, lineHeight: 1.15 }}>
              Flotillas líderes que confían en <span style={{ color: C.red }}>Jasman</span>
            </h2>
          </div>

          <div
            className="flotillas-clients-marquee-viewport"
            style={{
              position: 'relative',
              width: '100%',
              overflow: 'hidden',
              padding: '8px 0',
            }}
          >
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: 0,
                width: 'clamp(20px, 5vw, 72px)',
                background: 'linear-gradient(90deg, #F8FAFC 0%, rgba(248, 250, 252, 0) 100%)',
                zIndex: 2,
                pointerEvents: 'none',
              }}
            />
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                right: 0,
                width: 'clamp(20px, 5vw, 72px)',
                background: 'linear-gradient(270deg, #F8FAFC 0%, rgba(248, 250, 252, 0) 100%)',
                zIndex: 2,
                pointerEvents: 'none',
              }}
            />
            <div className="flotillas-clients-marquee-track">
              {MARQUEE_TRACK_LOGOS.map((client, idx) => (
                <div
                  key={`${client.id}-${idx}`}
                  className="flotillas-client-logo-card"
                  style={{
                    width: 240,
                    height: 116,
                    flexShrink: 0,
                    background: '#FFFFFF',
                    borderRadius: 20,
                    padding: '20px 24px',
                    border: '1px solid rgba(26, 31, 54, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 8px 24px rgba(26, 31, 54, 0.045)',
                  }}
                >
                  <img
                    src={client.logo}
                    alt={client.name}
                    className={client.badge ? 'flotillas-client-logo-img is-badge' : 'flotillas-client-logo-img'}
                    loading="eager"
                    decoding="sync"
                    width={client.maxWidth || 168}
                    height={client.maxHeight || 48}
                    style={{
                      width: client.maxWidth || 168,
                      height: client.maxHeight || 48,
                      maxWidth: '100%',
                      maxHeight: client.maxHeight || 50,
                      objectFit: 'contain',
                      borderRadius: client.badge ? 14 : 0,
                      display: 'block',
                      flexShrink: 0,
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ 5. BRANCH MAP ("MAPA DE SUCURSALES") ═══════ */}
      <Locations />

      {/* ═══════ 6. CONTACT FORM (+ CIUDAD) & NESTOR DIRECT CONTACT ═══════ */}
      <section id="contacto-flotillas" className="flotillas-contact-sec" style={{ padding: 'clamp(4rem, 7vw, 6rem) 1.5rem', background: C.light }}>
        <div className="flotillas-contact-grid">
          {/* Form */}
          <div
            className="flotillas-form-card"
            style={{
              minWidth: 0,
              background: C.white,
              borderRadius: 24,
              padding: 'clamp(24px, 4vw, 36px)',
              border: `1px solid ${C.border}`,
            }}
          >
            <h2 style={{ fontFamily: F.heading, fontWeight: 800, fontSize: 22, color: C.navy, marginBottom: 8 }}>
              Contáctanos
            </h2>
            <p style={{ fontSize: 14, color: C.gray, marginBottom: 24 }}>
              Déjanos los datos de tu empresa y ciudad de operación para preparar tu plan y línea de crédito a la medida.
            </p>
            {submitted ? (
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <CheckCircle2 size={44} color="#22c55e" style={{ marginBottom: 12, display: 'inline-block' }} />
                <h3 style={{ fontFamily: F.heading, fontWeight: 700, fontSize: 20, color: C.navy, marginBottom: 8 }}>
                  ¡Solicitud Enviada!
                </h3>
                <p style={{ fontSize: 14, color: C.gray, marginBottom: 18 }}>
                  Tu solicitud quedó registrada para {formData.city || 'tu ciudad'} y enviada a nuestro equipo de Flotillas.
                </p>
                <div style={{ marginBottom: 18, textAlign: 'left' }}>
                  <IsometricWorkshopScene
                    variant="compact"
                    bayPhase={bayPhase}
                    showCheck={true}
                    dispatchedCount={dispatchedCount}
                    lastDispatch={lastDispatch}
                    activeVehicle={activeVehicle}
                  />
                </div>
                {submittedWaUrl && (
                  <a
                    href={submittedWaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 9,
                      padding: '13px 22px',
                      borderRadius: 12,
                      background: '#25d366',
                      color: C.white,
                      fontFamily: F.heading,
                      fontWeight: 700,
                      fontSize: 14,
                      textDecoration: 'none',
                      boxShadow: '0 8px 24px rgba(37, 211, 102, 0.28)',
                    }}
                  >
                    <MessageCircle size={17} />
                    Enviar por WhatsApp ({FLOTILLAS_CONTACT.whatsappDisplay})
                  </a>
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { key: 'name', label: 'Nombre completo', icon: User, type: 'text' },
                  { key: 'company', label: 'Empresa', icon: Building2, type: 'text' },
                  { key: 'city', label: 'Ciudad', icon: MapPin, type: 'text' },
                  { key: 'fleetSize', label: 'Tamaño de flotilla (unidades)', icon: Truck, type: 'number' },
                  { key: 'phone', label: 'Teléfono', icon: Phone, type: 'tel' },
                  { key: 'email', label: 'Email', icon: Mail, type: 'email' },
                ].map((f) => (
                  <div
                    key={f.key}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '13px 16px',
                      borderRadius: 14,
                      background: C.light,
                      border: `1px solid ${C.border}`,
                    }}
                  >
                    <f.icon size={16} color={C.gray} />
                    <input
                      type={f.type}
                      placeholder={f.label}
                      required
                      value={formData[f.key]}
                      onChange={(e) => setFormData({ ...formData, [f.key]: e.target.value })}
                      style={{
                        border: 'none',
                        background: 'none',
                        outline: 'none',
                        flex: 1,
                        fontSize: 14,
                        color: C.navy,
                      }}
                    />
                  </div>
                ))}
                <textarea
                  placeholder="Mensaje (opcional)"
                  rows={3}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  style={{
                    padding: '13px 16px',
                    borderRadius: 14,
                    background: C.light,
                    border: `1px solid ${C.border}`,
                    fontSize: 14,
                    color: C.navy,
                    resize: 'vertical',
                    outline: 'none',
                    fontFamily: F.body,
                  }}
                />
                <button
                  type="submit"
                  className="glow-btn"
                  style={{
                    padding: '15px 24px',
                    borderRadius: 14,
                    border: 'none',
                    background: `linear-gradient(135deg, ${C.red}, ${C.redLight})`,
                    color: C.white,
                    fontFamily: F.heading,
                    fontWeight: 700,
                    fontSize: 15,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    boxShadow: '0 8px 32px rgba(196,30,36,0.3)',
                  }}
                >
                  <Send size={16} /> Enviar Solicitud
                </button>
              </form>
            )}
          </div>

          {/* Direct contact card */}
          <div style={{ minWidth: 0 }}>
            <div className="flotillas-exec-card" style={{ background: C.navy, borderRadius: 24, padding: 'clamp(24px, 4vw, 36px)' }}>
              <span
                style={{
                  display: 'inline-block',
                  padding: '4px 12px',
                  borderRadius: 9999,
                  background: 'rgba(196,30,36,0.18)',
                  color: '#FCA5A5',
                  fontFamily: F.heading,
                  fontWeight: 700,
                  fontSize: 11,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  marginBottom: 12,
                }}
              >
                {FLOTILLAS_CONTACT.executiveLabel}
              </span>
              <h3 style={{ fontFamily: F.heading, fontWeight: 800, fontSize: 21, color: C.white, marginBottom: 8 }}>
                ¡Estamos listos para asesorarte!
              </h3>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', marginBottom: 24, lineHeight: 1.55 }}>
                Comunícate directamente con nuestra coordinación nacional de flotillas por teléfono fijo, WhatsApp o correo.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* 1. Landline + Ext. 1071 */}
                <a
                  href={FLOTILLAS_CONTACT.landlineHref}
                  className="flotillas-exec-link"
                  style={{
                    padding: '16px 20px',
                    borderRadius: 16,
                    background: 'rgba(255,255,255,0.045)',
                    border: '1px solid rgba(255,255,255,0.09)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    color: C.white,
                    textDecoration: 'none',
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: `linear-gradient(135deg, ${C.red}, ${C.redLight})`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Phone size={20} color={C.white} />
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Teléfono Fijo · Atención Flotillas</div>
                    <div style={{ fontFamily: F.heading, fontWeight: 700, fontSize: 17 }}>
                      {FLOTILLAS_CONTACT.landlineDisplay}
                    </div>
                  </div>
                </a>

                {/* 2. Direct WhatsApp */}
                <a
                  href={`https://api.whatsapp.com/send/?phone=${FLOTILLAS_CONTACT.whatsappPhone}&text=${encodeURIComponent('SW - Hola, me interesa el servicio de flotillas de Jasman')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flotillas-exec-link"
                  style={{
                    padding: '16px 20px',
                    borderRadius: 16,
                    background: 'rgba(37,211,102,0.09)',
                    border: '1px solid rgba(37,211,102,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    color: C.white,
                    textDecoration: 'none',
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: '#25d366',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <MessageCircle size={20} color={C.white} />
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>WhatsApp / Directo Flotillas</div>
                    <div style={{ fontFamily: F.heading, fontWeight: 700, fontSize: 17 }}>
                      {FLOTILLAS_CONTACT.whatsappDisplay}
                    </div>
                  </div>
                </a>

                {/* 3. Corporate Email */}
                <a
                  href={`mailto:${FLOTILLAS_CONTACT.email}`}
                  className="flotillas-exec-link"
                  style={{
                    padding: '16px 20px',
                    borderRadius: 16,
                    background: 'rgba(255,255,255,0.045)',
                    border: '1px solid rgba(255,255,255,0.09)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    color: C.white,
                    textDecoration: 'none',
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: 'rgba(255,255,255,0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Mail size={20} color={C.white} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Correo Corporativo</div>
                    <div
                      style={{
                        fontFamily: F.heading,
                        fontWeight: 700,
                        fontSize: 16,
                        overflowWrap: 'anywhere',
                      }}
                    >
                      {FLOTILLAS_CONTACT.email}
                    </div>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .flotillas-hero-split {
          display: grid;
          grid-template-columns: minmax(0, 0.94fr) minmax(0, 1.06fr);
          gap: clamp(24px, 4vw, 44px);
          align-items: center;
        }
        .flotillas-stats-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
        }
        .flotillas-benefits-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 20px;
        }
        .flotillas-process-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 18px;
          position: relative;
        }
        .flotillas-contact-grid {
          max-width: 1080px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
          gap: 36px;
        }
        @keyframes flotillasClientsMarquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .flotillas-clients-marquee-track {
          display: flex;
          gap: 20px;
          width: max-content;
          animation: flotillasClientsMarquee 38s linear infinite;
        }
        .flotillas-clients-marquee-track:hover {
          animation-play-state: paused;
        }
        @media (max-width: 980px) {
          .flotillas-hero-split,
          .flotillas-contact-grid {
            grid-template-columns: minmax(0, 1fr) !important;
            gap: 26px !important;
          }
          .flotillas-benefits-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 16px !important;
          }
        }
        @media (max-width: 860px) {
          section .flotillas-process-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 18px !important;
          }
          .flotillas-process-line {
            display: none !important;
          }
        }
        @media (max-width: 640px) {
          .flotillas-hero-sec {
            padding: 88px 14px 28px !important;
          }
          .flotillas-hero-ctas {
            gap: 10px !important;
            margin-bottom: 20px !important;
          }
          .flotillas-hero-ctas > a:first-child {
            flex: 1 1 100% !important;
            justify-content: center !important;
            padding: 13px 18px !important;
          }
          .flotillas-hero-ctas > a:not(:first-child) {
            flex: 1 1 calc(50% - 5px) !important;
            min-width: 0 !important;
            justify-content: center !important;
            padding: 11px 10px !important;
            font-size: 12px !important;
            white-space: nowrap !important;
          }
          .flotillas-stats-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
            gap: 8px !important;
          }
          .flotillas-stat-card {
            padding: 10px 8px !important;
            border-radius: 13px !important;
            text-align: center !important;
          }
          .flotillas-stat-num {
            font-size: 1.15rem !important;
          }
          .flotillas-stat-label {
            font-size: 10px !important;
            line-height: 1.25 !important;
          }
          .flotillas-benefits-sec,
          .flotillas-process-sec,
          .flotillas-clients-sec,
          .flotillas-contact-sec {
            padding: 48px 14px !important;
          }
          .flotillas-benefits-grid {
            grid-template-columns: minmax(0, 1fr) !important;
            gap: 12px !important;
          }
          .flotillas-benefit-card {
            padding: 20px 18px !important;
            border-radius: 18px !important;
          }
          section .flotillas-process-grid {
            grid-template-columns: minmax(0, 1fr) !important;
            gap: 12px !important;
          }
          .flotillas-process-step {
            display: flex !important;
            align-items: flex-start !important;
            gap: 14px !important;
            text-align: left !important;
            padding: 16px !important;
            border-radius: 18px !important;
            background: rgba(255, 255, 255, 0.04) !important;
            border: 1px solid rgba(255, 255, 255, 0.08) !important;
            width: 100% !important;
            min-width: 0 !important;
            box-sizing: border-box !important;
          }
          .flotillas-process-copy {
            flex: 1 1 auto !important;
            min-width: 0 !important;
          }
          .flotillas-process-badge {
            margin: 0 !important;
            width: 46px !important;
            height: 46px !important;
            border-radius: 14px !important;
            font-size: 16px !important;
            flex-shrink: 0 !important;
          }
          .flotillas-clients-marquee-track {
            gap: 14px !important;
          }
          .flotillas-client-logo-card {
            width: 176px !important;
            height: 92px !important;
            padding: 14px 16px !important;
            border-radius: 16px !important;
          }
          .flotillas-client-logo-card img.flotillas-client-logo-img {
            width: 136px !important;
            height: 44px !important;
            max-width: 140px !important;
            max-height: 44px !important;
          }
          .flotillas-client-logo-card img.flotillas-client-logo-img.is-badge {
            width: 50px !important;
            height: 50px !important;
            max-width: 50px !important;
            max-height: 50px !important;
          }
          .flotillas-form-card,
          .flotillas-exec-card {
            padding: 22px 16px !important;
            border-radius: 20px !important;
          }
          .flotillas-form-card input,
          .flotillas-form-card textarea {
            font-size: 16px !important;
          }
          .flotillas-exec-link {
            padding: 13px 14px !important;
            gap: 12px !important;
          }
        }
      `}</style>
    </>
  );
}
