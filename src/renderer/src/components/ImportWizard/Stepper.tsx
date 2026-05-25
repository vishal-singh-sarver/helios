import React from 'react'
import { CheckIcon } from './Icons'
import type { StepperProps } from './types'

// Two-line labels (\n is rendered as a real break via whitespace-pre-line),
// matching the Figma design.
const STEPS = [
  { key: 'file', label: 'File\nPreview' },
  { key: 'data', label: 'Data\nPreview' },
  { key: 'datetime', label: 'Date/\nTime' },
  { key: 'review', label: 'Review &\nImport' }
] as const

export default function Stepper({ currentIndex }: StepperProps): React.JSX.Element {
  return (
    <div className="px-2 pt-1 pb-3">
      <div className="flex items-start">
        {STEPS.map((s, i) => {
          const done = i < currentIndex
          const active = i === currentIndex
          return (
            <React.Fragment key={s.key}>
              <div className="flex flex-col items-center" style={{ minWidth: 96 }}>
                {done ? (
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#245AC5] text-white transition-all">
                    <CheckIcon className="h-3.5 w-3.5" />
                  </div>
                ) : active ? (
                  // Bullseye: thin outer blue (28→26) · minimal white (26→22) ·
                  // thick inner blue (22→6) · small white center (6).
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#245AC5] transition-all">
                    <div className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-white">
                      <div className="flex h-[22px] w-[22px] items-center justify-center rounded-full bg-[#245AC5]">
                        <div className="h-1.5 w-1.5 rounded-full bg-white" />
                      </div>
                    </div>
                  </div>
                ) : (
                  // Inactive: white circle with a small grey dot inside
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white transition-all">
                    <div className="h-2.5 w-2.5 rounded-full bg-neutral-400" />
                  </div>
                )}
                <div
                  className={[
                    'mt-2 whitespace-pre-line text-center text-xs leading-tight',
                    active
                      ? 'font-semibold text-white'
                      : done
                        ? 'text-neutral-300'
                        : 'text-neutral-500'
                  ].join(' ')}
                >
                  {s.label}
                </div>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className="mx-1 mt-3.5 h-px flex-1"
                  // Line is blue when between done steps OR emanating from the
                  // active step — gives forward-progress feel matching the mock.
                  style={{ background: i <= currentIndex ? '#245AC5' : '#2a2d3a' }}
                />
              )}
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}

export { STEPS }
