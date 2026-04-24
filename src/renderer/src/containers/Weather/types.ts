// Domain types — imported by both actions.ts and reducer.ts to avoid circular deps

export interface WeatherStatus {
  // TODO: define status fields
  version: string
  uptime: number
}

export interface WeatherStreamEvent {
  type: string
  data: unknown
  timestamp: number
}
