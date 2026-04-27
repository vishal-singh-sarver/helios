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
  selectActiveScenarioGrid,
  selectActiveScenarioId,
  selectAllDataTypes,
  selectAllRowsSelected,
  selectColumnDataTypes,
  selectColumnOrder,
  selectColumns,
  selectDataTypesLoadStatus,
  selectLoadStatus,
  selectProjectScreenDomain,
  selectRowOrder,
  selectScenarioDataTypes
} from '../selectors'
import type { DataTypeDef, LoadedScenarioPayload } from '../types'

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

const samplePayload: LoadedScenarioPayload = {
  scenarioId: SCN,
  columns: [
    { id: 'date', name: 'Date', dataTypeId: 'date', unitId: null },
    { id: 'time', name: 'Time', dataTypeId: 'time', unitId: null },
    { id: 'air_temperature', name: 'Air Temperature', dataTypeId: 'air_temperature', unitId: 'kelvin' }
  ],
  rows: [
    { date: '2026-04-27', time: '10:00:00', values: { air_temperature: '293.1' } },
    { date: '2026-04-27', time: '11:00:00', values: { air_temperature: '294.2' } }
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

describe('grid selectors', () => {
  it('selectActiveScenarioId reflects the active id', () => {
    expect(selectActiveScenarioId(wrap(buildLoadedState()))).toBe(SCN)
  })

  it('selectActiveScenarioGrid returns the loaded grid', () => {
    const grid = selectActiveScenarioGrid(wrap(buildLoadedState()))
    expect(grid?.rowOrder).toEqual([0, 1])
  })

  it('selectColumns / selectColumnOrder reflect the loaded data', () => {
    const root = wrap(buildLoadedState())
    expect(selectColumnOrder(root)).toEqual(['date', 'time', 'air_temperature'])
    expect(selectColumns(root).air_temperature.unitId).toBe('kelvin')
  })

  it('selectRowOrder reflects rowOrder', () => {
    expect(selectRowOrder(wrap(buildLoadedState()))).toEqual([0, 1])
  })

  it('selectLoadStatus is loaded after a successful load', () => {
    expect(selectLoadStatus(wrap(buildLoadedState()))).toBe('loaded')
  })
})

describe('per-cell factories', () => {
  it('makeSelectCellValue reads the correct cell', () => {
    const sel = makeSelectCellValue(0, 'air_temperature')
    expect(sel(wrap(buildLoadedState()))).toBe('293.1')
  })

  it('makeSelectCellSync defaults to idle', () => {
    const sel = makeSelectCellSync(0, 'air_temperature')
    expect(sel(wrap(buildLoadedState()))).toBe('idle')
  })

  it('makeSelectCellSync reflects pending after optimistic edit', () => {
    let state = buildLoadedState()
    state = projectScreenReducer(
      state,
      actions.updateCellLocal({
        scenarioId: SCN,
        rowId: 0,
        colId: 'air_temperature',
        value: '300.0',
        validationError: null
      })
    )
    const sel = makeSelectCellSync(0, 'air_temperature')
    expect(sel(wrap(state))).toBe('pending')
  })

  it('makeSelectCellError prefers validation error over server error', () => {
    let state = buildLoadedState()
    state = projectScreenReducer(
      state,
      actions.updateCellLocal({
        scenarioId: SCN,
        rowId: 0,
        colId: 'air_temperature',
        value: 'NaN',
        validationError: 'must be number'
      })
    )
    state = projectScreenReducer(
      state,
      actions.updateCellFailed(SCN, 0, 'air_temperature', 'server says no')
    )
    const sel = makeSelectCellError(0, 'air_temperature')
    expect(sel(wrap(state))).toBe('must be number')
  })

  it('makeSelectCellError falls back to server error when no validation error', () => {
    let state = buildLoadedState()
    state = projectScreenReducer(
      state,
      actions.updateCellFailed(SCN, 0, 'air_temperature', 'server says no')
    )
    const sel = makeSelectCellError(0, 'air_temperature')
    expect(sel(wrap(state))).toBe('server says no')
  })
})

describe('selection selectors', () => {
  it('selectAllRowsSelected is false when at least one row unselected', () => {
    let state = buildLoadedState()
    state = projectScreenReducer(state, actions.setRowSelection(SCN, 0, true))
    expect(selectAllRowsSelected(wrap(state))).toBe(false)
  })

  it('selectAllRowsSelected is true after SET_ALL_ROWS_SELECTION(true)', () => {
    let state = buildLoadedState()
    state = projectScreenReducer(state, actions.setAllRowsSelection(SCN, true))
    expect(selectAllRowsSelected(wrap(state))).toBe(true)
  })

  it('makeSelectRowSelected reflects per-row state', () => {
    let state = buildLoadedState()
    state = projectScreenReducer(state, actions.setRowSelection(SCN, 1, true))
    expect(makeSelectRowSelected(0)(wrap(state))).toBe(false)
    expect(makeSelectRowSelected(1)(wrap(state))).toBe(true)
  })
})
