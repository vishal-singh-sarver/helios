import { call, put, race, take, takeLatest } from 'redux-saga/effects'
import { api } from 'utils/api'
import { createSseChannel } from 'utils/sse'
import type { SseMessage } from 'utils/sse'
import * as actions from './actions'
import {
  CREATE_PROJECT,
  FETCH_RECENT_PROJECTS,
  FETCH_STATUS,
  SSE_CONNECT,
  SSE_DISCONNECT
} from './constants'
import { createProjectRequest, fetchRecentProjectsRequest } from './service'
import type { AppStatus, CreateProjectResponse, RecentProjectsResponse } from './types'

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
    const response = (yield call(createProjectRequest, action.payload)) as CreateProjectResponse
    yield put(actions.createProjectSuccess(response))
    // Refresh the Recent Projects list so the table reflects the new row
    // without the component having to orchestrate a follow-up dispatch.
    yield put(actions.fetchRecentProjects())
  } catch (err) {
    yield put(actions.createProjectFailure((err as Error).message))
  }
}

// ── Recent projects worker ────────────────────────────────────────────────────

export function* fetchRecentProjectsWorker(): Generator {
  try {
    const response = (yield call(fetchRecentProjectsRequest)) as RecentProjectsResponse
    yield put(actions.fetchRecentProjectsSuccess(response.projects))
  } catch (err) {
    yield put(actions.fetchRecentProjectsFailure((err as Error).message))
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
  yield takeLatest(CREATE_PROJECT, createProjectWorker)
  yield takeLatest(FETCH_RECENT_PROJECTS, fetchRecentProjectsWorker)
}
