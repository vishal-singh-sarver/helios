import type { RootState } from 'store/reducers'
import { initialState } from '../reducer'
import projectScreenReducer from '../reducer'
import * as actions from '../actions'
import {
  makeSelectCellError,
  makeSelectCellSync,
  makeSelectCellValue,
  makeSelectDataType,
  makeSelectRowSelected,
  selectActiveScenarioId,
  selectActiveWeatherTable,
  selectAllDataTypes,
  selectAllRowsSelected,
  selectColumnDataTypes,
  selectColumnOrder,
  selectColumns,
  selectDataTypesLoadStatus,
  selectProjectScreenDomain,
  selectRowOrder,
  selectScenarioDataTypes
} from '../selectors'
import type { ColumnDef, DataTypeDef, LoadedScenarioPayload } from '../types'

const SCN = 'scenario-1'

const wrap = (projectScreen: typeof initialState): RootState =>
  ({ navigation: { screen: 'project' }, projectScreen }) as RootState

const sampleTypes: DataTypeDef[] = [
  {
    id: 'air_temperature',
    displayName: 'Air Temperature',
    description: '',
    scope: 'column',
    kind: 'number',
    units: [],
    canonicalUnit: null,
    defaultUnit: null
  },
  {
    id: 'utc_offset',
    displayName: 'UTC Offset',
    description: '',
    scope: 'scenario',
    kind: 'number',
    units: [],
    canonicalUnit: null,
    defaultUnit: null
  }
]

const sampleColumns: ColumnDef[] = [
  { id: 'col_datetime', name: 'date_time', unit: null, datatype: null },
  { id: 'col_air_temperature', name: 'air_temperature', unit: 'K', datatype: 'air_temperature' }
]

const samplePayload: LoadedScenarioPayload = {
  scenarioId: SCN,
  columns: sampleColumns,
  rows: [
    { col_datetime: '2026-04-27 10:00:00', col_air_temperature: '293.1' },
    { col_datetime: '2026-04-27 11:00:00', col_air_temperature: '294.2' }
  ]
}

const buildLoadedState = () => {
  let state = initialState
  state = projectScreenReducer(state, actions.loadDataTypesSucceeded(sampleTypes))
  state = projectScreenReducer(state, actions.setActiveScenario(SCN))
  state = projectScreenReducer(state, actions.loadScenarioSucceeded(samplePayload))
  return state
}

describe('selectProjectScreenDomain', () => {
  it('returns initialState when slice is absent', () => {
    expect(selectProjectScreenDomain({ navigation: { screen: 'project' } } as RootState)).toEqual(
      initialState
    )
  })
})

describe('data-type selectors', () => {
  it('selectAllDataTypes returns every type in registry order', () => {
    const root = wrap(buildLoadedState())
    expect(selectAllDataTypes(root).map((d) => d.id)).toEqual([
      'air_temperature',
      'utc_offset'
    ])
  })

  it('selectColumnDataTypes filters by scope=column', () => {
    expect(selectColumnDataTypes(wrap(buildLoadedState())).map((d) => d.id)).toEqual([
      'air_temperature'
    ])
  })

  it('selectScenarioDataTypes filters by scope=scenario', () => {
    expect(selectScenarioDataTypes(wrap(buildLoadedState())).map((d) => d.id)).toEqual([
      'utc_offset'
    ])
  })

  it('selectDataTypesLoadStatus reflects the slice status', () => {
    expect(selectDataTypesLoadStatus(wrap(buildLoadedState()))).toBe('loaded')
  })

  it('makeSelectDataType returns the right def by id', () => {
    const sel = makeSelectDataType('utc_offset')
    expect(sel(wrap(buildLoadedState()))?.scope).toBe('scenario')
  })
})

describe('weather-table selectors', () => {
  it('selectActiveScenarioId reflects the active id', () => {
    expect(selectActiveScenarioId(wrap(buildLoadedState()))).toBe(SCN)
  })

  it('selectActiveWeatherTable returns the loaded table', () => {
    const table = selectActiveWeatherTable(wrap(buildLoadedState()))
    expect(table?.rowOrder).toEqual(['row_0', 'row_1'])
  })

  it('selectColumns / selectColumnOrder reflect the loaded data', () => {
    const root = wrap(buildLoadedState())
    expect(selectColumnOrder(root)).toEqual(['col_datetime', 'col_air_temperature'])
    expect(selectColumns(root).col_air_temperature.unit).toBe('K')
  })

  it('selectRowOrder reflects rowOrder', () => {
    expect(selectRowOrder(wrap(buildLoadedState()))).toEqual(['row_0', 'row_1'])
  })
})

describe('per-cell factories', () => {
  it('makeSelectCellValue reads the correct cell', () => {
    const sel = makeSelectCellValue('row_0', 'col_air_temperature')
    expect(sel(wrap(buildLoadedState()))).toBe('293.1')
  })

  it('makeSelectCellSync defaults to idle', () => {
    const sel = makeSelectCellSync('row_0', 'col_air_temperature')
    expect(sel(wrap(buildLoadedState()))).toBe('idle')
  })

  it('makeSelectCellSync reflects pending after optimistic edit', () => {
    let state = buildLoadedState()
    state = projectScreenReducer(
      state,
      actions.updateCellLocal({
        scenarioId: SCN,
        rowId: 'row_0',
        colId: 'col_air_temperature',
        value: '300.0',
        validationError: null
      })
    )
    const sel = makeSelectCellSync('row_0', 'col_air_temperature')
    expect(sel(wrap(state))).toBe('pending')
  })

  it('makeSelectCellError surfaces validation errors', () => {
    let state = buildLoadedState()
    state = projectScreenReducer(
      state,
      actions.updateCellLocal({
        scenarioId: SCN,
        rowId: 'row_0',
        colId: 'col_air_temperature',
        value: 'NaN',
        validationError: 'must be number'
      })
    )
    const sel = makeSelectCellError('row_0', 'col_air_temperature')
    expect(sel(wrap(state))).toBe('must be number')
  })

  it('makeSelectCellError returns null when no validation error', () => {
    const sel = makeSelectCellError('row_0', 'col_air_temperature')
    expect(sel(wrap(buildLoadedState()))).toBeNull()
  })
})

describe('selection selectors', () => {
  it('selectAllRowsSelected is true after a fresh scenario load', () => {
    expect(selectAllRowsSelected(wrap(buildLoadedState()))).toBe(true)
  })

  it('selectAllRowsSelected is false when at least one row unselected', () => {
    let state = buildLoadedState()
    state = projectScreenReducer(state, actions.setRowSelection(SCN, 'row_0', false))
    expect(selectAllRowsSelected(wrap(state))).toBe(false)
  })

  it('selectAllRowsSelected is true after SET_ALL_ROWS_SELECTION(true)', () => {
    let state = buildLoadedState()
    state = projectScreenReducer(state, actions.setAllRowsSelection(SCN, true))
    expect(selectAllRowsSelected(wrap(state))).toBe(true)
  })

  it('makeSelectRowSelected reflects per-row state', () => {
    let state = buildLoadedState()
    state = projectScreenReducer(state, actions.setRowSelection(SCN, 'row_0', false))
    expect(makeSelectRowSelected('row_0')(wrap(state))).toBe(false)
    expect(makeSelectRowSelected('row_1')(wrap(state))).toBe(true)
  })
})
