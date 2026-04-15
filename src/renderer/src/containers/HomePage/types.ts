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
  project_id: string   // UUID
  name: string
  latitude: number
  longitude: number
  utc_offset: number
  session_id: string
}

// ── Recent projects ───────────────────────────────────────────────────────────

export interface RecentProjectItem {
  id: string              // UUID
  name: string
  last_updated: string    // ISO 8601
  size: number            // bytes
}

export interface RecentProjectsResponse {
  projects: RecentProjectItem[]
}
