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
  const iconEl = (
    <img
      src={icon}
      alt=""
      aria-hidden="true"
      className="h-4 w-4 object-contain [filter:brightness(0)]"
    />
  )

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1.5 rounded-md border border-neutral-200 bg-white px-3 py-1.5 text-xs text-neutral-900 transition-colors hover:bg-neutral-200"
    >
      {iconPosition === 'left' && iconEl}
      {label}
      {iconPosition === 'right' && iconEl}
    </button>
  )
}

export default ToolbarButton
