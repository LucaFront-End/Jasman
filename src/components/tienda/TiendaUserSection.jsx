import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { C, F } from '../../hooks/useAnimations';
import { formatMXN } from '../../data/productosMasterData';
import { sucursales } from '../../data/sucursalesData';
import { useTiendaState, triggerTiendaUI } from '../../hooks/useTiendaState';
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
  User,
  Package,
  MapPin,
  Tag,
  LogOut,
  Check,
  Sparkles,
  Lock,
  Mail,
  RefreshCw,
  ShieldCheck,
  KeyRound,
  ArrowLeft,
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

function UserAccountWorkspace() {
  const {
    user,
    saveUser,
    logoutUser,
    orders,
    mergeSyncedOrders,
    coupon,
    selectedBranchSlug,
    setSelectedBranch,
  } = useTiendaState();

  const [activeTab, setActiveTab] = useState('perfil');
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({
    nombre: user?.nombre || '',
    correo: user?.correo || '',
    password: '',
    telefono: user?.telefono || '',
    sucursalPreferida: user?.sucursalPreferida || selectedBranchSlug || 'jasman-satelite',
  });
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(''); // 'google' | 'facebook' | ''
  const [socialModalProvider, setSocialModalProvider] = useState(null); // 'google' | 'facebook' | null
  const [socialForm, setSocialForm] = useState({ correo: '', nombre: '' });
  const [socialSubmitting, setSocialSubmitting] = useState(false);
  const [syncingOrders, setSyncingOrders] = useState(false);
  const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error' | 'info', text: '' }

  useEffect(() => {
    completeWixOAuthCallbackIfPresent().then((result) => {
      if (result && result.member) {
        saveUser(result.member);
        if (result.orders && result.orders.length > 0) {
          mergeSyncedOrders(result.orders);
        }
        setForm({
          nombre: result.member.nombre || '',
          correo: result.member.correo || '',
          password: '',
          telefono: result.member.telefono || '',
          sucursalPreferida: result.member.sucursalPreferida || 'jasman-satelite',
        });
        setFeedback({
          type: 'success',
          text: '¡Bienvenido! Tu sesión social se ha vinculado correctamente.',
        });
      }
    });
  }, [saveUser, mergeSyncedOrders]);

  const handleSocialAuth = async (provider) => {
    setFeedback(null);
    setSocialLoading(provider);
    const res = await startWixSocialLogin(provider, window.location.pathname);
    if (!res.success) {
      setSocialLoading('');
      if (res.useSocialModal) {
        setSocialForm({
          correo: form.correo || '',
          nombre: form.nombre || '',
        });
        setSocialModalProvider(provider);
        return;
      }
      setFeedback({
        type: 'error',
        text: res.message || 'No fue posible iniciar el acceso social en este momento.',
      });
    }
  };

  const handleSocialModalSubmit = async (e) => {
    e.preventDefault();
    if (!socialModalProvider) return;
    setSocialSubmitting(true);
    try {
      const res = await completeSocialQuickAuth({
        provider: socialModalProvider,
        correo: socialForm.correo,
        nombre: socialForm.nombre,
        sucursalPreferida: form.sucursalPreferida || 'jasman-satelite',
      });
      if (!res.success) {
        setFeedback({
          type: 'error',
          text: res.message || 'Verifica tu correo electrónico.',
        });
        setSocialSubmitting(false);
        return;
      }
      saveUser(res.member);
      setForm({
        nombre: res.member.nombre || '',
        correo: res.member.correo || '',
        password: '',
        telefono: res.member.telefono || '',
        sucursalPreferida: res.member.sucursalPreferida || 'jasman-satelite',
      });
      if (res.orders && res.orders.length > 0) {
        mergeSyncedOrders(res.orders);
      }
      const label = socialModalProvider === 'facebook' ? 'Facebook' : 'Google';
      setSocialModalProvider(null);
      setFeedback({
        type: 'success',
        text: `¡Sesión iniciada con ${label}! Tu cuenta y pedidos están sincronizados.`,
      });
    } finally {
      setSocialSubmitting(false);
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
      if (authMode === 'login' && !user) {
        const res = await loginWixMember({
          correo: form.correo,
          password: form.password,
        });

        if (!res.success) {
          setFeedback({
            type: 'error',
            text: res.message || 'No fue posible iniciar sesión. Verifica tus datos.',
          });
          setLoading(false);
          return;
        }

        saveUser(res.member);
        setForm({
          nombre: res.member.nombre || '',
          correo: res.member.correo || '',
          password: '',
          telefono: res.member.telefono || '',
          sucursalPreferida: res.member.sucursalPreferida || 'jasman-satelite',
        });
        if (res.member.sucursalPreferida) {
          setSelectedBranch(res.member.sucursalPreferida);
        }
        if (res.orders && res.orders.length > 0) {
          mergeSyncedOrders(res.orders);
        }

        setFeedback({
          type: 'success',
          text: '¡Bienvenido! Tu cuenta Jasman está activa y sincronizada.',
        });
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
          isUpdate: Boolean(user),
        });

        if (!res.success) {
          setFeedback({
            type: 'error',
            text: res.message || 'No fue posible completar el registro.',
          });
          setLoading(false);
          return;
        }

        saveUser(res.member);
        setForm((prev) => ({
          ...prev,
          nombre: res.member.nombre || prev.nombre,
          correo: res.member.correo || prev.correo,
          password: '',
          telefono: res.member.telefono || prev.telefono,
          sucursalPreferida: res.member.sucursalPreferida || prev.sucursalPreferida,
        }));
        setSelectedBranch(form.sucursalPreferida);

        const { orders: remoteOrders } = await fetchWixMemberProfileAndOrders(form.correo);
        if (remoteOrders && remoteOrders.length > 0) {
          mergeSyncedOrders(remoteOrders);
        }

        setFeedback({
          type: 'success',
          text: user
            ? 'Tus datos y sucursal preferida se actualizaron correctamente.'
            : '¡Cuenta creada con éxito! Ya puedes gestionar tus pedidos y beneficios.',
        });
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

  const handleManualSync = async () => {
    if (!user?.correo) return;
    setSyncingOrders(true);
    try {
      const { profile, orders: remoteOrders } = await fetchWixMemberProfileAndOrders(
        user.correo
      );
      if (profile) {
        saveUser({ ...user, ...profile });
      }
      if (remoteOrders && remoteOrders.length > 0) {
        mergeSyncedOrders(remoteOrders);
      }
      setFeedback({
        type: 'success',
        text: 'Tus pedidos y perfil están actualizados al día.',
      });
    } finally {
      setSyncingOrders(false);
    }
  };

  const selectedBranch =
    sucursales.find((s) => s.slug === selectedBranchSlug) || sucursales[0];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '300px 1fr',
        gap: 28,
        alignItems: 'start',
      }}
      className="tienda-user-grid"
    >
      {/* Left Navigation / Account Card */}
      <div
        style={{
          background: C.white,
          borderRadius: 28,
          border: '1px solid rgba(26, 31, 54, 0.08)',
          padding: 24,
          boxShadow: '0 14px 36px rgba(26, 31, 54, 0.04)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            paddingBottom: 16,
            borderBottom: `1px solid ${C.border}`,
            marginBottom: 14,
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              background: user ? C.red : C.navy,
              color: C.white,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: F.heading,
              fontSize: 17,
              fontWeight: 800,
              flexShrink: 0,
            }}
          >
            {user ? user.nombre.charAt(0).toUpperCase() : <User size={20} />}
          </div>
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontFamily: F.heading,
                fontSize: 14.5,
                fontWeight: 800,
                color: C.navy,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {user ? user.nombre : 'Mi Cuenta Jasman'}
            </div>
            <div
              style={{
                fontSize: 12,
                color: C.gray,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {user ? user.correo : 'Inicia sesión o regístrate'}
            </div>
          </div>
        </div>

        {/* Account Status Pill */}
        <div
          style={{
            padding: '10px 14px',
            borderRadius: 14,
            background: user ? 'rgba(22, 163, 74, 0.07)' : '#F8FAFC',
            border: user
              ? '1px solid rgba(22, 163, 74, 0.22)'
              : '1px solid rgba(26, 31, 54, 0.07)',
            marginBottom: 16,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 6,
            }}
          >
            <span
              style={{
                fontFamily: F.heading,
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: user ? '#15803D' : C.navy,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <ShieldCheck size={14} color={user ? '#16A34A' : C.red} />
              {user ? 'Cliente Verificado' : 'Acceso Clientes'}
            </span>
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: user ? '#16A34A' : '#CBD5E1',
              }}
            />
          </div>
          <div style={{ fontSize: 11, color: '#64748B', marginTop: 4 }}>
            {user
              ? `Sucursal: ${selectedBranch?.name || 'Jasman Satélite'}`
              : 'Guarda tus pedidos, facturas y medidas'}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[
            {
              id: 'perfil',
              label: user ? 'Mis Datos Personales' : 'Iniciar Sesión / Registro',
              icon: User,
            },
            { id: 'pedidos', label: `Mis Pedidos (${orders.length})`, icon: Package },
            { id: 'beneficios', label: 'Cupones y Sucursal', icon: Tag },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: 14,
                  border: 'none',
                  background: active ? '#FFF1F2' : 'transparent',
                  color: active ? C.red : C.navy,
                  fontFamily: F.heading,
                  fontSize: 12.5,
                  fontWeight: active ? 800 : 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s ease',
                }}
              >
                <Icon size={15} />
                <span>{tab.label}</span>
              </button>
            );
          })}

          {user && (
            <>
              <button
                type="button"
                onClick={handleManualSync}
                disabled={syncingOrders}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  marginTop: 6,
                  borderRadius: 12,
                  border: '1px solid rgba(26, 31, 54, 0.08)',
                  background: '#F8FAFC',
                  color: C.navy,
                  fontFamily: F.heading,
                  fontSize: 11.5,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  cursor: 'pointer',
                }}
              >
                <RefreshCw size={13} />
                <span>{syncingOrders ? 'Actualizando...' : 'Actualizar mis pedidos'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  logoutUser();
                  setForm({
                    nombre: '',
                    correo: '',
                    password: '',
                    telefono: '',
                    sucursalPreferida: selectedBranchSlug || 'jasman-satelite',
                  });
                  setFeedback({
                    type: 'info',
                    text: 'Has cerrado sesión correctamente.',
                  });
                }}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  marginTop: 4,
                  borderRadius: 12,
                  border: `1px solid ${C.border}`,
                  background: C.white,
                  color: C.gray,
                  fontFamily: F.heading,
                  fontSize: 11.5,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  cursor: 'pointer',
                }}
              >
                <LogOut size={14} />
                <span>Cerrar sesión</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Right Content Panel */}
      <div
        style={{
          background: C.white,
          borderRadius: 28,
          border: '1px solid rgba(26, 31, 54, 0.08)',
          padding: '32px 36px',
          boxShadow: '0 14px 36px rgba(26, 31, 54, 0.04)',
        }}
      >
        {activeTab === 'perfil' && (
          <div>
            {/* Top Header + Login/Register Toggle when not logged in */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 12,
                marginBottom: 16,
              }}
            >
              <div>
                <span
                  style={{
                    fontFamily: F.heading,
                    fontSize: 10,
                    fontWeight: 800,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: C.red,
                  }}
                >
                  Portal de Clientes Jasman
                </span>
                <h3
                  style={{
                    fontFamily: F.heading,
                    fontSize: 22,
                    fontWeight: 900,
                    color: C.navy,
                    margin: '4px 0 0',
                    letterSpacing: '-0.02em',
                  }}
                >
                  {user
                    ? 'Tus Datos y Sucursal Preferida'
                    : authMode === 'login'
                    ? 'Inicia Sesión en tu Cuenta'
                    : 'Crea tu Cuenta de Cliente'}
                </h3>
              </div>

              {!user && (
                <div
                  style={{
                    display: 'inline-flex',
                    padding: 4,
                    borderRadius: 9999,
                    background: '#F1F5F9',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('login');
                      setFeedback(null);
                    }}
                    style={{
                      padding: '8px 16px',
                      borderRadius: 9999,
                      border: 'none',
                      background: authMode === 'login' ? C.navy : 'transparent',
                      color: authMode === 'login' ? '#FFFFFF' : '#64748B',
                      fontFamily: F.heading,
                      fontSize: 11.5,
                      fontWeight: 800,
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
                      padding: '8px 16px',
                      borderRadius: 9999,
                      border: 'none',
                      background: authMode === 'register' ? C.red : 'transparent',
                      color: authMode === 'register' ? '#FFFFFF' : '#64748B',
                      fontFamily: F.heading,
                      fontSize: 11.5,
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    Crear Cuenta
                  </button>
                </div>
              )}
            </div>

            <p style={{ fontSize: 13.5, color: C.gray, margin: '0 0 22px', lineHeight: 1.55 }}>
              {user
                ? 'Tus datos, sucursal de instalación y pedidos se mantienen guardados para agilizar tus próximas compras.'
                : authMode === 'login'
                ? 'Accede de forma rápida con tu cuenta de Google o Facebook, o ingresa con tu correo electrónico.'
                : 'Regístrate en un clic con Google o Facebook, o completa tus datos para dar seguimiento a tus compras.'}
            </p>

            {/* SOCIAL LOGIN BUTTONS (GOOGLE & FACEBOOK) */}
            {!user && (
              <>
                <div
                  className="tienda-social-auth-grid"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 12,
                    marginBottom: 20,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => handleSocialAuth('google')}
                    disabled={Boolean(socialLoading)}
                    style={{
                      padding: '13px 18px',
                      borderRadius: 14,
                      border: '1px solid rgba(26, 31, 54, 0.12)',
                      background: '#FFFFFF',
                      color: C.navy,
                      fontFamily: F.heading,
                      fontSize: 12.5,
                      fontWeight: 800,
                      cursor: socialLoading ? 'wait' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 10,
                      boxShadow: '0 4px 14px rgba(26, 31, 54, 0.04)',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <GoogleOfficialIcon />
                    <span>
                      {socialLoading === 'google'
                        ? 'Conectando con Google...'
                        : 'Continuar con Google'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSocialAuth('facebook')}
                    disabled={Boolean(socialLoading)}
                    style={{
                      padding: '13px 18px',
                      borderRadius: 14,
                      border: '1px solid rgba(24, 119, 242, 0.22)',
                      background: '#F8FAFC',
                      color: C.navy,
                      fontFamily: F.heading,
                      fontSize: 12.5,
                      fontWeight: 800,
                      cursor: socialLoading ? 'wait' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 10,
                      boxShadow: '0 4px 14px rgba(26, 31, 54, 0.03)',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <FacebookOfficialIcon />
                    <span>
                      {socialLoading === 'facebook'
                        ? 'Conectando con Facebook...'
                        : 'Continuar con Facebook'}
                    </span>
                  </button>
                </div>

                {/* Divider */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    marginBottom: 20,
                  }}
                >
                  <div
                    style={{
                      flex: 1,
                      height: 1,
                      background: 'rgba(26, 31, 54, 0.08)',
                    }}
                  />
                  <span
                    style={{
                      fontFamily: F.heading,
                      fontSize: 10,
                      fontWeight: 800,
                      letterSpacing: '0.14em',
                      textTransform: 'uppercase',
                      color: '#94A3B8',
                    }}
                  >
                    o con tu correo electrónico
                  </span>
                  <div
                    style={{
                      flex: 1,
                      height: 1,
                      background: 'rgba(26, 31, 54, 0.08)',
                    }}
                  />
                </div>
              </>
            )}

            <form
              onSubmit={handleAuthSubmit}
              style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
            >
              {(authMode === 'register' || user) && (
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
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.nombre}
                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                    placeholder="Ej. Roberto Sánchez"
                    style={{
                      width: '100%',
                      padding: '13px 16px',
                      borderRadius: 14,
                      border: `1px solid ${C.border}`,
                      fontFamily: F.body,
                      fontSize: 14,
                      color: C.navy,
                      outline: 'none',
                    }}
                  />
                </div>
              )}

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 16,
                }}
                className="tienda-user-form-row"
              >
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
                      marginBottom: 6,
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
                      padding: '13px 16px',
                      borderRadius: 14,
                      border: `1px solid ${C.border}`,
                      fontFamily: F.body,
                      fontSize: 14,
                      color: C.navy,
                      outline: 'none',
                    }}
                  />
                </div>

                {!user && (
                  <div>
                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontFamily: F.heading,
                        fontSize: 10.5,
                        fontWeight: 800,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        color: C.navy,
                        marginBottom: 6,
                      }}
                    >
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                        <Lock size={12} color={C.red} /> Contraseña
                      </span>
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
                    </label>
                    <input
                      type="password"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      placeholder={
                        authMode === 'register'
                          ? 'Mínimo 6 caracteres'
                          : 'Ingresa tu contraseña'
                      }
                      style={{
                        width: '100%',
                        padding: '13px 16px',
                        borderRadius: 14,
                        border: `1px solid ${C.border}`,
                        fontFamily: F.body,
                        fontSize: 14,
                        color: C.navy,
                        outline: 'none',
                      }}
                    />
                  </div>
                )}

                {(authMode === 'register' || user) && (
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
                      Teléfono / WhatsApp
                    </label>
                    <input
                      type="tel"
                      value={form.telefono}
                      onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                      placeholder="55 1234 5678"
                      style={{
                        width: '100%',
                        padding: '13px 16px',
                        borderRadius: 14,
                        border: `1px solid ${C.border}`,
                        fontFamily: F.body,
                        fontSize: 14,
                        color: C.navy,
                        outline: 'none',
                      }}
                    />
                  </div>
                )}
              </div>

              {(authMode === 'register' || user) && (
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
                    Sucursal Jasman Preferida
                  </label>
                  <select
                    value={form.sucursalPreferida}
                    onChange={(e) =>
                      setForm({ ...form, sucursalPreferida: e.target.value })
                    }
                    style={{
                      width: '100%',
                      padding: '13px 16px',
                      borderRadius: 14,
                      border: `1px solid ${C.border}`,
                      fontFamily: F.body,
                      fontSize: 14,
                      color: C.navy,
                      background: C.white,
                      outline: 'none',
                    }}
                  >
                    {sucursales.map((s) => (
                      <option key={s.slug} value={s.slug}>
                        {s.name} — {s.zone}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {feedback && (
                <div
                  style={{
                    padding: '12px 16px',
                    borderRadius: 14,
                    background:
                      feedback.type === 'error'
                        ? '#FEF2F2'
                        : feedback.type === 'info'
                        ? '#F8FAFC'
                        : 'rgba(22, 163, 74, 0.08)',
                    border:
                      feedback.type === 'error'
                        ? '1px solid rgba(220, 38, 38, 0.25)'
                        : feedback.type === 'info'
                        ? '1px solid rgba(26, 31, 54, 0.1)'
                        : '1px solid rgba(22, 163, 74, 0.25)',
                    color:
                      feedback.type === 'error'
                        ? '#B91C1C'
                        : feedback.type === 'info'
                        ? C.navy
                        : '#15803D',
                    fontSize: 12.5,
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <Check size={14} />
                  <span>{feedback.text}</span>
                </div>
              )}

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 12,
                  marginTop: 4,
                }}
              >
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: '14px 26px',
                    borderRadius: 14,
                    border: 'none',
                    background: C.red,
                    color: C.white,
                    fontFamily: F.heading,
                    fontSize: 12,
                    fontWeight: 800,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    cursor: loading ? 'wait' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    boxShadow: '0 10px 24px rgba(196, 30, 36, 0.24)',
                  }}
                >
                  <KeyRound size={14} />
                  <span>
                    {loading
                      ? 'Procesando...'
                      : user
                      ? 'Guardar Cambios'
                      : authMode === 'login'
                      ? 'Iniciar Sesión'
                      : 'Crear mi Cuenta'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        )}

        {activeTab === 'pedidos' && (
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 10,
                marginBottom: 16,
              }}
            >
              <div>
                <h3
                  style={{
                    fontFamily: F.heading,
                    fontSize: 20,
                    fontWeight: 900,
                    color: C.navy,
                    margin: '0 0 4px',
                  }}
                >
                  Mis Pedidos
                </h3>
                <p style={{ fontSize: 13, color: C.gray, margin: 0 }}>
                  Órdenes de compra y solicitudes de instalación registradas en tu cuenta.
                </p>
              </div>

              {user && (
                <button
                  type="button"
                  onClick={handleManualSync}
                  disabled={syncingOrders}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 9999,
                    border: '1px solid rgba(26,31,54,0.1)',
                    background: '#F8FAFC',
                    color: C.navy,
                    fontFamily: F.heading,
                    fontSize: 11,
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <RefreshCw size={12} /> Actualizar historial
                </button>
              )}
            </div>

            {orders.length === 0 ? (
              <div
                style={{
                  padding: '36px 20px',
                  borderRadius: 16,
                  background: '#FAFAFC',
                  border: `1px dashed ${C.border}`,
                  textAlign: 'center',
                }}
              >
                <Package size={32} color="#94A3B8" style={{ marginBottom: 10 }} />
                <div style={{ fontFamily: F.heading, fontSize: 14, fontWeight: 800, color: C.navy }}>
                  Aún no tienes pedidos registrados
                </div>
                <div style={{ fontSize: 12.5, color: C.gray, marginTop: 4 }}>
                  Agrega tus llantas al carrito y confirma tu solicitud para verla aquí.
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {orders.map((order) => (
                  <div
                    key={order.id}
                    style={{
                      padding: 18,
                      borderRadius: 16,
                      border: `1px solid ${C.border}`,
                      background: '#FAFAFC',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: 8,
                        paddingBottom: 10,
                        borderBottom: `1px solid ${C.border}`,
                        marginBottom: 10,
                      }}
                    >
                      <div>
                        <span
                          style={{
                            fontFamily: F.heading,
                            fontSize: 13,
                            fontWeight: 900,
                            color: C.navy,
                          }}
                        >
                          Orden {order.id}
                        </span>
                        <span style={{ fontSize: 11.5, color: C.gray, marginLeft: 10 }}>
                          {new Date(order.createdAt).toLocaleDateString('es-MX', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      <span
                        style={{
                          padding: '4px 10px',
                          borderRadius: 9999,
                          background: 'rgba(22, 163, 74, 0.12)',
                          color: '#15803D',
                          fontFamily: F.heading,
                          fontSize: 10,
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          letterSpacing: '0.08em',
                        }}
                      >
                        {order.status}
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 10 }}>
                      {(order.items || []).map((item, idx) => (
                        <div
                          key={`${order.id}-${idx}`}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            fontSize: 12.5,
                            color: C.text,
                          }}
                        >
                          <span>
                            {item.quantity}x {item.name}
                          </span>
                          <span style={{ fontWeight: 700 }}>
                            {formatMXN(item.unitPrice * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: 8,
                        paddingTop: 8,
                        borderTop: `1px dashed ${C.border}`,
                        fontSize: 12,
                      }}
                    >
                      <span style={{ color: C.gray }}>
                        Sucursal: <strong style={{ color: C.navy }}>{order.branchName}</strong>
                      </span>
                      <span style={{ fontFamily: F.heading, fontSize: 14, fontWeight: 900, color: C.red }}>
                        Total: {formatMXN(order.total)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'beneficios' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h3
              style={{
                fontFamily: F.heading,
                fontSize: 20,
                fontWeight: 900,
                color: C.navy,
                margin: 0,
              }}
            >
              Mis Beneficios y Sucursal
            </h3>

            {/* Coupon status card */}
            <div
              style={{
                padding: 20,
                borderRadius: 16,
                background: coupon ? '#FFF1F2' : '#F8FAFC',
                border: `1px solid ${coupon ? 'rgba(196,30,36,0.3)' : C.border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 14,
              }}
            >
              <div>
                <span
                  style={{
                    fontFamily: F.heading,
                    fontSize: 10,
                    fontWeight: 800,
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                    color: C.red,
                  }}
                >
                  Beneficio Primera Compra
                </span>
                <div
                  style={{
                    fontFamily: F.heading,
                    fontSize: 17,
                    fontWeight: 900,
                    color: C.navy,
                    marginTop: 4,
                  }}
                >
                  {coupon
                    ? `Cupón Activo: ${coupon.code} (−10%)`
                    : '10% de Descuento en tu Primera Compra'}
                </div>
                <div style={{ fontSize: 12.5, color: C.gray, marginTop: 2 }}>
                  {coupon
                    ? 'Se aplica automáticamente en tu carrito y es acumulable con descuento por volumen.'
                    : 'Actívalo registrando tu correo para aplicarlo en todo el catálogo.'}
                </div>
              </div>

              {!coupon && (
                <button
                  type="button"
                  onClick={() => triggerTiendaUI({ type: 'OPEN_COUPON' })}
                  style={{
                    padding: '10px 16px',
                    borderRadius: 9999,
                    border: 'none',
                    background: C.red,
                    color: C.white,
                    fontFamily: F.heading,
                    fontSize: 11,
                    fontWeight: 800,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <Sparkles size={13} /> Activar 10%
                </button>
              )}
            </div>

            {/* Active branch card */}
            <div
              style={{
                padding: 20,
                borderRadius: 16,
                background: '#FAFAFC',
                border: `1px solid ${C.border}`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <MapPin size={16} color={C.red} />
                <span
                  style={{
                    fontFamily: F.heading,
                    fontSize: 13,
                    fontWeight: 800,
                    color: C.navy,
                  }}
                >
                  Sucursal de Instalación Seleccionada
                </span>
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>
                {selectedBranch?.name} ({selectedBranch?.zone})
              </div>
              <div style={{ fontSize: 12.5, color: C.gray, marginTop: 4 }}>
                {selectedBranch?.address}
              </div>
              <div style={{ fontSize: 12, color: C.navy, marginTop: 6, fontWeight: 600 }}>
                Tel: {selectedBranch?.phone} · Horario L-V: {selectedBranch?.hours?.weekdays}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* IN-PAGE GOOGLE / FACEBOOK QUICK-CONNECT MODAL */}
      {socialModalProvider && (
        <div
          onClick={() => !socialSubmitting && setSocialModalProvider(null)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 130,
            background: 'rgba(15, 20, 40, 0.55)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 'min(440px, 100%)',
              background: '#FFFFFF',
              borderRadius: 28,
              padding: '28px 26px',
              border: '1px solid rgba(26, 31, 54, 0.08)',
              boxShadow: '0 28px 70px rgba(15, 20, 40, 0.28)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                marginBottom: 14,
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 14,
                  background: '#F8FAFC',
                  border: '1px solid rgba(26, 31, 54, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {socialModalProvider === 'facebook' ? (
                  <FacebookOfficialIcon />
                ) : (
                  <GoogleOfficialIcon />
                )}
              </div>
              <div>
                <div
                  style={{
                    fontFamily: F.heading,
                    fontSize: 10.5,
                    fontWeight: 800,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: socialModalProvider === 'facebook' ? '#1877F2' : C.red,
                  }}
                >
                  Acceso Rápido Verificado
                </div>
                <h4
                  style={{
                    fontFamily: F.heading,
                    fontSize: 18,
                    fontWeight: 900,
                    color: C.navy,
                    margin: 0,
                  }}
                >
                  Continuar con {socialModalProvider === 'facebook' ? 'Facebook' : 'Google'}
                </h4>
              </div>
            </div>

            <p
              style={{
                fontSize: 13,
                color: C.gray,
                lineHeight: 1.5,
                margin: '0 0 18px',
              }}
            >
              Confirma el correo de tu cuenta de{' '}
              <strong>{socialModalProvider === 'facebook' ? 'Facebook' : 'Google'}</strong> para
              vincular tu perfil y sincronizar tus pedidos automáticamente.
            </p>

            <form
              onSubmit={handleSocialModalSubmit}
              style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
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
                  value={socialForm.nombre}
                  onChange={(e) =>
                    setSocialForm((prev) => ({ ...prev, nombre: e.target.value }))
                  }
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
                  Correo de {socialModalProvider === 'facebook' ? 'Facebook' : 'Google'} *
                </label>
                <input
                  type="email"
                  required
                  autoFocus
                  value={socialForm.correo}
                  onChange={(e) =>
                    setSocialForm((prev) => ({ ...prev, correo: e.target.value }))
                  }
                  placeholder={
                    socialModalProvider === 'facebook'
                      ? 'tucorreo@ejemplo.com'
                      : 'tucorreo@gmail.com'
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

              <div
                style={{
                  display: 'flex',
                  gap: 10,
                  marginTop: 8,
                }}
              >
                <button
                  type="button"
                  onClick={() => setSocialModalProvider(null)}
                  disabled={socialSubmitting}
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
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={socialSubmitting}
                  style={{
                    flex: 1,
                    padding: '12px 18px',
                    borderRadius: 12,
                    border: 'none',
                    background:
                      socialModalProvider === 'facebook' ? '#1877F2' : C.navy,
                    color: '#FFFFFF',
                    fontFamily: F.heading,
                    fontSize: 12,
                    fontWeight: 800,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    cursor: socialSubmitting ? 'wait' : 'pointer',
                  }}
                >
                  {socialSubmitting
                    ? 'Vinculando cuenta...'
                    : `Entrar con ${socialModalProvider === 'facebook' ? 'Facebook' : 'Google'}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TiendaUserSection({ isStandalonePage = false }) {
  return (
    <section
      id="seccion-usuario"
      style={{
        padding: isStandalonePage ? '128px 24px 96px' : '96px 24px',
        background: '#F8F9FA',
        minHeight: isStandalonePage ? '100vh' : undefined,
      }}
    >
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        {isStandalonePage && (
          <div style={{ marginBottom: 24 }}>
            <Link
              to="/landing-tienda-preview"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                fontFamily: F.heading,
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: C.navy,
                textDecoration: 'none',
                padding: '9px 18px',
                borderRadius: 9999,
                background: '#FFFFFF',
                border: '1px solid rgba(26, 31, 54, 0.08)',
                boxShadow: '0 4px 14px rgba(26, 31, 54, 0.03)',
              }}
            >
              <ArrowLeft size={14} color={C.red} /> Volver a la Tienda
            </Link>
          </div>
        )}

        <div style={{ marginBottom: 36 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 14px',
              borderRadius: 9999,
              background: C.white,
              border: '1px solid rgba(26, 31, 54, 0.08)',
              marginBottom: 12,
            }}
          >
            <User size={13} color={C.red} />
            <span
              style={{
                fontFamily: F.heading,
                fontSize: 10.5,
                fontWeight: 800,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: C.navy,
              }}
            >
              Área de Cliente Jasman
            </span>
          </div>
          <h2
            style={{
              fontFamily: F.heading,
              fontSize: 'clamp(1.85rem, 3.2vw, 2.6rem)',
              fontWeight: 900,
              color: C.navy,
              letterSpacing: '-0.03em',
              margin: '0 0 8px',
            }}
          >
            Mi Cuenta, Pedidos y Beneficios
          </h2>
          <p style={{ fontSize: 14.5, color: C.gray, margin: 0, maxWidth: 620 }}>
            Inicia sesión con Google, Facebook o tu correo electrónico para gestionar tus
            órdenes de compra, elegir tu sucursal Jasman preferida y aplicar tus descuentos.
          </p>
        </div>

        <UserAccountWorkspace />
      </div>

      <style>{`
        @media (max-width: 860px) {
          .tienda-user-grid {
            grid-template-columns: 1fr !important;
          }
          .tienda-user-form-row,
          .tienda-social-auth-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}

export function TiendaUserDrawer() {
  return null;
}
