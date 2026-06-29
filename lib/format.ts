const BM_MONTHS = [
  "Jan", "Feb", "Mac", "Apr", "Mei", "Jun",
  "Jul", "Ogos", "Sep", "Okt", "Nov", "Dis",
];

// "2024-06-28" -> "28 Jun 2024". Returns input unchanged if unparseable.
export function formatDateBM(iso: string): string {
  if (!iso) return "";
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return iso;
  const year = m[1];
  const monthIdx = Number(m[2]) - 1;
  const day = Number(m[3]);
  const month = BM_MONTHS[monthIdx] ?? m[2];
  return `${day} ${month} ${year}`;
}

// Only allow http(s) external links. Blocks javascript:, data:, etc. so a bad
// stored URL can never become a script-executing href. Returns null if unsafe.
export function safeHttpUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  try {
    const u = new URL(trimmed);
    return u.protocol === "http:" || u.protocol === "https:" ? u.href : null;
  } catch {
    return null;
  }
}

// Huruf awalan nama untuk fallback avatar bila tiada gambar (maks 2 huruf).
// Buang gelaran/penghubung lazim (bin, binti, a/l, Hj, Tn...) dahulu.
export function initials(name: string): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter((p) => !/^(bin|binti|bt|a\/l|a\/p|hj|hjh|tn|pn|cik|dr)\.?$/i.test(p));
  const pick = parts.length ? parts : name.trim().split(/\s+/);
  return ((pick[0]?.[0] ?? "") + (pick[1]?.[0] ?? "")).toUpperCase() || "?";
}
