// vite.config.js
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@/api': path.resolve(__dirname, 'src/api/axiosInstance'),
      '@/constants': path.resolve(__dirname, 'src/utils/constants'),
      '@/pages': path.resolve(__dirname, 'src/pages'),
      '@/components': path.resolve(__dirname, 'src/components'),
    },
  },
});
