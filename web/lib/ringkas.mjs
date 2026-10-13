// Ringkasan percobaan untuk satu user: jumlah, rata-rata, terakhir, dan skor rata-rata per topik.
export function ringkas(baris) {
  const topik = {};
  let jumlah = 0;
  baris.forEach((r) => {
    jumlah += r.pct;
    JSON.parse(r.per_topik || "[]").forEach((p) => {
      const d = (topik[p.topik] = topik[p.topik] || { n: 0, pct: 0 });
      d.n++; d.pct += p.pct;
    });
  });
  const perTopik = Object.keys(topik)
    .map((t) => ({ topik: t, pct: Math.round((topik[t].pct / topik[t].n) * 10) / 10, n: topik[t].n }))
    .sort((a, b) => a.pct - b.pct); // terlemah di depan
  return {
    jumlah: baris.length,
    rata: baris.length ? Math.round((jumlah / baris.length) * 10) / 10 : 0,
    terakhir: baris.length ? baris.reduce((a, r) => (r.tanggal > a ? r.tanggal : a), "") : null,
    perTopik,
  };
}
export const kePercobaan = (r) => ({
  id: r.id, tes: r.tes, nama: r.nama, mode: r.mode, skor: r.skor, maks: r.maks, pct: r.pct,
  durasi: r.durasi, tanggal: r.tanggal, perTopik: JSON.parse(r.per_topik || "[]"),
});
