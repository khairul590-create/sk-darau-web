import { ImageResponse } from "next/og";

export const alt = "Sekolah Kebangsaan Darau — Laman Rasmi";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Share card shown on WhatsApp / Facebook / etc when the link is shared.
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg,#172554 0%,#1e3a8a 55%,#2563eb 100%)",
          color: "#fff",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        <div
          style={{
            width: 150,
            height: 150,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg,#ffffff,#e0ecff)",
            color: "#2563eb",
            fontSize: 64,
            fontWeight: 900,
            borderRadius: 36,
            marginBottom: 36,
            boxShadow: "0 0 0 4px rgba(212,175,55,.6)",
          }}
        >
          SK
        </div>
        <div style={{ fontSize: 30, fontWeight: 800, color: "#e8c860", letterSpacing: 4, marginBottom: 12 }}>
          SEKOLAH KEBANGSAAN · SEJAK 1940
        </div>
        <div style={{ fontSize: 80, fontWeight: 900, letterSpacing: -2, lineHeight: 1 }}>
          Sekolah Kebangsaan Darau
        </div>
        <div style={{ fontSize: 34, color: "rgba(255,255,255,.85)", marginTop: 24 }}>
          Kota Kinabalu, Sabah · Laman Rasmi
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 10,
            background: "linear-gradient(90deg,#d4af37,#e8c860)",
          }}
        />
      </div>
    ),
    { ...size }
  );
}
