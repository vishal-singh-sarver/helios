import {
  SET_LATITUDE,
  SET_LONGITUDE,
  SET_UTC_OFFSET,
  SET_COORDINATES
} from './constants'
import type { ProjectCoordinates } from './types'

// ── Action interfaces ──────────────────────────────────────────────────────────

export interface SetLatitudeAction {
  type: typeof SET_LATITUDE
  payload: string
  [extraProps: string]: unknown
}
export interface SetLongitudeAction {
  type: typeof SET_LONGITUDE
  payload: string
  [extraProps: string]: unknown
}
export interface SetUtcOffsetAction {
  type: typeof SET_UTC_OFFSET
  payload: string
  [extraProps: string]: unknown
}
export interface SetCoordinatesAction {
  type: typeof SET_COORDINATES
  payload: Partial<ProjectCoordinates>
  [extraProps: string]: unknown
}

export type ProjectScreenAction =
  | SetLatitudeAction
  | SetLongitudeAction
  | SetUtcOffsetAction
  | SetCoordinatesAction

// ── Action creators ────────────────────────────────────────────────────────────

export const setLatitude = (value: string): SetLatitudeAction => ({
  type: SET_LATITUDE,
  payload: value
})

export const setLongitude = (value: string): SetLongitudeAction => ({
  type: SET_LONGITUDE,
  payload: value
})

export const setUtcOffset = (value: string): SetUtcOffsetAction => ({
  type: SET_UTC_OFFSET,
  payload: value
})

/**
 * Bulk-update any subset of coordinate fields. Useful when loading a project
 * from persistence or when multiple fields change atomically.
 */
export const setCoordinates = (
  coordinates: Partial<ProjectCoordinates>
): SetCoordinatesAction => ({
  type: SET_COORDINATES,
  payload: coordinates
})
