import { NextResponse } from "next/server";
import { topikBelajar, catatJawaban, tambahUlang, soalValid, keadaan, catatHarian } from "../../../../lib/belajar.mjs";
import { wajibLogin, galat, bacaJson, wajibAktif } from "../../../../lib/session.mjs";

export const dynamic = "force-dynamic";

// Catat satu jawaban latihan: { topik, benar, soal?, petunjuk? }. Soal wajib disertakan bila salah (masuk antrean ulangan).
// Jawaban yang dibantu petunjuk tidak menaikkan atau menurunkan level; bila salah tetap masuk ulangan.
// Kunci latihan memang terlihat di browser; server hanya mencatat kemajuan.
export async function POST(request) {
  const { u, err } = await wajibLogin();
  if (err) return err;
  const habis = wajibAktif(u);
  if (habis) return habis;
  const b = await bacaJson(request);
  if (!b || typeof b.benar !== "boolean" || !topikBelajar().includes(b.topik)) return galat("Permintaan tidak valid.");
  if (!b.benar) {
    if (!b.soal || b.soal.t !== b.topik || !soalValid(b.soal)) return galat("Soal tidak valid.");
    tambahUlang(u.id, b.soal);
  }
  catatHarian(u.id);
  return NextResponse.json(b.petunjuk === true ? keadaan(u.id, b.topik) : catatJawaban(u.id, b.topik, b.benar));
}
