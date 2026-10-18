// ============================================================================
// JOOWIFI CLOUD — MOTEUR D'ASSISTANT IA EN RAG (PHASE 4)
// Connecté aux données temps réel de l'opérateur (Routeurs, Ventes, Tickets,
// Sessions, Vendeurs POS) via Google Gemini (@google/genai) avec fallback RAG local.
// ============================================================================

import { GoogleGenAI } from '@google/genai';

export interface OperatorRagContext {
  operatorName: string;
  company: string;
  walletBalanceXof: number;
  gainsBalanceXof: number;
  heartbeatSecondsRemaining: number;
  routers: {
    name: string;
    zoneName: string;
    status: string;
    cpuUsage: number;
    ramUsage: number;
    uptime: string;
    totalSubscribers: number;
  }[];
  forfaits: {
    name: string;
    price: number;
    durationHours: number;
    downloadSpeedMbps: number;
    uploadSpeedMbps: number;
  }[];
  staff: {
    name: string;
    zoneName: string;
    todaySales: number;
    totalSales: number;
    balanceCredit: number;
    commissionRate: number;
  }[];
  ticketsSummary: {
    total: number;
    stock: number;
    vendeur: number;
    actif: number;
    expire: number;
  };
  activeSessionsCount: number;
}

/**
 * Interroge le modèle Gemini en injectant le contexte RAG en temps réel de l'opérateur
 */
export async function queryJoowifiAssistantRAG(
  userQuestion: string,
  ragContext: OperatorRagContext
): Promise<{ reply: string; routerOsSnippet?: string }> {
  const apiKey = process.env.GEMINI_API_KEY;

  const systemPrompt = `Tu es l'Assistant IA officiel de la console Cloud Joowifi (plateforme SaaS de gestion de hotspots WiFi MikroTik en Afrique de l'Ouest).
Voici les données en temps réel de la base de données de l'opérateur (${ragContext.operatorName} - ${ragContext.company}) :
- Portefeuille Joowifi Pay : ${ragContext.walletBalanceXof.toLocaleString('fr-FR')} FCFA
- Solde Mes Gains (retirable par Wave/Orange/MTN) : ${ragContext.gainsBalanceXof.toLocaleString('fr-FR')} FCFA
- Prochain Heartbeat Cloud Pull (45s) : dans ${ragContext.heartbeatSecondsRemaining}s
- Sessions actives en direct : ${ragContext.activeSessionsCount} clients connectés
- Inventaire Tickets : Total=${ragContext.ticketsSummary.total}, Stock=${ragContext.ticketsSummary.stock}, Vendeurs=${ragContext.ticketsSummary.vendeur}, Actifs=${ragContext.ticketsSummary.actif}, Expirés=${ragContext.ticketsSummary.expire}
- Parc Routeurs MikroTik :
${ragContext.routers.map((r) => `  * ${r.name} (${r.zoneName}) : statut=${r.status}, CPU=${r.cpuUsage}%, RAM=${r.ramUsage}%, Uptime=${r.uptime}, Abonnés=${r.totalSubscribers}`).join('\n')}
- Équipe Vendeurs POS :
${ragContext.staff.map((s) => `  * ${s.name} (${s.zoneName}) : Ventes du jour=${s.todaySales.toLocaleString('fr-FR')} FCFA, Total=${s.totalSales.toLocaleString('fr-FR')} FCFA, Crédit restant=${s.balanceCredit.toLocaleString('fr-FR')} FCFA, Commission=${s.commissionRate}%`).join('\n')}
- Catalogue Forfaits :
${ragContext.forfaits.map((f) => `  * ${f.name} : ${f.price} FCFA (${f.durationHours}h, ${f.downloadSpeedMbps}M/${f.uploadSpeedMbps}M)`).join('\n')}

Réponds en français de manière directe, concise, chaleureuse et structurée avec les chiffres exacts ci-dessus. Si une commande RouterOS MikroTik est pertinente, fournis-la.`;

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `${systemPrompt}\n\nQuestion de l'opérateur : ${userQuestion}`,
      });

      const text = response.text || 'Voici le point sur votre infrastructure Joowifi.';
      return { reply: text };
    } catch {
      // Repli vers le moteur déterministe RAG si la clé API est absente ou hors quota
    }
  }

  // Fallback RAG déterministe haute précision
  const todaySalesTotal = ragContext.staff.reduce((acc, s) => acc + s.todaySales, 0);
  const onlineRouters = ragContext.routers.filter((r) => r.status === 'online').length;

  return {
    reply: `Voici l'analyse en temps réel pour **${ragContext.company}** :
- **Routeurs MikroTik en ligne** : **${onlineRouters}/${ragContext.routers.length}** (Synchronisation Cloud Pull 45s active)
- **Recettes POS du jour** : **${todaySalesTotal.toLocaleString('fr-FR')} FCFA**
- **Tickets disponibles en stock** : **${ragContext.ticketsSummary.stock}** (${ragContext.ticketsSummary.actif} actifs en ligne)
- **Solde Mes Gains retirable** : **${ragContext.gainsBalanceXof.toLocaleString('fr-FR')} FCFA**`,
    routerOsSnippet: `/ip hotspot active print\n/system resource print`,
  };
}
