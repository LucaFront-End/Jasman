import { useParams, Link } from 'react-router-dom';
import PageHero from '../components/PageHero';
import { C, F } from '../hooks/useAnimations';
import { sucursales } from '../data/sucursalesData';
import { servicios } from '../data/serviciosData';
import Icon from '../components/Icon';
import { MapPin, Phone, MessageCircle, Navigation, Clock, ArrowLeft, ArrowRight } from 'lucide-react';

export default function SucursalDetailPage() {
  const { slug } = useParams();
  const branch = sucursales.find(s => s.id === slug);

  if (!branch) {
    return (
      <>
        <PageHero tag="SUCURSAL" title="Sucursal" highlight="no encontrada" breadcrumbs={[{ label: 'Sucursales', href: '/sucursales' }, { label: '404' }]} />
        <div style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
          <Link to="/sucursales" style={{ color: C.red, fontWeight: 600 }}>← Volver a Sucursales</Link>
        </div>
      </>
    );
  }

  const nearby = sucursales.filter(s => s.region === branch.region && s.id !== branch.id).slice(0, 4);

  return (
    <>
      <PageHero
        tag={`REGIÓN ${branch.region.toUpperCase()}`}
        title={`Suc. ${branch.name}`}
        subtitle={`${branch.city}, ${branch.state}`}
        breadcrumbs={[{ label: 'Sucursales', href: '/sucursales' }, { label: `Suc. ${branch.name}` }]}
      />

      <section style={{ padding: 'clamp(3rem, 6vw, 5rem) 1.5rem', background: C.light }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'start' }}>
          {/* Left: Info */}
          <div>
            {/* Address card */}
            <div style={{
              background: C.white, borderRadius: 24, padding: 32,
              border: `1px solid ${C.border}`, marginBottom: 24,
            }}>
              <h2 style={{ fontFamily: F.heading, fontWeight: 800, fontSize: 22, color: C.navy, marginBottom: 20 }}>
                Información de la Sucursal
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                    background: 'rgba(196,30,36,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}><MapPin size={18} color={C.red} /></div>
                  <div>
                    <div style={{ fontSize: 12, color: C.gray, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Dirección</div>
                    <div style={{ fontSize: 15, color: C.navy, lineHeight: 1.5, marginTop: 4 }}>{branch.address}</div>
                  </div>
                </div>
                {branch.phone && (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                      background: 'rgba(196,30,36,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}><Phone size={18} color={C.red} /></div>
                    <div>
                      <div style={{ fontSize: 12, color: C.gray, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Teléfono</div>
                      <div style={{ fontSize: 15, color: C.navy, marginTop: 4 }}>{branch.phone}</div>
                    </div>
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                    background: 'rgba(196,30,36,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}><Clock size={18} color={C.red} /></div>
                  <div>
                    <div style={{ fontSize: 12, color: C.gray, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Horario</div>
                    <div style={{ fontSize: 15, color: C.navy, marginTop: 4 }}>Lun - Sáb: 8:00 - 18:00</div>
                  </div>
                </div>
              </div>
              {/* Action buttons */}
              <div style={{ display: 'flex', gap: 10, marginTop: 28, flexWrap: 'wrap' }}>
                {branch.whatsappUrl && (
                  <a href={branch.whatsappUrl} target="_blank" rel="noopener noreferrer" className="glow-btn" style={{
                    flex: 1, padding: '14px 20px', borderRadius: 14,
                    background: '#25d366', color: C.white,
                    fontFamily: F.heading, fontWeight: 700, fontSize: 14,
                    textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    boxShadow: '0 6px 20px rgba(37,211,102,0.25)',
                  }}><MessageCircle size={16} /> WhatsApp</a>
                )}
                <a href={branch.mapsUrl} target="_blank" rel="noopener noreferrer" style={{
                  flex: 1, padding: '14px 20px', borderRadius: 14,
                  background: C.navy, color: C.white,
                  fontFamily: F.heading, fontWeight: 600, fontSize: 14,
                  textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}><Navigation size={16} /> Cómo Llegar</a>
              </div>
            </div>

            <Link to="/sucursales" style={{
              display: 'flex', alignItems: 'center', gap: 8,
              fontFamily: F.heading, fontWeight: 600, fontSize: 14, color: C.red,
            }}><ArrowLeft size={14} /> Todas las Sucursales</Link>
          </div>

          {/* Right: Services at this branch */}
          <div>
            <div style={{
              background: C.navy, borderRadius: 24, padding: 32,
              marginBottom: 24,
            }}>
              <h3 style={{ fontFamily: F.heading, fontWeight: 700, fontSize: 18, color: C.white, marginBottom: 20 }}>
                Servicios Disponibles
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {servicios.slice(0, 12).map(s => (
                  <Link to={`/servicios/${s.slug}`} key={s.slug} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 14px', borderRadius: 12,
                    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                    transition: 'all 0.3s',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(196,30,36,0.08)'; e.currentTarget.style.borderColor = 'rgba(196,30,36,0.2)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; }}
                  >
                    <div style={{
                      width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                      background: 'rgba(196,30,36,0.1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}><Icon name={s.icon} size={14} color={C.redLight} /></div>
                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', flex: 1 }}>{s.title}</span>
                    <ArrowRight size={12} color="rgba(255,255,255,0.3)" />
                  </Link>
                ))}
              </div>
              <Link to="/servicios" style={{
                display: 'block', marginTop: 16, textAlign: 'center',
                fontSize: 13, color: C.redLight, fontWeight: 600, fontFamily: F.heading,
              }}>Ver todos los servicios →</Link>
            </div>

            {/* Nearby branches */}
            {nearby.length > 0 && (
              <div style={{
                background: C.white, borderRadius: 24, padding: 28,
                border: `1px solid ${C.border}`,
              }}>
                <h3 style={{ fontFamily: F.heading, fontWeight: 700, fontSize: 16, color: C.navy, marginBottom: 16 }}>
                  Sucursales Cercanas
                </h3>
                {nearby.map(n => (
                  <Link to={`/sucursales/${n.id}`} key={n.id} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 0', borderBottom: `1px solid ${C.border}`,
                    transition: 'all 0.3s',
                  }}>
                    <MapPin size={14} color={C.red} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: F.heading, fontWeight: 600, fontSize: 13, color: C.navy }}>Suc. {n.name}</div>
                      <div style={{ fontSize: 11, color: C.gray }}>{n.city}</div>
                    </div>
                    <ArrowRight size={12} color={C.gray} />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
