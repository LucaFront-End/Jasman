/**
 * Wix Server-Validated eCommerce Checkout Endpoint (Jasman Automotriz)
 * POST /api/checkout
 *
 * Reads live catalog prices directly from Wix Stores ("Stores/Products"),
 * enforces Jasman's per-identical-SKU volume discount rules server-side:
 *   - 1 unit of a SKU: 0% OFF
 *   - 2-3 units of the same SKU: 2% OFF (only that SKU)
 *   - 4+ units of the same SKU: 5% OFF (only that SKU)
 * Builds a Wix Checkout with fixed quantity and authoritative pricing,
 * and returns a Wix Redirect Session URL back to Jasman's checkout/thank-you flow.
 */

import { Buffer } from 'node:buffer';
import process from 'node:process';
import { createClient, ApiKeyStrategy, OAuthStrategy } from '@wix/sdk';
import { items } from '@wix/data';
import { checkout } from '@wix/ecom';
import { redirects } from '@wix/redirects';

const DEFAULT_WIX_SITE_ID = '7fd3b8ea-a3f3-4b51-9b48-4ec1f53d2cc9';
const DEFAULT_WIX_CLIENT_ID = '5aabc542-16cf-44de-bedf-d8eb7ad08c46';
const WIX_STORES_CATALOG_APP_ID = '215238eb-22a5-4c36-9e7b-e7c08025e04e';
const DEFAULT_ORIGIN = 'https://www.jasman.com.mx';

const MX_SUBDIVISION_MAP = {
  agu: 'MX-AGU',
  aguascalientes: 'MX-AGU',
  bcn: 'MX-BCN',
  bc: 'MX-BCN',
  'baja california': 'MX-BCN',
  'baja california norte': 'MX-BCN',
  bcs: 'MX-BCS',
  'baja california sur': 'MX-BCS',
  cam: 'MX-CAM',
  campeche: 'MX-CAM',
  chp: 'MX-CHP',
  chis: 'MX-CHP',
  chiapas: 'MX-CHP',
  chh: 'MX-CHH',
  chih: 'MX-CHH',
  chihuahua: 'MX-CHH',
  cmx: 'MX-CMX',
  cdmx: 'MX-CMX',
  df: 'MX-CMX',
  'd f': 'MX-CMX',
  'distrito federal': 'MX-CMX',
  'ciudad de mexico': 'MX-CMX',
  coa: 'MX-COA',
  coah: 'MX-COA',
  coahuila: 'MX-COA',
  'coahuila de zaragoza': 'MX-COA',
  col: 'MX-COL',
  colima: 'MX-COL',
  dur: 'MX-DUR',
  dgo: 'MX-DUR',
  durango: 'MX-DUR',
  gua: 'MX-GUA',
  gto: 'MX-GUA',
  guanajuato: 'MX-GUA',
  gro: 'MX-GRO',
  guerrero: 'MX-GRO',
  hid: 'MX-HID',
  hgo: 'MX-HID',
  hidalgo: 'MX-HID',
  jal: 'MX-JAL',
  jalisco: 'MX-JAL',
  mex: 'MX-MEX',
  edomex: 'MX-MEX',
  'edo mex': 'MX-MEX',
  'edo de mexico': 'MX-MEX',
  'estado de mexico': 'MX-MEX',
  mexico: 'MX-MEX',
  mic: 'MX-MIC',
  mich: 'MX-MIC',
  michoacan: 'MX-MIC',
  'michoacan de ocampo': 'MX-MIC',
  mor: 'MX-MOR',
  morelos: 'MX-MOR',
  nay: 'MX-NAY',
  nayarit: 'MX-NAY',
  nle: 'MX-NLE',
  nl: 'MX-NLE',
  'nuevo leon': 'MX-NLE',
  oax: 'MX-OAX',
  oaxaca: 'MX-OAX',
  pue: 'MX-PUE',
  puebla: 'MX-PUE',
  que: 'MX-QUE',
  qro: 'MX-QUE',
  queretaro: 'MX-QUE',
  roo: 'MX-ROO',
  qroo: 'MX-ROO',
  'quintana roo': 'MX-ROO',
  slp: 'MX-SLP',
  'san luis potosi': 'MX-SLP',
  sin: 'MX-SIN',
  sinaloa: 'MX-SIN',
  son: 'MX-SON',
  sonora: 'MX-SON',
  tab: 'MX-TAB',
  tabasco: 'MX-TAB',
  tam: 'MX-TAM',
  tamps: 'MX-TAM',
  tamaulipas: 'MX-TAM',
  tla: 'MX-TLA',
  tlax: 'MX-TLA',
  tlaxcala: 'MX-TLA',
  ver: 'MX-VER',
  veracruz: 'MX-VER',
  'veracruz de ignacio de la llave': 'MX-VER',
  yuc: 'MX-YUC',
  yucatan: 'MX-YUC',
  zac: 'MX-ZAC',
  zacatecas: 'MX-ZAC',
};

function hasValidTokenPair(tokens) {
  return Boolean(tokens?.accessToken?.value && tokens?.refreshToken?.value);
}

function normalizeMexicoPhone(rawPhone) {
  const digits = String(rawPhone || '').replace(/\D/g, '');
  if (digits.length === 10) return `+52${digits}`;
  if (digits.length === 12 && digits.startsWith('52')) return `+${digits}`;
  if (digits.length === 13 && digits.startsWith('521')) return `+52${digits.slice(3)}`;
  return null;
}

function splitCustomerName(customer = {}) {
  const explicitFirst = String(customer.firstName || '').trim();
  const explicitLast = String(customer.lastName || customer.apellido || '').trim();
  if (explicitFirst && explicitLast) {
    return { firstName: explicitFirst, lastName: explicitLast };
  }
  const fullName = String(customer.nombre || explicitFirst || '').trim();
  if (!fullName) {
    return { firstName: '', lastName: explicitLast };
  }
  if (explicitLast) {
    return { firstName: fullName, lastName: explicitLast };
  }
  const parts = fullName.split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] || '',
    lastName: parts.length > 1 ? parts.slice(1).join(' ') : '',
  };
}

function normalizeMexicoSubdivision(rawState) {
  const trimmed = String(rawState || '').trim();
  if (!trimmed) return null;
  if (/^MX-[A-Z]{3}$/i.test(trimmed)) return trimmed.toUpperCase();
  const normalized = trimmed
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[._-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return MX_SUBDIVISION_MAP[normalized] || null;
}

async function queryWixMemberByEmail(email, { apiKey, siteId }) {
  const res = await fetch('https://www.wixapis.com/members/v1/members/query', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: apiKey,
      'wix-site-id': siteId,
    },
    body: JSON.stringify({
      fieldsets: ['FULL'],
      query: {
        filter: { loginEmail: email },
        paging: { limit: 1 },
      },
    }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data?.members?.[0] || null;
}

function extractAddressFromWixMember(member) {
  const rawAddr = member?.contact?.addresses?.[0];
  if (!rawAddr || typeof rawAddr !== 'object') return {};
  const streetFromObj = [rawAddr.streetAddress?.name, rawAddr.streetAddress?.number]
    .filter(Boolean)
    .join(' ')
    .trim();
  return {
    direccion: String(rawAddr.addressLine || rawAddr.addressLine1 || streetFromObj || '').trim(),
    colonia: String(rawAddr.addressLine2 || '').trim(),
    ciudad: String(rawAddr.city || '').trim(),
    estado: String(rawAddr.subdivision || '').trim(),
    cp: String(rawAddr.postalCode || '').replace(/\D/g, '').slice(0, 5),
  };
}

async function resolveMemberAndCustomer({
  apiKey,
  siteId,
  clientId,
  adminClient,
  rawCustomer,
  incomingMemberTokens,
}) {
  const cleanEmail = String(rawCustomer?.correo || rawCustomer?.email || '')
    .trim()
    .toLowerCase();

  const initialNames = splitCustomerName(rawCustomer || {});
  const enriched = {
    email: cleanEmail.includes('@') ? cleanEmail : '',
    firstName: initialNames.firstName,
    lastName: initialNames.lastName,
    nombre: String(rawCustomer?.nombre || '').trim(),
    apellido: String(rawCustomer?.apellido || '').trim(),
    telefono: String(rawCustomer?.telefono || rawCustomer?.phone || '').trim(),
    direccion: String(rawCustomer?.direccion || rawCustomer?.addressLine1 || '').trim(),
    colonia: String(rawCustomer?.colonia || rawCustomer?.addressLine2 || '').trim(),
    ciudad: String(rawCustomer?.ciudad || rawCustomer?.city || '').trim(),
    estado: String(rawCustomer?.estado || rawCustomer?.subdivision || '').trim(),
    cp: String(rawCustomer?.cp || rawCustomer?.postalCode || '').trim(),
    isRegistered: Boolean(rawCustomer?.isRegistered),
  };

  let memberId = null;
  const incomingSessionTokens =
    hasValidTokenPair(incomingMemberTokens) &&
    (!incomingMemberTokens?.refreshToken?.role ||
      incomingMemberTokens.refreshToken.role === 'member')
      ? incomingMemberTokens
      : null;
  let activeMemberTokens = incomingSessionTokens;

  if (enriched.email) {
    try {
      const existingMember = await queryWixMemberByEmail(enriched.email, { apiKey, siteId });
      if (existingMember?.id) {
        memberId = existingMember.id;
        const contact = existingMember.contact || {};
        if (!enriched.firstName && contact.firstName) {
          enriched.firstName = String(contact.firstName).trim();
        }
        if (!enriched.lastName && contact.lastName) {
          enriched.lastName = String(contact.lastName).trim();
        }
        if (!enriched.nombre) {
          enriched.nombre =
            [enriched.firstName, enriched.lastName].filter(Boolean).join(' ').trim() ||
            String(existingMember.profile?.nickname || '').trim();
        }
        if (!enriched.telefono && Array.isArray(contact.phones) && contact.phones[0]) {
          enriched.telefono = String(contact.phones[0]).trim();
        }
        const memberAddr = extractAddressFromWixMember(existingMember);
        if (!enriched.direccion && memberAddr.direccion) enriched.direccion = memberAddr.direccion;
        if (!enriched.colonia && memberAddr.colonia) enriched.colonia = memberAddr.colonia;
        if (!enriched.ciudad && memberAddr.ciudad) enriched.ciudad = memberAddr.ciudad;
        if (!enriched.estado && memberAddr.estado) enriched.estado = memberAddr.estado;
        if (!enriched.cp && memberAddr.cp) enriched.cp = memberAddr.cp;
      }
    } catch {
      // ignore non-fatal Wix Members query failure
    }

    if (!enriched.firstName || !enriched.telefono || !enriched.direccion || !enriched.ciudad) {
      try {
        const cwRes = await adminClient.items
          .query('Contactoweb')
          .eq('email', enriched.email)
          .limit(10)
          .find();
        const itemsList = Array.isArray(cwRes?.items) ? cwRes.items : [];
        if (itemsList.length > 0) {
          const sorted = [...itemsList].sort(
            (a, b) => new Date(b._createdDate || 0) - new Date(a._createdDate || 0)
          );
          const accountDoc = sorted.find((it) => it.tipo === 'CUENTA_TIENDA') || sorted[0];
          if (accountDoc) {
            let parsedMsg = {};
            if (typeof accountDoc.mensaje === 'string' && accountDoc.mensaje.trim().startsWith('{')) {
              try {
                parsedMsg = JSON.parse(accountDoc.mensaje);
              } catch {
                parsedMsg = {};
              }
            }
            const cwNames = splitCustomerName({
              nombre: parsedMsg.nombre || accountDoc.nombre || '',
              apellido: parsedMsg.apellido || '',
            });
            if (!enriched.firstName && cwNames.firstName) enriched.firstName = cwNames.firstName;
            if (!enriched.lastName && cwNames.lastName) enriched.lastName = cwNames.lastName;
            if (!enriched.nombre && (parsedMsg.nombre || accountDoc.nombre)) {
              enriched.nombre = String(parsedMsg.nombre || accountDoc.nombre).trim();
            }
            if (!enriched.telefono && (parsedMsg.telefono || accountDoc.telefono)) {
              enriched.telefono = String(parsedMsg.telefono || accountDoc.telefono).trim();
            }
            if (!enriched.direccion && parsedMsg.direccion) enriched.direccion = String(parsedMsg.direccion).trim();
            if (!enriched.colonia && parsedMsg.colonia) enriched.colonia = String(parsedMsg.colonia).trim();
            if (!enriched.ciudad && parsedMsg.ciudad) enriched.ciudad = String(parsedMsg.ciudad).trim();
            if (!enriched.estado && parsedMsg.estado) enriched.estado = String(parsedMsg.estado).trim();
            if (!enriched.cp && parsedMsg.cp) enriched.cp = String(parsedMsg.cp).trim();
          }
        }
      } catch {
        // ignore Contactoweb enrichment failure
      }
    }

    if (!memberId && enriched.isRegistered) {
      try {
        const e164Phone = normalizeMexicoPhone(enriched.telefono);
        const fullName =
          enriched.nombre || [enriched.firstName, enriched.lastName].filter(Boolean).join(' ').trim();
        const createRes = await fetch('https://www.wixapis.com/members/v1/members', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: apiKey,
            'wix-site-id': siteId,
          },
          body: JSON.stringify({
            member: {
              loginEmail: enriched.email,
              contact: {
                ...(enriched.firstName ? { firstName: enriched.firstName } : {}),
                ...(enriched.lastName ? { lastName: enriched.lastName } : {}),
                emails: [enriched.email],
                ...(e164Phone ? { phones: [e164Phone] } : {}),
              },
              profile: {
                nickname: fullName || enriched.firstName || enriched.email.split('@')[0],
              },
            },
          }),
        });
        if (createRes.ok) {
          const created = await createRes.json();
          memberId = created?.member?.id || null;
        } else {
          const retryMember = await queryWixMemberByEmail(enriched.email, { apiKey, siteId });
          memberId = retryMember?.id || null;
        }
      } catch {
        // ignore non-fatal Wix Member sync failure
      }
    }

    if (memberId && !hasValidTokenPair(activeMemberTokens)) {
      try {
        const oauthClient = createClient({ auth: OAuthStrategy({ clientId }) });
        const vt = await oauthClient.auth.generateVisitorTokens();
        oauthClient.auth.setTokens(vt);
        const freshTokens = await oauthClient.auth.getMemberTokensForExternalLogin(memberId, apiKey);
        if (hasValidTokenPair(freshTokens)) {
          activeMemberTokens = freshTokens;
        }
      } catch {
        // keep incomingMemberTokens fallback if available
      }
    }
  }

  return { enriched, memberId, incomingSessionTokens, activeMemberTokens };
}

function buildCheckoutInfo(enriched) {
  const cleanEmail = enriched?.email || '';
  const { firstName, lastName } = splitCustomerName(enriched || {});
  const phone = normalizeMexicoPhone(enriched?.telefono);

  const contactDetails = {
    ...(firstName ? { firstName: firstName.slice(0, 100) } : {}),
    ...(lastName ? { lastName: lastName.slice(0, 100) } : {}),
    ...(phone ? { phone } : {}),
  };

  const cleanCp = String(enriched?.cp || '').replace(/\D/g, '').slice(0, 5);
  const subdivision = normalizeMexicoSubdivision(enriched?.estado);
  const addressLine1 = String(enriched?.direccion || '').trim().slice(0, 150);
  const addressLine2 = String(enriched?.colonia || '').trim().slice(0, 100);
  const city = String(enriched?.ciudad || '').trim().slice(0, 50);

  const address = {
    country: 'MX',
    ...(addressLine1 ? { addressLine1 } : {}),
    ...(addressLine2 ? { addressLine2 } : {}),
    ...(city ? { city } : {}),
    ...(subdivision ? { subdivision } : {}),
    ...(cleanCp.length === 5 ? { postalCode: cleanCp } : {}),
  };

  const fullCheckoutInfo = {
    ...(cleanEmail ? { buyerInfo: { email: cleanEmail } } : {}),
    billingInfo: {
      address,
      ...(Object.keys(contactDetails).length > 0 ? { contactDetails } : {}),
    },
    shippingInfo: {
      shippingDestination: {
        address,
        ...(Object.keys(contactDetails).length > 0 ? { contactDetails } : {}),
      },
    },
  };

  const minimalCheckoutInfo = {
    ...(cleanEmail ? { buyerInfo: { email: cleanEmail } } : {}),
    billingInfo: { address: { country: 'MX' } },
    shippingInfo: { shippingDestination: { address: { country: 'MX' } } },
  };

  return { fullCheckoutInfo, minimalCheckoutInfo };
}

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

function resolveSafeOrigin(rawOrigin) {
  if (!rawOrigin || typeof rawOrigin !== 'string') return DEFAULT_ORIGIN;
  try {
    const parsed = new URL(rawOrigin);
    const host = parsed.hostname.toLowerCase();
    if (
      host === 'jasman.com.mx' ||
      host === 'www.jasman.com.mx' ||
      host.endsWith('.vercel.app') ||
      host === 'localhost' ||
      host === '127.0.0.1'
    ) {
      return `${parsed.protocol}//${parsed.host}`;
    }
  } catch {
    // ignore malformed origin
  }
  return DEFAULT_ORIGIN;
}

function getVolumeTierServer(effectiveUnits) {
  const units = Number(effectiveUnits) || 0;
  if (units >= 4) {
    return {
      rate: 0.05,
      tierLabel: '5% OFF (4+ llantas del mismo modelo)',
    };
  }
  if (units >= 2) {
    return {
      rate: 0.02,
      tierLabel: '2% OFF (2-3 llantas del mismo modelo)',
    };
  }
  return { rate: 0, tierLabel: '' };
}

function consolidateItems(rawItems) {
  const consolidatedMap = new Map();
  for (const raw of rawItems) {
    const catalogItemId = String(raw?.catalogItemId || '').trim();
    if (!catalogItemId) continue;
    const variantId = raw?.variantId ? String(raw.variantId).trim() : null;
    const key = `${catalogItemId}::${variantId || ''}`;
    const qty = Math.max(1, Math.min(100, Math.floor(Number(raw?.quantity) || 1)));
    const unitsPerItem = Math.max(1, Math.floor(Number(raw?.unitsPerItem) || 1));
    const existing = consolidatedMap.get(key);
    if (existing) {
      existing.quantity = Math.min(100, existing.quantity + qty);
      existing.unitsPerItem = Math.max(existing.unitsPerItem, unitsPerItem);
    } else {
      consolidatedMap.set(key, {
        catalogItemId,
        variantId,
        quantity: qty,
        unitsPerItem,
      });
    }
  }
  return Array.from(consolidatedMap.values());
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

  const rawItems = Array.isArray(body?.items) ? body.items : [];
  const consolidated = consolidateItems(rawItems);
  if (consolidated.length === 0) {
    return res.status(400).json({ ok: false, error: 'empty_cart_items' });
  }

  const safeOrigin = resolveSafeOrigin(body?.origin);
  const cleanCoupon =
    typeof body?.couponCode === 'string' && body.couponCode.trim()
      ? body.couponCode.trim()
      : null;

  const clientId = (
    process.env.WIX_CLIENT_ID ||
    process.env.VITE_WIX_CLIENT_ID ||
    DEFAULT_WIX_CLIENT_ID
  ).trim();

  try {
    const adminClient = createClient({
      modules: { items, checkout },
      auth: ApiKeyStrategy({ apiKey, siteId }),
    });

    const uniqueIds = [...new Set(consolidated.map((item) => item.catalogItemId))];
    const productById = new Map();

    // Fetch authoritative product prices from Wix Stores ("Stores/Products")
    for (let i = 0; i < uniqueIds.length; i += 100) {
      const sliceIds = uniqueIds.slice(i, i + 100);
      const queryRes = await adminClient.items
        .query('Stores/Products')
        .in('_id', sliceIds)
        .limit(100)
        .find();
      for (const doc of queryRes?.items || []) {
        if (doc?._id) {
          productById.set(String(doc._id), doc);
        }
      }
    }

    const lineItems = [];
    for (const entry of consolidated) {
      const wixProduct = productById.get(entry.catalogItemId);
      if (!wixProduct) {
        return res.status(400).json({
          ok: false,
          error: 'unknown_catalog_item',
          catalogItemId: entry.catalogItemId,
        });
      }

      const regularPrice = Number(wixProduct.price || 0);
      const discountedPrice = Number(wixProduct.discountedPrice || 0);
      const baseUnitPrice =
        discountedPrice > 0 ? discountedPrice : regularPrice;

      if (!(baseUnitPrice > 0)) {
        return res.status(400).json({
          ok: false,
          error: 'invalid_catalog_price',
          catalogItemId: entry.catalogItemId,
        });
      }

      const effectiveUnits = entry.unitsPerItem * entry.quantity;
      const { rate, tierLabel } = getVolumeTierServer(effectiveUnits);

      const catalogReference = {
        appId: WIX_STORES_CATALOG_APP_ID,
        catalogItemId: entry.catalogItemId,
        ...(entry.variantId ? { options: { variantId: entry.variantId } } : {}),
      };

      if (rate === 0) {
        lineItems.push({
          quantity: entry.quantity,
          catalogReference,
          catalogOverrideFields: {
            fixedQuantity: true,
          },
        });
      } else {
        const discountedUnitPrice = Number((baseUnitPrice * (1 - rate)).toFixed(2));
        lineItems.push({
          quantity: entry.quantity,
          catalogReference,
          catalogOverrideFields: {
            fullPrice: baseUnitPrice.toFixed(2),
            price: discountedUnitPrice.toFixed(2),
            fixedQuantity: true,
            descriptionLines: [
              {
                name: { original: 'Descuento por volumen' },
                plainText: { original: tierLabel },
              },
            ],
          },
        });
      }
    }

    const { enriched, incomingSessionTokens, activeMemberTokens } =
      await resolveMemberAndCustomer({
        apiKey,
        siteId,
        clientId,
        adminClient,
        rawCustomer: body?.customer || null,
        incomingMemberTokens: body?.memberTokens || null,
      });
    const { fullCheckoutInfo, minimalCheckoutInfo } = buildCheckoutInfo(enriched);

    let createdCheckout;
    try {
      createdCheckout = await adminClient.checkout.createCheckout({
        channelType: 'WEB',
        lineItems,
        checkoutInfo: fullCheckoutInfo,
        ...(cleanCoupon ? { couponCode: cleanCoupon } : {}),
      });
    } catch {
      try {
        // Retry without coupon (if coupon validation failed) while keeping full checkoutInfo
        createdCheckout = await adminClient.checkout.createCheckout({
          channelType: 'WEB',
          lineItems,
          checkoutInfo: fullCheckoutInfo,
        });
      } catch {
        try {
          // Retry with minimal MX checkoutInfo if optional address/phone fields triggered validation error
          createdCheckout = await adminClient.checkout.createCheckout({
            channelType: 'WEB',
            lineItems,
            checkoutInfo: minimalCheckoutInfo,
          });
        } catch {
          // Ultimate safety net: create bare checkout so buyer is never blocked
          createdCheckout = await adminClient.checkout.createCheckout({
            channelType: 'WEB',
            lineItems,
          });
        }
      }
    }

    const checkoutId = createdCheckout?._id;
    if (!checkoutId) {
      return res.status(502).json({ ok: false, error: 'checkout_creation_failed' });
    }

    const redirectCallbacks = {
      postFlowUrl: `${safeOrigin}/llantas`,
      cartPageUrl: `${safeOrigin}/llantas`,
      thankYouPageUrl: `${safeOrigin}/thank-you`,
    };

    let redirectUrl = '';
    if (hasValidTokenPair(incomingSessionTokens)) {
      try {
        const memberRedirectClient = createClient({
          modules: { redirects },
          auth: OAuthStrategy({ clientId }),
        });
        memberRedirectClient.auth.setTokens(incomingSessionTokens);
        const redirectRes = await memberRedirectClient.redirects.createRedirectSession({
          ecomCheckout: { checkoutId },
          callbacks: redirectCallbacks,
        });
        redirectUrl = redirectRes?.redirectSession?.fullUrl || '';
      } catch (memberRedirErr) {
        console.warn('[api/checkout] Member redirect session warning:', memberRedirErr?.message || memberRedirErr);
      }
    }

    if (!redirectUrl) {
      try {
        const visitorClient = createClient({
          modules: { redirects },
          auth: OAuthStrategy({ clientId }),
        });
        const tokens = await visitorClient.auth.generateVisitorTokens();
        visitorClient.auth.setTokens(tokens);
        const redirectRes = await visitorClient.redirects.createRedirectSession({
          ecomCheckout: { checkoutId },
          callbacks: redirectCallbacks,
        });
        redirectUrl = redirectRes?.redirectSession?.fullUrl || '';
      } catch (redirErr) {
        console.warn('[api/checkout] Redirect session warning:', redirErr?.message || redirErr);
      }
    }

    if (!redirectUrl) {
      try {
        const directRes = await adminClient.checkout.getWixCheckoutUrl(checkoutId, {
          postFlowUrl: `${safeOrigin}/llantas`,
          thankYouPageUrl: `${safeOrigin}/thank-you`,
        });
        redirectUrl = directRes?.checkoutUrl || '';
      } catch {
        // leave empty if direct URL lookup fails
      }
    }

    return res.status(200).json({
      ok: true,
      checkoutId,
      checkoutUrl: redirectUrl,
      memberTokens: hasValidTokenPair(activeMemberTokens) ? activeMemberTokens : null,
      payNow: createdCheckout?.payNow || null,
      lineItems: createdCheckout?.lineItems || [],
    });
  } catch (err) {
    console.error('[api/checkout] Error:', err?.message || err);
    return res.status(err?.status || 500).json({
      ok: false,
      error: err?.message || 'checkout_error',
    });
  }
}
