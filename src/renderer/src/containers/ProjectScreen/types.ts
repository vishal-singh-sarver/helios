// Domain types for the ProjectScreen slice.
//
// One slice owns three concerns: the data-type registry (loaded from the
// backend), the active scenario, and per-scenario grid state. Imported by
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

// ── Editable grid, per scenario ──────────────────────────────────────────────
//
// Row-oriented store. Rows are keyed by stable insert-time integer IDs
// (0..N-1 at load, nextRowSeq++ thereafter). `rowOrder` holds display order
// so sort mutates only that array. The backend identifies rows by
// (date, time); `rowKeys` is the side map sagas use to translate
// rowId → backend key. Columns are keyed by the backend's columnname.

export type RowId = number
export type ColId = string

export interface ColumnDef {
  id: ColId
  name: string
  dataTypeId: string | null // → DataTypeDef.id
  unitId: string | null     // → UnitDef.id within that DataTypeDef
}

export interface RowKey {
  date: string // YYYY-MM-DD
  time: string // HH:MM:SS
}

export type CellSyncStatus = 'idle' | 'pending' | 'error'
export type LoadStatus = 'idle' | 'loading' | 'loaded' | 'error'

// Single string key for cellSync / cellErrors maps.
export const cellKey = (rowId: RowId, colId: ColId): string => `${rowId}:${colId}`

export interface ScenarioGrid {
  columns: Record<ColId, ColumnDef>
  columnOrder: ColId[]

  rows: Record<RowId, Record<ColId, string>>
  rowOrder: RowId[]
  rowKeys: Record<RowId, RowKey>
  nextRowSeq: number

  validationErrors: Record<RowId, Record<ColId, string>>
  cellSync: Record<string, CellSyncStatus>
  cellErrors: Record<string, string>
  rowSelection: Record<RowId, boolean>

  loadStatus: LoadStatus
  loadError: string | null
}

export const emptyScenarioGrid = (): ScenarioGrid => ({
  columns: {},
  columnOrder: [],
  rows: {},
  rowOrder: [],
  rowKeys: {},
  nextRowSeq: 0,
  validationErrors: {},
  cellSync: {},
  cellErrors: {},
  rowSelection: {},
  loadStatus: 'idle',
  loadError: null
})

// ── Action payload shapes ────────────────────────────────────────────────────

export interface LoadedScenarioPayload {
  scenarioId: string
  columns: ColumnDef[]                             // ordered as displayed
  rows: Array<{                                    // ordered as displayed
    date: string
    time: string
    values: Record<ColId, string>                  // values for non-date/time columns
  }>
}

export interface AddRowPayload {
  scenarioId: string
  date: string
  time: string
  values: Record<ColId, string>
}

export interface AddColumnPayload {
  scenarioId: string
  colId: ColId
  name: string
  dataTypeId: string | null
  unitId: string | null
  values: string[] // one per existing row, in rowOrder order
}

export interface UpdateCellLocalPayload {
  scenarioId: string
  rowId: RowId
  colId: ColId
  value: string
  validationError: string | null // non-null short-circuits the saga (red border, no network call)
}
