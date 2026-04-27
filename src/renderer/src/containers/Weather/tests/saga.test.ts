import { call, put, takeLatest, takeLeading } from 'redux-saga/effects'
import weatherSaga, {
  fetchStatusWorker,
  finalizeImportWorker,
  pickFileWorker
} from '../saga'
import { api } from 'utils/api'
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
    columns: [{ key: '__check__', label: 'check', index: -1 }],
    records: [{ dtIso: '2026-01-01T00:00:00.000Z', values: { __check__: 'true' } }]
  }

  it('opens save dialog → writes file → puts succeeded with the dataset', () => {
    const gen = finalizeImportWorker(actions.importFinalizeRequested(dataset))

    // 1) Save dialog with derived default filename
    const saveCall = gen.next().value as ReturnType<typeof call>
    expect(saveCall.payload.fn).toBe(window.api.saveFile)
    expect(saveCall.payload.args[0]).toEqual([{ name: 'CSV', extensions: ['csv'] }])
    expect(saveCall.payload.args[1]).toBe('sample-imported.csv')

    // 2) Write to chosen path
    const savePath = '/tmp/weather/out.csv'
    const writeCall = gen.next(savePath).value as ReturnType<typeof call>
    expect(writeCall.payload.fn).toBe(window.api.writeFile)
    expect(writeCall.payload.args[0]).toBe(savePath)
    // CSV body — check header is the first line
    expect(String(writeCall.payload.args[1]).split('\n')[0]).toBe('Date-Time,check')

    // 3) Succeeded
    expect(gen.next().value).toEqual(put(actions.importFinalizeSucceeded(dataset)))
    expect(gen.next().done).toBe(true)
  })

  it('puts importFinalizeFailed("Save cancelled") when user cancels the save dialog', () => {
    const gen = finalizeImportWorker(actions.importFinalizeRequested(dataset))
    gen.next() // saveFile
    expect(gen.next(null).value).toEqual(put(actions.importFinalizeFailed('Save cancelled')))
    expect(gen.next().done).toBe(true)
  })

  it('puts importFinalizeFailed when writeFile throws', () => {
    const gen = finalizeImportWorker(actions.importFinalizeRequested(dataset))
    gen.next() // saveFile
    gen.next('/tmp/x.csv') // writeFile
    const err = new Error('disk full')
    expect(gen.throw(err).value).toEqual(put(actions.importFinalizeFailed('disk full')))
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
