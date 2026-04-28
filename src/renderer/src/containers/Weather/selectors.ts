import { createSelector } from 'reselect'
import type { RootState } from 'store/reducers'
import { initialState, type WeatherState } from './reducer'

// ── Domain ─────────────────────────────────────────────────────────────────────

const selectWeatherDomain = (state: RootState): WeatherState =>
  (state as any).weather ?? initialState

// ── Memoised selectors (legacy SSE / status — leave untouched) ─────────────────

export const selectStatus = createSelector(selectWeatherDomain, (s) => s.status)
export const selectLoading = createSelector(selectWeatherDomain, (s) => s.loading)
export const selectError = createSelector(selectWeatherDomain, (s) => s.error)
export const selectStreaming = createSelector(selectWeatherDomain, (s) => s.streaming)
export const selectStreamLog = createSelector(selectWeatherDomain, (s) => s.streamLog)

// ── Legacy factory (kept for test compatibility) ───────────────────────────────

const makeSelectWeather = () => createSelector(selectWeatherDomain, (s) => s)

export default makeSelectWeather
export { selectWeatherDomain as selectWeatherDomain }

// ── Weather table re-exports ──────────────────────────────────────────────────
//
// The weather table itself lives in state.projectScreen (ScenarioGrid →
// WeatherTable). Re-export the active-table selectors here so Weather
// components can consume them without crossing container boundaries
// directly. See containers/ProjectScreen/selectors.ts for the source.

export {
  makeSelectCellError,
  makeSelectCellSync,
  makeSelectCellValue,
  makeSelectDataType,
  makeSelectDataUnitsForType,
  makeSelectHeadersForScenario,
  makeSelectHeadersLoadStatus,
  makeSelectRow,
  makeSelectRowSelected,
  makeSelectUnitSymbol,
  selectActiveHeaders,
  selectActiveProjectId,
  selectActiveScenarioId,
  selectActiveWeatherTable,
  selectAllDataTypes,
  selectAllRowsSelected,
  selectColumnOrder,
  selectColumns,
  selectDataTypesById,
  selectDataTypesError,
  selectDataTypesLoadStatus,
  selectHeadersByScenario,
  selectRowOrder,
  selectRowSelection
} from 'containers/ProjectScreen/selectors'
