/*
 * Navigation reducer
 *
 * Manages the active screen without a URL router.
 * Screens are string identifiers — add new ones to the Screen union as needed.
 */

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

export const initialState: NavigationState = {
  screen: 'home'
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
