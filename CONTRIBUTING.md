# Panduan Kontribusi (Contributing Guide)

Terima kasih atas minat Anda untuk berkontribusi pada **Belanjaan**! Kami sangat menyambut kontribusi perbaikan bug, penambahan fitur, dan penyempurnaan dokumentasi.

## Cara Berkontribusi

1. **Fork** repositori ini ke akun GitHub Anda.
2. Buat branch baru untuk fitur Anda:
   ```bash
   git checkout -b fitur/nama-fitur-baru
   ```
3. Lakukan perubahan kode dan pastikan standar tipe data terpenuhi:
   ```bash
   npm run typecheck
   npm run build
   ```
4. Commit perubahan Anda dengan pesan yang jelas:
   ```bash
   git commit -m "Menambahkan fitur X: penjelasan singkat"
   ```
5. Push ke branch Anda:
   ```bash
   git push origin fitur/nama-fitur-baru
   ```
6. Buat **Pull Request** ke branch `main` repositori utama.

## Konvensi Kode
- Gunakan TypeScript untuk keamanan tipe data.
- Gunakan Tailwind CSS untuk penataan gaya (styling).
- Pastikan tidak ada dependensi atau file kunci rahasia (`.env`) yang ter-commit.
