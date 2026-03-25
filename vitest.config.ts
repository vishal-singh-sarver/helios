import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/renderer/src/tests/setup.ts']
  },
  resolve: {
    alias: {
      '@renderer': resolve('src/renderer/src'),
      components: resolve('src/renderer/src/components'),
      containers: resolve('src/renderer/src/containers'),
      utils: resolve('src/renderer/src/utils'),
      store: resolve('src/renderer/src/store')
    }
  }
})
