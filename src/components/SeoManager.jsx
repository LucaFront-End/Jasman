import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { resolveSeoForLocation } from '../data/seoMetadata';

function upsertHeadTag(selector, createEl, attrName, value) {
  if (typeof document === 'undefined' || !value) return;
  let el = document.head.querySelector(selector);
  if (!el) {
    el = createEl();
    document.head.appendChild(el);
  }
  el.setAttribute(attrName, value);
}

export default function SeoManager() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
    const seo = resolveSeoForLocation({ pathname, search, hostname });
    if (!seo) return;

    if (seo.title) {
      document.title = seo.title;
      upsertHeadTag(
        'meta[property="og:title"]',
        () => {
          const m = document.createElement('meta');
          m.setAttribute('property', 'og:title');
          return m;
        },
        'content',
        seo.title
      );
    }

    if (seo.description) {
      upsertHeadTag(
        'meta[name="description"]',
        () => {
          const m = document.createElement('meta');
          m.setAttribute('name', 'description');
          return m;
        },
        'content',
        seo.description
      );
      upsertHeadTag(
        'meta[property="og:description"]',
        () => {
          const m = document.createElement('meta');
          m.setAttribute('property', 'og:description');
          return m;
        },
        'content',
        seo.description
      );
    }

    if (seo.canonicalUrl) {
      upsertHeadTag(
        'link[rel="canonical"]',
        () => {
          const l = document.createElement('link');
          l.setAttribute('rel', 'canonical');
          return l;
        },
        'href',
        seo.canonicalUrl
      );
      upsertHeadTag(
        'meta[property="og:url"]',
        () => {
          const m = document.createElement('meta');
          m.setAttribute('property', 'og:url');
          return m;
        },
        'content',
        seo.canonicalUrl
      );
    }
  }, [pathname, search]);

  return null;
}
