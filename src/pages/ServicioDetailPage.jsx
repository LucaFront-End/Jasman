import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import PageHero from '../components/PageHero';
import ServiceActionCard from '../components/ServiceActionCard';
import { C, F } from '../hooks/useAnimations';
import { servicios, paquetes } from '../data/serviciosData';
import { sucursales as staticSucursales } from '../data/sucursalesData';
import { useWixSucursales } from '../hooks/useWixSucursales';
import {
  buildBranchServiceWhatsAppUrl,
  buildServiceWhatsAppUrl,
} from '../utils/whatsappLinks';
import {
  Check,
  Clock,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Scan,
  MapPin,
  Phone,
  Navigation,
} from 'lucide-react';

// Ocultar precios temporalmente sin eliminar la información base
const SHOW_SERVICE_PRICES = false;

const POPULAR_SERVICE_SLUGS = [
  'alineacion-y-balanceo',
  'cambio-de-aceite',
  'pastillas-frenos-delanteras',
  'amortiguadores-delanteros',
  'cambio-de-bateria',
  'limpieza-ajuste-frenos',
];

export default function ServicioDetailPage() {
  const { slug, branchSlug } = useParams();
  const sucursales = useWixSucursales(staticSucursales);
  const service = [...servicios, ...paquetes].find((s) => s.slug === slug);
  const branch = branchSlug ? sucursales.find((s) => s.id === branchSlug) : null;

  const related = useMemo(() => {
    if (!service) return [];
    const sameCategory = servicios.filter(
      (s) => s.category === service.category && s.slug !== slug
    );
    const chosen = [...sameCategory];
    const seen = new Set([slug, ...chosen.map((s) => s.slug)]);
    for (const popSlug of POPULAR_SERVICE_SLUGS) {
      if (chosen.length >= 6) break;
      if (seen.has(popSlug)) continue;
      const found = servicios.find((s) => s.slug === popSlug);
      if (found) {
        chosen.push(found);
        seen.add(popSlug);
      }
    }
    return chosen.slice(0, 6);
  }, [service, slug]);

  if (!service || (branchSlug && !branch)) {
    return (
      <>
        <PageHero
          tag={branchSlug && !branch ? 'SUCURSAL' : 'SERVICIO'}
          title={branchSlug && !branch ? 'Sucursal' : 'Servicio'}
          highlight="no encontrado"
          breadcrumbs={[
            { label: branchSlug ? 'Sucursales' : 'Servicios', href: branchSlug ? '/sucursales' : '/servicios' },
            { label: '404' },
          ]}
        />
        <div style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
          <p style={{ fontSize: 16, color: C.gray, marginBottom: 24 }}>
            {branchSlug && !branch
              ? 'La sucursal que buscas no existe.'
              : 'El servicio que buscas no existe.'}
          </p>
          <Link to={branchSlug ? '/sucursales' : '/servicios'} style={{ color: C.red, fontWeight: 600 }}>
            ← {branchSlug ? 'Volver a Sucursales' : 'Volver a Servicios'}
          </Link>
        </div>
      </>
    );
  }

  const isPaquete = Boolean(service.badge);
  const whatsappQuoteHref = branch
    ? buildBranchServiceWhatsAppUrl(branch, service.title)
    : buildServiceWhatsAppUrl(service.title);

  const heroTitle = branch
    ? `${service.title} en Taller Mecánico Automotriz`
    : service.title;
  const heroHighlight = branch ? `Jasman Suc. ${branch.name}` : undefined;
  const heroSubtitle = branch
    ? `${service.description} Disponible en Jasman Suc. ${branch.name} (${branch.city}, ${branch.state}) con técnicos certificados, escaneo de 72 puntos y garantía por escrito.`
    : service.description;
  const heroBreadcrumbs = branch
    ? [
        { label: 'Sucursales', href: '/sucursales' },
        { label: `Suc. ${branch.name}`, href: `/sucursales/${branch.id}` },
        { label: service.title },
      ]
    : [{ label: 'Servicios', href: '/servicios' }, { label: service.title }];

  return (
    <>
      <PageHero
        tag={branch ? `${isPaquete ? 'PAQUETE' : service.category} · SUC. ${branch.name}` : isPaquete ? 'PAQUETE' : service.category}
        title={heroTitle}
        highlight={heroHighlight}
        subtitle={heroSubtitle}
        breadcrumbs={heroBreadcrumbs}
        image="https://images.unsplash.com/photo-1625047509248-ec889cbff17f?w=1920&q=80"
      />

      <section style={{ padding: 'clamp(3rem, 6vw, 5rem) 1.5rem', background: C.light }}>
        <div className="servicio-detail-grid" style={{ maxWidth: 1180, margin: '0 auto' }}>
          {/* Left: Service Includes */}
          <div>
            <div
              style={{
                background: C.white,
                borderRadius: 24,
                padding: 34,
                border: `1px solid ${C.border}`,
                boxShadow: '0 8px 32px rgba(0,0,0,0.04)',
              }}
            >
              <h2
                style={{
                  fontFamily: F.heading,
                  fontWeight: 800,
                  fontSize: 22,
                  color: C.navy,
                  marginBottom: 24,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <div
                  style={{
                    width: 4,
                    height: 24,
                    borderRadius: 2,
                    background: `linear-gradient(180deg, ${C.red}, ${C.redLight})`,
                  }}
                />
                ¿Qué incluye?
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {service.includes.map((item, j) => (
                  <div
                    key={j}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                      padding: '14px 16px',
                      borderRadius: 14,
                      background: C.light,
                      border: `1px solid ${C.border}`,
                      transition: 'all 0.3s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(196,30,36,0.04)';
                      e.currentTarget.style.borderColor = 'rgba(196,30,36,0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = C.light;
                      e.currentTarget.style.borderColor = C.border;
                    }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 10,
                        flexShrink: 0,
                        background: 'rgba(196,30,36,0.08)',
                        border: '1px solid rgba(196,30,36,0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Check size={14} color={C.red} strokeWidth={3} />
                    </div>
                    <span style={{ fontSize: 14, color: C.charcoal, lineHeight: 1.5 }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Sidebar */}
          <div>
            <div
              style={{
                background: C.navy,
                borderRadius: 24,
                padding: 30,
                color: C.white,
                marginBottom: 20,
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
                {SHOW_SERVICE_PRICES && service.price && (
                  <div
                    style={{
                      padding: '16px 20px',
                      borderRadius: 16,
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    <div
                      style={{
                        fontSize: 11,
                        color: 'rgba(255,255,255,0.4)',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      Precio
                    </div>
                    <div
                      style={{
                        fontFamily: F.heading,
                        fontWeight: 900,
                        fontSize: 28,
                        color: C.redLight,
                        marginTop: 4,
                      }}
                    >
                      {service.price}
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: 12 }}>
                  <div
                    style={{
                      flex: 1,
                      padding: '14px 16px',
                      borderRadius: 14,
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        fontSize: 11,
                        color: 'rgba(255,255,255,0.45)',
                      }}
                    >
                      <Clock size={11} /> Tiempo
                    </div>
                    <div
                      style={{
                        fontFamily: F.heading,
                        fontWeight: 700,
                        fontSize: 16,
                        color: C.white,
                        marginTop: 4,
                      }}
                    >
                      {service.time}
                    </div>
                  </div>

                  <div
                    style={{
                      flex: 1,
                      padding: '14px 16px',
                      borderRadius: 14,
                      background: 'rgba(34,197,94,0.06)',
                      border: '1px solid rgba(34,197,94,0.12)',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        fontSize: 11,
                        color: 'rgba(34,197,94,0.7)',
                      }}
                    >
                      <ShieldCheck size={11} /> Garantía
                    </div>
                    <div
                      style={{
                        fontFamily: F.heading,
                        fontWeight: 700,
                        fontSize: 16,
                        color: '#22c55e',
                        marginTop: 4,
                      }}
                    >
                      Incluida
                    </div>
                  </div>
                </div>
              </div>

              {branch && (
                <div
                  style={{
                    padding: '14px 16px',
                    borderRadius: 16,
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.10)',
                    marginBottom: 16,
                  }}
                >
                  <div
                    style={{
                      fontFamily: F.heading,
                      fontWeight: 700,
                      fontSize: 13.5,
                      color: C.white,
                      marginBottom: 6,
                    }}
                  >
                    Jasman Suc. {branch.name}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 8,
                      fontSize: 12,
                      color: 'rgba(255,255,255,0.68)',
                      lineHeight: 1.5,
                      marginBottom: branch.phone ? 6 : 0,
                    }}
                  >
                    <MapPin size={13} color={C.redLight} style={{ marginTop: 2, flexShrink: 0 }} />
                    <span>{branch.address}</span>
                  </div>
                  {branch.phone && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        fontSize: 12,
                        color: 'rgba(255,255,255,0.78)',
                      }}
                    >
                      <Phone size={13} color={C.redLight} style={{ flexShrink: 0 }} />
                      <span>{branch.phone}</span>
                    </div>
                  )}
                </div>
              )}

              {/* 72 points badge */}
              <div
                style={{
                  padding: '15px 18px',
                  borderRadius: 16,
                  background: 'rgba(196,30,36,0.08)',
                  border: '1px solid rgba(196,30,36,0.16)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  marginBottom: 20,
                }}
              >
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 12,
                    background: `linear-gradient(135deg, ${C.red}, ${C.redLight})`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Scan size={19} color={C.white} />
                </div>
                <div>
                  <div style={{ fontFamily: F.heading, fontWeight: 700, fontSize: 14, color: C.white }}>
                    Escaneo de 72 puntos
                  </div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.48)' }}>
                    Incluido en todos nuestros servicios
                  </div>
                </div>
              </div>

              <a
                href={whatsappQuoteHref}
                target="_blank"
                rel="noopener noreferrer"
                className="glow-btn"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  width: '100%',
                  padding: '15px 22px',
                  borderRadius: 15,
                  border: 'none',
                  background: `linear-gradient(135deg, ${C.red}, ${C.redLight})`,
                  color: C.white,
                  fontFamily: F.heading,
                  fontWeight: 700,
                  fontSize: 15,
                  textDecoration: 'none',
                  boxShadow: '0 8px 32px rgba(196,30,36,0.35)',
                  transition: 'all 0.3s',
                  cursor: 'pointer',
                  marginBottom: branch?.mapsUrl ? 10 : 0,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Cotizar este Servicio <ArrowRight size={16} />
              </a>

              {branch?.mapsUrl && (
                <a
                  href={branch.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    width: '100%',
                    padding: '13px 20px',
                    borderRadius: 14,
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.16)',
                    color: C.white,
                    fontFamily: F.heading,
                    fontWeight: 600,
                    fontSize: 14,
                    textDecoration: 'none',
                  }}
                >
                  <Navigation size={15} color={C.redLight} />
                  <span>Visitar Suc. {branch.name}</span>
                </a>
              )}
            </div>

            <Link
              to={branch ? `/sucursales/${branch.id}` : '/servicios'}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                fontFamily: F.heading,
                fontWeight: 600,
                fontSize: 14,
                color: C.red,
                textDecoration: 'none',
              }}
            >
              <ArrowLeft size={14} />{' '}
              {branch ? `Ver todos los servicios en Suc. ${branch.name}` : 'Volver a Servicios'}
            </Link>
          </div>
        </div>

        {/* Full-width Más servicios / Servicios Relacionados con nuevo diseño de fichas */}
        {related.length > 0 && (
          <div style={{ maxWidth: 1180, margin: '48px auto 0' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 12,
                marginBottom: 20,
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
                  {branch ? `Jasman Suc. ${branch.name}` : 'Mantenimiento Automotriz'}
                </div>
                <h3
                  style={{
                    fontFamily: F.heading,
                    fontWeight: 800,
                    fontSize: 'clamp(1.35rem, 2.4vw, 1.75rem)',
                    color: C.navy,
                    margin: 0,
                  }}
                >
                  {branch ? `Más servicios en Jasman Suc. ${branch.name}` : 'Servicios Relacionados'}
                </h3>
              </div>

              <Link
                to={branch ? `/sucursales/${branch.id}` : '/servicios'}
                style={{
                  fontFamily: F.heading,
                  fontSize: 13,
                  fontWeight: 700,
                  color: C.red,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <span>
                  {branch ? `Ver todos en Suc. ${branch.name}` : 'Ver todos los servicios'}
                </span>
                <ArrowRight size={14} />
              </Link>
            </div>

            <div className="servicio-related-grid">
              {related.map((r) => (
                <ServiceActionCard key={r.slug} service={r} branch={branch} compact />
              ))}
            </div>
          </div>
        )}
      </section>

      <style>{`
        .servicio-detail-grid {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 36px;
          align-items: start;
        }
        .servicio-related-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 18px;
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
          .servicio-related-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
        @media (max-width: 860px) {
          .servicio-detail-grid {
            grid-template-columns: minmax(0, 1fr);
          }
        }
        @media (max-width: 640px) {
          .servicio-related-grid {
            grid-template-columns: minmax(0, 1fr);
          }
        }
      `}</style>
    </>
  );
}
