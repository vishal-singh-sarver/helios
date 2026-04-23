import { createSelector } from 'reselect'
import type { RootState } from 'store/reducers'
import { initialState, type ProjectScreenState } from './reducer'

// ── Domain ─────────────────────────────────────────────────────────────────────

const selectProjectScreenDomain = (state: RootState): ProjectScreenState =>
  (state as any).projectScreen ?? initialState

// ── Memoised selectors ─────────────────────────────────────────────────────────

export const selectStatus    = createSelector(selectProjectScreenDomain, (s) => s.status)
export const selectLoading   = createSelector(selectProjectScreenDomain, (s) => s.loading)
export const selectError     = createSelector(selectProjectScreenDomain, (s) => s.error)
export const selectStreaming  = createSelector(selectProjectScreenDomain, (s) => s.streaming)
export const selectStreamLog = createSelector(selectProjectScreenDomain, (s) => s.streamLog)

// ── Legacy factory (kept for test compatibility) ───────────────────────────────

const makeSelectProjectScreen = () => createSelector(selectProjectScreenDomain, (s) => s)

export default makeSelectProjectScreen
export { selectProjectScreenDomain as selectProjectScreenDomain }
