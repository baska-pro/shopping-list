# Belanjaan / Shopping List

[![CI](https://github.com/baska-pro/shopping-list/actions/workflows/ci.yml/badge.svg)](https://github.com/baska-pro/shopping-list/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6-purple.svg)](https://vite.dev/)

**Belanjaan** adalah aplikasi daftar belanja berbasis React + TypeScript dengan pendekatan offline-first. Aplikasi mendukung daftar belanja aktif, checklist saat berbelanja, riwayat harga, resep Nusantara, input suara, berbagi WhatsApp, serta sinkronisasi opsional melalui Google Sheets atau Supabase.

## Fitur

- daftar belanja responsif untuk desktop dan mobile;
- mode checklist saat berbelanja;
- estimasi dan harga aktual;
- riwayat belanja dan basis data harga;
- katalog resep dan pemilihan bahan;
- input suara;
- impor daftar dari teks;
- ekspor gambar;
- berbagi ke WhatsApp;
- PWA dan dukungan offline;
- sinkronisasi multi-perangkat melalui Google Apps Script atau Supabase;
- penyimpanan lokal tanpa akun sebagai mode default.

## Screenshot

Tangkapan layar web app disimpan di:

```text
assets/screenshoot/
```

Gunakan nama yang konsisten, misalnya:

```text
home-mobile.png
home-desktop.png
shopping-mode-mobile.png
recipes-mobile.png
cloud-sync.png
```

Jangan memasukkan token, URL privat, Room Key, identitas akun, atau data pribadi ke screenshot.

## Teknologi

- React 19
- TypeScript
- Vite
- Bun
- vite-plugin-pwa
- Supabase JS
- Google Apps Script
- html2canvas
- lucide-react

## Menjalankan secara lokal

Prasyarat:

- Node.js 20 atau lebih baru
- Bun

```bash
git clone https://github.com/baska-pro/shopping-list.git
cd shopping-list
bun install --frozen-lockfile
bun run dev
```

Build produksi:

```bash
bun run typecheck
bun run build
bun run preview
```

## Cloud Sync

Cloud sync bersifat opsional. Mode lokal tetap dapat digunakan tanpa konfigurasi cloud.

### Google Sheets

1. Buat Google Spreadsheet.
2. Buka **Extensions > Apps Script**.
3. Tempel isi `code.gs`.
4. Disarankan membuka **Project Settings > Script Properties** dan menambahkan:

```text
BELANJAAN_SYNC_TOKEN=<token-panjang-acak>
```

5. Deploy sebagai **Web app**, jalankan sebagai pemilik spreadsheet, dan izinkan akses yang sesuai untuk deployment.
6. Masukkan URL `/exec` dan token yang sama di menu sinkronisasi aplikasi.

Token tidak dikirim melalui query string saat operasi data.

### Supabase

1. Buat proyek Supabase.
2. Buka **SQL Editor**.
3. Jalankan isi `supabase_schema.sql` terbaru.
4. Gunakan **Anon/Public Key** pada aplikasi.
5. Jangan pernah menggunakan administrative/service credentials di browser.

Skema v2.1.0 tidak memberi browser akses langsung ke tabel. Operasi dilakukan melalui RPC per Room Key, dan Room Key di-hash dengan SHA-256 di client sebelum dikirim.

Gunakan Room Key minimal 12 karakter dan sulit ditebak.

## Environment Variables

File `.env.example` hanya berisi contoh variabel opsional. Credential aktual tidak boleh di-commit.

```bash
cp .env.example .env.local
```

Konfigurasi cloud juga dapat disimpan langsung dari UI aplikasi.

## Struktur Proyek

```text
shopping-list/
├── assets/
│   └── screenshoot/
├── components/
├── constants/
├── services/
├── .github/
│   └── workflows/
├── App.tsx
├── code.gs
├── config.ts
├── index.html
├── index.tsx
├── package.json
├── supabase_schema.sql
├── types.ts
└── vite.config.ts
```

## CI

Setiap push dan pull request ke `main` menjalankan:

```text
bun install --frozen-lockfile
bun run typecheck
bun run build
```

Lockfile utama proyek adalah `bun.lock`.

## Keamanan

Lihat [SECURITY.md](SECURITY.md).

Ringkasnya:

- jangan commit credential;
- jangan gunakan credential administratif di frontend;
- gunakan token untuk deployment Google Apps Script publik;
- gunakan Room Key yang kuat;
- jangan menyertakan data sensitif dalam screenshot atau issue publik.

## Kontribusi

Lihat [CONTRIBUTING.md](CONTRIBUTING.md).

## Changelog

Lihat [CHANGELOG.md](CHANGELOG.md).

## Lisensi

Dirilis menggunakan [MIT License](LICENSE).
