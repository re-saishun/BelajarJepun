import json
import os
import re
import google.generativeai as genai

# Konfigurasi API
genai.configure(api_key=os.environ["GEMINI_API_KEY"])

# Daftar Model Gratis 2026
FREE_MODELS = [
    'gemini-2.5-flash-lite', 
    'gemini-2.5-flash',      
    'gemini-3-flash',        
    'gemini-1.5-flash'       
]

def translate_with_fallback(text_list):
    if not text_list:
        return "{}"

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
            
            # Bersihkan markdown ```json jika ada
            clean_json = re.sub(r'```json|```', '', response.text).strip()
            
            # Validasi apakah benar-benar JSON
            parsed_json = json.loads(clean_json)
            print(f"✅ Berhasil menggunakan {model_name}")
            return parsed_json # Mengembalikan objek dictionary
            
        except Exception as e:
            print(f"⚠️ Model {model_name} gagal/limit. Error: {e}")
            continue 
            
    raise Exception("🚨 Semua model gagal. Coba lagi nanti.")

# 1. Baca data/materi.json
if not os.path.exists('data/materi.json'):
    print("❌ materi.json tidak ditemukan")
    exit()

with open('data/materi.json', 'r', encoding='utf-8') as f:
    data_materi = json.load(f)

# 2. Baca data/trans.json (Kamus Lama) jika ada
kamus_existing = {}
if os.path.exists('data/trans.json'):
    with open('data/trans.json', 'r', encoding='utf-8') as f:
        try:
            kamus_existing = json.load(f)
        except:
            kamus_existing = {}

# 3. Kumpulkan semua kata dari {JPN} dan list 'kotoba'
words_found = []
for item in data_materi['materi']:
    # Ambil dari tag {JPN}
    matches = re.findall(r'\{JPN\}(.*?)\{JPN\}', item['isi'])
    words_found.extend([m.strip() for m in matches])
    
    # Ambil dari daftar 'kotoba'
    if 'kotoba' in item and isinstance(item['kotoba'], list):
        words_found.extend([k.strip() for k in item['kotoba']])

# 4. Filter: Cari kata yang BENAR-BENAR baru
unique_words = list(set(words_found))
words_to_translate = [w for w in unique_words if w not in kamus_existing and w != ""]

# 5. Jalankan Proses AI jika ada kata baru
if words_to_translate:
    print(f"🔍 Menemukan {len(words_to_translate)} kata baru untuk diterjemahkan.")
    try:
        # Panggil AI
        new_translations = translate_with_fallback(words_to_translate)
        
        # Gabungkan kamus lama dengan hasil baru
        kamus_existing.update(new_translations)
        
        # Simpan kembali ke trans.json
        with open('data/trans.json', 'w', encoding='utf-8') as f:
            json.dump(kamus_existing, f, ensure_ascii=False, indent=2)
            
        print("🎉 trans.json berhasil diperbarui dengan kata-kata baru!")
        
    except Exception as e:
        print(f"❌ Error saat proses AI: {e}")
else:
    print("😎 Semua kata sudah ada di kamus. Tidak ada yang perlu dikirim ke AI.")
