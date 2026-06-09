import path from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const PROD = process.env.NODE_ENV === 'production';

export default defineConfig({
  base: PROD ? '/admin/' : '/',
  plugins: [react()],
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
