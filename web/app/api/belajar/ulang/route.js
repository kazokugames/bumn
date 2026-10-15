import { NextResponse } from "next/server";
import { db } from "../../../../lib/db.mjs";
import { jawabUlang, catatHarian } from "../../../../lib/belajar.mjs";
import { wajibLogin, galat, bacaJson, wajibAktif } from "../../../../lib/session.mjs";

export const dynamic = "force-dynamic";

// Soal ulangan yang sudah jatuh tempo (maks 20, yang paling lama menunggu dulu).
export async function GET() {
  const { u, err } = await wajibLogin();
  if (err) return err;
  const baris = db().prepare("SELECT id, topik, soal FROM ulang WHERE user_id = ? AND jatuh_tempo <= ? ORDER BY jatuh_tempo LIMIT 20").all(u.id, Date.now());
  return NextResponse.json({ soal: baris.map((r) => ({ id: r.id, topik: r.topik, ...JSON.parse(r.soal) })) });
}

// Jawaban ulangan: { id, benar }.
export async function POST(request) {
  const { u, err } = await wajibLogin();
  if (err) return err;
  const habis = wajibAktif(u);
  if (habis) return habis;
  const b = await bacaJson(request);
  if (!b || !Number.isInteger(b.id) || typeof b.benar !== "boolean") return galat("Permintaan tidak valid.");
  const r = jawabUlang(u.id, b.id, b.benar);
  if (r) catatHarian(u.id);
  return r ? NextResponse.json(r) : galat("Soal ulangan tidak ditemukan.", 404);
}
