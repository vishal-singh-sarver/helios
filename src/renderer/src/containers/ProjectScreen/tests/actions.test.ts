import * as actions from '../actions'
import {
  ADD_COLUMN_REQUESTED,
  ADD_COLUMN_SUCCEEDED,
  ADD_ROW_REQUESTED,
  ADD_ROW_SUCCEEDED,
  LOAD_DATA_TYPES_FAILED,
  LOAD_DATA_TYPES_REQUESTED,
  LOAD_DATA_TYPES_SUCCEEDED,
  LOAD_SCENARIO_REQUESTED,
  LOAD_SCENARIO_SUCCEEDED,
  SET_ACTIVE_SCENARIO,
  SET_ALL_ROWS_SELECTION,
  SET_ROW_SELECTION,
  UPDATE_CELL_FAILED,
  UPDATE_CELL_LOCAL,
  UPDATE_CELL_REQUESTED,
  UPDATE_CELL_SUCCEEDED,
  UPLOAD_FILE_SUCCEEDED
} from '../constants'
import type { ColumnDef, DataTypeDef, LoadedScenarioPayload } from '../types'

const SCN = 'scenario-1'

describe('ProjectScreen action creators', () => {
  it('loadDataTypesRequested', () => {
    expect(actions.loadDataTypesRequested()).toEqual({ type: LOAD_DATA_TYPES_REQUESTED })
  })

  it('loadDataTypesSucceeded carries the registry payload', () => {
    const payload: DataTypeDef[] = [
      {
        id: 'x',
        displayName: 'X',
        description: '',
        scope: 'column',
        kind: 'number',
        units: [],
        canonicalUnit: null,
        defaultUnit: null
      }
    ]
    expect(actions.loadDataTypesSucceeded(payload)).toEqual({
      type: LOAD_DATA_TYPES_SUCCEEDED,
      payload
    })
  })

  it('loadDataTypesFailed carries the error string', () => {
    expect(actions.loadDataTypesFailed('boom')).toEqual({
      type: LOAD_DATA_TYPES_FAILED,
      payload: 'boom'
    })
  })

  it('setActiveScenario carries scenarioId', () => {
    expect(actions.setActiveScenario(SCN)).toEqual({
      type: SET_ACTIVE_SCENARIO,
      payload: { scenarioId: SCN }
    })
  })

  it('loadScenarioRequested carries scenarioId', () => {
    expect(actions.loadScenarioRequested(SCN)).toEqual({
      type: LOAD_SCENARIO_REQUESTED,
      payload: { scenarioId: SCN }
    })
  })

  it('loadScenarioSucceeded passes through the payload', () => {
    const payload: LoadedScenarioPayload = { scenarioId: SCN, columns: [], rows: [] }
    expect(actions.loadScenarioSucceeded(payload)).toEqual({
      type: LOAD_SCENARIO_SUCCEEDED,
      payload
    })
  })

  it('uploadFileSucceeded carries scenarioId', () => {
    expect(actions.uploadFileSucceeded(SCN)).toEqual({
      type: UPLOAD_FILE_SUCCEEDED,
      payload: { scenarioId: SCN }
    })
  })

  it('addRowRequested carries date, time, columnIds and numberOfRows', () => {
    expect(
      actions.addRowRequested(SCN, '2026-04-27', '10:00', ['col_datetime', 'col_1'], 5)
    ).toEqual({
      type: ADD_ROW_REQUESTED,
      payload: {
        scenarioId: SCN,
        date: '2026-04-27',
        time: '10:00',
        columnIds: ['col_datetime', 'col_1'],
        numberOfRows: 5
      }
    })
  })

  it('addRowSucceeded carries scenarioId and merged rows', () => {
    const rows = [{ col_datetime: '2026-04-27 10:00', col_1: '22.5' }]
    expect(actions.addRowSucceeded(SCN, rows)).toEqual({
      type: ADD_ROW_SUCCEEDED,
      payload: { scenarioId: SCN, rows }
    })
  })

  it('addColumnRequested carries the API payload', () => {
    expect(
      actions.addColumnRequested(SCN, 'air_humidity', 'humidity', 'percent', '65')
    ).toEqual({
      type: ADD_COLUMN_REQUESTED,
      payload: {
        scenarioId: SCN,
        name: 'air_humidity',
        dataTypeId: 'humidity',
        dataUnitId: 'percent',
        defaultValue: '65'
      }
    })
  })

  it('addColumnSucceeded carries the new column metadata + back-fill value', () => {
    const column: ColumnDef = {
      id: 'col_humidity',
      name: 'air_humidity',
      unit: '%',
      datatype: 'humidity'
    }
    expect(actions.addColumnSucceeded(SCN, column, '65')).toEqual({
      type: ADD_COLUMN_SUCCEEDED,
      payload: { scenarioId: SCN, column, defaultValue: '65' }
    })
  })

  it('updateCellLocal carries the optimistic-edit payload', () => {
    const payload = {
      scenarioId: SCN,
      rowId: 'row_0',
      colId: 'col_1',
      value: '1.0',
      validationError: null
    }
    expect(actions.updateCellLocal(payload)).toEqual({ type: UPDATE_CELL_LOCAL, payload })
  })

  it('updateCellRequested / Succeeded / Failed carry the cell coordinates', () => {
    expect(actions.updateCellRequested(SCN, 'row_0', 'col_1')).toEqual({
      type: UPDATE_CELL_REQUESTED,
      payload: { scenarioId: SCN, rowId: 'row_0', colId: 'col_1' }
    })
    expect(actions.updateCellSucceeded(SCN, 'row_0', 'col_1')).toEqual({
      type: UPDATE_CELL_SUCCEEDED,
      payload: { scenarioId: SCN, rowId: 'row_0', colId: 'col_1' }
    })
    expect(actions.updateCellFailed(SCN, 'row_0', 'col_1', 'rejected')).toEqual({
      type: UPDATE_CELL_FAILED,
      payload: { scenarioId: SCN, rowId: 'row_0', colId: 'col_1', error: 'rejected' }
    })
  })

  it('selection actions carry their flags', () => {
    expect(actions.setRowSelection(SCN, 'row_5', true)).toEqual({
      type: SET_ROW_SELECTION,
      payload: { scenarioId: SCN, rowId: 'row_5', selected: true }
    })
    expect(actions.setAllRowsSelection(SCN, false)).toEqual({
      type: SET_ALL_ROWS_SELECTION,
      payload: { scenarioId: SCN, selected: false }
    })
  })
})
