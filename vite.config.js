import { defineConfig } from 'vite'

export default defineConfig({
  base: '/krypto-kosmetik/',
  publicDir: 'public',
  server: {
    port: 3000
  },
  build: {
    outDir: 'dist',
    assetsInlineLimit: 0
  }
})
