import { createSelector } from 'reselect'
import type { RootState } from 'store/reducers'
import { initialState, type LeftPanelState } from './reducer'

// ── Domain ─────────────────────────────────────────────────────────────────────

const selectLeftPanelDomain = (state: RootState): LeftPanelState =>
  (state as any).leftPanel ?? initialState

// ── Memoised selectors ─────────────────────────────────────────────────────────

export const selectStatus = createSelector(selectLeftPanelDomain, (s) => s.status)
export const selectLoading = createSelector(selectLeftPanelDomain, (s) => s.loading)
export const selectError = createSelector(selectLeftPanelDomain, (s) => s.error)
export const selectStreaming = createSelector(selectLeftPanelDomain, (s) => s.streaming)
export const selectStreamLog = createSelector(selectLeftPanelDomain, (s) => s.streamLog)

// ── Legacy factory (kept for test compatibility) ───────────────────────────────

const makeSelectLeftPanel = () => createSelector(selectLeftPanelDomain, (s) => s)

export default makeSelectLeftPanel
export { selectLeftPanelDomain as selectLeftPanelDomain }
