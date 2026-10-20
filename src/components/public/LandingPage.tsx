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
  Activity,
  Calculator,
  Cpu,
  Radio,
  CheckCircle2,
  Layers,
  Globe,
  Terminal,
  Laptop,
  Lock,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { setCurrentSpace, setPublicTab, openAuthModal, heartbeatSecondsRemaining } = useApp();

  // Interactive SDN Topology Packet Simulation on Hero
  const [simStep, setSimStep] = useState<number>(0);
  const [lastSimCode, setLastSimCode] = useState<string>('JW-8492');
  const [simLogs, setSimLogs] = useState([
    { ts: '19:42:10', node: 'POS Kiosque', msg: 'Vente Pass Hebdo (2 500 FCFA) -> Code efdj' },
    { ts: '19:42:12', node: 'Supabase DB', msg: 'Insertion table public.tickets (router_synced=false)' },
    { ts: '19:42:18', node: 'MikroTik CHR', msg: 'Fast-Poll 10s -> /ip hotspot user add name="efdj" OK' },
  ]);

  const triggerTopologySimulation = () => {
    const newCode = `JW-${Math.floor(1000 + Math.random() * 8999)}`;
    setLastSimCode(newCode);
    setSimStep(1);
    setTimeout(() => setSimStep(2), 450);
    setTimeout(() => setSimStep(3), 900);
    setTimeout(() => {
      setSimStep(0);
      const now = new Date().toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      setSimLogs((prev) => [
        {
          ts: now,
          node: 'MikroTik v7',
          msg: `Fast-Poll 10s -> Ticket ${newCode} injecté dans Hotspot > Users !`,
        },
        prev[0],
        prev[1],
      ]);
      confetti({ particleCount: 35, spread: 55, origin: { x: 0.7, y: 0.4 } });
    }, 1400);
  };

  // Advanced ISP ROI & Net Profit Calculator (includes Starlink/ISP cost & vendor commission)
  const [dailyVouchers, setDailyVouchers] = useState<number>(75);
  const [avgVoucherPrice, setAvgVoucherPrice] = useState<number>(500);
  const [ispMonthlyCost, setIspMonthlyCost] = useState<number>(35000);
  const [vendorCommissionPct, setVendorCommissionPct] = useState<number>(10);

  const grossMonthly = dailyVouchers * avgVoucherPrice * 30;
  const vendorCommissionTotal = Math.round((grossMonthly * vendorCommissionPct) / 100);
  const netMonthlyProfit = Math.max(0, grossMonthly - ispMonthlyCost - vendorCommissionTotal);
  const breakEvenDays = Math.max(
    1,
    Math.ceil(ispMonthlyCost / Math.max(1, dailyVouchers * avgVoucherPrice * (1 - vendorCommissionPct / 100)))
  );

  return (
    <div className="space-y-24 pb-24 overflow-hidden">
      {/* =========================================================================
          1. HERO SECTION — ARCHITECTURE SDN MIKROTIK & TOPOLOGIE INTERACTIVE
      ========================================================================= */}
      <section className="relative pt-10 sm:pt-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left 7 Columns: Value Proposition */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>CONTRÔLEUR CLOUD SDN MIKROTIK • ROUTEROS v6 & v7</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.08]">
              L'OS Cloud qui pilote vos{' '}
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                Hotspots MikroTik
              </span>{' '}
              en temps réel.
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
              Déployez votre infrastructure WiFi commerciale en 60 secondes avec notre moteur{' '}
              <strong className="text-white">Fast-Poll 10s Zero-Port</strong>. Synchronisation directe avec{' '}
              <strong className="text-emerald-300">Supabase (12 tables)</strong>, terminal Caisse POS PWA pour vos vendeurs et portail captif Mobile Money intégré.
            </p>

            {/* Primary CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <button
                onClick={() => setCurrentSpace('admin')}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 text-slate-950 font-black text-sm flex items-center gap-2 shadow-xl shadow-emerald-500/20 transition cursor-pointer"
              >
                <span>Ouvrir la Console SDN</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>

              <button
                onClick={() => setCurrentSpace('pos')}
                className="px-5 py-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-white/15 text-white font-bold text-sm flex items-center gap-2 transition cursor-pointer"
              >
                <Smartphone className="w-4 h-4 text-cyan-400" />
                <span>Tester la Caisse POS Vendeur</span>
              </button>
            </div>

            {/* Key Architecture Badges */}
            <div className="grid grid-cols-3 gap-3 pt-4 max-w-xl">
              <div className="p-3 rounded-2xl bg-slate-950/70 border border-white/10">
                <div className="text-lg sm:text-xl font-black text-emerald-400 font-mono">10 sec</div>
                <div className="text-[11px] text-slate-400">Fast-Poll Ticket Sync</div>
              </div>
              <div className="p-3 rounded-2xl bg-slate-950/70 border border-white/10">
                <div className="text-lg sm:text-xl font-black text-cyan-400 font-mono">0 Port</div>
                <div className="text-[11px] text-slate-400">Compatible Starlink / 4G</div>
              </div>
              <div className="p-3 rounded-2xl bg-slate-950/70 border border-white/10">
                <div className="text-lg sm:text-xl font-black text-white font-mono">12 Tables</div>
                <div className="text-[11px] text-slate-400">PostgreSQL Temps Réel</div>
              </div>
            </div>
          </div>

          {/* Right 5 Columns: Interactive SDN Network Fabric Visualizer */}
          <div className="lg:col-span-5">
            <div className="p-6 rounded-3xl bento-card border border-emerald-500/30 space-y-5 relative">
              <div className="flex items-center justify-between border-b border-white/10 pb-3.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300 font-black text-xs">
                    SDN
                  </div>
                  <div>
                    <div className="text-xs font-extrabold text-white">
                      Topologie Joowifi Engine v5.1
                    </div>
                    <div className="text-[10px] text-emerald-400 font-mono">
                      Pull HTTPS • Cycle {heartbeatSecondsRemaining}s
                    </div>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  ONLINE
                </span>
              </div>

              {/* 3 Interactive Topology Nodes */}
              <div className="space-y-2.5">
                <div
                  className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                    simStep === 1
                      ? 'bg-emerald-950/70 border-emerald-400 scale-[1.02]'
                      : 'bg-slate-950/80 border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Smartphone className="w-5 h-5 text-cyan-400" />
                    <div>
                      <div className="text-xs font-bold text-white">1. Caisse POS Vendeur (PWA)</div>
                      <div className="text-[10px] text-slate-400">Émission voucher {lastSimCode}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-cyan-300 font-bold">Instant</span>
                </div>

                <div
                  className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                    simStep === 2
                      ? 'bg-emerald-950/70 border-emerald-400 scale-[1.02]'
                      : 'bg-slate-950/80 border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Server className="w-5 h-5 text-emerald-400" />
                    <div>
                      <div className="text-xs font-bold text-white">2. Base Cloud Supabase</div>
                      <div className="text-[10px] text-slate-400">File d'attente router_synced</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold">PostgreSQL</span>
                </div>

                <div
                  className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                    simStep === 3
                      ? 'bg-emerald-950/70 border-emerald-400 scale-[1.02]'
                      : 'bg-slate-950/80 border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Cpu className="w-5 h-5 text-purple-400" />
                    <div>
                      <div className="text-xs font-bold text-white">3. Routeur MikroTik (WinBox)</div>
                      <div className="text-[10px] text-slate-400">/ip hotspot user add {lastSimCode}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-purple-300 font-bold">&lt; 10s</span>
                </div>
              </div>

              {/* Live Telemetry Stream */}
              <div className="p-3 rounded-2xl bg-slate-950 border border-white/10 font-mono text-[10px] space-y-1.5">
                {simLogs.map((l, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-slate-300">
                    <span className="text-slate-500">[{l.ts}]</span>
                    <span className="text-emerald-400 font-bold">{l.node}:</span>
                    <span className="truncate">{l.msg}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={triggerTopologySimulation}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 text-slate-950 font-black text-xs flex items-center justify-center gap-2 cursor-pointer transition shadow-lg shadow-emerald-500/20"
              >
                <Zap className="w-4 h-4 stroke-[2.5]" />
                <span>SIMULER UN FLUX POS &rarr; SUPABASE &rarr; MIKROTIK</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. BENTO GRID : LES 6 INNOVATIONS EXCLUSIVES JOOWIFI FABRIC OS
      ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-400">
            INGÉNIERIE RÉSEAU & FINTECH
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white">
            Une architecture Bento pensée pour les opérateurs WiFi exigeants
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Chaque brique de Joowifi Cloud résout un problème réel de terrain : CGNAT Starlink, coupures de courant, fraude vendeur et saturation DHCP.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-6 rounded-3xl bento-card border border-white/10 space-y-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Terminal className="w-5 h-5" />
            </div>
            <h3 className="text-base font-extrabold text-white">
              Double Canal : Fast-Poll 10s + Heartbeat 45s
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Vos clients n'attendent plus devant le kiosque : dès qu'un vendeur encaisse sur son smartphone, le code voucher est injecté dans <code className="text-emerald-300">IP &rarr; Hotspot &rarr; Users</code> en moins de 10 secondes.
            </p>
          </div>

          <div className="p-6 rounded-3xl bento-card border border-white/10 space-y-3">
            <div className="w-11 h-11 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-extrabold text-white">
              Réconciliation d'Inventaire & Auto-Guérison
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Grâce à l'accusé de réception <code className="text-cyan-300">router_synced</code> et au gardien autonome <code className="text-cyan-300">jw_guardian</code>, même un routeur neuf ou réinitialisé récupère automatiquement tout son stock de tickets.
            </p>
          </div>

          <div className="p-6 rounded-3xl bento-card border border-white/10 space-y-3">
            <div className="w-11 h-11 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-extrabold text-white">
              Bypass FastTrack, Bail DHCP 1h & Cookie MAC
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Notre script place automatiquement la règle d'exclusion FastTrack en position 0 pour faire respecter vos débits (10M/3M) et fixe les baux DHCP à 1h pour éviter la saturation des 253 IP.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. CALCULATEUR DE RENTABILITÉ NETTE FAI / STARLINK (EXCLUSIF JOOWIFI)
      ========================================================================= */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 sm:p-10 rounded-3xl bento-card border border-emerald-500/30 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold">
              <Calculator className="w-3.5 h-3.5" />
              <span>SIMULATEUR DE RENTABILITÉ NETTE OPÉRATEUR</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Calculez votre Bénéfice Net après abonnement FAI & commissions vendeurs
            </h2>

            <div className="space-y-4 text-xs">
              <div>
                <div className="flex justify-between font-bold text-slate-200 mb-1.5">
                  <span>Tickets vendus par jour :</span>
                  <span className="text-emerald-400 font-mono">{dailyVouchers} tickets / jour</span>
                </div>
                <input
                  type="range"
                  min={15}
                  max={300}
                  step={5}
                  value={dailyVouchers}
                  onChange={(e) => setDailyVouchers(Number(e.target.value))}
                  className="w-full accent-emerald-400 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between font-bold text-slate-200 mb-1.5">
                  <span>Prix moyen du ticket :</span>
                  <span className="text-cyan-400 font-mono">{avgVoucherPrice.toLocaleString('fr-FR')} FCFA</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[200, 500, 1000, 2500].map((p) => (
                    <button
                      key={p}
                      onClick={() => setAvgVoucherPrice(p)}
                      className={`px-3.5 py-1.5 rounded-xl font-mono font-bold transition cursor-pointer ${
                        avgVoucherPrice === p
                          ? 'bg-emerald-500 text-slate-950'
                          : 'bg-slate-900 text-slate-300 border border-white/10'
                      }`}
                    >
                      {p} FCFA
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between font-bold text-slate-200 mb-1.5">
                  <span>Coût mensuel connexion FAI / Starlink :</span>
                  <span className="text-slate-300 font-mono">{ispMonthlyCost.toLocaleString('fr-FR')} FCFA / mois</span>
                </div>
                <input
                  type="range"
                  min={15000}
                  max={100000}
                  step={5000}
                  value={ispMonthlyCost}
                  onChange={(e) => setIspMonthlyCost(Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 p-6 rounded-2xl bg-slate-950/90 border border-emerald-500/30 space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Projection Mensuelle Nette (30 jours)
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-black text-emerald-400 font-mono tabular-nums">
                {netMonthlyProfit.toLocaleString('fr-FR')} FCFA
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Bénéfice net dans votre poche (après FAI & commissions {vendorCommissionPct}%)
              </div>
            </div>

            <div className="space-y-2 pt-3 border-t border-white/10 text-xs font-mono">
              <div className="flex justify-between text-slate-300">
                <span>Chiffre d'affaires brut :</span>
                <span>{grossMonthly.toLocaleString('fr-FR')} FCFA</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Commissions vendeurs ({vendorCommissionPct}%) :</span>
                <span>- {vendorCommissionTotal.toLocaleString('fr-FR')} FCFA</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Facture FAI / Starlink :</span>
                <span>- {ispMonthlyCost.toLocaleString('fr-FR')} FCFA</span>
              </div>
              <div className="flex justify-between text-cyan-300 font-bold pt-1">
                <span>Seuil de rentabilité atteint en :</span>
                <span>{breakEvenDays} jour(s) / mois</span>
              </div>
            </div>

            <button
              onClick={() => setCurrentSpace('admin')}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-600 text-slate-950 font-black text-xs cursor-pointer"
            >
              Déployer mon premier routeur maintenant &rarr;
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
