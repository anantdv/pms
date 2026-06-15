import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/assets/pms/dist/',
  build: {
    outDir: path.resolve(__dirname, 'pms/public/dist'),
    emptyOutDir: true,
    manifest: true,
    rollupOptions: {
      input: path.resolve(__dirname, 'index.html'),
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://192.168.101.180:8980',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
