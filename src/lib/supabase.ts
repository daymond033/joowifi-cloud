// ============================================================================
// JOOWIFI CLOUD — CONNECTEUR UNIVERSEL SUPABASE (DIRECT + RELAIS SERVERLESS /api/supabase)
// Synchronise les 12 tables PostgreSQL avec déduplication automatique des lots
// ============================================================================

const SUPABASE_URL: string =
  import.meta.env.VITE_SUPABASE_URL || 'https://qvpgehfttufecuapntnm.supabase.co';

const SUPABASE_ANON_KEY: string = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = (): boolean => {
  // Toujours actif : utilise la clé directe si présente, ou le relais /api/supabase sur Vercel
  return true;
};

const getHeaders = (preferHeader?: string): HeadersInit => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    apikey: SUPABASE_ANON_KEY,
  };
  if (SUPABASE_ANON_KEY.startsWith('eyJ')) {
    headers.Authorization = `Bearer ${SUPABASE_ANON_KEY}`;
  }
  if (preferHeader) {
    headers.Prefer = preferHeader;
  }
  return headers;
};

/**
 * Déduplique un tableau d'objets selon les colonnes de conflit (ex: "operator_id,code")
 * pour éviter l'erreur PostgreSQL 21000 ("ON CONFLICT DO UPDATE cannot affect row a second time")
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
  prefer?: string
): Promise<T | null> {
  try {
    const res = await fetch('/api/supabase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ table, method, query, payload, prefer }),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.ok ? (json.data as T) : null;
  } catch {
    return null;
  }
}

export async function supabaseSelect<T>(table: string, query = 'select=*'): Promise<T[] | null> {
  if (SUPABASE_ANON_KEY) {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${query}`, {
        method: 'GET',
        headers: getHeaders(),
      });
      if (res.ok) {
        return (await res.json()) as T[];
      }
    } catch {
      // Fallback proxy below
    }
  }
  return callProxy<T[]>(table, 'GET', query);
}

export async function supabaseInsert<T>(
  table: string,
  payload: unknown,
  upsertConflictCols?: string
): Promise<T[] | null> {
  const cleanPayload = deduplicateBatch(payload, upsertConflictCols);
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
        headers: getHeaders(prefer),
        body: JSON.stringify(cleanPayload),
      });
      if (res.ok) {
        return (await res.json()) as T[];
      }
    } catch {
      // Fallback proxy below
    }
  }
  return callProxy<T[]>(table, 'POST', query, cleanPayload, prefer);
}

export async function supabaseUpdate(
  table: string,
  filterQuery: string,
  payload: unknown
): Promise<boolean> {
  if (SUPABASE_ANON_KEY) {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${filterQuery}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });
      if (res.ok) return true;
    } catch {
      // Fallback proxy below
    }
  }
  const proxyRes = await callProxy(table, 'PATCH', filterQuery, payload);
  return proxyRes !== null;
}

export async function supabaseDelete(table: string, filterQuery: string): Promise<boolean> {
  if (SUPABASE_ANON_KEY) {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${filterQuery}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      if (res.ok) return true;
    } catch {
      // Fallback proxy below
    }
  }
  const proxyRes = await callProxy(table, 'DELETE', filterQuery);
  return proxyRes !== null;
}

export async function supabaseRpc<T = string>(
  fnName: string,
  params: Record<string, unknown>
): Promise<T | null> {
  if (SUPABASE_ANON_KEY) {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fnName}`, {
        method: 'POST',
        headers: getHeaders(),
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
