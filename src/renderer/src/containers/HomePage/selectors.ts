import { createSelector } from 'reselect'
import type { RootState } from 'store/reducers'
import { initialState, type HomePageState } from './reducer'

// ── Domain ────────────────────────────────────────────────────────────────────

const selectDomain = (state: RootState): HomePageState =>
  (state as any).homePage ?? initialState

// ── Memoised selectors ────────────────────────────────────────────────────────

export const selectStatus      = createSelector(selectDomain, (s) => s.status)
export const selectLoading     = createSelector(selectDomain, (s) => s.loading)
export const selectError       = createSelector(selectDomain, (s) => s.error)
export const selectStreaming    = createSelector(selectDomain, (s) => s.streaming)
export const selectStreamLog   = createSelector(selectDomain, (s) => s.streamLog)

// ── Legacy factory (kept for test compatibility) ──────────────────────────────

const makeSelectHomePage = () => createSelector(selectDomain, (s) => s)

export default makeSelectHomePage
export { selectDomain as selectHomePageDomain }
