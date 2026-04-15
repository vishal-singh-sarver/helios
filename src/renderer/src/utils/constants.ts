// Base URL of your backend server.
// For a local Electron-spawned process use a fixed port; for remote servers use an env var.
export const BASE_URL = (window as any).__APP_BASE_URL__ ?? 'http://localhost:8008'

// ── Backend routes ────────────────────────────────────────────────────────────
//
// Single source of truth for every backend path the renderer calls. Paths are
// relative to BASE_URL and get prefixed inside utils/api.ts. Rename or reshape
// an endpoint in one place and every caller picks it up at build time.

export const API_ROUTES = {
  project: {
    create: '/api/project/create',
    recent: '/api/project/recent',
    // Not yet implemented on the backend — see backend-api/app/routers/project.py
    delete: (projectId: string) => `/api/project/${projectId}`
  }
} as const
