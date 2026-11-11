/**
 * Servicio centralizado de envío de formularios y notificaciones web vía FormSubmit.co
 * - Plantilla 100% blanca (_template: 'basic')
 * - 100% en español
 * - Destinatarios oficiales: jasmanonline@jasman.com.mx y hola@dilodigitalmx.com
 */

export const FORMSUBMIT_RECIPIENTS = [
  'jasmanonline@jasman.com.mx',
  'hola@dilodigitalmx.com',
];

function formatMexicoDateTime(isoDate) {
  try {
    const dt = isoDate ? new Date(isoDate) : new Date();
    return dt.toLocaleString('es-MX', {
      timeZone: 'America/Mexico_City',
      dateStyle: 'long',
      timeStyle: 'short',
    });
  } catch {
    return new Date().toISOString();
  }
}

/**
 * Envía los datos de cualquier formulario de la web a los correos oficiales
 * mediante FormSubmit.co en español y con plantilla completamente blanca.
 *
 * @param {Object} params
 * @param {string} params.seccion - Nombre en español del formulario o sección
 * @param {string} [params.asuntoCorreo] - Asunto personalizado del correo
 * @param {string} [params.correoRespuesta] - Email del usuario para responder directamente (_replyto)
 * @param {Object} params.campos - Objeto ordenable con etiquetas 100% en español
 */
export async function sendFormSubmitEmail({
  seccion = 'Formulario Sitio Web',
  asuntoCorreo = '',
  correoRespuesta = '',
  campos = {},
} = {}) {
  const cleanFields = {};

  cleanFields['Formulario'] = seccion;

  for (const [labelEs, rawVal] of Object.entries(campos)) {
    if (rawVal === undefined || rawVal === null) continue;
    const strVal = String(rawVal).trim();
    if (!strVal) continue;
    cleanFields[labelEs] = strVal;
  }

  if (!cleanFields['Página']) {
    if (typeof window !== 'undefined' && window.location?.href) {
      cleanFields['Página'] = window.location.href;
    }
  }

  cleanFields['Fecha y Hora (México)'] = formatMexicoDateTime();

  const subjectLine =
    asuntoCorreo ||
    `Jasman Automotriz — ${seccion}${
      cleanFields['Nombre Completo'] ? ` (${cleanFields['Nombre Completo']})` : ''
    }`;

  const basePayload = {
    _subject: subjectLine,
    _template: 'basic', // Plantilla completamente blanca en FormSubmit.co
    _captcha: 'false',
    ...cleanFields,
  };

  const cleanReplyTo = String(correoRespuesta || '').trim();
  if (cleanReplyTo && cleanReplyTo.includes('@')) {
    basePayload._replyto = cleanReplyTo;
  }

  const results = await Promise.allSettled(
    FORMSUBMIT_RECIPIENTS.map(async (recipientEmail) => {
      const response = await fetch(
        `https://formsubmit.co/ajax/${encodeURIComponent(recipientEmail)}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify(basePayload),
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} al enviar a ${recipientEmail}`);
      }
      return response.json();
    })
  );

  return {
    ok: results.some((r) => r.status === 'fulfilled'),
    results,
  };
}

