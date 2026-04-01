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

export default function HomePage() {
  return (
    <>
      <Hero />
      <BrandsMarquee />
      <About />
      <Timeline />
      <Services />
      <Process />
      <Locations />
      <Testimonials />
      <Promotions />
      <CTA />
    </>
  );
}
