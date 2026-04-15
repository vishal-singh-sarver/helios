import { produce } from 'immer'
import type { Reducer, UnknownAction } from 'redux'
import {
  FETCH_STATUS, FETCH_STATUS_SUCCESS, FETCH_STATUS_FAILURE,
  SSE_CONNECT, SSE_EVENT, SSE_DISCONNECT,
  CREATE_PROJECT, CREATE_PROJECT_SUCCESS, CREATE_PROJECT_FAILURE, RESET_CREATE_PROJECT
} from './constants'
import type { HomePageAction } from './actions'

import type { AppStatus, StreamEvent, CreateProjectResponse } from './types'

export type { AppStatus, StreamEvent, CreateProjectResponse }

// ── State ─────────────────────────────────────────────────────────────────────

export interface CreateProjectState {
  loading: boolean
  error: string | null
  success: boolean
  data: CreateProjectResponse | null
}

export interface HomePageState {
  // REST
  status: AppStatus | null
  loading: boolean
  error: string | null
  // SSE
  streaming: boolean
  streamLog: StreamEvent[]
  // Create project
  createProject: CreateProjectState
}

export const initialCreateProjectState: CreateProjectState = {
  loading: false,
  error: null,
  success: false,
  data: null
}

export const initialState: HomePageState = {
  status: null,
  loading: false,
  error: null,
  streaming: false,
  streamLog: [],
  createProject: initialCreateProjectState
}

// ── Reducer ───────────────────────────────────────────────────────────────────

const homePageReducer: Reducer<HomePageState> = (
  state = initialState,
  rawAction: UnknownAction
) =>
  produce(state, (draft) => {
    const action = rawAction as HomePageAction
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

      case CREATE_PROJECT:
        draft.createProject.loading = true
        draft.createProject.error = null
        draft.createProject.success = false
        break

      case CREATE_PROJECT_SUCCESS:
        draft.createProject.loading = false
        draft.createProject.success = true
        draft.createProject.data = action.payload
        break

      case CREATE_PROJECT_FAILURE:
        draft.createProject.loading = false
        draft.createProject.error = action.payload
        break

      case RESET_CREATE_PROJECT:
        draft.createProject = { ...initialCreateProjectState }
        break
    }
  })

export default homePageReducer
