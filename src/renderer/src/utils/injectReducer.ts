import { Reducer } from 'redux'
import { useStore } from 'react-redux'
import { InjectableStore } from 'store/configureStore'

/**
 * Dynamically injects a reducer into the store.
 * Call at the top of a container component.
 *
 * Usage:
 *   useInjectReducer({ key: 'myFeature', reducer })
 */
export function useInjectReducer({
  key,
  reducer
}: {
  key: string
  reducer: Reducer
}): void {
  const store = useStore() as InjectableStore

  if (
    !Reflect.has(store.injectedReducers, key) ||
    store.injectedReducers[key] !== reducer
  ) {
    store.injectedReducers[key] = reducer
    store.replaceReducer(store.createReducer(store.injectedReducers))
  }
}
