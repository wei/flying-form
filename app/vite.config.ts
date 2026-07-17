import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // JP font subsets are small; without this they get base64-inlined into the blocking CSS
    assetsInlineLimit: 0,
  },
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
