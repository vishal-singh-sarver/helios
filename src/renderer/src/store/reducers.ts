import { combineReducers, Reducer, UnknownAction } from 'redux'
import activeProjectReducer from './activeProjectReducer'
import navigationReducer from './navigationReducer'

function createReducer(
  injectedReducers: Record<string, Reducer> = {}
): Reducer<unknown, UnknownAction> {
  return combineReducers({
    navigation: navigationReducer,
    activeProject: activeProjectReducer,
    ...injectedReducers
  })
}

export type RootState = ReturnType<ReturnType<typeof createReducer>>

export default createReducer
