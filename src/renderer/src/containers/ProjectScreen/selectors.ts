import { createSelector } from 'reselect'
import type { RootState } from 'store/reducers'
import { initialState, type ProjectScreenState } from './reducer'

// ── Domain ─────────────────────────────────────────────────────────────────────

const selectProjectScreenDomain = (state: RootState): ProjectScreenState =>
  (state as { projectScreen?: ProjectScreenState }).projectScreen ?? initialState

// ── Memoised selectors ─────────────────────────────────────────────────────────

export const selectCoordinates = createSelector(
  selectProjectScreenDomain,
  (s) => s.coordinates
)

export const selectLatitude = createSelector(selectCoordinates, (c) => c.latitude)
export const selectLongitude = createSelector(selectCoordinates, (c) => c.longitude)
export const selectUtcOffset = createSelector(selectCoordinates, (c) => c.utcOffset)

// ── Legacy factory (kept for test compatibility) ───────────────────────────────

const makeSelectProjectScreen = (): ReturnType<typeof createSelector> =>
  createSelector(selectProjectScreenDomain, (s) => s)

export default makeSelectProjectScreen
export { selectProjectScreenDomain }
