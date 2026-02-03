const CACHE_NAME = 'belajarjepun-v1';
const assets = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/app.js',
  '/js/pwa-setup.js',
  '/data/materi.json', // File materi disimpan di cache!
  '/manifest.json'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(assets)));
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(res => res || fetch(e.request))
  );
});
