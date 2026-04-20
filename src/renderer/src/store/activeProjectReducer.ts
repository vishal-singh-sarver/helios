/*
 * Active project reducer
 *
 * The project the user currently has "open". Persisted to localStorage so
 * it survives reloads — Redux state here is a reactive mirror of the
 * localStorage value. On app boot, the reducer's initial state is seeded
 * from storage. Action creators write to storage before returning; the
 * reducer stays pure.
 *
 * When the backend comes online, swap the localStorage helpers for a
 * server call — nothing else in the app needs to change.
 */

const STORAGE_KEY = 'helios:activeProjectId'

function readStored(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

function writeStored(projectId: string | null): void {
  try {
    if (projectId === null) {
      localStorage.removeItem(STORAGE_KEY)
    } else {
      localStorage.setItem(STORAGE_KEY, projectId)
    }
  } catch {
    /* storage disabled — in-memory Redux state still reflects the click */
  }
}

export interface ActiveProjectState {
  projectId: string | null
}

export const SET_ACTIVE_PROJECT = 'app/activeProject/SET'
export const CLEAR_ACTIVE_PROJECT = 'app/activeProject/CLEAR'

interface SetActiveProjectAction {
  type: typeof SET_ACTIVE_PROJECT
  payload: string
  [extraProps: string]: unknown
}

interface ClearActiveProjectAction {
  type: typeof CLEAR_ACTIVE_PROJECT
  [extraProps: string]: unknown
}

export type ActiveProjectAction = SetActiveProjectAction | ClearActiveProjectAction

export function setActiveProject(projectId: string): SetActiveProjectAction {
  writeStored(projectId)
  return { type: SET_ACTIVE_PROJECT, payload: projectId }
}

export function clearActiveProject(): ClearActiveProjectAction {
  writeStored(null)
  return { type: CLEAR_ACTIVE_PROJECT }
}

export const initialState: ActiveProjectState = {
  projectId: readStored()
}

export function selectActiveProjectId(state: {
  activeProject?: ActiveProjectState
}): string | null {
  // Defensive read — test stores and edge cases may not inject this slice.
  return state.activeProject?.projectId ?? null
}

export default function activeProjectReducer(
  state: ActiveProjectState = initialState,
  action: ActiveProjectAction
): ActiveProjectState {
  switch (action.type) {
    case SET_ACTIVE_PROJECT:
      return { projectId: action.payload }
    case CLEAR_ACTIVE_PROJECT:
      return { projectId: null }
    default:
      return state
  }
}
