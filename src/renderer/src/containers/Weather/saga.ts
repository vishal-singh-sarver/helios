import { call, put, race, take, takeLatest, takeLeading } from 'redux-saga/effects'
import { api } from 'utils/api'
import { createSseChannel } from 'utils/sse'
import type { SseMessage } from 'utils/sse'
import * as actions from './actions'
import type { ImportFinalizeRequestedAction } from './actions'
import {
  FETCH_STATUS,
  IMPORT_FINALIZE_REQUESTED,
  IMPORT_PICK_FILE_REQUESTED,
  SSE_CONNECT,
  SSE_DISCONNECT
} from './constants'
import { toCsv } from './parsers'
import type { WeatherStatus } from './types'

// ── REST worker ────────────────────────────────────────────────────────────────

export function* fetchStatusWorker(): Generator {
  try {
    const status = (yield call(api.get<WeatherStatus>, '/api/status')) as WeatherStatus
    yield put(actions.fetchStatusSuccess(status))
  } catch (err) {
    yield put(actions.fetchStatusFailure((err as Error).message))
  }
}

// ── SSE worker ─────────────────────────────────────────────────────────────────

function* sseWorker(): Generator {
  const channel = (yield call(createSseChannel, '/api/events')) as ReturnType<
    typeof createSseChannel
  >

  try {
    while (true) {
      const result = (yield race({
        msg: take(channel),
        stop: take(SSE_DISCONNECT)
      })) as { msg?: SseMessage; stop?: unknown }

      if (result.stop) break

      if (result.msg) {
        yield put(
          actions.sseEvent({
            type: result.msg.type,
            data: result.msg.data,
            timestamp: Date.now()
          })
        )
      }
    }
  } finally {
    channel.close()
    yield put(actions.sseDisconnect())
  }
}

// ── Import: file pick worker ───────────────────────────────────────────────────
//
// Opens the native file dialog via preload, reads the selected file, and
// dispatches the result. User-cancelled dialog returns null — silent no-op.

export function* pickFileWorker(): Generator {
  try {
    const path = (yield call(window.api.openFile, [
      { name: 'Weather data', extensions: ['csv', 'txt', 'xml'] }
    ])) as string | null
    if (!path) {
      // User cancelled the dialog — clear fileLoading so Browse re-enables.
      // Empty error string keeps the banner hidden (StepFilePreview shows
      // it only when fileError is truthy).
      yield put(actions.importPickFileFailed(''))
      return
    }
    const rawText = (yield call(window.api.readFile, path)) as string
    const filename = path.split(/[\\/]/).pop() ?? 'unknown'
    yield put(actions.importPickFileSucceeded({ filename, rawText }))
  } catch (err) {
    yield put(actions.importPickFileFailed((err as Error).message))
  }
}

// ── Import: finalize worker ────────────────────────────────────────────────────
//
// Serializes the in-memory dataset to CSV and prompts the user to save it
// to disk. Temporary stand-in for a real backend POST — when the endpoint
// lands, swap saveFile/writeFile back to api.post(API_ROUTES.weather.import).
// takeLeading prevents double-submits while a save is in flight.

export function* finalizeImportWorker(action: ImportFinalizeRequestedAction): Generator {
  try {
    const csv = toCsv(action.payload)
    const baseName = action.payload.filename.replace(/\.[^.]+$/, '')
    const defaultName = `${baseName}-imported.csv`
    const savePath = (yield call(
      window.api.saveFile,
      [{ name: 'CSV', extensions: ['csv'] }],
      defaultName
    )) as string | null
    if (!savePath) {
      yield put(actions.importFinalizeFailed('Save cancelled'))
      return
    }
    yield call(window.api.writeFile, savePath, csv)
    yield put(actions.importFinalizeSucceeded(action.payload))
  } catch (err) {
    yield put(actions.importFinalizeFailed((err as Error).message))
  }
}

// ── Root watcher ───────────────────────────────────────────────────────────────

export default function* weatherSaga(): Generator {
  yield takeLatest(FETCH_STATUS, fetchStatusWorker)
  yield takeLatest(SSE_CONNECT, sseWorker)
  yield takeLatest(IMPORT_PICK_FILE_REQUESTED, pickFileWorker)
  yield takeLeading(IMPORT_FINALIZE_REQUESTED, finalizeImportWorker)
}
