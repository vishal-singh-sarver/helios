import { createStore, Reducer, UnknownAction } from 'redux'
import type { InjectableStore } from 'store/configureStore'

/**
 * Build a minimal InjectableStore for tests that render a container whose
 * body calls `useInjectReducer` / `useInjectSaga`. The returned store is
 * inert: it accepts injection attempts but doesn't actually run sagas.
 *
 * Pass `initialState` when a container reads from a specific slice.
 */
export function createMockStore(
  initialState: Record<string, unknown> = {}
): InjectableStore {
  const store = createStore((state = initialState) => state) as InjectableStore
  store.injectedReducers = {}
  store.injectedSagas = {}
  store.runSaga = () =>
    ({
      cancel: () => {},
      error: () => {},
      result: () => {},
      toPromise: () => Promise.resolve()
    }) as ReturnType<InjectableStore['runSaga']>
  store.createReducer = () => ((state = {}) => state) as Reducer<unknown, UnknownAction>
  return store
}
