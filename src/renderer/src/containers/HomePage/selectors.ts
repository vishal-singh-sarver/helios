import { createSelector } from 'reselect'
import type { RootState } from 'store/reducers'
import { initialState, type HomePageState } from './reducer'

// ── Domain ────────────────────────────────────────────────────────────────────

const selectDomain = (state: RootState): HomePageState =>
  state.homePage ?? initialState

// ── Memoised selectors ────────────────────────────────────────────────────────

export const selectStatus      = createSelector(selectDomain, (s) => s.status)
export const selectLoading     = createSelector(selectDomain, (s) => s.loading)
export const selectError       = createSelector(selectDomain, (s) => s.error)
export const selectStreaming    = createSelector(selectDomain, (s) => s.streaming)
export const selectStreamLog   = createSelector(selectDomain, (s) => s.streamLog)

// ── Create project selectors ──────────────────────────────────────────────────

export const selectCreateProjectLoading = createSelector(selectDomain, (s) => s.createProject.loading)
export const selectCreateProjectError   = createSelector(selectDomain, (s) => s.createProject.error)
export const selectCreateProjectSuccess = createSelector(selectDomain, (s) => s.createProject.success)
export const selectCreateProjectData    = createSelector(selectDomain, (s) => s.createProject.data)

// ── Recent projects selectors ─────────────────────────────────────────────────

export const selectRecentProjectsData    = createSelector(selectDomain, (s) => s.recentProjects.data)
export const selectRecentProjectsLoading = createSelector(selectDomain, (s) => s.recentProjects.loading)
export const selectRecentProjectsError   = createSelector(selectDomain, (s) => s.recentProjects.error)

// ── Delete project selectors ──────────────────────────────────────────────────

export const selectDeletingProjectIds = createSelector(selectDomain, (s) => s.deleteProject.inFlightIds)
export const selectDeleteProjectError = createSelector(selectDomain, (s) => s.deleteProject.error)

// ── Legacy factory (kept for test compatibility) ──────────────────────────────

const makeSelectHomePage = () => createSelector(selectDomain, (s) => s)

export default makeSelectHomePage
export { selectDomain as selectHomePageDomain }
