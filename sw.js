const cacheName = 'dapoer-ela-v1.1';
const assets = [
  '/',
  '/index.html',
  '/assets/icons/icon-192.png',
  '/assets/icons/icon-512.png'
];

// 1. Install & Cache (Fault-tolerant)
self.addEventListener('install', event => {
  // Forces the waiting service worker to become the active one immediately
  self.skipWaiting();
  event.waitUntil(
    caches.open(cacheName).then(cache => {
      console.log('Caching shell assets');

      // Fetch individually so one 404 doesn't break the entire install
      return Promise.allSettled(
        assets.map(async (url) => {
          try {
            const response = await fetch(url);
            if (response.ok) {
              await cache.put(url, response);
            } else {
              console.warn(`[SW] Failed to cache \({url}: Status\){response.status}`);
            }
          } catch (err) {
            console.error(`[SW] Network error caching ${url}:`, err);
          }
        })
      );
    })
  );
});

// 2. Activate: Clean up old versions of the cache
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== cacheName)
            .map(key => caches.delete(key))
      );
    })
  );
});

// 3. Fetch Strategy: Network First, falling back to Cache
// Better for catalogs/menus so users see the latest items if they have internet.
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        // If we have internet, return the fresh version
        return networkResponse;
      })
      .catch(() => {
        // If internet fails, look in the cache
        return caches.match(event.request);
      })
  );
});
