-- ============================================================
-- SK Darau — Security hardening (run in Supabase SQL Editor)
-- Safe to re-run.
--
-- WHY: the anon key is public (it ships in the browser). An attacker can call
-- the Supabase REST API directly, BYPASSING our /api/contact rate-limit +
-- honeypot. The only inserts the public anon role can do is into `messages`
-- (RLS). Previously the insert policy was `with check (true)` = no limits, so
-- someone could flood the table or store huge payloads (fill the 500MB free
-- tier). This file bounds those inserts at the DATABASE level, which cannot be
-- bypassed.
-- ============================================================

-- ---------- 1) CHECK constraints on messages (hard limits) ----------
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'messages_name_len') then
    alter table public.messages
      add constraint messages_name_len check (char_length(name) between 1 and 200);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'messages_email_len') then
    alter table public.messages
      add constraint messages_email_len check (char_length(email) between 3 and 200 and position('@' in email) > 1);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'messages_phone_len') then
    alter table public.messages
      add constraint messages_phone_len check (phone is null or char_length(phone) <= 50);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'messages_message_len') then
    alter table public.messages
      add constraint messages_message_len check (char_length(message) between 1 and 5000);
  end if;
end $$;

-- ---------- 2) Tighten the public INSERT policy (bounded, not "true") ----------
-- Re-create the anon insert policy so even a direct REST call must satisfy the
-- same limits. Reads/updates/deletes on messages stay admin-only (unchanged).
drop policy if exists "submit message" on public.messages;
create policy "submit message" on public.messages
  for insert to anon, authenticated
  with check (
    char_length(name) between 1 and 200
    and char_length(email) between 3 and 200
    and position('@' in email) > 1
    and char_length(message) between 1 and 5000
    and (phone is null or char_length(phone) <= 50)
    and is_read = false               -- cannot pre-mark spam as read
  );

-- ---------- 3) Confirm RLS is ON for every table (idempotent) ----------
alter table public.site_settings  enable row level security;
alter table public.portal_links   enable row level security;
alter table public.gallery        enable row level security;
alter table public.announcements  enable row level security;
alter table public.messages       enable row level security;
alter table public.events         enable row level security;
alter table public.documents      enable row level security;

-- ---------- 4) (CADANGAN) Hadkan saiz fail upload bucket ----------
-- Supabase Dashboard → Storage → bucket → Settings:
--   gallery   : had saiz 5MB,  allowed MIME image/*
--   documents : had saiz 10MB, allowed MIME application/pdf, image/*
-- (Tak boleh set ikut SQL biasa — buat di dashboard.)
