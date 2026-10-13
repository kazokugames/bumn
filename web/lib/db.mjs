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
  if (d.prepare("PRAGMA user_version").get().user_version === 0) d.exec("PRAGMA user_version = 1"); // versi skema untuk migrasi berikutnya
  globalThis.__bumnDb = d;
  return d;
}
