-- ============================================================================
-- JOOWIFI CLOUD — SCRIPT COMPLET POUR SUPABASE SQL EDITOR (PostgreSQL 15/16)
-- Instructions :
-- 1. Ouvrez votre projet sur https://supabase.com/dashboard
-- 2. Cliquez sur "SQL Editor" dans le menu de gauche -> "+ New query"
-- 3. Collez tout ce script et cliquez sur le bouton vert "Run" (ou Ctrl+Entrée)
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. TABLE DES OPÉRATEURS (COMPTES ADMINISTRATEURS MULTITENANT)
CREATE TABLE IF NOT EXISTS public.operators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(120) NOT NULL,
    company VARCHAR(160) NOT NULL,
    email VARCHAR(180) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
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
CREATE TABLE IF NOT EXISTS public.zones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operator_id UUID NOT NULL REFERENCES public.operators(id) ON DELETE CASCADE,
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

CREATE INDEX IF NOT EXISTS idx_zones_operator ON public.zones(operator_id);

-- 3. TABLE DES ROUTEURS MIKROTIK (MODÈLE STRICT CLOUD PULL 45s)
CREATE TABLE IF NOT EXISTS public.routers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operator_id UUID NOT NULL REFERENCES public.operators(id) ON DELETE CASCADE,
    zone_id UUID NOT NULL REFERENCES public.zones(id) ON DELETE CASCADE,
    name VARCHAR(140) NOT NULL,
    model VARCHAR(120) DEFAULT 'MikroTik hEX S (RB760iGS)',
    install_token VARCHAR(64) UNIQUE NOT NULL,
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

CREATE INDEX IF NOT EXISTS idx_routers_operator ON public.routers(operator_id);
CREATE INDEX IF NOT EXISTS idx_routers_token ON public.routers(install_token);

-- 4. CATALOGUE DES FORFAITS WIFI
CREATE TABLE IF NOT EXISTS public.forfaits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operator_id UUID NOT NULL REFERENCES public.operators(id) ON DELETE CASCADE,
    name VARCHAR(120) NOT NULL,
    duration_hours INT NOT NULL CHECK (duration_hours > 0),
    validity_value INT DEFAULT 1,
    validity_unit VARCHAR(16) DEFAULT 'days' CHECK (validity_unit IN ('hours', 'days', 'weeks', 'months')),
    price_xof BIGINT NOT NULL CHECK (price_xof >= 0),
    download_speed_mbps NUMERIC(6,2) NOT NULL DEFAULT 5.0,
    upload_speed_mbps NUMERIC(6,2) NOT NULL DEFAULT 2.0,
    data_limit_mb INT DEFAULT 0,
    simultaneous_devices SMALLINT DEFAULT 1 CHECK (simultaneous_devices >= 1),
    mac_lock BOOLEAN DEFAULT TRUE,
    popular BOOLEAN DEFAULT FALSE,
    color VARCHAR(32) DEFAULT 'amber',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_forfaits_operator ON public.forfaits(operator_id);

-- 5. ÉQUIPE DE VENDEURS DE TERRAIN (CAISSE POS PWA)
CREATE TABLE IF NOT EXISTS public.staff_vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operator_id UUID NOT NULL REFERENCES public.operators(id) ON DELETE CASCADE,
    zone_id UUID NOT NULL REFERENCES public.zones(id) ON DELETE CASCADE,
    name VARCHAR(120) NOT NULL,
    phone VARCHAR(40) NOT NULL,
    pin_hash VARCHAR(255) NOT NULL,
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

CREATE INDEX IF NOT EXISTS idx_staff_operator ON public.staff_vendors(operator_id);

-- 6. GESTION DES TICKETS WIFI (VOUCHERS)
CREATE TABLE IF NOT EXISTS public.tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operator_id UUID NOT NULL REFERENCES public.operators(id) ON DELETE CASCADE,
    zone_id UUID REFERENCES public.zones(id) ON DELETE SET NULL,
    forfait_id UUID NOT NULL REFERENCES public.forfaits(id) ON DELETE RESTRICT,
    seller_id UUID REFERENCES public.staff_vendors(id) ON DELETE SET NULL,
    code VARCHAR(64) NOT NULL,
    pin VARCHAR(32),
    password VARCHAR(64),
    price_xof BIGINT NOT NULL,
    duration_label VARCHAR(32) NOT NULL,
    status VARCHAR(20) DEFAULT 'stock' CHECK (status IN ('stock', 'vendeur', 'papier', 'actif', 'expire', 'bloque')),
    batch_id VARCHAR(64),
    customer_phone VARCHAR(40),
    mac_address VARCHAR(32),
    data_consumed_mb NUMERIC(10,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    activated_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    UNIQUE(operator_id, code)
);

CREATE INDEX IF NOT EXISTS idx_tickets_operator_status ON public.tickets(operator_id, status);
CREATE INDEX IF NOT EXISTS idx_tickets_code ON public.tickets(code);

-- 7. FILE D'ATTENTE DE FORFAITS (PROGRAMMATION DE RELAIS AUTOMATIQUE)
CREATE TABLE IF NOT EXISTS public.ticket_queued_forfaits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
    forfait_id UUID NOT NULL REFERENCES public.forfaits(id) ON DELETE CASCADE,
    forfait_name VARCHAR(120) NOT NULL,
    price_xof BIGINT NOT NULL,
    position SMALLINT DEFAULT 1,
    status VARCHAR(20) DEFAULT 'queued' CHECK (status IN ('queued', 'activated', 'cancelled')),
    added_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    activated_at TIMESTAMPTZ
);

-- 8. BYPASS MAC & IP BINDINGS (CAMÉRAS IP, VIP, ÉQUIPEMENTS)
CREATE TABLE IF NOT EXISTS public.mac_bypasses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operator_id UUID NOT NULL REFERENCES public.operators(id) ON DELETE CASCADE,
    router_id UUID REFERENCES public.routers(id) ON DELETE CASCADE,
    mac_address VARCHAR(32) NOT NULL,
    label VARCHAR(140) NOT NULL,
    category VARCHAR(40) DEFAULT 'VIP' CHECK (category IN ('VIP', 'Staff', 'Camera / IoT', 'Partenaire', 'Habitué', 'Console / TV')),
    binding_type VARCHAR(20) DEFAULT 'bypassed' CHECK (binding_type IN ('bypassed', 'regular', 'blocked')),
    auto_cookie BOOLEAN DEFAULT TRUE,
    forfait_id UUID REFERENCES public.forfaits(id) ON DELETE SET NULL,
    expiry_type VARCHAR(20) DEFAULT 'permanent' CHECK (expiry_type IN ('permanent', '24h', '7d', '30d', 'custom')),
    expires_at TIMESTAMPTZ,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'disabled')),
    device_vendor VARCHAR(100),
    comment TEXT,
    last_seen_at TIMESTAMPTZ,
    added_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_mac_bypass_operator ON public.mac_bypasses(operator_id);

-- 9. FILE D'ATTENTE D'INSTRUCTIONS ROUTEROS (MODÈLE CLOUD PULL 45s)
CREATE TABLE IF NOT EXISTS public.heartbeat_commands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operator_id UUID NOT NULL REFERENCES public.operators(id) ON DELETE CASCADE,
    router_id UUID NOT NULL REFERENCES public.routers(id) ON DELETE CASCADE,
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
    routeros_script TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'delivered', 'executed', 'failed')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    delivered_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_heartbeat_pending ON public.heartbeat_commands(router_id, status) WHERE status = 'pending';

-- 10. GRAND LIVRE COMPTABLE & PORTEFEUILLE (LEDGER)
CREATE TABLE IF NOT EXISTS public.wallet_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operator_id UUID NOT NULL REFERENCES public.operators(id) ON DELETE CASCADE,
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

CREATE INDEX IF NOT EXISTS idx_transactions_operator ON public.wallet_transactions(operator_id, created_at DESC);

-- 11. SESSIONS ACTIVES & JOURNAL D'AUDIT
CREATE TABLE IF NOT EXISTS public.active_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operator_id UUID NOT NULL REFERENCES public.operators(id) ON DELETE CASCADE,
    router_id UUID NOT NULL REFERENCES public.routers(id) ON DELETE CASCADE,
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

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operator_id UUID NOT NULL REFERENCES public.operators(id) ON DELETE CASCADE,
    user_email VARCHAR(180) NOT NULL,
    action VARCHAR(120) NOT NULL,
    target VARCHAR(160) NOT NULL,
    details TEXT,
    ip_address VARCHAR(64),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_audit_operator ON public.audit_logs(operator_id, created_at DESC);

-- ============================================================================
-- 12. FONCTION RPC SUPABASE POUR LE HEARTBEAT MIKROTIK (CLOUD PULL 45s)
-- Appelable directement via : POST https://<project>.supabase.co/rest/v1/rpc/mikrotik_heartbeat
-- ============================================================================
CREATE OR REPLACE FUNCTION public.mikrotik_heartbeat(
    p_token VARCHAR,
    p_cpu SMALLINT DEFAULT 10,
    p_ram SMALLINT DEFAULT 30,
    p_uptime VARCHAR DEFAULT '01j 00h 00m',
    p_active_users INT DEFAULT 0,
    p_version VARCHAR DEFAULT 'v7.14.3'
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_router_id UUID;
    v_script TEXT := '';
BEGIN
    SELECT id INTO v_router_id
    FROM public.routers
    WHERE install_token = p_token
    LIMIT 1;

    IF v_router_id IS NULL THEN
        RETURN '# [JOOWIFI] Token routeur invalide';
    END IF;

    UPDATE public.routers
    SET status = 'online',
        last_heartbeat_at = NOW(),
        cpu_usage = p_cpu,
        ram_usage = p_ram,
        uptime = p_uptime,
        total_subscribers = p_active_users,
        routeros_version = p_version
    WHERE id = v_router_id;

    SELECT COALESCE(string_agg(routeros_script, E'\n' ORDER BY created_at ASC), '')
    INTO v_script
    FROM public.heartbeat_commands
    WHERE router_id = v_router_id AND status = 'pending';

    UPDATE public.heartbeat_commands
    SET status = 'delivered',
        delivered_at = NOW()
    WHERE router_id = v_router_id AND status = 'pending';

    IF v_script = '' THEN
        RETURN '# [JOOWIFI] Heartbeat OK - Aucune commande en attente';
    END IF;

    RETURN v_script;
END;
$$;

-- ============================================================================
-- 13. DONNÉES INITIALES DE DÉMONSTRATION (COMPTE ADMIN, ZONES, ROUTEUR, FORFAITS)
-- ============================================================================
DO $$
DECLARE
    v_op_id UUID := '11111111-1111-1111-1111-111111111111';
    v_zone_adjame UUID := '22222222-2222-2222-2222-222222222221';
    v_zone_cocody UUID := '22222222-2222-2222-2222-222222222222';
    v_router_1 UUID := '33333333-3333-3333-3333-333333333331';
BEGIN
    INSERT INTO public.operators (id, name, company, email, password_hash, phone, city, country, currency, plan_id, wallet_balance_xof, gains_balance_xof)
    VALUES (
        v_op_id,
        'Kouamé Konan',
        'Ivoire Hotspot Réseaux',
        'admin@joowifi.ci',
        crypt('Joowifi2026!', gen_salt('bf', 12)),
        '+225 07 08 09 10 11',
        'Abidjan',
        'Côte d''Ivoire',
        'XOF',
        'pro',
        42500,
        187500
    ) ON CONFLICT (email) DO NOTHING;

    INSERT INTO public.zones (id, operator_id, name, city, country, site_type, status, description, isp_monthly_cost, subscription_price_monthly, monthly_revenue_xof, today_sales_xof)
    VALUES
        (v_zone_adjame, v_op_id, 'Marché Grand Adjamé', 'Abidjan', 'Côte d''Ivoire', 'commerce', 'active', 'Galerie principale face gare SOTRA', 35000, 5000, 285000, 14500),
        (v_zone_cocody, v_op_id, 'Campus Résidence Cocody', 'Abidjan', 'Côte d''Ivoire', 'campus', 'active', 'Cité universitaire Mermoz — 4 bâtiments', 45000, 5000, 410000, 22000)
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.routers (id, operator_id, zone_id, name, model, install_token, ip_address, mac_address, cloud_dns, routeros_version, hotspot_interface, status, last_heartbeat_at, uptime, cpu_usage, ram_usage, total_subscribers, synced_profiles_count)
    VALUES (
        v_router_1,
        v_op_id,
        v_zone_adjame,
        'MK-ADJAME-CORE-01',
        'MikroTik RB5009UG+S+IN',
        'JWT-AF6L-JG37-7K23',
        '10.5.50.1',
        '48:A9:8A:7B:12:C4',
        'a8f90c12d3.sn.mynetname.net',
        'v7.15.2',
        'bridge-hotspot',
        'online',
        NOW(),
        '14j 08h 42m',
        18,
        34,
        47,
        5
    ) ON CONFLICT (install_token) DO NOTHING;

    INSERT INTO public.forfaits (operator_id, name, duration_hours, validity_value, validity_unit, price_xof, download_speed_mbps, upload_speed_mbps, data_limit_mb, simultaneous_devices, mac_lock, popular, color)
    SELECT v_op_id, 'Pass Express 1 Heure', 1, 1, 'hours', 100, 5.0, 2.0, 0, 1, TRUE, FALSE, 'sky'
    WHERE NOT EXISTS (SELECT 1 FROM public.forfaits WHERE operator_id = v_op_id AND name = 'Pass Express 1 Heure');

    INSERT INTO public.forfaits (operator_id, name, duration_hours, validity_value, validity_unit, price_xof, download_speed_mbps, upload_speed_mbps, data_limit_mb, simultaneous_devices, mac_lock, popular, color)
    SELECT v_op_id, 'Pass Journée 24 Heures', 24, 1, 'days', 200, 8.0, 4.0, 0, 1, TRUE, TRUE, 'amber'
    WHERE NOT EXISTS (SELECT 1 FROM public.forfaits WHERE operator_id = v_op_id AND name = 'Pass Journée 24 Heures');

    INSERT INTO public.forfaits (operator_id, name, duration_hours, validity_value, validity_unit, price_xof, download_speed_mbps, upload_speed_mbps, data_limit_mb, simultaneous_devices, mac_lock, popular, color)
    SELECT v_op_id, 'Pass Semaine 7 Jours', 168, 7, 'days', 1000, 10.0, 5.0, 0, 2, TRUE, FALSE, 'emerald'
    WHERE NOT EXISTS (SELECT 1 FROM public.forfaits WHERE operator_id = v_op_id AND name = 'Pass Semaine 7 Jours');

    INSERT INTO public.forfaits (operator_id, name, duration_hours, validity_value, validity_unit, price_xof, download_speed_mbps, upload_speed_mbps, data_limit_mb, simultaneous_devices, mac_lock, popular, color)
    SELECT v_op_id, 'Pass Mensuel 30 Jours', 720, 30, 'days', 3000, 15.0, 8.0, 0, 3, FALSE, FALSE, 'purple'
    WHERE NOT EXISTS (SELECT 1 FROM public.forfaits WHERE operator_id = v_op_id AND name = 'Pass Mensuel 30 Jours');
END $$;