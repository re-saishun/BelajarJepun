import json
import os
import re
import google.generativeai as genai

# Konfigurasi API
genai.configure(api_key=os.environ["GEMINI_API_KEY"])

# Daftar Model Gratis (Urutkan dari yang paling pintar ke yang paling cepat)
FREE_MODELS = [
    'gemini-2.5-flash-lite', # Prioritas: 10 RPM (Paling Longgar)
    'gemini-2.5-flash',      # Cadangan: 5 RPM
    'gemini-3-flash',        # Cadangan: 5 RPM (Model terbaru generasi 3)
    'gemini-1.5-flash'       # Fallback terakhir (Model stabil lama)
]

def translate_with_fallback(text_list):
    prompt = f"""
    Translate these Japanese Romaji words. 
    Format: Romaji as KEY, and "HTML_RUBY | INDO_MEANING" as VALUE.
    Use <ruby> tag for Kanji with Furigana.
    Example: {{"watashi": "<ruby>私<rt>わたし</rt></ruby> | Saya"}}
    Words to translate: {text_list}
    ONLY return valid JSON. No preamble, no markdown code blocks.
    """

    for model_name in FREE_MODELS:
        try:
            print(f"🤖 Mencoba dengan model: {model_name}...")
            model = genai.GenerativeModel(model_name)
            response = model.generate_content(prompt)
            
            # Bersihkan markdown jika ada
            clean_json = re.sub(r'```json|```', '', response.text).strip()
            
            # Validasi apakah benar-benar JSON
            json.loads(clean_json)
            print(f"✅ Berhasil menggunakan {model_name}")
            return clean_json
            
        except Exception as e:
            print(f"⚠️ Model {model_name} gagal atau limit habis. Error: {e}")
            continue # Lanjut ke model berikutnya dalam daftar
            
    raise Exception("🚨 Semua model gratisan gagal/limit habis. Coba lagi nanti.")

# 1. Baca materi.json
if not os.path.exists('data/materi.json'):
    print("materi.json tidak ditemukan")
    exit()

with open('data/materi.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# 2. Cari semua tag {JPN}
found_words = []
for item in data['materi']:
    matches = re.findall(r'\{JPN\}(.*?)\{JPN\}', item['isi'])
    found_words.extend(matches)

# 3. Jalankan Proses AI
if found_words:
    unique_words = list(set(found_words))
    print(f"🔍 Menemukan {len(unique_words)} kata unik.")
    
    try:
        final_result = translate_with_fallback(unique_words)
        
        with open('data/trans.json', 'w', encoding='utf-8') as f:
            f.write(final_result)
        print("🎉 trans.json berhasil diperbarui dengan data AI!")
        
    except Exception as e:
        print(e)
else:
    print("ℹ️ Tidak ada tag {JPN} baru untuk diterjemahkan.")
