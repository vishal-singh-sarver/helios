// Domain types — imported by both actions.ts and reducer.ts to avoid circular deps

export interface CenterWorkspaceStatus {
  // TODO: define status fields
  version: string
  uptime: number
}

export interface CenterWorkspaceStreamEvent {
  type: string
  data: unknown
  timestamp: number
}
