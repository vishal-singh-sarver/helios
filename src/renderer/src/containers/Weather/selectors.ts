import { createSelector } from 'reselect'
import type { RootState } from 'store/reducers'
import { initialState, type WeatherState } from './reducer'

// ── Domain ─────────────────────────────────────────────────────────────────────

const selectWeatherDomain = (state: RootState): WeatherState =>
  (state as RootState & { weather?: WeatherState }).weather ?? initialState

// ── Memoised selectors ─────────────────────────────────────────────────────────

export const selectStatus = createSelector(selectWeatherDomain, (s) => s.status)
export const selectLoading = createSelector(selectWeatherDomain, (s) => s.loading)
export const selectError = createSelector(selectWeatherDomain, (s) => s.error)
export const selectStreaming = createSelector(selectWeatherDomain, (s) => s.streaming)
export const selectStreamLog = createSelector(selectWeatherDomain, (s) => s.streamLog)

// Import — file pick
export const selectFileLoading = createSelector(selectWeatherDomain, (s) => s.fileLoading)
export const selectFileError = createSelector(selectWeatherDomain, (s) => s.fileError)
export const selectPickedFile = createSelector(selectWeatherDomain, (s) => s.pickedFile)

// Import — finalize
export const selectImporting = createSelector(selectWeatherDomain, (s) => s.importing)
export const selectImportError = createSelector(selectWeatherDomain, (s) => s.importError)
export const selectDataset = createSelector(selectWeatherDomain, (s) => s.dataset)

// ── Legacy factory (kept for test compatibility) ───────────────────────────────

const makeSelectWeather = () => createSelector(selectWeatherDomain, (s) => s)

export default makeSelectWeather
export { selectWeatherDomain as selectWeatherDomain }
