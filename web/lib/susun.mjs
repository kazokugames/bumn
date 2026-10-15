// Penyusunan paket soal satu tes. Dipakai browser (ujian biasa) dan server (tryout terjadwal).
import tkd from "../data/bumn-tkd";
import akhlak from "../data/bumn-akhlak";
import english from "../data/bumn-english";
import bidang from "../data/bumn-bidang";
import akpol from "../data/akpol";
import sipss from "../data/sipss";
import wk from "../data/bumn-wk";
import psiko from "../data/polri-psiko";
import tkp from "../data/cpns-tkp";
import GEN from "../data/gen";

export const BANK = { "bumn-tkd": tkd, "bumn-akhlak": akhlak, "bumn-english": english, "bumn-bidang": bidang, "bumn-wk": wk, "polri-psiko": psiko, "cpns-tkp": tkp, akpol, sipss };
// satu tes boleh memakai beberapa bank (bank: ["akpol", "sipss"])
export const bankTes = (tes) => [].concat(tes.bank).reduce((a, b) => a.concat(BANK[b] || []), []);

function shuffle(a) {
  a = a.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
export function shuffleOpts(soal) {
  const idx = shuffle(soal.opts.map((_, i) => i));
  return {
    id: soal.id, topik: soal.topik, q: soal.q, bahas: soal.bahas, level: soal.level,
    opts: idx.map((i) => soal.opts[i]),
    ans: idx.indexOf(soal.ans),
    skor: soal.skor ? idx.map((i) => soal.skor[i]) : null,
    langkah: soal.langkah || null,
    verif: soal.verif || 0, sumber: soal.sumber || null,
  };
}

export function susunSoal(tes) {
  const bank = bankTes(tes);
  let terpilih = [];
  const catatan = [];
  Object.keys(tes.komposisi).forEach((topik) => {
    const butuh = tes.komposisi[topik];
    let pool = bank.filter((s) => s.topik === topik);
    // tes berpenanda `verifikasi`: pakai hanya soal terverifikasi pada topik yang punya soal terverifikasi (TWK)
    if (tes.verifikasi && pool.some((s) => s.verif)) pool = pool.filter((s) => s.verif);
    const ambil = GEN.susun(topik, butuh, pool);
    if (ambil.length < butuh) catatan.push(`${topik}: bank hanya punya ${ambil.length} dari ${butuh} soal`);
    terpilih = terpilih.concat(ambil);
  });
  terpilih.sort((a, b) => (a.level || 1) - (b.level || 1)); // mudah -> sulit
  return { list: terpilih.map(shuffleOpts), catatan };
}
