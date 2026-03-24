import { useState, useEffect, useRef, useCallback } from 'react';

/* ═══ SAFE scroll reveal: content ALWAYS visible, animation is purely decorative ═══ */
export function useReveal(direction = 'up') {
  const ref = useRef(null);
  const [triggered, setTriggered] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setTriggered(true); obs.unobserve(el); } },
      { threshold: 0.12, rootMargin: '0px 0px -30px 0px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Animation style - purely additive, never hides
  const style = triggered ? {
    animation: direction === 'left' ? 'revealLeft 0.8s cubic-bezier(0.16,1,0.3,1) forwards'
      : direction === 'right' ? 'revealRight 0.8s cubic-bezier(0.16,1,0.3,1) forwards'
      : direction === 'scale' ? 'scaleIn 0.8s cubic-bezier(0.16,1,0.3,1) forwards'
      : 'slideUp 0.8s cubic-bezier(0.16,1,0.3,1) forwards',
  } : {};

  return { ref, style };
}

/* ═══ Staggered reveal for lists ═══ */
export function useStaggerReveal(count) {
  const refs = useRef([]);
  const [visible, setVisible] = useState(new Set());

  useEffect(() => {
    const observers = [];
    refs.current.forEach((el, i) => {
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setTimeout(() => setVisible(prev => new Set([...prev, i])), i * 120);
            obs.unobserve(el);
          }
        },
        { threshold: 0.1 }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach(o => o.disconnect());
  }, [count]);

  const setRef = useCallback((i) => (el) => { refs.current[i] = el; }, []);
  const getStyle = (i) => visible.has(i) ? { animation: `slideUp 0.7s cubic-bezier(0.16,1,0.3,1) ${i * 0.1}s both` } : {};
  return { setRef, getStyle };
}

/* ═══ Counter animation ═══ */
export function useCountUp(target, duration = 2000) {
  const ref = useRef(null);
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !started) { setStarted(true); obs.unobserve(el); } },
      { threshold: 0.5 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [started, target, duration]);

  return { ref, count };
}

/* ═══ Color palette ═══ */
export const C = {
  red: '#C41E24', redDark: '#9E181D', redLight: '#E8353B',
  navy: '#1A1F36', navyLight: '#2A3050',
  charcoal: '#2D2D2D', gray: '#6B7280',
  light: '#F8F9FA', white: '#FFFFFF', border: '#E5E7EB',
  amber: '#F5A623',
};
export const F = { heading: "'Montserrat', sans-serif", body: "'Inter', sans-serif" };
