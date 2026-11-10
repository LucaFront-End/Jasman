import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  findCatalogProductById,
  loadWixCatalogProducts,
} from '../data/productosMasterData';
import { logoutWixMember, saveWixTiendaOrder } from '../services/wixService';

const STORAGE_KEYS = {
  CART: 'jasman_tienda_cart_v1',
  COUPON: 'jasman_tienda_coupon_10_v1',
  USER: 'jasman_tienda_user_v1',
  ORDERS: 'jasman_tienda_orders_v1',
  BRANCH: 'jasman_tienda_branch_v1',
  DELIVERY_MODE: 'jasman_tienda_delivery_mode_v1',
};

export const BRANCH_INSTALLATION_FEE = 999;

const SYNC_EVENT = 'jasman-tienda-sync';
const UI_EVENT = 'jasman-tienda-ui';

function readJSON(key, fallback) {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key, value) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent(SYNC_EVENT));
  } catch {
    // ignore storage errors
  }
}

export function triggerTiendaUI(action) {
  if (typeof window === 'undefined') return;
  if (action?.type === 'OPEN_USER') {
    const el = document.getElementById('seccion-usuario');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    window.location.href = '/landing-tienda-preview/cuenta';
    return;
  }
  window.dispatchEvent(new CustomEvent(UI_EVENT, { detail: action }));
}

/**
 * Calculates volume discount rate based on total number of tires:
 * - 1 tire: 0%
 * - 2 to 3 tires (Par): 5% extra off
 * - 4+ tires (Juego completo): 10% extra off
 */
export function getVolumeDiscountTier(totalUnits) {
  const units = Number(totalUnits) || 0;
  if (units >= 4) {
    return {
      rate: 0.1,
      percent: 10,
      label: 'Juego de 4+ Llantas (−10% Volumen)',
      nextUnitsNeeded: 0,
      nextPercent: 10,
      progress: 100,
    };
  }
  if (units >= 2) {
    return {
      rate: 0.05,
      percent: 5,
      label: 'Par de Llantas (−5% Volumen)',
      nextUnitsNeeded: 4 - units,
      nextPercent: 10,
      progress: units === 3 ? 75 : 50,
    };
  }
  return {
    rate: 0,
    percent: 0,
    label: 'Precio unitario base',
    nextUnitsNeeded: Math.max(1, 2 - units),
    nextPercent: 5,
    progress: units === 1 ? 25 : 0,
  };
}

export function useTiendaState() {
  const [cart, setCartState] = useState(() => readJSON(STORAGE_KEYS.CART, []));
  const [coupon, setCouponState] = useState(() => readJSON(STORAGE_KEYS.COUPON, null));
  const [user, setUserState] = useState(() => readJSON(STORAGE_KEYS.USER, null));
  const [orders, setOrdersState] = useState(() => readJSON(STORAGE_KEYS.ORDERS, []));
  const [selectedBranchSlug, setSelectedBranchSlugState] = useState(() =>
    readJSON(STORAGE_KEYS.BRANCH, 'jasman-satelite')
  );
  // Default delivery mode is 'shipping' (Entrega Gratis); 'branch' adds $999 installation fee
  const [deliveryMode, setDeliveryModeState] = useState(() =>
    readJSON(STORAGE_KEYS.DELIVERY_MODE, 'shipping')
  );

  const [catalogTick, setCatalogTick] = useState(0);

  useEffect(() => {
    loadWixCatalogProducts().catch(() => {});
    const syncAll = () => {
      setCartState(readJSON(STORAGE_KEYS.CART, []));
      setCouponState(readJSON(STORAGE_KEYS.COUPON, null));
      setUserState(readJSON(STORAGE_KEYS.USER, null));
      setOrdersState(readJSON(STORAGE_KEYS.ORDERS, []));
      setSelectedBranchSlugState(readJSON(STORAGE_KEYS.BRANCH, 'jasman-satelite'));
      setDeliveryModeState(readJSON(STORAGE_KEYS.DELIVERY_MODE, 'shipping'));
      setCatalogTick((t) => t + 1);
    };
    window.addEventListener(SYNC_EVENT, syncAll);
    window.addEventListener('storage', syncAll);
    return () => {
      window.removeEventListener(SYNC_EVENT, syncAll);
      window.removeEventListener('storage', syncAll);
    };
  }, []);

  const addToCart = useCallback((productId, qty = 1, openCartDrawer = true) => {
    const product = findCatalogProductById(productId);
    if (!product || !product.inStock) return false;

    const current = readJSON(STORAGE_KEYS.CART, []);
    const existingIndex = current.findIndex(
      (item) => String(item.productId) === String(product.id)
    );
    const maxQty = Math.max(1, product.quantity);

    let next;
    if (existingIndex >= 0) {
      next = current.map((item, idx) =>
        idx === existingIndex
          ? { ...item, quantity: Math.min(maxQty, item.quantity + qty) }
          : item
      );
    } else {
      next = [...current, { productId: product.id, quantity: Math.min(maxQty, qty) }];
    }

    writeJSON(STORAGE_KEYS.CART, next);
    if (openCartDrawer) {
      triggerTiendaUI({ type: 'OPEN_CART' });
    }
    return true;
  }, []);

  const updateCartQuantity = useCallback((productId, quantity) => {
    const product = findCatalogProductById(productId);
    if (!product) return;
    const current = readJSON(STORAGE_KEYS.CART, []);
    if (quantity <= 0) {
      writeJSON(
        STORAGE_KEYS.CART,
        current.filter(
          (item) =>
            String(item.productId) !== String(productId) &&
            String(item.productId) !== String(product.id)
        )
      );
      return;
    }
    const maxQty = Math.max(1, product.quantity);
    const next = current.map((item) =>
      String(item.productId) === String(productId) ||
      String(item.productId) === String(product.id)
        ? { ...item, quantity: Math.min(maxQty, quantity) }
        : item
    );
    writeJSON(STORAGE_KEYS.CART, next);
  }, []);

  const removeFromCart = useCallback((productId) => {
    const current = readJSON(STORAGE_KEYS.CART, []);
    writeJSON(
      STORAGE_KEYS.CART,
      current.filter((item) => String(item.productId) !== String(productId))
    );
  }, []);

  const clearCart = useCallback(() => {
    writeJSON(STORAGE_KEYS.CART, []);
  }, []);

  const applyFirstPurchaseCoupon = useCallback((couponData) => {
    writeJSON(STORAGE_KEYS.COUPON, couponData);
  }, []);

  const removeCoupon = useCallback(() => {
    writeJSON(STORAGE_KEYS.COUPON, null);
  }, []);

  const saveUser = useCallback((userData) => {
    writeJSON(STORAGE_KEYS.USER, userData);
  }, []);

  const logoutUser = useCallback(() => {
    logoutWixMember();
    writeJSON(STORAGE_KEYS.USER, null);
  }, []);

  const mergeSyncedOrders = useCallback((remoteOrders = []) => {
    if (!Array.isArray(remoteOrders) || remoteOrders.length === 0) return;
    const currentOrders = readJSON(STORAGE_KEYS.ORDERS, []);
    const existingIds = new Set(currentOrders.map((o) => o.id));
    const additions = remoteOrders.filter((ro) => ro && ro.id && !existingIds.has(ro.id));
    if (additions.length > 0) {
      writeJSON(STORAGE_KEYS.ORDERS, [...additions, ...currentOrders]);
    }
  }, []);

  const setSelectedBranch = useCallback((slug) => {
    writeJSON(STORAGE_KEYS.BRANCH, slug);
  }, []);

  const setDeliveryMode = useCallback((mode) => {
    writeJSON(STORAGE_KEYS.DELIVERY_MODE, mode === 'branch' ? 'branch' : 'shipping');
  }, []);

  const createOrderRecord = useCallback((orderPayload) => {
    const currentOrders = readJSON(STORAGE_KEYS.ORDERS, []);
    const newOrder = {
      id: `JSM-${Math.floor(100000 + Math.random() * 900000)}`,
      createdAt: new Date().toISOString(),
      status: 'Solicitud confirmada',
      ...orderPayload,
    };
    writeJSON(STORAGE_KEYS.ORDERS, [newOrder, ...currentOrders]);
    saveWixTiendaOrder(newOrder).catch(() => { });
    return newOrder;
  }, []);

  const cartItems = useMemo(() => {
    void catalogTick;
    return cart
      .map((item) => {
        const product = findCatalogProductById(item.productId);
        if (!product) return null;
        const unitPrice = product.finalPriceTaxExcluded || 0;
        const effectiveUnits = (product.unitsPerItem || 1) * item.quantity;
        return {
          ...item,
          product,
          unitPrice,
          effectiveUnits,
          lineTotal: unitPrice * item.quantity,
        };
      })
      .filter(Boolean);
  }, [cart, catalogTick]);

  const cartCount = useMemo(
    () => cartItems.reduce((acc, item) => acc + item.quantity, 0),
    [cartItems]
  );

  // Total physical tires in cart (counting 2-tire packages as 2 tires)
  const totalTireUnits = useMemo(
    () => cartItems.reduce((acc, item) => acc + item.effectiveUnits, 0),
    [cartItems]
  );

  const subtotal = useMemo(
    () => cartItems.reduce((acc, item) => acc + item.lineTotal, 0),
    [cartItems]
  );

  const volumeTier = useMemo(
    () => getVolumeDiscountTier(totalTireUnits),
    [totalTireUnits]
  );

  const volumeDiscountAmount = useMemo(() => {
    if (subtotal <= 0 || volumeTier.rate <= 0) return 0;
    return subtotal * volumeTier.rate;
  }, [subtotal, volumeTier]);

  const subtotalAfterVolume = useMemo(
    () => Math.max(0, subtotal - volumeDiscountAmount),
    [subtotal, volumeDiscountAmount]
  );

  const discountAmount = useMemo(() => {
    if (!coupon || !coupon.code || subtotalAfterVolume <= 0) return 0;
    return subtotalAfterVolume * 0.1;
  }, [coupon, subtotalAfterVolume]);

  const installationFee = useMemo(
    () => (cartItems.length > 0 && deliveryMode === 'branch' ? BRANCH_INSTALLATION_FEE : 0),
    [cartItems.length, deliveryMode]
  );

  const totalAfterDiscount = useMemo(
    () => Math.max(0, subtotalAfterVolume - discountAmount) + installationFee,
    [subtotalAfterVolume, discountAmount, installationFee]
  );

  return {
    cartItems,
    cartCount,
    totalTireUnits,
    subtotal,
    volumeTier,
    volumeDiscountAmount,
    discountAmount,
    installationFee,
    totalAfterDiscount,
    coupon,
    user,
    orders,
    selectedBranchSlug,
    deliveryMode,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    applyFirstPurchaseCoupon,
    removeCoupon,
    saveUser,
    logoutUser,
    mergeSyncedOrders,
    setSelectedBranch,
    setDeliveryMode,
    createOrderRecord,
  };
}
