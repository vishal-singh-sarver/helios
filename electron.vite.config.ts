import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { loadEnv } from 'vite'

const env = loadEnv('', process.cwd(), 'VITE_')
const backendUrl = env.VITE_BACKEND_URL

if (!backendUrl) {
  throw new Error('VITE_BACKEND_URL is not set. Add it to .env at the project root.')
}

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
    server: {
      proxy: {
        '/api': {
          target: backendUrl,
          changeOrigin: true
        }
      }
    },
    plugins: [react(), tailwindcss()]
  }
})
