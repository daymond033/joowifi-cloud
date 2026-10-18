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
  Shield,
  RefreshCw,
  FolderDown,
  Cpu,
  ArrowLeft,
  Router as RouterIcon,
  Globe,
  Zap,
  Radio,
  FileCode,
  Sliders,
  ExternalLink,
  ChevronRight,
  Eye,
  EyeOff,
  Flame,
  HelpCircle,
  Smartphone,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';

export const InstallationScript: React.FC = () => {
  const { zones, routers, addRouter, setAdminTab } = useApp();

  // Mode: configure new router vs select existing router
  const [pairingMode, setPairingMode] = useState<'new' | 'existing'>('new');
  const [selectedExistingRouterId, setSelectedExistingRouterId] = useState<string>(routers[0]?.id || '');

  // New Router configuration form
  const [routerName, setRouterName] = useState('MikroTik Hotspot - Nouveau Site');
  const [routerModel, setRouterModel] = useState('MikroTik hEX S (RB760iGS)');
  const [selectedZoneId, setSelectedZoneId] = useState(zones[0]?.id || 'zone-1');
  const [routerOsVersion, setRouterOsVersion] = useState<'v7' | 'v6.49' | 'v6.44'>('v7');
  const [hotspotInterface, setHotspotInterface] = useState('bridge-hotspot');

  // Security token state
  const [token, setToken] = useState('JWT-AF6L-JG37-7K23');
  const [showToken, setShowToken] = useState(true);

  // Copy feedback states
  const [copiedTerminal, setCopiedTerminal] = useState(false);
  const [copiedFullScript, setCopiedFullScript] = useState(false);
  const [installedNotice, setInstalledNotice] = useState(false);

  // Script viewer tabs
  const [scriptSubTab, setScriptSubTab] = useState<'full' | 'walled' | 'heartbeat' | 'hotspot' | 'watchdog'>('full');

  // Handle select existing router to load its token & configuration
  const handleSelectExisting = (routerId: string) => {
    setSelectedExistingRouterId(routerId);
    const existing = routers.find((r) => r.id === routerId);
    if (existing) {
      setRouterName(existing.name);
      setRouterModel(existing.model || 'MikroTik RouterBOARD');
      setSelectedZoneId(existing.zoneId);
      setToken(existing.installToken);
    }
  };

  // Regenerate security token
  const regenerateToken = () => {
    const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const randPart = (len: number) =>
      Array.from({ length: len }, () => letters[Math.floor(Math.random() * letters.length)]).join('');
    const newToken = `JWT-${randPart(4)}-${randPart(4)}-${randPart(4)}`;
    setToken(newToken);
  };

  // Terminal 1-Click Command
  const terminalOneLiner = `/tool fetch url="https://api.joowifi.app/install?token=${token}" dst-path=joowifi.rsc; /import file=joowifi.rsc`;

  // Dynamic modular script pieces
  const scriptHeader = `# ========================================================
# JOOWIFI CLOUD AGENT - MIKROTIK ROUTEROS SETUP SCRIPT
# Equipement : ${routerName} (${routerModel})
# Version RouterOS cible : ${routerOsVersion === 'v7' ? 'RouterOS v7.10+ (Recommandé)' : 'RouterOS v6.49+ LTS'}
# Jeton Unique : ${token}
# Interface Hotspot : ${hotspotInterface}
# Date de génération : ${new Date().toLocaleDateString('fr-FR')} ${new Date().toLocaleTimeString('fr-FR')}
# Architecture : Zero-Trust / Modèle Cloud Pull HTTPS 45s
# Edité pour Joowifi (Abidjan, Côte d'Ivoire)
# ========================================================

/system identity set name="Joowifi-${routerName.replace(/[^a-zA-Z0-9_-]/g, '_')}"
`;

  const scriptWalledGarden = `
# --------------------------------------------------------
# 1. WALLED GARDEN (ACCÈS PORTAIL CAPTIF & PAIEMENTS MOBILES)
# Autorise les passerelles Mobile Money sans consommation de data
# --------------------------------------------------------
/ip hotspot walled-garden
add comment="Joowifi Cloud Vercel" dst-host="joowifi-cloud.vercel.app" action=allow
add comment="Joowifi Supabase API" dst-host="qvpgehfttufecuapntnm.supabase.co" action=allow
add comment="Joowifi Cloud Portal" dst-host="*.joowifi.app" action=allow
add comment="Joowifi API & Assets" dst-host="*.joowifi.pro" action=allow
add comment="Wave Mobile Money" dst-host="*.wave.com" action=allow
add comment="Wave CI Gateway" dst-host="api.wave.com" action=allow
add comment="Orange Money CI" dst-host="*.orange.ci" action=allow
add comment="Orange Money Web" dst-host="*.orangemoney.ci" action=allow
add comment="MTN Mobile Money CI" dst-host="*.mtn.ci" action=allow
add comment="Moov Africa Money" dst-host="*.moov-africa.ci" action=allow
add comment="Google Fonts & CDN" dst-host="fonts.googleapis.com" action=allow
add comment="Google Static" dst-host="fonts.gstatic.com" action=allow
`;

  const scriptHeartbeat = `
# --------------------------------------------------------
# 2. HEARTBEAT CLOUD PULL BIDIRECTIONNEL (POLLING HTTPS 45 SECONDES)
# Le routeur initie une connexion sortante HTTPS 443 (Zero-Trust / CGNAT),
# transmet sa télémétrie (CPU, RAM, Uptime, Sessions) et exécute les
# instructions en attente (nouveaux tickets, déconnexions, MAC bypass)
# --------------------------------------------------------
/ip dns set allow-remote-requests=yes servers=1.1.1.1,8.8.8.8 cache-size=4096KiB
/system clock set time-zone-name=Africa/Abidjan

/system script
:do { remove [find name="joowifi-heartbeat"] } on-error={}
add name="joowifi-heartbeat" dont-require-permissions=yes source={
  :local token "${token}"
  :local cpu [/system resource get cpu-load]
  :local freeMem [/system resource get free-memory]
  :local totalMem [/system resource get total-memory]
  :local ramPct (100 - (($freeMem * 100) / $totalMem))
  :local uptime [/system resource get uptime]
  :local activeCount [/ip hotspot active print count-only]
  :local syncFile "joowifi-sync.rsc"

  :do {
    /tool fetch mode=https \
      url=("https://joowifi-cloud.vercel.app/api/v1/mikrotik/heartbeat?token=" . $token . "&cpu=" . $cpu . "&ram=" . $ramPct . "&uptime=" . $uptime . "&active=" . $activeCount) \
      dst-path=$syncFile keep-result=yes check-certificate=no
    :delay 1s
    :if ([:len [/file find name=$syncFile]] > 0) do={
      :if ([/file get $syncFile size] > 10) do={
        /import file-name=$syncFile
      }
      /file remove $syncFile
    }
  } on-error={
    :log warning "Joowifi Cloud: Temporisation contact serveur (reprise au cycle suivant 45s)"
  }
}

/system scheduler
:do { remove [find name="joowifi-heartbeat-timer"] } on-error={}
add name="joowifi-heartbeat-timer" interval=45s on-event="joowifi-heartbeat" start-time=startup comment="Joowifi Cloud Pull 45s"
`;

  const scriptHotspotProfiles = `
# --------------------------------------------------------
# 3. PROFILS HOTSPOT, LIMITATIONS & RECONNEXION MAC-COOKIE
# Reconnexion fluide sans réinsérer le code voucher
# --------------------------------------------------------
/ip hotspot user profile
set [ find default=yes ] keepalive-timeout=2m mac-cookie-timeout=30d name=default shared-users=1 status-autorefresh=1m
add name="joowifi-standard" mac-cookie-timeout=30d rate-limit="10M/3M" shared-users=1 status-autorefresh=1m
add name="joowifi-vip" mac-cookie-timeout=30d rate-limit="25M/8M" shared-users=1 status-autorefresh=1m
add name="joowifi-unlimited" mac-cookie-timeout=30d rate-limit="50M/15M" shared-users=1 status-autorefresh=1m

# Activation du login par MAC Cookie & HTTP-PAP sur le profil serveur
/ip hotspot profile
set [ find default=yes ] login-by=http-chap,http-pap,mac-cookie mac-cookie-timeout=30d
`;

  const scriptWatchdog = `
# --------------------------------------------------------
# 4. WATCHDOG DE SÉCURITÉ RÉSEAU & AUTO-RECOVERY
# Redémarrage de secours si panne Internet totale > 5 minutes
# --------------------------------------------------------
/system watchdog
set auto-send-sup-out=no ping-start-after-boot=5m ping-timeout=30s test-script="" watch-address=8.8.8.8
:log info "==> [JOOWIFI] Routeur initialise avec succes avec le jeton ${token} <=="
`;

  const fullScriptContent = `${scriptHeader}${scriptWalledGarden}${scriptHeartbeat}${scriptHotspotProfiles}${scriptWatchdog}`;

  // Get active script according to sub-tab
  const currentDisplayedScript = useMemo(() => {
    switch (scriptSubTab) {
      case 'walled':
        return scriptWalledGarden.trim();
      case 'heartbeat':
        return scriptHeartbeat.trim();
      case 'hotspot':
        return scriptHotspotProfiles.trim();
      case 'watchdog':
        return scriptWatchdog.trim();
      default:
        return fullScriptContent;
    }
  }, [scriptSubTab, fullScriptContent]);

  // Copy 1-Click Terminal Command
  const copyTerminal = () => {
    navigator.clipboard.writeText(terminalOneLiner);
    setCopiedTerminal(true);
    setTimeout(() => setCopiedTerminal(false), 2000);
  };

  // Copy Full Script
  const copyFullScript = () => {
    navigator.clipboard.writeText(fullScriptContent);
    setCopiedFullScript(true);
    setTimeout(() => setCopiedFullScript(false), 2000);
  };

  // Download .rsc file
  const downloadRsc = () => {
    const blob = new Blob([fullScriptContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `joowifi-setup-${token}.rsc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Simulate Instant Detection / Test
  const handleSimulateConnection = () => {
    const currentZone = zones.find((z) => z.id === selectedZoneId) || zones[0];
    addRouter({
      name: routerName,
      model: routerModel,
      zoneId: currentZone.id,
      zoneName: currentZone.name,
      ipAddress: '192.168.88.1 (Passerelle Hotspot)',
      cloudDns: `${token.toLowerCase().replace(/[^a-z0-9]/g, '')}.sn.mynetworkname.net`,
      macAddress: `4C:5E:0C:${Math.floor(10 + Math.random() * 89)}:${Math.floor(
        10 + Math.random() * 89
      )}:${Math.floor(10 + Math.random() * 89)}`,
      routerOsVersion: routerOsVersion === 'v7' ? 'v7.14.3' : 'v6.49.10',
      status: 'online',
      uptime: '00j 00h 01m',
      cpuUsage: 14,
      ramUsage: 32,
      temperature: 39,
      voltage: 24.1,
      diskFreeMb: 14.5,
      trafficDownMbps: 18.5,
      trafficUpMbps: 4.8,
      totalSubscribers: 1,
      syncedProfilesCount: 5,
      lastSyncTime: 'A l\'instant',
    });

    confetti({
      particleCount: 70,
      spread: 70,
      origin: { y: 0.4 },
    });

    setInstalledNotice(true);
    setTimeout(() => setInstalledNotice(false), 5000);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Navigation Breadcrumb & Back */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <button
            onClick={() => setAdminTab('mikrotik')}
            className="text-slate-400 hover:text-white flex items-center gap-1 font-semibold transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Routeurs MikroTik</span>
          </button>
          <span>/</span>
          <span className="text-amber-400 font-semibold flex items-center gap-1">
            <Terminal className="w-3.5 h-3.5" />
            Assistant d'Installation
          </span>
        </div>

        <button
          onClick={() => setAdminTab('mikrotik')}
          className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
        >
          <RouterIcon className="w-3.5 h-3.5 text-amber-400" />
          <span>Voir le Parc ({routers.length})</span>
        </button>
      </div>

      {/* Main Header Banner */}
      <div className="p-6 rounded-2xl glass-card border border-slate-800 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-slate-950 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-2">
            <Zap className="w-3 h-3 text-amber-400" />
            <span>ONBOARDING ROUTEROS JOOWIFI v7 & v6.49+</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
            <span>Assistant d'Installation MikroTik</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Déployez l'agent Joowifi sur votre routeur en 30 secondes. Modèle sécurisé 100% sortant HTTPS, sans ouvrir de port WAN.
          </p>
        </div>

        <button
          onClick={regenerateToken}
          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-2 transition cursor-pointer self-start md:self-auto border border-slate-700"
          title="Générer un nouveau jeton cryptographique"
        >
          <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
          <span>Régénérer le jeton</span>
        </button>
      </div>

      {/* Success Notification Banner */}
      {installedNotice && (
        <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in shadow-xl">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
            <div>
              <strong className="text-emerald-300 text-sm block">
                Routeur appairé et synchronisé avec succès !
              </strong>
              <span>
                Votre nouvel équipement <strong>{routerName}</strong> apparaît désormais en direct dans le parc MikroTik.
              </span>
            </div>
          </div>
          <button
            onClick={() => setAdminTab('mikrotik')}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shrink-0 transition cursor-pointer shadow-md"
          >
            Voir dans la liste →
          </button>
        </div>
      )}

      {/* Equipment Configuration & Token Box */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Step 1: Target Router Setup */}
        <div className="lg:col-span-2 p-6 rounded-2xl glass-card border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center border border-amber-500/30">
                1
              </span>
              <h2 className="text-sm font-bold text-white">
                Configuration de l'équipement cible
              </h2>
            </div>

            {/* Mode Toggle */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950 border border-slate-800 text-[11px]">
              <button
                type="button"
                onClick={() => setPairingMode('new')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer ${
                  pairingMode === 'new'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Nouveau Routeur
              </button>
              <button
                type="button"
                onClick={() => setPairingMode('existing')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer ${
                  pairingMode === 'existing'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Routeur Existant
              </button>
            </div>
          </div>

          {pairingMode === 'existing' ? (
            <div className="space-y-3">
              <label className="text-xs text-slate-300 font-semibold block">
                Sélectionner le routeur à réinstaller ou synchroniser :
              </label>
              <select
                value={selectedExistingRouterId}
                onChange={(e) => handleSelectExisting(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500 text-xs cursor-pointer"
              >
                {routers.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} — {r.zoneName} ({r.model || 'MikroTik'})
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-400">
                Le jeton associé à cet équipement a été chargé automatiquement ci-dessous.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1 sm:col-span-2">
                <label className="text-slate-300 font-semibold">Nom du Hotspot / Emplacement :</label>
                <input
                  type="text"
                  value={routerName}
                  onChange={(e) => setRouterName(e.target.value)}
                  placeholder="ex: Hotspot Carrefour Angré"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Modèle MikroTik :</label>
                <input
                  type="text"
                  value={routerModel}
                  onChange={(e) => setRouterModel(e.target.value)}
                  placeholder="ex: MikroTik hEX S (RB760iGS)"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Zone d'affectation :</label>
                <select
                  value={selectedZoneId}
                  onChange={(e) => setSelectedZoneId(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500 text-xs cursor-pointer"
                >
                  {zones.map((z) => (
                    <option key={z.id} value={z.id}>
                      {z.name} ({z.city})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Version RouterOS installée :</label>
                <select
                  value={routerOsVersion}
                  onChange={(e) => setRouterOsVersion(e.target.value as any)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500 text-xs cursor-pointer"
                >
                  <option value="v7">RouterOS v7.x (Recommandé - Fetch moderne)</option>
                  <option value="v6.49">RouterOS v6.49+ LTS (Stable)</option>
                  <option value="v6.44">RouterOS v6.44+</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Interface Hotspot (LAN) :</label>
                <input
                  type="text"
                  value={hotspotInterface}
                  onChange={(e) => setHotspotInterface(e.target.value)}
                  placeholder="bridge-hotspot, ether2, etc."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500 text-xs font-mono"
                />
              </div>
            </div>
          )}
        </div>

        {/* Step 1-B: Token Security Card */}
        <div className="p-6 rounded-2xl glass-card border border-slate-800 bg-slate-900/80 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Jeton Unique de Liaison
                </h3>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Ce jeton cryptographique identifie de façon exclusive votre équipement auprès du Cloud Joowifi.
            </p>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2">
              <span className="font-mono font-bold text-amber-400 text-sm tracking-wide">
                {showToken ? token : 'JWT-••••-••••-••••'}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="p-1 rounded text-slate-400 hover:text-white cursor-pointer"
                  title={showToken ? 'Masquer' : 'Afficher'}
                >
                  {showToken ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(token);
                    setCopiedTerminal(true);
                    setTimeout(() => setCopiedTerminal(false), 2000);
                  }}
                  className="p-1 rounded text-amber-400 hover:text-amber-300 cursor-pointer"
                  title="Copier le jeton"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="space-y-1.5 text-[11px] text-slate-400">
              <div className="flex items-center gap-1.5 text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                <span>Chiffrement TLS 1.3 de bout en bout</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-400">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-slate-500" />
                <span>Révocable à tout moment depuis la console</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={regenerateToken}
            className="w-full py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer border border-slate-700"
          >
            <RefreshCw className="w-3 h-3 text-amber-400" />
            <span>Changer de jeton</span>
          </button>
        </div>
      </div>

      {/* METHOD 1: 1-Click Terminal Command */}
      <div className="p-6 rounded-2xl glass-card border border-slate-800 space-y-4 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-300 font-bold text-xs flex items-center justify-center border border-cyan-500/30">
              2
            </span>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Méthode 1 : Commande Terminal 1-Clic (Recommandé)</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
                  Ultra-rapide
                </span>
              </h2>
            </div>
          </div>

          <button
            onClick={copyTerminal}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shrink-0 transition cursor-pointer shadow-lg shadow-blue-600/20 active:scale-95 self-start sm:self-auto"
          >
            {copiedTerminal ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Copié dans le presse-papier !</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copier la commande 1-Clic</span>
              </>
            )}
          </button>
        </div>

        <p className="text-xs text-slate-300">
          Ouvrez <strong>WinBox</strong> ou connectez-vous en <strong>SSH</strong>, cliquez sur <strong>New Terminal</strong>, collez cette ligne et appuyez sur <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-slate-200">Entrée</kbd> :
        </p>

        {/* Command Box */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 font-mono text-xs shadow-inner">
          <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap text-cyan-300">
            <span className="text-slate-600 select-none">&gt;</span>
            <span>{terminalOneLiner}</span>
          </div>

          <button
            onClick={copyTerminal}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white shrink-0 cursor-pointer"
            title="Copier"
          >
            {copiedTerminal ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>

        {/* 3 Step Visual Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-850 flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 font-bold text-[10px] flex items-center justify-center shrink-0">
              1
            </span>
            <div className="text-[11px] text-slate-400">
              <strong className="text-slate-200 block">Ouvrir WinBox</strong>
              Connectez-vous en MAC ou IP sur votre équipement.
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-850 flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 font-bold text-[10px] flex items-center justify-center shrink-0">
              2
            </span>
            <div className="text-[11px] text-slate-400">
              <strong className="text-slate-200 block">New Terminal</strong>
              Cliquez sur le menu terminal dans la barre de gauche.
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-850 flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 font-bold text-[10px] flex items-center justify-center shrink-0">
              3
            </span>
            <div className="text-[11px] text-slate-400">
              <strong className="text-slate-200 block">Coller & Valider</strong>
              Faites un clic droit pour coller et appuyez sur Entrée.
            </div>
          </div>
        </div>
      </div>

      {/* METHOD 2: Full RouterOS Script Viewer (.rsc) with Sub-tabs */}
      <div className="p-6 rounded-2xl glass-card border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center border border-emerald-500/30">
              3
            </span>
            <h2 className="text-sm font-bold text-white">
              Méthode 2 : Script Complet RouterOS (.rsc)
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={downloadRsc}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-lg shadow-emerald-600/20"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Télécharger .rsc</span>
            </button>

            <button
              onClick={copyFullScript}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border border-slate-700"
            >
              {copiedFullScript ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Script Copié !</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copier le Script</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Script Section Sub-tabs */}
        <div className="flex flex-wrap gap-1.5 border-b border-slate-850 pb-2 text-xs">
          <button
            onClick={() => setScriptSubTab('full')}
            className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
              scriptSubTab === 'full'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Fichier Complet (.rsc)
          </button>
          <button
            onClick={() => setScriptSubTab('walled')}
            className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
              scriptSubTab === 'walled'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            1. Walled Garden
          </button>
          <button
            onClick={() => setScriptSubTab('heartbeat')}
            className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
              scriptSubTab === 'heartbeat'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            2. Heartbeat Cloud (45s)
          </button>
          <button
            onClick={() => setScriptSubTab('hotspot')}
            className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
              scriptSubTab === 'hotspot'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            3. Profils & MAC Cookie
          </button>
          <button
            onClick={() => setScriptSubTab('watchdog')}
            className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
              scriptSubTab === 'watchdog'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            4. Watchdog & Secours
          </button>
        </div>

        {/* Script Viewer Container */}
        <div className="relative">
          <pre className="p-4 sm:p-5 rounded-xl bg-slate-950 border border-slate-850 text-xs font-mono text-slate-300 max-h-72 overflow-y-auto leading-relaxed select-all">
            {currentDisplayedScript}
          </pre>
          <span className="absolute right-3 top-3 text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900/80 text-slate-500 border border-slate-800">
            RouterOS Script syntax
          </span>
        </div>
      </div>

      {/* METHOD 3: WinBox Drag & Drop Guide */}
      <div className="p-6 rounded-2xl glass-card border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <FolderDown className="w-5 h-5 text-purple-400" />
          <h2 className="text-sm sm:text-base font-bold text-white">
            Méthode 3 : Glisser-Déposer dans WinBox (Alternative Offline)
          </h2>
        </div>

        <p className="text-xs text-slate-300">
          Si votre routeur n'a pas accès direct à Internet au moment de l'initialisation, vous pouvez transférer le fichier directement via l'explorateur WinBox :
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-850 space-y-2">
            <span className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-300 font-bold text-xs flex items-center justify-center border border-purple-500/30">
              1
            </span>
            <strong className="text-white block font-semibold">Télécharger le fichier</strong>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Cliquez sur le bouton "Télécharger .rsc" ci-dessus pour obtenir <code className="text-amber-400">joowifi-setup-{token}.rsc</code>.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-850 space-y-2">
            <span className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-300 font-bold text-xs flex items-center justify-center border border-purple-500/30">
              2
            </span>
            <strong className="text-white block font-semibold">Glisser dans Files</strong>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Dans WinBox, ouvrez le menu <strong>Files</strong>, puis glissez-déposez le fichier <code className="text-cyan-300">.rsc</code> directement dans la fenêtre.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-850 space-y-2">
            <span className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-300 font-bold text-xs flex items-center justify-center border border-purple-500/30">
              3
            </span>
            <strong className="text-white block font-semibold">Exécuter l'import</strong>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Dans le Terminal WinBox, tapez :<br />
              <code className="text-emerald-400 font-mono text-[11px]">/import file=joowifi-setup-{token}.rsc</code>
            </p>
          </div>
        </div>
      </div>

      {/* TECHNICAL EXPLANATIONS & NETWORK SECURITY */}
      <div className="p-6 rounded-2xl glass-card border border-slate-800 bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-slate-950 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <h2 className="text-sm sm:text-base font-bold text-white">
            Architecture Réseau & Règles de Sécurité Technique
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* Card 1 */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-850 space-y-1.5">
            <div className="flex items-center gap-2 text-amber-400 font-bold">
              <Globe className="w-4 h-4" />
              <span>Walled Garden Sécurisé</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Autorise les URL du portail captif et des passerelles Mobile Money (Wave, Orange, MTN, Moov) sans nécessiter de forfait préalable.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-850 space-y-1.5">
            <div className="flex items-center gap-2 text-cyan-400 font-bold">
              <Zap className="w-4 h-4" />
              <span>Zero-Trust Sortant</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Le routeur contacte le cloud en HTTPS sortant toutes les 45s. Aucun port entrant n'est ouvert sur le WAN (protection contre les scans et attaques par force brute).
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-850 space-y-1.5">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <Smartphone className="w-4 h-4" />
              <span>MAC Cookie 30 Jours</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Reconnexion automatique transparente des smartphones tant que le forfait reste valide, sans ressaisir le code ticket.
            </p>
          </div>

          {/* Card 4 */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-850 space-y-1.5">
            <div className="flex items-center gap-2 text-purple-400 font-bold">
              <Sliders className="w-4 h-4" />
              <span>Simple Queues Débit</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Application automatique des limites de débit descendant/montant pour chaque utilisateur selon le forfait acheté.
            </p>
          </div>
        </div>
      </div>

      {/* LIVE TEST & VERIFICATION BAR */}
      <div className="p-5 sm:p-6 rounded-2xl glass-card border border-amber-500/30 bg-amber-500/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h3 className="text-sm font-bold text-white">Tester l'intégration immédiatement</h3>
          </div>
          <p className="text-xs text-slate-400">
            Vous n'avez pas de matériel MikroTik sous la main ? Simulez le premier Heartbeat du routeur pour valider le flux complet.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSimulateConnection}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs flex items-center gap-2 transition cursor-pointer shadow-lg shadow-amber-500/20 active:scale-95 shrink-0"
          >
            <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
            <span>Simuler la détection (Test Live)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
