export type Announcement = {
  id: string;
  audience: "ibu_bapa" | "awam";
  title: string;
  chip_label: string;
  chip_color: string;
  bar_color: string;
  date: string; // ISO date (YYYY-MM-DD)
  created_at?: string;
};

export type GalleryItem = {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  emoji: string | null;
  image_url: string | null;
  gradient: string;
  sort_order: number;
  created_at?: string;
};

export type PortalLink = {
  id: string;
  icon: string;
  title: string;
  descr: string;
  url: string;
  gradient: string;
  sort_order: number;
};

export type Message = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
};

export type SiteSettings = Record<string, string>;
