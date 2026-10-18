import React, { useState } from 'react';
import { useApp, PublicTab } from '../../context/AppContext';
import { Wifi, Globe, LogIn, ChevronDown, Menu, X } from 'lucide-react';

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
    { label: 'Accueil', tab: 'home' },
    { label: 'Fonctionnalités', tab: 'features' },
    { label: 'Tarification', tab: 'pricing' },
    { label: 'À propos', tab: 'about' },
    { label: 'Contact', tab: 'contact' },
  ];

  const handleNavClick = (tab: PublicTab) => {
    setCurrentSpace('public');
    setPublicTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-2.5 text-left group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20 border border-amber-400/30 group-hover:scale-105 transition-transform">
              <Wifi className="w-5 h-5 text-slate-950 stroke-[2.5]" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-extrabold tracking-tight text-white font-sans">
                Joo<span className="text-amber-500">wifi</span>
              </span>
            </div>
          </button>
        </div>

        {/* Public Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((item) => (
            <button
              key={item.tab}
              onClick={() => handleNavClick(item.tab)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition cursor-pointer ${
                currentSpace === 'public' && publicTab === item.tab
                  ? 'bg-amber-500/15 text-amber-400 font-semibold border border-amber-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Action Controls & Space Selectors */}
        <div className="hidden sm:flex items-center gap-3">
          {/* Heartbeat Status Indicator */}
          <div
            title="Connexion MikroTik Pull (Heartbeat toutes les 45s)"
            className="hidden xl:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono tabular-nums"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Pull 45s : {heartbeatSecondsRemaining}s</span>
          </div>

          {/* Currency Dropdown */}
          <div className="relative">
            <button
              onClick={() => setCurrencyDropdown(!currencyDropdown)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-xs font-mono font-semibold text-slate-200 hover:border-amber-500/40 transition cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              <span>{currency}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {currencyDropdown && (
              <div className="absolute right-0 mt-1 w-32 glass-dropdown rounded-xl shadow-2xl py-1 text-xs z-50 font-mono">
                {(['XOF', 'GNF', 'EUR', 'USD'] as const).map((curr) => (
                  <button
                    key={curr}
                    onClick={() => {
                      setCurrency(curr);
                      setCurrencyDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-amber-500/20 cursor-pointer ${
                      currency === curr ? 'text-amber-400 font-bold' : 'text-slate-300'
                    }`}
                  >
                    <span>{curr}</span>
                    <span className="text-[10px] text-slate-500">
                      {curr === 'XOF' ? 'FCFA' : curr}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Authentication Actions */}
          <div className="flex items-center gap-2 pl-1 border-l border-white/10">
            <button
              onClick={() => openAuthModal('login')}
              className="px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
            >
              <LogIn className="w-3.5 h-3.5 text-amber-400" />
              <span>Se connecter</span>
            </button>

            <button
              onClick={() => openAuthModal('register')}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/25 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <span>Commencer gratuitement</span>
            </button>
          </div>
        </div>

        {/* Mobile header controls */}
        <div className="flex sm:hidden items-center gap-2">
          <button
            onClick={() => openAuthModal('register')}
            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 active:scale-95 transition"
          >
            Commencer
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden glass-panel border-b border-white/10 px-4 pt-3 pb-6 space-y-4">
          <div className="flex flex-col gap-2 pb-3 border-b border-white/10">
            <button
              onClick={() => {
                openAuthModal('register');
                setMobileMenuOpen(false);
              }}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/25 text-center transition active:scale-95"
            >
              Commencer gratuitement
            </button>
            <button
              onClick={() => {
                openAuthModal('login');
                setMobileMenuOpen(false);
              }}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-slate-200 font-semibold text-xs text-center flex items-center justify-center gap-1.5 transition"
            >
              <LogIn className="w-3.5 h-3.5 text-amber-400" />
              <span>Se connecter</span>
            </button>
          </div>

          <div className="space-y-1">
            {navLinks.map((item) => (
              <button
                key={item.tab}
                onClick={() => handleNavClick(item.tab)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${
                  currentSpace === 'public' && publicTab === item.tab
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-300 hover:bg-slate-800/80'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="pt-3 border-t border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-mono">
              <span className="text-xs text-slate-400 font-sans">Devise :</span>
              {(['XOF', 'GNF', 'EUR', 'USD'] as const).map((c) => (
                <button
                  key={c}
                  onClick={() => setCurrency(c)}
                  className={`px-2 py-1 rounded text-xs font-bold ${
                    currency === c ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-mono border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>Pull: {heartbeatSecondsRemaining}s</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
