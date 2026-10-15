"use client";

// Kartu Rencana menuju tanggal tes: hitung mundur, target harian, kemajuan hari ini, dan kesiapan per subtes.
import { useState, useEffect, useCallback } from "react";
import { Calendar, Target, Download, Trash2, TrendingUp, TrendingDown, Pencil } from "lucide-react";
import { api, tgl } from "./klien";
import { buatIcs, hariWib } from "../lib/rencana.mjs";

export default function Rencana() {
  const [d, setD] = useState(null);
  const [f, setF] = useState({ tesId: "", tanggal: "", menitPerHari: 60 });
  const [ubah, setUbah] = useState(false);
  const [galat, setGalat] = useState("");
  const [sibuk, setSibuk] = useState(false);
  const muat = useCallback(() => api("/api/rencana").then((r) => {
    setD(r);
    if (r.tesPilihan) setF((x) => ({ ...x, tesId: x.tesId || (r.tesPilihan[0] && r.tesPilihan[0].id) || "" }));
  }).catch((e) => setGalat(e.message)), []);
  useEffect(() => { muat(); }, [muat]);

  async function simpan(e) {
    e.preventDefault();
    setGalat(""); setSibuk(true);
    try { await api("/api/rencana", "PUT", { tesId: f.tesId, tanggal: f.tanggal, menitPerHari: Number(f.menitPerHari) }); setUbah(false); await muat(); }
    catch (er) { setGalat(er.message); } finally { setSibuk(false); }
  }
  async function hapus() {
    try { await api("/api/rencana", "DELETE"); setD(null); setUbah(false); await muat(); } catch (er) { setGalat(er.message); }
  }
  function unduhIcs() {
    const ics = buatIcs({ nama: d.rencana.namaTes, tanggal: d.rencana.tanggal, target: d.target });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
    a.download = "pengingat-belajar.ics";
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  if (!d) return galat ? <div className="galat" role="alert">{galat}</div> : null;
  const r = d.rencana;
  const form = (
    <form onSubmit={simpan} className="form baris-form">
      <label>Tes yang dituju
        <select value={f.tesId} onChange={(e) => setF({ ...f, tesId: e.target.value })} required>
          {(d.tesPilihan || [{ id: r && r.tesId, nama: r && r.namaTes }]).map((t) => <option key={t.id} value={t.id}>{t.nama}</option>)}
        </select>
      </label>
      <label>Tanggal tes<input type="date" value={f.tanggal} min={hariWib()} onChange={(e) => setF({ ...f, tanggal: e.target.value })} required /></label>
      <label>Waktu belajar per hari (menit)<input type="number" min={10} max={600} value={f.menitPerHari} onChange={(e) => setF({ ...f, menitPerHari: e.target.value })} required /></label>
      <button className="btn primary" disabled={sibuk}><Calendar size={16} /> {sibuk ? "Menyimpan…" : "Simpan rencana"}</button>
      {galat && <div className="galat" role="alert">{galat}</div>}
    </form>
  );

  if (!r || ubah) {
    return (
      <div className="kartu fade-up" style={{ marginTop: 16 }}>
        <h3 className="kartu-judul"><Calendar size={18} className="ic" /> {r ? "Ubah rencana tes" : "Rencana menuju tanggal tes"}</h3>
        {!r && <p className="muted">Isi tanggal tesmu. Aplikasi menghitung mundur, menentukan target soal harian dari topik yang belum dikuasai, dan menunjukkan kesiapanmu per subtes.</p>}
        {(d.tesPilihan || r) ? form : <p className="empty">Belum ada tes yang punya subtes.</p>}
        {r && <p><button className="btn ghost" onClick={() => setUbah(false)}>Batal</button></p>}
      </div>
    );
  }

  const lewat = r.sisaHari < 0, persen = d.target ? Math.min(100, Math.round((d.hariIni / d.target) * 100)) : 0;
  return (
    <div className="kartu fade-up" style={{ marginTop: 16 }}>
      <h3 className="kartu-judul"><Calendar size={18} className="ic" /> Rencana: {r.namaTes}</h3>
      <p style={{ margin: "0 0 8px" }}>
        <b style={{ fontSize: "1.4rem" }}>{lewat ? "Tanggal tes sudah lewat" : r.sisaHari === 0 ? "Tes hari ini" : r.sisaHari + " hari lagi"}</b>{" "}
        <span className="muted">({tgl(r.tanggal + "T00:00:00").split(",")[0]}) · {r.menitPerHari} menit belajar per hari</span>
      </p>
      {!lewat && (
        <>
          <div className="goal-atas"><b><Target size={16} className="ic" /> Target hari ini</b><span className="muted">{d.hariIni} / {d.target} soal</span></div>
          <div className="bar"><span style={{ width: persen + "%" }}></span></div>
          <p className="muted">{d.hariIni >= d.target ? "Target hari ini tercapai. Pertahankan." : `Masih kurang ${d.target - d.hariIni} soal hari ini.`} {d.topikBelum} topik belum dikuasai. Target dihitung dari perkiraan kasar ±40 soal per topik dan 2 hari terakhir disisakan untuk ulangan.</p>
        </>
      )}
      {d.kesiapan ? (
        <div className="tabel-wrap">
          <table className="data">
            <thead><tr><th>Subtes</th><th>Poin terbaru</th><th>Ambang</th><th>Status</th><th>Tren</th></tr></thead>
            <tbody>
              {d.kesiapan.map((k) => (
                <tr key={k.nama}>
                  <td><b>{k.nama}</b></td><td>{k.poin} / {k.maks}</td><td>{k.ambang}</td>
                  <td><span className={`badge ${k.status === "lolos" ? "pass" : k.status === "jauh" ? "fail" : ""}`}>{k.status === "lolos" ? "Di atas ambang" : k.status === "dekat" ? "Dekat ambang" : "Masih jauh"}</span></td>
                  <td>{k.tren === null ? "—" : k.tren > 0 ? <><TrendingUp size={14} className="ic" /> +{k.tren}</> : k.tren < 0 ? <><TrendingDown size={14} className="ic" /> {k.tren}</> : "stabil"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <p className="muted">Belum ada tryout atau ujian {r.namaTes}. Kerjakan satu kali di <b>Daftar Tes</b> agar kesiapanmu per subtes terlihat.</p>}
      {d.kesiapan && <p className="muted">Berdasarkan {d.jumlahPercobaan} percobaan terakhir. Ini gambaran kesiapan terhadap ambang perkiraan, bukan peluang lulus.</p>}
      <p style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {!lewat && <button className="btn" onClick={unduhIcs}><Download size={15} /> Unduh pengingat harian (.ics)</button>}
        <button className="btn ghost" onClick={() => { setF({ tesId: r.tesId, tanggal: r.tanggal, menitPerHari: r.menitPerHari }); setUbah(true); }}><Pencil size={15} /> Ubah</button>
        <button className="btn ghost" onClick={hapus}><Trash2 size={15} /> Hapus rencana</button>
      </p>
    </div>
  );
}
