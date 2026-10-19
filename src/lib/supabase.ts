// ============================================================================
// JOOWIFI CLOUD — CONNECTEUR SUPABASE REST & RPC (VITE PRODUCTION NATIF)
// Utilise import.meta.env.VITE_SUPABASE_URL et import.meta.env.VITE_SUPABASE_ANON_KEY
// ============================================================================

const SUPABASE_URL: string =
  import.meta.env.VITE_SUPABASE_URL || 'https://qvpgehfttufecuapntnm.supabase.co';

const SUPABASE_ANON_KEY: string = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = (): boolean => {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
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

export async function supabaseSelect<T>(table: string, query = 'select=*'): Promise<T[] | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${query}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    if (!res.ok) return null;
    return (await res.json()) as T[];
  } catch {
    return null;
  }
}

export async function supabaseInsert<T>(
  table: string,
  payload: unknown,
  upsertConflictCols?: string
): Promise<T[] | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const url = upsertConflictCols
      ? `${SUPABASE_URL}/rest/v1/${table}?on_conflict=${upsertConflictCols}`
      : `${SUPABASE_URL}/rest/v1/${table}`;
    const prefer = upsertConflictCols
      ? 'return=representation,resolution=merge-duplicates'
      : 'return=representation';
    const res = await fetch(url, {
      method: 'POST',
      headers: getHeaders(prefer),
      body: JSON.stringify(payload),
    });
    if (!res.ok) return null;
    return (await res.json()) as T[];
  } catch {
    return null;
  }
}

export async function supabaseUpdate(
  table: string,
  filterQuery: string,
  payload: unknown
): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${filterQuery}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function supabaseDelete(table: string, filterQuery: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${filterQuery}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function supabaseRpc<T = string>(
  fnName: string,
  params: Record<string, unknown>
): Promise<T | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fnName}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(params),
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export { SUPABASE_URL };
