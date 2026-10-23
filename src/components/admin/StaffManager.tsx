import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StaffItem } from '../../types';
import {
  Plus,
  Phone,
  MapPin,
  Percent,
  Wallet,
  Power,
  Trash2,
  Smartphone,
  CheckCircle2,
  X,
  Search,
  DollarSign,
  Mail,
  Lock,
  ShieldCheck,
  Edit3,
} from 'lucide-react';

export const StaffManager: React.FC = () => {
  const {
    staff,
    zones,
    addStaff,
    updateStaff,
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
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPhone, setNewPhone] = useState('+225 ');
  const [newZoneId, setNewZoneId] = useState(zones[0]?.id || 'Zone Principale');
  const [newCommission, setNewCommission] = useState(10);
  const [newInitialCredit, setNewInitialCredit] = useState(25000);
  const [newDailyGoal, setNewDailyGoal] = useState(15000);
  const [permFastSale, setPermFastSale] = useState(true);
  const [permPrintThermal, setPermPrintThermal] = useState(true);
  const [permShareWhatsapp, setPermShareWhatsapp] = useState(true);
  const [permSosRequest, setPermSosRequest] = useState(true);

  // Edit Staff Modal (Point 2 de l'Audit : Édition complète d'un vendeur après sa création)
  const [editingStaff, setEditingStaff] = useState<StaffItem | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editZoneId, setEditZoneId] = useState('');
  const [editCommission, setEditCommission] = useState(10);
  const [editBalanceCredit, setEditBalanceCredit] = useState(0);
  const [editDailyGoal, setEditDailyGoal] = useState(15000);
  const [editPermFastSale, setEditPermFastSale] = useState(true);
  const [editPermPrintThermal, setEditPermPrintThermal] = useState(true);
  const [editPermShareWhatsapp, setEditPermShareWhatsapp] = useState(true);
  const [editPermSosRequest, setEditPermSosRequest] = useState(true);

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
      s.phone.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
      (s.email || '').toLowerCase().includes(searchQuery.trim().toLowerCase());
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
    if (!newName.trim() || !newEmail.trim() || !newPassword.trim()) return;
    const targetZone = zones.find((z) => z.id === newZoneId || z.name === newZoneId) || zones[0];
    addStaff({
      name: newName.trim(),
      email: newEmail.trim().toLowerCase(),
      password: newPassword.trim(),
      phone: newPhone.trim(),
      zoneId: targetZone?.id || 'Zone Principale',
      zoneName: targetZone?.name || 'Zone Principale',
      commissionRate: Number(newCommission),
      balanceCredit: Number(newInitialCredit),
      dailyGoal: Number(newDailyGoal),
      active: true,
      lastActive: 'Compte actif',
      permissions: {
        fastSale: permFastSale,
        printThermal: permPrintThermal,
        shareWhatsapp: permShareWhatsapp,
        sosRequest: permSosRequest,
      },
    });
    setAddModalOpen(false);
    setNewName('');
    setNewEmail('');
    setNewPassword('');
  };

  const openEditModal = (member: StaffItem) => {
    setEditingStaff(member);
    setEditName(member.name);
    setEditEmail(member.email || '');
    setEditPassword(member.password || '1234');
    setEditPhone(member.phone);
    setEditZoneId(member.zoneId || member.zoneName || 'Zone Principale');
    setEditCommission(member.commissionRate);
    setEditBalanceCredit(member.balanceCredit);
    setEditDailyGoal(member.dailyGoal || 15000);
    setEditPermFastSale(member.permissions?.fastSale ?? true);
    setEditPermPrintThermal(member.permissions?.printThermal ?? true);
    setEditPermShareWhatsapp(member.permissions?.shareWhatsapp ?? true);
    setEditPermSosRequest(member.permissions?.sosRequest ?? true);
  };

  const handleSaveEditStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaff || !editName.trim()) return;
    const targetZone =
      zones.find((z) => z.id === editZoneId || z.name === editZoneId) || zones[0];
    updateStaff({
      ...editingStaff,
      name: editName.trim(),
      email: editEmail.trim().toLowerCase(),
      password: editPassword.trim() || '1234',
      phone: editPhone.trim(),
      zoneId: targetZone?.id || editZoneId || 'Zone Principale',
      zoneName: targetZone?.name || editZoneId || 'Zone Principale',
      commissionRate: Number(editCommission),
      balanceCredit: Number(editBalanceCredit),
      dailyGoal: Number(editDailyGoal),
      permissions: {
        fastSale: editPermFastSale,
        printThermal: editPermPrintThermal,
        shareWhatsapp: editPermShareWhatsapp,
        sosRequest: editPermSosRequest,
      },
    });
    setEditingStaff(null);
  };

  const handleConfirmRecharge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rechargeModalStaffId) return;
    rechargeStaff(rechargeModalStaffId, Number(rechargeAmount));
    setRechargeModalStaffId(null);
  };

  return (
    <div className="space-y-5 pb-12 text-[#1E293B]">
      {/* 1. TOP COMMAND & FILTER BAR */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-2xs">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#008060] mb-1">
            CONTRÔLE D'ACCÈS VENDEURS (RBAC) & TERMINAUX CAISSE POS
          </div>
          <h2 className="text-lg font-bold text-slate-900">
            Gestion des Agents Vendeurs & Comptes POS ({staff.length})
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Créez, modifiez et supervisez les comptes vendeurs autorisés à se connecter sur la Caisse POS.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un vendeur..."
              className="pl-8 pr-3 py-2 rounded bg-[#F8FAFC] border border-slate-300 text-xs text-slate-800 focus:outline-none focus:border-[#008060]"
            />
          </div>

          <select
            value={selectedZoneFilter}
            onChange={(e) => setSelectedZoneFilter(e.target.value)}
            className="px-3 py-2 rounded bg-[#F8FAFC] border border-slate-300 text-xs font-semibold text-slate-700 cursor-pointer"
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
            className="px-4 py-2 rounded bg-[#008060] hover:bg-[#006B50] text-white font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Créer un Profil Vendeur</span>
          </button>
        </div>
      </div>

      {/* 2. KPI SUMMARY STRIP */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-slate-200 p-4 flex items-center justify-between shadow-2xs">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 block">
              Ventes POS du Jour
            </span>
            <span className="text-xl font-black text-slate-900 font-mono mt-1 block">
              {formatMoney(totalTodaySales)}
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[#E6F4F3] text-[#008060] flex items-center justify-center">
            <Smartphone className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-4 flex items-center justify-between shadow-2xs">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 block">
              Crédit POS en Circulation
            </span>
            <span className="text-xl font-black text-slate-900 font-mono mt-1 block">
              {formatMoney(totalCreditInField)}
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[#E6F4F3] text-[#005A5B] flex items-center justify-center">
            <Wallet className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-4 flex items-center justify-between shadow-2xs">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 block">
              Commissions Vendeurs Cumulées
            </span>
            <span className="text-xl font-black text-[#0066CC] font-mono mt-1 block">
              {formatMoney(totalCommissions)}
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-sky-50 text-[#0066CC] flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
      </div>

      {pendingSosAlerts.length > 0 && (
        <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs">
            <strong className="text-rose-800 block text-sm">
              Demande SOS Crédit : {pendingSosAlerts[0].staffName}
            </strong>
            <span className="text-rose-700">
              Montant sollicité : {formatMoney(pendingSosAlerts[0].amount)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => clearSosAlert(pendingSosAlerts[0].id)}
              className="px-3.5 py-1.5 rounded bg-[#008060] text-white font-semibold text-xs cursor-pointer"
            >
              Traiter la demande
            </button>
          </div>
        </div>
      )}

      {/* 3. LISTE DES VENDEURS (AVEC BOUTON MODIFIER / ÉDITER COMPLET) */}
      {filteredStaff.length === 0 ? (
        <div className="bg-white rounded-lg border border-slate-200 p-10 text-center space-y-3">
          <div className="w-12 h-12 rounded-lg bg-[#F4F7FA] border border-slate-200 flex items-center justify-center mx-auto text-slate-400">
            <Smartphone className="w-6 h-6" />
          </div>
          <div className="text-sm font-bold text-slate-800">Aucun agent vendeur enregistré</div>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Créez un profil vendeur avec son email et son mot de passe pour lui permettre de se connecter à la Caisse POS.
          </p>
          <button
            onClick={() => setAddModalOpen(true)}
            className="px-4 py-2 rounded bg-[#008060] text-white font-semibold text-xs inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Créer mon premier vendeur POS</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredStaff.map((member) => {
            const commissionsTotal = Math.round((member.totalSales * member.commissionRate) / 100);
            const goalPercent = Math.min(
              100,
              Math.round((member.todaySales / Math.max(1, member.dailyGoal || 15000)) * 100)
            );

            return (
              <div
                key={member.id}
                className="bg-white rounded-lg border border-slate-200 p-5 space-y-4 shadow-2xs"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900">{member.name}</h3>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          member.active
                            ? 'bg-[#E6F4F3] text-[#008060]'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {member.active ? 'Actif' : 'Suspendu'}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-1.5">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#007A78]" />
                        {member.zoneName}
                      </span>
                      <span className="flex items-center gap-1 font-mono">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        {member.phone}
                      </span>
                      {member.email && (
                        <span className="flex items-center gap-1 font-mono text-[#005A5B]">
                          <Mail className="w-3.5 h-3.5 text-[#008060]" />
                          {member.email}
                        </span>
                      )}
                      <span className="flex items-center gap-1 font-mono text-slate-600">
                        <Lock className="w-3.5 h-3.5 text-slate-400" />
                        PIN/Pass: <strong>{member.password || '1234'}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Actions rapides : Modifier, Activer/Suspendre, Supprimer */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEditModal(member)}
                      title="Modifier les informations du vendeur"
                      className="px-2.5 py-1.5 rounded bg-[#F4F7FA] hover:bg-[#E6F4F3] border border-slate-200 text-xs font-semibold text-[#005A5B] flex items-center gap-1 transition cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-[#008060]" />
                      <span>Modifier</span>
                    </button>
                    <button
                      onClick={() => toggleStaffStatus(member.id)}
                      title={member.active ? 'Suspendre le vendeur' : 'Activer le vendeur'}
                      className="p-1.5 rounded bg-[#F4F7FA] hover:bg-slate-200 border border-slate-200 text-slate-600 cursor-pointer"
                    >
                      <Power className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteStaff(member.id)}
                      title="Supprimer ce vendeur"
                      className="p-1.5 rounded bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Chiffres clés du vendeur */}
                <div className="grid grid-cols-4 gap-2 p-3 rounded-lg bg-[#F8FAFC] border border-slate-200 text-center font-mono">
                  <div>
                    <span className="text-[10px] font-sans text-slate-400 block">Crédit POS</span>
                    <span className="font-bold text-slate-800 text-xs mt-0.5 block">
                      {formatMoney(member.balanceCredit)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-sans text-slate-400 block">Ventes Jour</span>
                    <span className="font-bold text-[#008060] text-xs mt-0.5 block">
                      {formatMoney(member.todaySales)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-sans text-slate-400 block">Commission</span>
                    <span className="font-bold text-slate-800 text-xs mt-0.5 block">
                      {member.commissionRate}%
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-sans text-slate-400 block">Gain Vendeur</span>
                    <span className="font-bold text-[#0066CC] text-xs mt-0.5 block">
                      {formatMoney(commissionsTotal)}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
                  <span className="flex items-center gap-1 text-[#005A5B] font-medium">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#008060]" />
                    Rôle Supabase : Vendeur POS (vendor)
                  </span>
                  <span className="font-mono">
                    Objectif : {goalPercent}% ({formatMoney(member.todaySales)} /{' '}
                    {formatMoney(member.dailyGoal || 15000)})
                  </span>
                </div>

                <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                  <div
                    className="h-full bg-[#008060] transition-all duration-300"
                    style={{ width: `${goalPercent}%` }}
                  />
                </div>

                <div className="flex items-center justify-between gap-2 pt-1">
                  <button
                    onClick={() => openEditModal(member)}
                    className="px-3.5 py-2 rounded bg-[#F4F7FA] hover:bg-slate-200 border border-slate-300 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-[#007A78]" />
                    <span>Éditer Profil & Accès</span>
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
      )}

      {/* MODALE D'ÉDITION D'UN VENDEUR EXISTANT (POINT 2 DE L'AUDIT) */}
      {editingStaff && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/45 flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setEditingStaff(null)}
        >
          <div
            className="w-full max-w-lg bg-white rounded-lg border border-slate-200 shadow-xl overflow-hidden text-slate-800 my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 bg-[#005A5B] text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold">Modifier le Profil Vendeur : {editingStaff.name}</h3>
                <p className="text-[11px] text-teal-100">
                  Mettez à jour les identifiants de connexion POS, la zone, la commission ou le solde.
                </p>
              </div>
              <button
                onClick={() => setEditingStaff(null)}
                className="text-teal-100 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditStaff} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nom complet du vendeur *
                  </label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-2 rounded bg-[#F8FAFC] border border-slate-300 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Téléphone Mobile / WhatsApp *
                  </label>
                  <input
                    type="text"
                    required
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded bg-[#F8FAFC] border border-slate-300 font-mono text-slate-800"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-[#F8FAFC] border border-slate-200 space-y-3">
                <div className="text-[11px] font-bold text-[#005A5B] uppercase tracking-wider flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#008060]" />
                  <span>Identifiants de Connexion Caisse POS</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Email / Identifiant POS *
                    </label>
                    <input
                      type="text"
                      required
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      placeholder="vendeur@domaine.ci"
                      className="w-full px-3 py-2 rounded bg-white border border-slate-300 text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Mot de passe / Code PIN *
                    </label>
                    <input
                      type="text"
                      required
                      value={editPassword}
                      onChange={(e) => setEditPassword(e.target.value)}
                      className="w-full px-3 py-2 rounded bg-white border border-slate-300 font-mono text-slate-800"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Zone / Site d'affectation :
                  </label>
                  <select
                    value={editZoneId}
                    onChange={(e) => setEditZoneId(e.target.value)}
                    className="w-full px-3 py-2 rounded bg-[#F8FAFC] border border-slate-300 text-slate-800 cursor-pointer"
                  >
                    <option value="Zone Principale">Zone Principale</option>
                    {zones.map((z) => (
                      <option key={z.id} value={z.id}>
                        {z.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Commission vendeur (%) :
                  </label>
                  <div className="relative">
                    <Percent className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      min={0}
                      max={50}
                      value={editCommission}
                      onChange={(e) => setEditCommission(Number(e.target.value))}
                      className="w-full pl-8 pr-3 py-2 rounded bg-[#F8FAFC] border border-slate-300 font-mono text-slate-800"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Solde Crédit POS (FCFA) :
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={500}
                    value={editBalanceCredit}
                    onChange={(e) => setEditBalanceCredit(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded bg-[#F8FAFC] border border-slate-300 font-mono text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Objectif journalier (FCFA) :
                  </label>
                  <input
                    type="number"
                    min={1000}
                    step={1000}
                    value={editDailyGoal}
                    onChange={(e) => setEditDailyGoal(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded bg-[#F8FAFC] border border-slate-300 font-mono text-slate-800"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-[#F8FAFC] border border-slate-200 space-y-2">
                <div className="text-[11px] font-bold text-slate-700">
                  Permissions autorisées sur la Caisse POS :
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editPermFastSale}
                      onChange={(e) => setEditPermFastSale(e.target.checked)}
                    />
                    <span>Vente Éclair 1-Clic</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editPermPrintThermal}
                      onChange={(e) => setEditPermPrintThermal(e.target.checked)}
                    />
                    <span>Impression Thermique</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editPermShareWhatsapp}
                      onChange={(e) => setEditPermShareWhatsapp(e.target.checked)}
                    />
                    <span>Partage WhatsApp / SMS</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editPermSosRequest}
                      onChange={(e) => setEditPermSosRequest(e.target.checked)}
                    />
                    <span>Demande SOS Crédit</span>
                  </label>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingStaff(null)}
                  className="px-4 py-2 rounded bg-slate-100 text-slate-700 font-semibold cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-[#008060] hover:bg-[#006B50] text-white font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Enregistrer les modifications</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Recharge Crédit */}
      {rechargeModalStaffId && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/45 flex items-center justify-center p-4"
          onClick={() => setRechargeModalStaffId(null)}
        >
          <div
            className="w-full max-w-md bg-white rounded-lg border border-slate-200 shadow-xl overflow-hidden text-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 bg-[#005A5B] text-white flex items-center justify-between">
              <h3 className="text-sm font-bold">Recharger le Crédit POS Vendeur</h3>
              <button
                onClick={() => setRechargeModalStaffId(null)}
                className="text-teal-100 hover:text-white cursor-pointer"
              >
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

      {/* MODALE CRÉATION DE PROFIL VENDEUR PAR L'ADMINISTRATEUR */}
      {addModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/45 flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setAddModalOpen(false)}
        >
          <div
            className="w-full max-w-lg bg-white rounded-lg border border-slate-200 shadow-xl overflow-hidden text-slate-800 my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 bg-[#005A5B] text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold">Créer un Profil Vendeur (Accès Caisse POS)</h3>
                <p className="text-[11px] text-teal-100">
                  Ce compte sera enregistré avec le rôle « vendor » pour la Caisse POS.
                </p>
              </div>
              <button
                onClick={() => setAddModalOpen(false)}
                className="text-teal-100 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateStaff} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nom complet du vendeur *
                  </label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Ex: Koné Ibrahim"
                    className="w-full px-3 py-2 rounded bg-[#F8FAFC] border border-slate-300 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Téléphone Mobile / WhatsApp *
                  </label>
                  <input
                    type="text"
                    required
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded bg-[#F8FAFC] border border-slate-300 font-mono text-slate-800"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-[#F8FAFC] border border-slate-200 space-y-3">
                <div className="text-[11px] font-bold text-[#005A5B] uppercase tracking-wider flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#008060]" />
                  <span>Identifiants de Connexion Caisse POS</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Email de connexion *
                    </label>
                    <input
                      type="email"
                      required
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="vendeur@domaine.ci"
                      className="w-full px-3 py-2 rounded bg-white border border-slate-300 text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Mot de passe Vendeur *
                    </label>
                    <input
                      type="text"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Mot de passe ou PIN"
                      className="w-full px-3 py-2 rounded bg-white border border-slate-300 font-mono text-slate-800"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Zone / Site d'affectation :
                  </label>
                  <select
                    value={newZoneId}
                    onChange={(e) => setNewZoneId(e.target.value)}
                    className="w-full px-3 py-2 rounded bg-[#F8FAFC] border border-slate-300 text-slate-800 cursor-pointer"
                  >
                    <option value="Zone Principale">Zone Principale</option>
                    {zones.map((z) => (
                      <option key={z.id} value={z.id}>
                        {z.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Commission vendeur (%) :
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={50}
                    value={newCommission}
                    onChange={(e) => setNewCommission(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded bg-[#F8FAFC] border border-slate-300 font-mono text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Crédit POS initial (FCFA) :
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    value={newInitialCredit}
                    onChange={(e) => setNewInitialCredit(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded bg-[#F8FAFC] border border-slate-300 font-mono text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Objectif journalier (FCFA) :
                  </label>
                  <input
                    type="number"
                    min={1000}
                    step={1000}
                    value={newDailyGoal}
                    onChange={(e) => setNewDailyGoal(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded bg-[#F8FAFC] border border-slate-300 font-mono text-slate-800"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-[#F8FAFC] border border-slate-200 space-y-2">
                <div className="text-[11px] font-bold text-slate-700">
                  Permissions autorisées sur la Caisse POS :
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permFastSale}
                      onChange={(e) => setPermFastSale(e.target.checked)}
                    />
                    <span>Vente Éclair 1-Clic</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permPrintThermal}
                      onChange={(e) => setPermPrintThermal(e.target.checked)}
                    />
                    <span>Impression Thermique</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permShareWhatsapp}
                      onChange={(e) => setPermShareWhatsapp(e.target.checked)}
                    />
                    <span>Partage WhatsApp / SMS</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permSosRequest}
                      onChange={(e) => setPermSosRequest(e.target.checked)}
                    />
                    <span>Demande SOS Crédit</span>
                  </label>
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
                  className="px-4 py-2 rounded bg-[#008060] hover:bg-[#006B50] text-white font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Créer le Compte Vendeur</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
