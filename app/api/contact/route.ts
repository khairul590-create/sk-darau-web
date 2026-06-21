import { NextResponse } from "next/server";
import { createSupabaseAnon } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const runtime = "nodejs";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Simple in-memory sliding-window rate limit per IP. Serverless instances are
// stateless across cold starts, so this stops bursts from a single warm
// instance — it is defence-in-depth, NOT the only guard (DB CHECK constraints +
// RLS with-check bound abuse at the database level too).
const RL_MAX = 5; // requests
const RL_WINDOW_MS = 10 * 60 * 1000; // per 10 minutes
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const arr = (hits.get(ip) ?? []).filter((t) => now - t < RL_WINDOW_MS);
  arr.push(now);
  hits.set(ip, arr);
  if (hits.size > 5000) hits.clear(); // crude memory cap
  return arr.length > RL_MAX;
}

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  if (rateLimited(ip)) {
    return NextResponse.json(
      { error: "Terlalu banyak permintaan. Sila cuba lagi sebentar." },
      { status: 429 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Permintaan tidak sah." }, { status: 400 });
  }

  // Honeypot: bots fill hidden fields. Pretend success without storing.
  if (String(body.company ?? "").trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim();
  const phone = String(body.phone ?? "").trim();
  const message = String(body.message ?? "").trim();

  if (!name || !email || !message) {
    return NextResponse.json(
      { error: "Sila isi nama, e-mel dan mesej." },
      { status: 400 }
    );
  }
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "E-mel tidak sah." }, { status: 400 });
  }
  if (name.length > 200 || email.length > 200 || phone.length > 50) {
    return NextResponse.json({ error: "Input terlalu panjang." }, { status: 400 });
  }
  if (message.length > 5000) {
    return NextResponse.json({ error: "Mesej terlalu panjang." }, { status: 400 });
  }

  if (!isSupabaseConfigured) {
    return NextResponse.json(
      { error: "Sistem mesej belum disambung. Sila hubungi melalui telefon/e-mel." },
      { status: 503 }
    );
  }

  try {
    const sb = createSupabaseAnon();
    const { error } = await sb.from("messages").insert({
      name,
      email,
      phone: phone || null,
      message,
    });
    if (error) throw error;
  } catch {
    return NextResponse.json(
      { error: "Gagal menyimpan mesej. Sila cuba lagi." },
      { status: 500 }
    );
  }

  // Optional email notification via Resend (only if configured).
  await notifyByEmail({ name, email, phone, message }).catch(() => {});

  return NextResponse.json({ ok: true });
}

async function notifyByEmail(d: {
  name: string;
  email: string;
  phone: string;
  message: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_NOTIFY_EMAIL;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !to || !from) return;

  const { Resend } = await import("resend");
  const resend = new Resend(apiKey);
  await resend.emails.send({
    from,
    to,
    replyTo: d.email,
    subject: `Mesej baru dari ${d.name} — Laman SK Darau`,
    text:
      `Nama: ${d.name}\n` +
      `E-mel: ${d.email}\n` +
      `Telefon: ${d.phone || "-"}\n\n` +
      `Mesej:\n${d.message}`,
  });
}
