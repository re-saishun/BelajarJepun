const CACHE_NAME = 'belajarjepun-cache-v1';

// Daftar semua file yang ingin disimpan offline
const assetsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/css/style.css',
  '/js/app.js',
  '/js/pwa-setup.js',
  '/data/materi.json',
  '/src/icon-192x192.png',
  '/src/icon-512x512.png'
];

// Tahap Install: Simpan aset ke cache
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Mencadangkan aset ke cache...');
        return cache.addAll(assetsToCache);
      })
  );
});

// Tahap Aktifasi: Hapus cache lama jika ada update versi
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
      );
    })
  );
});

// Tahap Fetch: Ambil dari cache jika offline, jika tidak ada baru ambil dari internet
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      return cachedResponse || fetch(event.request);
    })
  );
});
