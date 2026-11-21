import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import PageHero from '../components/PageHero';
import ServiceActionCard from '../components/ServiceActionCard';
import { C, F } from '../hooks/useAnimations';
import { sucursales as staticSucursales } from '../data/sucursalesData';
import { useWixSucursales } from '../hooks/useWixSucursales';
import { servicios, paquetes, serviceCategories } from '../data/serviciosData';
import {
  MapPin,
  Phone,
  MessageCircle,
  Navigation,
  Clock,
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  Search,
  Sparkles,
  Wrench,
  ShieldCheck,
  Scan,
} from 'lucide-react';

export default function SucursalDetailPage() {
  const { slug } = useParams();
  const sucursales = useWixSucursales(staticSucursales);
  const branch = sucursales.find((s) => s.id === slug);

  const [activeCategory, setActiveCategory] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPackages = useMemo(() => {
    if (!searchTerm.trim()) return paquetes;
    const term = searchTerm.toLowerCase();
    return paquetes.filter(
      (pkg) =>
        pkg.title.toLowerCase().includes(term) ||
        pkg.description.toLowerCase().includes(term) ||
        pkg.includes.some((inc) => inc.toLowerCase().includes(term))
    );
  }, [searchTerm]);

  const filteredServices = useMemo(() => {
    let list = servicios;
    if (activeCategory !== 'Todos' && activeCategory !== 'Paquetes') {
      list = list.filter((s) => s.category === activeCategory);
    }
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      list = list.filter(
        (s) =>
          s.title.toLowerCase().includes(term) ||
          s.description.toLowerCase().includes(term) ||
          s.category.toLowerCase().includes(term)
      );
    }
    return list;
  }, [activeCategory, searchTerm]);

  if (!branch) {
    return (
      <>
        <PageHero
          tag="SUCURSAL"
          title="Sucursal"
          highlight="no encontrada"
          breadcrumbs={[{ label: 'Sucursales', href: '/sucursales' }, { label: '404' }]}
        />
        <div style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
          <Link to="/sucursales" style={{ color: C.red, fontWeight: 600 }}>
            ← Volver a Sucursales
          </Link>
        </div>
      </>
    );
  }

  const nearby = sucursales
    .filter((s) => s.region === branch.region && s.id !== branch.id)
    .slice(0, 6);
  const showPackages = activeCategory === 'Todos' || activeCategory === 'Paquetes';
  const showServicesList = activeCategory !== 'Paquetes';
  const totalVisibleServices =
    (showPackages ? filteredPackages.length : 0) + (showServicesList ? filteredServices.length : 0);

  return (
    <>
      {/* 1. Nuevo primer pantallazo diferenciado para la página de Sucursal */}
      <section
        style={{
          position: 'relative',
          minHeight: 500,
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden',
          background: C.navy,
        }}
      >
        <img
          src="/images/timeline-2015-presencia-nacional.jpg"
          alt={`Taller Automotriz Jasman Suc. ${branch.name}`}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: 0.24,
            filter: 'blur(1.5px)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(125deg, rgba(16, 20, 38, 0.96) 0%, rgba(26, 31, 54, 0.89) 55%, rgba(196, 30, 36, 0.24) 100%)',
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: -160,
            right: -140,
            width: 460,
            height: 460,
            borderRadius: '50%',
            border: '1px solid rgba(255,255,255,0.08)',
            pointerEvents: 'none',
          }}
        />

        <div
          style={{
            position: 'relative',
            zIndex: 2,
            maxWidth: 1280,
            margin: '0 auto',
            padding: '124px 24px 64px',
            width: '100%',
          }}
        >
          <nav
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              marginBottom: 22,
              fontSize: 13,
              color: 'rgba(255,255,255,0.48)',
              flexWrap: 'wrap',
            }}
          >
            <Link to="/" style={{ color: 'rgba(255,255,255,0.62)', textDecoration: 'none' }}>
              Inicio
            </Link>
            <ChevronRight size={12} />
            <Link to="/sucursales" style={{ color: 'rgba(255,255,255,0.62)', textDecoration: 'none' }}>
              Sucursales
            </Link>
            <ChevronRight size={12} />
            <span style={{ color: C.redLight, fontWeight: 600 }}>Suc. {branch.name}</span>
          </nav>

          <div className="sucursal-hero-grid">
            {/* Hero Left */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 18 }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '7px 16px',
                    borderRadius: 9999,
                    background: 'rgba(196,30,36,0.16)',
                    border: '1px solid rgba(196,30,36,0.28)',
                    color: C.redLight,
                    fontFamily: F.heading,
                    fontWeight: 700,
                    fontSize: 11.5,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                  }}
                >
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.red }} />
                  Región {branch.region}
                </span>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '7px 14px',
                    borderRadius: 9999,
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.14)',
                    color: 'rgba(255,255,255,0.86)',
                    fontFamily: F.heading,
                    fontWeight: 600,
                    fontSize: 11.5,
                  }}
                >
                  <Clock size={12} color={C.redLight} />
                  {branch.schedule || 'Lun - Sáb: 8:00 - 18:00'}
                </span>
              </div>

              <div
                style={{
                  fontFamily: F.heading,
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.58)',
                  marginBottom: 8,
                }}
              >
                Taller Mecánico Automotriz en {branch.city}
              </div>

              <h1
                style={{
                  fontFamily: F.heading,
                  fontWeight: 900,
                  fontSize: 'clamp(2.1rem, 4.4vw, 3.4rem)',
                  color: C.white,
                  lineHeight: 1.08,
                  letterSpacing: '-0.025em',
                  margin: '0 0 16px',
                }}
              >
                Taller Automotriz Jasman{' '}
                <span
                  className="animated-gradient"
                  style={{
                    background: `linear-gradient(135deg, ${C.redLight}, ${C.amber}, ${C.redLight})`,
                    backgroundSize: '200% 200%',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Suc. {branch.name}
                </span>
              </h1>

              <p
                style={{
                  fontSize: 16.5,
                  color: 'rgba(255,255,255,0.72)',
                  lineHeight: 1.7,
                  maxWidth: 620,
                  margin: '0 0 26px',
                }}
              >
                Alineación y balanceo, cambio de aceite, frenos, suspensión y mantenimiento
                automotriz profesional en {branch.city}, {branch.state}.
              </p>

              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {branch.whatsappUrl && (
                  <a
                    href={branch.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="glow-btn"
                    style={{
                      padding: '13px 22px',
                      borderRadius: 14,
                      background: '#25D366',
                      color: C.white,
                      fontFamily: F.heading,
                      fontWeight: 700,
                      fontSize: 14,
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      boxShadow: '0 8px 24px rgba(37, 211, 102, 0.30)',
                    }}
                  >
                    <MessageCircle size={16} />
                    <span>WhatsApp Sucursal</span>
                  </a>
                )}

                <a
                  href={branch.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: '13px 22px',
                    borderRadius: 14,
                    background: 'rgba(255,255,255,0.10)',
                    border: '1px solid rgba(255,255,255,0.18)',
                    color: C.white,
                    fontFamily: F.heading,
                    fontWeight: 700,
                    fontSize: 14,
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <Navigation size={16} color={C.redLight} />
                  <span>Cómo Llegar</span>
                </a>

                <a
                  href="#servicios-sucursal"
                  style={{
                    padding: '13px 22px',
                    borderRadius: 14,
                    background: C.red,
                    color: C.white,
                    fontFamily: F.heading,
                    fontWeight: 700,
                    fontSize: 14,
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    boxShadow: '0 8px 24px rgba(196, 30, 36, 0.32)',
                  }}
                >
                  <Wrench size={15} />
                  <span>Ver Servicios</span>
                </a>
              </div>
            </div>

            {/* Hero Right Executive Glass Card */}
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.14)',
                borderRadius: 24,
                padding: 26,
                color: C.white,
                boxShadow: '0 24px 56px rgba(0, 0, 0, 0.25)',
              }}
            >
              <div
                style={{
                  fontFamily: F.heading,
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: C.redLight,
                  marginBottom: 14,
                }}
              >
                Ubicación y Atención Directa
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <MapPin size={17} color={C.redLight} style={{ marginTop: 3, flexShrink: 0 }} />
                  <div style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.88)', lineHeight: 1.55 }}>
                    {branch.address}
                  </div>
                </div>

                {branch.phone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Phone size={16} color={C.redLight} style={{ flexShrink: 0 }} />
                    <a
                      href={`tel:${String(branch.phone).replace(/\s+/g, '')}`}
                      style={{
                        fontSize: 15,
                        fontFamily: F.heading,
                        fontWeight: 700,
                        color: C.white,
                        textDecoration: 'none',
                      }}
                    >
                      {branch.phone}
                    </a>
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Clock size={16} color={C.redLight} style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.85)' }}>
                    {branch.schedule || 'Lun - Sáb: 8:00 - 18:00'}
                  </span>
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                  gap: 8,
                  paddingTop: 16,
                  borderTop: '1px solid rgba(255,255,255,0.12)',
                }}
              >
                {[
                  { icon: Wrench, label: '+30 Servicios' },
                  { icon: Scan, label: '72 Puntos' },
                  { icon: ShieldCheck, label: 'Garantía' },
                ].map((badge) => {
                  const IconComp = badge.icon;
                  return (
                    <div
                      key={badge.label}
                      style={{
                        padding: '10px 8px',
                        borderRadius: 12,
                        background: 'rgba(255,255,255,0.06)',
                        textAlign: 'center',
                      }}
                    >
                      <IconComp size={15} color={C.redLight} style={{ margin: '0 auto 4px', display: 'block' }} />
                      <div
                        style={{
                          fontFamily: F.heading,
                          fontSize: 10.5,
                          fontWeight: 700,
                          color: 'rgba(255,255,255,0.9)',
                        }}
                      >
                        {badge.label}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Contenido Principal: Sidebar izquierda (Info + Otras sucursales de la región) y Repetidor de Servicios derecha */}
      <section style={{ padding: 'clamp(2.8rem, 5vw, 4.5rem) 1.5rem', background: C.light }}>
        <div className="sucursal-detail-grid" style={{ maxWidth: 1320, margin: '0 auto' }}>
          {/* Left Sticky Column: Info + Otras Sucursales de la misma región */}
          <aside className="sucursal-left-aside">
            <div
              style={{
                background: C.white,
                borderRadius: 24,
                padding: 28,
                border: `1px solid ${C.border}`,
                boxShadow: '0 8px 28px rgba(26, 31, 54, 0.04)',
                marginBottom: 20,
              }}
            >
              <h2
                style={{
                  fontFamily: F.heading,
                  fontWeight: 800,
                  fontSize: 20,
                  color: C.navy,
                  marginBottom: 18,
                }}
              >
                Información de la Sucursal
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 11,
                      flexShrink: 0,
                      background: 'rgba(196,30,36,0.06)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <MapPin size={17} color={C.red} />
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 11,
                        color: C.gray,
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      Dirección
                    </div>
                    <div style={{ fontSize: 14, color: C.navy, lineHeight: 1.5, marginTop: 3 }}>
                      {branch.address}
                    </div>
                  </div>
                </div>

                {branch.phone && (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 11,
                        flexShrink: 0,
                        background: 'rgba(196,30,36,0.06)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Phone size={17} color={C.red} />
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: 11,
                          color: C.gray,
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                        }}
                      >
                        Teléfono
                      </div>
                      <div style={{ fontSize: 14, color: C.navy, marginTop: 3 }}>{branch.phone}</div>
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 11,
                      flexShrink: 0,
                      background: 'rgba(196,30,36,0.06)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Clock size={17} color={C.red} />
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 11,
                        color: C.gray,
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      Horario
                    </div>
                    <div style={{ fontSize: 14, color: C.navy, marginTop: 3 }}>
                      {branch.schedule || 'Lun - Sáb: 8:00 - 18:00'}
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 22, flexWrap: 'wrap' }}>
                {branch.whatsappUrl && (
                  <a
                    href={branch.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="glow-btn"
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      borderRadius: 13,
                      background: '#25d366',
                      color: C.white,
                      fontFamily: F.heading,
                      fontWeight: 700,
                      fontSize: 13.5,
                      textDecoration: 'none',
                      textAlign: 'center',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 7,
                      boxShadow: '0 6px 20px rgba(37,211,102,0.25)',
                    }}
                  >
                    <MessageCircle size={15} /> WhatsApp
                  </a>
                )}
                <a
                  href={branch.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    borderRadius: 13,
                    background: C.navy,
                    color: C.white,
                    fontFamily: F.heading,
                    fontWeight: 600,
                    fontSize: 13.5,
                    textDecoration: 'none',
                    textAlign: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 7,
                  }}
                >
                  <Navigation size={15} /> Cómo Llegar
                </a>
              </div>
            </div>

            <Link
              to="/sucursales"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                fontFamily: F.heading,
                fontWeight: 700,
                fontSize: 13.5,
                color: C.red,
                textDecoration: 'none',
                marginBottom: 20,
              }}
            >
              <ArrowLeft size={14} /> Todas las Sucursales
            </Link>

            {/* Otras Sucursales de la Misma Región (debajo de info sucursal) */}
            {nearby.length > 0 && (
              <div
                style={{
                  background: C.white,
                  borderRadius: 24,
                  padding: 24,
                  border: `1px solid ${C.border}`,
                  boxShadow: '0 8px 28px rgba(26, 31, 54, 0.04)',
                }}
              >
                <div
                  style={{
                    fontFamily: F.heading,
                    fontSize: 10.5,
                    fontWeight: 800,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: C.red,
                    marginBottom: 4,
                  }}
                >
                  Región {branch.region}
                </div>
                <h3
                  style={{
                    fontFamily: F.heading,
                    fontWeight: 800,
                    fontSize: 16,
                    color: C.navy,
                    marginBottom: 14,
                  }}
                >
                  Otras Sucursales de la Misma Región
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {nearby.map((n, idx) => (
                    <Link
                      to={`/sucursales/${n.id}`}
                      key={n.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 11,
                        padding: '10px 4px',
                        borderBottom: idx === nearby.length - 1 ? 'none' : `1px solid ${C.border}`,
                        textDecoration: 'none',
                        transition: 'color 0.2s',
                      }}
                    >
                      <MapPin size={14} color={C.red} style={{ flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontFamily: F.heading,
                            fontWeight: 700,
                            fontSize: 13,
                            color: C.navy,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          Suc. {n.name}
                        </div>
                        <div style={{ fontSize: 11.5, color: C.gray }}>
                          {n.city}, {n.state}
                        </div>
                      </div>
                      <ArrowRight size={13} color={C.gray} />
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </aside>

          {/* Right: Repetidor de Servicios y Paquetes de esta Sucursal */}
          <div id="servicios-sucursal" style={{ scrollMarginTop: 104, minWidth: 0 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 12,
                marginBottom: 18,
              }}
            >
              <div>
                <div
                  style={{
                    fontFamily: F.heading,
                    fontSize: 11,
                    fontWeight: 800,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    color: C.red,
                    marginBottom: 4,
                  }}
                >
                  Catálogo Local de Taller
                </div>
                <h2
                  style={{
                    fontFamily: F.heading,
                    fontWeight: 900,
                    fontSize: 'clamp(1.45rem, 2.6vw, 2rem)',
                    color: C.navy,
                    margin: 0,
                  }}
                >
                  Servicios en Jasman Suc. {branch.name}
                </h2>
              </div>
              <span
                style={{
                  padding: '6px 14px',
                  borderRadius: 9999,
                  background: 'rgba(196, 30, 36, 0.09)',
                  color: C.red,
                  fontFamily: F.heading,
                  fontSize: 12,
                  fontWeight: 800,
                }}
              >
                {totalVisibleServices} disponibles
              </span>
            </div>

            {/* Category filter tabs + search input (duplicado de ServiciosPage) */}
            <div
              style={{
                display: 'flex',
                gap: 12,
                marginBottom: 26,
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 18px',
                borderRadius: 20,
                background: C.white,
                border: `1px solid ${C.border}`,
                boxShadow: '0 4px 20px rgba(0,0,0,0.035)',
              }}
            >
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', flex: 1 }}>
                {serviceCategories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategory(cat)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: 11,
                      border: `1px solid ${activeCategory === cat ? C.red : C.border}`,
                      background: activeCategory === cat ? C.red : C.white,
                      color: activeCategory === cat ? C.white : C.navy,
                      fontFamily: F.heading,
                      fontWeight: 700,
                      fontSize: 12,
                      cursor: 'pointer',
                      transition: 'all 0.25s',
                      boxShadow: activeCategory === cat ? '0 4px 14px rgba(196,30,36,0.2)' : 'none',
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '9px 14px',
                  borderRadius: 11,
                  background: C.light,
                  border: `1px solid ${C.border}`,
                  minWidth: 220,
                }}
              >
                <Search size={15} color={C.gray} />
                <input
                  type="text"
                  placeholder={`Buscar servicio en Suc. ${branch.name}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    border: 'none',
                    background: 'none',
                    outline: 'none',
                    flex: 1,
                    fontSize: 13,
                    color: C.navy,
                    fontFamily: F.body,
                  }}
                />
              </div>
            </div>

            {/* Paquetes destacados en la sucursal */}
            {showPackages && filteredPackages.length > 0 && (
              <div style={{ marginBottom: 30 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <Sparkles size={19} color={C.red} />
                  <h3
                    style={{
                      fontFamily: F.heading,
                      fontWeight: 800,
                      fontSize: 18,
                      color: C.navy,
                      margin: 0,
                    }}
                  >
                    Paquetes de Servicio en Suc. {branch.name}
                  </h3>
                </div>
                <div className="sucursal-services-grid">
                  {filteredPackages.map((pkg) => (
                    <ServiceActionCard key={pkg.slug} service={pkg} branch={branch} />
                  ))}
                </div>
              </div>
            )}

            {/* Servicios individuales en la sucursal */}
            {showServicesList && filteredServices.length > 0 && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <h3
                    style={{
                      fontFamily: F.heading,
                      fontWeight: 800,
                      fontSize: 18,
                      color: C.navy,
                      margin: 0,
                    }}
                  >
                    {activeCategory === 'Todos' ? 'Todos los Servicios' : activeCategory}
                  </h3>
                  <span
                    style={{
                      padding: '3px 10px',
                      borderRadius: 9999,
                      background: 'rgba(196,30,36,0.08)',
                      color: C.red,
                      fontSize: 11.5,
                      fontWeight: 700,
                      fontFamily: F.heading,
                    }}
                  >
                    {filteredServices.length}
                  </span>
                </div>
                <div className="sucursal-services-grid">
                  {filteredServices.map((srv) => (
                    <ServiceActionCard key={srv.slug} service={srv} branch={branch} />
                  ))}
                </div>
              </div>
            )}

            {totalVisibleServices === 0 && (
              <div
                style={{
                  background: C.white,
                  borderRadius: 20,
                  padding: '44px 24px',
                  textAlign: 'center',
                  border: `1px solid ${C.border}`,
                  color: C.gray,
                }}
              >
                No se encontraron servicios para “{searchTerm}” en Suc. {branch.name}.
              </div>
            )}
          </div>
        </div>
      </section>

      <style>{`
        .sucursal-hero-grid {
          display: grid;
          grid-template-columns: 1.25fr 0.85fr;
          gap: 36px;
          align-items: center;
        }
        .sucursal-detail-grid {
          display: grid;
          grid-template-columns: minmax(300px, 350px) minmax(0, 1fr);
          gap: 34px;
          align-items: start;
        }
        .sucursal-left-aside {
          position: sticky;
          top: 96px;
        }
        .sucursal-services-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
        }
        .jasman-service-action-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 14px 34px rgba(26, 31, 54, 0.08) !important;
          border-color: rgba(196, 30, 36, 0.22) !important;
        }
        .jasman-service-detail-btn:hover {
          background: #C41E24 !important;
        }
        @media (max-width: 1024px) {
          .sucursal-hero-grid,
          .sucursal-detail-grid {
            grid-template-columns: minmax(0, 1fr);
          }
          .sucursal-left-aside {
            position: static;
          }
        }
        @media (max-width: 680px) {
          .sucursal-services-grid {
            grid-template-columns: minmax(0, 1fr);
          }
        }
      `}</style>
    </>
  );
}
