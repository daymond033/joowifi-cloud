import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { ZoneItem, RouterItem } from '../../types';
import confetti from 'canvas-confetti';
import {
  MapPin,
  Plus,
  Router as RouterIcon,
  Ticket,
  TrendingUp,
  X,
  Layers,
  Network,
  Wallet,
  CalendarClock,
  Users,
  BarChart3,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  HelpCircle,
  Info,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  Lock,
  Settings,
  Radio,
  Search,
  Filter,
  CreditCard,
  Smartphone,
  Store,
  Building2,
  Home,
  GraduationCap,
  Percent,
  Check,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Sliders,
} from 'lucide-react';

export const ZonesManager: React.FC = () => {
  const {
    zones,
    routers,
    formatMoney,
    walletBalance,
    rechargeWallet,
    addZone,
    updateZone,
    deleteZone,
    purchaseZonePack,
    setAdminTab,
  } = useApp();

  // Navigation tab state
  const [activeTab, setActiveTab] = useState<'zones' | 'packs' | 'guide'>('zones');

  // Search & Filter state for zones list
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [rechargeModalOpen, setRechargeModalOpen] = useState(false);
  const [packModalOpen, setPackModalOpen] = useState<null | {
    id: string;
    name: string;
    count: number;
    price: number;
    discount?: string;
  }>(null);

  // Selected zone for editing / details
  const [selectedZone, setSelectedZone] = useState<ZoneItem | null>(null);

  // Success toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Create form state
  const [formData, setFormData] = useState({
    name: '',
    city: 'Abidjan',
    country: "Côte d'Ivoire",
    siteType: 'residentiel',
    description: '',
    initialRouterId: '',
  });

  // Edit form state
  const [editFormData, setEditFormData] = useState({
    name: '',
    city: '',
    country: '',
    siteType: '',
    description: '',
    status: 'active' as 'active' | 'sleeping',
  });

  // Recharge modal form state
  const [rechargeAmount, setRechargeAmount] = useState<number>(10000);
  const [rechargeMethod, setRechargeMethod] = useState<'Wave' | 'Orange Money' | 'MTN MoMo' | 'Moov Money'>('Wave');
  const [rechargePhone, setRechargePhone] = useState('0707123456');

  // Pack checkout payment method
  const [packPaymentMethod, setPackPaymentMethod] = useState<'wallet' | 'mobile_money'>('wallet');

  // FAQ open/close accordion state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Total slots calculation (base plan allows 5 zones, plus purchased ones)
  const maxCapacity = 6;
  const activeCount = zones.filter((z) => (z.status || 'active') === 'active').length;
  const slotsRemaining = Math.max(0, maxCapacity - zones.length);

  // Aggregated totals across all zones
  const totalSubscribers = useMemo(() => {
    return zones.reduce((acc, z) => {
      const zoneRouters = routers.filter((r) => r.zoneId === z.id);
      const sub = zoneRouters.reduce((s, r) => s + r.totalSubscribers, 0);
      return acc + (sub || z.activeSubscribers || 0);
    }, 0);
  }, [zones, routers]);

  const totalMonthlyRev = useMemo(() => {
    return zones.reduce((acc, z) => acc + (z.monthlyRevenue || 0), 0);
  }, [zones]);

  // Filtered zones list
  const filteredZones = useMemo(() => {
    return zones.filter((zone) => {
      const matchesSearch =
        zone.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        zone.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (zone.description || '').toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = filterType === 'all' || zone.siteType === filterType;
      const zoneStatus = zone.status || 'active';
      const matchesStatus = filterStatus === 'all' || zoneStatus === filterStatus;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [zones, searchQuery, filterType, filterStatus]);

  // Available routers not yet strongly bound or available for selection
  const availableRouters = useMemo(() => {
    return routers;
  }, [routers]);

  // Site type badges helper
  const getSiteTypeBadge = (type?: string) => {
    switch (type) {
      case 'commerce':
        return { label: 'Commerce / Kiosque', icon: Store, bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
      case 'campus':
        return { label: 'Bureaux & Campus', icon: GraduationCap, bg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' };
      case 'hotel':
        return { label: 'Hôtel / Maquis', icon: Building2, bg: 'bg-purple-500/10 text-purple-400 border-purple-500/20' };
      case 'evenement':
        return { label: 'Événement Temporaire', icon: Sparkles, bg: 'bg-pink-500/10 text-pink-400 border-pink-500/20' };
      case 'residentiel':
      default:
        return { label: 'Quartier / Résidentiel', icon: Home, bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
    }
  };

  // Handle open create zone
  const handleOpenCreateModal = () => {
    setFormData({
      name: '',
      city: 'Abidjan',
      country: "Côte d'Ivoire",
      siteType: 'residentiel',
      description: '',
      initialRouterId: '',
    });
    setCreateModalOpen(true);
  };

  // Handle submit create zone
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    addZone({
      name: formData.name.trim(),
      city: formData.city.trim(),
      country: formData.country.trim(),
      description: formData.description.trim(),
      siteType: formData.siteType,
      initialRouterId: formData.initialRouterId || undefined,
    });

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
    });

    setCreateModalOpen(false);
    showToast(`Zone "${formData.name}" créée et activée avec succès !`);
  };

  // Handle open edit zone
  const handleOpenEdit = (zone: ZoneItem) => {
    setSelectedZone(zone);
    setEditFormData({
      name: zone.name,
      city: zone.city,
      country: zone.country,
      siteType: zone.siteType || 'residentiel',
      description: zone.description || '',
      status: (zone.status || 'active') as 'active' | 'sleeping',
    });
    setEditModalOpen(true);
  };

  // Handle submit edit zone
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedZone) return;

    updateZone({
      ...selectedZone,
      name: editFormData.name,
      city: editFormData.city,
      country: editFormData.country,
      siteType: editFormData.siteType,
      description: editFormData.description,
      status: editFormData.status,
    });

    setEditModalOpen(false);
    showToast(`Zone "${editFormData.name}" mise à jour.`);
  };

  // Handle delete/archive zone
  const handleDeleteZone = (zoneId: string, zoneName: string) => {
    deleteZone(zoneId);
    setEditModalOpen(false);
    showToast(`Zone "${zoneName}" supprimée.`);
  };

  // Handle submit recharge
  const handleRechargeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rechargeAmount < 1000) {
      showToast('Le montant minimum de recharge est de 1 000 FCFA');
      return;
    }
    rechargeWallet(rechargeAmount, rechargeMethod);
    setRechargeModalOpen(false);
    confetti({ particleCount: 40, spread: 50 });
    showToast(`Portefeuille rechargé de ${formatMoney(rechargeAmount)} via ${rechargeMethod} !`);
  };

  // Handle pack purchase
  const handleConfirmPackPurchase = () => {
    if (!packModalOpen) return;

    if (packPaymentMethod === 'wallet') {
      const ok = purchaseZonePack(packModalOpen.name, packModalOpen.count, packModalOpen.price);
      if (ok) {
        confetti({ particleCount: 70, spread: 70 });
        showToast(`Pack "${packModalOpen.name}" activé avec succès ! +${packModalOpen.count} zones disponibles.`);
        setPackModalOpen(null);
      }
    } else {
      // Mobile money simulation
      rechargeWallet(packModalOpen.price, 'Wave');
      purchaseZonePack(packModalOpen.name, packModalOpen.count, packModalOpen.price);
      confetti({ particleCount: 70, spread: 70 });
      showToast(`Paiement Mobile Money validé ! Pack "${packModalOpen.name}" activé.`);
      setPackModalOpen(null);
    }
  };

  // FAQ questions list
  const FAQ_ITEMS = [
    {
      q: 'Combien de routeurs MikroTik puis-je ajouter dans une seule zone ?',
      a: 'Autant que nécessaire ! Vous pouvez associer 1 seul routeur (ex. petit kiosque ou maquis) ou mailler plus de 10 routeurs MikroTik (ex. grand campus ou quartier étendu). Tous les routeurs d’une même zone partagent le même catalogue de forfaits et reconnaissent les mêmes tickets d’accès.',
    },
    {
      q: 'Comment fonctionne le prélèvement mensuel de 5 000 FCFA par zone ?',
      a: 'Chaque zone est facturée 5 000 FCFA/mois (ou selon le tarif remisé de votre pack multi-zones). Le montant est automatiquement prélevé sur le solde de votre portefeuille Joowifi Pay à sa date d’échéance mensuelle. Aucun compte bancaire ni carte bancaire n’est requis : rechargez simplement votre portefeuille par Wave ou Orange Money.',
    },
    {
      q: 'Puis-je déplacer un routeur d’une zone vers une autre ?',
      a: 'Oui, à tout instant depuis la section "Routeurs" de votre tableau de bord. Il suffit de réassigner la zone dans les paramètres du routeur. Le routeur bascule automatiquement vers les forfaits et le portail captif de sa nouvelle zone sans nécessiter de reconfiguration MikroTik.',
    },
    {
      q: 'Que se passe-t-il si mon portefeuille est à court de solde au renouvellement ?',
      a: 'Vous bénéficiez d’un délai de grâce de 3 jours calendaires avec notifications préventives par WhatsApp et SMS. Si le solde n’est pas régularisé, la zone est mise en sommeil : les utilisateurs connectés terminent leur session normalement, mais aucune nouvelle vente ou connexion n’est autorisée jusqu’à la recharge.',
    },
    {
      q: 'Les tickets vendus dans une zone fonctionnent-ils dans une autre zone ?',
      a: 'Par défaut, non : l’étanchéité stricte garantit qu’un ticket vendu dans la zone "Yopougon" ne peut pas être consommé dans la zone "Cocody", évitant toute confusion comptable entre vendeurs. Cependant, vous pouvez activer l’option "Roaming inter-zones" si vous gérez plusieurs points de vente d’une même marque.',
    },
  ];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-emerald-950/90 border border-emerald-500/50 text-emerald-200 text-xs font-medium shadow-2xl backdrop-blur-md animate-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. HEADER SECTION & GLOBAL ACTIONS */}
      <div className="p-6 rounded-3xl glass-card border border-slate-800 relative overflow-hidden bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-slate-950/90">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] font-semibold tracking-wide uppercase mb-2.5">
              <Network className="w-3.5 h-3.5 text-amber-400" />
              <span>Multi-Sites & Cloisonnement Réseau</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <span className="p-2.5 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-400 inline-flex shadow-inner">
                <MapPin className="w-6 h-6" />
              </span>
              <span>Mes zones</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-2xl leading-relaxed">
              Une zone = un réseau WiFi indépendant (quartier, site, hôtel...). Chaque zone dispose de ses propres
              routeurs MikroTik, forfaits, codes vouchers et caisses vendeurs en cloisonnement étanche.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => setRechargeModalOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700 hover:border-slate-600 text-xs font-bold flex items-center gap-2 transition cursor-pointer shadow-md"
            >
              <Wallet className="w-4 h-4 text-emerald-400" />
              <span>Recharger Portefeuille</span>
            </button>

            <button
              onClick={handleOpenCreateModal}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-extrabold text-xs flex items-center gap-2 transition cursor-pointer shadow-lg shadow-amber-500/20 active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Ouvrir une zone</span>
            </button>
          </div>
        </div>

        {/* 3 GLOBAL SUMMARY KPI CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-800/80">
          {/* KPI 1: Zones ouvertes */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700/80 transition flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Zones Ouvertes</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {activeCount} active{activeCount > 1 ? 's' : ''}
                </span>
              </div>
              <div className="text-2xl font-black text-white mt-1 font-mono tracking-tight">
                {zones.length} <span className="text-sm font-medium text-slate-500">/ {maxCapacity} zones</span>
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                {slotsRemaining > 0
                  ? `Capacité : ${slotsRemaining} emplacement(s) libre(s)`
                  : 'Capacité maximale atteinte'}
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
              <Layers className="w-6 h-6" />
            </div>
          </div>

          {/* KPI 2: Abonnements actifs */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700/80 transition flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Abonnements Actifs</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  5 000 F / mois
                </span>
              </div>
              <div className="text-2xl font-black text-white mt-1 font-mono tracking-tight">
                {activeCount} <span className="text-sm font-medium text-slate-500">site{activeCount > 1 ? 's' : ''}</span>
              </div>
              <span className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 font-medium">
                <CalendarClock className="w-3.5 h-3.5" />
                <span>Renouvellement le 08/11/2026</span>
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
          </div>

          {/* KPI 3: Solde portefeuille */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700/80 transition flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Portefeuille Joowifi</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Prélèvement auto
                </span>
              </div>
              <div className="text-2xl font-black text-emerald-400 mt-1 font-mono tracking-tight">
                {formatMoney(walletBalance)}
              </div>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-[11px] text-slate-400">
                  Couvre ~{Math.floor(walletBalance / 5000)} mois de zone
                </span>
                <button
                  onClick={() => setRechargeModalOpen(true)}
                  className="text-[11px] font-bold text-amber-400 hover:text-amber-300 underline underline-offset-2 cursor-pointer"
                >
                  + Recharger
                </button>
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <Wallet className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* 2. NAVIGATION TABS BAR */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
        <button
          onClick={() => setActiveTab('zones')}
          className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'zones'
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Vos zones</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
              activeTab === 'zones' ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-slate-300'
            }`}
          >
            {zones.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('packs')}
          className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'packs'
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Ajouter des zones</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
              activeTab === 'packs'
                ? 'bg-slate-950/20 text-slate-950'
                : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
            }`}
          >
            Tarifs & packs
          </span>
        </button>

        <button
          onClick={() => setActiveTab('guide')}
          className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'guide'
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Comment ça marche ?</span>
        </button>
      </div>

      {/* 3. TAB CONTENT 1: VOS ZONES */}
      {activeTab === 'zones' && (
        <div className="space-y-6">
          {/* Secondary search and filters */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl glass-card border border-slate-800">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Rechercher une zone, ville, description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 text-xs focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs text-slate-300 w-full sm:w-auto">
                <Filter className="w-3.5 h-3.5 text-slate-500" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="bg-transparent text-slate-300 text-xs focus:outline-none cursor-pointer"
                >
                  <option value="all">Tous les types</option>
                  <option value="residentiel">Quartier / Résidentiel</option>
                  <option value="commerce">Commerce / Kiosque</option>
                  <option value="campus">Bureaux & Campus</option>
                  <option value="hotel">Hôtel / Maquis</option>
                  <option value="evenement">Événement</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs text-slate-300 shrink-0">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-transparent text-slate-300 text-xs focus:outline-none cursor-pointer"
                >
                  <option value="all">Tous statuts</option>
                  <option value="active">Actives</option>
                  <option value="sleeping">En sommeil</option>
                </select>
              </div>
            </div>
          </div>

          {/* Zones cards grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {filteredZones.map((zone) => {
              const zoneRouters = routers.filter((r) => r.zoneId === zone.id);
              const onlineRouters = zoneRouters.filter((r) => r.status === 'online');
              const activeSubscribers = zoneRouters.reduce((acc, r) => acc + r.totalSubscribers, 0);
              const badgeInfo = getSiteTypeBadge(zone.siteType);
              const BadgeIcon = badgeInfo.icon;
              const isSleeping = zone.status === 'sleeping';

              return (
                <div
                  key={zone.id}
                  className={`p-6 rounded-3xl glass-card border transition relative flex flex-col justify-between overflow-hidden group ${
                    isSleeping
                      ? 'border-slate-800 bg-slate-900/40 opacity-75'
                      : 'border-slate-800 hover:border-slate-700 bg-slate-900/60 hover:bg-slate-900/80'
                  }`}
                >
                  <div>
                    {/* Card Top: Badges and Title */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                              isSleeping
                                ? 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isSleeping ? 'bg-amber-400' : 'bg-emerald-400 animate-pulse'
                              }`}
                            />
                            <span>{isSleeping ? 'En sommeil' : 'Active'}</span>
                          </span>

                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${badgeInfo.bg}`}
                          >
                            <BadgeIcon className="w-3 h-3" />
                            <span>{badgeInfo.label}</span>
                          </span>
                        </div>

                        <h3 className="text-lg font-extrabold text-white group-hover:text-amber-300 transition">
                          {zone.name}
                        </h3>

                        <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span>
                            {zone.city}, {zone.country}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleOpenEdit(zone)}
                        title="Paramètres de la zone"
                        className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer shrink-0 border border-slate-700/60"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Zone description */}
                    {zone.description && (
                      <p className="text-xs text-slate-300 bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80 mt-4 leading-relaxed">
                        {zone.description}
                      </p>
                    )}

                    {/* 4 Detailed metrics grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-2xl bg-slate-950/80 border border-slate-800 mt-4 text-center">
                      <div className="p-2 rounded-xl bg-slate-900/50">
                        <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider flex items-center justify-center gap-1">
                          <RouterIcon className="w-3 h-3 text-blue-400" />
                          <span>Routeurs</span>
                        </span>
                        <span className="font-mono font-bold text-sm text-white mt-1 block">
                          {onlineRouters.length}/{zoneRouters.length}{' '}
                          <span className="text-[10px] font-normal text-slate-400">en ligne</span>
                        </span>
                      </div>

                      <div className="p-2 rounded-xl bg-slate-900/50">
                        <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider flex items-center justify-center gap-1">
                          <Users className="w-3 h-3 text-emerald-400" />
                          <span>Abonnés Live</span>
                        </span>
                        <span className="font-mono font-bold text-sm text-emerald-400 mt-1 block">
                          {activeSubscribers || zone.activeSubscribers || 0}
                        </span>
                      </div>

                      <div className="p-2 rounded-xl bg-slate-900/50">
                        <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider flex items-center justify-center gap-1">
                          <TrendingUp className="w-3 h-3 text-amber-400" />
                          <span>Ventes Jour</span>
                        </span>
                        <span className="font-mono font-bold text-sm text-amber-400 mt-1 block">
                          {formatMoney(zone.todaySales || 12500)}
                        </span>
                      </div>

                      <div className="p-2 rounded-xl bg-slate-900/50">
                        <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider flex items-center justify-center gap-1">
                          <BarChart3 className="w-3 h-3 text-purple-400" />
                          <span>CA Mensuel</span>
                        </span>
                        <span className="font-mono font-bold text-sm text-purple-300 mt-1 block">
                          {formatMoney(zone.monthlyRevenue)}
                        </span>
                      </div>
                    </div>

                    {/* Subscription status strip */}
                    <div className="mt-3 px-3 py-2.5 rounded-xl bg-slate-950/40 border border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                      <div className="flex items-center gap-2">
                        <CalendarClock className="w-3.5 h-3.5 text-slate-500" />
                        <span>Abonnement zone actif jusqu'au {zone.subscriptionExpiry || '08/11/2026'}</span>
                      </div>
                      <span className="font-mono text-emerald-400 font-bold">5 000 FCFA/mois</span>
                    </div>

                    {/* Associated routers list */}
                    <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-400">
                      <span className="text-slate-500 shrink-0 font-medium">Routeurs :</span>
                      {zoneRouters.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {zoneRouters.map((r) => (
                            <span
                              key={r.id}
                              className={`px-2 py-0.5 rounded-md font-mono text-[10px] border flex items-center gap-1 ${
                                r.status === 'online'
                                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                                  : 'bg-rose-500/10 text-rose-300 border-rose-500/20'
                              }`}
                            >
                              <span
                                className={`w-1 h-1 rounded-full ${
                                  r.status === 'online' ? 'bg-emerald-400' : 'bg-rose-400'
                                }`}
                              />
                              {r.name.split(' - ')[1] || r.name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-500 italic">Aucun routeur associé</span>
                      )}
                    </div>
                  </div>

                  {/* Actions bar */}
                  <div className="mt-5 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setAdminTab('forfaits')}
                        className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
                      >
                        <Ticket className="w-3.5 h-3.5 text-amber-400" />
                        <span>Gérer forfaits</span>
                      </button>

                      <button
                        onClick={() => setAdminTab('mikrotik')}
                        className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
                      >
                        <RouterIcon className="w-3.5 h-3.5 text-blue-400" />
                        <span>Voir routeurs</span>
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        showToast(`Zone "${zone.name}" activée comme zone principale.`);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
                    >
                      <Radio className="w-3.5 h-3.5" />
                      <span>Bascule vers cette zone</span>
                    </button>
                  </div>
                </div>
              );
            })}

            {/* DASHED INCENTIVE CARD: EMPLACEMENT DISPONIBLE */}
            {slotsRemaining > 0 && (
              <div
                onClick={handleOpenCreateModal}
                className="p-6 rounded-3xl border-2 border-dashed border-slate-700/80 hover:border-amber-500/60 bg-slate-900/30 hover:bg-slate-900/50 transition cursor-pointer flex flex-col items-center justify-center text-center group min-h-[340px]"
              >
                <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition shadow-inner">
                  <Plus className="w-8 h-8 stroke-[2.5]" />
                </div>

                <h3 className="text-base font-bold text-white mt-4 group-hover:text-amber-300 transition">
                  Zone disponible prête à être ouverte
                </h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm">
                  Votre formule actuelle autorise encore l'ouverture de{' '}
                  <span className="text-amber-400 font-bold">{slotsRemaining} zone(s) supplémentaire(s)</span> sans
                  frais d'extension d'infrastructure.
                </p>

                <div className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-extrabold group-hover:bg-amber-400 transition shadow-md shadow-amber-500/20">
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Configurer une zone</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. TAB CONTENT 2: AJOUTER DES ZONES (PACKS & FORMULES) */}
      {activeTab === 'packs' && (
        <div className="space-y-6">
          {/* Wallet Balance Banner */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-amber-950/30 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
                <Wallet className="w-7 h-7" />
              </div>
              <div>
                <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">
                  Solde Portefeuille Joowifi Pay
                </span>
                <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono tracking-tight">
                  {formatMoney(walletBalance)}
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Les abonnements de zones sont renouvelés automatiquement chaque mois depuis ce solde. Aucun
                  engagement, suspension libre sur demande.
                </p>
              </div>
            </div>

            <button
              onClick={() => setRechargeModalOpen(true)}
              className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center gap-2 transition cursor-pointer shadow-lg shadow-emerald-600/20 shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Recharger mon portefeuille</span>
            </button>
          </div>

          {/* Pricing Packs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Pack 1 Zone */}
            <div className="p-6 rounded-3xl glass-card border border-slate-800 hover:border-slate-700 bg-slate-900/70 flex flex-col justify-between transition group">
              <div>
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                    Solo
                  </span>
                </div>

                <h3 className="text-lg font-extrabold text-white mt-3">Pack 1 Zone</h3>
                <p className="text-xs text-slate-400 mt-1 min-h-[36px]">
                  Idéal pour débuter un second site ou tester un nouvel établissement.
                </p>

                <div className="mt-4 pt-4 border-t border-slate-800">
                  <div className="text-2xl font-black text-white font-mono">
                    5 000 <span className="text-xs text-slate-400 font-medium font-sans">FCFA / mois</span>
                  </div>
                  <span className="text-[11px] text-slate-500 block mt-0.5">Tarif standard sans engagement</span>
                </div>

                <ul className="mt-5 space-y-2.5 text-xs text-slate-300">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>1 zone géographique indépendante</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Routeurs MikroTik illimités</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Caisse POS & vendeurs dédiés</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Portail captif personnalisé</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() =>
                  setPackModalOpen({
                    id: 'pack-1',
                    name: 'Pack 1 Zone',
                    count: 1,
                    price: 5000,
                  })
                }
                className="mt-6 w-full py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition cursor-pointer border border-slate-700"
              >
                Activer ce pack
              </button>
            </div>

            {/* Pack 3 Zones - POPULAR */}
            <div className="p-6 rounded-3xl glass-card border-2 border-amber-500/60 bg-gradient-to-b from-amber-500/10 via-slate-900/90 to-slate-900 flex flex-col justify-between transition shadow-xl shadow-amber-500/10 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-[10px] font-extrabold uppercase tracking-wide shadow-md">
                ⭐ Le plus populaire
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    -10% d'économie
                  </span>
                </div>

                <h3 className="text-lg font-extrabold text-white mt-3">Pack 3 Zones</h3>
                <p className="text-xs text-slate-400 mt-1 min-h-[36px]">
                  Déploiement multi-quartiers pour gestionnaire en croissance.
                </p>

                <div className="mt-4 pt-4 border-t border-slate-800">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-amber-400 font-mono">13 500</span>
                    <span className="text-xs text-slate-400 font-medium">FCFA / mois</span>
                    <span className="text-xs text-slate-500 line-through font-mono">15 000 F</span>
                  </div>
                  <span className="text-[11px] text-amber-300 font-medium block mt-0.5">
                    Soit 4 500 FCFA / zone / mois
                  </span>
                </div>

                <ul className="mt-5 space-y-2.5 text-xs text-slate-300">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>3 zones géographiques indépendantes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Comptabilité & caisses isolées</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Rapports consolidés multi-sites</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Tunnel VPN WireGuard prioritaire</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() =>
                  setPackModalOpen({
                    id: 'pack-3',
                    name: 'Pack 3 Zones',
                    count: 3,
                    price: 13500,
                    discount: '-10%',
                  })
                }
                className="mt-6 w-full py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold text-xs transition cursor-pointer shadow-md shadow-amber-500/20"
              >
                Commander ce pack
              </button>
            </div>

            {/* Pack 5 Zones */}
            <div className="p-6 rounded-3xl glass-card border border-slate-800 hover:border-slate-700 bg-slate-900/70 flex flex-col justify-between transition group">
              <div>
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    🔥 Meilleure valeur
                  </span>
                </div>

                <h3 className="text-lg font-extrabold text-white mt-3">Pack 5 Zones</h3>
                <p className="text-xs text-slate-400 mt-1 min-h-[36px]">
                  Idéal pour couvrir toute une commune avec plusieurs superviseurs.
                </p>

                <div className="mt-4 pt-4 border-t border-slate-800">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-white font-mono">20 000</span>
                    <span className="text-xs text-slate-400 font-medium">FCFA / mois</span>
                    <span className="text-xs text-slate-500 line-through font-mono">25 000 F</span>
                  </div>
                  <span className="text-[11px] text-purple-300 font-medium block mt-0.5">
                    Soit 4 000 FCFA / zone (-20%)
                  </span>
                </div>

                <ul className="mt-5 space-y-2.5 text-xs text-slate-300">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>5 zones géographiques indépendantes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Gestion des rôles & superviseurs</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Alertes WhatsApp en direct par site</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Support technique prioritaire</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() =>
                  setPackModalOpen({
                    id: 'pack-5',
                    name: 'Pack 5 Zones',
                    count: 5,
                    price: 20000,
                    discount: '-20%',
                  })
                }
                className="mt-6 w-full py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition cursor-pointer border border-slate-700"
              >
                Activer ce pack
              </button>
            </div>

            {/* Pack 10 Zones */}
            <div className="p-6 rounded-3xl glass-card border border-slate-800 hover:border-slate-700 bg-slate-900/70 flex flex-col justify-between transition group">
              <div>
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    👑 Opérateur Réseau
                  </span>
                </div>

                <h3 className="text-lg font-extrabold text-white mt-3">Pack 10 Zones</h3>
                <p className="text-xs text-slate-400 mt-1 min-h-[36px]">
                  Flotte étendue multi-villes pour WISP et intégrateurs réseau.
                </p>

                <div className="mt-4 pt-4 border-t border-slate-800">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-white font-mono">35 000</span>
                    <span className="text-xs text-slate-400 font-medium">FCFA / mois</span>
                    <span className="text-xs text-slate-500 line-through font-mono">50 000 F</span>
                  </div>
                  <span className="text-[11px] text-blue-300 font-medium block mt-0.5">
                    Soit 3 500 FCFA / zone (-30%)
                  </span>
                </div>

                <ul className="mt-5 space-y-2.5 text-xs text-slate-300">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>10 zones géographiques indépendantes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Accès API webhooks complet</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Archivage illimité des logs de sessions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Account Manager Joowifi dédié WhatsApp</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() =>
                  setPackModalOpen({
                    id: 'pack-10',
                    name: 'Pack 10 Zones',
                    count: 10,
                    price: 35000,
                    discount: '-30%',
                  })
                }
                className="mt-6 w-full py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition cursor-pointer border border-slate-700"
              >
                Activer ce pack
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. TAB CONTENT 3: COMMENT ÇA MARCHE ? (GUIDE & FAQ) */}
      {activeTab === 'guide' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* 4 Steps Process */}
          <div>
            <div className="text-center max-w-xl mx-auto mb-8">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                Architecture Pédagogique
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                Comment fonctionne le multi-sites Joowifi ?
              </h2>
              <p className="text-xs text-slate-400 mt-2">
                Déployez et pilotez plusieurs quartiers ou établissements depuis une seule console avec étanchéité
                comptable totale.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Step 1 */}
              <div className="p-5 rounded-3xl glass-card border border-slate-800 bg-slate-900/60 relative flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 font-black text-sm flex items-center justify-center font-mono">
                    01
                  </div>
                  <h3 className="text-sm font-bold text-white mt-4">Ouvrez une zone</h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    Attribuez un nom géographique à votre site (quartier, commune, hôtel...) et activez sa mensualité
                    (5 000 FCFA/mois) déduite de votre solde.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-amber-400 font-medium flex items-center gap-1">
                  <span>Configuration instantanée</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-5 rounded-3xl glass-card border border-slate-800 bg-slate-900/60 relative flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 font-black text-sm flex items-center justify-center font-mono">
                    02
                  </div>
                  <h3 className="text-sm font-bold text-white mt-4">Associez vos routeurs</h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    Rattachez 1 ou plusieurs MikroTik à cette zone. Le script WireGuard/VPN Joowifi synchronise les
                    adresses MAC et règles Firewall automatiquement.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-blue-400 font-medium flex items-center gap-1">
                  <span>Pull Model 45 secondes</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>

              {/* Step 3 */}
              <div className="p-5 rounded-3xl glass-card border border-slate-800 bg-slate-900/60 relative flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-black text-sm flex items-center justify-center font-mono">
                    03
                  </div>
                  <h3 className="text-sm font-bold text-white mt-4">Forfaits & Vendeurs</h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    Ajustez les tarifs selon le pouvoir d’achat du quartier (ex. 200F 24h, 500F 1 sem.) et confiez des
                    caisses POS 1-Tap à vos revendeurs locaux.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                  <span>Cloisonnement des gains</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>

              {/* Step 4 */}
              <div className="p-5 rounded-3xl glass-card border border-slate-800 bg-slate-900/60 relative flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 font-black text-sm flex items-center justify-center font-mono">
                    04
                  </div>
                  <h3 className="text-sm font-bold text-white mt-4">Performances Isolées</h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    Suivez le chiffre d’affaires, les tickets consommés et le trafic bande passante zone par zone ou
                    consolidez vos revenus globaux.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-purple-400 font-medium flex items-center gap-1">
                  <span>Tableau de bord unifié</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            </div>
          </div>

          {/* Comparative Table: Cloisonné vs Partagé */}
          <div className="p-6 rounded-3xl glass-card border border-slate-800 bg-slate-900/50">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  Ce qui est cloisonné par zone vs Ce qui est partagé
                </h3>
                <p className="text-xs text-slate-400">
                  L'assurance d'une étanchéité stricte pour gérer des partenaires et franchises en toute sérénité.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              {/* Column 1: Cloisonné */}
              <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
                  <Lock className="w-4 h-4" />
                  <span>Cloisonné par zone (Étanchéité stricte)</span>
                </div>
                <ul className="space-y-2 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span><strong>Routeurs MikroTik physiques :</strong> assignés spécifiquement à leur site</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span><strong>Forfaits & Tarifs WiFi :</strong> prix et débits Mbps adaptés au quartier</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span><strong>Codes vouchers & tickets :</strong> valables uniquement sur les APs de la zone</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span><strong>Vendeurs POS & commissions :</strong> comptes caisses indépendants</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span><strong>Portail Captif :</strong> logo et texte d’accueil personnalisés par site</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span><strong>Chiffre d’affaires :</strong> comptabilité et exportations CSV séparées</span>
                  </li>
                </ul>
              </div>

              {/* Column 2: Partagé */}
              <div className="p-5 rounded-2xl bg-blue-500/5 border border-blue-500/20 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider">
                  <Layers className="w-4 h-4" />
                  <span>Partagé au niveau de votre compte Joowifi</span>
                </div>
                <ul className="space-y-2 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span><strong>Portefeuille Joowifi Pay :</strong> solde unique pour tous les abonnements</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span><strong>Accès Superviseurs & Admins :</strong> vue d’ensemble consolidée</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span><strong>Clé d’API & Webhooks :</strong> intégration tierce centralisée</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span><strong>Factures & Reçus fiscaux :</strong> émis au nom de votre entreprise</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span><strong>Bibliothèque de Templates :</strong> thèmes réutilisables d’une zone à l’autre</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Accordion FAQ */}
          <div className="p-6 rounded-3xl glass-card border border-slate-800 bg-slate-900/50">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-amber-400" />
              <span>Questions Fréquentes (FAQ Multi-Sites)</span>
            </h3>

            <div className="space-y-3">
              {FAQ_ITEMS.map((item, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div
                    key={idx}
                    className="rounded-2xl border border-slate-800 bg-slate-950/60 overflow-hidden transition"
                  >
                    <button
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      className="w-full p-4 text-left flex items-center justify-between gap-4 text-xs font-bold text-white hover:text-amber-300 transition cursor-pointer"
                    >
                      <span>{item.q}</span>
                      <span className="p-1 rounded-lg bg-slate-900 text-slate-400 shrink-0">
                        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </span>
                    </button>

                    {isOpen && (
                      <div className="px-4 pb-4 text-xs text-slate-300 leading-relaxed border-t border-slate-800/60 pt-3">
                        {item.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 6. MODAL: OUVRIR UNE ZONE */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-700/80 p-6 shadow-2xl text-slate-100 space-y-5 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Ouvrir une nouvelle zone</h3>
                  <p className="text-[11px] text-slate-400">
                    Activez un réseau WiFi étanche pour un quartier ou établissement
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Nom de la Zone *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Marcory - Boulevard de Marseille"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Ville *</label>
                  <input
                    type="text"
                    required
                    placeholder="Abidjan, Bouaké..."
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Pays *</label>
                  <input
                    type="text"
                    required
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Type d'emplacement</label>
                <select
                  value={formData.siteType}
                  onChange={(e) => setFormData({ ...formData, siteType: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500 text-xs cursor-pointer"
                >
                  <option value="residentiel">Quartier / Résidentiel</option>
                  <option value="commerce">Commerce / Kiosque / Marché</option>
                  <option value="hotel">Hôtel / Restaurant / Maquis</option>
                  <option value="campus">Campus / Établissement / Bureaux</option>
                  <option value="evenement">Événement temporaire</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Associer un premier routeur (optionnel)</label>
                <select
                  value={formData.initialRouterId}
                  onChange={(e) => setFormData({ ...formData, initialRouterId: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500 text-xs cursor-pointer"
                >
                  <option value="">-- Assigner un routeur plus tard --</option>
                  {availableRouters.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.ipAddress.split(' ')[0]})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Description ou notes</label>
                <textarea
                  rows={2}
                  placeholder="Quartier commercial, carrefour animé, maquis partenaires..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500 text-xs resize-none"
                />
              </div>

              {/* Billing summary card */}
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-amber-300">
                  <span>Abonnement zone :</span>
                  <span>5 000 FCFA / mois</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Solde portefeuille actuel :</span>
                  <span className="font-mono text-emerald-400 font-bold">{formatMoney(walletBalance)}</span>
                </div>
                <p className="text-[10px] text-slate-400 pt-1 border-t border-amber-500/20">
                  Le premier mois sera activé immédiatement. Le renouvellement mensuel est automatique depuis Joowifi
                  Pay.
                </p>
              </div>

              {/* Form buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold text-xs transition cursor-pointer shadow-lg shadow-amber-500/20"
                >
                  Confirmer & Ouvrir la zone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. MODAL: MODIFIER LA ZONE */}
      {editModalOpen && selectedZone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-700/80 p-6 shadow-2xl text-slate-100 space-y-5 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-400">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Paramètres de la zone</h3>
                  <p className="text-[11px] text-slate-400">{selectedZone.name}</p>
                </div>
              </div>
              <button
                onClick={() => setEditModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Nom de la Zone *</label>
                <input
                  type="text"
                  required
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Ville *</label>
                  <input
                    type="text"
                    required
                    value={editFormData.city}
                    onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Pays *</label>
                  <input
                    type="text"
                    required
                    value={editFormData.country}
                    onChange={(e) => setEditFormData({ ...editFormData, country: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Type d'emplacement</label>
                  <select
                    value={editFormData.siteType}
                    onChange={(e) => setEditFormData({ ...editFormData, siteType: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500 text-xs cursor-pointer"
                  >
                    <option value="residentiel">Quartier / Résidentiel</option>
                    <option value="commerce">Commerce / Kiosque</option>
                    <option value="hotel">Hôtel / Maquis</option>
                    <option value="campus">Campus / Bureaux</option>
                    <option value="evenement">Événement temporaire</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Statut opérationnel</label>
                  <select
                    value={editFormData.status}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, status: e.target.value as 'active' | 'sleeping' })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500 text-xs cursor-pointer"
                  >
                    <option value="active">🟢 Active (En service)</option>
                    <option value="sleeping">💤 En sommeil (Désactivée)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Description</label>
                <textarea
                  rows={2}
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500 text-xs resize-none"
                />
              </div>

              {/* Form buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => handleDeleteZone(selectedZone.id, selectedZone.name)}
                  className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-bold transition cursor-pointer"
                >
                  Supprimer la zone
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs transition cursor-pointer shadow-md shadow-amber-500/20"
                  >
                    Enregistrer les modifications
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. MODAL: RECHARGE DU PORTEFEUILLE */}
      {rechargeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-700/80 p-6 shadow-2xl text-slate-100 space-y-5 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Recharger Joowifi Pay</h3>
                  <p className="text-[11px] text-slate-400">
                    Solde actuel : <span className="text-emerald-400 font-bold">{formatMoney(walletBalance)}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setRechargeModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRechargeSubmit} className="space-y-4 text-xs">
              {/* Quick amounts */}
              <div>
                <label className="text-slate-300 font-semibold block mb-2">Choisir un montant (FCFA)</label>
                <div className="grid grid-cols-4 gap-2">
                  {[5000, 10000, 20000, 50000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setRechargeAmount(amt)}
                      className={`py-2 rounded-xl text-xs font-bold font-mono transition cursor-pointer border ${
                        rechargeAmount === amt
                          ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                          : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {amt.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom input */}
              <div className="space-y-1">
                <label className="text-slate-400 text-[11px]">Ou saisir un montant libre</label>
                <div className="relative">
                  <input
                    type="number"
                    min={1000}
                    step={500}
                    value={rechargeAmount}
                    onChange={(e) => setRechargeAmount(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono font-bold text-sm focus:outline-none focus:border-amber-500"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">
                    FCFA
                  </span>
                </div>
              </div>

              {/* Provider selection */}
              <div>
                <label className="text-slate-300 font-semibold block mb-2">Moyen de paiement Mobile Money</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRechargeMethod('Wave')}
                    className={`p-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 border cursor-pointer ${
                      rechargeMethod === 'Wave'
                        ? 'bg-sky-500/20 text-sky-300 border-sky-400'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <Smartphone className="w-4 h-4 text-sky-400 shrink-0" />
                    <span>Wave (0% frais)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRechargeMethod('Orange Money')}
                    className={`p-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 border cursor-pointer ${
                      rechargeMethod === 'Orange Money'
                        ? 'bg-orange-500/20 text-orange-300 border-orange-400'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <Smartphone className="w-4 h-4 text-orange-400 shrink-0" />
                    <span>Orange Money</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRechargeMethod('MTN MoMo')}
                    className={`p-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 border cursor-pointer ${
                      rechargeMethod === 'MTN MoMo'
                        ? 'bg-yellow-500/20 text-yellow-300 border-yellow-400'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <Smartphone className="w-4 h-4 text-yellow-400 shrink-0" />
                    <span>MTN MoMo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRechargeMethod('Moov Money')}
                    className={`p-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 border cursor-pointer ${
                      rechargeMethod === 'Moov Money'
                        ? 'bg-blue-500/20 text-blue-300 border-blue-400'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <Smartphone className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>Moov Money</span>
                  </button>
                </div>
              </div>

              {/* Phone number */}
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Numéro de téléphone payeur</label>
                <input
                  type="tel"
                  required
                  value={rechargePhone}
                  onChange={(e) => setRechargePhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs transition cursor-pointer shadow-lg shadow-emerald-600/30 active:scale-95 mt-2"
              >
                Payer {formatMoney(rechargeAmount)} & Créditer
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 9. MODAL: CONFIRMATION D'ACHAT DE PACK DE ZONES */}
      {packModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-700/80 p-6 shadow-2xl text-slate-100 space-y-5 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Confirmer la souscription</h3>
                  <p className="text-[11px] text-slate-400">{packModalOpen.name}</p>
                </div>
              </div>
              <button
                onClick={() => setPackModalOpen(null)}
                className="p-1.5 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Pack details summary */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Pack sélectionné :</span>
                <span className="font-bold text-white">{packModalOpen.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Emplacements ajoutés :</span>
                <span className="font-bold text-amber-400">+{packModalOpen.count} zone(s)</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-sm">
                <span className="font-bold text-white">Montant mensuel :</span>
                <span className="font-mono font-black text-emerald-400">{formatMoney(packModalOpen.price)}</span>
              </div>
            </div>

            {/* Payment Method toggle */}
            <div className="space-y-2 text-xs">
              <label className="text-slate-300 font-semibold block">Mode de règlement</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPackPaymentMethod('wallet')}
                  className={`p-3 rounded-2xl text-left border transition cursor-pointer ${
                    packPaymentMethod === 'wallet'
                      ? 'bg-amber-500/10 border-amber-500 text-amber-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span className="font-bold block">Joowifi Pay</span>
                  <span className="text-[10px] text-slate-500">Solde: {formatMoney(walletBalance)}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPackPaymentMethod('mobile_money')}
                  className={`p-3 rounded-2xl text-left border transition cursor-pointer ${
                    packPaymentMethod === 'mobile_money'
                      ? 'bg-sky-500/10 border-sky-500 text-sky-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span className="font-bold block">Mobile Money</span>
                  <span className="text-[10px] text-slate-500">Wave / Orange direct</span>
                </button>
              </div>
            </div>

            {/* Warning if insufficient balance in wallet */}
            {packPaymentMethod === 'wallet' && walletBalance < packModalOpen.price && (
              <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>Solde portefeuille insuffisant. Rebranchez par Mobile Money ou rechargez d’abord.</span>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setPackModalOpen(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirmPackPurchase}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold text-xs transition cursor-pointer shadow-lg shadow-amber-500/20"
              >
                Valider la commande
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
