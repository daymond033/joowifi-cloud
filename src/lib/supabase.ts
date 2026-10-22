// ============================================================================
// JOOWIFI CLOUD v6.3 — CONNECTEUR MULTI-TENANT & RLS (DIRECT + RELAIS /api/supabase)
// Transmet automatiquement l'identifiant du locataire (`tenant_id` / `x-tenant-id`)
// sur chaque lecture, création, modification et suppression.
// ============================================================================

const SUPABASE_URL: string =
  import.meta.env.VITE_SUPABASE_URL || 'https://qvpgehfttufecuapntnm.supabase.co';

const SUPABASE_ANON_KEY: string = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const DEFAULT_MAIN_TENANT_ID = '11111111-1111-1111-1111-111111111111';

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

/**
 * Récupère le `tenant_id` de l'opérateur (ou du patron du vendeur POS) actuellement connecté.
 */
export function getActiveTenantId(): string {
  try {
    const rawUser = localStorage.getItem('joowifi_auth_user');
    if (rawUser) {
      const parsed = JSON.parse(rawUser);
      if (parsed && parsed.tenantId && String(parsed.tenantId).trim() !== '') {
        return String(parsed.tenantId).trim();
      }
    }
    const rawTenant = localStorage.getItem('joowifi_active_tenant_id');
    if (rawTenant && rawTenant.trim() !== '') {
      return rawTenant.replace(/^"|"$/g, '').trim();
    }
  } catch {
    // Ignore storage errors
  }
  return DEFAULT_MAIN_TENANT_ID;
}

export function setActiveTenantId(tenantId: string): void {
  try {
    localStorage.setItem('joowifi_active_tenant_id', tenantId.trim());
  } catch {
    // Ignore
  }
}

export const isSupabaseConfigured = (): boolean => {
  return true;
};

const getHeaders = (preferHeader?: string, customTenantId?: string): HeadersInit => {
  const tenantId = customTenantId || getActiveTenantId();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    apikey: SUPABASE_ANON_KEY,
    'x-tenant-id': tenantId,
  };
  if (SUPABASE_ANON_KEY.startsWith('eyJ')) {
    headers.Authorization = `Bearer ${SUPABASE_ANON_KEY}`;
  }
  if (preferHeader) {
    headers.Prefer = preferHeader;
  }
  return headers;
};

function enrichPayloadWithTenant(table: string, payload: unknown, tenantId: string): unknown {
  if (!payload || !tenantId) return payload;

  const enrichOne = (item: unknown) => {
    if (!item || typeof item !== 'object') return item;
    const rec = item as Record<string, unknown>;
    if (table === 'operators') {
      const tId = String(rec.tenant_id || rec.id || tenantId);
      return { ...rec, tenant_id: tId };
    }
    if (TENANT_SCOPED_TABLES.has(table)) {
      const effectiveTenant = String(rec.tenant_id || rec.operator_id || tenantId);
      const next: Record<string, unknown> = {
        ...rec,
        tenant_id: effectiveTenant,
      };
      if (table !== 'ticket_queued_forfaits') {
        next.operator_id = effectiveTenant;
      }
      if (table === 'tickets' && !next.router_id) {
        next.router_id = 'all';
      }
      return next;
    }
    return rec;
  };

  if (Array.isArray(payload)) {
    return payload.map(enrichOne);
  }
  return enrichOne(payload);
}

function appendTenantFilter(table: string, query: string, tenantId: string): string {
  const clean = query.replace(/^\?/, '');
  if (!tenantId || !TENANT_SCOPED_TABLES.has(table)) return clean;
  if (clean.includes('tenant_id=')) return clean;
  const filter = `tenant_id=eq.${encodeURIComponent(tenantId)}`;
  return clean ? `${clean}&${filter}` : filter;
}

/**
 * Déduplique un tableau d'objets selon les colonnes de conflit (ex: "tenant_id,code")
 */
function deduplicateBatch(payload: unknown, conflictCols?: string): unknown {
  if (!Array.isArray(payload) || !conflictCols) return payload;
  const cols = conflictCols.split(',').map((c) => c.trim());
  const seen = new Map<string, Record<string, unknown>>();
  for (const item of payload) {
    if (item && typeof item === 'object') {
      const record = item as Record<string, unknown>;
      const key = cols.map((col) => String(record[col] ?? '')).join('::').toLowerCase();
      seen.set(key, record);
    }
  }
  return Array.from(seen.values());
}

async function callProxy<T>(
  table: string,
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
  query = '',
  payload?: unknown,
  prefer?: string,
  customTenantId?: string
): Promise<T | null> {
  const tenantId = customTenantId || getActiveTenantId();
  try {
    const res = await fetch('/api/supabase', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-id': tenantId,
      },
      body: JSON.stringify({
        table,
        method,
        query,
        payload,
        prefer,
        tenantId,
      }),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.ok ? (json.data as T) : null;
  } catch {
    return null;
  }
}

export async function supabaseSelect<T>(
  table: string,
  query = 'select=*',
  customTenantId?: string
): Promise<T[] | null> {
  const tenantId = customTenantId || getActiveTenantId();
  const scopedQuery = appendTenantFilter(table, query, tenantId);

  if (SUPABASE_ANON_KEY) {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${scopedQuery}`, {
        method: 'GET',
        headers: getHeaders(undefined, tenantId),
      });
      if (res.ok) {
        return (await res.json()) as T[];
      }
    } catch {
      // Fallback proxy below
    }
  }
  return callProxy<T[]>(table, 'GET', scopedQuery, undefined, undefined, tenantId);
}

export async function supabaseInsert<T>(
  table: string,
  payload: unknown,
  upsertConflictCols?: string,
  customTenantId?: string
): Promise<T[] | null> {
  const tenantId = customTenantId || getActiveTenantId();
  const enriched = enrichPayloadWithTenant(table, payload, tenantId);
  const cleanPayload = deduplicateBatch(enriched, upsertConflictCols);
  if (Array.isArray(cleanPayload) && cleanPayload.length === 0) return [];

  const query = upsertConflictCols ? `on_conflict=${upsertConflictCols}` : '';
  const prefer = upsertConflictCols
    ? 'return=representation,resolution=merge-duplicates'
    : 'return=representation';

  if (SUPABASE_ANON_KEY) {
    try {
      const url = `${SUPABASE_URL}/rest/v1/${table}${query ? `?${query}` : ''}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: getHeaders(prefer, tenantId),
        body: JSON.stringify(cleanPayload),
      });
      if (res.ok) {
        return (await res.json()) as T[];
      }
      // Si l'index de conflit utilise tenant_id,code au lieu de operator_id,code (ou inversement), tenter avec tenant_id
      if (upsertConflictCols && upsertConflictCols.includes('operator_id')) {
        const altConflict = upsertConflictCols.replace('operator_id', 'tenant_id');
        const altUrl = `${SUPABASE_URL}/rest/v1/${table}?on_conflict=${altConflict}`;
        const altRes = await fetch(altUrl, {
          method: 'POST',
          headers: getHeaders(prefer, tenantId),
          body: JSON.stringify(cleanPayload),
        });
        if (altRes.ok) {
          return (await altRes.json()) as T[];
        }
      }
    } catch {
      // Fallback proxy below
    }
  }
  return callProxy<T[]>(table, 'POST', query, cleanPayload, prefer, tenantId);
}

export async function supabaseUpdate(
  table: string,
  filterQuery: string,
  payload: unknown,
  customTenantId?: string
): Promise<boolean> {
  const tenantId = customTenantId || getActiveTenantId();
  const scopedFilter = appendTenantFilter(table, filterQuery, tenantId);
  const enrichedPayload = enrichPayloadWithTenant(table, payload, tenantId);

  if (SUPABASE_ANON_KEY) {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${scopedFilter}`, {
        method: 'PATCH',
        headers: getHeaders(undefined, tenantId),
        body: JSON.stringify(enrichedPayload),
      });
      if (res.ok) return true;
    } catch {
      // Fallback proxy below
    }
  }
  const proxyRes = await callProxy(
    table,
    'PATCH',
    scopedFilter,
    enrichedPayload,
    undefined,
    tenantId
  );
  return proxyRes !== null;
}

export async function supabaseDelete(
  table: string,
  filterQuery: string,
  customTenantId?: string
): Promise<boolean> {
  const tenantId = customTenantId || getActiveTenantId();
  const scopedFilter = appendTenantFilter(table, filterQuery, tenantId);

  if (SUPABASE_ANON_KEY) {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${scopedFilter}`, {
        method: 'DELETE',
        headers: getHeaders(undefined, tenantId),
      });
      if (res.ok) return true;
    } catch {
      // Fallback proxy below
    }
  }
  const proxyRes = await callProxy(table, 'DELETE', scopedFilter, undefined, undefined, tenantId);
  return proxyRes !== null;
}

export async function supabaseRpc<T = string>(
  fnName: string,
  params: Record<string, unknown>,
  customTenantId?: string
): Promise<T | null> {
  const tenantId = customTenantId || getActiveTenantId();
  if (SUPABASE_ANON_KEY) {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fnName}`, {
        method: 'POST',
        headers: getHeaders(undefined, tenantId),
        body: JSON.stringify(params),
      });
      if (res.ok) {
        return (await res.json()) as T;
      }
    } catch {
      // Ignore
    }
  }
  return null;
}

export { SUPABASE_URL };
