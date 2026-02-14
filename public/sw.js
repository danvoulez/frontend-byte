// Basic network-first Service Worker for Next.js
const CACHE_NAME = 'app-cache-v1';
self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});
self.addEventListener('fetch', (event) => {
  const req = event.request;
  // Ignore non-GET or other protocols
  if (req.method !== 'GET' || !req.url.startsWith(self.location.origin)) return;
  event.respondWith((async () => {
    try {
      const networkRes = await fetch(req);
      const cache = await caches.open(CACHE_NAME);
      cache.put(req, networkRes.clone());
      return networkRes;
    } catch (e) {
      const cacheRes = await caches.match(req);
      if (cacheRes) return cacheRes;
      throw e;
    }
  })());
});
