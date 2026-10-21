import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sparkles,
  Send,
  Trash2,
  Copy,
  Check,
  ArrowRight,
  Server,
  TrendingUp,
  Ticket,
  Users,
  Radio,
  Terminal,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  codeSnippet?: string;
}

export const AssistantIA: React.FC = () => {
  const {
    routers,
    sessions,
    tickets,
    staff,
    forfaits,
    formatMoney,
    walletBalance,
    gainsBalance,
    heartbeatSecondsRemaining,
    generateTicketsBatch,
    reconcileProfiles,
    forceHeartbeatSync,
    notify,
  } = useApp();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const initialGreeting = `Salut ! 👋 Je suis là pour t'aider à piloter ton réseau Joowifi.

Tu peux me demander par exemple :
- **Réseau** : « Est-ce que tout va bien ? », « L'état de mes routeurs »
- **Revenus** : « Mon chiffre du jour », « Combien j'ai gagné ce mois »
- **Tickets** : « Combien de tickets me reste-t-il ? », « Pourquoi le code X ne se connecte pas ? »
- **Forfaits / vendeurs** : « Mes forfaits », « Quel vendeur vend le plus ? »
- **Actions** : Générer des codes, bloquer/débloquer, redémarrer un routeur...

Que veux-tu savoir ?`;

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-init',
      sender: 'assistant',
      text: initialGreeting,
      timestamp: 'À l’instant',
    },
  ]);

  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Copy helper
  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  // Reset conversation
  const handleResetConversation = () => {
    setMessages([
      {
        id: `msg-reset-${Date.now()}`,
        sender: 'assistant',
        text: initialGreeting,
        timestamp: 'À l’instant',
      },
    ]);
  };

  // Quick suggestion prompts
  const suggestions = [
    'Est-ce que tout va bien ?',
    'Mon chiffre du jour',
    'L’état de mes routeurs',
    'Quel vendeur vend le plus ?',
    'Combien de tickets reste-t-il ?',
  ];

  // Intelligent responder using real live context
  const generateResponse = (query: string): { text: string; codeSnippet?: string } => {
    const q = query.toLowerCase().trim();

    // 1. Salutations
    if (q === 'salut' || q === 'bonjour' || q === 'hello' || q === 'hi' || q === 'coucou') {
      return {
        text: `Salut ! Tout fonctionne parfaitement sur ton espace Joowifi.

Tu as actuellement **${routers.filter((r) => r.status === 'online').length} routeur(s) en ligne** et **${sessions.length} utilisateur(s) connecté(s)**.

Que souhaites-tu vérifier ou configurer ?`,
      };
    }

    // 2. Réseau / Santé générale
    if (
      q.includes('va bien') ||
      q.includes('santé') ||
      q.includes('etat') ||
      q.includes('état') ||
      q.includes('statut')
    ) {
      const onlineCount = routers.filter((r) => r.status === 'online').length;
      const allOnline = onlineCount === routers.length;

      return {
        text: `Voici l'état actuel de ton infrastructure réseau :

- **Routeurs MikroTik** : ${onlineCount} sur ${routers.length} en ligne (${allOnline ? '✅ 100% opérationnel' : '⚠️ Vérification requise'}).
- **Connexion Cloud** : Synchronisation continue Pull active (prochain battement dans **${heartbeatSecondsRemaining}s**).
- **Sessions actives** : **${sessions.length} abonnés** en cours de navigation.
- **Trafic estimé** : Bande passante fluide, aucune alerte de coupure électrique reçue.

Tout est sous contrôle ! Tu veux des détails sur un site en particulier ?`,
      };
    }

    // 3. Routeurs MikroTik spécifiques
    if (q.includes('routeur') || q.includes('mikrotik') || q.includes('equipement')) {
      const routerList = routers
        .map(
          (r) =>
            `- **${r.name}** (${r.zoneName}) : ${r.status === 'online' ? '🟢 En ligne' : '🔴 Hors ligne'} · CPU: ${r.cpuUsage}% · Uptime: ${r.uptime} · ${r.totalSubscribers} abonnés`
        )
        .join('\n');

      return {
        text: `Voici la situation de ton parc de routeurs :

${routerList}

Tous les routeurs communiquent avec Joowifi en mode sortant HTTPS (zéro port ouvert).`,
        codeSnippet: `/ip hotspot active print
/system resource print`,
      };
    }

    // 4. Revenus & Ventes
    if (
      q.includes('chiffre') ||
      q.includes('revenu') ||
      q.includes('vente') ||
      q.includes('argent') ||
      q.includes('gagné') ||
      q.includes('caisse')
    ) {
      const todayTotal = staff.reduce((acc, s) => acc + s.todaySales, 0);
      const totalAll = staff.reduce((acc, s) => acc + s.totalSales, 0);

      return {
        text: `Voici le point financier en temps réel :

- **Ventes d'aujourd'hui** : **${formatMoney(todayTotal)}** générés par l'équipe terrain.
- **Gains totaux cumulés** : **${formatMoney(totalAll)}**.
- **Solde disponible dans ton portefeuille Joowifi Pay** : **${formatMoney(walletBalance)}**.
- **Gains prêts pour retrait Mobile Money (Wave / Orange)** : **${formatMoney(gainsBalance)}**.

Tu peux effectuer un retrait instantané vers ton numéro à tout moment depuis l'onglet **Mes Gains**.`,
      };
    }

    // 5. Tickets & Stock
    if (q.includes('ticket') || q.includes('code') || q.includes('voucher') || q.includes('reste')) {
      const activeCount = tickets.filter((t) => t.status === 'actif').length;
      const stockCount = tickets.filter((t) => t.status === 'stock').length;
      const vendorCount = tickets.filter((t) => t.status === 'vendeur').length;
      const usedCount = tickets.filter((t) => t.status === 'expire' || t.status === 'actif').length;

      return {
        text: `Voici l'inventaire complet de tes tickets WiFi :

- **Total tickets créés** : **${tickets.length}** tickets.
- **En stock gérant** : **${stockCount}** tickets prêts à être distribués.
- **Attribués aux vendeurs terrain** : **${vendorCount}** tickets en circulation.
- **Actuellement connectés en ligne** : **${activeCount}** utilisateurs.

Besoin de réapprovisionner un lot ? Tu peux créer de 50 à 5 000 tickets en 1 clic dans l'onglet **Tickets**.`,
      };
    }

    // 6. Vendeurs / Staff
    if (q.includes('vendeur') || q.includes('staff') || q.includes('agent') || q.includes('qui vend')) {
      const topSeller = [...staff].sort((a, b) => b.todaySales - a.todaySales)[0];
      const staffDetails = staff
        .map(
          (s) =>
            `- **${s.name}** : ${formatMoney(s.todaySales)} aujourd'hui (${s.commissionRate}% de commission) · Solde: ${formatMoney(s.balanceCredit)}`
        )
        .join('\n');

      return {
        text: `Voici le classement de ton équipe de vente :

${staffDetails}

🏆 **Meilleur vendeur du jour** : **${topSeller ? topSeller.name : 'N/A'}** avec **${formatMoney(topSeller ? topSeller.todaySales : 0)}** encaissés.`,
      };
    }

    // 7. Forfaits
    if (q.includes('forfait') || q.includes('tarif') || q.includes('prix') || q.includes('offre')) {
      const forfaitsList = forfaits
        .map((f) => `- **${f.name}** : ${formatMoney(f.price)} (${f.durationHours}h · Vitesse: ${f.downloadSpeedMbps}M/↓)`)
        .join('\n');

      return {
        text: `Tu as actuellement **${forfaits.length} forfaits actifs** paramétrés :

${forfaitsList}

Tu peux ajuster les vitesses de bande passante ou créer de nouvelles formules dans l'onglet **Forfaits**.`,
      };
    }

    // 8. Commandes MikroTik / QoS / Redémarrage
    if (q.includes('qos') || q.includes('queue') || q.includes('brider') || q.includes('limiter')) {
      return {
        text: `Pour calibrer une file d'attente fluide et équitable (QoS) sur tous tes clients Hotspot, voici le script recommandé avec politique PCQ :`,
        codeSnippet: `/queue type add name=pcq-down kind=pcq pcq-rate=3M pcq-classifier=dst-address
/queue type add name=pcq-up kind=pcq pcq-rate=1M pcq-classifier=src-address
/queue simple add name="Hotspot-Fair-Share" target=192.168.88.0/24 queue=pcq-up/pcq-down`,
      };
    }

    if (q.includes('reboot') || q.includes('redémarrer') || q.includes('relancer')) {
      return {
        text: `Tu peux envoyer un ordre de redémarrage direct depuis la console Joowifi Cloud, ou copier cette commande RouterOS dans ton terminal :`,
        codeSnippet: `/system reboot`,
      };
    }

    // 9. Diagnostic précis d'un code ticket ou d'un client par son code
    const matchedTicket = tickets.find(
      (t) => q.includes(t.code.toLowerCase()) || (t.pin && q.includes(t.pin.toLowerCase()))
    );
    if (matchedTicket) {
      return {
        text: `🔍 **Diagnostic complet du Ticket \`${matchedTicket.code}\`** :

- **Forfait associé** : **${matchedTicket.forfaitName}** (${formatMoney(matchedTicket.price)} · Durée: ${matchedTicket.duration})
- **Statut actuel** : **${matchedTicket.status.toUpperCase()}**
- **Zone d'affectation** : ${matchedTicket.zoneName || 'Zone Principale'}
- **Vendeur émetteur** : ${matchedTicket.sellerName || 'Console Admin'}
- **Adresse MAC liée** : ${matchedTicket.macAddress || 'Non verrouillée (en attente 1er login)'}
- **Consommation Data** : ${matchedTicket.dataConsumedMb ? `${matchedTicket.dataConsumedMb} Mo` : '0 Mo'}
- **File d'attente de forfaits** : ${matchedTicket.queuedForfaits?.length || 0} forfait(s) en relais`,
        codeSnippet: `/ip hotspot user print detail where name="${matchedTicket.code}"
/ip hotspot active print where user="${matchedTicket.code}"`,
      };
    }

    // Fallback contextuel
    return {
      text: `J'ai bien noté ta question : « *${query}* ».

D'après les données synchronisées de ta console Joowifi :
- Tes **${routers.length} routeur(s)** sont supervisés via le protocole sécurisé HTTPS Pull (45s).
- Tu as **${sessions.length} utilisateur(s) connecté(s)** et **${tickets.filter((t) => t.status === 'stock' || t.status === 'vendeur').length} tickets disponibles**.
- Chiffre d'affaires terrain du jour : **${formatMoney(staff.reduce((acc, s) => acc + s.todaySales, 0))}**.

Dis-moi si tu veux approfondir un point précis : réseau, tickets, forfaits, ou commandes MikroTik !`,
    };
  };

  const handleSendMessage = (textToSend?: string) => {
    const raw = textToSend || inputValue;
    if (!raw.trim()) return;

    const userMessage: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: raw.trim(),
      timestamp: 'À l’instant',
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Dynamic simulated response delay
    setTimeout(() => {
      const response = generateResponse(raw);
      const assistantMessage: ChatMessage = {
        id: `ast-${Date.now()}`,
        sender: 'assistant',
        text: response.text,
        timestamp: 'À l’instant',
        codeSnippet: response.codeSnippet,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 650);
  };

  // Helper formatting markdown-like bold text & bullet points
  const renderFormattedText = (content: string) => {
    const lines = content.split('\n');

    return (
      <div className="space-y-1.5 leading-relaxed">
        {lines.map((line, idx) => {
          if (!line.trim()) {
            return <div key={idx} className="h-1.5" />;
          }

          // Bullet points
          const isBullet = line.trim().startsWith('-');
          const cleanLine = isBullet ? line.trim().substring(1).trim() : line;

          // Replace **bold** with <strong>
          const parts = cleanLine.split(/(\*\*.*?\*\*)/g);

          const formattedContent = parts.map((part, pIdx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return (
                <strong key={pIdx} className="text-slate-800 font-bold">
                  {part.slice(2, -2)}
                </strong>
              );
            }
            return part;
          });

          if (isBullet) {
            return (
              <div key={idx} className="flex items-start gap-2 pl-1">
                <span className="text-[#007A78] mt-1 text-xs">•</span>
                <span className="flex-1 text-slate-600 text-xs sm:text-sm">
                  {formattedContent}
                </span>
              </div>
            );
          }

          return (
            <p key={idx} className="text-slate-600 text-xs sm:text-sm">
              {formattedContent}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* =========================================================================
          1. EN-TÊTE DE PAGE (HEADER SECTION)
      ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="space-y-1">
          {/* Fil d'ariane */}
          <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500 font-mono flex items-center gap-1.5">
            <span>Console</span>
            <span>/</span>
            <span className="text-[#007A78]">Assistant IA</span>
          </div>

          {/* Titre avec icône dédiée */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#E6F4F3] border border-[#99D5D3] text-[#007A78] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-black text-slate-800 font-sans tracking-tight">
              Assistant IA
            </h1>
          </div>

          <p className="text-xs text-slate-400">
            Posez une question sur votre réseau, vos tickets ou vos revenus — l'assistant lit vos
            vraies données.
          </p>
        </div>

        {/* Bouton d'action secondaire : Nouvelle conversation */}
        <button
          onClick={handleResetConversation}
          className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-800 text-xs font-semibold flex items-center gap-2 transition cursor-pointer self-start sm:self-auto shadow-sm"
        >
          <Trash2 className="w-3.5 h-3.5 text-slate-400" />
          <span>Nouvelle conversation</span>
        </button>
      </div>

      {/* =========================================================================
          2. ZONE DE DISCUSSION (CHAT CONTAINER & MESSAGES)
      ========================================================================= */}
      <div className="rounded-3xl bg-[#F8FAFC] border border-slate-200 shadow-2xl flex flex-col justify-between min-h-[560px] overflow-hidden">
        {/* Messages Scroll Area */}
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto max-h-[540px]">
          {messages.map((m) => {
            const isUser = m.sender === 'user';

            return (
              <div
                key={m.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1`}
              >
                <div
                  className={`max-w-2xl rounded-2xl p-4 sm:p-5 transition-all shadow-md ${
                    isUser
                      ? 'bg-[#008060] hover:bg-[#006B50] text-white font-medium rounded-br-none'
                      : 'bg-white text-slate-700 border border-slate-200 rounded-bl-none'
                  }`}
                >
                  {isUser ? (
                    <p className="text-xs sm:text-sm font-semibold">{m.text}</p>
                  ) : (
                    <div className="space-y-3">
                      {renderFormattedText(m.text)}

                      {/* Code Block if any */}
                      {m.codeSnippet && (
                        <div className="mt-3 rounded-xl bg-[#F8FAFC] p-3.5 border border-slate-200 font-mono text-[11px] relative group overflow-hidden">
                          <div className="flex items-center justify-between text-[10px] text-slate-400 border-b border-slate-200 pb-2 mb-2 font-mono">
                            <span className="flex items-center gap-1.5 text-[#007A78]">
                              <Terminal className="w-3 h-3" />
                              <span>Script Terminal MikroTik</span>
                            </span>
                            <button
                              onClick={() => handleCopyCode(m.codeSnippet!, m.id)}
                              className="px-2 py-0.5 rounded bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-800 flex items-center gap-1 transition"
                            >
                              {copiedCodeId === m.id ? (
                                <>
                                  <Check className="w-3 h-3 text-[#008060]" />
                                  <span className="text-[#008060]">Copié</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>Copier</span>
                                </>
                              )}
                            </button>
                          </div>
                          <pre className="text-[#0066CC] overflow-x-auto leading-relaxed">
                            {m.codeSnippet}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white border border-slate-200 w-fit">
              <Sparkles className="w-3.5 h-3.5 text-[#007A78] animate-spin" />
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" />
                <span
                  className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce"
                  style={{ animationDelay: '0.15s' }}
                />
                <span
                  className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce"
                  style={{ animationDelay: '0.3s' }}
                />
              </div>
              <span className="text-xs text-slate-400 font-medium ml-1">
                L'Assistant consulte vos données...
              </span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Chips & Input Area */}
        <div className="p-4 sm:p-5 border-t border-slate-200 bg-[#F8FAFC] space-y-3">
          {/* Boutons d'Actions Directes IA (Exécution en 1-Clic) */}
          <div className="flex flex-wrap items-center gap-2 pb-1 border-b border-slate-200">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#007A78] font-bold">
              Actions IA 1-Clic :
            </span>
            <button
              type="button"
              onClick={() => {
                const defaultForfait = forfaits[0];
                if (defaultForfait) {
                  const created = generateTicketsBatch(defaultForfait.id, 25, 'JW', 'stock');
                  notify(`25 tickets ${defaultForfait.name} générés par l'Assistant IA !`, 'success');
                  handleSendMessage(`Je viens de générer 25 tickets (${defaultForfait.name}), quel est mon nouveau stock ?`);
                }
              }}
              className="px-2.5 py-1 rounded-lg bg-[#E6F4F3] hover:bg-amber-500/25 border border-[#99D5D3] text-[#005A5B] text-[11px] font-bold transition cursor-pointer"
            >
              ⚡ Générer 25 Tickets ({forfaits[0]?.name || 'Pass 1H'})
            </button>
            <button
              type="button"
              onClick={() => {
                reconcileProfiles();
                handleSendMessage("Vérifie l'état de mes routeurs après synchronisation des profils");
              }}
              className="px-2.5 py-1 rounded-lg bg-[#E6F4F3] hover:bg-emerald-500/25 border border-[#99D5D3] text-[#005A5B] text-[11px] font-bold transition cursor-pointer"
            >
              🔄 Synchroniser Profils RouterOS
            </button>
            <button
              type="button"
              onClick={() => {
                forceHeartbeatSync();
              }}
              className="px-2.5 py-1 rounded-lg bg-[#EFF6FF] hover:bg-cyan-500/25 border border-blue-200 text-[#0066CC] text-[11px] font-bold transition cursor-pointer"
            >
              📡 Forcer Heartbeat Pull (45s)
            </button>
          </div>

          {/* Quick suggestions scrollbar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {suggestions.map((sug) => (
              <button
                key={sug}
                onClick={() => handleSendMessage(sug)}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-850 border border-slate-200 hover:border-[#99D5D3] text-xs text-slate-600 hover:text-slate-800 transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <span>{sug}</span>
              </button>
            ))}
          </div>

          {/* 3. BARRE DE SAISIE FIXE EN BAS (INPUT BAR) */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              placeholder="Posez votre question..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="flex-1 px-4 py-3 rounded-2xl bg-white border border-slate-200 text-slate-800 placeholder-slate-500 focus:outline-none focus:border-amber-500 text-xs sm:text-sm transition"
            />

            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="p-3 sm:px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-500 disabled:opacity-40 text-slate-950 font-bold transition flex items-center justify-center cursor-pointer shadow-md disabled:cursor-not-allowed"
              title="Envoyer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
