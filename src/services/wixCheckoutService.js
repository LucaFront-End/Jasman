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
 *
 * Since www.jasman.com.mx is hosted on Vercel (Headless frontend), any checkout
 * redirect URL that accidentally points to jasman.com.mx or another host is
 * normalized to https://sistemas5160.wixsite.com/website-4 while preserving
 * postFlowUrl and thankYouPageUrl callbacks back to the storefront origin.
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

    // Preserve exact byte-for-byte Wix URL if it already points to sistemas5160.wixsite.com/website-4
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

/**
 * Resolves live Wix catalog UUID (`wixId`) for every item in Jasman's cart.
 */
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

/**
 * Clears the current Wix eCommerce cart (used after purchase completion on /thank-you).
 */
export async function clearWixCurrentCart() {
  try {
    await ensureWixCheckoutSession();
    await wixCheckoutClient.currentCart.deleteCurrentCart();
  } catch {
    // OWNED_CART_NOT_FOUND is expected when cart is already empty
  }
}

/**
 * Syncs Jasman's cart items into Wix eCommerce Current Cart, creates a Wix Checkout,
 * generates a Wix Redirect Session targeting https://sistemas5160.wixsite.com/website-4,
 * caches the snapshot for /thank-you, and redirects the browser.
 */
export async function redirectToJasmanWixCheckout({
  cartItems = [],
  couponCode = null,
  subtotal = 0,
  volumeDiscountAmount = 0,
  discountAmount = 0,
  totalAfterDiscount = 0,
  totalTireUnits = 0,
} = {}) {
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

  // Reset current Wix cart so quantities always match the exact drawer selection
  await wixCheckoutClient.currentCart.deleteCurrentCart().catch(() => {});

  const addResponse = await wixCheckoutClient.currentCart.addToCurrentCart({
    lineItems: resolvedEntries.map((entry) => entry.lineItem),
  });

  let syncedCart = addResponse?.cart || null;

  // Apply coupon code in Wix currentCart if provided and active in Wix
  if (couponCode) {
    try {
      const updated = await wixCheckoutClient.currentCart.updateCurrentCart({
        couponCode: String(couponCode).trim(),
      });
      if (updated?.cart) {
        syncedCart = updated.cart;
      }
    } catch (couponErr) {
      console.warn('[Jasman Checkout] Coupon not applied on currentCart:', couponErr?.message || couponErr);
    }
  }

  // Create Wix eCommerce Checkout from Current Cart
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
        Number(syncedCart?.subtotal?.amount) || Number(subtotal) || 0;
      const computedTotalNum =
        Number(syncedCart?.subtotal?.amount) || Number(totalAfterDiscount) || computedSubtotalNum;
      const totalDiscountNum =
        (Number(volumeDiscountAmount) || 0) + (Number(discountAmount) || 0);

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
          isFreeShipping: true,
          shipping: 'GRATIS',
          discount: totalDiscountNum > 0 ? `-${formatMXN(totalDiscountNum)}` : null,
          couponCode: couponCode || '',
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
}

