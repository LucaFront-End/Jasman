import { useState, useEffect } from 'react';
import { publicWixClient } from '../services/wixService';
import {
  LEGAL_POLICIES_CONFIG,
  DEFAULT_LEGAL_CONTENT,
  DEFAULT_LEGAL_SUBTITLE,
} from '../data/legalPoliciesData';

// In-memory cache across SPA navigation
const legalCache = new Map();

export const POLICY_COLLECTION_CANDIDATES = {
  privacy: [
    'AvisoDePrivacidad',
    'AvisodePrivacidad',
    'Avisodeprivacidad',
    'PoliticaDePrivacidad',
    'Politicas',
  ],
  terms: [
    'TerminosYCondiciones',
    'Terminosycondiciones',
    'TerminosyCondiciones',
    'Politicas',
  ],
  refund: [
    'PoliticaDeReembolsos',
    'PoliticadeReembolsos',
    'PoliticaDeReembolso',
    'PoliticaDeDevoluciones',
    'PoliticaDeGarantias',
    'Politicas',
  ],
  shipping: [
    'PoliticaDeEnvios',
    'PoliticadeEnvios',
    'PoliticaDeEnvio',
    'Politicas',
  ],
};

const CONTENT_FIELD_KEYS = [
  'contenido',
  'texto',
  'politica',
  'cuerpo',
  'descripcin',
  'descripcion',
  'richtext',
  'description',
  'content',
];

function escapeHtml(text = '') {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
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
  // Already contains HTML tags (from Wix Rich Text HTML field or seeded HTML)
  if (/<(h[1-6]|p|ul|ol|li|div|strong|br|section|article)\b/i.test(trimmed)) {
    return trimmed;
  }
  // Plain text fallback: convert paragraphs cleanly into <p> blocks
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
  'tag',
  'etiqueta',
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

  // Accept any custom long-text/rich-text column created in Wix CMS
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

function matchesUnifiedPoliticasRow(rawData, policyKey) {
  const norm = (s) =>
    String(s || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  const slugVal = norm(rawData?.slug || rawData?.identificador || rawData?.tipo || '');
  const titleVal = norm(rawData?.title || rawData?.titulo || '');
  const combined = `${slugVal} ${titleVal}`;

  if (policyKey === 'privacy') return /privacy|privacidad|arco|datos/.test(combined);
  if (policyKey === 'terms') return /terms|termino|condicion/.test(combined);
  if (policyKey === 'refund') return /refund|reembolso|devolucion|garantia|cambio/.test(combined);
  if (policyKey === 'shipping') return /shipping|envio|entrega/.test(combined);
  return false;
}

function pickBestLegalItem(items = [], filterPolicyKey = null) {
  const candidates = (Array.isArray(items) ? items : [])
    .map((item) => {
      const rawData = item?.data && typeof item.data === 'object' ? item.data : item;
      const htmlContent = extractPolicyHtmlContent(item);
      return { rawItem: item, rawData, htmlContent };
    })
    .filter((entry) => {
      if (!entry.htmlContent || entry.htmlContent.trim().length <= 20) return false;
      if (filterPolicyKey && !matchesUnifiedPoliticasRow(entry.rawData, filterPolicyKey)) {
        return false;
      }
      return true;
    });

  if (candidates.length === 0) return null;

  candidates.sort((a, b) => {
    const tA = new Date(
      resolveDateIso(a.rawData?._updatedDate) || resolveDateIso(a.rawData?._createdDate) || 0
    ).getTime();
    const tB = new Date(
      resolveDateIso(b.rawData?._updatedDate) || resolveDateIso(b.rawData?._createdDate) || 0
    ).getTime();
    return tB - tA;
  });

  return candidates[0];
}

function normalizeLiveItem(picked, config) {
  const { rawItem, rawData, htmlContent } = picked;
  return {
    id: rawData._id || rawItem.id || `cms-${config.key}`,
    title: rawData.title || rawData.titulo || config.label,
    subtitle: rawData.subtitulo || rawData.subtitle || DEFAULT_LEGAL_SUBTITLE,
    tag: rawData.tag || rawData.etiqueta || config.tag,
    content: htmlContent,
    lastUpdated:
      resolveDateIso(rawData._updatedDate) ||
      resolveDateIso(rawData._createdDate) ||
      config.lastUpdated,
    isLive: true,
  };
}

/**
 * Dynamically fetches Jasman's legal policies from Wix CMS with complete local fallback.
 * @param {'privacy' | 'terms' | 'refund' | 'shipping'} policyKey
 */
export function useLegalCMS(policyKey = 'privacy') {
  const config = LEGAL_POLICIES_CONFIG[policyKey] || LEGAL_POLICIES_CONFIG.privacy;

  const [state, setState] = useState(() => {
    const cached = legalCache.get(config.key) || null;
    return { key: cached ? config.key : null, entry: cached };
  });

  useEffect(() => {
    let isCancelled = false;

    const fallbackEntry = {
      id: `default-${config.key}`,
      title: config.label,
      subtitle: DEFAULT_LEGAL_SUBTITLE,
      tag: config.tag,
      content: DEFAULT_LEGAL_CONTENT[config.key] || '',
      lastUpdated: config.lastUpdated,
      isLive: false,
    };

    async function fetchPolicyFromCMS() {
      let liveEntry = null;

      try {
        if (publicWixClient?.items?.query) {
          const candidates = POLICY_COLLECTION_CANDIDATES[config.key] || [config.collection];

          for (const coll of candidates) {
            if (isCancelled) return;
            try {
              const res = await publicWixClient.items.query(coll).limit(20).find();
              const isUnified = coll.toLowerCase() === 'politicas';
              const picked = pickBestLegalItem(
                res?.items || [],
                isUnified ? config.key : null
              );
              if (picked) {
                liveEntry = normalizeLiveItem(picked, config);
                break;
              }
            } catch {
              // Collection not created yet or restricted; try next candidate
            }
          }
        }

        if (!liveEntry && !isCancelled) {
          try {
            const apiRes = await fetch(
              `/api/legal-policies?policy=${encodeURIComponent(config.key)}`
            );
            const contentType = apiRes.headers.get('content-type') || '';
            if (apiRes.ok && contentType.includes('application/json')) {
              const json = await apiRes.json();
              const apiItem = json?.policy?.item;
              if (apiItem) {
                const picked = pickBestLegalItem([apiItem]);
                if (picked) {
                  liveEntry = normalizeLiveItem(picked, config);
                }
              }
            }
          } catch {
            // Serverless API unavailable in local static preview
          }
        }
      } catch (err) {
        console.warn('[Jasman LegalCMS] Aviso:', err?.message || err);
      }

      if (isCancelled) return;

      const resolved = liveEntry || fallbackEntry;
      legalCache.set(config.key, resolved);
      setState({ key: config.key, entry: resolved });
    }

    fetchPolicyFromCMS();

    const handleFocus = () => {
      fetchPolicyFromCMS();
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      isCancelled = true;
      window.removeEventListener('focus', handleFocus);
    };
  }, [config]);

  const cachedForKey = legalCache.get(config.key) || null;
  const activeEntry = state.key === config.key ? state.entry : cachedForKey;
  const loading = !activeEntry;

  return {
    config,
    data: activeEntry,
    content: activeEntry?.content || DEFAULT_LEGAL_CONTENT[config.key] || '',
    title: activeEntry?.title || config.label,
    subtitle: activeEntry?.subtitle || DEFAULT_LEGAL_SUBTITLE,
    tag: activeEntry?.tag || config.tag,
    lastUpdated: activeEntry?.lastUpdated || config.lastUpdated,
    loading,
    error: null,
    isCMSLive: Boolean(activeEntry?.isLive),
    allPolicies: Object.values(LEGAL_POLICIES_CONFIG),
  };
}
