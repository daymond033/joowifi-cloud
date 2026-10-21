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
      <div className="p-5 rounded-2xl bg-white backdrop-blur-md border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#E6F4F3] border border-[#99D5D3] flex items-center justify-center text-[#007A78]">
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
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
          >
            Explorer la Marketplace
          </button>
          <button
            onClick={() => setAdminTab('personnalisation')}
            className="px-4 py-2.5 rounded-xl bg-[#008060] hover:bg-[#006B50] text-white text-xs font-extrabold flex items-center gap-1.5 transition cursor-pointer active:scale-95"
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
            className={`p-6 rounded-2xl bg-white backdrop-blur-md border flex flex-col justify-between space-y-5 transition ${
              tmpl.isActive
                ? 'border-2 border-amber-500 shadow-lg shadow-amber-500/10'
                : 'border-slate-200 hover:border-slate-200'
            }`}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#007A78] uppercase tracking-wider">
                  {tmpl.category}
                </span>
                {tmpl.isActive ? (
                  <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-[#E6F4F3] text-[#005A5B] border border-[#99D5D3] flex items-center gap-1">
                    <Check className="w-3 h-3" /> En production
                  </span>
                ) : (
                  <span className="text-[10px] font-mono text-slate-500">{tmpl.updatedAt}</span>
                )}
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-800">{tmpl.name}</h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">{tmpl.description}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-slate-200 text-xs space-y-1.5 font-mono">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-sans">Marque affichée :</span>
                  <span className="text-slate-800 font-sans font-bold">{tmpl.config.brandName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-sans">Couleur Accent :</span>
                  <span className="flex items-center gap-1.5 font-bold text-[#005A5B]">
                    <span
                      className="w-3 h-3 rounded-full border border-slate-200"
                      style={{ backgroundColor: tmpl.config.primaryColor }}
                    />
                    {tmpl.config.primaryColor}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-sans">Périmètre :</span>
                  <span className="text-[#008060] capitalize">{tmpl.config.scope}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-200">
              <div className="flex items-center gap-2">
                {!tmpl.isActive ? (
                  <button
                    onClick={() => activatePortalTemplate(tmpl.id)}
                    className="flex-1 py-2 rounded-xl bg-[#E6F4F3] hover:bg-emerald-500/30 border border-[#99D5D3] text-[#005A5B] font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-95"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Activer</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setAdminTab('personnalisation')}
                    className="flex-1 py-2 rounded-xl bg-[#008060] hover:bg-[#006B50] text-white font-extrabold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-95"
                  >
                    <span>Éditer dans Sandbox</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}

                <button
                  onClick={() => duplicatePortalTemplate(tmpl.id)}
                  title="Dupliquer ce template"
                  className="p-2 rounded-xl bg-[#F8FAFC] hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-800 cursor-pointer"
                >
                  <Copy className="w-4 h-4" />
                </button>

                {!tmpl.isActive && (
                  <button
                    onClick={() => deletePortalTemplate(tmpl.id)}
                    title="Supprimer ce template"
                    className="p-2 rounded-xl bg-[#F8FAFC] hover:bg-rose-50 border border-slate-200 text-slate-400 hover:text-rose-400 cursor-pointer"
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
