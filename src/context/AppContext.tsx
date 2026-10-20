import React, { createContext, useContext, useState, useEffect } from 'react';
import { isSupabaseConfigured, supabaseInsert, supabaseSelect, supabaseUpdate, supabaseDelete } from '../lib/supabase';
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
  CaptivePortalConfig,
  SavedPortalTemplate,
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
  INITIAL_CAPTIVE_CONFIG,
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
  | 'personnalisation'
  | 'marketplace'
  | 'marketplace-mes-templates'
  | 'notifications'
  | 'logs'
  | 'profil';

interface UserSession {
  name: string;
  email: string;
  role: 'admin' | 'staff';
  zoneId?: string;
}

const DEFAULT_SAVED_TEMPLATES: SavedPortalTemplate[] = [
  {
    id: 'tmpl-active-1',
    name: 'Abidjan Vibrant — Principal',
    description: 'Portail principal haute visibilité optimisé pour paiements Mobile Money (Wave, Orange, MTN) dans les carrefours et maquis.',
    category: 'Général & Populaire',
    author: 'Joo studio',
    isActive: true,
    updatedAt: 'Aujourd’hui',
    config: {
      ...INITIAL_CAPTIVE_CONFIG,
      templateId: 'abidjan-vibrant',
      primaryColor: '#F59E0B',
      backgroundColor: '#0B0F19',
      surfaceColor: 'rgba(15, 23, 42, 0.85)',
      textColor: '#F8FAFC',
    },
  },
  {
    id: 'tmpl-saved-2',
    name: 'Sunset Lounge & Hôtel',
    description: 'Design Glassmorphism chaleureux avec essai gratuit de 15 minutes activé pour résidences hôtelières et coworking.',
    category: 'Hôtels & Lounges',
    author: 'Joo studio',
    isActive: false,
    updatedAt: 'Il y a 2 jours',
    config: {
      ...INITIAL_CAPTIVE_CONFIG,
      scope: 'zone',
      targetZoneId: 'zone-1',
      templateId: 'sunset-glass',
      brandName: 'Joowifi Lounge & Suites',
      tagline: 'WiFi Fibre Très Haut Débit — Espace VIP',
      welcomeMessage: 'Bienvenue ! Profitez de 15 minutes offertes ou activez un pass illimité en 1 clic.',
      primaryColor: '#EA580C',
      backgroundColor: '#18181B',
      surfaceColor: 'rgba(39, 39, 42, 0.75)',
      textColor: '#FFFFFF',
      enableFreeTrial: true,
      freeTrialDurationMinutes: 15,
    },
  },
  {
    id: 'tmpl-saved-3',
    name: 'Express Gare & Cyber (< 10 Ko)',
    description: 'Portail ultra-léger en mode Émeraude pour connexion instantanée sur smartphones d’entrée de gamme.',
    category: 'Cybercafés & Gares',
    author: 'Joo studio',
    isActive: false,
    updatedAt: 'Il y a 5 jours',
    config: {
      ...INITIAL_CAPTIVE_CONFIG,
      scope: 'router',
      targetRouterId: 'rb-2',
      templateId: 'minimal-speed',
      brandName: 'Joowifi Express Gare',
      tagline: 'Connexion Instantanée Zero-Attente',
      welcomeMessage: 'Saisissez votre code ticket ou payez par Wave/Orange Money.',
      primaryColor: '#10B981',
      backgroundColor: '#020617',
      surfaceColor: '#0F172A',
      textColor: '#F8FAFC',
      enableFreeTrial: false,
    },
  },
];

const DEFAULT_TELEGRAM_CONFIG: TelegramConfig = {
  botToken: '718294021:AAH8e2910kdja812-7kL_2',
  chatId: '-100294810294',
  enabled: true,
  triggers: {
    routerDown: true,
    vendorLowCredit: true,
    dailyReport: true,
    momoPayment: true,
    highCpuWarning: true,
  },
};

const DEFAULT_OPERATOR_PROFILE: OperatorProfile = {
  name: 'Jean-Marc Koffi',
  company: 'Joo Studio Réseaux & Télécoms',
  email: 'joostudio.pro@gmail.com',
  phone: '+225 01 00 44 38 39',
  city: 'Abidjan (Cocody Angré)',
  country: "Côte d'Ivoire",
  defaultIspMonthlyCost: 50000,
  twoFactorEnabled: true,
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
  captiveConfig: CaptivePortalConfig;
  savedTemplates: SavedPortalTemplate[];
  telegramConfig: TelegramConfig;
  operatorProfile: OperatorProfile;
  toasts: ToastNotification[];
  auditLogs: AuditLogItem[];
  heartbeatSecondsRemaining: number;
  heartbeatQueue: HeartbeatCommandItem[];
  forceHeartbeatSync: () => void;

  // Notifications
  notify: (message: string, type?: ToastNotification['type']) => void;
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
  addRouter: (router: Omit<RouterItem, 'id' | 'lastHeartbeat' | 'installToken'>) => void;
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
  updateForfait: (forfait: ForfaitItem) => void;
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
  updateCaptiveConfig: (config: Partial<CaptivePortalConfig>) => void;
  savePortalTemplate: (name: string, description: string, category?: string, config?: CaptivePortalConfig) => SavedPortalTemplate;
  activatePortalTemplate: (templateId: string) => void;
  duplicatePortalTemplate: (templateId: string) => void;
  deletePortalTemplate: (templateId: string) => void;
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
  login: (email: string, role?: 'admin' | 'staff', name?: string) => void;
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

  // Core Data
  const [routers, setRouters] = useState<RouterItem[]>(() =>
    safeGetStorage('joowifi_routers', INITIAL_ROUTERS)
  );
  const [zones, setZones] = useState<ZoneItem[]>(() =>
    safeGetStorage('joowifi_zones', INITIAL_ZONES)
  );
  const [forfaits, setForfaits] = useState<ForfaitItem[]>(() =>
    safeGetStorage('joowifi_forfaits', INITIAL_FORFAITS)
  );
  const [tickets, setTickets] = useState<TicketItem[]>(() =>
    safeGetStorage('joowifi_tickets', INITIAL_TICKETS)
  );
  const [staff, setStaff] = useState<StaffItem[]>(() =>
    safeGetStorage('joowifi_staff', INITIAL_STAFF)
  );
  const [sessions, setSessions] = useState<ConnectedSession[]>(INITIAL_SESSIONS);
  const [physicalHosts, setPhysicalHosts] = useState<PhysicalWifiHost[]>(INITIAL_PHYSICAL_HOSTS);
  const [connectionLogs, setConnectionLogs] = useState<ConnectionLog[]>(INITIAL_LOGS);
  const [macBypasses, setMacBypasses] = useState<MacBypassItem[]>(() =>
    safeGetStorage('joowifi_mac_bypass', INITIAL_MAC_BYPASS)
  );
  const [transactions, setTransactions] = useState<WalletTransaction[]>(() =>
    safeGetStorage('joowifi_transactions', INITIAL_TRANSACTIONS)
  );
  const [walletBalance, setWalletBalance] = useState<number>(() =>
    safeGetStorage('joowifi_wallet', 44000)
  );
  const [gainsBalance, setGainsBalance] = useState<number>(() =>
    safeGetStorage('joowifi_gains', 182500)
  );
  const [currentPlanId, setCurrentPlanId] = useState<PlanDetails['id']>(() =>
    safeGetStorage('joowifi_plan', 'pro')
  );
  const [captiveConfig, setCaptiveConfig] = useState<CaptivePortalConfig>(() =>
    safeGetStorage('joowifi_captive_config', {
      ...INITIAL_CAPTIVE_CONFIG,
      primaryColor: '#F59E0B',
      backgroundColor: '#0B0F19',
    })
  );
  const [savedTemplates, setSavedTemplates] = useState<SavedPortalTemplate[]>(() =>
    safeGetStorage('joowifi_saved_templates', DEFAULT_SAVED_TEMPLATES)
  );
  const [telegramConfig, setTelegramConfig] = useState<TelegramConfig>(() =>
    safeGetStorage('joowifi_telegram', DEFAULT_TELEGRAM_CONFIG)
  );
  const [operatorProfile, setOperatorProfile] = useState<OperatorProfile>(() =>
    safeGetStorage('joowifi_profile', DEFAULT_OPERATOR_PROFILE)
  );
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(INITIAL_AUDIT_LOGS);
  const [heartbeatQueue, setHeartbeatQueue] = useState<HeartbeatCommandItem[]>([
    {
      id: 'hb-cmd-init-1',
      routerName: 'Tous les routeurs (Parc Global)',
      commandType: 'ADD_TICKET',
      routerOsCommand: '/ip hotspot user add name="r7gt" password="r7gt" profile="jw-prof-f-1" limit-uptime="1h" comment="POS Vente Eclair"',
      status: 'synced',
      createdAt: 'Il y a 2 min',
      syncedAt: 'Synchronisé (Pull 45s)',
    },
    {
      id: 'hb-cmd-init-2',
      routerName: 'MikroTik Cocody Angré',
      commandType: 'ADD_MAC_BYPASS',
      routerOsCommand: '/ip hotspot ip-binding add mac-address="B8:27:EB:45:12:90" type=bypassed comment="Joowifi: Caméra IP Entrée"',
      status: 'synced',
      createdAt: 'Il y a 8 min',
      syncedAt: 'Synchronisé (Pull 45s)',
    },
  ]);

  const OP_ID = '11111111-1111-1111-1111-111111111111';

  const syncOperatorToSupabase = () => {
    if (!isSupabaseConfigured()) return;
    void supabaseInsert(
      'operators',
      [
        {
          id: OP_ID,
          name: operatorProfile.name || 'Kouamé Konan',
          company: operatorProfile.company || 'Ivoire Hotspot Réseaux',
          email: operatorProfile.email || 'admin@joowifi.ci',
          password_hash: '$2b$12$JoowifiDemoHash2026Abidjan',
          phone: operatorProfile.phone || '+225 07 08 09 10 11',
          city: operatorProfile.city || 'Abidjan',
          country: operatorProfile.country || "Côte d'Ivoire",
          currency: currency || 'XOF',
          plan_id: currentPlanId || 'pro',
          wallet_balance_xof: Math.max(0, Math.round(Number(walletBalance || 0))),
          gains_balance_xof: Math.max(0, Math.round(Number(gainsBalance || 0))),
          default_isp_monthly_cost: Math.round(Number(operatorProfile.defaultIspCost || 50000)),
          two_factor_enabled: Boolean(operatorProfile.twoFactorEnabled),
          telegram_bot_token: telegramConfig.botToken || null,
          telegram_chat_id: telegramConfig.chatId || null,
          telegram_enabled: Boolean(telegramConfig.enabled),
          telegram_triggers: telegramConfig.triggers || {},
        },
      ],
      'email'
    );
  };

  const syncZonesToSupabase = (items: ZoneItem[]) => {
    if (!isSupabaseConfigured() || items.length === 0) return;
    const rows = items.map((z) => ({
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
    void supabaseInsert('tickets', rows, 'operator_id,code');

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
    if (!isSupabaseConfigured() || items.length === 0) return;
    const rows = items.map((s) => ({
      operator_id: OP_ID,
      zone_id: s.zoneName || s.zoneId || 'Kiosque Principal Joowifi',
      name: s.name,
      phone: s.phone,
      pin_hash: '1234',
      commission_rate: Number(s.commissionRate || 10),
      balance_credit_xof: Math.max(0, Math.round(Number(s.balanceCredit || 0))),
      daily_goal_xof: Math.round(Number(s.dailyGoal || 10000)),
      today_sales_xof: Math.round(Number(s.todaySales || 0)),
      total_sales_xof: Math.round(Number(s.totalSales || 0)),
      paid_commissions_xof: Math.round(Number(s.paidCommissions || 0)),
      active: Boolean(s.active),
    }));
    void supabaseInsert('staff_vendors', rows, 'operator_id,name');
  };

  const syncMacBypassesToSupabase = (items: MacBypassItem[]) => {
    if (!isSupabaseConfigured() || items.length === 0) return;
    const rows = items.map((m) => ({
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
    syncTicketsToSupabase(tickets);
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
        operator_id: '11111111-1111-1111-1111-111111111111',
        router_id: '33333333-3333-3333-3333-333333333331',
        command_type: commandType,
        routeros_script: routerOsCommand,
        status: 'pending',
      });
    }
  };

  const forceHeartbeatSync = () => {
    const nowStr = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setHeartbeatQueue((prev) =>
      prev.map((c) => (c.status === 'pending' ? { ...c, status: 'synced', syncedAt: `Pull OK à ${nowStr}` } : c))
    );
    setRouters((current) =>
      current.map((r) =>
        r.status === 'online'
          ? {
              ...r,
              lastHeartbeat: new Date().toISOString(),
            }
          : r
      )
    );
    syncAll12TablesToSupabase();
    setHeartbeatSecondsRemaining(45);
    notify(`Synchronisation Supabase (12 tables : ${tickets.length} tickets, ${staff.length} vendeurs, ${forfaits.length} forfaits) réussie !`, 'success');
  };

  // SOS Recharge alerts from field vendors
  const [pendingSosAlerts, setPendingSosAlerts] = useState<
    { id: string; staffName: string; amount: number; time: string }[]
  >([
    {
      id: 'sos-1',
      staffName: 'Moussa Bakayoko (Vendeur Ambulant)',
      amount: 10000,
      time: 'Il y a 5 min',
    },
  ]);

  // Auth State
  const [user, setUser] = useState<UserSession | null>({
    name: operatorProfile.name,
    email: operatorProfile.email,
    role: 'admin',
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // 45-second heartbeat ticker simulator (MikroTik Pull Model)
  const [heartbeatSecondsRemaining, setHeartbeatSecondsRemaining] = useState<number>(45);

  useEffect(() => {
    const timer = setInterval(() => {
      setHeartbeatSecondsRemaining((prev) => {
        if (prev <= 1) {
          const syncTime = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          setHeartbeatQueue((q) =>
            q.map((c) => (c.status === 'pending' ? { ...c, status: 'synced', syncedAt: `Pull 45s (${syncTime})` } : c))
          );
          setRouters((current) =>
            current.map((r) =>
              r.status === 'online'
                ? {
                    ...r,
                    lastHeartbeat: new Date().toISOString(),
                    cpuUsage: Math.min(
                      95,
                      Math.max(10, r.cpuUsage + Math.floor(Math.random() * 7 - 3))
                    ),
                    trafficDownMbps: Number(
                      Math.max(5, r.trafficDownMbps + (Math.random() * 4 - 2)).toFixed(1)
                    ),
                  }
                : r
            )
          );
          return 45;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Save changes to localStorage AND synchronize all 12 tables with Supabase
  useEffect(() => {
    safeSetStorage('joowifi_routers', routers);
    syncRoutersToSupabase(routers);
  }, [routers]);

  useEffect(() => {
    safeSetStorage('joowifi_zones', zones);
    syncZonesToSupabase(zones);
  }, [zones]);

  useEffect(() => {
    safeSetStorage('joowifi_forfaits', forfaits);
    syncForfaitsToSupabase(forfaits);
  }, [forfaits]);

  useEffect(() => {
    safeSetStorage('joowifi_tickets', tickets);
    syncTicketsToSupabase(tickets);
  }, [tickets]);

  useEffect(() => {
    safeSetStorage('joowifi_staff', staff);
    syncStaffToSupabase(staff);
  }, [staff]);

  useEffect(() => {
    safeSetStorage('joowifi_mac_bypass', macBypasses);
    syncMacBypassesToSupabase(macBypasses);
  }, [macBypasses]);

  useEffect(() => {
    safeSetStorage('joowifi_transactions', transactions);
    syncTransactionsToSupabase(transactions);
  }, [transactions]);

  useEffect(() => {
    syncSessionsToSupabase(sessions);
  }, [sessions]);

  useEffect(() => {
    safeSetStorage('joowifi_wallet', walletBalance);
    safeSetStorage('joowifi_gains', gainsBalance);
    safeSetStorage('joowifi_plan', currentPlanId);
    safeSetStorage('joowifi_telegram', telegramConfig);
    safeSetStorage('joowifi_profile', operatorProfile);
    safeSetStorage('joowifi_currency', currency);
    syncOperatorToSupabase();
  }, [walletBalance, gainsBalance, currentPlanId, telegramConfig, operatorProfile, currency]);

  useEffect(() => safeSetStorage('joowifi_captive_config', captiveConfig), [captiveConfig]);
  useEffect(() => safeSetStorage('joowifi_saved_templates', savedTemplates), [savedTemplates]);

  // Initial bidirectional sync on mount
  useEffect(() => {
    syncAll12TablesToSupabase();
  }, []);

  const formatMoney = (amountInXof: number): string => {
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
        operator_id: '11111111-1111-1111-1111-111111111111',
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
    setSessions((prev) =>
      prev.map((s) => ({
        ...s,
        uptimeMinutes: s.uptimeMinutes + 1,
        timeRemainingMinutes: s.timeRemainingMinutes ? Math.max(0, s.timeRemainingMinutes - 1) : undefined,
        bytesInMb: Number((s.bytesInMb + (Math.random() * 0.8 + 0.1)).toFixed(1)),
        bytesOutMb: Number((s.bytesOutMb + (Math.random() * 0.2 + 0.05)).toFixed(1)),
        downloadRateKbps: Math.floor(Math.random() * 2500 + 300),
        uploadRateKbps: Math.floor(Math.random() * 600 + 80),
      }))
    );
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

  const addRouter = (routerData: Omit<RouterItem, 'id' | 'lastHeartbeat' | 'installToken'>) => {
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const newToken = `JWT-${randomSuffix}-JG37-${Math.floor(10 + Math.random() * 89)}K2`;
    const newRouter: RouterItem = {
      ...routerData,
      id: `rb-${Date.now()}`,
      lastHeartbeat: new Date().toISOString(),
      installToken: newToken,
    };
    setRouters((prev) => [...prev, newRouter]);
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

    setZones((prev) => [...prev, newZone]);

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
    setForfaits((prev) => [...prev, newForfait]);
    addAuditLog('Création Forfait', newForfait.name, `Prix: ${newForfait.price} FCFA`);
    notify(`Forfait "${newForfait.name}" créé.`, 'success');
  };

  const updateForfait = (updated: ForfaitItem) => {
    setForfaits((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
    addAuditLog('Mise à jour Forfait', updated.name, `Prix: ${updated.price} FCFA`);
    notify(`Forfait "${updated.name}" mis à jour.`, 'success');
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
    const newStaff: StaffItem = {
      ...memberData,
      id: `staff-${Date.now()}`,
      todaySales: 0,
      totalSales: 0,
      paidCommissions: 0,
    };
    setStaff((prev) => [...prev, newStaff]);
    addAuditLog('Ajout Vendeur', newStaff.name, `Zone: ${newStaff.zoneName} - Téléphone: ${newStaff.phone}`);
    notify(`Vendeur POS "${newStaff.name}" ajouté à ${newStaff.zoneName}.`, 'success');
  };

  const updateStaff = (updated: StaffItem) => {
    setStaff((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    addAuditLog('Modification Vendeur', updated.name, `Zone: ${updated.zoneName} - Commission: ${updated.commissionRate}%`);
    notify(`Profil vendeur "${updated.name}" mis à jour.`, 'success');
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

  const updateCaptiveConfig = (config: Partial<CaptivePortalConfig>) => {
    setCaptiveConfig((prev) => {
      const next = { ...prev, ...config };
      setSavedTemplates((tmpls) =>
        tmpls.map((t) => (t.isActive ? { ...t, config: next, updatedAt: 'À l’instant' } : t))
      );
      return next;
    });
    addAuditLog('Personnalisation Portail', 'Mise à jour thème & paramètres', 'Sauvegarde Sandbox');
    notify('Configuration du portail captif publiée sur le Cloud MikroTik.', 'success');
  };

  const savePortalTemplate = (
    name: string,
    description: string,
    category: string = 'Personnalisé',
    customConfig?: CaptivePortalConfig
  ): SavedPortalTemplate => {
    const cfg = customConfig || captiveConfig;
    const newTmpl: SavedPortalTemplate = {
      id: `tmpl-${Date.now()}`,
      name,
      description,
      category,
      author: operatorProfile.company || 'Opérateur Joowifi',
      isActive: false,
      updatedAt: 'À l’instant',
      config: { ...cfg },
    };
    setSavedTemplates((prev) => [newTmpl, ...prev]);
    addAuditLog('Sauvegarde Template Portail', name, `Catégorie: ${category}`);
    notify(`Template "${name}" ajouté à Mes Templates.`, 'success');
    return newTmpl;
  };

  const activatePortalTemplate = (templateId: string) => {
    const target = savedTemplates.find((t) => t.id === templateId);
    if (!target) return;
    setSavedTemplates((prev) =>
      prev.map((t) => ({
        ...t,
        isActive: t.id === templateId,
      }))
    );
    setCaptiveConfig({ ...target.config });
    addAuditLog('Activation Template Portail', target.name, `Périmètre: ${target.config.scope}`);
    notify(`Template "${target.name}" activé en production !`, 'success');
  };

  const duplicatePortalTemplate = (templateId: string) => {
    const source = savedTemplates.find((t) => t.id === templateId);
    if (!source) return;
    const copy: SavedPortalTemplate = {
      ...source,
      id: `tmpl-${Date.now()}`,
      name: `${source.name} (Copie)`,
      isActive: false,
      updatedAt: 'À l’instant',
      config: { ...source.config },
    };
    setSavedTemplates((prev) => [copy, ...prev]);
    addAuditLog('Duplication Template Portail', copy.name, `Basé sur ${source.name}`);
    notify(`Template dupliqué sous "${copy.name}".`, 'info');
  };

  const deletePortalTemplate = (templateId: string) => {
    const target = savedTemplates.find((t) => t.id === templateId);
    if (!target) return;
    if (target.isActive) {
      notify('Impossible de supprimer le template actuellement actif en production.', 'warning');
      return;
    }
    setSavedTemplates((prev) => prev.filter((t) => t.id !== templateId));
    addAuditLog('Suppression Template Portail', target.name, 'Template retiré');
    notify(`Template "${target.name}" supprimé.`, 'info');
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

  const login = (email: string, role: 'admin' | 'staff' = 'admin', name: string = operatorProfile.name) => {
    setUser({ email, role, name });
    setIsAuthModalOpen(false);
    if (role === 'staff') {
      setCurrentSpace('pos');
      notify(`Bienvenue sur la Caisse POS, ${name} !`, 'success');
    } else {
      setCurrentSpace('admin');
      notify(`Connecté à la Console Cloud Joowifi (${name}).`, 'success');
    }
  };

  const logout = () => {
    setUser(null);
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
        captiveConfig,
        savedTemplates,
        telegramConfig,
        operatorProfile,
        toasts,
        auditLogs,
        heartbeatSecondsRemaining,
        heartbeatQueue,
        forceHeartbeatSync,
        notify,
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
        updateCaptiveConfig,
        savePortalTemplate,
        activatePortalTemplate,
        duplicatePortalTemplate,
        deletePortalTemplate,
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
