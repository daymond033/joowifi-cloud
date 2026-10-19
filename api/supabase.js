// ============================================================================
// JOOWIFI CLOUD — VERCEL SERVERLESS PROXY VERS SUPABASE REST API
// Garantit que toutes les lectures/écritures vers les 12 tables Supabase
// passent à 100%, même si un bloqueur navigateur filtre les appels tiers.
// ============================================================================

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

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
    return res.status(500).json({ error: 'VITE_SUPABASE_ANON_KEY non configurée sur Vercel' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const { table, method = 'GET', query = '', payload, prefer } = body;

    if (!table) {
      return res.status(400).json({ error: 'Paramètre table manquant' });
    }

    const headers = {
      'Content-Type': 'application/json',
      apikey: supabaseKey,
    };
    if (supabaseKey.startsWith('eyJ')) {
      headers.Authorization = `Bearer ${supabaseKey}`;
    }
    if (prefer) {
      headers.Prefer = prefer;
    }

    const url = `${supabaseUrl}/rest/v1/${table}${query ? `?${query}` : ''}`;
    const fetchOptions = {
      method,
      headers,
    };
    if (payload !== undefined && method !== 'GET' && method !== 'DELETE') {
      fetchOptions.body = JSON.stringify(payload);
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
      data,
    });
  } catch (err) {
    return res.status(500).json({ ok: false, error: String(err) });
  }
}
