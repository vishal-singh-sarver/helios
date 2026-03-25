import {
  FETCH_STATUS, FETCH_STATUS_SUCCESS, FETCH_STATUS_FAILURE,
  SSE_CONNECT, SSE_EVENT, SSE_DISCONNECT
} from './constants'
import type { AppStatus, StreamEvent } from './types'

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

// ── Union type ────────────────────────────────────────────────────────────────

export type HomePageAction =
  | ReturnType<typeof fetchStatus>
  | ReturnType<typeof fetchStatusSuccess>
  | ReturnType<typeof fetchStatusFailure>
  | ReturnType<typeof sseConnect>
  | ReturnType<typeof sseEvent>
  | ReturnType<typeof sseDisconnect>
