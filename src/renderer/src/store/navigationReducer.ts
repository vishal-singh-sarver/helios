/*
 * Navigation reducer
 *
 * Manages the active screen without a URL router.
 * Screens are string identifiers — add new ones to the Screen union as needed.
 */

import { STORAGE_KEYS } from 'utils/storageKeys'

export type Screen = 'home' | 'project'

export interface NavigationState {
  screen: Screen
}

export const NAVIGATE = 'app/navigation/NAVIGATE'

interface NavigateAction {
  type: typeof NAVIGATE
  payload: Screen
  // Index signature required by Redux 5's UnknownAction type so dispatch
  // accepts this action without a cast.
  [extraProps: string]: unknown
}

export type NavigationAction = NavigateAction

export function navigate(screen: Screen): NavigateAction {
  return { type: NAVIGATE, payload: screen }
}

// Open directly to the project screen when both ids were persisted on the
// last session — ProjectScreen clears the scenario id on unmount, so the
// pair is only present when the user quit while still on the project view.
// Falls back to home if localStorage is unavailable (e.g. sandbox boot).
function pickInitialScreen(): Screen {
  try {
    const projectId = localStorage.getItem(STORAGE_KEYS.activeProjectId)
    const scenarioId = localStorage.getItem(STORAGE_KEYS.activeScenarioId)
    return projectId && scenarioId ? 'project' : 'home'
  } catch {
    return 'home'
  }
}

export const initialState: NavigationState = {
  screen: pickInitialScreen()
}

export default function navigationReducer(
  state: NavigationState = initialState,
  action: NavigationAction
): NavigationState {
  switch (action.type) {
    case NAVIGATE:
      return { ...state, screen: action.payload }
    default:
      return state
  }
}
