-- ============================================================
-- SK Darau — Web Push subscriptions schema
-- Run in Supabase Dashboard → SQL Editor (safe to re-run)
--
-- Menyimpan langganan push peranti (browser). Hantar notifikasi guna
-- /api/push/send (admin sahaja). Perlu kunci VAPID di env — lihat
-- arahan di bawah.
-- ============================================================

create table if not exists public.push_subscriptions (
  id         uuid primary key default gen_random_uuid(),
  endpoint   text unique not null,
  p256dh     text not null,
  auth       text not null,
  created_at timestamptz not null default now()
);
alter table public.push_subscriptions enable row level security;

-- Sesiapa (peranti awam) boleh daftar langganan; admin (authenticated)
-- boleh baca + padam (untuk hantar + buang langganan tamat tempoh).
drop policy if exists "subscribe push"  on public.push_subscriptions;
drop policy if exists "admin read push" on public.push_subscriptions;
drop policy if exists "admin del push"  on public.push_subscriptions;
create policy "subscribe push"  on public.push_subscriptions
  for insert to anon, authenticated
  with check (
    char_length(endpoint) between 10 and 1000
    and char_length(p256dh) between 10 and 300
    and char_length(auth)   between 6 and 300
  );
create policy "admin read push" on public.push_subscriptions for select to authenticated using (true);
create policy "admin del push"  on public.push_subscriptions for delete to authenticated using (true);

-- ============================================================
-- SETUP KUNCI VAPID (sekali sahaja):
--   1) Jana kunci:  npx web-push generate-vapid-keys
--   2) Tambah di Vercel → Project → Settings → Environment Variables:
--        NEXT_PUBLIC_VAPID_PUBLIC_KEY = <public key>
--        VAPID_PRIVATE_KEY            = <private key>
--        VAPID_SUBJECT                = mailto:digitalskdarau@gmail.com
--   3) Redeploy. Butang "Aktifkan Notifikasi" akan muncul.
-- ============================================================
