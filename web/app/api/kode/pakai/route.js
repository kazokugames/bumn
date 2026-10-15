import { NextResponse } from "next/server";
import { batasi } from "../../../../lib/auth.mjs";
import { normal, pakaiKode } from "../../../../lib/kode.mjs";
import { wajibLogin, galat, bacaJson } from "../../../../lib/session.mjs";

export const dynamic = "force-dynamic";

// Siswa memasukkan kode aktivasi untuk memperpanjang masa aktif: { kode }.
export async function POST(request) {
  const { u, err } = await wajibLogin();
  if (err) return err;
  if (u.role === "master" || !u.aktifSampai) return galat("Akunmu tidak memiliki batas masa aktif, kode tidak diperlukan.");
  if (!batasi("kode:" + u.id, 10, 15 * 60 * 1000)) return galat("Terlalu banyak percobaan kode. Coba lagi dalam 15 menit.", 429);
  const b = await bacaJson(request);
  const aktifSampai = b && typeof b.kode === "string" ? pakaiKode(u.id, normal(b.kode)) : null;
  return aktifSampai ? NextResponse.json({ aktifSampai }) : galat("Kode tidak valid atau sudah dipakai.", 400);
}
