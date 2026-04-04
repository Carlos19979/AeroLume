import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'Aerolume',
      fileName: 'aerolume',
      formats: ['iife'],
    },
    outDir: 'dist',
    minify: 'terser',
  },
});
