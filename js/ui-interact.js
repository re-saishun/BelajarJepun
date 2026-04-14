const resizer = document.getElementById('resizer');
const wrapper = document.getElementById('split-wrapper');
let isResizing = false;

// 1. Logika Resizer
resizer.addEventListener('mousedown', () => isResizing = true);
document.addEventListener('mousemove', (e) => {
    if (!isResizing) return;
    const offsetLeft = (e.clientX / window.innerWidth) * 100;
    wrapper.style.gridTemplateColumns = `${offsetLeft}% 10px 1fr`;
});
document.addEventListener('mouseup', () => isResizing = false);

// 2. Logika Layer Toggle (0: Ori, 1: Romaji, 2: Indo)
let currentLayer = 0;
function cycleLayer() {
    currentLayer = (currentLayer + 1) % 3;
    const labels = ["Original", "Romaji", "Translation"];
    document.getElementById('layer-label').innerText = labels[currentLayer];
    renderContent(); // Fungsi untuk mengganti teks di layar kiri
}

// 3. Hover Furigana Logic
function createWordNode(original, furigana) {
    const span = document.createElement('span');
    span.className = 'word-node';
    span.innerHTML = `<span class="ori">${original}</span><span class="fur" style="display:none">${furigana}</span>`;
    
    span.onmouseover = () => {
        if(currentLayer === 0) {
            span.querySelector('.ori').style.display = 'none';
            span.querySelector('.fur').style.display = 'inline';
        }
    };
    span.onmouseout = () => {
        if(currentLayer === 0) {
            span.querySelector('.ori').style.display = 'inline';
            span.querySelector('.fur').style.display = 'none';
        }
    };
    return span;
}
