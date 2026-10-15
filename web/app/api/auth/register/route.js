import { NextResponse } from "next/server";
import { db } from "../../../../lib/db.mjs";
import { validasiAkun, buatUser, buatSesi, batasi } from "../../../../lib/auth.mjs";
import { normal, kodeBebas, pakaiKode } from "../../../../lib/kode.mjs";
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
  // REGISTRASI=kode: kode aktivasi wajib. Kode yang diberikan (wajib atau tidak) harus valid sebelum akun dibuat.
  const kode = typeof body.kode === "string" && body.kode.trim() ? normal(body.kode) : "";
  if (process.env.REGISTRASI === "kode" && !kode) return galat("Pendaftaran memerlukan kode aktivasi dari bimbel.");
  if (kode && !kodeBebas(kode)) return galat("Kode aktivasi tidak valid atau sudah dipakai.");
  let id;
  try { id = await buatUser({ username: body.username, nama: body.nama, password: body.password }); }
  catch (e) { return String(e.message).includes("UNIQUE") ? galat("Username sudah dipakai.", 409) : galat("Gagal membuat akun.", 500); } // dua pendaftaran serentak
  if (kode) {
    if (!pakaiKode(id, kode)) { db().prepare("DELETE FROM users WHERE id = ?").run(id); return galat("Kode aktivasi baru saja dipakai orang lain.", 409); }
  } else if (Number(process.env.MASA_UJI_HARI) > 0) { // masa uji gratis bagi pendaftar tanpa kode (opsional)
    db().prepare("UPDATE users SET aktif_sampai = ? WHERE id = ?").run(new Date(Date.now() + Number(process.env.MASA_UJI_HARI) * 86_400_000).toISOString(), id);
  }
  const u = db().prepare("SELECT aktif_sampai AS aktifSampai FROM users WHERE id = ?").get(id);
  const res = NextResponse.json({ user: { id, username: body.username, nama: String(body.nama).trim(), role: "user", aktifSampai: u.aktifSampai } });
  setCookieSesi(res, buatSesi(id));
  return res;
}
