import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Check,
  Plus,
  Minus,
  ArrowRight,
  Building2,
} from 'lucide-react';

export const PricingPage: React.FC = () => {
  const { openAuthModal, setPublicTab } = useApp();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const plans = [
    {
      id: 'starter' as const,
      badge: 'OFFRE DE TEST',
      name: 'Essai 14 Jours',
      target: 'Testez gratuitement sur votre équipement',
      price: 'Gratuit',
      period: 'pendant 14 jours',
      features: [
        '1 routeur MikroTik connecté',
        'Jusqu’à 2 comptes vendeurs POS',
        'Génération de tickets & QR Codes',
        'Portail captif standard inclus',
        'Synchronisation Cloud automatique',
      ],
      buttonLabel: 'Démarrer l’essai 14 jours',
      action: 'register' as const,
      isPopular: false,
    },
    {
      id: 'pro' as const,
      badge: 'RECOMMANDÉ',
      name: 'Plan Pro',
      target: 'Pour les opérateurs WiFi actifs',
      price: '6 000 FCFA',
      period: '/ mois',
      features: [
        'Jusqu’à 5 routeurs MikroTik',
        '10 comptes vendeurs Caisse POS',
        'Portail captif personnalisé & Mobile Money',
        'Verrouillage adresse MAC & Cookie 30j',
        'Support technique prioritaire 6j/7',
      ],
      buttonLabel: 'Choisir le plan à 6 000 FCFA',
      action: 'register' as const,
      isPopular: true,
    },
    {
      id: 'business' as const,
      badge: 'MULTI-SITES',
      name: 'Plan Business',
      target: 'Pour les réseaux étendus et résidences',
      price: '15 000 FCFA',
      period: '/ mois',
      features: [
        'Jusqu’à 25 routeurs MikroTik multi-sites',
        '50 comptes vendeurs Caisse POS',
        'Comptabilité & Bilan d’exploitation avancé',
        'Alertes Telegram en temps réel',
        'Support WhatsApp dédié 7j/7',
      ],
      buttonLabel: 'Choisir le plan à 15 000 FCFA',
      action: 'register' as const,
      isPopular: false,
    },
    {
      id: 'enterprise' as const,
      badge: 'GRANDS COMPTES',
      name: 'Offre Entreprise',
      target: 'Campus, chaînes hôtelières & FAI',
      price: 'Sur Devis',
      period: 'personnalisé',
      features: [
        'Routeurs MikroTik & Sites illimités',
        'Vendeurs Caisse POS illimités',
        'Infrastructure Cloud dédiée & SLA 99.9%',
        'Intégration sur mesure & Webhooks',
        'Ingénieur réseau dédié 24h/24',
      ],
      buttonLabel: 'Nous contacter (Devis)',
      action: 'contact' as const,
      isPopular: false,
    },
  ];

  const faqs = [
    {
      q: 'Comment fonctionne l’offre de test de 14 jours ?',
      a: 'Dès votre inscription, vous bénéficiez de 14 jours complets pour connecter votre routeur MikroTik, créer vos forfaits et tester la Caisse POS sans aucun frais.',
    },
    {
      q: 'Quels modèles de routeurs MikroTik sont compatibles ?',
      a: 'Tous les routeurs MikroTik exécutant RouterOS v6.49+ ou RouterOS v7.x (hEX, RB4011, RB5009, hAP ac2/ac3, CCR, ainsi que les routeurs virtuels CHR).',
    },
    {
      q: 'Comment régler mon abonnement mensuel (6 000 FCFA ou 15 000 FCFA) ?',
      a: 'Le règlement s’effectue directement depuis votre espace Cloud par Mobile Money (Wave, Orange Money, MTN MoMo, Moov Money).',
    },
    {
      q: 'Mes vendeurs POS peuvent-ils modifier mes paramètres routeur ?',
      a: 'Non. Grâce à la séparation stricte des rôles, un compte Vendeur créé par l’administrateur n’a accès qu’à son terminal de vente Caisse POS.',
    },
  ];

  return (
    <div className="bg-[#F4F7FA] text-[#1E293B] py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-14">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-[#008060]">
            GRILLE TARIFAIRE JOOWIFI CLOUD
          </span>
          <h1 className="text-3xl sm:text-4xl font-light text-slate-900">
            Des offres claires adaptées à chaque déploiement
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Démarrez avec 14 jours d'essai gratuit. Aucun engagement de durée, évoluez à tout moment.
          </p>
        </div>

        {/* 4 Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((p) => (
            <div
              key={p.id}
              className={`bg-white rounded-lg p-6 flex flex-col justify-between space-y-6 transition ${
                p.isPopular
                  ? 'border-2 border-[#008060] shadow-lg'
                  : 'border border-slate-200 shadow-2xs'
              }`}
            >
              <div className="space-y-3">
                <span
                  className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                    p.isPopular
                      ? 'bg-[#E6F4F3] text-[#008060]'
                      : p.id === 'enterprise'
                      ? 'bg-slate-800 text-white'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {p.badge}
                </span>

                <h2 className="text-xl font-bold text-slate-900">{p.name}</h2>
                <p className="text-xs text-slate-500">{p.target}</p>

                <div className="pt-2 flex items-baseline gap-1.5">
                  <span className="text-2xl sm:text-3xl font-black text-[#005A5B] font-mono">
                    {p.price}
                  </span>
                  <span className="text-xs text-slate-500">{p.period}</span>
                </div>

                <ul className="space-y-2.5 pt-4 border-t border-slate-100 text-xs text-slate-700">
                  {p.features.map((feat, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#008060] shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => {
                  if (p.action === 'contact') {
                    setPublicTab('contact');
                  } else {
                    openAuthModal('register');
                  }
                }}
                className={`w-full py-3 rounded font-semibold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  p.isPopular
                    ? 'bg-[#008060] hover:bg-[#006B50] text-white'
                    : p.action === 'contact'
                    ? 'bg-[#005A5B] hover:bg-[#004445] text-white'
                    : 'bg-[#F4F7FA] hover:bg-[#008060] text-slate-800 hover:text-white border border-slate-300 hover:border-[#008060]'
                }`}
              >
                {p.action === 'contact' && <Building2 className="w-3.5 h-3.5" />}
                <span>{p.buttonLabel}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto bg-white rounded-lg border border-slate-200 p-6 sm:p-8 space-y-4">
          <h3 className="text-lg font-bold text-slate-800">Questions Fréquentes</h3>
          <div className="divide-y divide-slate-200 text-xs">
            {faqs.map((f, idx) => (
              <div key={idx} className="py-3.5">
                <button
                  onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                  className="w-full flex items-center justify-between text-left font-semibold text-slate-800 cursor-pointer"
                >
                  <span>{f.q}</span>
                  {openFaqIndex === idx ? (
                    <Minus className="w-4 h-4 text-[#008060] shrink-0" />
                  ) : (
                    <Plus className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>
                {openFaqIndex === idx && (
                  <p className="text-slate-600 mt-2 leading-relaxed">{f.a}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
