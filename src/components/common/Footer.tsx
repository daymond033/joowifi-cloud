import React from 'react';
import { useApp, PublicTab } from '../../context/AppContext';
import { Mail, Phone, MapPin, ShieldCheck, Cpu } from 'lucide-react';

export const Footer: React.FC = () => {
  const { setCurrentSpace, setPublicTab } = useApp();

  const handleLink = (tab: PublicTab) => {
    setCurrentSpace('public');
    setPublicTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="w-full bg-[#2B2E33] text-gray-300 text-sm border-t border-gray-700 pt-14 pb-20 sm:pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-10">
          {/* Col 1: Corporate Brand */}
          <div className="lg:col-span-2 space-y-4">
            <div className="inline-flex flex-col">
              <span className="text-2xl font-bold tracking-tight text-white leading-none">
                Joowifi
              </span>
              <span className="text-[10px] font-medium text-teal-300 tracking-wide text-right mt-0.5">
                by Ivoire Réseaux
              </span>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed max-w-sm">
              Solution professionnelle SDN (Software Defined Networking) pour le pilotage centralisé de passerelles MikroTik RouterOS, la monétisation par vouchers et l'encaissement POS Mobile Money.
            </p>

            <div className="space-y-1.5 text-xs text-gray-300 pt-1">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#4ADE80] shrink-0" />
                <span>Direction Technique : Abidjan, Côte d'Ivoire & Libreville, Gabon</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#4ADE80] shrink-0" />
                <span>+225 01 00 44 38 39</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#4ADE80] shrink-0" />
                <span>joostudio.pro@gmail.com</span>
              </div>
            </div>
          </div>

          {/* Col 2: Produits SDN */}
          <div>
            <h4 className="text-xs uppercase font-bold tracking-wider text-white mb-4">
              Produits SDN
            </h4>
            <ul className="space-y-2.5 text-xs text-gray-300">
              <li>
                <button onClick={() => setCurrentSpace('admin')} className="hover:text-white transition cursor-pointer">
                  Contrôleur Cloud Joowifi
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentSpace('pos')} className="hover:text-white transition cursor-pointer">
                  Terminal Caisse POS Vendeurs
                </button>
              </li>
              <li>
                <button onClick={() => handleLink('features')} className="hover:text-white transition cursor-pointer">
                  Passerelles MikroTik v6 & v7
                </button>
              </li>
              <li>
                <button onClick={() => handleLink('pricing')} className="hover:text-white transition cursor-pointer">
                  Licences & Abonnements B2B
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Ressources & Support */}
          <div>
            <h4 className="text-xs uppercase font-bold tracking-wider text-white mb-4">
              Support & Formation
            </h4>
            <ul className="space-y-2.5 text-xs text-gray-300">
              <li>
                <button onClick={() => setCurrentSpace('admin')} className="hover:text-white transition cursor-pointer">
                  Documentation Script RouterOS
                </button>
              </li>
              <li>
                <button onClick={() => handleLink('about')} className="hover:text-white transition cursor-pointer">
                  À propos de Joowifi SDN
                </button>
              </li>
              <li>
                <button onClick={() => handleLink('contact')} className="hover:text-white transition cursor-pointer">
                  Contacter un ingénieur réseau
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Conformité & Légal */}
          <div>
            <h4 className="text-xs uppercase font-bold tracking-wider text-white mb-4">
              Informations Légales
            </h4>
            <ul className="space-y-2.5 text-xs text-gray-300">
              <li>
                <button onClick={() => handleLink('privacy')} className="hover:text-white transition cursor-pointer">
                  Politique de confidentialité
                </button>
              </li>
              <li>
                <button onClick={() => handleLink('terms')} className="hover:text-white transition cursor-pointer">
                  Conditions d'utilisation (CGU)
                </button>
              </li>
              <li>
                <button onClick={() => handleLink('cookies')} className="hover:text-white transition cursor-pointer">
                  Paramètres des cookies
                </button>
              </li>
              <li>
                <button onClick={() => handleLink('legal')} className="hover:text-white transition cursor-pointer">
                  Mentions légales
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#4ADE80]" />
              <span>Architecture Cloud Pull HTTPS 45s / Fast-Poll 10s</span>
            </span>
            <span className="hidden sm:inline">|</span>
            <span className="flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-[#4ADE80]" />
              <span>Certifié MikroTik RouterOS v6.49+ & v7.24+</span>
            </span>
          </div>
          <p>Copyright © {new Date().getFullYear()} Joowifi SDN Systems. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
};
