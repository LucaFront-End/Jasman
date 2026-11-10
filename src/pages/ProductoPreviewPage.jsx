import { useState, useMemo, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { C, F } from '../hooks/useAnimations';
import {
  BRAND_META,
  formatMXN,
  useWixCatalogProducts,
  findCatalogProductById,
} from '../data/productosMasterData';
import { sucursales } from '../data/sucursalesData';
import {
  useTiendaState,
  triggerTiendaUI,
  getVolumeDiscountTier,
  BRANCH_INSTALLATION_FEE,
} from '../hooks/useTiendaState';
import { useAppleTilt } from '../hooks/useAppleScrollPhysics';
import TiendaNavbar from '../components/tienda/TiendaNavbar';
import TiendaCartDrawer from '../components/tienda/TiendaCartDrawer';
import TiendaAuthModal from '../components/tienda/TiendaAuthModal';
import TiendaLiveChatWidget from '../components/tienda/TiendaLiveChatWidget';
import {
  ArrowLeft,
  ShoppingBag,
  Check,
  ShieldCheck,
  MapPin,
  Award,
  Zap,
  Star,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Quote,
  Sparkles,
  Tag,
  Truck,
  Info,
  Minus,
  Plus,
} from 'lucide-react';

const BRAND_DETAILS = {
  Hankook: {
    origin: 'Tecnología Global · Equipo Original',
    badge: 'Distribuidor Oficial Autorizado',
  },
  Continental: {
    origin: 'Ingeniería Alemana de Precisión',
    badge: 'Distribuidor Oficial Autorizado',
  },
  Euzkadi: {
    origin: 'Máxima Resistencia Todo Terreno',
    badge: 'Distribuidor Oficial Autorizado',
  },
  'General Tire': {
    origin: 'Herencia Americana · SUV & Uso Rudo',
    badge: 'Distribuidor Oficial Autorizado',
  },
  Laufenn: {
    origin: 'Por Hankook Tire · Desempeño Inteligente',
    badge: 'Distribuidor Oficial Autorizado',
  },
};

const DRIVER_REVIEWS = [
  {
    initials: 'CM',
    author: 'Carlos M. · CDMX',
    badge: 'Instalación Verificada en Sucursal',
    rating: 5,
    text: 'Excelente agarre en piso seco y mojado. Compré el juego en línea y en menos de 40 minutos ya estaban montadas, balanceadas y con nitrógeno en Jasman Satélite.',
    date: 'Hace 2 semanas',
    color: '#C41E24',
  },
  {
    initials: 'AR',
    author: 'Alejandro R. · Monterrey',
    badge: 'Compra Verificada',
    rating: 5,
    text: 'El cambio en silencio de cabina y suavidad en autopista fue inmediato. La medida exacta para mi vehículo y el descuento por llevar las 4 llantas fue inmejorable.',
    date: 'Hace 1 mes',
    color: '#1A1F36',
  },
  {
    initials: 'LG',
    author: 'Laura G. · Guadalajara',
    badge: 'Instalación Verificada en Sucursal',
    rating: 5,
    text: 'Atención impecable desde WhatsApp hasta la sucursal. Me confirmaron existencias al instante y las llantas son de fecha de fabricación reciente con garantía oficial.',
    date: 'Hace 1 mes',
    color: '#0F172A',
  },
  {
    initials: 'JV',
    author: 'Jorge V. · Querétaro',
    badge: 'Compra Verificada',
    rating: 5,
    text: 'Buscaba durabilidad para carretera y carga diaria. Llevo más de 8,000 km con un desgaste completamente uniforme y frenado muy seguro.',
    date: 'Hace 2 meses',
    color: '#991B1B',
  },
];

export default function ProductoPreviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products: catalogProducts } = useWixCatalogProducts();

  const product = useMemo(() => {
    return (
      findCatalogProductById(id) ||
      catalogProducts[0]
    );
  }, [id, catalogProducts]);

  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [prevProdId, setPrevProdId] = useState(product.id);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [quickAddedId, setQuickAddedId] = useState(null);
  const [openAccordion, setOpenAccordion] = useState('ficha');
  const [activeReviewIdx, setActiveReviewIdx] = useState(0);
  const [showDiscountFloat, setShowDiscountFloat] = useState(false);
  const [showFloatingBuyBar, setShowFloatingBuyBar] = useState(false);
  const carouselRef = useRef(null);
  const buyButtonRef = useRef(null);

  if (product.id !== prevProdId) {
    setPrevProdId(product.id);
    setSelectedImageIdx(0);
    setQty(1);
  }

  const { tilt, onMouseMove, onMouseLeave } = useAppleTilt(4);

  const {
    addToCart,
    coupon,
    selectedBranchSlug,
    deliveryMode,
    setSelectedBranch,
    setDeliveryMode,
  } = useTiendaState();

  // Show bottom floating buy bar when user scrolls past the main buy button
  useEffect(() => {
    const onScroll = () => {
      if (buyButtonRef.current) {
        const rect = buyButtonRef.current.getBoundingClientRect();
        setShowFloatingBuyBar(rect.bottom < 70);
      } else {
        setShowFloatingBuyBar(window.scrollY > 520);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const brandMeta = BRAND_META[product.brand];
  const brandExtra = BRAND_DETAILS[product.brand] || {
    origin: 'Calidad Homologada Internacional',
    badge: 'Distribuidor Oficial Autorizado',
  };

  const basePrice = product.finalPriceTaxExcluded || 0;
  const unitsPerItem = product.unitsPerItem || 1;
  const effectiveTiresCount = qty * unitsPerItem;

  // Volume discount tier based on selected quantity
  const activeVolumeTier = useMemo(
    () => getVolumeDiscountTier(effectiveTiresCount),
    [effectiveTiresCount]
  );

  const priceAfterVolume = useMemo(
    () => basePrice * (1 - activeVolumeTier.rate),
    [basePrice, activeVolumeTier.rate]
  );

  const unitEffectivePrice = useMemo(
    () => (coupon && priceAfterVolume > 0 ? priceAfterVolume * 0.9 : priceAfterVolume),
    [coupon, priceAfterVolume]
  );

  const rawTotalWithoutDiscounts = basePrice * qty;
  const tiresSubtotalForSelection = unitEffectivePrice * qty;
  const activeInstallationCost =
    deliveryMode === 'branch' ? BRANCH_INSTALLATION_FEE : 0;
  const finalTotalForSelection = tiresSubtotalForSelection + activeInstallationCost;
  const totalSavingsForSelection = Math.max(
    0,
    rawTotalWithoutDiscounts - tiresSubtotalForSelection
  );

  // Build gallery: first image prefers the transparent PNG cutout, followed by all CSV angles
  const galleryImages = useMemo(() => {
    const rawList =
      product.images && product.images.length > 0
        ? product.images
        : [product.primaryImage];
    return rawList.map((url, idx) => ({
      url: idx === 0 && product.hasPngCutout ? product.cutoutImage : url,
      fallbackUrl: url,
      isCutout: idx === 0 && product.hasPngCutout,
      label: idx === 0 ? 'Vista 3/4' : `Vista 0${idx + 1}`,
    }));
  }, [product]);

  const activeSlide = galleryImages[selectedImageIdx] || galleryImages[0];

  const selectedBranch =
    sucursales.find((s) => s.slug === selectedBranchSlug) || sucursales[0];

  const handleAddToCart = () => {
    if (!product.inStock) return;
    addToCart(product.id, qty, true);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const handleQuickAddRelated = (relProd) => {
    if (!relProd.inStock) return;
    addToCart(relProd.id, 1, true);
    setQuickAddedId(relProd.id);
    setTimeout(() => setQuickAddedId(null), 1500);
  };

  const nextImage = () => {
    setSelectedImageIdx((prev) => (prev + 1) % galleryImages.length);
  };

  const prevImage = () => {
    setSelectedImageIdx(
      (prev) => (prev - 1 + galleryImages.length) % galleryImages.length
    );
  };

  // Auto-scroll reviews carousel
  const scrollCarousel = (direction) => {
    if (carouselRef.current) {
      const containerWidth = carouselRef.current.clientWidth;
      const maxIndex = DRIVER_REVIEWS.length - 1;
      let nextIndex = direction === 'left' ? activeReviewIdx - 1 : activeReviewIdx + 1;
      if (nextIndex < 0) nextIndex = maxIndex;
      if (nextIndex > maxIndex) nextIndex = 0;

      carouselRef.current.scrollTo({
        left: nextIndex * containerWidth,
        behavior: 'smooth',
      });
      setActiveReviewIdx(nextIndex);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (carouselRef.current) {
        const containerWidth = carouselRef.current.clientWidth;
        const maxIndex = DRIVER_REVIEWS.length - 1;
        const nextIndex = activeReviewIdx + 1 > maxIndex ? 0 : activeReviewIdx + 1;
        carouselRef.current.scrollTo({
          left: nextIndex * containerWidth,
          behavior: 'smooth',
        });
        setActiveReviewIdx(nextIndex);
      }
    }, 5200);
    return () => clearInterval(interval);
  }, [activeReviewIdx]);

  // 3 Cross-Sell Related Tires
  const relatedProducts = useMemo(() => {
    const primary = catalogProducts.filter(
      (p) =>
        p.id !== product.id &&
        p.inStock &&
        (p.rim === product.rim || p.brand === product.brand)
    ).slice(0, 3);
    if (primary.length < 3) {
      const existingIds = primary.map((p) => p.id);
      const fillers = catalogProducts.filter(
        (p) => p.id !== product.id && p.inStock && !existingIds.includes(p.id)
      ).slice(0, 3 - primary.length);
      return [...primary, ...fillers];
    }
    return primary;
  }, [product, catalogProducts]);

  const specRows = [
    { label: 'ID de Catálogo', value: `#${product.id}` },
    { label: 'Referencia / SKU Oficial', value: product.reference },
    { label: 'Fabricante', value: product.brand },
    { label: 'Segmento Vehicular', value: product.vehicleType || product.category },
    { label: 'Medida Completa', value: product.measure || 'Estándar' },
    { label: 'Ancho de Sección', value: product.width ? `${product.width} mm` : '—' },
    { label: 'Perfil / Serie', value: product.profile || '—' },
    { label: 'Diámetro de Rin', value: product.rim || '—' },
    { label: 'Índice Carga / Velocidad', value: product.loadSpeed || 'Oficial' },
    { label: 'Presentación', value: 'Llanta individual' },
    { label: 'Disponibilidad en Red', value: `${product.quantity} unidades` },
  ];

  return (
    <div style={{ background: '#F8F9FA', minHeight: '100vh', color: C.navy }}>
      <TiendaNavbar />
      <TiendaCartDrawer />
      <TiendaAuthModal />
      <TiendaLiveChatWidget />

      <div
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: '126px 24px 96px',
        }}
      >
        {/* Minimalist Top Bar: Back Button + Breadcrumb */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
            marginBottom: 28,
          }}
        >
          <Link
            to="/landing-tienda-preview/catalogo"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              fontFamily: F.heading,
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: C.navy,
              textDecoration: 'none',
              padding: '9px 18px',
              borderRadius: 9999,
              background: '#FFFFFF',
              border: '1px solid rgba(26, 31, 54, 0.08)',
              boxShadow: '0 4px 14px rgba(26, 31, 54, 0.03)',
              transition: 'all 0.25s ease',
            }}
          >
            <ArrowLeft size={14} color={C.red} /> Catálogo
          </Link>

          <nav
            style={{
              fontFamily: F.heading,
              fontSize: 11.5,
              fontWeight: 700,
              color: '#94A3B8',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span>Tienda</span>
            <span>/</span>
            <span>{product.vehicleType || product.category}</span>
            <span>/</span>
            <span style={{ color: C.red, fontWeight: 800 }}>{product.brand}</span>
          </nav>
        </div>

        {/* MAIN 2-COLUMN EDITORIAL PRODUCT LAYOUT */}
        <div
          className="bruce-tire-detail-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.06fr) minmax(0, 0.94fr)',
            gap: 48,
            alignItems: 'start',
            marginBottom: 88,
          }}
        >
          {/* LEFT COLUMN: Pure White Minimalist Gallery + Thumbnail Dock + Anatomy Specs */}
          <div
            className="bruce-tire-visuals-col"
            style={{
              position: 'sticky',
              top: 112,
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            {/* 1. PURE WHITE ARCHITECTURAL GALLERY STAGE */}
            <div
              onMouseMove={onMouseMove}
              onMouseLeave={onMouseLeave}
              style={{
                height: 495,
                borderRadius: 32,
                background: '#FFFFFF',
                border: '1px solid rgba(26, 31, 54, 0.07)',
                boxShadow: '0 24px 60px rgba(26, 31, 54, 0.05)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '24px 28px',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Subtle Architectural Dot Matrix */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundImage:
                    'radial-gradient(rgba(26, 31, 54, 0.035) 1px, transparent 1px)',
                  backgroundSize: '24px 24px',
                  pointerEvents: 'none',
                }}
              />

              {/* Giant Subtle Watermark behind tire */}
              <div
                style={{
                  position: 'absolute',
                  top: '48%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  fontFamily: F.heading,
                  fontSize: 'clamp(6rem, 13vw, 11rem)',
                  fontWeight: 900,
                  letterSpacing: '-0.06em',
                  color: 'rgba(26, 31, 54, 0.028)',
                  whiteSpace: 'nowrap',
                  pointerEvents: 'none',
                  userSelect: 'none',
                }}
              >
                {product.rim || product.brand}
              </div>

              {/* Top Header inside Stage: Official Brand Image Badge + Measure + Stock */}
              <div
                style={{
                  position: 'relative',
                  zIndex: 4,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 10,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {/* Framed Brand Image Pill inside Gallery */}
                  <div
                    style={{
                      padding: '6px 12px',
                      borderRadius: 9999,
                      background: '#F8F9FA',
                      border: '1px solid rgba(26, 31, 54, 0.08)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    {brandMeta?.logo && (
                      <img
                        src={brandMeta.logo}
                        alt={product.brand}
                        style={{ height: 18, width: 'auto', objectFit: 'contain' }}
                      />
                    )}
                  </div>

                  {product.measure && (
                    <span
                      style={{
                        padding: '6px 13px',
                        borderRadius: 9999,
                        background: C.navy,
                        color: C.white,
                        fontFamily: F.heading,
                        fontSize: 11,
                        fontWeight: 800,
                        letterSpacing: '0.05em',
                      }}
                    >
                      {product.measure}
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {galleryImages.length > 1 && (
                    <span
                      style={{
                        padding: '5px 11px',
                        borderRadius: 9999,
                        background: '#F8F9FA',
                        border: '1px solid rgba(26,31,54,0.07)',
                        color: C.navy,
                        fontFamily: F.heading,
                        fontSize: 10.5,
                        fontWeight: 800,
                        letterSpacing: '0.08em',
                      }}
                    >
                      0{selectedImageIdx + 1} / 0{galleryImages.length}
                    </span>
                  )}
                  <span
                    style={{
                      padding: '5px 12px',
                      borderRadius: 9999,
                      background: product.inStock
                        ? 'rgba(22, 163, 74, 0.08)'
                        : '#F1F5F9',
                      color: product.inStock ? '#15803D' : C.gray,
                      fontFamily: F.heading,
                      fontSize: 11,
                      fontWeight: 800,
                    }}
                  >
                    ● {product.inStock ? `${product.quantity} en stock` : 'Agotado'}
                  </span>
                </div>
              </div>

              {/* Center Interactive Tire Image with Prev/Next Glass Controls */}
              <div
                style={{
                  position: 'relative',
                  zIndex: 3,
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {galleryImages.length > 1 && (
                  <button
                    type="button"
                    onClick={prevImage}
                    aria-label="Foto anterior"
                    style={{
                      position: 'absolute',
                      left: 0,
                      zIndex: 5,
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      border: '1px solid rgba(26, 31, 54, 0.09)',
                      background: 'rgba(255, 255, 255, 0.92)',
                      backdropFilter: 'blur(12px)',
                      color: C.navy,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 8px 20px rgba(26, 31, 54, 0.06)',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <ChevronLeft size={18} />
                  </button>
                )}

                {/* Soft ground contact shadow */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: 8,
                    width: '48%',
                    height: 22,
                    borderRadius: '50%',
                    background:
                      'radial-gradient(ellipse at center, rgba(26, 31, 54, 0.22) 0%, rgba(26, 31, 54, 0) 74%)',
                    filter: 'blur(6px)',
                    pointerEvents: 'none',
                  }}
                />

                <img
                  key={`${product.id}-${selectedImageIdx}`}
                  src={activeSlide.url}
                  alt={product.cleanTitle}
                  onError={(e) => {
                    if (e.currentTarget.src !== activeSlide.fallbackUrl) {
                      e.currentTarget.src = activeSlide.fallbackUrl;
                    } else {
                      e.currentTarget.src = '/images/service-tires.png';
                    }
                  }}
                  style={{
                    maxWidth: '78%',
                    maxHeight: 330,
                    width: 'auto',
                    height: 'auto',
                    objectFit: 'contain',
                    mixBlendMode: activeSlide.isCutout ? 'normal' : 'multiply',
                    filter: activeSlide.isCutout
                      ? 'drop-shadow(0 24px 32px rgba(26, 31, 54, 0.20)) contrast(1.04)'
                      : 'contrast(1.05)',
                    transform: tilt.active
                      ? `perspective(1000px) rotateX(${tilt.rx * 0.7}deg) rotateY(${tilt.ry * 0.9}deg) scale(1.05)`
                      : 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)',
                    transition: tilt.active
                      ? 'transform 0.14s ease-out'
                      : 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                    animation: 'heroFadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                />

                {galleryImages.length > 1 && (
                  <button
                    type="button"
                    onClick={nextImage}
                    aria-label="Foto siguiente"
                    style={{
                      position: 'absolute',
                      right: 0,
                      zIndex: 5,
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      border: '1px solid rgba(26, 31, 54, 0.09)',
                      background: 'rgba(255, 255, 255, 0.92)',
                      backdropFilter: 'blur(12px)',
                      color: C.navy,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 8px 20px rgba(26, 31, 54, 0.06)',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <ChevronRight size={18} />
                  </button>
                )}
              </div>

              {/* Bottom Telemetry Strip inside Stage: Anatomía de la Medida */}
              <div
                style={{
                  position: 'relative',
                  zIndex: 4,
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: 8,
                  paddingTop: 14,
                  borderTop: '1px solid rgba(26, 31, 54, 0.06)',
                }}
              >
                {[
                  { k: 'Ancho', v: product.width ? `${product.width} mm` : '—' },
                  { k: 'Perfil', v: product.profile ? `Serie ${product.profile}` : '—' },
                  { k: 'Rin', v: product.rim || '—' },
                  { k: 'Índice', v: product.loadSpeed || 'Oficial' },
                ].map((spec) => (
                  <div
                    key={spec.k}
                    style={{
                      padding: '8px 12px',
                      borderRadius: 14,
                      background: '#F8F9FA',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: F.heading,
                        fontSize: 9,
                        fontWeight: 800,
                        letterSpacing: '0.14em',
                        textTransform: 'uppercase',
                        color: '#64748B',
                      }}
                    >
                      {spec.k}
                    </span>
                    <span
                      style={{
                        fontFamily: F.heading,
                        fontSize: 13.5,
                        fontWeight: 900,
                        color: C.navy,
                        marginTop: 2,
                      }}
                    >
                      {spec.v}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. INTERACTIVE GALLERY THUMBNAIL STRIP */}
            {galleryImages.length > 1 && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${Math.min(galleryImages.length, 4)}, 1fr)`,
                  gap: 12,
                }}
              >
                {galleryImages.map((imgItem, idx) => {
                  const isActive = idx === selectedImageIdx;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedImageIdx(idx)}
                      style={{
                        height: 88,
                        borderRadius: 20,
                        border: isActive
                          ? `2px solid ${C.red}`
                          : '1px solid rgba(26, 31, 54, 0.08)',
                        background: '#FFFFFF',
                        padding: '8px 12px',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 4,
                        boxShadow: isActive
                          ? '0 12px 26px rgba(196, 30, 36, 0.12)'
                          : '0 4px 12px rgba(26, 31, 54, 0.03)',
                        transform: isActive ? 'translateY(-2px)' : 'translateY(0)',
                        transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                      }}
                    >
                      <img
                        src={imgItem.url}
                        alt={`${product.cleanTitle} ${imgItem.label}`}
                        onError={(e) => {
                          e.currentTarget.src = imgItem.fallbackUrl;
                        }}
                        style={{
                          height: 48,
                          width: 'auto',
                          maxWidth: '85%',
                          objectFit: 'contain',
                          mixBlendMode: imgItem.isCutout ? 'normal' : 'multiply',
                          opacity: isActive ? 1 : 0.7,
                        }}
                      />
                      <span
                        style={{
                          fontFamily: F.heading,
                          fontSize: 9.5,
                          fontWeight: 800,
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase',
                          color: isActive ? C.red : '#64748B',
                        }}
                      >
                        {imgItem.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* 3. SYMMETRICAL 2x2 HIGH-TECH TRUST BADGES */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 12,
              }}
            >
              {[
                {
                  icon: ShieldCheck,
                  title: 'Garantía Oficial',
                  sub: `Respaldo directo ${product.brand}`,
                },
                {
                  icon: MapPin,
                  title: '+80 Sucursales',
                  sub: 'Instalación y balanceo',
                },
                {
                  icon: Award,
                  title: 'Medida Exacta',
                  sub: `${product.measure || 'Estándar'} · Rin ${product.rim || '—'}`,
                },
                {
                  icon: Truck,
                  title: 'Envío Gratis',
                  sub: 'Cobertura nacional garantizada',
                },
              ].map((cell) => {
                const Icon = cell.icon;
                return (
                  <div
                    key={cell.title}
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid rgba(26, 31, 54, 0.07)',
                      borderRadius: 20,
                      padding: '14px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      boxShadow: '0 6px 20px rgba(26, 31, 54, 0.025)',
                    }}
                  >
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 12,
                        background: 'rgba(196, 30, 36, 0.08)',
                        color: C.red,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={18} />
                    </div>
                    <div>
                      <div
                        style={{
                          fontFamily: F.heading,
                          fontSize: 12.5,
                          fontWeight: 800,
                          color: C.navy,
                        }}
                      >
                        {cell.title}
                      </div>
                      <div
                        style={{
                          fontFamily: F.body,
                          fontSize: 11,
                          color: '#64748B',
                          marginTop: 1,
                        }}
                      >
                        {cell.sub}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT COLUMN: Minimalist High-Converting Buying Experience */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            {/* PROMINENT BRAND WITH OFFICIAL LOGO IMAGE CARD ("Marca con imagen") */}
            <div
              style={{
                width: '100%',
                padding: '14px 18px',
                borderRadius: 20,
                background: '#FFFFFF',
                border: '1px solid rgba(26, 31, 54, 0.08)',
                boxShadow: '0 8px 24px rgba(26, 31, 54, 0.03)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 14,
                marginBottom: 18,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div
                  style={{
                    minWidth: 112,
                    height: 48,
                    padding: '8px 14px',
                    borderRadius: 14,
                    background: '#F8F9FA',
                    border: '1px solid rgba(26, 31, 54, 0.07)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {brandMeta?.logo ? (
                    <img
                      src={brandMeta.logo}
                      alt={`Marca ${product.brand}`}
                      style={{
                        maxHeight: 28,
                        maxWidth: 92,
                        width: 'auto',
                        height: 'auto',
                        objectFit: 'contain',
                      }}
                    />
                  ) : (
                    <span
                      style={{
                        fontFamily: F.heading,
                        fontSize: 13,
                        fontWeight: 900,
                        color: C.navy,
                      }}
                    >
                      {product.brand}
                    </span>
                  )}
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span
                      style={{
                        fontFamily: F.heading,
                        fontSize: 13,
                        fontWeight: 900,
                        color: C.navy,
                      }}
                    >
                      {product.brand}
                    </span>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: 9999,
                        background: 'rgba(22, 163, 74, 0.1)',
                        color: '#15803D',
                        fontFamily: F.heading,
                        fontSize: 9,
                        fontWeight: 800,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                      }}
                    >
                      ✓ Oficial
                    </span>
                  </div>
                  <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 2 }}>
                    {brandExtra.origin}
                  </div>
                </div>
              </div>

              <span
                style={{
                  fontFamily: F.heading,
                  fontSize: 10,
                  fontWeight: 800,
                  color: C.red,
                  background: 'rgba(196, 30, 36, 0.08)',
                  padding: '6px 12px',
                  borderRadius: 9999,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  whiteSpace: 'nowrap',
                }}
              >
                {product.vehicleType || product.category}
              </span>
            </div>

            {/* Product Title */}
            <h1
              style={{
                fontFamily: F.heading,
                fontSize: 'clamp(1.75rem, 2.8vw, 2.4rem)',
                fontWeight: 900,
                color: C.navy,
                lineHeight: 1.12,
                letterSpacing: '-0.03em',
                margin: '0 0 10px',
              }}
            >
              {product.cleanTitle}
            </h1>

            {/* Rating + SKU + Discount Legend with Floating Popover Row */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 10,
                marginBottom: 16,
                position: 'relative',
              }}
            >
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <div style={{ display: 'flex', gap: 2 }}>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} fill="#F59E0B" color="#F59E0B" />
                  ))}
                </div>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: C.navy,
                    fontFamily: F.heading,
                  }}
                >
                  5.0 Reseñas
                </span>
              </div>

              <span style={{ color: '#CBD5E1' }}>·</span>

              <span style={{ fontSize: 12, color: '#64748B', fontFamily: F.body }}>
                SKU: <strong style={{ color: C.navy }}>{product.reference}</strong>
              </span>

              {basePrice > 0 && (
                <>
                  <span style={{ color: '#CBD5E1' }}>·</span>

                  <div
                    onMouseEnter={() => setShowDiscountFloat(true)}
                    onMouseLeave={() => setShowDiscountFloat(false)}
                    style={{ position: 'relative', display: 'inline-flex' }}
                  >
                    <button
                      type="button"
                      onClick={() => setShowDiscountFloat((v) => !v)}
                      style={{
                        padding: '4px 11px',
                        borderRadius: 9999,
                        border:
                          activeVolumeTier.percent > 0
                            ? '1px solid rgba(22, 163, 74, 0.3)'
                            : '1px solid rgba(196, 30, 36, 0.22)',
                        background:
                          activeVolumeTier.percent > 0
                            ? 'rgba(22, 163, 74, 0.1)'
                            : 'rgba(196, 30, 36, 0.07)',
                        color: activeVolumeTier.percent > 0 ? '#15803D' : C.red,
                        fontFamily: F.heading,
                        fontSize: 10.5,
                        fontWeight: 800,
                        letterSpacing: '0.03em',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5,
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <Tag size={11} />
                      <span>
                        {activeVolumeTier.percent > 0
                          ? `−${activeVolumeTier.percent}% Descuento activo`
                          : 'Agrega más y obtén descuento'}
                      </span>
                      <Info size={11} />
                    </button>

                    {/* Floating Discount Info Popover ("la info aparezca con un flotante") */}
                    {showDiscountFloat && (
                      <div
                        style={{
                          position: 'absolute',
                          top: 'calc(100% + 8px)',
                          left: 0,
                          zIndex: 45,
                          width: 290,
                          padding: '14px 16px',
                          borderRadius: 18,
                          background: 'rgba(26, 31, 54, 0.97)',
                          backdropFilter: 'blur(16px)',
                          WebkitBackdropFilter: 'blur(16px)',
                          color: '#FFFFFF',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          boxShadow: '0 20px 44px rgba(15, 23, 42, 0.28)',
                          animation: 'heroFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                        }}
                      >
                        <div
                          style={{
                            fontFamily: F.heading,
                            fontSize: 10,
                            fontWeight: 800,
                            letterSpacing: '0.14em',
                            textTransform: 'uppercase',
                            color: '#FCA5A5',
                            marginBottom: 8,
                          }}
                        >
                          Descuento automático por volumen
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 6,
                            fontSize: 11.5,
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              padding: '6px 9px',
                              borderRadius: 10,
                              background:
                                qty >= 2 && qty < 4
                                  ? 'rgba(22, 163, 74, 0.25)'
                                  : 'rgba(255, 255, 255, 0.07)',
                            }}
                          >
                            <span>2 a 3 llantas (Par)</span>
                            <strong style={{ color: '#86EFAC' }}>
                              −5% OFF ({formatMXN(basePrice * 0.95)} c/u)
                            </strong>
                          </div>
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              padding: '6px 9px',
                              borderRadius: 10,
                              background:
                                qty >= 4
                                  ? 'rgba(22, 163, 74, 0.25)'
                                  : 'rgba(255, 255, 255, 0.07)',
                            }}
                          >
                            <span>4+ llantas (Juego)</span>
                            <strong style={{ color: '#86EFAC' }}>
                              −10% OFF ({formatMXN(basePrice * 0.9)} c/u)
                            </strong>
                          </div>
                        </div>
                        <div
                          style={{
                            fontSize: 10.5,
                            color: '#CBD5E1',
                            marginTop: 8,
                            lineHeight: 1.4,
                          }}
                        >
                          Se aplica automáticamente al subir la cantidad de llantas.
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Price Directly Below (No Container Box) */}
            <div
              style={{
                width: '100%',
                marginTop: 4,
                marginBottom: 18,
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  flexWrap: 'wrap',
                  gap: 12,
                }}
              >
                <span
                  style={{
                    fontFamily: F.heading,
                    fontSize: basePrice > 0 ? 'clamp(2.1rem, 3.1vw, 2.65rem)' : 20,
                    fontWeight: 900,
                    color:
                      (activeVolumeTier.rate > 0 || coupon) && basePrice > 0
                        ? C.red
                        : basePrice > 0
                          ? C.navy
                          : C.gray,
                    letterSpacing: '-0.035em',
                    lineHeight: 1,
                  }}
                >
                  {formatMXN(unitEffectivePrice)}
                </span>

                {(activeVolumeTier.rate > 0 || coupon) && basePrice > 0 && (
                  <span
                    style={{
                      fontSize: 14,
                      color: '#94A3B8',
                      textDecoration: 'line-through',
                      fontWeight: 600,
                    }}
                  >
                    {formatMXN(basePrice)}
                  </span>
                )}

                {totalSavingsForSelection > 0 && (
                  <span
                    style={{
                      padding: '4px 10px',
                      borderRadius: 9999,
                      background: 'rgba(22, 163, 74, 0.1)',
                      color: '#15803D',
                      fontFamily: F.heading,
                      fontSize: 10.5,
                      fontWeight: 800,
                    }}
                  >
                    Ahorras {formatMXN(totalSavingsForSelection)}
                  </span>
                )}
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 10,
                  fontSize: 12,
                  color: '#64748B',
                  fontWeight: 500,
                }}
              >
                <span>Precio unitario en MXN · Sin IVA</span>
                <span style={{ color: '#CBD5E1' }}>•</span>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    color: '#15803D',
                    fontWeight: 700,
                  }}
                >
                  <Truck size={13} /> Envío gratis a domicilio incluido
                </span>
              </div>
            </div>

            {/* Kamibi-style Checkbox Add-on for Branch Installation (Containerless) */}
            <div
              style={{
                width: '100%',
                marginBottom: 20,
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              <label
                onClick={() =>
                  setDeliveryMode(deliveryMode === 'branch' ? 'shipping' : 'branch')
                }
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                  cursor: 'pointer',
                  userSelect: 'none',
                }}
              >
                <span
                  role="checkbox"
                  aria-checked={deliveryMode === 'branch'}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === ' ' || e.key === 'Enter') {
                      e.preventDefault();
                      setDeliveryMode(deliveryMode === 'branch' ? 'shipping' : 'branch');
                    }
                  }}
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 7,
                    border:
                      deliveryMode === 'branch'
                        ? `2px solid ${C.red}`
                        : '2px solid rgba(26, 31, 54, 0.25)',
                    background: deliveryMode === 'branch' ? C.red : '#FFFFFF',
                    color: '#FFFFFF',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: 1,
                    transition: 'all 0.18s ease',
                    boxShadow:
                      deliveryMode === 'branch'
                        ? '0 4px 12px rgba(196, 30, 36, 0.25)'
                        : 'none',
                  }}
                >
                  {deliveryMode === 'branch' && <Check size={14} strokeWidth={3} />}
                </span>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: 8,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: F.heading,
                        fontSize: 13.5,
                        fontWeight: 800,
                        color: C.navy,
                      }}
                    >
                      Agregar instalación en sucursal
                    </span>
                    <span
                      style={{
                        fontFamily: F.heading,
                        fontSize: 12,
                        fontWeight: 900,
                        color: C.red,
                      }}
                    >
                      +{formatMXN(BRANCH_INSTALLATION_FEE)}
                    </span>
                  </div>
                  <span style={{ fontSize: 12, color: '#64748B', lineHeight: 1.45 }}>
                    Incluye montaje, balanceo y válvulas en +80 sucursales Jasman
                  </span>
                </div>
              </label>

              {deliveryMode === 'branch' && (
                <div
                  style={{
                    paddingLeft: 34,
                    display: 'flex',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 10,
                  }}
                >
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                      fontFamily: F.heading,
                      fontSize: 11,
                      fontWeight: 800,
                      color: C.navy,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                    }}
                  >
                    <MapPin size={12} color={C.red} /> Sucursal:
                  </span>
                  <select
                    value={selectedBranchSlug}
                    onChange={(e) => setSelectedBranch(e.target.value)}
                    style={{
                      flex: 1,
                      minWidth: 210,
                      padding: '8px 12px',
                      borderRadius: 10,
                      border: '1px solid rgba(26, 31, 54, 0.14)',
                      background: '#FFFFFF',
                      fontFamily: F.body,
                      fontSize: 12.5,
                      fontWeight: 600,
                      color: C.navy,
                      outline: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    {sucursales.map((s) => (
                      <option key={s.slug} value={s.slug}>
                        {s.name} ({s.zone})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Quantity Picker + Primary Add to Cart Button (Moved right up into first view!) */}
            {product.inStock && (
              <div
                ref={buyButtonRef}
                style={{
                  width: '100%',
                  display: 'flex',
                  gap: 12,
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    borderRadius: 16,
                    border: '1px solid rgba(26, 31, 54, 0.12)',
                    background: '#FFFFFF',
                    padding: '0 6px',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    style={{
                      width: 38,
                      height: 52,
                      border: 'none',
                      background: 'transparent',
                      fontSize: 18,
                      fontWeight: 700,
                      color: C.navy,
                      cursor: 'pointer',
                    }}
                  >
                    −
                  </button>
                  <span
                    style={{
                      minWidth: 32,
                      textAlign: 'center',
                      fontFamily: F.heading,
                      fontSize: 15,
                      fontWeight: 900,
                      color: C.navy,
                    }}
                  >
                    {qty}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQty((q) => Math.min(product.quantity, q + 1))}
                    style={{
                      width: 38,
                      height: 52,
                      border: 'none',
                      background: 'transparent',
                      fontSize: 18,
                      fontWeight: 700,
                      color: C.navy,
                      cursor: 'pointer',
                    }}
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleAddToCart}
                  style={{
                    flex: 1,
                    padding: '16px 24px',
                    borderRadius: 16,
                    border: 'none',
                    background: added ? '#16A34A' : C.red,
                    color: C.white,
                    fontFamily: F.heading,
                    fontSize: 12.5,
                    fontWeight: 800,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 10,
                    boxShadow: '0 14px 32px rgba(196, 30, 36, 0.28)',
                    transition: 'all 0.25s ease',
                  }}
                >
                  {added ? (
                    <>
                      <Check size={17} /> ¡Añadido al Carrito!
                    </>
                  ) : (
                    <>
                      <ShoppingBag size={17} /> Comprar · {formatMXN(finalTotalForSelection)}
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Direct Live Store Chat Button (No WhatsApp) */}
            <button
              type="button"
              onClick={() =>
                triggerTiendaUI({
                  type: 'OPEN_CHAT',
                  initialMessage: `Hola, me interesa información sobre ${product.cleanTitle} (${product.measure})`,
                })
              }
              style={{
                width: '100%',
                padding: '14px 22px',
                borderRadius: 16,
                border: '1.5px solid rgba(26, 31, 54, 0.14)',
                background: '#FFFFFF',
                color: C.navy,
                fontFamily: F.heading,
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                marginBottom: 22,
                transition: 'all 0.25s ease',
              }}
            >
              <Zap size={15} color={C.red} /> Consultar con Asesor en Chat en Línea
            </button>

            {/* Interactive Glass Accordions Deck */}
            <div
              style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              {[
                {
                  id: 'ficha',
                  title: 'Ficha Técnica Oficial',
                  content: (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {specRows.map((row) => (
                        <div
                          key={row.label}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            padding: '6px 0',
                            borderBottom: '1px solid #F1F5F9',
                            fontSize: 12.5,
                          }}
                        >
                          <span style={{ color: '#64748B' }}>{row.label}</span>
                          <strong style={{ color: C.navy }}>{row.value}</strong>
                        </div>
                      ))}
                    </div>
                  ),
                },
                {
                  id: 'sucursal',
                  title: 'Sucursal Seleccionada & Horarios',
                  content: selectedBranch ? (
                    <div style={{ fontSize: 12.5, color: '#64748B', lineHeight: 1.6 }}>
                      <p style={{ margin: '0 0 4px', color: C.navy, fontWeight: 800 }}>
                        {selectedBranch.name} ({selectedBranch.zone})
                      </p>
                      <p style={{ margin: '0 0 4px' }}>{selectedBranch.address}</p>
                      <p style={{ margin: 0 }}>
                        Tel: {selectedBranch.phone} · Horario:{' '}
                        {selectedBranch.hours?.weekdays}
                      </p>
                    </div>
                  ) : null,
                },
              ].map((acc) => {
                const isOpen = openAccordion === acc.id;
                return (
                  <div
                    key={acc.id}
                    style={{
                      borderRadius: 18,
                      background: '#FFFFFF',
                      border: '1px solid rgba(26, 31, 54, 0.07)',
                      padding: '0 20px',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenAccordion(isOpen ? '' : acc.id)}
                      style={{
                        width: '100%',
                        padding: '15px 0',
                        border: 'none',
                        background: 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        fontFamily: F.heading,
                        fontSize: 11.5,
                        fontWeight: 800,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        color: C.navy,
                      }}
                    >
                      <span>{acc.title}</span>
                      <ChevronDown
                        size={16}
                        style={{
                          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 0.25s ease',
                        }}
                      />
                    </button>
                    {isOpen && <div style={{ paddingBottom: 16 }}>{acc.content}</div>}
                  </div>
                );
              })}

              {/* Product Excerpt right below the Ficha Técnica */}
              {product.excerpt && (
                <div
                  style={{
                    marginTop: 6,
                    padding: '18px 22px',
                    borderRadius: 20,
                    background: '#FFFFFF',
                    border: '1px solid rgba(26, 31, 54, 0.07)',
                    boxShadow: '0 8px 24px rgba(26, 31, 54, 0.025)',
                  }}
                >
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      fontFamily: F.heading,
                      fontSize: 10,
                      fontWeight: 800,
                      letterSpacing: '0.16em',
                      textTransform: 'uppercase',
                      color: C.red,
                      marginBottom: 8,
                    }}
                  >
                    <Sparkles size={12} /> Resumen del Producto
                  </div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 13.5,
                      color: '#475569',
                      lineHeight: 1.65,
                    }}
                  >
                    {product.excerpt}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* VERIFIED DRIVER REVIEWS CAROUSEL */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: 32,
            border: '1px solid rgba(26, 31, 54, 0.07)',
            padding: '40px 38px',
            boxShadow: '0 20px 50px rgba(26, 31, 54, 0.04)',
            marginBottom: 80,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 16,
              marginBottom: 24,
            }}
          >
            <div>
              <h3
                style={{
                  fontFamily: F.heading,
                  fontSize: 'clamp(1.35rem, 2.2vw, 1.75rem)',
                  fontWeight: 900,
                  color: C.navy,
                  margin: '0 0 6px',
                  letterSpacing: '-0.025em',
                }}
              >
                Opiniones de Conductores Verificados
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span
                  style={{
                    fontFamily: F.heading,
                    fontSize: 18,
                    fontWeight: 900,
                    color: C.navy,
                  }}
                >
                  5.0
                </span>
                <div style={{ display: 'flex', gap: 3 }}>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} fill="#F59E0B" color="#F59E0B" />
                  ))}
                </div>
                <span style={{ fontSize: 12, color: '#64748B' }}>
                  Clientes con montaje en sucursales Jasman
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                onClick={() => scrollCarousel('left')}
                aria-label="Anterior"
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  border: '1px solid rgba(26, 31, 54, 0.10)',
                  background: '#F8F9FA',
                  color: C.navy,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ChevronLeft size={17} />
              </button>
              <button
                type="button"
                onClick={() => scrollCarousel('right')}
                aria-label="Siguiente"
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  border: '1px solid rgba(26, 31, 54, 0.10)',
                  background: '#F8F9FA',
                  color: C.navy,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ChevronRight size={17} />
              </button>
            </div>
          </div>

          <div
            ref={carouselRef}
            style={{
              display: 'flex',
              overflowX: 'hidden',
              scrollBehavior: 'smooth',
            }}
          >
            {DRIVER_REVIEWS.map((review, idx) => (
              <div
                key={idx}
                style={{
                  flex: '0 0 100%',
                  padding: '26px 30px',
                  borderRadius: 24,
                  background: '#F8F9FA',
                  border: '1px solid rgba(26, 31, 54, 0.05)',
                  position: 'relative',
                }}
              >
                <Quote
                  size={40}
                  style={{
                    position: 'absolute',
                    top: 20,
                    right: 26,
                    color: 'rgba(196, 30, 36, 0.10)',
                  }}
                />
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    marginBottom: 12,
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      background: review.color,
                      color: '#FFFFFF',
                      fontFamily: F.heading,
                      fontSize: 12.5,
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {review.initials}
                  </div>
                  <div>
                    <div
                      style={{
                        fontFamily: F.heading,
                        fontSize: 13.5,
                        fontWeight: 800,
                        color: C.navy,
                      }}
                    >
                      {review.author}
                    </div>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: '#15803D',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <Check size={11} /> {review.badge}
                    </span>
                  </div>
                </div>

                <p
                  style={{
                    fontFamily: F.body,
                    fontSize: 14,
                    lineHeight: 1.65,
                    color: '#334155',
                    margin: '0 0 10px',
                    maxWidth: 820,
                  }}
                >
                  &ldquo;{review.text}&rdquo;
                </p>

                <span style={{ fontSize: 11, color: '#94A3B8' }}>{review.date}</span>
              </div>
            ))}
          </div>

          {/* Indicator Dots */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 8,
              marginTop: 16,
            }}
          >
            {DRIVER_REVIEWS.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  if (carouselRef.current) {
                    carouselRef.current.scrollTo({
                      left: idx * carouselRef.current.clientWidth,
                      behavior: 'smooth',
                    });
                    setActiveReviewIdx(idx);
                  }
                }}
                style={{
                  width: activeReviewIdx === idx ? 22 : 7,
                  height: 7,
                  borderRadius: 999,
                  border: 'none',
                  background: activeReviewIdx === idx ? C.red : '#CBD5E1',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                }}
              />
            ))}
          </div>
        </div>

        {/* 3-COLUMN CROSS-SELL RELATED TIRES DECK */}
        <div>
          <h3
            style={{
              fontFamily: F.heading,
              fontSize: 'clamp(1.4rem, 2.4vw, 1.9rem)',
              fontWeight: 900,
              color: C.navy,
              margin: '0 0 24px',
              letterSpacing: '-0.03em',
            }}
          >
            Llantas Compatibles y Alternativas Recomendadas
          </h3>

          <div
            className="bruce-related-tires-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 24,
            }}
          >
            {relatedProducts.map((rel) => {
              const relBrandLogo = BRAND_META[rel.brand]?.logo;
              return (
                <div
                  key={rel.id}
                  style={{
                    background: '#FFFFFF',
                    borderRadius: 28,
                    border: '1px solid rgba(26, 31, 54, 0.07)',
                    padding: 24,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 10px 30px rgba(26, 31, 54, 0.035)',
                  }}
                >
                  <div>
                    <div
                      style={{
                        height: 210,
                        borderRadius: 20,
                        background: '#FFFFFF',
                        border: '1px solid rgba(26, 31, 54, 0.05)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 20,
                        marginBottom: 18,
                        position: 'relative',
                      }}
                    >
                      {rel.measure && (
                        <span
                          style={{
                            position: 'absolute',
                            top: 12,
                            right: 12,
                            padding: '4px 10px',
                            borderRadius: 9999,
                            background: C.navy,
                            color: C.white,
                            fontFamily: F.heading,
                            fontSize: 10,
                            fontWeight: 800,
                          }}
                        >
                          {rel.measure}
                        </span>
                      )}
                      <img
                        src={rel.cutoutImage || rel.primaryImage}
                        alt={rel.cleanTitle}
                        style={{
                          width: '82%',
                          height: '82%',
                          objectFit: 'contain',
                          mixBlendMode: rel.hasPngCutout ? 'normal' : 'multiply',
                        }}
                      />
                    </div>

                    {relBrandLogo ? (
                      <img
                        src={relBrandLogo}
                        alt={rel.brand}
                        style={{
                          height: 15,
                          width: 'auto',
                          objectFit: 'contain',
                          marginBottom: 8,
                        }}
                      />
                    ) : (
                      <span
                        style={{
                          fontFamily: F.heading,
                          fontSize: 10,
                          fontWeight: 800,
                          color: C.red,
                          textTransform: 'uppercase',
                          letterSpacing: '0.16em',
                        }}
                      >
                        {rel.brand}
                      </span>
                    )}

                    <h4
                      style={{
                        fontFamily: F.heading,
                        fontSize: 15,
                        fontWeight: 800,
                        color: C.navy,
                        margin: '4px 0 10px',
                        lineHeight: 1.3,
                      }}
                    >
                      {rel.cleanTitle}
                    </h4>

                    <div
                      style={{
                        fontFamily: F.heading,
                        fontSize: 20,
                        fontWeight: 900,
                        color: C.navy,
                        marginBottom: 18,
                      }}
                    >
                      {formatMXN(rel.finalPriceTaxExcluded)}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 10 }}>
                    <button
                      type="button"
                      onClick={() => {
                        navigate(`/landing-tienda-preview/producto/${rel.id}`);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      style={{
                        flex: 1,
                        padding: '12px 16px',
                        borderRadius: 14,
                        border: '1px solid rgba(26, 31, 54, 0.10)',
                        background: '#F8F9FA',
                        color: C.navy,
                        fontFamily: F.heading,
                        fontSize: 11.5,
                        fontWeight: 800,
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                        cursor: 'pointer',
                      }}
                    >
                      Ver Detalles
                    </button>

                    <button
                      type="button"
                      onClick={() => handleQuickAddRelated(rel)}
                      aria-label="Añadir al carrito"
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 14,
                        border: 'none',
                        background: quickAddedId === rel.id ? '#16A34A' : C.red,
                        color: C.white,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 8px 20px rgba(196, 30, 36, 0.25)',
                      }}
                    >
                      {quickAddedId === rel.id ? (
                        <Check size={16} />
                      ) : (
                        <ShoppingBag size={16} />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* FLOATING STICKY BUY BAR WHEN SCROLLING PAST THE MAIN BUY BUTTON */}
      {showFloatingBuyBar && product.inStock && (
        <div
          style={{
            position: 'fixed',
            left: '50%',
            bottom: 20,
            transform: 'translateX(-50%)',
            zIndex: 92,
            width: 'min(940px, calc(100vw - 28px))',
            background: 'rgba(26, 31, 54, 0.96)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: 24,
            padding: '12px 18px',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            boxShadow: '0 24px 56px rgba(15, 20, 40, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            flexWrap: 'wrap',
            color: '#FFFFFF',
          }}
        >
          {/* Left: Tire Thumbnail + Title + Delivery Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              minWidth: 0,
              flex: '1 1 260px',
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                background: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 4,
                flexShrink: 0,
              }}
            >
              <img
                src={product.cutoutImage || product.primaryImage}
                alt={product.cleanTitle}
                onError={(e) => {
                  if (e.currentTarget.src !== product.primaryImage) {
                    e.currentTarget.src = product.primaryImage;
                  }
                }}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                }}
              />
            </div>

            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 3,
                  flexWrap: 'wrap',
                }}
              >
                <span
                  style={{
                    fontFamily: F.heading,
                    fontSize: 10,
                    fontWeight: 800,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: '#FCA5A5',
                  }}
                >
                  {product.brand} · {product.measure}
                </span>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 999,
                    background:
                      deliveryMode === 'shipping'
                        ? 'rgba(22, 163, 74, 0.22)'
                        : 'rgba(255, 255, 255, 0.12)',
                    color: deliveryMode === 'shipping' ? '#86EFAC' : '#E2E8F0',
                  }}
                >
                  {deliveryMode === 'shipping'
                    ? 'Entrega Gratis'
                    : `Instalación en Sucursal (+${formatMXN(BRANCH_INSTALLATION_FEE)})`}
                </span>
              </div>
              <div
                style={{
                  fontFamily: F.heading,
                  fontSize: 14,
                  fontWeight: 800,
                  color: '#FFFFFF',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {product.cleanTitle}
              </div>
            </div>
          </div>

          {/* Right: Quantity Selector + Add to Cart Button */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              flexShrink: 0,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                height: 44,
                padding: '0 6px',
                borderRadius: 14,
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.14)',
              }}
            >
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  border: 'none',
                  background: 'transparent',
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Minus size={14} />
              </button>
              <span
                style={{
                  minWidth: 28,
                  textAlign: 'center',
                  fontFamily: F.heading,
                  fontSize: 14,
                  fontWeight: 800,
                  color: '#FFFFFF',
                }}
              >
                {qty}
              </span>
              <button
                type="button"
                onClick={() => setQty((q) => Math.min(product.quantity, q + 1))}
                disabled={qty >= product.quantity}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  border: 'none',
                  background: 'transparent',
                  color: qty >= product.quantity ? 'rgba(255,255,255,0.3)' : '#FFFFFF',
                  cursor: qty >= product.quantity ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Plus size={14} />
              </button>
            </div>

            <button
              type="button"
              onClick={handleAddToCart}
              style={{
                height: 44,
                padding: '0 20px',
                borderRadius: 14,
                border: 'none',
                background: added ? '#16A34A' : C.red,
                color: '#FFFFFF',
                fontFamily: F.heading,
                fontSize: 12.5,
                fontWeight: 800,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 10px 24px rgba(196, 30, 36, 0.35)',
                whiteSpace: 'nowrap',
              }}
            >
              {added ? (
                <>
                  <Check size={15} /> ¡Agregado!
                </>
              ) : (
                <>
                  <ShoppingBag size={15} /> Agregar
                  {basePrice > 0 ? ` · ${formatMXN(finalTotalForSelection)}` : ''}
                </>
              )}
            </button>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 940px) {
          .bruce-tire-detail-grid {
            grid-template-columns: 1fr !important;
            gap: 32px !important;
          }
          .bruce-tire-visuals-col {
            position: relative !important;
            top: 0 !important;
          }
          .bruce-related-tires-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
