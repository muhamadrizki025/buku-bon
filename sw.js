// Buku Bon service worker — cache-first with network update for offline support.
const CACHE_NAME = 'bukubon-v2';
// When adding a new app folder, add its index.html and config.js to PRECACHE.
const PRECACHE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './skeleton/app.js',
  './skeleton/parser.js',
  './skeleton/store.js',
  './skeleton/voice.js',
  './skeleton/style.css',
  './app-warung/index.html',
  './app-warung/config.js',
  './app-ojol/index.html',
  './app-ojol/config.js',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE)));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
  )));
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => {
      const fetched = fetch(e.request).then(resp => {
        if (resp && resp.status === 200 && resp.type === 'basic') {
          const copy = resp.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, copy));
        }
        return resp;
      }).catch(() => cached);
      return cached || fetched;
    })
  );
});
