// ============================================================================
// JOOWIFI CLOUD v6.4 — API DE SYNCHRONISATION MIKROTIK MULTI-TENANT (HEARTBEAT & FASTPOLL)
// URL : https://joowifi-cloud.vercel.app/api/v1/mikrotik/heartbeat
//
// Implémente les 3 Points de l'Audit Technique :
// 1. Intercepte le `token` du routeur (?token=JWT-...) et résout son `tenant_id`
//    (dans `routers`, `tickets` ou `operators`).
// 2. Auto-Provisioning : si le routeur n'existe pas encore dans `public.routers`
//    (ex: après un TRUNCATE), l'enregistre automatiquement avec `status = 'online'`
//    rattaché au `tenant_id` de l'opérateur !
// 3. Force le contexte de sécurité (`x-tenant-id`) et renvoie tous les tickets
//    non synchronisés (`router_synced = false`) de cet opérateur au MikroTik.
// ============================================================================

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

  const query = req.query || {};
  const body = req.body || {};

  const mode = String(query.mode || body.mode || 'heartbeat').trim();
  const token = String(query.token || body.token || '').trim();
  const explicitTenantId = String(query.tenant_id || body.tenant_id || '').trim();
  const cpu = Math.min(100, Math.max(0, Math.round(Number(query.cpu || body.cpu || 12))));
  const ram = Math.min(100, Math.max(0, Math.round(Number(query.ram || body.ram || 34))));
  const uptime = String(query.uptime || body.uptime || '01j 00h 00m');
  const active = Math.max(0, Math.round(Number(query.active || query.users || body.activeUsers || 0)));
  const version = String(query.version || body.version || 'v7.23.8');
  const jwUsersParam = query.jw_users !== undefined ? Number(query.jw_users) : -1;

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

  const baseHeaders = {
    'Content-Type': 'application/json',
    apikey: supabaseKey,
  };
  if (supabaseKey.startsWith('eyJ')) {
    baseHeaders.Authorization = `Bearer ${supabaseKey}`;
  }

  try {
    // ========================================================================
    // POINT 1 DE L'AUDIT : Résoudre à quel `tenant_id` (operator_id) appartient ce routeur
    // ========================================================================
    let routerId = null;
    let tenantId = explicitTenantId || null;

    const routerLookupRes = await fetch(
      `${supabaseUrl}/rest/v1/routers?install_token=ilike.${encodeURIComponent(token)}&select=id,tenant_id,operator_id,name&limit=1`,
      { method: 'GET', headers: baseHeaders }
    );
    if (routerLookupRes.ok) {
      const foundRouters = await routerLookupRes.json();
      if (Array.isArray(foundRouters) && foundRouters.length > 0) {
        routerId = String(foundRouters[0].id || '');
        tenantId = String(foundRouters[0].tenant_id || foundRouters[0].operator_id || tenantId || '');
      }
    }

    // Si le routeur n'est pas encore dans `public.routers` (ex: après TRUNCATE),
    // chercher le `tenant_id` actif dans `public.tickets` ou `public.operators`
    if (!tenantId) {
      const ticketTenantRes = await fetch(
        `${supabaseUrl}/rest/v1/tickets?select=tenant_id,operator_id&order=created_at.desc&limit=1`,
        { method: 'GET', headers: baseHeaders }
      );
      if (ticketTenantRes.ok) {
        const tList = await ticketTenantRes.json();
        if (Array.isArray(tList) && tList.length > 0) {
          tenantId = String(tList[0].tenant_id || tList[0].operator_id || '');
        }
      }
    }

    if (!tenantId) {
      const opRes = await fetch(
        `${supabaseUrl}/rest/v1/operators?select=id,tenant_id&order=created_at.desc&limit=1`,
        { method: 'GET', headers: baseHeaders }
      );
      if (opRes.ok) {
        const opList = await opRes.json();
        if (Array.isArray(opList) && opList.length > 0) {
          tenantId = String(opList[0].tenant_id || opList[0].id || '');
        }
      }
    }

    if (!tenantId) {
      return res
        .status(200)
        .send('# [JOOWIFI] En attente de creation d un compte operateur dans la console\n');
    }

    // En-têtes avec contexte de sécurité forcé pour ce Tenant (`x-tenant-id`)
    const tenantHeaders = {
      ...baseHeaders,
      'x-tenant-id': tenantId,
    };

    // ========================================================================
    // POINT 3 DE L'AUDIT : Enregistrement (Provisioning) & Mise en ligne du Routeur
    // Garantit que le routeur apparaît "En ligne" dans la Console Web de l'opérateur !
    // ========================================================================
    if (!routerId) {
      routerId = `rb-${token.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
      await fetch(`${supabaseUrl}/rest/v1/routers?on_conflict=install_token`, {
        method: 'POST',
        headers: {
          ...tenantHeaders,
          Prefer: 'resolution=merge-duplicates,return=minimal',
        },
        body: JSON.stringify([
          {
            id: routerId,
            tenant_id: tenantId,
            operator_id: tenantId,
            zone_id: 'Zone Principale',
            name: `MikroTik Hotspot (${token})`,
            model: `MikroTik RouterOS ${version}`,
            install_token: token,
            ip_address: '10.5.50.1',
            routeros_version: version,
            status: 'online',
            last_heartbeat_at: new Date().toISOString(),
            uptime,
            cpu_usage: cpu,
            ram_usage: ram,
            total_subscribers: active,
          },
        ]),
      });
    } else {
      await fetch(
        `${supabaseUrl}/rest/v1/routers?install_token=ilike.${encodeURIComponent(token)}`,
        {
          method: 'PATCH',
          headers: tenantHeaders,
          body: JSON.stringify({
            status: 'online',
            tenant_id: tenantId,
            operator_id: tenantId,
            last_heartbeat_at: new Date().toISOString(),
            cpu_usage: cpu,
            ram_usage: ram,
            uptime,
            total_subscribers: active,
            routeros_version: version,
          }),
        }
      );
    }

    // ========================================================================
    // MODE AUTH-EVENT : Quand un client se connecte avec un ticket sur le MikroTik
    // ========================================================================
    if (mode === 'authevent') {
      const code = String(query.code || body.code || '').trim();
      const evType = String(query.event || body.event || 'login').trim();
      if (code && evType === 'login') {
        await fetch(
          `${supabaseUrl}/rest/v1/tickets?tenant_id=eq.${encodeURIComponent(tenantId)}&code=ilike.${encodeURIComponent(code)}`,
          {
            method: 'PATCH',
            headers: tenantHeaders,
            body: JSON.stringify({
              status: 'actif',
              activated_at: new Date().toISOString(),
              mac_address: String(query.mac || ''),
            }),
          }
        );
        await fetch(`${supabaseUrl}/rest/v1/active_sessions?on_conflict=operator_id,username`, {
          method: 'POST',
          headers: { ...tenantHeaders, Prefer: 'resolution=merge-duplicates,return=minimal' },
          body: JSON.stringify([
            {
              tenant_id: tenantId,
              operator_id: tenantId,
              router_id: routerId,
              username: code,
              ip_address: String(query.ip || '10.5.50.10'),
              mac_address: String(query.mac || '00:00:00:00:00:00'),
              forfait_name: 'Session Hotspot MikroTik',
              uptime_minutes: 1,
              device_type: 'smartphone',
            },
          ]),
        });
      }
      return res.status(200).send(`# [JOOWIFI] Auth event recorded (${code})\n`);
    }

    // ========================================================================
    // SYNCHRONISATION DES TICKETS & COMMANDES POUR CE TENANT UNIQUEMENT
    // ========================================================================
    // Si le routeur signale jw_users=0 (aucun ticket dans IP > Hotspot > Users),
    // on réarme `router_synced = false` sur tous les tickets de ce `tenant_id` !
    if (jwUsersParam === 0) {
      await fetch(
        `${supabaseUrl}/rest/v1/tickets?tenant_id=eq.${encodeURIComponent(tenantId)}&status=neq.expire`,
        {
          method: 'PATCH',
          headers: tenantHeaders,
          body: JSON.stringify({ router_synced: false }),
        }
      );
    }

    // 1. Récupérer les tickets non synchronisés de cet opérateur (`tenant_id`)
    const ticketsRes = await fetch(
      `${supabaseUrl}/rest/v1/tickets?tenant_id=eq.${encodeURIComponent(tenantId)}&select=id,code,password,forfait_id,price_xof,duration_label,status,router_synced,router_id&order=created_at.asc&limit=500`,
      { method: 'GET', headers: tenantHeaders }
    );

    const scriptLines = [];
    const syncedTicketCodes = [];

    if (ticketsRes.ok) {
      const allTickets = await ticketsRes.json();
      if (Array.isArray(allTickets)) {
        const unsynced = allTickets.filter(
          (t) =>
            t &&
            t.code &&
            t.status !== 'expire' &&
            t.status !== 'bloque' &&
            t.router_synced !== true &&
            (!t.router_id || t.router_id === 'all' || t.router_id === routerId)
        );

        for (const t of unsynced) {
          const code = String(t.code).replace(/"/g, '');
          const pwd = String(t.password || t.code).replace(/"/g, '');
          const dur = String(t.duration_label || '24h').replace(/"/g, '').replace('j', 'd');
          const prof = String(t.forfait_id || '').toLowerCase().includes('vip')
            ? 'joowifi-vip'
            : 'joowifi-standard';
          const cmt = `JW:${String(t.forfait_id || 'Pass WiFi').replace(/"/g, '')} (${t.price_xof || 0}F)`;
          scriptLines.push(
            `:do { /ip hotspot user add name="${code}" password="${pwd}" profile="${prof}" limit-uptime="${dur}" comment="${cmt}" } on-error={}`
          );
          syncedTicketCodes.push(code);
        }
      }
    }

    // Marquer immédiatement ces tickets comme synchronisés (`router_synced = true`)
    if (syncedTicketCodes.length > 0) {
      const inList = syncedTicketCodes.map((c) => encodeURIComponent(c)).join(',');
      await fetch(
        `${supabaseUrl}/rest/v1/tickets?tenant_id=eq.${encodeURIComponent(tenantId)}&code=in.(${inList})`,
        {
          method: 'PATCH',
          headers: tenantHeaders,
          body: JSON.stringify({
            router_synced: true,
            synced_at: new Date().toISOString(),
          }),
        }
      );
    }

    // 2. Récupérer les commandes en attente dans `heartbeat_commands` pour ce `tenant_id`
    const cmdRes = await fetch(
      `${supabaseUrl}/rest/v1/heartbeat_commands?tenant_id=eq.${encodeURIComponent(tenantId)}&status=eq.pending&select=id,routeros_script&order=created_at.asc&limit=100`,
      { method: 'GET', headers: tenantHeaders }
    );
    if (cmdRes.ok) {
      const pendingCmds = await cmdRes.json();
      if (Array.isArray(pendingCmds) && pendingCmds.length > 0) {
        for (const c of pendingCmds) {
          if (c.routeros_script) {
            const cleaned = String(c.routeros_script).replace(
              /profile="jw-prof-[^"]*"/g,
              'profile="joowifi-standard"'
            );
            scriptLines.push(
              cleaned.startsWith(':do {') ? cleaned : `:do { ${cleaned} } on-error={}`
            );
          }
        }
        await fetch(
          `${supabaseUrl}/rest/v1/heartbeat_commands?tenant_id=eq.${encodeURIComponent(tenantId)}&status=eq.pending`,
          {
            method: 'PATCH',
            headers: tenantHeaders,
            body: JSON.stringify({
              status: 'delivered',
              delivered_at: new Date().toISOString(),
            }),
          }
        );
      }
    }

    if (scriptLines.length === 0) {
      return res
        .status(200)
        .send(`# [JOOWIFI] Heartbeat OK - Routeur EN LIGNE (${token}) - Aucune commande en attente\n`);
    }

    const profilesHeader = [
      ':do { /ip hotspot user profile add name="joowifi-standard" rate-limit="10M/3M" shared-users=1000 mac-cookie-timeout=30d } on-error={}',
      ':do { /ip hotspot user profile add name="joowifi-vip" rate-limit="25M/8M" shared-users=1000 mac-cookie-timeout=30d } on-error={}',
    ].join('\n');

    return res.status(200).send(`${profilesHeader}\n${scriptLines.join('\n')}\n`);
  } catch (err) {
    return res.status(200).send(`# [JOOWIFI] Heartbeat secours OK (${token})\n`);
  }
}
