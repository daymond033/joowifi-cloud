import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { MacBypassItem } from '../../types';
import confetti from 'canvas-confetti';
import {
  Laptop,
  Plus,
  Search,
  Copy,
  Check,
  Trash2,
  Edit3,
  Power,
  RotateCw,
  Download,
  HelpCircle,
  X,
  ShieldCheck,
  Wifi,
  Smartphone,
  Camera,
  Tv,
  Gamepad2,
  Users,
  Award,
  Calendar,
  Infinity,
  Clock,
  Sparkles,
  ArrowRight,
  ChevronDown,
  Info,
  Terminal,
  Activity,
  AlertTriangle,
  Radio,
} from 'lucide-react';

export const MacBypassManager: React.FC = () => {
  const {
    macBypasses,
    addMacBypass,
    updateMacBypass,
    deleteMacBypass,
    toggleMacBypassStatus,
    routers,
    forfaits,
    physicalHosts,
    addAuditLog,
  } = useApp();

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRouterFilter, setSelectedRouterFilter] = useState<string>('all');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MacBypassItem | null>(null);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [isHostPickerOpen, setIsHostPickerOpen] = useState(false);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<MacBypassItem | null>(null);

  // Quick feedback states
  const [copiedMac, setCopiedMac] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [testingPingId, setTestingPingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    macAddress: string;
    label: string;
    routerId: string;
    routerName: string;
    category: MacBypassItem['category'];
    forfaitId: string;
    forfaitName: string;
    bindingType: 'bypassed' | 'regular' | 'blocked';
    expiryType: 'permanent' | '24h' | '7d' | '30d' | 'custom';
    customExpiryDate: string;
    comment: string;
  }>({
    macAddress: '',
    label: '',
    routerId: 'all',
    routerName: 'Tous les routeurs (Global)',
    category: 'VIP',
    forfaitId: 'bypass-unlimited',
    forfaitName: 'Bypass Total (Débit Max)',
    bindingType: 'bypassed',
    expiryType: 'permanent',
    customExpiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    comment: '',
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr));
    }, 3200);
  };

  // Helper to test if MAC format is valid
  const isValidMac = (mac: string) => {
    const clean = mac.trim().toUpperCase();
    return /^([0-9A-F]{2}[:-]){5}([0-9A-F]{2})$/.test(clean);
  };

  // Auto-format MAC address input
  const handleMacInput = (raw: string) => {
    // Keep hex only and auto-insert colons
    const clean = raw.replace(/[^0-9A-Fa-f]/g, '').toUpperCase();
    let formatted = '';
    for (let i = 0; i < clean.length && i < 12; i++) {
      if (i > 0 && i % 2 === 0) formatted += ':';
      formatted += clean[i];
    }
    setFormData((prev) => ({ ...prev, macAddress: formatted }));
  };

  // Copy MAC handler
  const handleCopyMac = (mac: string) => {
    navigator.clipboard.writeText(mac);
    setCopiedMac(mac);
    showToast(`Adresse MAC ${mac} copiée !`);
    setTimeout(() => setCopiedMac(null), 2000);
  };

  // Open Form modal for New item
  const handleOpenNewModal = () => {
    setEditingItem(null);
    setFormData({
      macAddress: '',
      label: '',
      routerId: 'all',
      routerName: 'Tous les routeurs (Global)',
      category: 'VIP',
      forfaitId: 'bypass-unlimited',
      forfaitName: 'Bypass Total (Débit Max)',
      bindingType: 'bypassed',
      expiryType: 'permanent',
      customExpiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      comment: '',
    });
    setIsFormModalOpen(true);
  };

  // Open Form modal for Edit item
  const handleOpenEditModal = (item: MacBypassItem) => {
    setEditingItem(item);
    setFormData({
      macAddress: item.macAddress,
      label: item.label,
      routerId: item.routerId || 'all',
      routerName: item.routerName || 'Tous les routeurs (Global)',
      category: item.category,
      forfaitId: item.forfaitId || 'bypass-unlimited',
      forfaitName: item.forfaitName || 'Bypass Total (Débit Max)',
      bindingType: item.bindingType || 'bypassed',
      expiryType: item.expiryType || 'permanent',
      customExpiryDate:
        item.expiresAt && item.expiresAt !== 'Permanent'
          ? item.expiresAt
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      comment: item.comment || '',
    });
    setIsFormModalOpen(true);
  };

  // Submit form handler
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.macAddress.trim() || !formData.label.trim()) return;

    if (!isValidMac(formData.macAddress)) {
      showToast('Veuillez renseigner une adresse MAC valide au format XX:XX:XX:XX:XX:XX');
      return;
    }

    // Determine expiresAt string
    let calculatedExpiresAt = 'Permanent';
    if (formData.expiryType === '24h') {
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
      calculatedExpiresAt = tomorrow.toISOString().slice(0, 10);
    } else if (formData.expiryType === '7d') {
      const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      calculatedExpiresAt = nextWeek.toISOString().slice(0, 10);
    } else if (formData.expiryType === '30d') {
      const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      calculatedExpiresAt = nextMonth.toISOString().slice(0, 10);
    } else if (formData.expiryType === 'custom') {
      calculatedExpiresAt = formData.customExpiryDate;
    }

    // Guess vendor based on prefix
    let vendor = '';
    const cleanMac = formData.macAddress.toUpperCase();
    if (cleanMac.startsWith('F0:18') || cleanMac.startsWith('98:01') || cleanMac.startsWith('D8:BB')) {
      vendor = 'Apple Inc.';
    } else if (cleanMac.startsWith('BC:D1') || cleanMac.startsWith('48:8F')) {
      vendor = 'Samsung Electronics';
    } else if (cleanMac.startsWith('CC:46')) {
      vendor = 'Hikvision PoE';
    } else if (cleanMac.startsWith('E8:80') || cleanMac.startsWith('88:66') || cleanMac.startsWith('AC:7F')) {
      vendor = 'Transsion (Tecno/Infinix)';
    } else if (cleanMac.startsWith('5C:AA')) {
      vendor = 'Huawei Technologies';
    } else if (cleanMac.startsWith('9C:B6')) {
      vendor = 'Xiaomi Communications';
    }

    if (editingItem) {
      updateMacBypass(editingItem.id, {
        macAddress: formData.macAddress.trim().toUpperCase(),
        label: formData.label.trim(),
        routerId: formData.routerId,
        routerName: formData.routerName,
        category: formData.category,
        forfaitId: formData.forfaitId,
        forfaitName: formData.forfaitName,
        bindingType: formData.bindingType,
        expiryType: formData.expiryType,
        expiresAt: calculatedExpiresAt,
        comment: formData.comment.trim(),
      });
      showToast(`Adresse MAC ${formData.label} mise à jour !`);
    } else {
      addMacBypass({
        macAddress: formData.macAddress.trim().toUpperCase(),
        label: formData.label.trim(),
        routerId: formData.routerId,
        routerName: formData.routerName,
        category: formData.category,
        autoCookie: true,
        forfaitId: formData.forfaitId,
        forfaitName: formData.forfaitName,
        bindingType: formData.bindingType,
        expiryType: formData.expiryType,
        expiresAt: calculatedExpiresAt,
        status: formData.bindingType === 'blocked' ? 'disabled' : 'active',
        deviceVendor: vendor,
        comment: formData.comment.trim(),
      });
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
      });
      showToast(`Nouvelle adresse MAC ${formData.label} autorisée sans portail !`);
    }

    setIsFormModalOpen(false);
  };

  // Pick from recent physical hosts
  const handleSelectHost = (host: {
    macAddress: string;
    routerId?: string;
    routerName?: string;
    deviceVendor?: string;
    ipAddress?: string;
  }) => {
    setFormData((prev) => ({
      ...prev,
      macAddress: host.macAddress,
      routerId: host.routerId || prev.routerId,
      routerName: host.routerName || prev.routerName,
      label: prev.label || `${host.deviceVendor || 'Appareil'} (${host.ipAddress || 'WiFi'})`,
    }));
    setIsHostPickerOpen(false);
    showToast(`Hôte ${host.macAddress} sélectionné !`);
  };

  // Sync with RouterOS simulation
  const handleSyncWithRouters = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      showToast('Toutes les règles IP-Binding sont synchronisées avec vos routeurs RouterOS');
    }, 1200);
  };

  // Test Ping / ARP simulation
  const handleTestPing = (id: string, mac: string) => {
    setTestingPingId(id);
    setTimeout(() => {
      setTestingPingId(null);
      showToast(`Ping ARP réussi pour ${mac} : Réponse en 1.8ms (Cache MikroTik actif)`);
    }, 1000);
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['MAC', 'Libelle', 'Categorie', 'Routeur', 'Profil', 'Type_Binding', 'Statut', 'Expiration', 'Ajoute_Le'];
    const rows = macBypasses.map((m) => [
      m.macAddress,
      `"${m.label.replace(/"/g, '""')}"`,
      m.category,
      `"${(m.routerName || 'Global').replace(/"/g, '""')}"`,
      `"${(m.forfaitName || 'Bypass Total').replace(/"/g, '""')}"`,
      m.bindingType || 'bypassed',
      m.status || 'active',
      m.expiresAt || 'Permanent',
      m.addedAt,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `joowifi-mac-bypass-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Export CSV téléchargé avec succès');
  };

  // Filtered List
  const filteredBypasses = useMemo(() => {
    return macBypasses.filter((item) => {
      // Search query filter (mac, label, router, comment, vendor, forfait)
      const q = searchQuery.toLowerCase().replace(/[:-]/g, '');
      const itemMacClean = item.macAddress.toLowerCase().replace(/[:-]/g, '');
      const matchesSearch =
        !searchQuery ||
        itemMacClean.includes(q) ||
        item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.routerName && item.routerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.forfaitName && item.forfaitName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.deviceVendor && item.deviceVendor.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.comment && item.comment.toLowerCase().includes(searchQuery.toLowerCase()));

      // Router filter
      const matchesRouter =
        selectedRouterFilter === 'all' ||
        item.routerId === selectedRouterFilter ||
        (selectedRouterFilter === 'all_global' && item.routerId === 'all');

      // Category filter
      const matchesCategory = selectedCategoryFilter === 'all' || item.category === selectedCategoryFilter;

      // Status filter
      const matchesStatus =
        selectedStatusFilter === 'all' ||
        (selectedStatusFilter === 'active' && item.status !== 'disabled') ||
        (selectedStatusFilter === 'disabled' && item.status === 'disabled') ||
        (selectedStatusFilter === 'permanent' && item.expiresAt === 'Permanent');

      return matchesSearch && matchesRouter && matchesCategory && matchesStatus;
    });
  }, [macBypasses, searchQuery, selectedRouterFilter, selectedCategoryFilter, selectedStatusFilter]);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = macBypasses.length;
    const active = macBypasses.filter((m) => m.status !== 'disabled').length;
    const permanent = macBypasses.filter((m) => m.expiresAt === 'Permanent' || m.expiryType === 'permanent').length;
    const bypassedType = macBypasses.filter((m) => m.bindingType !== 'blocked').length;
    return { total, active, permanent, bypassedType };
  }, [macBypasses]);

  // Category Icon & Color helper
  const getCategoryBadge = (category: MacBypassItem['category']) => {
    switch (category) {
      case 'VIP':
        return {
          icon: Award,
          className: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
        };
      case 'Staff':
        return {
          icon: Users,
          className: 'bg-blue-500/15 text-blue-400 border border-blue-500/30',
        };
      case 'Camera / IoT':
        return {
          icon: Camera,
          className: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
        };
      case 'Console / TV':
        return {
          icon: Tv,
          className: 'bg-purple-500/15 text-purple-400 border border-purple-500/30',
        };
      case 'Habitué':
        return {
          icon: Smartphone,
          className: 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30',
        };
      case 'Partenaire':
        return {
          icon: Sparkles,
          className: 'bg-rose-500/15 text-rose-400 border border-rose-500/30',
        };
      default:
        return {
          icon: Laptop,
          className: 'bg-slate-800 text-slate-300 border border-slate-700',
        };
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-slate-900 border border-amber-500/40 text-white shadow-2xl shadow-amber-500/10 text-xs font-semibold animate-bounce">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. En-tête de page & Action Principale */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl glass-card border border-slate-800/90 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="space-y-1.5 z-10">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              HOTSPOT MIKROTIK • IP BINDING
            </span>
            <span className="text-slate-500 text-xs font-mono">/dashboard/mac-bypass</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-400 flex items-center justify-center border border-amber-500/30 shadow-inner">
              <Laptop className="w-5 h-5 stroke-[2.2]" />
            </div>
            <span>Adresses MAC</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
            Les appareils inscrits ici se connectent sans saisir de code : téléphones d'habitués, caméras, consoles.
          </p>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center flex-wrap gap-2.5 z-10">
          <button
            onClick={() => setIsGuideModalOpen(true)}
            className="px-3.5 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-2 border border-slate-700/80 transition cursor-pointer shadow-sm"
            title="Guide technique RouterOS"
          >
            <HelpCircle className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Guide MikroTik</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-2 border border-slate-700/80 transition cursor-pointer shadow-sm"
            title="Exporter en fichier CSV"
          >
            <Download className="w-4 h-4 text-slate-400" />
            <span className="hidden sm:inline">Exporter (.csv)</span>
          </button>

          <button
            onClick={handleOpenNewModal}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer shadow-lg shadow-amber-500/20 active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ Ajouter une adresse MAC</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl glass-card border border-slate-800/90 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Appareils Inscrits</span>
            <div className="text-xl sm:text-2xl font-black text-white">{stats.total}</div>
            <span className="text-[10px] text-slate-500 block">Sur l'ensemble du parc</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
            <Laptop className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl glass-card border border-slate-800/90 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Actifs & Autorisés</span>
            <div className="text-xl sm:text-2xl font-black text-emerald-400">{stats.active}</div>
            <span className="text-[10px] text-emerald-500/80 font-medium block">
              {stats.total - stats.active > 0 ? `${stats.total - stats.active} désactivé(s)` : '100% opérationnels'}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl glass-card border border-slate-800/90 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Exemption Portail</span>
            <div className="text-xl sm:text-2xl font-black text-amber-400">{stats.bypassedType}</div>
            <span className="text-[10px] text-slate-500 block">Type: bypassed (RouterOS)</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
            <Radio className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl glass-card border border-slate-800/90 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Validité Permanente</span>
            <div className="text-xl sm:text-2xl font-black text-white flex items-center gap-1.5">
              <span>{stats.permanent}</span>
              <Infinity className="w-4 h-4 text-slate-400" />
            </div>
            <span className="text-[10px] text-slate-500 block">Sans expiration de date</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
            <Calendar className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 2. Barre d'Outils & Recherche Rapide */}
      <div className="p-4 rounded-2xl glass-card border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Champ de recherche arrondi avec icône loupe */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par MAC, client, routeur..."
            className="w-full pl-10 pr-9 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-amber-500 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filtres déroulants et contrôles */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Router filter */}
          <select
            value={selectedRouterFilter}
            onChange={(e) => setSelectedRouterFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            <option value="all">Tous les routeurs</option>
            <option value="all_global">Global uniquement</option>
            {routers.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>

          {/* Category filter */}
          <select
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            <option value="all">Toutes catégories</option>
            <option value="VIP">VIP</option>
            <option value="Staff">Staff</option>
            <option value="Camera / IoT">Caméra / IoT</option>
            <option value="Habitué">Habitué</option>
            <option value="Console / TV">Console / TV</option>
            <option value="Partenaire">Partenaire</option>
          </select>

          {/* Status filter */}
          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            <option value="all">Tous statuts</option>
            <option value="active">Actifs</option>
            <option value="disabled">Désactivés</option>
            <option value="permanent">Permanents</option>
          </select>

          {/* Synchronize button */}
          <button
            onClick={handleSyncWithRouters}
            disabled={isSyncing}
            className="p-2 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 hover:text-amber-400 transition cursor-pointer"
            title="Synchroniser avec RouterOS"
          >
            <RotateCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-amber-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* 3. État Vide (Empty State) OU Tableau de Données */}
      {filteredBypasses.length === 0 ? (
        /* Carte centrale d'état vide stylisée avec icône laptop en conteneur sombre */
        <div className="py-16 px-6 rounded-3xl glass-card border border-slate-800/80 text-center flex flex-col items-center justify-center space-y-4">
          <div className="w-20 h-20 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center text-amber-500 shadow-xl relative group">
            <div className="absolute inset-0 bg-amber-500/10 rounded-3xl blur-xl" />
            <Laptop className="w-10 h-10 relative stroke-[1.8] group-hover:scale-110 transition-transform" />
          </div>

          <div className="space-y-1.5 max-w-md">
            <h3 className="text-lg font-bold text-white">
              {searchQuery ? 'Aucun résultat correspondant' : 'Aucune adresse MAC enregistrée'}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {searchQuery
                ? `Aucun appareil ne correspond à votre filtre "${searchQuery}". Essayez un autre mot-clé ou réinitialisez la recherche.`
                : "Aucun appareil n'est encore inscrit. Le bouton ci-dessus permet d'en ajouter."}
            </p>
          </div>

          <div className="pt-2 flex items-center gap-3">
            {searchQuery ? (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedRouterFilter('all');
                  setSelectedCategoryFilter('all');
                  setSelectedStatusFilter('all');
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition cursor-pointer"
              >
                Réinitialiser les filtres
              </button>
            ) : (
              <button
                onClick={handleOpenNewModal}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition cursor-pointer shadow-lg shadow-amber-500/20"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>+ Ajouter une adresse MAC</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Tableau & Cartes de Données */
        <div className="space-y-4">
          {/* Subheader summary */}
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <div>
              <span className="font-bold text-white">{filteredBypasses.length}</span>{' '}
              {filteredBypasses.length === 1 ? 'appareil trouvé' : 'appareils trouvés'}
            </div>
            <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Règles /ip hotspot ip-binding actives</span>
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-hidden rounded-2xl glass-card border border-slate-800/90 shadow-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="py-3.5 px-4">Appareil & Client</th>
                  <th className="py-3.5 px-4">Adresse MAC</th>
                  <th className="py-3.5 px-4">Routeur Assigné</th>
                  <th className="py-3.5 px-4">Profil & Débit</th>
                  <th className="py-3.5 px-4">Validité</th>
                  <th className="py-3.5 px-4">Statut RouterOS</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredBypasses.map((item) => {
                  const categoryBadge = getCategoryBadge(item.category);
                  const CategoryIcon = categoryBadge.icon;
                  const isSuspended = item.status === 'disabled';

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-900/40 transition-colors ${
                        isSuspended ? 'opacity-60 bg-slate-950/40' : ''
                      }`}
                    >
                      {/* Appareil & Client */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${categoryBadge.className}`}
                          >
                            <CategoryIcon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-bold text-white flex items-center gap-2">
                              <span>{item.label}</span>
                              <span
                                className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md uppercase ${categoryBadge.className}`}
                              >
                                {item.category}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                              {item.deviceVendor && <span className="font-medium text-slate-300">{item.deviceVendor}</span>}
                              {item.lastSeen && <span>• {item.lastSeen}</span>}
                            </div>
                            {item.comment && (
                              <div className="text-[10px] text-slate-500 italic mt-0.5 line-clamp-1">{item.comment}</div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Adresse MAC */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-amber-400 tracking-wider bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
                            {item.macAddress}
                          </span>
                          <button
                            onClick={() => handleCopyMac(item.macAddress)}
                            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
                            title="Copier l'adresse MAC"
                          >
                            {copiedMac === item.macAddress ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Routeur */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <Wifi className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span className="font-medium">{item.routerName || 'Tous les routeurs'}</span>
                        </div>
                      </td>

                      {/* Profil & Forfait */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-medium text-slate-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                          {item.forfaitName || 'Bypass Total'}
                        </span>
                      </td>

                      {/* Validité */}
                      <td className="py-3.5 px-4">
                        {item.expiresAt === 'Permanent' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                            <Infinity className="w-3.5 h-3.5" />
                            <span>Permanent</span>
                          </span>
                        ) : (
                          <div className="space-y-0.5">
                            <span className="text-[11px] font-medium text-slate-300 flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-slate-500" />
                              <span>{item.expiresAt}</span>
                            </span>
                            <span className="text-[9px] text-amber-400 block font-semibold">Expirable</span>
                          </div>
                        )}
                      </td>

                      {/* Statut RouterOS */}
                      <td className="py-3.5 px-4">
                        {isSuspended ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-bold uppercase">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                            Blocked (Désactivé)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold uppercase">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Bypassed (Actif)
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Toggle Active */}
                          <button
                            onClick={() => toggleMacBypassStatus(item.id)}
                            className={`p-1.5 rounded-lg border transition cursor-pointer ${
                              isSuspended
                                ? 'bg-slate-900 border-slate-800 text-slate-500 hover:text-emerald-400 hover:border-emerald-500/40'
                                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/20'
                            }`}
                            title={isSuspended ? 'Réactiver le bypass' : 'Désactiver (bloquer) temporairement'}
                          >
                            <Power className="w-3.5 h-3.5" />
                          </button>

                          {/* Ping ARP Test */}
                          <button
                            onClick={() => handleTestPing(item.id, item.macAddress)}
                            disabled={testingPingId === item.id}
                            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-amber-400 transition cursor-pointer"
                            title="Tester la connectivité ARP"
                          >
                            <Activity
                              className={`w-3.5 h-3.5 ${testingPingId === item.id ? 'animate-spin text-amber-400' : ''}`}
                            />
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => handleOpenEditModal(item)}
                            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
                            title="Modifier les paramètres"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => setDeleteConfirmItem(item)}
                            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-500/40 transition cursor-pointer"
                            title="Supprimer du bypass"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card Grid View */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:hidden gap-3.5">
            {filteredBypasses.map((item) => {
              const categoryBadge = getCategoryBadge(item.category);
              const CategoryIcon = categoryBadge.icon;
              const isSuspended = item.status === 'disabled';

              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-2xl glass-card border border-slate-800 space-y-3.5 flex flex-col justify-between ${
                    isSuspended ? 'opacity-65' : ''
                  }`}
                >
                  <div className="space-y-2.5">
                    {/* Header card */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${categoryBadge.className}`}
                        >
                          <CategoryIcon className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-xs leading-snug">{item.label}</h4>
                          <span className="text-[10px] text-slate-400">
                            {item.deviceVendor || item.category}
                          </span>
                        </div>
                      </div>

                      {/* Status */}
                      {isSuspended ? (
                        <span className="px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[9px] font-bold">
                          Bloqué
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-bold flex items-center gap-1">
                          <span className="w-1 h-1 rounded-full bg-emerald-400" />
                          Bypassed
                        </span>
                      )}
                    </div>

                    {/* MAC display */}
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-amber-400 tracking-wider">
                        {item.macAddress}
                      </span>
                      <button
                        onClick={() => handleCopyMac(item.macAddress)}
                        className="text-slate-400 hover:text-white transition p-1"
                      >
                        {copiedMac === item.macAddress ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    {/* Details row */}
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="text-slate-400">
                        <span className="block text-[9px] uppercase text-slate-500">Routeur :</span>
                        <span className="font-medium text-slate-200 line-clamp-1">
                          {item.routerName || 'Global'}
                        </span>
                      </div>
                      <div className="text-slate-400">
                        <span className="block text-[9px] uppercase text-slate-500">Profil :</span>
                        <span className="font-medium text-slate-200 line-clamp-1">
                          {item.forfaitName || 'Bypass Total'}
                        </span>
                      </div>
                    </div>

                    {item.comment && (
                      <p className="text-[10px] text-slate-400 bg-slate-900/60 p-2 rounded-lg border border-slate-850">
                        {item.comment}
                      </p>
                    )}
                  </div>

                  {/* Footer actions */}
                  <div className="pt-2.5 border-t border-slate-800 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 text-[10px]">
                      {item.expiresAt === 'Permanent' ? '∞ Permanent' : `Exp: ${item.expiresAt}`}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => toggleMacBypassStatus(item.id)}
                        className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                        title="Bascule état"
                      >
                        <Power className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenEditModal(item)}
                        className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                        title="Modifier"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmItem(item)}
                        className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-rose-400 border border-slate-800"
                        title="Supprimer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          4. FENÊTRE MODALE COMPLÈTE D'AJOUT / ÉDITION D'ADRESSE MAC
         ========================================================================= */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
          <div className="w-full max-w-xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl text-slate-100 overflow-hidden my-auto animate-scaleUp">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-400 flex items-center justify-center border border-amber-500/30">
                  <Laptop className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    {editingItem ? "Modifier l'adresse MAC" : 'Ajouter une adresse MAC'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Cet appareil accèdera au réseau sans passer par le portail de connexion.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleFormSubmit} className="p-5 sm:p-6 space-y-4 text-xs">
              {/* 1. Routeur Cible */}
              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold flex items-center justify-between">
                  <span>1. Routeur cible *</span>
                  <span className="text-[10px] text-slate-500 font-normal">Où appliquer la règle IP-Binding</span>
                </label>
                <select
                  value={formData.routerId}
                  onChange={(e) => {
                    const selectedId = e.target.value;
                    const found = routers.find((r) => r.id === selectedId);
                    setFormData((prev) => ({
                      ...prev,
                      routerId: selectedId,
                      routerName: found ? found.name : 'Tous les routeurs (Global)',
                    }));
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500 text-xs cursor-pointer"
                >
                  <option value="all">Tous les routeurs (Global - Itinérance multi-sites)</option>
                  {routers.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.zoneName || 'Zone Défaut'})
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. Adresse MAC avec Validation & Bouton Détection Hôte */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-slate-300 font-semibold">2. Adresse MAC de l'appareil *</label>
                  <button
                    type="button"
                    onClick={() => setIsHostPickerOpen(true)}
                    className="text-[11px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer transition"
                  >
                    <Radio className="w-3.5 h-3.5" />
                    <span>Détecter parmi les hôtes récents</span>
                  </button>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    required
                    maxLength={17}
                    placeholder="Ex: AA:BB:CC:DD:EE:FF"
                    value={formData.macAddress}
                    onChange={(e) => handleMacInput(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border font-mono tracking-wider uppercase text-white focus:outline-none text-xs ${
                      isValidMac(formData.macAddress)
                        ? 'border-emerald-500/80 text-emerald-300'
                        : formData.macAddress.length > 0
                        ? 'border-amber-500/60'
                        : 'border-slate-800 focus:border-amber-500'
                    }`}
                  />
                  {formData.macAddress && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] font-semibold">
                      {isValidMac(formData.macAddress) ? (
                        <span className="text-emerald-400 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Valide
                        </span>
                      ) : (
                        <span className="text-amber-400">Format XX:XX...</span>
                      )}
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-slate-500 block">
                  Identifiant matériel unique de la carte réseau ou puce Wi-Fi (12 caractères hexadécimaux).
                </span>
              </div>

              {/* 3. Nom / Propriétaire de l'appareil */}
              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold">3. Nom / Propriétaire de l'appareil *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: iPhone 16 Pro Directeur, Caméra Entrée, Smart TV Salon"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500 text-xs"
                />
              </div>

              {/* 4. Catégorie d'appareil (Visual Cards) */}
              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold">4. Catégorie d'appareil</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'VIP', label: 'VIP (Gérant)', icon: Award },
                    { id: 'Staff', label: 'Staff Vendeur', icon: Users },
                    { id: 'Camera / IoT', label: 'Caméra / IoT', icon: Camera },
                    { id: 'Habitué', label: 'Client Habitué', icon: Smartphone },
                    { id: 'Console / TV', label: 'Console / TV', icon: Tv },
                    { id: 'Partenaire', label: 'Partenaire', icon: Sparkles },
                  ].map((cat) => {
                    const CatIcon = cat.icon;
                    const isSelected = formData.category === cat.id;
                    return (
                      <button
                        type="button"
                        key={cat.id}
                        onClick={() => setFormData({ ...formData, category: cat.id as any })}
                        className={`p-2.5 rounded-xl border flex items-center gap-2 text-left cursor-pointer transition ${
                          isSelected
                            ? 'bg-amber-500/15 border-amber-500 text-amber-300'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white'
                        }`}
                      >
                        <CatIcon className="w-3.5 h-3.5 shrink-0" />
                        <span className="font-semibold text-[11px] truncate">{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 5. Forfait / Débit MikroTik & 6. Durée de validité */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-slate-300 font-semibold">5. Profil Hotspot / Débit</label>
                  <select
                    value={formData.forfaitId}
                    onChange={(e) => {
                      const selId = e.target.value;
                      if (selId === 'bypass-unlimited') {
                        setFormData((prev) => ({
                          ...prev,
                          forfaitId: 'bypass-unlimited',
                          forfaitName: 'Bypass Total (Débit Max)',
                        }));
                      } else {
                        const found = forfaits.find((f) => f.id === selId);
                        setFormData((prev) => ({
                          ...prev,
                          forfaitId: selId,
                          forfaitName: found ? found.name : 'Profil Spécifique',
                        }));
                      }
                    }}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500 text-xs cursor-pointer"
                  >
                    <option value="bypass-unlimited">Bypass Total (Débit max / Sans restriction)</option>
                    {forfaits.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name} ({f.downloadSpeedMbps || 5}M/{f.uploadSpeedMbps || 2}M)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-300 font-semibold">6. Durée de validité</label>
                  <select
                    value={formData.expiryType}
                    onChange={(e) => setFormData({ ...formData, expiryType: e.target.value as any })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500 text-xs cursor-pointer"
                  >
                    <option value="permanent">Permanent (Sans limite de temps)</option>
                    <option value="24h">24 heures</option>
                    <option value="7d">7 jours</option>
                    <option value="30d">30 jours (Mensuel)</option>
                    <option value="custom">Date personnalisée...</option>
                  </select>
                </div>
              </div>

              {formData.expiryType === 'custom' && (
                <div className="space-y-1.5 p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <label className="text-slate-400 text-[11px]">Date d'expiration spécifique :</label>
                  <input
                    type="date"
                    value={formData.customExpiryDate}
                    onChange={(e) => setFormData({ ...formData, customExpiryDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              )}

              {/* 7. RouterOS Binding Type & Remarque */}
              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold flex items-center justify-between">
                  <span>7. Type de binding MikroTik</span>
                  <span className="text-[10px] text-amber-400 font-mono">/ip hotspot ip-binding</span>
                </label>
                <div className="grid grid-cols-3 gap-2 text-center">
                  {[
                    { id: 'bypassed', label: 'Bypassed', sub: 'Sans portail captif', color: 'border-emerald-500/80 text-emerald-300 bg-emerald-500/10' },
                    { id: 'regular', label: 'Regular', sub: 'Exige un ticket', color: 'border-blue-500/80 text-blue-300 bg-blue-500/10' },
                    { id: 'blocked', label: 'Blocked', sub: 'Accès refusé', color: 'border-rose-500/80 text-rose-300 bg-rose-500/10' },
                  ].map((mode) => (
                    <button
                      type="button"
                      key={mode.id}
                      onClick={() => setFormData({ ...formData, bindingType: mode.id as any })}
                      className={`p-2 rounded-xl border text-left cursor-pointer transition ${
                        formData.bindingType === mode.id
                          ? mode.color
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className="font-bold text-xs">{mode.label}</div>
                      <div className="text-[9px] text-slate-400">{mode.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Note / Remarque interne */}
              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold">Remarque / Note interne (optionnel)</label>
                <input
                  type="text"
                  placeholder="Ex: Paiement cash 15 000 FCFA reçu pour le mois, caméra couloir"
                  value={formData.comment}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500 text-xs"
                />
              </div>

              {/* Buttons Bottom */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs font-bold transition cursor-pointer shadow-lg shadow-amber-500/20 active:scale-95 flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>{editingItem ? 'Enregistrer les modifications' : "Enregistrer l'adresse MAC"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODALE TIROIR: DÉTECTER PARMI LES HÔTES RÉCENTS
         ========================================================================= */}
      {isHostPickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 text-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-amber-400 animate-pulse" />
                <h3 className="text-base font-bold text-white">Appareils Détectés sur le Réseau</h3>
              </div>
              <button onClick={() => setIsHostPickerOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Cliquez sur un appareil récemment vu par vos routeurs MikroTik pour pré-remplir automatiquement son adresse MAC et son routeur :
            </p>

            <div className="max-h-72 overflow-y-auto space-y-2 pr-1 divide-y divide-slate-800/40">
              {physicalHosts.map((host) => (
                <div
                  key={host.id}
                  onClick={() => handleSelectHost(host)}
                  className="p-3 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-amber-500/50 cursor-pointer transition flex items-center justify-between gap-3 group"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-amber-400">{host.macAddress}</span>
                      <span className="text-[10px] text-slate-400">
                        {host.deviceVendor || 'Périphérique WiFi'}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2">
                      <span>IP : {host.ipAddress}</span>
                      <span>• Signal : {host.signalDbm} dBm</span>
                      <span>• Routeur : {host.routerName}</span>
                    </div>
                  </div>

                  <button className="px-3 py-1 rounded-lg bg-amber-500/10 group-hover:bg-amber-500 group-hover:text-slate-950 text-amber-400 text-[11px] font-bold transition">
                    Sélectionner
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setIsHostPickerOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODALE PÉDAGOGIQUE: GUIDE MIKROTIK IP-BINDING
         ========================================================================= */}
      {isGuideModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 text-slate-100 space-y-5 my-auto animate-scaleUp">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-400 flex items-center justify-center border border-amber-500/30">
                  <Terminal className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Comment fonctionne le MAC Bypass RouterOS ?</h3>
                  <p className="text-xs text-slate-400">Règles MikroTik `/ip hotspot ip-binding` et sécurité réseau</p>
                </div>
              </div>
              <button onClick={() => setIsGuideModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-emerald-500/30 space-y-1.5">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold">
                    <Check className="w-4 h-4" />
                    <span>Mode Bypassed</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    L'appareil accède à Internet directement sans passer par la page captive et sans consommer de voucher. Idéal pour vos caméras IP, terminaux POS et VIPs.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950 border border-blue-500/30 space-y-1.5">
                  <div className="flex items-center gap-2 text-blue-400 font-bold">
                    <Info className="w-4 h-4" />
                    <span>Mode Regular</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    L'adresse IP et MAC sont liées de manière statique, mais l'utilisateur doit obligatoirement saisir son code de connexion habituel.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950 border border-rose-500/30 space-y-1.5">
                  <div className="flex items-center gap-2 text-rose-400 font-bold">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Mode Blocked</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    L'appareil est complètement interdit d'accès au réseau hotspot, protégeant ainsi votre installation contre les abus ou voisins indésirables.
                  </p>
                </div>
              </div>

              {/* Console command preview */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-mono text-amber-400">Commande CLI générée sur MikroTik :</span>
                  <span className="text-[10px] text-slate-500">Exécutée automatiquement via Joowifi Cloud</span>
                </div>
                <pre className="font-mono text-[11px] text-slate-200 bg-slate-900/80 p-3 rounded-xl overflow-x-auto border border-slate-850">
                  /ip hotspot ip-binding add mac-address=BC:D1:D3:55:A1:09 type=bypassed comment="Directeur - Bypass Joowifi"
                </pre>
              </div>

              {/* Good practices */}
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-slate-300 space-y-1">
                <span className="font-bold text-amber-400 text-xs flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Recommandation pour les smartphones récents
                </span>
                <p className="text-[11px] text-slate-300">
                  Sur les iPhones (iOS 14+) et appareils Android récents, désactivez « Adresse MAC privée » dans les réglages Wi-Fi du réseau pour que l'adresse MAC reste fixe et reconnue en permanence.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setIsGuideModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer"
              >
                J'ai compris
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODALE DE CONFIRMATION DE SUPPRESSION
         ========================================================================= */}
      {deleteConfirmItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 text-slate-100 space-y-4 animate-scaleUp">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/15 text-rose-400 flex items-center justify-center border border-rose-500/30">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">Retirer le MAC Bypass ?</h3>
              <p className="text-xs text-slate-400">
                L'appareil <span className="font-bold text-white">"{deleteConfirmItem.label}"</span> (
                <span className="font-mono text-amber-400">{deleteConfirmItem.macAddress}</span>) devra à nouveau saisir
                un ticket de connexion pour accéder à Internet.
              </p>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmItem(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold cursor-pointer"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  deleteMacBypass(deleteConfirmItem.id);
                  showToast(`Adresse MAC ${deleteConfirmItem.label} retirée`);
                  setDeleteConfirmItem(null);
                }}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition cursor-pointer shadow-lg shadow-rose-600/20"
              >
                Confirmer la suppression
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
