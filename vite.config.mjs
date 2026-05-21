import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/modern-weather-forecast-lab/',
  plugins: [react()],
  optimizeDeps: {
    include: ['lodash/get'],
    noDiscovery: false,
  },
});
