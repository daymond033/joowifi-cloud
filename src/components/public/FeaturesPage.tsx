import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Wifi,
  Ticket,
  BarChart3,
  ShieldCheck,
  RotateCcw,
  Monitor,
  Hotel,
  Coffee,
  ArrowRight,
  Sparkles,
  Layers,
} from 'lucide-react';

export const FeaturesPage: React.FC = () => {
  const { openAuthModal, setPublicTab, setCurrentSpace } = useApp();

  // State for the interactive "S'adapte à votre métier" bento card
  const [activeIndustry, setActiveIndustry] = useState<'cyber' | 'hotel' | 'cafe'>('cyber');

  const industryProfiles = {
    cyber: {
      name: 'Cybercafés',
      icon: Monitor,
      description:
        "Gérez l'accès de vos clients avec des tickets horaires et suivez la rentabilité de chaque poste.",
      subtext: 'Multi-sites gérables sur un seul compte.',
    },
    hotel: {
      name: 'Hôtels & Résidences',
      icon: Hotel,
      description:
        "Offrez un portail d'accueil personnalisé à vos résidents avec forfaits par nuitée ou séjour et coupure automatique.",
      subtext: 'Intégration simple sans intervention en chambre.',
    },
    cafe: {
      name: 'Cafés & Restaurants',
      icon: Coffee,
      description:
        'Fidélisez votre clientèle avec des sessions gratuites limitées (ex. 30 min) ou des forfaits boisson émis en 1 clic au comptoir.',
      subtext: 'Idéal pour booster le panier moyen et attirer les nomades.',
    },
  };

  const currentProfile = industryProfiles[activeIndustry];

  return (
    <div className="space-y-24 sm:space-y-32 pb-24 pt-6 sm:pt-12">
      {/* =========================================================================
          1. HEADER SECTION
      ========================================================================= */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        {/* Subtle semi-transparent pill badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-slate-400 text-xs font-medium shadow-sm backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Fonctionnalités</span>
        </div>

        {/* High contrast bold title */}
        <h1
          className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white font-sans leading-tight"
          style={{ textWrap: 'balance' }}
        >
          Conçu pour piloter votre activité
        </h1>

        {/* Sober direct subtitle */}
        <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          Pas de fioritures. Uniquement les outils essentiels pour optimiser l'accès WiFi et sécuriser
          vos revenus.
        </p>
      </section>

      {/* =========================================================================
          2. BENTO GRID DES OUTILS CLÉS
      ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Bento Card 1: Tickets & Forfaits (Large - 7 cols) */}
          <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl bg-slate-950/80 border border-white/[0.08] hover:border-amber-500/40 transition duration-300 flex flex-col justify-between space-y-6 shadow-xl relative overflow-hidden group">
            <div className="space-y-4">
              {/* Icon badge with amber/orange gradient */}
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-md">
                <Ticket className="w-5 h-5" />
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Tickets & Forfaits
              </h2>

              <p className="text-sm text-slate-300 leading-relaxed max-w-xl">
                Générez des tickets uniques par lots, définissez des limites de débit ou de volume,
                et imprimez-les instantanément. Vos vendeurs les distribuent sur le terrain via
                l'interface POS mobile.
              </p>
            </div>

            {/* Feature tags at the bottom */}
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-xs font-medium">
                PDF imprimables
              </span>
              <span className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-xs font-medium">
                POS vendeurs
              </span>
              <span className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-xs font-medium">
                Limites de vitesse
              </span>
            </div>
          </div>

          {/* Bento Card 2: Interactive "S'adapte à votre métier" (5 cols) */}
          <div className="lg:col-span-5 p-6 sm:p-8 rounded-3xl bg-slate-950/80 border border-white/[0.08] hover:border-amber-500/40 transition duration-300 flex flex-col justify-between space-y-6 shadow-xl relative overflow-hidden group">
            <div className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                S'adapte à votre métier
              </h2>

              {/* Micro-tabs with commutable icons */}
              <div className="flex items-center gap-2 p-1.5 bg-slate-900/90 border border-slate-800/80 rounded-xl w-fit">
                {(['cyber', 'hotel', 'cafe'] as const).map((key) => {
                  const Icon = industryProfiles[key].icon;
                  const isActive = activeIndustry === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setActiveIndustry(key)}
                      title={industryProfiles[key].name}
                      className={`p-2.5 rounded-lg transition-all cursor-pointer ${
                        isActive
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md font-bold'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </button>
                  );
                })}
              </div>

              {/* Dynamic industry text */}
              <div className="space-y-2 pt-1 transition-all duration-200">
                <h3 className="text-sm font-bold text-white">{currentProfile.name}</h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {currentProfile.description}
                </p>
              </div>
            </div>

            {/* Bottom status indicator */}
            <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-900 font-medium">
              {currentProfile.subtext}
            </div>
          </div>

          {/* Bento Card 3: Ventes & Comptabilité (6 cols) */}
          <div className="lg:col-span-6 p-6 sm:p-8 rounded-3xl bg-slate-950/80 border border-white/[0.08] hover:border-amber-500/40 transition duration-300 flex flex-col justify-between space-y-6 shadow-xl relative overflow-hidden group">
            <div className="space-y-4">
              {/* Icon badge */}
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-md">
                <BarChart3 className="w-5 h-5" />
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Ventes & Comptabilité
              </h2>

              <p className="text-sm text-slate-300 leading-relaxed">
                Suivi financier complet via un portefeuille prépayé de type ledger. Tracez chaque
                crédit, débit et commission vendeur automatiquement.
              </p>
            </div>

            {/* Highlighted local currencies text */}
            <div className="pt-2">
              <span className="text-xs font-bold text-amber-400 font-mono tracking-wide">
                Devises : FCFA / GNF / XOF
              </span>
            </div>
          </div>

          {/* Bento Card 4: Surveillance & Alertes (6 cols) */}
          <div className="lg:col-span-6 p-6 sm:p-8 rounded-3xl bg-slate-950/80 border border-white/[0.08] hover:border-amber-500/40 transition duration-300 flex flex-col justify-between space-y-6 shadow-xl relative overflow-hidden group">
            <div className="space-y-4">
              {/* Icon badge in green/emerald */}
              <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-md">
                <ShieldCheck className="w-5 h-5" />
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Surveillance & Alertes
              </h2>

              <p className="text-sm text-slate-300 leading-relaxed">
                Visualisez l'état en ligne de vos équipements, la consommation CPU, RAM et le
                nombre d'utilisateurs connectés. En cas de coupure réseau, soyez alerté
                instantanément.
              </p>
            </div>

            {/* Heartbeat sync reminder */}
            <div className="pt-2">
              <span className="text-xs text-slate-400 font-mono">
                Synchronisation continue toutes les 45 secondes.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. SECTION ARCHITECTURE CLOUD & DÉPLOIEMENT
      ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Centered section header matching screenshots */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-amber-400 text-xs font-semibold">
            <span>Architecture Cloud</span>
          </div>

          <h2
            className="text-3xl sm:text-5xl font-black text-white font-sans tracking-tight"
            style={{ textWrap: 'balance' }}
          >
            Connecté au cloud. Zéro configuration.
          </h2>

          <p className="text-sm text-slate-400 leading-relaxed">
            L'architecture de Joowifi a été spécialement conçue pour s'intégrer sans toucher à vos
            paramètres réseau, même sur les connexions mobiles les plus restrictives.
          </p>
        </div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: 2 Advantage Cards (6 cols) */}
          <div className="lg:col-span-6 space-y-5">
            {/* Card 1: Sécurité Maximale (Modèle Pull) */}
            <div className="p-6 sm:p-7 rounded-2xl bg-slate-950/80 border border-white/[0.08] hover:border-amber-500/40 transition duration-300 space-y-3 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20 shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white">
                  Sécurité Maximale (Modèle Pull)
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                C'est votre routeur MikroTik qui initie la connexion vers le serveur. Zéro port
                entrant à ouvrir, aucun VPN requis. Votre réseau reste protégé des attaques externes.
              </p>
            </div>

            {/* Card 2: Compatible tout FAI (CGNAT) */}
            <div className="p-6 sm:p-7 rounded-2xl bg-slate-950/80 border border-white/[0.08] hover:border-amber-500/40 transition duration-300 space-y-3 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20 shrink-0">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white">
                  Compatible tout FAI (CGNAT)
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Que vous soyez sur une ligne fixe, de l'ADSL ou un modem 4G, Joowifi fonctionne.
                L'absence d'adresse IP publique ou fixe n'est plus un obstacle.
              </p>
            </div>
          </div>

          {/* Right: Chronological Timeline 01 -> 02 -> 03 (6 cols) */}
          <div className="lg:col-span-6 space-y-8 pl-0 lg:pl-6 pt-2">
            {/* Step 01 */}
            <div className="flex items-start gap-4">
              <div className="flex flex-col items-center">
                <div className="w-4 h-4 rounded-full border-2 border-amber-500 bg-slate-950 shrink-0 mt-1 shadow-sm shadow-amber-500/50" />
                <div className="w-0.5 h-16 bg-slate-800 my-1" />
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-mono uppercase font-bold tracking-wider text-amber-500 block">
                  ÉTAPE 01
                </span>
                <h4 className="text-base font-bold text-white">Configurez vos offres</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Créez vos forfaits (temps, vitesse, volume) sur votre console Joowifi.
                </p>
              </div>
            </div>

            {/* Step 02 */}
            <div className="flex items-start gap-4">
              <div className="flex flex-col items-center">
                <div className="w-4 h-4 rounded-full border-2 border-amber-500 bg-slate-950 shrink-0 mt-1 shadow-sm shadow-amber-500/50" />
                <div className="w-0.5 h-16 bg-slate-800 my-1" />
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-mono uppercase font-bold tracking-wider text-amber-500 block">
                  ÉTAPE 02
                </span>
                <h4 className="text-base font-bold text-white">Collez le script local</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Copiez-collez l'installateur unique dans le terminal MikroTik en 1 clic.
                </p>
              </div>
            </div>

            {/* Step 03 */}
            <div className="flex items-start gap-4">
              <div className="flex flex-col items-center">
                <div className="w-4 h-4 rounded-full border-2 border-amber-500 bg-slate-950 shrink-0 mt-1 shadow-sm shadow-amber-500/50" />
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-mono uppercase font-bold tracking-wider text-amber-500 block">
                  ÉTAPE 03
                </span>
                <h4 className="text-base font-bold text-white">Vos tickets se synchronisent</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Les tickets générés descendent automatiquement sur le routeur.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. APPEL À L'ACTION FINAL (CTA Banner)
      ========================================================================= */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative">
        {/* Soft atmospheric ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[300px] bg-amber-500/10 blur-[130px] rounded-full -z-10 pointer-events-none" />

        {/* Stylized Wifi Icon Badge */}
        <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-500 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/15">
          <Wifi className="w-6 h-6" />
        </div>

        {/* Headline */}
        <h2
          className="text-3xl sm:text-5xl font-black text-white font-sans max-w-2xl mx-auto leading-tight"
          style={{ textWrap: 'balance' }}
        >
          Prêt à transformer votre WiFi en source de revenus ?
        </h2>

        {/* Subtitle */}
        <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
          Rejoignez les opérateurs qui ont choisi Joowifi pour gérer leurs hotspots MikroTik.
          Inscription gratuite, aucune carte bancaire requise.
        </p>

        {/* Dual Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
          <button
            onClick={() => openAuthModal('register')}
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-extrabold text-xs shadow-xl shadow-amber-500/25 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Créer mon compte gratuitement</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              setCurrentSpace('public');
              setPublicTab('contact');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold transition cursor-pointer"
          >
            Nous contacter
          </button>
        </div>
      </section>
    </div>
  );
};
