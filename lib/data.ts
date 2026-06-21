import { createSupabaseAnon } from "./supabase/server";
import { isSupabaseConfigured } from "./supabase/config";
import {
  FALLBACK_ANNOUNCEMENTS,
  FALLBACK_GALLERY,
  FALLBACK_PORTAL,
  FALLBACK_SETTINGS,
} from "./fallback";
import type {
  Announcement,
  GalleryItem,
  PortalLink,
  SiteSettings,
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
    return data as Announcement[];
  } catch {
    return FALLBACK_ANNOUNCEMENTS;
  }
}
