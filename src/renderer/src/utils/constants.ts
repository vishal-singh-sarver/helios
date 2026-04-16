// Base URL of your backend server.
// In dev, BASE_URL is empty — requests go to same-origin /api/* and are
// proxied to the real backend by Vite (see electron.vite.config.ts → server.proxy).
// In production, Electron loads from file:// and must hit the backend directly.
export const BASE_URL =
  (window as any).__APP_BASE_URL__ ??
  (import.meta.env.DEV ? '' : 'http://192.168.3.191:8008')

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
