// Uji alur API (daftar, login, simpan hasil, akses master). Server harus jalan di :3125 dengan DB_PATH sementara dan master1 sudah dibuat.
// Env: UJI_PW_USER, UJI_PW_MASTER. Jalankan: node scripts/uji-api.mjs
import { createRequire } from "node:module";
const B = "http://localhost:3125";
const J = { "content-type": "application/json" };
let cookie = {};
async function req(nama, path, { method = "GET", body, as } = {}) {
  const h = { ...J };
  if (as && cookie[as]) h.cookie = cookie[as];
  const r = await fetch(B + path, { method, headers: h, body: body === undefined ? undefined : JSON.stringify(body), redirect: "manual" });
  const sc = r.headers.get("set-cookie");
  if (sc && as) cookie[as] = sc.split(";")[0];
  const t = await r.text(); let j; try { j = JSON.parse(t); } catch { j = t.slice(0, 80); }
  return { s: r.status, j };
}
const ok = (c, m) => { console.log((c ? "OK   " : "GAGAL") + " " + m); if (!c) process.exitCode = 1; };

const pw = process.env.UJI_PW_USER, pwm = process.env.UJI_PW_MASTER;
let r;
r = await req("", "/api/auth/me", { as: "x" }); ok(r.s === 200 && r.j.user === null, "me tanpa login = null");
r = await req("", "/api/attempts", { as: "x" }); ok(r.s === 401, "attempts tanpa login ditolak");
r = await req("", "/api/auth/register", { method: "POST", body: { username: "ab", nama: "X", password: pw }, as: "u1" }); ok(r.s === 400, "username terlalu pendek ditolak");
r = await req("", "/api/auth/register", { method: "POST", body: { username: "budi", nama: "Budi", password: "pendek" }, as: "u1" }); ok(r.s === 400, "password pendek ditolak");
r = await req("", "/api/auth/register", { method: "POST", body: { username: "budi", nama: "Budi", password: pw }, as: "u1" }); ok(r.s === 200 && r.j.user.role === "user", "daftar user");
r = await req("", "/api/auth/register", { method: "POST", body: { username: "BUDI", nama: "Lain", password: pw }, as: "u9" }); ok(r.s === 409, "username kembar (tanpa beda huruf besar) ditolak");
r = await req("", "/api/auth/me", { as: "u1" }); ok(r.j.user && r.j.user.username === "budi", "me setelah daftar");
const detail = [
  { t: "Verbal", q: "Soal 1", o: ["a", "b", "c", "d", "e"], a: 2, j: 2, b: "bahas" },
  { t: "Verbal", q: "Soal 2", o: ["a", "b", "c", "d", "e"], a: 0, j: 1, b: "bahas" },
  { t: "Numerik", q: "Soal 3", o: ["a", "b", "c", "d", "e"], a: 4, j: null, b: "bahas" },
  { t: "Amanah", q: "Soal 4", o: ["a", "b", "c", "d", "e"], a: 1, j: 1, s: [1, 5, 2, 1, 1], b: "bahas" },
];
r = await req("", "/api/attempts", { method: "POST", body: { tes: "tkd", durasi: 600, detail }, as: "u1" });
ok(r.s === 200 && r.j.skor === 6 && r.j.maks === 8 && r.j.pct === 75, "skor dihitung server (6/8 = 75%) -> " + JSON.stringify(r.j));
r = await req("", "/api/attempts", { method: "POST", body: { tes: "tidak-ada", detail }, as: "u1" }); ok(r.s === 400, "tes tidak dikenal ditolak");
r = await req("", "/api/attempts", { method: "POST", body: { tes: "tkd", detail: [{ ...detail[0], j: 9 }] }, as: "u1" }); ok(r.s === 400, "indeks jawaban di luar rentang ditolak");
const idA = (await req("", "/api/attempts", { as: "u1" })).j.percobaan[0].id;
r = await req("", "/api/attempts", { as: "u1" }); ok(r.j.percobaan.length === 1 && r.j.percobaan[0].perTopik.length === 3, "riwayat sendiri 1 percobaan, 3 topik");
r = await req("", "/api/master/users", { as: "u1" }); ok(r.s === 403, "user biasa ditolak di area master");
r = await req("", "/api/auth/register", { method: "POST", body: { username: "siti", nama: "Siti", password: pw }, as: "u2" });
r = await req("", "/api/attempts/" + idA, { as: "u2" }); ok(r.s === 404, "user lain tidak bisa membuka percobaan orang lain");
r = await req("", "/api/auth/login", { method: "POST", body: { username: "budi", password: "salahsalah" }, as: "z" }); ok(r.s === 401, "login password salah ditolak");
r = await req("", "/api/auth/login", { method: "POST", body: { username: "tidakada", password: pw }, as: "z" }); ok(r.s === 401 && r.j.galat === "Username atau password salah.", "pesan sama untuk username tidak ada");
r = await req("", "/api/auth/login", { method: "POST", body: { username: "master1", password: pwm }, as: "m" }); ok(r.s === 200 && r.j.user.role === "master", "login master");
r = await req("", "/api/master/users", { as: "m" }); const budi = r.j.users.find((u) => u.username === "budi");
ok(r.s === 200 && budi && budi.jumlah === 1 && budi.rata === 75 && budi.terlemah, "master melihat ringkasan budi: " + JSON.stringify({ jumlah: budi?.jumlah, rata: budi?.rata, terlemah: budi?.terlemah }));
r = await req("", "/api/master/users/" + budi.id, { as: "m" }); ok(r.s === 200 && r.j.percobaan.length === 1 && r.j.ringkasan.perTopik[0].topik, "master membuka detail user");
r = await req("", "/api/attempts/" + idA, { as: "m" }); ok(r.s === 200 && r.j.detail.length === 4, "master membuka jawaban per soal");
r = await req("", "/api/master/users", { method: "POST", body: { username: "dewi", nama: "Dewi", password: pw }, as: "m" }); ok(r.s === 200, "master membuat akun user");
r = await req("", "/api/master/users/" + budi.id, { method: "PATCH", body: { aktif: false }, as: "m" }); ok(r.s === 200, "master menonaktifkan budi");
r = await req("", "/api/auth/me", { as: "u1" }); ok(r.j.user === null, "sesi budi langsung tidak berlaku");
r = await req("", "/api/auth/login", { method: "POST", body: { username: "budi", password: pw }, as: "z" }); ok(r.s === 403, "budi tidak bisa login saat nonaktif");
r = await req("", "/api/master/users/" + budi.id, { method: "PATCH", body: { aktif: true, password: pw + "baru" }, as: "m" }); ok(r.s === 200, "master mengaktifkan + reset password");
r = await req("", "/api/auth/login", { method: "POST", body: { username: "budi", password: pw + "baru" }, as: "u1" }); ok(r.s === 200, "budi login dengan password baru");
const m = await req("", "/api/auth/me", { as: "m" });
r = await req("", "/api/master/users/" + m.j.user.id, { method: "PATCH", body: { aktif: false }, as: "m" }); ok(r.s === 400, "master tidak bisa menonaktifkan diri sendiri");
r = await req("", "/api/auth/logout", { method: "POST", body: {}, as: "u1" }); r = await req("", "/api/auth/me", { as: "u1" });
// cookie dihapus di klien; pastikan token lama sudah tidak berlaku di server
r = await fetch(B + "/api/auth/register", { method: "POST", headers: { "content-type": "text/plain" }, body: "{}" }); ok(r.status === 400, "POST non-JSON ditolak (perlindungan CSRF)");

// ---- pengerasan ----
r = await req("", "/api/auth/login", { method: "POST", body: { username: "budi", password: pw + "baru" }, as: "u1" });
const besar = { tes: "tkd", durasi: 1, detail: [{ t: "X", q: "x".repeat(5_000_000), o: ["a", "b"], a: 0, j: 0, b: "b" }] };
r = await req("", "/api/attempts", { method: "POST", body: besar, as: "u1" }); ok(r.s === 400 || r.s === 413, "body > 4 MB ditolak (status " + r.s + ")");
const xss = [{ t: "Verbal", q: "<img src=x onerror=alert(1)>soal", o: ["a", "b", "c", "d", "e"], a: 0, j: 0, b: "ok" }];
r = await req("", "/api/attempts", { method: "POST", body: { tes: "tkd", durasi: 5, detail: xss }, as: "u1" }); ok(r.s === 200, "server menerima detail (sanitasi dilakukan saat render)");
const lst = await req("", "/api/attempts", { as: "u1" });
const id2 = lst.j.percobaan[lst.j.percobaan.length - 1].id;
const det = await req("", "/api/attempts/" + id2, { as: "u1" });
ok(det.s === 200 && det.j.detail[0].q === xss[0].q && det.j.detail.length === 1, "detail terkompres tersimpan dan terbaca utuh");
const h = await fetch(B + "/api/auth/me");
ok(h.headers.get("x-frame-options") === "DENY" && h.headers.get("x-content-type-options") === "nosniff", "header keamanan terpasang");
ok(!!h.headers.get("content-security-policy") && h.headers.get("content-security-policy").includes("frame-ancestors 'none'"), "CSP terpasang (mode produksi)");
ok((h.headers.get("cache-control") || "").includes("no-store") && !h.headers.get("x-powered-by"), "API no-store dan tanpa x-powered-by");

// ---- kelas, tryout terjadwal, peringkat ----
// u1 = budi (siswa kelas A), u2 = siti (awalnya di luar kelas), u3 = dewi (tutor kelas A), m = master
const P = (path, body, as) => req("", path, { method: "POST", body, as });
r = await P("/api/auth/login", { username: "dewi", password: pw }, "u3"); ok(r.s === 200, "dewi login");
const daftarUser = (await req("", "/api/master/users", { as: "m" })).j.users;
const idU = (n) => daftarUser.find((x) => x.username === n).id;
r = await P("/api/kelas", { nama: "Kelas A" }, "u2"); ok(r.s === 403, "user biasa tidak bisa membuat kelas");
r = await P("/api/kelas", { nama: "Kelas A" }, "m"); const kA = r.j.id; ok(r.s === 200 && kA, "master membuat kelas A");
r = await P("/api/kelas", { nama: "kelas a" }, "m"); ok(r.s === 409, "nama kelas kembar ditolak");
const kB = (await P("/api/kelas", { nama: "Kelas B" }, "m")).j.id;
const anggota = (kelas, userId, peran, aksi = "tambah") => req("", "/api/kelas/" + kelas, { method: "PATCH", body: { userId, aksi, peran }, as: "m" });
r = await anggota(kA, idU("budi"), "siswa"); ok(r.s === 200, "master memasukkan budi ke kelas A");
r = await anggota(kA, idU("dewi"), "tutor"); ok(r.s === 200, "master menunjuk dewi sebagai tutor kelas A");
r = await req("", "/api/kelas/" + kA, { method: "PATCH", body: { userId: idU("siti"), aksi: "tambah" }, as: "u3" }); ok(r.s === 403, "tutor tidak bisa mengubah anggota kelas");
r = await req("", "/api/auth/me", { as: "u3" }); ok(r.j.user.tutor === 1, "me menandai dewi sebagai tutor");
r = await req("", "/api/kelas", { as: "u3" }); ok(r.s === 200 && r.j.kelas.length === 1 && r.j.kelas[0].id === kA, "tutor hanya melihat kelasnya");
r = await req("", "/api/kelas/" + kB, { as: "u3" }); ok(r.s === 404, "tutor tidak bisa membuka kelas lain");
r = await req("", "/api/kelas", { as: "u1" }); ok(r.s === 403, "siswa tidak bisa melihat daftar kelas");
const menit = (n) => new Date(Date.now() + n * 60000).toISOString();
const tBaru = (o) => ({ judul: "Tryout Uji", tes: "tkd", buka: menit(-1), tutup: menit(60), durasiMenit: 10, ...o });
r = await P("/api/tryout", tBaru({ kelasId: kB }), "u3"); ok(r.s === 403, "tutor tidak bisa membuat tryout untuk kelas lain");
r = await P("/api/tryout", tBaru({ kelasId: null }), "u3"); ok(r.s === 403, "tutor tidak bisa membuat tryout untuk semua user");
r = await P("/api/tryout", tBaru({ kelasId: kA }), "u1"); ok(r.s === 403, "siswa tidak bisa membuat tryout");
r = await P("/api/tryout", tBaru({ kelasId: kA, tutup: menit(-2) }), "u3"); ok(r.s === 400, "tutup sebelum buka ditolak");
r = await P("/api/tryout", tBaru({ kelasId: kA }), "u3"); const T = r.j.id, nSoal = r.j.jumlahSoal; ok(r.s === 200 && nSoal > 1, "tutor membuat tryout kelas A (" + nSoal + " soal)");
const F = (await P("/api/tryout", tBaru({ kelasId: kA, judul: "Nanti", buka: menit(30) }), "m")).j.id;
r = await P(`/api/tryout/${F}/mulai`, {}, "u1"); ok(r.s === 403, "mulai sebelum waktu buka ditolak");
r = await req("", "/api/tryout", { as: "u2" }); ok(r.s === 200 && !r.j.tryout.some((t) => t.id === T), "siswa di luar kelas tidak melihat tryout kelas");
r = await P(`/api/tryout/${T}/mulai`, {}, "u2"); ok(r.s === 404, "siswa di luar kelas tidak bisa memulai");
r = await req("", "/api/tryout", { as: "u1" }); ok(r.j.tryout.some((t) => t.id === T && t.saya === null && !t.kelola), "siswa kelas melihat tryout, belum mulai");
r = await P(`/api/tryout/${T}/mulai`, {}, "u1"); const mulai1 = r.j;
ok(r.s === 200 && mulai1.soal.length === nSoal && mulai1.jawab.every((x) => x === null), "budi memulai tryout");
ok(!/"(ans|skor|bahas)"/.test(JSON.stringify(mulai1)), "respons mulai tidak memuat kunci, skor, atau pembahasan");
r = await P(`/api/tryout/${T}/mulai`, {}, "u1"); ok(r.s === 200 && r.j.tenggatMs === mulai1.tenggatMs, "mulai lagi = melanjutkan dengan tenggat yang sama");
r = await P(`/api/tryout/${T}/jawab`, { jawab: [0] }, "u1"); ok(r.s === 400, "simpan jawaban dengan panjang salah ditolak");
const nol = new Array(nSoal).fill(0);
r = await P(`/api/tryout/${T}/jawab`, { jawab: nol }, "u1"); ok(r.s === 200, "simpan jawaban berkala");
r = await req("", `/api/tryout/${T}/peringkat`, { as: "u1" }); ok(r.s === 403, "peringkat belum bisa dilihat sebelum mengumpulkan");
r = await P(`/api/tryout/${T}/selesai`, { jawab: nol }, "u1"); const hBudi = r.j; ok(r.s === 200 && hBudi.id, "budi mengumpulkan");
const kunci = (await req("", "/api/attempts/" + hBudi.id, { as: "u1" })).j.detail;
const manual = kunci.reduce((a, x) => a + (x.s ? x.s[0] : x.a === 0 ? 1 : 0), 0);
ok(hBudi.skor === manual, `nilai budi cocok hitungan manual (${hBudi.skor} = ${manual})`);
r = await P(`/api/tryout/${T}/selesai`, { jawab: kunci.map((x) => x.a) }, "u1"); ok(r.s === 200 && r.j.id === hBudi.id && r.j.skor === hBudi.skor, "kirim ulang tidak mengubah nilai");
r = await P(`/api/tryout/${T}/jawab`, { jawab: nol }, "u1"); ok(r.s === 409, "simpan setelah mengumpulkan ditolak");
await anggota(kA, idU("siti"), "siswa");
const mulai2 = (await P(`/api/tryout/${T}/mulai`, {}, "u2")).j;
ok(JSON.stringify(mulai2.soal) === JSON.stringify(mulai1.soal), "semua peserta mendapat paket soal yang sama");
r = await P(`/api/tryout/${T}/selesai`, { jawab: kunci.map((x) => x.s ? x.s.indexOf(Math.max(...x.s)) : x.a) }, "u2"); ok(r.s === 200 && r.j.pct === 100, "siti menjawab benar semua = 100%");
r = await req("", `/api/tryout/${T}/peringkat`, { as: "u1" });
ok(r.s === 200 && r.j.peringkat.length === 2 && r.j.peringkat[0].username === "siti" && r.j.peringkat[1].saya && r.j.peringkat[0].attemptId === undefined, "peringkat: siti #1, budi #2, siswa tidak mendapat id jawaban orang lain");
r = await req("", "/api/attempts/" + hBudi.id, { as: "u3" }); ok(r.s === 200, "tutor membuka jawaban siswa kelasnya");
r = await req("", "/api/attempts/" + hBudi.id, { as: "u2" }); ok(r.s === 404, "siswa lain tidak bisa membuka jawaban budi");
r = await req("", "/api/attempts/" + idA, { as: "u3" }); ok(r.s === 404, "tutor tidak bisa membuka ujian biasa (non-tryout) siswa");
if (process.env.DB_PATH) {
  // memundurkan jam mulai langsung di database untuk meniru tenggat yang sudah lewat
  const { DatabaseSync } = createRequire(import.meta.url)("node:sqlite");
  const d = new DatabaseSync(process.env.DB_PATH);
  await P(`/api/tryout/${T}/mulai`, {}, "m");
  const satu = kunci.map((x, i) => (i === 0 ? x.a : null));
  await P(`/api/tryout/${T}/jawab`, { jawab: satu }, "m");
  await P(`/api/tryout/${T}/mulai`, {}, "u3"); // dewi mulai lalu menutup browser tanpa mengirim
  d.prepare("UPDATE tryout_peserta SET mulai_ms = mulai_ms - 3600000 WHERE tryout_id = ? AND attempt_id IS NULL").run(T);
  r = await P(`/api/tryout/${T}/selesai`, { jawab: kunci.map((x) => x.a) }, "m");
  ok(r.s === 200 && r.j.telat === true && r.j.skor === (kunci[0].s ? kunci[0].s[kunci[0].a] : 1), "kiriman setelah tenggat diabaikan, jawaban tersimpan yang dinilai");
  r = await req("", `/api/tryout/${T}/peringkat`, { as: "u3" });
  ok(r.s === 200 && r.j.peringkat.length === 4 && r.j.sedangMengerjakan === 0 && r.j.peringkat.find((x) => x.username === "dewi").skor === 0, "peserta yang tidak mengirim dinilai otomatis setelah tenggat");
  d.prepare("UPDATE tryout SET buka = ?, tutup = ? WHERE id = ?").run(menit(-120), menit(-60), F);
  r = await P(`/api/tryout/${F}/mulai`, {}, "u1"); ok(r.s === 403, "mulai setelah waktu tutup ditolak");
  d.close();
} else console.log("LEWAT skenario tenggat (set DB_PATH yang sama dengan server untuk menjalankannya)");
r = await req("", "/api/attempts", { as: "u1" }); ok(r.j.percobaan.some((x) => x.id === hBudi.id && x.nama.startsWith("Tryout Uji")), "hasil tryout masuk riwayat siswa");

// ---- SKD: subtes dan tryout ----
const { hitungSubtes } = await import("../lib/subtes.mjs");
const { CONFIG } = await import("../data/config.js");
const skd = CONFIG.tes.find((t) => t.id === "skd");
const baris = [];
for (let i = 0; i < 30; i++) baris.push({ t: "Wawasan Kebangsaan", a: 0, j: 0 });
for (let i = 0; i < 35; i++) baris.push({ t: "TIU Numerik", a: 0, j: i < 10 ? 0 : 1 });
for (let i = 0; i < 45; i++) baris.push({ t: "TKP TIK", a: 2, j: 2, s: [1, 2, 5, 3, 2] });
const st = hitungSubtes(skd, baris);
ok(st[0].poin === 150 && st[0].lolos && st[1].poin === 50 && !st[1].lolos && st[2].poin === 225 && st[2].lolos, "subtes SKD: TWK 150 lolos, TIU 50 gagal, TKP 225 lolos -> " + JSON.stringify(st.map((x) => x.poin)));
ok(!st.every((x) => x.lolos), "lulus SKD hanya jika semua subtes lolos (TIU gagal = tidak lulus)");
ok(hitungSubtes(CONFIG.tes.find((t) => t.id === "tkd"), baris) === null, "tes tanpa subtes mengembalikan null");
r = await P("/api/tryout", tBaru({ tes: "skd", kelasId: kA, judul: "SKD Uji" }), "m"); ok(r.s === 200 && r.j.jumlahSoal === 110, "tryout SKD tersusun server: 110 soal -> " + JSON.stringify(r.j));
const idSkd = r.j.id;
r = await P(`/api/tryout/${idSkd}/mulai`, {}, "u2");
ok(r.s === 200 && r.j.soal.length === 110 && r.j.soal.filter((x) => x.topik.startsWith("TKP")).length === 45 && !/"(ans|skor|bahas)"/.test(JSON.stringify(r.j)), "SKD: 45 soal TKP dan kunci/skor tidak ikut terkirim");
r = await P(`/api/tryout/${idSkd}/selesai`, { jawab: new Array(110).fill(0) }, "u2"); ok(r.s === 200 && r.j.maks > 110, "SKD dinilai server, maks > 110 karena TKP bernilai sampai 5 (maks " + r.j.maks + ")");

// ---- kedinasan ----
const ked = CONFIG.tes.find((t) => t.id === "skd-kedinasan");
ok(ked && ked.kelompok === "Kedinasan" && ked.subtes[2].ambang === 156 && ked.subtes[0].ambang === 65 && ked.subtes[1].ambang === 80, "kedinasan: ambang TWK 65, TIU 80, TKP 156");
const stKed = hitungSubtes(ked, baris);
ok(stKed[2].lolos && stKed[2].ambang === 156, "kedinasan: TKP 225 poin lolos ambang 156");
r = await P("/api/tryout", tBaru({ tes: "skd-kedinasan", kelasId: kA, judul: "Kedinasan Uji" }), "m"); ok(r.s === 200 && r.j.jumlahSoal === 110, "tryout SKD kedinasan tersusun server: 110 soal");
r = await P("/api/tryout", tBaru({ tes: "kedinasan-tpa", kelasId: kA, judul: "TPA Uji" }), "m"); ok(r.s === 200 && r.j.jumlahSoal === 50, "tryout TPA kedinasan tersusun: 50 soal");

// ---- buku salah: soal salah dari ujian dan tryout masuk antrean ulangan ----
for (const [un, kunci] of [["belajar2", "b2"], ["belajar3", "b3"], ["salah1", "s1"], ["drill1", "d1"]]) {
  await P("/api/master/users", { username: un, nama: "Uji " + un, password: pw }, "m");
  r = await P("/api/auth/login", { username: un, password: pw }, kunci); ok(r.s === 200, "login akun uji " + un);
}
const bs = (q, j, a = 0) => ({ t: "TIU Numerik", q, o: ["a", "b", "c", "d", "e"], a, j, b: "b" });
r = await P("/api/attempts", { tes: "skd", durasi: 5, detail: [bs("benar 1", 0), bs("salah 1", 1), bs("kosong 1", null), { t: "TKP TIK", q: "tkp rendah", o: ["a", "b", "c", "d", "e"], a: 2, j: 0, s: [1, 2, 5, 3, 2], b: "b" }, { t: "TKP TIK", q: "tkp bagus", o: ["a", "b", "c", "d", "e"], a: 2, j: 3, s: [1, 2, 5, 4, 2], b: "b" }] }, "s1");
ok(r.s === 200, "ujian dengan 1 salah, 1 benar, 1 kosong, TKP rendah dan TKP 4 poin disimpan");
r = await req("", "/api/belajar", { as: "s1" }); ok(r.j.totalUlang === 2, "yang masuk buku salah: 1 soal salah + 1 TKP rendah (benar, kosong, dan TKP 4 poin tidak) -> " + r.j.totalUlang);
r = await P("/api/attempts", { tes: "skd", durasi: 5, detail: [bs("salah 1", 1)] }, "s1"); r = await req("", "/api/belajar", { as: "s1" });
ok(r.j.totalUlang === 2, "soal salah yang sama tidak ganda di buku salah");
r = await req("", "/api/belajar", { as: "u2" }); ok(r.j.totalUlang > 0, "tryout SKD selesai: soal salah peserta masuk buku salah (maks 60) -> " + r.j.totalUlang);

// ---- drill kecepatan ----
const dr = (o) => ({ topik: "TIU Numerik", jumlah: 10, benar: 7, rataDetik: 42.37, batasDetik: 60, lewatBatas: 2, ...o });
r = await P("/api/belajar/drill", dr({}), "d1"); ok(r.s === 200, "hasil drill disimpan");
r = await P("/api/belajar/drill", dr({ topik: "Tidak Ada" }), "d1"); ok(r.s === 400, "drill: topik di luar jalur belajar ditolak");
r = await P("/api/belajar/drill", dr({ benar: 11 }), "d1"); ok(r.s === 400, "drill: benar > jumlah ditolak");
r = await P("/api/belajar/drill", dr({ rataDetik: -1 }), "d1"); ok(r.s === 400, "drill: rata-rata detik negatif ditolak");
r = await P("/api/belajar/drill", dr({ batasDetik: 1 }), "d1"); ok(r.s === 400, "drill: batas waktu tidak masuk akal ditolak");
r = await req("", "/api/belajar/drill", { as: "d1" }); ok(r.s === 200 && r.j.drill.length === 1 && r.j.drill[0].rataDetik === 42.4 && r.j.drill[0].lewatBatas === 2, "riwayat drill terbaca (rata-rata dibulatkan 1 desimal)");
r = await req("", "/api/belajar/drill", { as: "b2" }); ok(r.j.drill.length === 0, "riwayat drill milik user lain tidak terlihat");
r = await req("", "/api/belajar/drill", { as: "x" }); ok(r.s === 401, "drill tanpa login ditolak");

// ---- belajar dari nol ----
r = await req("", "/api/belajar", { as: "b2" });
ok(r.s === 200 && r.j.topik.length === 16 && r.j.topik.slice(0, 6).every((t) => t.topik.startsWith("Dasar ")) && r.j.topik.every((t) => t.level === 1 && !t.mulai) && r.j.jatuhTempo === 0, "belajar: 6 topik fondasi + 10 topik SKD, belum ada kemajuan");
r = await req("", "/api/belajar", { as: "x" }); ok(r.s === 401, "belajar tanpa login ditolak");
const sb = (q, topik = "TIU Numerik") => ({ t: topik, q, o: ["1", "2", "3", "4", "5"], a: 2, b: "bahas" });
r = await P("/api/belajar/jawab", { topik: "TIU Numerik", benar: false }, "b2"); ok(r.s === 400, "jawaban salah tanpa soal ditolak");
r = await P("/api/belajar/jawab", { topik: "Tidak Ada", benar: true }, "b2"); ok(r.s === 400, "topik di luar jalur belajar ditolak");
r = await P("/api/belajar/jawab", { topik: "TIU Numerik", benar: false, soal: { ...sb("x"), a: 9 } }, "b2"); ok(r.s === 400, "soal dengan kunci di luar rentang ditolak");
for (const [b, q] of [[true], [true], [true], [false, "2+2 = ?"], [true]]) r = await P("/api/belajar/jawab", { topik: "TIU Numerik", benar: b, ...(b ? {} : { soal: sb(q) }) }, "b2");
ok(r.j.naik === true && r.j.level === 2 && r.j.riwayat === "", "4 dari 5 benar -> naik ke level 2");
for (let i = 0; i < 3; i++) r = await P("/api/belajar/jawab", { topik: "TIU Numerik", benar: false, soal: sb("3+3 = ?") }, "b2");
ok(r.j.turun === true && r.j.level === 1, "3 salah beruntun -> turun ke level 1 dan diminta ulang konsep");
r = await P("/api/belajar/jawab", { topik: "TIU Numerik", benar: false, soal: sb("3+3 = ?") }, "b2");
r = await req("", "/api/belajar", { as: "b2" }); ok(r.j.totalUlang === 2, "soal salah yang sama tidak ganda di antrean (2 soal unik) -> " + r.j.totalUlang);
ok(r.j.jatuhTempo === 0, "soal baru salah baru jatuh tempo besok, belum muncul hari ini");
if (process.env.DB_PATH) {
  const { DatabaseSync } = createRequire(import.meta.url)("node:sqlite");
  const d2 = new DatabaseSync(process.env.DB_PATH);
  const jatuh = () => d2.prepare("UPDATE ulang SET jatuh_tempo = 0").run();
  jatuh();
  r = await req("", "/api/belajar/ulang", { as: "b2" }); ok(r.j.soal.length === 2 && r.j.soal[0].q && r.j.soal[0].o.length === 5, "ulangan jatuh tempo: 2 soal");
  const id1 = r.j.soal[0].id;
  r = await req("", "/api/belajar/ulang", { as: "d1" }); ok(r.j.soal.length === 0, "ulangan milik user lain tidak terlihat");
  r = await P("/api/belajar/ulang", { id: id1, benar: true }, "u1"); ok(r.s === 404, "user lain tidak bisa menjawab ulangan orang lain");
  r = await P("/api/belajar/ulang", { id: id1, benar: true }, "b2"); ok(r.j.lulus === false && r.j.jedaHari === 3, "ulangan benar ke-1 -> jeda 3 hari");
  r = await P("/api/belajar/ulang", { id: id1, benar: true }, "b2"); ok(r.j.jedaHari === 7, "ulangan benar ke-2 -> jeda 7 hari");
  r = await P("/api/belajar/ulang", { id: id1, benar: false }, "b2"); ok(r.j.lulus === false && r.j.jedaHari === 1, "salah lagi -> kembali jeda 1 hari");
  for (let i = 0; i < 3; i++) { jatuh(); r = await P("/api/belajar/ulang", { id: id1, benar: true }, "b2"); }
  ok(r.j.lulus === true, "3 benar beruntun -> soal lulus dan keluar antrean");
  r = await req("", "/api/belajar", { as: "b2" }); ok(r.j.totalUlang === 1, "antrean tinggal 1 soal");
  d2.close();
}
r = await P("/api/belajar/diagnosis", { hasil: [{ topik: "TIU Verbal", benar: 2, salah: [] }, { topik: "TIU Figural", benar: 0, salah: [sb("fig 1", "TIU Figural"), sb("fig 2", "TIU Figural")] }] }, "b2"); ok(r.s === 200, "diagnosis tersimpan");
r = await req("", "/api/belajar", { as: "b2" });
ok(r.j.topik.find((t) => t.topik === "TIU Verbal").level === 2 && r.j.topik.find((t) => t.topik === "TIU Figural").level === 1 && r.j.totalUlang === 3, "diagnosis: 2 benar mulai level 2, soal salah masuk antrean");
r = await P("/api/belajar/diagnosis", { hasil: [{ topik: "TIU Verbal", benar: 5, salah: [] }] }, "b2"); ok(r.s === 400, "diagnosis dengan jumlah benar tidak masuk akal ditolak");

// ---- identitas, kode aktivasi, masa aktif ----
r = await req("", "/api/info", { as: "x" }); ok(r.s === 200 && typeof r.j.nama === "string" && ["buka", "tutup", "kode"].includes(r.j.registrasi), "info pemasangan publik: " + JSON.stringify(r.j));
r = await P("/api/master/kode", { jumlah: 3, hari: 30 }, "b2"); ok(r.s === 403, "user biasa tidak bisa membuat kode");
r = await P("/api/master/kode", { jumlah: 0, hari: 30 }, "m"); ok(r.s === 400, "jumlah kode 0 ditolak");
r = await P("/api/master/kode", { jumlah: 3, hari: 99999 }, "m"); ok(r.s === 400, "masa aktif tidak masuk akal ditolak");
r = await P("/api/master/kode", { jumlah: 3, hari: 30 }, "m");
const kodes = r.j.kode;
ok(r.s === 200 && kodes.length === 3 && new Set(kodes).size === 3 && kodes.every((k) => /^[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}$/.test(k)), "master membuat 3 kode unik berformat XXXX-XXXX-XXXX");
r = await req("", "/api/master/kode", { as: "m" }); ok(r.j.kode.filter((k) => !k.pemakai).length >= 3, "daftar kode terbaca master");
r = await P("/api/auth/register", { username: "kode1", nama: "Pemakai Kode", password: pw, kode: "kode-salah-xxxx" }, "k1"); ok(r.s === 400, "daftar dengan kode palsu ditolak dan akun tidak dibuat");
r = await P("/api/auth/login", { username: "kode1", password: pw }, "k1"); ok(r.s === 401, "akun tidak terbentuk dari pendaftaran yang gagal");
r = await P("/api/auth/register", { username: "kode1", nama: "Pemakai Kode", password: pw, kode: kodes[0].toLowerCase().replace(/-/g, " ") }, "k1");
const hariLagi = r.j.user && r.j.user.aktifSampai ? Math.round((Date.parse(r.j.user.aktifSampai) - Date.now()) / 86400000) : -1;
ok(r.s === 200 && hariLagi === 30, "daftar dengan kode (huruf kecil dan spasi tetap diterima) -> aktif 30 hari");
r = await P("/api/auth/register", { username: "kode2", nama: "Pemakai Dua", password: pw, kode: kodes[0] }, "k2"); ok(r.s === 400, "kode yang sudah dipakai tidak bisa dipakai lagi");
r = await P("/api/kode/pakai", { kode: kodes[1] }, "b2"); ok(r.s === 400, "akun tanpa batas (akun lama) tidak boleh menghabiskan kode");
r = await req("", "/api/kode/pakai", { method: "POST", body: { kode: kodes[1] }, as: "x" }); ok(r.s === 401, "pakai kode tanpa login ditolak");
if (process.env.DB_PATH) {
  const { DatabaseSync } = createRequire(import.meta.url)("node:sqlite");
  const d3 = new DatabaseSync(process.env.DB_PATH);
  d3.prepare("UPDATE users SET aktif_sampai = ? WHERE username = 'kode1'").run(new Date(Date.now() - 86400000).toISOString());
  const detailK = [{ t: "Verbal", q: "Soal", o: ["a", "b", "c", "d", "e"], a: 0, j: 0, b: "b" }];
  r = await P("/api/attempts", { tes: "tkd", durasi: 5, detail: detailK }, "k1"); ok(r.s === 402, "masa aktif habis: menyimpan hasil ditolak (402)");
  r = await P(`/api/tryout/${idSkd}/mulai`, {}, "k1"); ok(r.s === 402 || r.s === 404, "masa aktif habis: tryout tidak bisa dimulai (status " + r.s + ")");
  r = await P("/api/belajar/jawab", { topik: "TIU Numerik", benar: true }, "k1"); ok(r.s === 402, "masa aktif habis: Mode Belajar ditolak");
  r = await req("", "/api/attempts", { as: "k1" }); ok(r.s === 200, "masa aktif habis: riwayat tetap bisa dibaca");
  r = await req("", "/api/auth/me", { as: "k1" }); ok(r.j.user && Date.parse(r.j.user.aktifSampai) < Date.now(), "me memuat aktifSampai (sudah lewat)");
  r = await P("/api/kode/pakai", { kode: kodes[1] }, "k1");
  const baru = Date.parse(r.j.aktifSampai) - Date.now();
  ok(r.s === 200 && Math.abs(baru - 30 * 86400000) < 60000, "kode memperpanjang dari sekarang (akun yang sudah habis)");
  r = await P("/api/attempts", { tes: "tkd", durasi: 5, detail: detailK }, "k1"); ok(r.s === 200, "setelah kode dipakai: bisa menyimpan hasil lagi");
  r = await P("/api/kode/pakai", { kode: kodes[2] }, "k1");
  ok(r.s === 200 && Math.abs(Date.parse(r.j.aktifSampai) - Date.now() - 60 * 86400000) < 60000, "kode kedua menambah dari sisa masa aktif (30 + 30 hari)");
  r = await P("/api/kode/pakai", { kode: kodes[2] }, "k1"); ok(r.s === 400, "kode yang sama tidak bisa dipakai dua kali");
  d3.close();
}
r = await req("", "/api/master/kode", { as: "m" }); ok(r.j.kode.filter((k) => k.pemakai).length >= 3 && r.j.kode.find((k) => k.kode === kodes[0]).username === "kode1", "master melihat siapa pemakai tiap kode");


// ---- fondasi dan petunjuk ----
const sf = (q) => ({ t: "Dasar Pecahan", q, o: ["1/2", "1/3", "2/3", "3/4", "1/4"], a: 0, b: "bahas", l: ["langkah satu", "langkah dua 1/2"] });
r = await P("/api/belajar/jawab", { topik: "Dasar Pecahan", benar: false, soal: sf("1/4 + 1/4 = ?") }, "b3");
ok(r.s === 200 && r.j.riwayat === "0" && r.j.level === 1, "topik fondasi diterima, jawaban salah tercatat");
r = await P("/api/belajar/jawab", { topik: "Dasar Pecahan", benar: false, petunjuk: true, soal: sf("2/6 + 1/6 = ?") }, "b3");
ok(r.s === 200 && r.j.petunjuk === true && r.j.riwayat === "0", "dengan petunjuk: tidak mengubah riwayat/level");
r = await req("", "/api/belajar", { as: "b3" });
ok(r.j.totalUlang === 2, "salah dengan petunjuk tetap masuk antrean ulangan (total " + r.j.totalUlang + ")");
r = await P("/api/belajar/jawab", { topik: "Dasar Pecahan", benar: true, petunjuk: true }, "b3");
ok(r.s === 200 && r.j.riwayat === "0" && r.j.petunjuk === true, "benar dengan petunjuk tidak menambah riwayat");
r = await P("/api/belajar/jawab", { topik: "Dasar Pecahan", benar: false, soal: { ...sf("langkah salah"), l: new Array(11).fill("x") } }, "b3"); ok(r.s === 400, "soal dengan > 10 langkah ditolak");
r = await req("", "/api/belajar/ulang", { as: "b3" }); ok(r.s === 200, "ulangan terbaca (langkah ikut tersimpan bila ada)");

// ---- rencana menuju tanggal tes ----
const { sisaHari, targetHarian, kesiapan, buatIcs, tanggalValid, hariWib } = await import("../lib/rencana.mjs");
const t0 = Date.parse("2026-10-14T05:00:00Z"); // 12.00 WIB
ok(hariWib(t0) === "2026-10-14" && sisaHari("2026-10-20", t0) === 6 && sisaHari("2026-10-14", t0) === 0 && sisaHari("2026-10-10", t0) === -4, "hitung mundur hari (zona WIB)");
ok(Date.parse("2026-10-14T18:30:00Z") > t0 && hariWib(Date.parse("2026-10-14T18:30:00Z")) === "2026-10-15", "lewat tengah malam WIB berganti hari");
ok(tanggalValid("2026-10-20") && !tanggalValid("2026-02-30") && !tanggalValid("20-10-2026") && !tanggalValid(null), "validasi format tanggal");
ok(targetHarian(30, 16) === 25 && targetHarian(2, 16) === 150 && targetHarian(60, 1) === 10, "target harian dibulatkan 5 dan dibatasi 10-150 -> " + [targetHarian(30, 16), targetHarian(2, 16), targetHarian(60, 1)]);
const baru = [], lama = [];
for (let i = 0; i < 30; i++) { baru.push({ t: "Wawasan Kebangsaan", a: 0, j: i < 12 ? 0 : 1 }); lama.push({ t: "Wawasan Kebangsaan", a: 0, j: 1 }); }
for (let i = 0; i < 35; i++) { baru.push({ t: "TIU Numerik", a: 0, j: i < 10 ? 0 : 1 }); lama.push({ t: "TIU Numerik", a: 0, j: 1 }); }
for (let i = 0; i < 45; i++) { baru.push({ t: "TKP TIK", a: 2, j: 2, s: [1, 2, 5, 3, 2] }); lama.push({ t: "TKP TIK", a: 2, j: 2, s: [1, 2, 5, 3, 2] }); }
const ks = kesiapan(skd, [baru, lama]);
ok(ks[0].status === "dekat" && ks[0].tren === 60 && ks[1].status === "jauh" && ks[1].tren === 50 && ks[2].status === "lolos" && ks[2].tren === 0, "kesiapan: TWK dekat (+60), TIU jauh (+50), TKP lolos (0) -> " + JSON.stringify(ks.map((k) => [k.status, k.tren])));
ok(kesiapan(skd, []) === null && kesiapan(CONFIG.tes.find((t) => t.id === "tkd"), [baru]) === null, "kesiapan null tanpa percobaan atau tanpa subtes");
const ics = buatIcs({ nama: "SKD", tanggal: "2026-10-20", target: 25 }, t0);
ok(ics.startsWith("BEGIN:VCALENDAR\r\n") && ics.includes("RRULE:FREQ=DAILY;UNTIL=20261020T235959") && ics.includes("DTSTART:20261014T190000") && ics.endsWith("END:VCALENDAR\r\n"), "berkas .ics berisi pengingat harian sampai hari tes");

r = await req("", "/api/rencana", { as: "k1" }); ok(r.s === 200 && r.j.rencana === null && r.j.tesPilihan.some((t) => t.id === "skd"), "rencana: belum ada, pilihan tes SKD tersedia");
r = await req("", "/api/rencana", { as: "x" }); ok(r.s === 401, "rencana tanpa login ditolak");
const depan = (n) => new Date(Date.now() + 7 * 3600e3 + n * 86400e3).toISOString().slice(0, 10);
const put = (b, as = "k1") => req("", "/api/rencana", { method: "PUT", body: b, as });
r = await put({ tesId: "tkd", tanggal: depan(20) }); ok(r.s === 400, "rencana: tes tanpa subtes ditolak");
r = await put({ tesId: "skd", tanggal: depan(-1) }); ok(r.s === 400, "rencana: tanggal lampau ditolak");
r = await put({ tesId: "skd", tanggal: "2026-02-30" }); ok(r.s === 400, "rencana: tanggal tidak ada ditolak");
r = await put({ tesId: "skd", tanggal: depan(20), menitPerHari: 5 }); ok(r.s === 400, "rencana: waktu belajar < 10 menit ditolak");
r = await put({ tesId: "skd", tanggal: depan(20), menitPerHari: 90 }); ok(r.s === 200, "rencana disimpan");
r = await req("", "/api/rencana", { as: "k1" });
ok(r.s === 200 && r.j.rencana.sisaHari === 20 && r.j.rencana.menitPerHari === 90 && r.j.target >= 10 && r.j.topikBelum === 16 && r.j.kesiapan === null, "rencana terbaca: 20 hari, target " + r.j.target + ", 16 topik belum dikuasai");
r = await P("/api/belajar/jawab", { topik: "Dasar Pecahan", benar: true }, "k1");
r = await P("/api/attempts", { tes: "skd", durasi: 60, detail: [{ t: "Wawasan Kebangsaan", q: "q", o: ["a", "b", "c", "d", "e"], a: 0, j: 0, b: "b" }, { t: "TIU Numerik", q: "q2", o: ["a", "b", "c", "d", "e"], a: 0, j: 1, b: "b" }, { t: "TKP TIK", q: "q3", o: ["a", "b", "c", "d", "e"], a: 2, j: 2, s: [1, 2, 5, 3, 2], b: "b" }] }, "k1");
r = await req("", "/api/rencana", { as: "k1" });
ok(r.j.hariIni === 5 && r.j.jumlahPercobaan === 1 && r.j.kesiapan.length === 3 && r.j.kesiapan[0].nama === "TWK" && r.j.kesiapan[0].poin === 5 && r.j.kesiapan[2].poin === 5, "kemajuan hari ini 5 soal (1 hasil lama + 1 belajar + 3 ujian) dan kesiapan dari ujian SKD terakhir");
r = await put({ tesId: "skd-kedinasan", tanggal: depan(10) }); ok(r.s === 200, "rencana boleh diubah");
r = await req("", "/api/rencana", { as: "u2" }); ok(r.j.rencana === null, "rencana milik user lain tidak terlihat");
r = await req("", "/api/rencana", { method: "DELETE", as: "k1" }); r = await req("", "/api/rencana", { as: "k1" }); ok(r.j.rencana === null, "rencana dihapus");

let dibatasi = false;
for (let i = 0; i < 45 && !dibatasi; i++) { const x = await req("", "/api/auth/login", { method: "POST", body: { username: "acak" + i, password: "salahsalah1" }, as: "z" }); if (x.s === 429) dibatasi = true; }
ok(dibatasi, "batas percobaan login per alamat IP (429 setelah banyak percobaan)");
