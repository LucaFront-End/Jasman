import { Link } from 'react-router-dom';
import { footerContent } from '../data/content';
import { C, F } from '../hooks/useAnimations';
import { Phone, Mail, MessageCircle } from 'lucide-react';

const socialIcons = [
  <svg key="fb" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>,
  <svg key="ig" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>,
  <svg key="tt" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/></svg>,
];

const isExternal = (href) => href.startsWith('http');

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="site-footer-grid">
          {/* Brand */}
          <div className="site-footer-brand">
            <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', marginBottom: 20 }} aria-label="Jasman Automotriz">
              <img
                src="/images/logo/logo-03.png"
                alt="Jasman Automotriz"
                className="site-footer-brand-logo"
              />
            </Link>
            <p className="site-footer-desc">{footerContent.description}</p>
            <div className="site-footer-social">
              {socialIcons.map((icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="site-footer-social-btn"
                  aria-label="Red social Jasman"
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Links Group (Company + Legal) */}
          <div className="site-footer-links-group">
            {/* Company */}
            <div className="site-footer-col">
              <h4>Compañía</h4>
              <ul>
                {footerContent.links.company.map(l => (
                  <li key={l.label}>
                    {isExternal(l.href) ? (
                      <a href={l.href} target="_blank" rel="noopener noreferrer" className="link-hover">
                        {l.label}
                      </a>
                    ) : (
                      <Link to={l.href} className="link-hover">
                        {l.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div className="site-footer-col">
              <h4>Legal</h4>
              <ul>
                {footerContent.links.legal.map(l => (
                  <li key={l.label}>
                    {isExternal(l.href) ? (
                      <a href={l.href} target="_blank" rel="noopener noreferrer" className="link-hover">
                        {l.label}
                      </a>
                    ) : (
                      <Link to={l.href} className="link-hover">
                        {l.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Contact */}
          <div className="site-footer-col site-footer-contact">
            <h4>Contacto</h4>
            <ul>
              <li>
                <a
                  href={`tel:${footerContent.contact.phone.replace(/\s/g, '')}`}
                  className="site-footer-contact-item"
                >
                  <Phone size={15} style={{ flexShrink: 0, color: C.red }} />
                  <span>{footerContent.contact.phone}</span>
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${footerContent.contact.email}`}
                  className="site-footer-contact-item"
                >
                  <Mail size={15} style={{ flexShrink: 0, color: C.red }} />
                  <span>{footerContent.contact.email}</span>
                </a>
              </li>
              <li>
                <a
                  href={`https://api.whatsapp.com/send/?phone=52${footerContent.contact.whatsapp.replace(/[\s+]/g, '')}&text=${encodeURIComponent('SW -Hola quisiera más información sobre sus servicios')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="site-footer-contact-item"
                >
                  <MessageCircle size={15} style={{ flexShrink: 0, color: '#25D366' }} />
                  <span>WhatsApp Atención</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="site-footer-bottom">
        <div className="site-footer-bottom-inner">
          <span>© {year} Jasman Automotriz. Todos los derechos reservados.</span>
          <span>Centro de Soluciones Automotrices</span>
        </div>
      </div>
    </footer>
  );
}
