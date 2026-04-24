import { produce } from 'immer'
import {
  FETCH_STATUS, FETCH_STATUS_SUCCESS, FETCH_STATUS_FAILURE,
  SSE_CONNECT, SSE_EVENT, SSE_DISCONNECT
} from './constants'
import type { ProjectScreenAction } from './actions'
import type { ProjectScreenStatus, ProjectScreenStreamEvent } from './types'

export type { ProjectScreenStatus, ProjectScreenStreamEvent }

// ── State ──────────────────────────────────────────────────────────────────────

export interface ProjectScreenState {
  status:    ProjectScreenStatus | null
  loading:   boolean
  error:     string | null
  streaming: boolean
  streamLog: ProjectScreenStreamEvent[]
}

export const initialState: ProjectScreenState = {
  status:    null,
  loading:   false,
  error:     null,
  streaming: false,
  streamLog: []
}

// ── Reducer ────────────────────────────────────────────────────────────────────

const projectScreenReducer = (
  state: ProjectScreenState = initialState,
  action: ProjectScreenAction
): ProjectScreenState =>
  produce(state, (draft) => {
    switch (action.type) {
      case FETCH_STATUS:
        draft.loading = true
        draft.error   = null
        break

      case FETCH_STATUS_SUCCESS:
        draft.loading = false
        draft.status  = action.payload
        break

      case FETCH_STATUS_FAILURE:
        draft.loading = false
        draft.error   = action.payload
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

export default projectScreenReducer
