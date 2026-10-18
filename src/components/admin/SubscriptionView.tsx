import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SAAS_PLANS } from '../../data/mockData';
import {
  CreditCard,
  Check,
  Download,
  Server,
  Users,
  Ticket,
  FileText,
  Printer,
  X,
  ShieldCheck,
} from 'lucide-react';

interface InvoiceItem {
  id: string;
  period: string;
  date: string;
  amount: number;
  plan: string;
}

export const SubscriptionView: React.FC = () => {
  const {
    currentPlanId,
    upgradePlan,
    routers,
    staff,
    tickets,
    walletBalance,
    operatorProfile,
    formatMoney,
    setAdminTab,
    notify,
  } = useApp();

  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceItem | null>(null);

  const currentPlan = SAAS_PLANS.find((p) => p.id === currentPlanId) || SAAS_PLANS[1];

  const routerUsagePercent = Math.min(
    100,
    Math.round((routers.length / (currentPlan.routerLimit || 1)) * 100)
  );
  const staffUsagePercent = Math.min(
    100,
    Math.round((staff.length / (currentPlan.sellerLimit || 1)) * 100)
  );
  const ticketUsagePercent = Math.min(
    100,
    Math.round((tickets.length / (currentPlan.ticketLimit || 1)) * 100)
  );

  const invoices: InvoiceItem[] = [
    { id: 'FAC-2026-10-01', period: 'Octobre 2026', date: '01/10/2026', amount: currentPlan.priceMonthly, plan: `Plan ${currentPlan.name}` },
    { id: 'FAC-2026-09-01', period: 'Septembre 2026', date: '01/09/2026', amount: 6000, plan: 'Plan Pro' },
    { id: 'FAC-2026-08-01', period: 'Août 2026', date: '01/08/2026', amount: 3000, plan: 'Plan Starter' },
  ];

  const handleDownloadInvoiceHTML = (inv: InvoiceItem) => {
    const htmlContent = `<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <title>Reçu Officiel ${inv.id} - Joowifi</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; color: #0f172a; max-width: 720px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; border-bottom: 2px solid #f59e0b; padding-bottom: 20px; margin-bottom: 30px; }
    .badge { background: #dcfce7; color: #166534; padding: 4px 12px; border-radius: 99px; font-weight: bold; font-size: 12px; }
    table { width: 100%; border-collapse: collapse; margin-top: 24px; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e2e8f0; }
    th { background: #f8fafc; font-size: 12px; text-transform: uppercase; color: #64748b; }
    .total { font-size: 20px; font-weight: 800; color: #0f172a; text-align: right; margin-top: 24px; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1 style="margin:0;color:#d97706;">JOOWIFI CLOUD</h1>
      <p style="margin:4px 0 0;font-size:13px;color:#64748b;">Joo studio — Abidjan, Côte d'Ivoire (+225 01 00 44 38 39)</p>
    </div>
    <div style="text-align:right;">
      <span class="badge">ACQUITTÉE</span>
      <p style="margin:8px 0 0;font-weight:bold;">Facture N° ${inv.id}</p>
      <p style="margin:2px 0 0;font-size:12px;color:#64748b;">Date : ${inv.date}</p>
    </div>
  </div>
  <div>
    <strong>Facturé à :</strong><br/>
    ${operatorProfile.company} (${operatorProfile.name})<br/>
    ${operatorProfile.city}, ${operatorProfile.country}<br/>
    Email : ${operatorProfile.email}
  </div>
  <table>
    <thead>
      <tr>
        <th>Description</th>
        <th>Période</th>
        <th>Mode de règlement</th>
        <th style="text-align:right;">Montant</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Abonnement SaaS Cloud MikroTik — <strong>${inv.plan}</strong></td>
        <td>${inv.period}</td>
        <td>Portefeuille Joowifi Pay</td>
        <td style="text-align:right;font-family:monospace;font-weight:bold;">${formatMoney(inv.amount)}</td>
      </tr>
    </tbody>
  </table>
  <div class="total">Total TTC Acquitté : ${formatMoney(inv.amount)}</div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Facture-${inv.id}-Joowifi.html`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    notify(`Facture officielle ${inv.id} téléchargée.`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Current Plan Overview Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-950/60 via-[#0B0F19] to-slate-950 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-amber-400" />
            <span className="text-xs uppercase font-bold text-amber-400 tracking-wider">
              Abonnement SaaS Actif
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Plan {currentPlan.name}
          </h2>
          <p className="text-xs text-slate-300 font-mono tabular-nums">
            {formatMoney(currentPlan.priceMonthly)} / mois • Prélèvement automatique sur votre portefeuille Joowifi Pay.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right text-xs">
            <span className="text-slate-400 block text-[11px]">Solde Portefeuille :</span>
            <strong className="text-emerald-400 font-mono tabular-nums text-base">
              {formatMoney(walletBalance)}
            </strong>
          </div>
          <button
            onClick={() => setAdminTab('portefeuille')}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-extrabold text-xs transition cursor-pointer active:scale-95"
          >
            Recharger Pay
          </button>
        </div>
      </div>

      {/* Usage Gauges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Gauge 1: Routers */}
        <div className="p-5 rounded-2xl bg-slate-900/40 backdrop-blur-md border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <Server className="w-4 h-4 text-amber-400" />
              <span>Routeurs MikroTik</span>
            </div>
            <span className="font-mono tabular-nums text-xs font-bold text-white">
              {routers.length} / {currentPlan.routerLimit >= 9999 ? '∞' : currentPlan.routerLimit}
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500"
              style={{ width: `${routerUsagePercent}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-400 block font-mono tabular-nums">
            {routerUsagePercent}% de la capacité du plan
          </span>
        </div>

        {/* Gauge 2: Sellers */}
        <div className="p-5 rounded-2xl bg-slate-900/40 backdrop-blur-md border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <Users className="w-4 h-4 text-emerald-400" />
              <span>Vendeurs POS</span>
            </div>
            <span className="font-mono tabular-nums text-xs font-bold text-white">
              {staff.length} / {currentPlan.sellerLimit >= 999 ? '∞' : currentPlan.sellerLimit}
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${staffUsagePercent}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-400 block font-mono tabular-nums">
            {staffUsagePercent}% des accès vendeurs utilisés
          </span>
        </div>

        {/* Gauge 3: Tickets */}
        <div className="p-5 rounded-2xl bg-slate-900/40 backdrop-blur-md border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <Ticket className="w-4 h-4 text-cyan-400" />
              <span>Tickets générés ce mois</span>
            </div>
            <span className="font-mono tabular-nums text-xs font-bold text-white">
              {tickets.length} /{' '}
              {currentPlan.ticketLimit >= 999999 ? '∞' : currentPlan.ticketLimit.toLocaleString()}
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-cyan-400 transition-all duration-500"
              style={{ width: `${ticketUsagePercent}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-400 block font-mono tabular-nums">
            {ticketUsagePercent}% du quota mensuel
          </span>
        </div>
      </div>

      {/* Switch / Upgrade Plan Cards */}
      <div className="p-6 rounded-2xl bg-slate-900/40 backdrop-blur-md border border-white/10 space-y-4">
        <h2 className="text-base font-bold text-white">Grille des Abonnements Joowifi Cloud</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {SAAS_PLANS.map((plan) => {
            const isCurrent = currentPlanId === plan.id;

            return (
              <div
                key={plan.id}
                className={`p-5 rounded-2xl border flex flex-col justify-between text-xs space-y-4 transition ${
                  isCurrent
                    ? 'bg-amber-500/10 border-amber-500 text-white shadow-lg shadow-amber-500/10'
                    : 'bg-slate-950/80 border-white/10 text-slate-300 hover:border-white/20'
                }`}
              >
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <strong className="text-sm text-white">{plan.name}</strong>
                    {isCurrent && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-extrabold">
                        Actif
                      </span>
                    )}
                  </div>
                  <div className="text-lg font-extrabold text-amber-400 font-mono tabular-nums">
                    {formatMoney(plan.priceMonthly)} <span className="text-xs text-slate-400 font-normal">/ mois</span>
                  </div>

                  <ul className="space-y-1.5 mt-3 text-[11px] text-slate-300">
                    {plan.features.slice(0, 4).map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {!isCurrent ? (
                  <button
                    onClick={() => upgradePlan(plan.id)}
                    className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-white font-bold text-xs transition cursor-pointer active:scale-95"
                  >
                    Activer {plan.name}
                  </button>
                ) : (
                  <div className="w-full py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold text-center text-[11px]">
                    Plan actuellement utilisé
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Invoices List */}
      <div className="p-6 rounded-2xl bg-slate-900/40 backdrop-blur-md border border-white/10 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <FileText className="w-4 h-4 text-amber-400" />
          <span>Factures & Reçus Officiels Acquittés</span>
        </h2>

        <div className="space-y-2.5 text-xs">
          {invoices.map((inv) => (
            <div
              key={inv.id}
              className="p-4 rounded-xl bg-slate-950/80 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-mono font-bold text-[10px]">
                  PAYÉ
                </div>
                <div>
                  <span className="font-mono font-bold text-white">{inv.id}</span>
                  <span className="text-slate-400 ml-2">
                    — {inv.period} ({inv.plan})
                  </span>
                  <span className="block text-[10px] text-slate-500 font-mono">
                    Émise le {inv.date} • Acquittée via Joowifi Pay
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-center">
                <span className="font-mono tabular-nums font-bold text-white text-sm">
                  {formatMoney(inv.amount)}
                </span>
                <button
                  onClick={() => setSelectedInvoice(inv)}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-amber-400 font-semibold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Aperçu</span>
                </button>
                <button
                  onClick={() => handleDownloadInvoiceHTML(inv)}
                  className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 font-bold flex items-center gap-1.5 transition cursor-pointer"
                  title="Télécharger la facture officielle"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Télécharger</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Invoice Preview Modal (Replaces native alert) */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-3xl bg-[#0B0F19] border border-white/15 p-6 shadow-2xl text-slate-100 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">
                  Reçu Officiel {selectedInvoice.id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950 border border-white/10 space-y-4 text-xs">
              <div className="flex justify-between items-start border-b border-white/10 pb-3">
                <div>
                  <span className="text-base font-extrabold text-white">
                    Joo<span className="text-amber-500">wifi</span> Cloud SaaS
                  </span>
                  <span className="block text-[11px] text-slate-400">
                    Joo studio — Abidjan, Côte d'Ivoire
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
                  FACTURE ACQUITTÉE
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-[11px]">
                <div>
                  <span className="text-slate-500 block">Client Opérateur :</span>
                  <strong className="text-white">{operatorProfile.company}</strong>
                  <span className="block text-slate-400">{operatorProfile.email}</span>
                </div>
                <div className="text-right font-mono">
                  <span className="text-slate-500 block font-sans">Date d'émission :</span>
                  <strong className="text-white">{selectedInvoice.date}</strong>
                  <span className="block text-amber-400">{selectedInvoice.period}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-white/5 flex justify-between items-center">
                <div>
                  <strong className="text-white block">
                    Licence Cloud MikroTik — {selectedInvoice.plan}
                  </strong>
                  <span className="text-[10px] text-slate-400">
                    Synchronisation Heartbeat 45s, Caisse POS PWA & Support 24/7
                  </span>
                </div>
                <span className="font-mono tabular-nums font-extrabold text-amber-400 text-sm">
                  {formatMoney(selectedInvoice.amount)}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-slate-200 font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimer</span>
              </button>
              <button
                onClick={() => {
                  handleDownloadInvoiceHTML(selectedInvoice);
                  setSelectedInvoice(null);
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Télécharger le reçu</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
