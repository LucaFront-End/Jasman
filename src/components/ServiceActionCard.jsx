import { Link } from 'react-router-dom';
import { C, F } from '../hooks/useAnimations';
import Icon from './Icon';
import {
  buildBranchServiceWhatsAppUrl,
  buildServiceWhatsAppUrl,
} from '../utils/whatsappLinks';
import {
  Clock,
  Check,
  MessageCircle,
  Navigation,
  ArrowRight,
} from 'lucide-react';

const BADGE_COLORS = {
  PREMIUM: { bg: C.red, color: '#FFFFFF' },
  POPULAR: { bg: C.amber, color: C.navy },
  ESENCIAL: { bg: '#22C55E', color: '#FFFFFF' },
};

/**
 * Reusable action card for Jasman workshop services and service packages.
 */
export default function ServiceActionCard({ service, branch = null, compact = false }) {
  const isPackage = Boolean(service?.badge);
  const detailHref = branch
    ? `/sucursales/${branch.id}/${service.slug}`
    : `/servicios/${service.slug}`;
  const whatsappHref = branch
    ? buildBranchServiceWhatsAppUrl(branch, service.title)
    : buildServiceWhatsAppUrl(service.title);
  const mapsHref = branch?.mapsUrl || null;
  const badgeStyle = isPackage ? BADGE_COLORS[service.badge] || BADGE_COLORS.ESENCIAL : null;
  const includesPreview = Array.isArray(service?.includes) ? service.includes : [];

  return (
    <article
      className="jasman-service-action-card"
      style={{
        background: '#FFFFFF',
        borderRadius: compact ? 18 : 22,
        border: '1px solid rgba(26, 31, 54, 0.08)',
        boxShadow: '0 8px 26px rgba(26, 31, 54, 0.045)',
        padding: compact ? '18px 18px 16px' : '22px 22px 18px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: 14,
        position: 'relative',
        overflow: 'hidden',
        transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
      }}
    >
      <div>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 12,
            marginBottom: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
            <div
              style={{
                width: compact ? 40 : 44,
                height: compact ? 40 : 44,
                borderRadius: 13,
                flexShrink: 0,
                background: 'rgba(196, 30, 36, 0.08)',
                border: '1px solid rgba(196, 30, 36, 0.14)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon name={service.icon} size={compact ? 18 : 20} color={C.red} />
            </div>
            <div style={{ minWidth: 0 }}>
              <h3
                style={{
                  fontFamily: F.heading,
                  fontWeight: 800,
                  fontSize: compact ? 15 : 16,
                  color: C.navy,
                  lineHeight: 1.25,
                  margin: 0,
                }}
              >
                {service.title}
              </h3>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  marginTop: 4,
                  fontSize: 11.5,
                  fontWeight: 600,
                  color: C.gray,
                  fontFamily: F.body,
                }}
              >
                <span>{isPackage ? service.subtitle || 'Paquete' : service.category}</span>
                <span aria-hidden="true">•</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                  <Clock size={11} color={C.red} />
                  {service.time}
                </span>
              </div>
            </div>
          </div>

          {badgeStyle && (
            <span
              style={{
                padding: '4px 10px',
                borderRadius: 9999,
                background: badgeStyle.bg,
                color: badgeStyle.color,
                fontFamily: F.heading,
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: '0.06em',
                flexShrink: 0,
              }}
            >
              {service.badge}
            </span>
          )}
        </div>

        <p
          style={{
            fontSize: 13,
            color: '#475569',
            lineHeight: 1.55,
            margin: 0,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {service.description}
        </p>

        {isPackage && !compact && includesPreview.length > 0 && (
          <div
            style={{
              marginTop: 12,
              paddingTop: 10,
              borderTop: '1px solid rgba(26, 31, 54, 0.06)',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '4px 10px',
            }}
          >
            {includesPreview.slice(0, 4).map((inc, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 6,
                  fontSize: 11.5,
                  color: '#475569',
                  lineHeight: 1.35,
                }}
              >
                <Check size={11} color={C.red} strokeWidth={3} style={{ marginTop: 2, flexShrink: 0 }} />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {inc}
                </span>
              </div>
            ))}
            {includesPreview.length > 4 && (
              <div
                style={{
                  gridColumn: '1 / -1',
                  fontSize: 11,
                  fontWeight: 700,
                  color: C.red,
                  fontFamily: F.heading,
                  marginTop: 2,
                }}
              >
                +{includesPreview.length - 4} servicios más incluidos
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action buttons footer */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 8,
          paddingTop: 12,
          borderTop: '1px solid rgba(26, 31, 54, 0.06)',
        }}
      >
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            flex: branch ? '1 1 112px' : '1 1 130px',
            padding: '9px 12px',
            borderRadius: 11,
            background: '#25D366',
            color: '#FFFFFF',
            fontFamily: F.heading,
            fontWeight: 700,
            fontSize: 11.5,
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            boxShadow: '0 4px 14px rgba(37, 211, 102, 0.22)',
            whiteSpace: 'nowrap',
          }}
        >
          <MessageCircle size={13} />
          <span>WhatsApp</span>
        </a>

        {branch && mapsHref && (
          <a
            href={mapsHref}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              flex: '1 1 124px',
              padding: '9px 12px',
              borderRadius: 11,
              background: '#F1F5F9',
              border: '1px solid rgba(26, 31, 54, 0.12)',
              color: C.navy,
              fontFamily: F.heading,
              fontWeight: 700,
              fontSize: 11.5,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              whiteSpace: 'nowrap',
            }}
          >
            <Navigation size={13} color={C.red} />
            <span>Visitar sucursal</span>
          </a>
        )}

        <Link
          to={detailHref}
          className="jasman-service-detail-btn"
          style={{
            flex: branch ? '1 1 100%' : '1 1 140px',
            padding: '9px 14px',
            borderRadius: 11,
            background: C.navy,
            color: '#FFFFFF',
            fontFamily: F.heading,
            fontWeight: 700,
            fontSize: 12,
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            whiteSpace: 'nowrap',
            transition: 'background 0.2s ease',
          }}
        >
          <span>Ver más detalles</span>
          <ArrowRight size={13} />
        </Link>
      </div>
    </article>
  );
}
