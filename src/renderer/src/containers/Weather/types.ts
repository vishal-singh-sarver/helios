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

// Weather data import — file pick result from the saga (serializable).
export interface PickedFile {
  filename: string
  rawText: string
}

// Re-export the pure-data types so containers/Weather is the single
// import surface for anything related to weather data.
export type { ImportedDataset, ImportedDatasetColumn, ImportedDatasetRecord } from './parsers'
