import type { NextConfig } from "next";
import path from "node:path";

// Security headers applied to every route. These harden against clickjacking,
// MIME sniffing, referrer leakage and force HTTPS. CSP is intentionally
// conservative (only directives that won't break Next/Supabase): it blocks
// framing, plugins and base-tag hijacking while leaving scripts/styles/images
// unrestricted so the site keeps working.
const securityHeaders = [
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "object-src 'none'",
      "base-uri 'self'",
      "frame-ancestors 'none'",
      "form-action 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  // Pin the workspace root to this folder so Turbopack ignores the stray
  // package-lock.json in the home directory (silences the lockfile warning).
  turbopack: {
    root: path.join(__dirname),
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
