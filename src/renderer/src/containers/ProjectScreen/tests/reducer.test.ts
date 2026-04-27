import projectScreenReducer, { initialState } from '../reducer'
import * as actions from '../actions'
import { cellKey, type ColumnDef, type DataTypeDef, type LoadedScenarioPayload } from '../types'

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
    it('SET_ACTIVE_SCENARIO sets id and initializes an empty table if absent', () => {
      const result = projectScreenReducer(initialState, actions.setActiveScenario(SCN))
      expect(result.activeScenarioId).toBe(SCN)
      expect(result.byScenario[SCN]).toBeDefined()
      expect(result.byScenario[SCN].rowOrder).toEqual([])
    })

    it('SET_ACTIVE_SCENARIO leaves an existing table untouched', () => {
      const loaded = projectScreenReducer(initialState, actions.loadScenarioSucceeded(samplePayload))
      const result = projectScreenReducer(loaded, actions.setActiveScenario(SCN))
      expect(result.byScenario[SCN].rowOrder).toHaveLength(2)
    })
  })

  describe('scenario load', () => {
    it('LOAD_SCENARIO_SUCCEEDED populates columns / rows in insert order with row_${i} ids', () => {
      const result = projectScreenReducer(initialState, actions.loadScenarioSucceeded(samplePayload))
      const table = result.byScenario[SCN]

      expect(table.columnOrder).toEqual(['col_datetime', 'col_air_temperature'])
      expect(table.rowOrder).toEqual(['row_0', 'row_1'])
      expect(table.rows.row_0).toEqual({
        col_datetime: '2026-04-27 10:00:00',
        col_air_temperature: '293.1'
      })
      expect(table.columns.col_air_temperature.unit).toBe('K')
    })
  })

  describe('upload', () => {
    it('UPLOAD_FILE_SUCCEEDED clears the table for the follow-up fetch', () => {
      const loaded = projectScreenReducer(initialState, actions.loadScenarioSucceeded(samplePayload))
      const result = projectScreenReducer(loaded, actions.uploadFileSucceeded(SCN))
      const table = result.byScenario[SCN]

      expect(table.rowOrder).toEqual([])
      expect(table.columnOrder).toEqual([])
    })
  })

  describe('add row', () => {
    it('ADD_ROW_SUCCEEDED appends new rows with row_${idx} ids continuing from rowOrder.length', () => {
      const loaded = projectScreenReducer(initialState, actions.loadScenarioSucceeded(samplePayload))
      const result = projectScreenReducer(
        loaded,
        actions.addRowSucceeded(SCN, [
          { col_datetime: '2026-04-27 12:00:00', col_air_temperature: '295.0' }
        ])
      )
      const table = result.byScenario[SCN]

      expect(table.rowOrder).toEqual(['row_0', 'row_1', 'row_2'])
      expect(table.rows.row_2).toEqual({
        col_datetime: '2026-04-27 12:00:00',
        col_air_temperature: '295.0'
      })
    })
  })

  describe('add column', () => {
    it('ADD_COLUMN_SUCCEEDED appends column and back-fills defaultValue across rows', () => {
      const loaded = projectScreenReducer(initialState, actions.loadScenarioSucceeded(samplePayload))
      const newColumn: ColumnDef = {
        id: 'col_humidity',
        name: 'air_humidity',
        unit: '%',
        datatype: 'air_humidity'
      }
      const result = projectScreenReducer(
        loaded,
        actions.addColumnSucceeded(SCN, newColumn, '65')
      )
      const table = result.byScenario[SCN]

      expect(table.columnOrder).toContain('col_humidity')
      expect(table.columns.col_humidity).toEqual(newColumn)
      expect(table.rows.row_0.col_humidity).toBe('65')
      expect(table.rows.row_1.col_humidity).toBe('65')
    })
  })

  describe('cell edit', () => {
    it('UPDATE_CELL_LOCAL with no validation error writes value and marks pending', () => {
      const loaded = projectScreenReducer(initialState, actions.loadScenarioSucceeded(samplePayload))
      const result = projectScreenReducer(
        loaded,
        actions.updateCellLocal({
          scenarioId: SCN,
          rowId: 'row_0',
          colId: 'col_air_temperature',
          value: '300.0',
          validationError: null
        })
      )
      const table = result.byScenario[SCN]

      expect(table.rows.row_0.col_air_temperature).toBe('300.0')
      expect(table.cellSync[cellKey('row_0', 'col_air_temperature')]).toBe('pending')
      expect(table.validationErrors.row_0?.col_air_temperature).toBeUndefined()
    })

    it('UPDATE_CELL_LOCAL with a validation error writes value + error, no pending sync', () => {
      const loaded = projectScreenReducer(initialState, actions.loadScenarioSucceeded(samplePayload))
      const result = projectScreenReducer(
        loaded,
        actions.updateCellLocal({
          scenarioId: SCN,
          rowId: 'row_0',
          colId: 'col_air_temperature',
          value: 'NaN',
          validationError: 'Must be a number'
        })
      )
      const table = result.byScenario[SCN]

      expect(table.rows.row_0.col_air_temperature).toBe('NaN')
      expect(table.validationErrors.row_0.col_air_temperature).toBe('Must be a number')
      expect(table.cellSync[cellKey('row_0', 'col_air_temperature')]).toBeUndefined()
    })

    it('UPDATE_CELL_SUCCEEDED clears sync state for the cell', () => {
      const loaded = projectScreenReducer(initialState, actions.loadScenarioSucceeded(samplePayload))
      const pending = projectScreenReducer(
        loaded,
        actions.updateCellLocal({
          scenarioId: SCN,
          rowId: 'row_0',
          colId: 'col_air_temperature',
          value: '300.0',
          validationError: null
        })
      )
      const result = projectScreenReducer(
        pending,
        actions.updateCellSucceeded(SCN, 'row_0', 'col_air_temperature')
      )
      expect(
        result.byScenario[SCN].cellSync[cellKey('row_0', 'col_air_temperature')]
      ).toBeUndefined()
    })

    it('UPDATE_CELL_FAILED marks cellSync as error', () => {
      const loaded = projectScreenReducer(initialState, actions.loadScenarioSucceeded(samplePayload))
      const result = projectScreenReducer(
        loaded,
        actions.updateCellFailed(SCN, 'row_0', 'col_air_temperature', 'rejected by backend')
      )
      const table = result.byScenario[SCN]

      expect(table.cellSync[cellKey('row_0', 'col_air_temperature')]).toBe('error')
    })
  })

  describe('selection', () => {
    it('SET_ROW_SELECTION toggles one row', () => {
      const loaded = projectScreenReducer(initialState, actions.loadScenarioSucceeded(samplePayload))
      const result = projectScreenReducer(loaded, actions.setRowSelection(SCN, 'row_1', true))
      expect(result.byScenario[SCN].rowSelection.row_1).toBe(true)
      expect(result.byScenario[SCN].rowSelection.row_0).toBeUndefined()
    })

    it('SET_ALL_ROWS_SELECTION toggles every visible row', () => {
      const loaded = projectScreenReducer(initialState, actions.loadScenarioSucceeded(samplePayload))
      const result = projectScreenReducer(loaded, actions.setAllRowsSelection(SCN, true))
      expect(result.byScenario[SCN].rowSelection).toEqual({ row_0: true, row_1: true })
    })
  })
})
