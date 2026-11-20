import { servicios, paquetes } from './serviciosData';
import { sucursales } from './sucursalesData';

export const CANONICAL_ORIGIN = 'https://www.jasman.com.mx';

export const TALLER_ROUTE_SEO = {
  '/': {
    title: 'JASMAN | Taller Mecánico Automotriz #1 de México',
    description:
      'Conoce JASMAN, Taller Mecánico Automotriz #1 de México. Servicios de alineación y balanceo, cambio de aceite y mantenimiento para tu auto.',
  },
  '/nosotros': {
    title: 'Nosotros | JASMAN, Taller Mecánico Automotriz #1',
    description:
      'Conoce la experiencia, compromiso y servicio de JASMAN, Taller Mecánico Automotriz #1 de México. Cuidamos tu vehículo con atención profesional.',
  },
  '/servicios': {
    title: 'Servicios de Taller Mecánico Automotriz | JASMAN',
    description:
      'En JASMAN, Taller Mecánico Automotriz #1 de México, encuentra alineación y balanceo, cambio de aceite y servicios de mantenimiento automotriz.',
  },
  '/sucursales': {
    title: 'Sucursales JASMAN | Taller Mecánico Automotriz',
    description:
      'Encuentra tu sucursal JASMAN más cercana. Visita nuestro Taller Mecánico Automotriz #1 de México para alineación, balanceo y cambio de aceite.',
  },
  '/flotillas': {
    title: 'Mantenimiento de Flotillas | JASMAN Automotriz',
    description:
      'JASMAN ofrece servicios de mantenimiento para flotillas empresariales: cambio de aceite, alineación y balanceo. Solicita atención para tu empresa.',
  },
  '/contacto': {
    title: 'Contacto JASMAN | Taller Mecánico Automotriz',
    description:
      'Contacta a JASMAN, Taller Mecánico Automotriz #1 de México. Resuelve dudas sobre servicios, sucursales, alineación y balanceo o cambio de aceite.',
  },
  '/bolsa-de-trabajo': {
    title: 'Bolsa de Trabajo JASMAN | Vacantes Automotrices',
    description:
      'Trabaja en JASMAN, Taller Mecánico Automotriz #1 de México. Conoce nuestras oportunidades laborales y desarrolla tu carrera en el sector automotriz.',
  },
  '/proveedores': {
    title: 'Proveedores JASMAN | Alianzas para el Sector Automotriz',
    description:
      '¿Quieres ser proveedor de JASMAN? Conoce cómo establecer contacto comercial con nuestro Taller Mecánico Automotriz #1 de México y crear alianzas.',
  },
};

export const TIENDA_HOME_SEO = {
  title: 'JASMAN TIRES | Tienda de Llantas #1 en México',
  description:
    'Compra llantas para auto, SUV y camioneta en JASMAN TIRES, Tienda de Llantas #1 en México. Explora marcas, medidas y opciones para tu vehículo.',
};

export const TIENDA_CATALOGO_SEO = {
  title: 'Catálogo de Llantas en México | JASMAN TIRES',
  description:
    'Explora el catálogo de JASMAN TIRES, Tienda de Llantas #1 en México. Encuentra llantas por marca, medida o vehículo y elige la opción ideal.',
};

const BRAND_ENTRIES = [
  'Michelin',
  'BFGoodrich',
  'Goodyear',
  'Kelly',
  'Hankook',
  'Laufenn',
  'Pirelli',
  'Firestone',
  'Bridgestone',
  'Euzkadi',
  'Continental',
  'General Tire',
  'Barum',
];

const MODEL_ENTRIES = [
  'Versa',
  'Aveo',
  'March',
  'Jetta',
  'Sentra',
  'Corolla',
  'Civic',
  'Mazda 3',
  'GTI / Cupra',
  'Mustang',
  'CR-V',
  'RAV4',
  'Tiguan',
  'Tahoe',
];

const VEHICLE_TYPE_SEO_ENTRIES = [
  { key: 'AutoTurismo', id: 'Auto', display: 'Auto Turismo', lower: 'auto turismo' },
  { key: 'Auto', id: 'Auto', display: 'Auto Turismo', lower: 'auto turismo' },
  { key: 'Turismo', id: 'Turismo', display: 'Auto Turismo', lower: 'auto turismo' },
  { key: 'Deportivo', id: 'Deportivo', display: 'Deportivo', lower: 'deportivo' },
  { key: 'Camioneta', id: 'Camioneta', display: 'Camioneta', lower: 'camioneta' },
  { key: 'SUV', id: 'SUV', display: 'SUV', lower: 'suv' },
  { key: 'Light Truck', id: 'Light Truck', display: 'Light Truck', lower: 'light truck' },
  { key: 'Van', id: 'Van', display: 'Van', lower: 'van' },
  {
    key: 'Comercial Ligero',
    id: 'Comercial Ligero',
    display: 'Comercial Ligero',
    lower: 'comercial ligero',
  },
];

const MEASURE_LIST = [
  '205/55 R16',
  '185/65 R15',
  '195/65 R15',
  '175/70 R14',
  '185/60 R15',
  '235/75 R15',
  '215/55 R17',
  '245/75 R17',
  '215/45 R17',
  '225/45 R17',
  '195/60 R15',
  '285/45 R21',
];

function normalizeKey(str = '') {
  return String(str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

export function formatSpacedTireMeasure(raw = '') {
  const compact = String(raw || '')
    .toUpperCase()
    .replace(/\s+/g, '')
    .trim();
  const metric = compact.match(/^(\d{3})\/(\d{2})R(\d{2}(?:\.\d)?)$/);
  if (metric) {
    return `${metric[1]}/${metric[2]} R${metric[3]}`;
  }
  return String(raw || '').trim().toUpperCase();
}

export const TIENDA_BRAND_SEO_MAP = new Map(
  BRAND_ENTRIES.map((brandName) => [
    normalizeKey(brandName),
    {
      label: brandName,
      title: `Llantas ${brandName} en México | JASMAN TIRES`,
      description: `Encuentra llantas ${brandName} en JASMAN TIRES, Tienda de Llantas #1 en México. Explora opciones, compara medidas y compra las ideales para tu auto.`,
    },
  ])
);

export const TIENDA_MODEL_SEO_MAP = new Map(
  MODEL_ENTRIES.map((modelName) => [
    normalizeKey(modelName),
    {
      label: modelName,
      title: `Llantas para ${modelName} | JASMAN TIRES México`,
      description: `Busca llantas para ${modelName} en JASMAN TIRES, Tienda de Llantas #1 en México. Compara marcas y medidas compatibles con la versión de tu vehículo.`,
    },
  ])
);

export const TIENDA_VEHICLE_SEO_MAP = new Map(
  VEHICLE_TYPE_SEO_ENTRIES.map((entry) => [
    normalizeKey(entry.key),
    {
      id: entry.id,
      label: entry.display,
      title: `Llantas para ${entry.display} | JASMAN TIRES`,
      description: `Encuentra llantas para ${entry.lower} en JASMAN TIRES, Tienda de Llantas #1 en México. Explora marcas, medidas y opciones según el uso de tu vehículo.`,
    },
  ])
);

export const TIENDA_MEASURE_SEO_MAP = new Map(
  MEASURE_LIST.map((spacedMeasure) => [
    spacedMeasure.replace(/\s+/g, '').toUpperCase(),
    {
      label: spacedMeasure,
      title: `Llantas ${spacedMeasure} en México | JASMAN TIRES`,
      description: `Compra llantas medida ${spacedMeasure} en JASMAN TIRES, Tienda de Llantas #1 en México. Compara opciones por marca y verifica la medida indicada para tu auto.`,
    },
  ])
);

function buildMeasureSeo(rawMeasure = '') {
  const compact = String(rawMeasure || '')
    .toUpperCase()
    .replace(/\s+/g, '')
    .trim();
  if (!compact) return null;

  const exact = TIENDA_MEASURE_SEO_MAP.get(compact);
  if (exact) return exact;

  if (/^\d{3}\/\d{2}R\d{2}(?:\.\d)?$/i.test(compact)) {
    const spaced = formatSpacedTireMeasure(compact);
    return {
      label: spaced,
      title: `Llantas ${spaced} en México | JASMAN TIRES`,
      description: `Compra llantas medida ${spaced} en JASMAN TIRES, Tienda de Llantas #1 en México. Compara opciones por marca y verifica la medida indicada para tu auto.`,
    };
  }

  return null;
}

export function resolveSeoForLocation({
  pathname = '/',
  search = '',
  hostname = '',
} = {}) {
  const cleanPath =
    pathname && pathname !== '/' ? pathname.replace(/\/+$/, '') : '/';

  // Product detail pages manage their own dynamic SEO title, description & canonical
  if (
    cleanPath.startsWith('/llantas/producto/') ||
    cleanPath.startsWith('/landing-tienda-preview/producto/')
  ) {
    return null;
  }

  const lowerHost = String(hostname || '').toLowerCase();
  const isLlantasSubdomain = lowerHost.startsWith('llantas.');

  // Subdomain llantas.jasman.com.mx/ or store landing routes
  if (
    (cleanPath === '/' && isLlantasSubdomain) ||
    cleanPath === '/llantas' ||
    cleanPath === '/landing-tienda-preview' ||
    cleanPath === '/landing-tienda-wix' ||
    cleanPath === '/landing-tienda-preview-copia' ||
    cleanPath === '/landing-tienda-copia' ||
    cleanPath === '/home-tienda-preview'
  ) {
    return {
      ...TIENDA_HOME_SEO,
      canonicalUrl: `${CANONICAL_ORIGIN}/llantas`,
    };
  }

  // Catalog & filtered category/brand/model/measure pages
  if (
    cleanPath === '/llantas/catalogo' ||
    cleanPath === '/landing-tienda-preview/catalogo'
  ) {
    const params = new URLSearchParams(search || '');
    const rawCarModel = params.get('carModel') || '';
    const rawBrand = params.get('brand') || '';
    const rawVehicle = params.get('vehicle') || '';
    const rawMeasure = params.get('measure') || params.get('q') || '';

    const modelHit = rawCarModel
      ? TIENDA_MODEL_SEO_MAP.get(normalizeKey(rawCarModel)) ||
        (normalizeKey(rawCarModel).includes('gti') ||
        normalizeKey(rawCarModel).includes('cupra')
          ? TIENDA_MODEL_SEO_MAP.get('gti / cupra')
          : null)
      : null;
    if (modelHit) {
      return {
        title: modelHit.title,
        description: modelHit.description,
        canonicalUrl: `${CANONICAL_ORIGIN}/llantas/catalogo?carModel=${encodeURIComponent(modelHit.label)}`,
      };
    }

    const brandHit = rawBrand
      ? TIENDA_BRAND_SEO_MAP.get(normalizeKey(rawBrand)) || {
          label: rawBrand.trim(),
          title: `Llantas ${rawBrand.trim()} en México | JASMAN TIRES`,
          description: `Encuentra llantas ${rawBrand.trim()} en JASMAN TIRES, Tienda de Llantas #1 en México. Explora opciones, compara medidas y compra las ideales para tu auto.`,
        }
      : null;
    if (brandHit) {
      return {
        title: brandHit.title,
        description: brandHit.description,
        canonicalUrl: `${CANONICAL_ORIGIN}/llantas/catalogo?brand=${encodeURIComponent(brandHit.label)}`,
      };
    }

    const vehicleHit = rawVehicle
      ? TIENDA_VEHICLE_SEO_MAP.get(normalizeKey(rawVehicle))
      : null;
    if (vehicleHit) {
      return {
        title: vehicleHit.title,
        description: vehicleHit.description,
        canonicalUrl: `${CANONICAL_ORIGIN}/llantas/catalogo?vehicle=${encodeURIComponent(vehicleHit.id)}`,
      };
    }

    const measureHit = buildMeasureSeo(rawMeasure);
    if (measureHit) {
      const compactMeasure = measureHit.label.replace(/\s+/g, '');
      return {
        title: measureHit.title,
        description: measureHit.description,
        canonicalUrl: `${CANONICAL_ORIGIN}/llantas/catalogo?measure=${encodeURIComponent(compactMeasure)}`,
      };
    }

    return {
      ...TIENDA_CATALOGO_SEO,
      canonicalUrl: `${CANONICAL_ORIGIN}/llantas/catalogo`,
    };
  }

  // Account & checkout thank you routes
  if (
    cleanPath === '/llantas/cuenta' ||
    cleanPath === '/landing-tienda-preview/cuenta'
  ) {
    return {
      title: 'Mi Cuenta | JASMAN TIRES México',
      description:
        'Administra tu cuenta, historial de pedidos, dirección de envío y beneficios en JASMAN TIRES, Tienda de Llantas #1 en México.',
      canonicalUrl: `${CANONICAL_ORIGIN}/llantas/cuenta`,
    };
  }

  if (
    cleanPath === '/thank-you' ||
    cleanPath === '/llantas/thank-you' ||
    cleanPath === '/gracias'
  ) {
    return {
      title: 'Confirmación de Compra | JASMAN TIRES México',
      description:
        'Gracias por tu compra en JASMAN TIRES. Consulta el resumen de tu pedido y tiempo estimado de entrega de 3 a 5 días hábiles.',
      canonicalUrl: `${CANONICAL_ORIGIN}/thank-you`,
    };
  }

  // Exact Taller Automotriz route match
  if (TALLER_ROUTE_SEO[cleanPath]) {
    return {
      ...TALLER_ROUTE_SEO[cleanPath],
      canonicalUrl: `${CANONICAL_ORIGIN}${cleanPath === '/' ? '' : cleanPath}`,
    };
  }

  // Service detail route (/servicios/:slug)
  if (cleanPath.startsWith('/servicios/')) {
    const slug = cleanPath.replace('/servicios/', '').trim();
    const match = [...servicios, ...paquetes].find((s) => s.slug === slug);
    if (match) {
      return {
        title: `${match.title} | Servicios JASMAN`,
        description: `${match.description} Agenda tu servicio en JASMAN, Taller Mecánico Automotriz #1 de México.`,
        canonicalUrl: `${CANONICAL_ORIGIN}/servicios/${match.slug}`,
      };
    }
  }

  // Branch detail route (/sucursales/:slug)
  if (cleanPath.startsWith('/sucursales/')) {
    const slug = cleanPath.replace('/sucursales/', '').trim();
    const branch = sucursales.find((s) => s.id === slug);
    if (branch) {
      return {
        title: `Sucursal ${branch.name} | JASMAN Taller Automotriz`,
        description: `Visita JASMAN Sucursal ${branch.name} en ${branch.city}, ${branch.state}. Llantas, alineación, balanceo y mantenimiento automotriz.`,
        canonicalUrl: `${CANONICAL_ORIGIN}/sucursales/${branch.id}`,
      };
    }
  }

  // Alignment promotional fallback
  if (
    cleanPath.includes('alineacion') ||
    cleanPath.includes('alineación')
  ) {
    return {
      title: 'Promoción Alineación y Balanceo | JASMAN Automotriz',
      description:
        'Aprovecha nuestras promociones de alineación y balanceo en sucursales JASMAN participantes. Agenda tu cita en línea hoy mismo.',
      canonicalUrl: `${CANONICAL_ORIGIN}${cleanPath}`,
    };
  }

  return {
    ...TALLER_ROUTE_SEO['/'],
    canonicalUrl: `${CANONICAL_ORIGIN}${cleanPath === '/' ? '' : cleanPath}`,
  };
}
