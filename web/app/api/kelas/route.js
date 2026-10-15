import { NextResponse } from "next/server";
import { db } from "../../../lib/db.mjs";
import { kelasTutor } from "../../../lib/tryout.mjs";
import { wajibLogin, wajibMaster, galat, bacaJson } from "../../../lib/session.mjs";

export const dynamic = "force-dynamic";

// Master melihat semua kelas; tutor hanya kelas yang ia ampu.
export async function GET() {
  const { u, err } = await wajibLogin();
  if (err) return err;
  const milik = kelasTutor(u);
  if (u.role !== "master" && !milik.length) return galat("Khusus master dan tutor.", 403);
  const semua = db().prepare(`
    SELECT k.id, k.nama, k.dibuat,
      (SELECT COUNT(*) FROM kelas_anggota a WHERE a.kelas_id = k.id AND a.peran = 'siswa') AS siswa,
      (SELECT GROUP_CONCAT(us.nama, ', ') FROM kelas_anggota a JOIN users us ON us.id = a.user_id WHERE a.kelas_id = k.id AND a.peran = 'tutor') AS tutor
    FROM kelas k ORDER BY k.nama`).all();
  return NextResponse.json({ kelas: u.role === "master" ? semua : semua.filter((k) => milik.includes(k.id)) });
}

export async function POST(request) {
  const { err } = await wajibMaster();
  if (err) return err;
  const b = await bacaJson(request);
  const nama = b && typeof b.nama === "string" ? b.nama.trim() : "";
  if (nama.length < 2 || nama.length > 60) return galat("Nama kelas 2–60 karakter.");
  if (db().prepare("SELECT 1 FROM kelas WHERE nama = ?").get(nama)) return galat("Nama kelas sudah dipakai.", 409);
  const r = db().prepare("INSERT INTO kelas (nama, dibuat) VALUES (?, ?)").run(nama, new Date().toISOString());
  return NextResponse.json({ id: Number(r.lastInsertRowid) });
}
