import React from 'react';
import { useApp } from './context/AppContext';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

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
    <div className="fixed top-4 right-4 z-[60] flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-2xl border shadow-2xl backdrop-blur-xl text-xs font-medium transition-all ${
            t.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200'
              : t.type === 'error'
              ? 'bg-rose-950/90 border-rose-500/40 text-rose-200'
              : t.type === 'warning'
              ? 'bg-amber-950/90 border-amber-500/40 text-amber-200'
              : 'bg-slate-900/95 border-cyan-500/40 text-cyan-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {t.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
            {t.type === 'error' && <XCircle className="w-4 h-4 text-rose-400 shrink-0" />}
            {t.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />}
            {t.type === 'info' && <Info className="w-4 h-4 text-cyan-400 shrink-0" />}
            <span>{t.message}</span>
          </div>
          <button
            onClick={() => dismissToast(t.id)}
            className="text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default function App() {
  const { currentSpace, publicTab, adminTab } = useApp();

  // 1. ESPACE VENDEUR (POS KIOSQUE PWA MOBILE)
  if (currentSpace === 'pos') {
    return (
      <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
        <ToastContainer />
        <PWAInstallBanner />
        <OfflineBanner />
        <POSCashier />
        <BottomNav />
      </div>
    );
  }

  // 2. ESPACE ADMINISTRATEUR (CONSOLE CLOUD)
  if (currentSpace === 'admin') {
    return (
      <div className="h-screen w-screen overflow-hidden flex flex-col bg-[#0B0F19] text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-950">
        <ToastContainer />
        <PWAInstallBanner />
        <OfflineBanner />
        <AuthModal />

        <div className="flex-1 flex overflow-hidden">
          {/* Desktop Left Sidebar */}
          <div className="hidden md:block h-full">
            <Sidebar />
          </div>

          {/* Admin Main Scrollable Body */}
          <main className="flex-1 h-full overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-8">
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

        {/* Mobile bottom navigation */}
        <BottomNav />
      </div>
    );
  }

  // 3. ESPACE PUBLIC (SITE VITRINE)
  return (
    <div className="min-h-screen flex flex-col bg-[#0B0F19] text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-950">
      <ToastContainer />
      <PWAInstallBanner />
      <OfflineBanner />
      <AuthModal />
      <Navbar />

      <main className="flex-1">
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
