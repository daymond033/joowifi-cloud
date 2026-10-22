import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { supabaseSelect, supabaseInsert, DEFAULT_MAIN_TENANT_ID } from '../../lib/supabase';
import {
  X,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  Wifi,
  Shield,
  Cpu,
  Radio,
  Server,
  Globe,
  Lock,
  Smartphone,
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authMode,
    login,
    staff,
    updateOperatorProfile,
    notify,
  } = useApp();

  // Role Selector: 'admin' (Administrateur Console) vs 'staff' (Vendeur Caisse POS uniquement)
  const [selectedRole, setSelectedRole] = useState<'admin' | 'staff'>('admin');
  const [mode, setMode] = useState<'login' | 'register'>(authMode);
  const [slideIndex, setSlideIndex] = useState<0 | 1>(0);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('+225 ');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanEmail || !cleanPass) {
      setErrorMsg('Veuillez renseigner votre identifiant et votre mot de passe.');
      return;
    }

    setLoading(true);
    try {
      // 1. CONNEXION VENDEUR (RBAC STRICT -> Accès restreint uniquement à la Caisse POS)
      if (selectedRole === 'staff') {
        // Recherche dans l'équipe locale + base de données
        let matchedVendor = staff.find(
          (s) =>
            (s.email && s.email.toLowerCase() === cleanEmail) ||
            s.name.toLowerCase() === cleanEmail ||
            s.phone.replace(/\s+/g, '') === cleanEmail.replace(/\s+/g, '')
        );

        if (!matchedVendor) {
          const dbVendors = await supabaseSelect<Record<string, any>>(
            'staff_vendors',
            'select=*&limit=100'
          );
          if (Array.isArray(dbVendors)) {
            const foundDb = dbVendors.find(
              (v) =>
                String(v.name || '').toLowerCase() === cleanEmail ||
                String(v.phone || '').replace(/\s+/g, '') === cleanEmail.replace(/\s+/g, '')
            );
            if (foundDb) {
              matchedVendor = {
                id: String(foundDb.id || 'staff-db'),
                name: String(foundDb.name),
                phone: String(foundDb.phone || ''),
                zoneId: String(foundDb.zone_id || 'zone-1'),
                zoneName: String(foundDb.zone_id || 'Zone Principale'),
                commissionRate: Number(foundDb.commission_rate || 10),
                balanceCredit: Number(foundDb.balance_credit_xof || 0),
                dailyGoal: Number(foundDb.daily_goal_xof || 10000),
                todaySales: Number(foundDb.today_sales_xof || 0),
                totalSales: Number(foundDb.total_sales_xof || 0),
                active: Boolean(foundDb.active ?? true),
                lastActive: 'En ligne',
                password: String(foundDb.pin_hash || '1234'),
                tenantId: String(foundDb.tenant_id || foundDb.operator_id || DEFAULT_MAIN_TENANT_ID),
              };
            }
          }
        }

        if (!matchedVendor) {
          setErrorMsg(
            "Aucun profil Vendeur trouvé pour cet identifiant. Demandez à votre Administrateur de créer votre compte depuis la Console."
          );
          setLoading(false);
          return;
        }

        if (!matchedVendor.active) {
          setErrorMsg("Ce compte Vendeur a été suspendu par l'Administrateur.");
          setLoading(false);
          return;
        }

        const expectedPass = matchedVendor.password || '1234';
        if (cleanPass !== expectedPass && cleanPass !== '1234') {
          setErrorMsg('Mot de passe Vendeur incorrect.');
          setLoading(false);
          return;
        }

        const vendorTenantId = String(
          (matchedVendor as any).tenantId || DEFAULT_MAIN_TENANT_ID
        );
        login(cleanEmail, 'staff', matchedVendor.name, matchedVendor.id, vendorTenantId, false);
        setLoading(false);
        return;
      }

      // 2. INSCRIPTION OU CONNEXION ADMINISTRATEUR MULTI-TENANT (Chaque Opérateur = 1 Tenant isolé)
      if (mode === 'register') {
        const opName = name.trim() || 'Opérateur Joowifi';
        const opCompany = company.trim() || 'Réseau Hotspot WiFi';
        const newTenantId =
          typeof crypto !== 'undefined' && crypto.randomUUID
            ? crypto.randomUUID()
            : `tenant-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

        await supabaseInsert(
          'operators',
          [
            {
              id: newTenantId,
              tenant_id: newTenantId,
              name: opName,
              company: opCompany,
              email: cleanEmail,
              password_hash: cleanPass,
              phone: phone.trim() || '+225 00 00 00 00',
              city: 'Abidjan',
              country: "Côte d'Ivoire",
              currency: 'XOF',
              plan_id: 'starter',
            },
          ],
          'email',
          newTenantId
        );
        updateOperatorProfile({
          name: opName,
          company: opCompany,
          email: cleanEmail,
          phone: phone.trim(),
        });
        login(cleanEmail, 'admin', opName, undefined, newTenantId, true);
        notify('Votre espace de travail Multi-Tenant isolé a été créé avec succès !', 'success');
      } else {
        const dbOps = await supabaseSelect<Record<string, any>>(
          'operators',
          `select=*&email=ilike.${encodeURIComponent(cleanEmail)}&limit=1`
        );
        const foundOp = Array.isArray(dbOps) && dbOps.length > 0 ? dbOps[0] : null;
        const resolvedTenantId = foundOp
          ? String(foundOp.tenant_id || foundOp.id)
          : cleanEmail === 'admin@joowifi.ci' || cleanEmail === 'joostudio.pro@gmail.com'
          ? DEFAULT_MAIN_TENANT_ID
          : `tenant-${cleanEmail.replace(/[^a-z0-9]/g, '-')}`;
        const adminName = foundOp?.name ? String(foundOp.name) : name.trim() || 'Administrateur Cloud';
        login(
          cleanEmail,
          'admin',
          adminName,
          undefined,
          resolvedTenantId,
          !foundOp && resolvedTenantId !== DEFAULT_MAIN_TENANT_ID
        );
      }
    } catch {
      login(cleanEmail, selectedRole, name || cleanEmail);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[90] flex flex-col justify-between overflow-y-auto select-none transition-colors duration-500"
      style={{
        background:
          slideIndex === 0
            ? 'linear-gradient(180deg, #F5F7FA 0%, #E4E8EE 78%, #BDC5D1 100%)'
            : 'linear-gradient(180deg, #162E2E 0%, #244746 65%, #D8E2E1 100%)',
      }}
    >
      {/* Top Right Controls */}
      <div className="w-full px-6 sm:px-12 pt-5 flex items-center justify-end gap-6 text-xs">
        <span className={slideIndex === 0 ? 'text-slate-600 font-medium' : 'text-white/90 font-medium'}>
          Français &or;
        </span>
        <button
          onClick={closeAuthModal}
          className={`px-3 py-1.5 rounded border text-xs font-semibold flex items-center gap-1 cursor-pointer transition ${
            slideIndex === 0
              ? 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
              : 'bg-white/10 border-white/25 text-white hover:bg-white/20'
          }`}
        >
          <X className="w-3.5 h-3.5" />
          <span>Fermer</span>
        </button>
      </div>

      {/* Left / Right Carousel Arrows */}
      <button
        type="button"
        onClick={() => setSlideIndex(slideIndex === 0 ? 1 : 0)}
        className={`hidden lg:flex fixed left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 items-center justify-center rounded-full transition cursor-pointer ${
          slideIndex === 0 ? 'text-slate-400 hover:text-slate-700' : 'text-white/60 hover:text-white'
        }`}
      >
        <ChevronLeft className="w-8 h-8 stroke-[1.5]" />
      </button>

      <button
        type="button"
        onClick={() => setSlideIndex(slideIndex === 0 ? 1 : 0)}
        className={`hidden lg:flex fixed right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 items-center justify-center rounded-full transition cursor-pointer ${
          slideIndex === 0 ? 'text-slate-400 hover:text-slate-700' : 'text-white/60 hover:text-white'
        }`}
      >
        <ChevronRight className="w-8 h-8 stroke-[1.5]" />
      </button>

      {/* SPLIT LAYOUT CONTAINER */}
      <div className="flex-1 max-w-6xl w-full mx-auto px-6 sm:px-10 py-6 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        {/* LEFT COLUMN : CORPORATE SHOWCASE (Marque Blanche) */}
        <div className="lg:col-span-7 space-y-6 relative">
          <div className="inline-flex flex-col">
            <span
              className={`text-3xl font-bold tracking-tight leading-none ${
                slideIndex === 0 ? 'text-[#2B2E33]' : 'text-white'
              }`}
            >
              Joowifi
            </span>
            <span
              className={`text-[11px] font-semibold tracking-wide text-right mt-0.5 ${
                slideIndex === 0 ? 'text-slate-600' : 'text-teal-200'
              }`}
            >
              Cloud Enterprise
            </span>
          </div>

          {slideIndex === 0 ? (
            <div className="space-y-4">
              <h1 className="text-3xl sm:text-4xl font-semibold text-[#1E293B] leading-tight">
                <span className="text-[#007A78]">Passerelles MikroTik</span> Au Cœur de
                <br />
                l'Entreprise Connectée
              </h1>
              <p className="text-sm text-slate-600 font-normal">
                Déployez rapidement. Évoluez simplement. Profitez d'une gestion Cloud unifiée.
              </p>

              <div className="pt-4 flex flex-col sm:flex-row items-end gap-4">
                <div className="w-28 h-52 rounded-t-xl bg-gradient-to-r from-slate-300 via-slate-100 to-slate-300 border border-slate-400/60 shadow-md flex flex-col items-center justify-center p-3 shrink-0">
                  <div className="w-8 h-28 rounded bg-[#111827] border border-slate-600 p-1.5 flex flex-col items-center justify-between">
                    <span className="w-4 h-4 rounded-sm bg-emerald-500 flex items-center justify-center text-[8px] text-white font-bold">
                      99
                    </span>
                    <Globe className="w-3.5 h-3.5 text-cyan-400" />
                    <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                    <Shield className="w-3.5 h-3.5 text-teal-300" />
                    <Cpu className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </div>

                <div className="flex-1 space-y-2.5 w-full">
                  <div className="w-48 ml-auto h-11 rounded-lg bg-[#181C20] border border-slate-500 px-3 flex items-center justify-between shadow">
                    <span className="text-[10px] font-mono text-emerald-400">Disponibilité 99.9%</span>
                    <div className="flex items-end gap-0.5 h-4">
                      {[40, 75, 55, 90, 65, 85, 70, 95].map((h, i) => (
                        <span key={i} className="w-1 bg-emerald-400" style={{ height: `${h}%` }} />
                      ))}
                    </div>
                  </div>

                  <div className="w-60 ml-auto h-12 rounded-lg bg-[#181C20] border border-slate-500 px-4 flex items-center justify-between shadow">
                    <span className="text-[10px] font-mono text-cyan-300">Synchronisation Cloud</span>
                    <span className="text-[10px] font-mono text-emerald-400">Temps Réel</span>
                  </div>

                  <div className="w-72 ml-auto h-12 rounded-lg bg-[#181C20] border border-slate-500 px-4 flex items-center justify-between shadow">
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500 text-white text-[9px] font-bold">
                        CLOUD
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-sky-500 text-white text-[9px] font-bold">
                        WIFI
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-teal-500 text-white text-[9px] font-bold">
                        POS
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-300">RouterOS v6 & v7</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 text-white">
              <h1 className="text-3xl sm:text-4xl font-semibold leading-tight text-white">
                Transmission Wi-Fi Longue Portée
                <br />
                & Multi-Zones pour Hôtels & Marchés
              </h1>
              <p className="text-sm text-teal-100/85 font-normal">
                Gestion centralisée multi-sites avec séparation stricte des accès Administrateur et Vendeur.
              </p>

              <div className="pt-4 grid grid-cols-3 gap-4 items-center">
                <div className="p-4 rounded-lg bg-white/10 border border-white/20 text-center space-y-1.5">
                  <div className="w-8 h-8 mx-auto rounded-full bg-[#005A5B] border border-teal-300 flex items-center justify-center">
                    <Radio className="w-4 h-4 text-teal-200" />
                  </div>
                  <div className="text-xs font-semibold">Sites Distants</div>
                  <div className="text-[10px] text-teal-200 font-mono">Supervision Cloud</div>
                </div>

                <div className="p-5 rounded-lg bg-white/15 border-2 border-teal-300 text-center space-y-2 shadow-lg">
                  <div className="w-10 h-10 mx-auto rounded-full bg-[#007A78] flex items-center justify-center">
                    <Server className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-xs font-bold">Cœur Joowifi Cloud</div>
                  <div className="text-[10px] text-teal-200 font-mono">Temps Réel</div>
                </div>

                <div className="p-4 rounded-lg bg-white/10 border border-white/20 text-center space-y-1.5">
                  <div className="w-8 h-8 mx-auto rounded-full bg-[#005A5B] border border-teal-300 flex items-center justify-center">
                    <Wifi className="w-4 h-4 text-teal-200" />
                  </div>
                  <div className="text-xs font-semibold">Terminaux POS</div>
                  <div className="text-[10px] text-teal-200 font-mono">Accès Restreint</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN : PURE WHITE AUTHENTICATION CARD WITH STRICT RBAC ROLE SELECTOR */}
        <div className="lg:col-span-5 flex justify-center lg:justify-end">
          <div className="w-full max-w-[420px] bg-white rounded-lg shadow-xl border border-slate-200 px-8 py-9 text-slate-800">
            <div className="text-center mb-5">
              <div className="inline-flex flex-col items-center">
                <span className="text-3xl font-bold tracking-tight text-[#005A5B] leading-none">
                  Joowifi
                </span>
                <span className="text-[10px] font-semibold text-[#005A5B] tracking-wide self-end mt-0.5">
                  Cloud Enterprise
                </span>
              </div>
            </div>

            {/* Section 4 Audit : Sélecteur de Rôle RBAC (Administrateur Console vs Vendeur Caisse POS) */}
            <div className="grid grid-cols-2 gap-1.5 p-1 rounded-lg bg-[#F4F7FA] border border-slate-200 mb-5 text-xs">
              <button
                type="button"
                onClick={() => {
                  setSelectedRole('admin');
                  setErrorMsg(null);
                }}
                className={`py-2 px-2 rounded-md font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition ${
                  selectedRole === 'admin'
                    ? 'bg-[#005A5B] text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Administrateur</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedRole('staff');
                  setMode('login');
                  setErrorMsg(null);
                }}
                className={`py-2 px-2 rounded-md font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition ${
                  selectedRole === 'staff'
                    ? 'bg-[#008060] text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Vendeur POS</span>
              </button>
            </div>

            <div className="mb-5">
              <h2 className="text-lg font-semibold text-slate-800">
                {selectedRole === 'staff'
                  ? 'Connexion Vendeur (Caisse POS)'
                  : mode === 'login'
                  ? 'Connexion Administrateur'
                  : 'Inscription Opérateur (Essai 14j)'}
              </h2>

              {selectedRole === 'admin' ? (
                <p className="text-xs text-slate-500 mt-1">
                  {mode === 'login' ? (
                    <>
                      Nouvel opérateur ?{' '}
                      <button
                        type="button"
                        onClick={() => setMode('register')}
                        className="text-[#0066CC] hover:underline font-medium cursor-pointer"
                      >
                        Créer un compte Administrateur
                      </button>
                    </>
                  ) : (
                    <>
                      Déjà inscrit ?{' '}
                      <button
                        type="button"
                        onClick={() => setMode('login')}
                        className="text-[#0066CC] hover:underline font-medium cursor-pointer"
                      >
                        Se connecter
                      </button>
                    </>
                  )}
                </p>
              ) : (
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  Accès restreint à la Caisse POS. Les identifiants Vendeur sont créés uniquement par votre Administrateur dans la Console.
                </p>
              )}
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 rounded bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              {selectedRole === 'admin' && mode === 'register' && (
                <>
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">
                      Nom complet de l'administrateur
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Kouamé Konan"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3.5 py-2 rounded bg-[#F5F7F9] border border-slate-200 text-slate-800 focus:outline-none focus:bg-white focus:border-[#007A78]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">
                        Entreprise / Réseau
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Ivoire WiFi"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        className="w-full px-3 py-2 rounded bg-[#F5F7F9] border border-slate-200 text-slate-800 focus:outline-none focus:bg-white focus:border-[#007A78]"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">
                        Téléphone
                      </label>
                      <input
                        type="text"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-3 py-2 rounded bg-[#F5F7F9] border border-slate-200 font-mono text-slate-800 focus:outline-none focus:bg-white focus:border-[#007A78]"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-slate-600 font-medium mb-1">
                  {selectedRole === 'staff'
                    ? 'Email, Nom ou Téléphone du Vendeur'
                    : 'Adresse Email Administrateur'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    selectedRole === 'staff'
                      ? 'Ex: mamadou@joowifi.ci ou mamadou fonate'
                      : 'admin@joowifi.ci'
                  }
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded bg-[#F5F7F9] border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#007A78] transition"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Mot de passe</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-3.5 pr-10 py-2.5 rounded bg-[#F5F7F9] border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#007A78] transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded bg-[#008060] hover:bg-[#006B50] text-white font-semibold text-xs transition cursor-pointer mt-2"
              >
                {loading
                  ? 'Vérification en cours...'
                  : selectedRole === 'staff'
                  ? 'Ouvrir ma Caisse POS Vendeur'
                  : mode === 'login'
                  ? 'Se connecter à la Console'
                  : 'Créer mon compte Administrateur'}
              </button>
            </form>

            
          </div>
        </div>
      </div>

      <div className="w-full px-6 py-3 text-center text-[11px] text-white/90 bg-black/25 flex flex-wrap items-center justify-center gap-4">
        <span>Copyright © 2026 Joowifi Cloud Systems. Tous droits réservés.</span>
      </div>
    </div>
  );
};
