import {
  FETCH_STATUS,
  FETCH_STATUS_SUCCESS,
  FETCH_STATUS_FAILURE,
  SSE_CONNECT,
  SSE_EVENT,
  SSE_DISCONNECT,
  CREATE_PROJECT,
  CREATE_PROJECT_SUCCESS,
  CREATE_PROJECT_FAILURE,
  RESET_CREATE_PROJECT,
  FETCH_RECENT_PROJECTS,
  FETCH_RECENT_PROJECTS_SUCCESS,
  FETCH_RECENT_PROJECTS_FAILURE,
  DELETE_PROJECT,
  DELETE_PROJECT_SUCCESS,
  DELETE_PROJECT_FAILURE
} from './constants'
import type {
  AppStatus,
  StreamEvent,
  CreateProjectPayload,
  CreateProjectResponse,
  RecentProjectItem,
  ApiErrorPayload,
  DeleteProjectPayload
} from './types'

// ── REST actions ──────────────────────────────────────────────────────────────

export const fetchStatus = () => ({ type: FETCH_STATUS })

export const fetchStatusSuccess = (status: AppStatus) => ({
  type: FETCH_STATUS_SUCCESS,
  payload: status
})

export const fetchStatusFailure = (error: string) => ({
  type: FETCH_STATUS_FAILURE,
  payload: error
})

// ── SSE actions ───────────────────────────────────────────────────────────────

export const sseConnect = () => ({ type: SSE_CONNECT })

export const sseEvent = (payload: StreamEvent) => ({ type: SSE_EVENT, payload })

export const sseDisconnect = () => ({ type: SSE_DISCONNECT })

// ── Create project actions ────────────────────────────────────────────────────

export const createProject = (payload: CreateProjectPayload) => ({ type: CREATE_PROJECT, payload })

export const createProjectSuccess = (data: CreateProjectResponse) => ({
  type: CREATE_PROJECT_SUCCESS,
  payload: data
})

export const createProjectFailure = (error: ApiErrorPayload) => ({
  type: CREATE_PROJECT_FAILURE,
  payload: error
})

export const resetCreateProject = () => ({ type: RESET_CREATE_PROJECT })

// ── Recent projects actions ───────────────────────────────────────────────────

export const fetchRecentProjects = () => ({ type: FETCH_RECENT_PROJECTS })

export const fetchRecentProjectsSuccess = (projects: RecentProjectItem[]) => ({
  type: FETCH_RECENT_PROJECTS_SUCCESS,
  payload: projects
})

export const fetchRecentProjectsFailure = (error: ApiErrorPayload) => ({
  type: FETCH_RECENT_PROJECTS_FAILURE,
  payload: error
})

// ── Delete project actions ────────────────────────────────────────────────────

export const deleteProject = (payload: DeleteProjectPayload) => ({ type: DELETE_PROJECT, payload })

export const deleteProjectSuccess = (projectId: string) => ({
  type: DELETE_PROJECT_SUCCESS,
  payload: { projectId }
})

export const deleteProjectFailure = (projectId: string, error: ApiErrorPayload) => ({
  type: DELETE_PROJECT_FAILURE,
  payload: { projectId, error }
})

// ── Union type ────────────────────────────────────────────────────────────────

export type HomePageAction =
  | ReturnType<typeof fetchStatus>
  | ReturnType<typeof fetchStatusSuccess>
  | ReturnType<typeof fetchStatusFailure>
  | ReturnType<typeof sseConnect>
  | ReturnType<typeof sseEvent>
  | ReturnType<typeof sseDisconnect>
  | ReturnType<typeof createProject>
  | ReturnType<typeof createProjectSuccess>
  | ReturnType<typeof createProjectFailure>
  | ReturnType<typeof resetCreateProject>
  | ReturnType<typeof fetchRecentProjects>
  | ReturnType<typeof fetchRecentProjectsSuccess>
  | ReturnType<typeof fetchRecentProjectsFailure>
  | ReturnType<typeof deleteProject>
  | ReturnType<typeof deleteProjectSuccess>
  | ReturnType<typeof deleteProjectFailure>
