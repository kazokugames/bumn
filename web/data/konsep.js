// Kartu konsep Mode Belajar: ringkasan, uraian bertahap, kesalahan umum, tips, dan contoh per topik.
// Isi statis buatan sendiri (dirender sebagai HTML tepercaya, bukan dari server atau pengguna).
// `prasyarat` = topik yang disarankan dikuasai lebih dulu (saran, bukan penghalang).
const SEMUA_FONDASI = ["Dasar Operasi Hitung", "Dasar Pecahan", "Dasar Desimal dan Persen", "Dasar Perbandingan", "Dasar Aljabar", "Dasar Soal Cerita"];

// Struktur TKP yang sama untuk keenam aspek: cara skor bekerja + prinsip khas aspeknya.
const tkp = (ringkas, prinsip, tinggi, rendah, contoh) => ({
  prasyarat: [],
  ringkas,
  uraian: [
    { judul: "Cara skor TKP bekerja", isi: "<p>Di TKP tidak ada jawaban benar atau salah. Setiap opsi bernilai <b>1 sampai 5</b>, dan kamu mendapat nilai dari opsi yang kamu pilih. Jadi tujuannya bukan menebak satu jawaban, melainkan memilih tindakan <b>paling tepat menurut nilai pelayanan dan etika aparatur</b>. Dua opsi bisa sama-sama baik: yang paling aktif, solutif, dan sesuai aturan mendapat 5, yang baik tetapi kurang tuntas mendapat 4.</p>" },
    { judul: "Prinsip khusus aspek ini", isi: "<ul>" + prinsip.map((p) => "<li>" + p + "</li>").join("") + "</ul>" },
    { judul: "Ciri opsi bernilai tinggi dan rendah", isi: "<p><b>Cenderung bernilai tinggi:</b> " + tinggi + "<br /><b>Cenderung bernilai rendah:</b> " + rendah + "</p>" },
    { judul: "Cara memilih opsi", isi: "<p><b>Langkah 1:</b> baca situasinya sampai habis dan tentukan siapa yang dirugikan atau butuh bantuan. <b>Langkah 2:</b> coret opsi yang melanggar aturan, emosional, atau menyalahkan orang lain (nilai terendah). <b>Langkah 3:</b> di antara sisanya, pilih yang <b>bertindak langsung, menyelesaikan masalah sampai tuntas, dan tetap sopan</b>. Opsi yang hanya menunggu, menunda, atau menyerahkan ke orang lain biasanya bernilai menengah.</p>" },
  ],
  tinggi, rendah,
  kesalahan: [
    "Memilih opsi yang paling <b>keras atau paling panjang</b> karena dikira paling tegas; sering opsi tegas yang marah justru bernilai rendah.",
    "Memilih opsi <b>pasif</b> (&quot;diam saja agar aman&quot;) karena terasa aman; sikap pasif jarang bernilai 5.",
    "Menjawab sebagai <b>diri sendiri yang sedang lelah</b>, bukan sebagai aparatur yang ideal; TKP menilai sikap yang diharapkan.",
  ],
  tips: [
    "Latih berpikir dengan urutan: <b>aturan, sopan santun, tuntas</b>.",
    "Baca pembahasan setiap soal: nilai belajar TKP ada pada alasan di balik skor, bukan hanya pada skor akhir.",
    "Jangan menghabiskan lebih dari satu menit per soal TKP; keputusan terbaik biasanya terlihat setelah mencoret opsi terburuk.",
  ],
  contoh,
});

const KONSEP = {
  // ================= FONDASI =================
  "Dasar Operasi Hitung": {
    prasyarat: [],
    ringkas: "Inilah dasar dari semua soal hitungan: menjumlah, mengurang, mengali, membagi, dan mengerjakan campurannya dengan urutan yang benar. Kalau bagian ini kuat, soal numerik SKD terasa jauh lebih ringan.",
    uraian: [
      { judul: "Memecah bilangan agar mudah dihitung", isi: "<p>Jangan menghitung bilangan besar sekaligus. <b>Pecah</b> menjadi bagian yang mudah. Contoh: 347 + 285. Jumlahkan ratusannya dulu (300 + 200 = 500), lalu sisanya (47 + 85 = 132), lalu gabungkan: 500 + 132 = 632. Cara yang sama berlaku untuk pengurangan dan perkalian.</p>" },
      { judul: "Perkalian dengan memecah", isi: "<p>Untuk 47 × 6, pecah 47 menjadi 40 + 7. Kalikan masing-masing: 40 × 6 = 240 dan 7 × 6 = 42. Jumlahkan: 240 + 42 = 282. Untuk perkalian dua angka seperti 23 × 14, pecah angka kedua: 23 × 10 = 230 dan 23 × 4 = 92, lalu 230 + 92 = 322.</p>" },
      { judul: "Pembagian adalah kebalikan perkalian", isi: "<p>Untuk 156 ÷ 6, tanyakan: &quot;6 dikali berapa hasilnya 156?&quot; Coba 20 (6 × 20 = 120). Sisanya 36, dan 6 × 6 = 36. Jadi 20 + 6 = 26. Sisa pembagian adalah selisih antara bilangan dan kelipatan terbesar yang tidak melewatinya.</p>" },
      { judul: "Urutan operasi", isi: "<p>Aturannya: <b>1) kurung, 2) pangkat dan akar, 3) kali dan bagi (dari kiri), 4) tambah dan kurang (dari kiri)</b>. Contoh: 8 + 3 × 5 − 4. Kali dulu: 3 × 5 = 15. Lalu 8 + 15 − 4 = 19. Kalau kamu menghitung dari kiri ke kanan tanpa aturan, hasilnya (55) salah.</p>" },
      { judul: "Bilangan negatif", isi: "<p>Mengurangi bilangan yang lebih besar menghasilkan bilangan negatif: 7 − 20 = −13 (selisihnya 13, tetapi arahnya ke bawah nol). Menambah bilangan negatif sama dengan mengurangi: 10 + (−4) = 6.</p>" },
    ],
    kesalahan: [
      "Menghitung dari kiri ke kanan tanpa memperhatikan <b>kali dulu, baru tambah</b>.",
      "Lupa <b>membawa angka</b> (menyimpan) saat menjumlah bersusun.",
      "Salah menaruh <b>tanda negatif</b> saat mengurangi bilangan yang lebih besar.",
      "Menghitung terlalu cepat tanpa mengecek: hasil yang aneh (mis. lebih kecil dari salah satu bilangan saat menjumlah) menandakan salah.",
    ],
    tips: [
      "Estimasi dulu: 398 + 502 kira-kira 400 + 500 = 900, jadi jawaban harus dekat 900.",
      "Hafalkan perkalian 1–10 sampai otomatis; ini mempercepat semua soal lain.",
      "Latih dengan soal pendek setiap hari; 10 soal tiap hari lebih ampuh daripada 100 soal sekali seminggu.",
    ],
    contoh: [
      { q: "Hasil dari 347 + 285", a: "632", bahas: "Ratusan: 300 + 200 = 500. Sisanya: 47 + 85 = 132. Gabungkan: 500 + 132 = 632." },
      { q: "Hasil dari 8 + 3 × 5 − 4", a: "19", bahas: "Kali dulu: 3 × 5 = 15. Lalu 8 + 15 = 23, dan 23 − 4 = 19." },
      { q: "Sisa pembagian 47 oleh 6", a: "5", bahas: "6 × 7 = 42 (kelipatan terbesar yang tidak melebihi 47). Sisa = 47 − 42 = 5." },
    ],
  },

  "Dasar Pecahan": {
    prasyarat: ["Dasar Operasi Hitung"],
    ringkas: "Pecahan menyatakan bagian dari keseluruhan. Hampir semua soal persen, perbandingan, dan soal cerita bertumpu pada kemampuan mengolah pecahan.",
    uraian: [
      { judul: "Apa arti pecahan", isi: "<p>Pecahan 3/4 berarti sesuatu dibagi menjadi 4 bagian sama besar, dan diambil 3 bagian. Angka atas disebut <b>pembilang</b>, angka bawah <b>penyebut</b>. Pecahan juga berarti pembagian: 3/4 = 3 ÷ 4.</p>" },
      { judul: "Menyederhanakan", isi: "<p>Bagi pembilang dan penyebut dengan bilangan yang sama (faktor persekutuan terbesar). Contoh: 18/24. Keduanya habis dibagi 6, jadi 18 ÷ 6 = 3 dan 24 ÷ 6 = 4, hasil 3/4. Pecahan sederhana adalah yang tidak bisa dibagi lagi.</p>" },
      { judul: "Menjumlah dan mengurang", isi: "<p>Kalau penyebut sama, langsung jumlahkan pembilang: 2/9 + 4/9 = 6/9 = 2/3. Kalau penyebut berbeda, <b>samakan</b> dulu dengan kelipatan persekutuan terkecil (KPK). Contoh: 1/4 + 1/6. KPK(4, 6) = 12, jadi 1/4 = 3/12 dan 1/6 = 2/12, hasil 5/12.</p>" },
      { judul: "Mengali dan membagi", isi: "<p><b>Kali:</b> pembilang dikali pembilang, penyebut dikali penyebut: 2/3 × 3/5 = 6/15 = 2/5. <b>Bagi:</b> kalikan dengan kebalikan pembagi: 3/4 ÷ 1/2 = 3/4 × 2/1 = 6/4 = 3/2.</p>" },
      { judul: "Pecahan campuran", isi: "<p>3 2/5 berarti 3 utuh dan 2/5. Ubah ke pecahan biasa: (3 × 5) + 2 = 17, jadi 17/5. Kebalikannya: 17 ÷ 5 = 3 sisa 2, jadi 3 2/5.</p>" },
    ],
    kesalahan: [
      "Menjumlah pembilang <b>dan</b> penyebut (1/4 + 1/6 = 2/10 itu salah).",
      "Lupa menyamakan penyebut sebelum menjumlah atau mengurang.",
      "Membalik <b>pecahan yang salah</b> saat membagi (yang dibalik adalah pembagi, pecahan kedua).",
      "Tidak menyederhanakan hasil akhir sehingga jawaban tidak cocok dengan opsi.",
    ],
    tips: [
      "Untuk membandingkan pecahan, samakan penyebutnya lalu bandingkan pembilang.",
      "Selalu sederhanakan hasil akhir; opsi jawaban hampir selalu dalam bentuk paling sederhana.",
      "Ingat pecahan sebagai pembagian: 3/4 dari 40 = 40 ÷ 4 × 3 = 30.",
    ],
    contoh: [
      { q: "Sederhanakan 18/24", a: "3/4", bahas: "Faktor terbesar yang membagi 18 dan 24 adalah 6. 18 ÷ 6 = 3 dan 24 ÷ 6 = 4." },
      { q: "Hasil dari 1/4 + 1/6", a: "5/12", bahas: "KPK(4, 6) = 12. 1/4 = 3/12 dan 1/6 = 2/12. Jumlah = 5/12." },
      { q: "Hasil dari 3/4 ÷ 1/2", a: "3/2 (atau 1 1/2)", bahas: "3/4 ÷ 1/2 = 3/4 × 2/1 = 6/4 = 3/2." },
    ],
  },

  "Dasar Desimal dan Persen": {
    prasyarat: ["Dasar Pecahan"],
    ringkas: "Desimal, pecahan, dan persen adalah tiga cara menulis bilangan yang sama. Menguasai perpindahan di antara ketiganya membuat soal diskon, bunga, dan kenaikan menjadi mudah.",
    uraian: [
      { judul: "Persen artinya per seratus", isi: "<p>35% berarti 35/100 = 0,35. Dari desimal ke persen: kalikan 100. Dari persen ke desimal: bagi 100. Contoh: 0,6 = 60% dan 8% = 0,08.</p>" },
      { judul: "Pecahan dan persen", isi: "<p>Ubah pecahan ke persen dengan kalikan 100. 1/4 = 25%, 1/2 = 50%, 3/4 = 75%, 1/5 = 20%, 1/10 = 10%. Hafalkan beberapa pecahan umum: ini mempercepat banyak soal.</p>" },
      { judul: "Persen dari suatu bilangan", isi: "<p>x% dari N = x/100 × N. Contoh: 15% dari 240. 10% dari 240 = 24, 5% dari 240 = 12, jadi 15% = 24 + 12 = 36. Memecah persen (10% dan 5%) sering lebih cepat daripada rumus.</p>" },
      { judul: "Diskon dan kenaikan", isi: "<p>Diskon 20% dari Rp50.000: potongan = 20% × 50.000 = 10.000, harga bayar = 40.000. Kenaikan 20%: harga baru = 100% + 20% = 120% dari harga lama. Kenaikan dan penurunan selalu dihitung dari <b>nilai awalnya</b>.</p>" },
      { judul: "Berapa persen", isi: "<p>Persen = bagian ÷ keseluruhan × 100%. Contoh: 15 dari 60 adalah 15/60 = 1/4 = 25%.</p>" },
    ],
    kesalahan: [
      "Menghitung diskon dari harga yang <b>sudah didiskon</b> atau dari harga yang salah.",
      "Salah menaruh koma saat mengubah persen ke desimal (8% = 0,08, bukan 0,8).",
      "Menganggap naik 20% lalu turun 20% kembali ke harga semula (hasilnya lebih rendah).",
    ],
    tips: [
      "Mulai dari 10% (geser koma satu tempat), lalu kombinasikan: 30% = 3 × 10%, 5% = setengah dari 10%.",
      "Jika opsi jawaban berdekatan, jangan estimasi kasar; hitung tepat.",
      "Hafalkan: 1/8 = 12,5%, 1/3 ≈ 33,3%, 2/3 ≈ 66,7%.",
    ],
    contoh: [
      { q: "15% dari 240", a: "36", bahas: "10% = 24 dan 5% = 12. Jadi 15% = 24 + 12 = 36." },
      { q: "Baju Rp80.000 didiskon 25%. Berapa yang dibayar?", a: "Rp60.000", bahas: "Potongan = 25% × 80.000 = 20.000. Bayar = 80.000 − 20.000 = 60.000." },
      { q: "Pecahan 3/8 dalam persen", a: "37,5%", bahas: "3 ÷ 8 = 0,375, lalu × 100 = 37,5%." },
    ],
  },

  "Dasar Perbandingan": {
    prasyarat: ["Dasar Operasi Hitung", "Dasar Pecahan"],
    ringkas: "Perbandingan membandingkan dua besaran. Soal skala peta, resep, pembagian uang, dan kecepatan semuanya memakai ide yang sama.",
    uraian: [
      { judul: "Menyederhanakan perbandingan", isi: "<p>Perbandingan 24 : 36 sama dengan 2 : 3 setelah kedua bilangan dibagi 12. Aturannya sama seperti pecahan.</p>" },
      { judul: "Senilai (makin banyak, makin banyak)", isi: "<p>Cari <b>nilai satuan</b> dulu. Jika 5 buku harganya Rp40.000, satu buku Rp8.000, jadi 8 buku = 8 × 8.000 = Rp64.000. Satuan membuat soal senilai selalu jelas.</p>" },
      { judul: "Berbalik nilai (makin banyak, makin sedikit)", isi: "<p>Contoh pekerja dan hari. 6 pekerja selesai dalam 10 hari berarti total pekerjaan 60 pekerja-hari. Jika pekerjanya 12 orang, harinya 60 ÷ 12 = 5 hari. Hasil kali dua besaran itu tetap.</p>" },
      { judul: "Membagi menurut perbandingan", isi: "<p>Uang Rp350.000 dibagi 3 : 4. Jumlah bagian = 7. Satu bagian = 350.000 ÷ 7 = 50.000. Bagian pertama 150.000 dan kedua 200.000. Pastikan jumlahnya kembali ke total.</p>" },
      { judul: "Skala peta", isi: "<p>Skala 1 : 500.000 berarti 1 cm di peta = 500.000 cm = 5 km sebenarnya. Jarak di peta 6 cm menjadi 6 × 5 = 30 km.</p>" },
    ],
    kesalahan: [
      "Memakai perbandingan <b>senilai</b> untuk soal yang sebenarnya <b>berbalik nilai</b>.",
      "Lupa mengubah <b>satuan</b> (cm ke km) pada soal skala.",
      "Membagi total dengan angka perbandingan yang salah (harus dengan <b>jumlah</b> bagian).",
    ],
    tips: [
      "Tanyakan: kalau satu besaran naik, apakah yang lain naik (senilai) atau turun (berbalik)?",
      "Selalu cari nilai satu bagian atau satu satuan.",
      "Cek hasil: jumlah semua bagian harus sama dengan total.",
    ],
    contoh: [
      { q: "6 pekerja menyelesaikan proyek dalam 10 hari. Jika 12 pekerja, berapa hari?", a: "5 hari", bahas: "Berbalik nilai: 6 × 10 = 60 pekerja-hari. 60 ÷ 12 = 5 hari." },
      { q: "Rp350.000 dibagi dengan perbandingan 3 : 4. Bagian yang lebih besar?", a: "Rp200.000", bahas: "Jumlah bagian 7. Satu bagian 50.000. Bagian besar = 4 × 50.000 = 200.000." },
    ],
  },

  "Dasar Aljabar": {
    prasyarat: ["Dasar Operasi Hitung"],
    ringkas: "Aljabar memakai huruf (misalnya x) untuk bilangan yang belum diketahui. Tujuannya mencari nilai x dengan menjaga persamaan tetap seimbang seperti timbangan.",
    uraian: [
      { judul: "Persamaan seperti timbangan", isi: "<p>Apa pun yang kamu lakukan di satu ruas harus kamu lakukan juga di ruas lain. Untuk x + 7 = 15, kurangi 7 di kedua ruas: x = 8.</p>" },
      { judul: "Persamaan satu dan dua langkah", isi: "<p>Untuk 3x + 5 = 20: kurangi 5 (3x = 15), lalu bagi 3 (x = 5). Urutannya: <b>hilangkan yang ditambah atau dikurang dulu, baru hilangkan pengali</b>.</p>" },
      { judul: "Suku sejenis", isi: "<p>Kamu hanya boleh menjumlah suku yang sejenis: 3x + 2x = 5x, tetapi 3x + 2 tetap 3x + 2.</p>" },
      { judul: "Substitusi", isi: "<p>Mengganti huruf dengan angka: jika x = 4, maka 3x + 2 = 3 × 4 + 2 = 14.</p>" },
      { judul: "Dari kalimat ke persamaan", isi: "<p>&quot;Tiga kali suatu bilangan ditambah 5 sama dengan 29&quot; ditulis 3x + 5 = 29. Selesaikan: 3x = 24 dan x = 8. Menerjemahkan kalimat ke bentuk aljabar adalah keterampilan penting di soal cerita.</p>" },
    ],
    kesalahan: [
      "Hanya mengubah <b>satu ruas</b> persamaan.",
      "Salah tanda saat memindah suku ke ruas lain (yang pindah berubah tanda).",
      "Menjumlah suku yang <b>tidak sejenis</b>.",
    ],
    tips: [
      "Selalu uji jawaban dengan memasukkannya kembali ke soal.",
      "Tulis setiap langkah; jangan menghitung di kepala untuk persamaan dua langkah.",
      "Kalau ada x di dua ruas, kumpulkan semua x ke satu ruas dulu.",
    ],
    contoh: [
      { q: "Jika 3x + 5 = 20, nilai x", a: "5", bahas: "3x = 20 − 5 = 15. x = 15 ÷ 3 = 5." },
      { q: "Jika 5x + 4 = 2x + 19, nilai x", a: "5", bahas: "5x − 2x = 19 − 4. 3x = 15. x = 5." },
    ],
  },

  "Dasar Soal Cerita": {
    prasyarat: ["Dasar Operasi Hitung", "Dasar Pecahan", "Dasar Desimal dan Persen"],
    ringkas: "Soal cerita menyembunyikan hitungan di dalam kalimat. Kuncinya bukan hitungan yang sulit, melainkan menerjemahkan cerita menjadi langkah hitung yang tepat.",
    uraian: [
      { judul: "Empat langkah baku", isi: "<p><b>1) Baca dua kali</b> sampai paham apa yang ditanyakan. <b>2) Tandai</b> angka yang diketahui beserta satuannya. <b>3) Pilih operasi</b> dengan kata kunci. <b>4) Hitung dan cek</b> apakah jawabannya masuk akal.</p>" },
      { judul: "Kata kunci operasi", isi: "<ul><li>Total, jumlah, seluruhnya, bersama: <b>tambah</b>.</li><li>Sisa, selisih, kembalian, tinggal: <b>kurang</b>.</li><li>Setiap, masing-masing, per, kali lipat: <b>kali</b>.</li><li>Dibagi rata, tiap kelompok, berapa kali muat: <b>bagi</b>.</li></ul>" },
      { judul: "Rata-rata", isi: "<p>Rata-rata = jumlah nilai ÷ banyak nilai. Untuk mencari nilai yang kurang: jumlah yang dibutuhkan = rata-rata target × banyak data, lalu kurangi jumlah yang sudah ada.</p>" },
      { judul: "Jarak, kecepatan, waktu", isi: "<p>Jarak = kecepatan × waktu. Samakan satuannya: 90 km/jam selama 2,5 jam menempuh 90 × 2,5 = 225 km.</p>" },
      { judul: "Soal umur", isi: "<p>Misalkan umur anak = a. Jika umur ayah 4 kali umur anak dan jumlahnya 50, maka a + 4a = 50, 5a = 50, a = 10, ayah 40. Mulailah dengan memisalkan yang paling kecil.</p>" },
    ],
    kesalahan: [
      "Langsung menghitung tanpa menentukan apa yang ditanyakan.",
      "Mengabaikan <b>satuan</b> (menit dengan jam, meter dengan kilometer).",
      "Tidak membulatkan ke atas saat jawaban harus mencukupi (mis. berapa minggu agar uang cukup).",
    ],
    tips: [
      "Tulis ulang soal dalam satu kalimat pendek: &quot;Aku mencari ...&quot;.",
      "Gambar sketsa kecil (garis atau kotak) untuk soal jarak dan bagian.",
      "Cek akhir: apakah hasilnya masuk akal? Umur ayah 4 tahun jelas salah.",
    ],
    contoh: [
      { q: "Nilai 4 ujian: 70, 80, 90, 80. Agar rata-rata 5 ujian menjadi 82, nilai ujian kelima?", a: "90", bahas: "Jumlah dibutuhkan = 5 × 82 = 410. Jumlah sekarang = 320. Nilai kelima = 410 − 320 = 90." },
      { q: "Umur ayah 4 kali umur anak, jumlah umur 50. Umur ayah?", a: "40", bahas: "a + 4a = 50, a = 10, ayah = 4 × 10 = 40." },
    ],
  },

  // ================= SKD =================
  "TIU Numerik": {
    prasyarat: SEMUA_FONDASI,
    ringkas: "Numerik SKD menguji berhitung cepat dan tepat: deret angka, persen, perbandingan, kecepatan, pekerjaan bersama, dan soal cerita. Kuncinya bukan rumus yang banyak, tetapi mengenali <b>jenis soalnya</b> dalam 5 detik pertama.",
    uraian: [
      { judul: "Deret angka", isi: "<p>Hitung selisih antar suku. Jika tetap, itu deret aritmetika (3, 7, 11, 15: selisih 4). Jika selisihnya naik teratur (2, 3, 5, 8, 12: selisih 1, 2, 3, 4), cari pola selisih. Jika tiap suku dikali bilangan yang sama (2, 6, 18, 54: ×3), itu deret geometri. Untuk deret huruf, ubah huruf ke nomor alfabet (A = 1).</p>" },
      { judul: "Soal cerita khas SKD", isi: "<p>Soal kecepatan, pekerjaan bersama, untung rugi, dan umur diselesaikan dengan langkah seperti di topik fondasi. Perbedaannya ada pada angka yang lebih besar dan waktu yang lebih sempit (±1 menit per soal). Karena itu kuasai fondasi dulu, lalu latih kecepatan.</p>" },
      { judul: "KPK dan FPB", isi: "<p>KPK dipakai untuk kejadian yang berulang bersamaan (lampu menyala tiap 8 dan 12 detik: bersamaan lagi setelah KPK = 24 detik). FPB dipakai untuk membagi sama rata tanpa sisa (tali 36 m dan 48 m dipotong sama panjang terpanjang: FPB = 12 m).</p>" },
      { judul: "Mengatur waktu", isi: "<p>Dalam ujian, kerjakan soal yang kamu yakin cepat dulu dan tandai yang butuh waktu. Jangan terjebak lebih dari 1,5 menit pada satu soal.</p>" },
    ],
    langkah: [
      "<b>Deret:</b> hitung selisih antar suku. Kalau selisihnya tidak tetap, coba selisih dari selisih, atau cek apakah tiap suku dikali bilangan yang sama.",
      "<b>Persen:</b> x% dari y = x/100 × y. Diskon atau kenaikan selalu dihitung dari nilai <i>awal</i>.",
      "<b>Kecepatan:</b> jarak = kecepatan × waktu. Samakan satuan dulu.",
      "<b>Perbandingan:</b> senilai pakai nilai satuan; berbalik nilai pakai hasil kali tetap.",
      "<b>Pekerjaan bersama:</b> kecepatan kerja = 1/waktu. Bekerja bersama = jumlah kecepatan kerja.",
    ],
    kesalahan: [
      "Menghitung dari kiri ke kanan tanpa memperhatikan <b>urutan operasi</b>.",
      "Mengabaikan <b>satuan</b> pada soal kecepatan dan skala.",
      "Memakai rumus tanpa memahami jenis soal; lebih baik memahami arti soalnya dulu.",
    ],
    tips: [
      "Perkirakan jawaban kasar dulu agar bisa mencoret opsi yang jauh.",
      "Latih 15 soal numerik per hari dengan batas waktu.",
      "Soal yang selalu salah masuk ulangan otomatis; kerjakan ulangannya setiap hari.",
    ],
    contoh: [
      { q: "Deret: 3, 7, 11, 15, ... Suku berikutnya?", a: "19", bahas: "Selisih tiap suku = 4 (tetap), jadi suku berikutnya 15 + 4 = 19." },
      { q: "Harga barang Rp80.000 didiskon 25%. Berapa yang dibayar?", a: "Rp60.000", bahas: "Diskon = 25% × 80.000 = 20.000. Bayar = 80.000 − 20.000 = 60.000." },
      { q: "A menyelesaikan pekerjaan dalam 6 hari, B dalam 3 hari. Jika bekerja bersama?", a: "2 hari", bahas: "Kecepatan gabungan = 1/6 + 1/3 = 1/2 pekerjaan per hari, jadi selesai dalam 2 hari." },
    ],
  },

  "TIU Verbal": {
    prasyarat: [],
    ringkas: "Verbal menguji penalaran lewat kata dan kalimat: sinonim, antonim, analogi, dan silogisme (menarik kesimpulan dari pernyataan). Jawabannya <b>selalu bisa dibuktikan dari soal</b>, bukan dari pendapat pribadi.",
    uraian: [
      { judul: "Analogi", isi: "<p>Tentukan dulu hubungan pasangan pertama, lalu cari pasangan kedua dengan hubungan yang sama persis, termasuk arahnya. Hubungan yang sering muncul: sinonim, lawan kata, bagian-keseluruhan, alat-pengguna, alat-fungsi, tempat-pekerja, sebab-akibat, tingkatan.</p>" },
      { judul: "Silogisme", isi: "<p>Pola dasarnya: &quot;Semua A adalah B&quot; dan &quot;C adalah A&quot; maka &quot;C adalah B&quot;. Kata <b>sebagian</b> tidak boleh diubah menjadi <b>semua</b>. Jika pernyataan menyatakan sebagian, kesimpulan yang pasti benar hanya yang tidak melampaui itu.</p>" },
      { judul: "Sinonim dan antonim", isi: "<p>Pahami makna kata dalam konteks, lalu eliminasi opsi yang jelas berbeda. Perhatikan kata dengan awalan (tidak, ber-, me-) dan kata serapan yang sering muncul di SKD (mis. akurat, esensial, transparan).</p>" },
      { judul: "Penalaran dan wacana", isi: "<p>Untuk soal kesimpulan dari bacaan: kesimpulan harus <b>didukung teks</b>, tidak boleh menambah fakta baru. Coret opsi yang memakai kata terlalu mutlak (selalu, semua, tidak pernah) jika teks tidak menyatakannya.</p>" },
    ],
    langkah: [
      "<b>Analogi:</b> tentukan hubungan pasangan pertama, lalu terapkan pada pasangan kedua dengan arah yang sama.",
      "<b>Silogisme:</b> Semua A adalah B; C adalah A; maka C adalah B. Kata sebagian tidak boleh menjadi semua.",
      "<b>Sinonim/antonim:</b> pahami makna dalam konteks, lalu eliminasi opsi yang jelas berbeda.",
      "Jika dua opsi mirip, pilih yang paling sesuai dengan hubungan pada soal.",
    ],
    kesalahan: [
      "Memilih analogi yang <b>kelihatan terkait</b> tetapi arah hubungannya terbalik.",
      "Menganggap &quot;sebagian&quot; sama dengan &quot;semua&quot; pada silogisme.",
      "Memakai pengetahuan pribadi yang tidak ada di soal untuk menarik kesimpulan.",
    ],
    tips: [
      "Perbanyak kosakata: baca satu halaman teks formal setiap hari dan catat kata baru.",
      "Gambarkan silogisme sebagai lingkaran (diagram Venn) bila membingungkan.",
      "Pada analogi, rumuskan hubungan dalam satu kalimat: &quot;X adalah tempat kerja Y&quot;.",
    ],
    contoh: [
      { q: "Dokter : Rumah Sakit = Guru : ...", a: "Sekolah", bahas: "Hubungannya orang dengan tempat kerjanya. Tempat kerja guru adalah sekolah." },
      { q: "Semua polisi disiplin. Budi seorang polisi. Kesimpulan?", a: "Budi disiplin", bahas: "A (polisi) seluruhnya termasuk B (disiplin); Budi anggota A, jadi Budi termasuk B." },
      { q: "Sebagian pegawai rajin. Andi seorang pegawai. Kesimpulan?", a: "Belum tentu Andi rajin", bahas: "Hanya sebagian pegawai yang rajin; Andi bisa termasuk atau tidak, jadi tidak bisa disimpulkan." },
    ],
  },

  "TIU Figural": {
    prasyarat: [],
    ringkas: "Figural menguji kemampuan melihat pola gambar: perubahan posisi, jumlah, bentuk, arah, dan warna dari satu gambar ke gambar berikutnya. Kerjakan <b>satu elemen satu per satu</b>, jangan menilai seluruh gambar sekaligus.",
    uraian: [
      { judul: "Bedah satu elemen", isi: "<p>Setiap gambar tersusun dari beberapa elemen. Lacak satu elemen dari gambar pertama sampai terakhir: apakah posisinya bergeser, berputar, bertambah, atau berubah warna? Tulis aturannya dalam satu kalimat, lalu ulangi untuk elemen lain.</p>" },
      { judul: "Pola yang paling sering muncul", isi: "<ul><li><b>Rotasi:</b> berputar 90° atau 45° tiap langkah.</li><li><b>Refleksi:</b> bayangan cermin.</li><li><b>Siklik:</b> bergerak lalu kembali ke awal setelah beberapa langkah.</li><li><b>Penambahan atau pengurangan</b> elemen tiap langkah.</li><li><b>Perubahan warna</b> bergantian.</li></ul>" },
      { judul: "Pola siklik", isi: "<p>Hitung panjang siklusnya (berapa langkah sampai kembali ke awal). Untuk langkah ke-n, cari sisa pembagian n dengan panjang siklus. Contoh siklus 4 posisi: langkah ke-9 sama dengan langkah ke-1 (9 ÷ 4 sisa 1).</p>" },
      { judul: "Eliminasi", isi: "<p>Setelah tahu aturan satu elemen, coret opsi yang melanggarnya. Biasanya hanya satu opsi yang lolos semua aturan.</p>" },
    ],
    langkah: [
      "Tulis aturan tiap elemen secara terpisah: posisi, putaran, jumlah, warna.",
      "Kenali pola umum: rotasi, refleksi, siklik, penambahan/pengurangan.",
      "Untuk pola siklik, hitung panjang siklus lalu cari sisa pembagian.",
      "Coret opsi yang melanggar satu aturan; biasanya tinggal satu opsi.",
    ],
    kesalahan: [
      "Menilai seluruh gambar sekaligus sehingga aturan tiap elemen tercampur.",
      "Salah menghitung <b>arah putaran</b> (searah atau berlawanan jarum jam).",
      "Berhenti setelah satu aturan terpenuhi tanpa mengecek elemen lain.",
    ],
    tips: [
      "Putar kertas atau bayangkan gambar berputar untuk soal rotasi.",
      "Latih soal pola secara teratur; kecepatan mengenali pola datang dari pengulangan.",
      "Kalau ragu, perbandingkan opsi dengan gambar terakhir, bukan dengan gambar pertama.",
    ],
    contoh: [
      { q: "Sebuah segitiga berputar 90° searah jarum jam tiap langkah. Setelah 4 langkah, posisinya?", a: "Kembali ke posisi awal", bahas: "4 × 90° = 360°, yaitu satu putaran penuh." },
      { q: "Titik hitam bergerak berurutan: kiri-atas, kanan-atas, kanan-bawah, kiri-bawah, lalu mengulang. Posisi setelah kiri-bawah?", a: "Kiri-atas", bahas: "Siklusnya 4 posisi; setelah posisi terakhir kembali ke posisi pertama." },
    ],
  },

  "Wawasan Kebangsaan": {
    prasyarat: [],
    ringkas: "TWK menguji pemahaman dasar negara dan kebangsaan. Soalnya banyak yang <b>bisa dihafal sekali lalu aman</b>: sila Pancasila dan lambangnya, pasal-pasal pokok UUD 1945, dan sejarah kemerdekaan.",
    uraian: [
      { judul: "Pancasila", isi: "<p>Lima sila dan lambangnya: <b>1) Ketuhanan Yang Maha Esa</b> (bintang), <b>2) Kemanusiaan yang adil dan beradab</b> (rantai), <b>3) Persatuan Indonesia</b> (pohon beringin), <b>4) Kerakyatan yang dipimpin oleh hikmat kebijaksanaan dalam permusyawaratan/perwakilan</b> (kepala banteng), <b>5) Keadilan sosial bagi seluruh rakyat Indonesia</b> (padi dan kapas). Rumusan yang berlaku tertulis pada alinea keempat Pembukaan UUD 1945.</p>" },
      { judul: "Pembukaan UUD 1945", isi: "<p>Alinea 1: kemerdekaan ialah hak segala bangsa. Alinea 2: perjuangan menuju kemerdekaan. Alinea 3: pernyataan kemerdekaan atas berkat rahmat Allah Yang Maha Kuasa. Alinea 4: <b>tujuan negara</b> (melindungi segenap bangsa dan seluruh tumpah darah Indonesia, memajukan kesejahteraan umum, mencerdaskan kehidupan bangsa, dan ikut melaksanakan ketertiban dunia) serta dasar negara Pancasila.</p>" },
      { judul: "Pasal-pasal pokok", isi: "<ul><li>Pasal 1 ayat (3): Indonesia adalah <b>negara hukum</b>.</li><li>Pasal 27 ayat (3): hak dan kewajiban <b>bela negara</b>.</li><li>Pasal 28A–28J: hak asasi manusia.</li><li>Pasal 29: negara berdasar Ketuhanan Yang Maha Esa dan menjamin kemerdekaan memeluk agama.</li><li>Pasal 30: pertahanan dan keamanan negara.</li><li>Pasal 31: pendidikan. Pasal 33: perekonomian dan sumber daya alam. Pasal 34: fakir miskin dan anak terlantar.</li><li>Pasal 35: bendera. Pasal 36: bahasa negara. Pasal 36A: lambang negara. Pasal 36B: lagu kebangsaan.</li></ul>" },
      { judul: "Sejarah dan kebangsaan", isi: "<p>Kebangkitan Nasional 20 Mei 1908 (Budi Utomo). Sumpah Pemuda 28 Oktober 1928. Pidato lahirnya Pancasila 1 Juni 1945. Proklamasi 17 Agustus 1945. UUD 1945 ditetapkan PPKI pada 18 Agustus 1945 dan diubah empat kali pada 1999–2002. Semboyan Bhinneka Tunggal Ika diambil dari Kakawin Sutasoma karya Mpu Tantular. Empat pilar kebangsaan: Pancasila, UUD 1945, NKRI, dan Bhinneka Tunggal Ika.</p>" },
      { judul: "Lembaga negara", isi: "<p>Setelah amandemen: MPR, Presiden, DPR, DPD, BPK, Mahkamah Agung, Mahkamah Konstitusi, dan Komisi Yudisial. Mahkamah Konstitusi lahir dari amandemen ketiga.</p>" },
    ],
    langkah: [
      "<b>Empat pilar:</b> Pancasila, UUD 1945, NKRI, dan Bhinneka Tunggal Ika.",
      "<b>Lambang sila:</b> 1 bintang, 2 rantai, 3 pohon beringin, 4 kepala banteng, 5 padi dan kapas.",
      "<b>Pasal pokok:</b> lihat daftar di atas dan hafalkan nomornya.",
      "<b>Sejarah:</b> urutkan peristiwa berdasarkan tahun.",
    ],
    kesalahan: [
      "Menukar <b>nomor sila</b> dengan lambangnya.",
      "Menukar bunyi <b>Pasal 36, 36A, dan 36B</b> (bahasa, lambang, lagu).",
      "Mengira UUD 1945 diamandemen tiga kali (yang benar empat kali, 1999–2002).",
      "Membaca opsi sepintas: soal TWK sering memakai kata <b>kecuali</b> atau <b>tidak</b>.",
    ],
    tips: [
      "Buat kartu hafalan untuk nomor pasal dan tahun peristiwa; ulangi tiap hari beberapa menit.",
      "Hubungkan fakta dengan cerita: Pancasila lahir 1 Juni, Proklamasi 17 Agustus, UUD 18 Agustus.",
      "Untuk soal sikap kebangsaan, pilih opsi yang menjunjung persatuan, hukum, dan toleransi.",
      "Cocokkan hafalanmu dengan teks resmi UUD 1945 dan UU 24/2009 sebelum tes; format dan isi soal bisa diperbarui.",
    ],
    contoh: [
      { q: "Sila keempat Pancasila berlambang...", a: "Kepala banteng", bahas: "Sila ke-4 berlambang kepala banteng." },
      { q: "Bahasa negara diatur dalam UUD 1945 Pasal...", a: "Pasal 36", bahas: "Pasal 36 menyatakan bahasa negara ialah Bahasa Indonesia." },
      { q: "Pembukaan UUD 1945 memuat Pancasila pada alinea ke...", a: "Alinea ke-4", bahas: "Rumusan Pancasila ada di alinea keempat, bersama tujuan negara." },
    ],
  },

  "TKP Pelayanan Publik": tkp(
    "Aspek ini menilai sikap melayani warga: ramah, cepat, adil, transparan, dan bebas pungli. Nilai tertinggi untuk tindakan yang <b>menuntaskan kebutuhan warga</b> dan tetap sesuai aturan.",
    [
      "Layani sampai tuntas: jelaskan, arahkan, dan pastikan warga terbantu.",
      "Perlakukan semua warga sama; tolak permintaan didahulukan, imbalan, atau pungutan liar dengan sopan.",
      "Kalau bukan wewenang unitmu, tunjukkan unit yang berwenang dan jelaskan alurnya.",
      "Akui kesalahan, perbaiki, dan laporkan; jangan disembunyikan.",
      "Kelompok rentan (lansia, penyandang disabilitas, ibu membawa bayi) perlu perhatian lebih sesuai kebijakan prioritas.",
    ],
    "Mendengarkan, meminta maaf, menjelaskan, dan menyelesaikan.", "Kasar, membiarkan warga bingung, atau menunda tanpa kepastian.",
    [{ q: "Warga marah karena antrean lama. Opsi bernilai tertinggi?", a: "Mendengarkan, meminta maaf, dan menjelaskan estimasi waktu layanan", bahas: "Empati dan informasi yang jelas menenangkan warga tanpa melanggar urutan antrean." }]
  ),
  "TKP Jejaring Kerja": tkp(
    "Aspek ini menilai kemampuan bekerja sama dan membangun hubungan lintas orang dan unit. Opsi terbaik <b>proaktif, komunikatif, dan menyelesaikan masalah lewat dialog</b>.",
    [
      "Hubungi pihak terkait langsung dan sopan sebelum mengeluh atau melapor ke atasan.",
      "Bagikan informasi yang bermanfaat lewat jalur resmi.",
      "Saat berbeda pendapat: dengarkan, sampaikan alasan, cari titik temu, baru libatkan pimpinan bila buntu.",
      "Bantu rekan selama tidak mengorbankan tugas utama, dan beri tahu atasan.",
      "Data sensitif hanya dibagikan dengan izin dan dasar yang sah.",
    ],
    "Menghubungi langsung dengan sopan dan menyepakati tindak lanjut.", "Menggunjing, memihak, atau mengerjakan semuanya sendiri tanpa berkoordinasi.",
    [{ q: "Data dari unit lain terlambat. Opsi bernilai tertinggi?", a: "Menghubungi dengan sopan, menjelaskan kebutuhan dan tenggat, lalu menyepakati jadwal", bahas: "Komunikasi langsung dan jelas menjaga hubungan sekaligus menyelesaikan masalah." }]
  ),
  "TKP Sosial Budaya": tkp(
    "Aspek ini menilai sikap terhadap keberagaman: agama, suku, budaya, gender, dan kebutuhan khusus. Nilai tertinggi untuk <b>menghormati, beradaptasi, dan menjaga kebersamaan</b>.",
    [
      "Hormati ibadah, adat, dan kebiasaan orang lain; beri ruang dan waktu yang wajar.",
      "Di lingkungan baru, pelajari dulu adat setempat, jangan menghakimi atau memaksakan kebiasaan sendiri.",
      "Tegur dengan sopan candaan yang merendahkan kelompok tertentu.",
      "Rancang kegiatan agar semua bisa ikut (jadwal, menu, akses).",
      "Perlakukan semua gender dan penyandang disabilitas setara dalam kesempatan.",
    ],
    "Menghormati, bertanya dengan sopan, dan mencari solusi inklusif.", "Ikut mengejek, memaksa, atau menyingkirkan orang yang berbeda.",
    [{ q: "Rekan berbeda agama sedang beribadah saat rapat akan dimulai. Opsi bernilai tertinggi?", a: "Memberi waktu dan menyesuaikan jadwal rapat dengan wajar", bahas: "Menghormati ibadah adalah wujud toleransi tanpa mengorbankan pekerjaan." }]
  ),
  "TKP TIK": tkp(
    "TKP TIK menilai sikap terhadap teknologi: mau belajar, menjaga keamanan data, dan memakai sistem secara bertanggung jawab. Pilih opsi yang <b>aman, sesuai aturan, dan mau belajar</b>.",
    [
      "Jangan membagikan kata sandi atau meminjamkan akun; pakai sandi unik dan autentikasi dua langkah.",
      "Email atau tautan mencurigakan: jangan dibuka, laporkan ke bagian TI.",
      "Data kantor dan data warga hanya disimpan dan dikirim lewat sarana resmi.",
      "Menemukan celah atau insiden: dokumentasikan dan laporkan, jangan dimanfaatkan atau disebarkan.",
      "Mau belajar sistem baru lewat pelatihan, dan verifikasi informasi sebelum membagikannya.",
    ],
    "Aman, resmi, melapor, dan mau belajar.", "Memakai akun orang lain, menyimpan data di perangkat pribadi, atau menyebarkan kabar yang belum jelas.",
    [{ q: "Email meminta kata sandi akun kantor. Opsi bernilai tertinggi?", a: "Tidak membukanya, melaporkan ke bagian TI, dan menghapusnya", bahas: "Itu ciri phishing; pelaporan melindungi pengguna lain juga." }]
  ),
  "TKP Profesionalisme": tkp(
    "Profesionalisme menilai integritas, tanggung jawab, dan etos kerja. Nilai tertinggi untuk <b>jujur, patuh aturan, bertanggung jawab, dan terus belajar</b>.",
    [
      "Akui kesalahan sendiri, perbaiki, dan beri tahu pihak terkait; jangan menyalahkan orang lain.",
      "Perintah yang tampak melanggar aturan: sampaikan keberatan dengan sopan disertai dasar aturan, lalu cari alternatif yang sah.",
      "Tolak gratifikasi, deklarasikan konflik kepentingan, dan jaga rahasia jabatan.",
      "Saat tenggat mepet: susun prioritas dan komunikasikan lebih awal.",
      "Terima kritik dengan kepala dingin dan jadikan bahan perbaikan.",
    ],
    "Jujur, bertanggung jawab, dan menuntaskan dengan cara yang sah.", "Menutupi kesalahan, menerima imbalan, atau melempar tanggung jawab.",
    [{ q: "Anda menemukan kesalahan di laporan sendiri yang belum disadari siapa pun. Opsi bernilai tertinggi?", a: "Segera memperbaiki, melapor ke atasan, dan memastikan pihak terdampak mendapat versi benar", bahas: "Integritas berarti mengakui dan memperbaiki, bukan menutupi." }]
  ),
  "TKP Anti Radikalisme": tkp(
    "Aspek ini menilai komitmen pada Pancasila, persatuan, dan penolakan kekerasan serta kebencian. Nilai tertinggi untuk <b>menolak, meluruskan, dan melapor lewat jalur yang benar</b>, bukan main hakim sendiri.",
    [
      "Jangan ikut menyebarkan ujaran kebencian, hoaks, atau pesan yang mengadu domba; verifikasi dulu.",
      "Tegur dengan baik dan edukasi orang di sekitar tentang pentingnya persatuan.",
      "Ada ajakan makar, kekerasan, atau paham ekstrem: laporkan ke pihak berwenang.",
      "Dekati teman yang mulai berubah dengan empati dan dialog, bukan dijauhi atau diejek.",
      "Sampaikan aspirasi secara damai dan sesuai hukum; tolak tindakan anarkis.",
    ],
    "Menolak tegas, meluruskan dengan santun, dan melapor.", "Ikut menyebarkan, membiarkan, atau main hakim sendiri.",
    [{ q: "Rekan menyebar ujaran kebencian di media sosial. Opsi bernilai tertinggi?", a: "Menegurnya dengan baik, mengingatkan dampaknya, dan melaporkan konten bila terus berlanjut", bahas: "Menghentikan penyebaran kebencian dengan cara yang tetap santun dan sah." }]
  ),
};
export default KONSEP;
