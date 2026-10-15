import { NextResponse } from "next/server";
import { ambilTryout, ambilPeserta, paket, tenggat, jawabValid, selesaikan, TOLERANSI_MS } from "../../../../../lib/tryout.mjs";
import { wajibLogin, galat, bacaJson } from "../../../../../lib/session.mjs";

export const dynamic = "force-dynamic";

// Kumpulkan tryout. Nilai dihitung server dari paket beku. Kiriman setelah tenggat (+toleransi)
// tidak dipakai: yang dinilai jawaban tersimpan terakhir. Kirim ulang mengembalikan nilai yang sama.
export async function POST(request, { params }) {
  const { u, err } = await wajibLogin();
  if (err) return err;
  const t = ambilTryout((await params).id);
  const p = t && ambilPeserta(t, u.id);
  if (!p) return galat("Anda belum memulai tryout ini.", 404);
  const telat = Date.now() > tenggat(t, p) + TOLERANSI_MS;
  let jawab = null;
  if (!p.attempt_id && !telat) {
    const b = await bacaJson(request);
    if (!b || !jawabValid(b.jawab, paket(t))) return galat("Jawaban tidak valid.");
    jawab = b.jawab;
  }
  return NextResponse.json({ ...selesaikan(t, p, jawab), telat: telat && !p.attempt_id });
}
