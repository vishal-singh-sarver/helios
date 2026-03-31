import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/renderer/src/tests/setup.ts'],
    exclude: ['e2e/**', 'node_modules/**', 'out/**', 'dist/**']
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
