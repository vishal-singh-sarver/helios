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

// ── Add column ────────────────────────────────────────────────────────────────

export interface AddColumnPayload {
  parameterName: string
  dataType: string
  defaultValue: string
}

export interface AddColumnResponse {
  success: boolean
  column_id: string
  parameterName: string
  dataType: string
  defaultValue: string
}

// ── Add rows ──────────────────────────────────────────────────────────────────

export interface AddRowsPayload {
  numberOfRows: number
  startDate: string
  startTime: string
}

export interface AddRowsResponse {
  success: boolean
  rows_added: number
  startDate: string
  startTime: string
}
