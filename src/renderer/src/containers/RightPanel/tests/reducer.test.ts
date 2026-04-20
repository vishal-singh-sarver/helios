import rightPanelReducer, { initialState } from '../reducer'
import * as actions from '../actions'

describe('rightPanelReducer', () => {
  it('returns the initial state', () => {
    expect(rightPanelReducer(undefined, {} as any)).toEqual(initialState)
  })

  describe('REST', () => {
    it('FETCH_STATUS sets loading and clears error', () => {
      const state = { ...initialState, error: 'prev' }
      const result = rightPanelReducer(state, actions.fetchStatus())
      expect(result.loading).toBe(true)
      expect(result.error).toBeNull()
    })

    it('FETCH_STATUS_SUCCESS stores status and clears loading', () => {
      const status = { version: '1.0.0', uptime: 0 }
      const result = rightPanelReducer(
        { ...initialState, loading: true },
        actions.fetchStatusSuccess(status)
      )
      expect(result.loading).toBe(false)
      expect(result.status).toEqual(status)
    })

    it('FETCH_STATUS_FAILURE stores error and clears loading', () => {
      const result = rightPanelReducer(
        { ...initialState, loading: true },
        actions.fetchStatusFailure('err')
      )
      expect(result.loading).toBe(false)
      expect(result.error).toBe('err')
    })
  })

  describe('SSE', () => {
    it('SSE_CONNECT sets streaming and resets log', () => {
      const event = { type: 'x', data: null, timestamp: 0 }
      const result = rightPanelReducer(
        { ...initialState, streamLog: [event] },
        actions.sseConnect()
      )
      expect(result.streaming).toBe(true)
      expect(result.streamLog).toHaveLength(0)
    })

    it('SSE_EVENT appends event to streamLog', () => {
      const event = { type: 'update', data: {}, timestamp: 1 }
      const result = rightPanelReducer(initialState, actions.sseEvent(event))
      expect(result.streamLog).toHaveLength(1)
      expect(result.streamLog[0]).toEqual(event)
    })

    it('SSE_DISCONNECT clears streaming flag', () => {
      const result = rightPanelReducer(
        { ...initialState, streaming: true },
        actions.sseDisconnect()
      )
      expect(result.streaming).toBe(false)
    })

    it('SSE_EVENT does not mutate original state', () => {
      const event = { type: 'ping', data: null, timestamp: 1 }
      rightPanelReducer(initialState, actions.sseEvent(event))
      expect(initialState.streamLog).toHaveLength(0)
    })
  })
})
