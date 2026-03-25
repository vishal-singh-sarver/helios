export interface AppStatus {
  version: string
  uptime: number
}

export interface StreamEvent {
  type: string
  data: unknown
  timestamp: number
}
