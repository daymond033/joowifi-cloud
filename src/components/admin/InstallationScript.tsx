import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import confetti from 'canvas-confetti';
import {
  Terminal,
  Download,
  Copy,
  Check,
  CheckCircle2,
  Key,
  RefreshCw,
  FolderDown,
  ArrowLeft,
  Router as RouterIcon,
  Globe,
  Zap,
  Eye,
  EyeOff,
  HelpCircle,
  Smartphone,
  ShieldCheck,
  AlertTriangle,
  Play,
  FileCode,
} from 'lucide-react';

export const InstallationScript: React.FC = () => {
  const { zones, routers, tickets, macBypasses, addRouter, setAdminTab, forceHeartbeatSync } = useApp();

  // Mode toggle between Method 1 (Auto 1-line command) and Method 2 (Full Bootstrap Script)
  const [installMethodTab, setInstallMethodTab] = useState<'auto' | 'full'>('auto');

  // Mode: configure new router vs select existing router
  const [pairingMode, setPairingMode] = useState<'new' | 'existing'>('existing');
  const [selectedExistingRouterId, setSelectedExistingRouterId] = useState<string>(routers[0]?.id || '');

  // Router configuration state
  const [routerName, setRouterName] = useState(routers[0]?.name || 'MK-ADJAME-CORE-01');
  const [routerModel, setRouterModel] = useState(routers[0]?.model || 'MikroTik CHR / hEX S');
  const [selectedZoneId, setSelectedZoneId] = useState(zones[0]?.id || 'zone-1');
  const [token, setToken] = useState(routers[0]?.installToken || 'JWT-AF6L-JG37-7K23');
  const [showToken, setShowToken] = useState(true);

  // Copy feedback states
  const [copiedAutoCmd, setCopiedAutoCmd] = useState(false);
  const [copiedFullScript, setCopiedFullScript] = useState(false);
  const [copiedImportCmd, setCopiedImportCmd] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);
  const [installedNotice, setInstalledNotice] = useState(false);

  const handleSelectExisting = (routerId: string) => {
    setSelectedExistingRouterId(routerId);
    const existing = routers.find((r) => r.id === routerId);
    if (existing) {
      setRouterName(existing.name);
      setRouterModel(existing.model || 'MikroTik RouterBOARD');
      setSelectedZoneId(existing.zoneId);
      setToken(existing.installToken || 'JWT-AF6L-JG37-7K23');
    }
  };

  const regenerateToken = () => {
    const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const randPart = (len: number) =>
      Array.from({ length: len }, () => letters[Math.floor(Math.random() * letters.length)]).join('');
    setToken(`JWT-${randPart(4)}-${randPart(4)}-${randPart(4)}`);
  };

  // Méthode 1 : Commande Automatique 1-Clic (avec nettoyage préalable du fichier .rsc)
  const autoOneLineCommand = `:do { /file remove joowifi_install.rsc } on-error={}; /tool fetch url="https://joowifi-cloud.vercel.app/api/v1/mikrotik/install?token=${token}" mode=https check-certificate=no keep-result=yes dst-path=joowifi_install.rsc; :delay 2s; /import file-name=joowifi_install.rsc`;

  // Commande d'import local WinBox (Étape 3)
  const localWinboxImportCmd = `/import file-name=joowifi_install.rsc`;

  // Génération dynamique des lignes de tickets actuels pour les pré-injecter dans le script complet
  const embeddedTicketsRsc = useMemo(() => {
    const valid = tickets.filter((t) => t.status !== 'expire' && t.status !== 'bloque');
    return valid
      .map((t) => {
        const code = String(t.code).replace(/"/g, '');
        const dur = String(t.duration || '24h').replace(/"/g, '').replace('j', 'd');
        const prof = String(t.forfaitName || '').toLowerCase().includes('vip')
          ? 'joowifi-vip'
          : 'joowifi-standard';
        const cmt = `JW:${String(t.forfaitName || 'Pass WiFi').replace(/"/g, '')} (${t.price || 0}F)`;
        return `:do { /ip hotspot user add name="${code}" password="${code}" profile="${prof}" limit-uptime="${dur}" comment="${cmt}" } on-error={}`;
      })
      .join('\n');
  }, [tickets]);

  const embeddedMacBypassesRsc = useMemo(() => {
    return macBypasses
      .filter((m) => m.status === 'active')
      .map((m) => {
        const mac = String(m.macAddress).replace(/"/g, '');
        const btype = m.bindingType === 'blocked' ? 'blocked' : 'bypassed';
        const lbl = String(m.label || 'Equipement').replace(/"/g, '');
        return `:do { /ip hotspot ip-binding add mac-address="${mac}" type=${btype} comment="JW:${lbl}" } on-error={}`;
      })
      .join('\n');
  }, [macBypasses]);

  // Méthode 2 : Script Complet Bootstrap Joowifi Engine v5.0 (Compatible RouterOS 6.x & 7.x)
  const fullBootstrapScript = useMemo(() => {
    return `# ============================================================================
# JOOWIFI CLOUD ENGINE v5.0 — SCRIPT BOOTSTRAP ROUTEROS (v6.49+ & v7.x)
# Jeton Equipement : ${token}
# Routeur Cible    : ${routerName} (${routerModel})
# Architecture     : Cloud Pull Strict HTTPS (Zero-Port Entrant / Compatible CGNAT)
# ============================================================================
# IMPORTANT RouterOS 7 : Si les schedulers echouent avec "not allowed by device-mode",
# executez d'abord : /system/device-mode/update mode=enterprise
# puis redemarrez le routeur et relancez ce script.

# 1. Nettoyage defensif des anciennes configurations Joowifi (evite les conflits)
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

# 2. Identite & Activation DHCP Client sur ether1 (indispensable sur CHR / VirtualBox)
:do { /system identity set name="Joowifi-${routerName.replace(/[^a-zA-Z0-9_-]/g, '_')}" } on-error={}
:do {
  :if ([:len [/ip dhcp-client find where interface="ether1"]] = 0) do={
    /ip dhcp-client add interface=ether1 disabled=no use-peer-dns=yes add-default-route=yes
  } else={
    /ip dhcp-client set [find where interface="ether1"] disabled=no
  }
} on-error={}

# 3. DNS + NTP Afrique de l'Ouest (Compatible RouterOS v6 et v7 via :parse)
/ip dns set servers=8.8.8.8,1.1.1.1 allow-remote-requests=yes cache-size=4096KiB
/system clock set time-zone-name=Africa/Abidjan
:do { /system ntp client set enabled=yes } on-error={}
:local sysVer [/system resource get version]
:local majVer [:pick $sysVer 0 1]
:if ($majVer = "7") do={
  :do {
    :local v7Ntp [:parse "/system ntp client servers remove [find]; /system ntp client servers add address=africa.pool.ntp.org; /system ntp client servers add address=162.159.200.1"]
    $v7Ntp
  } on-error={}
} else={
  :do {
    :local v6Ntp [:parse "/system ntp client set primary-ntp=162.159.200.1 secondary-ntp=216.239.35.0"]
    $v6Ntp
  } on-error={}
}

# 4. Firewall : Exclure le trafic Hotspot authentifie du FastTrack (preserve les limites de debit)
:do {
  /ip firewall filter add chain=forward action=accept hotspot=auth comment="JOOWIFI_FASTTRACK_BYPASS"
  :local ruleId [/ip firewall filter find where comment="JOOWIFI_FASTTRACK_BYPASS"]
  /ip firewall filter move $ruleId 0
} on-error={}

# 4b. DHCP : Bail court (1h) pour eviter la saturation du pool d'adresses IP par les passants
:foreach dhcps in=[/ip dhcp-server find] do={
  :do { /ip dhcp-server set $dhcps lease-time=1h } on-error={}
}

# 5. Profils Hotspot : Activation MAC Cookie 30j & reconnexion transparente
:foreach p in=[/ip hotspot profile find] do={
  :do { /ip hotspot profile set $p http-cookie-lifetime=30d login-by=http-pap,http-chap,cookie,mac-cookie,mac } on-error={}
}
:foreach hs in=[/ip hotspot find] do={
  :do { /ip hotspot set $hs idle-timeout=none keepalive-timeout=none addresses-per-mac=2 } on-error={}
}
:do { /ip hotspot user profile set [find where default=yes] shared-users=1000 keepalive-timeout=none mac-cookie-timeout=90d } on-error={}
:do { /ip hotspot user profile add name="joowifi-standard" rate-limit="10M/3M" shared-users=1000 mac-cookie-timeout=30d status-autorefresh=1m } on-error={}
:do { /ip hotspot user profile add name="joowifi-vip" rate-limit="25M/8M" shared-users=1000 mac-cookie-timeout=30d status-autorefresh=1m } on-error={}
:do { /ip hotspot user profile add name="joowifi-unlimited" rate-limit="50M/15M" shared-users=1000 mac-cookie-timeout=30d status-autorefresh=1m } on-error={}

# 6. Walled Garden : Plateforme Joowifi, Supabase & Passerelles Mobile Money Afrique de l'Ouest
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
:do { /ip hotspot walled-garden add dst-host="*.feexpay.me" action=allow comment="JOOWIFI" } on-error={}

# 7. Injection immediate de votre inventaire de tickets & Bypass MAC actuels (${tickets.length} tickets)
${embeddedTicketsRsc}
${embeddedMacBypassesRsc}

# 8. Agent Heartbeat Principal (45s) avec Reconciliation Automatique d'Inventaire
:do { /system script remove [find where name="jw_heartbeat"] } on-error={}
/system script add name="jw_heartbeat" dont-require-permissions=yes comment="JOOWIFI" source={
  :if ([:len [/system script job find where script="jw_heartbeat"]] > 1) do={ :error "skip" }

  :local token "${token}"
  :local cpu [/system resource get cpu-load]
  :local freeMem [/system resource get free-memory]
  :local totalMem [/system resource get total-memory]
  :local ramPct (100 - (($freeMem * 100) / $totalMem))
  :local actCount [:len [/ip hotspot active find]]
  :local jwUsers [:len [/ip hotspot user find where comment~"^JW:"]]
  :local syncFile "jw_sync.rsc"

  :do {
    /tool fetch mode=https check-certificate=no keep-result=yes dst-path=$syncFile duration=15s \\
      url=("https://joowifi-cloud.vercel.app/api/v1/mikrotik/heartbeat?token=" . $token . "&cpu=" . $cpu . "&ram=" . $ramPct . "&active=" . $actCount . "&jw_users=" . $jwUsers)
    :delay 1s
    :if ([:len [/file find where name=$syncFile]] > 0) do={
      :if ([/file get $syncFile size] > 5) do={
        :do { /import file-name=$syncFile } on-error={ :log warning "Joowifi: erreur import sync" }
      }
      :do { /file remove $syncFile } on-error={}
    }
  } on-error={
    :log warning "Joowifi Cloud: temporisation reseau sur heartbeat 45s"
  }
}

# 9. Agent Fast-Poll Basse Latence (10s) — Livraison instantanee des ventes Caisse POS
:do { /system script remove [find where name="jw_fastpoll"] } on-error={}
/system script add name="jw_fastpoll" dont-require-permissions=yes comment="JOOWIFI" source={
  :if ([:len [/system script job find where script="jw_fastpoll"]] > 1) do={ :error "skip" }

  :local token "${token}"
  :local jwUsers [:len [/ip hotspot user find where comment~"^JW:"]]
  :local pollFile "jw_poll.rsc"

  :do {
    /tool fetch mode=https check-certificate=no keep-result=yes dst-path=$pollFile duration=8s \\
      url=("https://joowifi-cloud.vercel.app/api/v1/mikrotik/heartbeat?mode=fastpoll&token=" . $token . "&jw_users=" . $jwUsers)
    :delay 500ms
    :if ([:len [/file find where name=$pollFile]] > 0) do={
      :if ([/file get $pollFile size] > 5) do={
        :do { /import file-name=$pollFile } on-error={}
      }
      :do { /file remove $pollFile } on-error={}
    }
  } on-error={}
}

# 10. Remontee des connexions clients Hotspot (15s) vers Supabase
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
              url=("https://joowifi-cloud.vercel.app/api/v1/mikrotik/heartbeat?mode=authevent&token=${token}&code=" . $ucode . "&event=" . $evType)
          } on-error={}
        }
      }
    }
  }
  :if ([:len $jwSentLogs] > 4000) do={
    :set jwSentLogs [:pick $jwSentLogs ([:len $jwSentLogs] - 2000) [:len $jwSentLogs]]
  }
}

# 11. Planification des Schedulers SANS start-date (compatibilite stricte RouterOS 7.24+)
:do { /system scheduler add name="jw_heartbeat_sch" interval=45s on-event="jw_heartbeat" comment="JOOWIFI" } on-error={}
:do { /system scheduler set [find where name="jw_heartbeat_sch"] interval=45s on-event="jw_heartbeat" comment="JOOWIFI" } on-error={}

:do { /system scheduler add name="jw_fastpoll_sch" interval=10s on-event="jw_fastpoll" comment="JOOWIFI" } on-error={}
:do { /system scheduler set [find where name="jw_fastpoll_sch"] interval=10s on-event="jw_fastpoll" comment="JOOWIFI" } on-error={}

:do { /system scheduler add name="jw_log_watcher_sch" interval=15s on-event="jw_log_watcher" comment="JOOWIFI" } on-error={}
:do { /system scheduler set [find where name="jw_log_watcher_sch"] interval=15s on-event="jw_log_watcher" comment="JOOWIFI" } on-error={}

# 12. Gardien Auto-Reparateur Independant (jw_guardian - 2m, import differe one-shot)
:do { /system scheduler remove [find where name="jw_guardian_sch"] } on-error={}
:do { /system script remove [find where name="jw_guardian"] } on-error={}
/system script add name="jw_guardian" dont-require-permissions=yes comment="JW_GUARDIAN" source={
  :if ([:len [/system scheduler find where name="jw_heartbeat_sch"]] = 0) do={
    :log warning "Joowifi Guardian: jw_heartbeat_sch absent, lancement auto-reparation..."
    :do {
      /tool fetch mode=https check-certificate=no keep-result=yes dst-path=jw_repair.rsc duration=15s \\
        url="https://joowifi-cloud.vercel.app/api/v1/mikrotik/install?token=${token}"
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

# 13. Premier appel immediat & confirmation dans Log
:do { /system script run jw_heartbeat } on-error={}
:log info "==> [JOOWIFI CLOUD v5.0] Configuration et synchronisation terminees avec succes ! <=="
`;
  }, [token, routerName, routerModel, tickets.length, embeddedTicketsRsc, embeddedMacBypassesRsc]);

  const copyAutoCommand = () => {
    navigator.clipboard.writeText(autoOneLineCommand);
    setCopiedAutoCmd(true);
    setTimeout(() => setCopiedAutoCmd(false), 2200);
  };

  const copyFullScript = () => {
    navigator.clipboard.writeText(fullBootstrapScript);
    setCopiedFullScript(true);
    setTimeout(() => setCopiedFullScript(false), 2200);
  };

  const copyImportCmd = () => {
    navigator.clipboard.writeText(localWinboxImportCmd);
    setCopiedImportCmd(true);
    setTimeout(() => setCopiedImportCmd(false), 2200);
  };

  const downloadRscFile = () => {
    const blob = new Blob([fullBootstrapScript], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `joowifi_install.rsc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleSimulateConnection = () => {
    const currentZone = zones.find((z) => z.id === selectedZoneId) || zones[0];
    if (pairingMode === 'new') {
      addRouter({
        name: routerName,
        model: routerModel,
        zoneId: currentZone.id,
        zoneName: currentZone.name,
        ipAddress: '10.5.50.1 (Passerelle Hotspot)',
        cloudDns: `${token.toLowerCase().replace(/[^a-z0-9]/g, '')}.sn.mynetname.net`,
        macAddress: `48:A9:8A:${Math.floor(10 + Math.random() * 89)}:${Math.floor(
          10 + Math.random() * 89
        )}:${Math.floor(10 + Math.random() * 89)}`,
        routerOsVersion: 'v7.23.8',
        status: 'online',
        uptime: '00j 00h 15m',
        cpuUsage: 12,
        ramUsage: 28,
        temperature: 38,
        voltage: 24.0,
        diskFreeMb: 205.9,
        trafficDownMbps: 22.4,
        trafficUpMbps: 6.1,
        totalSubscribers: tickets.length,
        syncedProfilesCount: 4,
        lastSyncTime: "À l'instant",
      });
    }
    forceHeartbeatSync();
    confetti({ particleCount: 70, spread: 70, origin: { y: 0.4 } });
    setInstalledNotice(true);
    setTimeout(() => setInstalledNotice(false), 5000);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-slate-400">
          <button
            onClick={() => setAdminTab('mikrotik')}
            className="text-slate-400 hover:text-slate-800 flex items-center gap-1 transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>CONSOLE</span>
          </button>
          <span>/</span>
          <span className="text-[#007A78]">INSTALLATION MIKROTIK</span>
        </div>

        <button
          onClick={() => setAdminTab('mikrotik')}
          className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-800 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
        >
          <RouterIcon className="w-3.5 h-3.5 text-[#007A78]" />
          <span>Voir mes routeurs ({routers.length})</span>
        </button>
      </div>

      {/* Title Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-800 flex items-center gap-3">
          <Download className="w-7 h-7 text-[#007A78]" />
          <span>Installation MikroTik (Engine v5.0)</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Connectez votre routeur MikroTik (physique ou virtuel CHR WinBox) à Joowifi Cloud en 2 minutes chrono.
        </p>
      </div>

      {installedNotice && (
        <div className="p-4 rounded-2xl bg-[#E6F4F3] border border-[#99D5D3] text-[#005A5B] text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xl">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-[#008060] shrink-0" />
            <div>
              <strong className="text-[#005A5B] text-sm block">
                Synchronisation Cloud & Base Supabase (12 tables) effectuée !
              </strong>
              <span>
                Tous vos tickets ({tickets.length}) et profils Hotspot sont prêts pour le routeur <strong>{routerName}</strong>.
              </span>
            </div>
          </div>
          <button
            onClick={() => setAdminTab('mikrotik')}
            className="px-4 py-2 rounded-xl bg-[#008060] hover:bg-[#006B50] text-white font-bold text-xs shrink-0 transition cursor-pointer"
          >
            Voir le routeur →
          </button>
        </div>
      )}

      {/* Main 2-Column Layout inspired by clean SaaS standard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Script de connexion RouterOS */}
        <div className="lg:col-span-2 p-6 rounded-2xl glass-card border border-slate-200 bg-white space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Terminal className="w-5 h-5 text-[#007A78]" />
              <span>Script de connexion RouterOS</span>
            </h2>

            {/* Selector for target router */}
            <select
              value={selectedExistingRouterId}
              onChange={(e) => handleSelectExisting(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-[#F8FAFC] border border-slate-200 text-slate-700 text-xs focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              {routers.map((r) => (
                <option key={r.id} value={r.id}>
                  Routeur : {r.name} ({r.installToken})
                </option>
              ))}
            </select>
          </div>

          {/* 2 Big Method Tabs: Méthode 1 (Commande Automatique) vs Méthode 2 (Script Complet) */}
          <div className="grid grid-cols-2 gap-2 p-1.5 rounded-xl bg-[#F8FAFC] border border-slate-200">
            <button
              type="button"
              onClick={() => setInstallMethodTab('auto')}
              className={`py-2.5 px-4 rounded-lg text-xs font-bold transition cursor-pointer ${
                installMethodTab === 'auto'
                  ? 'bg-[#008060] hover:bg-[#006B50] text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-800'
              }`}
            >
              Méthode 1 : Commande Automatique
            </button>
            <button
              type="button"
              onClick={() => setInstallMethodTab('full')}
              className={`py-2.5 px-4 rounded-lg text-xs font-bold transition cursor-pointer ${
                installMethodTab === 'full'
                  ? 'bg-[#008060] hover:bg-[#006B50] text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-800'
              }`}
            >
              Méthode 2 : Script Complet ({tickets.length} tickets inclus)
            </button>
          </div>

          {installMethodTab === 'auto' ? (
            <div className="space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                Ouvrez le terminal de votre MikroTik (<strong>WinBox &rarr; New Terminal</strong> ou SSH) et collez cette commande. Elle télécharge et exécute automatiquement le script de configuration complet ainsi que vos <strong>{tickets.length} tickets actifs</strong>.
              </p>

              {/* RouterOS Version & Device-Mode Warning Box */}
              <div className="p-3.5 rounded-xl bg-[#E6F4F3] border border-[#99D5D3] text-slate-700 text-xs leading-relaxed space-y-1">
                <div className="font-bold text-[#007A78] flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Compatible RouterOS 6.49+ et RouterOS 7.x (dont v7.23 / v7.24)</span>
                </div>
                <p className="text-[11px] text-slate-700">
                  Sur <strong>RouterOS 7</strong>, si le terminal affiche <code className="text-[#005A5B]">not allowed by device-mode</code>, tapez d'abord <code className="text-slate-800 font-mono bg-[#F8FAFC] px-1.5 py-0.5 rounded">/system/device-mode/update mode=enterprise</code> puis redémarrez le routeur.
                </p>
              </div>

              {/* Orange/Amber Code Box with Copy Button */}
              <div className="relative p-4 rounded-xl bg-[#F8FAFC] border border-slate-200 font-mono text-xs text-[#007A78] leading-relaxed break-all pr-12 shadow-inner">
                {autoOneLineCommand}
                <button
                  onClick={copyAutoCommand}
                  className="absolute right-3 top-3 p-2 rounded-lg bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-800 border border-slate-300 transition cursor-pointer"
                  title="Copier la commande automatique"
                >
                  {copiedAutoCmd ? (
                    <Check className="w-4 h-4 text-[#008060]" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>

              <div className="p-3 rounded-xl bg-[#F8FAFC] border border-slate-200 flex items-center justify-between gap-3 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <Play className="w-3.5 h-3.5 text-[#007A78] shrink-0" />
                  <span>
                    Le routeur va créer les profils, injecter vos <strong>{tickets.length} tickets</strong> dans <code className="text-slate-700">IP &rarr; Hotspot &rarr; Users</code> et démarrer le Fast-Poll (10s).
                  </span>
                </div>
                <button
                  onClick={copyAutoCommand}
                  className="px-3 py-1.5 rounded-lg bg-[#008060] hover:bg-[#006B50] text-white font-bold text-xs shrink-0 transition cursor-pointer"
                >
                  {copiedAutoCmd ? 'Copié !' : 'Copier'}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs text-slate-600">
                  Copiez l'intégralité du script ci-dessous et collez-le directement dans <strong>WinBox &rarr; New Terminal</strong> (fonctionne même sans connexion Internet sur VirtualBox !).
                </p>
                <button
                  onClick={copyFullScript}
                  className="px-3.5 py-1.5 rounded-xl bg-[#008060] hover:bg-[#006B50] text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shrink-0"
                >
                  {copiedFullScript ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Script Complet Copié !</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copier tout le Script</span>
                    </>
                  )}
                </button>
              </div>

              <div className="relative">
                <pre className="p-4 rounded-xl bg-[#F8FAFC] border border-slate-200 text-xs font-mono text-[#007A78] max-h-80 overflow-y-auto leading-relaxed select-all">
                  {fullBootstrapScript}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Token Box & Diagnostic Help */}
        <div className="space-y-5">
          {/* Token Card */}
          <div className="p-6 rounded-2xl glass-card border border-slate-200 bg-white space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <Key className="w-4 h-4 text-[#007A78]" />
              <span>VOTRE JETON D'INSTALLATION</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Ce jeton est unique à votre équipement. Il authentifie les requêtes Heartbeat (45s), Fast-Poll (10s) et la réconciliation automatique de vos tickets avec Supabase.
            </p>

            <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-slate-200 flex items-center justify-between gap-2">
              <span className="font-mono font-bold text-slate-800 text-sm tracking-wider">
                {showToken ? token : 'JWT-••••-••••-••••'}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="p-1.5 rounded-lg bg-white text-slate-400 hover:text-slate-800 cursor-pointer"
                >
                  {showToken ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(token);
                    setCopiedToken(true);
                    setTimeout(() => setCopiedToken(false), 2000);
                  }}
                  className="p-1.5 rounded-lg bg-white text-[#007A78] hover:text-[#005A5B] cursor-pointer"
                  title="Copier le jeton"
                >
                  {copiedToken ? <Check className="w-3.5 h-3.5 text-[#008060]" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSimulateConnection}
              className="w-full py-2.5 px-4 rounded-xl bg-[#E6F4F3] hover:bg-emerald-500/25 border border-[#99D5D3] text-[#005A5B] font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Forcer la synchro des {tickets.length} tickets vers Supabase</span>
            </button>
          </div>

          {/* Help Card */}
          <div className="p-6 rounded-2xl glass-card border border-slate-200 bg-white space-y-3">
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-[#007A78]" />
              <span>Besoin d'aide (WinBox / VirtualBox) ?</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Si vous testez sur <strong>VirtualBox (MikroTik CHR)</strong> et que <code className="text-slate-700">/tool fetch</code> n'arrive pas à sortir sur Internet, utilisez directement l'onglet <strong>Méthode 2 : Script Complet</strong> ou l'installation par fichier ci-dessous : vos <strong>{tickets.length} tickets</strong> y sont déjà intégrés !
            </p>
          </div>
        </div>
      </div>

      {/* Alternative Method: Local WinBox Drag & Drop (3 Steps) */}
      <div className="p-6 rounded-2xl glass-card border border-slate-200 bg-white space-y-5">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
            <FolderDown className="w-5 h-5 text-[#007A78]" />
            <span>Méthode alternative : Installation par WinBox (Recommandée en local / VirtualBox)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Si votre routeur MikroTik n'a pas encore accès à Internet, installez le script et vos {tickets.length} tickets manuellement via l'interface graphique WinBox :
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Étape 1 */}
          <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-slate-200 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#007A78]">
                ÉTAPE 1
              </span>
              <p className="text-xs text-slate-600 leading-relaxed">
                Téléchargez le fichier de configuration personnalisé (<code className="text-[#007A78]">joowifi_install.rsc</code>) contenant déjà vos forfaits et vos <strong>{tickets.length} tickets</strong> :
              </p>
            </div>
            <button
              onClick={downloadRscFile}
              className="w-full py-3 px-4 rounded-xl bg-[#008060] hover:bg-[#006B50] text-white font-extrabold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-lg shadow-amber-500/15"
            >
              <Download className="w-4 h-4 stroke-[2.5]" />
              <span>Télécharger le script (.rsc)</span>
            </button>
          </div>

          {/* Étape 2 */}
          <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-slate-200 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#007A78]">
                ÉTAPE 2
              </span>
              <p className="text-xs text-slate-600 leading-relaxed">
                Ouvrez <strong>WinBox</strong>, cliquez sur <strong>Files</strong> dans le menu de gauche, et faites un <strong>glisser-déposer</strong> du fichier <code className="text-slate-800 font-mono">joowifi_install.rsc</code> directement dans la liste des fichiers.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-white border border-slate-200 text-[11px] text-slate-400 flex items-center gap-2">
              <FileCode className="w-4 h-4 text-[#007A78] shrink-0" />
              <span>Fichier : <strong className="text-slate-700">joowifi_install.rsc</strong></span>
            </div>
          </div>

          {/* Étape 3 */}
          <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-slate-200 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#007A78]">
                ÉTAPE 3
              </span>
              <p className="text-xs text-slate-600 leading-relaxed">
                Ouvrez un <strong>New Terminal</strong> dans WinBox et exécutez la commande d'importation suivante :
              </p>
            </div>
            <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between gap-2 font-mono text-xs text-[#007A78]">
              <span className="truncate">{localWinboxImportCmd}</span>
              <button
                onClick={copyImportCmd}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 shrink-0 cursor-pointer"
                title="Copier la commande d'importation"
              >
                {copiedImportCmd ? <Check className="w-3.5 h-3.5 text-[#008060]" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Ce que fait le script v5.0 */}
        <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-slate-200 space-y-3">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
            CE QUE FAIT LE MOTEUR JOOWIFI ENGINE v5.0 :
          </h3>
          <ul className="space-y-2 text-xs text-slate-600">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
              <span>
                <strong className="text-slate-800">Double Canal Cloud Pull (Fast-Poll 10s + Heartbeat 45s) :</strong> Le routeur récupère les nouveaux tickets vendus en Caisse POS en moins de 10 secondes sans ouvrir aucun port entrant (compatible Starlink, 4G, CGNAT).
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
              <span>
                <strong className="text-slate-800">Réconciliation Automatique d'Inventaire & Auto-Guérison (Guardian 2m) :</strong> Si le routeur est neuf ou réinitialisé, il compare son nombre de tickets <code className="text-[#007A78]">JW:</code> avec Supabase et télécharge automatiquement tous les tickets manquants dans <code className="text-[#007A78]">IP &rarr; Hotspot &rarr; Users</code>.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
              <span>
                <strong className="text-slate-800">Exclusion FastTrack, Bail DHCP 1h & Cookie MAC 30j :</strong> Préserve les limitations de débit de vos forfaits, évite la saturation du pool de 253 adresses IP et reconnecte automatiquement vos clients sans ressaisir leur code.
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
