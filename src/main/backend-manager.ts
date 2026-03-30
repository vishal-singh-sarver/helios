import { ChildProcess, spawn } from 'child_process'
import { app } from 'electron'
import * as fs from 'fs'
import * as path from 'path'

export interface BackendStatus {
  running: boolean
  pid: number | null
  port?: number
  error?: string
}

export class BackendManager {
  private process: ChildProcess | null = null
  private port = 8008
  private stdio: string[] = []

  private getBackendPath(): string {
    const platform = process.platform
    const binaryName = platform === 'win32' ? 'heliosgui_backend.exe' : 'heliosgui_backend'

    if (app.isPackaged) {
      return path.join(process.resourcesPath, 'backend', binaryName)
    }

    const resourceFolder = platform === 'win32' ? 'win' : platform === 'darwin' ? 'mac' : 'linux'
    return path.join(process.cwd(), 'resources', 'backend', resourceFolder, binaryName)
  }

  private validateBackendPath(backendPath: string): void {
    if (!fs.existsSync(backendPath)) {
      throw new Error(
        `Backend executable not found: ${backendPath}\n` +
          `Make sure the backend was synced into resources/backend before packaging.`
      )
    }

    try {
      fs.accessSync(backendPath, fs.constants.R_OK)

      if (process.platform !== 'win32') {
        fs.accessSync(backendPath, fs.constants.X_OK)
      }
    } catch {
      throw new Error(`Backend executable is not accessible: ${backendPath}`)
    }
  }

  async startBackend(): Promise<BackendStatus> {
    if (this.process && !this.process.killed) {
      return this.getBackendStatus()
    }

    const backendPath = this.getBackendPath()

    try {
      this.validateBackendPath(backendPath)

      this.process = spawn(backendPath, [`--port=${this.port}`], {
        stdio: ['ignore', 'pipe', 'pipe'],
        detached: false,
        shell: false
      })

      if (this.process.stdout) {
        this.process.stdout.on('data', (data: Buffer) => {
          const message = data.toString().trim()
          if (message) {
            this.stdio.push(`[stdout] ${message}`)
            console.log(`[Backend stdout] ${message}`)
          }
        })
      }

      if (this.process.stderr) {
        this.process.stderr.on('data', (data: Buffer) => {
          const message = data.toString().trim()
          if (message) {
            this.stdio.push(`[stderr] ${message}`)
            console.error(`[Backend stderr] ${message}`)
          }
        })
      }

      this.process.on('exit', (code, signal) => {
        console.log(`Backend process exited with code ${code} and signal ${signal}`)
        this.process = null
      })

      this.process.on('error', (error) => {
        console.error('Backend process error:', error)
        this.stdio.push(`[error] ${error.message}`)
        this.process = null
      })

      await new Promise((resolve) => setTimeout(resolve, 500))

      if (!this.process || this.process.killed) {
        return {
          running: false,
          pid: null,
          error: 'Backend process exited immediately after startup'
        }
      }

      return {
        running: true,
        pid: this.process.pid || null,
        port: this.port
      }
    } catch (error) {
      this.process = null
      return {
        running: false,
        pid: null,
        error: error instanceof Error ? error.message : String(error)
      }
    }
  }

  async stopBackend(): Promise<BackendStatus> {
    if (!this.process) {
      return {
        running: false,
        pid: null
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
          pid: null
        })
      })

      currentProcess.kill('SIGTERM')
    })
  }

  getBackendStatus(): BackendStatus {
    if (!this.process || this.process.killed) {
      return {
        running: false,
        pid: null
      }
    }

    return {
      running: true,
      pid: this.process.pid || null,
      port: this.port
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
