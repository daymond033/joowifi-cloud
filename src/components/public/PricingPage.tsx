import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Check,
  Plus,
  Minus,
  Wifi,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export const PricingPage: React.FC = () => {
  const { currentPlanId, upgradePlan, openAuthModal, setPublicTab, setCurrentSpace } = useApp();

  // FAQ state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [showAllFaqs, setShowAllFaqs] = useState(false);

  // 4 Pricing plans matching specifications
  const plans: {
    id: 'starter' | 'pro' | 'business' | 'enterprise';
    name: string;
    target: string;
    price: string;
    period: string;
    features: string[];
    buttonLabel: string;
    isPopular: boolean;
  }[] = [
    {
      id: 'starter',
      name: 'Starter',
      target: 'Idéal pour débuter',
      price: '3 000',
      period: '/ mois',
      features: [
        '3 routeurs MikroTik',
        'Tableau de bord standard',
        'Support par email',
      ],
      buttonLabel: 'Commencer',
      isPopular: false,
    },
    {
      id: 'pro',
      name: 'Pro',
      target: 'Pour les opérateurs actifs',
      price: '6 000',
      period: '/ mois',
      features: [
        '10 routeurs MikroTik',
        'Portail captif personnalisé',
        'Support prioritaire',
      ],
      buttonLabel: 'Choisir le plan Pro',
      isPopular: true,
    },
    {
      id: 'business',
      name: 'Business',
      target: 'Pour les réseaux multi-sites',
      price: '15 000',
      period: '/ mois',
      features: [
        '50 routeurs MikroTik',
        'Comptabilité avancée',
        'Support WhatsApp dédié',
      ],
      buttonLabel: 'Choisir le plan Business',
      isPopular: false,
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      target: 'Pour les grandes infrastructures',
      price: '30 000',
      period: '/ mois',
      features: [
        'Routeurs MikroTik illimités',
        'Commandes à distance avancées',
        'SLA garanti & Support VIP',
      ],
      buttonLabel: 'Choisir le plan Enterprise',
      isPopular: false,
    },
  ];

  const primaryFaqs = [
    {
      q: 'Quels routeurs MikroTik sont compatibles ?',
      a: 'Joowifi est 100% compatible avec MikroTik RouterOS v6.44+ (v6.49+ fortement recommandée) ainsi que toute la branche RouterOS v7.x (v7.10, v7.14, etc.). Tous les matériels RouterBOARD (hEX, hAP ac/ax, RB4011, CCR, etc.) sont nativement pris en charge.',
    },
    {
      q: 'Comment Joowifi se connecte-t-il sans ouvrir de port ?',
      a: 'Grâce à notre architecture sortante « Pull Cloud », votre routeur initie lui-même la requête HTTPS vers nos serveurs toutes les 45 secondes. Aucun port entrant n’est ouvert sur votre box ou modem 4G/5G, garantissant un fonctionnement parfait même derrière un CGNAT sans IP publique.',
    },
    {
      q: 'Mes données sont-elles sécurisées ?',
      a: 'Toutes les communications sont chiffrées de bout en bout en HTTPS/TLS. Les mots de passe sont protégés en bcrypt (cost 12), les sessions sont protégées et le trafic réseau de vos clients ne transite jamais par nos serveurs (seuls les identifiants et métadonnées de tickets sont gérés).',
    },
    {
      q: 'Puis-je gérer plusieurs sites depuis un seul compte ?',
      a: 'Oui, absolument. Vous pouvez rattacher autant de routeurs que permis par votre forfait, les affecter à des zones géographiques distinctes (ex: Cocody, Yopougon, Bouaké) et définir des forfaits et tarifs spécifiques pour chaque site.',
    },
  ];

  const additionalFaqs = [
    {
      q: 'Comment s’effectue la vente de tickets sur le terrain ?',
      a: 'Vos vendeurs ont accès à l’application PWA Joowifi Caisse POS sur leur smartphone. En 1-Tap, ils émettent un ticket avec code et PIN, l’impriment sur imprimante thermique Bluetooth ou l’envoient par SMS/WhatsApp au client.',
    },
    {
      q: 'Comment sont gérés les retraits Mobile Money de mes gains ?',
      a: 'Lorsqu’un client paye en ligne sur le portail captif via Wave, Orange Money ou MTN MoMo, vos gains sont crédités instantanément sur votre solde opérateur et retirables directement vers votre numéro en 1 clic.',
    },
    {
      q: 'Que se passe-t-il en cas de coupure de courant ou de panne d’électricité ?',
      a: 'Si un routeur cesse d’envoyer son battement de cœur (Heartbeat 45s), le système vous notifie immédiatement sur Telegram (si configuré). Dès le retour du courant, le routeur se resynchronise automatiquement sans aucune intervention manuelle.',
    },
    {
      q: 'Ai-je un engagement de durée sur les forfaits ?',
      a: 'Aucun engagement. Vous pouvez changer de formule ou suspendre votre compte à tout moment depuis votre console Joowifi Cloud.',
    },
  ];

  const displayedFaqs = showAllFaqs ? [...primaryFaqs, ...additionalFaqs] : primaryFaqs;

  const handlePlanAction = (planId: 'starter' | 'pro' | 'business' | 'enterprise') => {
    if (currentPlanId === planId) {
      setCurrentSpace('admin');
      return;
    }
    upgradePlan(planId);
    openAuthModal('register');
  };

  return (
    <div className="space-y-24 sm:space-y-32 pb-24 pt-6 sm:pt-12">
      {/* =========================================================================
          1. EN-TÊTE DE SECTION (PRICING HERO)
      ========================================================================= */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        {/* Subtle pill badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 text-slate-400 text-xs font-medium shadow-sm backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-[#007A78]" />
          <span>Tarification</span>
        </div>

        {/* Strong headline */}
        <h1
          className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-800 font-sans leading-tight"
          style={{ textWrap: 'balance' }}
        >
          Un plan pour chaque ambition
        </h1>

        {/* Sober subtitle */}
        <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          Démarrez simplement, évoluez quand votre activité grandit. Choisissez le plan adapté à
          vos besoins.
        </p>
      </section>

      {/* =========================================================================
          2. GRILLE DES 4 PLANS TARIFAIRES (PRICING CARDS GRID)
      ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {plans.map((plan) => {
            const isPopular = plan.isPopular;

            return (
              <div
                key={plan.id}
                className={`rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 relative ${
                  isPopular
                    ? 'bg-[#F8FAFC] border-2 border-amber-500/60 shadow-2xl shadow-amber-500/10 hover:border-amber-400'
                    : 'bg-[#F8FAFC] border border-slate-200 hover:border-[#99D5D3]'
                }`}
              >
                {/* Popular Badge on Top */}
                {isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#008060] hover:bg-[#006B50] text-white font-black text-[10px] uppercase tracking-wider px-3.5 py-1 rounded-full shadow-lg shadow-orange-500/25">
                    PLUS POPULAIRE
                  </div>
                )}

                <div className="space-y-6">
                  {/* Plan Name & Target Audience */}
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold text-slate-800 tracking-tight">{plan.name}</h3>
                    <p className="text-xs text-slate-400">{plan.target}</p>
                  </div>

                  {/* Price Block */}
                  <div className="pt-1">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl sm:text-4xl font-black text-slate-800 font-mono tabular-nums tracking-tight">
                        {plan.price}
                      </span>
                      <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                        FCFA
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">{plan.period}</div>
                  </div>

                  {/* Features List with Styled Checks */}
                  <div className="space-y-3 pt-3 border-t border-slate-900">
                    {plan.features.map((feat) => (
                      <div key={feat} className="flex items-start gap-2.5 text-xs text-slate-600">
                        <Check
                          className={`w-4 h-4 shrink-0 mt-0.5 ${
                            isPopular ? 'text-[#007A78]' : 'text-slate-400'
                          }`}
                        />
                        <span className="leading-relaxed">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Button */}
                <div className="pt-8 mt-6">
                  <button
                    onClick={() => handlePlanAction(plan.id)}
                    className={`w-full py-3 rounded-xl font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 ${
                      isPopular
                        ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 shadow-xl shadow-amber-500/25 hover:scale-[1.02] active:scale-95'
                        : 'bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-800 border border-slate-200 hover:border-slate-300 active:scale-95'
                    }`}
                  >
                    <span>{plan.buttonLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* 3. Note informative Paiements & Devises */}
        <p className="text-center text-xs text-slate-500 max-w-2xl mx-auto mt-10 leading-relaxed">
          Tous les prix sont en FCFA (Franc CFA). Paiements sécurisés par Mobile Money (Orange, MTN,
          Wave) et carte bancaire. Les tarifs s'adaptent automatiquement dans votre devise locale
          (GNF, XOF) lors de votre souscription.
        </p>
      </section>

      {/* =========================================================================
          4. SECTION FAQ INTERACTIVE (FOIRE AUX QUESTIONS)
      ========================================================================= */}
      <section id="faq" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-400 text-xs font-semibold">
            <span>FAQ</span>
          </div>

          <h2
            className="text-3xl sm:text-4xl font-extrabold text-slate-800 font-sans tracking-tight"
            style={{ textWrap: 'balance' }}
          >
            Questions fréquentes
          </h2>

          <p className="text-xs sm:text-sm text-slate-400">
            Tout ce que vous devez savoir avant de démarrer.
          </p>
        </div>

        {/* 2-Column Accordion Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayedFaqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;

            return (
              <div
                key={faq.q}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? 'bg-white border-[#99D5D3] shadow-lg'
                    : 'bg-[#F8FAFC] border-slate-200 hover:border-slate-300'
                }`}
              >
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-3 text-xs sm:text-sm font-bold text-slate-800 hover:text-[#007A78] transition cursor-pointer"
                >
                  <span className="leading-snug">{faq.q}</span>
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                      isOpen
                        ? 'bg-[#E6F4F3] text-[#007A78]'
                        : 'bg-white text-slate-400'
                    }`}
                  >
                    {isOpen ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-200 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Toggle Show All Button */}
        <div className="text-center pt-2">
          <button
            onClick={() => setShowAllFaqs(!showAllFaqs)}
            className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-600 hover:text-slate-800 transition cursor-pointer"
          >
            {showAllFaqs ? 'Réduire les questions' : 'Afficher toutes les questions'}
          </button>
        </div>
      </section>

      {/* =========================================================================
          5. BANNIÈRE CTA FINALE
      ========================================================================= */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative">
        {/* Soft atmospheric ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[300px] bg-[#E6F4F3] blur-[130px] rounded-full -z-10 pointer-events-none" />

        {/* Stylized Wifi Icon Badge */}
        <div className="w-12 h-12 rounded-2xl bg-[#E6F4F3] border border-[#99D5D3] text-[#007A78] flex items-center justify-center mx-auto shadow-lg shadow-amber-500/15">
          <Wifi className="w-6 h-6" />
        </div>

        {/* Headline */}
        <h2
          className="text-3xl sm:text-5xl font-black text-slate-800 font-sans max-w-2xl mx-auto leading-tight"
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
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-800 border border-slate-200 text-xs font-semibold transition cursor-pointer"
          >
            Nous contacter
          </button>
        </div>
      </section>
    </div>
  );
};
