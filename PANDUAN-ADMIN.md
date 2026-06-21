# Panduan Admin — Laman SK Darau

Panduan ringkas untuk cikgu/staf urus website sekolah. **Tak perlu tahu coding.**

---

## 1. Cara Log Masuk

1. Buka pelayar (Chrome/Safari), pergi: **https://sk-darau-web.vercel.app/admin**
2. Masukkan **e-mel** + **kata laluan** admin
3. Klik **Log Masuk** → masuk ke panel

> Lupa kata laluan? Reset di Supabase (Authentication → Users) atau minta orang IT.
> **Jangan kongsi kata laluan** dengan orang luar.

---

## 2. Panel ada 4 bahagian (tab)

### 📢 Makluman
Pengumuman yang papar di website (bahagian "Makluman Terkini").
- **Tambah**: isi tajuk, pilih **Untuk Siapa** (Ibu Bapa / Awam), tarikh, label (cth "Penting"), warna → klik **Tambah Makluman**
- **Edit**: klik **Edit** pada senarai → ubah → **Simpan Perubahan**
- **Padam**: klik **Padam**
- Perubahan **terus nampak** di website.

### 🖼️ Galeri
Gambar aktiviti sekolah (bahagian "Galeri Sekolah").
- Isi **tajuk** + **subtajuk** + **tag** (cth "Sukan")
- **Muat naik gambar** (JPG/PNG) — atau biar kosong guna emoji
- Klik **Tambah ke Galeri**
- Nak buang: klik **Padam**

### ✉️ Mesej
Mesej dari orang ramai (borang "Hubungi Kami" di website).
- Senarai semua mesej + e-mel + telefon
- Klik e-mel untuk balas terus
- **Tanda sudah baca** / **Padam**

### ⚙️ Tetapan
- **Pautan Portal**: letak URL untuk 4 kad portal (e-Kurikulum, HEM, DeLIMA, Kokurikulum)
- **Statistik**: tukar nombor di bahagian atas (tahun, kod sekolah, dll)
- **Maklumat Sekolah**: telefon, e-mel, alamat, waktu operasi
- Klik **Simpan** selepas ubah

---

## 3. Perkara penting

- ✅ **Semua perubahan content terus live** — tak perlu buat apa-apa lagi
- ✅ Website automatik **selamat** — orang ramai tak boleh edit
- ✅ Boleh guna dari **telefon** atau komputer
- ⚠️ **Log Keluar** selepas guna (terutama komputer kongsi) — butang kanan atas
- ⚠️ Gambar — guna saiz munasabah (bawah 2MB) supaya laju

---

## 4. Soalan biasa

**Q: Saya tukar makluman tapi tak nampak?**
Refresh halaman website (tarik turun / F5).

**Q: Boleh ada lebih satu akaun admin?**
Boleh — tambah user baru di Supabase (Authentication → Users).

**Q: Website tetap jalan kalau saya tak update?**
Ya. Content kekal sampai kau ubah.

---

Laman awam: **https://sk-darau-web.vercel.app**
Panel admin: **https://sk-darau-web.vercel.app/admin**
