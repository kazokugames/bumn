import { NextResponse } from "next/server";
import { gunzipSync } from "node:zlib";
import { db } from "../../../lib/db.mjs";
import { topikBelajar } from "../../../lib/belajar.mjs";
import { hariWib, sisaHari, tanggalValid, targetHarian, kesiapan } from "../../../lib/rencana.mjs";
import { wajibLogin, galat, bacaJson } from "../../../lib/session.mjs";
import { CONFIG } from "../../../data/config";

export const dynamic = "force-dynamic";

const tesSkd = (id) => CONFIG.tes.find((t) => t.id === id && t.subtes);

// Rencana saya: hitung mundur, target harian, kemajuan hari ini, dan kesiapan per subtes dari 3 percobaan SKD terakhir.
export async function GET() {
  const { u, err } = await wajibLogin();
  if (err) return err;
  const r = db().prepare("SELECT tes_id, tanggal, menit_per_hari FROM rencana WHERE user_id = ?").get(u.id);
  if (!r) return NextResponse.json({ rencana: null, tesPilihan: CONFIG.tes.filter((t) => t.subtes).map((t) => ({ id: t.id, nama: t.nama })) });
  const tes = tesSkd(r.tes_id);
  const sisa = sisaHari(r.tanggal);
  const dikuasai = db().prepare("SELECT COUNT(*) AS n FROM kuasai WHERE user_id = ? AND dikuasai = 1").get(u.id).n;
  const belum = Math.max(0, topikBelajar().length - dikuasai);
  const hariIni = (db().prepare("SELECT jumlah FROM belajar_harian WHERE user_id = ? AND hari = ?").get(u.id, hariWib()) || { jumlah: 0 }).jumlah;
  const baris = db().prepare("SELECT detail FROM attempts WHERE user_id = ? AND tes = ? ORDER BY tanggal DESC LIMIT 3").all(u.id, r.tes_id);
  const percobaan = baris.map((x) => JSON.parse(gunzipSync(Buffer.from(x.detail)).toString("utf8")));
  return NextResponse.json({
    rencana: { tesId: r.tes_id, namaTes: tes ? tes.nama : r.tes_id, tanggal: r.tanggal, menitPerHari: r.menit_per_hari, sisaHari: sisa },
    target: sisa >= 0 ? targetHarian(sisa, belum) : 0, topikBelum: belum, hariIni,
    kesiapan: kesiapan(tes, percobaan), jumlahPercobaan: percobaan.length,
  });
}

// Simpan atau ubah rencana: { tesId, tanggal: "YYYY-MM-DD", menitPerHari? }.
export async function PUT(request) {
  const { u, err } = await wajibLogin();
  if (err) return err;
  const b = await bacaJson(request);
  if (!b || !tesSkd(b.tesId)) return galat("Pilih tes SKD yang tersedia.");
  if (!tanggalValid(b.tanggal) || sisaHari(b.tanggal) < 0) return galat("Tanggal tes harus berupa tanggal hari ini atau yang akan datang.");
  const menit = b.menitPerHari == null ? 60 : Number(b.menitPerHari);
  if (!Number.isInteger(menit) || menit < 10 || menit > 600) return galat("Waktu belajar harian 10–600 menit.");
  db().prepare(`INSERT INTO rencana (user_id, tes_id, tanggal, menit_per_hari, dibuat) VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(user_id) DO UPDATE SET tes_id = excluded.tes_id, tanggal = excluded.tanggal, menit_per_hari = excluded.menit_per_hari`)
    .run(u.id, b.tesId, b.tanggal, menit, new Date().toISOString());
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const { u, err } = await wajibLogin();
  if (err) return err;
  db().prepare("DELETE FROM rencana WHERE user_id = ?").run(u.id);
  return NextResponse.json({ ok: true });
}
