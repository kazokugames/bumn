// Hash password (scrypt), sesi, dan pembatas laju. Tanpa dependensi luar.
import crypto from "node:crypto";
import { promisify } from "node:util";
import { db } from "./db.mjs";

// scrypt asinkron (jalan di threadpool, tidak memblokir server). Parameter ikut disimpan di hash
// sehingga bisa dinaikkan nanti tanpa membuat password lama tidak valid.
const scrypt = promisify(crypto.scrypt);
const N = 32768, R = 8, P = 1;
const hitung = (pw, salt, n, r, p) => scrypt(pw, salt, 64, { N: n, r, p, maxmem: 128 * n * r * 2 });

export async function hashPassword(pw) {
  const salt = crypto.randomBytes(16);
  const h = await hitung(pw, salt, N, R, P);
  return `scrypt$${N}$${R}$${P}$${salt.toString("base64")}$${h.toString("base64")}`;
}
export async function cekPassword(pw, simpan) {
  const bagian = String(simpan).split("$");
  if (bagian[0] !== "scrypt" || bagian.length !== 6) return false;
  const [, n, r, p, s, h] = bagian;
  const hasil = await hitung(pw, Buffer.from(s, "base64"), Number(n), Number(r), Number(p));
  const asli = Buffer.from(h, "base64");
  return hasil.length === asli.length && crypto.timingSafeEqual(hasil, asli);
}

export const RE_USERNAME = /^[a-zA-Z0-9_.-]{3,30}$/;
export function validasiAkun({ username, nama, password }) {
  if (!RE_USERNAME.test(username || "")) return "Username 3–30 karakter: huruf, angka, titik, strip, atau garis bawah.";
  const n = String(nama || "").trim();
  if (n.length < 1 || n.length > 60) return "Nama wajib diisi (maksimal 60 karakter).";
  if (typeof password !== "string" || password.length < 8 || password.length > 100) return "Password 8–100 karakter.";
  return null;
}
export async function buatUser({ username, nama, password, role = "user" }) {
  const pw = await hashPassword(password);
  const r = db().prepare("INSERT INTO users (username, nama, pw, role, dibuat) VALUES (?, ?, ?, ?, ?)")
    .run(username, String(nama).trim(), pw, role, new Date().toISOString());
  return Number(r.lastInsertRowid);
}

const sha = (t) => crypto.createHash("sha256").update(t).digest("hex");
export const HARI30 = 30 * 24 * 3600 * 1000;
export function buatSesi(userId) {
  const token = crypto.randomBytes(32).toString("base64url");
  db().prepare("DELETE FROM sessions WHERE kedaluwarsa < ?").run(Date.now());
  db().prepare("INSERT INTO sessions (token, user_id, kedaluwarsa) VALUES (?, ?, ?)").run(sha(token), userId, Date.now() + HARI30);
  return token;
}
export function hapusSesi(token) { db().prepare("DELETE FROM sessions WHERE token = ?").run(sha(token)); }
export function userDariToken(token) {
  if (!token) return null;
  return db().prepare(
    `SELECT u.id, u.username, u.nama, u.role, u.aktif_sampai AS aktifSampai,
            EXISTS(SELECT 1 FROM kelas_anggota k WHERE k.user_id = u.id AND k.peran = 'tutor') AS tutor
     FROM sessions s JOIN users u ON u.id = s.user_id
     WHERE s.token = ? AND s.kedaluwarsa > ? AND u.aktif = 1`).get(sha(token), Date.now()) || null;
}

// Pembatas laju sederhana di memori (cukup untuk satu proses server).
const ember = new Map();
export function batasi(kunci, maks, jendelaMs) {
  const now = Date.now(), e = ember.get(kunci);
  if (!e || e.reset < now) { ember.set(kunci, { n: 1, reset: now + jendelaMs }); return true; }
  e.n++;
  return e.n <= maks;
}
