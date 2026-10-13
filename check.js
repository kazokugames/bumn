// Validasi bank soal. Jalankan: node check.js
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = __dirname;
const errors = [];

// Muat config.js dan semua bank dalam sandbox dengan window tiruan.
const sandbox = { window: {} };
vm.createContext(sandbox);
function runFile(f) {
  vm.runInContext(fs.readFileSync(f, "utf8"), sandbox, { filename: f });
}
runFile(path.join(root, "config.js"));
for (const f of fs.readdirSync(path.join(root, "bank")).filter(f => f.endsWith(".js")).sort()) {
  runFile(path.join(root, "bank", f));
}

const BANK = sandbox.window.BANK || {};
const CONFIG = sandbox.window.CONFIG;
if (!CONFIG) errors.push("config.js tidak mengisi window.CONFIG");

// Kumpulkan topik yang sah per bank dari config.
const topikPerBank = {};
if (CONFIG) {
  for (const tes of CONFIG.tes) {
    for (const b of [].concat(tes.bank)) topikPerBank[b] = (topikPerBank[b] || []).concat(Object.keys(tes.komposisi)); // satu tes boleh memakai beberapa bank, satu bank boleh dipakai beberapa tes
  }
}

const DEEP = process.env.DEEP === "1"; // DEEP=1 node check.js -> 10x lebih banyak sampel generator
const LIM = { q: 20000, opt: 6000, bahas: 8000, topik: 80 }; // harus sama dengan batas di web/app/api/attempts/route.js
const ids = new Set();
const lihat = new Set();
let totalSoal = 0;
for (const [nama, soalList] of Object.entries(BANK)) {
  const perTopik = {};
  for (const s of soalList) {
    totalSoal++;
    const tag = nama + ":" + (s.id || "?");
    if (!s.id) errors.push(tag + " — id kosong");
    else if (ids.has(s.id)) errors.push(tag + " — id duplikat");
    else ids.add(s.id);
    if (!Array.isArray(s.opts) || s.opts.length < 4) errors.push(tag + " — opts kurang dari 4");
    if (typeof s.ans !== "number" || s.ans < 0 || (s.opts && s.ans >= s.opts.length))
      errors.push(tag + " — ans di luar rentang opts");
    if (s.skor && s.opts && s.skor.length !== s.opts.length)
      errors.push(tag + " — panjang skor != panjang opts");
    if (!s.bahas || !String(s.bahas).trim()) errors.push(tag + " — bahas kosong");
    if (Array.isArray(s.opts) && new Set(s.opts).size !== s.opts.length) errors.push(tag + " — ada opsi kembar");
    if (Array.isArray(s.opts) && s.opts.some((o) => typeof o !== "string" || !o.trim())) errors.push(tag + " — ada opsi kosong");
    if (![1, 2, 3].includes(s.level)) errors.push(tag + " — level harus 1, 2, atau 3");
    if (!s.q || !String(s.q).trim()) errors.push(tag + " — q kosong");
    const kunciSoal = nama + "|" + s.topik + "|" + s.q + "|" + (s.opts || []).slice().sort().join("¦");
    if (lihat.has(kunciSoal)) errors.push(tag + " — soal kembar (q dan opsi sama dengan soal lain)");
    lihat.add(kunciSoal);
    if (String(s.q).length > LIM.q || String(s.bahas).length > LIM.bahas || (s.opts || []).some((o) => String(o).length > LIM.opt))
      errors.push(tag + " — melebihi batas ukuran yang diterima server (q " + LIM.q + ", opsi " + LIM.opt + ", bahas " + LIM.bahas + ")");
    if (s.skor) {
      const maks = Math.max(...s.skor);
      if (s.skor[s.ans] !== maks) errors.push(tag + " — skor opsi kunci bukan nilai tertinggi");
      if (s.skor.filter((v) => v === maks).length !== 1) errors.push(tag + " — nilai tertinggi harus tepat satu opsi");
    }
    if (topikPerBank[nama] && !topikPerBank[nama].includes(s.topik))
      errors.push(tag + " — topik '" + s.topik + "' tidak ada di config untuk bank " + nama);
    perTopik[s.topik] = (perTopik[s.topik] || 0) + 1;
  }
  console.log("\n== " + nama + " (" + soalList.length + " soal) ==");
  for (const [t, n] of Object.entries(perTopik)) console.log("  " + t + ": " + n);
}

// Generator: tiap topik yang punya generator diuji 300x per level.
const GEN = require("./gen.js");
const topikGen = new Set();
for (const tes of CONFIG.tes) for (const t of Object.keys(tes.komposisi)) if (GEN.ada(t)) topikGen.add(t);
for (const t of topikGen) {
  for (let lv = 1; lv <= 3; lv++) {
    for (let i = 0; i < (DEEP ? 3000 : 300); i++) {
      let s;
      try { s = GEN.buat(t, lv); } catch (e) { errors.push("gen " + t + " L" + lv + " — " + e.message); break; }
      const tag = "gen " + t + " L" + s.level + " [" + s.q.slice(0, 50) + "]";
      if (!Array.isArray(s.opts) || s.opts.length !== 5 || new Set(s.opts).size !== 5) errors.push(tag + " — opts bukan 5 unik: " + s.opts);
      else if (!(s.ans >= 0 && s.ans < s.opts.length)) errors.push(tag + " — ans di luar rentang");
      else if (!s.bahas || (!s.opts[s.ans].startsWith("<svg") && !s.bahas.includes(s.opts[s.ans]))) errors.push(tag + " — bahas tidak memuat kunci '" + s.opts[s.ans] + "': " + s.bahas);
      if (/NaN|undefined|Infinity/.test(s.q + s.opts.join() + s.bahas)) errors.push(tag + " — NaN/undefined");
      if (s.opts.some((o) => !String(o).trim())) errors.push(tag + " — ada opsi kosong");
      if (s.q.length > LIM.q || s.bahas.length > LIM.bahas || s.opts.some((o) => o.length > LIM.opt)) errors.push(tag + " — melebihi batas ukuran server");
    }
  }
  console.log("gen OK: " + t);
}

// Konfigurasi tes: jumlah, komposisi, dan kecukupan soal.
const bankTes = (tes) => [].concat(tes.bank).reduce((a, b) => a.concat(BANK[b] || []), []);
const idTes = new Set();
for (const tes of CONFIG.tes) {
  const tag = "tes " + tes.id;
  if (idTes.has(tes.id)) errors.push(tag + " — id tes kembar");
  idTes.add(tes.id);
  for (const b of [].concat(tes.bank)) if (!BANK[b]) errors.push(tag + " — bank '" + b + "' tidak ada");
  const jml = Object.values(tes.komposisi).reduce((a, n) => a + n, 0);
  if (jml !== tes.jumlahSoal) errors.push(tag + " — jumlahSoal " + tes.jumlahSoal + " != total komposisi " + jml);
  if (!(tes.passingGrade > 0 && tes.passingGrade <= 100)) errors.push(tag + " — passingGrade di luar 1-100");
  if (!(tes.durasiMenit > 0)) errors.push(tag + " — durasiMenit tidak valid");
  for (const [t, n] of Object.entries(tes.komposisi)) {
    const manual = bankTes(tes).filter((x) => x.topik === t).length;
    if (!GEN.ada(t) && manual < n) errors.push(tag + " — topik '" + t + "': bank manual " + manual + " < dibutuhkan " + n + " dan tidak ada generator");
  }
  // Ukuran payload hasil ujian terburuk (dikirim ke server saat selesai) harus muat di batas 4 MB.
  let terbesar = 0;
  for (let k = 0; k < 15; k++) {
    const soalUjian = [];
    for (const [t, n] of Object.entries(tes.komposisi)) soalUjian.push(...GEN.susun(t, n, bankTes(tes).filter((x) => x.topik === t)));
    terbesar = Math.max(terbesar, JSON.stringify(soalUjian.map((x) => ({ t: x.topik, q: x.q, o: x.opts, a: x.ans, j: 0, b: x.bahas }))).length);
  }
  if (terbesar > 3_500_000) errors.push(tag + " — payload hasil ujian " + terbesar + " byte mendekati batas server 4 MB");
  console.log("tes " + tes.id.padEnd(10) + " payload terbesar ~" + Math.round(terbesar / 1024) + " KB");
}

// Salinan di web/data harus sinkron dengan sumbernya (jalankan: node sync.js).
const fs2 = require("fs");
if (fs2.existsSync(path.join(root, "web", "data", "gen.js"))) {
  if (fs2.readFileSync(path.join(root, "gen.js"), "utf8") !== fs2.readFileSync(path.join(root, "web", "data", "gen.js"), "utf8")) errors.push("web/data/gen.js tidak sinkron dengan gen.js — jalankan node sync.js");
  for (const f of fs2.readdirSync(path.join(root, "bank")).filter((f) => f.endsWith(".js"))) {
    const a = (fs2.readFileSync(path.join(root, "bank", f), "utf8").match(/id: "/g) || []).length;
    const wf = path.join(root, "web", "data", f);
    const b = fs2.existsSync(wf) ? (fs2.readFileSync(wf, "utf8").match(/id: "/g) || []).length : -1;
    if (a !== b) errors.push("web/data/" + f + " tidak sinkron (" + b + " vs " + a + " soal) — jalankan node sync.js");
  }
  const cfgRoot = fs2.readFileSync(path.join(root, "config.js"), "utf8").split("\n").filter((l) => /id: "|durasiMenit|jumlahSoal|passingGrade|komposisi|bank:/.test(l)).map((l) => l.trim()).join("|");
  const cfgWeb = fs2.readFileSync(path.join(root, "web", "data", "config.js"), "utf8").split("\n").filter((l) => /id: "|durasiMenit|jumlahSoal|passingGrade|komposisi|bank:/.test(l)).map((l) => l.trim()).join("|");
  if (cfgRoot !== cfgWeb) errors.push("config.js dan web/data/config.js berbeda (id/durasi/jumlah/komposisi/bank)");
}

console.log("\nTOTAL: " + totalSoal + " soal, " + ids.size + " id unik");
if (errors.length) {
  console.error("\nERROR (" + errors.length + "):");
  for (const e of errors) console.error("  - " + e);
  process.exit(1);
}
console.log("Semua validasi lolos.");
