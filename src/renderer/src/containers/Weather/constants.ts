// REST
export const FETCH_STATUS = 'app/Weather/FETCH_STATUS' as const
export const FETCH_STATUS_SUCCESS = 'app/Weather/FETCH_STATUS_SUCCESS' as const
export const FETCH_STATUS_FAILURE = 'app/Weather/FETCH_STATUS_FAILURE' as const

// SSE
export const SSE_CONNECT = 'app/Weather/SSE_CONNECT' as const
export const SSE_EVENT = 'app/Weather/SSE_EVENT' as const
export const SSE_DISCONNECT = 'app/Weather/SSE_DISCONNECT' as const

// Weather data import
export const IMPORT_PICK_FILE_REQUESTED = 'app/Weather/IMPORT_PICK_FILE_REQUESTED' as const
export const IMPORT_PICK_FILE_SUCCEEDED = 'app/Weather/IMPORT_PICK_FILE_SUCCEEDED' as const
export const IMPORT_PICK_FILE_FAILED = 'app/Weather/IMPORT_PICK_FILE_FAILED' as const
export const IMPORT_FINALIZE_REQUESTED = 'app/Weather/IMPORT_FINALIZE_REQUESTED' as const
export const IMPORT_FINALIZE_SUCCEEDED = 'app/Weather/IMPORT_FINALIZE_SUCCEEDED' as const
export const IMPORT_FINALIZE_FAILED = 'app/Weather/IMPORT_FINALIZE_FAILED' as const
export const IMPORT_RESET = 'app/Weather/IMPORT_RESET' as const

// Wizard open / close. Held in Redux so the saga can auto-close the wizard
// on IMPORT_FINALIZE_SUCCEEDED — the alternative (a useState-based "previous
// importing" sentinel in the component) is fragile and pushes saga semantics
// into render.
export const IMPORT_WIZARD_OPENED = 'app/Weather/IMPORT_WIZARD_OPENED' as const
export const IMPORT_WIZARD_CLOSED = 'app/Weather/IMPORT_WIZARD_CLOSED' as const
