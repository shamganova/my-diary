// Service worker: keeps a copy of the app files (and fonts/icons), so the diary opens without internet.
// It always tries the network first, so updates show up as soon as you are online.

const CACHE = "diary-v2";
const FILES = ["./", "index.html", "style.css", "app.js", "db.js", "stickers.js", "manifest.json",
  "icon-180.png", "icon-192.png", "icon-512.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(FILES)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request, { cache: "no-cache" })  // always ask the server for the newest version
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE).then((cache) => cache.put(e.request, copy));
        return response;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true }))
  );
});
