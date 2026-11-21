export const DEFAULT_WHATSAPP_PHONE = '5215510024945';

/**
 * Extracts a normalized WhatsApp phone number for a Jasman branch.
 */
export function extractBranchWhatsAppPhone(branch) {
  const direct = String(branch?.whatsappPhone || '').replace(/\D/g, '');
  if (direct.length >= 10) return direct;

  const url = String(branch?.cmsWhatsappUrl || branch?.whatsappUrl || '');
  const paramMatch = url.match(/[?&]phone=(\d+)/i);
  if (paramMatch?.[1]) return paramMatch[1];

  const waMeMatch = url.match(/wa\.me\/(\d+)/i);
  if (waMeMatch?.[1]) return waMeMatch[1];

  return DEFAULT_WHATSAPP_PHONE;
}

/**
 * Builds the WhatsApp inquiry URL for a specific service at a specific branch.
 */
export function buildBranchServiceWhatsAppUrl(branch, serviceTitle) {
  const phone = extractBranchWhatsAppPhone(branch);
  const branchLabel = branch?.name ? `Jasman Suc. ${branch.name}` : 'Jasman Automotriz';
  const msg = `SW- Hola quisiera más información de su servicio de "${serviceTitle}" en "${branchLabel}"`;
  return `https://api.whatsapp.com/send/?phone=${phone}&text=${encodeURIComponent(msg)}`;
}

/**
 * Builds a general WhatsApp inquiry URL for a workshop service.
 */
export function buildServiceWhatsAppUrl(serviceTitle) {
  const msg = `SW- Hola quisiera más información de su servicio de "${serviceTitle}"`;
  return `https://api.whatsapp.com/send/?phone=${DEFAULT_WHATSAPP_PHONE}&text=${encodeURIComponent(msg)}`;
}

/**
 * Builds a WhatsApp quote URL for the online tire store marquee/navbar.
 */
export function buildStoreQuoteWhatsAppUrl() {
  const msg = 'SW- Hola quisiera obtener una cotización de llantas por WhatsApp';
  return `https://api.whatsapp.com/send/?phone=${DEFAULT_WHATSAPP_PHONE}&text=${encodeURIComponent(msg)}`;
}
