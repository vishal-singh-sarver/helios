import homePageReducer, { initialState } from '../reducer'
import * as actions from '../actions'

describe('homePageReducer', () => {
  it('returns the initial state', () => {
    expect(homePageReducer(undefined, {} as any)).toEqual(initialState)
  })

  describe('REST', () => {
    it('FETCH_STATUS sets loading and clears error', () => {
      const state = { ...initialState, error: 'prev error' }
      const result = homePageReducer(state, actions.fetchStatus())
      expect(result.loading).toBe(true)
      expect(result.error).toBeNull()
    })

    it('FETCH_STATUS_SUCCESS stores status and clears loading', () => {
      const status = { version: '2.0.0', uptime: 120 }
      const state = { ...initialState, loading: true }
      const result = homePageReducer(state, actions.fetchStatusSuccess(status))
      expect(result.loading).toBe(false)
      expect(result.status).toEqual(status)
    })

    it('FETCH_STATUS_FAILURE stores error and clears loading', () => {
      const state = { ...initialState, loading: true }
      const result = homePageReducer(state, actions.fetchStatusFailure('connection refused'))
      expect(result.loading).toBe(false)
      expect(result.error).toBe('connection refused')
    })
  })

  describe('SSE', () => {
    it('SSE_CONNECT sets streaming and resets log', () => {
      const event = { type: 'x', data: null, timestamp: 0 }
      const state = { ...initialState, streamLog: [event] }
      const result = homePageReducer(state, actions.sseConnect())
      expect(result.streaming).toBe(true)
      expect(result.streamLog).toHaveLength(0)
    })

    it('SSE_EVENT appends event to streamLog', () => {
      const event = { type: 'update', data: { count: 5 }, timestamp: 9999 }
      const result = homePageReducer(initialState, actions.sseEvent(event))
      expect(result.streamLog).toHaveLength(1)
      expect(result.streamLog[0]).toEqual(event)
    })

    it('SSE_DISCONNECT clears streaming flag', () => {
      const state = { ...initialState, streaming: true }
      const result = homePageReducer(state, actions.sseDisconnect())
      expect(result.streaming).toBe(false)
    })

    it('SSE_EVENT does not mutate the original state', () => {
      const event = { type: 'ping', data: 'hi', timestamp: 1 }
      homePageReducer(initialState, actions.sseEvent(event))
      expect(initialState.streamLog).toHaveLength(0)
    })
  })
})
