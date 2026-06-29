import Link from "next/link";
import { getWritings } from "@/lib/data";
import { formatDateBM } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Tulisan Guru — SK Darau",
  description: "Penulisan, manuskrip dan kongsian guru-guru Sekolah Kebangsaan Darau.",
};

export default async function TulisanPage() {
  const writings = await getWritings();

  return (
    <div className="dokumen-page">
      <div className="tulisan-inner">
        <Link href="/" className="dokumen-back">← Kembali ke Laman Utama</Link>
        <div className="dokumen-header">
          <h1>✍️ Tulisan Guru</h1>
          <p>Penulisan, manuskrip dan kongsian guru-guru SK Darau.</p>
        </div>

        {writings.length === 0 ? (
          <div className="dokumen-empty">
            <div style={{ fontSize: 48, marginBottom: 12 }}>📝</div>
            <div>Tiada tulisan buat masa ini.</div>
            <div style={{ fontSize: 13, marginTop: 6, color: "#94a3b8" }}>Semak semula kemudian.</div>
          </div>
        ) : (
          <div className="tulisan-grid">
            {writings.map((w) => {
              const inner = (
                <>
                  <div className="tw-media" style={{ background: w.gradient }}>
                    {w.image_url ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img className="tw-img" src={w.image_url} alt={w.title} />
                    ) : (
                      <div className="tw-em">{w.emoji}</div>
                    )}
                    {w.external_url && <div className="tw-go">↗</div>}
                  </div>
                  <div className="tw-body">
                    <div className="tw-title">{w.title}</div>
                    {w.excerpt && <div className="tw-excerpt">{w.excerpt}</div>}
                    <div className="tw-meta">
                      <span className="tw-author">{w.author}</span>
                      <span className="tw-date">{formatDateBM(w.publish_date)}</span>
                    </div>
                  </div>
                </>
              );
              return w.external_url ? (
                <a
                  key={w.id}
                  className="tw-card"
                  href={w.external_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {inner}
                </a>
              ) : (
                <Link key={w.id} className="tw-card" href={`/tulisan/${w.slug}`}>
                  {inner}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
