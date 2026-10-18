import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Wifi,
  Users,
  TrendingUp,
  Ticket,
  Server,
  Activity,
  AlertCircle,
  Smartphone,
  Terminal,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Eye,
  EyeOff,
  Copy,
  Check,
  Bell,
  X,
  ArrowRight,
  DollarSign,
  Sparkles,
  Radio,
  ChevronRight,
} from 'lucide-react';

export const DashboardOverview: React.FC = () => {
  const {
    user,
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
  } = useApp();

  // Banners Dismiss States
  const [securityBannerDismissed, setSecurityBannerDismissed] = useState(false);
  const [onboardingDismissed, setOnboardingDismissed] = useState(false);
  const [pushBannerDismissed, setPushBannerDismissed] = useState(false);
  const [pushNotificationEnabled, setPushNotificationEnabled] = useState(false);

  // Token Widget State
  const [showToken, setShowToken] = useState(false);
  const [tokenCopied, setTokenCopied] = useState(false);
  const masterToken = 'JWT-8492-MK-9912';

  const handleCopyToken = () => {
    navigator.clipboard.writeText(masterToken);
    setTokenCopied(true);
    setTimeout(() => setTokenCopied(false), 2000);
  };

  // Time Filter State
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month' | 'all'>('today');

  // Compute stats
  const onlineRoutersCount = routers.filter((r) => r.status === 'online').length;
  const activeTicketsCount = tickets.filter((t) => t.status === 'actif').length;
  const availableTicketsCount = tickets.filter((t) => t.status === 'stock' || t.status === 'vendeur').length;
  const todayRevenue = staff.reduce((acc, s) => acc + s.todaySales, 0);

  // Dynamic revenue based on period filter
  const periodMultiplier = {
    today: 1,
    week: 6.8,
    month: 27.5,
    all: 84.2,
  };
  const displayedRevenue = Math.round(todayRevenue * periodMultiplier[selectedPeriod]);

  // User display name
  const displayName = user?.name ? user.name.split(' ')[0] : 'daymond';

  // 10-day history for the performance commercial chart
  const salesHistory10Days = [
    { day: 'J-9', amount: 32000, height: 45 },
    { day: 'J-8', amount: 48000, height: 68 },
    { day: 'J-7', amount: 28000, height: 40 },
    { day: 'J-6', amount: 54000, height: 76 },
    { day: 'J-5', amount: 41000, height: 58 },
    { day: 'J-4', amount: 62000, height: 88 },
    { day: 'J-3', amount: 39000, height: 55 },
    { day: 'J-2', amount: 51000, height: 72 },
    { day: 'J-1', amount: 68000, height: 95 },
    { day: 'J-0', amount: todayRevenue, height: 70 },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* =========================================================================
          1. BANNIÈRES CONTEXTUELLES D'ALERTE & ONBOARDING (HAUT DE PAGE)
      ========================================================================= */}
      <div className="space-y-4">
        {/* 1.1 Encart de sécurité compte */}
        {!securityBannerDismissed && (
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent border border-amber-500/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <h2 className="text-sm font-bold text-white">
                  Sécurisez l'accès à votre compte Joowifi
                </h2>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Vous n'avez pas encore configuré d'e-mail de secours. Ajoutez une adresse vérifiée
                  pour pouvoir récupérer votre accès en toute autonomie.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button
                onClick={() => setAdminTab('profil')}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold text-xs shadow-md transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
              >
                <span>Sécuriser mon compte</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setSecurityBannerDismissed(true)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition"
                title="Fermer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* 1.2 SOS Recharge Alerts from Field Vendors (si actif) */}
        {pendingSosAlerts.length > 0 && (
          <div className="space-y-2">
            {pendingSosAlerts.map((sos) => (
              <div
                key={sos.id}
                className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-rose-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-rose-600/30 text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/40">
                    <AlertCircle className="w-4 h-4 animate-bounce" />
                  </div>
                  <div className="text-xs">
                    <span className="font-bold text-white block">
                      Demande SOS Recharge de {sos.staffName}
                    </span>
                    <span className="text-rose-300 text-[11px]">
                      Montant demandé : <strong>{formatMoney(sos.amount)}</strong> ({sos.time})
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => {
                      const targetStaff = staff.find((s) => s.name.includes(sos.staffName.split(' ')[0]));
                      if (targetStaff) {
                        rechargeStaff(targetStaff.id, sos.amount);
                      }
                      clearSosAlert(sos.id);
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition cursor-pointer"
                  >
                    Valider la recharge
                  </button>
                  <button
                    onClick={() => clearSosAlert(sos.id)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs"
                  >
                    Ignorer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Titre de page Tableau de bord */}
        <div className="pt-2">
          <h1 className="text-2xl sm:text-3xl font-black text-white font-sans tracking-tight">
            Tableau de bord
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Aperçu en temps réel de votre infrastructure et de vos ventes WiFi.
          </p>
        </div>

        {/* 1.3 Checklist interactive d'onboarding ("Terminez votre configuration") */}
        {!onboardingDismissed && (
          <div className="p-5 sm:p-6 rounded-3xl bg-slate-950/80 border border-white/[0.08] relative overflow-hidden space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Terminez votre configuration</h3>
                  <p className="text-[11px] text-slate-400">
                    2 sur 6 étapes complétées · encore 3 pour être opérationnel
                  </p>
                </div>
              </div>

              <button
                onClick={() => setOnboardingDismissed(true)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition"
                title="Fermer la checklist"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Progress bar */}
            <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full w-1/3" />
            </div>

            {/* Grid of 6 interactive steps */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
              {/* Step 1: Mettre votre nom sur vos tickets (done) */}
              <button
                onClick={() => setAdminTab('personnalisation')}
                className="p-3 rounded-xl bg-slate-900/60 border border-emerald-500/30 hover:border-emerald-500/60 flex items-center justify-between text-left transition cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-xs font-medium text-emerald-300">
                    Mettre votre nom sur vos tickets
                  </span>
                </div>
              </button>

              {/* Step 2: Connecter votre premier routeur MikroTik */}
              <button
                onClick={() => setAdminTab('installation')}
                className="p-3 rounded-xl bg-slate-900/40 border border-slate-800 hover:border-amber-500/40 flex items-center justify-between text-left transition cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-3.5 h-3.5 rounded-full border border-slate-600 shrink-0" />
                  <span className="text-xs font-medium text-slate-300 group-hover:text-white">
                    Connecter votre premier routeur MikroTik
                  </span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 transition" />
              </button>

              {/* Step 3: Définir vos forfaits WiFi (done) */}
              <button
                onClick={() => setAdminTab('forfaits')}
                className="p-3 rounded-xl bg-slate-900/60 border border-emerald-500/30 hover:border-emerald-500/60 flex items-center justify-between text-left transition cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-xs font-medium text-emerald-300">
                    Définir vos forfaits WiFi
                  </span>
                </div>
              </button>

              {/* Step 4: Générer vos premiers codes */}
              <button
                onClick={() => setAdminTab('tickets')}
                className="p-3 rounded-xl bg-slate-900/40 border border-slate-800 hover:border-amber-500/40 flex items-center justify-between text-left transition cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-3.5 h-3.5 rounded-full border border-slate-600 shrink-0" />
                  <span className="text-xs font-medium text-slate-300 group-hover:text-white">
                    Générer vos premiers codes
                  </span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 transition" />
              </button>

              {/* Step 5: Enregistrer votre première vente */}
              <button
                onClick={() => setAdminTab('pos')}
                className="p-3 rounded-xl bg-slate-900/40 border border-slate-800 hover:border-amber-500/40 flex items-center justify-between text-left transition cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-3.5 h-3.5 rounded-full border border-slate-600 shrink-0" />
                  <span className="text-xs font-medium text-slate-300 group-hover:text-white">
                    Enregistrer votre première vente
                  </span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 transition" />
              </button>

              {/* Step 6: Recevoir vos alertes sur Telegram */}
              <button
                onClick={() => setAdminTab('notifications')}
                className="p-3 rounded-xl bg-slate-900/40 border border-slate-800 hover:border-amber-500/40 flex items-center justify-between text-left transition cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-3.5 h-3.5 rounded-full border border-slate-600 shrink-0" />
                  <span className="text-xs font-medium text-slate-300 group-hover:text-white">
                    Recevoir vos alertes sur Telegram
                  </span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 transition" />
              </button>
            </div>
          </div>
        )}

        {/* 1.4 Bannière d'activation des notifications push */}
        {!pushBannerDismissed && (
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-white/[0.08] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/25 text-amber-400 flex items-center justify-center shrink-0">
                <Bell className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-sm font-bold text-white">
                  Recevez vos alertes sur ce téléphone
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Routeur hors ligne, stock de codes épuisé, abonnement qui arrive à échéance :
                  soyez prévenu directement dans la barre de notifications, même quand l'application
                  est fermée.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              <button
                onClick={() => {
                  setPushNotificationEnabled(true);
                  setTimeout(() => setPushBannerDismissed(true), 1200);
                }}
                className={`px-4 py-2 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  pushNotificationEnabled
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-500 text-slate-950 shadow-md'
                }`}
              >
                {pushNotificationEnabled ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Notifications activées</span>
                  </>
                ) : (
                  <span>Activer les notifications</span>
                )}
              </button>
              <button
                onClick={() => setPushBannerDismissed(true)}
                className="px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 text-xs transition cursor-pointer"
              >
                Plus tard
              </button>
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          2. CARTE D'ACCUEIL PERSONNALISÉE & ACTIONS RAPIDES (HERO CARD)
      ========================================================================= */}
      <div className="p-6 sm:p-7 rounded-3xl bg-slate-950/90 border border-white/[0.08] shadow-xl relative overflow-hidden space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Welcome greeting */}
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400 text-[10px] font-bold tracking-wider uppercase flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                HOTSPOT CONTROLLER PRO
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase flex items-center gap-1.5 ${
                  onlineRoutersCount > 0
                    ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                    : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    onlineRoutersCount > 0 ? 'bg-emerald-400 animate-ping' : 'bg-rose-400'
                  }`}
                />
                {onlineRoutersCount > 0
                  ? `${onlineRoutersCount} routeur(s) en ligne`
                  : 'Aucun routeur'}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white font-sans tracking-tight">
              Bonjour,{' '}
              <span className="bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 bg-clip-text text-transparent capitalize">
                {displayName}
              </span>
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Bienvenue sur votre console Cloud Joowifi. Connectez votre premier routeur MikroTik
              pour démarrer.
            </p>
          </div>

          {/* Installation Token Widget */}
          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1.5 min-w-[280px]">
            <div className="flex items-center justify-between text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              <span>Clé d'installation routeur (Token)</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
            </div>

            <div className="flex items-center justify-between gap-2 bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 font-mono text-xs text-white">
              <span className="tracking-wider">
                {showToken ? masterToken : 'HPT-••••••••••••'}
              </span>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setShowToken(!showToken)}
                  className="p-1 rounded text-slate-400 hover:text-white transition cursor-pointer"
                  title={showToken ? 'Masquer' : 'Afficher'}
                >
                  {showToken ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={handleCopyToken}
                  className="p-1 rounded text-slate-400 hover:text-amber-400 transition cursor-pointer"
                  title="Copier le token"
                >
                  {tokenCopied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Quick Action Cards Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {/* Action 1: Générer Tickets */}
          <button
            onClick={() => setAdminTab('tickets')}
            className="p-3.5 rounded-2xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-left transition cursor-pointer group flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white group-hover:text-amber-400 transition">
                Générer Tickets
              </div>
              <div className="text-[10px] text-slate-400">Créer des vouchers</div>
            </div>
          </button>

          {/* Action 2: Caisse POS */}
          <button
            onClick={() => setCurrentSpace('pos')}
            className="p-3.5 rounded-2xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-left transition cursor-pointer group flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white group-hover:text-amber-400 transition">
                Caisse POS
              </div>
              <div className="text-[10px] text-slate-400">Vente rapide gérant</div>
            </div>
          </button>

          {/* Action 3: Nouveau Routeur */}
          <button
            onClick={() => setAdminTab('installation')}
            className="p-3.5 rounded-2xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-left transition cursor-pointer group flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white group-hover:text-amber-400 transition">
                Nouveau Routeur
              </div>
              <div className="text-[10px] text-slate-400">Script bootstrap</div>
            </div>
          </button>

          {/* Action 4: Portefeuille */}
          <button
            onClick={() => setAdminTab('portefeuille')}
            className="p-3.5 rounded-2xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-left transition cursor-pointer group flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white group-hover:text-amber-400 transition">
                Portefeuille
              </div>
              <div className="text-[10px] text-slate-400">Recharger mon solde</div>
            </div>
          </button>
        </div>
      </div>

      {/* =========================================================================
          3. BARRE DE FILTRES TEMPORELS & GRILLE DES KPI MAJEURS
      ========================================================================= */}
      <div className="space-y-4">
        {/* Time filters header row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <div className="space-y-0.5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-500" />
              <span>Performances de ventes par période</span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Sélectionnez une période pour analyser le chiffre d'affaires et la répartition.
            </p>
          </div>

          {/* Period selector tabs */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
            {(
              [
                { id: 'today', label: "Aujourd'hui" },
                { id: 'week', label: 'Semaine' },
                { id: 'month', label: 'Mois' },
                { id: 'all', label: 'Tout' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedPeriod(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  selectedPeriod === tab.id
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* 4 Major KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* KPI 1: MikroTik Routeurs */}
          <div
            onClick={() => setAdminTab('mikrotik')}
            className="p-5 rounded-3xl bg-slate-950/80 border border-white/[0.08] hover:border-amber-500/40 transition duration-200 cursor-pointer flex flex-col justify-between space-y-4 shadow-lg group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                MikroTik Routeurs
              </span>
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                <Server className="w-4 h-4" />
              </div>
            </div>

            <div>
              <div className="text-3xl font-black text-white font-mono tabular-nums">
                {routers.length}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                {onlineRoutersCount} en ligne
              </div>
            </div>
          </div>

          {/* KPI 2: Sessions Actives */}
          <div
            onClick={() => setAdminTab('sessions')}
            className="p-5 rounded-3xl bg-slate-950/80 border border-white/[0.08] hover:border-amber-500/40 transition duration-200 cursor-pointer flex flex-col justify-between space-y-4 shadow-lg group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Sessions Actives
              </span>
              <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <Activity className="w-4 h-4" />
              </div>
            </div>

            <div>
              <div className="text-3xl font-black text-white font-mono tabular-nums">
                {sessions.length}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Clients actuellement connectés
              </div>
            </div>
          </div>

          {/* KPI 3: Tickets Générés */}
          <div
            onClick={() => setAdminTab('tickets')}
            className="p-5 rounded-3xl bg-slate-950/80 border border-white/[0.08] hover:border-amber-500/40 transition duration-200 cursor-pointer flex flex-col justify-between space-y-4 shadow-lg group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Tickets Générés
              </span>
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                <Ticket className="w-4 h-4" />
              </div>
            </div>

            <div>
              <div className="text-3xl font-black text-white font-mono tabular-nums">
                {tickets.length}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                {availableTicketsCount} disponibles · {forfaits.length} forfaits
              </div>
            </div>
          </div>

          {/* KPI 4: Ventes Période */}
          <div
            onClick={() => setAdminTab('ventes')}
            className="p-5 rounded-3xl bg-slate-950/80 border border-white/[0.08] hover:border-amber-500/40 transition duration-200 cursor-pointer flex flex-col justify-between space-y-4 shadow-lg group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {selectedPeriod === 'today' ? "Ventes d'Aujourd'hui" : 'Ventes Période'}
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>

            <div>
              <div className="text-2xl sm:text-3xl font-black text-white font-mono tabular-nums truncate">
                {formatMoney(displayedRevenue)}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                14 ticket(s) vendu(s) · 11 vendeur · 3 direct
              </div>
            </div>
          </div>
        </div>

        {/* Link below KPIs */}
        <div className="text-right">
          <button
            onClick={() => setAdminTab('ventes')}
            className="text-xs text-amber-400 hover:text-amber-300 font-medium inline-flex items-center gap-1 transition"
          >
            <span>Voir le détail de ces ventes, code par code</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* =========================================================================
          4. GRILLE MODULAIRE INFÉRIEURE (MONITORING & ANALYTICS)
      ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Clients connectés, Mise en route, Performance 10j */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card 4.1: Clients connectés · 24h (Chart) */}
          <div className="p-6 rounded-3xl bg-slate-950/80 border border-white/[0.08] space-y-4 shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">Clients connectés · 24h</h3>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                Moyenne : 18 sessions
              </span>
            </div>

            {/* SVG Area Curve Chart */}
            <div className="h-44 w-full relative flex flex-col justify-end">
              <svg
                viewBox="0 0 500 120"
                className="w-full h-36 overflow-visible"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="sessionGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                {/* Area fill */}
                <path
                  d="M 0,100 Q 60,85 120,60 T 250,30 T 380,50 T 500,20 L 500,120 L 0,120 Z"
                  fill="url(#sessionGlow)"
                />
                {/* Smooth stroke line */}
                <path
                  d="M 0,100 Q 60,85 120,60 T 250,30 T 380,50 T 500,20"
                  fill="none"
                  stroke="#06B6D4"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                {/* Peak point indicator */}
                <circle cx="250" cy="30" r="4" fill="#06B6D4" stroke="#0B0F19" strokeWidth="2" />
                <circle cx="500" cy="20" r="4" fill="#06B6D4" stroke="#0B0F19" strokeWidth="2" />
              </svg>

              {/* X-axis labels */}
              <div className="flex justify-between text-[10px] text-slate-500 font-mono pt-2 border-t border-slate-900">
                <span>00h</span>
                <span>04h</span>
                <span>08h</span>
                <span>12h</span>
                <span>16h</span>
                <span>20h</span>
                <span>24h</span>
              </div>
            </div>
          </div>

          {/* Card 4.2: Bloc "Mise en route" (Two navigation cards) */}
          <div className="p-6 rounded-3xl bg-slate-950/80 border border-white/[0.08] space-y-4 shadow-lg">
            <div className="flex items-center gap-2">
              <Wifi className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-bold text-white">Mise en route</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Installer un MikroTik */}
              <button
                onClick={() => setAdminTab('installation')}
                className="p-4 rounded-2xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-left transition cursor-pointer group flex items-start gap-3"
              >
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Server className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-bold text-white group-hover:text-amber-400 transition flex items-center gap-1">
                    <span>Installer un MikroTik</span>
                    <ArrowRight className="w-3 h-3 text-slate-500 group-hover:text-amber-400 transition" />
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Générez le script d'auto-configuration pour votre routeur.
                  </p>
                </div>
              </button>

              {/* Générer des Tickets */}
              <button
                onClick={() => setAdminTab('tickets')}
                className="p-4 rounded-2xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-left transition cursor-pointer group flex items-start gap-3"
              >
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Ticket className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-bold text-white group-hover:text-amber-400 transition flex items-center gap-1">
                    <span>Générer des Tickets</span>
                    <ArrowRight className="w-3 h-3 text-slate-500 group-hover:text-amber-400 transition" />
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Générez des lots de tickets de connexion à distribuer.
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Card 4.3: Graphique "Performance Commerciale (10 derniers jours)" */}
          <div className="p-6 rounded-3xl bg-slate-950/80 border border-white/[0.08] space-y-4 shadow-lg">
            <div className="space-y-0.5">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-500" />
                <span>Performance Commerciale (10 derniers jours)</span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Chaque barre = les ventes encaissées ce jour-là, pas les codes fabriqués ce jour-là.
              </p>
            </div>

            {/* Histogram bars */}
            <div className="pt-4">
              <div className="h-32 flex items-end justify-between gap-1.5 sm:gap-2 px-1">
                {salesHistory10Days.map((item) => (
                  <div key={item.day} className="flex-1 flex flex-col items-center gap-2 group">
                    {/* Tooltip on hover */}
                    <span className="text-[9px] font-mono text-amber-400 opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                      {formatMoney(item.amount)}
                    </span>
                    <div className="w-full bg-slate-900 rounded-t-md h-28 flex items-end">
                      <div
                        className="w-full bg-gradient-to-t from-orange-600 via-amber-500 to-amber-400 rounded-t-md transition-all duration-300 group-hover:brightness-125"
                        style={{ height: `${item.height}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">{item.day}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Santé du réseau, État des Routeurs, Équipe (POS / Staff) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card 4.4: Santé du réseau */}
          <div className="p-6 rounded-3xl bg-slate-950/80 border border-white/[0.08] space-y-4 shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Santé du réseau</h3>
              </div>
              <button
                onClick={() => setAdminTab('sante')}
                className="text-slate-400 hover:text-white transition"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-white font-mono tabular-nums">
                  {onlineRoutersCount}/{routers.length}
                </span>
                <span className="text-xs text-slate-400">routeurs en ligne</span>
              </div>

              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Tout est normal</span>
              </div>

              <div className="text-[11px] text-slate-400 font-mono">
                0 synchro(s) en attente · 0 alerte(s)
              </div>
            </div>
          </div>

          {/* Card 4.5: État des Routeurs */}
          <div className="p-6 rounded-3xl bg-slate-950/80 border border-white/[0.08] space-y-4 shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-bold text-white">État des Routeurs</h3>
              </div>
              <button
                onClick={() => setAdminTab('mikrotik')}
                className="text-xs text-amber-400 hover:text-amber-300 font-semibold"
              >
                Voir tout ({routers.length})
              </button>
            </div>

            {routers.length === 0 ? (
              <div className="text-center py-6 space-y-2">
                <p className="text-xs text-slate-400">
                  Aucun routeur MikroTik installé pour le moment.
                </p>
                <button
                  onClick={() => setAdminTab('installation')}
                  className="text-xs font-bold text-amber-400 hover:underline flex items-center justify-center gap-1 mx-auto"
                >
                  <span>Démarrer l'installation</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {routers.slice(0, 3).map((router) => (
                  <div
                    key={router.id}
                    className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            router.status === 'online'
                              ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50'
                              : 'bg-rose-400'
                          }`}
                        />
                        <span className="font-bold text-white">{router.name}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {router.zoneName} · {router.ipAddress}
                      </div>
                    </div>

                    <div className="text-right font-mono">
                      <div className="text-slate-300 text-[11px]">
                        CPU: {router.cpuUsage}%
                      </div>
                      <div className="text-[10px] text-emerald-400">
                        {router.totalSubscribers} connectés
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Card 4.6: Bloc "Équipe (POS / Staff)" */}
          <div className="p-6 rounded-3xl bg-slate-950/80 border border-white/[0.08] space-y-4 shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-bold text-white">Équipe (POS / Staff)</h3>
              </div>
              <button
                onClick={() => setAdminTab('staff')}
                className="text-xs text-amber-400 hover:text-amber-300 font-semibold"
              >
                Gérer ({staff.length})
              </button>
            </div>

            <div className="space-y-2.5">
              {staff.map((member) => (
                <div
                  key={member.id}
                  className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center font-bold text-[11px]">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-white">{member.name}</div>
                      <div className="text-[10px] text-slate-400">Vendeur terrain</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="px-2 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-mono font-bold">
                      {member.commissionRate}% comm
                    </span>
                    <div className="text-[10px] text-slate-400 font-mono mt-1">
                      {formatMoney(member.todaySales)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
