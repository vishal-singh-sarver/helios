import { call, put, race, take, takeLatest, takeLeading } from 'redux-saga/effects'
import { api } from 'utils/api'
import { API_ROUTES } from 'utils/constants'
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
import type { ImportedDataset, WeatherStatus } from './types'

// ── Backend payload shapes ─────────────────────────────────────────────────────

interface AddColRequestColumn {
  name: string
  datatype: number | null
  data_unit: number | null
  values: Array<{ date: string; time: string; value: string }>
}

interface AddColRequest {
  column: AddColRequestColumn[]
}

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
// Single backend call: every column registers and uploads its row data in
// one /addCol request, with per-column `values: [{date, time, value}, …]`
// arrays. Non-empty values force PyHelios to register the column AND write
// the cells atomically — sidesteps the empty-values / /addRow race.
// project_id and scenario_id come from localStorage.

const pad2 = (n: number): string => String(n).padStart(2, '0')

function fmtDate(iso: string): string {
  const d = new Date(iso)
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
}

function fmtTime(iso: string): string {
  const d = new Date(iso)
  // Backend expects HH:MM:SS — we don't have second-level precision, so 00.
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}:00`
}

export function* finalizeImportWorker(action: ImportFinalizeRequestedAction): Generator {
  try {
    const projectId = localStorage.getItem('helios:activeProjectId')
    const scenarioId = localStorage.getItem('helios:activeScenarioId')
    if (!projectId || !scenarioId) {
      yield put(actions.importFinalizeFailed('No active project or scenario'))
      return
    }

    const dataset: ImportedDataset = action.payload

    // Pre-compute (date, time) for each record once — reused across columns.
    // Rows whose date couldn't be parsed (dtIso === null) are skipped.
    const rowKeys: Array<{ date: string; time: string; recordIdx: number }> = []
    dataset.records.forEach((r, i) => {
      if (r.dtIso !== null) {
        rowKeys.push({ date: fmtDate(r.dtIso), time: fmtTime(r.dtIso), recordIdx: i })
      }
    })

    // One column entry per dataset column, each carrying every row's cell
    // for that column. Backend stores columns + cells atomically.
    const addColBody: AddColRequest = {
      column: dataset.columns.map((c) => ({
        name: c.label,
        datatype: null,
        data_unit: null,
        values: rowKeys.map(({ date, time, recordIdx }) => ({
          date,
          time,
          value: dataset.records[recordIdx].values[c.key] ?? ''
        }))
      }))
    }

    yield call(api.post, API_ROUTES.weather.addCol(projectId, scenarioId), addColBody)
    yield put(actions.importFinalizeSucceeded(dataset))
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
