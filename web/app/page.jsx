"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { CONFIG, PANDUAN } from "../data/config";
import GEN from "../data/gen";
import { BANK, bankTes, shuffleOpts, susunSoal } from "../lib/susun.mjs";
import { api, tgl, durasiTeks, bersih } from "./klien";
import Tryout from "./tryout";
import Belajar from "./belajar";
import Rencana from "./rencana";
import { hitungSubtes } from "../lib/subtes.mjs";
import MATERI from "../data/materi-ipa11";
import PENJELASAN from "../data/materi-penjelasan";
import {
  House, ClipboardList, ShieldCheck, Building2, History, Moon, Sun, Clock, ListChecks, Target, Flame, TrendingUp,
  BookOpen, Play, ChevronLeft, ChevronRight, Flag, Check, X, Trophy, GraduationCap, ChartColumn, Sparkles, Trash2,
  Timer, ArrowRight, ArrowLeft, TriangleAlert, Calendar, Infinity as InfinityIcon, Brain, Library, RotateCcw, CircleCheck, CircleX,
  MessageSquareText, Calculator, Shapes, Layers, BookOpenText, Languages, Landmark, Handshake, Database, Network, Cpu, Receipt, Coins,
  Zap, Users, RefreshCw, HeartHandshake, Globe, Code, Sigma, PenLine, Medal, Award, Rocket,
  LogOut, UserRound, UserPlus, KeyRound, Eye, UserX, UserCheck, Lock,
} from "lucide-react";

const DISCLAIMER =
  "Soal di aplikasi ini adalah soal latihan buatan sendiri yang mengikuti pola dan kisi-kisi seleksi 2021–2026. Ini <b>bukan</b> soal asli resmi. Passing grade, durasi, dan tahapan hanyalah perkiraan. Selalu cek pengumuman resmi tiap periode.";

const IKON_TOPIK = {
  Verbal: MessageSquareText, Numerik: Calculator, Logika: Brain, Figural: Shapes, "Klasifikasi Kata": Layers,
  Reading: BookOpenText, Grammar: PenLine, Vocabulary: Languages, Matematika: Sigma, "Bahasa Indonesia": BookOpenText,
  "Bahasa Inggris": Globe, "Pengetahuan Umum": Landmark, "Wawasan Kebangsaan": ShieldCheck,
  Amanah: Handshake, Kompeten: Medal, Harmonis: HeartHandshake, Loyal: Award, Adaptif: RefreshCw, Kolaboratif: Users,
  Akuntansi: Receipt, Keuangan: Coins, "Pemrograman & Algoritma": Code, "Basis Data": Database,
  "Jaringan & Keamanan": Network, "Sistem Komputer": Cpu, "TIU Verbal": MessageSquareText, "TIU Numerik": Calculator, "TIU Figural": Shapes,
};
function IkonTopik({ t, size = 18 }) {
  const I = IKON_TOPIK[t] || Library;
  return <I size={size} className="ic" aria-hidden="true" />;
}

// ---------- util ----------
const topikLatihan = (S) => (S.topikFilter ? [S.topikFilter] : Object.keys(S.tes.komposisi));
const skorSoal = (soal, j) => (j == null ? 0 : soal.skor ? soal.skor[j] || 0 : j === soal.ans ? 1 : 0);
const skorMaksSoal = (soal) => (soal.skor ? Math.max(...soal.skor) : 1);
const fmt = (s) => {
  const m = Math.floor(s / 60), d = s % 60;
  return (m < 10 ? "0" : "") + m + ":" + (d < 10 ? "0" : "") + d;
};
const huruf = (j) => String.fromCharCode(65 + j);

function agregat(list) {
  const jml = { n: list.length, pct: 0, topik: {}, terakhir: list[list.length - 1] || null, daftar: list };
  list.forEach((r) => {
    jml.pct += r.pct || 0;
    (r.perTopik || []).forEach((p) => {
      const d = (jml.topik[p.topik] = jml.topik[p.topik] || { j: 0, pct: 0 });
      d.j++; d.pct += p.pct;
    });
  });
  jml.rata = jml.n ? Math.round((jml.pct / jml.n) * 10) / 10 : 0;
  jml.topikArr = Object.keys(jml.topik)
    .map((t) => ({ topik: t, pct: Math.round((jml.topik[t].pct / jml.topik[t].j) * 10) / 10 }))
    .sort((a, b) => b.pct - a.pct);
  jml.lemah = jml.topikArr.length ? jml.topikArr[jml.topikArr.length - 1] : null;
  const kunciHari = (t) => `${t.getFullYear()}-${t.getMonth()}-${t.getDate()}`; // tanggal lokal, bukan UTC
  const hari = {};
  list.forEach((r) => { hari[kunciHari(new Date(r.tanggal))] = 1; });
  let streak = 0;
  const d = new Date();
  if (!hari[kunciHari(d)]) d.setDate(d.getDate() - 1);
  while (hari[kunciHari(d)]) { streak++; d.setDate(d.getDate() - 1); }
  jml.streak = streak;
  return jml;
}

// ---------- komponen kecil ----------
// Sisa waktu dihitung dari tenggat (jam dinding), bukan hitungan interval yang bisa melambat di tab latar belakang.
const sisaDetik = (st) => Math.max(0, Math.ceil((st.akhir - Date.now()) / 1000));
function CountUp({ nilai, desimal = 0 }) {
  const [tampil, setTampil] = useState("0");
  useEffect(() => {
    const t0 = performance.now(), durasi = 1100;
    let raf;
    const langkah = (t) => {
      const p = Math.min(1, (t - t0) / durasi);
      setTampil((nilai * (1 - Math.pow(1 - p, 3))).toFixed(desimal));
      if (p < 1) raf = requestAnimationFrame(langkah);
    };
    raf = requestAnimationFrame(langkah);
    return () => cancelAnimationFrame(raf);
  }, [nilai, desimal]);
  return <>{tampil}</>;
}
function Ring({ pct, warna, children }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--pct", 0);
    const raf = requestAnimationFrame(() =>
      requestAnimationFrame(() => el.style.setProperty("--pct", Math.min(100, pct)))
    );
    return () => cancelAnimationFrame(raf);
  }, [pct]);
  return (
    <div className="ring" ref={ref} style={{ "--pct": 0, "--ring-color": warna }}>
      <div>{children}</div>
    </div>
  );
}
function Confetti() {
  useEffect(() => {
    const wadah = document.createElement("div");
    wadah.className = "confetti";
    const warna = ["#6c5ce7", "#9d7bff", "#1fbf83", "#f5a623", "#ef5b6b", "#4d8af0"];
    for (let i = 0; i < 48; i++) {
      const p = document.createElement("i");
      p.style.left = Math.random() * 100 + "%";
      p.style.background = warna[i % warna.length];
      p.style.animationDelay = Math.random() * 0.6 + "s";
      p.style.animationDuration = 2 + Math.random() * 1.5 + "s";
      wadah.appendChild(p);
    }
    document.body.appendChild(wadah);
    const t = setTimeout(() => wadah.remove(), 4500);
    return () => { clearTimeout(t); wadah.remove(); };
  }, []);
  return null;
}
function Grafik({ daftar }) {
  if (daftar.length < 2) return <p className="empty">Grafik tren muncul setelah ada minimal 2 percobaan.</p>;
  const W = 560, H = 140, P = 14;
  const nilai = daftar.map((r) => r.pct);
  const maks = Math.max(100, ...nilai);
  const stepX = (W - P * 2) / (nilai.length - 1);
  const titik = nilai.map((v, i) => [P + i * stepX, H - P - (v / maks) * (H - P * 2)]);
  const garis = titik.map((t, i) => `${i ? "L" : "M"}${t[0].toFixed(1)} ${t[1].toFixed(1)}`).join(" ");
  const area = `${garis} L${W - P} ${H - P} L${P} ${H - P} Z`;
  const [tx, ty] = titik[titik.length - 1];
  const naik = nilai[nilai.length - 1] >= nilai[0];
  const rata = Math.round((nilai.reduce((a, b) => a + b, 0) / nilai.length) * 10) / 10;
  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <div><b style={{ fontSize: "1.6rem" }}>{nilai[nilai.length - 1]}%</b>{" "}
          <span className={`badge ${naik ? "pass" : "fail"}`}>{naik ? "↗ tren naik" : "↘ tren turun"}</span></div>
        <span className="muted">rata-rata {rata}%</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="grafik" role="img" aria-label="Grafik tren skor">
        <defs>
          <linearGradient id="ga" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#6c5ce7" stopOpacity=".28" />
            <stop offset="1" stopColor="#6c5ce7" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#ga)" />
        <path d={garis} fill="none" stroke="var(--brand)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={tx} cy={ty} r="5.5" fill="var(--brand)" stroke="var(--surface)" strokeWidth="2.5" />
      </svg>
    </>
  );
}

function Banner() {
  return (
    <div className="banner" role="note">
      <TriangleAlert size={18} className="ic" aria-hidden="true" />
      <span dangerouslySetInnerHTML={{ __html: DISCLAIMER }} />
    </div>
  );
}
function Stat({ Ikon, kelas = "", nilai, label }) {
  return (
    <div className="kartu stat">
      <div className={`stat-ikon ${kelas}`}><Ikon size={22} aria-hidden="true" /></div>
      <div><b>{nilai}</b><span>{label}</span></div>
    </div>
  );
}
function SetupLatihan({ tes, onMulai, onBatal }) {
  const [topik, setTopik] = useState("");
  return (
    <div className="kartu fade-up" style={{ maxWidth: 560, marginTop: 18 }}>
      <h3 className="kartu-judul"><BookOpen size={18} className="ic" /> Mode Latihan — {tes.nama}</h3>
      <p className="muted">Tanpa batas waktu. Jawaban langsung diperiksa beserta pembahasannya. Pilih topik yang mau dilatih:</p>
      <div className="filter-row">
        <select value={topik} onChange={(e) => setTopik(e.target.value)} aria-label="Topik latihan">
          <option value="">Semua topik</option>
          {Object.keys(tes.komposisi).map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <button className="btn primary" onClick={() => onMulai(topik || null)}><Play size={16} /> Mulai Latihan</button>
        <button className="btn ghost" onClick={onBatal}>Batal</button>
      </div>
    </div>
  );
}

// ---------- akun & server ----------

// Formulir kode aktivasi: memperpanjang masa aktif akun.
function FormKode({ onPakai }) {
  const [kode, setKode] = useState("");
  const [galat, setGalat] = useState("");
  const [sibuk, setSibuk] = useState(false);
  async function kirim(e) {
    e.preventDefault();
    setGalat(""); setSibuk(true);
    try { await onPakai(kode); setKode(""); } catch (er) { setGalat(er.message); } finally { setSibuk(false); }
  }
  return (
    <form onSubmit={kirim} className="form baris-form">
      <label>Kode aktivasi<input value={kode} onChange={(e) => setKode(e.target.value)} autoCapitalize="characters" spellCheck="false" required maxLength={20} placeholder="XXXX-XXXX-XXXX" /></label>
      <button className="btn primary" disabled={sibuk}><KeyRound size={16} /> {sibuk ? "Memeriksa…" : "Pakai kode"}</button>
      {galat && <div className="galat" role="alert">{galat}</div>}
    </form>
  );
}

// Master: buat kode aktivasi dan lihat pemakaiannya.
function KodeMaster({ daftar, onBuat }) {
  const [f, setF] = useState({ jumlah: 10, hari: 90 });
  const [baru, setBaru] = useState([]);
  const [galat, setGalat] = useState("");
  async function kirim(e) {
    e.preventDefault();
    setGalat("");
    try { setBaru(await onBuat({ jumlah: Number(f.jumlah), hari: Number(f.hari) })); } catch (er) { setGalat(er.message); }
  }
  return (
    <div className="kartu fade-up" style={{ marginTop: 16 }}>
      <h3 className="kartu-judul"><KeyRound size={18} className="ic" /> Kode aktivasi <span className="aksi muted">{daftar.filter((k) => !k.pemakai).length} belum dipakai</span></h3>
      <p className="muted">Satu kode = satu kali pakai = menambah masa aktif satu akun. Bagikan ke siswa setelah pembayaran. Akun tanpa kode (akun lama dan master) tidak dibatasi.</p>
      <form onSubmit={kirim} className="form baris-form">
        <label>Jumlah kode<input type="number" min={1} max={200} value={f.jumlah} onChange={(e) => setF({ ...f, jumlah: e.target.value })} required /></label>
        <label>Masa aktif (hari)<input type="number" min={1} max={3650} value={f.hari} onChange={(e) => setF({ ...f, hari: e.target.value })} required /></label>
        <button className="btn primary"><Sparkles size={16} /> Buat kode</button>
        {galat && <div className="galat" role="alert">{galat}</div>}
      </form>
      {baru.length > 0 && (
        <>
          <p className="muted">Kode baru, salin sekarang:</p>
          <textarea readOnly rows={Math.min(8, baru.length)} value={baru.join("\n")} style={{ width: "100%" }} onFocus={(e) => e.target.select()} aria-label="Kode baru" />
        </>
      )}
      {daftar.length > 0 && (
        <div className="tabel-wrap">
          <table className="data">
            <thead><tr><th>Kode</th><th>Masa aktif</th><th>Status</th></tr></thead>
            <tbody>
              {daftar.map((k) => (
                <tr key={k.kode}>
                  <td><code>{k.kode}</code></td><td>{k.hari} hari</td>
                  <td>{k.pemakai ? <>Dipakai {k.pemakai} <span className="muted">(@{k.username}) · {tgl(k.dipakaiPada)}</span></> : <span className="badge pass">Belum dipakai</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function AuthScreen({ onMasuk, temaGelap, ubahTema, info }) {
  const [mode, setMode] = useState("masuk");
  const [f, setF] = useState({ username: "", nama: "", password: "", kode: "" });
  const [galat, setGalat] = useState("");
  const [sibuk, setSibuk] = useState(false);
  const ubah = (k) => (e) => setF({ ...f, [k]: e.target.value });
  async function kirim(e) {
    e.preventDefault();
    setGalat(""); setSibuk(true);
    try {
      const r = await api(mode === "masuk" ? "/api/auth/login" : "/api/auth/register", "POST", f);
      onMasuk(r.user);
    } catch (er) { setGalat(er.message); } finally { setSibuk(false); }
  }
  return (
    <div className="auth">
      <section className="auth-info">
        <div className="logo"><div className="logo-ikon"><GraduationCap size={22} aria-hidden="true" /></div><div>{info.nama}<small>CPNS · POLRI · BUMN</small></div></div>
        <h1>Latihan seleksi dengan timer, pembahasan, dan pemantauan.</h1>
        <ul>
          <li><CircleCheck size={18} className="ic" /> Miliaran variasi soal hitungan, logika, dan kecermatan untuk SKD CPNS, Polri, dan BUMN</li>
          <li><CircleCheck size={18} className="ic" /> Riwayat dan analisis topik terlemah tersimpan di akunmu</li>
          <li><CircleCheck size={18} className="ic" /> Hasil tryout dapat dilihat oleh master (pengelola) untuk pendampingan</li>
        </ul>
      </section>
      <section className="auth-form">
        <button className="tombol-tema auth-tema" onClick={ubahTema} aria-label="Ganti tema">{temaGelap ? <Sun size={18} /> : <Moon size={18} />}</button>
        <div className="tabs" role="tablist">
          <button role="tab" aria-selected={mode === "masuk"} className={mode === "masuk" ? "aktif" : ""} onClick={() => { setMode("masuk"); setGalat(""); }}>Masuk</button>
          {info.registrasi !== "tutup" && <button role="tab" aria-selected={mode === "daftar"} className={mode === "daftar" ? "aktif" : ""} onClick={() => { setMode("daftar"); setGalat(""); }}>Daftar</button>}
        </div>
        <h2>{mode === "masuk" ? "Selamat datang kembali" : "Buat akun baru"}</h2>
        <form onSubmit={kirim} className="form">
          <label>Username
            <input value={f.username} onChange={ubah("username")} autoComplete="username" autoCapitalize="none" spellCheck="false" required minLength={3} maxLength={30} />
          </label>
          {mode === "daftar" && (
            <label>Nama lengkap
              <input value={f.nama} onChange={ubah("nama")} autoComplete="name" required maxLength={60} />
            </label>
          )}
          <label>Password
            <input type="password" value={f.password} onChange={ubah("password")} autoComplete={mode === "masuk" ? "current-password" : "new-password"} required minLength={mode === "daftar" ? 8 : 1} maxLength={100} />
          </label>
          {mode === "daftar" && (
            <label>Kode aktivasi{info.registrasi === "kode" ? "" : " (jika punya)"}
              <input value={f.kode} onChange={ubah("kode")} autoCapitalize="characters" spellCheck="false" required={info.registrasi === "kode"} maxLength={20} placeholder="XXXX-XXXX-XXXX" />
            </label>
          )}
          {mode === "daftar" && <p className="muted">Username 3–30 karakter (huruf, angka, titik, strip, garis bawah). Password minimal 8 karakter.</p>}
          {galat && <div className="galat" role="alert">{galat}</div>}
          <button className="btn primary besar" disabled={sibuk}>{sibuk ? "Memproses…" : mode === "masuk" ? "Masuk" : "Daftar & masuk"}</button>
        </form>
        <details className="muted" style={{ marginTop: 16 }}>
          <summary>Kebijakan privasi</summary>
          <p>Data yang disimpan: nama, username, serta hasil dan jawaban tryout. Hanya pengelola (master) dan tutor kelasmu yang dapat melihat hasilmu. Data tidak dijual atau dibagikan ke pihak lain. Hubungi pengelola untuk meminta penghapusan datamu. Pengguna di bawah 17 tahun sebaiknya mendaftar dengan sepengetahuan orang tua atau wali.</p>
        </details>
      </section>
    </div>
  );
}

function FormUser({ onSimpan }) {
  const [f, setF] = useState({ username: "", nama: "", password: "" });
  const [galat, setGalat] = useState("");
  const [sibuk, setSibuk] = useState(false);
  const ubah = (k) => (e) => setF({ ...f, [k]: e.target.value });
  async function kirim(e) {
    e.preventDefault();
    setGalat(""); setSibuk(true);
    try { await onSimpan(f); setF({ username: "", nama: "", password: "" }); } catch (er) { setGalat(er.message); } finally { setSibuk(false); }
  }
  return (
    <form onSubmit={kirim} className="form baris-form">
      <label>Username<input value={f.username} onChange={ubah("username")} autoCapitalize="none" required minLength={3} maxLength={30} /></label>
      <label>Nama lengkap<input value={f.nama} onChange={ubah("nama")} required maxLength={60} /></label>
      <label>Password awal<input type="password" value={f.password} onChange={ubah("password")} autoComplete="new-password" required minLength={8} maxLength={100} /></label>
      <button className="btn primary" disabled={sibuk}><UserPlus size={16} /> {sibuk ? "Menyimpan…" : "Tambah user"}</button>
      {galat && <div className="galat" role="alert">{galat}</div>}
    </form>
  );
}

function FormPassword({ onSimpan }) {
  const [pw, setPw] = useState("");
  const [galat, setGalat] = useState("");
  const [sibuk, setSibuk] = useState(false);
  async function kirim(e) {
    e.preventDefault();
    setGalat(""); setSibuk(true);
    try { await onSimpan(pw); setPw(""); } catch (er) { setGalat(er.message); } finally { setSibuk(false); }
  }
  return (
    <form onSubmit={kirim} className="form baris-form">
      <label>Password baru<input type="password" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="new-password" required minLength={8} maxLength={100} /></label>
      <button className="btn" disabled={sibuk}><KeyRound size={16} /> Atur ulang password</button>
      {galat && <div className="galat" role="alert">{galat}</div>}
    </form>
  );
}

// Ringkasan subtes (TWK/TIU/TKP): poin dibanding ambang, lulus hanya bila semua subtes lolos.
function Subtes({ daftar }) {
  const lulus = daftar.every((x) => x.lolos);
  return (
    <div className="kartu" style={{ marginTop: 14 }}>
      <h3 className="kartu-judul"><Target size={18} className="ic" /> Ambang batas per subtes</h3>
      <table className="skor"><tbody>
        <tr><th>Subtes</th><th>Poin</th><th>Ambang</th><th></th></tr>
        {daftar.map((x) => (
          <tr key={x.nama}><td>{x.nama}</td><td><b>{x.poin}</b> / {x.maks}</td><td>{x.ambang}</td>
            <td><span className={`badge ${x.lolos ? "pass" : "fail"}`}>{x.lolos ? "Lolos" : "Belum lolos"}</span></td></tr>
        ))}
      </tbody></table>
      <p className="muted">{lulus ? "Semua subtes mencapai ambang." : "Lulus hanya jika SEMUA subtes mencapai ambang, walau total poin tinggi."} Angka ambang adalah perkiraan; cek pengumuman resmi tiap periode.</p>
    </div>
  );
}

// Tinjau jawaban satu percobaan (dipakai user untuk miliknya dan master untuk semua user).
function ReviewPanel({ data, onKembali }) {
  const [salahSaja, setSalahSaja] = useState(false);
  const { percobaan: pc, detail, pemilik } = data;
  const benarN = detail.filter((x) => x.j !== null && x.j === x.a).length;
  const subtes = hitungSubtes(CONFIG.tes.find((t) => t.id === pc.tes), detail);
  return (
    <div className="fade-up">
      <p><button className="btn ghost" onClick={onKembali}><ArrowLeft size={16} /> Kembali</button></p>
      <div className="kartu">
        <h3 className="kartu-judul"><ListChecks size={18} className="ic" /> {pc.nama}</h3>
        <div className="muted">{pemilik.nama} (@{pemilik.username}) · {tgl(pc.tanggal)} · durasi {durasiTeks(pc.durasi)}</div>
        <div className="hasil-chips">
          <span className="badge pass">Skor {pc.pct}% ({pc.skor}/{pc.maks})</span>
          <span className="chip"><CircleCheck size={13} /> {benarN} benar dari {detail.length} soal</span>
        </div>
      </div>
      {subtes && <Subtes daftar={subtes} />}
      <div className="kartu" style={{ marginTop: 14 }}>
        <div className="filter-row">
          <label><input type="checkbox" checked={salahSaja} onChange={(e) => setSalahSaja(e.target.checked)} /> Tampilkan yang salah saja</label>
        </div>
        {detail.map((x, i) => {
          const benar = x.j !== null && x.j === x.a;
          if (salahSaja && benar) return null;
          return (
            <div className="review-item" key={i}>
              <div className="q-topik">{i + 1}. {x.t}</div>
              <div className="q-text" dangerouslySetInnerHTML={{ __html: bersih(x.q) }} />
              <div className="opts-r">
                {x.o.map((o, k) => (
                  <div key={k} className={`opt-r${k === x.a ? " kunci" : ""}${k === x.j ? (k === x.a ? " pilih-benar" : " pilih-salah") : ""}`}>
                    <span className="opt-letter">{huruf(k)}</span>
                    <span className="isi" dangerouslySetInnerHTML={{ __html: bersih(o) }} />
                    {k === x.a && <span className="tag ok">kunci</span>}
                    {k === x.j && k !== x.a && <span className="tag no">jawaban user</span>}
                    {k === x.j && k === x.a && <span className="tag ok">dipilih</span>}
                  </div>
                ))}
              </div>
              {x.j === null && <p className="muted">Tidak dijawab.</p>}
              {x.s && x.j !== null && <p className="muted">Nilai opsi yang dipilih: {x.s[x.j]}/{Math.max(...x.s)}</p>}
              <div className="bahas" dangerouslySetInnerHTML={{ __html: bersih(x.b) }} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------- aplikasi ----------
const MENU = [
  { id: "dashboard", Ikon: House, teks: "Dashboard", pendek: "Beranda" },
  { id: "belajar", Ikon: Brain, teks: "Belajar dari Nol", pendek: "Belajar" },
  { id: "tes", Ikon: ClipboardList, teks: "Daftar Tes", pendek: "Tes" },
  { id: "tryout", Ikon: Trophy, teks: "Tryout Terjadwal", pendek: "Tryout" },
  { id: "materi", Ikon: BookOpen, teks: "Materi", pendek: "Materi" },
  { id: "panduan-polri", Ikon: ShieldCheck, teks: "Panduan Polri", pendek: "Polri" },
  { id: "panduan-bumn", Ikon: Building2, teks: "Panduan BUMN", pendek: "BUMN" },
  { id: "riwayat", Ikon: History, teks: "Riwayat", pendek: "Riwayat" },
];
const MENU_MASTER = { id: "master", Ikon: Users, teks: "Pantau User", pendek: "User" };

export default function App() {
  const [halaman, setHalaman] = useState("dashboard");
  const [temaGelap, setTemaGelap] = useState(false);
  const [user, setUser] = useState(undefined); // undefined = memeriksa sesi, null = belum masuk
  const [info, setInfo] = useState({ nama: "Simulasi Tes", warna: null, registrasi: "buka" }); // identitas pemasangan
  const [kodeList, setKodeList] = useState([]);
  const [belajarAwal, setBelajarAwal] = useState(null); // pintasan ke Belajar: { jenis, topik?, k }
  const [ulangJatuhTempo, setUlangJatuhTempo] = useState(0);
  const [riwayat, setRiwayat] = useState([]);
  const [masterUsers, setMasterUsers] = useState(null);
  const [masterDetail, setMasterDetail] = useState(null);
  const [tinjau, setTinjau] = useState(null); // {percobaan, detail, pemilik}
  const [kembaliKe, setKembaliKe] = useState("riwayat");
  const [cari, setCari] = useState("");
  const [pesan, setPesan] = useState("");
  const payloadRef = useRef(null);
  const [S, setS] = useState(null); // state ujian/latihan
  const [hasil, setHasil] = useState(null);
  const [latihanTes, setLatihanTes] = useState(null); // setup latihan
  const [salahSaja, setSalahSaja] = useState(false);
  const [filterKel, setFilterKel] = useState("Semua");
  const [konfirm, setKonfirm] = useState(null); // {pesan, aksi}
  const [materiMapel, setMateriMapel] = useState(null); // id mapel terpilih
  const [materiBab, setMateriBab] = useState(null); // id bab terpilih
  const timerRef = useRef(null);
  const kirimRef = useRef(false); // tryout sedang dikirim: cegah kirim ganda dari auto-submit

  function mintaKonfirmasi(pesan, aksi) { setKonfirm({ pesan, aksi }); }

  // init tema + riwayat (client only)
  useEffect(() => {
    setTemaGelap(document.documentElement.dataset.tema === "gelap"); // sudah dipasang skrip di layout
    api("/api/auth/me").then((r) => setUser(r.user)).catch(() => setUser(null));
    api("/api/info").then((r) => {
      setInfo(r);
      document.title = r.nama;
      if (r.warna) document.documentElement.style.setProperty("--brand", r.warna);
    }).catch(() => {});
  }, []);
  // muat riwayat milik user setelah masuk
  const userId = user ? user.id : null;
  useEffect(() => {
    if (userId) api("/api/attempts").then((r) => setRiwayat(r.percobaan)).catch(() => {});
  }, [userId]);
  useEffect(() => {
    if (userId && halaman === "dashboard") api("/api/belajar").then((r) => setUlangJatuhTempo(r.jatuhTempo || 0)).catch(() => {});
  }, [userId, halaman]);
  const jadiMaster = !!user && user.role === "master";
  useEffect(() => {
    if (jadiMaster && halaman === "master") {
      api("/api/master/users").then((r) => setMasterUsers(r.users)).catch((e) => setPesan(e.message));
      api("/api/master/kode").then((r) => setKodeList(r.kode)).catch(() => {});
    }
  }, [jadiMaster, halaman]);
  function setelahMasuk(u) {
    setUser(u); setHalaman("dashboard"); setS(null); setHasil(null);
    api("/api/auth/me").then((r) => r.user && setUser(r.user)).catch(() => {}); // data lengkap (mis. status tutor)
  }
  const sisaHari = user && user.aktifSampai ? Math.ceil((new Date(user.aktifSampai) - Date.now()) / 86400000) : null;
  const kadaluarsa = !!user && user.role !== "master" && sisaHari !== null && sisaHari <= 0;
  async function pakaiKode(kode) {
    const r = await api("/api/kode/pakai", "POST", { kode });
    setUser((u) => ({ ...u, aktifSampai: r.aktifSampai }));
    setPesan("Kode berhasil dipakai. Masa aktif sampai " + tgl(r.aktifSampai) + ".");
  }
  async function buatKode(f) {
    const r = await api("/api/master/kode", "POST", f);
    api("/api/master/kode").then((x) => setKodeList(x.kode)).catch(() => {});
    return r.kode;
  }
  const TERKUNCI = "Masa aktif akunmu habis. Masukkan kode aktivasi di bagian atas halaman untuk lanjut berlatih.";
  async function keluar() {
    try { await api("/api/auth/logout", "POST", {}); } catch {}
    setUser(null); setRiwayat([]); setS(null); setHasil(null); setMasterUsers(null); setMasterDetail(null); setTinjau(null); setHalaman("dashboard");
  }
  function ubahTema() {
    const g = !temaGelap;
    setTemaGelap(g);
    document.documentElement.dataset.tema = g ? "gelap" : "terang";
    try { localStorage.setItem("tema", g ? "gelap" : "terang"); } catch {}
  }

  // timer mundur (hanya aktif selama ujian berjalan)
  const ujianAktif = !!(S && S.mode === "ujian" && !S.selesai);
  useEffect(() => {
    if (!ujianAktif) return;
    const tick = () => {
      setS((prev) => {
        if (!prev || prev.selesai) return prev;
        const sisa = sisaDetik(prev);
        if (sisa <= 0) {
          clearInterval(timerRef.current);
          return { ...prev, sisa: 0, selesai: true };
        }
        return sisa === prev.sisa ? prev : { ...prev, sisa };
      });
    };
    timerRef.current = setInterval(tick, 500);
    document.addEventListener("visibilitychange", tick); // segera sinkron saat tab dibuka kembali
    return () => { clearInterval(timerRef.current); document.removeEventListener("visibilitychange", tick); };
  }, [ujianAktif]);

  // cegah menutup/memuat ulang tab saat ujian berjalan
  const ujianBelumSelesai = ujianAktif && !hasil;
  useEffect(() => {
    if (!ujianBelumSelesai) return;
    const f = (e) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", f);
    return () => window.removeEventListener("beforeunload", f);
  }, [ujianBelumSelesai]);

  // auto-submit saat waktu habis
  useEffect(() => {
    if (S && S.mode === "ujian" && S.selesai && !hasil) finish(true);
  });

  // tryout terjadwal: simpan jawaban ke server tiap ada perubahan (ditunda 1,5 detik)
  const tryoutId = S && S.tryoutId && !S.selesai ? S.tryoutId : null;
  const jawabTryout = tryoutId ? S.jawab : null;
  useEffect(() => {
    if (!jawabTryout) return;
    const t = setTimeout(() => api(`/api/tryout/${tryoutId}/jawab`, "POST", { jawab: jawabTryout }).catch(() => {}), 1500);
    return () => clearTimeout(t);
  }, [jawabTryout, tryoutId]);

  function gantiHalaman(nama) {
    const lanjut = () => { setS(null); setHasil(null); setHalaman(nama); setLatihanTes(null); };
    if (S && S.mode === "ujian" && !S.selesai && !hasil) {
      mintaKonfirmasi(S.tryoutId ? "Tryout sedang berjalan dan waktunya tetap berjalan di server. Yakin keluar? Kamu bisa melanjutkan selama waktu belum habis." : "Ujian sedang berjalan. Yakin keluar? Progres tidak tersimpan.", lanjut);
      return;
    }
    lanjut();
  }

  function startUjian(tesId) {
    if (kadaluarsa) return setPesan(TERKUNCI);
    const tes = CONFIG.tes.find((t) => t.id === tesId);
    const { list, catatan } = susunSoal(tes);
    setHasil(null);
    setS({
      tes, mode: "ujian", soal: list, catatan,
      jawab: new Array(list.length).fill(null),
      ragu: new Array(list.length).fill(false),
      cur: 0, sisa: tes.durasiMenit * 60, akhir: Date.now() + tes.durasiMenit * 60 * 1000, selesai: false,
    });
  }
  function startLatihan(tesId, topik) {
    if (kadaluarsa) return setPesan(TERKUNCI);
    const tes = CONFIG.tes.find((t) => t.id === tesId);
    const bank = bankTes(tes);
    const ts = Object.keys(tes.komposisi); // bank bisa dipakai beberapa tes (mis. Tes Bidang)
    let pool = bank.filter((s) => (topik ? s.topik === topik : ts.includes(s.topik)));
    pool = pool.slice().sort((a, b) => (a.level || 1) - (b.level || 1));
    setHasil(null);
    setS({
      tes, mode: "latihan", soal: pool.map(shuffleOpts),
      jawab: [], ragu: [], cur: 0, sisa: null, selesai: false,
      topikFilter: topik || "", revealed: {},
      lvBerjalan: 1, streakB: 0, streakS: 0, // latihan adaptif
    });
  }

  function hitungSemua() {
    const perTopik = {};
    let total = 0, maks = 0;
    S.soal.forEach((soal, i) => {
      const j = S.jawab[i];
      const d = (perTopik[soal.topik] = perTopik[soal.topik] || { skor: 0, maks: 0 });
      const s = skorSoal(soal, j);
      d.skor += s; d.maks += skorMaksSoal(soal);
      total += s; maks += skorMaksSoal(soal);
    });
    return { perTopik, total, maks, pct: maks ? Math.round((total / maks) * 1000) / 10 : 0 };
  }
  async function simpanKeServer() {
    setHasil((x) => x && { ...x, simpan: "proses" });
    try {
      await api("/api/attempts", "POST", payloadRef.current);
      setHasil((x) => x && { ...x, simpan: "ok" });
      api("/api/attempts").then((r) => setRiwayat(r.percobaan)).catch(() => {});
    } catch (e) {
      setHasil((x) => x && { ...x, simpan: "gagal", pesan: e.message });
    }
  }
  // Tryout terjadwal: soal dari server (tanpa kunci), tenggat mengikuti jam server.
  async function startTryout(id) {
    if (kadaluarsa) return setPesan(TERKUNCI);
    try {
      const r = await api(`/api/tryout/${id}/mulai`, "POST", {});
      if (r.selesai) return bukaTinjau(r.attemptId, "tryout");
      const sisaMs = r.tenggatMs - r.sekarangMs;
      kirimRef.current = false;
      setHasil(null);
      setS({
        tes: { id: r.tes, nama: r.judul, durasiMenit: r.durasiMenit }, mode: "ujian", soal: r.soal, catatan: [], tryoutId: id,
        jawab: r.jawab, ragu: new Array(r.soal.length).fill(false),
        cur: 0, sisa: Math.ceil(sisaMs / 1000), akhir: Date.now() + sisaMs, selesai: false,
      });
    } catch (e) { setPesan(e.message); }
  }
  async function kirimTryout() {
    if (kirimRef.current) return;
    kirimRef.current = true;
    clearInterval(timerRef.current);
    try {
      const r = await api(`/api/tryout/${S.tryoutId}/selesai`, "POST", { jawab: S.jawab });
      setS(null); setHalaman("tryout");
      await bukaTinjau(r.id, "tryout");
      setPesan(r.telat ? "Waktu sudah habis: yang dinilai adalah jawaban tersimpan terakhir." : "Tryout terkumpul. Lihat posisimu di menu Tryout Terjadwal → Peringkat.");
      api("/api/attempts").then((x) => setRiwayat(x.percobaan)).catch(() => {});
    } catch (e) {
      // kirimRef tetap true supaya auto-submit tidak mengulang terus; kirim ulang hanya atas perintah user
      mintaKonfirmasi(`Jawaban belum terkirim (${e.message}).\nJawaban terakhirmu sudah tersimpan otomatis di server. Kirim lagi?`, () => { kirimRef.current = false; kirimTryout(); });
    }
  }
  function finish(otomatis) {
    if (S.tryoutId) { if (!otomatis) kirimRef.current = false; return kirimTryout(); }
    const h = hitungSemua();
    clearInterval(timerRef.current);
    const durasiPakai = Math.min(S.tes.durasiMenit * 60, S.tes.durasiMenit * 60 - sisaDetik(S));
    payloadRef.current = {
      tes: S.tes.id, durasi: durasiPakai,
      detail: S.soal.map((soal, i) => ({ t: soal.topik, q: soal.q, o: soal.opts, a: soal.ans, j: S.jawab[i], s: soal.skor || undefined, b: soal.bahas })),
    };
    setHasil({ h, otomatis, simpan: "proses" });
    simpanKeServer();
  }

  // ---------- navigasi data master / tinjau ----------
  async function bukaUser(id) {
    try {
      setMasterDetail(await api("/api/master/users/" + id));
      setHalaman("master-user"); setPesan("");
    } catch (e) { setPesan(e.message); }
  }
  async function bukaTinjau(id, kembali) {
    try {
      setTinjau(await api("/api/attempts/" + id));
      setKembaliKe(kembali); setHalaman("tinjau"); setPesan("");
    } catch (e) { setPesan(e.message); }
  }
  async function ubahUser(id, body) {
    await api("/api/master/users/" + id, "PATCH", body);
    setPesan(body.password !== undefined ? "Password diatur ulang. Semua sesi user tersebut dikeluarkan." : body.aktif ? "Akun diaktifkan." : "Akun dinonaktifkan.");
    if (body.aktif !== undefined) await bukaUser(id);
  }
  async function tambahUser(f) {
    await api("/api/master/users", "POST", f);
    setPesan(`Akun "${f.username}" dibuat.`);
    setMasterUsers((await api("/api/master/users")).users);
  }

  const salam = useMemo(() => {
    const j = new Date().getHours();
    return j < 11 ? "Selamat pagi, semangat belajar!" : j < 15 ? "Selamat siang, tetap fokus!" : j < 19 ? "Selamat sore, waktunya latihan!" : "Selamat malam, jangan lupa istirahat!";
  }, []);

  // ---------- kerangka ----------
  const menuAktif = jadiMaster ? MENU.concat(MENU_MASTER) : MENU;
  function kerangka(aktif, judul, sub, isi) {
    return (
      <div className="layout">
        <aside className="sidebar">
          <div className="logo">
            <div className="logo-ikon"><GraduationCap size={22} aria-hidden="true" /></div>
            <div>{info.nama}<small>CPNS · POLRI · BUMN</small></div>
          </div>
          <div className="menu-label">Menu</div>
          {menuAktif.map((m) => (
            <button key={m.id} className={`menu-item${m.id === aktif ? " aktif" : ""}`} onClick={() => gantiHalaman(m.id)} aria-current={m.id === aktif ? "page" : undefined}>
              <m.Ikon size={19} className="ic" aria-hidden="true" /><span>{m.teks}</span>
            </button>
          ))}
          <div className="sidebar-foot">
            <div className="akun"><UserRound size={16} className="ic" /> <div><b>{user.nama}</b><span>{jadiMaster ? "Master" : "@" + user.username}{user.aktifSampai && !jadiMaster ? " · aktif s/d " + new Date(user.aktifSampai).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : ""}</span></div></div>
            <button className="btn ghost besar" onClick={keluar}><LogOut size={16} /> Keluar</button>
          </div>
        </aside>
        <main className="konten">
          <div className="topbar">
            <div><h2>{judul}</h2><div className="salam">{sub}</div></div>
            <div className="spacer"></div>
            <div className="pill-info"><InfinityIcon size={15} className="ic" aria-hidden="true" /> {CONFIG.tes.length} tes · miliaran variasi soal</div>
            <button className="tombol-tema" onClick={ubahTema} title="Ganti tema" aria-label="Ganti tema">{temaGelap ? <Sun size={18} /> : <Moon size={18} />}</button>
            <button className="tombol-tema tombol-keluar" onClick={keluar} title="Keluar" aria-label="Keluar"><LogOut size={18} /></button>
          </div>
          {pesan && <div className="info-pesan" role="status">{pesan} <button className="aksi" onClick={() => setPesan("")} aria-label="Tutup"><X size={14} /></button></div>}
          {user.aktifSampai && user.role !== "master" && (kadaluarsa || sisaHari <= 7) && (
            <div className="kartu" role={kadaluarsa ? "alert" : "status"} style={{ marginBottom: 14 }}>
              <h3 className="kartu-judul"><Lock size={18} className="ic" /> {kadaluarsa ? "Masa aktif akunmu sudah habis" : `Masa aktif tersisa ${sisaHari} hari`}</h3>
              <p className="muted">{kadaluarsa ? "Riwayat dan hasilmu tetap bisa dilihat. Masukkan kode aktivasi dari bimbelmu untuk lanjut berlatih." : `Berakhir ${tgl(user.aktifSampai)}. Kode baru menambah masa aktif dari sisa waktu yang ada.`}</p>
              <FormKode onPakai={pakaiKode} />
            </div>
          )}
          {isi}
        </main>
        <nav className="bottomnav" aria-label="Menu utama">
          {menuAktif.map((m) => (
            <button key={m.id} className={m.id === aktif ? "aktif" : ""} onClick={() => gantiHalaman(m.id)}>
              <m.Ikon size={20} aria-hidden="true" /><span>{m.pendek || m.teks}</span>
            </button>
          ))}
        </nav>
      </div>
    );
  }

  // ---------- dashboard ----------
  function renderDashboard() {
    const agg = agregat(riwayat);
    const lvl = agg.rata >= 80 ? "Mahir" : agg.rata >= 60 ? "Berkembang" : agg.rata > 0 ? "Pemula" : "—";
    const totalSoal = Object.values(BANK).reduce((a, b) => a + b.length, 0);
    const lemah3 = agg.topikArr.slice(-3).reverse();
    return kerangka(
      "dashboard", "Dashboard", salam,
      <>
        <section className="hero fade-up">
          <span className="hero-chip"><Flame size={14} className="ic" /> {agg.streak > 0 ? `${agg.streak} hari beruntun` : "Mulai streak belajarmu hari ini"}</span>
          <h3>{agg.n ? "Lanjutkan latihanmu, tetap konsisten." : "Siap berlatih untuk seleksi Polri & BUMN?"}</h3>
          <p>{agg.lemah ? `Topik yang perlu diperkuat: ${agg.lemah.topik} (${agg.lemah.pct}%). Latih per topik lalu uji dengan ujian bertimer.` : "Kerjakan ujian bertimer seperti CAT asli atau latihan per topik dengan pembahasan langsung."}</p>
          <div className="hero-aksi">
            <button className="btn putih" onClick={() => gantiHalaman("tes")}><Play size={16} /> Mulai latihan</button>
            <button className="btn kaca" onClick={() => gantiHalaman("panduan-bumn")}><BookOpen size={16} /> Baca panduan</button>
          </div>
        </section>
        <Banner />
        {user.role !== "master" && ulangJatuhTempo > 0 && (
          <div className="kartu fade-up" style={{ marginTop: 16 }}>
            <h3 className="kartu-judul"><RotateCcw size={18} className="ic" /> Buku salah: {ulangJatuhTempo} soal jatuh tempo hari ini</h3>
            <p className="muted">Soal yang dulu kamu salahkan muncul lagi sekarang. Mengerjakan ulang soal salah menaikkan nilai lebih cepat daripada soal baru.</p>
            <button className="btn primary" onClick={() => { setBelajarAwal({ jenis: "ulang", k: Date.now() }); gantiHalaman("belajar"); }}><Play size={16} /> Kerjakan ulangan</button>
          </div>
        )}
        {user.role !== "master" && <Rencana />}
        <div className="baris-stat fade-up d1">
          <Stat Ikon={ClipboardList} nilai={<CountUp nilai={agg.n} />} label="Total percobaan" />
          <Stat Ikon={Target} kelas="biru" nilai={<><CountUp nilai={agg.rata} desimal={1} />%</>} label="Skor rata-rata" />
          <Stat Ikon={ChartColumn} kelas="hijau" nilai={<CountUp nilai={agg.topikArr.length} />} label="Topik terlacak" />
          <Stat Ikon={Library} kelas="kuning" nilai={<CountUp nilai={totalSoal} />} label="Soal tertulis di bank (+ miliaran variasi dari generator)" />
        </div>
        <div className="grid-utama">
          <div className="kartu fade-up d2">
            <h3 className="kartu-judul"><TrendingUp size={18} className="ic" /> Progres belajar <button className="aksi" onClick={() => gantiHalaman("riwayat")}>Lihat riwayat <ArrowRight size={14} /></button></h3>
            <div className="ring-wrap">
              <Ring pct={agg.rata} warna="var(--brand)">
                <div className="big"><CountUp nilai={agg.rata} desimal={1} />%</div>
                <div className="kecil">{lvl}</div>
              </Ring>
              <div className="topik-list">
                {agg.topikArr.length ? agg.topikArr.slice(0, 5).map((t) => (
                  <div className="topik-row" key={t.topik}>
                    <span className="topik-ikon"><IkonTopik t={t.topik} size={17} /></span>
                    <span className="topik-nama">{t.topik}</span>
                    <span className="bar"><span style={{ width: Math.min(100, t.pct) + "%" }}></span></span>
                    <span className="topik-pct">{t.pct}%</span>
                  </div>
                )) : <p className="empty">Belum ada percobaan.<br />Selesaikan tes pertama untuk melihat progres per topik.</p>}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="kartu streak fade-up d3">
              <Flame size={38} aria-hidden="true" />
              <b><CountUp nilai={agg.streak} /> hari</b>
              <span>streak belajar berturut-turut</span>
            </div>
            <div className="kartu fade-up d4">
              <h3 className="kartu-judul"><Calendar size={18} className="ic" /> Percobaan terakhir</h3>
              {agg.terakhir ? (
                <>
                  <b style={{ fontSize: "1.1rem" }}>{agg.terakhir.nama}</b><br />
                  <span className="muted">
                    {new Date(agg.terakhir.tanggal).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })} · skor {agg.terakhir.pct}% · {Math.floor(agg.terakhir.durasi / 60)} mnt
                  </span>
                </>
              ) : <p className="empty">Belum ada percobaan.</p>}
              <br /><button className="btn primary besar" style={{ marginTop: 12 }} onClick={() => gantiHalaman("tes")}>Mulai latihan <ArrowRight size={16} /></button>
            </div>
          </div>
        </div>
        <div className="kartu fade-up d4" style={{ marginTop: 16 }}>
          <h3 className="kartu-judul"><ChartColumn size={18} className="ic" /> Tren performa <span className="aksi muted">{Math.min(10, agg.n)} percobaan terakhir</span></h3>
          <Grafik daftar={agg.daftar.slice(-10)} />
        </div>
        <div className="kartu fade-up d5" style={{ marginTop: 16 }}>
          <h3 className="kartu-judul"><Target size={18} className="ic" /> Fokus belajar <span className="aksi muted">topik terlemahmu</span></h3>
          {lemah3.length ? (
            <>
              {lemah3.map((t) => (
                <div className="goal" key={t.topik}>
                  <div className="goal-atas"><b><IkonTopik t={t.topik} size={17} /> {t.topik}</b><span className="muted">{t.pct}%</span></div>
                  <div className="bar"><span style={{ width: Math.min(100, t.pct) + "%", background: "linear-gradient(90deg,var(--warn),var(--bad))" }}></span></div>
                  <div style={{ marginTop: 6 }}><button className="btn" onClick={() => latihTopik(t.topik)}><Play size={14} className="ic" /> Latih topik ini</button></div>
                </div>
              ))}
              <p className="muted" style={{ margin: "8px 0 0" }}>Saran: buka <b>Daftar Tes → Mode Latihan</b>, filter topik di atas, lalu ulangi sampai stabil di atas 70%.</p>
            </>
          ) : <p className="empty">Selesaikan satu tes dulu — aplikasi akan otomatis menentukan topik yang perlu kamu perbaiki.</p>}
        </div>
      </>
    );
  }

  // ---------- daftar tes ----------
  function renderTes() {
    const kelompok = filterKel === "Semua" ? ["CPNS", "Kedinasan", "Polri", "BUMN"] : [filterKel];
    return kerangka(
      "tes", "Daftar Tes", "Pilih tes, kerjakan dengan timer seperti CAT asli, atau latihan per topik.",
      <>
        <Banner />
        <div className="tabs" role="tablist" aria-label="Filter kelompok tes">
          {["Semua", "CPNS", "Kedinasan", "Polri", "BUMN"].map((k) => (
            <button key={k} role="tab" aria-selected={filterKel === k} className={filterKel === k ? "aktif" : ""} onClick={() => setFilterKel(k)}>{k}</button>
          ))}
        </div>
        {kelompok.map((kel) => (
          <div key={kel}>
            <h2 className="kelompok-title">
              {kel === "Polri" ? <ShieldCheck size={20} className="ic" style={{ color: "var(--polri)" }} /> : kel === "CPNS" ? <Landmark size={20} className="ic" /> : kel === "Kedinasan" ? <GraduationCap size={20} className="ic" /> : <Building2 size={20} className="ic" style={{ color: "var(--bumn)" }} />}
              {kel === "Polri" ? "Kepolisian (Polri)" : kel === "CPNS" ? "CPNS (SKD)" : kel === "Kedinasan" ? "Sekolah Kedinasan (STAN, IPDN, dll.)" : "Badan Usaha Milik Negara (BUMN)"}
            </h2>
            <div className="cards">
              {CONFIG.tes.filter((t) => t.kelompok === kel).map((t, i) => (
                <div className={`card fade-up d${Math.min(i, 5) + 1}`} key={t.id} data-kel={t.kelompok}>
                  <div className="card-kepala">
                    <div className="card-ikon">{kel === "Polri" ? <ShieldCheck size={22} aria-hidden="true" /> : kel === "CPNS" ? <Landmark size={22} aria-hidden="true" /> : kel === "Kedinasan" ? <GraduationCap size={22} aria-hidden="true" /> : <Building2 size={22} aria-hidden="true" />}</div>
                    <div><div className="kel">{kel}{t.jenis ? " · " + t.jenis : ""}</div><h3>{t.nama}</h3></div>
                  </div>
                  <div className="chips">
                    <span className="chip"><Clock size={13} aria-hidden="true" /> {t.durasiMenit} menit</span>
                    <span className="chip"><ListChecks size={13} aria-hidden="true" /> {t.jumlahSoal} soal</span>
                    <span className="chip" title="Perkiraan, bukan angka resmi"><Target size={13} aria-hidden="true" /> PG ±{t.passingGrade}%</span>
                    <span className="chip"><Library size={13} aria-hidden="true" /> {bankTes(t).length} di bank</span>
                  </div>
                  <div className="desc">{t.deskripsi}</div>
                  <div className="actions">
                    <button className="btn primary" onClick={() => startUjian(t.id)}><Play size={16} aria-hidden="true" /> Mulai ujian</button>
                    <button className="btn" onClick={() => setLatihanTes(t)}><BookOpen size={16} aria-hidden="true" /> Latihan</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        <p className="catatan-kaki">PG = passing grade perkiraan, bukan angka resmi. Psikologi, kesamaptaan jasmani, dan kesehatan hanya dijelaskan di halaman Panduan — tidak disimulasikan.</p>
        {latihanTes && <SetupLatihan tes={latihanTes} onMulai={(topik) => { startLatihan(latihanTes.id, topik); setLatihanTes(null); }} onBatal={() => setLatihanTes(null)} />}
      </>
    );
  }

  // ---------- panduan ----------
  function renderPanduan(jalur) {
    return kerangka(
      "panduan-" + jalur, "Panduan Jalur " + (jalur === "polri" ? "Polri" : "BUMN"),
      "Dari pendaftaran sampai pengumuman — apa yang diuji dan cara mempersiapkannya.",
      <>
        <div className="panduan" dangerouslySetInnerHTML={{ __html: PANDUAN[jalur] }} />
        <p style={{ marginTop: 14 }}><button className="btn ghost" onClick={() => gantiHalaman("tes")}>← Ke Daftar Tes</button></p>
      </>
    );
  }

  // ---------- materi ----------
  function renderMateri() {
    const mapel = MATERI.mapel.find((m) => m.id === materiMapel) || null;
    const bab = mapel && mapel.bab.find((b) => b.id === materiBab) || null;
    let isi;
    if (bab) {
      const jelas = PENJELASAN[bab.id];
      isi = (
        <>
          <div className="kartu">
            <p className="kartu-judul"><button className="aksi" onClick={() => setMateriBab(null)}>← Semua bab</button></p>
            <h3 style={{ margin: "0 0 10px" }}>{bab.judul}</h3>
            {jelas && (
              <div style={{ background: "var(--brand-soft, rgba(99,102,241,.1))", borderRadius: 10, padding: "12px 16px", marginBottom: 16, maxWidth: 860 }}>
                <b style={{ fontSize: ".85rem" }}>Penjelasan singkat (baca dulu sebelum membuka halaman modul):</b>
                {jelas.split("\n\n").map((p, i) => <p key={i} style={{ margin: "8px 0 0", fontSize: ".92rem", color: "var(--muted)", lineHeight: 1.7 }}>{p}</p>)}
              </div>
            )}
            <div style={{ display: "grid", gap: 14 }}>
              {bab.img.map((s) => (
                <a key={s} href={s} target="_blank" rel="noreferrer">
                  <img src={s} alt={bab.judul} loading="lazy" style={{ width: "100%", maxWidth: 860, display: "block", margin: "0 auto", border: "1px solid var(--border)", borderRadius: 8 }} />
                </a>
              ))}
            </div>
          </div>
          <p style={{ marginTop: 14 }}><button className="btn ghost" onClick={() => gantiHalaman("tes")}>← Ke Daftar Tes (latihan soal)</button></p>
        </>
      );
    } else if (mapel) {
      isi = (
        <>
          <p style={{ marginBottom: 12 }}><button className="btn ghost" onClick={() => setMateriMapel(null)}>← Semua mapel</button></p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 10 }}>
            {mapel.bab.map((b) => (
              <button key={b.id} className="btn ghost" style={{ justifyContent: "flex-start", textAlign: "left", padding: "12px 14px" }} onClick={() => setMateriBab(b.id)}>
                <BookOpen size={15} style={{ flex: "none" }} /> <span>{b.judul}</span>
              </button>
            ))}
          </div>
        </>
      );
    } else {
      isi = (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 12 }}>
          {MATERI.mapel.map((m) => (
            <button key={m.id} className="kartu" style={{ textAlign: "left", cursor: "pointer", fontFamily: "inherit" }} onClick={() => { setMateriMapel(m.id); setMateriBab(null); }}>
              <p className="kartu-judul" style={{ margin: 0 }}>{m.nama}</p>
              <p style={{ margin: "8px 0 0", color: "var(--muted)", fontSize: ".85rem" }}>{m.bab.length} bab materi</p>
            </button>
          ))}
        </div>
      );
    }
    return kerangka(
      "materi", "Materi", MATERI.judul + " — halaman asli modul lengkap dengan gambar & rumus. Klik gambar untuk memperbesar.",
      isi
    );
  }

  // ---------- riwayat ----------
  function renderRiwayat() {
    const list = riwayat.slice().reverse();
    return kerangka(
      "riwayat", "Riwayat Percobaan", "Hasil ujianmu tersimpan di akun dan dapat dilihat master.",
      <>
        {list.length === 0 && <div className="kartu"><p className="empty">Belum ada percobaan. Mulai dari <b>Daftar Tes</b>.</p></div>}
        {list.map((r, i) => (
          <div className={`riwayat-item fade-up d${Math.min(i, 5) + 1}`} key={r.id}>
            <b>{r.nama}</b> — {r.pct}% ({r.skor}/{r.maks})
            <div className="muted">{tgl(r.tanggal)} · durasi {durasiTeks(r.durasi)}</div>
            {r.perTopik && r.perTopik.length > 0 && (
              <div className="muted">Per topik: {r.perTopik.map((p) => `${p.topik} ${p.pct}%`).join(" · ")}</div>
            )}
            <button className="btn" style={{ marginTop: 8 }} onClick={() => bukaTinjau(r.id, "riwayat")}><Eye size={16} /> Lihat jawaban</button>
          </div>
        ))}
      </>
    );
  }

  // ---------- master: daftar user ----------
  function renderMaster() {
    const semua = masterUsers || [];
    const user_ = semua.filter((x) => x.role !== "master");
    const tujuhHari = Date.now() - 7 * 24 * 3600 * 1000;
    const aktif7 = user_.filter((x) => x.terakhir && new Date(x.terakhir).getTime() > tujuhHari).length;
    const adaNilai = user_.filter((x) => x.jumlah > 0);
    const rataSemua = adaNilai.length ? Math.round((adaNilai.reduce((a, x) => a + x.rata, 0) / adaNilai.length) * 10) / 10 : 0;
    const q = cari.trim().toLowerCase();
    const tampil = semua.filter((x) => !q || x.nama.toLowerCase().includes(q) || x.username.toLowerCase().includes(q));
    return kerangka(
      "master", "Pantau User", "Lihat perkembangan tryout setiap user dan kelola akunnya.",
      <>
        <div className="baris-stat fade-up d1">
          <Stat Ikon={Users} nilai={user_.length} label="Total user" />
          <Stat Ikon={ClipboardList} kelas="biru" nilai={user_.reduce((a, x) => a + x.jumlah, 0)} label="Total percobaan" />
          <Stat Ikon={Target} kelas="hijau" nilai={rataSemua + "%"} label="Rata-rata semua user" />
          <Stat Ikon={Flame} kelas="kuning" nilai={aktif7} label="Aktif 7 hari terakhir" />
        </div>
        <div className="kartu fade-up d2">
          <h3 className="kartu-judul"><UserPlus size={18} className="ic" /> Tambah user</h3>
          <FormUser onSimpan={tambahUser} />
        </div>
        <KodeMaster daftar={kodeList} onBuat={buatKode} />
        <div className="kartu fade-up d3" style={{ marginTop: 16 }}>
          <h3 className="kartu-judul"><Users size={18} className="ic" /> Daftar user</h3>
          <div className="filter-row"><input className="cari" placeholder="Cari nama atau username" value={cari} onChange={(e) => setCari(e.target.value)} aria-label="Cari user" /></div>
          {masterUsers === null ? <p className="empty">Memuat…</p> : (
            <div className="tabel-wrap">
              <table className="data">
                <thead><tr><th>Nama</th><th>Percobaan</th><th>Rata-rata</th><th>Terakhir</th><th>Topik terlemah</th><th>Status</th><th></th></tr></thead>
                <tbody>
                  {tampil.map((x) => (
                    <tr key={x.id} className={x.aktif ? "" : "nonaktif"}>
                      <td><b>{x.nama}</b><div className="muted">@{x.username}{x.role === "master" ? " · master" : ""}</div></td>
                      <td>{x.jumlah}</td>
                      <td>{x.jumlah ? x.rata + "%" : "—"}</td>
                      <td>{x.terakhir ? tgl(x.terakhir) : "—"}</td>
                      <td>{x.terlemah ? `${x.terlemah.topik} (${x.terlemah.pct}%)` : "—"}</td>
                      <td><span className={`badge ${x.aktif ? "pass" : "fail"}`}>{x.aktif ? "Aktif" : "Nonaktif"}</span></td>
                      <td><button className="btn" onClick={() => bukaUser(x.id)}><Eye size={15} /> Detail</button></td>
                    </tr>
                  ))}
                  {tampil.length === 0 && <tr><td colSpan="7" className="empty">Tidak ada user yang cocok.</td></tr>}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </>
    );
  }

  // ---------- master: detail satu user ----------
  function renderMasterUser() {
    const { user: u, ringkasan, percobaan } = masterDetail;
    const daftar = percobaan.slice().reverse();
    return kerangka(
      "master", u.nama, `@${u.username} · bergabung ${new Date(u.dibuat).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}`,
      <>
        <p><button className="btn ghost" onClick={() => { setMasterDetail(null); setHalaman("master"); }}><ArrowLeft size={16} /> Semua user</button></p>
        <div className="kartu fade-up">
          <div className="kepala-user">
            <span className={`badge ${u.aktif ? "pass" : "fail"}`}>{u.aktif ? "Akun aktif" : "Akun nonaktif"}</span>
            {u.role !== "master" && (
              <button className={`btn ${u.aktif ? "danger" : "primary"}`} onClick={() => ubahUser(u.id, { aktif: !u.aktif })}>
                {u.aktif ? <><UserX size={16} /> Nonaktifkan</> : <><UserCheck size={16} /> Aktifkan</>}
              </button>
            )}
          </div>
          {u.role !== "master" && <FormPassword onSimpan={(pw) => ubahUser(u.id, { password: pw })} />}
        </div>
        <div className="baris-stat fade-up d1" style={{ marginTop: 16 }}>
          <Stat Ikon={ClipboardList} nilai={ringkasan.jumlah} label="Total percobaan" />
          <Stat Ikon={Target} kelas="biru" nilai={ringkasan.rata + "%"} label="Skor rata-rata" />
          <Stat Ikon={Calendar} kelas="hijau" nilai={ringkasan.terakhir ? new Date(ringkasan.terakhir).toLocaleDateString("id-ID", { day: "numeric", month: "short" }) : "—"} label="Percobaan terakhir" />
        </div>
        <div className="grid-dua">
          <div className="kartu fade-up d2">
            <h3 className="kartu-judul"><ChartColumn size={18} className="ic" /> Rata-rata per topik <span className="aksi muted">terlemah di atas</span></h3>
            {ringkasan.perTopik.length ? ringkasan.perTopik.map((t) => (
              <div className="goal" key={t.topik}>
                <div className="goal-atas"><b><IkonTopik t={t.topik} size={17} /> {t.topik}</b><span className="muted">{t.pct}% · {t.n}×</span></div>
                <div className="bar"><span style={{ width: Math.min(100, t.pct) + "%", background: t.pct < 60 ? "linear-gradient(90deg,var(--warn),var(--bad))" : undefined }}></span></div>
              </div>
            )) : <p className="empty">Belum ada data topik.</p>}
          </div>
          <div className="kartu fade-up d3">
            <h3 className="kartu-judul"><TrendingUp size={18} className="ic" /> Tren skor <span className="aksi muted">10 percobaan terakhir</span></h3>
            <Grafik daftar={percobaan.slice(-10)} />
          </div>
        </div>
        <div className="kartu fade-up d4" style={{ marginTop: 16 }}>
          <h3 className="kartu-judul"><History size={18} className="ic" /> Semua percobaan</h3>
          {daftar.length === 0 ? <p className="empty">User ini belum mengerjakan tryout.</p> : (
            <div className="tabel-wrap">
              <table className="data">
                <thead><tr><th>Tanggal</th><th>Tes</th><th>Skor</th><th>Durasi</th><th></th></tr></thead>
                <tbody>
                  {daftar.map((r) => (
                    <tr key={r.id}>
                      <td>{tgl(r.tanggal)}</td><td>{r.nama}</td>
                      <td><b>{r.pct}%</b> <span className="muted">({r.skor}/{r.maks})</span></td>
                      <td>{durasiTeks(r.durasi)}</td>
                      <td><button className="btn" onClick={() => bukaTinjau(r.id, "master-user")}><Eye size={15} /> Lihat jawaban</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </>
    );
  }

  function latihTopik(topik) {
    if (kadaluarsa) return setPesan(TERKUNCI);
    const tes = CONFIG.tes.find((t) => Object.keys(t.komposisi).includes(topik) && GEN.ada(topik))
      || CONFIG.tes.find((t) => Object.keys(t.komposisi).includes(topik));
    if (!tes) return setPesan("Topik ini belum tersedia untuk latihan.");
    startLatihan(tes.id, topik);
  }

  // ---------- layar ujian ----------
  function renderUjian() {
    const soal = S.soal[S.cur];
    const n = S.soal.length;
    const revealed = S.mode === "latihan" && S.revealed[S.cur] != null;
    const terjawab = S.mode === "ujian" ? S.jawab.filter((x) => x != null).length : 0;
    const belumN = n - terjawab;
    const raguN = S.ragu.filter(Boolean).length;
    const ubahJawab = (j) => {
      if (S.mode === "ujian") {
        setS({ ...S, jawab: S.jawab.map((x, i) => (i === S.cur ? (x === j ? null : j) : x)) });
      } else {
        const benar = j === S.soal[S.cur].ans;
        let lvBerjalan = S.lvBerjalan || 1, streakB = S.streakB || 0, streakS = S.streakS || 0;
        if (benar) { streakB += 1; streakS = 0; if (streakB >= 3) { lvBerjalan = Math.min(3, lvBerjalan + 1); streakB = 0; } }
        else { streakS += 1; streakB = 0; if (streakS >= 2) { lvBerjalan = Math.max(1, lvBerjalan - 1); streakS = 0; } }
        setS({ ...S, revealed: { ...S.revealed, [S.cur]: j }, lvBerjalan, streakB, streakS });
      }
    };
    return (
      <div className="exam-shell">
        <div className="exam-top">
          {S.mode === "ujian" ? (
            <>
              <div className="baris">
                <div className="exam-info"><b>{S.tes.nama}</b> <span>Soal {S.cur + 1}/{n} · mudah → sulit</span></div>
                <div className={`timer${S.sisa < S.tes.durasiMenit * 6 ? " low" : ""}`} role="timer" aria-label="Sisa waktu"><Timer size={18} aria-hidden="true" />{fmt(Math.max(0, S.sisa))}</div>
              </div>
              <div className="progress" title={`${terjawab} dari ${n} terjawab`}><span style={{ width: Math.round((terjawab / n) * 100) + "%" }}></span></div>
            </>
          ) : (
            <div className="baris">
              <div className="exam-info"><b><BookOpen size={16} className="ic" /> Latihan — {S.tes.nama}</b> <span>{S.topikFilter ? "topik: " + S.topikFilter + " · " : ""}Soal {S.cur + 1}/{n}</span></div>
              <div className="baris">
                <span className="pill-info" title="Level kesulitan adaptif: naik setelah 3 benar berurutan, turun setelah 2 salah berurutan"><TrendingUp size={15} className="ic" aria-hidden="true" /> Level {"★".repeat(S.lvBerjalan || 1)}{"☆".repeat(3 - (S.lvBerjalan || 1))}</span>
                <div><button className="btn ghost" onClick={() => gantiHalaman("tes")}><X size={16} /> Selesai latihan</button></div>
              </div>
            </div>
          )}
        </div>
        <div className="exam-layout">
          <div className="exam-main">
            <div className="question-box">
              <div className="q-topik">
                {soal.topik}
                {S.mode === "latihan" && (
                  <span className="stars" title="Tingkat kesulitan">{"★".repeat(soal.level || 1)}{"☆".repeat(3 - (soal.level || 1))}</span>
                )}
              </div>
              {S.mode === "latihan" && soal.topik === "Wawasan Kebangsaan" && !soal.verif && <p className="muted">Soal ini belum dicek ke sumber resmi; cocokkan dengan teks resmi sebelum menghafal.</p>}
              <div className="q-text" dangerouslySetInnerHTML={{ __html: soal.q }} />
              <div className="opts">
                {soal.opts.map((opt, j) => {
                  let cls = "opt";
                  if (revealed) {
                    if (j === soal.ans) cls += " correct";
                    else if (S.revealed[S.cur] === j) cls += " wrong";
                  } else if (S.mode === "ujian" && S.jawab[S.cur] === j) cls += " sel";
                  return (
                    <button key={j} className={cls} disabled={revealed} onClick={() => ubahJawab(j)}>
                      <span className="opt-letter">{huruf(j)}</span>
                      <span dangerouslySetInnerHTML={{ __html: opt }} />
                    </button>
                  );
                })}
              </div>
              {revealed && (
                <div className="bahas">
                  <span className={`key${S.revealed[S.cur] === soal.ans ? "" : " salah"}`}>{S.revealed[S.cur] === soal.ans ? <><CircleCheck size={17} className="ic" /> Benar!</> : <><CircleX size={17} className="ic" /> Kurang tepat.</>}</span> Kunci: <b>{huruf(soal.ans)}</b><br />
                  <span dangerouslySetInnerHTML={{ __html: soal.bahas }} />
                  {soal.sumber && <><br /><span className="muted">Sumber: {soal.sumber}</span></>}
                </div>
              )}
            </div>
            <div className="exam-nav">
              <button className="btn" disabled={S.cur === 0} onClick={() => setS({ ...S, cur: S.cur - 1 })}><ChevronLeft size={16} /> <span className="lbl">Sebelumnya</span></button>
              {S.mode === "ujian" && (
                <button className="btn ghost" onClick={() => setS({ ...S, ragu: S.ragu.map((x, i) => (i === S.cur ? !x : x)) })}>
                  <Flag size={16} fill={S.ragu[S.cur] ? "currentColor" : "none"} /> <span className="lbl">Ragu-ragu</span>
                </button>
              )}
              {(S.cur < n - 1 || (S.mode === "latihan" && topikLatihan(S).some(GEN.ada))) && (
                <button className="btn primary" onClick={() => setS(S.cur === n - 1 ? { ...S, soal: S.soal.concat(GEN.lagi(topikLatihan(S), 10, S.lvBerjalan).map(shuffleOpts)), cur: S.cur + 1 } : { ...S, cur: S.cur + 1 })}>Berikutnya <ChevronRight size={16} /></button>
              )}
              {S.mode === "ujian" && (
                <button className="btn danger" onClick={() => mintaKonfirmasi(`Selesaikan ujian?\nBelum dijawab: ${belumN} soal\nRagu-ragu: ${raguN} soal`, () => finish(false))}><Check size={16} /> <span className="lbl">Selesai</span></button>
              )}
            </div>
            {S.catatan && S.catatan.length > 0 && <p className="muted">Catatan: {S.catatan.join("; ")} — dipakai semua soal yang tersedia.</p>}
          </div>
          {S.mode === "ujian" && (
            <aside className="exam-side">
              <div className="side-box">
                <div className="side-title">Navigasi Soal</div>
                <div className="side-stats">
                  <span><i style={{ background: "var(--ok)" }}></i>{n - belumN - raguN} terjawab</span>
                  <span><i style={{ background: "var(--flag)" }}></i>{raguN} ragu</span>
                  <span><i style={{ background: "var(--surface)", border: "1px solid var(--border)" }}></i>{belumN} belum</span>
                </div>
                <div className="navigator">
                  {S.soal.map((_, k) => {
                    let c = "nav-num";
                    if (S.jawab[k] != null) c += " done";
                    if (S.ragu[k]) c += " flag";
                    if (k === S.cur) c += " cur";
                    return <button key={k} className={c} title={"Soal " + (k + 1)} onClick={() => setS({ ...S, cur: k })}>{k + 1}</button>;
                  })}
                </div>
                <button className="btn danger besar" onClick={() => mintaKonfirmasi(`Selesaikan ujian?\nBelum dijawab: ${belumN} soal\nRagu-ragu: ${raguN} soal`, () => finish(false))}><Trophy size={16} /> Selesai &amp; kumpulkan</button>
              </div>
            </aside>
          )}
        </div>
      </div>
    );
  }

  // ---------- layar hasil ----------
  function renderHasilLayar() {
    const { h, otomatis } = hasil;
    const subtes = hitungSubtes(S.tes, S.soal.map((x, i) => ({ t: x.topik, a: x.ans, j: S.jawab[i], s: x.skor || undefined })));
    const lulus = subtes ? subtes.every((x) => x.lolos) : h.pct >= S.tes.passingGrade;
    const topikSorted = Object.keys(h.perTopik)
      .map((t) => ({ t, pct: h.perTopik[t].maks ? Math.round((h.perTopik[t].skor / h.perTopik[t].maks) * 1000) / 10 : 0 }))
      .sort((a, b) => b.pct - a.pct);
    const lemah = topikSorted.slice(-Math.min(2, topikSorted.length)).reverse();
    return (
      <div className="exam-shell">
        {lulus && <Confetti />}
        <Banner />
        {hasil.simpan === "proses" && <div className="info-pesan" role="status">Menyimpan hasil ke akunmu…</div>}
        {hasil.simpan === "ok" && <div className="info-pesan ok" role="status"><CircleCheck size={16} className="ic" /> Hasil tersimpan di akunmu dan dapat dilihat master.</div>}
        {hasil.simpan === "gagal" && (
          <div className="info-pesan gagal" role="alert"><TriangleAlert size={16} className="ic" /> Hasil belum tersimpan ({hasil.pesan}).
            <button className="btn" onClick={simpanKeServer}><RotateCcw size={15} /> Coba simpan lagi</button></div>
        )}
        <div className={`kartu kartu-hasil${lulus ? "" : " gagal"}`}>
          <div className="hasil-head">
            <Ring pct={h.pct} warna={lulus ? "var(--ok)" : "var(--bad)"}>
              <div className="big"><CountUp nilai={h.pct} desimal={String(h.pct).indexOf(".") >= 0 ? 1 : 0} />%</div>
              <div className="kecil">{h.total} / {h.maks} poin</div>
            </Ring>
            <div style={{ flex: 1, minWidth: 220 }}>
              <h3 style={{ margin: "0 0 6px" }}>{S.tes.nama}</h3>
              <div className="muted">
                {otomatis ? "Waktu habis — dikumpulkan otomatis. " : ""}{S.tes.durasiMenit} menit · {S.soal.length} soal{subtes ? "" : ` · passing grade ${S.tes.passingGrade}% (perkiraan)`}
              </div>
              <div style={{ marginTop: 10 }}>
                <span className={`badge ${lulus ? "pass" : "fail"}`}>{lulus ? <CircleCheck size={15} /> : <CircleX size={15} />} {subtes ? (lulus ? "Semua subtes di atas ambang" : "Ada subtes di bawah ambang") : (lulus ? "Di atas" : "Di bawah") + " passing grade (perkiraan)"}</span>
              </div>
            </div>
          </div>
        </div>
        {subtes && <Subtes daftar={subtes} />}
        <div className="kartu" style={{ marginTop: 14 }}>
          <h3 className="kartu-judul"><ChartColumn size={18} className="ic" /> Skor per topik</h3>
          <table className="skor">
            <tbody>
              <tr><th>Topik</th><th>Skor</th><th></th></tr>
              {topikSorted.map((r) => (
                <tr key={r.t}>
                  <td><IkonTopik t={r.t} size={16} /> {r.t}</td>
                  <td>{r.pct}%</td>
                  <td><div className="bar"><span style={{ width: Math.min(100, r.pct) + "%" }}></span></div></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="bahas">
            <b>Topik terlemah:</b> {lemah.map((r) => `${r.t} (${r.pct}%)`).join(", ")}.
            Pelajari ulang, lalu latih lewat <b>Daftar Tes → Mode Latihan</b> yang difilter per topik.
          </div>
        </div>
        <div className="kartu" style={{ marginTop: 14 }}>
          <h3 className="kartu-judul"><ListChecks size={18} className="ic" /> Review soal</h3>
          <div className="filter-row">
            <label><input type="checkbox" checked={salahSaja} onChange={(e) => setSalahSaja(e.target.checked)} /> Tampilkan yang salah saja</label>
          </div>
          {S.soal.map((soal, i) => {
            const j = S.jawab[i];
            const benar = j != null && j === soal.ans;
            if (salahSaja && benar) return null;
            return (
              <div className="review-item" key={soal.id}>
                <div className="q-topik">{i + 1}. {soal.topik}</div>
                <div className="q-text" dangerouslySetInnerHTML={{ __html: soal.q }} />
                <div>
                  Jawabanmu: <b>{j != null ? huruf(j) + (soal.skor ? ` (nilai ${soal.skor[j]}/${skorMaksSoal(soal)})` : "") : "— (kosong)"}</b> · Kunci: <b>{huruf(soal.ans)}</b>{" "}
                  <span className={`status ${benar ? "ok" : "no"}`}>{soal.skor ? "" : benar ? "benar" : "salah"}</span>
                </div>
                <div className="bahas" dangerouslySetInnerHTML={{ __html: soal.bahas }} />
              </div>
            );
          })}
        </div>
        <p style={{ marginTop: 14 }}>
          {lemah.length > 0 && lemah[0].pct < 80 && <><button className="btn primary" onClick={() => { setBelajarAwal({ jenis: "remedial", topik: lemah.filter((r) => r.pct < 80).map((r) => r.t), k: Date.now() }); gantiHalaman("belajar"); }}><Target size={16} /> Perbaiki kekurangan</button>{" "}</>}
          <button className="btn ghost" onClick={() => gantiHalaman("dashboard")}><ArrowLeft size={16} /> Dashboard</button>{" "}
          <button className="btn" onClick={() => gantiHalaman("tes")}><RotateCcw size={16} /> Coba lagi</button>{" "}
          <button className="btn" onClick={() => gantiHalaman("riwayat")}><History size={16} /> Riwayat</button>
        </p>
      </div>
    );
  }

  // ---------- render utama ----------
  if (user === undefined) return <div className="splash" role="status">Memuat…</div>;
  if (user === null) return <AuthScreen onMasuk={setelahMasuk} temaGelap={temaGelap} ubahTema={ubahTema} info={info} />;
  let isi;
  if (hasil) isi = renderHasilLayar();
  else if (S) isi = renderUjian();
  else if (halaman === "tes") isi = renderTes();
  else if (halaman === "panduan-polri") isi = renderPanduan("polri");
  else if (halaman === "panduan-bumn") isi = renderPanduan("bumn");
  else if (halaman === "materi") isi = renderMateri();
  else if (halaman === "riwayat") isi = renderRiwayat();
  else if (halaman === "belajar") isi = kerangka("belajar", "Belajar dari Nol", "Diagnosis, kartu konsep, latihan bertingkat, dan ulangan soal yang pernah salah.", <Belajar terkunci={kadaluarsa} awal={belajarAwal} />);
  else if (halaman === "tryout") isi = kerangka("tryout", "Tryout Terjadwal", "Paket soal sama untuk semua peserta, dinilai server, lalu diperingkat.",
    <Tryout user={user} onMulai={startTryout} onTinjau={(id) => bukaTinjau(id, "tryout")} />);
  else if (halaman === "master" && jadiMaster) isi = renderMaster();
  else if (halaman === "master-user" && jadiMaster && masterDetail) isi = renderMasterUser();
  else if (halaman === "tinjau" && tinjau) {
    isi = kerangka(kembaliKe === "master-user" ? "master" : kembaliKe, "Tinjau jawaban", "Jawaban, kunci, dan pembahasan setiap soal.",
      <ReviewPanel data={tinjau} onKembali={() => setHalaman(kembaliKe)} />);
  } else isi = renderDashboard();

  return (
    <>
      {isi}
      {konfirm && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal fade-up">
            <p style={{ whiteSpace: "pre-line", margin: "0 0 16px" }}>{konfirm.pesan}</p>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button className="btn ghost" onClick={() => setKonfirm(null)}>Batal</button>
              <button className="btn primary" onClick={() => { const a = konfirm.aksi; setKonfirm(null); a(); }}>Ya, lanjut</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
