import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/renderer/src/tests/setup.ts'],
    exclude: ['e2e/**', 'node_modules/**', 'out/**', 'dist/**'],
    // Pin the timezone so any date/time-dependent test is deterministic across
    // machines. A local dev (e.g. IST) and CI (UTC) otherwise render the same
    // instant differently — see Weather/saga's fmtDate/fmtTime, which use
    // local-time getters. UTC is the lowest-surprise baseline and matches CI.
    env: { TZ: 'UTC' }
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
