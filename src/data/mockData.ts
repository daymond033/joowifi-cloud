import {
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
  PlanDetails,
  CaptivePortalConfig,
  AuditLogItem,
} from '../types';

// ============================================================================
// PRODUCTION CLEAN STATE — ZÉRO DONNÉE FACTICE (0 MOCK DATA)
// Toutes les entités métier démarrent strictement vides et sont chargées
// exclusivement depuis la base de données Cloud isolée par `tenant_id`.
// ============================================================================

export const INITIAL_ZONES: ZoneItem[] = [];

export const INITIAL_ROUTERS: RouterItem[] = [];

export const INITIAL_FORFAITS: ForfaitItem[] = [];

export const INITIAL_STAFF: StaffItem[] = [];

export const INITIAL_TICKETS: TicketItem[] = [];

export const INITIAL_SESSIONS: ConnectedSession[] = [];

export const INITIAL_PHYSICAL_HOSTS: PhysicalWifiHost[] = [];

export const INITIAL_LOGS: ConnectionLog[] = [];

export const INITIAL_MAC_BYPASS: MacBypassItem[] = [];

export const INITIAL_TRANSACTIONS: WalletTransaction[] = [];

export const INITIAL_AUDIT_LOGS: AuditLogItem[] = [];

// Grille officielle des offres de la plateforme SaaS Joowifi Cloud
export const SAAS_PLANS: PlanDetails[] = [
  {
    id: 'starter',
    name: 'Offre Essai (14 Jours)',
    priceMonthly: 0,
    routerLimit: 1,
    ticketLimit: 500,
    sellerLimit: 2,
    features: [
      'Essai complet pendant 14 jours',
      '1 routeur MikroTik connecté',
      'Jusqu’à 2 comptes vendeurs POS',
      'Génération de tickets & QR Codes',
      'Portail captif standard inclus',
    ],
  },
  {
    id: 'pro',
    name: 'Plan Pro',
    priceMonthly: 6000,
    routerLimit: 5,
    ticketLimit: 15000,
    sellerLimit: 10,
    recommended: true,
    features: [
      'Jusqu’à 5 routeurs MikroTik',
      '10 comptes vendeurs Caisse POS',
      'Portail captif personnalisé & Mobile Money',
      'Verrouillage MAC & Cookie 30 jours',
      'Support prioritaire 6j/7',
    ],
  },
  {
    id: 'business',
    name: 'Plan Business',
    priceMonthly: 15000,
    routerLimit: 25,
    ticketLimit: 100000,
    sellerLimit: 50,
    features: [
      'Jusqu’à 25 routeurs MikroTik multi-sites',
      '50 comptes vendeurs Caisse POS',
      'Comptabilité & Bilan d’exploitation avancé',
      'Alertes Telegram en temps réel',
      'Support WhatsApp dédié 7j/7',
    ],
  },
  {
    id: 'enterprise',
    name: 'Offre Entreprise',
    priceMonthly: 0,
    routerLimit: 9999,
    ticketLimit: 999999,
    sellerLimit: 999,
    features: [
      'Routeurs MikroTik & Sites illimités',
      'Vendeurs Caisse POS illimités',
      'Architecture dédiée Haute Disponibilité',
      'Intégration sur mesure & SLA 99.9%',
      'Ingénieur réseau dédié 24h/24',
    ],
  },
];

export const INITIAL_CAPTIVE_CONFIG: CaptivePortalConfig = {
  scope: 'global',
  templateId: 'abidjan-vibrant',
  brandName: 'Mon Réseau WiFi',
  tagline: 'Connexion WiFi Haut Débit',
  welcomeMessage: 'Connectez-vous avec votre code ticket WiFi ou achetez un forfait en ligne.',
  primaryColor: '#008060',
  backgroundColor: '#F4F7FA',
  surfaceColor: '#FFFFFF',
  textColor: '#1E293B',
  enableMobileMoney: true,
  enableVoucherInput: true,
  enableFreeTrial: false,
  freeTrialDurationMinutes: 10,
  walledGardenDomains: ['joowifi-cloud.vercel.app', '*.wave.com', '*.orange.ci', '*.mtn.ci'],
  supportPhone: '',
};
