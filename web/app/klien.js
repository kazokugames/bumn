// Util klien yang dipakai page.jsx, tryout.jsx, dan belajar.jsx.
import DOMPurify from "dompurify";

export async function api(path, method = "GET", body) {
  const r = await fetch(path, { method, headers: body ? { "content-type": "application/json" } : {}, body: body ? JSON.stringify(body) : undefined });
  let j = null;
  try { j = await r.json(); } catch {}
  if (!r.ok) throw new Error((j && j.galat) || "Terjadi kesalahan. Coba lagi.");
  return j;
}
export const tgl = (t) => new Date(t).toLocaleString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
export const durasiTeks = (d) => `${Math.floor(d / 60)} mnt ${d % 60} dtk`;
// HTML soal yang berasal dari server (bisa dipalsukan oleh user lewat API) wajib dibersihkan sebelum dirender.
export const bersih = (h) => DOMPurify.sanitize(String(h), {
  USE_PROFILES: { html: true, svg: true },
  FORBID_TAGS: ["form", "input", "button", "textarea", "select", "option", "label", "style", "link", "meta", "base", "iframe", "object", "embed", "a", "img", "video", "audio", "source"],
  FORBID_ATTR: ["action", "formaction", "srcset", "href", "xlink:href"],
});
