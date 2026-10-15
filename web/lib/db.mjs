// Penyimpanan SQLite (modul bawaan Node >= 22.13 / 24, tanpa instalasi database).
import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";

export function db() {
  if (globalThis.__bumnDb) return globalThis.__bumnDb;
  const file = process.env.DB_PATH || path.join(process.cwd(), "var", "app.db");
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const d = new DatabaseSync(file);
  d.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
    PRAGMA busy_timeout = 5000;
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE COLLATE NOCASE,
      nama TEXT NOT NULL,
      pw TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      aktif INTEGER NOT NULL DEFAULT 1,
      dibuat TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      kedaluwarsa INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS attempts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      tes TEXT NOT NULL,
      nama TEXT NOT NULL,
      mode TEXT NOT NULL,
      skor REAL NOT NULL,
      maks REAL NOT NULL,
      pct REAL NOT NULL,
      durasi INTEGER NOT NULL,
      tanggal TEXT NOT NULL,
      per_topik TEXT NOT NULL,
      detail TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_attempts_user ON attempts(user_id, tanggal);
  `);
  // Migrasi berurutan memakai PRAGMA user_version (0/1 = skema awal).
  if (d.prepare("PRAGMA user_version").get().user_version < 2) {
    d.exec(`
      BEGIN;
      CREATE TABLE kelas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nama TEXT NOT NULL UNIQUE COLLATE NOCASE,
        dibuat TEXT NOT NULL
      );
      CREATE TABLE kelas_anggota (
        kelas_id INTEGER NOT NULL REFERENCES kelas(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        peran TEXT NOT NULL DEFAULT 'siswa',
        PRIMARY KEY (kelas_id, user_id)
      );
      CREATE TABLE tryout (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        judul TEXT NOT NULL,
        tes TEXT NOT NULL,
        kelas_id INTEGER REFERENCES kelas(id) ON DELETE CASCADE,
        buka TEXT NOT NULL,
        tutup TEXT NOT NULL,
        durasi_menit INTEGER NOT NULL,
        jumlah_soal INTEGER NOT NULL,
        soal BLOB NOT NULL,
        dibuat_oleh INTEGER NOT NULL REFERENCES users(id),
        dibuat TEXT NOT NULL
      );
      CREATE TABLE tryout_peserta (
        tryout_id INTEGER NOT NULL REFERENCES tryout(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        mulai_ms INTEGER NOT NULL,
        jawab TEXT NOT NULL,
        attempt_id INTEGER,
        PRIMARY KEY (tryout_id, user_id)
      );
      ALTER TABLE attempts ADD COLUMN tryout_id INTEGER;
      PRAGMA user_version = 2;
      COMMIT;
    `);
  }
  if (d.prepare("PRAGMA user_version").get().user_version < 3) {
    d.exec(`
      BEGIN;
      CREATE TABLE kuasai (
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        topik TEXT NOT NULL,
        level INTEGER NOT NULL DEFAULT 1,
        riwayat TEXT NOT NULL DEFAULT '',
        dikuasai INTEGER NOT NULL DEFAULT 0,
        diperbarui TEXT NOT NULL,
        PRIMARY KEY (user_id, topik)
      );
      CREATE TABLE ulang (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        topik TEXT NOT NULL,
        soal TEXT NOT NULL,
        jatuh_tempo INTEGER NOT NULL,
        interval_hari INTEGER NOT NULL DEFAULT 1,
        benar_beruntun INTEGER NOT NULL DEFAULT 0
      );
      CREATE INDEX idx_ulang_user ON ulang(user_id, jatuh_tempo);
      PRAGMA user_version = 3;
      COMMIT;
    `);
  }
  if (d.prepare("PRAGMA user_version").get().user_version < 4) {
    d.exec(`
      BEGIN;
      ALTER TABLE users ADD COLUMN aktif_sampai TEXT; -- NULL = tanpa batas (akun lama dan master)
      CREATE TABLE kode (
        kode TEXT PRIMARY KEY,
        hari INTEGER NOT NULL,
        dibuat TEXT NOT NULL,
        dipakai_oleh INTEGER REFERENCES users(id) ON DELETE SET NULL,
        dipakai_pada TEXT
      );
      PRAGMA user_version = 4;
      COMMIT;
    `);
  }
  if (d.prepare("PRAGMA user_version").get().user_version < 5) {
    d.exec(`
      BEGIN;
      CREATE TABLE rencana (
        user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        tes_id TEXT NOT NULL,
        tanggal TEXT NOT NULL,
        menit_per_hari INTEGER NOT NULL DEFAULT 60,
        dibuat TEXT NOT NULL
      );
      CREATE TABLE belajar_harian (
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        hari TEXT NOT NULL,
        jumlah INTEGER NOT NULL DEFAULT 0,
        PRIMARY KEY (user_id, hari)
      );
      PRAGMA user_version = 5;
      COMMIT;
    `);
  }
  if (d.prepare("PRAGMA user_version").get().user_version < 6) {
    d.exec(`
      BEGIN;
      CREATE TABLE drill (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        topik TEXT NOT NULL,
        tanggal TEXT NOT NULL,
        jumlah INTEGER NOT NULL,
        benar INTEGER NOT NULL,
        rata_detik REAL NOT NULL,
        batas_detik INTEGER NOT NULL,
        lewat_batas INTEGER NOT NULL
      );
      CREATE INDEX idx_drill_user ON drill(user_id, tanggal);
      PRAGMA user_version = 6;
      COMMIT;
    `);
  }
  globalThis.__bumnDb = d;
  return d;
}
