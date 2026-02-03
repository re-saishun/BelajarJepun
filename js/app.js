// 1. State Global
let koleksiKotoba = new Set();

// 2. Fungsi Navigasi (Harus di luar agar bisa diakses onclick dari HTML)
function showPage(pageId) {
    const pageMateri = document.getElementById('page-materi');
    const pageKosakata = document.getElementById('page-kosakata');
    const menuDropdown = document.querySelector('details[role="list"]');

    if (pageId === 'materi') {
        pageMateri.classList.remove('hidden');
        pageKosakata.classList.add('hidden');
    } else {
        pageMateri.classList.remove('hidden'); // Memastikan materi tersembunyi jika ingin benar-benar switch
        pageMateri.classList.add('hidden');
        pageKosakata.classList.remove('hidden');
        renderKosakata(); // Update daftar setiap kali buka page kosakata
    }

    // Tutup menu otomatis setelah klik (untuk Pico.css)
    if (menuDropdown) {
        menuDropdown.removeAttribute('open');
    }
}

// 3. Fungsi Deteksi Tag {JPN}
function processJapaneseTags(text) {
    if (!text) return "";
    const regex = /\{JPN\}(.*?)\{JPN\}/g;
    
    // Log ke console untuk kamu copy-paste ke AI nantinya
    const matches = [...text.matchAll(regex)].map(match => match[1]);
    if (matches.length > 0) {
        console.log("📝 Kata ditemukan untuk diproses AI:", matches);
    }

    return text.replace(regex, '<span class="jp-text">$1</span>');
}

// 4. Render Daftar Kosakata ke Tab Kosakata
function renderKosakata() {
    const list = document.getElementById('kotoba-list');
    if (koleksiKotoba.size === 0) {
        list.innerHTML = "<li>Belum ada kosakata terkumpul.</li>";
        return;
    }
    list.innerHTML = [...koleksiKotoba].map(k => `<li><code>${k}</code></li>`).join('');
}

// 5. Inisialisasi Aplikasi
async function initApp() {
    const container = document.getElementById('materi-container');
    
    try {
        // Gunakan path relatif tanpa tanda / di depan agar aman di GitHub Pages
        const res = await fetch('./data/materi.json');
        if (!res.ok) throw new Error("Gagal mengambil file JSON");
        
        const data = await res.json();

        container.innerHTML = data.materi.map((item) => {
            // Masukkan kotoba ke koleksi global
            if (item.kotoba) {
                item.kotoba.forEach(k => koleksiKotoba.add(k));
            }

            return `
                <article>
                    <details>
                        <summary><strong>${item.judul}</strong></summary>
                        <div class="materi-body">
                            ${processJapaneseTags(item.isi)}
                        </div>
                        <div class="kotoba-section">
                            <strong>Kotoba Hari Ini:</strong> 
                            <code>${item.kotoba ? item.kotoba.join(', ') : '-'}</code>
                        </div>
                        <footer class="tanggal-footer">📅 Diunggah: ${item.tanggal}</footer>
                    </details>
                </article>
            `;
        }).join('');

    } catch (err) {
        console.error("Error:", err);
        container.innerHTML = `<mark>Gagal memuat materi: ${err.message}</mark>`;
    }

    // Default: Pastikan masuk ke halaman materi saat start
    showPage('materi');
}

// Jalankan aplikasi saat script dimuat
initApp();
