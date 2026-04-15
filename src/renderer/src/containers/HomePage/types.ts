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
  project_id: number
  name: string
  latitude: number
  longitude: number
  utc_offset: number
  session_id: string
}
