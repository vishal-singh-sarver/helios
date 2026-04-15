import React from 'react'
import Spinner from './Spinner'

interface LoadingScreenProps {
  label?: string
  fullScreen?: boolean
}

// Reusable loading screen. Use cases:
//   1. Suspense fallback for lazy-loaded containers — pass `fullScreen`.
//   2. In-panel busy state for a section that's waiting on data.
//   3. Generic loading overlay anywhere that doesn't warrant its own design.
//
// Usage:
//   <LoadingScreen />                                   // in-panel, "Loading…"
//   <LoadingScreen fullScreen />                        // route-level fallback
//   <LoadingScreen label="Loading workspace…" fullScreen />
function LoadingScreen({
  label = 'Loading…',
  fullScreen = false
}: LoadingScreenProps): React.JSX.Element {
  const sizing = fullScreen ? 'h-screen w-screen' : 'h-full w-full'

  return (
    <div
      role="status"
      aria-live="polite"
      className={`${sizing} bg-dark text-neutral-200 flex items-center justify-center`}
    >
      <div className="flex flex-col items-center gap-3">
        <Spinner className="h-8 w-8 text-neutral-200" />
        <p className="text-sm text-neutral-400">{label}</p>
      </div>
    </div>
  )
}

export default LoadingScreen
export { LoadingScreen }
