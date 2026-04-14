// Mengambil API Key dari session agar tidak hardcoded
const API_KEY_PROCESSOR = sessionStorage.getItem('api_processor') || prompt("Masukkan API Key AI Pertama (Processor):");
if (API_KEY_PROCESSOR) sessionStorage.setItem('api_processor', API_KEY_PROCESSOR);

const API_KEY_VERIFIER = sessionStorage.getItem('api_verifier') || prompt("Masukkan API Key AI Kedua (Verifier):");
if (API_KEY_VERIFIER) sessionStorage.setItem('api_verifier', API_KEY_VERIFIER);

async function processBlogLayers(lines) {
    const batchSize = 10; // Batch kecil agar hasil lebih akurat
    let results = [];

    for (let i = 0; i < lines.length; i += batchSize) {
        const batch = lines.slice(i, i + batchSize);
        
        const prompt = {
            contents: [{
                parts: [{
                    text: `Task: Japanese-Indonesian Linguist. 
                    Convert each line into a JSON object with 4 layers.
                    
                    Rules:
                    1. "original": raw text.
                    2. "furigana": text with hiragana in brackets () after Kanji.
                    3. "romaji": hepburn style.
                    4. "translation": natural Indonesian.
                    
                    Lines to process:
                    ${batch.join('\n')}
                    
                    Return ONLY a JSON array of objects.`
                }]
            }]
        };

        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY_PROCESSOR}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(prompt)
            });

            const data = await response.json();
            const responseText = data.candidates[0].content.parts[0].text;
            const jsonClean = responseText.replace(/```json|```/g, "").trim();
            results = results.concat(JSON.parse(jsonClean));
        } catch (error) {
            console.error("Error AI Layering:", error);
        }
    }
    return results;
}

/**
 * AI KEDUA: Membandingkan terjemahan User dengan referensi AI awal.
 * Dipicu saat menekan tombol "Check" (FAB Kanan).
 */
async function verifyUserTranslation(originalJp, aiReference, userTranslation) {
    const prompt = {
        contents: [{
            parts: [{
                text: `Task: Japanese Language Tutor.
                Compare the USER translation with the AI reference translation based on the ORIGINAL text.
                
                Data:
                - Original: ${originalJp}
                - Reference: ${aiReference}
                - User: ${userTranslation}
                
                Instruction:
                1. Berikan skor (0-100) berdasarkan keakuratan makna dan nuansa.
                2. Berikan ulasan singkat (max 2 kalimat) dalam Bahasa Indonesia tentang apa yang salah (misal: salah partikel, salah makna kata, atau nuansa kurang pas).
                
                Format Output: 
                SKOR: [angka]
                ULASAN: [teks]`
            }]
        }]
    };

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY_VERIFIER}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(prompt)
        });

        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    } catch (error) {
        console.error("Error AI Verifier:", error);
        return "Gagal memverifikasi. Silakan coba lagi.";
    }
}
