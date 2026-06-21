import Link from "next/link";
import { getDocuments } from "@/lib/data";
import type { SchoolDocument } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Muat Turun Dokumen — SK Darau",
  description: "Senarai pekeliling, borang dan notis rasmi Sekolah Kebangsaan Darau.",
};

function emoji(cat: string) {
  if (cat === "Borang") return "📋";
  if (cat === "Notis") return "📌";
  if (cat === "Laporan") return "📊";
  return "📄";
}

function groupByCategory(docs: SchoolDocument[]) {
  const map = new Map<string, SchoolDocument[]>();
  for (const d of docs) {
    const arr = map.get(d.category) ?? [];
    arr.push(d);
    map.set(d.category, arr);
  }
  return map;
}

export default async function DokumenPage() {
  const docs = await getDocuments();
  const groups = groupByCategory(docs);

  return (
    <div className="dokumen-page">
      <div className="dokumen-inner">
        <Link href="/" className="dokumen-back">← Kembali ke Laman Utama</Link>
        <div className="dokumen-header">
          <h1>📥 Muat Turun Dokumen</h1>
          <p>Pekeliling, borang dan notis rasmi Sekolah Kebangsaan Darau.</p>
        </div>

        {docs.length === 0 ? (
          <div className="dokumen-empty">
            <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
            <div>Tiada dokumen buat masa ini.</div>
            <div style={{ fontSize: 13, marginTop: 6, color: "#94a3b8" }}>Semak semula kemudian atau hubungi sekolah.</div>
          </div>
        ) : (
          Array.from(groups.entries()).map(([cat, items]) => (
            <div key={cat} className="dokumen-group">
              <div className="dokumen-group-title">{cat}</div>
              {items.map((d) => (
                <a
                  key={d.id}
                  href={d.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="dokumen-item"
                >
                  <div className="dokumen-icon">{emoji(d.category)}</div>
                  <div className="dokumen-info">
                    <div className="dokumen-title">{d.title}</div>
                    <div className="dokumen-cat">{d.category}</div>
                  </div>
                  <div className="dokumen-dl">↓ Muat Turun</div>
                </a>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
