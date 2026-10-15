import { NextResponse } from "next/server";
import { db } from "../../../../../lib/db.mjs";
import { ambilTryout, ambilPeserta, paket, tenggat, jawabValid, TOLERANSI_MS } from "../../../../../lib/tryout.mjs";
import { wajibLogin, galat, bacaJson } from "../../../../../lib/session.mjs";

export const dynamic = "force-dynamic";

// Simpan jawaban berkala, supaya putus koneksi atau browser tertutup tidak menghapus pekerjaan.
export async function POST(request, { params }) {
  const { u, err } = await wajibLogin();
  if (err) return err;
  const t = ambilTryout((await params).id);
  const p = t && ambilPeserta(t, u.id);
  if (!p) return galat("Anda belum memulai tryout ini.", 404);
  if (p.attempt_id || Date.now() > tenggat(t, p) + TOLERANSI_MS) return galat("Waktu pengerjaan sudah berakhir.", 409);
  const b = await bacaJson(request);
  if (!b || !jawabValid(b.jawab, paket(t))) return galat("Jawaban tidak valid.");
  db().prepare("UPDATE tryout_peserta SET jawab = ? WHERE tryout_id = ? AND user_id = ? AND attempt_id IS NULL").run(JSON.stringify(b.jawab), t.id, u.id);
  return NextResponse.json({ ok: true });
}
