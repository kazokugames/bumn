import { NextResponse } from "next/server";
import { db } from "../../../../lib/db.mjs";
import { topikBelajar } from "../../../../lib/belajar.mjs";
import { wajibLogin, galat, bacaJson, wajibAktif } from "../../../../lib/session.mjs";

export const dynamic = "force-dynamic";

// Riwayat drill kecepatan saya (10 terakhir).
export async function GET() {
  const { u, err } = await wajibLogin();
  if (err) return err;
  const drill = db().prepare("SELECT topik, tanggal, jumlah, benar, rata_detik AS rataDetik, batas_detik AS batasDetik, lewat_batas AS lewatBatas FROM drill WHERE user_id = ? ORDER BY id DESC LIMIT 10").all(u.id);
  return NextResponse.json({ drill });
}

// Simpan hasil satu drill: { topik, jumlah, benar, rataDetik, batasDetik, lewatBatas }.
export async function POST(request) {
  const { u, err } = await wajibLogin();
  if (err) return err;
  const habis = wajibAktif(u);
  if (habis) return habis;
  const b = await bacaJson(request);
  const bulat = (x, a, z) => Number.isInteger(x) && x >= a && x <= z;
  if (!b || !topikBelajar().includes(b.topik) || !bulat(b.jumlah, 1, 50) || !bulat(b.benar, 0, b.jumlah) || !bulat(b.lewatBatas, 0, b.jumlah)
    || !bulat(b.batasDetik, 5, 300) || !(typeof b.rataDetik === "number" && b.rataDetik >= 0 && b.rataDetik <= 600)) return galat("Hasil drill tidak valid.");
  db().prepare("INSERT INTO drill (user_id, topik, tanggal, jumlah, benar, rata_detik, batas_detik, lewat_batas) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
    .run(u.id, b.topik, new Date().toISOString(), b.jumlah, b.benar, Math.round(b.rataDetik * 10) / 10, b.batasDetik, b.lewatBatas);
  return NextResponse.json({ ok: true });
}
