// ============================================================================
// JOOWIFI CLOUD v5.0 — ENDPOINT UNIFIE : HEARTBEAT (45s), FASTPOLL (10s) & AUTH
// URL : https://joowifi-cloud.vercel.app/api/v1/mikrotik/heartbeat
// Inclut la Réconciliation Automatique d'Inventaire avec public.tickets (Supabase)
// ============================================================================

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

  const query = req.query || {};
  const body = req.body || {};

  const mode = String(query.mode || body.mode || 'heartbeat').trim();
  const token = String(query.token || body.token || 'JWT-AF6L-JG37-7K23').trim();
  const cpu = Math.min(100, Math.max(0, Math.round(Number(query.cpu || body.cpu || 12))));
  const ram = Math.min(100, Math.max(0, Math.round(Number(query.ram || body.ram || 34))));
  const uptime = String(query.uptime || body.uptime || '01j 00h 00m');
  const active = Math.max(0, Math.round(Number(query.active || query.users || body.activeUsers || 0)));
  const version = String(query.version || body.version || 'v7.23.8');
  const jwUsersParam = query.jw_users !== undefined ? Number(query.jw_users) : -1;

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

  const headers = {
    'Content-Type': 'application/json',
    apikey: supabaseKey,
  };
  if (supabaseKey.startsWith('eyJ')) {
    headers.Authorization = `Bearer ${supabaseKey}`;
  }

  try {
    // 1. MODE AUTH-EVENT : Remontée temps réel quand un client se connecte sur le MikroTik
    if (mode === 'authevent') {
      const code = String(query.code || body.code || '').trim();
      const evType = String(query.event || body.event || 'login').trim();
      if (code && evType === 'login') {
        await fetch(`${supabaseUrl}/rest/v1/tickets?code=ilike.${encodeURIComponent(code)}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({
            status: 'actif',
            activated_at: new Date().toISOString(),
          }),
        });
        await fetch(`${supabaseUrl}/rest/v1/active_sessions?on_conflict=operator_id,username`, {
          method: 'POST',
          headers: { ...headers, Prefer: 'resolution=merge-duplicates,return=minimal' },
          body: JSON.stringify([
            {
              operator_id: '11111111-1111-1111-1111-111111111111',
              router_id: '33333333-3333-3333-3333-333333333331',
              username: code,
              ip_address: String(query.ip || '10.5.50.10'),
              mac_address: String(query.mac || 'AA:BB:CC:11:22:33'),
              forfait_name: 'Session Hotspot MikroTik',
              uptime_minutes: 1,
              device_type: 'smartphone',
            },
          ]),
        });
      }
      return res.status(200).send(`# [JOOWIFI] Auth event recorded (${code})\n`);
    }

    const outputLines = [
      ':do { /ip hotspot user profile add name="joowifi-standard" rate-limit="10M/3M" shared-users=1000 mac-cookie-timeout=30d } on-error={}',
      ':do { /ip hotspot user profile add name="joowifi-vip" rate-limit="25M/8M" shared-users=1000 mac-cookie-timeout=30d } on-error={}',
    ];

    // 2. Exécuter le RPC mikrotik_heartbeat pour récupérer les commandes 'pending'
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

    if (rpcRes.ok) {
      const scriptResult = await rpcRes.json();
      if (typeof scriptResult === 'string' && scriptResult.trim() !== '') {
        const rawLines = scriptResult.split('\n').map((l) => l.trim()).filter(Boolean);
        for (const line of rawLines) {
          if (line.startsWith('#')) {
            outputLines.push(line);
          } else if (line.startsWith(':do {')) {
            outputLines.push(line);
          } else {
            outputLines.push(`:do { ${line} } on-error={}`);
          }
        }
      }
    }

    // 3. RECONCILIATION D'INVENTAIRE AUTOMATIQUE :
    // Si le routeur a moins de tickets en mémoire que la table public.tickets (ou s'il vient d'être installé dans WinBox),
    // on lui envoie tous les tickets actifs/vendeur/stock de public.tickets !
    const ticketsRes = await fetch(
      `${supabaseUrl}/rest/v1/tickets?select=code,password,forfait_id,price_xof,duration_label,status&limit=500`,
      { method: 'GET', headers }
    );

    if (ticketsRes.ok) {
      const tickets = await ticketsRes.json();
      if (Array.isArray(tickets) && tickets.length > 0) {
        const validTickets = tickets.filter(
          (t) => t && t.code && t.status !== 'expire' && t.status !== 'bloque'
        );
        if (jwUsersParam < 0 || jwUsersParam < validTickets.length) {
          for (const t of validTickets) {
            const code = String(t.code).replace(/"/g, '');
            const pwd = String(t.password || t.code).replace(/"/g, '');
            const dur = String(t.duration_label || '24h').replace(/"/g, '').replace('j', 'd');
            const prof = String(t.forfait_id || '').toLowerCase().includes('vip')
              ? 'joowifi-vip'
              : 'joowifi-standard';
            const comment = `JW:${String(t.forfait_id || 'Pass WiFi').replace(/"/g, '')} (${t.price_xof || 0}F)`;
            outputLines.push(
              `:do { /ip hotspot user add name="${code}" password="${pwd}" profile="${prof}" limit-uptime="${dur}" comment="${comment}" } on-error={}`
            );
          }
        }
      }
    }

    return res.status(200).send(outputLines.join('\n') + '\n');
  } catch (err) {
    return res.status(200).send(`# [JOOWIFI] Heartbeat secours OK (${token})\n`);
  }
}
