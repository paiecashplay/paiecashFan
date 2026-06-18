import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

// paiecashfan-app — nouveau front React/Vite avec le design system du
// marketplace, branché sur le backend Hono existant (Cloudflare Worker port 5173).
// Port 5175 pour ne pas conflicter avec :
//   - 5173 → vite dev Hono Worker (legacy site + API)
//   - 5174 → pcc-marketplace (Frostrek)
//   - 3001 → backend Node Express
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  server: {
    port: 5175,
    proxy: {
      // En dev : backend Express sur :3001
      '/api': { target: 'http://localhost:3001', changeOrigin: true }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  }
});
