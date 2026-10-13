# Menjalankan di VPS (Hostinger, Ubuntu)

Aplikasi ini Next.js dengan penyimpanan SQLite (satu file, tanpa server database terpisah).
Jalankan **satu proses saja** (jangan mode cluster): pembatas laju login ada di memori proses.

## 0. Sebelum go-live (di komputer pengembangan)
```bash
node check.js            # di folder D:\bumn: validasi bank soal, generator, config, sinkron web/data
node sync.js             # bila check.js meminta
cd web
npm run lint             # harus tanpa peringatan
npm run uji:sanitasi     # HTML hasil ujian aman dirender (XSS) dan soal asli tidak rusak
npm run build
```
Uji alur akun/API pada server lokal dengan database sementara (lihat komentar di `scripts/uji-api.mjs`).

## 1. Persiapan server
```bash
# Pakai user biasa (bukan root) untuk menjalankan aplikasi
sudo adduser --disabled-password bumn
# Node.js 24 LTS (minimal 22.13), nginx, pm2
curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
sudo apt install -y nodejs nginx
sudo npm i -g pm2
node -v    # harus >= 22.13

# Firewall: hanya SSH dan web
sudo ufw allow OpenSSH && sudo ufw allow 'Nginx Full' && sudo ufw enable
```
Disarankan juga `unattended-upgrades` (patch keamanan otomatis) dan login SSH dengan kunci, bukan password.

## 2. Ambil kode dari GitHub dan bangun
Repo berisi seluruh proyek; aplikasi yang dihosting ada di subfolder `web/`.
```bash
sudo mkdir -p /opt/bumn /var/lib/bumn /var/backups/bumn && sudo chown -R bumn:bumn /opt/bumn /var/lib/bumn /var/backups/bumn
sudo -iu bumn
git clone https://github.com/USERNAME/NAMA-REPO.git /opt/bumn
cd /opt/bumn/web && npm ci && npm run build
```
**Repo private?** Buat kunci khusus di VPS dan daftarkan sebagai *Deploy key* (read-only):
```bash
ssh-keygen -t ed25519 -C "vps-bumn" -f ~/.ssh/bumn_deploy -N ""
cat ~/.ssh/bumn_deploy.pub     # salin ke GitHub: Repo > Settings > Deploy keys > Add (JANGAN centang write access)
printf 'Host github-bumn
  HostName github.com
  User git
  IdentityFile ~/.ssh/bumn_deploy
  IdentitiesOnly yes
' >> ~/.ssh/config
git clone git@github-bumn:USERNAME/NAMA-REPO.git /opt/bumn
```

## 3. Buat akun master (sekali)
```bash
cd /opt/bumn/web
DB_PATH=/var/lib/bumn/app.db npm run buat-master -- namamaster "Nama Lengkap"
```
Password diketik di prompt (tidak tampil). Menjalankan lagi dengan username master yang sama = atur ulang password master.

## 4. Jalankan dengan pm2
```bash
cd /opt/bumn/web
DB_PATH=/var/lib/bumn/app.db COOKIE_SECURE=1 \
  pm2 start npm --name bumn -- start -- -H 127.0.0.1 -p 3000
pm2 save && pm2 startup     # jalankan perintah yang ditampilkan agar hidup lagi setelah reboot
```
`-H 127.0.0.1` penting: aplikasi hanya menerima lalu lintas dari nginx. Alamat IP klien dibaca dari header
`X-Forwarded-For`; bila aplikasi terbuka langsung ke internet, header itu bisa dipalsukan dan pembatas laju bisa dilewati.

## 5. nginx + HTTPS
`/etc/nginx/sites-available/bumn`:
```nginx
server {
  server_name contoh.domainanda.com;
  client_max_body_size 5m;          # hasil ujian membawa detail jawaban
  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $remote_addr;      # jangan teruskan header dari klien
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```
```bash
sudo ln -s /etc/nginx/sites-available/bumn /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d contoh.domainanda.com
```
Setelah HTTPS berjalan, tambahkan di blok `server` (443): `add_header Strict-Transport-Security "max-age=31536000" always;`.
Cookie sesi hanya bekerja lewat HTTPS karena `COOKIE_SECURE=1`. Bila login "berhasil" tetapi langsung keluar lagi, hampir pasti penyebabnya HTTPS belum aktif.

## 6. Cadangan dan pemantauan
```bash
# cron harian (crontab -e sebagai user bumn): salinan konsisten, menyimpan 14 terakhir
15 2 * * * cd /opt/bumn/web && DB_PATH=/var/lib/bumn/app.db node scripts/cadangkan.mjs /var/backups/bumn 14
```
Salin folder cadangan ke luar server secara berkala (rclone/scp). **Cadangan yang hanya ada di server yang sama bukan cadangan.**
Pemantauan uptime: arahkan monitor (UptimeRobot dsb.) ke `https://domain/api/health` (harus `{"ok":true,...}`).
Log aplikasi: `pm2 logs bumn`.

Memulihkan: hentikan aplikasi (`pm2 stop bumn`), salin file cadangan ke `/var/lib/bumn/app.db`, hapus `app.db-wal` dan `app.db-shm`, jalankan lagi.

## 7. Memperbarui aplikasi
Di komputer: `git push`. Di VPS (sebagai user `bumn`):
```bash
bash /opt/bumn/deploy/update.sh      # git pull, npm ci, build, pm2 restart, cek /api/health
```
Skrip yang sama juga menjalankan aplikasi pertama kali bila belum ada di pm2 (langkah 4 bisa dilewati; langkah 3 tetap wajib dulu).
Data tidak terhapus saat pembaruan (skema memakai `PRAGMA user_version` untuk migrasi di masa depan).
Jangan mengubah file langsung di VPS: `git pull --ff-only` akan gagal bila ada perubahan lokal.

## Catatan keamanan dan batasan
- **Pendaftaran terbuka.** Pembatas: 10 pendaftaran/jam/IP, 10 percobaan masuk/15 menit per IP+username, 40 percobaan masuk/15 menit per IP. Untuk menutup pendaftaran: `REGISTRASI=tutup` (master tetap bisa menambah user).
- Master melihat semua hasil dan jawaban user (ini diberitahukan di halaman masuk).
- Password di-hash dengan scrypt (N=32768). Sesi 30 hari, dicabut saat user dinonaktifkan atau password diatur ulang. Cookie `HttpOnly`, `SameSite=Lax`, `Secure`.
- HTML soal dari server (halaman "Lihat jawaban") dibersihkan dengan DOMPurify karena user bisa memalsukan detail jawaban lewat API. CSP produksi membatasi koneksi hanya ke asal sendiri.
- Pembatas laju bersifat per-proses dan hilang saat restart. Bukan pengganti `fail2ban`/WAF bila diserang serius.
- Dependensi `postcss` yang dibawa Next 15 punya peringatan `npm audit` (bug di tahap build CSS, tidak menyentuh input pengguna saat berjalan). Perbaikannya ada di Next 16 (perubahan besar); pantau pembaruan Next 15.
- Lupa password master: ulangi langkah 3 dengan username yang sama.
- Kapasitas yang diuji: 200 permintaan bersamaan ke API dalam ~0,2 detik, 30 pendaftaran serentak dalam <1 detik di PC pengembangan. Ukuran hasil ujian: terbesar ±140 KB (tes Matriks, SVG) sebelum kompresi, biasanya 10–90 KB; detail jawaban dikompres gzip di database.
