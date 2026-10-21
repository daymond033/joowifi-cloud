import React from 'react';
import { useApp } from '../../context/AppContext';
import { LayoutDashboard, Ticket, Smartphone, Router as RouterIcon, Globe } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { currentSpace, setCurrentSpace, adminTab, setAdminTab } = useApp();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 px-2 py-1.5 flex items-center justify-around text-[11px] font-semibold text-slate-600 shadow-lg">
      <button
        onClick={() => setCurrentSpace('public')}
        className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded cursor-pointer ${
          currentSpace === 'public' ? 'text-[#007A78] font-bold' : 'text-slate-500'
        }`}
      >
        <Globe className="w-4 h-4" />
        <span>Portail</span>
      </button>

      <button
        onClick={() => {
          setCurrentSpace('admin');
          setAdminTab('dashboard');
        }}
        className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded cursor-pointer ${
          currentSpace === 'admin' && adminTab === 'dashboard'
            ? 'text-[#007A78] font-bold'
            : 'text-slate-500'
        }`}
      >
        <LayoutDashboard className="w-4 h-4" />
        <span>Contrôleur</span>
      </button>

      <button
        onClick={() => {
          setCurrentSpace('admin');
          setAdminTab('tickets');
        }}
        className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded cursor-pointer ${
          currentSpace === 'admin' && adminTab === 'tickets'
            ? 'text-[#007A78] font-bold'
            : 'text-slate-500'
        }`}
      >
        <Ticket className="w-4 h-4" />
        <span>Vouchers</span>
      </button>

      <button
        onClick={() => {
          setCurrentSpace('admin');
          setAdminTab('installation');
        }}
        className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded cursor-pointer ${
          currentSpace === 'admin' && adminTab === 'installation'
            ? 'text-[#007A78] font-bold'
            : 'text-slate-500'
        }`}
      >
        <RouterIcon className="w-4 h-4" />
        <span>MikroTik</span>
      </button>

      <button
        onClick={() => setCurrentSpace('pos')}
        className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded cursor-pointer ${
          currentSpace === 'pos' ? 'text-[#007A78] font-bold' : 'text-slate-500'
        }`}
      >
        <Smartphone className="w-4 h-4" />
        <span>Caisse POS</span>
      </button>
    </nav>
  );
};
