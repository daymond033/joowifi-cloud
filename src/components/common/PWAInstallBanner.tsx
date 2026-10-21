import React, { useState } from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { Download, Share2, PlusSquare, X } from 'lucide-react';

export const PWAInstallBanner: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (isInstalled || dismissed) {
    return null;
  }

  if (!isInstallable && !isIOS) {
    return null;
  }

  return (
    <>
      <div className="relative bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-slate-950 px-4 py-2.5 shadow-md flex items-center justify-between z-40 text-xs sm:text-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#F8FAFC] flex items-center justify-center shrink-0 border border-slate-950/20">
            <Download className="w-4 h-4 text-slate-950" />
          </div>
          <div>
            <span className="font-extrabold block sm:inline">Installer la PWA Joowifi</span>
            <span className="hidden sm:inline text-slate-900 font-medium ml-2">
              — Mode Caisse POS hors-ligne, émission 1-clic et alertes temps réel.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isInstallable && (
            <button
              onClick={install}
              className="bg-[#F8FAFC] text-[#007A78] font-bold px-3.5 py-1.5 rounded-lg shadow-sm hover:bg-white transition active:scale-95 text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Installer l'app</span>
            </button>
          )}

          {isIOS && (
            <button
              onClick={() => setShowIOSGuide(true)}
              className="bg-[#F8FAFC] hover:bg-[#F8FAFC] text-slate-950 font-bold px-3 py-1.5 rounded-lg border border-slate-950/30 transition text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Sur iPhone / iPad</span>
            </button>
          )}

          <button
            onClick={() => setDismissed(true)}
            aria-label="Fermer la bannière"
            className="p-1 rounded text-slate-950/70 hover:text-slate-950 hover:bg-[#F8FAFC] transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white border border-slate-200 p-6 shadow-2xl text-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Download className="w-5 h-5 text-[#007A78]" />
                Installer sur iOS (Safari)
              </h3>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="text-slate-400 hover:text-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Pour installer la caisse POS Joowifi en plein écran sur votre iPhone :
            </p>

            <ol className="space-y-3 text-xs text-slate-700">
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#E6F4F3] text-[#007A78] font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                  1
                </span>
                <span>
                  Touchez le bouton <strong className="text-slate-800">Partager</strong>{' '}
                  <Share2 className="w-3.5 h-3.5 inline mx-1 text-[#007A78]" /> au bas de Safari.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#E6F4F3] text-[#007A78] font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                  2
                </span>
                <span>
                  Sélectionnez <strong className="text-slate-800">« Sur l'écran d'accueil »</strong>{' '}
                  <PlusSquare className="w-3.5 h-3.5 inline mx-1 text-[#007A78]" />.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#E6F4F3] text-[#007A78] font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                  3
                </span>
                <span>Validez avec « Ajouter » en haut à droite.</span>
              </li>
            </ol>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="mt-6 w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 py-2.5 text-xs font-extrabold text-slate-950 transition cursor-pointer"
            >
              Compris
            </button>
          </div>
        </div>
      )}
    </>
  );
};
