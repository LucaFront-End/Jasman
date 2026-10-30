import { useState, useEffect } from 'react';
import { C, F } from '../../hooks/useAnimations';
import { formatMXN } from '../../data/productosMasterData';
import { sucursales } from '../../data/sucursalesData';
import { useTiendaState, triggerTiendaUI } from '../../hooks/useTiendaState';
import {
  WIX_CLIENT_ID,
  loginWixMember,
  registerWixMember,
  startWixOAuthRedirect,
  completeWixOAuthCallbackIfPresent,
  sendWixPasswordReset,
  fetchWixMemberProfileAndOrders,
  isWixMemberLoggedIn,
} from '../../services/wixService';
import {
  User,
  Package,
  MapPin,
  Tag,
  LogOut,
  Check,
  X,
  Sparkles,
  Lock,
  Mail,
  RefreshCw,
  ShieldCheck,
  ExternalLink,
  KeyRound,
} from 'lucide-react';

function UserAccountWorkspace({ compact = false }) {
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
  const [syncingOrders, setSyncingOrders] = useState(false);
  const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error' | 'info', text: '' }

  // Complete Wix OAuth PKCE redirect callback if returning from Wix login
  useEffect(() => {
    completeWixOAuthCallbackIfPresent().then((tokens) => {
      if (tokens) {
        setFeedback({
          type: 'success',
          text: 'Sesión OAuth de Wix Members vinculada correctamente.',
        });
      }
    });
  }, []);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setFeedback(null);

    if (!form.correo.trim()) {
      setFeedback({ type: 'error', text: 'Ingresa tu correo electrónico de Wix Members.' });
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
            text: res.message || 'No fue posible iniciar sesión en Wix Members.',
          });
          setLoading(false);
          return;
        }

        saveUser(res.member);
        if (res.member.sucursalPreferida) {
          setSelectedBranch(res.member.sucursalPreferida);
        }
        if (res.orders && res.orders.length > 0) {
          mergeSyncedOrders(res.orders);
        }

        setFeedback({
          type: 'success',
          text: '¡Bienvenido! Tu cuenta de Wix Members está conectada y sincronizada.',
        });
      } else {
        // Register new Wix Member or update existing profile
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
        });

        if (!res.success) {
          setFeedback({
            type: 'error',
            text: res.message || 'Aviso al registrar miembro en Wix.',
          });
          setLoading(false);
          return;
        }

        saveUser(res.member);
        setSelectedBranch(form.sucursalPreferida);

        // Also pull any existing orders for this email
        const { orders: remoteOrders } = await fetchWixMemberProfileAndOrders(form.correo);
        if (remoteOrders && remoteOrders.length > 0) {
          mergeSyncedOrders(remoteOrders);
        }

        setFeedback({
          type: 'success',
          text: user
            ? 'Perfil actualizado y sincronizado con Wix Members & CMS.'
            : 'Cuenta creada y vinculada con Wix Members.',
        });
      }
    } catch {
      setFeedback({
        type: 'error',
        text: 'Ocurrió un error al conectar con Wix Headless.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!form.correo.trim()) {
      setFeedback({
        type: 'info',
        text: 'Escribe tu correo electrónico arriba para enviarte el enlace de recuperación de Wix Members.',
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

  const handleOAuthRedirect = async () => {
    setFeedback({
      type: 'info',
      text: 'Conectando con el portal de autorización de Wix Members OAuth...',
    });
    const res = await startWixOAuthRedirect(window.location.pathname);
    if (!res.success && res.message) {
      setFeedback({ type: 'info', text: res.message });
    }
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
        text: `Sincronización con Wix Members completada (${remoteOrders?.length || 0} pedidos en la nube).`,
      });
    } finally {
      setSyncingOrders(false);
    }
  };

  const selectedBranch =
    sucursales.find((s) => s.slug === selectedBranchSlug) || sucursales[0];

  const hasNativeToken = isWixMemberLoggedIn() || Boolean(user?.hasMemberTokens);

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: compact ? '1fr' : '290px 1fr',
        gap: 24,
        alignItems: 'start',
      }}
      className="tienda-user-grid"
    >
      {/* Left Navigation / Wix Member Status Card */}
      <div
        style={{
          background: C.white,
          borderRadius: 24,
          border: `1px solid ${C.border}`,
          padding: 22,
          boxShadow: '0 10px 30px rgba(26, 31, 54, 0.04)',
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
              width: 46,
              height: 46,
              borderRadius: '50%',
              background: user ? C.red : C.navy,
              color: C.white,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: F.heading,
              fontSize: 16,
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
                fontSize: 14,
                fontWeight: 800,
                color: C.navy,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {user ? user.nombre : 'Wix Members'}
            </div>
            <div
              style={{
                fontSize: 11.5,
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

        {/* Wix Headless Connection Status Pill */}
        <div
          style={{
            padding: '10px 12px',
            borderRadius: 14,
            background: user ? 'rgba(22, 163, 74, 0.07)' : '#F8FAFC',
            border: user
              ? '1px solid rgba(22, 163, 74, 0.22)'
              : '1px solid rgba(26, 31, 54, 0.07)',
            marginBottom: 14,
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
                fontSize: 9.5,
                fontWeight: 800,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: user ? '#15803D' : C.navy,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              <ShieldCheck size={13} color={user ? '#16A34A' : C.red} />
              {user ? 'Wix Members Activo' : 'Wix Headless OAuth'}
            </span>
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: user ? '#16A34A' : '#F59E0B',
              }}
            />
          </div>
          <div style={{ fontSize: 10.5, color: '#64748B', marginTop: 4, lineHeight: 1.4 }}>
            {user ? (
              <>
                ID: <strong>{String(user.wixMemberId || 'wix-member').slice(0, 14)}</strong>
                {hasNativeToken ? ' · Token OAuth' : ' · Sincronizado CMS'}
              </>
            ) : (
              <>Client ID: {WIX_CLIENT_ID.slice(0, 8)}… conectado</>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[
            { id: 'perfil', label: user ? 'Mi Perfil Wix' : 'Acceso Wix Members', icon: User },
            { id: 'pedidos', label: `Mis Pedidos (${orders.length})`, icon: Package },
            { id: 'beneficios', label: 'Cupones & Sucursal', icon: Tag },
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
                  padding: '11px 14px',
                  borderRadius: 12,
                  border: 'none',
                  background: active ? '#FFF1F2' : 'transparent',
                  color: active ? C.red : C.navy,
                  fontFamily: F.heading,
                  fontSize: 12,
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
                  marginTop: 4,
                  borderRadius: 12,
                  border: '1px solid rgba(26, 31, 54, 0.08)',
                  background: '#F8FAFC',
                  color: C.navy,
                  fontFamily: F.heading,
                  fontSize: 11,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  cursor: 'pointer',
                }}
              >
                <RefreshCw size={13} className={syncingOrders ? 'wix-spin' : ''} />
                <span>{syncingOrders ? 'Sincronizando...' : 'Sincronizar con Wix'}</span>
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
                    text: 'Sesión de Wix Members cerrada correctamente.',
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
                <span>Cerrar sesión Wix</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Right Content Panel */}
      <div
        style={{
          background: C.white,
          borderRadius: 24,
          border: `1px solid ${C.border}`,
          padding: compact ? 22 : 30,
          boxShadow: '0 10px 30px rgba(26, 31, 54, 0.04)',
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
                  Wix Members · Headless Identity
                </span>
                <h3
                  style={{
                    fontFamily: F.heading,
                    fontSize: 20,
                    fontWeight: 900,
                    color: C.navy,
                    margin: '4px 0 0',
                  }}
                >
                  {user
                    ? 'Tu Perfil de Miembro Wix'
                    : authMode === 'login'
                    ? 'Iniciar Sesión con Wix Members'
                    : 'Crear Cuenta en Wix Members'}
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
                      padding: '7px 14px',
                      borderRadius: 9999,
                      border: 'none',
                      background: authMode === 'login' ? C.navy : 'transparent',
                      color: authMode === 'login' ? '#FFFFFF' : '#64748B',
                      fontFamily: F.heading,
                      fontSize: 11,
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
                      padding: '7px 14px',
                      borderRadius: 9999,
                      border: 'none',
                      background: authMode === 'register' ? C.red : 'transparent',
                      color: authMode === 'register' ? '#FFFFFF' : '#64748B',
                      fontFamily: F.heading,
                      fontSize: 11,
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    Crear Cuenta
                  </button>
                </div>
              )}
            </div>

            <p style={{ fontSize: 13, color: C.gray, margin: '0 0 20px', lineHeight: 1.5 }}>
              {user
                ? 'Tus datos, sucursal preferida y pedidos están sincronizados con Wix Members y el CMS de Jasman Automotriz.'
                : authMode === 'login'
                ? 'Accede con tu correo y contraseña de miembro Wix para recuperar tu historial de pedidos, medidas guardadas y beneficios.'
                : 'Regístrate en Wix Members para guardar tus pedidos, agilizar tu instalación en sucursal y activar descuentos exclusivos.'}
            </p>

            <form
              onSubmit={handleAuthSubmit}
              style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
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

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    compact || (authMode === 'login' && !user) ? '1fr' : '1fr 1fr',
                  gap: 14,
                }}
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
                    <Mail size={12} color={C.red} /> Correo Wix Members *
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
                            fontSize: 9.5,
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
                          : 'Tu contraseña de Wix Members'
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
                      Teléfono WhatsApp
                    </label>
                    <input
                      type="tel"
                      value={form.telefono}
                      onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                      placeholder="55 1234 5678"
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
                      padding: '12px 14px',
                      borderRadius: 12,
                      border: `1px solid ${C.border}`,
                      fontFamily: F.body,
                      fontSize: 13.5,
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
                    padding: '11px 14px',
                    borderRadius: 12,
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
                    fontSize: 12,
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
                  gap: 10,
                  marginTop: 4,
                }}
              >
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: '13px 22px',
                    borderRadius: 12,
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
                      ? 'Conectando con Wix...'
                      : user
                      ? 'Guardar y Sincronizar en Wix'
                      : authMode === 'login'
                      ? 'Iniciar Sesión Wix Members'
                      : 'Registrar en Wix Members'}
                  </span>
                </button>

                {!user && (
                  <button
                    type="button"
                    onClick={handleOAuthRedirect}
                    style={{
                      padding: '13px 18px',
                      borderRadius: 12,
                      border: '1px solid rgba(26, 31, 54, 0.12)',
                      background: '#F8FAFC',
                      color: C.navy,
                      fontFamily: F.heading,
                      fontSize: 11.5,
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 7,
                    }}
                  >
                    <ExternalLink size={13} color={C.red} />
                    <span>Acceso OAuth Wix SSO</span>
                  </button>
                )}
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
                  Historial de Pedidos Wix Members
                </h3>
                <p style={{ fontSize: 13, color: C.gray, margin: 0 }}>
                  Órdenes vinculadas a tu cuenta de miembro y sucursal seleccionada.
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
                  <RefreshCw size={12} /> Actualizar desde Wix CMS
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
              Mis Beneficios Wix Members & Sucursal
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
    </div>
  );
}

export default function TiendaUserSection() {
  return (
    <section
      id="seccion-usuario"
      style={{
        padding: '84px 24px',
        background: '#F4F5F8',
        borderTop: `1px solid ${C.border}`,
      }}
    >
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ marginBottom: 32 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 14px',
              borderRadius: 9999,
              background: C.white,
              border: `1px solid ${C.border}`,
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
              Área de Cliente · Wix Members Conectado
            </span>
          </div>
          <h2
            style={{
              fontFamily: F.heading,
              fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
              fontWeight: 900,
              color: C.navy,
              letterSpacing: '-0.025em',
              margin: '0 0 8px',
            }}
          >
            Tu Cuenta, Pedidos y Beneficios Wix Members
          </h2>
          <p style={{ fontSize: 14.5, color: C.gray, margin: 0, maxWidth: 640 }}>
            Inicia sesión o regístrate con Wix Members para sincronizar tus órdenes de compra,
            sucursal Jasman preferida y cupones activos.
          </p>
        </div>

        <UserAccountWorkspace compact={false} />
      </div>

      <style>{`
        @media (max-width: 860px) {
          .tienda-user-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}

export function TiendaUserDrawer() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleUI = (e) => {
      if (e.detail?.type === 'OPEN_USER') {
        setOpen(true);
      }
    };
    window.addEventListener('jasman-tienda-ui', handleUI);
    return () => window.removeEventListener('jasman-tienda-ui', handleUI);
  }, []);

  if (!open) return null;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) setOpen(false);
      }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9998,
        background: 'rgba(13, 16, 28, 0.58)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        justifyContent: 'flex-end',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 540,
          height: '100%',
          background: '#F4F5F8',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-24px 0 60px rgba(0,0,0,0.22)',
        }}
      >
        <div
          style={{
            padding: '20px 24px',
            background: C.white,
            borderBottom: `1px solid ${C.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <User size={18} color={C.red} />
            <span
              style={{
                fontFamily: F.heading,
                fontSize: 15,
                fontWeight: 800,
                color: C.navy,
              }}
            >
              Mi Cuenta · Wix Members
            </span>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              border: `1px solid ${C.border}`,
              background: C.white,
              color: C.navy,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <X size={16} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
          <UserAccountWorkspace compact={true} />
        </div>
      </div>
    </div>
  );
}
