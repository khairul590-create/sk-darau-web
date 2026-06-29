import { NextResponse } from "next/server";
import webpush from "web-push";
import { createSupabaseServer } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const runtime = "nodejs";

const PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";
const PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY ?? "";
const SUBJECT = process.env.VAPID_SUBJECT ?? "mailto:digitalskdarau@gmail.com";

// Broadcast a push notification to every subscribed device. Admin only —
// the request must carry a valid logged-in Supabase session (same cookie the
// admin dashboard uses). Requires VAPID keys in env.
export async function POST(request: Request) {
  if (!isSupabaseConfigured) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }
  if (!PUBLIC_KEY || !PRIVATE_KEY) {
    return NextResponse.json({ error: "vapid_missing" }, { status: 503 });
  }

  // CSRF defence: this is a state-changing, cookie-authenticated POST, so
  // reject cross-site requests. The Origin must match the request host.
  const origin = request.headers.get("origin");
  if (origin) {
    const host = request.headers.get("host");
    try {
      if (new URL(origin).host !== host) {
        return NextResponse.json({ error: "bad_origin" }, { status: 403 });
      }
    } catch {
      return NextResponse.json({ error: "bad_origin" }, { status: 403 });
    }
  }

  // Auth gate: only an authenticated admin can broadcast.
  const sb = await createSupabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: { title?: string; body?: string; url?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }
  const title = (body.title ?? "").trim();
  const message = (body.body ?? "").trim();
  if (!title) {
    return NextResponse.json({ error: "title_required" }, { status: 400 });
  }
  const url = (body.url ?? "/").trim() || "/";

  webpush.setVapidDetails(SUBJECT, PUBLIC_KEY, PRIVATE_KEY);

  const { data: subs, error } = await sb
    .from("push_subscriptions")
    .select("id,endpoint,p256dh,auth");
  if (error) {
    return NextResponse.json({ error: "read_failed" }, { status: 500 });
  }
  if (!subs || subs.length === 0) {
    return NextResponse.json({ ok: true, sent: 0, failed: 0 });
  }

  const payload = JSON.stringify({ title, body: message, url, tag: "skdarau-notice" });
  const stale: string[] = [];
  let sent = 0;
  let failed = 0;

  await Promise.all(
    subs.map(async (s) => {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          payload
        );
        sent++;
      } catch (err: unknown) {
        failed++;
        const code = (err as { statusCode?: number })?.statusCode;
        // 404/410 = subscription expired or unsubscribed → remove it.
        if (code === 404 || code === 410) stale.push(s.id);
      }
    })
  );

  if (stale.length) {
    await sb.from("push_subscriptions").delete().in("id", stale);
  }

  return NextResponse.json({ ok: true, sent, failed, pruned: stale.length });
}
