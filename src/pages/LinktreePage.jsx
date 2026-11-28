import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  DEFAULT_LINKTREE_ITEMS,
  getWixLinktreeLinks,
  readCachedLinktreeLinks,
} from '../services/wixService';
import { F } from '../hooks/useAnimations';

/* ─── Crisp Custom Vector Icons (used when `vectores` is not uploaded in Wix CMS) ─── */
function FallbackVectorIcon({ iconKey, size = 22 }) {
  switch (iconKey) {
    case 'whatsapp':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M20.52 3.48A11.82 11.82 0 0 0 12.06 0C5.52 0 .2 5.31.2 11.85c0 2.09.55 4.13 1.59 5.93L0 24l6.39-1.68a11.84 11.84 0 0 0 5.67 1.45h.01c6.54 0 11.86-5.32 11.86-11.86 0-3.17-1.23-6.15-3.41-8.43ZM12.07 21.77h-.01a9.86 9.86 0 0 1-5.03-1.38l-.36-.21-3.79 1 1.01-3.69-.24-.38a9.84 9.84 0 0 1-1.51-5.26C2.14 6.42 6.6 1.97 12.07 1.97c2.64 0 5.13 1.03 7 2.9a9.83 9.83 0 0 1 2.9 7c0 5.46-4.45 9.9-9.9 9.9Zm5.43-7.42c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35Z"
            fill="currentColor"
          />
        </svg>
      );
    case 'store':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="9.5" />
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2.5v5.5M12 16v5.5M2.5 12H8M16 12h5.5M5.3 5.3l3.9 3.9M14.8 14.8l3.9 3.9M18.7 5.3l-3.9 3.9M9.2 14.8l-3.9 3.9" />
        </svg>
      );
    case 'promo':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82Z" />
          <circle cx="7.5" cy="7.5" r="1.5" fill="currentColor" stroke="none" />
          <path d="M9.5 14.5l5-5" />
        </svg>
      );
    case 'location':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M20 10c0 5.5-8 12-8 12S4 15.5 4 10a8 8 0 1 1 16 0Z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      );
    case 'services':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.77Z" />
        </svg>
      );
    case 'fleet':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M10 17h4V5H2v12h3M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5v8h1" />
          <circle cx="7.5" cy="17.5" r="2.5" />
          <circle cx="17.5" cy="17.5" r="2.5" />
        </svg>
      );
    case 'instagram':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
        </svg>
      );
    case 'facebook':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
        </svg>
      );
    case 'tiktok':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
        </svg>
      );
    case 'youtube':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="2" y="5" width="20" height="14" rx="4" />
          <polygon points="10 9 15 12 10 15 10 9" fill="currentColor" stroke="none" />
        </svg>
      );
    case 'phone':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.58 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
      );
    case 'jobs':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
      );
    default:
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M7 17L17 7M9 7h8v8" />
        </svg>
      );
  }
}

function getAccentPalette(iconKey) {
  if (iconKey === 'whatsapp') {
    return {
      iconBg: 'rgba(37, 211, 102, 0.14)',
      iconBorder: 'rgba(37, 211, 102, 0.36)',
      iconColor: '#2EE573',
      hoverBorder: 'rgba(37, 211, 102, 0.65)',
    };
  }
  if (iconKey === 'promo' || iconKey === 'store') {
    return {
      iconBg: 'rgba(196, 30, 36, 0.16)',
      iconBorder: 'rgba(232, 53, 59, 0.36)',
      iconColor: '#FF5A60',
      hoverBorder: 'rgba(232, 53, 59, 0.65)',
    };
  }
  return {
    iconBg: 'rgba(255, 255, 255, 0.08)',
    iconBorder: 'rgba(255, 255, 255, 0.18)',
    iconColor: '#FFFFFF',
    hoverBorder: 'rgba(255, 255, 255, 0.6)',
  };
}

function toAbsoluteUrl(href) {
  if (!href) return 'https://www.jasman.com.mx';
  if (/^(https?:\/\/|mailto:|tel:)/i.test(href)) return href;
  const origin =
    typeof window !== 'undefined' && window.location?.origin
      ? window.location.origin
      : 'https://www.jasman.com.mx';
  return `${origin}${href.startsWith('/') ? '' : '/'}${href}`;
}

function LinkCardVector({ item }) {
  const [imgFailed, setImgFailed] = useState(false);
  const palette = getAccentPalette(item.iconKey);
  const showCmsVector = Boolean(item.vectorUrl && !imgFailed);

  return (
    <div
      style={{
        width: 46,
        height: 46,
        borderRadius: 14,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: showCmsVector ? 'rgba(255, 255, 255, 0.09)' : palette.iconBg,
        border: `1px solid ${showCmsVector ? 'rgba(255, 255, 255, 0.2)' : palette.iconBorder}`,
        color: palette.iconColor,
        overflow: 'hidden',
        transition: 'transform 0.22s ease, border-color 0.22s ease',
      }}
    >
      {showCmsVector ? (
        <img
          src={item.vectorUrl}
          alt=""
          loading="lazy"
          onError={() => setImgFailed(true)}
          style={{
            width: 26,
            height: 26,
            objectFit: 'contain',
            display: 'block',
          }}
        />
      ) : (
        <FallbackVectorIcon iconKey={item.iconKey} size={22} />
      )}
    </div>
  );
}

export default function LinktreePage() {
  const [links, setLinks] = useState(() => readCachedLinktreeLinks() || []);
  const [loading, setLoading] = useState(() => !readCachedLinktreeLinks());
  const [hoveredId, setHoveredId] = useState(null);
  const [shareTarget, setShareTarget] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    let active = true;
    getWixLinktreeLinks()
      .then((items) => {
        if (!active) return;
        setLinks(items && items.length > 0 ? items : DEFAULT_LINKTREE_ITEMS);
        setLoading(false);
      })
      .catch(() => {
        if (!active) return;
        setLinks((prev) => (prev.length > 0 ? prev : DEFAULT_LINKTREE_ITEMS));
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    window.clearTimeout(window.__jasmanLinktreeToast);
    window.__jasmanLinktreeToast = window.setTimeout(() => {
      setToastMessage('');
    }, 2400);
  };

  const copyUrl = async (url, label = 'Enlace copiado') => {
    try {
      await navigator.clipboard.writeText(url);
      showToast(`✓ ${label}`);
    } catch {
      showToast(url);
    }
  };

  const handleNativeShare = async ({ title, text, url }) => {
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch {
        // user cancelled or share unsupported for URL
      }
    }
    await copyUrl(url, 'Enlace copiado al portapapeles');
  };

  const pageSharePayload = {
    title: 'Jasman Automotriz · Enlaces Oficiales',
    text: 'Tienda Online de Llantas, Promociones, Sucursales, Servicios Automotrices y WhatsApp Jasman.',
    url:
      typeof window !== 'undefined' && window.location?.href
        ? window.location.href
        : 'https://www.jasman.com.mx/linktree',
  };

  const socialHeaderItems = [
    {
      key: 'web',
      label: 'Sitio Web Oficial',
      href: '/',
      isExternal: false,
      svg: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      ),
    },
    {
      key: 'facebook',
      label: 'Facebook Jasman',
      href: 'https://www.facebook.com/jasmanautof',
      isExternal: true,
      svg: <FallbackVectorIcon iconKey="facebook" size={20} />,
    },
    {
      key: 'whatsapp',
      label: 'WhatsApp Directo',
      href: 'https://wa.link/t5jc7v',
      isExternal: true,
      svg: <FallbackVectorIcon iconKey="whatsapp" size={20} />,
    },
    {
      key: 'phone',
      label: 'Llamar 800 8010 290',
      href: 'tel:8008010290',
      isExternal: true,
      svg: <FallbackVectorIcon iconKey="phone" size={19} />,
    },
  ];

  const activeItems = links.length > 0 ? links : DEFAULT_LINKTREE_ITEMS;

  return (
    <div
      style={{
        minHeight: '100dvh',
        width: '100%',
        background:
          'radial-gradient(640px circle at 50% -60px, rgba(196, 30, 36, 0.18), transparent 65%), radial-gradient(560px circle at 85% 20%, rgba(42, 48, 80, 0.35), transparent 70%), #090E16',
        color: '#FFFFFF',
        fontFamily: F.body,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '22px 16px 42px',
        boxSizing: 'border-box',
        position: 'relative',
        overflowX: 'hidden',
      }}
    >
      {/* Main centered Linktree container */}
      <div
        style={{
          width: '100%',
          maxWidth: 560,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          flex: 1,
        }}
      >
        {/* Top bar with Linktree-style ••• share action */}
        <div
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'flex-end',
            marginBottom: 6,
          }}
        >
          <button
            type="button"
            onClick={() =>
              setShareTarget({
                title: 'Jasman Automotriz',
                excerpt: 'Comparte todos nuestros enlaces oficiales.',
                href: pageSharePayload.url,
                iconKey: 'link',
                vectorUrl: '',
              })
            }
            aria-label="Compartir página de enlaces"
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.07)',
              border: '1px solid rgba(255, 255, 255, 0.14)',
              color: '#FFFFFF',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              backdropFilter: 'blur(10px)',
              transition: 'background 0.2s ease, transform 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.14)';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.07)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <circle cx="5" cy="12" r="2" />
              <circle cx="12" cy="12" r="2" />
              <circle cx="19" cy="12" r="2" />
            </svg>
          </button>
        </div>

        {/* Circular Avatar Badge */}
        <div
          style={{
            width: 96,
            height: 96,
            borderRadius: '50%',
            background: '#FFFFFF',
            padding: 18,
            boxSizing: 'border-box',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow:
              '0 14px 36px rgba(0, 0, 0, 0.5), 0 0 0 3px rgba(255, 255, 255, 0.14), 0 0 30px rgba(196, 30, 36, 0.28)',
            marginBottom: 16,
          }}
        >
          <img
            src="/favicon.png"
            alt="Jasman Automotriz"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              display: 'block',
            }}
          />
        </div>

        {/* Profile Title & Subtitle */}
        <h1
          style={{
            fontFamily: F.heading,
            fontWeight: 800,
            fontSize: 'clamp(21px, 5vw, 25px)',
            letterSpacing: '-0.02em',
            color: '#FFFFFF',
            margin: 0,
            textAlign: 'center',
            lineHeight: 1.2,
          }}
        >
          Jasman Automotriz
        </h1>

        <p
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: 'rgba(255, 255, 255, 0.78)',
            margin: '6px 0 0',
            textAlign: 'center',
            maxWidth: 420,
            lineHeight: 1.45,
          }}
        >
          Cuidamos tu auto, cuidamos de ti · +80 sucursales en México
        </p>

        {/* Quick Social / Direct Contact Icon Row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 16,
            marginTop: 18,
            marginBottom: 26,
          }}
        >
          {socialHeaderItems.map((s) => {
            const commonProps = {
              'aria-label': s.label,
              title: s.label,
              style: {
                width: 40,
                height: 40,
                borderRadius: 12,
                color: 'rgba(255, 255, 255, 0.88)',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                textDecoration: 'none',
                transition: 'transform 0.2s ease, color 0.2s ease, border-color 0.2s ease, background 0.2s ease',
              },
              onMouseEnter: (e) => {
                e.currentTarget.style.transform = 'translateY(-2px) scale(1.06)';
                e.currentTarget.style.color = '#FFFFFF';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.42)';
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              },
              onMouseLeave: (e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.88)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
              },
            };

            return s.isExternal ? (
              <a
                key={s.key}
                href={s.href}
                target={s.href.startsWith('tel:') ? undefined : '_blank'}
                rel={s.href.startsWith('tel:') ? undefined : 'noopener noreferrer'}
                {...commonProps}
              >
                {s.svg}
              </a>
            ) : (
              <Link key={s.key} to={s.href} {...commonProps}>
                {s.svg}
              </Link>
            );
          })}
        </div>

        {/* Linktree CMS Option Cards */}
        <div
          style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
          }}
        >
          {loading
            ? Array.from({ length: 5 }).map((_, idx) => (
                <div
                  key={`skeleton-${idx}`}
                  style={{
                    width: '100%',
                    height: 76,
                    borderRadius: 28,
                    border: '1px solid rgba(255, 255, 255, 0.14)',
                    background: 'rgba(255, 255, 255, 0.04)',
                    boxSizing: 'border-box',
                  }}
                />
              ))
            : activeItems.map((item) => {
                const isHovered = hoveredId === item.id;
                const palette = getAccentPalette(item.iconKey);

                const cardInner = (
                  <>
                    <LinkCardVector item={item} />

                    <div
                      style={{
                        flex: 1,
                        minWidth: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        textAlign: 'left',
                        paddingRight: 34,
                      }}
                    >
                      <span
                        style={{
                          fontFamily: F.heading,
                          fontWeight: 800,
                          fontSize: 15.5,
                          color: '#FFFFFF',
                          lineHeight: 1.25,
                          letterSpacing: '-0.01em',
                        }}
                      >
                        {item.title}
                      </span>
                      {item.excerpt && (
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 400,
                            color: 'rgba(255, 255, 255, 0.7)',
                            marginTop: 3,
                            lineHeight: 1.35,
                          }}
                        >
                          {item.excerpt}
                        </span>
                      )}
                    </div>
                  </>
                );

                const cardStyle = {
                  width: '100%',
                  minHeight: 74,
                  padding: '13px 16px',
                  borderRadius: 28,
                  background: isHovered
                    ? 'rgba(255, 255, 255, 0.075)'
                    : 'rgba(255, 255, 255, 0.03)',
                  border: `1.2px solid ${
                    isHovered ? palette.hoverBorder : 'rgba(255, 255, 255, 0.34)'
                  }`,
                  boxShadow: isHovered
                    ? '0 12px 28px rgba(0, 0, 0, 0.38)'
                    : '0 4px 16px rgba(0, 0, 0, 0.2)',
                  backdropFilter: 'blur(12px)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  textDecoration: 'none',
                  color: '#FFFFFF',
                  boxSizing: 'border-box',
                  transform: isHovered ? 'translateY(-2px) scale(1.008)' : 'translateY(0) scale(1)',
                  transition:
                    'transform 0.22s cubic-bezier(0.16, 1, 0.3, 1), background 0.22s ease, border-color 0.22s ease, box-shadow 0.22s ease',
                };

                return (
                  <div
                    key={item.id}
                    style={{ position: 'relative', width: '100%' }}
                    onMouseEnter={() => setHoveredId(item.id)}
                    onMouseLeave={() => setHoveredId((prev) => (prev === item.id ? null : prev))}
                  >
                    {item.isExternal ? (
                      <a
                        href={item.href}
                        target={item.href.startsWith('tel:') || item.href.startsWith('mailto:') ? undefined : '_blank'}
                        rel={item.href.startsWith('tel:') || item.href.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
                        style={cardStyle}
                      >
                        {cardInner}
                      </a>
                    ) : (
                      <Link to={item.href} style={cardStyle}>
                        {cardInner}
                      </Link>
                    )}

                    {/* Right-hand ⋮ three-dots button (matches Linktree screenshot) */}
                    <button
                      type="button"
                      aria-label={`Opciones de enlace ${item.title}`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setShareTarget(item);
                      }}
                      style={{
                        position: 'absolute',
                        right: 12,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: 34,
                        height: 34,
                        borderRadius: '50%',
                        border: 'none',
                        background: 'transparent',
                        color: 'rgba(255, 255, 255, 0.55)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'background 0.18s ease, color 0.18s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                        e.currentTarget.style.color = '#FFFFFF';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = 'rgba(255, 255, 255, 0.55)';
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <circle cx="12" cy="5" r="1.9" />
                        <circle cx="12" cy="12" r="1.9" />
                        <circle cx="12" cy="19" r="1.9" />
                      </svg>
                    </button>
                  </div>
                );
              })}
        </div>

        {/* Minimal Linktree-style Brand Footer */}
        <div
          style={{
            marginTop: 'auto',
            paddingTop: 38,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 16px',
              borderRadius: 9999,
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              textDecoration: 'none',
              color: 'rgba(255, 255, 255, 0.78)',
              fontSize: 12.5,
              fontWeight: 600,
              transition: 'background 0.2s ease, color 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.color = '#FFFFFF';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.color = 'rgba(255, 255, 255, 0.78)';
            }}
          >
            <img
              src="/images/logo/logo-clean-white.png"
              alt="Jasman"
              style={{ height: 15, width: 'auto', display: 'block', opacity: 0.92 }}
            />
            <span style={{ opacity: 0.45 }}>·</span>
            <span>jasman.com.mx</span>
          </Link>
        </div>
      </div>

      {/* Share Sheet Modal for page or individual link */}
      {shareTarget && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setShareTarget(null)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(0, 0, 0, 0.68)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
            boxSizing: 'border-box',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 400,
              borderRadius: 24,
              background: '#121826',
              border: '1px solid rgba(255, 255, 255, 0.16)',
              padding: '22px 20px',
              boxShadow: '0 24px 60px rgba(0, 0, 0, 0.6)',
              color: '#FFFFFF',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 16,
              }}
            >
              <span
                style={{
                  fontFamily: F.heading,
                  fontWeight: 800,
                  fontSize: 15,
                  color: '#FFFFFF',
                }}
              >
                Compartir enlace
              </span>
              <button
                type="button"
                onClick={() => setShareTarget(null)}
                aria-label="Cerrar"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  border: 'none',
                  background: 'rgba(255, 255, 255, 0.08)',
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  fontSize: 16,
                  lineHeight: 1,
                }}
              >
                ✕
              </button>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 14px',
                borderRadius: 16,
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                marginBottom: 16,
              }}
            >
              <LinkCardVector item={shareTarget} />
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontFamily: F.heading, fontWeight: 700, fontSize: 14.5 }}>
                  {shareTarget.title}
                </div>
                {shareTarget.excerpt && (
                  <div
                    style={{
                      fontSize: 12.5,
                      color: 'rgba(255, 255, 255, 0.65)',
                      marginTop: 2,
                    }}
                  >
                    {shareTarget.excerpt}
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                type="button"
                onClick={() => {
                  copyUrl(toAbsoluteUrl(shareTarget.href), 'Enlace copiado');
                  setShareTarget(null);
                }}
                style={{
                  width: '100%',
                  padding: '13px 16px',
                  borderRadius: 14,
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  background: 'rgba(255, 255, 255, 0.08)',
                  color: '#FFFFFF',
                  fontFamily: F.heading,
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: 'pointer',
                }}
              >
                Copiar enlace
              </button>

              <button
                type="button"
                onClick={() => {
                  const target = shareTarget;
                  setShareTarget(null);
                  handleNativeShare({
                    title: `${target.title} · Jasman Automotriz`,
                    text: target.excerpt || target.title,
                    url: toAbsoluteUrl(target.href),
                  });
                }}
                style={{
                  width: '100%',
                  padding: '13px 16px',
                  borderRadius: 14,
                  border: 'none',
                  background: '#C41E24',
                  color: '#FFFFFF',
                  fontFamily: F.heading,
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: 'pointer',
                }}
              >
                Compartir…
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Feedback */}
      {toastMessage && (
        <div
          role="status"
          style={{
            position: 'fixed',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10000,
            background: '#FFFFFF',
            color: '#090E16',
            fontFamily: F.heading,
            fontWeight: 700,
            fontSize: 13,
            padding: '10px 18px',
            borderRadius: 9999,
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.45)',
            whiteSpace: 'nowrap',
          }}
        >
          {toastMessage}
        </div>
      )}
    </div>
  );
}
