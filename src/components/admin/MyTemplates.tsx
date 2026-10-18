import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Boxes,
  Check,
  ArrowRight,
  Copy,
  Trash2,
  Plus,
  Sparkles,
} from 'lucide-react';

export const MyTemplates: React.FC = () => {
  const {
    savedTemplates,
    activatePortalTemplate,
    duplicatePortalTemplate,
    deletePortalTemplate,
    setAdminTab,
  } = useApp();

  return (
    <div className="space-y-6">
      <div className="p-5 rounded-2xl bg-slate-900/40 backdrop-blur-md border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Boxes className="w-5 h-5" />
            </div>
            <span>Mes Templates Sauvegardés ({savedTemplates.length})</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Gérez vos différentes déclinaisons de portail captif par zone, hôtel, campus ou gare routière.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setAdminTab('marketplace')}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-slate-200 text-xs font-semibold cursor-pointer"
          >
            Explorer la Marketplace
          </button>
          <button
            onClick={() => setAdminTab('personnalisation')}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 transition cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Créer un nouveau design</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {savedTemplates.map((tmpl) => (
          <div
            key={tmpl.id}
            className={`p-6 rounded-2xl bg-slate-900/40 backdrop-blur-md border flex flex-col justify-between space-y-5 transition ${
              tmpl.isActive
                ? 'border-2 border-amber-500 shadow-lg shadow-amber-500/10'
                : 'border-white/10 hover:border-white/20'
            }`}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                  {tmpl.category}
                </span>
                {tmpl.isActive ? (
                  <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <Check className="w-3 h-3" /> En production
                  </span>
                ) : (
                  <span className="text-[10px] font-mono text-slate-500">{tmpl.updatedAt}</span>
                )}
              </div>

              <div>
                <h3 className="text-base font-bold text-white">{tmpl.name}</h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">{tmpl.description}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-white/10 text-xs space-y-1.5 font-mono">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-sans">Marque affichée :</span>
                  <span className="text-white font-sans font-bold">{tmpl.config.brandName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-sans">Couleur Accent :</span>
                  <span className="flex items-center gap-1.5 font-bold text-amber-300">
                    <span
                      className="w-3 h-3 rounded-full border border-white/20"
                      style={{ backgroundColor: tmpl.config.primaryColor }}
                    />
                    {tmpl.config.primaryColor}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-sans">Périmètre :</span>
                  <span className="text-emerald-400 capitalize">{tmpl.config.scope}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-white/10">
              <div className="flex items-center gap-2">
                {!tmpl.isActive ? (
                  <button
                    onClick={() => activatePortalTemplate(tmpl.id)}
                    className="flex-1 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-95"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Activer</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setAdminTab('personnalisation')}
                    className="flex-1 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-95"
                  >
                    <span>Éditer dans Sandbox</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}

                <button
                  onClick={() => duplicatePortalTemplate(tmpl.id)}
                  title="Dupliquer ce template"
                  className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-white/10 text-slate-300 hover:text-white cursor-pointer"
                >
                  <Copy className="w-4 h-4" />
                </button>

                {!tmpl.isActive && (
                  <button
                    onClick={() => deletePortalTemplate(tmpl.id)}
                    title="Supprimer ce template"
                    className="p-2 rounded-xl bg-slate-950 hover:bg-rose-950/60 border border-white/10 text-slate-400 hover:text-rose-400 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
