-- ============================================================
-- SK Darau — "Dinding Kejayaan" (pencapaian murid & guru) schema
-- Run in Supabase Dashboard → SQL Editor (safe to re-run)
--
-- Dipapar di /kejayaan. Gambar pilihan — jika tiada, emoji + warna digunakan.
-- ============================================================

create table if not exists public.achievements (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,                    -- cth: Johan Robotik Kebangsaan 2026
  recipient    text not null default '',         -- nama murid/guru/pasukan
  level        text not null default 'Sekolah',  -- Sekolah | Daerah | Negeri | Kebangsaan | Antarabangsa
  descr        text not null default '',         -- penerangan ringkas
  image_url    text,                             -- gambar (pilihan), bucket achievements
  emoji        text not null default '🏆',
  gradient     text not null default 'linear-gradient(145deg,#d4af37,#b8860b)',
  date         date not null default current_date,
  is_active    boolean not null default true,
  sort_order   int not null default 0,
  created_at   timestamptz not null default now()
);
alter table public.achievements enable row level security;

drop policy if exists "read active achievements" on public.achievements;
drop policy if exists "admin read achievements"   on public.achievements;
drop policy if exists "write achievements"        on public.achievements;
create policy "read active achievements" on public.achievements for select using (is_active = true);
create policy "admin read achievements"   on public.achievements for select to authenticated using (true);
create policy "write achievements"        on public.achievements for all to authenticated using (true) with check (true);

-- ---------- STORAGE: achievements bucket ----------
insert into storage.buckets (id, name, public)
values ('achievements', 'achievements', true)
on conflict (id) do nothing;

drop policy if exists "achv public read"  on storage.objects;
drop policy if exists "achv admin write"  on storage.objects;
drop policy if exists "achv admin delete" on storage.objects;
create policy "achv public read"  on storage.objects for select using (bucket_id = 'achievements');
create policy "achv admin write"  on storage.objects for insert to authenticated with check (bucket_id = 'achievements');
create policy "achv admin delete" on storage.objects for delete to authenticated using (bucket_id = 'achievements');

-- (CADANGAN) Dashboard → Storage → bucket 'achievements' → had 5MB, MIME image/*
