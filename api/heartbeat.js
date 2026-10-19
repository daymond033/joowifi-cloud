// ============================================================================
// JOOWIFI CLOUD — VERCEL SERVERLESS ENDPOINT : HEARTBEAT MIKROTIK (45s)
// URL : https://joowifi-cloud.vercel.app/api/v1/mikrotik/heartbeat
// ============================================================================

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');

  const query = req.query || {};
  const body = req.body || {};

  const token = String(query.token || body.token || 'JWT-AF6L-JG37-7K23').trim();
  const cpu = Number(query.cpu || body.cpu || 12);
  const ram = Number(query.ram || body.ram || 34);
  const uptime = String(query.uptime || body.uptime || '01j 00h 00m');
  const active = Number(query.active || body.activeUsers || 0);
  const version = String(query.version || body.version || 'v7.15.2');

  const supabaseUrl =
    process.env.VITE_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    'https://qvpgehfttufecuapntnm.supabase.co';
  const supabaseKey =
    process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

  if (!supabaseKey) {
    return res
      .status(200)
      .send(`# [JOOWIFI] Heartbeat recu pour ${token} (Cle Supabase en attente)\n`);
  }

  try {
    const headers = {
      'Content-Type': 'application/json',
      apikey: supabaseKey,
    };
    if (supabaseKey.startsWith('eyJ')) {
      headers.Authorization = `Bearer ${supabaseKey}`;
    }

    const rpcRes = await fetch(`${supabaseUrl}/rest/v1/rpc/mikrotik_heartbeat`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        p_token: token,
        p_cpu: cpu,
        p_ram: ram,
        p_uptime: uptime,
        p_active_users: active,
        p_version: version,
      }),
    });

    if (!rpcRes.ok) {
      return res
        .status(200)
        .send(`# [JOOWIFI] Heartbeat OK (${token}) - Aucune commande en attente\n`);
    }

    const scriptResult = await rpcRes.json();
    const cleanScript =
      typeof scriptResult === 'string'
        ? scriptResult
        : '# [JOOWIFI] Heartbeat OK - Aucune commande en attente';

    return res.status(200).send(`${cleanScript}\n`);
  } catch (err) {
    return res
      .status(200)
      .send(`# [JOOWIFI] Heartbeat secours OK (${token})\n`);
  }
}
