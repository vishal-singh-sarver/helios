// Data types (loaded from backend, cached for the session)
export const LOAD_DATA_TYPES_REQUESTED = 'app/ProjectScreen/LOAD_DATA_TYPES_REQUESTED' as const
export const LOAD_DATA_TYPES_SUCCEEDED = 'app/ProjectScreen/LOAD_DATA_TYPES_SUCCEEDED' as const
export const LOAD_DATA_TYPES_FAILED = 'app/ProjectScreen/LOAD_DATA_TYPES_FAILED' as const

// Active scenario
export const SET_ACTIVE_SCENARIO = 'app/ProjectScreen/SET_ACTIVE_SCENARIO' as const

// Scenario load
export const LOAD_SCENARIO_REQUESTED = 'app/ProjectScreen/LOAD_SCENARIO_REQUESTED' as const
export const LOAD_SCENARIO_SUCCEEDED = 'app/ProjectScreen/LOAD_SCENARIO_SUCCEEDED' as const
export const LOAD_SCENARIO_FAILED = 'app/ProjectScreen/LOAD_SCENARIO_FAILED' as const

// Upload (replaces all scenario data; saga re-fires LOAD on success)
export const UPLOAD_FILE_REQUESTED = 'app/ProjectScreen/UPLOAD_FILE_REQUESTED' as const
export const UPLOAD_FILE_SUCCEEDED = 'app/ProjectScreen/UPLOAD_FILE_SUCCEEDED' as const
export const UPLOAD_FILE_FAILED = 'app/ProjectScreen/UPLOAD_FILE_FAILED' as const

// Add row
export const ADD_ROW_REQUESTED = 'app/ProjectScreen/ADD_ROW_REQUESTED' as const
export const ADD_ROW_SUCCEEDED = 'app/ProjectScreen/ADD_ROW_SUCCEEDED' as const
export const ADD_ROW_FAILED = 'app/ProjectScreen/ADD_ROW_FAILED' as const

// Add column
export const ADD_COLUMN_REQUESTED = 'app/ProjectScreen/ADD_COLUMN_REQUESTED' as const
export const ADD_COLUMN_SUCCEEDED = 'app/ProjectScreen/ADD_COLUMN_SUCCEEDED' as const
export const ADD_COLUMN_FAILED = 'app/ProjectScreen/ADD_COLUMN_FAILED' as const

// Cell edit. UPDATE_CELL_LOCAL is the synchronous optimistic write fired
// from the cell on blur. The saga then dispatches UPDATE_CELL_REQUESTED only
// when local validation passed (validationError === null).
export const UPDATE_CELL_LOCAL = 'app/ProjectScreen/UPDATE_CELL_LOCAL' as const
export const UPDATE_CELL_REQUESTED = 'app/ProjectScreen/UPDATE_CELL_REQUESTED' as const
export const UPDATE_CELL_SUCCEEDED = 'app/ProjectScreen/UPDATE_CELL_SUCCEEDED' as const
export const UPDATE_CELL_FAILED = 'app/ProjectScreen/UPDATE_CELL_FAILED' as const

// Selection
export const SET_ROW_SELECTION = 'app/ProjectScreen/SET_ROW_SELECTION' as const
export const SET_ALL_ROWS_SELECTION = 'app/ProjectScreen/SET_ALL_ROWS_SELECTION' as const
