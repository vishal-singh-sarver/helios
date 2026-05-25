import { createSelector } from 'reselect'
import type { RootState } from 'store/reducers'
import { initialState, type HomePageState } from './reducer'

// ── Domain ────────────────────────────────────────────────────────────────────

const selectDomain = (state: RootState): HomePageState => state.homePage ?? initialState

// ── Grouped selectors ─────────────────────────────────────────────────────────

export const selectCreateProject = createSelector(selectDomain, (s) => s.createProject)
export const selectRecentProjects = createSelector(selectDomain, (s) => s.recentProjects)
export const selectDeleteProject = createSelector(selectDomain, (s) => s.deleteProject)
export const selectRenameProject = createSelector(selectDomain, (s) => s.renameProject)
export const selectStreaming = createSelector(selectDomain, (s) => ({
  streaming: s.streaming,
  streamLog: s.streamLog
}))

// ── Legacy factory (kept for test compatibility) ──────────────────────────────

const makeSelectHomePage = () => createSelector(selectDomain, (s) => s)

export default makeSelectHomePage
export { selectDomain as selectHomePageDomain }
