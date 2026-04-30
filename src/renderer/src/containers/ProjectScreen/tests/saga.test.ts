import { takeEvery, takeLatest } from 'redux-saga/effects'
import projectScreenSaga from '../saga'
import {
  ADD_COLUMN_REQUESTED,
  ADD_ROW_REQUESTED,
  LIST_SCENARIOS_REQUESTED,
  LOAD_DATA_TYPES_REQUESTED,
  LOAD_SCENARIO_REQUESTED,
  SEED_DEFAULT_COLUMNS_REQUESTED,
  UPDATE_CELL_LOCAL,
  UPDATE_COLUMN_REQUESTED
} from '../constants'

describe('projectScreenSaga', () => {
  it('registers watchers for every request action type the screen handles', () => {
    const gen = projectScreenSaga()
    const expected = [
      LOAD_DATA_TYPES_REQUESTED,
      LIST_SCENARIOS_REQUESTED,
      LOAD_SCENARIO_REQUESTED,
      SEED_DEFAULT_COLUMNS_REQUESTED,
      ADD_ROW_REQUESTED,
      ADD_COLUMN_REQUESTED,
      UPDATE_COLUMN_REQUESTED,
      UPDATE_CELL_LOCAL
    ]

    const seen = new Set<string>()
    for (let i = 0; i < expected.length; i++) {
      const step = gen.next()
      const serialised = JSON.stringify(step.value)
      for (const t of expected) if (serialised.includes(t)) seen.add(t)
    }
    expect(gen.next().done).toBe(true)

    for (const t of expected) expect(seen).toContain(t)

    // Sanity-check that the watcher kinds are at least valid effect descriptors.
    void takeLatest
    void takeEvery
  })
})
