import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { C, F } from '../hooks/useAnimations';
import {
  sucursalesWithCoords,
  resolvePostalCodeCoords,
  getClosestBranches,
  formatDistance,
} from '../data/postalCodesData';
import {
  MapPin, Phone, MessageCircle, Navigation, Search, CheckCircle,
  ShieldCheck, Wrench, Trophy, Clock, ArrowRight, Sparkles, AlertCircle,
  Copy, Check, Share2, Compass, Car, ChevronDown
} from 'lucide-react';

delete L.Icon.Default.prototype._getIconUrl;

// Custom Leaflet Icons
const branchIcon = new L.DivIcon({
  className: 'jasman-branch-pin',
  html: `<div style="
    width:36px;height:36px;background:#C41E24;border-radius:50%;
    border:3px solid #FFFFFF;box-shadow:0 4px 16px rgba(196,30,36,0.5), 0 0 0 4px rgba(196,30,36,0.25);
    display:flex;align-items:center;justify-content:center;color:#FFFFFF;font-family:'Montserrat',sans-serif;
    font-weight:900;font-size:16px;cursor:pointer;animation:pulseGlow 2s infinite;
  ">J</div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
  popupAnchor: [0, -22],
});

const userPinIcon = new L.DivIcon({
  className: 'user-location-pin',
  html: `<div style="
    width:28px;height:28px;background:#2563EB;border-radius:50%;
    border:3px solid #FFFFFF;box-shadow:0 4px 12px rgba(37,99,235,0.5), 0 0 0 4px rgba(37,99,235,0.25);
    display:flex;align-items:center;justify-content:center;color:#FFFFFF;cursor:pointer;
  ">
    <div style="width:10px;height:10px;background:#FFFFFF;border-radius:50%;"></div>
  </div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  popupAnchor: [0, -18],
});

const secondaryBranchIcon = new L.DivIcon({
  className: 'jasman-secondary-pin',
  html: `<div style="
    width:24px;height:24px;background:#1A1F36;border-radius:50%;
    border:2px solid #FFFFFF;box-shadow:0 2px 8px rgba(0,0,0,0.3);
    display:flex;align-items:center;justify-content:center;color:#FFFFFF;font-family:'Montserrat',sans-serif;
    font-weight:800;font-size:11px;cursor:pointer;
  ">J</div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -14],
});

// Map Controller for Dynamic View/Fit Bounds
function MapController({ center, zoom, bounds }) {
  const map = useMap();
  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    } else if (center) {
      map.setView(center, zoom, { animate: true });
    }
  }, [center, zoom, bounds, map]);
  return null;
}

// Popular sample postal codes for quick selection
const popularPostalCodes = [
  { cp: '02710', label: 'Azcapotzalco (02710)' },
  { cp: '03100', label: 'Del Valle / Benito Juárez (03100)' },
  { cp: '01330', label: 'Santa Fe (01330)' },
  { cp: '06720', label: 'Roma / Cuauhtémoc (06720)' },
  { cp: '53120', label: 'Lomas Verdes / Naucalpan (53120)' },
  { cp: '54060', label: 'Tlalnepantla (54060)' },
  { cp: '76000', label: 'Querétaro (76000)' },
  { cp: '44160', label: 'Guadalajara (44160)' },
  { cp: '64000', label: 'Monterrey (64000)' },
];

export default function LandingAlineacionPage() {
  // Input state
  const [postalCode, setPostalCode] = useState('02710');
  const [loading, setLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState(null);

  // Search result state
  const [currentLocation, setCurrentLocation] = useState({
    cp: '02710',
    name: 'Col. San Pedro Xalpa, Azcapotzalco, CDMX',
    lat: 19.4913,
    lng: -99.1985,
    isGps: false,
  });

  const [nearbyBranches, setNearbyBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [copiedAddress, setCopiedAddress] = useState(false);

  // Coupon Generator state ("Cupón Primer Pantallazo")
  const [couponName, setCouponName] = useState('');
  const [couponPhone, setCouponPhone] = useState('');
  const [couponCar, setCouponCar] = useState('');
  const [generatedCoupon, setGeneratedCoupon] = useState(null);
  const [copiedCoupon, setCopiedCoupon] = useState(false);

  // FAQ Accordion
  const [openFaq, setOpenFaq] = useState(0);

  // References
  const searchSectionRef = useRef(null);
  const couponSectionRef = useRef(null);

  // Initial automatic geolocation request on mount
  useEffect(() => {
    document.title = 'Alineación y balanceo en las 4 llantas desde $750 | Jasman Automotriz';

    // 1. Initial fast fallback so the UI displays immediately
    executeSearch('02710');

    // 2. Immediately request user GPS location on page load
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      setGeoLoading(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setCurrentLocation({
            cp: 'GPS',
            name: 'Tu ubicación actual detectada por GPS',
            lat: latitude,
            lng: longitude,
            isGps: true,
          });

          const closest = getClosestBranches(latitude, longitude, 4);
          setNearbyBranches(closest);
          setSelectedBranch(closest[0] || null);
          setGeoLoading(false);
          setGeoError(null);
        },
        (err) => {
          // Silent fallback on initial load if user denies or dismisses permission prompt
          console.log('Ubicación inicial rechazada o no disponible:', err?.message);
          setGeoLoading(false);
        },
        { timeout: 8000, enableHighAccuracy: true }
      );
    }
  }, []);

  const executeSearch = async (cpToSearch) => {
    const cp = String(cpToSearch || postalCode).trim();
    if (!cp) return;
    setLoading(true);
    setGeoError(null);

    try {
      const resolved = await resolvePostalCodeCoords(cp);
      setCurrentLocation({
        cp: resolved.cp,
        name: resolved.name,
        lat: resolved.lat,
        lng: resolved.lng,
        isGps: false,
      });

      const closest = getClosestBranches(resolved.lat, resolved.lng, 4);
      setNearbyBranches(closest);
      setSelectedBranch(closest[0] || null);
    } catch (err) {
      console.error('Error al resolver código postal:', err);
      setGeoError('No pudimos localizar ese código postal. Intenta con otro o usa tu ubicación actual.');
    } finally {
      setLoading(false);
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Tu navegador no soporta geolocalización. Ingresa tu código postal manualmente.');
      return;
    }

    setGeoLoading(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setCurrentLocation({
          cp: 'GPS',
          name: 'Tu ubicación actual detectada por GPS',
          lat: latitude,
          lng: longitude,
          isGps: true,
        });

        const closest = getClosestBranches(latitude, longitude, 4);
        setNearbyBranches(closest);
        setSelectedBranch(closest[0] || null);
        setGeoLoading(false);
        setGeoError(null);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setGeoLoading(false);
        if (err.code === 1 /* PERMISSION_DENIED */) {
          setGeoError('Permiso de ubicación denegado o bloqueado en el navegador. Puedes ingresar tu código postal abajo o activar la ubicación en los ajustes de tu navegador.');
        } else if (err.code === 3 /* TIMEOUT */) {
          setGeoError('Se agotó el tiempo para obtener tu ubicación GPS. Por favor ingresa tu código postal.');
        } else {
          setGeoError('No se pudo acceder a tu ubicación actual. Ingresa tu código postal manualmente.');
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleCopyAddress = (address) => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2500);
  };

  const handleGenerateCoupon = (e) => {
    e.preventDefault();
    if (!couponName.trim() || !couponPhone.trim()) return;

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const code = `JASMAN-750-${randomSuffix}`;

    const newCoupon = {
      code,
      name: couponName.trim(),
      phone: couponPhone.trim(),
      car: couponCar.trim() || 'Vehículo particular',
      branch: selectedBranch ? selectedBranch.name : 'Cualquier sucursal Jasman',
      discount: 'Alineación y balanceo en 4 llantas x $750 MXN (Rin 13" a 17")',
      createdAt: new Date().toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' }),
    };

    setGeneratedCoupon(newCoupon);
  };

  const primaryBranch = selectedBranch || nearbyBranches[0];

  // Map Bounds to encompass user and closest branch
  const mapBounds = primaryBranch && currentLocation ? [
    [currentLocation.lat, currentLocation.lng],
    [primaryBranch.lat, primaryBranch.lng]
  ] : null;

  // WhatsApp Message for Promotion
  const getWhatsAppPromoUrl = (branch) => {
    if (!branch || !branch.phone) return 'https://api.whatsapp.com/send/?phone=525547611468&text=Hola,%20quisiera%20más%20información%20de%20su%20promoción%20de%20Alineación%20y%20Balanceo';
    const cleanPhone = branch.phone.replace(/\D/g, '');
    const phoneWithCountry = cleanPhone.startsWith('52') ? cleanPhone : `52${cleanPhone}`;
    const text = encodeURIComponent(`Hola, quisiera más información de su promoción de Alineación y Balanceo en la sucursal "${branch.name}"`);
    return `https://api.whatsapp.com/send/?phone=${phoneWithCountry}&text=${text}`;
  };

  const faqItems = [
    {
      q: '¿Qué incluye la promoción de $750.00 MXN de Alineación y Balanceo?',
      a: 'Incluye la alineación computarizada de alta precisión en las 4 llantas, el balanceo dinámico y estático de las 4 ruedas para rines desde 13" hasta 17", inspección visual de seguridad de 25 puntos en suspensión y frenos, y calibración de presión de inflado.'
    },
    {
      q: '¿Cómo sé si mi auto necesita alineación y balanceo?',
      a: 'Las señales más comunes son: vibraciones en el volante o en el asiento a velocidades mayores a 70-80 km/h, si el vehículo tira o se desvía hacia un lado al soltar suavemente el volante, desgaste irregular en los bordes de las llantas, o después de caer en un bache pronunciado.'
    },
    {
      q: '¿En qué sucursales de Jasman es válida esta promoción?',
      a: 'Es válida en sucursales participantes de Jasman Automotriz a nivel nacional (CDMX, Estado de México, Querétaro, Guanajuato, Jalisco, Nuevo León, Michoacán, Morelos e Hidalgo). Puedes consultar la disponibilidad directa en tu sucursal más cercana ingresando tu C.P.'
    },
    {
      q: '¿Es necesario agendar cita previa o puedo llegar directo?',
      a: 'Puedes llegar directamente a cualquiera de nuestras sucursales y serás atendido por orden de llegada, o bien agendar tu cita por WhatsApp para asegurar un lugar prioritario en rampa y reducir tu tiempo de espera.'
    },
    {
      q: '¿Cuáles son las formas de pago aceptadas?',
      a: 'Aceptamos pago en efectivo, tarjeta de débito, tarjeta de crédito en una sola exhibición y transferencia bancaria directa en mostrador. Todos nuestros precios ya incluyen IVA.'
    }
  ];

  return (
    <div style={{ background: '#F8F9FA', color: C.charcoal, minHeight: '100vh' }}>

      {/* ═══════ 1. PROMOTIONAL HERO BANNER ═══════ */}
      <section style={{
        background: '#0B0D17',
        padding: '110px 20px 40px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Glow ambient background elements */}
        <div style={{
          position: 'absolute', top: '-10%', left: '50%', transform: 'translateX(-50%)',
          width: '70vw', height: '300px', background: 'radial-gradient(ellipse at center, rgba(196,30,36,0.25) 0%, rgba(11,13,23,0) 70%)',
          pointerEvents: 'none', zIndex: 0,
        }} />

        <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 1 }}>

          {/* Promotional Tag */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '6px 18px', borderRadius: 9999,
              background: 'rgba(196,30,36,0.15)', border: '1px solid rgba(196,30,36,0.4)',
              color: '#FF6B6B', fontFamily: F.heading, fontWeight: 700, fontSize: 13,
              letterSpacing: '0.08em', textTransform: 'uppercase',
            }}>
              <Sparkles size={15} color="#FF6B6B" /> OFERTA ESPECIAL VIGENTE
            </span>
          </div>

          {/* Main Banner Image Container */}
          <div style={{
            borderRadius: 24,
            overflow: 'hidden',
            boxShadow: '0 20px 50px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.08)',
            position: 'relative',
            background: '#1A1F36',
          }}>
            <img
              src="/images/promo-landing-banner.jpg"
              alt="Promoción Alineación y Balanceo Jasman Automotriz en las 4 llantas desde $750 MXN"
              style={{
                width: '100%',
                height: 'auto',
                display: 'block',
                maxHeight: '520px',
                objectFit: 'cover',
                objectPosition: 'center',
              }}
            />
          </div>

          {/* Quick CTA Action Bar Below Banner */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            background: 'rgba(26,31,54,0.92)',
            backdropFilter: 'blur(16px)',
            borderRadius: 20,
            padding: '20px 28px',
            marginTop: 20,
            border: '1px solid rgba(255,255,255,0.1)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 14,
                background: C.red, display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: C.white, flexShrink: 0, boxShadow: '0 4px 16px rgba(196,30,36,0.4)',
              }}>
                <Wrench size={24} />
              </div>
              <div>
                <div style={{ fontFamily: F.heading, fontWeight: 800, fontSize: 18, color: C.white }}>
                  Alineación y Balanceo en las 4 Llantas
                </div>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 2 }}>
                  Desde <span style={{ color: '#FFD700', fontWeight: 700, fontSize: 15 }}>$750.00 MXN</span> (IVA Incluido) · Rin 13" al 17"
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button
                onClick={() => searchSectionRef.current?.scrollIntoView({ behavior: 'smooth' })}
                style={{
                  padding: '12px 24px', borderRadius: 9999,
                  background: C.red, color: C.white, border: 'none',
                  fontFamily: F.heading, fontWeight: 700, fontSize: 14,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                  boxShadow: '0 4px 18px rgba(196,30,36,0.4)',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.background = C.redDark; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.background = C.red; }}
              >
                <MapPin size={16} /> Buscar mi Sucursal
              </button>

              <button
                onClick={() => couponSectionRef.current?.scrollIntoView({ behavior: 'smooth' })}
                style={{
                  padding: '12px 22px', borderRadius: 9999,
                  background: 'rgba(255,255,255,0.08)', color: C.white,
                  border: '1px solid rgba(255,255,255,0.2)',
                  fontFamily: F.heading, fontWeight: 600, fontSize: 14,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.16)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
              >
                <Sparkles size={16} color="#FFD700" /> Generar Cupón
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* ═══════ 2. SEARCH & BRANCH FINDER (EL REPETIDOR) ═══════ */}
      <section ref={searchSectionRef} style={{ padding: '60px 20px', maxWidth: 1200, margin: '0 auto' }}>

        {/* Section Header */}
        <div style={{ textAlign: 'center', maxWidth: 760, margin: '0 auto 40px' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            color: C.red, fontFamily: F.heading, fontWeight: 700, fontSize: 13,
            letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12,
          }}>
            <Compass size={16} /> TU TALLER MÁS CERCA
          </span>
          <h1 style={{
            fontFamily: F.heading, fontWeight: 900,
            fontSize: 'clamp(2rem, 4vw, 2.8rem)', color: C.navy,
            lineHeight: 1.15, marginBottom: 16,
          }}>
            Encuentra tu sucursal Jasman
          </h1>
          <p style={{ fontSize: 16, color: C.gray, lineHeight: 1.6 }}>
            Ingresa tu código postal y te mostramos la sucursal más cercana con su ubicación exacta,
            distancia en tiempo real y datos de contacto directo.
          </p>

          {/* 3 Trust Pills */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap', marginTop: 24 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '6px 16px', borderRadius: 9999, background: C.white,
              border: `1px solid ${C.border}`, fontSize: 13, fontWeight: 600, color: C.navy,
            }}>
              <MapPin size={14} color={C.red} /> Más de 50 sucursales
            </span>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '6px 16px', borderRadius: 9999, background: C.white,
              border: `1px solid ${C.border}`, fontSize: 13, fontWeight: 600, color: C.navy,
            }}>
              <Wrench size={14} color={C.red} /> Servicio especializado
            </span>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '6px 16px', borderRadius: 9999, background: C.white,
              border: `1px solid ${C.border}`, fontSize: 13, fontWeight: 600, color: C.navy,
            }}>
              <ShieldCheck size={14} color={C.red} /> Confianza en todo México
            </span>
          </div>
        </div>

        {/* Search Controls Card */}
        <div style={{
          background: C.white,
          borderRadius: 24,
          padding: '28px 32px',
          boxShadow: '0 12px 35px rgba(0,0,0,0.06)',
          border: `1px solid ${C.border}`,
          marginBottom: 40,
        }}>
          <form
            onSubmit={(e) => { e.preventDefault(); executeSearch(postalCode); }}
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 14,
              alignItems: 'center',
            }}
          >
            {/* Input with Label */}
            <div style={{ flex: '1 1 280px', position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <label style={{
                  display: 'block', fontSize: 12, fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: '0.05em',
                  color: C.gray,
                }}>
                  Ingresa tu código postal (5 dígitos):
                </label>
                {currentLocation.isGps && (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    padding: '2px 10px', borderRadius: 9999,
                    background: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE',
                    fontSize: 11, fontWeight: 700,
                  }}>
                    <Navigation size={11} /> Ubicación GPS activa
                  </span>
                )}
              </div>
              <div style={{ position: 'relative' }}>
                <MapPin size={18} color={C.red} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  maxLength={5}
                  value={postalCode}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    setPostalCode(val);
                    if (val.length === 5) executeSearch(val);
                  }}
                  placeholder="Ej. 02710 o 03100"
                  style={{
                    width: '100%',
                    padding: '14px 16px 14px 44px',
                    borderRadius: 14,
                    border: `2px solid ${C.border}`,
                    fontSize: 16,
                    fontFamily: F.heading,
                    fontWeight: 600,
                    outline: 'none',
                    transition: 'border-color 0.3s',
                    boxSizing: 'border-box',
                  }}
                  onFocus={e => e.currentTarget.style.borderColor = C.red}
                  onBlur={e => e.currentTarget.style.borderColor = C.border}
                />
              </div>
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignSelf: 'flex-end' }}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '14px 28px',
                  borderRadius: 14,
                  background: C.red,
                  color: C.white,
                  border: 'none',
                  fontFamily: F.heading,
                  fontWeight: 700,
                  fontSize: 15,
                  cursor: loading ? 'wait' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  boxShadow: '0 4px 16px rgba(196,30,36,0.3)',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={e => !loading && (e.currentTarget.style.background = C.redDark)}
                onMouseLeave={e => !loading && (e.currentTarget.style.background = C.red)}
              >
                <Search size={18} /> {loading ? 'Buscando...' : 'Buscar sucursal'}
              </button>

              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={geoLoading}
                style={{
                  padding: '14px 22px',
                  borderRadius: 14,
                  background: 'rgba(37,99,235,0.08)',
                  color: '#1D4ED8',
                  border: '1px solid rgba(37,99,235,0.2)',
                  fontFamily: F.heading,
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: geoLoading ? 'wait' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={e => !geoLoading && (e.currentTarget.style.background = 'rgba(37,99,235,0.15)')}
                onMouseLeave={e => !geoLoading && (e.currentTarget.style.background = 'rgba(37,99,235,0.08)')}
              >
                <Navigation size={18} /> {geoLoading ? 'Detectando GPS...' : 'Usar mi ubicación actual'}
              </button>
            </div>
          </form>

          {/* Quick Postal Code Chips */}
          <div style={{ marginTop: 20, paddingTop: 18, borderTop: `1px solid ${C.border}` }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: C.gray, marginRight: 10 }}>
              C.P. frecuentes:
            </span>
            <div style={{ display: 'inline-flex', flexWrap: 'wrap', gap: 6, verticalAlign: 'middle', marginTop: 4 }}>
              {popularPostalCodes.map(item => (
                <button
                  key={item.cp}
                  type="button"
                  onClick={() => { setPostalCode(item.cp); executeSearch(item.cp); }}
                  style={{
                    padding: '4px 12px',
                    borderRadius: 9999,
                    fontSize: 12,
                    fontWeight: 600,
                    border: `1px solid ${postalCode === item.cp ? C.red : C.border}`,
                    background: postalCode === item.cp ? 'rgba(196,30,36,0.08)' : C.light,
                    color: postalCode === item.cp ? C.red : C.charcoal,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Error notice if any */}
          {geoError && (
            <div style={{
              marginTop: 16, padding: '12px 18px', borderRadius: 12,
              background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B',
              fontSize: 13, display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <AlertCircle size={18} /> {geoError}
            </div>
          )}
        </div>

        {/* ═══════ RESULTS REPEATER: Closest Branch + Interactive Map ═══════ */}
        {primaryBranch && (
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1.1fr) minmax(320px, 1.3fr)', gap: 32, alignItems: 'start' }}>

            {/* Left Column: Closest Branch Card ("EL REPETIDOR") */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* Main Closest Branch Hero Card */}
              <div style={{
                background: C.white,
                borderRadius: 24,
                padding: '32px',
                border: '2px solid #C41E24',
                boxShadow: '0 16px 40px rgba(196,30,36,0.12)',
                position: 'relative',
              }}>
                {/* Header Badges */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 8 }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '5px 14px', borderRadius: 9999,
                    background: '#C41E24', color: C.white,
                    fontFamily: F.heading, fontWeight: 800, fontSize: 12,
                    letterSpacing: '0.05em', textTransform: 'uppercase',
                  }}>
                    <Sparkles size={13} /> TU SUCURSAL MÁS CERCANA
                  </span>

                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '6px 14px', borderRadius: 9999,
                    background: 'rgba(196,30,36,0.08)', color: C.red,
                    fontFamily: F.heading, fontWeight: 800, fontSize: 14,
                  }}>
                    <Car size={16} /> A solo {primaryBranch.distanceFormatted}
                  </span>
                </div>

                {/* Branch Name */}
                <h2 style={{
                  fontFamily: F.heading, fontWeight: 800, fontSize: 24, color: C.navy,
                  lineHeight: 1.2, marginBottom: 16,
                }}>
                  {primaryBranch.fullName}
                </h2>

                {/* Reference to searched location */}
                <div style={{
                  fontSize: 13, color: C.gray, marginBottom: 20,
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '8px 12px', background: C.light, borderRadius: 10,
                }}>
                  <Navigation size={14} color="#2563EB" />
                  <span>Calculado desde: <strong>{currentLocation.name}</strong></span>
                </div>

                {/* Details List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
                  {/* Address */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{
                      width: 38, height: 38, borderRadius: 12, background: 'rgba(196,30,36,0.06)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.red, flexShrink: 0,
                    }}>
                      <MapPin size={18} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: C.gray, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Dirección completa
                      </div>
                      <div style={{ fontSize: 14, color: C.navy, lineHeight: 1.45, marginTop: 2 }}>
                        {primaryBranch.address}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopyAddress(primaryBranch.address)}
                        style={{
                          background: 'none', border: 'none', padding: 0, marginTop: 4,
                          fontSize: 12, color: copiedAddress ? '#059669' : C.red,
                          cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 600,
                        }}
                      >
                        {copiedAddress ? <Check size={13} /> : <Copy size={13} />}
                        {copiedAddress ? '¡Copiado!' : 'Copiar dirección'}
                      </button>
                    </div>
                  </div>

                  {/* Hours */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{
                      width: 38, height: 38, borderRadius: 12, background: 'rgba(196,30,36,0.06)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.red, flexShrink: 0,
                    }}>
                      <Clock size={18} />
                    </div>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: C.gray, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Horario de atención
                      </div>
                      <div style={{ fontSize: 14, color: C.navy, lineHeight: 1.45, marginTop: 2 }}>
                        <strong>Lunes a Sábado:</strong> 8:00 a.m. - 7:00 p.m.<br />
                        <strong>Domingo:</strong> 9:00 a.m. - 3:00 p.m.
                      </div>
                    </div>
                  </div>

                  {/* Phone */}
                  {primaryBranch.phone && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                      <div style={{
                        width: 38, height: 38, borderRadius: 12, background: 'rgba(196,30,36,0.06)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.red, flexShrink: 0,
                      }}>
                        <Phone size={18} />
                      </div>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: C.gray, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Teléfono directo
                        </div>
                        <a
                          href={`tel:${primaryBranch.phone.replace(/\s/g, '')}`}
                          style={{
                            fontSize: 16, fontFamily: F.heading, fontWeight: 700, color: C.navy,
                            textDecoration: 'none', display: 'inline-block', marginTop: 2,
                          }}
                        >
                          {primaryBranch.phone}
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                {/* Primary Action Buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {/* WhatsApp CTA */}
                  <a
                    href={getWhatsAppPromoUrl(primaryBranch)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: '14px 20px',
                      borderRadius: 14,
                      background: '#25D366',
                      color: C.white,
                      fontFamily: F.heading,
                      fontWeight: 700,
                      fontSize: 15,
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 10,
                      boxShadow: '0 4px 18px rgba(37,211,102,0.35)',
                      transition: 'all 0.3s ease',
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <MessageCircle size={20} /> Solicitar Promoción por WhatsApp
                  </a>

                  {/* Google Maps Directions */}
                  <a
                    href={primaryBranch.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: '12px 20px',
                      borderRadius: 14,
                      background: C.white,
                      border: `1px solid ${C.border}`,
                      color: C.navy,
                      fontFamily: F.heading,
                      fontWeight: 600,
                      fontSize: 14,
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = C.light; e.currentTarget.style.borderColor = C.red; }}
                    onMouseLeave={e => { e.currentTarget.style.background = C.white; e.currentTarget.style.borderColor = C.border; }}
                  >
                    <Navigation size={16} color={C.red} /> Cómo llegar / Ver en Google Maps
                  </a>
                </div>

              </div>

              {/* Other nearby branches (2nd, 3rd, 4th) */}
              {nearbyBranches.length > 1 && (
                <div style={{
                  background: C.white, borderRadius: 20, padding: 24,
                  border: `1px solid ${C.border}`, boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                }}>
                  <h3 style={{ fontFamily: F.heading, fontWeight: 700, fontSize: 16, color: C.navy, marginBottom: 14 }}>
                    Otras sucursales Jasman cercanas:
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {nearbyBranches.slice(1).map((branch) => (
                      <div
                        key={branch.id}
                        onClick={() => setSelectedBranch(branch)}
                        style={{
                          padding: '14px 16px',
                          borderRadius: 14,
                          background: selectedBranch?.id === branch.id ? 'rgba(196,30,36,0.06)' : C.light,
                          border: `1px solid ${selectedBranch?.id === branch.id ? C.red : C.border}`,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 12,
                          transition: 'all 0.2s',
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div style={{ fontFamily: F.heading, fontWeight: 700, fontSize: 14, color: C.navy }}>
                            Suc. {branch.name}
                          </div>
                          <div style={{ fontSize: 12, color: C.gray, marginTop: 2 }}>
                            {branch.city}, {branch.state}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{
                            fontSize: 13, fontWeight: 800, color: C.red,
                            fontFamily: F.heading, background: C.white,
                            padding: '3px 10px', borderRadius: 9999, border: `1px solid ${C.border}`,
                          }}>
                            {branch.distanceFormatted}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Right Column: Interactive Leaflet Map */}
            <div style={{
              background: C.white,
              borderRadius: 24,
              overflow: 'hidden',
              boxShadow: '0 12px 35px rgba(0,0,0,0.08)',
              border: `1px solid ${C.border}`,
              height: '620px',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
            }}>
              {/* Map Top Bar */}
              <div style={{
                padding: '14px 20px',
                background: C.navy,
                color: C.white,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                zIndex: 10,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600 }}>
                  <MapPin size={16} color={C.redLight} /> Mapa de Ubicación y Ruta
                </div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>
                  {primaryBranch.name} ({primaryBranch.distanceFormatted})
                </div>
              </div>

              {/* Leaflet Map Container */}
              <div style={{ flex: 1, position: 'relative' }}>
                <MapContainer
                  center={[primaryBranch.lat, primaryBranch.lng]}
                  zoom={13}
                  scrollWheelZoom={false}
                  style={{ width: '100%', height: '100%' }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  <MapController bounds={mapBounds} />

                  {/* Marker for User / Postal Code Position */}
                  {currentLocation && (
                    <Marker position={[currentLocation.lat, currentLocation.lng]} icon={userPinIcon}>
                      <Popup>
                        <div style={{ padding: 4, fontFamily: F.body, fontSize: 12 }}>
                          <strong>Tu ubicación de búsqueda</strong><br />
                          {currentLocation.name}
                        </div>
                      </Popup>
                    </Marker>
                  )}

                  {/* Line between user and selected branch */}
                  {currentLocation && primaryBranch && (
                    <Polyline
                      positions={[
                        [currentLocation.lat, currentLocation.lng],
                        [primaryBranch.lat, primaryBranch.lng],
                      ]}
                      color="#C41E24"
                      dashArray="6, 8"
                      weight={3}
                      opacity={0.8}
                    />
                  )}

                  {/* Marker for Selected Primary Branch */}
                  <Marker position={[primaryBranch.lat, primaryBranch.lng]} icon={branchIcon}>
                    <Popup>
                      <div style={{ padding: 6, fontFamily: F.body, maxWidth: 220 }}>
                        <strong style={{ fontFamily: F.heading, color: C.red, fontSize: 14 }}>
                          {primaryBranch.fullName}
                        </strong>
                        <div style={{ fontSize: 12, color: C.charcoal, marginTop: 4, lineHeight: 1.4 }}>
                          {primaryBranch.address}
                        </div>
                        <div style={{ marginTop: 8, fontWeight: 700, color: C.navy, fontSize: 12 }}>
                          Distancia: {primaryBranch.distanceFormatted}
                        </div>
                        <a
                          href={primaryBranch.mapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'inline-block', marginTop: 8, padding: '4px 10px',
                            background: C.red, color: C.white, borderRadius: 6,
                            textDecoration: 'none', fontSize: 11, fontWeight: 700,
                          }}
                        >
                          Ver en Google Maps →
                        </a>
                      </div>
                    </Popup>
                  </Marker>

                  {/* Secondary Branch Markers */}
                  {nearbyBranches.slice(1).map(branch => (
                    <Marker
                      key={branch.id}
                      position={[branch.lat, branch.lng]}
                      icon={secondaryBranchIcon}
                      eventHandlers={{
                        click: () => setSelectedBranch(branch),
                      }}
                    >
                      <Popup>
                        <div style={{ padding: 4, fontSize: 12 }}>
                          <strong>{branch.fullName}</strong><br />
                          {branch.distanceFormatted} de distancia<br />
                          <button
                            type="button"
                            onClick={() => setSelectedBranch(branch)}
                            style={{
                              marginTop: 6, padding: '3px 8px', background: C.navy,
                              color: C.white, border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 11,
                            }}
                          >
                            Seleccionar sucursal
                          </button>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>

              {/* Map Footer Helper */}
              <div style={{
                padding: '10px 18px', background: C.light, borderTop: `1px solid ${C.border}`,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: C.gray,
              }}>
                <span>🔵 Tu C.P. / Ubicación</span>
                <span>🔴 Sucursal Jasman Seleccionada</span>
              </div>
            </div>

          </div>
        )}

      </section>

      {/* ═══════ 3. WHAT'S INCLUDED IN THE $750 MXN PROMOTION ═══════ */}
      <section style={{ padding: '70px 20px', background: C.white, borderTop: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>

          <div style={{ textAlign: 'center', maxWidth: 700, margin: '0 auto 50px' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              color: C.red, fontFamily: F.heading, fontWeight: 700, fontSize: 13,
              letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12,
            }}>
              <CheckCircle size={16} /> SERVICIO PROFESIONAL GARANTIZADO
            </span>
            <h2 style={{ fontFamily: F.heading, fontWeight: 900, fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', color: C.navy }}>
              ¿Qué incluye la promoción de Alineación y Balanceo?
            </h2>
            <p style={{ fontSize: 16, color: C.gray, marginTop: 12 }}>
              Todo lo que tu automóvil necesita para un manejo suave, seguro y para alargar la vida útil de tus llantas.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
            {[
              {
                title: 'Alineación Computarizada 3D',
                desc: 'Ajuste milimétrico de los ángulos de las 4 ruedas (cámber, cáster y convergencia) según las especificaciones del fabricante.',
                icon: <Compass size={24} color={C.red} />,
              },
              {
                title: 'Balanceo Dinámico en 4 Ruedas',
                desc: 'Compensación precisa del peso de rines y llantas del Rin 13" al Rin 17" para eliminar vibraciones en el volante a cualquier velocidad.',
                icon: <Wrench size={24} color={C.red} />,
              },
              {
                title: 'Revisión de Suspensión y Dirección',
                desc: 'Inspección de amortiguadores, rótulas, bieletas, bujes y terminales de dirección para garantizar estabilidad y seguridad.',
                icon: <ShieldCheck size={24} color={C.red} />,
              },
              {
                title: 'Calibración e Inspección de Llantas',
                desc: 'Revisión de profundidad de dibujo, desgaste simétrico y ajuste de presión con aire o nitrógeno para optimizar el consumo de combustible.',
                icon: <CheckCircle size={24} color={C.red} />,
              },
            ].map((card, idx) => (
              <div
                key={idx}
                style={{
                  background: C.light,
                  borderRadius: 20,
                  padding: '28px 24px',
                  border: `1px solid ${C.border}`,
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-6px)';
                  e.currentTarget.style.boxShadow = '0 16px 30px rgba(0,0,0,0.06)';
                  e.currentTarget.style.borderColor = 'rgba(196,30,36,0.3)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = C.border;
                }}
              >
                <div style={{
                  width: 50, height: 50, borderRadius: 14, background: C.white,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 18, boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
                }}>
                  {card.icon}
                </div>
                <h3 style={{ fontFamily: F.heading, fontWeight: 800, fontSize: 18, color: C.navy, marginBottom: 10 }}>
                  {card.title}
                </h3>
                <p style={{ fontSize: 14, color: C.gray, lineHeight: 1.6 }}>
                  {card.desc}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ═══════ 4. DIGITAL COUPON GENERATOR ("CUPÓN PRIMER PANTALLAZO") ═══════ */}
      <section ref={couponSectionRef} style={{
        padding: '80px 20px',
        background: `linear-gradient(135deg, ${C.navy} 0%, #0D111E 100%)`,
        color: C.white,
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', position: 'relative', zIndex: 1 }}>

          <div style={{ textAlign: 'center', maxWidth: 680, margin: '0 auto 40px' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '6px 16px', borderRadius: 9999,
              background: 'rgba(255,215,0,0.15)', color: '#FFD700',
              fontFamily: F.heading, fontWeight: 700, fontSize: 12, letterSpacing: '0.08em',
              textTransform: 'uppercase', marginBottom: 16, border: '1px solid rgba(255,215,0,0.3)',
            }}>
              <Sparkles size={14} /> CUPÓN DIGITAL INMEDIATO
            </span>
            <h2 style={{ fontFamily: F.heading, fontWeight: 900, fontSize: 'clamp(2rem, 4vw, 2.7rem)', color: C.white, lineHeight: 1.15 }}>
              Genera tu cupón de descuento $750
            </h2>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.7)', marginTop: 12 }}>
              Presenta este cupón digital al llegar a la sucursal o muéstralo desde tu teléfono para hacer válida la promoción.
            </p>
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.04)',
            backdropFilter: 'blur(20px)',
            borderRadius: 24,
            border: '1px solid rgba(255,255,255,0.12)',
            padding: '36px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
          }}>
            {!generatedCoupon ? (
              <form onSubmit={handleGenerateCoupon} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.75)', marginBottom: 8, textTransform: 'uppercase' }}>
                    Tu nombre completo *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Carlos Mendoza"
                    value={couponName}
                    onChange={e => setCouponName(e.target.value)}
                    style={{
                      width: '100%', padding: '14px 16px', borderRadius: 12,
                      background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)',
                      color: C.white, fontSize: 15, outline: 'none', boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.75)', marginBottom: 8, textTransform: 'uppercase' }}>
                    WhatsApp o Teléfono (10 dígitos) *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="Ej. 55 1234 5678"
                    value={couponPhone}
                    onChange={e => setCouponPhone(e.target.value)}
                    style={{
                      width: '100%', padding: '14px 16px', borderRadius: 12,
                      background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)',
                      color: C.white, fontSize: 15, outline: 'none', boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.75)', marginBottom: 8, textTransform: 'uppercase' }}>
                    Vehículo (Marca / Modelo / Año)
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Nissan Versa 2021"
                    value={couponCar}
                    onChange={e => setCouponCar(e.target.value)}
                    style={{
                      width: '100%', padding: '14px 16px', borderRadius: 12,
                      background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)',
                      color: C.white, fontSize: 15, outline: 'none', boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div style={{ gridColumn: '1 / -1', marginTop: 10, textAlign: 'center' }}>
                  <button
                    type="submit"
                    style={{
                      padding: '16px 40px', borderRadius: 9999,
                      background: C.red, color: C.white, border: 'none',
                      fontFamily: F.heading, fontWeight: 800, fontSize: 16,
                      cursor: 'pointer', boxShadow: '0 4px 20px rgba(196,30,36,0.4)',
                      transition: 'all 0.3s ease',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.background = C.redDark; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.background = C.red; }}
                  >
                    🎟️ Obtener mi Cupón de $750 MXN Ahora
                  </button>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 10 }}>
                    Al generar tu cupón, aceptas los términos de la promoción. Sin costo ni compromiso previo.
                  </p>
                </div>
              </form>
            ) : (
              /* Generated Coupon Voucher */
              <div style={{
                background: C.white,
                color: C.charcoal,
                borderRadius: 20,
                padding: '32px',
                border: '2px dashed #C41E24',
                position: 'relative',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${C.border}`, paddingBottom: 18, marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <span style={{ fontSize: 11, fontWeight: 800, color: C.red, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                      CUPÓN OFICIAL VALIDADO
                    </span>
                    <h3 style={{ fontFamily: F.heading, fontWeight: 900, fontSize: 24, color: C.navy, marginTop: 2 }}>
                      Alineación y Balanceo 4 Llantas: $750 MXN
                    </h3>
                  </div>
                  <div style={{
                    padding: '8px 16px', borderRadius: 12, background: 'rgba(196,30,36,0.08)',
                    border: '1px solid rgba(196,30,36,0.2)', textAlign: 'right',
                  }}>
                    <div style={{ fontSize: 11, color: C.gray, fontWeight: 600 }}>CÓDIGO DE FOLIO</div>
                    <div style={{ fontFamily: F.heading, fontWeight: 900, fontSize: 18, color: C.red, letterSpacing: '0.05em' }}>
                      {generatedCoupon.code}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
                  <div>
                    <div style={{ fontSize: 12, color: C.gray, fontWeight: 600 }}>TITULAR:</div>
                    <div style={{ fontWeight: 700, color: C.navy, fontSize: 15 }}>{generatedCoupon.name}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: C.gray, fontWeight: 600 }}>TELÉFONO:</div>
                    <div style={{ fontWeight: 700, color: C.navy, fontSize: 15 }}>{generatedCoupon.phone}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: C.gray, fontWeight: 600 }}>VEHÍCULO:</div>
                    <div style={{ fontWeight: 700, color: C.navy, fontSize: 15 }}>{generatedCoupon.car}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: C.gray, fontWeight: 600 }}>SUCURSAL PREFERIDA:</div>
                    <div style={{ fontWeight: 700, color: C.navy, fontSize: 15 }}>{generatedCoupon.branch}</div>
                  </div>
                </div>

                {/* Actions for Coupon */}
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                  <a
                    href={`https://api.whatsapp.com/send/?phone=52${generatedCoupon.phone.replace(/\D/g, '')}&text=${encodeURIComponent(`¡Hola ${generatedCoupon.name}! Tu cupón de promoción Jasman es: ${generatedCoupon.code} para Alineación y Balanceo en 4 llantas por $750 MXN en ${generatedCoupon.branch}. Preséntalo en sucursal.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: '12px 22px', borderRadius: 12, background: '#25D366', color: C.white,
                      fontFamily: F.heading, fontWeight: 700, fontSize: 14, textDecoration: 'none',
                      display: 'inline-flex', alignItems: 'center', gap: 8,
                    }}
                  >
                    <MessageCircle size={18} /> Enviar cupón a mi WhatsApp
                  </a>

                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(generatedCoupon.code);
                      setCopiedCoupon(true);
                      setTimeout(() => setCopiedCoupon(false), 2000);
                    }}
                    style={{
                      padding: '12px 20px', borderRadius: 12, background: C.light, color: C.navy,
                      border: `1px solid ${C.border}`, fontFamily: F.heading, fontWeight: 600, fontSize: 14,
                      cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6,
                    }}
                  >
                    {copiedCoupon ? <Check size={16} color="#059669" /> : <Copy size={16} />}
                    {copiedCoupon ? '¡Código Copiado!' : 'Copiar Código'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setGeneratedCoupon(null)}
                    style={{
                      background: 'none', border: 'none', color: C.gray, fontSize: 13,
                      cursor: 'pointer', textDecoration: 'underline', marginLeft: 'auto',
                    }}
                  >
                    Generar otro cupón
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </section>

      {/* ═══════ 5. TRUST & VALUE PROPOSITIONS ═══════ */}
      <section style={{ padding: '70px 20px', background: C.white }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 32, textAlign: 'center' }}>
            <div>
              <div style={{
                width: 64, height: 64, borderRadius: 20, background: 'rgba(196,30,36,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px',
                color: C.red,
              }}>
                <Trophy size={30} />
              </div>
              <h3 style={{ fontFamily: F.heading, fontWeight: 800, fontSize: 18, color: C.navy, marginBottom: 8 }}>
                Llantas de las mejores marcas
              </h3>
              <p style={{ fontSize: 14, color: C.gray, lineHeight: 1.55 }}>
                Distribuidores autorizados de Michelin, Bridgestone, Goodyear, Continental, Pirelli y más.
              </p>
            </div>

            <div>
              <div style={{
                width: 64, height: 64, borderRadius: 20, background: 'rgba(196,30,36,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px',
                color: C.red,
              }}>
                <MapPin size={30} />
              </div>
              <h3 style={{ fontFamily: F.heading, fontWeight: 800, fontSize: 18, color: C.navy, marginBottom: 8 }}>
                Más de 50 sucursales en México
              </h3>
              <p style={{ fontSize: 14, color: C.gray, lineHeight: 1.55 }}>
                Centros de servicio automotriz de primer nivel en CDMX, Edomex, Querétaro, Bajío y Norte del país.
              </p>
            </div>

            <div>
              <div style={{
                width: 64, height: 64, borderRadius: 20, background: 'rgba(196,30,36,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px',
                color: C.red,
              }}>
                <ShieldCheck size={30} />
              </div>
              <h3 style={{ fontFamily: F.heading, fontWeight: 800, fontSize: 18, color: C.navy, marginBottom: 8 }}>
                Servicio confiable y garantizado
              </h3>
              <p style={{ fontSize: 14, color: C.gray, lineHeight: 1.55 }}>
                Tecnología computarizada de alineación y balanceo con garantía por escrito en cada trabajo.
              </p>
            </div>

            <div>
              <div style={{
                width: 64, height: 64, borderRadius: 20, background: 'rgba(196,30,36,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px',
                color: C.red,
              }}>
                <Wrench size={30} />
              </div>
              <h3 style={{ fontFamily: F.heading, fontWeight: 800, fontSize: 18, color: C.navy, marginBottom: 8 }}>
                Expertos en el cuidado de tu auto
              </h3>
              <p style={{ fontSize: 14, color: C.gray, lineHeight: 1.55 }}>
                Más de 60 años de experiencia brindando soluciones automotrices honestas y profesionales.
              </p>
            </div>
          </div>

          {/* Institutional paragraph */}
          <div style={{
            marginTop: 48, padding: '24px 32px', borderRadius: 16,
            background: C.light, border: `1px solid ${C.border}`, textAlign: 'center',
            maxWidth: 900, margin: '48px auto 0',
          }}>
            <p style={{ fontSize: 14, color: C.gray, lineHeight: 1.7, margin: 0 }}>
              <strong>Jasman Automotriz en México</strong> ofrece mecánica en general, diagnóstico en fallas,
              cambio de aceite, amortiguadores, instalación y venta de llantas, frenos, clutch, afinación mayor,
              suspensión y baterías. Servicio automotriz profesional para mantener tu auto seguro y en óptimas condiciones.
            </p>
          </div>

        </div>
      </section>

      {/* ═══════ 6. FAQ ACCORDION ═══════ */}
      <section style={{ padding: '70px 20px', background: '#F8F9FA', borderTop: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 840, margin: '0 auto' }}>

          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <span style={{ color: C.red, fontFamily: F.heading, fontWeight: 700, fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              RESOLVEMOS TUS DUDAS
            </span>
            <h2 style={{ fontFamily: F.heading, fontWeight: 900, fontSize: 'clamp(1.8rem, 3.5vw, 2.3rem)', color: C.navy, marginTop: 8 }}>
              Preguntas Frecuentes
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {faqItems.map((item, idx) => (
              <div
                key={idx}
                style={{
                  background: C.white, borderRadius: 16,
                  border: `1px solid ${openFaq === idx ? C.red : C.border}`,
                  overflow: 'hidden', transition: 'all 0.3s',
                }}
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? -1 : idx)}
                  style={{
                    width: '100%', padding: '18px 24px', background: 'none', border: 'none',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    fontFamily: F.heading, fontWeight: 700, fontSize: 16, color: C.navy,
                    textAlign: 'left', cursor: 'pointer',
                  }}
                >
                  <span>{item.q}</span>
                  <ChevronDown
                    size={20}
                    color={openFaq === idx ? C.red : C.gray}
                    style={{
                      transform: openFaq === idx ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.3s', flexShrink: 0, marginLeft: 12,
                    }}
                  />
                </button>
                {openFaq === idx && (
                  <div style={{ padding: '0 24px 20px', fontSize: 14, color: C.gray, lineHeight: 1.65 }}>
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Legal restrictions footer note from original banner */}
          <div style={{ marginTop: 40, padding: '18px 22px', borderRadius: 12, background: C.white, border: `1px solid ${C.border}`, fontSize: 11, color: C.gray, lineHeight: 1.6 }}>
            <strong>Términos y condiciones de la promoción:</strong> *Promoción válida hasta el 15 de noviembre del 2026.
            El cliente recibirá el precio promocional desde $750.00 MXN en el paquete de alineación y balanceo (sobre precios de lista)
            únicamente aplicando en vehículos de Rin 13" al Rin 17". Válido pagando en una sola exhibición con transferencia bancaria,
            efectivo, tarjeta de débito y crédito en una sola exhibición. Promoción válida en sucursales participantes de Jasman Automotriz.
            Aplican restricciones según condiciones mecánicas de la suspensión del vehículo.
          </div>

        </div>
      </section>

    </div>
  );
}
