// Generator soal tak terhingga. Dipakai app vanilla (window.GEN) dan web (import).
// Tiap entri: [level, fungsi] -> {q, opts, ans, bahas}. Kunci dan pembahasan dihitung dari
// nilai yang sama, jadi selalu cocok. Level: 1 mudah, 2 sedang, 3 sulit.
(function () {
  "use strict";
  const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pick = (a) => a[rnd(0, a.length - 1)];
  const mix = (a) => a.map((x) => [Math.random(), x]).sort((p, q) => p[0] - q[0]).map((p) => p[1]);
  const ribu = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const rp = (n) => "Rp" + ribu(n);
  const des = (x) => String(x).replace(".", ",");
  const gcd = (a, b) => (b ? gcd(b, a % b) : a);
  const frac = (n, d) => { const g = gcd(n, d); return d / g === 1 ? String(n / g) : n / g + "/" + d / g; };
  const fakt = (n) => (n <= 1 ? 1 : n * fakt(n - 1));
  const komb = (n, r) => fakt(n) / (fakt(r) * fakt(n - r));
  const perm = (n, r) => fakt(n) / fakt(n - r);

  // 5 opsi unik: jawaban benar + pengecoh (diacak). f memformat angka jadi teks.
  function opsi(benar, salah, f, tetap) { // tetap: pengecoh dipakai berurutan (tanpa diacak)
    f = f || String;
    const s = [f(benar)];
    (tetap ? salah : mix(salah)).forEach((x) => { const t = f(x); if (s.length < 5 && !s.includes(t)) s.push(t); });
    if (typeof benar === "number") {
      const step = Math.max(1, Math.round(Math.abs(benar) * 0.1));
      for (let k = 1; s.length < 5 && k < 60; k++) {
        [benar + k * step, benar - k * step].forEach((x) => {
          const t = f(x);
          if (s.length < 5 && (benar < 0 || x >= 0) && !s.includes(t)) s.push(t);
        });
      }
    }
    const o = mix(s);
    return { opts: o, ans: o.indexOf(f(benar)) };
  }
  const soal = (q, bahas, o) => Object.assign({ q: q, bahas: bahas }, o);
  const sup = (b, e) => b + "<sup>" + e + "</sup>";
  const persen = (x) => x + "%";

  const G = {};

  // ================= NUMERIK (TKD, TIU Numerik) =================
  G.Numerik = [
    [1, () => {
      const p = pick([10, 20, 25, 30, 40, 50, 60, 75]), N = rnd(2, 40) * 20, a = p * N / 100;
      return soal(`${p}% dari ${N} adalah...`, `${p}% × ${N} = ${p}/100 × ${N} = ${a}.`,
        opsi(a, [a * 2, a + 10, a - 10, N - a, a + p]));
    }],
    [1, () => {
      const a = rnd(2, 30), d = pick([2, 3, 4, 5, 6, 7, 8, 9, 11, 12]), t = [0, 1, 2, 3, 4].map((i) => a + i * d), r = t[4] + d;
      return soal(`Deret: ${t.join(", ")}, ...`, `Beda tiap suku = ${d}. Suku berikutnya = ${t[4]} + ${d} = ${r}.`,
        opsi(r, [r + d, r - d, r + 1, r - 1, t[4] + 2 * d]));
    }],
    [1, () => {
      const m = rnd(60, 90), o = [rnd(-12, 12), rnd(-12, 12), rnd(-12, 12)];
      const v = o.map((x) => m + x).concat(m - o[0] - o[1] - o[2]), jml = v.reduce((p, q) => p + q, 0);
      return soal(`Rata-rata dari ${v.join(", ")} adalah...`, `Jumlah = ${jml}; rata-rata = ${jml}/4 = ${m}.`,
        opsi(m, [m + 1, m - 1, m + 2, m - 2, m + 5]));
    }],
    [1, () => {
      const a = rnd(10, 50), b = rnd(2, 9), c = rnd(2, 9), d = rnd(1, 30), r = a + b * c - d;
      return soal(`Hasil dari ${a} + ${b} × ${c} − ${d} adalah...`,
        `Kali dahulu: ${b} × ${c} = ${b * c}. Lalu ${a} + ${b * c} − ${d} = ${r}.`,
        opsi(r, [(a + b) * c - d, a + b * (c - d), a + b * c + d, a - b * c + d, r + 10]));
    }],
    [1, () => {
      const N = pick([100000, 200000, 250000, 500000, 1000000]), d = rnd(2, 20) * 2, km = d * N / 100000;
      return soal(`Pada peta berskala 1 : ${String(N).replace(/\B(?=(\d{3})+(?!\d))/g, ".")}, jarak dua kota di peta ${d} cm. Jarak sebenarnya (km)...`,
        `${d} cm × ${N} = ${d * N} cm = ${km} km (100.000 cm = 1 km).`, opsi(km, [km * 10, km / 10 + 1, km * 2, km + 5, d]));
    }],
    [2, () => {
      const H = rnd(20, 200) * 500, p = pick([10, 20, 25, 30, 40, 50]), u = H * p / 100;
      if (Math.random() < 0.5)
        return soal(`Barang dibeli seharga ${rp(H)} lalu dijual ${rp(H + u)}. Persentase keuntungan...`,
          `Untung = ${rp(H + u)} − ${rp(H)} = ${rp(u)}. Persen untung = ${u}/${H} × 100% = ${p}%.`,
          opsi(p, [p + 5, p - 5, p + 10, p * 2, Math.round(u / (H + u) * 100)], persen));
      return soal(`Barang dibeli seharga ${rp(H)} lalu dijual rugi ${p}%. Harga jualnya...`,
        `Rugi = ${p}% × ${rp(H)} = ${rp(u)}. Harga jual = ${rp(H)} − ${rp(u)} = ${rp(H - u)}.`,
        opsi(H - u, [H + u, H - 2 * u, u, H - u + 500, H - u - 500], rp));
    }],
    [2, () => {
      const H = rnd(2, 50) * 10000, d = pick([10, 20, 25, 30, 40, 50]), b = H * (100 - d) / 100;
      return soal(`Sebuah sepatu berharga ${rp(H)} didiskon ${d}%. Harga yang harus dibayar...`,
        `Diskon = ${d}% × ${rp(H)} = ${rp(H * d / 100)}. Bayar = ${rp(H)} − ${rp(H * d / 100)} = ${rp(b)}.`,
        opsi(b, [H * d / 100, b + 10000, b - 10000, H - d * 100, b + 5000], rp));
    }],
    [2, () => {
      let m = rnd(1, 9), n = rnd(1, 9);
      while (m === n) n = rnd(1, 9);
      const k = rnd(2, 20) * 1000, J = (m + n) * k;
      return soal(`Uang A dan B berbanding ${m} : ${n}. Jumlah uang mereka ${rp(J)}. Uang B adalah...`,
        `Total bagian = ${m} + ${n} = ${m + n}. Satu bagian = ${rp(J)}/${m + n} = ${rp(k)}. Uang B = ${n} × ${rp(k)} = ${rp(n * k)}.`,
        opsi(n * k, [m * k, J - n * k + k, (n + 1) * k, (m + n) * k - k, (n - 1) * k], rp));
    }],
    [2, () => {
      const x = rnd(2, 5), c = rnd(5, 15), S = (x + 1) * c, y = rnd(2, 8);
      return soal(`Usia ayah ${x} kali usia anaknya. Jumlah usia mereka ${S} tahun. Usia anak ${y} tahun lagi adalah...`,
        `Anak = ${S}/${x + 1} = ${c} tahun. ${y} tahun lagi = ${c} + ${y} = ${c + y} tahun.`,
        opsi(c + y, [c, c - y, x * c + y, c + 2 * y, S - c], (v) => v + " tahun"));
    }],
    [2, () => {
      const v = pick([40, 48, 60, 72, 80]), h = rnd(1, 4), m = pick([15, 30, 45]), s = v * h + v * m / 60;
      return soal(`Sebuah mobil melaju ${v} km/jam selama ${h} jam ${m} menit. Jarak yang ditempuh (km)...`,
        `${m} menit = ${m}/60 jam. Jarak = ${v} × (${h} + ${m}/60) = ${v * h} + ${v * m / 60} = ${s} km.`,
        opsi(s, [v * (h + 1), v * h, s + v / 4, s - v / 4, v * h + m]));
    }],
    [2, () => {
      const a = pick([1, 2, 3, 5]), r = pick([2, 3]), t = [0, 1, 2, 3].map((i) => a * Math.pow(r, i)), n = t[3] * r;
      return soal(`Deret: ${t.join(", ")}, ...`, `Tiap suku dikali ${r}. Suku berikutnya = ${t[3]} × ${r} = ${n}.`,
        opsi(n, [t[3] + t[2], t[3] + a, n + r, n - r, t[3] * (r + 1)]));
    }],
    [2, () => {
      const a = rnd(1, 9), d0 = rnd(1, 4), e = rnd(1, 3), t = [a];
      for (let i = 0; i < 5; i++) t.push(t[i] + d0 + i * e);
      const sel = t.slice(1).map((v, i) => v - t[i]);
      return soal(`Deret: ${t.slice(0, 5).join(", ")}, ...`,
        `Selisih antarsuku: ${sel.slice(0, 4).join(", ")} (bertambah ${e}). Selisih berikutnya ${sel[4]}. Suku berikutnya = ${t[4]} + ${sel[4]} = ${t[5]}.`,
        opsi(t[5], [t[4] + sel[3], t[4] + sel[4] + 1, t[4] + sel[4] - 1, t[4] + d0, t[5] + e]));
    }],
    [2, () => {
      let n, m, w, ds;
      for (;;) {
        n = rnd(3, 12); m = rnd(4, 20); w = n * m;
        ds = []; for (let d = 2; d <= 30; d++) if (w % d === 0 && d !== n) ds.push(d);
        if (ds.length) break;
      }
      const n2 = pick(ds), r = w / n2;
      return soal(`${n} orang menyelesaikan suatu pekerjaan dalam ${m} hari. Jika dikerjakan ${n2} orang dengan kecepatan sama, selesai dalam... hari`,
        `Pekerjaan = ${n} × ${m} = ${w} orang-hari. ${w} / ${n2} = ${r} hari.`,
        opsi(r, [m, n2, m + (n2 - n), Math.round(w / n2) + 2, r * 2], (v) => v + " hari"));
    }],
    [2, () => {
      const M = rnd(1, 50) * 100000, p = pick([4, 6, 8, 10, 12]), t = pick([6, 12, 18, 24]), b = M * p * t / 1200;
      return soal(`Ani menabung ${rp(M)} dengan bunga tunggal ${p}% per tahun. Bunga setelah ${t} bulan...`,
        `Bunga = ${rp(M)} × ${p}% × ${t}/12 = ${rp(b)}.`,
        opsi(b, [M * p / 100, b * 2, b / 2, b + M / 100, M * p * t / 100], rp));
    }],
    [2, () => {
      let x, y, p1, p2, tot;
      for (;;) {
        x = rnd(1, 5) * 10; y = rnd(1, 5) * 10; p1 = rnd(5, 9) * 1000; p2 = rnd(10, 15) * 1000;
        tot = x * p1 + y * p2;
        if (tot % (x + y) === 0) break;
      }
      const h = tot / (x + y);
      return soal(`Pedagang mencampur ${x} kg beras seharga ${rp(p1)}/kg dengan ${y} kg beras seharga ${rp(p2)}/kg. Harga campuran per kg agar impas...`,
        `Total biaya = ${x}×${p1} + ${y}×${p2} = ${rp(tot)}. Total berat ${x + y} kg. Harga per kg = ${rp(tot)}/${x + y} = ${rp(h)}.`,
        opsi(h, [(p1 + p2) / 2, h + 500, h - 500, h + 1000, h - 1000], rp));
    }],
    [3, () => {
      const H = rnd(1, 20) * 10000, d1 = pick([10, 20, 25, 30, 40, 50]), d2 = pick([10, 20, 25, 30, 40, 50]);
      const b = H * (100 - d1) * (100 - d2) / 10000, naif = H * (100 - d1 - d2) / 100;
      return soal(`Harga sebuah tas ${rp(H)}. Toko memberi diskon ${d1}%, lalu diskon tambahan ${d2}% dari harga setelah diskon pertama. Harga akhir...`,
        `Setelah diskon ${d1}%: ${rp(H * (100 - d1) / 100)}. Diskon ${d2}% lagi: ${rp(H * (100 - d1) / 100)} × ${100 - d2}% = ${rp(b)}.`,
        opsi(b, [naif, H * (100 - d1) / 100, b + 5000, b - 5000, H * (100 - d2) / 100], rp));
    }],
    [3, () => {
      const v1 = rnd(4, 9) * 10, v2 = rnd(4, 9) * 10, t = rnd(2, 5), D = t * (v1 + v2);
      return soal(`Dua kota berjarak ${D} km. Mobil A dari kota pertama dengan ${v1} km/jam dan mobil B dari kota kedua dengan ${v2} km/jam, berangkat bersamaan berlawanan arah. Bertemu setelah... jam`,
        `Kecepatan gabungan = ${v1} + ${v2} = ${v1 + v2} km/jam. Waktu = ${D}/${v1 + v2} = ${t} jam.`,
        opsi(t, [t + 1, t - 1, t + 2, Math.max(1, t - 2), t * 2], (v) => v + " jam"));
    }],
    [3, () => {
      let a, b;
      do { a = rnd(4, 30); b = rnd(4, 30); } while (a === b || (a * b) % (a + b) !== 0);
      const t = a * b / (a + b);
      return soal(`A dapat menyelesaikan suatu pekerjaan sendirian dalam ${a} hari, B dalam ${b} hari. Jika bekerja bersama, selesai dalam... hari`,
        `Laju gabungan = 1/${a} + 1/${b} = ${a + b}/${a * b} per hari. Waktu = ${a * b}/${a + b} = ${t} hari.`,
        opsi(t, [(a + b) / 2, a, b, t + 1, t - 1, Math.abs(a - b)], (v) => des(v) + " hari"));
    }],
    [3, () => {
      let v1, v2;
      do { v1 = rnd(2, 12) * 10; v2 = rnd(2, 12) * 10; } while (v1 === v2 || (2 * v1 * v2) % (v1 + v2) !== 0);
      const r = 2 * v1 * v2 / (v1 + v2);
      return soal(`Seorang pengendara pergi dengan kecepatan ${v1} km/jam dan pulang lewat jalan yang sama dengan ${v2} km/jam. Kecepatan rata-rata seluruh perjalanan (km/jam)...`,
        `Misal jarak sekali jalan s. Waktu total = s/${v1} + s/${v2}. Kecepatan rata-rata = 2s / waktu = 2×${v1}×${v2}/(${v1}+${v2}) = ${r}. (Bukan rata-rata hitung ${(v1 + v2) / 2}.)`,
        opsi(r, [(v1 + v2) / 2, r + 2, r - 2, Math.sqrt(v1 * v2) | 0, r + 5]));
    }],
    [3, () => {
      const a = rnd(2, 15), d = rnd(2, 6), b = rnd(1, 4), r = pick([2, 3]);
      const odd = [0, 1, 2, 3].map((i) => a + i * d), ev = [0, 1, 2, 3].map((i) => b * Math.pow(r, i));
      const t = [odd[0], ev[0], odd[1], ev[1], odd[2], ev[2], odd[3]], n = ev[3];
      return soal(`Deret: ${t.join(", ")}, ...`,
        `Dua pola selang-seling. Posisi ganjil (${odd.join(", ")}) bertambah ${d}; posisi genap (${ev.slice(0, 3).join(", ")}) dikali ${r}. Suku berikutnya = ${ev[2]} × ${r} = ${n}.`,
        opsi(n, [odd[3] + d, ev[2] + d, n + r, n - r, ev[2] * (r + 1)]));
    }],
    [3, () => {
      const b = rnd(10, 20), x = rnd(2, 5), m = pick([2, 3]);
      if (b - x <= 0) return G.Numerik[0][1]();
      const a = m * (b - x) + x, S = a + b;
      return soal(`Jumlah usia A dan B sekarang ${S} tahun. ${x} tahun lalu usia A tepat ${m} kali usia B. Usia A sekarang...`,
        `Misal B sekarang b. ${x} tahun lalu: A − ${x} = ${m}(b − ${x}). Dengan A = ${S} − b: ${S} − b − ${x} = ${m}b − ${m * x} ⇒ ${m + 1}b = ${S + (m - 1) * x} ⇒ b = ${b}. Maka A = ${S} − ${b} = ${a} tahun.`,
        opsi(a, [b, a + x, a - x, m * b, S - a + x], (v) => v + " tahun"));
    }]
  ];

  // ================= MATEMATIKA (Akpol) =================
  G.Matematika = [
    [1, () => {
      const x = rnd(2, 15), a = rnd(2, 9), b = rnd(1, 20), c = a * x + b;
      return soal(`Nilai x yang memenuhi ${a}x + ${b} = ${c} adalah...`, `${a}x = ${c} − ${b} = ${c - b}; x = ${c - b}/${a} = ${x}.`,
        opsi(x, [x + 1, x - 1, c - b, a, x + 2]));
    }],
    [1, () => {
      const base = pick([2, 2, 3, 5]), e = rnd(2, { 2: 10, 3: 6, 5: 4 }[base]), c = rnd(1, 3), a = rnd(1, e), b = e + c - a, v = Math.pow(base, e);
      return soal(`Hasil dari ${sup(base, a)} × ${sup(base, b)} ÷ ${sup(base, c)} adalah...`,
        `Pangkat: ${a} + ${b} − ${c} = ${e}. Jadi ${sup(base, e)} = ${v}.`,
        opsi(v, [v * base, v / base, Math.pow(base, a + b), v + base, Math.pow(base, a * b - c)]));
    }],
    [1, () => {
      const p = rnd(3, 12), l = rnd(2, 10), t = rnd(2, 9), V = p * l * t;
      return soal(`Sebuah balok berukuran ${p} cm × ${l} cm × ${t} cm. Volumenya (cm³)...`, `V = p × l × t = ${p} × ${l} × ${t} = ${V} cm³.`,
        opsi(V, [2 * (p * l + p * t + l * t), p + l + t, V + p * l, V - t, p * l]));
    }],
    [1, () => {
      const [a, b, c] = pick([[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25]]), k = rnd(1, 4);
      return soal(`Segitiga siku-siku memiliki sisi tegak ${a * k} cm dan ${b * k} cm. Panjang sisi miringnya (cm)...`,
        `c² = ${a * k}² + ${b * k}² = ${a * a * k * k} + ${b * b * k * k} = ${c * c * k * k}; c = ${c * k}.`,
        opsi(c * k, [a * k + b * k, c * k + 1, c * k - 1, (a + b) * k - 1, b * k + 1]));
    }],
    [1, () => {
      const v = mix([...Array(30).keys()].map((i) => i + 1)).slice(0, 7), s = v.slice().sort((p, q) => p - q);
      return soal(`Median dari data: ${v.join(", ")} adalah...`, `Urutkan: ${s.join(", ")}. Data ke-4 dari 7 adalah ${s[3]}.`,
        opsi(s[3], [s[2], s[4], v[3], Math.round(v.reduce((p, q) => p + q, 0) / 7), s[3] + 1]));
    }],
    [2, () => {
      const f = [["sin 30°", 0.5], ["cos 60°", 0.5], ["tan 45°", 1], ["sin 90°", 1], ["cos 0°", 1], ["cos 90°", 0], ["sin 0°", 0]];
      const [x, y] = mix(f).slice(0, 2), p = rnd(2, 6), q = rnd(2, 6), r = p * x[1] + q * y[1];
      return soal(`Nilai dari ${p} ${x[0]} + ${q} ${y[0]} adalah...`,
        `${x[0]} = ${des(x[1])} dan ${y[0]} = ${des(y[1])}. Maka ${p}×${des(x[1])} + ${q}×${des(y[1])} = ${des(r)}.`,
        opsi(r, [r + 0.5, r - 0.5, r + 1, r - 1, p + q], des));
    }],
    [2, () => {
      let x = rnd(3, 15), y = rnd(2, 12);
      if (x === y) x++;
      if (x < y) [x, y] = [y, x];
      const S = x + y, D = x - y;
      return soal(`Diketahui x + y = ${S} dan x − y = ${D}. Nilai x · y adalah...`,
        `Jumlahkan: 2x = ${S + D} ⇒ x = ${x}. Maka y = ${S} − ${x} = ${y}. x·y = ${x} × ${y} = ${x * y}.`,
        opsi(x * y, [x + y, x * y + x, x * y - y, S * D, x * x]));
    }],
    [2, () => {
      let p = rnd(1, 9), q = rnd(1, 9);
      if (p === q) p++;
      const S = p + q, P = p * q, mx = Math.max(p, q);
      return soal(`Akar terbesar dari persamaan x² − ${S}x + ${P} = 0 adalah...`,
        `Faktorkan: (x − ${p})(x − ${q}) = 0 karena ${p} + ${q} = ${S} dan ${p} × ${q} = ${P}. Akar terbesar = ${mx}.`,
        opsi(mx, [Math.min(p, q), S, P, mx + 1, mx - 1]));
    }],
    [2, () => {
      const r = rnd(2, 8), b = rnd(2, 8), h = rnd(2, 8), T = r + b + h;
      return soal(`Sebuah kotak berisi ${r} bola merah, ${b} bola biru, dan ${h} bola hijau. Satu bola diambil acak. Peluang terambil bola merah...`,
        `Peluang = banyak merah / semua bola = ${r}/${T} = ${frac(r, T)}.`,
        opsi(frac(r, T), [frac(r, b + h), frac(b, T), frac(r, T + 1), frac(T - r, T), frac(r + 1, T), frac(r + 2, T), frac(r, T + 2), frac(1, T), frac(r - 1, T)].filter((v) => v !== frac(r, T))));
    }],
    [2, () => {
      const n = rnd(5, 10), r = rnd(2, 4);
      if (Math.random() < 0.5)
        return soal(`Dari ${n} siswa akan dipilih ${r} siswa untuk mengikuti lomba (tanpa memperhatikan urutan). Banyak cara pemilihan...`,
          `Kombinasi C(${n},${r}) = ${n}!/(${r}! × ${n - r}!) = ${komb(n, r)}.`, opsi(komb(n, r), [perm(n, r), n * r, komb(n, r) + n, komb(n + 1, r), komb(n, r - 1)]));
      return soal(`Dari ${n} orang dipilih ${r} orang untuk menjabat ${r} jabatan berbeda. Banyak susunan pengurus...`,
        `Permutasi P(${n},${r}) = ${n}!/${n - r}! = ${perm(n, r)}.`, opsi(perm(n, r), [komb(n, r), n * r, Math.pow(n, r), perm(n, r) + n, perm(n + 1, r)]));
    }],
    [2, () => {
      const k = rnd(1, 4), L = Math.random() < 0.5;
      const r = 7 * k, v = L ? 154 * k * k : 44 * k;
      return soal(`Sebuah lingkaran berjari-jari ${r} cm. ${L ? "Luasnya" : "Kelilingnya"} (π = 22/7) adalah... cm${L ? "²" : ""}`,
        L ? `Luas = π r² = 22/7 × ${r} × ${r} = ${v}.` : `Keliling = 2πr = 2 × 22/7 × ${r} = ${v}.`,
        opsi(v, L ? [44 * k, 308 * k * k, 154 * k, v + 22, 22 * k * k] : [154 * k * k, 22 * k, 88 * k, v + 7, 14 * k]));
    }],
    [2, () => {
      const a = rnd(2, 10), b = rnd(2, 6), n = rnd(8, 15), u = a + (n - 1) * b;
      return soal(`Barisan aritmetika: ${a}, ${a + b}, ${a + 2 * b}, ... Suku ke-${n} adalah...`, `U${n} = a + (n−1)b = ${a} + ${n - 1}×${b} = ${u}.`,
        opsi(u, [a + n * b, u - b, u + b, a + (n - 2) * b, a * n]));
    }],
    [2, () => {
      const a = rnd(2, 6), b = rnd(1, 9), k = rnd(2, 7), v = a * k + b;
      return soal(`Diketahui f(x) = ${a}x + ${b}. Nilai f(${k}) adalah...`, `f(${k}) = ${a}×${k} + ${b} = ${v}.`,
        opsi(v, [a + k + b, a * (k + b), v - 2 * b, a * k - b, v + a]));
    }],
    [2, () => {
      const b = pick([2, 3]), mx = b === 2 ? 5 : 4, m = rnd(1, mx), n = rnd(1, mx), k = rnd(0, 2), r = m + n - k;
      return soal(`Nilai dari <sup>${b}</sup>log ${Math.pow(b, m)} + <sup>${b}</sup>log ${Math.pow(b, n)} − <sup>${b}</sup>log ${Math.pow(b, k)} adalah...`,
        `<sup>${b}</sup>log ${Math.pow(b, m)} = ${m}, <sup>${b}</sup>log ${Math.pow(b, n)} = ${n}, <sup>${b}</sup>log ${Math.pow(b, k)} = ${k}. Hasil = ${m} + ${n} − ${k} = ${r}.`,
        opsi(r, [m + n + k, m * n - k, r + 1, r - 1, m + n]));
    }],
    [3, () => {
      let p = rnd(1, 9), q = rnd(1, 9);
      if (p === q) p++;
      const S = p + q, P = p * q, r = S * S - 2 * P;
      return soal(`Jika x₁ dan x₂ akar-akar persamaan x² − ${S}x + ${P} = 0, maka x₁² + x₂² = ...`,
        `x₁ + x₂ = ${S}, x₁x₂ = ${P}. x₁² + x₂² = (x₁ + x₂)² − 2x₁x₂ = ${S * S} − ${2 * P} = ${r}.`,
        opsi(r, [S * S - P, S * S + 2 * P, S * S, S * S - 4 * P, 2 * S - P]));
    }],
    [3, () => {
      const r = rnd(2, 7), b = rnd(2, 6), h = rnd(1, 5), T = r + b + h;
      return soal(`Kotak berisi ${r} bola merah, ${b} biru, dan ${h} hijau. Dua bola diambil berturut-turut tanpa pengembalian. Peluang keduanya merah...`,
        `Peluang = ${r}/${T} × ${r - 1}/${T - 1} = ${r * (r - 1)}/${T * (T - 1)} = ${frac(r * (r - 1), T * (T - 1))}.`,
        opsi(frac(r * (r - 1), T * (T - 1)), [frac(r * r, T * T), frac(2 * r, T), frac(r - 1, T - 1), frac(r * (r - 1), T * T), frac(r, T), frac(r + 1, T), frac(r * (r + 1), T * (T + 1)), frac(r - 1, T)].filter((v) => v !== frac(r * (r - 1), T * (T - 1)))));
    }],
    [3, () => {
      const w = pick(["KAKAK", "BANANA", "MATAHARI", "SASARAN", "TETES", "KALAKA", "MAMA", "AYAH"]), c = {};
      w.split("").forEach((ch) => { c[ch] = (c[ch] || 0) + 1; });
      const pembagi = Object.values(c).reduce((p, q) => p * fakt(q), 1), r = fakt(w.length) / pembagi;
      const rep = Object.keys(c).filter((k) => c[k] > 1).map((k) => `${k} ada ${c[k]}`).join(", ");
      return soal(`Banyak susunan huruf berbeda yang dapat dibentuk dari semua huruf kata <b>${w}</b> adalah...`,
        `Ada ${w.length} huruf; huruf berulang: ${rep}. Susunan = ${w.length}!/${Object.values(c).filter((v) => v > 1).map((v) => v + "!").join(" × ")} = ${fakt(w.length)}/${pembagi} = ${r}.`,
        opsi(r, [fakt(w.length), r * 2, r / 2, fakt(w.length) / 2, r + w.length]));
    }],
    [3, () => {
      const a = rnd(2, 5), b = rnd(1, 9), c = rnd(1, 6), k = rnd(2, 5), v = a * (k * k - c) + b;
      return soal(`Diketahui f(x) = ${a}x + ${b} dan g(x) = x² − ${c}. Nilai (f ∘ g)(${k}) adalah...`,
        `g(${k}) = ${k}² − ${c} = ${k * k - c}. f(g(${k})) = ${a}×${k * k - c} + ${b} = ${v}.`,
        opsi(v, [a * k + b, (a * k + b) * (a * k + b) - c, a * (k * k - c), v - b + a, k * k - c + b]));
    }],
    [3, () => {
      const a = rnd(1, 5), b = rnd(1, 6), c = rnd(1, 9), k = rnd(1, 3), v = 3 * a * k * k + 2 * b * k + c;
      return soal(`Jika f(x) = ${a}x³ + ${b}x² + ${c}x + 7, maka f′(${k}) = ...`,
        `f′(x) = ${3 * a}x² + ${2 * b}x + ${c}. f′(${k}) = ${3 * a}×${k * k} + ${2 * b}×${k} + ${c} = ${v}.`,
        opsi(v, [a * k * k * k + b * k * k + c * k + 7, 3 * a * k + 2 * b + c, v + 7, v - c, 3 * a * k * k + 2 * b * k]));
    }],
    [3, () => {
      const a = rnd(2, 9), b = rnd(2, 6), n = 2 * rnd(3, 6), s = n / 2 * (2 * a + (n - 1) * b);
      return soal(`Deret aritmetika: ${a} + ${a + b} + ${a + 2 * b} + ... Jumlah ${n} suku pertama adalah...`,
        `S${n} = n/2 × (2a + (n−1)b) = ${n / 2} × (${2 * a} + ${(n - 1) * b}) = ${s}.`,
        opsi(s, [n * (a + (n - 1) * b), s + n, s - n, n / 2 * (a + (n - 1) * b), s + a]));
    }]
  ];

  // ================= LOGIKA =================
  const NOUN = ["atlet", "pegawai", "penulis", "guru", "dokter", "penari", "perawat", "pelaut", "petani", "musisi", "pengacara", "mahasiswa"];
  const NAMA = ["Andi", "Budi", "Citra", "Dewi", "Eko", "Fajar", "Gita", "Hadi", "Indra", "Joko"];
  const KUAD = [ // [p, q, bukan p, bukan q]
    ["hujan turun", "jalanan basah", "hujan tidak turun", "jalanan tidak basah"],
    ["Rina rajin belajar", "Rina lulus ujian", "Rina tidak rajin belajar", "Rina tidak lulus ujian"],
    ["lampu merah menyala", "kendaraan berhenti", "lampu merah tidak menyala", "kendaraan tidak berhenti"],
    ["harga BBM naik", "ongkos angkutan naik", "harga BBM tidak naik", "ongkos angkutan tidak naik"],
    ["baterai terisi penuh", "ponsel menyala", "baterai tidak terisi penuh", "ponsel tidak menyala"],
    ["Budi berlatih setiap hari", "Budi menjadi juara", "Budi tidak berlatih setiap hari", "Budi tidak menjadi juara"],
    ["pemerintah menaikkan gaji", "daya beli pegawai meningkat", "pemerintah tidak menaikkan gaji", "daya beli pegawai tidak meningkat"],
    ["tanggul jebol", "desa terendam", "tanggul tidak jebol", "desa tidak terendam"]
  ];
  const cap = (s) => s[0].toUpperCase() + s.slice(1);
  const TDS = "Tidak dapat disimpulkan";
  const SIFAT = [
    ["lebih tinggi dari", "lebih pendek dari", "paling tinggi", "paling pendek"],
    ["lebih berat dari", "lebih ringan dari", "paling berat", "paling ringan"],
    ["lebih tua dari", "lebih muda dari", "paling tua", "paling muda"],
    ["lebih cepat dari", "lebih lambat dari", "paling cepat", "paling lambat"]
  ];
  const PERM5 = [];
  (function ph(a, sisa) { if (!sisa.length) PERM5.push(a); else sisa.forEach((x, i) => ph(a.concat(x), sisa.slice(0, i).concat(sisa.slice(i + 1)))); })([], [0, 1, 2, 3, 4]);

  G.Logika = [
    [1, () => {
      const [x, y, z] = mix(NOUN).slice(0, 3);
      return soal(`Semua ${x} adalah ${y}. Semua ${y} adalah ${z}. Kesimpulan yang pasti benar adalah...`,
        `${x} termasuk ${y}, dan ${y} termasuk ${z} (transitif). Jadi: Semua ${x} adalah ${z}.`,
        opsi(`Semua ${x} adalah ${z}`, [`Semua ${z} adalah ${x}`, `Semua ${z} adalah ${y}`, `Tidak ada ${x} yang ${z}`, `Sebagian ${x} bukan ${z}`]));
    }],
    [1, () => {
      const [p, q, np, nq] = pick(KUAD);
      return soal(`Jika ${p}, maka ${q}. ${cap(p)}. Kesimpulan yang tepat...`,
        `Modus ponens: premis "jika p maka q" dan p benar, maka q benar. Kesimpulan: ${cap(q)}.`,
        opsi(cap(q), [cap(nq), cap(np), TDS, `${cap(p)} tetapi ${nq}`]));
    }],
    [2, () => {
      const [p, q, np, nq] = pick(KUAD);
      return soal(`Jika ${p}, maka ${q}. ${cap(nq)}. Kesimpulan yang tepat...`,
        `Modus tollens: "jika p maka q" dan q tidak terjadi, maka p juga tidak terjadi. Kesimpulan: ${cap(np)}.`,
        opsi(cap(np), [cap(p), cap(q), TDS, `${cap(p)} dan ${q}`]));
    }],
    [2, () => {
      const nm = mix(NAMA).slice(0, 5), [kt, kk, tert, terk] = pick(SIFAT), tanya = Math.random() < 0.5;
      const klue = [0, 1, 2, 3].map((i) => (Math.random() < 0.5 ? `${nm[i]} ${kt} ${nm[i + 1]}.` : `${nm[i + 1]} ${kk} ${nm[i]}.`));
      return soal(`${mix(klue).join(" ")} Siapa yang ${tanya ? tert : terk}?`,
        `Urutan dari yang ${tert}: ${nm.join(" > ")}. Yang ${tanya ? tert : terk} adalah ${tanya ? nm[0] : nm[4]}.`,
        opsi(tanya ? nm[0] : nm[4], tanya ? nm.slice(1) : nm.slice(0, 4)));
    }],
    [3, () => {
      const [p, q, np, nq] = pick(KUAD);
      const kontra = `Jika ${nq}, maka ${np}`;
      return soal(`Kontraposisi dari pernyataan "Jika ${p}, maka ${q}" adalah...`,
        `Kontraposisi p → q adalah ¬q → ¬p, ekuivalen dengan pernyataan awal: ${kontra}. (Konvers "jika q maka p" dan invers "jika ¬p maka ¬q" tidak ekuivalen.)`,
        opsi(kontra, [`Jika ${q}, maka ${p}`, `Jika ${np}, maka ${nq}`, `Jika ${p}, maka ${nq}`, `Jika ${nq}, maka ${p}`]));
    }],
    [3, () => {
      const [p, q, np, nq] = pick(KUAD), v = Math.random() < 0.5;
      return soal(`Jika ${p}, maka ${q}. ${cap(v ? np : q)}. Kesimpulan yang tepat...`,
        v ? `Menyangkal anteseden (¬p) tidak menjamin ¬q, karena q bisa terjadi karena sebab lain. ${TDS}.`
          : `Mengiyakan konsekuen (q) tidak menjamin p, karena q bisa terjadi karena sebab lain. ${TDS}.`,
        opsi(TDS, v ? [cap(nq), cap(q), cap(p), `${cap(p)} dan ${q}`] : [cap(p), cap(np), cap(nq), `${cap(np)} dan ${nq}`]));
    }],
    [3, () => {
      const [x, y] = mix(NOUN).slice(0, 2);
      if (Math.random() < 0.5)
        return soal(`Negasi (ingkaran) dari pernyataan "Semua ${x} adalah ${y}" adalah...`,
          `Ingkaran "semua" adalah "ada yang tidak". Jadi: Ada ${x} yang bukan ${y}.`,
          opsi(`Ada ${x} yang bukan ${y}`, [`Tidak ada ${x} yang ${y}`, `Semua ${x} bukan ${y}`, `Sebagian ${x} adalah ${y}`, `Ada ${y} yang bukan ${x}`]));
      return soal(`Negasi (ingkaran) dari pernyataan "Tidak ada ${x} yang ${y}" adalah...`,
        `Ingkaran "tidak ada" adalah "ada". Jadi: Ada ${x} yang ${y}.`,
        opsi(`Ada ${x} yang ${y}`, [`Semua ${x} adalah ${y}`, `Semua ${x} bukan ${y}`, `Ada ${x} yang bukan ${y}`, `Tidak ada ${y} yang ${x}`]));
    }],
    [3, () => {
      for (;;) {
        const nm = mix(NAMA).slice(0, 5), pr = {};
        nm.forEach((n, i) => { pr[n] = i; });
        const kand = [];
        nm.forEach((a) => {
          kand.push([`${a} duduk di salah satu ujung`, (r) => r[a] % 4 === 0], [`${a} tidak duduk di ujung`, (r) => r[a] % 4 !== 0], [`${a} duduk di tengah`, (r) => r[a] === 2]);
          nm.forEach((b) => {
            if (a === b) return;
            kand.push([`${a} duduk tepat di sebelah kiri ${b}`, (r) => r[a] + 1 === r[b]], [`${a} duduk di sebelah kiri ${b} (tidak harus berdekatan)`, (r) => r[a] < r[b]],
              [`${a} dan ${b} duduk bersebelahan`, (r) => Math.abs(r[a] - r[b]) === 1]);
          });
        });
        const benar = mix(kand.filter((c) => c[1](pr))), pakai = [];
        const semua = PERM5.map((p) => { const r = {}; p.forEach((idx, k) => { r[nm[k]] = idx; }); return r; });
        let sisa = semua;
        while (sisa.length > 1 && benar.length && pakai.length < 8) {
          const c = benar.shift(); pakai.push(c); sisa = sisa.filter((r) => c[1](r));
        }
        if (sisa.length !== 1 || pakai.length > 7) continue;
        const k = rnd(1, 5), urut = nm.slice().sort((a, b) => pr[a] - pr[b]);
        return soal(`Lima orang (${nm.join(", ")}) duduk berjajar dalam satu baris menghadap depan. ${pakai.map((c) => cap(c[0]) + ".").join(" ")} Siapa yang duduk di urutan ke-${k} dari kiri?`,
          `Susunan dari kiri yang memenuhi semua petunjuk: ${urut.join(", ")}. Urutan ke-${k} adalah ${urut[k - 1]}.`,
          opsi(urut[k - 1], nm.filter((n) => n !== urut[k - 1])));
      }
    }]
  ];

  // ================= FIGURAL (SVG inline) =================
  const svg = (inner, w) => `<svg viewBox="0 0 60 60" width="${w || 52}" height="${w || 52}" style="vertical-align:middle;margin:2px" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round">${inner}</svg>`;
  const bintang = (() => { const t = []; for (let i = 0; i < 10; i++) { const r = i % 2 ? 9 : 22, a = -Math.PI / 2 + i * Math.PI / 5; t.push((30 + r * Math.cos(a)).toFixed(1) + "," + (30 + r * Math.sin(a)).toFixed(1)); } return t.join(" "); })();
  const BENTUK = {
    tri: '<polygon points="30,9 52,50 8,50"/>', cir: '<circle cx="30" cy="30" r="20"/>', sq: '<rect x="11" y="11" width="38" height="38"/>',
    dia: '<polygon points="30,7 53,30 30,53 7,30"/>', star: `<polygon points="${bintang}"/>`
  };
  const bentuk = (k, isi) => `<g fill="${isi ? "currentColor" : "none"}">${BENTUK[k]}</g>`;
  const fglyph = (rot, cermin) => `<path fill="currentColor" d="M18 10H42V18H26V26H38V34H26V50H18Z" transform="rotate(${NORM(rot)} 30 30)${cermin ? " translate(60 0) scale(-1 1)" : ""}"/>`;
  const titikGrid = (n, kol) => {
    let s = "";
    for (let i = 0; i < n; i++) {
      const x = kol === 3 ? [12, 30, 48][i % 3] : [9, 23, 37, 51][i % 4], y = [14, 30, 46][Math.floor(i / kol)];
      s += `<circle cx="${x}" cy="${y}" r="4.5" fill="currentColor" stroke="none"/>`;
    }
    return svg(s);
  };
  const NORM = (a) => ((a % 360) + 360) % 360;
  const gabung = (arr) => arr.join("") + svg('<text x="30" y="42" text-anchor="middle" font-size="32" fill="currentColor" stroke="none">?</text>');
  const TITIK8 = [[12, 12], [30, 12], [48, 12], [48, 30], [48, 48], [30, 48], [12, 48], [12, 30]];

  G.Figural = [
    [1, () => {
      const st = pick([45, 90]), dir = pick([1, -1]), a = (i) => i * st * dir, arah = dir > 0 ? "searah" : "berlawanan arah";
      const fig = (ang, c) => svg(fglyph(ang, c));
      const wrong = [[a(4) + st, 0], [a(4) - st, 0], [a(4), 1], [a(4) + 2 * st, 0], [a(4) + 90, 0], [a(4) + 180, 0], [a(4) + 135, 0], [a(4) + 45, 1]];
      return soal(`Perhatikan pola berikut. Gambar yang melanjutkan pola adalah...<div>${gabung([0, 1, 2, 3].map((i) => fig(a(i), 0)))}</div>`,
        `Bentuk berputar ${st}° ${arah} jarum jam setiap langkah. Langkah ke-5 berputar ${NORM(a(4))}° dari posisi awal (tidak dicerminkan).`,
        opsi(fig(a(4), 0), wrong.map((w) => fig(w[0], w[1])), String, true));
    }],
    [1, () => {
      const d = pick([1, 2]), s0 = rnd(1, 3), n = (i) => s0 + i * d, f = (c) => titikGrid(c, 4);
      return soal(`Perhatikan pola berikut. Gambar berikutnya adalah...<div>${gabung([0, 1, 2, 3].map((i) => f(n(i))))}</div>`,
        `Jumlah titik bertambah ${d} setiap langkah: ${[0, 1, 2, 3].map(n).join(", ")}. Berikutnya ${n(4)} titik.`,
        opsi(f(n(4)), [n(4) + 1, n(4) - 1, n(4) + 2, n(4) - 2, n(4) + 3, n(4) - 3, n(4) - 4].filter((v) => v >= 1 && v <= 12).map(f)));
    }],
    [2, () => {
      const sh = mix(Object.keys(BENTUK)).slice(0, 3), fig = (i) => svg(bentuk(sh[i % 3], i % 2 === 1)), tt = [0, 1, 2, 3, 4];
      const semua = []; sh.forEach((b) => [0, 1].forEach((isi) => semua.push(svg(bentuk(b, isi)))));
      const benar = fig(5);
      return soal(`Perhatikan pola berikut. Gambar yang melanjutkan pola adalah...<div>${gabung(tt.map(fig))}</div>`,
        `Dua pola berjalan bersamaan: bentuk berulang setiap 3 langkah dan isi (kosong/penuh) berganti setiap langkah. Langkah ke-6 adalah bentuk ke-3 dengan isi penuh.`,
        opsi(benar, semua.filter((v) => v !== benar)));
    }],
    [2, () => {
      const k = pick([1, 3]), dir = pick([1, -1]), p0 = rnd(0, 7), pos = (i) => NORM8(p0 + i * k * dir);
      function NORM8(v) { return ((v % 8) + 8) % 8; }
      const fig = (p) => svg('<rect x="12" y="12" width="36" height="36" fill="none"/>' + `<circle cx="${TITIK8[p][0]}" cy="${TITIK8[p][1]}" r="5.5" fill="currentColor" stroke="none"/>`);
      const lain = [0, 1, 2, 3, 4, 5, 6, 7].filter((p) => p !== pos(4));
      return soal(`Titik hitam bergerak mengelilingi bingkai. Gambar yang melanjutkan pola adalah...<div>${gabung([0, 1, 2, 3].map((i) => fig(pos(i))))}</div>`,
        `Titik bergeser ${k} posisi ${dir > 0 ? "searah" : "berlawanan arah"} jarum jam tiap langkah (8 posisi pada bingkai). Langkah ke-5 berada pada posisi ke-${pos(4) + 1} dari sudut kiri atas.`,
        opsi(fig(pos(4)), lain.map(fig)));
    }],
    [2, () => {
      const t = mix(Object.keys(BENTUK)).slice(0, 5), isi = Math.random() < 0.5, r = rnd(0, 2), c = rnd(0, 2), ans = t[(r + c) % 3];
      let isiSvg = "";
      for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
        const x = j * 60, y = i * 60;
        isiSvg += `<rect x="${x}" y="${y}" width="60" height="60" fill="none" stroke-width="1" opacity=".35"/>`;
        isiSvg += i === r && j === c ? `<text x="${x + 30}" y="${y + 42}" text-anchor="middle" font-size="32" fill="currentColor" stroke="none">?</text>`
          : `<g transform="translate(${x} ${y})">${bentuk(t[(i + j) % 3], isi)}</g>`;
      }
      const fig = (k) => svg(bentuk(k, isi));
      return soal(`Setiap baris dan setiap kolom memuat bentuk yang berbeda. Bentuk yang tepat untuk tanda tanya adalah...<div><svg viewBox="0 0 180 180" width="150" height="150" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round" style="margin:4px">${isiSvg}</svg></div>`,
        `Matriks berpola Latin: tiap baris dan kolom memuat tiga bentuk berbeda tepat sekali. Pada baris ke-${r + 1}, kolom ke-${c + 1} bentuk yang belum muncul di baris dan kolomnya adalah yang dipilih.`,
        opsi(fig(ans), t.filter((k) => k !== ans).map(fig)));
    }],
    [3, () => {
      const st = pick([45, 90]), dir = pick([1, -1]), a = (i) => i * st * dir, m = (i) => i % 2, fig = (ang, c) => svg(fglyph(ang, c));
      const wrong = [[a(5), 0], [a(5), 1], [a(4), 1], [a(5) + st, 1], [a(5) - st, 1], [a(6), 1]];
      const benar = fig(a(4), m(4));
      return soal(`Perhatikan pola berikut. Gambar yang melanjutkan pola adalah...<div>${gabung([0, 1, 2, 3].map((i) => fig(a(i), m(i))))}</div>`,
        `Dua perubahan sekaligus: bentuk berputar ${st}° ${dir > 0 ? "searah" : "berlawanan arah"} jarum jam setiap langkah, dan dicerminkan setiap langkah genap-ganjil bergantian. Langkah ke-5: putaran ${NORM(a(4))}° tanpa cermin.`,
        opsi(benar, wrong.map((w) => fig(w[0], w[1])).filter((v) => v !== benar), String, true));
    }],
    [3, () => {
      const rows = [0, 1, 2].map(() => { const x = rnd(1, 4), y = rnd(1, 4); return [x, y, x + y]; });
      let hasil = "";
      rows.forEach((rw, i) => rw.forEach((n, j) => {
        const x = j * 60, y = i * 60;
        hasil += `<rect x="${x}" y="${y}" width="60" height="60" fill="none" stroke-width="1" opacity=".35"/>`;
        if (i === 2 && j === 2) hasil += `<text x="${x + 30}" y="${y + 42}" text-anchor="middle" font-size="32" fill="currentColor" stroke="none">?</text>`;
        else for (let t = 0; t < n; t++) hasil += `<circle cx="${x + [12, 30, 48][t % 3]}" cy="${y + [14, 30, 46][Math.floor(t / 3)]}" r="4.5" fill="currentColor" stroke="none"/>`;
      }));
      const c = rows[2][2], wrong = [c - 1, c + 1, c - 2, c + 2, c + 3, c - 3].filter((v) => v >= 1 && v <= 9), f = (n) => titikGrid(n, 3);
      return soal(`Perhatikan matriks titik berikut. Gambar yang tepat untuk tanda tanya adalah...<div><svg viewBox="0 0 180 180" width="150" height="150" style="margin:4px">${hasil}</svg></div>`,
        `Pada tiap baris, jumlah titik kolom ketiga = jumlah titik kolom pertama + kedua. Baris ke-3: ${rows[2][0]} + ${rows[2][1]} = ${c} titik.`,
        opsi(f(c), wrong.map(f), String, true));
    }]
  ];

  // ================= VERBAL (Bahasa Indonesia) =================
  const pasang = (s) => s.split(", ").map((e) => e.split("="));
  const SINONIM = {
    1: pasang("cermat=teliti, tangkas=cekatan, pandai=cerdas, gembira=riang, bimbang=ragu, elok=indah, murka=marah, cemas=khawatir, kukuh=kokoh, rajin=tekun, lazim=umum, hampa=kosong, nyaring=lantang, mufakat=sepakat"),
    2: pasang("akurat=tepat, fleksibel=luwes, gigih=ulet, ahli=pakar, transparan=terbuka, solid=kompak, optimal=maksimal, esensial=pokok, kompleks=rumit, kontribusi=sumbangan, inisiatif=prakarsa, evaluasi=penilaian, destinasi=tujuan, spontan=serta-merta"),
    3: pasang("ambigu=bermakna ganda, hegemoni=dominasi, paradoks=pertentangan, sporadis=sesekali, pragmatis=praktis, resistensi=perlawanan, fluktuatif=naik turun, implisit=tersirat, eksplisit=tersurat, stagnan=mandek, verifikasi=pemeriksaan, akumulasi=penumpukan, elaborasi=penguraian, kredibel=tepercaya")
  };
  const ANTONIM = {
    1: pasang("rajin=malas, kuat=lemah, ramai=sepi, murah=mahal, luas=sempit, terang=gelap, cepat=lambat, kaya=miskin, berani=takut, sedih=gembira"),
    2: pasang("fleksibel=kaku, optimis=pesimis, kuno=modern, pasif=aktif, hemat=boros, sukses=gagal, setuju=menolak, abstrak=konkret, mayoritas=minoritas, bangkit=terpuruk"),
    3: pasang("eksplisit=implisit, progresif=regresif, altruis=egois, kolektif=individual, vertikal=horizontal, sentralisasi=desentralisasi, intensif=ekstensif, optimal=minimal, mikro=makro, homogen=heterogen")
  };
  const tabelKata = (tab, lv, kata, kunci) => () => {
    const t = tab[lv], [w, s] = pick(t), lain = t.filter((e) => e[0] !== w).map((e) => e[1]);
    return soal(`${kata} kata <b>${w}</b> adalah...`, `${cap(w)} ${kunci} ${s}.`, opsi(s, lain));
  };
  const ANALOGI = [
    ["alat : pengguna", "adalah alat kerja", pasang("stetoskop=dokter, palu=tukang kayu, cangkul=petani, kuas=pelukis, jarum=penjahit, kemudi=sopir, pena=penulis, kompas=pelaut, penggaris=arsitek")],
    ["hewan : suara", "bersuara", pasang("kucing=mengeong, anjing=menggonggong, ayam=berkokok, sapi=melenguh, kuda=meringkik, katak=menguak, singa=mengaum, burung=berkicau")],
    ["negara : ibu kota", "beribu kota", pasang("Jepang=Tokyo, Thailand=Bangkok, Prancis=Paris, Mesir=Kairo, Australia=Canberra, Korea Selatan=Seoul, Inggris=London, Jerman=Berlin, Filipina=Manila, Malaysia=Kuala Lumpur")],
    ["bagian : keseluruhan", "adalah bagian dari", pasang("lensa=kamera, halaman=buku, kelopak=bunga, jari=tangan, layar=televisi, senar=gitar, tuts=piano, kemudi=kapal")],
    ["pembuat : karya", "menghasilkan", pasang("penulis=novel, pelukis=lukisan, koki=masakan, penjahit=pakaian, pematung=patung, komposer=lagu, arsitek=bangunan, penyair=puisi")]
  ];
  const analogi = () => {
    const [rel, ket, tab] = pick(ANALOGI), [[a, b], [c, d]] = mix(tab).slice(0, 2), lain = tab.map((e) => e[1]).filter((v) => v !== d && v !== b);
    return soal(`Analogi: <b>${cap(a)} : ${cap(b)} = ${cap(c)} : ...</b>`,
      `Hubungan "${rel}": ${a} ${ket} ${b}. Maka ${c} ${ket} ${d}.`, opsi(d, lain));
  };
  G.Verbal = [
    [1, tabelKata(SINONIM, 1, "Sinonim", "bersinonim dengan")],
    [1, tabelKata(ANTONIM, 1, "Antonim", "berlawanan makna dengan")],
    [2, tabelKata(SINONIM, 2, "Sinonim", "bersinonim dengan")],
    [2, tabelKata(ANTONIM, 2, "Antonim", "berlawanan makna dengan")],
    [2, analogi],
    [3, tabelKata(SINONIM, 3, "Sinonim", "bersinonim dengan")],
    [3, tabelKata(ANTONIM, 3, "Antonim", "berlawanan makna dengan")],
    [3, analogi]
  ];

  // ================= BAHASA INGGRIS =================
  // [base, 3sg, -ing, past, pp, objek]
  const VERB = [
    ["work", "works", "working", "worked", "worked", "at a bank"], ["study", "studies", "studying", "studied", "studied", "English"],
    ["live", "lives", "living", "lived", "lived", "in Bandung"], ["play", "plays", "playing", "played", "played", "football"],
    ["write", "writes", "writing", "wrote", "written", "a report"], ["visit", "visits", "visiting", "visited", "visited", "an old friend"],
    ["cook", "cooks", "cooking", "cooked", "cooked", "dinner"], ["send", "sends", "sending", "sent", "sent", "an email"],
    ["watch", "watches", "watching", "watched", "watched", "a movie"], ["finish", "finishes", "finishing", "finished", "finished", "the project"],
    ["buy", "buys", "buying", "bought", "bought", "a new laptop"], ["drive", "drives", "driving", "drove", "driven", "to the office"]
  ];
  const DURATIF = ["work", "study", "live", "play"];
  const SUBJ = [["I", "am", "have", 0], ["You", "are", "have", 0], ["They", "are", "have", 0], ["We", "are", "have", 0], ["He", "is", "has", 1], ["She", "is", "has", 1], ["My brother", "is", "has", 1], ["The students", "are", "have", 0]];
  const KALA = [ // [nama, penanda]
    ["present", ["every day", "every morning", "on weekends", "once a week"]],
    ["past", ["yesterday", "last week", "two days ago", "last month"]],
    ["perfect", ["already"]],
    ["cont", ["right now", "at the moment"]],
    ["future", ["tomorrow", "next week"]]
  ];
  const bentukKala = (v, s, kala) => {
    const [, aux, has, sg] = s;
    return { present: sg ? v[1] : v[0], past: v[3], perfect: `${has} ${v[4]}`, cont: `${aux} ${v[2]}`, future: `will ${v[0]}` }[kala];
  };
  const NAMAKALA = { present: "simple present (kebiasaan)", past: "simple past (waktu lampau tertentu)", perfect: "present perfect (kejadian yang sudah/telah terjadi)", cont: "present continuous (sedang berlangsung)", future: "simple future (akan datang)" };
  const tenses = (lv) => () => {
    const v = pick(VERB), s = pick(SUBJ);
    const [kala, daftar] = pick(KALA.filter((k) => lv > 1 || k[0] !== "perfect"));
    let marker = pick(daftar);
    if (kala === "perfect" && DURATIF.includes(v[0]) && Math.random() < 0.6) marker = pick(["since 2018", "for five years", "for three years"]);
    const benar = bentukKala(v, s, kala);
    const kalimat = `${s[0]} ____ ${v[5]} ${marker}.`.replace("  ", " ");
    return soal(`Choose the correct answer.<br><b>${kalimat}</b>`,
      `Penanda waktu "${marker}" menunjukkan ${NAMAKALA[kala]}. Jawaban: ${benar}.`,
      opsi(benar, KALA.map((k) => bentukKala(v, s, k[0]))));
  };
  const PASIF = [ // [subjek tunggal/jamak, pp, agen, waktu, jamak?]
    ["The report", "written", "by the secretary", "yesterday", 0], ["The windows", "cleaned", "by the janitor", "this morning", 1],
    ["The letter", "sent", "by the manager", "last week", 0], ["The new rules", "announced", "by the principal", "yesterday", 1],
    ["The bridge", "built", "by a local company", "in 2019", 0], ["These cars", "made", "in Indonesia", "last year", 1],
    ["The thief", "caught", "by the police", "last night", 0], ["The documents", "signed", "by the director", "this morning", 1]
  ];
  const pasif = () => {
    const [sb, pp, ag, wk, jm] = pick(PASIF), be = jm ? "were" : "was", salah = jm ? "was" : "were";
    const act = { written: ["wrote", "has written", "is writing"], cleaned: ["cleaned", "has cleaned", "is cleaning"], sent: ["sent", "has sent", "is sending"], announced: ["announced", "has announced", "is announcing"], built: ["built", "has built", "is building"], made: ["made", "has made", "is making"], caught: ["caught", "has caught", "is catching"], signed: ["signed", "has signed", "is signing"] }[pp];
    return soal(`Choose the correct answer.<br><b>${sb} ____ ${ag} ${wk}.</b>`,
      `Kalimat pasif dengan penanda waktu lampau (${wk}): ${be} + past participle, dan menyesuaikan subjek ${jm ? "jamak" : "tunggal"}: ${be} ${pp}.`,
      opsi(`${be} ${pp}`, [`${salah} ${pp}`, act[0], act[1], act[2]]));
  };
  const KONDISI = [ // [if present, if past, if past perfect, subj, base, pp, rest]
    ["it rains", "it rained", "it had rained", "we", "cancel", "cancelled", "the match"], ["he studies hard", "he studied hard", "he had studied hard", "he", "pass", "passed", "the exam"],
    ["she leaves early", "she left early", "she had left early", "she", "catch", "caught", "the train"], ["I have enough money", "I had enough money", "I had had enough money", "I", "buy", "bought", "that car"],
    ["they invite me", "they invited me", "they had invited me", "I", "attend", "attended", "the party"], ["the traffic is light", "the traffic was light", "the traffic had been light", "we", "arrive", "arrived", "on time"]
  ];
  const kondisi = () => {
    const [i1, i2, i3, sb, base, pp, rest] = pick(KONDISI), t = rnd(1, 3), iff = [i1, i2, i3][t - 1];
    const benar = ["will " + base, "would " + base, "would have " + pp][t - 1];
    return soal(`Choose the correct answer.<br><b>If ${iff}, ${sb} ____ ${rest}.</b>`,
      `If-clause ${["simple present", "simple past", "past perfect"][t - 1]} berpasangan dengan "${benar}" (conditional type ${t}).`,
      opsi(benar, ["will " + base, "would " + base, "would have " + pp, base, pp].filter((x) => x !== benar)));
  };
  const PREP = [
    ["She is interested ____ learning foreign languages.", "in"], ["The meeting starts ____ nine o'clock.", "at"], ["He is very good ____ mathematics.", "at"],
    ["I have been waiting here ____ two hours.", "for"], ["She has lived in Jakarta ____ 2015.", "since"], ["The cat is hiding ____ the table.", "under"],
    ["We usually go to school ____ bus.", "by"], ["He is afraid ____ snakes.", "of"], ["The book is ____ the shelf, next to the lamp.", "on"],
    ["She was born ____ July.", "in"], ["I will see you ____ Monday.", "on"], ["He depends ____ his parents for money.", "on"],
    ["She apologized ____ being late.", "for"], ["Are you listening ____ me?", "to"], ["The gift is ____ my mother.", "for"], ["They walked ____ the bridge to the other side.", "across"]
  ];
  const prep = () => {
    const [k, b] = pick(PREP), semua = ["in", "on", "at", "by", "for", "of", "to", "under", "since", "across", "with"];
    return soal(`Choose the correct preposition.<br><b>${k}</b>`, `Pasangan yang benar pada kalimat ini adalah "${b}".`, opsi(b, semua.filter((x) => x !== b)));
  };
  const ADJ = [["tall", "taller", "tallest", 1], ["small", "smaller", "smallest", 1], ["fast", "faster", "fastest", 1], ["cheap", "cheaper", "cheapest", 1],
    ["beautiful", "more beautiful", "most beautiful", 0], ["expensive", "more expensive", "most expensive", 0], ["important", "more important", "most important", 0],
    ["good", "better", "best", 2], ["bad", "worse", "worst", 2]];
  const banding = () => {
    const [a, kp, ks, tipe] = pick(ADJ), sup = Math.random() < 0.5, benar = sup ? ks : kp;
    const o = sup ? "Of all the students in my class, Rudi is the" : "My new phone is";
    const lain = sup ? kp : ks;
    const sal = tipe === 0 ? [a, lain, a + "er", a + "est", "very " + a] : tipe === 1 ? [a, lain, "more " + a, "most " + a, sup ? "most " + kp : "more " + kp] : [a, lain, a + "er", a + "est", "more " + a];
    return soal(`Choose the correct answer.<br><b>${o} ____ ${sup ? "" : "than my old one"}.</b>`.replace(" .", "."),
      `${sup ? "Superlatif (membandingkan lebih dari dua, 'of all')" : "Komparatif (membandingkan dua, 'than')"} dari "${a}" adalah "${benar}".`, opsi(benar, sal));
  };
  const VOKAB = {
    1: pasang("big=large, small=tiny, quick=fast, begin=start, buy=purchase, help=assist, smart=clever, happy=glad, difficult=hard, finish=complete, quiet=silent"),
    2: pasang("reluctant=unwilling, abundant=plentiful, essential=necessary, obtain=get, enormous=huge, prohibit=forbid, genuine=authentic, fragile=delicate, conceal=hide, accurate=correct, diligent=hardworking"),
    3: pasang("ubiquitous=omnipresent, meticulous=painstaking, ambiguous=vague, mitigate=alleviate, benevolent=kind, candid=frank, frugal=thrifty, verbose=wordy, ephemeral=short-lived, exacerbate=worsen, tenacious=persistent")
  };
  const vokab = (lv) => () => {
    const t = VOKAB[lv], [w, s] = pick(t);
    return soal(`The word <b>${w}</b> is closest in meaning to...`, `"${w}" means the same as "${s}".`, opsi(s, t.filter((e) => e[0] !== w).map((e) => e[1])));
  };
  G.Grammar = [[1, tenses(1)], [1, prep], [1, banding], [2, tenses(2)], [2, pasif], [2, prep], [2, banding], [3, kondisi], [3, pasif], [3, tenses(2)]];
  G.Vocabulary = [[1, vokab(1)], [2, vokab(2)], [3, vokab(3)]];
  G["Bahasa Inggris"] = G.Grammar.concat(G.Vocabulary);

  // ================= BAHASA INDONESIA (Akpol) =================
  const BAKU = pasang("apotek=apotik, analisis=analisa, izin=ijin, risiko=resiko, sistem=sistim, kualitas=kwalitas, objek=obyek, praktik=praktek, silakan=silahkan, nasihat=nasehat, jadwal=jadual, standar=standard, teknik=tehnik, kuitansi=kwitansi, hakikat=hakekat, atlet=atlit, aktif=aktip, konkret=konkrit, hierarki=hirarki, napas=nafas, rezeki=rejeki, zaman=jaman, asas=azas, frekuensi=frekwensi, aktivitas=aktifitas, Februari=Pebruari, ubah=rubah, karier=karir, sanksi=sangsi, telepon=telpon, hipotesis=hipotesa, metode=metoda, ijazah=ijasah, subjek=subyek");
  const DI = [
    ["Adik bermain di halaman rumah.", "Adik bermain dihalaman rumah."], ["Ibu memasak di dapur setiap pagi.", "Ibu memasak didapur setiap pagi."],
    ["Buku itu terletak di atas meja.", "Buku itu terletak diatas meja."], ["Kami berangkat ke sekolah pukul tujuh.", "Kami berangkat kesekolah pukul tujuh."],
    ["Mereka tinggal di Bandung sejak lama.", "Mereka tinggal diBandung sejak lama."], ["Surat itu dibaca oleh kepala sekolah.", "Surat itu di baca oleh kepala sekolah."],
    ["Pagar rumah dicat berwarna hijau.", "Pagar rumah di cat berwarna hijau."], ["Hasil rapat diumumkan kemarin.", "Hasil rapat di umumkan kemarin."],
    ["Barang itu dibawa pulang oleh paman.", "Barang itu di bawa pulang oleh paman."], ["Laporan tersebut dikerjakan semalam suntuk.", "Laporan tersebut di kerjakan semalam suntuk."],
    ["Jalan raya ditutup selama perbaikan.", "Jalan raya di tutup selama perbaikan."], ["Kakak pergi ke pasar membeli sayur.", "Kakak pergi kepasar membeli sayur."]
  ];
  const awalanMeN = (w) => {
    const f = w[0], vokal = "aiueo".includes(f);
    if (vokal || "ghk".includes(f)) return [f === "k" ? "meng" + w.slice(1) : "meng" + w, `berawalan ${vokal ? "vokal" : f}: me- menjadi meng-${f === "k" ? " dan huruf k luluh" : ""}`];
    if ("bfv".includes(f)) return ["mem" + w, `berawalan ${f}: me- menjadi mem-`];
    if (f === "p") return ["mem" + w.slice(1), "berawalan p: me- menjadi mem- dan huruf p luluh"];
    if ("cdjz".includes(f)) return ["men" + w, `berawalan ${f}: me- menjadi men-`];
    if (f === "t") return ["men" + w.slice(1), "berawalan t: me- menjadi men- dan huruf t luluh"];
    if (f === "s") return ["meny" + w.slice(1), "berawalan s: me- menjadi meny- dan huruf s luluh"];
    return ["me" + w, `berawalan ${f}: me- tetap me-`];
  };
  const KATADASAR = "ambil, hapus, gambar, kirim, kunci, ikat, ukur, beli, buka, pukul, pakai, cari, dengar, jahit, tulis, tarik, tolak, tanam, lihat, minum, nilai, ramal, rawat, lukis, sapu, sikat, sewa, sambut, saring".split(", ");
  G["Bahasa Indonesia"] = [
    [1, () => {
      const [b, t] = pick(BAKU), lain = mix(BAKU).filter((e) => e[0] !== b);
      return soal("Kata baku dari pilihan berikut adalah...", `Bentuk baku menurut KBBI/PUEBI: <b>${b}</b> (bukan ${t}).`, opsi(b, lain.map((e) => e[1])));
    }],
    [1, () => {
      const [b, t] = pick(BAKU), lain = mix(BAKU).filter((e) => e[0] !== b);
      return soal("Kata yang <b>tidak baku</b> terdapat pada pilihan...", `Bentuk tidak baku: <b>${t}</b>; yang baku adalah ${b}. Pilihan lain sudah baku.`, opsi(t, lain.map((e) => e[0])));
    }],
    [2, () => {
      const w = pick(KATADASAR), [benar, ket] = awalanMeN(w);
      return soal(`Bentuk berimbuhan <b>meN-</b> yang benar dari kata dasar <b>${w}</b> adalah...`, `Kata dasar ${w} ${ket}. Bentuk yang benar: ${benar}.`,
        opsi(benar, ["me", "mem", "men", "meng", "meny", "menge"].map((p) => p + w).filter((x) => x !== benar)));
    }],
    [2, () => {
      const it = mix(DI), b = it[0][0];
      return soal("Kalimat yang penulisan <b>di</b> / <b>ke</b>-nya benar adalah...",
        `Kata depan di/ke dipisah dari kata tempat; awalan di- dirangkai dengan kata kerja. Kalimat benar: "${b}"`, opsi(b, it.slice(1).map((e) => e[1])));
    }]
  ];

  // ================= AKUNTANSI & KEUANGAN =================
  const jt = (n) => "Rp" + ribu(n) + " juta";
  const rpS = (n) => (n < 0 ? "−" : "") + rp(Math.abs(n));
  const JURNAL = [
    ["Perusahaan membeli peralatan secara tunai", "Peralatan", "Kas"], ["Perusahaan menerima pendapatan jasa secara tunai", "Kas", "Pendapatan Jasa"],
    ["Perusahaan membayar gaji karyawan", "Beban Gaji", "Kas"], ["Perusahaan membeli perlengkapan secara kredit", "Perlengkapan", "Utang Usaha"],
    ["Pemilik menyetor modal secara tunai", "Kas", "Modal Pemilik"], ["Perusahaan membayar utang usaha secara tunai", "Utang Usaha", "Kas"],
    ["Perusahaan memberikan jasa secara kredit", "Piutang Usaha", "Pendapatan Jasa"], ["Perusahaan menerima pelunasan piutang", "Kas", "Piutang Usaha"],
    ["Perusahaan membayar sewa kantor", "Beban Sewa", "Kas"], ["Pemilik mengambil uang untuk keperluan pribadi", "Prive", "Kas"]
  ];
  const AKUN = ["Kas", "Peralatan", "Perlengkapan", "Utang Usaha", "Piutang Usaha", "Pendapatan Jasa", "Beban Gaji", "Modal Pemilik", "Prive", "Beban Sewa"];
  G.Akuntansi = [
    [1, () => {
      const l = rnd(10, 90) * 10, e = rnd(10, 90) * 10, a = l + e, tipe = rnd(0, 2), nama = ["Aset", "Liabilitas", "Ekuitas"], nil = [a, l, e], tampil = [0, 1, 2].filter((i) => i !== tipe);
      return soal(`Menurut persamaan akuntansi, ${tampil.map((i) => nama[i] + " " + jt(nil[i])).join(" dan ")}. ${nama[tipe]} perusahaan adalah...`,
        `Aset = Liabilitas + Ekuitas. Maka ${nama[tipe]} = ${tipe === 0 ? `${jt(l)} + ${jt(e)}` : `${jt(a)} − ${jt(nil[tipe === 1 ? 2 : 1])}`} = ${jt(nil[tipe])}.`,
        opsi(nil[tipe], [a + l, a + e, Math.abs(l - e), nil[tipe] + 50, nil[tipe] - 50].filter((v) => v > 0), jt));
    }],
    [1, () => {
      const pj = rnd(20, 90) * 10, hpp = Math.round(pj * pick([0.5, 0.6, 0.7]) / 10) * 10, bo = rnd(1, 9) * 10, lk = pj - hpp, lb = lk - bo;
      return soal(`Penjualan ${jt(pj)}, harga pokok penjualan ${jt(hpp)}, beban operasional ${jt(bo)}. Laba bersih (sebelum pajak) adalah...`,
        `Laba kotor = ${jt(pj)} − ${jt(hpp)} = ${jt(lk)}. Laba bersih = ${jt(lk)} − ${jt(bo)} = ${jt(lb)}.`, opsi(lb, [lk, lb + bo, pj - bo, lb - 10, hpp - bo].filter((v) => v > 0), jt));
    }],
    [2, () => {
      const aw = rnd(5, 30) * 10, pb = rnd(20, 80) * 10, ak = rnd(5, 30) * 10, h = aw + pb - ak;
      return soal(`Persediaan awal ${jt(aw)}, pembelian ${jt(pb)}, persediaan akhir ${jt(ak)}. Harga pokok penjualan adalah...`,
        `HPP = persediaan awal + pembelian − persediaan akhir = ${jt(aw)} + ${jt(pb)} − ${jt(ak)} = ${jt(h)}.`, opsi(h, [aw + pb + ak, aw + pb, pb - ak, h + 20, h - 20].filter((v) => v > 0), jt));
    }],
    [2, () => {
      const umur = pick([4, 5, 8, 10]), per = rnd(2, 20) * 100000, resid = rnd(1, 5) * 1000000, perolehan = umur * per + resid;
      return soal(`Mesin dibeli ${rp(perolehan)}, nilai residu ${rp(resid)}, umur ekonomis ${umur} tahun. Beban penyusutan per tahun (garis lurus)...`,
        `Penyusutan = (harga perolehan − residu) / umur = (${rp(perolehan)} − ${rp(resid)}) / ${umur} = ${rp(per)}.`, opsi(per, [perolehan / umur, resid / umur, per * 2, per + 100000, per - 100000], rp));
    }],
    [2, () => {
      const j = pick(JURNAL), lain = AKUN.filter((a) => a !== j[1] && a !== j[2]);
      const fmt = (x, y) => `Debit ${x}, Kredit ${y}`, benar = fmt(j[1], j[2]);
      return soal(`Transaksi: ${j[0]}. Pencatatan jurnal yang tepat adalah...`, `Akun bertambah di sisi normalnya: ${benar}.`,
        opsi(benar, [fmt(j[2], j[1]), fmt(j[1], pick(lain)), fmt(pick(lain), j[2]), fmt(pick(lain), pick(lain)), fmt(j[2], pick(lain)), fmt(pick(lain), j[1]), fmt(j[2], j[2] === "Kas" ? "Modal Pemilik" : "Kas")], String, true));
    }],
    [2, () => {
      const ul = rnd(2, 9) * 100, r = pick([1.5, 2, 2.5, 3]), al = ul * r;
      return soal(`Aset lancar perusahaan ${jt(al)} dan utang lancar ${jt(ul)}. Rasio lancar (current ratio) adalah...`,
        `Rasio lancar = aset lancar / utang lancar = ${al}/${ul} = ${des(r)}.`, opsi(r, [r + 0.5, r - 0.5, r * 2, 1, r + 1], des));
    }],
    [3, () => {
      const lsp = rnd(10, 90) * 10, t = pick([10, 20, 25, 30]), lb = lsp * (100 - t) / 100;
      return soal(`Laba sebelum pajak ${jt(lsp)} dengan tarif pajak ${t}%. Laba setelah pajak adalah...`,
        `Pajak = ${t}% × ${jt(lsp)} = ${jt(lsp * t / 100)}. Laba setelah pajak = ${jt(lsp)} − ${jt(lsp * t / 100)} = ${jt(lb)}.`,
        opsi(lb, [lsp * t / 100, lsp + lsp * t / 100, lb + 10, lb - 10, lsp - t].filter((v) => v > 0), jt));
    }],
    [3, () => {
      const umur = pick([4, 5, 10]), per = rnd(2, 20) * 100000, resid = rnd(1, 5) * 1000000, perolehan = umur * per + resid, k = rnd(1, umur - 1), nb = perolehan - k * per;
      return soal(`Aset dibeli ${rp(perolehan)}, residu ${rp(resid)}, umur ${umur} tahun, metode garis lurus. Nilai buku setelah ${k} tahun...`,
        `Penyusutan per tahun = ${rp(per)}. Akumulasi ${k} tahun = ${rp(k * per)}. Nilai buku = ${rp(perolehan)} − ${rp(k * per)} = ${rp(nb)}.`,
        opsi(nb, [perolehan - per, k * per, nb - resid, nb + per, perolehan - (k + 1) * per], rp));
    }]
  ];
  G.Keuangan = [
    [1, () => {
      const M = rnd(1, 50) * 100000, r = pick([5, 6, 8, 10, 12]), t = rnd(1, 4), b = M * r * t / 100;
      return soal(`Modal ${rp(M)} dipinjam dengan bunga tunggal ${r}% per tahun selama ${t} tahun. Total bunga...`,
        `Bunga = M × r × t = ${rp(M)} × ${r}% × ${t} = ${rp(b)}.`, opsi(b, [M * r / 100, M + b, b * 2, b + M / 100, b - M / 100], rp));
    }],
    [2, () => {
      const M = rnd(1, 20) * 400, r = pick([5, 10, 20]), a = M * Math.pow(1 + r / 100, 2);
      return soal(`Uang ${rp(M * 1000)} didepositokan dengan bunga majemuk ${r}% per tahun. Nilai akhir setelah 2 tahun...`,
        `Nilai akhir = M(1 + r)² = ${rp(M * 1000)} × (1 + ${r}%)² = ${rp(Math.round(a * 1000))}.`,
        opsi(Math.round(a * 1000), [M * 1000 * (1 + 2 * r / 100), M * 1000 * (1 + r / 100), Math.round(a * 1000) + M * 10, Math.round(a * 1000) - M * 10, M * 1000 * (1 + 3 * r / 100)], rp));
    }],
    [2, () => {
      const q = rnd(5, 50) * 10, k = rnd(2, 20) * 1000, vc = rnd(5, 30) * 1000, p = vc + k, fc = q * k;
      return soal(`Biaya tetap ${rp(fc)}, harga jual ${rp(p)}/unit, biaya variabel ${rp(vc)}/unit. Titik impas (BEP) dalam unit...`,
        `BEP = biaya tetap / (harga − biaya variabel) = ${rp(fc)} / ${rp(k)} = ${q} unit.`, opsi(q, [q * 2, Math.round(fc / p), Math.round(fc / vc), q + 10, q - 10], (v) => v + " unit"));
    }],
    [2, () => {
      const pj = rnd(2, 20) * 100, p = pick([5, 10, 15, 20, 25]), lb = pj * p / 100;
      return soal(`Penjualan ${jt(pj)} dan laba bersih ${jt(lb)}. Margin laba bersih adalah...`, `Margin = laba bersih / penjualan × 100% = ${lb}/${pj} × 100% = ${p}%.`,
        opsi(p, [p * 2, p + 5, p - 5, 100 - p, p + 10], persen));
    }],
    [3, () => {
      const pv = rnd(5, 40) * 1000000, d = pick([10, 20, 25]), inv = pv + pick([-1, 1]) * rnd(1, 4) * 500000, fv = pv * (100 + d) / 100, npv = pv - inv;
      return soal(`Investasi ${rp(inv)} sekarang menghasilkan ${rp(fv)} satu tahun lagi. Dengan tingkat diskonto ${d}%, NPV investasi adalah...`,
        `PV arus kas = ${rp(fv)} / (1 + ${d}%) = ${rp(pv)}. NPV = ${rp(pv)} − ${rp(inv)} = ${rpS(npv)}.`,
        opsi(npv, [fv - inv, -npv, pv, npv + 500000, npv - 500000], rpS));
    }],
    [3, () => {
      const p0 = rnd(5, 40) * 1000, pc = pick([-10, -5, 5, 10, 15, 20, 25, 30]), dv = rnd(1, 5) * 100, sel = p0 * pc / 100, p1 = p0 + sel - dv;
      if (p1 <= 0) return G.Keuangan[0][1]();
      return soal(`Saham dibeli ${rp(p0)}, dijual ${rp(p1)}, dan menerima dividen ${rp(dv)}. Total return (%) adalah...`,
        `Return = (harga jual − harga beli + dividen) / harga beli = (${rp(p1)} − ${rp(p0)} + ${rp(dv)}) / ${rp(p0)} = ${pc}%.`,
        opsi(pc, [pc + 5, pc - 5, Math.round((p1 - p0) / p0 * 100), Math.round(dv / p0 * 100), -pc, pc + 10, pc - 10], persen));
    }]
  ];

  // ================= KLASIFIKASI KATA (Word Classification) =================
  const K = (g, n, w) => ({ g: g, n: n, w: w.split(", ") });
  const G3 = ["ibukota", "imbuhan", "bilangan"]; // kelompok halus, khusus level 3
  const KLAS = [
    K("hewan", "mamalia", "kucing, sapi, kuda, harimau, kambing, gajah, kelinci, domba"),
    K("hewan", "burung", "elang, merpati, kakaktua, pipit, bangau, gagak, kutilang, nuri"),
    K("hewan", "reptil", "ular, kadal, buaya, penyu, bunglon, komodo"),
    K("hewan", "ikan", "lele, tuna, gurami, kakap, bandeng, salmon, nila"),
    K("tumbuhan", "buah", "apel, jeruk, mangga, pisang, durian, rambutan, semangka, pepaya, salak"),
    K("tumbuhan", "sayuran", "bayam, kangkung, wortel, sawi, brokoli, kubis, terung, buncis"),
    K("tumbuhan", "bumbu dapur", "jahe, kunyit, lengkuas, ketumbar, kemiri, cengkih, lada, pala"),
    K("transportasi", "kendaraan darat", "mobil, bus, kereta, sepeda, truk, becak, motor"),
    K("transportasi", "kendaraan air", "kapal, perahu, sampan, feri, kano, rakit"),
    K("transportasi", "kendaraan udara", "pesawat, helikopter, jet, balon udara, pesawat layang"),
    K("profesi", "tenaga kesehatan", "dokter, perawat, apoteker, bidan, ahli gizi"),
    K("profesi", "penegak hukum", "hakim, jaksa, pengacara, notaris, panitera"),
    K("profesi", "tenaga pendidik", "guru, dosen, tutor, kepala sekolah, pustakawan"),
    K("profesi", "tenaga teknik", "insinyur, arsitek, mandor, teknisi, surveyor"),
    K("antariksa", "planet", "Merkurius, Venus, Mars, Jupiter, Saturnus, Uranus, Neptunus"),
    K("antariksa", "benua", "Asia, Afrika, Eropa, Amerika, Australia, Antartika"),
    K("antariksa", "samudra", "Pasifik, Atlantik, Hindia, Arktik"),
    K("geografi", "pulau besar Indonesia", "Sumatra, Jawa, Kalimantan, Sulawesi, Papua"),
    K("geografi", "gunung api", "Merapi, Bromo, Krakatau, Semeru, Rinjani, Kerinci, Tambora"),
    K("geografi", "sungai", "Kapuas, Musi, Mahakam, Bengawan Solo, Citarum, Batanghari"),
    K("seni", "alat musik tradisional", "angklung, gamelan, sasando, kolintang, saluang, tifa"),
    K("seni", "alat musik modern", "gitar, piano, biola, drum, saksofon, terompet"),
    K("seni", "tarian daerah", "saman, kecak, pendet, jaipong, reog, tor-tor"),
    K("olahraga", "olahraga bola", "sepak bola, bola basket, bola voli, bola tangan, futsal"),
    K("olahraga", "nomor atletik", "lari, lompat jauh, lempar lembing, tolak peluru, lompat tinggi, lempar cakram"),
    K("olahraga", "bela diri", "silat, karate, judo, taekwondo, tinju, kempo"),
    K("alat", "alat tulis", "pena, pensil, penghapus, penggaris, spidol, kapur"),
    K("alat", "alat dapur", "wajan, panci, spatula, sendok sayur, saringan, parutan"),
    K("alat", "alat pertukangan", "palu, gergaji, obeng, tang, kikir, meteran"),
    K("alat", "alat elektronik rumah tangga", "televisi, radio, kulkas, kipas angin, setrika, mesin cuci"),
    K("tempat", "tempat ibadah", "masjid, gereja, pura, vihara, klenteng"),
    K("tempat", "fasilitas umum", "rumah sakit, sekolah, bandara, terminal, pasar, stasiun"),
    K("kelaskata", "kata kerja", "berlari, membaca, menulis, berenang, menyanyi, melompat, memasak"),
    K("kelaskata", "kata sifat", "tinggi, cantik, rajin, malas, bersih, kotor, cepat"),
    K("kelaskata", "kata benda", "meja, kursi, buku, rumah, jendela, lemari, dinding"),
    K("ibukota", "ibu kota negara ASEAN", "Bangkok, Hanoi, Manila, Kuala Lumpur, Vientiane, Phnom Penh, Naypyidaw"),
    K("ibukota", "ibu kota negara Eropa", "Paris, Berlin, Roma, Madrid, London, Lisboa, Wina"),
    K("ibukota", "ibu kota negara Asia Timur", "Tokyo, Seoul, Beijing, Ulaanbaatar"),
    K("imbuhan", "kata berawalan ber-", "bermain, berlari, bernyanyi, bekerja, berjalan, berenang"),
    K("imbuhan", "kata berawalan me-", "membaca, menulis, memasak, menari, menyapu, mengambil"),
    K("imbuhan", "kata berawalan di-", "dibaca, ditulis, dimasak, dibawa, dilihat, diambil"),
    K("bilangan", "bilangan kuadrat", "4, 9, 16, 25, 36, 49"),
    K("bilangan", "bilangan kubik", "8, 27, 64, 125, 216"),
    K("bilangan", "bilangan prima", "11, 13, 17, 19, 23, 29")
  ];
  const klas = (lv) => () => {
    const pool = KLAS.filter((c) => G3.includes(c.g) === (lv === 3));
    const c = pick(pool), dari = lv === 1 ? pool.filter((x) => x.g !== c.g) : pool.filter((x) => x.g === c.g && x !== c);
    const d = pick(dari), empat = mix(c.w).slice(0, 4), x = pick(d.w);
    return soal("Pilih kata yang <b>tidak sejenis</b> dengan keempat kata lainnya.",
      `Empat kata lain termasuk ${c.n} (${empat.join(", ")}). ${x} termasuk ${d.n}, jadi ${x} yang berbeda.`, opsi(x, empat));
  };
  G["Klasifikasi Kata"] = [[1, klas(1)], [1, klas(1)], [2, klas(2)], [2, klas(2)], [3, klas(3)]];

  // ================= TAMBAHAN NUMBER SEQUENCE =================
  const prima = (n) => { if (n < 2) return false; for (let i = 2; i * i <= n; i++) if (n % i === 0) return false; return true; };
  G.Numerik.push(
    [1, () => {
      const n0 = rnd(2, 9), t = [0, 1, 2, 3].map((i) => (n0 + i) * (n0 + i)), m = n0 + 4, r = m * m;
      return soal(`Deret: ${t.join(", ")}, ...`, `Bilangan kuadrat berurutan: ${t.map((v, i) => `${n0 + i}²`).join(", ")}. Berikutnya ${m}² = ${r}.`,
        opsi(r, [r + m, r - m, m * (m + 1), r + 1, r - 2]));
    }],
    [1, () => {
      const a = rnd(2, 20), d = rnd(2, 7), hilang = a + 2 * d;
      return soal(`Angka yang hilang pada deret: ${a}, ${a + d}, ..., ${a + 3 * d}, ${a + 4 * d}`, `Beda tiap suku ${d}. Suku ketiga = ${a + d} + ${d} = ${hilang}.`,
        opsi(hilang, [hilang + 1, hilang - 1, hilang + d, hilang - d, hilang + 2]));
    }],
    [2, () => {
      const ps = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37], i = rnd(0, 5), r = ps[i + 5], t = ps.slice(i, i + 5);
      const wrong = []; for (let v = r - 6; v <= r + 6; v++) if (v > 1 && !prima(v) && v !== r) wrong.push(v);
      return soal(`Deret: ${t.join(", ")}, ...`, `Deret bilangan prima berurutan. Setelah ${t[4]} adalah ${r}.`, opsi(r, wrong));
    }],
    [2, () => {
      const a = rnd(1, 6), b = rnd(1, 6), t = [a, b];
      for (let i = 2; i < 7; i++) t.push(t[i - 1] + t[i - 2]);
      return soal(`Deret: ${t.slice(0, 6).join(", ")}, ...`, `Tiap suku adalah jumlah dua suku sebelumnya: ${t[4]} + ${t[5]} = ${t[6]}.`,
        opsi(t[6], [t[5] + 2, t[5] * 2 - 1, t[6] + 1, t[6] - 1, t[5] + t[3]]));
    }],
    [2, () => {
      const r = pick([2, 3]), c = pick([-1, 1, 2, 3]), t = [rnd(1, 4)];
      for (let i = 1; i < 6; i++) t.push(t[i - 1] * r + c);
      return soal(`Deret: ${t.slice(0, 5).join(", ")}, ...`, `Pola: dikali ${r} lalu ${c > 0 ? "ditambah " + c : "dikurangi " + -c}. ${t[4]} × ${r} ${c > 0 ? "+ " + c : "− " + -c} = ${t[5]}.`,
        opsi(t[5], [t[4] * r, t[4] * r + (c > 0 ? c + 1 : c - 1), t[4] + t[3], t[5] + r, t[5] - r]));
    }],
    [2, () => {
      const n0 = rnd(1, 5), T = (n) => n * (n + 1) / 2, t = [0, 1, 2, 3, 4].map((i) => T(n0 + i)), r = T(n0 + 5);
      return soal(`Deret: ${t.join(", ")}, ...`, `Bilangan segitiga: selisihnya naik 1 tiap langkah (${t.slice(1).map((v, i) => v - t[i]).join(", ")}). Berikutnya ${t[4]} + ${n0 + 5} = ${r}.`,
        opsi(r, [r + 1, r - 1, t[4] + n0 + 4, r + 2, t[4] * 2 - t[3]]));
    }],
    [2, () => {
      const k = pick([-1, 1, 2, 3]), t = [1, 2, 3, 4, 5].map((n) => n * n + k), r = 36 + k;
      return soal(`Deret: ${t.join(", ")}, ...`, `Suku ke-n = n² ${k > 0 ? "+ " + k : "− " + -k}. Suku ke-6 = 36 ${k > 0 ? "+ " + k : "− " + -k} = ${r}.`,
        opsi(r, [r + 2, r - 2, r + 4, t[4] + 9, t[4] + 10]));
    }],
    [3, () => {
      const s = rnd(1, 4), a = rnd(2, 5), b = pick([2, 3]), t = [s];
      for (let i = 1; i < 6; i++) t.push(i % 2 ? t[i - 1] + a : t[i - 1] * b);
      return soal(`Deret: ${t.slice(0, 5).join(", ")}, ...`, `Operasi bergantian: + ${a} lalu × ${b}. ${t[4]} + ${a} = ${t[5]}.`,
        opsi(t[5], [t[4] * b, t[4] + a + 1, t[4] + a - 1, t[5] + b, t[4] * a]));
    }],
    [3, () => {
      const n0 = rnd(1, 5), t = [0, 1, 2, 3].map((i) => Math.pow(n0 + i, 3)), m = n0 + 4, r = Math.pow(m, 3);
      return soal(`Deret: ${t.join(", ")}, ...`, `Bilangan kubik berurutan: ${t.map((v, i) => `${n0 + i}³`).join(", ")}. Berikutnya ${m}³ = ${r}.`,
        opsi(r, [r - m, r + m, m * m * (m - 1), r + 1, (m + 1) * (m + 1) * m]));
    }]
  );

  // ================= DIAGRAM REASONING (tambahan Figural) =================
  const vennSvg = (p, q, s, atas) => `<svg viewBox="0 0 220 130" width="230" height="136" style="margin:4px" stroke="currentColor" stroke-width="2" fill="none"><rect x="2" y="2" width="216" height="126"/><circle cx="88" cy="68" r="42"/><circle cx="132" cy="68" r="42"/>` +
    `<g fill="currentColor" stroke="none" font-size="15" text-anchor="middle"><text x="68" y="73">${p}</text><text x="110" y="73">${q}</text><text x="154" y="73">${atas}</text><text x="204" y="120">${s}</text><text x="70" y="24" font-size="13">A</text><text x="150" y="24" font-size="13">B</text></g></svg>`;
  G.Figural.push(
    [2, () => {
      const p = rnd(4, 20), q = rnd(2, 12), r = rnd(3, 20), s = rnd(2, 15), N = p + q + r + s, mode = Math.random() < 0.5;
      const teks = mode ? `Jumlah seluruh siswa ${N} orang. Nilai tanda tanya (siswa yang hanya gemar B) adalah...` : `Diketahui yang gemar B seluruhnya ${q + r} orang. Nilai tanda tanya (siswa yang hanya gemar B) adalah...`;
      return soal(`Diagram Venn menunjukkan banyak siswa menurut kegemaran terhadap pelajaran A dan B (angka di luar lingkaran = tidak gemar keduanya).<div>${vennSvg(p, q, s, "?")}</div>${teks}`,
        mode ? `Seluruh siswa = ${p} + ${q} + ? + ${s} = ${N}, sehingga ? = ${N} − ${p + q + s} = ${r}.` : `Yang gemar B = irisan + hanya B = ${q} + ? = ${q + r}, sehingga ? = ${q + r} − ${q} = ${r}.`,
        opsi(r, [r + q, r - 1, r + 1, q + r, N - p - q]));
    }],
    [3, () => {
      const x = rnd(2, 9), p = pick([2, 3, 4]), hasil = x * p, T = hasil + pick([-3, -2, 2, 3]), u = rnd(2, 6), v = rnd(2, 7), w = pick([2, 3]);
      const cab = hasil > T ? hasil - u : hasil + v, ans = cab * w;
      return soal(`Ikuti diagram alir berikut:<div style="line-height:1.9">① Mulai dengan bilangan <b>${x}</b><br>② Kalikan dengan ${p}<br>③ Jika hasilnya lebih dari ${T}, kurangi ${u}; jika tidak, tambah ${v}<br>④ Kalikan hasilnya dengan ${w}<br>⑤ Selesai</div>Hasil akhir adalah...`,
        `② ${x} × ${p} = ${hasil}. ③ ${hasil} ${hasil > T ? ">" : "≤"} ${T}, jadi ${hasil > T ? `kurangi ${u}: ${cab}` : `tambah ${v}: ${cab}`}. ④ ${cab} × ${w} = ${ans}.`,
        opsi(ans, [(hasil > T ? hasil + v : hasil - u) * w, cab, cab + w, ans + w, (cab + 1) * w]));
    }]
  );

  // ================= VERBAL: MELENGKAPI KALIMAT =================
  const CLOZE = [
    ["Setelah berdebat panjang, kedua pihak akhirnya mencapai ____ yang menguntungkan semuanya.", "kesepakatan", ["kemarahan", "keterlambatan", "kebohongan", "kecurigaan"]],
    ["Siswa itu mendapat penghargaan karena ____ belajarnya yang luar biasa.", "ketekunan", ["keraguan", "kemalasan", "kecurangan", "kesombongan"]],
    ["Dokter menyarankan agar pasien ____ makanan yang berlemak tinggi.", "menghindari", ["menyukai", "mengejar", "menyimpan", "memuji"]],
    ["Banjir yang melanda desa itu ____ ratusan rumah warga.", "merendam", ["menanam", "menerbangkan", "membangun", "melukis"]],
    ["Pemerintah membangun waduk untuk ____ ketersediaan air pada musim kemarau.", "menjamin", ["menolak", "menghapus", "mengurangi", "meniadakan"]],
    ["Pidato presiden itu ____ semangat para pemuda untuk berkarya.", "membangkitkan", ["memadamkan", "menyalahkan", "menghentikan", "menyembunyikan"]],
    ["Data hasil survei itu harus ____ kebenarannya sebelum dipublikasikan.", "diverifikasi", ["dilupakan", "dihiasi", "disembunyikan", "dijauhkan"]],
    ["Karena kurang ____, mesin itu cepat rusak.", "perawatan", ["perhiasan", "pertunjukan", "perjalanan", "pertandingan"]],
    ["Ia ____ menyelesaikan tugas itu meskipun waktu yang tersedia sangat sempit.", "berhasil", ["gagal", "lupa", "menolak", "enggan"]],
    ["Perubahan iklim menjadi ancaman ____ bagi ketahanan pangan dunia.", "serius", ["ringan", "lucu", "manis", "santai"]],
    ["Polisi lalu lintas bertugas ____ ketertiban di jalan raya.", "menjaga", ["mengganggu", "melupakan", "menghindari", "menertawakan"]],
    ["Kemampuan berbahasa asing merupakan ____ penting dalam dunia kerja modern.", "modal", ["hambatan", "hukuman", "kebetulan", "kecelakaan"]],
    ["Penelitian itu didukung ____ yang kuat sehingga hasilnya dapat dipercaya.", "bukti", ["dugaan", "bayangan", "harapan", "kenangan"]],
    ["Jika harga naik terus, daya ____ masyarakat akan menurun.", "beli", ["tarik", "pikir", "henti", "pandang"]],
    ["Pegawai yang ____ selalu datang tepat waktu dan menyelesaikan tugas sesuai jadwal.", "disiplin", ["curang", "boros", "pelit", "angkuh"]],
    ["Ilmuwan itu ____ teori baru setelah bertahun-tahun melakukan percobaan.", "mengemukakan", ["menjemur", "menyobek", "mengunyah", "menyiram"]],
    ["Warga bergotong royong ____ lingkungan sebelum perayaan kemerdekaan.", "membersihkan", ["mengotori", "mengabaikan", "meninggalkan", "membakar"]],
    ["Hakim harus bersikap ____ dalam memutuskan perkara tanpa memihak.", "adil", ["curang", "emosional", "sembrono", "pelit"]],
    ["Pembangunan jalan tol diharapkan dapat ____ pertumbuhan ekonomi daerah.", "mendorong", ["menghambat", "menyalahkan", "menutup", "mengurangi"]],
    ["Ia tidak ____ pada janjinya sehingga banyak orang percaya kepadanya.", "ingkar", ["setia", "patuh", "jujur", "taat"]],
    ["Kedatangan tamu kehormatan itu disambut dengan ____ yang meriah.", "upacara", ["kemarahan", "ketakutan", "kesedihan", "kebisuan"]],
    ["Bencana alam sering terjadi tanpa ____ sehingga masyarakat perlu selalu waspada.", "peringatan", ["pelajaran", "pertunjukan", "pembayaran", "perhiasan"]],
    ["Kebijakan baru itu masih ____ sehingga belum dapat diterapkan.", "dikaji", ["dinikmati", "ditanam", "dilukis", "dimasak"]],
    ["Atlet itu menjalani latihan ____ sebelum bertanding di tingkat nasional.", "intensif", ["santai", "sembarangan", "terbalik", "bisu"]]
  ];
  const cloze = () => {
    const [k, b, s] = pick(CLOZE);
    return soal(`Kata yang paling tepat untuk melengkapi kalimat berikut adalah...<br><b>${k}</b>`,
      `Kata yang paling tepat adalah <b>${b}</b> karena sesuai dengan makna dan konteks kalimat.`, opsi(b, s));
  };
  G.Verbal.push([2, cloze], [3, cloze]);

  // ================= INFORMATIKA (Tes Bidang) =================
  const kode = (baris) => `<div style="font-family:monospace;background:rgba(127,127,127,.12);padding:6px 10px;border-radius:6px;margin:6px 0;line-height:1.6">${baris.join("<br>")}</div>`;
  const tabelHtml = (kepala, baris) => `<table style="border-collapse:collapse;margin:6px 0">` +
    `<tr>${kepala.map((k) => `<th style="border:1px solid currentColor;padding:2px 10px">${k}</th>`).join("")}</tr>` +
    baris.map((b) => `<tr>${b.map((c) => `<td style="border:1px solid currentColor;padding:2px 10px">${c}</td>`).join("")}</tr>`).join("") + `</table>`;
  const bin = (n) => n.toString(2);
  const balik = (s) => s.split("").reverse().join("");

  // ---- Sistem Komputer: bilangan, gerbang logika, transfer data ----
  G["Sistem Komputer"] = [
    [1, () => {
      const n = rnd(5, 63), b = bin(n);
      return soal(`Bilangan desimal ${n} jika dinyatakan dalam biner adalah...`, `Bagi 2 berulang dan baca sisa dari bawah: ${n}₁₀ = ${b}₂.`,
        opsi(b, [bin(n + 1), bin(n - 1), balik(b) === b ? bin(n + 2) : balik(b), bin(n + 2), bin(n - 2)].filter((x) => x !== b)));
    }],
    [1, () => {
      const n = rnd(5, 63), b = bin(n);
      return soal(`Bilangan biner ${b} jika dinyatakan dalam desimal adalah...`, `Jumlahkan bobot 2ⁿ yang bernilai 1: ${b}₂ = ${n}₁₀.`,
        opsi(n, [n + 1, n - 1, parseInt(balik(b), 2) === n ? n + 2 : parseInt(balik(b), 2), n + 2, n * 2]));
    }],
    [2, () => {
      const n = rnd(16, 255), h = n.toString(16).toUpperCase(), f = (v) => v.toString(16).toUpperCase();
      return soal(`Bilangan desimal ${n} jika dinyatakan dalam heksadesimal adalah...`, `${n} ÷ 16 = ${Math.floor(n / 16)} sisa ${n % 16}; hasil ${h}₁₆.`,
        opsi(h, [f(n + 1), f(n - 1), f(n + 16), f(n - 16), balik(h) === h ? f(n + 2) : balik(h)].filter((x) => x !== h)));
    }],
    [2, () => {
      const a = rnd(5, 30), b = rnd(5, 30), s = bin(a + b);
      return soal(`Hasil penjumlahan biner ${bin(a)} + ${bin(b)} adalah...`, `${bin(a)}₂ = ${a}, ${bin(b)}₂ = ${b}; jumlah ${a + b} = ${s}₂.`,
        opsi(s, [bin(a + b + 1), bin(a + b - 1), bin(a ^ b), bin(a | b), bin(a + b + 2), bin(a + b - 2), bin(a + b + 3), bin(Math.abs(a - b))].filter((x) => x !== s)));
    }],
    [2, () => {
      const mb = pick([50, 100, 200, 400, 600]), mbps = pick([10, 20, 25, 40, 50, 100]), t = mb * 8 / mbps;
      if (!Number.isInteger(t)) return G["Sistem Komputer"][0][1]();
      return soal(`File berukuran ${mb} MB diunduh pada kecepatan ${mbps} Mbps (megabit per detik). Waktu unduh (detik) adalah...`,
        `${mb} MB × 8 = ${mb * 8} Mb. Waktu = ${mb * 8} / ${mbps} = ${t} detik.`, opsi(t, [mb / mbps, t * 8, t / 8, mb * mbps, t + 8]));
    }],
    [3, () => {
      const ex = [
        ["(A AND B) OR C", (a, b, c) => (a && b) || c], ["A XOR B XOR C", (a, b, c) => a ^ b ^ c],
        ["(A OR B) AND (NOT C)", (a, b, c) => (a || b) && !c], ["NOT (A AND B) OR C", (a, b, c) => !(a && b) || c], ["(A XOR B) AND C", (a, b, c) => (a ^ b) && c]
      ], [nama, f] = pick(ex);
      let n = 0; for (let a = 0; a < 2; a++) for (let b = 0; b < 2; b++) for (let c = 0; c < 2; c++) if (f(a, b, c)) n++;
      return soal(`Dari 8 kombinasi nilai (A, B, C), berapa kombinasi yang menghasilkan keluaran 1 pada ekspresi <b>${nama}</b>?`,
        `Telusuri tabel kebenaran 8 baris untuk ${nama}: jumlah baris keluaran 1 adalah ${n}.`, opsi(n, [n + 1, n - 1, n + 2, 8 - n, 4].filter((v) => v >= 0 && v <= 8)));
    }]
  ];

  // ---- Jaringan & Keamanan: kelas IP, CIDR, subnet ----
  const maskDari = (p) => { const o = []; for (let i = 0; i < 4; i++) { const bits = Math.max(0, Math.min(8, p - i * 8)); o.push(256 - Math.pow(2, 8 - bits)); } return o.join("."); };
  G["Jaringan & Keamanan"] = [
    [1, () => {
      const rentang = [["Kelas A", 1, 126], ["Kelas B", 128, 191], ["Kelas C", 192, 223], ["Kelas D", 224, 239], ["Kelas E", 240, 254]], [k, lo, hi] = pick(rentang), o = rnd(lo, hi);
      return soal(`Alamat IP ${o}.${rnd(0, 255)}.${rnd(0, 255)}.${rnd(1, 254)} termasuk...`, `Oktet pertama ${o} berada pada rentang ${lo}–${hi}, yaitu ${k}.`, opsi(k, rentang.map((r) => r[0]).filter((x) => x !== k)));
    }],
    [2, () => {
      const p = rnd(20, 29), h = Math.pow(2, 32 - p) - 2;
      return soal(`Jumlah host yang dapat dipakai pada jaringan dengan prefiks /${p} adalah...`, `Bit host = 32 − ${p} = ${32 - p}. Host = 2^${32 - p} − 2 = ${h}.`,
        opsi(h, [h + 2, h + 1, h * 2 + 2, Math.pow(2, 31 - p) - 2, h - 2]));
    }],
    [2, () => {
      const p = rnd(17, 30), m = maskDari(p);
      return soal(`Subnet mask untuk prefiks /${p} adalah...`, `/${p} berarti ${p} bit pertama bernilai 1, yaitu ${m}.`,
        opsi(m, [maskDari(p - 1), maskDari(p + 1), maskDari(p - 2), maskDari(p + 2), maskDari(p - 3)]));
    }],
    [3, () => {
      const p = pick([25, 26, 27, 28]), blok = Math.pow(2, 32 - p), d = rnd(1, 254), net = d - (d % blok), ip = `192.168.${rnd(1, 20)}.${d}`;
      const dasar = ip.split(".").slice(0, 3).join("."), jawab = `${dasar}.${net}`;
      return soal(`Alamat jaringan (network address) dari host ${ip}/${p} adalah...`, `Ukuran blok = 2^${32 - p} = ${blok}. Oktet terakhir ${d} berada pada blok yang dimulai ${net}, jadi network address ${jawab}.`,
        opsi(jawab, [net + blok, net - blok, 0, d, net + 1, net + 2 * blok, net + blok - 1, net + 2].filter((v) => v >= 0 && v <= 255 && v !== net).map((v) => `${dasar}.${v}`)));
    }],
    [3, () => {
      const p = pick([26, 27, 28]), blok = Math.pow(2, 32 - p), d = rnd(1, 254), net = d - (d % blok), bc = net + blok - 1, dasar = `10.1.${rnd(1, 20)}`, ip = `${dasar}.${d}`;
      return soal(`Alamat broadcast dari host ${ip}/${p} adalah...`, `Blok berukuran ${blok}; network ${dasar}.${net}. Broadcast = alamat terakhir blok = ${dasar}.${bc}.`,
        opsi(`${dasar}.${bc}`, [bc - 1, bc + blok, net, 255, net + blok, bc - blok, net + 1].filter((v) => v >= 0 && v <= 255 && v !== bc).map((v) => `${dasar}.${v}`)));
    }]
  ];

  // ---- Pemrograman & Algoritma: penelusuran kode ----
  G["Pemrograman & Algoritma"] = [
    [1, () => {
      const a = rnd(1, 5), b = a + rnd(3, 8), s = pick([1, 2]);
      let t = 0; for (let i = a; i <= b; i += s) t += i;
      return soal(`Perhatikan kode berikut:${kode(["total = 0", `untuk i = ${a} sampai ${b} langkah ${s}:`, "&nbsp;&nbsp;total = total + i"])}Nilai total setelah perulangan selesai adalah...`,
        `i bernilai ${(() => { const l = []; for (let i = a; i <= b; i += s) l.push(i); return l.join(", "); })()}; jumlahnya ${t}.`, opsi(t, [t + b, t - a, t + a, t * 2, t - 1]));
    }],
    [1, () => {
      const a = rnd(20, 99), b = rnd(3, 9), r = Math.floor(a / b) + (a % b);
      return soal(`Jika <b>div</b> adalah pembagian bilangan bulat dan <b>mod</b> adalah sisa bagi, nilai hasil dari ${kode([`x = ${a} div ${b}`, `y = ${a} mod ${b}`, "hasil = x + y"])}adalah...`,
        `${a} div ${b} = ${Math.floor(a / b)}; ${a} mod ${b} = ${a % b}; hasil = ${r}.`, opsi(r, [Math.floor(a / b), a % b, r + 1, r - 1, Math.floor(a / b) * (a % b)]));
    }],
    [2, () => {
      const x0 = rnd(30, 80), d = rnd(4, 9), t = rnd(5, 20);
      let x = x0, c = 0; while (x > t) { x -= d; c++; }
      return soal(`Perhatikan kode berikut:${kode([`x = ${x0}`, "c = 0", `selama x > ${t}:`, `&nbsp;&nbsp;x = x - ${d}`, "&nbsp;&nbsp;c = c + 1"])}Nilai c setelah perulangan berhenti adalah...`,
        `Kurangi ${d} dari ${x0} sampai tidak lebih dari ${t}; banyak pengurangan ${c} (x akhir ${x}).`, opsi(c, [c + 1, c - 1, c + 2, Math.max(1, c - 2), x]));
    }],
    [2, () => {
      const n = rnd(6, 11), f = [0, 1]; for (let i = 2; i <= n + 1; i++) f.push(f[i - 1] + f[i - 2]);
      return soal(`Fungsi rekursif f(n) = f(n−1) + f(n−2) dengan f(0) = 0 dan f(1) = 1. Nilai f(${n}) adalah...`, `Deret: ${f.slice(0, n + 1).join(", ")}. Jadi f(${n}) = ${f[n]}.`,
        opsi(f[n], [f[n + 1], f[n - 1], f[n] + 1, f[n - 1] + 1, f[n - 2]]));
    }],
    [2, () => {
      const ops = [], st = []; let n = rnd(5, 8);
      for (let i = 0; i < n; i++) {
        if (st.length > 1 && Math.random() < 0.4) { ops.push("pop()"); st.pop(); } else { const v = rnd(1, 9); ops.push(`push(${v})`); st.push(v); }
      }
      const atas = st[st.length - 1];
      return soal(`Sebuah stack kosong dikenai operasi berikut secara berurutan: <b>${ops.join(", ")}</b>. Elemen paling atas stack sekarang adalah...`,
        `Stack bersifat LIFO. Isi akhir dari bawah ke atas: ${st.join(", ")}. Elemen teratas ${atas}.`, opsi(atas, [st[0], atas + 1, atas === 1 ? 2 : atas - 1, st.length, 0].filter((x) => x !== atas)));
    }],
    [3, () => {
      const a = []; while (a.length < 5) { const v = rnd(1, 9); if (!a.includes(v)) a.push(v); }
      const b = a.slice(); for (let i = 0; i < b.length - 1; i++) if (b[i] > b[i + 1]) { const t = b[i]; b[i] = b[i + 1]; b[i + 1] = t; }
      const f = (x) => x.join(", "), urut = a.slice().sort((p, q) => p - q);
      if (f(b) === f(a)) return G["Pemrograman & Algoritma"][0][1]();
      const dua = b.slice(); for (let i = 0; i < dua.length - 1; i++) if (dua[i] > dua[i + 1]) { const t = dua[i]; dua[i] = dua[i + 1]; dua[i + 1] = t; }
      return soal(`Array [${f(a)}] diurutkan dengan bubble sort naik. Isi array setelah <b>satu putaran</b> (satu kali lintasan dari awal sampai akhir) adalah...`,
        `Bandingkan pasangan berdekatan dan tukar bila kiri > kanan. Hasil satu putaran: [${f(b)}].`, opsi(`[${f(b)}]`, [`[${f(a)}]`, `[${f(urut)}]`, `[${f(dua)}]`, `[${f(a.slice().reverse())}]`, `[${f(urut.slice().reverse())}]`, `[${f([a[1], a[0]].concat(a.slice(2)))}]`, `[${f(b.slice(0, 3).concat([b[4], b[3]]))}]`, `[${f(a.slice(1).concat([a[0]]))}]`].filter((x, i, arr) => x !== `[${f(b)}]` && arr.indexOf(x) === i)));
    }],
    [3, () => {
      const n = rnd(8, 31), arr = Array.from({ length: n }, (_, i) => (i + 1) * 3), tgt = pick(arr);
      let lo = 0, hi = n - 1, c = 0; while (lo <= hi) { const m = Math.floor((lo + hi) / 2); c++; if (arr[m] === tgt) break; if (arr[m] < tgt) lo = m + 1; else hi = m - 1; }
      return soal(`Pencarian biner dilakukan pada array terurut dengan ${n} elemen (3, 6, 9, ..., ${n * 3}) untuk mencari nilai ${tgt}. Indeks tengah dihitung sebagai ⌊(awal + akhir) / 2⌋ dengan indeks mulai 0. Banyak perbandingan sampai nilai ditemukan adalah...`,
        `Simulasikan penyempitan rentang; nilai ${tgt} ditemukan pada perbandingan ke-${c}.`, opsi(c, [c + 1, c - 1, c + 2, Math.max(1, c - 2), n]));
    }]
  ];

  // ---- Basis Data: SQL pada tabel kecil ----
  const NAMA_DB = ["Ani", "Budi", "Citra", "Dewi", "Eko", "Fajar", "Gita", "Hadi"], KOTA_DB = ["Jakarta", "Bandung", "Medan"];
  const tabelDb = () => {
    const nm = mix(NAMA_DB).slice(0, 6);
    return nm.map((n, i) => ({ id: i + 1, nama: n, kota: pick(KOTA_DB), nilai: rnd(5, 9) * 10 + pick([0, 5]) }));
  };
  const htmlDb = (t) => tabelHtml(["id", "nama", "kota", "nilai"], t.map((r) => [r.id, r.nama, r.kota, r.nilai]));
  G["Basis Data"] = [
    [1, () => {
      const t = tabelDb(), x = pick([60, 70, 75, 80]), n = t.filter((r) => r.nilai > x).length;
      return soal(`Tabel <b>siswa</b>:${htmlDb(t)}Hasil query <code>SELECT COUNT(*) FROM siswa WHERE nilai &gt; ${x};</code> adalah...`,
        `Hitung baris dengan nilai > ${x}: ada ${n} baris.`, opsi(n, [n + 1, n - 1, n + 2, t.length, Math.max(0, n - 2)].filter((v) => v >= 0)));
    }],
    [1, () => {
      const t = tabelDb(), fn = pick(["MAX", "MIN", "SUM"]), v = fn === "MAX" ? Math.max(...t.map((r) => r.nilai)) : fn === "MIN" ? Math.min(...t.map((r) => r.nilai)) : t.reduce((a, r) => a + r.nilai, 0);
      return soal(`Tabel <b>siswa</b>:${htmlDb(t)}Hasil query <code>SELECT ${fn}(nilai) FROM siswa;</code> adalah...`, `${fn} atas kolom nilai (${t.map((r) => r.nilai).join(", ")}) = ${v}.`,
        opsi(v, [v + 5, v - 5, v + 10, fn === "SUM" ? v - 10 : Math.max(...t.map((r) => r.nilai)) + 5, t.length]));
    }],
    [2, () => {
      const t = tabelDb(), kota = pick(KOTA_DB), n = t.filter((r) => r.kota === kota).length;
      if (n === 0) return G["Basis Data"][0][1]();
      return soal(`Tabel <b>siswa</b>:${htmlDb(t)}Hasil query <code>SELECT COUNT(*) FROM siswa WHERE kota = '${kota}';</code> adalah...`, `Baris dengan kota ${kota}: ${n}.`,
        opsi(n, [n + 1, n - 1, n + 2, t.length, 0].filter((v) => v >= 0)));
    }],
    [2, () => {
      const t = tabelDb(), top = Math.max(...t.map((r) => r.nilai)), puncak = t.filter((r) => r.nilai === top);
      if (puncak.length !== 1) return G["Basis Data"][0][1]();
      return soal(`Tabel <b>siswa</b>:${htmlDb(t)}Hasil query <code>SELECT nama FROM siswa ORDER BY nilai DESC LIMIT 1;</code> adalah...`, `Urutkan nilai menurun; nilai tertinggi ${top} dimiliki ${puncak[0].nama}.`,
        opsi(puncak[0].nama, t.filter((r) => r !== puncak[0]).map((r) => r.nama)));
    }],
    [3, () => {
      const t = tabelDb(), n = new Set(t.map((r) => r.kota)).size;
      return soal(`Tabel <b>siswa</b>:${htmlDb(t)}Berapa baris yang dikembalikan oleh <code>SELECT kota, COUNT(*) FROM siswa GROUP BY kota;</code>?`, `GROUP BY menghasilkan satu baris per kota berbeda: ${n}.`,
        opsi(n, [n + 1, n - 1, t.length, t.length - 1, 0].filter((v) => v >= 0)));
    }],
    [3, () => {
      const t = tabelDb(), x = pick([60, 70, 75]), k = pick(KOTA_DB), n = t.filter((r) => r.kota === k && r.nilai >= x).length;
      return soal(`Tabel <b>siswa</b>:${htmlDb(t)}Hasil <code>SELECT COUNT(*) FROM siswa WHERE kota = '${k}' AND nilai &gt;= ${x};</code> adalah...`, `Kedua syarat harus terpenuhi: ada ${n} baris.`,
        opsi(n, [n + 1, n + 2, Math.max(0, n - 1), t.filter((r) => r.kota === k || r.nilai >= x).length, t.length].filter((v) => v >= 0)));
    }]
  ];

  // ================= PSIKOTES POLRI (versi pilihan ganda) =================
  const mono = (t) => `<span style="font-family:ui-monospace,Consolas,monospace;letter-spacing:.18em;font-weight:700">${t}</span>`;
  const DIGIT = "0123456789".split(""), HURUF = "ABCDEFGHJKLMNPQRSTUVWXYZ".split(""), SIMBOL = "# $ % * + = ? @ ~ ^ !".split(" ");

  // Karakter hilang: kelompok lengkap diberikan terurut, lalu versi acak dengan satu karakter hilang.
  const hilang = (lv) => () => {
    const n = [8, 9, 10][lv - 1], pool = lv === 1 ? DIGIT : lv === 2 ? HURUF : DIGIT.concat(HURUF.slice(0, 8), SIMBOL.slice(0, 4));
    const lengkap = mix(pool).slice(0, n), x = pick(lengkap), sisa = lengkap.filter((c) => c !== x);
    const urut = lengkap.slice().sort(), tampil = mix(sisa);
    return soal(`Kelompok lengkap: ${mono(urut.join(" "))}<br>Kelompok berikut kurang satu karakter: ${mono(tampil.join(" "))}<br>Karakter yang hilang adalah...`,
      `Bandingkan dengan kelompok lengkap: karakter ${x} tidak muncul pada kelompok yang diberikan.`, opsi(x, sisa));
  };
  G["Karakter Hilang"] = [[1, hilang(1)], [2, hilang(2)], [3, hilang(3)]];

  // Variasi string: tukar dua karakter berdekatan, atau ganti satu karakter.
  const variasi = (s, pool, dipakai) => {
    for (let k = 0; k < 40; k++) {
      const a = s.split(""), i = rnd(0, a.length - 2);
      if (Math.random() < 0.5) { const t = a[i]; a[i] = a[i + 1]; a[i + 1] = t; } else a[i] = pick(pool.filter((c) => c !== a[i]));
      const v = a.join("");
      if (v !== s && !dipakai.includes(v)) return v;
    }
    return s + "0";
  };
  const rakit = (n, pool) => mix(pool).slice(0, n).join("");
  const pasangan = (lv) => () => {
    const n = [5, 6, 8][lv - 1], pool = lv === 1 ? DIGIT : DIGIT.concat(HURUF), t = rakit(n, pool), v = [t];
    while (v.length < 5) v.push(variasi(t, pool, v));
    return soal(`Pilih pasangan yang <b>sama persis</b> dengan: ${mono(t)}`, `Periksa karakter demi karakter; hanya ${t} yang identik, yang lain tertukar atau berbeda satu karakter.`, opsi(t, v.slice(1)));
  };
  G["Pasangan Sama"] = [[1, pasangan(1)], [2, pasangan(2)], [3, pasangan(3)]];

  // Satu baris berbeda dari empat baris lainnya.
  const beda = (lv) => () => {
    const n = [5, 6, 8][lv - 1], pool = lv === 1 ? DIGIT : DIGIT.concat(HURUF), t = rakit(n, pool), v = variasi(t, pool, [t]), k = rnd(0, 4);
    const baris = [0, 1, 2, 3, 4].map((i) => (i === k ? v : t));
    return soal(`Empat baris berikut identik dan satu berbeda. Baris mana yang berbeda?<br>${baris.map((b, i) => `${i + 1}. ${mono(b)}`).join("<br>")}`,
      `Baris ${k + 1} (${v}) berbeda dari baris lain (${t}).`, { opts: [0, 1, 2, 3, 4].map((i) => `Baris ${i + 1}`), ans: k });
  };
  G["Satu Berbeda"] = [[1, beda(1)], [2, beda(2)], [3, beda(3)]];

  // Kraepelin/Pauli: jumlahkan angka berdekatan dari atas ke bawah, tulis angka satuannya.
  const kraepelin = (lv) => () => {
    const n = [6, 8, 10][lv - 1], d = Array.from({ length: n }, () => rnd(1, 9)), h = [];
    for (let i = 0; i < n - 1; i++) h.push((d[i] + d[i + 1]) % 10);
    const f = (a) => a.join(" "), v = [f(h)];
    for (let t = 0; v.length < 5 && t < 60; t++) {
      const a = h.slice(), i = rnd(0, a.length - 1);
      a[i] = (a[i] + pick([1, 2, 8, 9])) % 10;
      if (!v.includes(f(a))) v.push(f(a));
    }
    return soal(`Jumlahkan setiap dua angka yang berdekatan dari kiri ke kanan, tulis hanya <b>angka satuan</b> hasilnya.<br>Deret: ${mono(d.join(" "))}<br>Urutan angka satuan yang benar adalah...`,
      `Pasangan berdekatan: ${d.slice(0, n - 1).map((x, i) => `${x}+${d[i + 1]}=${x + d[i + 1]}→${h[i]}`).join(", ")}. Hasil: ${f(h)}.`, opsi(f(h), v.slice(1)));
  };
  G["Hitung Berderet"] = [[1, kraepelin(1)], [2, kraepelin(2)], [3, kraepelin(3)]];

  // Psikotes intelegensi: hanya pola gambar/matriks (tanpa diagram Venn dan diagram alir).
  G["Matriks & Pola"] = G.Figural.slice(0, 7);

  // Nama topik lain memakai daftar yang sama.
  G["TIU Verbal"] = G.Verbal;
  G["TIU Figural"] = G.Figural;
  G["Bahasa Inggris"] = G.Grammar.concat(G.Vocabulary);

  // ================= API =================
  const ALIAS = { "TIU Numerik": "Numerik" };
  let urut = 0;
  const kunci = (s) => s.q + "|" + s.opts.slice().sort().join("¦"); // q saja bisa sama (mis. klasifikasi kata)
  const GEN = {
    ada: (topik) => !!G[ALIAS[topik] || topik],
    // Satu soal baru untuk topik; level 1-3 (acak bila kosong). Bentuk sama dengan soal bank.
    buat(topik, level) {
      const L = G[ALIAS[topik] || topik];
      level = level || pick([1, 2, 2, 3]);
      const c = L.filter((e) => e[0] === level), e = pick(c.length ? c : L);
      return Object.assign(e[1](), { id: "gen-" + ++urut, topik: topik, level: e[0] });
    },
    // Susun `butuh` soal satu topik: maks 1/3 dari bank manual (pool), sisanya generate.
    susun(topik, butuh, pool) {
      if (!GEN.ada(topik)) return mix(pool).slice(0, butuh);
      const m = mix(pool).slice(0, Math.ceil(butuh / 3));
      return m.concat(GEN.banyak(topik, butuh - m.length, m.map(kunci)));
    },
    // Tambahan soal mode latihan tanpa akhir: jml soal dari topik-topik yang punya generator.
    lagi(topiks, jml) {
      const ts = topiks.filter(GEN.ada);
      return ts.length ? Array.from({ length: jml }, (_, i) => GEN.buat(ts[i % ts.length])) : [];
    },
    // jml soal unik (juga dari daftar kunci `hindari`), sebaran level 30/40/30.
    banyak(topik, jml, hindari) {
      const pakai = new Set(hindari || []), hasil = [];
      const tiga = Math.round(jml * 0.3), lv = [];
      for (let i = 0; i < jml; i++) lv.push(i < tiga ? 1 : i < jml - tiga ? 2 : 3);
      lv.forEach((l) => {
        for (let coba = 0; coba < 20; coba++) {
          const s = GEN.buat(topik, l);
          if (!pakai.has(kunci(s))) { pakai.add(kunci(s)); hasil.push(s); return; }
        }
      });
      return hasil;
    }
  };

  if (typeof module !== "undefined") module.exports = GEN;
  else window.GEN = GEN;
})();
