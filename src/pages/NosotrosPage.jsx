import { useState, useEffect, useRef } from 'react';
import PageHero from '../components/PageHero';
import { C, F, useReveal, useCountUp, useStaggerReveal } from '../hooks/useAnimations';
import Icon from '../components/Icon';
import { MapPin, Trophy, Settings, Flag, Heart, Eye, Shield, Star, Gem, Users, ArrowRight, Target, Lightbulb, CheckCircle2, ChevronDown, Building2, Calendar, Wrench, Award, TrendingUp, Handshake, Quote, Play } from 'lucide-react';
import { Link } from 'react-router-dom';

/* ═══ DATA ═══ */
const historia = [
  { year: '1960', title: 'Los Primeros Pasos', text: 'Nace como una pequeña venta de refacciones en el Estado de México, fundada con valores de honestidad y servicio al cliente.', icon: Building2, color: '#f59e0b', image: '/images/timeline-1960.png' },
  { year: '1987', title: 'Nueva Generación', text: 'La segunda generación toma las riendas del negocio con el sueño de crecer a cinco sucursales y profesionalizar la operación.', icon: Users, color: '#3b82f6', image: '/images/timeline-1987.png' },
  { year: '1990', title: 'Expansión Oriente', text: 'Primera gran expansión con 8 sucursales en la Zona Oriente: Texcoco, Iztacalco, Aeropuerto, Los Reyes, Iztapalapa, Zumpango, Chalco y La Villa.', icon: TrendingUp, color: '#22c55e', image: '/images/timeline-1990.png' },
  { year: '1995', title: 'Adquisición JUJOMA', text: 'Jasma adquiere el Grupo JUJOMA con 16 Centros de Servicio distribuidos estratégicamente en el Distrito Federal y Estado de México.', icon: Handshake, color: '#8b5cf6', image: '/images/timeline-1995.png' },
  { year: '2005', title: 'Expansión Nacional', text: 'Se adquiere Comercial Jiménez de Jalisco (17 patios en Jalisco y Michoacán) y Neumatik de Nuevo León (18 patios con 65+ años en el mercado).', icon: MapPin, color: '#ef4444', image: '/images/timeline-2005.png' },
  { year: '2007', title: 'JASMAN AUTOMOTRIZ', text: 'Fusión de JUJOMA, Comercial Jiménez, Neumatik y Jasma para conformar JASMAN AUTOMOTRIZ S.A. De C.V. como una sola empresa sólida.', icon: Star, color: '#f59e0b', image: '/images/timeline-2007.png' },
  { year: '2009', title: 'Grupo Dinese', text: 'Adquisición de Grupo Dinese con 8 sucursales en León, Irapuato, Salamanca y Guanajuato, consolidando presencia en el Bajío.', icon: Flag, color: '#06b6d4', image: '/images/timeline-2009.png' },
  { year: 'Hoy', title: 'Líder Nacional', text: 'Con más de 80 sucursales en todo México, somos el centro de soluciones automotrices líder del país, sirviendo a millones de familias.', icon: Trophy, color: '#C41E24', image: '/images/timeline-today.png' },
];

const valores = [
  { icon: Heart, title: 'Actitud en el Servicio', text: 'Nuestro personal es seleccionado tomando en cuenta que nuestro principal valor es la atención, servicio y satisfacción del cliente.', color: '#ef4444' },
  { icon: Eye, title: 'Transparencia', text: 'Nos conducimos con plena transparencia y honestidad, ofrecemos a nuestros clientes únicamente aquellos servicios de acuerdo a cada diagnóstico.', color: '#3b82f6' },
  { icon: Shield, title: 'Seguridad', text: 'Nuestro gran valor es garantizar la seguridad de nuestros clientes, por lo que estamos conscientes de la importancia y el cuidado que proporcionamos.', color: '#22c55e' },
  { icon: Star, title: 'Calidad en el Servicio', text: 'Nos preocupamos por proporcionar servicios estandarizados bajo un mismo control de calidad en todas nuestras sucursales.', color: '#f59e0b' },
  { icon: Users, title: 'Lealtad', text: 'Nuestra meta es establecer relaciones de largo plazo con los clientes, promoviendo programas de lealtad creando una cultura de fidelidad mutua.', color: '#8b5cf6' },
  { icon: Gem, title: 'Honestidad', text: 'Quien tiene como valor la honestidad no sólo evita la mentira sino que también su conducta es congruente con lo que dice y piensa.', color: '#06b6d4' },
];

const misionVision = [
  { icon: Target, title: 'Misión', text: 'Ser el centro de soluciones automotrices preferido de los mexicanos, brindando servicios de excelencia con la mejor relación calidad-precio, tecnología de vanguardia y un equipo humano altamente capacitado y comprometido con la satisfacción del cliente.', gradient: `linear-gradient(135deg, ${C.red}, ${C.redLight})` },
  { icon: Lightbulb, title: 'Visión', text: 'Consolidarnos como la red de centros de servicio automotriz más grande, confiable e innovadora de Latinoamérica, siendo referentes en atención al cliente, desarrollo tecnológico y responsabilidad social.', gradient: `linear-gradient(135deg, ${C.navy}, ${C.navyLight})` },
];

const compromisos = [
  { icon: Wrench, title: 'Escaneo de 72 Puntos', text: 'Cada vehículo recibe una revisión diagnóstica integral de 72 puntos sin costo adicional en cualquier servicio.' },
  { icon: Award, title: 'Técnicos Certificados', text: 'Más de 500 técnicos certificados se capacitan constantemente en las últimas tecnologías automotrices.' },
  { icon: Shield, title: 'Garantía por Escrito', text: 'Todos nuestros servicios cuentan con garantía por escrito, para tu total tranquilidad y confianza.' },
  { icon: CheckCircle2, title: 'Equipos de Última Generación', text: 'Invertimos continuamente en tecnología de punta: alineación láser 3D, balanceo electrónico y diagnóstico computarizado.' },
];

const faq = [
  { q: '¿Necesito cita para llevar mi auto?', a: 'No necesitas cita, puedes llegar directamente a cualquiera de nuestras sucursales. Sin embargo, si deseas una atención más rápida, te recomendamos agendar tu cita por WhatsApp o teléfono.' },
  { q: '¿Qué marcas de llantas manejan?', a: 'Somos distribuidores autorizados de Michelin, Bridgestone, Goodyear, Continental, Pirelli, Hankook, BFGoodrich y muchas más. Contamos con el catálogo más completo del mercado.' },
  { q: '¿Sus servicios tienen garantía?', a: 'Sí, absolutamente todos nuestros servicios cuentan con garantía por escrito. Los plazos varían según el tipo de servicio, pero siempre quedarás respaldado.' },
  { q: '¿Atienden flotillas corporativas?', a: 'Sí, tenemos un programa especializado para flotillas con precios preferenciales, gestor dedicado, reportes mensuales y cobertura en nuestras 80+ sucursales a nivel nacional.' },
  { q: '¿Qué formas de pago aceptan?', a: 'Aceptamos efectivo, tarjetas de débito y crédito (Visa, Mastercard, American Express), transferencia bancaria, y vales de servicio empresariales como Edenred.' },
];

/* ═══ COMPONENTS ═══ */

function ParallaxSection({ children, speed = 0.3, bgColor }) {
  const ref = useRef(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const scrolled = -rect.top * speed;
      setOffset(scrolled);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed]);

  return (
    <div ref={ref} style={{ position: 'relative', overflow: 'hidden', background: bgColor }}>
      <div style={{ transform: `translateY(${offset}px)` }}>
        {children}
      </div>
    </div>
  );
}

function StatCard({ number, suffix, label, icon, delay = 0 }) {
  const { ref, count } = useCountUp(number, 2000);
  const [hovered, setHovered] = useState(false);
  return (
    <div ref={ref} style={{
      textAlign: 'center', padding: 32, borderRadius: 24,
      background: hovered ? 'rgba(196,30,36,0.08)' : 'rgba(255,255,255,0.04)',
      border: `1px solid ${hovered ? 'rgba(196,30,36,0.2)' : 'rgba(255,255,255,0.06)'}`,
      backdropFilter: 'blur(12px)',
      transition: 'all 0.5s cubic-bezier(0.16,1,0.3,1)',
      transform: hovered ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)',
      opacity: 0, animation: `slideUp 0.7s ${delay}s cubic-bezier(0.16,1,0.3,1) forwards`,
    }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{
        transition: 'all 0.4s cubic-bezier(0.16,1,0.3,1)',
        transform: hovered ? 'scale(1.15) rotate(-8deg)' : 'scale(1) rotate(0)',
        marginBottom: 12,
      }}>{icon}</div>
      <div style={{
        fontFamily: F.heading, fontWeight: 900,
        fontSize: 'clamp(2.2rem, 4.5vw, 3.2rem)', color: C.redLight,
        lineHeight: 1,
      }}>{count}{suffix}</div>
      <div style={{
        fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 8,
        fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase',
      }}>{label}</div>
    </div>
  );
}

function TimelineItem({ item, index, isActive, onClick }) {
  const IconComp = item.icon;
  return (
    <div
      onClick={onClick}
      style={{
        position: 'relative', paddingLeft: 56, marginBottom: 8,
        cursor: 'pointer',
        opacity: 0, animation: `slideUp 0.6s ${0.1 * index}s cubic-bezier(0.16,1,0.3,1) forwards`,
      }}
    >
      {/* Connector line */}
      {index < historia.length - 1 && (
        <div style={{
          position: 'absolute', left: 23, top: 48, bottom: -8, width: 2,
          background: isActive ? `linear-gradient(180deg, ${item.color}, ${item.color}20)` : C.border,
          transition: 'background 0.5s',
        }} />
      )}
      {/* Icon node */}
      <div style={{
        position: 'absolute', left: 4, top: 4,
        width: 40, height: 40, borderRadius: 14,
        background: isActive ? `${item.color}20` : 'transparent',
        border: `2px solid ${isActive ? item.color : C.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.5s cubic-bezier(0.16,1,0.3,1)',
        transform: isActive ? 'scale(1.1)' : 'scale(1)',
        boxShadow: isActive ? `0 0 0 6px ${item.color}15` : 'none',
      }}>
        <IconComp size={18} color={isActive ? item.color : C.gray} style={{ transition: 'color 0.3s' }} />
      </div>
      {/* Content card */}
      <div style={{
        padding: '20px 24px', borderRadius: 20,
        background: isActive ? C.white : 'transparent',
        border: `1px solid ${isActive ? `${item.color}25` : 'transparent'}`,
        boxShadow: isActive ? `0 8px 32px rgba(0,0,0,0.06), 0 2px 8px ${item.color}10` : 'none',
        transition: 'all 0.5s cubic-bezier(0.16,1,0.3,1)',
        transform: isActive ? 'translateX(4px)' : 'translateX(0)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
          <span style={{
            fontFamily: F.heading, fontWeight: 800, fontSize: 15,
            color: isActive ? item.color : C.gray,
            padding: '3px 12px', borderRadius: 8,
            background: isActive ? `${item.color}10` : 'transparent',
            transition: 'all 0.3s',
          }}>{item.year}</span>
          <span style={{
            fontFamily: F.heading, fontWeight: 700, fontSize: 16,
            color: isActive ? C.navy : C.gray,
            transition: 'color 0.3s',
          }}>{item.title}</span>
        </div>
        <p style={{
          fontSize: 14, color: C.gray, lineHeight: 1.75,
          maxHeight: isActive ? 200 : 0, overflow: 'hidden',
          opacity: isActive ? 1 : 0,
          transition: 'all 0.5s cubic-bezier(0.16,1,0.3,1)',
          marginTop: isActive ? 8 : 0,
        }}>{item.text}</p>
      </div>
    </div>
  );
}

function ValorCard({ valor, index, isActive, onHover }) {
  const IconComp = valor.icon;
  return (
    <div
      onMouseEnter={() => onHover(index)}
      onMouseLeave={() => onHover(null)}
      style={{
        padding: 32, borderRadius: 24,
        background: isActive ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.02)',
        border: `1px solid ${isActive ? `${valor.color}50` : 'rgba(255,255,255,0.06)'}`,
        backdropFilter: 'blur(12px)', cursor: 'default',
        transition: 'all 0.5s cubic-bezier(0.16,1,0.3,1)',
        transform: isActive ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)',
        opacity: 0, animation: `slideUp 0.6s ${0.08 * index}s cubic-bezier(0.16,1,0.3,1) forwards`,
        position: 'relative', overflow: 'hidden',
      }}
    >
      {/* Glow effect */}
      {isActive && (
        <div style={{
          position: 'absolute', top: -60, right: -60, width: 160, height: 160,
          borderRadius: '50%', background: `radial-gradient(circle, ${valor.color}15, transparent)`,
          pointerEvents: 'none', transition: 'opacity 0.5s',
        }} />
      )}
      <div style={{
        width: 56, height: 56, borderRadius: 18,
        background: `${valor.color}15`, border: `1px solid ${valor.color}30`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20,
        transition: 'all 0.5s cubic-bezier(0.16,1,0.3,1)',
        transform: isActive ? 'scale(1.15) rotate(-6deg)' : 'scale(1) rotate(0)',
        boxShadow: isActive ? `0 8px 24px ${valor.color}20` : 'none',
      }}>
        <IconComp size={26} color={valor.color} />
      </div>
      <h3 style={{
        fontFamily: F.heading, fontWeight: 700, fontSize: 18, color: C.white, marginBottom: 12,
        transition: 'transform 0.3s', transform: isActive ? 'translateX(4px)' : 'translateX(0)',
      }}>{valor.title}</h3>
      <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', lineHeight: 1.8 }}>{valor.text}</p>
      {/* Colored bottom line */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 3,
        background: isActive ? `linear-gradient(90deg, ${valor.color}, transparent)` : 'transparent',
        transition: 'background 0.5s',
      }} />
    </div>
  );
}

function FAQItem({ item, index, isOpen, onToggle }) {
  return (
    <div style={{
      borderRadius: 18,
      background: isOpen ? 'rgba(196,30,36,0.04)' : C.white,
      border: `1px solid ${isOpen ? 'rgba(196,30,36,0.15)' : C.border}`,
      transition: 'all 0.4s cubic-bezier(0.16,1,0.3,1)',
      marginBottom: 12,
      overflow: 'hidden',
      opacity: 0, animation: `slideUp 0.5s ${0.08 * index}s cubic-bezier(0.16,1,0.3,1) forwards`,
    }}>
      <button
        onClick={onToggle}
        style={{
          width: '100%', padding: '20px 24px', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', gap: 16, cursor: 'pointer',
          background: 'none', border: 'none', textAlign: 'left',
        }}
      >
        <span style={{
          fontFamily: F.heading, fontWeight: 600, fontSize: 15, color: C.navy,
        }}>{item.q}</span>
        <ChevronDown size={18} color={C.red} style={{
          transition: 'transform 0.4s cubic-bezier(0.16,1,0.3,1)',
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0)',
          flexShrink: 0,
        }} />
      </button>
      <div style={{
        maxHeight: isOpen ? 300 : 0, overflow: 'hidden',
        transition: 'max-height 0.5s cubic-bezier(0.16,1,0.3,1)',
      }}>
        <p style={{
          padding: '0 24px 20px', fontSize: 14, color: C.gray, lineHeight: 1.8,
        }}>{item.a}</p>
      </div>
    </div>
  );
}

/* ═══ MAIN PAGE ═══ */
export default function NosotrosPage() {
  const [activeValor, setActiveValor] = useState(null);
  const [activeTimeline, setActiveTimeline] = useState(0);
  const [openFaq, setOpenFaq] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouse = (e) => {
      setMousePos({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    };
    window.addEventListener('mousemove', handleMouse, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);

  return (
    <>
      <PageHero
        tag="CONÓCENOS"
        title="Más de 60 años"
        highlight="cuidando de ti y tu auto"
        subtitle="Una empresa 100% Mexicana que comenzó en 1960 y hoy es la red de centros de soluciones automotrices más grande del país."
        breadcrumbs={[{ label: 'Nosotros' }]}
        image="/images/nosotros-hero.png"
      />

      {/* ═══ Misión y Visión ═══ */}
      <section style={{ padding: 'clamp(4rem, 8vw, 7rem) 1.5rem', background: C.light, position: 'relative', overflow: 'hidden' }}>
        {/* Decorative floating element */}
        <div style={{
          position: 'absolute', top: '10%', right: '5%', width: 300, height: 300,
          borderRadius: '50%', border: '1px solid rgba(196,30,36,0.06)',
          transform: `translate(${mousePos.x * 20}px, ${mousePos.y * 20}px)`,
          transition: 'transform 0.8s ease-out', pointerEvents: 'none',
        }} />
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 18px', borderRadius: 9999,
              background: 'rgba(196,30,36,0.08)', color: C.red,
              fontFamily: F.heading, fontWeight: 600, fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase',
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.red, animation: 'pulseGlow 2s infinite' }} />
              NUESTRA ESENCIA
            </span>
            <h2 style={{
              fontFamily: F.heading, fontWeight: 800, fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
              color: C.navy, lineHeight: 1.15, marginTop: 14,
            }}>
              Lo que nos mueve{' '}
              <span className="animated-gradient" style={{
                background: `linear-gradient(135deg, ${C.red}, ${C.redLight}, ${C.red})`,
                backgroundSize: '200% 200%', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>cada día</span>
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))', gap: 24 }}>
            {misionVision.map((mv, i) => {
              const IconComp = mv.icon;
              return (
                <div key={i} className="card-hover" style={{
                  padding: 40, borderRadius: 28, background: C.white,
                  border: `1px solid ${C.border}`, position: 'relative', overflow: 'hidden',
                  opacity: 0, animation: `slideUp 0.7s ${0.2 * i}s cubic-bezier(0.16,1,0.3,1) forwards`,
                }}>
                  {/* Top gradient line */}
                  <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, height: 4,
                    background: mv.gradient, borderRadius: '28px 28px 0 0',
                  }} />
                  <div style={{
                    width: 64, height: 64, borderRadius: 20,
                    background: mv.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: 24, boxShadow: `0 8px 32px ${i === 0 ? 'rgba(196,30,36,0.25)' : 'rgba(26,31,54,0.25)'}`,
                  }}>
                    <IconComp size={28} color={C.white} />
                  </div>
                  <h3 style={{
                    fontFamily: F.heading, fontWeight: 800, fontSize: 22, color: C.navy, marginBottom: 14,
                  }}>{mv.title}</h3>
                  <p style={{
                    fontSize: 15, color: C.gray, lineHeight: 1.85,
                  }}>{mv.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ Historia — Interactive Timeline ═══ */}
      <section style={{ padding: 'clamp(4rem, 8vw, 7rem) 1.5rem', background: C.white }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 64, alignItems: 'start' }}>
            {/* Left: header + image */}
            <div style={{ position: 'sticky', top: 120 }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 18px', borderRadius: 9999,
                background: 'rgba(196,30,36,0.08)', color: C.red,
                fontFamily: F.heading, fontWeight: 600, fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 20,
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.red }} />
                NUESTRA HISTORIA
              </span>
              <h2 style={{
                fontFamily: F.heading, fontWeight: 800, fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
                color: C.navy, lineHeight: 1.2, marginBottom: 20,
              }}>
                De una refaccionaria a{' '}
                <span style={{ color: C.red }}>líder nacional</span>
              </h2>
              <p style={{ fontSize: 16, color: C.gray, lineHeight: 1.85, marginBottom: 32 }}>
                Somos una empresa orgullosamente 100% Mexicana que nació en 1960 mediante la venta de refacciones. Lo que comenzó como un modesto negocio familiar se convertiría en la red más grande del país.
              </p>
              {/* Active item image card */}
              <div style={{
                borderRadius: 24, overflow: 'hidden', position: 'relative',
                border: `1px solid ${C.border}`,
                boxShadow: '0 20px 60px rgba(0,0,0,0.08)',
              }}>
                <div style={{
                  height: 280, position: 'relative', overflow: 'hidden',
                }}>
                  {/* Actual image */}
                  <img
                    key={activeTimeline}
                    src={historia[activeTimeline].image}
                    alt={historia[activeTimeline].title}
                    style={{
                      width: '100%', height: '100%', objectFit: 'cover',
                      animation: 'fadeIn 0.5s ease-out',
                    }}
                  />
                  {/* Color overlay */}
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: `linear-gradient(135deg, ${historia[activeTimeline].color}30, transparent 60%)`,
                    transition: 'background 0.6s',
                  }} />
                  {/* Year badge */}
                  <div style={{
                    position: 'absolute', top: 16, left: 16,
                    padding: '6px 16px', borderRadius: 12,
                    background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(12px)',
                    fontFamily: F.heading, fontWeight: 800, fontSize: 18, color: C.white,
                    letterSpacing: '0.02em',
                  }}>{historia[activeTimeline].year}</div>
                  {/* Floating icon */}
                  <div style={{
                    position: 'absolute', bottom: 16, right: 16,
                    width: 48, height: 48, borderRadius: 16,
                    background: 'rgba(255,255,255,0.95)', boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    animation: 'float 3s ease-in-out infinite',
                  }}>
                    {(() => { const I = historia[activeTimeline].icon; return <I size={22} color={historia[activeTimeline].color} />; })()}
                  </div>
                </div>
                <div style={{ padding: '20px 24px', background: C.white }}>
                  <div style={{ fontFamily: F.heading, fontWeight: 700, fontSize: 16, color: C.navy, marginBottom: 4 }}>
                    {historia[activeTimeline].title}
                  </div>
                  <div style={{ fontSize: 13, color: C.gray }}>
                    {historia[activeTimeline].year === 'Hoy' ? 'Presente' : `Año ${historia[activeTimeline].year}`} · Hito #{activeTimeline + 1} de {historia.length}
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Interactive timeline */}
            <div>
              {historia.map((h, i) => (
                <TimelineItem
                  key={i}
                  item={h}
                  index={i}
                  isActive={activeTimeline === i}
                  onClick={() => setActiveTimeline(i)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Nuestro Compromiso ═══ */}
      <section style={{
        padding: 'clamp(4rem, 8vw, 7rem) 1.5rem',
        background: `linear-gradient(135deg, ${C.light} 0%, rgba(196,30,36,0.03) 50%, ${C.light} 100%)`,
        position: 'relative',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 18px', borderRadius: 9999,
              background: 'rgba(196,30,36,0.08)', color: C.red,
              fontFamily: F.heading, fontWeight: 600, fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase',
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.red, animation: 'pulseGlow 2s infinite' }} />
              NUESTRO COMPROMISO
            </span>
            <h2 style={{
              fontFamily: F.heading, fontWeight: 800, fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
              color: C.navy, lineHeight: 1.15, marginTop: 14,
            }}>
              ¿Por qué elegir{' '}
              <span className="animated-gradient" style={{
                background: `linear-gradient(135deg, ${C.red}, ${C.redLight}, ${C.red})`,
                backgroundSize: '200% 200%', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>Jasman?</span>
            </h2>
            <p style={{ fontSize: 16, color: C.gray, marginTop: 14, maxWidth: 600, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.75 }}>
              Más allá de nuestros servicios, lo que nos distingue es nuestra obsesión por la excelencia y la seguridad de tu familia.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
            {compromisos.map((c, i) => {
              const IconComp = c.icon;
              return (
                <div key={i} className="card-hover" style={{
                  padding: 32, borderRadius: 24, background: C.white,
                  border: `1px solid ${C.border}`, position: 'relative', overflow: 'hidden',
                  opacity: 0, animation: `slideUp 0.6s ${0.12 * i}s cubic-bezier(0.16,1,0.3,1) forwards`,
                }}>
                  {/* Step number */}
                  <div style={{
                    position: 'absolute', top: 16, right: 20,
                    fontFamily: F.heading, fontWeight: 900, fontSize: 48,
                    color: 'rgba(196,30,36,0.04)', lineHeight: 1,
                  }}>0{i + 1}</div>
                  <div style={{
                    width: 52, height: 52, borderRadius: 16,
                    background: 'rgba(196,30,36,0.06)', border: '1px solid rgba(196,30,36,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20,
                  }}>
                    <IconComp size={24} color={C.red} />
                  </div>
                  <h3 style={{
                    fontFamily: F.heading, fontWeight: 700, fontSize: 17, color: C.navy, marginBottom: 10,
                  }}>{c.title}</h3>
                  <p style={{ fontSize: 14, color: C.gray, lineHeight: 1.75 }}>{c.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ Valores — Interactive Cards ═══ */}
      <section style={{ padding: 'clamp(4rem, 8vw, 7rem) 1.5rem', background: C.navy, position: 'relative', overflow: 'hidden' }}>
        {/* Decorative elements */}
        <div style={{
          position: 'absolute', top: -200, right: -200, width: 500, height: 500,
          borderRadius: '50%', border: '1px solid rgba(196,30,36,0.06)', pointerEvents: 'none',
          transform: `translate(${mousePos.x * -15}px, ${mousePos.y * -15}px)`,
          transition: 'transform 1s ease-out',
        }} />
        <div style={{
          position: 'absolute', bottom: -150, left: -150, width: 400, height: 400,
          borderRadius: '50%', border: '1px solid rgba(255,255,255,0.03)', pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 18px', borderRadius: 9999,
              background: 'rgba(196,30,36,0.12)', color: C.redLight,
              fontFamily: F.heading, fontWeight: 600, fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 20,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.red, animation: 'pulseGlow 2s infinite' }} />
              NUESTROS VALORES
            </span>
            <h2 style={{ fontFamily: F.heading, fontWeight: 800, fontSize: 'clamp(2rem, 5vw, 3rem)', color: C.white, lineHeight: 1.12 }}>
              Lo que nos{' '}
              <span className="animated-gradient" style={{
                background: `linear-gradient(135deg, ${C.redLight}, ${C.amber}, ${C.redLight})`,
                backgroundSize: '200% 200%', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>define</span>
            </h2>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.35)', marginTop: 14, maxWidth: 500, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.75 }}>
              Cada servicio que realizamos está guiado por estos seis principios fundamentales.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
            {valores.map((v, i) => (
              <ValorCard
                key={i}
                valor={v}
                index={i}
                isActive={activeValor === i}
                onHover={setActiveValor}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Stats ═══ */}
      <section style={{ padding: 'clamp(3rem, 6vw, 5rem) 1.5rem', background: C.navy, borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{
              fontFamily: F.heading, fontWeight: 800, fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)',
              color: C.white, lineHeight: 1.2,
            }}>
              Cifras que hablan por{' '}
              <span style={{ color: C.redLight }}>nosotros</span>
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
            <StatCard number={80} suffix="+" label="Sucursales" delay={0} icon={<MapPin size={30} color={C.redLight} />} />
            <StatCard number={60} suffix="+" label="Años de Experiencia" delay={0.1} icon={<Calendar size={30} color={C.redLight} />} />
            <StatCard number={1} suffix="M+" label="Servicios Realizados" delay={0.2} icon={<Settings size={30} color={C.redLight} />} />
            <StatCard number={500} suffix="+" label="Técnicos Certificados" delay={0.3} icon={<Award size={30} color={C.redLight} />} />
          </div>
        </div>
      </section>

      {/* ═══ Preguntas Frecuentes ═══ */}
      <section style={{ padding: 'clamp(4rem, 8vw, 7rem) 1.5rem', background: C.white }}>
        <div style={{ maxWidth: 780, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 18px', borderRadius: 9999,
              background: 'rgba(196,30,36,0.08)', color: C.red,
              fontFamily: F.heading, fontWeight: 600, fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase',
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.red, animation: 'pulseGlow 2s infinite' }} />
              FAQ
            </span>
            <h2 style={{
              fontFamily: F.heading, fontWeight: 800, fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
              color: C.navy, lineHeight: 1.15, marginTop: 14,
            }}>
              Preguntas{' '}
              <span style={{ color: C.red }}>frecuentes</span>
            </h2>
            <p style={{
              fontSize: 16, color: C.gray, marginTop: 12, lineHeight: 1.75,
            }}>
              Todo lo que necesitas saber sobre nuestros servicios
            </p>
          </div>

          {faq.map((f, i) => (
            <FAQItem
              key={i}
              item={f}
              index={i}
              isOpen={openFaq === i}
              onToggle={() => setOpenFaq(openFaq === i ? null : i)}
            />
          ))}
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section style={{
        padding: 'clamp(4rem, 8vw, 6rem) 1.5rem',
        background: `linear-gradient(135deg, ${C.navy} 0%, ${C.navyLight} 50%, rgba(196,30,36,0.15) 100%)`,
        textAlign: 'center', position: 'relative', overflow: 'hidden',
      }}>
        {/* Animated rings */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%', width: 400, height: 400,
          transform: 'translate(-50%, -50%)', borderRadius: '50%',
          border: '1px solid rgba(196,30,36,0.08)', pointerEvents: 'none',
          animation: 'pulseGlow 4s infinite',
        }} />
        <div style={{
          position: 'absolute', top: '50%', left: '50%', width: 600, height: 600,
          transform: 'translate(-50%, -50%)', borderRadius: '50%',
          border: '1px solid rgba(196,30,36,0.04)', pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: 650, margin: '0 auto', position: 'relative' }}>
          <h2 style={{
            fontFamily: F.heading, fontWeight: 800, fontSize: 'clamp(1.8rem, 4.5vw, 2.8rem)',
            color: C.white, marginBottom: 16, lineHeight: 1.15,
          }}>
            ¿Listo para conocernos{' '}
            <span className="animated-gradient" style={{
              background: `linear-gradient(135deg, ${C.redLight}, ${C.amber}, ${C.redLight})`,
              backgroundSize: '200% 200%', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>en persona?</span>
          </h2>
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.5)', lineHeight: 1.75, marginBottom: 36 }}>
            Visítanos en cualquiera de nuestras 80+ sucursales a nivel nacional o contáctanos directamente.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/sucursales" className="glow-btn" style={{
              padding: '16px 36px', borderRadius: 16, background: `linear-gradient(135deg, ${C.red}, ${C.redLight})`,
              color: C.white, fontFamily: F.heading, fontWeight: 700, fontSize: 15,
              display: 'inline-flex', alignItems: 'center', gap: 8,
              boxShadow: '0 8px 32px rgba(196,30,36,0.3)',
            }}>Busca tu Sucursal <ArrowRight size={16} /></Link>
            <Link to="/contacto" style={{
              padding: '16px 36px', borderRadius: 16,
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)',
              color: C.white, fontFamily: F.heading, fontWeight: 600, fontSize: 15,
              display: 'inline-flex', alignItems: 'center', gap: 8,
              backdropFilter: 'blur(8px)', transition: 'all 0.3s',
            }}>Contáctanos</Link>
            <Link to="/servicios" style={{
              padding: '16px 36px', borderRadius: 16,
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)',
              color: C.white, fontFamily: F.heading, fontWeight: 600, fontSize: 15,
              backdropFilter: 'blur(8px)', transition: 'all 0.3s',
            }}>Ver Servicios</Link>
          </div>
        </div>
      </section>
    </>
  );
}
