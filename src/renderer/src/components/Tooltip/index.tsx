import React from 'react'

interface TooltipProps {
  text: string
  ariaLabel: string
}

function Tooltip({ text, ariaLabel }: TooltipProps): React.JSX.Element {
  return (
    <span className="group relative inline-flex">
      <span
       
        aria-label={ariaLabel}
        className="flex h-5 w-5 cursor-default items-center justify-center 
  rounded-full border border-neutral-300 text-xs font-semibold text-white"
      >
        ?
      </span>

      <span
        role="tooltip"
        className="pointer-events-none absolute left-full top-1/2 z-10 
        ml-2 w-64 -translate-y-1/2 rounded border border-app-border 
        bg-[#2b2d33] px-2 py-1 text-[11px] leading-4 text-neutral-200
        opacity-0 group-hover:opacity-100"
      >
        {text}
      </span>
    </span>
  )
}

export default Tooltip
