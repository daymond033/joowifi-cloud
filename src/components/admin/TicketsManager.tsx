import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { TicketItem, TicketStatus, TicketQueuedForfait } from '../../types';
import {
  Ticket,
  Plus,
  Search,
  Printer,
  Download,
  Filter,
  CheckCircle2,
  Clock,
  Smartphone,
  FileText,
  X,
  QrCode,
  Eye,
  Lock,
  Unlock,
  Trash2,
  ChevronDown,
  Calendar,
  Layers,
  Sparkles,
  Shield,
  Check,
  Edit2,
  Share2,
  Copy,
  RotateCcw,
} from 'lucide-react';

export const TicketsManager: React.FC = () => {
  const {
    tickets,
    forfaits,
    staff,
    generateTicketsBatch,
    updateTicket,
    deleteTicket,
    addCustomTicket,
    formatMoney,
  } = useApp();

  // Navigation Tab State
  const [activeTab, setActiveTab] = useState<'list' | 'batches' | 'style'>('list');

  // Counters ribbon visibility
  const [showOverviewRibbon, setShowOverviewRibbon] = useState(true);

  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [forfaitFilter, setForfaitFilter] = useState<string>('all');
  const [itemsPerPage, setItemsPerPage] = useState<number>(50);

  // Selection state
  const [selectedTicketIds, setSelectedTicketIds] = useState<string[]>([]);

  // Modals state
  const [generateModalOpen, setGenerateModalOpen] = useState(false);
  const [clientAccountModalOpen, setClientAccountModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<TicketItem | null>(null);
  const [printSampleModalOpen, setPrintSampleModalOpen] = useState(false);

  // Export / Print Dropdown
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);

  // Batch Generation Form State
  const [genForfaitId, setGenForfaitId] = useState<string>(forfaits[0]?.id || '');
  const [genCodeType, setGenCodeType] = useState<'auto' | 'prefix' | 'free'>('auto');
  const [genPrefix, setGenPrefix] = useState<string>('JW');
  const [genQuantity, setGenQuantity] = useState<number>(10);
  const [genCodeLength, setGenCodeLength] = useState<number>(8);
  const [genCase, setGenCase] = useState<'upper' | 'lower' | 'mixed'>('upper');
  const [genCustomPrice, setGenCustomPrice] = useState<string>('');
  const [genChannel, setGenChannel] = useState<'stock' | 'papier'>('stock');

  // Client Account Form State
  const [clientForfaitId, setClientForfaitId] = useState<string>(forfaits[0]?.id || '');
  const [clientUsername, setClientUsername] = useState<string>('');
  const [clientCase, setClientCase] = useState<'upper' | 'lower' | 'mixed'>('upper');
  const [clientEnablePassword, setClientEnablePassword] = useState<boolean>(false);
  const [clientPassword, setClientPassword] = useState<string>('');
  const [clientCustomPrice, setClientCustomPrice] = useState<string>('');

  // Ticket Detail / Edit Form State
  const [detailCode, setDetailCode] = useState('');
  const [detailPassword, setDetailPassword] = useState('');
  const [detailForfaitId, setDetailForfaitId] = useState('');
  const [detailPrice, setDetailPrice] = useState<number>(0);
  const [detailPhone, setDetailPhone] = useState('');
  const [detailDaysToAdd, setDetailDaysToAdd] = useState<number>(7);
  const [detailExpiresAt, setDetailExpiresAt] = useState('');
  const [detailQueuedForfaits, setDetailQueuedForfaits] = useState<TicketQueuedForfait[]>([]);
  const [advanceForfaitId, setAdvanceForfaitId] = useState<string>(forfaits[0]?.id || '');
  const [advanceCustomPrice, setAdvanceCustomPrice] = useState<string>('');

  // Print & Style Template State
  const [ticketNetworkName, setTicketNetworkName] = useState('JOOWIFI ZONE 1');
  const [ticketPhoneSupport, setTicketPhoneSupport] = useState('+225 01 00 44 38 39');
  const [ticketWhatsappSupport, setTicketWhatsappSupport] = useState('+225 01 00 44 38 39');
  const [selectedTemplateGabarit, setSelectedTemplateGabarit] = useState<
    'eco30' | 'std24' | 'badge20' | 'posThermal'
  >('eco30');
  const [customHtmlSnippet, setCustomHtmlSnippet] = useState(
    `<div class="ticket-box">\n  <h3>{{network_name}}</h3>\n  <p>Forfait: {{forfait_name}}</p>\n  <h1>{{code}}</h1>\n  <div class="qr">{{qr_code}}</div>\n  <p>Prix: {{price}} FCFA</p>\n  <small>Support: {{phone}}</small>\n</div>`
  );

  // Compute overview numbers
  const totalTickets = tickets.length;
  const inStockCount = tickets.filter((t) => t.status === 'stock').length;
  const vendorCount = tickets.filter((t) => t.status === 'vendeur').length;
  const paperCount = tickets.filter((t) => t.status === 'papier').length;
  const soldAllChannels = tickets.filter(
    (t) => t.status === 'vendeur' || t.status === 'papier' || t.status === 'actif' || t.status === 'expire'
  ).length;
  const activeCount = tickets.filter((t) => t.status === 'actif').length;
  const expiredCount = tickets.filter((t) => t.status === 'expire').length;

  // Filtered tickets logic
  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      // Search
      const term = searchTerm.toLowerCase().trim();
      const matchSearch =
        !term ||
        t.code.toLowerCase().includes(term) ||
        (t.pin && t.pin.includes(term)) ||
        (t.customerPhone && t.customerPhone.includes(term));

      // Forfait filter
      const matchForfait = forfaitFilter === 'all' || t.forfaitId === forfaitFilter;

      // Status filter
      let matchStatus = true;
      if (statusFilter === 'disponible') {
        matchStatus = t.status === 'stock';
      } else if (statusFilter === 'vendeur') {
        matchStatus = t.status === 'vendeur';
      } else if (statusFilter === 'papier') {
        matchStatus = t.status === 'papier';
      } else if (statusFilter === 'vendus') {
        matchStatus =
          t.status === 'vendeur' || t.status === 'papier' || t.status === 'actif' || t.status === 'expire';
      } else if (statusFilter === 'actif') {
        matchStatus = t.status === 'actif';
      } else if (statusFilter === 'expire') {
        matchStatus = t.status === 'expire';
      }

      return matchSearch && matchForfait && matchStatus;
    });
  }, [tickets, searchTerm, forfaitFilter, statusFilter]);

  // Grouped batches for "GESTION DES LOTS" tab
  const batchesList = useMemo(() => {
    const map = new Map<
      string,
      {
        batchId: string;
        date: string;
        forfaitName: string;
        price: number;
        count: number;
        channel: string;
        zoneName: string;
      }
    >();

    tickets.forEach((t) => {
      const bId = t.batchId || 'LOT-INITIAL';
      if (!map.has(bId)) {
        map.set(bId, {
          batchId: bId,
          date: t.createdAt,
          forfaitName: t.forfaitName,
          price: t.price,
          count: 1,
          channel: t.status === 'papier' ? 'Vente Papier' : 'Stock Cloud',
          zoneName: t.zoneName || 'Zone Principale',
        });
      } else {
        const item = map.get(bId)!;
        item.count += 1;
      }
    });

    return Array.from(map.values());
  }, [tickets]);

  // Handle select all
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedTicketIds(filteredTickets.map((t) => t.id));
    } else {
      setSelectedTicketIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedTicketIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Open Detail Modal
  const openDetailModal = (ticket: TicketItem) => {
    setSelectedTicket(ticket);
    setDetailCode(ticket.code);
    setDetailPassword(ticket.password || '');
    setDetailForfaitId(ticket.forfaitId);
    setDetailPrice(ticket.price);
    setDetailPhone(ticket.customerPhone || '');
    setDetailExpiresAt(ticket.expiresAt || '');
    setDetailQueuedForfaits(ticket.queuedForfaits || []);
    setDetailModalOpen(true);
  };

  // Save Detail Edits
  const handleSaveDetail = () => {
    if (!selectedTicket) return;
    const targetForfait = forfaits.find((f) => f.id === detailForfaitId);

    const updated: TicketItem = {
      ...selectedTicket,
      code: detailCode,
      password: detailPassword || undefined,
      forfaitId: detailForfaitId,
      forfaitName: targetForfait ? targetForfait.name : selectedTicket.forfaitName,
      price: detailPrice,
      customerPhone: detailPhone || undefined,
      expiresAt: detailExpiresAt || undefined,
      queuedForfaits: detailQueuedForfaits,
    };

    updateTicket(updated);
    setDetailModalOpen(false);
  };

  // Toggle block/unblock single ticket
  const handleToggleBlock = (ticket: TicketItem) => {
    const updated: TicketItem = {
      ...ticket,
      status: ticket.status === 'bloque' ? 'stock' : 'bloque',
    };
    updateTicket(updated);
    if (selectedTicket && selectedTicket.id === ticket.id) {
      setSelectedTicket(updated);
    }
  };

  // Add queued advance forfait in detail modal
  const handleAddQueuedForfait = () => {
    const target = forfaits.find((f) => f.id === advanceForfaitId);
    if (!target) return;

    const newQueued: TicketQueuedForfait = {
      id: `qf-${Date.now()}`,
      forfaitId: target.id,
      forfaitName: target.name,
      price: advanceCustomPrice ? Number(advanceCustomPrice) : target.price,
      addedAt: new Date().toISOString(),
    };

    setDetailQueuedForfaits((prev) => [...prev, newQueued]);
    setAdvanceCustomPrice('');
  };

  // Remove queued advance forfait
  const handleRemoveQueuedForfait = (id: string) => {
    setDetailQueuedForfaits((prev) => prev.filter((q) => q.id !== id));
  };

  // Generate Batch Submit
  const handleGenerateBatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetForfait = forfaits.find((f) => f.id === genForfaitId);
    if (!targetForfait) return;

    const newTickets: TicketItem[] = [];
    const batchId = `LOT-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(
      100 + Math.random() * 900
    )}`;

    for (let i = 0; i < genQuantity; i++) {
      let code = '';
      if (genCodeType === 'prefix') {
        const rnd = Math.floor(1000 + Math.random() * 9000);
        code = `${genPrefix}-${rnd}`;
      } else {
        // Alphanumeric code
        const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
        for (let c = 0; c < genCodeLength; c++) {
          code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
      }

      if (genCase === 'lower') code = code.toLowerCase();
      if (genCase === 'upper') code = code.toUpperCase();

      newTickets.push({
        id: `t-lot-${Date.now()}-${i}`,
        code,
        forfaitId: targetForfait.id,
        forfaitName: targetForfait.name,
        price: genCustomPrice ? Number(genCustomPrice) : targetForfait.price,
        duration: `${targetForfait.durationHours}h`,
        status: genChannel,
        createdAt: new Date().toISOString(),
        zoneName: 'Zone Principale',
        batchId,
      });
    }

    newTickets.forEach((t) => addCustomTicket(t));
    setGenerateModalOpen(false);
  };

  // Create Client Account Submit
  const handleCreateClientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetForfait = forfaits.find((f) => f.id === clientForfaitId);
    if (!targetForfait || !clientUsername.trim()) return;

    let username = clientUsername.trim();
    if (clientCase === 'lower') username = username.toLowerCase();
    if (clientCase === 'upper') username = username.toUpperCase();

    const clientTicket: TicketItem = {
      id: `t-client-${Date.now()}`,
      code: username,
      password: clientEnablePassword ? clientPassword || username : undefined,
      forfaitId: targetForfait.id,
      forfaitName: targetForfait.name,
      price: clientCustomPrice ? Number(clientCustomPrice) : targetForfait.price,
      duration: `${targetForfait.durationHours}h`,
      status: 'stock',
      createdAt: new Date().toISOString(),
      zoneName: 'Zone Client',
    };

    addCustomTicket(clientTicket);
    setClientAccountModalOpen(false);
    setClientUsername('');
    setClientPassword('');
  };

  // Export CSV
  const handleExportCSV = (mode: 'full' | 'userman' = 'full') => {
    const listToExport =
      selectedTicketIds.length > 0
        ? tickets.filter((t) => selectedTicketIds.includes(t.id))
        : filteredTickets;

    let csvContent = '';
    if (mode === 'userman') {
      csvContent = 'username,password,profile\n';
      listToExport.forEach((t) => {
        csvContent += `"${t.code}","${t.password || t.code}","${t.forfaitName}"\n`;
      });
    } else {
      csvContent = 'ID,CODE,FORFAIT,PRIX_FCFA,DUREE,STATUT,CREE_LE,EXPIRE_LE,MAC\n';
      listToExport.forEach((t) => {
        csvContent += `"${t.id}","${t.code}","${t.forfaitName}",${t.price},"${t.duration}","${
          t.status
        }","${t.createdAt}","${t.expiresAt || ''}","${t.macAddress || ''}"\n`;
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `joowifi-tickets-${mode}-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setExportDropdownOpen(false);
  };

  // Status Badge Helper
  const renderStatusBadge = (status: TicketStatus) => {
    switch (status) {
      case 'stock':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-mono tracking-wider">
            DISPONIBLE
          </span>
        );
      case 'actif':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30 font-mono tracking-wider">
            ACTIF
          </span>
        );
      case 'vendeur':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 font-mono tracking-wider">
            VENTE VENDEUR
          </span>
        );
      case 'papier':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-500/15 text-purple-400 border border-purple-500/30 font-mono tracking-wider">
            VENTE PAPIER
          </span>
        );
      case 'bloque':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30 font-mono tracking-wider">
            BLOQUÉ
          </span>
        );
      case 'expire':
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700 font-mono tracking-wider">
            EXPIRÉ
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* =========================================================================
          1. EN-TÊTE & BARRE D'ACTIONS PRINCIPALES
      ========================================================================= */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div className="space-y-1">
          {/* Fil d'ariane */}
          <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500 font-mono flex items-center gap-1.5">
            <span>Console</span>
            <span>/</span>
            <span className="text-amber-500">Tickets</span>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-500 flex items-center justify-center">
              <Ticket className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-black text-white font-sans tracking-tight">
              Tickets d'accès WiFi
            </h1>
          </div>

          <p className="text-xs text-slate-400">
            Générez, gérez et surveillez vos tickets d'accès WiFi en temps réel.
          </p>
        </div>

        {/* Action Buttons Top Right */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Menu déroulant "Exporter / Imprimer" */}
          <div className="relative">
            <button
              onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
              className="px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-sm"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>Exporter / Imprimer</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {exportDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-56 rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl py-1.5 text-xs z-50 divide-y divide-slate-800/80">
                <div className="py-1">
                  <button
                    onClick={() => handleExportCSV('full')}
                    className="w-full text-left px-3.5 py-2 hover:bg-slate-900 text-slate-200 flex items-center gap-2"
                  >
                    <Download className="w-3.5 h-3.5 text-amber-400" />
                    <span>Export CSV Complet</span>
                  </button>
                  <button
                    onClick={() => handleExportCSV('userman')}
                    className="w-full text-left px-3.5 py-2 hover:bg-slate-900 text-slate-200 flex items-center gap-2"
                  >
                    <FileText className="w-3.5 h-3.5 text-blue-400" />
                    <span>Format MikroTik User Manager</span>
                  </button>
                </div>
                <div className="py-1">
                  <button
                    onClick={() => {
                      setExportDropdownOpen(false);
                      setActiveTab('style');
                      window.print();
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-slate-900 text-slate-200 flex items-center gap-2"
                  >
                    <Printer className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Imprimer Planche PDF A4</span>
                  </button>
                  <button
                    onClick={() => {
                      setExportDropdownOpen(false);
                      setSelectedTemplateGabarit('posThermal');
                      setActiveTab('style');
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-slate-900 text-slate-200 flex items-center gap-2"
                  >
                    <Smartphone className="w-3.5 h-3.5 text-purple-400" />
                    <span>Impression Thermique POS</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Bouton secondaire discret : + Créer un Compte Client */}
          <button
            onClick={() => setClientAccountModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 text-slate-400" />
            <span>Créer un Compte Client</span>
          </button>

          {/* Bouton principal : + Générer des Tickets (Lot) */}
          <button
            onClick={() => setGenerateModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 flex items-center gap-1.5 transition cursor-pointer active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Générer des Tickets (Lot)</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          2. NAVIGATION PAR ONGLETS (TAB NAVIGATION)
      ========================================================================= */}
      <div className="flex items-center gap-6 border-b border-slate-800/80 text-xs font-bold">
        <button
          onClick={() => setActiveTab('list')}
          className={`pb-3 transition cursor-pointer flex items-center gap-2 relative ${
            activeTab === 'list' ? 'text-amber-400 font-extrabold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>LISTE DES TICKETS</span>
          {activeTab === 'list' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('batches')}
          className={`pb-3 transition cursor-pointer flex items-center gap-2 relative ${
            activeTab === 'batches'
              ? 'text-amber-400 font-extrabold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>GESTION DES LOTS</span>
          {activeTab === 'batches' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('style')}
          className={`pb-3 transition cursor-pointer flex items-center gap-2 relative ${
            activeTab === 'style'
              ? 'text-amber-400 font-extrabold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>IMPRESSION & STYLE</span>
          {activeTab === 'style' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full" />
          )}
        </button>
      </div>

      {/* =========================================================================
          3. CONTENU ONGLET 1 : LISTE DES TICKETS
      ========================================================================= */}
      {activeTab === 'list' && (
        <div className="space-y-5">
          {/* 3.1 Ruban de compteurs "VUE D'ENSEMBLE" masquable */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Vue d'ensemble
              </span>
              <button
                onClick={() => setShowOverviewRibbon(!showOverviewRibbon)}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition"
              >
                <span>{showOverviewRibbon ? 'Masquer' : 'Afficher'}</span>
              </button>
            </div>

            {showOverviewRibbon && (
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
                {/* Tickets Générés */}
                <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase font-semibold">
                    <span>Générés</span>
                    <Ticket className="w-3.5 h-3.5 text-amber-500" />
                  </div>
                  <div className="text-xl font-black text-white font-mono tabular-nums">
                    {totalTickets}
                  </div>
                </div>

                {/* En Stock */}
                <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase font-semibold">
                    <span>En Stock</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <div className="text-xl font-black text-emerald-400 font-mono tabular-nums">
                    {inStockCount}
                  </div>
                </div>

                {/* Vente Vendeur */}
                <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase font-semibold">
                    <span>Vendeur</span>
                    <Shield className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <div className="text-xl font-black text-white font-mono tabular-nums">
                    {vendorCount}
                  </div>
                </div>

                {/* Vente Papier */}
                <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase font-semibold">
                    <span>Papier</span>
                    <Calendar className="w-3.5 h-3.5 text-purple-400" />
                  </div>
                  <div className="text-xl font-black text-white font-mono tabular-nums">
                    {paperCount}
                  </div>
                </div>

                {/* Vendus (tous canaux) */}
                <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase font-semibold">
                    <span>Vendus</span>
                    <Shield className="w-3.5 h-3.5 text-blue-400" />
                  </div>
                  <div className="text-xl font-black text-white font-mono tabular-nums">
                    {soldAllChannels}
                  </div>
                </div>

                {/* Actif */}
                <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase font-semibold">
                    <span>Actif</span>
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  </div>
                  <div className="text-xl font-black text-cyan-400 font-mono tabular-nums">
                    {activeCount}
                  </div>
                </div>

                {/* Expiré */}
                <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase font-semibold">
                    <span>Expiré</span>
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                  </div>
                  <div className="text-xl font-black text-slate-400 font-mono tabular-nums">
                    {expiredCount}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 3.2 Barre d'outils de recherche & filtres rapides */}
          <div className="p-4 rounded-3xl bg-slate-950/80 border border-white/[0.08] space-y-4">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
              {/* Search input + button */}
              <div className="flex items-center gap-2 flex-1 max-w-md">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Code ou numéro de téléphone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
                <button
                  onClick={() => setActiveTab('list')}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold text-xs shadow-md transition cursor-pointer"
                >
                  Chercher
                </button>
              </div>

              {/* Selectors: Forfait & Pagination */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <span>Forfait :</span>
                  <select
                    value={forfaitFilter}
                    onChange={(e) => setForfaitFilter(e.target.value)}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none"
                  >
                    <option value="all">Tous les forfaits</option>
                    {forfaits.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name} ({formatMoney(f.price)})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <span>Afficher :</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none"
                  >
                    <option value={20}>20 par page</option>
                    <option value={50}>50 par page</option>
                    <option value={100}>100 par page</option>
                    <option value={1000}>1000 par page</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Quick status filter pills */}
            <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-slate-900 text-xs">
              <span className="text-slate-500 font-semibold text-[11px] mr-1">Statut :</span>
              {[
                { id: 'all', label: 'TOUS' },
                { id: 'disponible', label: 'DISPONIBLE' },
                { id: 'vendeur', label: 'VENTE VENDEUR' },
                { id: 'papier', label: 'VENTE PAPIER' },
                { id: 'vendus', label: 'VENDUS (TOUS CANAUX)' },
                { id: 'actif', label: 'ACTIF' },
                { id: 'expire', label: 'EXPIRÉ' },
              ].map((btn) => (
                <button
                  key={btn.id}
                  onClick={() => setStatusFilter(btn.id)}
                  className={`px-3 py-1 rounded-lg font-bold text-[11px] transition cursor-pointer ${
                    statusFilter === btn.id
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-sm'
                      : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          {/* 3.3 Tableau des Tickets */}
          <div className="rounded-3xl bg-slate-950/80 border border-white/[0.08] overflow-hidden shadow-xl">
            {/* Header toolbar with selection */}
            <div className="p-4 border-b border-slate-800/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={
                    filteredTickets.length > 0 &&
                    selectedTicketIds.length === filteredTickets.length
                  }
                  onChange={handleSelectAll}
                  className="rounded border-slate-700 accent-amber-500 w-4 h-4 cursor-pointer"
                />
                <span className="font-semibold text-slate-300">
                  Tout cocher ({filteredTickets.slice(0, itemsPerPage).length} affichés sur{' '}
                  {filteredTickets.length})
                </span>
              </div>

              {selectedTicketIds.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-amber-400 font-bold">
                    {selectedTicketIds.length} sélectionné(s)
                  </span>
                  <button
                    onClick={() => {
                      selectedTicketIds.forEach((id) => deleteTicket(id));
                      setSelectedTicketIds([]);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-rose-600/20 text-rose-300 hover:bg-rose-600/30 border border-rose-500/30 text-xs font-semibold transition"
                  >
                    Supprimer sélection
                  </button>
                </div>
              )}
            </div>

            {/* Table */}
            {filteredTickets.length === 0 ? (
              <div className="p-16 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mx-auto">
                  <Ticket className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-white">Aucun ticket trouvé</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Commencez par générer des tickets d'accès pour les forfaits de votre choix.
                </p>
                <button
                  onClick={() => setGenerateModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold text-xs shadow-md transition cursor-pointer"
                >
                  + Générer des Tickets
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800/80 bg-slate-900/40 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      <th className="p-3.5 w-10"></th>
                      <th className="p-3.5">CODE TICKET</th>
                      <th className="p-3.5">FORFAIT</th>
                      <th className="p-3.5">PRIX</th>
                      <th className="p-3.5">CRÉÉ LE</th>
                      <th className="p-3.5">ACTIVÉ LE</th>
                      <th className="p-3.5">EXPIRE LE</th>
                      <th className="p-3.5">DONNÉES</th>
                      <th className="p-3.5">MAC</th>
                      <th className="p-3.5">STATUT</th>
                      <th className="p-3.5 text-right">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredTickets.slice(0, itemsPerPage).map((t) => {
                      const isSelected = selectedTicketIds.includes(t.id);
                      return (
                        <tr
                          key={t.id}
                          className={`hover:bg-slate-900/50 transition ${
                            isSelected ? 'bg-amber-500/5' : ''
                          }`}
                        >
                          <td className="p-3.5">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSelect(t.id)}
                              className="rounded border-slate-700 accent-amber-500 w-3.5 h-3.5 cursor-pointer"
                            />
                          </td>
                          <td className="p-3.5 font-mono font-bold text-white text-xs tracking-wide">
                            {t.code}
                          </td>
                          <td className="p-3.5 text-slate-300">{t.forfaitName}</td>
                          <td className="p-3.5 font-mono font-bold text-emerald-400">
                            {formatMoney(t.price)}
                          </td>
                          <td className="p-3.5 font-mono text-slate-400 text-[11px]">
                            {t.createdAt.slice(5, 16).replace('T', ' ')}
                          </td>
                          <td className="p-3.5 font-mono text-slate-400 text-[11px]">
                            {t.activatedAt ? t.activatedAt.slice(5, 16).replace('T', ' ') : '—'}
                          </td>
                          <td className="p-3.5 font-mono text-slate-400 text-[11px]">
                            {t.expiresAt ? t.expiresAt.slice(5, 16).replace('T', ' ') : '—'}
                          </td>
                          <td className="p-3.5 font-mono text-slate-400 text-[11px]">
                            {t.dataConsumedMb ? `${t.dataConsumedMb} Mo` : '—'}
                          </td>
                          <td className="p-3.5 font-mono text-slate-400 text-[11px]">
                            {t.macAddress ? t.macAddress.toUpperCase() : '—'}
                          </td>
                          <td className="p-3.5">{renderStatusBadge(t.status)}</td>
                          <td className="p-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => openDetailModal(t)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                                title="Voir / Éditer"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleToggleBlock(t)}
                                className={`p-1.5 rounded-lg transition ${
                                  t.status === 'bloque'
                                    ? 'text-rose-400 hover:bg-rose-500/20'
                                    : 'text-slate-400 hover:text-amber-400 hover:bg-slate-800'
                                }`}
                                title={t.status === 'bloque' ? 'Débloquer' : 'Bloquer'}
                              >
                                {t.status === 'bloque' ? (
                                  <Unlock className="w-3.5 h-3.5" />
                                ) : (
                                  <Lock className="w-3.5 h-3.5" />
                                )}
                              </button>
                              <button
                                onClick={() => deleteTicket(t.id)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                                title="Supprimer"
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
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          4. CONTENU ONGLET 2 : GESTION DES LOTS
      ========================================================================= */}
      {activeTab === 'batches' && (
        <div className="space-y-5">
          <div className="p-6 rounded-3xl bg-slate-950/80 border border-white/[0.08] space-y-5 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
              <div>
                <h3 className="text-base font-bold text-white">Historique des Lots Générés</h3>
                <p className="text-xs text-slate-400">
                  Consultez vos lots précédents, réimprimez ou téléchargez les exports CSV.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400 font-semibold">Format CSV :</span>
                <select className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs">
                  <option>Complet</option>
                  <option>Simplifié</option>
                  <option>MikroTik User Manager</option>
                </select>
              </div>
            </div>

            {batchesList.length === 0 ? (
              <div className="p-12 text-center text-slate-400 space-y-2">
                <Shield className="w-8 h-8 mx-auto text-slate-600" />
                <p className="text-xs">Aucun lot trouvé. Commencez par générer des tickets en lot.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-800/80">
                {batchesList.map((b) => (
                  <div
                    key={b.batchId}
                    className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-amber-400 text-xs">
                          {b.batchId}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 text-[10px] font-mono">
                          {b.channel}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300">
                        Forfait : <strong>{b.forfaitName}</strong> ({formatMoney(b.price)}) ·{' '}
                        {b.count} tickets générés
                      </p>
                      <span className="text-[10px] text-slate-500 font-mono">
                        Date: {b.date.slice(0, 16).replace('T', ' ')} · {b.zoneName}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleExportCSV('full')}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition"
                      >
                        <Download className="w-3.5 h-3.5 text-amber-400" />
                        <span>CSV</span>
                      </button>
                      <button
                        onClick={() => {
                          setActiveTab('style');
                          window.print();
                        }}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition"
                      >
                        <Printer className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Imprimer</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          5. CONTENU ONGLET 3 : IMPRESSION & STYLE
      ========================================================================= */}
      {activeTab === 'style' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Form: Personnalisation de la Fiche Ticket (7 cols) */}
          <div className="lg:col-span-7 p-6 rounded-3xl bg-slate-950/80 border border-white/[0.08] space-y-5 shadow-xl">
            <div className="space-y-1 border-b border-slate-800/80 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Personnalisation de la Fiche Ticket (HTML/CSS)</span>
              </h3>
              <p className="text-xs text-slate-400">
                Rédigez ou collez votre code de voucher (compatible Mikhmon / User Manager) pour
                personnaliser l'impression.
              </p>
            </div>

            {/* Inputs: Nom Réseau, Téléphone, WhatsApp */}
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">
                  Nom du réseau
                </label>
                <input
                  type="text"
                  value={ticketNetworkName}
                  onChange={(e) => setTicketNetworkName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">
                    Téléphone support
                  </label>
                  <input
                    type="text"
                    value={ticketPhoneSupport}
                    onChange={(e) => setTicketPhoneSupport(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">
                    WhatsApp support
                  </label>
                  <input
                    type="text"
                    value={ticketWhatsappSupport}
                    onChange={(e) => setTicketWhatsappSupport(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* Modèles Prêts à l'emploi (4 cards) */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Modèles prêts à l'emploi
                </span>
                <span className="text-[10px] text-amber-400">Cliquez pour appliquer</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  {
                    id: 'eco30',
                    label: 'Économique (30 / page A4)',
                    desc: 'Recommandé : 3 col x 10 lignes',
                  },
                  {
                    id: 'std24',
                    label: 'Standard (24 / page A4)',
                    desc: '3 col x 8 lignes + grand QR',
                  },
                  {
                    id: 'badge20',
                    label: 'Grand Badge (20 / page A4)',
                    desc: 'Format carte de visite',
                  },
                  {
                    id: 'posThermal',
                    label: 'Caisse Thermique POS',
                    desc: 'Rouleau 80mm/58mm continu',
                  },
                ].map((tpl) => (
                  <button
                    key={tpl.id}
                    onClick={() =>
                      setSelectedTemplateGabarit(tpl.id as typeof selectedTemplateGabarit)
                    }
                    className={`p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                      selectedTemplateGabarit === tpl.id
                        ? 'bg-amber-500/10 border-amber-500 text-white'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="text-xs font-bold">{tpl.label}</div>
                    <div className="text-[10px] text-slate-500 mt-1">{tpl.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Code HTML/CSS */}
            <div className="space-y-1 pt-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                Code HTML/CSS du voucher
              </label>
              <textarea
                rows={5}
                value={customHtmlSnippet}
                onChange={(e) => setCustomHtmlSnippet(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-cyan-300 font-mono text-[11px] focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold text-xs shadow-md transition cursor-pointer flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Lancer l'impression maintenant</span>
              </button>
            </div>
          </div>

          {/* Right Preview: Aperçu Live du Ticket Customisé (5 cols) */}
          <div className="lg:col-span-5 p-6 rounded-3xl bg-slate-950/80 border border-white/[0.08] space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-bold text-white">Aperçu Live du Ticket Customisé</h3>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">RENDU HTML</span>
            </div>

            {/* The Stylized Ticket Render */}
            <div className="flex justify-center py-6">
              <div className="w-64 rounded-2xl bg-white text-slate-950 p-5 shadow-2xl border-2 border-dashed border-slate-400 space-y-3 relative text-center">
                {/* Network Name */}
                <h4 className="text-sm font-black uppercase tracking-wider text-slate-900">
                  {ticketNetworkName}
                </h4>
                <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  PASS ILLIMITÉ 24H
                </div>

                {/* Voucher Code */}
                <div className="py-2 border-y border-dashed border-slate-300">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Code d'accès</div>
                  <div className="text-2xl font-black font-mono tracking-widest text-slate-950">
                    7DCANFJA
                  </div>
                </div>

                {/* QR Code SVG */}
                <div className="flex justify-center py-1">
                  <div className="p-2 bg-slate-100 rounded-xl">
                    <QrCode className="w-20 h-20 text-slate-900" />
                  </div>
                </div>

                {/* Price & Support */}
                <div className="space-y-1">
                  <div className="text-xs font-black font-mono text-emerald-700">
                    PRIX : 500 FCFA
                  </div>
                  <p className="text-[9px] text-slate-500 leading-tight">
                    Connectez-vous et entrez le code.
                    <br />
                    Support : {ticketPhoneSupport}
                  </p>
                </div>
              </div>
            </div>

            {/* Note d'aide sous l'aperçu */}
            <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 space-y-1">
              <strong className="text-white block font-semibold">
                QR code : code seul pour l'instant
              </strong>
              <p className="leading-relaxed">
                Il deviendra un lien de connexion directe dès que vos routeurs auront transmis
                l'adresse de leur hotspot. Le client pourra alors se connecter en scannant, sans
                taper son code.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODALE 1 : GÉNÉRER DES TICKETS (LOT)
      ========================================================================= */}
      {generateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-slate-950 border border-white/[0.1] shadow-2xl overflow-hidden space-y-5 p-6">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <h3 className="text-base font-bold text-white">Générer des Tickets</h3>
              <button
                onClick={() => setGenerateModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleGenerateBatchSubmit} className="space-y-4 text-xs">
              {/* Forfait Cible */}
              <div>
                <label className="font-semibold text-slate-300 block mb-1">
                  POUR QUEL FORFAIT ?
                </label>
                <select
                  value={genForfaitId}
                  onChange={(e) => setGenForfaitId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                >
                  {forfaits.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({formatMoney(f.price)})
                    </option>
                  ))}
                </select>
              </div>

              {/* Type de code */}
              <div>
                <label className="font-semibold text-slate-300 block mb-1">TYPE DE CODE</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['auto', 'prefix', 'free'] as const).map((t) => (
                    <button
                      type="button"
                      key={t}
                      onClick={() => setGenCodeType(t)}
                      className={`py-2 rounded-xl font-bold transition text-center cursor-pointer ${
                        genCodeType === t
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                          : 'bg-slate-900 text-slate-400 border border-slate-800'
                      }`}
                    >
                      {t === 'auto' ? 'Automatique' : t === 'prefix' ? 'Préfixe' : 'Libre'}
                    </button>
                  ))}
                </div>
              </div>

              {genCodeType === 'prefix' && (
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">PRÉFIXE DU CODE</label>
                  <input
                    type="text"
                    value={genPrefix}
                    onChange={(e) => setGenPrefix(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none"
                  />
                </div>
              )}

              {/* Quantité & Longueur */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">
                    QUANTITÉ À GÉNÉRER
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={1000}
                    value={genQuantity}
                    onChange={(e) => setGenQuantity(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">
                    LONGUEUR DU CODE
                  </label>
                  <select
                    value={genCodeLength}
                    onChange={(e) => setGenCodeLength(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none"
                  >
                    <option value={6}>6 caractères</option>
                    <option value={8}>8 caractères</option>
                    <option value={10}>10 caractères</option>
                  </select>
                </div>
              </div>

              {/* Casse des lettres */}
              <div>
                <label className="font-semibold text-slate-300 block mb-1">
                  CASSE DES LETTRES (CODES GÉNÉRÉS)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['upper', 'lower', 'mixed'] as const).map((c) => (
                    <button
                      type="button"
                      key={c}
                      onClick={() => setGenCase(c)}
                      className={`py-2 rounded-xl font-bold transition text-center cursor-pointer ${
                        genCase === c
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                          : 'bg-slate-900 text-slate-400 border border-slate-800'
                      }`}
                    >
                      {c === 'upper' ? 'MAJUSCULES' : c === 'lower' ? 'MINUSCULES' : 'MIXTE'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Prix personnalisé */}
              <div>
                <label className="font-semibold text-slate-300 block mb-1">
                  PRIX DE VENTE PERSONNALISÉ (OPTIONNEL)
                </label>
                <input
                  type="text"
                  placeholder="Laisser vide pour utiliser le prix du forfait"
                  value={genCustomPrice}
                  onChange={(e) => setGenCustomPrice(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none"
                />
              </div>

              {/* Boutons Footer */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setGenerateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-300 transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold transition shadow-md"
                >
                  Générer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODALE 2 : CRÉER UN COMPTE CLIENT
      ========================================================================= */}
      {clientAccountModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-slate-950 border border-white/[0.1] shadow-2xl overflow-hidden space-y-5 p-6">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <h3 className="text-base font-bold text-white">+ Créer un Compte Client</h3>
              <button
                onClick={() => setClientAccountModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateClientSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">
                  SÉLECTIONNER LE FORFAIT
                </label>
                <select
                  value={clientForfaitId}
                  onChange={(e) => setClientForfaitId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none"
                >
                  {forfaits.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({formatMoney(f.price)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">
                  NOM D'UTILISATEUR (IDENTIFIANT)
                </label>
                <input
                  type="text"
                  required
                  placeholder="De 3 à 12 caractères alphanumériques"
                  value={clientUsername}
                  onChange={(e) => setClientUsername(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">
                  CASSE DU NOM D'UTILISATEUR
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['upper', 'lower', 'mixed'] as const).map((c) => (
                    <button
                      type="button"
                      key={c}
                      onClick={() => setClientCase(c)}
                      className={`py-2 rounded-xl font-bold transition text-center cursor-pointer ${
                        clientCase === c
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                          : 'bg-slate-900 text-slate-400 border border-slate-800'
                      }`}
                    >
                      {c === 'upper' ? 'MAJUSCULES' : c === 'lower' ? 'MINUSCULES' : 'MIXTE'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Password checkbox */}
              <div className="space-y-2 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={clientEnablePassword}
                    onChange={(e) => setClientEnablePassword(e.target.checked)}
                    className="rounded border-slate-700 accent-amber-500 w-4 h-4 cursor-pointer"
                  />
                  <span className="text-slate-300">Activer un mot de passe pour ce compte</span>
                </label>

                {clientEnablePassword && (
                  <input
                    type="text"
                    placeholder="Mot de passe personnalisé"
                    value={clientPassword}
                    onChange={(e) => setClientPassword(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none font-mono"
                  />
                )}
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">
                  PRIX DE VENTE PERSONNALISÉ (OPTIONNEL)
                </label>
                <input
                  type="text"
                  placeholder="Laisser vide pour utiliser le prix du forfait"
                  value={clientCustomPrice}
                  onChange={(e) => setClientCustomPrice(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setClientAccountModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-300 transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold transition shadow-md"
                >
                  Créer le Compte
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODALE 3 : DÉTAIL DU TICKET (FICHE COMPLÈTE & PROFILE QUEUE)
      ========================================================================= */}
      {detailModalOpen && selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl bg-slate-950 border border-white/[0.1] shadow-2xl overflow-hidden space-y-5 p-6 my-8">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-amber-500" />
                <h3 className="text-base font-bold text-white">Détail du Ticket</h3>
              </div>
              <div className="flex items-center gap-2">
                {renderStatusBadge(selectedTicket.status)}
                <button
                  onClick={() => setDetailModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Overview info block */}
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                  Code Ticket
                </span>
                <span className="font-mono font-bold text-white text-sm">
                  {selectedTicket.code}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                  Créé le
                </span>
                <span className="font-mono text-slate-300">
                  {selectedTicket.createdAt.slice(0, 16).replace('T', ' ')}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                  Activé le
                </span>
                <span className="font-mono text-slate-300">
                  {selectedTicket.activatedAt
                    ? selectedTicket.activatedAt.slice(0, 16).replace('T', ' ')
                    : 'Pas encore activé'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                  Dernière MAC
                </span>
                <span className="font-mono text-slate-300">
                  {selectedTicket.macAddress || '—'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                  Expire le
                </span>
                <span className="font-mono text-slate-300">{detailExpiresAt || '—'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                  Données consommées
                </span>
                <span className="font-mono text-slate-300">
                  {selectedTicket.dataConsumedMb ? `${selectedTicket.dataConsumedMb} Mo` : '—'}
                </span>
              </div>
            </div>

            {/* Form Edit Fields */}
            <div className="space-y-4 text-xs">
              {/* Forfait */}
              <div>
                <label className="font-semibold text-slate-300 block mb-1">FORFAIT</label>
                <select
                  value={detailForfaitId}
                  onChange={(e) => setDetailForfaitId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none"
                >
                  {forfaits.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({formatMoney(f.price)})
                    </option>
                  ))}
                </select>
              </div>

              {/* Échéance (Prolongation rapide) */}
              <div className="space-y-1.5 p-3 rounded-2xl bg-slate-900/40 border border-slate-800">
                <label className="font-semibold text-slate-300 block">
                  ÉCHÉANCE{' '}
                  <span className="text-[10px] text-slate-500 font-normal">
                    (le tarif et le débit ne changent pas)
                  </span>
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded-xl border border-slate-800">
                    <span className="text-slate-400 text-[11px]">Nb de jours:</span>
                    <input
                      type="number"
                      min={1}
                      max={90}
                      value={detailDaysToAdd}
                      onChange={(e) => setDetailDaysToAdd(Number(e.target.value))}
                      className="w-12 bg-transparent text-white font-mono text-center text-xs focus:outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const newExp = new Date(Date.now() + detailDaysToAdd * 24 * 3600 * 1000);
                      setDetailExpiresAt(newExp.toISOString().slice(0, 16).replace('T', ' '));
                    }}
                    className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold"
                  >
                    Accorder à partir de maintenant
                  </button>
                  {[1, 3, 7, 30].map((d) => (
                    <button
                      type="button"
                      key={d}
                      onClick={() => {
                        const newExp = new Date(Date.now() + d * 24 * 3600 * 1000);
                        setDetailExpiresAt(newExp.toISOString().slice(0, 16).replace('T', ' '));
                      }}
                      className="px-2 py-1 rounded-lg bg-slate-800 text-slate-300 text-[11px] font-mono hover:text-white"
                    >
                      {d}j
                    </button>
                  ))}
                </div>
              </div>

              {/* Code Ticket & Password */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">
                    CODE TICKET{' '}
                    <span className="text-[10px] text-slate-500 font-normal">
                      (modifiable en cours)
                    </span>
                  </label>
                  <input
                    type="text"
                    value={detailCode}
                    onChange={(e) => setDetailCode(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">MOT DE PASSE</label>
                  <input
                    type="text"
                    placeholder="Laisser vide = identique"
                    value={detailPassword}
                    onChange={(e) => setDetailPassword(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono placeholder-slate-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Prix de vente & Téléphone */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">PRIX DE VENTE</label>
                  <input
                    type="number"
                    value={detailPrice}
                    onChange={(e) => setDetailPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">TÉLÉPHONE</label>
                  <input
                    type="text"
                    placeholder="Ex: +225 0707..."
                    value={detailPhone}
                    onChange={(e) => setDetailPhone(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono placeholder-slate-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* File d'attente des forfaits (Profile Queue) */}
              <div className="space-y-3 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                <div className="space-y-0.5">
                  <span className="font-bold text-white flex items-center gap-1.5 text-xs">
                    <Layers className="w-3.5 h-3.5 text-amber-500" />
                    <span>FILE D'ATTENTE DES FORFAITS (PROFILE QUEUE)</span>
                  </span>
                  <p className="text-[10px] text-slate-400">
                    Associez des forfaits supplémentaires. Ils s'activeront automatiquement dès
                    expiration du précédent.
                  </p>
                </div>

                {detailQueuedForfaits.length === 0 ? (
                  <p className="text-center text-[11px] text-slate-500 py-1">
                    Aucun forfait en attente pour ce client.
                  </p>
                ) : (
                  <div className="space-y-1.5">
                    {detailQueuedForfaits.map((q) => (
                      <div
                        key={q.id}
                        className="flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-slate-800 text-[11px]"
                      >
                        <span className="font-semibold text-white">{q.forfaitName}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-emerald-400">{formatMoney(q.price)}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveQueuedForfait(q.id)}
                            className="text-rose-400 hover:text-rose-300 p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
                  <select
                    value={advanceForfaitId}
                    onChange={(e) => setAdvanceForfaitId(e.target.value)}
                    className="flex-1 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-[11px] focus:outline-none"
                  >
                    {forfaits.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name} ({formatMoney(f.price)})
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Prix perso"
                    value={advanceCustomPrice}
                    onChange={(e) => setAdvanceCustomPrice(e.target.value)}
                    className="w-20 px-2 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-[11px] font-mono focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddQueuedForfait}
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold text-[11px] whitespace-nowrap shadow-sm"
                  >
                    + Ajouter
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => handleToggleBlock(selectedTicket)}
                className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition ${
                  selectedTicket.status === 'bloque'
                    ? 'border-emerald-500 text-emerald-400 hover:bg-emerald-500/10'
                    : 'border-rose-500 text-rose-400 hover:bg-rose-500/10'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{selectedTicket.status === 'bloque' ? 'Débloquer' : 'Bloquer'}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setDetailModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-300 text-xs font-semibold transition"
                >
                  Fermer
                </button>
                <button
                  type="button"
                  onClick={handleSaveDetail}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold text-xs shadow-md transition"
                >
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
