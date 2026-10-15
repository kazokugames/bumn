import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Identitas pemasangan (satu image untuk semua bimbel, dibedakan lewat variabel lingkungan). Publik, tanpa data pengguna.
export async function GET() {
  const w = process.env.WARNA || "";
  return NextResponse.json({
    nama: (process.env.NAMA_BIMBEL || "").trim().slice(0, 60) || "Simulasi Tes",
    warna: /^#[0-9a-fA-F]{6}$/.test(w) ? w : null,
    registrasi: ["buka", "tutup", "kode"].includes(process.env.REGISTRASI) ? process.env.REGISTRASI : "buka",
  });
}
