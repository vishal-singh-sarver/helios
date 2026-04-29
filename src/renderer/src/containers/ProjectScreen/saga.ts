import { all, call, put, select, takeEvery, takeLatest } from 'redux-saga/effects'
import {
  addColumnRequest,
  addRowsRequest,
  getProjectRequest,
  loadDataRequest,
  loadDataTypesRequest,
  loadHeadersRequest,
  patchHeaderRequest,
  toCellValue,
  type AddColumnResponse,
  type AddRowsResponse,
  type DataPage,
  type DataTypesResponse,
  type GetProjectResponse,
  type HeadersResponse,
  type PatchHeaderRequestBody,
  type UpdateCellResponse,
  updateCellRequest
} from 'containers/Weather/service'
import * as actions from './actions'
import {
  ADD_COLUMN_REQUESTED,
  ADD_ROW_REQUESTED,
  LIST_SCENARIOS_REQUESTED,
  LOAD_DATA_TYPES_REQUESTED,
  LOAD_SCENARIO_REQUESTED,
  UPDATE_CELL_LOCAL,
  UPDATE_COLUMN_REQUESTED
} from './constants'
import { selectActiveWeatherTable } from './selectors'
import type {
  AddColumnRequestedAction,
  AddRowRequestedAction,
  ListScenariosRequestedAction,
  LoadScenarioRequestedAction,
  UpdateCellLocalAction,
  UpdateColumnRequestedAction
} from './actions'
import {
  DATE_COL_ID,
  TIME_COL_ID,
  type CellValue,
  type ColId,
  type ColumnDef,
  type WeatherHeader,
  type WeatherTable
} from './types'

// ── Catalog: data types ──────────────────────────────────────────────────────

function* loadDataTypesWorker(): Generator {
  try {
    const res = (yield call(loadDataTypesRequest)) as DataTypesResponse
    yield put(actions.loadDataTypesSucceeded(res.data_types))
  } catch (err) {
    yield put(actions.loadDataTypesFailed((err as Error).message))
  }
}

// ── List scenarios ───────────────────────────────────────────────────────────
//
// Fetches all scenarios for a project, picks the first one as active, and
// persists its id to localStorage so the active scenario survives reloads.
// Chains LOAD_SCENARIO_REQUESTED so the table populates without a second
// round-trip from the component.

const SCENARIO_ID_STORAGE_KEY = 'helios:activeScenarioId'

function* listScenariosWorker(action: ListScenariosRequestedAction): Generator {
  const { projectId } = action.payload
  try {
    const res = (yield call(getProjectRequest, projectId)) as GetProjectResponse
    const scenarios = res.project.scenarios
    yield put(actions.listScenariosSucceeded(projectId, scenarios))

    const first = scenarios[0]
    if (!first) return
    yield call([localStorage, 'setItem'], SCENARIO_ID_STORAGE_KEY, first.id)
    yield put(actions.setActiveScenario(first.id))
    yield put(actions.loadScenarioRequested(projectId, first.id))
  } catch (err) {
    yield put(actions.listScenariosFailed(projectId, (err as Error).message))
  }
}

// ── Load scenario ────────────────────────────────────────────────────────────
//
// Parallel fetch of weather_data_header + getAllTimeSeriesData. The data
// response's `labels[]` is the authoritative column list (it includes the
// "date" / "time" pseudo-columns and may contain either stringified header
// IDs or upload-time slugs). Header metadata is joined in defensively —
// labels without a matching header render as bare names (no unit).
//
// Headers are routed through fetchHeaders so the raw WeatherHeader[] also
// lands in the dedicated headers slice — consumers that need
// status/display_order/helios_data_type_id read from there instead of the
// joined ColumnDefs.

function* fetchHeaders(
  projectId: string,
  scenarioId: string
): Generator<unknown, WeatherHeader[]> {
  yield put(actions.loadHeadersRequested(projectId, scenarioId))
  try {
    const res = (yield call(loadHeadersRequest, projectId, scenarioId)) as HeadersResponse
    yield put(actions.loadHeadersSucceeded(scenarioId, res.headers))
    return res.headers
  } catch (err) {
    yield put(actions.loadHeadersFailed(scenarioId, (err as Error).message))
    throw err
  }
}

function* loadScenarioWorker(action: LoadScenarioRequestedAction): Generator {
  const { projectId, scenarioId } = action.payload
  try {
    const [headers, dataRes] = (yield all([
      call(fetchHeaders, projectId, scenarioId),
      call(loadDataRequest, projectId, scenarioId)
    ])) as [WeatherHeader[], DataPage]

    // Column order = date/time first, then all backend headers in display
    // order, then any extra labels (uploaded slugs) not in headers. We can't
    // rely on dataRes.labels alone — when rows[] is empty the backend may
    // return labels=["date","time"] only, which would drop the real columns
    // and break /addRow (it requires every column id as a row key).
    const sortedHeaders = [...headers].sort(
      (a, b) => a.display_order - b.display_order
    )
    const seen = new Set<ColId>()
    const columns: ColumnDef[] = []

    const pushCol = (col: ColumnDef): void => {
      if (seen.has(col.id)) return
      columns.push(col)
      seen.add(col.id)
    }

    pushCol({ id: DATE_COL_ID, name: DATE_COL_ID, dataTypeId: null, unitId: null })
    pushCol({ id: TIME_COL_ID, name: TIME_COL_ID, dataTypeId: null, unitId: null })
    for (const h of sortedHeaders) {
      pushCol({
        id: String(h.id),
        name: h.name,
        dataTypeId: h.helios_data_type_id,
        unitId: h.unit_id
      })
    }
    for (const label of dataRes.labels) {
      pushCol({ id: label, name: label, dataTypeId: null, unitId: null })
    }

    const rows: Array<Record<ColId, CellValue>> = dataRes.rows.map((raw) => {
      const out: Record<ColId, CellValue> = {}
      for (const col of columns) {
        out[col.id] = toCellValue(raw[col.id])
      }
      return out
    })

    yield put(
      actions.loadScenarioSucceeded({
        projectId,
        scenarioId,
        columns,
        rows
      })
    )
  } catch (err) {
    yield put(
      actions.loadScenarioFailed(projectId, scenarioId, (err as Error).message)
    )
  }
}

// ── Add row ──────────────────────────────────────────────────────────────────
//
// Backend's /addRow takes a fully-built rows[] array, so the saga expands
// (startDate, startTime, deltaHours, numberOfRows) into row dicts here. Every
// column id from columnOrder must appear as a key in each row — backend
// rejects with "row labels must match existing columns" otherwise. Non-date/
// time cells are sent as null (cleared / NaN). Returns counters only — saga
// chains LOAD_SCENARIO_REQUESTED so the reducer doesn't need an append branch.

const HOUR_MS = 60 * 60 * 1000

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n)
}

function buildRowsForAdd(
  startDate: string,
  startTime: string,
  deltaHours: number,
  numberOfRows: number,
  columnIds: ColId[]
): Array<Record<string, string | null>> {
  // YYYY-MM-DD + HH:mm parsed in UTC so addition stays linear (no DST shifts).
  const [y, mo, d] = startDate.split('-').map((v) => Number.parseInt(v, 10))
  const [h, mi] = startTime.split(':').map((v) => Number.parseInt(v, 10))
  const baseMs = Date.UTC(y, mo - 1, d, h, mi, 0, 0)

  const out: Array<Record<string, string | null>> = []
  for (let i = 0; i < numberOfRows; i++) {
    const ts = new Date(baseMs + i * deltaHours * HOUR_MS)
    const rowDate = `${ts.getUTCFullYear()}-${pad2(ts.getUTCMonth() + 1)}-${pad2(ts.getUTCDate())}`
    const rowTime = `${pad2(ts.getUTCHours())}:${pad2(ts.getUTCMinutes())}:00`

    const row: Record<string, string | null> = {}
    for (const colId of columnIds) {
      if (colId === DATE_COL_ID) row[colId] = rowDate
      else if (colId === TIME_COL_ID) row[colId] = rowTime
      else row[colId] = "0"
    }
    out.push(row)
  }
  return out
}

function* addRowWorker(action: AddRowRequestedAction): Generator {
  const { projectId, scenarioId, date, time, columnIds, numberOfRows, deltaHours } =
    action.payload
  try {
    const rows = buildRowsForAdd(date, time, deltaHours, numberOfRows, columnIds)
    ;(yield call(addRowsRequest, projectId, scenarioId, { rows })) as AddRowsResponse

    yield put(actions.addRowSucceeded(projectId, scenarioId))
    yield put(actions.loadScenarioRequested(projectId, scenarioId))
  } catch (err) {
    yield put(actions.addRowFailed(projectId, scenarioId, (err as Error).message))
  }
}

// ── Add column ───────────────────────────────────────────────────────────────
//
// `values[]` back-fills existing rows on the server. Each entry is
// { date, time, value } so the backend can address each cell by its row
// timestamp. If the user supplied a default we emit one entry per existing
// row; otherwise we send [] and the server leaves new cells as NaN/null.
// Rows missing date or time are skipped defensively.

function* addColumnWorker(action: AddColumnRequestedAction): Generator {
  const { projectId, scenarioId, name, dataTypeId, dataUnitId, defaultValue } =
    action.payload
  try {
    const table = (yield select(selectActiveWeatherTable)) as WeatherTable | null
    const values: Array<{ date: string; time: string; value: string }> = []

    if (defaultValue !== '' && table) {
      for (const rowId of table.rowOrder) {
        const row = table.rows[rowId]
        if (!row) continue
        const date = row[DATE_COL_ID]
        const time = row[TIME_COL_ID]
        if (date == null || time == null) continue
        values.push({ date, time, value: defaultValue })
      }
    }

    const res = (yield call(addColumnRequest, projectId, scenarioId, {
      name,
      dataTypeId,
      dataUnitId,
      values
    })) as AddColumnResponse
    yield put(actions.addColumnSucceeded(projectId, scenarioId, res.column, defaultValue))
  } catch (err) {
    yield put(actions.addColumnFailed(projectId, scenarioId, (err as Error).message))
  }
}

// ── Update column header ─────────────────────────────────────────────────────
//
// PATCH /weather_data_header/{header_id} — partial update. The reducer has
// already applied the optimistic write on _REQUESTED, so this worker only
// needs to (a) translate the colId to a numeric header id, (b) translate
// camelCase keys to the wire's snake_case, and (c) roll back on failure by
// dispatching _FAILED with the snapshot the dispatcher captured.

function* updateColumnWorker(action: UpdateColumnRequestedAction): Generator {
  const { projectId, scenarioId, colId, patch, previous } = action.payload

  // Only backend-managed columns have a numeric header id. Reserved date/time
  // and upload-slug columns must be filtered out at the dispatcher; bail
  // defensively here.
  const headerId = Number(colId)
  if (!Number.isFinite(headerId) || headerId <= 0) {
    yield put(
      actions.updateColumnFailed(
        projectId,
        scenarioId,
        colId,
        previous,
        'Column has no header id'
      )
    )
    return
  }

  const wire: PatchHeaderRequestBody = {}
  if (patch.name !== undefined) wire.name = patch.name
  if (patch.dataTypeId !== undefined) wire.helios_data_type_id = patch.dataTypeId
  if (patch.unitId !== undefined) wire.unit_id = patch.unitId

  try {
    yield call(patchHeaderRequest, projectId, scenarioId, headerId, wire)
    yield put(actions.updateColumnSucceeded(projectId, scenarioId, colId))
  } catch (err) {
    yield put(
      actions.updateColumnFailed(
        projectId,
        scenarioId,
        colId,
        previous,
        (err as Error).message
      )
    )
  }
}

// ── Cell edit ────────────────────────────────────────────────────────────────
//
// UPDATE_CELL_LOCAL writes optimistically in the reducer. The saga then
// short-circuits when validationError is non-null (no network call), and
// otherwise POSTs the edit. The row is identified by (date, time) read
// directly off the row map — backend rejects "date" / "time" as col values.

function* updateCellWorker(action: UpdateCellLocalAction): Generator {
  const { projectId, scenarioId, rowId, colId, value, validationError } = action.payload
  if (validationError != null) return
  if (colId === DATE_COL_ID || colId === TIME_COL_ID) return

  yield put(actions.updateCellRequested(projectId, scenarioId, rowId, colId))

  const table = (yield select(selectActiveWeatherTable)) as WeatherTable | null
  if (!table) return

  const row = table.rows[rowId]
  if (!row) return

  const date = row[DATE_COL_ID]
  const time = row[TIME_COL_ID]
  if (date == null || time == null) return

  try {
    ;(yield call(updateCellRequest, projectId, scenarioId, {
      col: colId,
      row: { date, time },
      value
    })) as UpdateCellResponse
    yield put(actions.updateCellSucceeded(projectId, scenarioId, rowId, colId))
  } catch (err) {
    yield put(
      actions.updateCellFailed(projectId, scenarioId, rowId, colId, (err as Error).message)
    )
  }
}

// ── Root watcher ─────────────────────────────────────────────────────────────

export default function* projectScreenSaga(): Generator {
  yield takeLatest(LOAD_DATA_TYPES_REQUESTED, loadDataTypesWorker)
  yield takeLatest(LIST_SCENARIOS_REQUESTED, listScenariosWorker)
  yield takeLatest(LOAD_SCENARIO_REQUESTED, loadScenarioWorker)
  yield takeLatest(ADD_ROW_REQUESTED, addRowWorker)
  yield takeLatest(ADD_COLUMN_REQUESTED, addColumnWorker)
  yield takeEvery(UPDATE_COLUMN_REQUESTED, updateColumnWorker)
  yield takeEvery(UPDATE_CELL_LOCAL, updateCellWorker)
}
