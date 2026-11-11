import { useState, useEffect } from 'react';
import { C, F } from '../../hooks/useAnimations';
import { saveContactoWeb } from '../../services/wixService';
import { useTiendaState } from '../../hooks/useTiendaState';
import { X, Tag, Check, Copy, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';

export default function FirstPurchasePopup({ autoOpen = true }) {
  const { coupon, applyFirstPurchaseCoupon, user, saveUser } = useTiendaState();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const [nombre, setNombre] = useState(user?.nombre || '');
  const [telefono, setTelefono] = useState(user?.telefono || '');
  const [correo, setCorreo] = useState(user?.correo || '');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!autoOpen) return undefined;
    const dismissed = sessionStorage.getItem('jasman_tienda_popup_dismissed');
    if (!dismissed && !coupon) {
      const timer = setTimeout(() => setOpen(true), 2600);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [coupon, autoOpen]);

  useEffect(() => {
    const handleUI = (e) => {
      if (e.detail?.type === 'OPEN_COUPON') {
        setOpen(true);
      }
    };
    window.addEventListener('jasman-tienda-ui', handleUI);
    return () => window.removeEventListener('jasman-tienda-ui', handleUI);
  }, []);

  const handleClose = () => {
    setOpen(false);
    sessionStorage.setItem('jasman_tienda_popup_dismissed', '1');
  };

  const validate = () => {
    const nextErrs = {};
    const cleanName = nombre.trim();
    if (!cleanName || cleanName.length < 3) {
      nextErrs.nombre = 'Ingresa tu nombre y apellido.';
    } else if (/\d/.test(cleanName)) {
      nextErrs.nombre = 'El nombre no debe incluir números.';
    }

    const cleanPhone = telefono.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      nextErrs.telefono = 'Ingresa un número de 10 dígitos.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(correo.trim())) {
      nextErrs.correo = 'Ingresa un correo válido.';
    }

    setErrors(nextErrs);
    return Object.keys(nextErrs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const suffix = Math.floor(1000 + Math.random() * 9000);
    const code = `JASMAN10-${suffix}`;
    const cleanPhone = telefono.replace(/\D/g, '');

    const couponPayload = {
      code,
      nombre: nombre.trim(),
      telefono: cleanPhone,
      correo: correo.trim(),
      discountRate: 0.1,
      createdAt: new Date().toISOString(),
    };

    applyFirstPurchaseCoupon(couponPayload);

    if (!user) {
      saveUser({
        nombre: nombre.trim(),
        telefono: cleanPhone,
        correo: correo.trim(),
        createdAt: new Date().toISOString(),
      });
    }

    saveContactoWeb({
      nombre: nombre.trim(),
      telefono: cleanPhone,
      email: correo.trim(),
      cupon: code,
      asunto: `Cupón 10% Primera Compra Tienda: ${code}`,
      origen: 'Popup 10% Primera Compra (/landing-tienda-preview)',
    }).catch(() => {});
  };

  const copyCode = () => {
    if (!coupon?.code || !navigator.clipboard) return;
    navigator.clipboard.writeText(coupon.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  if (!open) {
    return (
      <>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="10% de descuento en tu primera compra"
          className="jasman-coupon-float-btn"
          style={{
            position: 'fixed',
            bottom: 24,
            left: 24,
            zIndex: 990,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            padding: '12px 18px',
            borderRadius: 9999,
            background: C.navy,
            color: C.white,
            border: '1px solid rgba(255,255,255,0.14)',
            boxShadow: '0 16px 40px rgba(26,31,54,0.28)',
            cursor: 'pointer',
            fontFamily: F.heading,
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px)';
            e.currentTarget.style.background = C.red;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.background = C.navy;
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: coupon ? '#22C55E' : C.red,
              boxShadow: coupon ? '0 0 10px #22C55E' : `0 0 10px ${C.red}`,
              flexShrink: 0,
            }}
          />
          <span className="jasman-coupon-full-txt">
            {coupon ? `Cupón activo: ${coupon.code}` : '−10% Primera Compra'}
          </span>
          <span className="jasman-coupon-short-txt" style={{ display: 'none' }}>
            {coupon ? '10% Activo' : '−10% Cupón'}
          </span>
        </button>
        <style>{`
          @media (max-width: 640px) {
            .jasman-coupon-float-btn {
              bottom: 14px !important;
              left: 12px !important;
              height: 44px !important;
              padding: 0 14px !important;
              gap: 7px !important;
              font-size: 10.5px !important;
              letter-spacing: 0.06em !important;
            }
            .jasman-coupon-full-txt {
              display: none !important;
            }
            .jasman-coupon-short-txt {
              display: inline !important;
            }
          }
        `}</style>
      </>
    );
  }

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(13, 16, 28, 0.68)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        animation: 'heroFadeIn 0.25s ease-out',
      }}
    >
      <div
        className="jasman-coupon-modal-card"
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 820,
          maxHeight: '90vh',
          overflowY: 'auto',
          borderRadius: 24,
          background: C.white,
          boxShadow: '0 40px 100px rgba(0,0,0,0.45)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          border: '1px solid rgba(26,31,54,0.08)',
        }}
      >
        {/* Left editorial visual column */}
        <div
          className="jasman-coupon-modal-left"
          style={{
            background: `linear-gradient(155deg, ${C.navy} 0%, #0E1220 100%)`,
            color: C.white,
            padding: '44px 36px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              right: -70,
              bottom: -70,
              width: 260,
              height: 260,
              borderRadius: '50%',
              border: '1px solid rgba(255,255,255,0.07)',
              pointerEvents: 'none',
            }}
          />
          <div
            style={{
              position: 'absolute',
              right: -30,
              bottom: -30,
              width: 180,
              height: 180,
              borderRadius: '50%',
              border: '1px dashed rgba(196,30,36,0.35)',
              pointerEvents: 'none',
            }}
          />

          <div>
            <img
              src="/images/logo/logo-03.png"
              alt="Jasman Automotriz"
              style={{ height: 30, width: 'auto', marginBottom: 28, opacity: 0.95 }}
            />

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '5px 12px',
                borderRadius: 9999,
                background: 'rgba(196,30,36,0.2)',
                border: '1px solid rgba(196,30,36,0.45)',
                color: '#FF6B70',
                fontFamily: F.heading,
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                marginBottom: 16,
              }}
            >
              <Sparkles size={12} /> Beneficio Tienda Online
            </div>

            <div
              style={{
                fontFamily: F.heading,
                fontSize: 'clamp(2.75rem, 5vw, 3.75rem)',
                fontWeight: 900,
                lineHeight: 0.95,
                letterSpacing: '-0.03em',
                color: C.white,
                marginBottom: 12,
              }}
            >
              10% OFF
            </div>

            <h3
              style={{
                fontFamily: F.heading,
                fontSize: 20,
                fontWeight: 700,
                color: 'rgba(255,255,255,0.94)',
                margin: '0 0 12px',
                lineHeight: 1.3,
              }}
            >
              En tu primera compra de llantas
            </h3>

            <p
              style={{
                fontFamily: F.body,
                fontSize: 13.5,
                color: 'rgba(255,255,255,0.68)',
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              Activa tu código personal y aplícalo directamente en tu carrito para llantas de automóvil, camioneta o paquetes.
            </p>
          </div>

          <div
            style={{
              marginTop: 32,
              paddingTop: 20,
              borderTop: '1px solid rgba(255,255,255,0.1)',
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              fontSize: 11,
              color: 'rgba(255,255,255,0.55)',
              fontFamily: F.body,
            }}
          >
            <span>Catálogo oficial Jasman</span>
            <span>•</span>
            <span>Aplicación inmediata</span>
          </div>
        </div>

        {/* Right form / coupon activation column */}
        <div
          className="jasman-coupon-modal-right"
          style={{ padding: '40px 36px', position: 'relative', background: C.white }}
        >
          <button
            type="button"
            onClick={handleClose}
            aria-label="Cerrar"
            className="jasman-coupon-close-btn"
            style={{
              position: 'absolute',
              top: 18,
              right: 18,
              width: 36,
              height: 36,
              borderRadius: '50%',
              border: `1px solid ${C.border}`,
              background: C.white,
              color: C.navy,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <X size={16} />
          </button>

          {!coupon ? (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <span
                  style={{
                    fontFamily: F.heading,
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    color: C.red,
                    display: 'block',
                    marginBottom: 6,
                  }}
                >
                  Registro rápido
                </span>
                <h4
                  style={{
                    fontFamily: F.heading,
                    fontSize: 22,
                    fontWeight: 800,
                    color: C.navy,
                    margin: 0,
                    letterSpacing: '-0.02em',
                  }}
                >
                  Desbloquea tu 10% ahora
                </h4>
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontFamily: F.heading,
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: C.gray,
                    marginBottom: 6,
                  }}
                >
                  Nombre completo
                </label>
                <input
                  type="text"
                  placeholder="Ej. Alejandro Morales"
                  value={nombre}
                  onChange={(e) => {
                    setNombre(e.target.value);
                    if (errors.nombre) setErrors((p) => ({ ...p, nombre: null }));
                  }}
                  style={{
                    width: '100%',
                    padding: '13px 14px',
                    borderRadius: 10,
                    border: `1px solid ${errors.nombre ? C.red : C.border}`,
                    fontFamily: F.body,
                    fontSize: 14,
                    color: C.navy,
                    outline: 'none',
                    background: '#FAFAFC',
                  }}
                />
                {errors.nombre && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: C.red, marginTop: 4 }}>
                    <AlertCircle size={12} /> {errors.nombre}
                  </span>
                )}
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontFamily: F.heading,
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: C.gray,
                    marginBottom: 6,
                  }}
                >
                  Teléfono (10 dígitos)
                </label>
                <input
                  type="tel"
                  maxLength={10}
                  placeholder="55 1234 5678"
                  value={telefono}
                  onChange={(e) => {
                    setTelefono(e.target.value.replace(/\D/g, ''));
                    if (errors.telefono) setErrors((p) => ({ ...p, telefono: null }));
                  }}
                  style={{
                    width: '100%',
                    padding: '13px 14px',
                    borderRadius: 10,
                    border: `1px solid ${errors.telefono ? C.red : C.border}`,
                    fontFamily: F.body,
                    fontSize: 14,
                    color: C.navy,
                    outline: 'none',
                    background: '#FAFAFC',
                  }}
                />
                {errors.telefono && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: C.red, marginTop: 4 }}>
                    <AlertCircle size={12} /> {errors.telefono}
                  </span>
                )}
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontFamily: F.heading,
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: C.gray,
                    marginBottom: 6,
                  }}
                >
                  Correo electrónico
                </label>
                <input
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={correo}
                  onChange={(e) => {
                    setCorreo(e.target.value);
                    if (errors.correo) setErrors((p) => ({ ...p, correo: null }));
                  }}
                  style={{
                    width: '100%',
                    padding: '13px 14px',
                    borderRadius: 10,
                    border: `1px solid ${errors.correo ? C.red : C.border}`,
                    fontFamily: F.body,
                    fontSize: 14,
                    color: C.navy,
                    outline: 'none',
                    background: '#FAFAFC',
                  }}
                />
                {errors.correo && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: C.red, marginTop: 4 }}>
                    <AlertCircle size={12} /> {errors.correo}
                  </span>
                )}
              </div>

              <button
                type="submit"
                style={{
                  marginTop: 6,
                  width: '100%',
                  padding: '15px 20px',
                  borderRadius: 12,
                  border: 'none',
                  background: C.red,
                  color: C.white,
                  fontFamily: F.heading,
                  fontSize: 13,
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  boxShadow: '0 12px 28px rgba(196,30,36,0.28)',
                  transition: 'all 0.25s',
                }}
              >
                <Tag size={15} /> Activar 10% en mi primera compra <ArrowRight size={15} />
              </button>

              <p
                style={{
                  fontSize: 11,
                  color: C.gray,
                  margin: 0,
                  lineHeight: 1.45,
                  textAlign: 'center',
                }}
              >
                El descuento se aplica automáticamente en tu carrito de compra. Sujeto a validación de primera compra al confirmar pedido.
              </p>
            </form>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%', gap: 18 }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: 'rgba(22,163,74,0.1)',
                  color: '#16A34A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Check size={24} strokeWidth={2.5} />
              </div>

              <div>
                <span
                  style={{
                    fontFamily: F.heading,
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    color: '#16A34A',
                    display: 'block',
                    marginBottom: 6,
                  }}
                >
                  Descuento aplicado al carrito
                </span>
                <h4
                  style={{
                    fontFamily: F.heading,
                    fontSize: 24,
                    fontWeight: 800,
                    color: C.navy,
                    margin: '0 0 8px',
                  }}
                >
                  Código listo para usar
                </h4>
                <p style={{ fontSize: 13.5, color: C.gray, margin: 0, lineHeight: 1.55 }}>
                  Tu beneficio del <strong>10% de descuento en tu primera compra</strong> ya se refleja en el resumen de tu carrito.
                </p>
              </div>

              <div
                style={{
                  padding: '16px 18px',
                  borderRadius: 14,
                  background: '#F8FAFC',
                  border: `1.5px dashed ${C.red}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                }}
              >
                <div>
                  <div style={{ fontSize: 10, fontFamily: F.heading, fontWeight: 700, color: C.gray, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                    Código primera compra
                  </div>
                  <div style={{ fontSize: 20, fontFamily: F.heading, fontWeight: 900, color: C.navy, letterSpacing: '0.06em', marginTop: 2 }}>
                    {coupon.code}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={copyCode}
                  style={{
                    padding: '9px 14px',
                    borderRadius: 8,
                    border: `1px solid ${C.border}`,
                    background: copied ? '#16A34A' : C.white,
                    color: copied ? C.white : C.navy,
                    fontFamily: F.heading,
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                  {copied ? 'Copiado' : 'Copiar'}
                </button>
              </div>

              <button
                type="button"
                onClick={handleClose}
                style={{
                  width: '100%',
                  padding: '14px 20px',
                  borderRadius: 12,
                  border: 'none',
                  background: C.navy,
                  color: C.white,
                  fontFamily: F.heading,
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                }}
              >
                Explorar Llantas con Descuento
              </button>
            </div>
          )}
        </div>
      </div>
      <style>{`
        @media (max-width: 640px) {
          .jasman-coupon-modal-card {
            max-height: 92dvh !important;
            border-radius: 20px !important;
            grid-template-columns: 1fr !important;
          }
          .jasman-coupon-modal-left {
            padding: 20px 20px 16px !important;
          }
          .jasman-coupon-modal-left img {
            height: 22px !important;
            margin-bottom: 12px !important;
          }
          .jasman-coupon-modal-left h3 {
            font-size: 16px !important;
            margin-bottom: 6px !important;
          }
          .jasman-coupon-modal-left p {
            font-size: 12px !important;
            line-height: 1.45 !important;
          }
          .jasman-coupon-modal-left > div:last-child {
            display: none !important;
          }
          .jasman-coupon-modal-right {
            padding: 20px 20px 22px !important;
            position: static !important;
          }
          .jasman-coupon-close-btn {
            top: 14px !important;
            right: 14px !important;
            z-index: 20 !important;
            background: rgba(255, 255, 255, 0.14) !important;
            border-color: rgba(255, 255, 255, 0.25) !important;
            color: #FFFFFF !important;
          }
        }
      `}</style>
    </div>
  );
}

