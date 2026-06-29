import Link from "next/link";
import { getStaff } from "@/lib/data";
import { initials } from "@/lib/format";
import type { Staff } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Barisan Pentadbir & Guru — SK Darau",
  description: "Warga pendidik Sekolah Kebangsaan Darau — Guru Besar, Penolong Kanan, guru dan staf sokongan.",
};

function StaffAvatar({ s, size }: { s: Staff; size: "lg" | "md" }) {
  return (
    <div className={`wg-avatar wg-avatar-${size}`} style={{ background: s.gradient }}>
      {s.image_url ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img src={s.image_url} alt={s.name} />
      ) : (
        <span className="wg-initials">{initials(s.name)}</span>
      )}
    </div>
  );
}

function StaffCard({ s, featured }: { s: Staff; featured?: boolean }) {
  return (
    <div className={`wg-card${featured ? " wg-card-featured" : ""}`}>
      <StaffAvatar s={s} size={featured ? "lg" : "md"} />
      <div className="wg-name">{s.name}</div>
      {s.position && <div className="wg-position">{s.position}</div>}
      {s.subject && <div className="wg-subject">{s.subject}</div>}
    </div>
  );
}

export default async function GuruPage() {
  const staff = await getStaff();

  const gb = staff.filter((s) => s.category === "gb");
  const pk = staff.filter((s) => s.category === "pk");
  const guru = staff.filter((s) => s.category === "guru");
  const staf = staff.filter((s) => s.category === "staf");

  return (
    <div className="dokumen-page">
      <div className="warga-inner">
        <Link href="/" className="dokumen-back">← Kembali ke Laman Utama</Link>
        <div className="dokumen-header">
          <h1>👥 Barisan Pentadbir & Guru</h1>
          <p>Warga pendidik Sekolah Kebangsaan Darau.</p>
        </div>

        {staff.length === 0 ? (
          <div className="dokumen-empty">
            <div style={{ fontSize: 48, marginBottom: 12 }}>🧑‍🏫</div>
            <div>Maklumat warga belum tersedia.</div>
            <div style={{ fontSize: 13, marginTop: 6, color: "#94a3b8" }}>Semak semula kemudian.</div>
          </div>
        ) : (
          <>
            {gb.length > 0 && (
              <section className="wg-section">
                <div className="wg-featured-row">
                  {gb.map((s) => <StaffCard key={s.id} s={s} featured />)}
                </div>
              </section>
            )}

            {pk.length > 0 && (
              <section className="wg-section">
                <div className="wg-cat-title">Penolong Kanan</div>
                <div className="wg-grid wg-grid-pk">
                  {pk.map((s) => <StaffCard key={s.id} s={s} />)}
                </div>
              </section>
            )}

            {guru.length > 0 && (
              <section className="wg-section">
                <div className="wg-cat-title">Barisan Guru</div>
                <div className="wg-grid">
                  {guru.map((s) => <StaffCard key={s.id} s={s} />)}
                </div>
              </section>
            )}

            {staf.length > 0 && (
              <section className="wg-section">
                <div className="wg-cat-title">Staf Sokongan</div>
                <div className="wg-grid">
                  {staf.map((s) => <StaffCard key={s.id} s={s} />)}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
