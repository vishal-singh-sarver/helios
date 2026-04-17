// Domain types — imported by both actions.ts and reducer.ts to avoid circular deps.

export interface ProjectCoordinates {
  latitude: string
  longitude: string
  utcOffset: string
}
