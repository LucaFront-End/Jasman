import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { C, F } from '../hooks/useAnimations';
import {
  findCatalogProductById,
  formatMXN,
  useWixCatalogProducts,
} from '../data/productosMasterData';
import { useTiendaState } from '../hooks/useTiendaState';
import { useFlotillasDispatch } from '../hooks/useFlotillasDispatch';
import IsometricWorkshopScene from '../components/IsometricWorkshopScene';
import { LAST_CHECKOUT_STORAGE_KEY } from '../lib/wixClient';
import {
  wixCheckoutClient,
  clearWixCurrentCart,
} from '../services/wixCheckoutService';
import { formatWixImageUrl, saveContactoWeb } from '../services/wixService';
import TiendaNavbar from '../components/tienda/TiendaNavbar';
import TiendaCartDrawer from '../components/tienda/TiendaCartDrawer';
import TiendaAuthModal from '../components/tienda/TiendaAuthModal';
import TiendaLiveChatWidget from '../components/tienda/TiendaLiveChatWidget';
import {
  Check,
  ShieldCheck,
  Truck,
  Package,
  MapPin,
  Mail,
  Phone,
  ArrowRight,
  MessageCircle,
  Tag,
} from 'lucide-react';

const NOTIFIED_ORDERS_KEY = 'jasman_notified_wix_orders_v1';

function resolveLineItemImage(item) {
  if (item?.image && !String(item.image).includes('missing-media')) {
    return item.image;
  }
  const catalogMatch =
    findCatalogProductById(item?.catalogItemId) ||
    findCatalogProductById(item?.wixId) ||
    findCatalogProductById(item?.sku) ||
    findCatalogProductById(item?.id);

  if (catalogMatch) {
    return catalogMatch.cutoutImage || catalogMatch.primaryImage || '/images/service-tires.png';
  }
  return '/images/service-tires.png';
}

export default function ThankYouPage() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId') || searchParams.get('checkoutId');
  const { clearCart, mergeSyncedOrders } = useTiendaState();
  const {
    bayPhase: fleetBayPhase,
    dispatchedCount: fleetDispatchedCount,
    lastDispatch: fleetLastDispatch,
    activeVehicle: fleetActiveVehicle,
    notifyCartDispatched,
  } = useFlotillasDispatch();
  // Ensure live Wix catalog is loaded so studio tire cutouts resolve by catalogItemId/SKU
  useWixCatalogProducts();

  const [orderDetails, setOrderDetails] = useState(() => {
    if (typeof window === 'undefined') return null;
    try {
      const cached = window.sessionStorage.getItem(LAST_CHECKOUT_STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (!parsed.timestamp || Date.now() - parsed.timestamp < 2 * 60 * 60 * 1000) {
          return parsed;
        }
      }
    } catch {
      // ignore sessionStorage read errors
    }
    return null;
  });
  const [loadedOrderId, setLoadedOrderId] = useState(null);
  const isLoading = Boolean(orderId) && loadedOrderId !== orderId;
  const hasNotifiedDispatchRef = useRef(false);

  useEffect(() => {
    window.scrollTo(0, 0);

    // Reset both local Jasman cart and Wix eCom currentCart upon completed purchase
    clearCart();
    clearWixCurrentCart().catch(() => {});

    if (!hasNotifiedDispatchRef.current) {
      hasNotifiedDispatchRef.current = true;
      notifyCartDispatched({
        folio: orderId ? `#${String(orderId).substring(0, 8).toUpperCase()}` : undefined,
        label: 'Pedido Despachado · Salida de Almacén Jasman',
      });
    }

    if (!orderId) {
      return undefined;
    }

    let isMounted = true;

    function recordCompletedOrderOnce(normalized) {
      if (!normalized || typeof window === 'undefined') return;

      const orderDisplayId =
        normalized.orderNumber || `#${String(orderId).substring(0, 8).toUpperCase()}`;

      mergeSyncedOrders([
        {
          id: orderDisplayId,
          wixOrderId: orderId,
          createdAt: normalized.createdDate || new Date().toISOString(),
          status:
            normalized.paymentStatus === 'NOT_PAID'
              ? 'Pago en validación'
              : 'Pagado · En preparación',
          items: (normalized.items || []).map((it) => ({
            id: it.sku || it.id,
            wixId: it.catalogItemId || null,
            reference: it.sku || '',
            name: it.name || 'Llanta Oficial Jasman',
            quantity: it.quantity || 1,
            unitPrice:
              it.netPriceNum ||
              it.originalPriceNum ||
              it.unitPriceNum ||
              0,
          })),
          subtotal: normalized.subtotalAmount || 0,
          total: normalized.totalAmount || 0,
          couponCode: normalized.couponCode || null,
          branchName: normalized.shippingAddress || 'Entrega a Domicilio Nacional',
          customer: {
            nombre: normalized.customerName || 'Cliente Jasman',
            correo: normalized.customerEmail || '',
            telefono: normalized.customerPhone || '',
          },
        },
      ]);

      try {
        const notified = JSON.parse(
          window.localStorage.getItem(NOTIFIED_ORDERS_KEY) || '[]'
        );
        if (!notified.includes(orderId)) {
          notified.unshift(orderId);
          window.localStorage.setItem(
            NOTIFIED_ORDERS_KEY,
            JSON.stringify(notified.slice(0, 50))
          );

          const itemsSummary = (normalized.items || [])
            .map(
              (it) =>
                `${it.quantity}x ${it.name}${it.sku ? ` (SKU: ${it.sku})` : ''} — ${
                  it.totalPrice || it.price || ''
                }`
            )
            .join(' | ');

          saveContactoWeb({
            folio: orderDisplayId,
            nombre: normalized.customerName || 'Cliente Checkout Wix',
            telefono: normalized.customerPhone || '',
            email: normalized.customerEmail || '',
            sucursal: normalized.shippingAddress || 'Envío a Domicilio Nacional',
            tipo: `Pedido Pagado Wix ${orderDisplayId} — Total Con IVA: ${
              normalized.total || ''
            }`,
            cupon: normalized.couponCode || '',
            asunto: `Confirmación de Compra Wix ${orderDisplayId} — ${
              normalized.total || ''
            } Con IVA`,
            mensaje: `Orden Wix ID: ${orderId} | Productos: ${itemsSummary} | Dirección: ${
              normalized.shippingAddress || 'Por confirmar'
            } | Total Con IVA: ${normalized.total || ''}`,
            origen: 'Wix Checkout Confirmado (/thank-you)',
          }).catch(() => {});
        }
      } catch {
        // ignore storage errors
      }
    }

    async function loadOrder() {
      // Attempt A: Authoritative server-side /api/order endpoint using Wix API Key
      try {
        const res = await fetch(`/api/order?orderId=${encodeURIComponent(orderId)}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data && !data.error) {
            setOrderDetails((prev) => {
              const merged = {
                ...(prev || {}),
                ...data,
                items:
                  data.items && data.items.length > 0
                    ? data.items
                    : prev?.items || [],
              };
              recordCompletedOrderOnce(merged);
              return merged;
            });
            setLoadedOrderId(orderId);
            return;
          }
        }
      } catch (err) {
        console.warn('[ThankYou] Server /api/order fetch error:', err);
      }

      // Attempt B: Client-side Wix SDK orders.getOrder fallback using buyer session tokens
      if (wixCheckoutClient?.orders?.getOrder) {
        try {
          const order = await wixCheckoutClient.orders.getOrder(orderId);
          if (isMounted && order) {
            const billingContact =
              order.billingInfo?.contactDetails ||
              order.billingInfo?.address?.contactDetails ||
              {};
            const shippingContact =
              order.shippingInfo?.logistics?.shippingDestination?.contactDetails ||
              order.recipientInfo?.contactDetails ||
              {};
            const customerName =
              [billingContact.firstName, billingContact.lastName]
                .filter(Boolean)
                .join(' ') ||
              [shippingContact.firstName, shippingContact.lastName]
                .filter(Boolean)
                .join(' ') ||
              billingContact.fullName ||
              order.buyerInfo?.email ||
              '';

            const shippingDest =
              order.shippingInfo?.logistics?.shippingDestination?.address ||
              order.recipientInfo?.address ||
              order.billingInfo?.address ||
              {};
            const shippingAddress = [
              shippingDest.addressLine1 || shippingDest.addressLine,
              shippingDest.city,
              shippingDest.subdivisionName || shippingDest.subdivision,
              shippingDest.postalCode,
            ]
              .filter(Boolean)
              .join(', ');

            const items = (order.lineItems || []).map((it) => {
              const rawImg = it.image?.url || it.image || '';
              const imgUrl = formatWixImageUrl(rawImg, '');
              const sku = it.physicalProperties?.sku || '';
              const catalogItemId = it.catalogReference?.catalogItemId || '';
              const qty = it.quantity || 1;
              const unitNum = Number(it.price?.amount ?? 0);

              return {
                id: it._id || it.id,
                catalogItemId,
                sku,
                name:
                  it.productName?.translated ||
                  it.productName?.original ||
                  it.name ||
                  'Llanta Oficial Jasman',
                quantity: qty,
                price: unitNum > 0 ? formatMXN(unitNum) : it.price?.formattedAmount || '$0.00',
                totalPrice:
                  unitNum > 0
                    ? formatMXN(unitNum * qty)
                    : it.totalPrice?.formattedAmount || '$0.00',
                netPriceNum: unitNum,
                image: imgUrl && !imgUrl.includes('missing-media') ? imgUrl : '',
                options: [sku ? `SKU: ${sku}` : null].filter(Boolean),
              };
            });

            const summary = order.priceSummary || order.totals || {};
            const totalNum = Number(
              summary.total?.amount ?? summary.totalPrice?.amount ?? 0
            );
            const subtotalNum = Number(summary.subtotal?.amount ?? 0);

            setOrderDetails((prev) => {
              const merged = {
                ...(prev || {}),
                orderId,
                orderNumber: order.number
                  ? `#${order.number}`
                  : `#${String(orderId).substring(0, 8).toUpperCase()}`,
                customerName: customerName || prev?.customerName || '',
                customerEmail: order.buyerInfo?.email || prev?.customerEmail || '',
                customerPhone:
                  billingContact.phone ||
                  shippingContact.phone ||
                  prev?.customerPhone ||
                  '',
                shippingAddress: shippingAddress || prev?.shippingAddress || null,
                items: items.length > 0 ? items : prev?.items || [],
                totalQuantity:
                  items.reduce((acc, curr) => acc + (curr.quantity || 1), 0) ||
                  prev?.totalQuantity ||
                  1,
                total: totalNum > 0 ? formatMXN(totalNum) : prev?.total || '',
                totalAmount: totalNum || prev?.totalAmount || 0,
                subtotal:
                  subtotalNum > 0 ? formatMXN(subtotalNum) : prev?.subtotal || '',
                subtotalAmount: subtotalNum || prev?.subtotalAmount || 0,
                isFreeShipping: true,
                paymentStatus: order.paymentStatus || 'PAID',
              };
              recordCompletedOrderOnce(merged);
              return merged;
            });
          }
        } catch (sdkErr) {
          console.warn('[ThankYou] wixCheckoutClient.orders.getOrder failed:', sdkErr);
        }
      }

      if (isMounted) {
        setLoadedOrderId(orderId);
      }
    }

    loadOrder();

    return () => {
      isMounted = false;
    };
  }, [orderId, clearCart, mergeSyncedOrders, notifyCartDispatched]);

  const displayOrderNumber =
    orderDetails?.orderNumber ||
    (orderId ? `#${String(orderId).substring(0, 8).toUpperCase()}` : null);

  const displayTotalQuantity =
    orderDetails?.totalQuantity ||
    (orderDetails?.items || []).reduce((acc, item) => acc + (item.quantity || 1), 0);

  const whatsappSupportMessage = encodeURIComponent(
    `SW- Hola equipo Jasman, acabo de realizar mi compra en línea${
      displayOrderNumber ? ` (${displayOrderNumber})` : ''
    } y quisiera dar seguimiento a mi pedido.`
  );
  const whatsappSupportUrl = `https://api.whatsapp.com/send/?phone=5215510024945&text=${whatsappSupportMessage}`;

  return (
    <div style={{ background: '#F8F9FB', minHeight: '100vh', color: C.navy }}>
      <TiendaNavbar />
      <TiendaCartDrawer />
      <TiendaAuthModal />
      <TiendaLiveChatWidget />

      <section
        style={{
          position: 'relative',
          overflow: 'hidden',
          padding: '132px 20px 88px',
        }}
      >
        {/* Subtle ambient background accents */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: 40,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 680,
            height: 360,
            borderRadius: '50%',
            background:
              'radial-gradient(circle, rgba(22, 163, 74, 0.08) 0%, rgba(196, 30, 36, 0.05) 45%, transparent 72%)',
            pointerEvents: 'none',
          }}
        />

        <div
          style={{
            position: 'relative',
            maxWidth: 780,
            margin: '0 auto',
          }}
        >
          {/* Hero Confirmation Header */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div
              style={{
                width: 74,
                height: 74,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #16A34A 0%, #15803D 100%)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                boxShadow: '0 16px 36px rgba(22, 163, 74, 0.28)',
              }}
            >
              <Check size={36} strokeWidth={2.8} />
            </div>

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                padding: '6px 14px',
                borderRadius: 9999,
                background: 'rgba(22, 163, 74, 0.1)',
                border: '1px solid rgba(22, 163, 74, 0.24)',
                fontFamily: F.heading,
                fontSize: 10.5,
                fontWeight: 800,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: '#15803D',
                marginBottom: 14,
              }}
            >
              <ShieldCheck size={13} /> Compra Protegida · Jasman Tienda Oficial
            </div>

            <h1
              style={{
                fontFamily: F.heading,
                fontSize: 'clamp(28px, 4.5vw, 44px)',
                fontWeight: 900,
                color: C.navy,
                letterSpacing: '-0.03em',
                lineHeight: 1.08,
                margin: '0 0 12px',
              }}
            >
              ¡Gracias por tu compra!
            </h1>

            <p
              style={{
                fontFamily: F.body,
                fontSize: 15.5,
                color: C.gray,
                maxWidth: 560,
                margin: '0 auto',
                lineHeight: 1.6,
              }}
            >
              Hemos recibido tu pedido exitosamente. En breve recibirás la confirmación
              y guía de seguimiento en tu correo electrónico.
            </p>
          </div>

          {/* Live Isometric Dispatch Confirmation via Flotillas Hook */}
          <div style={{ marginBottom: 24 }}>
            <IsometricWorkshopScene
              variant="compact"
              bayPhase={fleetBayPhase}
              showCheck={true}
              dispatchedCount={fleetDispatchedCount}
              lastDispatch={
                fleetLastDispatch || {
                  id: displayOrderNumber || 'ORDEN',
                  source: 'cart',
                  label: `Pedido ${displayOrderNumber || ''} · ${displayTotalQuantity || 1} uds despachadas`,
                }
              }
              activeVehicle={fleetActiveVehicle}
            />
          </div>

          {/* Comprehensive Order Summary Card */}
          {(orderId || orderDetails) && (
            <div
              style={{
                background: C.white,
                borderRadius: 24,
                border: `1px solid ${C.border}`,
                boxShadow: '0 20px 50px rgba(15, 23, 42, 0.06)',
                overflow: 'hidden',
                marginBottom: 24,
              }}
            >
              {/* Top Meta Header */}
              <div
                style={{
                  padding: '22px 26px',
                  background: '#FAFAFC',
                  borderBottom: `1px solid ${C.border}`,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 10,
                    marginBottom:
                      orderDetails?.customerName ||
                      orderDetails?.customerEmail ||
                      orderDetails?.shippingAddress
                        ? 16
                        : 0,
                  }}
                >
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10 }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '5px 12px',
                        borderRadius: 9999,
                        background: 'rgba(22, 163, 74, 0.12)',
                        color: '#15803D',
                        fontFamily: F.heading,
                        fontSize: 11,
                        fontWeight: 800,
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                      }}
                    >
                      <span
                        style={{
                          width: 7,
                          height: 7,
                          borderRadius: '50%',
                          background: '#16A34A',
                        }}
                      />
                      {orderDetails?.paymentStatus === 'NOT_PAID'
                        ? 'Pago en proceso'
                        : 'Pago Confirmado'}
                    </span>

                    {displayOrderNumber && (
                      <span
                        style={{
                          fontFamily: F.heading,
                          fontSize: 13,
                          fontWeight: 700,
                          color: C.navy,
                          padding: '5px 12px',
                          borderRadius: 9999,
                          background: C.white,
                          border: `1px solid ${C.border}`,
                        }}
                      >
                        Pedido <strong>{displayOrderNumber}</strong>
                      </span>
                    )}
                  </div>

                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      fontFamily: F.heading,
                      fontSize: 11.5,
                      fontWeight: 700,
                      color: C.gray,
                    }}
                  >
                    <Truck size={14} color={C.red} /> Envío Nacional Asegurado
                  </span>
                </div>

                {/* Buyer & Shipping Details */}
                {(orderDetails?.customerName ||
                  orderDetails?.customerEmail ||
                  orderDetails?.shippingAddress) && (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                      gap: 12,
                      paddingTop: 14,
                      borderTop: `1px dashed ${C.border}`,
                    }}
                  >
                    {(orderDetails?.customerName || orderDetails?.customerEmail) && (
                      <div style={{ fontSize: 13, color: C.navy, lineHeight: 1.5 }}>
                        <div
                          style={{
                            fontFamily: F.heading,
                            fontSize: 10.5,
                            fontWeight: 800,
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase',
                            color: C.gray,
                            marginBottom: 3,
                          }}
                        >
                          Datos del Cliente
                        </div>
                        {orderDetails.customerName && (
                          <div style={{ fontWeight: 700 }}>{orderDetails.customerName}</div>
                        )}
                        {orderDetails.customerEmail && (
                          <div
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 5,
                              color: C.gray,
                              fontSize: 12.5,
                            }}
                          >
                            <Mail size={12} /> {orderDetails.customerEmail}
                          </div>
                        )}
                        {orderDetails.customerPhone && (
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 5,
                              color: C.gray,
                              fontSize: 12.5,
                            }}
                          >
                            <Phone size={12} /> {orderDetails.customerPhone}
                          </div>
                        )}
                      </div>
                    )}

                    {orderDetails?.shippingAddress && (
                      <div style={{ fontSize: 13, color: C.navy, lineHeight: 1.5 }}>
                        <div
                          style={{
                            fontFamily: F.heading,
                            fontSize: 10.5,
                            fontWeight: 800,
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase',
                            color: C.gray,
                            marginBottom: 3,
                          }}
                        >
                          Dirección de Entrega
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 6,
                            fontWeight: 600,
                          }}
                        >
                          <MapPin
                            size={14}
                            color={C.red}
                            style={{ flexShrink: 0, marginTop: 2 }}
                          />
                          <span>{orderDetails.shippingAddress}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Purchased Tires List */}
              <div style={{ padding: '22px 26px' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontFamily: F.heading,
                    fontSize: 11.5,
                    fontWeight: 800,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: C.gray,
                    marginBottom: 14,
                  }}
                >
                  <Package size={14} color={C.red} /> Productos Adquiridos (
                  {displayTotalQuantity})
                </div>

                {isLoading && !orderDetails?.items?.length ? (
                  <div
                    style={{
                      padding: '32px 16px',
                      textAlign: 'center',
                      color: C.gray,
                      fontSize: 13.5,
                    }}
                  >
                    Cargando detalles oficiales de tu pedido...
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {(orderDetails?.items || []).map((item, idx) => {
                      const resolvedImg = resolveLineItemImage(item);
                      return (
                        <div
                          key={item.id || idx}
                          className="jasman-thankyou-item-row"
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '72px 1fr auto',
                            alignItems: 'center',
                            gap: 14,
                            padding: 14,
                            borderRadius: 16,
                            border: `1px solid ${C.border}`,
                            background: '#FAFAFC',
                          }}
                        >
                          <div
                            style={{
                              position: 'relative',
                              width: 72,
                              height: 72,
                              borderRadius: 12,
                              background: C.white,
                              border: `1px solid ${C.border}`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: 6,
                            }}
                          >
                            <img
                              src={resolvedImg}
                              alt={item.name || 'Llanta Jasman'}
                              onError={(e) => {
                                e.currentTarget.src = '/images/service-tires.png';
                              }}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain',
                              }}
                            />
                            <span
                              style={{
                                position: 'absolute',
                                top: -6,
                                right: -6,
                                padding: '2px 7px',
                                borderRadius: 9999,
                                background: C.navy,
                                color: C.white,
                                fontFamily: F.heading,
                                fontSize: 10.5,
                                fontWeight: 800,
                              }}
                            >
                              {item.quantity}×
                            </span>
                          </div>

                          <div style={{ minWidth: 0 }}>
                            <div
                              style={{
                                fontFamily: F.heading,
                                fontSize: 13.5,
                                fontWeight: 800,
                                color: C.navy,
                                lineHeight: 1.35,
                              }}
                            >
                              {item.name}
                            </div>
                            {Array.isArray(item.options) && item.options.length > 0 && (
                              <div
                                style={{
                                  display: 'flex',
                                  flexWrap: 'wrap',
                                  gap: 6,
                                  marginTop: 6,
                                }}
                              >
                                {item.options.map((opt, optIdx) => (
                                  <span
                                    key={optIdx}
                                    style={{
                                      padding: '2px 8px',
                                      borderRadius: 6,
                                      background: C.white,
                                      border: `1px solid ${C.border}`,
                                      fontSize: 11,
                                      fontWeight: 600,
                                      color: C.gray,
                                    }}
                                  >
                                    {opt}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          <div style={{ textAlign: 'right' }}>
                            <div
                              style={{
                                fontFamily: F.heading,
                                fontSize: 15,
                                fontWeight: 900,
                                color: C.navy,
                              }}
                            >
                              {item.totalPrice || item.price}
                            </div>
                            <div style={{ fontSize: 10.5, color: C.gray, fontWeight: 600 }}>
                              Con IVA
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Financial Breakdown */}
              <div
                style={{
                  padding: '20px 26px 24px',
                  background: '#FAFAFC',
                  borderTop: `1px solid ${C.border}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                {orderDetails?.subtotal && (
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: 13.5,
                      color: C.gray,
                    }}
                  >
                    <span>Subtotal (Con IVA)</span>
                    <span style={{ fontWeight: 700, color: C.navy }}>
                      {orderDetails.subtotal}
                    </span>
                  </div>
                )}

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: 13.5,
                    color: C.gray,
                  }}
                >
                  <span>Envío a Domicilio Nacional</span>
                  <span style={{ fontWeight: 800, color: '#15803D' }}>
                    {orderDetails?.isFreeShipping === false && orderDetails?.shipping
                      ? orderDetails.shipping
                      : 'GRATIS'}
                  </span>
                </div>

                {orderDetails?.discount &&
                  orderDetails.discount !== '$0.00' &&
                  orderDetails.discount !== '-$0.00' && (
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: 13.5,
                        color: C.red,
                        fontWeight: 700,
                      }}
                    >
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <Tag size={13} /> Descuento Aplicado
                        {orderDetails.couponCode && (
                          <span
                            style={{
                              padding: '2px 8px',
                              borderRadius: 6,
                              background: '#FFF1F2',
                              border: `1px solid rgba(196, 30, 36, 0.25)`,
                              fontSize: 11,
                              fontWeight: 800,
                            }}
                          >
                            {orderDetails.couponCode}
                          </span>
                        )}
                      </span>
                      <span>
                        {orderDetails.discount.startsWith('-')
                          ? orderDetails.discount
                          : `-${orderDetails.discount}`}
                      </span>
                    </div>
                  )}

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    paddingTop: 12,
                    marginTop: 4,
                    borderTop: `1px solid ${C.border}`,
                  }}
                >
                  <div>
                    <span
                      style={{
                        fontFamily: F.heading,
                        fontSize: 15,
                        fontWeight: 800,
                        color: C.navy,
                      }}
                    >
                      Total Pagado (Con IVA)
                    </span>
                    {displayTotalQuantity > 0 && (
                      <span style={{ fontSize: 12, color: C.gray, marginLeft: 6 }}>
                        ({displayTotalQuantity}{' '}
                        {displayTotalQuantity === 1 ? 'unidad' : 'unidades'})
                      </span>
                    )}
                  </div>
                  <span
                    style={{
                      fontFamily: F.heading,
                      fontSize: 'clamp(22px, 3vw, 26px)',
                      fontWeight: 900,
                      color: C.navy,
                    }}
                  >
                    {orderDetails?.total || (isLoading ? '...' : '')}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Warranty & Installation Note */}
          <div
            style={{
              padding: '18px 22px',
              borderRadius: 18,
              background: C.white,
              border: `1px solid ${C.border}`,
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              marginBottom: 28,
            }}
          >
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 12,
                background: '#FFF1F2',
                color: C.red,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <ShieldCheck size={22} />
            </div>
            <p style={{ margin: 0, fontSize: 13.5, color: C.gray, lineHeight: 1.55 }}>
              Todas tus llantas cuentan con{' '}
              <strong style={{ color: C.navy }}>Garantía Oficial de Fábrica</strong> y
              respaldo en nuestras{' '}
              <strong style={{ color: C.navy }}>+80 sucursales Jasman</strong> en México.
            </p>
          </div>

          {/* Primary Actions */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: 12,
            }}
          >
            <Link
              to="/llantas/catalogo"
              style={{
                padding: '15px 26px',
                borderRadius: 14,
                background: C.red,
                color: C.white,
                fontFamily: F.heading,
                fontSize: 12.5,
                fontWeight: 800,
                letterSpacing: '0.07em',
                textTransform: 'uppercase',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 12px 28px rgba(196, 30, 36, 0.25)',
              }}
            >
              Seguir Comprando <ArrowRight size={15} />
            </Link>

            <Link
              to="/llantas/cuenta"
              style={{
                padding: '15px 24px',
                borderRadius: 14,
                background: C.navy,
                color: C.white,
                fontFamily: F.heading,
                fontSize: 12.5,
                fontWeight: 800,
                letterSpacing: '0.07em',
                textTransform: 'uppercase',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              Ver Mis Pedidos
            </Link>

            <a
              href={whatsappSupportUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '15px 22px',
                borderRadius: 14,
                background: C.white,
                color: '#15803D',
                border: '1.5px solid rgba(22, 163, 74, 0.32)',
                fontFamily: F.heading,
                fontSize: 12.5,
                fontWeight: 800,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <MessageCircle size={16} /> Atención por WhatsApp
            </a>
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 600px) {
          .jasman-thankyou-item-row {
            grid-template-columns: 60px 1fr !important;
          }
          .jasman-thankyou-item-row > div:last-child {
            grid-column: 2 / 3;
            text-align: left !important;
            margin-top: 2px;
          }
        }
      `}</style>
    </div>
  );
}
