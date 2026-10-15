import { NextResponse } from "next/server";
import { db } from "../../../lib/db.mjs";
import { topikBelajar } from "../../../lib/belajar.mjs";
import { wajibLogin } from "../../../lib/session.mjs";

export const dynamic = "force-dynamic";

// Ringkasan belajar saya: level per topik dan jumlah soal ulangan.
export async function GET() {
  const { u, err } = await wajibLogin();
  if (err) return err;
  const baris = db().prepare("SELECT topik, level, riwayat, dikuasai FROM kuasai WHERE user_id = ?").all(u.id);
  const a = db().prepare("SELECT COUNT(*) AS total, SUM(jatuh_tempo <= ?) AS jatuhTempo FROM ulang WHERE user_id = ?").get(Date.now(), u.id);
  return NextResponse.json({
    topik: topikBelajar().map((t) => {
      const r = baris.find((x) => x.topik === t);
      return r ? { ...r, mulai: true } : { topik: t, level: 1, riwayat: "", dikuasai: 0, mulai: false };
    }),
    totalUlang: a.total, jatuhTempo: a.jatuhTempo || 0,
  });
}
