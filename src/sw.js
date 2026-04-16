/**
 * VotCuSens — Service Worker pentru funcționare offline completă.
 *
 * Strategia: "Cache on Install" (precache).
 * La instalare, toate resursele aplicației sunt descărcate și stocate în cache.
 * La activare, cache-urile vechi sunt șterse automat.
 * La fetch, se servește din cache (offline-first), cu fallback la rețea.
 *
 * Versiunea CACHE_VERSION trebuie incrementată la fiecare deployment
 * pentru a forța actualizarea resurselor.
 */

const CACHE_VERSION = 'votcusens-v1';

/**
 * Lista resurselor care trebuie cache-uite la instalare.
 * Aceasta va fi populată automat la build prin scriptul generate-sw-assets.js,
 * sau poate fi menținută manual.
 */
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/list',
  '/vote',
  '/scan',
  '/simulate'
];

// ─── Install: pre-cache toate resursele ──────────────────────────────────────
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker:', CACHE_VERSION);
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => {
      // Cache resursele critice; nu oprim instalarea dacă unele lipsesc
      return cache.addAll(PRECACHE_URLS).catch((err) => {
        console.warn('[SW] Precache partial — unele resurse nu au putut fi cache-uite:', err);
      });
    }).then(() => {
      // Activează imediat noul SW, fără să aștepte închiderea tab-urilor vechi
      return self.skipWaiting();
    })
  );
});

// ─── Activate: curăță cache-urile vechi ──────────────────────────────────────
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker:', CACHE_VERSION);
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_VERSION)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => {
      // Preia controlul imediat asupra tuturor clienților activi
      return self.clients.claim();
    })
  );
});

// ─── Fetch: cache-first, apoi rețea, apoi fallback la index.html ─────────────
self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Ignoră cererile non-GET (POST, etc.)
  if (request.method !== 'GET') return;

  // Ignoră cererile către alte origini (CDN-uri externe, etc.)
  if (!request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      // Nu e în cache — încearcă rețeaua
      return fetch(request)
        .then((networkResponse) => {
          // Cache-uim și răspunsul de la rețea pentru viitor
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_VERSION).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Offline și nu e în cache — pentru rutele de navigare, servim index.html
          if (request.mode === 'navigate') {
            return caches.match('/index.html');
          }
          // Pentru alte resurse, returnăm un răspuns gol
          return new Response('', {
            status: 503,
            statusText: 'Offline — resursa nu este disponibilă în cache'
          });
        });
    })
  );
});
