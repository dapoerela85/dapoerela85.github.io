const cacheName = 'pwa-v1';
const assets = [
  '/',
  '/index.html',
  '/assets/css/style.css',
  '/assets/icons/icon-192.png'
];

// Install service worker and cache assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(cacheName).then(cache => cache.addAll(assets))
  );
});

// Serve cached content when offline
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});