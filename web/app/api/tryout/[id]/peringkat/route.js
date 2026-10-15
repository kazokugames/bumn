import { NextResponse } from "next/server";
import { db } from "../../../../../lib/db.mjs";
import { ambilTryout, ambilPeserta, bisaLihat, bisaKelola, finalisasiTelat } from "../../../../../lib/tryout.mjs";
import { wajibLogin, galat } from "../../../../../lib/session.mjs";

export const dynamic = "force-dynamic";

// Peringkat: nilai tertinggi dulu, bila sama yang lebih cepat di atas.
// Pengelola melihat kapan saja; peserta baru bisa melihat setelah mengumpulkan.
export async function GET(_req, { params }) {
  const { u, err } = await wajibLogin();
  if (err) return err;
  const t = ambilTryout((await params).id);
  if (!t || !bisaLihat(u, t)) return galat("Tryout tidak ditemukan.", 404);
  finalisasiTelat(t);
  const kelola = bisaKelola(u, t);
  if (!kelola && !(ambilPeserta(t, u.id) || {}).attempt_id) return galat("Peringkat bisa dilihat setelah Anda mengumpulkan tryout ini.", 403);
  const baris = db().prepare(`
    SELECT a.id AS attemptId, us.id AS userId, us.nama, us.username, a.pct, a.skor, a.maks, a.durasi
    FROM tryout_peserta p JOIN attempts a ON a.id = p.attempt_id JOIN users us ON us.id = p.user_id
    WHERE p.tryout_id = ? ORDER BY a.pct DESC, a.durasi ASC, a.id ASC`).all(t.id);
  const sedang = db().prepare("SELECT COUNT(*) AS n FROM tryout_peserta WHERE tryout_id = ? AND attempt_id IS NULL").get(t.id).n;
  return NextResponse.json({
    judul: t.judul, sedangMengerjakan: sedang, kelola,
    // attemptId hanya untuk pengelola (membuka jawaban) dan baris milik sendiri
    peringkat: baris.map((r, i) => ({ urut: i + 1, nama: r.nama, username: r.username, pct: r.pct, skor: r.skor, maks: r.maks, durasi: r.durasi, saya: r.userId === u.id, attemptId: kelola || r.userId === u.id ? r.attemptId : undefined })),
  });
}
