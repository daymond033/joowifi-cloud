import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { ForfaitItem, Currency } from '../../types';
import {
  Wifi,
  Zap,
  Clock,
  Gauge,
  Sparkles,
  Users,
  Tag,
  Package,
  Edit2,
  Trash2,
  Plus,
  X,
  Check,
  Shield,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

export const ForfaitsManager: React.FC = () => {
  const {
    forfaits,
    addForfait,
    updateForfait,
    deleteForfait,
    formatMoney,
    currency,
    setCurrency,
  } = useApp();

  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingForfait, setEditingForfait] = useState<ForfaitItem | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [currencyModalOpen, setCurrencyModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formValidityValue, setFormValidityValue] = useState<number>(24);
  const [formValidityUnit, setFormValidityUnit] = useState<'hours' | 'days' | 'weeks' | 'months'>('hours');
  const [formPrice, setFormPrice] = useState<number>(200);
  const [formDownloadSpeed, setFormDownloadSpeed] = useState<number>(2);
  const [formUploadSpeed, setFormUploadSpeed] = useState<number>(1);
  const [formDataLimit, setFormDataLimit] = useState<string>('');
  const [formSimultaneousDevices, setFormSimultaneousDevices] = useState<number>(1);
  const [formMacLock, setFormMacLock] = useState<boolean>(false);

  // Trigger temporary notification
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // KPI Computations
  const forfaitsCount = forfaits.length;

  const minPrice = useMemo(() => {
    if (forfaits.length === 0) return 0;
    return Math.min(...forfaits.map((f) => f.price));
  }, [forfaits]);

  const maxPrice = useMemo(() => {
    if (forfaits.length === 0) return 0;
    return Math.max(...forfaits.map((f) => f.price));
  }, [forfaits]);

  const maxDownload = useMemo(() => {
    if (forfaits.length === 0) return 0;
    return Math.max(...forfaits.map((f) => f.downloadSpeedMbps));
  }, [forfaits]);

  // Convert duration to human-readable format like in the screenshots:
  // e.g. "168h (7j)", "24h (1j)", "1h", "72h (3j)", "720h (30j)"
  const formatDurationDisplay = (hours: number): string => {
    if (hours >= 24 && hours % 24 === 0) {
      const days = hours / 24;
      return `${hours}h (${days}j)`;
    }
    return `${hours}h`;
  };

  // Convert form validity value & unit to total hours
  const calculateTotalHours = (value: number, unit: 'hours' | 'days' | 'weeks' | 'months'): number => {
    const val = Math.max(1, value);
    switch (unit) {
      case 'hours':
        return val;
      case 'days':
        return val * 24;
      case 'weeks':
        return val * 168;
      case 'months':
        return val * 720;
      default:
        return val;
    }
  };

  // Open "Créer un Nouveau Forfait"
  const openCreateModal = () => {
    setEditingForfait(null);
    setFormName('Pass 24 Heures Express');
    setFormValidityValue(24);
    setFormValidityUnit('hours');
    setFormPrice(200);
    setFormDownloadSpeed(2);
    setFormUploadSpeed(1);
    setFormDataLimit('');
    setFormSimultaneousDevices(1);
    setFormMacLock(false);
    setModalOpen(true);
  };

  // Open "Modifier le Forfait"
  const openEditModal = (f: ForfaitItem) => {
    setEditingForfait(f);
    setFormName(f.name);

    // Deduce unit and value from total hours
    if (f.durationHours >= 720 && f.durationHours % 720 === 0) {
      setFormValidityValue(f.durationHours / 720);
      setFormValidityUnit('months');
    } else if (f.durationHours >= 168 && f.durationHours % 168 === 0) {
      setFormValidityValue(f.durationHours / 168);
      setFormValidityUnit('weeks');
    } else if (f.durationHours >= 24 && f.durationHours % 24 === 0) {
      setFormValidityValue(f.durationHours / 24);
      setFormValidityUnit('days');
    } else {
      setFormValidityValue(f.durationHours);
      setFormValidityUnit('hours');
    }

    setFormPrice(f.price);
    setFormDownloadSpeed(f.downloadSpeedMbps);
    setFormUploadSpeed(f.uploadSpeedMbps);
    setFormDataLimit(f.dataLimitMb && f.dataLimitMb > 0 ? String(f.dataLimitMb) : '');
    setFormSimultaneousDevices(f.simultaneousDevices || 1);
    setFormMacLock(!!f.macLock);
    setModalOpen(true);
  };

  // Handle Form Submit
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const totalHours = calculateTotalHours(formValidityValue, formValidityUnit);
    const parsedDataLimit = formDataLimit.trim() ? parseInt(formDataLimit, 10) : 0;

    if (editingForfait) {
      const updated: ForfaitItem = {
        ...editingForfait,
        name: formName.trim(),
        durationHours: totalHours,
        price: Math.max(10, formPrice),
        downloadSpeedMbps: Math.max(1, formDownloadSpeed),
        uploadSpeedMbps: Math.max(1, formUploadSpeed),
        dataLimitMb: isNaN(parsedDataLimit) ? 0 : parsedDataLimit,
        simultaneousDevices: Math.max(1, formSimultaneousDevices),
        macLock: formMacLock,
        validityValue: formValidityValue,
        validityUnit: formValidityUnit,
      };
      updateForfait(updated);
      showToast(`Forfait "${updated.name}" mis à jour avec succès`);
    } else {
      const newForfaitData: Omit<ForfaitItem, 'id'> = {
        name: formName.trim(),
        durationHours: totalHours,
        price: Math.max(10, formPrice),
        downloadSpeedMbps: Math.max(1, formDownloadSpeed),
        uploadSpeedMbps: Math.max(1, formUploadSpeed),
        dataLimitMb: isNaN(parsedDataLimit) ? 0 : parsedDataLimit,
        simultaneousDevices: Math.max(1, formSimultaneousDevices),
        macLock: formMacLock,
        validityValue: formValidityValue,
        validityUnit: formValidityUnit,
      };
      addForfait(newForfaitData);
      showToast(`Forfait "${newForfaitData.name}" créé avec succès`);
    }

    setModalOpen(false);
  };

  // Confirm delete
  const handleDeleteConfirm = () => {
    if (!deleteConfirmId) return;
    const target = forfaits.find((f) => f.id === deleteConfirmId);
    deleteForfait(deleteConfirmId);
    showToast(`Forfait "${target?.name || ''}" supprimé`);
    setDeleteConfirmId(null);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-slate-900 border border-emerald-500/40 text-emerald-400 text-xs font-semibold shadow-2xl shadow-black/60 animate-in fade-in slide-in-from-bottom-3">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. TOP HEADER & MAIN ACTION BUTTON */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 p-6 rounded-3xl bg-slate-950/80 border border-white/[0.08] backdrop-blur-xl shadow-2xl">
        <div className="space-y-2">
          {/* Badges Row */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 border border-amber-500/30 text-amber-400 text-[11px] font-bold tracking-wide uppercase">
              <span className="text-amber-400">📶</span>
              <span>TARIFICATION WIFI</span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[11px] font-bold tracking-wide">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Offres Actives</span>
            </div>
          </div>

          {/* Title & Subtitle */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Forfaits Hotspot
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Configurez vos offres de connexion internet : durées, débits (Mbps), quotas de données et tarifs en {currency === 'XOF' ? 'FCFA' : currency}.
            </p>
          </div>
        </div>

        {/* Primary Action Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={openCreateModal}
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Créer un Forfait</span>
          </button>
        </div>
      </div>

      {/* 2. BLOC DES 3 INDICATEURS CLÉS (KPI BAR) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
        {/* KPI 1 : Forfaits Offerts */}
        <div className="p-5 rounded-2xl bg-slate-950/80 border border-white/[0.08] backdrop-blur-md flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              FORFAITS OFFERTS
            </span>
            <div className="text-3xl font-black text-white font-mono tabular-nums">
              {forfaitsCount}
            </div>
            <p className="text-xs text-slate-400">
              Formules de connexion actives
            </p>
          </div>

          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shadow-inner">
            <Package className="w-6 h-6 text-amber-400" />
          </div>
        </div>

        {/* KPI 2 : Gamme de Prix */}
        <div className="p-5 rounded-2xl bg-slate-950/80 border border-white/[0.08] backdrop-blur-md flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              GAMME DE PRIX
            </span>
            <div className="text-3xl font-black text-white font-mono tabular-nums">
              {forfaitsCount > 0 ? `${minPrice} - ${maxPrice}` : '0'}
            </div>
            <p className="text-xs text-slate-400">
              En {currency === 'XOF' ? 'FCFA' : currency}
            </p>
          </div>

          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shadow-inner">
            <Tag className="w-6 h-6 text-emerald-400" />
          </div>
        </div>

        {/* KPI 3 : Bande Passante Max */}
        <div className="p-5 rounded-2xl bg-slate-950/80 border border-white/[0.08] backdrop-blur-md flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              BANDE PASSANTE MAX
            </span>
            <div className="text-3xl font-black text-white font-mono tabular-nums flex items-baseline gap-1">
              <span>{maxDownload}</span>
              <span className="text-lg font-bold text-slate-400">Mbps</span>
            </div>
            <p className="text-xs text-slate-400">
              Débit descendant maximal
            </p>
          </div>

          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shadow-inner">
            <Gauge className="w-6 h-6 text-cyan-400" />
          </div>
        </div>
      </div>

      {/* 3. GRILLE DES CARTES DE FORFAITS (PACKAGE CARDS) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {forfaits.map((f) => (
          <div
            key={f.id}
            className="p-6 rounded-3xl bg-[#0e1626]/90 border border-slate-800/90 hover:border-amber-500/40 transition-all duration-200 flex flex-col justify-between shadow-xl shadow-black/20 group"
          >
            <div className="space-y-4">
              {/* Card Top: Badge & Delete Icon */}
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400 text-[10px] font-extrabold uppercase tracking-wider">
                  <Zap className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span>FORFAIT HOTSPOT</span>
                </span>

                <button
                  onClick={() => setDeleteConfirmId(f.id)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800/60 transition cursor-pointer"
                  title="Supprimer ce forfait"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Package Title */}
              <div>
                <h3 className="text-xl font-extrabold text-white capitalize tracking-tight group-hover:text-amber-300 transition-colors">
                  {f.name}
                </h3>
              </div>

              {/* Tarif Vente Encart */}
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">Tarif Vente</span>
                <span className="text-2xl font-black text-amber-500 font-mono tabular-nums tracking-wide">
                  {formatMoney(f.price)}
                </span>
              </div>

              {/* 2 Key Metrics: Durée Validité & Vitesse */}
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 grid grid-cols-2 gap-3 text-xs">
                {/* Durée Validité */}
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-[11px] text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Durée Validité</span>
                  </div>
                  <div className="text-sm font-bold text-white font-mono">
                    {formatDurationDisplay(f.durationHours)}
                  </div>
                </div>

                {/* Vitesse */}
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-[11px] text-slate-400">
                    <Gauge className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Vitesse</span>
                  </div>
                  <div className="text-sm font-bold text-white font-mono">
                    ↓{f.downloadSpeedMbps} / ↑{f.uploadSpeedMbps} M
                  </div>
                </div>
              </div>

              {/* Feature Badges */}
              <div className="flex items-center gap-2 flex-wrap pt-1">
                {/* Quota Badge */}
                {!f.dataLimitMb || f.dataLimitMb === 0 ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Internet Illimité</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold">
                    <Package className="w-3.5 h-3.5 text-purple-400" />
                    <span>
                      Quota : {f.dataLimitMb >= 1024 ? `${(f.dataLimitMb / 1024).toFixed(0)} Go` : `${f.dataLimitMb} Mo`}
                    </span>
                  </span>
                )}

                {/* Max Appareils */}
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs font-semibold">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    Max {f.simultaneousDevices || 1} Appareil{f.simultaneousDevices > 1 ? 's' : ''}
                  </span>
                </span>

                {/* MAC Lock Badge if enabled */}
                {f.macLock && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
                    <Shield className="w-3 h-3 text-blue-400" />
                    <span>Verrou MAC</span>
                  </span>
                )}
              </div>
            </div>

            {/* Bottom Button : Modifier le Forfait */}
            <div className="pt-6">
              <button
                onClick={() => openEditModal(f)}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-700/80 text-slate-200 hover:text-white text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-sm hover:border-slate-600"
              >
                <Edit2 className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-400 transition" />
                <span>Modifier le Forfait</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 4. MODALES : "CRÉER UN NOUVEAU FORFAIT" & "MODIFIER LE FORFAIT" */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-[#0f172a] border border-slate-700/80 p-6 shadow-2xl text-slate-100 space-y-5 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-500 flex items-center justify-center">
                  <Wifi className="w-4 h-4" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  {editingForfait ? 'Modifier le Forfait' : 'Créer un Nouveau Forfait'}
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              {/* NOM DU FORFAIT */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  NOM DU FORFAIT (EX: PASS 24H, TICKET 1H)
                </label>
                <input
                  type="text"
                  required
                  placeholder="Pass 24 Heures Express"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#080d1a] border border-slate-800 text-white placeholder-slate-600 text-xs focus:outline-none focus:border-amber-500 transition font-medium"
                />
              </div>

              {/* DURÉE DE VALIDITÉ & UNITÉ */}
              <div className="grid grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    DURÉE DE VALIDITÉ
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formValidityValue}
                    onChange={(e) => setFormValidityValue(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#080d1a] border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-amber-500 transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    UNITÉ
                  </label>
                  <select
                    value={formValidityUnit}
                    onChange={(e) =>
                      setFormValidityUnit(
                        e.target.value as 'hours' | 'days' | 'weeks' | 'months'
                      )
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#080d1a] border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500 transition cursor-pointer"
                  >
                    <option value="hours">Heure(s)</option>
                    <option value="days">Jour(s)</option>
                    <option value="weeks">Semaine(s)</option>
                    <option value="months">Mois (30j)</option>
                  </select>
                </div>
              </div>

              {/* PRIX DE VENTE & DEVISE */}
              <div className="grid grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    PRIX DE VENTE
                  </label>
                  <input
                    type="number"
                    min="10"
                    step="10"
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#080d1a] border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-amber-500 transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      DEVISE
                    </label>
                    <button
                      type="button"
                      onClick={() => setCurrencyModalOpen(true)}
                      className="text-[10px] font-bold text-amber-500 hover:text-amber-400 uppercase tracking-wider cursor-pointer"
                    >
                      MODIFIER
                    </button>
                  </div>
                  <div className="px-4 py-2.5 rounded-xl bg-[#080d1a] border border-slate-800 text-white text-xs font-bold flex items-center justify-between">
                    <span>{currency === 'XOF' ? 'FCFA' : currency}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-tight">
                    Devise du compte — commune à tous vos forfaits.
                  </p>
                </div>
              </div>

              {/* DÉBIT DOWNLOAD & DÉBIT UPLOAD */}
              <div className="grid grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    DÉBIT DOWNLOAD (MBPS)
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formDownloadSpeed}
                    onChange={(e) => setFormDownloadSpeed(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#080d1a] border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-amber-500 transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    DÉBIT UPLOAD (MBPS)
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formUploadSpeed}
                    onChange={(e) => setFormUploadSpeed(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#080d1a] border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-amber-500 transition"
                  />
                </div>
              </div>

              {/* QUOTA DATA & MAX APPAREILS SIMULTANÉS */}
              <div className="grid grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    QUOTA DATA (MO - OPTIONNEL)
                  </label>
                  <input
                    type="text"
                    placeholder="Laissez vide pour illimité"
                    value={formDataLimit}
                    onChange={(e) => setFormDataLimit(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#080d1a] border border-slate-800 text-white placeholder-slate-600 text-xs focus:outline-none focus:border-amber-500 transition font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    MAX APPAREILS SIMULTANÉS
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    required
                    value={formSimultaneousDevices}
                    onChange={(e) => setFormSimultaneousDevices(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#080d1a] border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-amber-500 transition"
                  />
                </div>
              </div>

              {/* OPTION DE SÉCURITÉ : VERROUILLAGE ADRESSE MAC */}
              <div className="p-4 rounded-2xl bg-[#080d1a] border border-slate-800 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-amber-500" />
                    <span>Verrouillage Adresse MAC</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-tight">
                    Lie le ticket au 1er appareil connecté pour empêcher le partage de code
                  </p>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formMacLock}
                    onChange={(e) => setFormMacLock(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                </label>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs shadow-lg shadow-orange-500/20 transition cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                >
                  {editingForfait ? 'Enregistrer' : 'Créer le Forfait'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. MODALE DE SUPPRESSION AVEC CONFIRMATION */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-slate-100 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-white">Supprimer ce forfait ?</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Cette action supprimera définitivement le forfait du catalogue de vente et du POS.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition cursor-pointer"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/20 transition cursor-pointer"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. MODALE RAPIDE DE CHOIX DE DEVISE */}
      {currencyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white">Devise du compte</h3>
              <button
                onClick={() => setCurrencyModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              {[
                { code: 'XOF' as Currency, label: 'Franc CFA (FCFA / XOF)', desc: 'Côte d’Ivoire, Sénégal, Mali, Bénin' },
                { code: 'GNF' as Currency, label: 'Franc Guinéen (GNF)', desc: 'Guinée Conakry' },
                { code: 'EUR' as Currency, label: 'Euro (€)', desc: 'Zone Euro' },
                { code: 'USD' as Currency, label: 'Dollar US ($)', desc: 'International' },
              ].map((c) => (
                <button
                  key={c.code}
                  onClick={() => {
                    setCurrency(c.code);
                    setCurrencyModalOpen(false);
                    showToast(`Devise modifiée : ${c.code}`);
                  }}
                  className={`w-full p-3 rounded-xl border text-left transition flex items-center justify-between cursor-pointer ${
                    currency === c.code
                      ? 'bg-amber-500/10 border-amber-500/40 text-amber-400'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold text-white">{c.label}</div>
                    <div className="text-[10px] text-slate-400">{c.desc}</div>
                  </div>
                  {currency === c.code && <Check className="w-4 h-4 text-amber-400" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
