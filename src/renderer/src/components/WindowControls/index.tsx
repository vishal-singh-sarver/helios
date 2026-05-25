import browserControlsImg from '@renderer/assets/Browser Controls.svg'
import macCloseIcon from '@renderer/assets/close.svg'
import macMaximizeIcon from '@renderer/assets/maximize.svg'
import macMinimizeIcon from '@renderer/assets/minimize.svg'
import winCloseIcon from '@renderer/assets/win_close.svg'
import winMaximizeIcon from '@renderer/assets/win_maximize.svg'
import winMinimizeIcon from '@renderer/assets/win_minimize.svg'
import React from 'react'

// Frameless windows have no native min/max/close — the renderer paints them.
// Mac shows traffic lights on the LEFT (with a dummy combined-image fallback
// when not hovered, swapped for separate clickable icons on hover, matching
// Finder's "show controls on hover" feel). Linux/Windows show the same icons
// on the RIGHT, always interactive.

function ControlButton({
  onClick,
  src,
  label,
  sizeClass
}: {
  onClick: () => void
  src: string
  label: string
  sizeClass: string
}): React.JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`app-no-drag flex ${sizeClass} items-center justify-center`}
    >
      <img src={src} alt="" className={sizeClass} />
    </button>
  )
}

function ControlsCluster({ variant }: { variant: 'mac' | 'win' }): React.JSX.Element {
  const icons =
    variant === 'mac'
      ? { close: macCloseIcon, minimize: macMinimizeIcon, maximize: macMaximizeIcon }
      : { close: winCloseIcon, minimize: winMinimizeIcon, maximize: winMaximizeIcon }
  // Mac convention: close-min-max left to right.
  // Win/Linux convention: min-max-close left to right.
  const order: Array<{
    key: 'close' | 'minimize' | 'maximize'
    onClick: () => void
    label: string
  }> =
    variant === 'mac'
      ? [
          { key: 'close', onClick: () => window.api.windowClose(), label: 'Close window' },
          { key: 'minimize', onClick: () => window.api.windowMinimize(), label: 'Minimize window' },
          {
            key: 'maximize',
            onClick: () => window.api.windowToggleMaximize(),
            label: 'Maximize window'
          }
        ]
      : [
          { key: 'minimize', onClick: () => window.api.windowMinimize(), label: 'Minimize window' },
          {
            key: 'maximize',
            onClick: () => window.api.windowToggleMaximize(),
            label: 'Maximize window'
          },
          { key: 'close', onClick: () => window.api.windowClose(), label: 'Close window' }
        ]
  // Mac traffic lights: 12px buttons, 8px gap (= 52px wide), matches the
  // dummy SVG. Win/Linux: 24px buttons, 16px gap (= 104px wide × 24px tall).
  const sizeClass = variant === 'mac' ? 'h-3 w-3' : 'h-5 w-5'
  const gapClass = variant === 'mac' ? 'gap-2' : 'gap-4'
  return (
    <div className={`flex items-center ${gapClass}`}>
      {order.map((btn) => (
        <ControlButton
          key={btn.key}
          onClick={btn.onClick}
          src={icons[btn.key]}
          label={btn.label}
          sizeClass={sizeClass}
        />
      ))}
    </div>
  )
}

interface WindowControlsProps {
  // 'left' = Mac traffic-light position with dummy/hover swap.
  // 'right' = Linux/Windows: always-interactive cluster.
  side: 'left' | 'right'
}

function WindowControls({ side }: WindowControlsProps): React.JSX.Element {
  const [hovered, setHovered] = React.useState(false)

  if (side === 'right') {
    return (
      <div className="app-no-drag flex items-center">
        <ControlsCluster variant="win" />
      </div>
    )
  }

  return (
    <div
      className="app-no-drag relative flex h-3 w-[52px] items-center"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {hovered ? (
        <ControlsCluster variant="mac" />
      ) : (
        <img
          src={browserControlsImg}
          alt=""
          aria-hidden="true"
          className="pointer-events-none h-3 w-[52px]"
        />
      )}
    </div>
  )
}

export default WindowControls
