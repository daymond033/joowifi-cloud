// ============================================================================
// JOOWIFI CLOUD v6.3 — API DE SYNCHRONISATION MIKROTIK MULTI-TENANT ISOLÉE
// URL : https://joowifi-cloud.vercel.app/api/v1/mikrotik/heartbeat
//
// Sécurité Multi-Tenant :
// 1. Exige obligatoirement le Token unique d'identification du routeur (`token`).
// 2. Aucun fallback vers un compte global n'est autorisé.
// 3. Délègue à la fonction RPC PostgreSQL `public.mikrotik_heartbeat` (et
//    `public.mikrotik_record_authevent`) qui filtre strictement les tickets et
//    commandes par `tenant_id` du propriétaire du routeur ET `router_id`.
// ============================================================================

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

  const query = req.query || {};
  const body = req.body || {};

  const mode = String(query.mode || body.mode || 'heartbeat').trim();
  const token = String(query.token || body.token || '').trim();
  const cpu = Math.min(100, Math.max(0, Math.round(Number(query.cpu || body.cpu || 12))));
  const ram = Math.min(100, Math.max(0, Math.round(Number(query.ram || body.ram || 34))));
  const uptime = String(query.uptime || body.uptime || '01j 00h 00m');
  const active = Math.max(0, Math.round(Number(query.active || query.users || body.activeUsers || 0)));
  const version = String(query.version || body.version || 'v7.23.8');
  const jwUsersParam = query.jw_users !== undefined ? Number(query.jw_users) : -1;

  // 1. Exiger un Token unique d'identification du routeur (Zéro token par défaut partagé !)
  if (!token) {
    return res
      .status(401)
      .send('# [JOOWIFI] ERREUR : Token unique du routeur requis (?token=JWT-...)\n');
  }

  const supabaseUrl =
    process.env.VITE_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    'https://qvpgehfttufecuapntnm.supabase.co';
  const supabaseKey =
    process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

  if (!supabaseKey) {
    return res
      .status(200)
      .send(`# [JOOWIFI] Heartbeat recu pour ${token} (Cle Cloud en attente)\n`);
  }

  const headers = {
    'Content-Type': 'application/json',
    apikey: supabaseKey,
  };
  if (supabaseKey.startsWith('eyJ')) {
    headers.Authorization = `Bearer ${supabaseKey}`;
  }

  try {
    // 2. MODE AUTH-EVENT ISOLÉ PAR TOKEN ROUTEUR :
    // Active le ticket et crée la session active uniquement dans le `tenant_id` propriétaire de ce routeur
    if (mode === 'authevent') {
      const code = String(query.code || body.code || '').trim();
      const evType = String(query.event || body.event || 'login').trim();
      if (code && evType === 'login') {
        await fetch(`${supabaseUrl}/rest/v1/rpc/mikrotik_record_authevent`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            p_token: token,
            p_code: code,
            p_ip: String(query.ip || '10.5.50.10'),
            p_mac: String(query.mac || '00:00:00:00:00:00'),
          }),
        });
      }
      return res.status(200).send(`# [JOOWIFI] Auth event recorded (${code})\n`);
    }

    // 3. SYNCHRONISATION HEARTBEAT / FAST-POLL ISOLÉE PAR TENANT & ROUTEUR :
    // La fonction RPC `public.mikrotik_heartbeat` résout `v_router_id` et `v_tenant_id` à partir
    // de `p_token`, réarme `router_synced = false` uniquement pour ce `tenant_id` si `p_jw_users = 0`,
    // et ne renvoie que les tickets et commandes appartenant à ce `tenant_id` et ce `router_id`.
    let rpcRes = await fetch(`${supabaseUrl}/rest/v1/rpc/mikrotik_heartbeat`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        p_token: token,
        p_cpu: cpu,
        p_ram: ram,
        p_uptime: uptime,
        p_active_users: active,
        p_version: version,
        p_jw_users: jwUsersParam,
      }),
    });

    // Rétrocompatibilité si la migration SQL à 7 paramètres n'a pas encore été exécutée
    if (!rpcRes.ok) {
      rpcRes = await fetch(`${supabaseUrl}/rest/v1/rpc/mikrotik_heartbeat`, {
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
    }

    if (rpcRes.ok) {
      const scriptResult = await rpcRes.json();
      if (typeof scriptResult === 'string' && scriptResult.trim() !== '') {
        return res.status(200).send(`${scriptResult.trim()}\n`);
      }
    }

    return res.status(200).send(`# [JOOWIFI] Heartbeat OK - Aucune commande en attente\n`);
  } catch (err) {
    return res.status(200).send(`# [JOOWIFI] Heartbeat secours OK (${token})\n`);
  }
}
