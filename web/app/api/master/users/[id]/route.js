import { NextResponse } from "next/server";
import { db } from "../../../../../lib/db.mjs";
import { hashPassword } from "../../../../../lib/auth.mjs";
import { ringkas, kePercobaan } from "../../../../../lib/ringkas.mjs";
import { wajibMaster, galat, bacaJson } from "../../../../../lib/session.mjs";

export const dynamic = "force-dynamic";

export async function GET(_req, { params }) {
  const { err } = await wajibMaster();
  if (err) return err;
  const { id } = await params;
  const u = db().prepare("SELECT id, username, nama, role, aktif, dibuat FROM users WHERE id = ?").get(Number(id));
  if (!u) return galat("User tidak ditemukan.", 404);
  const baris = db().prepare("SELECT id, tes, nama, mode, skor, maks, pct, durasi, tanggal, per_topik FROM attempts WHERE user_id = ? ORDER BY tanggal ASC").all(u.id);
  return NextResponse.json({ user: { ...u, aktif: !!u.aktif }, ringkasan: ringkas(baris), percobaan: baris.map(kePercobaan) });
}

// Nonaktifkan/aktifkan akun atau atur ulang password.
export async function PATCH(request, { params }) {
  const { u: master, err } = await wajibMaster();
  if (err) return err;
  const { id } = await params;
  const b = await bacaJson(request);
  if (!b) return galat("Permintaan tidak valid.");
  const target = db().prepare("SELECT id, role FROM users WHERE id = ?").get(Number(id));
  if (!target) return galat("User tidak ditemukan.", 404);
  if (target.role === "master" && target.id !== master.id) return galat("Akun master lain tidak dapat diubah.", 403);
  if (typeof b.aktif === "boolean") {
    if (target.id === master.id) return galat("Tidak bisa menonaktifkan akun sendiri.");
    db().prepare("UPDATE users SET aktif = ? WHERE id = ?").run(b.aktif ? 1 : 0, target.id);
    if (!b.aktif) db().prepare("DELETE FROM sessions WHERE user_id = ?").run(target.id);
  }
  if (b.password !== undefined) {
    if (typeof b.password !== "string" || b.password.length < 8 || b.password.length > 100) return galat("Password 8–100 karakter.");
    db().prepare("UPDATE users SET pw = ? WHERE id = ?").run(await hashPassword(b.password), target.id);
    db().prepare("DELETE FROM sessions WHERE user_id = ?").run(target.id);
  }
  return NextResponse.json({ ok: true });
}
