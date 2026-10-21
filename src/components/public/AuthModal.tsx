import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  Wifi,
  Shield,
  Cpu,
  Radio,
  Server,
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, authMode, login } = useApp();
  const [mode, setMode] = useState<'login' | 'register'>(authMode);
  const [slideIndex, setSlideIndex] = useState<0 | 1>(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setEmailError(true);
      return;
    }
    login(email.trim(), 'admin', name || 'Opérateur Joowifi SDN');
  };

  const handleDemoAdmin = () => {
    login('admin@joowifi.ci', 'admin', 'Kouamé Konan (Admin SDN)');
  };

  const handleDemoVendor = () => {
    login('mamadou.fonate@joowifi.ci', 'staff', 'Mamadou Fonate (Caisse POS)');
  };

  return (
    <div className="fixed inset-0 z-[90] flex flex-col justify-between overflow-y-auto select-none transition-colors duration-500"
      style={{
        background:
          slideIndex === 0
            ? 'linear-gradient(180deg, #F5F7FA 0%, #E4E8EE 78%, #BDC5D1 100%)'
            : 'linear-gradient(180deg, #162E2E 0%, #244746 65%, #D8E2E1 100%)',
      }}
    >
      {/* Top Right Language & Close Controls (exact match to id.tplinkcloud.com) */}
      <div className="w-full px-6 sm:px-12 pt-5 flex items-center justify-end gap-6 text-xs">
        <span className={slideIndex === 0 ? 'text-slate-600 font-medium' : 'text-white/90 font-medium'}>
          Français &or;
        </span>
        <button
          onClick={closeAuthModal}
          className={`px-3 py-1.5 rounded border text-xs font-semibold flex items-center gap-1 cursor-pointer transition ${
            slideIndex === 0
              ? 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
              : 'bg-white/10 border-white/25 text-white hover:bg-white/20'
          }`}
        >
          <X className="w-3.5 h-3.5" />
          <span>Fermer</span>
        </button>
      </div>

      {/* Left / Right Carousel Arrows */}
      <button
        type="button"
        onClick={() => setSlideIndex(slideIndex === 0 ? 1 : 0)}
        className={`hidden lg:flex fixed left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 items-center justify-center rounded-full transition cursor-pointer ${
          slideIndex === 0 ? 'text-slate-400 hover:text-slate-700' : 'text-white/60 hover:text-white'
        }`}
        title="Diapositive précédente"
      >
        <ChevronLeft className="w-8 h-8 stroke-[1.5]" />
      </button>

      <button
        type="button"
        onClick={() => setSlideIndex(slideIndex === 0 ? 1 : 0)}
        className={`hidden lg:flex fixed right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 items-center justify-center rounded-full transition cursor-pointer ${
          slideIndex === 0 ? 'text-slate-400 hover:text-slate-700' : 'text-white/60 hover:text-white'
        }`}
        title="Diapositive suivante"
      >
        <ChevronRight className="w-8 h-8 stroke-[1.5]" />
      </button>

      {/* SPLIT LAYOUT CONTAINER (Left Product Showcase 58% / Right Pure White Login Card 42%) */}
      <div className="flex-1 max-w-6xl w-full mx-auto px-6 sm:px-10 py-6 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        {/* LEFT COLUMN : CORPORATE HARDWARE & SDN SHOWCASE (Slides 1 & 2 like image_4390fb & image_439119) */}
        <div className="lg:col-span-7 space-y-6 relative">
          {/* Brand Logo */}
          <div className="inline-flex flex-col">
            <span
              className={`text-3xl font-bold tracking-tight leading-none ${
                slideIndex === 0 ? 'text-[#2B2E33]' : 'text-white'
              }`}
            >
              Joowifi
            </span>
            <span
              className={`text-[11px] font-semibold tracking-wide text-right mt-0.5 ${
                slideIndex === 0 ? 'text-slate-600' : 'text-teal-200'
              }`}
            >
              by Ivoire Réseaux
            </span>
          </div>

          {slideIndex === 0 ? (
            /* SLIDE 1 : FUSION GATEWAYS & HARDWARE STACK (Matches image_4390fb.jpg) */
            <div className="space-y-4">
              <h1 className="text-3xl sm:text-4xl font-semibold text-[#1E293B] leading-tight">
                <span className="text-[#007A78]">Passerelles MikroTik</span> Au Cœur de
                <br />
                l'Entreprise Connectée
              </h1>
              <p className="text-sm text-slate-600 font-normal">
                Déployez rapidement. Évoluez simplement. Profitez d'une gestion Cloud sans ouverture de port.
              </p>

              {/* Hardware Rack & Gateway Stack Visual (Clean Industrial Illustration) */}
              <div className="pt-4 flex flex-col sm:flex-row items-end gap-4">
                {/* Vertical Cylindrical Cloud Core */}
                <div className="w-28 h-52 rounded-t-xl bg-gradient-to-r from-slate-300 via-slate-100 to-slate-300 border border-slate-400/60 shadow-md flex flex-col items-center justify-center p-3 shrink-0">
                  <div className="w-8 h-28 rounded bg-[#111827] border border-slate-600 p-1.5 flex flex-col items-center justify-between">
                    <span className="w-4 h-4 rounded-sm bg-emerald-500 flex items-center justify-center text-[8px] text-white font-bold">
                      99
                    </span>
                    <Globe className="w-3.5 h-3.5 text-cyan-400" />
                    <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                    <Shield className="w-3.5 h-3.5 text-teal-300" />
                    <Cpu className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </div>

                {/* Stacked Rack Gateways */}
                <div className="flex-1 space-y-2.5 w-full">
                  <div className="w-48 ml-auto h-11 rounded-lg bg-[#181C20] border border-slate-500 px-3 flex items-center justify-between shadow">
                    <span className="text-[10px] font-mono text-emerald-400">SLA 99.9%</span>
                    <div className="flex items-end gap-0.5 h-4">
                      {[40, 75, 55, 90, 65, 85, 70, 95].map((h, i) => (
                        <span
                          key={i}
                          className="w-1 bg-emerald-400"
                          style={{ height: `${h}%` }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="w-60 ml-auto h-12 rounded-lg bg-[#181C20] border border-slate-500 px-4 flex items-center justify-between shadow">
                    <span className="text-[10px] font-mono text-cyan-300">Fast-Poll 10s</span>
                    <span className="text-[10px] font-mono text-emerald-400">24 Vouchers OK</span>
                  </div>

                  <div className="w-72 ml-auto h-12 rounded-lg bg-[#181C20] border border-slate-500 px-4 flex items-center justify-between shadow">
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500 text-white text-[9px] font-bold">
                        WAN
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-sky-500 text-white text-[9px] font-bold">
                        LAN
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-teal-500 text-white text-[9px] font-bold">
                        POS
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-300">RB5009 / CHR v7</span>
                  </div>

                  <div className="w-full h-14 rounded bg-gradient-to-b from-slate-200 to-slate-300 border border-slate-400 px-4 flex items-center justify-between shadow-md">
                    <div className="px-2.5 py-1 rounded bg-[#111827] text-emerald-400 font-mono text-[10px]">
                      JOOWIFI CLOUD RACK
                    </div>
                    <div className="grid grid-cols-6 gap-1">
                      {[1, 2, 3, 4, 5, 6].map((p) => (
                        <span key={p} className="w-3 h-2.5 bg-slate-700 rounded-xs" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Left Grey Info Pill (Exact match to image_4390fb.jpg) */}
              <div className="mt-4 inline-block p-3.5 rounded-lg bg-slate-700/80 text-white max-w-xs">
                <div className="text-xs font-normal leading-snug">
                  Gestion Unifiée Réseau, Caisse POS & Monétisation en Un Seul Système
                </div>
                <button
                  type="button"
                  onClick={handleDemoAdmin}
                  className="text-[11px] text-[#38B2AC] hover:underline font-medium mt-1 inline-block cursor-pointer"
                >
                  &#9656; Passerelles Joowifi SDN
                </button>
              </div>
            </div>
          ) : (
            /* SLIDE 2 : LONG-RANGE PTMP & MULTI-ZONE WIFI TRANSMISSION (Matches image_439119.jpg) */
            <div className="space-y-4 text-white">
              <h1 className="text-3xl sm:text-4xl font-semibold leading-tight text-white">
                Transmission Wi-Fi Longue Portée
                <br />
                & Multi-Zones, Parfaite pour Hôtels & Marchés
              </h1>
              <p className="text-sm text-teal-100/85 font-normal">
                Solution Professionnelle de Ponts Sans Fil, Hotspots Extérieurs et Kiosques POS
              </p>

              {/* Isometric Outdoor Bridge & Multi-Site Coverage Diagram */}
              <div className="pt-4 grid grid-cols-3 gap-4 items-center">
                <div className="p-4 rounded-lg bg-white/10 border border-white/20 text-center space-y-1.5">
                  <div className="w-8 h-8 mx-auto rounded-full bg-[#005A5B] border border-teal-300 flex items-center justify-center">
                    <Radio className="w-4 h-4 text-teal-200" />
                  </div>
                  <div className="text-xs font-semibold">Site Grand Adjamé</div>
                  <div className="text-[10px] text-teal-200 font-mono">Pont PtMP Actif</div>
                </div>

                <div className="p-5 rounded-lg bg-white/15 border-2 border-teal-300 text-center space-y-2 shadow-lg">
                  <div className="w-10 h-10 mx-auto rounded-full bg-[#007A78] flex items-center justify-center">
                    <Server className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-xs font-bold">Cœur MikroTik v7</div>
                  <div className="text-[10px] text-teal-200 font-mono">Sync Supabase 10s</div>
                </div>

                <div className="p-4 rounded-lg bg-white/10 border border-white/20 text-center space-y-1.5">
                  <div className="w-8 h-8 mx-auto rounded-full bg-[#005A5B] border border-teal-300 flex items-center justify-center">
                    <Wifi className="w-4 h-4 text-teal-200" />
                  </div>
                  <div className="text-xs font-semibold">Campus Cocody</div>
                  <div className="text-[10px] text-teal-200 font-mono">Kiosque POS Actif</div>
                </div>
              </div>

              <div className="mt-4 inline-block p-3.5 rounded-lg bg-slate-900/65 text-white max-w-xs border border-white/10">
                <div className="text-xs font-normal leading-snug">
                  Transmission Wi-Fi Multi-Sites & Synchronisation Cloud Zero-Port
                </div>
                <button
                  type="button"
                  onClick={handleDemoAdmin}
                  className="text-[11px] text-[#4ADE80] hover:underline font-medium mt-1 inline-block cursor-pointer"
                >
                  &#9656; Architecture Joowifi PtMP & SDN
                </button>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN : PURE WHITE MINIMALIST LOGIN CARD (Exact match to image_4390fb & image_439119) */}
        <div className="lg:col-span-5 flex justify-center lg:justify-end">
          <div className="w-full max-w-[400px] bg-white rounded-lg shadow-xl border border-slate-200/80 px-8 py-10 text-slate-800">
            {/* Centered Omada-style Teal Brand Logo */}
            <div className="text-center mb-7">
              <div className="inline-flex flex-col items-center">
                <span className="text-3xl font-bold tracking-tight text-[#005A5B] leading-none">
                  Joowifi
                </span>
                <span className="text-[10px] font-semibold text-[#005A5B] tracking-wide self-end mt-0.5">
                  by Ivoire Réseaux
                </span>
              </div>
            </div>

            {/* Heading & Register toggle */}
            <div className="mb-6">
              <h2 className="text-xl font-normal text-slate-800">
                {mode === 'login' ? 'Se connecter' : 'Créer un compte'}
              </h2>
              <p className="text-xs text-slate-500 mt-1.5">
                {mode === 'login' ? (
                  <>
                    Vous n'avez pas de compte ?{' '}
                    <button
                      type="button"
                      onClick={() => setMode('register')}
                      className="text-[#2563EB] hover:underline font-normal cursor-pointer"
                    >
                      S'inscrire
                    </button>
                  </>
                ) : (
                  <>
                    Vous avez déjà un compte ?{' '}
                    <button
                      type="button"
                      onClick={() => setMode('login')}
                      className="text-[#2563EB] hover:underline font-normal cursor-pointer"
                    >
                      Se connecter
                    </button>
                  </>
                )}
              </p>
            </div>

            {/* Clean Flat Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {mode === 'register' && (
                <div>
                  <label className="block text-slate-600 mb-1.5">
                    Nom de l'entreprise ou de l'opérateur
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Ivoire Hotspot Réseaux"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded bg-[#F5F7F9] border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#007A78] transition"
                  />
                </div>
              )}

              <div>
                <label className="block text-slate-600 mb-1.5">
                  Identifiant Joowifi (ID partenaire / Email)
                </label>
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError(false);
                  }}
                  className={`w-full px-3.5 py-2.5 rounded bg-[#F5F7F9] border text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white transition ${
                    emailError
                      ? 'border-rose-500 focus:border-rose-500'
                      : 'border-slate-200 focus:border-[#007A78]'
                  }`}
                />
                {emailError && (
                  <p className="text-[11px] text-rose-600 mt-1">Ce champ est requis.</p>
                )}
              </div>

              <div>
                <label className="block text-slate-600 mb-1.5">Mot de passe</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-3.5 pr-10 py-2.5 rounded bg-[#F5F7F9] border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#007A78] transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="text-right">
                <button
                  type="button"
                  onClick={handleDemoAdmin}
                  className="text-[11px] text-[#2563EB] hover:underline cursor-pointer"
                >
                  Mot de passe oublié ?
                </button>
              </div>

              {/* Flat Omada Mint/Teal Submit Button */}
              <button
                type="submit"
                className="w-full py-2.5 rounded bg-[#7BC4B2] hover:bg-[#007A78] text-white font-semibold text-xs transition cursor-pointer keep-white"
              >
                {mode === 'login' ? 'Se connecter' : "S'inscrire"}
              </button>
            </form>

            {/* Quick Corporate Demo Access */}
            <div className="mt-6 pt-5 border-t border-slate-100 space-y-2">
              <div className="text-[11px] text-slate-400 text-center">
                Accès direct démonstration B2B :
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleDemoAdmin}
                  className="py-2 px-3 rounded bg-[#F5F7F9] hover:bg-[#E6F4F3] border border-slate-200 text-[#005A5B] font-semibold text-[11px] transition cursor-pointer"
                >
                  Console SDN
                </button>
                <button
                  type="button"
                  onClick={handleDemoVendor}
                  className="py-2 px-3 rounded bg-[#F5F7F9] hover:bg-[#E6F4F3] border border-slate-200 text-[#005A5B] font-semibold text-[11px] transition cursor-pointer"
                >
                  Caisse POS
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Legal Footer Strip (Matches image_4390fb & image_439119) */}
      <div className="w-full px-6 py-3 text-center text-[11px] text-white/90 bg-black/25 flex flex-wrap items-center justify-center gap-4">
        <span>Copyright © 2026 Joowifi SDN Systems Inc. Tous droits réservés.</span>
        <span>|</span>
        <button onClick={closeAuthModal} className="hover:underline cursor-pointer">
          Assistance
        </button>
        <span>|</span>
        <button onClick={closeAuthModal} className="hover:underline cursor-pointer">
          Communauté
        </button>
        <span>|</span>
        <button onClick={closeAuthModal} className="hover:underline cursor-pointer">
          Conditions d'utilisation
        </button>
        <span>|</span>
        <button onClick={closeAuthModal} className="hover:underline cursor-pointer">
          Politique de confidentialité
        </button>
      </div>
    </div>
  );
};
