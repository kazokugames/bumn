import { NextResponse } from "next/server";
import { db } from "../../../lib/db.mjs";
import { kePercobaan } from "../../../lib/ringkas.mjs";
import { wajibLogin, galat, bacaJson } from "../../../lib/session.mjs";
import { CONFIG } from "../../../data/config";
import { gzipSync } from "node:zlib";

export const dynamic = "force-dynamic";

export async function GET() {
  const { u, err } = await wajibLogin();
  if (err) return err;
  const baris = db().prepare("SELECT id, tes, nama, mode, skor, maks, pct, durasi, tanggal, per_topik FROM attempts WHERE user_id = ? ORDER BY tanggal ASC").all(u.id);
  return NextResponse.json({ percobaan: baris.map(kePercobaan) });
}

const teks = (x, maks) => typeof x === "string" && x.length <= maks;

// Simpan hasil ujian. Skor dihitung ulang di server dari jawaban agar konsisten.
export async function POST(request) {
  const { u, err } = await wajibLogin();
  if (err) return err;
  const b = await bacaJson(request);
  if (!b) return galat("Permintaan tidak valid.");
  const tes = CONFIG.tes.find((t) => t.id === b.tes);
  if (!tes) return galat("Tes tidak dikenal.");
  const d = b.detail;
  if (!Array.isArray(d) || d.length < 1 || d.length > 300) return galat("Detail jawaban tidak valid.");
  const perTopik = {};
  let skor = 0, maks = 0;
  for (const x of d) {
    if (!x || !teks(x.t, 80) || !teks(x.q, 20000) || !teks(x.b, 8000) || !Array.isArray(x.o) || x.o.length < 2 || x.o.length > 8 || !x.o.every((o) => teks(o, 6000))) return galat("Detail jawaban tidak valid.");
    if (!Number.isInteger(x.a) || x.a < 0 || x.a >= x.o.length) return galat("Detail jawaban tidak valid.");
    if (x.j !== null && (!Number.isInteger(x.j) || x.j < 0 || x.j >= x.o.length)) return galat("Detail jawaban tidak valid.");
    if (x.s != null && (!Array.isArray(x.s) || x.s.length !== x.o.length || !x.s.every((n) => Number.isFinite(n)))) return galat("Detail jawaban tidak valid.");
    const s = x.j === null ? 0 : x.s ? x.s[x.j] || 0 : x.j === x.a ? 1 : 0;
    const m = x.s ? Math.max(...x.s) : 1;
    const p = (perTopik[x.t] = perTopik[x.t] || { skor: 0, maks: 0 });
    p.skor += s; p.maks += m; skor += s; maks += m;
  }
  const durasi = Math.max(0, Math.min(86400, Math.round(Number(b.durasi) || 0)));
  const pct = maks ? Math.round((skor / maks) * 1000) / 10 : 0;
  const pt = Object.keys(perTopik).map((t) => ({ topik: t, pct: perTopik[t].maks ? Math.round((perTopik[t].skor / perTopik[t].maks) * 1000) / 10 : 0 }));
  const tanggal = new Date().toISOString();
  const r = db().prepare("INSERT INTO attempts (user_id, tes, nama, mode, skor, maks, pct, durasi, tanggal, per_topik, detail) VALUES (?, ?, ?, 'ujian', ?, ?, ?, ?, ?, ?, ?)")
    .run(u.id, tes.id, tes.nama, skor, maks, pct, durasi, tanggal, JSON.stringify(pt), gzipSync(JSON.stringify(d)));
  return NextResponse.json({ id: Number(r.lastInsertRowid), pct, skor, maks });
}
