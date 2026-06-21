import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

// Favicon: "SK" white on blue gradient — matches the site's .nav-logo.
export default function Icon() {
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
          fontSize: 16,
          fontWeight: 900,
          borderRadius: 7,
        }}
      >
        SK
      </div>
    ),
    { ...size }
  );
}
