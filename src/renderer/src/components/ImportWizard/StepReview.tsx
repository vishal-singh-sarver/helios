import React, { useMemo } from 'react'
import type { StepReviewProps } from './types'

function fmtBritish(d: Date | null): string {
  if (!d) return 'Invalid'
  return d.toLocaleString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export default function StepReview({
  parsed,
  parsedDateTimes,
  dtColumns,
  columnSelection,
  disabledColumnIndices,
  onToggleColumn
}: StepReviewProps): React.JSX.Element {
  const dtSet = useMemo(() => new Set(dtColumns), [dtColumns])
  const disabledSet = useMemo(() => new Set(disabledColumnIndices), [disabledColumnIndices])

  const dtPreview = parsedDateTimes
    .slice(0, 3)
    .map((d) => fmtBritish(d))
    .join(', ')

  return (
    <div className="flex flex-col gap-4 overflow-hidden px-6 pb-2">
      <div className="text-sm text-neutral-300">
        Review columns to import. Uncheck columns you want to exclude.
      </div>

      <div
        className="flex-1 overflow-auto rounded border border-app-border scrollbar-custom"
        style={{ maxHeight: 320 }}
      >
        <table className="w-full text-sm">
          <tbody>
            {/* Synthetic Date-Time row — always included, cannot be excluded */}
            <tr className="border-b border-app-border bg-app-panel/40">
              <td className="w-12 px-4 py-3">
                <input
                  type="checkbox"
                  checked
                  disabled
                  readOnly
                  className="h-4 w-4 cursor-not-allowed opacity-60"
                  title="Date-Time is required and cannot be excluded"
                />
              </td>
              <td className="px-2 py-3 font-medium text-neutral-100">
                Date-Time
                <span className="ml-2 text-xs font-normal text-neutral-500">(required)</span>
              </td>
              <td className="px-4 py-3 text-neutral-400">{dtPreview}</td>
            </tr>

            {parsed.headers.map((h, i) => {
              if (dtSet.has(h)) return null
              const disabled = disabledSet.has(i)
              const checked = !disabled && columnSelection[i] !== false
              const examples = parsed.rows
                .slice(0, 3)
                .map((r) => r[i])
                .join(', ')
              return (
                <tr key={i} className="border-b border-app-border last:border-0">
                  <td className="w-12 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={disabled}
                      onChange={() => onToggleColumn(i)}
                      className={`h-4 w-4 ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                    />
                  </td>
                  <td className="px-2 py-3 text-neutral-100">
                    <span className="mr-2 text-neutral-500">{i + 1}:</span>
                    {h}
                    {disabled && <span className="ml-2 text-xs text-amber-300">(disabled)</span>}
                  </td>
                  <td className="px-4 py-3 text-neutral-400">{examples}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="text-xs text-white">
        Date/Time column(s) will be merged into the “Date-Time” column automatically.
      </div>

      {disabledColumnIndices.length > 0 && (
        <div className="text-xs text-white">
          Character based columns have been disabled as that input is not supported.
        </div>
      )}
    </div>
  )
}
