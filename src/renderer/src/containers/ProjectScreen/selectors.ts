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
  type ScenarioGrid
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

export const selectActiveScenarioGrid = createSelector(
  selectActiveScenarioId,
  selectByScenario,
  (id, byScenario): ScenarioGrid | null => (id ? (byScenario[id] ?? null) : null)
)

export const makeSelectScenarioGrid = (
  scenarioId: string
): ((state: RootState) => ScenarioGrid | null) =>
  createSelector(selectByScenario, (byScenario) => byScenario[scenarioId] ?? null)

// ── Columns / rows for the active scenario ───────────────────────────────────

export const selectColumns = createSelector(
  selectActiveScenarioGrid,
  (grid): Record<ColId, ColumnDef> => grid?.columns ?? {}
)

export const selectColumnOrder = createSelector(
  selectActiveScenarioGrid,
  (grid): ColId[] => grid?.columnOrder ?? []
)

export const selectRowOrder = createSelector(
  selectActiveScenarioGrid,
  (grid): RowId[] => grid?.rowOrder ?? []
)

export const selectLoadStatus = createSelector(
  selectActiveScenarioGrid,
  (grid) => grid?.loadStatus ?? 'idle'
)

export const selectLoadError = createSelector(
  selectActiveScenarioGrid,
  (grid) => grid?.loadError ?? null
)

// ── Per-row / per-cell factories ─────────────────────────────────────────────
//
// Factories memoize across calls with the same args. Components should call
// them once (via useMemo) and keep the returned selector for the lifetime of
// the row / cell so reselect can short-circuit on referentially-stable input.

export const makeSelectRow = (
  rowId: RowId
): ((state: RootState) => Record<ColId, string> | undefined) =>
  createSelector(selectActiveScenarioGrid, (grid) => grid?.rows[rowId])

export const makeSelectCellValue = (
  rowId: RowId,
  colId: ColId
): ((state: RootState) => string | undefined) =>
  createSelector(selectActiveScenarioGrid, (grid) => grid?.rows[rowId]?.[colId])

export const makeSelectCellSync = (
  rowId: RowId,
  colId: ColId
): ((state: RootState) => CellSyncStatus) => {
  const key = cellKey(rowId, colId)
  return createSelector(selectActiveScenarioGrid, (grid) => grid?.cellSync[key] ?? 'idle')
}

// Combined error: client-side validation errors take precedence over
// server-side rejection messages, but either produces a red border.
export const makeSelectCellError = (
  rowId: RowId,
  colId: ColId
): ((state: RootState) => string | null) => {
  const key = cellKey(rowId, colId)
  return createSelector(selectActiveScenarioGrid, (grid) => {
    if (!grid) return null
    const validation = grid.validationErrors[rowId]?.[colId]
    if (validation) return validation
    return grid.cellErrors[key] ?? null
  })
}

// ── Selection ────────────────────────────────────────────────────────────────

export const selectRowSelection = createSelector(
  selectActiveScenarioGrid,
  (grid): Record<RowId, boolean> => grid?.rowSelection ?? {}
)

export const selectAllRowsSelected = createSelector(
  selectActiveScenarioGrid,
  selectRowSelection,
  (grid, selection) => {
    if (!grid || grid.rowOrder.length === 0) return false
    return grid.rowOrder.every((rowId) => selection[rowId] === true)
  }
)

export const makeSelectRowSelected = (
  rowId: RowId
): ((state: RootState) => boolean) =>
  createSelector(selectRowSelection, (sel) => sel[rowId] === true)

// ── Domain export (for tests / advanced consumers) ───────────────────────────

export { selectProjectScreenDomain }
