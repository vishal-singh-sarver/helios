import { combineReducers, Reducer, UnknownAction } from 'redux'
import navigationReducer from './navigationReducer'

function createReducer(
  injectedReducers: Record<string, Reducer> = {}
): Reducer<unknown, UnknownAction> {
  return combineReducers({
    navigation: navigationReducer,
    ...injectedReducers
  })
}

export type RootState = ReturnType<ReturnType<typeof createReducer>>

export default createReducer
