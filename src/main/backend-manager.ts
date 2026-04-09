import { ChildProcess, spawn } from 'child_process'
import { app } from 'electron'
import * as fs from 'fs'
import * as path from 'path'
import { setTimeout as delay } from 'timers/promises'

export interface BackendStatus {
  running: boolean
  pid: number | null
  port?: number
  error?: string
  logFile?: string
}

export class BackendManager {
  private process: ChildProcess | null = null
  private port = 8008
  private stdio: string[] = []
  private logStream: fs.WriteStream | null = null
  private logFile: string | null = null
  // Increased timeout for packaged apps and slower machines:
  //   - --onedir PyInstaller on first run: ~5-10s startup
  //   - Subsequent runs: ~0.5-2s startup
  //   - Slow systems: 30s provides adequate headroom without being too long
  private readonly startupTimeoutMs = 30000

  private getRuntimePaths() {
    const userDataDir = app.getPath('userData')
    const dataDir = path.join(userDataDir, 'backend-data')
    const logDir = path.join(userDataDir, 'logs')
    const logFile = path.join(logDir, 'backend.log')

    return { userDataDir, dataDir, logDir, logFile }
  }

  private getBackendPath(): string {
    const platform = process.platform
    const binaryName = platform === 'win32' ? 'heliosgui_backend.exe' : 'heliosgui_backend'

    let basePath: string
    if (app.isPackaged) {
      // In packaged mode, resources are in process.resourcesPath
      basePath = path.join(process.resourcesPath, 'backend', binaryName)
      this.writeLogLine(`[path-resolution] packaged mode: ${basePath}`)
    } else {
      // In dev mode, use local resources folder relative to repo root
      const resourceFolder = platform === 'win32' ? 'win' : platform === 'darwin' ? 'mac' : 'linux'
      basePath = path.join(process.cwd(), 'resources', 'backend', resourceFolder, binaryName)
      this.writeLogLine(`[path-resolution] dev mode: ${basePath}`)
    }

    // Handle both --onefile (single executable) and --onedir (directory structure)
    // With --onedir: basePath points to a directory, executable is basePath/binaryName
    // With --onefile: basePath is the executable directly
    if (fs.existsSync(basePath) && fs.statSync(basePath).isDirectory()) {
      // PyInstaller --onedir: The basePath is a directory containing the executable
      const onedirExecutable = path.join(basePath, binaryName)
      this.writeLogLine(`[path-resolution] detected onedir structure: ${onedirExecutable}`)
      return onedirExecutable
    }

    return basePath
  }

  private validateBackendPath(backendPath: string): void {
    this.writeLogLine(`[validation] checking path exists: ${backendPath}`)
    
    if (!fs.existsSync(backendPath)) {
      throw new Error(
        `Backend executable not found: ${backendPath}\n` +
          `Make sure the backend was synced into resources/backend before packaging.`
      )
    }

    this.writeLogLine(`[validation] path exists ✓`)

    try {
      this.writeLogLine(`[validation] checking read access...`)
      fs.accessSync(backendPath, fs.constants.R_OK)
      this.writeLogLine(`[validation] read access ✓`)

      if (process.platform !== 'win32') {
        this.writeLogLine(`[validation] checking execute access...`)
        fs.accessSync(backendPath, fs.constants.X_OK)
        this.writeLogLine(`[validation] execute access ✓`)
      }
    } catch (error) {
      const err = error instanceof Error ? error.message : String(error)
      throw new Error(`Backend executable is not accessible: ${backendPath}\n${err}`)
    }
  }

  private ensureRuntimeDirectories(dataDir: string, logDir: string): void {
    try {
      // Create log directory only (data directory is created by backend as needed)
      this.writeLogLine(`[setup] creating log directory: ${logDir}`)
      fs.mkdirSync(logDir, { recursive: true })
      this.writeLogLine(`[setup] log directory ready ✓`)
    } catch (error) {
      const err = error instanceof Error ? error.message : String(error)
      throw new Error(`Failed to create log directory: ${err}`)
    }
  }

  private openLogStream(logFile: string): void {
    if (this.logFile !== logFile || !this.logStream) {
      this.logStream?.end()
      
      try {
        this.logStream = fs.createWriteStream(logFile, { flags: 'a' })
        this.logFile = logFile
      } catch (error) {
        const err = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to open log stream at ${logFile}: ${err}`)
      }
    }

    this.writeLogLine(`[manager] ════════════════════════════════════════════════════════`)
    this.writeLogLine(`[manager] Backend launch at ${new Date().toISOString()}`)
    this.writeLogLine(`[manager] Packaged: ${app.isPackaged}, Platform: ${process.platform}`)
  }

  private writeLogLine(message: string): void {
    const line = `${new Date().toISOString()} ${message}\n`
    this.logStream?.write(line)
  }

  private recordMessage(kind: string, message: string): void {
    const entry = `[${kind}] ${message}`
    this.stdio.push(entry)
    if (this.stdio.length > 500) {
      this.stdio.shift()
    }
    this.writeLogLine(entry)
  }

  private getRecentLogs(limit = 20): string {
    return this.stdio.slice(-limit).join('\n')
  }

  private async waitForBackendReady(child: ChildProcess): Promise<void> {
    const healthUrl = `http://127.0.0.1:${this.port}/health`
    const deadline = Date.now() + this.startupTimeoutMs

    this.recordMessage('manager', `Polling health check at ${healthUrl}, timeout ${this.startupTimeoutMs}ms`)

    while (Date.now() < deadline) {
      if (this.process !== child || child.killed || child.exitCode !== null) {
        throw new Error(
          `Backend exited before becoming ready (exit code: ${child.exitCode}).\n` +
          `Recent output:\n${this.getRecentLogs()}`
        )
      }

      try {
        // Use AbortController for timeout on health check
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 2000)
        
        const response = await fetch(healthUrl, { signal: controller.signal })
        clearTimeout(timeoutId)
        
        if (response.ok) {
          this.recordMessage('manager', `Health check PASSED ✓`)
          return
        }
      } catch {
        // Backend not ready yet; keep polling until timeout or exit.
      }

      await delay(250)
    }

    throw new Error(
      `Backend did not become ready within ${this.startupTimeoutMs}ms.\n` +
      `Recent output:\n${this.getRecentLogs()}`
    )
  }

  async startBackend(): Promise<BackendStatus> {
    if (this.process && !this.process.killed) {
      return this.getBackendStatus()
    }

    const backendPath = this.getBackendPath()
    const runtimePaths = this.getRuntimePaths()

    try {
      this.recordMessage('manager', `Starting backend process...`)
      
      this.validateBackendPath(backendPath)
      this.ensureRuntimeDirectories(runtimePaths.dataDir, runtimePaths.logDir)
      this.openLogStream(runtimePaths.logFile)

      const env = {
        ...process.env,
        HELIOS_DATA_DIR: runtimePaths.dataDir,
        HELIOS_LOG_DIR: runtimePaths.logDir
      }

      this.recordMessage('manager', `Spawning: ${backendPath}`)
      this.recordMessage('manager', `Args: --port=${this.port}`)
      this.recordMessage('manager', `Cwd: ${app.getPath('home')}`)
      this.recordMessage('manager', `Env: HELIOS_DATA_DIR=${runtimePaths.dataDir}`)
      this.recordMessage('manager', `Platform: ${process.platform}, Packaged: ${app.isPackaged}`)
      
      this.process = spawn(backendPath, [`--port=${this.port}`], {
        cwd: app.getPath('home'),  // Use home directory instead of data directory
        stdio: ['ignore', 'pipe', 'pipe'],
        detached: false,
        shell: false,
        env
      })

      this.recordMessage('manager', `Process spawned, PID: ${this.process.pid}`)

      // Attach listeners IMMEDIATELY after spawn to catch any early output or errors
      let hasOutput = false

      if (this.process.stdout) {
        this.process.stdout.on('data', (data: Buffer) => {
          const message = data.toString().trim()
          if (message) {
            hasOutput = true
            this.recordMessage('stdout', message)
            console.log(`[Backend stdout] ${message}`)
          }
        })
      } else {
        this.recordMessage('manager', `WARNING: stdout is null after spawn`)
      }

      if (this.process.stderr) {
        this.process.stderr.on('data', (data: Buffer) => {
          const message = data.toString().trim()
          if (message) {
            hasOutput = true
            this.recordMessage('stderr', message)
            console.error(`[Backend stderr] ${message}`)
          }
        })
      } else {
        this.recordMessage('manager', `WARNING: stderr is null after spawn`)
      }

      // Listen for any errors during process execution
      this.process.on('error', (error: Error) => {
        this.recordMessage('manager', `Process error event: ${error.message}`)
        console.error('[Backend error event]', error)
      })

      this.process.on('exit', (code, signal) => {
        this.recordMessage('manager', `Process exited (code: ${code}, signal: ${signal}, hasOutput: ${hasOutput})`)
        console.log(`Backend process exited with code ${code} and signal ${signal}`)
        this.process = null
      })

      this.process.on('error', (error) => {
        const errorMsg = error instanceof Error ? error.message : String(error)
        this.recordMessage('error', `spawn() error: ${errorMsg}`)
        console.error('Backend process error:', error)
        this.process = null
      })

      await this.waitForBackendReady(this.process)

      this.recordMessage('manager', `Backend is ready and running`)
      
      return {
        running: true,
        pid: this.process.pid || null,
        port: this.port,
        logFile: this.logFile || undefined
      }
    } catch (error) {
      if (this.process && !this.process.killed) {
        this.process.kill('SIGTERM')
      }
      this.process = null
      const message = error instanceof Error ? error.message : String(error)
      this.recordMessage('manager', `ERROR: Failed to start backend: ${message}`)
      return {
        running: false,
        pid: null,
        error: message,
        logFile: this.logFile || undefined
      }
    }
  }

  async stopBackend(): Promise<BackendStatus> {
    if (!this.process) {
      return {
        running: false,
        pid: null,
        logFile: this.logFile || undefined
      }
    }

    const currentProcess = this.process

    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        if (currentProcess && !currentProcess.killed) {
          currentProcess.kill('SIGKILL')
        }
      }, 5000)

      currentProcess.once('exit', () => {
        clearTimeout(timeout)
        if (this.process === currentProcess) {
          this.process = null
        }
        resolve({
          running: false,
          pid: null,
          logFile: this.logFile || undefined
        })
      })

      currentProcess.kill('SIGTERM')
    })
  }

  getBackendStatus(): BackendStatus {
    if (!this.process || this.process.killed) {
      return {
        running: false,
        pid: null,
        logFile: this.logFile || undefined
      }
    }

    return {
      running: true,
      pid: this.process.pid || null,
      port: this.port,
      logFile: this.logFile || undefined
    }
  }

  async cleanup(): Promise<void> {
    if (this.process) {
      await this.stopBackend()
    }
  }

  getStdioLogs(): string[] {
    return this.stdio
  }
}

export const backendManager = new BackendManager()
