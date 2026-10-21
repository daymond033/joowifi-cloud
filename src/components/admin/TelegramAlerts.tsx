import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Bell, Send, CheckCircle2, MessageCircle, Save } from 'lucide-react';

export const TelegramAlerts: React.FC = () => {
  const { telegramConfig, updateTelegramConfig, routers, formatMoney, notify } = useApp();

  const [botToken, setBotToken] = useState(telegramConfig.botToken);
  const [chatId, setChatId] = useState(telegramConfig.chatId);
  const [triggers, setTriggers] = useState(telegramConfig.triggers);
  const [testSent, setTestSent] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateTelegramConfig({
      botToken,
      chatId,
      triggers,
    });
  };

  const handleTestAlert = () => {
    setTestSent(true);
    notify(`Notification Telegram de test envoyée au canal ${chatId} !`, 'info');
    setTimeout(() => setTestSent(false), 3500);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="p-5 rounded-2xl bg-white backdrop-blur-md border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#EFF6FF] border border-blue-200 flex items-center justify-center text-[#0066CC]">
              <Bell className="w-5 h-5" />
            </div>
            <span>Alertes Temps Réel & Bot Telegram</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Recevez instantanément sur Telegram les alertes de coupure Heartbeat 45s, les SOS Vendeurs et votre bilan comptable de 22h00.
          </p>
        </div>

        <button
          onClick={handleTestAlert}
          className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs flex items-center gap-2 transition cursor-pointer shadow-lg shadow-cyan-500/20 active:scale-95"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Envoyer une alerte de test</span>
        </button>
      </div>

      {testSent && (
        <div className="p-4 rounded-2xl bg-cyan-950/60 border border-blue-200 text-cyan-200 text-xs flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-[#0066CC] shrink-0" />
          <div>
            <strong>Alerte Telegram transmise avec succès !</strong> Message poussé via l'API Bot vers le Chat ID <span className="font-mono">{chatId}</span>.
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form (7 cols) */}
        <form onSubmit={handleSave} className="lg:col-span-7 space-y-6 text-xs">
          <div className="p-6 rounded-2xl bg-white backdrop-blur-md border border-slate-200 space-y-4">
            <h2 className="text-sm font-bold text-slate-800 border-b border-slate-200 pb-3 flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-[#0066CC]" />
              <span>Identifiants de connexion @BotFather</span>
            </h2>

            <div className="space-y-1">
              <label className="text-slate-600 font-semibold">Jeton HTTP du Bot (Bot Token) :</label>
              <input
                type="text"
                value={botToken}
                onChange={(e) => setBotToken(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] border border-slate-200 text-slate-800 font-mono text-xs focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-600 font-semibold">Identifiant du Groupe / Canal (Chat ID) :</label>
              <input
                type="text"
                value={chatId}
                onChange={(e) => setChatId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] border border-slate-200 text-slate-800 font-mono text-xs focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white backdrop-blur-md border border-slate-200 space-y-4">
            <h2 className="text-sm font-bold text-slate-800 border-b border-slate-200 pb-3">
              Événements Déclencheurs Automatiques
            </h2>

            <div className="space-y-3">
              {[
                {
                  key: 'routerDown',
                  title: 'Routeur MikroTik Déconnecté (Perte Heartbeat > 90s)',
                  desc: 'Alerte immédiate si un routeur ne répond plus pendant 2 cycles consécutifs.',
                },
                {
                  key: 'vendorLowCredit',
                  title: 'Bouton SOS Recharge Vendeur POS',
                  desc: 'Notification avec lien direct lorsqu’un vendeur demande du crédit sur le terrain.',
                },
                {
                  key: 'dailyReport',
                  title: 'Rapport Financier Quotidien (22h00 GMT)',
                  desc: 'Synthèse automatique des ventes du jour, commissions et bénéfice net par zone.',
                },
                {
                  key: 'momoPayment',
                  title: 'Achat Direct Mobile Money sur Portail Captif',
                  desc: 'Confirmation instantanée de chaque ticket payé via Wave, Orange, MTN ou Moov.',
                },
              ].map((item) => (
                <label
                  key={item.key}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-[#F8FAFC] border border-slate-200 hover:border-[#99D5D3] cursor-pointer"
                >
                  <div className="pr-4">
                    <strong className="text-slate-800 block">{item.title}</strong>
                    <span className="text-[11px] text-slate-400">{item.desc}</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={(triggers as any)[item.key]}
                    onChange={(e) =>
                      setTriggers({ ...triggers, [item.key]: e.target.checked })
                    }
                    className="accent-amber-500 w-4 h-4 rounded"
                  />
                </label>
              ))}
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-[#008060] hover:bg-[#006B50] text-white font-extrabold text-xs flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>Enregistrer la configuration Telegram</span>
            </button>
          </div>
        </form>

        {/* Live Telegram Preview Card (5 cols) */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-white backdrop-blur-md border border-slate-200 space-y-4 text-xs">
          <h2 className="text-sm font-bold text-slate-800 border-b border-slate-200 pb-3">
            Aperçu du Message Bot (@JoowifiCloudBot)
          </h2>

          <div className="p-4 rounded-2xl bg-white border border-blue-200 space-y-2 font-mono text-[11px] text-slate-700 leading-relaxed">
            <div className="text-[#0066CC] font-bold">🤖 Joowifi Cloud Monitor</div>
            <div>🟢 <strong>BILAN QUOTIDIEN — 22:00 GMT</strong></div>
            <div>• Routeurs en ligne : {routers.filter((r) => r.status === 'online').length}/{routers.length}</div>
            <div>• Recettes du jour : <span className="text-[#008060] font-bold">{formatMoney(48500)}</span></div>
            <div>• Paiements Mobile Money : <span className="text-[#007A78] font-bold">{formatMoney(19500)}</span></div>
            <div>• Heartbeat Cloud Pull : <span className="text-[#008060]">100% OK (45s)</span></div>
            <div className="text-[10px] text-slate-500 text-right pt-1">22:00 ✓✓</div>
          </div>
        </div>
      </div>
    </div>
  );
};
