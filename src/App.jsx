import Navbar from './components/Navbar'
import Hero from './components/Hero'
import BrandsMarquee from './components/BrandsMarquee'
import Services from './components/Services'
import About from './components/About'
import Timeline from './components/Timeline'
import Process from './components/Process'
import Locations from './components/Locations'
import Testimonials from './components/Testimonials'
import CTA from './components/CTA'
import Footer from './components/Footer'
import ScrollProgress from './components/ScrollProgress'

function App() {
  return (
    <>
      <ScrollProgress />      <Navbar />
      <Hero />
      <BrandsMarquee />
      <About />
      <Timeline />
      <Services />
      <Process />
      <Locations />
      <Testimonials />
      <CTA />
      <Footer />
    </>
  )
}

export default App
