// The service worker served at /api/sw. Kept as a string so the server route
// can serve it with the right headers and scope. No template literals inside.
export const swScript = String.raw`
const CACHE = "pc-tycoon-v1";
// Same-origin paths that must always hit the network (live data, auth).
const NETWORK_ONLY = ["/api/", "/auth/", "/ws-user-apps"];

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.protocol !== "http:" && url.protocol !== "https:") return;
  if (url.origin === self.location.origin && NETWORK_ONLY.some((p) => url.pathname.startsWith(p))) return;

  event.respondWith(
    caches.open(CACHE).then(async (cache) => {
      // Pages: prefer the network, fall back to the cached copy when offline.
      if (req.mode === "navigate") {
        try {
          const fresh = await fetch(req);
          cache.put(req, fresh.clone());
          return fresh;
        } catch (err) {
          return (await cache.match(req)) || (await cache.match("/")) || Response.error();
        }
      }
      // Assets (app code, styles, fonts, pixel art): serve cached instantly,
      // fetch and store anything not seen before.
      const cached = await cache.match(req);
      const network = fetch(req)
        .then((res) => {
          if (res && (res.ok || res.type === "opaque")) cache.put(req, res.clone());
          return res;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
`;