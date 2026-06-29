import Link from "next/link";
import { getAchievements } from "@/lib/data";
import { formatDateBM } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Dinding Kejayaan — SK Darau",
  description: "Sorotan pencapaian dan anugerah murid serta guru Sekolah Kebangsaan Darau.",
};

export default async function KejayaanPage() {
  const items = await getAchievements();

  return (
    <div className="dokumen-page">
      <div className="kj-inner">
        <Link href="/" className="dokumen-back">← Kembali ke Laman Utama</Link>
        <div className="dokumen-header">
          <h1>🏆 Dinding Kejayaan</h1>
          <p>Sorotan pencapaian &amp; anugerah warga SK Darau.</p>
        </div>

        {items.length === 0 ? (
          <div className="dokumen-empty">
            <div style={{ fontSize: 48, marginBottom: 12 }}>🏅</div>
            <div>Belum ada kejayaan direkodkan.</div>
            <div style={{ fontSize: 13, marginTop: 6, color: "#94a3b8" }}>Semak semula kemudian.</div>
          </div>
        ) : (
          <div className="kj-grid">
            {items.map((x) => (
              <div key={x.id} className="kj-card">
                <div className="kj-media" style={{ background: x.gradient }}>
                  {x.image_url ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img className="kj-img" src={x.image_url} alt={x.title} />
                  ) : (
                    <div className="kj-emoji">{x.emoji}</div>
                  )}
                  <span className="kj-level">{x.level}</span>
                </div>
                <div className="kj-body">
                  <div className="kj-title">{x.title}</div>
                  {x.recipient && <div className="kj-recipient">🎖️ {x.recipient}</div>}
                  {x.descr && <div className="kj-descr">{x.descr}</div>}
                  <div className="kj-date">{formatDateBM(x.date)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
