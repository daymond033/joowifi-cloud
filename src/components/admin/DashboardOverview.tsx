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

  const avgCpu = routers.length
    ? Math.round(routers.reduce((acc, r) => acc + (r.cpuUsage || 15), 0) / routers.length)
    : 16;
  const avgRam = routers.length
    ? Math.round(routers.reduce((acc, r) => acc + (r.ramUsage || 32), 0) / routers.length)
    : 32;

  const displayName = user?.name ? user.name.split(' ')[0] : 'Administrateur';

  const handleExpressGenerate = () => {
    try {
      const targetForfaitId = expressForfaitId || forfaits[0]?.id;
      if (!targetForfaitId) return;
      const created = sellTicketPOS(targetForfaitId, 'Client Console SDN', staff[0]?.id);
      setLastExpressTicket({
        code: created.code,
        forfaitName: created.forfaitName,
        price: created.price,
      });
      showToast(
        `Voucher ${created.code} généré et synchronisé avec Supabase & MikroTik.`,
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
    <div className="space-y-6 pb-12 text-[#1E293B]">
      {/* 1. EN-TÊTE INSTITUTIONNEL & SÉLECTEUR DE PÉRIODE */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 rounded-lg border border-slate-200">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#007A78] mb-1">
            CONTRÔLEUR CLOUD SDN JOOWIFI • VUE GLOBALE
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">
            Tableau de Bord Opérateur — {displayName}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Supervision centralisée de {zones.length} sites WiFi, {routers.length} passerelles MikroTik et {tickets.length} vouchers.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1 bg-[#F4F6F8] p-1 rounded border border-slate-200 self-start lg:self-auto">
          {(
            [
              { id: 'today', label: "Aujourd'hui" },
              { id: 'week', label: '7 Jours' },
              { id: 'month', label: '30 Jours' },
              { id: 'all', label: 'Global' },
            ] as const
          ).map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedPeriod(p.id)}
              className={`px-3.5 py-1.5 rounded text-xs font-semibold transition cursor-pointer ${
                selectedPeriod === p.id
                  ? 'bg-[#007A78] text-white keep-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Alertes SOS Vendeurs */}
      {pendingSosAlerts.length > 0 && (
        <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs">
            <strong className="text-rose-800 block text-sm">
              {pendingSosAlerts.length} Demande(s) de Recharge Crédit Vendeur POS
            </strong>
            <span className="text-rose-700">
              {pendingSosAlerts[0].vendorName} ({pendingSosAlerts[0].zoneName}) sollicite un rechargement.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                rechargeStaff(pendingSosAlerts[0].vendorId, 25000);
                clearSosAlert(pendingSosAlerts[0].id);
              }}
              className="px-3.5 py-2 rounded bg-[#007A78] text-white font-semibold text-xs cursor-pointer keep-white"
            >
              Créditer +25 000 F
            </button>
            <button
              onClick={() => setAdminTab('staff')}
              className="px-3 py-2 rounded bg-white text-slate-700 text-xs font-semibold border border-slate-300 cursor-pointer"
            >
              Gérer
            </button>
          </div>
        </div>
      )}

      {/* 2. CARTES KPI SUR FOND BLANC PUR (FLAT DESIGN OMADA) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => setAdminTab('comptabilite')}
          className="p-5 bg-white rounded-lg border border-slate-200 hover:border-[#007A78] cursor-pointer transition space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Chiffre d'Affaires</span>
            <div className="w-8 h-8 rounded bg-[#E6F4F3] text-[#007A78] flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-800 font-mono tabular-nums">
            {formatMoney(displayedRevenue)}
          </div>
          <div className="text-[11px] text-[#007A78] font-medium">
            Ventes Caisse POS & Mobile Money
          </div>
        </div>

        <div
          onClick={() => setAdminTab('tickets')}
          className="p-5 bg-white rounded-lg border border-slate-200 hover:border-[#007A78] cursor-pointer transition space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Inventaire Vouchers</span>
            <div className="w-8 h-8 rounded bg-[#E6F4F3] text-[#007A78] flex items-center justify-center">
              <Ticket className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-800 font-mono tabular-nums">
            {tickets.length}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>{availableTicketsCount} disponibles</span>
            <span className="text-[#007A78] font-semibold">{activeTicketsCount} actifs</span>
          </div>
        </div>

        <div
          onClick={() => setAdminTab('mikrotik')}
          className="p-5 bg-white rounded-lg border border-slate-200 hover:border-[#007A78] cursor-pointer transition space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Passerelles MikroTik</span>
            <div className="w-8 h-8 rounded bg-[#E6F4F3] text-[#007A78] flex items-center justify-center">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-800 font-mono tabular-nums">
            {onlineRoutersCount} / {routers.length}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>CPU moy. {avgCpu}%</span>
            <span className="text-[#007A78] font-semibold">RAM {avgRam}%</span>
          </div>
        </div>

        <div
          onClick={() => setAdminTab('staff')}
          className="p-5 bg-white rounded-lg border border-slate-200 hover:border-[#007A78] cursor-pointer transition space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Agents Vendeurs POS</span>
            <div className="w-8 h-8 rounded bg-[#E6F4F3] text-[#007A78] flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-800 font-mono tabular-nums">
            {staff.length}
          </div>
          <div className="text-[11px] text-[#007A78] font-semibold">
            Recette jour : {formatMoney(todayRevenue)}
          </div>
        </div>
      </div>

      {/* 3. TOPOLOGIE RÉSEAU SDN (STYLE OMADA CONTROLLER) + ÉMISSION RAPIDE DE VOUCHER */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Topologie SDN sur fond blanc */}
        <div className="lg:col-span-2 p-6 bg-white rounded-lg border border-slate-200 flex flex-col justify-between space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-800">
                Topologie du Réseau SDN & Synchronisation Cloud
              </h2>
              <p className="text-xs text-slate-500">
                État de la chaîne de liaison : Internet WAN &rarr; Base Supabase &rarr; Passerelle MikroTik &rarr; Clients WiFi
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  forceHeartbeatSync();
                  showToast('Synchronisation envoyée aux passerelles MikroTik.', 'success');
                }}
                className="px-3 py-1.5 rounded bg-[#F4F6F8] hover:bg-slate-200 border border-slate-300 text-xs font-semibold text-slate-700 flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-[#007A78]" />
                <span>Sync ({heartbeatSecondsRemaining}s)</span>
              </button>
              <button
                onClick={() => setAdminTab('installation')}
                className="px-3 py-1.5 rounded bg-[#007A78] hover:bg-[#005A5B] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer keep-white"
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Script RouterOS</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded bg-[#F8FAFC] border border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase">
                <span>1. Liaison WAN</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-[#007A78] shrink-0" />
                <div>
                  <div className="text-xs font-bold text-slate-800">Passerelle FAI</div>
                  <div className="text-[10px] text-slate-500 font-mono">SLA : 99.9%</div>
                </div>
              </div>
            </div>

            <div
              onClick={() => setAdminTab('tickets')}
              className="p-3.5 rounded bg-[#F8FAFC] border border-slate-200 hover:border-[#007A78] space-y-1.5 cursor-pointer"
            >
              <div className="flex items-center justify-between text-[10px] font-bold text-[#007A78] uppercase">
                <span>2. Base Cloud</span>
                <span className="font-mono">12 Tables</span>
              </div>
              <div className="flex items-center gap-2">
                <Server className="w-5 h-5 text-[#007A78] shrink-0" />
                <div>
                  <div className="text-xs font-bold text-slate-800">{tickets.length} Vouchers</div>
                  <div className="text-[10px] text-slate-500 font-mono">Supabase OK</div>
                </div>
              </div>
            </div>

            <div
              onClick={() => setAdminTab('mikrotik')}
              className="p-3.5 rounded bg-[#F8FAFC] border border-slate-200 hover:border-[#007A78] space-y-1.5 cursor-pointer"
            >
              <div className="flex items-center justify-between text-[10px] font-bold text-[#007A78] uppercase">
                <span>3. Routeur OS</span>
                <span className="font-mono">Poll 10s</span>
              </div>
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-[#007A78] shrink-0" />
                <div>
                  <div className="text-xs font-bold text-slate-800">
                    {onlineRoutersCount}/{routers.length} Actif
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">RouterOS v7</div>
                </div>
              </div>
            </div>

            <div
              onClick={() => setAdminTab('sessions')}
              className="p-3.5 rounded bg-[#F8FAFC] border border-slate-200 hover:border-[#007A78] space-y-1.5 cursor-pointer"
            >
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase">
                <span>4. Clients WiFi</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              </div>
              <div className="flex items-center gap-2">
                <Wifi className="w-5 h-5 text-[#007A78] shrink-0" />
                <div>
                  <div className="text-xs font-bold text-slate-800">{sessions.length} Sessions</div>
                  <div className="text-[10px] text-slate-500 font-mono">{staff.length} Agents POS</div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span>
              Mode de communication : <strong className="text-slate-700">HTTPS Pull Sortant (Aucun port ouvert requis)</strong>
            </span>
            <span className="font-mono text-[#007A78] font-semibold">
              Token : {routers[0]?.installToken || 'JWT-AF6L-JG37-7K23'}
            </span>
          </div>
        </div>

        {/* Émission Rapide de Voucher sur fond blanc */}
        <div className="p-6 bg-white rounded-lg border border-slate-200 flex flex-col justify-between space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-800">Émission Rapide de Voucher</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Créez un ticket unitaire immédiatement synchronisé avec votre routeur MikroTik.
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">
                Profil de forfait :
              </label>
              <select
                value={expressForfaitId}
                onChange={(e) => setExpressForfaitId(e.target.value)}
                className="w-full px-3 py-2 rounded bg-[#F8FAFC] border border-slate-300 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#007A78] cursor-pointer"
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
              className="w-full py-2.5 px-4 rounded bg-[#007A78] hover:bg-[#005A5B] text-white font-semibold text-xs transition cursor-pointer keep-white"
            >
              Générer & Synchroniser le Voucher
            </button>
          </div>

          {lastExpressTicket ? (
            <div className="p-3 rounded bg-[#E6F4F3] border border-[#99D5D3] flex items-center justify-between gap-2">
              <div>
                <div className="text-[10px] uppercase font-bold text-[#005A5B]">
                  Code émis ({lastExpressTicket.forfaitName})
                </div>
                <div className="font-mono font-bold text-base text-slate-900">
                  {lastExpressTicket.code}
                </div>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(lastExpressTicket.code);
                  setCopiedCode(true);
                  setTimeout(() => setCopiedCode(false), 2000);
                }}
                className="px-3 py-1.5 rounded bg-[#007A78] text-white font-semibold text-xs flex items-center gap-1 cursor-pointer keep-white"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Copié' : 'Copier'}</span>
              </button>
            </div>
          ) : (
            <div className="text-xs text-slate-500 flex items-center justify-between pt-2 border-t border-slate-100">
              <span>Création de lots (10 à 500 tickets) :</span>
              <button
                onClick={() => setAdminTab('tickets')}
                className="text-[#007A78] font-semibold hover:underline cursor-pointer"
              >
                Ouvrir Lots &rarr;
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 4. COURBE DE RECETTES 10 JOURS & ACTIVITÉ DES VENDEURS POS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 p-6 bg-white rounded-lg border border-slate-200 flex flex-col justify-between space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-800">
                Historique des Recettes sur 10 Jours
              </h2>
              <p className="text-xs text-slate-500">
                Suivi consolidé des encaissements Caisse POS et Mobile Money
              </p>
            </div>
            <button
              onClick={() => setAdminTab('ventes')}
              className="text-xs font-semibold text-[#007A78] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Rapport complet</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-48 flex items-end gap-3 pt-4 px-1">
            {salesHistory10Days.map((item, idx) => (
              <div key={item.day} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                <div className="opacity-0 group-hover:opacity-100 transition text-[10px] font-mono text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-300 whitespace-nowrap">
                  {formatMoney(item.amount)}
                </div>
                <div
                  className={`w-full rounded-t transition-all ${
                    idx === salesHistory10Days.length - 1
                      ? 'bg-[#007A78]'
                      : 'bg-slate-200 group-hover:bg-[#7BC4B2]'
                  }`}
                  style={{ height: `${item.height}%` }}
                />
                <span className="text-[10px] font-mono text-slate-500 truncate max-w-full">
                  {item.day}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Vendeurs sur fond blanc */}
        <div className="p-6 bg-white rounded-lg border border-slate-200 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-800">Agents Vendeurs POS</h2>
              <p className="text-xs text-slate-500">Synchronisés avec Supabase</p>
            </div>
            <button
              onClick={() => setCurrentSpace('pos')}
              className="px-2.5 py-1 rounded bg-[#E6F4F3] text-[#005A5B] text-xs font-semibold cursor-pointer"
            >
              Caisse POS
            </button>
          </div>

          <div className="space-y-2">
            {staff.slice(0, 4).map((vendor, i) => (
              <div
                key={vendor.id}
                onClick={() => setAdminTab('staff')}
                className="p-3 rounded bg-[#F8FAFC] hover:bg-[#E6F4F3]/50 border border-slate-200 flex items-center justify-between gap-3 cursor-pointer transition"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <span className="w-6 h-6 rounded bg-[#007A78] text-white font-mono font-bold text-xs flex items-center justify-center shrink-0 keep-white">
                    {i + 1}
                  </span>
                  <div className="truncate">
                    <div className="text-xs font-semibold text-slate-800 truncate">{vendor.name}</div>
                    <div className="text-[10px] text-slate-500 truncate">{vendor.zoneName}</div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs font-mono font-bold text-[#007A78]">
                    {formatMoney(vendor.todaySales)}
                  </div>
                  <div className="text-[10px] font-mono text-slate-500">
                    Solde : {formatMoney(vendor.balanceCredit)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setAdminTab('staff')}
            className="w-full py-2 rounded bg-[#F4F6F8] hover:bg-slate-200 border border-slate-300 text-xs font-semibold text-slate-700 cursor-pointer transition"
          >
            Gérer les agents et crédits &rarr;
          </button>
        </div>
      </div>

      {/* 5. SITES WIFI & DERNIERS VOUCHERS ÉMIS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="p-6 bg-white rounded-lg border border-slate-200 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#007A78]" />
              <span>Sites & Zones Déployés</span>
            </h2>
            <button
              onClick={() => setAdminTab('zones')}
              className="text-xs font-semibold text-[#007A78] hover:underline cursor-pointer"
            >
              Gérer ({zones.length}) &rarr;
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {zones.slice(0, 4).map((z) => (
              <div
                key={z.id}
                onClick={() => setAdminTab('zones')}
                className="p-3.5 rounded bg-[#F8FAFC] border border-slate-200 hover:border-[#007A78] cursor-pointer transition space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 truncate">{z.name}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#E6F4F3] text-[#005A5B]">
                    En service
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                  <span>{z.city}</span>
                  <span className="text-[#007A78] font-bold">
                    {formatMoney(z.monthlyRevenue)}/mois
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 bg-white rounded-lg border border-slate-200 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Ticket className="w-4 h-4 text-[#007A78]" />
              <span>Derniers Vouchers Synchronisés</span>
            </h2>
            <button
              onClick={() => setAdminTab('tickets')}
              className="text-xs font-semibold text-[#007A78] hover:underline cursor-pointer"
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
                  showToast(`Code ${t.code} copié.`, 'success');
                }}
                className="p-3 rounded bg-[#F8FAFC] border border-slate-200 hover:border-[#007A78] cursor-pointer transition"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-sm text-slate-800">{t.code}</span>
                  <span className="text-[10px] font-semibold text-[#007A78] uppercase">
                    {t.status}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 truncate mt-1">{t.forfaitName}</div>
                <div className="text-[11px] font-mono font-bold text-slate-700 mt-0.5">
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
