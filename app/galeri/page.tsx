import Link from "next/link";
import { getGallery } from "@/lib/data";
import GalleryView from "../components/GalleryView";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Galeri Sekolah — SK Darau",
  description: "Sorotan aktiviti, program dan kejayaan Sekolah Kebangsaan Darau.",
};

export default async function GaleriPage() {
  const gallery = await getGallery();

  return (
    <div className="dokumen-page">
      <div className="galeri-inner">
        <Link href="/" className="dokumen-back">← Kembali ke Laman Utama</Link>
        <div className="dokumen-header">
          <h1>🖼️ Galeri Sekolah</h1>
          <p>Sorotan aktiviti, program dan kejayaan SK Darau. Klik gambar untuk besarkan.</p>
        </div>

        {gallery.length === 0 ? (
          <div className="dokumen-empty">
            <div style={{ fontSize: 48, marginBottom: 12 }}>📷</div>
            <div>Tiada gambar buat masa ini.</div>
          </div>
        ) : (
          <GalleryView items={gallery} variant="grid" />
        )}
      </div>
    </div>
  );
}
