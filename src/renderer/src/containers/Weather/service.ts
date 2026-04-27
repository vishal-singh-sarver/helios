import { api, ApiError } from 'utils/api'
import { API_ROUTES } from 'utils/constants'
import messages from './messages'
import type {
  AddColumnPayload,
  AddColumnResponse,
  AddRowsPayload,
  AddRowsResponse
} from './types'

// Each exported *Request function has two branches:
//   1) The mock branch (used today) — resolves locally after a short delay.
//   2) The real branch — calls utils/api against API_ROUTES in utils/constants.
// Flip USE_MOCK_API to false once the backend is ready and delete the mocks.

const USE_MOCK_API = true
const MOCK_LATENCY_MS = 1500

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

// ── Add column ────────────────────────────────────────────────────────────────

export function addColumnRequest(payload: AddColumnPayload): Promise<AddColumnResponse> {
  if (USE_MOCK_API) return addColumnMock(payload)
  return api.post<AddColumnResponse>(API_ROUTES.weather.addColumn, payload)
}

function addColumnMock(payload: AddColumnPayload): Promise<AddColumnResponse> {
  return delay(MOCK_LATENCY_MS, () => {
    const cleanName = payload.parameterName.trim()

    if (import.meta.env.DEV && cleanName.toLowerCase() === 'fail') {
      throw new ApiError(500, messages.addColumn.errors.serverError)
    }

    return {
      success: true,
      column_id: crypto.randomUUID(),
      parameterName: cleanName,
      dataType: payload.dataType.trim(),
      defaultValue: payload.defaultValue.trim()
    }
  })
}

// ── Add rows ──────────────────────────────────────────────────────────────────

export function addRowsRequest(payload: AddRowsPayload): Promise<AddRowsResponse> {
  if (USE_MOCK_API) return addRowsMock(payload)
  return api.post<AddRowsResponse>(API_ROUTES.weather.addRows, payload)
}

function addRowsMock(payload: AddRowsPayload): Promise<AddRowsResponse> {
  return delay(MOCK_LATENCY_MS, () => {
    if (import.meta.env.DEV && payload.numberOfRows < 0) {
      throw new ApiError(500, messages.addRows.errors.serverError)
    }

    return {
      success: true,
      rows_added: payload.numberOfRows,
      startDate: payload.startDate,
      startTime: payload.startTime
    }
  })
}
