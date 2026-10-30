import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { C, F } from '../../hooks/useAnimations';
import { formatMXN } from '../../data/productosMasterData';
import { sucursales } from '../../data/sucursalesData';
import { useTiendaState, triggerTiendaUI } from '../../hooks/useTiendaState';
import { saveContactoWeb } from '../../services/wixService';
import {
  X,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  MapPin,
  Tag,
  Check,
  MessageCircle,
  ArrowRight,
  Truck,
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
    setSelectedBranch,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    applyFirstPurchaseCoupon,
    createOrderRecord,
  } = useTiendaState();

  const [open, setOpen] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [couponFeedback, setCouponFeedback] = useState('');
  const [orderCompleted, setOrderCompleted] = useState(null);

  useEffect(() => {
    const handleUI = (e) => {
      if (e.detail?.type === 'OPEN_CART') {
        setOrderCompleted(null);
        setOpen(true);
      }
    };
    window.addEventListener('jasman-tienda-ui', handleUI);
    return () => window.removeEventListener('jasman-tienda-ui', handleUI);
  }, []);

  if (!open) return null;

  const selectedBranch =
    sucursales.find((s) => s.slug === selectedBranchSlug) || sucursales[0];

  const handleManualCoupon = (e) => {
    e.preventDefault();
    const clean = manualCode.trim().toUpperCase();
    if (!clean) return;
    if (clean.startsWith('JASMAN10') || clean === 'PRIMERA10') {
      applyFirstPurchaseCoupon({
        code: clean,
        discountRate: 0.1,
        createdAt: new Date().toISOString(),
      });
      setCouponFeedback('Cupón 10% aplicado.');
      setManualCode('');
    } else {
      setCouponFeedback('Usa el botón de 10% primera compra para generar tu código.');
    }
  };

  const buildWhatsAppCheckoutUrl = () => {
    const itemsText = cartItems
      .map(
        (item) =>
          `• ${item.quantity}x ${item.product.cleanTitle} (Ref: ${item.product.reference}) - ${formatMXN(
            item.lineTotal
          )}`
      )
      .join('\n');

    const msg = [
      '¡Hola Jasman! Quiero confirmar mi pedido de tienda en línea:',
      '',
      itemsText,
      '',
      `Subtotal (sin IVA): ${formatMXN(subtotal)}`,
      volumeDiscountAmount > 0
        ? `Descuento por volumen (${volumeTier.percent}% OFF): -${formatMXN(volumeDiscountAmount)}`
        : null,
      coupon
        ? `Descuento 10% (${coupon.code}): -${formatMXN(discountAmount)}`
        : null,
      `Total estimado (sin IVA): ${formatMXN(totalAfterDiscount)}`,
      `Sucursal seleccionada: ${selectedBranch?.name || 'Por definir'}`,
      user?.nombre ? `Miembro Wix: ${user.nombre} (${user.telefono || user.correo || ''})` : null,
    ]
      .filter(Boolean)
      .join('\n');

    return `https://wa.me/525543317799?text=${encodeURIComponent(msg)}`;
  };

  const handleConfirmOrder = () => {
    if (cartItems.length === 0) return;

    const orderRecord = createOrderRecord({
      items: cartItems.map((i) => ({
        id: i.product.id,
        reference: i.product.reference,
        name: i.product.cleanTitle,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
      })),
      subtotal,
      volumeDiscountAmount,
      discountAmount,
      total: totalAfterDiscount,
      couponCode: coupon?.code || null,
      branchName: selectedBranch?.name || 'Por definir',
      branchSlug: selectedBranch?.slug || '',
      customer: user || { nombre: 'Cliente Web' },
    });

    saveContactoWeb({
      nombre: user?.nombre || 'Cliente Tienda Online',
      telefono: user?.telefono || '',
      email: user?.correo || '',
      cupon: coupon?.code || '',
      asunto: `Pedido Tienda ${orderRecord.id} (${cartCount} uds) - ${selectedBranch?.name}`,
      origen: 'Carrito Tienda Preview',
    }).catch(() => {});

    setOrderCompleted(orderRecord);
    clearCart();
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
                Orden sincronizada en Wix · {orderCompleted.id}
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
              <p style={{ fontSize: 13.5, color: C.gray, lineHeight: 1.6, margin: '0 0 20px' }}>
                Tu orden quedó guardada en <strong>Mi Cuenta Wix Members → Mis Pedidos</strong> con
                entrega/instalación en <strong>{orderCompleted.branchName}</strong>.
              </p>
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
                    {totalTireUnits >= 4
                      ? '¡10% OFF por juego completo + Envío Gratis!'
                      : totalTireUnits >= 2
                      ? `¡5% OFF activo! Agrega ${4 - totalTireUnits} más para 10% OFF`
                      : 'Agrega 1 llanta más y obtén 5% OFF adicional'}
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
                    to={`/landing-tienda-preview/producto/${product.id}`}
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
                        to={`/landing-tienda-preview/producto/${product.id}`}
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

              {/* Branch selector for pickup / installation */}
              <div
                style={{
                  padding: 14,
                  borderRadius: 14,
                  background: '#F8FAFC',
                  border: `1px solid ${C.border}`,
                }}
              >
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontFamily: F.heading,
                    fontSize: 10.5,
                    fontWeight: 800,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: C.navy,
                    marginBottom: 8,
                  }}
                >
                  <MapPin size={13} color={C.red} /> Sucursal para instalación o recolección
                </label>
                <select
                  value={selectedBranchSlug}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: `1px solid ${C.border}`,
                    background: C.white,
                    fontFamily: F.body,
                    fontSize: 12.5,
                    color: C.navy,
                    outline: 'none',
                  }}
                >
                  {sucursales.map((s) => (
                    <option key={s.slug} value={s.slug}>
                      {s.name} ({s.zone})
                    </option>
                  ))}
                </select>
              </div>

              {/* Coupon box */}
              <div
                style={{
                  padding: 14,
                  borderRadius: 14,
                  background: coupon ? '#FFF1F2' : '#FAFAFC',
                  border: `1px dashed ${coupon ? C.red : C.border}`,
                }}
              >
                {coupon ? (
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
                      placeholder="Código de cupón (ej. JASMAN10)"
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
                      style={{
                        padding: '9px 14px',
                        borderRadius: 8,
                        border: 'none',
                        background: C.navy,
                        color: C.white,
                        fontFamily: F.heading,
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      Aplicar
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
                <span>Subtotal (sin IVA)</span>
                <span>{formatMXN(subtotal)}</span>
              </div>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: '#15803D', fontWeight: 700 }}>
                <span>Envío Nacional</span>
                <span>GRATIS</span>
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
                  Total (sin IVA)
                </span>
                <span style={{ fontFamily: F.heading, fontSize: 20, fontWeight: 900, color: C.navy }}>
                  {formatMXN(totalAfterDiscount)}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                type="button"
                onClick={handleConfirmOrder}
                style={{
                  width: '100%',
                  padding: '14px 18px',
                  borderRadius: 12,
                  border: 'none',
                  background: C.red,
                  color: C.white,
                  fontFamily: F.heading,
                  fontSize: 12,
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  boxShadow: '0 10px 24px rgba(196,30,36,0.25)',
                }}
              >
                Confirmar Orden de Compra <ArrowRight size={15} />
              </button>

              <a
                href={buildWhatsAppCheckoutUrl()}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  width: '100%',
                  padding: '13px 18px',
                  borderRadius: 12,
                  border: `1px solid ${C.border}`,
                  background: C.white,
                  color: C.navy,
                  fontFamily: F.heading,
                  fontSize: 12,
                  fontWeight: 700,
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                <MessageCircle size={15} color="#16A34A" /> Finalizar Pedido por WhatsApp
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
