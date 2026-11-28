import { servicios, paquetes } from './serviciosData.js';
import { sucursales } from './sucursalesData.js';

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
  '/linktree': {
    title: 'Enlaces Oficiales | JASMAN Automotriz',
    description:
      'Accede rápido a Tienda Online de Llantas, Promociones, Sucursales, Servicios Automotrices y atención por WhatsApp de JASMAN.',
  },
  '/links': {
    title: 'Enlaces Oficiales | JASMAN Automotriz',
    description:
      'Accede rápido a Tienda Online de Llantas, Promociones, Sucursales, Servicios Automotrices y atención por WhatsApp de JASMAN.',
  },
  '/taplink': {
    title: 'Enlaces Oficiales | JASMAN Automotriz',
    description:
      'Accede rápido a Tienda Online de Llantas, Promociones, Sucursales, Servicios Automotrices y atención por WhatsApp de JASMAN.',
  },
  '/bio': {
    title: 'Enlaces Oficiales | JASMAN Automotriz',
    description:
      'Accede rápido a Tienda Online de Llantas, Promociones, Sucursales, Servicios Automotrices y atención por WhatsApp de JASMAN.',
  },
  '/aviso-de-privacidad': {
    title: 'Aviso de Privacidad Integral | JASMAN Automotriz',
    description:
      'Consulta el Aviso de Privacidad Integral de JASMAN Automotriz conforme a la LFPDPPP. Conoce cómo protegemos tus datos personales y tus derechos ARCO.',
  },
  '/politica-de-privacidad': {
    title: 'Aviso de Privacidad Integral | JASMAN Automotriz',
    description:
      'Consulta el Aviso de Privacidad Integral de JASMAN Automotriz conforme a la LFPDPPP. Conoce cómo protegemos tus datos personales y tus derechos ARCO.',
  },
  '/terminos-y-condiciones': {
    title: 'Términos y Condiciones de Uso y Compra | JASMAN Automotriz',
    description:
      'Términos y Condiciones generales de uso, compra de llantas en línea, citas de taller mecánico, promociones y facturación CFDI en JASMAN Automotriz.',
  },
  '/politica-de-reembolso': {
    title: 'Política de Devoluciones, Reembolsos y Garantías | JASMAN',
    description:
      'Conoce la Política de Devoluciones, Reembolsos y Garantías por escrito en llantas y servicios automotrices de JASMAN Automotriz en México.',
  },
  '/politica-de-envios': {
    title: 'Política de Envíos y Entregas a Todo México | JASMAN TIRES',
    description:
      'Consulta cobertura nacional, tiempos de entrega de 3 a 5 días hábiles, rastreo de guías y opciones de instalación en las +80 sucursales JASMAN.',
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

export const SERVICIOS_SEO_BY_SLUG = {
  'servicio-mayor-con-bujias': {
    title: 'Servicio Mayor con Bujías en México | JASMAN, el Taller Mecánico #1 de México',
    description:
      'Servicio Mayor con Bujías en México con JASMAN, el Taller Mecánico #1 de México. Cuida el motor y mejora el desempeño de tu auto. Agenda tu servicio automotriz.',
  },
  'servicio-mayor-sin-bujias': {
    title: 'Servicio Mayor sin Bujías en México | JASMAN, el Taller Mecánico #1 de México',
    description:
      'Servicio Mayor sin Bujías en México con JASMAN, el Taller Mecánico #1 de México. Mantén tu vehículo en óptimas condiciones. Agenda tu servicio automotriz.',
  },
  afinacion: {
    title: 'Servicio de Afinación en México | JASMAN, el Taller Mecánico #1 de México',
    description:
      'Servicio de Afinación en México con JASMAN, el Taller Mecánico #1 de México. Mejora el rendimiento y funcionamiento del motor. Agenda tu servicio automotriz.',
  },
  'alineacion-y-balanceo': {
    title: 'Servicio de Alineación y Balanceo en México | JASMAN, el Taller Mecánico #1 de México',
    description:
      'Servicio de Alineación y Balanceo en México con JASMAN, el Taller Mecánico #1 de México. Mejora la estabilidad y reduce el desgaste de las llantas. Agenda tu servicio automotriz.',
  },
  'amortiguadores-delanteros': {
    title: 'Cambio de Amortiguadores Delanteros en México | JASMAN, el Taller Mecánico #1 de México',
    description:
      'Cambio de Amortiguadores Delanteros en México con JASMAN, el Taller Mecánico #1 de México. Recupera estabilidad, control y confort al conducir. Agenda tu servicio automotriz.',
  },
  'amortiguadores-traseros': {
    title: 'Cambio de Amortiguadores Traseros en México | JASMAN, el Taller Mecánico #1 de México',
    description:
      'Cambio de Amortiguadores Traseros en México con JASMAN, el Taller Mecánico #1 de México. Mejora la estabilidad y seguridad de tu vehículo. Agenda tu servicio automotriz.',
  },
  anticongelante: {
    title: 'Cambio de Anticongelante en México | JASMAN, el Taller Mecánico #1 de México',
    description:
      'Cambio de Anticongelante en México con JASMAN, el Taller Mecánico #1 de México. Protege el motor y su sistema de enfriamiento. Agenda tu servicio automotriz.',
  },
  'balero-de-rueda': {
    title: 'Cambio de Balero de Rueda en México | JASMAN, el Taller Mecánico #1 de México',
    description:
      'Cambio de Balero de Rueda en México con JASMAN, el Taller Mecánico #1 de México. Evita ruidos y mejora la seguridad al conducir. Agenda tu servicio automotriz.',
  },
  'balero-doble': {
    title: 'Cambio de Balero Doble en México | JASMAN, el Taller Mecánico #1 de México',
    description:
      'Cambio de Balero Doble en México con JASMAN, el Taller Mecánico #1 de México. Recupera el funcionamiento adecuado de las ruedas. Agenda tu servicio automotriz.',
  },
  'banda-del-alternador': {
    title: 'Cambio de Banda del Alternador en México | JASMAN, el Taller Mecánico #1 de México',
    description:
      'Cambio de Banda del Alternador en México con JASMAN, el Taller Mecánico #1 de México. Previene fallas en los accesorios del motor. Agenda tu servicio automotriz.',
  },
  'base-de-amortiguadores': {
    title: 'Cambio de Base de Amortiguadores en México | JASMAN, el Taller Mecánico #1 de México',
    description:
      'Cambio de Base de Amortiguadores en México con JASMAN, el Taller Mecánico #1 de México. Reduce vibraciones y mejora la suspensión. Agenda tu servicio automotriz.',
  },
  'cambio-de-bateria': {
    title: 'Cambio de Batería en México | JASMAN, el Taller Mecánico #1 de México',
    description:
      'Cambio de Batería en México con JASMAN, el Taller Mecánico #1 de México. Asegura el arranque y el suministro eléctrico de tu auto. Agenda tu servicio automotriz.',
  },
  'bomba-de-agua': {
    title: 'Cambio de Bomba de Agua en México | JASMAN, el Taller Mecánico #1 de México',
    description:
      'Cambio de Bomba de Agua en México con JASMAN, el Taller Mecánico #1 de México. Protege el motor contra el sobrecalentamiento. Agenda tu servicio automotriz.',
  },
  'bujes-de-horquilla': {
    title: 'Cambio de Bujes de Horquilla en México | JASMAN, el Taller Mecánico #1 de México',
    description:
      'Cambio de Bujes de Horquilla en México con JASMAN, el Taller Mecánico #1 de México. Mejora el control y la respuesta de la suspensión. Agenda tu servicio automotriz.',
  },
  'cambio-de-aceite': {
    title: 'Cambio de Aceite en México | JASMAN, el Taller Mecánico #1 de México',
    description:
      'Cambio de Aceite en México con JASMAN, el Taller Mecánico #1 de México. Protege tu motor con mantenimiento oportuno. Agenda tu servicio automotriz.',
  },
  'carga-de-gas-refrigerante': {
    title: 'Servicio de Carga de Gas Refrigerante en México | JASMAN, el Taller Mecánico #1 de México',
    description:
      'Servicio de Carga de Gas Refrigerante en México con JASMAN, el Taller Mecánico #1 de México. Recupera el enfriamiento del aire acondicionado. Agenda tu servicio automotriz.',
  },
  'disco-de-frenos': {
    title: 'Cambio de Discos de Frenos en México | JASMAN, el Taller Mecánico #1 de México',
    description:
      'Cambio de Discos de Frenos en México con JASMAN, el Taller Mecánico #1 de México. Mejora la respuesta y seguridad del frenado. Agenda tu servicio automotriz.',
  },
  'filtro-de-aire': {
    title: 'Cambio de Filtro de Aire en México | JASMAN, el Taller Mecánico #1 de México',
    description:
      'Cambio de Filtro de Aire en México con JASMAN, el Taller Mecánico #1 de México. Favorece el desempeño y la entrada de aire al motor. Agenda tu servicio automotriz.',
  },
  'filtro-de-polen-ac': {
    title: 'Cambio de Filtro de Polen A/C en México | JASMAN, el Taller Mecánico #1 de México',
    description:
      'Cambio de Filtro de Polen A/C en México con JASMAN, el Taller Mecánico #1 de México. Mejora la calidad del aire dentro del vehículo. Agenda tu servicio automotriz.',
  },
  'gomas-barra-estabilizadora': {
    title: 'Cambio de Gomas de Barra Estabilizadora en México | JASMAN, el Taller Mecánico #1 de México',
    description:
      'Cambio de Gomas de Barra Estabilizadora en México con JASMAN, el Taller Mecánico #1 de México. Reduce ruidos y mejora la estabilidad del auto. Agenda tu servicio automotriz.',
  },
  'horquilla-inferior': {
    title: 'Cambio de Horquilla Inferior en México | JASMAN, el Taller Mecánico #1 de México',
    description:
      'Cambio de Horquilla Inferior en México con JASMAN, el Taller Mecánico #1 de México. Recupera el control y estabilidad de la suspensión. Agenda tu servicio automotriz.',
  },
  'kit-de-clutch': {
    title: 'Cambio de Kit de Clutch en México | JASMAN, el Taller Mecánico #1 de México',
    description:
      'Cambio de Kit de Clutch en México con JASMAN, el Taller Mecánico #1 de México. Mejora el acoplamiento y la respuesta de la transmisión. Agenda tu servicio automotriz.',
  },
  'kit-de-distribucion': {
    title: 'Cambio de Kit de Distribución en México | JASMAN, el Taller Mecánico #1 de México',
    description:
      'Cambio de Kit de Distribución en México con JASMAN, el Taller Mecánico #1 de México. Ayuda a prevenir daños graves en el motor. Agenda tu servicio automotriz.',
  },
  'limpieza-cuerpo-aceleracion': {
    title: 'Servicio de Limpieza del Cuerpo de Aceleración en México | JASMAN, el Taller Mecánico #1 de México',
    description:
      'Servicio de Limpieza del Cuerpo de Aceleración en México con JASMAN, el Taller Mecánico #1 de México. Favorece una aceleración y marcha más uniformes. Agenda tu servicio automotriz.',
  },
  'limpieza-ajuste-frenos': {
    title: 'Servicio de Limpieza y Ajuste de Frenos en México | JASMAN, el Taller Mecánico #1 de México',
    description:
      'Servicio de Limpieza y Ajuste de Frenos en México con JASMAN, el Taller Mecánico #1 de México. Mantén una respuesta de frenado confiable. Agenda tu servicio automotriz.',
  },
  'liquido-de-frenos': {
    title: 'Cambio de Líquido de Frenos en México | JASMAN, el Taller Mecánico #1 de México',
    description:
      'Cambio de Líquido de Frenos en México con JASMAN, el Taller Mecánico #1 de México. Mantén el sistema hidráulico de frenos en buen estado. Agenda tu servicio automotriz.',
  },
  'montaje-de-llanta': {
    title: 'Servicio de Montaje de Llanta en México | JASMAN, el Taller Mecánico #1 de México',
    description:
      'Servicio de Montaje de Llanta en México con JASMAN, el Taller Mecánico #1 de México. Instala tus llantas con atención profesional. Agenda tu servicio automotriz.',
  },
  'pastillas-frenos-delanteras': {
    title: 'Cambio de Pastillas de Frenos Delanteras en México | JASMAN, el Taller Mecánico #1 de México',
    description:
      'Cambio de Pastillas de Frenos Delanteras en México con JASMAN, el Taller Mecánico #1 de México. Recupera una frenada segura y efectiva. Agenda tu servicio automotriz.',
  },
  'pastillas-frenos-traseras': {
    title: 'Cambio de Pastillas de Frenos Traseras en México | JASMAN, el Taller Mecánico #1 de México',
    description:
      'Cambio de Pastillas de Frenos Traseras en México con JASMAN, el Taller Mecánico #1 de México. Mejora la respuesta y seguridad del frenado. Agenda tu servicio automotriz.',
  },
  'rectificado-discos-tambores': {
    title: 'Servicio de Rectificado de Discos y Tambores en México | JASMAN, el Taller Mecánico #1 de México',
    description:
      'Servicio de Rectificado de Discos y Tambores en México con JASMAN, el Taller Mecánico #1 de México. Mejora el contacto y funcionamiento de los frenos. Agenda tu servicio automotriz.',
  },
  'servicio-sistema-aire': {
    title: 'Servicio al Sistema de Aire en México | JASMAN, el Taller Mecánico #1 de México',
    description:
      'Servicio al Sistema de Aire en México con JASMAN, el Taller Mecánico #1 de México. Revisa el funcionamiento del aire acondicionado. Agenda tu servicio automotriz.',
  },
  'terminales-de-direccion': {
    title: 'Cambio de Terminales de Dirección en México | JASMAN, el Taller Mecánico #1 de México',
    description:
      'Cambio de Terminales de Dirección en México con JASMAN, el Taller Mecánico #1 de México. Recupera precisión y seguridad en la dirección. Agenda tu servicio automotriz.',
  },
  'tornillos-estabilizadores': {
    title: 'Cambio de Tornillos Estabilizadores en México | JASMAN, el Taller Mecánico #1 de México',
    description:
      'Cambio de Tornillos Estabilizadores en México con JASMAN, el Taller Mecánico #1 de México. Reduce ruidos y mejora la respuesta de la suspensión. Agenda tu servicio automotriz.',
  },
};

// [branchId, displayBranch, city] from SEO_Sucursales_JASMAN_2026_Titulos_Actualizados.xlsx
const SUCURSALES_SEO_ENTRIES = [
  ['alamedas-2', 'Alamedas 2', 'Atizapán de Zaragoza'],
  ['cuautla', 'Cuautla', 'Cuautla'],
  ['azcapotzalco', 'Azcapotzalco', 'Azcapotzalco'],
  ['santa-fe', 'Santa Fe', 'Álvaro Obregón'],
  ['camelinas', 'Camelinas', 'Morelia'],
  ['huertas', 'Huertas', 'Morelia'],
  ['chabacano', 'Chabacano', 'Cuauhtémoc'],
  ['aeropuerto', 'Aeropuerto', 'Venustiano Carranza'],
  ['mariano-escobedo', 'Mariano Escobedo', 'Miguel Hidalgo'],
  ['revolucion', 'Revolución', 'Álvaro Obregón'],
  ['texcoco-allende', 'Texcoco Allende', 'Texcoco'],
  ['salamanca', 'Salamanca', 'Salamanca'],
  ['nuevo-laredo', 'Nuevo Laredo', 'Nuevo Laredo'],
  ['texcoco', 'Texcoco', 'Texcoco'],
  ['toluca-1', 'Toluca 1', 'Toluca'],
  ['queretaro', 'Querétaro', 'Santiago de Querétaro'],
  ['central-de-abastos', 'Central De Abastos', 'Iztapalapa'],
  ['vertiz', 'Vertiz', 'Benito Juárez'],
  ['interlomas', 'Interlomas', 'Huixquilucan'],
  ['ajusco', 'Ajusco', 'Tlalpan'],
  ['guanajuato', 'Guanajuato', 'Guanajuato'],
  ['cuautitlan', 'Cuautitlán', 'Cuautitlán Izcalli'],
  ['vallejo', 'Vallejo', 'Gustavo A. Madero'],
  ['country-guadalajara', 'Country Guadalajara', 'Guadalajara'],
  ['iztapalapa', 'Iztapalapa', 'Iztapalapa'],
  ['tepic', 'Tepic', 'Tepic'],
  ['torres-landa', 'Torres Landa', 'León de los Aldama'],
  ['morelos', 'Morelos', 'León de los Aldama'],
  ['hidalgo', 'Hidalgo', 'León de los Aldama'],
  ['irapuato', 'Irapuato', 'Irapuato'],
  ['alamedas', 'Alamedas', 'Atizapán de Zaragoza'],
  ['yucatan', 'Yucatán', 'Cuauhtémoc'],
  ['valle', 'Valle', 'San Pedro Garza García'],
  ['iztacalco', 'Iztacalco', 'Iztacalco'],
  ['nezahualcoyotl', 'Nezahualcóyotl', 'Nezahualcóyotl'],
  ['los-reyes-michoacan', 'Los Reyes Michoacán', 'Los Reyes'],
  ['san-jeronimo', 'San Jerónimo', 'Álvaro Obregón'],
  ['los-reyes', 'Los Reyes', 'Los Reyes La Paz'],
  ['revolucion-guadalajara', 'Revolución Guadalajara', 'Guadalajara'],
  ['primavera', 'Primavera', 'Guadalupe'],
  ['toluca-centro', 'Toluca Centro', 'Toluca'],
  ['patria', 'Patria', 'Zapopan'],
  ['linda-vista', 'Linda Vista', 'Guadalupe'],
  ['polanco', 'Polanco', 'Miguel Hidalgo'],
  ['abastos', 'Abastos', 'Monterrey'],
  ['gonzalez-gallo', 'Gonzalez Gallo', 'Guadalajara'],
  ['lomas-verdes', 'Lomas Verdes', 'Naucalpan de Juárez'],
  ['zamora-juarez', 'Zamora Juárez', 'Zamora'],
  ['javier-mina', 'Javier Mina', 'Guadalajara'],
  ['san-nicolas', 'San Nicolás', 'San Nicolás de los Garza'],
  ['chalco', 'Chalco', 'Chalco'],
  ['chapultepec', 'Chapultepec', 'Monterrey'],
  ['aragon', 'Aragón', 'Nezahualcóyotl'],
  ['portales', 'Portales', 'Benito Juárez'],
  ['americas', 'Américas', 'Guadalajara'],
  ['pachuca', 'Pachuca', 'Pachuca de Soto'],
  ['universidad', 'Universidad', 'Monterrey'],
  ['lincoln', 'Lincoln', 'Monterrey'],
  ['miramontes', 'Miramontes', 'Coyoacán'],
  ['azcapotzalco-2', 'Azcapotzalco 2', 'Azcapotzalco'],
  ['naucalpan', 'Naucalpan', 'Naucalpan de Juárez'],
  ['tlalnepantla', 'Tlalnepantla', 'Tlalnepantla de Baz'],
  ['la-paz', 'La Paz', 'Guadalajara'],
  ['providencia', 'Providencia', 'Guadalajara'],
  ['constituyentes', 'Constituyentes', 'Santiago de Querétaro'],
  ['americas-qro', 'Américas', 'Santiago de Querétaro'],
  ['mega-estadio', 'Mega Estadio', 'Santiago de Querétaro'],
  ['juriquilla', 'Juriquilla', 'Santiago de Querétaro'],
  ['san-juan-del-rio', 'San Juan del Rio', 'San Juan del Río'],
  ['celaya', 'Celaya', 'Celaya'],
  ['av-toluca', 'Av Toluca', 'Álvaro Obregón'],
  ['concordia', 'Concordia', 'Apodaca'],
];

export const SUCURSALES_SEO_BY_ID = Object.fromEntries(
  SUCURSALES_SEO_ENTRIES.map(([id, displayBranch, city]) => [
    id,
    {
      title: `Taller Mecánico Automotriz en ${city} JASMAN Suc. ${displayBranch} | Alineación y Balanceo, Cambio de Aceite`,
      description: `JASMAN ${displayBranch}: taller mecánico automotriz en ${city}. Servicio de alineación y balanceo, cambio de aceite y mantenimiento para tu auto. ¡Agenda tu visita!`,
    },
  ])
);

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
    const exactServiceSeo = SERVICIOS_SEO_BY_SLUG[slug];
    if (exactServiceSeo && match) {
      return {
        ...exactServiceSeo,
        canonicalUrl: `${CANONICAL_ORIGIN}/servicios/${match.slug}`,
      };
    }
    if (exactServiceSeo) {
      return {
        ...exactServiceSeo,
        canonicalUrl: `${CANONICAL_ORIGIN}/servicios/${slug}`,
      };
    }
    if (match) {
      return {
        title: `${match.title} | Servicios JASMAN`,
        description: `${match.description} Agenda tu servicio en JASMAN, Taller Mecánico Automotriz #1 de México.`,
        canonicalUrl: `${CANONICAL_ORIGIN}/servicios/${match.slug}`,
      };
    }
  }

  // Branch service detail route (/sucursales/:branchSlug/:serviceSlug) & branch detail (/sucursales/:slug)
  if (cleanPath.startsWith('/sucursales/')) {
    const parts = cleanPath.replace('/sucursales/', '').split('/').filter(Boolean);
    if (parts.length === 2) {
      const [branchSlug, serviceSlug] = parts;
      const branch = sucursales.find((s) => s.id === branchSlug);
      const service = [...servicios, ...paquetes].find((s) => s.slug === serviceSlug);
      if (branch && service) {
        return {
          title: `${service.title} en Taller Mecánico Automotriz JASMAN Suc. ${branch.name} | ${branch.city}`,
          description: `${service.description} Agenda ${service.title} en Taller Mecánico Automotriz JASMAN Suc. ${branch.name} en ${branch.city}, ${branch.state}. Escaneo de 72 puntos y garantía.`,
          canonicalUrl: `${CANONICAL_ORIGIN}/sucursales/${branch.id}/${service.slug}`,
        };
      }
    }

    if (parts.length === 1) {
      const slug = parts[0];
      const branch = sucursales.find((s) => s.id === slug);
      const exactBranchSeo = SUCURSALES_SEO_BY_ID[slug];
      if (exactBranchSeo && branch) {
        return {
          ...exactBranchSeo,
          canonicalUrl: `${CANONICAL_ORIGIN}/sucursales/${branch.id}`,
        };
      }
      if (branch) {
        return {
          title: `Sucursal ${branch.name} | JASMAN Taller Automotriz`,
          description: `Visita JASMAN Sucursal ${branch.name} en ${branch.city}, ${branch.state}. Llantas, alineación, balanceo y mantenimiento automotriz.`,
          canonicalUrl: `${CANONICAL_ORIGIN}/sucursales/${branch.id}`,
        };
      }
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
