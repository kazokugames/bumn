// Validasi detail jawaban, hitung skor, dan simpan percobaan. Dipakai ujian biasa dan tryout terjadwal.
import { gzipSync } from "node:zlib";
import { db } from "./db.mjs";

const teks = (x, maks) => typeof x === "string" && x.length <= maks;

// Bentuk detail: [{ t: topik, q, o: opsi[], a: kunci, j: jawaban|null, s?: skor per opsi, b: bahas, l?: langkah[] }]
export function detailValid(d) {
  if (!Array.isArray(d) || d.length < 1 || d.length > 300) return false;
  return d.every((x) =>
    x && teks(x.t, 80) && teks(x.q, 20000) && teks(x.b, 8000)
    && Array.isArray(x.o) && x.o.length >= 2 && x.o.length <= 8 && x.o.every((o) => teks(o, 6000))
    && Number.isInteger(x.a) && x.a >= 0 && x.a < x.o.length
    && (x.j === null || (Number.isInteger(x.j) && x.j >= 0 && x.j < x.o.length))
    && (x.s == null || (Array.isArray(x.s) && x.s.length === x.o.length && x.s.every((n) => Number.isFinite(n))))
    && (x.l == null || (Array.isArray(x.l) && x.l.length <= 10 && x.l.every((t) => teks(t, 2000)))));
}

export function hitungNilai(d) {
  const per = {};
  let skor = 0, maks = 0;
  for (const x of d) {
    const s = x.j === null ? 0 : x.s ? x.s[x.j] || 0 : x.j === x.a ? 1 : 0;
    const m = x.s ? Math.max(...x.s) : 1;
    const p = (per[x.t] = per[x.t] || { skor: 0, maks: 0 });
    p.skor += s; p.maks += m; skor += s; maks += m;
  }
  const pct = (a, b) => (b ? Math.round((a / b) * 1000) / 10 : 0);
  return { skor, maks, pct: pct(skor, maks), perTopik: Object.keys(per).map((t) => ({ topik: t, pct: pct(per[t].skor, per[t].maks) })) };
}

export function simpanPercobaan({ userId, tes, durasi, detail, tryoutId = null }) {
  const n = hitungNilai(detail);
  const r = db().prepare("INSERT INTO attempts (user_id, tes, nama, mode, skor, maks, pct, durasi, tanggal, per_topik, detail, tryout_id) VALUES (?, ?, ?, 'ujian', ?, ?, ?, ?, ?, ?, ?, ?)")
    .run(userId, tes.id, tes.nama, n.skor, n.maks, n.pct, Math.max(0, Math.min(86400, Math.round(Number(durasi) || 0))), new Date().toISOString(), JSON.stringify(n.perTopik), gzipSync(JSON.stringify(detail)), tryoutId);
  return { id: Number(r.lastInsertRowid), pct: n.pct, skor: n.skor, maks: n.maks };
}
