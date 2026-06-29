import type { Achievement, Announcement, GalleryItem, PortalLink, SchoolDocument, SchoolEvent, SiteSettings, Staff, Writing } from "./types";

// Default content ported from SKDarauWebsite_V16.html.
// Used when Supabase is not configured OR a table is empty, so the site
// always looks complete. Once admin adds data, DB content takes over.

export const FALLBACK_SETTINGS: SiteSettings = {
  stat_1_num: "1940",
  stat_1_lbl: "Ditubuhkan",
  stat_2_num: "XBA4007",
  stat_2_lbl: "Kod Sekolah",
  stat_3_num: "20",
  stat_3_lbl: "Guru Besar",
  stat_4_num: "A+",
  stat_4_lbl: "Gred Sekolah",
  school_name: "Sekolah Kebangsaan Darau",
  school_phone: "088-491 326",
  school_email: "digitalskdarau@gmail.com",
  school_address: "Peti Surat 11881, 88820 Kota Kinabalu, Sabah",
  school_hours: "Isnin – Jumaat · 7:30 pagi – 4:30 petang",
  emergency_active: "false",
  emergency_text: "",
};

export const FALLBACK_PORTAL: PortalLink[] = [
  { id: "p1", icon: "📚", title: "e-Kurikulum", descr: "e-Learning, e-RPH, e-PBD, e-Panitia", url: "", gradient: "linear-gradient(145deg,#3b82f6,#1d4ed8)", sort_order: 1 },
  { id: "p2", icon: "🎒", title: "Hal Ehwal Murid", descr: "Kehadiran, merit, disiplin, kebajikan", url: "", gradient: "linear-gradient(145deg,#38bdf8,#0284c7)", sort_order: 2 },
  { id: "p3", icon: "💻", title: "DeLIMA SKDKK", descr: "Carian ID & platform pembelajaran", url: "https://sites.google.com/moe.edu.my/login/login", gradient: "linear-gradient(145deg,#6366f1,#4338ca)", sort_order: 3 },
  { id: "p4", icon: "🏆", title: "Kokurikulum", descr: "Kelab, sukan, badan beruniform", url: "", gradient: "linear-gradient(145deg,#1e3a8a,#172554)", sort_order: 4 },
];

export const FALLBACK_GALLERY: GalleryItem[] = [
  { id: "g1", title: "Kelab Robotik", subtitle: "Juara peringkat daerah 2024", tag: "Inovasi", emoji: "🤖", image_url: null, gradient: "linear-gradient(155deg,#3b82f6,#1e3a8a)", sort_order: 1 },
  { id: "g2", title: "MSSS SK Darau", subtitle: "Kejohanan olahraga tahunan", tag: "Sukan", emoji: "🏃", image_url: null, gradient: "linear-gradient(155deg,#38bdf8,#0369a1)", sort_order: 2 },
  { id: "g3", title: "Sambutan Merdeka", subtitle: "Semangat cintakan negara", tag: "Patriotik", emoji: "🇲🇾", image_url: null, gradient: "linear-gradient(155deg,#6366f1,#3730a3)", sort_order: 3 },
  { id: "g4", title: "Inovasi Sains", subtitle: "Pameran projek murid", tag: "STEM", emoji: "🔬", image_url: null, gradient: "linear-gradient(155deg,#60a5fa,#2563eb)", sort_order: 4 },
  { id: "g5", title: "Minggu Bahasa", subtitle: "Memperkasa literasi murid", tag: "Akademik", emoji: "📚", image_url: null, gradient: "linear-gradient(155deg,#818cf8,#4f46e5)", sort_order: 5 },
  { id: "g6", title: "Perkhemahan Pengakap", subtitle: "Membina sahsiah & kepimpinan", tag: "Kokurikulum", emoji: "⚜️", image_url: null, gradient: "linear-gradient(155deg,#1e3a8a,#172554)", sort_order: 6 },
];

export const FALLBACK_ANNOUNCEMENTS: Announcement[] = [
  { id: "a1", audience: "ibu_bapa", title: "Mesyuarat Agung PIBG 2024", chip_label: "Penting", chip_color: "#6366f1", bar_color: "#6366f1", date: "2024-06-28" },
  { id: "a2", audience: "ibu_bapa", title: "Yuran Tahunan & Insurans Murid", chip_label: "Pembayaran", chip_color: "#d4af37", bar_color: "#d4af37", date: "2024-06-15" },
  { id: "a3", audience: "ibu_bapa", title: "Jadual Cuti Pertengahan Tahun", chip_label: "Makluman", chip_color: "#2563eb", bar_color: "#2563eb", date: "2024-06-10" },
  { id: "a4", audience: "awam", title: "Sebut Harga Kantin Sekolah", chip_label: "Tender", chip_color: "#818cf8", bar_color: "#818cf8", date: "2024-06-20" },
  { id: "a5", audience: "awam", title: "Hari Terbuka & Pendaftaran Tahun 1 (2025)", chip_label: "Pendaftaran", chip_color: "#38bdf8", bar_color: "#38bdf8", date: "2024-06-01" },
  { id: "a6", audience: "awam", title: "Program Gotong-Royong Perdana", chip_label: "Komuniti", chip_color: "#0ea5e9", bar_color: "#0ea5e9", date: "2024-05-25" },
];

export const FALLBACK_EVENTS: SchoolEvent[] = [
  { id: "ev1", title: "Mesyuarat Agung PIBG 2026", date: "2026-07-15", end_date: null, location: "Dewan Sekolah", descr: "", is_active: true },
  { id: "ev2", title: "Sambutan Hari Kemerdekaan ke-69", date: "2026-08-31", end_date: null, location: "Padang Sekolah", descr: "", is_active: true },
  { id: "ev3", title: "Hari Terbuka & Pendaftaran Tahun 1 (2027)", date: "2026-10-01", end_date: null, location: "SK Darau", descr: "", is_active: true },
];

export const FALLBACK_DOCUMENTS: SchoolDocument[] = [];

export const FALLBACK_WRITINGS: Writing[] = [];

export const FALLBACK_STAFF: Staff[] = [];

export const FALLBACK_ACHIEVEMENTS: Achievement[] = [];

export const KPM_LINKS = [
  { emoji: "📊", label: "APDM", url: "https://apdm.moe.gov.my/" },
  { emoji: "🪪", label: "SAPS / IdME", url: "https://sapsnkra.moe.gov.my/" },
  { emoji: "⚙️", label: "e-Operasi", url: "https://eoperasi.moe.gov.my/" },
  { emoji: "👥", label: "EPGO / HRMIS", url: "https://epgo.moe.gov.my/" },
  { emoji: "📋", label: "BPK", url: "http://bpk.moe.gov.my/" },
  { emoji: "💻", label: "DeLIMA KPM", url: "https://sites.google.com/moe.edu.my/login/login" },
];
