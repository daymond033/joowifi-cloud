import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from './context/AppContext';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  X,
  Search,
  Smartphone,
  ShieldCheck,
  LogOut,
  User,
} from 'lucide-react';

// Common Components
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { Sidebar } from './components/common/Sidebar';
import { BottomNav } from './components/common/BottomNav';
import { PWAInstallBanner } from './components/common/PWAInstallBanner';
import { OfflineBanner } from './components/common/OfflineBanner';

// Public Space Components
import { LandingPage } from './components/public/LandingPage';
import { FeaturesPage } from './components/public/FeaturesPage';
import { PricingPage } from './components/public/PricingPage';
import { AboutPage } from './components/public/AboutPage';
import { ContactPage } from './components/public/ContactPage';
import { LegalPages } from './components/public/LegalPages';
import { AuthModal } from './components/public/AuthModal';

// POS Kiosk
import { POSCashier } from './components/pos/POSCashier';

// Admin Views
import { DashboardOverview } from './components/admin/DashboardOverview';
import { AssistantIA } from './components/admin/AssistantIA';
import { TicketsManager } from './components/admin/TicketsManager';
import { ForfaitsManager } from './components/admin/ForfaitsManager';
import { StaffManager } from './components/admin/StaffManager';
import { ZonesManager } from './components/admin/ZonesManager';
import { MikroTikManager } from './components/admin/MikroTikManager';
import { NetworkHealth } from './components/admin/NetworkHealth';
import { ActiveSessions } from './components/admin/ActiveSessions';
import { ConnectionHistory } from './components/admin/ConnectionHistory';
import { MacBypassManager } from './components/admin/MacBypassManager';
import { InstallationScript } from './components/admin/InstallationScript';
import { AccountingView } from './components/admin/AccountingView';
import { WalletView } from './components/admin/WalletView';
import { VendorSalesView } from './components/admin/VendorSalesView';
import { MyEarningsView } from './components/admin/MyEarningsView';
import { SubscriptionView } from './components/admin/SubscriptionView';
import { CaptivePortalEditor } from './components/admin/CaptivePortalEditor';
import { MarketplaceTemplates } from './components/admin/MarketplaceTemplates';
import { MyTemplates } from './components/admin/MyTemplates';
import { TelegramAlerts } from './components/admin/TelegramAlerts';
import { AuditLogs } from './components/admin/AuditLogs';
import { ProfileSettings } from './components/admin/ProfileSettings';

const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useApp();
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[80] flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-lg border shadow-lg bg-white text-xs font-medium ${
            t.type === 'success'
              ? 'border-[#008060] text-slate-800'
              : t.type === 'error'
              ? 'border-rose-500 text-rose-800'
              : 'border-slate-300 text-slate-800'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {t.type === 'success' && <CheckCircle2 className="w-4 h-4 text-[#008060] shrink-0" />}
            {t.type === 'error' && <XCircle className="w-4 h-4 text-rose-600 shrink-0" />}
            {t.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />}
            {t.type === 'info' && <Info className="w-4 h-4 text-[#007A78] shrink-0" />}
            <span>{t.message}</span>
          </div>
          <button
            onClick={() => dismissToast(t.id)}
            className="text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default function App() {
  const {
    currentSpace,
    setCurrentSpace,
    publicTab,
    adminTab,
    setAdminTab,
    zones,
    tickets,
    currency,
    setCurrency,
    forceHeartbeatSync,
    formatMoney,
    notify,
    user,
    logout,
  } = useApp();

  const [selectedSiteFilter, setSelectedSiteFilter] = useState<string>('all');
  const [cmdOpen, setCmdOpen] = useState(false);
  const [cmdQuery, setCmdQuery] = useState('');

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCmdOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setCmdOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const matchedTickets = useMemo(() => {
    const q = cmdQuery.trim().toLowerCase();
    if (!q) return tickets.slice(0, 6);
    return tickets
      .filter(
        (t) =>
          t.code.toLowerCase().includes(q) ||
          (t.forfaitName || '').toLowerCase().includes(q) ||
          (t.sellerName || '').toLowerCase().includes(q)
      )
      .slice(0, 8);
  }, [cmdQuery, tickets]);

  // GARDE RBAC STRICT (Section 4 Audit) :
  // Un compte Vendeur (role === 'staff') est strictement cantonné à la Caisse POS
  if (currentSpace === 'pos' || (currentSpace === 'admin' && user?.role === 'staff')) {
    return (
      <div className="min-h-screen bg-[#F4F7FA] text-[#1E293B] flex flex-col font-sans">
        <ToastContainer />
        <PWAInstallBanner />
        <OfflineBanner />
        <main className="flex-1">
          <POSCashier />
        </main>
        {user?.role !== 'staff' && <BottomNav />}
      </div>
    );
  }

  // 2. ESPACE ADMINISTRATEUR (CONSOLE CLOUD — Sans doublons de navigation dans la barre supérieure !)
  if (currentSpace === 'admin') {
    return (
      <div className="h-screen w-screen overflow-hidden flex flex-col bg-[#F4F7FA] text-[#1E293B] font-sans select-none">
        <ToastContainer />
        <PWAInstallBanner />
        <OfflineBanner />
        <AuthModal />

        {/* Recherche Rapide (Ctrl+K) */}
        {cmdOpen && (
          <div
            className="fixed inset-0 z-[75] bg-slate-900/40 flex items-start justify-center pt-16 px-4"
            onClick={() => setCmdOpen(false)}
          >
            <div
              className="w-full max-w-2xl rounded-lg bg-white border border-slate-200 shadow-2xl overflow-hidden text-slate-800"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-slate-200 flex items-center gap-3 bg-[#F8FAFC]">
                <Search className="w-5 h-5 text-[#008060] shrink-0" />
                <input
                  type="text"
                  autoFocus
                  value={cmdQuery}
                  onChange={(e) => setCmdQuery(e.target.value)}
                  placeholder="Rechercher un code ticket, un forfait ou un vendeur..."
                  className="w-full bg-transparent text-slate-800 text-sm focus:outline-none placeholder:text-slate-400"
                />
                <button
                  onClick={() => setCmdOpen(false)}
                  className="px-2 py-1 rounded bg-white border border-slate-300 text-[10px] font-mono text-slate-500 cursor-pointer"
                >
                  ESC
                </button>
              </div>

              <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4 text-xs">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#008060] flex items-center justify-between">
                  <span>Tickets trouvés ({matchedTickets.length})</span>
                  <button
                    onClick={() => {
                      setAdminTab('tickets');
                      setCmdOpen(false);
                    }}
                    className="text-[#0066CC] hover:underline cursor-pointer"
                  >
                    Ouvrir le gestionnaire de tickets &rarr;
                  </button>
                </div>
                {matchedTickets.length === 0 ? (
                  <div className="p-4 text-center text-slate-400">
                    Aucun ticket trouvé. Créez un lot depuis l'onglet Gestion des Tickets.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {matchedTickets.map((t) => (
                      <div
                        key={t.id}
                        onClick={() => {
                          navigator.clipboard.writeText(t.code);
                          notify(`Code ticket ${t.code} copié !`, 'success');
                          setAdminTab('tickets');
                          setCmdOpen(false);
                        }}
                        className="p-3 rounded bg-[#F8FAFC] hover:bg-[#E6F4F3] border border-slate-200 flex items-center justify-between cursor-pointer transition"
                      >
                        <div>
                          <div className="font-mono font-bold text-slate-800 text-sm">{t.code}</div>
                          <div className="text-[11px] text-slate-500">
                            {t.forfaitName} • {formatMoney(t.price)}
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-white border border-slate-200 text-[#008060]">
                          {t.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
            TOP BAR DE LA CONSOLE (Épurée : Zéro doublon de navigation avec la Sidebar !)
        ===================================================================== */}
        <header className="h-14 shrink-0 px-4 sm:px-6 bg-[#005A5B] text-white flex items-center justify-between gap-4 z-30 shadow-xs">
          {/* Left: Brand + Site Context Selector */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCurrentSpace('public')}
              className="flex items-baseline gap-1.5 cursor-pointer pr-3 border-r border-white/20"
            >
              <span className="text-lg font-bold tracking-tight text-white">Joowifi</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#008060] text-white">
                Cloud
              </span>
            </button>

            <div className="hidden sm:flex items-center gap-2 bg-[#004647] px-3 py-1.5 rounded border border-white/15 text-xs">
              <span className="w-2 h-2 rounded-full bg-[#34D399]" />
              <span className="text-teal-100 text-[11px]">Site :</span>
              <select
                value={selectedSiteFilter}
                onChange={(e) => setSelectedSiteFilter(e.target.value)}
                className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer text-xs"
              >
                <option value="all" className="bg-[#26292E] text-white">
                  Tous les sites ({zones.length})
                </option>
                {zones.map((z) => (
                  <option key={z.id} value={z.id} className="bg-[#26292E] text-white">
                    {z.name} ({z.city})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Center: Quick Search Trigger */}
          <button
            onClick={() => setCmdOpen(true)}
            className="hidden md:flex items-center justify-between gap-3 px-3.5 py-1.5 rounded bg-[#004647] hover:bg-[#003B3C] border border-white/15 text-xs text-teal-100 w-80 transition cursor-pointer"
          >
            <div className="flex items-center gap-2 truncate">
              <Search className="w-3.5 h-3.5 text-teal-200 shrink-0" />
              <span className="truncate">Rechercher un ticket, un forfait...</span>
            </div>
            <kbd className="text-[10px] font-mono bg-[#005A5B] px-1.5 py-0.5 rounded">
              Ctrl+K
            </kbd>
          </button>

          {/* Right: Cloud Sync Status (White-Label), Currency, POS, Profile & Logout */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={forceHeartbeatSync}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#004647] hover:bg-[#003B3C] border border-white/15 text-[11px] font-medium text-teal-100 cursor-pointer"
              title="Synchroniser avec le Cloud"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#34D399]" />
              <span>Synchronisation Cloud Active</span>
            </button>

            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as any)}
              className="bg-[#004647] text-white text-xs font-semibold px-2.5 py-1.5 rounded border border-white/15 focus:outline-none cursor-pointer"
            >
              <option value="XOF" className="bg-[#26292E]">FCFA (XOF)</option>
              <option value="GNF" className="bg-[#26292E]">GNF</option>
              <option value="EUR" className="bg-[#26292E]">EUR (€)</option>
              <option value="USD" className="bg-[#26292E]">USD ($)</option>
            </select>

            <button
              onClick={() => setCurrentSpace('pos')}
              className="px-3 py-1.5 rounded bg-[#008060] hover:bg-[#006B50] text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Caisse POS</span>
            </button>

            <button
              onClick={() => setAdminTab('profil')}
              title="Profil & Devise"
              className="p-1.5 rounded bg-[#004647] hover:bg-[#003B3C] text-teal-100 cursor-pointer"
            >
              <User className="w-4 h-4" />
            </button>

            <button
              onClick={logout}
              title="Se déconnecter"
              className="p-1.5 rounded hover:bg-[#004647] text-teal-100 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* =====================================================================
            MAIN BODY : MENU PRINCIPAL GAUCHE UNIQUE (Sidebar) + CONTENU
        ===================================================================== */}
        <div className="flex-1 flex overflow-hidden">
          <div className="hidden md:block h-full">
            <Sidebar />
          </div>

          <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-10 bg-[#F4F7FA]">
            <div className="max-w-7xl mx-auto">
              {adminTab === 'dashboard' && <DashboardOverview />}
              {adminTab === 'assistant' && <AssistantIA />}
              {adminTab === 'tickets' && <TicketsManager />}
              {adminTab === 'forfaits' && <ForfaitsManager />}
              {adminTab === 'pos' && <POSCashier />}
              {adminTab === 'staff' && <StaffManager />}
              {adminTab === 'zones' && <ZonesManager />}
              {adminTab === 'mikrotik' && <MikroTikManager />}
              {adminTab === 'sante' && <NetworkHealth />}
              {adminTab === 'sessions' && <ActiveSessions />}
              {adminTab === 'connexions' && <ConnectionHistory />}
              {adminTab === 'mac-bypass' && <MacBypassManager />}
              {adminTab === 'installation' && <InstallationScript />}
              {adminTab === 'comptabilite' && <AccountingView />}
              {adminTab === 'portefeuille' && <WalletView />}
              {adminTab === 'ventes' && <VendorSalesView />}
              {adminTab === 'gains' && <MyEarningsView />}
              {adminTab === 'abonnements' && <SubscriptionView />}
              {adminTab === 'personnalisation' && <CaptivePortalEditor />}
              {adminTab === 'marketplace' && <MarketplaceTemplates />}
              {adminTab === 'marketplace-mes-templates' && <MyTemplates />}
              {adminTab === 'notifications' && <TelegramAlerts />}
              {adminTab === 'logs' && <AuditLogs />}
              {adminTab === 'profil' && <ProfileSettings />}
            </div>
          </main>
        </div>

        <BottomNav />
      </div>
    );
  }

  // 3. ESPACE PUBLIC
  return (
    <div className="min-h-screen flex flex-col bg-white text-[#1E293B] font-sans">
      <ToastContainer />
      <PWAInstallBanner />
      <OfflineBanner />
      <AuthModal />
      <Navbar />

      <main className="flex-1 bg-white">
        {publicTab === 'home' && <LandingPage />}
        {publicTab === 'features' && <FeaturesPage />}
        {publicTab === 'pricing' && <PricingPage />}
        {publicTab === 'about' && <AboutPage />}
        {publicTab === 'contact' && <ContactPage />}
        {(publicTab === 'privacy' ||
          publicTab === 'terms' ||
          publicTab === 'refund' ||
          publicTab === 'cookies' ||
          publicTab === 'legal') && <LegalPages tab={publicTab} />}
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
}
