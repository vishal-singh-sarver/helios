import {
  FETCH_STATUS, FETCH_STATUS_SUCCESS, FETCH_STATUS_FAILURE,
  SSE_CONNECT, SSE_EVENT, SSE_DISCONNECT,
  CREATE_PROJECT, CREATE_PROJECT_SUCCESS, CREATE_PROJECT_FAILURE, RESET_CREATE_PROJECT
} from './constants'
import type { AppStatus, StreamEvent, CreateProjectPayload, CreateProjectResponse } from './types'

// ── REST actions ──────────────────────────────────────────────────────────────

export const fetchStatus = () =>
  ({ type: FETCH_STATUS })

export const fetchStatusSuccess = (status: AppStatus) =>
  ({ type: FETCH_STATUS_SUCCESS, payload: status })

export const fetchStatusFailure = (error: string) =>
  ({ type: FETCH_STATUS_FAILURE, payload: error })

// ── SSE actions ───────────────────────────────────────────────────────────────

export const sseConnect = () =>
  ({ type: SSE_CONNECT })

export const sseEvent = (payload: StreamEvent) =>
  ({ type: SSE_EVENT, payload })

export const sseDisconnect = () =>
  ({ type: SSE_DISCONNECT })

// ── Create project actions ────────────────────────────────────────────────────

export const createProject = (payload: CreateProjectPayload) =>
  ({ type: CREATE_PROJECT, payload })

export const createProjectSuccess = (data: CreateProjectResponse) =>
  ({ type: CREATE_PROJECT_SUCCESS, payload: data })

export const createProjectFailure = (error: string) =>
  ({ type: CREATE_PROJECT_FAILURE, payload: error })

export const resetCreateProject = () =>
  ({ type: RESET_CREATE_PROJECT })

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
