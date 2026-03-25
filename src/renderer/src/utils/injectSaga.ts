import { useStore } from 'react-redux'
import { Saga } from 'redux-saga'
import { InjectableStore } from 'store/configureStore'

/**
 * Dynamically injects and starts a saga on the store.
 * Each saga runs once per key — safe to call on every render.
 *
 * Usage:
 *   useInjectSaga({ key: 'myFeature', saga })
 */
export function useInjectSaga({ key, saga }: { key: string; saga: Saga }): void {
  const store = useStore() as InjectableStore

  if (!Reflect.has(store.injectedSagas, key)) {
    store.injectedSagas[key] = store.runSaga(saga)
  }
}
