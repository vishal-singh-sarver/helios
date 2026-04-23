// Domain types — imported by both actions.ts and reducer.ts to avoid circular deps

export interface ProjectScreenStatus {
  // TODO: define status fields
  version: string
  uptime: number
}

export interface ProjectScreenStreamEvent {
  type: string
  data: unknown
  timestamp: number
}
