import type { HomePageState } from 'containers/HomePage/reducer'
import { combineReducers, Reducer, UnknownAction } from 'redux'
// import activeProjectReducer from './activeProjectReducer'
import navigationReducer, { type NavigationState } from './navigationReducer'

export interface RootState {
  navigation: NavigationState
  homePage?: HomePageState
}

function createReducer(
  injectedReducers: Record<string, Reducer> = {}
): Reducer<RootState, UnknownAction> {
  return combineReducers({
    navigation: navigationReducer,
    ...injectedReducers
  }) as unknown as Reducer<RootState, UnknownAction>
}

export default createReducer
