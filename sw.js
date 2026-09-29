// Service worker minimal — requis par Chrome pour proposer "Installer l'application".
// Stratégie network-first : on sert toujours la version en ligne quand elle est
// disponible (les mises à jour du dashboard arrivent immédiatement), et le cache
// prend le relais hors connexion.
const CACHE = 'piano-dashboard-v2';
const ASSETS = ['.', 'index.html', 'manifest.json', 'icon-192.png', 'icon-512.png', 'atelier-boogie.html'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
