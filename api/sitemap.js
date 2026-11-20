/**
 * Dynamic XML Sitemap Index & Child Sitemaps Endpoint (Jasman Automotriz + Jasman TIRES)
 *
 * Routes (via vercel.json rewrites):
 *  - /sitemap.xml                    -> <sitemapindex> pointing to all child sitemaps
 *  - /sitemap-paginas.xml            -> Core Taller Automotriz corporate pages
 *  - /sitemap-servicios.xml          -> All /servicios/:slug service & package pages
 *  - /sitemap-sucursales.xml         -> All /sucursales/:slug branch pages
 *  - /sitemap-promocion.xml          -> Promo campaign routes + live Wix CMS "Landingdepromociones"
 *  - /sitemap-tienda-categorias.xml  -> /llantas store + /llantas/catalogo + brands, models, vehicle types, measures
 *  - /sitemap-productos.xml          -> Live visible Wix Stores products (/llantas/producto/:slug)
 */

import { createClient, OAuthStrategy } from '@wix/sdk';
import { items } from '@wix/data';
import { servicios, paquetes } from '../src/data/serviciosData.js';
import { sucursales } from '../src/data/sucursalesData.js';

const WIX_CLIENT_ID = '5aabc542-16cf-44de-bedf-d8eb7ad08c46';
const DEFAULT_ORIGIN = 'https://www.jasman.com.mx';

const CHILD_SITEMAPS = [
  '/sitemap-paginas.xml',
  '/sitemap-servicios.xml',
  '/sitemap-sucursales.xml',
  '/sitemap-promocion.xml',
  '/sitemap-tienda-categorias.xml',
  '/sitemap-productos.xml',
];

const STATIC_TALLER_PATHS = [
  { path: '/', changefreq: 'weekly', priority: '1.0' },
  { path: '/nosotros', changefreq: 'monthly', priority: '0.8' },
  { path: '/servicios', changefreq: 'weekly', priority: '0.9' },
  { path: '/sucursales', changefreq: 'weekly', priority: '0.9' },
  { path: '/flotillas', changefreq: 'monthly', priority: '0.8' },
  { path: '/contacto', changefreq: 'monthly', priority: '0.7' },
  { path: '/bolsa-de-trabajo', changefreq: 'weekly', priority: '0.7' },
  { path: '/proveedores', changefreq: 'monthly', priority: '0.6' },
];

const STATIC_PROMO_PATHS = [
  { path: '/alineacion-y-balanceo', changefreq: 'weekly', priority: '0.9' },
  { path: '/alineacion-y-balanceo-promo', changefreq: 'weekly', priority: '0.8' },
  { path: '/alineacion-y-balanceo-ads', changefreq: 'weekly', priority: '0.8' },
  { path: '/promocion-alineacion-y-balanceo', changefreq: 'weekly', priority: '0.8' },
  { path: '/alineacion-y-balanceo-promocion-cdmx-octubre', changefreq: 'weekly', priority: '0.8' },
];

const TIENDA_CORE_PATHS = [
  { path: '/llantas', changefreq: 'daily', priority: '1.0' },
  { path: '/llantas/catalogo', changefreq: 'daily', priority: '0.9' },
];

const TIENDA_BRANDS = [
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
];

const TIENDA_CAR_MODELS = [
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

const TIENDA_VEHICLE_TYPES = [
  'Auto',
  'Deportivo',
  'Camioneta',
  'SUV',
  'Light Truck',
  'Van',
  'Comercial Ligero',
];

const TIENDA_MEASURES = [
  '205/55R16',
  '185/65R15',
  '195/65R15',
  '175/70R14',
  '185/60R15',
  '235/75R15',
  '215/55R17',
  '245/75R17',
  '215/45R17',
  '225/45R17',
  '195/60R15',
  '285/45R21',
];

function escapeXml(str = '') {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function slugifySegment(text = '') {
  return String(text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function normalizePromoSlug(raw = '') {
  let decoded = String(raw || '');
  try {
    decoded = decodeURIComponent(decoded);
  } catch {
    // ignore malformed URI sequences
  }
  return decoded
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/^https?:\/\/[^/]+/i, '')
    .replace(/^\/?(?:promociones|promocion|llantas)\//i, '')
    .replace(/^\/+|\/+$/g, '')
    .replace(/[\s_]+/g, '-');
}

function buildProductSlug(skuOrId, cleanTitle) {
  const skuSlug = slugifySegment(skuOrId);
  const titleSlug = slugifySegment(cleanTitle);
  if (skuSlug && titleSlug) {
    return titleSlug.startsWith(`${skuSlug}-`) ? titleSlug : `${skuSlug}-${titleSlug}`;
  }
  return skuSlug || titleSlug || String(skuOrId || '');
}

function toIsoDate(raw, fallback) {
  if (!raw) return fallback;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? fallback : d.toISOString().split('T')[0];
}

function resolveOrigin(req) {
  const host = String(
    req.headers?.['x-forwarded-host'] || req.headers?.host || ''
  )
    .split(',')[0]
    .trim();
  if (!host || /^(localhost|127\.0\.0\.1)(:\d+)?$/i.test(host)) {
    return DEFAULT_ORIGIN;
  }
  const proto = String(req.headers?.['x-forwarded-proto'] || 'https')
    .split(',')[0]
    .trim();
  return `${proto}://${host}`;
}

function getWixClient() {
  return createClient({
    modules: { items },
    auth: OAuthStrategy({ clientId: WIX_CLIENT_ID }),
  });
}

async function fetchWixCollectionAll(collectionId, limitPerPage = 100, maxPages = 20) {
  try {
    const client = getWixClient();
    const allItems = [];
    let res = await client.items.query(collectionId).limit(limitPerPage).find();
    if (res?.items?.length) allItems.push(...res.items);
    let safety = 0;
    while (typeof res?.hasNext === 'function' && res.hasNext() && safety < maxPages) {
      safety += 1;
      res = await res.next();
      if (res?.items?.length) allItems.push(...res.items);
      else break;
    }
    return allItems;
  } catch {
    return [];
  }
}

function renderUrlsetXml(entries) {
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries.map(
      (u) =>
        `  <url>\n    <loc>${escapeXml(u.loc)}</loc>\n    <lastmod>${escapeXml(u.lastmod)}</lastmod>\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`
    ),
    '</urlset>',
  ].join('\n');
}

function renderSitemapIndexXml(origin, todayIso) {
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...CHILD_SITEMAPS.map(
      (path) =>
        `  <sitemap>\n    <loc>${escapeXml(`${origin}${path}`)}</loc>\n    <lastmod>${escapeXml(todayIso)}</lastmod>\n  </sitemap>`
    ),
    '</sitemapindex>',
  ].join('\n');
}

function makeEntryBuilder(origin, todayIso) {
  const entries = [];
  const push = (
    locPath,
    { changefreq = 'weekly', priority = '0.7', lastmod = todayIso } = {}
  ) => {
    entries.push({
      loc: `${origin}${locPath}`,
      lastmod,
      changefreq,
      priority,
    });
  };
  return { entries, push };
}

const SITEMAP_BUILDERS = {
  paginas: async ({ origin, todayIso }) => {
    const { entries, push } = makeEntryBuilder(origin, todayIso);
    for (const item of STATIC_TALLER_PATHS) {
      push(item.path, item);
    }
    return renderUrlsetXml(entries);
  },

  servicios: async ({ origin, todayIso }) => {
    const { entries, push } = makeEntryBuilder(origin, todayIso);
    for (const srv of [...(servicios || []), ...(paquetes || [])]) {
      if (!srv?.slug) continue;
      push(`/servicios/${encodeURIComponent(srv.slug)}`, {
        changefreq: 'monthly',
        priority: '0.7',
      });
    }
    return renderUrlsetXml(entries);
  },

  sucursales: async ({ origin, todayIso }) => {
    const { entries, push } = makeEntryBuilder(origin, todayIso);
    for (const branch of sucursales || []) {
      if (!branch?.id) continue;
      push(`/sucursales/${encodeURIComponent(branch.id)}`, {
        changefreq: 'monthly',
        priority: '0.7',
      });
    }
    return renderUrlsetXml(entries);
  },

  promocion: async ({ origin, todayIso }) => {
    const byPath = new Map();
    for (const item of STATIC_PROMO_PATHS) {
      byPath.set(item.path, {
        loc: `${origin}${item.path}`,
        lastmod: todayIso,
        changefreq: item.changefreq,
        priority: item.priority,
      });
    }

    const cmsPromos = await fetchWixCollectionAll('Landingdepromociones', 50, 4);
    for (const p of cmsPromos) {
      const slug = normalizePromoSlug(p?.slug || p?.title || '');
      if (!slug || slug === 'promociones') continue;
      const promoPath = `/${encodeURIComponent(slug)}`;
      const lastmod = toIsoDate(p?._updatedDate || p?.lastUpdated, todayIso);
      const existing = byPath.get(promoPath);
      byPath.set(promoPath, {
        loc: `${origin}${promoPath}`,
        lastmod,
        changefreq: existing?.changefreq || 'weekly',
        priority: existing?.priority || '0.9',
      });
    }

    return renderUrlsetXml([...byPath.values()]);
  },

  'tienda-categorias': async ({ origin, todayIso }) => {
    const { entries, push } = makeEntryBuilder(origin, todayIso);
    for (const item of TIENDA_CORE_PATHS) {
      push(item.path, item);
    }
    for (const brand of TIENDA_BRANDS) {
      push(`/llantas/catalogo?brand=${encodeURIComponent(brand)}`, {
        changefreq: 'daily',
        priority: '0.8',
      });
    }
    for (const model of TIENDA_CAR_MODELS) {
      push(`/llantas/catalogo?carModel=${encodeURIComponent(model)}`, {
        changefreq: 'weekly',
        priority: '0.8',
      });
    }
    for (const vehicle of TIENDA_VEHICLE_TYPES) {
      push(`/llantas/catalogo?vehicle=${encodeURIComponent(vehicle)}`, {
        changefreq: 'weekly',
        priority: '0.8',
      });
    }
    for (const measure of TIENDA_MEASURES) {
      push(`/llantas/catalogo?measure=${encodeURIComponent(measure)}`, {
        changefreq: 'weekly',
        priority: '0.8',
      });
    }
    return renderUrlsetXml(entries);
  },

  productos: async ({ origin, todayIso }) => {
    const { entries, push } = makeEntryBuilder(origin, todayIso);
    const wixItems = await fetchWixCollectionAll('Stores/Products', 100, 20);
    const seenSlugs = new Set();

    for (const p of wixItems) {
      if (!p || !p._id || !p.name || p.visible === false) continue;
      const sku = String(p.sku || p._id || '').trim();
      const cleanTitle = String(p.name || '')
        .replace(/^copia de\s+/i, '')
        .replace(/^Paquete de 2 Llantas\s+/i, 'Llanta ')
        .trim();
      const slug = buildProductSlug(sku, cleanTitle);
      if (!slug || seenSlugs.has(slug)) continue;
      seenSlugs.add(slug);

      push(`/llantas/producto/${encodeURIComponent(slug)}`, {
        changefreq: 'daily',
        priority: '0.7',
        lastmod: toIsoDate(p._updatedDate || p.lastUpdated, todayIso),
      });
    }

    return renderUrlsetXml(entries);
  },
};

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return res.status(405).end();
  }

  const origin = resolveOrigin(req);
  const todayIso = new Date().toISOString().split('T')[0];
  const rawType = Array.isArray(req.query?.type) ? req.query.type[0] : req.query?.type;
  const sitemapType = String(rawType || '').trim().toLowerCase();

  let xml;
  if (!sitemapType || sitemapType === 'index') {
    xml = renderSitemapIndexXml(origin, todayIso);
  } else if (SITEMAP_BUILDERS[sitemapType]) {
    xml = await SITEMAP_BUILDERS[sitemapType]({ origin, todayIso });
  } else {
    return res.status(404).json({ error: 'Unknown sitemap type' });
  }

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
  if (req.method === 'HEAD') return res.status(200).end();
  return res.status(200).send(xml);
}
