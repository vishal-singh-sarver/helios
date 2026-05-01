import { createSelector } from 'reselect'
import type { RootState } from 'store/reducers'
import { initialState, type ProjectScreenState } from './reducer'
import {
  cellKey,
  CHECK_COL_NAME,
  CHECK_DATA_TYPE_NAME,
  type CellSyncStatus,
  type ColId,
  type ColumnDef,
  type DataTypeDef,
  type DataUnitDef,
  type RowId,
  type Scenario,
  type WeatherHeader,
  type WeatherTable
} from './types'

// ── Domain ───────────────────────────────────────────────────────────────────

const selectProjectScreenDomain = (state: RootState): ProjectScreenState =>
  state.projectScreen ?? initialState

// ── Catalog: data types ──────────────────────────────────────────────────────

export const selectDataTypesById = createSelector(
  selectProjectScreenDomain,
  (s) => s.catalog.dataTypes.byId
)

export const selectAllDataTypes = createSelector(
  selectProjectScreenDomain,
  (s): DataTypeDef[] =>
    s.catalog.dataTypes.allIds.map((id) => s.catalog.dataTypes.byId[id]).filter(Boolean)
)

// User-facing data-type list — excludes the dedicated `check` data type so
// it never appears in the column header's data-type dropdown. The seed
// worker still stamps it on the seeded check column, and `selectAllDataTypes`
// keeps it for unit-symbol lookups and current-type display.
export const selectSelectableDataTypes = createSelector(
  selectAllDataTypes,
  (types): DataTypeDef[] => types.filter((dt) => dt.data_type !== CHECK_DATA_TYPE_NAME)
)

// Single source of truth for the seeded `check` column's data-type id. Used
// by both the empty-scenario seed saga and the import-finalize saga to stamp
// the right helios_data_type_id on the seeded column. Returns null until
// the catalog has loaded.
export const selectCheckDataTypeId = createSelector(
  selectAllDataTypes,
  (types): number | null =>
    types.find((dt) => dt.data_type === CHECK_DATA_TYPE_NAME)?.id ?? null
)

export const selectDataTypesLoadStatus = createSelector(
  selectProjectScreenDomain,
  (s) => s.catalog.dataTypes.loadStatus
)

export const selectDataTypesError = createSelector(
  selectProjectScreenDomain,
  (s) => s.catalog.dataTypes.loadError
)

export const makeSelectDataType = (
  id: number
): ((state: RootState) => DataTypeDef | undefined) =>
  createSelector(selectDataTypesById, (byId) => byId[id])

// ── Catalog: data units (nested under each data type) ───────────────────────

export const makeSelectDataUnitsForType = (
  dataTypeId: number
): ((state: RootState) => DataUnitDef[]) =>
  createSelector(selectDataTypesById, (byId) => byId[dataTypeId]?.units ?? [])

// Resolve a unit symbol by id, scanning every loaded data-type's nested
// units. Returns null if the catalog hasn't loaded yet — column header
// rendering falls back to the bare name in that case.
export const makeSelectUnitSymbol = (
  unitId: number | null
): ((state: RootState) => string | null) =>
  createSelector(selectAllDataTypes, (types) => {
    if (unitId == null) return null
    for (const dt of types) {
      const unit = dt.units.find((u) => u.id === unitId)
      if (unit) return unit.unit
    }
    return null
  })

// ── Scenarios (per project) ──────────────────────────────────────────────────

export const selectScenariosByProject = createSelector(
  selectProjectScreenDomain,
  (s) => s.scenarios.byProject
)

export const makeSelectScenariosForProject = (
  projectId: string
): ((state: RootState) => Scenario[]) =>
  createSelector(selectScenariosByProject, (byProject) => {
    const entry = byProject[projectId]
    if (!entry) return []
    return entry.ids.map((id) => entry.byId[id]).filter(Boolean)
  })

export const makeSelectScenariosLoadStatus = (
  projectId: string
): ((state: RootState) => 'idle' | 'loading' | 'loaded' | 'error') =>
  createSelector(
    selectScenariosByProject,
    (byProject) => byProject[projectId]?.loadStatus ?? 'idle'
  )

// ── Weather headers (per scenario, raw wire shape) ──────────────────────────

export const selectHeadersByScenario = createSelector(
  selectProjectScreenDomain,
  (s) => s.headers.byScenario
)

export const makeSelectHeadersForScenario = (
  scenarioId: string
): ((state: RootState) => WeatherHeader[]) =>
  createSelector(selectHeadersByScenario, (byScenario) => {
    const entry = byScenario[scenarioId]
    if (!entry) return []
    return entry.ids.map((id) => entry.byId[id]).filter(Boolean)
  })

export const makeSelectHeadersLoadStatus = (
  scenarioId: string
): ((state: RootState) => 'idle' | 'loading' | 'loaded' | 'error') =>
  createSelector(
    selectHeadersByScenario,
    (byScenario) => byScenario[scenarioId]?.loadStatus ?? 'idle'
  )

// ── Active project + scenario ────────────────────────────────────────────────

export const selectActiveProjectId = createSelector(
  selectProjectScreenDomain,
  (s) => s.activeProjectId
)

export const selectActiveProject = createSelector(
  selectProjectScreenDomain,
  (s) => s.activeProject
)

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

export const selectActiveHeaders = createSelector(
  selectActiveScenarioId,
  selectHeadersByScenario,
  (id, byScenario): WeatherHeader[] => {
    if (!id) return []
    const entry = byScenario[id]
    if (!entry) return []
    return entry.ids.map((hid) => entry.byId[hid]).filter(Boolean)
  }
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
): ((state: RootState) => Record<ColId, string | null> | undefined) =>
  createSelector(selectActiveWeatherTable, (table) => table?.rows[rowId])

export const makeSelectCellValue = (
  rowId: RowId,
  colId: ColId
): ((state: RootState) => string | null | undefined) =>
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

// ColId of the seeded `check` column when present. Backend assigns a numeric
// id at creation time, so we identify by name. Returns null on older
// scenarios that predate the seed (which keep showing date/time as separate
// read-only columns and bind the leftmost UI checkbox to rowSelection).
export const selectCheckColId = createSelector(
  selectColumns,
  (columns): ColId | null => {
    for (const colId of Object.keys(columns)) {
      if (columns[colId]?.name === CHECK_COL_NAME) return colId
    }
    return null
  }
)

// True iff a check column is present AND every row's check cell is "1".
// Empty tables return false, mirroring rowSelection's all-selected semantics
// (and matching the legacy inline computation in WeatherTable).
export const selectAllChecked = createSelector(
  selectActiveWeatherTable,
  selectCheckColId,
  (table, checkColId): boolean => {
    if (!table || checkColId == null || table.rowOrder.length === 0) return false
    return table.rowOrder.every((rowId) => (table.rows[rowId]?.[checkColId] ?? null) === '1')
  }
)

export const makeSelectRowSelected = (
  rowId: RowId
): ((state: RootState) => boolean) =>
  createSelector(selectRowSelection, (sel) => sel[rowId] === true)

// ── Mutation flow status (add column / add row) ─────────────────────────────

export const selectAddColumnLoading = createSelector(
  selectProjectScreenDomain,
  (s) => s.addColumn.loading
)
export const selectAddColumnError = createSelector(
  selectProjectScreenDomain,
  (s) => s.addColumn.error
)
export const selectAddRowLoading = createSelector(
  selectProjectScreenDomain,
  (s) => s.addRow.loading
)
export const selectAddRowError = createSelector(
  selectProjectScreenDomain,
  (s) => s.addRow.error
)

// ── Domain export (for tests / advanced consumers) ───────────────────────────

export { selectProjectScreenDomain }
