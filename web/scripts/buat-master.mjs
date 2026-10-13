// Buat akun master (atau atur ulang password master). Jalankan di server:
//   node scripts/buat-master.mjs <username> "<Nama Lengkap>"
// Password diminta lewat prompt (tidak ditampilkan dan tidak tersimpan di riwayat shell).
import readline from "node:readline";
import { db } from "../lib/db.mjs";
import { validasiAkun, buatUser, hashPassword } from "../lib/auth.mjs";

const [username, nama = "Master"] = process.argv.slice(2);
if (!username) {
  console.error('Pemakaian: node scripts/buat-master.mjs <username> "<Nama Lengkap>"');
  process.exit(1);
}

const tty = process.stdin.isTTY;
const rl = readline.createInterface({ input: process.stdin, terminal: tty });
if (tty) rl._writeToOutput = () => {}; // sembunyikan ketikan password
const antre = [];
let tunggu = null;
rl.on("line", (l) => { if (tty) process.stdout.write("\n"); if (tunggu) { const t = tunggu; tunggu = null; t(l); } else antre.push(l); });
rl.on("close", () => { if (tunggu) { const t = tunggu; tunggu = null; t(""); } });
const tanya = (p) => { process.stdout.write(p); return new Promise((ok) => { if (antre.length) ok(antre.shift()); else tunggu = ok; }); };

const pw = await tanya("Password (min. 8 karakter): ");
const ulang = await tanya("Ulangi password: ");
rl.close();
if (pw !== ulang) { console.error("Password tidak sama."); process.exit(1); }
const salah = validasiAkun({ username, nama, password: pw });
if (salah) { console.error(salah); process.exit(1); }

const ada = db().prepare("SELECT id FROM users WHERE username = ?").get(username);
if (ada) {
  db().prepare("UPDATE users SET pw = ?, role = 'master', aktif = 1 WHERE id = ?").run(await hashPassword(pw), ada.id);
  db().prepare("DELETE FROM sessions WHERE user_id = ?").run(ada.id);
  console.log(`Akun "${username}" diperbarui menjadi master dengan password baru.`);
} else {
  await buatUser({ username, nama, password: pw, role: "master" });
  console.log(`Akun master "${username}" dibuat.`);
}
