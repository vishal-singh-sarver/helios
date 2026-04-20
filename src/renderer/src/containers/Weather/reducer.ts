import { produce } from 'immer'
import {
  FETCH_STATUS,
  FETCH_STATUS_SUCCESS,
  FETCH_STATUS_FAILURE,
  SSE_CONNECT,
  SSE_EVENT,
  SSE_DISCONNECT
} from './constants'
import type { WeatherAction } from './actions'
import type { WeatherStatus, WeatherStreamEvent } from './types'

export type { WeatherStatus, WeatherStreamEvent }

// ── State ──────────────────────────────────────────────────────────────────────

export interface WeatherState {
  status: WeatherStatus | null
  loading: boolean
  error: string | null
  streaming: boolean
  streamLog: WeatherStreamEvent[]
}

export const initialState: WeatherState = {
  status: null,
  loading: false,
  error: null,
  streaming: false,
  streamLog: []
}

// ── Reducer ────────────────────────────────────────────────────────────────────

const weatherReducer = (state: WeatherState = initialState, action: WeatherAction): WeatherState =>
  produce(state, (draft) => {
    switch (action.type) {
      case FETCH_STATUS:
        draft.loading = true
        draft.error = null
        break

      case FETCH_STATUS_SUCCESS:
        draft.loading = false
        draft.status = action.payload
        break

      case FETCH_STATUS_FAILURE:
        draft.loading = false
        draft.error = action.payload
        break

      case SSE_CONNECT:
        draft.streaming = true
        draft.streamLog = []
        break

      case SSE_EVENT:
        draft.streamLog.push(action.payload)
        break

      case SSE_DISCONNECT:
        draft.streaming = false
        break
    }
  })

export default weatherReducer
