"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase/client";
import { formatDateBM } from "@/lib/format";
import type {
  Announcement,
  GalleryItem,
  Message,
  PortalLink,
  SchoolDocument,
  SchoolEvent,
} from "@/lib/types";

type Tab = "makluman" | "galeri" | "acara" | "dokumen" | "mesej" | "tetapan";

const GRADIENTS = [
  "linear-gradient(145deg,#3b82f6,#1d4ed8)",
  "linear-gradient(145deg,#38bdf8,#0284c7)",
  "linear-gradient(145deg,#6366f1,#4338ca)",
  "linear-gradient(145deg,#1e3a8a,#172554)",
  "linear-gradient(155deg,#60a5fa,#2563eb)",
  "linear-gradient(155deg,#818cf8,#4f46e5)",
];

export default function AdminDashboard({ userEmail }: { userEmail: string }) {
  const router = useRouter();
  const sb = useMemo(() => createSupabaseBrowser(), []);
  const [tab, setTab] = useState<Tab>("makluman");

  const [anns, setAnns] = useState<Announcement[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [events, setEvents] = useState<SchoolEvent[]>([]);
  const [docs, setDocs] = useState<SchoolDocument[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [portal, setPortal] = useState<PortalLink[]>([]);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [toast, setToast] = useState("");

  const flash = (t: string) => {
    setToast(t);
    setTimeout(() => setToast(""), 2500);
  };

  const loadAll = useCallback(async () => {
    const [a, g, ev, d, m, p, s] = await Promise.all([
      sb.from("announcements").select("*").order("date", { ascending: false }),
      sb.from("gallery").select("*").order("sort_order", { ascending: true }),
      sb.from("events").select("*").order("date", { ascending: true }),
      sb.from("documents").select("*").order("created_at", { ascending: false }),
      sb.from("messages").select("*").order("created_at", { ascending: false }),
      sb.from("portal_links").select("*").order("sort_order", { ascending: true }),
      sb.from("site_settings").select("key,value"),
    ]);
    if (a.data) setAnns(a.data as Announcement[]);
    if (g.data) setGallery(g.data as GalleryItem[]);
    if (ev.data) setEvents(ev.data as SchoolEvent[]);
    if (d.data) setDocs(d.data as SchoolDocument[]);
    if (m.data) setMessages(m.data as Message[]);
    if (p.data) setPortal(p.data as PortalLink[]);
    if (s.data) {
      const map: Record<string, string> = {};
      for (const row of s.data) map[row.key] = row.value;
      setSettings(map);
    }
  }, [sb]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  async function logout() {
    await sb.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  const unread = messages.filter((m) => !m.is_read).length;

  return (
    <div className="admin-shell">
      <div className="admin-top">
        <div className="admin-brand">
          <div className="ab-logo">SK</div>
          <div>
            <div className="ab-name">Panel Admin</div>
            <div className="ab-sub">SK DARAU · KOTA KINABALU</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <span className="al-sub">{userEmail}</span>
          <button className="btn btn-sm btn-ghost" onClick={logout}>Log Keluar</button>
        </div>
      </div>
      {toast && <div className="form-msg ok">{toast}</div>}

      <div className="admin-tabs">
        <button className={`admin-tab${tab === "makluman" ? " active" : ""}`} onClick={() => setTab("makluman")}>📢 Makluman</button>
        <button className={`admin-tab${tab === "galeri" ? " active" : ""}`} onClick={() => setTab("galeri")}>🖼️ Galeri</button>
        <button className={`admin-tab${tab === "acara" ? " active" : ""}`} onClick={() => setTab("acara")}>📅 Acara</button>
        <button className={`admin-tab${tab === "dokumen" ? " active" : ""}`} onClick={() => setTab("dokumen")}>📄 Dokumen</button>
        <button className={`admin-tab${tab === "mesej" ? " active" : ""}`} onClick={() => setTab("mesej")}>✉️ Mesej{unread ? ` (${unread})` : ""}</button>
        <button className={`admin-tab${tab === "tetapan" ? " active" : ""}`} onClick={() => setTab("tetapan")}>⚙️ Tetapan</button>
      </div>

      {tab === "makluman" && <MaklumanTab sb={sb} anns={anns} reload={loadAll} flash={flash} />}
      {tab === "galeri" && <GaleriTab sb={sb} gallery={gallery} reload={loadAll} flash={flash} />}
      {tab === "acara" && <AcaraTab sb={sb} events={events} reload={loadAll} flash={flash} />}
      {tab === "dokumen" && <DokumenTab sb={sb} docs={docs} reload={loadAll} flash={flash} />}
      {tab === "mesej" && <MesejTab sb={sb} messages={messages} reload={loadAll} flash={flash} />}
      {tab === "tetapan" && <TetapanTab sb={sb} portal={portal} settings={settings} reload={loadAll} flash={flash} />}
    </div>
  );
}

type SB = ReturnType<typeof createSupabaseBrowser>;

/* ---------------- MAKLUMAN ---------------- */
function MaklumanTab({ sb, anns, reload, flash }: {
  sb: SB; anns: Announcement[]; reload: () => Promise<void>; flash: (t: string) => void;
}) {
  const empty = {
    audience: "ibu_bapa" as Announcement["audience"],
    title: "", chip_label: "Makluman", chip_color: "#2563eb", bar_color: "#2563eb",
    date: new Date().toISOString().slice(0, 10),
  };
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState<string | null>(null);
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function save() {
    if (!form.title.trim()) return flash("Sila isi tajuk.");
    if (editId) {
      const { error } = await sb.from("announcements").update(form).eq("id", editId);
      if (error) return flash("Gagal kemaskini.");
      flash("Makluman dikemaskini.");
    } else {
      const { error } = await sb.from("announcements").insert(form);
      if (error) return flash("Gagal tambah.");
      flash("Makluman ditambah.");
    }
    setForm(empty); setEditId(null); await reload();
  }
  function edit(a: Announcement) {
    setEditId(a.id);
    setForm({ audience: a.audience, title: a.title, chip_label: a.chip_label, chip_color: a.chip_color, bar_color: a.bar_color, date: a.date });
  }
  async function del(id: string) {
    if (!confirm("Padam makluman ini?")) return;
    const { error } = await sb.from("announcements").delete().eq("id", id);
    if (error) return flash("Gagal padam.");
    flash("Makluman dipadam."); await reload();
  }

  return (
    <>
      <div className="admin-card">
        <h2>{editId ? "Edit Makluman" : "Tambah Makluman"}</h2>
        <div className="admin-row">
          <div className="field">
            <label>Untuk Siapa</label>
            <select value={form.audience} onChange={(e) => set("audience", e.target.value)}>
              <option value="ibu_bapa">Ibu Bapa</option>
              <option value="awam">Awam</option>
            </select>
          </div>
          <div className="field">
            <label>Tarikh</label>
            <input type="date" value={form.date} onChange={(e) => set("date", e.target.value)} />
          </div>
        </div>
        <div className="field">
          <label>Tajuk Makluman</label>
          <input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="cth: Mesyuarat Agung PIBG 2024" />
        </div>
        <div className="admin-row">
          <div className="field">
            <label>Label (chip)</label>
            <input value={form.chip_label} onChange={(e) => set("chip_label", e.target.value)} placeholder="Penting / Pembayaran / Tender" />
          </div>
          <div className="field">
            <label>Warna Chip</label>
            <input type="color" value={form.chip_color} onChange={(e) => { set("chip_color", e.target.value); set("bar_color", e.target.value); }} />
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-submit btn-sm" onClick={save}>{editId ? "Simpan Perubahan" : "Tambah Makluman"}</button>
          {editId && <button className="btn btn-ghost btn-sm" onClick={() => { setEditId(null); setForm(empty); }}>Batal</button>}
        </div>
      </div>

      <div className="admin-card">
        <h2>Senarai Makluman ({anns.length})</h2>
        {anns.length === 0 ? <div className="admin-empty">Tiada makluman.</div> : (
          <ul className="admin-list">
            {anns.map((a) => (
              <li key={a.id}>
                <div>
                  <div className="al-main">
                    <span className="ann-chip" style={{ background: a.chip_color, marginRight: 8 }}>{a.chip_label}</span>
                    {a.title}
                  </div>
                  <div className="al-sub">{a.audience === "ibu_bapa" ? "Ibu Bapa" : "Awam"} · {formatDateBM(a.date)}</div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn btn-sm btn-ghost" onClick={() => edit(a)}>Edit</button>
                  <button className="btn btn-sm btn-danger" onClick={() => del(a.id)}>Padam</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

/* ---------------- GALERI ---------------- */
function GaleriTab({ sb, gallery, reload, flash }: {
  sb: SB; gallery: GalleryItem[]; reload: () => Promise<void>; flash: (t: string) => void;
}) {
  const empty = { title: "", subtitle: "", tag: "Aktiviti", emoji: "📸", gradient: GRADIENTS[0] };
  const [form, setForm] = useState(empty);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function add() {
    if (!form.title.trim()) return flash("Sila isi tajuk.");
    setBusy(true);
    try {
      let image_url: string | null = null;
      if (file) {
        const ext = file.name.split(".").pop() || "jpg";
        const path = `${Date.now()}-${Math.round(Math.random() * 1e6)}.${ext}`;
        const up = await sb.storage.from("gallery").upload(path, file, { upsert: false });
        if (up.error) { flash("Gagal muat naik gambar."); setBusy(false); return; }
        image_url = sb.storage.from("gallery").getPublicUrl(path).data.publicUrl;
      }
      const sort_order = (gallery.at(-1)?.sort_order ?? 0) + 1;
      const { error } = await sb.from("gallery").insert({ ...form, image_url, sort_order });
      if (error) { flash("Gagal tambah."); setBusy(false); return; }
      flash("Gambar/aktiviti ditambah.");
      setForm(empty); setFile(null); await reload();
    } finally {
      setBusy(false);
    }
  }
  async function del(g: GalleryItem) {
    if (!confirm("Padam item galeri ini?")) return;
    if (g.image_url) {
      const path = g.image_url.split("/gallery/")[1];
      if (path) await sb.storage.from("gallery").remove([path]);
    }
    const { error } = await sb.from("gallery").delete().eq("id", g.id);
    if (error) return flash("Gagal padam.");
    flash("Item dipadam."); await reload();
  }

  return (
    <>
      <div className="admin-card">
        <h2>Tambah Aktiviti / Gambar</h2>
        <div className="field">
          <label>Tajuk</label>
          <input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="cth: Kelab Robotik" />
        </div>
        <div className="field">
          <label>Subtajuk</label>
          <input value={form.subtitle} onChange={(e) => set("subtitle", e.target.value)} placeholder="cth: Juara peringkat daerah 2024" />
        </div>
        <div className="admin-row">
          <div className="field">
            <label>Tag</label>
            <input value={form.tag} onChange={(e) => set("tag", e.target.value)} placeholder="Inovasi / Sukan / STEM" />
          </div>
          <div className="field">
            <label>Emoji (jika tiada gambar)</label>
            <input value={form.emoji} onChange={(e) => set("emoji", e.target.value)} placeholder="🤖" />
          </div>
        </div>
        <div className="field">
          <label>Gambar (pilihan — JPG/PNG)</label>
          <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          <div className="muted-note">Jika tiada gambar dimuat naik, emoji + warna latar akan digunakan.</div>
        </div>
        <button className="btn btn-submit btn-sm" onClick={add} disabled={busy}>{busy ? "Memuat naik..." : "Tambah ke Galeri"}</button>
      </div>

      <div className="admin-card">
        <h2>Galeri Semasa ({gallery.length})</h2>
        {gallery.length === 0 ? <div className="admin-empty">Tiada item.</div> : (
          <ul className="admin-list">
            {gallery.map((g) => (
              <li key={g.id}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 46, height: 46, borderRadius: 10, background: g.gradient, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, overflow: "hidden", flexShrink: 0 }}>
                    {g.image_url ? <img src={g.image_url} alt={g.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : g.emoji}
                  </div>
                  <div>
                    <div className="al-main">{g.title}</div>
                    <div className="al-sub">{g.tag} · {g.subtitle}</div>
                  </div>
                </div>
                <button className="btn btn-sm btn-danger" onClick={() => del(g)}>Padam</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

/* ---------------- ACARA ---------------- */
function AcaraTab({ sb, events, reload, flash }: {
  sb: SB; events: SchoolEvent[]; reload: () => Promise<void>; flash: (t: string) => void;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const empty = { title: "", date: today, end_date: "", location: "", descr: "", is_active: true };
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState<string | null>(null);
  const set = (k: string, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  async function save() {
    if (!form.title.trim()) return flash("Sila isi tajuk acara.");
    if (!form.date) return flash("Sila pilih tarikh.");
    const payload = {
      title: form.title,
      date: form.date,
      end_date: form.end_date || null,
      location: form.location,
      descr: form.descr,
      is_active: form.is_active,
    };
    if (editId) {
      const { error } = await sb.from("events").update(payload).eq("id", editId);
      if (error) return flash("Gagal kemaskini.");
      flash("Acara dikemaskini.");
    } else {
      const { error } = await sb.from("events").insert(payload);
      if (error) return flash("Gagal tambah.");
      flash("Acara ditambah.");
    }
    setForm(empty); setEditId(null); await reload();
  }
  function edit(ev: SchoolEvent) {
    setEditId(ev.id);
    setForm({ title: ev.title, date: ev.date, end_date: ev.end_date ?? "", location: ev.location, descr: ev.descr, is_active: ev.is_active });
  }
  async function del(id: string) {
    if (!confirm("Padam acara ini?")) return;
    const { error } = await sb.from("events").delete().eq("id", id);
    if (error) return flash("Gagal padam.");
    flash("Acara dipadam."); await reload();
  }

  return (
    <>
      <div className="admin-card">
        <h2>{editId ? "Edit Acara" : "Tambah Acara"}</h2>
        <div className="field">
          <label>Tajuk Acara</label>
          <input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="cth: Mesyuarat Agung PIBG 2026" />
        </div>
        <div className="admin-row">
          <div className="field">
            <label>Tarikh Mula</label>
            <input type="date" value={form.date} onChange={(e) => set("date", e.target.value)} />
          </div>
          <div className="field">
            <label>Tarikh Akhir (pilihan)</label>
            <input type="date" value={form.end_date} onChange={(e) => set("end_date", e.target.value)} />
          </div>
        </div>
        <div className="field">
          <label>Lokasi</label>
          <input value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="cth: Dewan Sekolah" />
        </div>
        <div className="field">
          <label>Penerangan (pilihan)</label>
          <input value={form.descr} onChange={(e) => set("descr", e.target.value)} placeholder="Maklumat tambahan..." />
        </div>
        <div className="field">
          <label>Status</label>
          <select value={form.is_active ? "true" : "false"} onChange={(e) => set("is_active", e.target.value === "true")}>
            <option value="true">Aktif (papar di website)</option>
            <option value="false">Tidak Aktif (sorok)</option>
          </select>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-submit btn-sm" onClick={save}>{editId ? "Simpan Perubahan" : "Tambah Acara"}</button>
          {editId && <button className="btn btn-ghost btn-sm" onClick={() => { setEditId(null); setForm(empty); }}>Batal</button>}
        </div>
      </div>

      <div className="admin-card">
        <h2>Senarai Acara ({events.length})</h2>
        {events.length === 0 ? <div className="admin-empty">Tiada acara.</div> : (
          <ul className="admin-list">
            {events.map((ev) => (
              <li key={ev.id}>
                <div>
                  <div className="al-main">
                    {!ev.is_active && <span className="pill-unread" style={{ background: "#94a3b8" }}></span>}
                    {ev.title}
                  </div>
                  <div className="al-sub">{ev.date}{ev.location ? ` · ${ev.location}` : ""}</div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn btn-sm btn-ghost" onClick={() => edit(ev)}>Edit</button>
                  <button className="btn btn-sm btn-danger" onClick={() => del(ev.id)}>Padam</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

/* ---------------- DOKUMEN ---------------- */
const DOC_CATEGORIES = ["Pekeliling", "Borang", "Notis", "Laporan", "Lain-lain"];

function DokumenTab({ sb, docs, reload, flash }: {
  sb: SB; docs: SchoolDocument[]; reload: () => Promise<void>; flash: (t: string) => void;
}) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Pekeliling");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  async function upload() {
    if (!title.trim()) return flash("Sila isi tajuk dokumen.");
    if (!file) return flash("Sila pilih fail PDF.");
    setBusy(true);
    try {
      const ext = file.name.split(".").pop() || "pdf";
      const path = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      const up = await sb.storage.from("documents").upload(path, file, { upsert: false, contentType: file.type || "application/pdf" });
      if (up.error) { flash("Gagal muat naik fail."); setBusy(false); return; }
      const file_url = sb.storage.from("documents").getPublicUrl(path).data.publicUrl;
      const { error } = await sb.from("documents").insert({ title, category, file_url, is_public: true });
      if (error) { flash("Gagal simpan rekod."); setBusy(false); return; }
      flash("Dokumen dimuat naik.");
      setTitle(""); setCategory("Pekeliling"); setFile(null);
      const inp = document.getElementById("dok-file-input") as HTMLInputElement;
      if (inp) inp.value = "";
      await reload();
    } finally {
      setBusy(false);
    }
  }

  async function del(doc: SchoolDocument) {
    if (!confirm("Padam dokumen ini?")) return;
    const path = doc.file_url.split("/documents/")[1];
    if (path) await sb.storage.from("documents").remove([decodeURIComponent(path)]);
    const { error } = await sb.from("documents").delete().eq("id", doc.id);
    if (error) return flash("Gagal padam.");
    flash("Dokumen dipadam."); await reload();
  }

  return (
    <>
      <div className="admin-card">
        <h2>Muat Naik Dokumen</h2>
        <div className="muted-note" style={{ marginBottom: 12 }}>Dokumen yang dimuat naik boleh dimuat turun oleh ibu bapa dari halaman <strong>/dokumen</strong>.</div>
        <div className="field">
          <label>Tajuk Dokumen</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="cth: Surat Pekeliling Bil. 3/2026" />
        </div>
        <div className="field">
          <label>Kategori</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            {DOC_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="field">
          <label>Fail (PDF / Word / gambar)</label>
          <input id="dok-file-input" type="file" accept=".pdf,.doc,.docx,.jpg,.png" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        </div>
        <button className="btn btn-submit btn-sm" onClick={upload} disabled={busy}>{busy ? "Memuat naik..." : "Muat Naik"}</button>
      </div>

      <div className="admin-card">
        <h2>Senarai Dokumen ({docs.length})</h2>
        {docs.length === 0 ? <div className="admin-empty">Tiada dokumen.</div> : (
          <ul className="admin-list">
            {docs.map((d) => (
              <li key={d.id}>
                <div>
                  <div className="al-main">📄 {d.title}</div>
                  <div className="al-sub">{d.category} · <a href={d.file_url} target="_blank" rel="noopener noreferrer" style={{ color: "var(--blue)" }}>Buka fail ↗</a></div>
                </div>
                <button className="btn btn-sm btn-danger" onClick={() => del(d)}>Padam</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

/* ---------------- MESEJ ---------------- */
function MesejTab({ sb, messages, reload, flash }: {
  sb: SB; messages: Message[]; reload: () => Promise<void>; flash: (t: string) => void;
}) {
  async function toggleRead(m: Message) {
    await sb.from("messages").update({ is_read: !m.is_read }).eq("id", m.id);
    await reload();
  }
  async function del(id: string) {
    if (!confirm("Padam mesej ini?")) return;
    const { error } = await sb.from("messages").delete().eq("id", id);
    if (error) return flash("Gagal padam.");
    flash("Mesej dipadam."); await reload();
  }
  return (
    <div className="admin-card">
      <h2>Mesej Hubungi ({messages.length})</h2>
      {messages.length === 0 ? <div className="admin-empty">Tiada mesej.</div> : (
        <ul className="admin-list">
          {messages.map((m) => (
            <li key={m.id} style={{ flexDirection: "column", alignItems: "stretch" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <div className="al-main">
                  {!m.is_read && <span className="pill-unread"></span>}
                  {m.name} · <a href={`mailto:${m.email}`} style={{ color: "var(--blue)" }}>{m.email}</a>
                  {m.phone ? ` · ${m.phone}` : ""}
                </div>
                <div className="al-sub">{formatDateBM(m.created_at)}</div>
              </div>
              <div style={{ fontSize: 13.5, color: "var(--muted)", margin: "8px 0", whiteSpace: "pre-wrap" }}>{m.message}</div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn btn-sm btn-ghost" onClick={() => toggleRead(m)}>{m.is_read ? "Tanda belum baca" : "Tanda sudah baca"}</button>
                <button className="btn btn-sm btn-danger" onClick={() => del(m.id)}>Padam</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ---------------- TETAPAN ---------------- */
function TetapanTab({ sb, portal, settings, reload, flash }: {
  sb: SB; portal: PortalLink[]; settings: Record<string, string>; reload: () => Promise<void>; flash: (t: string) => void;
}) {
  const [s, setS] = useState<Record<string, string>>(settings);
  const [p, setP] = useState<PortalLink[]>(portal);
  useEffect(() => { setS(settings); }, [settings]);
  useEffect(() => { setP(portal); }, [portal]);
  const setKey = (k: string, v: string) => setS((o) => ({ ...o, [k]: v }));
  const setPortalUrl = (id: string, url: string) =>
    setP((arr) => arr.map((x) => (x.id === id ? { ...x, url } : x)));

  async function saveSettings() {
    const rows = Object.entries(s).map(([key, value]) => ({ key, value }));
    const { error } = await sb.from("site_settings").upsert(rows, { onConflict: "key" });
    if (error) return flash("Gagal simpan tetapan.");
    flash("Tetapan disimpan."); await reload();
  }
  async function savePortal() {
    for (const link of p) {
      await sb.from("portal_links").update({ url: link.url }).eq("id", link.id);
    }
    flash("Pautan portal disimpan."); await reload();
  }

  const statFields = [1, 2, 3, 4];
  const infoFields: [string, string][] = [
    ["school_phone", "Telefon"],
    ["school_email", "E-mel"],
    ["school_address", "Alamat"],
    ["school_hours", "Waktu Operasi"],
  ];

  return (
    <>
      <div className="admin-card">
        <h2>Pautan Portal Sekolah</h2>
        <div className="muted-note" style={{ marginBottom: 12 }}>Tetapkan URL untuk setiap kad portal. Biar kosong jika belum ada.</div>
        {p.map((link) => (
          <div className="field" key={link.id}>
            <label>{link.icon} {link.title}</label>
            <input value={link.url} onChange={(e) => setPortalUrl(link.id, e.target.value)} placeholder="https://..." />
          </div>
        ))}
        <button className="btn btn-submit btn-sm" onClick={savePortal}>Simpan Pautan</button>
      </div>

      <div className="admin-card">
        <h2>Notis Kecemasan</h2>
        <div className="muted-note" style={{ marginBottom: 12 }}>Aktifkan untuk papar notis merah di atas website. Contoh: sekolah ditutup, bencana, arahan segera.</div>
        <div className="field">
          <label>Status</label>
          <select value={s["emergency_active"] ?? "false"} onChange={(e) => setKey("emergency_active", e.target.value)}>
            <option value="false">Tidak Aktif</option>
            <option value="true">Aktif — Papar di website</option>
          </select>
        </div>
        <div className="field">
          <label>Teks Notis</label>
          <input value={s["emergency_text"] ?? ""} onChange={(e) => setKey("emergency_text", e.target.value)} placeholder="cth: Sekolah ditutup 22 Jun 2026 — Banjir" />
        </div>
        <button className="btn btn-submit btn-sm" onClick={saveSettings}>Simpan Notis</button>
      </div>

      <div className="admin-card">
        <h2>Statistik (Hero)</h2>
        {statFields.map((i) => (
          <div className="admin-row" key={i}>
            <div className="field">
              <label>Nombor {i}</label>
              <input value={s[`stat_${i}_num`] ?? ""} onChange={(e) => setKey(`stat_${i}_num`, e.target.value)} />
            </div>
            <div className="field">
              <label>Label {i}</label>
              <input value={s[`stat_${i}_lbl`] ?? ""} onChange={(e) => setKey(`stat_${i}_lbl`, e.target.value)} />
            </div>
          </div>
        ))}
        <h2 style={{ marginTop: 18 }}>Maklumat Sekolah</h2>
        {infoFields.map(([key, label]) => (
          <div className="field" key={key}>
            <label>{label}</label>
            <input value={s[key] ?? ""} onChange={(e) => setKey(key, e.target.value)} />
          </div>
        ))}
        <button className="btn btn-submit btn-sm" onClick={saveSettings}>Simpan Tetapan</button>
      </div>
    </>
  );
}
