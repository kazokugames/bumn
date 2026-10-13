# PROMPT UNTUK KIMI CODE

Salin semua isi di bawah garis ini ke Kimi Code.

---

Kamu adalah senior web developer sekaligus penyusun materi tes seleksi di Indonesia. Bangun **sistem simulasi tes (CAT) berbasis web** untuk persiapan seleksi **Polri (Akpol dan SIPSS)** dan **BUMN**, di folder kerja `D:\bumn`. Pengguna pemula: ia tidak tahu apa pun tentang tes ini dari awal sampai akhir, jadi sistem harus sekaligus menjadi panduan belajar.

## 1. Aturan teknis (wajib)
- **Vanilla HTML + CSS + JavaScript.** Dilarang memakai framework (React/Vue/dll), bundler, npm package, atau backend.
- Harus bisa jalan dengan **klik dua kali `index.html`** (protokol `file://`). Karena itu:
  - Jangan memakai `fetch()` atau `import` ES module untuk memuat data.
  - Bank soal berupa file `.js` biasa yang mengisi `window.BANK`, dimuat dengan tag `<script>` di `index.html`.
- Data riwayat disimpan di `localStorage` (bungkus dengan try/catch).
- Responsif, nyaman dibuka di HP (lebar 360px) dan desktop. Teks dalam **Bahasa Indonesia**.
- Kode sependek dan sesederhana mungkin. Jangan menambah abstraksi yang tidak diminta.

## 2. Struktur file
```
D:\bumn\
  index.html      # satu halaman, layar diganti lewat JS: beranda, panduan, ujian, hasil, riwayat
  style.css
  app.js          # state, timer, render, skor, riwayat
  config.js       # definisi tiap tes (lihat bagian 4)
  bank\
    akpol.js
    sipss.js
    bumn-tkd.js
    bumn-akhlak.js
    bumn-english.js
    bumn-bidang.js
  check.js        # skrip node untuk validasi bank soal
```

## 3. Format soal
Setiap bank mengisi `window.BANK["nama"] = [ ... ]`. Satu soal:
```js
{
  id: "tkd-num-001",          // unik di seluruh bank
  topik: "Numerik",           // harus ada di config.js
  q: "Teks soal...",          // boleh berisi HTML sederhana (tabel, <b>, <br>)
  opts: ["A", "B", "C", "D", "E"],   // minimal 4 opsi
  ans: 2,                     // indeks opsi benar (0-based)
  skor: [0, 0, 1, 0, 0],      // OPSIONAL: nilai per opsi (dipakai AKHLAK, skala 1-5). Jika tidak ada: benar=1, salah=0
  bahas: "Pembahasan langkah demi langkah..."
}
```
Untuk soal figural/pola gambar, gunakan **SVG inline** di dalam `q` atau di dalam opsi. Jangan memakai file gambar eksternal.

## 4. `config.js` – definisi tes
Setiap tes memiliki: `id`, `nama`, `kelompok` ("Polri" atau "BUMN"), `bank`, `durasiMenit`, `jumlahSoal`, `komposisi` (jumlah soal per topik), `passingGrade` (diberi label "perkiraan"), dan `deskripsi`.

Tes yang harus ada:

**Polri**
1. **Akpol – Tes Akademik**: topik Matematika, Bahasa Indonesia, Bahasa Inggris, Pengetahuan Umum/Wawasan Kebangsaan.
2. **SIPSS – Tes Akademik**: topik Tes Intelegensia Umum (verbal, numerik, figural), Bahasa Inggris, Wawasan Kebangsaan.

**BUMN**
3. **TKD (Tes Kemampuan Dasar)**: topik Verbal, Numerik, Logika/Penalaran, Figural.
4. **AKHLAK & Core Values**: soal situasional (Amanah, Kompeten, Harmonis, Loyal, Adaptif, Kolaboratif). Skor per opsi 1–5, bukan benar/salah.
5. **Bahasa Inggris**: Reading, Grammar/Structure, Vocabulary.
6. **Tes Bidang**: sediakan kerangka dan 1 contoh jurusan saja (misalnya Akuntansi/Keuangan). Kelak jurusan lain mudah ditambahkan di `bumn-bidang.js` dengan field `jurusan`. Tampilkan pemilih jurusan jika ada lebih dari satu.

Isi `durasiMenit`, `jumlahSoal`, dan `passingGrade` dengan angka yang paling mendekati format seleksi resmi menurut pengetahuanmu. Beri komentar `// verifikasi ke pengumuman resmi` di setiap angka yang tidak pasti.

## 5. Fitur aplikasi

### Beranda
Kartu tes dikelompokkan Polri dan BUMN. Setiap kartu memuat nama tes, durasi, jumlah soal, dan tombol **Mulai Ujian**, **Mode Latihan**, serta **Panduan**. Di bagian atas ada tautan **Riwayat** dan banner kecil berisi disclaimer (bagian 8).

### Panduan (untuk pemula, dari awal sampai akhir)
Satu layar per jalur yang menjelaskan:
- **Akpol dan SIPSS**: syarat umum, alur tahapan dari pendaftaran online, seleksi administrasi, pemeriksaan kesehatan, tes kesamaptaan jasmani, tes psikologi, tes akademik, penelusuran mental kepribadian, sampai pantukhir. Jelaskan apa yang diuji di tiap tahap dan tips persiapannya.
- **BUMN**: alur pendaftaran lewat portal Rekrutmen Bersama BUMN, TKD, AKHLAK, Bahasa Inggris, Tes Bidang, wawancara. Jelaskan apa yang diuji dan strategi belajarnya.
- Tes yang tidak bisa disimulasikan di aplikasi ini (psikologi, kesamaptaan jasmani, kesehatan) hanya dijelaskan dengan teks plus tips latihan. Jangan berpura-pura menyimulasikannya.
- Setiap panduan diakhiri pengingat: "Syarat dan jadwal berubah tiap periode, cek pengumuman resmi (polri.go.id / penerimaan.polri.go.id untuk Polri, rekrutmenbersama.bumn.go.id untuk BUMN)."

### Mode Ujian (terasa seperti tes asli)
- Timer mundur terlihat jelas di atas, berubah warna saat sisa waktu < 10%.
- Auto-submit saat waktu habis.
- Satu soal per layar, tombol Sebelumnya/Berikutnya, **navigator nomor soal** (grid) dengan warna: sudah dijawab, belum, ragu-ragu.
- Tombol **Ragu-ragu** per soal.
- **Tidak ada umpan balik** benar/salah selama ujian berjalan.
- Dialog konfirmasi sebelum selesai yang menampilkan jumlah soal belum dijawab dan ragu-ragu.
- Peringatan `beforeunload` agar tidak keluar tanpa sengaja.
- Soal dipilih **acak** dari bank sesuai `komposisi`; urutan opsi boleh diacak (jaga `ans`/`skor` tetap benar). Jika bank kurang dari yang diminta, pakai semua soal yang ada dan tampilkan catatan.

### Mode Latihan (untuk belajar)
Tanpa batas waktu ketat. Setelah memilih jawaban, tampil langsung benar/salah, kunci, dan pembahasan. Ada filter per topik supaya pengguna bisa melatih topik lemahnya.

### Hasil
- Skor total dan skor per topik (tabel + bar sederhana dari CSS, tanpa library chart).
- Status "Di atas / di bawah passing grade (perkiraan)".
- Daftar topik terlemah beserta saran: topik apa yang harus dipelajari dulu.
- **Review** semua soal: jawaban pengguna, kunci, dan pembahasan; bisa difilter salah saja.

### Riwayat
Daftar percobaan (tanggal, tes, skor, durasi pakai) dan tren skor per topik dari `localStorage`. Tombol hapus riwayat dengan konfirmasi.

## 6. Perhitungan skor
- Pilihan ganda: benar = 1, salah/kosong = 0 (tidak ada pengurangan).
- Jika soal punya `skor[]`: ambil `skor[opsi yang dipilih]`; kosong = 0. Skor total AKHLAK = jumlah nilai.
- Persentase = skor ÷ skor maksimum × 100. Skor maksimum untuk soal ber-`skor[]` adalah nilai tertinggi di array tersebut.
- Tulis fungsi hitung skor sebagai fungsi murni yang mudah diuji.

## 7. Isi bank soal (kerjakan setelah mesin tes jalan)
Tulis **minimal 40 soal per bank** (Tes Bidang cukup 20 untuk satu jurusan), dengan rincian wajar per topik. Syarat kualitas:
- Soal mengikuti **pola dan tingkat kesulitan** seleksi 2021–2026: TKD/TIU (deret angka, aritmetika sosial, perbandingan, silogisme, analogi verbal, sinonim/antonim, pola gambar, penalaran analitis), AKHLAK situasional, TOEFL-style reading/grammar, matematika dasar SMA dan bahasa Indonesia (EYD/PUEBI, kalimat efektif, paragraf) untuk Akpol, wawasan kebangsaan (Pancasila, UUD 1945, NKRI, Bhinneka Tunggal Ika, sejarah Indonesia).
- **Setiap soal punya pembahasan** yang benar dan jelas. Soal hitungan wajib ditulis langkah-langkahnya.
- Kunci jawaban **harus benar**. Hitung ulang setiap soal numerik sebelum menulisnya. Jangan membuat soal yang ambigu.
- Variasikan tingkat kesulitan: mudah, sedang, sulit.
- **Soal ditulis sendiri (orisinal).** Jangan menyalin soal dari buku, situs, atau bimbel. Pola dan topik boleh mengikuti kisi-kisi resmi.
- Tag `id` berformat konsisten (`tkd-ver-001`, `akhlak-amanah-003`, dst).

Jika kamu punya akses web, kamu boleh membaca kisi-kisi dan format resmi terbaru sebagai acuan pola dan angka di `config.js`, tetapi tetap tulis soalnya sendiri.

## 8. Disclaimer yang wajib tampil di UI
Tampilkan di beranda dan di layar hasil:
> "Soal di aplikasi ini adalah soal latihan buatan sendiri yang mengikuti pola dan kisi-kisi seleksi 2021–2026. Ini **bukan** soal asli resmi. Passing grade, durasi, dan tahapan hanyalah perkiraan. Selalu cek pengumuman resmi tiap periode."

## 9. `check.js` (validasi)
Skrip Node yang membaca semua file di `bank\` (jalankan isinya dengan `vm` atau `eval` pada objek `window` tiruan), lalu memastikan:
- `id` unik di seluruh bank,
- `opts.length >= 4`,
- `ans` berada dalam rentang `opts`,
- jika ada `skor`, panjangnya sama dengan `opts`,
- `topik` ada di `config.js` untuk tes yang memakai bank itu,
- `bahas` tidak kosong.

Cetak ringkasan jumlah soal per bank dan per topik. Keluar dengan kode 1 jika ada error.

## 10. Urutan pengerjaan
1. Kerangka: `index.html`, `style.css`, `app.js`, `config.js`, dan 5 soal contoh. Pastikan alur beranda → ujian → hasil → riwayat jalan.
2. `check.js`.
3. Bank soal BUMN TKD.
4. Bank AKHLAK, English, Akpol, SIPSS, lalu Tes Bidang.
5. Panduan tahapan.
6. Uji sendiri (bagian 11) dan perbaiki.

Setelah tiap langkah, jalankan `node check.js`. Jangan lanjut kalau gagal.

## 11. Kriteria selesai (uji sebelum bilang selesai)
- `node D:\bumn\check.js` lolos tanpa error.
- Satu ujian penuh jalan di browser: timer berkurang, auto-submit saat waktu habis, navigator dan tombol ragu-ragu bekerja.
- Hitung manual skor untuk 3 jawaban uji (benar, salah, kosong) dan cocokkan dengan hasil aplikasi, termasuk satu soal AKHLAK ber-`skor[]`.
- Riwayat tetap ada setelah halaman di-refresh.
- Tampilan tidak pecah di lebar 360px.
- Tidak ada error di console browser.

## 12. Format laporan akhir
Laporkan singkat: file apa saja yang dibuat, jumlah soal per bank, cara membuka aplikasi, hasil uji di bagian 11 (jujur, termasuk yang gagal), dan daftar angka di `config.js` yang masih perlu diverifikasi ke pengumuman resmi.
