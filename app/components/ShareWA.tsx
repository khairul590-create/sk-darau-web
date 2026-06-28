"use client";

// "Kongsi WhatsApp" button. Opens WhatsApp with pre-filled text so staff/parents
// can forward an announcement or event to their groups in one tap.
export default function ShareWA({ text }: { text: string }) {
  const href = `https://wa.me/?text=${encodeURIComponent(text)}`;
  return (
    <a
      className="wa-share"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Kongsi ke WhatsApp"
      onClick={(e) => e.stopPropagation()}
    >
      <span aria-hidden="true">📲</span> Kongsi
    </a>
  );
}
