import React from 'react';
import { useApp, PublicTab } from '../../context/AppContext';
import { Wifi, Mail, Phone, MapPin, ShieldCheck, Cpu, ArrowUpRight } from 'lucide-react';

export const Footer: React.FC = () => {
  const { setCurrentSpace, setPublicTab } = useApp();

  const handleLink = (tab: PublicTab) => {
    setCurrentSpace('public');
    setPublicTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="w-full bg-slate-950 border-t border-slate-800/80 pt-16 pb-24 sm:pb-12 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Col 1: Identity & Publisher */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-slate-950 shadow-md font-bold">
                <Wifi className="w-5 h-5" />
              </div>
              <span className="text-xl font-extrabold text-white font-sans">
                Joo<span className="text-amber-500">wifi</span>
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Plateforme SaaS & PWA de gestion cloud de hotspots WiFi MikroTik en Afrique de l'Ouest.
              Pilotez vos routeurs, générez des tickets, équipez vos vendeurs POS et suivez vos
              finances sans ouvrir de ports.
            </p>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-2">
              <div className="flex items-center gap-2 text-slate-300 font-semibold">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Édité par Joo studio — Abidjan, Côte d'Ivoire</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <a href="tel:+2250100443839" className="hover:text-emerald-400 transition">
                  +225 01 00 44 38 39
                </a>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Mail className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <a href="mailto:joostudio.pro@gmail.com" className="hover:text-amber-400 transition">
                  joostudio.pro@gmail.com
                </a>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px]">
                🇨🇮 Côte d'Ivoire
              </span>
              <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px]">
                🇬🇳 Guinée
              </span>
              <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px]">
                🇸🇳 Sénégal
              </span>
              <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px]">
                🇧🇯 Bénin
              </span>
              <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px]">
                🇲🇱 Mali
              </span>
            </div>
          </div>

          {/* Col 2: Produit */}
          <div>
            <h4 className="text-xs uppercase font-bold tracking-wider text-slate-200 mb-4">
              Produit
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => handleLink('features')}
                  className="hover:text-white transition flex items-center gap-1"
                >
                  Fonctionnalités <ArrowUpRight className="w-3 h-3 text-slate-600" />
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleLink('pricing')}
                  className="hover:text-white transition flex items-center gap-1"
                >
                  Tarifs & Abonnements <ArrowUpRight className="w-3 h-3 text-slate-600" />
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleLink('pricing')}
                  className="hover:text-white transition flex items-center gap-1"
                >
                  FAQ & Questions <ArrowUpRight className="w-3 h-3 text-slate-600" />
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setCurrentSpace('pos');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="text-amber-400 hover:text-amber-300 font-medium transition"
                >
                  Caisse POS Mobile
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setCurrentSpace('admin');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="text-amber-400 hover:text-blue-300 font-medium transition"
                >
                  Console Cloud MikroTik
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Entreprise */}
          <div>
            <h4 className="text-xs uppercase font-bold tracking-wider text-slate-200 mb-4">
              Entreprise
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => handleLink('about')} className="hover:text-white transition">
                  À propos de Joo studio
                </button>
              </li>
              <li>
                <button onClick={() => handleLink('contact')} className="hover:text-white transition">
                  Contact & Support Abidjan
                </button>
              </li>
              <li>
                <a
                  href="https://wa.me/2250100443839"
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                >
                  Assistance WhatsApp (+225)
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Légal */}
          <div>
            <h4 className="text-xs uppercase font-bold tracking-wider text-slate-200 mb-4">
              Légal
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => handleLink('privacy')} className="hover:text-white transition">
                  Politique de confidentialité
                </button>
              </li>
              <li>
                <button onClick={() => handleLink('terms')} className="hover:text-white transition">
                  Conditions d'utilisation (CGU)
                </button>
              </li>
              <li>
                <button onClick={() => handleLink('refund')} className="hover:text-white transition">
                  Politique de remboursement
                </button>
              </li>
              <li>
                <button onClick={() => handleLink('cookies')} className="hover:text-white transition">
                  Politique de cookies
                </button>
              </li>
              <li>
                <button onClick={() => handleLink('legal')} className="hover:text-white transition">
                  Mentions légales
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar & Trust Badges */}
        <div className="pt-8 border-t border-slate-900 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Zero-Trust • Modèle Pull Cloud 45s</span>
            </span>
            <span className="hidden sm:inline text-slate-700">•</span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <Cpu className="w-4 h-4 text-amber-400" />
              <span>MikroTik RouterOS v6.44+ & v7+</span>
            </span>
          </div>

          <p className="text-slate-400 text-center md:text-right">
            © {new Date().getFullYear()} Joowifi — Tous droits réservés. Joo studio (Abidjan).
          </p>
        </div>
      </div>
    </footer>
  );
};
