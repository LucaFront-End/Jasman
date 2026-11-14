import process from 'node:process';

const WIX_API_BASE = 'https://www.wixapis.com';
const DEFAULT_WIX_SITE_ID = '7fd3b8ea-a3f3-4b51-9b48-4ec1f53d2cc9';
const COLLECTION_ID = 'ConfiguracionMeta';
const CONFIG_SLUG = 'global-meta-config';

export const AUTHORIZED_META_ADMIN_EMAIL = 'wixpartner@dilodigitalmx.com';

const DEFAULT_CONFIG = {
  slug: CONFIG_SLUG,
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

function getWixCredentials() {
  const apiKey = (
    process.env.WIX_API_KEY ||
    process.env.VITE_WIX_API_KEY ||
    ''
  ).trim();
  const siteId = (
    process.env.WIX_SITE_ID ||
    process.env.VITE_WIX_SITE_ID ||
    DEFAULT_WIX_SITE_ID
  ).trim();
  return { apiKey, siteId };
}

function normalizeEmail(value) {
  return String(value || '')
    .replace(/\s+/g, '')
    .trim()
    .toLowerCase();
}

function normalizeConfigPayload(raw = {}) {
  const cleanPixelId = String(raw.metaPixelId || '')
    .replace(/\D/g, '')
    .slice(0, 24);

  return {
    slug: CONFIG_SLUG,
    title: 'Configuración Global Meta Pixel y Código Personalizado',
    metaPixelId: cleanPixelId,
    metaEnabled: Boolean(raw.metaEnabled),
    metaCustomCode: String(raw.metaCustomCode || ''),
    customHeadCode: String(raw.customHeadCode || ''),
    customBodyCode: String(raw.customBodyCode || ''),
    customEnabled: Boolean(raw.customEnabled),
    updatedBy: String(raw.updatedBy || AUTHORIZED_META_ADMIN_EMAIL),
    updatedAt: String(raw.updatedAt || new Date().toISOString()),
  };
}

async function parseJsonBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string' && req.body.trim()) {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return new Promise((resolve) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
    });
    req.on('end', () => {
      if (!raw.trim()) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch {
        resolve({});
      }
    });
    req.on('error', () => resolve({}));
  });
}

function extractBearerToken(req) {
  const header =
    req.headers?.authorization ||
    req.headers?.Authorization ||
    req.headers?.['x-wix-member-token'] ||
    '';
  const raw = String(header).trim();
  if (!raw) return '';
  return raw.replace(/^Bearer\s+/i, '').trim();
}

/**
 * Verifies the live Wix Member access token directly against Wix Members API.
 * Strictly requires loginEmail === 'wixpartner@dilodigitalmx.com' and APPROVED status.
 */
async function verifyWixAdminMemberToken(accessToken) {
  if (!accessToken) {
    return {
      authorized: false,
      statusCode: 401,
      reason: 'missing_token',
      message: 'Debes iniciar sesión con tu cuenta de Wix autorizada.',
    };
  }

  try {
    const res = await fetch(`${WIX_API_BASE}/members/v1/members/my?fieldsets=FULL`, {
      headers: {
        Authorization: accessToken,
      },
    });

    if (!res.ok) {
      return {
        authorized: false,
        statusCode: 401,
        reason: 'invalid_or_expired_token',
        message: 'Tu sesión de Wix expiró o no es válida. Vuelve a iniciar sesión.',
      };
    }

    const payload = await res.json();
    const member = payload?.member;
    if (!member) {
      return {
        authorized: false,
        statusCode: 401,
        reason: 'member_not_found',
        message: 'No se encontró el perfil del miembro en Wix.',
      };
    }

    const memberEmail = normalizeEmail(
      member.loginEmail || member.contact?.emails?.[0] || ''
    );
    const fullName =
      [member.contact?.firstName, member.contact?.lastName]
        .filter(Boolean)
        .join(' ')
        .trim() ||
      member.profile?.nickname ||
      memberEmail;

    if (member.status !== 'APPROVED') {
      return {
        authorized: false,
        statusCode: 403,
        reason: 'member_not_approved',
        email: memberEmail,
        message: 'La cuenta de Wix no se encuentra aprobada para acceso administrativo.',
      };
    }

    if (memberEmail !== AUTHORIZED_META_ADMIN_EMAIL) {
      return {
        authorized: false,
        statusCode: 403,
        reason: 'unauthorized_role',
        email: memberEmail,
        message: `Acceso denegado para ${memberEmail || 'esta cuenta'}. Esta sección es exclusiva para ${AUTHORIZED_META_ADMIN_EMAIL}.`,
      };
    }

    return {
      authorized: true,
      statusCode: 200,
      member: {
        id: member.id,
        email: memberEmail,
        name: fullName,
        status: member.status,
        loginEmailVerified: Boolean(member.loginEmailVerified),
        roleLabel: 'Wix Partner / Admin',
        photoUrl: member.profile?.photo?.url || '',
      },
    };
  } catch (err) {
    return {
      authorized: false,
      statusCode: 500,
      reason: 'wix_verify_failed',
      message: err?.message || 'Error al verificar credenciales en Wix.',
    };
  }
}

async function wixDataFetch(path, apiKey, siteId, options = {}) {
  const res = await fetch(`${WIX_API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: apiKey,
      'wix-site-id': siteId,
      ...(options.headers || {}),
    },
  });

  const text = await res.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    throw new Error(`Wix Data API returned invalid JSON (${res.status})`);
  }

  if (!res.ok) {
    const err = new Error(
      data?.message ||
        data?.details?.applicationError?.description ||
        `Wix Data error ${res.status}`
    );
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

async function ensureCollectionExists(apiKey, siteId) {
  try {
    await wixDataFetch(`/wix-data/v2/collections/${COLLECTION_ID}`, apiKey, siteId);
    return true;
  } catch (err) {
    if (err.status !== 404) throw err;
    await wixDataFetch('/wix-data/v2/collections', apiKey, siteId, {
      method: 'POST',
      body: JSON.stringify({
        collection: {
          id: COLLECTION_ID,
          displayName: 'Configuracion Meta y Tracking',
          permissions: {
            read: 'ANYONE',
            insert: 'ADMIN',
            update: 'ADMIN',
            remove: 'ADMIN',
          },
          fields: [
            { key: 'title', displayName: 'Title', type: 'TEXT' },
            { key: 'slug', displayName: 'Slug', type: 'TEXT' },
            { key: 'metaPixelId', displayName: 'Meta Pixel ID', type: 'TEXT' },
            { key: 'metaEnabled', displayName: 'Meta Enabled', type: 'BOOLEAN' },
            { key: 'metaCustomCode', displayName: 'Meta Custom Code', type: 'TEXT' },
            { key: 'customHeadCode', displayName: 'Custom Head Code', type: 'TEXT' },
            { key: 'customBodyCode', displayName: 'Custom Body Code', type: 'TEXT' },
            { key: 'customEnabled', displayName: 'Custom Enabled', type: 'BOOLEAN' },
            { key: 'updatedBy', displayName: 'Updated By', type: 'TEXT' },
            { key: 'updatedAt', displayName: 'Updated At', type: 'TEXT' },
          ],
        },
      }),
    });
    return true;
  }
}

async function readStoredConfig(apiKey, siteId) {
  if (!apiKey) {
    return { itemId: null, config: { ...DEFAULT_CONFIG }, source: 'default-no-key' };
  }

  const queryRes = await wixDataFetch('/wix-data/v2/items/query', apiKey, siteId, {
    method: 'POST',
    body: JSON.stringify({
      dataCollectionId: COLLECTION_ID,
      query: {
        filter: { slug: CONFIG_SLUG },
        paging: { limit: 1 },
      },
    }),
  });

  const existing = queryRes?.dataItems?.[0];
  if (!existing) {
    return { itemId: null, config: { ...DEFAULT_CONFIG }, source: 'wix-cms-empty' };
  }

  return {
    itemId: existing.id || existing.data?._id || null,
    config: normalizeConfigPayload(existing.data || existing),
    source: 'wix-cms',
  };
}

async function upsertStoredConfig(apiKey, siteId, configData) {
  await ensureCollectionExists(apiKey, siteId);
  const { itemId } = await readStoredConfig(apiKey, siteId);

  if (itemId) {
    const updated = await wixDataFetch(`/wix-data/v2/items/${itemId}`, apiKey, siteId, {
      method: 'PUT',
      body: JSON.stringify({
        dataCollectionId: COLLECTION_ID,
        dataItem: {
          id: itemId,
          data: configData,
        },
      }),
    });
    return {
      itemId: updated?.dataItem?.id || itemId,
      config: normalizeConfigPayload(updated?.dataItem?.data || configData),
    };
  }

  const inserted = await wixDataFetch('/wix-data/v2/items', apiKey, siteId, {
    method: 'POST',
    body: JSON.stringify({
      dataCollectionId: COLLECTION_ID,
      dataItem: {
        data: configData,
      },
    }),
  });

  return {
    itemId: inserted?.dataItem?.id || null,
    config: normalizeConfigPayload(inserted?.dataItem?.data || configData),
  };
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  const { apiKey, siteId } = getWixCredentials();

  if (req.method === 'GET') {
    const urlObj = new URL(req.url || '/api/tracking-config', 'http://localhost');
    const isVerify =
      req.query?.verify === '1' || urlObj.searchParams.get('verify') === '1';

    if (isVerify) {
      const token = extractBearerToken(req);
      const auth = await verifyWixAdminMemberToken(token);
      return res.status(auth.statusCode).json({
        ok: auth.authorized,
        authorized: auth.authorized,
        reason: auth.reason || null,
        email: auth.member?.email || auth.email || '',
        member: auth.member || null,
        message: auth.message || '',
      });
    }

    try {
      const { config, source } = await readStoredConfig(apiKey, siteId);
      return res.status(200).json({
        ok: true,
        source,
        config,
      });
    } catch (err) {
      return res.status(200).json({
        ok: true,
        source: 'fallback-empty',
        warning: err?.message || 'wix_cms_read_failed',
        config: { ...DEFAULT_CONFIG },
      });
    }
  }

  if (req.method === 'POST') {
    const token = extractBearerToken(req);
    const auth = await verifyWixAdminMemberToken(token);
    if (!auth.authorized) {
      return res.status(auth.statusCode).json({
        ok: false,
        authorized: false,
        reason: auth.reason,
        message: auth.message,
      });
    }

    if (!apiKey) {
      return res.status(500).json({
        ok: false,
        message: 'Falta WIX_API_KEY en el servidor para persistir la configuración.',
      });
    }

    const body = await parseJsonBody(req);
    const nextConfig = normalizeConfigPayload({
      metaPixelId: body.metaPixelId,
      metaEnabled: body.metaEnabled,
      metaCustomCode: body.metaCustomCode,
      customHeadCode: body.customHeadCode,
      customBodyCode: body.customBodyCode,
      customEnabled: body.customEnabled,
      updatedBy: auth.member.email,
      updatedAt: new Date().toISOString(),
    });

    try {
      const saved = await upsertStoredConfig(apiKey, siteId, nextConfig);
      return res.status(200).json({
        ok: true,
        source: 'wix-cms',
        itemId: saved.itemId,
        config: saved.config,
      });
    } catch (err) {
      return res.status(500).json({
        ok: false,
        message: err?.message || 'Error al guardar en Wix CMS ConfiguracionMeta.',
      });
    }
  }

  return res.status(405).json({ ok: false, message: 'Método no permitido.' });
}

