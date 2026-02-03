async function initApp() {
    try {
        const [resMateri, resTrans] = await Promise.all([
            fetch('./data/materi.json'),
            fetch('./data/trans.json').catch(() => ({ ok: false })) // Jika trans.json belum ada
        ]);

        const data = await resMateri.json();
        const trans = resTrans.ok ? await resTrans.json() : {};
        const container = document.getElementById('materi-container');

        container.innerHTML = data.materi.map((item) => {
            // Proses isi: Ganti {JPN} kata {JPN} dengan data dari trans.json
            let isiProses = item.isi.replace(/\{JPN\}(.*?)\{JPN\}/g, (match, word) => {
                return trans[word] ? `<span class="jp-text">${trans[word]}</span>` : `<span class="jp-text">${word}</span>`;
            });

            return `
                <article>
                    <details>
                        <summary><strong>${item.judul}</strong></summary>
                        <div class="materi-body">${isiProses}</div>
                        <div class="materi-footer">
                            <div class="kotoba-section">
                                <strong>Kotoba:</strong> <code>${item.kotoba.join(', ')}</code>
                            </div>
                            <div class="tanggal-footer">📅 ${item.tanggal}</div>
                        </div>
                    </details>
                </article>
            `;
        }).join('');
    } catch (err) {
        console.error(err);
    }
    showPage('materi');
}
