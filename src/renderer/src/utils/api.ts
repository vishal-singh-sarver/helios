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

// FastAPI shapes:
//   HTTPException → { detail: "message" }
//   Pydantic 422  → { detail: [{ loc, msg, type }, ...] }
function extractErrorMessage(raw: string, contentType: string | null, fallback: string): string {
  if (!raw) return fallback
  if (!contentType?.includes('application/json')) return raw

  try {
    const body = JSON.parse(raw) as { detail?: unknown }
    const detail = body?.detail

    if (typeof detail === 'string') return detail

    if (Array.isArray(detail)) {
      const parts = detail
        .map((d: { loc?: unknown[]; msg?: unknown }) => {
          if (typeof d?.msg !== 'string') return null
          const loc = Array.isArray(d.loc) && d.loc.length > 0 ? String(d.loc[d.loc.length - 1]) : null
          return loc ? `${loc}: ${d.msg}` : d.msg
        })
        .filter((m): m is string => m !== null)
      if (parts.length > 0) return parts.join('; ')
    }
  } catch {
    // fall through: malformed JSON, use raw text
  }

  return raw
}

// ── Core request ─────────────────────────────────────────────────────────────

async function request<T>(
  method: string,
  path: string,
  body?: unknown
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'session-id': getSessionId()
    },
    ...(body !== undefined && { body: JSON.stringify(body) })
  })

  if (!res.ok) {
    const raw = await res.text().catch(() => '')
    throw new ApiError(res.status, extractErrorMessage(raw, res.headers.get('content-type'), res.statusText))
  }

  // 204 No Content or non-JSON responses return undefined
  const contentType = res.headers.get('content-type') ?? ''
  if (!contentType.includes('application/json')) {
    return undefined as T
  }

  return res.json() as Promise<T>
}

// ── Public API ────────────────────────────────────────────────────────────────

export const api = {
  get:    <T>(path: string)                  => request<T>('GET', path),
  post:   <T>(path: string, body?: unknown)  => request<T>('POST', path, body),
  put:    <T>(path: string, body?: unknown)  => request<T>('PUT', path, body),
  patch:  <T>(path: string, body?: unknown)  => request<T>('PATCH', path, body),
  delete: <T>(path: string)                  => request<T>('DELETE', path),
}
