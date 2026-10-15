"use client";

// Halaman Tryout Terjadwal: daftar tryout, peringkat, dan (untuk master/tutor) buat tryout + kelola kelas.
import { useState, useEffect, useCallback } from "react";
import { Trophy, Play, Eye, Clock, ListChecks, Users, Calendar, ArrowLeft, Plus, UserPlus, Trash2 } from "lucide-react";
import { CONFIG } from "../data/config";
import { api, tgl, durasiTeks } from "./klien";

function FormTryout({ kelas, master, onSimpan }) {
  const [f, setF] = useState({ judul: "", tes: CONFIG.tes[0].id, kelasId: master ? "" : String(kelas[0].id), buka: "", tutup: "", durasiMenit: CONFIG.tes[0].durasiMenit });
  const [galat, setGalat] = useState("");
  const [sibuk, setSibuk] = useState(false);
  const ubah = (k) => (e) => setF({ ...f, [k]: e.target.value });
  async function kirim(e) {
    e.preventDefault();
    setGalat(""); setSibuk(true);
    try {
      await onSimpan({ judul: f.judul, tes: f.tes, kelasId: f.kelasId ? Number(f.kelasId) : null, buka: new Date(f.buka).toISOString(), tutup: new Date(f.tutup).toISOString(), durasiMenit: Number(f.durasiMenit) });
      setF({ ...f, judul: "" });
    } catch (er) { setGalat(er.message); } finally { setSibuk(false); }
  }
  return (
    <form onSubmit={kirim} className="form baris-form">
      <label>Judul<input value={f.judul} onChange={ubah("judul")} required minLength={3} maxLength={80} placeholder="Tryout Akbar 1" /></label>
      <label>Tes
        <select value={f.tes} onChange={(e) => setF({ ...f, tes: e.target.value, durasiMenit: CONFIG.tes.find((t) => t.id === e.target.value).durasiMenit })}>
          {CONFIG.tes.map((t) => <option key={t.id} value={t.id}>{t.kelompok} — {t.nama}</option>)}
        </select>
      </label>
      <label>Peserta
        <select value={f.kelasId} onChange={ubah("kelasId")}>
          {master && <option value="">Semua user</option>}
          {kelas.map((k) => <option key={k.id} value={k.id}>Kelas {k.nama}</option>)}
        </select>
      </label>
      <label>Dibuka<input type="datetime-local" value={f.buka} onChange={ubah("buka")} required /></label>
      <label>Ditutup (batas mulai)<input type="datetime-local" value={f.tutup} onChange={ubah("tutup")} required /></label>
      <label>Durasi (menit)<input type="number" min={1} max={300} value={f.durasiMenit} onChange={ubah("durasiMenit")} required /></label>
      <button className="btn primary" disabled={sibuk}><Plus size={16} /> {sibuk ? "Menyusun soal…" : "Buat tryout"}</button>
      {galat && <div className="galat" role="alert">{galat}</div>}
    </form>
  );
}

function KelolaKelas({ id, master, onKembali }) {
  const [d, setD] = useState(null);
  const [users, setUsers] = useState([]);
  const [pilih, setPilih] = useState({ userId: "", peran: "siswa" });
  const [galat, setGalat] = useState("");
  const muat = useCallback(() => api("/api/kelas/" + id).then(setD).catch((e) => setGalat(e.message)), [id]);
  useEffect(() => {
    muat();
    if (master) api("/api/master/users").then((r) => setUsers(r.users.filter((x) => x.role !== "master"))).catch(() => {});
  }, [muat, master]);
  const ubah = (body) => api("/api/kelas/" + id, "PATCH", body).then(muat).catch((e) => setGalat(e.message));
  if (!d) return <p className="empty">{galat || "Memuat…"}</p>;
  const sudah = new Set(d.anggota.map((a) => a.id));
  return (
    <div className="fade-up">
      <p><button className="btn ghost" onClick={onKembali}><ArrowLeft size={16} /> Kembali</button></p>
      <div className="kartu">
        <h3 className="kartu-judul"><Users size={18} className="ic" /> Kelas {d.kelas.nama}</h3>
        {galat && <div className="galat" role="alert">{galat}</div>}
        {master && (
          <form className="form baris-form" onSubmit={(e) => { e.preventDefault(); setGalat(""); ubah({ userId: Number(pilih.userId), aksi: "tambah", peran: pilih.peran }); setPilih({ ...pilih, userId: "" }); }}>
            <label>User
              <select value={pilih.userId} onChange={(e) => setPilih({ ...pilih, userId: e.target.value })} required>
                <option value="">Pilih user…</option>
                {users.filter((x) => !sudah.has(x.id)).map((x) => <option key={x.id} value={x.id}>{x.nama} (@{x.username})</option>)}
              </select>
            </label>
            <label>Sebagai
              <select value={pilih.peran} onChange={(e) => setPilih({ ...pilih, peran: e.target.value })}>
                <option value="siswa">Siswa</option><option value="tutor">Tutor</option>
              </select>
            </label>
            <button className="btn primary"><UserPlus size={16} /> Tambahkan</button>
          </form>
        )}
        <div className="tabel-wrap">
          <table className="data">
            <thead><tr><th>Nama</th><th>Peran</th>{master && <th></th>}</tr></thead>
            <tbody>
              {d.anggota.map((a) => (
                <tr key={a.id}>
                  <td><b>{a.nama}</b><div className="muted">@{a.username}</div></td>
                  <td><span className={`badge ${a.peran === "tutor" ? "pass" : ""}`}>{a.peran === "tutor" ? "Tutor" : "Siswa"}</span></td>
                  {master && <td><button className="btn" onClick={() => ubah({ userId: a.id, aksi: "hapus" })}><Trash2 size={15} /> Keluarkan</button></td>}
                </tr>
              ))}
              {d.anggota.length === 0 && <tr><td colSpan="3" className="empty">Belum ada anggota.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Peringkat({ id, onKembali, onTinjau }) {
  const [d, setD] = useState(null);
  const [galat, setGalat] = useState("");
  useEffect(() => { api(`/api/tryout/${id}/peringkat`).then(setD).catch((e) => setGalat(e.message)); }, [id]);
  return (
    <div className="fade-up">
      <p><button className="btn ghost" onClick={onKembali}><ArrowLeft size={16} /> Kembali</button></p>
      <div className="kartu">
        <h3 className="kartu-judul"><Trophy size={18} className="ic" /> Peringkat{d ? " — " + d.judul : ""}</h3>
        {galat && <div className="galat" role="alert">{galat}</div>}
        {!d && !galat && <p className="empty">Memuat…</p>}
        {d && (
          <>
            {d.sedangMengerjakan > 0 && <p className="muted">{d.sedangMengerjakan} peserta masih mengerjakan — peringkat bisa berubah.</p>}
            <div className="tabel-wrap">
              <table className="data">
                <thead><tr><th>#</th><th>Nama</th><th>Skor</th><th>Durasi</th><th></th></tr></thead>
                <tbody>
                  {d.peringkat.map((r) => (
                    <tr key={r.urut} style={r.saya ? { fontWeight: 700 } : undefined}>
                      <td>{r.urut}</td>
                      <td>{r.nama}{r.saya ? " (saya)" : ""}<div className="muted">@{r.username}</div></td>
                      <td><b>{r.pct}%</b> <span className="muted">({r.skor}/{r.maks})</span></td>
                      <td>{durasiTeks(r.durasi)}</td>
                      <td>{r.attemptId && <button className="btn" onClick={() => onTinjau(r.attemptId)}><Eye size={15} /> Jawaban</button>}</td>
                    </tr>
                  ))}
                  {d.peringkat.length === 0 && <tr><td colSpan="5" className="empty">Belum ada yang mengumpulkan.</td></tr>}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function Tryout({ user, onMulai, onTinjau }) {
  const master = user.role === "master";
  const [daftar, setDaftar] = useState(null);
  const [kelas, setKelas] = useState([]); // kosong untuk siswa (API menolak)
  const [buka, setBuka] = useState(null); // { peringkat: id } | { kelas: id }
  const [namaKelas, setNamaKelas] = useState("");
  const [pesan, setPesan] = useState("");
  const muat = useCallback(() => {
    api("/api/tryout").then((r) => setDaftar(r.tryout)).catch((e) => setPesan(e.message));
    api("/api/kelas").then((r) => setKelas(r.kelas)).catch(() => setKelas([]));
  }, []);
  useEffect(muat, [muat]);

  if (buka && buka.peringkat) return <Peringkat id={buka.peringkat} onKembali={() => setBuka(null)} onTinjau={onTinjau} />;
  if (buka && buka.kelas) return <KelolaKelas id={buka.kelas} master={master} onKembali={() => { setBuka(null); muat(); }} />;

  const now = Date.now();
  return (
    <>
      {pesan && <div className="galat" role="alert">{pesan}</div>}
      {daftar === null ? <p className="empty">Memuat…</p> : daftar.length === 0 && <div className="kartu"><p className="empty">Belum ada tryout terjadwal untukmu.</p></div>}
      {(daftar || []).map((t) => {
        const belumBuka = now < new Date(t.buka).getTime(), tutup = now > new Date(t.tutup).getTime();
        const selesai = t.saya && t.saya.attemptId;
        return (
          <div className="kartu fade-up" key={t.id} style={{ marginBottom: 14 }}>
            <h3 className="kartu-judul"><Trophy size={18} className="ic" /> {t.judul}</h3>
            <div className="chips">
              <span className="chip">{t.namaTes}</span>
              <span className="chip"><Users size={13} /> {t.kelas ? "Kelas " + t.kelas : "Semua user"}</span>
              <span className="chip"><Clock size={13} /> {t.durasiMenit} menit</span>
              <span className="chip"><ListChecks size={13} /> {t.jumlahSoal} soal</span>
              {t.kelola && <span className="chip">{t.selesai}/{t.peserta} peserta selesai</span>}
            </div>
            <div className="muted" style={{ margin: "8px 0" }}><Calendar size={13} className="ic" /> Mulai antara {tgl(t.buka)} dan {tgl(t.tutup)}</div>
            <div className="actions">
              {selesai ? (
                <>
                  <span className="badge pass">Nilaimu {t.saya.pct}%</span>
                  <button className="btn" onClick={() => onTinjau(t.saya.attemptId)}><Eye size={16} /> Lihat jawaban</button>
                </>
              ) : t.saya ? <button className="btn primary" onClick={() => onMulai(t.id)}><Play size={16} /> Lanjutkan</button>
                : belumBuka ? <span className="badge">Belum dibuka</span>
                : tutup ? <span className="badge fail">Sudah ditutup</span>
                : <button className="btn primary" onClick={() => onMulai(t.id)}><Play size={16} /> Mulai tryout</button>}
              {(selesai || t.kelola) && <button className="btn" onClick={() => setBuka({ peringkat: t.id })}><Trophy size={16} /> Peringkat</button>}
            </div>
          </div>
        );
      })}

      {(master || kelas.length > 0) && (
        <div className="kartu fade-up" style={{ marginTop: 16 }}>
          <h3 className="kartu-judul"><Plus size={18} className="ic" /> Buat tryout terjadwal</h3>
          <p className="muted">Paket soal disusun sekali dan sama untuk semua peserta. Kunci tidak dikirim ke browser; nilai dihitung di server.</p>
          <FormTryout kelas={kelas} master={master} onSimpan={async (b) => { await api("/api/tryout", "POST", b); muat(); }} />
        </div>
      )}
      {(master || kelas.length > 0) && (
        <div className="kartu fade-up" style={{ marginTop: 16 }}>
          <h3 className="kartu-judul"><Users size={18} className="ic" /> Kelas</h3>
          {master && (
            <form className="form baris-form" onSubmit={(e) => { e.preventDefault(); setPesan(""); api("/api/kelas", "POST", { nama: namaKelas }).then(() => { setNamaKelas(""); muat(); }).catch((er) => setPesan(er.message)); }}>
              <label>Nama kelas baru<input value={namaKelas} onChange={(e) => setNamaKelas(e.target.value)} required minLength={2} maxLength={60} placeholder="Akpol 2027 A" /></label>
              <button className="btn primary"><Plus size={16} /> Buat kelas</button>
            </form>
          )}
          <div className="tabel-wrap">
            <table className="data">
              <thead><tr><th>Kelas</th><th>Siswa</th><th>Tutor</th><th></th></tr></thead>
              <tbody>
                {kelas.map((k) => (
                  <tr key={k.id}>
                    <td><b>{k.nama}</b></td><td>{k.siswa}</td><td>{k.tutor || "—"}</td>
                    <td><button className="btn" onClick={() => setBuka({ kelas: k.id })}><Eye size={15} /> {master ? "Kelola anggota" : "Lihat anggota"}</button></td>
                  </tr>
                ))}
                {kelas.length === 0 && <tr><td colSpan="4" className="empty">Belum ada kelas.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
