import * as actions from '../actions'
import {
  FETCH_STATUS,
  FETCH_STATUS_SUCCESS,
  FETCH_STATUS_FAILURE,
  SSE_CONNECT,
  SSE_EVENT,
  SSE_DISCONNECT
} from '../constants'
import type { AppStatus, StreamEvent } from '../types'

describe('HomePage actions', () => {
  it('fetchStatus has correct type', () => {
    expect(actions.fetchStatus()).toEqual({ type: FETCH_STATUS })
  })

  it('fetchStatusSuccess carries payload', () => {
    const payload: AppStatus = { version: '1.2.3', uptime: 42 }
    expect(actions.fetchStatusSuccess(payload)).toEqual({ type: FETCH_STATUS_SUCCESS, payload })
  })

  it('fetchStatusFailure carries error message', () => {
    expect(actions.fetchStatusFailure('timeout')).toEqual({
      type: FETCH_STATUS_FAILURE,
      payload: 'timeout'
    })
  })

  it('sseConnect has correct type', () => {
    expect(actions.sseConnect()).toEqual({ type: SSE_CONNECT })
  })

  it('sseEvent carries payload', () => {
    const payload: StreamEvent = { type: 'ping', data: { ok: true }, timestamp: 1000 }
    expect(actions.sseEvent(payload)).toEqual({ type: SSE_EVENT, payload })
  })

  it('sseDisconnect has correct type', () => {
    expect(actions.sseDisconnect()).toEqual({ type: SSE_DISCONNECT })
  })
})
