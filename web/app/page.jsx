"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { CONFIG, PANDUAN } from "../data/config";
import tkd from "../data/bumn-tkd";
import akhlak from "../data/bumn-akhlak";
import english from "../data/bumn-english";
import bidang from "../data/bumn-bidang";
import akpol from "../data/akpol";
import sipss from "../data/sipss";
import wk from "../data/bumn-wk";
import psiko from "../data/polri-psiko";
import GEN from "../data/gen";
import DOMPurify from "dompurify";
import {
  House, ClipboardList, ShieldCheck, Building2, History, Moon, Sun, Clock, ListChecks, Target, Flame, TrendingUp,
  BookOpen, Play, ChevronLeft, ChevronRight, Flag, Check, X, Trophy, GraduationCap, ChartColumn, Sparkles, Trash2,
  Timer, ArrowRight, ArrowLeft, TriangleAlert, Calendar, Infinity as InfinityIcon, Brain, Library, RotateCcw, CircleCheck, CircleX,
  MessageSquareText, Calculator, Shapes, Layers, BookOpenText, Languages, Landmark, Handshake, Database, Network, Cpu, Receipt, Coins,
  Zap, Users, RefreshCw, HeartHandshake, Globe, Code, Sigma, PenLine, Medal, Award, Rocket,
  LogOut, UserRound, UserPlus, KeyRound, Eye, UserX, UserCheck, Lock,
} from "lucide-react";

const BANK = { "bumn-tkd": tkd, "bumn-akhlak": akhlak, "bumn-english": english, "bumn-bidang": bidang, "bumn-wk": wk, "polri-psiko": psiko, akpol, sipss };
// satu tes boleh memakai beberapa bank (bank: ["akpol", "sipss"])
const bankTes = (tes) => [].concat(tes.bank).reduce((a, b) => a.concat(BANK[b] || []), []);

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
function shuffle(a) {
  a = a.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function shuffleOpts(soal) {
  const idx = shuffle(soal.opts.map((_, i) => i));
  return {
    id: soal.id, topik: soal.topik, q: soal.q, bahas: soal.bahas, level: soal.level,
    opts: idx.map((i) => soal.opts[i]),
    ans: idx.indexOf(soal.ans),
    skor: soal.skor ? idx.map((i) => soal.skor[i]) : null,
  };
}
const topikLatihan = (S) => (S.topikFilter ? [S.topikFilter] : Object.keys(S.tes.komposisi));
const skorSoal = (soal, j) => (j == null ? 0 : soal.skor ? soal.skor[j] || 0 : j === soal.ans ? 1 : 0);
const skorMaksSoal = (soal) => (soal.skor ? Math.max(...soal.skor) : 1);
const fmt = (s) => {
  const m = Math.floor(s / 60), d = s % 60;
  return (m < 10 ? "0" : "") + m + ":" + (d < 10 ? "0" : "") + d;
};
const huruf = (j) => String.fromCharCode(65 + j);

function susunSoal(tes) {
  const bank = bankTes(tes);
  let terpilih = [];
  const catatan = [];
  Object.keys(tes.komposisi).forEach((topik) => {
    const butuh = tes.komposisi[topik];
    const pool = bank.filter((s) => s.topik === topik);
    const ambil = GEN.susun(topik, butuh, pool);
    if (ambil.length < butuh) catatan.push(`${topik}: bank hanya punya ${ambil.length} dari ${butuh} soal`);
    terpilih = terpilih.concat(ambil);
  });
  terpilih.sort((a, b) => (a.level || 1) - (b.level || 1)); // mudah -> sulit
  return { list: terpilih.map(shuffleOpts), catatan };
}

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
async function api(path, method = "GET", body) {
  const r = await fetch(path, { method, headers: body ? { "content-type": "application/json" } : {}, body: body ? JSON.stringify(body) : undefined });
  let j = null;
  try { j = await r.json(); } catch {}
  if (!r.ok) throw new Error((j && j.galat) || "Terjadi kesalahan. Coba lagi.");
  return j;
}
// HTML soal yang berasal dari server (bisa dipalsukan oleh user lewat API) wajib dibersihkan sebelum dirender.
const bersih = (h) => DOMPurify.sanitize(String(h), {
  USE_PROFILES: { html: true, svg: true },
  FORBID_TAGS: ["form", "input", "button", "textarea", "select", "option", "label", "style", "link", "meta", "base", "iframe", "object", "embed", "a", "img", "video", "audio", "source"],
  FORBID_ATTR: ["action", "formaction", "srcset", "href", "xlink:href"],
});
const tgl = (t) => new Date(t).toLocaleString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
const durasiTeks = (d) => `${Math.floor(d / 60)} mnt ${d % 60} dtk`;

function AuthScreen({ onMasuk, temaGelap, ubahTema }) {
  const [mode, setMode] = useState("masuk");
  const [f, setF] = useState({ username: "", nama: "", password: "" });
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
        <div className="logo"><div className="logo-ikon"><GraduationCap size={22} aria-hidden="true" /></div><div>Simulasi Tes<small>POLRI · BUMN</small></div></div>
        <h1>Latihan seleksi dengan timer, pembahasan, dan pemantauan.</h1>
        <ul>
          <li><CircleCheck size={18} className="ic" /> Soal latihan tak terhingga untuk Akpol, SIPSS, Bintara, dan BUMN</li>
          <li><CircleCheck size={18} className="ic" /> Riwayat dan analisis topik terlemah tersimpan di akunmu</li>
          <li><CircleCheck size={18} className="ic" /> Hasil tryout dapat dilihat oleh master (pengelola) untuk pendampingan</li>
        </ul>
      </section>
      <section className="auth-form">
        <button className="tombol-tema auth-tema" onClick={ubahTema} aria-label="Ganti tema">{temaGelap ? <Sun size={18} /> : <Moon size={18} />}</button>
        <div className="tabs" role="tablist">
          <button role="tab" aria-selected={mode === "masuk"} className={mode === "masuk" ? "aktif" : ""} onClick={() => { setMode("masuk"); setGalat(""); }}>Masuk</button>
          <button role="tab" aria-selected={mode === "daftar"} className={mode === "daftar" ? "aktif" : ""} onClick={() => { setMode("daftar"); setGalat(""); }}>Daftar</button>
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
          {mode === "daftar" && <p className="muted">Username 3–30 karakter (huruf, angka, titik, strip, garis bawah). Password minimal 8 karakter.</p>}
          {galat && <div className="galat" role="alert">{galat}</div>}
          <button className="btn primary besar" disabled={sibuk}>{sibuk ? "Memproses…" : mode === "masuk" ? "Masuk" : "Daftar & masuk"}</button>
        </form>
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

// Tinjau jawaban satu percobaan (dipakai user untuk miliknya dan master untuk semua user).
function ReviewPanel({ data, onKembali }) {
  const [salahSaja, setSalahSaja] = useState(false);
  const { percobaan: pc, detail, pemilik } = data;
  const benarN = detail.filter((x) => x.j !== null && x.j === x.a).length;
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
  { id: "tes", Ikon: ClipboardList, teks: "Daftar Tes", pendek: "Tes" },
  { id: "panduan-polri", Ikon: ShieldCheck, teks: "Panduan Polri", pendek: "Polri" },
  { id: "panduan-bumn", Ikon: Building2, teks: "Panduan BUMN", pendek: "BUMN" },
  { id: "riwayat", Ikon: History, teks: "Riwayat", pendek: "Riwayat" },
];
const MENU_MASTER = { id: "master", Ikon: Users, teks: "Pantau User", pendek: "User" };

export default function App() {
  const [halaman, setHalaman] = useState("dashboard");
  const [temaGelap, setTemaGelap] = useState(false);
  const [user, setUser] = useState(undefined); // undefined = memeriksa sesi, null = belum masuk
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
  const timerRef = useRef(null);

  function mintaKonfirmasi(pesan, aksi) { setKonfirm({ pesan, aksi }); }

  // init tema + riwayat (client only)
  useEffect(() => {
    setTemaGelap(document.documentElement.dataset.tema === "gelap"); // sudah dipasang skrip di layout
    api("/api/auth/me").then((r) => setUser(r.user)).catch(() => setUser(null));
  }, []);
  // muat riwayat milik user setelah masuk
  const userId = user ? user.id : null;
  useEffect(() => {
    if (userId) api("/api/attempts").then((r) => setRiwayat(r.percobaan)).catch(() => {});
  }, [userId]);
  const jadiMaster = !!user && user.role === "master";
  useEffect(() => {
    if (jadiMaster && halaman === "master") api("/api/master/users").then((r) => setMasterUsers(r.users)).catch((e) => setPesan(e.message));
  }, [jadiMaster, halaman]);
  function setelahMasuk(u) { setUser(u); setHalaman("dashboard"); setS(null); setHasil(null); }
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

  function gantiHalaman(nama) {
    const lanjut = () => { setS(null); setHasil(null); setHalaman(nama); setLatihanTes(null); };
    if (S && S.mode === "ujian" && !S.selesai && !hasil) {
      mintaKonfirmasi("Ujian sedang berjalan. Yakin keluar? Progres tidak tersimpan.", lanjut);
      return;
    }
    lanjut();
  }

  function startUjian(tesId) {
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
  function finish(otomatis) {
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
            <div>Simulasi Tes<small>POLRI · BUMN</small></div>
          </div>
          <div className="menu-label">Menu</div>
          {menuAktif.map((m) => (
            <button key={m.id} className={`menu-item${m.id === aktif ? " aktif" : ""}`} onClick={() => gantiHalaman(m.id)} aria-current={m.id === aktif ? "page" : undefined}>
              <m.Ikon size={19} className="ic" aria-hidden="true" /><span>{m.teks}</span>
            </button>
          ))}
          <div className="sidebar-foot">
            <div className="akun"><UserRound size={16} className="ic" /> <div><b>{user.nama}</b><span>{jadiMaster ? "Master" : "@" + user.username}</span></div></div>
            <button className="btn ghost besar" onClick={keluar}><LogOut size={16} /> Keluar</button>
          </div>
        </aside>
        <main className="konten">
          <div className="topbar">
            <div><h2>{judul}</h2><div className="salam">{sub}</div></div>
            <div className="spacer"></div>
            <div className="pill-info"><InfinityIcon size={15} className="ic" aria-hidden="true" /> {CONFIG.tes.length} tes · soal tak terhingga</div>
            <button className="tombol-tema" onClick={ubahTema} title="Ganti tema" aria-label="Ganti tema">{temaGelap ? <Sun size={18} /> : <Moon size={18} />}</button>
            <button className="tombol-tema tombol-keluar" onClick={keluar} title="Keluar" aria-label="Keluar"><LogOut size={18} /></button>
          </div>
          {pesan && <div className="info-pesan" role="status">{pesan} <button className="aksi" onClick={() => setPesan("")} aria-label="Tutup"><X size={14} /></button></div>}
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
        <div className="baris-stat fade-up d1">
          <Stat Ikon={ClipboardList} nilai={<CountUp nilai={agg.n} />} label="Total percobaan" />
          <Stat Ikon={Target} kelas="biru" nilai={<><CountUp nilai={agg.rata} desimal={1} />%</>} label="Skor rata-rata" />
          <Stat Ikon={ChartColumn} kelas="hijau" nilai={<CountUp nilai={agg.topikArr.length} />} label="Topik terlacak" />
          <Stat Ikon={Library} kelas="kuning" nilai={<CountUp nilai={totalSoal} />} label="Soal di bank (+∞ generator)" />
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
    const kelompok = filterKel === "Semua" ? ["Polri", "BUMN"] : [filterKel];
    return kerangka(
      "tes", "Daftar Tes", "Pilih tes, kerjakan dengan timer seperti CAT asli, atau latihan per topik.",
      <>
        <Banner />
        <div className="tabs" role="tablist" aria-label="Filter kelompok tes">
          {["Semua", "Polri", "BUMN"].map((k) => (
            <button key={k} role="tab" aria-selected={filterKel === k} className={filterKel === k ? "aktif" : ""} onClick={() => setFilterKel(k)}>{k}</button>
          ))}
        </div>
        {kelompok.map((kel) => (
          <div key={kel}>
            <h2 className="kelompok-title">
              {kel === "Polri" ? <ShieldCheck size={20} className="ic" style={{ color: "var(--polri)" }} /> : <Building2 size={20} className="ic" style={{ color: "var(--bumn)" }} />}
              {kel === "Polri" ? "Kepolisian (Polri)" : "Badan Usaha Milik Negara (BUMN)"}
            </h2>
            <div className="cards">
              {CONFIG.tes.filter((t) => t.kelompok === kel).map((t, i) => (
                <div className={`card fade-up d${Math.min(i, 5) + 1}`} key={t.id} data-kel={t.kelompok}>
                  <div className="card-kepala">
                    <div className="card-ikon">{kel === "Polri" ? <ShieldCheck size={22} aria-hidden="true" /> : <Building2 size={22} aria-hidden="true" />}</div>
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
        setS({ ...S, revealed: { ...S.revealed, [S.cur]: j } });
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
              <div><button className="btn ghost" onClick={() => gantiHalaman("tes")}><X size={16} /> Selesai latihan</button></div>
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
                <button className="btn primary" onClick={() => setS(S.cur === n - 1 ? { ...S, soal: S.soal.concat(GEN.lagi(topikLatihan(S), 10).map(shuffleOpts)), cur: S.cur + 1 } : { ...S, cur: S.cur + 1 })}>Berikutnya <ChevronRight size={16} /></button>
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
    const lulus = h.pct >= S.tes.passingGrade;
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
                {otomatis ? "Waktu habis — dikumpulkan otomatis. " : ""}{S.tes.durasiMenit} menit · {S.soal.length} soal · passing grade {S.tes.passingGrade}% (perkiraan)
              </div>
              <div style={{ marginTop: 10 }}>
                <span className={`badge ${lulus ? "pass" : "fail"}`}>{lulus ? <CircleCheck size={15} /> : <CircleX size={15} />} {lulus ? "Di atas" : "Di bawah"} passing grade (perkiraan)</span>
              </div>
            </div>
          </div>
        </div>
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
          <button className="btn ghost" onClick={() => gantiHalaman("dashboard")}><ArrowLeft size={16} /> Dashboard</button>{" "}
          <button className="btn" onClick={() => gantiHalaman("tes")}><RotateCcw size={16} /> Coba lagi</button>{" "}
          <button className="btn" onClick={() => gantiHalaman("riwayat")}><History size={16} /> Riwayat</button>
        </p>
      </div>
    );
  }

  // ---------- render utama ----------
  if (user === undefined) return <div className="splash" role="status">Memuat…</div>;
  if (user === null) return <AuthScreen onMasuk={setelahMasuk} temaGelap={temaGelap} ubahTema={ubahTema} />;
  let isi;
  if (hasil) isi = renderHasilLayar();
  else if (S) isi = renderUjian();
  else if (halaman === "tes") isi = renderTes();
  else if (halaman === "panduan-polri") isi = renderPanduan("polri");
  else if (halaman === "panduan-bumn") isi = renderPanduan("bumn");
  else if (halaman === "riwayat") isi = renderRiwayat();
  else if (halaman === "master" && jadiMaster) isi = renderMaster();
  else if (halaman === "master-user" && jadiMaster && masterDetail) isi = renderMasterUser();
  else if (halaman === "tinjau" && tinjau) {
    isi = kerangka(kembaliKe === "master-user" ? "master" : "riwayat", "Tinjau jawaban", "Jawaban, kunci, dan pembahasan setiap soal.",
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
