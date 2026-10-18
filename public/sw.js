// ============================================================================
// JOOWIFI PWA SERVICE WORKER (sw.js)
// Conçu pour la continuité de service sur le terrain (Caisse POS & Console Cloud)
// Stratégies : Cache-First (Assets UI/Fonts) + Network-First (API) + Offline Sync
// ============================================================================

const CACHE_NAME = 'joowifi-pwa-v2.4.0';
const OFFLINE_QUEUE_KEY = 'joowifi-offline-pos-queue';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg',
];

// 1. Installation : pré-cache des ressources essentielles de la PWA
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// 2. Activation : nettoyage des anciens caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// 3. Interception des requêtes réseau
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorer les requêtes non-GET pour le cache de navigation
  if (request.method !== 'GET') {
    return;
  }

  // Stratégie Network-First pour les appels API (/api/v1/*)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const cloned = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, cloned));
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Stratégie Stale-While-Revalidate pour l'interface PWA (POS & Admin)
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return networkResponse;
        })
        .catch(() => cachedResponse || caches.match('/index.html'));

      return cachedResponse || fetchPromise;
    })
  );
});

// 4. Synchronisation en arrière-plan des ventes POS effectuées hors-ligne
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-pos-sales') {
    event.waitUntil(
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({
            type: 'JOOWIFI_POS_SYNC_READY',
            timestamp: new Date().toISOString(),
          });
        });
      })
    );
  }
});
