import { api, ApiError } from 'utils/api'
import { API_ROUTES } from 'utils/constants'
import messages from './messages'
import { mockProjectStore, type StoredProject } from './mockProjectStore'
import type {
  CreateProjectPayload,
  CreateProjectResponse,
  RecentProjectsResponse
} from './types'

// Service layer for the HomePage container.
//
// Each exported *Request function has two branches:
//   1) The mock branch (used today) — hits mockProjectStore in localStorage.
//   2) The real branch — calls utils/api against API_ROUTES in utils/constants.
//
// Both branches are live TypeScript and typecheck on every build. When the
// backend is ready, flip USE_MOCK_API to false, verify, and then delete the
// mock branches and mockProjectStore.ts in a cleanup pass.

const USE_MOCK_API = true

const MOCK_LATENCY_MS = 2000

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

// ── Create ────────────────────────────────────────────────────────────────────

export function createProjectRequest(payload: CreateProjectPayload): Promise<CreateProjectResponse> {
  if (USE_MOCK_API) return createProjectMock(payload)
  return api.post<CreateProjectResponse>(API_ROUTES.project.create, payload)
}

function createProjectMock(payload: CreateProjectPayload): Promise<CreateProjectResponse> {
  return delay(MOCK_LATENCY_MS, () => {
    const cleanName = payload.name.trim()

    // Dev hook: type "fail" to exercise the 500 error path
    if (import.meta.env.DEV && cleanName.toLowerCase() === 'fail') {
      throw new ApiError(500, messages.createProject.errors.serverError)
    }

    // Mirrors project_service.create_project 409 check
    if (mockProjectStore.findByName(cleanName)) {
      throw new ApiError(409, messages.createProject.errors.duplicateName)
    }

    const project: StoredProject = {
      success: true,
      project_id: crypto.randomUUID(),
      name: cleanName,
      latitude: payload.latitude,
      longitude: payload.longitude,
      utc_offset: Math.round(payload.longitude / 15),
      session_id: 'mock-session',
      createdAt: Date.now()
    }

    mockProjectStore.insert(project)
    return project
  })
}

// ── Recent ────────────────────────────────────────────────────────────────────

export function fetchRecentProjectsRequest(): Promise<RecentProjectsResponse> {
  if (USE_MOCK_API) return fetchRecentProjectsMock()
  return api.get<RecentProjectsResponse>(API_ROUTES.project.recent)
}

function fetchRecentProjectsMock(): Promise<RecentProjectsResponse> {
  return delay(300, () => ({
    projects: mockProjectStore
      .list()
      .map((p) => ({
        id: p.project_id,
        name: p.name,
        last_updated: new Date(p.createdAt).toISOString(),
        size: 0
      }))
      .sort((a, b) => b.last_updated.localeCompare(a.last_updated))
  }))
}

// ── Delete (stub for future deleteProject feature) ────────────────────────────

export function deleteProjectRequest(projectId: string): Promise<void> {
  if (USE_MOCK_API) return deleteProjectMock(projectId)
  return api.delete<void>(API_ROUTES.project.delete(projectId))
}

function deleteProjectMock(projectId: string): Promise<void> {
  return delay(300, () => {
    const removed = mockProjectStore.remove(projectId)
    if (!removed) {
      throw new ApiError(404, messages.createProject.errors.notFound)
    }
  })
}
