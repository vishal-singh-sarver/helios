import { takeLatest } from 'redux-saga/effects'
import projectScreenSaga, { fetchStatusWorker } from '../saga'
import { FETCH_STATUS, SSE_CONNECT } from '../constants'

describe('projectScreenSaga', () => {
  it('is a generator function', () => {
    const iter = projectScreenSaga()
    expect(iter).toBeDefined()
    expect(typeof iter.next).toBe('function')
  })

  it('watches FETCH_STATUS with takeLatest', () => {
    const gen = projectScreenSaga()
    expect(gen.next().value).toEqual(takeLatest(FETCH_STATUS, fetchStatusWorker))
  })

  it('watches SSE_CONNECT as the second effect', () => {
    const gen = projectScreenSaga()
    gen.next()
    const second = JSON.stringify(gen.next().value)
    expect(second).toContain(SSE_CONNECT)
    expect(second).toContain('"FORK"')
  })

  it('has no more effects after the two watchers', () => {
    const gen = projectScreenSaga()
    gen.next()
    gen.next()
    expect(gen.next().done).toBe(true)
  })
})
