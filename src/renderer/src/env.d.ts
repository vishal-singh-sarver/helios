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
      getBackendUrl: () => Promise<string | null>
      startBackend: () => Promise<{ ok: boolean }>
      stopBackend: () => Promise<{ ok: boolean }>
      windowMinimize: () => Promise<void>
      windowToggleMaximize: () => Promise<boolean>
      windowClose: () => Promise<void>
      windowIsMaximized: () => Promise<boolean>
      windowIsFullScreen: () => Promise<boolean>
      onFullScreenChange: (cb: (isFullScreen: boolean) => void) => () => void
      getPlatform: () => Promise<NodeJS.Platform>
    }
    __APP_BASE_URL__?: string
  }
}
