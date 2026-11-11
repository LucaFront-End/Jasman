import process from 'node:process';
import { createClient, ApiKeyStrategy, OAuthStrategy } from '@wix/sdk';
import { conversations, messages } from '@wix/inbox';
import { submittedContact } from '@wix/crm';
import { items } from '@wix/data';

const WIX_SITE_ID =
  process.env.WIX_SITE_ID ||
  process.env.VITE_WIX_SITE_ID ||
  '7fd3b8ea-a3f3-4b51-9b48-4ec1f53d2cc9';

const WIX_CLIENT_ID =
  process.env.WIX_CLIENT_ID ||
  process.env.VITE_WIX_CLIENT_ID ||
  '5aabc542-16cf-44de-bedf-d8eb7ad08c46';

const CONTACTO_COLLECTION = 'Contactoweb';

function getApiKey() {
  return (
    process.env.WIX_API_KEY ||
    process.env.VITE_WIX_API_KEY ||
    ''
  ).trim();
}

function getAccountId() {
  return (
    process.env.WIX_ACCOUNT_ID ||
    process.env.VITE_WIX_ACCOUNT_ID ||
    ''
  ).trim();
}

function createInboxSdkClient(apiKey) {
  const accountId = getAccountId();
  return createClient({
    modules: { conversations, messages, items },
    auth: ApiKeyStrategy({
      apiKey,
      siteId: WIX_SITE_ID,
      ...(accountId ? { accountId } : {}),
    }),
  });
}

async function createVisitorDataClient() {
  const client = createClient({
    modules: { items, submittedContact },
    auth: OAuthStrategy({ clientId: WIX_CLIENT_ID }),
  });
  const tokens = await client.auth.generateVisitorTokens();
  client.auth.setTokens(tokens);
  return client;
}

function splitFullName(fullName = '') {
  const parts = String(fullName).trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { first: 'Cliente', last: 'Tienda Jasman' };
  if (parts.length === 1) return { first: parts[0], last: '' };
  return {
    first: parts[0],
    last: parts.slice(1).join(' '),
  };
}

async function submitVisitorCrmContact({ nombre, correo, telefono }) {
  try {
    const cleanEmail = String(correo || '').trim().toLowerCase();
    const cleanPhone = String(telefono || '').replace(/\D/g, '');
    const { first, last } = splitFullName(nombre);
    const visitorClient = await createVisitorDataClient();
    const res = await visitorClient.submittedContact.appendOrCreateContact({
      info: {
        name: {
          first,
          ...(last ? { last } : {}),
        },
        ...(cleanEmail
          ? {
              emails: {
                items: [{ tag: 'MAIN', email: cleanEmail }],
              },
            }
          : {}),
        ...(cleanPhone
          ? {
              phones: {
                items: [{ tag: 'MOBILE', countryCode: 'MX', phone: cleanPhone }],
              },
            }
          : {}),
      },
    });
    return res?.contactId || '';
  } catch {
    return '';
  }
}

async function sendParticipantInboxMessage(inboxClient, conversationId, messagePayload) {
  try {
    return await inboxClient.messages.sendMessage(conversationId, messagePayload, {
      sendNotifications: true,
      sendAs: 'PARTICIPANT',
    });
  } catch {
    return inboxClient.messages.sendMessage(conversationId, messagePayload, {
      sendNotifications: true,
    });
  }
}

async function resolveOrCreateWixContact(apiKey, { nombre, correo, telefono }) {
  const headers = {
    Authorization: apiKey,
    'wix-site-id': WIX_SITE_ID,
    'Content-Type': 'application/json',
  };

  const cleanEmail = String(correo || '').trim().toLowerCase();
  const cleanPhone = String(telefono || '').replace(/\D/g, '');
  const { first, last } = splitFullName(nombre);

  // 1. Try finding existing contact by email first
  if (cleanEmail) {
    try {
      const queryRes = await fetch(
        'https://www.wixapis.com/contacts/v4/contacts/query',
        {
          method: 'POST',
          headers,
          body: JSON.stringify({
            query: {
              filter: {
                'info.emails.items.email': cleanEmail,
              },
              paging: { limit: 1 },
            },
          }),
        }
      );
      if (queryRes.ok) {
        const queryData = await queryRes.json();
        const existing = queryData?.contacts?.[0];
        if (existing?.id) {
          return existing.id;
        }
      }
    } catch {
      // Proceed to create contact
    }
  }

  // 2. Create new CRM contact (allowDuplicates: true prevents 409 conflict if phone/email is linked elsewhere)
  const createBody = {
    info: {
      name: {
        first,
        ...(last ? { last } : {}),
      },
      ...(cleanEmail
        ? {
            emails: {
              items: [{ tag: 'MAIN', email: cleanEmail }],
            },
          }
        : {}),
      ...(cleanPhone
        ? {
            phones: {
              items: [
                {
                  tag: 'MOBILE',
                  countryCode: 'MX',
                  phone: cleanPhone,
                },
              ],
            },
          }
        : {}),
    },
    allowDuplicates: true,
  };

  const createRes = await fetch('https://www.wixapis.com/contacts/v4/contacts', {
    method: 'POST',
    headers,
    body: JSON.stringify(createBody),
  });

  if (!createRes.ok) {
    const errTxt = await createRes.text();
    throw new Error(`contacts_v4_error_${createRes.status}: ${errTxt.slice(0, 180)}`);
  }

  const createdData = await createRes.json();
  return createdData?.contact?.id || null;
}

function extractWixMessageText(msg) {
  if (!msg?.content) return '';
  if (Array.isArray(msg.content?.basic?.items) && msg.content.basic.items.length > 0) {
    const texts = msg.content.basic.items
      .map((it) => it?.text || it?.image?.url || it?.file?.url || '')
      .filter(Boolean);
    if (texts.length > 0) return texts.join('\n');
  }
  if (msg.content?.minimal?.text) return msg.content.minimal.text;
  if (msg.content?.previewText && !msg.content?.form) return msg.content.previewText;
  return '';
}

function normalizeWixInboxMessages(rawMessages = []) {
  return [...rawMessages]
    .reverse()
    .filter((m) => !m?.content?.form)
    .map((m) => {
      const text = extractWixMessageText(m);
      if (!text) return null;
      return {
        id: m._id || `wix-${m.sequence || Date.now()}`,
        role:
          m.direction === 'BUSINESS_TO_PARTICIPANT' ? 'advisor' : 'user',
        text,
        createdAt: m._createdDate || new Date().toISOString(),
        sequence: m.sequence || 0,
      };
    })
    .filter(Boolean);
}

async function syncCmsLeadThread({
  cmsThreadId,
  conversationId,
  contactId,
  nombre,
  telefono,
  correo,
  latestMessage,
  pagina,
}) {
  try {
    const dataClient = await createVisitorDataClient();
    const nowIso = new Date().toISOString();

    if (cmsThreadId) {
      try {
        const existing = await dataClient.items.get(CONTACTO_COLLECTION, cmsThreadId);
        if (existing) {
          const prevHistory = Array.isArray(existing.historialChat)
            ? existing.historialChat
            : [];
          const nextHistory = latestMessage
            ? [
                ...prevHistory,
                {
                  id: `u-${Date.now()}`,
                  role: 'user',
                  text: latestMessage,
                  createdAt: nowIso,
                },
              ]
            : prevHistory;

          const updated = await dataClient.items.update(CONTACTO_COLLECTION, {
            ...existing,
            _id: cmsThreadId,
            mensaje: latestMessage || existing.mensaje || 'Inicio de chat en línea',
            historialChat: nextHistory,
            wixConversationId: conversationId || existing.wixConversationId || '',
            wixContactId: contactId || existing.wixContactId || '',
          });
          return updated?._id || cmsThreadId;
        }
      } catch {
        // Insert fresh record below if get/update isn't permitted
      }
    }

    const initialHistory = latestMessage
      ? [
          {
            id: `u-${Date.now()}`,
            role: 'user',
            text: latestMessage,
            createdAt: nowIso,
          },
        ]
      : [];

    const inserted = await dataClient.items.insert(CONTACTO_COLLECTION, {
      nombre: String(nombre || '').trim(),
      telefono: String(telefono || '').replace(/\D/g, ''),
      email: String(correo || '').trim(),
      asunto: 'Chat en Vivo · Tienda Jasman',
      mensaje: latestMessage || 'Cliente inició sesión de chat en Tienda Online',
      origen: 'Chat Wix Inbox Tienda (/landing-tienda-preview)',
      tipo: 'CHAT_INBOX_TIENDA',
      pagina: pagina || '/landing-tienda-preview',
      fechaEnvio: nowIso,
      wixConversationId: conversationId || '',
      wixContactId: contactId || '',
      historialChat: initialHistory,
    });

    return inserted?._id || null;
  } catch {
    return cmsThreadId || null;
  }
}

async function readCmsFallbackMessages(cmsThreadId) {
  if (!cmsThreadId) return [];
  try {
    const dataClient = await createVisitorDataClient();
    const doc = await dataClient.items.get(CONTACTO_COLLECTION, cmsThreadId);
    if (!doc) return [];

    const history = Array.isArray(doc.historialChat) ? [...doc.historialChat] : [];
    if (doc.respuestaAsesor && String(doc.respuestaAsesor).trim()) {
      const replyText = String(doc.respuestaAsesor).trim();
      const alreadyIncluded = history.some(
        (m) => m.role === 'advisor' && m.text === replyText
      );
      if (!alreadyIncluded) {
        history.push({
          id: `cms-adv-${doc._updatedDate || '1'}`,
          role: 'advisor',
          text: replyText,
          createdAt: doc._updatedDate || new Date().toISOString(),
        });
      }
    }
    return history;
  } catch {
    return [];
  }
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
  return new Promise((resolve) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
    });
    req.on('end', () => {
      if (!raw.trim()) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch {
        resolve({});
      }
    });
    req.on('error', () => resolve({}));
  });
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  const apiKey = getApiKey();

  // 1. Poll messages or check Inbox status (GET /api/wix-inbox)
  if (req.method === 'GET') {
    const urlObj = new URL(req.url || '/api/wix-inbox', 'http://localhost');
    if (req.query?.check || urlObj.searchParams.get('check')) {
      return res.status(200).json({
        ok: true,
        hasApiKey: Boolean(apiKey),
        siteId: WIX_SITE_ID,
        status: apiKey ? 'wix_inbox_ready' : 'missing_wix_api_key',
      });
    }

    const conversationId =
      req.query?.conversationId || urlObj.searchParams.get('conversationId') || '';
    const cmsThreadId =
      req.query?.cmsThreadId || urlObj.searchParams.get('cmsThreadId') || '';

    if (
      apiKey &&
      conversationId &&
      !conversationId.startsWith('cms:') &&
      !conversationId.startsWith('local:')
    ) {
      try {
        const inboxClient = createInboxSdkClient(apiKey);
        const listRes = await inboxClient.messages.listMessages(
          conversationId,
          'BUSINESS_AND_PARTICIPANT'
        );
        const normalized = normalizeWixInboxMessages(listRes?.messages || []);
        return res.status(200).json({
          ok: true,
          mode: 'wix_inbox_live',
          conversationId,
          messages: normalized,
        });
      } catch (err) {
        return res.status(200).json({
          ok: false,
          mode: 'wix_inbox_error',
          error: err?.message || 'poll_failed',
          messages: await readCmsFallbackMessages(cmsThreadId),
        });
      }
    }

    const fallbackId = conversationId.startsWith('cms:')
      ? conversationId.slice(4)
      : cmsThreadId;
    const cmsMessages = await readCmsFallbackMessages(fallbackId);
    return res.status(200).json({
      ok: true,
      mode: 'wix_cms_cloud',
      conversationId: conversationId || (fallbackId ? `cms:${fallbackId}` : ''),
      messages: cmsMessages,
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  }

  const body = await parseJsonBody(req);
  const action = body.action || 'start';

  // 2. Start Conversation after Pre-Chat Lead Form
  if (action === 'start') {
    const nombre = String(body.nombre || '').trim();
    const telefono = String(body.telefono || '').replace(/\D/g, '');
    const correo = String(body.correo || '').trim();
    const initialMessage = String(body.initialMessage || '').trim();
    const pagina = String(body.pagina || '/llantas').trim();

    if (!nombre || telefono.length < 10 || !correo.includes('@')) {
      return res.status(400).json({
        ok: false,
        error: 'Datos de contacto incompletos.',
      });
    }

    // Always reconcile/create the customer in Wix Contacts (works even without WIX_API_KEY)
    let contactId = await submitVisitorCrmContact({ nombre, correo, telefono });
    let conversationId = '';
    let mode = 'wix_cms_cloud';
    let inboxMessages = [];
    let inboxError = null;

    if (apiKey) {
      try {
        if (!contactId) {
          contactId = await resolveOrCreateWixContact(apiKey, {
            nombre,
            correo,
            telefono,
          });
        }

        if (contactId) {
          const inboxClient = createInboxSdkClient(apiKey);
          const convRes = await inboxClient.conversations.getOrCreateConversation({
            contactId,
          });
          conversationId =
            convRes?.conversation?._id || convRes?.conversation?.id || '';

          if (conversationId) {
            mode = 'wix_inbox_live';

            // Send structured lead form into Wix Inbox with notifications enabled & customer sender
            await sendParticipantInboxMessage(inboxClient, conversationId, {
              direction: 'PARTICIPANT_TO_BUSINESS',
              visibility: 'BUSINESS_AND_PARTICIPANT',
              content: {
                previewText: `Datos de chat: ${nombre} · ${telefono}`,
                form: {
                  title: 'Datos del Cliente · Tienda Jasman',
                  description: `Origen: ${pagina}`,
                  fields: [
                    { name: 'Nombre', value: nombre },
                    { name: 'WhatsApp / Teléfono', value: telefono },
                    { name: 'Correo electrónico', value: correo },
                  ],
                },
              },
            }).catch(() => {});

            if (initialMessage) {
              await sendParticipantInboxMessage(inboxClient, conversationId, {
                direction: 'PARTICIPANT_TO_BUSINESS',
                visibility: 'BUSINESS_AND_PARTICIPANT',
                content: {
                  previewText: initialMessage.slice(0, 120),
                  basic: {
                    items: [{ text: initialMessage }],
                  },
                },
              });
            }

            const listRes = await inboxClient.messages.listMessages(
              conversationId,
              'BUSINESS_AND_PARTICIPANT'
            );
            inboxMessages = normalizeWixInboxMessages(listRes?.messages || []);
          }
        }
      } catch (err) {
        inboxError = err?.message || 'wix_inbox_init_failed';
      }
    } else {
      inboxError = 'missing_wix_api_key';
    }

    const cmsThreadId = await syncCmsLeadThread({
      cmsThreadId: body.cmsThreadId || '',
      conversationId,
      contactId,
      nombre,
      telefono,
      correo,
      latestMessage: initialMessage,
      pagina,
    });

    const effectiveConvId =
      conversationId || (cmsThreadId ? `cms:${cmsThreadId}` : `local:${Date.now()}`);

    if (mode !== 'wix_inbox_live' && cmsThreadId) {
      inboxMessages = await readCmsFallbackMessages(cmsThreadId);
    }

    return res.status(200).json({
      ok: true,
      mode,
      contactId,
      conversationId: effectiveConvId,
      cmsThreadId: cmsThreadId || '',
      messages: inboxMessages,
      ...(inboxError ? { warning: inboxError } : {}),
    });
  }

  // 3. Send Visitor Message to Wix Inbox
  if (action === 'send') {
    let conversationId = String(body.conversationId || '').trim();
    const cmsThreadId = String(body.cmsThreadId || '').trim();
    let contactId = String(body.contactId || '').trim();
    const text = String(body.text || '').trim();
    const nombre = String(body.nombre || 'Cliente Tienda').trim();
    const telefono = String(body.telefono || '').replace(/\D/g, '');
    const correo = String(body.correo || '').trim();
    const pagina = String(body.pagina || '/llantas').trim();

    if (!text) {
      return res.status(400).json({ ok: false, error: 'Mensaje vacío.' });
    }

    let sentMessage = null;
    let mode = 'wix_cms_cloud';
    let sendWarning = null;

    if (apiKey) {
      try {
        const inboxClient = createInboxSdkClient(apiKey);

        // Auto-upgrade fallback cms:/local: sessions into a real Wix Inbox conversation
        if (
          !conversationId ||
          conversationId.startsWith('cms:') ||
          conversationId.startsWith('local:')
        ) {
          if (!contactId) {
            contactId =
              (await submitVisitorCrmContact({ nombre, correo, telefono })) ||
              (await resolveOrCreateWixContact(apiKey, { nombre, correo, telefono }));
          }
          if (contactId) {
            const convRes = await inboxClient.conversations.getOrCreateConversation({
              contactId,
            });
            conversationId =
              convRes?.conversation?._id || convRes?.conversation?.id || conversationId;
          }
        }

        if (
          conversationId &&
          !conversationId.startsWith('cms:') &&
          !conversationId.startsWith('local:')
        ) {
          const sendRes = await sendParticipantInboxMessage(
            inboxClient,
            conversationId,
            {
              direction: 'PARTICIPANT_TO_BUSINESS',
              visibility: 'BUSINESS_AND_PARTICIPANT',
              content: {
                previewText: text.slice(0, 120),
                basic: {
                  items: [{ text }],
                },
              },
            }
          );
          mode = 'wix_inbox_live';
          const rawMsg = sendRes?.message;
          sentMessage = {
            id: rawMsg?._id || `wix-${Date.now()}`,
            role: 'user',
            text,
            createdAt: rawMsg?._createdDate || new Date().toISOString(),
          };
        }
      } catch (err) {
        sendWarning = err?.message || 'wix_inbox_send_failed';
      }
    } else {
      sendWarning = 'missing_wix_api_key';
    }

    const effectiveCmsId = String(body.conversationId || '').startsWith('cms:')
      ? String(body.conversationId).slice(4)
      : cmsThreadId;

    const updatedCmsId = await syncCmsLeadThread({
      cmsThreadId: effectiveCmsId,
      conversationId,
      contactId,
      nombre,
      telefono,
      correo,
      latestMessage: text,
      pagina,
    });

    return res.status(200).json({
      ok: true,
      mode,
      conversationId,
      contactId,
      cmsThreadId: updatedCmsId || effectiveCmsId || '',
      message: sentMessage || {
        id: `usr-${Date.now()}`,
        role: 'user',
        text,
        createdAt: new Date().toISOString(),
      },
      ...(sendWarning ? { warning: sendWarning } : {}),
    });
  }

  return res.status(400).json({ ok: false, error: 'unknown_action' });
}
