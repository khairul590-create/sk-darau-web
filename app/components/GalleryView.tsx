"use client";

import { useCallback, useEffect, useState } from "react";
import type { GalleryItem } from "@/lib/types";

// Renders the gallery frames (horizontal "track" on home, "grid" on /galeri)
// and an image lightbox. Only frames with an uploaded image open the lightbox;
// emoji-only frames are decorative. Lightbox supports keyboard ← → Esc.
export default function GalleryView({
  items,
  variant = "track",
}: {
  items: GalleryItem[];
  variant?: "track" | "grid";
}) {
  // Lightbox navigates only across frames that actually have an image.
  const photos = items.filter((g) => g.image_url);
  const [active, setActive] = useState<number | null>(null);

  const close = useCallback(() => setActive(null), []);
  const go = useCallback(
    (dir: number) =>
      setActive((i) => (i === null ? i : (i + dir + photos.length) % photos.length)),
    [photos.length]
  );

  useEffect(() => {
    if (active === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [active, close, go]);

  const openFor = (g: GalleryItem) => {
    const idx = photos.findIndex((p) => p.id === g.id);
    if (idx >= 0) setActive(idx);
  };

  const cur = active === null ? null : photos[active];

  return (
    <>
      <div className={variant === "grid" ? "gal-grid" : "gal-track"}>
        {items.map((g) => {
          const clickable = !!g.image_url;
          return (
            <div
              key={g.id}
              className={`gframe${clickable ? " gframe-zoom" : ""}`}
              style={{ background: g.gradient }}
              onClick={clickable ? () => openFor(g) : undefined}
              role={clickable ? "button" : undefined}
              tabIndex={clickable ? 0 : undefined}
              onKeyDown={
                clickable
                  ? (e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        openFor(g);
                      }
                    }
                  : undefined
              }
            >
              {g.image_url ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img className="gf-img" src={g.image_url} alt={g.title} />
              ) : (
                <div className="gf-em">{g.emoji}</div>
              )}
              <div className="gf-ov"></div>
              {clickable && <div className="gf-zoom">🔍</div>}
              <div className="gf-c">
                <span className="gf-tag">{g.tag}</span>
                <div className="gf-t">{g.title}</div>
                <div className="gf-s">{g.subtitle}</div>
              </div>
            </div>
          );
        })}
      </div>

      {cur && (
        <div className="lb-overlay" onClick={(e) => { if (e.target === e.currentTarget) close(); }}>
          <button className="lb-close" aria-label="Tutup" onClick={close}>×</button>
          {photos.length > 1 && (
            <button className="lb-nav lb-prev" aria-label="Sebelum" onClick={() => go(-1)}>‹</button>
          )}
          <figure className="lb-figure">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={cur.image_url!} alt={cur.title} />
            <figcaption className="lb-cap">
              <span className="lb-tag">{cur.tag}</span>
              <div className="lb-title">{cur.title}</div>
              {cur.subtitle && <div className="lb-sub">{cur.subtitle}</div>}
              {photos.length > 1 && (
                <div className="lb-count">{active! + 1} / {photos.length}</div>
              )}
            </figcaption>
          </figure>
          {photos.length > 1 && (
            <button className="lb-nav lb-next" aria-label="Seterusnya" onClick={() => go(1)}>›</button>
          )}
        </div>
      )}
    </>
  );
}
