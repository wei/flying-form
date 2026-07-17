import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // In prod this is a Firebase Hosting rewrite to the same function.
      '/api/kimi': {
        target: 'https://asia-northeast1-flying-form-9f6b3.cloudfunctions.net',
        changeOrigin: true,
        rewrite: () => '/kimi',
        timeout: 300000,
      },
    },
  },
})
