import React, { useState, useEffect, useMemo } from 'react';
import { useApp, AdminTab } from './context/AppContext';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  X,
  Search,
  Sparkles,
  Smartphone,
  RefreshCw,
  Globe,
  Palette,
  Ticket,
  Users,
  Router as RouterIcon,
  Terminal,
  ArrowRight,
  Radio,
  ShieldCheck,
  Command,
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

  // Signature Joowifi Aurora OS Theme State ('emerald' | 'indigo' | 'sunset')
  const [uiTheme, setUiTheme] = useState<'emerald' | 'indigo' | 'sunset'>(() => {
    try {
      const saved = localStorage.getItem('joowifi_ui_theme');
      if (saved === 'emerald' || saved === 'indigo' || saved === 'sunset') return saved;
    } catch {
      // ignore
    }
    return 'emerald';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-jw-theme', uiTheme);
    try {
      localStorage.setItem('joowifi_ui_theme', uiTheme);
    } catch {
      // ignore
    }
  }, [uiTheme]);

  // Global Command Palette (Ctrl+K / Cmd+K)
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
    if (!q) return tickets.slice(0, 4);
    return tickets
      .filter(
        (t) =>
          t.code.toLowerCase().includes(q) ||
          (t.forfaitName || '').toLowerCase().includes(q) ||
          (t.sellerName || '').toLowerCase().includes(q)
      )
      .slice(0, 6);
  }, [cmdQuery, tickets]);

  const matchedStaff = useMemo(() => {
    const q = cmdQuery.trim().toLowerCase();
    if (!q) return staff.slice(0, 3);
    return staff
      .filter((s) => s.name.toLowerCase().includes(q) || s.phone.toLowerCase().includes(q))
      .slice(0, 4);
  }, [cmdQuery, staff]);

  const quickNavActions: { label: string; sub: string; tab: AdminTab }[] = [
    { label: 'Centre de Pilotage Bento', sub: 'Vue temps réel & Topologie Réseau', tab: 'dashboard' },
    { label: 'Générateur & Stock de Tickets', sub: `${tickets.length} vouchers synchronisés Supabase`, tab: 'tickets' },
    { label: 'Moteur MikroTik Engine v5.1 (.rsc)', sub: 'Script Fast-Poll 10s & Heartbeat 45s', tab: 'installation' },
    { label: 'Équipe Vendeurs & Crédits POS', sub: `${staff.length} vendeurs actifs sur le terrain`, tab: 'staff' },
    { label: ' Parc Routeurs MikroTik', sub: `${routers.length} équipements supervisés`, tab: 'mikrotik' },
    { label: 'Studio Portail Captif Live', sub: 'Personnalisation login.html & Mobile Money', tab: 'personnalisation' },
  ];

  // 1. ESPACE VENDEUR (POS KIOSQUE PWA MOBILE)
  if (currentSpace === 'pos') {
    return (
      <div className="min-h-screen text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
        <ToastContainer />
        <PWAInstallBanner />
        <OfflineBanner />
        <POSCashier />
        <BottomNav />
      </div>
    );
  }

  // 2. ESPACE ADMINISTRATEUR (JOOWIFI AURORA FABRIC OS v6.0)
  if (currentSpace === 'admin') {
    return (
      <div className="h-screen w-screen overflow-hidden flex flex-col text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-950">
        <ToastContainer />
        <PWAInstallBanner />
        <OfflineBanner />
        <AuthModal />

        {/* Command Palette Modal (Ctrl+K) */}
        {cmdOpen && (
          <div
            className="fixed inset-0 z-[75] bg-slate-950/80 backdrop-blur-md flex items-start justify-center pt-16 px-4"
            onClick={() => setCmdOpen(false)}
          >
            <div
              className="w-full max-w-2xl rounded-2xl glass-dropdown border border-emerald-500/30 shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-white/10 flex items-center gap-3">
                <Search className="w-5 h-5 text-emerald-400 shrink-0" />
                <input
                  type="text"
                  autoFocus
                  value={cmdQuery}
                  onChange={(e) => setCmdQuery(e.target.value)}
                  placeholder="Rechercher un code ticket (ex: efdj, 3yn5), un vendeur (Mamadou), ou un module..."
                  className="w-full bg-transparent text-white text-sm focus:outline-none placeholder:text-slate-500"
                />
                <button
                  onClick={() => setCmdOpen(false)}
                  className="px-2 py-1 rounded-lg bg-slate-900 border border-white/10 text-[10px] font-mono text-slate-400 hover:text-white cursor-pointer"
                >
                  ESC
                </button>
              </div>

              <div className="max-h-[65vh] overflow-y-auto p-4 space-y-5 text-xs">
                {/* Tickets Results */}
                <div>
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 mb-2 flex items-center justify-between">
                    <span>Tickets WiFi trouvés ({matchedTickets.length})</span>
                    <button
                      onClick={() => {
                        setAdminTab('tickets');
                        setCmdOpen(false);
                      }}
                      className="text-cyan-400 hover:underline cursor-pointer"
                    >
                      Voir tout le stock &rarr;
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {matchedTickets.map((t) => (
                      <div
                        key={t.id}
                        onClick={() => {
                          navigator.clipboard.writeText(t.code);
                          showToast(`Code ticket ${t.code} copié dans le presse-papier !`, 'success');
                          setAdminTab('tickets');
                          setCmdOpen(false);
                        }}
                        className="p-3 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-white/10 hover:border-emerald-500/40 flex items-center justify-between cursor-pointer transition"
                      >
                        <div className="flex items-center gap-2.5">
                          <Ticket className="w-4 h-4 text-emerald-400 shrink-0" />
                          <div>
                            <div className="font-mono font-bold text-white text-sm">{t.code}</div>
                            <div className="text-[11px] text-slate-400">
                              {t.forfaitName} • {formatMoney(t.price)}
                            </div>
                          </div>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            t.status === 'actif'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                          }`}
                        >
                          {t.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Staff Vendors Results */}
                {matchedStaff.length > 0 && (
                  <div>
                    <div className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-400 mb-2">
                      Vendeurs POS ({matchedStaff.length})
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {matchedStaff.map((s) => (
                        <div
                          key={s.id}
                          onClick={() => {
                            setAdminTab('staff');
                            setCmdOpen(false);
                          }}
                          className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-white/10 cursor-pointer transition"
                        >
                          <div className="font-bold text-white truncate">{s.name}</div>
                          <div className="text-[11px] text-emerald-400 font-mono">
                            CA : {formatMoney(s.todaySales)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick Navigation Modules */}
                <div>
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">
                    Navigation Rapide Console
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {quickNavActions.map((act) => (
                      <button
                        key={act.tab}
                        onClick={() => {
                          setAdminTab(act.tab);
                          setCmdOpen(false);
                        }}
                        className="p-3 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-white/5 hover:border-cyan-500/30 text-left flex items-center justify-between cursor-pointer transition"
                      >
                        <div>
                          <div className="font-bold text-slate-100">{act.label}</div>
                          <div className="text-[11px] text-slate-400">{act.sub}</div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-500" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 flex overflow-hidden">
          {/* Desktop Left Fabric Dock Sidebar */}
          <div className="hidden md:block h-full">
            <Sidebar />
          </div>

          {/* Right Workspace Column: Top Command Header + Scrollable Bento Main */}
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            {/* NEW SIGNATURE TOP COMMAND HEADER (Dissociates completely from hotpro.app) */}
            <header className="h-16 shrink-0 px-4 sm:px-6 lg:px-8 glass-panel border-b border-white/10 flex items-center justify-between gap-4 z-30">
              {/* Left: Global Search / Command Bar Trigger */}
              <button
                onClick={() => setCmdOpen(true)}
                className="flex items-center justify-between gap-3 px-3.5 py-2 rounded-xl bg-slate-950/80 hover:bg-slate-900 border border-white/10 hover:border-emerald-500/40 text-xs text-slate-400 w-full max-w-md transition cursor-pointer group"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Search className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform shrink-0" />
                  <span className="truncate">
                    Rechercher un ticket (efdj, 3yn5...), un vendeur ou un routeur...
                  </span>
                </div>
                <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-900 border border-white/10 font-mono text-[10px] text-slate-300 shrink-0">
                  <Command className="w-2.5 h-2.5" /> K
                </kbd>
              </button>

              {/* Right: Live Network Fabric Status + Theme Switcher + Currency + POS Button */}
              <div className="flex items-center gap-2.5 shrink-0">
                {/* Live Supabase & MikroTik FastPoll Status Pill */}
                <button
                  onClick={() => {
                    forceHeartbeatSync();
                    showToast('Synchronisation Cloud Pull & Supabase 12 tables forcée !', 'success');
                  }}
                  title="Cliquez pour forcer la synchronisation immédiate avec Supabase et MikroTik"
                  className="hidden xl:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 text-xs transition cursor-pointer"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                  </span>
                  <span className="font-semibold text-emerald-300">
                    Fabric Sync
                  </span>
                  <span className="text-[11px] font-mono text-slate-300 border-l border-white/10 pl-2">
                    {heartbeatSecondsRemaining}s • {sessions.length} actifs
                  </span>
                </button>

                {/* Signature Theme Switcher (Emerald / Indigo / Sunset) */}
                <div className="hidden sm:flex items-center gap-1 p-1 rounded-xl bg-slate-950/90 border border-white/10">
                  <button
                    onClick={() => setUiTheme('emerald')}
                    title="Thème Cyber-Émeraude & Cyan (Signature Joowifi)"
                    className={`px-2 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition cursor-pointer ${
                      uiTheme === 'emerald'
                        ? 'bg-emerald-500 text-slate-950 shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-300" />
                    <span className="hidden lg:inline">Émeraude</span>
                  </button>
                  <button
                    onClick={() => setUiTheme('indigo')}
                    title="Thème Royal Indigo & Cyan (FinTech)"
                    className={`px-2 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition cursor-pointer ${
                      uiTheme === 'indigo'
                        ? 'bg-indigo-500 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-indigo-300" />
                    <span className="hidden lg:inline">Indigo</span>
                  </button>
                  <button
                    onClick={() => setUiTheme('sunset')}
                    title="Thème Rubis & Violet Néon"
                    className={`px-2 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition cursor-pointer ${
                      uiTheme === 'sunset'
                        ? 'bg-rose-500 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-rose-300" />
                    <span className="hidden lg:inline">Rubis</span>
                  </button>
                </div>

                {/* Currency Selector */}
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as any)}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-950 border border-white/10 text-xs font-mono font-bold text-cyan-300 focus:outline-none cursor-pointer"
                >
                  <option value="XOF">XOF (FCFA)</option>
                  <option value="GNF">GNF (FG)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="USD">USD ($)</option>
                </select>

                {/* Launch POS Kiosk Button */}
                <button
                  onClick={() => setCurrentSpace('pos')}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/15 transition cursor-pointer"
                >
                  <Smartphone className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span className="hidden sm:inline">Caisse POS</span>
                </button>
              </div>
            </header>

            {/* Admin Main Scrollable Body */}
            <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-8">
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
        </div>

        {/* Mobile bottom navigation */}
        <BottomNav />
      </div>
    );
  }

  // 3. ESPACE PUBLIC (SITE VITRINE TELECOM CLOUD)
  return (
    <div className="min-h-screen flex flex-col text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-950">
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
