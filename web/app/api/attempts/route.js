import { NextResponse } from "next/server";
import { db } from "../../../lib/db.mjs";
import { kePercobaan } from "../../../lib/ringkas.mjs";
import { detailValid, simpanPercobaan } from "../../../lib/nilai.mjs";
import { catatHarian, masukkanSalah } from "../../../lib/belajar.mjs";
import { wajibLogin, galat, bacaJson, wajibAktif } from "../../../lib/session.mjs";
import { CONFIG } from "../../../data/config";

export const dynamic = "force-dynamic";

export async function GET() {
  const { u, err } = await wajibLogin();
  if (err) return err;
  const baris = db().prepare("SELECT id, tes, nama, mode, skor, maks, pct, durasi, tanggal, per_topik FROM attempts WHERE user_id = ? ORDER BY tanggal ASC").all(u.id);
  return NextResponse.json({ percobaan: baris.map(kePercobaan) });
}

// Simpan hasil ujian biasa. Skor dihitung ulang di server dari jawaban agar konsisten.
export async function POST(request) {
  const { u, err } = await wajibLogin();
  if (err) return err;
  const habis = wajibAktif(u);
  if (habis) return habis;
  const b = await bacaJson(request);
  if (!b) return galat("Permintaan tidak valid.");
  const tes = CONFIG.tes.find((t) => t.id === b.tes);
  if (!tes) return galat("Tes tidak dikenal.");
  if (!detailValid(b.detail)) return galat("Detail jawaban tidak valid.");
  catatHarian(u.id, b.detail.length);
  masukkanSalah(u.id, b.detail);
  return NextResponse.json(simpanPercobaan({ userId: u.id, tes, durasi: b.durasi, detail: b.detail }));
}
