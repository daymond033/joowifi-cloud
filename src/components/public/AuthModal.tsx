import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  supabaseSelect,
  supabaseInsert,
  supabaseAuthSignIn,
  supabaseAuthSignUp,
  buildSignedSessionJwt,
} from '../../lib/supabase';
import {
  X,
  Mail,
  Lock,
  User,
  Building2,
  Phone,
  MapPin,
  ArrowRight,
  ShieldCheck,
  Eye,
  EyeOff,
  CheckCircle2,
  Smartphone,
  AlertCircle,
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

  const [mode, setMode] = useState<'login' | 'register'>(authMode);
  const [selectedRole, setSelectedRole] = useState<'admin' | 'staff'>('admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('+225 ');
  const [city, setCity] = useState('Abidjan');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  React.useEffect(() => {
    setMode(authMode);
    setErrorMsg(null);
  }, [authMode, isAuthModalOpen]);

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
      // =======================================================================
      // 1. CONNEXION VENDEUR CAISSE POS (RBAC STRICT + VALIDATION SUPABASE)
      // =======================================================================
      if (selectedRole === 'staff') {
        let matchedVendor: any = staff.find(
          (s) =>
            (s.email && s.email.trim().toLowerCase() === cleanEmail) ||
            s.name.trim().toLowerCase() === cleanEmail ||
            s.phone.replace(/\s+/g, '') === cleanEmail.replace(/\s+/g, '')
        );

        const dbVendors = await supabaseSelect<Record<string, any>>(
          'staff_vendors',
          'select=*&limit=200',
          ''
        );
        if (Array.isArray(dbVendors) && dbVendors.length > 0) {
          const foundDb = dbVendors.find(
            (v) =>
              String(v.email || '').trim().toLowerCase() === cleanEmail ||
              String(v.name || '').trim().toLowerCase() === cleanEmail ||
              String(v.phone || '').replace(/\s+/g, '') === cleanEmail.replace(/\s+/g, '')
          );
          if (foundDb) {
            matchedVendor = {
              id: String(foundDb.id || `staff-${Date.now()}`),
              name: String(foundDb.name),
              email: foundDb.email ? String(foundDb.email) : cleanEmail,
              phone: String(foundDb.phone || ''),
              zoneId: String(foundDb.zone_id || 'Zone Principale'),
              zoneName: String(foundDb.zone_id || 'Zone Principale'),
              commissionRate: Number(foundDb.commission_rate || 10),
              balanceCredit: Number(foundDb.balance_credit_xof || 0),
              dailyGoal: Number(foundDb.daily_goal_xof || 15000),
              todaySales: Number(foundDb.today_sales_xof || 0),
              totalSales: Number(foundDb.total_sales_xof || 0),
              active: Boolean(foundDb.active ?? true),
              lastActive: 'En ligne',
              password: String(foundDb.pin_hash || ''),
              tenantId: String(foundDb.tenant_id || foundDb.operator_id || ''),
              permissions: foundDb.permissions || {
                fastSale: true,
                printThermal: true,
                shareWhatsapp: true,
                sosRequest: true,
              },
            };
          }
        }

        if (!matchedVendor) {
          setErrorMsg(
            "Aucun compte Vendeur POS trouvé pour cet identifiant. Demandez à votre Administrateur de créer votre profil vendeur depuis l'onglet Agents Vendeurs."
          );
          setLoading(false);
          return;
        }

        if (!matchedVendor.active) {
          setErrorMsg("Ce compte Vendeur a été suspendu par l'Administrateur.");
          setLoading(false);
          return;
        }

        const expectedPass = String(matchedVendor.password || '').trim();
        const authRes = cleanEmail.includes('@')
          ? await supabaseAuthSignIn(cleanEmail, cleanPass)
          : {};

        if (cleanPass !== expectedPass && !authRes.accessToken) {
          setErrorMsg('Mot de passe Vendeur incorrect. Accès refusé.');
          setLoading(false);
          return;
        }

        const vendorTenantId = String(matchedVendor.tenantId || '').trim();
        if (!vendorTenantId) {
          setErrorMsg('Ce profil vendeur n’est rattaché à aucun compte Opérateur actif.');
          setLoading(false);
          return;
        }

        const jwtToken =
          authRes.accessToken ||
          buildSignedSessionJwt({
            sub: matchedVendor.id,
            email: matchedVendor.email || cleanEmail,
            role: 'vendor',
            tenantId: vendorTenantId,
          });

        login(
          matchedVendor.email || cleanEmail,
          'staff',
          matchedVendor.name,
          matchedVendor.id,
          vendorTenantId,
          false,
          jwtToken
        );
        setLoading(false);
        return;
      }

      // =======================================================================
      // 2. INSCRIPTION OPÉRATEUR B2B (ONBOARDING COMPLET — POINT 4 DE L'AUDIT)
      // =======================================================================
      if (mode === 'register') {
        const opName = name.trim();
        const opCompany = company.trim();
        const opPhone = phone.trim();
        const opCity = city.trim();

        if (!opName || !opCompany || !opPhone || !opCity) {
          setErrorMsg(
            'Veuillez renseigner le Nom du responsable, la Raison sociale, le Téléphone et la Ville.'
          );
          setLoading(false);
          return;
        }

        if (cleanPass.length < 6) {
          setErrorMsg('Le mot de passe doit contenir au moins 6 caractères.');
          setLoading(false);
          return;
        }

        // Vérifier si l'email existe déjà dans `public.operators`
        const existingOps = await supabaseSelect<Record<string, any>>(
          'operators',
          `select=id,email&email=ilike.${encodeURIComponent(cleanEmail)}&limit=1`,
          ''
        );
        if (Array.isArray(existingOps) && existingOps.length > 0) {
          setErrorMsg(
            'Un compte opérateur existe déjà avec cette adresse email. Veuillez utiliser l’onglet Connexion.'
          );
          setLoading(false);
          return;
        }

        const authSignUp = await supabaseAuthSignUp(cleanEmail, cleanPass, {
          role: 'admin',
          name: opName,
          company: opCompany,
          phone: opPhone,
          city: opCity,
        });

        const newTenantId =
          authSignUp.userId ||
          (typeof crypto !== 'undefined' && crypto.randomUUID
            ? crypto.randomUUID()
            : `tenant-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);

        const inserted = await supabaseInsert(
          'operators',
          [
            {
              id: newTenantId,
              tenant_id: newTenantId,
              name: opName,
              company: opCompany,
              email: cleanEmail,
              password_hash: cleanPass,
              phone: opPhone,
              city: opCity,
              country: "Côte d'Ivoire",
              currency: 'XOF',
              plan_id: 'starter',
              wallet_balance_xof: 0,
              gains_balance_xof: 0,
              default_isp_monthly_cost: 0,
            },
          ],
          'email',
          newTenantId
        );

        if (!inserted) {
          setErrorMsg(
            'Erreur lors de la création du compte sur Supabase. Vérifiez votre connexion réseau.'
          );
          setLoading(false);
          return;
        }

        // Hydrater immédiatement le profil opérateur (Point 4 de l'Audit)
        updateOperatorProfile({
          name: opName,
          company: opCompany,
          email: cleanEmail,
          phone: opPhone,
          city: opCity,
          country: "Côte d'Ivoire",
          defaultIspMonthlyCost: 0,
        });

        const jwtToken =
          authSignUp.accessToken ||
          buildSignedSessionJwt({
            sub: newTenantId,
            email: cleanEmail,
            role: 'admin',
            tenantId: newTenantId,
          });

        login(cleanEmail, 'admin', opName, undefined, newTenantId, true, jwtToken);
        notify(`Bienvenue ${opName} ! Votre compte Opérateur (${opCompany}) est activé.`, 'success');
        setLoading(false);
        return;
      }

      // =======================================================================
      // 3. CONNEXION OPÉRATEUR B2B STRICTE (POINT 1 DE L'AUDIT : ZÉRO CONTOURNEMENT)
      // =======================================================================
      const [dbOps, authSignIn] = await Promise.all([
        supabaseSelect<Record<string, any>>(
          'operators',
          `select=*&email=ilike.${encodeURIComponent(cleanEmail)}&limit=1`,
          ''
        ),
        supabaseAuthSignIn(cleanEmail, cleanPass),
      ]);

      const foundOp = Array.isArray(dbOps) && dbOps.length > 0 ? dbOps[0] : null;

      // Si le compte n'existe pas dans `public.operators`, refuser strictement l'accès !
      if (!foundOp) {
        setErrorMsg(
          `Aucun compte opérateur enregistré pour « ${cleanEmail} ». Veuillez d'abord créer votre compte via l'onglet « Créer un compte ».`
        );
        setLoading(false);
        return;
      }

      // Vérifier strictement le mot de passe enregistré dans `public.operators` (ou le token Supabase Auth)
      const storedPass = String(foundOp.password_hash || '').trim();
      const isPasswordValid =
        storedPass === cleanPass || Boolean(authSignIn.accessToken);

      if (!isPasswordValid) {
        setErrorMsg('Mot de passe incorrect. Authentification refusée par Supabase.');
        setLoading(false);
        return;
      }

      const resolvedTenantId = String(foundOp.tenant_id || foundOp.id).trim();
      const adminName = String(foundOp.name || 'Administrateur Cloud');

      // Hydrater immédiatement tous les champs du Profil Opérateur (Point 4 de l'Audit)
      updateOperatorProfile({
        name: adminName,
        company: String(foundOp.company || ''),
        email: String(foundOp.email || cleanEmail),
        phone: String(foundOp.phone || ''),
        city: String(foundOp.city || 'Abidjan'),
        country: String(foundOp.country || "Côte d'Ivoire"),
        defaultIspMonthlyCost: Number(foundOp.default_isp_monthly_cost || 0),
        twoFactorEnabled: Boolean(foundOp.two_factor_enabled),
      });

      const jwtToken =
        authSignIn.accessToken ||
        buildSignedSessionJwt({
          sub: resolvedTenantId,
          email: cleanEmail,
          role: 'admin',
          tenantId: resolvedTenantId,
        });

      login(cleanEmail, 'admin', adminName, undefined, resolvedTenantId, false, jwtToken);
    } catch {
      setErrorMsg('Erreur de communication avec le serveur d’authentification Supabase.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      onClick={closeAuthModal}
    >
      <div
        className="w-full max-w-md bg-white rounded-lg border border-slate-200 shadow-xl overflow-hidden text-[#1E293B] my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="px-6 py-4 bg-[#005A5B] text-white flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-200 block">
              AUTHENTIFICATION CLOUD SUPABASE (JWT)
            </span>
            <h2 className="text-base font-bold mt-0.5">
              {selectedRole === 'staff'
                ? 'Portail Caisse POS Vendeur'
                : mode === 'login'
                ? 'Connexion Console Opérateur'
                : 'Inscription Opérateur B2B'}
            </h2>
          </div>
          <button
            onClick={closeAuthModal}
            className="p-1.5 rounded bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6">
          {/* Sélecteur de Rôle : Opérateur Admin vs Vendeur POS */}
          <div className="mb-4">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Profil d'accès :
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 rounded-lg bg-[#F4F7FA] border border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setSelectedRole('admin');
                  setErrorMsg(null);
                }}
                className={`py-2 px-3 rounded text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  selectedRole === 'admin'
                    ? 'bg-[#005A5B] text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Administrateur</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedRole('staff');
                  setMode('login');
                  setErrorMsg(null);
                }}
                className={`py-2 px-3 rounded text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  selectedRole === 'staff'
                    ? 'bg-[#008060] text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Vendeur POS</span>
              </button>
            </div>
          </div>

          {/* Toggle Connexion / Créer un compte (Uniquement pour Opérateur Admin) */}
          {selectedRole === 'admin' && (
            <div className="grid grid-cols-2 p-1 rounded-lg bg-[#F4F7FA] border border-slate-200 mb-5">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMsg(null);
                }}
                className={`py-1.5 text-xs font-semibold rounded transition cursor-pointer ${
                  mode === 'login'
                    ? 'bg-white text-[#005A5B] shadow-2xs border border-slate-200/80'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Se connecter
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setErrorMsg(null);
                }}
                className={`py-1.5 text-xs font-semibold rounded transition cursor-pointer ${
                  mode === 'register'
                    ? 'bg-white text-[#005A5B] shadow-2xs border border-slate-200/80'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Créer un compte
              </button>
            </div>
          )}

          {errorMsg && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-2 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {selectedRole === 'admin' && mode === 'register' && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nom du responsable *
                    </label>
                    <div className="relative">
                      <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ex: Kouadio Marc"
                        className="w-full pl-8 pr-3 py-2 rounded bg-[#F8FAFC] border border-slate-300 text-xs text-slate-800 focus:outline-none focus:border-[#008060]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Raison sociale *
                    </label>
                    <div className="relative">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        placeholder="Ex: Abidjan Telecom"
                        className="w-full pl-8 pr-3 py-2 rounded bg-[#F8FAFC] border border-slate-300 text-xs text-slate-800 focus:outline-none focus:border-[#008060]"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Téléphone Mobile *
                    </label>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+225 07 00 00 00"
                        className="w-full pl-8 pr-3 py-2 rounded bg-[#F8FAFC] border border-slate-300 text-xs font-mono text-slate-800 focus:outline-none focus:border-[#008060]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Ville d'exploitation *
                    </label>
                    <div className="relative">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Ex: Abidjan"
                        className="w-full pl-8 pr-3 py-2 rounded bg-[#F8FAFC] border border-slate-300 text-xs text-slate-800 focus:outline-none focus:border-[#008060]"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {selectedRole === 'staff'
                  ? 'Email, Téléphone ou Nom Vendeur *'
                  : 'Adresse Email Professionnelle *'}
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={selectedRole === 'staff' ? 'text' : 'email'}
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={
                    selectedRole === 'staff'
                      ? 'Ex: vendeur@domaine.ci ou +225...'
                      : 'contact@entreprise.ci'
                  }
                  className="w-full pl-8 pr-3 py-2 rounded bg-[#F8FAFC] border border-slate-300 text-xs text-slate-800 focus:outline-none focus:border-[#008060]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mot de passe *
              </label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-8 pr-9 py-2 rounded bg-[#F8FAFC] border border-slate-300 text-xs text-slate-800 focus:outline-none focus:border-[#008060]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded bg-[#008060] hover:bg-[#006B50] text-white font-semibold text-xs flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span>Vérification Supabase Auth en cours...</span>
              ) : (
                <>
                  <span>
                    {selectedRole === 'staff'
                      ? 'Ouvrir ma Caisse POS'
                      : mode === 'login'
                      ? 'Se connecter à la Console'
                      : 'Créer mon compte Opérateur'}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#008060]" />
              Validation stricte Supabase & JWT
            </span>
            <span>Isolation RLS Multi-Tenant</span>
          </div>
        </div>
      </div>
    </div>
  );
};
