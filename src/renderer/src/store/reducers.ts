import { combineReducers, Reducer, UnknownAction } from 'redux'
<<<<<<< HEAD
import activeProjectReducer from './activeProjectReducer'
import navigationReducer from './navigationReducer'
=======
import navigationReducer, { type NavigationState } from './navigationReducer'
import type { HomePageState } from 'containers/HomePage/reducer'

export interface RootState {
  navigation: NavigationState
  homePage?: HomePageState
}
>>>>>>> develop

function createReducer(
  injectedReducers: Record<string, Reducer> = {}
): Reducer<RootState, UnknownAction> {
  return combineReducers({
    navigation: navigationReducer,
    activeProject: activeProjectReducer,
    ...injectedReducers
  }) as unknown as Reducer<RootState, UnknownAction>
}

export default createReducer
