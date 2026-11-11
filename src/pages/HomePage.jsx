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

export default function HomePage() {
  return (
    <>
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
    </>
  );
}
