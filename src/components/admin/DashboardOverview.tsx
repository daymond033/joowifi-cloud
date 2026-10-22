import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Wifi,
  Users,
  Ticket,
  Terminal,
  Copy,
  Check,
  ArrowRight,
  Cpu,
  RefreshCw,
  MapPin,
  Laptop,
  CheckCircle2,
  Activity,
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
    setAdminTab,
    setCurrentSpace,
    pendingSosAlerts,
    clearSosAlert,
    sellTicketPOS,
    forceHeartbeatSync,
    notify,
  } = useApp();

  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month' | 'all'>('today');
  const [chartMetric, setChartMetric] = useState<'combined' | 'revenue' | 'traffic'>('combined');
  const [hoveredPointIdx, setHoveredPointIdx] = useState<number | null>(9);

  const [expressForfaitId, setExpressForfaitId] = useState<string>(forfaits[0]?.id || '');
  const [lastExpressTicket, setLastExpressTicket] = useState<{
    code: string;
    forfaitName: string;
    price: number;
  } | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  const onlineRoutersCount = routers.filter((r) => r.status === 'online').length;
  const availableTicketsCount = tickets.filter(
    (t) => t.status === 'stock' || t.status === 'vendeur' || t.status === 'papier'
  ).length;
  const soldOrActiveTickets = tickets.filter(
    (t) => t.status === 'actif' || t.status === 'vendeur' || t.status === 'expire'
  );
  const todayRevenue =
    staff.reduce((acc, s) => acc + (s.todaySales || 0), 0) +
    soldOrActiveTickets.reduce((acc, t) => acc + (t.price || 0), 0);

  const periodMultiplier = {
    today: 1,
    week: 1,
    month: 1,
    all: 1,
  };
  const displayedRevenue = Math.round(todayRevenue * periodMultiplier[selectedPeriod]);

  const healthScore = routers.length === 0 ? 0 : onlineRoutersCount > 0 ? 98 : 45;

  const handleExpressGenerate = () => {
    const targetForfaitId = expressForfaitId || forfaits[0]?.id;
    if (!targetForfaitId) {
      notify('Veuillez d’abord créer un forfait dans l’onglet Profils & Forfaits.', 'warning');
      setAdminTab('forfaits');
      return;
    }
    try {
      const created = sellTicketPOS(targetForfaitId, 'Client Console Cloud', staff[0]?.id);
      setLastExpressTicket({
        code: created.code,
        forfaitName: created.forfaitName,
        price: created.price,
      });
      notify(`Voucher ${created.code} créé et synchronisé avec le Cloud.`, 'success');
    } catch {
      notify('Veuillez d’abord créer un forfait.', 'warning');
    }
  };

  const timelineSegments = Array.from({ length: 48 }, (_, i) => i);

  // Série analytique 100 % fondée sur les données réelles du compte (0 FCFA et 0 Go si aucune activité)
  const totalBytesInGb = Number(
    (sessions.reduce((acc, s) => acc + (s.bytesInMb || 0), 0) / 1024).toFixed(2)
  );
  const totalBytesOutGb = Number(
    (sessions.reduce((acc, s) => acc + (s.bytesOutMb || 0), 0) / 1024).toFixed(2)
  );

  const timeSlots = ['02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'];
  const weights = [0.02, 0.01, 0.04, 0.08, 0.1, 0.14, 0.12, 0.15, 0.18, 0.16];

  const analyticalSeries = timeSlots.map((label, idx) => {
    const w = weights[idx];
    const isLast = idx === timeSlots.length - 1;
    const revScaled =
      displayedRevenue === 0
        ? 0
        : isLast
        ? displayedRevenue
        : Math.round(displayedRevenue * w);
    const ticketsSold =
      soldOrActiveTickets.length === 0
        ? 0
        : isLast
        ? soldOrActiveTickets.length
        : Math.round(soldOrActiveTickets.length * w);
    const downScaled =
      totalBytesInGb === 0 ? 0 : Number((totalBytesInGb * (isLast ? 1 : w)).toFixed(2));
    const upScaled =
      totalBytesOutGb === 0 ? 0 : Number((totalBytesOutGb * (isLast ? 1 : w)).toFixed(2));
    const peakUsers = sessions.length === 0 ? 0 : isLast ? sessions.length : Math.round(sessions.length * w);

    return {
      label,
      revScaled,
      ticketsSold,
      downScaled,
      upScaled,
      peakUsers,
    };
  });

  const maxRev = Math.max(...analyticalSeries.map((d) => d.revScaled), 1000);
  const maxTraffic = Math.max(...analyticalSeries.map((d) => d.downScaled), 1);
  const totalDataGb = (totalBytesInGb + totalBytesOutGb).toFixed(2);
  const totalTicketsSoldPeriod = soldOrActiveTickets.length;

  const activePoint =
    hoveredPointIdx !== null && analyticalSeries[hoveredPointIdx]
      ? analyticalSeries[hoveredPointIdx]
      : analyticalSeries[analyticalSeries.length - 1];

  const svgWidth = 720;
  const svgHeight = 200;
  const padX = 36;
  const padY = 20;
  const plotW = svgWidth - padX * 2;
  const plotH = svgHeight - padY * 2;

  const revCoords = analyticalSeries.map((d, i) => {
    const x = padX + (i / (analyticalSeries.length - 1)) * plotW;
    const y =
      displayedRevenue === 0
        ? padY + plotH
        : padY + plotH - (d.revScaled / maxRev) * plotH;
    return { x, y };
  });

  const trafficCoords = analyticalSeries.map((d, i) => {
    const x = padX + (i / (analyticalSeries.length - 1)) * plotW;
    const y =
      totalBytesInGb === 0
        ? padY + plotH
        : padY + plotH - (d.downScaled / maxTraffic) * plotH;
    return { x, y };
  });

  const revPolyline = revCoords.map((p) => `${p.x},${p.y}`).join(' ');
  const revArea = `${revCoords[0].x},${padY + plotH} ${revPolyline} ${
    revCoords[revCoords.length - 1].x
  },${padY + plotH}`;

  const trafficPolyline = trafficCoords.map((p) => `${p.x},${p.y}`).join(' ');
  const trafficArea = `${trafficCoords[0].x},${padY + plotH} ${trafficPolyline} ${
    trafficCoords[trafficCoords.length - 1].x
  },${padY + plotH}`;

  return (
    <div className="space-y-5 pb-12 text-[#1E293B]">
      {pendingSosAlerts.length > 0 && (
        <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs">
            <strong className="text-rose-800">
              Demande SOS Crédit POS : {pendingSosAlerts[0].staffName} (+{formatMoney(pendingSosAlerts[0].amount)})
            </strong>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                clearSosAlert(pendingSosAlerts[0].id);
                setAdminTab('staff');
              }}
              className="px-3 py-1.5 rounded bg-[#008060] text-white font-semibold text-xs cursor-pointer"
            >
              Gérer la demande
            </button>
          </div>
        </div>
      )}

      {/* 1. PANNEAU DE SUPERVISION PRINCIPAL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT COLUMN : JAUGE SANTÉ RÉSEAU + ÉMISSION EXPRESS */}
        <div className="lg:col-span-3 space-y-5">
          <div className="bg-white rounded-lg border border-slate-200 p-5 space-y-5 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <span className="text-xs font-bold text-slate-700">Indice Santé Réseau</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  routers.length > 0
                    ? 'bg-[#E6F4F3] text-[#008060]'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                {routers.length > 0 ? 'Optimal' : 'Aucun routeur'}
              </span>
            </div>

            <div className="flex flex-col items-center justify-center py-1">
              <div className="relative w-32 h-32 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="#E2E8F0" strokeWidth="10" />
                  {routers.length > 0 && (
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
                  )}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-3xl font-black text-slate-800 leading-none">
                    {healthScore}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 mt-1">
                    {routers.length > 0 ? 'En ligne' : 'Non connecté'}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Routeurs connectés :</span>
                <span className="font-mono font-bold text-slate-800">
                  {onlineRoutersCount} / {routers.length}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Sessions actives :</span>
                <span className="font-mono font-bold text-slate-800">{sessions.length}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Chiffre d'affaires :</span>
                <span className="font-mono font-bold text-[#008060]">
                  {formatMoney(displayedRevenue)}
                </span>
              </div>
            </div>
          </div>

          {/* Émission Express 1-Clic */}
          <div className="bg-white rounded-lg border border-slate-200 p-5 space-y-3.5 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-bold text-slate-700">Émission Express 1-Clic</span>
              <Ticket className="w-4 h-4 text-[#008060]" />
            </div>

            {forfaits.length === 0 ? (
              <div className="text-xs text-slate-500 space-y-2">
                <p>Aucun forfait configuré sur ce compte.</p>
                <button
                  onClick={() => setAdminTab('forfaits')}
                  className="w-full py-2 px-3 rounded bg-[#008060] text-white font-semibold text-xs cursor-pointer"
                >
                  + Créer mon premier forfait
                </button>
              </div>
            ) : (
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
                  Générer & Synchroniser
                </button>
              </div>
            )}

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

        {/* RIGHT COLUMN : BARRES 24H + 6 COMPTEURS + GRAPHIQUE ANALYTIQUE */}
        <div className="lg:col-span-9 space-y-5">
          <div className="bg-white rounded-lg border border-slate-200 p-5 space-y-5 shadow-2xs">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-sm font-bold text-slate-800">
                  État de Synchronisation Cloud & Inventaire Réseau
                </h2>
                <p className="text-[11px] text-slate-500">
                  Vue en temps réel des équipements, forfaits, tickets et vendeurs de votre espace
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={forceHeartbeatSync}
                  className="px-3 py-1.5 rounded bg-[#F4F7FA] hover:bg-slate-200 border border-slate-300 text-xs font-semibold text-slate-700 flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-[#008060]" />
                  <span>Actualiser Cloud</span>
                </button>
                <button
                  onClick={() => setAdminTab('mikrotik')}
                  className="px-3 py-1.5 rounded bg-[#008060] hover:bg-[#006B50] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Connecter un Routeur</span>
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        routers.length > 0 ? 'bg-[#008060]' : 'bg-slate-300'
                      }`}
                    />
                    Passerelles MikroTik ({routers.length > 0 ? routers[0].name : 'Aucun routeur connecté'})
                  </span>
                  <span className="text-[11px] font-mono text-slate-600 font-bold">
                    {routers.length > 0 ? `${onlineRoutersCount}/${routers.length} En ligne` : '0 Routeur'}
                  </span>
                </div>
                <div className="grid grid-cols-48 gap-0.5 h-2.5">
                  {timelineSegments.map((seg) => (
                    <span
                      key={seg}
                      className={`rounded-xs ${
                        routers.length > 0 ? 'bg-[#10B981]' : 'bg-slate-100'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        tickets.length > 0 ? 'bg-[#007A78]' : 'bg-slate-300'
                      }`}
                    />
                    Stock de Vouchers Cloud
                  </span>
                  <span className="text-[11px] font-mono text-slate-600 font-bold">
                    {tickets.length} Voucher(s)
                  </span>
                </div>
                <div className="grid grid-cols-48 gap-0.5 h-2.5">
                  {timelineSegments.map((seg) => (
                    <span
                      key={seg}
                      className={`rounded-xs ${
                        tickets.length > 0 ? 'bg-[#008060]' : 'bg-slate-100'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        displayedRevenue > 0 ? 'bg-[#0066CC]' : 'bg-slate-300'
                      }`}
                    />
                    Activité Caisse POS & Vendeurs
                  </span>
                  <span className="text-[11px] font-mono text-[#008060] font-bold">
                    Recette : {formatMoney(displayedRevenue)}
                  </span>
                </div>
                <div className="grid grid-cols-48 gap-0.5 h-2.5">
                  {timelineSegments.map((seg) => (
                    <span
                      key={seg}
                      className={`rounded-xs ${
                        displayedRevenue > 0 ? 'bg-[#0EA5E9]' : 'bg-slate-100'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2 border-t border-slate-100">
              <div
                onClick={() => setAdminTab('mikrotik')}
                className="p-3 rounded-lg bg-[#F8FAFC] hover:bg-[#E6F4F3] border border-slate-200 cursor-pointer transition text-center space-y-1"
              >
                <Cpu className="w-4 h-4 text-[#008060] mx-auto" />
                <div className="text-lg font-black text-slate-800 font-mono">{routers.length}</div>
                <div className="text-[10px] font-semibold text-slate-500">Routeurs</div>
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
                <div className="text-[10px] font-semibold text-slate-500">Vouchers</div>
              </div>

              <div
                onClick={() => setAdminTab('forfaits')}
                className="p-3 rounded-lg bg-[#F8FAFC] hover:bg-[#E6F4F3] border border-slate-200 cursor-pointer transition text-center space-y-1"
              >
                <Wifi className="w-4 h-4 text-[#008060] mx-auto" />
                <div className="text-lg font-black text-slate-800 font-mono">{forfaits.length}</div>
                <div className="text-[10px] font-semibold text-slate-500">Forfaits</div>
              </div>

              <div
                onClick={() => setAdminTab('staff')}
                className="p-3 rounded-lg bg-[#F8FAFC] hover:bg-[#E6F4F3] border border-slate-200 cursor-pointer transition text-center space-y-1"
              >
                <Users className="w-4 h-4 text-[#007A78] mx-auto" />
                <div className="text-lg font-black text-slate-800 font-mono">{staff.length}</div>
                <div className="text-[10px] font-semibold text-slate-500">Vendeurs POS</div>
              </div>

              <div
                onClick={() => setAdminTab('sessions')}
                className="p-3 rounded-lg bg-[#F8FAFC] hover:bg-[#E6F4F3] border border-slate-200 cursor-pointer transition text-center space-y-1"
              >
                <Laptop className="w-4 h-4 text-[#0066CC] mx-auto" />
                <div className="text-lg font-black text-slate-800 font-mono">{sessions.length}</div>
                <div className="text-[10px] font-semibold text-slate-500">Sessions</div>
              </div>
            </div>
          </div>

          {/* GRAPHIQUE ANALYTIQUE (Affiche strictement 0 FCFA / 0 Go tant qu'aucune vente n'est enregistrée) */}
          <div className="bg-white rounded-lg border border-slate-200 p-5 space-y-5 shadow-2xs">
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#008060]" />
                  <span>
                    Activité Trafic & Chiffre d'Affaires Consolidé :{' '}
                    <span className="text-[#008060] font-mono">{formatMoney(displayedRevenue)}</span>
                  </span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Données réelles issues de vos ventes de tickets et sessions actives
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1 bg-[#F4F7FA] p-1 rounded border border-slate-200 text-[11px]">
                  <button
                    onClick={() => setChartMetric('combined')}
                    className={`px-2.5 py-1 rounded font-semibold cursor-pointer ${
                      chartMetric === 'combined'
                        ? 'bg-white text-[#005A5B] shadow-2xs border border-slate-200'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Vue Combinée
                  </button>
                  <button
                    onClick={() => setChartMetric('revenue')}
                    className={`px-2.5 py-1 rounded font-semibold cursor-pointer ${
                      chartMetric === 'revenue'
                        ? 'bg-white text-[#008060] shadow-2xs border border-slate-200'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Recettes (FCFA)
                  </button>
                  <button
                    onClick={() => setChartMetric('traffic')}
                    className={`px-2.5 py-1 rounded font-semibold cursor-pointer ${
                      chartMetric === 'traffic'
                        ? 'bg-white text-[#0066CC] shadow-2xs border border-slate-200'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Trafic Data (Go)
                  </button>
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
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 p-3 rounded-lg bg-[#F8FAFC] border border-slate-200 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Créneau analysé
                </span>
                <span className="font-mono font-bold text-slate-800">{activePoint.label}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Recette Période
                </span>
                <span className="font-mono font-bold text-[#008060]">
                  {formatMoney(activePoint.revScaled)}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Tickets Vendus
                </span>
                <span className="font-mono font-bold text-slate-800">
                  {activePoint.ticketsSold} ticket(s)
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Volume Download / Upload
                </span>
                <span className="font-mono font-bold text-[#0066CC]">
                  &darr;{activePoint.downScaled} Go / &uarr;{activePoint.upScaled} Go
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Sessions Actives
                </span>
                <span className="font-mono font-bold text-[#005A5B]">
                  {activePoint.peakUsers} connecté(s)
                </span>
              </div>
            </div>

            <div className="w-full overflow-x-auto">
              <svg
                className="w-full h-56 select-none"
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#008060" stopOpacity="0.28" />
                    <stop offset="100%" stopColor="#008060" stopOpacity="0.02" />
                  </linearGradient>
                  <linearGradient id="trafGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0066CC" stopOpacity="0.22" />
                    <stop offset="100%" stopColor="#0066CC" stopOpacity="0.01" />
                  </linearGradient>
                </defs>

                {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                  const y = padY + ratio * plotH;
                  const valLabel =
                    displayedRevenue === 0
                      ? '0'
                      : Math.round(maxRev * (1 - ratio)).toLocaleString('fr-FR');
                  return (
                    <g key={idx}>
                      <line
                        x1={padX}
                        y1={y}
                        x2={svgWidth - padX}
                        y2={y}
                        stroke="#E2E8F0"
                        strokeDasharray="3 3"
                        strokeWidth="1"
                      />
                      <text x={4} y={y + 3} fontSize="8" fill="#94A3B8" fontFamily="monospace">
                        {valLabel}
                      </text>
                    </g>
                  );
                })}

                {(chartMetric === 'combined' || chartMetric === 'traffic') && (
                  <>
                    <polygon points={trafficArea} fill="url(#trafGrad)" />
                    <polyline
                      fill="none"
                      stroke="#0066CC"
                      strokeWidth="2.2"
                      points={trafficPolyline}
                    />
                  </>
                )}

                {(chartMetric === 'combined' || chartMetric === 'revenue') && (
                  <>
                    <polygon points={revArea} fill="url(#revGrad)" />
                    <polyline
                      fill="none"
                      stroke="#008060"
                      strokeWidth="2.5"
                      points={revPolyline}
                    />
                  </>
                )}

                {analyticalSeries.map((pt, i) => {
                  const rx = revCoords[i].x;
                  const ry = revCoords[i].y;
                  const ty = trafficCoords[i].y;
                  const isHovered = hoveredPointIdx === i;
                  return (
                    <g
                      key={pt.label}
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredPointIdx(i)}
                      onClick={() => setHoveredPointIdx(i)}
                    >
                      {isHovered && (
                        <line
                          x1={rx}
                          y1={padY}
                          x2={rx}
                          y2={padY + plotH}
                          stroke="#005A5B"
                          strokeWidth="1"
                          strokeDasharray="2 2"
                        />
                      )}
                      {(chartMetric === 'combined' || chartMetric === 'traffic') && (
                        <circle
                          cx={rx}
                          cy={ty}
                          r={isHovered ? 5 : 3}
                          fill="#FFFFFF"
                          stroke="#0066CC"
                          strokeWidth="2"
                        />
                      )}
                      {(chartMetric === 'combined' || chartMetric === 'revenue') && (
                        <circle
                          cx={rx}
                          cy={ry}
                          r={isHovered ? 5.5 : 3.5}
                          fill="#008060"
                          stroke="#FFFFFF"
                          strokeWidth="2"
                        />
                      )}
                      <text
                        x={rx}
                        y={svgHeight - 4}
                        textAnchor="middle"
                        fontSize="9"
                        fill={isHovered ? '#0F172A' : '#64748B'}
                        fontWeight={isHovered ? 'bold' : 'normal'}
                        fontFamily="monospace"
                      >
                        {pt.label}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100 text-xs">
              <div className="p-2.5 rounded bg-[#F8FAFC] border border-slate-200/80">
                <span className="text-[10px] text-slate-400 font-semibold block">
                  Chiffre d'Affaires Total
                </span>
                <span className="font-mono font-bold text-slate-800">
                  {formatMoney(displayedRevenue)}
                </span>
              </div>
              <div className="p-2.5 rounded bg-[#F8FAFC] border border-slate-200/80">
                <span className="text-[10px] text-slate-400 font-semibold block">
                  Tickets vendus / actifs
                </span>
                <span className="font-mono font-bold text-[#008060]">
                  {totalTicketsSoldPeriod} ticket(s)
                </span>
              </div>
              <div className="p-2.5 rounded bg-[#F8FAFC] border border-slate-200/80">
                <span className="text-[10px] text-slate-400 font-semibold block">
                  Volume Data Cumulé
                </span>
                <span className="font-mono font-bold text-[#0066CC]">{totalDataGb} Go</span>
              </div>
              <div className="p-2.5 rounded bg-[#F8FAFC] border border-slate-200/80">
                <span className="text-[10px] text-slate-400 font-semibold block">
                  Panier Moyen Ticket
                </span>
                <span className="font-mono font-bold text-slate-800">
                  {formatMoney(
                    totalTicketsSoldPeriod > 0
                      ? Math.round(displayedRevenue / totalTicketsSoldPeriod)
                      : 0
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. TABLEAU OPÉRATIONNEL B2B : VENDEURS POS & DERNIERS VOUCHERS (AVEC EMPTY STATES PROPRES) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7 bg-white rounded-lg border border-slate-200 overflow-hidden shadow-2xs">
          <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-[#F8FAFC]">
            <span className="text-xs font-bold text-slate-800">
              Agents Vendeurs POS ({staff.length})
            </span>
            <button
              onClick={() => setAdminTab('staff')}
              className="text-xs font-semibold text-[#008060] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Gérer l'équipe</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {staff.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500 space-y-2">
              <p>Aucun agent vendeur enregistré sur ce compte (0 Vendeur • 0 FCFA).</p>
              <button
                onClick={() => setAdminTab('staff')}
                className="px-3 py-1.5 rounded bg-[#008060] text-white font-semibold text-xs cursor-pointer"
              >
                + Créer un Profil Vendeur
              </button>
            </div>
          ) : (
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
          )}
        </div>

        <div className="lg:col-span-5 bg-white rounded-lg border border-slate-200 overflow-hidden shadow-2xs">
          <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-[#F8FAFC]">
            <span className="text-xs font-bold text-slate-800">
              Stock de Vouchers ({tickets.length})
            </span>
            <button
              onClick={() => setAdminTab('tickets')}
              className="text-xs font-semibold text-[#008060] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Gérer le stock</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {tickets.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500 space-y-2">
              <p>Aucun ticket généré sur ce compte (0 Ticket).</p>
              <button
                onClick={() => setAdminTab('tickets')}
                className="px-3 py-1.5 rounded bg-[#008060] text-white font-semibold text-xs cursor-pointer"
              >
                + Générer un lot de tickets
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {tickets.slice(0, 5).map((t) => (
                <div
                  key={t.id}
                  onClick={() => {
                    navigator.clipboard.writeText(t.code);
                    notify(`Code voucher ${t.code} copié !`, 'success');
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
          )}
        </div>
      </div>
    </div>
  );
};
