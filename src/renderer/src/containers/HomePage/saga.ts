import { call, put, race, take, takeEvery, takeLatest, takeLeading } from 'redux-saga/effects'
import { api, ApiError } from 'utils/api'
import { API_ROUTES } from 'utils/constants'
import { createSseChannel } from 'utils/sse'
import type { SseMessage } from 'utils/sse'
import * as actions from './actions'
import {
  CREATE_PROJECT,
  DELETE_PROJECT,
  FETCH_RECENT_PROJECTS,
  FETCH_STATUS,
  SSE_CONNECT,
  SSE_DISCONNECT
} from './constants'
import type {
  AppStatus,
  CreateProjectResponse,
  RecentProjectsResponse,
  ApiErrorPayload
} from './types'


function toErrorPayload(err: unknown): ApiErrorPayload {
  if (err instanceof ApiError) {
    return { status: err.status, message: err.message, fieldErrors: err.fieldErrors }
  }
  const message = err instanceof Error ? err.message : String(err)
  return { status: 0, message, fieldErrors: {} }
}

// ── REST worker ───────────────────────────────────────────────────────────────

export function* fetchStatusWorker(): Generator {
  try {
    const status = (yield call(api.get<AppStatus>, '/api/status')) as AppStatus
    yield put(actions.fetchStatusSuccess(status))
  } catch (err) {
    yield put(actions.fetchStatusFailure((err as Error).message))
  }
}

// ── Create project worker ─────────────────────────────────────────────────────

export function* createProjectWorker(
  action: ReturnType<typeof actions.createProject>
): Generator {
  try {
    const response = (yield call(
      api.post<CreateProjectResponse>,
      API_ROUTES.project.create,
      action.payload
    )) as CreateProjectResponse
    yield put(actions.createProjectSuccess(response))
    // Refresh the Recent Projects list so the table reflects the new row
    // without the component having to orchestrate a follow-up dispatch.
    yield put(actions.fetchRecentProjects())
  } catch (err) {
    yield put(actions.createProjectFailure(toErrorPayload(err)))
  }
}

// ── Delete project worker ─────────────────────────────────────────────────────

export function* deleteProjectWorker(
  action: ReturnType<typeof actions.deleteProject>
): Generator {
  const { projectId } = action.payload
  try {
    yield call(api.delete<string>, API_ROUTES.project.delete(projectId))
    yield put(actions.deleteProjectSuccess(projectId))
  } catch (err) {
    yield put(actions.deleteProjectFailure(projectId, toErrorPayload(err)))
  }
}

// ── Recent projects worker ────────────────────────────────────────────────────

export function* fetchRecentProjectsWorker(): Generator {
  try {
    const response = (yield call(
      api.get<RecentProjectsResponse>,
      API_ROUTES.project.recent
    )) as RecentProjectsResponse
    yield put(actions.fetchRecentProjectsSuccess(response.projects))
  } catch (err) {
    yield put(actions.fetchRecentProjectsFailure(toErrorPayload(err)))
  }
}

// ── SSE worker ────────────────────────────────────────────────────────────────

function* sseWorker(): Generator {
  const channel = (yield call(createSseChannel, '/api/events')) as ReturnType<typeof createSseChannel>

  try {
    while (true) {
      const result = (yield race({
        msg:  take(channel),
        stop: take(SSE_DISCONNECT)
      })) as { msg?: SseMessage; stop?: unknown }

      if (result.stop) break

      if (result.msg) {
        yield put(actions.sseEvent({
          type:      result.msg.type,
          data:      result.msg.data,
          timestamp: Date.now()
        }))
      }
    }
  } finally {
    channel.close()
    yield put(actions.sseDisconnect())
  }
}

// ── Root watcher ──────────────────────────────────────────────────────────────

export default function* homePageSaga(): Generator {
  yield takeLatest(FETCH_STATUS, fetchStatusWorker)
  // takeLatest cancels any running sseWorker first, triggering its
  // finally block which closes the channel before opening a new one.
  yield takeLatest(SSE_CONNECT, sseWorker)
  // takeLeading: ignore extra dispatches while a create is in flight.
  // Prevents double-clicks from racing two POSTs against a non-idempotent
  // backend endpoint.
  yield takeLeading(CREATE_PROJECT, createProjectWorker)
  yield takeLatest(FETCH_RECENT_PROJECTS, fetchRecentProjectsWorker)
  // takeEvery: each row's delete runs independently so multiple rows can be
  // deleted concurrently without queueing.
  yield takeEvery(DELETE_PROJECT, deleteProjectWorker)
}
