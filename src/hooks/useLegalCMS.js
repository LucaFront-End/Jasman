import { useState, useEffect } from 'react';
import { createClient, OAuthStrategy } from '@wix/sdk';
import { items } from '@wix/data';
import { formatWixImageUrl, WIX_CLIENT_ID } from '../services/wixService';
import {
  LEGAL_POLICIES_CONFIG,
  DEFAULT_LEGAL_CONTENT,
  DEFAULT_LEGAL_SUBTITLE,
} from '../data/legalPoliciesData';

export const POLITICAS_COLLECTION_ID = 'politicas';

const CORE_SLUG_TO_KEY = {
  'aviso-de-privacidad': 'privacy',
  'politica-de-privacidad': 'privacy',
  privacidad: 'privacy',
  avisodeprivacidad: 'privacy',
  privacy: 'privacy',

  'terminos-y-condiciones': 'terms',
  terminos: 'terms',
  terminosycondiciones: 'terms',
  terminosycondciones: 'terms',
  terms: 'terms',

  'politica-de-reembolso': 'refund',
  'politica-de-reembolsos': 'refund',
  'politica-de-devoluciones': 'refund',
  reembolso: 'refund',
  reembolsos: 'refund',
  devoluciones: 'refund',
  garantias: 'refund',
  refund: 'refund',

  'politica-de-envios': 'shipping',
  'politica-de-envio': 'shipping',
  envios: 'shipping',
  shipping: 'shipping',
};

const CORE_ROOT_SLUGS = new Set([
  'aviso-de-privacidad',
  'terminos-y-condiciones',
  'politica-de-reembolso',
  'politica-de-envios',
]);

const CONTENT_FIELD_KEYS = [
  'contenido',
  'texto',
  'politica',
  'cuerpo',
  'richtext',
  'content',
];

function createFreshPublicDataClient() {
  return createClient({
    modules: { items },
    auth: OAuthStrategy({ clientId: WIX_CLIENT_ID }),
  });
}

function escapeHtml(text = '') {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function slugifyPolicy(raw = '') {
  let decoded = String(raw || '');
  try {
    decoded = decodeURIComponent(decoded);
  } catch {
    // ignore
  }
  return decoded
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/^https?:\/\/[^/]+/i, '')
    .replace(/^\/?(?:politicas|legal)\//i, '')
    .replace(/^\/+|\/+$/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function renderRicosTextNode(node) {
  const rawText = node?.textData?.text ?? '';
  let html = escapeHtml(rawText);
  const decorations = node?.textData?.decorations || [];

  for (const dec of decorations) {
    if (dec.type === 'BOLD') html = `<strong>${html}</strong>`;
    else if (dec.type === 'ITALIC') html = `<em>${html}</em>`;
    else if (dec.type === 'UNDERLINE') html = `<u>${html}</u>`;
    else if (dec.type === 'LINK' && dec.linkData?.link?.url) {
      const href = escapeHtml(dec.linkData.link.url);
      html = `<a href="${href}" target="_blank" rel="noopener noreferrer">${html}</a>`;
    }
  }
  return html;
}

function renderRicosNodes(nodes = []) {
  if (!Array.isArray(nodes)) return '';
  return nodes
    .map((node) => {
      if (!node || typeof node !== 'object') return '';
      if (node.type === 'TEXT') return renderRicosTextNode(node);

      const childrenHtml = renderRicosNodes(node.nodes || []);
      if (node.type === 'HEADING') {
        const level = Math.min(4, Math.max(2, Number(node.headingData?.level) || 2));
        return `<h${level}>${childrenHtml}</h${level}>`;
      }
      if (node.type === 'PARAGRAPH') {
        return childrenHtml ? `<p>${childrenHtml}</p>` : '';
      }
      if (node.type === 'BULLETED_LIST') {
        return `<ul>${childrenHtml}</ul>`;
      }
      if (node.type === 'ORDERED_LIST') {
        return `<ol>${childrenHtml}</ol>`;
      }
      if (node.type === 'LIST_ITEM') {
        return `<li>${childrenHtml}</li>`;
      }
      if (node.type === 'BLOCKQUOTE') {
        return `<blockquote>${childrenHtml}</blockquote>`;
      }
      if (node.type === 'DIVIDER') {
        return '<hr />';
      }
      return childrenHtml;
    })
    .filter(Boolean)
    .join('\n');
}

function formatPlainOrHtmlString(raw = '') {
  const trimmed = String(raw || '').trim();
  if (!trimmed) return '';
  if (/<(h[1-6]|p|ul|ol|li|div|strong|br|section|article|blockquote)\b/i.test(trimmed)) {
    return trimmed;
  }
  return trimmed
    .split(/\n{2,}/)
    .map((block) => `<p>${escapeHtml(block.trim()).replace(/\n/g, '<br />')}</p>`)
    .join('\n');
}

const IGNORED_META_KEYS = new Set([
  '_id',
  '_owner',
  '_createdDate',
  '_updatedDate',
  '_publishDate',
  '_draftDate',
  '_publishStatus',
  'title',
  'titulo',
  'slug',
  'subtitulo',
  'subtitle',
  'description',
  'descripcion',
  'descripcin',
  'image',
  'imageAltText',
  'tag',
  'etiqueta',
  'orden',
  'order',
  'activo',
  'visible',
]);

export function extractPolicyHtmlContent(rawItem) {
  if (!rawItem) return '';
  const data = rawItem.data && typeof rawItem.data === 'object' ? rawItem.data : rawItem;

  for (const key of CONTENT_FIELD_KEYS) {
    const val = data[key];
    if (!val) continue;
    if (typeof val === 'string' && val.trim()) {
      return formatPlainOrHtmlString(val);
    }
    if (typeof val === 'object' && Array.isArray(val.nodes)) {
      const converted = renderRicosNodes(val.nodes);
      if (converted.trim()) return converted;
    }
  }

  for (const [key, val] of Object.entries(data)) {
    if (IGNORED_META_KEYS.has(key) || !val) continue;
    if (typeof val === 'string' && val.trim().length > 20) {
      return formatPlainOrHtmlString(val);
    }
    if (typeof val === 'object' && Array.isArray(val.nodes)) {
      const converted = renderRicosNodes(val.nodes);
      if (converted.trim().length > 20) return converted;
    }
  }
  return '';
}

function resolveDateIso(rawDate) {
  if (!rawDate) return null;
  if (typeof rawDate === 'object' && rawDate.$date) return rawDate.$date;
  return rawDate;
}

function inferCoreKey(slug, title) {
  if (CORE_SLUG_TO_KEY[slug]) return CORE_SLUG_TO_KEY[slug];
  const norm = slugifyPolicy(title);
  if (/privacidad|arco|datos/.test(norm)) return 'privacy';
  if (/termino|condicion/.test(norm)) return 'terms';
  if (/reembolso|devolucion|garantia|cambio/.test(norm)) return 'refund';
  if (/envio|entrega/.test(norm)) return 'shipping';
  return '';
}

function buildDefaultPoliciesCatalog() {
  const orderedKeys = ['privacy', 'terms', 'refund', 'shipping'];
  return orderedKeys.map((key, idx) => {
    const cfg = LEGAL_POLICIES_CONFIG[key];
    const cleanSlug = cfg.path.replace(/^\/+/, '');
    return {
      id: `default-${key}`,
      key,
      coreKey: key,
      slug: cleanSlug,
      path: cfg.path,
      label: cfg.label,
      title: cfg.label,
      tag: cfg.tag,
      subtitle: DEFAULT_LEGAL_SUBTITLE,
      metaTitle: cfg.metaTitle,
      metaDesc: cfg.metaDesc,
      heroImage: '',
      heroImageAlt: '',
      content: DEFAULT_LEGAL_CONTENT[key] || '',
      orden: idx + 1,
      lastUpdated: cfg.lastUpdated,
      isLive: false,
    };
  });
}

export function normalizePoliticasRow(rawItem, index = 0) {
  if (!rawItem || typeof rawItem !== 'object') return null;
  const data = rawItem.data && typeof rawItem.data === 'object' ? rawItem.data : rawItem;

  // Respect Wix CMS visibility toggle (`activo` / `visible`)
  if (data.activo === false || data.visible === false || data.oculto === true) {
    return null;
  }

  const title = String(data.title || data.titulo || '').trim();
  if (!title) return null;

  const slug = slugifyPolicy(data.slug || title);
  if (!slug) return null;

  const coreKey = inferCoreKey(slug, title);
  const fallbackCfg = coreKey ? LEGAL_POLICIES_CONFIG[coreKey] : null;
  const uniqueKey = coreKey || slug;
  const path = CORE_ROOT_SLUGS.has(slug)
    ? `/${slug}`
    : fallbackCfg?.path && slug === fallbackCfg.path.replace(/^\/+/, '')
      ? fallbackCfg.path
      : `/politicas/${slug}`;

  const htmlContent =
    extractPolicyHtmlContent(data) ||
    (coreKey ? DEFAULT_LEGAL_CONTENT[coreKey] || '' : '');

  const rawOrden = data.orden ?? data.order ?? data.posicion;
  const orden =
    rawOrden !== undefined && rawOrden !== null && rawOrden !== '' && Number.isFinite(Number(rawOrden))
      ? Number(rawOrden)
      : 100 + index;

  const createdIso = resolveDateIso(data._createdDate || rawItem.createdDate);
  const updatedIso = resolveDateIso(data._updatedDate || rawItem.updatedDate);

  return {
    id: data._id || rawItem.id || `cms-${slug}`,
    key: uniqueKey,
    coreKey: coreKey || 'custom',
    slug,
    path,
    label: title,
    title,
    tag: String(data.tag || data.etiqueta || fallbackCfg?.tag || 'DOCUMENTO LEGAL JASMAN').trim(),
    subtitle: String(
      data.subtitulo || data.subtitle || DEFAULT_LEGAL_SUBTITLE
    ).trim(),
    metaTitle: `${title} | JASMAN Automotriz`,
    metaDesc: String(
      data.description || data.descripcion || fallbackCfg?.metaDesc || DEFAULT_LEGAL_SUBTITLE
    ).trim(),
    heroImage: data.image ? formatWixImageUrl(data.image, '') : '',
    heroImageAlt: String(data.imageAltText || title).trim(),
    content: htmlContent,
    orden,
    createdTime: createdIso ? new Date(createdIso).getTime() : index,
    lastUpdated: updatedIso || createdIso || fallbackCfg?.lastUpdated || '2026-11-27',
    isLive: true,
  };
}

// Shared live memory snapshot + subscribers so LegalPage & Footer update together instantly
let liveCatalogSnapshot = null;
let inflightCatalogPromise = null;
const catalogSubscribers = new Set();

function notifySubscribers(list) {
  liveCatalogSnapshot = list;
  for (const fn of catalogSubscribers) {
    try {
      fn(list);
    } catch {
      // ignore subscriber errors
    }
  }
}

export async function refreshLivePoliticasCatalog() {
  if (inflightCatalogPromise) return inflightCatalogPromise;

  inflightCatalogPromise = (async () => {
    let rawList = [];

    // 1. Direct query to Wix CMS `politicas` with a fresh stateless client (always reflects latest published edits)
    try {
      const client = createFreshPublicDataClient();
      const res = await client.items.query(POLITICAS_COLLECTION_ID).limit(50).find();
      if (Array.isArray(res?.items) && res.items.length > 0) {
        rawList = res.items;
      }
    } catch {
      // Fall through to serverless API
    }

    // 2. Fallback to serverless `/api/legal-policies` (uses WIX_API_KEY + consistentRead)
    if (rawList.length === 0) {
      try {
        const apiRes = await fetch(`/api/legal-policies?t=${Date.now()}`, {
          cache: 'no-store',
        });
        const ct = apiRes.headers.get('content-type') || '';
        if (apiRes.ok && ct.includes('application/json')) {
          const json = await apiRes.json();
          if (Array.isArray(json?.items) && json.items.length > 0) {
            rawList = json.items;
          }
        }
      } catch {
        // Offline or local static preview without API
      }
    }

    if (rawList.length > 0) {
      const normalized = rawList
        .map((item, idx) => normalizePoliticasRow(item, idx))
        .filter(Boolean)
        .sort((a, b) => {
          if (a.orden !== b.orden) return a.orden - b.orden;
          return a.createdTime - b.createdTime;
        });

      if (normalized.length > 0) {
        notifySubscribers(normalized);
        return normalized;
      }
    }

    const fallback = liveCatalogSnapshot || buildDefaultPoliciesCatalog();
    notifySubscribers(fallback);
    return fallback;
  })().finally(() => {
    inflightCatalogPromise = null;
  });

  return inflightCatalogPromise;
}

function findMatchingPolicy(catalog, identifier) {
  if (!Array.isArray(catalog) || catalog.length === 0) return null;
  const cleanId = slugifyPolicy(identifier);
  const mappedCore = CORE_SLUG_TO_KEY[cleanId] || identifier;

  return (
    catalog.find(
      (p) =>
        p.slug === cleanId ||
        p.key === identifier ||
        p.key === mappedCore ||
        p.coreKey === mappedCore ||
        slugifyPolicy(p.path) === cleanId
    ) || catalog[0]
  );
}

/**
 * Lightweight hook for Footer / menus to render live policy links from Wix CMS `politicas`.
 */
export function useLegalPoliciesList() {
  const [policies, setPolicies] = useState(
    () => liveCatalogSnapshot || buildDefaultPoliciesCatalog()
  );

  useEffect(() => {
    const handleUpdate = (nextList) => setPolicies(nextList);
    catalogSubscribers.add(handleUpdate);

    refreshLivePoliticasCatalog();

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        refreshLivePoliticasCatalog();
      }
    };
    window.addEventListener('focus', refreshLivePoliticasCatalog);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      catalogSubscribers.delete(handleUpdate);
      window.removeEventListener('focus', refreshLivePoliticasCatalog);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  return policies;
}

/**
 * Full hook for LegalPage — resolves any core policy OR custom policy row added by the client in Wix CMS `politicas`.
 */
export function useLegalCMS(identifier = 'privacy') {
  const [catalog, setCatalog] = useState(() => liveCatalogSnapshot);

  useEffect(() => {
    const handleUpdate = (nextList) => setCatalog(nextList);
    catalogSubscribers.add(handleUpdate);

    refreshLivePoliticasCatalog();

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        refreshLivePoliticasCatalog();
      }
    };
    window.addEventListener('focus', refreshLivePoliticasCatalog);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      catalogSubscribers.delete(handleUpdate);
      window.removeEventListener('focus', refreshLivePoliticasCatalog);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [identifier]);

  const effectiveCatalog = catalog || buildDefaultPoliciesCatalog();
  const activePolicy =
    findMatchingPolicy(effectiveCatalog, identifier) || effectiveCatalog[0];
  const loading = !catalog;

  return {
    config: activePolicy,
    activePolicy,
    data: activePolicy,
    content: activePolicy?.content || '',
    title: activePolicy?.title || 'Políticas Legales',
    subtitle: activePolicy?.subtitle || DEFAULT_LEGAL_SUBTITLE,
    tag: activePolicy?.tag || 'DOCUMENTO LEGAL JASMAN',
    heroImage: activePolicy?.heroImage || '',
    heroImageAlt: activePolicy?.heroImageAlt || '',
    lastUpdated: activePolicy?.lastUpdated || '2026-11-27',
    loading,
    error: null,
    isCMSLive: Boolean(activePolicy?.isLive),
    allPolicies: effectiveCatalog,
  };
}
