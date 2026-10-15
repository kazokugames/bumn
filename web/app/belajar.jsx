"use client";

// Mode Belajar dari Nol: jalur fondasi, tes diagnosis, kartu konsep, latihan bertingkat/terbimbing, dan ulangan soal salah.
import { useState, useEffect, useCallback, useRef } from "react";
import { BookOpen, Play, Brain, ArrowLeft, RotateCcw, CircleCheck, CircleX, Target, Repeat, Sparkles, Lightbulb, ArrowRight, Timer } from "lucide-react";
import GEN from "../data/gen";
import KONSEP from "../data/konsep";
import { CONFIG } from "../data/config";
import { BANK, shuffleOpts } from "../lib/susun.mjs";
import { api, bersih } from "./klien";

const SEMUA = Object.values(BANK).flat();
const FONDASI = CONFIG.belajar.fondasi;
const huruf = (j) => String.fromCharCode(65 + j);
// Jawaban TKP dianggap "benar" bila bernilai 4–5; soal lain harus sama dengan kunci.
const betul = (s, j) => (s.skor ? s.skor[j] >= 4 : j === s.ans);
// Bentuk baris detail yang dipakai server (sama dengan hasil ujian).
const keServer = (s) => ({ t: s.topik, q: s.q, o: s.opts, a: s.ans, s: s.skor || undefined, b: s.bahas, l: s.langkah || undefined });
const dariServer = (r) => ({ id: r.id, topik: r.topik, q: r.q, opts: r.o, ans: r.a, skor: r.s || null, bahas: r.b, langkah: r.l || null });
// Langkah pengerjaan: dari generator fondasi, atau (bila tidak ada) pembahasan dipecah per kalimat.
const langkahDari = (s) => (s.langkah && s.langkah.length ? s.langkah : String(s.bahas).split(/(?<=[.!?])\s+/).filter(Boolean));

// Satu soal baru untuk topik dan level; menghindari soal yang sudah muncul di sesi ini.
const terjawabAwal = (p) => p !== null;

function ambil(topik, level, sudah) {
  let s;
  for (let i = 0; i < 8; i++) {
    if (GEN.ada(topik)) s = GEN.buat(topik, level);
    else {
      const pool = SEMUA.filter((x) => x.topik === topik), lv = pool.filter((x) => (x.level || 1) === level), p = lv.length ? lv : pool;
      s = p[Math.floor(Math.random() * p.length)];
    }
    if (s && !sudah.has(s.q)) break;
  }
  if (!s) return null;
  sudah.add(s.q);
  return shuffleOpts(s);
}

// Satu sesi soal: soal, petunjuk bertahap, pemeriksaan langsung, langkah pembahasan, lalu lanjut.
// terbimbing(): bila true (latihan fondasi level 1), jawaban salah membuka langkah satu per satu dan soal serupa diulang sampai benar.
function Sesi({ judul, berikut, onJawab, onSelesai, onKonsep, total, terbimbing, batasDetik }) {
  const [soal, setSoal] = useState(null);
  const [pilih, setPilih] = useState(null);
  const [info, setInfo] = useState(null);
  const [no, setNo] = useState(0);
  const [skor, setSkor] = useState({ benar: 0, jumlah: 0 });
  const [galat, setGalat] = useState("");
  const [petunjuk, setPetunjuk] = useState(0); // jumlah langkah yang dibuka lewat tombol Petunjuk
  const [terbuka, setTerbuka] = useState(0); // langkah yang sudah dibuka pada mode terbimbing setelah salah
  const [ulangBenar, setUlangBenar] = useState(false);
  const [sisaDtk, setSisaDtk] = useState(null); // hanya untuk drill kecepatan
  const mulaiSoal = useRef(Date.now());
  const dimulai = useRef(false);
  function lanjut() {
    const s = berikut();
    if (!s) return onSelesai(skor);
    setSoal(s); setPilih(null); setInfo(null); setGalat(""); setPetunjuk(0); setTerbuka(0); setNo((n) => n + 1);
    mulaiSoal.current = Date.now(); setSisaDtk(batasDetik || null);
  }
  useEffect(() => { if (!dimulai.current) { dimulai.current = true; lanjut(); } });
  // drill: hitung mundur per soal; waktu habis dianggap salah (j = -1)
  useEffect(() => {
    if (!batasDetik || !soal || pilih !== null) return;
    const t = setInterval(() => {
      const sisa = Math.ceil(batasDetik - (Date.now() - mulaiSoal.current) / 1000);
      setSisaDtk(Math.max(0, sisa));
      if (sisa <= 0) { clearInterval(t); jawab(-1); }
    }, 250);
    return () => clearInterval(t);
  });
  async function jawab(j) {
    if (pilih !== null) return;
    const detik = (Date.now() - mulaiSoal.current) / 1000, b = j === -1 ? false : betul(soal, j), pakaiBantuan = petunjuk > 0;
    setPilih(j);
    setSkor((x) => ({ benar: x.benar + (b ? 1 : 0), jumlah: x.jumlah + 1 }));
    const bimbing = !!terbimbing && terbimbing() && !pakaiBantuan && soal.langkah;
    if (!b && bimbing) { setTerbuka(1); setUlangBenar(true); }
    if (b && ulangBenar) setUlangBenar(false);
    try { setInfo((await onJawab(soal, j, b, { petunjuk: pakaiBantuan, detik, waktuHabis: j === -1 })) || {}); } catch (e) { setGalat(e.message); setInfo({}); }
  }
  if (!soal) return <div className="kartu"><p className="empty">Menyiapkan soal…</p></div>;
  const terjawab = pilih !== null, benarSaya = terjawab && betul(soal, pilih);
  const langkah = soal.langkah && soal.langkah.length >= 2 ? soal.langkah : null;
  const bimbingAktif = terjawab && !benarSaya && !!terbimbing && terbimbing() && langkah && petunjuk === 0;
  const tahanLanjut = bimbingAktif && terbuka < langkah.length; // semua langkah harus dibaca dulu
  return (
    <div className="exam-shell fade-up">
      <div className="exam-top">
        <div className="baris">
          <div className="exam-info"><b><Brain size={16} className="ic" /> {judul}</b> <span>Soal {no}{total ? "/" + total : ""} · benar {skor.benar} dari {skor.jumlah}</span>{batasDetik && !terjawabAwal(pilih) && <span className="badge" style={{ marginLeft: 8 }}><Timer size={13} /> {sisaDtk} dtk</span>}</div>
          <div><button className="btn ghost" onClick={() => onSelesai(skor)}>Selesai</button></div>
        </div>
      </div>
      <div className="question-box">
        <div className="q-topik">{soal.topik}<span className="stars" title="Tingkat kesulitan">{"★".repeat(soal.level || 1)}{"☆".repeat(3 - (soal.level || 1))}</span></div>
        {soal.topik === "Wawasan Kebangsaan" && !soal.verif && <p className="muted">Soal ini belum dicek ke sumber resmi; cocokkan dengan teks resmi sebelum menghafal.</p>}
        {ulangBenar && !terjawab && <p className="muted"><Lightbulb size={15} className="ic" /> Latihan terbimbing: soal serupa diulang sampai kamu menjawab benar sekali.</p>}
        <div className="q-text" dangerouslySetInnerHTML={{ __html: bersih(soal.q) }} />
        {!terjawab && langkah && !batasDetik && (
          <div style={{ margin: "8px 0" }}>
            {petunjuk > 0 && (
              <ol className="muted" style={{ margin: "0 0 8px" }}>
                {langkah.slice(0, petunjuk).map((l, i) => <li key={i} dangerouslySetInnerHTML={{ __html: bersih(l) }} />)}
              </ol>
            )}
            {petunjuk < langkah.length - 1 && (
              <button className="btn ghost" onClick={() => setPetunjuk(petunjuk + 1)}><Lightbulb size={15} /> Petunjuk ({petunjuk}/{langkah.length - 1})</button>
            )}
            {petunjuk > 0 && <span className="muted"> Jawaban dengan petunjuk tidak menaikkan level.</span>}
          </div>
        )}
        <div className="opts">
          {soal.opts.map((o, j) => {
            let c = "opt";
            if (terjawab) { if (soal.skor ? soal.skor[j] === Math.max(...soal.skor) : j === soal.ans) c += " correct"; else if (j === pilih) c += " wrong"; }
            return (
              <button key={j} className={c} disabled={terjawab} onClick={() => jawab(j)}>
                <span className="opt-letter">{huruf(j)}</span><span dangerouslySetInnerHTML={{ __html: bersih(o) }} />
              </button>
            );
          })}
        </div>
        {terjawab && (
          <div className="bahas">
            <span className={`key${benarSaya ? "" : " salah"}`}>{benarSaya ? <><CircleCheck size={17} className="ic" /> Benar!</> : <><CircleX size={17} className="ic" /> Belum tepat.</>}</span>
            {pilih === -1 ? <>Waktu habis. </> : null}{soal.skor ? (pilih >= 0 ? <> Nilai pilihanmu: <b>{soal.skor[pilih]}/{Math.max(...soal.skor)}</b></> : null) : <> Kunci: <b>{huruf(soal.ans)}</b></>}<br />
            {bimbingAktif ? (
              <>
                <b>Ayo kita kerjakan bersama, langkah demi langkah:</b>
                <ol>{langkah.slice(0, terbuka).map((l, i) => <li key={i} dangerouslySetInnerHTML={{ __html: bersih(l) }} />)}</ol>
                {terbuka < langkah.length && <button className="btn" onClick={() => setTerbuka(terbuka + 1)}><ArrowRight size={15} /> Langkah berikutnya ({terbuka}/{langkah.length})</button>}
                {terbuka >= langkah.length && <p><b>Sekarang coba soal serupa.</b></p>}
              </>
            ) : langkah ? (
              <ol>{langkah.map((l, i) => <li key={i} dangerouslySetInnerHTML={{ __html: bersih(l) }} />)}</ol>
            ) : <span dangerouslySetInnerHTML={{ __html: bersih(soal.bahas) }} />}
            {soal.sumber && <p className="muted">Sumber: {soal.sumber}</p>}
            {info && info.naik && <p><b><Sparkles size={15} className="ic" /> Naik ke level {info.level}!</b></p>}
            {info && info.dikuasai === 1 && info.riwayat === "" && !info.turun && !info.naik && !info.petunjuk && <p><b><Sparkles size={15} className="ic" /> Topik ini sudah kamu kuasai. Terus latih supaya tidak lupa.</b></p>}
            {info && info.turun && <p><b>Tiga salah beruntun.</b> Yuk baca kartu konsepnya dulu.</p>}
            {info && info.pesan && <p className="muted">{info.pesan}</p>}
            {galat && <p className="muted">Kemajuan belum tersimpan ({galat}).</p>}
          </div>
        )}
      </div>
      <div className="exam-nav">
        {terjawab && info && info.turun && onKonsep && <button className="btn" onClick={onKonsep}><BookOpen size={16} /> Buka kartu konsep</button>}
        <button className="btn primary" disabled={!terjawab || !info || tahanLanjut} onClick={lanjut}>Berikutnya</button>
      </div>
    </div>
  );
}

// Contoh soal dengan langkah yang dibuka satu per satu.
function ContohBerlangkah({ topik }) {
  const [s, setS] = useState(null);
  const [buka, setBuka] = useState(0);
  const baru = useCallback(() => { setS(ambil(topik, 1, new Set())); setBuka(0); }, [topik]);
  useEffect(() => { baru(); }, [baru]);
  if (!s) return null;
  const langkah = langkahDari(s);
  return (
    <div className="kartu" style={{ background: "var(--surface-2, transparent)", marginTop: 12 }}>
      <h4 style={{ margin: "0 0 6px" }}><Lightbulb size={16} className="ic" /> Contoh berlangkah</h4>
      <div className="q-text" dangerouslySetInnerHTML={{ __html: bersih(s.q) }} />
      <ol>{langkah.slice(0, buka).map((l, i) => <li key={i} dangerouslySetInnerHTML={{ __html: bersih(l) }} />)}</ol>
      {buka < langkah.length
        ? <button className="btn" onClick={() => setBuka(buka + 1)}><ArrowRight size={15} /> {buka === 0 ? "Lihat langkah pertama" : "Langkah berikutnya"} ({buka}/{langkah.length})</button>
        : <p><b>Jawaban: {s.opts[s.ans]}</b> </p>}
      {" "}<button className="btn ghost" onClick={baru}><RotateCcw size={15} /> Contoh lain</button>
    </div>
  );
}

function KartuKonsep({ topik, status, onLatihan, onKembali }) {
  const k = KONSEP[topik];
  const prasyarat = ((k && k.prasyarat) || []).filter((t) => status[t] && !status[t].dikuasai);
  return (
    <div className="fade-up">
      <p><button className="btn ghost" onClick={onKembali}><ArrowLeft size={16} /> Kembali</button></p>
      <div className="kartu">
        <h3 className="kartu-judul"><BookOpen size={18} className="ic" /> {topik}</h3>
        {prasyarat.length > 0 && <div className="info-pesan" role="note">Disarankan kuasai dulu: <b>{prasyarat.join(", ")}</b>. Ini saran, kamu tetap boleh lanjut.</div>}
        {k ? (
          <>
            <p dangerouslySetInnerHTML={{ __html: k.ringkas }} />
            {(k.uraian || []).map((u, i) => (
              <div key={i}><h4>{u.judul}</h4><div dangerouslySetInnerHTML={{ __html: u.isi }} /></div>
            ))}
            {k.langkah && <><h4>Cara mengerjakan</h4><ol>{k.langkah.map((l, i) => <li key={i} dangerouslySetInnerHTML={{ __html: l }} />)}</ol></>}
            {k.kesalahan && <><h4>Kesalahan yang sering terjadi</h4><ul>{k.kesalahan.map((l, i) => <li key={i} dangerouslySetInnerHTML={{ __html: l }} />)}</ul></>}
            {k.tips && <><h4>Tips</h4><ul>{k.tips.map((l, i) => <li key={i} dangerouslySetInnerHTML={{ __html: l }} />)}</ul></>}
            {k.contoh && k.contoh.length > 0 && <h4>Contoh</h4>}
            {(k.contoh || []).map((c, i) => (
              <details key={i} style={{ margin: "8px 0" }}>
                <summary><b>{c.q}</b></summary>
                <p style={{ margin: "6px 0 0" }}>Jawaban: <b>{c.a}</b><br /><span className="muted">{c.bahas}</span></p>
              </details>
            ))}
          </>
        ) : <p className="empty">Kartu konsep untuk topik ini belum tersedia.</p>}
        {GEN.ada(topik) && <ContohBerlangkah topik={topik} />}
        <p style={{ marginTop: 14 }}><button className="btn primary" onClick={onLatihan}><Play size={16} /> Mulai latihan</button></p>
      </div>
    </div>
  );
}

function TabelTopik({ judul, daftar, status, onKonsep, onLatihan }) {
  return (
    <div className="kartu fade-up" style={{ marginTop: 16 }}>
      <h3 className="kartu-judul"><BookOpen size={18} className="ic" /> {judul}</h3>
      <div className="tabel-wrap"><table className="data">
        <thead><tr><th>Topik</th><th>Level</th><th>Status</th><th></th></tr></thead>
        <tbody>
          {daftar.map((t) => {
            const belum = ((KONSEP[t.topik] && KONSEP[t.topik].prasyarat) || []).filter((p) => status[p] && !status[p].dikuasai);
            return (
              <tr key={t.topik}>
                <td><b>{t.topik}</b>{belum.length > 0 && <div className="muted">Disarankan dulu: {belum.join(", ")}</div>}</td>
                <td>{t.level}/3</td>
                <td><span className={`badge ${t.dikuasai ? "pass" : ""}`}>{t.dikuasai ? "Dikuasai" : t.mulai ? "Belajar" : "Belum mulai"}</span></td>
                <td style={{ whiteSpace: "nowrap" }}>
                  <button className="btn" onClick={() => onKonsep(t.topik)}><BookOpen size={15} /> Konsep</button>{" "}
                  <button className="btn primary" onClick={() => onLatihan(t.topik)}><Play size={15} /> Latihan</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table></div>
    </div>
  );
}

export default function Belajar({ terkunci, awal }) {
  const [data, setData] = useState(null);
  const [tampil, setTampil] = useState({ p: "home" });
  const [galat, setGalat] = useState("");
  const [ringkasan, setRingkasan] = useState(null);
  const sudah = useRef(new Set());
  const levelRef = useRef(1);
  const antrean = useRef([]);
  const hasilDiag = useRef([]);
  const totalDiag = useRef(0);
  const waktuDrill = useRef([]);
  const awalDiproses = useRef(null);
  const [cfgDrill, setCfgDrill] = useState({ topik: "TIU Numerik", batas: 60 });
  const [riwayatDrill, setRiwayatDrill] = useState([]);
  const muat = useCallback(() => {
    api("/api/belajar").then(setData).catch((e) => setGalat(e.message));
    api("/api/belajar/drill").then((r) => setRiwayatDrill(r.drill)).catch(() => {});
  }, []);
  useEffect(() => { muat(); }, [muat]);
  // pintasan dari luar (dashboard / hasil ujian): { jenis: "ulang" | "remedial", topik?, k }
  useEffect(() => {
    if (!data || !awal || awalDiproses.current === awal.k) return;
    awalDiproses.current = awal.k;
    if (awal.jenis === "ulang") mulaiUlang();
    else if (awal.jenis === "remedial") mulaiRemedial(awal.topik || []);
  });
  const kembali = () => { setTampil({ p: "home" }); setRingkasan(null); muat(); };

  if (terkunci) return <div className="kartu"><p className="empty">Fitur belajar terkunci karena masa aktif akunmu habis. Masukkan kode aktivasi di bagian atas halaman.</p></div>;
  if (!data) return <div className="kartu">{galat ? <div className="galat" role="alert">{galat}</div> : <p className="empty">Memuat…</p>}</div>;

  const barisTopik = (t) => data.topik.find((x) => x.topik === t);
  const status = Object.fromEntries(data.topik.map((t) => [t.topik, t]));

  // ---- latihan satu topik ----
  if (tampil.p === "konsep") return <KartuKonsep topik={tampil.topik} status={status} onKembali={kembali} onLatihan={() => mulaiLatihan(tampil.topik)} />;
  if (tampil.p === "latihan") {
    const t = tampil.topik;
    return <Sesi key={tampil.k} judul={`Latihan ${t}`} berikut={() => ambil(t, levelRef.current, sudah.current)}
      terbimbing={() => FONDASI.includes(t) && levelRef.current === 1}
      onKonsep={() => setTampil({ p: "konsep", topik: t })} onSelesai={kembali}
      onJawab={async (s, j, b, opsi) => {
        const r = await api("/api/belajar/jawab", "POST", { topik: t, benar: b, ...(opsi && opsi.petunjuk ? { petunjuk: true } : {}), ...(b ? {} : { soal: keServer(s) }) });
        levelRef.current = r.level;
        return r;
      }} />;
  }
  // ---- tes diagnosis: 2 soal (level 1 dan 2) per topik ----
  if (tampil.p === "diagnosis") {
    return <Sesi key="diag" judul="Tes diagnosis" total={totalDiag.current}
      berikut={() => antrean.current.shift() || null}
      onSelesai={async () => {
        const per = {};
        hasilDiag.current.forEach((h) => { const d = (per[h.topik] = per[h.topik] || { topik: h.topik, benar: 0, salah: [], jawab: 0 }); d.jawab++; if (h.benar) d.benar++; else d.salah.push(keServer(h.soal)); });
        const hasil = Object.values(per);
        if (hasil.length) {
          try { await api("/api/belajar/diagnosis", "POST", { hasil: hasil.map(({ topik, benar, salah }) => ({ topik, benar, salah })) }); } catch (e) { setGalat(e.message); }
        }
        setRingkasan(hasil);
        setTampil({ p: "hasil-diagnosis" });
      }}
      onJawab={async (s, _j, b) => { hasilDiag.current.push({ topik: s.topik, benar: b, soal: s }); return {}; }} />;
  }
  if (tampil.p === "hasil-diagnosis") {
    return (
      <div className="kartu fade-up">
        <h3 className="kartu-judul"><Target size={18} className="ic" /> Hasil tes diagnosis</h3>
        {galat && <div className="galat" role="alert">{galat}</div>}
        <div className="tabel-wrap"><table className="data">
          <thead><tr><th>Topik</th><th>Benar</th><th>Mulai dari</th></tr></thead>
          <tbody>{(ringkasan || []).map((h) => <tr key={h.topik}><td>{h.topik}</td><td>{h.benar}/{h.jawab}</td><td>{h.benar >= 2 ? "Level 2" : "Level 1 (dasar)"}</td></tr>)}</tbody>
        </table></div>
        <p className="muted">Soal yang salah sudah masuk antrean ulangan. Mulailah dari topik fondasi yang masih lemah.</p>
        <p><button className="btn primary" onClick={kembali}>Lihat rencana belajar</button></p>
      </div>
    );
  }
  // ---- drill kecepatan: soal ketat per waktu, tercatat rata-rata detik ----
  if (tampil.p === "drill") {
    const { topik: tp, batas } = tampil;
    return <Sesi key={tampil.k} judul={`Drill kecepatan: ${tp} (${batas} dtk/soal)`} total={tampil.jumlah} batasDetik={batas}
      berikut={() => antrean.current.shift() || null}
      onJawab={async (sl, _j, b, opsi) => {
        waktuDrill.current.push({ detik: opsi.detik, benar: b, lewat: opsi.waktuHabis || opsi.detik > batas });
        // salah masuk antrean ulangan tanpa mengubah level (jalur "petunjuk")
        try { await api("/api/belajar/jawab", "POST", { topik: tp, benar: b, petunjuk: true, ...(b ? {} : { soal: keServer(sl) }) }); } catch { /* kemajuan tetap tercatat di drill */ }
        return { pesan: `${opsi.detik.toFixed(1)} detik${opsi.detik > batas ? " (melewati batas)" : ""}` };
      }}
      onSelesai={async () => {
        const w = waktuDrill.current, n = w.length;
        if (!n) return kembali();
        const ringkas = { topik: tp, jumlah: n, benar: w.filter((x) => x.benar).length, rataDetik: w.reduce((a, x) => a + x.detik, 0) / n, batasDetik: batas, lewatBatas: w.filter((x) => x.lewat).length };
        try { await api("/api/belajar/drill", "POST", ringkas); } catch (e) { setGalat(e.message); }
        setRingkasan(ringkas);
        setTampil({ p: "hasil-drill" });
      }} />;
  }
  if (tampil.p === "hasil-drill" && ringkasan) {
    return (
      <div className="kartu fade-up">
        <h3 className="kartu-judul"><Timer size={18} className="ic" /> Hasil drill kecepatan: {ringkasan.topik}</h3>
        <p><b>{ringkasan.benar}/{ringkasan.jumlah} benar</b> · rata-rata <b>{ringkasan.rataDetik.toFixed(1)} detik</b> per soal (batas {ringkasan.batasDetik} dtk) · {ringkasan.lewatBatas} soal melewati batas</p>
        <p className="muted">{ringkasan.lewatBatas === 0 && ringkasan.benar === ringkasan.jumlah ? "Sempurna. Turunkan batas waktu 10 detik pada drill berikutnya." : ringkasan.benar < ringkasan.jumlah ? "Akurasi dulu: benahi soal yang salah (sudah masuk antrean ulangan), baru kejar kecepatan." : "Akurasimu bagus; kejar kecepatan dengan batas waktu yang sedikit lebih ketat."}</p>
        <p><button className="btn primary" onClick={kembali}>Kembali</button></p>
      </div>
    );
  }
  // ---- remedial: perbaiki topik yang lemah pada ujian terakhir ----
  if (tampil.p === "remedial") {
    const milik = new Set(data.topik.map((x) => x.topik));
    return <Sesi key={tampil.k} judul="Perbaiki kekurangan" total={tampil.jumlah} berikut={() => antrean.current.shift() || null} onSelesai={kembali}
      onJawab={async (sl, _j, b) => (milik.has(sl.topik)
        ? api("/api/belajar/jawab", "POST", { topik: sl.topik, benar: b, ...(b ? {} : { soal: keServer(sl) }) }).catch(() => ({}))
        : {})} />;
  }
  // ---- ulangan soal salah ----
  if (tampil.p === "ulang") {
    return <Sesi key="ulang" judul="Ulangan soal yang pernah salah" total={tampil.soal.length}
      berikut={() => antrean.current.shift() || null} onSelesai={kembali}
      onJawab={async (s, _j, b) => {
        const r = await api("/api/belajar/ulang", "POST", { id: s.id, benar: b });
        return { pesan: r.lulus ? "Soal ini sudah kamu kuasai (3× benar) dan keluar dari antrean ulangan." : b ? `Bagus. Soal ini muncul lagi ${r.jedaHari} hari lagi.` : "Soal ini muncul lagi besok." };
      }} />;
  }

  function mulaiLatihan(t) {
    sudah.current = new Set();
    levelRef.current = barisTopik(t).level;
    setTampil({ p: "latihan", topik: t, level: levelRef.current, k: Date.now() });
  }
  function mulaiDiagnosis() {
    sudah.current = new Set();
    hasilDiag.current = [];
    antrean.current = data.topik.flatMap((x) => [ambil(x.topik, 1, sudah.current), ambil(x.topik, 2, sudah.current)]).filter(Boolean);
    totalDiag.current = antrean.current.length;
    setTampil({ p: "diagnosis" });
  }
  function mulaiDrill() {
    sudah.current = new Set();
    waktuDrill.current = [];
    const { topik, batas } = cfgDrill;
    antrean.current = Array.from({ length: 10 }, (_, i) => ambil(topik, i < 3 ? 1 : i < 8 ? 2 : 3, sudah.current)).filter(Boolean);
    setTampil({ p: "drill", topik, batas: Number(batas), jumlah: antrean.current.length, k: Date.now() });
  }
  function mulaiRemedial(topiks) {
    const daftar = topiks.length ? topiks : data.topik.filter((x) => !x.dikuasai).slice(0, 3).map((x) => x.topik);
    sudah.current = new Set();
    antrean.current = Array.from({ length: 10 }, (_, i) => ambil(daftar[i % daftar.length], 2, sudah.current)).filter(Boolean);
    if (!antrean.current.length) return kembali();
    setTampil({ p: "remedial", jumlah: antrean.current.length, k: Date.now() });
  }
  async function mulaiUlang() {
    try {
      const r = await api("/api/belajar/ulang");
      antrean.current = r.soal.map(dariServer);
      if (!antrean.current.length) return muat();
      setTampil({ p: "ulang", soal: antrean.current.slice() });
    } catch (e) { setGalat(e.message); }
  }

  const belumMulai = data.topik.every((t) => !t.mulai);
  // urutan jalur: fondasi dulu, lalu SKD; "lanjut" = topik pertama yang belum dikuasai
  const fokus = data.topik.find((t) => !t.dikuasai);
  const dikuasai = data.topik.filter((t) => t.dikuasai).length;
  const fond = data.topik.filter((t) => FONDASI.includes(t.topik)), skd = data.topik.filter((t) => !FONDASI.includes(t.topik));
  return (
    <>
      {galat && <div className="galat" role="alert">{galat}</div>}
      <div className="kartu fade-up">
        <h3 className="kartu-judul"><Target size={18} className="ic" /> Rencana hari ini</h3>
        <p className="muted">{dikuasai} dari {data.topik.length} topik sudah dikuasai ({fond.filter((t) => t.dikuasai).length}/{fond.length} fondasi, {skd.filter((t) => t.dikuasai).length}/{skd.length} SKD).</p>
        <div className="hero-aksi" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {belumMulai && <button className="btn primary" onClick={mulaiDiagnosis}><Brain size={16} /> Mulai dengan tes diagnosis (±{data.topik.length * 2} soal)</button>}
          <button className="btn" disabled={!data.jatuhTempo} onClick={mulaiUlang}><Repeat size={16} /> Ulangan: {data.jatuhTempo} soal jatuh tempo{data.totalUlang > data.jatuhTempo ? ` (${data.totalUlang} dalam antrean)` : ""}</button>
          {fokus && !belumMulai && <button className="btn primary" onClick={() => setTampil({ p: "konsep", topik: fokus.topik })}><Play size={16} /> Lanjut: {fokus.topik}</button>}
          {!belumMulai && <button className="btn ghost" onClick={mulaiDiagnosis}><RotateCcw size={16} /> Ulangi tes diagnosis</button>}
        </div>
        <p className="muted" style={{ marginTop: 10 }}>Naik level setelah 4 dari 5 jawaban terakhir benar. Tiga salah beruntun mengembalikanmu ke kartu konsep. Jawaban dengan petunjuk tidak dihitung untuk naik level.</p>
      </div>
      <div className="kartu fade-up" style={{ marginTop: 16 }}>
        <h3 className="kartu-judul"><Timer size={18} className="ic" /> Drill kecepatan</h3>
        <p className="muted">Di TIU asli waktunya sekitar 1 menit per soal. Kerjakan 10 soal dengan batas waktu per soal; waktu habis dianggap salah dan rata-rata detikmu dicatat.</p>
        <div className="filter-row">
          <select value={cfgDrill.topik} onChange={(e) => setCfgDrill({ ...cfgDrill, topik: e.target.value })} aria-label="Topik drill">
            {data.topik.filter((t) => GEN.ada(t.topik)).map((t) => <option key={t.topik} value={t.topik}>{t.topik}</option>)}
          </select>
          <select value={cfgDrill.batas} onChange={(e) => setCfgDrill({ ...cfgDrill, batas: e.target.value })} aria-label="Batas waktu per soal">
            {[30, 45, 60, 90].map((d) => <option key={d} value={d}>{d} detik per soal</option>)}
          </select>
          <button className="btn primary" onClick={mulaiDrill}><Timer size={16} /> Mulai drill</button>
        </div>
        {riwayatDrill.length > 0 && (
          <div className="tabel-wrap"><table className="data">
            <thead><tr><th>Topik</th><th>Benar</th><th>Rata-rata</th><th>Batas</th><th>Melewati batas</th></tr></thead>
            <tbody>{riwayatDrill.slice(0, 5).map((d, i) => <tr key={i}><td>{d.topik}</td><td>{d.benar}/{d.jumlah}</td><td>{d.rataDetik} dtk</td><td>{d.batasDetik} dtk</td><td>{d.lewatBatas}</td></tr>)}</tbody>
          </table></div>
        )}
      </div>
      <TabelTopik judul="Jalur 1: Fondasi (mulai dari sini bila masih bingung dasar)" daftar={fond} status={status} onKonsep={(t) => setTampil({ p: "konsep", topik: t })} onLatihan={mulaiLatihan} />
      <TabelTopik judul="Jalur 2: Topik SKD" daftar={skd} status={status} onKonsep={(t) => setTampil({ p: "konsep", topik: t })} onLatihan={mulaiLatihan} />
    </>
  );
}
