import { NextResponse } from "next/server";
import { db } from "../../../../lib/db.mjs";
import { bisaKelolaKelas } from "../../../../lib/tryout.mjs";
import { wajibLogin, wajibMaster, galat, bacaJson } from "../../../../lib/session.mjs";

export const dynamic = "force-dynamic";

export async function GET(_req, { params }) {
  const { u, err } = await wajibLogin();
  if (err) return err;
  const id = Number((await params).id);
  const kelas = db().prepare("SELECT id, nama, dibuat FROM kelas WHERE id = ?").get(id);
  if (!kelas || !bisaKelolaKelas(u, id)) return galat("Kelas tidak ditemukan.", 404);
  const anggota = db().prepare("SELECT us.id, us.username, us.nama, a.peran FROM kelas_anggota a JOIN users us ON us.id = a.user_id WHERE a.kelas_id = ? ORDER BY a.peran DESC, us.nama").all(id);
  return NextResponse.json({ kelas, anggota });
}

// Master menambah/menghapus anggota dan menunjuk tutor: { userId, aksi: "tambah" | "hapus", peran: "siswa" | "tutor" }
export async function PATCH(request, { params }) {
  const { err } = await wajibMaster();
  if (err) return err;
  const id = Number((await params).id);
  const b = await bacaJson(request);
  if (!b || !Number.isInteger(b.userId) || !["tambah", "hapus"].includes(b.aksi)) return galat("Permintaan tidak valid.");
  if (!db().prepare("SELECT 1 FROM kelas WHERE id = ?").get(id)) return galat("Kelas tidak ditemukan.", 404);
  if (b.aksi === "hapus") {
    db().prepare("DELETE FROM kelas_anggota WHERE kelas_id = ? AND user_id = ?").run(id, b.userId);
    return NextResponse.json({ ok: true });
  }
  const peran = b.peran === "tutor" ? "tutor" : "siswa";
  const target = db().prepare("SELECT role FROM users WHERE id = ?").get(b.userId);
  if (!target) return galat("User tidak ditemukan.", 404);
  if (target.role === "master") return galat("Master tidak perlu dimasukkan ke kelas.");
  db().prepare("INSERT INTO kelas_anggota (kelas_id, user_id, peran) VALUES (?, ?, ?) ON CONFLICT(kelas_id, user_id) DO UPDATE SET peran = excluded.peran").run(id, b.userId, peran);
  return NextResponse.json({ ok: true });
}
