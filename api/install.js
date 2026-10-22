// ============================================================================
// JOOWIFI CLOUD — SERVEUR BOOTSTRAP MIKROTIK ROUTEROS v6.3 MULTI-TENANT (.RSC)
// URL : https://joowifi-cloud.vercel.app/api/v1/mikrotik/install?token=JWT-...
// Sécurité Multi-Tenant :
// Résout d'abord le `tenant_id` et le `router_id` associés au `token` unique du
// routeur, et n'injecte QUE les tickets et adresses MAC Bypass appartenant à
// cet opérateur spécifique.
// ============================================================================

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

  const query = req.query || {};
  const token = String(query.token || '').trim();
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

  if (supabaseKey) {
    try {
      const baseHeaders = {
        'Content-Type': 'application/json',
        apikey: supabaseKey,
      };
      if (supabaseKey.startsWith('eyJ')) {
        baseHeaders.Authorization = `Bearer ${supabaseKey}`;
      }

      // 1. Identifier le routeur et son `tenant_id` propriétaire à partir du `token` unique
      const routerRes = await fetch(
        `${supabaseUrl}/rest/v1/routers?install_token=eq.${encodeURIComponent(token)}&select=id,tenant_id,operator_id&limit=1`,
        { method: 'GET', headers: baseHeaders }
      );

      let routerId = null;
      let tenantId = null;
      if (routerRes.ok) {
        const routers = await routerRes.json();
        if (Array.isArray(routers) && routers.length > 0) {
          routerId = String(routers[0].id || '');
          tenantId = String(routers[0].tenant_id || routers[0].operator_id || '');
        }
      }

      // Si le token correspond bien à un Opérateur / Tenant, on charge UNIQUEMENT ses données !
      if (tenantId) {
        const tenantHeaders = {
          ...baseHeaders,
          'x-tenant-id': tenantId,
        };

        // 2. Récupérer uniquement les tickets appartenant à CE tenant (et ce routeur ou 'all')
        const ticketsRes = await fetch(
          `${supabaseUrl}/rest/v1/tickets?tenant_id=eq.${encodeURIComponent(tenantId)}&select=code,password,forfait_id,price_xof,duration_label,status,router_id&limit=500`,
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
          }
        }

        // 3. Récupérer uniquement les adresses MAC Bypass appartenant à CE tenant
        const macRes = await fetch(
          `${supabaseUrl}/rest/v1/mac_bypasses?tenant_id=eq.${encodeURIComponent(tenantId)}&select=mac_address,binding_type,label,status,router_id&limit=200`,
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
      // Fallback silencieux sur le script de base
    }
  }

  const rscScript = `# ============================================================================
# JOOWIFI CLOUD ENGINE v6.3 — AUTO-INSTALLER MULTI-TENANT (Token: ${token})
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

/ip hotspot user profile add name="joowifi-standard" rate-limit="10M/3M" shared-users=1000 add-mac-cookie=yes mac-cookie-timeout=30d status-autorefresh=1m transparent-proxy=no on-login=":local u \\$user; :local m \\$"mac-address\\"; :local a \\$address; :do { /tool fetch url=(\\"${hostUrl}/api/v1/mikrotik/heartbeat?mode=authevent&token=${token}&event=login&code=\\" . \\$u . \\"&mac=\\" . \\$m . \\"&ip=\\" . \\$a) keep-result=no } on-error={}"
/ip hotspot user profile add name="joowifi-vip" rate-limit="25M/8M" shared-users=1000 add-mac-cookie=yes mac-cookie-timeout=30d status-autorefresh=1m transparent-proxy=no on-login=":local u \\$user; :local m \\$"mac-address\\"; :local a \\$address; :do { /tool fetch url=(\\"${hostUrl}/api/v1/mikrotik/heartbeat?mode=authevent&token=${token}&event=login&code=\\" . \\$u . \\"&mac=\\" . \\$m . \\"&ip=\\" . \\$a) keep-result=no } on-error={}"

:do { /ip hotspot walled-garden ip remove [find where comment~"^JW-WG"] } on-error={}
/ip hotspot walled-garden ip add action=accept disabled=no dst-host="joowifi-cloud.vercel.app" comment="JW-WG: Joowifi Cloud"
/ip hotspot walled-garden ip add action=accept disabled=no dst-host="*.supabase.co" comment="JW-WG: Cloud DB"
/ip hotspot walled-garden ip add action=accept disabled=no dst-host="*.wave.com" comment="JW-WG: Wave"
/ip hotspot walled-garden ip add action=accept disabled=no dst-host="*.orange.ci" comment="JW-WG: Orange"
/ip hotspot walled-garden ip add action=accept disabled=no dst-host="*.mtn.ci" comment="JW-WG: MTN"

# Synchronisation initiale des tickets appartenant exclusivement a cet operateur
${dynamicTicketsBlock}

# Synchronisation initiale des adresses MAC Bypass de cet operateur
${dynamicBypassesBlock}

:do { /system scheduler remove [find where name~"^jw_"] } on-error={}
:do { /system script remove [find where name~"^jw_"] } on-error={}

/system script add name="jw_fastpoll" policy=read,write,policy,test source=":local token \\"${token}\\"; :local jwCount [:len [/ip hotspot user find where comment~\\"^JW:\\"]]; :local url (\\"${hostUrl}/api/v1/mikrotik/heartbeat?mode=fastpoll&token=\\" . \\$token . \\"&jw_users=\\" . \\$jwCount); :do { /tool fetch url=\\$url dst-path=\\"jw_fast.rsc\\" mode=https check-certificate=no; :delay 1s; :if ([:len [/file find name=\\"jw_fast.rsc\\"]] > 0) do={ :if ([/file get [find name=\\"jw_fast.rsc\\"] size] > 15) do={ :do { /import file-name=\\"jw_fast.rsc\\" } on-error={} }; /file remove [find name=\\"jw_fast.rsc\\"] } } on-error={}"
/system script add name="jw_heartbeat" policy=read,write,policy,test source=":local token \\"${token}\\"; :local cpu [/system resource get cpu-load]; :local freeMem [/system resource get free-memory]; :local totalMem [/system resource get total-memory]; :local ram (100 - ((\\$freeMem * 100) / \\$totalMem)); :local active [:len [/ip hotspot active find]]; :local jwCount [:len [/ip hotspot user find where comment~\\"^JW:\\"]]; :local url (\\"${hostUrl}/api/v1/mikrotik/heartbeat?mode=heartbeat&token=\\" . \\$token . \\"&cpu=\\" . \\$cpu . \\"&ram=\\" . \\$ram . \\"&active=\\" . \\$active . \\"&jw_users=\\" . \\$jwCount); :do { /tool fetch url=\\$url dst-path=\\"jw_cmd.rsc\\" mode=https check-certificate=no; :delay 1s; :if ([:len [/file find name=\\"jw_cmd.rsc\\"]] > 0) do={ :if ([/file get [find name=\\"jw_cmd.rsc\\"] size] > 15) do={ :do { /import file-name=\\"jw_cmd.rsc\\" } on-error={} }; /file remove [find name=\\"jw_cmd.rsc\\"] } } on-error={}"
/system script add name="jw_guardian" policy=read,write,policy,test source=":if ([:len [/system scheduler find name=\\"jw_fastpoll_sch\\"]] = 0) do={ /system scheduler add name=\\"jw_fastpoll_sch\\" interval=10s on-event=\\"/system script run jw_fastpoll\\" }"

/system scheduler add name="jw_fastpoll_sch" interval=10s start-time=startup on-event="/system script run jw_fastpoll" comment="Joowifi: Fast-Poll Tickets (10s)"
/system scheduler add name="jw_heartbeat_sch" interval=45s start-time=startup on-event="/system script run jw_heartbeat" comment="Joowifi: Heartbeat Telemetry (45s)"
/system scheduler add name="jw_guardian_sch" interval=2m start-time=startup on-event="/system script run jw_guardian" comment="Joowifi: Auto-Heal Guardian (2m)"

:do { /system script run jw_fastpoll } on-error={}
:log info "[JOOWIFI] Installation Multi-Tenant terminee avec succes !"
`;

  return res.status(200).send(rscScript);
}
