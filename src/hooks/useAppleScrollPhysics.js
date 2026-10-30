import { useState, useEffect, useCallback } from 'react';

export function clamp(val, min = 0, max = 1) {
  return Math.max(min, Math.min(max, val));
}

export function rangeProgress(progress, start, end) {
  if (progress <= start) return 0;
  if (progress >= end) return 1;
  return (progress - start) / (end - start);
}

/**
 * Smooth lerped scroll progress (0..1) for a tall sticky container.
 * Uses requestAnimationFrame with damping so wheel ticks feel fluid like Apple product pages.
 */
export function useStickyScrollProgress(containerRef, damping = 0.14) {
  const [smoothProgress, setSmoothProgress] = useState(0);

  useEffect(() => {
    let rafId = null;
    let current = 0;
    let target = 0;

    const computeTarget = () => {
      const el = containerRef.current;
      if (!el) return 0;
      const rect = el.getBoundingClientRect();
      const viewportH = window.innerHeight || 1;
      const scrollableDistance = Math.max(1, rect.height - viewportH);
      const scrolled = -rect.top;
      return clamp(scrolled / scrollableDistance, 0, 1);
    };

    target = computeTarget();
    current = target;

    const tick = () => {
      target = computeTarget();
      const diff = target - current;
      if (Math.abs(diff) > 0.0004) {
        current += diff * damping;
        setSmoothProgress(current);
        rafId = window.requestAnimationFrame(tick);
      } else if (current !== target) {
        current = target;
        setSmoothProgress(current);
        rafId = null;
      } else {
        rafId = null;
      }
    };

    const onScrollOrResize = () => {
      if (!rafId) {
        rafId = window.requestAnimationFrame(tick);
      }
    };

    onScrollOrResize();
    window.addEventListener('scroll', onScrollOrResize, { passive: true });
    window.addEventListener('resize', onScrollOrResize, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScrollOrResize);
      window.removeEventListener('resize', onScrollOrResize);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [containerRef, damping]);

  return smoothProgress;
}

/**
 * Smooth 3D tilt + radial cursor spotlight handler for interactive cards.
 */
export function useAppleTilt(maxDeg = 6) {
  const [tilt, setTilt] = useState({
    rx: 0,
    ry: 0,
    spotX: 50,
    spotY: 50,
    active: false,
  });

  const onMouseMove = useCallback(
    (e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (e.clientX - rect.left) / Math.max(1, rect.width);
      const y = (e.clientY - rect.top) / Math.max(1, rect.height);
      const ry = (x - 0.5) * maxDeg * 2;
      const rx = (0.5 - y) * maxDeg * 2;
      setTilt({
        rx,
        ry,
        spotX: Math.round(x * 100),
        spotY: Math.round(y * 100),
        active: true,
      });
    },
    [maxDeg]
  );

  const onMouseLeave = useCallback(() => {
    setTilt({ rx: 0, ry: 0, spotX: 50, spotY: 50, active: false });
  }, []);

  return { tilt, onMouseMove, onMouseLeave };
}

