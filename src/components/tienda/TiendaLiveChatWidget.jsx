import { useState, useEffect, useRef, useCallback } from 'react';
import { C, F } from '../../hooks/useAnimations';
import { useWixCatalogProducts, formatMXN } from '../../data/productosMasterData';
import { useTiendaState } from '../../hooks/useTiendaState';
import { saveContactoWeb } from '../../services/wixService';
import { sendFormSubmitEmail } from '../../services/formSubmitService';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Check,
  User,
  Phone,
  Mail,
  AlertCircle,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';

const SESSION_STORAGE_KEY = 'jasman_wix_inbox_session_v1';

const QUICK_PROMPTS = [
  '¿Cómo funciona el Envío Gratis Nacional?',
  'Busco llantas 205/55R16 o 195/65R15',
  '¿Cómo aplico el descuento por volumen?',
  'Cotizar montaje en sucursal Jasman',
];

function buildMeasureQuickPreview(userText, catalogProducts) {
  const measureMatch = String(userText || '').match(/(\d{3}\/\d{2}\s*R?\d{2})/i);
  if (!measureMatch || !Array.isArray(catalogProducts)) return null;

  const cleanM = measureMatch[1].toUpperCase().replace(/\s+/g, '');
  const normalized = cleanM.includes('R')
    ? cleanM
    : cleanM.replace(/(\d{3}\/\d{2})(\d{2})/, '$1R$2');

  const matches = catalogProducts.filter(
    (p) => p.measure === normalized && p.inStock && p.finalPriceTaxExcluded > 0
  );
  if (matches.length === 0) return null;

  const top = matches
    .slice(0, 3)
    .map(
      (m) =>
        `• ${m.brand} (${m.cleanTitle}) — ${formatMXN(m.finalPriceTaxExcluded)} Con IVA`
    )
    .join('\n');

  return `Mientras nuestro asesor de Wix Inbox revisa tu mensaje, encontramos ${matches.length} opciones en stock para ${normalized}:\n${top}`;
}

function loadSavedSession() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.nombre && parsed?.telefono && parsed?.correo && parsed?.conversationId) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export default function TiendaLiveChatWidget({ positionLeft = false }) {
  const { user } = useTiendaState();
  const { products: catalogProducts } = useWixCatalogProducts();

  const [open, setOpen] = useState(false);
  const [leadSession, setLeadSession] = useState(() => loadSavedSession());
  const [pendingInitialMessage, setPendingInitialMessage] = useState('');

  // Pre-chat lead form state ("pedir primero sus datos")
  const [nombre, setNombre] = useState(() => loadSavedSession()?.nombre || user?.nombre || '');
  const [telefono, setTelefono] = useState(
    () => loadSavedSession()?.telefono || user?.telefono || ''
  );
  const [correo, setCorreo] = useState(() => loadSavedSession()?.correo || user?.correo || '');
  const [formErrors, setFormErrors] = useState({});
  const [startingSession, setStartingSession] = useState(false);

  // Live dynamic messages state
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState([]);
  const [deliveredNotice, setDeliveredNotice] = useState(false);
  const messagesEndRef = useRef(null);

  // Pre-fill lead inputs if store user logs in while form hasn't been submitted yet
  useEffect(() => {
    if (!leadSession && user) {
      if (!nombre && user.nombre) setNombre(user.nombre);
      if (!telefono && user.telefono) setTelefono(user.telefono);
      if (!correo && user.correo) setCorreo(user.correo);
    }
  }, [user, leadSession, nombre, telefono, correo]);

  const mergeServerMessages = useCallback((serverList = [], customerName = '') => {
    const firstName = String(customerName || 'Cliente').trim().split(/\s+/)[0] || 'Cliente';
    const welcomeMsg = {
      id: 'welcome-inbox',
      role: 'system_welcome',
      text: `¡Hola ${firstName}! Ya estás conectado en directo con Wix Inbox de Tienda Jasman. Escribe tu consulta o medida y un asesor te responderá aquí mismo en tiempo real.`,
      createdAt: '0',
    };

    setMessages((prev) => {
      const localHints = prev.filter((m) => m.isCatalogHint);
      const mapById = new Map();

      for (const sm of serverList) {
        if (sm && sm.id && sm.text) {
          mapById.set(sm.id, sm);
        }
      }

      // Preserve optimistic messages not yet echoed back by server
      for (const pm of prev) {
        if (pm.optimistic && !Array.from(mapById.values()).some((s) => s.role === 'user' && s.text === pm.text)) {
          mapById.set(pm.id, pm);
        }
      }

      return [welcomeMsg, ...Array.from(mapById.values()), ...localHints];
    });
  }, []);

  const sendLiveMessage = useCallback(
    async (rawText, activeSession = leadSession) => {
      const clean = String(rawText || '').trim();
      if (!clean || !activeSession) return;

      const tempId = `opt-${Date.now()}`;
      setMessages((prev) => [
        ...prev,
        {
          id: tempId,
          role: 'user',
          text: clean,
          optimistic: true,
          createdAt: new Date().toISOString(),
        },
      ]);
      setInput('');
      setSending(true);

      // Optional instant stock helper if user asks for a specific tire size (e.g. 205/55R16)
      const measureHint = buildMeasureQuickPreview(clean, catalogProducts);
      if (measureHint) {
        setTimeout(() => {
          setMessages((prev) => {
            if (prev.some((m) => m.text === measureHint)) return prev;
            return [
              ...prev,
              {
                id: `hint-${Date.now()}`,
                role: 'assistant_hint',
                isCatalogHint: true,
                text: measureHint,
                createdAt: new Date().toISOString(),
              },
            ];
          });
        }, 350);
      }

      try {
        const res = await fetch('/api/wix-inbox', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'send',
            conversationId: activeSession.conversationId,
            cmsThreadId: activeSession.cmsThreadId || '',
            contactId: activeSession.contactId || '',
            nombre: activeSession.nombre,
            telefono: activeSession.telefono,
            correo: activeSession.correo,
            pagina:
              typeof window !== 'undefined'
                ? window.location.pathname
                : '/landing-tienda-preview',
            text: clean,
          }),
        });
        const data = await res.json();

        if (data?.ok && data?.message) {
          setMessages((prev) =>
            prev.map((m) => (m.id === tempId ? { ...data.message, optimistic: false } : m))
          );
          if (data.cmsThreadId && data.cmsThreadId !== activeSession.cmsThreadId) {
            const updatedSession = { ...activeSession, cmsThreadId: data.cmsThreadId };
            setLeadSession(updatedSession);
            try {
              sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(updatedSession));
            } catch {
              // ignore
            }
          }
        } else {
          // Direct browser fallback to Wix CMS if serverless endpoint unreachable
          saveContactoWeb({
            nombre: activeSession.nombre,
            telefono: activeSession.telefono,
            email: activeSession.correo,
            asunto: 'Mensaje Chat Tienda Jasman',
            mensaje: clean,
            origen: 'Chat Tienda Online',
          }).catch(() => {});
        }

        setDeliveredNotice(true);
        setTimeout(() => setDeliveredNotice(false), 2600);
      } catch {
        saveContactoWeb({
          nombre: activeSession.nombre,
          telefono: activeSession.telefono,
          email: activeSession.correo,
          asunto: 'Mensaje Chat Tienda Jasman',
          mensaje: clean,
          origen: 'Chat Tienda Online',
        }).catch(() => {});
      } finally {
        setSending(false);
      }
    },
    [leadSession, catalogProducts]
  );

  // Listen to external UI triggers (e.g. Cart Drawer "Consultar con Asesor en Chat")
  useEffect(() => {
    const handleUI = (e) => {
      if (e.detail?.type === 'OPEN_CHAT') {
        setOpen(true);
        if (e.detail?.initialMessage) {
          const msgText = String(e.detail.initialMessage).trim();
          if (leadSession) {
            sendLiveMessage(msgText, leadSession);
          } else {
            setPendingInitialMessage(msgText);
          }
        }
      }
    };
    window.addEventListener('jasman-tienda-ui', handleUI);
    return () => window.removeEventListener('jasman-tienda-ui', handleUI);
  }, [leadSession, sendLiveMessage]);

  // Dynamic real-time polling from Wix Inbox while chat is open & lead confirmed
  useEffect(() => {
    if (!open || !leadSession?.conversationId) return undefined;

    let cancelled = false;

    const pollInbox = async () => {
      try {
        const qs = new URLSearchParams({
          conversationId: leadSession.conversationId,
          cmsThreadId: leadSession.cmsThreadId || '',
        });
        const res = await fetch(`/api/wix-inbox?${qs.toString()}`);
        if (!res.ok || cancelled) return;
        const data = await res.json();
        if (!cancelled && Array.isArray(data?.messages)) {
          mergeServerMessages(data.messages, leadSession.nombre);
        }
      } catch {
        // Silent retry on next interval
      }
    };

    pollInbox();
    const intervalId = setInterval(pollInbox, 4000);
    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [open, leadSession, mergeServerMessages]);

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    if (open && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open, leadSession]);

  const validateLeadForm = () => {
    const errs = {};
    const trimmedName = nombre.trim();
    if (!trimmedName || trimmedName.length < 3) {
      errs.nombre = 'Ingresa tu nombre y apellido.';
    } else if (/\d/.test(trimmedName)) {
      errs.nombre = 'El nombre no debe contener números.';
    }

    const cleanPhone = telefono.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      errs.telefono = 'Ingresa tu número de 10 dígitos.';
    } else if (/^(\d)\1{9}$/.test(cleanPhone)) {
      errs.telefono = 'Ingresa un teléfono válido.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(correo.trim())) {
      errs.correo = 'Ingresa un correo electrónico válido.';
    }

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleStartChatSession = async (e) => {
    e.preventDefault();
    if (!validateLeadForm()) return;

    setStartingSession(true);
    const cleanName = nombre.trim();
    const cleanPhone = telefono.replace(/\D/g, '');
    const cleanEmail = correo.trim();
    const firstMsg = pendingInitialMessage.trim();

    sendFormSubmitEmail({
      seccion: 'Chat en Vivo — Tienda de Llantas Jasman',
      asuntoCorreo: `Jasman Chat en Vivo — ${cleanName} (${cleanPhone})`,
      correoRespuesta: cleanEmail,
      campos: {
        'Nombre Completo': cleanName,
        'Teléfono / WhatsApp': cleanPhone,
        'Correo Electrónico': cleanEmail,
        'Mensaje Inicial': firstMsg || 'Cliente registró sus datos para atención en el chat de la tienda',
      },
    }).catch(() => {});

    try {
      const res = await fetch('/api/wix-inbox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'start',
          nombre: cleanName,
          telefono: cleanPhone,
          correo: cleanEmail,
          initialMessage: firstMsg,
          pagina:
            typeof window !== 'undefined'
              ? window.location.pathname
              : '/llantas',
        }),
      });

      const data = await res.json();
      const newSession = {
        nombre: cleanName,
        telefono: cleanPhone,
        correo: cleanEmail,
        conversationId: data?.conversationId || `local:${Date.now()}`,
        contactId: data?.contactId || '',
        cmsThreadId: data?.cmsThreadId || '',
        mode: data?.mode || 'wix_cms_cloud',
      };

      setLeadSession(newSession);
      setPendingInitialMessage('');
      try {
        sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(newSession));
      } catch {
        // ignore
      }

      mergeServerMessages(
        Array.isArray(data?.messages) && data.messages.length > 0
          ? data.messages
          : firstMsg
            ? [
                {
                  id: `init-${Date.now()}`,
                  role: 'user',
                  text: firstMsg,
                  createdAt: new Date().toISOString(),
                },
              ]
            : [],
        cleanName
      );
    } catch {
      // Resilient fallback if offline / dev API unavailable
      saveContactoWeb({
        _skipFormSubmit: true,
        nombre: cleanName,
        telefono: cleanPhone,
        email: cleanEmail,
        asunto: 'Inicio Chat en Línea Tienda',
        mensaje: firstMsg || 'Cliente registró sus datos para iniciar chat',
        origen: 'Chat Wix Inbox Tienda',
      }).catch(() => {});

      const fallbackSession = {
        nombre: cleanName,
        telefono: cleanPhone,
        correo: cleanEmail,
        conversationId: `local:${Date.now()}`,
        contactId: '',
        cmsThreadId: '',
        mode: 'wix_cms_cloud',
      };
      setLeadSession(fallbackSession);
      setPendingInitialMessage('');
      try {
        sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(fallbackSession));
      } catch {
        // ignore
      }
      mergeServerMessages(
        firstMsg
          ? [
              {
                id: `init-${Date.now()}`,
                role: 'user',
                text: firstMsg,
                createdAt: new Date().toISOString(),
              },
            ]
          : [],
        cleanName
      );
    } finally {
      setStartingSession(false);
    }
  };

  const handleResetLead = () => {
    setLeadSession(null);
    setMessages([]);
    try {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  const handleMessageSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || sending) return;
    sendLiveMessage(input);
  };

  const hasUserSentMessage = messages.some((m) => m.role === 'user');

  return (
    <div
      className="jasman-chat-widget-root"
      style={{
        position: 'fixed',
        bottom: 24,
        right: positionLeft ? 'auto' : 24,
        left: positionLeft ? 24 : 'auto',
        zIndex: 992,
      }}
    >
      {open ? (
        <div
          className="jasman-chat-panel-box"
          style={{
            width: 'min(382px, calc(100vw - 24px))',
            height: leadSession ? 515 : 'auto',
            maxHeight: 'calc(100dvh - 96px)',
            borderRadius: 26,
            background: '#FFFFFF',
            border: '1px solid rgba(26, 31, 54, 0.10)',
            boxShadow: '0 28px 68px rgba(15, 20, 40, 0.28)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Chat Header */}
          <div
            style={{
              padding: '15px 18px',
              background: C.navy,
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 10,
              flexShrink: 0,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 12,
                  background: C.red,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <MessageSquare size={17} color="#FFFFFF" />
              </div>
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontFamily: F.heading,
                    fontSize: 13,
                    fontWeight: 800,
                    color: '#FFFFFF',
                  }}
                >
                  Chat en Vivo · Tienda Jasman
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    fontSize: 11,
                    color: '#86EFAC',
                    fontWeight: 600,
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: '#22C55E',
                      boxShadow: '0 0 8px #22C55E',
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {leadSession
                      ? 'Conectado con Wix Inbox'
                      : 'Atención directa · Ingresa tus datos'}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Cerrar chat"
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                border: '1px solid rgba(255,255,255,0.16)',
                background: 'rgba(255,255,255,0.08)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              <X size={15} />
            </button>
          </div>

          {/* STEP 1: PRE-CHAT LEAD FORM FIRST ("pedir primero sus datos") */}
          {!leadSession ? (
            <form
              onSubmit={handleStartChatSession}
              style={{
                padding: '18px 18px 20px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                background: '#FFFFFF',
              }}
            >
              <div
                style={{
                  padding: '11px 13px',
                  borderRadius: 14,
                  background: '#F8FAFC',
                  border: '1px solid rgba(26, 31, 54, 0.07)',
                  fontSize: 12,
                  color: '#475569',
                  lineHeight: 1.45,
                }}
              >
                <strong style={{ color: C.navy }}>¡Bienvenido a Tienda Jasman!</strong>{' '}
                Compártenos tus datos primero para conectarte en tiempo real con un asesor.
              </div>

              {pendingInitialMessage && (
                <div
                  style={{
                    padding: '8px 12px',
                    borderRadius: 12,
                    background: '#FFF5F5',
                    border: '1px solid rgba(196, 30, 36, 0.2)',
                    fontSize: 11,
                    color: C.red,
                    fontWeight: 700,
                  }}
                >
                  ✓ Tu consulta de carrito se enviará automáticamente al iniciar.
                </div>
              )}

              {/* Nombre */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontFamily: F.heading,
                    fontSize: 10,
                    fontWeight: 800,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: '#64748B',
                    marginBottom: 5,
                  }}
                >
                  Nombre y apellido *
                </label>
                <div style={{ position: 'relative' }}>
                  <User
                    size={14}
                    color="#94A3B8"
                    style={{
                      position: 'absolute',
                      left: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                    }}
                  />
                  <input
                    type="text"
                    value={nombre}
                    onChange={(e) => {
                      setNombre(e.target.value);
                      if (formErrors.nombre) {
                        setFormErrors((p) => ({ ...p, nombre: null }));
                      }
                    }}
                    placeholder="Ej. Alejandro Morales"
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 34px',
                      borderRadius: 12,
                      border: `1px solid ${
                        formErrors.nombre ? C.red : 'rgba(26, 31, 54, 0.14)'
                      }`,
                      background: '#F8FAFC',
                      fontFamily: F.body,
                      fontSize: 13,
                      color: C.navy,
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                {formErrors.nombre && (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      fontSize: 11,
                      color: C.red,
                      marginTop: 4,
                    }}
                  >
                    <AlertCircle size={11} /> {formErrors.nombre}
                  </span>
                )}
              </div>

              {/* Teléfono / WhatsApp */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontFamily: F.heading,
                    fontSize: 10,
                    fontWeight: 800,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: '#64748B',
                    marginBottom: 5,
                  }}
                >
                  WhatsApp / Teléfono (10 dígitos) *
                </label>
                <div style={{ position: 'relative' }}>
                  <Phone
                    size={14}
                    color="#94A3B8"
                    style={{
                      position: 'absolute',
                      left: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                    }}
                  />
                  <input
                    type="tel"
                    maxLength={10}
                    value={telefono}
                    onChange={(e) => {
                      setTelefono(e.target.value.replace(/\D/g, ''));
                      if (formErrors.telefono) {
                        setFormErrors((p) => ({ ...p, telefono: null }));
                      }
                    }}
                    placeholder="55 1234 5678"
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 34px',
                      borderRadius: 12,
                      border: `1px solid ${
                        formErrors.telefono ? C.red : 'rgba(26, 31, 54, 0.14)'
                      }`,
                      background: '#F8FAFC',
                      fontFamily: F.body,
                      fontSize: 13,
                      color: C.navy,
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                {formErrors.telefono && (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      fontSize: 11,
                      color: C.red,
                      marginTop: 4,
                    }}
                  >
                    <AlertCircle size={11} /> {formErrors.telefono}
                  </span>
                )}
              </div>

              {/* Correo */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontFamily: F.heading,
                    fontSize: 10,
                    fontWeight: 800,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: '#64748B',
                    marginBottom: 5,
                  }}
                >
                  Correo electrónico *
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail
                    size={14}
                    color="#94A3B8"
                    style={{
                      position: 'absolute',
                      left: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                    }}
                  />
                  <input
                    type="email"
                    value={correo}
                    onChange={(e) => {
                      setCorreo(e.target.value);
                      if (formErrors.correo) {
                        setFormErrors((p) => ({ ...p, correo: null }));
                      }
                    }}
                    placeholder="correo@ejemplo.com"
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 34px',
                      borderRadius: 12,
                      border: `1px solid ${
                        formErrors.correo ? C.red : 'rgba(26, 31, 54, 0.14)'
                      }`,
                      background: '#F8FAFC',
                      fontFamily: F.body,
                      fontSize: 13,
                      color: C.navy,
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                {formErrors.correo && (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      fontSize: 11,
                      color: C.red,
                      marginTop: 4,
                    }}
                  >
                    <AlertCircle size={11} /> {formErrors.correo}
                  </span>
                )}
              </div>

              <button
                type="submit"
                disabled={startingSession}
                style={{
                  marginTop: 4,
                  width: '100%',
                  padding: '13px 18px',
                  borderRadius: 14,
                  border: 'none',
                  background: C.red,
                  color: '#FFFFFF',
                  fontFamily: F.heading,
                  fontSize: 12,
                  fontWeight: 800,
                  letterSpacing: '0.07em',
                  textTransform: 'uppercase',
                  cursor: startingSession ? 'wait' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  boxShadow: '0 12px 26px rgba(196, 30, 36, 0.28)',
                  opacity: startingSession ? 0.8 : 1,
                }}
              >
                {startingSession ? (
                  <>Conectando con Wix Inbox...</>
                ) : (
                  <>
                    Iniciar Chat en Vivo <ArrowRight size={15} />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* STEP 2: LIVE DYNAMIC WIX INBOX CONVERSATION */
            <>
              {/* Connected Lead Subbar */}
              <div
                style={{
                  padding: '7px 14px',
                  background: '#F1F5F9',
                  borderBottom: '1px solid rgba(26, 31, 54, 0.07)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 8,
                  fontSize: 11,
                  color: '#475569',
                  flexShrink: 0,
                }}
              >
                <span
                  style={{
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    fontWeight: 600,
                  }}
                >
                  <strong style={{ color: C.navy }}>{leadSession.nombre}</strong> ·{' '}
                  {leadSession.telefono}
                </span>
                <button
                  type="button"
                  onClick={handleResetLead}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    color: C.red,
                    fontFamily: F.heading,
                    fontSize: 10,
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '2px 4px',
                    flexShrink: 0,
                  }}
                >
                  <RefreshCw size={10} /> Cambiar datos
                </button>
              </div>

              {/* Messages Stream */}
              <div
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: '14px 14px 10px',
                  background: '#F8FAFC',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                }}
              >
                {messages.map((m) => {
                  const isUser = m.role === 'user';
                  const isAdvisor = m.role === 'advisor';
                  return (
                    <div
                      key={m.id}
                      style={{
                        alignSelf: isUser ? 'flex-end' : 'flex-start',
                        maxWidth: '86%',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 3,
                      }}
                    >
                      {isAdvisor && (
                        <span
                          style={{
                            fontFamily: F.heading,
                            fontSize: 9.5,
                            fontWeight: 800,
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase',
                            color: '#15803D',
                            paddingLeft: 4,
                          }}
                        >
                          Asesor Jasman · En vivo
                        </span>
                      )}
                      <div
                        style={{
                          padding: '10px 14px',
                          borderRadius: isUser
                            ? '18px 18px 4px 18px'
                            : '18px 18px 18px 4px',
                          background: isUser
                            ? C.red
                            : isAdvisor
                              ? '#ECFDF5'
                              : '#FFFFFF',
                          color: isUser ? '#FFFFFF' : C.navy,
                          border: isUser
                            ? 'none'
                            : isAdvisor
                              ? '1px solid rgba(22, 163, 74, 0.25)'
                              : '1px solid rgba(26, 31, 54, 0.08)',
                          boxShadow: '0 4px 12px rgba(26, 31, 54, 0.04)',
                          fontSize: 12.5,
                          lineHeight: 1.5,
                          whiteSpace: 'pre-line',
                        }}
                      >
                        {m.text}
                      </div>
                    </div>
                  );
                })}

                {/* Quick Prompt Chips shown before first user message */}
                {!hasUserSentMessage && (
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 6,
                      marginTop: 4,
                    }}
                  >
                    {QUICK_PROMPTS.map((prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        onClick={() => sendLiveMessage(prompt)}
                        className="jasman-selectable-filter"
                        style={{
                          padding: '6px 10px',
                          borderRadius: 9999,
                          border: '1px solid rgba(196, 30, 36, 0.22)',
                          background: '#FFF5F5',
                          color: C.red,
                          fontFamily: F.heading,
                          fontSize: 10.5,
                          fontWeight: 700,
                          cursor: 'pointer',
                          textAlign: 'left',
                        }}
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                )}

                {deliveredNotice && (
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                      fontSize: 11,
                      color: '#15803D',
                      fontWeight: 700,
                      marginTop: 2,
                    }}
                  >
                    <Check size={12} /> Enviado a Wix Inbox · Asesor notificado
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input Bar */}
              <form
                onSubmit={handleMessageSubmit}
                style={{
                  padding: '11px 12px',
                  background: '#FFFFFF',
                  borderTop: '1px solid rgba(26, 31, 54, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  flexShrink: 0,
                }}
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Escribe tu mensaje o medida (ej. 205/55R16)..."
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    borderRadius: 9999,
                    border: '1px solid rgba(26, 31, 54, 0.12)',
                    background: '#F8FAFC',
                    fontFamily: F.body,
                    fontSize: 13,
                    color: C.navy,
                    outline: 'none',
                    minWidth: 0,
                  }}
                />
                <button
                  type="submit"
                  disabled={sending || !input.trim()}
                  aria-label="Enviar mensaje"
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: '50%',
                    border: 'none',
                    background: C.red,
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: sending || !input.trim() ? 'default' : 'pointer',
                    opacity: sending || !input.trim() ? 0.55 : 1,
                    flexShrink: 0,
                  }}
                >
                  <Send size={15} />
                </button>
              </form>
            </>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="jasman-chat-widget-trigger"
          style={{
            height: 52,
            padding: '0 20px',
            borderRadius: 9999,
            border: '1px solid rgba(255, 255, 255, 0.16)',
            background: C.navy,
            color: '#FFFFFF',
            fontFamily: F.heading,
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            boxShadow: '0 16px 40px rgba(26, 31, 54, 0.28)',
          }}
        >
          <span
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: C.red,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <MessageSquare size={14} color="#FFFFFF" />
          </span>
          <span className="jasman-chat-full-txt">Chat Tienda</span>
          <span className="jasman-chat-short-txt" style={{ display: 'none' }}>
            Chat
          </span>
          <Sparkles className="jasman-chat-sparkle" size={13} color="#FCA5A5" />
        </button>
      )}
      <style>{`
        @media (max-width: 640px) {
          .jasman-chat-widget-root {
            bottom: 14px !important;
            right: ${positionLeft ? 'auto' : '12px'} !important;
            left: ${positionLeft ? '12px' : 'auto'} !important;
          }
          .jasman-chat-widget-trigger {
            height: 44px !important;
            padding: 0 14px !important;
            gap: 7px !important;
            font-size: 11px !important;
          }
          .jasman-chat-full-txt,
          .jasman-chat-sparkle {
            display: none !important;
          }
          .jasman-chat-short-txt {
            display: inline !important;
          }
          .jasman-chat-panel-box {
            width: calc(100vw - 24px) !important;
            max-height: calc(100dvh - 88px) !important;
            border-radius: 22px !important;
          }
        }
      `}</style>
    </div>
  );
}
