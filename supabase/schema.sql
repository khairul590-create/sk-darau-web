-- ============================================================
-- SK Darau — Supabase schema, RLS, storage & seed
-- Run this in Supabase Dashboard → SQL Editor (one shot).
-- Safe to re-run: uses IF NOT EXISTS / ON CONFLICT where possible.
-- ============================================================

create extension if not exists "pgcrypto";

-- ---------- TABLES ----------
create table if not exists public.site_settings (
  key   text primary key,
  value text not null default ''
);

create table if not exists public.portal_links (
  id          uuid primary key default gen_random_uuid(),
  icon        text not null default '🔗',
  title       text not null,
  descr       text not null default '',
  url         text not null default '',
  gradient    text not null default 'linear-gradient(145deg,#3b82f6,#1d4ed8)',
  sort_order  int  not null default 0
);

create table if not exists public.gallery (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  subtitle    text not null default '',
  tag         text not null default 'Aktiviti',
  emoji       text default '📸',
  image_url   text,
  gradient    text not null default 'linear-gradient(155deg,#3b82f6,#1e3a8a)',
  sort_order  int  not null default 0,
  created_at  timestamptz not null default now()
);

create table if not exists public.announcements (
  id          uuid primary key default gen_random_uuid(),
  audience    text not null default 'ibu_bapa' check (audience in ('ibu_bapa','awam')),
  title       text not null,
  chip_label  text not null default 'Makluman',
  chip_color  text not null default '#2563eb',
  bar_color   text not null default '#2563eb',
  date        date not null default current_date,
  created_at  timestamptz not null default now()
);

create table if not exists public.messages (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null,
  phone       text,
  message     text not null,
  is_read     boolean not null default false,
  created_at  timestamptz not null default now()
);

-- ---------- ROW LEVEL SECURITY ----------
alter table public.site_settings  enable row level security;
alter table public.portal_links   enable row level security;
alter table public.gallery        enable row level security;
alter table public.announcements  enable row level security;
alter table public.messages       enable row level security;

-- Public can READ site content
drop policy if exists "read settings"   on public.site_settings;
drop policy if exists "read portal"     on public.portal_links;
drop policy if exists "read gallery"    on public.gallery;
drop policy if exists "read anns"       on public.announcements;
create policy "read settings" on public.site_settings for select using (true);
create policy "read portal"   on public.portal_links  for select using (true);
create policy "read gallery"  on public.gallery       for select using (true);
create policy "read anns"     on public.announcements for select using (true);

-- Only logged-in admins can WRITE site content
drop policy if exists "write settings" on public.site_settings;
drop policy if exists "write portal"   on public.portal_links;
drop policy if exists "write gallery"  on public.gallery;
drop policy if exists "write anns"     on public.announcements;
create policy "write settings" on public.site_settings for all to authenticated using (true) with check (true);
create policy "write portal"   on public.portal_links  for all to authenticated using (true) with check (true);
create policy "write gallery"  on public.gallery       for all to authenticated using (true) with check (true);
create policy "write anns"     on public.announcements for all to authenticated using (true) with check (true);

-- Messages: anyone may submit (INSERT); only admins may read/update/delete
drop policy if exists "submit message" on public.messages;
drop policy if exists "manage messages" on public.messages;
create policy "submit message"  on public.messages for insert to anon, authenticated with check (true);
create policy "manage messages" on public.messages for all to authenticated using (true) with check (true);

-- ---------- STORAGE: gallery bucket ----------
insert into storage.buckets (id, name, public)
values ('gallery', 'gallery', true)
on conflict (id) do nothing;

drop policy if exists "gallery public read"  on storage.objects;
drop policy if exists "gallery admin write"  on storage.objects;
drop policy if exists "gallery admin delete" on storage.objects;
create policy "gallery public read"  on storage.objects for select using (bucket_id = 'gallery');
create policy "gallery admin write"  on storage.objects for insert to authenticated with check (bucket_id = 'gallery');
create policy "gallery admin delete" on storage.objects for delete to authenticated using (bucket_id = 'gallery');

-- ---------- SEED (only if empty) ----------
insert into public.site_settings (key, value) values
  ('stat_1_num','1940'), ('stat_1_lbl','Ditubuhkan'),
  ('stat_2_num','XBA4007'), ('stat_2_lbl','Kod Sekolah'),
  ('stat_3_num','20'), ('stat_3_lbl','Guru Besar'),
  ('stat_4_num','A+'), ('stat_4_lbl','Gred Sekolah'),
  ('school_name','Sekolah Kebangsaan Darau'),
  ('school_phone','088-491 326'),
  ('school_email','sekkebdarau@gmail.com'),
  ('school_address','Peti Surat 11881, 88820 Kota Kinabalu, Sabah'),
  ('school_hours','Isnin – Jumaat · 7:30 pagi – 4:30 petang')
on conflict (key) do nothing;

insert into public.portal_links (icon, title, descr, url, gradient, sort_order)
select * from (values
  ('📚','e-Kurikulum','e-Learning, e-RPH, e-PBD, e-Panitia','','linear-gradient(145deg,#3b82f6,#1d4ed8)',1),
  ('🎒','Hal Ehwal Murid','Kehadiran, merit, disiplin, kebajikan','','linear-gradient(145deg,#38bdf8,#0284c7)',2),
  ('💻','DeLIMA SKDKK','Carian ID & platform pembelajaran','https://sites.google.com/moe.edu.my/login/login','linear-gradient(145deg,#6366f1,#4338ca)',3),
  ('🏆','Kokurikulum','Kelab, sukan, badan beruniform','','linear-gradient(145deg,#1e3a8a,#172554)',4)
) as v(icon,title,descr,url,gradient,sort_order)
where not exists (select 1 from public.portal_links);

insert into public.gallery (title, subtitle, tag, emoji, gradient, sort_order)
select * from (values
  ('Kelab Robotik','Juara peringkat daerah 2024','Inovasi','🤖','linear-gradient(155deg,#3b82f6,#1e3a8a)',1),
  ('MSSS SK Darau','Kejohanan olahraga tahunan','Sukan','🏃','linear-gradient(155deg,#38bdf8,#0369a1)',2),
  ('Sambutan Merdeka','Semangat cintakan negara','Patriotik','🇲🇾','linear-gradient(155deg,#6366f1,#3730a3)',3),
  ('Inovasi Sains','Pameran projek murid','STEM','🔬','linear-gradient(155deg,#60a5fa,#2563eb)',4),
  ('Minggu Bahasa','Memperkasa literasi murid','Akademik','📚','linear-gradient(155deg,#818cf8,#4f46e5)',5),
  ('Perkhemahan Pengakap','Membina sahsiah & kepimpinan','Kokurikulum','⚜️','linear-gradient(155deg,#1e3a8a,#172554)',6)
) as v(title,subtitle,tag,emoji,gradient,sort_order)
where not exists (select 1 from public.gallery);

insert into public.announcements (audience, title, chip_label, chip_color, bar_color, date)
select * from (values
  ('ibu_bapa','Mesyuarat Agung PIBG 2024','Penting','#6366f1','#6366f1','2024-06-28'::date),
  ('ibu_bapa','Yuran Tahunan & Insurans Murid','Pembayaran','#d4af37','#d4af37','2024-06-15'::date),
  ('ibu_bapa','Jadual Cuti Pertengahan Tahun','Makluman','#2563eb','#2563eb','2024-06-10'::date),
  ('awam','Sebut Harga Kantin Sekolah','Tender','#818cf8','#818cf8','2024-06-20'::date),
  ('awam','Hari Terbuka & Pendaftaran Tahun 1 (2025)','Pendaftaran','#38bdf8','#38bdf8','2024-06-01'::date),
  ('awam','Program Gotong-Royong Perdana','Komuniti','#0ea5e9','#0ea5e9','2024-05-25'::date)
) as v(audience,title,chip_label,chip_color,bar_color,date)
where not exists (select 1 from public.announcements);
