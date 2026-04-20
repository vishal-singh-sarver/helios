import { createSelector } from 'reselect'
import type { RootState } from 'store/reducers'
import { initialState, type CenterWorkspaceState } from './reducer'

// ── Domain ─────────────────────────────────────────────────────────────────────

const selectCenterWorkspaceDomain = (state: RootState): CenterWorkspaceState =>
  (state as any).centerWorkspace ?? initialState

// ── Memoised selectors ─────────────────────────────────────────────────────────

export const selectStatus = createSelector(selectCenterWorkspaceDomain, (s) => s.status)
export const selectLoading = createSelector(selectCenterWorkspaceDomain, (s) => s.loading)
export const selectError = createSelector(selectCenterWorkspaceDomain, (s) => s.error)
export const selectStreaming = createSelector(selectCenterWorkspaceDomain, (s) => s.streaming)
export const selectStreamLog = createSelector(selectCenterWorkspaceDomain, (s) => s.streamLog)

// ── Legacy factory (kept for test compatibility) ───────────────────────────────

const makeSelectCenterWorkspace = () => createSelector(selectCenterWorkspaceDomain, (s) => s)

export default makeSelectCenterWorkspace
export { selectCenterWorkspaceDomain as selectCenterWorkspaceDomain }
