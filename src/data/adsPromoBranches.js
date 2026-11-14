/**
 * Participating branches (38 yellow-highlighted branches) and their direct
 * WhatsApp campaign numbers from `Sucursales Campañas ADS.xlsx`.
 */
export const ADS_PROMO_BRANCH_OVERRIDES = {
  // CDMX y Zona Metropolitana (17 sucursales)
  ajusco: { excelName: 'Jasman® Ajusco', rawPhone: '5543778228' },
  portales: { excelName: 'Jasman® Portales', rawPhone: '5546093880' },
  vertiz: { excelName: 'Jasman® Vertiz', rawPhone: '5548086066' },
  'av-toluca': { excelName: 'Jasman® Av Toluca', rawPhone: '55 7961 8368' },
  'alamedas-2': { excelName: 'Jasman® Alamedas 2', rawPhone: '5553307942' },
  cuautitlan: { excelName: 'Jasman® Cuautitlan', rawPhone: '5543511367' },
  'lomas-verdes': { excelName: 'Jasman® Lomas Verdes', rawPhone: '5554539017' },
  azcapotzalco: { excelName: 'Jasman® Azcapotzalco', rawPhone: '5591087168' },
  tlalnepantla: { excelName: 'Jasman® Tlanepantla', rawPhone: '5525882028' },
  interlomas: { excelName: 'Jasman® Interlomas', rawPhone: '5580401611' },
  polanco: { excelName: 'Jasman® Polanco', rawPhone: '5548006110' },
  'toluca-1': { excelName: 'Jasman® Toluca', rawPhone: '5560918271' },
  chalco: { excelName: 'Jasman® Chalco', rawPhone: '5543513079' },
  cuautla: { excelName: 'Jasman® Cuautla', rawPhone: '5541922379' },
  'los-reyes': { excelName: 'Jasman® Los Reyes', rawPhone: '5543501609' },
  texcoco: { excelName: 'Jasman® Texcoco', rawPhone: '5548336141' },
  'texcoco-allende': { excelName: 'Jasman® Texcoco Allende', rawPhone: '5549401859' },

  // Foráneos (21 sucursales)
  lincoln: { excelName: 'Jasman® Lincon', rawPhone: '8128613458' },
  primavera: { excelName: 'Jasman® Primavera', rawPhone: '8128613463' },
  universidad: { excelName: 'Jasman® Universidad', rawPhone: '8128613474' },
  concordia: { excelName: 'Jasman® Concordia', rawPhone: '8112449804' },
  'javier-mina': { excelName: 'Jasman® Javier Mina', rawPhone: '3313378900' },
  providencia: { excelName: 'Jasman® Providencia', rawPhone: '3321541777' },
  'la-paz': { excelName: 'Jasman® La Paz', rawPhone: '3321848809' },
  americas: { excelName: 'Jasman® Americas', rawPhone: '3313369157' },
  'country-guadalajara': { excelName: 'Jasman® Country', rawPhone: '3321845411' },
  guanajuato: { excelName: 'Jasman® Guanajuato', rawPhone: '4773266372' },
  hidalgo: { excelName: 'Jasman® Hidalgo', rawPhone: '4731201905' },
  morelos: { excelName: 'Jasman® Morelos', rawPhone: '4731201838' },
  'torres-landa': { excelName: 'Jasman® Torres Landa', rawPhone: '4731201847' },
  constituyentes: { excelName: 'Jasman® Constituyentes', rawPhone: '442 394 5995' },
  'mega-estadio': { excelName: 'Jasman® Mega Estadio', rawPhone: '442 313 0977' },
  juriquilla: { excelName: 'Jasman® Juriquilla', rawPhone: '442 479 0735' },
  'san-juan-del-rio': { excelName: 'Jasman® San Juan Del Rio', rawPhone: '442 190 4882' },
  celaya: { excelName: 'Jasman® Celaya', rawPhone: '442 479 0761' },
  camelinas: { excelName: 'Jasman® Camelinas', rawPhone: '443 395 8945' },
  'zamora-juarez': { excelName: 'Jasman® Zamora', rawPhone: '33 1613 0840' },
  'los-reyes-michoacan': { excelName: 'Jasman® Los Reyes', rawPhone: '354 100 1708' },
};

function toMxWhatsAppPhone(rawPhone) {
  const digits = String(rawPhone || '').replace(/\D/g, '');
  if (!digits) return null;
  if (digits.length === 10) return `521${digits}`;
  if (digits.length === 12 && digits.startsWith('52')) return `521${digits.slice(2)}`;
  if (digits.length === 13 && digits.startsWith('521')) return digits;
  return digits;
}

function formatMxPhoneDisplay(rawPhone) {
  const digits = String(rawPhone || '').replace(/\D/g, '');
  if (digits.length === 10) {
    if (digits.startsWith('55') || digits.startsWith('81') || digits.startsWith('33')) {
      return `${digits.slice(0, 2)} ${digits.slice(2, 6)} ${digits.slice(6)}`;
    }
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
  }
  return String(rawPhone || '').trim();
}

/**
 * Returns only the 38 yellow-highlighted ADS campaign branches with their
 * direct campaign WhatsApp numbers & formatted display phones applied.
 */
export function getAdsPromoBranches(sourceBranches = []) {
  return (sourceBranches || [])
    .filter((branch) => Boolean(ADS_PROMO_BRANCH_OVERRIDES[branch.id]))
    .map((branch) => {
      const override = ADS_PROMO_BRANCH_OVERRIDES[branch.id];
      return {
        ...branch,
        phone: formatMxPhoneDisplay(override.rawPhone),
        whatsappPhone: toMxWhatsAppPhone(override.rawPhone),
        isAdsPromoBranch: true,
      };
    });
}
