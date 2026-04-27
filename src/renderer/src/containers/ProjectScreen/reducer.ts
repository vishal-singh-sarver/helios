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
  emptyScenarioGrid,
  type DataTypeDef,
  type LoadStatus,
  type ScenarioGrid
} from './types'

export type {
  ColumnDef,
  DataTypeDef,
  RowKey,
  ScenarioGrid,
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
  byScenario: Record<string, ScenarioGrid>
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

// Returns the draft scenario, initializing an empty grid if absent. Used by
// reducer cases that need to mutate per-scenario state.
function ensureScenario(
  draft: Draft<ProjectScreenState>,
  scenarioId: string
): Draft<ScenarioGrid> {
  if (!draft.byScenario[scenarioId]) {
    draft.byScenario[scenarioId] = emptyScenarioGrid()
  }
  return draft.byScenario[scenarioId]
}

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
        ensureScenario(draft, action.payload.scenarioId)
        break

      // ── Scenario load ──────────────────────────────────────────────────────

      case LOAD_SCENARIO_REQUESTED: {
        const grid = ensureScenario(draft, action.payload.scenarioId)
        grid.loadStatus = 'loading'
        grid.loadError = null
        break
      }

      case LOAD_SCENARIO_SUCCEEDED: {
        const { scenarioId, columns, rows } = action.payload
        const fresh = emptyScenarioGrid()

        for (const col of columns) {
          fresh.columns[col.id] = { ...col }
          fresh.columnOrder.push(col.id)
        }

        rows.forEach((row, i) => {
          const rowId = i
          fresh.rows[rowId] = { date: row.date, time: row.time, ...row.values }
          fresh.rowKeys[rowId] = { date: row.date, time: row.time }
          fresh.rowOrder.push(rowId)
        })
        fresh.nextRowSeq = rows.length

        fresh.loadStatus = 'loaded'
        draft.byScenario[scenarioId] = fresh
        break
      }

      case LOAD_SCENARIO_FAILED: {
        const grid = ensureScenario(draft, action.payload.scenarioId)
        grid.loadStatus = 'error'
        grid.loadError = action.payload.error
        break
      }

      // ── Upload ─────────────────────────────────────────────────────────────

      case UPLOAD_FILE_REQUESTED: {
        const grid = ensureScenario(draft, action.payload.scenarioId)
        grid.loadStatus = 'loading'
        grid.loadError = null
        break
      }

      case UPLOAD_FILE_SUCCEEDED:
        // Upload replaces server-side data; clear the client cache so the
        // follow-up LOAD_SCENARIO populates a fresh grid. The saga is
        // responsible for dispatching that follow-up.
        draft.byScenario[action.payload.scenarioId] = emptyScenarioGrid()
        draft.byScenario[action.payload.scenarioId].loadStatus = 'loading'
        break

      case UPLOAD_FILE_FAILED: {
        const grid = ensureScenario(draft, action.payload.scenarioId)
        grid.loadStatus = 'error'
        grid.loadError = action.payload.error
        break
      }

      // ── Add row ────────────────────────────────────────────────────────────

      case ADD_ROW_REQUESTED:
        // Saga trigger only — UI shows pending elsewhere (e.g. dialog spinner).
        break

      case ADD_ROW_SUCCEEDED: {
        const grid = draft.byScenario[action.payload.scenarioId]
        if (!grid) break

        const rowId = grid.nextRowSeq++
        grid.rows[rowId] = {
          date: action.payload.date,
          time: action.payload.time,
          ...action.payload.values
        }
        grid.rowKeys[rowId] = { date: action.payload.date, time: action.payload.time }
        grid.rowOrder.push(rowId)
        break
      }

      case ADD_ROW_FAILED:
        // No state mutation; UI surfaces error from the dialog/toast.
        break

      // ── Add column ─────────────────────────────────────────────────────────

      case ADD_COLUMN_REQUESTED:
        break

      case ADD_COLUMN_SUCCEEDED: {
        const grid = draft.byScenario[action.payload.scenarioId]
        if (!grid) break

        const { colId, name, dataTypeId, unitId, values } = action.payload
        grid.columns[colId] = { id: colId, name, dataTypeId, unitId }
        grid.columnOrder.push(colId)

        grid.rowOrder.forEach((rowId, i) => {
          if (!grid.rows[rowId]) grid.rows[rowId] = {}
          grid.rows[rowId][colId] = values[i] ?? ''
        })
        break
      }

      case ADD_COLUMN_FAILED:
        break

      // ── Cell edit ──────────────────────────────────────────────────────────

      case UPDATE_CELL_LOCAL: {
        const { scenarioId, rowId, colId, value, validationError } = action.payload
        const grid = draft.byScenario[scenarioId]
        if (!grid) break

        if (!grid.rows[rowId]) grid.rows[rowId] = {}
        grid.rows[rowId][colId] = value

        const key = cellKey(rowId, colId)
        if (validationError != null) {
          if (!grid.validationErrors[rowId]) grid.validationErrors[rowId] = {}
          grid.validationErrors[rowId][colId] = validationError
          // No network call will be made — clear any stale pending/error sync state.
          delete grid.cellSync[key]
          delete grid.cellErrors[key]
        } else {
          if (grid.validationErrors[rowId]) {
            delete grid.validationErrors[rowId][colId]
          }
          grid.cellSync[key] = 'pending'
          delete grid.cellErrors[key]
        }
        break
      }

      case UPDATE_CELL_REQUESTED:
        // Saga trigger only — local state already reflects pending sync.
        break

      case UPDATE_CELL_SUCCEEDED: {
        const { scenarioId, rowId, colId } = action.payload
        const grid = draft.byScenario[scenarioId]
        if (!grid) break

        const key = cellKey(rowId, colId)
        delete grid.cellSync[key]
        delete grid.cellErrors[key]
        break
      }

      case UPDATE_CELL_FAILED: {
        const { scenarioId, rowId, colId, error } = action.payload
        const grid = draft.byScenario[scenarioId]
        if (!grid) break

        const key = cellKey(rowId, colId)
        grid.cellSync[key] = 'error'
        grid.cellErrors[key] = error
        break
      }

      // ── Selection ──────────────────────────────────────────────────────────

      case SET_ROW_SELECTION: {
        const grid = draft.byScenario[action.payload.scenarioId]
        if (!grid) break
        grid.rowSelection[action.payload.rowId] = action.payload.selected
        break
      }

      case SET_ALL_ROWS_SELECTION: {
        const grid = draft.byScenario[action.payload.scenarioId]
        if (!grid) break
        for (const rowId of grid.rowOrder) {
          grid.rowSelection[rowId] = action.payload.selected
        }
        break
      }
    }
  })

export default projectScreenReducer
