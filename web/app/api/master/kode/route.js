import { NextResponse } from "next/server";
import { db } from "../../../../lib/db.mjs";
import { buatKode } from "../../../../lib/kode.mjs";
import { wajibMaster, galat, bacaJson } from "../../../../lib/session.mjs";

export const dynamic = "force-dynamic";

export async function GET() {
  const { err } = await wajibMaster();
  if (err) return err;
  const kode = db().prepare(`SELECT k.kode, k.hari, k.dibuat, k.dipakai_pada AS dipakaiPada, us.nama AS pemakai, us.username
    FROM kode k LEFT JOIN users us ON us.id = k.dipakai_oleh ORDER BY k.dibuat DESC, k.kode LIMIT 500`).all();
  return NextResponse.json({ kode });
}

// Buat kode: { jumlah: 1-200, hari: 1-3650 }.
export async function POST(request) {
  const { err } = await wajibMaster();
  if (err) return err;
  const b = await bacaJson(request);
  if (!b || !Number.isInteger(b.jumlah) || b.jumlah < 1 || b.jumlah > 200 || !Number.isInteger(b.hari) || b.hari < 1 || b.hari > 3650) return galat("Jumlah 1–200 kode dan masa aktif 1–3650 hari.");
  return NextResponse.json({ kode: buatKode(b.jumlah, b.hari) });
}
