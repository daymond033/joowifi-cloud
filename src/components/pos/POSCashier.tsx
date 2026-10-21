import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { TicketItem, ForfaitItem } from '../../types';
import confetti from 'canvas-confetti';
import QRCode from 'qrcode';
import {
  Zap,
  TrendingUp,
  History,
  Printer,
  Share2,
  Sun,
  Moon,
  Maximize2,
  Volume2,
  VolumeX,
  CheckCircle2,
  X,
  Phone,
  Power,
  RotateCcw,
  LifeBuoy,
  Eye,
  Copy,
  Download,
  Calendar,
  Wallet,
  DollarSign,
  Search,
  Check,
  Smartphone,
  ExternalLink,
} from 'lucide-react';

export const POSCashier: React.FC = () => {
  const {
    forfaits,
    staff,
    sellTicketPOS,
    sosRechargeRequest,
    formatMoney,
    setCurrentSpace,
    tickets,
    forceHeartbeatSync,
  } = useApp();

  // Active vendor (defaulting to mamadou fonate / first staff member)
  const [selectedStaffId, setSelectedStaffId] = useState<string>(
    staff.find((s) => s.name.toLowerCase().includes('mamadou'))?.id || staff[0]?.id || 'staff-pos-1'
  );
  const activeStaff = staff.find((s) => s.id === selectedStaffId) || staff[0];

  // Cashier Tabs: 'vente' | 'performances' | 'historique'
  const [activeTab, setActiveTab] = useState<'vente' | 'performances' | 'historique'>('vente');

  // Fast Sale Mode (⚡ Mode Vente Éclair)
  const [fastSaleMode, setFastSaleMode] = useState<boolean>(true);

  // Kiosk settings
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [nightMode, setNightMode] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Last sold ticket (preloaded with most recent ticket by this vendor or latest ticket)
  const initialTicket = useMemo(() => {
    return (
      tickets.find((t) => t.sellerId === activeStaff?.id) ||
      tickets.find((t) => t.code === 'r7gt') ||
      tickets[0] ||
      null
    );
  }, [tickets, activeStaff?.id]);

  const [lastSoldTicket, setLastSoldTicket] = useState<TicketItem | null>(initialTicket);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');

  // Modals & Popups
  const [sosModalOpen, setSosModalOpen] = useState(false);
  const [sosAmount, setSosAmount] = useState<number>(10000);
  const [supervisorPhone, setSupervisorPhone] = useState<string>('0151664752');
  const [fullScreenClientModal, setFullScreenClientModal] = useState(false);
  const [quitModalOpen, setQuitModalOpen] = useState(false);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // History search and filters
  const [historySearch, setHistorySearch] = useState('');
  const [historyFilter, setHistoryFilter] = useState<'tous' | 'en_ligne' | 'hors_ligne'>('tous');

  // Customer phone for SMS/WhatsApp optional
  const [customerPhone, setCustomerPhone] = useState('');

  // Thermal print hidden ref
  const printRef = useRef<HTMLDivElement>(null);

  // Show temporary toast
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 2500);
  };

  // Generate QR code whenever lastSoldTicket changes
  useEffect(() => {
    if (lastSoldTicket) {
      QRCode.toDataURL(lastSoldTicket.code, {
        width: 240,
        margin: 1,
        color: {
          dark: '#ea580c', // Orange modules like in screenshot 2
          light: '#00000000', // Transparent background
        },
      })
        .then((url) => setQrCodeDataUrl(url))
        .catch(() => setQrCodeDataUrl(''));
    }
  }, [lastSoldTicket]);

  // Sound effect function (pleasant kiosk beep)
  const playBeep = () => {
    if (!soundEnabled) return;
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioCtx = new AudioContextClass();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
      gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.18);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.18);
    } catch {
      // AudioContext not supported or permission denied
    }
  };

  // 1-Tap Sale Handler
  const handleSale = (forfait: ForfaitItem) => {
    try {
      const ticket = sellTicketPOS(forfait.id, customerPhone, activeStaff?.id);
      setLastSoldTicket(ticket);
      playBeep();

      // Confetti animation
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.65 },
        colors: ['#f97316', '#f59e0b', '#10b981'],
      });

      showToast(`Ticket ${ticket.code} émis avec succès !`);
    } catch {
      showToast('Erreur lors de la vente. Veuillez vérifier le solde du vendeur.');
    }
  };

  // Fullscreen browser toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else if (document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Refresh simulation
  const handleRefresh = () => {
    setIsRefreshing(true);
    forceHeartbeatSync();
    setTimeout(() => {
      setIsRefreshing(false);
      showToast('Données caisse actualisées');
    }, 600);
  };

  // Copy code to clipboard
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    showToast(`Code « ${code} » copié dans le presse-papier !`);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // WhatsApp share
  const handleShareWhatsApp = (ticket: TicketItem) => {
    const text = `🎉 Votre ticket WiFi Joowifi :\n\n📶 Code de connexion : *${ticket.code}*\n⏳ Forfait : *${ticket.forfaitName}*\n💰 Prix : *${formatMoney(ticket.price)}*\n\n👉 Connectez-vous au réseau Wi-Fi « Joowifi » et saisissez ce code sur la page de connexion. Bon surf !`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // WhatsApp SOS Request
  const handleSendSosWhatsApp = () => {
    sosRechargeRequest(activeStaff?.id || 'staff-pos-1', sosAmount);
    const text = `🚨 *Demande de Recharge SOS - Joowifi*\n\n👤 Vendeur : *${activeStaff?.name || 'Mamadou Fonate'}*\n💳 Solde actuel : *${formatMoney(activeStaff?.balanceCredit || 54300)}*\n⚡ Montant demandé : *${formatMoney(sosAmount)}*\n\nMerci de bien vouloir valider mon réapprovisionnement de crédit Joowifi.`;
    const cleanPhone = supervisorPhone.replace(/\D/g, '');
    const url = `https://wa.me/${cleanPhone.startsWith('225') ? cleanPhone : `225${cleanPhone}`}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    setSosModalOpen(false);
    showToast(`Alerte SOS de ${formatMoney(sosAmount)} transmise au superviseur.`);
  };

  // Download ticket as PNG
  const handleDownloadPng = (ticket: TicketItem) => {
    const canvas = document.createElement('canvas');
    canvas.width = 480;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Dark background
    ctx.fillStyle = '#0b0f19';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Border
    ctx.strokeStyle = '#f97316';
    ctx.lineWidth = 4;
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

    // Title
    ctx.fillStyle = '#f97316';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('JOOWIFI HOTSPOT', canvas.width / 2, 55);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px sans-serif';
    ctx.fillText('Ticket d’accès Internet Haut Débit', canvas.width / 2, 80);

    // Code
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 48px monospace';
    ctx.fillText(ticket.code, canvas.width / 2, 160);

    // Forfait & Price
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText(`${ticket.forfaitName} • ${formatMoney(ticket.price)}`, canvas.width / 2, 210);

    // Draw QR code if available
    if (qrCodeDataUrl) {
      const qrImg = new Image();
      qrImg.onload = () => {
        ctx.drawImage(qrImg, canvas.width / 2 - 100, 240, 200, 200);

        // Footer
        ctx.fillStyle = '#cbd5e1';
        ctx.font = '13px sans-serif';
        ctx.fillText('Scannez ou tapez votre code sur la page WiFi', canvas.width / 2, 480);

        ctx.fillStyle = '#64748b';
        ctx.font = '11px sans-serif';
        ctx.fillText(`Émis le ${new Date(ticket.createdAt).toLocaleString('fr-FR')} par ${activeStaff?.name}`, canvas.width / 2, 520);

        const link = document.createElement('a');
        link.download = `ticket-joowifi-${ticket.code}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        showToast('Image du ticket téléchargée !');
      };
      qrImg.src = qrCodeDataUrl;
    } else {
      const link = document.createElement('a');
      link.download = `ticket-joowifi-${ticket.code}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      showToast('Image du ticket téléchargée !');
    }
  };

  // Format d'imprimante thermique Bluetooth (58mm ou 80mm)
  const [paperFormat, setPaperFormat] = useState<'58mm' | '80mm'>('58mm');
  const [btPrinterName, setBtPrinterName] = useState<string | null>(null);

  // Impression directe sur imprimante thermique Bluetooth via Web Bluetooth API (ESC/POS)
  const handleBluetoothThermalPrint = async (ticketToPrint?: TicketItem | null) => {
    const t = ticketToPrint || lastSoldTicket;
    if (!t) return;

    const nav = navigator as Navigator & {
      bluetooth?: {
        requestDevice: (opts: unknown) => Promise<{
          name?: string;
          gatt?: { connect: () => Promise<{ getPrimaryService: (s: string) => Promise<{ getCharacteristic: (c: string) => Promise<{ writeValue: (v: Uint8Array) => Promise<void> }> }> }> };
        }>;
      };
    };

    if (nav.bluetooth) {
      try {
        const device = await nav.bluetooth.requestDevice({
          acceptAllDevices: true,
          optionalServices: ['000018f0-0000-1000-8000-00805f9b34fb'],
        });
        setBtPrinterName(device.name || `Imprimante BT (${paperFormat})`);

        // Construction des commandes ESC/POS (58mm / 80mm)
        const esc = '\x1B';
        const gs = '\x1D';
        const divider = paperFormat === '58mm' ? '--------------------------------\n' : '------------------------------------------------\n';
        const escPosPayload =
          esc + '@' + // Initialisation imprimante
          esc + 'a' + '\x01' + // Alignement centré
          esc + '!' + '\x30' + 'JOOWIFI HOTSPOT\n' +
          esc + '!' + '\x00' + 'Ticket Internet Haut Debit (' + paperFormat + ')\n' +
          divider +
          'CODE VOUCHER :\n' +
          esc + '!' + '\x38' + t.code + '\n' +
          esc + '!' + '\x00' +
          divider +
          'Forfait : ' + t.forfaitName + '\n' +
          'Tarif   : ' + formatMoney(t.price) + '\n' +
          'Duree   : ' + t.duration + '\n' +
          'Vendeur : ' + (activeStaff?.name || 'Caisse POS') + '\n' +
          divider +
          'Connectez-vous au WiFi Joowifi\n' +
          'et saisissez ce code.\n\n\n' +
          gs + 'V' + '\x41' + '\x03'; // Coupe papier partielle

        if (device.gatt) {
          const server = await device.gatt.connect();
          const service = await server.getPrimaryService('000018f0-0000-1000-8000-00805f9b34fb');
          const characteristic = await service.getCharacteristic('00002af1-0000-1000-8000-00805f9b34fb');
          const encoder = new TextEncoder();
          await characteristic.writeValue(encoder.encode(escPosPayload));
          showToast(`Ticket ${t.code} imprimé en Bluetooth (${paperFormat}) sur ${device.name || 'Imprimante POS'} !`);
          return;
        }
      } catch {
        // Repli sur l'impression système formatée en cas d'annulation Bluetooth
      }
    }

    window.print();
    showToast(`Impression ticket thermique (${paperFormat}) lancée`);
  };

  // Print thermal slip
  const handlePrintSlip = () => {
    handleBluetoothThermalPrint(lastSoldTicket);
  };

  // Vendor calculations
  const todaySales = activeStaff?.todaySales || 50700;
  const dailyGoal = activeStaff?.dailyGoal || 10000;
  const goalReached = todaySales >= dailyGoal;
  const commissionRate = activeStaff?.commissionRate || 10;
  const commissionsAmount = Math.round((todaySales * commissionRate) / 100);
  const vendorBalance = activeStaff?.balanceCredit || 54300;

  // Tickets sold by this vendor
  const vendorTickets = useMemo(() => {
    return tickets.filter((t) => t.sellerId === activeStaff?.id);
  }, [tickets, activeStaff?.id]);

  // Filtered tickets in history
  const filteredTickets = useMemo(() => {
    return vendorTickets.filter((t) => {
      const matchesSearch =
        t.code.toLowerCase().includes(historySearch.toLowerCase()) ||
        t.forfaitName.toLowerCase().includes(historySearch.toLowerCase());

      if (!matchesSearch) return false;
      if (historyFilter === 'en_ligne') return t.status === 'actif';
      if (historyFilter === 'hors_ligne') return t.status !== 'actif';
      return true;
    });
  }, [vendorTickets, historySearch, historyFilter]);

  // 7-day sales data points (for performance curve)
  const salesHistory7Days = [
    { day: 'sam. 3', amount: 0 },
    { day: 'dim. 4', amount: 0 },
    { day: 'lun. 5', amount: 0 },
    { day: 'mar. 6', amount: 0 },
    { day: 'mer. 7', amount: 0 },
    { day: 'jeu. 8', amount: 5200 },
    { day: 'ven. 9', amount: todaySales },
  ];

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-200 select-none ${
        nightMode ? 'bg-[#0B0F19] text-slate-100' : 'bg-slate-100 text-slate-900'
      }`}
    >
      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl bg-slate-900/95 border border-amber-500/50 text-white text-xs font-semibold shadow-2xl flex items-center gap-2 backdrop-blur-md animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP KIOSK CONTAINER */}
      <div className="w-full max-w-4xl mx-auto px-3 sm:px-6 pt-3 sm:pt-6">
        {/* 1. CARTE PROFIL VENDEUR & BARRE D'OUTILS KIOSQUE */}
        <div
          className={`rounded-2xl border transition-all p-4 sm:p-5 mb-4 shadow-xl shadow-black/40 ${
            nightMode
              ? 'bg-[#0e1320] border-slate-800/90'
              : 'bg-white border-slate-200 shadow-slate-200/50'
          }`}
        >
          {/* Ligne 1 : Profil Vendeur & Boutons Mode/Quitter */}
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-800/60">
            <div className="flex items-center gap-3">
              {/* Avatar avec initiale */}
              <div className="w-11 h-11 rounded-xl bg-[#2a1708] border border-amber-600/30 flex items-center justify-center text-amber-500 font-extrabold text-lg shadow-inner">
                {activeStaff?.name?.charAt(0).toLowerCase() || 'm'}
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-white capitalize leading-tight">
                  {activeStaff?.name || 'mamadou fonate'}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-bold tracking-wider text-slate-400 bg-slate-800/80 border border-slate-700/60 px-2 py-0.5 rounded">
                    VENDEUR
                  </span>
                  {staff.length > 1 && (
                    <select
                      value={selectedStaffId}
                      onChange={(e) => setSelectedStaffId(e.target.value)}
                      className="text-[10px] text-slate-400 bg-transparent border-none p-0 focus:outline-none cursor-pointer hover:text-white"
                      title="Changer de vendeur"
                    >
                      {staff.map((s) => (
                        <option key={s.id} value={s.id} className="bg-slate-900 text-white">
                          {s.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
            </div>

            {/* Actions rapides droite : Soleil/Lune + Quitter */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setNightMode(!nightMode)}
                title="Bascule Mode Jour / Nuit"
                className={`p-2.5 rounded-xl border transition cursor-pointer ${
                  nightMode
                    ? 'bg-slate-900/80 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
                    : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-black'
                }`}
              >
                {nightMode ? <Sun className="w-4 h-4 text-slate-300" /> : <Moon className="w-4 h-4" />}
              </button>

              <button
                onClick={() => setQuitModalOpen(true)}
                title="Fermer la session de vente"
                className="px-3 sm:px-4 py-2.5 rounded-xl border border-red-500/40 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold text-xs flex items-center gap-1.5 sm:gap-2 transition cursor-pointer active:scale-95"
              >
                <Power className="w-4 h-4" />
                <span>Quitter</span>
              </button>
            </div>
          </div>

          {/* Ligne 2 : Mon Solde & Outils Kiosque */}
          <div className="pt-3.5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 sm:gap-4">
              <div>
                <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 tracking-wider block uppercase">
                  MON SOLDE
                </span>
                <span className="text-lg sm:text-xl font-mono font-black text-[#10b981]">
                  {formatMoney(vendorBalance)}
                </span>
              </div>

              {/* Bouton SOS Recharge */}
              <button
                onClick={() => setSosModalOpen(true)}
                className="px-3 py-1.5 rounded-xl border border-amber-500/50 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center gap-1.5 transition shadow-sm cursor-pointer active:scale-95"
              >
                <LifeBuoy className="w-4 h-4" />
                <span>SOS Recharge</span>
              </button>
            </div>

            {/* Outils kiosque droite : Son, Plein Écran, Refresh */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={() => {
                  setSoundEnabled(!soundEnabled);
                  showToast(soundEnabled ? 'Retour sonore désactivé' : 'Retour sonore activé');
                }}
                title={soundEnabled ? 'Couper le son' : 'Activer le retour sonore'}
                className={`p-2 rounded-xl border transition cursor-pointer ${
                  nightMode
                    ? 'bg-slate-900/80 border-slate-800 text-slate-300 hover:text-white'
                    : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-black'
                }`}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-rose-400" />}
              </button>

              <button
                onClick={toggleFullscreen}
                title="Plein Écran Kiosque"
                className={`p-2 rounded-xl border transition cursor-pointer ${
                  nightMode
                    ? 'bg-slate-900/80 border-slate-800 text-slate-300 hover:text-white'
                    : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-black'
                }`}
              >
                <Maximize2 className="w-4 h-4" />
              </button>

              <button
                onClick={handleRefresh}
                title="Actualiser les données"
                className={`p-2 rounded-xl border transition cursor-pointer ${
                  nightMode
                    ? 'bg-slate-900/80 border-slate-800 text-slate-300 hover:text-white'
                    : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-black'
                }`}
              >
                <RotateCcw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* 2. NAVIGATION PRINCIPALE À 3 ONGLETS */}
        <div
          className={`grid grid-cols-3 p-1 rounded-2xl border mb-6 ${
            nightMode ? 'bg-[#0e1320] border-slate-800/80' : 'bg-slate-200 border-slate-300'
          }`}
        >
          <button
            onClick={() => setActiveTab('vente')}
            className={`py-2.5 sm:py-3 text-xs sm:text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition cursor-pointer ${
              activeTab === 'vente'
                ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/30 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Vente</span>
          </button>

          <button
            onClick={() => setActiveTab('performances')}
            className={`py-2.5 sm:py-3 text-xs sm:text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition cursor-pointer ${
              activeTab === 'performances'
                ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/30 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Performances</span>
          </button>

          <button
            onClick={() => setActiveTab('historique')}
            className={`py-2.5 sm:py-3 text-xs sm:text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition cursor-pointer ${
              activeTab === 'historique'
                ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/30 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Historique</span>
          </button>
        </div>

        {/* 3. VUE "VENTE" (CAISSE RAPIDE & KIOSQUE) */}
        {activeTab === 'vente' && (
          <div className="space-y-6 pb-16">
            {/* Jauge d'objectif journalier */}
            <div
              className={`p-4 sm:p-5 rounded-2xl border space-y-2.5 ${
                nightMode ? 'bg-[#0e1320] border-slate-800/80' : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <div className="flex items-center gap-2 font-semibold text-slate-300">
                  <TrendingUp className="w-4 h-4 text-orange-500" />
                  <span>Objectif journalier</span>
                </div>
                <div className="font-mono text-xs sm:text-sm">
                  <span className="font-black text-orange-500">{formatMoney(todaySales)}</span>
                  <span className="text-slate-500"> / {formatMoney(dailyGoal)}</span>
                </div>
              </div>

              {/* Barre de progression pleine orange */}
              <div className="w-full h-2 rounded-full bg-slate-800/80 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-700 rounded-full"
                  style={{ width: `${Math.min(100, Math.round((todaySales / dailyGoal) * 100))}%` }}
                />
              </div>

              {/* Message encourageant dynamique */}
              <div className="text-[11px] sm:text-xs text-slate-400 flex items-center gap-1.5 pt-0.5">
                {goalReached ? (
                  <>
                    <span>🎯</span>
                    <span className="text-slate-300">Objectif du jour atteint. Beau travail.</span>
                  </>
                ) : (
                  <>
                    <span>💪</span>
                    <span className="text-slate-300">
                      Plus que {formatMoney(dailyGoal - todaySales)} pour atteindre l'objectif du jour.
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* SÉLECTIONNER UN FORFAIT & MODE VENTE ÉCLAIR */}
            <div>
              <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase">
                  SÉLECTIONNER UN FORFAIT
                </h3>

                {/* Toggle commutable ⚡ Mode Vente Éclair */}
                <button
                  onClick={() => {
                    setFastSaleMode(!fastSaleMode);
                    showToast(
                      !fastSaleMode
                        ? '⚡ Mode Vente Éclair ACTIF (Émission 1-Tap)'
                        : 'Mode confirmation standard activé'
                    );
                  }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                    fastSaleMode
                      ? 'bg-amber-500/10 border-amber-500/50 text-amber-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Mode Vente Éclair</span>
                  <span
                    className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase ${
                      fastSaleMode ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {fastSaleMode ? 'ACTIF' : 'OFF'}
                  </span>
                </button>
              </div>

              {/* Grille des Forfaits Disponibles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {forfaits.map((forfait) => (
                  <button
                    key={forfait.id}
                    onClick={() => handleSale(forfait)}
                    className={`p-4 rounded-2xl border text-left transition-all active:scale-95 cursor-pointer flex flex-col justify-between min-h-[110px] relative group hover:border-amber-500/60 ${
                      nightMode
                        ? 'bg-[#0e1320] border-slate-800/80 hover:bg-[#121829]'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {/* Badge 1-CLIC quand mode éclair actif */}
                    {fastSaleMode && (
                      <span className="absolute top-3.5 right-3.5 text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#2a1708] text-amber-400 border border-amber-500/40 flex items-center gap-1">
                        <Zap className="w-2.5 h-2.5 text-amber-400" />
                        1-CLIC
                      </span>
                    )}

                    <div>
                      <h4 className="text-sm font-bold text-white capitalize">{forfait.name}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {forfait.durationHours >= 24
                          ? `${forfait.durationHours / 24 * 24} h`
                          : `${forfait.durationHours} h`}
                      </p>
                    </div>

                    <div className="pt-2 mt-2">
                      <span className="text-xl font-mono font-black text-orange-500">
                        {forfait.price} <span className="text-xs text-slate-400">FCFA</span>
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* ENCART RÉSULTAT DE VENTE (CODE TICKET GÉNÉRÉ) */}
            {lastSoldTicket && (
              <div
                className={`p-5 sm:p-7 rounded-3xl border relative transition-all ${
                  nightMode
                    ? 'bg-[#0e1320] border-slate-800/90 shadow-2xl shadow-black/60'
                    : 'bg-white border-slate-200 shadow-xl'
                }`}
              >
                {/* Badge vert en haut à droite : VENDU AVEC SUCCÈS */}
                <div className="absolute top-4 right-4">
                  <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider">
                    VENDU AVEC SUCCÈS
                  </span>
                </div>

                <div className="text-center space-y-4">
                  <div className="text-[11px] uppercase tracking-wider font-bold text-slate-400">
                    CODE TICKET GÉNÉRÉ
                  </div>

                  {/* Grand QR Code stylisé en orange */}
                  <div className="flex justify-center">
                    <div className="p-3 rounded-2xl bg-black/60 border border-orange-500/40 shadow-inner inline-block">
                      {qrCodeDataUrl ? (
                        <img
                          src={qrCodeDataUrl}
                          alt={`QR Code ${lastSoldTicket.code}`}
                          className="w-40 h-40 sm:w-44 sm:h-44 object-contain"
                        />
                      ) : (
                        <div className="w-40 h-40 flex items-center justify-center text-orange-500">
                          Génération QR...
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Code voucher en très gros caractères avec bouton copie rapide */}
                  <div className="flex items-center justify-center gap-3">
                    <div className="px-6 py-2.5 rounded-2xl bg-slate-900 border border-slate-700/80 flex items-center gap-3 shadow-inner">
                      <span className="font-mono text-3xl sm:text-4xl font-black text-white tracking-wider">
                        {lastSoldTicket.code}
                      </span>
                      <button
                        onClick={() => handleCopyCode(lastSoldTicket.code)}
                        title="Copier le code"
                        className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                      >
                        {copiedCode ? (
                          <Check className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <Copy className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Sous-titre Forfait */}
                  <div className="text-xs text-slate-400">
                    Forfait :{' '}
                    <strong className="text-slate-200">
                      {lastSoldTicket.forfaitName} ({formatMoney(lastSoldTicket.price)})
                    </strong>
                  </div>

                  {/* Bouton large pleine largeur : Montrer au client (Plein Écran) */}
                  <button
                    onClick={() => setFullScreenClientModal(true)}
                    className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-[0.99] text-slate-950 font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition cursor-pointer"
                  >
                    <Eye className="w-5 h-5 text-slate-950 stroke-[2.5]" />
                    <span>Montrer au client (Plein Écran)</span>
                  </button>

                  {/* Ligne 2 boutons : Partager Image + Télécharger PNG */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleShareWhatsApp(lastSoldTicket)}
                      className="py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-md shadow-orange-600/20"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>Partager Image</span>
                    </button>

                    <button
                      onClick={() => handleDownloadPng(lastSoldTicket)}
                      className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 border border-slate-700/80 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>Télécharger PNG</span>
                    </button>
                  </div>

                  {/* Séparateur AUTRES OPTIONS */}
                  <div className="pt-2 flex items-center gap-3">
                    <div className="h-px flex-1 bg-slate-800" />
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                      AUTRES OPTIONS
                    </span>
                    <div className="h-px flex-1 bg-slate-800" />
                  </div>

                  {/* Stack de boutons supplémentaires */}
                  <div className="space-y-2 pt-1">
                    {/* Copier le code */}
                    <button
                      onClick={() => handleCopyCode(lastSoldTicket.code)}
                      className="w-full py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 active:scale-[0.99] border border-slate-700/80 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
                    >
                      <Copy className="w-4 h-4 text-slate-400" />
                      <span>Copier le code ({lastSoldTicket.code})</span>
                    </button>

                    {/* Partager sur WhatsApp */}
                    <button
                      onClick={() => handleShareWhatsApp(lastSoldTicket)}
                      className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition shadow-md shadow-emerald-700/25 cursor-pointer"
                    >
                      <Phone className="w-4 h-4" />
                      <span>Partager sur WhatsApp</span>
                    </button>

                    {/* Imprimer ticket thermique Bluetooth (Sélecteur 58mm / 80mm) */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handlePrintSlip}
                        className="flex-1 py-2.5 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 active:scale-[0.99] border border-slate-700/80 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
                      >
                        <Printer className="w-4 h-4 text-amber-400" />
                        <span>
                          {btPrinterName
                            ? `Imprimer BT (${btPrinterName} • ${paperFormat})`
                            : `Imprimer Ticket Bluetooth (${paperFormat})`}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const next = paperFormat === '58mm' ? '80mm' : '58mm';
                          setPaperFormat(next);
                          showToast(`Format d'imprimante thermique réglé sur ${next}`);
                        }}
                        className="px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-amber-400 hover:bg-slate-800 font-mono text-xs font-extrabold transition cursor-pointer"
                        title="Basculer entre 58mm et 80mm"
                      >
                        {paperFormat}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 4. VUE "PERFORMANCES" */}
        {activeTab === 'performances' && (
          <div className="space-y-6 pb-16">
            {/* 3 Cartes KPI Vendeur */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {/* VENTES JOUR */}
              <div
                className={`p-4 sm:p-5 rounded-2xl border space-y-1.5 relative ${
                  nightMode ? 'bg-[#0e1320] border-slate-800/80' : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    VENTES JOUR
                  </span>
                  <Calendar className="w-4 h-4 text-orange-500" />
                </div>
                <div className="text-2xl font-black font-mono text-white">
                  {formatMoney(todaySales)}
                </div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  CIBLE : {formatMoney(dailyGoal)}
                </div>
              </div>

              {/* VENTES MOIS */}
              <div
                className={`p-4 sm:p-5 rounded-2xl border space-y-1.5 relative ${
                  nightMode ? 'bg-[#0e1320] border-slate-800/80' : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    VENTES MOIS
                  </span>
                  <Wallet className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-black font-mono text-white">
                  {formatMoney(todaySales)}
                </div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  MOIS EN COURS
                </div>
              </div>

              {/* COMMISSIONS */}
              <div
                className={`p-4 sm:p-5 rounded-2xl border space-y-1.5 relative ${
                  nightMode ? 'bg-[#0e1320] border-slate-800/80' : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    COMMISSIONS
                  </span>
                  <DollarSign className="w-4 h-4 text-orange-500" />
                </div>
                <div className="text-2xl font-black font-mono text-white">
                  {formatMoney(commissionsAmount)}
                </div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  TAUX : {commissionRate.toFixed(2)}%
                </div>
              </div>
            </div>

            {/* GRAPHIQUE "ÉVOLUTION DES VENTES (7 JOURS)" */}
            <div
              className={`p-5 sm:p-6 rounded-2xl border space-y-4 ${
                nightMode ? 'bg-[#0e1320] border-slate-800/80' : 'bg-white border-slate-200'
              }`}
            >
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                ÉVOLUTION DES VENTES (7 JOURS)
              </h3>

              {/* SVG Area Chart */}
              <div className="relative pt-4">
                <div className="h-64 w-full">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 700 240">
                    <defs>
                      <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ea580c" stopOpacity="0.45" />
                        <stop offset="100%" stopColor="#ea580c" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Horizontal grid lines */}
                    {[0, 15000, 30000, 45000, 60000].map((val, idx) => {
                      const y = 200 - (val / 60000) * 180;
                      return (
                        <g key={val}>
                          <line
                            x1="50"
                            y1={y}
                            x2="690"
                            y2={y}
                            stroke="#1e293b"
                            strokeWidth="1"
                            strokeDasharray="4 4"
                          />
                          <text
                            x="40"
                            y={y + 4}
                            textAnchor="end"
                            fontSize="10"
                            fill="#64748b"
                            fontFamily="monospace"
                          >
                            {val}
                          </text>
                        </g>
                      );
                    })}

                    {/* Area under curve */}
                    <path
                      d="M 60,200 L 160,200 L 260,200 L 360,200 L 460,200 L 560,185 Q 610,140 660,50 L 660,200 Z"
                      fill="url(#salesGradient)"
                    />

                    {/* Smooth curve line */}
                    <path
                      d="M 60,200 L 160,200 L 260,200 L 360,200 L 460,200 L 560,185 Q 610,140 660,50"
                      fill="none"
                      stroke="#ea580c"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />

                    {/* Dots on points */}
                    {salesHistory7Days.map((item, idx) => {
                      const x = 60 + idx * 100;
                      const y = 200 - (item.amount / 60000) * 180;
                      return (
                        <g key={item.day} className="cursor-pointer group">
                          <circle
                            cx={x}
                            cy={y}
                            r={item.amount > 0 ? 5 : 3}
                            fill={item.amount > 0 ? '#ea580c' : '#334155'}
                            stroke="#0B0F19"
                            strokeWidth="2"
                          />
                          {item.amount > 0 && (
                            <text
                              x={x}
                              y={y - 10}
                              textAnchor="middle"
                              fontSize="11"
                              fill="#f97316"
                              fontWeight="bold"
                              fontFamily="monospace"
                            >
                              {formatMoney(item.amount)}
                            </text>
                          )}
                        </g>
                      );
                    })}

                    {/* Bottom axis line */}
                    <line x1="50" y1="200" x2="690" y2="200" stroke="#334155" strokeWidth="1.5" />

                    {/* X labels */}
                    {salesHistory7Days.map((item, idx) => {
                      const x = 60 + idx * 100;
                      return (
                        <text
                          key={item.day}
                          x={x}
                          y="222"
                          textAnchor="middle"
                          fontSize="11"
                          fill="#94a3b8"
                        >
                          {item.day}
                        </text>
                      );
                    })}
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 5. VUE "HISTORIQUE" */}
        {activeTab === 'historique' && (
          <div className="space-y-4 pb-16">
            {/* Barre de recherche & Filtres d'état */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div
                className={`flex-1 flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border ${
                  nightMode ? 'bg-[#0e1320] border-slate-800/90' : 'bg-white border-slate-200'
                }`}
              >
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Rechercher un ticket (code ou forfait)..."
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
                />
                {historySearch && (
                  <button onClick={() => setHistorySearch('')} className="text-slate-400 hover:text-white">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Filtres rapides : Tous, En ligne, Hors-ligne */}
              <div
                className={`flex items-center p-1 rounded-xl border ${
                  nightMode ? 'bg-[#0e1320] border-slate-800/90' : 'bg-white border-slate-200'
                }`}
              >
                {(['tous', 'en_ligne', 'hors_ligne'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setHistoryFilter(mode)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition cursor-pointer ${
                      historyFilter === mode
                        ? 'bg-slate-800 text-white border border-slate-700/60 shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {mode === 'tous' ? 'Tous' : mode === 'en_ligne' ? 'En ligne' : 'Hors-ligne'}
                  </button>
                ))}
              </div>
            </div>

            {/* Liste des Tickets Vendus */}
            {filteredTickets.length === 0 ? (
              <div
                className={`p-10 rounded-2xl border text-center text-slate-400 text-xs ${
                  nightMode ? 'bg-[#0e1320] border-slate-800/80' : 'bg-white border-slate-200'
                }`}
              >
                Aucun ticket trouvé dans cette vue.
              </div>
            ) : (
              <div className="space-y-2.5">
                {filteredTickets.map((t) => (
                  <div
                    key={t.id}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between transition hover:border-slate-700 ${
                      nightMode ? 'bg-[#0e1320] border-slate-800/80' : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Initiale en pastille marron / ambrée */}
                      <div className="w-10 h-10 rounded-xl bg-[#2a1708] border border-amber-600/30 flex items-center justify-center text-amber-500 font-extrabold text-sm uppercase">
                        {t.code.slice(0, 2)}
                      </div>

                      <div>
                        <div className="font-mono font-bold text-sm text-white">{t.code}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {t.forfaitName} • {new Date(t.createdAt).toLocaleDateString('fr-FR')} {new Date(t.createdAt).toLocaleTimeString('fr-FR')}
                        </div>
                      </div>
                    </div>

                    {/* Prix + Actions rapides œil & partage */}
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="font-mono font-bold text-sm text-orange-500">
                          {t.price} <span className="text-[10px] text-slate-400">FCFA</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setLastSoldTicket(t);
                            setFullScreenClientModal(true);
                          }}
                          title="Aperçu client plein écran"
                          className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-amber-400 border border-slate-700/60 transition cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleShareWhatsApp(t)}
                          title="Partager par WhatsApp"
                          className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition cursor-pointer"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 6. MODALE DEMANDE DE RECHARGE SOS (Capture 1) */}
      {sosModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-[#0e1320] border border-slate-800 p-6 shadow-2xl text-slate-100 space-y-5">
            {/* En-tête Modale */}
            <div className="flex items-start justify-between pb-1">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#2a1708] border border-amber-600/30 flex items-center justify-center text-amber-500 shadow-inner">
                  <LifeBuoy className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Demande de Recharge SOS</h3>
                  <p className="text-xs text-slate-400">
                    Transmettre une alerte de recharge à votre superviseur.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSosModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Encadré Solde Actuel */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/80 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-semibold">Votre solde actuel :</span>
              <span className="text-base font-mono font-black text-[#10b981]">
                {formatMoney(vendorBalance)}
              </span>
            </div>

            {/* Montant de recharge souhaité */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                MONTANT DE RECHARGE SOUHAITÉ
              </label>

              {/* 4 Boutons de montants rapides */}
              <div className="grid grid-cols-4 gap-2">
                {[5000, 10000, 25000, 50000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setSosAmount(amt)}
                    className={`py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                      sosAmount === amt
                        ? 'bg-[#2a1708] border-amber-500 text-white shadow-sm'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    {amt}
                  </button>
                ))}
              </div>

              {/* Champ numérique de saisie */}
              <input
                type="number"
                value={sosAmount}
                onChange={(e) => setSosAmount(Number(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm font-mono font-bold text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Numéro WhatsApp du superviseur */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                NUMÉRO WHATSAPP DU SUPERVISEUR
              </label>
              <input
                type="tel"
                value={supervisorPhone}
                onChange={(e) => setSupervisorPhone(e.target.value)}
                placeholder="Ex. 0151664752"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm font-mono text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Boutons d'action */}
            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSosModalOpen(false)}
                className="flex-1 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-bold transition cursor-pointer"
              >
                Annuler
              </button>

              <button
                type="button"
                onClick={handleSendSosWhatsApp}
                className="flex-1 py-3 rounded-xl bg-[#059669] hover:bg-[#047857] active:scale-95 text-white text-xs font-bold flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-900/40 cursor-pointer"
              >
                <Phone className="w-4 h-4" />
                <span>Envoyer par WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. PLEIN ÉCRAN CLIENT : MONTRER AU CLIENT */}
      {fullScreenClientModal && lastSoldTicket && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-black text-white p-6 sm:p-10 select-none animate-fade-in">
          {/* Header modal */}
          <div className="w-full max-w-md flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-orange-600 flex items-center justify-center font-black text-white">
                <Zap className="w-4 h-4" />
              </div>
              <span className="font-black text-sm tracking-wide text-orange-400">JOOWIFI HOTSPOT</span>
            </div>
            <button
              onClick={() => setFullScreenClientModal(false)}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Corps plein écran : QR géant & Code */}
          <div className="w-full max-w-sm text-center space-y-6 my-auto">
            <div>
              <span className="text-xs uppercase font-bold text-slate-400 tracking-widest block mb-2">
                SCANNEZ POUR VOUS CONNECTER
              </span>
              <div className="p-4 rounded-3xl bg-slate-950 border-2 border-orange-500/80 shadow-2xl shadow-orange-500/10 inline-block">
                {qrCodeDataUrl ? (
                  <img
                    src={qrCodeDataUrl}
                    alt={`QR Code ${lastSoldTicket.code}`}
                    className="w-56 h-56 sm:w-64 sm:h-64 object-contain"
                  />
                ) : (
                  <div className="w-56 h-56 flex items-center justify-center text-orange-500">
                    Génération QR...
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs uppercase font-bold text-slate-400 tracking-wider block">
                OU SAISISSEZ VOTRE CODE :
              </span>
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-700">
                <span className="font-mono text-5xl font-black text-white tracking-widest">
                  {lastSoldTicket.code}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300">
              Forfait : <strong className="text-orange-400">{lastSoldTicket.forfaitName}</strong> • {formatMoney(lastSoldTicket.price)}
            </div>
          </div>

          {/* Footer retour */}
          <div className="w-full max-w-md pt-4">
            <button
              onClick={() => setFullScreenClientModal(false)}
              className="w-full py-3.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-sm shadow-lg shadow-orange-600/30 transition cursor-pointer"
            >
              Terminé (Retour Caisse)
            </button>
          </div>
        </div>
      )}

      {/* 8. MODALE QUITTER LA SESSION */}
      {quitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-[#0e1320] border border-slate-800 p-6 shadow-2xl text-slate-100 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
                <Power className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Quitter la Caisse POS</h3>
                <p className="text-xs text-slate-400">Fermer la session actuelle de vente.</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Voulez-vous retourner à la console d’administration ou quitter votre session de vente ?
            </p>

            <div className="pt-2 flex items-center gap-2.5">
              <button
                onClick={() => setQuitModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-bold transition cursor-pointer"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  setQuitModalOpen(false);
                  setCurrentSpace('admin');
                }}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition cursor-pointer"
              >
                Quitter la caisse
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9. TICKET THERMIQUE 58MM (IMPRESSION CACHÉE HORS ÉCRAN) */}
      <div className="hidden print:block fixed inset-0 bg-white text-black p-2 font-mono text-xs" ref={printRef}>
        {lastSoldTicket && (
          <div className="w-[58mm] mx-auto text-center space-y-2 leading-tight">
            <div className="font-black text-sm uppercase tracking-wider">JOOWIFI HOTSPOT</div>
            <div className="text-[10px]">Accès Internet Wi-Fi Haut Débit</div>
            <div className="border-t border-b border-dashed border-black py-2 my-2 space-y-1">
              <div className="text-[10px] text-gray-700">CODE DE CONNEXION :</div>
              <div className="text-2xl font-black tracking-widest">{lastSoldTicket.code}</div>
              {lastSoldTicket.pin && (
                <div className="text-xs">PIN : <strong>{lastSoldTicket.pin}</strong></div>
              )}
            </div>
            <div className="text-left text-[11px] space-y-1">
              <div>Offre : <strong>{lastSoldTicket.forfaitName}</strong></div>
              <div>Tarif : <strong>{formatMoney(lastSoldTicket.price)}</strong></div>
              <div>Durée : <strong>{lastSoldTicket.duration}</strong></div>
              <div>Date : {new Date(lastSoldTicket.createdAt).toLocaleString('fr-FR')}</div>
              <div>Vendeur : {activeStaff?.name}</div>
            </div>
            <div className="border-t border-dashed border-black pt-2 text-[9px] text-gray-600">
              1. Connectez-vous au Wi-Fi « Joowifi »<br />
              2. Ouvrez votre navigateur et entrez votre code.<br />
              Bonne connexion !
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
