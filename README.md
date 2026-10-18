# Joowifi Cloud — Plateforme SaaS & PWA MikroTik Hotspot

**Joowifi** est une plateforme SaaS (Software as a Service) et PWA (Progressive Web App) dédiée au pilotage cloud de hotspots WiFi **MikroTik RouterOS (v6 & v7)**, à l'émission de tickets de caisse mobile (**POS Vendeur**) et à la comptabilité **Mobile Money** (Wave, Orange Money, MTN MoMo, Moov Money) en Afrique de l'Ouest (Côte d'Ivoire, Guinée, Sénégal, Bénin, Mali).

## Architecture Technique & Sécurité

1. **Modèle « Cloud Pull » Strict (Polling HTTPS 45 secondes)** :
   - Aucun port entrant à ouvrir sur le modem FAI (100% compatible CGNAT, Box 4G/5G Orange/MTN/Moov, ADSL, Fibre, Starlink) et aucun VPN complexe à maintenir.
   - Le routeur MikroTik exécute toutes les 45 secondes le script `joowifi-heartbeat` via `/tool fetch mode=https`, transmet ses métriques (`cpu`, `ram`, `uptime`, `active`) et télécharge les nouvelles instructions RouterOS (`joowifi-sync.rsc`) pour les exécuter localement.
2. **Script d'Onboarding RouterOS 1-Clic (`.rsc`)** :
   - Configure automatiquement le DNS, le client NTP (`time.cloudflare.com`), le **Walled Garden** (API Joowifi + passerelles Mobile Money), les profils Hotspot avec reconnexion automatique par **Cookie MAC (30 jours)** et le script `on-login` de **verrouillage d'adresse MAC** anti-partage.
3. **Sécurité Web & Isolation Multitenant** :
   - Mots de passe hachés avec **bcrypt (cost factor 12)** et authentification **JWT via cookies `httpOnly` (`SameSite=Strict`, `Secure`)**.
   - Schéma PostgreSQL 16 multitenant (`database/schema.sql`) structuré autour de la hiérarchie : `Opérateurs -> Zones -> Routeurs -> Forfaits -> Vendeurs POS -> Tickets -> File d'Attente Heartbeat`.

## Structure du Projet (Phases 1 à 4 Complètes)

| Dossier / Fichier | Phase | Rôle & Contenu |
| :--- | :--- | :--- |
| `src/components/public/` | Phase 1 | Site vitrine (Landing Page, Simulateur financier interactif FCFA/GNF, Tarifs, FAQ, Pages légales) |
| `src/components/admin/` | Phase 1 | Console Cloud Administrateur (24 vues : Dashboard, Zones, Routeurs + File d'attente Cloud Pull, Forfaits, Tickets + File d'attente de relais, Bypass MAC, Portail Captif Live Sandbox, Comptabilité, Portefeuille Pay, Mes Gains, Assistant IA RAG, Alertes Telegram) |
| `src/components/pos/POSCashier.tsx` | Phase 1 | Caisse POS Vendeur Mobile-First (Vente Éclair 1-Clic, QR Code, Partage WhatsApp, Téléchargement PNG, Impression Thermique Bluetooth Web Bluetooth ESC/POS 58mm/80mm, SOS Recharge) |
| `public/manifest.json` & `public/sw.js` | Phase 1 | Configuration PWA installable, cache hors-ligne et synchronisation des ventes terrain |
| `database/schema.sql` | Phase 2 | Schéma SQL PostgreSQL 16 multitenant complet avec index et contraintes d'intégrité |
| `server/index.ts` & `server/middleware/auth.ts` | Phase 2 | API REST Express, sécurité JWT `httpOnly` + bcrypt cost 12, endpoint Heartbeat 45s (`/api/v1/mikrotik/heartbeat`) |
| `server/mikrotik/routerosGenerator.ts` | Phase 3 | Moteur de génération dynamique de scripts RouterOS `.rsc` (v6.49+ & v7.10+) et constructeurs de commandes Hotspot |
| `server/services/` | Phase 4 | Intégrations Mobile Money (`mobileMoney.ts`), Assistant IA RAG Gemini (`aiAssistant.ts`) et Bot Telegram (`telegramBot.ts`) |

## Démarrage Rapide

```bash
# 1. Installer les dépendances
npm install

# 2. Initialiser la base de données PostgreSQL (en production)
psql -U postgres -d joowifi_cloud -f database/schema.sql

# 3. Lancer le Front-end Vite (Port 3000)
npm run dev

# 4. Lancer le serveur API Back-end & Endpoint Heartbeat (Port 4000)
npm run dev:api
```

## Publication sur GitHub (`salvatoredymond/joowifi-cloud`)

Un script prêt à l'emploi est inclus à la racine du projet :

```bash
bash push-to-github.sh
```
