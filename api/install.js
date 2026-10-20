// ============================================================================
// JOOWIFI CLOUD — SERVEUR BOOTSTRAP DYNAMIQUE MIKROTIK ROUTEROS v5.0 (.RSC)
// URL : https://joowifi-cloud.vercel.app/api/v1/mikrotik/install?token=JWT-...
// Génère à la volée le script d'installation complet + tous les tickets Supabase
// ============================================================================

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

  const query = req.query || {};
  const token = String(query.token || 'JWT-AF6L-JG37-7K23').trim();
  const hostUrl = 'https://joowifi-cloud.vercel.app';

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
      const headers = {
        'Content-Type': 'application/json',
        apikey: supabaseKey,
      };
      if (supabaseKey.startsWith('eyJ')) {
        headers.Authorization = `Bearer ${supabaseKey}`;
      }

      // 1. Récupérer tous les tickets existants dans Supabase pour les injecter dès l'installation
      const ticketsRes = await fetch(
        `${supabaseUrl}/rest/v1/tickets?select=code,password,forfait_id,price_xof,duration_label,status&limit=500`,
        { method: 'GET', headers }
      );
      if (ticketsRes.ok) {
        const tickets = await ticketsRes.json();
        if (Array.isArray(tickets) && tickets.length > 0) {
          const lines = tickets
            .filter((t) => t && t.code && t.status !== 'expire' && t.status !== 'bloque')
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

      // 2. Récupérer les adresses MAC Bypass
      const macRes = await fetch(
        `${supabaseUrl}/rest/v1/mac_bypasses?select=mac_address,binding_type,label,status&limit=200`,
        { method: 'GET', headers }
      );
      if (macRes.ok) {
        const macs = await macRes.json();
        if (Array.isArray(macs) && macs.length > 0) {
          const mLines = macs
            .filter((m) => m && m.mac_address && m.status === 'active')
            .map((m) => {
              const mac = String(m.mac_address).replace(/"/g, '');
              const btype = m.binding_type === 'blocked' ? 'blocked' : 'bypassed';
              const lbl = String(m.label || 'Equipement').replace(/"/g, '');
              return `:do { /ip hotspot ip-binding add mac-address="${mac}" type=${btype} comment="JW:${lbl}" } on-error={}`;
            });
          dynamicBypassesBlock = mLines.join('\n');
        }
      }
    } catch (e) {
      // Continue with base bootstrap script if fetch fails
    }
  }

  const rscScript = `# ============================================================================
# JOOWIFI CLOUD ENGINE v5.0 — BOOTSTRAP AUTOMATIQUE ROUTEROS (v6.49+ & v7.x)
# Jeton Equipement : ${token}
# Architecture     : Cloud Pull HTTPS Sortant (Zero-Port / Compatible CGNAT)
# Fuseau Horaire   : Africa/Abidjan (GMT+0)
# ============================================================================
# NOTE ROUTEROS v7 : Si la creation des schedulers renvoie "not allowed by device-mode",
# executez dans New Terminal : /system/device-mode/update mode=enterprise puis redemarrez.

# 1. NETTOYAGE DEFENSIF DES ANCIENNES TACHES JOOWIFI (EVITE LES DOUBLONS)
:do { /system scheduler remove [find where name="joowifi-heartbeat-timer"] } on-error={}
:do { /system scheduler remove [find where name="jw_heartbeat_sch"] } on-error={}
:do { /system scheduler remove [find where name="jw_fastpoll_sch"] } on-error={}
:do { /system scheduler remove [find where name="jw_log_watcher_sch"] } on-error={}
:do { /system scheduler remove [find where comment="JOOWIFI"] } on-error={}
:do { /system script remove [find where name="joowifi-heartbeat"] } on-error={}
:do { /system script remove [find where name="jw_heartbeat"] } on-error={}
:do { /system script remove [find where name="jw_fastpoll"] } on-error={}
:do { /system script remove [find where name="jw_log_watcher"] } on-error={}
:do { /ip hotspot walled-garden remove [find where comment~"^Joowifi" or comment="JOOWIFI"] } on-error={}
:do { /ip firewall filter remove [find where comment="JOOWIFI_FASTTRACK_BYPASS"] } on-error={}

# 2. ACTIVATION AUTOMATIQUE DU CLIENT DHCP SUR ETHER1 (INDISPENSABLE SUR CHR / VIRTUALBOX)
:do {
  :if ([:len [/ip dhcp-client find where interface="ether1"]] = 0) do={
    /ip dhcp-client add interface=ether1 disabled=no use-peer-dns=yes add-default-route=yes
  } else={
    /ip dhcp-client set [find where interface="ether1"] disabled=no
  }
} on-error={}

# 3. DNS HAUTE DISPONIBILITE & SYNCHRONISATION NTP (COMPATIBLE v6 & v7 VIA :PARSE)
/ip dns set servers=8.8.8.8,1.1.1.1 allow-remote-requests=yes cache-size=4096KiB
/system clock set time-zone-name=Africa/Abidjan
:do { /system ntp client set enabled=yes } on-error={}
:local rosVer [/system resource get version]
:local rosMajor [:pick $rosVer 0 1]
:if ($rosMajor = "7") do={
  :do {
    :local ntpV7 [:parse "/system ntp client servers remove [find]; /system ntp client servers add address=africa.pool.ntp.org; /system ntp client servers add address=162.159.200.1"]
    $ntpV7
  } on-error={}
} else={
  :do {
    :local ntpV6 [:parse "/system ntp client set primary-ntp=162.159.200.1 secondary-ntp=216.239.35.0"]
    $ntpV6
  } on-error={}
}

# 4. PROTECTION DES LIMITES DE DEBIT HOTSPOT CONTRE LE FASTTRACK + BAIL DHCP 1H
:do {
  /ip firewall filter add chain=forward action=accept hotspot=auth comment="JOOWIFI_FASTTRACK_BYPASS"
  :local fRule [/ip firewall filter find where comment="JOOWIFI_FASTTRACK_BYPASS"]
  /ip firewall filter move $fRule 0
} on-error={}

:foreach d in=[/ip dhcp-server find] do={
  :do { /ip dhcp-server set $d lease-time=1h } on-error={}
}

# 5. OPTIMISATION DES PROFILS HOTSPOT & RECONNEXION TRANSPARENTE PAR COOKIE MAC
:foreach hp in=[/ip hotspot profile find] do={
  :do { /ip hotspot profile set $hp http-cookie-lifetime=30d login-by=http-pap,http-chap,cookie,mac-cookie,mac } on-error={}
}
:foreach hsrv in=[/ip hotspot find] do={
  :do { /ip hotspot set $hsrv idle-timeout=none keepalive-timeout=none addresses-per-mac=2 } on-error={}
}
:do { /ip hotspot user profile set [find where default=yes] shared-users=1000 keepalive-timeout=none mac-cookie-timeout=90d } on-error={}
:do { /ip hotspot user profile add name="joowifi-standard" rate-limit="10M/3M" shared-users=1000 mac-cookie-timeout=30d status-autorefresh=1m } on-error={}
:do { /ip hotspot user profile add name="joowifi-vip" rate-limit="25M/8M" shared-users=1000 mac-cookie-timeout=30d status-autorefresh=1m } on-error={}
:do { /ip hotspot user profile add name="joowifi-unlimited" rate-limit="50M/15M" shared-users=1000 mac-cookie-timeout=30d status-autorefresh=1m } on-error={}

# 6. WALLED GARDEN : CLOUD JOOWIFI, SUPABASE & PASSERELLES MOBILE MONEY UEMOA
:do { /ip hotspot walled-garden add dst-host="joowifi-cloud.vercel.app" action=allow comment="JOOWIFI" } on-error={}
:do { /ip hotspot walled-garden add dst-host="*.vercel.app" action=allow comment="JOOWIFI" } on-error={}
:do { /ip hotspot walled-garden add dst-host="qvpgehfttufecuapntnm.supabase.co" action=allow comment="JOOWIFI" } on-error={}
:do { /ip hotspot walled-garden add dst-host="*.wave.com" action=allow comment="JOOWIFI" } on-error={}
:do { /ip hotspot walled-garden add dst-host="wave.com" action=allow comment="JOOWIFI" } on-error={}
:do { /ip hotspot walled-garden add dst-host="*.orange.ci" action=allow comment="JOOWIFI" } on-error={}
:do { /ip hotspot walled-garden add dst-host="*.mtn.ci" action=allow comment="JOOWIFI" } on-error={}
:do { /ip hotspot walled-garden add dst-host="*.moov-africa.ci" action=allow comment="JOOWIFI" } on-error={}
:do { /ip hotspot walled-garden add dst-host="*.cinetpay.com" action=allow comment="JOOWIFI" } on-error={}
:do { /ip hotspot walled-garden add dst-host="*.fedapay.com" action=allow comment="JOOWIFI" } on-error={}
:do { /ip hotspot walled-garden add dst-host="*.kkiapay.me" action=allow comment="JOOWIFI" } on-error={}

# 7. SYNCHRONISATION INITIALE IMMEDIATE DES TICKETS & BYPASS MAC DEPUIS SUPABASE
${dynamicTicketsBlock}
${dynamicBypassesBlock}

# 8. AGENT HEARTBEAT PRINCIPAL (45s) AVEC RECONCILIATION AUTOMATIQUE D'INVENTAIRE
:do { /system script remove [find where name="jw_heartbeat"] } on-error={}
/system script add name="jw_heartbeat" dont-require-permissions=yes comment="JOOWIFI" source={
  :if ([:len [/system script job find where script="jw_heartbeat"]] > 1) do={ :error "skip" }

  :local token "${token}"
  :local cpu [/system resource get cpu-load]
  :local freeMem [/system resource get free-memory]
  :local totalMem [/system resource get total-memory]
  :local ramPct (100 - (($freeMem * 100) / $totalMem))
  :local up [/system resource get uptime]
  :local ver [/system resource get version]
  :local actCount [:len [/ip hotspot active find]]
  :local jwUsers [:len [/ip hotspot user find where comment~"^JW:"]]
  :local syncFile "jw_sync.rsc"

  :do {
    /tool fetch mode=https check-certificate=no keep-result=yes dst-path=$syncFile duration=15s \\
      url=("${hostUrl}/api/v1/mikrotik/heartbeat?token=" . $token . "&cpu=" . $cpu . "&ram=" . $ramPct . "&active=" . $actCount . "&jw_users=" . $jwUsers)
    :delay 1s
    :if ([:len [/file find where name=$syncFile]] > 0) do={
      :if ([/file get $syncFile size] > 5) do={
        :do { /import file-name=$syncFile } on-error={ :log warning "Joowifi: erreur import sync" }
      }
      :do { /file remove $syncFile } on-error={}
    }
  } on-error={
    :log warning "Joowifi Cloud: attente reseau sur heartbeat 45s"
  }
}

# 9. AGENT FAST-POLL BASSE LATENCE (10s) POUR LIVRAISON INSTANTANEE CAISSE POS
:do { /system script remove [find where name="jw_fastpoll"] } on-error={}
/system script add name="jw_fastpoll" dont-require-permissions=yes comment="JOOWIFI" source={
  :if ([:len [/system script job find where script="jw_fastpoll"]] > 1) do={ :error "skip" }

  :local token "${token}"
  :local jwUsers [:len [/ip hotspot user find where comment~"^JW:"]]
  :local pollFile "jw_poll.rsc"

  :do {
    /tool fetch mode=https check-certificate=no keep-result=yes dst-path=$pollFile duration=8s \\
      url=("${hostUrl}/api/v1/mikrotik/heartbeat?mode=fastpoll&token=" . $token . "&jw_users=" . $jwUsers)
    :delay 500ms
    :if ([:len [/file find where name=$pollFile]] > 0) do={
      :if ([/file get $pollFile size] > 5) do={
        :do { /import file-name=$pollFile } on-error={}
      }
      :do { /file remove $pollFile } on-error={}
    }
  } on-error={}
}

# 10. REMONTEE TEMPS REEL DES CONNEXIONS CLIENTS HOTSPOT (15s) VERS SUPABASE
:do { /system script remove [find where name="jw_log_watcher"] } on-error={}
/system script add name="jw_log_watcher" dont-require-permissions=yes comment="JOOWIFI" source={
  :if ([:len [/system script job find where script="jw_log_watcher"]] > 1) do={ :error "skip" }
  :global jwSentLogs
  :if ([:typeof $jwSentLogs] = "nothing") do={ :set jwSentLogs "" }

  :foreach item in=[/log find where topics~"hotspot"] do={
    :local msg [/log get $item message]
    :local ltime [/log get $item time]
    :local evType ""
    :if ([:find $msg "logged in"] >= 0) do={ :set evType "login" }
    :if ([:find $msg "login failed"] >= 0) do={ :set evType "failed" }

    :if ($evType != "") do={
      :local sep [:find $msg " ("]
      :local ucode $msg
      :if ($sep >= 0) do={ :set ucode [:pick $msg 0 $sep] }
      :if ([:len $ucode] > 0 && [:len $ucode] < 32 && [:find $ucode " "] < 0 && [:find $ucode ":"] < 0) do={
        :local logKey ("[" . $ltime . "|" . $ucode . "|" . $evType . "]")
        :if ([:find $jwSentLogs $logKey] < 0) do={
          :set jwSentLogs ($jwSentLogs . $logKey)
          :do {
            /tool fetch mode=https check-certificate=no keep-result=no duration=8s \\
              url=("${hostUrl}/api/v1/mikrotik/heartbeat?mode=authevent&token=${token}&code=" . $ucode . "&event=" . $evType)
          } on-error={}
        }
      }
    }
  }
  :if ([:len $jwSentLogs] > 4000) do={
    :set jwSentLogs [:pick $jwSentLogs ([:len $jwSentLogs] - 2000) [:len $jwSentLogs]]
  }
}

# 11. PLANIFICATION SANS START-DATE (COMPATIBILITE STRICTE ROUTEROS 7.24+)
:do { /system scheduler add name="jw_heartbeat_sch" interval=45s on-event="jw_heartbeat" comment="JOOWIFI" } on-error={}
:do { /system scheduler set [find where name="jw_heartbeat_sch"] interval=45s on-event="jw_heartbeat" comment="JOOWIFI" } on-error={}

:do { /system scheduler add name="jw_fastpoll_sch" interval=10s on-event="jw_fastpoll" comment="JOOWIFI" } on-error={}
:do { /system scheduler set [find where name="jw_fastpoll_sch"] interval=10s on-event="jw_fastpoll" comment="JOOWIFI" } on-error={}

:do { /system scheduler add name="jw_log_watcher_sch" interval=15s on-event="jw_log_watcher" comment="JOOWIFI" } on-error={}
:do { /system scheduler set [find where name="jw_log_watcher_sch"] interval=15s on-event="jw_log_watcher" comment="JOOWIFI" } on-error={}

# 12. GARDIEN AUTO-REPARATEUR AUTONOME (JW_GUARDIAN - 2m, IMPORT ONE-SHOT ANTI-SUICIDE)
:do { /system scheduler remove [find where name="jw_guardian_sch"] } on-error={}
:do { /system script remove [find where name="jw_guardian"] } on-error={}
/system script add name="jw_guardian" dont-require-permissions=yes comment="JW_GUARDIAN" source={
  :if ([:len [/system scheduler find where name="jw_heartbeat_sch"]] = 0) do={
    :log warning "Joowifi Guardian: jw_heartbeat_sch manquant, lancement auto-reparation..."
    :do {
      /tool fetch mode=https check-certificate=no keep-result=yes dst-path=jw_repair.rsc duration=15s \\
        url="${hostUrl}/api/v1/mikrotik/install?token=${token}"
      :delay 2s
      :if ([:len [/file find where name="jw_repair.rsc"]] > 0) do={
        :do { /system scheduler remove [find where name="jw_oneshot_sch"] } on-error={}
        :do { /system script remove [find where name="jw_oneshot"] } on-error={}
        /system script add name="jw_oneshot" dont-require-permissions=yes source={
          :do { /system scheduler remove [find where name="jw_oneshot_sch"] } on-error={}
          :do { /import file-name=jw_repair.rsc } on-error={}
          :do { /file remove jw_repair.rsc } on-error={}
          :do { /system script remove [find where name="jw_oneshot"] } on-error={}
        }
        :do { /system scheduler add name="jw_oneshot_sch" interval=5s on-event="jw_oneshot" } on-error={}
      }
    } on-error={}
  }
}
:do { /system scheduler add name="jw_guardian_sch" interval=2m on-event="jw_guardian" comment="JW_GUARDIAN" } on-error={}

# 13. PREMIER APPEL HEARTBEAT IMMEDIAT
:do { /system script run jw_heartbeat } on-error={}
:log info "==> [JOOWIFI CLOUD v5.0] Installation et synchronisation des tickets terminees avec succes ! <=="
`;

  return res.status(200).send(rscScript);
}
