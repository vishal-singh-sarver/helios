/// <reference types="vite/client" />

import type { FileFilter, BackendStatus } from '../../preload/index'

declare global {
  interface Window {
    api: {
      openFile: (filters: FileFilter[]) => Promise<string | null>
      saveFile: (filters: FileFilter[], defaultPath?: string) => Promise<string | null>
      readFile: (filePath: string) => Promise<string>
      writeFile: (filePath: string, content: string) => Promise<void>
      getBackendStatus: () => Promise<BackendStatus>
      startBackend: () => Promise<{ ok: boolean }>
      stopBackend: () => Promise<{ ok: boolean }>
    }
  }
}
