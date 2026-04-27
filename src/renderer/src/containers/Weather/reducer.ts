import { produce } from 'immer'
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
  IMPORT_RESET
} from './constants'
import type { WeatherAction } from './actions'
import type {
  ImportedDataset,
  PickedFile,
  WeatherStatus,
  WeatherStreamEvent
} from './types'

export type { WeatherStatus, WeatherStreamEvent }

// ── State ──────────────────────────────────────────────────────────────────────

export interface WeatherState {
  // Existing — REST/SSE scaffolding (untouched)
  status: WeatherStatus | null
  loading: boolean
  error: string | null
  streaming: boolean
  streamLog: WeatherStreamEvent[]

  // Import — file pick + read flow
  fileLoading: boolean
  fileError: string | null
  pickedFile: PickedFile | null

  // Import — finalize / POST flow
  importing: boolean
  importError: string | null
  dataset: ImportedDataset | null
}

export const initialState: WeatherState = {
  status: null,
  loading: false,
  error: null,
  streaming: false,
  streamLog: [],

  fileLoading: false,
  fileError: null,
  pickedFile: null,

  importing: false,
  importError: null,
  dataset: null
}

// ── Reducer ────────────────────────────────────────────────────────────────────

const weatherReducer = (state: WeatherState = initialState, action: WeatherAction): WeatherState =>
  produce(state, (draft) => {
    switch (action.type) {
      case FETCH_STATUS:
        draft.loading = true
        draft.error = null
        break

      case FETCH_STATUS_SUCCESS:
        draft.loading = false
        draft.status = action.payload
        break

      case FETCH_STATUS_FAILURE:
        draft.loading = false
        draft.error = action.payload
        break

      case SSE_CONNECT:
        draft.streaming = true
        draft.streamLog = []
        break

      case SSE_EVENT:
        draft.streamLog.push(action.payload)
        break

      case SSE_DISCONNECT:
        draft.streaming = false
        break

      case IMPORT_PICK_FILE_REQUESTED:
        draft.fileLoading = true
        draft.fileError = null
        draft.pickedFile = null
        break

      case IMPORT_PICK_FILE_SUCCEEDED:
        draft.fileLoading = false
        draft.pickedFile = action.payload
        break

      case IMPORT_PICK_FILE_FAILED:
        draft.fileLoading = false
        draft.fileError = action.payload
        break

      case IMPORT_FINALIZE_REQUESTED:
        draft.importing = true
        draft.importError = null
        break

      case IMPORT_FINALIZE_SUCCEEDED:
        draft.importing = false
        draft.dataset = action.payload
        // Clear pick state so next open starts clean.
        draft.pickedFile = null
        draft.fileError = null
        break

      case IMPORT_FINALIZE_FAILED:
        draft.importing = false
        draft.importError = action.payload
        break

      case IMPORT_RESET:
        draft.fileLoading = false
        draft.fileError = null
        draft.pickedFile = null
        draft.importing = false
        draft.importError = null
        // Note: dataset is intentionally preserved across resets so a previous
        // successful import remains available even if the wizard is reopened
        // and cancelled.
        break
    }
  })

export default weatherReducer
