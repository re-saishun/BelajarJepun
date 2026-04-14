// Mengambil token dari session agar tidak hardcoded di source code
const GH_TOKEN = sessionStorage.getItem('gh_token') || prompt("Masukkan GitHub Token:");
if (GH_TOKEN) sessionStorage.setItem('gh_token', GH_TOKEN);

const GH_REPO = "re-saishun/BelajarJepun";

/**
 * Fungsi untuk menyimpan data ke GitHub
 * @param {string} path - Path folder/nama file (misal: 'sakurazaka/blog_123')
 * @param {object} contentObj - Object data yang ingin disimpan
 */
async function saveToRepo(path, contentObj) {
    const url = `https://api.github.com/repos/${GH_REPO}/contents/data/${path}.json`;
    
    let sha = "";
    try {
        // 1. Cek apakah file sudah ada untuk mendapatkan SHA (diperlukan untuk update)
        const res = await fetch(url, { 
            headers: { "Authorization": `token ${GH_TOKEN}` } 
        });
        
        if (res.ok) {
            const data = await res.json();
            sha = data.sha;
        }
    } catch(e) {
        console.log("File baru, tidak memerlukan SHA.");
    }

    // 2. Encode konten ke Base64 (Mendukung karakter Kanji/Unicode)
    const jsonString = JSON.stringify(contentObj, null, 2);
    const utf8Bytes = new TextEncoder().encode(jsonString);
    const base64Content = btoa(String.fromCharCode(...utf8Bytes));

    const body = {
        message: `Update blog data: ${path}`,
        content: base64Content,
        sha: sha || undefined // Jika SHA kosong, jangan kirim propertinya
    };

    // 3. Eksekusi Upload
    try {
        const finalRes = await fetch(url, {
            method: "PUT",
            headers: { 
                "Authorization": `token ${GH_TOKEN}`,
                "Content-Type": "application/json" 
            },
            body: JSON.stringify(body)
        });

        if (finalRes.ok) {
            console.log(`✅ Berhasil menyimpan ke: data/${path}.json`);
            return true;
        } else {
            const errData = await finalRes.json();
            console.error("❌ Gagal simpan:", errData.message);
            return false;
        }
    } catch (err) {
        console.error("❌ Network Error:", err);
        return false;
    }
}
