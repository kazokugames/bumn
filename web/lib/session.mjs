// Penjaga rute API: baca cookie sesi dan batasi akses berdasarkan peran.
import { cookies, headers } from "next/headers";
import { NextResponse } from "next/server";
import { userDariToken, HARI30 } from "./auth.mjs";

export const NAMA_COOKIE = "sid";
export const galat = (pesan, status = 400) => NextResponse.json({ galat: pesan }, { status });

export async function userSaatIni() {
  const c = await cookies();
  return userDariToken(c.get(NAMA_COOKIE)?.value);
}
export async function wajibLogin() {
  const u = await userSaatIni();
  return u ? { u } : { err: galat("Silakan masuk dahulu.", 401) };
}
export async function wajibMaster() {
  const { u, err } = await wajibLogin();
  if (err) return { err };
  return u.role === "master" ? { u } : { err: galat("Khusus master.", 403) };
}
// Alamat IP klien untuk pembatas laju. Hanya percaya header yang diisi proxy tepercaya:
//   IP_HEADER=cf-connecting-ip   (Cloudflare Tunnel; Cloudflare menimpa header ini, tidak bisa dipalsukan klien)
//   IP_HEADER=x-forwarded-for    (default; nginx dengan "X-Forwarded-For $remote_addr")
//   IP_HEADER=none               (tanpa proxy: semua klien dianggap satu; header tidak dipercaya)
export async function ipKlien() {
  const nama = (process.env.IP_HEADER || "x-forwarded-for").toLowerCase();
  if (nama === "none") return "lokal";
  const h = await headers();
  return (h.get(nama) || "lokal").split(",")[0].trim();
}
// Tolak permintaan tulis yang bukan JSON (lintas situs tidak bisa mengirim JSON tanpa izin CORS).
export const MAKS_BODY = 4_000_000; // byte
export async function bacaJson(request) {
  if (!(request.headers.get("content-type") || "").includes("application/json")) return null;
  if (Number(request.headers.get("content-length") || 0) > MAKS_BODY) return null;
  try {
    const t = await request.text();
    return t.length > MAKS_BODY ? null : JSON.parse(t);
  } catch { return null; }
}
let sudahPeringatan = false;
export function setCookieSesi(res, token) {
  if (process.env.NODE_ENV === "production" && process.env.COOKIE_SECURE !== "1" && !sudahPeringatan) {
    sudahPeringatan = true;
    console.warn("[peringatan] COOKIE_SECURE belum 1: cookie sesi dikirim tanpa flag Secure. Aktifkan setelah HTTPS terpasang.");
  }
  res.cookies.set(NAMA_COOKIE, token, {
    httpOnly: true, sameSite: "lax", path: "/", maxAge: HARI30 / 1000,
    secure: process.env.COOKIE_SECURE === "1",
  });
}
