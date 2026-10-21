import React, { useState } from 'react';
import { useApp, PublicTab } from '../../context/AppContext';
import {
  Globe,
  User,
  Mail,
  Search,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    currentSpace,
    setCurrentSpace,
    publicTab,
    setPublicTab,
    setAdminTab,
    currency,
    setCurrency,
    openAuthModal,
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeMegaMenu, setActiveMegaMenu] = useState<'products' | 'solutions' | null>(null);

  const handleNavClick = (tab: PublicTab) => {
    setActiveMegaMenu(null);
    setCurrentSpace('public');
    setPublicTab(tab);
    setMobileMenuOpen(false);
  };

  const handleGoAdminTab = (tab: any) => {
    setActiveMegaMenu(null);
    setCurrentSpace('admin');
    setAdminTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header
      className="sticky top-0 z-50 w-full select-none shadow-xs"
      onMouseLeave={() => setActiveMegaMenu(null)}
    >
      {/* 1. TOP CORPORATE UTILITY BAR (#26292E Charcoal, exact match to Capture 160756.png) */}
      <div className="w-full bg-[#26292E] text-white text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-8 flex items-center justify-between">
          <div className="flex items-center gap-6 h-full">
            <button
              onClick={() => handleNavClick('home')}
              className="h-full flex items-center font-bold tracking-tight text-white cursor-pointer"
            >
              Joowifi <span className="text-[10px] font-normal text-gray-400 ml-1">SDN</span>
            </button>
            <button
              onClick={() => setCurrentSpace('pos')}
              className="h-full flex items-center font-semibold text-gray-400 hover:text-white transition cursor-pointer"
            >
              Joowifi POS
            </button>
          </div>

          <div className="flex items-center gap-5 text-[11px] text-gray-300">
            <button
              onClick={() => handleNavClick('contact')}
              className="hidden sm:flex items-center gap-1.5 hover:text-white transition cursor-pointer"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Contactez-nous</span>
            </button>

            <button
              onClick={() => openAuthModal('login')}
              className="flex items-center gap-1.5 hover:text-white transition cursor-pointer"
            >
              <User className="w-3.5 h-3.5" />
              <span>Se connecter</span>
            </button>

            <div className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-gray-300" />
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as any)}
                className="bg-transparent text-gray-200 hover:text-white focus:outline-none cursor-pointer text-[11px]"
              >
                <option value="XOF" className="bg-[#26292E] text-white">
                  Côte d'Ivoire / Français (FCFA)
                </option>
                <option value="GNF" className="bg-[#26292E] text-white">
                  Guinée / Français (GNF)
                </option>
                <option value="EUR" className="bg-[#26292E] text-white">
                  France / Français (EUR)
                </option>
                <option value="USD" className="bg-[#26292E] text-white">
                  International / English (USD)
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN CORPORATE TEAL HEADER (#005A5B Solid Flat Teal, exact match to Capture 160756.png) */}
      <div className="w-full bg-[#005A5B] text-white border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-10 h-full">
            <button
              onClick={() => handleNavClick('home')}
              className="text-left cursor-pointer py-1 flex flex-col justify-center"
            >
              <span className="text-[26px] font-bold tracking-tight text-white leading-none">
                Joowifi
              </span>
              <span className="text-[10px] font-medium text-teal-100/90 tracking-wide mt-0.5 text-right">
                by Ivoire Réseaux
              </span>
            </button>

            <nav className="hidden lg:flex items-center gap-8 h-full text-sm font-normal">
              <button
                onMouseEnter={() => setActiveMegaMenu('products')}
                onClick={() =>
                  setActiveMegaMenu(activeMegaMenu === 'products' ? null : 'products')
                }
                className={`h-full flex items-center border-b-[3px] transition cursor-pointer ${
                  activeMegaMenu === 'products'
                    ? 'border-[#34D399] text-[#34D399] font-medium'
                    : 'border-transparent text-white hover:text-[#34D399]'
                }`}
              >
                Produits
              </button>

              <button
                onMouseEnter={() => setActiveMegaMenu('solutions')}
                onClick={() =>
                  setActiveMegaMenu(activeMegaMenu === 'solutions' ? null : 'solutions')
                }
                className={`h-full flex items-center border-b-[3px] transition cursor-pointer ${
                  activeMegaMenu === 'solutions'
                    ? 'border-[#34D399] text-[#34D399] font-medium'
                    : 'border-transparent text-white hover:text-[#34D399]'
                }`}
              >
                Solutions
              </button>

              <button
                onMouseEnter={() => setActiveMegaMenu(null)}
                onClick={() => handleGoAdminTab('installation')}
                className="h-full flex items-center border-b-[3px] border-transparent text-white hover:text-[#34D399] transition cursor-pointer"
              >
                Apprendre et se former
              </button>

              <button
                onMouseEnter={() => setActiveMegaMenu(null)}
                onClick={() => handleNavClick('pricing')}
                className={`h-full flex items-center border-b-[3px] transition cursor-pointer ${
                  currentSpace === 'public' && publicTab === 'pricing'
                    ? 'border-[#34D399] text-[#34D399] font-medium'
                    : 'border-transparent text-white hover:text-[#34D399]'
                }`}
              >
                Tarification
              </button>

              <button
                onMouseEnter={() => setActiveMegaMenu(null)}
                onClick={() => handleNavClick('contact')}
                className={`h-full flex items-center border-b-[3px] transition cursor-pointer ${
                  currentSpace === 'public' && publicTab === 'contact'
                    ? 'border-[#34D399] text-[#34D399] font-medium'
                    : 'border-transparent text-white hover:text-[#34D399]'
                }`}
              >
                Support
              </button>

              <button
                onMouseEnter={() => setActiveMegaMenu(null)}
                onClick={() => setCurrentSpace('pos')}
                className="h-full flex items-center border-b-[3px] border-transparent text-white hover:text-[#34D399] transition cursor-pointer"
              >
                Partenaires POS
              </button>
            </nav>
          </div>

          <div className="hidden sm:flex items-center gap-6 text-sm">
            <button
              onClick={() => setCurrentSpace('admin')}
              className="px-4 py-1.5 rounded bg-[#008060] hover:bg-[#006B50] text-white font-medium text-xs transition cursor-pointer flex items-center gap-1"
            >
              <span>Console Cloud 6.3</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setCurrentSpace('admin')}
              className="flex items-center gap-1.5 text-white hover:text-[#34D399] transition cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>Rechercher</span>
            </button>
          </div>

          <div className="flex lg:hidden items-center gap-3">
            <button
              onClick={() => setCurrentSpace('admin')}
              className="px-3 py-1.5 bg-[#008060] text-white text-xs font-semibold rounded cursor-pointer"
            >
              Console 6.3
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 text-white cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* 3. MEGA-MENU WITH RIGHT TESTIMONIAL CARD (Exact match to Capture 160756.png) */}
      {(activeMegaMenu === 'solutions' || activeMegaMenu === 'products') && (
        <div className="w-full bg-[#005A5B] text-white py-8 shadow-2xl border-t border-white/10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-6">
              <button
                onClick={() => handleNavClick('features')}
                className="text-sm font-medium text-[#34D399] flex items-center gap-1 hover:underline cursor-pointer"
              >
                <span>{activeMegaMenu === 'solutions' ? 'Solutions' : 'Produits & Plateforme'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
              {/* Left Column: par scénarios */}
              <div className="md:col-span-3 space-y-4">
                <h3 className="text-lg font-normal text-white">
                  {activeMegaMenu === 'solutions' ? 'par scénarios' : 'Équipements & Réseau'}
                </h3>
                <ul className="space-y-2.5 text-xs text-teal-100/90">
                  <li>
                    <button onClick={() => handleNavClick('features')} className="hover:text-[#34D399] cursor-pointer">
                      WiFi pour Hôtels & Résidences
                    </button>
                  </li>
                  <li>
                    <button onClick={() => handleNavClick('features')} className="hover:text-[#34D399] cursor-pointer">
                      Cités Universitaires & Campus
                    </button>
                  </li>
                  <li>
                    <button onClick={() => handleNavClick('features')} className="hover:text-[#34D399] cursor-pointer">
                      TPE / PME & Espaces Coworking
                    </button>
                  </li>
                  <li>
                    <button onClick={() => setCurrentSpace('pos')} className="hover:text-[#34D399] cursor-pointer">
                      Restaurants, Maquis & Magasins
                    </button>
                  </li>
                  <li>
                    <button onClick={() => handleGoAdminTab('zones')} className="hover:text-[#34D399] cursor-pointer">
                      Marchés Publics & Gares Routières
                    </button>
                  </li>
                  <li>
                    <button onClick={() => handleGoAdminTab('installation')} className="hover:text-[#34D399] cursor-pointer">
                      Starlink & 4G pour Zones Reculées
                    </button>
                  </li>
                  <li>
                    <button onClick={() => handleGoAdminTab('sessions')} className="hover:text-[#34D399] cursor-pointer">
                      WiFi Haute Densité
                    </button>
                  </li>
                </ul>
              </div>

              {/* Middle Column: par technologie */}
              <div className="md:col-span-5 space-y-4 md:border-r md:border-white/15 md:pr-8">
                <h3 className="text-lg font-normal text-white">
                  {activeMegaMenu === 'solutions' ? 'par technologie' : 'Logiciels & Cloud SDN'}
                </h3>
                <ul className="space-y-2.5 text-xs text-teal-100/90">
                  <li>
                    <button onClick={() => handleGoAdminTab('dashboard')} className="hover:text-[#34D399] text-left cursor-pointer">
                      Joowifi Cloud 6.3 : Plateforme Cloud unifiée pour MikroTik & Caisse POS
                    </button>
                  </li>
                  <li>
                    <button onClick={() => handleGoAdminTab('installation')} className="hover:text-[#34D399] text-left cursor-pointer">
                      Moteur Fast-Poll 10s & Heartbeat 45s (Zéro ouverture de port WAN)
                    </button>
                  </li>
                  <li>
                    <button onClick={() => handleGoAdminTab('tickets')} className="hover:text-[#34D399] text-left cursor-pointer">
                      Gestionnaire de Vouchers & Réconciliation Automatique Supabase
                    </button>
                  </li>
                  <li>
                    <button onClick={() => setCurrentSpace('pos')} className="hover:text-[#34D399] text-left cursor-pointer">
                      Terminal Caisse POS Vendeurs (PWA Offline-First & QR Code)
                    </button>
                  </li>
                  <li>
                    <button onClick={() => handleGoAdminTab('personnalisation')} className="hover:text-[#34D399] text-left cursor-pointer">
                      Studio Portail Captif & Paiements Wave, Orange, MTN, Moov
                    </button>
                  </li>
                  <li>
                    <button onClick={() => handleGoAdminTab('mac-bypass')} className="hover:text-[#34D399] text-left cursor-pointer">
                      Solution Bypass MAC Permanent pour Caméras IP & Équipements VIP
                    </button>
                  </li>
                </ul>
              </div>

              {/* Right Column: Témoignages client with Photo Card (Exact match to Capture 160756.png) */}
              <div className="md:col-span-4 space-y-3">
                <h3 className="text-lg font-normal text-white">
                  Témoignages
                  <br />
                  client
                </h3>
                <div className="w-48 h-28 rounded overflow-hidden border border-white/20 bg-slate-800">
                  <img
                    src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=500&q=80"
                    alt="Déploiement Joowifi"
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-xs text-white leading-snug max-w-[220px]">
                  Joowifi permet la réussite des opérateurs WiFi sur le terrain
                </p>
                <button
                  onClick={() => handleNavClick('home')}
                  className="text-xs text-[#34D399] hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  <span>Parcourir</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#005A5B] border-t border-white/15 px-4 py-4 space-y-2 text-white">
          <button
            onClick={() => handleNavClick('home')}
            className="block w-full text-left py-2 px-3 rounded hover:bg-[#004849] text-sm"
          >
            Accueil Joowifi 6.3
          </button>
          <button
            onClick={() => handleNavClick('features')}
            className="block w-full text-left py-2 px-3 rounded hover:bg-[#004849] text-sm"
          >
            Solutions & Scénarios
          </button>
          <button
            onClick={() => handleGoAdminTab('installation')}
            className="block w-full text-left py-2 px-3 rounded hover:bg-[#004849] text-sm"
          >
            Script RouterOS v5.1
          </button>
          <button
            onClick={() => handleNavClick('pricing')}
            className="block w-full text-left py-2 px-3 rounded hover:bg-[#004849] text-sm"
          >
            Tarification
          </button>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              setCurrentSpace('pos');
            }}
            className="block w-full text-left py-2 px-3 rounded hover:bg-[#004849] text-sm"
          >
            Ouvrir Caisse POS
          </button>
        </div>
      )}
    </header>
  );
};
