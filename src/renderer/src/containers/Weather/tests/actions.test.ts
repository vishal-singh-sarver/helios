import * as actions from '../actions'
import {
  FETCH_STATUS,
  FETCH_STATUS_SUCCESS,
  FETCH_STATUS_FAILURE,
  SSE_CONNECT,
  SSE_EVENT,
  SSE_DISCONNECT,
  IMPORT_PICK_FILE_REQUESTED,
  IMPORT_PICK_FILE_SUCCEEDED,
  IMPORT_PICK_FILE_FAILED,
  IMPORT_FINALIZE_REQUESTED,
  IMPORT_FINALIZE_SUCCEEDED,
  IMPORT_FINALIZE_FAILED,
  IMPORT_CLEAR_REQUESTED,
  IMPORT_CLEAR_SUCCEEDED,
  IMPORT_CLEAR_FAILED,
  IMPORT_PRECISION_WARNING_CONSUMED,
  IMPORT_RESET,
  IMPORT_WIZARD_CLOSED,
  IMPORT_WIZARD_OPENED
} from '../constants'
import type {
  ImportedDataset,
  PickedFile,
  WeatherStatus,
  WeatherStreamEvent
} from '../types'

describe('Weather actions', () => {
  it('fetchStatus has correct type', () => {
    expect(actions.fetchStatus()).toEqual({ type: FETCH_STATUS })
  })

  it('fetchStatusSuccess carries payload', () => {
    const payload: WeatherStatus = { version: '1.0.0', uptime: 0 }
    expect(actions.fetchStatusSuccess(payload)).toEqual({ type: FETCH_STATUS_SUCCESS, payload })
  })

  it('fetchStatusFailure carries error message', () => {
    expect(actions.fetchStatusFailure('oops')).toEqual({
      type: FETCH_STATUS_FAILURE,
      payload: 'oops'
    })
  })

  it('sseConnect has correct type', () => {
    expect(actions.sseConnect()).toEqual({ type: SSE_CONNECT })
  })

  it('sseEvent carries payload', () => {
    const payload: WeatherStreamEvent = { type: 'ping', data: null, timestamp: 1 }
    expect(actions.sseEvent(payload)).toEqual({ type: SSE_EVENT, payload })
  })

  it('sseDisconnect has correct type', () => {
    expect(actions.sseDisconnect()).toEqual({ type: SSE_DISCONNECT })
  })
})

describe('Import actions', () => {
  const pickedFile: PickedFile = { filename: 'foo.csv', rawText: 'a,b\n1,2' }
  const dataset: ImportedDataset = {
    filename: 'foo.csv',
    columns: [{ key: '__check__', label: 'check', index: -1 }],
    records: [{ dtIso: '2026-01-01T00:00:00.000Z', values: { __check__: 'true' } }]
  }

  it('importPickFileRequested has correct type', () => {
    expect(actions.importPickFileRequested()).toEqual({ type: IMPORT_PICK_FILE_REQUESTED })
  })

  it('importPickFileSucceeded carries the picked file', () => {
    expect(actions.importPickFileSucceeded(pickedFile)).toEqual({
      type: IMPORT_PICK_FILE_SUCCEEDED,
      payload: pickedFile
    })
  })

  it('importPickFileFailed carries error message', () => {
    expect(actions.importPickFileFailed('boom')).toEqual({
      type: IMPORT_PICK_FILE_FAILED,
      payload: 'boom'
    })
  })

  it('importFinalizeRequested carries the dataset', () => {
    expect(actions.importFinalizeRequested('proj-1', 'sce-1', dataset)).toEqual({
      type: IMPORT_FINALIZE_REQUESTED,
      projectId: 'proj-1',
      scenarioId: 'sce-1',
      payload: dataset
    })
  })

  it('importFinalizeSucceeded carries the dataset', () => {
    expect(actions.importFinalizeSucceeded('proj-1', 'sce-1', dataset)).toEqual({
      type: IMPORT_FINALIZE_SUCCEEDED,
      projectId: 'proj-1',
      scenarioId: 'sce-1',
      payload: dataset
    })
  })

  it('importFinalizeSucceeded carries the precision-normalized flag when present', () => {
    expect(actions.importFinalizeSucceeded('proj-1', 'sce-1', dataset, true)).toEqual({
      type: IMPORT_FINALIZE_SUCCEEDED,
      projectId: 'proj-1',
      scenarioId: 'sce-1',
      payload: dataset,
      precisionNormalized: true
    })
  })

  it('importFinalizeFailed carries error message', () => {
    expect(actions.importFinalizeFailed('save cancelled')).toEqual({
      type: IMPORT_FINALIZE_FAILED,
      payload: 'save cancelled'
    })
  })

  it('importClearRequested has correct type', () => {
    expect(actions.importClearRequested('proj-1', 'sce-1')).toEqual({
      type: IMPORT_CLEAR_REQUESTED,
      projectId: 'proj-1',
      scenarioId: 'sce-1'
    })
  })

  it('importClearSucceeded has correct type', () => {
    expect(actions.importClearSucceeded('proj-1', 'sce-1')).toEqual({
      type: IMPORT_CLEAR_SUCCEEDED,
      projectId: 'proj-1',
      scenarioId: 'sce-1'
    })
  })

  it('importClearFailed carries error message', () => {
    expect(actions.importClearFailed('boom')).toEqual({
      type: IMPORT_CLEAR_FAILED,
      payload: 'boom'
    })
  })

  it('importPrecisionWarningConsumed carries scope ids', () => {
    expect(actions.importPrecisionWarningConsumed('proj-1', 'sce-1')).toEqual({
      type: IMPORT_PRECISION_WARNING_CONSUMED,
      projectId: 'proj-1',
      scenarioId: 'sce-1'
    })
  })

  it('importReset has correct type', () => {
    expect(actions.importReset()).toEqual({ type: IMPORT_RESET })
  })

  it('importWizardOpened has correct type', () => {
    expect(actions.importWizardOpened()).toEqual({ type: IMPORT_WIZARD_OPENED })
  })

  it('importWizardClosed has correct type', () => {
    expect(actions.importWizardClosed()).toEqual({ type: IMPORT_WIZARD_CLOSED })
  })
})
