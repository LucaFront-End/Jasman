import { useState, useEffect, useRef } from 'react';

/* ═══ Mouse Parallax Container ═══ */
export function useMouseParallax() {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const ref = useRef(null);

  useEffect(() => {
    const fn = (e) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      setMouse({ x, y });
    };
    const el = ref.current;
    if (el) el.addEventListener('mousemove', fn);
    return () => { if (el) el.removeEventListener('mousemove', fn); };
  }, []);

  const getStyle = (intensity = 20) => ({
    transform: `translate(${mouse.x * intensity}px, ${mouse.y * intensity}px)`,
    transition: 'transform 0.3s ease-out',
  });

  return { ref, mouse, getStyle };
}

/* ═══ Scroll-linked opacity/transform ═══ */
export function useScrollTransform(options = {}) {
  const { start = 0, end = 500 } = options;
  const [val, setVal] = useState(0);

  useEffect(() => {
    const fn = () => {
      const scroll = window.scrollY;
      const p = Math.min(1, Math.max(0, (scroll - start) / (end - start)));
      setVal(p);
    };
    window.addEventListener('scroll', fn, { passive: true });
    fn();
    return () => window.removeEventListener('scroll', fn);
  }, [start, end]);

  return val;
}
