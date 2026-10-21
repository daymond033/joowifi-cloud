import React, { useState, useEffect, useMemo } from 'react';
import { useApp, AdminTab } from './context/AppContext';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  X,
  Search,
  Smartphone,
  Ticket,
  ArrowRight,
  ShieldCheck,
  Command,
  Globe,
  LogOut,
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
              ? 'border-[#007A78] text-slate-800'
              : t.type === 'error'
              ? 'border-rose-500 text-rose-800'
              : 'border-slate-300 text-slate-800'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {t.type === 'success' && <CheckCircle2 className="w-4 h-4 text-[#007A78] shrink-0" />}
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
    tickets,
    staff,
    routers,
    sessions,
    currency,
    setCurrency,
    heartbeatSecondsRemaining,
    forceHeartbeatSync,
    formatMoney,
    showToast,
  } = useApp();

  // Global Search / Command Palette (Ctrl+K)
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

  const quickNavActions: { label: string; sub: string; tab: AdminTab }[] = [
    { label: 'Vue d’ensemble SDN', sub: 'Supervision globale des sites et routeurs', tab: 'dashboard' },
    { label: 'Gestionnaire de Vouchers', sub: `${tickets.length} tickets synchronisés Supabase`, tab: 'tickets' },
    { label: 'Assistant Script MikroTik (.rsc)', sub: 'Déploiement Fast-Poll 10s & Heartbeat 45s', tab: 'installation' },
    { label: 'Équipe Vendeurs POS', sub: `${staff.length} agents enregistrés`, tab: 'staff' },
    { label: 'Contrôleurs MikroTik', sub: `${routers.length} équipements supervisés`, tab: 'mikrotik' },
    { label: 'Studio Portail Captif', sub: 'Configuration login.html & Mobile Money', tab: 'personnalisation' },
  ];

  // 1. ESPACE VENDEUR (POS KIOSQUE PWA EN MODE CLAIR INSTITUTIONNEL)
  if (currentSpace === 'pos') {
    return (
      <div className="min-h-screen bg-[#F4F6F8] text-[#1E293B] flex flex-col font-sans">
        <ToastContainer />
        <PWAInstallBanner />
        <OfflineBanner />
        <main className="flex-1">
          <POSCashier />
        </main>
        <BottomNav />
      </div>
    );
  }

  // 2. ESPACE ADMINISTRATEUR (OMADA CLOUD SDN CONTROLLER STYLE — CLEAN LIGHT & FLAT TEAL)
  if (currentSpace === 'admin') {
    return (
      <div className="h-screen w-screen overflow-hidden flex flex-col bg-[#F4F6F8] text-[#1E293B] font-sans">
        <ToastContainer />
        <PWAInstallBanner />
        <OfflineBanner />
        <AuthModal />

        {/* Modal de Recherche Globale (Ctrl+K) */}
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
                <Search className="w-5 h-5 text-[#007A78] shrink-0" />
                <input
                  type="text"
                  autoFocus
                  value={cmdQuery}
                  onChange={(e) => setCmdQuery(e.target.value)}
                  placeholder="Rechercher un code voucher (ex: efdj, 3yn5), un vendeur ou un équipement..."
                  className="w-full bg-transparent text-slate-800 text-sm focus:outline-none placeholder:text-slate-400"
                />
                <button
                  onClick={() => setCmdOpen(false)}
                  className="px-2 py-1 rounded bg-white border border-slate-300 text-[10px] font-mono text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  ESC
                </button>
              </div>

              <div className="max-h-[65vh] overflow-y-auto p-4 space-y-5 text-xs">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#007A78] mb-2 flex items-center justify-between">
                    <span>Vouchers WiFi ({matchedTickets.length})</span>
                    <button
                      onClick={() => {
                        setAdminTab('tickets');
                        setCmdOpen(false);
                      }}
                      className="text-[#007A78] hover:underline cursor-pointer"
                    >
                      Ouvrir la liste complète &rarr;
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {matchedTickets.map((t) => (
                      <div
                        key={t.id}
                        onClick={() => {
                          navigator.clipboard.writeText(t.code);
                          showToast(`Code voucher ${t.code} copié !`, 'success');
                          setAdminTab('tickets');
                          setCmdOpen(false);
                        }}
                        className="p-3 rounded bg-[#F8FAFC] hover:bg-[#E6F4F3] border border-slate-200 flex items-center justify-between cursor-pointer transition"
                      >
                        <div className="flex items-center gap-2.5">
                          <Ticket className="w-4 h-4 text-[#007A78] shrink-0" />
                          <div>
                            <div className="font-mono font-bold text-slate-800 text-sm">{t.code}</div>
                            <div className="text-[11px] text-slate-500">
                              {t.forfaitName} • {formatMoney(t.price)}
                            </div>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-white border border-slate-200 text-[#007A78]">
                          {t.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Accès Rapide aux Modules
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {quickNavActions.map((act) => (
                      <button
                        key={act.tab}
                        onClick={() => {
                          setAdminTab(act.tab);
                          setCmdOpen(false);
                        }}
                        className="p-3 rounded bg-white hover:bg-[#F8FAFC] border border-slate-200 text-left flex items-center justify-between cursor-pointer transition"
                      >
                        <div>
                          <div className="font-semibold text-slate-800">{act.label}</div>
                          <div className="text-[11px] text-slate-500">{act.sub}</div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TOP CORPORATE TEAL CONTROLLER BAR (#005A5B Flat Design, zero gradients) */}
        <header className="h-14 shrink-0 px-4 sm:px-6 bg-[#005A5B] text-white flex items-center justify-between gap-4 z-30 keep-white">
          <div className="flex items-center gap-6">
            <div
              onClick={() => setCurrentSpace('public')}
              className="flex items-baseline gap-2 cursor-pointer"
            >
              <span className="text-xl font-bold tracking-tight text-white">Joowifi</span>
              <span className="text-[11px] text-teal-200 font-normal hidden sm:inline">
                SDN Cloud Controller
              </span>
            </div>

            {/* Search Input inside Top Teal Bar */}
            <button
              onClick={() => setCmdOpen(true)}
              className="hidden md:flex items-center justify-between gap-3 px-3 py-1.5 rounded bg-[#004849] hover:bg-[#003E3F] border border-white/15 text-xs text-teal-100 w-72 lg:w-96 transition cursor-pointer"
            >
              <div className="flex items-center gap-2 truncate">
                <Search className="w-3.5 h-3.5 text-teal-200 shrink-0" />
                <span className="truncate">Rechercher un voucher (efdj, 3yn5...), site...</span>
              </div>
              <kbd className="px-1.5 py-0.5 rounded bg-[#005A5B] text-[10px] font-mono text-teal-100">
                Ctrl+K
              </kbd>
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* Fast-Poll Status */}
            <button
              onClick={() => {
                forceHeartbeatSync();
                showToast('Synchronisation Supabase & MikroTik effectuée.', 'success');
              }}
              className="hidden lg:flex items-center gap-2 px-3 py-1 rounded bg-[#004849] border border-white/15 text-xs font-mono text-teal-100 cursor-pointer hover:bg-[#003E3F]"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#4ADE80]" />
              <span>Sync 10s ({heartbeatSecondsRemaining}s) • {sessions.length} clients</span>
            </button>

            {/* Currency Selector */}
            <div className="flex items-center gap-1 bg-[#004849] px-2.5 py-1 rounded border border-white/15 text-xs">
              <Globe className="w-3.5 h-3.5 text-teal-200" />
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as any)}
                className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer text-xs"
              >
                <option value="XOF" className="bg-[#2B2E33] text-white">FCFA (XOF)</option>
                <option value="GNF" className="bg-[#2B2E33] text-white">GNF</option>
                <option value="EUR" className="bg-[#2B2E33] text-white">EUR (€)</option>
                <option value="USD" className="bg-[#2B2E33] text-white">USD ($)</option>
              </select>
            </div>

            {/* Direct POS Launch */}
            <button
              onClick={() => setCurrentSpace('pos')}
              className="px-3 py-1.5 rounded bg-[#007A78] hover:bg-[#008F8C] border border-white/20 text-white font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Caisse POS</span>
            </button>

            <button
              onClick={() => setCurrentSpace('public')}
              title="Retour au portail public"
              className="p-1.5 rounded hover:bg-[#004849] text-teal-100 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          {/* Desktop Left White Corporate Sidebar */}
          <div className="hidden md:block h-full">
            <Sidebar />
          </div>

          {/* Admin Main Scrollable Body on Light Grey (#F4F6F8) */}
          <main className="flex-1 h-full overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-8 bg-[#F4F6F8]">
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

  // 3. ESPACE PUBLIC (SITE INSTITUTIONNEL B2B OMADA STYLE)
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
