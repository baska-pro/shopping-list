# 🛒 Belanjaan (Shopping Books)

[![CI](https://github.com/username/shopping-books/actions/workflows/ci.yml/badge.svg)](https://github.com/username/shopping-books/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6-purple.svg)](https://vitejs.dev/)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-green.svg)](https://web.dev/progressive-web-apps/)

**Belanjaan** adalah aplikasi web modern, ringan, dan elegan untuk mengelola daftar belanja harian, mingguan, maupun bulanan. Dilengkapi dengan fitur **sinkronisasi multi-perangkat (Google Sheets & Supabase)**, input suara, impor teks instan, basis data harga otomatis, dan katalog resep masakan Nusantara.

---

## ✨ Fitur Unggulan

- **☁️ Sinkronisasi Multi-Perangkat (Cloud Sync):**
  - **Google Sheets Integration:** Simpan dan sinkronkan daftar belanja langsung ke Google Spreadsheet pribadi menggunakan script Google Apps Script (`code.gs`).
  - **Supabase Cloud (PostgreSQL):** Sinkronisasi database cloud berkecepatan tinggi antar smartphone (Android/iOS), tablet, dan laptop.
  - **Room Key Pairing:** Cukup masukkan kata kunci yang sama (contoh: `keluarga-santoso`) untuk sinkronisasi tanpa repot registrasi akun.
- **🎤 Input Suara Cepat (Voice Input):**
  - Cukup ucapkan belanjaan Anda (contoh: *"Beli telur 1 kilogram dan minyak goreng 2 liter"*), sistem akan mendeteksi nama, jumlah, dan satuan secara otomatis.
- **📋 Impor Teks Cepat (Batch Import):**
  - Salin-tempel daftar belanjaan dari chat WhatsApp atau aplikasi catatan, sistem akan memecahnya menjadi item-item belanja terstruktur.
- **🍲 Katalog Resep Nusantara:**
  - Pilih resep favorit (seperti Rendang, Sayur Asem, Ayam Goreng Lengkuas, Rawon) dan masukkan seluruh bahan-bahannya ke daftar belanja dengan satu sentuhan.
- **🛒 Mode Belanja Checklist (Layar Penuh):**
  - Tampilan fokus khusus saat berada di pasar/supermarket: centang barang yang sudah dibeli, input harga sebenarnya, dan rekap total pengeluaran secara langsung.
- **💰 Basis Data & Riwayat Harga:**
  - Aplikasi mencatat riwayat harga barang belanjaan sebelumnya sebagai estimasi otomatis untuk belanja berikutnya.
- **📱 PWA (Progressive Web App) & Offline-First:**
  - Dapat diinstal langsung di layar utama smartphone atau desktop, serta tetap berfungsi saat tidak ada koneksi internet.
- **💬 Berbagi ke WhatsApp & Ekspor Gambar:**
  - Format teks rapi siap kirim ke WhatsApp keluarga atau unduh daftar belanja dalam format gambar bersih.

---

## 🚀 Panduan Memulai Cepat (Local Development)

### Prasyarat
- Node.js versi 18 atau lebih baru
- npm, yarn, atau pnpm

### Langkah Instalasi
```bash
# 1. Klon repositori ini
git clone https://github.com/username/shopping-books.git
cd shopping-books

# 2. Pasang dependensi
npm install

# 3. Jalankan server pengembang lokal
npm run dev

# 4. Buka di browser
# http://localhost:3000 atau http://localhost:5173
```

### Script yang Tersedia
- `npm run dev`: Menjalankan aplikasi dalam mode development
- `npm run build`: Membangun bundle produksi di folder `dist/`
- `npm run preview`: Menjalankan preview lokal dari hasil build produksi
- `npm run typecheck`: Menjalankan pemeriksaan tipe data TypeScript

---

## ☁️ Panduan Setup Sinkronisasi Cloud

### 1. Opsi A: Google Sheets (Google Apps Script)
Anda dapat menggunakan Google Spreadsheet pribadi Anda sebagai tempat penyimpanan online gratis:
1. Buka [Google Sheets](https://sheets.new) dan buat spreadsheet baru.
2. Klik menu **Ekstensi > Apps Script**.
3. Hapus kode bawaan dan tempelkan seluruh isi file [`code.gs`](./code.gs) yang ada di repositori ini.
4. Klik tombol **Deploy (Terapkan) > New deployment (Penerapan baru)**.
5. Pilih tipe **Web app (Aplikasi web)**:
   - **Execute as:** *Me (email Anda)*
   - **Who has access:** *Anyone (Siapa saja)*
6. Klik **Deploy**, beri otorisasi akun Google Anda, lalu salin **Web App URL** (akhiran `/exec`).
7. Buka aplikasi Belanjaan > klik tombol **Cloud Sync** di kanan atas > pilih tab **Google Sheets**, tempelkan URL tersebut, lalu klik **Simpan**.

### 2. Opsi B: Supabase (PostgreSQL Cloud)
Jika menginginkan sinkronisasi instan berkecepatan tinggi:
1. Buat proyek gratis di [Supabase](https://supabase.com/).
2. Buka menu **SQL Editor** pada dashboard Supabase Anda.
3. Jalankan script SQL yang tersedia di file [`supabase_schema.sql`](./supabase_schema.sql):
   ```sql
   create table if not exists public.shopping_sync (
     id text primary key,
     updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
     payload jsonb not null
   );
   alter table public.shopping_sync enable row level security;
   create policy "Akses Belanjaan Multi Device" on public.shopping_sync 
     for all using (true) with check (true);
   ```
4. Salin **Project URL** dan **Anon (Public) Key** dari menu *Project Settings > API*.
5. Buka aplikasi Belanjaan > klik tombol **Cloud Sync** > pilih tab **Supabase**, masukkan data tersebut, lalu klik **Simpan**.

---

## 📁 Struktur Proyek

```text
shopping-books/
├── .github/
│   └── workflows/
│       └── ci.yml              # GitHub Actions Continuous Integration
├── components/                 # Komponen React UI
│   ├── AddItemForm.tsx         # Form penambahan barang belanja
│   ├── ChecklistView.tsx       # Tampilan fokus belanja layar penuh
│   ├── CloudSyncModal.tsx      # Modal konfigurasi & aksi sinkronisasi cloud
│   ├── HistoryView.tsx         # Riwayat sesi belanja
│   ├── IngredientPickerModal.tsx # Pemilih bahan belanja cepat
│   ├── RecipePickerModal.tsx   # Katalog resep masakan Nusantara
│   ├── ShoppingList.tsx        # Tabel dan kartu daftar belanja aktif
│   └── WhatsAppShareModal.tsx  # Modal berbagi ke WhatsApp
├── services/                   # Layanan logika bisnis & integrasi
│   ├── sheetsService.ts        # Komunikasi HTTP ke Google Apps Script
│   ├── supabaseService.ts      # Koneksi database Supabase
│   └── syncService.ts          # Orkestrasi sinkronisasi & resolusi data
├── code.gs                     # Script backend Google Apps Script
├── config.ts                   # Konfigurasi aplikasi & storage keys
├── supabase_schema.sql         # Skema database Supabase
├── types.ts                    # Definisi TypeScript interface & enum
├── index.html                  # Dokumen HTML utama & manifest PWA
├── package.json                # Metadata proyek & daftar dependensi
├── vite.config.ts              # Konfigurasi bundler Vite & PWA
└── README.md                   # Dokumentasi proyek
```

---

## 🚢 Panduan Deployment

### Vercel / Netlify / Cloudflare Pages
Aplikasi ini adalah Single Page Application (SPA) berbasis Vite standar. Anda dapat menghubungkannya langsung ke akun GitHub Anda:
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Node Version:** 18+

---

## 📄 Lisensi

Proyek ini dilisensikan di bawah [MIT License](LICENSE).
Bebas digunakan, dimodifikasi, dan didistribusikan untuk keperluan pribadi maupun komersial.
