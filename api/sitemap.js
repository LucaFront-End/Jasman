/**
 * Dynamic XML Sitemap Endpoint (Jasman Automotriz + Jasman TIRES)
 * GET /sitemap.xml (rewritten to /api/sitemap)
 *
 * Emits all Taller Automotriz pages, Services/Packages, Sucursales,
 * Tienda de Llantas brands/categories/models/measures, and live Wix Stores products.
 */

import { createClient, OAuthStrategy } from '@wix/sdk';
import { items } from '@wix/data';
import { servicios, paquetes } from '../src/data/serviciosData.js';
import { sucursales } from '../src/data/sucursalesData.js';

const WIX_CLIENT_ID = '5aabc542-16cf-44de-bedf-d8eb7ad08c46';
const DEFAULT_ORIGIN = 'https://www.jasman.com.mx';

const STATIC_TALLER_PATHS = [
  { path: '/', changefreq: 'weekly', priority: '1.0' },
  { path: '/nosotros', changefreq: 'monthly', priority: '0.8' },
  { path: '/servicios', changefreq: 'weekly', priority: '0.9' },
  { path: '/sucursales', changefreq: 'weekly', priority: '0.9' },
  { path: '/flotillas', changefreq: 'monthly', priority: '0.8' },
  { path: '/contacto', changefreq: 'monthly', priority: '0.7' },
  { path: '/bolsa-de-trabajo', changefreq: 'weekly', priority: '0.7' },
  { path: '/proveedores', changefreq: 'monthly', priority: '0.6' },
  { path: '/alineacion-y-balanceo', changefreq: 'weekly', priority: '0.8' },
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

function buildProductSlug(skuOrId, cleanTitle) {
  const skuSlug = slugifySegment(skuOrId);
  const titleSlug = slugifySegment(cleanTitle);
  if (skuSlug && titleSlug) {
    return titleSlug.startsWith(`${skuSlug}-`) ? titleSlug : `${skuSlug}-${titleSlug}`;
  }
  return skuSlug || titleSlug || String(skuOrId || '');
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

async function fetchVisibleWixProducts() {
  try {
    const client = createClient({
      modules: { items },
      auth: OAuthStrategy({ clientId: WIX_CLIENT_ID }),
    });
    const allItems = [];
    let res = await client.items.query('Stores/Products').limit(100).find();
    if (res?.items?.length) allItems.push(...res.items);
    let safety = 0;
    while (typeof res?.hasNext === 'function' && res.hasNext() && safety < 20) {
      safety += 1;
      res = await res.next();
      if (res?.items?.length) allItems.push(...res.items);
      else break;
    }
    return allItems.filter((p) => p && p._id && p.name && p.visible !== false);
  } catch {
    return [];
  }
}

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return res.status(405).end();
  }

  const origin = resolveOrigin(req);
  const todayIso = new Date().toISOString().split('T')[0];

  const entries = [];
  const pushEntry = (locPath, { changefreq = 'weekly', priority = '0.7', lastmod = todayIso } = {}) => {
    entries.push({
      loc: `${origin}${locPath}`,
      lastmod,
      changefreq,
      priority,
    });
  };

  for (const item of STATIC_TALLER_PATHS) {
    pushEntry(item.path, item);
  }

  for (const srv of [...(servicios || []), ...(paquetes || [])]) {
    if (!srv?.slug) continue;
    pushEntry(`/servicios/${encodeURIComponent(srv.slug)}`, {
      changefreq: 'monthly',
      priority: '0.7',
    });
  }

  for (const branch of sucursales || []) {
    if (!branch?.id) continue;
    pushEntry(`/sucursales/${encodeURIComponent(branch.id)}`, {
      changefreq: 'monthly',
      priority: '0.7',
    });
  }

  for (const item of TIENDA_CORE_PATHS) {
    pushEntry(item.path, item);
  }

  for (const brand of TIENDA_BRANDS) {
    pushEntry(`/llantas/catalogo?brand=${encodeURIComponent(brand)}`, {
      changefreq: 'daily',
      priority: '0.8',
    });
  }

  for (const model of TIENDA_CAR_MODELS) {
    pushEntry(`/llantas/catalogo?carModel=${encodeURIComponent(model)}`, {
      changefreq: 'weekly',
      priority: '0.8',
    });
  }

  for (const vehicle of TIENDA_VEHICLE_TYPES) {
    pushEntry(`/llantas/catalogo?vehicle=${encodeURIComponent(vehicle)}`, {
      changefreq: 'weekly',
      priority: '0.8',
    });
  }

  for (const measure of TIENDA_MEASURES) {
    pushEntry(`/llantas/catalogo?measure=${encodeURIComponent(measure)}`, {
      changefreq: 'weekly',
      priority: '0.8',
    });
  }

  const wixProducts = await fetchVisibleWixProducts();
  const seenProductPaths = new Set();
  for (const p of wixProducts) {
    const sku = String(p.sku || p._id || '').trim();
    const cleanTitle = String(p.name || '')
      .replace(/^copia de\s+/i, '')
      .replace(/^Paquete de 2 Llantas\s+/i, 'Llanta ')
      .trim();
    const slug = buildProductSlug(sku, cleanTitle);
    if (!slug || seenProductPaths.has(slug)) continue;
    seenProductPaths.add(slug);

    const updatedRaw = p._updatedDate || p.lastUpdated;
    const lastmod =
      updatedRaw && !Number.isNaN(new Date(updatedRaw).getTime())
        ? new Date(updatedRaw).toISOString().split('T')[0]
        : todayIso;

    pushEntry(`/llantas/producto/${encodeURIComponent(slug)}`, {
      changefreq: 'daily',
      priority: '0.7',
      lastmod,
    });
  }

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries.map(
      (u) =>
        `  <url>\n    <loc>${escapeXml(u.loc)}</loc>\n    <lastmod>${escapeXml(u.lastmod)}</lastmod>\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`
    ),
    '</urlset>',
  ].join('\n');

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
  if (req.method === 'HEAD') return res.status(200).end();
  return res.status(200).send(xml);
}
