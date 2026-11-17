import { createClient, OAuthStrategy } from '@wix/sdk';
import { items } from '@wix/data';

const WIX_CLIENT_ID = '5aabc542-16cf-44de-bedf-d8eb7ad08c46';
const DEFAULT_CANONICAL_ORIGIN = 'https://www.jasman.com.mx';
const FEED_CACHE_TTL_MS = 5 * 60 * 1000;

const GOOGLE_TIRE_CATEGORY =
  'Vehicles & Parts > Vehicle Parts & Accessories > Motor Vehicle Parts > Motor Vehicle Wheel Systems > Motor Vehicle Tires';

// Matches STATIC_PRODUCTOS_MASTER in src/data/productosMasterData.js so feed <link> URLs
// preserve legacy numeric /llantas/producto/:id routes cleanly alongside Wix UUIDs.
const STATIC_SKU_TO_ID = {
  1011163: 587,
  1014133: 557,
  1014358: 589,
  1017214: 555,
  1021366: 538,
  1021499: 536,
  1021934: 561,
  1022056: 552,
  1022058: 547,
  1022631: 540,
  1022797: 554,
  1024744: 537,
  1024757: 535,
  1027178: 562,
  1027450: 560,
  1027588: 590,
  1027596: 586,
  1029145: 588,
  1029167: 548,
  1030509: 546,
  1030513: 544,
  1030519: 567,
  1030542: 550,
  1030595: 570,
  2020730: 571,
  2020847: 566,
  3003438: 558,
  3003813: 553,
  3135190000: 572,
  3135300000: 559,
  3526920000: 545,
  3528610000: 556,
  3589240000: 539,
  15553030000: 569,
  4505150000: 568,
  15553100000: 565,
  4513900000: 564,
  4503560000: 563,
  4508120000: 551,
  4509560000: 549,
  4509570000: 543,
  15508610000: 542,
  4509580000: 541,
  4509300000: 534,
};

const STUDIO_CUTOUT_POOLS = {
  Auto: [539, 572, 590, 589, 588, 586, 546, 545, 544, 542, 540, 538, 537, 535, 569, 565, 562],
  Camioneta: [561, 568, 543, 571, 570, 567, 566, 563, 541, 536],
  Camion: [564, 534, 559, 558, 557, 556],
};

const TSV_HEADERS = [
  'id',
  'title',
  'description',
  'link',
  'image_link',
  'additional_image_link',
  'availability',
  'rich_text_description',
  'price',
  'sale_price',
  'brand',
  'condition',
  'color',
  'gender',
  'material',
  'size',
  'item_group_id',
  'identifier_exists',
  'gtin',
  'mpn',
  'google_product_category',
];

let cachedRawProducts = null;
let cachedAtMs = 0;
let pendingFetchPromise = null;

function createPublicWixClient() {
  return createClient({
    modules: { items },
    auth: OAuthStrategy({
      clientId: WIX_CLIENT_ID,
    }),
  });
}

async function fetchAllWixStoreProducts({ forceRefresh = false } = {}) {
  const now = Date.now();
  if (
    !forceRefresh &&
    Array.isArray(cachedRawProducts) &&
    cachedRawProducts.length > 0 &&
    now - cachedAtMs < FEED_CACHE_TTL_MS
  ) {
    return cachedRawProducts;
  }

  if (pendingFetchPromise && !forceRefresh) {
    return pendingFetchPromise;
  }

  pendingFetchPromise = (async () => {
    const client = createPublicWixClient();
    const allItems = [];

    let firstRes = await client.items.query('Stores/Products').limit(100).find();
    if (Array.isArray(firstRes?.items) && firstRes.items.length > 0) {
      allItems.push(...firstRes.items);
    }

    const fetchPage = (skip) =>
      client.items.query('Stores/Products').skip(skip).limit(100).find();

    const totalCount =
      typeof firstRes?.totalCount === 'number' ? firstRes.totalCount : 0;

    if (totalCount > allItems.length) {
      const offsets = [];
      for (let skip = allItems.length; skip < totalCount; skip += 100) {
        offsets.push(skip);
      }
      const pages = await Promise.all(offsets.map(fetchPage));
      for (const p of pages) {
        if (Array.isArray(p?.items) && p.items.length > 0) {
          allItems.push(...p.items);
        }
      }
    } else if (firstRes && typeof firstRes.hasNext === 'function' && firstRes.hasNext()) {
      let nextOffset = allItems.length;
      let hasMore = true;
      while (hasMore) {
        const offsets = [nextOffset, nextOffset + 100, nextOffset + 200];
        const batchResults = await Promise.all(offsets.map(fetchPage));
        for (const pageRes of batchResults) {
          if (Array.isArray(pageRes?.items) && pageRes.items.length > 0) {
            allItems.push(...pageRes.items);
          }
        }
        const lastPage = batchResults[batchResults.length - 1];
        hasMore = Boolean(lastPage?.items?.length === 100 && lastPage?.hasNext?.());
        nextOffset += offsets.length * 100;
      }
    }

    if (allItems.length > 0) {
      cachedRawProducts = allItems;
      cachedAtMs = Date.now();
    }
    return allItems;
  })();

  try {
    return await pendingFetchPromise;
  } finally {
    pendingFetchPromise = null;
  }
}

function stripUnsafeXmlControlChars(str = '') {
  const s = String(str || '');
  let out = '';
  for (let i = 0; i < s.length; i += 1) {
    const code = s.charCodeAt(i);
    const isValidControl = code === 9 || code === 10 || code === 13;
    const isForbiddenControl = (code >= 0 && code < 32 && !isValidControl) || code === 0xfffe || code === 0xffff;
    if (!isForbiddenControl) {
      out += s[i];
    }
  }
  return out;
}

function decodeBasicHtmlEntities(str = '') {
  return String(str || '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&#(\d+);/g, (_, dec) => {
      const code = Number(dec);
      return Number.isFinite(code) && code >= 32 && code !== 65534 && code !== 65535
        ? String.fromCharCode(code)
        : ' ';
    });
}

function htmlToPlainText(html = '') {
  const spaced = String(html || '')
    .replace(/<\/p>\s*<\/td>\s*<td[^>]*>\s*<p>/gi, ': ')
    .replace(/<\/(td|th)>/gi, ' ')
    .replace(/<\/(h[1-6]|p|div|li|tr)>/gi, ' · ')
    .replace(/<(br|hr)\s*\/?>/gi, ' ')
    .replace(/<[^>]*>/g, ' ');
  return stripUnsafeXmlControlChars(decodeBasicHtmlEntities(spaced))
    .replace(/([.!?:])\s*·/g, '$1')
    .replace(/(?:\s*·\s*)+/g, '. ')
    .replace(/\s+\./g, '.')
    .replace(/(?:\.\s*){2,}/g, '. ')
    .replace(/^[\s·.]+|[\s·]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function escapeXml(str = '') {
  return stripUnsafeXmlControlChars(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function sanitizeTsvCell(val = '') {
  return stripUnsafeXmlControlChars(val)
    .replace(/[\t\r\n]+/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function formatWixMediaToCdnUrl(wixUri) {
  if (!wixUri || typeof wixUri !== 'string') return '';
  const trimmed = wixUri.trim();
  if (!trimmed || trimmed.includes('missing-media')) return '';
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  const match = trimmed.match(/wix:image:\/\/v1\/([^/]+)/i);
  if (match && match[1]) {
    return `https://static.wixstatic.com/media/${match[1]}`;
  }
  return '';
}

function normalizeBrandName(rawBrand = '', rawName = '') {
  const candidates = [String(rawBrand || '').toUpperCase(), String(rawName || '').toUpperCase()];
  const brandRules = [
    ['HANKOOK', 'Hankook'],
    ['CONTINENTAL', 'Continental'],
    ['EUZKADI', 'Euzkadi'],
    ['GENERAL', 'General Tire'],
    ['LAUFENN', 'Laufenn'],
    ['FIRESTONE', 'Firestone'],
    ['BRIDGESTONE', 'Bridgestone'],
    ['MICHELIN', 'Michelin'],
    ['PIRELLI', 'Pirelli'],
    ['GOODYEAR', 'Goodyear'],
    ['BFGOODRICH', 'BFGoodrich'],
    ['BARUM', 'Barum'],
    ['KELLY', 'Kelly'],
  ];

  for (const upper of candidates) {
    if (!upper) continue;
    for (const [needle, label] of brandRules) {
      if (upper.includes(needle)) return label;
    }
  }
  const cleanRaw = String(rawBrand || '').trim();
  return cleanRaw || 'Jasman';
}

function extractTireMeasure(rawTitle = '') {
  const upper = String(rawTitle || '').toUpperCase().replace(/\s+/g, ' ');
  const std = upper.match(/(\d{3})\s*\/\s*(\d{2,3})\s*(?:Z?R?)\s*(\d{2}(?:\.\d)?)/);
  if (std) {
    return `${std[1]}/${std[2]}R${std[3]}`;
  }
  const flot = upper.match(/(\d{2,3})X(\d{1,2}(?:\.\d)?)\s*R\s*(\d{2}(?:\.\d)?)/);
  if (flot) {
    return `${flot[1]}X${flot[2]}R${flot[3]}`;
  }
  return '';
}

function resolveBaseOrigin(req) {
  const queryDomain = typeof req.query?.domain === 'string' ? req.query.domain.trim() : '';
  if (/^https?:\/\/[a-z0-9.-]+(:\d+)?$/i.test(queryDomain)) {
    return queryDomain.replace(/\/+$/, '');
  }

  const forwardedHost = req.headers?.['x-forwarded-host'];
  const rawHost = Array.isArray(forwardedHost)
    ? forwardedHost[0]
    : forwardedHost || req.headers?.host || '';
  const host = String(rawHost).split(',')[0].trim();

  if (!host) return DEFAULT_CANONICAL_ORIGIN;

  const isLocal = /^(localhost|127\.0\.0\.1)(:\d+)?$/i.test(host);
  if (isLocal && req.query?.use_local_host !== '1') {
    return DEFAULT_CANONICAL_ORIGIN;
  }

  const protoHeader = req.headers?.['x-forwarded-proto'];
  const proto = isLocal
    ? 'http'
    : (Array.isArray(protoHeader) ? protoHeader[0] : protoHeader) || 'https';
  return `${proto.split(',')[0].trim()}://${host}`;
}

function formatPriceMxn(num) {
  const safe = Number.isFinite(Number(num)) && Number(num) > 0 ? Number(num) : 0;
  return `${safe.toFixed(2)} MXN`;
}

function slugifyFeedSegment(text = '') {
  return String(text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function buildFeedProductSlug(skuOrId, cleanTitle) {
  const skuSlug = slugifyFeedSegment(skuOrId);
  const titleSlug = slugifyFeedSegment(cleanTitle);
  if (skuSlug && titleSlug) {
    return titleSlug.startsWith(`${skuSlug}-`) ? titleSlug : `${skuSlug}-${titleSlug}`;
  }
  return skuSlug || titleSlug || String(skuOrId || '');
}

function mapWixProductToFeedItem(wixItem, index, baseOrigin, priceMode) {
  const id = String(wixItem._id || '').trim();
  const sku = String(wixItem.sku || '').trim();
  const staticRouteId = sku && STATIC_SKU_TO_ID[sku];
  const routeId = staticRouteId
    ? staticRouteId
    : /^\d+$/.test(sku)
      ? Number(sku)
      : id;

  const cleanTitle = stripUnsafeXmlControlChars(wixItem.name || 'Llanta Jasman')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 150);

  const brand = normalizeBrandName(wixItem.brand, cleanTitle);
  const measure = extractTireMeasure(cleanTitle);

  const regularPrice = Number(wixItem.price || 0);
  const discountedPrice = Number(wixItem.discountedPrice || 0);
  const activePrice = discountedPrice > 0 ? discountedPrice : regularPrice;
  const currency = String(wixItem.currency || 'MXN').toUpperCase() === 'MXN' ? 'MXN' : 'MXN';

  const hasDiscount =
    priceMode !== 'effective' &&
    regularPrice > 0 &&
    activePrice > 0 &&
    regularPrice > activePrice + 0.01;

  const priceFormatted = hasDiscount
    ? `${regularPrice.toFixed(2)} ${currency}`
    : formatPriceMxn(activePrice);
  const salePriceFormatted = hasDiscount
    ? `${activePrice.toFixed(2)} ${currency}`
    : '';

  const hasStock =
    wixItem.inStock !== false &&
    (typeof wixItem.quantityInStock !== 'number' || wixItem.quantityInStock > 0) &&
    activePrice > 0;
  const availability = hasStock ? 'in stock' : 'out of stock';

  const wixMediaUrls = [];
  if (Array.isArray(wixItem.mediaItems)) {
    for (const m of wixItem.mediaItems) {
      const url = formatWixMediaToCdnUrl(
        typeof m === 'string' ? m : m?.src || m?.url || ''
      );
      if (url && !wixMediaUrls.includes(url)) {
        wixMediaUrls.push(url);
      }
    }
  }
  const mainCdn = formatWixMediaToCdnUrl(wixItem.mainMedia);
  if (mainCdn && !wixMediaUrls.includes(mainCdn)) {
    wixMediaUrls.unshift(mainCdn);
  }

  let primaryImageUrl = wixMediaUrls[0] || '';
  const extraImageUrls = wixMediaUrls.slice(1, 10);

  if (!primaryImageUrl) {
    if (staticRouteId) {
      primaryImageUrl = `${baseOrigin}/images/tires/tire-${staticRouteId}.png`;
    } else {
      const isTruck =
        /19\.5|17\.5|10R15|11R22|295\/80|VanContact|Vantra|RA08|RA18|AH11|DH35|Smart Work|SMaRT FLeX|6PR|8PR|16C|15C/i.test(
          cleanTitle
        );
      const isSuv =
        !isTruck &&
        /SUV|AT2|MT2|HTS60|Grabber|Dynapro|Overlander|All Terrain|Destination|Scorpion|LTX|TerrainContact|285\/45R21|245\/75R17|235\/75|265\/70|265\/65|265\/60|31X10|33X12|27X8|205\/75R14/i.test(
          cleanTitle
        );
      const pool = isTruck
        ? STUDIO_CUTOUT_POOLS.Camion
        : isSuv
          ? STUDIO_CUTOUT_POOLS.Camioneta
          : STUDIO_CUTOUT_POOLS.Auto;
      const seed = sku
        .split('')
        .reduce((acc, ch) => acc + ch.charCodeAt(0), index);
      const cutoutId = pool[seed % pool.length] || 539;
      primaryImageUrl = `${baseOrigin}/images/tires/tire-${cutoutId}.png`;
    }
  }

  const plainDescRaw = htmlToPlainText(wixItem.description || '');
  const fallbackDesc = `${cleanTitle} marca ${brand}${measure ? ` (${measure})` : ''}. Llanta nueva disponible en Jasman Automotriz con envío gratis a todo México e instalación en sucursales.`;
  const description = (plainDescRaw || fallbackDesc).slice(0, 4800);
  const richTextDescription = stripUnsafeXmlControlChars(
    wixItem.description || `<p>${escapeXml(description)}</p>`
  )
    .replace(/[\t\r\n]+/g, ' ')
    .trim()
    .slice(0, 4800);

  const routeSlug = buildFeedProductSlug(sku || routeId, cleanTitle);

  return {
    id,
    sku,
    routeId: String(routeId),
    title: cleanTitle,
    description,
    richTextDescription,
    link: `${baseOrigin}/llantas/producto/${encodeURIComponent(routeSlug || String(routeId))}`,
    imageLink: primaryImageUrl,
    additionalImageLinks: extraImageUrls,
    availability,
    condition: 'new',
    price: priceFormatted,
    salePrice: salePriceFormatted,
    brand,
    size: measure,
    itemGroupId: id,
    identifierExists: 'no',
    gtin: '',
    mpn: sku || id,
    googleProductCategory: GOOGLE_TIRE_CATEGORY,
  };
}

function buildMetaRssXml(feedItems, baseOrigin) {
  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">',
    '  <channel>',
    '    <title>Jasman Automotriz · Catálogo Oficial de Llantas</title>',
    `    <link>${escapeXml(baseOrigin)}/llantas/catalogo</link>`,
    '    <description>Catálogo sincronizado de llantas Jasman TIRES con inventario y precios actualizados en MXN.</description>',
  ];

  for (const item of feedItems) {
    lines.push('    <item>');
    lines.push(`      <g:id>${escapeXml(item.id)}</g:id>`);
    lines.push(`      <g:title>${escapeXml(item.title)}</g:title>`);
    lines.push(`      <g:description>${escapeXml(item.description)}</g:description>`);
    lines.push(`      <g:availability>${escapeXml(item.availability)}</g:availability>`);
    lines.push(`      <g:condition>${escapeXml(item.condition)}</g:condition>`);
    lines.push(`      <g:price>${escapeXml(item.price)}</g:price>`);
    if (item.salePrice) {
      lines.push(`      <g:sale_price>${escapeXml(item.salePrice)}</g:sale_price>`);
    }
    lines.push(`      <g:link>${escapeXml(item.link)}</g:link>`);
    lines.push(`      <g:image_link>${escapeXml(item.imageLink)}</g:image_link>`);
    if (item.additionalImageLinks.length > 0) {
      lines.push(
        `      <g:additional_image_link>${escapeXml(item.additionalImageLinks.join(','))}</g:additional_image_link>`
      );
    }
    lines.push(`      <g:brand>${escapeXml(item.brand)}</g:brand>`);
    lines.push(`      <g:mpn>${escapeXml(item.mpn)}</g:mpn>`);
    lines.push(`      <g:item_group_id>${escapeXml(item.itemGroupId)}</g:item_group_id>`);
    if (item.size) {
      lines.push(`      <g:size>${escapeXml(item.size)}</g:size>`);
    }
    lines.push(
      `      <g:google_product_category>${escapeXml(item.googleProductCategory)}</g:google_product_category>`
    );
    lines.push(`      <g:identifier_exists>${escapeXml(item.identifierExists)}</g:identifier_exists>`);
    lines.push('    </item>');
  }

  lines.push('  </channel>');
  lines.push('</rss>');
  return lines.join('\n');
}

function buildMerchantTsv(feedItems) {
  const rows = [TSV_HEADERS.join('\t')];
  for (const item of feedItems) {
    const row = [
      item.id,
      item.title,
      item.description,
      item.link,
      item.imageLink,
      item.additionalImageLinks.join(','),
      item.availability,
      item.richTextDescription,
      item.price,
      item.salePrice,
      item.brand,
      item.condition,
      '',
      '',
      '',
      item.size,
      item.itemGroupId,
      item.identifierExists,
      item.gtin,
      item.mpn,
      item.googleProductCategory,
    ].map(sanitizeTsvCell);
    rows.push(row.join('\t'));
  }
  return rows.join('\n');
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const forceRefresh = req.query?.refresh === '1';
    const rawFormat = String(req.query?.format || '').trim().toLowerCase();
    const urlStr = String(req.url || '').toLowerCase();
    const isTsv = rawFormat === 'tsv' || (!rawFormat && urlStr.includes('.tsv'));
    const priceMode = String(req.query?.price_mode || '').trim().toLowerCase();
    const baseOrigin = resolveBaseOrigin(req);

    const rawProducts = await fetchAllWixStoreProducts({ forceRefresh });
    const feedItems = rawProducts
      .filter((p) => p && p._id && p.name && p.visible !== false)
      .map((p, idx) => mapWixProductToFeedItem(p, idx, baseOrigin, priceMode));

    res.setHeader(
      'Cache-Control',
      forceRefresh
        ? 'no-store'
        : 'public, s-maxage=900, stale-while-revalidate=3600'
    );

    if (isTsv) {
      const tsvBody = buildMerchantTsv(feedItems);
      res.setHeader('Content-Type', 'text/tab-separated-values; charset=utf-8');
      res.setHeader('Content-Disposition', 'inline; filename="merchant.tsv"');
      if (req.method === 'HEAD') return res.status(200).end();
      return res.status(200).send(tsvBody);
    }

    const xmlBody = buildMetaRssXml(feedItems, baseOrigin);
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Content-Disposition', 'inline; filename="meta-catalog.xml"');
    if (req.method === 'HEAD') return res.status(200).end();
    return res.status(200).send(xmlBody);
  } catch (err) {
    console.error('[api/catalog-feed] error:', err);
    return res.status(500).json({
      error: 'Error generating catalog feed',
      details: err?.message || 'Unknown error',
    });
  }
}
