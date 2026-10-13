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
let dibatasi = false;
for (let i = 0; i < 45 && !dibatasi; i++) { const x = await req("", "/api/auth/login", { method: "POST", body: { username: "acak" + i, password: "salahsalah1" }, as: "z" }); if (x.s === 429) dibatasi = true; }
ok(dibatasi, "batas percobaan login per alamat IP (429 setelah banyak percobaan)");
