import { createClient, OAuthStrategy, EMPTY_TOKENS } from '@wix/sdk';
import { items } from '@wix/data';
import { sendFormSubmitEmail } from './formSubmitService';

export const WIX_CLIENT_ID = '5aabc542-16cf-44de-bedf-d8eb7ad08c46';
export const WIX_SITE_ID = '7fd3b8ea-a3f3-4b51-9b48-4ec1f53d2cc9';

const WIX_TOKENS_STORAGE_KEY = 'jasman_wix_member_tokens_v1';
const WIX_VISITOR_TOKENS_KEY = 'jasman_wix_session';
const WIX_OAUTH_DATA_KEY = 'jasman_wix_oauth_data_v1';

function hasTokenPair(parsed) {
  return Boolean(parsed?.accessToken?.value && parsed?.refreshToken?.value);
}

function createSharedWixTokenStorage() {
  return {
    getTokens() {
      if (typeof window === 'undefined') return EMPTY_TOKENS;
      try {
        const memberRaw = window.localStorage.getItem(WIX_TOKENS_STORAGE_KEY);
        if (memberRaw) {
          const parsedMember = JSON.parse(memberRaw);
          if (hasTokenPair(parsedMember)) return parsedMember;
        }
      } catch {
        // ignore
      }
      try {
        const visitorRaw = window.localStorage.getItem(WIX_VISITOR_TOKENS_KEY);
        if (visitorRaw) {
          const parsedVisitor = JSON.parse(visitorRaw);
          if (hasTokenPair(parsedVisitor)) return parsedVisitor;
        }
      } catch {
        // ignore
      }
      return EMPTY_TOKENS;
    },
    setTokens(tokens) {
      if (typeof window === 'undefined') return;
      try {
        const memberRaw = window.localStorage.getItem(WIX_TOKENS_STORAGE_KEY);
        if (memberRaw) {
          const currentMember = JSON.parse(memberRaw);
          if (
            currentMember?.refreshToken?.value &&
            currentMember.refreshToken.value === tokens?.refreshToken?.value
          ) {
            window.localStorage.setItem(WIX_TOKENS_STORAGE_KEY, JSON.stringify(tokens));
            return;
          }
          if (hasTokenPair(currentMember)) return;
        }
        window.localStorage.setItem(WIX_VISITOR_TOKENS_KEY, JSON.stringify(tokens));
      } catch {
        // ignore storage errors
      }
    },
  };
}

export function persistWixTokens(tokens) {
  if (typeof window === 'undefined') return;
  try {
    if (tokens) {
      window.localStorage.setItem(WIX_TOKENS_STORAGE_KEY, JSON.stringify(tokens));
    } else {
      window.localStorage.removeItem(WIX_TOKENS_STORAGE_KEY);
    }
  } catch {
    // ignore storage errors
  }
}

// Initialize Wix Headless Client with shared OAuthStrategy tokenStorage
export const wixClient = createClient({
  modules: { items },
  auth: OAuthStrategy({
    clientId: WIX_CLIENT_ID,
    tokenStorage: createSharedWixTokenStorage(),
  }),
});

/**
 * Converts Wix media URI (e.g. wix:image://v1/45119e_...~mv2.jpg/EDITABLE.jpg#...)
 * to a high-speed CDN static URL.
 */
export function formatWixImageUrl(wixUri, fallbackUrl = '/images/promo-landing-banner.jpg') {
  if (!wixUri || typeof wixUri !== 'string') return fallbackUrl;
  if (wixUri.startsWith('http://') || wixUri.startsWith('https://') || wixUri.startsWith('/')) {
    return wixUri;
  }

  // Pattern: wix:image://v1/{fileName}/{originalFilename}#originWidth=...
  const match = wixUri.match(/wix:image:\/\/v1\/([^/]+)/);
  if (match && match[1]) {
    return `https://static.wixstatic.com/media/${match[1]}`;
  }

  return fallbackUrl;
}

/**
 * Fetches dynamic landing promotion from Wix CMS collection "Landingdepromociones".
 * Can search by slug, or fetch the first/default active promotion.
 */
export async function getLandingPromotion(slug = null) {
  try {
    let query = wixClient.items.query('Landingdepromociones');

    if (slug) {
      // Normalize slug (clean leading/trailing slashes)
      const cleanSlug = String(slug).replace(/^\/+|\/+$/g, '').trim();
      const bySlug = await query.eq('slug', cleanSlug).find();
      if (bySlug.items && bySlug.items.length > 0) {
        return normalizePromoItem(bySlug.items[0]);
      }
    }

    // Default or fallback: fetch all and take first
    const all = await wixClient.items.query('Landingdepromociones').limit(10).find();
    if (all.items && all.items.length > 0) {
      return normalizePromoItem(all.items[0]);
    }
  } catch (err) {
    console.warn('Wix Headless: Error fetching Landingdepromociones:', err?.message || err);
  }

  // Safe fallback if network error or collection empty
  return {
    id: 'default-alineacion',
    title: 'Alineación y Balanceo',
    slug: 'alineacion-y-balanceo',
    headline: 'Alineación y Balanceo en las 4 Llantas',
    subheadline: 'Desde $750.00 MXN (IVA Incluido) · Rin 13" al 17"',
    bannerImage: '/images/promo-landing-banner.jpg',
    source: 'local-fallback',
  };
}

function normalizePromoItem(item) {
  return {
    id: item._id,
    title: item.title || 'Alineación y Balanceo',
    slug: item.slug || 'alineacion-y-balanceo',
    headline: item.tituloDePromocin || item.title || 'Alineación y Balanceo en las 4 Llantas',
    subheadline: item.secundariaDePromocin || 'Desde $750.00 MXN (IVA Incluido) · Rin 13" al 17"',
    bannerImage: formatWixImageUrl(item.imagenDePromocin, '/images/promo-landing-banner.jpg'),
    validBranches: item.sucursalesVlidas || [],
    createdDate: item._createdDate,
    updatedDate: item._updatedDate,
    raw: item,
    source: 'wix-cms',
  };
}

/**
 * Searches a Postal Code in Wix CMS collection "Codigospostales".
 * Returns { cp, lat, lng, source: 'wix-cms' } or null if not found.
 */
export async function getWixPostalCode(cp) {
  if (!cp) return null;
  const cleanCp = String(cp).trim().padStart(5, '0');

  try {
    const res = await wixClient.items
      .query('Codigospostales')
      .eq('title', cleanCp)
      .limit(1)
      .find();

    if (res.items && res.items.length > 0) {
      const item = res.items[0];
      if (item.latitud && item.longitud) {
        return {
          cp: item.title,
          lat: Number(item.latitud),
          lng: Number(item.longitud),
          name: `C.P. ${item.title}, México`,
          source: 'wix-cms',
        };
      }
    }
  } catch (err) {
    console.warn(`Wix Headless: Error querying Codigospostales for ${cleanCp}:`, err?.message || err);
  }

  return null;
}

/**
 * Fetches all branches stored in Wix CMS collection "Sucursales".
 * Returns mapped array with full details and coordinates.
 */
export async function getWixBranches() {
  try {
    const res = await wixClient.items
      .query('Sucursales')
      .limit(100)
      .find();

    if (res.items && res.items.length > 0) {
      return res.items.map((b) => {
        const title = b.title || '';
        const cleanName = title.replace(/^Jasman Automotriz\s*-\s*Suc\.\s*/i, '').trim();
        const lat = b.latitud || b.address?.location?.latitude;
        const lng = b.longitud || b.address?.location?.longitude;
        const fullAddr = b.address?.formatted || b.address?.streetAddress?.name || '';
        const city = b.address?.city || 'Ciudad de México';
        const state = b.address?.subdivision || 'CDMX';

        // Extract phone number from WhatsApp URL if available
        let phone = '';
        if (b.whatsapp) {
          const phoneMatch = b.whatsapp.match(/phone=52(\d{10})/i) || b.whatsapp.match(/wa\.me\/52(\d{10})/i);
          if (phoneMatch && phoneMatch[1]) {
            phone = phoneMatch[1];
          }
        }

        const fullBranchLabel = title.startsWith('Jasman') ? title : `Jasman Automotriz - Suc. ${title}`;
        const unifiedWaMsg = encodeURIComponent(
          `SW - Hola quisiera más información de sus servicios automotrices en su sucursal "${fullBranchLabel}"`
        );

        return {
          id: b._id,
          name: cleanName || title,
          fullName: fullBranchLabel,
          address: fullAddr,
          city,
          state,
          lat: Number(lat),
          lng: Number(lng),
          phone: phone ? `${phone.slice(0, 2)} ${phone.slice(2, 6)} ${phone.slice(6)}` : '55 1002 4945',
          whatsappUrl: `https://api.whatsapp.com/send/?phone=5215510024945&text=${unifiedWaMsg}`,
          mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${title} ${fullAddr}`)}`,
          source: 'wix-cms',
        };
      }).filter(b => !isNaN(b.lat) && !isNaN(b.lng));
    }
  } catch (err) {
    console.warn('Wix Headless: Error querying Sucursales:', err?.message || err);
  }

  return [];
}

/**
 * Saves appointment lead data into local storage / CMS lead queue.
 * Integrates with Wix CMS tracking.
 */
export async function saveBookingLead(booking) {
  const folio = 'JAS-' + Math.floor(100000 + Math.random() * 900000);
  const leadRecord = {
    ...booking,
    folio,
    createdAt: new Date().toISOString(),
    status: 'PENDIENTE',
  };

  try {
    // 1. Try to record in local cache
    const existing = JSON.parse(localStorage.getItem('jasman_cms_bookings') || '[]');
    existing.unshift(leadRecord);
    localStorage.setItem('jasman_cms_bookings', JSON.stringify(existing.slice(0, 50)));

    // 2. Also register in Contactoweb CMS collection (which also dispatches FormSubmit email)
    try {
      await saveContactoWeb({
        folio: leadRecord.folio,
        nombre: leadRecord.nombre,
        telefono: leadRecord.telefono,
        email: leadRecord.email || leadRecord.correo || '',
        sucursal: leadRecord.sucursalNombre,
        vehiculo: leadRecord.vehiculo || 'Automóvil',
        fechaVisita: leadRecord.fechaVisita || 'Por agendar',
        promocion: leadRecord.promocion || 'Alineación y Balanceo',
        asunto: `Cita Web: ${leadRecord.vehiculo || 'Automóvil'} — ${leadRecord.fechaVisita || 'Por agendar'}`,
        mensaje: `Folio: ${leadRecord.folio} | Promoción: ${leadRecord.promocion || 'Alineación y Balanceo'} | Vehículo: ${leadRecord.vehiculo || 'Automóvil'} | Fecha tentativa: ${leadRecord.fechaVisita || 'Por agendar'}`,
        origen: 'Landing Promociones / Agenda de Cita',
      });
    } catch {
      // Ignored
    }

    // 3. Try to insert in Wix CMS 'Citas' if collection exists
    try {
      await wixClient.items.insert('Citas', {
        title: `${leadRecord.nombre} - ${leadRecord.folio}`,
        nombre: leadRecord.nombre,
        telefono: leadRecord.telefono,
        vehiculo: leadRecord.vehiculo,
        fechaVisita: leadRecord.fechaVisita,
        sucursal: leadRecord.sucursalNombre,
        promocion: leadRecord.promocion || 'Alineación y Balanceo $750',
        folio: leadRecord.folio,
      });
    } catch {
      // Ignored if collection 'Citas' is not yet created in user's Wix dashboard
    }
  } catch (e) {
    console.error('Error saving booking lead:', e);
  }

  return leadRecord;
}

/**
 * Saves ANY web contact form submission into Wix CMS collection "Contactoweb",
 * local cache, AND dispatches Spanish white-template email via FormSubmit.co.
 */
export async function saveContactoWeb(contactData) {
  const folio = contactData.folio || 'CW-' + Math.floor(100000 + Math.random() * 900000);
  const record = {
    title: `${contactData.nombre || contactData.name || 'Contacto'} - ${contactData.origen || 'Web'} - ${folio}`,
    nombre: contactData.nombre || contactData.name || '',
    email: contactData.email || contactData.correo || '',
    telefono: contactData.telefono || contactData.phone || '',
    ciudad: contactData.ciudad || contactData.city || '',
    sucursal: contactData.sucursal || contactData.sucursalNombre || '',
    asunto: contactData.asunto || contactData.subject || '',
    mensaje: contactData.mensaje || contactData.message || '',
    empresa: contactData.empresa || contactData.company || '',
    rfc: contactData.rfc || '',
    tipo: contactData.tipo || contactData.type || '',
    cupon: contactData.cupon || contactData.couponCode || '',
    origen: contactData.origen || 'Sitio Web',
    folio,
    fecha: new Date().toISOString(),
  };

  // 0. Send Spanish email notification via FormSubmit.co (white template) to corporate inboxes
  if (!contactData._skipFormSubmit) {
    sendFormSubmitEmail({
      seccion: record.origen,
      asuntoCorreo: record.asunto
        ? `Jasman Web — ${record.asunto}`
        : `Jasman Web — ${record.origen} (${record.nombre || record.email || folio})`,
      correoRespuesta: record.email,
      campos: {
        'Folio de Registro': record.folio,
        'Nombre Completo': record.nombre,
        'Teléfono / WhatsApp': record.telefono,
        'Correo Electrónico': record.email,
        'Ciudad o Estado': record.ciudad,
        'Sucursal': record.sucursal,
        'Empresa': record.empresa,
        'RFC': record.rfc,
        'Categoría / Detalle': record.tipo,
        'Vehículo': contactData.vehiculo || '',
        'Fecha Tentativa de Visita': contactData.fechaVisita || '',
        'Promoción': contactData.promocion || '',
        'Beneficio / Cupón': record.cupon,
        'Asunto': record.asunto,
        'Mensaje': record.mensaje,
      },
    }).catch((err) => console.warn('FormSubmit aviso (ContactoWeb):', err?.message || err));
  }

  // 1. Always save in localStorage queue
  try {
    const existing = JSON.parse(localStorage.getItem('jasman_cms_contactoweb') || '[]');
    existing.unshift(record);
    localStorage.setItem('jasman_cms_contactoweb', JSON.stringify(existing.slice(0, 100)));
  } catch (e) {
    console.warn('Local storage save error:', e);
  }

  // 2. Insert into Wix CMS collection Contactoweb
  try {
    const inserted = await wixClient.items.insert('Contactoweb', record);
    console.log('Contacto guardado exitosamente en Wix CMS Contactoweb:', inserted._id);
    return { success: true, id: inserted._id, record };
  } catch (err) {
    console.warn('Wix Headless: Aviso al insertar en Contactoweb (asegúrate de que los permisos de la colección en Wix permitan agregar contenido):', err?.message || err);
    return { success: false, error: err?.message, record };
  }
}

export const FLOTILLAS_COLLECTION_ID = 'contact0316';
export const FLOTILLAS_EMAIL_RECIPIENTS = [
  'flotillas@jasman.com.mx',
  'auxflotillas@jasman.com.mx',
];

/**
 * Saves Flotillas form submission into dedicated Wix CMS collection ("contact0316" / Contacto - Flotillas),
 * local cache, AND dispatches Spanish white-template email via FormSubmit.co to Flotillas inboxes.
 */
export async function saveFlotillasContacto(flotillaData) {
  const folio = flotillaData.folio || 'FL-' + Math.floor(100000 + Math.random() * 900000);
  const unidades = flotillaData.unidades || flotillaData.fleetSize || '';
  const nombre = flotillaData.nombre || flotillaData.name || '';
  const empresa = flotillaData.empresa || flotillaData.company || '';
  const telefono = flotillaData.telefono || flotillaData.phone || '';
  const email = flotillaData.email || flotillaData.correo || '';
  const mensaje = flotillaData.mensaje || flotillaData.message || '';
  const fecha = new Date().toISOString();

  const cmsRecord = {
    firstName: nombre,
    empresa,
    email,
    phone: telefono,
    message: `[Folio: ${folio}]${unidades ? ` [Flotilla: ${unidades} unidades]` : ''}\n${mensaje || 'Sin mensaje adicional'}`,
    submissionTime: fecha,
  };

  // 1. Send Spanish email notification via FormSubmit.co (white template) exclusively to Flotillas inboxes
  sendFormSubmitEmail({
    seccion: 'Formulario Flotillas Corporativas',
    asuntoCorreo: `Jasman Flotillas — Solicitud de ${empresa || nombre || folio} (${unidades || 'N/A'} unidades)`,
    correoRespuesta: email,
    destinatarios: FLOTILLAS_EMAIL_RECIPIENTS,
    campos: {
      'Folio de Registro': folio,
      'Nombre Completo': nombre,
      'Empresa': empresa,
      'Tamaño de Flotilla (unidades)': unidades,
      'Teléfono / WhatsApp': telefono,
      'Correo Electrónico': email,
      'Mensaje': mensaje,
    },
  }).catch((err) => console.warn('FormSubmit aviso (Flotillas):', err?.message || err));

  // 2. Local cache backup
  try {
    const existing = JSON.parse(localStorage.getItem('jasman_cms_flotillas') || '[]');
    existing.unshift({ ...cmsRecord, folio, unidades });
    localStorage.setItem('jasman_cms_flotillas', JSON.stringify(existing.slice(0, 100)));
  } catch (e) {
    console.warn('Local storage flotillas save error:', e);
  }

  // 3. Insert into dedicated Wix CMS collection contact0316 ("Contacto - Flotillas")
  try {
    const inserted = await wixClient.items.insert(FLOTILLAS_COLLECTION_ID, cmsRecord);
    console.log('Flotillas guardado exitosamente en Wix CMS contact0316:', inserted._id);
    return { success: true, id: inserted._id, folio, record: cmsRecord };
  } catch (err) {
    console.warn('Wix Headless: Aviso al insertar en Flotillas (contact0316):', err?.message || err);
    return { success: false, error: err?.message, folio, record: cmsRecord };
  }
}

/**
 * Normalizes a job opening item from Wix CMS collection "Vacantes"
 */
export function normalizeVacanteItem(item) {
  const requirements = Array.isArray(item.requirements || item.requisitos)
    ? (item.requirements || item.requisitos)
    : (typeof (item.requirements || item.requisitos) === 'string'
      ? (item.requirements || item.requisitos).split('\n').filter(Boolean)
      : []);

  const benefits = Array.isArray(item.benefits || item.beneficios)
    ? (item.benefits || item.beneficios)
    : (typeof (item.benefits || item.beneficios) === 'string'
      ? (item.benefits || item.beneficios).split('\n').filter(Boolean)
      : []);

  return {
    id: item.slug || item._id,
    title: item.title || item.titulo || item.puesto || 'Vacante',
    category: item.category || item.categoria || 'Operaciones',
    city: item.city || item.ciudad || item.ubicacion || 'Ciudad de México',
    type: item.type || item.tipo || item.jornada || 'Tiempo Completo',
    description: item.description || item.descripcion || item.detalle || '',
    requirements: requirements.length > 0 ? requirements : ['Experiencia en el área', 'Ganas de crecer'],
    benefits: benefits.length > 0 ? benefits : ['Prestaciones de ley', 'Excelente ambiente laboral'],
    source: 'wix-cms',
    raw: item,
  };
}

/**
 * Fetches job openings stored in Wix CMS collection "Vacantes".
 * Returns empty array if collection has no items.
 */
export async function getWixVacantes() {
  try {
    const res = await wixClient.items.query('Vacantes').limit(50).find();
    if (res.items && res.items.length > 0) {
      return res.items.map(normalizeVacanteItem);
    }
  } catch (err) {
    console.warn('Wix Headless: Error fetching Vacantes:', err?.message || err);
  }
  return [];
}

/**
 * Saves job application into Wix CMS collection "Bolsadetrabajo"
 * and local cache.
 */
export async function saveBolsaTrabajo(applicationData) {
  const folio = 'BT-' + Math.floor(100000 + Math.random() * 900000);
  const record = {
    title: `${applicationData.nombre || applicationData.name || 'Candidato'} - ${applicationData.puesto || applicationData.vacante || 'Postulación'} - ${folio}`,
    nombre: applicationData.nombre || applicationData.name || '',
    email: applicationData.email || '',
    telefono: applicationData.telefono || applicationData.phone || '',
    ciudad: applicationData.ciudad || applicationData.city || '',
    puesto: applicationData.puesto || applicationData.vacante || '',
    experiencia: applicationData.experiencia || applicationData.experience || '',
    cvUrl: applicationData.cvUrl || '',
    origen: applicationData.origen || 'Bolsa de Trabajo',
    folio,
    fecha: new Date().toISOString(),
  };

  // 0. Send Spanish email notification via FormSubmit.co (white template) to corporate inboxes
  sendFormSubmitEmail({
    seccion: record.origen,
    asuntoCorreo: `Jasman Bolsa de Trabajo — ${record.puesto || 'Postulación'} (${record.nombre || folio})`,
    correoRespuesta: record.email,
    campos: {
      'Folio de Postulación': record.folio,
      'Nombre Completo': record.nombre,
      'Teléfono / WhatsApp': record.telefono,
      'Correo Electrónico': record.email,
      'Ciudad': record.ciudad,
      'Vacante o Puesto': record.puesto,
      'Experiencia Laboral': record.experiencia,
      'Enlace CV': record.cvUrl,
    },
  }).catch((err) => console.warn('FormSubmit aviso (BolsaTrabajo):', err?.message || err));

  // 1. Always save in localStorage queue
  try {
    const existing = JSON.parse(localStorage.getItem('jasman_cms_bolsadetrabajo') || '[]');
    existing.unshift(record);
    localStorage.setItem('jasman_cms_bolsadetrabajo', JSON.stringify(existing.slice(0, 100)));
  } catch (e) {
    console.warn('Local storage save error:', e);
  }

  // 2. Insert into Wix CMS collection Bolsadetrabajo
  try {
    const inserted = await wixClient.items.insert('Bolsadetrabajo', record);
    console.log('Postulación guardada exitosamente en Wix CMS Bolsadetrabajo:', inserted._id);
    return { success: true, id: inserted._id, record };
  } catch (err) {
    console.warn('Wix Headless: Aviso al insertar en Bolsadetrabajo (asegúrate de que los permisos de la colección en Wix permitan agregar contenido):', err?.message || err);
    return { success: false, error: err?.message, record };
  }
}

/* ============================================================================
 * WIX MEMBERS & HEADLESS AUTHENTICATION + TIENDA SYNC
 * ============================================================================ */

/**
 * Checks if the current Wix OAuthStrategy session has an active Member token.
 */
export function isWixMemberLoggedIn() {
  try {
    return Boolean(wixClient.auth.loggedIn());
  } catch {
    return false;
  }
}

/**
 * Deterministic password digest for verifying credentials stored in Contactoweb cloud collection
 * when Wix Headless direct register is gated by reCAPTCHA.
 */
function computeCredentialDigest(email, password) {
  const raw = `jasman_auth_v1::${String(email || '').trim().toLowerCase()}::${String(password || '')}`;
  let h1 = 0xdeadbeef ^ raw.length;
  let h2 = 0x41c6ce57 ^ raw.length;
  for (let i = 0; i < raw.length; i++) {
    const ch = raw.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (h2 >>> 0).toString(16).padStart(8, '0') + (h1 >>> 0).toString(16).padStart(8, '0');
}

/**
 * Fetches member profile & orders stored in cloud collection ("Contactoweb")
 * by email so the user's account and order history stay synced across devices.
 */
export async function fetchWixMemberProfileAndOrders(email) {
  const cleanEmail = String(email || '').trim().toLowerCase();
  if (!cleanEmail) return { profile: null, orders: [], accountRecord: null };

  let profile = null;
  let accountRecord = null;
  const orders = [];

  try {
    const contactRes = await wixClient.items
      .query('Contactoweb')
      .eq('email', cleanEmail)
      .limit(50)
      .find();

    if (contactRes.items && contactRes.items.length > 0) {
      // Sort newest first by _createdDate
      const sorted = [...contactRes.items].sort(
        (a, b) => new Date(b._createdDate || 0) - new Date(a._createdDate || 0)
      );

      // Find explicit CUENTA_TIENDA account record first
      accountRecord =
        sorted.find((item) => item.tipo === 'CUENTA_TIENDA') || sorted[0];

      if (accountRecord) {
        profile = {
          wixId: accountRecord._id,
          nombre: accountRecord.nombre || cleanEmail.split('@')[0],
          correo: accountRecord.email || cleanEmail,
          telefono: accountRecord.telefono || '',
          sucursalPreferida: accountRecord.sucursal || 'jasman-satelite',
          wixMemberId: accountRecord._id,
          authProvider: 'jasman-cloud',
        };
      }

      // Extract all store orders saved under this email
      for (const item of sorted) {
        if (item.tipo === 'PEDIDO_TIENDA' && item.mensaje) {
          try {
            const parsedOrder = JSON.parse(item.mensaje);
            if (parsedOrder && parsedOrder.id) {
              orders.push({
                ...parsedOrder,
                status: parsedOrder.status || 'Solicitud confirmada',
                source: 'cloud',
              });
            }
          } catch {
            // ignore malformed JSON
          }
        }
      }
    }
    // Also pull live Wix eCommerce orders by buyer email via /api/order?email=...
    if (typeof window !== 'undefined') {
      try {
        const ecomRes = await fetch(
          `/api/order?email=${encodeURIComponent(cleanEmail)}`
        );
        if (ecomRes.ok) {
          const ecomData = await ecomRes.json();
          if (Array.isArray(ecomData?.orders)) {
            const seenIds = new Set(orders.map((o) => String(o.id)));
            for (const wo of ecomData.orders) {
              const displayId = wo.orderNumber || wo.orderId;
              if (!displayId || seenIds.has(String(displayId))) continue;
              seenIds.add(String(displayId));

              let statusLabel = 'Pagado · En preparación';
              if (wo.fulfillmentStatus === 'FULFILLED') {
                statusLabel = 'Pagado · Enviado';
              } else if (wo.paymentStatus === 'NOT_PAID') {
                statusLabel = 'Pago pendiente';
              }

              orders.unshift({
                id: displayId,
                wixOrderId: wo.orderId,
                createdAt: wo.createdDate || new Date().toISOString(),
                status: statusLabel,
                items: (wo.items || []).map((it) => ({
                  id: it.sku || it.id,
                  wixId: it.catalogItemId || null,
                  reference: it.sku || '',
                  name: it.name || 'Llanta Oficial Jasman',
                  quantity: it.quantity || 1,
                  unitPrice: it.netPriceNum || it.originalPriceNum || 0,
                })),
                subtotal: wo.subtotalAmount || 0,
                total: wo.totalAmount || 0,
                couponCode: wo.couponCode || null,
                branchName: wo.shippingAddress || 'Entrega a Domicilio Nacional',
                customer: {
                  nombre: wo.customerName || profile?.nombre || cleanEmail,
                  correo: wo.customerEmail || cleanEmail,
                  telefono: wo.customerPhone || profile?.telefono || '',
                },
                source: 'wix-ecom',
              });
            }
          }
        }
      } catch {
        // non-blocking if offline
      }
    }
  } catch (err) {
    console.warn('Error consultando perfil y pedidos:', err?.message || err);
  }

  return { profile, orders, accountRecord };
}

/**
 * Registers a new member or updates an existing member profile,
 * syncing credentials and profile into Wix Headless & Contactoweb cloud storage.
 */
export async function registerWixMember({
  nombre,
  correo,
  password,
  telefono,
  sucursalPreferida = 'jasman-satelite',
  isUpdate = false,
}) {
  const cleanEmail = String(correo || '').trim().toLowerCase();
  const cleanName = String(nombre || '').trim();
  const cleanPhone = String(telefono || '').trim();

  if (!cleanEmail) {
    return {
      success: false,
      errorCode: 'invalidEmail',
      message: 'Ingresa un correo electrónico válido.',
    };
  }

  if (!isUpdate && (!password || password.length < 6)) {
    return {
      success: false,
      errorCode: 'weakPassword',
      message: 'La contraseña debe tener al menos 6 caracteres.',
    };
  }

  // 1. Check if an account already exists in cloud storage when registering a new user
  const existingData = await fetchWixMemberProfileAndOrders(cleanEmail);
  if (
    !isUpdate &&
    existingData.accountRecord &&
    existingData.accountRecord.tipo === 'CUENTA_TIENDA'
  ) {
    return {
      success: false,
      errorCode: 'emailAlreadyExists',
      message: 'Este correo ya está registrado. Inicia sesión con tu contraseña.',
    };
  }

  let wixAuthState = null;
  let wixSessionToken = null;
  let memberTokens = null;

  // 2. Attempt native Wix Identity Registration (succeeds when captcha is not required on domain)
  if (!isUpdate && password && password.length >= 6) {
    try {
      const response = await wixClient.auth.register({
        email: cleanEmail,
        password,
        profile: {
          nickname: cleanName || cleanEmail.split('@')[0],
          phones: cleanPhone ? [cleanPhone] : [],
        },
      });
      wixAuthState = response?.loginState || null;

      if (response?.loginState === 'SUCCESS' && response?.data?.sessionToken) {
        wixSessionToken = response.data.sessionToken;
        memberTokens = await wixClient.auth.getMemberTokensForDirectLogin(wixSessionToken);
        wixClient.auth.setTokens(memberTokens);
        persistWixTokens(memberTokens);
      } else if (response?.loginState === 'FAILURE') {
        const errCode = response?.errorCode || response?.error;
        if (errCode === 'emailAlreadyExists') {
          return {
            success: false,
            errorCode: 'emailAlreadyExists',
            message: 'Este correo ya está registrado. Inicia sesión con tu contraseña.',
          };
        }
      }
    } catch {
      // Fallback to Contactoweb cloud account storage
    }
  }

  // 3. Persist Account & Password Digest in Contactoweb cloud collection
  const previousAuthHash =
    existingData.accountRecord?.asunto?.startsWith('AUTH_HASH:')
      ? existingData.accountRecord.asunto
      : null;

  const authHashField = password
    ? `AUTH_HASH:${computeCredentialDigest(cleanEmail, password)}`
    : previousAuthHash || 'AUTH_HASH:OPEN';

  let cloudId = existingData.accountRecord?._id || null;
  try {
    const inserted = await wixClient.items.insert('Contactoweb', {
      title: `Cuenta Cliente - ${cleanName} (${cleanEmail})`,
      nombre: cleanName,
      email: cleanEmail,
      telefono: cleanPhone,
      sucursal: sucursalPreferida,
      tipo: 'CUENTA_TIENDA',
      asunto: authHashField,
      mensaje: JSON.stringify({
        nombre: cleanName,
        correo: cleanEmail,
        telefono: cleanPhone,
        sucursalPreferida,
        updatedAt: new Date().toISOString(),
      }),
      origen: 'Clientes Tienda Online',
      fecha: new Date().toISOString(),
    });
    cloudId = inserted?._id || cloudId;
  } catch (err) {
    console.warn('Aviso al guardar cuenta en nube:', err?.message || err);
  }

  sendFormSubmitEmail({
    seccion: isUpdate ? 'Actualización de Perfil — Tienda Jasman' : 'Registro de Nueva Cuenta — Tienda Jasman',
    asuntoCorreo: isUpdate
      ? `Jasman Tienda — Perfil actualizado (${cleanName || cleanEmail})`
      : `Jasman Tienda — Nuevo cliente registrado (${cleanName || cleanEmail})`,
    correoRespuesta: cleanEmail,
    campos: {
      'Nombre Completo': cleanName,
      'Correo Electrónico': cleanEmail,
      'Teléfono / WhatsApp': cleanPhone,
      'Sucursal Preferida': sucursalPreferida,
      'Tipo de Movimiento': isUpdate ? 'Actualización de datos de cuenta' : 'Alta de nueva cuenta en Tienda Online',
    },
  }).catch((err) => console.warn('FormSubmit aviso (Cuenta Tienda):', err?.message || err));

  const memberProfile = {
    nombre: cleanName,
    correo: cleanEmail,
    telefono: cleanPhone,
    sucursalPreferida,
    wixMemberId: cloudId || `usr-${Date.now()}`,
    wixAuthState: wixAuthState || 'ACTIVE_ACCOUNT',
    hasMemberTokens: Boolean(memberTokens),
    authProvider: 'jasman-account',
    updatedAt: new Date().toISOString(),
  };

  return {
    success: true,
    member: memberProfile,
    orders: existingData.orders || [],
    wixAuthState: memberProfile.wixAuthState,
  };
}

/**
 * Logs in an existing member by verifying credentials against both Wix Identity
 * and the Contactoweb cloud account registry, then restores profile & orders.
 */
export async function loginWixMember({ correo, password }) {
  const cleanEmail = String(correo || '').trim().toLowerCase();
  if (!cleanEmail) {
    return {
      success: false,
      errorCode: 'invalidEmail',
      message: 'Ingresa tu correo electrónico.',
    };
  }
  if (!password) {
    return {
      success: false,
      errorCode: 'invalidPassword',
      message: 'Ingresa tu contraseña para iniciar sesión.',
    };
  }

  let wixAuthState = null;
  let memberTokens = null;
  let nativeLoginSucceeded = false;

  // 1. Attempt native Wix Identity Direct Login first
  try {
    const response = await wixClient.auth.login({
      email: cleanEmail,
      password,
    });
    wixAuthState = response?.loginState || null;

    if (response?.loginState === 'SUCCESS' && response?.data?.sessionToken) {
      nativeLoginSucceeded = true;
      memberTokens = await wixClient.auth.getMemberTokensForDirectLogin(
        response.data.sessionToken
      );
      wixClient.auth.setTokens(memberTokens);
      persistWixTokens(memberTokens);
    } else if (response?.loginState === 'FAILURE') {
      const errCode = response?.errorCode || response?.error;
      // If email exists in native Wix Members but password is wrong, reject immediately
      if (errCode === 'invalidPassword') {
        return {
          success: false,
          errorCode: 'invalidPassword',
          message: 'Contraseña incorrecta. Verifica tus datos e intenta nuevamente.',
        };
      }
    }
  } catch {
    // Continue to cloud account verification
  }

  // 2. Fetch synced profile, account record, and orders from Contactoweb cloud collection
  const { profile, orders, accountRecord } = await fetchWixMemberProfileAndOrders(cleanEmail);

  if (!nativeLoginSucceeded) {
    // Verify that the account exists in our cloud registry
    if (!accountRecord) {
      return {
        success: false,
        errorCode: 'invalidEmail',
        message: 'No encontramos una cuenta con ese correo electrónico. Crea tu cuenta primero.',
      };
    }

    // Verify password hash if stored on the account record
    if (
      accountRecord.asunto &&
      accountRecord.asunto.startsWith('AUTH_HASH:') &&
      accountRecord.asunto !== 'AUTH_HASH:OPEN'
    ) {
      const expectedHash = `AUTH_HASH:${computeCredentialDigest(cleanEmail, password)}`;
      if (accountRecord.asunto !== expectedHash) {
        return {
          success: false,
          errorCode: 'invalidPassword',
          message: 'Contraseña incorrecta. Verifica tus datos e intenta nuevamente.',
        };
      }
    }
  }

  const memberProfile = {
    nombre: profile?.nombre || cleanEmail.split('@')[0],
    correo: cleanEmail,
    telefono: profile?.telefono || '',
    sucursalPreferida: profile?.sucursalPreferida || 'jasman-satelite',
    wixMemberId: profile?.wixMemberId || `usr-${Date.now()}`,
    wixAuthState: wixAuthState || 'ACTIVE_SESSION',
    hasMemberTokens: Boolean(memberTokens) || isWixMemberLoggedIn(),
    authProvider: 'jasman-account',
    updatedAt: new Date().toISOString(),
  };

  return {
    success: true,
    member: memberProfile,
    orders,
    wixAuthState: memberProfile.wixAuthState,
  };
}

/**
 * Initiates OAuth 2.0 PKCE Social Login (Google / Facebook) via Wix Headless Identity Provider.
 * @param {'google' | 'facebook'} provider
 * @param {string} returnPath
 */
export async function startWixSocialLogin(
  provider = 'google',
  returnPath = '/landing-tienda-preview/cuenta'
) {
  if (typeof window === 'undefined') return { success: false };
  const origin = window.location.origin;
  const originalUri = window.location.href;
  const primaryRedirectUri = `${origin}/landing-tienda-preview/cuenta`;
  const isWhitelistedDomain =
    origin.includes('jasman-delta.vercel.app') ||
    origin.includes('jasman.com.mx');

  try {
    // Direct instant OAuth redirect on production & Vercel preview domains where Redirect URI is registered
    if (isWhitelistedDomain) {
      const oauthData = wixClient.auth.generateOAuthData(primaryRedirectUri, originalUri);
      window.localStorage.setItem(
        WIX_OAUTH_DATA_KEY,
        JSON.stringify({ ...oauthData, provider })
      );
      const { authUrl } = await wixClient.auth.getAuthUrl(oauthData, {
        idp: provider,
        prompt: 'login',
      });
      window.location.href = authUrl;
      return { success: true, redirected: true, authUrl };
    }

    const candidateRedirectUris = [
      `${origin}${returnPath}`,
      primaryRedirectUri,
      origin,
    ];

    for (const redirectUri of candidateRedirectUris) {
      const oauthData = wixClient.auth.generateOAuthData(redirectUri, originalUri);
      const { authUrl } = await wixClient.auth.getAuthUrl(oauthData, {
        idp: provider,
        prompt: 'login',
      });

      try {
        const checkRes = await fetch(
          `/api/wix-oauth-check?url=${encodeURIComponent(authUrl)}`
        );
        const contentType = checkRes.headers.get('content-type') || '';
        if (checkRes.ok && contentType.includes('application/json')) {
          const checkJson = await checkRes.json();
          if (checkJson.allowed) {
            window.localStorage.setItem(
              WIX_OAUTH_DATA_KEY,
              JSON.stringify({ ...oauthData, provider })
            );
            window.location.href = authUrl;
            return { success: true, redirected: true, authUrl };
          }
        }
      } catch {
        // Fallback if preflight endpoint is unreachable
      }
    }

    return {
      success: false,
      useSocialModal: true,
      provider,
      requiredRedirectUri: primaryRedirectUri,
    };
  } catch (err) {
    console.warn(`Social Login (${provider}) aviso:`, err?.message || err);
    return {
      success: false,
      useSocialModal: true,
      provider,
      requiredRedirectUri: primaryRedirectUri,
    };
  }
}

/**
 * Completes social sign-in via the in-page Google / Facebook Quick-Connect modal,
 * syncing the member's profile and order history in cloud storage.
 */
export async function completeSocialQuickAuth({
  provider = 'google',
  correo,
  nombre,
  sucursalPreferida = 'jasman-satelite',
}) {
  const cleanEmail = String(correo || '').trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes('@')) {
    return {
      success: false,
      message: 'Ingresa el correo electrónico de tu cuenta.',
    };
  }

  const providerLabel = provider === 'facebook' ? 'Facebook' : 'Google';
  const { profile, orders, accountRecord } = await fetchWixMemberProfileAndOrders(cleanEmail);
  const resolvedName =
    String(nombre || '').trim() ||
    profile?.nombre ||
    cleanEmail.split('@')[0];

  let cloudId = accountRecord?._id || null;
  if (!accountRecord) {
    try {
      const inserted = await wixClient.items.insert('Contactoweb', {
        title: `Cuenta ${providerLabel} - ${resolvedName} (${cleanEmail})`,
        nombre: resolvedName,
        email: cleanEmail,
        telefono: '',
        sucursal: sucursalPreferida,
        tipo: 'CUENTA_TIENDA',
        asunto: 'AUTH_HASH:OPEN',
        mensaje: JSON.stringify({
          nombre: resolvedName,
          correo: cleanEmail,
          telefono: '',
          sucursalPreferida,
          authProvider: provider,
          updatedAt: new Date().toISOString(),
        }),
        origen: `Acceso Social (${providerLabel})`,
        fecha: new Date().toISOString(),
      });
      cloudId = inserted?._id || null;
    } catch {
      // ignore cloud insert notice
    }
  }

  const memberProfile = {
    nombre: resolvedName,
    correo: cleanEmail,
    telefono: profile?.telefono || '',
    sucursalPreferida: profile?.sucursalPreferida || sucursalPreferida,
    wixMemberId: cloudId || `oauth-${provider}-${Date.now()}`,
    wixAuthState: 'ACTIVE_SOCIAL_SESSION',
    hasMemberTokens: true,
    authProvider: provider,
    updatedAt: new Date().toISOString(),
  };

  return {
    success: true,
    member: memberProfile,
    orders: orders || [],
  };
}

/**
 * Initiates Managed OAuth 2.0 PKCE Redirect Login flow.
 */
export async function startWixOAuthRedirect(returnPath = '/landing-tienda-preview/cuenta') {
  return startWixSocialLogin(undefined, returnPath);
}

/**
 * Completes OAuth 2.0 PKCE callback if `code` and `state` are present in the URL hash or query.
 */
export async function completeWixOAuthCallbackIfPresent() {
  if (typeof window === 'undefined') return null;
  try {
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const queryParams = new URLSearchParams(window.location.search);
    const hasHashCallback = hashParams.has('code') && hashParams.has('state');
    const hasQueryCallback = queryParams.has('code') && queryParams.has('state');

    if (!hasHashCallback && !hasQueryCallback) return null;

    const rawOAuth = window.localStorage.getItem(WIX_OAUTH_DATA_KEY);
    if (!rawOAuth) return null;
    const oauthData = JSON.parse(rawOAuth);

    const responseMode = hasHashCallback ? 'fragment' : 'query';
    const { code, state, error } = wixClient.auth.parseFromUrl(
      window.location.href,
      responseMode
    );
    if (error || !code) return null;

    const tokens = await wixClient.auth.getMemberTokens(code, state, oauthData);
    wixClient.auth.setTokens(tokens);
    persistWixTokens(tokens);
    window.localStorage.removeItem(WIX_OAUTH_DATA_KEY);

    // Clean URL hash and query params
    window.history.replaceState({}, document.title, window.location.pathname);

    const provider = oauthData.provider || 'google';
    const providerLabel =
      provider === 'facebook'
        ? 'Facebook'
        : provider === 'google'
          ? 'Google'
          : 'Red Social';

    // Fetch real authenticated member profile (email, name, phone) using OAuth access token
    let realEmail = '';
    let realName = '';
    let realPhone = '';
    let wixMemberId = `oauth-${Date.now()}`;

    try {
      const accessTokenValue = tokens?.accessToken?.value;
      if (accessTokenValue) {
        const meRes = await fetch(
          'https://www.wixapis.com/members/v1/members/my?fieldsets=FULL',
          {
            headers: {
              Authorization: accessTokenValue,
            },
          }
        );
        if (meRes.ok) {
          const meData = await meRes.json();
          const m = meData?.member;
          if (m) {
            wixMemberId = m.id || wixMemberId;
            realEmail =
              m.loginEmail ||
              m.contact?.emails?.[0] ||
              '';
            const fullContactName = [m.contact?.firstName, m.contact?.lastName]
              .filter(Boolean)
              .join(' ')
              .trim();
            realName =
              fullContactName ||
              m.profile?.nickname ||
              '';
            realPhone = m.contact?.phones?.[0] || '';
          }
        }
      }
    } catch {
      // Fallback if member profile endpoint is unavailable
    }

    if (realEmail) {
      const synced = await completeSocialQuickAuth({
        provider,
        correo: realEmail,
        nombre: realName || `Cliente Jasman (${providerLabel})`,
      });
      if (synced.success && synced.member) {
        return {
          tokens,
          provider,
          orders: synced.orders || [],
          member: {
            ...synced.member,
            telefono: synced.member.telefono || realPhone,
            wixMemberId,
            hasMemberTokens: true,
          },
        };
      }
    }

    return {
      tokens,
      provider,
      orders: [],
      member: {
        nombre: realName || `Cliente Jasman (${providerLabel})`,
        correo: realEmail || `cuenta.${provider}@jasman.com.mx`,
        telefono: realPhone,
        sucursalPreferida: 'jasman-satelite',
        wixMemberId,
        hasMemberTokens: true,
        authProvider: provider,
        updatedAt: new Date().toISOString(),
      },
    };
  } catch (err) {
    console.warn('Error completando callback OAuth:', err?.message || err);
    return null;
  }
}

/**
 * Sends a Wix Members password reset email.
 */
export async function sendWixPasswordReset(email) {
  const cleanEmail = String(email || '').trim().toLowerCase();
  if (!cleanEmail) return { success: false, message: 'Ingresa tu correo electrónico.' };
  try {
    const redirectUri =
      typeof window !== 'undefined'
        ? `${window.location.origin}/landing-tienda-preview`
        : 'https://www.jasman.com.mx';
    await wixClient.auth.sendPasswordResetEmail(cleanEmail, redirectUri);
    return {
      success: true,
      message: `Enviamos un enlace de recuperación de contraseña a ${cleanEmail}.`,
    };
  } catch (err) {
    console.warn('Password Reset aviso:', err?.message || err);
    return {
      success: false,
      message:
        'Solicitud recibida. Si tu correo está registrado, recibirás las instrucciones en breve.',
    };
  }
}

/**
 * Logs out the current Wix Member and resets visitor tokens.
 */
export async function logoutWixMember() {
  persistWixTokens(null);
  try {
    const visitorTokens = await wixClient.auth.generateVisitorTokens();
    wixClient.auth.setTokens(visitorTokens);
  } catch {
    // ignore
  }
}

const WIX_STORES_APP_ID = '215238eb-22a5-4c36-9e7b-e7c08025e04e';

/**
 * Creates a real Wix eCommerce Checkout session from the store cart items
 * using each product's live `wixId` (`Stores/Products` `_id`).
 */
export async function createWixEcommerceCheckout(orderRecord) {
  if (!orderRecord || !Array.isArray(orderRecord.items) || orderRecord.items.length === 0) {
    return null;
  }

  try {
    if (!wixClient.auth.loggedIn()) {
      const vt = await wixClient.auth.generateVisitorTokens();
      wixClient.auth.setTokens(vt);
    }
    const lineItems = orderRecord.items
      .filter((item) => item.wixId)
      .map((item) => ({
        catalogReference: {
          appId: WIX_STORES_APP_ID,
          catalogItemId: item.wixId,
        },
        quantity: Math.max(1, Number(item.quantity) || 1),
      }));

    if (lineItems.length === 0) return null;

    const payload = {
      lineItems,
      channelType: 'WEB',
    };

    if (orderRecord.couponCode) {
      payload.couponCode = orderRecord.couponCode;
    }

    const email = String(orderRecord.customer?.correo || '').trim().toLowerCase();
    if (email && email.includes('@')) {
      payload.buyerInfo = { email };
    }

    const res = await wixClient.fetchWithAuth('https://www.wixapis.com/ecom/v1/checkouts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) return null;
    const data = await res.json();
    return data?.checkout || null;
  } catch (err) {
    console.warn('Aviso al crear checkout eCom en Wix:', err?.message || err);
    return null;
  }
}

/**
 * Saves a store order into Wix eCommerce Checkouts AND the cloud collection ("Contactoweb")
 * linked to the customer's email.
 */
export async function saveWixTiendaOrder(orderRecord) {
  if (!orderRecord) return null;
  const cleanEmail = String(orderRecord.customer?.correo || '').trim().toLowerCase();
  const cleanName = orderRecord.customer?.nombre || 'Cliente Tienda';
  const cleanPhone = orderRecord.customer?.telefono || '';

  try {
    const ecomCheckout = await createWixEcommerceCheckout(orderRecord);
    const enrichedOrder = ecomCheckout?.id
      ? { ...orderRecord, wixCheckoutId: ecomCheckout.id }
      : orderRecord;

    await wixClient.items.insert('Contactoweb', {
      title: `Pedido Tienda ${orderRecord.id} - ${cleanName}`,
      folio: orderRecord.id,
      nombre: cleanName,
      email: cleanEmail,
      telefono: cleanPhone,
      sucursal: orderRecord.branchName || '',
      cupon: orderRecord.couponCode || '',
      tipo: 'PEDIDO_TIENDA',
      asunto: ecomCheckout?.id ? `${orderRecord.id} (eCom: ${ecomCheckout.id})` : orderRecord.id,
      mensaje: JSON.stringify(enrichedOrder),
      origen: 'Pedido Tienda Online',
      fecha: orderRecord.createdAt || new Date().toISOString(),
    });
    return enrichedOrder;
  } catch (err) {
    console.warn('Aviso al guardar pedido en nube:', err?.message || err);
  }
  return orderRecord;
}

/* ============================================================================
 * WIX STORES PRODUCTS CATALOG INTEGRATION ("Stores/Products")
 * ============================================================================ */

const WIX_PRODUCTS_SESSION_KEY = 'jasman_wix_store_products_cache_v2';
let wixProductsMemoryCache = null;
let wixProductsFetchPromise = null;

export function getCachedWixStoreProductsSync() {
  if (Array.isArray(wixProductsMemoryCache) && wixProductsMemoryCache.length > 0) {
    return wixProductsMemoryCache;
  }
  if (typeof window === 'undefined') return null;
  try {
    const cached = window.sessionStorage.getItem(WIX_PRODUCTS_SESSION_KEY);
    if (!cached) return null;
    const parsed = JSON.parse(cached);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : null;
  } catch {
    return null;
  }
}

/**
 * Fetches all products from the Wix Stores catalog ("Stores/Products"),
 * paginating in parallel to retrieve all items (336+ tires) including assigned Collections.
 * Always fetches live from Wix once per page load so dashboard edits reflect on refresh.
 */
export async function getWixStoreProducts({ forceRefresh = false } = {}) {
  if (!forceRefresh && Array.isArray(wixProductsMemoryCache) && wixProductsMemoryCache.length > 0) {
    return wixProductsMemoryCache;
  }

  if (wixProductsFetchPromise) {
    return wixProductsFetchPromise;
  }

  wixProductsFetchPromise = (async () => {
    try {
      const allItems = [];
      let includeCollections = true;
      let res;
      try {
        res = await wixClient.items.query('Stores/Products').include('collections').limit(100).find();
      } catch {
        includeCollections = false;
        res = await wixClient.items.query('Stores/Products').limit(100).find();
      }
      if (res?.items?.length) {
        allItems.push(...res.items);
      }

      const fetchBatchPage = (skip) => {
        const q = wixClient.items.query('Stores/Products');
        return (includeCollections ? q.include('collections') : q)
          .skip(skip)
          .limit(100)
          .find();
      };

      const totalCount = typeof res?.totalCount === 'number' ? res.totalCount : 0;
      if (totalCount > allItems.length) {
        const offsets = [];
        for (let skip = allItems.length; skip < totalCount; skip += 100) {
          offsets.push(skip);
        }
        const pageResults = await Promise.all(offsets.map(fetchBatchPage));
        for (const pageRes of pageResults) {
          if (pageRes?.items?.length) {
            allItems.push(...pageRes.items);
          }
        }
      } else if (res && typeof res.hasNext === 'function' && res.hasNext()) {
        // Stores/Products omits totalCount; batch 3 parallel pages at a time to cut latency
        let nextOffset = allItems.length;
        let hasMore = true;
        while (hasMore) {
          const offsets = [nextOffset, nextOffset + 100, nextOffset + 200];
          const batchResults = await Promise.all(offsets.map(fetchBatchPage));
          for (const pageRes of batchResults) {
            if (pageRes?.items?.length) {
              allItems.push(...pageRes.items);
            }
          }
          const lastPage = batchResults[batchResults.length - 1];
          hasMore = Boolean(lastPage?.items?.length === 100 && lastPage?.hasNext?.());
          nextOffset += offsets.length * 100;
        }
      }

      if (allItems.length > 0) {
        wixProductsMemoryCache = allItems;
        if (typeof window !== 'undefined') {
          try {
            window.sessionStorage.setItem(WIX_PRODUCTS_SESSION_KEY, JSON.stringify(allItems));
          } catch {
            // ignore storage quota errors
          }
        }
      }
      return allItems;
    } catch (err) {
      console.warn('Error consultando Stores/Products:', err?.message || err);
      const cached = getCachedWixStoreProductsSync();
      if (cached) return cached;
      return wixProductsMemoryCache || [];
    } finally {
      wixProductsFetchPromise = null;
    }
  })();

  return wixProductsFetchPromise;
}
