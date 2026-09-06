-- ==========================================================
-- Supabase Schema untuk Belanjaan (Shopping Books) Sync
-- ==========================================================
-- Jalankan perintah SQL ini di menu "SQL Editor" pada Supabase Dashboard Anda.

-- 1. Buat tabel penyimpanan sinkronisasi
create table if not exists public.shopping_sync (
  id text primary key, -- Room ID / Passphrase (contoh: 'keluarga-bahagia')
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  payload jsonb not null
);

-- 2. Aktifkan Row Level Security (RLS)
alter table public.shopping_sync enable row level security;

-- 3. Buat policy akses publik menggunakan Anon Key
-- Catatan: Jika ingin lebih ketat, Anda dapat menambahkan token atau otentikasi Supabase Auth
create policy "Akses Belanjaan Multi Device" on public.shopping_sync 
  for all 
  using (true) 
  with check (true);

-- 4. Buat index pada kolom updated_at untuk performa
create index if not exists idx_shopping_sync_updated_at 
  on public.shopping_sync (updated_at desc);

-- Selesai! Tabel siap digunakan oleh aplikasi Belanjaan.
