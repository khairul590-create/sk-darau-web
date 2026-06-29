import { NextResponse } from "next/server";
import { createSupabaseAnon } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const runtime = "nodejs";

// Per-IP sliding-window rate limit so a single host can't flood the
// subscriptions table. Defence-in-depth alongside the RLS payload bounds.
const RL_MAX = 10;
const RL_WINDOW_MS = 10 * 60 * 1000;
const hits = new Map<string, number[]>();
function rateLimited(ip: string): boolean {
  const now = Date.now();
  const arr = (hits.get(ip) ?? []).filter((t) => now - t < RL_WINDOW_MS);
  arr.push(now);
  hits.set(ip, arr);
  if (hits.size > 5000) hits.clear();
  return arr.length > RL_MAX;
}

// Store a browser's web-push subscription. Public endpoint (any device can
// subscribe). RLS bounds the payload at the database level. Insert-only:
// re-subscribing the same endpoint is a no-op (handled below).
export async function POST(request: Request) {
  if (!isSupabaseConfigured) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }
  const sub = body as { endpoint?: string; keys?: { p256dh?: string; auth?: string } };
  const endpoint = sub?.endpoint;
  const p256dh = sub?.keys?.p256dh;
  const auth = sub?.keys?.auth;
  if (!endpoint || !p256dh || !auth) {
    return NextResponse.json({ error: "incomplete" }, { status: 400 });
  }
  // Real push endpoints are always https URLs from the browser's push service.
  if (!/^https:\/\//i.test(endpoint) || endpoint.length > 1000) {
    return NextResponse.json({ error: "bad_endpoint" }, { status: 400 });
  }

  const db = createSupabaseAnon();
  const { error } = await db
    .from("push_subscriptions")
    .insert({ endpoint, p256dh, auth });
  // 23505 = unique violation: this device is already subscribed → treat as OK.
  // (Anon role has insert-only RLS, so we don't upsert.)
  if (error && error.code !== "23505") {
    return NextResponse.json({ error: "store_failed" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
