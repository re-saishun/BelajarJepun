async function getBlogData(url) {
    const proxy = "https://cors-proxy1.vercel.app/api/fetch?url=";
    const response = await fetch(proxy + encodeURIComponent(url));
    const html = await response.text();
    const doc = new DOMParser().parseFromString(html, 'text/html');

    let blogObj = { title: "", date: "", author: "", content: [], rawHtml: "" };

    if (url.includes("sakurazaka46.com")) {
        blogObj.title = doc.querySelector(".title")?.innerText;
        blogObj.author = doc.querySelector(".eigo")?.innerText;
        blogObj.date = `${doc.querySelector(".ym-year").innerText}.${doc.querySelector(".ym-month").innerText}.${doc.querySelector(".date").innerText}`;
        blogObj.rawHtml = doc.querySelector(".box-article").innerHTML;
    } 
    // ... Tambahkan logika untuk Nogizaka dan Hinatazaka sesuai selektor yang kamu berikan
    
    // Pecah konten menjadi array per baris (split by <br> atau tag p)
    blogObj.content = blogObj.rawHtml.split(/<br\s*\/?>/gi).map(line => line.trim()).filter(l => l !== "");
    return blogObj;
}
