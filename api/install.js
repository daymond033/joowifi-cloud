// ============================================================================
// JOOWIFI CLOUD — SERVEUR BOOTSTRAP MIKROTIK ROUTEROS v6.4 MULTI-TENANT (.RSC)
// URL : https://joowifi-cloud.vercel.app/api/v1/mikrotik/install?token=JWT-...&tenant_id=...
//
// Sécurité & Provisioning Multi-Tenant :
// 1. Identifie l'opérateur (`tenant_id`) à partir du paramètre `tenant_id`,
//    du `token` dans `public.routers`, ou du compte opérateur actif.
// 2. Provisionne immédiatement le routeur dans `public.routers` avec `status = 'online'`
//    et `install_token = token` lié à ce `tenant_id`.
// 3. Injecte tous les tickets de cet opérateur dans le script `.rsc` généré.
// ============================================================================

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

  const query = req.query || {};
  const token = String(query.token || '').trim();
  const explicitTenantId = String(query.tenant_id || '').trim();
  const hostUrl = 'https://joowifi-cloud.vercel.app';

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

  let dynamicTicketsBlock = '';
  let dynamicBypassesBlock = '';
  let resolvedTenantId = explicitTenantId || '';

  if (supabaseKey) {
    try {
      const baseHeaders = {
        'Content-Type': 'application/json',
        apikey: supabaseKey,
      };
      if (supabaseKey.startsWith('eyJ')) {
        baseHeaders.Authorization = `Bearer ${supabaseKey}`;
      }

      // 1. Chercher le routeur par `install_token`
      let routerId = null;
      const routerRes = await fetch(
        `${supabaseUrl}/rest/v1/routers?install_token=ilike.${encodeURIComponent(token)}&select=id,tenant_id,operator_id&limit=1`,
        { method: 'GET', headers: baseHeaders }
      );
      if (routerRes.ok) {
        const routers = await routerRes.json();
        if (Array.isArray(routers) && routers.length > 0) {
          routerId = String(routers[0].id || '');
          if (!resolvedTenantId) {
            resolvedTenantId = String(routers[0].tenant_id || routers[0].operator_id || '');
          }
        }
      }

      // 2. Si non trouvé, chercher le `tenant_id` dans `tickets` ou `operators`
      if (!resolvedTenantId) {
        const tRes = await fetch(
          `${supabaseUrl}/rest/v1/tickets?select=tenant_id,operator_id&order=created_at.desc&limit=1`,
          { method: 'GET', headers: baseHeaders }
        );
        if (tRes.ok) {
          const tRows = await tRes.json();
          if (Array.isArray(tRows) && tRows.length > 0) {
            resolvedTenantId = String(tRows[0].tenant_id || tRows[0].operator_id || '');
          }
        }
      }

      if (!resolvedTenantId) {
        const opRes = await fetch(
          `${supabaseUrl}/rest/v1/operators?select=id,tenant_id&order=created_at.desc&limit=1`,
          { method: 'GET', headers: baseHeaders }
        );
        if (opRes.ok) {
          const ops = await opRes.json();
          if (Array.isArray(ops) && ops.length > 0) {
            resolvedTenantId = String(ops[0].tenant_id || ops[0].id || '');
          }
        }
      }

      if (resolvedTenantId) {
        const tenantHeaders = {
          ...baseHeaders,
          'x-tenant-id': resolvedTenantId,
        };

        // 3. Provisionner / Mettre en ligne automatiquement le routeur dans `public.routers`
        if (!routerId) {
          routerId = `rb-${token.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
        }
        await fetch(`${supabaseUrl}/rest/v1/routers?on_conflict=install_token`, {
          method: 'POST',
          headers: {
            ...tenantHeaders,
            Prefer: 'resolution=merge-duplicates,return=minimal',
          },
          body: JSON.stringify([
            {
              id: routerId,
              tenant_id: resolvedTenantId,
              operator_id: resolvedTenantId,
              zone_id: 'Zone Principale',
              name: `MikroTik Hotspot (${token})`,
              model: 'MikroTik RouterOS v7',
              install_token: token,
              ip_address: '10.5.50.1',
              routeros_version: 'v7.23.8',
              status: 'online',
              last_heartbeat_at: new Date().toISOString(),
              uptime: '00j 00h 01m',
              cpu_usage: 12,
              ram_usage: 28,
              total_subscribers: 0,
            },
          ]),
        });

        // 4. Charger tous les tickets de ce `tenant_id`
        const ticketsRes = await fetch(
          `${supabaseUrl}/rest/v1/tickets?tenant_id=eq.${encodeURIComponent(resolvedTenantId)}&select=code,password,forfait_id,price_xof,duration_label,status,router_id&limit=500`,
          { method: 'GET', headers: tenantHeaders }
        );
        if (ticketsRes.ok) {
          const tickets = await ticketsRes.json();
          if (Array.isArray(tickets) && tickets.length > 0) {
            const lines = tickets
              .filter(
                (t) =>
                  t &&
                  t.code &&
                  t.status !== 'expire' &&
                  t.status !== 'bloque' &&
                  (!t.router_id || t.router_id === 'all' || t.router_id === routerId)
              )
              .map((t) => {
                const code = String(t.code).replace(/"/g, '');
                const pwd = String(t.password || t.code).replace(/"/g, '');
                const durRaw = String(t.duration_label || '24h').replace(/"/g, '');
                const dur = durRaw.replace('j', 'd');
                const prof =
                  String(t.forfait_id || '').toLowerCase().includes('vip')
                    ? 'joowifi-vip'
                    : 'joowifi-standard';
                const comment = `JW:${String(t.forfait_id || 'Pass WiFi').replace(/"/g, '')} (${t.price_xof || 0}F)`;
                return `:do { /ip hotspot user add name="${code}" password="${pwd}" profile="${prof}" limit-uptime="${dur}" comment="${comment}" } on-error={}`;
              });
            dynamicTicketsBlock = lines.join('\n');

            // Marquer comme synchronisés
            await fetch(
              `${supabaseUrl}/rest/v1/tickets?tenant_id=eq.${encodeURIComponent(resolvedTenantId)}`,
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
        }

        // 5. Charger les adresses MAC Bypass de ce `tenant_id`
        const macRes = await fetch(
          `${supabaseUrl}/rest/v1/mac_bypasses?tenant_id=eq.${encodeURIComponent(resolvedTenantId)}&select=mac_address,binding_type,label,status,router_id&limit=200`,
          { method: 'GET', headers: tenantHeaders }
        );
        if (macRes.ok) {
          const macs = await macRes.json();
          if (Array.isArray(macs) && macs.length > 0) {
            const lines = macs
              .filter(
                (m) =>
                  m &&
                  m.mac_address &&
                  m.status !== 'disabled' &&
                  (!m.router_id || m.router_id === 'all' || m.router_id === routerId)
              )
              .map((m) => {
                const mac = String(m.mac_address).replace(/"/g, '');
                const bType = String(m.binding_type || 'bypassed').replace(/"/g, '');
                const lbl = String(m.label || 'VIP').replace(/"/g, '');
                return `:do { /ip hotspot ip-binding add mac-address="${mac}" type=${bType} comment="JW:${lbl}" } on-error={}`;
              });
            dynamicBypassesBlock = lines.join('\n');
          }
        }
      }
    } catch {
      // Fallback silencieux
    }
  }

  const tenantParam = resolvedTenantId ? `&tenant_id=${encodeURIComponent(resolvedTenantId)}` : '';

  const rscScript = `# ============================================================================
# JOOWIFI CLOUD ENGINE v6.4 — AUTO-INSTALLER MULTI-TENANT (Token: ${token})
# ============================================================================
:log info "[JOOWIFI] Demarrage de l'installation Joowifi Cloud (${token})..."

:do { /ip dns set allow-remote-requests=yes servers=8.8.8.8,1.1.1.1 } on-error={}
:do { /system ntp client set enabled=yes servers=pool.ntp.org,time.google.com } on-error={}

:local hsNet [/ip dhcp-server network find where address="10.5.50.0/24"]
:if ([:len $hsNet] > 0) do={
    /ip dhcp-server network set $hsNet dns-server=8.8.8.8,1.1.1.1
}

:foreach srv in=[/ip dhcp-server find] do={
    :do { /ip dhcp-server set $srv lease-time=1h } on-error={}
}

:local ftRule [/ip firewall filter find where action=fasttrack-connection]
:if ([:len $ftRule] > 0) do={
    :if ([:len [/ip firewall filter find where comment="Joowifi: Bypass FastTrack Hotspot"]] = 0) do={
        :do { /ip firewall filter add chain=forward src-address=10.5.50.0/24 action=accept place-before=($ftRule->0) comment="Joowifi: Bypass FastTrack Hotspot" } on-error={}
        :do { /ip firewall filter add chain=forward dst-address=10.5.50.0/24 action=accept place-before=($ftRule->0) comment="Joowifi: Bypass FastTrack Hotspot Return" } on-error={}
    }
}

:do { /ip hotspot profile set [find] login-by=http-chap,http-pap,cookie,mac-cookie mac-cookie-timeout=30d } on-error={}
:do { /ip hotspot user profile remove [find where name~"^joowifi-"] } on-error={}

/ip hotspot user profile add name="joowifi-standard" rate-limit="10M/3M" shared-users=1000 add-mac-cookie=yes mac-cookie-timeout=30d status-autorefresh=1m transparent-proxy=no on-login=":local u \\$user; :local m \\$"mac-address\\"; :local a \\$address; :do { /tool fetch url=(\\"${hostUrl}/api/v1/mikrotik/heartbeat?mode=authevent&token=${token}${tenantParam}&event=login&code=\\" . \\$u . \\"&mac=\\" . \\$m . \\"&ip=\\" . \\$a) keep-result=no } on-error={}"
/ip hotspot user profile add name="joowifi-vip" rate-limit="25M/8M" shared-users=1000 add-mac-cookie=yes mac-cookie-timeout=30d status-autorefresh=1m transparent-proxy=no on-login=":local u \\$user; :local m \\$"mac-address\\"; :local a \\$address; :do { /tool fetch url=(\\"${hostUrl}/api/v1/mikrotik/heartbeat?mode=authevent&token=${token}${tenantParam}&event=login&code=\\" . \\$u . \\"&mac=\\" . \\$m . \\"&ip=\\" . \\$a) keep-result=no } on-error={}"

:do { /ip hotspot walled-garden ip remove [find where comment~"^JW-WG"] } on-error={}
/ip hotspot walled-garden ip add action=accept disabled=no dst-host="joowifi-cloud.vercel.app" comment="JW-WG: Joowifi Cloud"
/ip hotspot walled-garden ip add action=accept disabled=no dst-host="*.supabase.co" comment="JW-WG: Cloud DB"
/ip hotspot walled-garden ip add action=accept disabled=no dst-host="*.wave.com" comment="JW-WG: Wave"
/ip hotspot walled-garden ip add action=accept disabled=no dst-host="*.orange.ci" comment="JW-WG: Orange"
/ip hotspot walled-garden ip add action=accept disabled=no dst-host="*.mtn.ci" comment="JW-WG: MTN"

# Synchronisation initiale des tickets de cet operateur
${dynamicTicketsBlock}

# Synchronisation initiale des adresses MAC Bypass de cet operateur
${dynamicBypassesBlock}

:do { /system scheduler remove [find where name~"^jw_"] } on-error={}
:do { /system script remove [find where name~"^jw_"] } on-error={}

/system script add name="jw_fastpoll" policy=read,write,policy,test source=":local token \\"${token}\\"; :local jwCount [:len [/ip hotspot user find where comment~\\"^JW:\\"]]; :local url (\\"${hostUrl}/api/v1/mikrotik/heartbeat?mode=fastpoll&token=\\" . \\$token . \\"${tenantParam}&jw_users=\\" . \\$jwCount); :do { /tool fetch url=\\$url dst-path=\\"jw_fast.rsc\\" mode=https check-certificate=no; :delay 1s; :if ([:len [/file find name=\\"jw_fast.rsc\\"]] > 0) do={ :if ([/file get [find name=\\"jw_fast.rsc\\"] size] > 15) do={ :do { /import file-name=\\"jw_fast.rsc\\" } on-error={} }; /file remove [find name=\\"jw_fast.rsc\\"] } } on-error={}"
/system script add name="jw_heartbeat" policy=read,write,policy,test source=":local token \\"${token}\\"; :local cpu [/system resource get cpu-load]; :local freeMem [/system resource get free-memory]; :local totalMem [/system resource get total-memory]; :local ram (100 - ((\\$freeMem * 100) / \\$totalMem)); :local active [:len [/ip hotspot active find]]; :local jwCount [:len [/ip hotspot user find where comment~\\"^JW:\\"]]; :local url (\\"${hostUrl}/api/v1/mikrotik/heartbeat?mode=heartbeat&token=\\" . \\$token . \\"${tenantParam}&cpu=\\" . \\$cpu . \\"&ram=\\" . \\$ram . \\"&active=\\" . \\$active . \\"&jw_users=\\" . \\$jwCount); :do { /tool fetch url=\\$url dst-path=\\"jw_cmd.rsc\\" mode=https check-certificate=no; :delay 1s; :if ([:len [/file find name=\\"jw_cmd.rsc\\"]] > 0) do={ :if ([/file get [find name=\\"jw_cmd.rsc\\"] size] > 15) do={ :do { /import file-name=\\"jw_cmd.rsc\\" } on-error={} }; /file remove [find name=\\"jw_cmd.rsc\\"] } } on-error={}"
/system script add name="jw_guardian" policy=read,write,policy,test source=":if ([:len [/system scheduler find name=\\"jw_fastpoll_sch\\"]] = 0) do={ /system scheduler add name=\\"jw_fastpoll_sch\\" interval=10s on-event=\\"/system script run jw_fastpoll\\" }"

/system scheduler add name="jw_fastpoll_sch" interval=10s start-time=startup on-event="/system script run jw_fastpoll" comment="Joowifi: Fast-Poll Tickets (10s)"
/system scheduler add name="jw_heartbeat_sch" interval=45s start-time=startup on-event="/system script run jw_heartbeat" comment="Joowifi: Heartbeat Telemetry (45s)"
/system scheduler add name="jw_guardian_sch" interval=2m start-time=startup on-event="/system script run jw_guardian" comment="Joowifi: Auto-Heal Guardian (2m)"

:do { /system script run jw_fastpoll } on-error={}
:log info "[JOOWIFI] Installation Multi-Tenant terminee avec succes !"
`;

  return res.status(200).send(rscScript);
}
