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
  Terminal,
  ShieldCheck,
  Radio,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { setCurrentSpace, setAdminTab, setPublicTab } = useApp();

  // Case Studies Carousel State (Matches Capture 160502.jpg, 160531.jpg, 160554.jpg)
  const [caseIndex, setCaseIndex] = useState<number>(0);

  const caseStudies = [
    {
      brand: 'Cité Universitaire Mermoz — Cocody',
      badge: 'CAMPUS & RÉSIDENCES',
      image:
        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1000&q=80',
      titleBefore: 'La solution Cloud Pull de Joowifi offre une stabilité remarquable et une gestion fluide pour ',
      highlightBlue: 'plus de 450 studios étudiants',
      titleAfter: '',
      quote:
        '« Les fonctionnalités sont excellentes et nous n’avons rencontré aucune saturation d’adresses IP grâce au bail DHCP court d’une heure et au Cookie MAC 30 jours. Tout est piloté dans le Cloud sans ouvrir de port. »',
      author: 'Kouamé Konan, Directeur Technique — Ivoire Hotspot Réseaux',
    },
    {
      brand: 'Galerie Marchande Grand Adjamé',
      badge: 'COMMERCE & KIOSQUES POS',
      image:
        'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1000&q=80',
      titleBefore: 'Joowifi optimise l’encaissement terrain et la vente de tickets WiFi sur ',
      highlightBlue: '12 kiosques et vendeurs POS',
      titleAfter: ' en temps réel',
      quote:
        '« Dès qu’un vendeur encaisse un client sur son smartphone via la Caisse POS Joowifi, le code ticket est créé sur notre routeur MikroTik RB5009 en moins de 10 secondes. Le suivi des commissions est automatique. »',
      author: 'Mamadou Fonate, Superviseur Réseau de Vente — Adjamé',
    },
    {
      brand: 'Complexe Hôtelier & Résidences Assinie',
      badge: 'HÔTELLERIE & LOISIRS',
      image:
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80',
      titleBefore: 'Joowifi rationalise l’accès WiFi haut débit sous Starlink ',
      highlightBlue: 'sur plus de 120 chambres',
      titleAfter: ' et espaces piscines intérieurs/extérieurs',
      quote:
        '« Une fois le script RouterOS v5.1 importé dans WinBox, le routeur remonte instantanément dans la console. Cela a réduit notre temps de déploiement et de maintenance de 80 %. »',
      author: 'Jean-Marc Koffi, Ingénieur Télécom & Intégrateur MikroTik',
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
          1. HERO BANNER : "Joowifi Cloud 6.3" SUR FOND BLEU-GLACIER LUMINEUX (#EAF2F8)
             (Inspiré de Capture 160906.jpg : "Introducing Omada Network 6.3")
      ========================================================================= */}
      <section className="w-full bg-gradient-to-b from-[#EAF2F8] via-[#F2F7FB] to-[#FFFFFF] border-b border-slate-200 py-14 sm:py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left 5 Columns: Crisp Corporate Copy & Green Flat CTA */}
          <div className="lg:col-span-5 space-y-5">
            <div className="text-lg sm:text-xl font-normal text-slate-700">
              Nouvelle Architecture SDN
            </div>

            <h1 className="text-4xl sm:text-5xl font-normal tracking-tight text-[#0066CC] leading-[1.12]">
              Joowifi Cloud 6.3
            </h1>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Supervisez plus de sites, encaissez plus vite en Caisse POS, synchronisez vos routeurs MikroTik en 10s — Tout sur une seule plateforme.
            </p>

            <div className="pt-3 flex flex-wrap items-center gap-3.5">
              <button
                onClick={() => setCurrentSpace('admin')}
                className="px-7 py-3 rounded bg-[#008060] hover:bg-[#00664D] text-white font-medium text-sm transition cursor-pointer shadow-xs"
              >
                Ouvrir la Console 6.3
              </button>

              <button
                onClick={() => setCurrentSpace('pos')}
                className="px-6 py-3 rounded bg-white hover:bg-slate-50 text-[#005A5B] border border-slate-300 font-medium text-sm transition cursor-pointer"
              >
                Ouvrir la Caisse POS
              </button>
            </div>

            <div className="pt-4 grid grid-cols-3 gap-4 border-t border-slate-200/80 text-xs">
              <div>
                <div className="font-bold text-slate-800 text-base">Fast-Poll 10s</div>
                <div className="text-slate-500">Livraison Vouchers</div>
              </div>
              <div>
                <div className="font-bold text-slate-800 text-base">Zero-Port WAN</div>
                <div className="text-slate-500">100% Starlink & 4G</div>
              </div>
              <div>
                <div className="font-bold text-slate-800 text-base">Supabase 12/12</div>
                <div className="text-slate-500">Temps Réel</div>
              </div>
            </div>
          </div>

          {/* Right 7 Columns: Hardware + Live Controller 6.3 Monitor Mockup + POS Smartphone (Exact match to Capture 160906.jpg) */}
          <div className="lg:col-span-7 relative flex items-center justify-center pt-4 lg:pt-0">
            <div className="relative w-full max-w-2xl">
              {/* Desktop Monitor Frame displaying the new White & Green Joowifi 6.3 Console */}
              <div
                onClick={() => setCurrentSpace('admin')}
                className="w-full rounded-xl bg-[#111827] p-2.5 shadow-2xl border border-slate-700 cursor-pointer group"
              >
                <div className="bg-[#F4F7FA] rounded-lg overflow-hidden border border-slate-200">
                  {/* Monitor Top Teal Bar */}
                  <div className="h-7 bg-[#005A5B] px-3 flex items-center justify-between text-[10px] text-white">
                    <span className="font-bold">Joowifi SDN Controller 6.3</span>
                    <div className="flex items-center gap-3 text-teal-100">
                      <span>Tableau de bord</span>
                      <span>Topologie</span>
                      <span>Vouchers (24)</span>
                      <span>Passerelles MikroTik</span>
                    </div>
                    <span className="px-1.5 py-0.5 rounded bg-[#008060] text-[9px]">En ligne</span>
                  </div>

                  {/* Monitor Body: Circular Health Score 98 + Horizontal 24h Bars + Traffic Chart */}
                  <div className="p-4 grid grid-cols-12 gap-3 bg-white">
                    {/* Left Health Gauge */}
                    <div className="col-span-4 p-3 rounded border border-slate-200 flex flex-col items-center justify-center text-center bg-[#F8FAFC]">
                      <div className="text-[9px] font-bold text-slate-500 uppercase mb-1">
                        Santé Réseau
                      </div>
                      <div className="w-16 h-16 rounded-full border-[5px] border-[#008060] flex flex-col items-center justify-center">
                        <span className="text-lg font-black text-slate-800 leading-none">98</span>
                        <span className="text-[8px] text-[#008060] font-bold">Excellent</span>
                      </div>
                      <div className="mt-2 text-[9px] text-slate-500">
                        SLA 99.9% • Latence 18ms
                      </div>
                    </div>

                    {/* Right 24h Equipment & Voucher Status Bars */}
                    <div className="col-span-8 p-3 rounded border border-slate-200 space-y-2 bg-white">
                      <div className="flex items-center justify-between text-[9px] font-bold text-slate-600">
                        <span>Disponibilité Passerelles MikroTik & Sync 24h</span>
                        <span className="text-[#008060]">100% Synchronisé</span>
                      </div>
                      <div className="space-y-1.5">
                        <div>
                          <div className="flex justify-between text-[8px] text-slate-500 mb-0.5">
                            <span>MK-ADJAME-CORE-01 (RouterOS v7.23.8)</span>
                            <span>24/24 Vouchers OK</span>
                          </div>
                          <div className="h-2 rounded-full bg-emerald-500 w-full" />
                        </div>
                        <div>
                          <div className="flex justify-between text-[8px] text-slate-500 mb-0.5">
                            <span>Kiosques Caisse POS (Mamadou F. & Célestine Y.)</span>
                            <span>79 200 FCFA</span>
                          </div>
                          <div className="h-2 rounded-full bg-[#007A78] w-11/12" />
                        </div>
                      </div>

                      {/* Mini KPI Icons Row */}
                      <div className="grid grid-cols-4 gap-1.5 pt-1 text-center">
                        <div className="p-1.5 rounded bg-[#F4F7FA] border border-slate-200">
                          <div className="text-[10px] font-bold text-slate-800">1</div>
                          <div className="text-[8px] text-slate-500">Passerelle</div>
                        </div>
                        <div className="p-1.5 rounded bg-[#F4F7FA] border border-slate-200">
                          <div className="text-[10px] font-bold text-[#007A78]">24</div>
                          <div className="text-[8px] text-slate-500">Vouchers</div>
                        </div>
                        <div className="p-1.5 rounded bg-[#F4F7FA] border border-slate-200">
                          <div className="text-[10px] font-bold text-slate-800">4</div>
                          <div className="text-[8px] text-slate-500">Agents POS</div>
                        </div>
                        <div className="p-1.5 rounded bg-[#F4F7FA] border border-slate-200">
                          <div className="text-[10px] font-bold text-[#008060]">10s</div>
                          <div className="text-[8px] text-slate-500">Fast-Poll</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Foreground Left: POS Smartphone Mockup + Foreground Center: MikroTik Rack Switch + Right: Cloud Badge */}
              <div className="mt-4 sm:-mt-10 relative z-10 flex flex-wrap sm:flex-nowrap items-end justify-between gap-3 px-2">
                {/* Smartphone POS App */}
                <div
                  onClick={() => setCurrentSpace('pos')}
                  className="w-28 bg-white rounded-2xl border-2 border-slate-700 shadow-xl p-2 cursor-pointer hover:-translate-y-1 transition shrink-0"
                >
                  <div className="text-[8px] font-bold text-[#005A5B] border-b border-slate-100 pb-1 flex justify-between">
                    <span>Joowifi POS</span>
                    <span className="text-emerald-600">●</span>
                  </div>
                  <div className="py-2 text-center">
                    <div className="text-[8px] text-slate-400">Code vendu</div>
                    <div className="font-mono font-black text-xs text-slate-800">efdj</div>
                    <div className="text-[8px] text-[#008060] font-bold">2 500 FCFA</div>
                  </div>
                  <div className="w-full py-1 rounded bg-[#008060] text-white text-[8px] font-bold text-center">
                    Vente 1-Clic
                  </div>
                </div>

                {/* Hardware Rack Gateways Stack */}
                <div className="flex-1 space-y-1.5 max-w-xs">
                  <div className="h-7 rounded bg-[#1E293B] border border-slate-600 px-3 flex items-center justify-between text-[9px] text-slate-200 font-mono shadow-md">
                    <span>MIKROTIK RB5009 / CHR</span>
                    <span className="text-emerald-400">●●●●●●●●</span>
                  </div>
                  <div className="h-8 rounded bg-gradient-to-b from-slate-200 to-slate-300 border border-slate-400 px-3 flex items-center justify-between text-[9px] text-slate-800 font-mono font-bold shadow-md">
                    <span>JOOWIFI SDN GATEWAY</span>
                    <div className="flex gap-1">
                      <span className="w-2.5 h-2 bg-slate-700 rounded-xs" />
                      <span className="w-2.5 h-2 bg-slate-700 rounded-xs" />
                      <span className="w-2.5 h-2 bg-emerald-600 rounded-xs" />
                    </div>
                  </div>
                </div>

                {/* Green Cloud Badge */}
                <div className="px-4 py-2 rounded-2xl bg-gradient-to-r from-[#00A870] to-[#10B981] text-white font-bold text-sm shadow-lg shrink-0">
                  Cloud 6.3
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. BANNIÈRE CONTRASTÉE : "Une gestion de réseau et billetterie basée sur le Cloud"
             (Inspirée du 2e bandeau de screencapture-omadanetworks-fr)
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
              <span className="text-[#34D399] font-semibold">Joowifi Cloud SDN</span> vous permet de déployer vos routeurs MikroTik en 1 ligne de commande, de générer vos lots de tickets et de suivre les encaissements de vos vendeurs POS en temps réel, sans serveur local ni ouverture de port.
            </p>
            <div className="pt-2">
              <button
                onClick={() => {
                  setCurrentSpace('admin');
                  setAdminTab('installation');
                }}
                className="px-6 py-2.5 rounded bg-[#00A870] hover:bg-[#008F5D] text-white text-xs font-semibold transition cursor-pointer"
              >
                Découvrir le Script Auto-Install v5.1
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. LES 3 PILIERS PRODUITS (Cartes Studio Grises #DDE3EA + Texte sur fond blanc,
             exactement comme screencapture-omadanetworks-fr)
      ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
        {/* Top Wide Banner Card : Architecture Cloud Pull */}
        <div className="w-full rounded-lg bg-[#EEF2F6] border border-slate-200 p-8 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 space-y-3">
            <h3 className="text-2xl sm:text-3xl font-normal text-[#0066CC] leading-tight">
              Architecture Cloud Pull HTTPS 10s,
              <br />
              <span className="text-slate-800">parfaite pour Starlink, 4G et Fibre</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-600">
              Synchronisation automatique entre votre base Supabase (12 tables) et vos routeurs MikroTik RouterOS v6 & v7 sans adresse IP publique fixe.
            </p>
            <button
              onClick={() => {
                setCurrentSpace('admin');
                setAdminTab('installation');
              }}
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
              <div className="text-xs font-bold text-[#005A5B]">Cloud Supabase</div>
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

        {/* 3 Studio Grey Product Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="space-y-4">
            <div className="h-52 rounded bg-gradient-to-b from-[#CBD5E1] to-[#E2E8F0] p-6 flex flex-col items-center justify-end border border-slate-300/80">
              <div className="w-full max-w-[220px] space-y-2">
                <div className="h-8 rounded bg-[#1E293B] text-white text-[10px] font-mono px-3 flex items-center justify-between shadow">
                  <span>MK-CORE-RB5009</span>
                  <span className="text-emerald-400">v7.24</span>
                </div>
                <div className="h-10 rounded bg-white border border-slate-300 px-3 flex items-center justify-between text-[10px] font-bold text-slate-700 shadow">
                  <span>Fast-Poll 10s</span>
                  <span className="text-[#008060]">24 Vouchers</span>
                </div>
              </div>
            </div>
            <h3 className="text-base font-bold text-slate-800">Passerelles & Script MikroTik</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Compatible avec tous les routeurs MikroTik (hEX, RB5009, CCR, hAP et CHR VirtualBox). Exclusion FastTrack automatique, bail DHCP 1h et Cookie MAC 30 jours.
            </p>
            <button
              onClick={() => {
                setCurrentSpace('admin');
                setAdminTab('mikrotik');
              }}
              className="text-xs font-semibold text-[#008060] hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              <span>En savoir plus</span>
              <ArrowIcon className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 2 */}
          <div className="space-y-4">
            <div className="h-52 rounded bg-gradient-to-b from-[#CBD5E1] to-[#E2E8F0] p-6 flex flex-col items-center justify-end border border-slate-300/80">
              <div className="w-40 bg-white rounded-t-xl border border-slate-300 p-3 shadow-md text-center space-y-1.5">
                <div className="text-[10px] font-bold text-[#005A5B]">Terminal Caisse POS</div>
                <div className="font-mono font-black text-sm text-slate-900 bg-slate-100 py-1 rounded">
                  CODE : 3yn5
                </div>
                <div className="text-[10px] text-[#008060] font-bold">Pass 3 Jours • 1 200 F</div>
              </div>
            </div>
            <h3 className="text-base font-bold text-slate-800">Caisse POS Vendeurs (PWA)</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Équipez vos revendeurs d'une caisse mobile sur smartphone : encaissement en 1 clic, génération de QR Code WiFi, impression thermique Bluetooth et suivi des commissions.
            </p>
            <button
              onClick={() => setCurrentSpace('pos')}
              className="text-xs font-semibold text-[#008060] hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              <span>Ouvrir la Caisse POS</span>
              <ArrowIcon className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 3 */}
          <div className="space-y-4">
            <div className="h-52 rounded bg-gradient-to-b from-[#CBD5E1] to-[#E2E8F0] p-6 flex flex-col items-center justify-end border border-slate-300/80">
              <div className="w-full max-w-[220px] bg-white rounded-t-xl border border-slate-300 p-3 shadow-md space-y-2">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-700">
                  <span>Portail Captif</span>
                  <span className="text-[#008060]">Wave • Orange • MTN</span>
                </div>
                <div className="h-6 rounded bg-slate-100 border border-slate-200 flex items-center justify-center font-mono text-[10px] text-slate-600">
                  Voucher : CQZSR3XR85
                </div>
                <div className="h-6 rounded bg-[#007A78] text-white text-[10px] font-bold flex items-center justify-center">
                  Connexion Instantanée
                </div>
              </div>
            </div>
            <h3 className="text-base font-bold text-slate-800">Portail Captif & Mobile Money</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Personnalisez votre page login.html avec Walled Garden préconfiguré pour Wave, Orange Money, MTN MoMo et Moov afin d'automatiser vos ventes 24h/24.
            </p>
            <button
              onClick={() => {
                setCurrentSpace('admin');
                setAdminTab('personnalisation');
              }}
              className="text-xs font-semibold text-[#008060] hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              <span>Personnaliser le portail</span>
              <ArrowIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. SOLUTIONS DE SCÉNARIO (Grille Photographique Asymétrique à 5 Cartes,
             exactement comme Capture 160628.jpg adaptée à Joowifi)
      ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div className="border-b border-slate-200 pb-3">
          <h2 className="text-2xl sm:text-3xl font-light text-slate-800">
            Solutions de scénario
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 lg:h-[440px]">
          {/* Col 1 : Tall Card — Cités & Résidences */}
          <div
            onClick={() => setCurrentSpace('admin')}
            className="relative rounded overflow-hidden group cursor-pointer h-80 lg:h-full"
          >
            <img
              src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=700&q=80"
              alt="Multi-résidentielles & Cités"
              className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
            <div className="absolute bottom-5 left-5 right-5 text-white">
              <h3 className="text-lg font-normal">Cités & Multi-résidentielles</h3>
            </div>
          </div>

          {/* Col 2 : Tall Card — Kiosques POS & Restaurants */}
          <div
            onClick={() => setCurrentSpace('pos')}
            className="relative rounded overflow-hidden group cursor-pointer h-80 lg:h-full"
          >
            <img
              src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=700&q=80"
              alt="Kiosques POS & Commerces"
              className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
            <div className="absolute bottom-5 left-5 right-5 text-white">
              <h3 className="text-lg font-normal leading-snug">
                Kiosques POS, maquis et commerces de proximité
              </h3>
            </div>
          </div>

          {/* Col 3 : Tall Card with Expanded Text — Bureaux PME & Coworking */}
          <div
            onClick={() => setCurrentSpace('admin')}
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

          {/* Col 4 : 2 Stacked Horizontal Cards — Hôtels + Haute Densité */}
          <div className="grid grid-rows-2 gap-5 h-96 lg:h-full">
            <div
              onClick={() => setCurrentSpace('admin')}
              className="relative rounded overflow-hidden group cursor-pointer"
            >
              <img
                src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=700&q=80"
                alt="Wi-Fi pour les hôtels"
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <h3 className="text-base font-normal">Wi-Fi pour les hôtels</h3>
              </div>
            </div>

            <div
              onClick={() => setCurrentSpace('admin')}
              className="relative rounded overflow-hidden group cursor-pointer"
            >
              <img
                src="https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=700&q=80"
                alt="Wi-Fi haute densité"
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <h3 className="text-base font-normal">Wi-Fi haute densité</h3>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. ÉTUDES DE CAS (Carrousel Interactif Photo Gauche + Chiffre Bleu à Droite,
             exactement comme Capture 160502.jpg, 160531.jpg, 160554.jpg)
      ========================================================================= */}
      <section className="w-full bg-[#F8FAFC] border-t border-slate-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 relative">
          <div className="border-b border-slate-200 pb-3">
            <h2 className="text-2xl sm:text-3xl font-light text-slate-800">
              Études de cas
            </h2>
          </div>

          <div className="relative flex items-center">
            {/* Left Square Arrow */}
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

            {/* Main Split Case Study Content */}
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
                  onClick={() => setCurrentSpace('admin')}
                  className="text-xs font-medium text-[#008060] hover:underline flex items-center gap-0.5 pt-1 cursor-pointer"
                >
                  <span>Explorer la configuration dans la console</span>
                  <ArrowIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Right Square Arrow */}
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

          {/* Carousel Dots */}
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

          {/* 3 Bottom Summary Case Cards (Like bottom of screencapture-omadanetworks-fr) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            {caseStudies.map((cs, i) => (
              <div
                key={i}
                onClick={() => setCaseIndex(i)}
                className={`p-6 bg-white rounded border transition cursor-pointer space-y-3 ${
                  caseIndex === i ? 'border-[#008060] shadow-md' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="text-xs font-bold text-[#005A5B]">{cs.brand}</div>
                <p className="text-xs font-medium text-slate-800 leading-snug">
                  {cs.titleBefore}
                  <span className="text-[#2B7DE9] font-semibold">{cs.highlightBlue}</span>
                  {cs.titleAfter}
                </p>
                <span className="text-[11px] text-[#008060] flex items-center gap-0.5 font-medium">
                  <span>Lire l'étude</span>
                  <ArrowIcon className="w-3 h-3" />
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          6. SIMULATEUR DE RENTABILITÉ B2B + BANDEAU "APPROUVÉ PAR LES OPÉRATEURS"
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
                  <span>Coût mensuel liaison FAI / Starlink :</span>
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
                <span>Synchronisation Supabase (12 tables) incluse</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setCurrentSpace('admin');
                setAdminTab('installation');
              }}
              className="w-full py-2.5 rounded bg-[#008060] hover:bg-[#00664D] text-white font-semibold text-xs transition cursor-pointer"
            >
              Déployer mon routeur MikroTik maintenant &rarr;
            </button>
          </div>
        </div>
      </section>

      {/* Trust Teal Banner (Exact match to bottom of screencapture-omadanetworks-fr) */}
      <section className="w-full bg-gradient-to-r from-[#004D4E] via-[#006663] to-[#004D4E] text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <h2 className="text-xl sm:text-2xl font-light text-white">
            Approuvé par les opérateurs WiFi et intégrateurs réseau
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 items-center text-center text-sm font-bold tracking-wider text-teal-100/85">
            <div className="p-3 rounded border border-white/15 bg-white/5">MIKROTIK OS v7</div>
            <div className="p-3 rounded border border-white/15 bg-white/5">STARLINK BUSINESS</div>
            <div className="p-3 rounded border border-white/15 bg-white/5">WAVE MOBILE</div>
            <div className="p-3 rounded border border-white/15 bg-white/5">ORANGE MONEY</div>
            <div className="p-3 rounded border border-white/15 bg-white/5">MTN MOMO</div>
            <div className="p-3 rounded border border-white/15 bg-white/5">SUPABASE CLOUD</div>
          </div>
        </div>
      </section>

      {/* Clean Contact Strip (Exact match to bottom of screencapture-omadanetworks-fr) */}
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
            onClick={() => {
              setCurrentSpace('admin');
              setAdminTab('assistant');
            }}
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
