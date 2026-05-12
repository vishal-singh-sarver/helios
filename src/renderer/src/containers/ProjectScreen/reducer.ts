import { produce, type Draft } from 'immer'
import type { ProjectScreenAction } from './actions'
import {
  ADD_COLUMN_FAILED,
  ADD_COLUMN_REQUESTED,
  ADD_COLUMN_SUCCEEDED,
  ADD_ROW_FAILED,
  ADD_ROW_REQUESTED,
  ADD_ROW_SUCCEEDED,
  LIST_SCENARIOS_FAILED,
  LIST_SCENARIOS_REQUESTED,
  LIST_SCENARIOS_SUCCEEDED,
  LOAD_DATA_TYPES_FAILED,
  LOAD_DATA_TYPES_REQUESTED,
  LOAD_DATA_TYPES_SUCCEEDED,
  LOAD_HEADERS_FAILED,
  LOAD_HEADERS_REQUESTED,
  LOAD_HEADERS_SUCCEEDED,
  LOAD_PROJECT_SUCCEEDED,
  LOAD_SCENARIO_FAILED,
  LOAD_SCENARIO_REQUESTED,
  LOAD_SCENARIO_SUCCEEDED,
  SET_ACTIVE_PROJECT,
  SET_ACTIVE_SCENARIO,
  SET_ALL_ROWS_SELECTION,
  SET_COLUMN_VALIDATION_ERRORS,
  SET_ROW_SELECTION,
  UPDATE_ALL_CHECKBOXES_REQUESTED,
  UPDATE_CELL_FAILED,
  UPDATE_CELL_LOCAL,
  UPDATE_CELL_REQUESTED,
  UPDATE_CELL_SUCCEEDED,
  UPDATE_COLUMN_FAILED,
  UPDATE_COLUMN_REQUESTED,
  UPDATE_COLUMN_SUCCEEDED,
  UPLOAD_FILE_FAILED,
  UPLOAD_FILE_REQUESTED,
  UPLOAD_FILE_SUCCEEDED
} from './constants'
import {
  cellKey,
  emptyWeatherTable,
  type DataTypeDef,
  type LoadStatus,
  type ProjectMetadata,
  type RowId,
  type Scenario,
  type WeatherHeader,
  type WeatherTable
} from './types'

export type {
  CellSyncStatus,
  CellValue,
  ColId,
  ColumnDef,
  DataTypeDef,
  DataUnitDef,
  LoadStatus,
  RowId,
  Scenario,
  WeatherHeader,
  WeatherTable
} from './types'

// ── State ────────────────────────────────────────────────────────────────────

export interface DataTypesSlice {
  byId: Record<number, DataTypeDef>
  allIds: number[]
  loadStatus: LoadStatus
  loadError: string | null
}

export interface CatalogSlice {
  dataTypes: DataTypesSlice
}

export interface ScenariosByProjectEntry {
  ids: string[]
  byId: Record<string, Scenario>
  loadStatus: LoadStatus
  loadError: string | null
}

export interface ScenariosSlice {
  byProject: Record<string, ScenariosByProjectEntry>
}

// Raw weather_data_header rows, keyed by scenario id. Stored verbatim from
// the wire so consumers can read fields the joined ColumnDef discards
// (status, display_order, helios_data_type_id). `ids` is sorted by
// display_order so iteration order matches the table.
export interface HeadersByScenarioEntry {
  ids: number[]
  byId: Record<number, WeatherHeader>
  loadStatus: LoadStatus
  loadError: string | null
}

export interface HeadersSlice {
  byScenario: Record<string, HeadersByScenarioEntry>
}

// Tracks the in-flight state of one-off mutation flows (add column, add
// row). UI reads `loading` to show a spinner / disable the submit button
// and `error` to render a banner. `error === null` means "no failure as of
// the most recent attempt" — including before the first attempt.
export interface RequestStatus {
  loading: boolean
  error: string | null
}

export interface ProjectScreenState {
  catalog: CatalogSlice
  scenarios: ScenariosSlice
  headers: HeadersSlice
  activeProjectId: string | null
  activeScenarioId: string | null
  // Subset of GET /project/{id}, populated alongside scenarios. null until
  // the response lands, and reset to null when the active project changes.
  activeProject: ProjectMetadata | null
  byScenario: Record<string, WeatherTable>
  addColumn: RequestStatus
  addRow: RequestStatus
}

const emptyDataTypesSlice = (): DataTypesSlice => ({
  byId: {},
  allIds: [],
  loadStatus: 'idle',
  loadError: null
})

const emptyScenariosEntry = (): ScenariosByProjectEntry => ({
  ids: [],
  byId: {},
  loadStatus: 'idle',
  loadError: null
})

const emptyHeadersEntry = (): HeadersByScenarioEntry => ({
  ids: [],
  byId: {},
  loadStatus: 'idle',
  loadError: null
})

const idleStatus = (): RequestStatus => ({ loading: false, error: null })

export const initialState: ProjectScreenState = {
  catalog: {
    dataTypes: emptyDataTypesSlice()
  },
  scenarios: { byProject: {} },
  headers: { byScenario: {} },
  activeProjectId: null,
  activeScenarioId: null,
  activeProject: null,
  byScenario: {},
  addColumn: idleStatus(),
  addRow: idleStatus()
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function ensureTable(draft: Draft<ProjectScreenState>, scenarioId: string): Draft<WeatherTable> {
  if (!draft.byScenario[scenarioId]) {
    draft.byScenario[scenarioId] = emptyWeatherTable()
  }
  return draft.byScenario[scenarioId]
}

function ensureScenariosEntry(
  draft: Draft<ProjectScreenState>,
  projectId: string
): Draft<ScenariosByProjectEntry> {
  if (!draft.scenarios.byProject[projectId]) {
    draft.scenarios.byProject[projectId] = emptyScenariosEntry()
  }
  return draft.scenarios.byProject[projectId]
}

function ensureHeadersEntry(
  draft: Draft<ProjectScreenState>,
  scenarioId: string
): Draft<HeadersByScenarioEntry> {
  if (!draft.headers.byScenario[scenarioId]) {
    draft.headers.byScenario[scenarioId] = emptyHeadersEntry()
  }
  return draft.headers.byScenario[scenarioId]
}

const rowIdAt = (i: number): RowId => `row_${i}`

// ── Reducer ──────────────────────────────────────────────────────────────────

const projectScreenReducer = (
  state: ProjectScreenState = initialState,
  action: ProjectScreenAction
): ProjectScreenState =>
  produce(state, (draft) => {
    switch (action.type) {
      // ── Catalog: data types ────────────────────────────────────────────────

      case LOAD_DATA_TYPES_REQUESTED:
        draft.catalog.dataTypes.loadStatus = 'loading'
        draft.catalog.dataTypes.loadError = null
        break

      case LOAD_DATA_TYPES_SUCCEEDED:
        draft.catalog.dataTypes.byId = {}
        draft.catalog.dataTypes.allIds = []
        for (const def of action.payload) {
          draft.catalog.dataTypes.byId[def.id] = def
          draft.catalog.dataTypes.allIds.push(def.id)
        }
        draft.catalog.dataTypes.loadStatus = 'loaded'
        break

      case LOAD_DATA_TYPES_FAILED:
        draft.catalog.dataTypes.loadStatus = 'error'
        draft.catalog.dataTypes.loadError = action.payload
        break

      // ── Active project + scenario ──────────────────────────────────────────

      case SET_ACTIVE_PROJECT:
        // Switching projects invalidates the active scenario — drop it so the
        // table renders empty until the saga loads the new project's scenarios
        // (otherwise selectActiveWeatherTable keeps returning the prior
        // scenario's cached rows). Same idea for activeProject metadata: the
        // header inputs should not show stale lat/long while the new project
        // is in flight.
        if (draft.activeProjectId !== action.payload.projectId) {
          draft.activeScenarioId = null
          draft.activeProject = null
        }
        draft.activeProjectId = action.payload.projectId
        break

      case LOAD_PROJECT_SUCCEEDED:
        draft.activeProject = action.payload
        break

      case SET_ACTIVE_SCENARIO:
        draft.activeScenarioId = action.payload.scenarioId
        ensureTable(draft, action.payload.scenarioId)
        break

      // ── List scenarios (per project) ───────────────────────────────────────

      case LIST_SCENARIOS_REQUESTED: {
        const entry = ensureScenariosEntry(draft, action.payload.projectId)
        entry.loadStatus = 'loading'
        entry.loadError = null
        break
      }

      case LIST_SCENARIOS_SUCCEEDED: {
        const entry = ensureScenariosEntry(draft, action.payload.projectId)
        entry.ids = []
        entry.byId = {}
        for (const s of action.payload.scenarios) {
          entry.byId[s.id] = s
          entry.ids.push(s.id)
        }
        entry.loadStatus = 'loaded'
        break
      }

      case LIST_SCENARIOS_FAILED: {
        const entry = ensureScenariosEntry(draft, action.payload.projectId)
        entry.loadStatus = 'error'
        entry.loadError = action.payload.error
        break
      }

      // ── Weather headers (per scenario) ─────────────────────────────────────

      case LOAD_HEADERS_REQUESTED: {
        const entry = ensureHeadersEntry(draft, action.payload.scenarioId)
        entry.loadStatus = 'loading'
        entry.loadError = null
        break
      }

      case LOAD_HEADERS_SUCCEEDED: {
        const entry = ensureHeadersEntry(draft, action.payload.scenarioId)
        entry.ids = []
        entry.byId = {}
        // Sort by display_order so iteration order matches the rendered table.
        const sorted = [...action.payload.headers].sort((a, b) => a.display_order - b.display_order)
        for (const h of sorted) {
          entry.byId[h.id] = h
          entry.ids.push(h.id)
        }
        entry.loadStatus = 'loaded'
        break
      }

      case LOAD_HEADERS_FAILED: {
        const entry = ensureHeadersEntry(draft, action.payload.scenarioId)
        entry.loadStatus = 'error'
        entry.loadError = action.payload.error
        break
      }

      // ── Scenario load ──────────────────────────────────────────────────────

      case LOAD_SCENARIO_REQUESTED:
        ensureTable(draft, action.payload.scenarioId)
        break

      case LOAD_SCENARIO_SUCCEEDED: {
        const { scenarioId, columns, rows } = action.payload
        const fresh = emptyWeatherTable()

        for (const col of columns) {
          fresh.columns[col.id] = { ...col }
          fresh.columnOrder.push(col.id)
        }

        rows.forEach((rowData, i) => {
          const rowId = rowIdAt(i)
          fresh.rows[rowId] = { ...rowData }
          fresh.rowOrder.push(rowId)
          fresh.rowSelection[rowId] = true
        })

        draft.byScenario[scenarioId] = fresh
        break
      }

      case LOAD_SCENARIO_FAILED:
        // No table-level error state; UI surfaces error via dialog/toast.
        break

      // ── Upload ─────────────────────────────────────────────────────────────

      case UPLOAD_FILE_REQUESTED:
        ensureTable(draft, action.payload.scenarioId)
        break

      case UPLOAD_FILE_SUCCEEDED:
        // Upload replaces server-side data; clear the client cache so the
        // follow-up LOAD_SCENARIO populates a fresh table. The saga is
        // responsible for dispatching that follow-up.
        draft.byScenario[action.payload.scenarioId] = emptyWeatherTable()
        break

      case UPLOAD_FILE_FAILED:
        break

      // ── Add row ────────────────────────────────────────────────────────────
      //
      // Row-add returns counters only; the saga chains LOAD_SCENARIO_REQUESTED
      // on success. No append branch in the reducer.

      case ADD_ROW_REQUESTED:
        draft.addRow.loading = true
        draft.addRow.error = null
        break

      case ADD_ROW_SUCCEEDED:
        draft.addRow.loading = false
        draft.addRow.error = null
        break

      case ADD_ROW_FAILED:
        draft.addRow.loading = false
        draft.addRow.error = action.payload.error
        break

      // ── Add column ─────────────────────────────────────────────────────────

      case ADD_COLUMN_REQUESTED:
        draft.addColumn.loading = true
        draft.addColumn.error = null
        break

      case ADD_COLUMN_SUCCEEDED: {
        const { scenarioId, column, defaultValue } = action.payload
        draft.addColumn.loading = false
        draft.addColumn.error = null
        const table = draft.byScenario[scenarioId]
        if (!table) break

        table.columns[column.id] = { ...column }
        table.columnOrder.push(column.id)
        for (const rowId of table.rowOrder) {
          if (!table.rows[rowId]) table.rows[rowId] = {}
          // Server stores NaN for newly-created cells until they're touched;
          // mirror that with `null` unless the user supplied a default value.
          table.rows[rowId][column.id] =
            defaultValue === '' || defaultValue.trim().toUpperCase() === 'NAN' ? null : defaultValue
        }
        break
      }

      case ADD_COLUMN_FAILED:
        draft.addColumn.loading = false
        draft.addColumn.error = action.payload.error
        break

      // ── Update column header (PATCH) ───────────────────────────────────────
      //
      // Optimistic: write the patch into the local ColumnDef on _REQUESTED, no-op
      // on _SUCCEEDED, restore the snapshot on _FAILED. The caller hands the
      // saga the prior values so we can roll back without re-fetching.

      case UPDATE_COLUMN_REQUESTED: {
        const { scenarioId, colId, patch } = action.payload
        const table = draft.byScenario[scenarioId]
        const col = table?.columns[colId]
        if (!col) break
        if (patch.name !== undefined) col.name = patch.name
        if (patch.dataTypeId !== undefined) col.dataTypeId = patch.dataTypeId
        if (patch.unitId !== undefined) col.unitId = patch.unitId
        break
      }

      case UPDATE_COLUMN_SUCCEEDED:
        break

      case UPDATE_COLUMN_FAILED: {
        const { scenarioId, colId, previous } = action.payload
        const table = draft.byScenario[scenarioId]
        const col = table?.columns[colId]
        if (!col) break
        if (previous.name !== undefined) col.name = previous.name
        if (previous.dataTypeId !== undefined) col.dataTypeId = previous.dataTypeId
        if (previous.unitId !== undefined) col.unitId = previous.unitId
        break
      }

      // ── Cell edit ──────────────────────────────────────────────────────────

      case UPDATE_CELL_LOCAL: {
        const { scenarioId, rowId, colId, value, validationError } = action.payload
        const table = draft.byScenario[scenarioId]
        if (!table) break

        if (!table.rows[rowId]) table.rows[rowId] = {}
        // Empty input clears the cell — write null to mirror server NaN.
        table.rows[rowId][colId] = value === '' ? null : value

        const key = cellKey(rowId, colId)
        if (validationError != null) {
          if (!table.validationErrors[rowId]) table.validationErrors[rowId] = {}
          table.validationErrors[rowId][colId] = validationError
          // No network call will be made — clear any stale pending sync state.
          delete table.cellSync[key]
        } else {
          if (table.validationErrors[rowId]) {
            delete table.validationErrors[rowId][colId]
          }
          table.cellSync[key] = 'pending'
        }
        break
      }

      case UPDATE_CELL_REQUESTED:
        // Saga trigger only — local state already reflects pending sync.
        break

      case UPDATE_CELL_SUCCEEDED: {
        const { scenarioId, rowId, colId } = action.payload
        const table = draft.byScenario[scenarioId]
        if (!table) break
        delete table.cellSync[cellKey(rowId, colId)]
        break
      }

      case UPDATE_CELL_FAILED: {
        const { scenarioId, rowId, colId, error } = action.payload
        const table = draft.byScenario[scenarioId]
        if (!table) break
        table.cellSync[cellKey(rowId, colId)] = 'error'
        // Surface the backend's rejection message through the same
        // validationErrors map the local validator uses, so CellInput's red
        // ring + info-icon tooltip render identically for both error sources.
        if (!table.validationErrors[rowId]) table.validationErrors[rowId] = {}
        table.validationErrors[rowId][colId] = error
        break
      }

      case UPDATE_ALL_CHECKBOXES_REQUESTED: {
        const { scenarioId, checkColId, value } = action.payload
        const table = draft.byScenario[scenarioId]
        if (!table) break
        for (const rowId of table.rowOrder) {
          if (!table.rows[rowId]) table.rows[rowId] = {}
          table.rows[rowId][checkColId] = value
        }
        break
      }

      // ── Bulk per-column validation ─────────────────────────────────────────
      //
      // Fired by the saga after a column's data type or unit changes. Each
      // entry in `errors` is the validation result for one row in that
      // column: a string sets the error, `null` clears any prior error.
      // Cell values themselves are not touched.

      case SET_COLUMN_VALIDATION_ERRORS: {
        const { scenarioId, colId, errors } = action.payload
        const table = draft.byScenario[scenarioId]
        if (!table) break
        for (const rowId in errors) {
          const msg = errors[rowId]
          if (msg == null) {
            if (table.validationErrors[rowId]) {
              delete table.validationErrors[rowId][colId]
            }
          } else {
            if (!table.validationErrors[rowId]) table.validationErrors[rowId] = {}
            table.validationErrors[rowId][colId] = msg
          }
        }
        break
      }

      // ── Selection ──────────────────────────────────────────────────────────

      case SET_ROW_SELECTION: {
        const table = draft.byScenario[action.payload.scenarioId]
        if (!table) break
        table.rowSelection[action.payload.rowId] = action.payload.selected
        break
      }

      case SET_ALL_ROWS_SELECTION: {
        const table = draft.byScenario[action.payload.scenarioId]
        if (!table) break
        for (const rowId of table.rowOrder) {
          table.rowSelection[rowId] = action.payload.selected
        }
        break
      }
    }
  })

export default projectScreenReducer
