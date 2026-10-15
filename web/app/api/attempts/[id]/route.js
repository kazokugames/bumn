import { NextResponse } from "next/server";
import { gunzipSync } from "node:zlib";
import { db } from "../../../../lib/db.mjs";
import { kePercobaan } from "../../../../lib/ringkas.mjs";
import { ambilTryout, bisaKelola } from "../../../../lib/tryout.mjs";
import { wajibLogin, galat } from "../../../../lib/session.mjs";

export const dynamic = "force-dynamic";

// Detail satu percobaan (beserta jawaban): pemilik, master, atau tutor kelas pemilik tryout-nya.
export async function GET(_req, { params }) {
  const { u, err } = await wajibLogin();
  if (err) return err;
  const { id } = await params;
  const r = db().prepare("SELECT a.*, us.username, us.nama AS nama_user FROM attempts a JOIN users us ON us.id = a.user_id WHERE a.id = ?").get(Number(id));
  const tutorKelasnya = () => { const t = r.tryout_id && ambilTryout(r.tryout_id); return !!t && bisaKelola(u, t); };
  if (!r || (r.user_id !== u.id && u.role !== "master" && !tutorKelasnya())) return galat("Tidak ditemukan.", 404);
  return NextResponse.json({ percobaan: kePercobaan(r), detail: JSON.parse(typeof r.detail === "string" ? r.detail : gunzipSync(Buffer.from(r.detail)).toString("utf8")), pemilik: { username: r.username, nama: r.nama_user } });
}
