#!/usr/bin/env bash
# Perbarui aplikasi di server dari GitHub lalu bangun ulang container "bumn-tes".
#   bash /opt/bumn/deploy/update.sh
# Hanya menyentuh proyek Docker "bumn-tes". Container/proxy/database lain TIDAK disentuh.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT/deploy"
[ -f .env ] || { echo "Belum ada deploy/.env. Salin dari deploy/.env.example dan isi dulu."; exit 1; }

PROFIL=""; SERVIS="app"
if grep -Eq '^TUNNEL_TOKEN=.+' .env; then PROFIL="--profile tunnel"; SERVIS="app tunnel"; fi
dc() { docker compose -p bumn-tes --env-file .env -f docker-compose.yml "$@"; }

echo "==> Mengambil perubahan terbaru"
(cd "$ROOT" && git pull --ff-only)

echo "==> Membangun dan menjalankan (hanya proyek bumn-tes)"
dc $PROFIL up -d --build $SERVIS

echo "==> Menunggu aplikasi sehat"
for i in $(seq 1 30); do
  s="$(docker inspect --format '{{.State.Health.Status}}' bumn-tes-app 2>/dev/null || echo mulai)"
  [ "$s" = "healthy" ] && { echo "Aplikasi sehat."; exit 0; }
  sleep 2
done
echo "Aplikasi belum sehat. Lihat log: docker logs --tail 50 bumn-tes-app"
exit 1
