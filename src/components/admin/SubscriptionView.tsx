import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { SAAS_PLANS } from '../../data/mockData';
import {
  CreditCard,
  Check,
  Server,
  Users,
  Ticket,
  FileText,
  X,
  Calendar,
  Clock,
  Wallet,
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
    transactions,
    walletBalance,
    operatorProfile,
    formatMoney,
    setAdminTab,
    notify,
  } = useApp();

  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceItem | null>(null);

  const currentPlan = SAAS_PLANS.find((p) => p.id === currentPlanId) || SAAS_PLANS[0];

  // ===========================================================================
  // POINT 4 DE L'AUDIT : SUIVI DU CYCLE DE VIE DE L'ABONNEMENT & JAUGE TEMPORELLE
  // Calcule précisément la date de souscription, la date d'expiration, et le
  // pourcentage de temps écoulé / restant sur la durée du plan.
  // ===========================================================================
  const subscriptionLifecycle = useMemo(() => {
    const planSubscriptions = transactions.filter((tx) => tx.category === 'Abonnement SaaS');
    const latestSubTx = planSubscriptions.length > 0 ? planSubscriptions[0] : null;

    const totalCycleDays = currentPlan.id === 'starter' ? 14 : 30;
    const startDate = latestSubTx ? new Date(latestSubTx.timestamp) : new Date();
    const endDate = new Date(startDate.getTime() + totalCycleDays * 24 * 60 * 60 * 1000);
    const now = new Date();

    const elapsedMs = Math.max(0, now.getTime() - startDate.getTime());
    const elapsedDays = Math.min(
      totalCycleDays,
      Math.max(1, Math.ceil(elapsedMs / (24 * 60 * 60 * 1000)))
    );
    const remainingDays = Math.max(0, totalCycleDays - elapsedDays + 1);
    const remainingPercent = Math.min(
      100,
      Math.max(0, Math.round((remainingDays / totalCycleDays) * 100))
    );
    const elapsedPercent = Math.min(
      100,
      Math.max(5, Math.round((elapsedDays / totalCycleDays) * 100))
    );

    return {
      startDateLabel: startDate.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }),
      endDateLabel: endDate.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }),
      startShort: startDate.toLocaleDateString('fr-FR'),
      endShort: endDate.toLocaleDateString('fr-FR'),
      totalCycleDays,
      elapsedDays,
      remainingDays,
      remainingPercent,
      elapsedPercent,
    };
  }, [transactions, currentPlan.id]);

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

  const invoices: InvoiceItem[] = transactions
    .filter((tx) => tx.category === 'Abonnement SaaS')
    .map((tx) => ({
      id: tx.reference || tx.id,
      period: new Date(tx.timestamp).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
      date: new Date(tx.timestamp).toLocaleDateString('fr-FR'),
      amount: tx.amount,
      plan: `Plan ${currentPlan.name}`,
    }));

  const handleDownloadInvoiceHTML = (inv: InvoiceItem) => {
    const htmlContent = `<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <title>Reçu Officiel ${inv.id} - Joowifi</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; color: #0f172a; max-width: 720px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; border-bottom: 2px solid #005A5B; padding-bottom: 20px; margin-bottom: 30px; }
    .badge { background: #E6F4F3; color: #008060; padding: 4px 12px; border-radius: 6px; font-weight: bold; font-size: 12px; }
    table { width: 100%; border-collapse: collapse; margin-top: 24px; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e2e8f0; }
    th { background: #f8fafc; font-size: 12px; text-transform: uppercase; color: #64748b; }
    .total { font-size: 20px; font-weight: 800; color: #0f172a; text-align: right; margin-top: 24px; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1 style="margin:0;color:#005A5B;">JOOWIFI CLOUD</h1>
      <p style="margin:4px 0 0;font-size:13px;color:#64748b;">Plateforme SaaS Cloud MikroTik — Abidjan, Côte d'Ivoire</p>
    </div>
    <div style="text-align:right;">
      <span class="badge">ACQUITTÉE</span>
      <p style="margin:8px 0 0;font-weight:bold;">Facture N° ${inv.id}</p>
      <p style="margin:2px 0 0;font-size:12px;color:#64748b;">Date : ${inv.date}</p>
    </div>
  </div>
  <div>
    <strong>Facturé à :</strong><br/>
    ${operatorProfile.company || 'Opérateur Réseau'} (${operatorProfile.name || 'Administrateur'})<br/>
    ${operatorProfile.city || 'Abidjan'}, ${operatorProfile.country || "Côte d'Ivoire"}<br/>
    Email : ${operatorProfile.email || '-'}
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
    <div className="space-y-5 pb-12 text-[#1E293B]">
      {/* 1. BANDEAU D'ÉTAT DU PLAN ACTIF + DATES DE SOUSCRIPTION ET D'EXPIRATION */}
      <div className="p-6 rounded-lg bg-white border border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-5 shadow-2xs">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-[#008060]" />
            <span className="text-[11px] uppercase font-bold text-[#008060] tracking-wider">
              Abonnement SaaS Actif • Cycle de Vie
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            {currentPlan.name} ({formatMoney(currentPlan.priceMonthly)} / mois)
          </h2>

          {/* Données textuelles précises sur la date de souscription et la date d'expiration */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 pt-1 text-xs text-slate-600">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#007A78]" />
              <span>Date de souscription :</span>
              <strong className="font-mono text-slate-900">
                {subscriptionLifecycle.startDateLabel}
              </strong>
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#008060]" />
              <span>Date de fin (expiration) :</span>
              <strong className="font-mono text-[#005A5B]">
                {subscriptionLifecycle.endDateLabel}
              </strong>
            </span>
            <span className="px-2 py-0.5 rounded bg-[#E6F4F3] text-[#008060] font-mono font-bold text-[11px]">
              {subscriptionLifecycle.remainingDays} jour(s) restants sur {subscriptionLifecycle.totalCycleDays}j
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
          <div className="text-right text-xs">
            <span className="text-slate-400 block text-[11px]">Solde Portefeuille Pay :</span>
            <strong className="text-[#008060] font-mono tabular-nums text-base">
              {formatMoney(walletBalance)}
            </strong>
          </div>
          <button
            onClick={() => setAdminTab('portefeuille')}
            className="px-4 py-2.5 rounded bg-[#008060] hover:bg-[#006B50] text-white font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer"
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>Recharger Pay</span>
          </button>
        </div>
      </div>

      {/* 2. LES 4 JAUGES DE CAPACITÉ ET DE CYCLE DE VIE (INCLUANT LA JAUGE TEMPORELLE) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Jauge 1 : Durée de l'Abonnement (Jauge Temporelle) */}
        <div className="p-4 rounded-lg bg-white border border-slate-200 space-y-2.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <Clock className="w-4 h-4 text-[#008060]" />
              <span>Durée Abonnement</span>
            </div>
            <span className="font-mono tabular-nums text-xs font-bold text-[#008060]">
              {subscriptionLifecycle.remainingDays}j / {subscriptionLifecycle.totalCycleDays}j
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
            <div
              className="h-full bg-[#008060] transition-all duration-500"
              style={{ width: `${subscriptionLifecycle.remainingPercent}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
            <span>Début: {subscriptionLifecycle.startShort}</span>
            <span>Fin: {subscriptionLifecycle.endShort}</span>
          </div>
        </div>

        {/* Jauge 2 : Routeurs MikroTik */}
        <div className="p-4 rounded-lg bg-white border border-slate-200 space-y-2.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <Server className="w-4 h-4 text-[#007A78]" />
              <span>Routeurs MikroTik</span>
            </div>
            <span className="font-mono tabular-nums text-xs font-bold text-slate-800">
              {routers.length} / {currentPlan.routerLimit >= 9999 ? '∞' : currentPlan.routerLimit}
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
            <div
              className="h-full bg-[#007A78] transition-all duration-500"
              style={{ width: `${routerUsagePercent}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-500 block font-mono tabular-nums">
            {routerUsagePercent}% de la capacité du plan
          </span>
        </div>

        {/* Jauge 3 : Vendeurs POS */}
        <div className="p-4 rounded-lg bg-white border border-slate-200 space-y-2.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <Users className="w-4 h-4 text-[#008060]" />
              <span>Vendeurs POS</span>
            </div>
            <span className="font-mono tabular-nums text-xs font-bold text-slate-800">
              {staff.length} / {currentPlan.sellerLimit >= 999 ? '∞' : currentPlan.sellerLimit}
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
            <div
              className="h-full bg-[#008060] transition-all duration-500"
              style={{ width: `${staffUsagePercent}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-500 block font-mono tabular-nums">
            {staffUsagePercent}% des accès vendeurs utilisés
          </span>
        </div>

        {/* Jauge 4 : Tickets générés ce mois */}
        <div className="p-4 rounded-lg bg-white border border-slate-200 space-y-2.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <Ticket className="w-4 h-4 text-[#0066CC]" />
              <span>Tickets ce mois</span>
            </div>
            <span className="font-mono tabular-nums text-xs font-bold text-slate-800">
              {tickets.length} /{' '}
              {currentPlan.ticketLimit >= 999999 ? '∞' : currentPlan.ticketLimit.toLocaleString()}
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
            <div
              className="h-full bg-[#0066CC] transition-all duration-500"
              style={{ width: `${ticketUsagePercent}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-500 block font-mono tabular-nums">
            {ticketUsagePercent}% du quota mensuel
          </span>
        </div>
      </div>

      {/* 3. GRILLE DES ABONNEMENTS JOOWIFI CLOUD */}
      <div className="p-6 rounded-lg bg-white border border-slate-200 space-y-4 shadow-2xs">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-sm font-bold text-slate-800">Grille des Abonnements Joowifi Cloud</h2>
          <p className="text-xs text-slate-500">
            Changez d'offre à tout moment selon la taille de votre parc de routeurs MikroTik et d'agents POS.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {SAAS_PLANS.map((plan) => {
            const isCurrent = currentPlanId === plan.id;

            return (
              <div
                key={plan.id}
                className={`p-5 rounded-lg border flex flex-col justify-between text-xs space-y-4 transition ${
                  isCurrent
                    ? 'bg-[#E6F4F3] border-[#008060] text-slate-800'
                    : 'bg-[#F8FAFC] border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <strong className="text-sm text-slate-900">{plan.name}</strong>
                    {isCurrent && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-[#008060] text-white font-bold">
                        Actif
                      </span>
                    )}
                  </div>
                  <div className="text-lg font-extrabold text-[#005A5B] font-mono tabular-nums">
                    {formatMoney(plan.priceMonthly)}{' '}
                    <span className="text-xs text-slate-400 font-normal">/ mois</span>
                  </div>

                  <ul className="space-y-1.5 mt-3 text-[11px] text-slate-600">
                    {plan.features.slice(0, 5).map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <Check className="w-3.5 h-3.5 text-[#008060] shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {!isCurrent ? (
                  <button
                    onClick={() => upgradePlan(plan.id)}
                    className="w-full py-2.5 rounded bg-[#008060] hover:bg-[#006B50] text-white font-semibold text-xs transition cursor-pointer"
                  >
                    Activer {plan.name}
                  </button>
                ) : (
                  <div className="w-full py-2 rounded bg-white border border-[#99D5D3] text-[#005A5B] font-bold text-center text-[11px]">
                    Plan actuellement utilisé
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. HISTORIQUE DES FACTURES ACQUITTÉES */}
      <div className="p-6 rounded-lg bg-white border border-slate-200 space-y-4 shadow-2xs">
        <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#007A78]" />
          <span>Factures & Reçus Officiels Acquittés ({invoices.length})</span>
        </h2>

        {invoices.length === 0 ? (
          <div className="p-6 rounded-lg bg-[#F8FAFC] border border-slate-200 text-center text-xs text-slate-500">
            Aucune facture d'abonnement payant émise sur ce compte.
          </div>
        ) : (
          <div className="space-y-2.5 text-xs">
            {invoices.map((inv) => (
              <div
                key={inv.id}
                className="p-4 rounded-lg bg-[#F8FAFC] border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded bg-[#E6F4F3] border border-[#99D5D3] flex items-center justify-center text-[#008060] font-mono font-bold text-[10px]">
                    PAYÉ
                  </div>
                  <div>
                    <span className="font-mono font-bold text-slate-800">{inv.id}</span>
                    <span className="text-slate-400 ml-2">
                      — {inv.period} ({inv.plan})
                    </span>
                    <span className="block text-[10px] text-slate-500 font-mono">
                      Émise le {inv.date} • Acquittée via Joowifi Pay
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <span className="font-mono tabular-nums font-bold text-slate-800 text-sm">
                    {formatMoney(inv.amount)}
                  </span>
                  <button
                    onClick={() => setSelectedInvoice(inv)}
                    className="px-3 py-1.5 rounded bg-white hover:bg-slate-100 border border-slate-200 text-[#007A78] font-semibold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Aperçu</span>
                  </button>
                  <button
                    onClick={() => handleDownloadInvoiceHTML(inv)}
                    className="px-3 py-1.5 rounded bg-[#008060] hover:bg-[#006B50] text-white font-semibold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <span>Télécharger</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedInvoice && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4"
          onClick={() => setSelectedInvoice(null)}
        >
          <div
            className="w-full max-w-lg rounded-lg bg-white text-slate-900 p-6 shadow-xl space-y-5 text-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-slate-200 pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#008060]">
                  JOOWIFI CLOUD
                </span>
                <h3 className="text-lg font-extrabold text-slate-900 mt-0.5">
                  Facture Acquittée #{selectedInvoice.id}
                </h3>
                <span className="text-[11px] text-slate-500">
                  Date d'émission : {selectedInvoice.date}
                </span>
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="p-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex justify-between items-center p-3 rounded bg-[#F8FAFC] border border-slate-200">
              <div>
                <strong className="text-slate-800 block">{selectedInvoice.plan}</strong>
                <span className="text-[11px] text-slate-500">
                  Période : {selectedInvoice.period}
                </span>
              </div>
              <span className="text-base font-extrabold text-[#008060] font-mono">
                {formatMoney(selectedInvoice.amount)}
              </span>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedInvoice(null)}
                className="px-4 py-2 rounded bg-slate-100 text-slate-700 font-semibold cursor-pointer"
              >
                Fermer
              </button>
              <button
                onClick={() => handleDownloadInvoiceHTML(selectedInvoice)}
                className="px-4 py-2 rounded bg-[#008060] text-white font-semibold cursor-pointer"
              >
                Télécharger (.html)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
