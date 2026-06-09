import path from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

const PROD = process.env.NODE_ENV === 'production';

export default defineConfig({
  base: PROD ? '/admin/' : '/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      injectRegister: false,
      manifest: {
        name: 'TSI Admin Console',
        short_name: 'TSI Admin',
        description: 'Taman Safari Indonesia · Annual Pass admin & ERP',
        theme_color: '#0c2110',
        background_color: '#faf9f3',
        display: 'standalone',
        orientation: 'any',
        start_url: '.',
        scope: PROD ? '/admin/' : '/',
        lang: 'id-ID',
        categories: ['business', 'productivity'],
        icons: [
          { src: 'icons/icon.svg', sizes: '192x192', type: 'image/svg+xml', purpose: 'any' },
          { src: 'icons/icon.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'any' },
          {
            src: 'icons/icon-maskable.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,json}'],
        navigateFallback: PROD ? '/admin/index.html' : '/index.html',
        navigateFallbackDenylist: [/^\/api\//],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5175,
    strictPort: true,
    host: true,
  },
  build: {
    target: 'es2020',
    outDir: PROD ? '../../dist/admin' : 'dist',
    emptyOutDir: true,
    sourcemap: true,
  },
});
