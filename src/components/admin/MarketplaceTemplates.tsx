import React from 'react';
import { useApp } from '../../context/AppContext';
import { ShoppingBag, Check, Sparkles, ArrowRight, BookmarkPlus } from 'lucide-react';

export const MarketplaceTemplates: React.FC = () => {
  const { captiveConfig, updateCaptiveConfig, savePortalTemplate, setAdminTab } = useApp();

  const templates = [
    {
      id: 'abidjan-vibrant',
      name: 'Abidjan Vibrant',
      category: 'Général & Populaire',
      author: 'Joo studio',
      description:
        'Design moderne à fort contraste Ambre/Or adapté aux carrefours et maquis d’Abidjan avec boutons Mobile Money (Wave, Orange, MTN) mis en avant.',
      primaryColor: '#F59E0B',
      backgroundColor: '#0B0F19',
      previewBg: 'from-amber-900/80 to-slate-950',
    },
    {
      id: 'sunset-glass',
      name: 'Sunset Glassmorphism',
      category: 'Hôtels & Lounges',
      author: 'Joo studio',
      description:
        'Effets de flou translucide et dégradés chaleureux. Idéal pour hôtels, résidences meublées, espaces de coworking et restaurants.',
      primaryColor: '#EA580C',
      backgroundColor: '#18181B',
      previewBg: 'from-orange-950 to-stone-950',
    },
    {
      id: 'minimal-speed',
      name: 'Minimal Speed (< 10 Ko)',
      category: 'Cybercafés & Gares',
      author: 'Joo studio',
      description:
        'Chargement ultra-rapide optimisé pour les smartphones d’entrée de gamme et les zones à forte densité de passagers.',
      primaryColor: '#10B981',
      backgroundColor: '#020617',
      previewBg: 'from-emerald-950 to-slate-950',
    },
    {
      id: 'neon-cyber',
      name: 'Neon Cyberpunk',
      category: 'Gaming & Campus',
      author: 'Communauté Joowifi',
      description:
        'Esthétique futuriste Cyan/Néon avec typographie monospacée pour salles de jeux vidéo, campus universitaires et cités étudiantes.',
      primaryColor: '#06B6D4',
      backgroundColor: '#050814',
      previewBg: 'from-cyan-950 to-slate-950',
    },
  ];

  const handleApplyAndEdit = (tmpl: typeof templates[0]) => {
    updateCaptiveConfig({
      templateId: tmpl.id as any,
      primaryColor: tmpl.primaryColor,
      backgroundColor: tmpl.backgroundColor,
    });
    setAdminTab('personnalisation');
  };

  const handleCloneToMyTemplates = (tmpl: typeof templates[0]) => {
    savePortalTemplate(
      `${tmpl.name} — Copie`,
      tmpl.description,
      tmpl.category,
      {
        ...captiveConfig,
        templateId: tmpl.id as any,
        primaryColor: tmpl.primaryColor,
        backgroundColor: tmpl.backgroundColor,
      }
    );
    setAdminTab('marketplace-mes-templates');
  };

  return (
    <div className="space-y-6">
      <div className="p-5 rounded-2xl bg-slate-900/40 backdrop-blur-md border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <span>Marketplace de Templates Portail Captif</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Modèles de pages de connexion WiFi optimisés pour la conversion Mobile Money en Afrique de l'Ouest.
          </p>
        </div>

        <button
          onClick={() => setAdminTab('marketplace-mes-templates')}
          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-amber-300 text-xs font-bold cursor-pointer"
        >
          Voir Mes Templates Sauvegardés
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {templates.map((tmpl) => {
          const isCurrent = captiveConfig.templateId === tmpl.id;

          return (
            <div
              key={tmpl.id}
              className={`rounded-2xl bg-slate-900/40 backdrop-blur-md border overflow-hidden flex flex-col justify-between transition ${
                isCurrent ? 'border-amber-500 shadow-lg shadow-amber-500/10' : 'border-white/10'
              }`}
            >
              <div>
                {/* Visual Preview Header */}
                <div
                  className={`h-40 bg-gradient-to-br ${tmpl.previewBg} p-5 flex flex-col justify-between relative border-b border-white/10`}
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md text-[10px] font-bold text-slate-200 border border-white/10">
                      {tmpl.category}
                    </span>

                    {isCurrent && (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-extrabold flex items-center gap-1">
                        <Check className="w-3 h-3 stroke-[3]" /> Actif
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-extrabold text-white">{tmpl.name}</h3>
                      <span className="text-[11px] text-slate-300">Par {tmpl.author}</span>
                    </div>
                    <span
                      className="px-2.5 py-1 rounded-lg font-mono text-[10px] font-bold text-slate-950"
                      style={{ backgroundColor: tmpl.primaryColor }}
                    >
                      {tmpl.primaryColor}
                    </span>
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <p className="text-xs text-slate-300 leading-relaxed">{tmpl.description}</p>
                </div>
              </div>

              <div className="p-5 pt-0 flex items-center gap-2.5">
                <button
                  onClick={() => handleCloneToMyTemplates(tmpl)}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-white/10 text-slate-200 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer active:scale-95"
                >
                  <BookmarkPlus className="w-3.5 h-3.5 text-amber-400" />
                  <span>Cloner</span>
                </button>

                <button
                  onClick={() => handleApplyAndEdit(tmpl)}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Personnaliser dans le Sandbox</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
