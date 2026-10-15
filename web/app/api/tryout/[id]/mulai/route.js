import { NextResponse } from "next/server";
import { db } from "../../../../../lib/db.mjs";
import { ambilTryout, ambilPeserta, bisaLihat, paket, tenggat, selesaikan, TOLERANSI_MS } from "../../../../../lib/tryout.mjs";
import { wajibLogin, galat, wajibAktif } from "../../../../../lib/session.mjs";

export const dynamic = "force-dynamic";

// Mulai (atau lanjutkan) tryout. Jendela buka–tutup = rentang waktu boleh MULAI; setelah mulai,
// peserta punya durasi penuh. Soal dikirim tanpa kunci, skor, dan pembahasan.
export async function POST(_req, { params }) {
  const { u, err } = await wajibLogin();
  if (err) return err;
  const habis = wajibAktif(u);
  if (habis) return habis;
  const t = ambilTryout((await params).id);
  if (!t || !bisaLihat(u, t)) return galat("Tryout tidak ditemukan.", 404);
  const now = Date.now();
  let p = ambilPeserta(t, u.id);
  if (!p) {
    if (now < new Date(t.buka).getTime()) return galat("Tryout belum dibuka.", 403);
    if (now > new Date(t.tutup).getTime()) return galat("Tryout sudah ditutup.", 403);
    db().prepare("INSERT OR IGNORE INTO tryout_peserta (tryout_id, user_id, mulai_ms, jawab) VALUES (?, ?, ?, ?)")
      .run(t.id, u.id, now, JSON.stringify(new Array(t.jumlah_soal).fill(null)));
    p = ambilPeserta(t, u.id);
  }
  // sudah dikumpulkan, atau waktunya sudah habis saat peserta kembali: tidak bisa mengerjakan lagi
  if (p.attempt_id || now > tenggat(t, p) + TOLERANSI_MS) return NextResponse.json({ selesai: true, attemptId: selesaikan(t, p, null).id });
  return NextResponse.json({
    judul: t.judul, tes: t.tes, durasiMenit: t.durasi_menit, tenggatMs: tenggat(t, p), sekarangMs: now, jawab: JSON.parse(p.jawab),
    soal: paket(t).map((x) => ({ topik: x.topik, q: x.q, opts: x.opts })),
  });
}
