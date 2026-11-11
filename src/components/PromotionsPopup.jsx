import { useState, useEffect } from 'react';
import { C, F } from '../hooks/useAnimations';
import { saveContactoWeb } from '../services/wixService';
import {
  X,
  Tag,
  Check,
  Sparkles,
  AlertCircle,
  Phone,
  User,
  Mail,
  MapPin,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';

const CITIES = [
  'Ciudad de México (CDMX)',
  'Estado de México (Naucalpan, Tlalnepantla, Cuautitlán)',
  'Toluca y Metepec',
  'Guadalajara y Zapopan',
  'Monterrey y San Pedro',
  'Santiago de Querétaro y San Juan del Río',
  'León, Irapuato y Celaya (Bajío)',
  'Morelia y Michoacán',
  'Pachuca',
  'Cuautla, Morelos',
  'Nuevo Laredo',
  'Otra ciudad en México',
];

export default function PromotionsPopup() {
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Form fields
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [correo, setCorreo] = useState('');
  const [ciudad, setCiudad] = useState('');

  // Validation errors
  const [errors, setErrors] = useState({});

  // Trigger popup after 4 seconds if not dismissed previously
  useEffect(() => {
    const wasDismissed = sessionStorage.getItem('jasman-10-popup-dismissed');
    if (!wasDismissed) {
      const timer = setTimeout(() => {
        setOpen(true);
      }, 4000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, []);

  const handleClose = () => {
    setOpen(false);
    sessionStorage.setItem('jasman-10-popup-dismissed', '1');
  };

  const handleOpen = () => {
    setOpen(true);
  };

  // Validation rules
  const validate = () => {
    const errs = {};

    const trimmedName = nombre.trim();
    if (!trimmedName) {
      errs.nombre = 'Por favor ingresa tu nombre completo.';
    } else if (trimmedName.length < 3) {
      errs.nombre = 'El nombre debe tener al menos 3 caracteres.';
    } else if (/\d/.test(trimmedName)) {
      errs.nombre = 'El nombre no puede contener números.';
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/.test(trimmedName)) {
      errs.nombre = 'El nombre contiene símbolos no permitidos.';
    } else if (/([a-zA-Z])\1{3,}/.test(trimmedName)) {
      errs.nombre = 'Por favor ingresa un nombre real y válido.';
    } else if (trimmedName.split(/\s+/).length < 2) {
      errs.nombre = 'Por favor ingresa tu nombre y apellido.';
    }

    const cleanPhone = telefono.replace(/\D/g, '');
    if (!cleanPhone) {
      errs.telefono = 'Por favor ingresa tu teléfono a 10 dígitos.';
    } else if (cleanPhone.length !== 10) {
      errs.telefono = 'El teléfono debe ser exactamente de 10 dígitos.';
    } else if (/^(\d)\1{9}$/.test(cleanPhone)) {
      errs.telefono = 'Ingresa un número telefónico real.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!correo.trim()) {
      errs.correo = 'Por favor ingresa tu correo electrónico.';
    } else if (!emailRegex.test(correo.trim())) {
      errs.correo = 'Ingresa un correo electrónico válido.';
    }

    if (!ciudad) {
      errs.ciudad = 'Selecciona tu ciudad o estado.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    saveContactoWeb({
      nombre: nombre.trim(),
      telefono: telefono.replace(/\D/g, ''),
      email: correo.trim(),
      ciudad,
      cupon: 'Pendiente de envío por correo (10% Primer Servicio)',
      asunto: 'Solicitud de Cupón 10% Primer Servicio Automotriz',
      mensaje:
        'Cliente registrado para recibir su cupón del 10% de descuento por correo electrónico.',
      origen: 'Popup Descuento 10% Servicio Automotriz',
    }).catch((err) => console.warn('Wix save error in popup:', err));

    try {
      const existingLeads = JSON.parse(localStorage.getItem('jasman_10_leads') || '[]');
      existingLeads.push({
        nombre: nombre.trim(),
        telefono: telefono.replace(/\D/g, ''),
        correo: correo.trim(),
        ciudad,
        status: 'envio_por_correo',
        date: new Date().toISOString(),
      });
      localStorage.setItem('jasman_10_leads', JSON.stringify(existingLeads));
    } catch {
      // ignore
    }

    setSubmitted(true);
  };

  const cleanPhone = telefono.replace(/\D/g, '');
  const waText = [
    'SW - ¡Hola Jasman! Acabo de registrarme en el sitio web para recibir por correo mi cupón de 10% de descuento en mi primer servicio.',
    `Nombre: ${nombre.trim()}`,
    `Ciudad: ${ciudad}`,
    `Tel: ${cleanPhone}`,
    `Correo: ${correo.trim()}`,
    'Me gustaría recibir asesoría para agendar mi visita.',
  ].join('\n');
  const whatsappUrl = `https://api.whatsapp.com/send/?phone=5215510024945&text=${encodeURIComponent(
    waText
  )}`;

  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth <= 640;

  // Minimized floating trigger button stacked cleanly at bottom-right above WhatsApp
  if (!open) {
    return (
      <button
        type="button"
        onClick={handleOpen}
        aria-label="Abrir beneficio de 10% de descuento"
        style={{
          position: 'fixed',
          bottom: isMobile ? 64 : 78,
          right: isMobile ? 14 : 20,
          zIndex: 999,
          padding: isMobile ? '8px 14px' : '11px 18px',
          borderRadius: 9999,
          background: `linear-gradient(135deg, ${C.red}, #E52E35)`,
          color: C.white,
          border: '2px solid rgba(255,255,255,0.25)',
          cursor: 'pointer',
          fontFamily: F.heading,
          fontWeight: 800,
          fontSize: isMobile ? 12 : 12.5,
          display: 'flex',
          alignItems: 'center',
          gap: isMobile ? 6 : 8,
          boxShadow: '0 8px 30px rgba(196,30,36,0.45), 0 2px 10px rgba(0,0,0,0.15)',
          transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
          animation: 'pulseGlow 2.5s infinite',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-3px) scale(1.03)';
          e.currentTarget.style.boxShadow = '0 12px 35px rgba(196,30,36,0.6)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0) scale(1)';
          e.currentTarget.style.boxShadow = '0 8px 30px rgba(196,30,36,0.45)';
        }}
      >
        <span
          style={{
            width: isMobile ? 18 : 22,
            height: isMobile ? 18 : 22,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: isMobile ? 11 : 12,
          }}
        >
          🎁
        </span>
        <span>{isMobile ? '10% OFF*' : '¡10% OFF en tu Servicio!*'}</span>
      </button>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: 'rgba(10, 14, 26, 0.72)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'heroFadeIn 0.25s ease-out',
        boxSizing: 'border-box',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 460,
          maxHeight: '92vh',
          overflowY: 'auto',
          borderRadius: 26,
          background: 'linear-gradient(180deg, #FFFFFF 0%, #FAFAFC 100%)',
          border: '1px solid rgba(196,30,36,0.2)',
          boxShadow: '0 25px 70px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.9)',
          boxSizing: 'border-box',
          animation: 'promoSlideUp 0.35s cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        {/* Header Ribbon / Banner */}
        <div
          style={{
            background: `linear-gradient(135deg, ${C.navy} 0%, #0F1322 100%)`,
            padding: '24px 22px 20px',
            position: 'relative',
            color: C.white,
            borderTopLeftRadius: 25,
            borderTopRightRadius: 25,
            borderBottom: '3px solid #C41E24',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <button
            type="button"
            onClick={handleClose}
            aria-label="Cerrar ventana"
            style={{
              position: 'absolute',
              top: 14,
              right: 14,
              width: 34,
              height: 34,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.12)',
              border: 'none',
              color: C.white,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(196,30,36,0.8)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.12)';
            }}
          >
            <X size={18} />
          </button>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 12px',
              borderRadius: 9999,
              background: 'rgba(196,30,36,0.2)',
              border: '1px solid rgba(196,30,36,0.4)',
              color: '#FF6B6B',
              fontFamily: F.heading,
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              marginBottom: 10,
            }}
          >
            <Sparkles size={13} /> BENEFICIO EXCLUSIVO WEB
          </div>

          <h3
            style={{
              fontFamily: F.heading,
              fontWeight: 900,
              fontSize: 'clamp(1.4rem, 4.5vw, 1.85rem)',
              lineHeight: 1.15,
              color: C.white,
              margin: 0,
              textAlign: 'center',
            }}
          >
            ¡Obtén <span style={{ color: '#FF4D4F' }}>10% de Descuento*</span>!
          </h3>

          <p
            style={{
              fontSize: 13,
              color: 'rgba(255,255,255,0.8)',
              marginTop: 8,
              lineHeight: 1.45,
              marginBottom: 0,
              textAlign: 'center',
            }}
          >
            Déjanos tus datos y <strong>te llegará por correo electrónico</strong> tu cupón válido en tu primer servicio automotriz en nuestras sucursales.
          </p>
        </div>

        {/* Content Body */}
        <div style={{ padding: '22px 22px 20px' }}>
          {!submitted ? (
            <form
              onSubmit={handleSubmit}
              style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
            >
              <div>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontFamily: F.heading,
                    fontWeight: 700,
                    fontSize: 12,
                    color: C.navy,
                    marginBottom: 5,
                  }}
                >
                  <User size={13} color={C.red} /> Nombre y Apellido:
                </label>
                <input
                  type="text"
                  placeholder="Ej. Juan Pérez"
                  value={nombre}
                  onChange={(e) => {
                    setNombre(e.target.value);
                    if (errors.nombre) setErrors((prev) => ({ ...prev, nombre: null }));
                  }}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: 12,
                    border: `1.5px solid ${errors.nombre ? '#DC2626' : '#E2E8F0'}`,
                    background: errors.nombre ? '#FEF2F2' : '#FFFFFF',
                    fontFamily: F.body,
                    fontSize: 16,
                    color: C.navy,
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s',
                  }}
                />
                {errors.nombre && (
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      color: '#DC2626',
                      fontSize: 11,
                      marginTop: 4,
                      fontWeight: 600,
                    }}
                  >
                    <AlertCircle size={12} /> {errors.nombre}
                  </span>
                )}
              </div>

              <div>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontFamily: F.heading,
                    fontWeight: 700,
                    fontSize: 12,
                    color: C.navy,
                    marginBottom: 5,
                  }}
                >
                  <Phone size={13} color={C.red} /> Teléfono (WhatsApp a 10 dígitos):
                </label>
                <input
                  type="tel"
                  placeholder="Ej. 5512345678"
                  maxLength={10}
                  value={telefono}
                  onChange={(e) => {
                    setTelefono(e.target.value.replace(/\D/g, ''));
                    if (errors.telefono) setErrors((prev) => ({ ...prev, telefono: null }));
                  }}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: 12,
                    border: `1.5px solid ${errors.telefono ? '#DC2626' : '#E2E8F0'}`,
                    background: errors.telefono ? '#FEF2F2' : '#FFFFFF',
                    fontFamily: F.body,
                    fontSize: 16,
                    color: C.navy,
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s',
                  }}
                />
                {errors.telefono && (
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      color: '#DC2626',
                      fontSize: 11,
                      marginTop: 4,
                      fontWeight: 600,
                    }}
                  >
                    <AlertCircle size={12} /> {errors.telefono}
                  </span>
                )}
              </div>

              <div>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontFamily: F.heading,
                    fontWeight: 700,
                    fontSize: 12,
                    color: C.navy,
                    marginBottom: 5,
                  }}
                >
                  <Mail size={13} color={C.red} /> Correo Electrónico:
                </label>
                <input
                  type="email"
                  placeholder="tu.correo@ejemplo.com"
                  value={correo}
                  onChange={(e) => {
                    setCorreo(e.target.value);
                    if (errors.correo) setErrors((prev) => ({ ...prev, correo: null }));
                  }}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: 12,
                    border: `1.5px solid ${errors.correo ? '#DC2626' : '#E2E8F0'}`,
                    background: errors.correo ? '#FEF2F2' : '#FFFFFF',
                    fontFamily: F.body,
                    fontSize: 16,
                    color: C.navy,
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s',
                  }}
                />
                {errors.correo && (
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      color: '#DC2626',
                      fontSize: 11,
                      marginTop: 4,
                      fontWeight: 600,
                    }}
                  >
                    <AlertCircle size={12} /> {errors.correo}
                  </span>
                )}
              </div>

              <div>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontFamily: F.heading,
                    fontWeight: 700,
                    fontSize: 12,
                    color: C.navy,
                    marginBottom: 5,
                  }}
                >
                  <MapPin size={13} color={C.red} /> Ciudad o Estado:
                </label>
                <select
                  value={ciudad}
                  onChange={(e) => {
                    setCiudad(e.target.value);
                    if (errors.ciudad) setErrors((prev) => ({ ...prev, ciudad: null }));
                  }}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: 12,
                    border: `1.5px solid ${errors.ciudad ? '#DC2626' : '#E2E8F0'}`,
                    background: errors.ciudad ? '#FEF2F2' : '#FFFFFF',
                    fontFamily: F.body,
                    fontSize: 16,
                    color: ciudad ? C.navy : '#94A3B8',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s',
                    cursor: 'pointer',
                  }}
                >
                  <option value="">Selecciona tu ciudad...</option>
                  {CITIES.map((c, i) => (
                    <option key={i} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                {errors.ciudad && (
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      color: '#DC2626',
                      fontSize: 11,
                      marginTop: 4,
                      fontWeight: 600,
                    }}
                  >
                    <AlertCircle size={12} /> {errors.ciudad}
                  </span>
                )}
              </div>

              <button
                type="submit"
                style={{
                  marginTop: 6,
                  width: '100%',
                  padding: '14px 20px',
                  borderRadius: 14,
                  border: 'none',
                  background: `linear-gradient(135deg, ${C.red} 0%, #D4262C 100%)`,
                  color: C.white,
                  fontFamily: F.heading,
                  fontWeight: 800,
                  fontSize: 15,
                  cursor: 'pointer',
                  boxShadow: '0 8px 24px rgba(196,30,36,0.35)',
                  transition: 'all 0.25s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <Tag size={17} /> Recibir Mi Cupón por Correo
              </button>

              <div
                style={{
                  marginTop: 4,
                  padding: '10px 12px',
                  borderRadius: 10,
                  background: '#F1F5F9',
                  border: '1px solid #E2E8F0',
                  fontSize: 10.5,
                  lineHeight: 1.45,
                  color: '#64748B',
                  fontFamily: F.body,
                }}
              >
                <strong style={{ color: '#334155' }}>*Aviso: </strong>
                Descuento válido para clientes nuevos y solo para el primer servicio, no acumulable. Tu cupón te llegará directamente a tu correo electrónico registrado.
              </div>
            </form>
          ) : (
            /* Success confirmation without coupon code ("Te llegará por correo") */
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
              <div
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  background: '#DCFCE7',
                  border: '2px solid #22C55E',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  color: '#16A34A',
                }}
              >
                <Check size={32} strokeWidth={3} />
              </div>

              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  color: '#16A34A',
                  fontFamily: F.heading,
                  fontWeight: 700,
                  fontSize: 12,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                <ShieldCheck size={14} /> ¡Solicitud Registrada con Éxito!
              </span>

              <h4
                style={{
                  fontFamily: F.heading,
                  fontWeight: 900,
                  fontSize: 22,
                  color: C.navy,
                  marginTop: 6,
                  marginBottom: 8,
                }}
              >
                ¡Te llegará por correo, {nombre.trim().split(/\s+/)[0]}!
              </h4>

              <p
                style={{
                  fontSize: 13.5,
                  color: '#475569',
                  margin: '0 auto 18px',
                  maxWidth: 370,
                  lineHeight: 1.55,
                }}
              >
                Registramos tu solicitud del <strong>10% de descuento*</strong> para tu primer servicio automotriz.{' '}
                <strong>Te enviaremos tu cupón directamente a tu correo electrónico.</strong>
              </p>

              {/* Email Delivery Box */}
              <div
                style={{
                  padding: '15px 18px',
                  borderRadius: 16,
                  background: '#F8FAFC',
                  border: '1.5px solid #E2E8F0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  marginBottom: 16,
                  textAlign: 'left',
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    background: 'rgba(196, 30, 36, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Mail size={19} color={C.red} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 10.5,
                      fontFamily: F.heading,
                      fontWeight: 700,
                      color: '#64748B',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                    }}
                  >
                    Lo recibirás en tu correo
                  </div>
                  <div
                    style={{
                      fontFamily: F.heading,
                      fontWeight: 800,
                      fontSize: 14,
                      color: C.navy,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {correo.trim()}
                  </div>
                </div>
              </div>

              {/* WhatsApp CTA */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  width: '100%',
                  padding: '14px 20px',
                  borderRadius: 14,
                  background: '#25D366',
                  color: C.white,
                  fontFamily: F.heading,
                  fontWeight: 800,
                  fontSize: 14.5,
                  textDecoration: 'none',
                  boxShadow: '0 8px 24px rgba(37,211,102,0.3)',
                  marginBottom: 12,
                  boxSizing: 'border-box',
                }}
              >
                <span>Agendar Visita por WhatsApp</span>
                <ExternalLink size={16} />
              </a>

              <button
                type="button"
                onClick={handleClose}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748B',
                  fontSize: 12,
                  fontFamily: F.heading,
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: '6px 12px',
                }}
              >
                Continuar navegando en el sitio
              </button>

              <div
                style={{
                  marginTop: 14,
                  fontSize: 10,
                  color: '#94A3B8',
                  lineHeight: 1.4,
                  borderTop: '1px solid #E2E8F0',
                  paddingTop: 10,
                }}
              >
                *Descuento válido para clientes nuevos y solo para el primer servicio, no acumulable.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
