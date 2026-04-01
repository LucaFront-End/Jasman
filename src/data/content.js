/* ─── Placeholder images via CSS ─── */
/* We use Unsplash for real automotive placeholders */

export const heroContent = {
  tag: 'CENTRO DE SOLUCIONES AUTOMOTRICES',
  title: 'Cuidamos tu auto,',
  titleHighlight: 'cuidamos de ti.',
  subtitle: 'Con más de 60 años de experiencia y una red de +80 sucursales, somos tu mejor opción en servicios automotrices en todo México.',
  ctaPrimary: 'Agenda tu Cita',
  ctaSecondary: 'Busca tu Sucursal',
  stats: [
    { number: 80, suffix: '+', label: 'Sucursales' },
    { number: 60, suffix: '+', label: 'Años de Experiencia' },
    { number: 1, suffix: 'M+', label: 'Servicios Realizados' },
  ],
  // Free video placeholder - automotive workshop ambiance
  videoBg: 'https://videos.pexels.com/video-files/3964793/3964793-uhd_2560_1440_25fps.mp4',
  videoPoster: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1920&q=80',
};

export const brandsContent = {
  title: 'Marcas que confían en nosotros',
  brands: [
    'Michelin', 'Bridgestone', 'Goodyear', 'Continental',
    'Pirelli', 'Hankook', 'BFGoodrich', 'Firestone',
    'Yokohama', 'Dunlop', 'Toyo Tires', 'Kumho',
  ],
};

export const servicesContent = {
  tag: 'NUESTROS SERVICIOS',
  title: 'Soluciones integrales',
  titleHighlight: 'para tu vehículo',
  subtitle: 'Ofrecemos un servicio completo para el mantenimiento y cuidado de tu auto con la mejor tecnología y personal certificado.',
  services: [
    {
      icon: 'circle-dot',
      title: 'Llantas',
      description: 'Instalación, reparación y venta de las mejores marcas de llantas del mercado.',
      image: '/images/service-tires.png',
    },
    {
      icon: 'settings',
      title: 'Alineación y Balanceo',
      description: 'Alineación computarizada de última generación para un manejo seguro y preciso.',
      image: '/images/service-alignment.png',
    },
    {
      icon: 'disc',
      title: 'Frenos',
      description: 'Diagnóstico, reparación y cambio de sistema de frenos con garantía total.',
      image: '/images/service-brakes.png',
    },
    {
      icon: 'car',
      title: 'Suspensión',
      description: 'Revisión y reparación completa del sistema de suspensión de tu vehículo.',
      image: '/images/service-suspension.png',
    },
    {
      icon: 'droplets',
      title: 'Cambio de Aceite',
      description: 'Aceites sintéticos y convencionales de las mejores marcas para tu motor.',
      image: '/images/service-oil.png',
    },
    {
      icon: 'battery-charging',
      title: 'Acumuladores',
      description: 'Diagnóstico eléctrico y cambio de baterías con la mejor tecnología disponible.',
      image: '/images/service-battery.png',
    },
  ],
};

export const aboutContent = {
  tag: '¿POR QUÉ JASMAN?',
  title: 'Más de 60 años',
  titleHighlight: 'cuidando de ti y tu auto',
  description: 'Desde los años 60, Jasman se ha consolidado como la cadena de servicios automotrices más confiable de México. Lo que comenzó como una pequeña venta de refacciones hoy es una red de más de 80 sucursales en las principales ciudades del país.',
  features: [
    { icon: 'award', title: 'Técnicos Certificados', text: 'Personal capacitado y certificado en las últimas tecnologías automotrices.' },
    { icon: 'shield-check', title: 'Garantía Total', text: 'Todos nuestros servicios cuentan con garantía por escrito para tu tranquilidad.' },
    { icon: 'flag', title: '100% Mexicanos', text: 'Orgullosamente mexicanos, con presencia en las principales ciudades del país.' },
    { icon: 'zap', title: 'Tecnología Avanzada', text: 'Equipos de última generación para diagnósticos precisos y reparaciones efectivas.' },
  ],
  image: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&q=80',
};

export const promosContent = {
  tag: 'PROMOCIONES',
  title: 'Ofertas especiales',
  titleHighlight: 'para ti',
  promos: [
    {
      title: 'Cambio de Aceite',
      subtitle: 'Sintético completo',
      price: '$899',
      originalPrice: '$1,299',
      badge: '-30%',
      features: ['Aceite sintético 5W-30', 'Filtro de aceite nuevo', 'Revisión de niveles', 'Check-up de 21 puntos'],
      image: '/images/promo-oil-change.png',
    },
    {
      title: 'Alineación + Balanceo',
      subtitle: 'Las 4 ruedas',
      price: '$599',
      originalPrice: '$899',
      badge: 'POPULAR',
      features: ['Alineación computarizada', 'Balanceo 4 ruedas', 'Rotación de llantas', 'Revisión de suspensión'],
      image: '/images/promo-alignment.png',
    },
    {
      title: 'Check-Up Completo',
      subtitle: 'Revisión integral',
      price: '$499',
      originalPrice: '$799',
      badge: 'NUEVO',
      features: ['Diagnóstico completo', 'Revisión de frenos', 'Sistema eléctrico', 'Reporte detallado'],
      image: '/images/promo-checkup.png',
    },
  ],
};

export const locationsContent = {
  tag: 'SUCURSALES',
  title: 'Encuentra tu sucursal',
  titleHighlight: 'más cercana',
  subtitle: 'Con más de 80 sucursales distribuidas en las principales ciudades de México, siempre hay un Jasman cerca de ti.',
  featured: [
    { city: 'CDMX', branches: 25, rating: 4.3 },
    { city: 'Monterrey', branches: 8, rating: 4.4 },
    { city: 'Guadalajara', branches: 6, rating: 4.5 },
    { city: 'Puebla', branches: 5, rating: 4.2 },
    { city: 'Querétaro', branches: 4, rating: 4.6 },
    { city: 'León', branches: 3, rating: 4.3 },
  ],
  cta: 'Ver Todas las Sucursales',
  mapImage: '/images/brands-trust.png',
};

export const testimonialsContent = {
  tag: 'TESTIMONIOS',
  title: 'Lo que dicen',
  titleHighlight: 'nuestros clientes',
  reviews: [
    {
      name: 'Oscar H.',
      location: 'CDMX — Sucursal Polanco',
      rating: 5,
      text: 'Excelente atención, tratan a tu auto como si fuera el suyo. Lo dejan como nuevo. Muy recomendable.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
    },
    {
      name: 'María G.',
      location: 'Monterrey — Sucursal San Pedro',
      rating: 5,
      text: 'Llevo 3 años trayendo mi auto aquí y jamás me han fallado. Los precios son justos y el servicio es rápido.',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80',
    },
    {
      name: 'Roberto L.',
      location: 'Guadalajara — Sucursal Chapultepec',
      rating: 5,
      text: 'Me cambiaron las 4 llantas y quedaron perfectas. La alineación computarizada dejó el auto como nuevo.',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80',
    },
    {
      name: 'Ana P.',
      location: 'CDMX — Sucursal Ajusco',
      rating: 4,
      text: 'Muy buenos precios en llantas y el personal es muy amable. Recomendado al 100%.',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80',
    },
    {
      name: 'Carlos M.',
      location: 'Querétaro — Sucursal Juriquilla',
      rating: 5,
      text: 'Increíble el servicio de frenos. Me explicaron todo el proceso y quedé super tranquilo con la garantía por escrito.',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80',
    },
    {
      name: 'Laura S.',
      location: 'CDMX — Sucursal Santa Fe',
      rating: 5,
      text: 'Agendé en línea y todo fue puntual. El check-up de 21 puntos me dio mucha confianza. Volveré siempre.',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&q=80',
    },
    {
      name: 'Fernando R.',
      location: 'Puebla — Sucursal Centro',
      rating: 5,
      text: 'El mejor taller de Puebla, sin duda. Profesionales y honestos. Mi familia entera viene aquí desde hace años.',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&q=80',
    },
    {
      name: 'Daniela V.',
      location: 'Monterrey — Sucursal Valle',
      rating: 5,
      text: 'Cambié las llantas de mi camioneta y el precio fue mucho mejor que la competencia. Excelente calidad.',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80',
    },
    {
      name: 'Jorge T.',
      location: 'León — Sucursal Centro',
      rating: 4,
      text: 'Servicio rápido, instalaciones limpias y personal capacitado. 100% recomendados para cualquier servicio automotriz.',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&q=80',
    },
    {
      name: 'Patricia N.',
      location: 'Mérida — Sucursal Norte',
      rating: 5,
      text: 'Me encanta que tienen app para agendar. Todo transparente, me mandan fotos del avance. Súper modernos.',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&q=80',
    },
    {
      name: 'Eduardo K.',
      location: 'Toluca — Sucursal Metepec',
      rating: 5,
      text: 'Llevé mi auto por un ruido extraño y lo diagnosticaron al instante. Reparación rápida y precio justo. Totalmente satisfecho.',
      avatar: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=100&q=80',
    },
    {
      name: 'Sofía M.',
      location: 'Guadalajara — Sucursal Tlaquepaque',
      rating: 5,
      text: 'Primera vez que vengo y ya tengo mi próxima cita agendada. El trato es de primera y las instalaciones impecables.',
      avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&q=80',
    },
  ],
};

export const ctaContent = {
  title: '¿Listo para darle a tu auto',
  titleHighlight: 'el mejor servicio?',
  subtitle: 'Agenda tu cita en línea o visítanos en la sucursal más cercana. Nuestro equipo de expertos te espera.',
  ctaPrimary: 'Agenda tu Cita',
  ctaSecondary: 'Llámanos: 800 8010 290',
  phone: '800 8010 290',
};

export const footerContent = {
  description: 'Talleres Automotrices Jasman, mucho más que un taller. Con una red de más de 80 sucursales en las ciudades principales del país.',
  links: {
    company: [
      { label: 'Nosotros', href: '/nosotros' },
      { label: 'Servicios', href: '/servicios' },
      { label: 'Sucursales', href: '/sucursales' },
      { label: 'Flotillas', href: '/flotillas' },
      { label: 'Bolsa de Trabajo', href: '/bolsa-de-trabajo' },
      { label: 'Proveedores', href: '/proveedores' },
      { label: 'Contacto', href: '/contacto' },
    ],
    legal: [
      { label: 'Aviso de Privacidad', href: 'https://www.jasman.com.mx/avisodeprivacidad' },
      { label: 'Términos y Condiciones', href: 'https://www.jasman.com.mx/términosycondciones' },
      { label: 'Facturación', href: 'https://www.jasman.com.mx/facturación' },
      { label: 'Jasman Te Escucha', href: 'https://www.jasman.com.mx/jasman-te-escucha' },
    ],
  },
  contact: {
    phone: '800 8010 290',
    email: 'jasmanteescucha@jasman.com.mx',
    whatsapp: '+52 1 55 7933 7994',
  },
  social: {
    facebook: '#',
    instagram: '#',
    tiktok: '#',
  },
};

export const navLinks = [
  { label: 'Nosotros', href: '/nosotros' },
  { label: 'Servicios', href: '/servicios' },
  { label: 'Sucursales', href: '/sucursales' },
  { label: 'Flotillas', href: '/flotillas' },
  { label: 'Llantas', href: 'https://llantastic.com', external: true },
  { label: 'Contacto', href: '/contacto' },
];
