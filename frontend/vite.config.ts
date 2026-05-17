import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const apiUrl =
  process.env.VITE_API_URL ??
  (process.env.VERCEL ? '/api' : '/api');

export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify(apiUrl),
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true,
        // Cursor agent analyze can take 30–120s
        timeout: 180_000,
        proxyTimeout: 180_000,
      },
    },
  },
});
