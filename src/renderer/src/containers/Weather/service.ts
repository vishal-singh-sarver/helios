import type { ColumnDef } from 'containers/ProjectScreen/types'
import { api, ApiError } from 'utils/api'
import { API_ROUTES } from 'utils/constants'
import type { RawDataRow } from 'utils/weatherTable'
import messages from './messages'

// Each *Request function has two branches:
//   1) The mock branch (used today) — resolves locally after a short delay.
//   2) The real branch — calls utils/api against API_ROUTES.weather.
// Flip USE_MOCK_API to false once the backend is ready and delete the mocks.

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

// ── Headers (column metadata) ────────────────────────────────────────────────

const MOCK_HEADERS: ColumnDef[] = [
  { id: 'col_datetime', name: 'date_time', unit: null, datatype: null },
  { id: 'col_air_temperature', name: 'air_temperature', unit: 'K', datatype: 'air_temperature' },
  { id: 'col_air_pressure', name: 'air_pressure', unit: 'Pa', datatype: 'air_pressure' }
]

export interface HeadersResponse {
  headers: ColumnDef[]
}

export function loadHeadersRequest(): Promise<HeadersResponse> {
  if (USE_MOCK_API) return delay(MOCK_LATENCY_MS, () => ({ headers: MOCK_HEADERS }))
  return api.get<HeadersResponse>(API_ROUTES.weather.headers)
}

// ── Data (rows) ──────────────────────────────────────────────────────────────

const MOCK_ROWS: RawDataRow[] = Array.from({ length: 5 }, (_, i) => ({
  date: '2026-04-27',
  time: `${String(10 + i).padStart(2, '0')}:00`,
  col_air_temperature: String(293 + i),
  col_air_pressure: String(101325 - i)
}))

export interface DataResponse {
  rows: RawDataRow[]
}

export function loadDataRequest(): Promise<DataResponse> {
  if (USE_MOCK_API) return delay(MOCK_LATENCY_MS, () => ({ rows: MOCK_ROWS }))
  return api.get<DataResponse>(API_ROUTES.weather.data)
}

// ── Add column ───────────────────────────────────────────────────────────────

export interface AddColumnRequestBody {
  name: string
  dataTypeId: string
  dataUnitId: string
  defaultValue: string
}

export interface AddColumnResponse {
  column: ColumnDef
}

export function addColumnRequest(body: AddColumnRequestBody): Promise<AddColumnResponse> {
  if (USE_MOCK_API) return addColumnMock(body)
  return api.post<AddColumnResponse>(API_ROUTES.weather.addColumn, body)
}

function addColumnMock(body: AddColumnRequestBody): Promise<AddColumnResponse> {
  return delay(MOCK_LATENCY_MS, () => {
    const cleanName = body.name.trim()

    if (import.meta.env.DEV && cleanName.toLowerCase() === 'fail') {
      throw new ApiError(500, messages.addColumn.errors.serverError)
    }

    return {
      column: {
        id: `col_${cleanName || crypto.randomUUID().slice(0, 8)}`,
        name: cleanName,
        unit: body.dataUnitId || null,
        datatype: body.dataTypeId || null
      }
    }
  })
}

// ── Add rows ─────────────────────────────────────────────────────────────────

export interface AddRowsRequestBody {
  date: string
  time: string
  columnIds: string[]
  numberOfRows: number
}

export interface AddRowsResponse {
  rows: RawDataRow[]
}

export function addRowsRequest(body: AddRowsRequestBody): Promise<AddRowsResponse> {
  if (USE_MOCK_API) return addRowsMock(body)
  return api.post<AddRowsResponse>(API_ROUTES.weather.addRows, body)
}

function addRowsMock(body: AddRowsRequestBody): Promise<AddRowsResponse> {
  return delay(MOCK_LATENCY_MS, () => {
    if (import.meta.env.DEV && body.numberOfRows < 0) {
      throw new ApiError(500, messages.addRows.errors.serverError)
    }

    const rows: RawDataRow[] = Array.from({ length: body.numberOfRows }, (_, i) => {
      const row: RawDataRow = { date: body.date, time: body.time }
      for (const colId of body.columnIds) {
        if (colId !== 'col_datetime') row[colId] = ''
      }
      void i
      return row
    })

    return { rows }
  })
}

// ── Update cell ──────────────────────────────────────────────────────────────

export interface UpdateCellRequestBody {
  date: string
  time: string
  colId: string
  value: string
}

export interface UpdateCellResponse {
  success: boolean
}

export function updateCellRequest(body: UpdateCellRequestBody): Promise<UpdateCellResponse> {
  if (USE_MOCK_API) {
    return delay(MOCK_LATENCY_MS, () => {
      if (import.meta.env.DEV && body.value === 'FAIL') {
        throw new ApiError(500, 'Failed to update cell')
      }
      return { success: true }
    })
  }
  return api.post<UpdateCellResponse>(API_ROUTES.weather.updateCell, body)
}
