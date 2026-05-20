import { app, BrowserWindow, dialog, ipcMain, Menu, shell } from 'electron'
import { promises as fs, mkdirSync, writeFileSync } from 'fs'
import { tmpdir } from 'os'
import { join, resolve } from 'path'
import { backendManager } from './backend-manager'

const isDev = !app.isPackaged

function getPlatformUserDataPath(homeDir: string): string {
  if (process.platform === 'win32') {
    return join(homeDir, 'AppData/Roaming/Helios')
  }

  if (process.platform === 'darwin') {
    return join(homeDir, 'Library/Application Support/Helios')
  }

  return join(homeDir, '.config/Helios')
}

/**
 * Early startup logger - writes to a stable location even if app crashes early.
 * Use this before backendManager is initialized.
 */
function getEarlyLogPath(): string {
  const homeDir = app.getPath('home')
  const logDir = join(getPlatformUserDataPath(homeDir), 'logs')
  return join(logDir, 'app-startup.log')
}

function writeEarlyLog(message: string): void {
  try {
    const logPath = getEarlyLogPath()
    const logDir = join(logPath, '..')

    // Ensure directory exists
    mkdirSync(logDir, { recursive: true })

    // Append timestamp and message
    const line = `${new Date().toISOString()} ${message}\n`
    writeFileSync(logPath, line, { flag: 'a' })
  } catch (error) {
    // If early logging fails, at least log to console
    console.error('[Early Log Error]', error)
  }
}

function createWindow(onReadyToShow?: () => void): BrowserWindow {
  const mainWindow = new BrowserWindow({
    width: 1000,
    height: 600,
    show: false,
    autoHideMenuBar: true,
    // Frameless: the renderer paints its own title bar (traffic lights on
    // Mac, min/max/close on Linux/Windows). Drag regions are set in CSS.
    frame: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
    onReadyToShow?.()
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

  return mainWindow
}

/**
 * Create a minimal splash/loading window shown while backend is starting.
 * This provides visual feedback that the app is initializing.
 */
function createSplashWindow(): BrowserWindow {
  const splash = new BrowserWindow({
    width: 620,
    height: 400,
    show: true,
    frame: false,
    alwaysOnTop: true,
    webPreferences: {
      nodeIntegration: false,
      sandbox: true
    }
  })

  const logoPath = app.isPackaged
    ? join(process.resourcesPath, 'Helios_splash.png')
    : resolve(__dirname, '../../resources/Helios_splash.png')
  const logoUrl = `file://${logoPath.replace(/\\/g, '/')}`

  const splashHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        html, body {
          width: 100%;
          height: 100%;
          overflow: hidden;
        }
        body {
          position: relative;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }
        .logo {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
      </style>
    </head>
    <body>
      <img class="logo" src="${logoUrl}" />
    </body>
    </html>
  `

  const tmpHtml = join(tmpdir(), 'helios-splash.html')
  writeFileSync(tmpHtml, splashHtml)
  splash.loadFile(tmpHtml)
  return splash
}

/**
 * Install an application menu so users can open new windows via Cmd+N / Ctrl+N.
 * autoHideMenuBar on main windows keeps the menu visually hidden on Linux/Windows
 * while still making accelerators work. On macOS the menu lives at the top of
 * the screen as usual.
 */
function buildAppMenu(): void {
  const isMac = process.platform === 'darwin'
  const template: Electron.MenuItemConstructorOptions[] = [
    ...(isMac
      ? [
          {
            label: app.name,
            submenu: [
              { role: 'about' as const },
              { type: 'separator' as const },
              { role: 'services' as const },
              { type: 'separator' as const },
              { role: 'hide' as const },
              { role: 'hideOthers' as const },
              { role: 'unhide' as const },
              { type: 'separator' as const },
              { role: 'quit' as const }
            ]
          }
        ]
      : []),
    {
      label: 'File',
      submenu: [
        {
          label: 'New Window',
          accelerator: 'CmdOrCtrl+N',
          click: () => createWindow()
        },
        { type: 'separator' },
        isMac ? { role: 'close' as const } : { role: 'quit' as const }
      ]
    },
    { role: 'editMenu' },
    { role: 'viewMenu' },
    { role: 'windowMenu' }
  ]
  Menu.setApplicationMenu(Menu.buildFromTemplate(template))
}

/**
 * Configure platform-specific shortcuts shown in the OS shell:
 * - macOS: dock icon right-click menu (app.dock.setMenu)
 * - Windows: taskbar jump list (app.setUserTasks)
 * - Linux: handled via .desktop file Actions (see linux-installer/helios.desktop)
 *
 * On Windows, the jump list item re-launches the Helios executable. The new
 * process hits the single-instance lock, which triggers the 'second-instance'
 * handler in the running instance, which then calls createWindow().
 */
function configurePlatformShortcuts(): void {
  if (process.platform === 'darwin') {
    const dockMenu = Menu.buildFromTemplate([
      {
        label: 'New Window',
        click: () => createWindow()
      }
    ])
    app.dock?.setMenu(dockMenu)
    writeEarlyLog('macOS dock menu configured with "New Window" item')
    return
  }

  if (process.platform === 'win32') {
    try {
      app.setUserTasks([
        {
          program: process.execPath,
          arguments: '',
          iconPath: process.execPath,
          iconIndex: 0,
          title: 'New Window',
          description: 'Open a new Helios window'
        }
      ])
      writeEarlyLog('Windows jump list configured with "New Window" task')
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error)
      writeEarlyLog(`Failed to configure Windows jump list: ${msg}`)
    }
  }
}

/**
 * Set userData path using Electron APIs (not environment variables).
 * This ensures the path is correct even when launched from Finder in packaged mode.
 * Must be called BEFORE app.whenReady() to prevent Electron from creating
 * platform-specific default folders.
 */
function setUserDataPath(): void {
  const homeDir = app.getPath('home')

  if (process.platform === 'win32') {
    app.setAppUserModelId('com.navyug.helios')
  }

  const userDataPath = getPlatformUserDataPath(homeDir)
  app.setPath('userData', userDataPath)
  writeEarlyLog(`${process.platform}: userData=${userDataPath}`)
}

// Initialize paths and early logging BEFORE app is ready
writeEarlyLog('='.repeat(80))
writeEarlyLog(`App startup initiated [packaged=${app.isPackaged}, platform=${process.platform}]`)
setUserDataPath()

// Acquire single-instance lock AFTER setUserDataPath so the lock file uses
// the correct userData directory. If another Helios is already running, this
// process quits immediately — but before it does, Electron notifies the
// running instance via the 'second-instance' event (which we handle below
// to open a new window instead of starting a second backend).
const gotSingleInstanceLock = app.requestSingleInstanceLock()

if (!gotSingleInstanceLock) {
  writeEarlyLog('Another Helios instance is already running — quitting this process')
  app.quit()
  process.exit(0)
}

// Only the first (and only) instance reaches this point.
// When another Helios is launched, Electron fires 'second-instance' here
// instead of spawning a new OS process.
app.on('second-instance', () => {
  writeEarlyLog('second-instance event received — opening a new window')
  createWindow()
})

// --- Window control IPC handlers ---
// Frameless windows have no native controls, so the renderer paints its own
// and asks the main process to perform the action.

ipcMain.handle('window:minimize', (event) => {
  BrowserWindow.fromWebContents(event.sender)?.minimize()
})

ipcMain.handle('window:toggleMaximize', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender)
  if (!win) return false
  if (win.isMaximized()) {
    win.unmaximize()
    return false
  }
  win.maximize()
  return true
})

ipcMain.handle('window:close', (event) => {
  BrowserWindow.fromWebContents(event.sender)?.close()
})

ipcMain.handle('window:isMaximized', (event) => {
  return BrowserWindow.fromWebContents(event.sender)?.isMaximized() ?? false
})

ipcMain.handle('window:getPlatform', () => process.platform)

// --- File dialog IPC handlers ---

ipcMain.handle('dialog:openFile', async (event, filters: Electron.FileFilter[]) => {
  // Attach the dialog to the calling window so it becomes a modal sheet on
  // macOS (and stays on top on other platforms). Without this the dialog
  // floats free — the user can click back to the app while it's still open
  // behind the scenes, leaving the renderer's "Opening…" state stuck.
  const win = BrowserWindow.fromWebContents(event.sender)
  const result = win
    ? await dialog.showOpenDialog(win, { properties: ['openFile'], filters })
    : await dialog.showOpenDialog({ properties: ['openFile'], filters })
  return result.canceled ? null : result.filePaths[0]
})

ipcMain.handle(
  'dialog:saveFile',
  async (event, filters: Electron.FileFilter[], defaultPath?: string) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    const result = win
      ? await dialog.showSaveDialog(win, { filters, defaultPath })
      : await dialog.showSaveDialog({ filters, defaultPath })
    return result.canceled ? null : result.filePath
  }
)

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

ipcMain.handle('backend:getUrl', async () => {
  const status = backendManager.getBackendStatus()
  return status.port ? `http://127.0.0.1:${status.port}` : null
})

ipcMain.handle('backend:start', async () => {
  return backendManager.startBackend()
})

ipcMain.handle('backend:stop', async () => {
  return backendManager.stopBackend()
})

ipcMain.handle('backend:getLogFile', async () => {
  const runtimePaths = {
    logFile: join(app.getPath('userData'), 'logs', 'backend.log'),
    userData: app.getPath('userData'),
    home: app.getPath('home')
  }
  return runtimePaths
})

// --- App lifecycle ---

const SKIP_BACKEND = process.env.HELIOS_SKIP_BACKEND === '1'

app.whenReady().then(async () => {
  writeEarlyLog(`App ready - showing splash and waiting for backend...`)

  // Show splash screen while backend is starting
  const splash = createSplashWindow()

  if (SKIP_BACKEND) {
    writeEarlyLog('HELIOS_SKIP_BACKEND=1 set - skipping backend startup')
    console.log('HELIOS_SKIP_BACKEND=1 set - skipping backend startup')
    buildAppMenu()
    configurePlatformShortcuts()
    createWindow(() => {
      if (!splash.isDestroyed()) {
        splash.destroy()
      }
    })

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
    return
  }

  try {
    // CRITICAL: Wait for backend to be ready before showing the main window.
    // This prevents the UI appearing "ready" while the backend is still starting or failing.
    const status = await backendManager.startBackend()

    if (!status.running) {
      const errorMsg = status.error || 'unknown error'
      writeEarlyLog(`FAILED to start backend: ${errorMsg}`)
      writeEarlyLog(`Backend log file: ${status.logFile || 'not available'}`)
      console.error(`Failed to start backend: ${errorMsg}`)

      // Close splash screen
      splash?.destroy()

      // Show error dialog - do NOT create main window
      // This ensures the user sees the error immediately
      const errorDetails = `Failed to start the backend server:\n\n${errorMsg}\n\nCheck logs at: ${status.logFile}`

      if (app.isPackaged) {
        // In packaged mode, user won't see console - show dialog
        await dialog.showErrorBox('Backend Error', errorDetails)
      } else {
        console.error(errorDetails)
      }

      // Exit gracefully after showing error
      app.quit()
      return
    }

    // Keep the splash alive until the main window is ready.
    // This avoids a zero-window gap that would trigger window-all-closed on Linux/Windows.
    writeEarlyLog(`Backend started successfully [PID=${status.pid}, port=${status.port}]`)
    console.log(`Backend started (PID: ${status.pid}, Port: ${status.port})`)

    buildAppMenu()
    configurePlatformShortcuts()

    createWindow(() => {
      if (!splash.isDestroyed()) {
        splash.destroy()
      }
    })
  } catch (error) {
    splash?.destroy()
    const message = error instanceof Error ? error.message : String(error)
    writeEarlyLog(`EXCEPTION during backend startup: ${message}`)
    console.error('Exception during backend startup:', error)

    await dialog.showErrorBox('Startup Error', `An unexpected error occurred:\n\n${message}`)
    app.quit()
    return
  }

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
  if (SKIP_BACKEND) {
    writeEarlyLog('App before-quit: backend was skipped, nothing to clean up')
    return
  }
  writeEarlyLog('App before-quit: stopping backend...')
  await backendManager.cleanup()
  writeEarlyLog('App shutdown complete')
})
