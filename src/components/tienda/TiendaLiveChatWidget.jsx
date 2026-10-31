import { useState, useEffect, useRef } from 'react';
import { C, F } from '../../hooks/useAnimations';
import { PRODUCTOS_MASTER, formatMXN } from '../../data/productosMasterData';
import { useTiendaState } from '../../hooks/useTiendaState';
import { saveContactoWeb } from '../../services/wixService';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Check,
} from 'lucide-react';

const QUICK_PROMPTS = [
  '¿Cómo funciona el Envío Gratis vs Instalación?',
  'Busco llantas 205/55R16 o 195/65R15',
  '¿Cómo aplico el descuento por volumen?',
  'Quiero que un asesor me contacte',
];

function generateAssistantReply(userText) {
  const q = userText.toLowerCase();

  // Check if user mentions a specific tire measure (e.g. 205/55R16)
  const measureMatch = userText.match(/(\d{3}\/\d{2}\s*R?\d{2})/i);
  if (measureMatch) {
    const cleanM = measureMatch[1].toUpperCase().replace(/\s+/g, '');
    const normalized = cleanM.includes('R')
      ? cleanM
      : cleanM.replace(/(\d{3}\/\d{2})(\d{2})/, '$1R$2');
    const matches = PRODUCTOS_MASTER.filter(
      (p) => p.measure === normalized && p.inStock
    );
    if (matches.length > 0) {
      const top = matches
        .slice(0, 3)
        .map((m) => `• ${m.brand} (${m.cleanTitle}) — ${formatMXN(m.finalPriceTaxExcluded)}`)
        .join('\n');
      return `Tenemos ${matches.length} opciones en stock para la medida ${normalized}:\n${top}\n\nPuedes filtrarlas directamente en el Catálogo Oficial.`;
    }
  }

  if (q.includes('envío') || q.includes('entrega') || q.includes('instalación') || q.includes('sucursal')) {
    return 'En Tienda Jasman la Entrega a Domicilio Nacional es GRATIS por defecto. Si prefieres montaje, balanceo y válvula nueva en cualquiera de nuestras +80 sucursales, puedes elegir "Instalación en Sucursal" por $999.00 MXN al agregar tus llantas.';
  }

  if (q.includes('descuento') || q.includes('volumen') || q.includes('cupón') || q.includes('10%')) {
    return 'Contamos con dos beneficios acumulables:\n• Descuento automático por volumen: −5% llevando 2 a 3 llantas, y −10% llevando el juego de 4 o más.\n• Cupón de −10% adicional en tu primera compra desde el botón de la barra superior.';
  }

  if (q.includes('asesor') || q.includes('contact') || q.includes('ayuda')) {
    return 'Con gusto. Déjanos aquí mismo tu nombre, correo o teléfono y la medida que buscas; nuestro equipo de especialistas de Tienda Jasman te responderá de inmediato.';
  }

  return 'Gracias por escribirnos al Chat de Tienda Jasman. Hemos registrado tu mensaje para darte seguimiento inmediato. Si buscas una medida específica (ej. 205/55R16 o 185/65R15), escríbela aquí y te muestro las existencias al instante.';
}

export default function TiendaLiveChatWidget({ positionLeft = false }) {
  const { user } = useTiendaState();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      text: '¡Hola! Soy el asistente en línea de Tienda Jasman. ¿En qué medida, marca o modalidad de entrega te puedo ayudar hoy?',
      time: 'Ahora',
    },
  ]);
  const [savedNotice, setSavedNotice] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const handleUI = (e) => {
      if (e.detail?.type === 'OPEN_CHAT') {
        setOpen(true);
        if (e.detail?.initialMessage) {
          const msgText = e.detail.initialMessage;
          setMessages((prev) => [
            ...prev,
            {
              id: `usr-${Date.now()}`,
              role: 'user',
              text: msgText,
              time: 'Ahora',
            },
            {
              id: `ast-${Date.now() + 1}`,
              role: 'assistant',
              text: generateAssistantReply(msgText),
              time: 'Ahora',
            },
          ]);
        }
      }
    };
    window.addEventListener('jasman-tienda-ui', handleUI);
    return () => window.removeEventListener('jasman-tienda-ui', handleUI);
  }, []);

  useEffect(() => {
    if (open && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open]);

  const sendMessage = (textToSend) => {
    const clean = String(textToSend || '').trim();
    if (!clean) return;

    setMessages((prev) => [
      ...prev,
      {
        id: `u-${prev.length + 1}`,
        role: 'user',
        text: clean,
        time: 'Ahora',
      },
      {
        id: `a-${prev.length + 2}`,
        role: 'assistant',
        text: generateAssistantReply(clean),
        time: 'Ahora',
      },
    ]);
    setInput('');

    // Save inquiry in cloud Contactoweb collection
    saveContactoWeb({
      nombre: user?.nombre || 'Visitante Chat Tienda',
      email: user?.correo || '',
      telefono: user?.telefono || '',
      asunto: 'Consulta Chat en Línea Tienda',
      mensaje: clean,
      origen: 'Chat Tienda Online',
    }).catch(() => {});

    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div
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
          style={{
            width: 'min(375px, calc(100vw - 32px))',
            height: 490,
            borderRadius: 28,
            background: '#FFFFFF',
            border: '1px solid rgba(26, 31, 54, 0.10)',
            boxShadow: '0 28px 68px rgba(15, 20, 40, 0.25)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Chat Header */}
          <div
            style={{
              padding: '16px 20px',
              background: C.navy,
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 12,
                  background: C.red,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <MessageSquare size={17} color="#FFFFFF" />
              </div>
              <div>
                <div
                  style={{
                    fontFamily: F.heading,
                    fontSize: 13,
                    fontWeight: 800,
                    color: '#FFFFFF',
                  }}
                >
                  Chat Tienda Jasman
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
                    }}
                  />
                  Asesor en línea · Respuesta inmediata
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
              }}
            >
              <X size={15} />
            </button>
          </div>

          {/* Messages Area */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px 16px 10px',
              background: '#F8FAFC',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            {messages.map((m) => (
              <div
                key={m.id}
                style={{
                  alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  padding: '11px 14px',
                  borderRadius:
                    m.role === 'user'
                      ? '18px 18px 4px 18px'
                      : '18px 18px 18px 4px',
                  background: m.role === 'user' ? C.red : '#FFFFFF',
                  color: m.role === 'user' ? '#FFFFFF' : C.navy,
                  border:
                    m.role === 'user'
                      ? 'none'
                      : '1px solid rgba(26, 31, 54, 0.08)',
                  boxShadow: '0 4px 12px rgba(26, 31, 54, 0.04)',
                  fontSize: 12.5,
                  lineHeight: 1.5,
                  whiteSpace: 'pre-line',
                }}
              >
                {m.text}
              </div>
            ))}

            {/* Quick Prompt Chips */}
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
                  onClick={() => sendMessage(prompt)}
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

            {savedNotice && (
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
                <Check size={12} /> Mensaje recibido por atención al cliente
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <form
            onSubmit={handleSubmit}
            style={{
              padding: '12px 14px',
              background: '#FFFFFF',
              borderTop: '1px solid rgba(26, 31, 54, 0.08)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe tu duda o medida (ej. 205/55R16)..."
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: 9999,
                border: '1px solid rgba(26, 31, 54, 0.12)',
                background: '#F8FAFC',
                fontFamily: F.body,
                fontSize: 12.5,
                color: C.navy,
                outline: 'none',
              }}
            />
            <button
              type="submit"
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
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
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
            }}
          >
            <MessageSquare size={14} color="#FFFFFF" />
          </span>
          <span>Chat Tienda</span>
          <Sparkles size={13} color="#FCA5A5" />
        </button>
      )}
    </div>
  );
}

