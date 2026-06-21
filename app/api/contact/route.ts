import { NextResponse } from "next/server";
import { createSupabaseAnon } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const runtime = "nodejs";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Permintaan tidak sah." }, { status: 400 });
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
