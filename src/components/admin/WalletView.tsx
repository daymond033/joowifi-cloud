import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Wallet,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  Search,
  Download,
  X,
  ShieldCheck,
  Smartphone,
} from 'lucide-react';
import { WalletTransaction } from '../../types';

export const WalletView: React.FC = () => {
  const { walletBalance, transactions, rechargeWallet, formatMoney, notify } = useApp();

  const [rechargeModalOpen, setRechargeModalOpen] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState<number>(30000);
  const [paymentMethod, setPaymentMethod] = useState<WalletTransaction['paymentMethod']>('Wave');
  const [payerPhone, setPayerPhone] = useState('+225 07 08 44 12 90');
  const [filterType, setFilterType] = useState<'all' | 'credit' | 'debit'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const matchesType = filterType === 'all' || tx.type === filterType;
      const matchesSearch =
        tx.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (tx.paymentMethod || '').toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [transactions, filterType, searchQuery]);

  const totalCredits = useMemo(
    () => transactions.filter((t) => t.type === 'credit').reduce((acc, t) => acc + t.amount, 0),
    [transactions]
  );
  const totalDebits = useMemo(
    () => transactions.filter((t) => t.type === 'debit').reduce((acc, t) => acc + t.amount, 0),
    [transactions]
  );

  const handleRecharge = (e: React.FormEvent) => {
    e.preventDefault();
    if (rechargeAmount < 1000) {
      notify('Le montant minimum de recharge est de 1 000 FCFA.', 'warning');
      return;
    }
    rechargeWallet(rechargeAmount, paymentMethod);
    setRechargeModalOpen(false);
  };

  const exportLedgerCSV = () => {
    const headers = 'ID,Date,Type,Categorie,Reference,Moyen_Paiement,Montant_FCFA,Statut\n';
    const rows = filteredTransactions
      .map(
        (tx) =>
          `"${tx.id}","${tx.timestamp}","${tx.type}","${tx.category}","${tx.reference}","${
            tx.paymentMethod || 'Système'
          }",${tx.amount},"${tx.status}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `joowifi-ledger-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    notify('Grand livre (Ledger) exporté au format CSV.', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Balance */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-[#0B0F19] to-amber-950/40 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Wallet className="w-4 h-4" />
            <span>Portefeuille Prépayé Joowifi Pay (Ledger Central)</span>
          </div>
          <div className="text-3xl sm:text-5xl font-black text-white font-mono tabular-nums tracking-tight">
            {formatMoney(walletBalance)}
          </div>
          <p className="text-xs text-slate-400 max-w-xl">
            Compte prépayé sécurisé permettant de régler vos abonnements SaaS Joowifi, vos packs de zones et les commissions de votre équipe de vendeurs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setRechargeModalOpen(true)}
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-extrabold text-xs shadow-xl shadow-amber-500/25 transition cursor-pointer active:scale-95 flex items-center gap-2"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Recharger par Mobile Money</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/40 backdrop-blur-md border border-white/10 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 uppercase font-semibold block">
              Total Rechargé (Crédits)
            </span>
            <span className="text-xl font-extrabold text-emerald-400 font-mono tabular-nums">
              + {formatMoney(totalCredits)}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <ArrowDownLeft className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/40 backdrop-blur-md border border-white/10 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 uppercase font-semibold block">
              Total Débité (SaaS & Staff)
            </span>
            <span className="text-xl font-extrabold text-rose-400 font-mono tabular-nums">
              - {formatMoney(totalDebits)}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/40 backdrop-blur-md border border-white/10 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 uppercase font-semibold block">
              Opérations Enregistrées
            </span>
            <span className="text-xl font-extrabold text-white font-mono tabular-nums">
              {transactions.length} écritures
            </span>
          </div>
          <button
            onClick={exportLedgerCSV}
            className="px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-white/10 text-xs font-semibold text-amber-400 flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* Transaction History */}
      <div className="p-6 rounded-2xl bg-slate-900/40 backdrop-blur-md border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-base font-bold text-white">
            Grand Livre des Transactions (Ledger)
          </h2>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Référence, moyen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex rounded-xl bg-slate-950 p-1 border border-white/10 text-xs">
              {(['all', 'credit', 'debit'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer ${
                    filterType === t
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {t === 'all' ? 'Toutes' : t === 'credit' ? 'Crédits' : 'Débits'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/90 text-slate-400 uppercase tracking-wider text-[10px] border-b border-white/10">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Opération</th>
                <th className="py-3 px-4">Référence</th>
                <th className="py-3 px-4">Canal Mobile Money</th>
                <th className="py-3 px-4 text-right">Montant</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono tabular-nums">
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-900/60 transition">
                  <td className="py-3 px-4 text-slate-400 text-[11px]">
                    {new Date(tx.timestamp).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="py-3 px-4 font-sans font-medium text-slate-200">
                    <div className="flex items-center gap-2">
                      {tx.type === 'credit' ? (
                        <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      ) : (
                        <ArrowUpRight className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      )}
                      <span>{tx.category}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-400 text-[11px]">{tx.reference}</td>
                  <td className="py-3 px-4 font-sans text-slate-300">
                    <span className="px-2 py-0.5 rounded-md bg-slate-950 border border-white/10 text-[11px]">
                      {tx.paymentMethod || 'Ledger Interne'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-bold">
                    <span className={tx.type === 'credit' ? 'text-emerald-400' : 'text-rose-400'}>
                      {tx.type === 'credit' ? '+' : '-'} {formatMoney(tx.amount)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Recharge */}
      {rechargeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-[#0B0F19] border border-white/15 p-6 shadow-2xl text-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-amber-400" />
                <span>Recharger Joowifi Pay</span>
              </h3>
              <button
                onClick={() => setRechargeModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecharge} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-slate-400 font-semibold">Montant rapide :</label>
                <div className="grid grid-cols-3 gap-2 font-mono tabular-nums">
                  {[15000, 30000, 60000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setRechargeAmount(amt)}
                      className={`py-2.5 rounded-xl font-bold border transition cursor-pointer active:scale-95 ${
                        rechargeAmount === amt
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                          : 'bg-slate-900 border-white/10 text-slate-300 hover:text-white'
                      }`}
                    >
                      {formatMoney(amt)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-semibold">Montant personnalisé (FCFA) :</label>
                <input
                  type="number"
                  min="1000"
                  step="1000"
                  value={rechargeAmount}
                  onChange={(e) => setRechargeAmount(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white focus:outline-none focus:border-amber-500 text-xs font-mono tabular-nums"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400 font-semibold">Opérateur Mobile Money :</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Wave', 'Orange Money', 'MTN MoMo', 'Moov Money'] as const).map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`p-3 rounded-xl border text-left font-bold transition cursor-pointer flex items-center justify-between ${
                        paymentMethod === method
                          ? 'bg-amber-500/15 border-amber-500 text-amber-300'
                          : 'bg-slate-950 border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      <span>{method}</span>
                      <Smartphone className="w-3.5 h-3.5 opacity-70" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-semibold">Numéro Mobile Money débité :</label>
                <input
                  type="tel"
                  required
                  value={payerPhone}
                  onChange={(e) => setPayerPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2 text-[11px] text-emerald-300">
                <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>Crédit immédiat sans frais d'agrégation sur votre solde Joowifi Pay.</span>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-extrabold text-xs transition cursor-pointer shadow-lg shadow-amber-500/25 active:scale-95"
              >
                Confirmer la recharge (+{formatMoney(rechargeAmount)})
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
