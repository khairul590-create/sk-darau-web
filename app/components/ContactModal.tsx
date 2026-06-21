"use client";

import { useEffect, useState } from "react";

type Status = { type: "ok" | "err"; text: string } | null;

// "Hubungi Kami" button (exact V16 .btn .btn-glass look) that opens a popup
// contact form. The V16 page layout is untouched — the modal is display:none
// until opened.
export default function ContactModal() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<Status>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) {
      document.addEventListener("keydown", onKey);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    const form = e.currentTarget;
    const fd = new FormData(form);
    const payload = {
      name: String(fd.get("name") || "").trim(),
      email: String(fd.get("email") || "").trim(),
      phone: String(fd.get("phone") || "").trim(),
      message: String(fd.get("message") || "").trim(),
      company: String(fd.get("company") || ""), // honeypot — must stay empty
    };
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Gagal hantar mesej.");
      setStatus({
        type: "ok",
        text: "Terima kasih! Mesej anda telah dihantar.",
      });
      form.reset();
    } catch (err) {
      setStatus({
        type: "err",
        text: err instanceof Error ? err.message : "Gagal hantar mesej.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        className="btn btn-glass"
        onClick={() => {
          setStatus(null);
          setOpen(true);
        }}
      >
        Hubungi Kami
      </button>

      {open && (
        <div
          className="cm-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div className="cm-box" role="dialog" aria-modal="true">
            <button
              type="button"
              className="cm-close"
              aria-label="Tutup"
              onClick={() => setOpen(false)}
            >
              ×
            </button>
            <h3>Hubungi Kami</h3>
            <div className="cm-sub">
              Hantar pertanyaan anda — kami akan balas secepat mungkin.
            </div>
            {status && <div className={`form-msg ${status.type}`}>{status.text}</div>}
            <form onSubmit={onSubmit}>
              {/* Honeypot — hidden from humans, bots fill it → rejected */}
              <input
                type="text"
                name="company"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
              />
              <div className="field">
                <label htmlFor="cm-name">Nama Penuh *</label>
                <input id="cm-name" name="name" required maxLength={200} placeholder="Nama anda" />
              </div>
              <div className="field">
                <label htmlFor="cm-email">E-mel *</label>
                <input
                  id="cm-email"
                  name="email"
                  type="email"
                  required
                  maxLength={200}
                  placeholder="emel@contoh.com"
                />
              </div>
              <div className="field">
                <label htmlFor="cm-phone">No. Telefon</label>
                <input id="cm-phone" name="phone" maxLength={50} placeholder="01x-xxx xxxx" />
              </div>
              <div className="field">
                <label htmlFor="cm-msg">Mesej *</label>
                <textarea
                  id="cm-msg"
                  name="message"
                  required
                  maxLength={5000}
                  placeholder="Tulis pertanyaan atau mesej anda di sini..."
                />
              </div>
              <button type="submit" className="btn btn-submit" disabled={loading}>
                {loading ? "Menghantar..." : "Hantar Mesej →"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
