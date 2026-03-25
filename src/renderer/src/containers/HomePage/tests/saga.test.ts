import { call, put, takeLatest } from 'redux-saga/effects'
import homePageSaga, { fetchStatusWorker } from '../saga'
import { api } from 'utils/api'
import * as actions from '../actions'
import { FETCH_STATUS, SSE_CONNECT } from '../constants'

// ── fetchStatusWorker ──────────────────────────────────────────────────────────

describe('fetchStatusWorker', () => {
  it('calls GET /api/status then puts fetchStatusSuccess', () => {
    const gen = fetchStatusWorker()

    // step 1: call effect
    expect(gen.next().value).toEqual(call(api.get, '/api/status'))

    // step 2: success put
    const status = { version: '1.0.0', uptime: 30 }
    expect(gen.next(status).value).toEqual(put(actions.fetchStatusSuccess(status)))

    // done
    expect(gen.next().done).toBe(true)
  })

  it('puts fetchStatusFailure when fetch throws', () => {
    const gen = fetchStatusWorker()

    gen.next() // advance to call

    const error = new Error('Network error')
    expect(gen.throw(error).value).toEqual(
      put(actions.fetchStatusFailure('Network error'))
    )
  })
})

// ── root watcher ───────────────────────────────────────────────────────────────

describe('homePageSaga', () => {
  it('watches FETCH_STATUS with takeLatest', () => {
    const gen = homePageSaga()
    expect(gen.next().value).toEqual(takeLatest(FETCH_STATUS, fetchStatusWorker))
  })

  it('watches SSE_CONNECT with takeLatest as second effect', () => {
    const gen = homePageSaga()
    gen.next() // FETCH_STATUS watcher
    // The value type check: it should be a takeLatest effect for SSE_CONNECT
    const secondEffect = gen.next().value as any
    expect(secondEffect).toBeDefined()
    // takeLatest compiles to a fork with a pattern — check the pattern
    expect(JSON.stringify(secondEffect)).toContain(SSE_CONNECT)
  })
})
