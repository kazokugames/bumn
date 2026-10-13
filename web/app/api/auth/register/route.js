import { NextResponse } from "next/server";
import { db } from "../../../../lib/db.mjs";
import { validasiAkun, buatUser, buatSesi, batasi } from "../../../../lib/auth.mjs";
import { galat, bacaJson, ipKlien, setCookieSesi } from "../../../../lib/session.mjs";

export const dynamic = "force-dynamic";

export async function POST(request) {
  if (process.env.REGISTRASI === "tutup") return galat("Pendaftaran sedang ditutup. Hubungi master untuk dibuatkan akun.", 403);
  const body = await bacaJson(request);
  if (!body) return galat("Permintaan tidak valid.");
  if (!batasi("daftar:" + (await ipKlien()), 10, 3600 * 1000)) return galat("Terlalu banyak pendaftaran dari alamat ini. Coba lagi nanti.", 429);
  const salah = validasiAkun(body);
  if (salah) return galat(salah);
  if (db().prepare("SELECT 1 FROM users WHERE username = ?").get(body.username)) return galat("Username sudah dipakai.", 409);
  let id;
  try { id = await buatUser({ username: body.username, nama: body.nama, password: body.password }); }
  catch (e) { return String(e.message).includes("UNIQUE") ? galat("Username sudah dipakai.", 409) : galat("Gagal membuat akun.", 500); } // dua pendaftaran serentak
  const res = NextResponse.json({ user: { id, username: body.username, nama: String(body.nama).trim(), role: "user" } });
  setCookieSesi(res, buatSesi(id));
  return res;
}
