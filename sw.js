// Service worker: app disponibile anche senza rete; i dati si scaricano sempre freschi se possibile.
const VERSIONE = "mbc-v4";
const GUSCIO = ["./", "index.html", "manifest.webmanifest", "icona-192.png", "icona-512.png", "icona-180.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(VERSIONE).then(c => c.addAll(GUSCIO))); self.skipWaiting(); });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(n => n !== VERSIONE).map(n => caches.delete(n)))));
  self.clients.claim();
});
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return;
  if (url.pathname.endsWith("/scadenze.enc")) {
    // prima la rete; senza rete l'ultima copia scaricata (resta cifrata)
    e.respondWith(fetch(e.request).then(r => {
      if (r.ok) { const copia = r.clone(); caches.open(VERSIONE).then(c => c.put("scadenze.enc", copia)); }
      return r;
    }).catch(() => caches.match("scadenze.enc")));
    return;
  }
  e.respondWith(fetch(e.request).then(r => {
    if (r.ok) { const copia = r.clone(); caches.open(VERSIONE).then(c => c.put(e.request, copia)); }
    return r;
  }).catch(() => caches.match(e.request, { ignoreSearch: true })));
});
