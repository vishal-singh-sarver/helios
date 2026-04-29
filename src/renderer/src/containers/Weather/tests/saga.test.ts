import { call, put, takeLatest, takeLeading } from 'redux-saga/effects'
import weatherSaga, {
  fetchStatusWorker,
  finalizeImportWorker,
  pickFileWorker
} from '../saga'
import { api } from 'utils/api'
import { loadScenarioRequested } from 'containers/ProjectScreen/actions'
import * as actions from '../actions'
import {
  FETCH_STATUS,
  IMPORT_FINALIZE_REQUESTED,
  IMPORT_PICK_FILE_REQUESTED,
  SSE_CONNECT
} from '../constants'
import type { ImportedDataset } from '../types'

describe('fetchStatusWorker', () => {
  it('calls GET /api/status then puts fetchStatusSuccess', () => {
    const gen = fetchStatusWorker()
    expect(gen.next().value).toEqual(call(api.get, '/api/status'))
    const status = { version: '1.0.0', uptime: 0 }
    expect(gen.next(status).value).toEqual(put(actions.fetchStatusSuccess(status)))
    expect(gen.next().done).toBe(true)
  })

  it('puts fetchStatusFailure when fetch throws', () => {
    const gen = fetchStatusWorker()
    gen.next() // advance to call
    const error = new Error('Network error')
    expect(gen.throw(error).value).toEqual(put(actions.fetchStatusFailure('Network error')))
  })
})

// ── pickFileWorker ────────────────────────────────────────────────────────────

describe('pickFileWorker', () => {
  // Tests rely on window.api being available via the renderer global
  // declaration; we assert effect equality by yield value.

  it('opens dialog → reads file → puts succeeded with filename and rawText', () => {
    const gen = pickFileWorker()

    // 1) opens the native file dialog with weather extensions
    expect(gen.next().value).toEqual(
      call(window.api.openFile, [{ name: 'Weather data', extensions: ['csv', 'txt', 'xml'] }])
    )

    // 2) reads the chosen path
    const path = '/tmp/weather/sample.csv'
    expect(gen.next(path).value).toEqual(call(window.api.readFile, path))

    // 3) puts succeeded with derived filename
    const rawText = 'a,b\n1,2'
    expect(gen.next(rawText).value).toEqual(
      put(actions.importPickFileSucceeded({ filename: 'sample.csv', rawText }))
    )
    expect(gen.next().done).toBe(true)
  })

  it('clears fileLoading via empty-string failure when the user cancels', () => {
    const gen = pickFileWorker()
    gen.next() // openFile
    // path === null → cancel. Dispatch FAILED with empty error so the
    // banner stays hidden but fileLoading flips back to false.
    expect(gen.next(null).value).toEqual(put(actions.importPickFileFailed('')))
    expect(gen.next().done).toBe(true)
  })

  it('puts importPickFileFailed when dialog/read throws', () => {
    const gen = pickFileWorker()
    gen.next() // openFile
    const err = new Error('read denied')
    expect(gen.throw(err).value).toEqual(put(actions.importPickFileFailed('read denied')))
  })
})

// ── finalizeImportWorker ──────────────────────────────────────────────────────

describe('finalizeImportWorker', () => {
  const dataset: ImportedDataset = {
    filename: 'sample.csv',
    columns: [
      { key: '__check__', label: 'check', index: -1 },
      { key: '5__temp', label: 'temp', index: 5 }
    ],
    records: [
      {
        dtIso: '2026-01-01T10:00:00.000Z',
        values: { __check__: '1', '5__temp': '22.5' }
      },
      // Second row has dtIso=null — should be skipped from /addRow.
      {
        dtIso: null,
        values: { __check__: '1', '5__temp': '99.9' }
      }
    ]
  }

  beforeEach(() => {
    localStorage.setItem('helios:activeProjectId', 'proj-1')
    localStorage.setItem('helios:activeScenarioId', 'sce-1')
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('fails fast when project or scenario id is missing from localStorage', () => {
    localStorage.clear()
    const gen = finalizeImportWorker(actions.importFinalizeRequested(dataset))
    expect(gen.next().value).toEqual(
      put(actions.importFinalizeFailed('No active project or scenario'))
    )
    expect(gen.next().done).toBe(true)
  })

  it('DELETEs /clear_data, then POSTs /addCol, then puts succeeded', () => {
    const gen = finalizeImportWorker(actions.importFinalizeRequested(dataset))

    // Step 0 — clear any prior weather data for this scenario.
    const clearCall = gen.next().value as ReturnType<typeof call>
    expect(clearCall.payload.args[0]).toBe(
      '/api/weather/project/proj-1/scenario/sce-1/clear_data'
    )

    // Step 1 — addCol with all rows inline.
    const addColCall = gen.next().value as ReturnType<typeof call>
    expect(addColCall.payload.args[0]).toBe(
      '/api/weather/project/proj-1/scenario/sce-1/addCol'
    )
    // Only one row in `values` per column — the invalid_date record is skipped.
    expect(addColCall.payload.args[1]).toEqual({
      column: [
        {
          name: 'check',
          datatype: null,
          data_unit: null,
          values: [
            {
              date: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
              time: expect.stringMatching(/^\d{2}:\d{2}:\d{2}$/),
              value: '1'
            }
          ]
        },
        {
          name: 'temp',
          datatype: null,
          data_unit: null,
          values: [
            {
              date: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
              time: expect.stringMatching(/^\d{2}:\d{2}:\d{2}$/),
              value: '22.5'
            }
          ]
        }
      ]
    })

    // Step 2 — saga dispatches loadScenarioRequested to refresh the table.
    expect(gen.next().value).toEqual(put(loadScenarioRequested('proj-1', 'sce-1')))

    // Step 3 — saga races on LOAD_SCENARIO_SUCCEEDED / LOAD_SCENARIO_FAILED.
    // Yield value is the race effect itself; resume the generator with a
    // "succeeded" branch so the worker proceeds to finalize.
    gen.next() // race(...)
    expect(
      gen.next({ succeeded: { payload: { scenarioId: 'sce-1' } } }).value
    ).toEqual(put(actions.importFinalizeSucceeded(dataset)))
    expect(gen.next().done).toBe(true)
  })

  it('puts importFinalizeFailed when scenario refresh fails', () => {
    const gen = finalizeImportWorker(actions.importFinalizeRequested(dataset))
    gen.next() // clear_data
    gen.next() // addCol
    gen.next() // put loadScenarioRequested
    gen.next() // race(...)
    const failure = gen.next({
      failed: { payload: { scenarioId: 'sce-1', error: 'header fetch 500' } }
    }).value
    expect(failure).toEqual(
      put(actions.importFinalizeFailed('Imported, but failed to refresh data: header fetch 500'))
    )
    expect(gen.next().done).toBe(true)
  })

  it('puts importFinalizeFailed when /clear_data throws', () => {
    const gen = finalizeImportWorker(actions.importFinalizeRequested(dataset))
    gen.next() // clear_data
    const err = new Error('cannot clear')
    expect(gen.throw(err).value).toEqual(put(actions.importFinalizeFailed('cannot clear')))
  })

  it('puts importFinalizeFailed when /addCol throws', () => {
    const gen = finalizeImportWorker(actions.importFinalizeRequested(dataset))
    gen.next() // clear_data
    gen.next() // addCol
    const err = new Error('column conflict')
    expect(gen.throw(err).value).toEqual(put(actions.importFinalizeFailed('column conflict')))
  })
})

// ── root watcher ──────────────────────────────────────────────────────────────

describe('weatherSaga (root)', () => {
  it('watches FETCH_STATUS with takeLatest', () => {
    const gen = weatherSaga()
    expect(gen.next().value).toEqual(takeLatest(FETCH_STATUS, fetchStatusWorker))
  })

  it('watches SSE_CONNECT with takeLatest as second effect', () => {
    const gen = weatherSaga()
    gen.next() // FETCH_STATUS watcher
    const secondEffect = gen.next().value as any
    expect(JSON.stringify(secondEffect)).toContain(SSE_CONNECT)
  })

  it('watches IMPORT_PICK_FILE_REQUESTED with takeLatest', () => {
    const gen = weatherSaga()
    gen.next() // FETCH_STATUS
    gen.next() // SSE_CONNECT
    expect(gen.next().value).toEqual(takeLatest(IMPORT_PICK_FILE_REQUESTED, pickFileWorker))
  })

  it('watches IMPORT_FINALIZE_REQUESTED with takeLeading', () => {
    const gen = weatherSaga()
    gen.next() // FETCH_STATUS
    gen.next() // SSE_CONNECT
    gen.next() // IMPORT_PICK_FILE_REQUESTED
    expect(gen.next().value).toEqual(takeLeading(IMPORT_FINALIZE_REQUESTED, finalizeImportWorker))
  })
})
