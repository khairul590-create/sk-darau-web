import type { MetadataRoute } from "next";
import { SITE_NAME } from "@/lib/site";

// PWA manifest — makes the site installable ("Add to Home Screen") and gives
// it an app shell when launched. Served at /manifest.webmanifest.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: "SK Darau",
    description: "Laman rasmi Sekolah Kebangsaan Darau — makluman, galeri, kejayaan & guru.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#1e3a8a",
    lang: "ms",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
