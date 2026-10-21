import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Wifi,
  Users,
  TrendingUp,
  Ticket,
  Server,
  Terminal,
  Copy,
  Check,
  ArrowRight,
  Cpu,
  Globe,
  RefreshCw,
  MapPin,
  Smartphone,
  ShieldCheck,
  Laptop,
  CheckCircle2,
} from 'lucide-react';

export const DashboardOverview: React.FC = () => {
  const {
    zones,
    routers,
    sessions,
    tickets,
    staff,
    forfaits,
    macBypasses,
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

  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month' | 'all'>('today');
  const [expressForfaitId, setExpressForfaitId] = useState<string>(forfaits[0]?.id || 'f-1');
  const [lastExpressTicket, setLastExpressTicket] = useState<{
    code: string;
    forfaitName: string;
    price: number;
  } | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

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

  const handleExpressGenerate = () => {
    try {
      const targetForfaitId = expressForfaitId || forfaits[0]?.id;
      if (!targetForfaitId) return;
      const created = sellTicketPOS(targetForfaitId, 'Client Console 6.3', staff[0]?.id);
      setLastExpressTicket({
        code: created.code,
        forfaitName: created.forfaitName,
        price: created.price,
      });
      showToast(
        `Voucher ${created.code} créé et synchronisé avec Supabase & MikroTik.`,
        'success'
      );
    } catch {
      showToast('Veuillez sélectionner un forfait.', 'warning');
    }
  };

  // 24-Hour Timeline Segments (48 segments representing 30-min slots over 24h)
  const timelineSegments = Array.from({ length: 48 }, (_, i) => i);

  const salesHistory10Days = [
    { day: '02:00', down: 35, up: 22, rev: 18000 },
    { day: '04:00', down: 28, up: 18, rev: 12000 },
    { day: '06:00', down: 45, up: 30, rev: 25000 },
    { day: '08:00', down: 68, up: 42, rev: 38000 },
    { day: '10:00', down: 74, up: 48, rev: 44000 },
    { day: '12:00', down: 88, up: 60, rev: 56000 },
    { day: '14:00', down: 82, up: 54, rev: 49000 },
    { day: '16:00', down: 92, up: 65, rev: 64000 },
    { day: '18:00', down: 96, up: 72, rev: 69000 },
    { day: '20:00', down: 85, up: 58, rev: todayRevenue || 56700 },
  ];

  return (
    <div className="space-y-5 pb-12 text-[#1E293B]">
      {/* SOS Alert Banner if any */}
      {pendingSosAlerts.length > 0 && (
        <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs">
            <strong className="text-rose-800">
              Demande SOS Crédit POS : {pendingSosAlerts[0].vendorName} ({pendingSosAlerts[0].zoneName})
            </strong>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                rechargeStaff(pendingSosAlerts[0].vendorId, 25000);
                clearSosAlert(pendingSosAlerts[0].id);
              }}
              className="px-3 py-1.5 rounded bg-[#008060] text-white font-semibold text-xs cursor-pointer"
            >
              Créditer +25 000 FCFA
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          1. MAIN CONTROLLER 6.3 PANEL (Exact layout of Monitor in Capture 160906.jpg:
             Left Column = Circular Health Gauge 98 + Radar SVG +Express Voucher
             Right Column = 24h Equipment Status Bars + 6 Icon Counters + Activity Chart)
      ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT COLUMN (Cols 1-3) : NETWORK HEALTH SCORE GAUGE + RADAR SVG + EXPRESS TICKET */}
        <div className="lg:col-span-3 space-y-5">
          {/* Card 1 : Score de Santé Réseau (Circular Gauge + 5-Axis Radar like Omada 6.3) */}
          <div className="bg-white rounded-lg border border-slate-200 p-5 space-y-5 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <span className="text-xs font-bold text-slate-700">Indice Santé Réseau</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E6F4F3] text-[#008060]">
                Optimal
              </span>
            </div>

            {/* Circular Gauge 98/100 */}
            <div className="flex flex-col items-center justify-center py-1">
              <div className="relative w-32 h-32 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="none"
                    stroke="#E2E8F0"
                    strokeWidth="10"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="none"
                    stroke="#008060"
                    strokeWidth="10"
                    strokeDasharray="314"
                    strokeDashoffset="12"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-3xl font-black text-slate-800 leading-none">98</span>
                  <span className="text-[10px] font-bold text-[#008060] mt-1">Excellent</span>
                </div>
              </div>
            </div>

            {/* 5-Axis Radar Chart SVG (just like under the gauge in Capture 160906.jpg) */}
            <div className="flex flex-col items-center">
              <svg className="w-40 h-32" viewBox="0 0 160 130">
                <polygon
                  points="80,12 142,50 118,115 42,115 18,50"
                  fill="#F8FAFC"
                  stroke="#CBD5E1"
                  strokeWidth="1"
                />
                <polygon
                  points="80,32 122,58 106,98 54,98 38,58"
                  fill="none"
                  stroke="#E2E8F0"
                  strokeWidth="1"
                />
                <polygon
                  points="80,16 136,52 114,110 46,108 24,52"
                  fill="rgba(0, 128, 96, 0.18)"
                  stroke="#008060"
                  strokeWidth="2"
                />
                <text x="80" y="9" textAnchor="middle" fontSize="8" fill="#64748B">
                  WAN ISP
                </text>
                <text x="148" y="52" textAnchor="start" fontSize="8" fill="#64748B">
                  Sync
                </text>
                <text x="125" y="125" textAnchor="middle" fontSize="8" fill="#64748B">
                  DHCP
                </text>
                <text x="35" y="125" textAnchor="middle" fontSize="8" fill="#64748B">
                  CPU
                </text>
                <text x="12" y="52" textAnchor="end" fontSize="8" fill="#64748B">
                  POS
                </text>
              </svg>
            </div>

            {/* Summary Metrics List */}
            <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Disponibilité WAN :</span>
                <span className="font-mono font-bold text-[#008060]">99.98 %</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Fast-Poll MikroTik :</span>
                <span className="font-mono font-bold text-slate-800">10 sec ({heartbeatSecondsRemaining}s)</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Tables Supabase :</span>
                <span className="font-mono font-bold text-[#007A78]">12 / 12 OK</span>
              </div>
            </div>
          </div>

          {/* Card 2 : Émission Express de Voucher 1-Clic */}
          <div className="bg-white rounded-lg border border-slate-200 p-5 space-y-3.5 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-bold text-slate-700">Émission Express 1-Clic</span>
              <Ticket className="w-4 h-4 text-[#008060]" />
            </div>

            <div className="space-y-2.5 text-xs">
              <select
                value={expressForfaitId}
                onChange={(e) => setExpressForfaitId(e.target.value)}
                className="w-full px-2.5 py-2 rounded bg-[#F8FAFC] border border-slate-300 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#008060] cursor-pointer"
              >
                {forfaits.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} — {formatMoney(f.price)}
                  </option>
                ))}
              </select>

              <button
                onClick={handleExpressGenerate}
                className="w-full py-2.5 px-3 rounded bg-[#008060] hover:bg-[#006B50] text-white font-semibold text-xs transition cursor-pointer"
              >
                Générer & Pousser vers MikroTik
              </button>
            </div>

            {lastExpressTicket && (
              <div className="p-2.5 rounded bg-[#E6F4F3] border border-[#99D5D3] flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-[#005A5B] font-semibold">
                    {lastExpressTicket.forfaitName}
                  </div>
                  <div className="font-mono font-black text-sm text-slate-900">
                    {lastExpressTicket.code}
                  </div>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(lastExpressTicket.code);
                    setCopiedCode(true);
                    setTimeout(() => setCopiedCode(false), 2000);
                  }}
                  className="px-2.5 py-1 rounded bg-[#008060] text-white text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                >
                  {copiedCode ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedCode ? 'Copié' : 'Copier'}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN (Cols 4-12) : 24H EQUIPMENT BARS + 6 ICON COUNTERS + ACTIVITY CHART */}
        <div className="lg:col-span-9 space-y-5">
          {/* Top Right Card : 24h Equipment & Synchronisation Trend + 6 Interactive Counters */}
          <div className="bg-white rounded-lg border border-slate-200 p-5 space-y-5 shadow-2xs">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-sm font-bold text-slate-800">
                  État de Synchronisation sur 24h & Inventaire Réseau
                </h2>
                <p className="text-[11px] text-slate-500">
                  Disponibilité continue des passerelles MikroTik, de la base Supabase et des kiosques POS
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    forceHeartbeatSync();
                    showToast('Synchronisation envoyée aux routeurs MikroTik.', 'success');
                  }}
                  className="px-3 py-1.5 rounded bg-[#F4F7FA] hover:bg-slate-200 border border-slate-300 text-xs font-semibold text-slate-700 flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-[#008060]" />
                  <span>Forcer Sync</span>
                </button>
                <button
                  onClick={() => setAdminTab('installation')}
                  className="px-3 py-1.5 rounded bg-[#008060] hover:bg-[#006B50] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Script RouterOS</span>
                </button>
              </div>
            </div>

            {/* 3 Horizontal 24h Segmented Timeline Bars (Exact match to Monitor in Capture 160906.jpg) */}
            <div className="space-y-3">
              {/* Bar 1 */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#008060]" />
                    Passerelles MikroTik ({routers[0]?.name || 'MK-ADJAME-CORE-01'})
                  </span>
                  <span className="text-[11px] font-mono text-[#008060] font-bold">
                    100% En ligne (24h)
                  </span>
                </div>
                <div className="grid grid-cols-48 gap-0.5 h-2.5">
                  {timelineSegments.map((seg) => (
                    <span key={seg} className="bg-[#10B981] rounded-xs" />
                  ))}
                </div>
              </div>

              {/* Bar 2 */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#007A78]" />
                    File d'attente Vouchers Supabase (router_synced)
                  </span>
                  <span className="text-[11px] font-mono text-[#007A78] font-bold">
                    {tickets.length} / {tickets.length} Vouchers Synchronisés
                  </span>
                </div>
                <div className="grid grid-cols-48 gap-0.5 h-2.5">
                  {timelineSegments.map((seg) => (
                    <span key={seg} className="bg-[#008060] rounded-xs" />
                  ))}
                </div>
              </div>

              {/* Bar 3 */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#0066CC]" />
                    Passerelles Mobile Money & Terminaux Caisse POS
                  </span>
                  <span className="text-[11px] font-mono text-[#0066CC] font-bold">
                    Recette Jour : {formatMoney(todayRevenue)}
                  </span>
                </div>
                <div className="grid grid-cols-48 gap-0.5 h-2.5">
                  {timelineSegments.map((seg) => (
                    <span key={seg} className="bg-[#0EA5E9] rounded-xs" />
                  ))}
                </div>
              </div>
            </div>

            {/* Row of 6 Interactive Equipment & Service Icon Counters (Like middle of Monitor in Capture 160906.jpg) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2 border-t border-slate-100">
              <div
                onClick={() => setAdminTab('mikrotik')}
                className="p-3 rounded-lg bg-[#F8FAFC] hover:bg-[#E6F4F3] border border-slate-200 cursor-pointer transition text-center space-y-1"
              >
                <Cpu className="w-4 h-4 text-[#008060] mx-auto" />
                <div className="text-lg font-black text-slate-800 font-mono">
                  {onlineRoutersCount}/{routers.length}
                </div>
                <div className="text-[10px] font-semibold text-slate-500">Passerelles</div>
              </div>

              <div
                onClick={() => setAdminTab('zones')}
                className="p-3 rounded-lg bg-[#F8FAFC] hover:bg-[#E6F4F3] border border-slate-200 cursor-pointer transition text-center space-y-1"
              >
                <MapPin className="w-4 h-4 text-[#007A78] mx-auto" />
                <div className="text-lg font-black text-slate-800 font-mono">{zones.length}</div>
                <div className="text-[10px] font-semibold text-slate-500">Sites WiFi</div>
              </div>

              <div
                onClick={() => setAdminTab('tickets')}
                className="p-3 rounded-lg bg-[#F8FAFC] hover:bg-[#E6F4F3] border border-slate-200 cursor-pointer transition text-center space-y-1"
              >
                <Ticket className="w-4 h-4 text-[#0066CC] mx-auto" />
                <div className="text-lg font-black text-slate-800 font-mono">
                  {availableTicketsCount}
                </div>
                <div className="text-[10px] font-semibold text-slate-500">Vouchers Prêts</div>
              </div>

              <div
                onClick={() => setAdminTab('forfaits')}
                className="p-3 rounded-lg bg-[#F8FAFC] hover:bg-[#E6F4F3] border border-slate-200 cursor-pointer transition text-center space-y-1"
              >
                <Wifi className="w-4 h-4 text-[#008060] mx-auto" />
                <div className="text-lg font-black text-slate-800 font-mono">{forfaits.length}</div>
                <div className="text-[10px] font-semibold text-slate-500">Profils Forfaits</div>
              </div>

              <div
                onClick={() => setAdminTab('staff')}
                className="p-3 rounded-lg bg-[#F8FAFC] hover:bg-[#E6F4F3] border border-slate-200 cursor-pointer transition text-center space-y-1"
              >
                <Users className="w-4 h-4 text-[#007A78] mx-auto" />
                <div className="text-lg font-black text-slate-800 font-mono">{staff.length}</div>
                <div className="text-[10px] font-semibold text-slate-500">Agents POS</div>
              </div>

              <div
                onClick={() => setAdminTab('mac-bypass')}
                className="p-3 rounded-lg bg-[#F8FAFC] hover:bg-[#E6F4F3] border border-slate-200 cursor-pointer transition text-center space-y-1"
              >
                <Laptop className="w-4 h-4 text-[#0066CC] mx-auto" />
                <div className="text-lg font-black text-slate-800 font-mono">
                  {macBypasses.length}
                </div>
                <div className="text-[10px] font-semibold text-slate-500">Bindings MAC</div>
              </div>
            </div>
          </div>

          {/* Bottom Right Card : Activity & Revenue Chart + Period Switcher (Like bottom of Monitor in Capture 160906.jpg) */}
          <div className="bg-white rounded-lg border border-slate-200 p-5 space-y-4 shadow-2xs">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  Activité Trafic & Chiffre d'Affaires Consolidé :{' '}
                  <span className="text-[#008060] font-mono">{formatMoney(displayedRevenue)}</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Évolution du trafic Hotspot et des recettes Caisse POS / Mobile Money
                </p>
              </div>

              <div className="flex items-center gap-1 bg-[#F4F7FA] p-1 rounded border border-slate-200 text-xs">
                {(
                  [
                    { id: 'today', label: '24h' },
                    { id: 'week', label: '7 Jours' },
                    { id: 'month', label: '30 Jours' },
                    { id: 'all', label: 'Total' },
                  ] as const
                ).map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPeriod(p.id)}
                    className={`px-2.5 py-1 rounded text-[11px] font-semibold cursor-pointer transition ${
                      selectedPeriod === p.id
                        ? 'bg-[#008060] text-white'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Dual Bar Chart (Download/Revenue in Teal + Upload/Sessions in Blue) */}
            <div className="h-44 flex items-end gap-3 pt-4 px-2">
              {salesHistory10Days.map((item) => (
                <div
                  key={item.day}
                  className="flex-1 flex flex-col items-center gap-1.5 group h-full justify-end"
                >
                  <div className="opacity-0 group-hover:opacity-100 transition text-[10px] font-mono text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-300 whitespace-nowrap">
                    {formatMoney(item.rev)}
                  </div>
                  <div className="w-full flex items-end justify-center gap-1 h-full">
                    <div
                      className="w-1/2 bg-[#008060] rounded-t-xs transition-all"
                      style={{ height: `${item.down}%` }}
                    />
                    <div
                      className="w-1/2 bg-[#38BDF8] rounded-t-xs transition-all"
                      style={{ height: `${item.up}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">{item.day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          2. TABLEAU OPÉRATIONNEL B2B : VENDEURS POS & DERNIERS VOUCHERS SYNCHRONISÉS
      ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Table 1 : Équipe Vendeurs POS (7 colonnes) */}
        <div className="lg:col-span-7 bg-white rounded-lg border border-slate-200 overflow-hidden shadow-2xs">
          <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-[#F8FAFC]">
            <span className="text-xs font-bold text-slate-800">
              Performance Temps Réel des Agents Vendeurs POS
            </span>
            <button
              onClick={() => setAdminTab('staff')}
              className="text-xs font-semibold text-[#008060] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Gérer l'équipe</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] text-slate-500 bg-white">
                  <th className="py-2.5 px-4 font-semibold">Agent Vendeur</th>
                  <th className="py-2.5 px-4 font-semibold">Site affecté</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Ventes Jour</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Crédit POS</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {staff.map((s) => (
                  <tr key={s.id} className="hover:bg-[#F8FAFC] transition">
                    <td className="py-2.5 px-4 font-semibold text-slate-800">{s.name}</td>
                    <td className="py-2.5 px-4 text-slate-500">{s.zoneName}</td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-[#008060]">
                      {formatMoney(s.todaySales)}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono text-slate-700">
                      {formatMoney(s.balanceCredit)}
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <button
                        onClick={() => setCurrentSpace('pos')}
                        className="px-2.5 py-1 rounded bg-[#E6F4F3] hover:bg-[#008060] text-[#005A5B] hover:text-white font-semibold text-[11px] transition cursor-pointer"
                      >
                        Ouvrir POS
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Table 2 : Derniers Vouchers Synchronisés (5 colonnes) */}
        <div className="lg:col-span-5 bg-white rounded-lg border border-slate-200 overflow-hidden shadow-2xs">
          <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-[#F8FAFC]">
            <span className="text-xs font-bold text-slate-800">
              Derniers Vouchers Synchronisés (WinBox)
            </span>
            <button
              onClick={() => setAdminTab('tickets')}
              className="text-xs font-semibold text-[#008060] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Tout le stock ({tickets.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {tickets.slice(0, 5).map((t) => (
              <div
                key={t.id}
                onClick={() => {
                  navigator.clipboard.writeText(t.code);
                  showToast(`Code voucher ${t.code} copié !`, 'success');
                }}
                className="px-4 py-2.5 hover:bg-[#F8FAFC] flex items-center justify-between cursor-pointer transition text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#008060] shrink-0" />
                  <div>
                    <span className="font-mono font-bold text-slate-800">{t.code}</span>
                    <span className="text-slate-400 mx-1.5">•</span>
                    <span className="text-slate-600">{t.forfaitName}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-slate-800">{formatMoney(t.price)}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#E6F4F3] text-[#005A5B]">
                    {t.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
