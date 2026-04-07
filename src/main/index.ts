import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { promises as fs } from 'fs'

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
// Wire these to your actual backend process management logic.

ipcMain.handle('backend:getStatus', async () => {
  // TODO: return actual backend process status
  return { running: false, pid: null }
})

ipcMain.handle('backend:start', async () => {
  // TODO: spawn backend process
  return { ok: true }
})

ipcMain.handle('backend:stop', async () => {
  // TODO: kill backend process
  return { ok: true }
})

// --- App lifecycle ---

app.whenReady().then(() => {
  if (process.platform === 'win32') {
    app.setAppUserModelId('com.navyug.helios')
  }

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
