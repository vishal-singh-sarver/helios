import { createSelector } from 'reselect'
import type { RootState } from 'store/reducers'
import { initialState, type ProjectScreenState } from './reducer'
import {
  cellKey,
  type CellSyncStatus,
  type ColId,
  type ColumnDef,
  type DataTypeDef,
  type RowId,
  type WeatherTable
} from './types'

// ── Domain ───────────────────────────────────────────────────────────────────

const selectProjectScreenDomain = (state: RootState): ProjectScreenState =>
  state.projectScreen ?? initialState

// ── Data types ───────────────────────────────────────────────────────────────

export const selectDataTypesById = createSelector(
  selectProjectScreenDomain,
  (s) => s.dataTypes.byId
)

export const selectAllDataTypes = createSelector(
  selectProjectScreenDomain,
  (s): DataTypeDef[] => s.dataTypes.allIds.map((id) => s.dataTypes.byId[id]).filter(Boolean)
)

export const selectColumnDataTypes = createSelector(selectAllDataTypes, (all) =>
  all.filter((d) => d.scope === 'column')
)

export const selectScenarioDataTypes = createSelector(selectAllDataTypes, (all) =>
  all.filter((d) => d.scope === 'scenario')
)

export const selectDataTypesLoadStatus = createSelector(
  selectProjectScreenDomain,
  (s) => s.dataTypes.loadStatus
)

export const selectDataTypesError = createSelector(
  selectProjectScreenDomain,
  (s) => s.dataTypes.loadError
)

export const makeSelectDataType = (
  id: string
): ((state: RootState) => DataTypeDef | undefined) =>
  createSelector(selectDataTypesById, (byId) => byId[id])

// ── Active scenario ──────────────────────────────────────────────────────────

export const selectActiveScenarioId = createSelector(
  selectProjectScreenDomain,
  (s) => s.activeScenarioId
)

export const selectByScenario = createSelector(
  selectProjectScreenDomain,
  (s) => s.byScenario
)

export const selectActiveWeatherTable = createSelector(
  selectActiveScenarioId,
  selectByScenario,
  (id, byScenario): WeatherTable | null => (id ? (byScenario[id] ?? null) : null)
)

export const makeSelectWeatherTable = (
  scenarioId: string
): ((state: RootState) => WeatherTable | null) =>
  createSelector(selectByScenario, (byScenario) => byScenario[scenarioId] ?? null)

// ── Columns / rows for the active scenario ───────────────────────────────────

export const selectColumns = createSelector(
  selectActiveWeatherTable,
  (table): Record<ColId, ColumnDef> => table?.columns ?? {}
)

export const selectColumnOrder = createSelector(
  selectActiveWeatherTable,
  (table): ColId[] => table?.columnOrder ?? []
)

export const selectRowOrder = createSelector(
  selectActiveWeatherTable,
  (table): RowId[] => table?.rowOrder ?? []
)

// ── Per-row / per-cell factories ─────────────────────────────────────────────
//
// Factories memoize across calls with the same args. Components should call
// them once (via useMemo) and keep the returned selector for the lifetime of
// the row / cell so reselect can short-circuit on referentially-stable input.

export const makeSelectRow = (
  rowId: RowId
): ((state: RootState) => Record<ColId, string> | undefined) =>
  createSelector(selectActiveWeatherTable, (table) => table?.rows[rowId])

export const makeSelectCellValue = (
  rowId: RowId,
  colId: ColId
): ((state: RootState) => string | undefined) =>
  createSelector(selectActiveWeatherTable, (table) => table?.rows[rowId]?.[colId])

export const makeSelectCellSync = (
  rowId: RowId,
  colId: ColId
): ((state: RootState) => CellSyncStatus) => {
  const key = cellKey(rowId, colId)
  return createSelector(selectActiveWeatherTable, (table) => table?.cellSync[key] ?? 'idle')
}

// Validation error per cell (client-side). Server-side error messages are
// not stored — `cellSync === 'error'` indicates a failed sync without text.
export const makeSelectCellError = (
  rowId: RowId,
  colId: ColId
): ((state: RootState) => string | null) =>
  createSelector(
    selectActiveWeatherTable,
    (table) => table?.validationErrors[rowId]?.[colId] ?? null
  )

// ── Selection ────────────────────────────────────────────────────────────────

export const selectRowSelection = createSelector(
  selectActiveWeatherTable,
  (table): Record<RowId, boolean> => table?.rowSelection ?? {}
)

export const selectAllRowsSelected = createSelector(
  selectActiveWeatherTable,
  selectRowSelection,
  (table, selection) => {
    if (!table || table.rowOrder.length === 0) return false
    return table.rowOrder.every((rowId) => selection[rowId] === true)
  }
)

export const makeSelectRowSelected = (
  rowId: RowId
): ((state: RootState) => boolean) =>
  createSelector(selectRowSelection, (sel) => sel[rowId] === true)

// ── Domain export (for tests / advanced consumers) ───────────────────────────

export { selectProjectScreenDomain }
