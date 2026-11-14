import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { C, F } from '../../hooks/useAnimations';
import { formatMXN } from '../../data/productosMasterData';
import { sucursales } from '../../data/sucursalesData';
import { useTiendaState, triggerTiendaUI } from '../../hooks/useTiendaState';
import { useFlotillasDispatch } from '../../hooks/useFlotillasDispatch';
import IsometricWorkshopScene from '../IsometricWorkshopScene';
import { saveContactoWeb } from '../../services/wixService';
import {
  redirectToJasmanWixCheckout,
  syncAndEstimateWixCart,
  removeCouponFromWixCart,
} from '../../services/wixCheckoutService';
import {
  X,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  Tag,
  Check,
  MessageCircle,
  ArrowRight,
  Truck,
  Loader2,
  Lock,
} from 'lucide-react';

export default function TiendaCartDrawer() {
  const {
    cartItems,
    cartCount,
    totalTireUnits,
    subtotal,
    volumeTier,
    volumeDiscountAmount,
    discountAmount,
    totalAfterDiscount,
    coupon,
    user,
    selectedBranchSlug,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    createOrderRecord,
  } = useTiendaState();

  const { pathname } = useLocation();
  const isLegacyCopyRoute = pathname.includes('copia');
  const {
    bayPhase: fleetBayPhase,
    dispatchedCount: fleetDispatchedCount,
    lastDispatch: fleetLastDispatch,
    activeVehicle: fleetActiveVehicle,
    notifyCartDispatched,
  } = useFlotillasDispatch();

  const [open, setOpen] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [couponFeedback, setCouponFeedback] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [wixEstimate, setWixEstimate] = useState(null);
  const [orderCompleted, setOrderCompleted] = useState(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');

  useEffect(() => {
    const handleUI = (e) => {
      if (e.detail?.type === 'OPEN_CART') {
        setOrderCompleted(null);
        setCheckoutError('');
        setOpen(true);
      }
    };
    window.addEventListener('jasman-tienda-ui', handleUI);
    return () => window.removeEventListener('jasman-tienda-ui', handleUI);
  }, []);

  // Dynamically sync & estimate real Wix Current Cart totals whenever drawer is open
  const cartSyncKey = cartItems
    .map((i) => `${i.product.id}:${i.quantity}`)
    .join('|');

  useEffect(() => {
    if (isLegacyCopyRoute) return undefined;
    if (!cartSyncKey) {
      setWixEstimate(null);
      return undefined;
    }
    if (!open) return undefined;

    let cancelled = false;
    const preserveCoupon = wixEstimate?.appliedCoupon?.code || null;

    syncAndEstimateWixCart({ cartItems, couponCode: preserveCoupon })
      .then((est) => {
        if (!cancelled && est) {
          setWixEstimate(est);
          if (preserveCoupon && !est.appliedCoupon && est.couponError) {
            setCouponFeedback(est.couponError);
          }
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isLegacyCopyRoute, cartSyncKey]);

  if (!open) return null;

  const selectedBranch =
    sucursales.find((s) => s.slug === selectedBranchSlug) || sucursales[0];

  const liveSubtotal =
    !isLegacyCopyRoute && wixEstimate ? wixEstimate.subtotalAmount : subtotal;
  const liveTotal =
    !isLegacyCopyRoute && wixEstimate
      ? wixEstimate.totalAmount
      : isLegacyCopyRoute
        ? totalAfterDiscount
        : subtotal;
  const activeWixCoupon = !isLegacyCopyRoute ? wixEstimate?.appliedCoupon : null;

  const cartWhatsappMessage = [
    'SW- Hola, quisiera asesoría sobre mi carrito en Jasman Tienda:',
    ...cartItems.map(
      (i) =>
        `• ${i.quantity}x ${i.product.cleanTitle} (SKU: ${i.product.reference}) — ${formatMXN(
          i.unitPrice * i.quantity
        )}`
    ),
    activeWixCoupon?.code
      ? `• Cupón Wix activo: ${activeWixCoupon.code}`
      : coupon?.code
        ? `• Cupón activo: ${coupon.code}`
        : null,
    `• Total Con IVA: ${formatMXN(liveTotal)}`,
  ]
    .filter(Boolean)
    .join('\n');

  const cartWhatsappUrl = `https://api.whatsapp.com/send/?phone=5215510024945&text=${encodeURIComponent(
    cartWhatsappMessage
  )}`;

  const handleManualCoupon = async (e) => {
    e.preventDefault();
    const clean = manualCode.trim().toUpperCase();
    if (!clean || couponLoading) return;

    if (isLegacyCopyRoute) {
      setCouponFeedback(
        'Este código aún no está activo. Si te registraste al 10%, recibirás tu cupón oficial por correo electrónico.'
      );
      setManualCode('');
      return;
    }

    setCouponLoading(true);
    setCouponFeedback('');
    try {
      const est = await syncAndEstimateWixCart({
        cartItems,
        couponCode: clean,
      });
      if (est) {
        setWixEstimate(est);
        if (est.appliedCoupon?.code) {
          setCouponFeedback('');
          setManualCode('');
        } else if (est.couponError) {
          setCouponFeedback(est.couponError);
        } else {
          setCouponFeedback(
            'Este código no está activo actualmente. Si te registraste al 10%, recibirás tu cupón oficial por correo.'
          );
        }
      }
    } catch {
      setCouponFeedback(
        'No se pudo validar el código en este momento. Podrás ingresarlo directamente en el Checkout Seguro.'
      );
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveWixCoupon = async () => {
    if (couponLoading) return;
    setCouponLoading(true);
    try {
      const est = await removeCouponFromWixCart();
      setWixEstimate(est);
      setCouponFeedback('');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleConfirmOrder = async () => {
    if (cartItems.length === 0 || checkoutLoading) return;

    // Keep frozen /landing-tienda-preview-copia behavior untouched
    if (isLegacyCopyRoute) {
      const orderRecord = createOrderRecord({
        items: cartItems.map((i) => ({
          id: i.product.id,
          wixId: i.product.wixId || null,
          reference: i.product.reference,
          name: i.product.cleanTitle,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
        })),
        subtotal,
        volumeDiscountAmount,
        discountAmount,
        installationFee: 0,
        deliveryMode: 'shipping',
        total: totalAfterDiscount,
        couponCode: coupon?.code || null,
        branchName: 'Entrega a Domicilio Gratis',
        branchSlug: 'envio-domicilio',
        customer: user || { nombre: 'Cliente Web' },
      });

      const detalleProductos = cartItems
        .map(
          (i) =>
            `${i.quantity}x ${i.product.cleanTitle} (SKU: ${i.product.reference}) — ${formatMXN(
              i.unitPrice * i.quantity
            )} Con IVA`
        )
        .join(' | ');

      saveContactoWeb({
        folio: orderRecord.id,
        nombre: user?.nombre || 'Cliente Tienda Online',
        telefono: user?.telefono || '',
        email: user?.correo || '',
        sucursal: selectedBranch?.name || 'Entrega a Domicilio Gratis',
        tipo: `Orden de Compra (${totalTireUnits} llantas) — Total Con IVA: ${formatMXN(
          totalAfterDiscount
        )}`,
        cupon: coupon?.code || '',
        asunto: `Nueva Orden Tienda ${orderRecord.id} (${cartCount} uds) — ${formatMXN(
          totalAfterDiscount
        )} Con IVA`,
        mensaje: `Productos: ${detalleProductos} | Subtotal: ${formatMXN(subtotal)}${
          volumeDiscountAmount > 0
            ? ` | Descuento por Volumen (${volumeTier.percent}%): -${formatMXN(volumeDiscountAmount)}`
            : ''
        } | Envío: GRATIS Nacional | Total Con IVA: ${formatMXN(totalAfterDiscount)}`,
        origen: 'Confirmación de Orden — Tienda de Llantas',
      }).catch(() => {});

      notifyCartDispatched({
        folio: orderRecord.id,
        unitsCount: totalTireUnits,
        label: `Orden ${orderRecord.id} · ${totalTireUnits} ${totalTireUnits === 1 ? 'llanta' : 'llantas'}`,
      });

      setOrderCompleted(orderRecord);
      clearCart();
      return;
    }

    // Official Wix Managed Checkout Redirect (https://sistemas5160.wixsite.com/website-4)
    setCheckoutLoading(true);
    setCheckoutError('');
    notifyCartDispatched({
      unitsCount: totalTireUnits,
      label: `Despacho Tienda (${totalTireUnits} ${totalTireUnits === 1 ? 'llanta' : 'llantas'})`,
    });
    try {
      await redirectToJasmanWixCheckout({
        cartItems,
        couponCode: activeWixCoupon?.code || coupon?.code || null,
        subtotal: liveSubtotal,
        totalAfterDiscount: liveTotal,
        totalTireUnits,
        liveEstimate: wixEstimate,
      });
    } catch (err) {
      console.error('[TiendaCartDrawer] Checkout redirect error:', err);
      setCheckoutError(
        err?.message ||
          'No se pudo iniciar el Checkout Seguro. Intenta nuevamente o escríbenos por WhatsApp.'
      );
      setCheckoutLoading(false);
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) setOpen(false);
      }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9998,
        background: 'rgba(13, 16, 28, 0.58)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        justifyContent: 'flex-end',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 460,
          height: '100%',
          background: C.white,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-24px 0 60px rgba(0,0,0,0.22)',
        }}
      >
        {/* Drawer Header */}
        <div
          style={{
            padding: '22px 24px',
            borderBottom: `1px solid ${C.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ShoppingBag size={19} color={C.red} />
            <span
              style={{
                fontFamily: F.heading,
                fontSize: 15,
                fontWeight: 800,
                color: C.navy,
                letterSpacing: '-0.01em',
              }}
            >
              Tu Carrito ({cartCount})
            </span>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              border: `1px solid ${C.border}`,
              background: C.white,
              color: C.navy,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Drawer Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
          {orderCompleted ? (
            <div style={{ padding: '28px 8px', textAlign: 'center' }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: 'rgba(22,163,74,0.12)',
                  color: '#16A34A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                }}
              >
                <Check size={28} strokeWidth={2.5} />
              </div>
                <span
                style={{
                  fontFamily: F.heading,
                  fontSize: 10.5,
                  fontWeight: 800,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: '#16A34A',
                }}
              >
                Orden confirmada · {orderCompleted.id}
              </span>
              <h3
                style={{
                  fontFamily: F.heading,
                  fontSize: 22,
                  fontWeight: 900,
                  color: C.navy,
                  margin: '8px 0 10px',
                }}
              >
                Solicitud de compra generada
              </h3>
              <p style={{ fontSize: 13.5, color: C.gray, lineHeight: 1.6, margin: '0 0 16px' }}>
                Tu orden quedó guardada en <strong>Mi Cuenta → Mis Pedidos</strong> con
                entrega/instalación en <strong>{orderCompleted.branchName}</strong>.
              </p>
              <div style={{ marginBottom: 18, textAlign: 'left' }}>
                <IsometricWorkshopScene
                  variant="compact"
                  bayPhase="exiting"
                  showCheck={true}
                  dispatchedCount={fleetDispatchedCount}
                  lastDispatch={
                    fleetLastDispatch || {
                      id: orderCompleted.id,
                      source: 'cart',
                      label: `Pedido ${orderCompleted.id} Despachado`,
                    }
                  }
                  activeVehicle={fleetActiveVehicle}
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  triggerTiendaUI({ type: 'OPEN_USER' });
                }}
                style={{
                  width: '100%',
                  padding: '14px 20px',
                  borderRadius: 12,
                  border: 'none',
                  background: C.navy,
                  color: C.white,
                  fontFamily: F.heading,
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                }}
              >
                Ver en Mi Cuenta
              </button>
            </div>
          ) : cartItems.length === 0 ? (
            <div style={{ padding: '64px 16px', textAlign: 'center' }}>
              <ShoppingBag size={40} color="#CBD5E1" style={{ marginBottom: 14 }} />
              <h4
                style={{
                  fontFamily: F.heading,
                  fontSize: 17,
                  fontWeight: 800,
                  color: C.navy,
                  margin: '0 0 8px',
                }}
              >
                Tu carrito está vacío
              </h4>
              <p style={{ fontSize: 13.5, color: C.gray, margin: '0 0 24px' }}>
                Explora las llantas y paquetes disponibles en el catálogo oficial.
              </p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                style={{
                  padding: '12px 22px',
                  borderRadius: 9999,
                  border: 'none',
                  background: C.red,
                  color: C.white,
                  fontFamily: F.heading,
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                }}
              >
                Ver Productos
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Volume Discount Progress Banner inside Cart */}
              <div
                style={{
                  padding: '12px 14px',
                  borderRadius: 14,
                  background:
                    volumeTier.percent > 0 ? 'rgba(22, 163, 74, 0.07)' : '#FFF5F5',
                  border:
                    volumeTier.percent > 0
                      ? '1px solid rgba(22, 163, 74, 0.25)'
                      : '1px solid rgba(196, 30, 36, 0.2)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 8,
                    marginBottom: 6,
                  }}
                >
                  <span
                    style={{
                      fontFamily: F.heading,
                      fontSize: 11,
                      fontWeight: 800,
                      color: volumeTier.percent > 0 ? '#15803D' : C.red,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                    }}
                  >
                    <Truck size={13} />
                    {isLegacyCopyRoute || (wixEstimate?.automaticDiscounts || []).length > 0
                      ? totalTireUnits >= 4
                        ? '¡5% OFF por juego completo + Envío Gratis!'
                        : totalTireUnits >= 2
                          ? `¡2% OFF activo! Agrega ${4 - totalTireUnits} más para 5% OFF`
                          : 'Agrega 1 llanta más y obtén 2% OFF adicional'
                      : totalTireUnits >= 4
                        ? '¡Juego completo de 4 llantas + Envío Nacional Gratis!'
                        : totalTireUnits >= 2
                          ? 'Par de llantas listo · Envío Nacional Gratis incluido'
                          : 'Envío Nacional Gratis incluido en tu pedido'}
                  </span>
                  <span
                    style={{
                      fontFamily: F.heading,
                      fontSize: 10,
                      fontWeight: 900,
                      color: C.navy,
                    }}
                  >
                    {totalTireUnits}/4 llantas
                  </span>
                </div>
                <div
                  style={{
                    width: '100%',
                    height: 5,
                    borderRadius: 999,
                    background: 'rgba(26, 31, 54, 0.08)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${volumeTier.progress}%`,
                      height: '100%',
                      borderRadius: 999,
                      background: volumeTier.percent > 0 ? '#16A34A' : C.red,
                      transition: 'width 0.3s ease',
                    }}
                  />
                </div>
              </div>

              {cartItems.map(({ product, quantity, lineTotal }) => (
                <div
                  key={product.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '76px 1fr',
                    gap: 14,
                    padding: 14,
                    borderRadius: 14,
                    border: `1px solid ${C.border}`,
                    background: '#FAFAFC',
                  }}
                >
                  <Link
                    to={`/llantas/producto/${product.id}`}
                    onClick={() => setOpen(false)}
                    style={{
                      width: 76,
                      height: 76,
                      borderRadius: 10,
                      background: C.white,
                      border: `1px solid ${C.border}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 6,
                    }}
                  >
                    <img
                      src={product.cutoutImage || product.primaryImage}
                      alt={product.cleanTitle}
                      onError={(e) => {
                        e.currentTarget.src = '/images/service-tires.png';
                      }}
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                  </Link>

                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        gap: 8,
                      }}
                    >
                      <Link
                        to={`/llantas/producto/${product.id}`}
                        onClick={() => setOpen(false)}
                        style={{
                          fontFamily: F.heading,
                          fontSize: 12.5,
                          fontWeight: 700,
                          color: C.navy,
                          textDecoration: 'none',
                          lineHeight: 1.35,
                        }}
                      >
                        {product.cleanTitle}
                      </Link>
                      <button
                        type="button"
                        onClick={() => removeFromCart(product.id)}
                        aria-label="Eliminar"
                        style={{
                          border: 'none',
                          background: 'transparent',
                          color: '#94A3B8',
                          cursor: 'pointer',
                          padding: 2,
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div style={{ fontSize: 11, color: C.gray, marginTop: 3 }}>
                      Ref. {product.reference} · {product.measure || product.brand}
                    </div>

                    <div
                      style={{
                        marginTop: 10,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          borderRadius: 8,
                          border: `1px solid ${C.border}`,
                          background: C.white,
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(product.id, quantity - 1)}
                          style={{
                            width: 26,
                            height: 26,
                            border: 'none',
                            background: 'transparent',
                            color: C.navy,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Minus size={12} />
                        </button>
                        <span
                          style={{
                            padding: '0 10px',
                            fontFamily: F.heading,
                            fontSize: 12,
                            fontWeight: 700,
                            color: C.navy,
                          }}
                        >
                          {quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(product.id, quantity + 1)}
                          style={{
                            width: 26,
                            height: 26,
                            border: 'none',
                            background: 'transparent',
                            color: C.navy,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      <div
                        style={{
                          fontFamily: F.heading,
                          fontSize: 14,
                          fontWeight: 800,
                          color: C.navy,
                        }}
                      >
                        {formatMXN(lineTotal)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Coupon box */}
              <div
                style={{
                  padding: 14,
                  borderRadius: 14,
                  background: activeWixCoupon || (isLegacyCopyRoute && coupon) ? '#FFF1F2' : '#FAFAFC',
                  border: `1px dashed ${activeWixCoupon || (isLegacyCopyRoute && coupon) ? C.red : C.border}`,
                }}
              >
                {activeWixCoupon ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Tag size={14} color={C.red} />
                      <div>
                        <div style={{ fontFamily: F.heading, fontSize: 11.5, fontWeight: 800, color: C.red }}>
                          {activeWixCoupon.code} (Cupón Oficial Aplicado)
                        </div>
                        <div style={{ fontSize: 11, color: '#15803D', fontWeight: 700 }}>
                          Ahorras {formatMXN(activeWixCoupon.amount)}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveWixCoupon}
                      disabled={couponLoading}
                      style={{
                        border: 'none',
                        background: 'rgba(196, 30, 36, 0.1)',
                        color: C.red,
                        borderRadius: 6,
                        padding: '4px 8px',
                        fontSize: 10.5,
                        fontFamily: F.heading,
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      Quitar
                    </button>
                  </div>
                ) : isLegacyCopyRoute && coupon ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Tag size={14} color={C.red} />
                      <div>
                        <div style={{ fontFamily: F.heading, fontSize: 11.5, fontWeight: 800, color: C.red }}>
                          {coupon.code} (10% Primera Compra)
                        </div>
                        <div style={{ fontSize: 11, color: C.gray }}>
                          Ahorras {formatMXN(discountAmount)}
                        </div>
                      </div>
                    </div>
                    <Check size={16} color="#16A34A" />
                  </div>
                ) : (
                  <form onSubmit={handleManualCoupon} style={{ display: 'flex', gap: 8 }}>
                    <input
                      type="text"
                      placeholder="Código promocional"
                      value={manualCode}
                      onChange={(e) => setManualCode(e.target.value)}
                      style={{
                        flex: 1,
                        padding: '9px 12px',
                        borderRadius: 8,
                        border: `1px solid ${C.border}`,
                        fontSize: 12,
                        fontFamily: F.body,
                        outline: 'none',
                      }}
                    />
                    <button
                      type="submit"
                      disabled={couponLoading}
                      style={{
                        padding: '9px 14px',
                        borderRadius: 8,
                        border: 'none',
                        background: C.navy,
                        color: C.white,
                        fontFamily: F.heading,
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: couponLoading ? 'wait' : 'pointer',
                        opacity: couponLoading ? 0.75 : 1,
                      }}
                    >
                      {couponLoading ? '...' : 'Aplicar'}
                    </button>
                  </form>
                )}
                {couponFeedback && (
                  <div style={{ fontSize: 11, color: C.gray, marginTop: 6 }}>{couponFeedback}</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer Totals + Checkout CTAs */}
        {cartItems.length > 0 && !orderCompleted && (
          <div
            style={{
              padding: '20px 24px',
              borderTop: `1px solid ${C.border}`,
              background: '#FAFAFC',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: C.gray }}>
                <span>Subtotal (Con IVA)</span>
                <span>{formatMXN(liveSubtotal)}</span>
              </div>
              {isLegacyCopyRoute ? (
                <>
                  {volumeDiscountAmount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#15803D', fontWeight: 700 }}>
                      <span>{volumeTier.label}</span>
                      <span>−{formatMXN(volumeDiscountAmount)}</span>
                    </div>
                  )}
                  {discountAmount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: C.red, fontWeight: 700 }}>
                      <span>10% Primera Compra ({coupon?.code})</span>
                      <span>−{formatMXN(discountAmount)}</span>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {(wixEstimate?.automaticDiscounts || []).map((ad, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: 13,
                        color: '#15803D',
                        fontWeight: 700,
                      }}
                    >
                      <span>{ad.label}</span>
                      <span>−{formatMXN(ad.amount)}</span>
                    </div>
                  ))}
                  {activeWixCoupon && activeWixCoupon.amount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: C.red, fontWeight: 700 }}>
                      <span>Cupón ({activeWixCoupon.code})</span>
                      <span>−{formatMXN(activeWixCoupon.amount)}</span>
                    </div>
                  )}
                </>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: '#15803D', fontWeight: 700 }}>
                <span>Entrega a Domicilio Nacional</span>
                <span>
                  {!isLegacyCopyRoute && wixEstimate && !wixEstimate.isFreeShipping
                    ? formatMXN(wixEstimate.shippingAmount)
                    : 'GRATIS'}
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  paddingTop: 8,
                  borderTop: `1px solid ${C.border}`,
                }}
              >
                <span style={{ fontFamily: F.heading, fontSize: 14, fontWeight: 800, color: C.navy }}>
                  Total (Con IVA)
                </span>
                <span style={{ fontFamily: F.heading, fontSize: 20, fontWeight: 900, color: C.navy }}>
                  {formatMXN(liveTotal)}
                </span>
              </div>
            </div>

            {checkoutLoading && (
              <div style={{ marginBottom: 12 }}>
                <IsometricWorkshopScene
                  variant="compact"
                  bayPhase={fleetBayPhase}
                  showCheck={true}
                  dispatchedCount={fleetDispatchedCount}
                  lastDispatch={
                    fleetLastDispatch || {
                      id: 'CHECKOUT',
                      source: 'cart',
                      label: `Despachando ${totalTireUnits} ${totalTireUnits === 1 ? 'llanta' : 'llantas'}`,
                    }
                  }
                  activeVehicle={fleetActiveVehicle}
                />
              </div>
            )}

            {checkoutError && (
              <div
                style={{
                  marginBottom: 12,
                  padding: '10px 12px',
                  borderRadius: 10,
                  background: '#FEF2F2',
                  border: '1px solid rgba(196, 30, 36, 0.25)',
                  color: C.red,
                  fontSize: 12,
                  lineHeight: 1.45,
                  fontWeight: 600,
                }}
              >
                {checkoutError}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                type="button"
                onClick={handleConfirmOrder}
                disabled={checkoutLoading}
                style={{
                  width: '100%',
                  padding: '14px 18px',
                  borderRadius: 12,
                  border: 'none',
                  background: checkoutLoading ? '#991B1B' : C.red,
                  color: C.white,
                  fontFamily: F.heading,
                  fontSize: 12,
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  cursor: checkoutLoading ? 'wait' : 'pointer',
                  opacity: checkoutLoading ? 0.88 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  boxShadow: '0 10px 24px rgba(196,30,36,0.25)',
                }}
              >
                {checkoutLoading ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    <span>Redirigiendo a Pago Seguro...</span>
                  </>
                ) : isLegacyCopyRoute ? (
                  <>
                    <span>Confirmar Orden de Compra</span>
                    <ArrowRight size={15} />
                  </>
                ) : (
                  <>
                    <Lock size={14} />
                    <span>Proceder al Pago Seguro</span>
                    <ArrowRight size={15} />
                  </>
                )}
              </button>

              <a
                href={cartWhatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  width: '100%',
                  padding: '13px 18px',
                  borderRadius: 12,
                  border: '1.5px solid rgba(22, 163, 74, 0.28)',
                  background: C.white,
                  color: C.navy,
                  fontFamily: F.heading,
                  fontSize: 12,
                  fontWeight: 800,
                  cursor: 'pointer',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  boxSizing: 'border-box',
                  transition: 'all 0.24s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#16A34A';
                  e.currentTarget.style.borderColor = '#16A34A';
                  e.currentTarget.style.color = '#FFFFFF';
                  e.currentTarget.style.boxShadow = '0 10px 24px rgba(22, 163, 74, 0.24)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = C.white;
                  e.currentTarget.style.borderColor = 'rgba(22, 163, 74, 0.28)';
                  e.currentTarget.style.color = C.navy;
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <MessageCircle size={15} color="currentColor" style={{ color: 'inherit' }} />
                <span>Consultar con Asesor por WhatsApp</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
