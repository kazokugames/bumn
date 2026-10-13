# Simulasi Tes Polri & BUMN

Aplikasi simulasi tes (CAT) untuk persiapan seleksi Polri (Akpol, SIPSS, Bintara/Tamtama, TIU, psikotes) dan Rekrutmen Bersama BUMN
(TKD, AKHLAK, Wawasan Kebangsaan, Bahasa Inggris, Tes Bidang). Soal latihan **orisinal** (bukan soal resmi), sebagian tak terhingga lewat generator.
Ada akun user dan akun master yang memantau hasil tryout.

## Isi repo
| Folder/berkas | Fungsi |
|---|---|
| `web/` | **Aplikasi yang dihosting** (Next.js + SQLite). Panduan hosting: `web/DEPLOY.md` |
| `gen.js`, `bank/`, `config.js` | Sumber soal: generator, bank soal, definisi tes |
| `sync.js` | Menyalin sumber soal ke `web/data` (jalankan setelah mengubah soal/config) |
| `check.js` | Validasi bank soal, generator, config, dan sinkron `web/data` |
| `index.html`, `app.js`, `style.css` | Versi vanilla offline (tanpa akun, buka langsung di browser) |
| `deploy/` | `docker-compose.yml`, `.env.example`, dan `update.sh` untuk hosting di VPS |

## Menjalankan di komputer sendiri
Butuh Node.js 22.13 atau lebih baru.
```bash
cd web
npm install
npm run dev                                # http://localhost:3000
npm run buat-master -- master "Nama Anda"  # buat akun master (password diminta di prompt)
```

## Setelah mengubah soal atau config
```bash
node check.js    # validasi (DEEP=1 node check.js untuk sampel generator 10x lebih banyak)
node sync.js     # salin ke web/data, lalu commit hasilnya
```

## Hosting di VPS (via GitHub + Docker, terisolasi)
Lihat **`web/DEPLOY.md`**. Aplikasi berjalan sebagai proyek Docker terpisah (`bumn-tes`) dan tidak menyentuh container, proxy, atau database lain di server.
Ringkasnya: `git clone` ke `/opt/bumn`, salin `deploy/.env.example` ke `deploy/.env`, jalankan `bash deploy/update.sh`, buat master, lalu buka akses lewat Cloudflare Tunnel.
Pembaruan berikutnya: `git push` dari komputer, lalu `bash /opt/bumn/deploy/update.sh` di server.

## Yang tidak boleh masuk repo
Database (`var/`, `*.db`), berkas `.env*`, `node_modules`, dan `.next` sudah diabaikan lewat `.gitignore`. Jangan menaruh password atau kunci di berkas apa pun.
