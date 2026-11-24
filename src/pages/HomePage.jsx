import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Hero from '../components/Hero';
import BrandsMarquee from '../components/BrandsMarquee';
import Services from '../components/Services';
import About from '../components/About';
import Timeline from '../components/Timeline';
import Process from '../components/Process';
import Locations from '../components/Locations';
import Testimonials from '../components/Testimonials';
import Promotions from '../components/Promotions';
import CTA from '../components/CTA';
import TiendaCatalogSection from '../components/tienda/TiendaCatalogSection';
import TiendaCartDrawer from '../components/tienda/TiendaCartDrawer';
import TiendaAuthModal from '../components/tienda/TiendaAuthModal';
import '../styles/darkLandingThemes.css';

export default function HomePage({ darkTheme = null }) {
  useEffect(() => {
    if (!darkTheme || typeof document === 'undefined') {
      return undefined;
    }
    document.documentElement.setAttribute('data-jasman-theme', darkTheme);
    return () => {
      document.documentElement.removeAttribute('data-jasman-theme');
    };
  }, [darkTheme]);

  return (
    <div className={darkTheme ? `jasman-dark-landing jasman-theme-${darkTheme}` : undefined}>
      <TiendaCartDrawer />
      <TiendaAuthModal />
      <Hero />
      <BrandsMarquee />
      <About />
      <Timeline />
      <Services />
      <Process />
      <Locations />
      <Testimonials />
      <div id="tienda-home-section">
        <TiendaCatalogSection id="catalogo-home-preview" isHomePreview />
      </div>
      <Promotions />
      <CTA />

      {darkTheme && (
        <nav className="jasman-theme-switcher-pill" aria-label="Versión de diseño">
          <Link to="/">Actual</Link>
          <Link to="/landing-negro" className={darkTheme === 'obsidian' ? 'is-active' : ''}>
            Negro
          </Link>
          <Link to="/landing-negro-suave" className={darkTheme === 'charcoal' ? 'is-active' : ''}>
            Negro Suave
          </Link>
        </nav>
      )}
    </div>
  );
}
