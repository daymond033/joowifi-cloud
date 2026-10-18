import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Lock, Mail, User, ShieldCheck, Smartphone, Eye, EyeOff, ArrowRight, Wifi } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, authMode, login } = useApp();
  const [mode, setMode] = useState<'login' | 'register'>(authMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(email || 'admin@joowifi.pro', 'admin', name || 'Administrateur Joowifi');
  };

  const handleDemoAdmin = () => {
    login('joostudio.pro@gmail.com', 'admin', 'Jean-Marc Koffi (Admin)');
  };

  const handleDemoVendor = () => {
    login('awa.traore@joowifi.pro', 'staff', 'Awa Traoré (Vendeuse POS)');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="w-full max-w-md rounded-3xl bg-[#0B0F19] border border-white/15 p-6 sm:p-8 shadow-2xl text-slate-100 relative">
        <button
          onClick={closeAuthModal}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6 space-y-1">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-slate-950 font-bold">
              <Wifi className="w-4 h-4 stroke-[2.5]" />
            </div>
            <span className="font-extrabold text-white text-lg">
              Joo<span className="text-amber-500">wifi</span>
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-white">
            {mode === 'login' ? 'Connexion à votre espace' : 'Créer un compte opérateur'}
          </h2>
          <p className="text-xs text-slate-400">
            {mode === 'login'
              ? 'Accédez à votre console de gestion Cloud MikroTik ou à votre caisse POS.'
              : 'Monétisez vos hotspots WiFi en Afrique de l’Ouest en mode Zero-Configuration.'}
          </p>
        </div>

        {/* Quick Demo Shortcuts */}
        <div className="space-y-2 mb-6 p-3.5 rounded-2xl bg-slate-950 border border-white/10 text-xs">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Accès Démo Instantané (1-Clic) :
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleDemoAdmin}
              className="p-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 font-bold flex items-center justify-center gap-1.5 transition text-[11px] cursor-pointer active:scale-95"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Console Admin</span>
            </button>
            <button
              type="button"
              onClick={handleDemoVendor}
              className="p-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 font-bold flex items-center justify-center gap-1.5 transition text-[11px] cursor-pointer active:scale-95"
            >
              <Smartphone className="w-3.5 h-3.5 text-amber-400" />
              <span>Caisse POS</span>
            </button>
          </div>
        </div>

        {/* Regular Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {mode === 'register' && (
            <div className="space-y-1">
              <label className="text-slate-300 font-medium">Nom de l'entreprise ou réseau</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  placeholder="Ex: Abidjan WiFi Solutions"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-xs"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-slate-300 font-medium">Adresse email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                placeholder="operateur@domaine.ci"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-xs font-mono"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-medium">Mot de passe</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-xs"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 mt-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-extrabold text-xs transition cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 active:scale-95"
          >
            <span>{mode === 'login' ? 'Se connecter' : 'Créer mon compte'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-white/10 text-center text-xs text-slate-400">
          {mode === 'login' ? (
            <span>
              Pas encore de compte ?{' '}
              <button
                type="button"
                onClick={() => setMode('register')}
                className="text-amber-400 hover:underline font-bold cursor-pointer"
              >
                Créer un compte
              </button>
            </span>
          ) : (
            <span>
              Déjà inscrit ?{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-amber-400 hover:underline font-bold cursor-pointer"
              >
                Se connecter
              </button>
            </span>
          )}
        </div>

        <div className="mt-4 text-[10px] text-slate-500 text-center flex items-center justify-center gap-1">
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          <span>Sessions protégées par cookies JWT httpOnly & hachage bcrypt (cost 12)</span>
        </div>
      </div>
    </div>
  );
};
