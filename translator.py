import json
import os
import re
import google.generativeai as genai

# Setup Gemini
genai.configure(api_key=os.environ["GEMINI_API_KEY"])
model = genai.GenerativeModel('gemini-pro')

def translate_text(text_list):
    prompt = f"""
    Terjemahkan kata Romaji Jepang berikut ke dalam format: Romaji | Kanji/Kana | Arti Indo.
    Jika ada Kanji, sertakan Furigana di atasnya dengan format HTML <ruby>.
    Contoh: "watashi" menjadi "私(わたし) | Saya"
    Daftar kata: {text_list}
    Berikan output dalam format JSON objek sederhana: {{"romaji": "hasil_html_ruby | arti"}}
    """
    response = model.generate_content(prompt)
    return response.text

# 1. Baca materi.json
with open('data/materi.json', 'r') as f:
    data = json.load(f)

# 2. Cari semua tag {JPN}
found_words = []
for item in data['materi']:
    matches = re.findall(r'\{JPN\}(.*?)\{JPN\}', item['isi'])
    found_words.extend(matches)

# 3. Kirim ke AI jika ada kata baru
if found_words:
    unique_words = list(set(found_words))
    # Logika panggil AI di sini dan simpan ke data/trans.json
    # (Untuk efisiensi, asumsikan AI mengembalikan JSON format trans)
    ai_result = translate_text(unique_words) 
    
    with open('data/trans.json', 'w') as f:
        f.write(ai_result)
