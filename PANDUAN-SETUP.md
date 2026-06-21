# Panduan Setup — Laman SK Darau

Website dah siap dibina. Sekarang sambung backend (Supabase) + deploy (Vercel). Semua **percuma**.

> Tanpa langkah ni pun website tetap jalan & nampak cantik (guna data contoh). Backend buat butang/content jadi **boleh urus sendiri**.

---

## A. Jalankan di komputer (lokal)

```bash
cd "sk-darau-web"
npm install
npm run dev
```

Buka http://localhost:3000

---

## B. Sambung Backend (Supabase) — ~10 minit

### 1. Buat projek Supabase
1. Pergi https://supabase.com → daftar (guna Google/GitHub) — percuma
2. **New Project** → nama: `sk-darau` → set **Database Password** (simpan!) → Region: **Southeast Asia (Singapore)** → Create
3. Tunggu ~2 minit projek siap

### 2. Run database schema
1. Sidebar → **SQL Editor** → **New query**
2. Buka fail [supabase/schema.sql](supabase/schema.sql), **copy semua**, paste, tekan **Run**
3. Akan cipta semua table + keselamatan + data contoh + storage gambar

### 3. Ambil kunci API
1. Sidebar → **Project Settings** (gear) → **API**
2. Copy 2 benda:
   - **Project URL** (cth `https://abcd.supabase.co`)
   - **anon public** key (kunci panjang)

### 4. Masukkan kunci ke website
1. Dalam folder `sk-darau-web`, salin `.env.local.example` → namakan `.env.local`
2. Isi:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://abcd.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   ```
3. Restart: `Ctrl+C` kemudian `npm run dev`

### 5. Cipta akaun admin (untuk login panel)
1. Supabase → sidebar **Authentication** → **Users** → **Add user** → **Create new user**
2. Isi e-mel + kata laluan (yg cikgu akan guna login). **Auto Confirm User: ON**
3. Pergi http://localhost:3000/admin → login → masuk panel!

---

## C. Email Notifikasi (PILIHAN) — bila ada mesej baru

1. Daftar percuma https://resend.com
2. **API Keys** → cipta → copy
3. Tambah dalam `.env.local`:
   ```
   RESEND_API_KEY=re_xxx
   RESEND_FROM_EMAIL=onboarding@resend.dev
   CONTACT_NOTIFY_EMAIL=sekkebdarau@gmail.com
   ```
> Tanpa ni, mesej tetap masuk panel admin (tab Mesej). Email cuma extra.

---

## D. Naik ke Internet (Vercel) — ~5 minit

1. Push folder `sk-darau-web` ke GitHub (repo baru)
2. Pergi https://vercel.com → daftar (GitHub) → **Add New → Project** → import repo
3. **Environment Variables** → masukkan benda sama macam `.env.local`
   (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, + Resend kalau ada)
4. **Deploy** → dapat URL `https://sk-darau.vercel.app`
5. (Pilihan) sambung domain sendiri di **Settings → Domains**

---

## Cara cikgu guna panel admin

Login di `URL/admin`. 4 tab:
- **📢 Makluman** — tambah/edit/padam pengumuman (ibu bapa / awam)
- **🖼️ Galeri** — upload gambar aktiviti + tajuk/tag
- **✉️ Mesej** — baca mesej dari borang Hubungi
- **⚙️ Tetapan** — tukar statistik, info sekolah, **URL portal cards**

Semua perubahan terus nampak di website. Tak payah sentuh code.
