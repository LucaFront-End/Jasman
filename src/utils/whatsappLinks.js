export const DEFAULT_WHATSAPP_PHONE = '5215510024945';

/**
 * Normalizes a Mexican WhatsApp number from either a WhatsApp URL
 * (e.g. "https://wa.me/525543500820?text=...", "https://api.whatsapp.com/send/?phone=521...")
 * or a plain phone string (e.g. "55 4761 1468", "+52 55 4761 1468", "525547611468").
 */
export function parseMxWhatsAppInput(rawValue) {
  const raw = String(rawValue || '').trim();
  if (!raw) return { whatsappPhone: '', tenDigits: '' };

  let digits = '';
  const urlMatch =
    raw.match(/[?&]phone=(\d+)/i) || raw.match(/wa\.me\/(\d+)/i);
  if (urlMatch?.[1]) {
    digits = urlMatch[1];
  } else if (/^https?:\/\//i.test(raw)) {
    return { whatsappPhone: '', tenDigits: '' };
  } else {
    digits = raw.replace(/\D/g, '');
  }

  if (digits.length === 13 && digits.startsWith('521')) {
    return { whatsappPhone: digits, tenDigits: digits.slice(3) };
  }
  if (digits.length === 12 && digits.startsWith('52')) {
    return { whatsappPhone: digits, tenDigits: digits.slice(2) };
  }
  if (digits.length === 11 && digits.startsWith('1')) {
    return { whatsappPhone: `52${digits}`, tenDigits: digits.slice(1) };
  }
  if (digits.length === 10) {
    return { whatsappPhone: `521${digits}`, tenDigits: digits };
  }
  return { whatsappPhone: '', tenDigits: '' };
}

/**
 * Formats a 10-digit Mexican phone number cleanly for display.
 */
export function formatMxDisplayPhone(tenDigits) {
  const clean = String(tenDigits || '').replace(/\D/g, '');
  if (clean.length !== 10) return String(tenDigits || '').trim();
  if (clean.startsWith('55') || clean.startsWith('33') || clean.startsWith('81')) {
    return `${clean.slice(0, 2)} ${clean.slice(2, 6)} ${clean.slice(6)}`;
  }
  return `${clean.slice(0, 3)} ${clean.slice(3, 6)} ${clean.slice(6)}`;
}

/**
 * Extracts a normalized WhatsApp phone number for a Jasman branch.
 * Priority: live CMS phone/URL > branch whatsappPhone > branch phone > fallback url > general default.
 */
export function extractBranchWhatsAppPhone(branch) {
  const candidates = [
    branch?.cmsWhatsappPhone,
    branch?.cmsWhatsappUrl,
    branch?.whatsappPhone,
    branch?.phone,
    branch?.whatsappUrl,
  ];
  for (const candidate of candidates) {
    const parsed = parseMxWhatsAppInput(candidate);
    if (parsed.whatsappPhone) return parsed.whatsappPhone;
  }
  return DEFAULT_WHATSAPP_PHONE;
}

/**
 * Builds the general WhatsApp inquiry URL for a specific branch.
 */
export function buildBranchGeneralWhatsAppUrl(branch) {
  const phone = extractBranchWhatsAppPhone(branch);
  const branchLabel =
    branch?.fullName ||
    (branch?.name ? `Jasman Automotriz - Suc. ${branch.name}` : 'Jasman Automotriz');
  const msg = `SW - Hola quisiera más información de sus servicios automotrices en su sucursal "${branchLabel}"`;
  return `https://api.whatsapp.com/send/?phone=${phone}&text=${encodeURIComponent(msg)}`;
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
 * Builds a general WhatsApp inquiry URL for a workshop service (no specific branch).
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
