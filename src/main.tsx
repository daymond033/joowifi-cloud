import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { AppProvider } from './context/AppContext.tsx';
import './index.css';

class RootErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; errorMsg: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, errorMsg: '' };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, errorMsg: error?.message || String(error) };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F4F7FA] text-[#1E293B] flex items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full bg-white rounded-lg border border-slate-200 p-6 shadow-lg space-y-4 text-center">
            <div className="text-xl font-bold text-[#005A5B]">Joowifi Cloud</div>
            <p className="text-xs text-slate-600">
              Une mise à jour de session est requise. Cliquez ci-dessous pour réinitialiser l'affichage.
            </p>
            <button
              onClick={() => {
                try {
                  localStorage.removeItem('joowifi_auth_user');
                } catch {}
                window.location.reload();
              }}
              className="w-full py-2.5 rounded bg-[#008060] text-white font-semibold text-xs cursor-pointer"
            >
              Recharger l'application
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}

createRoot(document.getElementById('root')!).render(
  <RootErrorBoundary>
    <AppProvider>
      <App />
    </AppProvider>
  </RootErrorBoundary>
);
