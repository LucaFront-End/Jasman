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
  Copy, Check, Share2, Compass, Car, ChevronDown, Calendar, Building2
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
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    } else if (center) {
      map.setView(center, zoom, { animate: true });
    }
  }, [center, zoom, bounds, map]);
  return null;
}

// Popular sample postal codes across Jasman territories for quick selection
const popularPostalCodes = [
  { cp: '02710', label: 'Azcapotzalco (02710)' },
  { cp: '03100', label: 'Del Valle / Benito Juárez (03100)' },
  { cp: '01330', label: 'Santa Fe (01330)' },
  { cp: '06720', label: 'Roma / Cuauhtémoc (06720)' },
  { cp: '53120', label: 'Naucalpan (53120)' },
  { cp: '54060', label: 'Tlalnepantla (54060)' },
  { cp: '50010', label: 'Toluca (50010)' },
  { cp: '76000', label: 'Querétaro (76000)' },
  { cp: '44160', label: 'Guadalajara (44160)' },
  { cp: '37220', label: 'León (37220)' },
  { cp: '36500', label: 'Irapuato (36500)' },
  { cp: '64800', label: 'Monterrey (64800)' },
  { cp: '58270', label: 'Morelia (58270)' },
  { cp: '62740', label: 'Cuautla (62740)' },
  { cp: '42080', label: 'Pachuca (42080)' },
  { cp: '88000', label: 'Nuevo Laredo (88000)' },
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

  // Appointment Booking State ("Agenda tu servicio desde $750")
  const [bookingName, setBookingName] = useState('');
  const [bookingPhone, setBookingPhone] = useState('');
  const [bookingCar, setBookingCar] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [bookingBranchId, setBookingBranchId] = useState('');
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [copiedFolio, setCopiedFolio] = useState(false);

  // FAQ Accordion
  const [openFaq, setOpenFaq] = useState(0);

  // References
  const searchSectionRef = useRef(null);
  const bookingSectionRef = useRef(null);

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
          setBookingBranchId(closest[0]?.id || '');
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

  // Sync booking branch id when selected branch changes
  useEffect(() => {
    if (selectedBranch && !bookingBranchId) {
      setBookingBranchId(selectedBranch.id);
    }
  }, [selectedBranch, bookingBranchId]);

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
      if (closest[0]) setBookingBranchId(closest[0].id);
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
        if (closest[0]) setBookingBranchId(closest[0].id);
        setGeoLoading(false);
        setGeoError(null);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setGeoLoading(false);
        if (err.code === 1 /* PERMISSION_DENIED */) {
          setGeoError('Permiso de ubicación denegado en tu navegador. Puedes ingresar tu código postal abajo o activar la ubicación en los ajustes de tu navegador.');
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

  // Build WhatsApp URL with "SW-" standard prefix and landing promo details
  const getWhatsAppPromoUrl = (branch, bookingDetails = null) => {
    const defaultPhone = '5215579337994';
    const targetBranch = branch || selectedBranch || nearbyBranches[0];
    const cleanPhone = targetBranch?.phone ? targetBranch.phone.replace(/[\s\-()]/g, '') : '';
    const phoneWithCountry = cleanPhone ? (cleanPhone.startsWith('52') ? cleanPhone : `52${cleanPhone}`) : defaultPhone;
    const branchName = targetBranch ? targetBranch.fullName : 'Jasman Automotriz';

    let text = '';
    if (bookingDetails) {
      text = `SW- Hola, deseo confirmar mi visita para la promoción Alineación y Balanceo (desde $750 MXN) en sucursal "${branchName}". Folio: ${bookingDetails.folio}. Nombre: ${bookingDetails.nombre}, Teléfono: ${bookingDetails.telefono}, Vehículo: ${bookingDetails.vehiculo}, Fecha tentativa: ${bookingDetails.fechaVisita}.`;
    } else {
      text = `SW- Hola, quisiera agendar el servicio de la promoción Alineación y Balanceo en 4 llantas (desde $750 MXN) en sucursal "${branchName}".`;
    }

    return `https://api.whatsapp.com/send/?phone=${phoneWithCountry}&text=${encodeURIComponent(text)}`;
  };

  // Submit Appointment Form & save to CMS collection
  const handleBookVisit = (e) => {
    e.preventDefault();
    if (!bookingName.trim() || !bookingPhone.trim()) return;

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const folio = `SW-ALIN-${randomSuffix}`;
    const targetBranch = sucursalesWithCoords.find(s => s.id === bookingBranchId) || primaryBranch;

    const newBooking = {
      id: `CITA-${Date.now()}`,
      folio,
      nombre: bookingName.trim(),
      telefono: bookingPhone.trim(),
      vehiculo: bookingCar.trim() || 'No especificado',
      fechaVisita: bookingDate || 'Lo antes posible',
      sucursalId: targetBranch?.id || '',
      sucursalNombre: targetBranch?.fullName || 'Jasman Automotriz',
      sucursalTelefono: targetBranch?.phone || '',
      sucursalDireccion: targetBranch?.address || '',
      servicio: 'Alineación y Balanceo en 4 llantas',
      precio: 'Desde $750.00 MXN (Rin 13" al 17")',
      fechaRegistro: new Date().toISOString(),
      estatus: 'Pendiente de confirmación',
    };

    // Save to CMS collection in localStorage
    try {
      const existing = JSON.parse(localStorage.getItem('jasman_cms_visitas') || '[]');
      existing.unshift(newBooking);
      localStorage.setItem('jasman_cms_visitas', JSON.stringify(existing));
      console.log('[CMS Jasman] Cita registrada con éxito en CMS junto con sucursal:', newBooking);
    } catch (err) {
      console.error('Error guardando en CMS local:', err);
    }

    setConfirmedBooking(newBooking);
  };

  const primaryBranch = selectedBranch || nearbyBranches[0];

  // Map Bounds to encompass user and closest branch
  const mapBounds = primaryBranch && currentLocation ? [
    [currentLocation.lat, currentLocation.lng],
    [primaryBranch.lat, primaryBranch.lng]
  ] : null;

  const faqItems = [
    {
      q: '¿Qué incluye el servicio de Alineación y Balanceo desde $750.00 MXN?',
      a: 'Incluye la alineación computarizada 3D de alta precisión en las 4 llantas, el balanceo dinámico y estático de las 4 ruedas para rines desde 13" hasta 17", inspección visual de seguridad de 25 puntos en suspensión y frenos, y calibración de presión de inflado.'
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
      a: 'Puedes llegar directamente a cualquiera de nuestras sucursales y serás atendido por orden de llegada, o bien agendar tu visita en línea o por WhatsApp para asegurar un lugar prioritario en rampa y reducir tu tiempo de espera.'
    },
    {
      q: '¿Cuáles son las formas de pago aceptadas?',
      a: 'Aceptamos pago en efectivo, tarjeta de débito, tarjeta de crédito en una sola exhibición y transferencia bancaria directa en mostrador. Todos nuestros precios ya incluyen IVA.'
    }
  ];

  return (
    <div className="landing-root" style={{ background: '#F8F9FA', color: C.charcoal, minHeight: '100vh', width: '100%', overflowX: 'hidden' }}>

      {/* ═══════ 1. PROMOTIONAL HERO BANNER ═══════ */}
      <section style={{
        background: '#0B0D17',
        padding: '100px 16px 36px',
        position: 'relative',
        overflow: 'hidden',
        width: '100%',
        boxSizing: 'border-box',
      }}>
        {/* Glow ambient background element contained */}
        <div style={{
          position: 'absolute', top: '-10%', left: '50%', transform: 'translateX(-50%)',
          width: '100%', maxWidth: '750px', height: '260px',
          background: 'radial-gradient(ellipse at center, rgba(196,30,36,0.22) 0%, rgba(11,13,23,0) 70%)',
          pointerEvents: 'none', zIndex: 0,
        }} />

        <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 1, width: '100%' }}>

          {/* Promotional Tag */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 18 }}>
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
            borderRadius: 20,
            overflow: 'hidden',
            boxShadow: '0 16px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.08)',
            position: 'relative',
            background: '#1A1F36',
            width: '100%',
          }}>
            <img
              src="/images/promo-landing-banner.jpg"
              alt="Promoción Alineación y Balanceo Jasman Automotriz en las 4 llantas desde $750 MXN"
              style={{
                width: '100%',
                height: 'auto',
                display: 'block',
                maxHeight: '500px',
                objectFit: 'cover',
                objectPosition: 'center',
              }}
            />
          </div>

          {/* Quick CTA Action Bar Below Banner */}
          <div className="landing-hero-bar" style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            background: 'rgba(26,31,54,0.92)',
            backdropFilter: 'blur(16px)',
            borderRadius: 20,
            padding: '20px 24px',
            marginTop: 18,
            border: '1px solid rgba(255,255,255,0.1)',
            width: '100%',
            boxSizing: 'border-box',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 46, height: 46, borderRadius: 14,
                background: C.red, display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: C.white, flexShrink: 0, boxShadow: '0 4px 16px rgba(196,30,36,0.4)',
              }}>
                <Wrench size={22} />
              </div>
              <div>
                <div style={{ fontFamily: F.heading, fontWeight: 800, fontSize: 17, color: C.white }}>
                  Alineación y Balanceo en las 4 Llantas
                </div>
                <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, marginTop: 2 }}>
                  Desde <span style={{ color: '#FFD700', fontWeight: 700, fontSize: 15 }}>$750.00 MXN</span> (IVA Incluido) · Rin 13" al 17"
                </div>
              </div>
            </div>

            {/* Hero Action Buttons */}
            <div className="landing-hero-actions" style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => searchSectionRef.current?.scrollIntoView({ behavior: 'smooth' })}
                style={{
                  padding: '12px 22px', borderRadius: 9999,
                  background: C.red, color: C.white, border: 'none',
                  fontFamily: F.heading, fontWeight: 700, fontSize: 14,
                  cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8,
                  boxShadow: '0 4px 16px rgba(196,30,36,0.35)',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.background = C.redDark; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.background = C.red; }}
              >
                <MapPin size={16} /> Buscar mi Sucursal
              </button>

              <button
                type="button"
                onClick={() => bookingSectionRef.current?.scrollIntoView({ behavior: 'smooth' })}
                style={{
                  padding: '12px 22px', borderRadius: 9999,
                  background: 'rgba(255,255,255,0.08)', color: C.white,
                  border: '1px solid rgba(255,255,255,0.25)',
                  fontFamily: F.heading, fontWeight: 600, fontSize: 14,
                  cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8,
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.18)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
              >
                <Calendar size={16} color="#FFD700" /> Agendar Visita
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* ═══════ 2. SEARCH & BRANCH FINDER (EL REPETIDOR) ═══════ */}
      <section ref={searchSectionRef} className="landing-section-padding" style={{ padding: '60px 16px', maxWidth: 1200, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>

        {/* Section Header */}
        <div style={{ textAlign: 'center', maxWidth: 760, margin: '0 auto 36px', width: '100%' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            color: C.red, fontFamily: F.heading, fontWeight: 700, fontSize: 13,
            letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12,
          }}>
            <Compass size={16} /> TU TALLER MÁS CERCA
          </span>
          <h1 style={{
            fontFamily: F.heading, fontWeight: 900,
            fontSize: 'clamp(1.9rem, 4vw, 2.7rem)', color: C.navy,
            lineHeight: 1.15, marginBottom: 14,
          }}>
            Encuentra tu sucursal Jasman
          </h1>
          <p style={{ fontSize: 15, color: C.gray, lineHeight: 1.6, maxWidth: 640, margin: '0 auto' }}>
            Ingresa tu código postal y te mostramos la sucursal más cercana con su ubicación exacta,
            distancia en tiempo real y datos de contacto directo.
          </p>

          {/* 3 Trust Pills */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap', marginTop: 20 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '5px 14px', borderRadius: 9999, background: C.white,
              border: `1px solid ${C.border}`, fontSize: 12, fontWeight: 600, color: C.navy,
            }}>
              <MapPin size={13} color={C.red} /> Más de 50 sucursales
            </span>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '5px 14px', borderRadius: 9999, background: C.white,
              border: `1px solid ${C.border}`, fontSize: 12, fontWeight: 600, color: C.navy,
            }}>
              <Wrench size={13} color={C.red} /> Servicio especializado
            </span>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '5px 14px', borderRadius: 9999, background: C.white,
              border: `1px solid ${C.border}`, fontSize: 12, fontWeight: 600, color: C.navy,
            }}>
              <ShieldCheck size={13} color={C.red} /> Confianza en todo México
            </span>
          </div>
        </div>

        {/* Search Controls Card */}
        <div className="landing-card-padding" style={{
          background: C.white,
          borderRadius: 22,
          padding: '24px 28px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
          border: `1px solid ${C.border}`,
          marginBottom: 36,
          width: '100%',
          boxSizing: 'border-box',
        }}>
          <form
            onSubmit={(e) => { e.preventDefault(); executeSearch(postalCode); }}
            className="landing-search-form"
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 14,
              alignItems: 'center',
              width: '100%',
            }}
          >
            {/* Input with Label */}
            <div style={{ flex: '1 1 260px', position: 'relative', width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, flexWrap: 'wrap', gap: 4 }}>
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
                    padding: '13px 16px 13px 44px',
                    borderRadius: 14,
                    border: `2px solid ${C.border}`,
                    fontSize: 15,
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
            <div className="landing-search-buttons" style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignSelf: 'flex-end' }}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '13px 24px',
                  borderRadius: 14,
                  background: C.red,
                  color: C.white,
                  border: 'none',
                  fontFamily: F.heading,
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: loading ? 'wait' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  boxShadow: '0 4px 14px rgba(196,30,36,0.3)',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={e => !loading && (e.currentTarget.style.background = C.redDark)}
                onMouseLeave={e => !loading && (e.currentTarget.style.background = C.red)}
              >
                <Search size={16} /> {loading ? 'Buscando...' : 'Buscar sucursal'}
              </button>

              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={geoLoading}
                style={{
                  padding: '13px 20px',
                  borderRadius: 14,
                  background: currentLocation.isGps ? '#EFF6FF' : 'rgba(37,99,235,0.08)',
                  color: '#1D4ED8',
                  border: `1px solid ${currentLocation.isGps ? '#93C5FD' : 'rgba(37,99,235,0.2)'}`,
                  fontFamily: F.heading,
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: geoLoading ? 'wait' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={e => !geoLoading && (e.currentTarget.style.background = 'rgba(37,99,235,0.15)')}
                onMouseLeave={e => !geoLoading && (e.currentTarget.style.background = currentLocation.isGps ? '#EFF6FF' : 'rgba(37,99,235,0.08)')}
              >
                <Navigation size={16} /> {geoLoading ? 'Detectando GPS...' : (currentLocation.isGps ? 'Actualizar mi GPS' : 'Usar mi ubicación actual')}
              </button>
            </div>
          </form>

          {/* Quick Postal Code Chips */}
          <div style={{ marginTop: 18, paddingTop: 16, borderTop: `1px solid ${C.border}` }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: C.gray, marginRight: 8 }}>
              C.P. frecuentes:
            </span>
            <div style={{ display: 'inline-flex', flexWrap: 'wrap', gap: 6, verticalAlign: 'middle', marginTop: 4 }}>
              {popularPostalCodes.map(item => (
                <button
                  key={item.cp}
                  type="button"
                  onClick={() => { setPostalCode(item.cp); executeSearch(item.cp); }}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 9999,
                    fontSize: 12,
                    fontWeight: 600,
                    border: `1px solid ${postalCode === item.cp && !currentLocation.isGps ? C.red : C.border}`,
                    background: postalCode === item.cp && !currentLocation.isGps ? 'rgba(196,30,36,0.08)' : C.light,
                    color: postalCode === item.cp && !currentLocation.isGps ? C.red : C.charcoal,
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
              marginTop: 14, padding: '12px 16px', borderRadius: 12,
              background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B',
              fontSize: 13, display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <AlertCircle size={18} flexShrink={0} />
              <span>{geoError}</span>
            </div>
          )}
        </div>

        {/* ═══════ RESULTS REPEATER: Closest Branch + Interactive Map ═══════ */}
        {primaryBranch && (
          <div className="landing-repeater-grid">

            {/* Left Column: Closest Branch Card ("EL REPETIDOR") */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18, width: '100%', minWidth: 0 }}>

              {/* Main Closest Branch Hero Card */}
              <div className="landing-card-padding" style={{
                background: C.white,
                borderRadius: 22,
                padding: '28px 24px',
                border: '2px solid #C41E24',
                boxShadow: '0 12px 35px rgba(196,30,36,0.1)',
                position: 'relative',
                width: '100%',
                boxSizing: 'border-box',
              }}>
                {/* Header Badges */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '5px 12px', borderRadius: 9999,
                    background: '#C41E24', color: C.white,
                    fontFamily: F.heading, fontWeight: 800, fontSize: 11,
                    letterSpacing: '0.05em', textTransform: 'uppercase',
                  }}>
                    <Sparkles size={12} /> TU SUCURSAL MÁS CERCANA
                  </span>

                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    padding: '5px 12px', borderRadius: 9999,
                    background: 'rgba(196,30,36,0.08)', color: C.red,
                    fontFamily: F.heading, fontWeight: 800, fontSize: 13,
                  }}>
                    <Car size={15} /> A solo {primaryBranch.distanceFormatted}
                  </span>
                </div>

                {/* Branch Name */}
                <h2 style={{
                  fontFamily: F.heading, fontWeight: 800, fontSize: 22, color: C.navy,
                  lineHeight: 1.25, marginBottom: 14,
                }}>
                  {primaryBranch.fullName}
                </h2>

                {/* Reference to searched location */}
                <div style={{
                  fontSize: 13, color: C.gray, marginBottom: 18,
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '8px 12px', background: C.light, borderRadius: 10,
                }}>
                  <Navigation size={14} color="#2563EB" flexShrink={0} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    Calculado desde: <strong>{currentLocation.name}</strong>
                  </span>
                </div>

                {/* Details List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 22 }}>
                  {/* Address */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 12, background: 'rgba(196,30,36,0.06)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.red, flexShrink: 0,
                    }}>
                      <MapPin size={17} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: C.gray, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Dirección completa
                      </div>
                      <div style={{ fontSize: 14, color: C.navy, lineHeight: 1.45, marginTop: 2, wordBreak: 'break-word' }}>
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
                      width: 36, height: 36, borderRadius: 12, background: 'rgba(196,30,36,0.06)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.red, flexShrink: 0,
                    }}>
                      <Clock size={17} />
                    </div>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: C.gray, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Horario de atención
                      </div>
                      <div style={{ fontSize: 13, color: C.navy, lineHeight: 1.45, marginTop: 2 }}>
                        <strong>Lunes a Sábado:</strong> 8:00 a.m. - 7:00 p.m.<br />
                        <strong>Domingo:</strong> 9:00 a.m. - 3:00 p.m.
                      </div>
                    </div>
                  </div>

                  {/* Phone */}
                  {primaryBranch.phone && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: 12, background: 'rgba(196,30,36,0.06)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.red, flexShrink: 0,
                      }}>
                        <Phone size={17} />
                      </div>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: C.gray, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Teléfono directo
                        </div>
                        <a
                          href={`tel:${primaryBranch.phone.replace(/\s/g, '')}`}
                          style={{
                            fontSize: 15, fontFamily: F.heading, fontWeight: 700, color: C.navy,
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
                  {/* WhatsApp CTA (starts with SW - and pulls branch name) */}
                  <a
                    href={getWhatsAppPromoUrl(primaryBranch)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: '13px 18px',
                      borderRadius: 14,
                      background: '#25D366',
                      color: C.white,
                      fontFamily: F.heading,
                      fontWeight: 700,
                      fontSize: 14,
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      boxShadow: '0 4px 16px rgba(37,211,102,0.3)',
                      transition: 'all 0.3s ease',
                      textAlign: 'center',
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <MessageCircle size={18} flexShrink={0} /> Agendar Promoción por WhatsApp
                  </a>

                  {/* Google Maps Directions */}
                  <a
                    href={primaryBranch.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: '11px 18px',
                      borderRadius: 14,
                      background: C.white,
                      border: `1px solid ${C.border}`,
                      color: C.navy,
                      fontFamily: F.heading,
                      fontWeight: 600,
                      fontSize: 13,
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
                    <Navigation size={15} color={C.red} flexShrink={0} /> Cómo llegar / Ver en Google Maps
                  </a>
                </div>

              </div>

              {/* Other nearby branches (2nd, 3rd, 4th) */}
              {nearbyBranches.length > 1 && (
                <div style={{
                  background: C.white, borderRadius: 20, padding: '20px 18px',
                  border: `1px solid ${C.border}`, boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                  width: '100%', boxSizing: 'border-box',
                }}>
                  <h3 style={{ fontFamily: F.heading, fontWeight: 700, fontSize: 15, color: C.navy, marginBottom: 12 }}>
                    Otras sucursales Jasman cercanas:
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {nearbyBranches.slice(1).map((branch) => (
                      <div
                        key={branch.id}
                        onClick={() => {
                          setSelectedBranch(branch);
                          setBookingBranchId(branch.id);
                        }}
                        style={{
                          padding: '12px 14px',
                          borderRadius: 12,
                          background: selectedBranch?.id === branch.id ? 'rgba(196,30,36,0.06)' : C.light,
                          border: `1px solid ${selectedBranch?.id === branch.id ? C.red : C.border}`,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 10,
                          transition: 'all 0.2s',
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontFamily: F.heading, fontWeight: 700, fontSize: 13, color: C.navy, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            Suc. {branch.name}
                          </div>
                          <div style={{ fontSize: 12, color: C.gray, marginTop: 2 }}>
                            {branch.city}, {branch.state}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <span style={{
                            fontSize: 12, fontWeight: 800, color: C.red,
                            fontFamily: F.heading, background: C.white,
                            padding: '3px 8px', borderRadius: 9999, border: `1px solid ${C.border}`,
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
            <div className="landing-map-wrapper" style={{
              background: C.white,
              borderRadius: 22,
              overflow: 'hidden',
              boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
              border: `1px solid ${C.border}`,
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              minWidth: 0,
              boxSizing: 'border-box',
            }}>
              {/* Map Top Bar */}
              <div style={{
                padding: '12px 16px',
                background: C.navy,
                color: C.white,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                zIndex: 10,
                flexWrap: 'wrap',
                gap: 6,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600 }}>
                  <MapPin size={15} color={C.redLight} flexShrink={0} /> Mapa de Ubicación y Ruta
                </div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)' }}>
                  {primaryBranch.name} ({primaryBranch.distanceFormatted})
                </div>
              </div>

              {/* Leaflet Map Container */}
              <div style={{ flex: 1, position: 'relative', width: '100%' }}>
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
                        <strong style={{ fontFamily: F.heading, color: C.red, fontSize: 13 }}>
                          {primaryBranch.fullName}
                        </strong>
                        <div style={{ fontSize: 11, color: C.charcoal, marginTop: 4, lineHeight: 1.4 }}>
                          {primaryBranch.address}
                        </div>
                        <div style={{ marginTop: 6, fontWeight: 700, color: C.navy, fontSize: 11 }}>
                          Distancia: {primaryBranch.distanceFormatted}
                        </div>
                        <a
                          href={primaryBranch.mapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'inline-block', marginTop: 6, padding: '4px 8px',
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
                        click: () => {
                          setSelectedBranch(branch);
                          setBookingBranchId(branch.id);
                        },
                      }}
                    >
                      <Popup>
                        <div style={{ padding: 4, fontSize: 11 }}>
                          <strong>{branch.fullName}</strong><br />
                          {branch.distanceFormatted} de distancia<br />
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedBranch(branch);
                              setBookingBranchId(branch.id);
                            }}
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
                padding: '8px 14px', background: C.light, borderTop: `1px solid ${C.border}`,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, color: C.gray,
                flexWrap: 'wrap', gap: 4,
              }}>
                <span>🔵 Tu ubicación / C.P.</span>
                <span>🔴 Sucursal Jasman Seleccionada</span>
              </div>
            </div>

          </div>
        )}

      </section>

      {/* ═══════ 3. WHAT'S INCLUDED IN THE $750 MXN PROMOTION ═══════ */}
      <section className="landing-section-padding" style={{ padding: '60px 16px', background: C.white, borderTop: `1px solid ${C.border}`, width: '100%', boxSizing: 'border-box' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%' }}>

          <div style={{ textAlign: 'center', maxWidth: 700, margin: '0 auto 40px' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              color: C.red, fontFamily: F.heading, fontWeight: 700, fontSize: 12,
              letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10,
            }}>
              <CheckCircle size={15} /> SERVICIO PROFESIONAL GARANTIZADO
            </span>
            <h2 style={{ fontFamily: F.heading, fontWeight: 900, fontSize: 'clamp(1.7rem, 3.5vw, 2.4rem)', color: C.navy }}>
              ¿Qué incluye la promoción de Alineación y Balanceo?
            </h2>
            <p style={{ fontSize: 15, color: C.gray, marginTop: 10, maxWidth: 620, margin: '10px auto 0' }}>
              Todo lo que tu automóvil necesita para un manejo suave, seguro y para alargar la vida útil de tus llantas.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
            {[
              {
                title: 'Alineación Computarizada 3D',
                desc: 'Ajuste milimétrico de los ángulos de las 4 ruedas (cámber, cáster y convergencia) según las especificaciones del fabricante.',
                icon: <Compass size={22} color={C.red} />,
              },
              {
                title: 'Balanceo Dinámico en 4 Ruedas',
                desc: 'Compensación precisa del peso de rines y llantas del Rin 13" al Rin 17" para eliminar vibraciones en el volante a cualquier velocidad.',
                icon: <Wrench size={22} color={C.red} />,
              },
              {
                title: 'Revisión de Suspensión y Dirección',
                desc: 'Inspección de amortiguadores, rótulas, bieletas, bujes y terminales de dirección para garantizar estabilidad y seguridad.',
                icon: <ShieldCheck size={22} color={C.red} />,
              },
              {
                title: 'Calibración e Inspección de Llantas',
                desc: 'Revisión de profundidad de dibujo, desgaste simétrico y ajuste de presión con aire o nitrógeno para optimizar el consumo de combustible.',
                icon: <CheckCircle size={22} color={C.red} />,
              },
            ].map((card, idx) => (
              <div
                key={idx}
                style={{
                  background: C.light,
                  borderRadius: 18,
                  padding: '24px 20px',
                  border: `1px solid ${C.border}`,
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 12px 26px rgba(0,0,0,0.05)';
                  e.currentTarget.style.borderColor = 'rgba(196,30,36,0.3)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = C.border;
                }}
              >
                <div style={{
                  width: 46, height: 46, borderRadius: 12, background: C.white,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 16, boxShadow: '0 4px 10px rgba(0,0,0,0.03)',
                }}>
                  {card.icon}
                </div>
                <h3 style={{ fontFamily: F.heading, fontWeight: 800, fontSize: 17, color: C.navy, marginBottom: 8 }}>
                  {card.title}
                </h3>
                <p style={{ fontSize: 13, color: C.gray, lineHeight: 1.55 }}>
                  {card.desc}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ═══════ 4. APPOINTMENT FORM ("AGENDA TU SERVICIO DESDE $750") ═══════ */}
      <section ref={bookingSectionRef} className="landing-section-padding" style={{
        padding: '70px 16px',
        background: `linear-gradient(135deg, ${C.navy} 0%, #0D111E 100%)`,
        color: C.white,
        position: 'relative',
        overflow: 'hidden',
        width: '100%',
        boxSizing: 'border-box',
      }}>
        <div style={{ maxWidth: 960, margin: '0 auto', position: 'relative', zIndex: 1, width: '100%' }}>

          <div style={{ textAlign: 'center', maxWidth: 660, margin: '0 auto 36px', width: '100%' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '5px 14px', borderRadius: 9999,
              background: 'rgba(255,215,0,0.15)', color: '#FFD700',
              fontFamily: F.heading, fontWeight: 700, fontSize: 12, letterSpacing: '0.08em',
              textTransform: 'uppercase', marginBottom: 14, border: '1px solid rgba(255,215,0,0.3)',
            }}>
              <Calendar size={14} /> AGENDAR VISITA EN LÍNEA
            </span>
            <h2 style={{ fontFamily: F.heading, fontWeight: 900, fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', color: C.white, lineHeight: 1.15 }}>
              Agenda tu servicio (desde $750 MXN)
            </h2>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.75)', marginTop: 10 }}>
              Aparta tu lugar para el servicio de Alineación y Balanceo en las 4 llantas. Guardaremos tus datos en el sistema junto con la sucursal seleccionada para recibirte con prioridad.
            </p>
          </div>

          <div className="landing-card-padding" style={{
            background: 'rgba(255,255,255,0.04)',
            backdropFilter: 'blur(20px)',
            borderRadius: 22,
            border: '1px solid rgba(255,255,255,0.12)',
            padding: '32px 28px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
            width: '100%',
            boxSizing: 'border-box',
          }}>
            {!confirmedBooking ? (
              <form onSubmit={handleBookVisit} style={{ width: '100%' }}>
                <div className="landing-form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 18, marginBottom: 20 }}>
                  
                  {/* Nombre */}
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.85)', marginBottom: 8, textTransform: 'uppercase' }}>
                      Tu nombre completo *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Carlos Mendoza"
                      value={bookingName}
                      onChange={e => setBookingName(e.target.value)}
                      style={{
                        width: '100%', padding: '13px 14px', borderRadius: 12,
                        background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)',
                        color: C.white, fontSize: 14, outline: 'none', boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  {/* Teléfono */}
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.85)', marginBottom: 8, textTransform: 'uppercase' }}>
                      WhatsApp o Teléfono (10 dígitos) *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="Ej. 55 1234 5678"
                      value={bookingPhone}
                      onChange={e => setBookingPhone(e.target.value)}
                      style={{
                        width: '100%', padding: '13px 14px', borderRadius: 12,
                        background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)',
                        color: C.white, fontSize: 14, outline: 'none', boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  {/* Vehículo */}
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.85)', marginBottom: 8, textTransform: 'uppercase' }}>
                      Vehículo (Marca / Modelo / Año) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Nissan Versa 2021"
                      value={bookingCar}
                      onChange={e => setBookingCar(e.target.value)}
                      style={{
                        width: '100%', padding: '13px 14px', borderRadius: 12,
                        background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)',
                        color: C.white, fontSize: 14, outline: 'none', boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  {/* Sucursal vinculada al CMS */}
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.85)', marginBottom: 8, textTransform: 'uppercase' }}>
                      Sucursal Jasman seleccionada *
                    </label>
                    <div style={{ position: 'relative' }}>
                      <select
                        value={bookingBranchId}
                        onChange={e => setBookingBranchId(e.target.value)}
                        style={{
                          width: '100%', maxWidth: '100%', padding: '13px 36px 13px 14px', borderRadius: 12,
                          background: '#1F2438', border: '1px solid rgba(255,255,255,0.25)',
                          color: C.white, fontSize: 13, outline: 'none', cursor: 'pointer',
                          boxSizing: 'border-box', appearance: 'none', textOverflow: 'ellipsis',
                        }}
                      >
                        {sucursalesWithCoords.map(branch => (
                          <option key={branch.id} value={branch.id} style={{ background: '#1A1F36', color: C.white }}>
                            {branch.fullName} ({branch.city}, {branch.state})
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={16} color="rgba(255,255,255,0.7)" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                    </div>
                  </div>

                  {/* Fecha tentativa */}
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.85)', marginBottom: 8, textTransform: 'uppercase' }}>
                      Día o fecha tentativa de visita
                    </label>
                    <input
                      type="date"
                      value={bookingDate}
                      onChange={e => setBookingDate(e.target.value)}
                      style={{
                        width: '100%', padding: '12px 14px', borderRadius: 12,
                        background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)',
                        color: C.white, fontSize: 13, outline: 'none', boxSizing: 'border-box',
                      }}
                    />
                  </div>

                </div>

                {/* Submit button */}
                <div style={{ textAlign: 'center', marginTop: 16 }}>
                  <button
                    type="submit"
                    style={{
                      padding: '15px 36px', borderRadius: 9999,
                      background: C.red, color: C.white, border: 'none',
                      fontFamily: F.heading, fontWeight: 800, fontSize: 15,
                      cursor: 'pointer', boxShadow: '0 4px 18px rgba(196,30,36,0.4)',
                      transition: 'all 0.3s ease', display: 'inline-flex', alignItems: 'center', gap: 8,
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.background = C.redDark; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.background = C.red; }}
                  >
                    <Calendar size={18} /> Agendar mi visita
                  </button>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 10 }}>
                    Tus datos se guardan en el sistema junto con la sucursal seleccionada para tu cita.
                  </p>
                </div>
              </form>
            ) : (
              /* Booking Confirmed State */
              <div style={{
                background: C.white,
                color: C.charcoal,
                borderRadius: 20,
                padding: '28px 24px',
                border: '2px solid #C41E24',
                position: 'relative',
                width: '100%',
                boxSizing: 'border-box',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${C.border}`, paddingBottom: 16, marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
                  <div>
                    <span style={{ fontSize: 11, fontWeight: 800, color: '#059669', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <CheckCircle size={14} color="#059669" /> VISITA REGISTRADA EN EL SISTEMA
                    </span>
                    <h3 style={{ fontFamily: F.heading, fontWeight: 900, fontSize: 22, color: C.navy, marginTop: 4 }}>
                      Alineación y Balanceo desde $750 MXN
                    </h3>
                  </div>
                  <div style={{
                    padding: '8px 14px', borderRadius: 12, background: 'rgba(196,30,36,0.08)',
                    border: '1px solid rgba(196,30,36,0.2)', textAlign: 'right',
                  }}>
                    <div style={{ fontSize: 10, color: C.gray, fontWeight: 600 }}>FOLIO DE RESERVA</div>
                    <div style={{ fontFamily: F.heading, fontWeight: 900, fontSize: 17, color: C.red, letterSpacing: '0.05em' }}>
                      {confirmedBooking.folio}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 22 }}>
                  <div>
                    <div style={{ fontSize: 11, color: C.gray, fontWeight: 600 }}>TITULAR:</div>
                    <div style={{ fontWeight: 700, color: C.navy, fontSize: 14 }}>{confirmedBooking.nombre}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: C.gray, fontWeight: 600 }}>TELÉFONO:</div>
                    <div style={{ fontWeight: 700, color: C.navy, fontSize: 14 }}>{confirmedBooking.telefono}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: C.gray, fontWeight: 600 }}>VEHÍCULO:</div>
                    <div style={{ fontWeight: 700, color: C.navy, fontSize: 14 }}>{confirmedBooking.vehiculo}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: C.gray, fontWeight: 600 }}>SUCURSAL:</div>
                    <div style={{ fontWeight: 700, color: C.navy, fontSize: 14 }}>{confirmedBooking.sucursalNombre}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: C.gray, fontWeight: 600 }}>FECHA PREFERIDA:</div>
                    <div style={{ fontWeight: 700, color: C.navy, fontSize: 14 }}>{confirmedBooking.fechaVisita}</div>
                  </div>
                </div>

                {/* Actions for Confirmation */}
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                  <a
                    href={getWhatsAppPromoUrl(
                      sucursalesWithCoords.find(s => s.id === confirmedBooking.sucursalId),
                      confirmedBooking
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: '12px 20px', borderRadius: 12, background: '#25D366', color: C.white,
                      fontFamily: F.heading, fontWeight: 700, fontSize: 14, textDecoration: 'none',
                      display: 'inline-flex', alignItems: 'center', gap: 8,
                      boxShadow: '0 4px 14px rgba(37,211,102,0.3)',
                    }}
                  >
                    <MessageCircle size={18} /> Confirmar mi visita por WhatsApp
                  </a>

                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(confirmedBooking.folio);
                      setCopiedFolio(true);
                      setTimeout(() => setCopiedFolio(false), 2000);
                    }}
                    style={{
                      padding: '11px 18px', borderRadius: 12, background: C.light, color: C.navy,
                      border: `1px solid ${C.border}`, fontFamily: F.heading, fontWeight: 600, fontSize: 13,
                      cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6,
                    }}
                  >
                    {copiedFolio ? <Check size={15} color="#059669" /> : <Copy size={15} />}
                    {copiedFolio ? '¡Folio Copiado!' : 'Copiar Folio'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setConfirmedBooking(null)}
                    style={{
                      background: 'none', border: 'none', color: C.gray, fontSize: 13,
                      cursor: 'pointer', textDecoration: 'underline', marginLeft: 'auto',
                    }}
                  >
                    Modificar o agendar otra visita
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </section>

      {/* ═══════ 5. TRUST & VALUE PROPOSITIONS ═══════ */}
      <section className="landing-section-padding" style={{ padding: '60px 16px', background: C.white, width: '100%', boxSizing: 'border-box' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%' }}>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 26, textAlign: 'center' }}>
            <div>
              <div style={{
                width: 58, height: 58, borderRadius: 18, background: 'rgba(196,30,36,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
                color: C.red,
              }}>
                <Trophy size={28} />
              </div>
              <h3 style={{ fontFamily: F.heading, fontWeight: 800, fontSize: 17, color: C.navy, marginBottom: 8 }}>
                Llantas de las mejores marcas
              </h3>
              <p style={{ fontSize: 13, color: C.gray, lineHeight: 1.55 }}>
                Distribuidores autorizados de Michelin, Bridgestone, Goodyear, Continental, Pirelli y más.
              </p>
            </div>

            <div>
              <div style={{
                width: 58, height: 58, borderRadius: 18, background: 'rgba(196,30,36,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
                color: C.red,
              }}>
                <MapPin size={28} />
              </div>
              <h3 style={{ fontFamily: F.heading, fontWeight: 800, fontSize: 17, color: C.navy, marginBottom: 8 }}>
                Más de 50 sucursales en México
              </h3>
              <p style={{ fontSize: 13, color: C.gray, lineHeight: 1.55 }}>
                Centros de servicio automotriz de primer nivel en CDMX, Edomex, Querétaro, Bajío y Norte del país.
              </p>
            </div>

            <div>
              <div style={{
                width: 58, height: 58, borderRadius: 18, background: 'rgba(196,30,36,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
                color: C.red,
              }}>
                <ShieldCheck size={28} />
              </div>
              <h3 style={{ fontFamily: F.heading, fontWeight: 800, fontSize: 17, color: C.navy, marginBottom: 8 }}>
                Servicio confiable y garantizado
              </h3>
              <p style={{ fontSize: 13, color: C.gray, lineHeight: 1.55 }}>
                Tecnología computarizada de alineación y balanceo con garantía por escrito en cada trabajo.
              </p>
            </div>

            <div>
              <div style={{
                width: 58, height: 58, borderRadius: 18, background: 'rgba(196,30,36,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
                color: C.red,
              }}>
                <Wrench size={28} />
              </div>
              <h3 style={{ fontFamily: F.heading, fontWeight: 800, fontSize: 17, color: C.navy, marginBottom: 8 }}>
                Expertos en el cuidado de tu auto
              </h3>
              <p style={{ fontSize: 13, color: C.gray, lineHeight: 1.55 }}>
                Más de 60 años de experiencia brindando soluciones automotrices honestas y profesionales.
              </p>
            </div>
          </div>

          {/* Institutional paragraph */}
          <div style={{
            marginTop: 40, padding: '20px 24px', borderRadius: 16,
            background: C.light, border: `1px solid ${C.border}`, textAlign: 'center',
            maxWidth: 880, margin: '40px auto 0',
          }}>
            <p style={{ fontSize: 13, color: C.gray, lineHeight: 1.7, margin: 0 }}>
              <strong>Jasman Automotriz en México</strong> ofrece mecánica en general, diagnóstico en fallas,
              cambio de aceite, amortiguadores, instalación y venta de llantas, frenos, clutch, afinación mayor,
              suspensión y baterías. Servicio automotriz profesional para mantener tu auto seguro y en óptimas condiciones.
            </p>
          </div>

        </div>
      </section>

      {/* ═══════ 6. FAQ ACCORDION ═══════ */}
      <section className="landing-section-padding" style={{ padding: '60px 16px', background: '#F8F9FA', borderTop: `1px solid ${C.border}`, width: '100%', boxSizing: 'border-box' }}>
        <div style={{ maxWidth: 840, margin: '0 auto', width: '100%' }}>

          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <span style={{ color: C.red, fontFamily: F.heading, fontWeight: 700, fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              RESOLVEMOS TUS DUDAS
            </span>
            <h2 style={{ fontFamily: F.heading, fontWeight: 900, fontSize: 'clamp(1.7rem, 3.5vw, 2.2rem)', color: C.navy, marginTop: 8 }}>
              Preguntas Frecuentes
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {faqItems.map((item, idx) => (
              <div
                key={idx}
                style={{
                  background: C.white, borderRadius: 14,
                  border: `1px solid ${openFaq === idx ? C.red : C.border}`,
                  overflow: 'hidden', transition: 'all 0.3s',
                }}
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? -1 : idx)}
                  style={{
                    width: '100%', padding: '16px 20px', background: 'none', border: 'none',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    fontFamily: F.heading, fontWeight: 700, fontSize: 15, color: C.navy,
                    textAlign: 'left', cursor: 'pointer',
                  }}
                >
                  <span style={{ paddingRight: 10 }}>{item.q}</span>
                  <ChevronDown
                    size={18}
                    color={openFaq === idx ? C.red : C.gray}
                    style={{
                      transform: openFaq === idx ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.3s', flexShrink: 0,
                    }}
                  />
                </button>
                {openFaq === idx && (
                  <div style={{ padding: '0 20px 18px', fontSize: 13, color: C.gray, lineHeight: 1.65 }}>
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Legal restrictions footer note from original banner */}
          <div style={{ marginTop: 36, padding: '16px 20px', borderRadius: 12, background: C.white, border: `1px solid ${C.border}`, fontSize: 11, color: C.gray, lineHeight: 1.6 }}>
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
