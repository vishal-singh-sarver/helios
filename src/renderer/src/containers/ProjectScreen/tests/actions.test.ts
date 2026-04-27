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
import type { DataTypeDef, LoadedScenarioPayload } from '../types'

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

  it('addRowRequested carries date, time and values', () => {
    expect(actions.addRowRequested(SCN, '2026-04-27', '10:00:00', { x: '1' })).toEqual({
      type: ADD_ROW_REQUESTED,
      payload: { scenarioId: SCN, date: '2026-04-27', time: '10:00:00', values: { x: '1' } }
    })
  })

  it('addRowSucceeded passes through the payload', () => {
    const payload = {
      scenarioId: SCN,
      date: '2026-04-27',
      time: '10:00:00',
      values: { x: '1' }
    }
    expect(actions.addRowSucceeded(payload)).toEqual({ type: ADD_ROW_SUCCEEDED, payload })
  })

  it('addColumnRequested carries column metadata + per-row values', () => {
    expect(actions.addColumnRequested(SCN, 'humidity', 'air_humidity', 'percent', ['1', '2'])).toEqual({
      type: ADD_COLUMN_REQUESTED,
      payload: {
        scenarioId: SCN,
        columnname: 'humidity',
        dataTypeId: 'air_humidity',
        unitId: 'percent',
        values: ['1', '2']
      }
    })
  })

  it('addColumnSucceeded passes through the payload', () => {
    const payload = {
      scenarioId: SCN,
      colId: 'humidity',
      name: 'Humidity',
      dataTypeId: 'air_humidity',
      unitId: 'percent',
      values: ['1', '2']
    }
    expect(actions.addColumnSucceeded(payload)).toEqual({
      type: ADD_COLUMN_SUCCEEDED,
      payload
    })
  })

  it('updateCellLocal carries the optimistic-edit payload', () => {
    const payload = {
      scenarioId: SCN,
      rowId: 0,
      colId: 'x',
      value: '1.0',
      validationError: null
    }
    expect(actions.updateCellLocal(payload)).toEqual({ type: UPDATE_CELL_LOCAL, payload })
  })

  it('updateCellRequested / Succeeded / Failed carry the cell coordinates', () => {
    expect(actions.updateCellRequested(SCN, 0, 'x')).toEqual({
      type: UPDATE_CELL_REQUESTED,
      payload: { scenarioId: SCN, rowId: 0, colId: 'x' }
    })
    expect(actions.updateCellSucceeded(SCN, 0, 'x')).toEqual({
      type: UPDATE_CELL_SUCCEEDED,
      payload: { scenarioId: SCN, rowId: 0, colId: 'x' }
    })
    expect(actions.updateCellFailed(SCN, 0, 'x', 'rejected')).toEqual({
      type: UPDATE_CELL_FAILED,
      payload: { scenarioId: SCN, rowId: 0, colId: 'x', error: 'rejected' }
    })
  })

  it('selection actions carry their flags', () => {
    expect(actions.setRowSelection(SCN, 5, true)).toEqual({
      type: SET_ROW_SELECTION,
      payload: { scenarioId: SCN, rowId: 5, selected: true }
    })
    expect(actions.setAllRowsSelection(SCN, false)).toEqual({
      type: SET_ALL_ROWS_SELECTION,
      payload: { scenarioId: SCN, selected: false }
    })
  })
})
