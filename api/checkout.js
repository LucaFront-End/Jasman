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

    let createdCheckout;
    try {
      createdCheckout = await adminClient.checkout.createCheckout({
        channelType: 'WEB',
        lineItems,
        ...(cleanCoupon ? { couponCode: cleanCoupon } : {}),
      });
    } catch (couponOrCheckoutErr) {
      // If coupon caused a 4xx validation failure (expired, minimum not met), retry cleanly without coupon
      if (cleanCoupon) {
        createdCheckout = await adminClient.checkout.createCheckout({
          channelType: 'WEB',
          lineItems,
        });
      } else {
        throw couponOrCheckoutErr;
      }
    }

    const checkoutId = createdCheckout?._id;
    if (!checkoutId) {
      return res.status(502).json({ ok: false, error: 'checkout_creation_failed' });
    }

    let redirectUrl = '';
    try {
      const visitorClient = createClient({
        modules: { redirects },
        auth: OAuthStrategy({ clientId }),
      });
      const tokens = await visitorClient.auth.generateVisitorTokens();
      visitorClient.auth.setTokens(tokens);
      const redirectRes = await visitorClient.redirects.createRedirectSession({
        ecomCheckout: { checkoutId },
        callbacks: {
          postFlowUrl: `${safeOrigin}/llantas`,
          cartPageUrl: `${safeOrigin}/llantas`,
          thankYouPageUrl: `${safeOrigin}/thank-you`,
        },
      });
      redirectUrl = redirectRes?.redirectSession?.fullUrl || '';
    } catch (redirErr) {
      console.warn('[api/checkout] Redirect session warning:', redirErr?.message || redirErr);
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
