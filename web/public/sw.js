const cacheName = 'speechai-v1';

const assetsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(cacheName).then(function (cache) {
      return cache.addAll(assetsToCache);
    })
  );
  return self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', async event => {
  const req = event.request;
  const url = new URL(req.url);

  if (req.method === 'GET') {
    event.respondWith(networkAndCache(req));
  }
});

async function networkAndCache(req) {
  const cache = await caches.open(cacheName);
  try {
    const fresh = await fetch(req);

    if (fresh && fresh.status === 200 && fresh.type === 'basic' && req.url.startsWith('http')) {
      await cache.put(req, fresh.clone());
    }

    return fresh;
  } catch (e) {
    const cached = await cache.match(req);
    return cached || caches.match('/index.html');
  }
}