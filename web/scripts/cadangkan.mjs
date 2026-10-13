// Cadangan database yang konsisten (aman dijalankan saat aplikasi berjalan).
//   node scripts/cadangkan.mjs [folder-tujuan] [jumlah-salinan-disimpan]
// Contoh cron harian:  15 2 * * *  cd /opt/bumn/web && DB_PATH=/var/lib/bumn/app.db node scripts/cadangkan.mjs /var/backups/bumn 14
import fs from "node:fs";
import path from "node:path";
import { db } from "../lib/db.mjs";

const tujuan = process.argv[2] || "backup";
const simpan = Number(process.argv[3] || 14);
fs.mkdirSync(tujuan, { recursive: true });
const nama = `bumn-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.db`;
const file = path.join(tujuan, nama);
db().exec(`VACUUM INTO '${file.replace(/'/g, "''")}'`); // salinan konsisten tanpa mengunci penulisan lama
fs.chmodSync(file, 0o600);
console.log("Cadangan dibuat:", file, `(${Math.round(fs.statSync(file).size / 1024)} KB)`);

// buang cadangan lama, sisakan yang terbaru
const semua = fs.readdirSync(tujuan).filter((f) => /^bumn-.*\.db$/.test(f)).sort();
for (const f of semua.slice(0, Math.max(0, semua.length - simpan))) fs.unlinkSync(path.join(tujuan, f));
