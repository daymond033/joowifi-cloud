-- ============================================================================
-- JOOWIFI CLOUD — ARCHITECTURE BASE DE DONNÉES MULTITENANT (PostgreSQL 16+)
-- Hiérarchie : Comptes Opérateurs (Admin) -> Zones -> Routeurs MikroTik ->
--              Forfaits -> Vendeurs POS -> Tickets -> File d'Attente Heartbeat
-- Sécurité : Mots de passe bcrypt (cost 12), Isolation Multitenant par operator_id
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. TABLE DES OPÉRATEURS (COMPTES ADMINISTRATEURS MULTITENANT)
CREATE TABLE operators (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(120) NOT NULL,
    company VARCHAR(160) NOT NULL,
    email VARCHAR(180) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- bcrypt cost 12 ($2b$12$...)
    phone VARCHAR(40) NOT NULL,
    city VARCHAR(100) DEFAULT 'Abidjan',
    country VARCHAR(100) DEFAULT 'Côte d''Ivoire',
    currency VARCHAR(10) DEFAULT 'XOF' CHECK (currency IN ('XOF', 'GNF', 'EUR', 'USD')),
    plan_id VARCHAR(20) DEFAULT 'starter' CHECK (plan_id IN ('starter', 'pro', 'business', 'enterprise')),
    wallet_balance_xof BIGINT DEFAULT 0 NOT NULL CHECK (wallet_balance_xof >= 0),
    gains_balance_xof BIGINT DEFAULT 0 NOT NULL CHECK (gains_balance_xof >= 0),
    default_isp_monthly_cost BIGINT DEFAULT 50000,
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    telegram_bot_token VARCHAR(255),
    telegram_chat_id VARCHAR(100),
    telegram_enabled BOOLEAN DEFAULT FALSE,
    telegram_triggers JSONB DEFAULT '{"routerDown": true, "vendorLowCredit": true, "dailyReport": true, "momoPayment": true, "highCpuWarning": true}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. TABLE DES ZONES PHYSIQUES (MULTI-SITES : ADJAMÉ, COCODY, CONAKRY, DAKAR...)
CREATE TABLE zones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    operator_id UUID NOT NULL REFERENCES operators(id) ON DELETE CASCADE,
    name VARCHAR(140) NOT NULL,
    city VARCHAR(100) NOT NULL,
    country VARCHAR(100) DEFAULT 'Côte d''Ivoire',
    site_type VARCHAR(40) DEFAULT 'commerce' CHECK (site_type IN ('residentiel', 'commerce', 'hotel', 'campus', 'evenement')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'sleeping')),
    description TEXT,
    isp_monthly_cost BIGINT DEFAULT 25000,
    subscription_price_monthly BIGINT DEFAULT 5000,
    subscription_expiry DATE,
    monthly_revenue_xof BIGINT DEFAULT 0,
    today_sales_xof BIGINT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_zones_operator ON zones(operator_id);

-- 3. TABLE DES ROUTEURS MIKROTIK (MODÈLE STRICT CLOUD PULL 45s)
CREATE TABLE routers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    operator_id UUID NOT NULL REFERENCES operators(id) ON DELETE CASCADE,
    zone_id UUID NOT NULL REFERENCES zones(id) ON DELETE CASCADE,
    name VARCHAR(140) NOT NULL,
    model VARCHAR(120) DEFAULT 'MikroTik hEX S (RB760iGS)',
    install_token VARCHAR(64) UNIQUE NOT NULL, -- Jeton unique d'appairage (ex: JWT-AF6L-JG37-7K23)
    ip_address VARCHAR(64) DEFAULT '192.168.88.1',
    mac_address VARCHAR(32),
    cloud_dns VARCHAR(160),
    routeros_version VARCHAR(32) DEFAULT 'v7.14.3',
    hotspot_interface VARCHAR(64) DEFAULT 'bridge-hotspot',
    status VARCHAR(20) DEFAULT 'offline' CHECK (status IN ('online', 'offline', 'warning')),
    last_heartbeat_at TIMESTAMPTZ,
    uptime VARCHAR(64) DEFAULT '00j 00h 00m',
    cpu_usage SMALLINT DEFAULT 0,
    ram_usage SMALLINT DEFAULT 0,
    temperature_c SMALLINT,
    voltage_v NUMERIC(4,1),
    disk_free_mb NUMERIC(8,2),
    traffic_down_mbps NUMERIC(8,2) DEFAULT 0,
    traffic_up_mbps NUMERIC(8,2) DEFAULT 0,
    total_subscribers INT DEFAULT 0,
    synced_profiles_count INT DEFAULT 0,
    last_sync_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_routers_operator ON routers(operator_id);
CREATE INDEX idx_routers_token ON routers(install_token);

-- 4. CATALOGUE DES FORFAITS WIFI
CREATE TABLE forfaits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    operator_id UUID NOT NULL REFERENCES operators(id) ON DELETE CASCADE,
    name VARCHAR(120) NOT NULL,
    duration_hours INT NOT NULL CHECK (duration_hours > 0),
    validity_value INT DEFAULT 1,
    validity_unit VARCHAR(16) DEFAULT 'days' CHECK (validity_unit IN ('hours', 'days', 'weeks', 'months')),
    price_xof BIGINT NOT NULL CHECK (price_xof >= 0),
    download_speed_mbps NUMERIC(6,2) NOT NULL DEFAULT 5.0,
    upload_speed_mbps NUMERIC(6,2) NOT NULL DEFAULT 2.0,
    data_limit_mb INT DEFAULT 0, -- 0 = illimité
    simultaneous_devices SMALLINT DEFAULT 1 CHECK (simultaneous_devices >= 1),
    mac_lock BOOLEAN DEFAULT TRUE, -- Verrouillage anti-partage de code
    popular BOOLEAN DEFAULT FALSE,
    color VARCHAR(32) DEFAULT 'amber',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_forfaits_operator ON forfaits(operator_id);

-- 5. ÉQUIPE DE VENDEURS DE TERRAIN (CAISSE POS PWA)
CREATE TABLE staff_vendors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    operator_id UUID NOT NULL REFERENCES operators(id) ON DELETE CASCADE,
    zone_id UUID NOT NULL REFERENCES zones(id) ON DELETE CASCADE,
    name VARCHAR(120) NOT NULL,
    phone VARCHAR(40) NOT NULL,
    pin_hash VARCHAR(255) NOT NULL, -- bcrypt cost 12 pour connexion POS rapide
    commission_rate NUMERIC(5,2) DEFAULT 10.00 CHECK (commission_rate >= 0 AND commission_rate <= 100),
    balance_credit_xof BIGINT DEFAULT 0 NOT NULL,
    daily_goal_xof BIGINT DEFAULT 10000,
    today_sales_xof BIGINT DEFAULT 0,
    total_sales_xof BIGINT DEFAULT 0,
    paid_commissions_xof BIGINT DEFAULT 0,
    active BOOLEAN DEFAULT TRUE,
    last_active_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_staff_operator ON staff_vendors(operator_id);

-- 6. GESTION DES TICKETS WIFI (VOUCHERS)
CREATE TABLE tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    operator_id UUID NOT NULL REFERENCES operators(id) ON DELETE CASCADE,
    zone_id UUID REFERENCES zones(id) ON DELETE SET NULL,
    forfait_id UUID NOT NULL REFERENCES forfaits(id) ON DELETE RESTRICT,
    seller_id UUID REFERENCES staff_vendors(id) ON DELETE SET NULL,
    code VARCHAR(64) NOT NULL,
    pin VARCHAR(32),
    password VARCHAR(64),
    price_xof BIGINT NOT NULL,
    duration_label VARCHAR(32) NOT NULL,
    status VARCHAR(20) DEFAULT 'stock' CHECK (status IN ('stock', 'vendeur', 'papier', 'actif', 'expire', 'bloque')),
    batch_id VARCHAR(64),
    customer_phone VARCHAR(40),
    mac_address VARCHAR(32), -- Adresse MAC verrouillée au 1er login si mac_lock = true
    data_consumed_mb NUMERIC(10,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    activated_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    UNIQUE(operator_id, code)
);

CREATE INDEX idx_tickets_operator_status ON tickets(operator_id, status);
CREATE INDEX idx_tickets_code ON tickets(code);

-- 7. FILE D'ATTENTE DE FORFAITS (PROGRAMMATION DE RELAIS AUTOMATIQUE)
CREATE TABLE ticket_queued_forfaits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    forfait_id UUID NOT NULL REFERENCES forfaits(id) ON DELETE CASCADE,
    forfait_name VARCHAR(120) NOT NULL,
    price_xof BIGINT NOT NULL,
    position SMALLINT DEFAULT 1,
    status VARCHAR(20) DEFAULT 'queued' CHECK (status IN ('queued', 'activated', 'cancelled')),
    added_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    activated_at TIMESTAMPTZ
);

-- 8. BYPASS MAC & IP BINDINGS (CAMÉRAS IP, VIP, ÉQUIPEMENTS)
CREATE TABLE mac_bypasses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    operator_id UUID NOT NULL REFERENCES operators(id) ON DELETE CASCADE,
    router_id UUID REFERENCES routers(id) ON DELETE CASCADE, -- NULL = Tous les routeurs (Global)
    mac_address VARCHAR(32) NOT NULL,
    label VARCHAR(140) NOT NULL,
    category VARCHAR(40) DEFAULT 'VIP' CHECK (category IN ('VIP', 'Staff', 'Camera / IoT', 'Partenaire', 'Habitué', 'Console / TV')),
    binding_type VARCHAR(20) DEFAULT 'bypassed' CHECK (binding_type IN ('bypassed', 'regular', 'blocked')),
    auto_cookie BOOLEAN DEFAULT TRUE,
    forfait_id UUID REFERENCES forfaits(id) ON DELETE SET NULL,
    expiry_type VARCHAR(20) DEFAULT 'permanent' CHECK (expiry_type IN ('permanent', '24h', '7d', '30d', 'custom')),
    expires_at TIMESTAMPTZ,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'disabled')),
    device_vendor VARCHAR(100),
    comment TEXT,
    last_seen_at TIMESTAMPTZ,
    added_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_mac_bypass_operator ON mac_bypasses(operator_id);

-- 9. FILE D'ATTENTE D'INSTRUCTIONS ROUTEROS (MODÈLE CLOUD PULL 45s)
-- Le serveur empile les commandes RouterOS ici ; le routeur les récupère toutes les 45s
CREATE TABLE heartbeat_commands (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    operator_id UUID NOT NULL REFERENCES operators(id) ON DELETE CASCADE,
    router_id UUID NOT NULL REFERENCES routers(id) ON DELETE CASCADE,
    command_type VARCHAR(40) NOT NULL CHECK (command_type IN (
        'ADD_TICKET',
        'REMOVE_TICKET',
        'DISCONNECT_SESSION',
        'SYNC_PROFILE',
        'ADD_MAC_BYPASS',
        'REMOVE_MAC_BYPASS',
        'REBOOT_ROUTER',
        'UPDATE_WALLED_GARDEN'
    )),
    routeros_script TEXT NOT NULL, -- Commande exacte RouterOS (.rsc) à exécuter sur le MikroTik
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'delivered', 'executed', 'failed')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    delivered_at TIMESTAMPTZ
);

CREATE INDEX idx_heartbeat_pending ON heartbeat_commands(router_id, status) WHERE status = 'pending';

-- 10. GRAND LIVRE COMPTABLE & PORTEFEUILLE (LEDGER)
CREATE TABLE wallet_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    operator_id UUID NOT NULL REFERENCES operators(id) ON DELETE CASCADE,
    type VARCHAR(10) NOT NULL CHECK (type IN ('credit', 'debit')),
    amount_xof BIGINT NOT NULL CHECK (amount_xof > 0),
    category VARCHAR(40) NOT NULL CHECK (category IN (
        'Recharge Mobile Money',
        'Abonnement SaaS',
        'Commission Staff',
        'Retrait Gains',
        'Achat Lots'
    )),
    reference VARCHAR(100) UNIQUE NOT NULL,
    payment_method VARCHAR(30) CHECK (payment_method IN ('Orange Money', 'MTN MoMo', 'Wave', 'Moov Money', 'Carte')),
    customer_phone VARCHAR(40),
    status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('completed', 'pending', 'failed')),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_transactions_operator ON wallet_transactions(operator_id, created_at DESC);

-- 11. SESSIONS ACTIVES & JOURNAL D'AUDIT
CREATE TABLE active_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    operator_id UUID NOT NULL REFERENCES operators(id) ON DELETE CASCADE,
    router_id UUID NOT NULL REFERENCES routers(id) ON DELETE CASCADE,
    username VARCHAR(64) NOT NULL,
    ip_address VARCHAR(64) NOT NULL,
    mac_address VARCHAR(32) NOT NULL,
    forfait_name VARCHAR(120),
    uptime_minutes INT DEFAULT 0,
    time_remaining_minutes INT,
    bytes_in_mb NUMERIC(10,2) DEFAULT 0,
    bytes_out_mb NUMERIC(10,2) DEFAULT 0,
    signal_dbm SMALLINT DEFAULT -60,
    device_type VARCHAR(30) DEFAULT 'smartphone',
    connected_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    operator_id UUID NOT NULL REFERENCES operators(id) ON DELETE CASCADE,
    user_email VARCHAR(180) NOT NULL,
    action VARCHAR(120) NOT NULL,
    target VARCHAR(160) NOT NULL,
    details TEXT,
    ip_address VARCHAR(64),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_audit_operator ON audit_logs(operator_id, created_at DESC);
