import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FileText, Download, Search, ShieldCheck } from 'lucide-react';

export const AuditLogs: React.FC = () => {
  const { auditLogs, notify } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = auditLogs.filter(
    (log) =>
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.target.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportCSV = () => {
    const headers = 'ID,Date,Utilisateur,Action,Cible,Details,IP\n';
    const rows = filtered
      .map(
        (l) =>
          `"${l.id}","${l.timestamp}","${l.user}","${l.action}","${l.target}","${l.details}","${l.ip}"`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `joowifi-audit-logs-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    notify("Journal d'audit exporté au format CSV.", 'success');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/40 backdrop-blur-md border border-white/10">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <FileText className="w-5 h-5" />
            </div>
            <span>Journal d'Activité & Audit de Sécurité</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Traçabilité horodatée de toutes les opérations administrateur, ventes POS et synchronisations RouterOS.
          </p>
        </div>

        <button
          onClick={exportCSV}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 transition cursor-pointer active:scale-95"
        >
          <Download className="w-4 h-4" />
          <span>Exporter le Journal (CSV)</span>
        </button>
      </div>

      {/* Search */}
      <div className="p-4 rounded-2xl bg-slate-900/40 backdrop-blur-md border border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-2.5" />
          <input
            type="text"
            placeholder="Rechercher par action, cible, ticket ou utilisateur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono">
          <ShieldCheck className="w-4 h-4" />
          <span>{filtered.length} événement(s) certifiés</span>
        </div>
      </div>

      {/* Logs Table */}
      <div className="rounded-2xl bg-slate-900/40 backdrop-blur-md border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/90 text-slate-400 uppercase tracking-wider text-[10px] border-b border-white/10">
              <tr>
                <th className="py-3 px-4">Horodatage</th>
                <th className="py-3 px-4">Opérateur</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Cible</th>
                <th className="py-3 px-4">Détails</th>
                <th className="py-3 px-4 text-right">IP Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono tabular-nums">
              {filtered.map((log) => (
                <tr key={log.id} className="hover:bg-slate-900/60 transition">
                  <td className="py-3 px-4 text-slate-400 text-[11px]">
                    {new Date(log.timestamp).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="py-3 px-4 font-sans text-slate-200">{log.user}</td>
                  <td className="py-3 px-4 font-sans font-bold text-amber-400">{log.action}</td>
                  <td className="py-3 px-4 font-sans text-white font-semibold">{log.target}</td>
                  <td className="py-3 px-4 font-sans text-slate-400 text-[11px]">{log.details}</td>
                  <td className="py-3 px-4 text-right text-slate-500 text-[11px]">{log.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
