import { produce } from 'immer'
import {
  FETCH_STATUS,
  FETCH_STATUS_SUCCESS,
  FETCH_STATUS_FAILURE,
  SSE_CONNECT,
  SSE_EVENT,
  SSE_DISCONNECT
} from './constants'
import type { LeftPanelAction } from './actions'
import type { LeftPanelStatus, LeftPanelStreamEvent } from './types'

export type { LeftPanelStatus, LeftPanelStreamEvent }

// ── State ──────────────────────────────────────────────────────────────────────

export interface LeftPanelState {
  status: LeftPanelStatus | null
  loading: boolean
  error: string | null
  streaming: boolean
  streamLog: LeftPanelStreamEvent[]
}

export const initialState: LeftPanelState = {
  status: null,
  loading: false,
  error: null,
  streaming: false,
  streamLog: []
}

// ── Reducer ────────────────────────────────────────────────────────────────────

const leftPanelReducer = (
  state: LeftPanelState = initialState,
  action: LeftPanelAction
): LeftPanelState =>
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

export default leftPanelReducer
