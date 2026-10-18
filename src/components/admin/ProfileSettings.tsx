import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { User, Globe, ShieldCheck, Save, Lock } from 'lucide-react';

export const ProfileSettings: React.FC = () => {
  const { operatorProfile, updateOperatorProfile, currency, setCurrency } = useApp();

  const [name, setName] = useState(operatorProfile.name);
  const [company, setCompany] = useState(operatorProfile.company);
  const [email, setEmail] = useState(operatorProfile.email);
  const [phone, setPhone] = useState(operatorProfile.phone);
  const [city, setCity] = useState(operatorProfile.city);
  const [ispCost, setIspCost] = useState(operatorProfile.defaultIspMonthlyCost);
  const [twoFactor, setTwoFactor] = useState(operatorProfile.twoFactorEnabled);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateOperatorProfile({
      name,
      company,
      email,
      phone,
      city,
      defaultIspMonthlyCost: ispCost,
      twoFactorEnabled: twoFactor,
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="p-5 rounded-2xl bg-slate-900/40 backdrop-blur-md border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <User className="w-5 h-5" />
            </div>
            <span>Profil Opérateur, Devise & Sécurité</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Paramétrez les informations de votre structure télécom, votre devise de référence et la sécurité JWT/Bcrypt.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* Profile Card */}
        <div className="p-6 rounded-2xl bg-slate-900/40 backdrop-blur-md border border-white/10 space-y-4">
          <h2 className="text-sm font-bold text-white border-b border-white/10 pb-3">
            Identité de l'Opérateur WiFi
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-slate-300 font-medium">Nom du responsable</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white focus:outline-none focus:border-amber-500 text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-medium">Raison sociale / Enseigne</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white focus:outline-none focus:border-amber-500 text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-medium">Email administrateur</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white focus:outline-none focus:border-amber-500 text-xs font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-medium">Téléphone & Support WhatsApp</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white focus:outline-none focus:border-amber-500 text-xs font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-medium">Ville & Siège d'exploitation</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white focus:outline-none focus:border-amber-500 text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-medium">Coût FAI / Fibre mensuel par défaut (FCFA)</label>
              <input
                type="number"
                step="5000"
                value={ispCost}
                onChange={(e) => setIspCost(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white focus:outline-none focus:border-amber-500 text-xs font-mono tabular-nums"
              />
            </div>
          </div>
        </div>

        {/* Currency Setting */}
        <div className="p-6 rounded-2xl bg-slate-900/40 backdrop-blur-md border border-white/10 space-y-3">
          <h2 className="text-sm font-bold text-white border-b border-white/10 pb-3 flex items-center gap-2">
            <Globe className="w-4 h-4 text-amber-400" />
            <span>Devise d'Affichage Multi-Pays</span>
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            {[
              { code: 'XOF', label: 'Franc CFA (FCFA)', desc: 'Côte d’Ivoire, Sénégal, Bénin, Mali' },
              { code: 'GNF', label: 'Franc Guinéen (GNF)', desc: 'Guinée Conakry' },
              { code: 'EUR', label: 'Euro (€)', desc: 'Parité fixe 655.957 FCFA' },
              { code: 'USD', label: 'Dollar US ($)', desc: 'Taux international ~600 FCFA' },
            ].map((c) => (
              <button
                key={c.code}
                type="button"
                onClick={() => setCurrency(c.code as any)}
                className={`p-3.5 rounded-xl border text-left transition cursor-pointer ${
                  currency === c.code
                    ? 'bg-amber-500/20 border-amber-500 text-white'
                    : 'bg-slate-950 border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                <div className="font-mono font-extrabold text-amber-400 text-xs">{c.code}</div>
                <div className="text-[11px] text-slate-200 font-semibold mt-0.5">{c.label}</div>
                <div className="text-[10px] text-slate-500 mt-1">{c.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Security Specs Info */}
        <div className="p-6 rounded-2xl bg-slate-900/40 backdrop-blur-md border border-white/10 space-y-4">
          <h2 className="text-sm font-bold text-white border-b border-white/10 pb-3 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Architecture & Sécurité Cloud Zero-Trust</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-slate-300">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-white/10">
              <strong className="text-emerald-400 block text-xs">Modèle Pull Strict 45s</strong>
              <span className="text-[10px] text-slate-400">
                0 port entrant ouvert • Compatible CGNAT 4G/Starlink
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-white/10">
              <strong className="text-amber-400 block text-xs font-mono">Bcrypt (cost 12)</strong>
              <span className="text-[10px] text-slate-400">
                Hachage cryptographique irréversible des mots de passe
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-white/10">
              <strong className="text-cyan-400 block text-xs font-mono">Cookies JWT httpOnly</strong>
              <span className="text-[10px] text-slate-400">
                Protection stricte contre l'exfiltration XSS
              </span>
            </div>
          </div>

          <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-white/10 cursor-pointer">
            <div className="flex items-center gap-2.5">
              <Lock className="w-4 h-4 text-amber-400" />
              <div>
                <strong className="text-white block">Validation renforcée des retraits Mobile Money</strong>
                <span className="text-[11px] text-slate-400">
                  Exiger une confirmation sur chaque demande de virement supérieure à 50 000 FCFA.
                </span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={twoFactor}
              onChange={(e) => setTwoFactor(e.target.checked)}
              className="accent-amber-500 w-4 h-4 rounded"
            />
          </label>
        </div>

        <button
          type="submit"
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-extrabold text-xs transition cursor-pointer shadow-lg shadow-amber-500/20 flex items-center gap-2 active:scale-95"
        >
          <Save className="w-4 h-4" />
          <span>Enregistrer les modifications</span>
        </button>
      </form>
    </div>
  );
};
