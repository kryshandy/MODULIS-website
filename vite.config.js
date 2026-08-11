import { defineConfig } from 'vite'
import { resolve } from 'node:path'

const root = process.cwd()

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      input: {
        main: resolve(root, 'index.html'),
        kavala: resolve(root, 'case-kavala.html'),
        nova: resolve(root, 'case-nova.html'),
        orbis: resolve(root, 'case-orbis.html'),
        pulse: resolve(root, 'case-pulse.html')
      }
    }
  }
})
