export type Currency = 'XOF' | 'GNF' | 'EUR' | 'USD';

export interface RouterItem {
  id: string;
  name: string;
  zoneId: string;
  zoneName: string;
  ipAddress: string;
  macAddress: string;
  routerOsVersion: string; // e.g. "v6.49.10" or "v7.12.1"
  status: 'online' | 'offline' | 'warning';
  lastHeartbeat: string; // ISO date
  uptime: string;
  cpuUsage: number; // percentage
  ramUsage: number; // percentage
  trafficDownMbps: number;
  trafficUpMbps: number;
  totalSubscribers: number;
  installToken: string;
  model?: string; // e.g. "MikroTik hEX S (RB760iGS)"
  cloudDns?: string; // e.g. "1f82029a8a7c.sn.mynetworkname.net"
  temperature?: number; // e.g. 42 (in °C)
  voltage?: number; // e.g. 24.2 (in V)
  diskFreeMb?: number; // e.g. 11.4
  syncedProfilesCount?: number;
  lastSyncTime?: string;
}

export interface ZoneItem {
  id: string;
  name: string;
  city: string;
  country: string;
  routerCount: number;
  activeTicketsCount: number;
  monthlyRevenue: number;
  description?: string;
  status?: 'active' | 'sleeping';
  siteType?: 'residentiel' | 'commerce' | 'hotel' | 'campus' | 'evenement' | string;
  activeSubscribers?: number;
  todaySales?: number;
  subscriptionExpiry?: string;
  subscriptionPriceMonthly?: number;
  ispMonthlyCost?: number;
  createdAt?: string;
}

export interface ForfaitItem {
  id: string;
  name: string;
  durationHours: number;
  price: number; // in base currency (FCFA)
  downloadSpeedMbps: number;
  uploadSpeedMbps: number;
  dataLimitMb?: number; // optional data cap, e.g. 1024 for 1GB (0 = illimité)
  simultaneousDevices: number;
  popular?: boolean;
  color?: string;
  macLock?: boolean; // Verrouillage Adresse MAC
  validityValue?: number;
  validityUnit?: 'hours' | 'days' | 'weeks' | 'months' | 'unlimited';
}

export type TicketStatus = 'stock' | 'vendeur' | 'papier' | 'actif' | 'expire' | 'bloque';

export interface TicketQueuedForfait {
  id: string;
  forfaitId: string;
  forfaitName: string;
  price: number;
  addedAt: string;
}

export interface TicketItem {
  id: string;
  code: string;
  pin?: string;
  password?: string;
  forfaitId: string;
  forfaitName: string;
  price: number;
  duration: string;
  status: TicketStatus;
  createdAt: string;
  activatedAt?: string;
  expiresAt?: string;
  customerPhone?: string;
  sellerId?: string;
  sellerName?: string;
  zoneName?: string;
  batchId?: string;
  macAddress?: string;
  dataConsumedMb?: number;
  queuedForfaits?: TicketQueuedForfait[];
}

export interface StaffPermissions {
  fastSale: boolean;
  printThermal: boolean;
  shareWhatsapp: boolean;
  sosRequest: boolean;
}

export interface StaffItem {
  id: string;
  name: string;
  email?: string;
  password?: string;
  phone: string;
  zoneId: string;
  zoneName: string;
  commissionRate: number; // percentage, e.g. 10%
  balanceCredit: number; // credit available for issuing tickets
  dailyGoal: number; // sales target in FCFA
  todaySales: number;
  totalSales: number;
  active: boolean;
  lastActive: string;
  paidCommissions?: number;
  permissions?: StaffPermissions;
}

export interface ConnectedSession {
  id: string;
  username: string;
  ipAddress: string;
  macAddress: string;
  routerId?: string;
  routerName: string;
  uptimeMinutes: number;
  timeRemainingMinutes?: number;
  bytesInMb: number; // Download (Mo)
  bytesOutMb: number; // Upload (Mo)
  downloadRateKbps?: number;
  uploadRateKbps?: number;
  forfaitName: string;
  signalDbm: number;
  suspended: boolean;
  authorized?: boolean;
  deviceType?: 'smartphone' | 'laptop' | 'tablet' | 'smart_tv' | 'unknown';
  connectedAt?: string;
}

export interface PhysicalWifiHost {
  id: string;
  macAddress: string;
  ipAddress: string;
  routerId: string;
  routerName: string;
  interfaceName: string; // e.g. "wlan1", "bridge-hotspot"
  signalDbm: number;
  status: 'authenticated' | 'unauthenticated' | 'bypassed';
  deviceVendor?: string; // e.g. "Apple", "Samsung", "Transsion (Tecno/Infinix)", "Xiaomi", "Intel"
  uptimeMinutes: number;
  bytesTotalMb: number;
  lastActivity: string;
  authorizedUsername?: string;
}

export interface ConnectionLog {
  id: string;
  timestamp: string;
  username: string;
  macAddress: string;
  routerName: string;
  status: 'success' | 'failed';
  reason?: string;
}

export interface MacBypassItem {
  id: string;
  macAddress: string;
  label: string;
  routerId?: string; // 'all' or router id
  routerName?: string;
  category: 'VIP' | 'Staff' | 'Camera / IoT' | 'Partenaire' | 'Habitué' | 'Console / TV';
  autoCookie: boolean;
  forfaitId?: string;
  forfaitName?: string;
  bindingType?: 'bypassed' | 'regular' | 'blocked';
  expiryType?: 'permanent' | '24h' | '7d' | '30d' | 'custom';
  expiresAt?: string;
  status?: 'active' | 'expired' | 'disabled';
  deviceVendor?: string;
  lastSeen?: string;
  addedAt: string;
  comment?: string;
}

export interface WalletTransaction {
  id: string;
  timestamp: string;
  type: 'credit' | 'debit';
  amount: number;
  category: 'Recharge Mobile Money' | 'Abonnement SaaS' | 'Commission Staff' | 'Retrait Gains' | 'Achat Lots';
  reference: string;
  paymentMethod?: 'Orange Money' | 'MTN MoMo' | 'Wave' | 'Moov Money' | 'Carte';
  status: 'completed' | 'pending' | 'failed';
}

export interface PlanDetails {
  id: 'starter' | 'pro' | 'business' | 'enterprise';
  name: string;
  priceMonthly: number; // FCFA
  routerLimit: number;
  ticketLimit: number;
  sellerLimit: number;
  features: string[];
  recommended?: boolean;
}

export interface CaptivePortalConfig {
  scope: 'global' | 'zone' | 'router';
  targetZoneId?: string;
  targetRouterId?: string;
  templateId: 'minimal-speed' | 'sunset-glass' | 'abidjan-vibrant' | 'neon-cyber';
  brandName: string;
  tagline: string;
  welcomeMessage: string;
  logoUrl?: string;
  primaryColor: string;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  enableMobileMoney: boolean;
  enableVoucherInput: boolean;
  enableFreeTrial: boolean;
  freeTrialDurationMinutes: number;
  walledGardenDomains: string[];
  supportPhone: string;
}

export interface SavedPortalTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  author: string;
  isActive: boolean;
  updatedAt: string;
  config: CaptivePortalConfig;
}

export interface TelegramConfig {
  botToken: string;
  chatId: string;
  enabled: boolean;
  triggers: {
    routerDown: boolean;
    vendorLowCredit: boolean;
    dailyReport: boolean;
    momoPayment: boolean;
    highCpuWarning: boolean;
  };
}

export interface OperatorProfile {
  name: string;
  company: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  defaultIspMonthlyCost: number;
  twoFactorEnabled: boolean;
}

export interface ToastNotification {
  id: string;
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  target: string;
  details: string;
  ip: string;
}

export interface HeartbeatCommandItem {
  id: string;
  routerName: string;
  commandType: 'ADD_TICKET' | 'DISCONNECT_SESSION' | 'ADD_MAC_BYPASS' | 'SYNC_PROFILES' | 'REBOOT_ROUTER';
  routerOsCommand: string;
  status: 'pending' | 'synced';
  createdAt: string;
  syncedAt?: string;
}
