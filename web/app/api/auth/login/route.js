import { NextResponse } from "next/server";
import { db } from "../../../../lib/db.mjs";
import { cekPassword, buatSesi, batasi, hashPassword } from "../../../../lib/auth.mjs";
import { galat, bacaJson, ipKlien, setCookieSesi } from "../../../../lib/session.mjs";

export const dynamic = "force-dynamic";
let palsu; // hash tiruan agar waktu respons sama bila username tidak ada
const hashPalsu = () => (palsu ||= hashPassword("tidak-dipakai"));

export async function POST(request) {
  const body = await bacaJson(request);
  if (!body || typeof body.username !== "string" || typeof body.password !== "string") return galat("Permintaan tidak valid.");
  const ip = await ipKlien();
  if (!batasi(`masuk-ip:${ip}`, 40, 15 * 60 * 1000)) return galat("Terlalu banyak percobaan dari alamat ini. Coba lagi dalam 15 menit.", 429);
  if (!batasi(`masuk:${ip}:${body.username.toLowerCase()}`, 10, 15 * 60 * 1000)) return galat("Terlalu banyak percobaan. Coba lagi dalam 15 menit.", 429);
  const u = db().prepare("SELECT id, username, nama, role, pw, aktif FROM users WHERE username = ?").get(body.username);
  const cocok = await cekPassword(body.password, u ? u.pw : await hashPalsu());
  if (!u || !cocok) return galat("Username atau password salah.", 401);
  if (!u.aktif) return galat("Akun dinonaktifkan. Hubungi master.", 403);
  const res = NextResponse.json({ user: { id: u.id, username: u.username, nama: u.nama, role: u.role } });
  setCookieSesi(res, buatSesi(u.id));
  return res;
}
