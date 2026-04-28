import type {
  CellValue,
  ColumnDef,
  DataTypeDef,
  Scenario,
  WeatherHeader
} from 'containers/ProjectScreen/types'
import { api, ApiError } from 'utils/api'
import { API_ROUTES } from 'utils/constants'
import messages from './messages'

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

// ── Add column / rows (mocked until the next PR) ─────────────────────────────
//
// These signatures are wired against the unified /add endpoint shape but the
// implementations are still placeholders — full server integration lands in
// the add/update/delete vertical slice.

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

export interface AddColumnRequestBody {
  name: string
  dataTypeId: number
  dataUnitId: number
  defaultValue: string
}

export interface AddColumnResponse {
  column: ColumnDef
}

export function addColumnRequest(
  _projectId: string,
  _scenarioId: string,
  body: AddColumnRequestBody
): Promise<AddColumnResponse> {
  if (USE_MOCK_API) return addColumnMock(body)
  // Real implementation lands in the add/update/delete vertical slice.
  return api.post<AddColumnResponse>(
    API_ROUTES.weather.add(_projectId, _scenarioId),
    body
  )
}

function addColumnMock(body: AddColumnRequestBody): Promise<AddColumnResponse> {
  return delay(MOCK_LATENCY_MS, () => {
    const cleanName = body.name.trim()

    if (import.meta.env.DEV && cleanName.toLowerCase() === 'fail') {
      throw new ApiError(500, messages.addColumn.errors.serverError)
    }

    // Mock returns a synthetic numeric id stringified, mirroring the real
    // backend (WeatherDataHeader.id stringified).
    const fakeId = String(Math.floor(Math.random() * 1_000_000))
    return {
      column: {
        id: fakeId,
        name: cleanName,
        dataTypeId: body.dataTypeId,
        unitId: body.dataUnitId
      }
    }
  })
}

export interface AddRowsRequestBody {
  date: string
  time: string
  columnIds: string[]
  numberOfRows: number
}

// Row-add returns counters only; saga chains a refetch.
export interface AddRowsResponse {
  success: boolean
  row_count: number
  added_rows: number
}

export function addRowsRequest(
  _projectId: string,
  _scenarioId: string,
  body: AddRowsRequestBody
): Promise<AddRowsResponse> {
  if (USE_MOCK_API) return addRowsMock(body)
  return api.post<AddRowsResponse>(
    API_ROUTES.weather.add(_projectId, _scenarioId),
    body
  )
}

function addRowsMock(body: AddRowsRequestBody): Promise<AddRowsResponse> {
  return delay(MOCK_LATENCY_MS, () => {
    if (import.meta.env.DEV && body.numberOfRows < 0) {
      throw new ApiError(500, messages.addRows.errors.serverError)
    }
    return { success: true, row_count: body.numberOfRows, added_rows: body.numberOfRows }
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
