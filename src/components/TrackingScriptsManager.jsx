import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  DEFAULT_TRACKING_CONFIG,
  TRACKING_CONFIG_EVENT,
  fetchPublicTrackingConfig,
  getCachedTrackingConfig,
  normalizeTrackingConfig,
} from '../services/trackingService';

const SLOT_ATTR = 'data-jasman-tracking-slot';

function clearInjectedSlot(slotName) {
  if (typeof document === 'undefined') return;
  const existing = document.querySelectorAll(`[${SLOT_ATTR}="${slotName}"]`);
  existing.forEach((el) => el.remove());
}

function injectHtmlSlot(slotName, rawCode, container) {
  clearInjectedSlot(slotName);
  if (!container || typeof document === 'undefined') return;

  const trimmed = String(rawCode || '').trim();
  if (!trimmed) return;

  // Guard against bare JavaScript pasted without <script> tags
  const hasHtmlTags = /<\s*[a-zA-Z!/]/.test(trimmed);
  if (!hasHtmlTags) {
    const scriptEl = document.createElement('script');
    scriptEl.setAttribute(SLOT_ATTR, slotName);
    scriptEl.textContent = trimmed;
    container.appendChild(scriptEl);
    return;
  }

  const template = document.createElement('template');
  template.innerHTML = trimmed;
  const nodes = Array.from(template.content.childNodes);

  for (const node of nodes) {
    if (node.nodeType !== Node.ELEMENT_NODE) continue;

    if (node.tagName === 'SCRIPT') {
      const scriptEl = document.createElement('script');
      for (const attr of Array.from(node.attributes)) {
        scriptEl.setAttribute(attr.name, attr.value);
      }
      scriptEl.setAttribute(SLOT_ATTR, slotName);
      if (node.textContent) {
        scriptEl.textContent = node.textContent;
      }
      container.appendChild(scriptEl);
    } else {
      const cloned = node.cloneNode(true);
      if (typeof cloned.setAttribute === 'function') {
        cloned.setAttribute(SLOT_ATTR, slotName);
      }
      // Execute any nested <script> tags inside wrapper elements if present
      const nestedScripts =
        typeof cloned.querySelectorAll === 'function'
          ? Array.from(cloned.querySelectorAll('script'))
          : [];
      for (const oldScript of nestedScripts) {
        const freshScript = document.createElement('script');
        for (const attr of Array.from(oldScript.attributes)) {
          freshScript.setAttribute(attr.name, attr.value);
        }
        freshScript.textContent = oldScript.textContent || '';
        oldScript.replaceWith(freshScript);
      }
      container.appendChild(cloned);
    }
  }
}

function ensureMetaPixelRuntime(pixelId) {
  if (typeof window === 'undefined' || typeof document === 'undefined' || !pixelId) {
    return;
  }

  if (typeof window.fbq !== 'function') {
    (function (f, b, e, v, n, t, s) {
      if (f.fbq) return;
      n = f.fbq = function () {
        n.callMethod
          ? n.callMethod.apply(n, arguments)
          : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = true;
      n.version = '2.0';
      n.queue = [];
      t = b.createElement(e);
      t.async = true;
      t.src = v;
      t.setAttribute(SLOT_ATTR, 'meta-fbevents');
      s = b.getElementsByTagName(e)[0];
      if (s && s.parentNode) {
        s.parentNode.insertBefore(t, s);
      } else {
        b.head.appendChild(t);
      }
    })(
      window,
      document,
      'script',
      'https://connect.facebook.net/en_US/fbevents.js'
    );
  }

  if (!window._jasmanMetaInitializedIds) {
    window._jasmanMetaInitializedIds = new Set();
  }

  if (!window._jasmanMetaInitializedIds.has(pixelId)) {
    window.fbq('init', pixelId);
    window._jasmanMetaInitializedIds.add(pixelId);
  }

  clearInjectedSlot('meta-noscript');
  const noscript = document.createElement('noscript');
  noscript.setAttribute(SLOT_ATTR, 'meta-noscript');
  const img = document.createElement('img');
  img.height = 1;
  img.width = 1;
  img.style.display = 'none';
  img.alt = '';
  img.src = `https://www.facebook.com/tr?id=${encodeURIComponent(pixelId)}&ev=PageView&noscript=1`;
  noscript.appendChild(img);
  document.body.appendChild(noscript);
}

export default function TrackingScriptsManager() {
  const { pathname, search } = useLocation();
  const [config, setConfig] = useState(() => {
    const cached = getCachedTrackingConfig();
    return cached || { ...DEFAULT_TRACKING_CONFIG };
  });
  const lastTrackedPathRef = useRef('');

  useEffect(() => {
    let active = true;
    fetchPublicTrackingConfig().then((res) => {
      if (active && res?.config) {
        setConfig(normalizeTrackingConfig(res.config));
      }
    });

    const handleUpdated = (event) => {
      if (event?.detail) {
        setConfig(normalizeTrackingConfig(event.detail));
        lastTrackedPathRef.current = '';
      }
    };

    window.addEventListener(TRACKING_CONFIG_EVENT, handleUpdated);
    return () => {
      active = false;
      window.removeEventListener(TRACKING_CONFIG_EVENT, handleUpdated);
    };
  }, []);

  // Inject Meta Pixel + Meta extra snippet + Custom Head & Body snippets when config changes
  useEffect(() => {
    if (typeof document === 'undefined') return undefined;

    if (config.metaEnabled && config.metaPixelId) {
      ensureMetaPixelRuntime(config.metaPixelId);
    } else {
      clearInjectedSlot('meta-noscript');
    }

    if (config.metaEnabled && config.metaCustomCode) {
      injectHtmlSlot('meta-custom', config.metaCustomCode, document.head);
    } else {
      clearInjectedSlot('meta-custom');
    }

    if (config.customEnabled && config.customHeadCode) {
      injectHtmlSlot('custom-head', config.customHeadCode, document.head);
    } else {
      clearInjectedSlot('custom-head');
    }

    if (config.customEnabled && config.customBodyCode) {
      injectHtmlSlot('custom-body', config.customBodyCode, document.body);
    } else {
      clearInjectedSlot('custom-body');
    }

    return undefined;
  }, [config]);

  // Trigger Meta Pixel PageView on initial mount and SPA route changes
  useEffect(() => {
    if (!config.metaEnabled || !config.metaPixelId) return;
    if (typeof window === 'undefined' || typeof window.fbq !== 'function') return;

    const currentRouteKey = `${config.metaPixelId}::${pathname}${search}`;
    if (lastTrackedPathRef.current === currentRouteKey) return;

    lastTrackedPathRef.current = currentRouteKey;
    window.fbq('track', 'PageView');
  }, [config.metaEnabled, config.metaPixelId, pathname, search]);

  return null;
}

