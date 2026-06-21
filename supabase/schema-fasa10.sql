-- ============================================================
-- SK Darau — Fasa 10 schema additions
-- Run in Supabase Dashboard → SQL Editor (safe to re-run)
-- ============================================================

-- ---------- EVENTS ----------
create table if not exists public.events (
  id         uuid primary key default gen_random_uuid(),
  title      text not null,
  date       date not null,
  end_date   date,
  location   text not null default '',
  descr      text not null default '',
  is_active  boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.events enable row level security;
drop policy if exists "read events"  on public.events;
drop policy if exists "write events" on public.events;
create policy "read events"  on public.events for select using (true);
create policy "write events" on public.events for all to authenticated using (true) with check (true);

-- ---------- DOCUMENTS ----------
create table if not exists public.documents (
  id         uuid primary key default gen_random_uuid(),
  title      text not null,
  category   text not null default 'Pekeliling',
  file_url   text not null,
  is_public  boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.documents enable row level security;
drop policy if exists "read docs"  on public.documents;
drop policy if exists "write docs" on public.documents;
create policy "read docs"  on public.documents for select using (is_public = true);
create policy "write docs" on public.documents for all to authenticated using (true) with check (true);

-- ---------- STORAGE: documents bucket ----------
insert into storage.buckets (id, name, public)
values ('documents', 'documents', true)
on conflict (id) do nothing;

drop policy if exists "docs public read"  on storage.objects;
drop policy if exists "docs admin write"  on storage.objects;
drop policy if exists "docs admin delete" on storage.objects;
create policy "docs public read"  on storage.objects for select using (bucket_id = 'documents');
create policy "docs admin write"  on storage.objects for insert to authenticated with check (bucket_id = 'documents');
create policy "docs admin delete" on storage.objects for delete to authenticated using (bucket_id = 'documents');

-- ---------- EMERGENCY NOTICE (site_settings) ----------
insert into public.site_settings (key, value) values
  ('emergency_active', 'false'),
  ('emergency_text',   '')
on conflict (key) do nothing;

-- ---------- SEED: events ----------
insert into public.events (title, date, location, descr, is_active)
select * from (values
  ('Mesyuarat Agung PIBG 2026',               '2026-07-15'::date, 'Dewan Sekolah',  '', true),
  ('Sambutan Hari Kemerdekaan ke-69',          '2026-08-31'::date, 'Padang Sekolah', '', true),
  ('Hari Terbuka & Pendaftaran Tahun 1 (2027)','2026-10-01'::date, 'SK Darau',       '', true)
) as v(title,date,location,descr,is_active)
where not exists (select 1 from public.events);
