import React from 'react'
import closeIconSrc from '@renderer/assets/CloseIcon.svg'
import checkIconSrc from '@renderer/assets/CheckIcon.svg'
import chevronLeftIconSrc from '@renderer/assets/ChevronLeftIcon.svg'
import chevronDownIconSrc from '@renderer/assets/ChevronDownIcon.svg'
import checkCircleIconSrc from '@renderer/assets/CheckCircleIcon.svg'

type IconProps = React.ImgHTMLAttributes<HTMLImageElement>

// Five icons load from /assets as <img> so the SVG files are the source of
// truth and a designer can swap them without touching code. AlertTriangleIcon
// stays inline because no asset has been provided yet.

export const CloseIcon = (p: IconProps): React.JSX.Element => (
  <img src={closeIconSrc} alt="" {...p} />
)

export const CheckIcon = (p: IconProps): React.JSX.Element => (
  <img src={checkIconSrc} alt="" {...p} />
)

export const ChevronLeftIcon = (p: IconProps): React.JSX.Element => (
  <img src={chevronLeftIconSrc} alt="" {...p} />
)

export const ChevronDownIcon = (p: IconProps): React.JSX.Element => (
  <img src={chevronDownIconSrc} alt="" {...p} />
)

export const CheckCircleIcon = (p: IconProps): React.JSX.Element => (
  <img src={checkCircleIconSrc} alt="" {...p} />
)

// ── Inline (no asset yet) ─────────────────────────────────────────────────────

type SvgProps = React.SVGProps<SVGSVGElement>

const baseProps = {
  fill: 'none',
  stroke: 'currentColor',
  strokeLinecap: 'round',
  strokeLinejoin: 'round'
} as const

export const AlertTriangleIcon = (p: SvgProps): React.JSX.Element => (
  <svg {...baseProps} {...p} viewBox="0 0 24 24" strokeWidth="2">
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
)

export const InfoIcon = (p: SvgProps): React.JSX.Element => (
  <svg {...baseProps} {...p} viewBox="0 0 24 24" strokeWidth="2">
    <circle cx="12" cy="12" r="9" />
    <line x1="12" y1="10" x2="12" y2="16" />
    <line x1="12" y1="7" x2="12.01" y2="7" />
  </svg>
)
