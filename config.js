// Definisi tes. Angka durasi/jumlah soal/passing grade adalah perkiraan terdekat
// dengan format seleksi resmi — verifikasi ke pengumuman resmi tiap periode.
window.CONFIG = {
  tes: [
    {
      id: "akpol",
      nama: "Akpol — Tes Akademik",
      kelompok: "Polri",
      jenis: "Akademik",
      bank: "akpol",
      durasiMenit: 90,        // verifikasi ke pengumuman resmi
      jumlahSoal: 40,         // verifikasi ke pengumuman resmi
      komposisi: { "Matematika": 10, "Bahasa Indonesia": 10, "Bahasa Inggris": 10, "Pengetahuan Umum": 10 },
      passingGrade: 60,       // verifikasi ke pengumuman resmi (perkiraan)
      deskripsi: "Tes akademik seleksi Akademi Kepolisian: matematika dasar, bahasa Indonesia, bahasa Inggris, dan pengetahuan umum."
    },
    {
      id: "sipss",
      nama: "SIPSS — Tes Akademik",
      kelompok: "Polri",
      jenis: "Akademik",
      bank: "sipss",
      durasiMenit: 90,        // verifikasi ke pengumuman resmi
      jumlahSoal: 40,         // verifikasi ke pengumuman resmi
      komposisi: { "TIU Verbal": 10, "TIU Numerik": 10, "TIU Figural": 10, "Bahasa Inggris": 5, "Wawasan Kebangsaan": 5 },
      passingGrade: 60,       // verifikasi ke pengumuman resmi (perkiraan)
      deskripsi: "Tes akademik seleksi SIPSS: tes intelegensia umum (verbal, numerik, figural), bahasa Inggris, dan wawasan kebangsaan."
    },
    {
      id: "bintara",
      nama: "Bintara/Tamtama — Tes Akademik",
      kelompok: "Polri",
      jenis: "Akademik",
      bank: ["akpol", "sipss"],
      durasiMenit: 90,        // verifikasi ke pengumuman resmi
      jumlahSoal: 40,         // verifikasi ke pengumuman resmi
      komposisi: { "Matematika": 10, "Bahasa Indonesia": 10, "Pengetahuan Umum": 10, "Wawasan Kebangsaan": 10 },
      passingGrade: 60,       // verifikasi ke pengumuman resmi (perkiraan)
      deskripsi: "Tes akademik jalur Bintara/Tamtama: matematika dasar, bahasa Indonesia, pengetahuan umum, dan wawasan kebangsaan."
    },
    {
      id: "tiu",
      nama: "Polri — TIU (Tes Intelegensia Umum)",
      kelompok: "Polri",
      jenis: "Akademik",
      bank: "sipss",
      durasiMenit: 60,        // verifikasi ke pengumuman resmi
      jumlahSoal: 40,         // verifikasi ke pengumuman resmi
      komposisi: { "TIU Verbal": 10, "TIU Numerik": 10, "TIU Figural": 10, "Logika": 10 },
      passingGrade: 60,       // verifikasi ke pengumuman resmi (perkiraan)
      deskripsi: "Latihan khusus TIU: kemampuan verbal (sinonim, antonim, analogi), numerik (deret, hitungan), figural (pola gambar), dan penalaran logika."
    },
    {
      id: "matriks",
      nama: "Psikotes — Intelegensi (Matriks & Pola)",
      kelompok: "Polri",
      jenis: "Psikotes",
      bank: "polri-psiko",
      durasiMenit: 30,        // verifikasi ke pengumuman resmi
      jumlahSoal: 30,         // verifikasi ke pengumuman resmi
      komposisi: { "Matriks & Pola": 30 },
      passingGrade: 60,       // verifikasi ke pengumuman resmi (perkiraan)
      deskripsi: "Psikotes intelegensi bergaya Progressive Matrices: lengkapi pola dan matriks gambar. Hanya ketepatan jawaban yang dinilai."
    },
    {
      id: "kecermatan",
      nama: "Psikotes — Kecermatan",
      kelompok: "Polri",
      jenis: "Psikotes",
      bank: "polri-psiko",
      durasiMenit: 15,        // verifikasi ke pengumuman resmi
      jumlahSoal: 60,         // verifikasi ke pengumuman resmi
      komposisi: { "Karakter Hilang": 20, "Pasangan Sama": 20, "Satu Berbeda": 20 },
      passingGrade: 60,       // verifikasi ke pengumuman resmi (perkiraan)
      deskripsi: "Psikotes ketelitian dan kecepatan: karakter yang hilang, pasangan yang sama persis, dan baris yang berbeda. Versi pilihan ganda dari tes kecermatan."
    },
    {
      id: "kraepelin",
      nama: "Psikotes — Kraepelin/Pauli (hitung berderet)",
      kelompok: "Polri",
      jenis: "Psikotes",
      bank: "polri-psiko",
      durasiMenit: 10,        // verifikasi ke pengumuman resmi
      jumlahSoal: 30,         // verifikasi ke pengumuman resmi
      komposisi: { "Hitung Berderet": 30 },
      passingGrade: 60,       // verifikasi ke pengumuman resmi (perkiraan)
      deskripsi: "Latihan menjumlahkan angka berdekatan dan menulis angka satuan, versi pilihan ganda. Tes aslinya dinilai dari kecepatan, ketelitian, dan keajegan, yang tidak diukur di sini."
    },
    {
      id: "tkd",
      nama: "BUMN — TKD",
      kelompok: "BUMN",
      bank: "bumn-tkd",
      durasiMenit: 73,        // verifikasi ke pengumuman resmi (RBB 2025: 4 subtes @25 soal, 18+27+9+20 menit)
      jumlahSoal: 100,        // verifikasi ke pengumuman resmi
      komposisi: { "Verbal": 15, "Logika": 10, "Numerik": 25, "Klasifikasi Kata": 25, "Figural": 25 },
      passingGrade: 58,       // verifikasi ke pengumuman resmi (perkiraan, dilaporkan media)
      deskripsi: "Tes Kemampuan Dasar Rekrutmen Bersama BUMN, mengikuti empat subtes: Verbal Logical Reasoning (verbal + logika), Number Sequence (numerik), Word Classification (klasifikasi kata), dan Diagram Reasoning (figural)."
    },
    {
      id: "akhlak",
      nama: "BUMN — AKHLAK & Core Values",
      kelompok: "BUMN",
      bank: "bumn-akhlak",
      durasiMenit: 30,        // verifikasi ke pengumuman resmi (RBB 2025 dilaporkan 90 soal/30 menit)
      jumlahSoal: 90,         // verifikasi ke pengumuman resmi
      komposisi: { "Amanah": 15, "Kompeten": 15, "Harmonis": 15, "Loyal": 15, "Adaptif": 15, "Kolaboratif": 15 },
      passingGrade: 70,       // verifikasi ke pengumuman resmi (perkiraan)
      deskripsi: "Tes nilai dasar AKHLAK (Amanah, Kompeten, Harmonis, Loyal, Adaptif, Kolaboratif). Setiap opsi bernilai 1–5, bukan benar/salah."
    },
    {
      id: "twk",
      nama: "BUMN — Wawasan Kebangsaan",
      kelompok: "BUMN",
      bank: "bumn-wk",
      durasiMenit: 30,        // verifikasi ke pengumuman resmi
      jumlahSoal: 30,         // verifikasi ke pengumuman resmi
      komposisi: { "Wawasan Kebangsaan": 30 },
      passingGrade: 60,       // verifikasi ke pengumuman resmi (perkiraan)
      deskripsi: "Tes Wawasan Kebangsaan tahap 1 Rekrutmen Bersama BUMN: Pancasila, UUD 1945, NKRI, Bhinneka Tunggal Ika, sejarah, dan bela negara."
    },
    {
      id: "english",
      nama: "BUMN — Bahasa Inggris",
      kelompok: "BUMN",
      bank: "bumn-english",
      durasiMenit: 45,        // verifikasi ke pengumuman resmi
      jumlahSoal: 40,         // verifikasi ke pengumuman resmi
      komposisi: { "Reading": 15, "Grammar": 15, "Vocabulary": 10 },
      passingGrade: 60,       // verifikasi ke pengumuman resmi (perkiraan)
      deskripsi: "Tes Bahasa Inggris Rekrutmen Bersama BUMN: reading comprehension, grammar/structure, dan vocabulary."
    },
    {
      id: "bidang",
      nama: "BUMN — Tes Bidang: Akuntansi/Keuangan",
      kelompok: "BUMN",
      bank: "bumn-bidang",
      durasiMenit: 60,        // verifikasi ke pengumuman resmi
      jumlahSoal: 20,         // verifikasi ke pengumuman resmi
      komposisi: { "Akuntansi": 10, "Keuangan": 10 },
      passingGrade: 60,       // verifikasi ke pengumuman resmi (perkiraan)
      deskripsi: "Tes keahlian bidang jurusan Akuntansi/Keuangan: persamaan akuntansi, jurnal, laporan keuangan, bunga, dan analisis keuangan dasar."
    },
    {
      id: "bidang-if",
      nama: "BUMN — Tes Bidang: Informatika",
      kelompok: "BUMN",
      bank: "bumn-bidang",
      durasiMenit: 60,        // verifikasi ke pengumuman resmi
      jumlahSoal: 40,         // verifikasi ke pengumuman resmi
      komposisi: { "Pemrograman & Algoritma": 10, "Basis Data": 10, "Jaringan & Keamanan": 10, "Sistem Komputer": 10 },
      passingGrade: 60,       // verifikasi ke pengumuman resmi (perkiraan)
      deskripsi: "Tes keahlian bidang jurusan Informatika/TI: pemrograman dan algoritma, basis data, jaringan dan keamanan, serta sistem komputer."
    },
    {
      id: "skd",
      nama: "CPNS — SKD (TWK, TIU, TKP)",
      kelompok: "CPNS",
      jenis: "SKD",
      verifikasi: true,       // hanya soal berpenanda `verif` yang dipakai pada topik yang punya soal terverifikasi (TWK)
      bank: ["bumn-wk", "sipss", "cpns-tkp"],
      durasiMenit: 100,       // verifikasi ke pengumuman resmi
      jumlahSoal: 110,        // verifikasi ke pengumuman resmi (TWK 30, TIU 35, TKP 45)
      komposisi: { "Wawasan Kebangsaan": 30, "TIU Verbal": 10, "TIU Numerik": 15, "TIU Figural": 10, "TKP Pelayanan Publik": 8, "TKP Jejaring Kerja": 8, "TKP Sosial Budaya": 8, "TKP TIK": 7, "TKP Profesionalisme": 7, "TKP Anti Radikalisme": 7 },
      // Lulus hanya jika SEMUA subtes mencapai ambang (poin). TWK/TIU: 5 poin per jawaban benar; TKP: 1-5 per opsi.
      // Ambang CPNS reguler: TWK 65, TIU 80, TKP 166 (pola Kepmen PANRB 321/2024); keputusan CPNS 2026 belum terkonfirmasi, cek SSCASN/JDIH PANRB.
      // Angka ambang adalah perkiraan dari beberapa periode terakhir, cek pengumuman resmi tiap periode.
      subtes: [
        { nama: "TWK", topik: ["Wawasan Kebangsaan"], poinBenar: 5, ambang: 65 },
        { nama: "TIU", topik: ["TIU Verbal", "TIU Numerik", "TIU Figural"], poinBenar: 5, ambang: 80 },
        { nama: "TKP", topik: ["TKP Pelayanan Publik", "TKP Jejaring Kerja", "TKP Sosial Budaya", "TKP TIK", "TKP Profesionalisme", "TKP Anti Radikalisme"], poinBenar: 0, ambang: 166 }
      ],
      passingGrade: 57,       // = total ambang 311 dari 550 poin (perkiraan)
      deskripsi: "Seleksi Kompetensi Dasar CPNS/Kedinasan: Tes Wawasan Kebangsaan, Tes Intelegensia Umum, dan Tes Karakteristik Pribadi (skor 1–5 per opsi). Lulus bila setiap subtes mencapai ambang batas."
    },
    {
      id: "skd-kedinasan",
      nama: "Kedinasan — SKD (STAN, IPDN, dan sekolah kedinasan lain)",
      kelompok: "Kedinasan",
      jenis: "SKD",
      verifikasi: true,       // hanya soal berpenanda `verif` yang dipakai pada topik yang punya soal terverifikasi (TWK)
      bank: ["bumn-wk", "sipss", "cpns-tkp"],
      durasiMenit: 100,       // 110 soal / 100 menit (dilaporkan rctiplus.com, media 2026); verifikasi ke pengumuman resmi
      jumlahSoal: 110,        // TWK 30, TIU 35, TKP 45
      komposisi: { "Wawasan Kebangsaan": 30, "TIU Verbal": 10, "TIU Numerik": 15, "TIU Figural": 10, "TKP Pelayanan Publik": 8, "TKP Jejaring Kerja": 8, "TKP Sosial Budaya": 8, "TKP TIK": 7, "TKP Profesionalisme": 7, "TKP Anti Radikalisme": 7 },
      // Ambang SKD sekolah kedinasan 2026: TWK 65, TIU 80, TKP 156 (Kepmen PANRB 406/2026, berlaku 27 Juli 2026), sama pada dua laporan
      // media (blog.itera.ac.id, rctiplus.com). Dokumen asli: data-jdih.menpan.go.id/dokumen/2026kepmenpanrb406.pdf (belum terbaca langsung).
      // Jalur afirmasi punya ambang lain (total >= 281 dan TIU >= 55) dan tidak disimulasikan di sini.
      subtes: [
        { nama: "TWK", topik: ["Wawasan Kebangsaan"], poinBenar: 5, ambang: 65 },
        { nama: "TIU", topik: ["TIU Verbal", "TIU Numerik", "TIU Figural"], poinBenar: 5, ambang: 80 },
        { nama: "TKP", topik: ["TKP Pelayanan Publik", "TKP Jejaring Kerja", "TKP Sosial Budaya", "TKP TIK", "TKP Profesionalisme", "TKP Anti Radikalisme"], poinBenar: 0, ambang: 156 }
      ],
      passingGrade: 55,       // = total ambang 301 dari 550 poin
      deskripsi: "Seleksi Kompetensi Dasar sekolah kedinasan (TWK, TIU, TKP) dengan ambang batas kedinasan: TWK 65, TIU 80, TKP 156. Lulus bila setiap subtes mencapai ambang; lolos ambang belum menjamin lanjut karena ada perangkingan."
    },
    {
      id: "kedinasan-tpa",
      nama: "Kedinasan — Tes Potensi Akademik (latihan tahap lanjutan)",
      kelompok: "Kedinasan",
      jenis: "Tahap lanjutan",
      bank: ["sipss", "bumn-tkd"],
      durasiMenit: 60,        // PERKIRAAN: media melaporkan STAN 2026 memakai TPA dan Bahasa Inggris di tahap lanjutan, format resmi belum terkonfirmasi
      jumlahSoal: 50,         // PERKIRAAN, cek pengumuman resmi kampus
      komposisi: { "TIU Verbal": 15, "TIU Numerik": 15, "Logika": 10, "TIU Figural": 10 },
      passingGrade: 60,       // perkiraan
      deskripsi: "Latihan potensi akademik untuk tahap lanjutan sekolah kedinasan: verbal, numerik, logika, dan figural. Jumlah soal dan durasi hanya perkiraan; format resmi tiap kampus berbeda dan berubah tiap tahun."
    },
    {
      id: "kedinasan-bing",
      nama: "Kedinasan — Tes Bahasa Inggris (latihan tahap lanjutan)",
      kelompok: "Kedinasan",
      jenis: "Tahap lanjutan",
      bank: "bumn-english",
      durasiMenit: 45,        // PERKIRAAN, format resmi belum terkonfirmasi
      jumlahSoal: 40,         // PERKIRAAN
      komposisi: { "Reading": 15, "Grammar": 15, "Vocabulary": 10 },
      passingGrade: 60,       // perkiraan
      deskripsi: "Latihan bahasa Inggris (reading, grammar, vocabulary) untuk tahap lanjutan sekolah kedinasan. Jumlah soal dan durasi hanya perkiraan; cek pengumuman resmi."
    }
  ],
  // Topik "Belajar dari Nol" di luar tes: jalur fondasi sebelum topik SKD. Tiap topik punya generator di gen.js (soal membawa langkah).
  belajar: {
    fondasi: ["Dasar Operasi Hitung", "Dasar Pecahan", "Dasar Desimal dan Persen", "Dasar Perbandingan", "Dasar Aljabar", "Dasar Soal Cerita"]
  }
};

// Panduan tahapan per jalur (HTML sederhana).
window.PANDUAN = {
  polri: `
    <h2>Panduan Seleksi Polri (Akpol & SIPSS)</h2>
    <p>Alur di bawah adalah gambaran umum. Syarat, jadwal, dan urutan tahapan bisa berubah tiap periode — selalu cek pengumuman resmi di <b>polri.go.id</b> / <b>penerimaan.polri.go.id</b>.</p>
    <h3>1. Pendaftaran online</h3>
    <p>Isi data diri, unggah dokumen (KTP, ijazah, foto, dsb.), dan pilih formasi. Pastikan data sama persis dengan dokumen asli.</p>
    <h3>2. Seleksi administrasi</h3>
    <p>Kelengkapan dan keabsahan dokumen diverifikasi. Kekeliruan kecil bisa menggugurkan, jadi periksa berkas berulang kali.</p>
    <h3>3. Pemeriksaan kesehatan</h3>
    <p>Pemeriksaan dokter: mata, telinga, jantung, gigi, bebas narkoba, dsb. Persiapan: tidur cukup jauh-jauh hari, jangan begadang, jangan minum obat sembarangan.</p>
    <h3>4. Tes kesamaptaan jasmani</h3>
    <p>Biasanya lari, pull-up/chin-up, sit-up, push-up, dan renang (khusus Akpol). Latihan teratur bertahap 2–3 bulan sebelum tes. <i>Tahapan ini tidak bisa disimulasikan di aplikasi ini.</i></p>
    <h3>5. Tes psikologi</h3>
    <p>Biasanya terdiri atas beberapa bagian. Di aplikasi ini <b>tersedia latihan</b> untuk bagian yang punya jawaban benar/salah: <b>kecermatan</b> (karakter hilang, pasangan sama, satu berbeda), <b>Kraepelin/Pauli</b> (hitung berderet), dan <b>intelegensi</b> (matriks dan pola). Versi di sini berupa pilihan ganda; tes aslinya dinilai juga dari kecepatan, ketelitian, dan keajegan.</p>
    <p>Bagian kepribadian — <b>PAPI Kostick</b>, <b>EPPS</b>, tes grafis (menggambar orang/pohon), wartegg, dan wawancara psikolog — <b>tidak disimulasikan</b> karena tidak ada jawaban benar-salah dan skor palsu justru menyesatkan. Persiapannya: tidur cukup, jawab jujur dan konsisten, jangan berusaha "menebak" jawaban ideal, dan biasakan format soalnya.</p>
    <h3>6. Tes akademik</h3>
    <p>Ini yang bisa kamu latih di aplikasi ini. Akpol: Matematika, Bahasa Indonesia, Bahasa Inggris, Pengetahuan Umum. SIPSS: TIU (verbal, numerik, figural), Bahasa Inggris, Wawasan Kebangsaan. Kerjakan pakai mode Latihan dulu, lalu uji diri dengan mode Ujian.</p>
    <h3>7. Penelusuran mental kepribadian</h3>
    <p>Wawancara dan observasi kepribadian oleh psikolog. Bersikap tenang, jujur, dan konsisten dengan jawaban psikologi sebelumnya.</p>
    <h3>8. Pendidikan/pantukhir (pantauan terakhir)</h3>
    <p>Pemeriksaan akhir sebelum dinyatakan lulus seleksi. Tetap jaga kesehatan dan disiplin sampai akhir.</p>
    <p class="panduan-note">Syarat dan jadwal berubah tiap periode, cek pengumuman resmi (polri.go.id / penerimaan.polri.go.id).</p>
  `,
  bumn: `
    <h2>Panduan Rekrutmen Bersama BUMN</h2>
    <p>Alur di bawah adalah gambaran umum. Tahapan dan jadwal bisa berbeda tiap angkatan — selalu cek <b>rekrutmenbersama.bumn.go.id</b>.</p>
    <h3>1. Pendaftaran online</h3>
    <p>Daftar di portal Rekrutmen Bersama BUMN, lengkapi profil, unggah CV dan dokumen, lalu pilih posisi/jurusan yang sesuai latar belakangmu.</p>
    <h3>2. Tes Kemampuan Dasar (TKD)</h3>
    <p>Tes potensi akademik: verbal, numerik, logika/penalaran, figural. Polanya mirip TIU di tes CPNS. Latih pola deret, silogisme, analogi, dan hitungan dasar — semuanya bisa dilatih di aplikasi ini.</p>
    <h3>3. Tes AKHLAK (Core Values BUMN)</h3>
    <p>Tes situasional/harga diri seputar enam nilai: Amanah, Kompeten, Harmonis, Loyal, Adaptif, Kolaboratif. Tidak ada jawaban benar-salah; pilih respons yang paling mencerminkan nilai-nilai itu secara konsisten.</p>
    <h3>4. Tes Bahasa Inggris</h3>
    <p>Reading, grammar, dan vocabulary tingkat menengah. Biasanya berformat mirip TOEFL. Biasakan membaca teks singkat berbahasa Inggris setiap hari.</p>
    <h3>5. Tes Bidang (sesuai jurusan)</h3>
    <p>Menguji keahlian teknis sesuai posisi yang dilamar (akuntansi, teknik, IT, dsb.). Di aplikasi ini tersedia modul Akuntansi/Keuangan; modul jurusan lain menyusul.</p>
    <h3>6. Wawancara</h3>
    <p>Wawancara HR dan user. Persiapan: pahami posisi dan perusahaan, siapkan jawaban tentang diri sendiri, pengalaman, dan alasan melamar. Latih dengan simulasi bersama teman.</p>
    <p class="panduan-note">Syarat dan jadwal berubah tiap periode, cek pengumuman resmi (rekrutmenbersama.bumn.go.id).</p>
  `
};

window.BANK = window.BANK || {};
