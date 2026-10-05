import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

/**
 * Dev proxy mirroring deploy/nginx.conf. Each module is mounted under a
 * same-origin /api/<module> prefix; the prefix is stripped and the remainder
 * is forwarded to the module backend running on its standardized host port.
 */
const moduleApi = (target: string) => ({
  target,
  changeOrigin: true,
});

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      '/api/bus': {
        ...moduleApi('http://localhost:3100'),
        rewrite: (path) => path.replace(/^\/api\/bus/, ''),
      },
      '/api/tasks': {
        ...moduleApi('http://localhost:3102'),
        rewrite: (path) => path.replace(/^\/api\/tasks/, ''),
      },
      '/api/fly': {
        ...moduleApi('http://localhost:3101'),
        rewrite: (path) => path.replace(/^\/api\/fly/, ''),
      },
      '/api/weather': {
        ...moduleApi('http://localhost:3103'),
        rewrite: (path) => path.replace(/^\/api\/weather/, ''),
      },
    },
  },
});
