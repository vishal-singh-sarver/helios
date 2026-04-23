import React from 'react'

interface ToolbarButtonProps {
  label: string
  icon: string
  iconPosition?: 'left' | 'right'
  onClick?: () => void
}

function ToolbarButton({
  label,
  icon,
  iconPosition = 'left',
  onClick
}: ToolbarButtonProps): React.JSX.Element {
  const iconEl = <img src={icon} alt="" aria-hidden="true" className="h-4 w-4 object-contain" />

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1.5 rounded-md border border-app-border bg-neutral-800 px-3 py-1.5 text-xs text-neutral-200 transition-colors hover:bg-neutral-700"
    >
      {iconPosition === 'left' && iconEl}
      {label}
      {iconPosition === 'right' && iconEl}
    </button>
  )
}

export default ToolbarButton
