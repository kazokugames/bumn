#!/usr/bin/env bash
# Perbarui aplikasi di VPS dari GitHub, lalu mulai ulang. Jalankan sebagai user aplikasi (bukan root):
#   bash /opt/bumn/deploy/update.sh
# Pertama kali (proses belum ada di pm2) skrip ini juga menjalankannya.
set -euo pipefail

REPO_DIR="${REPO_DIR:-/opt/bumn}"
DB_PATH="${DB_PATH:-/var/lib/bumn/app.db}"
PORT="${PORT:-3000}"
NAMA_PM2="${NAMA_PM2:-bumn}"

cd "$REPO_DIR"
echo "==> Mengambil perubahan terbaru"
git pull --ff-only

cd web
echo "==> Memasang dependensi"
npm ci
echo "==> Membangun aplikasi"
npm run build

echo "==> Menjalankan ulang"
if pm2 describe "$NAMA_PM2" >/dev/null 2>&1; then
  pm2 restart "$NAMA_PM2" --update-env
else
  DB_PATH="$DB_PATH" COOKIE_SECURE=1 pm2 start npm --name "$NAMA_PM2" -- start -- -H 127.0.0.1 -p "$PORT"
  pm2 save
fi

sleep 3
echo "==> Cek kesehatan"
curl -fsS "http://127.0.0.1:${PORT}/api/health" && echo
echo "Selesai."
