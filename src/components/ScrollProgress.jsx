import { useState, useEffect } from 'react';

const C = { red: '#C41E24', amber: '#F5A623' };

export default function ScrollProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const fn = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(h > 0 ? (window.scrollY / h) * 100 : 0);
    };
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999, height: 3, background: 'transparent' }}>
      <div style={{
        height: '100%', width: `${progress}%`,
        background: `linear-gradient(90deg, ${C.red}, ${C.amber})`,
        transition: 'width 0.1s linear',
        boxShadow: `0 0 12px ${C.red}80`,
      }} />
    </div>
  );
}
