import { produce, type Draft } from 'immer'
import {
  LOAD_DATA_TYPES_REQUESTED,
  LOAD_DATA_TYPES_SUCCEEDED,
  LOAD_DATA_TYPES_FAILED,
  SET_ACTIVE_SCENARIO,
  LOAD_SCENARIO_REQUESTED,
  LOAD_SCENARIO_SUCCEEDED,
  LOAD_SCENARIO_FAILED,
  UPLOAD_FILE_REQUESTED,
  UPLOAD_FILE_SUCCEEDED,
  UPLOAD_FILE_FAILED,
  ADD_ROW_REQUESTED,
  ADD_ROW_SUCCEEDED,
  ADD_ROW_FAILED,
  ADD_COLUMN_REQUESTED,
  ADD_COLUMN_SUCCEEDED,
  ADD_COLUMN_FAILED,
  UPDATE_CELL_LOCAL,
  UPDATE_CELL_REQUESTED,
  UPDATE_CELL_SUCCEEDED,
  UPDATE_CELL_FAILED,
  SET_ROW_SELECTION,
  SET_ALL_ROWS_SELECTION
} from './constants'
import type { ProjectScreenAction } from './actions'
import {
  cellKey,
  emptyWeatherTable,
  type DataTypeDef,
  type LoadStatus,
  type RowId,
  type WeatherTable
} from './types'

export type {
  ColumnDef,
  DataTypeDef,
  WeatherTable,
  CellSyncStatus,
  LoadStatus,
  RowId,
  ColId
} from './types'

// ── State ────────────────────────────────────────────────────────────────────

export interface DataTypesSlice {
  byId: Record<string, DataTypeDef>
  allIds: string[]
  loadStatus: LoadStatus
  loadError: string | null
}

export interface ProjectScreenState {
  dataTypes: DataTypesSlice
  activeScenarioId: string | null
  byScenario: Record<string, WeatherTable>
}

export const initialState: ProjectScreenState = {
  dataTypes: {
    byId: {},
    allIds: [],
    loadStatus: 'idle',
    loadError: null
  },
  activeScenarioId: null,
  byScenario: {}
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function ensureTable(
  draft: Draft<ProjectScreenState>,
  scenarioId: string
): Draft<WeatherTable> {
  if (!draft.byScenario[scenarioId]) {
    draft.byScenario[scenarioId] = emptyWeatherTable()
  }
  return draft.byScenario[scenarioId]
}

const rowIdAt = (i: number): RowId => `row_${i}`

// ── Reducer ──────────────────────────────────────────────────────────────────

const projectScreenReducer = (
  state: ProjectScreenState = initialState,
  action: ProjectScreenAction
): ProjectScreenState =>
  produce(state, (draft) => {
    switch (action.type) {
      // ── Data types ─────────────────────────────────────────────────────────

      case LOAD_DATA_TYPES_REQUESTED:
        draft.dataTypes.loadStatus = 'loading'
        draft.dataTypes.loadError = null
        break

      case LOAD_DATA_TYPES_SUCCEEDED:
        draft.dataTypes.byId = {}
        draft.dataTypes.allIds = []
        for (const def of action.payload) {
          draft.dataTypes.byId[def.id] = def
          draft.dataTypes.allIds.push(def.id)
        }
        draft.dataTypes.loadStatus = 'loaded'
        break

      case LOAD_DATA_TYPES_FAILED:
        draft.dataTypes.loadStatus = 'error'
        draft.dataTypes.loadError = action.payload
        break

      // ── Active scenario ────────────────────────────────────────────────────

      case SET_ACTIVE_SCENARIO:
        draft.activeScenarioId = action.payload.scenarioId
        ensureTable(draft, action.payload.scenarioId)
        break

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

      case ADD_ROW_REQUESTED:
        // Saga trigger only — UI shows pending elsewhere (dialog spinner).
        break

      case ADD_ROW_SUCCEEDED: {
        const { scenarioId, rows } = action.payload
        const table = draft.byScenario[scenarioId]
        if (!table) break

        const startIdx = table.rowOrder.length
        rows.forEach((rowData, i) => {
          const rowId = rowIdAt(startIdx + i)
          table.rows[rowId] = { ...rowData }
          table.rowOrder.push(rowId)
        })
        break
      }

      case ADD_ROW_FAILED:
        break

      // ── Add column ─────────────────────────────────────────────────────────

      case ADD_COLUMN_REQUESTED:
        break

      case ADD_COLUMN_SUCCEEDED: {
        const { scenarioId, column, defaultValue } = action.payload
        const table = draft.byScenario[scenarioId]
        if (!table) break

        table.columns[column.id] = { ...column }
        table.columnOrder.push(column.id)
        for (const rowId of table.rowOrder) {
          if (!table.rows[rowId]) table.rows[rowId] = {}
          table.rows[rowId][column.id] = defaultValue
        }
        break
      }

      case ADD_COLUMN_FAILED:
        break

      // ── Cell edit ──────────────────────────────────────────────────────────

      case UPDATE_CELL_LOCAL: {
        const { scenarioId, rowId, colId, value, validationError } = action.payload
        const table = draft.byScenario[scenarioId]
        if (!table) break

        if (!table.rows[rowId]) table.rows[rowId] = {}
        table.rows[rowId][colId] = value

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
        const { scenarioId, rowId, colId } = action.payload
        const table = draft.byScenario[scenarioId]
        if (!table) break
        table.cellSync[cellKey(rowId, colId)] = 'error'
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
