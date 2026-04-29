import React from 'react'

interface TimePicker24Props {
  value: string
  onChange: (value: string) => void
}

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'))
const VALID = /^([01]\d|2[0-3]):[0-5]\d$/

function TimePicker24({ value, onChange }: TimePicker24Props): React.JSX.Element {
  const selectedHour = VALID.test(value) ? value.split(':')[0] : ''

  const selectedHourRef = React.useRef<HTMLButtonElement>(null)

  React.useEffect(() => {
    selectedHourRef.current?.scrollIntoView({ block: 'center' })
  }, [])

  const pickHour = (hh: string): void => {
    onChange(`${hh}:00`)
  }

  return (
    <div
      role="dialog"
      aria-label="Time picker"
      className="absolute left-0 top-full z-20 mt-1 overflow-hidden rounded border border-app-border bg-[#1f2126] shadow-lg"
    >
      <ul
        role="listbox"
        aria-label="Hours"
        className="scrollbar-custom-thin h-48 w-16 overflow-y-auto py-1"
      >
        {HOURS.map((hh) => {
          const isSel = hh === selectedHour
          return (
            <li key={hh} role="option" aria-selected={isSel}>
              <button
                ref={isSel ? selectedHourRef : null}
                type="button"
                onClick={() => pickHour(hh)}
                className={`w-full px-3 py-1 text-sm text-neutral-200 hover:bg-neutral-700 ${
                  isSel ? 'bg-blue-600 text-white hover:bg-blue-500' : ''
                }`}
              >
                {hh}
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default TimePicker24
