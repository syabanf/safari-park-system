import path from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// Production builds run under a path prefix (single-root Vercel deploy);
// dev keeps the root so each app stays on its own port.
const PROD = process.env.NODE_ENV === 'production';

export default defineConfig({
  base: PROD ? '/member/' : '/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      injectRegister: false,
      manifest: {
        name: 'Taman Safari Annual Pass',
        short_name: 'TSI Pass',
        description: 'Annual Pass — Taman Safari Indonesia',
        theme_color: '#287338',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '.',
        lang: 'id-ID',
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
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,json}'],
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
    port: 5173,
    strictPort: true,
    host: true,
  },
  build: {
    target: 'es2020',
    // Single-root deploy: all 3 apps land under one dist/ in the monorepo root.
    outDir: PROD ? '../../dist/member' : 'dist',
    emptyOutDir: true,
    sourcemap: true,
  },
});
