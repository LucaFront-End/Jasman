import { createClient, OAuthStrategy } from '@wix/sdk';
import { items } from '@wix/data';

export const WIX_CLIENT_ID = '5aabc542-16cf-44de-bedf-d8eb7ad08c46';
export const WIX_SITE_ID = '7fd3b8ea-a3f3-4b51-9b48-4ec1f53d2cc9';

// Initialize Wix Headless Client with OAuthStrategy
export const wixClient = createClient({
  modules: { items },
  auth: OAuthStrategy({
    clientId: WIX_CLIENT_ID,
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

        return {
          id: b._id,
          name: cleanName || title,
          fullName: title.startsWith('Jasman') ? title : `Jasman Automotriz - Suc. ${title}`,
          address: fullAddr,
          city,
          state,
          lat: Number(lat),
          lng: Number(lng),
          phone: phone ? `${phone.slice(0, 2)} ${phone.slice(2, 6)} ${phone.slice(6)}` : '55 7933 7994',
          whatsappUrl: b.whatsapp || null,
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

    // 2. Also register in Contactoweb CMS collection
    try {
      await saveContactoWeb({
        nombre: leadRecord.nombre,
        telefono: leadRecord.telefono,
        sucursal: leadRecord.sucursalNombre,
        asunto: `Cita: ${leadRecord.vehiculo || 'Automóvil'} - ${leadRecord.fechaVisita || 'Por agendar'}`,
        mensaje: `Folio: ${leadRecord.folio} | Promo: ${leadRecord.promocion || 'Alineación y Balanceo'}`,
        origen: 'Landing Promociones',
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
 * Saves ANY web contact form submission into Wix CMS collection "Contactoweb"
 * and local cache.
 */
export async function saveContactoWeb(contactData) {
  const folio = 'CW-' + Math.floor(100000 + Math.random() * 900000);
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

