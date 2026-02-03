// Global State untuk menyimpan kosakata unik
let koleksiKotoba = new Set();

// 1. Fungsi Toggle Hamburger
document.getElementById('menu-toggle').onclick = () => {
    document.getElementById('nav-links').classList.toggle('hidden');
};

// 2. Navigasi Halaman
function showPage(pageId) {
    document.getElementById('page-materi').classList.toggle('hidden', pageId !== 'materi');
    document.getElementById('page-kosakata').classList.toggle('hidden', pageId !== 'kosakata');
    document.getElementById('nav-links').classList.add('hidden'); // tutup menu
}

// 3. Fungsi Deteksi Tag {JPN}
function processJapaneseTags(text) {
    // Mencari kata di antara {JPN}...{JPN}
    const regex = /\{JPN\}(.*?)\{JPN\}/g;
    const matches = [...text.matchAll(regex)].map(match => match[1]);
    
    if (matches.length > 0) {
        console.log("Kirim kata-kata ini ke AI untuk ditranslate:", matches);
        // Di sini kamu bisa copy output console ini ke AI nantinya
    }

    // Mengganti tag menjadi span agar bisa di-style berbeda (misal warna biru)
    return text.replace(regex, '<span class="jp-text">$1</span>');
}

// 4. Render Materi & Accordion
async function initApp() {
    const res = await fetch('data/materi.json');
    const data = await res.json();
    const container = document.getElementById('materi-container');

    container.innerHTML = data.materi.map((item, index) => {
        // Simpan kotoba ke daftar koleksi
        item.kotoba.forEach(k => koleksiKotoba.add(k));

        return `
            <div class="accordion-item">
                <button class="accordion-header" onclick="toggleAccordion(${index})">
                    ${item.judul} <span>▼</span>
                </button>
                <div id="content-${index}" class="accordion-content hidden">
                    <div class="materi-body">
                        ${processJapaneseTags(item.isi)}
                    </div>
                    <div class="kotoba-section">
                        <strong>Kotoba Hari Ini:</strong> ${item.kotoba.join(', ')}
                    </div>
                    <div class="tanggal-footer">Diunggah: ${item.tanggal}</div>
                </div>
            </div>
        `;
    }).join('');

    renderKosakata();
}

function toggleAccordion(index) {
    const content = document.getElementById(`content-${index}`);
    content.classList.toggle('hidden');
}

function renderKosakata() {
    const list = document.getElementById('kotoba-list');
    list.innerHTML = [...koleksiKotoba].map(k => `<li>${k}</li>`).join('');
}

initApp();
