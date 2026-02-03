// 1. WAJIB ADA: Definisi variabel global
let koleksiKotoba = new Set();

// 2. Fungsi Navigasi
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

// 3. Fungsi Deteksi Tag {JPN}
function processJapaneseTags(text, trans) {
    if (!text) return "";
    const regex = /\{JPN\}(.*?)\{JPN\}/g;
    
    return text.replace(regex, (match, word) => {
        const rawData = trans[word.trim()] || trans[word]; 
        
        if (rawData && rawData.includes('|')) {
            // Pisahkan antara Kanji/Kana dan Arti Indo
            const [jepang, arti] = rawData.split('|').map(s => s.trim());
            
            // Bungkus dalam span dengan atribut data-tooltip (fitur bawaan Pico.css)
            return `<span class="jp-word" data-tooltip="${arti}">${jepang}</span>`;
        }
        
        // Jika data tidak ditemukan, tampilkan teks asli
        return `<span class="jp-word-missing">${word}</span>`;
    });
}

// 4. Render Kosakata
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
        // Mengambil data materi dan trans secara paralel
        const [resMateri, resTrans] = await Promise.all([
            fetch('./data/materi.json'),
            fetch('./data/trans.json').catch(() => null)
        ]);

        const data = await resMateri.json();
        const trans = resTrans && resTrans.ok ? await resTrans.json() : {};

        container.innerHTML = data.materi.map((item) => {
            if (item.kotoba) {
                item.kotoba.forEach(k => koleksiKotoba.add(k));
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
                                <strong>Kotoba:</strong> <code>${item.kotoba ? item.kotoba.join(', ') : '-'}</code>
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

initApp();
