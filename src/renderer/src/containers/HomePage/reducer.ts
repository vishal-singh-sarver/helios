import { produce } from 'immer'
import type { Reducer, UnknownAction } from 'redux'
import {
  FETCH_STATUS, FETCH_STATUS_SUCCESS, FETCH_STATUS_FAILURE,
  SSE_CONNECT, SSE_EVENT, SSE_DISCONNECT,
  CREATE_PROJECT, CREATE_PROJECT_SUCCESS, CREATE_PROJECT_FAILURE, RESET_CREATE_PROJECT,
  FETCH_RECENT_PROJECTS, FETCH_RECENT_PROJECTS_SUCCESS, FETCH_RECENT_PROJECTS_FAILURE,
  DELETE_PROJECT, DELETE_PROJECT_SUCCESS, DELETE_PROJECT_FAILURE
} from './constants'
import type { HomePageAction } from './actions'

import type {
  AppStatus,
  StreamEvent,
  CreateProjectResponse,
  RecentProjectItem,
  ApiErrorPayload
} from './types'

export type { AppStatus, StreamEvent, CreateProjectResponse, RecentProjectItem, ApiErrorPayload }

// ── State ─────────────────────────────────────────────────────────────────────

export interface CreateProjectState {
  loading: boolean
  error: ApiErrorPayload | null
  success: boolean
  data: CreateProjectResponse | null
}

export interface RecentProjectsState {
  loading: boolean
  error: ApiErrorPayload | null
  data: RecentProjectItem[]
}

export interface DeleteProjectState {
  inFlightIds: string[]
  error: ApiErrorPayload | null
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
  // Recent projects
  recentProjects: RecentProjectsState
  // Delete project
  deleteProject: DeleteProjectState
}

export const initialCreateProjectState: CreateProjectState = {
  loading: false,
  error: null,
  success: false,
  data: null
}

export const initialRecentProjectsState: RecentProjectsState = {
  loading: false,
  error: null,
  data: []
}

export const initialDeleteProjectState: DeleteProjectState = {
  inFlightIds: [],
  error: null
}

export const initialState: HomePageState = {
  status: null,
  loading: false,
  error: null,
  streaming: false,
  streamLog: [],
  createProject: initialCreateProjectState,
  recentProjects: initialRecentProjectsState,
  deleteProject: initialDeleteProjectState
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

      case FETCH_RECENT_PROJECTS:
        draft.recentProjects.loading = true
        draft.recentProjects.error = null
        break

      case FETCH_RECENT_PROJECTS_SUCCESS:
        draft.recentProjects.loading = false
        draft.recentProjects.data = action.payload
        break

      case FETCH_RECENT_PROJECTS_FAILURE:
        draft.recentProjects.loading = false
        draft.recentProjects.error = action.payload
        break

      case DELETE_PROJECT: {
        const { projectId } = action.payload
        if (!draft.deleteProject.inFlightIds.includes(projectId)) {
          draft.deleteProject.inFlightIds.push(projectId)
        }
        draft.deleteProject.error = null
        break
      }

      case DELETE_PROJECT_SUCCESS: {
        const { projectId } = action.payload
        draft.deleteProject.inFlightIds = draft.deleteProject.inFlightIds.filter(
          (id) => id !== projectId
        )
        draft.recentProjects.data = draft.recentProjects.data.filter(
          (p) => p.id !== projectId
        )
        break
      }

      case DELETE_PROJECT_FAILURE: {
        const { projectId, error } = action.payload
        draft.deleteProject.inFlightIds = draft.deleteProject.inFlightIds.filter(
          (id) => id !== projectId
        )
        draft.deleteProject.error = error
        break
      }
    }
  })

export default homePageReducer
