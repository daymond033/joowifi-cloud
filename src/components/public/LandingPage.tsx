import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Wifi,
  Smartphone,
  Server,
  ChevronLeft,
  ChevronRight,
  ChevronRight as ArrowIcon,
  PhoneCall,
  Headphones,
  Check,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { setCurrentSpace, setAdminTab, setPublicTab, openAuthModal, user } = useApp();

  // State to toggle hidden descriptions on the 2 right-hand scenario cards (Section 1.3 of Audit)
  const [expandedRightCards, setExpandedRightCards] = useState<{
    hotels: boolean;
    highDensity: boolean;
  }>({
    hotels: false,
    highDensity: false,
  });

  // Case Studies Carousel State
  const [caseIndex, setCaseIndex] = useState<number>(0);

  const caseStudies = [
    {
      brand: 'Cité Universitaire Mermoz — Cocody',
      badge: 'CAMPUS & RÉSIDENCES',
      image:
        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1000&q=80',
      titleBefore:
        'La technologie Cloud de Joowifi offre une stabilité remarquable et une gestion fluide pour ',
      highlightBlue: 'plus de 450 studios étudiants',
      titleAfter: '',
      quote:
        '« Les fonctionnalités sont excellentes et nous n’avons rencontré aucune saturation d’adresses IP grâce au bail DHCP court d’une heure et au Cookie MAC 30 jours. Tout est piloté dans le Cloud en temps réel. »',
      author: 'Kouamé Konan, Directeur Technique — Ivoire Hotspot Réseaux',
    },
    {
      brand: 'Galerie Marchande Grand Adjamé',
      badge: 'COMMERCE & KIOSQUES POS',
      image:
        'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1000&q=80',
      titleBefore:
        'Joowifi optimise l’encaissement terrain et la vente de tickets WiFi sur ',
      highlightBlue: '12 kiosques et vendeurs POS',
      titleAfter: ' en temps réel',
      quote:
        '« Dès qu’un vendeur encaisse un client sur son smartphone via la Caisse POS Joowifi, le code ticket est créé sur notre routeur MikroTik automatiquement. Le suivi des commissions est instantané. »',
      author: 'Mamadou Fonate, Superviseur Réseau de Vente — Adjamé',
    },
    {
      brand: 'Complexe Hôtelier & Résidences Assinie',
      badge: 'HÔTELLERIE & LOISIRS',
      image:
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80',
      titleBefore:
        'Joowifi rationalise l’accès WiFi haut débit par satellite ',
      highlightBlue: 'sur plus de 120 chambres',
      titleAfter: ' et espaces piscines intérieurs/extérieurs',
      quote:
        '« Une fois le script MikroTik importé dans WinBox, le routeur remonte instantanément dans la console Cloud. Cela a réduit notre temps de déploiement et de maintenance de 80 %. »',
      author: 'Jean-Marc Koffi, Ingénieur Télécom & Intégrateur Réseau',
    },
  ];

  // B2B ROI Simulator State
  const [dailyVouchers, setDailyVouchers] = useState<number>(80);
  const [voucherPrice, setVoucherPrice] = useState<number>(500);
  const [ispCost, setIspCost] = useState<number>(35000);
  const grossMonthly = dailyVouchers * voucherPrice * 30;
  const netMonthly = Math.max(0, Math.round(grossMonthly * 0.9 - ispCost));

  const currentCase = caseStudies[caseIndex];

  return (
    <div className="bg-white text-[#1E293B] select-none">
      {/* =========================================================================
          1. HERO BANNER (Boutons "Se connecter" + CTA Commercial "Essai Gratuit 14 Jours")
             Marque Blanche : aucune mention des technologies backend
      ========================================================================= */}
      <section className="w-full bg-gradient-to-b from-[#EAF2F8] via-[#F2F7FB] to-[#FFFFFF] border-b border-slate-200 py-14 sm:py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left 5 Columns: Crisp Corporate Copy & Commercial CTAs */}
          <div className="lg:col-span-5 space-y-5">
            <div className="text-lg sm:text-xl font-normal text-slate-700">
              Plateforme Cloud de Gestion Hotspot
            </div>

            <h1 className="text-4xl sm:text-5xl font-normal tracking-tight text-[#0066CC] leading-[1.12]">
              Joowifi Cloud 6.3
            </h1>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Supervisez vos routeurs MikroTik à distance, équipez vos revendeurs d'une Caisse POS mobile et encaissez par Mobile Money — Tout sur une seule plateforme Cloud.
            </p>

            {/* Section 1.2 Audit : "Se connecter" + Nouvel Appel à l'Action Commercial */}
            <div className="pt-3 flex flex-wrap items-center gap-3.5">
              <button
                onClick={() => openAuthModal('login')}
                className="px-7 py-3 rounded bg-[#008060] hover:bg-[#00664D] text-white font-medium text-sm transition cursor-pointer shadow-xs"
              >
                Se connecter
              </button>

              <button
                onClick={() => setPublicTab('pricing')}
                className="px-6 py-3 rounded bg-white hover:bg-slate-50 text-[#005A5B] border border-slate-300 font-medium text-sm transition cursor-pointer"
              >
                Essai Gratuit 14 Jours — Voir les Offres
              </button>
            </div>

            {/* White-Label Key Metrics (Zero backend stack disclosure) */}
            <div className="pt-4 grid grid-cols-3 gap-4 border-t border-slate-200/80 text-xs">
              <div>
                <div className="font-bold text-slate-800 text-base">Sync Cloud</div>
                <div className="text-slate-500">Temps Réel</div>
              </div>
              <div>
                <div className="font-bold text-slate-800 text-base">Plug & Play</div>
                <div className="text-slate-500">Fibre, 4G & Satellite</div>
              </div>
              <div>
                <div className="font-bold text-slate-800 text-base">Multi-Sites</div>
                <div className="text-slate-500">Gestion Centralisée</div>
              </div>
            </div>
          </div>

          {/* Right 7 Columns: Hardware + Live Controller 6.3 Monitor Mockup */}
          <div className="lg:col-span-7 relative flex items-center justify-center pt-4 lg:pt-0">
            <div className="relative w-full max-w-2xl">
              <div
                onClick={() => openAuthModal('login')}
                className="w-full rounded-xl bg-[#111827] p-2.5 shadow-2xl border border-slate-700 cursor-pointer group"
              >
                <div className="bg-[#F4F7FA] rounded-lg overflow-hidden border border-slate-200">
                  <div className="h-7 bg-[#005A5B] px-3 flex items-center justify-between text-[10px] text-white">
                    <span className="font-bold">Joowifi Cloud Controller</span>
                    <div className="flex items-center gap-3 text-teal-100">
                      <span>Tableau de bord</span>
                      <span>Topologie</span>
                      <span>Vouchers</span>
                      <span>Passerelles MikroTik</span>
                    </div>
                    <span className="px-1.5 py-0.5 rounded bg-[#008060] text-[9px]">Cloud Actif</span>
                  </div>

                  <div className="p-4 grid grid-cols-12 gap-3 bg-white">
                    <div className="col-span-4 p-3 rounded border border-slate-200 flex flex-col items-center justify-center text-center bg-[#F8FAFC]">
                      <div className="text-[9px] font-bold text-slate-500 uppercase mb-1">
                        Santé Réseau
                      </div>
                      <div className="w-16 h-16 rounded-full border-[5px] border-[#008060] flex flex-col items-center justify-center">
                        <span className="text-lg font-black text-slate-800 leading-none">98</span>
                        <span className="text-[8px] text-[#008060] font-bold">Excellent</span>
                      </div>
                      <div className="mt-2 text-[9px] text-slate-500">
                        Disponibilité 99.9%
                      </div>
                    </div>

                    <div className="col-span-8 p-3 rounded border border-slate-200 space-y-2 bg-white">
                      <div className="flex items-center justify-between text-[9px] font-bold text-slate-600">
                        <span>Disponibilité Passerelles MikroTik & Cloud 24h</span>
                        <span className="text-[#008060]">100% Synchronisé</span>
                      </div>
                      <div className="space-y-1.5">
                        <div>
                          <div className="flex justify-between text-[8px] text-slate-500 mb-0.5">
                            <span>Passerelle Principale (RouterOS v7)</span>
                            <span>Synchronisation Cloud OK</span>
                          </div>
                          <div className="h-2 rounded-full bg-emerald-500 w-full" />
                        </div>
                        <div>
                          <div className="flex justify-between text-[8px] text-slate-500 mb-0.5">
                            <span>Terminaux Caisse POS Vendeurs</span>
                            <span>Recettes en direct</span>
                          </div>
                          <div className="h-2 rounded-full bg-[#007A78] w-11/12" />
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-1.5 pt-1 text-center">
                        <div className="p-1.5 rounded bg-[#F4F7FA] border border-slate-200">
                          <div className="text-[10px] font-bold text-slate-800">Multi</div>
                          <div className="text-[8px] text-slate-500">Sites</div>
                        </div>
                        <div className="p-1.5 rounded bg-[#F4F7FA] border border-slate-200">
                          <div className="text-[10px] font-bold text-[#007A78]">Auto</div>
                          <div className="text-[8px] text-slate-500">Vouchers</div>
                        </div>
                        <div className="p-1.5 rounded bg-[#F4F7FA] border border-slate-200">
                          <div className="text-[10px] font-bold text-slate-800">POS</div>
                          <div className="text-[8px] text-slate-500">Vendeurs</div>
                        </div>
                        <div className="p-1.5 rounded bg-[#F4F7FA] border border-slate-200">
                          <div className="text-[10px] font-bold text-[#008060]">Cloud</div>
                          <div className="text-[8px] text-slate-500">Direct</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 sm:-mt-10 relative z-10 flex flex-wrap sm:flex-nowrap items-end justify-between gap-3 px-2">
                <div
                  onClick={() => openAuthModal('login')}
                  className="w-28 bg-white rounded-2xl border-2 border-slate-700 shadow-xl p-2 cursor-pointer hover:-translate-y-1 transition shrink-0"
                >
                  <div className="text-[8px] font-bold text-[#005A5B] border-b border-slate-100 pb-1 flex justify-between">
                    <span>Caisse POS</span>
                    <span className="text-emerald-600">●</span>
                  </div>
                  <div className="py-2 text-center">
                    <div className="text-[8px] text-slate-400">Pass Hebdo</div>
                    <div className="font-mono font-black text-xs text-slate-800">QR WIFI</div>
                    <div className="text-[8px] text-[#008060] font-bold">2 500 FCFA</div>
                  </div>
                  <div className="w-full py-1 rounded bg-[#008060] text-white text-[8px] font-bold text-center">
                    Vente 1-Clic
                  </div>
                </div>

                <div className="flex-1 space-y-1.5 max-w-xs">
                  <div className="h-7 rounded bg-[#1E293B] border border-slate-600 px-3 flex items-center justify-between text-[9px] text-slate-200 font-mono shadow-md">
                    <span>MIKROTIK ROUTEROS</span>
                    <span className="text-emerald-400">●●●●●●●●</span>
                  </div>
                  <div className="h-8 rounded bg-gradient-to-b from-slate-200 to-slate-300 border border-slate-400 px-3 flex items-center justify-between text-[9px] text-slate-800 font-mono font-bold shadow-md">
                    <span>PASSERELLE JOOWIFI</span>
                    <div className="flex gap-1">
                      <span className="w-2.5 h-2 bg-slate-700 rounded-xs" />
                      <span className="w-2.5 h-2 bg-slate-700 rounded-xs" />
                      <span className="w-2.5 h-2 bg-emerald-600 rounded-xs" />
                    </div>
                  </div>
                </div>

                <div className="px-4 py-2 rounded-2xl bg-gradient-to-r from-[#00A870] to-[#10B981] text-white font-bold text-sm shadow-lg shrink-0">
                  Cloud
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. BANNIÈRE CONTRASTÉE : "Une gestion de réseau et billetterie basée sur le Cloud"
      ========================================================================= */}
      <section className="w-full bg-[#111921] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6">
            <div className="rounded-lg overflow-hidden border border-white/15 shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1000&q=80"
                alt="Supervision Cloud Joowifi"
                className="w-full h-72 object-cover"
              />
            </div>
          </div>

          <div className="lg:col-span-6 space-y-4">
            <h2 className="text-2xl sm:text-4xl font-light text-white leading-snug">
              Une gestion de réseau MikroTik et de billetterie WiFi simple basée sur le Cloud
            </h2>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
              <span className="text-[#34D399] font-semibold">Joowifi Cloud</span> vous permet de connecter vos routeurs MikroTik en 1 ligne de commande, de générer vos lots de tickets et de suivre les encaissements de vos vendeurs POS en temps réel, sans serveur local.
            </p>
            <div className="pt-2">
              <button
                onClick={() => openAuthModal('register')}
                className="px-6 py-2.5 rounded bg-[#00A870] hover:bg-[#008F5D] text-white text-xs font-semibold transition cursor-pointer"
              >
                Démarrer l'essai gratuit 14 jours
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. LES 3 PILIERS PRODUITS (Marque Blanche : "Cloud" uniquement)
      ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
        <div className="w-full rounded-lg bg-[#EEF2F6] border border-slate-200 p-8 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 space-y-3">
            <h3 className="text-2xl sm:text-3xl font-normal text-[#0066CC] leading-tight">
              Synchronisation Cloud Directe,
              <br />
              <span className="text-slate-800">compatible Fibre, 4G et Satellite</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-600">
              Liaison Cloud automatisée avec vos routeurs MikroTik RouterOS v6 & v7 sans configuration réseau complexe ni adresse IP publique fixe.
            </p>
            <button
              onClick={() => setPublicTab('features')}
              className="text-xs font-semibold text-[#008060] hover:underline flex items-center gap-1 pt-1 cursor-pointer"
            >
              <span>En savoir plus</span>
              <ArrowIcon className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="lg:col-span-6 flex items-center justify-around py-4">
            <div className="text-center space-y-1.5">
              <div className="w-12 h-12 mx-auto rounded-full bg-[#008060] text-white flex items-center justify-center shadow-md">
                <Smartphone className="w-5 h-5" />
              </div>
              <div className="text-xs font-bold text-slate-700">Caisse POS</div>
            </div>
            <div className="flex-1 h-0.5 bg-[#008060]/40 mx-2" />
            <div className="text-center space-y-1.5">
              <div className="w-14 h-14 mx-auto rounded-full bg-[#005A5B] text-white flex items-center justify-center shadow-lg border-4 border-white">
                <Server className="w-6 h-6" />
              </div>
              <div className="text-xs font-bold text-[#005A5B]">Joowifi Cloud</div>
            </div>
            <div className="flex-1 h-0.5 bg-[#008060]/40 mx-2" />
            <div className="text-center space-y-1.5">
              <div className="w-12 h-12 mx-auto rounded-full bg-[#008060] text-white flex items-center justify-center shadow-md">
                <Wifi className="w-5 h-5" />
              </div>
              <div className="text-xs font-bold text-slate-700">MikroTik OS</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <div className="h-52 rounded bg-gradient-to-b from-[#CBD5E1] to-[#E2E8F0] p-6 flex flex-col items-center justify-end border border-slate-300/80">
              <div className="w-full max-w-[220px] space-y-2">
                <div className="h-8 rounded bg-[#1E293B] text-white text-[10px] font-mono px-3 flex items-center justify-between shadow">
                  <span>MIKROTIK ROUTEROS</span>
                  <span className="text-emerald-400">v6 & v7</span>
                </div>
                <div className="h-10 rounded bg-white border border-slate-300 px-3 flex items-center justify-between text-[10px] font-bold text-slate-700 shadow">
                  <span>Synchronisation Cloud</span>
                  <span className="text-[#008060]">Automatique</span>
                </div>
              </div>
            </div>
            <h3 className="text-base font-bold text-slate-800">Passerelles & Script MikroTik</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Compatible avec tous les routeurs MikroTik (hEX, RB5009, CCR, hAP et CHR). Gestion automatique des profils de débit, bail DHCP optimisé et reconnexion transparente.
            </p>
            <button
              onClick={() => setPublicTab('features')}
              className="text-xs font-semibold text-[#008060] hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              <span>En savoir plus</span>
              <ArrowIcon className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="h-52 rounded bg-gradient-to-b from-[#CBD5E1] to-[#E2E8F0] p-6 flex flex-col items-center justify-end border border-slate-300/80">
              <div className="w-40 bg-white rounded-t-xl border border-slate-300 p-3 shadow-md text-center space-y-1.5">
                <div className="text-[10px] font-bold text-[#005A5B]">Terminal Caisse POS</div>
                <div className="font-mono font-black text-sm text-slate-900 bg-slate-100 py-1 rounded">
                  VOUCHER WIFI
                </div>
                <div className="text-[10px] text-[#008060] font-bold">Pass 3 Jours • 1 200 F</div>
              </div>
            </div>
            <h3 className="text-base font-bold text-slate-800">Caisse POS Vendeurs Dédiée</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Équipez vos revendeurs d'un compte vendeur sécurisé et restreint à la Caisse POS : encaissement en 1 clic, QR Code WiFi, impression thermique Bluetooth et suivi des commissions.
            </p>
            <button
              onClick={() => openAuthModal('login')}
              className="text-xs font-semibold text-[#008060] hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              <span>Se connecter en tant que Vendeur</span>
              <ArrowIcon className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="h-52 rounded bg-gradient-to-b from-[#CBD5E1] to-[#E2E8F0] p-6 flex flex-col items-center justify-end border border-slate-300/80">
              <div className="w-full max-w-[220px] bg-white rounded-t-xl border border-slate-300 p-3 shadow-md space-y-2">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-700">
                  <span>Portail Captif</span>
                  <span className="text-[#008060]">Wave • Orange • MTN</span>
                </div>
                <div className="h-6 rounded bg-slate-100 border border-slate-200 flex items-center justify-center font-mono text-[10px] text-slate-600">
                  Code Ticket WiFi
                </div>
                <div className="h-6 rounded bg-[#007A78] text-white text-[10px] font-bold flex items-center justify-center">
                  Connexion Instantanée
                </div>
              </div>
            </div>
            <h3 className="text-base font-bold text-slate-800">Portail Captif & Mobile Money</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Personnalisez votre portail captif aux couleurs de votre marque et encaissez directement par Wave, Orange Money, MTN MoMo et Moov 24h/24.
            </p>
            <button
              onClick={() => setPublicTab('features')}
              className="text-xs font-semibold text-[#008060] hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              <span>Découvrir le studio</span>
              <ArrowIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. SOLUTIONS DE SCÉNARIO (Section 1.3 Audit :
             - Les 3 grandes cartes verticales ont toutes une description textuelle
             - Les 2 petites images à droite ont leur texte descriptif masqué par défaut
               et révélé au clic sur "En savoir plus")
      ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div className="border-b border-slate-200 pb-3">
          <h2 className="text-2xl sm:text-3xl font-light text-slate-800">
            Solutions de scénario
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 lg:h-[460px]">
          {/* Col 1 : Tall Card — Cités & Multi-résidentielles (Avec description textuelle) */}
          <div
            onClick={() => setPublicTab('features')}
            className="relative rounded overflow-hidden group cursor-pointer h-80 lg:h-full"
          >
            <img
              src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=700&q=80"
              alt="Multi-résidentielles & Cités"
              className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10" />
            <div className="absolute bottom-5 left-5 right-5 text-white space-y-2">
              <h3 className="text-lg font-normal leading-snug">
                Cités & Multi-résidentielles
              </h3>
              <p className="text-xs text-gray-200 leading-relaxed">
                Offrez un Wi-Fi haut débit par chambre ou studio avec reconnexion automatique par Cookie MAC et forfaits mensuels ou hebdomadaires.
              </p>
              <span className="inline-flex items-center gap-1 text-xs text-[#34D399] font-medium pt-1">
                <span>En savoir plus</span>
                <ArrowIcon className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>

          {/* Col 2 : Tall Card — Kiosques POS & Restaurants (Avec description textuelle) */}
          <div
            onClick={() => setPublicTab('features')}
            className="relative rounded overflow-hidden group cursor-pointer h-80 lg:h-full"
          >
            <img
              src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=700&q=80"
              alt="Kiosques POS & Commerces"
              className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10" />
            <div className="absolute bottom-5 left-5 right-5 text-white space-y-2">
              <h3 className="text-lg font-normal leading-snug">
                Kiosques POS, maquis et commerces
              </h3>
              <p className="text-xs text-gray-200 leading-relaxed">
                Vendez des tickets Wi-Fi en 1 clic depuis un smartphone ou par QR Code Mobile Money avec suivi automatique des recettes et commissions.
              </p>
              <span className="inline-flex items-center gap-1 text-xs text-[#34D399] font-medium pt-1">
                <span>En savoir plus</span>
                <ArrowIcon className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>

          {/* Col 3 : Tall Card — Bureaux PME & Coworking (Avec description textuelle) */}
          <div
            onClick={() => setPublicTab('features')}
            className="relative rounded overflow-hidden group cursor-pointer h-80 lg:h-full"
          >
            <img
              src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=700&q=80"
              alt="Bureaux PME"
              className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/10" />
            <div className="absolute bottom-5 left-5 right-5 text-white space-y-2">
              <h3 className="text-lg font-normal leading-snug">
                Bureaux de petite et moyenne taille
              </h3>
              <p className="text-xs text-gray-200 leading-relaxed">
                Du Wi-Fi pour le personnel et les invités à la gestion des débits et caméras IP par Bypass MAC, Joowifi prend en charge toutes les fonctions clés.
              </p>
              <span className="inline-flex items-center gap-1 text-xs text-[#34D399] font-medium pt-1">
                <span>En savoir plus</span>
                <ArrowIcon className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>

          {/* Col 4 : 2 Stacked Horizontal Cards — Description masquée par défaut et révélée au clic sur "En savoir plus" */}
          <div className="grid grid-rows-2 gap-5 h-[420px] lg:h-full">
            {/* Petite carte droite 1 : Wi-Fi pour les hôtels */}
            <div className="relative rounded overflow-hidden group h-full">
              <img
                src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=700&q=80"
                alt="Wi-Fi pour les hôtels"
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white space-y-1.5">
                <h3 className="text-base font-normal">Wi-Fi pour les hôtels</h3>
                {expandedRightCards.hotels && (
                  <p className="text-[11px] text-gray-200 leading-snug">
                    Portail d'accueil aux couleurs de l'hôtel, codes d'accès VIP pour les clients et accès permanent pour les Smart TV.
                  </p>
                )}
                <button
                  type="button"
                  onClick={() =>
                    setExpandedRightCards((prev) => ({ ...prev, hotels: !prev.hotels }))
                  }
                  className="inline-flex items-center gap-1 text-xs text-[#34D399] hover:underline font-medium cursor-pointer"
                >
                  <span>{expandedRightCards.hotels ? 'Masquer les détails' : 'En savoir plus'}</span>
                  <ArrowIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Petite carte droite 2 : Wi-Fi haute densité */}
            <div className="relative rounded overflow-hidden group h-full">
              <img
                src="https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=700&q=80"
                alt="Wi-Fi haute densité"
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white space-y-1.5">
                <h3 className="text-base font-normal">Wi-Fi haute densité</h3>
                {expandedRightCards.highDensity && (
                  <p className="text-[11px] text-gray-200 leading-snug">
                    Architecture optimisée pour marchés, gares et événements : baux DHCP courts 1h et répartition équitable de la bande passante.
                  </p>
                )}
                <button
                  type="button"
                  onClick={() =>
                    setExpandedRightCards((prev) => ({
                      ...prev,
                      highDensity: !prev.highDensity,
                    }))
                  }
                  className="inline-flex items-center gap-1 text-xs text-[#34D399] hover:underline font-medium cursor-pointer"
                >
                  <span>{expandedRightCards.highDensity ? 'Masquer les détails' : 'En savoir plus'}</span>
                  <ArrowIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. GRILLE D'ABONNEMENT (Section 1.4 Audit :
             1. Offre d'Essai 14 jours
             2. Plan à 6 000 FCFA
             3. Plan à 15 000 FCFA
             4. Offre Entreprise -> redirige vers "Nous contacter")
      ========================================================================= */}
      <section className="w-full bg-[#F4F7FA] border-t border-slate-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#008060]">
              TARIFICATION TRANSPARENTE & SANS ENGAGEMENT
            </span>
            <h2 className="text-2xl sm:text-3xl font-light text-slate-800">
              Choisissez l'offre adaptée à la taille de votre réseau WiFi
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Testez gratuitement la plateforme pendant 14 jours, puis évoluez selon le nombre de vos routeurs MikroTik.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Plan 1 : Essai 14 Jours */}
            <div className="bg-white rounded-lg border border-slate-200 p-6 flex flex-col justify-between space-y-6 shadow-2xs">
              <div className="space-y-3">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                  DÉCOUVERTE
                </span>
                <h3 className="text-lg font-bold text-slate-900">Offre d'Essai</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-900 font-mono">Gratuit</span>
                  <span className="text-xs text-slate-500">/ 14 jours</span>
                </div>
                <p className="text-xs text-slate-500">
                  Idéal pour tester la connexion de votre premier routeur MikroTik.
                </p>
                <ul className="space-y-2 pt-3 border-t border-slate-100 text-xs text-slate-600">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#008060] shrink-0" />
                    <span>1 routeur MikroTik connecté</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#008060] shrink-0" />
                    <span>Jusqu'à 2 comptes vendeurs POS</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#008060] shrink-0" />
                    <span>Génération de tickets & QR Codes</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#008060] shrink-0" />
                    <span>Portail captif standard inclus</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={() => openAuthModal('register')}
                className="w-full py-2.5 rounded bg-[#F4F7FA] hover:bg-[#008060] text-slate-800 hover:text-white border border-slate-300 hover:border-[#008060] font-semibold text-xs transition cursor-pointer"
              >
                Démarrer l'essai 14 jours
              </button>
            </div>

            {/* Plan 2 : 6 000 FCFA */}
            <div className="bg-white rounded-lg border-2 border-[#008060] p-6 flex flex-col justify-between space-y-6 shadow-md relative">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-[#E6F4F3] text-[#008060]">
                    LE PLUS POPULAIRE
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900">Plan Pro</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-[#008060] font-mono">6 000 FCFA</span>
                  <span className="text-xs text-slate-500">/ mois</span>
                </div>
                <p className="text-xs text-slate-500">
                  Pour les opérateurs WiFi actifs gérant plusieurs points de vente.
                </p>
                <ul className="space-y-2 pt-3 border-t border-slate-100 text-xs text-slate-600">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#008060] shrink-0" />
                    <span>Jusqu'à 5 routeurs MikroTik</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#008060] shrink-0" />
                    <span>10 comptes vendeurs Caisse POS</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#008060] shrink-0" />
                    <span>Portail captif personnalisé & Mobile Money</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#008060] shrink-0" />
                    <span>Verrouillage MAC & Support prioritaire</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={() => openAuthModal('register')}
                className="w-full py-2.5 rounded bg-[#008060] hover:bg-[#006B50] text-white font-semibold text-xs transition cursor-pointer"
              >
                Choisir le plan à 6 000 FCFA
              </button>
            </div>

            {/* Plan 3 : 15 000 FCFA */}
            <div className="bg-white rounded-lg border border-slate-200 p-6 flex flex-col justify-between space-y-6 shadow-2xs">
              <div className="space-y-3">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-[#EFF6FF] text-[#0066CC]">
                  MULTI-SITES
                </span>
                <h3 className="text-lg font-bold text-slate-900">Plan Business</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-900 font-mono">15 000 FCFA</span>
                  <span className="text-xs text-slate-500">/ mois</span>
                </div>
                <p className="text-xs text-slate-500">
                  Pour les réseaux étendus (cités, hôtels, galeries et marchés).
                </p>
                <ul className="space-y-2 pt-3 border-t border-slate-100 text-xs text-slate-600">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#008060] shrink-0" />
                    <span>Jusqu'à 25 routeurs MikroTik</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#008060] shrink-0" />
                    <span>50 comptes vendeurs Caisse POS</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#008060] shrink-0" />
                    <span>Comptabilité & Bilan d'exploitation</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#008060] shrink-0" />
                    <span>Alertes Telegram & Support WhatsApp 7j/7</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={() => openAuthModal('register')}
                className="w-full py-2.5 rounded bg-[#F4F7FA] hover:bg-[#008060] text-slate-800 hover:text-white border border-slate-300 hover:border-[#008060] font-semibold text-xs transition cursor-pointer"
              >
                Choisir le plan à 15 000 FCFA
              </button>
            </div>

            {/* Plan 4 : Offre Entreprise (Redirige vers "Nous contacter") */}
            <div className="bg-white rounded-lg border border-slate-200 p-6 flex flex-col justify-between space-y-6 shadow-2xs">
              <div className="space-y-3">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-white">
                  SUR MESURE
                </span>
                <h3 className="text-lg font-bold text-slate-900">Offre Entreprise</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-[#005A5B]">Sur Devis</span>
                </div>
                <p className="text-xs text-slate-500">
                  Pour les grands comptes, campus, opérateurs télécoms et FAI.
                </p>
                <ul className="space-y-2 pt-3 border-t border-slate-100 text-xs text-slate-600">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#008060] shrink-0" />
                    <span>Routeurs MikroTik & Sites illimités</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#008060] shrink-0" />
                    <span>Vendeurs Caisse POS illimités</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#008060] shrink-0" />
                    <span>Infrastructure Cloud dédiée & SLA 99.9%</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#008060] shrink-0" />
                    <span>Ingénieur réseau dédié & intégration sur site</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={() => setPublicTab('contact')}
                className="w-full py-2.5 rounded bg-[#005A5B] hover:bg-[#004445] text-white font-semibold text-xs transition cursor-pointer"
              >
                Nous contacter (Demander un devis)
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          6. ÉTUDES DE CAS
      ========================================================================= */}
      <section className="w-full bg-white border-t border-slate-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 relative">
          <div className="border-b border-slate-200 pb-3">
            <h2 className="text-2xl sm:text-3xl font-light text-slate-800">
              Études de cas
            </h2>
          </div>

          <div className="relative flex items-center">
            <button
              type="button"
              onClick={() =>
                setCaseIndex((prev) => (prev === 0 ? caseStudies.length - 1 : prev - 1))
              }
              className="hidden lg:flex w-10 h-10 bg-slate-200/80 hover:bg-slate-300 text-slate-600 items-center justify-center rounded-xs mr-4 shrink-0 cursor-pointer transition"
              title="Étude précédente"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-6 rounded overflow-hidden shadow-md border border-slate-200 h-72 sm:h-80">
                <img
                  src={currentCase.image}
                  alt={currentCase.brand}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="lg:col-span-6 space-y-4">
                <div className="inline-block text-xs font-bold uppercase tracking-widest text-[#007A78]">
                  {currentCase.badge} • {currentCase.brand}
                </div>

                <h3 className="text-2xl sm:text-3xl font-light text-slate-800 leading-snug">
                  {currentCase.titleBefore}
                  <span className="text-[#2B7DE9] font-normal">{currentCase.highlightBlue}</span>
                  {currentCase.titleAfter}
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed italic">
                  {currentCase.quote}
                </p>

                <p className="text-xs font-semibold text-slate-800">
                  {currentCase.author}
                </p>

                <button
                  onClick={() => openAuthModal('register')}
                  className="text-xs font-medium text-[#008060] hover:underline flex items-center gap-0.5 pt-1 cursor-pointer"
                >
                  <span>Déployer une architecture similaire</span>
                  <ArrowIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                setCaseIndex((prev) => (prev === caseStudies.length - 1 ? 0 : prev + 1))
              }
              className="hidden lg:flex w-10 h-10 bg-slate-200/80 hover:bg-slate-300 text-slate-600 items-center justify-center rounded-xs ml-4 shrink-0 cursor-pointer transition"
              title="Étude suivante"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center justify-center gap-2.5 pt-2">
            {caseStudies.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCaseIndex(idx)}
                className={`w-2.5 h-2.5 rounded-full transition cursor-pointer ${
                  caseIndex === idx
                    ? 'border-2 border-[#008060] bg-white scale-110'
                    : 'bg-slate-300 hover:bg-slate-400'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          7. SIMULATEUR DE RENTABILITÉ B2B + BANDEAU PARTENAIRES
      ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-lg border border-slate-200 p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center shadow-xs">
          <div className="lg:col-span-7 space-y-5">
            <span className="text-xs font-bold uppercase tracking-wider text-[#008060]">
              CALCULATEUR DE RENTABILITÉ OPÉRATEUR
            </span>
            <h2 className="text-2xl sm:text-3xl font-light text-slate-800">
              Simulez les revenus nets de votre Hotspot MikroTik
            </h2>

            <div className="space-y-4 text-xs">
              <div>
                <div className="flex justify-between font-semibold text-slate-700 mb-1.5">
                  <span>Tickets vendus par jour :</span>
                  <span className="text-[#008060] font-mono font-bold">{dailyVouchers} tickets / jour</span>
                </div>
                <input
                  type="range"
                  min={15}
                  max={300}
                  step={5}
                  value={dailyVouchers}
                  onChange={(e) => setDailyVouchers(Number(e.target.value))}
                  className="w-full accent-[#008060] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between font-semibold text-slate-700 mb-1.5">
                  <span>Prix moyen du ticket :</span>
                  <span className="text-[#008060] font-mono font-bold">{voucherPrice.toLocaleString('fr-FR')} FCFA</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[200, 500, 1000, 2500].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setVoucherPrice(p)}
                      className={`px-4 py-1.5 rounded text-xs font-semibold transition cursor-pointer ${
                        voucherPrice === p
                          ? 'bg-[#008060] text-white'
                          : 'bg-[#F4F7FA] text-slate-700 border border-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      {p} FCFA
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold text-slate-700 mb-1.5">
                  <span>Coût mensuel liaison Internet FAI :</span>
                  <span className="text-slate-700 font-mono font-bold">{ispCost.toLocaleString('fr-FR')} FCFA / mois</span>
                </div>
                <input
                  type="range"
                  min={15000}
                  max={100000}
                  step={5000}
                  value={ispCost}
                  onChange={(e) => setIspCost(Number(e.target.value))}
                  className="w-full accent-[#008060] cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 p-6 rounded-lg bg-[#F8FAFC] border border-slate-200 space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Bénéfice Net Mensuel Estimé (30 Jours)
            </div>
            <div>
              <div className="text-3xl font-bold text-[#005A5B] font-mono tabular-nums">
                {netMonthly.toLocaleString('fr-FR')} FCFA
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Après déduction de l'abonnement FAI et des commissions vendeurs (10%)
              </div>
            </div>

            <div className="space-y-2 pt-3 border-t border-slate-200 text-xs">
              <div className="flex items-center gap-2 text-slate-700">
                <Check className="w-4 h-4 text-[#008060]" />
                <span>Chiffre d'affaires brut : <strong>{grossMonthly.toLocaleString('fr-FR')} FCFA</strong></span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <Check className="w-4 h-4 text-[#008060]" />
                <span>Synchronisation Cloud en temps réel incluse</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => openAuthModal('register')}
              className="w-full py-2.5 rounded bg-[#008060] hover:bg-[#00664D] text-white font-semibold text-xs transition cursor-pointer"
            >
              Créer mon compte opérateur maintenant &rarr;
            </button>
          </div>
        </div>
      </section>

      {/* Trust Teal Banner (Marque Blanche) */}
      <section className="w-full bg-gradient-to-r from-[#004D4E] via-[#006663] to-[#004D4E] text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <h2 className="text-xl sm:text-2xl font-light text-white">
            Approuvé par les opérateurs WiFi et intégrateurs réseau
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 items-center text-center text-sm font-bold tracking-wider text-teal-100/85">
            <div className="p-3 rounded border border-white/15 bg-white/5">MIKROTIK OS v7</div>
            <div className="p-3 rounded border border-white/15 bg-white/5">STARLINK PRO</div>
            <div className="p-3 rounded border border-white/15 bg-white/5">WAVE MOBILE</div>
            <div className="p-3 rounded border border-white/15 bg-white/5">ORANGE MONEY</div>
            <div className="p-3 rounded border border-white/15 bg-white/5">MTN MOMO</div>
            <div className="p-3 rounded border border-white/15 bg-white/5">JOOWIFI CLOUD</div>
          </div>
        </div>
      </section>

      {/* Clean Contact Strip */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="border-b border-slate-200 pb-3 mb-10">
          <h2 className="text-2xl font-light text-slate-800">Contactez-nous</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-center">
          <div
            onClick={() => setPublicTab('contact')}
            className="p-6 rounded hover:bg-[#F8FAFC] transition cursor-pointer space-y-2"
          >
            <PhoneCall className="w-7 h-7 text-[#008060] mx-auto stroke-[1.75]" />
            <div className="text-xs font-medium text-slate-700">
              Contacter l'équipe commerciale (+225 01 00 44 38 39)
            </div>
          </div>
          <div
            onClick={() => setPublicTab('contact')}
            className="p-6 rounded hover:bg-[#F8FAFC] transition cursor-pointer space-y-2"
          >
            <Headphones className="w-7 h-7 text-[#008060] mx-auto stroke-[1.75]" />
            <div className="text-xs font-medium text-slate-700">
              Contacter le support technique MikroTik & Cloud
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
