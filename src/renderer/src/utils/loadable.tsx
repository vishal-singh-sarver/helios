import React, { Suspense, ComponentType, ReactNode } from 'react'

interface LoadableOptions {
  fallback?: ReactNode
}

/**
 * Creates a lazily-loaded component with an optional fallback.
 *
 * Usage:
 *   export default loadable(() => import('./index'))
 *   export default loadable(() => import('./index'), { fallback: <Spinner /> })
 */
export default function loadable<P extends object>(
  importFunc: () => Promise<{ default: ComponentType<P> }>,
  { fallback = null }: LoadableOptions = {}
): ComponentType<P> {
  const LazyComponent = React.lazy(importFunc)

  return function LoadableComponent(props: P): React.JSX.Element {
    return (
      <Suspense fallback={fallback}>
        <LazyComponent {...props} />
      </Suspense>
    )
  }
}
