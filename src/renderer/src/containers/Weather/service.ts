import type {
  CellValue,
  ColumnDef,
  DataTypeDef,
  Scenario,
  WeatherHeader
} from 'containers/ProjectScreen/types'
import { api, ApiError } from 'utils/api'
import { API_ROUTES } from 'utils/constants'

// ── Catalog ──────────────────────────────────────────────────────────────────
//
// Combined endpoint returns each data type with its units nested. One call
// on ProjectScreen mount populates the full catalog.

export interface DataTypesResponse {
  data_types: DataTypeDef[]
}

export function loadDataTypesRequest(): Promise<DataTypesResponse> {
  return api.get<DataTypesResponse>(API_ROUTES.catalog.dataTypes)
}

// ── Project (with scenarios) ────────────────────────────────────────────────
//
// GET /api/project/{project_id} returns the project, its scenarios, and each
// scenario's weather_data_headers in one round-trip. We currently consume
// only the scenarios list; the saga forwards them to listScenariosSucceeded.

export interface ScenarioWithHeaders extends Scenario {
  weather_data_headers: WeatherHeader[]
}

export interface GetProjectResponse {
  project: {
    id: string
    name: string
    latitude: number
    longitude: number
    utc_offset: number
    created_at: string
    updated_at: string
    scenarios: ScenarioWithHeaders[]
  }
}

export function getProjectRequest(projectId: string): Promise<GetProjectResponse> {
  return api.get<GetProjectResponse>(API_ROUTES.project.get(projectId))
}

// ── Headers ──────────────────────────────────────────────────────────────────

export interface HeadersResponse {
  success: boolean
  count: number
  headers: WeatherHeader[]
}

export function loadHeadersRequest(
  projectId: string,
  scenarioId: string
): Promise<HeadersResponse> {
  return api.get<HeadersResponse>(API_ROUTES.weather.headers(projectId, scenarioId))
}

// ── Data (rows) ──────────────────────────────────────────────────────────────

// Wire shape — labels[] is ["date", "time", ...colIds], rows[] are dicts
// keyed by those labels with numbers / nulls for the data columns.
export interface DataPage {
  success: boolean
  labels: string[]
  row_count: number
  total_rows: number
  column_count: number
  offset: number
  limit: number | null
  rows: Array<Record<string, string | number | null>>
}

export function loadDataRequest(
  projectId: string,
  scenarioId: string
): Promise<DataPage> {
  // Pagination is intentionally not used yet — server returns the full
  // table when limit is omitted.
  return api.get<DataPage>(API_ROUTES.weather.data(projectId, scenarioId))
}

// ── Add column ───────────────────────────────────────────────────────────────
//
// POST /api/weather/.../addCol expects an array of column descriptors:
//   { column: [ { name, datatype, data_unit, values } ] }
// `values` back-fills existing rows; each entry is { date, time, value } so
// the backend can address the correct cell. An empty array leaves rows as
// NaN/null. `datatype` and `data_unit` are optional.

export interface AddColumnCellValue {
  date: string
  time: string
  value: string
}

export interface AddColumnRequestBody {
  name: string
  dataTypeId: number | null
  dataUnitId: number | null
  values: AddColumnCellValue[]
}

interface AddColumnWireBody {
  column: Array<{
    name: string
    datatype: number | null
    data_unit: number | null
    values: AddColumnCellValue[]
  }>
}

interface AddColumnWireResponse {
  success: boolean
  columns: Array<{
    id: number
    name: string
    datatype_id: number | null
    data_unit_id: number | null
  }>
}

export interface AddColumnResponse {
  column: ColumnDef
}

export async function addColumnRequest(
  projectId: string,
  scenarioId: string,
  body: AddColumnRequestBody
): Promise<AddColumnResponse> {
  const wire: AddColumnWireBody = {
    column: [
      {
        name: body.name,
        datatype: body.dataTypeId,
        data_unit: body.dataUnitId,
        values: body.values
      }
    ]
  }
  const res = await api.post<AddColumnWireResponse>(
    API_ROUTES.weather.addCol(projectId, scenarioId),
    wire
  )
  const wireCol = res.columns[0]
  if (!wireCol) throw new ApiError(500, 'Server returned no columns')
  return {
    column: {
      id: String(wireCol.id),
      name: wireCol.name,
      dataTypeId: wireCol.datatype_id,
      unitId: wireCol.data_unit_id
    }
  }
}

// ── Add rows ─────────────────────────────────────────────────────────────────
//
// POST /api/weather/.../addRow takes a fully-built rows[] array. The saga
// expands (startDate, startTime, deltaHours, numberOfRows) into row dicts
// before calling — non-date/time columns default to null.

export interface AddRowsRequestBody {
  rows: Array<Record<string, string | null>>
}

export interface AddRowsResponse {
  success: boolean
}

export function addRowsRequest(
  projectId: string,
  scenarioId: string,
  body: AddRowsRequestBody
): Promise<AddRowsResponse> {
  return api.post<AddRowsResponse>(API_ROUTES.weather.addRow(projectId, scenarioId), body)
}

// ── Update cell (mocked until backend contract is finalised) ─────────────────

const USE_MOCK_API = true
const MOCK_LATENCY_MS = 500

function delay<T>(ms: number, fn: () => T | Promise<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        Promise.resolve(fn()).then(resolve, reject)
      } catch (err) {
        reject(err)
      }
    }, ms)
  })
}

// ── Update cell ──────────────────────────────────────────────────────────────

export interface UpdateCellRequestBody {
  col: string
  row: { date: string; time: string }
  value: string                     // "" clears (NaN)
}

export interface UpdateCellResponse {
  success: boolean
}

export function updateCellRequest(
  _projectId: string,
  _scenarioId: string,
  body: UpdateCellRequestBody
): Promise<UpdateCellResponse> {
  if (USE_MOCK_API) {
    return delay(MOCK_LATENCY_MS, () => {
      if (import.meta.env.DEV && body.value === 'FAIL') {
        throw new ApiError(500, 'Failed to update cell')
      }
      return { success: true }
    })
  }
  return api.post<UpdateCellResponse>(
    API_ROUTES.weather.update(_projectId, _scenarioId),
    body
  )
}

// ── Helpers used by the load saga to coerce wire shapes ──────────────────────

// Coerce a wire cell value (number | string | null) into the in-memory
// CellValue (string | null). Numbers are stringified verbatim — display
// formatting is the renderer's concern.
export function toCellValue(raw: string | number | null | undefined): CellValue {
  if (raw == null) return null
  if (typeof raw === 'number') {
    return Number.isFinite(raw) ? String(raw) : null
  }
  return raw
}
