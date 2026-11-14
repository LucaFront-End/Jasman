import {
  wixClient,
  persistWixTokens,
  getStoredWixMemberAccessToken,
  logoutWixMember,
} from './wixService';

export const AUTHORIZED_META_ADMIN_EMAIL = 'wixpartner@dilodigitalmx.com';
export const TRACKING_CONFIG_STORAGE_KEY = 'jasman_tracking_config_v1';
export const TRACKING_CONFIG_EVENT = 'jasman-tracking-config-updated';

export const DEFAULT_TRACKING_CONFIG = {
  slug: 'global-meta-config',
  title: 'Configuración Global Meta Pixel y Código Personalizado',
  metaPixelId: '',
  metaEnabled: false,
  metaCustomCode: '',
  customHeadCode: '',
  customBodyCode: '',
  customEnabled: false,
  updatedBy: '',
  updatedAt: '',
};

export function normalizeTrackingEmail(email) {
  return String(email || '')
    .replace(/\s+/g, '')
    .trim()
    .toLowerCase();
}

export function normalizeTrackingConfig(raw = {}) {
  const cleanPixelId = String(raw.metaPixelId || '')
    .replace(/\D/g, '')
    .slice(0, 24);

  return {
    slug: 'global-meta-config',
    title: 'Configuración Global Meta Pixel y Código Personalizado',
    metaPixelId: cleanPixelId,
    metaEnabled: Boolean(raw.metaEnabled),
    metaCustomCode: String(raw.metaCustomCode || ''),
    customHeadCode: String(raw.customHeadCode || ''),
    customBodyCode: String(raw.customBodyCode || ''),
    customEnabled: Boolean(raw.customEnabled),
    updatedBy: String(raw.updatedBy || ''),
    updatedAt: String(raw.updatedAt || ''),
  };
}

export function getCachedTrackingConfig() {
  if (typeof window === 'undefined') return { ...DEFAULT_TRACKING_CONFIG };
  try {
    const raw = window.localStorage.getItem(TRACKING_CONFIG_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_TRACKING_CONFIG };
    return normalizeTrackingConfig(JSON.parse(raw));
  } catch {
    return { ...DEFAULT_TRACKING_CONFIG };
  }
}

export function setCachedTrackingConfig(config) {
  const normalized = normalizeTrackingConfig(config);
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(
        TRACKING_CONFIG_STORAGE_KEY,
        JSON.stringify(normalized)
      );
    } catch {
      // ignore storage quota errors
    }
  }
  return normalized;
}

/**
 * Fetches published Meta Pixel + custom scripts config for all site visitors.
 */
export async function fetchPublicTrackingConfig() {
  try {
    const res = await fetch('/api/tracking-config', {
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.config) {
        const cached = setCachedTrackingConfig(data.config);
        return { config: cached, source: data.source || 'api' };
      }
    }
  } catch {
    // Fallback to direct Wix Data query below
  }

  try {
    const queryRes = await wixClient.items
      .query('ConfiguracionMeta')
      .eq('slug', 'global-meta-config')
      .limit(1)
      .find();
    const item = queryRes?.items?.[0];
    if (item) {
      const cached = setCachedTrackingConfig(item);
      return { config: cached, source: 'wix-client' };
    }
  } catch {
    // Fallback to cached local config
  }

  return { config: getCachedTrackingConfig(), source: 'local-cache' };
}

/**
 * Verifies live Wix Member access token directly against /api/tracking-config?verify=1
 * (which validates against Wix Members API for wixpartner@dilodigitalmx.com).
 */
export async function verifyMetaAdminSession() {
  const token = getStoredWixMemberAccessToken();
  if (!token) {
    return {
      authorized: false,
      status: 'unauthenticated',
      email: '',
      member: null,
      message: `Inicia sesión con tu cuenta de Wix (${AUTHORIZED_META_ADMIN_EMAIL}).`,
    };
  }

  try {
    const res = await fetch('/api/tracking-config?verify=1', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    });
    const data = await res.json().catch(() => ({}));

    if (res.ok && data?.authorized) {
      return {
        authorized: true,
        status: 'authorized',
        email: data.member?.email || AUTHORIZED_META_ADMIN_EMAIL,
        member: data.member,
        message: 'Acceso autorizado.',
      };
    }

    if (res.status === 403 || data?.reason === 'unauthorized_role') {
      return {
        authorized: false,
        status: 'forbidden',
        email: data.email || '',
        member: null,
        message:
          data.message ||
          `La cuenta actual no tiene acceso. Exclusivo para ${AUTHORIZED_META_ADMIN_EMAIL}.`,
      };
    }

    return {
      authorized: false,
      status: 'expired',
      email: data.email || '',
      member: null,
      message:
        data.message || 'Tu sesión de Wix expiró. Inicia sesión nuevamente.',
    };
  } catch (err) {
    return {
      authorized: false,
      status: 'error',
      email: '',
      member: null,
      message:
        err?.message || 'No se pudo validar tu sesión con el servidor de Wix.',
    };
  }
}

/**
 * Strict Wix Member credential login exclusively for wixpartner@dilodigitalmx.com.
 */
export async function loginStrictMetaAdmin({ email, password }) {
  const cleanEmail = normalizeTrackingEmail(email);
  if (!cleanEmail || !cleanEmail.includes('@')) {
    return {
      success: false,
      message: 'Ingresa un correo electrónico válido.',
    };
  }

  if (cleanEmail !== AUTHORIZED_META_ADMIN_EMAIL) {
    return {
      success: false,
      errorCode: 'unauthorizedEmail',
      message: `Acceso denegado. Solo el usuario autorizado de Wix (${AUTHORIZED_META_ADMIN_EMAIL}) puede ingresar.`,
    };
  }

  if (!password) {
    return {
      success: false,
      errorCode: 'invalidPassword',
      message: 'Ingresa la contraseña de tu cuenta de Wix.',
    };
  }

  try {
    const response = await wixClient.auth.login({
      email: cleanEmail,
      password,
    });

    if (response?.loginState === 'SUCCESS' && response?.data?.sessionToken) {
      const memberTokens = await wixClient.auth.getMemberTokensForDirectLogin(
        response.data.sessionToken
      );
      wixClient.auth.setTokens(memberTokens);
      persistWixTokens(memberTokens);

      const verified = await verifyMetaAdminSession();
      if (!verified.authorized) {
        return {
          success: false,
          message:
            verified.message ||
            'No se pudo confirmar el rol autorizado en Wix Members.',
        };
      }

      return {
        success: true,
        member: verified.member,
      };
    }

    const errCode =
      response?.errorCode || response?.error || response?.loginState || '';

    if (errCode === 'invalidPassword') {
      return {
        success: false,
        errorCode: 'invalidPassword',
        message: 'Contraseña incorrecta en Wix. Verifica tus datos o usa "Restablecer contraseña".',
      };
    }

    if (errCode === 'resetPassword') {
      return {
        success: false,
        errorCode: 'resetPassword',
        message:
          'Tu cuenta de Wix requiere definir o restablecer una contraseña. Usa el enlace de recuperación o entra con Google (Wix).',
      };
    }

    if (
      String(errCode).toUpperCase().includes('CAPTCHA') ||
      response?.loginState === 'OWNER_APPROVAL_REQUIRED'
    ) {
      return {
        success: false,
        errorCode: errCode,
        message:
          'Wix solicitó verificación adicional (CAPTCHA/OAuth). Inicia sesión usando el botón "Continuar con Google / Wix OAuth".',
      };
    }

    return {
      success: false,
      errorCode: errCode,
      message:
        'No se pudo iniciar sesión directamente con contraseña en Wix. Si normalmente entras con Google en Wix, usa "Entrar con Google (Wix)" o solicita el enlace de contraseña.',
    };
  } catch (err) {
    return {
      success: false,
      message:
        err?.message ||
        'Error al autenticar con Wix. Intenta con "Entrar con Google (Wix)".',
    };
  }
}

export async function logoutMetaAdmin() {
  await logoutWixMember();
}

/**
 * Publishes updated Meta Pixel + custom code configuration to Wix CMS ConfiguracionMeta.
 */
export async function saveTrackingConfig(configPayload) {
  const token = getStoredWixMemberAccessToken();
  if (!token) {
    return {
      success: false,
      message: 'Tu sesión expiró. Vuelve a iniciar sesión con tu cuenta de Wix.',
    };
  }

  const res = await fetch('/api/tracking-config', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(configPayload),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data?.ok) {
    return {
      success: false,
      status: res.status,
      message:
        data?.message ||
        'No se pudo guardar la configuración en Wix CMS.',
    };
  }

  const savedConfig = setCachedTrackingConfig(data.config);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent(TRACKING_CONFIG_EVENT, { detail: savedConfig })
    );
  }

  return {
    success: true,
    config: savedConfig,
    itemId: data.itemId || null,
  };
}

