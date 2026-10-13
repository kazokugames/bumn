/* Simulasi Tes Polri & BUMN — mesin ujian + UI Learnova-style, vanilla JS. */
(function () {
  "use strict";

  var app = document.getElementById("app");
  var S = null; // state ujian/latihan aktif
  var HASIL = null; // hasil terakhir (untuk render ulang saat ganti tema)
  var HALAMAN = { nama: "dashboard", arg: null }; // halaman aktif (menu sidebar)
  var timerId = null;

  var DISCLAIMER =
    "Soal di aplikasi ini adalah soal latihan buatan sendiri yang mengikuti pola dan kisi-kisi seleksi 2021–2026. " +
    "Ini <b>bukan</b> soal asli resmi. Passing grade, durasi, dan tahapan hanyalah perkiraan. Selalu cek pengumuman resmi tiap periode.";

  window.addEventListener("error", function (e) { document.title = "ERR: " + e.message; });

  // ---------- util ----------
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  function setScreen(html) {
    app.innerHTML = html;
    app.classList.remove("fade-up");
    void app.offsetWidth;
    app.classList.add("fade-up");
    window.scrollTo(0, 0);
  }
  // ---------- tema ----------
  function tema() {
    try { return localStorage.getItem("tema") || "terang"; } catch (e) { return "terang"; }
  }
  function setTema(t) {
    document.documentElement.dataset.tema = t;
    try { localStorage.setItem("tema", t); } catch (e) { /* abaikan */ }
  }
  setTema(tema());

  // ---------- animasi ----------
  function hitungNaik() {
    document.querySelectorAll("[data-count]").forEach(function (el) {
      var target = parseFloat(el.dataset.count) || 0;
      var desimal = parseInt(el.dataset.desimal || "0", 10);
      var t0 = performance.now(), durasi = 1100;
      function langkah(t) {
        var p = Math.min(1, (t - t0) / durasi);
        el.textContent = (target * (1 - Math.pow(1 - p, 3))).toFixed(desimal);
        if (p < 1) requestAnimationFrame(langkah);
      }
      requestAnimationFrame(langkah);
    });
  }
  function isiRing() {
    document.querySelectorAll(".ring[data-pct]").forEach(function (r) {
      var target = parseFloat(r.dataset.pct) || 0;
      r.style.setProperty("--pct", 0);
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { r.style.setProperty("--pct", target); });
      });
    });
  }
  function confetti() {
    var wadah = document.createElement("div");
    wadah.className = "confetti";
    var warna = ["#6c5ce7", "#9d7bff", "#1fbf83", "#f5a623", "#ef5b6b", "#4d8af0"];
    for (var i = 0; i < 48; i++) {
      var p = document.createElement("i");
      p.style.left = Math.random() * 100 + "%";
      p.style.background = warna[i % warna.length];
      p.style.animationDelay = (Math.random() * 0.6) + "s";
      p.style.animationDuration = (2 + Math.random() * 1.5) + "s";
      wadah.appendChild(p);
    }
    document.body.appendChild(wadah);
    setTimeout(function () { wadah.remove(); }, 4500);
  }

  // ---------- data ----------
  // satu tes boleh memakai beberapa bank (bank: ["akpol", "sipss"])
  function bankTes(tes) {
    return [].concat(tes.bank).reduce(function (a, b) { return a.concat(window.BANK[b] || []); }, []);
  }
  function tesById(id) {
    for (var i = 0; i < CONFIG.tes.length; i++) if (CONFIG.tes[i].id === id) return CONFIG.tes[i];
    return null;
  }
  function loadRiwayat() {
    try { return JSON.parse(localStorage.getItem("riwayat") || "[]"); }
    catch (e) { return []; }
  }
  function saveRiwayat(list) {
    try { localStorage.setItem("riwayat", JSON.stringify(list)); } catch (e) { /* abaikan */ }
  }
  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function shuffleOpts(soal) {
    var idx = shuffle(soal.opts.map(function (_, i) { return i; }));
    return {
      id: soal.id, topik: soal.topik, q: soal.q, bahas: soal.bahas, jurusan: soal.jurusan, level: soal.level,
      opts: idx.map(function (i) { return soal.opts[i]; }),
      ans: idx.indexOf(soal.ans),
      skor: soal.skor ? idx.map(function (i) { return soal.skor[i]; }) : null
    };
  }

  // ---------- skor (fungsi murni) ----------
  function skorSoal(soal, jawab) {
    if (jawab == null) return 0;
    if (soal.skor) return soal.skor[jawab] || 0;
    return jawab === soal.ans ? 1 : 0;
  }
  function skorMaksSoal(soal) {
    if (soal.skor) return Math.max.apply(null, soal.skor);
    return 1;
  }

  // agregat riwayat
  function agregatRiwayat() {
    var list = loadRiwayat();
    var jml = { n: 0, pct: 0, topik: {}, terakhir: null, daftar: list };
    list.forEach(function (r) {
      jml.n++; jml.pct += r.pct || 0;
      if (!jml.terakhir) jml.terakhir = r;
      (r.perTopik || []).forEach(function (p) {
        var d = jml.topik[p.topik] = jml.topik[p.topik] || { j: 0, pct: 0 };
        d.j++; d.pct += p.pct;
      });
    });
    jml.rata = jml.n ? Math.round(jml.pct / jml.n * 10) / 10 : 0;
    jml.topikArr = Object.keys(jml.topik).map(function (t) {
      return { topik: t, pct: Math.round(jml.topik[t].pct / jml.topik[t].j * 10) / 10 };
    }).sort(function (a, b) { return b.pct - a.pct; });
    jml.lemah = jml.topikArr.length ? jml.topikArr[jml.topikArr.length - 1] : null;
    // streak hari berturut
    var hari = {};
    list.forEach(function (r) { hari[r.tanggal.slice(0, 10)] = 1; });
    var streak = 0, d = new Date();
    if (!hari[d.toISOString().slice(0, 10)]) d.setDate(d.getDate() - 1); // mulai dari kemarin bila hari ini belum
    while (hari[d.toISOString().slice(0, 10)]) { streak++; d.setDate(d.getDate() - 1); }
    jml.streak = streak;
    return jml;
  }
  var IKON_TOPIK = { "Verbal": "💬", "Numerik": "🔢", "Logika": "🧠", "Figural": "🔷", "Klasifikasi Kata": "🗂️", "Reading": "📖", "Grammar": "✏️", "Vocabulary": "📝", "Matematika": "➗", "Bahasa Indonesia": "🇮🇩", "Bahasa Inggris": "🌐", "Pengetahuan Umum": "🌍", "Wawasan Kebangsaan": "🛡️", "Amanah": "🤝", "Kompeten": "💪", "Harmonis": "☯️", "Loyal": "🎖️", "Adaptif": "🌊", "Kolaboratif": "🤲", "Akuntansi": "🧾", "Keuangan": "💰", "Pemrograman & Algoritma": "💻", "Basis Data": "🗄️", "Jaringan & Keamanan": "🛡️", "Sistem Komputer": "🖥️", "TIU Verbal": "💬", "TIU Numerik": "🔢", "TIU Figural": "🔷" };

  // ---------- kerangka sidebar ----------
  var MENU = [
    { id: "dashboard", ikon: "🏠", teks: "Dashboard" },
    { id: "tes", ikon: "📝", teks: "Daftar Tes" },
    { id: "panduan-polri", ikon: "🚓", teks: "Panduan Polri" },
    { id: "panduan-bumn", ikon: "🏢", teks: "Panduan BUMN" },
    { id: "riwayat", ikon: "🕘", teks: "Riwayat" }
  ];
  function kerangka(aktif, judul, salam, isi) {
    var menu = MENU.map(function (m) {
      return '<button class="menu-item' + (m.id === aktif ? " aktif" : "") + '" data-menu="' + m.id + '">' +
        '<span class="ikon">' + m.ikon + '</span><span class="teks">' + m.teks + '</span></button>';
    }).join("");
    return '<div class="layout"><aside class="sidebar">' +
      '<div class="logo"><div class="logo-ikon">🎓</div><div>Simulasi Tes<small>POLRI · BUMN</small></div></div>' +
      '<div class="menu-label">Menu</div>' + menu +
      '</aside><main class="konten">' +
      '<div class="topbar"><div><h2>' + judul + '</h2><div class="salam">' + salam + '</div></div>' +
      '<div class="spacer"></div>' +
      '<div class="pill-cari">🔎 ' + esc(CONFIG.tes.length) + ' tes · soal latihan tak terhingga</div>' +
      '<button class="tombol-tema" data-tema-toggle title="Ganti tema">' + (tema() === "gelap" ? "☀️" : "🌙") + '</button>' +
      '</div>' + isi + '</main></div>';
  }
  function salam() {
    var j = new Date().getHours();
    return j < 11 ? "Selamat pagi, semangat belajar! 🌤️" : j < 15 ? "Selamat siang, tetap fokus! ☀️" : j < 19 ? "Selamat sore, waktunya latihan! 🌥️" : "Selamat malam, jangan lupa istirahat! 🌙";
  }

  // ---------- dashboard ----------
  function renderHome() {
    stopTimer(); S = null; HASIL = null;
    HALAMAN = { nama: "dashboard", arg: null };
    var agg = agregatRiwayat();
    var ringPct = Math.min(100, agg.rata);
    var lvl = agg.rata >= 80 ? "Mahir" : agg.rata >= 60 ? "Berkembang" : agg.rata > 0 ? "Pemula" : "—";
    var totalSoal = Object.keys(window.BANK).reduce(function (a, k) { return a + window.BANK[k].length; }, 0);

    var html = '<div class="banner">' + DISCLAIMER + '</div>';

    // stat row
    html += '<div class="baris-stat fade-up d1">' +
      kartuStat("📝", "", agg.n, "Total Percobaan") +
      kartuStat("🎯", "", '<span data-count="' + agg.rata + '" data-desimal="1">0</span>%', "Skor Rata-rata") +
      kartuStat("📊", "hijau", agg.topikArr.length, "Topik Terlacak") +
      kartuStat("📚", "kuning", totalSoal, "Soal di Bank") +
      '</div>';

    // grid utama
    html += '<div class="grid-utama">';
    // kiri: ring + topik
    html += '<div class="kartu fade-up d2"><h3 class="kartu-judul">📈 Progres Belajar <button class="aksi" data-menu="riwayat">Lihat riwayat</button></h3>' +
      '<div class="ring-wrap">' +
      '<div class="ring" data-pct="' + ringPct + '" style="--pct:0;--ring-color:var(--brand)"><div>' +
      '<div class="big"><span data-count="' + agg.rata + '" data-desimal="1">0</span>%</div>' +
      '<div class="kecil">' + lvl + '</div></div></div>' +
      '<div class="topik-list">';
    if (agg.topikArr.length) {
      agg.topikArr.slice(0, 5).forEach(function (t) {
        html += '<div class="topik-row"><span class="topik-ikon">' + (IKON_TOPIK[t.topik] || "📚") + '</span>' +
          '<span class="topik-nama">' + esc(t.topik) + '</span>' +
          '<span class="bar"><span style="width:' + Math.min(100, t.pct) + '%"></span></span>' +
          '<span class="topik-pct">' + t.pct + '%</span></div>';
      });
    } else {
      html += '<p class="empty">Belum ada percobaan.<br>Selesaikan tes pertama untuk melihat progres per topik.</p>';
    }
    html += '</div></div></div>';
    // kanan: streak + terakhir
    html += '<div style="display:flex;flex-direction:column;gap:16px">' +
      '<div class="kartu streak fade-up d3"><div class="api">🔥</div><b><span data-count="' + agg.streak + '">0</span> hari</div><span>streak belajar berturut-turut</span></div>' +
      '<div class="kartu fade-up d4"><h3 class="kartu-judul">🗓️ Percobaan Terakhir</h3>' +
      (agg.terakhir
        ? '<b style="font-size:1.1rem">' + esc(agg.terakhir.nama) + '</b><br><span class="muted">' +
          new Date(agg.terakhir.tanggal).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) +
          ' · skor ' + agg.terakhir.pct + '% · ' + Math.floor(agg.terakhir.durasi / 60) + ' mnt</span>'
        : '<p class="empty">Belum ada percobaan.</p>') +
      '<br><button class="btn primary besar" data-menu="tes" style="margin-top:12px">Mulai Latihan →</button>' +
      '</div></div>';
    html += '</div>'; // grid-utama

    // grafik tren
    html += '<div class="kartu fade-up d4" style="margin-top:16px"><h3 class="kartu-judul">📉 Tren Performa <span class="aksi muted">' + Math.min(10, agg.n) + ' percobaan terakhir</span></h3>' +
      grafikSvg(agg.daftar.slice(-10)) + '</div>';

    // fokus belajar
    html += '<div class="kartu fade-up d5" style="margin-top:16px"><h3 class="kartu-judul">🎯 Fokus Belajar <span class="aksi muted">topik terlemahmu</span></h3>';
    var lemah3 = agg.topikArr.slice(-3).reverse();
    if (lemah3.length) {
      lemah3.forEach(function (t) {
        html += '<div class="goal"><div class="goal-atas"><b>' + (IKON_TOPIK[t.topik] || "📚") + ' ' + esc(t.topik) + '</b><span class="muted">' + t.pct + '%</span></div>' +
          '<div class="bar"><span style="width:' + Math.min(100, t.pct) + '%;background:linear-gradient(90deg,var(--warn),var(--bad))"></span></div></div>';
      });
      html += '<p class="muted" style="margin:8px 0 0">Saran: buka <b>Daftar Tes → Mode Latihan</b>, filter topik di atas, lalu ulangi sampai stabil di atas 70%.</p>';
    } else {
      html += '<p class="empty">Selesaikan satu tes dulu — aplikasi akan otomatis menentukan topik yang perlu kamu perbaiki.</p>';
    }
    html += '</div>';

    setScreen(kerangka("dashboard", "Dashboard", salam(), html));
    isiRing(); hitungNaik();
  }
  function kartuStat(ikon, kelas, nilai, label) {
    return '<div class="kartu stat"><div class="stat-ikon ' + kelas + '">' + ikon + '</div><div><b>' + nilai + '</b><span>' + label + '</span></div></div>';
  }
  function grafikSvg(daftar) {
    if (daftar.length < 2) return '<p class="empty">Grafik tren muncul setelah kamu punya minimal 2 percobaan.</p>';
    var W = 560, H = 140, P = 14;
    var nilai = daftar.map(function (r) { return r.pct; });
    var maks = Math.max(100, Math.max.apply(null, nilai));
    var stepX = (W - P * 2) / (nilai.length - 1);
    var titik = nilai.map(function (v, i) {
      return [P + i * stepX, H - P - (v / maks) * (H - P * 2)];
    });
    var garis = titik.map(function (t, i) { return (i ? "L" : "M") + t[0].toFixed(1) + " " + t[1].toFixed(1); }).join(" ");
    var area = garis + " L" + (W - P) + " " + (H - P) + " L" + P + " " + (H - P) + " Z";
    var titikTerkini = titik[titik.length - 1];
    var svg = '<svg viewBox="0 0 ' + W + ' ' + H + '" class="grafik" role="img" aria-label="Grafik tren skor">' +
      '<defs><linearGradient id="ga" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0" stop-color="#6c5ce7" stop-opacity=".28"/><stop offset="1" stop-color="#6c5ce7" stop-opacity="0"/></linearGradient></defs>' +
      '<path d="' + area + '" fill="url(#ga)"/>' +
      '<path d="' + garis + '" fill="none" stroke="var(--brand)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<circle cx="' + titikTerkini[0] + '" cy="' + titikTerkini[1] + '" r="5.5" fill="var(--brand)" stroke="var(--surface)" stroke-width="2.5"/>' +
      '</svg>';
    var naik = nilai[nilai.length - 1] >= nilai[0];
    return '<div class="baris" style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap">' +
      '<div><b style="font-size:1.6rem">' + nilai[nilai.length - 1] + '%</b> <span class="badge ' + (naik ? "pass" : "fail") + '">' + (naik ? "↗ tren naik" : "↘ tren turun") + '</span></div>' +
      '<span class="muted">rata-rata ' + Math.round(nilai.reduce(function (a, b) { return a + b; }, 0) / nilai.length * 10) / 10 + '%</span></div>' + svg;
  }

  // ---------- halaman tes ----------
  function renderTes() {
    stopTimer(); S = null; HASIL = null;
    HALAMAN = { nama: "tes", arg: null };
    var html = '<div class="banner">' + DISCLAIMER + '</div>';
    ["Polri", "BUMN"].forEach(function (kel) {
      html += '<h2 class="kelompok-title">' + (kel === "Polri" ? "🚓 Kepolisian (Polri)" : "🏢 Badan Usaha Milik Negara (BUMN)") + '</h2><div class="cards">';
      CONFIG.tes.filter(function (t) { return t.kelompok === kel; }).forEach(function (t, i) {
        var n = bankTes(t).length;
        html += '<div class="card fade-up d' + (Math.min(i, 5) + 1) + '"><h3>' + esc(t.nama) + '</h3>' +
          '<div class="meta">' + t.durasiMenit + ' menit · ' + t.jumlahSoal + ' soal (tersedia ' + n + ' di bank) · PG lulus ' + t.passingGrade + '%*</div>' +
          '<div class="desc">' + esc(t.deskripsi) + '</div>' +
          '<div class="actions">' +
          '<button class="btn primary" data-start="' + t.id + '" data-mode="ujian">▶ Mulai Ujian</button>' +
          '<button class="btn" data-start="' + t.id + '" data-mode="latihan">📖 Mode Latihan</button>' +
          '</div></div>';
      });
      html += '</div>';
    });
    html += '<p class="muted">*Passing grade adalah perkiraan, bukan angka resmi. Psikologi, kesamaptaan jasmani, dan kesehatan hanya dijelaskan di halaman Panduan — tidak disimulasikan.</p>';
    setScreen(kerangka("tes", "Daftar Tes", "Pilih tes, kerjakan dengan timer seperti CAT asli, atau latihan per topik.", html));
  }

  // ---------- panduan ----------
  function renderPanduanHal(jalur) {
    stopTimer(); S = null; HASIL = null;
    HALAMAN = { nama: "panduan-" + jalur, arg: null };
    var html = '<div class="panduan">' + PANDUAN[jalur] + '</div>' +
      '<p style="margin-top:14px"><button class="btn ghost" data-menu="tes">← Ke Daftar Tes</button></p>';
    setScreen(kerangka("panduan-" + jalur, "Panduan Jalur " + (jalur === "polri" ? "Polri" : "BUMN"),
      "Dari pendaftaran sampai pengumuman — apa yang diuji dan cara mempersiapkannya.", html));
  }

  // ---------- riwayat ----------
  function renderRiwayatHal() {
    stopTimer(); S = null; HASIL = null;
    HALAMAN = { nama: "riwayat", arg: null };
    var list = loadRiwayat().slice().reverse();
    var html = "";
    if (!list.length) {
      html += '<div class="kartu"><p class="empty">Belum ada percobaan. Mulai dari <b>Daftar Tes</b>.</p></div>';
    }
    list.forEach(function (r, i) {
      var tgl = new Date(r.tanggal).toLocaleString("id-ID");
      var menit = Math.floor(r.durasi / 60), detik = r.durasi % 60;
      html += '<div class="riwayat-item fade-up d' + (Math.min(i, 5) + 1) + '"><b>' + esc(r.nama) + '</b> — ' + r.pct + '% (' + r.skor + '/' + r.maks + ')' +
        ' <span class="badge ' + (r.mode === "ujian" ? "pass" : "fail") + '" style="font-size:.72rem">' + (r.mode === "ujian" ? "Ujian" : "Latihan") + '</span>' +
        '<div class="muted">' + tgl + ' · durasi ' + menit + ' mnt ' + detik + ' dtk</div>' +
        (r.perTopik && r.perTopik.length ? '<div class="muted">Per topik: ' +
          r.perTopik.map(function (p) { return esc(p.topik) + " " + p.pct + "%"; }).join(" · ") + '</div>' : '') +
        '</div>';
    });
    if (list.length) html += '<p><button class="btn danger" id="hapus-riwayat">🗑️ Hapus Semua Riwayat</button></p>';
    setScreen(kerangka("riwayat", "Riwayat Percobaan", "Lacak perkembanganmu dari waktu ke waktu.", html));
    var btn = document.getElementById("hapus-riwayat");
    if (btn) btn.onclick = function () {
      if (confirm("Hapus semua riwayat? Tindakan ini tidak bisa dibatalkan.")) {
        saveRiwayat([]); renderRiwayatHal();
      }
    };
  }

  // ---------- susun soal ----------
  function susunSoal(tes) {
    var bank = bankTes(tes);
    var terpilih = [], catatan = [];
    Object.keys(tes.komposisi).forEach(function (topik) {
      var butuh = tes.komposisi[topik];
      var pool = bank.filter(function (s) { return s.topik === topik; });
      var ambil = GEN.susun(topik, butuh, pool);
      if (ambil.length < butuh) catatan.push(topik + ": bank hanya punya " + ambil.length + " dari " + butuh + " soal");
      terpilih = terpilih.concat(ambil);
    });
    terpilih.sort(function (a, b) { return (a.level || 1) - (b.level || 1); }); // mudah -> sulit
    return { list: terpilih.map(shuffleOpts), catatan: catatan };
  }

  // ---------- mulai ----------
  function startUjian(tesId) {
    var tes = tesById(tesId);
    var hasil = susunSoal(tes);
    S = {
      tes: tes, mode: "ujian", soal: hasil.list, catatan: hasil.catatan,
      jawab: new Array(hasil.list.length).fill(null),
      ragu: new Array(hasil.list.length).fill(false),
      cur: 0, sisa: tes.durasiMenit * 60, selesai: false
    };
    renderExam();
    timerId = setInterval(tick, 1000);
  }
  function renderLatihanSetup(tesId) {
    var tes = tesById(tesId);
    var topiks = Object.keys(tes.komposisi);
    var html = '<div class="banner">' + DISCLAIMER + '</div>' +
      '<div class="kartu" style="max-width:560px"><h3 class="kartu-judul">📖 Mode Latihan — ' + esc(tes.nama) + '</h3>' +
      '<p class="muted">Tanpa batas waktu. Jawaban langsung diperiksa beserta pembahasannya. Pilih topik yang mau dilatih:</p>' +
      '<div class="filter-row"><select id="lat-topik"><option value="">Semua topik</option>';
    topiks.forEach(function (t) { html += '<option value="' + esc(t) + '">' + esc(t) + '</option>'; });
    html += '</select><button class="btn primary" id="lat-mulai">Mulai Latihan</button> ' +
      '<button class="btn ghost" data-menu="tes">Batal</button></div></div>';
    setScreen(kerangka("tes", "Mode Latihan", "Latih topik lemahmu tanpa tekanan timer.", html));
    document.getElementById("lat-mulai").onclick = function () {
      startLatihan(tesId, document.getElementById("lat-topik").value || null);
    };
  }
  function topikLatihan() { return S.topikFilter ? [S.topikFilter] : Object.keys(S.tes.komposisi); }
  function startLatihan(tesId, topik) {
    var tes = tesById(tesId);
    var bank = bankTes(tes);
    var ts = Object.keys(tes.komposisi); // bank bisa dipakai beberapa tes (mis. Tes Bidang)
    var pool = bank.filter(function (s) { return topik ? s.topik === topik : ts.indexOf(s.topik) >= 0; });
    pool = pool.slice().sort(function (a, b) { return (a.level || 1) - (b.level || 1); });
    S = {
      tes: tes, mode: "latihan", soal: pool.map(shuffleOpts),
      jawab: [], ragu: [], cur: 0, sisa: null, selesai: false,
      topikFilter: topik || "", revealed: {}
    };
    renderExam();
  }

  // ---------- timer ----------
  function stopTimer() { if (timerId) { clearInterval(timerId); timerId = null; } }
  function fmt(s) {
    var m = Math.floor(s / 60), d = s % 60;
    return (m < 10 ? "0" : "") + m + ":" + (d < 10 ? "0" : "") + d;
  }
  function tick() {
    if (!S || S.selesai) return;
    S.sisa--;
    var el = document.getElementById("timer");
    if (el) {
      el.textContent = fmt(Math.max(0, S.sisa));
      el.classList.toggle("low", S.sisa < S.tes.durasiMenit * 6);
    }
    if (S.sisa <= 0) { stopTimer(); finish(true); }
  }

  // ---------- render ujian/latihan ----------
  function renderExam() {
    var i = S.cur, soal = S.soal[i], n = S.soal.length;
    var terjawab = S.mode === "ujian" ? S.jawab.filter(function (x) { return x != null; }).length : 0;
    var html = '<div class="exam-shell">';
    html += '<div class="exam-top">';
    if (S.mode === "ujian") {
      html += '<div class="baris"><div class="exam-info"><b>' + esc(S.tes.nama) + '</b> · Soal ' + (i + 1) + '/' + n + ' · diurut mudah → sulit</div>' +
        '<div class="timer" id="timer">' + fmt(S.sisa) + '</div></div>' +
        '<div class="progress" title="' + terjawab + ' dari ' + n + ' terjawab"><span style="width:' + Math.round(terjawab / n * 100) + '%"></span></div>';
    } else {
      html += '<div class="baris"><div class="exam-info"><b>📖 Latihan — ' + esc(S.tes.nama) + '</b>' + (S.topikFilter ? ' · topik: ' + esc(S.topikFilter) : "") + ' · Soal ' + (i + 1) + '/' + n + '</div>' +
        '<div><button class="btn ghost" data-menu="tes">✖ Selesai Latihan</button></div></div>';
    }
    html += '</div>';

    html += '<div class="exam-layout"><div class="exam-main">';
    var stars = S.mode === "latihan" ? ' <span class="stars" title="Tingkat kesulitan">' + "★".repeat(soal.level || 1) + "☆".repeat(3 - (soal.level || 1)) + '</span>' : "";
    html += '<div class="question-box"><div class="q-topik">' + esc(soal.topik) + stars + '</div>' +
      '<div class="q-text">' + soal.q + '</div><div class="opts">';
    var revealed = S.mode === "latihan" && S.revealed[i];
    soal.opts.forEach(function (opt, j) {
      var cls = "opt";
      if (revealed) {
        if (j === soal.ans) cls += " correct";
        else if (S.revealed[i] === j) cls += " wrong";
      } else if (S.mode === "ujian" && S.jawab[i] === j) cls += " sel";
      html += '<button class="' + cls + '" data-opt="' + j + '"' + (revealed ? " disabled" : "") + '>' +
        '<span class="opt-letter">' + String.fromCharCode(65 + j) + '.</span>' + opt + '</button>';
    });
    html += '</div>';
    if (revealed) {
      var benar = S.revealed[i] === soal.ans;
      html += '<div class="bahas"><span class="key">' + (benar ? "Benar! 🎉" : "Kurang tepat.") + '</span> ' +
        'Kunci: <b>' + String.fromCharCode(65 + soal.ans) + '</b><br>' + soal.bahas + '</div>';
    }
    html += '</div>';

    html += '<div class="exam-nav">' +
      '<button class="btn" data-nav="-1"' + (i === 0 ? " disabled" : "") + '>← Sebelumnya</button>' +
      (S.mode === "ujian" ? '<button class="btn ghost" data-flag>' + (S.ragu[i] ? "✓ Ragu-ragu" : "🚩 Ragu-ragu") + '</button>' : '') +
      (i < n - 1 || (S.mode === "latihan" && topikLatihan().some(GEN.ada)) ? '<button class="btn primary" data-nav="1">Berikutnya →</button>' : '');
    if (S.mode === "ujian") html += '<button class="btn danger" data-finish>Selesai</button>';
    html += '</div>';
    if (S.catatan && S.catatan.length) {
      html += '<p class="muted">Catatan: ' + S.catatan.map(esc).join("; ") + ' — dipakai semua soal yang tersedia.</p>';
    }
    html += '</div>'; // exam-main

    if (S.mode === "ujian") {
      var belumN = S.jawab.filter(function (x) { return x == null; }).length;
      var raguN = S.ragu.filter(Boolean).length;
      html += '<aside class="exam-side"><div class="side-box">' +
        '<div class="side-title">Navigasi Soal</div>' +
        '<div class="side-stats"><span><i style="background:var(--ok)"></i>' + (n - belumN - raguN) + ' terjawab</span>' +
        '<span><i style="background:var(--flag)"></i>' + raguN + ' ragu</span>' +
        '<span><i style="background:var(--surface);border:1px solid var(--border)"></i>' + belumN + ' belum</span></div>' +
        '<div class="navigator">';
      for (var k = 0; k < n; k++) {
        var c = "nav-num";
        if (S.jawab[k] != null) c += " done";
        if (S.ragu[k]) c += " flag";
        if (k === i) c += " cur";
        html += '<button class="' + c + '" data-goto="' + k + '" title="Soal ' + (k + 1) + '">' + (k + 1) + '</button>';
      }
      html += '</div><button class="btn danger besar" data-finish>🏁 Selesai &amp; Kumpulkan</button></div></aside>';
    }
    html += '</div></div>'; // layout + shell
    setScreen(html);
  }

  // ---------- selesai & hasil ----------
  function hitungSemua() {
    var perTopik = {}, total = 0, maks = 0;
    S.soal.forEach(function (soal, i) {
      var j = S.mode === "ujian" ? S.jawab[i] : null;
      var d = perTopik[soal.topik] = perTopik[soal.topik] || { skor: 0, maks: 0, n: 0 };
      var s = S.mode === "ujian" ? skorSoal(soal, j) : 0;
      var m = skorMaksSoal(soal);
      d.skor += s; d.maks += m; d.n++;
      total += s; maks += m;
    });
    return { perTopik: perTopik, total: total, maks: maks, pct: maks ? Math.round(total / maks * 1000) / 10 : 0 };
  }
  function finish(otomatis) {
    if (S.selesai) return;
    S.selesai = true;
    stopTimer();
    var h = hitungSemua();
    var durasiPakai = S.tes.durasiMenit * 60 - Math.max(0, S.sisa || 0);
    var rec = {
      tanggal: new Date().toISOString(), tes: S.tes.id, nama: S.tes.nama, mode: S.mode,
      skor: h.total, maks: h.maks, pct: h.pct, durasi: durasiPakai,
      perTopik: Object.keys(h.perTopik).map(function (t) {
        return { topik: t, pct: h.perTopik[t].maks ? Math.round(h.perTopik[t].skor / h.perTopik[t].maks * 1000) / 10 : 0 };
      })
    };
    var list = loadRiwayat(); list.push(rec); saveRiwayat(list);
    HASIL = { h: h, otomatis: otomatis };
    renderHasil(h, otomatis, rec);
  }
  function renderHasil(h, otomatis) {
    var lulus = h.pct >= S.tes.passingGrade;
    var html = '<div class="exam-shell">';
    html += '<div class="banner">' + DISCLAIMER + '</div>';
    html += '<div class="kartu"><div class="hasil-head">' +
      '<div class="ring" data-pct="' + Math.min(100, h.pct) + '" style="--pct:0;--ring-color:' + (lulus ? "var(--ok)" : "var(--bad)") + '"><div>' +
      '<div class="big"><span data-count="' + h.pct + '" data-desimal="' + (String(h.pct).indexOf(".") >= 0 ? 1 : 0) + '">0</span>%</div>' +
      '<div class="kecil">' + h.total + ' / ' + h.maks + ' poin</div></div></div>' +
      '<div style="flex:1;min-width:220px"><h3 style="margin:0 0 6px">' + esc(S.tes.nama) + '</h3>' +
      '<div class="muted">' + (otomatis ? "⏰ Waktu habis — dikumpulkan otomatis. " : "") + S.tes.durasiMenit + ' menit · ' + S.soal.length + ' soal · passing grade ' + S.tes.passingGrade + '% (perkiraan)</div>' +
      '<div style="margin-top:10px"><span class="badge ' + (lulus ? "pass" : "fail") + '">' + (lulus ? "✔ Di atas" : "✖ Di bawah") + ' passing grade (perkiraan)</span></div></div></div></div>';

    html += '<div class="kartu" style="margin-top:14px"><h3 class="kartu-judul">📊 Skor per topik</h3>' +
      '<table class="skor"><tr><th>Topik</th><th>Skor</th><th></th></tr>';
    var topikSorted = Object.keys(h.perTopik).map(function (t) {
      var d = h.perTopik[t];
      return { t: t, pct: d.maks ? Math.round(d.skor / d.maks * 1000) / 10 : 0 };
    }).sort(function (a, b) { return b.pct - a.pct; });
    topikSorted.forEach(function (r) {
      html += '<tr><td>' + (IKON_TOPIK[r.t] || "📚") + ' ' + esc(r.t) + '</td><td>' + r.pct + '%</td>' +
        '<td><div class="bar"><span style="width:' + Math.min(100, r.pct) + '%"></span></div></td></tr>';
    });
    html += '</table>';
    var lemah = topikSorted.slice(-Math.min(2, topikSorted.length)).reverse();
    html += '<div class="bahas"><b>Topik terlemah:</b> ' + lemah.map(function (r) { return esc(r.t) + " (" + r.pct + "%)"; }).join(", ") +
      '. Pelajari ulang, lalu latih lewat <b>Daftar Tes → Mode Latihan</b> yang difilter per topik.</div></div>';

    html += '<div class="kartu" style="margin-top:14px"><h3 class="kartu-judul">🔍 Review soal</h3>' +
      '<div class="filter-row"><label><input type="checkbox" id="rv-salah"> Tampilkan yang salah saja</label></div>' +
      '<div id="review">' + reviewHtml(false) + '</div></div>';
    html += '<p style="margin-top:14px"><button class="btn ghost" data-menu="dashboard">← Dashboard</button> ' +
      '<button class="btn" data-menu="tes">Daftar Tes</button> ' +
      '<button class="btn" data-menu="riwayat">Riwayat</button></p>';
    html += '</div>';
    setScreen(html);
    document.getElementById("rv-salah").onchange = function () {
      document.getElementById("review").innerHTML = reviewHtml(this.checked);
    };
    isiRing(); hitungNaik();
    if (lulus) confetti();
  }
  function reviewHtml(salahSaja) {
    var html = "";
    S.soal.forEach(function (soal, i) {
      var j = S.jawab[i];
      var benar = j != null && j === soal.ans;
      if (salahSaja && benar) return;
      var jmlh = soal.skor ? " (nilai " + (j != null ? soal.skor[j] : 0) + "/" + skorMaksSoal(soal) + ")" : "";
      html += '<div class="review-item"><div class="q-topik">' + (i + 1) + '. ' + esc(soal.topik) + '</div>' +
        '<div class="q-text">' + soal.q + '</div>' +
        '<div>Jawabanmu: <b>' + (j != null ? String.fromCharCode(65 + j) + jmlh : "— (kosong)") + '</b> · ' +
        'Kunci: <b>' + String.fromCharCode(65 + soal.ans) + '</b> <span class="status ' + (benar ? "ok" : "no") + '">' +
        (soal.skor ? "" : (benar ? "✓ benar" : "✗ salah")) + '</span></div>' +
        '<div class="bahas">' + soal.bahas + '</div></div>';
    });
    return html || '<p class="empty">Tidak ada soal yang ditampilkan.</p>';
  }

  // ---------- render ulang (ganti tema) ----------
  function renderUlang() {
    if (S && !S.selesai) { renderExam(); return; }
    if (S && S.selesai && HASIL) { renderHasil(HASIL.h, HASIL.otomatis); return; }
    bukaHalaman(HALAMAN.nama, HALAMAN.arg);
  }
  function bukaHalaman(nama, arg) {
    if (nama === "tes") renderTes();
    else if (nama === "panduan-polri") renderPanduanHal("polri");
    else if (nama === "panduan-bumn") renderPanduanHal("bumn");
    else if (nama === "riwayat") renderRiwayatHal();
    else renderHome();
  }

  // ---------- event ----------
  app.addEventListener("click", function (e) {
    var el = e.target.closest("[data-tema-toggle],[data-menu],[data-start],[data-nav],[data-goto],[data-opt],[data-flag],[data-finish]");
    if (!el) return;
    if (el.hasAttribute("data-tema-toggle")) {
      setTema(tema() === "gelap" ? "terang" : "gelap");
      renderUlang();
    } else if (el.dataset.menu) {
      if (S && S.mode === "ujian" && !S.selesai && !confirm("Ujian sedang berjalan. Yakin keluar? Progres tidak tersimpan.")) return;
      bukaHalaman(el.dataset.menu);
    } else if (el.dataset.start) {
      if (el.dataset.mode === "ujian") startUjian(el.dataset.start);
      else renderLatihanSetup(el.dataset.start);
    } else if (el.dataset.nav) {
      if (S.mode === "latihan" && S.cur === S.soal.length - 1 && el.dataset.nav > 0) // latihan tanpa akhir
        S.soal = S.soal.concat(GEN.lagi(topikLatihan(), 10).map(shuffleOpts));
      S.cur = Math.min(S.soal.length - 1, Math.max(0, S.cur + Number(el.dataset.nav)));
      renderExam();
    } else if (el.dataset.goto) {
      S.cur = Number(el.dataset.goto); renderExam();
    } else if (el.dataset.opt) {
      var j = Number(el.dataset.opt), i = S.cur;
      if (S.mode === "ujian") {
        S.jawab[i] = S.jawab[i] === j ? null : j;
        renderExam();
      } else {
        S.revealed[i] = j; renderExam();
      }
    } else if (el.hasAttribute("data-flag")) {
      S.ragu[S.cur] = !S.ragu[S.cur]; renderExam();
    } else if (el.hasAttribute("data-finish")) {
      var belum = S.jawab.filter(function (x) { return x == null; }).length;
      var ragu = S.ragu.filter(Boolean).length;
      if (confirm("Selesaikan ujian?\nBelum dijawab: " + belum + " soal\nRagu-ragu: " + ragu + " soal")) finish(false);
    }
  });

  window.addEventListener("beforeunload", function (e) {
    if (S && S.mode === "ujian" && !S.selesai) { e.preventDefault(); e.returnValue = ""; }
  });

  renderHome();
})();
