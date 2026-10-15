# Parser modul bimbel (PDF asli) -> Materi bergambar untuk aplikasi.
# Pakai: python scripts/render-modul.py <file.pdf>
# Hasil: web/public/materi-ipa11/*.jpg + web/data/materi-ipa11.js
#
# Prinsip: tiap bab = gambar halaman asli modul (diagram & rumus utuh),
# dirender dari PDF beresolusi cukup untuk dibaca di layar.
import json
import os
import re
import sys

import pymupdf

sys.stdout.reconfigure(encoding="utf-8", errors="replace")

if len(sys.argv) < 2:
    sys.exit("Pakai: python scripts/render-modul.py <file.pdf> [--teks MULAI AKHIR]")

AKAR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
PDF = sys.argv[1]
TEKS_MODE = "--teks" in sys.argv  # cetak teks per bab, tidak render gambar
if TEKS_MODE:
    i = sys.argv.index("--teks")
    MULAI = int(sys.argv[i + 1]) if len(sys.argv) > i + 1 else 0
    AKHIR = int(sys.argv[i + 2]) if len(sys.argv) > i + 2 else 9
OUT_DIR = os.path.join(AKAR, "web", "public", "materi-ipa11")
DATA_JS = os.path.join(AKAR, "web", "data", "materi-ipa11.js")
if not TEKS_MODE:
    os.makedirs(OUT_DIR, exist_ok=True)

MAJEL = {
    "MATEMATIKA": "Matematika",
    "B I O L O G I": "Biologi",
    "K I M I A": "Kimia",
    "FISIKA": "Fisika",
    "BAHASA INDONESIA": "Bahasa Indonesia",
    "BAHASA INGGRIS": "Bahasa Inggris",
}
RE_HAL = re.compile(r"KELAS\s*:\s*11 IPA \[KURMER\]\s*\|\s*(\d+)")
RE_MAP = re.compile(r"MODUL BELAJAR REGULER\s+([A-Z][A-Z ]*?)\s*(?:\n|$)")
RE_TOC = re.compile(r"^(.*?)[.\s]*\bHal\s*(\d+)\s*$")

doc = pymupdf.open(PDF)

# ---------- 1. Petakan nomor halaman modul -> halaman PDF + mapel ----------
hal_ke_pdf = {}   # hal -> idx
mapel_hal = {}    # hal -> mapel
for i in range(len(doc)):
    txt = doc[i].get_text("text")
    if not txt.strip():
        continue
    m = RE_HAL.search(txt)
    if m:
        hal = int(m.group(1))
        hal_ke_pdf[hal] = i
        mm = RE_MAP.search(txt)
        if mm:
            mapel_hal[hal] = MAJEL.get(mm.group(1).strip())

hal_pertama = min(hal_ke_pdf)
pdf_toc_mulai = 1  # setelah sampul
pdf_toc_sampai = hal_ke_pdf[hal_pertama]  # TOC = halaman PDF sebelum halaman modul 1

# ---------- 2. Parse daftar isi dari halaman TOC ----------
entri = []  # (judul, hal, soal)
awalan = ""  # judul terpotong (baris bernomor tanpa 'Hal') jadi awalan entri berikutnya
for i in range(pdf_toc_mulai, pdf_toc_sampai):
    for raw in doc[i].get_text("text").splitlines():
        t = raw.replace("`", "").strip()
        m = RE_TOC.match(t)
        if m:
            judul = re.sub(r"^[\d\"“”]+\.?\s*", "", m.group(1))
            judul = re.sub(r"\.{3,}\s*$", "", judul).strip()
            if not judul:
                continue
            judul = (awalan + " " + judul).strip()
            awalan = ""
            soal = bool(re.search(r"\b(kaji ulang|pemantapan)\b", judul, re.I) or re.match(r"^soal", judul, re.I))
            entri.append([judul, int(m.group(2)), soal])
        elif re.match(r"^\d+\.\s", t) and not re.search(r"Hal\s*\d+", t):
            potong = re.sub(r"^\d+\.\s*", "", t).strip()
            if potong:
                awalan = (awalan + " " + potong).strip()
        elif entri and t and not re.match(r"^(Your Talent|-+$)", t) \
                and not re.match(r"^\d+\.\s", t) and not re.search(r"Hal\s*\d+", t):
            entri[-1][0] = (t + " " + entri[-1][0]).strip()

# buang duplikat berurutan (judul & hal sama)
toc = []
for e in entri:
    if toc and e[0] == toc[-1][0] and e[1] == toc[-1][1]:
        continue
    toc.append(e)

# ---------- 3. Bab = rentang halaman; render gambar ----------
LEBAR = 1100  # px
def render(hal, berkas):
    halaman = doc[hal_ke_pdf[hal]]
    zoom = LEBAR / halaman.rect.width
    pix = halaman.get_pixmap(matrix=pymupdf.Matrix(zoom, zoom))
    pix.save(berkas, jpg_quality=68)

data_mapel = []
jumlah_gambar = 0
dilewati = 0
daftar_bab = []  # (bab_id, judul, mapel, halaman_bab, teks)

def bersih_teks(halaman_bab):
    potong = []
    for h in halaman_bab:
        for baris in doc[hal_ke_pdf[h]].get_text("text").splitlines():
            t = re.sub(r"\s+", " ", baris).strip()
            if not t or "MODUL BELAJAR REGULER" in t or "BIMBEL TALENTA" in t or "Your Talent" in t:
                continue
            kotor = sum(1 for c in t if "\ue000" <= c <= "\uf8ff" or c == "�")
            if kotor > len(t) * 0.4:  # baris rumus font-encoded: buang
                continue
            potong.append(t)
    teks = " ".join(potong)
    return teks[:2200]

for k, (judul, hal0, soal) in enumerate(toc):
    if soal or hal0 not in hal_ke_pdf:
        continue
    hal_akhir = (toc[k + 1][1] - 1) if k + 1 < len(toc) else max(hal_ke_pdf)
    halaman_bab = [h for h in sorted(hal_ke_pdf) if hal0 <= h <= hal_akhir]
    teks = bersih_teks(halaman_bab)
    if len(re.sub(r"\s+", "", teks)) < 200:
        dilewati += 1
        continue
    mapel = next((mapel_hal[h] for h in halaman_bab if mapel_hal.get(h)), None)
    if not mapel:
        dilewati += 1
        continue
    m = next((x for x in data_mapel if x["nama"] == mapel), None)
    if not m:
        m = {"id": mapel.lower().replace(" ", "-"), "nama": mapel, "bab": []}
        data_mapel.append(m)
    bab_id = "%s-%03d" % (m["id"], len(m["bab"]) + 1)
    daftar_bab.append([bab_id, judul, mapel, halaman_bab, teks])
    m["bab"].append({"id": bab_id, "judul": judul, "img": []})  # img diisi saat render

if TEKS_MODE:
    for idx in range(MULAI, min(AKHIR + 1, len(daftar_bab))):
        bab_id, judul, mapel, halaman_bab, teks = daftar_bab[idx]
        print("===== %d | %s | %s | %s =====" % (idx, bab_id, mapel, judul))
        print(teks)
        print()
    sys.exit(0)

for bab_id, judul, mapel, halaman_bab, teks in daftar_bab:
    m = next((x for x in data_mapel if x["nama"] == mapel), None)
    img = []
    for n, h in enumerate(halaman_bab):
        nama = "%s-%02d.jpg" % (bab_id, n + 1)
        render(h, os.path.join(OUT_DIR, nama))
        img.append("/materi-ipa11/" + nama)
        jumlah_gambar += 1
    next(b for b in m["bab"] if b["id"] == bab_id)["img"] = img

data = {
    "judul": "Modul Reguler Kelas 11 IPA (Kurmer) — T.A. 2026/2027",
    "sumber": "Bimbel Talenta",
    "mapel": data_mapel,
}
with open(DATA_JS, "w", encoding="utf-8") as f:
    f.write("// Data Materi — dihasilkan oleh scripts/render-modul.py (jangan edit manual).\n")
    f.write("export default " + json.dumps(data, ensure_ascii=False) + ";\n")

jml_bab = sum(len(m["bab"]) for m in data_mapel)
ukuran = sum(os.path.getsize(os.path.join(OUT_DIR, b)) for b in os.listdir(OUT_DIR))
print("halaman modul: %d, entri TOC: %d" % (len(hal_ke_pdf), len(toc)))
for m in data_mapel:
    print("  %s: %d bab" % (m["nama"], len(m["bab"])))
print("bab: %d (dilewati %d), gambar: %d, total %.1f MB" % (jml_bab, dilewati, jumlah_gambar, ukuran / 1048576))
print("ditulis: web/data/materi-ipa11.js")
