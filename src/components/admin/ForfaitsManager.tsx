import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ForfaitItem } from '../../types';
import {
  Wifi,
  Plus,
  Trash2,
  Edit3,
  Clock,
  ArrowDown,
  ArrowUp,
  Smartphone,
  Check,
  X,
  LayoutGrid,
  List,
  Search,
  Tag,
  Gauge,
  Package,
} from 'lucide-react';

export const ForfaitsManager: React.FC = () => {
  const { forfaits, addForfait, updateForfait, deleteForfait, formatMoney, currency } = useApp();

  // New B2B View Mode Toggle: 'cards' | 'table'
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal state (Create & Edit)
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [price, setPrice] = useState(200);
  const [durationHours, setDurationHours] = useState(24);
  const [validityValue, setValidityValue] = useState(1);
  const [validityUnit, setValidityUnit] = useState<'hours' | 'days' | 'weeks' | 'months'>('days');
  const [downloadMbps, setDownloadMbps] = useState(10);
  const [uploadMbps, setUploadMbps] = useState(3);
  const [dataLimitMb, setDataLimitMb] = useState(0);
  const [simultaneousDevices, setSimultaneousDevices] = useState(1);

  const filteredForfaits = forfaits.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
  );

  const openCreateModal = () => {
    setEditingId(null);
    setName('');
    setPrice(500);
    setDurationHours(24);
    setValidityValue(1);
    setValidityUnit('days');
    setDownloadMbps(10);
    setUploadMbps(3);
    setDataLimitMb(0);
    setSimultaneousDevices(1);
    setModalOpen(true);
  };

  const openEditModal = (f: ForfaitItem) => {
    setEditingId(f.id);
    setName(f.name);
    setPrice(f.price);
    setDurationHours(f.durationHours);
    setValidityValue(f.validityValue || 1);
    setValidityUnit(f.validityUnit || 'days');
    setDownloadMbps(f.downloadSpeedMbps);
    setUploadMbps(f.uploadSpeedMbps);
    setDataLimitMb(f.dataLimitMb || 0);
    setSimultaneousDevices(f.simultaneousDevices || 1);
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const payload = {
      name: name.trim(),
      price: Number(price),
      durationHours: Number(durationHours),
      validityValue: Number(validityValue),
      validityUnit,
      downloadSpeedMbps: Number(downloadMbps),
      uploadSpeedMbps: Number(uploadMbps),
      dataLimitMb: Number(dataLimitMb),
      simultaneousDevices: Number(simultaneousDevices),
      macLock: true,
      popular: Number(price) >= 1000,
      color: 'emerald' as const,
    };

    if (editingId) {
      updateForfait(editingId, payload);
    } else {
      addForfait(payload);
    }
    setModalOpen(false);
  };

  const minPrice = forfaits.length ? Math.min(...forfaits.map((f) => f.price)) : 0;
  const maxPrice = forfaits.length ? Math.max(...forfaits.map((f) => f.price)) : 0;
  const maxDown = forfaits.length ? Math.max(...forfaits.map((f) => f.downloadSpeedMbps)) : 0;

  return (
    <div className="space-y-5 pb-12 text-[#1E293B]">
      {/* 1. TOP COMMAND & ACTION TOOLBAR (Clean White Corporate Card) */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-2xs">
        <div>
          <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#008060] mb-1">
            <span>TARIFICATION WIFI & PROFILS ROUTEROS</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">
            Catalogue des Forfaits Hotspot
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configurez vos formules d'accès Internet : durées, limitations de débit Simple Queues (Mbps) et tarifs en {currency}.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filtrer un forfait..."
              className="pl-8 pr-3 py-1.5 rounded bg-[#F4F7FA] border border-slate-300 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-[#008060]"
            />
          </div>

          {/* View Switcher (Cards vs Table) */}
          <div className="flex items-center bg-[#F4F7FA] p-1 rounded border border-slate-200">
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1 cursor-pointer transition ${
                viewMode === 'cards'
                  ? 'bg-white text-[#005A5B] shadow-2xs border border-slate-200'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Grille</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1 cursor-pointer transition ${
                viewMode === 'table'
                  ? 'bg-white text-[#005A5B] shadow-2xs border border-slate-200'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Tableau</span>
            </button>
          </div>

          {/* Primary Create Button */}
          <button
            onClick={openCreateModal}
            className="px-4 py-2 rounded bg-[#008060] hover:bg-[#006B50] text-white font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Créer un Forfait</span>
          </button>
        </div>
      </div>

      {/* 2. KPI SUMMARY STRIP */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-lg border border-slate-200 flex items-center justify-between shadow-2xs">
          <div>
            <span className="text-[11px] font-bold uppercase text-slate-400">FORFAITS ACTIFS</span>
            <div className="text-2xl font-bold text-slate-800 font-mono mt-0.5">{forfaits.length}</div>
            <span className="text-[11px] text-slate-500">Synchronisés avec Supabase</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[#E6F4F3] text-[#008060] flex items-center justify-center">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-lg border border-slate-200 flex items-center justify-between shadow-2xs">
          <div>
            <span className="text-[11px] font-bold uppercase text-slate-400">GRILLE TARIFAIRE</span>
            <div className="text-2xl font-bold text-slate-800 font-mono mt-0.5">
              {minPrice.toLocaleString('fr-FR')} – {maxPrice.toLocaleString('fr-FR')}
            </div>
            <span className="text-[11px] text-slate-500">Devise active : {currency}</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[#E6F4F3] text-[#007A78] flex items-center justify-center">
            <Tag className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-lg border border-slate-200 flex items-center justify-between shadow-2xs">
          <div>
            <span className="text-[11px] font-bold uppercase text-slate-400">DÉBIT MAXIMAL</span>
            <div className="text-2xl font-bold text-slate-800 font-mono mt-0.5">{maxDown} Mbps</div>
            <span className="text-[11px] text-slate-500">Limitation QoS MikroTik</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[#EFF6FF] text-[#0066CC] flex items-center justify-center">
            <Gauge className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. VIEW MODE A : CLEAN WHITE CORPORATE CARDS (No more dark unreadable cards!) */}
      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredForfaits.map((f) => {
            const isVip = f.name.toLowerCase().includes('vip') || f.price >= 5000;
            return (
              <div
                key={f.id}
                className="bg-white rounded-lg border border-slate-200 hover:border-[#008060] transition overflow-hidden flex flex-col justify-between shadow-2xs"
              >
                {/* Top Colored Accent Strip */}
                <div className={`h-1.5 w-full ${isVip ? 'bg-[#0066CC]' : 'bg-[#008060]'}`} />

                <div className="p-5 space-y-4">
                  {/* Card Header: Badge & Delete */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${
                        isVip
                          ? 'bg-[#EFF6FF] text-[#0066CC] border border-blue-200'
                          : 'bg-[#E6F4F3] text-[#005A5B] border border-[#99D5D3]'
                      }`}
                    >
                      {isVip ? 'PROFIL HAUT DÉBIT VIP' : 'PROFIL HOTSPOT STANDARD'}
                    </span>

                    <button
                      onClick={() => deleteForfait(f.id)}
                      title="Supprimer ce forfait"
                      className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Crisp Dark Title & Price Box */}
                  <div className="flex items-baseline justify-between gap-2 pt-1">
                    <h3 className="text-base font-bold text-slate-900 truncate">{f.name}</h3>
                    <div className="text-right shrink-0">
                      <span className="text-xl font-black text-[#008060] font-mono">
                        {formatMoney(f.price)}
                      </span>
                    </div>
                  </div>

                  {/* Clean Technical Specs Grid on Light Grey (#F8FAFC) */}
                  <div className="grid grid-cols-2 gap-2.5 p-3 rounded-lg bg-[#F8FAFC] border border-slate-200/80 text-xs">
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#007A78]" /> Durée Validité
                      </span>
                      <div className="font-mono font-bold text-slate-800">
                        {f.durationHours}h ({Math.max(1, Math.round(f.durationHours / 24))}j)
                      </div>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                        <Wifi className="w-3 h-3 text-[#0066CC]" /> Débit QoS
                      </span>
                      <div className="font-mono font-bold text-slate-800">
                        &darr;{f.downloadSpeedMbps}M / &uarr;{f.uploadSpeedMbps}M
                      </div>
                    </div>
                  </div>

                  {/* Bottom Tags + Edit Button */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                        Data Illimitée
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium flex items-center gap-1">
                        <Smartphone className="w-3 h-3" /> {f.simultaneousDevices || 1} Appareil(s)
                      </span>
                    </div>

                    <button
                      onClick={() => openEditModal(f)}
                      className="px-3 py-1.5 rounded bg-[#F4F7FA] hover:bg-[#008060] text-slate-700 hover:text-white border border-slate-300 hover:border-[#008060] text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Modifier</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* 4. VIEW MODE B : B2B COMPARATIVE DATA TABLE */
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-[#F8FAFC] text-[11px] text-slate-500 uppercase">
                  <th className="py-3 px-4 font-bold">Nom du Forfait</th>
                  <th className="py-3 px-4 font-bold">Tarif</th>
                  <th className="py-3 px-4 font-bold">Durée</th>
                  <th className="py-3 px-4 font-bold">Débit (Down / Up)</th>
                  <th className="py-3 px-4 font-bold">Appareils</th>
                  <th className="py-3 px-4 font-bold">Profil RouterOS</th>
                  <th className="py-3 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredForfaits.map((f) => (
                  <tr key={f.id} className="hover:bg-[#F8FAFC] transition">
                    <td className="py-3 px-4 font-bold text-slate-800">{f.name}</td>
                    <td className="py-3 px-4 font-mono font-bold text-[#008060]">
                      {formatMoney(f.price)}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700">{f.durationHours} heures</td>
                    <td className="py-3 px-4 font-mono text-slate-700">
                      <span className="text-[#008060]">&darr;{f.downloadSpeedMbps} Mbps</span> /{' '}
                      <span className="text-[#0066CC]">&uarr;{f.uploadSpeedMbps} Mbps</span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{f.simultaneousDevices || 1} max</td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                      {f.name.toLowerCase().includes('vip') ? 'joowifi-vip' : 'joowifi-standard'}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(f)}
                        className="px-2.5 py-1 rounded bg-slate-100 hover:bg-[#008060] text-slate-700 hover:text-white font-semibold transition cursor-pointer"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => deleteForfait(f.id)}
                        className="px-2 py-1 rounded text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE / EDIT MODAL (Clean White Corporate Dialog) */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="w-full max-w-lg bg-white rounded-lg border border-slate-200 shadow-2xl overflow-hidden text-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 bg-[#005A5B] text-white flex items-center justify-between">
              <h2 className="text-base font-bold">
                {editingId ? 'Modifier le Forfait Hotspot' : 'Créer un Nouveau Forfait Hotspot'}
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-teal-100 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Intitulé du Forfait :
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Pass Journée 24 Heures"
                  className="w-full px-3 py-2 rounded bg-[#F8FAFC] border border-slate-300 text-slate-800 focus:outline-none focus:bg-white focus:border-[#008060]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Prix de vente (FCFA) :
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded bg-[#F8FAFC] border border-slate-300 font-mono text-slate-800 focus:outline-none focus:border-[#008060]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Durée totale (en heures) :
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={durationHours}
                    onChange={(e) => setDurationHours(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded bg-[#F8FAFC] border border-slate-300 font-mono text-slate-800 focus:outline-none focus:border-[#008060]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Download (Mbps) :
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={downloadMbps}
                    onChange={(e) => setDownloadMbps(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded bg-[#F8FAFC] border border-slate-300 font-mono text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Upload (Mbps) :
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={uploadMbps}
                    onChange={(e) => setUploadMbps(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded bg-[#F8FAFC] border border-slate-300 font-mono text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Appareils max :
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={simultaneousDevices}
                    onChange={(e) => setSimultaneousDevices(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded bg-[#F8FAFC] border border-slate-300 font-mono text-slate-800"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded bg-[#008060] hover:bg-[#006B50] text-white font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingId ? 'Enregistrer' : 'Créer le Forfait'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
