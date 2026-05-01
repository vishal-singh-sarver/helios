import {
  LOAD_DATA_TYPES_REQUESTED,
  LOAD_DATA_TYPES_SUCCEEDED,
  LOAD_DATA_TYPES_FAILED,
  SET_ACTIVE_PROJECT,
  SET_ACTIVE_SCENARIO,
  LIST_SCENARIOS_REQUESTED,
  LIST_SCENARIOS_SUCCEEDED,
  LIST_SCENARIOS_FAILED,
  LOAD_PROJECT_SUCCEEDED,
  LOAD_HEADERS_REQUESTED,
  LOAD_HEADERS_SUCCEEDED,
  LOAD_HEADERS_FAILED,
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
  SEED_DEFAULT_COLUMNS_REQUESTED,
  SEED_DEFAULT_COLUMNS_SUCCEEDED,
  SEED_DEFAULT_COLUMNS_FAILED,
  UPDATE_COLUMN_REQUESTED,
  UPDATE_COLUMN_SUCCEEDED,
  UPDATE_COLUMN_FAILED,
  UPDATE_CELL_LOCAL,
  UPDATE_CELL_REQUESTED,
  UPDATE_CELL_SUCCEEDED,
  UPDATE_CELL_FAILED,
  SET_COLUMN_VALIDATION_ERRORS,
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
  ProjectMetadata,
  RowId,
  Scenario,
  UpdateCellLocalPayload,
  UpdateColumnFailedPayload,
  UpdateColumnPatch,
  UpdateColumnRequestedPayload,
  UpdateColumnSucceededPayload,
  WeatherHeader
} from './types'

// Index signature on every action satisfies Redux 5's UnknownAction so
// dispatch accepts these without a cast (same pattern as
// store/navigationReducer.ts).
type Idx = { [extraProps: string]: unknown }

// ── Action interfaces ────────────────────────────────────────────────────────

// Catalog: data types
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

// Active project + scenario
export interface SetActiveProjectAction extends Idx {
  type: typeof SET_ACTIVE_PROJECT
  payload: { projectId: string }
}
export interface SetActiveScenarioAction extends Idx {
  type: typeof SET_ACTIVE_SCENARIO
  payload: { scenarioId: string }
}

// Project metadata
export interface LoadProjectSucceededAction extends Idx {
  type: typeof LOAD_PROJECT_SUCCEEDED
  payload: ProjectMetadata
}

// List scenarios (per project)
export interface ListScenariosRequestedAction extends Idx {
  type: typeof LIST_SCENARIOS_REQUESTED
  payload: { projectId: string }
}
export interface ListScenariosSucceededAction extends Idx {
  type: typeof LIST_SCENARIOS_SUCCEEDED
  payload: { projectId: string; scenarios: Scenario[] }
}
export interface ListScenariosFailedAction extends Idx {
  type: typeof LIST_SCENARIOS_FAILED
  payload: { projectId: string; error: string }
}

// Weather headers (per scenario)
export interface LoadHeadersRequestedAction extends Idx {
  type: typeof LOAD_HEADERS_REQUESTED
  payload: { projectId: string; scenarioId: string }
}
export interface LoadHeadersSucceededAction extends Idx {
  type: typeof LOAD_HEADERS_SUCCEEDED
  payload: { scenarioId: string; headers: WeatherHeader[] }
}
export interface LoadHeadersFailedAction extends Idx {
  type: typeof LOAD_HEADERS_FAILED
  payload: { scenarioId: string; error: string }
}

// Scenario load
export interface LoadScenarioRequestedAction extends Idx {
  type: typeof LOAD_SCENARIO_REQUESTED
  payload: { projectId: string; scenarioId: string }
}
export interface LoadScenarioSucceededAction extends Idx {
  type: typeof LOAD_SCENARIO_SUCCEEDED
  payload: LoadedScenarioPayload
}
export interface LoadScenarioFailedAction extends Idx {
  type: typeof LOAD_SCENARIO_FAILED
  payload: { projectId: string; scenarioId: string; error: string }
}

// Upload
export interface UploadFileRequestedAction extends Idx {
  type: typeof UPLOAD_FILE_REQUESTED
  payload: { projectId: string; scenarioId: string; file: File }
}
export interface UploadFileSucceededAction extends Idx {
  type: typeof UPLOAD_FILE_SUCCEEDED
  payload: { projectId: string; scenarioId: string }
}
export interface UploadFileFailedAction extends Idx {
  type: typeof UPLOAD_FILE_FAILED
  payload: { projectId: string; scenarioId: string; error: string }
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
  payload: { projectId: string; scenarioId: string; error: string }
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
  payload: { projectId: string; scenarioId: string; error: string }
}

// Seed default columns (date-time + check) on an empty scenario. Internal
// to loadScenarioWorker — the component never dispatches this directly.
export interface SeedDefaultColumnsRequestedAction extends Idx {
  type: typeof SEED_DEFAULT_COLUMNS_REQUESTED
  payload: { projectId: string; scenarioId: string }
}
export interface SeedDefaultColumnsSucceededAction extends Idx {
  type: typeof SEED_DEFAULT_COLUMNS_SUCCEEDED
  payload: { projectId: string; scenarioId: string }
}
export interface SeedDefaultColumnsFailedAction extends Idx {
  type: typeof SEED_DEFAULT_COLUMNS_FAILED
  payload: { projectId: string; scenarioId: string; error: string }
}

// Update column header (PATCH /weather_data_header/{header_id})
export interface UpdateColumnRequestedAction extends Idx {
  type: typeof UPDATE_COLUMN_REQUESTED
  payload: UpdateColumnRequestedPayload
}
export interface UpdateColumnSucceededAction extends Idx {
  type: typeof UPDATE_COLUMN_SUCCEEDED
  payload: UpdateColumnSucceededPayload
}
export interface UpdateColumnFailedAction extends Idx {
  type: typeof UPDATE_COLUMN_FAILED
  payload: UpdateColumnFailedPayload
}

// Cell edit
export interface UpdateCellLocalAction extends Idx {
  type: typeof UPDATE_CELL_LOCAL
  payload: UpdateCellLocalPayload
}
export interface UpdateCellRequestedAction extends Idx {
  type: typeof UPDATE_CELL_REQUESTED
  payload: { projectId: string; scenarioId: string; rowId: RowId; colId: ColId }
}
export interface UpdateCellSucceededAction extends Idx {
  type: typeof UPDATE_CELL_SUCCEEDED
  payload: { projectId: string; scenarioId: string; rowId: RowId; colId: ColId }
}
export interface UpdateCellFailedAction extends Idx {
  type: typeof UPDATE_CELL_FAILED
  payload: {
    projectId: string
    scenarioId: string
    rowId: RowId
    colId: ColId
    error: string
  }
}

// Bulk per-column validation. `errors` carries one entry per row in the
// affected column: a string sets that cell's validationError, `null` clears
// any prior error. Reducer applies it without touching cell values.
export interface SetColumnValidationErrorsAction extends Idx {
  type: typeof SET_COLUMN_VALIDATION_ERRORS
  payload: {
    scenarioId: string
    colId: ColId
    errors: Record<RowId, string | null>
  }
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
  | SetActiveProjectAction
  | SetActiveScenarioAction
  | LoadProjectSucceededAction
  | ListScenariosRequestedAction
  | ListScenariosSucceededAction
  | ListScenariosFailedAction
  | LoadHeadersRequestedAction
  | LoadHeadersSucceededAction
  | LoadHeadersFailedAction
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
  | SeedDefaultColumnsRequestedAction
  | SeedDefaultColumnsSucceededAction
  | SeedDefaultColumnsFailedAction
  | UpdateColumnRequestedAction
  | UpdateColumnSucceededAction
  | UpdateColumnFailedAction
  | UpdateCellLocalAction
  | UpdateCellRequestedAction
  | UpdateCellSucceededAction
  | UpdateCellFailedAction
  | SetColumnValidationErrorsAction
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

export const setActiveProject = (projectId: string): SetActiveProjectAction => ({
  type: SET_ACTIVE_PROJECT,
  payload: { projectId }
})
export const loadProjectSucceeded = (
  payload: ProjectMetadata
): LoadProjectSucceededAction => ({
  type: LOAD_PROJECT_SUCCEEDED,
  payload
})
export const setActiveScenario = (scenarioId: string): SetActiveScenarioAction => ({
  type: SET_ACTIVE_SCENARIO,
  payload: { scenarioId }
})

export const listScenariosRequested = (
  projectId: string
): ListScenariosRequestedAction => ({
  type: LIST_SCENARIOS_REQUESTED,
  payload: { projectId }
})
export const listScenariosSucceeded = (
  projectId: string,
  scenarios: Scenario[]
): ListScenariosSucceededAction => ({
  type: LIST_SCENARIOS_SUCCEEDED,
  payload: { projectId, scenarios }
})
export const listScenariosFailed = (
  projectId: string,
  error: string
): ListScenariosFailedAction => ({
  type: LIST_SCENARIOS_FAILED,
  payload: { projectId, error }
})

export const loadHeadersRequested = (
  projectId: string,
  scenarioId: string
): LoadHeadersRequestedAction => ({
  type: LOAD_HEADERS_REQUESTED,
  payload: { projectId, scenarioId }
})
export const loadHeadersSucceeded = (
  scenarioId: string,
  headers: WeatherHeader[]
): LoadHeadersSucceededAction => ({
  type: LOAD_HEADERS_SUCCEEDED,
  payload: { scenarioId, headers }
})
export const loadHeadersFailed = (
  scenarioId: string,
  error: string
): LoadHeadersFailedAction => ({
  type: LOAD_HEADERS_FAILED,
  payload: { scenarioId, error }
})

export const loadScenarioRequested = (
  projectId: string,
  scenarioId: string
): LoadScenarioRequestedAction => ({
  type: LOAD_SCENARIO_REQUESTED,
  payload: { projectId, scenarioId }
})
export const loadScenarioSucceeded = (
  payload: LoadedScenarioPayload
): LoadScenarioSucceededAction => ({ type: LOAD_SCENARIO_SUCCEEDED, payload })
export const loadScenarioFailed = (
  projectId: string,
  scenarioId: string,
  error: string
): LoadScenarioFailedAction => ({
  type: LOAD_SCENARIO_FAILED,
  payload: { projectId, scenarioId, error }
})

export const uploadFileRequested = (
  projectId: string,
  scenarioId: string,
  file: File
): UploadFileRequestedAction => ({
  type: UPLOAD_FILE_REQUESTED,
  payload: { projectId, scenarioId, file }
})
export const uploadFileSucceeded = (
  projectId: string,
  scenarioId: string
): UploadFileSucceededAction => ({
  type: UPLOAD_FILE_SUCCEEDED,
  payload: { projectId, scenarioId }
})
export const uploadFileFailed = (
  projectId: string,
  scenarioId: string,
  error: string
): UploadFileFailedAction => ({
  type: UPLOAD_FILE_FAILED,
  payload: { projectId, scenarioId, error }
})

export const addRowRequested = (
  projectId: string,
  scenarioId: string,
  date: string,
  time: string,
  columnIds: ColId[],
  numberOfRows: number,
  deltaHours: number
): AddRowRequestedAction => ({
  type: ADD_ROW_REQUESTED,
  payload: { projectId, scenarioId, date, time, columnIds, numberOfRows, deltaHours }
})
export const addRowSucceeded = (
  projectId: string,
  scenarioId: string
): AddRowSucceededAction => ({
  type: ADD_ROW_SUCCEEDED,
  payload: { projectId, scenarioId }
})
export const addRowFailed = (
  projectId: string,
  scenarioId: string,
  error: string
): AddRowFailedAction => ({
  type: ADD_ROW_FAILED,
  payload: { projectId, scenarioId, error }
})

export const addColumnRequested = (
  projectId: string,
  scenarioId: string,
  name: string,
  dataTypeId: number | null,
  dataUnitId: number | null,
  defaultValue: string
): AddColumnRequestedAction => ({
  type: ADD_COLUMN_REQUESTED,
  payload: { projectId, scenarioId, name, dataTypeId, dataUnitId, defaultValue }
})
export const addColumnSucceeded = (
  projectId: string,
  scenarioId: string,
  column: ColumnDef,
  defaultValue: string
): AddColumnSucceededAction => ({
  type: ADD_COLUMN_SUCCEEDED,
  payload: { projectId, scenarioId, column, defaultValue }
})
export const addColumnFailed = (
  projectId: string,
  scenarioId: string,
  error: string
): AddColumnFailedAction => ({
  type: ADD_COLUMN_FAILED,
  payload: { projectId, scenarioId, error }
})

export const seedDefaultColumnsRequested = (
  projectId: string,
  scenarioId: string
): SeedDefaultColumnsRequestedAction => ({
  type: SEED_DEFAULT_COLUMNS_REQUESTED,
  payload: { projectId, scenarioId }
})
export const seedDefaultColumnsSucceeded = (
  projectId: string,
  scenarioId: string
): SeedDefaultColumnsSucceededAction => ({
  type: SEED_DEFAULT_COLUMNS_SUCCEEDED,
  payload: { projectId, scenarioId }
})
export const seedDefaultColumnsFailed = (
  projectId: string,
  scenarioId: string,
  error: string
): SeedDefaultColumnsFailedAction => ({
  type: SEED_DEFAULT_COLUMNS_FAILED,
  payload: { projectId, scenarioId, error }
})

export const updateColumnRequested = (
  projectId: string,
  scenarioId: string,
  colId: ColId,
  patch: UpdateColumnPatch,
  previous: UpdateColumnPatch
): UpdateColumnRequestedAction => ({
  type: UPDATE_COLUMN_REQUESTED,
  payload: { projectId, scenarioId, colId, patch, previous }
})
export const updateColumnSucceeded = (
  projectId: string,
  scenarioId: string,
  colId: ColId
): UpdateColumnSucceededAction => ({
  type: UPDATE_COLUMN_SUCCEEDED,
  payload: { projectId, scenarioId, colId }
})
export const updateColumnFailed = (
  projectId: string,
  scenarioId: string,
  colId: ColId,
  previous: UpdateColumnPatch,
  error: string
): UpdateColumnFailedAction => ({
  type: UPDATE_COLUMN_FAILED,
  payload: { projectId, scenarioId, colId, previous, error }
})

export const updateCellLocal = (payload: UpdateCellLocalPayload): UpdateCellLocalAction => ({
  type: UPDATE_CELL_LOCAL,
  payload
})
export const updateCellRequested = (
  projectId: string,
  scenarioId: string,
  rowId: RowId,
  colId: ColId
): UpdateCellRequestedAction => ({
  type: UPDATE_CELL_REQUESTED,
  payload: { projectId, scenarioId, rowId, colId }
})
export const updateCellSucceeded = (
  projectId: string,
  scenarioId: string,
  rowId: RowId,
  colId: ColId
): UpdateCellSucceededAction => ({
  type: UPDATE_CELL_SUCCEEDED,
  payload: { projectId, scenarioId, rowId, colId }
})
export const updateCellFailed = (
  projectId: string,
  scenarioId: string,
  rowId: RowId,
  colId: ColId,
  error: string
): UpdateCellFailedAction => ({
  type: UPDATE_CELL_FAILED,
  payload: { projectId, scenarioId, rowId, colId, error }
})

export const setColumnValidationErrors = (
  scenarioId: string,
  colId: ColId,
  errors: Record<RowId, string | null>
): SetColumnValidationErrorsAction => ({
  type: SET_COLUMN_VALIDATION_ERRORS,
  payload: { scenarioId, colId, errors }
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
