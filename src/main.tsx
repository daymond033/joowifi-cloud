import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { AppProvider } from './context/AppContext.tsx';
import './index.css';

// Register Joowifi PWA Service Worker for offline field POS reliability
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Ignore SW registration errors in sandboxed preview environments
    });
  });
}

createRoot(document.getElementById('root')!).render(
  <AppProvider>
    <App />
  </AppProvider>
);
