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
  Globe,
  LogOut,
  LayoutDashboard,
  Wifi,
  Router as RouterIcon,
  Users,
  Wallet,
  Settings,
  Terminal,
  MapPin,
  Radio,
  Activity,
  History,
  Laptop,
  Calculator,
  TrendingUp,
  DollarSign,
  CreditCard,
  Palette,
  ShoppingBag,
  Bell,
  FileText,
  User,
  Bot,
  Boxes,
} from 'lucide-react';

// Common Components
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
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

interface PillarGroup {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  tabs: {
    id: AdminTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }[];
}

export default function App() {
  const {
    currentSpace,
    setCurrentSpace,
    publicTab,
    adminTab,
    setAdminTab,
    zones,
    tickets,
    staff,
    routers,
    sessions,
    macBypasses,
    pendingSosAlerts,
    currency,
    setCurrency,
    heartbeatSecondsRemaining,
    forceHeartbeatSync,
    formatMoney,
    showToast,
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

  // 6 Structured Workspace Pillars (Replaces the old 25-item vertical sidebar!)
  const pillars: PillarGroup[] = useMemo(
    () => [
      {
        id: 'supervision',
        label: 'Supervision',
        icon: LayoutDashboard,
        tabs: [
          { id: 'dashboard', label: 'Vue Globale 6.3', icon: LayoutDashboard },
          { id: 'sante', label: 'Santé & SLA Réseau', icon: Activity },
          { id: 'sessions', label: 'Clients Connectés', icon: Radio, badge: `${sessions.length}` },
          { id: 'connexions', label: 'Journal Connexions', icon: History },
          { id: 'assistant', label: 'Diagnostic IA', icon: Bot, badge: 'IA' },
        ],
      },
      {
        id: 'hotspot',
        label: 'Vouchers & Forfaits',
        icon: Ticket,
        tabs: [
          { id: 'tickets', label: 'Stock de Vouchers', icon: Ticket, badge: `${tickets.length}` },
          { id: 'forfaits', label: 'Catalogue Forfaits', icon: Wifi },
          { id: 'personnalisation', label: 'Portail Captif (login.html)', icon: Palette },
          { id: 'marketplace', label: 'Galerie de Portails', icon: ShoppingBag },
          { id: 'marketplace-mes-templates', label: 'Mes Thèmes', icon: Boxes },
        ],
      },
      {
        id: 'equipements',
        label: 'Équipements MikroTik',
        icon: RouterIcon,
        tabs: [
          { id: 'mikrotik', label: 'Passerelles MikroTik', icon: RouterIcon, badge: `${routers.length}` },
          { id: 'installation', label: 'Script Auto-Install (.rsc)', icon: Terminal, badge: 'v5.1' },
          { id: 'zones', label: 'Sites & Zones WiFi', icon: MapPin, badge: `${zones.length}` },
          { id: 'mac-bypass', label: 'Bindings MAC & Caméras IP', icon: Laptop, badge: `${macBypasses.length}` },
        ],
      },
      {
        id: 'vendeurs',
        label: 'Réseau Vendeurs POS',
        icon: Users,
        tabs: [
          {
            id: 'staff',
            label: 'Équipe Vendeurs',
            icon: Users,
            badge: pendingSosAlerts.length > 0 ? `${pendingSosAlerts.length} SOS` : `${staff.length}`,
          },
          { id: 'ventes', label: 'Journal Ventes POS', icon: TrendingUp },
          { id: 'pos', label: 'Simulateur Caisse POS', icon: Smartphone },
        ],
      },
      {
        id: 'finances',
        label: 'Finances & Mobile Money',
        icon: Wallet,
        tabs: [
          { id: 'comptabilite', label: 'Analytique & ROI FAI', icon: Calculator },
          { id: 'portefeuille', label: 'Portefeuille Mobile Money', icon: Wallet },
          { id: 'gains', label: 'Reversements & Gains', icon: DollarSign },
          { id: 'abonnements', label: 'Licence Cloud', icon: CreditCard },
        ],
      },
      {
        id: 'systeme',
        label: 'Système',
        icon: Settings,
        tabs: [
          { id: 'notifications', label: 'Alertes Telegram', icon: Bell },
          { id: 'logs', label: 'Journal d’Audit', icon: FileText },
          { id: 'profil', label: 'Profil & Devise', icon: User },
        ],
      },
    ],
    [sessions.length, tickets.length, routers.length, zones.length, macBypasses.length, pendingSosAlerts.length, staff.length]
  );

  const activePillar = useMemo(() => {
    return pillars.find((p) => p.tabs.some((t) => t.id === adminTab)) || pillars[0];
  }, [pillars, adminTab]);

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

  // 1. ESPACE VENDEUR (POS KIOSQUE PWA)
  if (currentSpace === 'pos') {
    return (
      <div className="min-h-screen bg-[#F4F7FA] text-[#1E293B] flex flex-col font-sans">
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

  // 2. ESPACE ADMINISTRATEUR — NOUVELLE ARCHITECTURE OMADA CONTROLLER 6.3
  //    (Barre Supérieure Verte + Barre Horizontale de Sous-Onglets Blanche + Rail d'Icônes 56px à gauche)
  if (currentSpace === 'admin') {
    return (
      <div className="h-screen w-screen overflow-hidden flex flex-col bg-[#F4F7FA] text-[#1E293B] font-sans select-none">
        <ToastContainer />
        <PWAInstallBanner />
        <OfflineBanner />
        <AuthModal />

        {/* Command Palette (Ctrl+K) */}
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
                  placeholder="Rechercher un voucher (efdj, 3yn5...), un vendeur ou un routeur..."
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
                  <span>Vouchers trouvés ({matchedTickets.length})</span>
                  <button
                    onClick={() => {
                      setAdminTab('tickets');
                      setCmdOpen(false);
                    }}
                    className="text-[#0066CC] hover:underline cursor-pointer"
                  >
                    Voir tous les vouchers &rarr;
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
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
            ROW 1 : TOP TEAL CONTROLLER BAR (#005A5B — Omada Network 6.3 Header)
        ===================================================================== */}
        <header className="h-13 shrink-0 px-4 bg-[#005A5B] text-white flex items-center justify-between gap-4 z-30 shadow-xs">
          {/* Left: Brand + Site Context Selector (Like Omada Controller top-left dropdown) */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCurrentSpace('public')}
              className="flex items-baseline gap-1.5 cursor-pointer pr-3 border-r border-white/20"
            >
              <span className="text-lg font-bold tracking-tight text-white">Joowifi</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#008060] text-white">
                6.3
              </span>
            </button>

            {/* Site Context Pill */}
            <div className="hidden sm:flex items-center gap-2 bg-[#004647] px-3 py-1 rounded border border-white/15 text-xs">
              <span className="w-2 h-2 rounded-full bg-[#34D399]" />
              <span className="text-teal-100 text-[11px]">Site :</span>
              <select
                value={selectedSiteFilter}
                onChange={(e) => setSelectedSiteFilter(e.target.value)}
                className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer text-xs"
              >
                <option value="all" className="bg-[#26292E] text-white">
                  Vue Globale (Tous les sites — {zones.length})
                </option>
                {zones.map((z) => (
                  <option key={z.id} value={z.id} className="bg-[#26292E] text-white">
                    {z.name} ({z.city})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Center: 6 Horizontal Pillar Buttons inside Top Header */}
          <nav className="hidden xl:flex items-center gap-1 h-full">
            {pillars.map((p) => {
              const Icon = p.icon;
              const isCurrentPillar = activePillar.id === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setAdminTab(p.tabs[0].id)}
                  className={`h-full px-3.5 flex items-center gap-2 text-xs font-medium border-b-[3px] transition cursor-pointer ${
                    isCurrentPillar
                      ? 'border-[#34D399] bg-[#004849] text-white font-semibold'
                      : 'border-transparent text-teal-100/85 hover:text-white hover:bg-[#004E4F]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{p.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right: Search, Sync 10s, Currency, POS Button */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setCmdOpen(true)}
              className="flex items-center gap-2 px-2.5 py-1 rounded bg-[#004647] hover:bg-[#003B3C] border border-white/15 text-xs text-teal-100 cursor-pointer"
              title="Rechercher un voucher (Ctrl+K)"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Rechercher...</span>
              <kbd className="hidden md:inline text-[10px] font-mono bg-[#005A5B] px-1 rounded">
                ⌘K
              </kbd>
            </button>

            <button
              onClick={() => {
                forceHeartbeatSync();
                showToast('Synchronisation Supabase & MikroTik exécutée.', 'success');
              }}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#004647] hover:bg-[#003B3C] border border-white/15 text-[11px] font-mono text-teal-100 cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#34D399]" />
              <span>Sync {heartbeatSecondsRemaining}s</span>
            </button>

            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as any)}
              className="bg-[#004647] text-white text-xs font-semibold px-2 py-1 rounded border border-white/15 focus:outline-none cursor-pointer"
            >
              <option value="XOF" className="bg-[#26292E]">FCFA</option>
              <option value="GNF" className="bg-[#26292E]">GNF</option>
              <option value="EUR" className="bg-[#26292E]">EUR</option>
              <option value="USD" className="bg-[#26292E]">USD</option>
            </select>

            <button
              onClick={() => setCurrentSpace('pos')}
              className="px-3 py-1 rounded bg-[#008060] hover:bg-[#006B50] text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Caisse POS</span>
            </button>

            <button
              onClick={() => setCurrentSpace('public')}
              title="Retour au site vitrine"
              className="p-1.5 rounded hover:bg-[#004647] text-teal-100 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* =====================================================================
            MAIN BODY : SLIM 56px LEFT ICON RAIL + HORIZONTAL SUB-TAB BAR + WORKSPACE
        ===================================================================== */}
        <div className="flex-1 flex overflow-hidden">
          {/* SLIM 56px LEFT ICON RAIL (Exactly like Omada Network 6.3 Monitor screenshot!) */}
          <aside className="hidden md:flex w-14 shrink-0 bg-white border-r border-slate-200 flex-col items-center py-3 justify-between z-20">
            <div className="flex flex-col items-center gap-2 w-full px-1.5">
              {pillars.map((p) => {
                const Icon = p.icon;
                const isActive = activePillar.id === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setAdminTab(p.tabs[0].id)}
                    title={p.label}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center transition cursor-pointer relative group ${
                      isActive
                        ? 'bg-[#008060] text-white shadow-xs'
                        : 'text-slate-500 hover:bg-slate-100 hover:text-[#005A5B]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="pointer-events-none opacity-0 group-hover:opacity-100 transition absolute left-12 px-2.5 py-1 rounded bg-slate-800 text-white text-[11px] font-medium whitespace-nowrap shadow-lg z-50">
                      {p.label}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex flex-col items-center gap-2 w-full px-1.5">
              <button
                onClick={() => setAdminTab('installation')}
                title="Script RouterOS (.rsc)"
                className={`w-10 h-10 rounded-lg flex items-center justify-center transition cursor-pointer ${
                  adminTab === 'installation'
                    ? 'bg-[#008060] text-white'
                    : 'bg-[#E6F4F3] text-[#005A5B] hover:bg-[#d0ebe9]'
                }`}
              >
                <Terminal className="w-4 h-4" />
              </button>
              <button
                onClick={() => setAdminTab('profil')}
                title="Paramètres Opérateur"
                className={`w-10 h-10 rounded-lg flex items-center justify-center transition cursor-pointer ${
                  adminTab === 'profil'
                    ? 'bg-[#008060] text-white'
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                <User className="w-4 h-4" />
              </button>
            </div>
          </aside>

          {/* RIGHT WORKSPACE COLUMN */}
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            {/* HORIZONTAL SUB-NAVIGATION BAR (Clean White Strip with Module Sub-Tabs & Quick Actions) */}
            <div className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 h-12 shrink-0 flex items-center justify-between gap-4 overflow-x-auto">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-2 hidden sm:inline">
                  {activePillar.label} :
                </span>
                {activePillar.tabs.map((tab) => {
                  const TabIcon = tab.icon;
                  const isTabActive = adminTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setAdminTab(tab.id)}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
                        isTabActive
                          ? 'bg-[#E6F4F3] text-[#005A5B] font-bold border border-[#99D5D3]'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <TabIcon className={`w-3.5 h-3.5 ${isTabActive ? 'text-[#008060]' : 'text-slate-400'}`} />
                      <span>{tab.label}</span>
                      {tab.badge && (
                        <span
                          className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold ${
                            tab.badge.includes('SOS')
                              ? 'bg-rose-600 text-white'
                              : isTabActive
                              ? 'bg-[#008060] text-white'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {tab.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Right Quick Shortcuts inside Sub-Nav Bar */}
              <div className="hidden lg:flex items-center gap-2 shrink-0 text-xs">
                <button
                  onClick={() => setAdminTab('tickets')}
                  className="px-2.5 py-1 rounded bg-[#F4F7FA] hover:bg-slate-200 border border-slate-200 text-slate-700 font-medium cursor-pointer"
                >
                  + Lot Vouchers
                </button>
                <button
                  onClick={() => setAdminTab('installation')}
                  className="px-2.5 py-1 rounded bg-[#F4F7FA] hover:bg-slate-200 border border-slate-200 text-[#005A5B] font-semibold cursor-pointer"
                >
                  Script MikroTik v5.1
                </button>
              </div>
            </div>

            {/* MAIN SCROLLABLE VIEWPORT */}
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
        </div>

        <BottomNav />
      </div>
    );
  }

  // 3. ESPACE PUBLIC (SITE VITRINE B2B JOOWIFI 6.3)
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
