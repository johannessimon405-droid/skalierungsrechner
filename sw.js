// Service Worker: speichert die App auf dem Gerät, damit sie ohne Internet läuft.
// Ablauf: Antwort sofort aus dem Speicher, im Hintergrund wird nach einer neuen Version geschaut.
// Nach einer Änderung an den Dateien die Versionsnummer hochzählen.
const CACHE = "skalierung-v1";
const FILES = ["./", "./index.html", "./manifest.json", "./icon-180.png", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)));
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const net = fetch(e.request).then(r => {
    if (r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
    return r;
  });
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(hit => hit || net));
  e.waitUntil(net.catch(() => {}));
});
