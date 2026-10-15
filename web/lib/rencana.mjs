// Rencana menuju tanggal tes: hitung mundur, target soal harian, dan kesiapan per subtes. Modul murni (tanpa database).
import { hitungSubtes } from "./subtes.mjs";

const WIB_MS = 7 * 3600 * 1000; // ponytail: hari dihitung zona WIB tetap; ganti bila pemasangan di zona lain
export const hariWib = (ms = Date.now()) => new Date(ms + WIB_MS).toISOString().slice(0, 10);
export const sisaHari = (tanggal, ms = Date.now()) => Math.round((Date.parse(tanggal + "T00:00:00Z") - Date.parse(hariWib(ms) + "T00:00:00Z")) / 86400000);
export const tanggalValid = (t) => typeof t === "string" && /^\d{4}-\d{2}-\d{2}$/.test(t) && !isNaN(Date.parse(t + "T00:00:00Z")) && new Date(t + "T00:00:00Z").toISOString().slice(0, 10) === t;

// Perkiraan kasar: ±40 soal latihan per topik sampai dikuasai. Dua hari terakhir disisakan untuk ulangan dan tryout.
// Target dibulatkan ke kelipatan 5 dan dibatasi 10-150 soal per hari.
export const SOAL_PER_TOPIK = 40;
export function targetHarian(sisa, topikBelum) {
  const hari = Math.max(1, sisa - 2);
  return Math.min(150, Math.max(10, Math.ceil((topikBelum * SOAL_PER_TOPIK) / hari / 5) * 5));
}

// Kesiapan per subtes dari beberapa percobaan SKD (terbaru dulu). Hasilnya status per subtes, BUKAN persentase peluang lulus:
// lolos (>= ambang), dekat (>= 90% ambang), jauh. Tren = selisih poin percobaan terbaru dan yang tertua (butuh >= 2 percobaan).
export function kesiapan(tes, percobaan) {
  if (!tes || !tes.subtes || !percobaan.length) return null;
  const hitung = percobaan.map((rows) => hitungSubtes(tes, rows));
  const baru = hitung[0], tua = hitung[hitung.length - 1];
  return baru.map((st, i) => ({
    nama: st.nama, poin: st.poin, maks: st.maks, ambang: st.ambang,
    status: st.poin >= st.ambang ? "lolos" : st.poin >= st.ambang * 0.9 ? "dekat" : "jauh",
    tren: hitung.length >= 2 ? st.poin - tua[i].poin : null,
  }));
}

// Berkas kalender (.ics) berisi pengingat harian sampai hari tes. Waktu "floating" (mengikuti jam perangkat pengguna).
export function buatIcs({ nama, tanggal, target, jam = "19:00" }, ms = Date.now()) {
  const mulai = hariWib(ms).replace(/-/g, "") + "T" + jam.replace(":", "") + "00";
  const sampai = tanggal.replace(/-/g, "") + "T235959";
  const lipat = (s) => s.replace(/[\\;,]/g, (c) => "\\" + c);
  return [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Belajar Tes//ID", "CALSCALE:GREGORIAN", "BEGIN:VEVENT",
    "UID:belajar-" + tanggal + "-" + target + "@lokal", "DTSTAMP:" + new Date(ms).toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z",
    "DTSTART:" + mulai, "DURATION:PT45M", "RRULE:FREQ=DAILY;UNTIL=" + sampai,
    "SUMMARY:" + lipat("Belajar " + nama + ": target " + target + " soal"),
    "DESCRIPTION:" + lipat("Buka aplikasi, kerjakan ulangan yang jatuh tempo lalu latihan topik terlemah."),
    "BEGIN:VALARM", "ACTION:DISPLAY", "DESCRIPTION:Waktunya belajar", "TRIGGER:-PT10M", "END:VALARM", "END:VEVENT", "END:VCALENDAR",
  ].join("\r\n") + "\r\n";
}
