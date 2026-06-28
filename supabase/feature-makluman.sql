-- ============================================================
-- SK Darau — Makluman: auto-arkib (tarikh tamat)
-- Run in Supabase SQL Editor. Safe to re-run.
--
-- Tambah lajur expires_at. Bila diisi & tarikh dah lepas, makluman
-- auto-sorok dari website (admin masih nampak + boleh padam).
-- ============================================================

alter table public.announcements
  add column if not exists expires_at date;

-- (pilihan) had panjang chip_label supaya kemas
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'ann_chip_len') then
    alter table public.announcements
      add constraint ann_chip_len check (char_length(chip_label) <= 40);
  end if;
end $$;
