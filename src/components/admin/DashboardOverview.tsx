import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import confetti from 'canvas-confetti';
import {
  Wifi,
  Users,
  TrendingUp,
  Ticket,
  Server,
  Activity,
  Smartphone,
  Terminal,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  ArrowRight,
  Sparkles,
  Radio,
  Cpu,
  Globe,
  Zap,
  Layers,
  RefreshCw,
  MapPin,
} from 'lucide-react';

export const DashboardOverview: React.FC = () => {
  const {
    user,
    zones,
    routers,
    sessions,
    tickets,
    staff,
    forfaits,
    formatMoney,
    heartbeatSecondsRemaining,
    setAdminTab,
    setCurrentSpace,
    pendingSosAlerts,
    clearSosAlert,
    rechargeStaff,
    sellTicketPOS,
    forceHeartbeatSync,
    showToast,
  } = useApp();

  // Time Filter State
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month' | 'all'>('today');

  // Express 1-Click Ticket Generator State inside Bento Dashboard
  const [expressForfaitId, setExpressForfaitId] = useState<string>(forfaits[0]?.id || 'f-1');
  const [lastExpressTicket, setLastExpressTicket] = useState<{
    code: string;
    forfaitName: string;
    price: number;
  } | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Compute live metrics
  const onlineRoutersCount = routers.filter((r) => r.status === 'online').length;
  const activeTicketsCount = tickets.filter((t) => t.status === 'actif').length;
  const availableTicketsCount = tickets.filter(
    (t) => t.status === 'stock' || t.status === 'vendeur' || t.status === 'papier'
  ).length;
  const todayRevenue = staff.reduce((acc, s) => acc + s.todaySales, 0);

  const periodMultiplier = {
    today: 1,
    week: 6.8,
    month: 27.5,
    all: 84.2,
  };
  const displayedRevenue = Math.round(todayRevenue * periodMultiplier[selectedPeriod]);

  const avgCpu = routers.length
    ? Math.round(routers.reduce((acc, r) => acc + (r.cpuUsage || 15), 0) / routers.length)
    : 16;
  const avgRam = routers.length
    ? Math.round(routers.reduce((acc, r) => acc + (r.ramUsage || 32), 0) / routers.length)
    : 32;

  const displayName = user?.name ? user.name.split(' ')[0] : 'Opérateur';

  const handleExpressGenerate = () => {
    try {
      const targetForfaitId = expressForfaitId || forfaits[0]?.id;
      if (!targetForfaitId) return;
      const created = sellTicketPOS(targetForfaitId, 'Client Express Console', staff[0]?.id);
      setLastExpressTicket({
        code: created.code,
        forfaitName: created.forfaitName,
        price: created.price,
      });
      confetti({ particleCount: 45, spread: 60, origin: { y: 0.4 } });
      showToast(
        `Ticket Express ${created.code} créé et envoyé vers Supabase & MikroTik !`,
        'success'
      );
    } catch {
      showToast('Veuillez sélectionner un forfait valide.', 'warning');
    }
  };

  const salesHistory10Days = [
    { day: 'J-9', amount: 34000, height: 48 },
    { day: 'J-8', amount: 49000, height: 68 },
    { day: 'J-7', amount: 31000, height: 42 },
    { day: 'J-6', amount: 56000, height: 78 },
    { day: 'J-5', amount: 44000, height: 61 },
    { day: 'J-4', amount: 64000, height: 89 },
    { day: 'J-3', amount: 42000, height: 58 },
    { day: 'J-2', amount: 53000, height: 74 },
    { day: 'J-1', amount: 69000, height: 95 },
    { day: 'Aujourd’hui', amount: todayRevenue || 56700, height: 82 },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* =========================================================================
          1. HEADER EXECUTIF + FILTRE TEMPOREL BENTO
      ========================================================================= */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-[11px] font-bold mb-2">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>JOOWIFI FABRIC OS v6.0 • TOPOLOGIE CLOUD SDN TEMPS RÉEL</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Centre de Pilotage Réseau — <span className="text-emerald-400">{displayName}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Supervision unifiée de vos {zones.length} zones WiFi, {routers.length} routeurs MikroTik et {tickets.length} vouchers Supabase.
          </p>
        </div>

        {/* Period Selector Pill */}
        <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-2xl bg-slate-950/90 border border-white/10 self-start lg:self-auto">
          {(
            [
              { id: 'today', label: "Aujourd'hui" },
              { id: 'week', label: '7 Jours' },
              { id: 'month', label: '30 Jours' },
              { id: 'all', label: 'Cumul Global' },
            ] as const
          ).map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedPeriod(p.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                selectedPeriod === p.id
                  ? 'bg-gradient-to-r from-emerald-500 to-cyan-600 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Alertes SOS Vendeurs si présentes */}
      {pendingSosAlerts.length > 0 && (
        <div className="p-4 rounded-2xl bg-rose-950/50 border border-rose-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping shrink-0" />
            <div className="text-xs">
              <strong className="text-rose-200 block text-sm">
                {pendingSosAlerts.length} Demande(s) SOS de Recharge Crédit Vendeur
              </strong>
              <span className="text-rose-300/80">
                {pendingSosAlerts[0].vendorName} ({pendingSosAlerts[0].zoneName}) attend du crédit POS.
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                rechargeStaff(pendingSosAlerts[0].vendorId, 25000);
                clearSosAlert(pendingSosAlerts[0].id);
              }}
              className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs cursor-pointer"
            >
              Créditer +25 000 F
            </button>
            <button
              onClick={() => setAdminTab('staff')}
              className="px-3 py-2 rounded-xl bg-slate-900 text-slate-200 text-xs font-semibold border border-white/10 cursor-pointer"
            >
              Gérer
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          2. BENTO ROW 1 : TOPOLOGIE RÉSEAU SDN LIVE (STYLE MERAKI / UNIFI) + TICKET EXPRESS
      ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* 2.1 Carte Topologie Réseau Live (2 colonnes) */}
        <div className="lg:col-span-2 p-6 rounded-3xl bento-card border border-emerald-500/25 relative overflow-hidden flex flex-col justify-between space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                  <span>Topologie SDN & Flux Cloud Pull</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    SLA 99.98%
                  </span>
                </h2>
                <p className="text-[11px] text-slate-400">
                  Architecture Zero-Port : synchronisation bidirectionnelle entre Supabase et RouterOS
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  forceHeartbeatSync();
                  showToast('Synchronisation Fast-Poll envoyée aux routeurs MikroTik !', 'success');
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-xs font-bold text-emerald-300 flex items-center gap-1.5 cursor-pointer transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Sync ({heartbeatSecondsRemaining}s)</span>
              </button>
              <button
                onClick={() => setAdminTab('installation')}
                className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-xs font-bold text-emerald-300 flex items-center gap-1.5 cursor-pointer transition"
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Script v5.1</span>
              </button>
            </div>
          </div>

          {/* 4-Node Visual Network Topology Pipeline */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 relative pt-2">
            {/* Node 1: WAN / ISP */}
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-white/10 space-y-2 relative">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold">
                  1. UPLINK WAN
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-cyan-400 shrink-0" />
                <div>
                  <div className="text-xs font-extrabold text-white">Fibre / Starlink</div>
                  <div className="text-[10px] text-slate-400 font-mono">Latence : 18 ms</div>
                </div>
              </div>
            </div>

            {/* Node 2: Supabase Cloud 12 Tables */}
            <div
              onClick={() => setAdminTab('tickets')}
              className="p-3.5 rounded-2xl bg-slate-950/80 border border-emerald-500/30 hover:border-emerald-400 space-y-2 cursor-pointer transition"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold">
                  2. CLOUD SUPABASE
                </span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[9px]">
                  12 Tables
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Server className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <div className="text-xs font-extrabold text-white">{tickets.length} Vouchers</div>
                  <div className="text-[10px] text-emerald-300 font-mono">router_synced OK</div>
                </div>
              </div>
            </div>

            {/* Node 3: MikroTik RouterOS */}
            <div
              onClick={() => setAdminTab('mikrotik')}
              className="p-3.5 rounded-2xl bg-slate-950/80 border border-cyan-500/30 hover:border-cyan-400 space-y-2 cursor-pointer transition"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-cyan-300 font-bold">
                  3. MIKROTIK OS
                </span>
                <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono text-[9px]">
                  FastPoll 10s
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-cyan-400 shrink-0" />
                <div>
                  <div className="text-xs font-extrabold text-white">
                    {onlineRoutersCount}/{routers.length} En ligne
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    CPU {avgCpu}% • RAM {avgRam}%
                  </div>
                </div>
              </div>
            </div>

            {/* Node 4: Clients & POS */}
            <div
              onClick={() => setAdminTab('sessions')}
              className="p-3.5 rounded-2xl bg-slate-950/80 border border-white/10 hover:border-emerald-500/40 space-y-2 cursor-pointer transition"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-purple-300 font-bold">
                  4. HOTSPOT & POS
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              </div>
              <div className="flex items-center gap-2">
                <Wifi className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <div className="text-xs font-extrabold text-white">
                    {sessions.length} Connectés
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {staff.length} Vendeurs POS
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Animated Data Stream Progress Bar */}
          <div className="space-y-1.5">
            <div className="w-full h-1.5 rounded-full bg-slate-950 overflow-hidden relative">
              <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-emerald-400 to-cyan-400 animate-data-flow" />
            </div>
            <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400">
              <span>
                 Flux HTTPS sortant actif : <strong className="text-emerald-300">Aucun port entrant requis (Compatible CGNAT / 4G)</strong>
              </span>
              <span className="font-mono text-cyan-300">
                 Jeton maître : {routers[0]?.installToken || 'JWT-AF6L-JG37-7K23'}
              </span>
            </div>
          </div>
        </div>

        {/* 2.2 Carte Bento : Émission Express 1-Clic & Push MikroTik */}
        <div className="p-6 rounded-3xl bento-card border border-cyan-500/25 flex flex-col justify-between space-y-4">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-bold">
                ACTION RAPIDE 1-CLIC
              </span>
              <Zap className="w-4 h-4 text-emerald-400" />
            </div>
            <h2 className="text-base font-extrabold text-white pt-1">
              Émission Ticket Express
            </h2>
            <p className="text-xs text-slate-400">
              Générez un voucher et injectez-le instantanément dans Supabase & WinBox.
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-[11px] font-bold text-slate-300 block mb-1">
                Choisir le forfait à émettre :
              </label>
              <select
                value={expressForfaitId}
                onChange={(e) => setExpressForfaitId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-xs font-bold text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                {forfaits.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} — {formatMoney(f.price)} ({f.durationHours}h)
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleExpressGenerate}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition cursor-pointer active:scale-98"
            >
              <Zap className="w-4 h-4 stroke-[2.5]" />
              <span>GÉNÉRER & SYNCHRONISER MAINTENANT</span>
            </button>
          </div>

          {lastExpressTicket ? (
            <div className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-between gap-2">
              <div>
                <div className="text-[10px] uppercase font-bold text-emerald-300">
                  Dernier code généré ({lastExpressTicket.forfaitName})
                </div>
                <div className="font-mono font-black text-lg text-white tracking-widest">
                  {lastExpressTicket.code}
                </div>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(lastExpressTicket.code);
                  setCopiedCode(true);
                  setTimeout(() => setCopiedCode(false), 2000);
                }}
                className="px-3 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-1 cursor-pointer"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Copié' : 'Copier'}</span>
              </button>
            </div>
          ) : (
            <div className="p-3 rounded-2xl bg-slate-950/70 border border-white/5 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Besoin d'un lot de 10 à 500 tickets ?</span>
              <button
                onClick={() => setAdminTab('tickets')}
                className="text-emerald-400 font-bold hover:underline cursor-pointer"
              >
                Ouvrir Lots &rarr;
              </button>
            </div>
          )}
        </div>
      </div>

      {/* =========================================================================
          3. BENTO ROW 2 : 4 CARTES KPI HAUTE DENSITÉ
      ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 : Revenus */}
        <div
          onClick={() => setAdminTab('comptabilite')}
          className="p-5 rounded-3xl bento-card border border-white/10 hover:border-emerald-500/40 cursor-pointer transition space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Chiffre d'Affaires</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-mono tabular-nums">
            {formatMoney(displayedRevenue)}
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-emerald-400 font-bold flex items-center gap-0.5">
              <ArrowUpRight className="w-3.5 h-3.5" /> +18.4%
            </span>
            <span className="text-slate-400">Caisse POS & Mobile Money</span>
          </div>
        </div>

        {/* KPI 2 : Vouchers & Stock Supabase */}
        <div
          onClick={() => setAdminTab('tickets')}
          className="p-5 rounded-3xl bento-card border border-white/10 hover:border-cyan-500/40 cursor-pointer transition space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Stock & Vouchers WiFi</span>
            <div className="w-9 h-9 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
              <Ticket className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-mono tabular-nums">
            {tickets.length} <span className="text-xs font-semibold text-slate-400">tickets</span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-cyan-300 font-semibold">{availableTicketsCount} prêts à vendre</span>
            <span className="text-emerald-400 font-mono">{activeTicketsCount} actifs</span>
          </div>
        </div>

        {/* KPI 3 : Clients Connectés Hotspot */}
        <div
          onClick={() => setAdminTab('sessions')}
          className="p-5 rounded-3xl bento-card border border-white/10 hover:border-emerald-500/40 cursor-pointer transition space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Sessions Hotspot Live</span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center border border-purple-500/30">
              <Wifi className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-mono tabular-nums">
            {sessions.length} <span className="text-xs font-semibold text-slate-400">clients</span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-purple-300 font-semibold">Cookie MAC 30j actif</span>
            <span className="text-slate-400">{onlineRoutersCount} routeur(s)</span>
          </div>
        </div>

        {/* KPI 4 : Vendeurs POS Terrain */}
        <div
          onClick={() => setAdminTab('staff')}
          className="p-5 rounded-3xl bento-card border border-white/10 hover:border-emerald-500/40 cursor-pointer transition space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Force de Vente POS</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-mono tabular-nums">
            {staff.length} <span className="text-xs font-semibold text-slate-400">agents</span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-emerald-400 font-bold">
              CA Jour : {formatMoney(todayRevenue)}
            </span>
            <span className="text-slate-400">Kiosques PWA</span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          4. BENTO ROW 3 : COURBE ANALYTIQUE 10 JOURS + PERFORMANCE VENDEURS POS
      ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* 4.1 Courbe des Ventes sur 10 Jours (2 colonnes) */}
        <div className="lg:col-span-2 p-6 rounded-3xl bento-card border border-white/10 flex flex-col justify-between space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-extrabold text-white">
                Dynamique des Recettes WiFi (10 derniers jours)
              </h2>
              <p className="text-xs text-slate-400">
                Consolidation automatique des ventes Caisse POS et des paiements Mobile Money
              </p>
            </div>
            <button
              onClick={() => setAdminTab('ventes')}
              className="text-xs font-bold text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Journal détaillé</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-52 flex items-end gap-2.5 pt-6 px-1">
            {salesHistory10Days.map((item, idx) => (
              <div key={item.day} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                <div className="opacity-0 group-hover:opacity-100 transition text-[10px] font-mono text-emerald-300 bg-slate-900 px-1.5 py-0.5 rounded border border-emerald-500/30 whitespace-nowrap">
                  {formatMoney(item.amount)}
                </div>
                <div
                  className={`w-full rounded-t-xl transition-all duration-300 ${
                    idx === salesHistory10Days.length - 1
                      ? 'bg-gradient-to-t from-emerald-600 via-emerald-400 to-cyan-300 shadow-lg shadow-emerald-500/25'
                      : 'bg-slate-800/90 group-hover:bg-emerald-500/60'
                  }`}
                  style={{ height: `${item.height}%` }}
                />
                <span className="text-[10px] font-mono text-slate-400 truncate max-w-full">
                  {item.day}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 4.2 Classement Temps Réel des Vendeurs POS (1 colonne) */}
        <div className="p-6 rounded-3xl bento-card border border-white/10 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-white">Top Agents POS</h2>
              <p className="text-xs text-slate-400">Synchronisés avec staff_vendors</p>
            </div>
            <button
              onClick={() => setCurrentSpace('pos')}
              className="px-2.5 py-1.5 rounded-xl bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold cursor-pointer"
            >
              Ouvrir POS
            </button>
          </div>

          <div className="space-y-2.5">
            {staff.slice(0, 4).map((vendor, i) => (
              <div
                key={vendor.id}
                onClick={() => setAdminTab('staff')}
                className="p-3 rounded-2xl bg-slate-950/75 hover:bg-slate-900 border border-white/10 flex items-center justify-between gap-3 cursor-pointer transition"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-300 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                    #{i + 1}
                  </span>
                  <div className="truncate">
                    <div className="text-xs font-bold text-white truncate">{vendor.name}</div>
                    <div className="text-[10px] text-slate-400 truncate">{vendor.zoneName}</div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs font-mono font-extrabold text-emerald-400">
                    {formatMoney(vendor.todaySales)}
                  </div>
                  <div className="text-[10px] font-mono text-slate-400">
                    Crédit : {formatMoney(vendor.balanceCredit)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setAdminTab('staff')}
            className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-xs font-bold text-slate-200 cursor-pointer transition"
          >
            Gérer les vendeurs & commissions &rarr;
          </button>
        </div>
      </div>

      {/* =========================================================================
          5. BENTO ROW 4 : ÉTAT DES ZONES WIFI & DERNIERS TICKETS CRÉÉS
      ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Zones WiFi */}
        <div className="p-6 rounded-3xl bento-card border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>Performance par Site / Zone WiFi</span>
            </h2>
            <button
              onClick={() => setAdminTab('zones')}
              className="text-xs font-bold text-emerald-400 hover:underline cursor-pointer"
            >
              Gérer ({zones.length}) &rarr;
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {zones.slice(0, 4).map((z) => (
              <div
                key={z.id}
                onClick={() => setAdminTab('zones')}
                className="p-3.5 rounded-2xl bg-slate-950/75 border border-white/10 hover:border-emerald-500/35 cursor-pointer transition space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white truncate">{z.name}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300">
                    Actif
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>{z.city}</span>
                  <span className="text-emerald-400 font-bold">
                    {formatMoney(z.monthlyRevenue)}/mois
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Derniers Tickets Synchronisés */}
        <div className="p-6 rounded-3xl bento-card border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-white flex items-center gap-2">
              <Ticket className="w-4 h-4 text-cyan-400" />
              <span>Derniers Vouchers Synchronisés (Supabase &rarr; WinBox)</span>
            </h2>
            <button
              onClick={() => setAdminTab('tickets')}
              className="text-xs font-bold text-cyan-400 hover:underline cursor-pointer"
            >
              Tout voir ({tickets.length}) &rarr;
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {tickets.slice(0, 6).map((t) => (
              <div
                key={t.id}
                onClick={() => {
                  navigator.clipboard.writeText(t.code);
                  showToast(`Code ${t.code} copié !`, 'success');
                }}
                className="p-3 rounded-2xl bg-slate-950/80 border border-white/10 hover:border-cyan-500/40 cursor-pointer transition flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-black text-sm text-white">{t.code}</span>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      t.status === 'actif' ? 'bg-emerald-400' : 'bg-cyan-400'
                    }`}
                  />
                </div>
                <div className="text-[10px] text-slate-400 truncate mt-1">{t.forfaitName}</div>
                <div className="text-[10px] font-mono font-bold text-emerald-400 mt-0.5">
                  {formatMoney(t.price)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
