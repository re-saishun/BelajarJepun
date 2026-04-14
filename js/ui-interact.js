let currentLayer = 0; // 0: Original/Furigana, 1: Romaji, 2: Translation
let blogData = null; // Akan diisi saat data di-load dari GitHub
const wrapper = document.getElementById('split-wrapper');
const resizer = document.getElementById('resizer');
const leftPanel = document.getElementById('left-panel');
const rightPanel = document.getElementById('right-panel');

// --- 1. REAL-TIME RESIZER LOGIC ---
let isResizing = false;

resizer.addEventListener('mousedown', (e) => {
    isResizing = true;
    document.body.style.cursor = 'col-resize';
    resizer.classList.add('active');
});

document.addEventListener('mousemove', (e) => {
    if (!isResizing) return;
    
    let pointerX = e.clientX;
    let totalWidth = window.innerWidth;
    let leftWidthPercent = (pointerX / totalWidth) * 100;

    // Batasan minimal 20% dan maksimal 80%
    if (leftWidthPercent > 20 && leftWidthPercent < 80) {
        wrapper.style.gridTemplateColumns = `${leftWidthPercent}% 10px 1fr`;
    }
});

document.addEventListener('mouseup', () => {
    isResizing = false;
    document.body.style.cursor = 'default';
    resizer.classList.remove('active');
});


// --- 2. LAYER RENDERER (LEFT SIDE) ---
function renderContent() {
    const display = document.getElementById('content-display');
    const inputArea = document.getElementById('input-fields');
    display.innerHTML = '';
    inputArea.innerHTML = ''; // Sisi kanan tetap konsisten

    blogData.layers.forEach((line, index) => {
        // --- SISI KIRI (Display) ---
        const lineDiv = document.createElement('div');
        lineDiv.className = 'line-unit';
        lineDiv.id = `line-left-${index}`;

        if (currentLayer === 0) {
            // Mode Original + Hover Furigana
            const span = document.createElement('span');
            span.className = 'text-original';
            span.innerText = line.original;
            
            // Logika Hover Furigana
            span.onmouseenter = () => { span.innerText = line.furigana; span.classList.add('is-furigana'); };
            span.onmouseleave = () => { span.innerText = line.original; span.classList.remove('is-furigana'); };
            
            lineDiv.appendChild(span);
        } else if (currentLayer === 1) {
            lineDiv.innerHTML = `<span class="text-romaji">${line.romaji}</span>`;
        } else {
            lineDiv.innerHTML = `<span class="text-indo">${line.translation}</span>`;
        }
        display.appendChild(lineDiv);

        // --- SISI KANAN (Input) ---
        // Input hanya dibuat sekali saat load awal, atau di-render ulang tetap sinkron
        const inputDiv = document.createElement('div');
        inputDiv.className = 'input-unit';
        inputDiv.id = `line-right-${index}`;
        inputDiv.innerHTML = `
            <textarea id="user-input-${index}" 
                      placeholder="Terjemahan baris ${index + 1}..."
                      oninput="saveProgress(${index}, this.value)"></textarea>
        `;
        inputArea.appendChild(inputDiv);
        
        // Load data dari localStorage jika ada
        const saved = localStorage.getItem(`draft-${blogData.metadata.id}-${index}`);
        if(saved) document.getElementById(`user-input-${index}`).value = saved;
    });
}


// --- 3. FLOATING BUTTON LOGIC ---

// Tombol Kiri: Double Click System
let clickTimer = null;
function cycleLayer() {
    if (clickTimer == null) {
        clickTimer = setTimeout(() => {
            // SINGLE CLICK: Ke Romaji
            currentLayer = 1;
            updateUI();
            clickTimer = null;
        }, 250);
    } else {
        // DOUBLE CLICK: Ke Indo
        clearTimeout(clickTimer);
        clickTimer = null;
        currentLayer = 2;
        updateUI();
    }
}

// Tambahkan klik ketiga atau toggle untuk balik ke Original
function resetToOriginal() {
    currentLayer = 0;
    updateUI();
}

function updateUI() {
    const labels = ["Original", "Romaji", "Translation"];
    document.getElementById('layer-label').innerText = labels[currentLayer];
    renderContent();
}

// Tombol Kanan: AI Verification
async function verifyAll() {
    const confirmAction = confirm("Kirim terjemahanmu untuk diulas oleh AI?");
    if (!confirmAction) return;

    const btn = document.getElementById('btn-verify');
    btn.disabled = true;
    btn.innerText = "...";

    let report = "HASIL EVALUASI TERJEMAHAN\n--------------------------\n";

    for (let i = 0; i < blogData.layers.length; i++) {
        const userText = document.getElementById(`user-input-${i}`).value;
        if (!userText.trim()) continue;

        const original = blogData.layers[i].original;
        const reference = blogData.layers[i].translation;

        // Memanggil AI Kedua (dari ai-processor.js)
        const feedback = await verifyUserTranslation(original, reference, userText);
        report += `Baris ${i+1}:\n${feedback}\n\n`;
    }

    btn.disabled = false;
    btn.innerText = "Check";
    
    // Tampilkan ulasan (Bisa diganti dengan Modal Pop-up)
    alert(report);
}

function saveProgress(index, val) {
    localStorage.setItem(`draft-${blogData.metadata.id}-${index}`, val);
}
