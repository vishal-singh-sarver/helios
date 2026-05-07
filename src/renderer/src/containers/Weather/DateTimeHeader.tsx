import chevronDown from '@renderer/assets/ChevronDownIcon.svg'
import React from 'react'

// Two ISO-8601 forms (UTC `Z` suffix and explicit local-offset suffix), then
// the six "general" combined date+time forms. Order mirrors the spec doc the
// product team shared — ISO first, then general formats.
export const DATE_FORMAT_OPTIONS = [
  'YYYY-MM-DDTHH:MM:SSZ',
  'YYYY-MM-DDTHH:MM:SS-HH:MM',
  'YYYYMMDDHH',
  'YYYY-MM-DD HH:MM',
  'DD/MM/YYYY HH:MM',
  'MM/DD/YYYY HH:MM',
  'DD-MM-YYYY HH:MM',
  'MM-DD-YYYY HH:MM'
] as const

export type DateFormat = (typeof DATE_FORMAT_OPTIONS)[number]

interface Props {
  value: DateFormat
  onChange: (format: DateFormat) => void
}

function DateTimeHeader({ value, onChange }: Props): React.JSX.Element {
  const [open, setOpen] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!open) return
    function onDocClick(e: MouseEvent): void {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [open])

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 text-neutral-200 hover:text-white focus:outline-none"
      >
        <span>Date-Time</span>
        <img src={chevronDown} alt="" aria-hidden="true" className="h-2 w-2.5 opacity-80" />
      </button>
      {open && (
        <div
          role="listbox"
          className="scrollbar-custom-thin absolute left-0 top-full z-50 mt-1 max-h-64 w-64 overflow-y-auto rounded-md border border-app-border bg-app-panel py-1 shadow-lg"
        >
          {DATE_FORMAT_OPTIONS.map((opt) => (
            <button
              key={opt}
              type="button"
              role="option"
              aria-selected={opt === value}
              onClick={() => {
                onChange(opt)
                setOpen(false)
              }}
              className={`block w-full px-3 py-2 text-left text-sm hover:bg-neutral-800 ${
                opt === value ? 'bg-neutral-800 text-white' : 'text-neutral-300'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default DateTimeHeader
