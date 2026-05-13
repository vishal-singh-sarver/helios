import {
  FETCH_STATUS,
  FETCH_STATUS_FAILURE,
  FETCH_STATUS_SUCCESS,
  IMPORT_FINALIZE_FAILED,
  IMPORT_FINALIZE_REQUESTED,
  IMPORT_FINALIZE_SUCCEEDED,
  IMPORT_CLEAR_FAILED,
  IMPORT_CLEAR_REQUESTED,
  IMPORT_CLEAR_SUCCEEDED,
  IMPORT_PRECISION_WARNING_CONSUMED,
  IMPORT_PICK_FILE_FAILED,
  IMPORT_PICK_FILE_REQUESTED,
  IMPORT_PICK_FILE_SUCCEEDED,
  IMPORT_RESET,
  IMPORT_WIZARD_CLOSED,
  IMPORT_WIZARD_OPENED,
  SSE_CONNECT,
  SSE_DISCONNECT,
  SSE_EVENT
} from './constants'
import type { ImportedDataset, PickedFile, WeatherStatus, WeatherStreamEvent } from './types'

// ── Action types ──────────────────────────────────────────────────────────────
//
// Type aliases (not interfaces) are required so each action is structurally
// assignable to redux's UnknownAction at dispatch sites. TypeScript rejects
// `interface { type: 'X' }` against `{ type: string; [k: string]: unknown }`
// because interfaces are considered open for declaration merging.

export type FetchStatusAction = { type: typeof FETCH_STATUS }
export type FetchStatusSuccessAction = {
  type: typeof FETCH_STATUS_SUCCESS
  payload: WeatherStatus
}
export type FetchStatusFailureAction = {
  type: typeof FETCH_STATUS_FAILURE
  payload: string
}
export type SseConnectAction = { type: typeof SSE_CONNECT }
export type SseEventAction = {
  type: typeof SSE_EVENT
  payload: WeatherStreamEvent
}
export type SseDisconnectAction = { type: typeof SSE_DISCONNECT }

// Import — file pick + read (saga side effect)
export type ImportPickFileRequestedAction = { type: typeof IMPORT_PICK_FILE_REQUESTED }
export type ImportPickFileSucceededAction = {
  type: typeof IMPORT_PICK_FILE_SUCCEEDED
  payload: PickedFile
}
export type ImportPickFileFailedAction = {
  type: typeof IMPORT_PICK_FILE_FAILED
  payload: string
}

// Import — finalize (saga POST)
export type ImportFinalizeRequestedAction = {
  type: typeof IMPORT_FINALIZE_REQUESTED
  projectId: string
  scenarioId: string
  payload: ImportedDataset
  truncatedDecimals?: boolean
}
export type ImportFinalizeSucceededAction = {
  type: typeof IMPORT_FINALIZE_SUCCEEDED
  projectId: string
  scenarioId: string
  payload: ImportedDataset
  precisionNormalized?: boolean
}
export type ImportFinalizeFailedAction = {
  type: typeof IMPORT_FINALIZE_FAILED
  payload: string
}
export type ImportClearRequestedAction = {
  type: typeof IMPORT_CLEAR_REQUESTED
  projectId: string
  scenarioId: string
}
export type ImportClearSucceededAction = {
  type: typeof IMPORT_CLEAR_SUCCEEDED
  projectId: string
  scenarioId: string
}
export type ImportClearFailedAction = {
  type: typeof IMPORT_CLEAR_FAILED
  payload: string
}
export type ImportPrecisionWarningConsumedAction = {
  type: typeof IMPORT_PRECISION_WARNING_CONSUMED
  projectId: string
  scenarioId: string
}

// Reset both flows (e.g. wizard closed without finishing)
export type ImportResetAction = { type: typeof IMPORT_RESET }

// Wizard open/close — held in Redux so the saga can auto-close on import
// success and the component doesn't need a "prev importing" sentinel.
export type ImportWizardOpenedAction = { type: typeof IMPORT_WIZARD_OPENED }
export type ImportWizardClosedAction = { type: typeof IMPORT_WIZARD_CLOSED }

export type WeatherAction =
  | FetchStatusAction
  | FetchStatusSuccessAction
  | FetchStatusFailureAction
  | SseConnectAction
  | SseEventAction
  | SseDisconnectAction
  | ImportPickFileRequestedAction
  | ImportPickFileSucceededAction
  | ImportPickFileFailedAction
  | ImportFinalizeRequestedAction
  | ImportFinalizeSucceededAction
  | ImportFinalizeFailedAction
  | ImportClearRequestedAction
  | ImportClearSucceededAction
  | ImportClearFailedAction
  | ImportPrecisionWarningConsumedAction
  | ImportResetAction
  | ImportWizardOpenedAction
  | ImportWizardClosedAction

// ── Action creators ────────────────────────────────────────────────────────────

export const fetchStatus = (): FetchStatusAction => ({ type: FETCH_STATUS })
export const fetchStatusSuccess = (payload: WeatherStatus): FetchStatusSuccessAction => ({
  type: FETCH_STATUS_SUCCESS,
  payload
})
export const fetchStatusFailure = (payload: string): FetchStatusFailureAction => ({
  type: FETCH_STATUS_FAILURE,
  payload
})
export const sseConnect = (): SseConnectAction => ({ type: SSE_CONNECT })
export const sseEvent = (payload: WeatherStreamEvent): SseEventAction => ({
  type: SSE_EVENT,
  payload
})
export const sseDisconnect = (): SseDisconnectAction => ({ type: SSE_DISCONNECT })

export const importPickFileRequested = (): ImportPickFileRequestedAction => ({
  type: IMPORT_PICK_FILE_REQUESTED
})
export const importPickFileSucceeded = (payload: PickedFile): ImportPickFileSucceededAction => ({
  type: IMPORT_PICK_FILE_SUCCEEDED,
  payload
})
export const importPickFileFailed = (payload: string): ImportPickFileFailedAction => ({
  type: IMPORT_PICK_FILE_FAILED,
  payload
})

export const importFinalizeRequested = (
  projectId: string,
  scenarioId: string,
  payload: ImportedDataset,
  truncatedDecimals?: boolean
): ImportFinalizeRequestedAction => ({
  type: IMPORT_FINALIZE_REQUESTED,
  projectId,
  scenarioId,
  payload,
  truncatedDecimals
})
export const importFinalizeSucceeded = (
  projectId: string,
  scenarioId: string,
  payload: ImportedDataset,
  precisionNormalized?: boolean
): ImportFinalizeSucceededAction => ({
  type: IMPORT_FINALIZE_SUCCEEDED,
  projectId,
  scenarioId,
  payload,
  precisionNormalized
})
export const importFinalizeFailed = (payload: string): ImportFinalizeFailedAction => ({
  type: IMPORT_FINALIZE_FAILED,
  payload
})
export const importClearRequested = (
  projectId: string,
  scenarioId: string
): ImportClearRequestedAction => ({
  type: IMPORT_CLEAR_REQUESTED,
  projectId,
  scenarioId
})
export const importClearSucceeded = (
  projectId: string,
  scenarioId: string
): ImportClearSucceededAction => ({
  type: IMPORT_CLEAR_SUCCEEDED,
  projectId,
  scenarioId
})
export const importClearFailed = (payload: string): ImportClearFailedAction => ({
  type: IMPORT_CLEAR_FAILED,
  payload
})
export const importPrecisionWarningConsumed = (
  projectId: string,
  scenarioId: string
): ImportPrecisionWarningConsumedAction => ({
  type: IMPORT_PRECISION_WARNING_CONSUMED,
  projectId,
  scenarioId
})

export const importReset = (): ImportResetAction => ({ type: IMPORT_RESET })

export const importWizardOpened = (): ImportWizardOpenedAction => ({
  type: IMPORT_WIZARD_OPENED
})
export const importWizardClosed = (): ImportWizardClosedAction => ({
  type: IMPORT_WIZARD_CLOSED
})
