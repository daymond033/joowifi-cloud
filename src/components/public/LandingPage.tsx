import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Wifi,
  ShieldCheck,
  Smartphone,
  Server,
  Cpu,
  Radio,
  Globe,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  Play,
  Building2,
  GraduationCap,
  Hotel,
  ShoppingBag,
  Check,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { setCurrentSpace, setAdminTab, login } = useApp();

  // Split-Layout Cloud Portal Slide State (0 = Light Hardware Stack like image_4390fb, 1 = Dark Teal PtMP Bridge like image_439119)
  const [portalSlide, setPortalSlide] = useState<0 | 1>(0);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [emailErr, setEmailErr] = useState(false);

  const handleDirectPortalLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim()) {
      setEmailErr(true);
      return;
    }
    login(loginEmail.trim(), 'admin', 'Opérateur Joowifi SDN');
  };

  // B2B ROI Calculator
  const [dailyVouchers, setDailyVouchers] = useState<number>(80);
  const [voucherPrice, setVoucherPrice] = useState<number>(500);
  const [ispCost, setIspCost] = useState<number>(35000);
  const grossMonthly = dailyVouchers * voucherPrice * 30;
  const netMonthly = Math.max(0, Math.round(grossMonthly * 0.9 - ispCost));

  return (
    <div className="bg-white text-[#1E293B] select-none">
      {/* =========================================================================
          1. HERO CORPORATE B2B (Exact match to Screenshot 1: image_4390bc.jpg)
      ========================================================================= */}
      <section className="relative w-full min-h-[520px] sm:min-h-[560px] flex items-center justify-center overflow-hidden bg-[#1E293B]">
        {/* Background Enterprise Office Photography with Corporate Dark-Warm Filter */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-55"
          style={{
            backgroundImage:
              'url("https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1920&q=80")',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/35 to-black/60" />

        {/* Centered Crisp White Corporate Typography */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center text-white space-y-5 py-16 keep-white">
          <h1 className="text-3xl sm:text-5xl lg:text-[52px] font-normal tracking-tight leading-[1.18] text-white">
            Joowifi - La Solution SDN Parfaite pour
            <br />
            les PME et Opérateurs WiFi
          </h1>

          <p className="text-lg sm:text-2xl font-normal text-white/95 tracking-wide">
            Bureaux &nbsp;|&nbsp; Écoles &nbsp;|&nbsp; Restaurants &nbsp;|&nbsp; Hôtels &nbsp;|&nbsp; et Plus
          </p>

          <p className="text-sm sm:text-base font-normal text-gray-200">
            Passerelles MikroTik, Switches, Points d'Accès, Caisse POS et Contrôleurs Cloud
          </p>

          <div className="pt-3 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => setCurrentSpace('admin')}
              className="px-7 py-3 rounded bg-[#007A78] hover:bg-[#005A5B] text-white font-semibold text-sm transition cursor-pointer keep-white"
            >
              Accéder au Contrôleur Cloud
            </button>
            <button
              onClick={() => setCurrentSpace('pos')}
              className="px-7 py-3 rounded bg-white hover:bg-gray-100 text-[#005A5B] font-semibold text-sm transition cursor-pointer"
            >
              Ouvrir le Terminal POS
            </button>
          </div>
        </div>

        {/* Bottom-Left Floating White SDN Architecture Card (Exact match to image_4390bc.jpg) */}
        <div
          onClick={() => setCurrentSpace('admin')}
          className="hidden md:flex absolute left-8 bottom-6 z-20 w-72 h-40 bg-white rounded-xl shadow-2xl border border-slate-200 p-3 flex-col justify-between cursor-pointer group hover:scale-[1.02] transition"
        >
          <div className="flex items-center justify-between text-[10px] text-slate-600 font-semibold">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#007A78]" /> Passerelle MikroTik
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#007A78]" /> Contrôleur Cloud
            </span>
          </div>

          {/* Isometric Building & Nodes Diagram + Play Button */}
          <div className="relative flex-1 flex items-center justify-center my-1 bg-[#F4F7F9] rounded-lg border border-slate-200 overflow-hidden">
            <div className="grid grid-cols-3 gap-3 items-center w-full px-3 text-[9px] text-slate-600 font-medium text-center">
              <div>
                <div className="w-6 h-6 mx-auto rounded-full bg-[#007A78]/15 border border-[#007A78] flex items-center justify-center text-[#007A78] mb-0.5">
                  <Wifi className="w-3 h-3" />
                </div>
                <span>Points d'Accès</span>
              </div>
              <div>
                <div className="w-11 h-8 rounded-lg bg-[#FF0000] group-hover:bg-red-700 text-white flex items-center justify-center mx-auto shadow-md transition keep-white">
                  <Play className="w-4 h-4 fill-white text-white ml-0.5" />
                </div>
              </div>
              <div>
                <div className="w-6 h-6 mx-auto rounded-full bg-[#007A78]/15 border border-[#007A78] flex items-center justify-center text-[#007A78] mb-0.5">
                  <Server className="w-3 h-3" />
                </div>
                <span>Cloud SDN</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-500">
            <span>Architecture Zero-Port (Fast-Poll 10s)</span>
            <span className="text-[#007A78] font-bold">Voir le direct &rarr;</span>
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. PORTAIL CLOUD ID EN « SPLIT LAYOUT » (Exact match to Screenshots 3 & 4:
             image_4390fb.jpg & image_439119.jpg)
      ========================================================================= */}
      <section
        className="relative w-full py-16 sm:py-20 border-b border-slate-200 transition-colors duration-500"
        style={{
          background:
            portalSlide === 0
              ? 'linear-gradient(180deg, #F5F7FA 0%, #E6EAEF 80%, #C7CFD9 100%)'
              : 'linear-gradient(180deg, #163030 0%, #244847 68%, #DCE4E3 100%)',
        }}
      >
        {/* Left & Right Slide Switcher Arrows */}
        <button
          type="button"
          onClick={() => setPortalSlide(portalSlide === 0 ? 1 : 0)}
          className={`hidden lg:flex absolute left-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 items-center justify-center rounded-full transition cursor-pointer ${
            portalSlide === 0 ? 'text-slate-400 hover:text-slate-700' : 'text-white/60 hover:text-white'
          }`}
          title="Diapositive précédente"
        >
          <ChevronLeft className="w-8 h-8 stroke-[1.5]" />
        </button>

        <button
          type="button"
          onClick={() => setPortalSlide(portalSlide === 0 ? 1 : 0)}
          className={`hidden lg:flex absolute right-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 items-center justify-center rounded-full transition cursor-pointer ${
            portalSlide === 0 ? 'text-slate-400 hover:text-slate-700' : 'text-white/60 hover:text-white'
          }`}
          title="Diapositive suivante"
        >
          <ChevronRight className="w-8 h-8 stroke-[1.5]" />
        </button>

        <div className="max-w-6xl mx-auto px-4 sm:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* LEFT 7 COLUMNS: PRODUCT VISUAL & SITUATION SHOWCASE */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center justify-between">
              <div className="inline-flex flex-col">
                <span
                  className={`text-3xl font-bold tracking-tight leading-none ${
                    portalSlide === 0 ? 'text-[#2B2E33]' : 'text-white keep-white'
                  }`}
                >
                  Joowifi
                </span>
                <span
                  className={`text-[11px] font-semibold tracking-wide text-right mt-0.5 ${
                    portalSlide === 0 ? 'text-slate-600' : 'text-teal-200 keep-white'
                  }`}
                >
                  by Ivoire Réseaux
                </span>
              </div>

              {/* Slide Dots */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPortalSlide(0)}
                  className={`px-3 py-1 rounded text-xs font-medium cursor-pointer transition ${
                    portalSlide === 0
                      ? 'bg-[#007A78] text-white keep-white'
                      : 'bg-white/20 text-white hover:bg-white/30 keep-white'
                  }`}
                >
                  1. Passerelles Fusion
                </button>
                <button
                  type="button"
                  onClick={() => setPortalSlide(1)}
                  className={`px-3 py-1 rounded text-xs font-medium cursor-pointer transition ${
                    portalSlide === 1
                      ? 'bg-[#007A78] text-white keep-white'
                      : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  }`}
                >
                  2. Ponts Longue Portée PtMP
                </button>
              </div>
            </div>

            {portalSlide === 0 ? (
              /* SLIDE 1 : FUSION GATEWAYS (Matches image_4390fb.jpg) */
              <div className="space-y-4">
                <h2 className="text-3xl sm:text-4xl font-semibold text-[#1E293B] leading-tight">
                  <span className="text-[#007A78]">Passerelles Fusion</span> Au Cœur de
                  <br />
                  l'Entreprise Connectée
                </h2>
                <p className="text-sm text-slate-600">
                  Déployez rapidement. Évoluez simplement. Profitez d'une gestion Cloud sans ouverture de port.
                </p>

                {/* Clean Industrial Hardware Stack Illustration */}
                <div className="pt-4 flex flex-col sm:flex-row items-end gap-4">
                  {/* Cylindrical Controller */}
                  <div className="w-28 h-52 rounded-t-xl bg-gradient-to-r from-slate-300 via-slate-100 to-slate-300 border border-slate-400/70 shadow-md flex flex-col items-center justify-center p-3 shrink-0">
                    <div className="w-8 h-28 rounded bg-[#111827] border border-slate-600 p-1.5 flex flex-col items-center justify-between">
                      <span className="w-4 h-4 rounded-xs bg-emerald-500 flex items-center justify-center text-[8px] text-white font-bold keep-white">
                        99
                      </span>
                      <Globe className="w-3.5 h-3.5 text-cyan-400" />
                      <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                      <Cpu className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  </div>

                  {/* Stacked Rack Gateways */}
                  <div className="flex-1 space-y-2.5 w-full">
                    <div className="w-48 ml-auto h-11 rounded-lg bg-[#181C20] border border-slate-500 px-3 flex items-center justify-between shadow keep-white">
                      <span className="text-[10px] font-mono text-emerald-400">Santé 99%</span>
                      <div className="flex items-end gap-0.5 h-4">
                        {[45, 80, 60, 95, 70, 85, 75, 95].map((h, i) => (
                          <span
                            key={i}
                            className="w-1 bg-emerald-400"
                            style={{ height: `${h}%` }}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="w-60 ml-auto h-12 rounded-lg bg-[#181C20] border border-slate-500 px-4 flex items-center justify-between shadow keep-white">
                      <span className="text-[10px] font-mono text-cyan-300">Fast-Poll 10s</span>
                      <span className="text-[10px] font-mono text-emerald-400">Supabase 12/12</span>
                    </div>

                    <div className="w-72 ml-auto h-12 rounded-lg bg-[#181C20] border border-slate-500 px-4 flex items-center justify-between shadow keep-white">
                      <div className="flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 rounded bg-emerald-500 text-white text-[9px] font-bold">
                          WAN
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-sky-500 text-white text-[9px] font-bold">
                          WIFI
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-teal-500 text-white text-[9px] font-bold">
                          POS
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-300">MikroTik v7.24</span>
                    </div>

                    <div className="w-full h-14 rounded bg-gradient-to-b from-slate-200 to-slate-300 border border-slate-400 px-4 flex items-center justify-between shadow-md">
                      <div className="px-2.5 py-1 rounded bg-[#111827] text-emerald-400 font-mono text-[10px] keep-white">
                        PASSERELLE RACK PRO
                      </div>
                      <div className="grid grid-cols-6 gap-1">
                        {[1, 2, 3, 4, 5, 6].map((p) => (
                          <span key={p} className="w-3 h-2.5 bg-slate-700 rounded-xs" />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 inline-block p-3.5 rounded-lg bg-slate-700/80 text-white max-w-xs keep-white">
                  <div className="text-xs font-normal leading-snug">
                    Gestion Unifiée Réseau, Caisse POS & Surveillance en Un Seul Système
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentSpace('admin')}
                    className="text-[11px] text-[#4ADE80] hover:underline font-medium mt-1 inline-block cursor-pointer"
                  >
                    &#9656; Passerelles Joowifi Fusion
                  </button>
                </div>
              </div>
            ) : (
              /* SLIDE 2 : LONG-RANGE PTMP & MULTI-ZONE TRANSMISSION (Matches image_439119.jpg) */
              <div className="space-y-4 text-white keep-white">
                <h2 className="text-3xl sm:text-4xl font-semibold leading-tight text-white">
                  Transmission Wi-Fi Longue Portée PtMP & PtP,
                  <br />
                  Parfaite pour la Supervision et Plus
                </h2>
                <p className="text-sm text-teal-100/90">
                  Solution Professionnelle de Ponts Sans Fil Extérieurs et Hotspots Multi-Sites
                </p>

                <div className="pt-4 grid grid-cols-3 gap-4 items-center">
                  <div className="p-4 rounded-lg bg-white/10 border border-white/20 text-center space-y-1.5">
                    <div className="w-8 h-8 mx-auto rounded-full bg-[#005A5B] border border-teal-300 flex items-center justify-center">
                      <Radio className="w-4 h-4 text-teal-200" />
                    </div>
                    <div className="text-xs font-semibold">Marché Adjamé</div>
                    <div className="text-[10px] text-teal-200 font-mono">Pont 5 GHz Actif</div>
                  </div>

                  <div className="p-5 rounded-lg bg-white/15 border-2 border-teal-300 text-center space-y-2 shadow-lg">
                    <div className="w-10 h-10 mx-auto rounded-full bg-[#007A78] flex items-center justify-center">
                      <Server className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-xs font-bold">Station Centrale</div>
                    <div className="text-[10px] text-teal-200 font-mono">Sync Cloud 10s</div>
                  </div>

                  <div className="p-4 rounded-lg bg-white/10 border border-white/20 text-center space-y-1.5">
                    <div className="w-8 h-8 mx-auto rounded-full bg-[#005A5B] border border-teal-300 flex items-center justify-center">
                      <Wifi className="w-4 h-4 text-teal-200" />
                    </div>
                    <div className="text-xs font-semibold">Campus Cocody</div>
                    <div className="text-[10px] text-teal-200 font-mono">Kiosque POS Actif</div>
                  </div>
                </div>

                <div className="mt-4 inline-block p-3.5 rounded-lg bg-slate-900/65 text-white max-w-xs border border-white/15">
                  <div className="text-xs font-normal leading-snug">
                    Transmission Wi-Fi Longue Portée PtMP & PtP pour Multi-Zones
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentSpace('admin')}
                    className="text-[11px] text-[#4ADE80] hover:underline font-medium mt-1 inline-block cursor-pointer"
                  >
                    &#9656; Ponts Joowifi PtP & PtMP
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT 5 COLUMNS: PURE WHITE MINIMALIST LOGIN CARD (Matches image_4390fb & image_439119) */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="w-full max-w-[400px] bg-white rounded-lg shadow-xl border border-slate-200 px-8 py-10 text-slate-800">
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

              <div className="mb-6">
                <h3 className="text-xl font-normal text-slate-800">Se connecter</h3>
                <p className="text-xs text-slate-500 mt-1.5">
                  Vous n'avez pas de compte ?{' '}
                  <button
                    type="button"
                    onClick={() => setCurrentSpace('admin')}
                    className="text-[#2563EB] hover:underline cursor-pointer"
                  >
                    S'inscrire
                  </button>
                </p>
              </div>

              <form onSubmit={handleDirectPortalLogin} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-600 mb-1.5">
                    Identifiant Joowifi (ID partenaire)
                  </label>
                  <input
                    type="email"
                    placeholder="Email"
                    value={loginEmail}
                    onChange={(e) => {
                      setLoginEmail(e.target.value);
                      setEmailErr(false);
                    }}
                    className={`w-full px-3.5 py-2.5 rounded bg-[#F5F7F9] border text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white transition ${
                      emailErr
                        ? 'border-rose-500 focus:border-rose-500'
                        : 'border-slate-200 focus:border-[#007A78]'
                    }`}
                  />
                  {emailErr && (
                    <p className="text-[11px] text-rose-600 mt-1">Ce champ est requis.</p>
                  )}
                </div>

                <div>
                  <label className="block text-slate-600 mb-1.5">Mot de passe</label>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'}
                      placeholder="Mot de passe"
                      value={loginPass}
                      onChange={(e) => setLoginPass(e.target.value)}
                      className="w-full pl-3.5 pr-10 py-2.5 rounded bg-[#F5F7F9] border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#007A78] transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPass ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => setCurrentSpace('admin')}
                    className="text-[11px] text-[#2563EB] hover:underline cursor-pointer"
                  >
                    Mot de passe oublié ?
                  </button>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded bg-[#7BC4B2] hover:bg-[#007A78] text-white font-semibold text-xs transition cursor-pointer keep-white"
                >
                  Se connecter
                </button>
              </form>

              {/* Direct B2B Quick Launchers */}
              <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setCurrentSpace('admin')}
                  className="py-2 px-3 rounded bg-[#F5F7F9] hover:bg-[#E6F4F3] border border-slate-200 text-[#005A5B] font-semibold text-[11px] transition cursor-pointer"
                >
                  Console SDN &rarr;
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentSpace('pos')}
                  className="py-2 px-3 rounded bg-[#F5F7F9] hover:bg-[#E6F4F3] border border-slate-200 text-[#005A5B] font-semibold text-[11px] transition cursor-pointer"
                >
                  Caisse POS &rarr;
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. SECTION INSTITUTIONNELLE B2B SUR FOND BLANC PUR (#FFFFFF)
      ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-12 bg-white">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-[#007A78]">
            ARCHITECTURE MATÉRIELLE & LOGICIELLE UNIFIÉE
          </span>
          <h2 className="text-3xl sm:text-4xl font-semibold text-[#1E293B]">
            Une Plateforme SDN Conçue pour la Continuité de Service
          </h2>
          <p className="text-sm text-slate-600">
            Gérez vos routeurs MikroTik RouterOS (physiques ou virtuels CHR), vos stocks de vouchers et vos équipes de vendeurs depuis une interface institutionnelle claire.
          </p>
        </div>

        {/* 4 Clean White Corporate Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 bg-white rounded-lg border border-slate-200 space-y-3 hover:border-[#007A78] transition">
            <div className="w-10 h-10 rounded bg-[#E6F4F3] text-[#007A78] flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#1E293B]">Bureaux & PME</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Segmentation du trafic invité, exclusion FastTrack automatique et garantie de bande passante par profil utilisateur.
            </p>
          </div>

          <div className="p-6 bg-white rounded-lg border border-slate-200 space-y-3 hover:border-[#007A78] transition">
            <div className="w-10 h-10 rounded bg-[#E6F4F3] text-[#007A78] flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#1E293B]">Écoles & Campus</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Reconnexion transparente par Cookie MAC 30 jours et baux DHCP courts (1h) pour supporter des centaines d'étudiants.
            </p>
          </div>

          <div className="p-6 bg-white rounded-lg border border-slate-200 space-y-3 hover:border-[#007A78] transition">
            <div className="w-10 h-10 rounded bg-[#E6F4F3] text-[#007A78] flex items-center justify-center">
              <Hotel className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#1E293B]">Hôtels & Résidences</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Portail captif personnalisable aux couleurs de l'établissement et Bypass MAC permanent pour téléviseurs et caméras IP.
            </p>
          </div>

          <div className="p-6 bg-white rounded-lg border border-slate-200 space-y-3 hover:border-[#007A78] transition">
            <div className="w-10 h-10 rounded bg-[#E6F4F3] text-[#007A78] flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#1E293B]">Marchés & Galeries</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Terminal Caisse POS sur smartphone pour vos revendeurs avec livraison des codes sur le routeur MikroTik en moins de 10 secondes.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. SIMULATEUR DE RENTABILITÉ B2B SUR FOND CLAIR (#F4F6F8)
      ========================================================================= */}
      <section className="w-full bg-[#F4F6F8] border-t border-slate-200 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg border border-slate-200 p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center shadow-xs">
            <div className="lg:col-span-7 space-y-5">
              <span className="text-xs font-bold uppercase tracking-wider text-[#007A78]">
                OUTIL D'AIDE À LA DÉCISION B2B
              </span>
              <h2 className="text-2xl sm:text-3xl font-semibold text-[#1E293B]">
                Estimez le Rendement Net de Votre Déploiement SDN
              </h2>

              <div className="space-y-4 text-xs">
                <div>
                  <div className="flex justify-between font-semibold text-slate-700 mb-1.5">
                    <span>Volume quotidien de vouchers émis :</span>
                    <span className="text-[#007A78] font-mono font-bold">{dailyVouchers} tickets / jour</span>
                  </div>
                  <input
                    type="range"
                    min={15}
                    max={300}
                    step={5}
                    value={dailyVouchers}
                    onChange={(e) => setDailyVouchers(Number(e.target.value))}
                    className="w-full accent-[#007A78] cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between font-semibold text-slate-700 mb-1.5">
                    <span>Tarif unitaire moyen :</span>
                    <span className="text-[#007A78] font-mono font-bold">{voucherPrice.toLocaleString('fr-FR')} FCFA</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[200, 500, 1000, 2500].map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setVoucherPrice(p)}
                        className={`px-4 py-1.5 rounded text-xs font-semibold transition cursor-pointer ${
                          voucherPrice === p
                            ? 'bg-[#007A78] text-white keep-white'
                            : 'bg-[#F4F6F8] text-slate-700 border border-slate-300 hover:bg-slate-200'
                        }`}
                      >
                        {p} FCFA
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-semibold text-slate-700 mb-1.5">
                    <span>Charge mensuelle liaison FAI / Starlink :</span>
                    <span className="text-slate-700 font-mono font-bold">{ispCost.toLocaleString('fr-FR')} FCFA / mois</span>
                  </div>
                  <input
                    type="range"
                    min={15000}
                    max={100000}
                    step={5000}
                    value={ispCost}
                    onChange={(e) => setIspCost(Number(e.target.value))}
                    className="w-full accent-[#007A78] cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 p-6 rounded-lg bg-[#F8FAFC] border border-slate-200 space-y-4">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Résultat d'Exploitation Estimé (30 Jours)
              </div>
              <div>
                <div className="text-3xl font-bold text-[#005A5B] font-mono tabular-nums">
                  {netMonthly.toLocaleString('fr-FR')} FCFA
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Excédent net mensuel (après déduction FAI et commission revendeur 10%)
                </div>
              </div>

              <div className="space-y-2 pt-3 border-t border-slate-200 text-xs">
                <div className="flex items-center gap-2 text-slate-700">
                  <Check className="w-4 h-4 text-[#007A78]" />
                  <span>Recette brute : <strong>{grossMonthly.toLocaleString('fr-FR')} FCFA</strong></span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <Check className="w-4 h-4 text-[#007A78]" />
                  <span>Synchronisation Supabase (12 tables) incluse</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setCurrentSpace('admin');
                  setAdminTab('installation');
                }}
                className="w-full py-2.5 rounded bg-[#007A78] hover:bg-[#005A5B] text-white font-semibold text-xs transition cursor-pointer keep-white"
              >
                Configurer mon routeur MikroTik &rarr;
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
