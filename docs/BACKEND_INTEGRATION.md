<!-- MarkdownTOC levels="1,2,3,4" -->

- [Backend Integration & Bundling Guide](#backend-integration-bundling-guide)
  - [Overview](#overview)
  - [Architecture](#architecture)
  - [Backend Bundling](#backend-bundling)
    - [Build Process](#build-process)
    - [Resource Structure](#resource-structure)
    - [Development vs. Production](#development-vs-production)
  - [Backend Manager](#backend-manager)
    - [Module: `src/main/backend-manager.ts`](#module-srcmainbackend-managerts)
    - [API](#api)
    - [Usage Example](#usage-example)
  - [Platform-Specific Details](#platform-specific-details)
    - [macOS](#macos)
    - [Windows](#windows)
    - [Linux](#linux)
  - [User Data Paths](#user-data-paths)
  - [Troubleshooting](#troubleshooting)

<!-- /MarkdownTOC -->

# Backend Integration & Bundling Guide

## Overview

This document describes how the Helios Electron application bundles and manages the backend executable as part of cross-platform packaging. The backend is a compiled binary (via Tauri/Rust or similar) that provides API services to the renderer process.

**Key Principle:** The backend binary is **bundled with the application** at build time, not resolved from system paths or external sources at runtime.

**Directory Naming:** Backend resources use electron-builder's platform names (mac/win/linux), not Node.js platform names (darwin/win32/linux). This ensures proper path resolution by electron-builder's `${os}` variable.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  Main Process (src/main/)                    │
│  ┌───────────────────────────────────────────────────────┐  │
│  │           Backend Manager (backend-manager.ts)         │  │
│  │  • Platform detection                                 │  │
│  │  • Process spawning & lifecycle management            │  │
│  │  • Binary path resolution (dev vs. packaged)          │  │
│  └───────────────────────────────────────────────────────┘  │
│                            ↓                                  │
│                    Spawns backend binary                      │
│                    (macOS/Windows/Linux)                      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   Backend Process                            │
│  • Compiled executable (Tauri, Rust, C++, etc.)             │
│  • Listens on port 8000 (configurable)                       │
│  • Started on app launch                                     │
│  • Stopped on app quit                                       │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│              Renderer Process (React UI)                     │
│  • Communicates with backend via HTTP/fetch                 │
│  • Status queries via IPC to main process                    │
│  • Doesn't directly spawn backend                            │
└─────────────────────────────────────────────────────────────┘
```

## Backend Bundling

### Build Process

1. **Sync Backend** (done at build time)
   ```bash
   npm run sync-backend
   # Copies backend executables from external sources to repo-local:
   # resources/backend/{darwin,win32,linux}/heliosgui_backend[.exe]
   ```

2. **Build Renderer & Main** (TypeScript → JavaScript)
   ```bash
   npm run build
   # Compiles src/main/ and src/renderer/
   # Output: out/main/, out/renderer/
   ```

3. **Bundle with electron-builder**
   ```bash
   electron-builder
   # Packages compiled code + backend binaries into installers/archives
   # electron-builder.yml specifies:
   #   - Which files to include: out/, resources/backend/
   #   - How to package: DMG/PKG (macOS), NSIS (Windows), AppImage/DEB (Linux)
   ```

4. **Installation**
   - User downloads and runs installer
   - Installer extracts application bundle + backend executable to install location
   - Application runs and spawns backend process from bundled location

### Resource Structure

**Repository (Development)**
```
/Users/navyug/helios_gui/
├── resources/
│   └── backend/
│       ├── mac/
│       │   └── heliosgui_backend         (19 MB, macOS binary)
│       ├── win/
│       │   └── heliosgui_backend.exe     (placeholder/when available)
│       └── linux/
│           └── heliosgui_backend         (placeholder/when available)
├── scripts/
│   └── sync-backend.js                   (copies from external sources)
└── src/main/
    └── backend-manager.ts                (lifecycle management)
```

**Packaged Application (macOS Example)**
```
/Applications/Helios.app/
└── Contents/
    ├── Resources/       (app.asar packed)
    │   ├── out/
    │   ├── resources/
    │   │   └── backend/
    │   │       └── mac/
    │   │           └── heliosgui_backend
    │   └── package.json
    ├── MacOS/
    │   └── Helios           (Electron main executable)
    └── Info.plist
```

**Windows Installation Example**
```
C:\Program Files\Helios\
├── Helios.exe                            (Electron main)
├── resources\
│   └── backend\
│       └── win\
│           └── heliosgui_backend.exe
└── ...
```

### Development vs. Production

**Development Mode** (`npm run dev`)
- Backend loaded from: `$PROJECT_ROOT/resources/backend/{platform}/heliosgui_backend`
- `app.isPackaged` is `false`
- Backend manager uses relative paths from working directory
- Useful for local debugging

**Production Mode** (installed from installer)
- Backend loaded from: `$APP_PATH/resources/backend/{platform}/heliosgui_backend`
- `app.isPackaged` is `true`
- Backend manager uses paths relative to `app.getAppPath()`
- Paths resolved inside application bundle automatically

## Backend Manager

### Module: `src/main/backend-manager.ts`

Singleton class that manages the entire backend process lifecycle. Instantiated once in the main process, used throughout app lifetime.

**Key Responsibilities:**
- Detect current platform (darwin/win32/linux)
- Resolve binary path (development vs. packaged)
- Validate binary exists and is executable
- Spawn backend process with appropriate arguments
- Capture stdout/stderr for debugging
- Monitor process status and handle unexpectedexit
- Graceful shutdown on app quit

### API

```typescript
// Get current backend status
backendManager.getBackendStatus(): BackendStatus
// Returns: { running: true/false, pid: number | null, port?: number, error?: string }

// Start backend (idempotent - already-running returns existing status)
await backendManager.startBackend(): Promise<BackendStatus>

// Stop backend (idempotent - already-stopped returns success)
await backendManager.stopBackend(): Promise<BackendStatus>

// Cleanup resources on app quit
await backendManager.cleanup(): Promise<void>

// Get buffered stdout/stderr logs
backendManager.getStdioLogs(): string[]
```

### Usage Example

```typescript
// In src/main/index.ts:

import { backendManager } from './backend-manager'

app.whenReady().then(async () => {
  // Start backend on app launch
  const status = await backendManager.startBackend()
  if (status.running) {
    console.log(`Backend started: PID ${status.pid}`)
  } else {
    console.error(`Backend failed to start: ${status.error}`)
  }

  createWindow()
})

app.on('quit', async () => {
  // Stop backend gracefully on app quit
  await backendManager.cleanup()
})

// IPC handlers for renderer process
ipcMain.handle('backend:getStatus', () => {
  return backendManager.getBackendStatus()
})

ipcMain.handle('backend:start', async () => {
  return await backendManager.startBackend()
})

ipcMain.handle('backend:stop', async () => {
  return await backendManager.stopBackend()
})
```

## Platform-Specific Details

### macOS

**Installation Path:**
```
/Applications/Helios.app/Contents/Resources/resources/backend/darwin/heliosgui_backend
```

**User Data Path:**
```
~/Library/Application Support/Helios/
```

**Subdirectories (Application Creates):**
```
~/Library/Application Support/Helios/
├── config/              (configuration files)
├── data/                (application data)
├── cache/               (temporary cache)
└── logs/                (application logs)
```

**Permissions:**
- Application deployed to `/Applications` (user-installable)
- User data in `~/Library/Application Support` (standard location)
- No "sudo" required for user installations

**DMG Distribution:**
- Double-click DMG → mounts virtual disk
- Drag "Helios.app" to /Applications folder
- ejecting DMG after installation

**PKG Distribution:**
- Double-click PKG → runs installer wizard
- Installs to /Applications
- Creates desktop shortcut and launch bar entry

### Windows

**Installation Path:**
```
C:\Program Files\Helios\
├── Helios.exe                  (Electron executable)
├── resources\backend\win32\heliosgui_backend.exe
└── ...
```

**User Data Path:**
```
%APPDATA%\Helios\
C:\Users\{Username}\AppData\Roaming\Helios\
```

**Subdirectories:**
```
%APPDATA%\Helios\
├── config/              (configuration files)
├── data/                (application data)
├── cache/               (temporary cache)
└── logs/                (application logs)
```

**Installation Method:**
- Download `Helios-1.0.0-setup.exe`
- Run installer → UAC elevation dialog
- User selects installation directory (default: `C:\Program Files\Helios\`)
- Installer creates Start Menu entries and desktop shortcut
- Uninstall via Control Panel → Programs and Features

**Permissions:**
- Installation to Program Files requires admin elevation (handled by NSIS)
- User data in %APPDATA% (user-writable)
- Per-machine installation (available to all users)

### Linux

**Installation Paths:**

AppImage (portable, single executable):
```
~/Downloads/Helios-1.0.0.AppImage
```

DEB (system package):
```
/opt/Helios/                          (installation)
/usr/bin/helios                       (symlink for CLI launch)
```

**User Data Path:**
```
~/.config/Helios/                     (configuration - XDG_CONFIG_HOME)
~/.local/share/Helios/                (data - XDG_DATA_HOME)
```

**Subdirectories:**
```
~/.config/Helios/
├── settings.json            (user preferences)
└── ...

~/.local/share/Helios/
├── data/                    (application data)
├── cache/                   (temporary files)
└── logs/                    (application logs)
```

**Installation Methods:**

AppImage (Portable):
```bash
# Make executable
chmod +x Helios-1.0.0.AppImage

# Run directly
./Helios-1.0.0.AppImage

# Optional: symlink to PATH for CLI access
sudo ln -s $(pwd)/Helios-1.0.0.AppImage /usr/local/bin/helios
```

DEB (System Package):
```bash
# Install
sudo dpkg -i Helios-1.0.0.deb

# Or using apt
sudo apt install ./Helios-1.0.0.deb

# Uninstall
sudo dpkg -r helios
```

**Permissions:**
- AppImage: user-installable (no sudo needed)
- DEB: requires sudo for system-wide installation
- User data in home directory (no special permissions needed)

## User Data Paths

The application uses `app.setPath('userData', ...)` to establish a consistent location for user data across platforms.

**Path Resolution (in src/main/index.ts):**

```typescript
app.whenReady().then(() => {
  if (process.platform === 'win32') {
    // Windows: %APPDATA%\Helios\
    app.setPath('userData', join(process.env.APPDATA || '', 'Helios'))
  } else if (process.platform === 'darwin') {
    // macOS: ~/Library/Application Support/Helios/
    const home = process.env.HOME || ''
    app.setPath('userData', join(home, 'Library/Application Support/Helios'))
  } else {
    // Linux: ~/.config/Helios/
    const home = process.env.HOME || ''
    app.setPath('userData', join(home, '.config/Helios'))
  }
})
```

**Accessing User Data Path in Code:**

```typescript
import { app } from 'electron'

const userDataPath = app.getPath('userData')
// Returns platform-specific path as configured above

// Example usage:
const configFile = path.join(userDataPath, 'config', 'settings.json')
```

**What Gets Stored Here:**
- Application settings and preferences
- User data files
- Caches
- Logs
- Credentials (if applicable)
- Index files for full-text search or database

## Troubleshooting

### Backend Not Found at Runtime

**Symptom:** Application starts but backend fails to start with error like:
```
Backend executable not found: /path/to/heliosgui_backend
```

**Causes & Solutions:**

1. **Sync script not run before build**
   ```bash
   # Ensure backend was synced
   npm run sync-backend
   
   # Then build
   npm run build
   
   # package.json build script now does this automatically
   npm run build  # Automatically runs sync-backend first
   ```

2. **Backend source path incorrect or stale**
   - Edit `scripts/sync-backend.js`
   - Update `BACKENDS.darwin.source` to point to current backend location
   - Update `BACKENDS.win32.source` and `BACKENDS.linux.source` as they become available
   - Verify by: `ls -la /path/to/source/heliosgui_backend`

3. **Backend binary not executable**
   ```bash
   # Check permissions
   stat resources/backend/darwin/heliosgui_backend
   
   # Should have: (755) or rwxr-xr-x
   # If not, fix:
   chmod +x resources/backend/darwin/heliosgui_backend
   ```

4. **electron-builder didn't include backend**
   - Check `electron-builder.yml` has `extraResources` configured
   - Verify `resources/backend/` structure matches configuration
   - Test locally before distribution:
     ```bash
     npm run package:mac  # or :win, :linux
     
     # Inspect packaged app (macOS example):
     ls -la dist/Helios-1.0.0.app/Contents/Resources/resources/backend/
     ```

### Backend Process Exits Immediately

**Symptom:** Backend status shows `running: false` but no error message.

**Causes:**
- Backend binary crashed
- Backend binary expects arguments not provided
- Permissions issue

**Debug:**
```typescript
// In src/main/index.ts, check backend logs:
const logs = backendManager.getStdioLogs()
console.log('Backend logs:', logs)
```

### Backend Hangs or Doesn't Respond

**Symptom:** Backend shows running but API requests time out.

**Checks:**
1. **Verify backend port is correct**
   - Backend manager defaults to port 8000
   - Check if backend uses different port or config file
   - Verify port isn't already in use: `lsof -i :8000` (macOS/Linux)

2. **Check backend is actually listening**
   ```bash
   # While app is running
   netstat -an | grep LISTEN | grep 8000   # Linux/Windows
   lsof -i :8000                            # macOS
   ```

3. **Verify firewall allows connection**
   - Backend might be listening on localhost only (correct)
   - Renderer shouldn't need firewall access if both are local

### Packaged App Can't Find Backend

**Symptom:** Development build works, but packaged installer fails.

**Cause:** Path resolution issue in `backend-manager.ts`

**Fix:**
1. Verify `app.isPackaged` returns true in packaged mode
2. Verify `app.getAppPath()` resolves to application bundle root
3. Check console output (dev tools):
   ```javascript
   // In main process
   console.log('isPackaged:', app.isPackaged)
   console.log('appPath:', app.getAppPath())
   console.log('resourcesPath:', app.getAppPath() + '/resources/...')
   ```

4. Inspect packaged app structure:
   ```bash
   # macOS
   find /Applications/Helios.app -name "heliosgui_backend" -ls
   
   # Windows
   dir "C:\Program Files\Helios" /s /b | findstr heliosgui
   
   # Linux AppImage
   ./Helios-1.0.0.AppImage --appimage-extract
   find squashfs-root -name "heliosgui_backend" -ls
   ```

### Platform-Specific Issues

**macOS:**
- Verify code signing if app is signed (info in PACKAGING_DEPLOYMENT.md)
- Check App Sandbox permissions if app is sandboxed

**Windows:**
- Ensure Windows backend .exe file is available in `resources/backend/win32/`
- Check antivirus isn't blocking backend executable
- Verify installer has proper permissions for installing to Program Files

**Linux:**
- AppImage: ensure backend permissions are preserved in bundle
- DEB: verify maintainer contact is correct in electron-builder.yml

---

**For more packaging details, see:** [PACKAGING_DEPLOYMENT.md](./PACKAGING_DEPLOYMENT.md)
