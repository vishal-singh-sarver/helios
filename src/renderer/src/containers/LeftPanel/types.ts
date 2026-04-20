// Domain types — imported by both actions.ts and reducer.ts to avoid circular deps

export interface LeftPanelStatus {
  // TODO: define status fields
  version: string
  uptime: number
}

export interface LeftPanelStreamEvent {
  type: string
  data: unknown
  timestamp: number
}
