// Penilaian subtes gaya SKD. Modul murni (tanpa database) supaya bisa dipakai di browser dan server.
// Poin per subtes: poin per subtes (benar = poinBenar, atau skor 1-5 per opsi untuk TKP) dibanding ambang.
// rows = [{ t: topik, a: kunci, j: jawaban|null, s?: skor per opsi }]. Mengembalikan null bila tes tidak punya subtes.
export function hitungSubtes(tes, rows) {
  if (!tes || !tes.subtes) return null;
  return tes.subtes.map((st) => {
    let poin = 0, maks = 0;
    for (const x of rows) {
      if (!st.topik.includes(x.t)) continue;
      if (st.poinBenar) { maks += st.poinBenar; if (x.j !== null && x.j === x.a) poin += st.poinBenar; }
      else { maks += x.s ? Math.max(...x.s) : 0; if (x.j !== null && x.s) poin += x.s[x.j] || 0; }
    }
    return { nama: st.nama, poin, maks, ambang: st.ambang, lolos: poin >= st.ambang };
  });
}
