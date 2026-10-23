// ============================================================================
// JOOWIFI PWA SERVICE WORKER v6.0.0 (NETWORK-FIRST + AUTO-PURGE ANCIEN CACHE)
// Garantit que chaque déploiement Vercel charge immédiatement le nouveau bundle
// tout en conservant le mode hors-ligne de secours en cas de coupure réseau.
// ============================================================================

const CACHE_NAME = 'joowifi-pwa-v14.0.0-b2b-stabilized';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
      )
      .then(() => self.clients.claim())
      .then(() =>
        self.clients.matchAll({ type: 'window' }).then((clients) => {
          clients.forEach((client) => {
            if ('navigate' in client) {
              client.navigate(client.url).catch(() => {});
            }
          });
        })
      )
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Ne jamais intercepter les requêtes POST/PATCH/DELETE ni les appels Supabase ou API
  if (
    request.method !== 'GET' ||
    request.url.includes('supabase.co') ||
    request.url.includes('/api/')
  ) {
    return;
  }

  // Stratégie Network-First stricte : toujours récupérer la dernière version en ligne
  event.respondWith(
    fetch(request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const copy = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return networkResponse;
      })
      .catch(() => caches.match(request).then((cached) => cached || caches.match('/index.html')))
  );
});
