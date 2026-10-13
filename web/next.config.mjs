const prod = process.env.NODE_ENV === "production";

// CSP hanya di produksi (mode dev Next membutuhkan eval untuk hot reload). 'unsafe-inline' diperlukan
// skrip hidrasi Next dan skrip tema; selebihnya dikunci ke asal sendiri (tidak bisa mengirim data ke luar).
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  async headers() {
    return [{
      source: "/:path*",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ...(prod ? [{ key: "Content-Security-Policy", value: csp }] : []),
      ],
    }, {
      source: "/api/:path*",
      headers: [{ key: "Cache-Control", value: "no-store" }],
    }];
  },
};
export default nextConfig;
