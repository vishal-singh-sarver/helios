import React from 'react'

interface ExampleButtonProps {
  label: string
  onClick?: () => void
  disabled?: boolean
}

function ExampleButton({
  label,
  onClick = () => {},
  disabled = false
}: ExampleButtonProps): React.JSX.Element {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="px-4 py-2 bg-panel border border-app-border rounded text-neutral-200 hover:bg-app-border disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {label}
    </button>
  )
}

export default ExampleButton
