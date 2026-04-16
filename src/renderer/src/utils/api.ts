import axios, { AxiosError, AxiosInstance } from 'axios'
import { BASE_URL } from './constants'
import { getSessionId } from './session'

// ── Error type ───────────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

// ── Error body parsing ───────────────────────────────────────────────────────
//
// FastAPI shapes:
//   HTTPException → { detail: "message" }
//   Pydantic 422  → { detail: [{ loc, msg, type }, ...] }
function extractErrorMessage(data: unknown, fallback: string): string {
  if (data == null) return fallback
  if (typeof data === 'string') return data || fallback

  const detail = (data as { detail?: unknown })?.detail

  if (typeof detail === 'string') return detail

  if (Array.isArray(detail)) {
    const parts = detail
      .map((d: { loc?: unknown[]; msg?: unknown }) => {
        if (typeof d?.msg !== 'string') return null
        const loc =
          Array.isArray(d.loc) && d.loc.length > 0 ? String(d.loc[d.loc.length - 1]) : null
        return loc ? `${loc}: ${d.msg}` : d.msg
      })
      .filter((m): m is string => m !== null)
    if (parts.length > 0) return parts.join('; ')
  }

  return fallback
}

// ── Axios instance ───────────────────────────────────────────────────────────

const client: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json', accept: 'application/json' }
})

client.interceptors.request.use((config) => {
  config.headers.set('session-id', getSessionId())
  return config
})

// ── Core request ─────────────────────────────────────────────────────────────

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  try {
    const res = await client.request<T>({ method, url: path, data: body })
    return res.data
  } catch (err) {
    const axErr = err as AxiosError
    if (axErr.response) {
      throw new ApiError(
        axErr.response.status,
        extractErrorMessage(axErr.response.data, axErr.response.statusText || axErr.message)
      )
    }
    throw new ApiError(0, axErr.message || 'Network error')
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

export const api = {
  get:    <T>(path: string)                 => request<T>('GET', path),
  post:   <T>(path: string, body?: unknown) => request<T>('POST', path, body),
  put:    <T>(path: string, body?: unknown) => request<T>('PUT', path, body),
  patch:  <T>(path: string, body?: unknown) => request<T>('PATCH', path, body),
  delete: <T>(path: string)                 => request<T>('DELETE', path)
}
