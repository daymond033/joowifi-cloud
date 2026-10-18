// ============================================================================
// JOOWIFI CLOUD — CONNECTEUR SUPABASE REST & RPC (SANS DÉPENDANCE EXTERNE)
// Se connecte automatiquement à VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY
// ============================================================================

const SUPABASE_URL =
  (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_SUPABASE_URL ||
  'https://qvpgehfttufecuapntnm.supabase.co';

const SUPABASE_ANON_KEY =
  (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_SUPABASE_ANON_KEY ||
  '';

export const isSupabaseConfigured = (): boolean => {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
};

const getHeaders = (preferReturn = false): HeadersInit => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    apikey: SUPABASE_ANON_KEY,
  };
  if (SUPABASE_ANON_KEY.startsWith('eyJ')) {
    headers.Authorization = `Bearer ${SUPABASE_ANON_KEY}`;
  }
  if (preferReturn) {
    headers.Prefer = 'return=representation';
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

export async function supabaseInsert<T>(table: string, payload: unknown): Promise<T[] | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: 'POST',
      headers: getHeaders(true),
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
