import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App.jsx';

// Reveal on scroll
const revealObserver = new IntersectionObserver(
  (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('revealed'); }),
  { threshold: 0.1 }
);

const observeSections = () => {
  document.querySelectorAll('section').forEach((s) => {
    s.classList.add('reveal-section');
    revealObserver.observe(s);
  });
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);

// re-observe on route changes
const origPushState = history.pushState;
history.pushState = function (...args) {
  origPushState.apply(this, args);
  setTimeout(observeSections, 100);
};
window.addEventListener('popstate', () => setTimeout(observeSections, 100));
setTimeout(observeSections, 100);
