// Mode Belajar dari Nol: kemajuan per topik (naik/turun level) dan antrean soal salah dengan pengulangan berjarak.
import { db } from "./db.mjs";
import { detailValid } from "./nilai.mjs";
import { hariWib } from "./rencana.mjs";
import { CONFIG } from "../data/config";

const HARI = 86_400_000;
const JEDA_HARI = [1, 3, 7]; // jeda ulang setelah 0, 1, 2 jawaban benar beruntun; benar ke-3 = lulus dan keluar antrean
export const MAKS_ULANG = 300;

// Topik yang dilatih = fondasi (jalur dari nol) lalu topik tes SKD (target utama).
export const topikBelajar = () => [...CONFIG.belajar.fondasi, ...Object.keys(CONFIG.tes.find((t) => t.id === "skd").komposisi)];

// Soal dari klien berbentuk baris detail { t, q, o, a, s?, b, j: null }; divalidasi dengan aturan yang sama dengan ujian.
export const soalValid = (x) => detailValid([{ ...x, j: null }]);

const sekarang = () => new Date().toISOString();

// Hitung soal yang dikerjakan hari ini (zona WIB), untuk kemajuan terhadap target harian pada rencana.
export function catatHarian(userId, n = 1) {
  db().prepare("INSERT INTO belajar_harian (user_id, hari, jumlah) VALUES (?, ?, ?) ON CONFLICT(user_id, hari) DO UPDATE SET jumlah = jumlah + excluded.jumlah").run(userId, hariWib(), n);
}

export function tambahUlang(userId, x) {
  const ada = db().prepare("SELECT id FROM ulang WHERE user_id = ? AND json_extract(soal, '$.q') = ?").get(userId, x.q);
  if (ada) {
    db().prepare("UPDATE ulang SET jatuh_tempo = ?, interval_hari = 1, benar_beruntun = 0 WHERE id = ?").run(Date.now() + HARI, ada.id);
    return;
  }
  const n = db().prepare("SELECT COUNT(*) AS n FROM ulang WHERE user_id = ?").get(userId).n;
  if (n >= MAKS_ULANG) return; // ponytail: antrean penuh = soal baru diabaikan, bukan menghapus yang lama
  const soal = { ...x };
  delete soal.j;
  db().prepare("INSERT INTO ulang (user_id, topik, soal, jatuh_tempo) VALUES (?, ?, ?, ?)").run(userId, x.t, JSON.stringify(soal), Date.now() + HARI);
}

// Soal yang salah pada ujian atau tryout masuk antrean ulangan (buku salah). Soal tak terjawab tidak dihitung salah.
// TKP dianggap salah bila nilai opsi yang dipilih di bawah 4 (sama dengan aturan di layar belajar). Maks 60 soal per ujian.
export function masukkanSalah(userId, detail) {
  detail.filter((x) => x.j !== null && (x.s ? (x.s[x.j] || 0) < 4 : x.j !== x.a)).slice(0, 60).forEach((x) => tambahUlang(userId, x));
}

// Catat satu jawaban latihan. Naik level setelah 4 dari 5 jawaban terakhir benar; turun (dan ulang konsep)
// setelah 3 salah beruntun; "dikuasai" bila level 3 juga mencapai 4 dari 5.
export function catatJawaban(userId, topik, benar) {
  const r = db().prepare("SELECT level, riwayat, dikuasai FROM kuasai WHERE user_id = ? AND topik = ?").get(userId, topik) || { level: 1, riwayat: "", dikuasai: 0 };
  let { level, dikuasai } = r, riwayat = (r.riwayat + (benar ? "1" : "0")).slice(-5), naik = false, turun = false;
  const betul = [...riwayat].filter((c) => c === "1").length;
  if (riwayat.length === 5 && betul >= 4) {
    if (level < 3) { level++; naik = true; } else dikuasai = 1;
    riwayat = "";
  } else if (riwayat.endsWith("000")) {
    if (level > 1) level--;
    turun = true; riwayat = "";
  }
  db().prepare(`INSERT INTO kuasai (user_id, topik, level, riwayat, dikuasai, diperbarui) VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(user_id, topik) DO UPDATE SET level = excluded.level, riwayat = excluded.riwayat, dikuasai = excluded.dikuasai, diperbarui = excluded.diperbarui`)
    .run(userId, topik, level, riwayat, dikuasai, sekarang());
  return { topik, level, riwayat, dikuasai, naik, turun };
}

// Keadaan sekarang satu topik tanpa mengubah apa pun (dipakai saat jawaban dicatat memakai petunjuk).
export function keadaan(userId, topik) {
  const r = db().prepare("SELECT level, riwayat, dikuasai FROM kuasai WHERE user_id = ? AND topik = ?").get(userId, topik) || { level: 1, riwayat: "", dikuasai: 0 };
  return { topik, ...r, naik: false, turun: false, petunjuk: true };
}

// Hasil tes diagnosis: benar >= 2 dari 2 soal (level 1 dan 2) -> mulai dari level 2, selain itu level 1.
export function simpanDiagnosis(userId, hasil) {
  const d = db();
  d.exec("BEGIN");
  try {
    for (const h of hasil) {
      d.prepare(`INSERT INTO kuasai (user_id, topik, level, riwayat, dikuasai, diperbarui) VALUES (?, ?, ?, '', 0, ?)
        ON CONFLICT(user_id, topik) DO UPDATE SET level = excluded.level, riwayat = '', dikuasai = 0, diperbarui = excluded.diperbarui`)
        .run(userId, h.topik, h.benar >= 2 ? 2 : 1, sekarang());
      h.salah.forEach((x) => tambahUlang(userId, x));
    }
    d.exec("COMMIT");
  } catch (e) { d.exec("ROLLBACK"); throw e; }
}

export function jawabUlang(userId, id, benar) {
  const r = db().prepare("SELECT id, benar_beruntun FROM ulang WHERE id = ? AND user_id = ?").get(id, userId);
  if (!r) return null;
  const n = benar ? r.benar_beruntun + 1 : 0;
  if (n >= 3) { db().prepare("DELETE FROM ulang WHERE id = ?").run(id); return { lulus: true }; }
  const jeda = JEDA_HARI[n];
  db().prepare("UPDATE ulang SET benar_beruntun = ?, interval_hari = ?, jatuh_tempo = ? WHERE id = ?").run(n, jeda, Date.now() + jeda * HARI, id);
  return { lulus: false, jedaHari: jeda };
}
