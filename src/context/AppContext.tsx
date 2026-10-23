import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  isSupabaseConfigured,
  supabaseInsert,
  supabaseSelect,
  supabaseUpdate,
  supabaseDelete,
  getActiveTenantId,
  setActiveTenantId,
  DEFAULT_MAIN_TENANT_ID,
  buildSignedSessionJwt,
  supabaseAuthSignUp,
} from '../lib/supabase';
import {
  Currency,
  RouterItem,
  ZoneItem,
  ForfaitItem,
  TicketItem,
  StaffItem,
  ConnectedSession,
  PhysicalWifiHost,
  ConnectionLog,
  MacBypassItem,
  WalletTransaction,
  TelegramConfig,
  OperatorProfile,
  ToastNotification,
  AuditLogItem,
  PlanDetails,
  HeartbeatCommandItem,
} from '../types';
import {
  INITIAL_ROUTERS,
  INITIAL_ZONES,
  INITIAL_FORFAITS,
  INITIAL_STAFF,
  INITIAL_TICKETS,
  INITIAL_SESSIONS,
  INITIAL_PHYSICAL_HOSTS,
  INITIAL_LOGS,
  INITIAL_MAC_BYPASS,
  INITIAL_TRANSACTIONS,
  INITIAL_AUDIT_LOGS,
  SAAS_PLANS,
} from '../data/mockData';

export type PublicTab =
  | 'home'
  | 'features'
  | 'pricing'
  | 'about'
  | 'contact'
  | 'privacy'
  | 'terms'
  | 'refund'
  | 'cookies'
  | 'legal';

export type AdminTab =
  // PRINCIPAL
  | 'dashboard'
  | 'assistant'
  // VENTE
  | 'tickets'
  | 'forfaits'
  | 'pos'
  | 'staff'
  // RÉSEAU
  | 'zones'
  | 'mikrotik'
  | 'sante'
  | 'sessions'
  | 'connexions'
  | 'mac-bypass'
  | 'installation'
  // FINANCE
  | 'comptabilite'
  | 'portefeuille'
  | 'ventes'
  | 'gains'
  | 'abonnements'
  // RÉGLAGES
  | 'notifications'
  | 'logs'
  | 'profil';

interface UserSession {
  name: string;
  email: string;
  role: 'admin' | 'staff';
  zoneId?: string;
}

const DEFAULT_TELEGRAM_CONFIG: TelegramConfig = {
  botToken: '',
  chatId: '',
  enabled: false,
  triggers: {
    routerDown: true,
    vendorLowCredit: true,
    dailyReport: true,
    momoPayment: true,
    highCpuWarning: true,
  },
};

const DEFAULT_OPERATOR_PROFILE: OperatorProfile = {
  name: '',
  company: '',
  email: '',
  phone: '',
  city: 'Abidjan',
  country: "Côte d'Ivoire",
  defaultIspMonthlyCost: 0,
  twoFactorEnabled: false,
};

interface AppContextType {
  currentSpace: 'public' | 'admin' | 'pos';
  setCurrentSpace: (space: 'public' | 'admin' | 'pos') => void;
  publicTab: PublicTab;
  setPublicTab: (tab: PublicTab) => void;
  adminTab: AdminTab;
  setAdminTab: (tab: AdminTab) => void;
  currency: Currency;
  setCurrency: (c: Currency) => void;
  formatMoney: (amountInXof: number) => string;

  // Data
  routers: RouterItem[];
  zones: ZoneItem[];
  forfaits: ForfaitItem[];
  tickets: TicketItem[];
  staff: StaffItem[];
  sessions: ConnectedSession[];
  physicalHosts: PhysicalWifiHost[];
  connectionLogs: ConnectionLog[];
  macBypasses: MacBypassItem[];
  transactions: WalletTransaction[];
  walletBalance: number;
  gainsBalance: number;
  currentPlanId: PlanDetails['id'];
  telegramConfig: TelegramConfig;
  operatorProfile: OperatorProfile;
  toasts: ToastNotification[];
  auditLogs: AuditLogItem[];
  heartbeatSecondsRemaining: number;
  heartbeatQueue: HeartbeatCommandItem[];
  forceHeartbeatSync: () => void;

  // Notifications
  notify: (message: string, type?: ToastNotification['type']) => void;
  showToast: (message: string, type?: ToastNotification['type']) => void;
  dismissToast: (id: string) => void;

  // Actions
  generateTicketsBatch: (
    forfaitId: string,
    quantity: number,
    prefix?: string,
    channel?: 'stock' | 'papier'
  ) => TicketItem[];
  sellTicketPOS: (
    forfaitId: string,
    customerPhone?: string,
    sellerId?: string
  ) => TicketItem;
  simulateDirectMomoPurchase: (forfaitId: string, phone: string, provider: string) => TicketItem;
  updateTicket: (ticket: TicketItem) => void;
  deleteTicket: (id: string) => void;
  addCustomTicket: (ticket: TicketItem) => void;
  disconnectSession: (sessionId: string) => void;
  disconnectAllSessions: (routerId?: string) => void;
  refreshSessions: () => void;
  authorizeHost: (hostId: string, forfaitId?: string) => void;
  addRouter: (router: Omit<RouterItem, 'id' | 'lastHeartbeat' | 'installToken'> & { installToken?: string; id?: string }) => void;
  updateRouter: (id: string, updates: Partial<RouterItem>) => void;
  deleteRouter: (id: string) => void;
  rebootRouter: (routerId: string) => void;
  reconcileProfiles: () => Promise<{ success: boolean; profilesCount: number; message: string }>;
  pingRouter: (routerId: string) => Promise<{ success: boolean; latencyMs: number }>;
  regenerateRouterToken: (routerId: string) => string;
  addZone: (zone: Omit<ZoneItem, 'id' | 'routerCount' | 'activeTicketsCount' | 'monthlyRevenue'> & { initialRouterId?: string }) => void;
  updateZone: (zone: ZoneItem) => void;
  deleteZone: (id: string) => void;
  purchaseZonePack: (packName: string, zonesCount: number, priceMonthly: number) => boolean;
  addForfait: (forfait: Omit<ForfaitItem, 'id'>) => void;
  updateForfait: (idOrForfait: string | ForfaitItem, updates?: Partial<ForfaitItem>) => void;
  deleteForfait: (id: string) => void;
  addStaff: (member: Omit<StaffItem, 'id' | 'totalSales' | 'todaySales'>) => void;
  updateStaff: (member: StaffItem) => void;
  toggleStaffStatus: (staffId: string) => void;
  deleteStaff: (staffId: string) => void;
  rechargeStaff: (staffId: string, amount: number) => void;
  payStaffCommission: (staffId: string, amount: number) => boolean;
  addMacBypass: (
    macOrItem: string | (Partial<MacBypassItem> & { macAddress: string; label: string }),
    label?: string,
    category?: MacBypassItem['category'],
    comment?: string
  ) => void;
  updateMacBypass: (id: string, updates: Partial<MacBypassItem>) => void;
  deleteMacBypass: (id: string) => void;
  toggleMacBypassStatus: (id: string) => void;
  rechargeWallet: (amount: number, method: WalletTransaction['paymentMethod']) => void;
  withdrawGains: (amount: number, phone: string, provider: 'Orange' | 'MTN' | 'Wave' | 'Moov') => boolean;
  upgradePlan: (planId: PlanDetails['id']) => boolean;
  updateTelegramConfig: (updates: Partial<TelegramConfig>) => void;
  updateOperatorProfile: (updates: Partial<OperatorProfile>) => void;
  addAuditLog: (action: string, target: string, details: string) => void;
  sosRechargeRequest: (staffId: string, amount: number) => void;
  pendingSosAlerts: { id: string; staffName: string; amount: number; time: string }[];
  clearSosAlert: (id: string) => void;

  // Auth
  user: UserSession | null;
  isAuthModalOpen: boolean;
  authMode: 'login' | 'register';
  openAuthModal: (mode?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  login: (
    email: string,
    role?: 'admin' | 'staff',
    name?: string,
    staffId?: string,
    tenantId?: string,
    isNewAccount?: boolean,
    accessToken?: string
  ) => void;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const safeGetStorage = <T,>(key: string, fallback: T): T => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
};

const safeSetStorage = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage quota or sandbox restrictions
  }
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentSpace, setCurrentSpace] = useState<'public' | 'admin' | 'pos'>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      const hash = window.location.hash;
      const search = window.location.search;
      if (path === '/pos' || hash === '#/pos' || hash === '#pos' || search.includes('space=pos')) {
        return 'pos';
      }
      if (path.startsWith('/dashboard') || hash.startsWith('#/dashboard') || search.includes('space=admin')) {
        return 'admin';
      }
    }
    return 'public';
  });
  const [publicTab, setPublicTab] = useState<PublicTab>('home');
  const [adminTab, setAdminTab] = useState<AdminTab>('dashboard');
  const [currency, setCurrency] = useState<Currency>(() => safeGetStorage('joowifi_currency', 'XOF'));

  // Toast notifications
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const notify = (message: string, type: ToastNotification['type'] = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Core Data — Strictly Empty Initial State (0 Mock Data, 100% Cloud DB Driven)
  const [routers, setRouters] = useState<RouterItem[]>([]);
  const [zones, setZones] = useState<ZoneItem[]>([]);
  const [forfaits, setForfaits] = useState<ForfaitItem[]>([]);
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [staff, setStaff] = useState<StaffItem[]>([]);
  const [sessions, setSessions] = useState<ConnectedSession[]>([]);
  const [physicalHosts, setPhysicalHosts] = useState<PhysicalWifiHost[]>([]);
  const [connectionLogs, setConnectionLogs] = useState<ConnectionLog[]>([]);
  const [macBypasses, setMacBypasses] = useState<MacBypassItem[]>([]);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [gainsBalance, setGainsBalance] = useState<number>(0);
  const [currentPlanId, setCurrentPlanId] = useState<PlanDetails['id']>('starter');
  const [telegramConfig, setTelegramConfig] = useState<TelegramConfig>(DEFAULT_TELEGRAM_CONFIG);
  const [operatorProfile, setOperatorProfile] = useState<OperatorProfile>(DEFAULT_OPERATOR_PROFILE);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [heartbeatQueue, setHeartbeatQueue] = useState<HeartbeatCommandItem[]>([]);

  const [activeTenantId, setActiveTenantIdState] = useState<string>(() => getActiveTenantId());
  const OP_ID = activeTenantId;

  const syncOperatorToSupabase = () => {
    if (!isSupabaseConfigured() || !OP_ID || !user?.email) return;
    void supabaseUpdate(
      'operators',
      `tenant_id=eq.${encodeURIComponent(OP_ID)}`,
      {
        name: operatorProfile.name || user.name || 'Opérateur',
        company: operatorProfile.company || 'Réseau WiFi',
        phone: operatorProfile.phone || '+225',
        city: operatorProfile.city || 'Abidjan',
        country: operatorProfile.country || "Côte d'Ivoire",
        currency: currency || 'XOF',
        plan_id: currentPlanId || 'starter',
        wallet_balance_xof: Math.max(0, Math.round(Number(walletBalance || 0))),
        gains_balance_xof: Math.max(0, Math.round(Number(gainsBalance || 0))),
        default_isp_monthly_cost: Math.round(Number(operatorProfile.defaultIspMonthlyCost || 0)),
        two_factor_enabled: Boolean(operatorProfile.twoFactorEnabled),
        telegram_bot_token: telegramConfig.botToken || null,
        telegram_chat_id: telegramConfig.chatId || null,
        telegram_enabled: Boolean(telegramConfig.enabled),
        telegram_triggers: telegramConfig.triggers || {},
      },
      OP_ID
    );
  };

  const syncZonesToSupabase = (items: ZoneItem[]) => {
    if (!isSupabaseConfigured() || items.length === 0) return;
    const rows = items.map((z) => ({
      tenant_id: OP_ID,
      operator_id: OP_ID,
      name: z.name,
      city: z.city || 'Abidjan',
      country: z.country || "Côte d'Ivoire",
      site_type: z.siteType || 'commerce',
      status: z.status || 'active',
      description: z.description || '',
      isp_monthly_cost: Math.round(Number(z.ispMonthlyCost || 25000)),
      subscription_price_monthly: Math.round(Number(z.subscriptionPriceMonthly || 5000)),
      monthly_revenue_xof: Math.round(Number(z.monthlyRevenue || 0)),
      today_sales_xof: Math.round(Number(z.todaySales || 0)),
    }));
    void supabaseInsert('zones', rows, 'operator_id,name');
  };

  const syncRoutersToSupabase = (items: RouterItem[]) => {
    if (!isSupabaseConfigured() || items.length === 0) return;
    const rows = items.map((r) => ({
      tenant_id: OP_ID,
      operator_id: OP_ID,
      zone_id: r.zoneName || r.zoneId || 'Zone Principale',
      name: r.name,
      model: r.model || 'MikroTik RB5009',
      install_token: r.installToken,
      ip_address: r.ipAddress || '10.5.50.1',
      mac_address: r.macAddress || null,
      cloud_dns: r.cloudDns || null,
      routeros_version: r.routerOsVersion || 'v7.15.2',
      hotspot_interface: r.hotspotInterface || 'bridge-hotspot',
      status: r.status || 'online',
      last_heartbeat_at: new Date().toISOString(),
      uptime: r.uptime || '01j 00h 00m',
      cpu_usage: Math.round(Number(r.cpuUsage || 15)),
      ram_usage: Math.round(Number(r.ramUsage || 32)),
      traffic_down_mbps: Number(r.trafficDownMbps || 0),
      traffic_up_mbps: Number(r.trafficUpMbps || 0),
      total_subscribers: Math.round(Number(r.totalSubscribers || 0)),
      synced_profiles_count: Math.round(Number(r.syncedProfilesCount || 0)),
    }));
    void supabaseInsert('routers', rows, 'install_token');
  };

  const syncForfaitsToSupabase = (items: ForfaitItem[]) => {
    if (!isSupabaseConfigured() || items.length === 0) return;
    const rows = items.map((f) => ({
      tenant_id: OP_ID,
      operator_id: OP_ID,
      name: f.name,
      duration_hours: Math.max(1, Math.round(Number(f.durationHours || 1))),
      validity_value: Math.max(1, Math.round(Number(f.validityValue || 1))),
      validity_unit: f.validityUnit || 'days',
      price_xof: Math.max(0, Math.round(Number(f.price || 0))),
      download_speed_mbps: Number(f.downloadSpeedMbps || 5),
      upload_speed_mbps: Number(f.uploadSpeedMbps || 2),
      data_limit_mb: Math.round(Number(f.dataLimitMb || 0)),
      simultaneous_devices: Math.max(1, Math.round(Number(f.simultaneousDevices || 1))),
      mac_lock: Boolean(f.macLock ?? true),
      popular: Boolean(f.popular),
      color: f.color || 'amber',
    }));
    void supabaseInsert('forfaits', rows, 'operator_id,name');
  };

  const syncTicketsToSupabase = (items: TicketItem[]) => {
    if (!isSupabaseConfigured() || items.length === 0) return;
    const rows = items.map((t) => ({
      tenant_id: OP_ID,
      operator_id: OP_ID,
      zone_id: t.zoneName || 'Zone Principale',
      forfait_id: t.forfaitName || t.forfaitId,
      seller_id: t.sellerName || t.sellerId || null,
      code: t.code,
      pin: t.pin || t.code,
      password: t.password || t.pin || t.code,
      price_xof: Math.round(Number(t.price || 0)),
      duration_label: t.duration || '24h',
      status: t.sellerName ? 'vendeur' : t.status || 'stock',
      batch_id: t.batchId || (t.sellerName ? 'POS-CAISSE' : null),
      customer_phone: t.customerPhone || null,
      mac_address: t.macAddress || null,
    }));
    void supabaseInsert('tickets', rows, 'tenant_id,code');

    const queuedRows: Record<string, unknown>[] = [];
    items.forEach((t) => {
      if (t.queuedForfaits && t.queuedForfaits.length > 0) {
        t.queuedForfaits.forEach((qf, idx) => {
          queuedRows.push({
            ticket_id: t.code,
            forfait_id: qf.forfaitId || qf.forfaitName,
            forfait_name: qf.forfaitName,
            price_xof: Math.round(Number(qf.price || 0)),
            position: idx + 1,
            status: qf.status || 'queued',
          });
        });
      }
    });
    if (queuedRows.length > 0) {
      void supabaseInsert('ticket_queued_forfaits', queuedRows, 'ticket_id,position');
    }
  };

  const syncStaffToSupabase = (items: StaffItem[]) => {
    if (!isSupabaseConfigured() || items.length === 0 || !OP_ID) return;
    const rows = items.map((s) => ({
      tenant_id: OP_ID,
      operator_id: OP_ID,
      zone_id: s.zoneName || s.zoneId || 'Zone Principale',
      name: s.name,
      email: s.email ? s.email.trim().toLowerCase() : null,
      phone: s.phone,
      pin_hash: s.password && s.password.trim() !== '' ? s.password.trim() : '1234',
      commission_rate: Number(s.commissionRate || 10),
      balance_credit_xof: Math.max(0, Math.round(Number(s.balanceCredit || 0))),
      daily_goal_xof: Math.round(Number(s.dailyGoal || 15000)),
      today_sales_xof: Math.round(Number(s.todaySales || 0)),
      total_sales_xof: Math.round(Number(s.totalSales || 0)),
      paid_commissions_xof: Math.round(Number(s.paidCommissions || 0)),
      active: Boolean(s.active),
      permissions: s.permissions || {
        fastSale: true,
        printThermal: true,
        shareWhatsapp: true,
        sosRequest: true,
      },
    }));
    void supabaseInsert('staff_vendors', rows, 'operator_id,name', OP_ID);
  };

  const syncMacBypassesToSupabase = (items: MacBypassItem[]) => {
    if (!isSupabaseConfigured() || items.length === 0) return;
    const rows = items.map((m) => ({
      tenant_id: OP_ID,
      operator_id: OP_ID,
      router_id: m.routerName || m.routerId || 'all',
      mac_address: m.macAddress,
      label: m.label,
      category: m.category || 'VIP',
      binding_type: m.bindingType || 'bypassed',
      auto_cookie: Boolean(m.autoCookie ?? true),
      forfait_id: m.forfaitName || m.forfaitId || 'Bypass Total',
      expiry_type: m.expiryType || 'permanent',
      status: m.status || 'active',
      device_vendor: m.deviceVendor || '',
      comment: m.comment || '',
    }));
    void supabaseInsert('mac_bypasses', rows, 'operator_id,mac_address');
  };

  const syncTransactionsToSupabase = (items: WalletTransaction[]) => {
    if (!isSupabaseConfigured() || items.length === 0) return;
    const rows = items.map((tx) => ({
      tenant_id: OP_ID,
      operator_id: OP_ID,
      type: tx.type || 'credit',
      amount_xof: Math.max(1, Math.round(Number(tx.amount || 100))),
      category: tx.category || 'Recharge Mobile Money',
      reference: tx.reference || `TX-${tx.id}`,
      payment_method: tx.paymentMethod || 'Wave',
      status: tx.status || 'completed',
    }));
    void supabaseInsert('wallet_transactions', rows, 'reference');
  };

  const syncSessionsToSupabase = (items: ConnectedSession[]) => {
    if (!isSupabaseConfigured() || items.length === 0) return;
    const rows = items.map((s) => ({
      tenant_id: OP_ID,
      operator_id: OP_ID,
      router_id: s.routerName || s.routerId || 'MK-ADJAME-CORE-01',
      username: s.username,
      ip_address: s.ipAddress || '10.5.50.10',
      mac_address: s.macAddress || '00:00:00:00:00:00',
      forfait_name: s.forfaitName || 'Pass Standard',
      uptime_minutes: Math.round(Number(s.uptimeMinutes || 1)),
      time_remaining_minutes: Math.round(Number(s.timeRemainingMinutes || 60)),
      bytes_in_mb: Number(s.bytesInMb || 0),
      bytes_out_mb: Number(s.bytesOutMb || 0),
      signal_dbm: Math.round(Number(s.signalDbm || -60)),
      device_type: s.deviceType || 'smartphone',
    }));
    void supabaseInsert('active_sessions', rows, 'operator_id,username');
  };

  const syncAll12TablesToSupabase = () => {
    syncOperatorToSupabase();
    syncZonesToSupabase(zones);
    syncRoutersToSupabase(routers);
    syncForfaitsToSupabase(forfaits);
    syncStaffToSupabase(staff);
    syncMacBypassesToSupabase(macBypasses);
    syncTransactionsToSupabase(transactions);
    syncSessionsToSupabase(sessions);
  };

  const enqueueRouterCommand = (
    commandType: HeartbeatCommandItem['commandType'],
    routerOsCommand: string,
    routerName: string = 'Tous les routeurs (Parc Global)'
  ) => {
    const cmd: HeartbeatCommandItem = {
      id: `hb-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      routerName,
      commandType,
      routerOsCommand,
      status: 'pending',
      createdAt: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };
    setHeartbeatQueue((prev) => [cmd, ...prev.slice(0, 29)]);
    if (isSupabaseConfigured()) {
      void supabaseInsert('heartbeat_commands', {
        tenant_id: OP_ID,
        operator_id: OP_ID,
        router_id: routers[0]?.id || 'all',
        command_type: commandType,
        routeros_script: routerOsCommand,
        status: 'pending',
      });
    }
  };

  const forceHeartbeatSync = () => {
    if (OP_ID) {
      void loadTenantWorkspace(OP_ID);
    }
    setHeartbeatSecondsRemaining(45);
    notify(`Données actualisées depuis le Cloud Joowifi.`, 'success');
  };

  // SOS Recharge alerts from field vendors (Strictly empty by default)
  const [pendingSosAlerts, setPendingSosAlerts] = useState<
    { id: string; staffName: string; amount: number; time: string }[]
  >([]);

  // Auth State (Persisted in localStorage with RBAC + Multi-Tenant ID)
  const [user, setUser] = useState<UserSession | null>(() => {
    const saved = safeGetStorage<UserSession | null>('joowifi_auth_user', null);
    if (saved && saved.email && saved.tenantId && saved.accessToken) {
      return saved;
    }
    return null;
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // 45-second heartbeat ticker simulator (MikroTik Pull Model)
  const [heartbeatSecondsRemaining, setHeartbeatSecondsRemaining] = useState<number>(45);

  useEffect(() => {
    const timer = setInterval(() => {
      setHeartbeatSecondsRemaining((prev) => {
        if (prev % 15 === 0 && user?.tenantId) {
          void loadTenantWorkspace(user.tenantId);
        }
        return prev <= 1 ? 45 : prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [user?.tenantId]);

  // Fonction centrale de chargement strict depuis la base Cloud Supabase pour un tenant_id donné
  const loadTenantWorkspace = async (targetTenant: string) => {
    if (!isSupabaseConfigured() || !targetTenant) return;
    try {
      const [opRows, zRows, rRows, fRows, sRows, tRows, mRows, sesRows, txRows] = await Promise.all([
        supabaseSelect<Record<string, any>>(
          'operators',
          `select=*&tenant_id=eq.${encodeURIComponent(targetTenant)}&limit=1`,
          targetTenant
        ),
        supabaseSelect<Record<string, any>>(
          'zones',
          `select=*&tenant_id=eq.${encodeURIComponent(targetTenant)}&limit=100`,
          targetTenant
        ),
        supabaseSelect<Record<string, any>>(
          'routers',
          `select=*&tenant_id=eq.${encodeURIComponent(targetTenant)}&limit=100`,
          targetTenant
        ),
        supabaseSelect<Record<string, any>>(
          'forfaits',
          `select=*&tenant_id=eq.${encodeURIComponent(targetTenant)}&limit=100`,
          targetTenant
        ),
        supabaseSelect<Record<string, any>>(
          'staff_vendors',
          `select=*&tenant_id=eq.${encodeURIComponent(targetTenant)}&limit=100`,
          targetTenant
        ),
        supabaseSelect<Record<string, any>>(
          'tickets',
          `select=*&tenant_id=eq.${encodeURIComponent(targetTenant)}&order=created_at.desc&limit=500`,
          targetTenant
        ),
        supabaseSelect<Record<string, any>>(
          'mac_bypasses',
          `select=*&tenant_id=eq.${encodeURIComponent(targetTenant)}&limit=200`,
          targetTenant
        ),
        supabaseSelect<Record<string, any>>(
          'active_sessions',
          `select=*&tenant_id=eq.${encodeURIComponent(targetTenant)}&limit=200`,
          targetTenant
        ),
        supabaseSelect<Record<string, any>>(
          'wallet_transactions',
          `select=*&tenant_id=eq.${encodeURIComponent(targetTenant)}&order=created_at.desc&limit=200`,
          targetTenant
        ),
      ]);

      if (Array.isArray(opRows) && opRows.length > 0) {
        const op = opRows[0];
        setOperatorProfile((prev) => ({
          ...prev,
          name: String(op.name || prev.name || ''),
          company: String(op.company || prev.company || ''),
          email: String(op.email || prev.email || ''),
          phone: String(op.phone || prev.phone || ''),
          city: String(op.city || prev.city || 'Abidjan'),
          country: String(op.country || prev.country || "Côte d'Ivoire"),
          defaultIspMonthlyCost: Number(op.default_isp_monthly_cost ?? prev.defaultIspMonthlyCost ?? 0),
          twoFactorEnabled: Boolean(op.two_factor_enabled ?? prev.twoFactorEnabled),
        }));
      }

      setZones(
        Array.isArray(zRows)
          ? zRows
              .filter((z) => String(z.tenant_id || z.operator_id || '') === targetTenant)
              .map((z) => ({
                id: String(z.id),
                name: String(z.name),
                city: String(z.city || 'Abidjan'),
                country: String(z.country || "Côte d'Ivoire"),
                routerCount: 0,
                activeTicketsCount: 0,
                monthlyRevenue: Number(z.monthly_revenue_xof || 0),
                description: String(z.description || ''),
                status: (z.status as any) || 'active',
                siteType: String(z.site_type || 'commerce'),
                todaySales: Number(z.today_sales_xof || 0),
                ispMonthlyCost: Number(z.isp_monthly_cost || 0),
              }))
          : []
      );

      setRouters(
        Array.isArray(rRows)
          ? rRows
              .filter((r) => String(r.tenant_id || r.operator_id || '') === targetTenant)
              .map((r) => ({
                id: String(r.id),
                name: String(r.name),
                model: String(r.model || 'MikroTik RouterOS'),
                zoneId: String(r.zone_id || ''),
                zoneName: String(r.zone_id || 'Zone Principale'),
                ipAddress: String(r.ip_address || '10.5.50.1'),
                macAddress: String(r.mac_address || ''),
                routerOsVersion: String(r.routeros_version || 'v7.23.8'),
                status: (r.status as any) || 'offline',
                lastHeartbeat: String(r.last_heartbeat_at || new Date().toISOString()),
                uptime: String(r.uptime || '00j 00h 00m'),
                cpuUsage: Number(r.cpu_usage || 0),
                ramUsage: Number(r.ram_usage || 0),
                trafficDownMbps: Number(r.traffic_down_mbps || 0),
                trafficUpMbps: Number(r.traffic_up_mbps || 0),
                totalSubscribers: Number(r.total_subscribers || 0),
                installToken: String(r.install_token || ''),
              }))
          : []
      );

      setForfaits(
        Array.isArray(fRows)
          ? fRows
              .filter((f) => String(f.tenant_id || f.operator_id || '') === targetTenant)
              .map((f) => ({
                id: String(f.id),
                name: String(f.name),
                durationHours: Number(f.duration_hours || 24),
                validityValue: Number(f.validity_value || 1),
                validityUnit: (f.validity_unit as any) || 'days',
                price: Number(f.price_xof || 0),
                downloadSpeedMbps: Number(f.download_speed_mbps || 10),
                uploadSpeedMbps: Number(f.upload_speed_mbps || 3),
                dataLimitMb: Number(f.data_limit_mb || 0),
                simultaneousDevices: Number(f.simultaneous_devices || 1),
                macLock: Boolean(f.mac_lock ?? true),
                popular: Boolean(f.popular),
                color: String(f.color || 'emerald'),
              }))
          : []
      );

      setStaff(
        Array.isArray(sRows)
          ? sRows
              .filter((s) => String(s.tenant_id || s.operator_id || '') === targetTenant)
              .map((s) => ({
                id: String(s.id),
                name: String(s.name),
                email: s.email ? String(s.email) : undefined,
                password: s.pin_hash ? String(s.pin_hash) : '1234',
                phone: String(s.phone || ''),
                zoneId: String(s.zone_id || ''),
                zoneName: String(s.zone_id || 'Zone Principale'),
                commissionRate: Number(s.commission_rate || 10),
                balanceCredit: Number(s.balance_credit_xof || 0),
                dailyGoal: Number(s.daily_goal_xof || 15000),
                todaySales: Number(s.today_sales_xof || 0),
                totalSales: Number(s.total_sales_xof || 0),
                active: Boolean(s.active ?? true),
                lastActive: 'En ligne',
                permissions: s.permissions || { fastSale: true, printThermal: true, shareWhatsapp: true, sosRequest: true },
              }))
          : []
      );

      setTickets(
        Array.isArray(tRows)
          ? tRows
              .filter((t) => t && t.code && String(t.tenant_id || t.operator_id || '') === targetTenant)
              .map((r, idx) => ({
                id: String(r.id || `t-db-${idx}-${r.code}`),
                code: String(r.code),
                pin: String(r.pin || r.code),
                password: String(r.password || r.code),
                forfaitId: String(r.forfait_id || 'Pass WiFi'),
                forfaitName: String(r.forfait_id || 'Pass WiFi'),
                price: Number(r.price_xof || 0),
                duration: String(r.duration_label || '24h'),
                status: (r.status as any) || 'stock',
                createdAt: String(r.created_at || new Date().toISOString()),
                activatedAt: r.activated_at ? String(r.activated_at) : undefined,
                expiresAt: r.expires_at ? String(r.expires_at) : undefined,
                customerPhone: r.customer_phone ? String(r.customer_phone) : undefined,
                sellerId: r.seller_id ? String(r.seller_id) : undefined,
                sellerName: r.seller_id ? String(r.seller_id) : undefined,
                zoneName: String(r.zone_id || 'Zone Principale'),
                batchId: r.batch_id ? String(r.batch_id) : undefined,
              }))
          : []
      );

      setMacBypasses(
        Array.isArray(mRows)
          ? mRows
              .filter((m) => String(m.tenant_id || m.operator_id || '') === targetTenant)
              .map((m) => ({
                id: String(m.id),
                macAddress: String(m.mac_address),
                label: String(m.label || ''),
                category: (m.category as any) || 'VIP',
                bindingType: (m.binding_type as any) || 'bypassed',
                autoCookie: Boolean(m.auto_cookie ?? true),
                expiryType: (m.expiry_type as any) || 'permanent',
                status: (m.status as any) || 'active',
                addedAt: String(m.added_at || new Date().toISOString()),
              }))
          : []
      );

      setSessions(
        Array.isArray(sesRows)
          ? sesRows
              .filter((s) => String(s.tenant_id || s.operator_id || '') === targetTenant)
              .map((s) => ({
                id: String(s.id),
                username: String(s.username),
                ipAddress: String(s.ip_address || '10.5.50.10'),
                macAddress: String(s.mac_address || ''),
                routerId: String(s.router_id || ''),
                routerName: String(s.router_id || 'Routeur MikroTik'),
                uptimeMinutes: Number(s.uptime_minutes || 0),
                bytesInMb: Number(s.bytes_in_mb || 0),
                bytesOutMb: Number(s.bytes_out_mb || 0),
                forfaitName: String(s.forfait_name || 'Hotspot'),
                signalDbm: Number(s.signal_dbm || -60),
                suspended: false,
                deviceType: (s.device_type as any) || 'smartphone',
              }))
          : []
      );

      setTransactions(
        Array.isArray(txRows)
          ? txRows
              .filter((tx) => String(tx.tenant_id || tx.operator_id || '') === targetTenant)
              .map((tx) => ({
                id: String(tx.id),
                timestamp: String(tx.created_at || new Date().toISOString()),
                type: (tx.type as any) || 'credit',
                amount: Number(tx.amount_xof || 0),
                category: (tx.category as any) || 'Recharge Mobile Money',
                reference: String(tx.reference || ''),
                paymentMethod: (tx.payment_method as any) || 'Wave',
                status: (tx.status as any) || 'completed',
              }))
          : []
      );
    } catch {
      // Ignore network errors
    }
  };

  useEffect(() => {
    if (user?.tenantId) {
      void loadTenantWorkspace(user.tenantId);
    }
  }, [user?.tenantId]);

  const formatMoney = (rawAmount: number): string => {
    const amountInXof = Number(rawAmount || 0);
    switch (currency) {
      case 'XOF':
        return `${amountInXof.toLocaleString('fr-FR')} FCFA`;
      case 'GNF': {
        const gnf = Math.round(amountInXof * 14.2);
        return `${gnf.toLocaleString('fr-FR')} GNF`;
      }
      case 'EUR': {
        const eur = (amountInXof / 655.957).toFixed(2);
        return `${eur} €`;
      }
      case 'USD': {
        const usd = (amountInXof / 600).toFixed(2);
        return `$${usd}`;
      }
      default:
        return `${amountInXof.toLocaleString('fr-FR')} FCFA`;
    }
  };

  const addAuditLog = (action: string, target: string, details: string) => {
    const newLog: AuditLogItem = {
      id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      timestamp: new Date().toISOString(),
      user: user?.email || operatorProfile.email || 'admin@joowifi.pro',
      action,
      target,
      details,
      ip: '41.207.33.19',
    };
    setAuditLogs((prev) => [newLog, ...prev]);
    if (isSupabaseConfigured()) {
      void supabaseInsert('audit_logs', {
        operator_id: OP_ID,
        user_email: newLog.user,
        action,
        target,
        details,
        ip_address: newLog.ip,
      });
    }
  };

  const generateTicketsBatch = (
    forfaitId: string,
    quantity: number,
    prefix: string = 'JW',
    channel: 'stock' | 'papier' = 'stock'
  ): TicketItem[] => {
    const forfait = forfaits.find((f) => f.id === forfaitId);
    if (!forfait) return [];

    const newTickets: TicketItem[] = [];
    const batchId = `LOT-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(
      100 + Math.random() * 900
    )}`;

    for (let i = 0; i < quantity; i++) {
      const random4 = Math.floor(1000 + Math.random() * 9000);
      const random3 = Math.floor(100 + Math.random() * 900);
      const code = `${prefix}-${random4}-${random3}`;
      const pin = `${random4}`;

      newTickets.push({
        id: `t-${Date.now()}-${i}`,
        code,
        pin,
        forfaitId: forfait.id,
        forfaitName: forfait.name,
        price: forfait.price,
        duration: `${forfait.durationHours}h`,
        status: channel,
        createdAt: new Date().toISOString(),
        zoneName: zones[0]?.name || 'Cocody - Angré 8ème Tranche',
        batchId,
      });
    }

    setTickets((prev) => [...newTickets, ...prev]);
    syncTicketsToSupabase(newTickets);
    if (newTickets.length > 0) {
      const profName = forfait.name.toLowerCase().includes('vip') ? 'joowifi-vip' : 'joowifi-standard';
      const batchScript = newTickets
        .map(
          (t) =>
            `:do { /ip hotspot user add name="${t.code}" password="${t.code}" profile="${profName}" limit-uptime="${forfait.durationHours}h" comment="JW:${forfait.name} (${forfait.price}F)" } on-error={}`
        )
        .join('\n');
      enqueueRouterCommand('ADD_TICKET', batchScript);
    }
    addAuditLog(
      'Génération de tickets',
      `Lot ${batchId} (${quantity} tickets)`,
      `Forfait: ${forfait.name} (${forfait.price} FCFA) - Type: ${channel}`
    );

    return newTickets;
  };

  const sellTicketPOS = (
    forfaitId: string,
    customerPhone?: string,
    sellerId: string = 'staff-1'
  ): TicketItem => {
    const forfait = forfaits.find((f) => f.id === forfaitId);
    if (!forfait) throw new Error('Forfait not found');

    const activeStaff = staff.find((s) => s.id === sellerId) || staff[0];
    const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
    let shortCode = '';
    for (let i = 0; i < 4; i++) {
      shortCode += chars[Math.floor(Math.random() * chars.length)];
    }
    const code = shortCode;
    const pin = `${Math.floor(1000 + Math.random() * 9000)}`;

    const newTicket: TicketItem = {
      id: `t-pos-${Date.now()}`,
      code,
      pin,
      forfaitId: forfait.id,
      forfaitName: forfait.name,
      price: forfait.price,
      duration: `${forfait.durationHours}h`,
      status: 'actif',
      createdAt: new Date().toISOString(),
      activatedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + forfait.durationHours * 3600 * 1000).toISOString(),
      customerPhone,
      sellerId: activeStaff.id,
      sellerName: activeStaff.name,
      zoneName: activeStaff.zoneName,
    };

    setTickets((prev) => [newTicket, ...prev]);
    syncTicketsToSupabase([newTicket]);

    setStaff((prev) =>
      prev.map((s) =>
        s.id === activeStaff.id
          ? {
              ...s,
              todaySales: s.todaySales + forfait.price,
              totalSales: s.totalSales + forfait.price,
              balanceCredit: Math.max(0, s.balanceCredit - forfait.price),
              lastActive: 'À l’instant',
            }
          : s
      )
    );

    setZones((prev) =>
      prev.map((z) =>
        z.id === activeStaff.zoneId || z.name === activeStaff.zoneName
          ? {
              ...z,
              monthlyRevenue: z.monthlyRevenue + forfait.price,
              todaySales: (z.todaySales || 0) + forfait.price,
              activeTicketsCount: z.activeTicketsCount + 1,
            }
          : z
      )
    );

    const posProfName = forfait.name.toLowerCase().includes('vip') ? 'joowifi-vip' : 'joowifi-standard';
    enqueueRouterCommand(
      'ADD_TICKET',
      `:do { /ip hotspot user add name="${newTicket.code}" password="${newTicket.code}" profile="${posProfName}" limit-uptime="${forfait.durationHours}h" comment="JW:POS ${activeStaff.name} (${forfait.price}F)" } on-error={}`,
      activeStaff.zoneName
    );
    addAuditLog(
      'Vente Caisse POS',
      `Ticket ${newTicket.code}`,
      `Vendeur: ${activeStaff.name} - Client: ${customerPhone || 'Anonyme'} - Montant: ${forfait.price} FCFA`
    );

    return newTicket;
  };

  const simulateDirectMomoPurchase = (
    forfaitId: string,
    phone: string,
    provider: string
  ): TicketItem => {
    const forfait = forfaits.find((f) => f.id === forfaitId) || forfaits[0];
    const code = `JW-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(100 + Math.random() * 900)}`;
    const newTicket: TicketItem = {
      id: `t-momo-${Date.now()}`,
      code,
      pin: code.split('-')[1],
      forfaitId: forfait.id,
      forfaitName: forfait.name,
      price: forfait.price,
      duration: `${forfait.durationHours}h`,
      status: 'actif',
      createdAt: new Date().toISOString(),
      activatedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + forfait.durationHours * 3600 * 1000).toISOString(),
      customerPhone: phone,
      sellerName: `Portail Captif (${provider})`,
      zoneName: zones[0]?.name || 'Cocody - Angré 8ème Tranche',
    };

    setTickets((prev) => [newTicket, ...prev]);
    syncTicketsToSupabase([newTicket]);
    setGainsBalance((prev) => prev + forfait.price);

    const tx: WalletTransaction = {
      id: `tx-momo-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'credit',
      amount: forfait.price,
      category: 'Recharge Mobile Money',
      reference: `CAPTIVE-${provider.toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`,
      paymentMethod: provider as WalletTransaction['paymentMethod'],
      status: 'completed',
    };
    setTransactions((prev) => [tx, ...prev]);

    addAuditLog(
      'Achat Direct Portail Captif',
      `Ticket ${code} (${forfait.name})`,
      `Paiement ${provider} (${phone}) : +${forfait.price} FCFA crédités dans Mes Gains`
    );
    notify(`Paiement ${provider} de ${formatMoney(forfait.price)} reçu ! Ticket ${code} activé.`, 'success');

    return newTicket;
  };

  const updateTicket = (ticket: TicketItem) => {
    setTickets((prev) => prev.map((t) => (t.id === ticket.id ? ticket : t)));
    syncTicketsToSupabase([ticket]);
    addAuditLog('Modification Ticket', `Ticket ${ticket.code}`, `Statut: ${ticket.status} - Forfait: ${ticket.forfaitName}`);
  };

  const deleteTicket = (id: string) => {
    const target = tickets.find((t) => t.id === id);
    setTickets((prev) => prev.filter((t) => t.id !== id));
    if (target) {
      if (isSupabaseConfigured()) {
        void supabaseDelete('tickets', `code=eq.${encodeURIComponent(target.code)}`);
      }
      enqueueRouterCommand(
        'REMOVE_TICKET',
        `/ip hotspot user remove [find name="${target.code}"]`
      );
      addAuditLog('Suppression Ticket', `Ticket ${target.code}`, 'Supprimé par opérateur');
    }
  };

  const addCustomTicket = (ticket: TicketItem) => {
    setTickets((prev) => [ticket, ...prev]);
    syncTicketsToSupabase([ticket]);
    enqueueRouterCommand(
      'ADD_TICKET',
      `/ip hotspot user add name="${ticket.code}" password="${ticket.password || ticket.pin || ticket.code}" profile="jw-prof-${ticket.forfaitId}" limit-uptime="${ticket.duration}" comment="${ticket.forfaitName} (${ticket.price} FCFA)"`
    );
    addAuditLog('Création Ticket / Compte', `Ticket ${ticket.code}`, `Forfait: ${ticket.forfaitName} (${ticket.price} FCFA)`);
  };

  const disconnectSession = (sessionId: string) => {
    const session = sessions.find((s) => s.id === sessionId);
    if (!session) return;

    setSessions((prev) => prev.filter((s) => s.id !== sessionId));

    setConnectionLogs((prev) => [
      {
        id: `log-disc-${Date.now()}`,
        timestamp: new Date().toISOString(),
        username: session.username,
        macAddress: session.macAddress,
        routerName: session.routerName,
        status: 'failed',
        reason: 'Déconnexion asynchrone demandée par admin (Heartbeat 45s)',
      },
      ...prev,
    ]);

    enqueueRouterCommand(
      'DISCONNECT_SESSION',
      `/ip hotspot active remove [find user="${session.username}"]; /ip hotspot cookie remove [find mac-address="${session.macAddress}"]`,
      session.routerName
    );
    addAuditLog(
      'Déconnexion utilisateur',
      session.username,
      `Adresse MAC: ${session.macAddress} sur ${session.routerName}`
    );
    notify(`Ordre de déconnexion envoyé pour ${session.username}`, 'info');
  };

  const disconnectAllSessions = (routerId?: string) => {
    const toRemove = routerId
      ? sessions.filter((s) => s.routerId === routerId || s.routerName.includes(routerId))
      : sessions;

    if (toRemove.length === 0) return;

    setSessions((prev) =>
      routerId
        ? prev.filter((s) => s.routerId !== routerId && !s.routerName.includes(routerId))
        : []
    );

    addAuditLog(
      'Déconnexion massive',
      `${toRemove.length} abonnés`,
      `Ordre de terminaison broadcast envoyé vers ${routerId || 'tous les routeurs'}`
    );
    notify(`${toRemove.length} session(s) programmée(s) pour déconnexion au prochain Heartbeat.`, 'warning');
  };

  const refreshSessions = () => {
    if (OP_ID) {
      void loadTenantWorkspace(OP_ID);
    }
    setHeartbeatSecondsRemaining(45);
  };

  const authorizeHost = (hostId: string, forfaitId?: string) => {
    const host = physicalHosts.find((h) => h.id === hostId);
    if (!host) return;

    const forfait = forfaits.find((f) => f.id === forfaitId) || forfaits[0];
    const generatedUsername = `JW-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(100 + Math.random() * 900)}`;

    const newSession: ConnectedSession = {
      id: `sess-${Date.now()}`,
      username: generatedUsername,
      ipAddress: host.ipAddress,
      macAddress: host.macAddress,
      routerId: host.routerId,
      routerName: host.routerName,
      uptimeMinutes: 1,
      timeRemainingMinutes: (forfait?.durationHours || 1) * 60,
      bytesInMb: 1.2,
      bytesOutMb: 0.3,
      downloadRateKbps: (forfait?.downloadSpeedMbps || 2) * 1024,
      uploadRateKbps: (forfait?.uploadSpeedMbps || 1) * 1024,
      forfaitName: forfait?.name || 'Pass 1 Heure',
      signalDbm: host.signalDbm,
      suspended: false,
      authorized: true,
      deviceType: 'smartphone',
      connectedAt: new Date().toISOString(),
    };

    setSessions((prev) => [newSession, ...prev]);

    setPhysicalHosts((prev) =>
      prev.map((h) =>
        h.id === hostId
          ? { ...h, status: 'authenticated' as const, authorizedUsername: generatedUsername }
          : h
      )
    );

    addAuditLog(
      'Autorisation manuelle hôte',
      host.macAddress,
      `Assigné au forfait ${forfait.name} (${generatedUsername})`
    );
    notify(`Hôte ${host.macAddress} autorisé sur ${forfait.name}`, 'success');
  };

  const addRouter = (
    routerData: Omit<RouterItem, 'id' | 'lastHeartbeat' | 'installToken'> & {
      installToken?: string;
      id?: string;
    }
  ) => {
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const newToken =
      routerData.installToken && routerData.installToken.trim() !== ''
        ? routerData.installToken.trim()
        : `JWT-${randomSuffix}-JG37-${Math.floor(10 + Math.random() * 89)}K2`;
    const newRouter: RouterItem = {
      ...routerData,
      id: routerData.id || `rb-${Date.now()}`,
      lastHeartbeat: new Date().toISOString(),
      installToken: newToken,
    };
    setRouters((prev) => {
      const filtered = prev.filter((r) => r.installToken !== newToken);
      const next = [...filtered, newRouter];
      syncRoutersToSupabase(next);
      return next;
    });
    addAuditLog('Ajout Routeur', newRouter.name, `Token: ${newToken} - Zone: ${newRouter.zoneName}`);
  };

  const rebootRouter = (routerId: string) => {
    const target = routers.find((r) => r.id === routerId);
    setRouters((prev) =>
      prev.map((r) =>
        r.id === routerId
          ? {
              ...r,
              uptime: '00j 00h 01m',
              lastHeartbeat: new Date().toISOString(),
              cpuUsage: 15,
            }
          : r
      )
    );
    enqueueRouterCommand(
      'REBOOT_ROUTER',
      `:log warning "Joowifi Cloud: Redemarrage demande par admin"; /system reboot`,
      target?.name || routerId
    );
    addAuditLog('Redémarrage Routeur', target?.name || routerId, 'Ordre asynchrone envoyé via Heartbeat (RouterOS /system reboot)');
    notify(`Ordre de redémarrage envoyé à ${target?.name || routerId} (Heartbeat 45s)`, 'info');
  };

  const updateRouter = (id: string, updates: Partial<RouterItem>) => {
    setRouters((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates } : r)));
    addAuditLog('Modification Routeur', id, `Mise à jour: ${Object.keys(updates).join(', ')}`);
  };

  const deleteRouter = (id: string) => {
    const target = routers.find((r) => r.id === id);
    setRouters((prev) => prev.filter((r) => r.id !== id));
    addAuditLog('Suppression Routeur', target?.name || id, 'Routeur désappairé de la console');
  };

  const reconcileProfiles = async (): Promise<{ success: boolean; profilesCount: number; message: string }> => {
    await new Promise((res) => setTimeout(res, 900));
    const nowTime = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    setRouters((prev) =>
      prev.map((r) => ({
        ...r,
        syncedProfilesCount: forfaits.length,
        lastSyncTime: `Aujourd'hui ${nowTime}`,
      }))
    );
    addAuditLog('Réconciliation Profils', 'Tous les routeurs', `${forfaits.length} profils Hotspot propagés vers RouterOS`);
    notify(`${forfaits.length} profils Hotspot synchronisés sur ${routers.length} routeur(s).`, 'success');
    return {
      success: true,
      profilesCount: forfaits.length,
      message: `${forfaits.length} profils de forfaits synchronisés avec succès sur le parc MikroTik.`,
    };
  };

  const pingRouter = async (routerId: string): Promise<{ success: boolean; latencyMs: number }> => {
    await new Promise((res) => setTimeout(res, 450));
    const latency = Math.floor(14 + Math.random() * 22);
    setRouters((prev) =>
      prev.map((r) =>
        r.id === routerId
          ? {
              ...r,
              lastHeartbeat: new Date().toISOString(),
              status: 'online',
            }
          : r
      )
    );
    return { success: true, latencyMs: latency };
  };

  const regenerateRouterToken = (routerId: string): string => {
    const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const randPart = (len: number) =>
      Array.from({ length: len }, () => letters[Math.floor(Math.random() * letters.length)]).join('');
    const newToken = `JWT-${randPart(4)}-${randPart(4)}-${randPart(4)}`;
    setRouters((prev) =>
      prev.map((r) => (r.id === routerId ? { ...r, installToken: newToken } : r))
    );
    addAuditLog('Régénération Jeton', routerId, `Nouveau token généré: ${newToken}`);
    return newToken;
  };

  const addZone = (
    zoneData: Omit<ZoneItem, 'id' | 'routerCount' | 'activeTicketsCount' | 'monthlyRevenue'> & {
      initialRouterId?: string;
    }
  ) => {
    const id = `zone-${Date.now()}`;
    const newZone: ZoneItem = {
      id,
      name: zoneData.name,
      city: zoneData.city,
      country: zoneData.country || "Côte d'Ivoire",
      description: zoneData.description || '',
      routerCount: zoneData.initialRouterId ? 1 : 0,
      activeTicketsCount: 0,
      monthlyRevenue: 0,
      status: 'active',
      siteType: zoneData.siteType || 'residentiel',
      activeSubscribers: 0,
      todaySales: 0,
      subscriptionExpiry: '08/11/2026',
      subscriptionPriceMonthly: 5000,
      ispMonthlyCost: zoneData.ispMonthlyCost || 25000,
      createdAt: new Date().toISOString().slice(0, 10),
    };

    setZones((prev) => { const next = [...prev, newZone]; syncZonesToSupabase(next); return next; });

    if (zoneData.initialRouterId) {
      setRouters((prev) =>
        prev.map((r) =>
          r.id === zoneData.initialRouterId
            ? { ...r, zoneId: id, zoneName: zoneData.name }
            : r
        )
      );
    }

    addAuditLog('Ouverture de Zone', newZone.name, `Emplacement créé avec succès (${newZone.city})`);
  };

  const updateZone = (updated: ZoneItem) => {
    setZones((prev) => prev.map((z) => (z.id === updated.id ? updated : z)));
    addAuditLog('Mise à jour Zone', updated.name, 'Paramètres actualisés');
  };

  const deleteZone = (id: string) => {
    const target = zones.find((z) => z.id === id);
    setZones((prev) => prev.filter((z) => z.id !== id));
    if (target) {
      void supabaseDelete('zones', `name=eq.${encodeURIComponent(target.name)}`);
      addAuditLog('Suppression Zone', target.name, 'Zone retirée ou archivée');
    }
  };

  const purchaseZonePack = (packName: string, zonesCount: number, priceMonthly: number): boolean => {
    if (walletBalance < priceMonthly) {
      notify(
        `Solde insuffisant dans votre portefeuille Joowifi Pay (${formatMoney(walletBalance)}). Requis : ${formatMoney(priceMonthly)}.`,
        'error'
      );
      return false;
    }
    setWalletBalance((prev) => prev - priceMonthly);
    const tx: WalletTransaction = {
      id: `tx-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'debit',
      amount: priceMonthly,
      category: 'Abonnement SaaS',
      reference: `PACK-ZONE-${zonesCount}-${new Date().toISOString().slice(0, 7)}`,
      status: 'completed',
    };
    setTransactions((prev) => [tx, ...prev]);
    addAuditLog('Achat Pack Zones', packName, `Ajout de ${zonesCount} zone(s) - Débit: ${priceMonthly} FCFA`);
    notify(`Pack ${packName} activé avec succès !`, 'success');
    return true;
  };

  const addForfait = (forfaitData: Omit<ForfaitItem, 'id'>) => {
    const newForfait: ForfaitItem = {
      ...forfaitData,
      id: `f-${Date.now()}`,
    };
    setForfaits((prev) => { const next = [...prev, newForfait]; syncForfaitsToSupabase(next); return next; });
    addAuditLog('Création Forfait', newForfait.name, `Prix: ${newForfait.price} FCFA`);
    notify(`Forfait "${newForfait.name}" créé.`, 'success');
  };

  const updateForfait = (idOrForfait: string | ForfaitItem, updates?: Partial<ForfaitItem>) => {
    if (typeof idOrForfait === 'string') {
      setForfaits((prev) =>
        prev.map((f) => (f.id === idOrForfait ? { ...f, ...(updates || {}) } : f))
      );
      notify(`Forfait mis à jour avec succès.`, 'success');
    } else {
      setForfaits((prev) => prev.map((f) => (f.id === idOrForfait.id ? idOrForfait : f)));
      addAuditLog('Mise à jour Forfait', idOrForfait.name, `Prix: ${idOrForfait.price} FCFA`);
      notify(`Forfait "${idOrForfait.name}" mis à jour.`, 'success');
    }
  };

  const deleteForfait = (id: string) => {
    const item = forfaits.find((f) => f.id === id);
    setForfaits((prev) => prev.filter((f) => f.id !== id));
    if (item) {
      void supabaseDelete('forfaits', `name=eq.${encodeURIComponent(item.name)}`);
      addAuditLog('Suppression Forfait', item.name, 'Forfait retiré du catalogue');
      notify(`Forfait "${item.name}" supprimé.`, 'info');
    }
  };

  const addStaff = (memberData: Omit<StaffItem, 'id' | 'totalSales' | 'todaySales'>) => {
    const cleanEmail = (memberData.email || '').trim().toLowerCase();
    const cleanPass = (memberData.password || '1234').trim();
    const newStaff: StaffItem = {
      ...memberData,
      email: cleanEmail,
      password: cleanPass,
      id: `staff-${Date.now()}`,
      todaySales: 0,
      totalSales: 0,
      paidCommissions: 0,
    };
    setStaff((prev) => {
      const next = [...prev, newStaff];
      syncStaffToSupabase(next);
      return next;
    });
    if (cleanEmail && cleanPass) {
      void supabaseAuthSignUp(cleanEmail, cleanPass, {
        role: 'vendor',
        tenant_id: OP_ID,
        name: newStaff.name,
        phone: newStaff.phone,
      });
    }
    addAuditLog('Ajout Vendeur', newStaff.name, `Zone: ${newStaff.zoneName} - Identifiant: ${cleanEmail || newStaff.phone}`);
    notify(`Compte Vendeur POS "${newStaff.name}" créé et activé dans Supabase Auth !`, 'success');
  };

  const updateStaff = (updated: StaffItem) => {
    const cleanEmail = (updated.email || '').trim().toLowerCase();
    const cleanPass = (updated.password || '1234').trim();
    const normalized: StaffItem = {
      ...updated,
      email: cleanEmail,
      password: cleanPass,
    };
    setStaff((prev) => {
      const next = prev.map((s) => (s.id === normalized.id ? normalized : s));
      syncStaffToSupabase(next);
      return next;
    });
    if (OP_ID) {
      void supabaseUpdate(
        'staff_vendors',
        `id=eq.${encodeURIComponent(normalized.id)}`,
        {
          name: normalized.name,
          email: cleanEmail || null,
          phone: normalized.phone,
          pin_hash: cleanPass,
          zone_id: normalized.zoneName || normalized.zoneId,
          commission_rate: Number(normalized.commissionRate || 10),
          balance_credit_xof: Math.max(0, Math.round(Number(normalized.balanceCredit || 0))),
          daily_goal_xof: Math.round(Number(normalized.dailyGoal || 15000)),
          active: Boolean(normalized.active),
          permissions: normalized.permissions || {
            fastSale: true,
            printThermal: true,
            shareWhatsapp: true,
            sosRequest: true,
          },
        },
        OP_ID
      );
    }
    addAuditLog('Modification Vendeur', normalized.name, `Zone: ${normalized.zoneName} - Commission: ${normalized.commissionRate}%`);
    notify(`Profil vendeur "${normalized.name}" mis à jour et synchronisé avec Supabase !`, 'success');
  };

  const toggleStaffStatus = (staffId: string) => {
    const member = staff.find((s) => s.id === staffId);
    if (!member) return;
    const nextActive = !member.active;
    setStaff((prev) =>
      prev.map((s) => (s.id === staffId ? { ...s, active: nextActive } : s))
    );
    addAuditLog(
      nextActive ? 'Réactivation Vendeur' : 'Suspension Vendeur',
      member.name,
      nextActive ? 'Accès caisse POS rétabli' : 'Accès caisse POS suspendu temporairement'
    );
    notify(
      nextActive ? `Accès POS de ${member.name} réactivé.` : `Accès POS de ${member.name} suspendu.`,
      nextActive ? 'success' : 'warning'
    );
  };

  const deleteStaff = (staffId: string) => {
    const member = staff.find((s) => s.id === staffId);
    setStaff((prev) => prev.filter((s) => s.id !== staffId));
    if (member) {
      void supabaseDelete('staff_vendors', `name=eq.${encodeURIComponent(member.name)}`);
      addAuditLog('Suppression Vendeur', member.name, `Retiré de la zone ${member.zoneName}`);
      notify(`Vendeur "${member.name}" supprimé.`, 'info');
    }
  };

  const rechargeStaff = (staffId: string, amount: number) => {
    setStaff((prev) =>
      prev.map((s) => (s.id === staffId ? { ...s, balanceCredit: s.balanceCredit + amount } : s))
    );
    const member = staff.find((s) => s.id === staffId);
    addAuditLog(
      'Recharge Vendeur',
      member?.name || staffId,
      `Recharge de ${amount} FCFA de crédit d’émission de tickets`
    );
    notify(`Crédit de ${formatMoney(amount)} ajouté pour ${member?.name || 'le vendeur'}.`, 'success');
  };

  const payStaffCommission = (staffId: string, amount: number): boolean => {
    const member = staff.find((s) => s.id === staffId);
    if (!member || amount <= 0) return false;
    if (walletBalance < amount) {
      notify(
        `Solde Portefeuille Joowifi Pay insuffisant (${formatMoney(walletBalance)}) pour régler cette commission.`,
        'error'
      );
      return false;
    }

    setWalletBalance((prev) => prev - amount);
    setStaff((prev) =>
      prev.map((s) =>
        s.id === staffId
          ? { ...s, paidCommissions: (s.paidCommissions || 0) + amount }
          : s
      )
    );

    const tx: WalletTransaction = {
      id: `tx-comm-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'debit',
      amount,
      category: 'Commission Staff',
      reference: `COMM-${member.name.slice(0, 4).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
      paymentMethod: 'Wave',
      status: 'completed',
    };
    setTransactions((prev) => [tx, ...prev]);
    addAuditLog(
      'Paiement Commission Vendeur',
      member.name,
      `Reversement de ${amount} FCFA vers ${member.phone}`
    );
    notify(`Commission de ${formatMoney(amount)} reversée à ${member.name} !`, 'success');
    return true;
  };

  const addMacBypass = (
    macOrItem: string | (Partial<MacBypassItem> & { macAddress: string; label: string }),
    label?: string,
    category: MacBypassItem['category'] = 'VIP',
    comment?: string
  ) => {
    let newItem: MacBypassItem;
    if (typeof macOrItem === 'object') {
      const formattedMac = macOrItem.macAddress.trim().toUpperCase();
      newItem = {
        id: `mac-${Date.now()}`,
        macAddress: formattedMac,
        label: macOrItem.label.trim(),
        routerId: macOrItem.routerId || 'all',
        routerName: macOrItem.routerName || 'Tous les routeurs (Global)',
        category: macOrItem.category || 'VIP',
        autoCookie: macOrItem.autoCookie ?? true,
        forfaitId: macOrItem.forfaitId || 'bypass-unlimited',
        forfaitName: macOrItem.forfaitName || 'Bypass Total (Débit Max)',
        bindingType: macOrItem.bindingType || 'bypassed',
        expiryType: macOrItem.expiryType || 'permanent',
        expiresAt: macOrItem.expiresAt || 'Permanent',
        status: macOrItem.status || 'active',
        deviceVendor: macOrItem.deviceVendor || '',
        lastSeen: 'Inscrit à l’instant',
        addedAt: new Date().toISOString().slice(0, 10),
        comment: macOrItem.comment || '',
      };
    } else {
      const formattedMac = macOrItem.trim().toUpperCase();
      newItem = {
        id: `mac-${Date.now()}`,
        macAddress: formattedMac,
        label: label?.trim() || 'Appareil Sans Nom',
        routerId: 'all',
        routerName: 'Tous les routeurs (Global)',
        category: category || 'VIP',
        autoCookie: true,
        forfaitId: 'bypass-unlimited',
        forfaitName: 'Bypass Total (Débit Max)',
        bindingType: 'bypassed',
        expiryType: 'permanent',
        expiresAt: 'Permanent',
        status: 'active',
        lastSeen: 'Inscrit à l’instant',
        addedAt: new Date().toISOString().slice(0, 10),
        comment: comment || '',
      };
    }

    setMacBypasses((prev) => [newItem, ...prev]);
    enqueueRouterCommand(
      'ADD_MAC_BYPASS',
      `/ip hotspot ip-binding add mac-address="${newItem.macAddress}" type=${newItem.bindingType || 'bypassed'} comment="Joowifi: ${newItem.label}"`,
      newItem.routerName || 'Tous les routeurs (Parc Global)'
    );
    addAuditLog('Ajout MAC Bypass', newItem.macAddress, `RouterOS IP-Binding: ${newItem.bindingType} - ${newItem.label}`);
  };

  const updateMacBypass = (id: string, updates: Partial<MacBypassItem>) => {
    setMacBypasses((prev) => prev.map((m) => (m.id === id ? { ...m, ...updates } : m)));
    const target = macBypasses.find((m) => m.id === id);
    if (target) {
      addAuditLog('Modification MAC Bypass', target.macAddress, `Mise à jour: ${Object.keys(updates).join(', ')}`);
    }
  };

  const toggleMacBypassStatus = (id: string) => {
    setMacBypasses((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m;
        const newStatus: 'active' | 'disabled' = m.status === 'disabled' ? 'active' : 'disabled';
        const newBinding: 'bypassed' | 'blocked' = newStatus === 'active' ? 'bypassed' : 'blocked';
        return { ...m, status: newStatus, bindingType: newBinding };
      })
    );
  };

  const deleteMacBypass = (id: string) => {
    const item = macBypasses.find((m) => m.id === id);
    setMacBypasses((prev) => prev.filter((m) => m.id !== id));
    if (item) {
      void supabaseDelete('mac_bypasses', `mac_address=eq.${encodeURIComponent(item.macAddress)}`);
      addAuditLog('Suppression MAC Bypass', item.macAddress, item.label);
    }
  };

  const rechargeWallet = (amount: number, method: WalletTransaction['paymentMethod'] = 'Wave') => {
    setWalletBalance((prev) => prev + amount);
    const tx: WalletTransaction = {
      id: `tx-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'credit',
      amount,
      category: 'Recharge Mobile Money',
      reference: `${method?.toUpperCase().slice(0, 4)}-CI-${Math.floor(100000 + Math.random() * 900000)}`,
      paymentMethod: method,
      status: 'completed',
    };
    setTransactions((prev) => [tx, ...prev]);
    addAuditLog('Recharge Portefeuille', `${amount} FCFA`, `Moyen: ${method}`);
    notify(`Portefeuille Joowifi Pay crédité de ${formatMoney(amount)} via ${method}.`, 'success');
  };

  const withdrawGains = (
    amount: number,
    phone: string,
    provider: 'Orange' | 'MTN' | 'Wave' | 'Moov'
  ): boolean => {
    if (amount > gainsBalance) {
      notify('Solde de gains insuffisant pour ce montant de retrait.', 'error');
      return false;
    }
    setGainsBalance((prev) => prev - amount);
    const tx: WalletTransaction = {
      id: `tx-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'debit',
      amount,
      category: 'Retrait Gains',
      reference: `RETRAIT-${provider.toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`,
      paymentMethod: (provider === 'Wave' ? 'Wave' : `${provider} Money`) as WalletTransaction['paymentMethod'],
      status: 'completed',
    };
    setTransactions((prev) => [tx, ...prev]);
    addAuditLog(
      'Retrait de Gains',
      `${amount} FCFA vers ${provider} (${phone})`,
      'Paiement direct Mobile Money initié'
    );
    notify(`Virement de ${formatMoney(amount)} initié vers ${provider} (${phone}).`, 'success');
    return true;
  };

  const upgradePlan = (planId: PlanDetails['id']): boolean => {
    const selected = SAAS_PLANS.find((p) => p.id === planId);
    if (!selected) return false;

    if (walletBalance < selected.priceMonthly) {
      notify(
        `Solde insuffisant dans votre portefeuille Joowifi Pay (${formatMoney(walletBalance)}). Veuillez recharger au moins ${formatMoney(selected.priceMonthly)}.`,
        'error'
      );
      return false;
    }

    setWalletBalance((prev) => prev - selected.priceMonthly);
    setCurrentPlanId(planId);

    const tx: WalletTransaction = {
      id: `tx-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'debit',
      amount: selected.priceMonthly,
      category: 'Abonnement SaaS',
      reference: `PLAN-${planId.toUpperCase()}-${new Date().toISOString().slice(0, 7)}`,
      status: 'completed',
    };
    setTransactions((prev) => [tx, ...prev]);
    addAuditLog('Changement Abonnement SaaS', `Plan ${selected.name}`, `Montant prélevé: ${selected.priceMonthly} FCFA`);
    notify(`Abonnement basculé sur le Plan ${selected.name} !`, 'success');
    return true;
  };

  const updateTelegramConfig = (updates: Partial<TelegramConfig>) => {
    setTelegramConfig((prev) => ({ ...prev, ...updates }));
    addAuditLog('Configuration Telegram', 'Bot & Déclencheurs', 'Paramètres de notification mis à jour');
    notify('Paramètres Telegram Bot sauvegardés.', 'success');
  };

  const updateOperatorProfile = (updates: Partial<OperatorProfile>) => {
    setOperatorProfile((prev) => {
      const next = { ...prev, ...updates };
      if (user) {
        setUser({ ...user, name: next.name, email: next.email });
      }
      return next;
    });
    addAuditLog('Mise à jour Profil Opérateur', updates.company || operatorProfile.company, 'Informations de compte enregistrées');
    notify('Profil opérateur et préférences sauvegardés.', 'success');
  };

  const sosRechargeRequest = (staffId: string, amount: number) => {
    const member = staff.find((s) => s.id === staffId);
    const alertItem = {
      id: `sos-${Date.now()}`,
      staffName: member?.name || 'Vendeur de terrain',
      amount,
      time: 'À l’instant',
    };
    setPendingSosAlerts((prev) => [alertItem, ...prev]);
    addAuditLog('Demande SOS Recharge', member?.name || staffId, `Montant demandé: ${amount} FCFA`);
    notify(`Alerte SOS Recharge de ${formatMoney(amount)} envoyée à l'administrateur.`, 'info');
  };

  const clearSosAlert = (id: string) => {
    setPendingSosAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  // Auth Functions
  const openAuthModal = (mode: 'login' | 'register' = 'login') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const login = (
    email: string,
    role: 'admin' | 'staff' = 'admin',
    name: string = operatorProfile.name,
    staffId?: string,
    customTenantId?: string,
    isNewAccount?: boolean,
    customAccessToken?: string
  ) => {
    const resolvedTenant = (customTenantId || getActiveTenantId()).trim();
    if (!resolvedTenant) return;
    setActiveTenantId(resolvedTenant);
    setActiveTenantIdState(resolvedTenant);

    const tokenJwt =
      customAccessToken ||
      buildSignedSessionJwt({
        sub: staffId || resolvedTenant,
        email,
        role: role === 'staff' ? 'vendor' : 'admin',
        tenantId: resolvedTenant,
      });

    const newSession: UserSession = {
      email,
      role,
      name,
      staffId,
      tenantId: resolvedTenant,
      accessToken: tokenJwt,
    };
    setUser(newSession);
    safeSetStorage('joowifi_auth_user', newSession);
    setIsAuthModalOpen(false);

    // Réinitialiser immédiatement tous les compteurs à 0 (0 Routeur, 0 Vendeur, 0 Session, 0 FCFA)
    setZones([]);
    setRouters([]);
    setForfaits([]);
    setTickets([]);
    setStaff([]);
    setSessions([]);
    setPhysicalHosts([]);
    setConnectionLogs([]);
    setMacBypasses([]);
    setTransactions([]);
    setAuditLogs([]);
    setHeartbeatQueue([]);
    setPendingSosAlerts([]);
    setWalletBalance(0);
    setGainsBalance(0);

    if (!isNewAccount) {
      void loadTenantWorkspace(resolvedTenant);
    }

    if (role === 'staff') {
      setCurrentSpace('pos');
      notify(`Bienvenue sur votre Caisse POS, ${name} !`, 'success');
    } else {
      setCurrentSpace('admin');
      notify(`Espace Opérateur isolé ouvert (${name}).`, 'success');
    }
  };

  const logout = () => {
    setUser(null);
    safeSetStorage('joowifi_auth_user', null);
    setCurrentSpace('public');
    setPublicTab('home');
    notify('Session déconnectée en toute sécurité.', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        currentSpace,
        setCurrentSpace,
        publicTab,
        setPublicTab,
        adminTab,
        setAdminTab,
        currency,
        setCurrency,
        formatMoney,
        routers,
        zones,
        forfaits,
        tickets,
        staff,
        sessions,
        physicalHosts,
        connectionLogs,
        macBypasses,
        transactions,
        walletBalance,
        gainsBalance,
        currentPlanId,
        telegramConfig,
        operatorProfile,
        toasts,
        auditLogs,
        heartbeatSecondsRemaining,
        heartbeatQueue,
        forceHeartbeatSync,
        notify,
        showToast: notify,
        dismissToast,
        generateTicketsBatch,
        sellTicketPOS,
        simulateDirectMomoPurchase,
        updateTicket,
        deleteTicket,
        addCustomTicket,
        disconnectSession,
        disconnectAllSessions,
        refreshSessions,
        authorizeHost,
        addRouter,
        updateRouter,
        deleteRouter,
        rebootRouter,
        reconcileProfiles,
        pingRouter,
        regenerateRouterToken,
        addZone,
        updateZone,
        deleteZone,
        purchaseZonePack,
        addForfait,
        updateForfait,
        deleteForfait,
        addStaff,
        updateStaff,
        toggleStaffStatus,
        deleteStaff,
        rechargeStaff,
        payStaffCommission,
        addMacBypass,
        updateMacBypass,
        deleteMacBypass,
        toggleMacBypassStatus,
        rechargeWallet,
        withdrawGains,
        upgradePlan,
        updateTelegramConfig,
        updateOperatorProfile,
        addAuditLog,
        sosRechargeRequest,
        pendingSosAlerts,
        clearSosAlert,
        user,
        isAuthModalOpen,
        authMode,
        openAuthModal,
        closeAuthModal,
        login,
        logout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
