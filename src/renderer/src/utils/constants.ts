// Base URL of your backend server.
// For a local Electron-spawned process use a fixed port; for remote servers use an env var.
export const BASE_URL = (window as any).__APP_BASE_URL__ ?? 'http://localhost:8008'
