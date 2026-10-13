import { useState, useEffect } from 'react';
import { C, F } from '../hooks/useAnimations';
import { saveContactoWeb } from '../services/wixService';
import { X, Tag, Check, Sparkles, AlertCircle, Phone, User, Mail, MapPin, Copy, ExternalLink, ShieldCheck } from 'lucide-react';

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
  const [couponCode, setCouponCode] = useState('');
  const [copied, setCopied] = useState(false);

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
  }, []);

  const handleClose = () => {
    setOpen(false);
    sessionStorage.setItem('jasman-10-popup-dismissed', '1');
  };

  const handleOpen = () => {
    setOpen(true);
  };

  // Validation function with strict rules as requested:
  // "Aplica restricciones de nombres raros, o numeros en nombres y todas esas cosas."
  const validate = () => {
    const errs = {};

    // 1. Nombre validation:
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
      // e.g. "aaaaa" or "zzzzz"
      errs.nombre = 'Por favor ingresa un nombre real y válido.';
    } else if (trimmedName.split(/\s+/).length < 2) {
      // Require at least first name and last name
      errs.nombre = 'Por favor ingresa tu nombre y apellido.';
    }

    // 2. Teléfono validation: 10 digits
    const cleanPhone = telefono.replace(/\D/g, '');
    if (!cleanPhone) {
      errs.telefono = 'Por favor ingresa tu teléfono a 10 dígitos.';
    } else if (cleanPhone.length !== 10) {
      errs.telefono = 'El teléfono debe ser exactamente de 10 dígitos.';
    } else if (/^(\d)\1{9}$/.test(cleanPhone)) {
      // e.g. "0000000000" or "1111111111"
      errs.telefono = 'Ingresa un número telefónico real.';
    }

    // 3. Correo validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!correo.trim()) {
      errs.correo = 'Por favor ingresa tu correo electrónico.';
    } else if (!emailRegex.test(correo.trim())) {
      errs.correo = 'Ingresa un correo electrónico válido.';
    }

    // 4. Ciudad validation
    if (!ciudad) {
      errs.ciudad = 'Selecciona tu ciudad o estado.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    // Generate unique coupon code
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const code = `JASMAN10-${randomSuffix}`;
    setCouponCode(code);

    // Save lead to Wix CMS Contactoweb and localStorage
    saveContactoWeb({
      nombre: nombre.trim(),
      telefono: telefono.replace(/\D/g, ''),
      email: correo.trim(),
      ciudad,
      cupon: code,
      asunto: `Cupón 10% Descuento: ${code}`,
      origen: 'Popup Descuento 10%',
    }).catch(err => console.warn('Wix save error in popup:', err));

    try {
      const existingLeads = JSON.parse(localStorage.getItem('jasman_10_leads') || '[]');
      existingLeads.push({
        nombre: nombre.trim(),
        telefono: telefono.replace(/\D/g, ''),
        correo: correo.trim(),
        ciudad,
        couponCode: code,
        date: new Date().toISOString(),
      });
      localStorage.setItem('jasman_10_leads', JSON.stringify(existingLeads));
    } catch {
      // ignore
    }

    setSubmitted(true);
  };

  const copyCoupon = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(couponCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // WhatsApp redemption link
  const cleanPhone = telefono.replace(/\D/g, '');
  const waMessage = `¡Hola Jasman! Acabo de registrarme para obtener mi 10% de descuento en mi primer servicio.%0A%0A*Código de Cupón:* ${couponCode}%0A*Nombre:* ${encodeURIComponent(nombre.trim())}%0A*Ciudad:* ${encodeURIComponent(ciudad)}%0A*Tel:* ${cleanPhone}%0A%0AMe gustaría agendar mi visita en su sucursal más cercana.`;
  const whatsappUrl = `https://wa.me/525543317799?text=${waMessage}`;

  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 640;

  // Minimized floating trigger button (visible when popup is closed)
  if (!open) {
    return (
      <button
        onClick={handleOpen}
        aria-label="Abrir cupón de 10% de descuento"
        style={{
          position: 'fixed',
          bottom: isMobile ? 14 : 20,
          right: isMobile ? 14 : 20,
          zIndex: 999,
          padding: isMobile ? '8px 14px' : '12px 20px',
          borderRadius: 9999,
          background: `linear-gradient(135deg, ${C.red}, #E52E35)`,
          color: C.white,
          border: '2px solid rgba(255,255,255,0.25)',
          cursor: 'pointer',
          fontFamily: F.heading,
          fontWeight: 800,
          fontSize: isMobile ? 12 : 13,
          display: 'flex',
          alignItems: 'center',
          gap: isMobile ? 6 : 9,
          boxShadow: '0 8px 30px rgba(196,30,36,0.45), 0 2px 10px rgba(0,0,0,0.15)',
          transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
          animation: 'pulseGlow 2.5s infinite',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'translateY(-3px) scale(1.03)';
          e.currentTarget.style.boxShadow = '0 12px 35px rgba(196,30,36,0.6)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'translateY(0) scale(1)';
          e.currentTarget.style.boxShadow = '0 8px 30px rgba(196,30,36,0.45)';
        }}
      >
        <span style={{
          width: isMobile ? 18 : 22,
          height: isMobile ? 18 : 22,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: isMobile ? 11 : 12,
        }}>
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
        <div style={{
          background: `linear-gradient(135deg, ${C.navy} 0%, #0F1322 100%)`,
          padding: '24px 22px 20px',
          position: 'relative',
          color: C.white,
          borderTopLeftRadius: 25,
          borderTopRightRadius: 25,
          borderBottom: '3px solid #C41E24',
        }}>
          {/* Close button */}
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
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(196,30,36,0.8)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
          >
            <X size={18} />
          </button>

          {/* Badge */}
          <div style={{
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
          }}>
            <Sparkles size={13} /> BENEFICIO EXCLUSIVO WEB
          </div>

          <h3 style={{
            fontFamily: F.heading,
            fontWeight: 900,
            fontSize: 'clamp(1.4rem, 4.5vw, 1.85rem)',
            lineHeight: 1.15,
            color: C.white,
            margin: 0,
          }}>
            ¡Obtén <span style={{ color: '#FF4D4F' }}>10% de Descuento*</span>!
          </h3>

          <p style={{
            fontSize: 13,
            color: 'rgba(255,255,255,0.8)',
            marginTop: 6,
            lineHeight: 1.45,
            marginBottom: 0,
          }}>
            Déjanos tus datos para generar tu cupón digital válido en tu primer servicio automotriz en cualquiera de nuestras sucursales.
          </p>
        </div>

        {/* Content Body */}
        <div style={{ padding: '22px 22px 20px' }}>
          {!submitted ? (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Field 1: Nombre */}
              <div>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontFamily: F.heading,
                  fontWeight: 700,
                  fontSize: 12,
                  color: C.navy,
                  marginBottom: 5,
                }}>
                  <User size={13} color={C.red} /> Nombre y Apellido:
                </label>
                <input
                  type="text"
                  placeholder="Ej. Juan Pérez"
                  value={nombre}
                  onChange={(e) => {
                    setNombre(e.target.value);
                    if (errors.nombre) setErrors(prev => ({ ...prev, nombre: null }));
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
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#DC2626', fontSize: 11, marginTop: 4, fontWeight: 600 }}>
                    <AlertCircle size={12} /> {errors.nombre}
                  </span>
                )}
              </div>

              {/* Field 2: Teléfono */}
              <div>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontFamily: F.heading,
                  fontWeight: 700,
                  fontSize: 12,
                  color: C.navy,
                  marginBottom: 5,
                }}>
                  <Phone size={13} color={C.red} /> Teléfono (WhatsApp a 10 dígitos):
                </label>
                <input
                  type="tel"
                  placeholder="Ej. 5512345678"
                  maxLength={10}
                  value={telefono}
                  onChange={(e) => {
                    setTelefono(e.target.value.replace(/\D/g, ''));
                    if (errors.telefono) setErrors(prev => ({ ...prev, telefono: null }));
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
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#DC2626', fontSize: 11, marginTop: 4, fontWeight: 600 }}>
                    <AlertCircle size={12} /> {errors.telefono}
                  </span>
                )}
              </div>

              {/* Field 3: Correo */}
              <div>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontFamily: F.heading,
                  fontWeight: 700,
                  fontSize: 12,
                  color: C.navy,
                  marginBottom: 5,
                }}>
                  <Mail size={13} color={C.red} /> Correo Electrónico:
                </label>
                <input
                  type="email"
                  placeholder="tu.correo@ejemplo.com"
                  value={correo}
                  onChange={(e) => {
                    setCorreo(e.target.value);
                    if (errors.correo) setErrors(prev => ({ ...prev, correo: null }));
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
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#DC2626', fontSize: 11, marginTop: 4, fontWeight: 600 }}>
                    <AlertCircle size={12} /> {errors.correo}
                  </span>
                )}
              </div>

              {/* Field 4: Ciudad */}
              <div>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontFamily: F.heading,
                  fontWeight: 700,
                  fontSize: 12,
                  color: C.navy,
                  marginBottom: 5,
                }}>
                  <MapPin size={13} color={C.red} /> Ciudad o Estado:
                </label>
                <select
                  value={ciudad}
                  onChange={(e) => {
                    setCiudad(e.target.value);
                    if (errors.ciudad) setErrors(prev => ({ ...prev, ciudad: null }));
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
                    <option key={i} value={c}>{c}</option>
                  ))}
                </select>
                {errors.ciudad && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#DC2626', fontSize: 11, marginTop: 4, fontWeight: 600 }}>
                    <AlertCircle size={12} /> {errors.ciudad}
                  </span>
                )}
              </div>

              {/* Submit Button */}
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
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <Tag size={17} /> Obtener Mi Cupón del 10%
              </button>

              {/* Mandatory Disclaimer as requested by user */}
              <div style={{
                marginTop: 4,
                padding: '10px 12px',
                borderRadius: 10,
                background: '#F1F5F9',
                border: '1px solid #E2E8F0',
                fontSize: 10.5,
                lineHeight: 1.45,
                color: '#64748B',
                fontFamily: F.body,
              }}>
                <strong style={{ color: '#334155' }}>*Aviso: </strong>
                Descuento válido para clientes nuevos y solo para el primer servicio, no acumulable. Aplica restricciones de nombres raros, o numeros en nombres y todas esas cosas.
              </div>
            </form>
          ) : (
            /* Success confirmation */
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
              <div style={{
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
              }}>
                <Check size={32} strokeWidth={3} />
              </div>

              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                color: '#16A34A',
                fontFamily: F.heading,
                fontWeight: 700,
                fontSize: 12,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>
                <ShieldCheck size={14} /> ¡Cupón Generado con Éxito!
              </span>

              <h4 style={{
                fontFamily: F.heading,
                fontWeight: 900,
                fontSize: 22,
                color: C.navy,
                marginTop: 6,
                marginBottom: 6,
              }}>
                ¡Felicidades, {nombre.split(' ')[0]}!
              </h4>

              <p style={{ fontSize: 13, color: '#475569', margin: '0 auto 18px', maxWidth: 360, lineHeight: 1.5 }}>
                Tu <strong>10% de descuento*</strong> está activo. Presenta este código al llegar a tu sucursal Jasman o envíalo por WhatsApp para agendar tu cita:
              </p>

              {/* Coupon Box */}
              <div style={{
                padding: '16px 20px',
                borderRadius: 16,
                background: '#FFF1F2',
                border: '2px dashed #C41E24',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 16,
              }}>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#991B1B', textTransform: 'uppercase' }}>
                    Tu Código de Descuento
                  </div>
                  <div style={{
                    fontFamily: F.heading,
                    fontWeight: 900,
                    fontSize: 22,
                    color: C.red,
                    letterSpacing: '0.08em',
                  }}>
                    {couponCode}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={copyCoupon}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 10,
                    background: copied ? '#16A34A' : C.white,
                    color: copied ? C.white : C.navy,
                    border: '1px solid #CBD5E1',
                    fontFamily: F.heading,
                    fontWeight: 700,
                    fontSize: 12,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    transition: 'all 0.2s',
                  }}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? '¡Copiado!' : 'Copiar'}
                </button>
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
                  fontSize: 15,
                  textDecoration: 'none',
                  boxShadow: '0 8px 24px rgba(37,211,102,0.3)',
                  marginBottom: 12,
                  boxSizing: 'border-box',
                }}
              >
                <span>Agendar por WhatsApp con Mi 10%</span>
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

              {/* Disclaimer */}
              <div style={{
                marginTop: 14,
                fontSize: 10,
                color: '#94A3B8',
                lineHeight: 1.4,
                borderTop: '1px solid #E2E8F0',
                paddingTop: 10,
              }}>
                *Descuento válido para clientes nuevos y solo para el primer servicio, no acumulable. Aplica restricciones de nombres raros, o numeros en nombres y todas esas cosas.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
