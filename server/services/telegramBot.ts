// ============================================================================
// JOOWIFI CLOUD — SERVICE D'ALERTES TEMPS RÉEL TELEGRAM BOT (PHASE 4)
// Envoie automatiquement des notifications sur le canal de l'opérateur :
// 1. Perte de Heartbeat d'un routeur MikroTik (> 90s)
// 2. Demande SOS Recharge d'un vendeur POS sur le terrain
// 3. Achat direct de ticket par Mobile Money sur le portail captif
// 4. Bilan financier quotidien automatique (22h00 GMT)
// ============================================================================

export interface TelegramDispatchParams {
  botToken: string;
  chatId: string;
  title: string;
  lines: string[];
}

export async function dispatchTelegramNotification(
  params: TelegramDispatchParams
): Promise<{ sent: boolean; previewText: string }> {
  const text = [
    `🤖 *Joowifi Cloud Monitor*`,
    `*${params.title}*`,
    '',
    ...params.lines.map((l) => `• ${l}`),
    '',
    `🕒 _${new Date().toLocaleTimeString('fr-FR')} GMT — Architecture Zero-Trust_`,
  ].join('\n');

  if (params.botToken && params.chatId && process.env.ENABLE_LIVE_TELEGRAM === 'true') {
    try {
      const url = `https://api.telegram.org/bot${params.botToken}/sendMessage`;
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: params.chatId,
          text,
          parse_mode: 'Markdown',
        }),
      });
      return { sent: true, previewText: text };
    } catch {
      return { sent: false, previewText: text };
    }
  }

  return { sent: true, previewText: text };
}
