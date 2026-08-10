import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    __APP_ENV__: process.env.VITE_VERCEL_ENV,
  },
  resolve: {
    alias: {
      "@packages/utils": path.resolve(import.meta.dirname, "../../packages/utils/utils.ts"),
      "@types": path.resolve(import.meta.dirname, "../server/generated/prisma/browser.ts")
    },
    tsconfigPaths: true
  }
});