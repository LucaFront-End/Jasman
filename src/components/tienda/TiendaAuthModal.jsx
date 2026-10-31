import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { C, F } from '../../hooks/useAnimations';
import { sucursales } from '../../data/sucursalesData';
import { useTiendaState } from '../../hooks/useTiendaState';
import {
  loginWixMember,
  registerWixMember,
  startWixSocialLogin,
  completeSocialQuickAuth,
  completeWixOAuthCallbackIfPresent,
  sendWixPasswordReset,
  fetchWixMemberProfileAndOrders,
} from '../../services/wixService';
import {
  X,
  Lock,
  Mail,
  User,
  Sparkles,
  Check,
  ShieldCheck,
} from 'lucide-react';

function GoogleOfficialIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

function FacebookOfficialIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047v-2.66c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.971H15.83c-1.491 0-1.956.93-1.956 1.886v2.264h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"
        fill="#1877F2"
      />
    </svg>
  );
}

export default function TiendaAuthModal({ forceOpen = false, onCloseForce }) {
  const navigate = useNavigate();
  const {
    user,
    saveUser,
    mergeSyncedOrders,
    selectedBranchSlug,
    setSelectedBranch,
  } = useTiendaState();

  const [open, setOpen] = useState(false);
  const [redirectToAccount, setRedirectToAccount] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({
    nombre: '',
    correo: '',
    password: '',
    telefono: '',
    sucursalPreferida: selectedBranchSlug || 'jasman-satelite',
  });
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState('');
  const [socialQuickProvider, setSocialQuickProvider] = useState(null);
  const [feedback, setFeedback] = useState(null);

  // Complete OAuth callback if returning from Google/Facebook on any store page
  useEffect(() => {
    completeWixOAuthCallbackIfPresent().then((result) => {
      if (result && result.member) {
        saveUser(result.member);
        if (result.orders && result.orders.length > 0) {
          mergeSyncedOrders(result.orders);
        }
      }
    });
  }, [saveUser, mergeSyncedOrders]);

  useEffect(() => {
    const handleUI = (e) => {
      if (e.detail?.type === 'OPEN_AUTH' || e.detail?.type === 'OPEN_USER') {
        if (user) {
          navigate('/landing-tienda-preview/cuenta');
          return;
        }
        setAuthMode(e.detail?.mode || 'login');
        setRedirectToAccount(Boolean(e.detail?.redirectToAccount ?? true));
        setFeedback(null);
        setSocialQuickProvider(null);
        setOpen(true);
      }
    };
    window.addEventListener('jasman-tienda-ui', handleUI);
    return () => window.removeEventListener('jasman-tienda-ui', handleUI);
  }, [user, navigate]);

  const isVisible = open || (forceOpen && !user);
  if (!isVisible) return null;

  const handleClose = () => {
    setOpen(false);
    setSocialQuickProvider(null);
    setFeedback(null);
    if (onCloseForce) onCloseForce();
  };

  const finishSuccess = (member, remoteOrders) => {
    saveUser(member);
    if (member.sucursalPreferida) {
      setSelectedBranch(member.sucursalPreferida);
    }
    if (remoteOrders && remoteOrders.length > 0) {
      mergeSyncedOrders(remoteOrders);
    }
    setOpen(false);
    setSocialQuickProvider(null);
    if (redirectToAccount || forceOpen) {
      navigate('/landing-tienda-preview/cuenta');
    }
  };

  const handleSocialAuth = async (provider) => {
    setFeedback(null);
    setSocialLoading(provider);
    const res = await startWixSocialLogin(
      provider,
      '/landing-tienda-preview/cuenta'
    );
    if (!res.success) {
      setSocialLoading('');
      if (res.useSocialModal) {
        setSocialQuickProvider(provider);
        return;
      }
      setFeedback({
        type: 'error',
        text: res.message || 'No fue posible iniciar el acceso social en este momento.',
      });
    }
  };

  const handleSocialQuickSubmit = async (e) => {
    e.preventDefault();
    if (!socialQuickProvider) return;
    setLoading(true);
    try {
      const res = await completeSocialQuickAuth({
        provider: socialQuickProvider,
        correo: form.correo,
        nombre: form.nombre,
        sucursalPreferida: form.sucursalPreferida || 'jasman-satelite',
      });
      if (!res.success) {
        setFeedback({ type: 'error', text: res.message });
        setLoading(false);
        return;
      }
      finishSuccess(res.member, res.orders);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setFeedback(null);

    if (!form.correo.trim()) {
      setFeedback({ type: 'error', text: 'Ingresa tu correo electrónico.' });
      return;
    }

    setLoading(true);
    try {
      if (authMode === 'login') {
        const res = await loginWixMember({
          correo: form.correo,
          password: form.password,
        });
        if (!res.success) {
          setFeedback({
            type: 'error',
            text: res.message || 'Verifica tus datos e intenta nuevamente.',
          });
          setLoading(false);
          return;
        }
        finishSuccess(res.member, res.orders);
      } else {
        if (!form.nombre.trim()) {
          setFeedback({ type: 'error', text: 'Ingresa tu nombre completo.' });
          setLoading(false);
          return;
        }
        const res = await registerWixMember({
          nombre: form.nombre,
          correo: form.correo,
          password: form.password,
          telefono: form.telefono,
          sucursalPreferida: form.sucursalPreferida,
          isUpdate: false,
        });
        if (!res.success) {
          setFeedback({
            type: 'error',
            text: res.message || 'No fue posible completar el registro.',
          });
          setLoading(false);
          return;
        }
        const { orders: remoteOrders } = await fetchWixMemberProfileAndOrders(
          form.correo
        );
        finishSuccess(res.member, remoteOrders || res.orders);
      }
    } catch {
      setFeedback({
        type: 'error',
        text: 'Ocurrió un error de conexión. Intenta nuevamente.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!form.correo.trim()) {
      setFeedback({
        type: 'info',
        text: 'Escribe tu correo electrónico arriba para enviarte el enlace de recuperación.',
      });
      return;
    }
    setLoading(true);
    const res = await sendWixPasswordReset(form.correo);
    setLoading(false);
    setFeedback({
      type: res.success ? 'success' : 'info',
      text: res.message,
    });
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(13, 16, 28, 0.62)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 'min(480px, 100%)',
          maxHeight: '92vh',
          overflowY: 'auto',
          background: '#FFFFFF',
          borderRadius: 32,
          padding: '32px 28px',
          border: '1px solid rgba(26, 31, 54, 0.08)',
          boxShadow: '0 32px 80px rgba(13, 16, 28, 0.35)',
          position: 'relative',
        }}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          aria-label="Cerrar ventana de cuenta"
          style={{
            position: 'absolute',
            top: 22,
            right: 22,
            width: 36,
            height: 36,
            borderRadius: '50%',
            border: '1px solid rgba(26, 31, 54, 0.1)',
            background: '#F8FAFC',
            color: C.navy,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <X size={16} />
        </button>

        {/* Header */}
        <div style={{ marginBottom: 20, paddingRight: 36 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 11px',
              borderRadius: 9999,
              background: 'rgba(196, 30, 36, 0.08)',
              color: C.red,
              fontFamily: F.heading,
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              marginBottom: 8,
            }}
          >
            <Sparkles size={11} /> Cuenta Oficial Jasman
          </div>
          <h3
            style={{
              fontFamily: F.heading,
              fontSize: 22,
              fontWeight: 900,
              color: C.navy,
              letterSpacing: '-0.03em',
              margin: '0 0 6px',
            }}
          >
            {socialQuickProvider
              ? `Continuar con ${socialQuickProvider === 'facebook' ? 'Facebook' : 'Google'}`
              : authMode === 'login'
              ? 'Inicia Sesión en tu Cuenta'
              : 'Crea tu Cuenta Jasman'}
          </h3>
          <p style={{ fontSize: 13, color: C.gray, margin: 0, lineHeight: 1.5 }}>
            {authMode === 'login'
              ? 'Accede a tu historial de pedidos, seguimiento de entrega y beneficios exclusivos.'
              : 'Regístrate para guardar tus pedidos, sucursal preferida y activar tu 10% en primera compra.'}
          </p>
        </div>

        {/* Segmented Switch: Iniciar Sesión | Crear Cuenta */}
        {!socialQuickProvider && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 6,
              padding: 5,
              borderRadius: 16,
              background: '#F1F5F9',
              marginBottom: 20,
            }}
          >
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setFeedback(null);
              }}
              style={{
                padding: '10px 14px',
                borderRadius: 12,
                border: 'none',
                background: authMode === 'login' ? '#FFFFFF' : 'transparent',
                color: authMode === 'login' ? C.navy : '#64748B',
                boxShadow:
                  authMode === 'login' ? '0 4px 12px rgba(26,31,54,0.08)' : 'none',
                fontFamily: F.heading,
                fontSize: 11.5,
                fontWeight: 800,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                cursor: 'pointer',
              }}
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('register');
                setFeedback(null);
              }}
              style={{
                padding: '10px 14px',
                borderRadius: 12,
                border: 'none',
                background: authMode === 'register' ? '#FFFFFF' : 'transparent',
                color: authMode === 'register' ? C.navy : '#64748B',
                boxShadow:
                  authMode === 'register' ? '0 4px 12px rgba(26,31,54,0.08)' : 'none',
                fontFamily: F.heading,
                fontSize: 11.5,
                fontWeight: 800,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                cursor: 'pointer',
              }}
            >
              Crear Cuenta
            </button>
          </div>
        )}

        {/* Feedback Banner */}
        {feedback && (
          <div
            style={{
              padding: '12px 14px',
              borderRadius: 14,
              marginBottom: 16,
              fontSize: 12.5,
              fontWeight: 600,
              background:
                feedback.type === 'error'
                  ? '#FEF2F2'
                  : feedback.type === 'success'
                  ? '#F0FDF4'
                  : '#F8FAFC',
              color:
                feedback.type === 'error'
                  ? '#B91C1C'
                  : feedback.type === 'success'
                  ? '#15803D'
                  : C.navy,
              border: `1px solid ${
                feedback.type === 'error'
                  ? 'rgba(185, 28, 28, 0.2)'
                  : feedback.type === 'success'
                  ? 'rgba(21, 128, 61, 0.2)'
                  : 'rgba(26, 31, 54, 0.1)'
              }`,
            }}
          >
            {feedback.text}
          </div>
        )}

        {socialQuickProvider ? (
          <form
            onSubmit={handleSocialQuickSubmit}
            style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
          >
            <div>
              <label
                style={{
                  display: 'block',
                  fontFamily: F.heading,
                  fontSize: 10.5,
                  fontWeight: 800,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: C.navy,
                  marginBottom: 6,
                }}
              >
                Tu Nombre
              </label>
              <input
                type="text"
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                placeholder="Ej. Roberto Sánchez"
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: 12,
                  border: `1px solid ${C.border}`,
                  fontFamily: F.body,
                  fontSize: 13.5,
                  color: C.navy,
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontFamily: F.heading,
                  fontSize: 10.5,
                  fontWeight: 800,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: C.navy,
                  marginBottom: 6,
                }}
              >
                Correo de {socialQuickProvider === 'facebook' ? 'Facebook' : 'Google'} *
              </label>
              <input
                type="email"
                required
                autoFocus
                value={form.correo}
                onChange={(e) => setForm({ ...form, correo: e.target.value })}
                placeholder="tucorreo@ejemplo.com"
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: 12,
                  border: `1px solid ${C.border}`,
                  fontFamily: F.body,
                  fontSize: 13.5,
                  color: C.navy,
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
              <button
                type="button"
                onClick={() => setSocialQuickProvider(null)}
                style={{
                  padding: '12px 16px',
                  borderRadius: 12,
                  border: `1px solid ${C.border}`,
                  background: '#F8FAFC',
                  color: C.navy,
                  fontFamily: F.heading,
                  fontSize: 11.5,
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                Volver
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '12px 18px',
                  borderRadius: 12,
                  border: 'none',
                  background: C.red,
                  color: '#FFFFFF',
                  fontFamily: F.heading,
                  fontSize: 12,
                  fontWeight: 800,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  cursor: loading ? 'wait' : 'pointer',
                }}
              >
                {loading ? 'Conectando...' : 'Continuar'}
              </button>
            </div>
          </form>
        ) : (
          <>
            {/* Google & Facebook Social Login Buttons */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 10,
                marginBottom: 18,
              }}
            >
              <button
                type="button"
                onClick={() => handleSocialAuth('google')}
                disabled={Boolean(socialLoading)}
                style={{
                  padding: '12px 14px',
                  borderRadius: 14,
                  border: '1px solid rgba(26, 31, 54, 0.12)',
                  background: '#FFFFFF',
                  color: C.navy,
                  fontFamily: F.heading,
                  fontSize: 12,
                  fontWeight: 800,
                  cursor: socialLoading ? 'wait' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  boxShadow: '0 4px 12px rgba(26, 31, 54, 0.04)',
                }}
              >
                <GoogleOfficialIcon />
                <span>
                  {socialLoading === 'google' ? 'Conectando...' : 'Google'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleSocialAuth('facebook')}
                disabled={Boolean(socialLoading)}
                style={{
                  padding: '12px 14px',
                  borderRadius: 14,
                  border: '1px solid rgba(24, 119, 242, 0.22)',
                  background: '#F8FAFC',
                  color: C.navy,
                  fontFamily: F.heading,
                  fontSize: 12,
                  fontWeight: 800,
                  cursor: socialLoading ? 'wait' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  boxShadow: '0 4px 12px rgba(26, 31, 54, 0.03)',
                }}
              >
                <FacebookOfficialIcon />
                <span>
                  {socialLoading === 'facebook' ? 'Conectando...' : 'Facebook'}
                </span>
              </button>
            </div>

            {/* Divider */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                marginBottom: 16,
              }}
            >
              <div style={{ flex: 1, height: 1, background: 'rgba(26,31,54,0.08)' }} />
              <span
                style={{
                  fontFamily: F.heading,
                  fontSize: 9.5,
                  fontWeight: 800,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: '#94A3B8',
                }}
              >
                o con tu correo
              </span>
              <div style={{ flex: 1, height: 1, background: 'rgba(26,31,54,0.08)' }} />
            </div>

            {/* Email / Password Form */}
            <form
              onSubmit={handleAuthSubmit}
              style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
            >
              {authMode === 'register' && (
                <div>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                      fontFamily: F.heading,
                      fontSize: 10.5,
                      fontWeight: 800,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: C.navy,
                      marginBottom: 5,
                    }}
                  >
                    <User size={12} color={C.red} /> Nombre Completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.nombre}
                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                    placeholder="Ej. Roberto Sánchez"
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: 12,
                      border: `1px solid ${C.border}`,
                      fontFamily: F.body,
                      fontSize: 13.5,
                      color: C.navy,
                      outline: 'none',
                    }}
                  />
                </div>
              )}

              <div>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    fontFamily: F.heading,
                    fontSize: 10.5,
                    fontWeight: 800,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: C.navy,
                    marginBottom: 5,
                  }}
                >
                  <Mail size={12} color={C.red} /> Correo Electrónico *
                </label>
                <input
                  type="email"
                  required
                  value={form.correo}
                  onChange={(e) => setForm({ ...form, correo: e.target.value })}
                  placeholder="cliente@correo.com"
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: 12,
                    border: `1px solid ${C.border}`,
                    fontFamily: F.body,
                    fontSize: 13.5,
                    color: C.navy,
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 5,
                  }}
                >
                  <label
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                      fontFamily: F.heading,
                      fontSize: 10.5,
                      fontWeight: 800,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: C.navy,
                    }}
                  >
                    <Lock size={12} color={C.red} /> Contraseña *
                  </label>
                  {authMode === 'login' && (
                    <button
                      type="button"
                      onClick={handlePasswordReset}
                      style={{
                        border: 'none',
                        background: 'transparent',
                        color: C.red,
                        fontFamily: F.heading,
                        fontSize: 10,
                        fontWeight: 800,
                        cursor: 'pointer',
                        padding: 0,
                      }}
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  )}
                </div>
                <input
                  type="password"
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder={
                    authMode === 'register'
                      ? 'Mínimo 6 caracteres'
                      : 'Ingresa tu contraseña'
                  }
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: 12,
                    border: `1px solid ${C.border}`,
                    fontFamily: F.body,
                    fontSize: 13.5,
                    color: C.navy,
                    outline: 'none',
                  }}
                />
              </div>

              {authMode === 'register' && (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 10,
                  }}
                >
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontFamily: F.heading,
                        fontSize: 10,
                        fontWeight: 800,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        color: C.navy,
                        marginBottom: 5,
                      }}
                    >
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      value={form.telefono}
                      onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                      placeholder="55 1234 5678"
                      style={{
                        width: '100%',
                        padding: '11px 12px',
                        borderRadius: 12,
                        border: `1px solid ${C.border}`,
                        fontFamily: F.body,
                        fontSize: 13,
                        color: C.navy,
                        outline: 'none',
                      }}
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontFamily: F.heading,
                        fontSize: 10,
                        fontWeight: 800,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        color: C.navy,
                        marginBottom: 5,
                      }}
                    >
                      Sucursal Preferida
                    </label>
                    <select
                      value={form.sucursalPreferida}
                      onChange={(e) =>
                        setForm({ ...form, sucursalPreferida: e.target.value })
                      }
                      style={{
                        width: '100%',
                        padding: '11px 10px',
                        borderRadius: 12,
                        border: `1px solid ${C.border}`,
                        fontFamily: F.body,
                        fontSize: 12.5,
                        color: C.navy,
                        background: '#FFFFFF',
                        outline: 'none',
                      }}
                    >
                      {sucursales.map((s) => (
                        <option key={s.slug} value={s.slug}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  marginTop: 4,
                  padding: '14px 20px',
                  borderRadius: 14,
                  border: 'none',
                  background: C.red,
                  color: '#FFFFFF',
                  fontFamily: F.heading,
                  fontSize: 12.5,
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  cursor: loading ? 'wait' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  boxShadow: '0 12px 28px rgba(196, 30, 36, 0.28)',
                }}
              >
                <Check size={16} />
                {loading
                  ? 'Procesando...'
                  : authMode === 'login'
                  ? 'Entrar a Mi Cuenta'
                  : 'Crear Cuenta y Continuar'}
              </button>
            </form>

            <div
              style={{
                marginTop: 16,
                paddingTop: 14,
                borderTop: '1px solid rgba(26, 31, 54, 0.06)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                fontSize: 11.5,
                color: '#64748B',
              }}
            >
              <ShieldCheck size={14} color="#16A34A" />
              <span>Acceso cifrado · Sincronización automática de pedidos</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

