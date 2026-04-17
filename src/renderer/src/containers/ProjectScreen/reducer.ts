import { produce } from 'immer'
import {
  SET_LATITUDE,
  SET_LONGITUDE,
  SET_UTC_OFFSET,
  SET_COORDINATES
} from './constants'
import type { ProjectScreenAction } from './actions'
import type { ProjectCoordinates } from './types'

export type { ProjectCoordinates }

// ── State ──────────────────────────────────────────────────────────────────────

export interface ProjectScreenState {
  coordinates: ProjectCoordinates
}

export const initialState: ProjectScreenState = {
  coordinates: {
    latitude: '',
    longitude: '',
    utcOffset: ''
  }
}

// ── Reducer ────────────────────────────────────────────────────────────────────

const projectScreenReducer = (
  state: ProjectScreenState = initialState,
  action: ProjectScreenAction
): ProjectScreenState =>
  produce(state, (draft) => {
    switch (action.type) {
      case SET_LATITUDE:
        draft.coordinates.latitude = action.payload
        break

      case SET_LONGITUDE:
        draft.coordinates.longitude = action.payload
        break

      case SET_UTC_OFFSET:
        draft.coordinates.utcOffset = action.payload
        break

      case SET_COORDINATES:
        Object.assign(draft.coordinates, action.payload)
        break
    }
  })

export default projectScreenReducer
