import { NextResponse } from "next/server";
import { gzipSync } from "node:zlib";
import { db } from "../../../lib/db.mjs";
import { susunSoal } from "../../../lib/susun.mjs";
import { bisaKelola, bisaLihat, kelasTutor } from "../../../lib/tryout.mjs";
import { wajibLogin, galat, bacaJson } from "../../../lib/session.mjs";
import { CONFIG } from "../../../data/config";

export const dynamic = "force-dynamic";

// Daftar tryout yang boleh saya lihat, beserta status pengerjaan saya.
export async function GET() {
  const { u, err } = await wajibLogin();
  if (err) return err;
  const semua = db().prepare(`
    SELECT t.id, t.judul, t.tes, t.kelas_id, t.buka, t.tutup, t.durasi_menit, t.jumlah_soal, k.nama AS kelas,
      (SELECT COUNT(*) FROM tryout_peserta p WHERE p.tryout_id = t.id) AS peserta,
      (SELECT COUNT(*) FROM tryout_peserta p WHERE p.tryout_id = t.id AND p.attempt_id IS NOT NULL) AS selesai
    FROM tryout t LEFT JOIN kelas k ON k.id = t.kelas_id ORDER BY t.buka DESC`).all();
  const saya = {};
  db().prepare("SELECT p.tryout_id, p.mulai_ms, p.attempt_id, a.pct FROM tryout_peserta p LEFT JOIN attempts a ON a.id = p.attempt_id WHERE p.user_id = ?").all(u.id)
    .forEach((p) => { saya[p.tryout_id] = p; });
  return NextResponse.json({
    sekarang: Date.now(),
    tryout: semua.filter((t) => bisaLihat(u, t)).map((t) => {
      const p = saya[t.id], kelola = bisaKelola(u, t);
      return {
        id: t.id, judul: t.judul, tes: t.tes, namaTes: (CONFIG.tes.find((x) => x.id === t.tes) || {}).nama || t.tes,
        kelas: t.kelas || null, buka: t.buka, tutup: t.tutup, durasiMenit: t.durasi_menit, jumlahSoal: t.jumlah_soal, kelola,
        ...(kelola ? { peserta: t.peserta, selesai: t.selesai } : {}),
        saya: p ? { mulai: p.mulai_ms, attemptId: p.attempt_id, pct: p.pct } : null,
      };
    }),
  });
}

// Master (kelas mana pun atau semua user) dan tutor (kelasnya sendiri) membuat tryout.
// Paket soal disusun SEKALI di sini dan dibekukan, sehingga semua peserta mengerjakan soal yang sama.
export async function POST(request) {
  const { u, err } = await wajibLogin();
  if (err) return err;
  const b = await bacaJson(request);
  if (!b) return galat("Permintaan tidak valid.");
  const kelasId = b.kelasId == null ? null : Number(b.kelasId);
  if (u.role !== "master" && !(kelasId != null && kelasTutor(u).includes(kelasId))) return galat("Anda hanya bisa membuat tryout untuk kelas yang Anda ampu.", 403);
  if (kelasId != null && !db().prepare("SELECT 1 FROM kelas WHERE id = ?").get(kelasId)) return galat("Kelas tidak ditemukan.", 404);
  const judul = typeof b.judul === "string" ? b.judul.trim() : "";
  if (judul.length < 3 || judul.length > 80) return galat("Judul 3–80 karakter.");
  const tes = CONFIG.tes.find((t) => t.id === b.tes);
  if (!tes) return galat("Tes tidak dikenal.");
  const buka = new Date(b.buka), tutup = new Date(b.tutup);
  if (isNaN(buka) || isNaN(tutup) || tutup <= buka) return galat("Waktu buka dan tutup tidak valid (tutup harus setelah buka).");
  if (tutup.getTime() <= Date.now()) return galat("Waktu tutup sudah lewat.");
  const durasi = b.durasiMenit == null ? tes.durasiMenit : Number(b.durasiMenit);
  if (!Number.isInteger(durasi) || durasi < 1 || durasi > 300) return galat("Durasi 1–300 menit.");
  const { list } = susunSoal(tes);
  if (!list.length) return galat("Tes ini belum punya soal.");
  const r = db().prepare("INSERT INTO tryout (judul, tes, kelas_id, buka, tutup, durasi_menit, jumlah_soal, soal, dibuat_oleh, dibuat) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
    .run(judul, tes.id, kelasId, buka.toISOString(), tutup.toISOString(), durasi, list.length, gzipSync(JSON.stringify(list)), u.id, new Date().toISOString());
  return NextResponse.json({ id: Number(r.lastInsertRowid), jumlahSoal: list.length });
}
