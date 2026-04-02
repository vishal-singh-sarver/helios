import { app, BrowserWindow, dialog, ipcMain, shell } from 'electron'
import { promises as fs, mkdirSync, writeFileSync } from 'fs'
import { join } from 'path'
import { backendManager } from './backend-manager'

const isDev = !app.isPackaged

/**
 * Early startup logger - writes to a stable location even if app crashes early.
 * Use this before backendManager is initialized.
 */
function getEarlyLogPath(): string {
  // Use app.getPath('home') - works reliably in packaged apps launched from Finder
  const homeDir = app.getPath('home')
  const logDir = join(homeDir, 'Library/Application Support/Helios/logs')
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

/**
 * Create a minimal splash/loading window shown while backend is starting.
 * This provides visual feedback that the app is initializing.
 */
function createSplashWindow(): BrowserWindow {
  const splash = new BrowserWindow({
    width: 400,
    height: 300,
    show: true,
    frame: false,
    alwaysOnTop: true,
    webPreferences: {
      nodeIntegration: false,
      sandbox: true
    }
  })

  // Create minimal HTML for splash screen
  const splashHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          margin: 0;
          padding: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          color: white;
        }
        .container {
          text-align: center;
        }
        .spinner {
          border: 3px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top: 3px solid white;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          margin: 0 auto 20px;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .text {
          font-size: 16px;
          opacity: 0.9;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="spinner"></div>
        <div class="text">Starting Helios...</div>
      </div>
    </body>
    </html>
  `

  splash.loadURL(`data:text/html,${encodeURIComponent(splashHtml)}`)
  return splash
}


/**
 * Set userData path using Electron APIs (not environment variables).
 * This ensures the path is correct even when launched from Finder in packaged mode.
 * Must be called BEFORE app.whenReady() to prevent Electron from creating
 * platform-specific default folders.
 */
function setUserDataPath(): void {
  // Use app.getPath('home') for cross-platform reliability
  const homeDir = app.getPath('home')
  
  if (process.platform === 'win32') {
    app.setAppUserModelId('com.navyug.helios')
    // On Windows, use user's AppData\Roaming
    const userDataPath = join(homeDir, 'AppData/Roaming/Helios')
    app.setPath('userData', userDataPath)
    writeEarlyLog(`Windows: userData=${userDataPath}`)
  } else if (process.platform === 'darwin') {
    // On macOS, use ~/Library/Application Support/Helios
    const userDataPath = join(homeDir, 'Library/Application Support/Helios')
    app.setPath('userData', userDataPath)
    writeEarlyLog(`macOS: userData=${userDataPath}`)
  } else {
    // On Linux, use ~/.config/Helios
    const userDataPath = join(homeDir, '.config/Helios')
    app.setPath('userData', userDataPath)
    writeEarlyLog(`Linux: userData=${userDataPath}`)
  }
}

// Initialize paths and early logging BEFORE app is ready
writeEarlyLog('='.repeat(80))
writeEarlyLog(`App startup initiated [packaged=${app.isPackaged}, platform=${process.platform}]`)
setUserDataPath()

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

ipcMain.handle('backend:getLogFile', async () => {
  const runtimePaths = {
    logFile: join(app.getPath('userData'), 'logs', 'backend.log'),
    userData: app.getPath('userData'),
    home: app.getPath('home')
  }
  return runtimePaths
})

// --- App lifecycle ---

app.whenReady().then(async () => {
  writeEarlyLog(`App ready - showing splash and waiting for backend...`)
  
  // Show splash screen while backend is starting
  const splash = createSplashWindow()
  
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
    
    // Backend is ready - close splash and create main window
    writeEarlyLog(`Backend started successfully [PID=${status.pid}, port=${status.port}]`)
    console.log(`Backend started (PID: ${status.pid}, Port: ${status.port})`)
    
    splash?.destroy()
    createWindow()
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
  writeEarlyLog('App before-quit: stopping backend...')
  await backendManager.cleanup()
  writeEarlyLog('App shutdown complete')
})
