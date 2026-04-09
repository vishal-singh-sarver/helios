import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    plugins: []
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src'),
        components: resolve('src/renderer/src/components'),
        containers: resolve('src/renderer/src/containers'),
        utils: resolve('src/renderer/src/utils'),
        store: resolve('src/renderer/src/store')
      }
    },
    plugins: [react(), tailwindcss()]
  }
})
