import { NextResponse } from "next/server";
import { topikBelajar, simpanDiagnosis, soalValid } from "../../../../lib/belajar.mjs";
import { wajibLogin, galat, bacaJson, wajibAktif } from "../../../../lib/session.mjs";

export const dynamic = "force-dynamic";

// Hasil tes diagnosis: { hasil: [{ topik, benar: 0-2, salah: [soal...] }] }.
export async function POST(request) {
  const { u, err } = await wajibLogin();
  if (err) return err;
  const habis = wajibAktif(u);
  if (habis) return habis;
  const b = await bacaJson(request);
  const ok = topikBelajar();
  const sah = b && Array.isArray(b.hasil) && b.hasil.length >= 1 && b.hasil.length <= ok.length
    && b.hasil.every((h) => h && ok.includes(h.topik) && Number.isInteger(h.benar) && h.benar >= 0 && h.benar <= 2
      && Array.isArray(h.salah) && h.salah.length <= 2 && h.salah.every((x) => x && x.t === h.topik && soalValid(x)));
  if (!sah) return galat("Hasil diagnosis tidak valid.");
  simpanDiagnosis(u.id, b.hasil);
  return NextResponse.json({ ok: true });
}
