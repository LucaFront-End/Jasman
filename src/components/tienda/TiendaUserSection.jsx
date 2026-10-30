import { useState, useEffect } from 'react';
import { C, F } from '../../hooks/useAnimations';
import { formatMXN } from '../../data/productosMasterData';
import { sucursales } from '../../data/sucursalesData';
import { useTiendaState, triggerTiendaUI } from '../../hooks/useTiendaState';
import {
  loginWixMember,
  registerWixMember,
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
} from 'lucide-react';

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
  const [syncingOrders, setSyncingOrders] = useState(false);
  const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error' | 'info', text: '' }

  useEffect(() => {
    completeWixOAuthCallbackIfPresent().then((tokens) => {
      if (tokens) {
        setFeedback({
          type: 'success',
          text: 'Tu sesión se ha vinculado correctamente.',
        });
      }
    });
  }, []);

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
            { id: 'perfil', label: user ? 'Mis Datos Personales' : 'Iniciar Sesión / Registro', icon: User },
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
                ? 'Accede con tu correo y contraseña para consultar el estado de tus pedidos, citas de montaje y cupones disponibles.'
                : 'Regístrate para dar seguimiento a tus compras en línea, elegir tu sucursal Jasman preferida y activar descuentos exclusivos.'}
            </p>

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
    </div>
  );
}

export default function TiendaUserSection() {
  return (
    <section
      id="seccion-usuario"
      style={{
        padding: '96px 24px',
        background: '#F8F9FA',
        borderTop: '1px solid rgba(26, 31, 54, 0.07)',
      }}
    >
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
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
            Inicia sesión o crea tu cuenta para gestionar tus órdenes de compra, elegir tu
            sucursal Jasman preferida y aplicar tus descuentos activos.
          </p>
        </div>

        <UserAccountWorkspace />
      </div>

      <style>{`
        @media (max-width: 860px) {
          .tienda-user-grid {
            grid-template-columns: 1fr !important;
          }
          .tienda-user-form-row {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}

// Legacy export kept as null so no sidebar is ever rendered
export function TiendaUserDrawer() {
  return null;
}
