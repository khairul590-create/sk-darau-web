import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// Apple touch icon (home screen) — "SK" on blue gradient.
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg,#3b82f6,#1e3a8a)",
          color: "#fff",
          fontSize: 92,
          fontWeight: 900,
        }}
      >
        SK
      </div>
    ),
    { ...size }
  );
}
