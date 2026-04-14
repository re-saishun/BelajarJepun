const GH_TOKEN = const GH_TOKEN = sessionStorage.getItem('gh_token') || prompt("Masukkan GitHub Token:");
sessionStorage.setItem('gh_token', GH_TOKEN);
const GH_REPO = "re-saishun/BelajarJepun";

async function saveToRepo(path, contentObj) {
    const url = `https://api.github.com/repos/${GH_REPO}/contents/data/${path}.json`;
    
    // Ambil SHA jika file sudah ada
    let sha = "";
    try {
        const res = await fetch(url, { headers: { Authorization: `token ${GH_TOKEN}` } });
        const data = await res.json();
        sha = data.sha;
    } catch(e) {}

    const body = {
        message: "Update blog data",
        content: btoa(unescape(encodeURIComponent(JSON.stringify(contentObj, null, 2)))),
        sha: sha
    };

    const finalRes = await fetch(url, {
        method: "PUT",
        headers: { Authorization: `token ${GH_TOKEN}`, "Content-Type": "application/json" },
        body: JSON.stringify(body)
    });
    return finalRes.ok;
}
