import { useMemo, useEffect } from 'react';
import { useLocation, useParams, Link } from 'react-router-dom';
import {
  ShieldCheck,
  FileText,
  RefreshCw,
  Truck,
  ChevronRight,
  Clock,
  Printer,
  MessageCircle,
  Phone,
  Mail,
} from 'lucide-react';
import { useLegalCMS } from '../hooks/useLegalCMS';
import { LEGAL_POLICIES_CONFIG, DEFAULT_LEGAL_SUBTITLE } from '../data/legalPoliciesData';
import './LegalPage.css';

const PATH_OR_SLUG_MAP = {
  // Privacy
  '/aviso-de-privacidad': 'privacy',
  '/politica-de-privacidad': 'privacy',
  '/privacidad': 'privacy',
  '/avisodeprivacidad': 'privacy',
  '/politicas': 'privacy',
  privacidad: 'privacy',
  'aviso-de-privacidad': 'privacy',
  'politica-de-privacidad': 'privacy',
  avisodeprivacidad: 'privacy',
  privacy: 'privacy',

  // Terms
  '/terminos-y-condiciones': 'terms',
  '/terminos': 'terms',
  '/terminosycondiciones': 'terms',
  '/terminosycondciones': 'terms',
  '/términosycondciones': 'terms',
  terminos: 'terms',
  'terminos-y-condiciones': 'terms',
  terminosycondiciones: 'terms',
  terminosycondciones: 'terms',
  terms: 'terms',

  // Refund & Warranty
  '/politica-de-reembolso': 'refund',
  '/politica-de-reembolsos': 'refund',
  '/politica-de-devoluciones': 'refund',
  '/reembolsos': 'refund',
  '/devoluciones': 'refund',
  '/garantias': 'refund',
  reembolso: 'refund',
  reembolsos: 'refund',
  devoluciones: 'refund',
  garantias: 'refund',
  'politica-de-reembolso': 'refund',
  'politica-de-reembolsos': 'refund',
  'politica-de-devoluciones': 'refund',
  refund: 'refund',

  // Shipping
  '/politica-de-envios': 'shipping',
  '/politica-de-envio': 'shipping',
  '/envios': 'shipping',
  envios: 'shipping',
  'politica-de-envios': 'shipping',
  'politica-de-envio': 'shipping',
  shipping: 'shipping',
};

function PolicyTabIcon({ policyKey }) {
  switch (policyKey) {
    case 'privacy':
      return <ShieldCheck size={16} strokeWidth={2.1} />;
    case 'terms':
      return <FileText size={16} strokeWidth={2.1} />;
    case 'refund':
      return <RefreshCw size={16} strokeWidth={2.1} />;
    case 'shipping':
      return <Truck size={16} strokeWidth={2.1} />;
    default:
      return <FileText size={16} strokeWidth={2.1} />;
  }
}

export default function LegalPage({ policyKey: propPolicyKey }) {
  const location = useLocation();
  const { slug } = useParams();

  const activeKey = useMemo(() => {
    if (propPolicyKey && LEGAL_POLICIES_CONFIG[propPolicyKey]) {
      return propPolicyKey;
    }
    const decodedPath = decodeURIComponent(location.pathname || '')
      .toLowerCase()
      .replace(/\/+$/, '');
    if (PATH_OR_SLUG_MAP[decodedPath]) {
      return PATH_OR_SLUG_MAP[decodedPath];
    }
    if (slug) {
      const cleanSlug = decodeURIComponent(slug).toLowerCase().trim();
      if (PATH_OR_SLUG_MAP[cleanSlug]) {
        return PATH_OR_SLUG_MAP[cleanSlug];
      }
    }
    return 'privacy';
  }, [propPolicyKey, location.pathname, slug]);

  const {
    config,
    content,
    title,
    subtitle,
    tag,
    lastUpdated,
    loading,
    error,
    allPolicies,
    isCMSLive,
  } = useLegalCMS(activeKey);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeKey]);

  const formattedDate = useMemo(() => {
    if (!lastUpdated) return 'Noviembre de 2026';
    try {
      const d = new Date(lastUpdated);
      if (Number.isNaN(d.getTime())) return 'Noviembre de 2026';
      return d.toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return 'Noviembre de 2026';
    }
  }, [lastUpdated]);

  const handlePrint = () => {
    window.print();
  };

  const jsonLdSchema = useMemo(
    () => ({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: config.metaTitle,
      description: config.metaDesc,
      url: `https://www.jasman.com.mx${config.path}`,
      publisher: {
        '@type': 'Organization',
        name: 'Jasman Automotriz',
        url: 'https://www.jasman.com.mx',
      },
      breadcrumb: {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Inicio',
            item: 'https://www.jasman.com.mx',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Legal y Políticas',
            item: 'https://www.jasman.com.mx/aviso-de-privacidad',
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: config.label,
            item: `https://www.jasman.com.mx${config.path}`,
          },
        ],
      },
    }),
    [config]
  );

  const waSupportUrl = `https://api.whatsapp.com/send/?phone=5215510024945&text=${encodeURIComponent(
    `SW - Hola Jasman, tengo una consulta sobre "${config.label}".`
  )}`;

  return (
    <div className="jasman-legal-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchema) }}
      />

      {/* Corporate Navy Hero Header */}
      <header className="jasman-legal-hero">
        <div className="jasman-legal-hero-glow" aria-hidden="true" />
        <div className="jasman-legal-hero-ring" aria-hidden="true" />

        <div className="jasman-legal-hero-inner">
          <nav className="jasman-legal-breadcrumbs" aria-label="Ruta de navegación">
            <Link to="/" className="jasman-legal-bc-link">
              Inicio
            </Link>
            <ChevronRight size={13} className="jasman-legal-bc-sep" />
            <span className="jasman-legal-bc-muted">Legal y Políticas</span>
            <ChevronRight size={13} className="jasman-legal-bc-sep" />
            <span className="jasman-legal-bc-current">{config.label}</span>
          </nav>

          <span className="jasman-legal-tag">
            <span className="jasman-legal-tag-dot" />
            {tag || config.tag}
          </span>

          <h1 className="jasman-legal-title">{title || config.label}</h1>

          <p className="jasman-legal-subtitle">
            {subtitle || DEFAULT_LEGAL_SUBTITLE}
          </p>

          <div className="jasman-legal-meta-row">
            <div className="jasman-legal-updated">
              <Clock size={15} />
              <span>Última actualización: {formattedDate}</span>
              {isCMSLive && (
                <span className="jasman-legal-cms-badge">● CMS Sincronizado</span>
              )}
            </div>

            <div className="jasman-legal-actions">
              <button
                type="button"
                onClick={handlePrint}
                className="jasman-legal-print-btn"
                title="Imprimir o guardar documento como PDF"
              >
                <Printer size={15} />
                <span>Imprimir / PDF</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Sticky Policy Switcher Bar */}
      <nav
        className="jasman-legal-tabs-wrapper"
        aria-label="Políticas oficiales de Jasman Automotriz"
      >
        <div className="jasman-legal-tabs-inner">
          {allPolicies.map((pol) => {
            const isActive = pol.key === activeKey;
            return (
              <Link
                key={pol.key}
                to={pol.path}
                className={`jasman-legal-tab-btn ${isActive ? 'active' : ''}`}
                aria-current={isActive ? 'page' : undefined}
              >
                <PolicyTabIcon policyKey={pol.key} />
                <span>{pol.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Legal Document Body */}
      <section className="jasman-legal-content-wrap">
        <article className="jasman-legal-card">
          {loading && (
            <div className="jasman-legal-skeleton">
              <div className="jasman-legal-sk-line jasman-legal-sk-heading" />
              <div className="jasman-legal-sk-line" style={{ width: '92%' }} />
              <div className="jasman-legal-sk-line" style={{ width: '96%' }} />
              <div className="jasman-legal-sk-line" style={{ width: '81%' }} />
              <div
                className="jasman-legal-sk-line"
                style={{ width: '88%', marginTop: 22 }}
              />
              <div className="jasman-legal-sk-line" style={{ width: '94%' }} />
              <div className="jasman-legal-sk-line" style={{ width: '70%' }} />
            </div>
          )}

          {!loading && error && (
            <div className="jasman-legal-error">
              <h3>No se pudo cargar la política solicitada</h3>
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && content && (
            <div
              className="jasman-legal-prose"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          )}

          {/* Customer Support Box */}
          <div className="jasman-legal-support">
            <div className="jasman-legal-support-info">
              <h4>¿Tienes alguna duda sobre nuestras políticas, garantías o tu pedido?</h4>
              <p>
                Nuestro equipo de atención a clientes de Jasman Automotriz está listo para orientarte en todo México.
              </p>
            </div>

            <div className="jasman-legal-support-actions">
              <a
                href={waSupportUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="jasman-legal-support-btn whatsapp"
              >
                <MessageCircle size={16} />
                <span>WhatsApp · 55 1002 4945</span>
              </a>

              <a
                href="tel:8008010290"
                className="jasman-legal-support-btn secondary"
              >
                <Phone size={15} />
                <span>800 8010 290</span>
              </a>

              <a
                href="mailto:jasmanonline@jasman.com.mx"
                className="jasman-legal-support-btn primary"
              >
                <Mail size={15} />
                <span>jasmanonline@jasman.com.mx</span>
              </a>
            </div>
          </div>
        </article>
      </section>
    </div>
  );
}
