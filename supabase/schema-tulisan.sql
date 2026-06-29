-- ============================================================
-- SK Darau — Ruang "Tulisan" (artikel guru) schema
-- Run in Supabase Dashboard → SQL Editor (safe to re-run)
--
-- Setiap tulisan boleh jadi:
--   (a) teks penuh  → content diisi, dipapar di /tulisan/[slug]
--   (b) pautan luar → external_url diisi, kad lompat keluar
-- Awam hanya nampak yang is_published = true; admin nampak semua.
-- ============================================================

-- ---------- WRITINGS ----------
create table if not exists public.writings (
  id           uuid primary key default gen_random_uuid(),
  author       text not null,                    -- nama penulis / guru
  title        text not null,
  slug         text unique not null,             -- untuk URL /tulisan/{slug}
  excerpt      text not null default '',         -- ringkasan pendek (kad)
  content      text not null default '',         -- teks penuh (jenis teks)
  external_url text,                             -- pautan blog luar (jenis pautan)
  image_url    text,                             -- gambar utama (pilihan), bucket writings
  emoji        text not null default '✍️',       -- fallback bila tiada gambar
  gradient     text not null default 'linear-gradient(145deg,#3b82f6,#1d4ed8)',
  is_published boolean not null default false,
  publish_date date not null default current_date,
  sort_order   int not null default 0,
  created_at   timestamptz not null default now()
);
alter table public.writings enable row level security;

-- RLS: awam baca yang published; admin (authenticated) baca + tulis semua
drop policy if exists "read published writings" on public.writings;
drop policy if exists "admin read writings"     on public.writings;
drop policy if exists "write writings"          on public.writings;
create policy "read published writings" on public.writings for select using (is_published = true);
create policy "admin read writings"     on public.writings for select to authenticated using (true);
create policy "write writings"          on public.writings for all to authenticated using (true) with check (true);

-- ---------- STORAGE: writings bucket ----------
insert into storage.buckets (id, name, public)
values ('writings', 'writings', true)
on conflict (id) do nothing;

drop policy if exists "writings public read"  on storage.objects;
drop policy if exists "writings admin write"  on storage.objects;
drop policy if exists "writings admin delete" on storage.objects;
create policy "writings public read"  on storage.objects for select using (bucket_id = 'writings');
create policy "writings admin write"  on storage.objects for insert to authenticated with check (bucket_id = 'writings');
create policy "writings admin delete" on storage.objects for delete to authenticated using (bucket_id = 'writings');

-- ---------- (CADANGAN) Had saiz upload ----------
-- Supabase Dashboard → Storage → bucket 'writings' → Settings:
--   had saiz 5MB, allowed MIME image/*
-- (Tak boleh set ikut SQL biasa — buat di dashboard.)
