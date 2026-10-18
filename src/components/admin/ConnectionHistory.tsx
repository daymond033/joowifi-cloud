import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { History, CheckCircle2, XCircle, Search, Download, Cookie } from 'lucide-react';

export const ConnectionHistory: React.FC = () => {
  const { connectionLogs, routers, notify } = useApp();
  const [filterStatus, setFilterStatus] = useState<'all' | 'success' | 'failed'>('all');
  const [selectedRouter, setSelectedRouter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = useMemo(() => {
    return connectionLogs.filter((log) => {
      const matchesStatus = filterStatus === 'all' || log.status === filterStatus;
      const matchesRouter = selectedRouter === 'all' || log.routerName === selectedRouter;
      const matchesSearch =
        log.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.macAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.routerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.reason || '').toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStatus && matchesRouter && matchesSearch;
    });
  }, [connectionLogs, filterStatus, selectedRouter, searchTerm]);

  const successCount = connectionLogs.filter((l) => l.status === 'success').length;
  const failedCount = connectionLogs.filter((l) => l.status === 'failed').length;
  const successRate =
    connectionLogs.length > 0 ? Math.round((successCount / connectionLogs.length) * 100) : 100;

  const exportHistoryCSV = () => {
    const headers = 'Horodatage,Statut,Ticket_Code,Adresse_MAC,Routeur,Details\n';
    const rows = filtered
      .map(
        (l) =>
          `"${l.timestamp}","${l.status}","${l.username}","${l.macAddress}","${l.routerName}","${
            l.reason || 'Authentification acceptée (Cookie MAC actif)'
          }"`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `joowifi-connexions-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    notify('Historique des connexions exporté au format CSV.', 'success');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/40 backdrop-blur-md border border-white/10">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <History className="w-5 h-5" />
            </div>
            <span>Historique des Connexions & Cookie MAC (24h)</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Traçabilité des authentifications Hotspot, reconnexions automatiques par Cookie MAC et tentatives refusées.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-xl bg-slate-950 p-1 border border-white/10 text-xs">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                filterStatus === 'all'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Toutes ({connectionLogs.length})
            </button>
            <button
              onClick={() => setFilterStatus('success')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                filterStatus === 'success'
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Réussies ({successCount})
            </button>
            <button
              onClick={() => setFilterStatus('failed')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                filterStatus === 'failed'
                  ? 'bg-rose-500 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Refusées ({failedCount})
            </button>
          </div>

          <button
            onClick={exportHistoryCSV}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-slate-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* Summary & Search Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
        <div className="lg:col-span-8 p-4 rounded-2xl bg-slate-900/40 backdrop-blur-md border border-white/10 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-2.5" />
            <input
              type="text"
              placeholder="Rechercher un code ticket, une adresse MAC ou un motif..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          <select
            value={selectedRouter}
            onChange={(e) => setSelectedRouter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
          >
            <option value="all">Tous les routeurs MikroTik</option>
            {routers.map((r) => (
              <option key={r.id} value={r.name}>
                {r.name}
              </option>
            ))}
          </select>
        </div>

        <div className="lg:col-span-4 p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/20 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5">
            <Cookie className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <strong className="text-white block">Taux d'accès réussi : {successRate}%</strong>
              <span className="text-[11px] text-slate-400">Synchronisation Cookie MAC active</span>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-slate-900/40 backdrop-blur-md border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/90 text-slate-400 uppercase tracking-wider text-[10px] border-b border-white/10">
              <tr>
                <th className="py-3 px-4">Horodatage</th>
                <th className="py-3 px-4">Statut</th>
                <th className="py-3 px-4">Identifiant / Ticket</th>
                <th className="py-3 px-4">Adresse MAC</th>
                <th className="py-3 px-4">Routeur MikroTik</th>
                <th className="py-3 px-4">Motif / Détails</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono tabular-nums">
              {filtered.map((log) => (
                <tr key={log.id} className="hover:bg-slate-900/60 transition">
                  <td className="py-3 px-4 text-slate-400 text-[11px]">
                    {new Date(log.timestamp).toLocaleTimeString('fr-FR')}
                  </td>
                  <td className="py-3 px-4 font-sans">
                    {log.status === 'success' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Connecté</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-400">
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Refusé</span>
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-bold text-white">{log.username}</td>
                  <td className="py-3 px-4 text-amber-300/90">{log.macAddress}</td>
                  <td className="py-3 px-4 font-sans text-slate-300">{log.routerName}</td>
                  <td className="py-3 px-4 font-sans text-slate-400">
                    {log.reason || 'Authentification acceptée (Cookie MAC enregistré)'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
