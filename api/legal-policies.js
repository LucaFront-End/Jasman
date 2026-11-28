/**
 * Wix CMS Unified `politicas` Endpoint (Jasman Automotriz + Jasman TIRES)
 *
 * GET  /api/legal-policies                   -> Returns all active rows from Wix CMS `politicas`
 * GET  /api/legal-policies?policy=<slug|key> -> Returns a single matching policy row
 * POST /api/legal-policies { action: "seed_if_empty" } -> Ensures schema fields & upserts 4 initial policies if missing
 */

import { Buffer } from 'node:buffer';
import process from 'node:process';
import { createClient, OAuthStrategy } from '@wix/sdk';
import { items } from '@wix/data';
import {
  LEGAL_POLICIES_CONFIG,
  DEFAULT_LEGAL_CONTENT,
  DEFAULT_LEGAL_SUBTITLE,
} from '../src/data/legalPoliciesData.js';

const WIX_API_BASE = 'https://www.wixapis.com';
const WIX_CLIENT_ID = '5aabc542-16cf-44de-bedf-d8eb7ad08c46';
const DEFAULT_WIX_SITE_ID = '7fd3b8ea-a3f3-4b51-9b48-4ec1f53d2cc9';
const POLITICAS_COLLECTION_ID = 'politicas';

const REQUIRED_FIELDS = [
  { key: 'slug', displayName: 'Slug (URL)', type: 'TEXT' },
  { key: 'tag', displayName: 'Etiqueta Superior', type: 'TEXT' },
  { key: 'subtitulo', displayName: 'Subtítulo', type: 'TEXT' },
  { key: 'contenido', displayName: 'Contenido', type: 'RICH_TEXT' },
  { key: 'orden', displayName: 'Orden', type: 'NUMBER' },
  { key: 'activo', displayName: 'Visible en Web', type: 'BOOLEAN' },
];

const SEED_ROWS = [
  { key: 'privacy', slug: 'aviso-de-privacidad', orden: 1 },
  { key: 'terms', slug: 'terminos-y-condiciones', orden: 2 },
  { key: 'refund', slug: 'politica-de-reembolso', orden: 3 },
  { key: 'shipping', slug: 'politica-de-envios', orden: 4 },
];

function getWixCredentials() {
  const apiKey = (
    process.env.WIX_API_KEY ||
    process.env.VITE_WIX_API_KEY ||
    ''
  ).trim();
  const siteId = (
    process.env.WIX_SITE_ID ||
    process.env.VITE_WIX_SITE_ID ||
    DEFAULT_WIX_SITE_ID
  ).trim();
  return { apiKey, siteId };
}

function getSdkClient() {
  return createClient({
    modules: { items },
    auth: OAuthStrategy({ clientId: WIX_CLIENT_ID }),
  });
}

function compactPolicyHtml(raw = '') {
  return String(raw)
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .join('\n');
}

function normalizeLookup(raw = '') {
  return String(raw || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/^\/+|\/+$/g, '')
    .trim();
}

async function parseJsonBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string' && req.body.trim()) {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  const raw = Buffer.concat(chunks).toString('utf8').trim();
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

async function wixRestFetch(path, apiKey, siteId, options = {}) {
  const res = await fetch(`${WIX_API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: apiKey,
      'wix-site-id': siteId,
      ...(options.headers || {}),
    },
  });

  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    throw new Error(`Wix API non-JSON (${res.status}): ${text.slice(0, 200)}`);
  }

  if (!res.ok) {
    const msg =
      data?.message ||
      data?.details?.applicationError?.description ||
      `Wix API HTTP ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

async function queryPoliticasRows(sdkClient, apiKey, siteId) {
  if (apiKey) {
    try {
      const restRes = await wixRestFetch('/wix-data/v2/items/query', apiKey, siteId, {
        method: 'POST',
        body: JSON.stringify({
          dataCollectionId: POLITICAS_COLLECTION_ID,
          query: { paging: { limit: 50 } },
          consistentRead: true,
        }),
      });
      const dataItems = restRes?.dataItems || [];
      return {
        source: 'wix-rest',
        items: dataItems.map((entry) => ({
          ...(entry?.data || {}),
          _id: entry?.id || entry?.data?._id,
          _updatedDate: entry?.updatedDate || entry?.data?._updatedDate,
          _createdDate: entry?.createdDate || entry?.data?._createdDate,
        })),
      };
    } catch {
      // fall through to public SDK
    }
  }

  try {
    const sdkRes = await sdkClient.items.query(POLITICAS_COLLECTION_ID).limit(50).find();
    return {
      source: 'wix-sdk',
      items: (sdkRes?.items || []).map((it) => it?.data || it),
    };
  } catch (err) {
    return {
      source: 'error',
      items: [],
      error: err?.message || 'wix_query_failed',
    };
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { apiKey, siteId } = getWixCredentials();
  const sdkClient = getSdkClient();

  if (req.method === 'GET') {
    const queryResult = await queryPoliticasRows(sdkClient, apiKey, siteId);
    const activeItems = queryResult.items
      .filter((row) => row && row.activo !== false && row.visible !== false)
      .sort((a, b) => (Number(a.orden) || 999) - (Number(b.orden) || 999));

    const singleTarget = normalizeLookup(req.query?.policy || '');
    if (singleTarget) {
      const keyAlias = {
        privacy: 'aviso-de-privacidad',
        terms: 'terminos-y-condiciones',
        refund: 'politica-de-reembolso',
        shipping: 'politica-de-envios',
      }[singleTarget] || singleTarget;

      const match = activeItems.find((it) => {
        const rowSlug = normalizeLookup(it.slug || '');
        const rowTitle = normalizeLookup(it.title || '');
        return rowSlug === keyAlias || rowSlug === singleTarget || rowTitle.includes(singleTarget);
      });

      return res.status(200).json({
        ok: true,
        collection: POLITICAS_COLLECTION_ID,
        source: queryResult.source,
        policy: {
          key: singleTarget,
          collection: POLITICAS_COLLECTION_ID,
          item: match || null,
        },
      });
    }

    return res.status(200).json({
      ok: true,
      collection: POLITICAS_COLLECTION_ID,
      source: queryResult.source,
      count: activeItems.length,
      items: activeItems,
    });
  }

  if (req.method === 'POST') {
    const body = await parseJsonBody(req);
    const action = String(body?.action || '').trim();
    if (action !== 'seed_if_empty') {
      return res.status(400).json({
        ok: false,
        error: 'Unsupported action. Send { "action": "seed_if_empty" }.',
      });
    }

    if (!apiKey) {
      return res.status(500).json({ ok: false, error: 'Missing WIX_API_KEY' });
    }

    const colInfo = await wixRestFetch(
      `/wix-data/v2/collections/${POLITICAS_COLLECTION_ID}`,
      apiKey,
      siteId
    );
    const existingKeys = new Set((colInfo?.collection?.fields || []).map((f) => f.key));
    const addedFields = [];

    for (const field of REQUIRED_FIELDS) {
      if (existingKeys.has(field.key)) continue;
      await wixRestFetch('/wix-data/v2/collections/create-field', apiKey, siteId, {
        method: 'POST',
        body: JSON.stringify({ dataCollectionId: POLITICAS_COLLECTION_ID, field }),
      });
      addedFields.push(field.key);
    }

    const current = await queryPoliticasRows(sdkClient, apiKey, siteId);
    const results = [];

    for (const rowSpec of SEED_ROWS) {
      const cfg = LEGAL_POLICIES_CONFIG[rowSpec.key];
      const exists = current.items.find((it) => normalizeLookup(it.slug) === rowSpec.slug);
      if (exists) {
        results.push({ slug: rowSpec.slug, status: 'already_populated', id: exists._id });
        continue;
      }

      const data = {
        title: cfg.label,
        slug: rowSpec.slug,
        tag: cfg.tag,
        subtitulo: DEFAULT_LEGAL_SUBTITLE,
        description: cfg.metaDesc,
        contenido: compactPolicyHtml(DEFAULT_LEGAL_CONTENT[rowSpec.key] || ''),
        orden: rowSpec.orden,
        activo: true,
      };

      const inserted = await wixRestFetch('/wix-data/v2/items', apiKey, siteId, {
        method: 'POST',
        body: JSON.stringify({
          dataCollectionId: POLITICAS_COLLECTION_ID,
          dataItem: { data },
        }),
      });
      results.push({
        slug: rowSpec.slug,
        status: 'seeded',
        id: inserted?.dataItem?.id || null,
      });
    }

    return res.status(200).json({
      ok: true,
      collection: POLITICAS_COLLECTION_ID,
      addedFields,
      results,
    });
  }

  return res.status(405).json({ ok: false, error: 'Method not allowed.' });
}
