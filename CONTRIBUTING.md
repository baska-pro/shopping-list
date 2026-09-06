# Contributing to Belanjaan

Kontribusi bug fix, peningkatan fitur, dokumentasi, dan perbaikan aksesibilitas diterima melalui pull request.

## Development workflow

1. Fork atau clone repository.
2. Buat branch dari `main`.
3. Install dependency menggunakan lockfile yang sudah dikomit:

```bash
bun install --frozen-lockfile
```

4. Jalankan pemeriksaan sebelum commit:

```bash
bun run typecheck
bun run build
```

5. Commit dengan pesan yang jelas dan terfokus.
6. Buka pull request ke `main`.

## Guidelines

- Gunakan TypeScript untuk perubahan source aplikasi.
- Pertahankan perilaku offline-first dan responsivitas mobile.
- Jangan commit `.env`, credential, token, private URL, Room Key, atau data pengguna.
- Jangan menambahkan administrative cloud credential ke frontend.
- Perubahan cloud sync harus tetap kompatibel dengan model keamanan di `SECURITY.md` dan schema terbaru.
- Screenshot publik disimpan di `assets/screenshoot/` dan harus bebas informasi sensitif.
- Jangan mengubah lockfile tanpa perubahan dependency yang memang diperlukan.

## Pull request checklist

- [ ] `bun install --frozen-lockfile` berhasil.
- [ ] `bun run typecheck` berhasil.
- [ ] `bun run build` berhasil.
- [ ] Tidak ada credential atau data pribadi pada diff.
- [ ] Dokumentasi diperbarui jika perilaku pengguna berubah.
