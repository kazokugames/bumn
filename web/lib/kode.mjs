// Kode aktivasi: satu kode = satu kali pakai = menambah masa aktif akun sebanyak `hari`.
import crypto from "node:crypto";
import { db } from "./db.mjs";

const HURUF = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // tanpa I, L, O, 0, 1 agar tidak tertukar saat diketik
const satu = () => Array.from({ length: 12 }, () => HURUF[crypto.randomInt(HURUF.length)]).join("").replace(/(.{4})(?=.)/g, "$1-");

// "abcd efgh jkmn" -> "ABCD-EFGH-JKMN"
export const normal = (k) => String(k || "").toUpperCase().replace(/[^A-Z0-9]/g, "").replace(/(.{4})(?=.)/g, "$1-");

export function buatKode(jumlah, hari) {
  const hasil = [], d = db();
  d.exec("BEGIN");
  try {
    while (hasil.length < jumlah) {
      const k = satu();
      if (d.prepare("INSERT OR IGNORE INTO kode (kode, hari, dibuat) VALUES (?, ?, ?)").run(k, hari, new Date().toISOString()).changes) hasil.push(k);
    }
    d.exec("COMMIT");
  } catch (e) { d.exec("ROLLBACK"); throw e; }
  return hasil;
}

export const kodeBebas = (kode) => !!db().prepare("SELECT 1 FROM kode WHERE kode = ? AND dipakai_oleh IS NULL").get(kode);

// Pakai kode secara atomik (UPDATE bersyarat, jadi dua permintaan serentak tidak bisa memakai kode yang sama).
// Mengembalikan masa aktif baru (ISO) atau null bila kode tidak ada / sudah terpakai.
export function pakaiKode(userId, kode) {
  const r = db().prepare("UPDATE kode SET dipakai_oleh = ?, dipakai_pada = ? WHERE kode = ? AND dipakai_oleh IS NULL").run(userId, new Date().toISOString(), kode);
  if (!r.changes) return null;
  const { hari } = db().prepare("SELECT hari FROM kode WHERE kode = ?").get(kode);
  const { aktif_sampai: a } = db().prepare("SELECT aktif_sampai FROM users WHERE id = ?").get(userId);
  const baru = new Date(Math.max(Date.now(), a ? Date.parse(a) : 0) + hari * 86_400_000).toISOString(); // perpanjang dari sisa masa aktif
  db().prepare("UPDATE users SET aktif_sampai = ? WHERE id = ?").run(baru, userId);
  return baru;
}
