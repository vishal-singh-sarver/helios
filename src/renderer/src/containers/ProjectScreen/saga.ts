import { all, call, put, select, takeEvery, takeLatest } from 'redux-saga/effects'
import {
  addColumnRequest,
  addRowsRequest,
  getProjectRequest,
  loadDataRequest,
  loadDataTypesRequest,
  loadHeadersRequest,
  toCellValue,
  type AddColumnResponse,
  type AddRowsResponse,
  type DataPage,
  type DataTypesResponse,
  type GetProjectResponse,
  type HeadersResponse,
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
  UPDATE_CELL_LOCAL
} from './constants'
import { selectActiveWeatherTable } from './selectors'
import type {
  AddColumnRequestedAction,
  AddRowRequestedAction,
  ListScenariosRequestedAction,
  LoadScenarioRequestedAction,
  UpdateCellLocalAction
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

    const headersById = new Map<string, ColumnDef>()
    for (const h of headers) {
      headersById.set(String(h.id), {
        id: String(h.id),
        name: h.name,
        dataTypeId: h.helios_data_type_id,
        unitId: h.unit_id
      })
    }

    const columns: ColumnDef[] = dataRes.labels.map((label) => {
      if (label === DATE_COL_ID || label === TIME_COL_ID) {
        return { id: label, name: label, dataTypeId: null, unitId: null }
      }
      const meta = headersById.get(label)
      return (
        meta ?? {
          id: label,
          name: label,
          dataTypeId: null,
          unitId: null
        }
      )
    })

    const rows: Array<Record<ColId, CellValue>> = dataRes.rows.map((raw) => {
      const out: Record<ColId, CellValue> = {}
      for (const colId of dataRes.labels) {
        out[colId] = toCellValue(raw[colId])
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
// Row-add returns counters only. Saga chains LOAD_SCENARIO_REQUESTED so the
// reducer doesn't need an append branch.

function* addRowWorker(action: AddRowRequestedAction): Generator {
  const { projectId, scenarioId, date, time, columnIds, numberOfRows } = action.payload
  try {
    ;(yield call(addRowsRequest, projectId, scenarioId, {
      date,
      time,
      columnIds,
      numberOfRows
    })) as AddRowsResponse

    yield put(actions.addRowSucceeded(projectId, scenarioId))
    yield put(actions.loadScenarioRequested(projectId, scenarioId))
  } catch (err) {
    yield put(actions.addRowFailed(projectId, scenarioId, (err as Error).message))
  }
}

// ── Add column ───────────────────────────────────────────────────────────────

function* addColumnWorker(action: AddColumnRequestedAction): Generator {
  const { projectId, scenarioId, name, dataTypeId, dataUnitId, defaultValue } =
    action.payload
  try {
    const res = (yield call(addColumnRequest, projectId, scenarioId, {
      name,
      dataTypeId,
      dataUnitId,
      defaultValue
    })) as AddColumnResponse
    yield put(actions.addColumnSucceeded(projectId, scenarioId, res.column, defaultValue))
  } catch (err) {
    yield put(actions.addColumnFailed(projectId, scenarioId, (err as Error).message))
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
  yield takeEvery(UPDATE_CELL_LOCAL, updateCellWorker)
}
