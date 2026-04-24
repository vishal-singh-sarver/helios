// Domain types — imported by both actions.ts and reducer.ts to avoid circular deps

export interface RightPanelStatus {
  // TODO: define status fields
  version: string
  uptime: number
}

export interface RightPanelStreamEvent {
  type: string
  data: unknown
  timestamp: number
}
