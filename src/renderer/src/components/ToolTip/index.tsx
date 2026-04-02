import React from 'react'

interface TooltipProps {
  text: string
  isVisible: boolean
  ariaLabel: string
  onHoverChange: (visible: boolean) => void
}

function Tooltip({
  text,
  isVisible,
  ariaLabel,
  onHoverChange
}: TooltipProps): React.JSX.Element {
  return (
    <span className="relative inline-flex">

      {/* The ? trigger — lightweight span */}
      <span
        role="img"
        aria-label={ariaLabel}
        tabIndex={0}                                  
        onMouseEnter={() => onHoverChange(true)}
        onMouseLeave={() => onHoverChange(false)}
        onFocus={() => onHoverChange(true)}
        onBlur={() => onHoverChange(false)}
        className="flex h-5 w-5 cursor-default items-center justify-center 
        rounded-full border border-neutral-300 text-xs font-semibold text-white"
      >
        ?
      </span>

      {/* The floating tooltip box */}
      {isVisible && (
        <span
          role="tooltip"
          className="pointer-events-none absolute left-full top-1/2 z-10 
          ml-2 w-64 -translate-y-1/2 rounded border border-app-border 
          bg-[#2b2d33] px-2 py-1 text-[11px] leading-4 text-neutral-200"
        >
          {text}
        </span>
      )}

    </span>
  )
}

export default Tooltip