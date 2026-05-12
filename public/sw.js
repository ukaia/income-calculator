// Service worker v2:
//   - Network-first for HTML/navigations (so fresh deploys are picked up immediately).
//   - Cache-first for hashed /assets/* (content-hashed filenames never change).
//   - Stale-while-revalidate for everything else (favicon, manifest).
//   - Old caches purged on activate so v1 (cache-everything-first) is wiped.
const VERSION = "v2";
const STATIC = `ipt-static-${VERSION}`;
const RUNTIME = `ipt-runtime-${VERSION}`;
const SHELL = ["./", "./index.html", "./manifest.webmanifest", "./favicon.svg"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(STATIC).then((c) => c.addAll(SHELL)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== STATIC && k !== RUNTIME).map((k) => caches.delete(k))),
    ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  const { request } = e;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  const isNav = request.mode === "navigate" || request.destination === "document";
  const isHashedAsset = url.pathname.includes("/assets/");

  if (isNav) {
    e.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(STATIC).then((c) => c.put(request, copy)).catch(() => {});
          return res;
        })
        .catch(() =>
          caches.match(request).then((r) => r || caches.match("./index.html")),
        ),
    );
    return;
  }

  if (isHashedAsset) {
    e.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(RUNTIME).then((c) => c.put(request, copy)).catch(() => {});
          }
          return res;
        });
      }),
    );
    return;
  }

  // Stale-while-revalidate
  e.respondWith(
    caches.match(request).then((cached) => {
      const fetchPromise = fetch(request)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(RUNTIME).then((c) => c.put(request, copy)).catch(() => {});
          }
          return res;
        })
        .catch(() => cached);
      return cached || fetchPromise;
    }),
  );
});
