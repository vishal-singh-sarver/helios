import { createStore, applyMiddleware, compose, Store, UnknownAction, Reducer } from 'redux'
import createSagaMiddleware, { Task } from 'redux-saga'
import createReducer, { type RootState } from './reducers'

declare global {
  interface Window {
    __REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: typeof compose
  }
}

export interface InjectableStore extends Store<RootState, UnknownAction> {
  injectedReducers: Record<string, Reducer>
  injectedSagas: Record<string, Task>
  runSaga: ReturnType<typeof createSagaMiddleware>['run']
  createReducer: (injected?: Record<string, Reducer>) => Reducer
}

export default function configureStore(initialState?: Partial<RootState>): InjectableStore {
  const sagaMiddleware = createSagaMiddleware()

  const composeEnhancers =
    process.env.NODE_ENV !== 'production' &&
    typeof window === 'object' &&
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
      ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__()
      : compose

  const store = createStore(
    createReducer(),
    initialState as RootState | undefined,
    composeEnhancers(applyMiddleware(sagaMiddleware))
  ) as InjectableStore

  store.injectedReducers = {}
  store.injectedSagas = {}
  store.runSaga = sagaMiddleware.run
  store.createReducer = createReducer

  return store
}
