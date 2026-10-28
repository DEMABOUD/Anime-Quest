import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Register Service Worker for PWA installability and offline support
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('Anime Quest PWA SW enregistré:', registration.scope);
      })
      .catch((err) => {
        console.warn('Anime Quest PWA SW enregistrement warning:', err);
      });
  });
}

createRoot(document.getElementById('root')!).render(<App />);
