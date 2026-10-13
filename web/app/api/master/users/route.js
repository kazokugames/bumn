import { NextResponse } from "next/server";
import { db } from "../../../../lib/db.mjs";
import { validasiAkun, buatUser } from "../../../../lib/auth.mjs";
import { ringkas } from "../../../../lib/ringkas.mjs";
import { wajibMaster, galat, bacaJson } from "../../../../lib/session.mjs";

export const dynamic = "force-dynamic";

// Daftar semua user beserta ringkasan hasil tryout.
export async function GET() {
  const { err } = await wajibMaster();
  if (err) return err;
  const users = db().prepare("SELECT id, username, nama, role, aktif, dibuat FROM users ORDER BY dibuat DESC").all();
  const att = db().prepare("SELECT user_id, pct, tanggal, per_topik FROM attempts").all();
  const per = {};
  att.forEach((a) => { (per[a.user_id] = per[a.user_id] || []).push(a); });
  return NextResponse.json({
    users: users.map((x) => {
      const r = ringkas(per[x.id] || []);
      return { ...x, aktif: !!x.aktif, jumlah: r.jumlah, rata: r.rata, terakhir: r.terakhir, terlemah: r.perTopik[0] || null };
    }),
  });
}

// Master membuat akun user baru.
export async function POST(request) {
  const { err } = await wajibMaster();
  if (err) return err;
  const b = await bacaJson(request);
  if (!b) return galat("Permintaan tidak valid.");
  const salah = validasiAkun(b);
  if (salah) return galat(salah);
  if (db().prepare("SELECT 1 FROM users WHERE username = ?").get(b.username)) return galat("Username sudah dipakai.", 409);
  try { return NextResponse.json({ id: await buatUser({ username: b.username, nama: b.nama, password: b.password }) }); }
  catch (e) { return String(e.message).includes("UNIQUE") ? galat("Username sudah dipakai.", 409) : galat("Gagal membuat akun.", 500); }
}
