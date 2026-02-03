// 1. Variabel global untuk menyimpan semua kosakata unik yang ditemukan
let koleksiKotoba = new Set();

// 2. Fungsi Navigasi Halaman
function showPage(pageId) {
    const pageMateri = document.getElementById('page-materi');
    const pageKosakata = document.getElementById('page-kosakata');
    const menuDropdown = document.querySelector('details[role="list"]');

    if (pageId === 'materi') {
        pageMateri.classList.remove('hidden');
        pageKosakata.classList.add('hidden');
    } else {
        pageMateri.classList.add('hidden');
        pageKosakata.classList.remove('hidden');
        renderKosakata();
    }

    if (menuDropdown) menuDropdown.removeAttribute('open');
}

// 3. Fungsi Deteksi Tag {JPN} & Tooltip Otomatis
function processJapaneseTags(text, trans) {
    if (!text) return "";
    const regex = /\{JPN\}(.*?)\{JPN\}/g;
    
    return text.replace(regex, (match, word) => {
        const cleanWord = word.trim();
        const rawData = trans[cleanWord]; 
        
        if (rawData && rawData.includes('|')) {
            // Memisahkan "Kanji/Kana | Arti" dari trans.json
            const [jepang, arti] = rawData.split('|').map(s => s.trim());
            // data-tooltip adalah fitur Pico.css untuk hover info
            return `<span class="jp-word" data-tooltip="${arti}">${jepang}</span>`;
        }
        
        return `<span class="jp-word-missing">${cleanWord}</span>`;
    });
}

// 4. Render Halaman Kosakata (Kamus Global User)
function renderKosakata() {
    const list = document.getElementById('kotoba-list');
    if (koleksiKotoba.size === 0) {
        list.innerHTML = "<li>Belum ada kosakata terkumpul.</li>";
        return;
    }
    // Menampilkan daftar unik yang sudah dikumpulkan dari semua materi
    list.innerHTML = [...koleksiKotoba].map(k => `<li><code>${k}</code></li>`).join('');
}

// 5. Inisialisasi Aplikasi UTAMA
async function initApp() {
    const container = document.getElementById('materi-container');
    
    try {
        // Fetch data dengan anti-cache agar data terbaru selalu masuk
        const cacheBuster = `?v=${new Date().getTime()}`;
        const [resMateri, resTrans] = await Promise.all([
            fetch('./data/materi.json' + cacheBuster),
            fetch('./data/trans.json' + cacheBuster).catch(() => null)
        ]);

        const data = await resMateri.json();
        const trans = resTrans && resTrans.ok ? await resTrans.json() : {};

        container.innerHTML = data.materi.map((item) => {
            // Kumpulkan kosakata untuk halaman 'Kosakata'
            if (item.kotoba) {
                item.kotoba.forEach(k => koleksiKotoba.add(k.trim()));
            }

            return `
                <article>
                    <details>
                        <summary><strong>${item.judul}</strong></summary>
                        <div class="materi-body">
                            ${processJapaneseTags(item.isi, trans)}
                        </div>
                        
                        <div class="materi-footer">

<div class="kotoba-section">
    <strong>Kosakata Penting (Tap untuk lihat Jepang):</strong>
    <ul class="kotoba-chips">
        ${item.kotoba && item.kotoba.length > 0 ? 
            item.kotoba.map(k => {
                const cleanK = k.trim();
                const rawData = trans[cleanK];
                
                if (rawData && rawData.includes('|')) {
                    // split: [0] adalah Jepang, [1] adalah Indonesia
                    const [jp, arti] = rawData.split('|').map(s => s.trim());
                    
                    // DIBALIK: yang tampil di chip adalah 'arti', yang di tooltip adalah 'jp'
                    return `<li class="chip" data-tooltip="${jp}">${arti}</li>`;
                }
                
                // Jika data belum ada di trans.json
                return `<li class="chip" data-tooltip="Belum diterjemahkan AI">${cleanK}</li>`;
            }).join('') 
            : '<li>-</li>'
        }
    </ul>
</div>
                            <div class="tanggal-footer">📅 ${item.tanggal}</div>
                        </div>
                    </details>
                </article>
            `;
        }).join('');

    } catch (err) {
        console.error("Error saat loading:", err);
        container.innerHTML = `<mark>Gagal memuat materi. Pastikan file data/materi.json sudah ada dan formatnya benar.</mark>`;
    }

    showPage('materi');
}

// Jalankan aplikasi
initApp();
