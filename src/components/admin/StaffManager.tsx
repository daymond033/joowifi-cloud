import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StaffItem } from '../../types';
import {
  Users,
  Plus,
  Phone,
  Percent,
  AlertCircle,
  Coins,
  MapPin,
  X,
  Smartphone,
  Power,
  Trash2,
  Search,
} from 'lucide-react';

export const StaffManager: React.FC = () => {
  const {
    staff,
    zones,
    addStaff,
    toggleStaffStatus,
    deleteStaff,
    rechargeStaff,
    formatMoney,
    pendingSosAlerts,
    clearSosAlert,
    setCurrentSpace,
    login,
  } = useApp();

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [rechargeModalStaff, setRechargeModalStaff] = useState<StaffItem | null>(null);
  const [rechargeAmount, setRechargeAmount] = useState<number>(20000);
  const [searchQuery, setSearchQuery] = useState('');
  const [zoneFilter, setZoneFilter] = useState('all');

  const [formData, setFormData] = useState<{
    name: string;
    phone: string;
    zoneId: string;
    zoneName: string;
    commissionRate: number;
    balanceCredit: number;
    dailyGoal: number;
    active: boolean;
  }>({
    name: '',
    phone: '+225 ',
    zoneId: zones[0]?.id || 'zone-1',
    zoneName: zones[0]?.name || 'Cocody',
    commissionRate: 12,
    balanceCredit: 30000,
    dailyGoal: 20000,
    active: true,
  });

  const filteredStaff = staff.filter((member) => {
    const matchesZone = zoneFilter === 'all' || member.zoneId === zoneFilter;
    const matchesSearch =
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.zoneName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesZone && matchesSearch;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    const selectedZone = zones.find((z) => z.id === formData.zoneId);
    addStaff({
      ...formData,
      zoneName: selectedZone?.name || formData.zoneName,
      lastActive: 'À l’instant',
    });
    setFormData({
      ...formData,
      name: '',
      phone: '+225 ',
    });
    setAddModalOpen(false);
  };

  const handleRechargeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rechargeModalStaff) return;
    rechargeStaff(rechargeModalStaff.id, rechargeAmount);
    setRechargeModalStaff(null);
  };

  const handleOpenPOSAsVendor = (member: StaffItem) => {
    login(`${member.name.toLowerCase().replace(/\s+/g, '.')}@joowifi.pro`, 'staff', member.name);
    setCurrentSpace('pos');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/40 backdrop-blur-md border border-white/10">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Users className="w-5 h-5" />
            </div>
            <span>Équipe Vendeurs & Caisse POS Terrain</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Gérez vos gérants de cabines et vendeurs ambulants, fixez leurs commissions et rechargez leur crédit d'émission.
          </p>
        </div>

        <button
          onClick={() => setAddModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 transition cursor-pointer shadow-lg shadow-amber-500/20 active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Ajouter un Vendeur POS</span>
        </button>
      </div>

      {/* SOS Alerts Bar (if any vendor sent an SOS) */}
      {pendingSosAlerts.length > 0 && (
        <div className="p-4 rounded-2xl bg-rose-950/50 border border-rose-500/40 text-xs text-rose-200 space-y-2.5">
          <div className="font-bold flex items-center gap-2 text-white">
            <AlertCircle className="w-4 h-4 text-rose-400 animate-bounce" />
            <span>Alertes SOS Recharge reçues du terrain ({pendingSosAlerts.length})</span>
          </div>
          {pendingSosAlerts.map((sos) => (
            <div
              key={sos.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-950/90 p-3 rounded-xl border border-rose-500/30"
            >
              <div>
                <strong className="text-white">{sos.staffName}</strong> demande une recharge urgente de{' '}
                <strong className="text-amber-400 font-mono">{formatMoney(sos.amount)}</strong>
                <span className="text-[10px] text-slate-400 ml-2">({sos.time})</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const st = staff.find((s) => s.name.includes(sos.staffName.split(' ')[0])) || staff[0];
                    if (st) {
                      setRechargeModalStaff(st);
                      setRechargeAmount(sos.amount);
                    }
                    clearSosAlert(sos.id);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold cursor-pointer active:scale-95"
                >
                  Créditer maintenant
                </button>
                <button
                  onClick={() => clearSosAlert(sos.id)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white cursor-pointer"
                >
                  Ignorer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Search & Zone Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/40 backdrop-blur-md border border-white/10">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-2.5" />
          <input
            type="text"
            placeholder="Rechercher un vendeur par nom, téléphone ou zone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={zoneFilter}
            onChange={(e) => setZoneFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
          >
            <option value="all">Toutes les zones ({zones.length})</option>
            {zones.map((z) => (
              <option key={z.id} value={z.id}>
                {z.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredStaff.map((member) => {
          const commissionsTotal = Math.round(
            (member.totalSales * member.commissionRate) / 100
          );
          const goalPercent = Math.min(
            100,
            Math.round((member.todaySales / (member.dailyGoal || 1)) * 100)
          );

          return (
            <div
              key={member.id}
              className="p-6 rounded-2xl bg-slate-900/40 backdrop-blur-md border border-white/10 space-y-4 hover:border-amber-500/30 transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-600/20 text-amber-400 font-extrabold flex items-center justify-center border border-amber-500/30 font-mono">
                    {member.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{member.name}</h3>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5 font-mono">
                      <Phone className="w-3 h-3 text-emerald-400" />
                      <span>{member.phone}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => toggleStaffStatus(member.id)}
                    title={member.active ? 'Suspendre ce vendeur' : 'Réactiver ce vendeur'}
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 cursor-pointer transition ${
                      member.active
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}
                  >
                    <Power className="w-3 h-3" />
                    <span>{member.active ? 'Actif' : 'Suspendu'}</span>
                  </button>
                  <button
                    onClick={() => deleteStaff(member.id)}
                    title="Supprimer ce vendeur"
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800/60 transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Zone and Commission */}
              <div className="flex items-center justify-between text-xs text-slate-300 pt-1">
                <div className="flex items-center gap-1.5 text-slate-300">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  <span>{member.zoneName}</span>
                </div>
                <div className="flex items-center gap-1 text-amber-300 font-mono font-semibold">
                  <Percent className="w-3.5 h-3.5" />
                  <span>Commission : {member.commissionRate}%</span>
                </div>
              </div>

              {/* Metrics Box */}
              <div className="grid grid-cols-3 gap-2 p-3.5 rounded-xl bg-slate-950/90 border border-white/10 text-center text-xs font-mono tabular-nums">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-sans">Solde Crédit</span>
                  <span className="font-bold text-emerald-400 text-xs">
                    {formatMoney(member.balanceCredit)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-sans">Ventes Jour</span>
                  <span className="font-bold text-amber-400 text-xs">
                    {formatMoney(member.todaySales)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-sans">Commissions</span>
                  <span className="font-bold text-cyan-400 text-xs">
                    {formatMoney(commissionsTotal)}
                  </span>
                </div>
              </div>

              {/* Daily Goal bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">Objectif journalier ({goalPercent}%)</span>
                  <span className="text-slate-300 font-mono tabular-nums">
                    {formatMoney(member.todaySales)} / {formatMoney(member.dailyGoal)}
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-emerald-400"
                    style={{ width: `${goalPercent}%` }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-white/10">
                <button
                  onClick={() => handleOpenPOSAsVendor(member)}
                  className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-white/10 text-amber-300 font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer active:scale-95"
                >
                  <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                  <span>Ouvrir sa Caisse POS</span>
                </button>

                <button
                  onClick={() => {
                    setRechargeModalStaff(member);
                    setRechargeAmount(25000);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-md shadow-emerald-500/20 active:scale-95"
                >
                  <Coins className="w-3.5 h-3.5" />
                  <span>Recharger Crédit</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL: ADD STAFF */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-[#0B0F19] border border-white/15 p-6 shadow-2xl text-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white">Ajouter un Vendeur POS</h3>
              <button
                onClick={() => setAddModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Nom complet du vendeur *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Ibrahima Konaté (Gare Sud)"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white focus:outline-none focus:border-amber-500 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Numéro de téléphone WhatsApp *</label>
                <input
                  type="tel"
                  required
                  placeholder="+225 07 00 00 00"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white focus:outline-none focus:border-amber-500 text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Zone assignée :</label>
                <select
                  value={formData.zoneId}
                  onChange={(e) => setFormData({ ...formData, zoneId: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white focus:outline-none focus:border-amber-500 text-xs"
                >
                  {zones.map((z) => (
                    <option key={z.id} value={z.id}>
                      {z.name} ({z.city})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3 font-mono">
                <div className="space-y-1">
                  <label className="text-slate-300 font-sans font-medium">Commission (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={formData.commissionRate}
                    onChange={(e) =>
                      setFormData({ ...formData, commissionRate: Number(e.target.value) })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white focus:outline-none focus:border-amber-500 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-sans font-medium">Crédit Initial (FCFA)</label>
                  <input
                    type="number"
                    min="5000"
                    step="5000"
                    value={formData.balanceCredit}
                    onChange={(e) =>
                      setFormData({ ...formData, balanceCredit: Number(e.target.value) })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white focus:outline-none focus:border-amber-500 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Objectif Journalier (FCFA)</label>
                <input
                  type="number"
                  min="5000"
                  step="5000"
                  value={formData.dailyGoal}
                  onChange={(e) => setFormData({ ...formData, dailyGoal: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white font-mono focus:outline-none focus:border-amber-500 text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 font-extrabold text-xs transition cursor-pointer shadow-lg shadow-amber-500/25 mt-2 active:scale-95"
              >
                Créer l'accès vendeur POS
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: RECHARGE STAFF CREDIT */}
      {rechargeModalStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl bg-[#0B0F19] border border-white/15 p-6 shadow-2xl text-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Coins className="w-4 h-4 text-emerald-400" />
                <span>Recharger le Crédit Vendeur</span>
              </h3>
              <button
                onClick={() => setRechargeModalStaff(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRechargeSubmit} className="space-y-4 text-xs">
              <p className="text-slate-300">
                Créditer le plafond d'émission de tickets de{' '}
                <strong className="text-white">{rechargeModalStaff.name}</strong>.
              </p>

              <div className="space-y-1">
                <label className="text-slate-400 font-semibold">Montant rapide :</label>
                <div className="grid grid-cols-3 gap-2 font-mono">
                  {[10000, 25000, 50000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setRechargeAmount(amt)}
                      className={`py-2 rounded-xl font-bold border transition cursor-pointer ${
                        rechargeAmount === amt
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                          : 'bg-slate-900 border-white/10 text-slate-300 hover:text-white'
                      }`}
                    >
                      {formatMoney(amt)}
                    </button>
                  ))}
                </div>
              </div>

              <input
                type="number"
                min="1000"
                step="1000"
                value={rechargeAmount}
                onChange={(e) => setRechargeAmount(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white focus:outline-none focus:border-emerald-500 text-xs font-mono"
              />

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs transition cursor-pointer shadow-lg shadow-emerald-500/25 active:scale-95"
              >
                Valider la recharge (+{formatMoney(rechargeAmount)})
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
