import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ConnectedSession, PhysicalWifiHost } from '../../types';
import confetti from 'canvas-confetti';
import {
  Activity,
  Radio,
  Wifi,
  HardDrive,
  RefreshCw,
  Search,
  Filter,
  UserX,
  Clock,
  ArrowDown,
  ArrowUp,
  Gauge,
  Laptop,
  Smartphone,
  Tablet,
  Tv,
  HelpCircle,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Info,
  ShieldCheck,
  Server,
  Zap,
  ExternalLink,
  ChevronDown,
  Sparkles,
  Download,
  Terminal,
  Layers,
  Lock,
  Unlock,
  Eye,
  Sliders,
  MoreVertical,
} from 'lucide-react';

export const ActiveSessions: React.FC = () => {
  const {
    sessions,
    physicalHosts,
    routers,
    forfaits,
    disconnectSession,
    disconnectAllSessions,
    refreshSessions,
    authorizeHost,
    heartbeatSecondsRemaining,
  } = useApp();

  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'sessions' | 'hosts'>('sessions');

  // Filter states
  const [selectedRouterId, setSelectedRouterId] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [hostStatusFilter, setHostStatusFilter] = useState<'all' | 'authenticated' | 'unauthenticated' | 'bypassed'>('all');

  // UI action states
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [disconnectingId, setDisconnectingId] = useState<string | null>(null);
  const [isDisconnectingAll, setIsDisconnectingAll] = useState<boolean>(false);
  const [selectedSessionForModal, setSelectedSessionForModal] = useState<ConnectedSession | null>(null);
  const [selectedHostForModal, setSelectedHostForModal] = useState<PhysicalWifiHost | null>(null);
  const [authorizingHostId, setAuthorizingHostId] = useState<string | null>(null);
  const [selectedForfaitForAuth, setSelectedForfaitForAuth] = useState<string>(forfaits[0]?.id || '');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Auto-clear toast
  useEffect(() => {
    if (!toastMessage) return;
    const t = setTimeout(() => setToastMessage(null), 4000);
    return () => clearTimeout(t);
  }, [toastMessage]);

  // Handle manual refresh with animation
  const handleManualRefresh = () => {
    setIsRefreshing(true);
    refreshSessions();
    setToastMessage('Données actualisées depuis les caches MikroTik (Pull Model).');
    setTimeout(() => {
      setIsRefreshing(false);
    }, 700);
  };

  // Handle single disconnect
  const handleDisconnect = (id: string, username: string) => {
    setDisconnectingId(id);
    setTimeout(() => {
      disconnectSession(id);
      setDisconnectingId(null);
      if (selectedSessionForModal?.id === id) {
        setSelectedSessionForModal(null);
      }
      setToastMessage(`Ordre de déconnexion envoyé pour ${username}. Prise d'effet sous ~${heartbeatSecondsRemaining}s.`);
    }, 500);
  };

  // Handle disconnect all
  const handleDisconnectAll = () => {
    const count = filteredSessions.length;
    if (count === 0) return;

    setIsDisconnectingAll(true);
    setTimeout(() => {
      disconnectAllSessions(selectedRouterId === 'all' ? undefined : selectedRouterId);
      setIsDisconnectingAll(false);
      setToastMessage(`${count} abonnés déconnectés. Les routeurs exécutent l'expulsion via le prochain cycle.`);
    }, 600);
  };

  // Handle host manual authorization
  const handleAuthorizeHostSubmit = (hostId: string) => {
    authorizeHost(hostId, selectedForfaitForAuth);
    setAuthorizingHostId(null);
    setToastMessage("Hôte physique autorisé avec succès et session activée !");
    try {
      confetti({ particleCount: 35, spread: 60, origin: { y: 0.7 } });
    } catch {
      // ignore
    }
  };

  // Filtered Sessions
  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      // Router filter
      if (selectedRouterId !== 'all') {
        const matchesRouterId = s.routerId === selectedRouterId;
        const targetRouter = routers.find((r) => r.id === selectedRouterId);
        const matchesRouterName = targetRouter && s.routerName === targetRouter.name;
        if (!matchesRouterId && !matchesRouterName) return false;
      }
      // Search term
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchUser = s.username.toLowerCase().includes(term);
        const matchIp = s.ipAddress.toLowerCase().includes(term);
        const matchMac = s.macAddress.toLowerCase().includes(term);
        const matchForfait = s.forfaitName.toLowerCase().includes(term);
        const matchRouter = s.routerName.toLowerCase().includes(term);
        if (!matchUser && !matchIp && !matchMac && !matchForfait && !matchRouter) return false;
      }
      return true;
    });
  }, [sessions, selectedRouterId, searchTerm, routers]);

  // Filtered Hosts
  const filteredHosts = useMemo(() => {
    return physicalHosts.filter((h) => {
      // Router filter
      if (selectedRouterId !== 'all') {
        const matchesRouterId = h.routerId === selectedRouterId;
        const targetRouter = routers.find((r) => r.id === selectedRouterId);
        const matchesRouterName = targetRouter && h.routerName === targetRouter.name;
        if (!matchesRouterId && !matchesRouterName) return false;
      }
      // Status filter
      if (hostStatusFilter !== 'all' && h.status !== hostStatusFilter) {
        return false;
      }
      // Search term
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchIp = h.ipAddress.toLowerCase().includes(term);
        const matchMac = h.macAddress.toLowerCase().includes(term);
        const matchVendor = h.deviceVendor?.toLowerCase().includes(term);
        const matchIface = h.interfaceName.toLowerCase().includes(term);
        const matchUser = h.authorizedUsername?.toLowerCase().includes(term);
        if (!matchIp && !matchMac && !matchVendor && !matchIface && !matchUser) return false;
      }
      return true;
    });
  }, [physicalHosts, selectedRouterId, hostStatusFilter, searchTerm, routers]);

  // Global KPI calculations
  const totalSubscribers = sessions.length;
  const totalHosts = physicalHosts.length;
  const totalBandwidthDown = sessions.reduce((acc, s) => acc + (s.downloadRateKbps || 0), 0);
  const totalBandwidthUp = sessions.reduce((acc, s) => acc + (s.uploadRateKbps || 0), 0);
  const totalBandwidthMbps = ((totalBandwidthDown + totalBandwidthUp) / 1024).toFixed(1);

  // Format uptime
  const formatUptime = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m.toString().padStart(2, '0')}m`;
  };

  // Device icon helper
  const renderDeviceIcon = (deviceType?: string) => {
    switch (deviceType) {
      case 'laptop':
        return <Laptop className="w-3.5 h-3.5 text-blue-400" />;
      case 'tablet':
        return <Tablet className="w-3.5 h-3.5 text-purple-400" />;
      case 'smart_tv':
        return <Tv className="w-3.5 h-3.5 text-amber-400" />;
      case 'smartphone':
      default:
        return <Smartphone className="w-3.5 h-3.5 text-emerald-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-slate-900/95 border border-amber-500/40 text-amber-300 rounded-xl shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-5">
          <Info className="w-5 h-5 text-amber-400 flex-shrink-0" />
          <span className="text-xs font-medium">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white text-xs ml-2"
          >
            ×
          </button>
        </div>
      )}

      {/* 1. EN-TÊTE & CONTRÔLE DU TEMPS RÉEL */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-2xl glass-card border border-slate-800 bg-slate-900/40">
        <div>
          {/* Breadcrumb / Tag badge */}
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono tracking-wider uppercase font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1.5">
              <Activity className="w-3 h-3 text-amber-400 animate-pulse" />
              <span>SUPERVISION HOTSPOT MIKROTIK</span>
            </span>
            <span className="text-xs text-slate-500">•</span>
            <span className="text-xs text-slate-400 font-mono">/dashboard/sessions</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Activity className="w-6 h-6 text-amber-400" />
            </span>
            <span>Sessions et hôtes connectés</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Visualisez et gérez en temps réel les abonnés authentifiés ainsi que tous les appareils physiques
            connectés sur l'ensemble de vos routeurs MikroTik.
          </p>
        </div>

        {/* Dynamic synchronization tools on the right */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Real-time status badge with pulsating green LED */}
          <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-mono shadow-inner">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <div className="flex flex-col">
              <span className="text-white font-semibold text-[11px] leading-tight">
                Temps réel actif ({heartbeatSecondsRemaining}s)
              </span>
              <span className="text-[10px] text-slate-400 leading-tight">Heartbeat Cloud Pull</span>
            </div>
          </div>

          {/* Manual Refresh Button */}
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className={`px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-750 text-slate-200 text-xs font-medium flex items-center gap-2 transition active:scale-95 cursor-pointer shadow-sm ${
              isRefreshing ? 'opacity-70 cursor-not-allowed' : ''
            }`}
            title="Forcer la synchronisation avec les tables MikroTik"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Actualiser</span>
          </button>
        </div>
      </div>

      {/* 2. RANGÉE DES 3 MÉTRIQUES MAJEURES (KPI CARDS) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* KPI 1 : ABONNÉS EN LIGNE */}
        <div className="relative overflow-hidden p-5 rounded-2xl glass-card border border-slate-800 bg-gradient-to-br from-slate-900/90 via-slate-900/50 to-emerald-950/20 group hover:border-emerald-500/40 transition">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-slate-400 font-mono font-semibold">
                Abonnés en ligne
              </p>
              <div className="text-3xl font-black text-white font-mono mt-1 flex items-baseline gap-2">
                <span>{totalSubscribers}</span>
                <span className="text-xs text-emerald-400 font-sans font-medium">actifs</span>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Wifi className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-3 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Clients actuellement connectés avec un forfait ou ticket valide.</span>
          </p>
        </div>

        {/* KPI 2 : TOTAL DES ÉQUIPEMENTS (HÔTES) */}
        <div className="relative overflow-hidden p-5 rounded-2xl glass-card border border-slate-800 bg-gradient-to-br from-slate-900/90 via-slate-900/50 to-blue-950/20 group hover:border-blue-500/40 transition">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-slate-400 font-mono font-semibold">
                Total des équipements
              </p>
              <div className="text-3xl font-black text-white font-mono mt-1 flex items-baseline gap-2">
                <span>{totalHosts}</span>
                <span className="text-xs text-blue-400 font-sans font-medium">hôtes détectés</span>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <HardDrive className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-3 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            <span>Appareils accrochés au WiFi (authentifiés ou en attente sur le portail).</span>
          </p>
        </div>

        {/* KPI 3 : DÉBIT INSTANTANÉ TOTAL */}
        <div className="relative overflow-hidden p-5 rounded-2xl glass-card border border-slate-800 bg-gradient-to-br from-slate-900/90 via-slate-900/50 to-amber-950/20 group hover:border-amber-500/40 transition">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-slate-400 font-mono font-semibold">
                Bande passante active
              </p>
              <div className="text-3xl font-black text-white font-mono mt-1 flex items-baseline gap-2">
                <span>{totalBandwidthMbps}</span>
                <span className="text-xs text-amber-400 font-mono font-semibold">Mbps</span>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Gauge className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-3 font-mono">
            <span className="flex items-center gap-1 text-emerald-400">
              <ArrowDown className="w-3 h-3" /> {(totalBandwidthDown / 1024).toFixed(1)} Mbps
            </span>
            <span className="flex items-center gap-1 text-blue-400">
              <ArrowUp className="w-3 h-3" /> {(totalBandwidthUp / 1024).toFixed(1)} Mbps
            </span>
          </div>
        </div>
      </div>

      {/* 3. BARRE DE FILTRAGE PAR ÉQUIPEMENT & CONTRÔLE */}
      <div className="p-4 rounded-2xl glass-card border border-slate-800 bg-slate-900/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Router select dropdown with server icon */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1 max-w-xl">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-300 whitespace-nowrap">
            <Server className="w-4 h-4 text-amber-400" />
            <span>Filtrer par équipement :</span>
          </div>

          <div className="relative flex-1">
            <select
              value={selectedRouterId}
              onChange={(e) => setSelectedRouterId(e.target.value)}
              className="w-full appearance-none px-3.5 py-2 pr-9 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-600 text-white text-xs font-mono focus:outline-none focus:border-amber-500 transition cursor-pointer"
            >
              <option value="all">Tous les équipements ({routers.length} routeurs)</option>
              {routers.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.ipAddress}) • {r.status === 'online' ? '🟢 En ligne' : '🔴 Hors ligne'}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3 pointer-events-none" />
          </div>
        </div>

        {/* Right: Search box & mass actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Rechercher IP, MAC, ticket..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-white text-xs"
              >
                ×
              </button>
            )}
          </div>

          {activeTab === 'sessions' && filteredSessions.length > 0 && (
            <button
              onClick={handleDisconnectAll}
              disabled={isDisconnectingAll}
              className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-medium flex items-center gap-1.5 transition active:scale-95 cursor-pointer ml-auto"
              title="Déconnecter tous les abonnés de la sélection"
            >
              <UserX className="w-3.5 h-3.5 text-rose-400" />
              <span>{isDisconnectingAll ? 'Envoi...' : 'Tout déconnecter'}</span>
            </button>
          )}
        </div>
      </div>

      {/* 4. NAVIGATION À 2 ONGLETS CONTEXTUELS */}
      <div className="flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          {/* Onglet 1 : Sessions actives */}
          <button
            onClick={() => setActiveTab('sessions')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition cursor-pointer ${
              activeTab === 'sessions'
                ? 'border-amber-500 text-amber-400 bg-amber-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>Sessions actives</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                activeTab === 'sessions'
                  ? 'bg-amber-500/20 text-amber-300'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {filteredSessions.length}
            </span>
          </button>

          {/* Onglet 2 : Hôtes physiques WiFi */}
          <button
            onClick={() => setActiveTab('hosts')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition cursor-pointer ${
              activeTab === 'hosts'
                ? 'border-amber-500 text-amber-400 bg-amber-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <HardDrive className="w-4 h-4" />
            <span>Hôtes physiques WiFi</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                activeTab === 'hosts'
                  ? 'bg-amber-500/20 text-amber-300'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {filteredHosts.length}
            </span>
          </button>
        </div>

        {/* Filter sub-tools for hosts tab */}
        {activeTab === 'hosts' && (
          <div className="hidden sm:flex items-center gap-1.5 text-xs pb-1">
            <span className="text-[11px] text-slate-500 font-mono">État hôte :</span>
            {(['all', 'authenticated', 'unauthenticated', 'bypassed'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setHostStatusFilter(mode)}
                className={`px-2 py-1 rounded-lg text-[10px] font-medium transition cursor-pointer ${
                  hostStatusFilter === mode
                    ? 'bg-slate-800 text-amber-400 border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {mode === 'all'
                  ? 'Tous'
                  : mode === 'authenticated'
                  ? 'Authentifié'
                  : mode === 'unauthenticated'
                  ? 'Non auth'
                  : 'Bypass VIP'}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 5. VUE ONGLET 1 : SESSIONS ACTIVES (ABONNÉS AUTHENTIFIÉS) */}
      {activeTab === 'sessions' && (
        <div className="rounded-2xl glass-card border border-slate-800 overflow-hidden bg-slate-900/40 shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/95 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800 font-mono">
                <tr>
                  <th className="py-3 px-4">Utilisateur / Ticket</th>
                  <th className="py-3 px-4">Adresse IP</th>
                  <th className="py-3 px-4">Adresse MAC</th>
                  <th className="py-3 px-4">Équipement Routeur</th>
                  <th className="py-3 px-4">Durée de Connexion</th>
                  <th className="py-3 px-4">Profil / Forfait</th>
                  <th className="py-3 px-4">Consommation & Débit</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {filteredSessions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-14 text-center">
                      <div className="max-w-md mx-auto flex flex-col items-center">
                        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-3">
                          <Radio className="w-7 h-7" />
                        </div>
                        <h3 className="text-base font-bold text-white font-sans">
                          Aucun abonné connecté actuellement
                        </h3>
                        <p className="text-xs text-slate-400 font-sans mt-1">
                          {searchTerm || selectedRouterId !== 'all'
                            ? 'Aucune session ne correspond aux critères de filtre sélectionnés.'
                            : "Les sessions apparaîtront dès qu'un client s'authentifiera avec succès sur le portail captif d'un routeur."}
                        </p>
                        <button
                          onClick={handleManualRefresh}
                          className="mt-4 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 text-xs font-sans font-medium flex items-center gap-1.5 cursor-pointer"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Actualiser le polling</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredSessions.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-850/60 transition group">
                      {/* Utilisateur / Ticket */}
                      <td className="py-3.5 px-4 font-sans">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300">
                            {renderDeviceIcon(s.deviceType)}
                          </div>
                          <div>
                            <div className="font-bold text-white text-xs font-mono flex items-center gap-1.5">
                              <span>{s.username}</span>
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                            </div>
                            <div className="text-[10px] text-slate-400 flex items-center gap-1">
                              <span>{s.deviceType || 'Appareil mobile'}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* IP */}
                      <td className="py-3.5 px-4 text-slate-200">
                        <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[11px] text-blue-300">
                          {s.ipAddress}
                        </span>
                      </td>

                      {/* MAC */}
                      <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                        <span>{s.macAddress}</span>
                      </td>

                      {/* Routeur */}
                      <td className="py-3.5 px-4 font-sans">
                        <div className="text-xs text-slate-300 font-medium truncate max-w-[180px]">
                          {s.routerName}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          Signal :{' '}
                          <span
                            className={
                              s.signalDbm > -65
                                ? 'text-emerald-400'
                                : s.signalDbm > -75
                                ? 'text-amber-400'
                                : 'text-rose-400'
                            }
                          >
                            {s.signalDbm} dBm
                          </span>
                        </div>
                      </td>

                      {/* Durée de Connexion */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-slate-300 text-[11px]">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{formatUptime(s.uptimeMinutes)}</span>
                        </div>
                        {s.timeRemainingMinutes !== undefined && (
                          <div className="text-[10px] text-amber-400 font-sans">
                            Reste : {formatUptime(s.timeRemainingMinutes)}
                          </div>
                        )}
                      </td>

                      {/* Profil / Forfait */}
                      <td className="py-3.5 px-4 font-sans">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/25">
                          <Sparkles className="w-3 h-3 text-amber-400" />
                          <span>{s.forfaitName}</span>
                        </span>
                      </td>

                      {/* Consommation & Débit */}
                      <td className="py-3.5 px-4">
                        <div className="text-[11px] text-slate-200 flex items-center gap-1.5">
                          <span className="text-emerald-400 flex items-center">
                            <ArrowDown className="w-3 h-3" />
                            {s.bytesInMb.toFixed(1)} Mo
                          </span>
                          <span className="text-slate-500">•</span>
                          <span className="text-blue-400 flex items-center">
                            <ArrowUp className="w-3 h-3" />
                            {s.bytesOutMb.toFixed(1)} Mo
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Débit : {s.downloadRateKbps ? `${(s.downloadRateKbps / 1024).toFixed(1)} Mb/s` : '—'}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right font-sans">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedSessionForModal(s)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                            title="Inspecter les détails de la session"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDisconnect(s.id, s.username)}
                            disabled={disconnectingId === s.id}
                            className="px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-medium transition cursor-pointer flex items-center gap-1"
                            title={`Déconnexion asynchrone transmise au routeur (délai pull ~${heartbeatSecondsRemaining}s)`}
                          >
                            <UserX className="w-3.5 h-3.5 text-rose-400" />
                            <span>{disconnectingId === s.id ? 'Ordre...' : 'Déconnecter'}</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. VUE ONGLET 2 : HÔTES PHYSIQUES WIFI (DHCP LEASES / WIRELESS REGISTRATION) */}
      {activeTab === 'hosts' && (
        <div className="rounded-2xl glass-card border border-slate-800 overflow-hidden bg-slate-900/40 shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/95 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800 font-mono">
                <tr>
                  <th className="py-3 px-4">Adresse MAC / Fabricant</th>
                  <th className="py-3 px-4">Adresse IP Attribuée</th>
                  <th className="py-3 px-4">Routeur & Interface</th>
                  <th className="py-3 px-4">Niveau Signal</th>
                  <th className="py-3 px-4">Statut d'Accès</th>
                  <th className="py-3 px-4">Trafic Échangé</th>
                  <th className="py-3 px-4">Dernière Activité</th>
                  <th className="py-3 px-4 text-right">Action Rapide</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {filteredHosts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-14 text-center">
                      <div className="max-w-md mx-auto flex flex-col items-center">
                        <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-3">
                          <HardDrive className="w-7 h-7" />
                        </div>
                        <h3 className="text-base font-bold text-white font-sans">
                          Aucun hôte physique détecté
                        </h3>
                        <p className="text-xs text-slate-400 font-sans mt-1">
                          Aucun équipement radio ou bail DHCP actif ne correspond aux filtres actuels.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredHosts.map((h) => (
                    <tr key={h.id} className="hover:bg-slate-850/60 transition group">
                      {/* MAC & Constructeur */}
                      <td className="py-3.5 px-4 font-sans">
                        <div className="font-mono text-xs font-bold text-white">{h.macAddress}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1 font-sans">
                          <span>{h.deviceVendor || 'Périphérique WiFi standard'}</span>
                        </div>
                      </td>

                      {/* IP */}
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-200">
                          {h.ipAddress}
                        </span>
                      </td>

                      {/* Routeur & Interface */}
                      <td className="py-3.5 px-4 font-sans">
                        <div className="text-xs text-slate-300 font-medium truncate max-w-[170px]">
                          {h.routerName}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          Iface : <span className="text-amber-400">{h.interfaceName}</span>
                        </div>
                      </td>

                      {/* Signal */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              h.signalDbm > -65
                                ? 'bg-emerald-400'
                                : h.signalDbm > -75
                                ? 'bg-amber-400'
                                : 'bg-rose-400'
                            }`}
                          />
                          <span className="text-slate-200 text-xs">{h.signalDbm} dBm</span>
                        </div>
                      </td>

                      {/* Statut d'accès */}
                      <td className="py-3.5 px-4 font-sans">
                        {h.status === 'authenticated' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            <span>AUTHENTIFIÉ</span>
                          </span>
                        )}
                        {h.status === 'unauthenticated' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30 font-mono">
                            <Lock className="w-3 h-3 text-amber-400" />
                            <span>PORTAIL CAPTIF</span>
                          </span>
                        )}
                        {h.status === 'bypassed' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/30 font-mono">
                            <ShieldCheck className="w-3 h-3 text-purple-400" />
                            <span>MAC BYPASS</span>
                          </span>
                        )}
                        {h.authorizedUsername && (
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            Ticket : {h.authorizedUsername}
                          </div>
                        )}
                      </td>

                      {/* Trafic */}
                      <td className="py-3.5 px-4 text-slate-300">
                        <span>{h.bytesTotalMb.toFixed(1)} Mo</span>
                      </td>

                      {/* Activité */}
                      <td className="py-3.5 px-4 text-slate-400 font-sans text-[11px]">
                        <span>{h.lastActivity}</span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right font-sans">
                        {h.status === 'unauthenticated' ? (
                          <button
                            onClick={() => {
                              setAuthorizingHostId(h.id);
                              setSelectedHostForModal(h);
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-medium transition cursor-pointer flex items-center gap-1 ml-auto"
                            title="Autoriser manuellement cet appareil sans saisir de code"
                          >
                            <Unlock className="w-3.5 h-3.5 text-amber-400" />
                            <span>Autoriser</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => setSelectedHostForModal(h)}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition cursor-pointer flex items-center gap-1 ml-auto"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-400" />
                            <span>Détails</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 7. ENCART PÉDAGOGIQUE DU DÉLAI DE SYNCHRONISATION PULL */}
      <div className="p-5 rounded-2xl glass-card border border-amber-500/20 bg-amber-950/10 flex flex-col sm:flex-row items-start gap-4">
        <div className="p-3 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 flex-shrink-0">
          <Info className="w-5 h-5 text-amber-400" />
        </div>
        <div className="space-y-1.5">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <span>Fonctionnement de la synchronisation asynchrone (Pull Model)</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40">
              Heartbeat 45s
            </span>
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            Joowifi utilise une architecture <strong>Zero-Trust sécurisée</strong> : les routeurs MikroTik interrogent
            régulièrement la console cloud (modèle <em>Pull</em> sortant) pour récupérer les ordres d'expulsion,
            mettre à jour les compteurs de quotas et synchroniser les profils Hotspot.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-[11px] text-slate-400">
            <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-900/60 border border-slate-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span><strong>Aucun port entrant ouvert :</strong> Votre routeur est protégé derrière le NAT/CGNAT.</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-900/60 border border-slate-800">
              <Clock className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span><strong>Délai effectif d'expulsion :</strong> Les déconnexions manuelles prennent effet lors du cycle suivant (au maximum {heartbeatSecondsRemaining}s).</span>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL 1 : DÉTAIL SESSION CLIENT */}
      {selectedSessionForModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl glass-card border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  <Radio className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-mono">
                    Session {selectedSessionForModal.username}
                  </h3>
                  <p className="text-xs text-slate-400">Détails techniques de l'abonné connecté</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedSessionForModal(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs font-mono">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block uppercase">Adresse IP</span>
                  <span className="text-blue-300 font-bold text-sm">{selectedSessionForModal.ipAddress}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block uppercase">Adresse MAC</span>
                  <span className="text-slate-200 font-bold text-sm">{selectedSessionForModal.macAddress}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block uppercase">Routeur MikroTik</span>
                  <span className="text-slate-300 font-bold font-sans text-xs">{selectedSessionForModal.routerName}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block uppercase">Forfait / Profil</span>
                  <span className="text-amber-400 font-bold font-sans text-xs">{selectedSessionForModal.forfaitName}</span>
                </div>
              </div>

              {/* Data consumption card */}
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Volume consommé (Download / Upload)</span>
                  <span className="text-white font-bold">
                    {(selectedSessionForModal.bytesInMb + selectedSessionForModal.bytesOutMb).toFixed(1)} Mo
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden flex">
                  <div className="bg-emerald-500 h-full w-[80%]" title="Download" />
                  <div className="bg-blue-500 h-full w-[20%]" title="Upload" />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span className="text-emerald-400 flex items-center gap-1">
                    <ArrowDown className="w-3 h-3" /> {selectedSessionForModal.bytesInMb.toFixed(1)} Mo
                  </span>
                  <span className="text-blue-400 flex items-center gap-1">
                    <ArrowUp className="w-3 h-3" /> {selectedSessionForModal.bytesOutMb.toFixed(1)} Mo
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-slate-300">
                <span>Temps de session écoulé :</span>
                <span className="text-white font-bold">{formatUptime(selectedSessionForModal.uptimeMinutes)}</span>
              </div>
            </div>

            <div className="p-4 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between font-sans">
              <button
                onClick={() => setSelectedSessionForModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer"
              >
                Fermer
              </button>
              <button
                onClick={() => handleDisconnect(selectedSessionForModal.id, selectedSessionForModal.username)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <UserX className="w-4 h-4" />
                <span>Expulser l'abonné</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2 : AUTORISER MANUELLEMENT UN HÔTE PHYSIQUE */}
      {authorizingHostId && selectedHostForModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl glass-card border border-amber-500/30 bg-slate-900 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  <Unlock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Autoriser l'appareil</h3>
                  <p className="text-xs text-slate-400">Attribution d'une session WiFi instantanée</p>
                </div>
              </div>
              <button
                onClick={() => setAuthorizingHostId(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1 font-mono text-xs">
                <div className="text-slate-400 flex justify-between">
                  <span>MAC :</span>
                  <span className="text-amber-400 font-bold">{selectedHostForModal.macAddress}</span>
                </div>
                <div className="text-slate-400 flex justify-between">
                  <span>IP Attribuée :</span>
                  <span className="text-blue-300">{selectedHostForModal.ipAddress}</span>
                </div>
                <div className="text-slate-400 flex justify-between">
                  <span>Routeur :</span>
                  <span className="text-slate-200">{selectedHostForModal.routerName}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Sélectionner le forfait à assigner :
                </label>
                <select
                  value={selectedForfaitForAuth}
                  onChange={(e) => setSelectedForfaitForAuth(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  {forfaits.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.durationHours}h) - {f.price} FCFA ({f.downloadSpeedMbps} Mbps)
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1.5">
                  L'appareil aura accès instantanément à Internet sans devoir saisir de code sur le portail captif.
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={() => setAuthorizingHostId(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer"
              >
                Annuler
              </button>
              <button
                onClick={() => handleAuthorizeHostSubmit(selectedHostForModal.id)}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-lg shadow-amber-500/20"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirmer l'accès</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
