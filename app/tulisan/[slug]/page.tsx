import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getWritingBySlug } from "@/lib/data";
import { formatDateBM } from "@/lib/format";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const w = await getWritingBySlug(slug);
  if (!w) return { title: "Tulisan tidak dijumpai — SK Darau" };
  return {
    title: `${w.title} — SK Darau`,
    description: w.excerpt || `Tulisan oleh ${w.author}.`,
  };
}

export default async function TulisanArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const w = await getWritingBySlug(slug);
  if (!w) notFound();

  // Pecah kandungan ikut baris kosong jadi perenggan.
  const paragraphs = w.content
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <div className="dokumen-page">
      <article className="artikel-inner">
        <Link href="/tulisan" className="dokumen-back">← Kembali ke Tulisan</Link>

        {w.image_url && (
          <div className="artikel-hero" style={{ background: w.gradient }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={w.image_url} alt={w.title} />
          </div>
        )}

        <h1 className="artikel-title">{w.title}</h1>
        <div className="artikel-meta">
          <span>✍️ {w.author}</span>
          <span>· {formatDateBM(w.publish_date)}</span>
        </div>

        <div className="artikel-body">
          {paragraphs.length === 0 ? (
            <p style={{ color: "var(--muted)" }}>Tiada kandungan.</p>
          ) : (
            paragraphs.map((p, i) => (
              <p key={i}>
                {p.split("\n").map((line, j, arr) => (
                  <span key={j}>
                    {line}
                    {j < arr.length - 1 && <br />}
                  </span>
                ))}
              </p>
            ))
          )}
        </div>
      </article>
    </div>
  );
}
