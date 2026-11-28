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
import { DEFAULT_LEGAL_SUBTITLE } from '../data/legalPoliciesData';
import './LegalPage.css';

function upsertMeta(selector, createEl, attr, value) {
  if (typeof document === 'undefined' || !value) return;
  let el = document.head.querySelector(selector);
  if (!el) {
    el = createEl();
    document.head.appendChild(el);
  }
  el.setAttribute(attr, value);
}

function PolicyTabIcon({ coreKey }) {
  switch (coreKey) {
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

  const requestedIdentifier = useMemo(() => {
    if (slug) return slug;
    if (propPolicyKey) return propPolicyKey;
    const cleanPath = decodeURIComponent(location.pathname || '')
      .toLowerCase()
      .replace(/\/+$/, '');
    if (!cleanPath || cleanPath === '/politicas' || cleanPath === '/legal') {
      return 'privacy';
    }
    return cleanPath;
  }, [propPolicyKey, slug, location.pathname]);

  const {
    activePolicy,
    content,
    title,
    subtitle,
    tag,
    heroImage,
    heroImageAlt,
    lastUpdated,
    loading,
    error,
    allPolicies,
    isCMSLive,
  } = useLegalCMS(requestedIdentifier);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activePolicy?.slug]);

  // Dynamically sync <title>, meta description & canonical with live Wix CMS `politicas` edits
  useEffect(() => {
    if (!activePolicy || typeof document === 'undefined') return;
    const fullTitle = activePolicy.metaTitle || `${activePolicy.title} | JASMAN Automotriz`;
    const fullDesc = activePolicy.metaDesc || DEFAULT_LEGAL_SUBTITLE;
    const canonical = `https://www.jasman.com.mx${activePolicy.path}`;

    document.title = fullTitle;
    upsertMeta(
      'meta[name="description"]',
      () => {
        const m = document.createElement('meta');
        m.setAttribute('name', 'description');
        return m;
      },
      'content',
      fullDesc
    );
    upsertMeta(
      'meta[property="og:title"]',
      () => {
        const m = document.createElement('meta');
        m.setAttribute('property', 'og:title');
        return m;
      },
      'content',
      fullTitle
    );
    upsertMeta(
      'meta[property="og:description"]',
      () => {
        const m = document.createElement('meta');
        m.setAttribute('property', 'og:description');
        return m;
      },
      'content',
      fullDesc
    );
    upsertMeta(
      'link[rel="canonical"]',
      () => {
        const l = document.createElement('link');
        l.setAttribute('rel', 'canonical');
        return l;
      },
      'href',
      canonical
    );
  }, [activePolicy]);

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
      name: activePolicy?.metaTitle || title,
      description: activePolicy?.metaDesc || subtitle,
      url: `https://www.jasman.com.mx${activePolicy?.path || '/aviso-de-privacidad'}`,
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
            name: title,
            item: `https://www.jasman.com.mx${activePolicy?.path || '/aviso-de-privacidad'}`,
          },
        ],
      },
    }),
    [activePolicy, title, subtitle]
  );

  const waSupportUrl = `https://api.whatsapp.com/send/?phone=5215510024945&text=${encodeURIComponent(
    `SW - Hola Jasman, tengo una consulta sobre "${title}".`
  )}`;

  return (
    <div className="jasman-legal-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchema) }}
      />

      {/* Corporate Navy Hero Header */}
      <header className="jasman-legal-hero">
        {heroImage && (
          <img
            src={heroImage}
            alt={heroImageAlt}
            className="jasman-legal-hero-bg-img"
          />
        )}
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
            <span className="jasman-legal-bc-current">{title}</span>
          </nav>

          <span className="jasman-legal-tag">
            <span className="jasman-legal-tag-dot" />
            {tag}
          </span>

          <h1 className="jasman-legal-title">{title}</h1>

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

      {/* Sticky Policy Switcher Bar (100% dynamic from Wix CMS `politicas`) */}
      <nav
        className="jasman-legal-tabs-wrapper"
        aria-label="Políticas oficiales de Jasman Automotriz"
      >
        <div className="jasman-legal-tabs-inner">
          {allPolicies.map((pol) => {
            const isActive = pol.slug === activePolicy?.slug;
            return (
              <Link
                key={pol.id || pol.slug}
                to={pol.path}
                className={`jasman-legal-tab-btn ${isActive ? 'active' : ''}`}
                aria-current={isActive ? 'page' : undefined}
              >
                <PolicyTabIcon coreKey={pol.coreKey} />
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
