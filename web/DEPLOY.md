# Hosting di VPS yang sudah menjalankan sistem lain (Docker)

Aplikasi berjalan sebagai **proyek Docker terpisah bernama `bumn-tes`**: container, jaringan, dan volume sendiri.
Aturan keselamatan untuk server yang dipakai bersama:

- Tidak menyentuh container yang sudah ada (`backend`, `database`, `frontend`, `proxy`, `traefik`).
- Tidak memasang nginx/Node di host, tidak mengubah `ufw`, dan tidak memakai port 80/443.
- Semua perintah Docker memakai `-p bumn-tes` (skrip `deploy/update.sh` sudah begitu). Jangan jalankan `docker system prune`, `docker compose down` tanpa `-p bumn-tes`, atau perintah apa pun pada container lain.
- Batas sumber daya: 512 MB RAM dan 0,75 CPU untuk aplikasi (diatur di `deploy/docker-compose.yml`).
- Database berupa satu file SQLite di volume `bumn-tes-data`: tidak memakai server database, port, atau akun database. Container `database` yang ada tidak disentuh.

## 0. Sebelum go-live (di komputer pengembangan)
```bash
node check.js            # di folder repo: validasi bank soal, generator, config, sinkron web/data
node sync.js             # bila check.js meminta
cd web
npm run lint && npm run uji:sanitasi && npm run build
```

## 1. Periksa server dulu (hanya membaca, tidak mengubah apa pun)
```bash
docker ps --format '{{.Names}}  {{.Ports}}'      # lihat container dan port yang sudah terpakai
ss -tlnp | head -30                              # port yang didengarkan di host
free -h && df -h /                               # memori dan disk
docker compose version                           # perlu Docker Compose v2
```
Catat port yang **kosong** untuk `APP_PORT` (bawaan 3100). Port 80 dan 443 milik sistem yang sudah ada; jangan dipakai.

## 2. Ambil kode dan atur konfigurasi
```bash
git clone https://github.com/USERNAME/NAMA-REPO.git /opt/bumn      # repo private: lihat bagian "Repo private" di bawah
cd /opt/bumn/deploy
cp .env.example .env && nano .env                                  # isi APP_PORT, dan TUNNEL_TOKEN bila memakai tunnel
```

## 3. Jalankan
```bash
bash /opt/bumn/deploy/update.sh
```
Skrip melakukan `git pull`, membangun image `bumn-tes`, menjalankan container, dan menunggu status *healthy*.
Cek: `docker ps --filter name=bumn-tes` dan `curl http://127.0.0.1:3100/api/health` (di server) -> `{"ok":true,...}`.

## 4. Buat akun master (sekali)
```bash
docker exec -it bumn-tes-app node scripts/buat-master.mjs namamaster "Nama Lengkap"
```
Password diketik di prompt (tidak tampil). Menjalankan lagi dengan username master yang sama = atur ulang password master.

## 5. Membuka akses dari internet (tanpa menyentuh proxy yang ada)
Container hanya terbuka di `127.0.0.1` server. Pilih salah satu:

**A. Cloudflare Tunnel (disarankan: HTTPS tanpa membuka port, tanpa mengubah proxy/traefik)**
1. Domain Anda harus memakai nameserver Cloudflare (gratis).
2. Cloudflare Zero Trust > Networks > Tunnels > *Create a tunnel* > *Cloudflared* > salin **token**.
3. Di tunnel itu: *Public hostname* -> Subdomain `tes`, Domain Anda, Service `HTTP` `app:3000`.
4. Di `deploy/.env`: `TUNNEL_TOKEN=<token>`, `IP_HEADER=cf-connecting-ip`, `COOKIE_SECURE=1`.
5. Jalankan `bash /opt/bumn/deploy/update.sh` lagi (skrip otomatis menyalakan container `bumn-tes-tunnel` bila token terisi).
   Container tunnel hanya membuat koneksi **keluar** ke Cloudflare dan berada di jaringan `bumn-tes-net` miliknya sendiri.

**B. Uji sementara lewat IP (TANPA HTTPS, hanya untuk mencoba)**
Di `deploy/.env`: `BIND=0.0.0.0`, `APP_PORT=<port bebas>`, `COOKIE_SECURE=0`, `IP_HEADER=none`. Buka port itu di **panel Firewall Hostinger** (bukan `ufw`),
lalu akses `http://IP-SERVER:PORT`. Password dikirim tanpa enkripsi: jangan memakai password asli, dan kembalikan ke 127.0.0.1 setelah selesai.

**C. Lewat proxy yang sudah ada** — tidak dilakukan, karena sistem itu tidak boleh diubah. Bila suatu saat Anda mengizinkan, cukup arahkan satu host baru ke `127.0.0.1:APP_PORT`.

## 6. Cadangan dan pemulihan
Seluruh data ada di volume `bumn-tes-data` (`/data/app.db`). Cadangan yang konsisten (aman saat aplikasi berjalan), lalu salin keluar dari volume:
```bash
docker exec bumn-tes-app node scripts/cadangkan.mjs /data/backup 14
docker cp bumn-tes-app:/data/backup/. /var/backups/bumn-tes/
```
Cron harian di server (`crontab -e`):
```
15 2 * * * docker exec bumn-tes-app node scripts/cadangkan.mjs /data/backup 14 && docker cp bumn-tes-app:/data/backup/. /var/backups/bumn-tes/
```
Salin `/var/backups/bumn-tes` ke luar server secara berkala (rclone/scp). **Cadangan yang hanya ada di server yang sama bukan cadangan.**

Memulihkan (hanya container aplikasi ini yang dihentikan):
```bash
cd /opt/bumn/deploy && docker compose -p bumn-tes --env-file .env stop app
docker cp /var/backups/bumn-tes/bumn-TANGGAL.db bumn-tes-app:/data/app.db
docker exec -u root bumn-tes-app sh -c 'rm -f /data/app.db-wal /data/app.db-shm && chown node:node /data/app.db'
docker compose -p bumn-tes --env-file .env start app
```

## 7. Memperbarui, memantau, dan menghapus
- **Perbarui:** di komputer `git push`; di server `bash /opt/bumn/deploy/update.sh`. Data tidak terhapus (volume terpisah). Kembali ke versi lama: `git checkout <commit-lama>` lalu jalankan skrip itu.
- **Pantau:** `docker logs --tail 100 bumn-tes-app`, `docker stats --no-stream bumn-tes-app`. Arahkan pemantau uptime ke `https://domain-anda/api/health`.
- **Berhenti sementara:** `cd /opt/bumn/deploy && docker compose -p bumn-tes --env-file .env stop`.
- **Hapus aplikasi (data tetap):** `docker compose -p bumn-tes --env-file .env down`. **Jangan** menambah `-v` kecuali Anda yakin ingin menghapus seluruh data user.

### Repo private
Buat kunci khusus di server dan daftarkan sebagai *Deploy key* (read-only) di GitHub (Repo > Settings > Deploy keys, jangan centang write access):
```bash
ssh-keygen -t ed25519 -C "vps-bumn" -f ~/.ssh/bumn_deploy -N ""
cat ~/.ssh/bumn_deploy.pub
printf 'Host github-bumn\n  HostName github.com\n  User git\n  IdentityFile ~/.ssh/bumn_deploy\n  IdentitiesOnly yes\n' >> ~/.ssh/config
git clone git@github-bumn:USERNAME/NAMA-REPO.git /opt/bumn
```

## Catatan keamanan dan batasan
- **Pendaftaran terbuka.** Pembatas: 10 pendaftaran/jam/IP; login dibatasi per IP+username (10/15 mnt), per IP (40/15 mnt), dan per username (30/15 mnt, tanpa melihat IP). Tutup pendaftaran dengan `REGISTRASI=tutup` di `deploy/.env` (master tetap bisa menambah user).
- Pembatas laju ada di memori satu proses dan hilang saat container dimulai ulang. Jalankan **satu container** saja.
- `IP_HEADER` menentukan header IP klien yang dipercaya. Dengan Cloudflare Tunnel pakai `cf-connecting-ip` (tidak bisa dipalsukan klien). Jangan membuka container langsung ke internet dengan `IP_HEADER` selain `none`.
- Master melihat semua hasil dan jawaban user (diberitahukan di halaman masuk). Password di-hash scrypt; sesi 30 hari dan dicabut saat user dinonaktifkan/password diatur ulang; cookie `HttpOnly`, `SameSite=Lax`, `Secure`.
- HTML soal dari server di halaman "Lihat jawaban" dibersihkan DOMPurify; CSP produksi membatasi koneksi ke asal sendiri.
- `npm audit` melaporkan peringatan `postcss` bawaan Next 15 (hanya tahap build CSS, tidak menyentuh input pengguna saat berjalan).
- **Belum diuji:** `docker build`/`docker compose` pada server Anda (Docker tidak terpasang di komputer pengembangan). Langkah di dalam Dockerfile (install, build, buang dependensi dev, jalankan, buat master) sudah diuji di luar Docker.
