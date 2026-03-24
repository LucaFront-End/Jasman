import { C, F } from '../hooks/useAnimations';

const brands = [
  'Michelin', 'Bridgestone', 'Goodyear', 'Continental',
  'Pirelli', 'Hankook', 'BFGoodrich', 'Firestone',
  'Yokohama', 'Dunlop', 'Toyo Tires', 'Kumho',
];

export default function BrandsMarquee() {
  const doubled = [...brands, ...brands];
  return (
    <section style={{ padding: '18px 0', background: C.navy, borderTop: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden', position: 'relative' }}>
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 150, background: `linear-gradient(to right, ${C.navy}, transparent)`, zIndex: 2 }} />
      <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 150, background: `linear-gradient(to left, ${C.navy}, transparent)`, zIndex: 2 }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 48, width: 'max-content', animation: 'marquee 35s linear infinite' }}>
        {doubled.map((b, i) => (
          <span key={i} style={{ fontFamily: F.heading, fontWeight: 700, fontSize: 16, color: 'rgba(255,255,255,0.25)', whiteSpace: 'nowrap', letterSpacing: '0.05em', transition: 'color 0.3s' }}>
            {b} <span style={{ color: 'rgba(196,30,36,0.35)', margin: '0 8px' }}>✦</span>
          </span>
        ))}
      </div>
    </section>
  );
}
