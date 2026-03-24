import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

/* ═══ Global entrance animations ═══ */
const observeSections = () => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('section > div, section > div > div, footer > div').forEach((el) => {
    el.classList.add('reveal-on-scroll');
    observer.observe(el);
  });
};

// Run after React renders
if (document.readyState === 'complete') {
  setTimeout(observeSections, 300);
} else {
  window.addEventListener('load', () => setTimeout(observeSections, 300));
}
