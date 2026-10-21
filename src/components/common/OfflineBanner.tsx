import React from 'react';
import { useOnlineStatus } from '../../hooks/usePWAInstall';
import { WifiOff } from 'lucide-react';

export const OfflineBanner: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-16 sm:bottom-4 left-4 right-4 sm:right-auto z-50 flex items-center gap-2 rounded-xl bg-amber-600/95 backdrop-blur-md px-3.5 py-2 text-xs font-medium text-white shadow-xl border border-amber-400/30">
      <WifiOff className="w-4 h-4 shrink-0 animate-pulse text-slate-700" />
      <span>Mode Hors-Ligne — Données et tickets en cache local disponibles.</span>
    </div>
  );
};
