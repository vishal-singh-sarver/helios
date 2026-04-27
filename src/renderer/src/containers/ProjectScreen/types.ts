// Domain types for the ProjectScreen slice.
//
// Three concerns live here: the data-type registry (loaded from the backend),
// the active scenario, and the per-scenario WeatherTable. Imported by
// actions.ts, reducer.ts and selectors.ts to avoid circular deps.

// ── Data-type registry (loaded from backend) ─────────────────────────────────

export type DataTypeKind = 'number' | 'date' | 'time' | 'integer'
export type DataTypeScope = 'column' | 'scenario'

export interface UnitDef {
  id: string
  symbol: string
  min: number | null
  max: number | null
}

export interface DataTypeDef {
  id: string
  displayName: string
  description: string
  scope: DataTypeScope
  kind: DataTypeKind
  units: UnitDef[]
  canonicalUnit: string | null
  defaultUnit: string | null
}

// ── Identifiers ──────────────────────────────────────────────────────────────

export type ColId = string   // assigned by the backend (incl. the date-time col)
export type RowId = string   // client-generated, e.g. `row_${index}`

// ── Header / column shape (1:1 with backend metadata) ───────────────────────

export interface ColumnDef {
  id: ColId
  name: string
  unit: string | null         // display symbol, e.g. "K", "Pa"; null for date-time
  datatype: string | null     // DataTypeDef.id
}

// ── Per-scenario weather table ──────────────────────────────────────────────

export type CellSyncStatus = 'idle' | 'pending' | 'error'
export type LoadStatus = 'idle' | 'loading' | 'loaded' | 'error'

// Single string key for the cellSync map.
export const cellKey = (rowId: RowId, colId: ColId): string => `${rowId}:${colId}`

export interface WeatherTable {
  columns: Record<ColId, ColumnDef>
  columnOrder: ColId[]

  rows: Record<RowId, Record<ColId, string>>
  rowOrder: RowId[]

  validationErrors: Record<RowId, Record<ColId, string>>
  cellSync: Record<string, CellSyncStatus>
  rowSelection: Record<RowId, boolean>
}

export const emptyWeatherTable = (): WeatherTable => ({
  columns: {},
  columnOrder: [],
  rows: {},
  rowOrder: [],
  validationErrors: {},
  cellSync: {},
  rowSelection: {}
})

// ── Action payload shapes ────────────────────────────────────────────────────

// LOAD_SCENARIO_SUCCEEDED — saga has already merged separate date/time fields
// into the date-time ColId before dispatch.
export interface LoadedScenarioPayload {
  scenarioId: string
  columns: ColumnDef[]                           // ordered as displayed
  rows: Array<Record<ColId, string>>             // ordered, datetime already clubbed
}

// ADD_ROW_REQUESTED — what the dialog dispatches and the saga POSTs.
export interface AddRowRequestedPayload {
  scenarioId: string
  date: string                                    // start date
  time: string                                    // start time
  columnIds: ColId[]                              // all columns, in display order
  numberOfRows: number
}

// ADD_ROW_SUCCEEDED — new rows already merged (datetime clubbed by saga).
export interface AddRowSucceededPayload {
  scenarioId: string
  rows: Array<Record<ColId, string>>
}

// ADD_COLUMN_REQUESTED — what the dialog dispatches and the saga POSTs.
export interface AddColumnRequestedPayload {
  scenarioId: string
  name: string
  dataTypeId: string
  dataUnitId: string
  defaultValue: string                            // back-fill into every existing row
}

// ADD_COLUMN_SUCCEEDED — backend returned the new column metadata.
export interface AddColumnSucceededPayload {
  scenarioId: string
  column: ColumnDef
  defaultValue: string
}

export interface UpdateCellLocalPayload {
  scenarioId: string
  rowId: RowId
  colId: ColId
  value: string
  validationError: string | null                  // non-null short-circuits the saga
}
