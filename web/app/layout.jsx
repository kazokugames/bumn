import "@fontsource-variable/plus-jakarta-sans";
import "@fontsource-variable/inter";
import "./globals.css";

export const metadata = {
  title: "Simulasi Tes Polri & BUMN",
  description: "Sistem simulasi tes CAT untuk persiapan seleksi Akpol, SIPSS, dan Rekrutmen Bersama BUMN — soal latihan orisinal dengan timer, pembahasan, dan analisis progres.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f5fb" },
    { media: "(prefers-color-scheme: dark)", color: "#12131f" },
  ],
};

// Pasang tema sebelum render pertama agar tidak berkedip (simpanan pengguna, lalu preferensi sistem).
const initTema = `try{var t=localStorage.getItem("tema");if(!t&&matchMedia("(prefers-color-scheme: dark)").matches)t="gelap";document.documentElement.dataset.tema=t==="gelap"?"gelap":"terang"}catch(e){}`;

export default function RootLayout({ children }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: initTema }} /></head>
      <body>{children}</body>
    </html>
  );
}
