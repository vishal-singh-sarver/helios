import {
  addColumnRequest,
  addRowsRequest,
  loadDataRequest,
  loadHeadersRequest,
  updateCellRequest,
  type AddColumnResponse,
  type AddRowsResponse,
  type DataResponse,
  type HeadersResponse,
  type UpdateCellResponse
} from 'containers/Weather/service'
import { call, put, select, takeEvery, takeLatest } from 'redux-saga/effects'
import { mergeDateTimeIntoRows, splitDateTime } from 'utils/weatherTable'
import * as actions from './actions'
import {
  ADD_COLUMN_REQUESTED,
  ADD_ROW_REQUESTED,
  LOAD_SCENARIO_REQUESTED,
  UPDATE_CELL_LOCAL
} from './constants'
import { selectActiveWeatherTable } from './selectors'
import type {
  AddColumnRequestedAction,
  AddRowRequestedAction,
  LoadScenarioRequestedAction,
  UpdateCellLocalAction
} from './actions'
import type { WeatherTable } from './types'

// ── Load scenario ────────────────────────────────────────────────────────────

function* loadScenarioWorker(action: LoadScenarioRequestedAction): Generator {
  const { scenarioId } = action.payload
  try {
    const headersRes = (yield call(loadHeadersRequest)) as HeadersResponse
    const dataRes = (yield call(loadDataRequest)) as DataResponse
    const rows = mergeDateTimeIntoRows(headersRes.headers, dataRes.rows)
    yield put(
      actions.loadScenarioSucceeded({
        scenarioId,
        columns: headersRes.headers,
        rows
      })
    )
  } catch (err) {
    yield put(actions.loadScenarioFailed(scenarioId, (err as Error).message))
  }
}

// ── Add row ──────────────────────────────────────────────────────────────────

function* addRowWorker(action: AddRowRequestedAction): Generator {
  const { scenarioId, date, time, columnIds, numberOfRows } = action.payload
  try {
    const res = (yield call(addRowsRequest, {
      date,
      time,
      columnIds,
      numberOfRows
    })) as AddRowsResponse

    const table = (yield select(selectActiveWeatherTable)) as WeatherTable | null
    const columns = table ? Object.values(table.columns) : []
    const merged = mergeDateTimeIntoRows(columns, res.rows)

    yield put(actions.addRowSucceeded(scenarioId, merged))
  } catch (err) {
    yield put(actions.addRowFailed(scenarioId, (err as Error).message))
  }
}

// ── Add column ───────────────────────────────────────────────────────────────

function* addColumnWorker(action: AddColumnRequestedAction): Generator {
  const { scenarioId, name, dataTypeId, dataUnitId, defaultValue } = action.payload
  try {
    const res = (yield call(addColumnRequest, {
      name,
      dataTypeId,
      dataUnitId,
      defaultValue
    })) as AddColumnResponse
    yield put(actions.addColumnSucceeded(scenarioId, res.column, defaultValue))
  } catch (err) {
    yield put(actions.addColumnFailed(scenarioId, (err as Error).message))
  }
}

// ── Cell edit ────────────────────────────────────────────────────────────────
//
// UPDATE_CELL_LOCAL writes optimistically in the reducer. The saga then
// short-circuits when validationError is non-null (no network call), and
// otherwise POSTs the edit using the row's natural backend key — date+time
// recovered from the date-time column value.

function* updateCellWorker(action: UpdateCellLocalAction): Generator {
  const { scenarioId, rowId, colId, value, validationError } = action.payload
  if (validationError != null) return

  yield put(actions.updateCellRequested(scenarioId, rowId, colId))

  const table = (yield select(selectActiveWeatherTable)) as WeatherTable | null
  if (!table) return

  // Find the date-time column and pull date+time off the row.
  const datetimeCol = Object.values(table.columns).find((c) => c.name === 'date_time')
  const row = table.rows[rowId]
  if (!datetimeCol || !row) return

  const { date, time } = splitDateTime(row[datetimeCol.id] ?? '')

  try {
    ;(yield call(updateCellRequest, { date, time, colId, value })) as UpdateCellResponse
    yield put(actions.updateCellSucceeded(scenarioId, rowId, colId))
  } catch (err) {
    yield put(actions.updateCellFailed(scenarioId, rowId, colId, (err as Error).message))
  }
}

// ── Root watcher ─────────────────────────────────────────────────────────────

export default function* projectScreenSaga(): Generator {
  yield takeLatest(LOAD_SCENARIO_REQUESTED, loadScenarioWorker)
  yield takeLatest(ADD_ROW_REQUESTED, addRowWorker)
  yield takeLatest(ADD_COLUMN_REQUESTED, addColumnWorker)
  yield takeEvery(UPDATE_CELL_LOCAL, updateCellWorker)
}
