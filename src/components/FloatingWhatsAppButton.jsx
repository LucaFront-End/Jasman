import { useLocation } from 'react-router-dom';
import { F } from '../hooks/useAnimations';

export default function FloatingWhatsAppButton() {
  const { pathname } = useLocation();
  const isFlotillas = pathname.startsWith('/flotillas');
  const phone = isFlotillas ? '5215545990295' : '5215510024945';
  const defaultMsg = isFlotillas
    ? 'SW - Hola, me interesa el servicio de flotillas de Jasman.'
    : 'SW - Hola Jasman, me gustaría recibir atención de un asesor.';
  const whatsappUrl = `https://api.whatsapp.com/send/?phone=${phone}&text=${encodeURIComponent(
    defaultMsg
  )}`;

  return (
    <>
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Atención por WhatsApp Jasman"
        className="jasman-floating-whatsapp"
        style={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          zIndex: 998,
          height: 48,
          padding: '0 18px 0 14px',
          borderRadius: 9999,
          background: 'linear-gradient(135deg, #25D366 0%, #1EBE5D 100%)',
          color: '#FFFFFF',
          border: '2px solid rgba(255, 255, 255, 0.28)',
          boxShadow:
            '0 12px 32px rgba(37, 211, 102, 0.38), 0 4px 12px rgba(0, 0, 0, 0.14)',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 9,
          textDecoration: 'none',
          fontFamily: F.heading,
          fontSize: 13,
          fontWeight: 800,
          letterSpacing: '0.03em',
          transition: 'all 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <span
          style={{
            width: 26,
            height: 26,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.22)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M20.52 3.48A11.86 11.86 0 0 0 12.06 0C5.5 0 .16 5.34.16 11.9c0 2.1.55 4.15 1.6 5.95L0 24l6.33-1.66a11.88 11.88 0 0 0 5.73 1.46h.01c6.55 0 11.89-5.34 11.9-11.9 0-3.18-1.24-6.17-3.45-8.42ZM12.07 21.8h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.76.99 1-3.66-.24-.38a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.89 9.91-9.89 2.64 0 5.13 1.03 7 2.9a9.83 9.83 0 0 1 2.9 7c0 5.46-4.44 9.9-9.9 9.9Zm5.43-7.41c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.27.49 1.7.63.72.23 1.37.2 1.88.12.57-.09 1.76-.72 2.01-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35Z" />
          </svg>
        </span>
        <span className="jasman-floating-whatsapp-label">WhatsApp</span>
      </a>
      <style>{`
        .jasman-floating-whatsapp:hover {
          background: linear-gradient(135deg, #20BD5A 0%, #16A34A 100%) !important;
          color: #FFFFFF !important;
          transform: translateY(-3px) scale(1.03);
          box-shadow: 0 16px 38px rgba(37, 211, 102, 0.5), 0 4px 14px rgba(0, 0, 0, 0.18) !important;
        }
        @media (max-width: 640px) {
          .jasman-floating-whatsapp {
            bottom: 14px !important;
            right: 14px !important;
            height: 42px !important;
            padding: 0 14px 0 10px !important;
            font-size: 12px !important;
            gap: 7px !important;
          }
        }
      `}</style>
    </>
  );
}
