import { createSelector } from 'reselect'
import type { RootState } from 'store/reducers'
import { initialState, type RightPanelState } from './reducer'

// ── Domain ─────────────────────────────────────────────────────────────────────

const selectRightPanelDomain = (state: RootState): RightPanelState =>
  (state as any).rightPanel ?? initialState

// ── Memoised selectors ─────────────────────────────────────────────────────────

export const selectStatus = createSelector(selectRightPanelDomain, (s) => s.status)
export const selectLoading = createSelector(selectRightPanelDomain, (s) => s.loading)
export const selectError = createSelector(selectRightPanelDomain, (s) => s.error)
export const selectStreaming = createSelector(selectRightPanelDomain, (s) => s.streaming)
export const selectStreamLog = createSelector(selectRightPanelDomain, (s) => s.streamLog)

// ── Legacy factory (kept for test compatibility) ───────────────────────────────

const makeSelectRightPanel = () => createSelector(selectRightPanelDomain, (s) => s)

export default makeSelectRightPanel
export { selectRightPanelDomain as selectRightPanelDomain }
