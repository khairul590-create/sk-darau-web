"use client";
import { useEffect, useState } from "react";

export default function EmergencyBanner({
  active,
  text,
}: {
  active: string;
  text: string;
}) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (active !== "true" || !text.trim()) return;
    try {
      if (localStorage.getItem("eb_dismissed") !== text) setShow(true);
    } catch {
      setShow(true);
    }
  }, [active, text]);

  if (!show) return null;

  function dismiss() {
    try {
      localStorage.setItem("eb_dismissed", text);
    } catch {}
    setShow(false);
  }

  return (
    <div className="emergency-banner" role="alert">
      <span>⚠️ {text}</span>
      <button className="eb-close" onClick={dismiss} aria-label="Tutup notis">✕</button>
    </div>
  );
}
