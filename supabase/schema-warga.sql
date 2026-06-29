-- ============================================================
-- SK Darau — Ruang "Warga Sekolah" (pentadbir & guru) schema
-- Run in Supabase Dashboard → SQL Editor (safe to re-run)
--
-- Dipapar di /guru, dikumpul ikut kategori:
--   gb   = Guru Besar
--   pk   = Penolong Kanan
--   guru = Guru
--   staf = Staf Sokongan (AKP)
-- Gambar pilihan — jika tiada, huruf awalan nama digunakan.
-- ============================================================

create table if not exists public.staff (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,                    -- nama penuh
  position   text not null default '',         -- jawatan (cth: Guru Besar, Guru Akademik)
  category   text not null default 'guru',     -- gb | pk | guru | staf
  subject    text not null default '',         -- mata pelajaran / panitia (pilihan)
  image_url  text,                             -- gambar (pilihan), bucket staff
  gradient   text not null default 'linear-gradient(145deg,#3b82f6,#1d4ed8)',
  is_active  boolean not null default true,    -- sorok tanpa padam (cth: bertukar)
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
alter table public.staff enable row level security;

-- RLS: awam baca yang aktif; admin (authenticated) baca + tulis semua
drop policy if exists "read active staff" on public.staff;
drop policy if exists "admin read staff"  on public.staff;
drop policy if exists "write staff"       on public.staff;
create policy "read active staff" on public.staff for select using (is_active = true);
create policy "admin read staff"  on public.staff for select to authenticated using (true);
create policy "write staff"       on public.staff for all to authenticated using (true) with check (true);

-- ---------- STORAGE: staff bucket ----------
insert into storage.buckets (id, name, public)
values ('staff', 'staff', true)
on conflict (id) do nothing;

drop policy if exists "staff public read"  on storage.objects;
drop policy if exists "staff admin write"  on storage.objects;
drop policy if exists "staff admin delete" on storage.objects;
create policy "staff public read"  on storage.objects for select using (bucket_id = 'staff');
create policy "staff admin write"  on storage.objects for insert to authenticated with check (bucket_id = 'staff');
create policy "staff admin delete" on storage.objects for delete to authenticated using (bucket_id = 'staff');

-- ---------- (CADANGAN) Had saiz upload ----------
-- Supabase Dashboard → Storage → bucket 'staff' → Settings:
--   had saiz 5MB, allowed MIME image/*
