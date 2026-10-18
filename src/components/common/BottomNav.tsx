import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Smartphone,
  Ticket,
  Globe,
  SlidersHorizontal,
  X,
  Radio,
  Wifi,
  Wallet,
  Activity,
  Terminal,
  Palette,
  Users,
} from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { currentSpace, setCurrentSpace, adminTab, setAdminTab } = useApp();
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

  return (
    <>
      {/* Mobile Bottom Bar */}
      <nav
        aria-label="Navigation mobile"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0B0F19]/95 backdrop-blur-xl border-t border-white/10 pb-safe shadow-2xl"
      >
        <div className="grid grid-cols-5 h-16 items-center">
          {/* Item 1: Site Public */}
          <button
            onClick={() => {
              setCurrentSpace('public');
              setMoreMenuOpen(false);
            }}
            className={`min-h-[44px] min-w-[44px] flex flex-col items-center justify-center gap-1 transition cursor-pointer active:scale-95 ${
              currentSpace === 'public'
                ? 'text-amber-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="w-5 h-5" />
            <span className="text-[10px] leading-tight">Vitrine</span>
          </button>

          {/* Item 2: Dashboard */}
          <button
            onClick={() => {
              setCurrentSpace('admin');
              setAdminTab('dashboard');
              setMoreMenuOpen(false);
            }}
            className={`min-h-[44px] min-w-[44px] flex flex-col items-center justify-center gap-1 transition cursor-pointer active:scale-95 ${
              currentSpace === 'admin' && adminTab === 'dashboard'
                ? 'text-amber-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-[10px] leading-tight">Console</span>
          </button>

          {/* Item 3: Center Highlighted POS Cashier */}
          <button
            onClick={() => {
              setCurrentSpace('pos');
              setMoreMenuOpen(false);
            }}
            className="min-h-[48px] min-w-[48px] -mt-5 flex flex-col items-center justify-center group cursor-pointer"
          >
            <div
              className={`w-13 h-13 rounded-2xl flex items-center justify-center shadow-lg transition-transform active:scale-95 border ${
                currentSpace === 'pos'
                  ? 'bg-gradient-to-tr from-amber-500 to-orange-600 text-slate-950 shadow-amber-500/30 border-amber-300'
                  : 'bg-gradient-to-tr from-amber-500/90 to-orange-600/90 text-slate-950 shadow-amber-500/20 border-amber-400/40'
              }`}
            >
              <Smartphone className="w-6 h-6 stroke-[2.2]" />
            </div>
            <span
              className={`text-[10px] font-bold mt-1 ${
                currentSpace === 'pos' ? 'text-amber-400' : 'text-slate-300'
              }`}
            >
              Caisse POS
            </span>
          </button>

          {/* Item 4: Tickets */}
          <button
            onClick={() => {
              setCurrentSpace('admin');
              setAdminTab('tickets');
              setMoreMenuOpen(false);
            }}
            className={`min-h-[44px] min-w-[44px] flex flex-col items-center justify-center gap-1 transition cursor-pointer active:scale-95 ${
              currentSpace === 'admin' && adminTab === 'tickets'
                ? 'text-amber-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Ticket className="w-5 h-5" />
            <span className="text-[10px] leading-tight">Tickets</span>
          </button>

          {/* Item 5: More Menu */}
          <button
            onClick={() => setMoreMenuOpen(!moreMenuOpen)}
            className={`min-h-[44px] min-w-[44px] flex flex-col items-center justify-center gap-1 transition cursor-pointer active:scale-95 ${
              moreMenuOpen ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <SlidersHorizontal className="w-5 h-5" />
            <span className="text-[10px] leading-tight">Menu</span>
          </button>
        </div>
      </nav>

      {/* Quick More Drawer on Mobile */}
      {moreMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col justify-end p-4">
          <div className="w-full bg-[#0B0F19] border border-white/15 rounded-3xl p-5 shadow-2xl max-h-[80vh] overflow-y-auto mb-16">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <span className="font-bold text-white text-sm">Navigation Rapide Cloud</span>
              <button
                onClick={() => setMoreMenuOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => {
                  setCurrentSpace('admin');
                  setAdminTab('forfaits');
                  setMoreMenuOpen(false);
                }}
                className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-slate-200 font-medium active:scale-95"
              >
                <Wifi className="w-4 h-4 text-amber-400" />
                <span>Forfaits Hotspot</span>
              </button>

              <button
                onClick={() => {
                  setCurrentSpace('admin');
                  setAdminTab('sessions');
                  setMoreMenuOpen(false);
                }}
                className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-slate-200 font-medium active:scale-95"
              >
                <Radio className="w-4 h-4 text-emerald-400" />
                <span>Clients Connectés</span>
              </button>

              <button
                onClick={() => {
                  setCurrentSpace('admin');
                  setAdminTab('staff');
                  setMoreMenuOpen(false);
                }}
                className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-slate-200 font-medium active:scale-95"
              >
                <Users className="w-4 h-4 text-amber-400" />
                <span>Vendeurs / Staff</span>
              </button>

              <button
                onClick={() => {
                  setCurrentSpace('admin');
                  setAdminTab('portefeuille');
                  setMoreMenuOpen(false);
                }}
                className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-slate-200 font-medium active:scale-95"
              >
                <Wallet className="w-4 h-4 text-emerald-400" />
                <span>Portefeuille Pay</span>
              </button>

              <button
                onClick={() => {
                  setCurrentSpace('admin');
                  setAdminTab('sante');
                  setMoreMenuOpen(false);
                }}
                className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-slate-200 font-medium active:scale-95"
              >
                <Activity className="w-4 h-4 text-rose-400" />
                <span>Santé Réseau</span>
              </button>

              <button
                onClick={() => {
                  setCurrentSpace('admin');
                  setAdminTab('installation');
                  setMoreMenuOpen(false);
                }}
                className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-slate-200 font-medium active:scale-95"
              >
                <Terminal className="w-4 h-4 text-cyan-400" />
                <span>Script MikroTik</span>
              </button>

              <button
                onClick={() => {
                  setCurrentSpace('admin');
                  setAdminTab('personnalisation');
                  setMoreMenuOpen(false);
                }}
                className="col-span-2 flex items-center justify-center gap-2 p-3 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold active:scale-95"
              >
                <Palette className="w-4 h-4 text-amber-400" />
                <span>Éditeur de Portail Captif (Live Sandbox)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
