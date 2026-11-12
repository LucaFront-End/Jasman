import { createClient, OAuthStrategy, EMPTY_TOKENS } from '@wix/sdk';
import { currentCart, orders } from '@wix/ecom';
import { redirects } from '@wix/redirects';
import { items } from '@wix/data';
import {
  WIX_STORES_APP_ID,
  WIX_CLIENT_ID,
  JASMAN_WIX_BASE_HOST,
  JASMAN_WIX_BASE_PATH,
  JASMAN_WIX_BASE_URL,
  TOKEN_KEY,
  MEMBER_TOKENS_KEY,
  LAST_CHECKOUT_STORAGE_KEY,
} from '../lib/wixClient';
import {
  loadWixCatalogProducts,
  findCatalogProductById,
  formatMXN,
} from '../data/productosMasterData';
import { formatWixImageUrl } from './wixService';

function hasValidTokenPair(parsed) {
  return Boolean(parsed?.accessToken?.value && parsed?.refreshToken?.value);
}

/**
 * Token storage modeled on Kamibi's WixContext:
 * - Prefers active Wix Member tokens if the customer logged into Mi Cuenta
 * - Otherwise persists visitor session tokens in localStorage so currentCart
 *   and orders.getOrder remain bound to the same buyer session across redirects
 */
function createTokenStorage() {
  return {
    getTokens() {
      if (typeof window === 'undefined') return EMPTY_TOKENS;
      try {
        const memberRaw = window.localStorage.getItem(MEMBER_TOKENS_KEY);
        if (memberRaw) {
          const parsedMember = JSON.parse(memberRaw);
          if (hasValidTokenPair(parsedMember)) {
            return parsedMember;
          }
        }
      } catch {
        // ignore malformed member tokens
      }

      try {
        const raw = window.localStorage.getItem(TOKEN_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (hasValidTokenPair(parsed)) {
            return parsed;
          }
        }
      } catch {
        window.localStorage.removeItem(TOKEN_KEY);
      }
      return EMPTY_TOKENS;
    },
    setTokens(tokens) {
      if (typeof window === 'undefined') return;
      // Protect active member tokens from accidental visitor overwrite
      try {
        const memberRaw = window.localStorage.getItem(MEMBER_TOKENS_KEY);
        if (memberRaw) {
          const currentMember = JSON.parse(memberRaw);
          const incomingRefresh = tokens?.refreshToken?.value;
          const memberRefresh = currentMember?.refreshToken?.value;
          if (memberRefresh && incomingRefresh && memberRefresh === incomingRefresh) {
            window.localStorage.setItem(MEMBER_TOKENS_KEY, JSON.stringify(tokens));
            return;
          }
          if (hasValidTokenPair(currentMember)) {
            return;
          }
        }
      } catch {
        // continue storing visitor session tokens
      }

      try {
        window.localStorage.setItem(TOKEN_KEY, JSON.stringify(tokens));
      } catch {
        // ignore quota errors
      }
    },
  };
}

export const wixCheckoutClient = createClient({
  modules: { currentCart, orders, redirects, items },
  auth: OAuthStrategy({
    clientId: WIX_CLIENT_ID,
    tokenStorage: createTokenStorage(),
  }),
});

let sessionInitPromise = null;
let lastSyncedItemsSignature = '';
let lastSyncedCartCache = null;
let cartMutex = Promise.resolve();

function runExclusiveCartOp(fn) {
  const next = cartMutex.then(fn, fn);
  cartMutex = next.catch(() => {});
  return next;
}

function computeItemsSignature(resolvedEntries) {
  return resolvedEntries
    .map(
      (e) =>
        `${e.lineItem.catalogReference.catalogItemId}:${e.lineItem.quantity}`
    )
    .join('|');
}

export async function ensureWixCheckoutSession() {
  if (typeof window === 'undefined') return wixCheckoutClient;

  const existingMember = window.localStorage.getItem(MEMBER_TOKENS_KEY);
  const existingVisitor = window.localStorage.getItem(TOKEN_KEY);
  if (existingMember || existingVisitor) {
    try {
      const parsed = JSON.parse(existingMember || existingVisitor);
      if (hasValidTokenPair(parsed)) {
        return wixCheckoutClient;
      }
    } catch {
      // regenerate below
    }
  }

  if (!sessionInitPromise) {
    sessionInitPromise = (async () => {
      try {
        const tokens = await wixCheckoutClient.auth.generateVisitorTokens();
        wixCheckoutClient.auth.setTokens(tokens);
      } catch (err) {
        console.error('[Jasman Checkout] Failed to generate Wix visitor tokens:', err);
      } finally {
        sessionInitPromise = null;
      }
      return wixCheckoutClient;
    })();
  }

  return sessionInitPromise;
}

/**
 * Ensures the Wix redirect URL always targets Jasman's Wix base domain:
 * https://sistemas5160.wixsite.com/website-4/...
 */
export function normalizeJasmanWixCheckoutUrl(rawFullUrl) {
  if (!rawFullUrl || typeof rawFullUrl !== 'string') return rawFullUrl;

  try {
    const outerUrl = new URL(rawFullUrl);
    const innerRedirectRaw = outerUrl.searchParams.get('redirectUrl');

    const outerAlreadyMatches =
      outerUrl.protocol === 'https:' &&
      outerUrl.host === JASMAN_WIX_BASE_HOST &&
      outerUrl.pathname.startsWith(JASMAN_WIX_BASE_PATH);

    const innerAlreadyMatches =
      !innerRedirectRaw || innerRedirectRaw.startsWith(JASMAN_WIX_BASE_URL);

    if (outerAlreadyMatches && innerAlreadyMatches) {
      return rawFullUrl;
    }

    outerUrl.protocol = 'https:';
    outerUrl.host = JASMAN_WIX_BASE_HOST;
    if (!outerUrl.pathname.startsWith(JASMAN_WIX_BASE_PATH)) {
      const cleanOuterPath = outerUrl.pathname.startsWith('/')
        ? outerUrl.pathname
        : `/${outerUrl.pathname}`;
      outerUrl.pathname = `${JASMAN_WIX_BASE_PATH}${cleanOuterPath === '/' ? '' : cleanOuterPath}`;
    }

    if (innerRedirectRaw) {
      try {
        const innerUrl = new URL(innerRedirectRaw);
        innerUrl.protocol = 'https:';
        innerUrl.host = JASMAN_WIX_BASE_HOST;
        if (!innerUrl.pathname.startsWith(JASMAN_WIX_BASE_PATH)) {
          const cleanInnerPath = innerUrl.pathname.startsWith('/')
            ? innerUrl.pathname
            : `/${innerUrl.pathname}`;
          innerUrl.pathname = `${JASMAN_WIX_BASE_PATH}${cleanInnerPath === '/' ? '' : cleanInnerPath}`;
        }
        outerUrl.searchParams.set('redirectUrl', innerUrl.toString());
      } catch {
        // leave inner redirectUrl untouched if not a standard URL
      }
    }

    return outerUrl.toString();
  } catch (err) {
    console.warn('[Jasman Checkout] Fallback string normalization on checkout URL:', err);
    let fallbackUrl = rawFullUrl;
    for (const brokenDomain of ['https://www.jasman.com.mx', 'https://jasman.com.mx']) {
      if (fallbackUrl.startsWith(brokenDomain)) {
        fallbackUrl = JASMAN_WIX_BASE_URL + fallbackUrl.slice(brokenDomain.length);
      }
    }
    return fallbackUrl;
  }
}

async function resolveWixLineItems(cartItems) {
  const needsCatalogLoad = cartItems.some((item) => !item?.product?.wixId);
  if (needsCatalogLoad) {
    await loadWixCatalogProducts();
  }

  const resolved = [];
  for (const item of cartItems) {
    const prod = item.product || {};
    const liveMatch =
      (prod.wixId && prod) ||
      findCatalogProductById(prod.id) ||
      findCatalogProductById(prod.reference) ||
      null;

    const catalogItemId = liveMatch?.wixId || prod.wixId || null;
    if (!catalogItemId) continue;

    const catalogReference = {
      appId: WIX_STORES_APP_ID,
      catalogItemId,
    };

    if (prod.explicitVariantId || liveMatch?.explicitVariantId) {
      catalogReference.options = {
        variantId: prod.explicitVariantId || liveMatch.explicitVariantId,
      };
    }

    resolved.push({
      lineItem: {
        catalogReference,
        quantity: Math.max(1, Number(item.quantity) || 1),
      },
      localItem: item,
      resolvedProduct: liveMatch || prod,
    });
  }

  return resolved;
}

function parseWixCartEstimate(estimate, couponError = '') {
  if (!estimate) return null;

  const payNow = estimate.payNow || {};
  const cartObj = estimate.cart || {};

  const subtotalAmount = Number(
    payNow.subtotal?.amount ?? cartObj.subtotal?.amount ?? 0
  );
  const discountAmount = Number(
    payNow.discount?.amount ?? cartObj.discount?.amount ?? 0
  );
  const shippingAmount = Number(payNow.shipping?.amount ?? 0);
  const taxAmount = Number(payNow.tax?.amount ?? 0);
  const totalAmount = Number(
    payNow.total?.amount ??
      cartObj.subtotalAfterDiscounts?.amount ??
      Math.max(0, subtotalAmount - discountAmount + shippingAmount + taxAmount)
  );

  const shippingTitle =
    estimate.shippingInfo?.selectedCarrierServiceOption?.title ||
    'Entrega a Domicilio Nacional';

  const rawDiscounts =
    estimate.appliedDiscounts || cartObj.appliedDiscounts || [];

  let appliedCoupon = null;
  const automaticDiscounts = [];

  for (const d of rawDiscounts) {
    if (d.coupon?.code) {
      appliedCoupon = {
        code: d.coupon.code,
        name: d.coupon.name || d.coupon.code,
        amount: Number(d.coupon.amount?.amount ?? discountAmount) || 0,
      };
    } else {
      const ruleName =
        d.merchantDiscount?.description ||
        d.discountRuleName ||
        'Descuento Automático';
      const ruleAmt =
        Number(
          d.merchantDiscount?.amount?.amount ??
            d.discount?.amount?.amount ??
            0
        ) || 0;
      if (ruleAmt > 0) {
        automaticDiscounts.push({ label: ruleName, amount: ruleAmt });
      }
    }
  }

  return {
    subtotalAmount,
    discountAmount,
    shippingAmount,
    isFreeShipping: shippingAmount === 0,
    shippingTitle,
    taxAmount,
    totalAmount,
    appliedCoupon,
    automaticDiscounts,
    couponError,
    cart: cartObj,
  };
}

function formatWixCouponError(err) {
  const rawCode = String(
    err?.details?.applicationError?.code ||
      err?.details?.validationError?.fieldViolations?.[0]?.violatedRule ||
      ''
  ).toUpperCase();
  const rawDesc = String(err?.details?.applicationError?.description || '').trim();
  const rawMsg = String(rawDesc || err?.message || '').toUpperCase();

  if (
    rawCode.includes('SUBTOTAL') ||
    rawMsg.includes('MINIMUM') ||
    rawMsg.includes('SUBTOTAL')
  ) {
    return rawDesc && /\d/.test(rawDesc)
      ? `Este cupón requiere un monto mínimo de compra de ${rawDesc} MXN para aplicarse.`
      : 'Este cupón requiere un monto mínimo de compra mayor para aplicarse.';
  }
  if (rawCode.includes('EXPIRED') || rawMsg.includes('EXPIRED')) {
    return 'Este cupón ha expirado.';
  }
  if (rawCode.includes('LIMIT') || rawMsg.includes('LIMIT')) {
    return 'Este cupón ya alcanzó su límite de uso.';
  }
  return 'Este código no está activo actualmente. Si te registraste al 10%, recibirás tu cupón oficial por correo.';
}

/**
 * Syncs local cart items to Wix eCommerce Current Cart and returns 100% live
 * totals, shipping, automatic discounts, and validated Wix coupons.
 */
export async function syncAndEstimateWixCart({
  cartItems = [],
  couponCode = null,
} = {}) {
  return runExclusiveCartOp(async () => {
    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      lastSyncedItemsSignature = '';
      lastSyncedCartCache = null;
      return null;
    }

    await ensureWixCheckoutSession();

    const resolvedEntries = await resolveWixLineItems(cartItems);
    if (resolvedEntries.length === 0) return null;

    const signature = computeItemsSignature(resolvedEntries);

    // Only recreate Wix currentCart lineItems when items or quantities actually changed
    if (signature !== lastSyncedItemsSignature) {
      await wixCheckoutClient.currentCart.deleteCurrentCart().catch(() => {});
      const addRes = await wixCheckoutClient.currentCart.addToCurrentCart({
        lineItems: resolvedEntries.map((e) => e.lineItem),
      });
      lastSyncedItemsSignature = signature;
      lastSyncedCartCache = addRes?.cart || null;
    }

    let couponError = '';
    if (couponCode) {
      try {
        const updated = await wixCheckoutClient.currentCart.updateCurrentCart({
          couponCode: String(couponCode).trim(),
        });
        if (updated?.cart) {
          lastSyncedCartCache = updated.cart;
        }
      } catch (err) {
        couponError = formatWixCouponError(err);
      }
    }

    const estimate =
      await wixCheckoutClient.currentCart.estimateCurrentCartTotals();
    if (estimate?.cart) {
      lastSyncedCartCache = estimate.cart;
    }

    return parseWixCartEstimate(estimate, couponError);
  });
}

/**
 * Removes an applied coupon from Wix Current Cart and returns updated live totals.
 */
export async function removeCouponFromWixCart() {
  return runExclusiveCartOp(async () => {
    await ensureWixCheckoutSession();
    await wixCheckoutClient.currentCart.removeCouponFromCurrentCart().catch(() => {});
    const estimate =
      await wixCheckoutClient.currentCart.estimateCurrentCartTotals();
    if (estimate?.cart) {
      lastSyncedCartCache = estimate.cart;
    }
    return parseWixCartEstimate(estimate, '');
  });
}

/**
 * Clears the current Wix eCommerce cart (used after purchase completion on /thank-you).
 */
export async function clearWixCurrentCart() {
  return runExclusiveCartOp(async () => {
    lastSyncedItemsSignature = '';
    lastSyncedCartCache = null;
    try {
      await ensureWixCheckoutSession();
      await wixCheckoutClient.currentCart.deleteCurrentCart();
    } catch {
      // OWNED_CART_NOT_FOUND is expected when cart is already empty
    }
  });
}

/**
 * Syncs Jasman's cart items into Wix eCommerce Current Cart (reusing existing
 * synced cart when already up-to-date), creates a Wix Checkout, generates a
 * Wix Redirect Session targeting https://sistemas5160.wixsite.com/website-4,
 * caches the snapshot for /thank-you, and redirects the browser.
 */
export async function redirectToJasmanWixCheckout({
  cartItems = [],
  couponCode = null,
  subtotal = 0,
  totalAfterDiscount = 0,
  totalTireUnits = 0,
  liveEstimate = null,
} = {}) {
  return runExclusiveCartOp(async () => {
    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      throw new Error('Tu carrito está vacío.');
    }

    await ensureWixCheckoutSession();

    const resolvedEntries = await resolveWixLineItems(cartItems);
    if (resolvedEntries.length === 0) {
      throw new Error(
        'No se pudieron sincronizar los productos con el catálogo oficial de Wix. Intenta de nuevo en unos segundos.'
      );
    }

    const signature = computeItemsSignature(resolvedEntries);
    let syncedCart = lastSyncedCartCache;

    if (signature !== lastSyncedItemsSignature || !syncedCart) {
      await wixCheckoutClient.currentCart.deleteCurrentCart().catch(() => {});
      const addResponse = await wixCheckoutClient.currentCart.addToCurrentCart({
        lineItems: resolvedEntries.map((entry) => entry.lineItem),
      });
      syncedCart = addResponse?.cart || null;
      lastSyncedItemsSignature = signature;
      lastSyncedCartCache = syncedCart;

      if (couponCode) {
        try {
          const updated = await wixCheckoutClient.currentCart.updateCurrentCart({
            couponCode: String(couponCode).trim(),
          });
          if (updated?.cart) {
            syncedCart = updated.cart;
            lastSyncedCartCache = syncedCart;
          }
        } catch {
          // ignore invalid/inactive coupon during checkout redirect
        }
      }
    } else if (couponCode && !liveEstimate?.appliedCoupon) {
      try {
        const updated = await wixCheckoutClient.currentCart.updateCurrentCart({
          couponCode: String(couponCode).trim(),
        });
        if (updated?.cart) {
          syncedCart = updated.cart;
          lastSyncedCartCache = syncedCart;
        }
      } catch {
        // ignore invalid/inactive coupon during checkout redirect
      }
    }

    const checkout = await wixCheckoutClient.currentCart.createCheckoutFromCurrentCart({
      channelType: 'WEB',
    });

    if (!checkout?.checkoutId) {
      throw new Error('No se pudo inicializar la sesión de pago en Wix.');
    }

    const origin =
      typeof window !== 'undefined' ? window.location.origin : 'https://www.jasman.com.mx';

    const { redirectSession } = await wixCheckoutClient.redirects.createRedirectSession({
      ecomCheckout: { checkoutId: checkout.checkoutId },
      callbacks: {
        postFlowUrl: `${origin}/llantas`,
        thankYouPageUrl: `${origin}/thank-you`,
      },
    });

    if (!redirectSession?.fullUrl) {
      throw new Error('No se pudo obtener la URL de redirección al checkout de Wix.');
    }

    const checkoutUrl = normalizeJasmanWixCheckoutUrl(redirectSession.fullUrl);

    // Cache checkout snapshot in sessionStorage for instant display on /thank-you
    if (typeof window !== 'undefined') {
      try {
        const wixLineItems = syncedCart?.lineItems || [];
        const snapshotItems = resolvedEntries.map(({ localItem, resolvedProduct }, idx) => {
          const wixItem = wixLineItems[idx] || {};
          const qty = Math.max(1, Number(localItem.quantity) || 1);
          const unitNum = Number(
            wixItem.price?.amount ||
              localItem.unitPrice ||
              resolvedProduct.finalPriceTaxExcluded ||
              0
          );
          const rawWixImg = wixItem.image?.url || wixItem.image || '';
          const localCutout = resolvedProduct.cutoutImage || resolvedProduct.primaryImage || '';
          const imageUrl =
            localCutout ||
            formatWixImageUrl(rawWixImg, '/images/service-tires.png');

          return {
            id: resolvedProduct.id,
            wixId: resolvedProduct.wixId || null,
            catalogItemId: resolvedProduct.wixId || null,
            sku: resolvedProduct.reference || '',
            name:
              resolvedProduct.cleanTitle ||
              wixItem.productName?.translated ||
              wixItem.productName?.original ||
              resolvedProduct.name ||
              'Llanta Oficial Jasman',
            quantity: qty,
            price: formatMXN(unitNum),
            totalPrice: formatMXN(unitNum * qty),
            unitPriceNum: unitNum,
            image: imageUrl,
            options: [
              resolvedProduct.measure ? `Medida: ${resolvedProduct.measure}` : null,
              resolvedProduct.reference ? `SKU: ${resolvedProduct.reference}` : null,
            ].filter(Boolean),
          };
        });

        const computedSubtotalNum =
          liveEstimate?.subtotalAmount ||
          Number(syncedCart?.subtotal?.amount) ||
          Number(subtotal) ||
          0;
        const computedDiscountNum = liveEstimate?.discountAmount || 0;
        const computedTotalNum =
          liveEstimate?.totalAmount ||
          Number(syncedCart?.subtotalAfterDiscounts?.amount) ||
          Number(syncedCart?.subtotal?.amount) ||
          Number(totalAfterDiscount) ||
          computedSubtotalNum;

        window.sessionStorage.setItem(
          LAST_CHECKOUT_STORAGE_KEY,
          JSON.stringify({
            checkoutId: checkout.checkoutId,
            items: snapshotItems,
            totalQuantity:
              totalTireUnits ||
              snapshotItems.reduce((acc, curr) => acc + (curr.quantity || 1), 0),
            subtotal: formatMXN(computedSubtotalNum),
            subtotalAmount: computedSubtotalNum,
            total: formatMXN(computedTotalNum),
            totalAmount: computedTotalNum,
            isFreeShipping: liveEstimate ? liveEstimate.isFreeShipping : true,
            shipping:
              liveEstimate && !liveEstimate.isFreeShipping
                ? formatMXN(liveEstimate.shippingAmount)
                : 'GRATIS',
            discount:
              computedDiscountNum > 0 ? `-${formatMXN(computedDiscountNum)}` : null,
            couponCode: liveEstimate?.appliedCoupon?.code || couponCode || '',
            currency: 'MXN',
            timestamp: Date.now(),
          })
        );
      } catch (storageErr) {
        console.warn('[Jasman Checkout] Failed to cache checkout snapshot:', storageErr);
      }

      window.location.href = checkoutUrl;
    }

    return {
      checkoutId: checkout.checkoutId,
      checkoutUrl,
    };
  });
}
