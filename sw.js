/* =====================================================================
   PROJECT LITTLE STAR v2.1 — service worker
   - Cache name "priya-birthday-v2.1" is unique to this app, so it never clashes
     with other apps (e.g. ChronoPulse) on the same username.github.io origin.
   - Only deletes caches starting with "priya-birthday-" (never anyone else's).
   - Only reads from ITS OWN cache (never the global caches.match).
   - Requests outside this app's scope are left alone.
   - Video + audio are NOT intercepted: browsers stream them with Range
     requests, which a simple cache can't serve correctly.
   To ship an update: bump CACHE (e.g. priya-birthday-v2.2) and re-publish.
   On activate every older "priya-birthday-*" cache (v1, v2 …) is deleted, so stale scripts are flushed.
   Page code (html / css / js / json) is NETWORK-FIRST: a fresh script.js is used whenever the phone is
   online; the cache is only the offline fallback. Photos stay cache-first.
   ===================================================================== */
const CACHE = "priya-birthday-v2.1";
const PREFIX = "priya-birthday-";

const CORE = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js",
  "./manifest.json",
  "./assets/icons/pwa-icon-192.png",
  "./assets/icons/pwa-icon-512.png"
];
const PHOTOS = Array.from({ length: 10 }, (_, i) => `./assets/photos/photo${i + 1}.jpg`)
  .concat(Array.from({ length: 10 }, (_, i) => `./assets/photos/photo${i + 1}.jpeg`));   // whichever extension exists gets cached
const CDN_HOSTS = ["fonts.googleapis.com", "fonts.gstatic.com", "cdn.jsdelivr.net"];

self.addEventListener("install", event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(CORE);                                   // must succeed
    await Promise.allSettled(PHOTOS.map(p => cache.add(p)));    // nice-to-have: missing photos are fine
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k.startsWith(PREFIX) && k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET") return;
  if (req.headers.has("range")) return;                         // streaming media -> browser handles it
  const url = new URL(req.url);

  if (url.origin === self.location.origin) {
    const scopePath = new URL(self.registration.scope).pathname;
    if (!url.pathname.startsWith(scopePath)) return;            // not ours -> hands off
    if (url.pathname.includes("/assets/videos/") || url.pathname.includes("/assets/audio/")) return;
    if (url.pathname.includes("/assets/photos/")) {
      event.respondWith(cacheFirst(req));
    } else {
      event.respondWith(networkFirst(req));                     // html / css / js / json: always try the network first
    }
    return;
  }

  if (CDN_HOSTS.includes(url.hostname)) {                       // fonts + confetti lib, cached for offline
    event.respondWith(staleWhileRevalidate(event, req));
  }
});

async function cacheFirst(req) {
  const cache = await caches.open(CACHE);
  const hit = await cache.match(req);
  if (hit) return hit;
  try {
    const res = await fetch(req);
    if (res && res.ok) cache.put(req, res.clone());
    return res;
  } catch (err) {
    return new Response("", { status: 504, statusText: "Offline" });
  }
}

async function networkFirst(req) {
  const cache = await caches.open(CACHE);
  const isNav = req.mode === "navigate";
  try {
    const res = await fetch(req, { cache: "no-cache" });          // revalidate with the server, bypassing the HTTP cache
    if (res && res.ok && !(isNav && new URL(req.url).search)) cache.put(req, res.clone());
    return res;
  } catch (err) {                                                 // offline -> last good copy
    const cached = await cache.match(req, { ignoreSearch: isNav });
    if (cached) return cached;
    if (isNav) {
      const shell = await cache.match("./index.html");
      if (shell) return shell;
    }
    return new Response("", { status: 504, statusText: "Offline" });
  }
}

async function staleWhileRevalidate(event, req) {
  const cache = await caches.open(CACHE);
  const isNav = req.mode === "navigate";
  const cached = await cache.match(req, { ignoreSearch: isNav });   // ?reset etc. still hits the cached page

  const refresh = fetch(req)
    .then(res => {
      if (res && (res.ok || res.type === "opaque") && !(isNav && new URL(req.url).search)) {
        cache.put(req, res.clone());
      }
      return res;
    })
    .catch(() => null);

  if (cached) {
    event.waitUntil(refresh);
    return cached;
  }
  const fresh = await refresh;
  if (fresh) return fresh;
  if (isNav) {
    const shell = await cache.match("./index.html");
    if (shell) return shell;
  }
  return new Response("", { status: 504, statusText: "Offline" });
}
