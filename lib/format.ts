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
