import { NextResponse } from "next/server";
import { createSupabaseAnon } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const runtime = "nodejs";

// Store a browser's web-push subscription. Public endpoint (any device can
// subscribe). RLS bounds the payload at the database level. Idempotent on
// endpoint so re-subscribing the same device doesn't duplicate rows.
export async function POST(request: Request) {
  if (!isSupabaseConfigured) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
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
