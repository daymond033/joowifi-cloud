import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { SAAS_PLANS } from '../../data/mockData';
import {
  Calculator,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Sliders,
  MapPin,
  Ticket,
  Users,
  Wifi,
  CheckCircle2,
} from 'lucide-react';

export const AccountingView: React.FC = () => {
  const {
    zones,
    staff,
    tickets,
    forfaits,
    currentPlanId,
    operatorProfile,
    updateOperatorProfile,
    formatMoney,
    currency,
    setCurrency,
    notify,
  } = useApp();

  const [period, setPeriod] = useState<'today' | 'month' | 'year'>('month');
  const [ispCostInput, setIspCostInput] = useState<number>(
    operatorProfile.defaultIspMonthlyCost || 50000
  );
  const [editingIspCost, setEditingIspCost] = useState(false);

  const currentPlan = SAAS_PLANS.find((p) => p.id === currentPlanId) || SAAS_PLANS[1];
  const multiplier = period === 'today' ? 1 / 30 : period === 'year' ? 12 : 1;

  // Dynamic calculations grounded in actual zones, staff commissions, and tickets
  const metrics = useMemo(() => {
    const baseMonthlyZoneRevenue = zones.reduce((acc, z) => acc + z.monthlyRevenue, 0);
    const activeSoldTicketsSum = tickets
      .filter((t) => t.status === 'actif' || t.status === 'expire')
      .reduce((acc, t) => acc + t.price, 0);

    const grossSales =
      period === 'today'
        ? zones.reduce((acc, z) => acc + (z.todaySales || Math.round(z.monthlyRevenue / 30)), 0)
        : Math.round(Math.max(baseMonthlyZoneRevenue, activeSoldTicketsSum) * multiplier);

    // Weighted real commission rate across active staff
    const totalStaffSales = staff.reduce((acc, s) => acc + (s.totalSales || 1), 0);
    const weightedCommSum = staff.reduce(
      (acc, s) => acc + ((s.totalSales || 1) * s.commissionRate) / 100,
      0
    );
    const avgCommissionRate =
      staff.length > 0 ? Number(((weightedCommSum / totalStaffSales) * 100).toFixed(1)) : 10;

    const vendorCommissions =
      period === 'today'
        ? staff.reduce((acc, s) => acc + Math.round((s.todaySales * s.commissionRate) / 100), 0)
        : Math.round((grossSales * avgCommissionRate) / 100);

    const saasCost = Math.round(currentPlan.priceMonthly * multiplier);
    const totalIspFiber = Math.round(
      zones.reduce((acc, z) => acc + (z.ispMonthlyCost || ispCostInput), 0) * multiplier
    );

    const netProfit = grossSales - vendorCommissions - saasCost - totalIspFiber;
    const netMarginPercent =
      grossSales > 0 ? Math.round((netProfit / grossSales) * 100) : 0;

    return {
      grossSales,
      vendorCommissions,
      avgCommissionRate,
      saasCost,
      totalIspFiber,
      netProfit,
      netMarginPercent,
    };
  }, [zones, staff, tickets, period, multiplier, currentPlan.priceMonthly, ispCostInput]);

  // Breakdown by Forfait popularity
  const forfaitBreakdown = useMemo(() => {
    return forfaits.map((f) => {
      const count = tickets.filter((t) => t.forfaitId === f.id || t.forfaitName === f.name).length;
      const revenue = count * f.price;
      return { ...f, count, revenue };
    });
  }, [forfaits, tickets]);

  const handleSaveIspCost = () => {
    updateOperatorProfile({ defaultIspMonthlyCost: ispCostInput });
    setEditingIspCost(false);
  };

  const handleExportAccountingCSV = () => {
    const headers = 'Zone,Ville,Routeurs,Tickets_Actifs,Revenu_Brut_FCFA,Charges_FAI_FCFA,Net_Zone_FCFA\n';
    const rows = zones
      .map((z) => {
        const rev =
          period === 'today'
            ? z.todaySales || Math.round(z.monthlyRevenue / 30)
            : Math.round(z.monthlyRevenue * multiplier);
        const isp = Math.round((z.ispMonthlyCost || ispCostInput) * multiplier);
        const comm = Math.round((rev * metrics.avgCommissionRate) / 100);
        const net = rev - isp - comm;
        return `"${z.name}","${z.city}",${z.routerCount},${z.activeTicketsCount},${rev},${isp},${net}`;
      })
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `joowifi-bilan-comptable-${period}-${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    notify('Bilan comptable exporté au format CSV.', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-2xl bg-white backdrop-blur-md border border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#E6F4F3] border border-[#99D5D3] flex items-center justify-center text-[#007A78]">
              <Calculator className="w-5 h-5" />
            </div>
            <span>Comptabilité & Bilan d'Exploitation</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Calcul en temps réel des recettes tickets, commissions vendeurs, frais FAI et marges nettes par site.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Period selector */}
          <div className="flex rounded-xl bg-[#F8FAFC] p-1 border border-slate-200 text-xs">
            {(['today', 'month', 'year'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer active:scale-95 ${
                  period === p
                    ? 'bg-[#008060] hover:bg-[#006B50] text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-800'
                }`}
              >
                {p === 'today' ? 'Aujourd’hui' : p === 'month' ? 'Ce Mois' : 'Projection 12 Mois'}
              </button>
            ))}
          </div>

          {/* Currency Switcher */}
          <div className="flex rounded-xl bg-[#F8FAFC] p-1 border border-slate-200 text-xs font-mono">
            {(['XOF', 'GNF', 'EUR', 'USD'] as const).map((c) => (
              <button
                key={c}
                onClick={() => setCurrency(c)}
                className={`px-2.5 py-1.5 rounded-lg font-bold transition cursor-pointer active:scale-95 ${
                  currency === c
                    ? 'bg-[#E6F4F3] border border-[#99D5D3] text-[#005A5B]'
                    : 'text-slate-400 hover:text-slate-800'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportAccountingCSV}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer active:scale-95"
          >
            <Download className="w-3.5 h-3.5 text-[#007A78]" />
            <span>Exporter CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white backdrop-blur-md border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              Chiffre d'Affaires Brut
            </span>
            <TrendingUp className="w-4 h-4 text-[#007A78]" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-800 font-mono tabular-nums">
            {formatMoney(metrics.grossSales)}
          </div>
          <div className="text-[11px] text-[#008060] flex items-center gap-1 font-medium">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Ventes Caisse POS & Portail Mobile Money</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white backdrop-blur-md border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              Commissions Vendeurs
            </span>
            <Users className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-rose-400 font-mono tabular-nums">
            - {formatMoney(metrics.vendorCommissions)}
          </div>
          <div className="text-[11px] text-slate-400 font-mono tabular-nums">
            Taux moyen pondéré : <strong className="text-slate-700">{metrics.avgCommissionRate}%</strong> ({staff.length} vendeurs)
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white backdrop-blur-md border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              Charges SaaS & FAI Fibre
            </span>
            <button
              onClick={() => setEditingIspCost(!editingIspCost)}
              className="text-[10px] text-[#007A78] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Sliders className="w-3 h-3" /> Ajuster FAI
            </button>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#007A78] font-mono tabular-nums">
            - {formatMoney(metrics.saasCost + metrics.totalIspFiber)}
          </div>
          <div className="text-[11px] text-slate-400 font-mono tabular-nums">
            Plan {currentPlan.name} ({formatMoney(metrics.saasCost)}) + Fibre/Starlink ({formatMoney(metrics.totalIspFiber)})
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#99D5D3] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#005A5B] font-bold uppercase tracking-wider">
              Bénéfice Net Opérateur
            </span>
            <CheckCircle2 className="w-4 h-4 text-[#008060]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#008060] font-mono tabular-nums">
            {formatMoney(metrics.netProfit)}
          </div>
          <div className="text-[11px] text-[#005A5B] font-mono tabular-nums flex items-center gap-1">
            {metrics.netProfit >= 0 ? (
              <ArrowUpRight className="w-3.5 h-3.5" />
            ) : (
              <ArrowDownRight className="w-3.5 h-3.5 text-rose-400" />
            )}
            <span>
              Rentabilité nette : <strong>{metrics.netMarginPercent}%</strong> du CA
            </span>
          </div>
        </div>
      </div>

      {/* Optional ISP Cost Configurator */}
      {editingIspCost && (
        <div className="p-4 rounded-2xl bg-[#E6F4F3] border border-[#99D5D3] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
          <div>
            <strong className="text-[#005A5B] block">
              Coût mensuel moyen de l'abonnement Internet (Fibre / 4G / Starlink) par zone
            </strong>
            <span className="text-slate-600">
              Utilisé pour calculer automatiquement votre bénéfice net réel après déduction des charges télécoms.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              step="5000"
              value={ispCostInput}
              onChange={(e) => setIspCostInput(Number(e.target.value))}
              className="w-36 px-3 py-2 rounded-xl bg-[#F8FAFC] border border-[#99D5D3] text-slate-800 font-mono text-xs"
            />
            <button
              onClick={handleSaveIspCost}
              className="px-4 py-2 rounded-xl bg-[#008060] hover:bg-[#006B50] text-white font-bold text-xs cursor-pointer"
            >
              Appliquer
            </button>
          </div>
        </div>
      )}

      {/* Two-Column Breakdown: By Zone & By Forfait */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Breakdown by Zone (7 cols) */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-white backdrop-blur-md border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#007A78]" />
              <span>Rentabilité par Zone WiFi</span>
            </h2>
            <span className="text-xs text-slate-400 font-mono tabular-nums">
              {zones.length} site(s) actif(s)
            </span>
          </div>

          <div className="space-y-3">
            {zones.map((zone) => {
              const zoneRevenue =
                period === 'today'
                  ? zone.todaySales || Math.round(zone.monthlyRevenue / 30)
                  : Math.round(zone.monthlyRevenue * multiplier);
              const percentage =
                metrics.grossSales > 0
                  ? Math.min(100, Math.round((zoneRevenue / metrics.grossSales) * 100))
                  : 0;
              const zoneIsp = Math.round((zone.ispMonthlyCost || ispCostInput) * multiplier);
              const zoneNet =
                zoneRevenue - Math.round((zoneRevenue * metrics.avgCommissionRate) / 100) - zoneIsp;

              return (
                <div
                  key={zone.id}
                  className="p-4 rounded-xl bg-[#F8FAFC] border border-slate-200 space-y-2.5 text-xs"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h3 className="font-bold text-slate-800 text-xs flex items-center gap-2">
                        <span>{zone.name}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E6F4F3] text-[#005A5B] border border-[#99D5D3] font-mono">
                          {percentage}% du CA
                        </span>
                      </h3>
                      <span className="text-[11px] text-slate-400 font-mono tabular-nums">
                        {zone.city} • {zone.routerCount} routeur(s) • {zone.activeTicketsCount} tickets actifs
                      </span>
                    </div>
                    <div className="text-right font-mono tabular-nums">
                      <span className="font-bold text-slate-800 text-sm block">
                        {formatMoney(zoneRevenue)}
                      </span>
                      <span className="text-[10px] text-[#008060] font-semibold">
                        Net : {formatMoney(zoneNet)}
                      </span>
                    </div>
                  </div>

                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Breakdown by Forfait Catalogue (5 cols) */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-white backdrop-blur-md border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Wifi className="w-4 h-4 text-[#008060]" />
              <span>Performance par Forfait</span>
            </h2>
            <span className="text-xs text-slate-400 font-mono tabular-nums">
              {tickets.length} tickets
            </span>
          </div>

          <div className="space-y-3">
            {forfaitBreakdown.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl bg-[#F8FAFC] border border-slate-200 flex items-center justify-between text-xs"
              >
                <div className="space-y-0.5">
                  <div className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Ticket className="w-3.5 h-3.5 text-[#007A78]" />
                    <span>{item.name}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono tabular-nums">
                    Tarif : {formatMoney(item.price)} • {item.downloadSpeedMbps}M/{item.uploadSpeedMbps}M
                  </div>
                </div>

                <div className="text-right font-mono tabular-nums">
                  <div className="font-bold text-[#008060]">{formatMoney(item.revenue)}</div>
                  <div className="text-[10px] text-slate-400">{item.count} ticket(s) générés</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
