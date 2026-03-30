import { app, BrowserWindow, dialog, ipcMain, shell } from 'electron'
import { promises as fs } from 'fs'
import { join } from 'path'
import { backendManager } from './backend-manager'

const isDev = !app.isPackaged

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (isDev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// Set a stable userData location before app readiness so Electron
// does not create platform-default folders with inconsistent naming.
if (process.platform === 'win32') {
  app.setAppUserModelId('com.navyug.helios')
  app.setPath('userData', join(process.env.APPDATA || '', 'Helios'))
} else if (process.platform === 'darwin') {
  app.setPath('userData', join(process.env.HOME || '', 'Library/Application Support/Helios'))
} else {
  app.setPath('userData', join(process.env.HOME || '', '.config/Helios'))
}

// --- File dialog IPC handlers ---

ipcMain.handle('dialog:openFile', async (_event, filters: Electron.FileFilter[]) => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters
  })
  return result.canceled ? null : result.filePaths[0]
})

ipcMain.handle('dialog:saveFile', async (_event, filters: Electron.FileFilter[], defaultPath?: string) => {
  const result = await dialog.showSaveDialog({
    filters,
    defaultPath
  })
  return result.canceled ? null : result.filePath
})

ipcMain.handle('fs:readFile', async (_event, filePath: string) => {
  return fs.readFile(filePath, 'utf-8')
})

ipcMain.handle('fs:writeFile', async (_event, filePath: string, content: string) => {
  await fs.writeFile(filePath, content, 'utf-8')
})

// --- Backend session IPC handlers ---

ipcMain.handle('backend:getStatus', async () => {
  return backendManager.getBackendStatus()
})

ipcMain.handle('backend:start', async () => {
  return backendManager.startBackend()
})

ipcMain.handle('backend:stop', async () => {
  return backendManager.stopBackend()
})

// --- App lifecycle ---

app.whenReady().then(() => {
  backendManager.startBackend().then((status) => {
    if (status.running) {
      console.log(`Backend started (PID: ${status.pid}, Port: ${status.port})`)
    } else {
      console.error(`Failed to start backend: ${status.error}`)
    }
  })

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('before-quit', async () => {
  await backendManager.cleanup()
})
