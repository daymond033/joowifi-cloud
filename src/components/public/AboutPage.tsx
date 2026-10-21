import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  MapPin,
  Mail,
  Phone,
  ShieldCheck,
  Award,
  Globe,
  Users,
  Wifi,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  const { setCurrentSpace, setPublicTab } = useApp();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-16">
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-wider text-[#007A78] px-3 py-1 rounded-full bg-[#E6F4F3] border border-[#99D5D3]">
          Notre Histoire & Vision
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-800 font-sans">
          Joo studio : l'ingénierie logicielle au service de la connectivité africaine
        </h1>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          Fondé à Abidjan, Joo studio conçoit des solutions cloud et mobiles pensées pour les
          réalités d'infrastructure télécom en Afrique de l'Ouest.
        </p>
      </div>

      {/* Main Narrative Card */}
      <div className="p-8 sm:p-10 rounded-3xl glass-card border border-slate-200 space-y-6 text-sm text-slate-600 leading-relaxed">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Wifi className="w-5 h-5 text-[#007A78]" />
          <span>Pourquoi avons-nous créé Joowifi ?</span>
        </h2>

        <p>
          En Côte d'Ivoire, en Guinée, au Sénégal, au Bénin et au Mali, les routeurs MikroTik
          RouterBOARD sont les équipements les plus fiables et abordables pour diffuser du WiFi
          dans les quartiers, galeries marchandes, gares, maquis et résidences.
        </p>

        <p>
          Cependant, les opérateurs se heurtaient à deux obstacles majeurs :
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-2">
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider text-rose-400">
              1. L'impasse du CGNAT & IP Dynamique
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              La plupart des box 4G et modems opérateurs ne fournissent pas d'adresses IP publiques
              statiques. Il était impossible d'accéder à son routeur à distance sans louer un serveur
              VPN complexe et coûteux.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-2">
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider text-[#007A78]">
              2. La gestion chaotique des tickets papier
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Générer des tickets manuellement sur User Manager, les imprimer et confier des liasses
              de tickets à des vendeurs sans traçabilité entraînait des vols de crédits et des
              pertes financières considérables.
            </p>
          </div>
        </div>

        <p className="pt-2">
          <strong>Joowifi est la réponse définitive :</strong> une plateforme Cloud Zero-Trust qui
          exploite le modèle Pull (le routeur interroge le cloud toutes les 45 secondes), couplée à
          une application mobile de caisse POS connectée aux passerelles Mobile Money locales (Wave,
          Orange, MTN, Moov).
        </p>
      </div>

      {/* Key Numbers / Trust */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl glass-card text-center space-y-2">
          <div className="w-10 h-10 rounded-xl bg-[#E6F4F3] text-[#007A78] flex items-center justify-center mx-auto">
            <MapPin className="w-5 h-5" />
          </div>
          <div className="text-xl font-bold text-slate-800">Abidjan, CI</div>
          <p className="text-xs text-slate-400">Siège & équipe de développement Joo studio</p>
        </div>

        <div className="p-6 rounded-2xl glass-card text-center space-y-2">
          <div className="w-10 h-10 rounded-xl bg-[#E6F4F3] text-[#008060] flex items-center justify-center mx-auto">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="text-xl font-bold text-slate-800">Zero-Trust</div>
          <p className="text-xs text-slate-400">Sécurité maximale, 0 port ouvert, TLS 1.3</p>
        </div>

        <div className="p-6 rounded-2xl glass-card text-center space-y-2">
          <div className="w-10 h-10 rounded-xl bg-[#E6F4F3] text-[#007A78] flex items-center justify-center mx-auto">
            <Globe className="w-5 h-5" />
          </div>
          <div className="text-xl font-bold text-slate-800">5 Pays Cibles</div>
          <p className="text-xs text-slate-400">Côte d'Ivoire, Guinée, Sénégal, Bénin, Mali</p>
        </div>
      </div>

      {/* Contact box */}
      <div className="p-8 rounded-2xl bg-white border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-base font-bold text-slate-800">Besoin d'un accompagnement personnalisé ?</h3>
          <p className="text-xs text-slate-400 mt-1">
            Nos ingénieurs réseau vous assistent pour configurer vos premiers routeurs MikroTik.
          </p>
        </div>

        <button
          onClick={() => {
            setCurrentSpace('public');
            setPublicTab('contact');
          }}
          className="px-6 py-2.5 rounded-xl bg-[#008060] hover:bg-[#006B50] text-white font-extrabold font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shrink-0"
        >
          <span>Prendre contact avec nous</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
