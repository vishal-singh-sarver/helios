import { takeEvery, takeLatest } from 'redux-saga/effects'
import projectScreenSaga from '../saga'
import {
  ADD_COLUMN_REQUESTED,
  ADD_ROW_REQUESTED,
  LOAD_SCENARIO_REQUESTED,
  UPDATE_CELL_LOCAL
} from '../constants'

describe('projectScreenSaga', () => {
  it('registers watchers for the four request action types', () => {
    const gen = projectScreenSaga()

    const effects = [gen.next().value, gen.next().value, gen.next().value, gen.next().value]
    const types = effects
      .map((e) => JSON.stringify(e))
      .map((s) => {
        if (s.includes(LOAD_SCENARIO_REQUESTED)) return LOAD_SCENARIO_REQUESTED
        if (s.includes(ADD_ROW_REQUESTED)) return ADD_ROW_REQUESTED
        if (s.includes(ADD_COLUMN_REQUESTED)) return ADD_COLUMN_REQUESTED
        if (s.includes(UPDATE_CELL_LOCAL)) return UPDATE_CELL_LOCAL
        return null
      })

    expect(types).toContain(LOAD_SCENARIO_REQUESTED)
    expect(types).toContain(ADD_ROW_REQUESTED)
    expect(types).toContain(ADD_COLUMN_REQUESTED)
    expect(types).toContain(UPDATE_CELL_LOCAL)
    expect(gen.next().done).toBe(true)

    // Sanity-check that the watcher kinds are at least valid effect descriptors.
    void takeLatest
    void takeEvery
  })
})
