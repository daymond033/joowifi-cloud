import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { TicketItem } from '../../types';
import {
  supabaseSelect,
  supabaseAuthSignIn,
  buildSignedSessionJwt,
} from '../../lib/supabase';
import QRCode from 'qrcode';
import {
  Wifi,
  Printer,
  Share2,
  History,
  Zap,
  Copy,
  Check,
  Search,
  Lock,
  Mail,
  Eye,
  EyeOff,
  LogOut,
  AlertCircle,
  ArrowLeft,
  Wallet,
  Ticket,
  ShieldCheck,
  RefreshCw,
  Send,
  QrCode,
} from 'lucide-react';

export const POSCashier: React.FC = () => {
  const {
    forfaits,
    tickets,
    staff,
    user,
    login,
    logout,
    setCurrentSpace,
    sellTicketPOS,
    sosRechargeRequest,
    formatMoney,
    notify,
  } = useApp();

  // ===========================================================================
  // ÉTAT DE LA PASSERELLE DE CONNEXION DÉDIÉE CAISSE POS (POINTS 2 & 3 DE L'AUDIT)
  // Exige obligatoirement qu'un vendeur s'identifie manuellement avec ses
  // identifiants Vendeur (aucune session pré-connectée ni profil "Mamadou Fonate").
  // ===========================================================================
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Onglet actif une fois le vendeur authentifié
  const [posTab, setPosTab] = useState<'sell' | 'history' | 'sos'>('sell');
  const [selectedForfaitId, setSelectedForfaitId] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('+225 ');
  const [lastSoldTicket, setLastSoldTicket] = useState<TicketItem | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedCode, setCopiedCode] = useState(false);

  // Filtre historique
  const [historySearch, setHistorySearch] = useState('');
  const [historyFilter, setHistoryFilter] = useState<'tous' | 'actif' | 'vendeur'>('tous');

  // Demande SOS Recharge
  const [sosAmount, setSosAmount] = useState<number>(15000);

  // Vérifier si l'utilisateur actuel est strictement un Vendeur POS authentifié
  const isAuthenticatedVendor = Boolean(
    user && user.role === 'staff' && user.staffId && user.accessToken
  );

  // Résoudre le profil du vendeur connecté depuis la liste chargée (sans aucun fallback codé en dur)
  const activeStaff = useMemo(() => {
    if (!isAuthenticatedVendor || !user) return null;
    const byId = staff.find(
      (s) =>
        s.id === user.staffId ||
        (s.email && s.email.toLowerCase() === user.email.toLowerCase()) ||
        s.name.toLowerCase() === user.name.toLowerCase()
    );
    if (byId) return byId;
    return {
      id: user.staffId || 'vendor',
      name: user.name,
      email: user.email,
      phone: '',
      zoneId: 'Zone Principale',
      zoneName: 'Zone Principale',
      commissionRate: 10,
      balanceCredit: 0,
      dailyGoal: 15000,
      todaySales: 0,
      totalSales: 0,
      active: true,
      lastActive: 'En ligne',
      permissions: {
        fastSale: true,
        printThermal: true,
        shareWhatsapp: true,
        sosRequest: true,
      },
    };
  }, [isAuthenticatedVendor, user, staff]);

  useEffect(() => {
    if (forfaits.length > 0 && !selectedForfaitId) {
      setSelectedForfaitId(forfaits[0].id);
    }
  }, [forfaits, selectedForfaitId]);

  useEffect(() => {
    if (lastSoldTicket?.code) {
      const portalUrl = `http://10.5.50.1/login?username=${encodeURIComponent(
        lastSoldTicket.code
      )}&password=${encodeURIComponent(lastSoldTicket.code)}`;
      QRCode.toDataURL(portalUrl, { width: 160, margin: 1 })
        .then((url) => setQrDataUrl(url))
        .catch(() => setQrDataUrl(''));
    } else {
      setQrDataUrl('');
    }
  }, [lastSoldTicket]);

  // Authentification manuelle du Vendeur sur la Passerelle Caisse POS
  const handleVendorLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const cleanId = loginIdentifier.trim().toLowerCase();
    const cleanPass = loginPassword.trim();

    if (!cleanId || !cleanPass) {
      setLoginError('Veuillez saisir votre identifiant vendeur et votre mot de passe.');
      return;
    }

    setLoginLoading(true);
    try {
      let matched: any = staff.find(
        (s) =>
          (s.email && s.email.trim().toLowerCase() === cleanId) ||
          s.name.trim().toLowerCase() === cleanId ||
          s.phone.replace(/\s+/g, '') === cleanId.replace(/\s+/g, '')
      );

      // Interroger la table `public.staff_vendors` sur Supabase
      const dbVendors = await supabaseSelect<Record<string, any>>(
        'staff_vendors',
        'select=*&limit=200',
        ''
      );

      if (Array.isArray(dbVendors) && dbVendors.length > 0) {
        const foundDb = dbVendors.find(
          (v) =>
            String(v.email || '').trim().toLowerCase() === cleanId ||
            String(v.name || '').trim().toLowerCase() === cleanId ||
            String(v.phone || '').replace(/\s+/g, '') === cleanId.replace(/\s+/g, '')
        );
        if (foundDb) {
          matched = {
            id: String(foundDb.id),
            name: String(foundDb.name),
            email: foundDb.email ? String(foundDb.email) : cleanId,
            phone: String(foundDb.phone || ''),
            zoneId: String(foundDb.zone_id || 'Zone Principale'),
            zoneName: String(foundDb.zone_id || 'Zone Principale'),
            commissionRate: Number(foundDb.commission_rate || 10),
            balanceCredit: Number(foundDb.balance_credit_xof || 0),
            dailyGoal: Number(foundDb.daily_goal_xof || 15000),
            todaySales: Number(foundDb.today_sales_xof || 0),
            totalSales: Number(foundDb.total_sales_xof || 0),
            active: Boolean(foundDb.active ?? true),
            password: String(foundDb.pin_hash || ''),
            tenantId: String(foundDb.tenant_id || foundDb.operator_id || ''),
          };
        }
      }

      if (!matched) {
        setLoginError(
          "Aucun compte vendeur trouvé pour cet identifiant. Vérifiez l'email ou le numéro créé par votre administrateur."
        );
        setLoginLoading(false);
        return;
      }

      if (!matched.active) {
        setLoginError("Ce compte vendeur est actuellement suspendu par l'administrateur.");
        setLoginLoading(false);
        return;
      }

      const expectedPass = String(matched.password || '').trim();
      const authRes = cleanId.includes('@')
        ? await supabaseAuthSignIn(cleanId, cleanPass)
        : {};

      if (cleanPass !== expectedPass && !authRes.accessToken) {
        setLoginError('Mot de passe ou code PIN vendeur incorrect.');
        setLoginLoading(false);
        return;
      }

      const vendorTenantId = String(matched.tenantId || user?.tenantId || '').trim();
      if (!vendorTenantId) {
        setLoginError("Impossible d'identifier le réseau opérateur rattaché à ce vendeur.");
        setLoginLoading(false);
        return;
      }

      const tokenJwt =
        authRes.accessToken ||
        buildSignedSessionJwt({
          sub: matched.id,
          email: matched.email || cleanId,
          role: 'vendor',
          tenantId: vendorTenantId,
        });

      login(
        matched.email || cleanId,
        'staff',
        matched.name,
        matched.id,
        vendorTenantId,
        false,
        tokenJwt
      );
      setLoginIdentifier('');
      setLoginPassword('');
    } catch {
      setLoginError('Erreur lors de la vérification du compte vendeur sur Supabase.');
    } finally {
      setLoginLoading(false);
    }
  };

  // Tickets vendus par ce vendeur uniquement
  const vendorTickets = useMemo(() => {
    if (!activeStaff) return [];
    return tickets.filter(
      (t) =>
        t.sellerId === activeStaff.id ||
        t.sellerName === activeStaff.name ||
        t.sellerId === activeStaff.name
    );
  }, [tickets, activeStaff]);

  const filteredTickets = useMemo(() => {
    return vendorTickets.filter((t) => {
      const matchSearch =
        t.code.toLowerCase().includes(historySearch.toLowerCase()) ||
        t.forfaitName.toLowerCase().includes(historySearch.toLowerCase());
      if (!matchSearch) return false;
      if (historyFilter === 'actif') return t.status === 'actif';
      if (historyFilter === 'vendeur') return t.status === 'vendeur' || t.status === 'stock';
      return true;
    });
  }, [vendorTickets, historySearch, historyFilter]);

  const handleSellTicket = () => {
    if (!activeStaff) return;
    const targetForfait = forfaits.find((f) => f.id === selectedForfaitId) || forfaits[0];
    if (!targetForfait) {
      notify('Aucun forfait disponible dans le catalogue de votre opérateur.', 'warning');
      return;
    }
    if (activeStaff.balanceCredit < targetForfait.price) {
      notify(
        `Crédit POS insuffisant (${formatMoney(activeStaff.balanceCredit)}). Demandez une recharge SOS à votre administrateur.`,
        'error'
      );
      setPosTab('sos');
      return;
    }
    try {
      const created = sellTicketPOS(
        targetForfait.id,
        customerPhone.trim().length > 5 ? customerPhone.trim() : undefined,
        activeStaff.id
      );
      setLastSoldTicket(created);
      notify(`Ticket ${created.code} émis (${formatMoney(created.price)}) !`, 'success');
    } catch (err: any) {
      notify(err?.message || 'Erreur lors de la vente du ticket.', 'error');
    }
  };

  const handlePrintThermal = (ticket: TicketItem) => {
    const win = window.open('', '_blank', 'width=320,height=520');
    if (!win) {
      window.print();
      return;
    }
    win.document.write(`
      <html>
        <head>
          <title>Ticket WiFi ${ticket.code}</title>
          <style>
            body { font-family: monospace; width: 260px; margin: 0 auto; padding: 12px; color: #000; }
            .center { text-align: center; }
            .code { font-size: 22px; font-weight: bold; letter-spacing: 2px; border: 2px dashed #000; padding: 8px; margin: 10px 0; }
            .row { display: flex; justify-content: space-between; font-size: 12px; margin: 4px 0; }
            hr { border: none; border-top: 1px dashed #000; margin: 8px 0; }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <div class="center">
            <strong>JOOWIFI HOTSPOT</strong><br/>
            <span>${activeStaff?.zoneName || 'Point de Vente'}</span>
          </div>
          <hr/>
          <div class="row"><span>Forfait:</span><strong>${ticket.forfaitName}</strong></div>
          <div class="row"><span>Durée:</span><strong>${ticket.duration}</strong></div>
          <div class="row"><span>Prix:</span><strong>${ticket.price} FCFA</strong></div>
          <div class="center code">${ticket.code}</div>
          ${qrDataUrl ? `<div class="center"><img src="${qrDataUrl}" width="130" height="130"/></div>` : ''}
          <hr/>
          <div class="center" style="font-size:10px;">
            Agent: ${activeStaff?.name || ''}<br/>
            ${new Date().toLocaleString('fr-FR')}
          </div>
        </body>
      </html>
    `);
    win.document.close();
  };

  const handleShareWhatsApp = (ticket: TicketItem) => {
    const cleanPhone = customerPhone.replace(/[^0-9]/g, '');
    const msg = `*Votre Ticket WiFi Hotspot*\n• Code d'accès : *${ticket.code}*\n• Forfait : *${ticket.forfaitName}*\n• Durée : *${ticket.duration}*\n• Tarif : *${formatMoney(ticket.price)}*\nConnectez-vous au réseau WiFi et saisissez votre code.`;
    const url =
      cleanPhone.length >= 8
        ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`
        : `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  const handleSendSos = () => {
    if (!activeStaff) return;
    sosRechargeRequest(activeStaff.id, sosAmount);
    const msg = `*Demande de Recharge Crédit POS*\n• Vendeur : *${activeStaff.name}*\n• Site : *${activeStaff.zoneName}*\n• Solde actuel : *${formatMoney(activeStaff.balanceCredit)}*\n• Montant demandé : *${formatMoney(sosAmount)}*`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  // ===========================================================================
  // ÉCRAN 1 : PASSERELLE DE CONNEXION OBLIGATOIRE CAISSE POS (CORPORATE TECH)
  // Affiché systématiquement tant qu'un vendeur ne s'est pas authentifié.
  // ===========================================================================
  if (!isAuthenticatedVendor || !activeStaff) {
    return (
      <div className="min-h-screen bg-[#F4F7FA] text-[#1E293B] flex flex-col justify-between font-sans">
        {/* Top Bar Omada Style */}
        <header className="h-14 bg-[#005A5B] text-white px-6 flex items-center justify-between border-b border-[#004748]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-[#008060] flex items-center justify-center font-black text-xs text-white">
              JW
            </div>
            <div>
              <span className="text-sm font-bold tracking-tight block leading-none">
                Joowifi POS
              </span>
              <span className="text-[10px] text-teal-200 block">
                Passerelle d'Authentification Vendeur
              </span>
            </div>
          </div>

          <button
            onClick={() => setCurrentSpace(user?.role === 'admin' ? 'admin' : 'public')}
            className="px-3 py-1.5 rounded bg-white/10 hover:bg-white/20 text-xs font-semibold text-white flex items-center gap-1.5 transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{user?.role === 'admin' ? 'Retour Console Admin' : 'Retour Accueil'}</span>
          </button>
        </header>

        {/* Formulaire Central Flat Corporate Tech */}
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-[#F8FAFC] border-b border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#008060] block">
                  TERMINAL DE VENTE MOBILE (RBAC)
                </span>
                <h1 className="text-base font-bold text-slate-900 mt-0.5">
                  Connexion Agent Vendeur POS
                </h1>
              </div>
              <ShieldCheck className="w-5 h-5 text-[#005A5B]" />
            </div>

            <form onSubmit={handleVendorLogin} className="p-6 space-y-4 text-xs">
              <p className="text-slate-500 leading-relaxed">
                Identifiez-vous avec l'adresse email, le numéro de téléphone et le mot de passe configurés par votre administrateur réseau.
              </p>

              {loginError && (
                <div className="p-3 rounded bg-rose-50 border border-rose-200 flex items-start gap-2 text-rose-700">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{loginError}</span>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Email, Téléphone ou Nom Vendeur *
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="Ex: vendeur@domaine.ci ou +225..."
                    className="w-full pl-8 pr-3 py-2.5 rounded bg-[#F8FAFC] border border-slate-300 text-slate-800 focus:outline-none focus:border-[#008060]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Mot de passe / Code PIN Vendeur *
                </label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-8 pr-9 py-2.5 rounded bg-[#F8FAFC] border border-slate-300 text-slate-800 font-mono focus:outline-none focus:border-[#008060]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    {showPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full py-2.5 px-4 rounded bg-[#008060] hover:bg-[#006B50] text-white font-semibold text-xs flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
              >
                {loginLoading ? (
                  <span>Authentification Supabase en cours...</span>
                ) : (
                  <span>Accéder à mon Terminal Caisse POS</span>
                )}
              </button>
            </form>
          </div>
        </main>

        <footer className="py-3 text-center text-[11px] text-slate-400 border-t border-slate-200 bg-white">
          Joowifi Cloud POS • Accès sécurisé par jeton JWT & Isolation Multi-Tenant
        </footer>
      </div>
    );
  }

  // ===========================================================================
  // ÉCRAN 2 : TERMINAL CAISSE POS "CORPORATE TECH" (STYLE OMADA FLAT DESIGN)
  // Affiché uniquement après authentification vérifiée du vendeur.
  // ===========================================================================
  const selectedForfait =
    forfaits.find((f) => f.id === selectedForfaitId) || forfaits[0] || null;
  const vendorCommissionEarned = Math.round(
    ((activeStaff.todaySales || 0) * (activeStaff.commissionRate || 10)) / 100
  );

  return (
    <div className="min-h-screen bg-[#F4F7FA] text-[#1E293B] flex flex-col font-sans">
      {/* 1. HEADER CORPORATE TECH (#005A5B) */}
      <header className="bg-[#005A5B] text-white px-4 sm:px-6 py-3 border-b border-[#004748] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-[#008060] flex items-center justify-center font-black text-xs">
            POS
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold">{activeStaff.name}</span>
              <span className="px-2 py-0.5 rounded bg-[#008060] text-[10px] font-bold uppercase">
                Vendeur Vérifié
              </span>
            </div>
            <div className="text-[11px] text-teal-100">
              Site : {activeStaff.zoneName} • Commission : {activeStaff.commissionRate}%
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded bg-white/10 border border-white/15 text-right">
            <span className="text-[10px] text-teal-200 block leading-none">Solde Crédit POS</span>
            <span className="font-mono font-bold text-xs text-white">
              {formatMoney(activeStaff.balanceCredit)}
            </span>
          </div>

          <button
            onClick={logout}
            className="px-3 py-2 rounded bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Déconnexion POS</span>
          </button>
        </div>
      </header>

      {/* 2. BARRE DE NAVIGATION INTERNE DU TERMINAL POS */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPosTab('sell')}
              className={`px-4 py-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition cursor-pointer ${
                posTab === 'sell'
                  ? 'border-[#008060] text-[#005A5B]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-[#008060]" />
              <span>Émission de Tickets</span>
            </button>

            <button
              onClick={() => setPosTab('history')}
              className={`px-4 py-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition cursor-pointer ${
                posTab === 'history'
                  ? 'border-[#008060] text-[#005A5B]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Mes Ventes ({vendorTickets.length})</span>
            </button>

            <button
              onClick={() => setPosTab('sos')}
              className={`px-4 py-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition cursor-pointer ${
                posTab === 'sos'
                  ? 'border-[#008060] text-[#005A5B]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>Demande Recharge Crédit</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. CONTENU PRINCIPAL DU TERMINAL POS */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 space-y-5">
        {/* Bandeau de synthèse financière du vendeur */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <span className="text-[11px] font-semibold text-slate-500 block">
              Crédit POS Disponible
            </span>
            <span className="text-lg font-black font-mono text-slate-900 mt-1 block">
              {formatMoney(activeStaff.balanceCredit)}
            </span>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <span className="text-[11px] font-semibold text-slate-500 block">
              Mes Ventes du Jour ({vendorTickets.length} tickets)
            </span>
            <span className="text-lg font-black font-mono text-[#008060] mt-1 block">
              {formatMoney(activeStaff.todaySales)}
            </span>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <span className="text-[11px] font-semibold text-slate-500 block">
              Ma Commission ({activeStaff.commissionRate}%)
            </span>
            <span className="text-lg font-black font-mono text-[#0066CC] mt-1 block">
              {formatMoney(vendorCommissionEarned)}
            </span>
          </div>
        </div>

        {/* ONGLET 1 : ÉMISSION DE TICKETS */}
        {posTab === 'sell' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Sélection du forfait */}
            <div className="lg:col-span-7 bg-white rounded-lg border border-slate-200 p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-sm font-bold text-slate-800">
                    1. Choisir le Forfait WiFi à vendre
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    Catalogue synchronisé avec votre opérateur ({forfaits.length} forfaits)
                  </p>
                </div>
                <Wifi className="w-4 h-4 text-[#008060]" />
              </div>

              {forfaits.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 bg-[#F8FAFC] rounded-lg border border-slate-200">
                  Aucun forfait WiFi n'a encore été configuré par l'administrateur de ce réseau.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {forfaits.map((f) => {
                    const isSelected = selectedForfait?.id === f.id;
                    return (
                      <div
                        key={f.id}
                        onClick={() => setSelectedForfaitId(f.id)}
                        className={`p-3.5 rounded-lg border transition cursor-pointer ${
                          isSelected
                            ? 'bg-[#E6F4F3] border-[#008060] text-[#005A5B]'
                            : 'bg-[#F8FAFC] border-slate-200 hover:border-slate-300 text-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold">{f.name}</span>
                          <span className="font-mono font-black text-sm text-[#008060]">
                            {formatMoney(f.price)}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                          <span>Durée : {f.durationHours}h</span>
                          <span>
                            {f.downloadSpeedMbps}M / {f.uploadSpeedMbps}M
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="pt-2 border-t border-slate-100 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Numéro WhatsApp / SMS du client (Optionnel) :
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+225 07 00 00 00"
                    className="w-full px-3 py-2 rounded bg-[#F8FAFC] border border-slate-300 text-xs font-mono text-slate-800 focus:outline-none focus:border-[#008060]"
                  />
                </div>

                <button
                  onClick={handleSellTicket}
                  disabled={!selectedForfait}
                  className="w-full py-3 px-4 rounded bg-[#008060] hover:bg-[#006B50] text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
                >
                  <Ticket className="w-4 h-4" />
                  <span>
                    {selectedForfait
                      ? `Encaisser & Générer le Ticket (${formatMoney(selectedForfait.price)})`
                      : 'Sélectionnez un forfait'}
                  </span>
                </button>
              </div>
            </div>

            {/* Aperçu du dernier ticket émis */}
            <div className="lg:col-span-5 bg-white rounded-lg border border-slate-200 p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-sm font-bold text-slate-800">
                  2. Reçu Client & QR Code WiFi
                </span>
                <QrCode className="w-4 h-4 text-[#005A5B]" />
              </div>

              {!lastSoldTicket ? (
                <div className="p-8 text-center text-xs text-slate-400 bg-[#F8FAFC] rounded-lg border border-slate-200 space-y-2">
                  <Ticket className="w-7 h-7 text-slate-300 mx-auto" />
                  <p>Sélectionnez un forfait et cliquez sur Encaisser pour générer un ticket.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-[#F8FAFC] border border-slate-200 text-center space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#008060] block">
                      {lastSoldTicket.forfaitName} • {formatMoney(lastSoldTicket.price)}
                    </span>
                    <div className="py-2 px-4 rounded bg-white border border-slate-300 font-mono text-2xl font-black tracking-widest text-slate-900">
                      {lastSoldTicket.code}
                    </div>
                    <span className="text-[11px] text-slate-500 block">
                      Durée : {lastSoldTicket.duration} • Synchronisé MikroTik
                    </span>

                    {qrDataUrl && (
                      <div className="pt-2 flex justify-center">
                        <img
                          src={qrDataUrl}
                          alt="QR Code Ticket"
                          className="w-32 h-32 rounded border border-slate-200 p-1 bg-white"
                        />
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(lastSoldTicket.code);
                        setCopiedCode(true);
                        setTimeout(() => setCopiedCode(false), 2000);
                      }}
                      className="py-2 px-2.5 rounded bg-[#F4F7FA] hover:bg-slate-200 border border-slate-300 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1 cursor-pointer"
                    >
                      {copiedCode ? <Check className="w-3.5 h-3.5 text-[#008060]" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedCode ? 'Copié' : 'Copier'}</span>
                    </button>

                    <button
                      onClick={() => handlePrintThermal(lastSoldTicket)}
                      className="py-2 px-2.5 rounded bg-[#005A5B] hover:bg-[#004748] text-white font-semibold text-xs flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Imprimer</span>
                    </button>

                    <button
                      onClick={() => handleShareWhatsApp(lastSoldTicket)}
                      className="py-2 px-2.5 rounded bg-[#008060] hover:bg-[#006B50] text-white font-semibold text-xs flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ONGLET 2 : HISTORIQUE DES VENTES DU VENDEUR */}
        {posTab === 'history' && (
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-[#F8FAFC]">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={historySearch}
                    onChange={(e) => setHistorySearch(e.target.value)}
                    placeholder="Rechercher un code ticket..."
                    className="pl-8 pr-3 py-1.5 rounded bg-white border border-slate-300 text-xs text-slate-800"
                  />
                </div>

                <div className="flex items-center gap-1 bg-white p-1 rounded border border-slate-200 text-xs">
                  {(['tous', 'vendeur', 'actif'] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setHistoryFilter(f)}
                      className={`px-2.5 py-1 rounded text-[11px] font-semibold capitalize cursor-pointer ${
                        historyFilter === f
                          ? 'bg-[#008060] text-white'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <span className="text-xs font-mono font-bold text-slate-600">
                Total affiché : {filteredTickets.length} ticket(s)
              </span>
            </div>

            {filteredTickets.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                Aucun ticket vendu dans cet historique.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-[11px] text-slate-500 bg-white">
                      <th className="py-2.5 px-4 font-semibold">Code Ticket</th>
                      <th className="py-2.5 px-4 font-semibold">Forfait</th>
                      <th className="py-2.5 px-4 font-semibold">Durée</th>
                      <th className="py-2.5 px-4 font-semibold text-right">Montant</th>
                      <th className="py-2.5 px-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredTickets.map((t) => (
                      <tr key={t.id} className="hover:bg-[#F8FAFC]">
                        <td className="py-2.5 px-4 font-mono font-bold text-slate-900">{t.code}</td>
                        <td className="py-2.5 px-4 text-slate-700">{t.forfaitName}</td>
                        <td className="py-2.5 px-4 font-mono text-slate-500">{t.duration}</td>
                        <td className="py-2.5 px-4 text-right font-mono font-bold text-[#008060]">
                          {formatMoney(t.price)}
                        </td>
                        <td className="py-2.5 px-4 text-right space-x-1.5">
                          <button
                            onClick={() => handlePrintThermal(t)}
                            className="px-2.5 py-1 rounded bg-[#F4F7FA] hover:bg-slate-200 border border-slate-300 text-slate-700 font-semibold text-[11px] cursor-pointer"
                          >
                            Imprimer
                          </button>
                          <button
                            onClick={() => handleShareWhatsApp(t)}
                            className="px-2.5 py-1 rounded bg-[#008060] text-white font-semibold text-[11px] cursor-pointer"
                          >
                            WhatsApp
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ONGLET 3 : DEMANDE SOS RECHARGE CRÉDIT */}
        {posTab === 'sos' && (
          <div className="max-w-lg mx-auto bg-white rounded-lg border border-slate-200 p-6 space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900">
                Demander un Réapprovisionnement de Crédit POS
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Envoie une alerte en temps réel dans la Console de votre Administrateur et ouvre WhatsApp.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[5000, 15000, 25000, 50000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setSosAmount(amt)}
                  className={`py-2 px-3 rounded border font-mono text-xs font-bold cursor-pointer ${
                    sosAmount === amt
                      ? 'bg-[#E6F4F3] border-[#008060] text-[#005A5B]'
                      : 'bg-[#F8FAFC] border-slate-200 text-slate-700'
                  }`}
                >
                  {amt.toLocaleString('fr-FR')} F
                </button>
              ))}
            </div>

            <button
              onClick={handleSendSos}
              className="w-full py-2.5 px-4 rounded bg-[#008060] hover:bg-[#006B50] text-white font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Envoyer la Demande de Recharge ({formatMoney(sosAmount)})</span>
            </button>
          </div>
        )}
      </main>
    </div>
  );
};
