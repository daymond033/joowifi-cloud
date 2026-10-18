# ============================================================================
# JOOWIFI CLOUD AGENT — SCRIPT D'INITIALISATION ROUTEROS (.RSC) (v6.49+ & v7.10+)
# Architecture : Zero-Trust / Modèle Cloud Pull HTTPS 45s (Aucun port entrant)
# Compatible   : Fibre, ADSL, Box 4G/5G (Orange, MTN, Moov), Starlink (CGNAT)
# ============================================================================

:global joowifiToken "JWT-AF6L-JG37-7K23"
:global joowifiApiUrl "https://api.joowifi.app"

/system identity set name="Joowifi-Hotspot-Main"

# 1. DNS & NTP (Synchronisation horaire indispensable pour TLS et validité des tickets)
/ip dns set allow-remote-requests=yes servers=1.1.1.1,8.8.8.8,8.8.4.4 cache-size=4096KiB
/system clock set time-zone-name=Africa/Abidjan
:do { /system ntp client set enabled=yes servers=time.cloudflare.com,pool.ntp.org } on-error={ /system ntp client set enabled=yes primary-ntp=162.159.200.1 secondary-ntp=162.159.200.123 }

# 2. WALLED GARDEN (Autorise uniquement l'API Joowifi et les passerelles Mobile Money)
/ip hotspot walled-garden
:do { remove [find comment~"Joowifi"] } on-error={}
add comment="Joowifi Cloud Portal" dst-host="*.joowifi.app" action=allow
add comment="Joowifi API Gateway" dst-host="*.joowifi.pro" action=allow
add comment="Wave Mobile Money" dst-host="*.wave.com" action=allow
add comment="Wave CI API" dst-host="api.wave.com" action=allow
add comment="Orange Money CI" dst-host="*.orange.ci" action=allow
add comment="Orange Money Web" dst-host="*.orangemoney.ci" action=allow
add comment="MTN Mobile Money" dst-host="*.mtn.ci" action=allow
add comment="Moov Africa Money" dst-host="*.moov-africa.ci" action=allow
add comment="CinetPay Gateway" dst-host="*.cinetpay.com" action=allow
add comment="Hub2 Gateway" dst-host="*.hub2.io" action=allow

# 3. PROFILS HOTSPOT, RECONNEXION COOKIE MAC (30J) & VERROUILLAGE MAC ANTI-PARTAGE
/ip hotspot profile
set [ find default=yes ] login-by=http-chap,http-pap,mac-cookie mac-cookie-timeout=30d http-cookie-lifetime=30d

/ip hotspot user profile
set [ find default=yes ] keepalive-timeout=2m mac-cookie-timeout=30d shared-users=1 status-autorefresh=1m
:do { remove [find name~"jw-prof-"] } on-error={}
add name="jw-prof-f-1" rate-limit="5M/2M" shared-users=1 mac-cookie-timeout=30d keepalive-timeout=2m status-autorefresh=1m on-login=":local usr \$user; :local mac \$\"mac-address\"; :if ([/ip hotspot user get [find name=\$usr] mac-address] = \"\" || [/ip hotspot user get [find name=\$usr] mac-address] = \"00:00:00:00:00:00\") do={ /ip hotspot user set [find name=\$usr] mac-address=\$mac; }"
add name="jw-prof-f-2" rate-limit="10M/4M" shared-users=1 mac-cookie-timeout=30d keepalive-timeout=2m status-autorefresh=1m on-login=":local usr \$user; :local mac \$\"mac-address\"; :if ([/ip hotspot user get [find name=\$usr] mac-address] = \"\" || [/ip hotspot user get [find name=\$usr] mac-address] = \"00:00:00:00:00:00\") do={ /ip hotspot user set [find name=\$usr] mac-address=\$mac; }"
add name="jw-prof-f-3" rate-limit="15M/5M" shared-users=2 mac-cookie-timeout=30d keepalive-timeout=2m status-autorefresh=1m

# 4. HEARTBEAT CLOUD PULL BIDIRECTIONNEL (TOUTES LES 45 SECONDES)
/system script
:do { remove [find name="joowifi-heartbeat"] } on-error={}
add name="joowifi-heartbeat" dont-require-permissions=yes source={
  :global joowifiToken
  :global joowifiApiUrl
  :local cpu [/system resource get cpu-load]
  :local freeMem [/system resource get free-memory]
  :local totalMem [/system resource get total-memory]
  :local ramPct (100 - (($freeMem * 100) / $totalMem))
  :local uptime [/system resource get uptime]
  :local ver [/system resource get version]
  :local activeCount [/ip hotspot active print count-only]
  :local syncFile "joowifi-sync.rsc"

  :do {
    /tool fetch mode=https \
      url=($joowifiApiUrl . "/api/v1/mikrotik/heartbeat?token=" . $joowifiToken . "&cpu=" . $cpu . "&ram=" . $ramPct . "&uptime=" . $uptime . "&active=" . $activeCount . "&ver=" . $ver) \
      dst-path=$syncFile keep-result=yes check-certificate=no
    :delay 1s
    :if ([:len [/file find name=$syncFile]] > 0) do={
      :if ([/file get $syncFile size] > 10) do={
        /import file-name=$syncFile
      }
      /file remove $syncFile
    }
  } on-error={
    :log warning "Joowifi Cloud Pull: Temporisation contact serveur (reprise dans 45s)"
  }
}

/system scheduler
:do { remove [find name="joowifi-heartbeat-timer"] } on-error={}
add name="joowifi-heartbeat-timer" interval=45s on-event="joowifi-heartbeat" start-time=startup comment="Joowifi Cloud Pull 45s"

# 5. WATCHDOG MATÉRIEL
/system watchdog set auto-send-sup-out=no ping-start-after-boot=5m ping-timeout=30s watch-address=8.8.8.8
:log info "==> [JOOWIFI CLOUD] Routeur configure avec succes <=="
