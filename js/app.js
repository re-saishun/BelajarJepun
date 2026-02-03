async function initApp() {
    const res = await fetch('data/materi.json');
    const data = await res.json();
    const container = document.getElementById('materi-container');

    container.innerHTML = data.materi.map((item) => {
        item.kotoba.forEach(k => koleksiKotoba.add(k));

        return `
            <article>
                <details>
                    <summary><strong>${item.judul}</strong></summary>
                    <div class="materi-body">
                        ${processJapaneseTags(item.isi)}
                    </div>
                    <div class="kotoba-section">
                        <strong>Kotoba Hari Ini:</strong> 
                        <code>${item.kotoba.join(', ')}</code>
                    </div>
                    <footer class="tanggal-footer">📅 Diunggah: ${item.tanggal}</footer>
                </details>
            </article>
        `;
    }).join('');

    renderKosakata();
}
