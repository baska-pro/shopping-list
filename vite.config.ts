import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

const REPO_BASE = process.env.GITHUB_ACTIONS ? '/shopping-list/' : '/';

export default defineConfig({
  base: REPO_BASE,
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg'],
      manifest: {
        id: REPO_BASE,
        name: 'Belanjaan - Smart Shopping List',
        short_name: 'Belanjaan',
        description: 'Aplikasi daftar belanja offline-first dengan input suara, resep Nusantara, riwayat harga, dan sinkronisasi cloud.',
        theme_color: '#16a34a',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: REPO_BASE,
        scope: REPO_BASE,
        lang: 'id',
        icons: [
          {
            src: `${REPO_BASE}icon.svg`,
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/cdn\.tailwindcss\.com\//,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'tailwind-cdn',
              expiration: {
                maxEntries: 4,
                maxAgeSeconds: 60 * 60 * 24 * 30
              }
            }
          }
        ]
      },
      devOptions: {
        enabled: true,
      }
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    }
  }
});
