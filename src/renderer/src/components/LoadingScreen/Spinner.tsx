import React from 'react'

interface SpinnerProps {
  className?: string
}

// Bare animated spinner SVG. Size and colour inherit from Tailwind classes
// passed via `className` (e.g. `h-4 w-4 text-white`). Reusable anywhere a
// busy indicator is needed — inside buttons, next to inline labels, or
// composed into LoadingScreen for full-panel loading states.
function Spinner({ className = 'h-4 w-4 text-white' }: SpinnerProps): React.JSX.Element {
  return (
    <svg
      className={`animate-spin ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      role="img"
      aria-label="Loading"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  )
}

export default Spinner
export { Spinner }
