/**
 * Wix Coupon Lead & Dynamic Discount Code Endpoint (Jasman Automotriz)
 * POST /api/coupon-lead
 *
 * Handles the 10% First-Purchase Tire Coupon popup:
 *   1. Idempotency check in Wix CMS "CuponLlantas" by customer email
 *   2. Creates a unique dynamic 10% Stores Coupon cloned from "PCJT-DDMX-000"
 *   3. Finds or creates the Wix CRM Contact and attaches label "Cupón Llantas"
 *   4. Persists the lead + generated coupon metadata in Wix CMS "CuponLlantas"
 */

import { Buffer } from 'node:buffer';
import crypto from 'node:crypto';
import process from 'node:process';

const WIX_API_BASE = 'https://www.wixapis.com';
const DEFAULT_WIX_SITE_ID = '7fd3b8ea-a3f3-4b51-9b48-4ec1f53d2cc9';
const COUPON_COLLECTION_ID = 'CuponLlantas';
const COUPON_TEMPLATE_ID = 'c1cf5eb2-e054-40a5-bcc4-085c7398a1bd';
const DEFAULT_LABEL_DISPLAY_NAME = 'Cupón Llantas';
const DEFAULT_LABEL_KEY = 'custom.cupon-llantas-YqAHB';
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

async function readJsonBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string' && req.body.trim()) {
    return JSON.parse(req.body);
  }
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  const raw = Buffer.concat(chunks).toString('utf8').trim();
  return raw ? JSON.parse(raw) : {};
}

async function wixRequest(path, { apiKey, siteId, method = 'GET', body } = {}) {
  const res = await fetch(`${WIX_API_BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: apiKey,
      'wix-site-id': siteId,
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  const text = await res.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  return { ok: res.ok, status: res.status, data, text };
}

function splitFullName(fullName = '') {
  const parts = String(fullName || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { first: 'Cliente', last: '' };
  if (parts.length === 1) return { first: parts[0], last: '' };
  return {
    first: parts[0],
    last: parts.slice(1).join(' '),
  };
}

function normalizeLabelName(raw = '') {
  return String(raw || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function deriveCouponPrefix(templateCode = 'PCJT-DDMX-000') {
  const trimmed = String(templateCode || 'PCJT-DDMX-000').trim().replace(/[0-9]+$/g, '');
  if (!trimmed) return 'PCJT-DDMX-';
  return trimmed.endsWith('-') ? trimmed : `${trimmed}-`;
}

function generateRandomCode(prefix = 'PCJT-DDMX-', length = 6) {
  const bytes = crypto.randomBytes(length);
  let suffix = '';
  for (let i = 0; i < length; i++) {
    suffix += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length];
  }
  return `${prefix}${suffix}`;
}

async function findExistingCouponLead(cleanEmail, creds) {
  const res = await wixRequest('/wix-data/v2/items/query', {
    ...creds,
    method: 'POST',
    body: {
      dataCollectionId: COUPON_COLLECTION_ID,
      query: {
        filter: { correo: cleanEmail },
        paging: { limit: 1 },
      },
    },
  });

  if (!res.ok) return null;
  const item = res.data?.dataItems?.[0];
  if (!item?.data?.cupon) return null;

  return {
    cmsItemId: item.id || '',
    couponCode: String(item.data.cupon).trim(),
    couponId: String(item.data.cuponWixId || '').trim(),
    contactId: String(item.data.contactoId || '').trim(),
    rawData: item.data || {},
  };
}

async function verifyWixCouponActive(couponId, couponCode, creds) {
  const cleanId = String(couponId || '').trim();
  const cleanCode = String(couponCode || '').trim().toUpperCase();

  if (cleanId) {
    try {
      const byIdRes = await wixRequest(`/stores/v2/coupons/${cleanId}`, creds);
      const coupon = byIdRes.data?.coupon;
      if (byIdRes.ok && coupon?.id && coupon?.specification?.active !== false && !coupon?.expired) {
        return {
          exists: true,
          couponId: coupon.id,
          couponCode: String(coupon.specification?.code || couponCode).trim(),
        };
      }
    } catch {
      // fall through to query by code
    }
  }

  if (cleanCode) {
    try {
      const qRes = await wixRequest('/stores/v2/coupons/query', {
        ...creds,
        method: 'POST',
        body: { query: { paging: { limit: 100 } } },
      });
      const list = Array.isArray(qRes.data?.coupons) ? qRes.data.coupons : [];
      const match = list.find(
        (c) =>
          String(c?.specification?.code || '').trim().toUpperCase() === cleanCode &&
          c?.specification?.active !== false &&
          !c?.expired
      );
      if (match?.id) {
        return {
          exists: true,
          couponId: match.id,
          couponCode: String(match.specification?.code || couponCode).trim(),
        };
      }
    } catch {
      // fall through
    }
  }

  return { exists: false, couponId: '', couponCode: '' };
}

async function tryCreateCouponViaVelo({ code, name, percentOffRate, limitPerCustomer, scope }) {
  const veloUrl = (process.env.WIX_VELO_COUPON_URL || '').trim();
  const veloSecret = (process.env.WIX_VELO_COUPON_SECRET || '').trim();
  if (!veloUrl) return null;

  try {
    const resp = await fetch(veloUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret: veloSecret,
        code,
        name,
        percentOffRate,
        usageLimit: 1,
        limitPerCustomer,
        scope,
      }),
      signal: AbortSignal.timeout(7000),
    });
    const data = await resp.json().catch(() => null);
    if (resp.ok && data?.ok && data?.couponId) {
      return {
        couponId: String(data.couponId).trim(),
        couponCode: String(data.couponCode || code).trim(),
        createdVia: 'wix-velo',
      };
    }
  } catch (err) {
    console.warn('[api/coupon-lead] Velo coupon bridge fallback:', err?.message || err);
  }
  return null;
}

async function createDynamicCouponFromTemplate(creds, preferredCode = '') {
  let templateSpec = {
    code: 'PCJT-DDMX-000',
    percentOffRate: 10,
    scope: { namespace: 'stores' },
    limitPerCustomer: 1,
    limitedToOneItem: false,
    appliesToSubscriptions: false,
  };

  try {
    const tplRes = await wixRequest(`/stores/v2/coupons/${COUPON_TEMPLATE_ID}`, creds);
    if (tplRes.ok && tplRes.data?.coupon?.specification) {
      templateSpec = {
        ...templateSpec,
        ...tplRes.data.coupon.specification,
      };
    }
  } catch {
    // Fallback to hardcoded template spec if lookup fails
  }

  const prefix = deriveCouponPrefix(templateSpec.code);
  let lastErrMsg = '';

  for (let attempt = 0; attempt < 3; attempt++) {
    const generatedCode =
      attempt === 0 && preferredCode ? String(preferredCode).trim() : generateRandomCode(prefix, 6);
    const percentOffRate = templateSpec.percentOffRate ?? 10;
    const scope = templateSpec.scope || { namespace: 'stores' };
    const limitPerCustomer = templateSpec.limitPerCustomer ?? 1;

    const veloResult = await tryCreateCouponViaVelo({
      code: generatedCode,
      name: generatedCode,
      percentOffRate,
      limitPerCustomer,
      scope,
    });
    if (veloResult) {
      return veloResult;
    }

    const payload = {
      specification: {
        name: generatedCode,
        code: generatedCode,
        startTime: Date.now(),
        percentOffRate,
        scope,
        limitPerCustomer,
        usageLimit: 1,
        limitedToOneItem: Boolean(templateSpec.limitedToOneItem),
        appliesToSubscriptions: Boolean(templateSpec.appliesToSubscriptions),
        active: true,
        ...(templateSpec.minimumSubtotal ? { minimumSubtotal: templateSpec.minimumSubtotal } : {}),
        ...(templateSpec.expirationTime ? { expirationTime: templateSpec.expirationTime } : {}),
      },
    };

    const createRes = await wixRequest('/stores/v2/coupons', {
      ...creds,
      method: 'POST',
      body: payload,
    });

    if (createRes.ok) {
      const couponId = createRes.data?.id || createRes.data?.coupon?.id || '';
      const couponCode =
        createRes.data?.coupon?.specification?.code || generatedCode;
      return { couponId, couponCode, createdVia: 'wix-rest-api' };
    }

    lastErrMsg =
      createRes.data?.message ||
      createRes.text?.slice(0, 200) ||
      `status_${createRes.status}`;

    const isDuplicate =
      createRes.status === 409 ||
      /already\s*exists|duplicate/i.test(lastErrMsg);
    if (!isDuplicate) {
      const err = new Error(`coupon_create_failed: ${lastErrMsg}`);
      err.status = createRes.status;
      throw err;
    }
  }

  throw new Error(`coupon_create_failed_after_retries: ${lastErrMsg}`);
}

async function findExistingContactByEmail(cleanEmail, creds, preferredContactId = '') {
  if (preferredContactId) {
    try {
      const directRes = await wixRequest(`/contacts/v4/contacts/${preferredContactId}`, creds);
      if (directRes.ok && directRes.data?.contact?.id) {
        return directRes.data.contact.id;
      }
    } catch {
      // fall through to query
    }
  }

  const filters = [
    { 'info.emails.email': { $eq: cleanEmail } },
    { 'primaryInfo.email': { $eq: cleanEmail } },
    { 'info.emails.items.email': cleanEmail },
  ];

  for (const filter of filters) {
    try {
      const res = await wixRequest('/contacts/v4/contacts/query', {
        ...creds,
        method: 'POST',
        body: {
          query: {
            filter,
            paging: { limit: 1 },
          },
        },
      });
      if (res.ok && res.data?.contacts?.[0]?.id) {
        return res.data.contacts[0].id;
      }
    } catch {
      // try next filter syntax
    }
  }

  return '';
}

async function resolveCouponLabelKey(creds) {
  try {
    const queryRes = await wixRequest('/contacts/v4/labels/query', {
      ...creds,
      method: 'POST',
      body: { query: { paging: { limit: 100 } } },
    });
    if (queryRes.ok && Array.isArray(queryRes.data?.labels)) {
      const match = queryRes.data.labels.find(
        (l) => normalizeLabelName(l?.displayName) === 'cupon llantas'
      );
      if (match?.key) return match.key;
    }
  } catch {
    // fallback below
  }

  try {
    const createRes = await wixRequest('/contacts/v4/labels', {
      ...creds,
      method: 'POST',
      body: { displayName: DEFAULT_LABEL_DISPLAY_NAME },
    });
    if (createRes.ok && createRes.data?.label?.key) {
      return createRes.data.label.key;
    }
  } catch {
    // fallback below
  }

  return DEFAULT_LABEL_KEY;
}

async function resolveOrCreateLabeledContact(
  { cleanName, cleanEmail, cleanPhone, preferredContactId = '' },
  creds
) {
  let contactId = await findExistingContactByEmail(cleanEmail, creds, preferredContactId);

  if (!contactId) {
    const { first, last } = splitFullName(cleanName);
    const createRes = await wixRequest('/contacts/v4/contacts', {
      ...creds,
      method: 'POST',
      body: {
        info: {
          name: {
            first,
            ...(last ? { last } : {}),
          },
          emails: {
            items: [{ tag: 'MAIN', email: cleanEmail }],
          },
          phones: {
            items: [{ tag: 'MOBILE', countryCode: 'MX', phone: cleanPhone }],
          },
        },
        allowDuplicates: true,
      },
    });

    if (!createRes.ok || !createRes.data?.contact?.id) {
      const errMsg =
        createRes.data?.message ||
        createRes.text?.slice(0, 200) ||
        `status_${createRes.status}`;
      const err = new Error(`contact_create_failed: ${errMsg}`);
      err.status = createRes.status;
      throw err;
    }

    contactId = createRes.data.contact.id;
  }

  const labelKey = await resolveCouponLabelKey(creds);
  const labelRes = await wixRequest(`/contacts/v4/contacts/${contactId}/labels`, {
    ...creds,
    method: 'POST',
    body: { labelKeys: [labelKey] },
  });

  if (!labelRes.ok) {
    const errMsg =
      labelRes.data?.message ||
      labelRes.text?.slice(0, 200) ||
      `status_${labelRes.status}`;
    const err = new Error(`contact_label_failed: ${errMsg}`);
    err.status = labelRes.status;
    throw err;
  }

  return { contactId, labelKey };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  }

  const apiKey = (process.env.WIX_API_KEY || process.env.VITE_WIX_API_KEY || '').trim();
  const siteId = (
    process.env.WIX_SITE_ID ||
    process.env.VITE_WIX_SITE_ID ||
    DEFAULT_WIX_SITE_ID
  ).trim();

  if (!apiKey) {
    return res.status(500).json({ ok: false, error: 'missing_wix_api_key' });
  }

  let body;
  try {
    body = await readJsonBody(req);
  } catch {
    return res.status(400).json({ ok: false, error: 'invalid_json_body' });
  }

  const cleanName = String(body?.nombre || '').trim();
  const cleanPhone = String(body?.telefono || '').replace(/\D/g, '');
  const cleanEmail = String(body?.correo || body?.email || '').trim().toLowerCase();
  const cleanOrigen =
    String(body?.origen || '').trim() ||
    'Popup 10% Primera Compra — Tienda de Llantas';

  if (cleanName.length < 2) {
    return res.status(400).json({ ok: false, error: 'invalid_nombre' });
  }
  if (cleanPhone.length !== 10) {
    return res.status(400).json({ ok: false, error: 'invalid_telefono' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(cleanEmail)) {
    return res.status(400).json({ ok: false, error: 'invalid_correo' });
  }

  const creds = { apiKey, siteId };

  try {
    const existing = await findExistingCouponLead(cleanEmail, creds);

    if (existing) {
      const [{ contactId, labelKey }, couponCheck] = await Promise.all([
        resolveOrCreateLabeledContact(
          {
            cleanName,
            cleanEmail,
            cleanPhone,
            preferredContactId: existing.contactId || '',
          },
          creds
        ),
        verifyWixCouponActive(existing.couponId, existing.couponCode, creds),
      ]);

      let finalCouponCode = couponCheck.couponCode || existing.couponCode;
      let finalCouponId = couponCheck.couponId || existing.couponId;
      let createdVia = 'existing';

      if (!couponCheck.exists) {
        const recreated = await createDynamicCouponFromTemplate(creds, existing.couponCode);
        finalCouponCode = recreated.couponCode;
        finalCouponId = recreated.couponId;
        createdVia = recreated.createdVia;

        if (existing.cmsItemId) {
          const cleanRaw = Object.fromEntries(
            Object.entries(existing.rawData || {}).filter(([k]) => !k.startsWith('_'))
          );
          await wixRequest(`/wix-data/v2/items/${existing.cmsItemId}`, {
            ...creds,
            method: 'PUT',
            body: {
              dataCollectionId: COUPON_COLLECTION_ID,
              dataItem: {
                id: existing.cmsItemId,
                data: {
                  ...cleanRaw,
                  nombre: cleanRaw.nombre || cleanName,
                  correo: cleanRaw.correo || cleanEmail,
                  telefono: cleanRaw.telefono || cleanPhone,
                  title: `${cleanRaw.nombre || cleanName} — ${finalCouponCode}`,
                  cupon: finalCouponCode,
                  cuponWixId: finalCouponId,
                  contactoId: contactId || existing.contactId || '',
                },
              },
            },
          }).catch(() => {});
        }
      }

      return res.status(200).json({
        ok: true,
        couponCode: finalCouponCode,
        couponId: finalCouponId,
        cmsItemId: existing.cmsItemId,
        contactId: contactId || existing.contactId,
        labelKey,
        alreadyRegistered: true,
        verifiedInWix: true,
        createdVia,
      });
    }

    const [{ couponId, couponCode, createdVia }, { contactId, labelKey }] = await Promise.all([
      createDynamicCouponFromTemplate(creds),
      resolveOrCreateLabeledContact({ cleanName, cleanEmail, cleanPhone }, creds),
    ]);

    const insertRes = await wixRequest('/wix-data/v2/items', {
      ...creds,
      method: 'POST',
      body: {
        dataCollectionId: COUPON_COLLECTION_ID,
        dataItem: {
          data: {
            title: `${cleanName} — ${couponCode}`,
            nombre: cleanName,
            correo: cleanEmail,
            telefono: cleanPhone,
            cupon: couponCode,
            etiqueta: DEFAULT_LABEL_DISPLAY_NAME,
            contactoId: contactId || '',
            cuponWixId: couponId || '',
            fecha: new Date().toISOString(),
            origen: cleanOrigen,
          },
        },
      },
    });

    if (!insertRes.ok) {
      const errMsg =
        insertRes.data?.message ||
        insertRes.text?.slice(0, 200) ||
        `status_${insertRes.status}`;
      const err = new Error(`cms_insert_failed: ${errMsg}`);
      err.status = insertRes.status;
      throw err;
    }

    const cmsItemId =
      insertRes.data?.dataItem?.id || insertRes.data?.id || '';

    return res.status(200).json({
      ok: true,
      couponCode,
      couponId,
      cmsItemId,
      contactId,
      labelKey,
      alreadyRegistered: false,
      verifiedInWix: true,
      createdVia,
    });
  } catch (err) {
    console.error('[api/coupon-lead] Error:', err?.message || err);
    return res.status(err?.status || 500).json({
      ok: false,
      error: err?.message || 'coupon_lead_error',
    });
  }
}
