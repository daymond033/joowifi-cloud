import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { RouterItem } from '../../types';
import confetti from 'canvas-confetti';
import {
  Router as RouterIcon,
  Plus,
  RefreshCw,
  Power,
  Key,
  Copy,
  Check,
  Activity,
  Cpu,
  Clock,
  Radio,
  ExternalLink,
  ShieldCheck,
  Search,
  SlidersHorizontal,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Terminal,
  ArrowUpRight,
  ArrowDownRight,
  HardDrive,
  Thermometer,
  Gauge,
  X,
  Edit2,
  Trash2,
  Info,
  Server,
  Network,
  Download,
  Eye,
  EyeOff,
  Flame,
  Globe,
  RadioTower,
} from 'lucide-react';

export const MikroTikManager: React.FC = () => {
  const {
    routers,
    rebootRouter,
    updateRouter,
    deleteRouter,
    reconcileProfiles,
    pingRouter,
    regenerateRouterToken,
    setAdminTab,
    heartbeatSecondsRemaining,
    heartbeatQueue,
    forceHeartbeatSync,
    zones,
    forfaits,
  } = useApp();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedZoneFilter, setSelectedZoneFilter] = useState('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'all' | 'online' | 'warning' | 'offline'>('all');

  // Copy feedback
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  // Reconciliation state
  const [isReconciling, setIsReconciling] = useState(false);
  const [reconcileNotice, setReconcileNotice] = useState<string | null>(null);

  // Ping state
  const [pingingId, setPingingId] = useState<string | null>(null);
  const [pingResult, setPingResult] = useState<{ id: string; latency: number } | null>(null);

  // Modals state
  const [rebootModalRouter, setRebootModalRouter] = useState<RouterItem | null>(null);
  const [isRebooting, setIsRebooting] = useState(false);
  const [detailsModalRouter, setDetailsModalRouter] = useState<RouterItem | null>(null);
  const [editModalRouter, setEditModalRouter] = useState<RouterItem | null>(null);
  const [deleteModalRouter, setDeleteModalRouter] = useState<RouterItem | null>(null);

  // Edit form state
  const [editName, setEditName] = useState('');
  const [editModel, setEditModel] = useState('');
  const [editZoneId, setEditZoneId] = useState('');
  const [editIp, setEditIp] = useState('');

  // Token visibility in table/cards
  const [revealedTokens, setRevealedTokens] = useState<Record<string, boolean>>({});

  const toggleRevealToken = (id: string) => {
    setRevealedTokens((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(id);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  // Trigger Profile Reconciliation
  const handleReconcileProfiles = async () => {
    setIsReconciling(true);
    setReconcileNotice(null);
    try {
      const res = await reconcileProfiles();
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.3 },
      });
      setReconcileNotice(res.message);
      setTimeout(() => setReconcileNotice(null), 4000);
    } catch {
      setReconcileNotice('Erreur lors de la réconciliation.');
    } finally {
      setIsReconciling(false);
    }
  };

  // Trigger Single Router Ping / Heartbeat Test
  const handlePing = async (routerId: string) => {
    setPingingId(routerId);
    setPingResult(null);
    try {
      const res = await pingRouter(routerId);
      setPingResult({ id: routerId, latency: res.latencyMs });
      setTimeout(() => {
        setPingResult((prev) => (prev?.id === routerId ? null : prev));
      }, 4000);
    } catch {
      // error handled
    } finally {
      setPingingId(null);
    }
  };

  // Open Edit Modal
  const openEditModal = (router: RouterItem) => {
    setEditModalRouter(router);
    setEditName(router.name);
    setEditModel(router.model || 'MikroTik RouterBOARD');
    setEditZoneId(router.zoneId);
    setEditIp(router.ipAddress);
  };

  // Submit Edit
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModalRouter) return;
    const targetZone = zones.find((z) => z.id === editZoneId);
    updateRouter(editModalRouter.id, {
      name: editName.trim() || editModalRouter.name,
      model: editModel.trim() || editModalRouter.model,
      zoneId: editZoneId,
      zoneName: targetZone ? targetZone.name : editModalRouter.zoneName,
      ipAddress: editIp.trim() || editModalRouter.ipAddress,
    });
    setEditModalRouter(null);
  };

  // Handle Confirmed Reboot
  const handleConfirmReboot = () => {
    if (!rebootModalRouter) return;
    setIsRebooting(true);
    setTimeout(() => {
      rebootRouter(rebootModalRouter.id);
      setIsRebooting(false);
      setRebootModalRouter(null);
    }, 600);
  };

  // Handle Delete Router
  const handleConfirmDelete = () => {
    if (!deleteModalRouter) return;
    deleteRouter(deleteModalRouter.id);
    setDeleteModalRouter(null);
  };

  // Filtered routers
  const filteredRouters = useMemo(() => {
    return routers.filter((router) => {
      const matchesSearch =
        router.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (router.model && router.model.toLowerCase().includes(searchQuery.toLowerCase())) ||
        router.ipAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
        router.macAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
        router.zoneName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (router.cloudDns && router.cloudDns.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesZone = selectedZoneFilter === 'all' || router.zoneId === selectedZoneFilter;
      const matchesStatus =
        selectedStatusFilter === 'all' ||
        (selectedStatusFilter === 'online' && router.status === 'online') ||
        (selectedStatusFilter === 'warning' && router.status === 'warning') ||
        (selectedStatusFilter === 'offline' && router.status === 'offline');

      return matchesSearch && matchesZone && matchesStatus;
    });
  }, [routers, searchQuery, selectedZoneFilter, selectedStatusFilter]);

  // Global KPIs
  const totalRoutersCount = routers.length;
  const onlineRoutersCount = routers.filter((r) => r.status === 'online').length;
  const totalSubscribersConnected = routers.reduce((acc, r) => acc + (r.totalSubscribers || 0), 0);
  const totalTrafficDown = routers.reduce((acc, r) => acc + (r.trafficDownMbps || 0), 0).toFixed(1);
  const totalTrafficUp = routers.reduce((acc, r) => acc + (r.trafficUpMbps || 0), 0).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Section Pill */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>Console Joowifi</span>
          <span>/</span>
          <span className="text-amber-400 font-semibold flex items-center gap-1">
            <RadioTower className="w-3.5 h-3.5" />
            MIKROTIK
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            CYCLE DE POLLING CLOUD : 45S
          </span>
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono bg-slate-900 border border-slate-800 text-slate-400">
            <span>Pull dans :</span>
            <span className="text-emerald-400 font-bold">{heartbeatSecondsRemaining}s</span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl glass-card border border-slate-800 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-slate-950">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/10">
              <RouterIcon className="w-6 h-6" />
            </div>
            <span>Routeurs MikroTik</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Supervisez et gérez vos équipements connectés en temps réel. Compatible RouterOS v6.44+ et v7+.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Reconcile Profiles Button */}
          <button
            onClick={handleReconcileProfiles}
            disabled={isReconciling}
            className="px-3.5 sm:px-4 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 border border-slate-700/80 hover:border-slate-600 text-xs font-semibold flex items-center gap-2 transition cursor-pointer shadow-sm hover:text-white disabled:opacity-50"
            title="Appliquer les profils de forfaits WiFi locaux sur les routeurs MikroTik"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${isReconciling ? 'animate-spin' : ''}`} />
            <span>{isReconciling ? 'Synchronisation...' : 'Réconcilier les Profils'}</span>
          </button>

          {/* Add / Install Router Button */}
          <button
            onClick={() => setAdminTab('installation')}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs flex items-center gap-2 transition cursor-pointer shadow-lg shadow-amber-500/20 active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ Installer un Routeur</span>
          </button>
        </div>
      </div>

      {/* Reconciliation Toast / Feedback banner */}
      {reconcileNotice && (
        <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs flex items-center justify-between gap-3 animate-fade-in shadow-lg">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <strong className="text-emerald-300">Synchronisation des Profils Réussie :</strong> {reconcileNotice}
            </div>
          </div>
          <button
            onClick={() => setReconcileNotice(null)}
            className="text-emerald-400/80 hover:text-emerald-200 p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 4 Global KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* KPI 1: Total Routeurs */}
        <div className="p-4 rounded-2xl glass-card border border-slate-800 bg-slate-900/60 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Parc d'équipements
            </span>
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Server className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{totalRoutersCount}</span>
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {onlineRoutersCount} en ligne
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {routers.filter((r) => r.status === 'warning').length} alerte(s) de synchronisation
          </p>
        </div>

        {/* KPI 2: Sessions Actives */}
        <div className="p-4 rounded-2xl glass-card border border-slate-800 bg-slate-900/60 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Abonnés Connectés
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Radio className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-400">{totalSubscribersConnected}</span>
            <span className="text-xs text-slate-400">utilisateurs</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Sessions Hotspot actives en temps réel
          </p>
        </div>

        {/* KPI 3: Bande Passante Cumulée */}
        <div className="p-4 rounded-2xl glass-card border border-slate-800 bg-slate-900/60 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Débit Total Réseau
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Activity className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-black text-amber-400">↓ {totalTrafficDown}</span>
            <span className="text-xs font-mono text-slate-400">Mbps</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
            <span>↑ {totalTrafficUp} Mbps montant</span>
          </p>
        </div>

        {/* KPI 4: Profils Forfaits Synchronisés */}
        <div className="p-4 rounded-2xl glass-card border border-slate-800 bg-slate-900/60 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Profils Hotspot
            </span>
            <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-cyan-300">{forfaits.length}</span>
            <span className="text-xs text-slate-400">offres actives</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Reconnexion MAC Cookie activée
          </p>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="p-4 sm:p-5 rounded-2xl glass-card border border-amber-500/25 bg-slate-900/70 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs sm:text-sm font-bold text-white">
                  File d'Attente Cloud Pull (Instructions RouterOS `.rsc`)
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  {heartbeatQueue.filter((c) => c.status === 'pending').length} en attente • Pull dans {heartbeatSecondsRemaining}s
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Modèle Zero-Trust : vos routeurs MikroTik récupèrent et exécutent ces commandes automatiquement toutes les 45s.
              </p>
            </div>
          </div>
          <button
            onClick={forceHeartbeatSync}
            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 transition cursor-pointer active:scale-95 shrink-0 shadow-lg shadow-amber-500/20"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Forcer Sync Heartbeat (45s)</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-44 overflow-y-auto pr-1">
          {heartbeatQueue.slice(0, 6).map((cmd) => (
            <div
              key={cmd.id}
              className="p-2.5 rounded-xl bg-slate-950/90 border border-slate-800/90 flex flex-col justify-between gap-1.5 text-[11px] font-mono"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-amber-400 font-bold">{cmd.commandType} • {cmd.routerName}</span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                    cmd.status === 'pending'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                      : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  }`}
                >
                  {cmd.status === 'pending' ? 'EN ATTENTE PULL' : cmd.syncedAt || 'EXÉCUTÉ'}
                </span>
              </div>
              <div className="text-cyan-300 truncate text-[10px]" title={cmd.routerOsCommand}>
                {cmd.routerOsCommand}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters & Search Toolbar Original */}
      <div className="p-4 rounded-2xl glass-card border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher par nom, modèle, IP, MAC, zone ou DNS MikroTik..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/60 text-xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Zone Filter */}
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedZoneFilter}
              onChange={(e) => setSelectedZoneFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 focus:outline-none focus:border-amber-500 text-xs cursor-pointer"
            >
              <option value="all">Toutes les zones ({zones.length})</option>
              {zones.map((zone) => (
                <option key={zone.id} value={zone.id}>
                  {zone.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value as any)}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 focus:outline-none focus:border-amber-500 text-xs cursor-pointer"
            >
              <option value="all">Tous les statuts</option>
              <option value="online">🟢 En Ligne</option>
              <option value="warning">🟡 Attention / Sync</option>
              <option value="offline">🔴 Hors Ligne</option>
            </select>
          </div>
        </div>
      </div>

      {/* Routers Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {filteredRouters.map((router) => {
          const isRevealed = revealedTokens[router.id];
          const isPinging = pingingId === router.id;
          const currentPing = pingResult?.id === router.id ? pingResult.latency : null;

          return (
            <div
              key={router.id}
              className="p-5 sm:p-6 rounded-2xl glass-card border border-slate-800 hover:border-slate-700/90 transition-all duration-200 space-y-5 relative group"
            >
              {/* Header: Name, Model, Status, Version */}
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-3 h-3 rounded-full shrink-0 ${
                        router.status === 'online'
                          ? 'bg-emerald-400 shadow-md shadow-emerald-400/50'
                          : router.status === 'warning'
                          ? 'bg-amber-400 animate-pulse shadow-md shadow-amber-400/50'
                          : 'bg-rose-500'
                      }`}
                    />
                    <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors">
                      {router.name}
                    </h3>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                    <span className="font-semibold text-slate-300">
                      {router.model || 'MikroTik RouterBOARD'}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-slate-400">
                      <MapPin className="w-3 h-3 text-amber-400" />
                      {router.zoneName}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5">
                  <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-lg bg-slate-900 text-blue-300 border border-slate-800 font-bold">
                    {router.routerOsVersion}
                  </span>
                  <span
                    className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded ${
                      router.status === 'online'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}
                  >
                    {router.status === 'online' ? 'En ligne (Cloud Pull)' : 'Attention'}
                  </span>
                </div>
              </div>

              {/* Technical Identifiers Block */}
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-850 text-xs font-mono space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-[11px]">Passerelle & IP WAN :</span>
                  <span className="text-slate-300 font-medium">{router.ipAddress}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-[11px]">Adresse MAC Matérielle :</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-300">{router.macAddress}</span>
                    <button
                      onClick={() => copyToClipboard(router.macAddress, `mac-${router.id}`)}
                      className="text-slate-500 hover:text-slate-300 p-0.5 cursor-pointer"
                      title="Copier l'adresse MAC"
                    >
                      {copiedToken === `mac-${router.id}` ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>

                {router.cloudDns && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 text-[11px]">Cloud DNS MikroTik :</span>
                    <span className="text-slate-400 text-[11px] truncate max-w-[220px]">
                      {router.cloudDns}
                    </span>
                  </div>
                )}

                {/* Token Row */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-850">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Key className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-[11px]">Jeton Unique :</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-amber-400 font-bold text-[11px]">
                      {isRevealed ? router.installToken : 'JWT-••••-••••-••••'}
                    </span>
                    <button
                      onClick={() => toggleRevealToken(router.id)}
                      className="text-slate-500 hover:text-slate-300 p-1 cursor-pointer"
                      title={isRevealed ? 'Masquer' : 'Afficher'}
                    >
                      {isRevealed ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    </button>
                    <button
                      onClick={() => copyToClipboard(router.installToken, `tok-${router.id}`)}
                      className="text-amber-400 hover:text-amber-300 p-1 cursor-pointer"
                      title="Copier le jeton"
                    >
                      {copiedToken === `tok-${router.id}` ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Performance Gauges Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                {/* Uptime */}
                <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
                  <div className="flex items-center justify-center gap-1 text-[10px] text-slate-500 uppercase font-semibold">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>Uptime</span>
                  </div>
                  <span className="font-mono font-semibold text-slate-200 text-xs mt-1 block">
                    {router.uptime}
                  </span>
                </div>

                {/* CPU Usage */}
                <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
                  <div className="flex items-center justify-center gap-1 text-[10px] text-slate-500 uppercase font-semibold">
                    <Cpu className="w-3 h-3 text-slate-400" />
                    <span>CPU Usage</span>
                  </div>
                  <span
                    className={`font-mono font-bold text-xs mt-1 block ${
                      router.cpuUsage > 70
                        ? 'text-rose-400'
                        : router.cpuUsage > 40
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    {router.cpuUsage}%
                  </span>
                </div>

                {/* Live Traffic */}
                <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
                  <div className="flex items-center justify-center gap-1 text-[10px] text-slate-500 uppercase font-semibold">
                    <Activity className="w-3 h-3 text-slate-400" />
                    <span>Trafic Live</span>
                  </div>
                  <span className="font-mono font-semibold text-blue-400 text-xs mt-1 block">
                    ↓{router.trafficDownMbps}M / ↑{router.trafficUpMbps}M
                  </span>
                </div>

                {/* Active Hotspot Users */}
                <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
                  <div className="flex items-center justify-center gap-1 text-[10px] text-slate-500 uppercase font-semibold">
                    <Radio className="w-3 h-3 text-slate-400" />
                    <span>Abonnés</span>
                  </div>
                  <span className="font-mono font-black text-emerald-400 text-xs mt-1 block">
                    {router.totalSubscribers} actifs
                  </span>
                </div>
              </div>

              {/* Hardware Health Sub-Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 rounded-xl bg-slate-950/50 border border-slate-850 text-[11px] text-slate-400">
                <div className="flex items-center gap-3">
                  {router.temperature && (
                    <span className="flex items-center gap-1">
                      <Thermometer className="w-3 h-3 text-rose-400" />
                      <span>{router.temperature}°C</span>
                    </span>
                  )}
                  {router.voltage && (
                    <span className="flex items-center gap-1">
                      <Zap className="w-3 h-3 text-amber-400" />
                      <span>{router.voltage}V</span>
                    </span>
                  )}
                  {router.diskFreeMb && (
                    <span className="flex items-center gap-1">
                      <HardDrive className="w-3 h-3 text-cyan-400" />
                      <span>{router.diskFreeMb} Mo libre</span>
                    </span>
                  )}
                </div>

                <div className="text-[11px] text-slate-400">
                  Profils forfaits :{' '}
                  <span className="text-emerald-400 font-semibold">
                    {router.syncedProfilesCount || forfaits.length} synchronisés
                  </span>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-800/80 text-xs">
                <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Dernier contact :</span>
                  <span className="text-slate-300 font-mono">
                    {new Date(router.lastHeartbeat).toLocaleTimeString('fr-FR')}
                  </span>

                  {currentPing !== null && (
                    <span className="ml-2 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-mono font-bold border border-emerald-500/20 animate-fade-in">
                      Ping : {currentPing} ms OK
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Ping Button */}
                  <button
                    onClick={() => handlePing(router.id)}
                    disabled={isPinging}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 text-xs font-medium transition cursor-pointer flex items-center gap-1"
                    title="Tester la connexion RouterOS et mesurer la latence"
                  >
                    <Activity className={`w-3.5 h-3.5 text-cyan-400 ${isPinging ? 'animate-spin' : ''}`} />
                    <span>{isPinging ? 'Test...' : 'Ping'}</span>
                  </button>

                  {/* Details / Script Button */}
                  <button
                    onClick={() => setDetailsModalRouter(router)}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 text-xs font-medium transition cursor-pointer flex items-center gap-1"
                    title="Voir les informations détaillées et les commandes"
                  >
                    <Info className="w-3.5 h-3.5 text-blue-400" />
                    <span>Détails</span>
                  </button>

                  {/* Edit Button */}
                  <button
                    onClick={() => openEditModal(router)}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 text-xs font-medium transition cursor-pointer flex items-center gap-1"
                    title="Modifier le nom ou la zone du routeur"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>Éditer</span>
                  </button>

                  {/* Reboot Button */}
                  <button
                    onClick={() => setRebootModalRouter(router)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800/90 hover:bg-rose-950/70 text-slate-300 hover:text-rose-400 border border-slate-700/80 hover:border-rose-800/60 transition flex items-center gap-1.5 cursor-pointer text-xs font-medium"
                    title="Ordre de redémarrage RouterOS transmis au prochain heartbeat (45s)"
                  >
                    <Power className="w-3.5 h-3.5" />
                    <span>Reboot</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredRouters.length === 0 && (
        <div className="p-12 text-center rounded-2xl glass-card border border-slate-800 space-y-3">
          <RouterIcon className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">Aucun routeur trouvé</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Aucun équipement ne correspond à vos filtres. Essayez de réinitialiser la recherche ou installez votre premier routeur MikroTik.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedZoneFilter('all');
              setSelectedStatusFilter('all');
            }}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer"
          >
            Réinitialiser les filtres
          </button>
        </div>
      )}

      {/* Technical Architecture & RouterOS Security Banner */}
      <div className="p-6 rounded-2xl glass-card border border-slate-800 bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-slate-950 space-y-4">
        <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <h2 className="text-sm sm:text-base font-bold text-white">
            Architecture Réseau & Sécurité RouterOS Zero-Trust
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-850 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold">
              <Zap className="w-4 h-4" />
              <span>Modèle Cloud Pull Sécurisé</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Votre MikroTik contacte la console Joowifi toutes les 45 secondes en HTTPS sortant (Port 443). Aucun port entrant (Port 80 ou WinBox 8291) n'a besoin d'être exposé sur Internet.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-850 space-y-2">
            <div className="flex items-center gap-2 text-cyan-400 font-bold">
              <Globe className="w-4 h-4" />
              <span>Compatible CGNAT & 4G LTE</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Fonctionne sans IP publique fixe, derrière les modems 4G/5G, routeurs Starlink, ou accès Fibre optique partagés (Orange, Moov, MTN, Canalbox).
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-850 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Walled Garden & MAC Cookie</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Autorise nativement les passerelles de paiement (Wave, Orange Money, MTN MoMo, Moov) et conserve la session des smartphones par adresse MAC sans redemander le code.
            </p>
          </div>
        </div>
      </div>

      {/* MODAL 1: Confirm Reboot */}
      {rebootModalRouter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md p-6 rounded-2xl glass-card border border-slate-800 bg-slate-900 space-y-5 shadow-2xl">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
                <Power className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">Redémarrer le routeur ?</h3>
                <p className="text-xs text-slate-400">
                  Équipement : <strong className="text-slate-200">{rebootModalRouter.name}</strong>
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-2">
              <p>
                L'ordre de redémarrage RouterOS sera pris en compte au prochain cycle de pull asynchrone (dans les <strong>45 secondes</strong>).
              </p>
              <p className="text-[11px] text-amber-400">
                ⚠️ Les utilisateurs connectés perdront brièvement l'accès pendant les ~40 secondes du reboot matériel.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRebootModalRouter(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirmReboot}
                disabled={isRebooting}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-lg shadow-rose-600/20"
              >
                {isRebooting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Power className="w-4 h-4" />}
                <span>Confirmer le Reboot</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Router Details & Commands */}
      {detailsModalRouter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-xl p-6 rounded-2xl glass-card border border-slate-800 bg-slate-900 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <RouterIcon className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">
                  Fiche Technique & Intégration RouterOS
                </h3>
              </div>
              <button
                onClick={() => setDetailsModalRouter(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Overview Cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-850 space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Nom & Zone</span>
                  <p className="font-bold text-white">{detailsModalRouter.name}</p>
                  <p className="text-[11px] text-amber-400">{detailsModalRouter.zoneName}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-850 space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Modèle & Version</span>
                  <p className="font-bold text-white">{detailsModalRouter.model || 'MikroTik RouterBOARD'}</p>
                  <p className="text-[11px] text-blue-300 font-mono">{detailsModalRouter.routerOsVersion}</p>
                </div>
              </div>

              {/* 1-Click Terminal Command for this router */}
              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold block">
                  Commande Terminal Quick-Install (Liée à ce routeur) :
                </label>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2 font-mono text-[11px]">
                  <span className="text-cyan-300 truncate">
                    {`/tool fetch url="https://api.joowifi.app/install?token=${detailsModalRouter.installToken}" dst-path=joowifi.rsc; /import file=joowifi.rsc`}
                  </span>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        `/tool fetch url="https://api.joowifi.app/install?token=${detailsModalRouter.installToken}" dst-path=joowifi.rsc; /import file=joowifi.rsc`,
                        'details-cmd'
                      )
                    }
                    className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-sans text-xs shrink-0 cursor-pointer"
                  >
                    {copiedToken === 'details-cmd' ? 'Copié !' : 'Copier'}
                  </button>
                </div>
              </div>

              {/* Regenerate Token Action */}
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between gap-3">
                <div>
                  <span className="text-amber-400 font-bold block">Jeton d'authentification</span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {detailsModalRouter.installToken}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newToken = regenerateRouterToken(detailsModalRouter.id);
                    setDetailsModalRouter({ ...detailsModalRouter, installToken: newToken });
                  }}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Régénérer</span>
                </button>
              </div>

              {/* Network Stats */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-850 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Adresse IP :</span>
                  <span className="text-slate-200 font-mono">{detailsModalRouter.ipAddress}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Adresse MAC :</span>
                  <span className="text-slate-200 font-mono">{detailsModalRouter.macAddress}</span>
                </div>
                {detailsModalRouter.cloudDns && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">MikroTik Cloud DNS :</span>
                    <span className="text-slate-200 font-mono">{detailsModalRouter.cloudDns}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-400">Dernier Heartbeat :</span>
                  <span className="text-emerald-400 font-mono">
                    {new Date(detailsModalRouter.lastHeartbeat).toLocaleString('fr-FR')}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setDetailsModalRouter(null);
                  setDeleteModalRouter(detailsModalRouter);
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/60 text-rose-400 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Désappairer</span>
              </button>

              <button
                type="button"
                onClick={() => setDetailsModalRouter(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Edit Router */}
      {editModalRouter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <form
            onSubmit={handleSaveEdit}
            className="w-full max-w-md p-6 rounded-2xl glass-card border border-slate-800 bg-slate-900 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-amber-400" />
                <h3 className="text-base font-bold text-white">Modifier le Routeur</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditModalRouter(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Nom de l'équipement :</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Modèle matériel :</label>
                <input
                  type="text"
                  value={editModel}
                  onChange={(e) => setEditModel(e.target.value)}
                  placeholder="ex: MikroTik hEX S (RB760iGS)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Zone d'affectation :</label>
                <select
                  value={editZoneId}
                  onChange={(e) => setEditZoneId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500 text-xs cursor-pointer"
                >
                  {zones.map((z) => (
                    <option key={z.id} value={z.id}>
                      {z.name} ({z.city})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Adresse IP locale / passerelle :</label>
                <input
                  type="text"
                  value={editIp}
                  onChange={(e) => setEditIp(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500 text-xs font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setEditModalRouter(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition cursor-pointer shadow-lg shadow-amber-500/20"
              >
                Enregistrer les modifications
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 4: Delete Confirmation */}
      {deleteModalRouter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md p-6 rounded-2xl glass-card border border-slate-800 bg-slate-900 space-y-4 shadow-2xl">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">Désappairer le Routeur ?</h3>
                <p className="text-xs text-slate-400">
                  Voulez-vous supprimer <strong className="text-slate-200">{deleteModalRouter.name}</strong> de votre console ?
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Le routeur cessera d'être supervisé sur la console Joowifi. Vous pourrez le reconnecter à tout moment en réexécutant le script d'installation.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModalRouter(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition cursor-pointer shadow-lg shadow-rose-600/20"
              >
                Désappairer définitivement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
