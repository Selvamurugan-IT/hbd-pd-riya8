/* =====================================================================
   PROJECT LITTLE STAR v2.4 — service worker
   - Cache name "priya-birthday-v2.4" is unique to this app.
   - Cleans up old caches to ensure fresh installs launch properly on GitHub Pages.
   ===================================================================== */
const CACHE = "priya-birthday-v2.4";
const PREFIX = "priya-birthday-";

const CORE = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js",
  "./manifest.json",
  "./assets/icons/pwa-icon-192.png",
  "./assets/icons/pwa-icon-512.png",
  "./assets/icons/apple-touch-icon-180.png"
];
const PHOTOS = Array.from({ length: 10 }, (_, i) => `./assets/photos/photo${i + 1}.jpg`);
const CDN_HOSTS = ["fonts.googleapis.com", "fonts.gstatic.com", "cdn.jsdelivr.net"];

self.addEventListener("install", event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(CORE.map(u => new Request(u, { cache: "reload" })));
    await Promise.allSettled(PHOTOS.map(p => cache.add(p)));
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
  if (req.headers.has("range")) return;

  const url = new URL(req.url);

  if (url.origin === self.location.origin) {
    const scopePath = new URL(self.registration.scope).pathname;
    if (!url.pathname.startsWith(scopePath)) return;
    if (url.pathname.includes("/assets/videos/") || url.pathname.includes("/assets/audio/")) return;
    
    if (url.pathname.includes("/assets/photos/")) {
      event.respondWith(cacheFirst(req));
    } else {
      event.respondWith(networkFirst(req));
    }
    return;
  }

  if (CDN_HOSTS.includes(url.hostname)) {
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
    const res = await fetch(req, { cache: "no-cache" });
    if (res && res.ok && !(isNav && new URL(req.url).search)) cache.put(req, res.clone());
    return res;
  } catch (err) {
    const cached = await cache.match(req, { ignoreSearch: isNav });
    if (cached) return cached;
    if (isNav) {
      const shell = (await cache.match("./index.html")) || (await cache.match("./"));
      if (shell) return shell;
    }
    return new Response("", { status: 504, statusText: "Offline" });
  }
}

async function staleWhileRevalidate(event, req) {
  const cache = await caches.open(CACHE);
  const isNav = req.mode === "navigate";
  const cached = await cache.match(req, { ignoreSearch: isNav });

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
