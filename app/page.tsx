import SiteScripts from "./components/SiteScripts";
import ContactModal from "./components/ContactModal";
import {
  getAnnouncements,
  getGallery,
  getPortalLinks,
  getSettings,
} from "@/lib/data";
import { KPM_LINKS } from "@/lib/fallback";
import { formatDateBM } from "@/lib/format";
import type { Announcement } from "@/lib/types";

// Always render fresh so admin edits show up immediately.
export const dynamic = "force-dynamic";

export default async function Home() {
  const [settings, portal, gallery, announcements] = await Promise.all([
    getSettings(),
    getPortalLinks(),
    getGallery(),
    getAnnouncements(),
  ]);

  const ibuBapa = announcements.filter((a) => a.audience === "ibu_bapa");
  const awam = announcements.filter((a) => a.audience === "awam");

  return (
    <>
      {/* NAV */}
      <nav className="nav" id="nav">
        <div className="nav-inner">
          <div className="nav-brand">
            <div className="nav-logo">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-sekolah.jpg" alt="Jata SK Darau" className="brand-img" />
            </div>
            <div>
              <div className="nav-name">SK Darau</div>
              <div className="nav-sub">KOTA KINABALU</div>
            </div>
          </div>
          <div className="nav-links" id="navLinks">
            <a href="#utama" className="active">Utama</a>
            <a href="#akses">Portal</a>
            <a href="#galeri">Galeri</a>
            <a href="#makluman">Makluman</a>
            <a href="#hubungi">Hubungi</a>
          </div>
          <button className="nav-burger" id="burger" aria-label="Menu">
            <span></span><span></span><span></span>
          </button>
        </div>
      </nav>

      {/* HERO */}
      <header className="hero" id="utama">
        <div className="aurora au1"></div>
        <div className="aurora au2"></div>
        <div className="aurora au3"></div>
        <div className="hero-stars"></div>
        <div className="hero-inner">
          <div className="hero-pill"><span className="d"></span> SEKOLAH KEBANGSAAN · SEJAK 1940</div>
          <div className="hero-logo">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-sekolah.jpg" alt="Jata SK Darau" className="brand-img" />
          </div>
          <h1>Sekolah Kebangsaan<br /><span className="shine">Darau</span></h1>
          <p className="tag">&quot;Strive to Excellence: Where Every Challenge is an Opportunity to Shine.&quot;</p>
          <p className="addr">📍 Kota Kinabalu, Sabah · ☎️ {settings.school_phone}</p>
          <div className="hero-cta">
            <a href="#akses" className="btn btn-gold">Akses Portal →</a>
            <ContactModal />
          </div>
        </div>
        <div className="scroll-ind">SKROL<div className="arrow">↓</div></div>
      </header>

      {/* STATS */}
      <section className="section" style={{ paddingBottom: 20 }}>
        <div className="stats">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={`stat reveal${i > 1 ? ` d${i - 1}` : ""}`}>
              <div className="num">{settings[`stat_${i}_num`]}</div>
              <div className="lbl">{settings[`stat_${i}_lbl`]}</div>
            </div>
          ))}
        </div>
      </section>

      {/* PORTAL CARDS */}
      <section className="section" id="akses" style={{ paddingTop: 14 }}>
        <div className="sec-head reveal">
          <div className="sec-kicker">Capaian Pantas</div>
          <h2 className="sec-title">Portal <span className="g">Sekolah</span></h2>
        </div>
        <div className="portal-grid">
          {portal.map((p, i) => {
            const cls = `pcard reveal${i > 0 ? ` d${i}` : ""}`;
            const inner = (
              <>
                <div className="pc-aura"></div>
                <div className="pc-go">↗</div>
                <div className="pc-ic">{p.icon}</div>
                <div className="pc-t">{p.title}</div>
                <div className="pc-d">{p.descr}</div>
              </>
            );
            return p.url ? (
              <a
                key={p.id}
                className={cls}
                style={{ background: p.gradient }}
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {inner}
              </a>
            ) : (
              <div
                key={p.id}
                className={cls}
                style={{ background: p.gradient }}
                title="Pautan akan dikemaskini"
              >
                {inner}
              </div>
            );
          })}
        </div>
      </section>

      {/* GALLERY */}
      <div className="gal-wrap" id="galeri">
        <div className="g-aurora"></div>
        <div className="gal-head reveal">
          <div className="sec-kicker">Sorotan Aktiviti</div>
          <h2 className="sec-title">Galeri Sekolah</h2>
        </div>
        <div className="gal-track">
          {gallery.map((g) => (
            <div key={g.id} className="gframe" style={{ background: g.gradient }}>
              {g.image_url ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img className="gf-img" src={g.image_url} alt={g.title} />
              ) : (
                <div className="gf-em">{g.emoji}</div>
              )}
              <div className="gf-ov"></div>
              <div className="gf-c">
                <span className="gf-tag">{g.tag}</span>
                <div className="gf-t">{g.title}</div>
                <div className="gf-s">{g.subtitle}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="gal-hint">← Seret untuk lihat lebih banyak →</div>
      </div>

      {/* ANNOUNCEMENTS */}
      <section className="section" id="makluman">
        <div className="sec-head reveal">
          <div className="sec-kicker">Hebahan Rasmi</div>
          <h2 className="sec-title">Makluman <span className="g">Terkini</span></h2>
        </div>
        <div className="ann-grid">
          <AnnCard title="📢 Makluman Ibu Bapa" items={ibuBapa} />
          <AnnCard title="📣 Makluman Awam" items={awam} reveal="d1" />
        </div>

        <div className="sec-head reveal" style={{ marginTop: 56 }}>
          <div className="sec-kicker">Sistem Rasmi</div>
          <h2 className="sec-title" style={{ fontSize: "clamp(22px,4.5vw,30px)" }}>
            Portal & <span className="g">Sistem KPM</span>
          </h2>
        </div>
        <div className="link-grid reveal">
          {KPM_LINKS.map((l) => (
            <a key={l.label} className="link-item" href={l.url} target="_blank" rel="noopener noreferrer">
              <span className="le">{l.emoji}</span>{l.label}
            </a>
          ))}
        </div>
      </section>

      {/* FOOTER (id=hubungi — sebiji V16) */}
      <footer className="footer" id="hubungi">
        <div className="f-aurora"></div>
        <div className="footer-logo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-sekolah.jpg" alt="Jata SK Darau" className="brand-img" />
        </div>
        <div className="footer-name">SEKOLAH KEBANGSAAN DARAU</div>
        <div className="footer-info">
          📍 {settings.school_address}<br />
          ☎️ Tel / Faks: {settings.school_phone}<br />
          📧 {settings.school_email}<br />
          🕐 {settings.school_hours}
        </div>
        <div className="footer-div"></div>
        <div className="footer-copy">Hak Cipta Terpelihara © 2024 SK Darau Kota Kinabalu</div>
      </footer>

      <SiteScripts />
    </>
  );
}

function AnnCard({
  title,
  items,
  reveal = "",
}: {
  title: string;
  items: Announcement[];
  reveal?: string;
}) {
  return (
    <div className={`ann-card reveal${reveal ? ` ${reveal}` : ""}`}>
      <h3>{title}</h3>
      {items.length === 0 ? (
        <div className="ann-empty">Tiada makluman buat masa ini.</div>
      ) : (
        items.map((a) => (
          <div className="ann-item" key={a.id}>
            <div className="ann-bar" style={{ background: a.bar_color }}></div>
            <div>
              <div className="ai-t">{a.title}</div>
              <span className="ann-chip" style={{ background: a.chip_color }}>
                {a.chip_label}
              </span>
              <span className="ann-date">{formatDateBM(a.date)}</span>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
