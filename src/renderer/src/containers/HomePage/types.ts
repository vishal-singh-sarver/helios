export interface AppStatus {
  version: string
  uptime: number
}

export interface StreamEvent {
  type: string
  data: unknown
  timestamp: number
}

// ── Create project ────────────────────────────────────────────────────────────

export interface CreateProjectPayload {
  name: string
  latitude: number
  longitude: number
}

export interface CreateProjectResponse {
  success: boolean
  project_id: string // UUID
  name: string
  latitude: number
  longitude: number
  utc_offset: number
  session_id: string
}

export interface ApiErrorPayload {
  status: number // HTTP status (0 = network failure)
  message: string // flat human-readable message
  fieldErrors: Record<string, string> // per-field detail (FastAPI 422 → loc-keyed)
}

// ── Recent projects ───────────────────────────────────────────────────────────

export interface RecentProjectItem {
  id: string // UUID
  name: string
  last_updated: string // ISO 8601
  size: number // bytes
}

export interface RecentProjectsResponse {
  projects: RecentProjectItem[]
}

// ── Delete project ────────────────────────────────────────────────────────────

export interface DeleteProjectPayload {
  projectId: string
}
