import chevronIcon from '@renderer/assets/chevron.svg'
import React from 'react'

const MOCK_ROWS: ReadonlyArray<{ id: number; dateTime: string }> = Array.from(
  { length: 25 },
  (_, i) => ({ id: i, dateTime: '02/26/2026 10:00' })
)

function WeatherTable(): React.JSX.Element {
  const [selected, setSelected] = React.useState<Set<number>>(
    () => new Set(MOCK_ROWS.map((r) => r.id))
  )

  const allSelected = selected.size === MOCK_ROWS.length

  const toggleAll = (): void => {
    setSelected(allSelected ? new Set() : new Set(MOCK_ROWS.map((r) => r.id)))
  }

  const toggleRow = (id: number): void => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="scrollbar-custom flex-1 overflow-auto bg-dark">
      <table className="w-full border-collapse text-sm text-neutral-200">
        <thead className="bg-neutral-900">
          <tr className="border-b border-app-border">
            <th className="w-12 px-3 py-2 text-left">
              <input
                type="checkbox"
                aria-label="Select all rows"
                checked={allSelected}
                onChange={toggleAll}
                className="h-4 w-4 accent-blue-600"
              />
            </th>
            <th className="px-3 py-2 text-left font-normal text-neutral-300">
              <span className="inline-flex items-center gap-1">
                Date-Time
                <img src={chevronIcon} alt="" aria-hidden="true" className="h-3 w-3" />
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          {MOCK_ROWS.map((row) => (
            <tr key={row.id} className="border-b border-app-border">
              <td className="w-12 px-3 py-2">
                <input
                  type="checkbox"
                  aria-label={`Select row ${row.id + 1}`}
                  checked={selected.has(row.id)}
                  onChange={() => toggleRow(row.id)}
                  className="h-4 w-4 accent-blue-600"
                />
              </td>
              <td className="px-3 py-2">{row.dateTime}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default WeatherTable
