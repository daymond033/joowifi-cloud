// ============================================================================
// JOOWIFI CLOUD — MOTEUR DE GÉNÉRATION DE SCRIPTS ROUTEROS (.RSC) (PHASE 3)
// Architecture Zero-Trust & Modèle "Cloud Pull" Strict (Polling HTTPS 45s)
// Compatible RouterOS v6.49+ LTS et RouterOS v7.10+
// ============================================================================

export interface RouterScriptOptions {
  routerName: string;
  routerModel: string;
  installToken: string;
  routerOsVersion: 'v7' | 'v6.49' | 'v6.44';
  hotspotInterface: string;
  apiBaseUrl: string;
  portalDomains?: string[];
  forfaits?: {
    id: string;
    name: string;
    durationHours: number;
    downloadSpeedMbps: number;
    uploadSpeedMbps: number;
    simultaneousDevices: number;
    macLock?: boolean;
  }[];
}

/**
 * Génère le script d'installation complet (.rsc) téléchargeable en 1-clic via /tool fetch
 * Configure : Identité, DNS, NTP, Walled Garden, Profils Hotspot + Cookie MAC + Anti-Partage MAC,
 * et le Scheduler Heartbeat Cloud Pull de 45 secondes avec exécution dynamique de commandes (.rsc).
 */
export function generateRouterOsInstallScript(opts: RouterScriptOptions): string {
  const safeIdentity = `Joowifi-${opts.routerName.replace(/[^a-zA-Z0-9_-]/g, '_')}`;
  const customDomains = opts.portalDomains || [];

  const profileCommands = (opts.forfaits || [])
    .map((f) => {
      const profileName = `jw-prof-${f.id}`;
      const rateLimit = `${f.downloadSpeedMbps}M/${f.uploadSpeedMbps}M`;
      const sharedUsers = f.simultaneousDevices || 1;
      // Script on-login pour le verrouillage d'adresse MAC au 1er login (anti-partage de ticket)
      const onLoginScript = f.macLock
        ? `:local usr $user; :local mac $"mac-address"; :if ([/ip hotspot user get [find name=$usr] mac-address] = "00:00:00:00:00:00" || [/ip hotspot user get [find name=$usr] mac-address] = "") do={ /ip hotspot user set [find name=$usr] mac-address=$mac; :log info ("Joowifi MAC-Lock active pour " . $usr . " sur " . $mac); }`
        : `:log info ("Joowifi Login " . $user . " (" . $"mac-address" . ")")`;

      return `/ip hotspot user profile
:do { remove [find name="${profileName}"] } on-error={}
add name="${profileName}" rate-limit="${rateLimit}" shared-users=${sharedUsers} mac-cookie-timeout=30d keepalive-timeout=2m status-autorefresh=1m on-login="${onLoginScript.replace(/"/g, '\\"')}"`;
    })
    .join('\n');

  const extraWalledGarden = customDomains
    .map((domain) => `add comment="Joowifi Custom Domain" dst-host="${domain}" action=allow`)
    .join('\n');

  return `# ============================================================================
# JOOWIFI CLOUD AGENT — SCRIPT D'INITIALISATION ROUTEROS (.RSC)
# Equipement       : ${opts.routerName} (${opts.routerModel})
# Version cible    : ${opts.routerOsVersion === 'v7' ? 'RouterOS v7.10+ (Recommandé)' : 'RouterOS v6.49+ LTS'}
# Jeton Unique     : ${opts.installToken}
# Interface Cible  : ${opts.hotspotInterface}
# Architecture     : Zero-Trust / Modèle Cloud Pull HTTPS 45s (Aucun port entrant)
# Compatible       : Fibre, ADSL, 4G/5G Box (Orange, MTN, Moov), Starlink (CGNAT)
# ============================================================================

/system identity set name="${safeIdentity}"

# ----------------------------------------------------------------------------
# 1. CONFIGURATION DNS & SYNCHRONISATION HORAIRE NTP (CRITIQUE POUR TLS & TICKETS)
# ----------------------------------------------------------------------------
/ip dns set allow-remote-requests=yes servers=1.1.1.1,8.8.8.8,8.8.4.4 cache-size=4096KiB
${
  opts.routerOsVersion === 'v7'
    ? `/system ntp client set enabled=yes\n/system ntp client servers add address=time.cloudflare.com\n/system ntp client servers add address=pool.ntp.org`
    : `/system ntp client set enabled=yes primary-ntp=162.159.200.1 secondary-ntp=162.159.200.123`
}
/system clock set time-zone-name=Africa/Abidjan

# ----------------------------------------------------------------------------
# 2. WALLED GARDEN (ACCÈS PORTAIL CAPTIF & PASSERELLES MOBILE MONEY)
# Autorise uniquement l'API Joowifi et les paiements Wave / Orange / MTN / Moov
# ----------------------------------------------------------------------------
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
add comment="Hub2 / CinetPay Aggregator" dst-host="*.cinetpay.com" action=allow
add comment="Hub2 Payment Gateway" dst-host="*.hub2.io" action=allow
add comment="Google Fonts CDN" dst-host="fonts.googleapis.com" action=allow
add comment="Google Static CDN" dst-host="fonts.gstatic.com" action=allow
${extraWalledGarden}

# ----------------------------------------------------------------------------
# 3. PROFILS HOTSPOT, SYNCHRONISATION SESSION MAC-COOKIE & VERROUILLAGE MAC
# Permet la reconnexion automatique sans retaper le code (Cookie MAC 30 jours)
# ----------------------------------------------------------------------------
/ip hotspot profile
set [ find default=yes ] login-by=http-chap,http-pap,mac-cookie mac-cookie-timeout=30d http-cookie-lifetime=30d

/ip hotspot user profile
set [ find default=yes ] keepalive-timeout=2m mac-cookie-timeout=30d shared-users=1 status-autorefresh=1m
${profileCommands}

# ----------------------------------------------------------------------------
# 4. MOTEUR HEARTBEAT "CLOUD PULL" (TOUTES LES 45 SECONDES)
# Le routeur initie une connexion HTTPS sortante, transmet ses constantes (CPU,
# RAM, Uptime, Sessions actives) et exécute les commandes en attente (.rsc)
# ----------------------------------------------------------------------------
/system script
:do { remove [find name="joowifi-heartbeat"] } on-error={}
add name="joowifi-heartbeat" dont-require-permissions=yes source={
  :local token "${opts.installToken}"
  :local cpu [/system resource get cpu-load]
  :local freeMem [/system resource get free-memory]
  :local totalMem [/system resource get total-memory]
  :local ramPct (100 - (($freeMem * 100) / $totalMem))
  :local uptime [/system resource get uptime]
  :local version [/system resource get version]
  :local activeCount [/ip hotspot active print count-only]
  :local syncFile "joowifi-sync.rsc"

  :do {
    /tool fetch mode=https \\
      url=("${opts.apiBaseUrl}/api/v1/mikrotik/heartbeat?token=" . $token . "&cpu=" . $cpu . "&ram=" . $ramPct . "&uptime=" . $uptime . "&active=" . $activeCount . "&ver=" . $version) \\
      dst-path=$syncFile \\
      keep-result=yes \\
      check-certificate=no
    :delay 1s
    :if ([:len [/file find name=$syncFile]] > 0) do={
      :if ([/file get $syncFile size] > 10) do={
        /import file-name=$syncFile
      }
      /file remove $syncFile
    }
  } on-error={
    :log warning "Joowifi Cloud Pull: Serveur injoignable temporairement, nouvel essai dans 45s."
  }
}

/system scheduler
:do { remove [find name="joowifi-heartbeat-timer"] } on-error={}
add name="joowifi-heartbeat-timer" interval=45s on-event="joowifi-heartbeat" start-time=startup comment="Joowifi Cloud Pull 45s"

# ----------------------------------------------------------------------------
# 5. WATCHDOG MATÉRIEL & AUTO-RECOVERY
# ----------------------------------------------------------------------------
/system watchdog
set auto-send-sup-out=no ping-start-after-boot=5m ping-timeout=30s watch-address=8.8.8.8

:log info "==> [JOOWIFI CLOUD] Routeur ${safeIdentity} appaire avec succes (Token: ${opts.installToken}) <=="
`;
}

/**
 * Génère les commandes RouterOS individuelles empilées dans la file d'attente Heartbeat
 */
export const RouterOsCommands = {
  /** Crée un ticket (voucher) dans RouterOS Hotspot avec limite de durée et quota optionnel */
  createTicket(params: {
    code: string;
    password?: string;
    profileName: string;
    durationHours: number;
    dataLimitMb?: number;
    comment?: string;
  }): string {
    const limitUptime = `${params.durationHours}h`;
    const limitBytesTotal =
      params.dataLimitMb && params.dataLimitMb > 0
        ? ` limit-bytes-total=${params.dataLimitMb * 1048576}`
        : '';
    const pwd = params.password || params.code;
    const safeComment = (params.comment || 'Joowifi Ticket').replace(/"/g, '');
    return `/ip hotspot user add name="${params.code}" password="${pwd}" profile="${params.profileName}" limit-uptime="${limitUptime}"${limitBytesTotal} comment="${safeComment}"`;
  },

  /** Supprime un ticket et déconnecte sa session active */
  removeTicket(code: string): string {
    return `/ip hotspot active remove [find user="${code}"]; /ip hotspot user remove [find name="${code}"]`;
  },

  /** Déconnecte immédiatement un utilisateur actif sur le Hotspot et purge son cookie MAC */
  disconnectSession(username: string, macAddress?: string): string {
    const cookieCleanup = macAddress
      ? `; /ip hotspot cookie remove [find mac-address="${macAddress}"]`
      : `; /ip hotspot cookie remove [find user="${username}"]`;
    return `/ip hotspot active remove [find user="${username}"]${cookieCleanup}`;
  },

  /** Ajoute une règle IP-Binding (Bypass MAC pour caméras, VIP, ou blocage) */
  addMacBypass(params: {
    macAddress: string;
    bindingType: 'bypassed' | 'regular' | 'blocked';
    label: string;
  }): string {
    return `/ip hotspot ip-binding remove [find mac-address="${params.macAddress}"]; /ip hotspot ip-binding add mac-address="${params.macAddress}" type=${params.bindingType} comment="Joowifi: ${params.label.replace(/"/g, '')}"`;
  },

  /** Supprime une règle IP-Binding MAC */
  removeMacBypass(macAddress: string): string {
    return `/ip hotspot ip-binding remove [find mac-address="${macAddress}"]`;
  },

  /** Redémarre le routeur à distance au prochain cycle Heartbeat */
  rebootRouter(): string {
    return `:log warning "Joowifi Cloud: Redemarrage demande par l'administrateur"; /system reboot`;
  },
};
