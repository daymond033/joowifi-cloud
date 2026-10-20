import React, { useState } from 'react';
import { useApp, PublicTab } from '../../context/AppContext';
import {
  Radio,
  Globe,
  LogIn,
  ChevronDown,
  Menu,
  X,
  Smartphone,
  LayoutDashboard,
  ShieldCheck,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    currentSpace,
    setCurrentSpace,
    publicTab,
    setPublicTab,
    currency,
    setCurrency,
    openAuthModal,
    heartbeatSecondsRemaining,
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currencyDropdown, setCurrencyDropdown] = useState(false);

  const navLinks: { label: string; tab: PublicTab }[] = [
    { label: 'Plateforme SDN', tab: 'home' },
    { label: 'Architecture & POS', tab: 'features' },
    { label: 'Offres Opérateurs', tab: 'pricing' },
    { label: 'Notre Vision', tab: 'about' },
    { label: 'Support Ingénierie', tab: 'contact' },
  ];

  const handleNavClick = (tab: PublicTab) => {
    setCurrentSpace('public');
    setPublicTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand Logo — Distinct Cyber-Emerald & Cyan Identity */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 text-left group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 border border-emerald-300/30 group-hover:scale-105 transition-transform">
              <Radio className="w-5 h-5 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight text-white">
                  JOO<span className="text-emerald-400">WIFI</span>
                </span>
                <span className="hidden sm:inline-block text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  FABRIC OS 6.0
                </span>
              </div>
              <span className="block text-[10px] text-slate-400 font-medium">
                Cloud SDN MikroTik & Monétisation WiFi
              </span>
            </div>
          </button>
        </div>

        {/* Public Desktop Nav Pill */}
        <nav className="hidden lg:flex items-center gap-1 p-1 rounded-2xl bg-slate-950/80 border border-white/10">
          {navLinks.map((item) => (
            <button
              key={item.tab}
              onClick={() => handleNavClick(item.tab)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                currentSpace === 'public' && publicTab === item.tab
                  ? 'bg-gradient-to-r from-emerald-500 to-cyan-600 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Action Controls & Space Selectors */}
        <div className="hidden sm:flex items-center gap-2.5">
          {/* Fast-Poll Status Indicator */}
          <div
            title="Synchronisation Cloud Pull bidirectionnelle (Fast-Poll 10s / Heartbeat 45s)"
            className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs font-mono tabular-nums"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Sync : {heartbeatSecondsRemaining}s</span>
          </div>

          {/* Currency Dropdown */}
          <div className="relative">
            <button
              onClick={() => setCurrencyDropdown(!currencyDropdown)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs font-mono font-bold text-cyan-300 hover:border-emerald-500/40 transition cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span>{currency}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {currencyDropdown && (
              <div className="absolute right-0 mt-1 w-36 glass-dropdown rounded-xl shadow-2xl py-1 text-xs z-50 font-mono">
                {(['XOF', 'GNF', 'EUR', 'USD'] as const).map((curr) => (
                  <button
                    key={curr}
                    onClick={() => {
                      setCurrency(curr);
                      setCurrencyDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-emerald-500/20 cursor-pointer ${
                      currency === curr ? 'text-emerald-400 font-bold' : 'text-slate-300'
                    }`}
                  >
                    <span>{curr}</span>
                    <span className="text-[10px] text-slate-400">
                      {curr === 'XOF' ? 'FCFA' : curr}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Direct Space Launchers */}
          <div className="flex items-center gap-2 pl-2 border-l border-white/10">
            <button
              onClick={() => setCurrentSpace('pos')}
              className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-slate-200 hover:text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
            >
              <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
              <span>Kiosque POS</span>
            </button>

            <button
              onClick={() => setCurrentSpace('admin')}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/20 transition cursor-pointer flex items-center gap-1.5"
            >
              <LayoutDashboard className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Console SDN</span>
            </button>
          </div>
        </div>

        {/* Mobile Hamburger */}
        <div className="flex sm:hidden items-center gap-2">
          <button
            onClick={() => setCurrentSpace('admin')}
            className="px-3 py-1.5 rounded-xl bg-emerald-500 text-slate-950 font-extrabold text-xs cursor-pointer"
          >
            Console
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl bg-slate-900 border border-white/10 text-slate-200 hover:text-white cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden glass-dropdown border-b border-white/10 px-4 pt-3 pb-5 space-y-3">
          <div className="flex flex-col gap-1">
            {navLinks.map((item) => (
              <button
                key={item.tab}
                onClick={() => handleNavClick(item.tab)}
                className={`w-full text-left px-3 py-2 rounded-xl text-sm font-semibold ${
                  publicTab === item.tab
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'text-slate-300 hover:bg-slate-800/50'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-white/10 grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setCurrentSpace('pos');
              }}
              className="py-2.5 rounded-xl bg-slate-900 border border-white/10 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5"
            >
              <Smartphone className="w-4 h-4 text-cyan-400" />
              <span>Caisse POS</span>
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setCurrentSpace('admin');
              }}
              className="py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-600 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1.5"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Console Admin</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
