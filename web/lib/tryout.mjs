// Kelas dan tryout terjadwal: hak akses, paket soal beku, dan penilaian di server.
import { gunzipSync } from "node:zlib";
import { db } from "./db.mjs";
import { simpanPercobaan } from "./nilai.mjs";
import { masukkanSalah } from "./belajar.mjs";
import { CONFIG } from "../data/config";

export const TOLERANSI_MS = 30_000; // kelonggaran kirim setelah tenggat (jaringan lambat)

export const kelasTutor = (u) => db().prepare("SELECT kelas_id FROM kelas_anggota WHERE user_id = ? AND peran = 'tutor'").all(u.id).map((r) => r.kelas_id);
const anggotaKelas = (u, kelasId) => !!db().prepare("SELECT 1 FROM kelas_anggota WHERE kelas_id = ? AND user_id = ?").get(kelasId, u.id);
export const bisaKelolaKelas = (u, kelasId) => u.role === "master" || kelasTutor(u).includes(kelasId);
// Tryout tanpa kelas (kelas_id NULL) terbuka untuk semua user dan hanya dikelola master.
export const bisaKelola = (u, t) => u.role === "master" || (t.kelas_id != null && kelasTutor(u).includes(t.kelas_id));
export const bisaLihat = (u, t) => u.role === "master" || t.kelas_id == null || anggotaKelas(u, t.kelas_id);

export const ambilTryout = (id) => db().prepare("SELECT * FROM tryout WHERE id = ?").get(Number(id));
export const ambilPeserta = (t, userId) => db().prepare("SELECT * FROM tryout_peserta WHERE tryout_id = ? AND user_id = ?").get(t.id, userId);
export const paket = (t) => JSON.parse(gunzipSync(Buffer.from(t.soal)).toString("utf8"));
export const tenggat = (t, p) => p.mulai_ms + t.durasi_menit * 60_000;

export const jawabValid = (j, soal) => Array.isArray(j) && j.length === soal.length
  && j.every((x, i) => x === null || (Number.isInteger(x) && x >= 0 && x < soal[i].opts.length));

// Menilai dan menutup pengerjaan satu peserta. Sinkron dari awal sampai akhir, jadi dua kiriman
// serentak tidak bisa menghasilkan dua nilai. Aman dipanggil ulang (mengembalikan nilai yang sama).
export function selesaikan(t, p, jawab) {
  if (p.attempt_id) return db().prepare("SELECT id, pct, skor, maks FROM attempts WHERE id = ?").get(p.attempt_id);
  const soal = paket(t), j = jawab || JSON.parse(p.jawab);
  const tes = CONFIG.tes.find((x) => x.id === t.tes);
  const detail = soal.map((x, i) => ({ t: x.topik, q: x.q, o: x.opts, a: x.ans, j: j[i] ?? null, s: x.skor || undefined, b: x.bahas }));
  const durasi = Math.min(t.durasi_menit * 60, Math.round((Date.now() - p.mulai_ms) / 1000));
  const r = simpanPercobaan({ userId: p.user_id, tes: { id: t.tes, nama: `${t.judul} (${tes ? tes.nama : t.tes})` }, durasi, detail, tryoutId: t.id });
  db().prepare("UPDATE tryout_peserta SET attempt_id = ?, jawab = ? WHERE tryout_id = ? AND user_id = ?").run(r.id, JSON.stringify(j), t.id, p.user_id);
  masukkanSalah(p.user_id, detail);
  return r;
}

// Peserta yang menutup browser tanpa mengirim: dinilai dari jawaban tersimpan setelah tenggat lewat.
export function finalisasiTelat(t) {
  const batas = Date.now() - t.durasi_menit * 60_000 - TOLERANSI_MS;
  db().prepare("SELECT * FROM tryout_peserta WHERE tryout_id = ? AND attempt_id IS NULL AND mulai_ms < ?").all(t.id, batas)
    .forEach((p) => selesaikan(t, p, null));
}
