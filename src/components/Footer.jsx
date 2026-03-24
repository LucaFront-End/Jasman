import { footerContent } from '../data/content';
import { C, F } from '../hooks/useAnimations';
import { Phone, Mail, MessageCircle } from 'lucide-react';

const socialIcons = [
  // Facebook
  <svg key="fb" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>,
  // Instagram
  <svg key="ig" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>,
  // TikTok
  <svg key="tt" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/></svg>,
];

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer style={{ background: C.navy, color: C.white }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '64px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', gap: 48 }}>
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: C.red, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.heading, fontWeight: 900, fontSize: 18, color: C.white, boxShadow: '0 4px 16px rgba(196,30,36,0.3)' }}>J</div>
              <span style={{ fontFamily: F.heading, fontWeight: 800, fontSize: 22 }}>JASMAN</span>
            </div>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, maxWidth: 280 }}>{footerContent.description}</p>
            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
            {socialIcons.map((icon, i) => (
                <a key={i} href="#" style={{
                  width: 42, height: 42, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.45)',
                  transition: 'all 0.3s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(196,30,36,0.15)'; e.currentTarget.style.color = C.redLight; e.currentTarget.style.borderColor = 'rgba(196,30,36,0.3)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >{icon}</a>
              ))}
            </div>
          </div>
          {/* Company */}
          <div>
            <h4 style={{ fontFamily: F.heading, fontWeight: 600, fontSize: 13, color: 'rgba(255,255,255,0.75)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 24 }}>Compañía</h4>
            <ul>{footerContent.links.company.map(l => (
              <li key={l.label} style={{ marginBottom: 14 }}>
                <a href={l.href} className="link-hover" style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, transition: 'color 0.3s' }}
                  onMouseEnter={e => e.currentTarget.style.color = C.white}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
                >{l.label}</a>
              </li>
            ))}</ul>
          </div>
          {/* Legal */}
          <div>
            <h4 style={{ fontFamily: F.heading, fontWeight: 600, fontSize: 13, color: 'rgba(255,255,255,0.75)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 24 }}>Legal</h4>
            <ul>{footerContent.links.legal.map(l => (
              <li key={l.label} style={{ marginBottom: 14 }}>
                <a href={l.href} className="link-hover" style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, transition: 'color 0.3s' }}
                  onMouseEnter={e => e.currentTarget.style.color = C.white}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
                >{l.label}</a>
              </li>
            ))}</ul>
          </div>
          {/* Contact */}
          <div>
            <h4 style={{ fontFamily: F.heading, fontWeight: 600, fontSize: 13, color: 'rgba(255,255,255,0.75)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 24 }}>Contacto</h4>
            <ul>
              <li style={{ marginBottom: 14 }}><a href={`tel:${footerContent.contact.phone}`} style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, transition: 'color 0.3s', display: 'inline-flex', alignItems: 'center', gap: 8 }} onMouseEnter={e => e.currentTarget.style.color = C.white} onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}><Phone size={14} /> {footerContent.contact.phone}</a></li>
              <li style={{ marginBottom: 14 }}><a href={`mailto:${footerContent.contact.email}`} style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, wordBreak: 'break-all', transition: 'color 0.3s', display: 'inline-flex', alignItems: 'center', gap: 8 }} onMouseEnter={e => e.currentTarget.style.color = C.white} onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}><Mail size={14} /> {footerContent.contact.email}</a></li>
              <li><a href="#" style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, transition: 'color 0.3s', display: 'inline-flex', alignItems: 'center', gap: 8 }} onMouseEnter={e => e.currentTarget.style.color = C.white} onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}><MessageCircle size={14} /> WhatsApp</a></li>
            </ul>
          </div>
        </div>
      </div>
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '20px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>© {year} Jasman Automotriz. Todos los derechos reservados.</span>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.15)' }}>Centro de Soluciones Automotrices</span>
        </div>
      </div>
    </footer>
  );
}
