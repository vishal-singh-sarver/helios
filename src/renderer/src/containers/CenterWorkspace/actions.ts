import {
  FETCH_STATUS,
  FETCH_STATUS_SUCCESS,
  FETCH_STATUS_FAILURE,
  SSE_CONNECT,
  SSE_EVENT,
  SSE_DISCONNECT
} from './constants'
import type { CenterWorkspaceStatus, CenterWorkspaceStreamEvent } from './types'

// ── Action interfaces ──────────────────────────────────────────────────────────

export interface FetchStatusAction {
  type: typeof FETCH_STATUS
}
export interface FetchStatusSuccessAction {
  type: typeof FETCH_STATUS_SUCCESS
  payload: CenterWorkspaceStatus
}
export interface FetchStatusFailureAction {
  type: typeof FETCH_STATUS_FAILURE
  payload: string
}
export interface SseConnectAction {
  type: typeof SSE_CONNECT
}
export interface SseEventAction {
  type: typeof SSE_EVENT
  payload: CenterWorkspaceStreamEvent
}
export interface SseDisconnectAction {
  type: typeof SSE_DISCONNECT
}

export type CenterWorkspaceAction =
  | FetchStatusAction
  | FetchStatusSuccessAction
  | FetchStatusFailureAction
  | SseConnectAction
  | SseEventAction
  | SseDisconnectAction

// ── Action creators ────────────────────────────────────────────────────────────

export const fetchStatus = (): FetchStatusAction => ({ type: FETCH_STATUS })
export const fetchStatusSuccess = (payload: CenterWorkspaceStatus): FetchStatusSuccessAction => ({
  type: FETCH_STATUS_SUCCESS,
  payload
})
export const fetchStatusFailure = (payload: string): FetchStatusFailureAction => ({
  type: FETCH_STATUS_FAILURE,
  payload
})
export const sseConnect = (): SseConnectAction => ({ type: SSE_CONNECT })
export const sseEvent = (payload: CenterWorkspaceStreamEvent): SseEventAction => ({
  type: SSE_EVENT,
  payload
})
export const sseDisconnect = (): SseDisconnectAction => ({ type: SSE_DISCONNECT })
