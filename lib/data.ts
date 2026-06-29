import { createSupabaseAnon } from "./supabase/server";
import { isSupabaseConfigured } from "./supabase/config";
import {
  FALLBACK_ACHIEVEMENTS,
  FALLBACK_ANNOUNCEMENTS,
  FALLBACK_DOCUMENTS,
  FALLBACK_EVENTS,
  FALLBACK_GALLERY,
  FALLBACK_PORTAL,
  FALLBACK_SETTINGS,
  FALLBACK_STAFF,
  FALLBACK_WRITINGS,
} from "./fallback";
import type {
  Achievement,
  Announcement,
  GalleryItem,
  PortalLink,
  SchoolDocument,
  SchoolEvent,
  SiteSettings,
  Staff,
  Writing,
} from "./types";

// Each getter returns DB content when Supabase is configured and has rows,
// otherwise falls back to the ported V16 defaults so the site is never empty.

export async function getSettings(): Promise<SiteSettings> {
  if (!isSupabaseConfigured) return FALLBACK_SETTINGS;
  try {
    const sb = createSupabaseAnon();
    const { data } = await sb.from("site_settings").select("key,value");
    if (!data || data.length === 0) return FALLBACK_SETTINGS;
    const merged: SiteSettings = { ...FALLBACK_SETTINGS };
    for (const row of data) merged[row.key] = row.value;
    return merged;
  } catch {
    return FALLBACK_SETTINGS;
  }
}

export async function getPortalLinks(): Promise<PortalLink[]> {
  if (!isSupabaseConfigured) return FALLBACK_PORTAL;
  try {
    const sb = createSupabaseAnon();
    const { data } = await sb
      .from("portal_links")
      .select("*")
      .order("sort_order", { ascending: true });
    if (!data || data.length === 0) return FALLBACK_PORTAL;
    return data as PortalLink[];
  } catch {
    return FALLBACK_PORTAL;
  }
}

export async function getGallery(): Promise<GalleryItem[]> {
  if (!isSupabaseConfigured) return FALLBACK_GALLERY;
  try {
    const sb = createSupabaseAnon();
    const { data } = await sb
      .from("gallery")
      .select("*")
      .order("sort_order", { ascending: true });
    if (!data || data.length === 0) return FALLBACK_GALLERY;
    return data as GalleryItem[];
  } catch {
    return FALLBACK_GALLERY;
  }
}

export async function getAnnouncements(): Promise<Announcement[]> {
  if (!isSupabaseConfigured) return FALLBACK_ANNOUNCEMENTS;
  try {
    const sb = createSupabaseAnon();
    const { data } = await sb
      .from("announcements")
      .select("*")
      .order("date", { ascending: false });
    if (!data || data.length === 0) return FALLBACK_ANNOUNCEMENTS;
    // Auto-archive: hide announcements whose expiry date has passed.
    const today = new Date().toISOString().slice(0, 10);
    return (data as Announcement[]).filter(
      (a) => !a.expires_at || a.expires_at >= today
    );
  } catch {
    return FALLBACK_ANNOUNCEMENTS;
  }
}

export async function getEvents(): Promise<SchoolEvent[]> {
  if (!isSupabaseConfigured) return FALLBACK_EVENTS;
  try {
    const sb = createSupabaseAnon();
    const { data } = await sb
      .from("events")
      .select("*")
      .eq("is_active", true)
      .order("date", { ascending: true });
    if (!data || data.length === 0) return FALLBACK_EVENTS;
    return data as SchoolEvent[];
  } catch {
    return FALLBACK_EVENTS;
  }
}

export async function getDocuments(): Promise<SchoolDocument[]> {
  if (!isSupabaseConfigured) return FALLBACK_DOCUMENTS;
  try {
    const sb = createSupabaseAnon();
    const { data } = await sb
      .from("documents")
      .select("*")
      .eq("is_public", true)
      .order("created_at", { ascending: false });
    if (!data || data.length === 0) return FALLBACK_DOCUMENTS;
    return data as SchoolDocument[];
  } catch {
    return FALLBACK_DOCUMENTS;
  }
}

export async function getWritings(): Promise<Writing[]> {
  if (!isSupabaseConfigured) return FALLBACK_WRITINGS;
  try {
    const sb = createSupabaseAnon();
    const { data } = await sb
      .from("writings")
      .select("*")
      .eq("is_published", true)
      .order("publish_date", { ascending: false });
    if (!data || data.length === 0) return FALLBACK_WRITINGS;
    return data as Writing[];
  } catch {
    return FALLBACK_WRITINGS;
  }
}

export async function getAchievements(): Promise<Achievement[]> {
  if (!isSupabaseConfigured) return FALLBACK_ACHIEVEMENTS;
  try {
    const sb = createSupabaseAnon();
    const { data } = await sb
      .from("achievements")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("date", { ascending: false });
    if (!data || data.length === 0) return FALLBACK_ACHIEVEMENTS;
    return data as Achievement[];
  } catch {
    return FALLBACK_ACHIEVEMENTS;
  }
}

export async function getStaff(): Promise<Staff[]> {
  if (!isSupabaseConfigured) return FALLBACK_STAFF;
  try {
    const sb = createSupabaseAnon();
    const { data } = await sb
      .from("staff")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });
    if (!data || data.length === 0) return FALLBACK_STAFF;
    return data as Staff[];
  } catch {
    return FALLBACK_STAFF;
  }
}

export async function getWritingBySlug(slug: string): Promise<Writing | null> {
  if (!isSupabaseConfigured) return null;
  try {
    const sb = createSupabaseAnon();
    const { data } = await sb
      .from("writings")
      .select("*")
      .eq("slug", slug)
      .eq("is_published", true)
      .maybeSingle();
    return (data as Writing) ?? null;
  } catch {
    return null;
  }
}
