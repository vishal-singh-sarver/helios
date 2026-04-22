import React from 'react'
import { Tooltip as ReactTooltip, type PlacesType } from 'react-tooltip'
import 'react-tooltip/dist/react-tooltip.css'

interface TooltipProps {
  text: string
  ariaLabel: string
  place?: PlacesType
}

function Tooltip({ text, ariaLabel, place = 'top' }: TooltipProps): React.JSX.Element {
  const id = React.useId()

  return (
    <>
      <span
<<<<<<< HEAD
        data-tooltip-id={id}
        data-tooltip-content={text}
        tabIndex={0}
=======
>>>>>>> develop
        aria-label={ariaLabel}
        className="flex h-5 w-5 cursor-default items-center justify-center
        rounded-full border border-neutral-300 text-xs font-semibold text-white"
      >
        ?
      </span>

      <ReactTooltip
        id={id}
        place={place}
        border="1px solid #2a2d35"
        style={{
          backgroundColor: '#2b2d33',
          color: '#e5e5e5',
          fontSize: '11px',
          lineHeight: '16px',
          maxWidth: '224px',
          padding: '0',
          borderRadius: '4px',
          zIndex: 30
        }}
      />
    </>
  )
}

export default Tooltip
