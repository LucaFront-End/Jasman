import { createClient, OAuthStrategy } from '@wix/sdk';
import { items } from '@wix/data';

export const WIX_CLIENT_ID = '5aabc542-16cf-44de-bedf-d8eb7ad08c46';
export const WIX_SITE_ID = '7fd3b8ea-a3f3-4b51-9b48-4ec1f53d2cc9';

const WIX_TOKENS_STORAGE_KEY = 'jasman_wix_member_tokens_v1';
const WIX_OAUTH_DATA_KEY = 'jasman_wix_oauth_data_v1';

function getStoredWixTokens() {
  if (typeof window === 'undefined') return undefined;
  try {
    const raw = window.localStorage.getItem(WIX_TOKENS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : undefined;
  } catch {
    return undefined;
  }
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

// Initialize Wix Headless Client with OAuthStrategy
export const wixClient = createClient({
  modules: { items },
  auth: OAuthStrategy({
    clientId: WIX_CLIENT_ID,
    tokens: getStoredWixTokens(),
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
 * Fetches member profile & orders stored in Wix CMS ("ClientesTienda" / "Contactoweb" / "PedidosTienda")
 * by email so the user's account stays synced across devices.
 */
export async function fetchWixMemberProfileAndOrders(email) {
  const cleanEmail = String(email || '').trim().toLowerCase();
  if (!cleanEmail) return { profile: null, orders: [] };

  let profile = null;
  let orders = [];

  // 1. Try querying dedicated "ClientesTienda" collection first, then "Contactoweb"
  try {
    const res = await wixClient.items
      .query('ClientesTienda')
      .eq('email', cleanEmail)
      .limit(1)
      .find();
    if (res.items && res.items.length > 0) {
      const item = res.items[0];
      profile = {
        wixId: item._id,
        nombre: item.nombre || item.title || cleanEmail.split('@')[0],
        correo: item.email || cleanEmail,
        telefono: item.telefono || '',
        sucursalPreferida: item.sucursalPreferida || 'jasman-satelite',
        wixMemberId: item.wixMemberId || item._id,
        authProvider: 'wix-members',
      };
    }
  } catch {
    // Fallback to Contactoweb lookup
    try {
      const contactRes = await wixClient.items
        .query('Contactoweb')
        .eq('email', cleanEmail)
        .limit(1)
        .find();
      if (contactRes.items && contactRes.items.length > 0) {
        const c = contactRes.items[0];
        profile = {
          wixId: c._id,
          nombre: c.nombre || cleanEmail.split('@')[0],
          correo: c.email || cleanEmail,
          telefono: c.telefono || '',
          sucursalPreferida: c.sucursal || 'jasman-satelite',
          wixMemberId: c._id,
          authProvider: 'wix-cms',
        };
      }
    } catch {
      // Ignore if query restricted
    }
  }

  // 2. Try querying "PedidosTienda" collection for orders belonging to this member
  try {
    const ordersRes = await wixClient.items
      .query('PedidosTienda')
      .eq('email', cleanEmail)
      .limit(25)
      .find();
    if (ordersRes.items && ordersRes.items.length > 0) {
      orders = ordersRes.items.map((o) => ({
        id: o.folio || o.title || o._id,
        createdAt: o.fecha || o._createdDate || new Date().toISOString(),
        status: o.status || 'Solicitud confirmada',
        total: Number(o.total) || 0,
        subtotal: Number(o.subtotal) || 0,
        discountAmount: Number(o.descuento) || 0,
        couponCode: o.cupon || null,
        branchName: o.sucursal || 'Sucursal Jasman',
        items: Array.isArray(o.items) ? o.items : [],
        source: 'cloud',
      }));
    }
  } catch {
    // Ignore if collection "PedidosTienda" isn't created yet
  }

  return { profile, orders };
}

/**
 * Registers a new member using Wix Headless OAuthStrategy (`wixClient.auth.register`)
 * and syncs their profile into Wix CMS (`ClientesTienda` + `Contactoweb`).
 */
export async function registerWixMember({
  nombre,
  correo,
  password,
  telefono,
  sucursalPreferida = 'jasman-satelite',
}) {
  const cleanEmail = String(correo || '').trim().toLowerCase();
  const cleanName = String(nombre || '').trim();
  const cleanPhone = String(telefono || '').trim();

  let wixAuthState = null;
  let wixSessionToken = null;
  let memberTokens = null;

  // 1. Attempt native Wix Members Identity Registration
  if (password && password.length >= 6) {
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
    } catch (err) {
      console.warn('Wix Members Direct Register aviso:', err?.message || err);
    }
  }

  // 2. Sync Member Profile to Wix CMS ("ClientesTienda" & "Contactoweb")
  let cmsId = null;
  try {
    const inserted = await wixClient.items.insert('ClientesTienda', {
      title: `${cleanName} - ${cleanEmail}`,
      nombre: cleanName,
      email: cleanEmail,
      telefono: cleanPhone,
      sucursalPreferida,
      wixAuthState: wixAuthState || 'CMS_MEMBER',
      fechaRegistro: new Date().toISOString(),
    });
    cmsId = inserted?._id || null;
  } catch {
    // Also register in Contactoweb so it's always visible in Wix Dashboard
  }

  const contactSync = await saveContactoWeb({
    nombre: cleanName,
    correo: cleanEmail,
    telefono: cleanPhone,
    sucursal: sucursalPreferida,
    asunto: 'Registro Miembro Wix Tienda Jasman',
    mensaje: `Miembro registrado en Tienda Online (${wixAuthState || 'Wix Headless SDK'})`,
    origen: 'Wix Members Tienda',
  });

  const memberProfile = {
    nombre: cleanName,
    correo: cleanEmail,
    telefono: cleanPhone,
    sucursalPreferida,
    wixMemberId: cmsId || contactSync?.id || `wix-${Date.now()}`,
    wixAuthState: wixAuthState || 'ACTIVE_CMS_MEMBER',
    hasMemberTokens: Boolean(memberTokens),
    authProvider: 'wix-members',
    updatedAt: new Date().toISOString(),
  };

  return {
    success: true,
    member: memberProfile,
    wixAuthState: memberProfile.wixAuthState,
  };
}

/**
 * Logs in an existing member using Wix Headless OAuthStrategy (`wixClient.auth.login`)
 * and retrieves their synced profile and orders from Wix CMS.
 */
export async function loginWixMember({ correo, password }) {
  const cleanEmail = String(correo || '').trim().toLowerCase();
  let wixAuthState = null;
  let memberTokens = null;

  // 1. Attempt native Wix Members Direct Login
  if (password) {
    try {
      const response = await wixClient.auth.login({
        email: cleanEmail,
        password,
      });
      wixAuthState = response?.loginState || null;

      if (response?.loginState === 'SUCCESS' && response?.data?.sessionToken) {
        memberTokens = await wixClient.auth.getMemberTokensForDirectLogin(
          response.data.sessionToken
        );
        wixClient.auth.setTokens(memberTokens);
        persistWixTokens(memberTokens);
      } else if (response?.loginState === 'FAILURE') {
        const errCode = response?.errorCode || response?.error;
        if (errCode === 'invalidPassword' || errCode === 'invalidEmail') {
          return {
            success: false,
            errorCode: errCode,
            message:
              errCode === 'invalidPassword'
                ? 'Contraseña incorrecta. Verifica tus datos e intenta nuevamente.'
                : 'No encontramos una cuenta con ese correo electrónico.',
          };
        }
      }
    } catch (err) {
      console.warn('Wix Members Direct Login aviso:', err?.message || err);
    }
  }

  // 2. Fetch synced profile and orders from Wix CMS
  const { profile, orders } = await fetchWixMemberProfileAndOrders(cleanEmail);

  const memberProfile = {
    nombre: profile?.nombre || cleanEmail.split('@')[0],
    correo: cleanEmail,
    telefono: profile?.telefono || '',
    sucursalPreferida: profile?.sucursalPreferida || 'jasman-satelite',
    wixMemberId: profile?.wixMemberId || `wix-${Date.now()}`,
    wixAuthState: wixAuthState || (profile ? 'SYNCED_WIX_CMS' : 'ACTIVE_SESSION'),
    hasMemberTokens: Boolean(memberTokens) || isWixMemberLoggedIn(),
    authProvider: 'wix-members',
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
 * Initiates Wix Managed OAuth 2.0 PKCE Redirect Login flow.
 * Note: Requires the current origin/URI to be added under Headless Settings -> Allowed Authorization Redirect URIs in Wix Dashboard.
 */
export async function startWixOAuthRedirect(returnPath = '/landing-tienda-preview') {
  if (typeof window === 'undefined') return { success: false };
  try {
    const redirectUri = `${window.location.origin}${returnPath}`;
    const originalUri = window.location.href;
    const oauthData = wixClient.auth.generateOAuthData(redirectUri, originalUri);
    window.localStorage.setItem(WIX_OAUTH_DATA_KEY, JSON.stringify(oauthData));
    const { authUrl } = await wixClient.auth.getAuthUrl(oauthData);
    window.location.href = authUrl;
    return { success: true, authUrl };
  } catch (err) {
    console.warn('Wix OAuth Redirect aviso:', err?.message || err);
    return {
      success: false,
      message:
        err?.message ||
        'Verifica que la URL de redirección esté autorizada en tu panel de Wix Headless OAuth.',
    };
  }
}

/**
 * Completes Wix OAuth 2.0 PKCE callback if `code` and `state` are present in the URL.
 */
export async function completeWixOAuthCallbackIfPresent() {
  if (typeof window === 'undefined') return null;
  try {
    const params = new URLSearchParams(window.location.search);
    if (!params.has('code') || !params.has('state')) return null;

    const rawOAuth = window.localStorage.getItem(WIX_OAUTH_DATA_KEY);
    if (!rawOAuth) return null;
    const oauthData = JSON.parse(rawOAuth);

    const { code, state, error } = wixClient.auth.parseFromUrl();
    if (error || !code) return null;

    const tokens = await wixClient.auth.getMemberTokens(code, state, oauthData);
    wixClient.auth.setTokens(tokens);
    persistWixTokens(tokens);
    window.localStorage.removeItem(WIX_OAUTH_DATA_KEY);

    // Clean URL query params
    window.history.replaceState({}, document.title, window.location.pathname + window.location.hash);
    return tokens;
  } catch (err) {
    console.warn('Error completando callback OAuth de Wix:', err?.message || err);
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

/**
 * Saves a store order into Wix CMS ("PedidosTienda" & "Contactoweb") linked to the Wix Member.
 */
export async function saveWixTiendaOrder(orderRecord) {
  if (!orderRecord) return null;
  try {
    await wixClient.items.insert('PedidosTienda', {
      title: `${orderRecord.id} - ${orderRecord.customer?.nombre || 'Cliente'}`,
      folio: orderRecord.id,
      nombre: orderRecord.customer?.nombre || 'Cliente Tienda',
      email: (orderRecord.customer?.correo || '').toLowerCase(),
      telefono: orderRecord.customer?.telefono || '',
      sucursal: orderRecord.branchName || '',
      subtotal: orderRecord.subtotal || 0,
      descuento: orderRecord.discountAmount || 0,
      descuentoVolumen: orderRecord.volumeDiscountAmount || 0,
      total: orderRecord.total || 0,
      cupon: orderRecord.couponCode || '',
      items: orderRecord.items || [],
      status: orderRecord.status || 'Solicitud recibida',
      fecha: orderRecord.createdAt || new Date().toISOString(),
    });
  } catch {
    // Ignored if PedidosTienda collection is not yet created
  }
  return orderRecord;
}
