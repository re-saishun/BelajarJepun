// Memastikan browser mendukung Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Jalur file sw.js (sesuaikan jika folder projectmu di sub-folder GitHub)
    // Gunakan './sw.js' agar aman di GitHub Pages
    navigator.serviceWorker.register('./sw.js')
      .then(registration => {
        console.log('✅ ServiceWorker berhasil didaftarkan dengan scope: ', registration.scope);
      })
      .catch(error => {
        console.log('❌ Pendaftaran ServiceWorker gagal: ', error);
      });
  });
}
