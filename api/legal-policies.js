/**
 * Wix CMS Legal Policies Endpoint (Jasman Automotriz + Jasman TIRES)
 *
 * GET  /api/legal-policies                   -> Returns all 4 legal policies from Wix CMS
 * GET  /api/legal-policies?policy=privacy    -> Returns a single policy ('privacy' | 'terms' | 'refund' | 'shipping')
 * POST /api/legal-policies { action: "seed_if_empty" } -> Ensures CMS fields & seeds initial Jasman legal copy if empty
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

const COLLECTION_CANDIDATES = {
  privacy: ['AvisoDePrivacidad', 'AvisodePrivacidad', 'Avisodeprivacidad', 'PoliticaDePrivacidad'],
  terms: ['TerminosYCondiciones', 'Terminosycondiciones', 'TerminosyCondiciones'],
  refund: ['PoliticaDeReembolsos', 'PoliticadeReembolsos', 'PoliticaDeReembolso', 'PoliticaDeDevoluciones'],
  shipping: ['PoliticaDeEnvios', 'PoliticadeEnvios', 'PoliticaDeEnvio'],
};

const REQUIRED_FIELDS = [
  { key: 'contenido', displayName: 'Contenido', type: 'RICH_TEXT' },
  { key: 'subtitulo', displayName: 'Subtítulo', type: 'TEXT' },
  { key: 'tag', displayName: 'Etiqueta Superior', type: 'TEXT' },
  { key: 'slug', displayName: 'Identificador', type: 'TEXT' },
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

async function ensurePolicyCollectionFields(collectionId, apiKey, siteId) {
  if (!apiKey) {
    return { checked: false, added: [], warnings: ['No WIX_API_KEY configured'] };
  }

  const added = [];
  const warnings = [];

  try {
    const info = await wixRestFetch(
      `/wix-data/v2/collections/${encodeURIComponent(collectionId)}`,
      apiKey,
      siteId
    );
    const existingFields = info?.collection?.fields || [];
    const existingKeys = new Set(existingFields.map((f) => f.key));

    for (const field of REQUIRED_FIELDS) {
      if (existingKeys.has(field.key)) continue;
      try {
        await wixRestFetch(
          '/wix-data/v2/collections/create-field',
          apiKey,
          siteId,
          {
            method: 'POST',
            body: JSON.stringify({ dataCollectionId: collectionId, field }),
          }
        );
        added.push(field.key);
      } catch (fieldErr) {
        warnings.push(`field "${field.key}": ${fieldErr.message}`);
      }
    }

    return { checked: true, added, warnings };
  } catch (err) {
    warnings.push(`collection lookup: ${err.message}`);
    return { checked: false, added, warnings };
  }
}

function pickNewestItem(rawList = []) {
  if (!Array.isArray(rawList) || rawList.length === 0) return null;
  const normalized = rawList.map((entry) => {
    const data = entry?.data && typeof entry.data === 'object' ? entry.data : entry;
    return {
      ...data,
      _id: entry?.id || data?._id || entry?._id,
      _updatedDate: entry?.updatedDate || data?._updatedDate || entry?._updatedDate,
      _createdDate: entry?.createdDate || data?._createdDate || entry?._createdDate,
    };
  });
  normalized.sort((a, b) => {
    const dA = a._updatedDate?.$date || a._updatedDate || a._createdDate?.$date || a._createdDate || 0;
    const dB = b._updatedDate?.$date || b._updatedDate || b._createdDate?.$date || b._createdDate || 0;
    return new Date(dB).getTime() - new Date(dA).getTime();
  });
  return normalized[0];
}

async function querySingleCollection(collectionId, sdkClient, apiKey, siteId) {
  let sdkError = null;
  try {
    const sdkRes = await sdkClient.items.query(collectionId).limit(10).find();
    if (Array.isArray(sdkRes?.items) && sdkRes.items.length > 0) {
      return {
        items: sdkRes.items.map((item) => item?.data || item),
        source: 'wix-sdk',
        publiclyVisible: true,
        collection: collectionId,
      };
    }
  } catch (err) {
    sdkError = err?.message || 'wix_sdk_error';
  }

  if (apiKey) {
    try {
      const restRes = await wixRestFetch('/wix-data/v2/items/query', apiKey, siteId, {
        method: 'POST',
        body: JSON.stringify({
          dataCollectionId: collectionId,
          query: { paging: { limit: 10 } },
          consistentRead: true,
        }),
      });
      const dataItems = restRes?.dataItems || [];
      if (dataItems.length > 0) {
        return {
          items: dataItems.map((entry) => ({
            ...(entry?.data || {}),
            _id: entry?.id || entry?.data?._id,
            _updatedDate: entry?.updatedDate || entry?.data?._updatedDate,
            _createdDate: entry?.createdDate || entry?.data?._createdDate,
          })),
          source: 'wix-rest',
          publiclyVisible: false,
          sdkError,
          collection: collectionId,
        };
      }
    } catch (restErr) {
      return {
        items: [],
        source: 'error',
        publiclyVisible: false,
        sdkError,
        restError: restErr?.message || 'wix_rest_error',
        collection: collectionId,
      };
    }
  }

  return {
    items: [],
    source: sdkError ? 'error' : 'wix-sdk',
    publiclyVisible: !sdkError,
    sdkError,
    collection: collectionId,
  };
}

async function queryPolicyAcrossCandidates(cfg, sdkClient, apiKey, siteId) {
  const candidates = COLLECTION_CANDIDATES[cfg.key] || [cfg.collection];
  let firstAttempt = null;

  for (const coll of candidates) {
    const res = await querySingleCollection(coll, sdkClient, apiKey, siteId);
    if (!firstAttempt) firstAttempt = res;
    if (res.items.length > 0) return res;
  }

  // Also check unified "Politicas" collection filtered by slug
  if (apiKey) {
    try {
      const unified = await wixRestFetch('/wix-data/v2/items/query', apiKey, siteId, {
        method: 'POST',
        body: JSON.stringify({
          dataCollectionId: 'Politicas',
          query: {
            filter: { slug: cfg.key },
            paging: { limit: 5 },
          },
          consistentRead: true,
        }),
      });
      const dataItems = unified?.dataItems || [];
      if (dataItems.length > 0) {
        return {
          items: dataItems.map((entry) => ({
            ...(entry?.data || {}),
            _id: entry?.id || entry?.data?._id,
            _updatedDate: entry?.updatedDate || entry?.data?._updatedDate,
            _createdDate: entry?.createdDate || entry?.data?._createdDate,
          })),
          source: 'wix-rest',
          publiclyVisible: false,
          collection: 'Politicas',
        };
      }
    } catch {
      // ignore if Politicas does not exist
    }
  }

  return firstAttempt || {
    items: [],
    source: 'empty',
    publiclyVisible: false,
    collection: cfg.collection,
  };
}

async function seedPolicyIfEmpty(cfg, sdkClient, apiKey, siteId) {
  const candidates = COLLECTION_CANDIDATES[cfg.key] || [cfg.collection];
  let targetCollection = cfg.collection;

  if (apiKey) {
    for (const coll of candidates) {
      try {
        await wixRestFetch(
          `/wix-data/v2/collections/${encodeURIComponent(coll)}`,
          apiKey,
          siteId
        );
        targetCollection = coll;
        break;
      } catch {
        // try next candidate
      }
    }
  }

  const schema = await ensurePolicyCollectionFields(targetCollection, apiKey, siteId);
  const existingQuery = await querySingleCollection(targetCollection, sdkClient, apiKey, siteId);

  if (existingQuery.items.length > 0) {
    const latest = pickNewestItem(existingQuery.items);
    return {
      key: cfg.key,
      collection: targetCollection,
      status: 'already_populated',
      count: existingQuery.items.length,
      itemId: latest?._id || null,
      publiclyVisible: existingQuery.publiclyVisible,
      schema,
    };
  }

  const itemData = {
    title: cfg.label,
    slug: cfg.key,
    tag: cfg.tag,
    subtitulo: DEFAULT_LEGAL_SUBTITLE,
    contenido: compactPolicyHtml(DEFAULT_LEGAL_CONTENT[cfg.key] || ''),
  };

  let insertedId = null;
  let insertSource = '';
  const errors = [];

  if (apiKey) {
    try {
      const inserted = await wixRestFetch('/wix-data/v2/items', apiKey, siteId, {
        method: 'POST',
        body: JSON.stringify({
          dataCollectionId: targetCollection,
          dataItem: { data: itemData },
        }),
      });
      insertedId = inserted?.dataItem?.id || inserted?.dataItem?.data?._id || null;
      insertSource = 'wix-rest';
    } catch (restErr) {
      errors.push(`rest_insert: ${restErr.message}`);
    }
  }

  if (!insertedId) {
    try {
      const sdkInserted = await sdkClient.items.insert(targetCollection, itemData);
      insertedId = sdkInserted?._id || sdkInserted?.id || sdkInserted?.data?._id || null;
      insertSource = 'wix-sdk';
    } catch (sdkErr) {
      errors.push(`sdk_insert: ${sdkErr?.message || 'sdk_insert_failed'}`);
    }
  }

  if (!insertedId) {
    return {
      key: cfg.key,
      collection: targetCollection,
      status: 'insert_failed',
      errors,
      schema,
    };
  }

  let publishStatus = 'skipped';
  if (apiKey) {
    try {
      await wixRestFetch('/wix-data/v2/items/publish', apiKey, siteId, {
        method: 'POST',
        body: JSON.stringify({
          dataCollectionId: targetCollection,
          itemIds: [insertedId],
        }),
      });
      publishStatus = 'published';
    } catch (pubErr) {
      publishStatus = `not_needed_or_error: ${pubErr.message}`;
    }
  }

  return {
    key: cfg.key,
    collection: targetCollection,
    status: 'seeded',
    itemId: insertedId,
    insertSource,
    publishStatus,
    schema,
    errors: errors.length > 0 ? errors : undefined,
  };
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
    const singleKey = String(req.query?.policy || '').trim().toLowerCase();
    const configs = singleKey
      ? [LEGAL_POLICIES_CONFIG[singleKey]].filter(Boolean)
      : Object.values(LEGAL_POLICIES_CONFIG);

    if (singleKey && configs.length === 0) {
      return res.status(404).json({ ok: false, error: `Unknown policy key: ${singleKey}` });
    }

    const policies = {};
    for (const cfg of configs) {
      const result = await queryPolicyAcrossCandidates(cfg, sdkClient, apiKey, siteId);
      const item = pickNewestItem(result.items);
      policies[cfg.key] = {
        key: cfg.key,
        collection: result.collection || cfg.collection,
        source: result.source,
        publiclyVisible: result.publiclyVisible,
        item,
        count: result.items.length,
        ...(result.sdkError ? { sdkError: result.sdkError } : {}),
      };
    }

    if (singleKey) {
      return res.status(200).json({ ok: true, policy: policies[singleKey] });
    }
    return res.status(200).json({ ok: true, policies });
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

    const results = [];
    for (const cfg of Object.values(LEGAL_POLICIES_CONFIG)) {
      const seeded = await seedPolicyIfEmpty(cfg, sdkClient, apiKey, siteId);
      results.push(seeded);
    }

    const hasFailures = results.some((r) => r.status === 'insert_failed');
    return res.status(hasFailures ? 500 : 200).json({
      ok: !hasFailures,
      hasApiKey: Boolean(apiKey),
      results,
    });
  }

  return res.status(405).json({ ok: false, error: 'Method not allowed. Use GET or POST.' });
}
