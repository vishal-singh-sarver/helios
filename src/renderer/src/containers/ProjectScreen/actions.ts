import {
  LOAD_DATA_TYPES_REQUESTED,
  LOAD_DATA_TYPES_SUCCEEDED,
  LOAD_DATA_TYPES_FAILED,
  SET_ACTIVE_SCENARIO,
  LOAD_SCENARIO_REQUESTED,
  LOAD_SCENARIO_SUCCEEDED,
  LOAD_SCENARIO_FAILED,
  UPLOAD_FILE_REQUESTED,
  UPLOAD_FILE_SUCCEEDED,
  UPLOAD_FILE_FAILED,
  ADD_ROW_REQUESTED,
  ADD_ROW_SUCCEEDED,
  ADD_ROW_FAILED,
  ADD_COLUMN_REQUESTED,
  ADD_COLUMN_SUCCEEDED,
  ADD_COLUMN_FAILED,
  UPDATE_CELL_LOCAL,
  UPDATE_CELL_REQUESTED,
  UPDATE_CELL_SUCCEEDED,
  UPDATE_CELL_FAILED,
  SET_ROW_SELECTION,
  SET_ALL_ROWS_SELECTION
} from './constants'
import type {
  AddColumnRequestedPayload,
  AddColumnSucceededPayload,
  AddRowRequestedPayload,
  AddRowSucceededPayload,
  ColId,
  ColumnDef,
  DataTypeDef,
  LoadedScenarioPayload,
  RowId,
  UpdateCellLocalPayload
} from './types'

// Index signature on every action satisfies Redux 5's UnknownAction so
// dispatch accepts these without a cast (same pattern as
// store/navigationReducer.ts).
type Idx = { [extraProps: string]: unknown }

// ── Action interfaces ────────────────────────────────────────────────────────

// Data types
export interface LoadDataTypesRequestedAction extends Idx {
  type: typeof LOAD_DATA_TYPES_REQUESTED
}
export interface LoadDataTypesSucceededAction extends Idx {
  type: typeof LOAD_DATA_TYPES_SUCCEEDED
  payload: DataTypeDef[]
}
export interface LoadDataTypesFailedAction extends Idx {
  type: typeof LOAD_DATA_TYPES_FAILED
  payload: string
}

// Active scenario
export interface SetActiveScenarioAction extends Idx {
  type: typeof SET_ACTIVE_SCENARIO
  payload: { scenarioId: string }
}

// Scenario load
export interface LoadScenarioRequestedAction extends Idx {
  type: typeof LOAD_SCENARIO_REQUESTED
  payload: { scenarioId: string }
}
export interface LoadScenarioSucceededAction extends Idx {
  type: typeof LOAD_SCENARIO_SUCCEEDED
  payload: LoadedScenarioPayload
}
export interface LoadScenarioFailedAction extends Idx {
  type: typeof LOAD_SCENARIO_FAILED
  payload: { scenarioId: string; error: string }
}

// Upload
export interface UploadFileRequestedAction extends Idx {
  type: typeof UPLOAD_FILE_REQUESTED
  payload: { scenarioId: string; file: File }
}
export interface UploadFileSucceededAction extends Idx {
  type: typeof UPLOAD_FILE_SUCCEEDED
  payload: { scenarioId: string }
}
export interface UploadFileFailedAction extends Idx {
  type: typeof UPLOAD_FILE_FAILED
  payload: { scenarioId: string; error: string }
}

// Add row
export interface AddRowRequestedAction extends Idx {
  type: typeof ADD_ROW_REQUESTED
  payload: AddRowRequestedPayload
}
export interface AddRowSucceededAction extends Idx {
  type: typeof ADD_ROW_SUCCEEDED
  payload: AddRowSucceededPayload
}
export interface AddRowFailedAction extends Idx {
  type: typeof ADD_ROW_FAILED
  payload: { scenarioId: string; error: string }
}

// Add column
export interface AddColumnRequestedAction extends Idx {
  type: typeof ADD_COLUMN_REQUESTED
  payload: AddColumnRequestedPayload
}
export interface AddColumnSucceededAction extends Idx {
  type: typeof ADD_COLUMN_SUCCEEDED
  payload: AddColumnSucceededPayload
}
export interface AddColumnFailedAction extends Idx {
  type: typeof ADD_COLUMN_FAILED
  payload: { scenarioId: string; error: string }
}

// Cell edit
export interface UpdateCellLocalAction extends Idx {
  type: typeof UPDATE_CELL_LOCAL
  payload: UpdateCellLocalPayload
}
export interface UpdateCellRequestedAction extends Idx {
  type: typeof UPDATE_CELL_REQUESTED
  payload: { scenarioId: string; rowId: RowId; colId: ColId }
}
export interface UpdateCellSucceededAction extends Idx {
  type: typeof UPDATE_CELL_SUCCEEDED
  payload: { scenarioId: string; rowId: RowId; colId: ColId }
}
export interface UpdateCellFailedAction extends Idx {
  type: typeof UPDATE_CELL_FAILED
  payload: { scenarioId: string; rowId: RowId; colId: ColId; error: string }
}

// Selection
export interface SetRowSelectionAction extends Idx {
  type: typeof SET_ROW_SELECTION
  payload: { scenarioId: string; rowId: RowId; selected: boolean }
}
export interface SetAllRowsSelectionAction extends Idx {
  type: typeof SET_ALL_ROWS_SELECTION
  payload: { scenarioId: string; selected: boolean }
}

export type ProjectScreenAction =
  | LoadDataTypesRequestedAction
  | LoadDataTypesSucceededAction
  | LoadDataTypesFailedAction
  | SetActiveScenarioAction
  | LoadScenarioRequestedAction
  | LoadScenarioSucceededAction
  | LoadScenarioFailedAction
  | UploadFileRequestedAction
  | UploadFileSucceededAction
  | UploadFileFailedAction
  | AddRowRequestedAction
  | AddRowSucceededAction
  | AddRowFailedAction
  | AddColumnRequestedAction
  | AddColumnSucceededAction
  | AddColumnFailedAction
  | UpdateCellLocalAction
  | UpdateCellRequestedAction
  | UpdateCellSucceededAction
  | UpdateCellFailedAction
  | SetRowSelectionAction
  | SetAllRowsSelectionAction

// ── Action creators ──────────────────────────────────────────────────────────

export const loadDataTypesRequested = (): LoadDataTypesRequestedAction => ({
  type: LOAD_DATA_TYPES_REQUESTED
})
export const loadDataTypesSucceeded = (
  payload: DataTypeDef[]
): LoadDataTypesSucceededAction => ({ type: LOAD_DATA_TYPES_SUCCEEDED, payload })
export const loadDataTypesFailed = (payload: string): LoadDataTypesFailedAction => ({
  type: LOAD_DATA_TYPES_FAILED,
  payload
})

export const setActiveScenario = (scenarioId: string): SetActiveScenarioAction => ({
  type: SET_ACTIVE_SCENARIO,
  payload: { scenarioId }
})

export const loadScenarioRequested = (scenarioId: string): LoadScenarioRequestedAction => ({
  type: LOAD_SCENARIO_REQUESTED,
  payload: { scenarioId }
})
export const loadScenarioSucceeded = (
  payload: LoadedScenarioPayload
): LoadScenarioSucceededAction => ({ type: LOAD_SCENARIO_SUCCEEDED, payload })
export const loadScenarioFailed = (
  scenarioId: string,
  error: string
): LoadScenarioFailedAction => ({
  type: LOAD_SCENARIO_FAILED,
  payload: { scenarioId, error }
})

export const uploadFileRequested = (
  scenarioId: string,
  file: File
): UploadFileRequestedAction => ({ type: UPLOAD_FILE_REQUESTED, payload: { scenarioId, file } })
export const uploadFileSucceeded = (scenarioId: string): UploadFileSucceededAction => ({
  type: UPLOAD_FILE_SUCCEEDED,
  payload: { scenarioId }
})
export const uploadFileFailed = (scenarioId: string, error: string): UploadFileFailedAction => ({
  type: UPLOAD_FILE_FAILED,
  payload: { scenarioId, error }
})

export const addRowRequested = (
  scenarioId: string,
  date: string,
  time: string,
  columnIds: ColId[],
  numberOfRows: number
): AddRowRequestedAction => ({
  type: ADD_ROW_REQUESTED,
  payload: { scenarioId, date, time, columnIds, numberOfRows }
})
export const addRowSucceeded = (
  scenarioId: string,
  rows: Array<Record<ColId, string>>
): AddRowSucceededAction => ({
  type: ADD_ROW_SUCCEEDED,
  payload: { scenarioId, rows }
})
export const addRowFailed = (scenarioId: string, error: string): AddRowFailedAction => ({
  type: ADD_ROW_FAILED,
  payload: { scenarioId, error }
})

export const addColumnRequested = (
  scenarioId: string,
  name: string,
  dataTypeId: string,
  dataUnitId: string,
  defaultValue: string
): AddColumnRequestedAction => ({
  type: ADD_COLUMN_REQUESTED,
  payload: { scenarioId, name, dataTypeId, dataUnitId, defaultValue }
})
export const addColumnSucceeded = (
  scenarioId: string,
  column: ColumnDef,
  defaultValue: string
): AddColumnSucceededAction => ({
  type: ADD_COLUMN_SUCCEEDED,
  payload: { scenarioId, column, defaultValue }
})
export const addColumnFailed = (scenarioId: string, error: string): AddColumnFailedAction => ({
  type: ADD_COLUMN_FAILED,
  payload: { scenarioId, error }
})

export const updateCellLocal = (payload: UpdateCellLocalPayload): UpdateCellLocalAction => ({
  type: UPDATE_CELL_LOCAL,
  payload
})
export const updateCellRequested = (
  scenarioId: string,
  rowId: RowId,
  colId: ColId
): UpdateCellRequestedAction => ({
  type: UPDATE_CELL_REQUESTED,
  payload: { scenarioId, rowId, colId }
})
export const updateCellSucceeded = (
  scenarioId: string,
  rowId: RowId,
  colId: ColId
): UpdateCellSucceededAction => ({
  type: UPDATE_CELL_SUCCEEDED,
  payload: { scenarioId, rowId, colId }
})
export const updateCellFailed = (
  scenarioId: string,
  rowId: RowId,
  colId: ColId,
  error: string
): UpdateCellFailedAction => ({
  type: UPDATE_CELL_FAILED,
  payload: { scenarioId, rowId, colId, error }
})

export const setRowSelection = (
  scenarioId: string,
  rowId: RowId,
  selected: boolean
): SetRowSelectionAction => ({
  type: SET_ROW_SELECTION,
  payload: { scenarioId, rowId, selected }
})
export const setAllRowsSelection = (
  scenarioId: string,
  selected: boolean
): SetAllRowsSelectionAction => ({
  type: SET_ALL_ROWS_SELECTION,
  payload: { scenarioId, selected }
})
