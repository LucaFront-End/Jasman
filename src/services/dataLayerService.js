import { findCatalogProductById } from '../data/productosMasterData';

const PURCHASE_DEDUPE_KEY = 'jasman_gtm_purchased_txs_v1';
const memoryPurchasedTxs = new Set();

function roundPrice(num) {
  const n = Number(num);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.round(n * 100) / 100;
}

function parsePriceValue(rawPrice) {
  if (typeof rawPrice === 'number') return roundPrice(rawPrice);
  if (typeof rawPrice === 'string') {
    const cleaned = rawPrice.replace(/[^0-9.-]/g, '');
    return roundPrice(parseFloat(cleaned) || 0);
  }
  return 0;
}

function ensureDataLayer() {
  if (typeof window === 'undefined') return null;
  window.dataLayer = window.dataLayer || [];
  return window.dataLayer;
}

function hasTrackedPurchase(transactionId) {
  if (!transactionId) return false;
  const key = String(transactionId).trim();
  if (memoryPurchasedTxs.has(key)) return true;
  try {
    const raw = window.sessionStorage.getItem(PURCHASE_DEDUPE_KEY);
    if (!raw) return false;
    const list = JSON.parse(raw);
    return Array.isArray(list) && list.includes(key);
  } catch {
    return false;
  }
}

function markPurchaseTracked(transactionId) {
  if (!transactionId) return;
  const key = String(transactionId).trim();
  memoryPurchasedTxs.add(key);
  try {
    const raw = window.sessionStorage.getItem(PURCHASE_DEDUPE_KEY);
    const list = raw ? JSON.parse(raw) : [];
    const next = Array.isArray(list) ? list : [];
    if (!next.includes(key)) {
      next.push(key);
      window.sessionStorage.setItem(PURCHASE_DEDUPE_KEY, JSON.stringify(next.slice(-30)));
    }
  } catch {
    // Ignore storage errors in restricted environments
  }
}

/**
 * Normalizes a product or cart/order line item into a GA4 / GTM ecommerce item payload.
 * Guarantees item_id, item_name, product_reference (SKU), item_brand, price, quantity, currency.
 */
export function buildDataLayerItem(rawItem, overrideQuantity, overridePrice) {
  const source = rawItem?.product ? { ...rawItem.product, ...rawItem } : rawItem || {};
  const lookupKey =
    source.productId ||
    source.wixId ||
    source.catalogItemId ||
    source.id ||
    source.product_reference ||
    source.reference ||
    source.sku;
  const catalogMatch = lookupKey ? findCatalogProductById(lookupKey) : null;

  const itemId = String(
    catalogMatch?.wixId ||
      source.wixId ||
      source.catalogItemId ||
      source.productId ||
      source.id ||
      catalogMatch?.reference ||
      source.reference ||
      source.sku ||
      'unknown-item'
  ).trim();

  const itemName = String(
    catalogMatch?.cleanTitle ||
      catalogMatch?.name ||
      source.cleanTitle ||
      source.name ||
      'Llanta Jasman'
  ).trim();

  const productReference = String(
    catalogMatch?.reference ||
      source.product_reference ||
      source.reference ||
      source.sku ||
      itemId
  ).trim();

  const itemBrand = String(
    catalogMatch?.brand ||
      source.item_brand ||
      source.brand ||
      'Jasman'
  ).trim();

  const unitPrice =
    overridePrice !== undefined
      ? parsePriceValue(overridePrice)
      : parsePriceValue(
          source.effectiveUnitPrice ??
            source.unitPrice ??
            source.netPriceNum ??
            source.finalPriceTaxExcluded ??
            catalogMatch?.finalPriceTaxExcluded ??
            source.price
        );

  const quantity = Math.max(
    1,
    Math.round(Number(overrideQuantity ?? source.quantity ?? 1) || 1)
  );

  return {
    item_id: itemId,
    item_name: itemName,
    product_reference: productReference,
    item_brand: itemBrand,
    price: unitPrice,
    quantity,
    currency: 'MXN',
  };
}

export function pushEcommerceDataLayer(eventName, ecommercePayload, extraTopLevel = {}) {
  const dl = ensureDataLayer();
  if (!dl) return false;

  dl.push({ ecommerce: null });
  dl.push({
    event: eventName,
    ...extraTopLevel,
    ecommerce: ecommercePayload,
  });
  return true;
}

function fireNativeMetaPixelEvent(eventName, params) {
  if (
    typeof window === 'undefined' ||
    typeof window.fbq !== 'function' ||
    !window._jasmanMetaInitializedIds ||
    window._jasmanMetaInitializedIds.size === 0
  ) {
    return false;
  }

  try {
    window.fbq('track', eventName, params);
    return true;
  } catch {
    return false;
  }
}

export function trackViewItem(product, unitPrice) {
  if (!product) return false;
  const item = buildDataLayerItem(product, 1, unitPrice);
  const contentIds = [item.item_id];

  fireNativeMetaPixelEvent('ViewContent', {
    content_ids: contentIds,
    contents: [{ id: item.item_id, quantity: 1, item_price: item.price }],
    content_name: item.item_name,
    content_type: 'product',
    value: item.price,
    currency: 'MXN',
  });

  return pushEcommerceDataLayer(
    'view_item',
    {
      currency: 'MXN',
      value: item.price,
      content_ids: contentIds,
      content_type: 'product',
      items: [item],
    },
    {
      content_ids: contentIds,
      content_type: 'product',
    }
  );
}

export function trackAddToCart(product, quantity = 1, unitPrice) {
  if (!product) return false;
  const item = buildDataLayerItem(product, quantity, unitPrice);
  const contentIds = [item.item_id];
  const value = roundPrice(item.price * item.quantity);

  fireNativeMetaPixelEvent('AddToCart', {
    content_ids: contentIds,
    contents: [{ id: item.item_id, quantity: item.quantity, item_price: item.price }],
    content_name: item.item_name,
    content_type: 'product',
    value,
    currency: 'MXN',
  });

  return pushEcommerceDataLayer(
    'add_to_cart',
    {
      currency: 'MXN',
      value,
      content_ids: contentIds,
      content_type: 'product',
      items: [item],
    },
    {
      content_ids: contentIds,
      content_type: 'product',
    }
  );
}

export function trackBeginCheckout(cartItems = [], totalValue, couponCode = '') {
  const items = (Array.isArray(cartItems) ? cartItems : [])
    .map((ci) => {
      const qty = Math.max(1, Number(ci.quantity || 1) || 1);
      const effectiveUnit =
        ci.lineTotalAfterVolume > 0
          ? roundPrice(ci.lineTotalAfterVolume / qty)
          : ci.unitPrice ?? ci.product?.finalPriceTaxExcluded ?? 0;
      return buildDataLayerItem(ci, qty, effectiveUnit);
    })
    .filter(Boolean);

  if (items.length === 0) return false;

  const fallbackValue = items.reduce((acc, it) => acc + it.price * it.quantity, 0);
  const value = totalValue !== undefined ? parsePriceValue(totalValue) : roundPrice(fallbackValue);
  const contentIds = items.map((i) => i.item_id);

  fireNativeMetaPixelEvent('InitiateCheckout', {
    content_ids: contentIds,
    contents: items.map((i) => ({ id: i.item_id, quantity: i.quantity, item_price: i.price })),
    num_items: items.reduce((sum, i) => sum + i.quantity, 0),
    content_type: 'product',
    value,
    currency: 'MXN',
  });

  return pushEcommerceDataLayer(
    'begin_checkout',
    {
      currency: 'MXN',
      value,
      content_ids: contentIds,
      content_type: 'product',
      ...(couponCode ? { coupon: String(couponCode).trim() } : {}),
      items,
    },
    {
      content_ids: contentIds,
      content_type: 'product',
    }
  );
}

export function trackPurchase({
  transactionId,
  items = [],
  value,
  shipping = 0,
  coupon = '',
}) {
  const cleanTxId = String(transactionId || '').trim();
  if (!cleanTxId || hasTrackedPurchase(cleanTxId)) return false;

  const normalizedItems = (Array.isArray(items) ? items : [])
    .map((it) => buildDataLayerItem(it, it.quantity || 1, it.netPriceNum ?? it.unitPrice ?? it.price))
    .filter(Boolean);

  const fallbackValue = normalizedItems.reduce((acc, it) => acc + it.price * it.quantity, 0);
  const resolvedValue =
    value !== undefined && Number(value) > 0
      ? parsePriceValue(value)
      : roundPrice(fallbackValue);

  if (normalizedItems.length === 0 && resolvedValue <= 0) return false;

  markPurchaseTracked(cleanTxId);

  const contentIds = normalizedItems.map((i) => i.item_id);

  fireNativeMetaPixelEvent('Purchase', {
    content_ids: contentIds,
    contents: normalizedItems.map((i) => ({
      id: i.item_id,
      quantity: i.quantity,
      item_price: i.price,
    })),
    num_items: normalizedItems.reduce((sum, i) => sum + i.quantity, 0),
    content_type: 'product',
    value: resolvedValue,
    currency: 'MXN',
  });

  return pushEcommerceDataLayer(
    'purchase',
    {
      transaction_id: cleanTxId,
      currency: 'MXN',
      value: resolvedValue,
      shipping: parsePriceValue(shipping),
      content_ids: contentIds,
      content_type: 'product',
      ...(coupon ? { coupon: String(coupon).trim() } : {}),
      items: normalizedItems,
    },
    {
      transaction_id: cleanTxId,
      content_ids: contentIds,
      content_type: 'product',
    }
  );
}

