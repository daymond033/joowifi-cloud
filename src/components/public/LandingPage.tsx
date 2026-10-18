import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import confetti from 'canvas-confetti';
import {
  Wifi,
  ShieldCheck,
  Zap,
  TrendingUp,
  Smartphone,
  Server,
  ArrowRight,
  RotateCcw,
  Activity,
  Calculator,
  Play,
  Cpu,
  Radio,
  CheckCircle2,
  Clock,
  Sparkles,
  Layers,
  Globe,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { setCurrentSpace, setPublicTab, openAuthModal, heartbeatSecondsRemaining } = useApp();

  // 1. Theme preview switcher on Hero demo
  const [activeThemeColor, setActiveThemeColor] = useState<'orange' | 'cyan' | 'emerald' | 'purple'>('orange');

  const themePalettes = {
    orange: {
      name: 'Ambre Radiant',
      hex: '#F97316',
      glow: 'rgba(249, 115, 22, 0.22)',
      accent: 'text-amber-400',
      border: 'border-amber-500/30',
      badge: 'bg-amber-500/10 text-amber-400',
    },
    cyan: {
      name: 'Cyan Océan',
      hex: '#06B6D4',
      glow: 'rgba(6, 182, 212, 0.22)',
      accent: 'text-cyan-400',
      border: 'border-cyan-500/30',
      badge: 'bg-cyan-500/10 text-cyan-400',
    },
    emerald: {
      name: 'Émeraude Énergie',
      hex: '#10B981',
      glow: 'rgba(16, 185, 129, 0.22)',
      accent: 'text-emerald-400',
      border: 'border-emerald-500/30',
      badge: 'bg-emerald-500/10 text-emerald-400',
    },
    purple: {
      name: 'Violet Néon',
      hex: '#A855F7',
      glow: 'rgba(168, 85, 247, 0.22)',
      accent: 'text-purple-400',
      border: 'border-purple-500/30',
      badge: 'bg-purple-500/10 text-purple-400',
    },
  };

  const currentTheme = themePalettes[activeThemeColor];

  // Live feed simulation in Hero router mockup
  const [liveFeed, setLiveFeed] = useState([
    { time: '14:28:44', action: 'Heartbeat Pull reçu', target: 'MikroTik-Cocody' },
    { time: '14:28:19', action: 'Recharge Vendeur', target: 'Awa T. (+20 000 F)' },
    { time: '14:27:52', action: 'Ticket Caisse vendu', target: 'W-38F7 (200 F)' },
  ]);

  const [vendorBalance, setVendorBalance] = useState(25200);
  const [ticketSoldFlash, setTicketSoldFlash] = useState(false);

  // Trigger interactive 1-tap sale in the hero component
  const handleHeroSimulateSale = () => {
    setTicketSoldFlash(true);
    setVendorBalance((prev) => prev + 200);
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    const randCode = `W-${Math.floor(10 + Math.random() * 89)}${String.fromCharCode(
      65 + Math.floor(Math.random() * 26)
    )}${Math.floor(1 + Math.random() * 9)}`;

    setLiveFeed((prev) => [
      { time: timeStr, action: 'Ticket 1-Tap Vendu', target: `${randCode} (200 F)` },
      prev[0],
      prev[1],
    ]);

    confetti({
      particleCount: 25,
      spread: 45,
      origin: { x: 0.72, y: 0.38 },
      colors: [currentTheme.hex, '#F59E0B', '#10B981'],
    });

    setTimeout(() => setTicketSoldFlash(false), 900);
  };

  // 2. Financial Simulator State
  const [simCurrency, setSimCurrency] = useState<'XOF' | 'GNF'>('XOF');
  const [simDailyTickets, setSimDailyTickets] = useState<number>(60);
  const [simTicketPriceXof, setSimTicketPriceXof] = useState<number>(200); // 200 FCFA

  // Conversion rate: 1 FCFA ≈ 13.5 GNF
  const gnfMultiplier = 13.5;
  const currentPrice = simCurrency === 'XOF' ? simTicketPriceXof : Math.round(simTicketPriceXof * gnfMultiplier);

  const dailyTurnover = simDailyTickets * currentPrice;
  const monthlyTurnover = dailyTurnover * 30;
  const vendorCommission = Math.round(monthlyTurnover * 0.1); // 10% commission vendeurs
  const netOperatorTurnover = monthlyTurnover - vendorCommission;

  const formatSimValue = (val: number) => {
    return `${val.toLocaleString('fr-FR')} ${simCurrency === 'XOF' ? 'FCFA' : 'GNF'}`;
  };

  return (
    <div className="space-y-28 pb-20">
      {/* =========================================================================
          1. HERO SECTION & INTERACTIVE DEMONSTRATION
      ========================================================================= */}
      <section className="relative pt-8 sm:pt-16 pb-12 overflow-hidden">
        {/* Soft atmospheric ambient glow */}
        <div
          className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[450px] blur-[160px] rounded-full -z-10 pointer-events-none transition-all duration-700 opacity-20"
          style={{ backgroundColor: currentTheme.hex }}
        />
        <div className="absolute top-1/3 right-10 w-[450px] h-[350px] bg-amber-500/10 blur-[140px] rounded-full -z-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Proposition de valeur & CTAs (7 cols) */}
            <div className="lg:col-span-7 space-y-7 text-left">
              {/* Territorial Trust Line (Clean unboxed metadata) */}
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                <span className="font-semibold text-amber-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Afrique de l'Ouest
                </span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span>Côte d'Ivoire</span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span>Guinée</span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span>Sénégal</span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span>Bénin</span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span>Mali</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-[1.08] font-sans" style={{ textWrap: 'balance' }}>
                Pilotez vos{' '}
                <span className="bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 bg-clip-text text-transparent">
                  Hotspots WiFi
                </span>{' '}
                MikroTik depuis le Cloud.
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-slate-300 max-w-xl font-normal leading-relaxed">
                Générez vos tickets, vendez sur smartphone avec la{' '}
                <strong className="text-white font-semibold">Caisse POS Vendeurs</strong> et pilotez
                vos routeurs à distance sans ouvrir de ports ni VPN.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-1">
                <button
                  onClick={() => openAuthModal('register')}
                  className="px-7 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-extrabold text-sm shadow-xl shadow-amber-500/25 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Commencer gratuitement</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setCurrentSpace('admin')}
                  className="px-6 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-800 font-semibold text-sm transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Play className="w-4 h-4 text-emerald-400 fill-emerald-400/20" />
                  <span>Explorer la Démo (1-Clic)</span>
                </button>
              </div>

              {/* Bottom 3-pillar metrics */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-900 max-w-lg">
                <div>
                  <div className="text-base sm:text-lg font-black text-white font-mono tabular-nums">100%</div>
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
                    Modèle Cloud Pull
                  </div>
                </div>

                <div>
                  <div className="text-base sm:text-lg font-black text-amber-400 font-mono tabular-nums">
                    FCFA / GNF
                  </div>
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
                    Devises Locales
                  </div>
                </div>

                <div>
                  <div className="text-base sm:text-lg font-black text-emerald-400 font-mono tabular-nums">
                    PWA POS
                  </div>
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
                    Caisse Vendeur
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Composant Interactif Console Routeur (5 cols) */}
            <div className="lg:col-span-5 relative">
              {/* Theme selector on top of mockup */}
              <div className="flex items-center justify-between mb-3 px-1 text-xs">
                <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                  <span>Ambiance :</span>
                  <span className="font-semibold text-slate-200">{currentTheme.name}</span>
                </span>
                <div className="flex items-center gap-1.5 bg-slate-900/90 px-2.5 py-1.5 rounded-lg border border-slate-800">
                  {(Object.keys(themePalettes) as (keyof typeof themePalettes)[]).map((colKey) => (
                    <button
                      key={colKey}
                      onClick={() => setActiveThemeColor(colKey)}
                      title={themePalettes[colKey].name}
                      className={`w-3.5 h-3.5 rounded-full transition-transform cursor-pointer ${
                        activeThemeColor === colKey ? 'scale-125 ring-2 ring-white/70' : 'hover:scale-110 opacity-70'
                      }`}
                      style={{ backgroundColor: themePalettes[colKey].hex }}
                    />
                  ))}
                </div>
              </div>

              {/* Mockup Card */}
              <div
                className="rounded-3xl bg-slate-950/95 border border-slate-800/90 p-5 sm:p-6 shadow-2xl relative overflow-hidden transition-all duration-500"
                style={{
                  boxShadow: `0 0 60px -15px ${currentTheme.glow}`,
                }}
              >
                {/* Console header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center font-black text-slate-950 text-xs shadow-md transition-colors"
                      style={{ backgroundColor: currentTheme.hex }}
                    >
                      J
                    </div>
                    <div>
                      <span className="font-bold text-xs text-white uppercase tracking-wider block font-sans">
                        Joowifi Cloud Console
                      </span>
                      <span className="text-[10px] text-slate-400">
                        MikroTik RouterOS v7.14
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-mono text-emerald-400 font-bold tabular-nums">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    <span>PULL {heartbeatSecondsRemaining}s</span>
                  </div>
                </div>

                {/* Top Row: Routeur Actif + Clients Connectés */}
                <div className="grid grid-cols-2 gap-3 my-4">
                  <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase font-semibold">
                      <span>Routeur Actif</span>
                      <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <div className="text-xs font-bold text-white truncate">RB750Gr3 / hAP ax²</div>
                    <div className="text-[10px] text-slate-400 font-mono">Uptime: 14j 08h · CGNAT</div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase font-semibold">
                      <span>Sessions Actives</span>
                      <Activity className="w-3.5 h-3.5 text-blue-400" />
                    </div>
                    <div className="text-xs font-bold text-white">18 utilisateurs</div>
                    <div className="text-[10px] text-slate-400 font-mono tabular-nums">Débit: 34.2 Mbps</div>
                  </div>
                </div>

                {/* Bottom Split: Live Feed + POS Mobile */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Left: Live Feed */}
                  <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2 text-[10px] font-mono">
                    <div className="flex items-center justify-between text-slate-400 pb-1 border-b border-slate-800">
                      <span className="text-slate-300 font-bold">Activité en direct</span>
                      <span className="text-[9px] text-emerald-400">HTTPS Pull</span>
                    </div>

                    <div className="space-y-1.5 text-slate-300">
                      {liveFeed.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-[10px] truncate">
                          <span className="text-slate-500 tabular-nums">[{item.time}]</span>
                          <span className="truncate mx-1">{item.action}</span>
                          <span className="text-amber-400 font-semibold">{item.target}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right: POS Mobile Card */}
                  <div
                    className={`p-3.5 rounded-2xl border flex flex-col justify-between transition-all ${
                      ticketSoldFlash
                        ? 'bg-amber-500/20 border-amber-500/50 scale-[1.02]'
                        : 'bg-slate-900/80 border-slate-800/80'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span className="flex items-center gap-1 font-semibold text-slate-300">
                          <Smartphone className="w-3 h-3 text-amber-400" /> Caisse POS
                        </span>
                        <span className="text-[10px] font-bold text-emerald-400">En ligne</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-2 uppercase">Solde Vendeur</div>
                      <div className="text-base font-black text-emerald-400 font-mono tabular-nums">
                        {vendorBalance.toLocaleString('fr-FR')} FCFA
                      </div>
                    </div>

                    <button
                      onClick={handleHeroSimulateSale}
                      className="mt-3 w-full py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold text-[10px] transition active:scale-95 flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Zap className="w-3 h-3" />
                      <span>Ticket 1-Tap Vendu</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. SECTION EXPLICATIVE & ARCHITECTURE CLOUD (Connecté au cloud. Zéro configuration)
      ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
            Architecture Cloud & Zero-Trust
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-white font-sans tracking-tight" style={{ textWrap: 'balance' }}>
            Connecté au cloud. Zéro configuration.
          </h2>

          <p className="text-sm text-slate-400 leading-relaxed">
            L'architecture de Joowifi a été spécialement conçue pour s'intégrer sans toucher à vos
            paramètres réseau, même sur les connexions mobiles et 4G les plus restrictives.
          </p>
        </div>

        {/* 2-Column Layout matching the market standard reference */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: 2 Advantage Cards (6 cols) */}
          <div className="lg:col-span-6 space-y-5">
            {/* Card 1: Sécurité Maximale (Modèle Pull) */}
            <div className="p-6 sm:p-7 rounded-2xl glass-card border border-slate-800/90 space-y-3 hover:border-slate-700 transition">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20 shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white">
                  Sécurité Maximale (Modèle Pull)
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                C'est votre routeur MikroTik qui initie la connexion sortante HTTPS vers le cloud
                toutes les 45 secondes. Zéro port entrant à ouvrir, aucun VPN requis. Votre réseau
                reste totalement étanche face aux attaques extérieures.
              </p>
            </div>

            {/* Card 2: Compatible tout FAI (CGNAT) */}
            <div className="p-6 sm:p-7 rounded-2xl glass-card border border-slate-800/90 space-y-3 hover:border-slate-700 transition">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20 shrink-0">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white">
                  Compatible tout FAI & CGNAT
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Que vous soyez sur une fibre optique, de l'ADSL ou un modem 4G/5G Orange, MTN, Moov
                ou Telecel, Joowifi fonctionne immédiatement. L'absence d'adresse IP publique ou fixe
                n'est plus un obstacle.
              </p>
            </div>
          </div>

          {/* Right: Chronological Timeline 01 -> 02 -> 03 (6 cols) */}
          <div className="lg:col-span-6 space-y-8 pl-0 lg:pl-6 pt-2">
            {/* Step 01 */}
            <div className="flex items-start gap-4">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full border border-amber-500/40 bg-amber-500/10 text-amber-400 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                  01
                </div>
                <div className="w-px h-16 bg-slate-800 my-2" />
              </div>
              <div className="space-y-1 pt-1">
                <h4 className="text-base font-bold text-white">Configurez vos forfaits</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Créez vos formules de connexion (1h, 24h, 7 jours, volume ou illimité) et vos
                  tarifs en FCFA ou GNF depuis votre console web Joowifi.
                </p>
              </div>
            </div>

            {/* Step 02 */}
            <div className="flex items-start gap-4">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full border border-amber-500/40 bg-amber-500/10 text-amber-400 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                  02
                </div>
                <div className="w-px h-16 bg-slate-800 my-2" />
              </div>
              <div className="space-y-1 pt-1">
                <h4 className="text-base font-bold text-white">Collez le script MikroTik</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Copiez le script de synchronisation généré en 1 clic et collez-le directement dans
                  le terminal RouterOS de votre MikroTik.
                </p>
              </div>
            </div>

            {/* Step 03 */}
            <div className="flex items-start gap-4">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                  03
                </div>
              </div>
              <div className="space-y-1 pt-1">
                <h4 className="text-base font-bold text-white">Synchronisation automatique</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Vos forfaits, tickets et règles de pare-feu descendent sur le routeur. Vos
                  vendeurs peuvent encaisser immédiatement sur smartphone.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. SIMULATEUR FINANCIER INTERACTIF (Estimez vos Revenus Mensuels WiFi)
      ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-slate-950/95 border border-slate-800/90 shadow-2xl relative overflow-hidden">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
            <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center justify-center gap-1.5">
              <Calculator className="w-3.5 h-3.5" />
              <span>Simulateur Financier Interactif</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-sans tracking-tight" style={{ textWrap: 'balance' }}>
              Estimez vos{' '}
              <span className="text-amber-500">Revenus Mensuels</span> WiFi
            </h2>

            <p className="text-xs sm:text-sm text-slate-400">
              Calculez en temps réel votre chiffre d'affaires potentiel selon le volume de tickets
              vendus sur votre réseau d'accès.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Controls: Currency toggle & Sliders (7 cols) */}
            <div className="lg:col-span-7 space-y-7">
              {/* Currency Selector */}
              <div className="flex items-center gap-3 text-xs">
                <span className="font-semibold text-slate-400 uppercase tracking-wider text-[11px]">
                  Devise de calcul :
                </span>
                <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800">
                  <button
                    onClick={() => setSimCurrency('XOF')}
                    className={`px-3.5 py-1.5 rounded-lg font-bold text-xs transition cursor-pointer ${
                      simCurrency === 'XOF'
                        ? 'bg-amber-500 text-slate-950 shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    FCFA (XOF)
                  </button>
                  <button
                    onClick={() => setSimCurrency('GNF')}
                    className={`px-3.5 py-1.5 rounded-lg font-bold text-xs transition cursor-pointer ${
                      simCurrency === 'GNF'
                        ? 'bg-amber-500 text-slate-950 shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    GNF (Guinée)
                  </button>
                </div>
              </div>

              {/* Slider 1: Tickets vendus par jour */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <label className="text-slate-300 font-medium">Tickets vendus par jour :</label>
                  <span className="font-extrabold text-amber-500 text-base font-mono tabular-nums">
                    {simDailyTickets} tickets / jour
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="400"
                  step="5"
                  value={simDailyTickets}
                  onChange={(e) => setSimDailyTickets(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-900 rounded-lg"
                />
                <div className="flex justify-between text-[11px] text-slate-500 font-mono tabular-nums">
                  <span>10 tickets</span>
                  <span>200 tickets</span>
                  <span>400 tickets</span>
                </div>
              </div>

              {/* Slider 2: Prix moyen du ticket */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <label className="text-slate-300 font-medium">
                    Prix moyen du ticket ({simCurrency === 'XOF' ? 'FCFA' : 'GNF'}) :
                  </label>
                  <span className="font-extrabold text-emerald-400 text-base font-mono tabular-nums">
                    {currentPrice.toLocaleString('fr-FR')} {simCurrency === 'XOF' ? 'FCFA' : 'GNF'}
                  </span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="1000"
                  step="50"
                  value={simTicketPriceXof}
                  onChange={(e) => setSimTicketPriceXof(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-900 rounded-lg"
                />
                <div className="flex justify-between text-[11px] text-slate-500 font-mono tabular-nums">
                  <span>{simCurrency === 'XOF' ? '100 FCFA' : '1 350 GNF'}</span>
                  <span>{simCurrency === 'XOF' ? '500 FCFA' : '6 750 GNF'}</span>
                  <span>{simCurrency === 'XOF' ? '1 000 FCFA' : '13 500 GNF'}</span>
                </div>
              </div>
            </div>

            {/* Right Summary Card (5 cols) */}
            <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 p-7 rounded-3xl space-y-6">
              <div>
                <div className="flex items-center gap-2 text-amber-500 text-xs font-bold uppercase tracking-wider">
                  <TrendingUp className="w-4 h-4" />
                  <span>Chiffre d'Affaires Estimé</span>
                </div>
                <span className="text-xs text-slate-400 block mt-3">Revenu mensuel potentiel brut :</span>
                <div className="text-3xl sm:text-4xl font-black text-amber-500 font-mono tabular-nums tracking-tight mt-1">
                  {monthlyTurnover.toLocaleString('fr-FR')}{' '}
                  <span className="text-lg text-amber-400 font-bold">
                    {simCurrency === 'XOF' ? 'FCFA' : 'GNF'}
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-xs pt-3 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Revenu journalier moyen :</span>
                  <span className="font-mono font-bold text-white text-sm tabular-nums">
                    {formatSimValue(dailyTurnover)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Part nette opérateur (-10% commission) :</span>
                  <span className="font-mono font-bold text-emerald-400 tabular-nums">
                    {formatSimValue(netOperatorTurnover)}
                  </span>
                </div>
              </div>

              <button
                onClick={() => openAuthModal('register')}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-xs transition cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25"
              >
                <span>Lancer mon réseau WiFi</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <p className="text-center text-[11px] text-slate-500 mt-8">
            Estimation indicative de chiffre d'affaires hors charges de connexion FAI. Taux indicatif 1 FCFA ≈ 13.5 GNF.
          </p>
        </div>
      </section>

      {/* =========================================================================
          4. RETOUR D'EXPÉRIENCE OPÉRATEURS AFRIQUE DE L'OUEST
      ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
          <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
            Témoignages Opérateurs
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white" style={{ textWrap: 'balance' }}>
            Ils rentabilisent leur réseau avec Joowifi
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl glass-card border border-slate-800/80 space-y-4">
            <p className="text-xs text-slate-300 leading-relaxed italic">
              « À Yopougon, avant Joowifi, je devais me déplacer physiquement pour chaque panne ou
              générer des tickets manuellement sur WinBox. Maintenant mes 4 vendeurs émettent les
              tickets directement depuis leur smartphone et mon chiffre a doublé en 2 mois. »
            </p>
            <div className="flex items-center gap-3 pt-2 border-t border-slate-800/60">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-xs">
                AK
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Amadou Koné</h4>
                <p className="text-[10px] text-slate-400">Réseau 6 Hotspots · Abidjan Maroc</p>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl glass-card border border-slate-800/80 space-y-4">
            <p className="text-xs text-slate-300 leading-relaxed italic">
              « Le fait qu'il n'y ait aucun port à ouvrir sur mon modem Orange 4G a tout changé. Mon
              routeur est derrière un CGNAT et la communication vers Joowifi Cloud se fait sans
              accroc toutes les 45 secondes. Bravo à Joo studio pour cette stabilité. »
            </p>
            <div className="flex items-center gap-3 pt-2 border-t border-slate-800/60">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-xs">
                SD
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Salif Diallo</h4>
                <p className="text-[10px] text-slate-400">Cybercafé & Résidence · Conakry</p>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl glass-card border border-slate-800/80 space-y-4">
            <p className="text-xs text-slate-300 leading-relaxed italic">
              « Le module de retrait de gains vers Wave et Orange Money est instantané. Je vois en
              direct les personnes qui payent sur le portail captif et je reçois les alertes sur mon
              Telegram dès qu'une coupure électrique survient à Bouaké. »
            </p>
            <div className="flex items-center gap-3 pt-2 border-t border-slate-800/60">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center text-xs">
                MY
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Mariam Yao</h4>
                <p className="text-[10px] text-slate-400">Gestionnaire Multi-sites · Bouaké</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. CTA FINAL DE FIN DE PAGE (Prêt à transformer votre WiFi...)
      ========================================================================= */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 pt-6">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/10">
          <Wifi className="w-6 h-6" />
        </div>

        <h2 className="text-3xl sm:text-5xl font-extrabold text-white font-sans max-w-2xl mx-auto leading-tight" style={{ textWrap: 'balance' }}>
          Prêt à transformer votre WiFi en source de revenus ?
        </h2>

        <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
          Rejoignez les opérateurs qui ont choisi Joowifi pour gérer leurs hotspots MikroTik.
          Inscription gratuite, aucune carte bancaire requise.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
          <button
            onClick={() => openAuthModal('register')}
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-xs shadow-xl shadow-amber-500/20 transition cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Créer mon compte gratuitement</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              setCurrentSpace('public');
              setPublicTab('contact');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold transition cursor-pointer"
          >
            Contacter un conseiller (+225 01 00 44 38 39)
          </button>
        </div>
      </section>
    </div>
  );
};
