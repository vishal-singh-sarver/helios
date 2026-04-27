import projectScreenReducer, { initialState } from '../reducer'
import * as actions from '../actions'
import { cellKey, type DataTypeDef, type LoadedScenarioPayload } from '../types'

const SCN = 'scenario-1'

const sampleDataType: DataTypeDef = {
  id: 'air_temperature',
  displayName: 'Air Temperature',
  description: 'Ambient temperature.',
  scope: 'column',
  kind: 'number',
  units: [{ id: 'kelvin', symbol: 'K', min: null, max: null }],
  canonicalUnit: 'kelvin',
  defaultUnit: 'kelvin'
}

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

describe('projectScreenReducer', () => {
  it('returns the initial state', () => {
    expect(projectScreenReducer(undefined, { type: '@@INIT' } as never)).toEqual(initialState)
  })

  describe('data types', () => {
    it('LOAD_DATA_TYPES_REQUESTED sets loading and clears error', () => {
      const seed = {
        ...initialState,
        dataTypes: { ...initialState.dataTypes, loadError: 'prev' }
      }
      const result = projectScreenReducer(seed, actions.loadDataTypesRequested())
      expect(result.dataTypes.loadStatus).toBe('loading')
      expect(result.dataTypes.loadError).toBeNull()
    })

    it('LOAD_DATA_TYPES_SUCCEEDED populates byId and allIds', () => {
      const result = projectScreenReducer(
        initialState,
        actions.loadDataTypesSucceeded([sampleDataType])
      )
      expect(result.dataTypes.byId[sampleDataType.id]).toEqual(sampleDataType)
      expect(result.dataTypes.allIds).toEqual([sampleDataType.id])
      expect(result.dataTypes.loadStatus).toBe('loaded')
    })

    it('LOAD_DATA_TYPES_FAILED stores the error', () => {
      const result = projectScreenReducer(initialState, actions.loadDataTypesFailed('boom'))
      expect(result.dataTypes.loadStatus).toBe('error')
      expect(result.dataTypes.loadError).toBe('boom')
    })
  })

  describe('active scenario', () => {
    it('SET_ACTIVE_SCENARIO sets id and initializes an empty grid if absent', () => {
      const result = projectScreenReducer(initialState, actions.setActiveScenario(SCN))
      expect(result.activeScenarioId).toBe(SCN)
      expect(result.byScenario[SCN]).toBeDefined()
      expect(result.byScenario[SCN].rowOrder).toEqual([])
    })

    it('SET_ACTIVE_SCENARIO leaves an existing grid untouched', () => {
      const loaded = projectScreenReducer(initialState, actions.loadScenarioSucceeded(samplePayload))
      const result = projectScreenReducer(loaded, actions.setActiveScenario(SCN))
      expect(result.byScenario[SCN].rowOrder).toHaveLength(2)
    })
  })

  describe('scenario load', () => {
    it('LOAD_SCENARIO_REQUESTED sets loading on the scenario', () => {
      const result = projectScreenReducer(initialState, actions.loadScenarioRequested(SCN))
      expect(result.byScenario[SCN].loadStatus).toBe('loading')
    })

    it('LOAD_SCENARIO_SUCCEEDED populates rows in insert order with rowKeys', () => {
      const result = projectScreenReducer(initialState, actions.loadScenarioSucceeded(samplePayload))
      const grid = result.byScenario[SCN]

      expect(grid.columnOrder).toEqual(['date', 'time', 'air_temperature'])
      expect(grid.rowOrder).toEqual([0, 1])
      expect(grid.rows[0]).toEqual({
        date: '2026-04-27',
        time: '10:00:00',
        air_temperature: '293.1'
      })
      expect(grid.rowKeys[0]).toEqual({ date: '2026-04-27', time: '10:00:00' })
      expect(grid.nextRowSeq).toBe(2)
      expect(grid.loadStatus).toBe('loaded')
    })

    it('LOAD_SCENARIO_FAILED stores the error on the scenario', () => {
      const result = projectScreenReducer(
        initialState,
        actions.loadScenarioFailed(SCN, 'network')
      )
      expect(result.byScenario[SCN].loadStatus).toBe('error')
      expect(result.byScenario[SCN].loadError).toBe('network')
    })
  })

  describe('upload', () => {
    it('UPLOAD_FILE_SUCCEEDED clears the scenario and sets loading for the follow-up fetch', () => {
      const loaded = projectScreenReducer(initialState, actions.loadScenarioSucceeded(samplePayload))
      const result = projectScreenReducer(loaded, actions.uploadFileSucceeded(SCN))
      const grid = result.byScenario[SCN]

      expect(grid.rowOrder).toEqual([])
      expect(grid.columnOrder).toEqual([])
      expect(grid.loadStatus).toBe('loading')
    })
  })

  describe('add row', () => {
    it('ADD_ROW_SUCCEEDED mints the next rowId and appends it', () => {
      const loaded = projectScreenReducer(initialState, actions.loadScenarioSucceeded(samplePayload))
      const result = projectScreenReducer(
        loaded,
        actions.addRowSucceeded({
          scenarioId: SCN,
          date: '2026-04-27',
          time: '12:00:00',
          values: { air_temperature: '295.0' }
        })
      )
      const grid = result.byScenario[SCN]

      expect(grid.rowOrder).toEqual([0, 1, 2])
      expect(grid.nextRowSeq).toBe(3)
      expect(grid.rows[2]).toEqual({
        date: '2026-04-27',
        time: '12:00:00',
        air_temperature: '295.0'
      })
      expect(grid.rowKeys[2]).toEqual({ date: '2026-04-27', time: '12:00:00' })
    })
  })

  describe('add column', () => {
    it('ADD_COLUMN_SUCCEEDED appends column and writes per-row values', () => {
      const loaded = projectScreenReducer(initialState, actions.loadScenarioSucceeded(samplePayload))
      const result = projectScreenReducer(
        loaded,
        actions.addColumnSucceeded({
          scenarioId: SCN,
          colId: 'humidity',
          name: 'Humidity',
          dataTypeId: 'air_humidity',
          unitId: 'percent',
          values: ['65', '60']
        })
      )
      const grid = result.byScenario[SCN]

      expect(grid.columnOrder).toContain('humidity')
      expect(grid.rows[0].humidity).toBe('65')
      expect(grid.rows[1].humidity).toBe('60')
    })

    it('fills missing per-row values with empty string', () => {
      const loaded = projectScreenReducer(initialState, actions.loadScenarioSucceeded(samplePayload))
      const result = projectScreenReducer(
        loaded,
        actions.addColumnSucceeded({
          scenarioId: SCN,
          colId: 'pressure',
          name: 'Pressure',
          dataTypeId: 'air_pressure',
          unitId: 'pa',
          values: ['101325']
        })
      )
      expect(result.byScenario[SCN].rows[1].pressure).toBe('')
    })
  })

  describe('cell edit', () => {
    it('UPDATE_CELL_LOCAL with no validation error writes value and marks pending', () => {
      const loaded = projectScreenReducer(initialState, actions.loadScenarioSucceeded(samplePayload))
      const result = projectScreenReducer(
        loaded,
        actions.updateCellLocal({
          scenarioId: SCN,
          rowId: 0,
          colId: 'air_temperature',
          value: '300.0',
          validationError: null
        })
      )
      const grid = result.byScenario[SCN]

      expect(grid.rows[0].air_temperature).toBe('300.0')
      expect(grid.cellSync[cellKey(0, 'air_temperature')]).toBe('pending')
      expect(grid.validationErrors[0]?.air_temperature).toBeUndefined()
    })

    it('UPDATE_CELL_LOCAL with a validation error writes value + error, no pending sync', () => {
      const loaded = projectScreenReducer(initialState, actions.loadScenarioSucceeded(samplePayload))
      const result = projectScreenReducer(
        loaded,
        actions.updateCellLocal({
          scenarioId: SCN,
          rowId: 0,
          colId: 'air_temperature',
          value: 'NaN',
          validationError: 'Must be a number'
        })
      )
      const grid = result.byScenario[SCN]

      expect(grid.rows[0].air_temperature).toBe('NaN')
      expect(grid.validationErrors[0].air_temperature).toBe('Must be a number')
      expect(grid.cellSync[cellKey(0, 'air_temperature')]).toBeUndefined()
    })

    it('UPDATE_CELL_SUCCEEDED clears sync state for the cell', () => {
      const loaded = projectScreenReducer(initialState, actions.loadScenarioSucceeded(samplePayload))
      const pending = projectScreenReducer(
        loaded,
        actions.updateCellLocal({
          scenarioId: SCN,
          rowId: 0,
          colId: 'air_temperature',
          value: '300.0',
          validationError: null
        })
      )
      const result = projectScreenReducer(
        pending,
        actions.updateCellSucceeded(SCN, 0, 'air_temperature')
      )
      expect(result.byScenario[SCN].cellSync[cellKey(0, 'air_temperature')]).toBeUndefined()
    })

    it('UPDATE_CELL_FAILED sets error sync state and stores message', () => {
      const loaded = projectScreenReducer(initialState, actions.loadScenarioSucceeded(samplePayload))
      const result = projectScreenReducer(
        loaded,
        actions.updateCellFailed(SCN, 0, 'air_temperature', 'rejected by backend')
      )
      const grid = result.byScenario[SCN]

      expect(grid.cellSync[cellKey(0, 'air_temperature')]).toBe('error')
      expect(grid.cellErrors[cellKey(0, 'air_temperature')]).toBe('rejected by backend')
    })
  })

  describe('selection', () => {
    it('SET_ROW_SELECTION toggles one row', () => {
      const loaded = projectScreenReducer(initialState, actions.loadScenarioSucceeded(samplePayload))
      const result = projectScreenReducer(loaded, actions.setRowSelection(SCN, 1, true))
      expect(result.byScenario[SCN].rowSelection[1]).toBe(true)
      expect(result.byScenario[SCN].rowSelection[0]).toBeUndefined()
    })

    it('SET_ALL_ROWS_SELECTION toggles every visible row', () => {
      const loaded = projectScreenReducer(initialState, actions.loadScenarioSucceeded(samplePayload))
      const result = projectScreenReducer(loaded, actions.setAllRowsSelection(SCN, true))
      expect(result.byScenario[SCN].rowSelection).toEqual({ 0: true, 1: true })
    })
  })
})
