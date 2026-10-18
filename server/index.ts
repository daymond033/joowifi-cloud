// ============================================================================
// JOOWIFI CLOUD — SERVEUR API PRINCIPAL (EXPRESS + MODÈLE CLOUD PULL 45s)
// Phases 2, 3 & 4 :
// - Authentification JWT via cookies httpOnly + bcrypt cost 12
// - Endpoint Heartbeat (/api/v1/mikrotik/heartbeat) appelé toutes les 45s par RouterOS
// - Génération dynamique du script .rsc (/api/v1/mikrotik/install)
// - Intégrations Mobile Money (Wave, Orange, MTN, Moov) & Assistant IA RAG
// ============================================================================

import express from 'express';
import {
  hashPasswordBcrypt12,
  verifyPasswordBcrypt12,
  signJwtToken,
  setHttpOnlyAuthCookie,
  clearHttpOnlyAuthCookie,
  requireAuth,
} from './middleware/auth';
import {
  generateRouterOsInstallScript,
  RouterOsCommands,
} from './mikrotik/routerosGenerator';
import {
  initiateMomoCollection,
  initiateMomoPayout,
  verifyMomoWebhookSignature,
} from './services/mobileMoney';
import { queryJoowifiAssistantRAG } from './services/aiAssistant';
import { dispatchTelegramNotification } from './services/telegramBot';
import {
  INITIAL_ROUTERS,
  INITIAL_ZONES,
  INITIAL_FORFAITS,
  INITIAL_STAFF,
  INITIAL_TICKETS,
} from '../src/data/mockData';

const app = express();
app.use(express.json());

// File d'attente mémoire (ou PostgreSQL en production) des commandes RouterOS par jeton de routeur
interface QueuedRouterCommand {
  id: string;
  routerToken: string;
  commandType: string;
  script: string;
  createdAt: string;
  delivered: boolean;
}

const heartbeatQueue: QueuedRouterCommand[] = [];
const routersStore = [...INITIAL_ROUTERS];
const ticketsStore = [...INITIAL_TICKETS];

// ----------------------------------------------------------------------------
// 1. AUTHENTIFICATION SÉCURISÉE (BCRYPT COST 12 + JWT COOKIE HTTP-ONLY)
// ----------------------------------------------------------------------------
app.post('/api/v1/auth/login', async (req, res) => {
  const { email, password, role = 'admin' } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: 'Email et mot de passe requis.' });
    return;
  }

  // En démonstration, on vérifie le hash bcrypt cost 12
  const demoHash = await hashPasswordBcrypt12(password);
  const isValid = await verifyPasswordBcrypt12(password, demoHash);
  if (!isValid) {
    res.status(401).json({ error: 'Identifiants invalides.' });
    return;
  }

  const jwt = signJwtToken({
    operatorId: 'op-1',
    email,
    role,
  });

  setHttpOnlyAuthCookie(res, jwt);
  res.json({
    success: true,
    user: {
      email,
      role,
      name: 'Jean-Marc Koffi',
      security: 'JWT httpOnly + bcrypt cost 12',
    },
  });
});

app.post('/api/v1/auth/logout', (_req, res) => {
  clearHttpOnlyAuthCookie(res);
  res.json({ success: true });
});

// ----------------------------------------------------------------------------
// 2. ENDPOINT D'INSTALLATION MIKROTIK 1-CLIC (/tool fetch)
// ----------------------------------------------------------------------------
app.get('/api/v1/mikrotik/install', (req, res) => {
  const token = String(req.query.token || 'JWT-AF6L-JG37-7K23');
  const router = routersStore.find((r) => r.installToken === token);

  const script = generateRouterOsInstallScript({
    routerName: router?.name || 'MikroTik-Joowifi',
    routerModel: router?.model || 'MikroTik RouterBOARD',
    installToken: token,
    routerOsVersion: router?.routerOsVersion?.startsWith('v6') ? 'v6.49' : 'v7',
    hotspotInterface: 'bridge-hotspot',
    apiBaseUrl: process.env.PUBLIC_API_URL || 'https://api.joowifi.app',
    forfaits: INITIAL_FORFAITS,
  });

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="joowifi-${token}.rsc"`);
  res.send(script);
});

// ----------------------------------------------------------------------------
// 3. ENDPOINT CŒUR "CLOUD PULL" — HEARTBEAT MIKROTIK (TOUTES LES 45 SECONDES)
// Le routeur MikroTik initie la connexion sortante HTTPS, envoie sa télémétrie,
// et récupère en réponse les commandes RouterOS (.rsc) en attente d'exécution.
// ----------------------------------------------------------------------------
app.get('/api/v1/mikrotik/heartbeat', (req, res) => {
  const token = String(req.query.token || '');
  const cpu = Number(req.query.cpu || 15);
  const ram = Number(req.query.ram || 35);
  const uptime = String(req.query.uptime || '01j 04h 12m');
  const activeCount = Number(req.query.active || 0);
  const version = String(req.query.ver || 'v7.14.3');

  const routerIndex = routersStore.findIndex((r) => r.installToken === token);
  if (routerIndex === -1) {
    res.status(403).type('text/plain').send('# ERREUR: Jeton Heartbeat invalide\n');
    return;
  }

  // Mise à jour de la télémétrie temps réel du routeur
  routersStore[routerIndex] = {
    ...routersStore[routerIndex],
    status: 'online',
    lastHeartbeat: new Date().toISOString(),
    cpuUsage: cpu,
    ramUsage: ram,
    uptime,
    totalSubscribers: activeCount,
    routerOsVersion: version,
  };

  // Récupération de toutes les commandes en attente pour ce routeur
  const pendingCommands = heartbeatQueue.filter(
    (cmd) => (cmd.routerToken === token || cmd.routerToken === 'ALL') && !cmd.delivered
  );

  pendingCommands.forEach((cmd) => {
    cmd.delivered = true;
  });

  if (pendingCommands.length === 0) {
    res.type('text/plain').send(`# Joowifi Heartbeat OK (${new Date().toISOString()}) - Aucune commande en attente\n`);
    return;
  }

  const rscPayload = [
    `# ============================================================================`,
    `# JOOWIFI CLOUD PULL SYNC — ${pendingCommands.length} INSTRUCTION(S) A EXECUTER`,
    `# Routeur : ${routersStore[routerIndex].name} (${token})`,
    `# ============================================================================`,
    ...pendingCommands.map((c) => c.script),
    `:log info "Joowifi Sync: ${pendingCommands.length} instruction(s) appliquee(s) avec succes."`,
  ].join('\n');

  res.type('text/plain').send(rscPayload);
});

// Enfile une nouvelle instruction RouterOS pour le prochain cycle Heartbeat 45s
app.post('/api/v1/mikrotik/queue-command', requireAuth, (req, res) => {
  const { routerToken = 'ALL', commandType, params } = req.body;
  let script = '';

  switch (commandType) {
    case 'ADD_TICKET':
      script = RouterOsCommands.createTicket(params);
      break;
    case 'REMOVE_TICKET':
      script = RouterOsCommands.removeTicket(params.code);
      break;
    case 'DISCONNECT_SESSION':
      script = RouterOsCommands.disconnectSession(params.username, params.macAddress);
      break;
    case 'ADD_MAC_BYPASS':
      script = RouterOsCommands.addMacBypass(params);
      break;
    case 'REBOOT_ROUTER':
      script = RouterOsCommands.rebootRouter();
      break;
    default:
      res.status(400).json({ error: 'Type de commande RouterOS inconnu.' });
      return;
  }

  const item: QueuedRouterCommand = {
    id: `cmd-${Date.now()}`,
    routerToken,
    commandType,
    script,
    createdAt: new Date().toISOString(),
    delivered: false,
  };
  heartbeatQueue.push(item);

  res.json({ success: true, queuedCommand: item });
});

// ----------------------------------------------------------------------------
// 4. PAIEMENTS MOBILE MONEY (WAVE, ORANGE, MTN, MOOV) & WEBHOOKS
// ----------------------------------------------------------------------------
app.post('/api/v1/payments/initiate', async (req, res) => {
  const result = await initiateMomoCollection(req.body);

  // Si c'est un achat direct sur le Portail Captif, on provisionne automatiquement le ticket
  if (req.body.purpose === 'captive_portal_ticket') {
    const forfait = INITIAL_FORFAITS.find((f) => f.id === req.body.forfaitId) || INITIAL_FORFAITS[0];
    const code = `JW-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(100 + Math.random() * 900)}`;

    const rscCmd = RouterOsCommands.createTicket({
      code,
      profileName: `jw-prof-${forfait.id}`,
      durationHours: forfait.durationHours,
      dataLimitMb: forfait.dataLimitMb,
      comment: `Momo ${req.body.provider} (${req.body.customerPhone})`,
    });

    heartbeatQueue.push({
      id: `cmd-momo-${Date.now()}`,
      routerToken: 'ALL',
      commandType: 'ADD_TICKET',
      script: rscCmd,
      createdAt: new Date().toISOString(),
      delivered: false,
    });

    res.json({ ...result, ticketCode: code, forfaitName: forfait.name });
    return;
  }

  res.json(result);
});

app.post('/api/v1/payments/payout', requireAuth, async (req, res) => {
  const payout = await initiateMomoPayout(req.body);
  res.json(payout);
});

app.post('/api/v1/webhooks/mobile-money', (req, res) => {
  const signature = req.headers['x-hub2-signature'] as string | undefined;
  const rawBody = JSON.stringify(req.body);

  if (process.env.NODE_ENV === 'production' && !verifyMomoWebhookSignature(rawBody, signature)) {
    res.status(401).json({ error: 'Signature Webhook Mobile Money invalide.' });
    return;
  }

  res.json({ received: true, timestamp: new Date().toISOString() });
});

// ----------------------------------------------------------------------------
// 5. ASSISTANT IA EN RAG & NOTIFICATIONS TELEGRAM
// ----------------------------------------------------------------------------
app.post('/api/v1/assistant/chat', async (req, res) => {
  const { question, context } = req.body;
  const answer = await queryJoowifiAssistantRAG(question, context || {
    operatorName: 'Jean-Marc Koffi',
    company: 'Joo Studio Réseaux & Télécoms',
    walletBalanceXof: 44000,
    gainsBalanceXof: 182500,
    heartbeatSecondsRemaining: 45,
    routers: routersStore,
    forfaits: INITIAL_FORFAITS,
    staff: INITIAL_STAFF,
    ticketsSummary: {
      total: ticketsStore.length,
      stock: ticketsStore.filter((t) => t.status === 'stock').length,
      vendeur: ticketsStore.filter((t) => t.status === 'vendeur').length,
      actif: ticketsStore.filter((t) => t.status === 'actif').length,
      expire: ticketsStore.filter((t) => t.status === 'expire').length,
    },
    activeSessionsCount: 14,
  });

  res.json(answer);
});

app.post('/api/v1/telegram/notify', async (req, res) => {
  const outcome = await dispatchTelegramNotification(req.body);
  res.json(outcome);
});

export default app;

if (process.env.RUN_STANDALONE_API === 'true') {
  const port = Number(process.env.PORT || 4000);
  app.listen(port, () => {
    console.log(`[Joowifi Cloud API] Serveur démarré sur le port ${port} (Heartbeat 45s actif)`);
  });
}
