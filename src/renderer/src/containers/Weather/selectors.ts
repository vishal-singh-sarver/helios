import { createSelector } from 'reselect'
import type { RootState } from 'store/reducers'
import { initialState, type WeatherState } from './reducer'

// ── Domain ─────────────────────────────────────────────────────────────────────

const selectWeatherDomain = (state: RootState): WeatherState =>
  (state as any).weather ?? initialState

// ── Memoised selectors ─────────────────────────────────────────────────────────

export const selectStatus = createSelector(selectWeatherDomain, (s) => s.status)
export const selectLoading = createSelector(selectWeatherDomain, (s) => s.loading)
export const selectError = createSelector(selectWeatherDomain, (s) => s.error)
export const selectStreaming = createSelector(selectWeatherDomain, (s) => s.streaming)
export const selectStreamLog = createSelector(selectWeatherDomain, (s) => s.streamLog)

// ── Legacy factory (kept for test compatibility) ───────────────────────────────

const makeSelectWeather = () => createSelector(selectWeatherDomain, (s) => s)

export default makeSelectWeather
export { selectWeatherDomain as selectWeatherDomain }
