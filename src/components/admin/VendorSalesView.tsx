import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  TrendingUp,
  Users,
  CheckCircle2,
  MapPin,
  Download,
  Coins,
  Award,
} from 'lucide-react';

export const VendorSalesView: React.FC = () => {
  const { staff, zones, payStaffCommission, formatMoney, notify } = useApp();
  const [filterPeriod, setFilterPeriod] = useState<'today' | 'week' | 'month'>('today');
  const [selectedZone, setSelectedZone] = useState<string>('all');

  const filteredStaff = useMemo(() => {
    return staff.filter((s) => selectedZone === 'all' || s.zoneId === selectedZone || s.zoneName === selectedZone);
  }, [staff, selectedZone]);

  const getPeriodSales = (s: typeof staff[0]) => {
    if (filterPeriod === 'today') return s.todaySales;
    if (filterPeriod === 'week') return Math.round(s.totalSales * 0.35);
    return s.totalSales;
  };

  const totalSalesAll = filteredStaff.reduce((acc, s) => acc + getPeriodSales(s), 0);
  const totalCommissionsAll = filteredStaff.reduce(
    (acc, s) => acc + Math.round((getPeriodSales(s) * s.commissionRate) / 100),
    0
  );

  const exportVendorReportCSV = () => {
    const headers = 'Vendeur,Telephone,Zone,Taux_Commission_Pct,Ventes_FCFA,Commission_Due_FCFA,Objectif_Jour_FCFA\n';
    const rows = filteredStaff
      .map((s) => {
        const sales = getPeriodSales(s);
        const comm = Math.round((sales * s.commissionRate) / 100);
        return `"${s.name}","${s.phone}","${s.zoneName}",${s.commissionRate},${sales},${comm},${s.dailyGoal}`;
      })
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `joowifi-ventes-vendeurs-${filterPeriod}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    notify('Rapport des performances vendeurs exporté en CSV.', 'success');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-2xl bg-white backdrop-blur-md border border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#E6F4F3] border border-[#99D5D3] flex items-center justify-center text-[#007A78]">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span>Rapport des Ventes Vendeurs & Commissions</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Suivi individuel des encaissements Caisse POS sur le terrain et règlement des commissions en 1 clic.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Zone Filter */}
          <select
            value={selectedZone}
            onChange={(e) => setSelectedZone(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#F8FAFC] border border-slate-200 text-xs text-slate-700 focus:outline-none focus:border-amber-500"
          >
            <option value="all">Toutes les zones ({zones.length})</option>
            {zones.map((z) => (
              <option key={z.id} value={z.id}>
                {z.name}
              </option>
            ))}
          </select>

          <div className="flex rounded-xl bg-[#F8FAFC] p-1 border border-slate-200 text-xs">
            {(['today', 'week', 'month'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setFilterPeriod(p)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer active:scale-95 ${
                  filterPeriod === p
                    ? 'bg-[#008060] hover:bg-[#006B50] text-white font-bold'
                    : 'text-slate-400 hover:text-slate-800'
                }`}
              >
                {p === 'today' ? 'Aujourd’hui' : p === 'week' ? '7 Derniers Jours' : 'Mois en cours'}
              </button>
            ))}
          </div>

          <button
            onClick={exportVendorReportCSV}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#007A78]" />
            <span>Exporter CSV</span>
          </button>
        </div>
      </div>

      {/* Aggregate metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white backdrop-blur-md border border-slate-200 space-y-1">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
            Total CA Vendeurs POS
          </span>
          <div className="text-3xl font-extrabold text-slate-800 font-mono tabular-nums">
            {formatMoney(totalSalesAll)}
          </div>
          <p className="text-[11px] text-slate-400">
            Tickets vendus par {filteredStaff.length} vendeur(s) actif(s)
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white backdrop-blur-md border border-slate-200 space-y-1">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
            Commissions Équipe Terrain
          </span>
          <div className="text-3xl font-extrabold text-[#007A78] font-mono tabular-nums">
            {formatMoney(totalCommissionsAll)}
          </div>
          <p className="text-[11px] text-slate-400">Rémunération variable cumulée sur la période</p>
        </div>

        <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/50 via-slate-900/60 to-slate-950 border border-[#99D5D3] space-y-1">
          <span className="text-xs text-[#005A5B] font-semibold uppercase tracking-wider">
            Revenu Net Opérateur
          </span>
          <div className="text-3xl font-extrabold text-[#008060] font-mono tabular-nums">
            {formatMoney(totalSalesAll - totalCommissionsAll)}
          </div>
          <p className="text-[11px] text-[#005A5B]/80">Net encaissé après commissions vendeurs</p>
        </div>
      </div>

      {/* Staff Breakdown Table */}
      <div className="p-6 rounded-2xl bg-white backdrop-blur-md border border-slate-200 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Award className="w-4 h-4 text-[#007A78]" />
            <span>Classement & Règlement des Commissions</span>
          </h2>
          <span className="text-xs text-slate-400">
            Cliquez sur « Régler » pour reverser la commission via Joowifi Pay
          </span>
        </div>

        <div className="rounded-xl border border-slate-200 overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-[#F8FAFC] text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Vendeur</th>
                <th className="py-3 px-4">Zone Affectée</th>
                <th className="py-3 px-4">Commission</th>
                <th className="py-3 px-4">Chiffre Réalisé</th>
                <th className="py-3 px-4">Commission Due</th>
                <th className="py-3 px-4">Progression Jour</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono tabular-nums">
              {filteredStaff.map((s) => {
                const sales = getPeriodSales(s);
                const commission = Math.round((sales * s.commissionRate) / 100);
                const netDue = Math.max(0, commission - (s.paidCommissions || 0));
                const percent = Math.min(100, Math.round((s.todaySales / (s.dailyGoal || 1)) * 100));

                return (
                  <tr key={s.id} className="hover:bg-white transition">
                    <td className="py-3.5 px-4 font-sans">
                      <strong className="text-slate-800 block text-xs">{s.name}</strong>
                      <span className="text-[10px] text-slate-400 font-mono">{s.phone}</span>
                    </td>
                    <td className="py-3.5 px-4 font-sans text-slate-600">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#007A78]" />
                        {s.zoneName}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-[#005A5B] font-bold">{s.commissionRate}%</td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">{formatMoney(sales)}</td>
                    <td className="py-3.5 px-4 font-bold text-[#007A78]">
                      {formatMoney(netDue)}
                      {(s.paidCommissions || 0) > 0 && (
                        <span className="block text-[10px] text-[#008060] font-normal">
                          Payé : {formatMoney(s.paidCommissions || 0)}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-sans">
                      <div className="w-28 space-y-1">
                        <div className="text-[10px] flex justify-between text-slate-600 font-mono">
                          <span>{percent}%</span>
                          <span className="text-slate-500">{formatMoney(s.dailyGoal)}</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-amber-500 to-emerald-400"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-sans">
                      {netDue > 0 ? (
                        <button
                          onClick={() => payStaffCommission(s.id, netDue)}
                          className="px-3 py-1.5 rounded-xl bg-[#E6F4F3] hover:bg-emerald-500/30 border border-[#99D5D3] text-[#005A5B] font-bold text-[11px] inline-flex items-center gap-1.5 transition cursor-pointer active:scale-95"
                        >
                          <Coins className="w-3.5 h-3.5" />
                          <span>Régler</span>
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-[#008060] font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Soldé
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
