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
      className="sticky top-0 z-50 w-full select-none shadow-sm"
      onMouseLeave={() => setActiveMegaMenu(null)}
    >
      {/* 1. TOP CORPORATE UTILITY BAR (#2B2E33 Charcoal, like Omada / VIGI top strip) */}
      <div className="w-full bg-[#2B2E33] text-white text-xs border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-8 flex items-center justify-between">
          {/* Left: Product Family Tabs */}
          <div className="flex items-center gap-6 h-full">
            <button
              onClick={() => handleNavClick('home')}
              className={`h-full flex items-center font-bold tracking-tight border-b-2 transition cursor-pointer ${
                currentSpace === 'public'
                  ? 'border-[#38B2AC] text-white'
                  : 'border-transparent text-gray-300 hover:text-white'
              }`}
            >
              Joowifi SDN
            </button>
            <button
              onClick={() => setCurrentSpace('pos')}
              className="h-full flex items-center font-semibold text-gray-300 hover:text-white transition cursor-pointer"
            >
              Joowifi POS
            </button>
            <button
              onClick={() => setCurrentSpace('admin')}
              className="hidden sm:flex h-full items-center font-semibold text-gray-300 hover:text-white transition cursor-pointer"
            >
              Cloud Controller
            </button>
          </div>

          {/* Right: Contact, Log In, Region/Currency */}
          <div className="flex items-center gap-5 text-[11px] text-gray-200">
            <button
              onClick={() => handleNavClick('contact')}
              className="hidden sm:flex items-center gap-1.5 hover:text-white transition cursor-pointer"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Nous contacter</span>
            </button>

            <button
              onClick={() => openAuthModal('login')}
              className="flex items-center gap-1.5 hover:text-white font-medium transition cursor-pointer"
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
                <option value="XOF" className="bg-[#2B2E33] text-white">
                  Afrique Francophone / Français (FCFA)
                </option>
                <option value="GNF" className="bg-[#2B2E33] text-white">
                  Guinée / Français (GNF)
                </option>
                <option value="EUR" className="bg-[#2B2E33] text-white">
                  International / Français (EUR)
                </option>
                <option value="USD" className="bg-[#2B2E33] text-white">
                  Global / English (USD)
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN CORPORATE FLAT TEAL HEADER (#005A5B Solid Flat Teal, zero gradients) */}
      <div className="w-full bg-[#005A5B] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Left: Clean Corporate Typography Logo (Omada by tp-link style) */}
          <div className="flex items-center gap-10 h-full">
            <button
              onClick={() => handleNavClick('home')}
              className="text-left cursor-pointer py-1 flex flex-col justify-center"
            >
              <span className="text-2xl font-bold tracking-tight text-white leading-none">
                Joowifi
              </span>
              <span className="text-[10px] font-medium text-teal-100/90 tracking-wide mt-0.5 text-right">
                by Ivoire Réseaux
              </span>
            </button>

            {/* Desktop Flat Nav Links */}
            <nav className="hidden lg:flex items-center gap-7 h-full text-sm font-normal">
              <button
                onMouseEnter={() => setActiveMegaMenu('products')}
                onClick={() =>
                  setActiveMegaMenu(activeMegaMenu === 'products' ? null : 'products')
                }
                className={`h-full flex items-center border-b-[3px] transition cursor-pointer ${
                  activeMegaMenu === 'products'
                    ? 'border-[#4ADE80] text-[#4ADE80] font-medium'
                    : 'border-transparent text-white hover:text-[#4ADE80]'
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
                    ? 'border-[#4ADE80] text-[#4ADE80] font-medium'
                    : 'border-transparent text-white hover:text-[#4ADE80]'
                }`}
              >
                Solutions
              </button>

              <button
                onMouseEnter={() => setActiveMegaMenu(null)}
                onClick={() => handleGoAdminTab('installation')}
                className="h-full flex items-center border-b-[3px] border-transparent text-white hover:text-[#4ADE80] transition cursor-pointer"
              >
                Formation & Script RouterOS
              </button>

              <button
                onMouseEnter={() => setActiveMegaMenu(null)}
                onClick={() => handleNavClick('pricing')}
                className={`h-full flex items-center border-b-[3px] transition cursor-pointer ${
                  currentSpace === 'public' && publicTab === 'pricing'
                    ? 'border-[#4ADE80] text-[#4ADE80] font-medium'
                    : 'border-transparent text-white hover:text-[#4ADE80]'
                }`}
              >
                Tarification
              </button>

              <button
                onMouseEnter={() => setActiveMegaMenu(null)}
                onClick={() => setCurrentSpace('pos')}
                className="h-full flex items-center border-b-[3px] border-transparent text-white hover:text-[#4ADE80] transition cursor-pointer"
              >
                Partenaires POS
              </button>

              <button
                onMouseEnter={() => setActiveMegaMenu(null)}
                onClick={() => handleNavClick('about')}
                className={`h-full flex items-center border-b-[3px] transition cursor-pointer ${
                  currentSpace === 'public' && publicTab === 'about'
                    ? 'border-[#4ADE80] text-[#4ADE80] font-medium'
                    : 'border-transparent text-white hover:text-[#4ADE80]'
                }`}
              >
                À propos
              </button>

              <button
                onMouseEnter={() => setActiveMegaMenu(null)}
                onClick={() => handleNavClick('contact')}
                className={`h-full flex items-center border-b-[3px] transition cursor-pointer ${
                  currentSpace === 'public' && publicTab === 'contact'
                    ? 'border-[#4ADE80] text-[#4ADE80] font-medium'
                    : 'border-transparent text-white hover:text-[#4ADE80]'
                }`}
              >
                Support
              </button>
            </nav>
          </div>

          {/* Right: Console Cloud > & Search (exact match to Omada header right side) */}
          <div className="hidden sm:flex items-center gap-6 text-sm">
            <button
              onClick={() => setCurrentSpace('admin')}
              className="flex items-center gap-0.5 text-[#4ADE80] hover:text-green-300 font-semibold transition cursor-pointer"
            >
              <span>Console Cloud</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setCurrentSpace('admin')}
              className="flex items-center gap-1.5 text-white hover:text-[#4ADE80] transition cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>Rechercher</span>
            </button>
          </div>

          {/* Mobile Hamburger */}
          <div className="flex lg:hidden items-center gap-3">
            <button
              onClick={() => setCurrentSpace('admin')}
              className="px-3 py-1.5 bg-[#007A78] text-white text-xs font-semibold rounded cursor-pointer"
            >
              Console Cloud &gt;
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 text-white hover:text-[#4ADE80] cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* 3. FULL-WIDTH FLAT TEAL MEGA-MENU (Exact match to Screenshot 2: image_4390de.jpg) */}
      {activeMegaMenu === 'products' && (
        <div className="w-full bg-[#005A5B] text-white border-t border-white/15 py-10 shadow-xl">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Column 1 */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white">Équipements & Passerelles</h3>
              <ul className="space-y-3 text-sm text-teal-100/85">
                <li>
                  <button
                    onClick={() => handleGoAdminTab('mikrotik')}
                    className="hover:text-[#4ADE80] transition cursor-pointer"
                  >
                    Passerelles Fusion MikroTik v7
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleGoAdminTab('installation')}
                    className="hover:text-[#4ADE80] transition cursor-pointer"
                  >
                    Routeurs Virtuels CHR (VirtualBox)
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleGoAdminTab('zones')}
                    className="hover:text-[#4ADE80] transition cursor-pointer"
                  >
                    Points d'Accès WiFi Multi-Zones
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleGoAdminTab('mac-bypass')}
                    className="hover:text-[#4ADE80] transition cursor-pointer"
                  >
                    Switches & Bindings MAC / Caméras IP
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleGoAdminTab('sante')}
                    className="hover:text-[#4ADE80] transition cursor-pointer"
                  >
                    Supervision Matérielle & Watchdog
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 2 */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white">Plateformes de Gestion</h3>
              <ul className="space-y-3 text-sm text-teal-100/85">
                <li>
                  <button
                    onClick={() => handleGoAdminTab('dashboard')}
                    className="hover:text-[#4ADE80] transition cursor-pointer"
                  >
                    Contrôleur Cloud Joowifi SDN
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => openAuthModal('login')}
                    className="hover:text-[#4ADE80] transition cursor-pointer"
                  >
                    Portail Cloud ID (Connexion Opérateur)
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleGoAdminTab('personnalisation')}
                    className="hover:text-[#4ADE80] transition cursor-pointer"
                  >
                    Studio Portail Captif Mobile Money
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3 */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white">Outils Logiciels</h3>
              <ul className="space-y-3 text-sm text-teal-100/85">
                <li>
                  <button
                    onClick={() => setCurrentSpace('pos')}
                    className="hover:text-[#4ADE80] transition cursor-pointer"
                  >
                    Application Caisse POS Vendeurs (PWA)
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleGoAdminTab('tickets')}
                    className="hover:text-[#4ADE80] transition cursor-pointer"
                  >
                    Générateur de Lots & Vouchers PDF
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleGoAdminTab('installation')}
                    className="hover:text-[#4ADE80] transition cursor-pointer"
                  >
                    Assistant Script RouterOS v5.1 (.rsc)
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {activeMegaMenu === 'solutions' && (
        <div className="w-full bg-[#005A5B] text-white border-t border-white/15 py-10 shadow-xl">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white">Secteurs d'Activité</h3>
              <ul className="space-y-3 text-sm text-teal-100/85">
                <li>
                  <button onClick={() => handleNavClick('features')} className="hover:text-[#4ADE80] cursor-pointer">
                    Hôtellerie & Résidences Meublées
                  </button>
                </li>
                <li>
                  <button onClick={() => handleNavClick('features')} className="hover:text-[#4ADE80] cursor-pointer">
                    Campus Universitaires & Écoles
                  </button>
                </li>
                <li>
                  <button onClick={() => handleNavClick('features')} className="hover:text-[#4ADE80] cursor-pointer">
                    Marchés Publics & Galeries Commerciales
                  </button>
                </li>
                <li>
                  <button onClick={() => handleNavClick('features')} className="hover:text-[#4ADE80] cursor-pointer">
                    Bureaux PME & Espaces Coworking
                  </button>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white">Monétisation & Paiements</h3>
              <ul className="space-y-3 text-sm text-teal-100/85">
                <li>
                  <button onClick={() => handleGoAdminTab('portefeuille')} className="hover:text-[#4ADE80] cursor-pointer">
                    Passerelles Wave, Orange, MTN & Moov
                  </button>
                </li>
                <li>
                  <button onClick={() => handleGoAdminTab('staff')} className="hover:text-[#4ADE80] cursor-pointer">
                    Réseau de Revendeurs & Kiosques Terrain
                  </button>
                </li>
                <li>
                  <button onClick={() => handleGoAdminTab('comptabilite')} className="hover:text-[#4ADE80] cursor-pointer">
                    Analytique Financière & ROI Starlink
                  </button>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white">Architecture Cloud Pull</h3>
              <ul className="space-y-3 text-sm text-teal-100/85">
                <li>
                  <button onClick={() => handleGoAdminTab('installation')} className="hover:text-[#4ADE80] cursor-pointer">
                    Synchronisation Fast-Poll 10s Sans Port Entrant
                  </button>
                </li>
                <li>
                  <button onClick={() => handleGoAdminTab('installation')} className="hover:text-[#4ADE80] cursor-pointer">
                    Compatibilité 100% Starlink, 4G/5G & CGNAT
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#005A5B] border-t border-white/15 px-4 py-4 space-y-2 text-white">
          <button
            onClick={() => handleNavClick('home')}
            className="block w-full text-left py-2 px-3 rounded hover:bg-[#004849] text-sm font-medium"
          >
            Accueil SDN
          </button>
          <button
            onClick={() => handleNavClick('features')}
            className="block w-full text-left py-2 px-3 rounded hover:bg-[#004849] text-sm font-medium"
          >
            Produits & Solutions
          </button>
          <button
            onClick={() => handleGoAdminTab('installation')}
            className="block w-full text-left py-2 px-3 rounded hover:bg-[#004849] text-sm font-medium"
          >
            Script RouterOS v5.1
          </button>
          <button
            onClick={() => handleNavClick('pricing')}
            className="block w-full text-left py-2 px-3 rounded hover:bg-[#004849] text-sm font-medium"
          >
            Tarification
          </button>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              openAuthModal('login');
            }}
            className="block w-full text-left py-2 px-3 rounded bg-[#007A78] text-white text-sm font-semibold mt-2"
          >
            Se connecter (Portail Cloud)
          </button>
        </div>
      )}
    </header>
  );
};
