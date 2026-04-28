// Domain types for the ProjectScreen slice.
//
// Three concerns live here: the catalog (data types and units, loaded from
// backend), the active project + scenario, and the per-scenario WeatherTable.
// Imported by actions.ts, reducer.ts and selectors.ts to avoid circular deps.

// ── Catalog: data types and units (loaded from backend) ─────────────────────
//
// The backend exposes a single combined endpoint:
//   GET /api/data-types/with-units -> { data_types: DataTypeDef[] }
// where each data type carries its `units[]` inline. Wire shapes use
// snake_case; we keep them as-is so the service layer is a pass-through.

export interface DataUnitDef {
  id: number
  unit: string
  alias: string
  data_type_id: number
  min: number | null
  max: number | null
  to_base_factor: number
  to_base_offset: number
  is_base: boolean
  created_at: string
  updated_at: string
}

export interface DataTypeDef {
  id: number
  data_type: string
  description: string
  created_at: string
  updated_at: string
  units: DataUnitDef[]
}

// ── Scenarios (per project) ─────────────────────────────────────────────────

export interface Scenario {
  id: string                                      // UUID
  name: string
  has_weather: boolean
  created_at: string
  updated_at: string
}

// ── Identifiers ──────────────────────────────────────────────────────────────

// ColId is an opaque string. For backend-managed columns it's the stringified
// WeatherDataHeader.id ("5", "12"). For the date/time pseudo-columns it's the
// literal strings "date" and "time". For upload-created columns it's the
// slugified CSV header (e.g. "air_temperature") — these have no metadata in
// weather_data_header, so unit/dataType selectors fall back gracefully.
export type ColId = string

// RowId is client-generated, e.g. `row_${index}`. The backend doesn't have a
// row id concept — rows are addressed by (date, time).
export type RowId = string

// Cell value. null === NaN (cleared cell). The cell editor renders null as
// an empty input, and writing "" to a cell is the way to clear it (the
// reducer normalizes "" to null at write time).
export type CellValue = string | null

// Reserved column ids for the date/time pseudo-columns synthesised by the
// load saga. Never sent to the backend as `col` in update/delete.
export const DATE_COL_ID: ColId = 'date'
export const TIME_COL_ID: ColId = 'time'

export function isReservedColId(colId: ColId): boolean {
  return colId === DATE_COL_ID || colId === TIME_COL_ID
}

// ── Backend wire shape: weather_data_header row ─────────────────────────────

export interface WeatherHeader {
  id: number
  scenario_id: string
  name: string
  helios_data_type_id: number
  unit_id: number
  status: boolean
  display_order: number
  created_at: string
  updated_at: string
}

// ── Internal column shape ───────────────────────────────────────────────────
//
// Built by the load saga by joining DataPage.labels[] with WeatherHeader[].
// dataTypeId/unitId are nullable for *every* column, not just date/time —
// uploaded columns lack metadata and render as bare names.

export interface ColumnDef {
  id: ColId
  name: string
  dataTypeId: number | null
  unitId: number | null
}

// ── Per-scenario weather table ──────────────────────────────────────────────

export type CellSyncStatus = 'idle' | 'pending' | 'error'
export type LoadStatus = 'idle' | 'loading' | 'loaded' | 'error'

// Single string key for the cellSync map.
export const cellKey = (rowId: RowId, colId: ColId): string => `${rowId}:${colId}`

export interface WeatherTable {
  columns: Record<ColId, ColumnDef>
  columnOrder: ColId[]

  rows: Record<RowId, Record<ColId, CellValue>>
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

// LOAD_SCENARIO_SUCCEEDED — saga has already joined labels[] with headers[]
// and synthesised the date/time pseudo-columns into `columns` at positions 0/1.
export interface LoadedScenarioPayload {
  projectId: string
  scenarioId: string
  columns: ColumnDef[]                            // ordered as displayed
  rows: Array<Record<ColId, CellValue>>           // null === NaN
}

// ADD_ROW_REQUESTED — what the dialog dispatches and the saga POSTs.
// Saga expands (date, time, deltaHours, numberOfRows) into N row dicts client-side
// and POSTs them to /addRow. Non-date/time columns are filled with null.
export interface AddRowRequestedPayload {
  projectId: string
  scenarioId: string
  date: string                                    // start date (YYYY-MM-DD)
  time: string                                    // start time (HH:mm)
  columnIds: ColId[]                              // all columns, in display order
  numberOfRows: number
  deltaHours: number                              // integer hour gap between rows
}

// ADD_ROW_SUCCEEDED — row-add returns counters only (no inline rows). The
// saga chains LOAD_SCENARIO_REQUESTED on success so the reducer doesn't
// need an append branch.
export interface AddRowSucceededPayload {
  projectId: string
  scenarioId: string
}

// ADD_COLUMN_REQUESTED — what the dialog dispatches and the saga POSTs.
// dataTypeId / dataUnitId are optional (backend accepts null).
export interface AddColumnRequestedPayload {
  projectId: string
  scenarioId: string
  name: string
  dataTypeId: number | null
  dataUnitId: number | null
  defaultValue: string                            // back-fill into every existing row
}

// ADD_COLUMN_SUCCEEDED — backend returns the new column metadata.
export interface AddColumnSucceededPayload {
  projectId: string
  scenarioId: string
  column: ColumnDef
  defaultValue: string
}

export interface UpdateCellLocalPayload {
  projectId: string
  scenarioId: string
  rowId: RowId
  colId: ColId
  value: string                                   // raw editor value; "" clears (NaN)
  validationError: string | null                  // non-null short-circuits the saga
}
