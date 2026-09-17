import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  root: 'demo',
  base: './',
  plugins: [react()],
  define: {
    __VUE_OPTIONS_API__: true,
    __VUE_PROD_DEVTOOLS__: false,
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false,
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom/client',
      'vue',
      '@angular/core',
      '@angular/common',
      '@angular/compiler',
      '@angular/platform-browser',
      'rxjs',
    ],
  },
  resolve: { alias: { orfinsupport: fileURLToPath(new URL('./src/index.ts', import.meta.url)) } },
  server: { port: 4173, strictPort: true, proxy: { '/api': 'http://127.0.0.1:4174' } },
  build: {
    outDir: '../dist-demo',
    emptyOutDir: true,
    rolldownOptions: { input: fileURLToPath(new URL('./demo/index.html', import.meta.url)) },
  },
});
