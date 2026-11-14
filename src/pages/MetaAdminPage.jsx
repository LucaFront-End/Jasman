import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Code2,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  LogOut,
  RefreshCw,
  Save,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { C, F } from '../hooks/useAnimations';
import {
  completeWixOAuthCallbackIfPresent,
  sendWixPasswordReset,
  startWixSocialLogin,
} from '../services/wixService';
import {
  AUTHORIZED_META_ADMIN_EMAIL,
  DEFAULT_TRACKING_CONFIG,
  fetchPublicTrackingConfig,
  loginStrictMetaAdmin,
  logoutMetaAdmin,
  normalizeTrackingConfig,
  normalizeTrackingEmail,
  saveTrackingConfig,
  verifyMetaAdminSession,
} from '../services/trackingService';

function hasUnbalancedScriptTags(code) {
  const text = String(code || '');
  if (!text.trim()) return false;
  const openCount = (text.match(/<script\b/gi) || []).length;
  const closeCount = (text.match(/<\/script>/gi) || []).length;
  return openCount !== closeCount;
}

function extractPixelIdFromSnippet(snippet) {
  const text = String(snippet || '');
  const initMatch = text.match(/fbq\(\s*['"]init['"]\s*,\s*['"](\d{8,24})['"]/i);
  if (initMatch?.[1]) return initMatch[1];
  const imgMatch = text.match(/facebook\.com\/tr\?id=(\d{8,24})/i);
  if (imgMatch?.[1]) return imgMatch[1];
  return '';
}

function ToggleSwitch({ checked, onChange, label, description, id }) {
  return (
    <label
      htmlFor={id}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        padding: '14px 16px',
        borderRadius: 12,
        border: `1px solid ${checked ? 'rgba(16, 185, 129, 0.35)' : C.border}`,
        background: checked ? 'rgba(16, 185, 129, 0.06)' : '#F8FAFC',
        cursor: 'pointer',
      }}
    >
      <div>
        <div
          style={{
            fontFamily: F.heading,
            fontSize: 14,
            fontWeight: 700,
            color: C.navy,
          }}
        >
          {label}
        </div>
        {description && (
          <div style={{ fontSize: 12, color: C.gray, marginTop: 2 }}>
            {description}
          </div>
        )}
      </div>
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          style={{
            position: 'absolute',
            opacity: 0,
            width: 48,
            height: 26,
            cursor: 'pointer',
            margin: 0,
          }}
        />
        <span
          aria-hidden="true"
          style={{
            display: 'block',
            width: 48,
            height: 26,
            borderRadius: 999,
            background: checked ? '#10B981' : '#CBD5E1',
            transition: 'background 0.2s ease',
            position: 'relative',
          }}
        >
          <span
            style={{
              position: 'absolute',
              top: 3,
              left: checked ? 25 : 3,
              width: 20,
              height: 20,
              borderRadius: '50%',
              background: '#FFFFFF',
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
              transition: 'left 0.2s ease',
            }}
          />
        </span>
      </div>
    </label>
  );
}

export default function MetaAdminPage() {
  const [checkingSession, setCheckingSession] = useState(true);
  const [session, setSession] = useState({
    authorized: false,
    status: 'unauthenticated',
    email: '',
    member: null,
    message: '',
  });

  const [emailInput, setEmailInput] = useState(AUTHORIZED_META_ADMIN_EMAIL);
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [authFeedback, setAuthFeedback] = useState(null);

  const [config, setConfig] = useState({ ...DEFAULT_TRACKING_CONFIG });
  const [configSource, setConfigSource] = useState('cargando');
  const [loadingConfig, setLoadingConfig] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState(null);

  const loadConfig = useCallback(async () => {
    setLoadingConfig(true);
    try {
      const res = await fetchPublicTrackingConfig();
      if (res?.config) {
        setConfig(normalizeTrackingConfig(res.config));
        setConfigSource(res.source || 'wix-cms');
      }
    } finally {
      setLoadingConfig(false);
    }
  }, []);

  const refreshAuthAndConfig = useCallback(async () => {
    setCheckingSession(true);
    try {
      await completeWixOAuthCallbackIfPresent();
      const verified = await verifyMetaAdminSession();
      setSession(verified);
      if (verified.authorized) {
        await loadConfig();
      }
    } finally {
      setCheckingSession(false);
    }
  }, [loadConfig]);

  useEffect(() => {
    refreshAuthAndConfig();
  }, [refreshAuthAndConfig]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setAuthFeedback(null);
    setAuthLoading(true);
    try {
      const result = await loginStrictMetaAdmin({
        email: emailInput,
        password: passwordInput,
      });

      if (!result.success) {
        setAuthFeedback({
          type: 'error',
          text: result.message || 'No fue posible iniciar sesión.',
        });
        return;
      }

      setPasswordInput('');
      await refreshAuthAndConfig();
    } finally {
      setAuthLoading(false);
    }
  };

  const handleOAuthLogin = async () => {
    setAuthFeedback(null);
    setOauthLoading(true);
    try {
      const res = await startWixSocialLogin('google', '/admin-meta');
      if (!res?.success) {
        setOauthLoading(false);
        setAuthFeedback({
          type: 'info',
          text:
            'El inicio con Google/Wix OAuth redirige al dominio autorizado (jasman.com.mx / jasman-delta.vercel.app). En local usa tu contraseña de Wix o solicita el enlace de contraseña.',
        });
      }
    } catch {
      setOauthLoading(false);
      setAuthFeedback({
        type: 'error',
        text: 'No se pudo iniciar la redirección de Google/Wix OAuth.',
      });
    }
  };

  const handlePasswordReset = async () => {
    const clean = normalizeTrackingEmail(emailInput || AUTHORIZED_META_ADMIN_EMAIL);
    if (clean !== AUTHORIZED_META_ADMIN_EMAIL) {
      setAuthFeedback({
        type: 'error',
        text: `El restablecimiento en esta sección solo está permitido para ${AUTHORIZED_META_ADMIN_EMAIL}.`,
      });
      return;
    }
    setAuthLoading(true);
    try {
      const res = await sendWixPasswordReset(AUTHORIZED_META_ADMIN_EMAIL);
      setAuthFeedback({
        type: res.success ? 'success' : 'info',
        text: res.message,
      });
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await logoutMetaAdmin();
    setSession({
      authorized: false,
      status: 'unauthenticated',
      email: '',
      member: null,
      message: `Sesión cerrada. Ingresa con ${AUTHORIZED_META_ADMIN_EMAIL}.`,
    });
    setAuthFeedback(null);
    setSaveFeedback(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaveFeedback(null);
    setSaving(true);
    try {
      const result = await saveTrackingConfig(config);
      if (!result.success) {
        setSaveFeedback({
          type: 'error',
          text: result.message || 'No se pudo guardar la configuración.',
        });
        if (result.status === 401 || result.status === 403) {
          await refreshAuthAndConfig();
        }
        return;
      }

      if (result.config) {
        setConfig(normalizeTrackingConfig(result.config));
        setConfigSource('wix-cms');
      }
      setSaveFeedback({
        type: 'success',
        text: 'Configuración publicada en Wix CMS (ConfiguracionMeta) y aplicada globalmente en todo el sitio.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAutoExtractPixelId = () => {
    const found =
      extractPixelIdFromSnippet(config.metaCustomCode) ||
      extractPixelIdFromSnippet(config.customHeadCode);
    if (!found) {
      setSaveFeedback({
        type: 'info',
        text: 'No se detectó un ID numérico de Pixel (fbq(\'init\', \'...\')) en los snippets actuales.',
      });
      return;
    }
    setConfig((prev) => ({
      ...prev,
      metaPixelId: found,
      metaEnabled: true,
    }));
    setSaveFeedback({
      type: 'success',
      text: `Pixel ID detectado y cargado: ${found}. Presiona "Guardar y Publicar" para aplicarlo.`,
    });
  };

  const handleTestPageView = () => {
    if (typeof window === 'undefined' || typeof window.fbq !== 'function') {
      setSaveFeedback({
        type: 'info',
        text: 'window.fbq aún no está activo. Activa Meta Pixel con tu Pixel ID y guarda primero.',
      });
      return;
    }
    window.fbq('track', 'PageView');
    setSaveFeedback({
      type: 'success',
      text: `Evento de prueba fbq('track', 'PageView') enviado correctamente (Pixel ${config.metaPixelId || 'activo'}).`,
    });
  };

  const scriptWarnings = useMemo(() => {
    const warnings = [];
    if (hasUnbalancedScriptTags(config.metaCustomCode)) {
      warnings.push('El bloque de código adicional de Meta tiene etiquetas <script> sin cerrar.');
    }
    if (hasUnbalancedScriptTags(config.customHeadCode)) {
      warnings.push('El bloque de código para <head> tiene etiquetas <script> sin cerrar.');
    }
    if (hasUnbalancedScriptTags(config.customBodyCode)) {
      warnings.push('El bloque de código para <body> tiene etiquetas <script> sin cerrar.');
    }
    return warnings;
  }, [config.metaCustomCode, config.customHeadCode, config.customBodyCode]);

  const fbqLive =
    typeof window !== 'undefined' && typeof window.fbq === 'function';

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #F8FAFC 0%, #EFF4FA 100%)',
        paddingTop: 36,
        paddingBottom: 72,
        fontFamily: F.body,
      }}
    >
      <div style={{ maxWidth: 980, margin: '0 auto', padding: '0 20px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
            marginBottom: 20,
          }}
        >
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              color: C.navy,
              fontSize: 13,
              fontWeight: 600,
              textDecoration: 'none',
              padding: '8px 14px',
              borderRadius: 999,
              background: '#FFFFFF',
              border: `1px solid ${C.border}`,
            }}
          >
            <ArrowLeft size={15} />
            Volver al sitio
          </Link>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '7px 14px',
              borderRadius: 999,
              background: '#0F172A',
              color: '#F8FAFC',
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            <Lock size={13} color="#38BDF8" />
            Acceso exclusivo: {AUTHORIZED_META_ADMIN_EMAIL}
          </div>
        </div>

        {/* Hero / Header Card */}
        <div
          style={{
            background: '#0F172A',
            color: '#FFFFFF',
            borderRadius: 20,
            padding: '28px 28px',
            marginBottom: 24,
            boxShadow: '0 18px 40px rgba(15, 23, 42, 0.14)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16,
            }}
          >
            <div>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: '#38BDF8',
                  marginBottom: 8,
                }}
              >
                <ShieldCheck size={14} />
                Consola Wix Partner · Meta &amp; Tracking Global
              </span>
              <h1
                style={{
                  fontFamily: F.heading,
                  fontSize: 'clamp(1.35rem, 2.5vw, 1.85rem)',
                  fontWeight: 800,
                  margin: 0,
                  color: '#FFFFFF',
                }}
              >
                Administrador de Meta Pixel y Código Global
              </h1>
              <p
                style={{
                  margin: '8px 0 0',
                  fontSize: 13.5,
                  color: '#CBD5E1',
                  maxWidth: 640,
                  lineHeight: 1.55,
                }}
              >
                Administra tu Pixel de Facebook (Meta), eventos globales y scripts personalizados
                de <code style={{ color: '#93C5FD' }}>&lt;head&gt;</code> o{' '}
                <code style={{ color: '#93C5FD' }}>&lt;body&gt;</code> sincronizados en Wix CMS
                para todo el sitio.
              </p>
            </div>

            {session.authorized && session.member && (
              <div
                style={{
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 14,
                  padding: '12px 16px',
                  minWidth: 240,
                }}
              >
                <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600 }}>
                  SESIÓN VERIFICADA EN WIX
                </div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: '#FFFFFF',
                    marginTop: 2,
                  }}
                >
                  {session.member.name}
                </div>
                <div style={{ fontSize: 12, color: '#38BDF8', marginTop: 1 }}>
                  {session.member.email}
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  style={{
                    marginTop: 10,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 12px',
                    borderRadius: 8,
                    border: '1px solid rgba(255,255,255,0.2)',
                    background: 'transparent',
                    color: '#F8FAFC',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <LogOut size={13} />
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Loading session check */}
        {checkingSession && (
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 16,
              padding: 36,
              textAlign: 'center',
              border: `1px solid ${C.border}`,
              color: C.gray,
              fontSize: 14,
            }}
          >
            Verificando rol autorizado en Wix Members...
          </div>
        )}

        {/* Auth Gate (Shown when unauthenticated or unauthorized account) */}
        {!checkingSession && !session.authorized && (
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 20,
              padding: '32px 28px',
              border: `1px solid ${C.border}`,
              boxShadow: '0 10px 30px rgba(15, 23, 42, 0.06)',
              maxWidth: 540,
              margin: '0 auto',
            }}
          >
            {session.status === 'forbidden' ? (
              <div
                style={{
                  background: '#FEF2F2',
                  border: '1px solid #FECACA',
                  borderRadius: 14,
                  padding: 18,
                  marginBottom: 22,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    color: '#991B1B',
                    fontFamily: F.heading,
                    fontWeight: 800,
                    fontSize: 15,
                  }}
                >
                  <ShieldAlert size={20} />
                  Acceso Denegado · Rol No Autorizado
                </div>
                <p style={{ fontSize: 13, color: '#7F1D1D', margin: '8px 0 14px', lineHeight: 1.5 }}>
                  La sesión actual ({session.email || 'otra cuenta'}) no corresponde al rol
                  autorizado en Wix. Solo <strong>{AUTHORIZED_META_ADMIN_EMAIL}</strong> puede
                  modificar el código de Meta y scripts globales.
                </p>
                <button
                  type="button"
                  onClick={handleLogout}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '9px 16px',
                    borderRadius: 10,
                    border: 'none',
                    background: C.red,
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: 'pointer',
                  }}
                >
                  <LogOut size={14} />
                  Cerrar sesión actual e ingresar con Wix Partner
                </button>
              </div>
            ) : (
              <div style={{ marginBottom: 20 }}>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '6px 12px',
                    borderRadius: 999,
                    background: '#EFF6FF',
                    color: '#1D4ED8',
                    fontSize: 12,
                    fontWeight: 700,
                    marginBottom: 10,
                  }}
                >
                  <KeyRound size={14} />
                  Autenticación Wix Requerida
                </div>
                <h2
                  style={{
                    fontFamily: F.heading,
                    fontSize: 20,
                    fontWeight: 800,
                    margin: 0,
                    color: C.navy,
                  }}
                >
                  Inicia sesión con tu cuenta de Wix Partner
                </h2>
                <p style={{ fontSize: 13.5, color: C.gray, marginTop: 6, lineHeight: 1.5 }}>
                  Ingresa las credenciales de Wix asociadas a{' '}
                  <strong style={{ color: C.navy }}>{AUTHORIZED_META_ADMIN_EMAIL}</strong>.
                </p>
              </div>
            )}

            {authFeedback && (
              <div
                style={{
                  marginBottom: 18,
                  padding: '12px 14px',
                  borderRadius: 12,
                  fontSize: 13,
                  lineHeight: 1.5,
                  background:
                    authFeedback.type === 'error'
                      ? '#FEF2F2'
                      : authFeedback.type === 'success'
                        ? '#ECFDF5'
                        : '#EFF6FF',
                  color:
                    authFeedback.type === 'error'
                      ? '#991B1B'
                      : authFeedback.type === 'success'
                        ? '#065F46'
                        : '#1E40AF',
                  border: `1px solid ${
                    authFeedback.type === 'error'
                      ? '#FECACA'
                      : authFeedback.type === 'success'
                        ? '#A7F3D0'
                        : '#BFDBFE'
                  }`,
                }}
              >
                {authFeedback.text}
              </div>
            )}

            <form onSubmit={handleLoginSubmit} style={{ display: 'grid', gap: 14 }}>
              <div>
                <label
                  htmlFor="meta-admin-email"
                  style={{
                    display: 'block',
                    fontSize: 12.5,
                    fontWeight: 700,
                    color: C.navy,
                    marginBottom: 6,
                  }}
                >
                  Usuario / Correo autorizado en Wix
                </label>
                <input
                  id="meta-admin-email"
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder={AUTHORIZED_META_ADMIN_EMAIL}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '11px 14px',
                    borderRadius: 10,
                    border: `1px solid ${C.border}`,
                    fontSize: 14,
                    color: C.navy,
                    background: '#F8FAFC',
                  }}
                />
              </div>

              <div>
                <label
                  htmlFor="meta-admin-password"
                  style={{
                    display: 'block',
                    fontSize: 12.5,
                    fontWeight: 700,
                    color: C.navy,
                    marginBottom: 6,
                  }}
                >
                  Contraseña de Wix
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="meta-admin-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Ingresa tu contraseña de Wix"
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '11px 42px 11px 14px',
                      borderRadius: 10,
                      border: `1px solid ${C.border}`,
                      fontSize: 14,
                      color: C.navy,
                      background: '#FFFFFF',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                    style={{
                      position: 'absolute',
                      right: 10,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: C.gray,
                      cursor: 'pointer',
                      padding: 4,
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={authLoading}
                style={{
                  width: '100%',
                  padding: '12px 18px',
                  borderRadius: 12,
                  border: 'none',
                  background: C.red,
                  color: '#FFFFFF',
                  fontFamily: F.heading,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: authLoading ? 'wait' : 'pointer',
                  opacity: authLoading ? 0.75 : 1,
                }}
              >
                {authLoading ? 'Verificando acceso en Wix...' : 'Entrar al Administrador'}
              </button>
            </form>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                margin: '18px 0',
                color: '#94A3B8',
                fontSize: 12,
              }}
            >
              <span style={{ flex: 1, height: 1, background: C.border }} />
              o acceso con Wix OAuth
              <span style={{ flex: 1, height: 1, background: C.border }} />
            </div>

            <div style={{ display: 'grid', gap: 10 }}>
              <button
                type="button"
                onClick={handleOAuthLogin}
                disabled={oauthLoading}
                style={{
                  width: '100%',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  padding: '11px 16px',
                  borderRadius: 12,
                  border: `1px solid ${C.border}`,
                  background: '#FFFFFF',
                  color: C.navy,
                  fontSize: 13.5,
                  fontWeight: 700,
                  cursor: oauthLoading ? 'wait' : 'pointer',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
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
                {oauthLoading ? 'Redirigiendo a Wix / Google...' : 'Continuar con Google (Wix)'}
              </button>

              <button
                type="button"
                onClick={handlePasswordReset}
                disabled={authLoading}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#2563EB',
                  fontSize: 12.5,
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: '6px 4px',
                  textAlign: 'center',
                }}
              >
                ¿Primera vez con contraseña o la olvidaste? Enviar enlace a {AUTHORIZED_META_ADMIN_EMAIL}
              </button>
            </div>
          </div>
        )}

        {/* Authorized Editor Console */}
        {!checkingSession && session.authorized && (
          <form onSubmit={handleSave} style={{ display: 'grid', gap: 22 }}>
            {/* Runtime Diagnostic Strip */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
                gap: 12,
              }}
            >
              <div
                style={{
                  background: '#FFFFFF',
                  border: `1px solid ${C.border}`,
                  borderRadius: 14,
                  padding: '14px 16px',
                }}
              >
                <div style={{ fontSize: 11.5, color: C.gray, fontWeight: 600 }}>
                  Estado Meta Pixel
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    marginTop: 4,
                    fontFamily: F.heading,
                    fontWeight: 800,
                    fontSize: 15,
                    color: config.metaEnabled && config.metaPixelId ? '#059669' : '#64748B',
                  }}
                >
                  <Activity size={16} />
                  {config.metaEnabled && config.metaPixelId
                    ? `Activo (${config.metaPixelId})`
                    : 'Desactivado'}
                </div>
              </div>

              <div
                style={{
                  background: '#FFFFFF',
                  border: `1px solid ${C.border}`,
                  borderRadius: 14,
                  padding: '14px 16px',
                }}
              >
                <div style={{ fontSize: 11.5, color: C.gray, fontWeight: 600 }}>
                  SDK Meta en Navegador (fbq)
                </div>
                <div
                  style={{
                    marginTop: 4,
                    fontFamily: F.heading,
                    fontWeight: 800,
                    fontSize: 15,
                    color: fbqLive ? '#059669' : '#64748B',
                  }}
                >
                  {fbqLive ? 'Cargado y escuchando rutas' : 'En espera de activación'}
                </div>
              </div>

              <div
                style={{
                  background: '#FFFFFF',
                  border: `1px solid ${C.border}`,
                  borderRadius: 14,
                  padding: '14px 16px',
                }}
              >
                <div style={{ fontSize: 11.5, color: C.gray, fontWeight: 600 }}>
                  Sincronización Wix CMS
                </div>
                <div
                  style={{
                    marginTop: 4,
                    fontFamily: F.heading,
                    fontWeight: 700,
                    fontSize: 13.5,
                    color: C.navy,
                  }}
                >
                  {config.updatedAt
                    ? `Actualizado: ${new Date(config.updatedAt).toLocaleString('es-MX')}`
                    : `Colección ConfiguracionMeta (${configSource})`}
                </div>
              </div>
            </div>

            {saveFeedback && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  padding: '14px 16px',
                  borderRadius: 14,
                  fontSize: 13.5,
                  lineHeight: 1.5,
                  background:
                    saveFeedback.type === 'error'
                      ? '#FEF2F2'
                      : saveFeedback.type === 'success'
                        ? '#ECFDF5'
                        : '#EFF6FF',
                  color:
                    saveFeedback.type === 'error'
                      ? '#991B1B'
                      : saveFeedback.type === 'success'
                        ? '#065F46'
                        : '#1E40AF',
                  border: `1px solid ${
                    saveFeedback.type === 'error'
                      ? '#FECACA'
                      : saveFeedback.type === 'success'
                        ? '#A7F3D0'
                        : '#BFDBFE'
                  }`,
                }}
              >
                {saveFeedback.type === 'success' ? (
                  <CheckCircle2 size={18} style={{ flexShrink: 0, marginTop: 1 }} />
                ) : (
                  <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: 1 }} />
                )}
                <span>{saveFeedback.text}</span>
              </div>
            )}

            {scriptWarnings.length > 0 && (
              <div
                style={{
                  padding: '12px 16px',
                  borderRadius: 12,
                  background: '#FFFBEB',
                  border: '1px solid #FDE68A',
                  color: '#92400E',
                  fontSize: 13,
                }}
              >
                <strong>Revisión de sintaxis:</strong>{' '}
                {scriptWarnings.join(' ')}
              </div>
            )}

            {/* Section 1: Meta Pixel (Facebook) */}
            <section
              style={{
                background: '#FFFFFF',
                borderRadius: 20,
                padding: '24px 24px',
                border: `1px solid ${C.border}`,
                boxShadow: '0 8px 24px rgba(15, 23, 42, 0.04)',
                display: 'grid',
                gap: 18,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 10,
                }}
              >
                <div>
                  <h2
                    style={{
                      fontFamily: F.heading,
                      fontSize: 18,
                      fontWeight: 800,
                      margin: 0,
                      color: C.navy,
                    }}
                  >
                    1. Meta Pixel (Facebook Ads)
                  </h2>
                  <p style={{ margin: '4px 0 0', fontSize: 13, color: C.gray }}>
                    Activa tu Pixel ID oficial con seguimiento automático de{' '}
                    <code>PageView</code> en cada navegación del sitio.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAutoExtractPixelId}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 12px',
                    borderRadius: 10,
                    border: `1px solid ${C.border}`,
                    background: '#F8FAFC',
                    color: C.navy,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <Sparkles size={14} color="#2563EB" />
                  Extraer ID de snippet pegado
                </button>
              </div>

              <ToggleSwitch
                id="toggle-meta-enabled"
                checked={config.metaEnabled}
                onChange={(val) =>
                  setConfig((prev) => ({ ...prev, metaEnabled: val }))
                }
                label="Activar Meta Pixel en todo el sitio"
                description="Inyecta fbevents.js, inicializa tu Pixel ID y registra PageView en todas las rutas."
              />

              <div>
                <label
                  htmlFor="meta-pixel-id"
                  style={{
                    display: 'block',
                    fontSize: 13,
                    fontWeight: 700,
                    color: C.navy,
                    marginBottom: 6,
                  }}
                >
                  Meta Pixel ID (solo dígitos)
                </label>
                <input
                  id="meta-pixel-id"
                  type="text"
                  inputMode="numeric"
                  value={config.metaPixelId}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      metaPixelId: e.target.value.replace(/\D/g, '').slice(0, 24),
                    }))
                  }
                  placeholder="Ej. 123456789012345"
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '12px 14px',
                    borderRadius: 10,
                    border: `1px solid ${C.border}`,
                    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                    fontSize: 14,
                    color: C.navy,
                    background: '#F8FAFC',
                  }}
                />
              </div>

              {config.metaPixelId && (
                <div
                  style={{
                    background: '#0F172A',
                    color: '#E2E8F0',
                    borderRadius: 12,
                    padding: '12px 14px',
                    fontSize: 12,
                    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                    overflowX: 'auto',
                  }}
                >
                  <div style={{ color: '#94A3B8', marginBottom: 4 }}>
                    // Vista previa automática al activar:
                  </div>
                  <div>{`fbq('init', '${config.metaPixelId}');`}</div>
                  <div>{`fbq('track', 'PageView');`}</div>
                </div>
              )}

              <div>
                <label
                  htmlFor="meta-custom-code"
                  style={{
                    display: 'block',
                    fontSize: 13,
                    fontWeight: 700,
                    color: C.navy,
                    marginBottom: 6,
                  }}
                >
                  Código adicional de Meta (verificación de dominio, eventos o snippet completo)
                </label>
                <textarea
                  id="meta-custom-code"
                  rows={5}
                  value={config.metaCustomCode}
                  onChange={(e) =>
                    setConfig((prev) => ({ ...prev, metaCustomCode: e.target.value }))
                  }
                  placeholder={'<!-- Ejemplo: <meta name="facebook-domain-verification" content="..." /> o eventos personalizados fbq(...) -->'}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '12px 14px',
                    borderRadius: 10,
                    border: `1px solid ${C.border}`,
                    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                    fontSize: 12.5,
                    lineHeight: 1.55,
                    color: C.navy,
                    background: '#F8FAFC',
                    resize: 'vertical',
                  }}
                />
              </div>
            </section>

            {/* Section 2: Custom Head & Body Scripts */}
            <section
              style={{
                background: '#FFFFFF',
                borderRadius: 20,
                padding: '24px 24px',
                border: `1px solid ${C.border}`,
                boxShadow: '0 8px 24px rgba(15, 23, 42, 0.04)',
                display: 'grid',
                gap: 18,
              }}
            >
              <div>
                <h2
                  style={{
                    fontFamily: F.heading,
                    fontSize: 18,
                    fontWeight: 800,
                    margin: 0,
                    color: C.navy,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <Code2 size={19} color={C.red} />
                  2. Código Personalizado Global (&lt;head&gt; y &lt;body&gt;)
                </h2>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: C.gray }}>
                  Agrega etiquetas de Google Tag Manager, Google Analytics 4, verificación de
                  sitio o scripts adicionales que deban ejecutarse en todo el sitio.
                </p>
              </div>

              <ToggleSwitch
                id="toggle-custom-enabled"
                checked={config.customEnabled}
                onChange={(val) =>
                  setConfig((prev) => ({ ...prev, customEnabled: val }))
                }
                label="Activar código personalizado en todo el sitio"
                description="Ejecuta los bloques de <head> y <body> para todos los visitantes."
              />

              <div>
                <label
                  htmlFor="custom-head-code"
                  style={{
                    display: 'block',
                    fontSize: 13,
                    fontWeight: 700,
                    color: C.navy,
                    marginBottom: 6,
                  }}
                >
                  Scripts / Etiquetas en &lt;head&gt;
                </label>
                <textarea
                  id="custom-head-code"
                  rows={6}
                  value={config.customHeadCode}
                  onChange={(e) =>
                    setConfig((prev) => ({ ...prev, customHeadCode: e.target.value }))
                  }
                  placeholder={'<!-- Pega aquí tu código <script>...</script> o <meta ...> para el <head> -->'}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '12px 14px',
                    borderRadius: 10,
                    border: `1px solid ${C.border}`,
                    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                    fontSize: 12.5,
                    lineHeight: 1.55,
                    color: C.navy,
                    background: '#F8FAFC',
                    resize: 'vertical',
                  }}
                />
              </div>

              <div>
                <label
                  htmlFor="custom-body-code"
                  style={{
                    display: 'block',
                    fontSize: 13,
                    fontWeight: 700,
                    color: C.navy,
                    marginBottom: 6,
                  }}
                >
                  Scripts / Noscript en &lt;body&gt;
                </label>
                <textarea
                  id="custom-body-code"
                  rows={5}
                  value={config.customBodyCode}
                  onChange={(e) =>
                    setConfig((prev) => ({ ...prev, customBodyCode: e.target.value }))
                  }
                  placeholder={'<!-- Pega aquí tu <noscript>...</noscript> o <script>...</script> para el <body> -->'}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '12px 14px',
                    borderRadius: 10,
                    border: `1px solid ${C.border}`,
                    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                    fontSize: 12.5,
                    lineHeight: 1.55,
                    color: C.navy,
                    background: '#F8FAFC',
                    resize: 'vertical',
                  }}
                />
              </div>
            </section>

            {/* Footer Action Buttons */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                background: '#FFFFFF',
                borderRadius: 16,
                padding: '16px 20px',
                border: `1px solid ${C.border}`,
              }}
            >
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                <button
                  type="button"
                  onClick={loadConfig}
                  disabled={loadingConfig || saving}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 7,
                    padding: '10px 14px',
                    borderRadius: 10,
                    border: `1px solid ${C.border}`,
                    background: '#F8FAFC',
                    color: C.navy,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <RefreshCw size={14} />
                  {loadingConfig ? 'Recargando...' : 'Recargar de Wix CMS'}
                </button>

                <button
                  type="button"
                  onClick={handleTestPageView}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 7,
                    padding: '10px 14px',
                    borderRadius: 10,
                    border: `1px solid ${C.border}`,
                    background: '#F8FAFC',
                    color: C.navy,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <Activity size={14} color="#059669" />
                  Probar evento PageView
                </button>
              </div>

              <button
                type="submit"
                disabled={saving}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '12px 22px',
                  borderRadius: 12,
                  border: 'none',
                  background: C.red,
                  color: '#FFFFFF',
                  fontFamily: F.heading,
                  fontSize: 14,
                  fontWeight: 800,
                  cursor: saving ? 'wait' : 'pointer',
                  boxShadow: '0 8px 20px rgba(200, 16, 46, 0.25)',
                }}
              >
                <Save size={16} />
                {saving ? 'Publicando en Wix CMS...' : 'Guardar y Publicar Globalmente'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

