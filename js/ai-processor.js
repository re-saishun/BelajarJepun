const GEMINI_API_KEY = "YOUR_API_KEY";

async function processLinesWithAI(lines) {
    const batchSize = 12;
    let processedData = [];

    for (let i = 0; i < lines.length; i += batchSize) {
        const batch = lines.slice(i, i + batchSize);
        const prompt = `Task: Analyze Japanese blog lines.
        Format: JSON Array of Objects
        Object Structure: 
        - original: raw text
        - furigana: text with hiragana in brackets () after Kanji
        - romaji: hepburn romaji
        - translation: indonesian translation
        Lines: \n${batch.join('\n')}`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });
        
        const resJson = await response.json();
        const cleanText = resJson.candidates[0].content.parts[0].text.replace(/```json|```/g, "");
        processedData = processedData.concat(JSON.parse(cleanText));
    }
    return processedData;
}
