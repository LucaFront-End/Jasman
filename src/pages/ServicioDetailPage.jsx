import { useParams, Link } from 'react-router-dom';
import PageHero from '../components/PageHero';
import { C, F } from '../hooks/useAnimations';
import { servicios, paquetes } from '../data/serviciosData';
import Icon from '../components/Icon';
import { Check, Clock, ShieldCheck, ArrowRight, ArrowLeft, Scan } from 'lucide-react';

export default function ServicioDetailPage() {
  const { slug } = useParams();
  const service = [...servicios, ...paquetes].find(s => s.slug === slug);

  if (!service) {
    return (
      <>
        <PageHero tag="SERVICIO" title="Servicio" highlight="no encontrado" breadcrumbs={[{ label: 'Servicios', href: '/servicios' }, { label: '404' }]} />
        <div style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
          <p style={{ fontSize: 16, color: C.gray, marginBottom: 24 }}>El servicio que buscas no existe.</p>
          <Link to="/servicios" style={{ color: C.red, fontWeight: 600 }}>← Volver a Servicios</Link>
        </div>
      </>
    );
  }

  const isPaquete = !!service.badge;
  const related = servicios.filter(s => s.category === service.category && s.slug !== slug).slice(0, 4);

  return (
    <>
      <PageHero
        tag={isPaquete ? 'PAQUETE' : service.category}
        title={service.title}
        subtitle={service.description}
        breadcrumbs={[{ label: 'Servicios', href: '/servicios' }, { label: service.title }]}
        image="https://images.unsplash.com/photo-1625047509248-ec889cbff17f?w=1920&q=80"
      />

      <section style={{ padding: 'clamp(3rem, 6vw, 5rem) 1.5rem', background: C.light }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 40, alignItems: 'start' }}>
          {/* Left: Details */}
          <div>
            <div style={{
              background: C.white, borderRadius: 24, padding: 36,
              border: `1px solid ${C.border}`, boxShadow: '0 8px 32px rgba(0,0,0,0.04)',
            }}>
              <h2 style={{ fontFamily: F.heading, fontWeight: 800, fontSize: 22, color: C.navy, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 4, height: 24, borderRadius: 2,
                  background: `linear-gradient(180deg, ${C.red}, ${C.redLight})`,
                }} />
                ¿Qué incluye?
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {service.includes.map((item, j) => (
                  <div key={j} style={{
                    display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
                    borderRadius: 14, background: C.light, border: `1px solid ${C.border}`,
                    transition: 'all 0.3s',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(196,30,36,0.04)'; e.currentTarget.style.borderColor = 'rgba(196,30,36,0.15)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = C.light; e.currentTarget.style.borderColor = C.border; }}
                  >
                    <div style={{
                      width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                      background: 'rgba(196,30,36,0.08)', border: '1px solid rgba(196,30,36,0.1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Check size={14} color={C.red} strokeWidth={3} />
                    </div>
                    <span style={{ fontSize: 14, color: C.charcoal, lineHeight: 1.5 }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Related services */}
            {related.length > 0 && (
              <div style={{ marginTop: 32 }}>
                <h3 style={{ fontFamily: F.heading, fontWeight: 700, fontSize: 18, color: C.navy, marginBottom: 16 }}>
                  Servicios Relacionados
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {related.map(r => (
                    <Link to={`/servicios/${r.slug}`} key={r.slug} style={{
                      padding: '14px 16px', borderRadius: 14,
                      background: C.white, border: `1px solid ${C.border}`,
                      display: 'flex', alignItems: 'center', gap: 12,
                      transition: 'all 0.3s',
                    }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(196,30,36,0.2)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.transform = 'translateY(0)'; }}
                    >
                      <Icon name={r.icon} size={18} color={C.red} />
                      <div>
                        <div style={{ fontFamily: F.heading, fontWeight: 600, fontSize: 13, color: C.navy }}>{r.title}</div>
                        <div style={{ fontSize: 11, color: C.gray }}>{r.price}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Sidebar */}
          <div>
            {/* Info card */}
            <div style={{
              background: C.navy, borderRadius: 24, padding: 32,
              color: C.white, marginBottom: 20,
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 28 }}>
                {service.price && (
                  <div style={{
                    padding: '16px 20px', borderRadius: 16,
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                  }}>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Precio</div>
                    <div style={{ fontFamily: F.heading, fontWeight: 900, fontSize: 28, color: C.redLight, marginTop: 4 }}>{service.price}</div>
                  </div>
                )}
                <div style={{ display: 'flex', gap: 12 }}>
                  <div style={{
                    flex: 1, padding: '14px 16px', borderRadius: 14,
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
                      <Clock size={11} /> Tiempo
                    </div>
                    <div style={{ fontFamily: F.heading, fontWeight: 700, fontSize: 16, color: C.white, marginTop: 4 }}>{service.time}</div>
                  </div>
                  <div style={{
                    flex: 1, padding: '14px 16px', borderRadius: 14,
                    background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.12)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'rgba(34,197,94,0.6)' }}>
                      <ShieldCheck size={11} /> Garantía
                    </div>
                    <div style={{ fontFamily: F.heading, fontWeight: 700, fontSize: 16, color: '#22c55e', marginTop: 4 }}>Incluida</div>
                  </div>
                </div>
              </div>

              {/* 72 points badge */}
              <div style={{
                padding: '16px 20px', borderRadius: 16,
                background: 'rgba(196,30,36,0.08)', border: '1px solid rgba(196,30,36,0.15)',
                display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24,
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: `linear-gradient(135deg, ${C.red}, ${C.redLight})`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Scan size={20} color={C.white} />
                </div>
                <div>
                  <div style={{ fontFamily: F.heading, fontWeight: 700, fontSize: 14, color: C.white }}>Escaneo de 72 puntos</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Incluido en todos nuestros servicios</div>
                </div>
              </div>

              <a href="https://api.whatsapp.com/send/?phone=5215579337994&text=SW%20-Hola%20quisiera%20cotizar%20el%20servicio%20de%20" className="glow-btn" style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                width: '100%', padding: '16px 24px', borderRadius: 16, border: 'none',
                background: `linear-gradient(135deg, ${C.red}, ${C.redLight})`,
                color: C.white, fontFamily: F.heading, fontWeight: 700, fontSize: 15,
                boxShadow: '0 8px 32px rgba(196,30,36,0.35)',
                transition: 'all 0.3s', cursor: 'pointer',
              }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                Cotizar este Servicio <ArrowRight size={16} />
              </a>
            </div>

            <Link to="/servicios" style={{
              display: 'flex', alignItems: 'center', gap: 8,
              fontFamily: F.heading, fontWeight: 600, fontSize: 14, color: C.red,
            }}>
              <ArrowLeft size={14} /> Volver a Servicios
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
