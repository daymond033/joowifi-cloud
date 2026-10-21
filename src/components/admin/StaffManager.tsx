import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  Plus,
  Phone,
  MapPin,
  Percent,
  Wallet,
  TrendingUp,
  Power,
  Trash2,
  Smartphone,
  CheckCircle2,
  X,
  Search,
  DollarSign,
} from 'lucide-react';

export const StaffManager: React.FC = () => {
  const {
    staff,
    zones,
    addStaff,
    rechargeStaff,
    toggleStaffStatus,
    deleteStaff,
    formatMoney,
    setCurrentSpace,
    pendingSosAlerts,
    clearSosAlert,
  } = useApp();

  const [selectedZoneFilter, setSelectedZoneFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Add Staff Modal
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('+225 ');
  const [newZoneId, setNewZoneId] = useState(zones[0]?.id || 'zone-1');
  const [newCommission, setNewCommission] = useState(10);
  const [newInitialCredit, setNewInitialCredit] = useState(25000);
  const [newDailyGoal, setNewDailyGoal] = useState(15000);

  // Recharge Modal
  const [rechargeModalStaffId, setRechargeModalStaffId] = useState<string | null>(null);
  const [rechargeAmount, setRechargeAmount] = useState(15000);

  const filteredStaff = staff.filter((s) => {
    const matchZone =
      selectedZoneFilter === 'all' ||
      s.zoneId === selectedZoneFilter ||
      s.zoneName === selectedZoneFilter;
    const matchQuery =
      s.name.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
      s.phone.toLowerCase().includes(searchQuery.trim().toLowerCase());
    return matchZone && matchQuery;
  });

  const totalTodaySales = staff.reduce((acc, s) => acc + s.todaySales, 0);
  const totalCreditInField = staff.reduce((acc, s) => acc + s.balanceCredit, 0);
  const totalCommissions = staff.reduce(
    (acc, s) => acc + Math.round((s.totalSales * s.commissionRate) / 100),
    0
  );

  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const targetZone = zones.find((z) => z.id === newZoneId) || zones[0];
    addStaff({
      name: newName.trim(),
      phone: newPhone.trim(),
      zoneId: targetZone?.id || 'zone-1',
      zoneName: targetZone?.name || 'Kiosque Principal Joowifi',
      commissionRate: Number(newCommission),
      balanceCredit: Number(newInitialCredit),
      dailyGoal: Number(newDailyGoal),
      active: true,
    });
    setAddModalOpen(false);
    setNewName('');
  };

  const handleConfirmRecharge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rechargeModalStaffId) return;
    rechargeStaff(rechargeModalStaffId, Number(rechargeAmount));
    setRechargeModalStaffId(null);
  };

  return (
    <div className="space-y-5 pb-12 text-[#1E293B]">
      {/* 1. TOP COMMAND & FILTER BAR (Clean White Card) */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-2xs">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#008060] mb-1">
            RÉSEAU DE DISTRIBUTION & TERMINAUX CAISSE POS
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">
            Gestion des Agents Vendeurs ({staff.length})
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Gérez les soldes prépayés, les taux de commission et les accès Caisse POS de vos revendeurs terrain.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un agent..."
              className="pl-8 pr-3 py-1.5 rounded bg-[#F4F7FA] border border-slate-300 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-[#008060]"
            />
          </div>

          <select
            value={selectedZoneFilter}
            onChange={(e) => setSelectedZoneFilter(e.target.value)}
            className="px-3 py-1.5 rounded bg-[#F4F7FA] border border-slate-300 text-xs font-medium text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="all">Tous les sites ({zones.length})</option>
            {zones.map((z) => (
              <option key={z.id} value={z.id}>
                {z.name}
              </option>
            ))}
          </select>

          <button
            onClick={() => setAddModalOpen(true)}
            className="px-4 py-2 rounded bg-[#008060] hover:bg-[#006B50] text-white font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter un Vendeur</span>
          </button>
        </div>
      </div>

      {/* 2. KPI SUMMARY STRIP */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-lg border border-slate-200 flex items-center justify-between shadow-2xs">
          <div>
            <span className="text-[11px] font-bold uppercase text-slate-400">VENTES POS DU JOUR</span>
            <div className="text-2xl font-bold text-[#008060] font-mono mt-0.5">
              {formatMoney(totalTodaySales)}
            </div>
            <span className="text-[11px] text-slate-500">Encaissements cumulés</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[#E6F4F3] text-[#008060] flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-lg border border-slate-200 flex items-center justify-between shadow-2xs">
          <div>
            <span className="text-[11px] font-bold uppercase text-slate-400">CRÉDIT EN CIRCULATION</span>
            <div className="text-2xl font-bold text-slate-800 font-mono mt-0.5">
              {formatMoney(totalCreditInField)}
            </div>
            <span className="text-[11px] text-slate-500">Solde prépayé disponible</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[#EFF6FF] text-[#0066CC] flex items-center justify-center">
            <Wallet className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-lg border border-slate-200 flex items-center justify-between shadow-2xs">
          <div>
            <span className="text-[11px] font-bold uppercase text-slate-400">COMMISSIONS AGENTS</span>
            <div className="text-2xl font-bold text-slate-800 font-mono mt-0.5">
              {formatMoney(totalCommissions)}
            </div>
            <span className="text-[11px] text-slate-500">Rémunération vendeurs</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[#E6F4F3] text-[#007A78] flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* SOS Requests if any */}
      {pendingSosAlerts.length > 0 && (
        <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs">
            <strong className="text-rose-800 block text-sm">
              Demande SOS Crédit : {pendingSosAlerts[0].vendorName} ({pendingSosAlerts[0].zoneName})
            </strong>
            <span className="text-rose-700">
              Solde actuel : {formatMoney(pendingSosAlerts[0].currentBalance)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                rechargeStaff(pendingSosAlerts[0].vendorId, 25000);
                clearSosAlert(pendingSosAlerts[0].id);
              }}
              className="px-3.5 py-1.5 rounded bg-[#008060] text-white font-semibold text-xs cursor-pointer"
            >
              Créditer +25 000 F
            </button>
          </div>
        </div>
      )}

      {/* 3. CLEAN WHITE CORPORATE VENDOR CARDS (No more muddy grey bg-slate-900/40!) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              className="bg-white rounded-lg border border-slate-200 hover:border-[#008060] p-5 space-y-4 transition shadow-2xs"
            >
              {/* Top Row: Avatar, Name/Phone, Active Status */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-lg bg-[#E6F4F3] text-[#005A5B] font-bold text-sm flex items-center justify-center border border-[#99D5D3] font-mono">
                    {member.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{member.name}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5 font-mono">
                      <Phone className="w-3 h-3 text-[#008060]" />
                      <span>{member.phone}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => toggleStaffStatus(member.id)}
                    className={`text-[11px] font-semibold px-2.5 py-1 rounded flex items-center gap-1 cursor-pointer transition ${
                      member.active
                        ? 'bg-[#E6F4F3] text-[#008060] border border-[#99D5D3]'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    <Power className="w-3 h-3" />
                    <span>{member.active ? 'Actif' : 'Suspendu'}</span>
                  </button>
                  <button
                    onClick={() => deleteStaff(member.id)}
                    title="Supprimer cet agent"
                    className="p-1.5 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Zone & Commission Strip */}
              <div className="flex items-center justify-between text-xs pt-1">
                <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-[#007A78]" />
                  <span>{member.zoneName}</span>
                </div>
                <div className="px-2.5 py-0.5 rounded bg-[#EFF6FF] text-[#0066CC] border border-blue-200 font-semibold flex items-center gap-1">
                  <Percent className="w-3 h-3" />
                  <span>Commission : {member.commissionRate}%</span>
                </div>
              </div>

              {/* 3-Column Financial Box on crisp #F8FAFC */}
              <div className="grid grid-cols-3 gap-2 p-3.5 rounded-lg bg-[#F8FAFC] border border-slate-200 text-center text-xs font-mono tabular-nums">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-sans font-semibold">
                    Solde Crédit
                  </span>
                  <span className="font-bold text-slate-900 text-xs mt-0.5 block">
                    {formatMoney(member.balanceCredit)}
                  </span>
                </div>
                <div className="border-x border-slate-200">
                  <span className="text-[10px] text-slate-400 block uppercase font-sans font-semibold">
                    Ventes Jour
                  </span>
                  <span className="font-bold text-[#008060] text-xs mt-0.5 block">
                    {formatMoney(member.todaySales)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-sans font-semibold">
                    Commissions
                  </span>
                  <span className="font-bold text-[#0066CC] text-xs mt-0.5 block">
                    {formatMoney(commissionsTotal)}
                  </span>
                </div>
              </div>

              {/* Daily Goal Progress Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>Objectif journalier ({goalPercent}%)</span>
                  <span className="font-mono">
                    {formatMoney(member.todaySales)} / {formatMoney(member.dailyGoal || 15000)}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                  <div
                    className="h-full bg-[#008060] transition-all duration-300"
                    style={{ width: `${goalPercent}%` }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-2 pt-1">
                <button
                  onClick={() => setCurrentSpace('pos')}
                  className="px-3.5 py-2 rounded bg-[#F4F7FA] hover:bg-slate-200 border border-slate-300 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Smartphone className="w-3.5 h-3.5 text-[#007A78]" />
                  <span>Ouvrir sa Caisse POS</span>
                </button>

                <button
                  onClick={() => {
                    setRechargeModalStaffId(member.id);
                    setRechargeAmount(15000);
                  }}
                  className="px-4 py-2 rounded bg-[#008060] hover:bg-[#006B50] text-white font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Wallet className="w-3.5 h-3.5" />
                  <span>Recharger Crédit</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Recharge Crédit */}
      {rechargeModalStaffId && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4"
          onClick={() => setRechargeModalStaffId(null)}
        >
          <div
            className="w-full max-w-md bg-white rounded-lg border border-slate-200 shadow-2xl overflow-hidden text-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 bg-[#005A5B] text-white flex items-center justify-between">
              <h3 className="text-sm font-bold">Recharger le Crédit POS Vendeur</h3>
              <button onClick={() => setRechargeModalStaffId(null)} className="text-teal-100 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleConfirmRecharge} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Montant de crédit à ajouter (FCFA) :
                </label>
                <input
                  type="number"
                  min={1000}
                  step={500}
                  value={rechargeAmount}
                  onChange={(e) => setRechargeAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded bg-[#F8FAFC] border border-slate-300 font-mono text-sm font-bold text-slate-800"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {[5000, 15000, 25000, 50000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setRechargeAmount(amt)}
                    className={`px-3 py-1.5 rounded font-mono font-semibold cursor-pointer ${
                      rechargeAmount === amt
                        ? 'bg-[#008060] text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    +{amt.toLocaleString('fr-FR')} F
                  </button>
                ))}
              </div>
              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRechargeModalStaffId(null)}
                  className="px-4 py-2 rounded bg-slate-100 text-slate-700 font-semibold cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-[#008060] text-white font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Valider la Recharge</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Ajouter Vendeur */}
      {addModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4"
          onClick={() => setAddModalOpen(false)}
        >
          <div
            className="w-full max-w-md bg-white rounded-lg border border-slate-200 shadow-2xl overflow-hidden text-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 bg-[#005A5B] text-white flex items-center justify-between">
              <h3 className="text-sm font-bold">Nouvel Agent Vendeur POS</h3>
              <button onClick={() => setAddModalOpen(false)} className="text-teal-100 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateStaff} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nom complet :</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ex: Célestine Yao"
                  className="w-full px-3 py-2 rounded bg-[#F8FAFC] border border-slate-300 text-slate-800"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Téléphone WhatsApp / Mobile Money :</label>
                <input
                  type="text"
                  required
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-[#F8FAFC] border border-slate-300 font-mono text-slate-800"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Site d'affectation :</label>
                <select
                  value={newZoneId}
                  onChange={(e) => setNewZoneId(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-[#F8FAFC] border border-slate-300 text-slate-800"
                >
                  {zones.map((z) => (
                    <option key={z.id} value={z.id}>
                      {z.name} ({z.city})
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Commission (%) :</label>
                  <input
                    type="number"
                    min={0}
                    max={50}
                    value={newCommission}
                    onChange={(e) => setNewCommission(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded bg-[#F8FAFC] border border-slate-300 font-mono text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Crédit Initial (FCFA) :</label>
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    value={newInitialCredit}
                    onChange={(e) => setNewInitialCredit(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded bg-[#F8FAFC] border border-slate-300 font-mono text-slate-800"
                  />
                </div>
              </div>
              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-4 py-2 rounded bg-slate-100 text-slate-700 font-semibold cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-[#008060] text-white font-semibold cursor-pointer"
                >
                  Créer l'Agent POS
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
