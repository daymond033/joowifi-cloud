// ============================================================================
// JOOWIFI CLOUD — BACKEND API MULTI-TENANT & RELAIS RLS SUPABASE (/api/supabase)
// 1. Supporte l'action administrative `PURGE_ALL_TEST_DATA` pour vider les 12 tables
// 2. Extrait et vérifie l'identifiant du locataire (tenant_id / créateur)
// 3. Injecte automatiquement `tenant_id` et `operator_id` dans toute création
// ============================================================================

const TENANT_SCOPED_TABLES = new Set([
  'zones',
  'routers',
  'forfaits',
  'staff_vendors',
  'tickets',
  'ticket_queued_forfaits',
  'mac_bypasses',
  'heartbeat_commands',
  'wallet_transactions',
  'active_sessions',
  'audit_logs',
]);

const ALL_TABLES_TO_PURGE = [
  'active_sessions',
  'ticket_queued_forfaits',
  'tickets',
  'heartbeat_commands',
  'mac_bypasses',
  'wallet_transactions',
  'audit_logs',
  'staff_vendors',
  'forfaits',
  'routers',
  'zones',
  'operators',
];

function injectTenantIntoPayload(table, payload, tenantId) {
  if (!tenantId || !payload) return payload;

  const enrichRecord = (record) => {
    if (!record || typeof record !== 'object') return record;
    if (table === 'operators') {
      const idVal = record.tenant_id || record.id || tenantId;
      return { ...record, tenant_id: String(idVal) };
    }
    if (TENANT_SCOPED_TABLES.has(table)) {
      const effectiveTenant = String(record.tenant_id || record.operator_id || tenantId);
      const enriched = {
        ...record,
        tenant_id: effectiveTenant,
      };
      if (table !== 'ticket_queued_forfaits') {
        enriched.operator_id = effectiveTenant;
      }
      if (table === 'tickets' && !enriched.router_id) {
        enriched.router_id = 'all';
      }
      return enriched;
    }
    return record;
  };

  if (Array.isArray(payload)) {
    return payload.map(enrichRecord);
  }
  return enrichRecord(payload);
}

function appendTenantFilterToQuery(table, query, tenantId, method) {
  const cleanQuery = String(query || '').replace(/^\?/, '');
  if (!tenantId || method === 'POST') return cleanQuery;

  if (TENANT_SCOPED_TABLES.has(table)) {
    if (!cleanQuery.includes('tenant_id=')) {
      const filter = `tenant_id=eq.${encodeURIComponent(tenantId)}`;
      return cleanQuery ? `${cleanQuery}&${filter}` : filter;
    }
  }
  return cleanQuery;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-tenant-id');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const supabaseUrl =
    process.env.VITE_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    'https://qvpgehfttufecuapntnm.supabase.co';
  const supabaseKey =
    process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

  if (!supabaseKey) {
    return res.status(500).json({ error: 'Clé backend Cloud non configurée sur le serveur' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};

    // Action spéciale de purge complète des 12 tables de la base Supabase
    if (body.action === 'PURGE_ALL_TEST_DATA') {
      const baseHeaders = {
        'Content-Type': 'application/json',
        apikey: supabaseKey,
      };
      if (supabaseKey.startsWith('eyJ')) {
        baseHeaders.Authorization = `Bearer ${supabaseKey}`;
      }

      // 1. Tenter via la fonction RPC purge_all_test_data() si déjà installée
      await fetch(`${supabaseUrl}/rest/v1/rpc/purge_all_test_data`, {
        method: 'POST',
        headers: baseHeaders,
        body: JSON.stringify({}),
      }).catch(() => {});

      // 2. Exécuter en parallèle un DELETE sur chacune des 12 tables (via filtre id non nul)
      for (const tbl of ALL_TABLES_TO_PURGE) {
        await fetch(`${supabaseUrl}/rest/v1/${tbl}?id=not.is.null`, {
          method: 'DELETE',
          headers: baseHeaders,
        }).catch(() => {});
      }

      return res.status(200).json({ ok: true, purgedTables: ALL_TABLES_TO_PURGE });
    }

    const { table, method = 'GET', query = '', payload, prefer } = body;

    if (!table) {
      return res.status(400).json({ error: 'Paramètre table manquant' });
    }

    const headerTenant = req.headers['x-tenant-id'];
    const tenantId = String(
      headerTenant ||
        body.tenantId ||
        body.operatorId ||
        (Array.isArray(payload) && payload[0]?.tenant_id) ||
        (Array.isArray(payload) && payload[0]?.operator_id) ||
        payload?.tenant_id ||
        payload?.operator_id ||
        ''
    ).trim();

    if (TENANT_SCOPED_TABLES.has(table) && !tenantId) {
      return res.status(401).json({
        ok: false,
        error: 'Isolation Multi-Tenant : identifiant opérateur (tenant_id) requis.',
      });
    }

    const headers = {
      'Content-Type': 'application/json',
      apikey: supabaseKey,
    };
    const callerAuth = req.headers.authorization;
    if (callerAuth && callerAuth.startsWith('Bearer ')) {
      headers.Authorization = callerAuth;
    } else if (supabaseKey.startsWith('eyJ')) {
      headers.Authorization = `Bearer ${supabaseKey}`;
    }
    if (tenantId) {
      headers['x-tenant-id'] = tenantId;
    }
    if (prefer) {
      headers.Prefer = prefer;
    }

    const scopedQuery = appendTenantFilterToQuery(table, query, tenantId, method);
    const scopedPayload =
      payload !== undefined && (method === 'POST' || method === 'PATCH')
        ? injectTenantIntoPayload(table, payload, tenantId)
        : payload;

    const url = `${supabaseUrl}/rest/v1/${table}${scopedQuery ? `?${scopedQuery}` : ''}`;
    const fetchOptions = {
      method,
      headers,
    };
    if (scopedPayload !== undefined && method !== 'GET' && method !== 'DELETE') {
      fetchOptions.body = JSON.stringify(scopedPayload);
    }

    const response = await fetch(url, fetchOptions);
    const text = await response.text();
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }

    return res.status(response.status).json({
      ok: response.ok,
      status: response.status,
      tenantId: tenantId || null,
      data,
    });
  } catch (err) {
    return res.status(500).json({ ok: false, error: String(err) });
  }
}
