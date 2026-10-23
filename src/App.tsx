import React, { useEffect } from 'react';
import { useApp } from './context/AppContext';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  X,
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

// Admin Views (Purged of CaptivePortalEditor, MarketplaceTemplates, MyTemplates)
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
    user,
    openAuthModal,
  } = useApp();

  // IMPORTANT : Tous les Hooks React sont déclarés en haut du composant (avant tout return conditionnel)
  // afin d'éviter toute erreur de changement de nombre de hooks lors du basculement vers la Caisse POS !
  useEffect(() => {
    if (currentSpace === 'admin' && (!user || !user.accessToken || user.role !== 'admin')) {
      setCurrentSpace('public');
      openAuthModal('login');
    }
  }, [currentSpace, user, setCurrentSpace, openAuthModal]);

  // 1. TERMINAL CAISSE POS (Accessible depuis le menu ou pour tout compte Vendeur)
  if (currentSpace === 'pos' || (currentSpace === 'admin' && user?.role === 'staff')) {
    return (
      <div className="min-h-screen bg-[#F4F7FA] text-[#1E293B] flex flex-col font-sans">
        <ToastContainer />
        <PWAInstallBanner />
        <OfflineBanner />
        <main className="flex-1">
          <POSCashier />
        </main>
      </div>
    );
  }

  // 2. ESPACE ADMINISTRATEUR (NAVIGATION UNIFIÉE : Uniquement la barre verticale gauche Sidebar !)
  if (currentSpace === 'admin' && user && user.accessToken && user.role === 'admin') {
    return (
      <div className="h-screen w-screen overflow-hidden flex bg-[#F4F7FA] text-[#1E293B] font-sans select-none">
        <ToastContainer />
        <PWAInstallBanner />
        <OfflineBanner />
        <AuthModal />

        {/* Barre de navigation verticale unique sur le côté gauche */}
        <div className="hidden md:block h-full">
          <Sidebar />
        </div>

        {/* Zone principale de travail */}
        <main className="flex-1 h-full overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-10 bg-[#F4F7FA]">
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
            {adminTab === 'notifications' && <TelegramAlerts />}
            {adminTab === 'logs' && <AuditLogs />}
            {adminTab === 'profil' && <ProfileSettings />}
          </div>
        </main>

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
