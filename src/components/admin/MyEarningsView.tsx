import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  DollarSign,
  ArrowUpRight,
  CheckCircle2,
  X,
  ShieldCheck,
  Smartphone,
  Zap,
  History,
} from 'lucide-react';

export const MyEarningsView: React.FC = () => {
  const {
    gainsBalance,
    withdrawGains,
    simulateDirectMomoPurchase,
    forfaits,
    transactions,
    formatMoney,
    notify,
  } = useApp();

  const [payoutModalOpen, setPayoutModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState<number>(50000);
  const [withdrawPhone, setWithdrawPhone] = useState('+225 01 00 44 38 39');
  const [withdrawProvider, setWithdrawProvider] = useState<'Wave' | 'Orange' | 'MTN' | 'Moov'>('Wave');
  const [payoutSuccess, setPayoutSuccess] = useState(false);

  const withdrawalHistory = transactions.filter(
    (t) => t.category === 'Retrait Gains' || t.reference.startsWith('CAPTIVE-')
  );

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    if (withdrawAmount < 5000) {
      notify('Le seuil minimum de retrait est de 5 000 FCFA.', 'warning');
      return;
    }
    if (withdrawAmount > gainsBalance) {
      notify('Solde de gains insuffisant pour ce montant de retrait.', 'error');
      return;
    }
    const ok = withdrawGains(withdrawAmount, withdrawPhone, withdrawProvider);
    if (ok) {
      setPayoutSuccess(true);
      setTimeout(() => {
        setPayoutSuccess(false);
        setPayoutModalOpen(false);
      }, 1800);
    }
  };

  const handleSimulateClientPurchase = () => {
    const sampleForfait = forfaits[1] || forfaits[0];
    if (!sampleForfait) return;
    simulateDirectMomoPurchase(sampleForfait.id, '+225 07 58 19 42 10', 'Wave');
  };

  return (
    <div className="space-y-6">
      {/* Balance Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-950/80 via-[#0B0F19] to-slate-950 border border-[#99D5D3] flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[#008060] text-xs font-bold uppercase tracking-wider">
            <DollarSign className="w-4 h-4" />
            <span>Mes Gains Mobile Money Directs (Portail Captif)</span>
          </div>
          <div className="text-3xl sm:text-5xl font-black text-[#008060] font-mono tabular-nums tracking-tight">
            {formatMoney(gainsBalance)}
          </div>
          <p className="text-xs text-slate-400 max-w-xl">
            Revenus encaissés automatiquement lorsque vos abonnés WiFi achètent leur ticket en ligne sur votre portail captif via Wave, Orange Money, MTN MoMo ou Moov.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleSimulateClientPurchase}
            className="px-4 py-3 rounded-2xl bg-white hover:bg-slate-100 border border-slate-200 text-[#005A5B] font-bold text-xs transition cursor-pointer active:scale-95 flex items-center gap-2"
          >
            <Zap className="w-4 h-4 text-[#007A78]" />
            <span>Simuler un achat client en ligne</span>
          </button>

          <button
            onClick={() => setPayoutModalOpen(true)}
            disabled={gainsBalance < 5000}
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 disabled:opacity-50 text-slate-950 font-extrabold text-xs shadow-xl shadow-emerald-600/25 transition cursor-pointer active:scale-95 flex items-center gap-2"
          >
            <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
            <span>Demander un Virement Mobile Money</span>
          </button>
        </div>
      </div>

      {/* Explanatory Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl bg-white backdrop-blur-md border border-slate-200 space-y-2 text-xs">
          <div className="w-9 h-9 rounded-xl bg-[#E6F4F3] border border-[#99D5D3] text-[#007A78] flex items-center justify-center font-mono font-bold">
            0%
          </div>
          <h3 className="font-bold text-slate-800">Zéro Frais de Retrait</h3>
          <p className="text-slate-400 leading-relaxed">
            Joowifi ne prélève aucun frais sur vos retraits vers Wave, Orange, MTN ou Moov. Vous recevez 100% du solde demandé.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white backdrop-blur-md border border-slate-200 space-y-2 text-xs">
          <div className="w-9 h-9 rounded-xl bg-[#E6F4F3] border border-[#99D5D3] text-[#008060] flex items-center justify-center font-bold">
            <Smartphone className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-slate-800">Virement Instantané 24h/24</h3>
          <p className="text-slate-400 leading-relaxed">
            Les fonds sont transférés sur votre numéro Mobile Money en moins de 5 minutes, week-ends et jours fériés inclus.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white backdrop-blur-md border border-slate-200 space-y-2 text-xs">
          <div className="w-9 h-9 rounded-xl bg-[#EFF6FF] border border-blue-200 text-[#0066CC] flex items-center justify-center font-mono font-bold">
            5k
          </div>
          <h3 className="font-bold text-slate-800">Seuil Minimum Accessible</h3>
          <p className="text-slate-400 leading-relaxed">
            Retirez votre trésorerie dès 5 000 FCFA cumulés afin de payer vos charges ou réapprovisionner vos points de vente.
          </p>
        </div>
      </div>

      {/* History of Direct Captive Portal Sales & Withdrawals */}
      <div className="p-6 rounded-2xl bg-white backdrop-blur-md border border-slate-200 space-y-4">
        <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
          <History className="w-4 h-4 text-[#008060]" />
          <span>Flux des Paiements Portail Captif & Retraits</span>
        </h2>

        <div className="rounded-xl border border-slate-200 overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-[#F8FAFC] text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Nature de l'opération</th>
                <th className="py-3 px-4">Référence</th>
                <th className="py-3 px-4">Opérateur</th>
                <th className="py-3 px-4 text-right">Montant</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono tabular-nums">
              {withdrawalHistory.map((tx) => (
                <tr key={tx.id} className="hover:bg-white transition">
                  <td className="py-3 px-4 text-slate-400 text-[11px]">
                    {new Date(tx.timestamp).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="py-3 px-4 font-sans font-semibold text-slate-800">
                    {tx.reference.startsWith('CAPTIVE-')
                      ? 'Encaissement Ticket Portail Captif'
                      : tx.category}
                  </td>
                  <td className="py-3 px-4 text-slate-400 text-[11px]">{tx.reference}</td>
                  <td className="py-3 px-4 font-sans text-slate-600">{tx.paymentMethod || 'Wave'}</td>
                  <td className="py-3 px-4 text-right font-bold">
                    <span className={tx.type === 'credit' ? 'text-[#008060]' : 'text-[#007A78]'}>
                      {tx.type === 'credit' ? '+' : '-'} {formatMoney(tx.amount)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL PAYOUT */}
      {payoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-white border border-slate-200 p-6 shadow-2xl text-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <ArrowUpRight className="w-5 h-5 text-[#008060]" />
                <span>Retirer mes Gains Mobile Money</span>
              </h3>
              <button
                onClick={() => setPayoutModalOpen(false)}
                className="text-slate-400 hover:text-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {payoutSuccess ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-[#008060] mx-auto animate-bounce" />
                <h4 className="text-base font-bold text-slate-800">Virement Mobile Money Initié !</h4>
                <p className="text-xs text-slate-600">
                  La somme de <strong className="font-mono text-[#008060]">{formatMoney(withdrawAmount)}</strong> a été envoyée vers votre compte {withdrawProvider} (<span className="font-mono">{withdrawPhone}</span>).
                </p>
              </div>
            ) : (
              <form onSubmit={handleWithdraw} className="space-y-4 text-xs">
                <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-slate-200 flex justify-between items-center">
                  <span className="text-slate-400">Solde retirable disponible :</span>
                  <strong className="text-[#008060] font-mono tabular-nums text-sm">
                    {formatMoney(gainsBalance)}
                  </strong>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold">Montant du retrait (FCFA) :</label>
                  <input
                    type="number"
                    min="5000"
                    max={gainsBalance}
                    step="1000"
                    required
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] border border-slate-200 text-slate-800 font-mono tabular-nums text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold">Portefeuille de réception :</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['Wave', 'Orange', 'MTN', 'Moov'] as const).map((prov) => (
                      <button
                        key={prov}
                        type="button"
                        onClick={() => setWithdrawProvider(prov)}
                        className={`p-2.5 rounded-xl border font-bold transition cursor-pointer ${
                          withdrawProvider === prov
                            ? 'bg-[#E6F4F3] border-emerald-500 text-[#005A5B]'
                            : 'bg-[#F8FAFC] border-slate-200 text-slate-400 hover:text-slate-800'
                        }`}
                      >
                        {prov} Money
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold">
                    Numéro de réception ({withdrawProvider}) :
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+225 01 00 44 38 39"
                    value={withdrawPhone}
                    onChange={(e) => setWithdrawPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] border border-slate-200 text-slate-800 font-mono text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="p-3 rounded-xl bg-[#F8FAFC] border border-slate-200 flex items-center gap-2 text-[11px] text-slate-400">
                  <ShieldCheck className="w-4 h-4 text-[#008060] shrink-0" />
                  <span>Transfert sécurisé protégé par double validation opérateur.</span>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-extrabold text-xs transition cursor-pointer shadow-lg shadow-emerald-600/25 active:scale-95"
                >
                  Confirmer le retrait ({formatMoney(withdrawAmount)})
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
